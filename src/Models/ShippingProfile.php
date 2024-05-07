<?php

namespace Dispatch\Models;

use Dispatch\Support\Length;
use Dispatch\Support\Weight;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ShippingProfile extends Model
{
    use HasFactory;

    const DISPATCH_OPTIONS = ['1-3', '4-6', '7-10', '11+'];

    protected $fillable = [
        'name',
        'weight',
        'weight_unit',
        'width',
        'height',
        'length',
        'length_unit',
        'delivers_to',
        'dispatch_period',
        'free_shipping_international',
        'free_shipping_domestic',
        'handling_fee',
        'is_shared',
        'custom_rates',
        'dispatch_address_id',
    ];

    protected $casts = [
        'free_shipping_international' => 'boolean',
        'free_shipping_domestic' => 'boolean',
        'delivers_to' => 'array',
        'weight' => 'float',
        'width' => 'float',
        'height' => 'float',
        'length' => 'float',
        'custom_rates' => 'boolean',
        'handling_fee' => 'integer',
        'is_shared' => 'boolean',
    ];

    protected $appends = ['dispatch_period_name', 'handling_fee_decimal'];

    public static function booted(): void
    {
        static::created(function (ShippingProfile $profile) {
            // Assign all automatic shipping options to the new profile
            $profile->shippingOptions()->sync(
                ShippingOption::whereAutomatic()->pluck('id')
            );
        });
    }

    public function dispatchPeriodName(): Attribute
    {
        return new Attribute(
            get: fn (): string => ($dispatches = static::DISPATCH_OPTIONS[$this->dispatch_period] ?? null)
                ? __('Ready to ship')
                : __('Made to Order: Dispatches in :dispatches days', compact('dispatches'))
        );
    }

    public function handlingFeeDecimal(): Attribute
    {
        return new Attribute(
            get: fn (): float => dollars($this->handling_fee)
        );
    }

    public function dispatchAddress(): BelongsTo
    {
        return $this->belongsTo(ShippingAddress::class, 'dispatch_address_id');
    }

    public function easyPostCarrierIds(): array
    {
        return $this
            ->shippingOptions()
            ->get()
            ->map(fn ($op) => $op->carrierId)
            ->toArray();
    }

    /**
     * Format address for EasyPost shipment API "from_address"
     */
    public function easyPostDispatchAddress(): array
    {
        $easyPostAddressAttributes = explode('|', 'street1|street2|city|state|zip|country|phone');
        $shipper = $this->shipper()->first();
        $shipsFromAddress = $this->dispatchAddress ?: $shipper->dispatchAddress;

        return (
            collect([
                'email' => $shipper->team->owner->email,
                'name' => $shipper->name
            ])
                ->merge($shipsFromAddress->only($easyPostAddressAttributes))
                ->toArray()
        );
    }

    public function easyPostParcel(): array
    {
        $parcel = collect();

        $parcel->put('weight', Weight::from($this->weight, $this->weight_unit)->toOz());

        if ($this->length) {
            $parcel = $parcel->merge([
                'length' => Length::from($this->length, $this->length_unit)->toIn(),
                'width' => Length::from($this->width, $this->length_unit)->toIn(),
                'height' => Length::from($this->height, $this->length_unit)->toIn(),
            ]);
        }

        return $parcel->toArray();
    }

    public static function translateShippingOptionName(
        int|null $dispatchPeriod,
        string $carrier,
        string $service,
        int|float $price,
        string $currency,
        int|null $deliveryDays
    ): string
    {
        $format = 'l, F jS';
        $carrier = config('dispatch.easypost_shipping_carriers')[$carrier]['name'];
        $price = money(cents($price), $currency);
        $dateStr = "";

        $date = now();

        // Add estimated delivery time
        if (is_int($deliveryDays)) {
            $date = $date->addDays($deliveryDays);
        }

        // Add estimated dispatch time
        if ($dispatchPeriod === null) { // Ready to ship
            $dateStr = $date->format($format);
        } elseif ($dispatchPeriod === 3) { // 11+ days
            $dateStr = $date->addDays(11)->format('after '.$format);
        } else {
            $addDayRange = str(static::DISPATCH_OPTIONS[$dispatchPeriod])->split('-')->toArray();
            list($minDays, $maxDays) = $addDayRange;
            $minDate = (clone $date)->addDays($minDays)->format($format);
            $maxDate = (clone $date)->addDays($maxDays)->format($format);

            $dateStr = __('between :min and :max', compact('minDate', 'maxDate'));
        }

        $estimationType = $deliveryDays !== null
            ? __('Arrives')
            : __('Dispatches');

        return __(
            ':carrier :service :price - :estimationType :dateStr',
            compact('carrier', 'service', 'price', 'estimationType', 'dateStr')
        );
    }

    public function shippingOptions(): BelongsToMany
    {
        return $this->belongsToMany(ShippingOption::class, 'shipping_profile_shipping_option');
    }

    public function availableShippingOptions(): BelongsToMany
    {
        $country = ($this->dispatchAddress ?: $this->shipper()->first()->dispatchAddress)->country;

        return $this
            ->belongsToMany(ShippingOption::class, 'shipping_profile_shipping_option')
            ->whereOriginSupported($country)
            ->whereHas('rate');
    }

    public function automaticShippingOptions(): BelongsToMany
    {
        return $this->shippingOptions()->whereNotNull('carrier');
    }

    public function customShippingOptions(): BelongsToMany
    {
        return $this->shippingOptions()->whereNull('carrier');
    }
}
