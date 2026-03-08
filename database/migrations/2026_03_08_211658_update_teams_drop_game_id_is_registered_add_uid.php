<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('teams', function (Blueprint $table) {
            $table->dropForeign(['game_id']);
            $table->dropForeign(['registered_team_id']);
        });

        Schema::table('teams', function (Blueprint $table) {
            if (Schema::hasIndex('teams', 'teams_game_idx')) {
                $table->dropIndex('teams_game_idx');
            }

            $table->dropColumn(['game_id', 'is_registered', 'registered_team_id']);
            $table->string('uid', 8)->nullable()->unique()->after('id');
        });

        DB::table('teams')->whereNull('uid')->orderBy('id')->each(function ($team) {
            DB::table('teams')->where('id', $team->id)->update([
                'uid' => $this->generateUniqueUid(),
            ]);
        });
    }

    public function down(): void
    {
        Schema::table('teams', function (Blueprint $table) {
            $table->dropColumn('uid');
            $table->foreignId('game_id')->nullable()->after('club_id')->constrained('games')->nullOnDelete();
            $table->foreignId('registered_team_id')->nullable()->after('game_id')->constrained('teams')->nullOnDelete();
            $table->boolean('is_registered')->default(false)->after('registered_team_id');
        });
    }

    private function generateUniqueUid(): string
    {
        do {
            $uid = strtoupper(Str::random(8));
            $uid = preg_replace('/[^A-Z0-9]/', substr('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', random_int(0, 35), 1), $uid);
        } while (DB::table('teams')->where('uid', $uid)->exists());

        return $uid;
    }
};
