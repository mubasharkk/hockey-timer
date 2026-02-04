<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('players', function (Blueprint $table) {
            $table->unsignedInteger('total_games')->default(0)->after('is_active');
            $table->unsignedInteger('total_goals')->default(0)->after('total_games');
            $table->unsignedInteger('total_green_cards')->default(0)->after('total_goals');
            $table->unsignedInteger('total_yellow_cards')->default(0)->after('total_green_cards');
            $table->unsignedInteger('total_red_cards')->default(0)->after('total_yellow_cards');
        });
    }

    public function down(): void
    {
        Schema::table('players', function (Blueprint $table) {
            $table->dropColumn([
                'total_games',
                'total_goals',
                'total_green_cards',
                'total_yellow_cards',
                'total_red_cards',
            ]);
        });
    }
};
