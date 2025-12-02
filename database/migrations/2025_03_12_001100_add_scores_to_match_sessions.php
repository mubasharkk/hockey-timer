<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('match_sessions', function (Blueprint $table) {
            $table->boolean('aggregate_previous')->default(true)->after('break_ended_at');
            $table->unsignedInteger('home_score')->default(0)->after('aggregate_previous');
            $table->unsignedInteger('away_score')->default(0)->after('home_score');
        });
    }

    public function down(): void
    {
        Schema::table('match_sessions', function (Blueprint $table) {
            $table->dropColumn(['aggregate_previous', 'home_score', 'away_score']);
        });
    }
};
