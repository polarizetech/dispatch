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
        Schema::create('shipping_option_rates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shipping_option_id');
            $table->integer('amount');
            $table->string('currency');
            $table->integer('delivery_days')->nullable();
            $table->string('easypost_shipment_id')->nullable();
            $table->string('easypost_rate_id')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shipping_option_rates');
    }
};
