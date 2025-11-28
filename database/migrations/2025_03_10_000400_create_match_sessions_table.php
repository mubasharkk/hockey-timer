<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('match_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('game_id')->constrained('games')->cascadeOnDelete();
            $table->unsignedTinyInteger('number');
            $table->unsignedInteger('planned_duration_seconds');
            $table->unsignedInteger('actual_duration_seconds')->nullable();
            $table->unsignedInteger('overrun_seconds')->nullable();
            $table->unsignedInteger('break_duration_seconds')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('ended_at')->nullable();
            $table->timestamp('break_started_at')->nullable();
            $table->timestamp('break_ended_at')->nullable();
            $table->timestamps();

            $table->unique(['game_id', 'number']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('match_sessions');
    }
};
