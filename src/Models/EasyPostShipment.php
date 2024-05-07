<?php

namespace Dispatch\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EasyPostShipment extends Model
{
    use HasFactory;

    public function getTable(): string
    {
        return 'easypost_shipments';
    }

    protected $fillable = [
        'easypost_shipment_id',
        'postage_label_url',
        'tracking_details',
        'tracking_code',
    ];

    protected $casts = ['tracking_details' => 'array'];
}
