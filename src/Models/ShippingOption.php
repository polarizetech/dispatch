<?php

namespace Dispatch\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

class ShippingOption extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'carrier'];

    protected $appends = ['name_formatted'];

    public function carrierId(): Attribute
    {
        return new Attribute(
            get: fn (): ?string => $this->carrier
                ? config('dispatch.easypost_shipping_carriers')[$this->carrier]['id']
                : null,
        );
    }

    public function scopeWhereAutomatic($query)
    {
        return $query->whereNotNull('carrier');
    }

    public function scopeWhereOriginSupported($query, string $country)
    {
        $supportedCarriers = collect(config('dispatch.easypost_shipping_carriers'))
            ->filter(fn ($carrier) => in_array($country, $carrier['supported_origins']))
            ->keys()
            ->toArray();

        return $query->whereIn('carrier', $supportedCarriers);
    }

    public function nameFormatted(): Attribute
    {
        return new Attribute(
            get: fn (): string => str($this->name)->replace('_', ' ')->toString(),
        );
    }

    public function rate(): HasOne
    {
        return $this->hasOne(ShippingOptionRate::class)
            ->latest('created_at'); // Get the latest rate (when running multiple calculations)
    }
}
