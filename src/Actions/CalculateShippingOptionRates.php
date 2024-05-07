<?php

namespace Dispatch\Actions;

use Dispatch\Actions\CreateShipment;
use Dispatch\Models\ShippingOption;
use Dispatch\Models\ShippingProfile;
use Illuminate\Support\Collection;
use Lorisleiva\Actions\Concerns\AsAction;

class CalculateShippingOptionRates
{
    use AsAction;

    public function handle(ShippingProfile $shippingProfile, array $toAddress, string $currency): Collection
    {
        $shipment = CreateShipment::run(
            toAddress: $toAddress,
            fromAddress: $shippingProfile->easyPostDispatchAddress(),
            parcel: $shippingProfile->easyPostParcel(),
            carrierAccounts: $shippingProfile->easyPostCarrierIds(),
            options: ['currency' => $currency],
        );

        $rates = collect($shipment->rates)->map(fn ($rate) => [
            strtolower("{$rate->service}-{$rate->carrier}") => $rate
        ])->collapse();

        return $shippingProfile
            ->automaticShippingOptions()
            ->get()
            ->map(function (ShippingOption $option) use ($shipment, $rates) {

                $rate = $rates[strtolower("{$option->name}-{$option->carrier}")] ?? null;

                if (! $rate) {
                    return null;
                }

                $option->rate()->updateOrCreate([
                    'easypost_shipment_id' => $shipment->id
                ], [
                    'amount' => cents($rate->rate),
                    'currency' => $rate->currency,
                    'delivery_days' => $rate->delivery_days,
                    'easypost_rate_id' => $rate->id,
                ]);

                return $rate;
            })
            ->whereNotNull();
    }
}
