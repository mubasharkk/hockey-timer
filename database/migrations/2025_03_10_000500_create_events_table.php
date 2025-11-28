<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('game_id')->constrained('games')->cascadeOnDelete();
            $table->foreignId('team_id')->nullable()->constrained()->nullOnDelete();
            $table->unsignedTinyInteger('session_number');
            $table->enum('event_type', ['goal', 'card', 'penalty_corner', 'penalty_stroke', 'highlight']);
            $table->enum('goal_type', ['FG', 'PG'])->nullable();
            $table->enum('card_type', ['green', 'yellow', 'red'])->nullable();
            $table->unsignedSmallInteger('player_shirt_number')->nullable();
            $table->unsignedInteger('timer_value_seconds')->nullable();
            $table->timestamp('occurred_at')->nullable();
            $table->text('note')->nullable();
            $table->timestamps();

            $table->index(['game_id', 'session_number']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
