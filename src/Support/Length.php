<?php

namespace Dispatch\Support;

class Length extends AbstractConverter
{
    protected static function baseUnit(): string
    {
        return 'in';
    }

    public static function conversions(): array
    {
        return [
            'in' => 1,
            'cm' => 2.54,
        ];
    }

    /**
     * Convert the value to the given unit
     *
     * @param  $value  float|int|string
     * @param  $unit  "in"|"cm"
     */
    public static function from(float|int|string $value, string $unit): self
    {
        return new static($value, $unit);
    }

    public function toIn(): float
    {
        return $this->to('in');
    }

    public function toCm(): float
    {
        return $this->to('cm');
    }
}
