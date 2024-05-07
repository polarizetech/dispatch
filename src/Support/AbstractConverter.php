<?php

namespace Dispatch\Support;

use InvalidArgumentException;

abstract class AbstractConverter
{
    /**
     * Define the base unit that all conversions should be based on.
     */
    abstract protected static function baseUnit(): string;

    /**
     * Define the conversions for converting the base unit to other units
     *
     * @return array<string, float>
     */
    abstract public static function conversions(): array;

    /**
     * Convert the value to the given unit
     *
     * @param  $value  float|int|string
     * @param  $unit  string
     */
    abstract public static function from(float|int|string $value, string $unit): self;

    private float $value;

    private string $fromUnit;

    public int $decimalDigits = 5;

    final public function __construct(float|int|string $value, string $unit)
    {
        if (! in_array($unit, $this->unitOptions())) {
            $className = class_basename(get_called_class());
            throw new InvalidArgumentException(
                "Unsupported unit \"{$unit}\" for \"{$className}\" converter. Supported units are: ".implode(',', $this->unitOptions()).'.'
            );
        }

        $value = $this->formatUnitValue($value);

        $this->value = $value;

        $this->fromUnit = $unit;
    }

    final public function unitOptions(): array
    {
        return array_keys($this->conversions());
    }

    private function formatUnitValue(float|int|string $value): float
    {
        if (is_string($value) && ! is_numeric($value)) {
            throw new InvalidArgumentException('Value to format must be numeric');
        }

        $decimalDigits = $this->decimalDigits;

        /* @var float $rounded */
        $rounded = round((float) $value, $decimalDigits);

        /* @var string $formatted */
        $formatted = number_format($rounded, $decimalDigits, '.');

        /* @var float $floated */
        $floated = (float) $formatted;

        return $floated;
    }

    final public function to(string $unit): float
    {
        if (! in_array($unit, $this->unitOptions())) {
            $className = class_basename(get_called_class());
            throw new InvalidArgumentException(
                "Unsupported unit \"{$unit}\" for \"{$className}\" converter. Supported units are: ".implode(',', $this->unitOptions()).'.'
            );
        }

        $value = $this->value;

        // Convert to base unit
        $fromUnitConversion = $this->conversions()[$this->fromUnit];
        $value = (float) $value * (1 / $fromUnitConversion);

        if ($unit === static::baseUnit()) {
            return $this->formatUnitValue($value);
        }

        // Convert to target unit
        $toUnitConversion = $this->conversions()[$unit];
        $value = (float) $value * $toUnitConversion;

        return $this->formatUnitValue($value);
    }
}
