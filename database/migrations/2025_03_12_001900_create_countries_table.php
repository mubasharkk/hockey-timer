<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create(config('countries.table_name', 'countries'), function (Blueprint $table) {
            $table->integer('id')->unsigned()->primary();
            $table->string('capital', 255)->nullable();
            $table->string('citizenship', 255)->nullable();
            $table->string('country_code', 3)->default('');
            $table->string('currency', 255)->nullable();
            $table->string('currency_code', 255)->nullable();
            $table->string('currency_sub_unit', 255)->nullable();
            $table->string('currency_symbol', 3)->nullable();
            $table->integer('currency_decimals')->nullable();
            $table->string('full_name', 255)->nullable();
            $table->string('iso_3166_2', 2)->default('');
            $table->string('iso_3166_3', 3)->default('');
            $table->string('name', 255)->default('');
            $table->string('region_code', 3)->default('');
            $table->string('sub_region_code', 3)->default('');
            $table->boolean('eea')->default(false);
            $table->string('calling_code', 3)->nullable();
            $table->string('flag', 6)->nullable();

            $table->index('name');
            $table->index('iso_3166_2');
            $table->index('iso_3166_3');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists(config('countries.table_name', 'countries'));
    }
};
