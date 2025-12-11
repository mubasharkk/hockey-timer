<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('tournament_pool_team', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tournament_pool_id')->constrained()->cascadeOnDelete();
            $table->foreignId('team_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['tournament_pool_id', 'team_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tournament_pool_team');
    }
};
