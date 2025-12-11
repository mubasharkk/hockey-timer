<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('games', function (Blueprint $table) {
            $table->foreignId('home_team_id')->nullable()->constrained('teams')->nullOnDelete()->after('team_b_name');
            $table->foreignId('away_team_id')->nullable()->constrained('teams')->nullOnDelete()->after('home_team_id');
        });
    }

    public function down(): void
    {
        Schema::table('games', function (Blueprint $table) {
            $table->dropForeign(['home_team_id']);
            $table->dropForeign(['away_team_id']);
            $table->dropColumn(['home_team_id', 'away_team_id']);
        });
    }
};
