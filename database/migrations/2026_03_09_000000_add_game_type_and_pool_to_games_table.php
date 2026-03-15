<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('games', function (Blueprint $table) {
            $table->string('game_type', 20)->default('pool')->after('tournament_id');
            $table->foreignId('tournament_pool_id')->nullable()->after('game_type')
                  ->constrained('tournament_pools')->nullOnDelete();
        });

        DB::table('games')->whereNull('tournament_id')->update(['game_type' => 'friendly']);
    }

    public function down(): void
    {
        Schema::table('games', function (Blueprint $table) {
            $table->dropForeign(['tournament_pool_id']);
            $table->dropColumn(['game_type', 'tournament_pool_id']);
        });
    }
};
