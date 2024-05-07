<?php

namespace Dispatch\Actions;

use Dispatch\Models\ShippingProfile;
use Dispatch\Validators\DispatchAddressValidator;
use Lorisleiva\Actions\Concerns\AsAction;

class UpdateShippingProfile
{
    use AsAction;

    public function handle(ShippingProfile $shippingProfile, array $data)
    {
        // Save the shipping profile
        $shippingProfile->update([
          ...$data,

          // Convert dollars to cents
          'handling_fee' => ($data['handling_fee'] ?? null) !== null
              ? cents($data['handling_fee'])
              : null,
        ]);

        // Then validate and save the address
        // (in case the address validation fails, then we still have the rest of the data)
        if (array_key_exists('dispatch_address_data', $data)) {
            if ($data['dispatch_address_data'] === null) {
                $shippingProfile->dispatchAddress()->delete();
                return;
            }

            $dispatchAddressData = DispatchAddressValidator::make($data['dispatch_address_data'])->validate();
            $dispatchAddress = $shippingProfile->dispatchAddress()->updateOrCreate([], $dispatchAddressData);
            if ($dispatchAddress->wasRecentlyCreated) {
                $shippingProfile->dispatchAddress()->associate($dispatchAddress)->save();
            }
        }
    }
}
