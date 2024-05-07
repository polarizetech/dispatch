<?php

namespace Dispatch\Validators;

use App\Models\ShippingProfile;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class ShippingProfileValidator extends Validator
{
    public static function make(array $data): \Illuminate\Validation\Validator
    {
        return parent::make($data, static::rules());
    }

    protected static function rules(): array
    {
        return [
            'id' => 'nullable|integer|exists:shipping_profiles,id',

            'weight' => 'required|numeric|min:0.1',
            'weight_unit' => 'nullable|required_with:weight|in:'.collect(config('dispatch.supported_weight_units'))->join(','),

            'height' => 'nullable|required_with:length,width|numeric|min:0.1',
            'width' => 'nullable|required_with:length,height|numeric|min:0.1',
            'length' => 'nullable|required_with:width,height|numeric|min:0.1',
            'length_unit' => 'nullable|required_with:height,width,length|in:'.collect(config('dispatch.supported_length_units'))->join(','),

            'dispatch_period' => ['nullable', 'numeric', Rule::in(array_keys(ShippingProfile::DISPATCH_OPTIONS))],

            'handling_fee' => 'nullable|numeric|min:0',

            'free_shipping_domestic' => 'nullable|boolean',
            'free_shipping_international' => 'nullable|boolean',

            'delivers_to' => 'nullable|array',
            'delivers_to.*' => 'string|in:'.collect(config('dispatch.supported_shipping_countries'))->keys()->join(','),

            // Keep this here so that it the address is passed through with the validated data
            // (to be validated separately after)
            'dispatch_address_data' => 'nullable|array',
        ];
    }
}
