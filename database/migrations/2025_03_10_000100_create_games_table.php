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
            $table->string('team_a_name');
            $table->string('team_b_name');
            $table->string('venue');
            $table->date('game_date');
            $table->time('game_time');
            $table->unsignedTinyInteger('sessions')->default(4);
            $table->unsignedSmallInteger('session_duration_minutes')->default(15);
            $table->enum('timer_mode', ['ASC', 'DESC'])->default('DESC');
            $table->string('status')->default('draft');
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
