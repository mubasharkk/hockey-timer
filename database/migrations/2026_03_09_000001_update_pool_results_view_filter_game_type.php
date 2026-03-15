<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        DB::statement('DROP VIEW IF EXISTS tournament_pool_results');

        DB::statement(<<<'SQL'
CREATE VIEW tournament_pool_results AS
WITH game_goals AS (
    SELECT
        g.id AS game_id,
        g.tournament_id,
        e.team_id AS team_id,
        SUM(CASE WHEN e.event_type = 'goal' THEN 1 ELSE 0 END) AS goals
    FROM games g
    LEFT JOIN events e ON e.game_id = g.id
    WHERE g.tournament_id IS NOT NULL
      AND g.status = 'finished'
      AND g.game_type = 'pool'
    GROUP BY g.id, g.tournament_id, e.team_id
),
game_scores AS (
    SELECT
        g.id,
        g.tournament_id,
        g.home_team_id,
        g.away_team_id,
        COALESCE(h.goals, 0) AS home_goals,
        COALESCE(a.goals, 0) AS away_goals
    FROM games g
    LEFT JOIN game_goals h ON h.game_id = g.id AND h.team_id = g.home_team_id
    LEFT JOIN game_goals a ON a.game_id = g.id AND a.team_id = g.away_team_id
    WHERE g.tournament_id IS NOT NULL
      AND g.status = 'finished'
      AND g.game_type = 'pool'
),
results AS (
    SELECT
        tournament_id,
        home_team_id AS team_id,
        home_goals AS goals_for,
        away_goals AS goals_against,
        CASE
            WHEN home_goals > away_goals THEN 'W'
            WHEN home_goals = away_goals THEN 'D'
            ELSE 'L'
        END AS result
    FROM game_scores
    UNION ALL
    SELECT
        tournament_id,
        away_team_id AS team_id,
        away_goals AS goals_for,
        home_goals AS goals_against,
        CASE
            WHEN away_goals > home_goals THEN 'W'
            WHEN away_goals = home_goals THEN 'D'
            ELSE 'L'
        END AS result
    FROM game_scores
),
aggregate AS (
    SELECT
        tournament_id,
        team_id,
        COUNT(*) AS played,
        SUM(result = 'W') AS wins,
        SUM(result = 'D') AS draws,
        SUM(result = 'L') AS losses,
        SUM(goals_for) AS goals_for,
        SUM(goals_against) AS goals_against,
        SUM(goals_for) - SUM(goals_against) AS goal_diff
    FROM results
    GROUP BY tournament_id, team_id
)
SELECT
    t.id AS tournament_id,
    t.title AS tournament_title,
    tp.id AS pool_id,
    tp.name AS pool_name,
    reg.id AS team_id,
    reg.name AS team_name,
    COALESCE(a.played, 0) AS played,
    COALESCE(a.wins, 0) AS wins,
    COALESCE(a.draws, 0) AS draws,
    COALESCE(a.losses, 0) AS losses,
    COALESCE(a.goals_for, 0) AS goals_for,
    COALESCE(a.goals_against, 0) AS goals_against,
    COALESCE(a.goal_diff, 0) AS goal_diff,
    (COALESCE(a.wins, 0) * t.win_points) + (COALESCE(a.draws, 0) * t.draw_points) + (COALESCE(a.losses, 0) * t.loss_points) AS total_points
FROM tournament_pools tp
JOIN tournaments t ON t.id = tp.tournament_id
JOIN tournament_pool_team tpt ON tpt.tournament_pool_id = tp.id
JOIN teams reg ON reg.id = tpt.team_id
LEFT JOIN aggregate a ON a.tournament_id = t.id AND a.team_id = reg.id;
SQL);
    }

    public function down(): void
    {
        DB::statement('DROP VIEW IF EXISTS tournament_pool_results');
    }
};
