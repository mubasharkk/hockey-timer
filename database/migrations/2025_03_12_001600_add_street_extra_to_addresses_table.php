<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddStreetExtraToAddressesTable extends Migration
{
    protected string $table;

    public function __construct()
    {
        $this->table = config('lecturize.addresses.table', 'addresses');
    }

    public function up(): void
    {
        Schema::table($this->table, function (Blueprint $table) {
            $table->string('street_extra', 60)->nullable()->after('street');
        });
    }

    public function down(): void
    {
        Schema::table($this->table, function (Blueprint $table) {
            $table->dropColumn('street_extra');
        });
    }
}
