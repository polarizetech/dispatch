<?php

namespace Dispatch\Validators;

use Illuminate\Support\Facades\Validator;

class DispatchAddressValidator extends Validator
{
    public static function make(array $data): \Illuminate\Validation\Validator
    {
        return ShippingAddressValidator::make($data, [
            'phone' => 'required|string|max:255', // Required for creating shipping labels with EasyPost
        ]);
    }
}
