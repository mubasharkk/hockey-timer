<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('tournaments', function (Blueprint $table) {
            $table->json('knockout_bracket')->nullable()->after('loss_points');
        });

        Schema::table('games', function (Blueprint $table) {
            $table->string('knockout_round', 30)->nullable()->after('tournament_pool_id');
            $table->unsignedSmallInteger('knockout_position')->nullable()->after('knockout_round');
        });
    }

    public function down(): void
    {
        Schema::table('games', function (Blueprint $table) {
            $table->dropColumn(['knockout_round', 'knockout_position']);
        });

        Schema::table('tournaments', function (Blueprint $table) {
            $table->dropColumn('knockout_bracket');
        });
    }
};
