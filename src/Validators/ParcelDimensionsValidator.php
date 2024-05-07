<?php

namespace Dispatch\Validators;

use Dispatch\Actions\CreateShipment;
use Dispatch\Support\Length;
use Dispatch\Support\Weight;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Validator;

/**
 * @resource based on EasyPost parcel requirements (https://www.easypost.com/docs/api#parcels)
 */
class ParcelDimensionsValidator extends Validator
{
    public static function make(array $data, ?array $rules = [], ?string $originPostalCode = null): \Illuminate\Validation\Validator
    {
        $rules = static::rules();

        if ($originPostalCode) {
            $errors = static::verifyEasyPostParcel($data, $originPostalCode);

            if ($errors->isNotEmpty()) {
                $rules = collect($rules)
                    ->filter(fn ($rules, $field) => !!$errors->get($field, false))
                    ->map(fn ($rules, $field) =>
                        [$field => [...$rules,
                            fn ($attr, $value, $fail) =>
                                $fail($errors->get($attr, false))
                        ]]
                    )
                    ->toArray();
            }
        }

        return parent::make($data, $rules);
    }

    /**
     * @return array<string, string|\Illuminate\Validation\Rule[]|array<int, string>>
     */
    protected static function rules(): array
    {
        $weightUnits = collect(Weight::conversions())->keys()->join(',');
        $lengthUnits = collect(Length::conversions())->keys()->join(',');

        return [
            'weight' => [
                'required',
                'numeric',
                'min:0.1',
                'max:999999',
            ],
            'height' => [
                'nullable',
                'required_with:length,width',
                'numeric',
                'min:0.1',
                'max:999999',
            ],
            'width' => [
                'nullable',
                'required_with:length,height',
                'numeric',
                'min:0.1',
                'max:999999',
            ],
            'length' => [
                'nullable',
                'required_with:width,height',
                'numeric',
                'min:0.1',
                'max:999999',
            ],

            'weight_unit' => [
                'required_with:weight',
                'in:'.$weightUnits,
            ],
            'length_unit' => [
                'required_with:height,width,length',
                'in:'.$lengthUnits,
            ],
        ];
    }

    protected static function verifyEasyPostParcel(array $data, string $originPostalCode): Collection
    {
        $dims = (object) $data;

        $parcel = collect([
            'weight' => Weight::from($dims->weight, $dims->weight_unit)->toOz(),
        ]);

        if ($dims->length ?? null) {
            $parcel = $parcel->merge([
                'length' => Length::from($dims->length, $dims->length_unit)->toIn(),
                'width' => Length::from($dims->width, $dims->length_unit)->toIn(),
                'height' => Length::from($dims->height, $dims->length_unit)->toIn(),
            ]);
        }

        $shipment = CreateShipment::run(
            fromAddress: ['zip' => $originPostalCode],
            toAddress: ['zip' => $originPostalCode], // Just use the origin postal code for this
            parcel: $parcel->toArray(),
            // carrierAccounts: $supportedCarriers
        );

        return collect($shipment->messages)
            ->where('type', 'rate_error')
            ->filter(fn ($message) => str($message->message)->contains('shipment.parcel.'))
            ->map(function ($message) {

                $content = str($message->message);

                $field = $content->explode('shipment.parcel.')->slice(1)->first();
                $field = str($field)->explode(': ensure this value is');

                if ($content->contains('is less than or equal to')) {
                    $max = str($field->last())->after('or equal to')->trim()->before(' and')->toString();
                    $field = $field->first();
                    $content = __('validation.max.numeric', ['attribute' => $field, 'max' => $max]);
                }

                return [$field => "{$message->carrier}: {$content}"];
            })
            ->collapse();
    }
}
