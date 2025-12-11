<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('teams', function (Blueprint $table) {
            // Allow teams to exist without an attached game until selected.
            $table->dropForeign(['game_id']);
            $table->unsignedBigInteger('game_id')->nullable()->change();
            $table->foreign('game_id')->references('id')->on('games')->cascadeOnDelete();

            // Track whether a team is a reusable registration template.
            $table->boolean('is_registered')->default(false)->after('id');
            $table->foreignId('registered_team_id')->nullable()->constrained('teams')->nullOnDelete()->after('game_id');

            // Side is set when a registered team is attached to a game.
            $table->string('side', 12)->nullable()->change();
        });

        Schema::table('players', function (Blueprint $table) {
            $table->string('player_pass_number', 32)->nullable()->index()->after('shirt_number');
            $table->string('nic_number', 32)->nullable()->after('player_pass_number');
            $table->date('date_of_birth')->nullable()->after('nic_number');
            $table->boolean('is_active')->default(true)->after('date_of_birth');
            $table->foreignId('registered_player_id')->nullable()->constrained('players')->nullOnDelete()->after('team_id');
        });
    }

    public function down(): void
    {
        Schema::table('players', function (Blueprint $table) {
            $table->dropForeign(['registered_player_id']);
            $table->dropColumn(['player_pass_number', 'nic_number', 'date_of_birth', 'is_active', 'registered_player_id']);
        });

        Schema::table('teams', function (Blueprint $table) {
            $table->dropForeign(['registered_team_id']);
            $table->dropColumn(['is_registered', 'registered_team_id']);
            $table->string('side', 12)->nullable(false)->change();
            $table->unsignedBigInteger('game_id')->nullable(false)->change();
            $table->foreign('game_id')->references('id')->on('games')->cascadeOnDelete();
        });
    }
};
