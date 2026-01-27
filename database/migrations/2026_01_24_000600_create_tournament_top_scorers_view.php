<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        DB::statement(<<<SQL
CREATE OR REPLACE VIEW tournament_top_scorers AS
SELECT
    g.tournament_id,
    e.team_id,
    t.name AS team_name,
    p.id AS player_id,
    COALESCE(p.name, CONCAT('Player #', e.player_shirt_number)) AS player_name,
    e.player_shirt_number,
    COUNT(*) AS goals
FROM events e
JOIN games g ON g.id = e.game_id
LEFT JOIN teams t ON t.id = e.team_id
INNER JOIN player_team pt ON pt.team_id = t.id AND pt.shirt_number = e.player_shirt_number
LEFT JOIN players p ON p.id = pt.player_id
WHERE g.tournament_id IS NOT NULL
  AND e.event_type = 'goal'
GROUP BY g.tournament_id, e.team_id, t.name, p.id, p.name, e.player_shirt_number;
SQL);
    }

    public function down(): void
    {
        DB::statement('DROP VIEW IF EXISTS tournament_top_scorers');
    }
};
