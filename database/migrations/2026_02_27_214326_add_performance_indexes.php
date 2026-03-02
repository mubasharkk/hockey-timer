<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Events table - critical for goal counting
        Schema::table('events', function (Blueprint $table) {
            $table->index(['game_id', 'team_id', 'event_type'], 'events_game_team_type_idx');
            $table->index('event_type', 'events_type_idx');
        });

        // Teams table - user teams and game teams
        Schema::table('teams', function (Blueprint $table) {
            $table->index('user_id', 'teams_user_idx');
            $table->index('game_id', 'teams_game_idx');
        });

        // Players table
        Schema::table('players', function (Blueprint $table) {
            $table->index('user_id', 'players_user_idx');
        });

        // player_team pivot - players in a team
        Schema::table('player_team', function (Blueprint $table) {
            $table->index('team_id', 'player_team_team_idx');
        });

        // Games - status filtering
        Schema::table('games', function (Blueprint $table) {
            $table->index('status', 'games_status_idx');
            $table->index(['game_date', 'status'], 'games_date_status_idx');
        });
    }

    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->dropIndex('events_game_team_type_idx');
            $table->dropIndex('events_type_idx');
        });

        Schema::table('teams', function (Blueprint $table) {
            $table->dropIndex('teams_user_idx');
            $table->dropIndex('teams_game_idx');
        });

        Schema::table('players', function (Blueprint $table) {
            $table->dropIndex('players_user_idx');
        });

        Schema::table('player_team', function (Blueprint $table) {
            $table->dropIndex('player_team_team_idx');
        });

        Schema::table('games', function (Blueprint $table) {
            $table->dropIndex('games_status_idx');
            $table->dropIndex('games_date_status_idx');
        });
    }
};
