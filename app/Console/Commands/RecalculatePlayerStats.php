<?php

namespace App\Console\Commands;

use App\Models\Player;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class RecalculatePlayerStats extends Command
{
    protected $signature = 'players:recalculate-stats
                            {--player= : Recalculate for a specific player ID}';

    protected $description = 'Recalculate all player statistics from events and games';

    public function handle(): int
    {
        $query = Player::query();

        if ($playerId = $this->option('player')) {
            $query->where('id', $playerId);
        }

        $players = $query->with('teams:id')->get();

        if ($players->isEmpty()) {
            $this->warn('No players found.');
            return Command::SUCCESS;
        }

        $this->info("Recalculating stats for {$players->count()} player(s)...");
        $bar = $this->output->createProgressBar($players->count());
        $bar->start();

        $updated = 0;

        foreach ($players as $player) {
            $teamIds = $player->teams->pluck('id')->all();

            $pivotRows = DB::table('player_team')
                ->where('player_id', $player->id)
                ->select('team_id', 'shirt_number')
                ->get();

            $eventQuery = $this->buildPlayerEventsQuery($player->id, $pivotRows);

            $stats = DB::query()
                ->fromSub($eventQuery, 'pe')
                ->selectRaw("COUNT(DISTINCT CASE WHEN pe.event_type = 'goal' THEN pe.id END) as total_goals")
                ->selectRaw("COUNT(DISTINCT CASE WHEN pe.event_type = 'card' AND pe.card_type = 'green' THEN pe.id END) as total_green_cards")
                ->selectRaw("COUNT(DISTINCT CASE WHEN pe.event_type = 'card' AND pe.card_type = 'yellow' THEN pe.id END) as total_yellow_cards")
                ->selectRaw("COUNT(DISTINCT CASE WHEN pe.event_type = 'card' AND pe.card_type = 'red' THEN pe.id END) as total_red_cards")
                ->first();

            $totalGames = 0;
            if (!empty($teamIds)) {
                $totalGames = DB::table('games')
                    ->where('status', 'finished')
                    ->where(function ($q) use ($teamIds) {
                        $q->whereIn('home_team_id', $teamIds)
                          ->orWhereIn('away_team_id', $teamIds);
                    })
                    ->count();
            }

            $player->update([
                'total_games' => $totalGames,
                'total_goals' => $stats->total_goals ?? 0,
                'total_green_cards' => $stats->total_green_cards ?? 0,
                'total_yellow_cards' => $stats->total_yellow_cards ?? 0,
                'total_red_cards' => $stats->total_red_cards ?? 0,
            ]);

            $updated++;
            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);
        $this->info("Done! Recalculated stats for {$updated} player(s).");

        return Command::SUCCESS;
    }

    /**
     * Build a query that finds all events belonging to a player,
     * matching by player_id directly or by team_id + shirt_number via pivot.
     */
    private function buildPlayerEventsQuery(int $playerId, $pivotRows)
    {
        $query = DB::table('events')->where('player_id', $playerId);

        foreach ($pivotRows as $pivot) {
            if ($pivot->shirt_number === null) {
                continue;
            }

            $query->orWhere(function ($q) use ($pivot, $playerId) {
                $q->where('team_id', $pivot->team_id)
                  ->where('player_shirt_number', $pivot->shirt_number)
                  ->where(function ($inner) use ($playerId) {
                      $inner->whereNull('player_id')
                            ->orWhere('player_id', $playerId);
                  });
            });
        }

        return $query;
    }
}
