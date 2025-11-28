<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        DB::statement("ALTER TABLE events MODIFY event_type ENUM('goal','card','penalty_corner','penalty_stroke','highlight','session_end','game_end','game_start')");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE events MODIFY event_type ENUM('goal','card','penalty_corner','penalty_stroke','highlight','session_end','game_end')");
    }
};
