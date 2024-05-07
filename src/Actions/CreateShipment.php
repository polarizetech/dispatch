<?php

namespace Dispatch\Actions;

use Dispatch\Services\EasyPost;
use EasyPost\Shipment;

/**
 * Create a shipment using configured shipping service
 */
class CreateShipment
{
    public static function run(
        array $fromAddress,
        array $toAddress,
        array $parcel,
        ?array $carrierAccounts = null,
        ?string $service = null,
        ?array $options = null
    ): Shipment
    {
        return (new EasyPost)->shipmentCreate(
            $fromAddress,
            $toAddress,
            $parcel,
            $carrierAccounts,
            $service,
            $options
        );
    }
}
