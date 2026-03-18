<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('events', function (Blueprint $table) {
            // Change the goal_type enum to include 'shootout'
            $table->enum('goal_type', ['FG', 'PG', 'shootout'])->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            // Revert to original enum values
            $table->enum('goal_type', ['FG', 'PG'])->nullable()->change();
        });
    }
};
