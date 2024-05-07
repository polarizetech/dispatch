<?php

namespace Dispatch\Validators;

use Dispatch\Services\EasyPost;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Validator;

class ShippingAddressValidator extends Validator
{
    public static function make(array $data, ?array $rules = []): \Illuminate\Validation\Validator
    {
        $errors = self::verifyEasyPostShippingAddress($data);

        return parent::make(
            data: $data,
            rules: array_merge([
                'name' => 'required|string|max:255',
                'city' => [
                    'required',
                    'string',
                    fn ($attribute, $value, $fail) => (
                        ($error = $errors->get($attribute)) ? $fail($error) : null
                    ),
                ],
                'country' => [
                    'required',
                    'string',
                    fn ($attribute, $value, $fail) => (
                        ($error = $errors->get($attribute)) ? $fail($error) : null
                    ),
                ],
                'line1' => [
                    'required',
                    'string',
                    fn ($attribute, $value, $fail) => (
                        ($error = $errors->get('street1')) ? $fail($error) : null
                    ),
                ],
                'line2' => [
                    'nullable',
                    'string',
                    fn ($attribute, $value, $fail) => (
                        ($error = $errors->get('street2')) ? $fail($error) : null
                    ),
                ],
                'postal_code' => [
                    'required',
                    'string',
                    fn ($attribute, $value, $fail) => (
                        ($error = $errors->get('zip')) ? $fail($error) : null
                    ),
                ],
                'state' => [
                    'required',
                    'string',
                    fn ($attribute, $value, $fail) => (
                        ($error = $errors->get($attribute)) ? $fail(str($error)->replace('state', 'province')) : null
                    ),
                ],
            ], $rules),
            attributes: [
                'name' => __('address name'),
                'city' => __('address city'),
                'country' => __('address country'),
                'line1' => __('address line 1'),
                'line2' => __('address line 2'),
                'postal_code' => __('address postal_code'),
                'state' => __('address state'),
            ]
        );
    }

    public static function verifyEasyPostShippingAddress(array $address): Collection
    {

        if (array_key_exists('line1', $address)) {
            $address['street1'] = $address['line1'];
            $address['street2'] = $address['line2'];
        }

        if (array_key_exists('postal_code', $address)) {
            $address['zip'] = $address['postal_code'];
        }

        $addressData = (
            collect($address)
                ->only([
                    'street1',
                    'street2',
                    'city',
                    'state',
                    'zip',
                    'country',
                    'name',
                    'phone',
                ])
                ->merge([
                    'verify' => true,
                    'mode' => App::environment('production') ? 'production' : 'test',
                    'residential' => true,
                ])
                ->toArray()
        );

        $response = (new EasyPost)->addressCreate($addressData);

        // $verificationErrors = collect($response->verifications->zip4->errors ?? []);
        $verificationErrors = collect($response->verifications->delivery->errors ?? []);

        return
            $verificationErrors->map(fn ($error) => [
                $error->field => $error->message.($error->suggestion ? ". Did you mean \"{$error->suggestion}\"?" : ''),
            ])->collapse();
    }
}
