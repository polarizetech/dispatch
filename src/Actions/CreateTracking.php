<?php

namespace Dispatch\Actions;

use Dispatch\Services\EasyPost;

/**
 * Create a tracking object using configured shipping service
 */
class CreateTracking
{
    public static function run(string $trackingCode, ?string $carrier = null): array
    {
        $tracker = (new EasyPost)->trackerCreate($trackingCode, $carrier);

        return $tracker->__toArray();
    }
}
