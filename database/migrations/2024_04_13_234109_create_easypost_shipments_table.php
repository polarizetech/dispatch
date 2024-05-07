<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('easypost_shipments', function (Blueprint $table) {
            $table->id();
            $table->string('easypost_shipment_id');
            $table->morphs('shippable');
            $table->string('postage_label_url');
            $table->string('tracking_code')->nullable();
            $table->json('tracking_details')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('easypost_shipments');
    }
};
