<?php

namespace Dispatch\Services;

use EasyPost\EasyPostClient;

class EasyPost
{
    protected $client;

    public function __construct()
    {
        $this->client = new EasyPostClient(config('services.easypost.api_key'));
    }

    public function addressCreate(array $address): mixed
    {
        return $this->client->address->create($address);
    }

    public function rateRetrieve(string $rateId): mixed
    {
        return $this->client->rate->retrieve($rateId);
    }

    // public function batchShipmentCreate(array $data)
    // {
    //     $batch = $this->client->batch->create([
    //         'reference' => 'batch_shipment',
    //     ]);

    //     return $batch;
    // }

    public function orderBuy(string $orderId, string $rateId): mixed
    {
        $rate = $this->rateRetrieve($rateId);

        return $this->client->order->buy($orderId, $rate);
    }

    public function shipmentBuy(string $shipmentId, string $rateId, ?bool $insurance = null): mixed
    {
        $rate = $this->rateRetrieve($rateId);

        return $this->client->shipment->buy($shipmentId, [
            'rate' => $rate,
            'insurance' => $insurance,
        ]);
    }

    public function trackerCreate(string $trackingCode, ?string $carrier = null): mixed
    {
        return $this->client->tracker->create(array_merge([
            'tracking_code' => $trackingCode
        ], $carrier == null ? [] : [
            'carrier' => $carrier
        ]));
    }

    public function shipmentRetrieve(string $shipmentId): mixed
    {
        return $this->client->shipment->retrieve($shipmentId);
    }

    public function shipmentCreate(
        array $fromAddress,
        array $toAddress,
        array $parcel,
        ?array $carrierAccounts = null,
        ?string $service = null,
        ?array $options = null
    ): mixed {
        return $this->client->shipment->create(array_merge(
            [
                'from_address' => $fromAddress,
                'to_address' => $toAddress,
                'parcel' => $parcel,
            ],
            $carrierAccounts == null ? [] : [
                'carrier_accounts' => $carrierAccounts,
            ],
            $service == null ? [] : [
                'service' => $service,
            ],
            $options == null ? [] : [
                'options' => $options,
            ],
        ));
    }

    public function retrieveCarrierMetadata(?array $carriers = []): array
    {
        $carrierMetadata = $this->client->carrierMetadata->retrieve($carriers);

        return $carrierMetadata;
    }
}
