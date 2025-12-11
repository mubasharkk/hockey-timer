<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('tournaments', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('venue');
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->unsignedSmallInteger('win_points')->default(3);
            $table->unsignedSmallInteger('draw_points')->default(1);
            $table->unsignedSmallInteger('loss_points')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tournaments');
    }
};
