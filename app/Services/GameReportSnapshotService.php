<?php

namespace App\Services;

use App\Models\Game;
use Illuminate\Support\Collection;

class GameReportSnapshotService
{
    public function build(Game $game): array
    {
        $game->load([
            'homeTeam.players' => fn ($q) => $q->orderBy('shirt_number')->orderBy('name'),
            'awayTeam.players' => fn ($q) => $q->orderBy('shirt_number')->orderBy('name'),
            'sessions'         => fn ($q) => $q->orderBy('number'),
            'events'           => fn ($q) => $q->orderBy('session_number')->orderBy('timer_value_seconds'),
            'tournament',
        ]);

        $sessionCount = $game->sessions instanceof Collection
            ? $game->sessions->count()
            : (int) ($game->getAttribute('sessions') ?? 0);

        $sessionLabel = function (int $n) use ($sessionCount): string {
            $prefix = $sessionCount === 2 ? 'H' : ($sessionCount === 4 ? 'Q' : 'S');
            return "{$prefix}{$n}";
        };

        $inGame   = $game->getInGameGoalCounts();
        $shootout = $game->getShootoutGoalCounts();
        $final    = $game->getGoalCounts();

        return [
            'schema_version' => 1,
            'generated_at'   => now()->toIso8601String(),
            'match'          => $this->buildMatch($game, $sessionCount),
            'score'          => [
                'home'           => $final['home'],
                'away'           => $final['away'],
                'home_shootout'  => $shootout['home'],
                'away_shootout'  => $shootout['away'],
            ],
            'sessions' => $this->buildSessions($game, $sessionLabel),
            'teams'    => $this->buildTeams($game),
            'events'   => $this->buildEvents($game, $sessionLabel),
        ];
    }

    // ─── Private builders ────────────────────────────────────────────────────

    private function buildMatch(Game $game, int $sessionCount): array
    {
        return [
            'id'                       => $game->id,
            'code'                     => $game->code,
            'sport_type'               => $game->sport_type,
            'tournament'               => $game->tournament?->title,
            'venue'                    => $game->venue,
            'game_date'                => $game->game_date?->format('Y-m-d'),
            'game_time'                => $game->game_time,
            'status'                   => $game->status,
            'started_at'               => $game->started_at?->toIso8601String(),
            'ended_at'                 => $game->ended_at?->toIso8601String(),
            'session_duration_minutes' => $game->session_duration_minutes,
            'sessions_count'           => $sessionCount,
            'timer_mode'               => $game->timer_mode,
            'game_officials'           => $game->game_officials,
            'comments'                 => $game->comments,
        ];
    }

    private function buildSessions(Game $game, callable $sessionLabel): array
    {
        return $game->getRelation('sessions')->map(function ($session) use ($game, $sessionLabel) {
            $scores   = $game->sessionScores($session->number);
            $home     = collect($scores)->firstWhere('side', 'home')['score'] ?? 0;
            $away     = collect($scores)->firstWhere('side', 'away')['score'] ?? 0;

            return [
                'number'                    => $session->number,
                'label'                     => $sessionLabel($session->number),
                'home_score'                => $home,
                'away_score'                => $away,
                'planned_duration_seconds'  => $session->planned_duration_seconds,
                'actual_duration_seconds'   => $session->actual_duration_seconds,
                'overrun_seconds'           => $session->overrun_seconds,
                'break_duration_seconds'    => $session->break_duration_seconds,
                'started_at'                => $session->started_at?->toIso8601String(),
                'ended_at'                  => $session->ended_at?->toIso8601String(),
            ];
        })->values()->toArray();
    }

    private function buildTeams(Game $game): array
    {
        $events = $game->events;

        $buildTeam = function ($team, string $side) use ($events): ?array {
            if (! $team) {
                return null;
            }

            $teamEvents = $events->where('team_id', $team->id);

            $players = $team->players->map(function ($player) use ($teamEvents) {
                $playerEvents = $teamEvents->filter(
                    fn ($e) => ($e->player_id && $e->player_id === $player->id)
                        || ($e->player_shirt_number !== null && (string) $e->player_shirt_number === (string) $player->shirt_number)
                );

                $cardTimes = ['red' => [], 'yellow' => [], 'green' => []];
                foreach ($playerEvents->where('event_type', 'card') as $e) {
                    $type = $e->card_type ?? 'card';
                    $clock = $this->formatClock($e->timer_value_seconds);
                    if (array_key_exists($type, $cardTimes) && $clock !== null) {
                        $cardTimes[$type][] = $clock;
                    }
                }

                return [
                    'id'           => $player->id,
                    'name'         => $player->name,
                    'shirt_number' => $player->shirt_number,
                    'goals'        => $playerEvents->where('event_type', 'goal')->count(),
                    'cards'        => $cardTimes,
                ];
            })->values()->toArray();

            return [
                'id'               => $team->id,
                'name'             => $team->name,
                'side'             => $side,
                'coach'            => $team->coach,
                'manager'          => $team->manager,
                'penalty_corners'  => $teamEvents->where('event_type', 'penalty_corner')->count(),
                'penalty_strokes'  => $teamEvents->where('event_type', 'penalty_stroke')->count(),
                'players'          => $players,
            ];
        };

        return [
            'home' => $buildTeam($game->homeTeam, 'home'),
            'away' => $buildTeam($game->awayTeam, 'away'),
        ];
    }

    private function buildEvents(Game $game, callable $sessionLabel): array
    {
        $home = $game->homeTeam;
        $away = $game->awayTeam;

        return $game->events
            ->filter(fn ($e) => $e->team_id !== null)
            ->sortBy(fn ($e) => $e->occurred_at?->timestamp ?? 0)
            ->values()
            ->map(function ($e, $idx) use ($home, $away, $sessionLabel) {
                $teamName = match ($e->team_id) {
                    $home?->id => $home->name,
                    $away?->id => $away->name,
                    default    => '—',
                };

                return [
                    'sequence'       => $idx + 1,
                    'session_number' => $e->session_number,
                    'session_label'  => $e->session_number ? $sessionLabel($e->session_number) : null,
                    'event_type'     => $e->event_type,
                    'goal_type'      => $e->goal_type,
                    'card_type'      => $e->card_type,
                    'clock'          => $this->formatClock($e->timer_value_seconds),
                    'occurred_at'    => $e->occurred_at?->toIso8601String(),
                    'team_id'        => $e->team_id,
                    'team_name'      => $teamName,
                    'player_id'      => $e->player_id,
                    'player_name'    => $e->note,
                    'shirt_number'   => $e->player_shirt_number,
                    'note'           => $e->note,
                ];
            })
            ->toArray();
    }

    private function formatClock(?int $seconds): ?string
    {
        if ($seconds === null) {
            return null;
        }

        return sprintf('%02d:%02d', intdiv($seconds, 60), $seconds % 60);
    }
}
