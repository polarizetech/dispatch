<?php

namespace Dispatch\Support;

class Weight extends AbstractConverter
{
    protected static function baseUnit(): string
    {
        return 'lb';
    }

    public static function conversions(): array
    {
        return [
            'lb' => 1,
            'oz' => 16,
            'kg' => 0.453592,
        ];
    }

    /**
     * Convert the value to the given unit
     *
     * @param  $value  float|int|string
     * @param  $unit  "lb"|"kg"|"oz"
     */
    public static function from(float|int|string $value, string $unit): self
    {
        return new static($value, $unit);
    }

    public function toLb(): float
    {
        return $this->to('lb');
    }

    public function toKg(): float
    {
        return $this->to('kg');
    }

    public function toOz(): float
    {
        return $this->to('oz');
    }
}
