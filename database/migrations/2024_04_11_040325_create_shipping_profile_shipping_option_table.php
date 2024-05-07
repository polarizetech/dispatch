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
        Schema::create('shipping_profile_shipping_option', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shipping_profile_id')->constrained()->onDelete('cascade');
            $table->foreignId('shipping_option_id')->constrained()->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shipping_profile_shipping_option');
    }
};
