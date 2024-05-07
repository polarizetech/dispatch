<?php

namespace Dispatch\Http\Controllers;

use App\Enums\OrderStatusEnum;
use App\Models\Order;
use App\Models\OrderProduct;
use Dispatch\Actions\AssignShippingProfile;
use Dispatch\Actions\CalculateShippingOptionRates;
use Dispatch\Actions\CreateShipment;
use Dispatch\Actions\UpdateShippingProfile;
use Dispatch\Validators\ParcelDimensionsValidator;
use Dispatch\Validators\ShippingProfileValidator;
use Dispatch\Models\ShippingProfile;
use Dispatch\Models\ShippingOption;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Validator;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Routing\Controller;

class ShippingProfileController extends Controller
{
    use AuthorizesRequests, ValidatesRequests;

    public function index(Request $request)
    {
        $shop = $request->user()->currentTeam->shop;
        $shippingProfiles = $shop->sharedShippingProfiles()->paginate(10);

        return inertia_render('Dashboard/ShippingProfiles/Index', [
            'shippingProfiles' => $shippingProfiles,
        ]);
    }

    public function create()
    {
        return inertia_render('Dashboard/ShippingProfiles/Create', []);
    }

    public function edit(Request $request, ShippingProfile $shippingProfile)
    {
        Gate::allowIf($request->user()->currentTeam->shop->id === $shippingProfile->shop_id);

        $shippingOptions = ShippingOption::whereNull('shop_id')->get();

        $shippingOptionsByCarrier = $shippingOptions
            ->groupBy('carrier')
            ->map(fn ($options, string $carrier) => [
                ...(config('dispatch.easypost_shipping_carriers')[$carrier] ?? []),
                'options' => $options,
            ])
            ->filter(fn (array $carrier) =>
                in_array($shippingProfile->easyPostDispatchAddress()['country'], $carrier['supported_origins'])
            )
            ->values();

        return inertia_render('Dashboard/ShippingProfiles/Edit', [
            'shippingProfile' => $shippingProfile->load(
                'dispatchAddress',
                'automaticShippingOptions.rate',
                'customShippingOptions.rate',
                'availableShippingOptions.rate',
            ),
            'shippingOptions' => $shippingOptions,
            'shippingOptionsByCarrier' => $shippingOptionsByCarrier,
            'dispatchOptions' => ShippingProfile::DISPATCH_OPTIONS,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate(['name' => 'required|string|max:255']);
        $shop = $request->user()->currentTeam->shop;

        $shippingProfile = $shop->shippingProfiles()->create([
            ...$data,
            'is_shared' => true,
            'custom_rates' => false,
        ]);

        session()->flash('flash.banner', __('Shipping Profile created'));

        return to_route('dashboard.shipping-profiles.edit', $shippingProfile);
    }

    public function update(Request $request, ShippingProfile $shippingProfile)
    {
        $shop = $request->user()->currentTeam->shop;

        Gate::allowIf($shop->id === $shippingProfile->shop_id);

        $data = ShippingProfileValidator::make($request->all())->validateWithBag('shippingProfileData');

        ParcelDimensionsValidator::make($data)->validate();

        UpdateShippingProfile::run($shippingProfile, $request->all());

        $optionsData = Validator::make(
            data: $request->all(),
            rules: [
                'name' => 'required|string|max:255',
                'custom_rates' => 'boolean',

                'custom_shipping_option_data' => 'required_if:custom_rates,true|array',
                'custom_shipping_option_data.*.id' => 'nullable|exists:shipping_options,id',
                'custom_shipping_option_data.*.name' => 'required|string',
                'custom_shipping_option_data.*.rate_amount' => 'required|numeric',
                'custom_shipping_option_data.*.rate_delivery_days' => 'required|numeric',

                'automatic_shipping_option_ids' => 'required_if:custom_rates,false|array',
                'automatic_shipping_option_ids.*' => 'required|exists:shipping_options,id',
            ],
            attributes: [
                'custom_shipping_option_data.*.name' => 'option name',
                'custom_shipping_option_data.*.rate_amount' => 'option rate',
                'custom_shipping_option_data.*.rate_delivery_days' => 'option rate',
            ]
        )->validate();

        if ($request->custom_rates === true) {
            collect($optionsData['custom_shipping_option_data'])->each(function ($option) use ($shop, $shippingProfile) {

                if ($option['id'] ?? null) {
                    $shippingOption = $shippingProfile
                        ->customShippingOptions()
                        ->find($option['id']);

                    $shippingOption
                        ->update(['name' => $option['name']]);
                } else {
                    $shippingProfile->shippingOptions()->attach(
                        $shippingOption = ShippingOption::create([
                            'name' => $option['name'],
                            'shop_id' => $shippingProfile->shop_id
                        ])
                    );
                }

                $shippingOption->rate()->updateOrCreate([], [
                    'amount' => cents($option['rate_amount']),
                    'currency' => $shop->currency,
                    'delivery_days' => $option['rate_delivery_days'] ?: null,
                ]);

            });

            // Delete any removed shipping options
            $shippingProfile
                ->shippingOptions()
                ->whereNotIn('shipping_options.id', collect($optionsData['custom_shipping_option_data'])->pluck('id'))
                ->delete();

        } elseif ($request->custom_rates === false) {
            $shippingProfile->shippingOptions()->sync($optionsData['automatic_shipping_option_ids']);
        }

        session()->flash('flash.banner', __('Shipping Profile updated'));

        return redirect()->back();
    }

    public function destroy(Request $request, ShippingProfile $shippingProfile)
    {
        Gate::allowIf($request->user()->currentTeam->shop->id === $shippingProfile->shop_id);

        $shippingProfile->delete();

        session()->flash('flash.banner', __('Shipping Profile deleted'));

        return to_route('dashboard.shipping-profiles.index');
    }

    public function calculate(Request $request, ShippingProfile $shippingProfile)
    {
        $user = $request->user();
        $shop = $user->currentTeam->shop;

        Validator::make($request->all(), [
            'postal_code' => 'required|string|max:140',
            'country' => 'nullable|string|in:'.collect(config('dispatch.supported_shipping_countries'))->keys()->implode(','),
        ])->validate();

        $toAddress = [
            'email' => $user->email,
            'name' => __('Test Customer'),
            'country' => $request->country,
            'zip' => $request->postal_code,
        ];

        CalculateShippingOptionRates::run($shippingProfile, $toAddress, $shop->currency);

        return redirect()->back();
    }

    public function assign(Request $request, OrderProduct $shippable)
    {
        $order = $shippable->order;
        $shop = $order->shop;

        Gate::allowIf($request->user()->currentTeam->id === $shop->team_id);

        AssignShippingProfile::run(
            shipper: $shop,
            shippable: $shippable,
            data: $request->shipping_profile_data ?: []
        );

        $request->validate(['shipping_option_id' => 'sometimes|required|integer|exists:shipping_options,id']);
        $shippable->shippingOption()->disassociate();
        $shippable->shippingOption()->associate($request->shipping_option_id)->save();

        $toAddress = $order->cart->shippingAddress->only(explode('|', 'street1|street2|city|state|zip|country'));
        $shippingProfile = $shippable->shippingProfile ?: $shippable->product->shippingProfile;

        CalculateShippingOptionRates::run($shippingProfile, $toAddress, $shop->currency);

        session()->flash('flash.banner', __('Order shipping details updated'));

        return redirect()->route('dashboard.orders.show', $shippable->order);
    }

    public function buyShippingLabels(Request $request, Order $order)
    {
        $team = $request->user()->currentTeam;

        Gate::allowIf($team->id === $order->shop->team_id);

        $toAddress = $order->cart->easyPostToAddress();

        // Recreate shipments in case they need to be updated
        $shippingLabels = $order
            ->orderProducts()
            ->with('shippingProfile', 'shippingOption')
            ->whereShippable()
            ->get()
            ->map(function ($orderProduct) use ($order, $toAddress) {
                $shippingProfile = $orderProduct->shippingProfile ?: $orderProduct->product->shippingProfile;

                for ($i = 0; $i < $orderProduct->quantity; $i++) {
                    $shipment = CreateShipment::run(
                        service: $orderProduct->shippingOption->name, // Setting the service automatically buys the label
                        toAddress: $toAddress,
                        fromAddress: $shippingProfile->easyPostDispatchAddress(),
                        parcel: $shippingProfile->easyPostParcel(),
                        carrierAccounts: [$orderProduct->shippingOption->carrierId],
                        options: ['currency' => $order->currency],
                    );

                    // Update the orderProducts with label and tracking info
                    $orderProduct->shipments()->create([
                        'easypost_shipment_id' => $shipment->id,
                        'postage_label_url' => $shipment->postage_label->label_url,
                        'tracking_code' => $shipment->tracker->tracking_code,
                    ]);
                }

                return $shipment;
            });

        if ($shippingLabels->whereNull()->isEmpty()) {

            $order->update(['status' => OrderStatusEnum::Ready_To_Ship->value]);

            prompt(__('Shipping labels purchased for :count packages', [
                'count' => $shippingLabels->whereNotNull()->count()
            ]));

        } else {
            prompt(__('Oops! There was a problem purchasing some of your shipping labels, please try again.'), 'danger');
        }

        $team->billing->charge(
            $shippingLabels->sum('rate_int'),
            $team->billing->defaultPaymentMethod()->id,
            [
                'currency' => $order->shop->currency,
                'description' => "Shipping for order {$order->id}",
            ]
        );

        return redirect()->back();
    }
}
