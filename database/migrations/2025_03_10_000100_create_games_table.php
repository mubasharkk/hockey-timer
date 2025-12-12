<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('games', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->cascadeOnDelete();
            $table->unsignedBigInteger('tournament_id')->nullable()->index();
            $table->unsignedBigInteger('home_team_id')->nullable()->index();
            $table->unsignedBigInteger('away_team_id')->nullable()->index();
            $table->string('team_a_name');
            $table->string('team_b_name');
            $table->string('venue');
            $table->string('excerpt')->nullable();
            $table->mediumText('notes')->nullable();
            $table->string('code', 10)->unique();
            $table->date('game_date');
            $table->time('game_time');
            $table->unsignedTinyInteger('sessions')->default(4);
            $table->unsignedSmallInteger('session_duration_minutes')->default(15);
            $table->enum('timer_mode', ['ASC', 'DESC'])->default('DESC');
            $table->string('sport_type')->default('field_hockey');
            $table->boolean('continue_timer_on_goal')->default(false);
            $table->string('game_officials', 500)->nullable();
            $table->string('status')->default('scheduled');
            $table->timestamp('started_at')->nullable();
            $table->timestamp('ended_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('games');
    }
};
