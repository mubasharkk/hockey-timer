<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('players', function (Blueprint $table) {
            $table->dropColumn(['guardian_name', 'guardian_nic']);
        });
    }

    public function down(): void
    {
        Schema::table('players', function (Blueprint $table) {
            $table->string('guardian_name')->nullable()->after('date_of_birth');
            $table->string('guardian_nic', 50)->nullable()->after('guardian_name');
        });
    }
};
