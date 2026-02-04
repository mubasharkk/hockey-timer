<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->foreignId('player_id')->nullable()->after('team_id')->constrained()->nullOnDelete();
            $table->index(['player_id', 'event_type']);
        });
    }

    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->dropForeign(['player_id']);
            $table->dropIndex(['player_id', 'event_type']);
            $table->dropColumn('player_id');
        });
    }
};
