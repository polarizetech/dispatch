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
        Schema::create('shipping_profiles', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->boolean('is_shared')->default(false);
            $table->boolean('custom_rates')->nullable();
            $table->float('weight')->nullable();
            $table->string('weight_unit')->default('lb');
            $table->float('width')->nullable();
            $table->float('height')->nullable();
            $table->float('length')->nullable();
            $table->string('length_unit')->default('in');
            $table->integer('handling_fee')->nullable();
            $table->json('delivers_to')->nullable();
            $table->integer('dispatch_period')->nullable();
            $table->boolean('free_shipping_international')->default(false);
            $table->boolean('free_shipping_domestic')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shipping_profiles');
    }
};
