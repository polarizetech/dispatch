<?php

namespace Dispatch\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ShippingOptionRate extends Model
{
    use HasFactory;

    protected $fillable = [
        'shipping_option_id',
        'amount',
        'currency',
        'delivery_days',
        'easypost_shipment_id',
        'easypost_rate_id',
    ];

    protected $appends = ['amount_decimal'];

    protected function amountDecimal(): Attribute
    {
        return new Attribute(
            get: fn (): ?float => dollars($this->amount)
        );
    }

    public function shippingOption(): BelongsTo
    {
        return $this->belongsTo(ShippingOption::class);
    }
}
