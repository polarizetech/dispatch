<?php

namespace Dispatch\Http\Controllers;

use App\Enums\OrderStatusEnum;
use Dispatch\Actions\AssignShippingProfile;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderProduct;
use Dispatch\Actions\CalculateShippingOptionRates;
use Dispatch\Actions\CreateShipment;
use Dispatch\Models\EasyPostShipment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Spatie\Image\Image;

class ShipmentController extends Controller
{
    public function downloadPostageLabel(EasyPostShipment $shipment)
    {
        $name = str('postage-label-')->append($shipment->id)->toString();

        if (! Storage::exists("postage-labels/{$name}.pdf")) {
            Storage::put("postage-labels/{$name}.png", file_get_contents($shipment->postage_label_url));
            Image::load(storage_path("app/postage-labels/{$name}.png"))
                ->format('pdf')
                ->save(storage_path("app/postage-labels/{$name}.pdf"));
        }

        return response(file_get_contents(storage_path("app/postage-labels/{$name}.pdf")), 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => "attachment; filename=\"{$name}.pdf\"",
        ]);
    }
}
