<?php

namespace Dispatch\Actions;

use Dispatch\Validators\ParcelDimensionsValidator;
use Dispatch\Validators\ShippingProfileValidator;
use Lorisleiva\Actions\Concerns\AsAction;

class AssignShippingProfile
{
    use AsAction;

    public function handle(mixed $shipper, mixed $shippable, array $data)
    {
        $data = ShippingProfileValidator::make($data)->validateWithBag('shippingProfileData');

        ParcelDimensionsValidator::make($data)->validate();

        $shippingProfile = $shipper
            ->shippingProfiles()
            ->find($data['id'] ?? null);

        if (! $shippingProfile) {
            $shippingProfile = $shipper->shippingProfiles()->create([
                ...$data,
                'is_shared' => false,
                'custom_rates' => false,
            ]);
        }

        // Associate the shipping profile with current model (replace current association if any)
        $shippable->shippingProfile()->disassociate();
        $shippable->shippingProfile()->associate($shippingProfile)->save();

        // Then handle validating and updating the shipping profile
        UpdateShippingProfile::run($shippingProfile, $data);
    }
}
