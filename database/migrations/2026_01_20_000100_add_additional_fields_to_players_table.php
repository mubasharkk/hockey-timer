<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('players', function (Blueprint $table) {
            $table->string('guardian_name')->nullable()->after('date_of_birth');
            $table->string('guardian_nic', 50)->nullable()->after('guardian_name');
            $table->string('phone', 50)->nullable()->after('guardian_nic');
            $table->string('blood_group', 10)->nullable()->after('phone');
            $table->string('player_type', 20)->nullable()->after('blood_group');
            $table->text('description')->nullable()->after('player_type');
        });
    }

    public function down(): void
    {
        Schema::table('players', function (Blueprint $table) {
            $table->dropColumn([
                'guardian_name',
                'guardian_nic',
                'phone',
                'blood_group',
                'player_type',
                'description',
            ]);
        });
    }
};
