<?php

namespace App\Console\Commands;

use App\Models\Event;
use App\Models\Player;
use Illuminate\Console\Command;

class RecalculatePlayerStats extends Command
{
    protected $signature = 'players:recalculate-stats';

    protected $description = 'Recalculate all player statistics from events';

    public function handle(): int
    {
        $this->info('Recalculating player statistics...');

        $players = Player::all();
        $bar = $this->output->createProgressBar($players->count());
        $bar->start();

        foreach ($players as $player) {
            $events = Event::where('player_id', $player->id)->get();

            $player->update([
                'total_games' => $events->pluck('game_id')->unique()->count(),
                'total_goals' => $events->where('event_type', 'goal')->count(),
                'total_green_cards' => $events->where('event_type', 'card')->where('card_type', 'green')->count(),
                'total_yellow_cards' => $events->where('event_type', 'card')->where('card_type', 'yellow')->count(),
                'total_red_cards' => $events->where('event_type', 'card')->where('card_type', 'red')->count(),
                'total_penalty_corners' => $events->where('event_type', 'penalty_corner')->count(),
                'total_penalty_strokes' => $events->where('event_type', 'penalty_stroke')->count(),
            ]);

            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);
        $this->info('Done! Recalculated stats for ' . $players->count() . ' players.');

        return Command::SUCCESS;
    }
}
