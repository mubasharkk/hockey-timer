<?php

namespace App\Http\Controllers;

use App\Models\Game;
use Illuminate\Http\JsonResponse;

class PublicTickerApiController extends Controller
{
    public function show(Game $game): JsonResponse
    {
        $game->load([
            'teams' => fn ($q) => $q->orderBy('side'),
            'tournament:id,title,logo_url',
        ]);
        $sessionModels = $game->sessions()->orderBy('number')->get();
        $eventModels = $game->events()->orderByDesc('occurred_at')->limit(50)->get();
        $goalCounts = $game->events()
            ->selectRaw('team_id, COUNT(*) as total')
            ->where('event_type', 'goal')
            ->groupBy('team_id')
            ->pluck('total', 'team_id');

        $home = $game->teams->firstWhere('side', 'home');
        $away = $game->teams->firstWhere('side', 'away');
        $homeScore = $home ? ($goalCounts[$home->id] ?? $home->score ?? 0) : 0;
        $awayScore = $away ? ($goalCounts[$away->id] ?? $away->score ?? 0) : 0;

        // Determine current session
        $sessionCount = max($sessionModels->count(), (int) ($game->getAttribute('sessions') ?? 0));
        $endedSessions = $eventModels->where('event_type', 'session_end')->count();
        $currentSessionNumber = max(1, min($sessionCount ?: 1, $endedSessions + 1));
        $currentSession = $sessionModels->firstWhere('number', $currentSessionNumber)
            ?: $sessionModels->sortBy('number')->first();

        $elapsed = $currentSession?->actual_duration_seconds ?? 0;
        $planned = $currentSession?->planned_duration_seconds ?? ($game->session_duration_minutes * 60);

        $lastStartEvent = $game->events()
            ->where(function ($q) {
                $q->where('event_type', 'session_start')
                    ->orWhere(function ($q2) {
                        $q2->where('event_type', 'highlight')
                            ->where('note', 'like', '%session%start%');
                    });
            })
            ->latest('occurred_at')
            ->first();

        $lastEndEvent = $game->events()
            ->whereIn('event_type', ['session_end', 'game_end'])
            ->latest('occurred_at')
            ->first();

        $lastStartAt = $lastStartEvent?->occurred_at;
        $lastEndAt = $lastEndEvent?->occurred_at;

        $isRunning = $game->status !== 'finished'
            && $lastStartAt
            && (! $lastEndAt || $lastStartAt > $lastEndAt);

        $isBreak = ! $isRunning
            && $endedSessions >= ($currentSessionNumber - 1)
            && (! $currentSession?->started_at || ($lastEndAt && (! $lastStartAt || $lastEndAt >= $lastStartAt)));

        $timerSeconds = 0;
        if ($isRunning) {
            $timerSeconds = $game->timer_mode === 'DESC'
                ? max($planned - $elapsed, 0)
                : max($elapsed, 0);
        } else {
            // Keep timer at zero during breaks or when stopped.
            $timerSeconds = 0;
        }

        $recentEvents = $eventModels->take(5)->values()->map(function ($event) {
            return [
                'id' => $event->id,
                'event_type' => $event->event_type,
                'session_number' => $event->session_number,
                'timer_value_seconds' => $event->timer_value_seconds,
                'occurred_at' => $event->occurred_at,
                'team_id' => $event->team_id,
                'goal_type' => $event->goal_type,
                'card_type' => $event->card_type,
                'player_shirt_number' => $event->player_shirt_number,
                'note' => $event->note,
            ];
        });

        return response()->json([
            'game_id' => $game->id,
            'team_a_name' => $game->team_a_name,
            'team_b_name' => $game->team_b_name,
            'team_a_score' => $homeScore ?? 0,
            'team_b_score' => $awayScore ?? 0,
            'tournament' => $game->tournament
                ? $game->tournament->only(['id', 'title', 'logo_url'])
                : null,
            'timer_seconds' => $timerSeconds,
            'current_period' => $currentSessionNumber,
            'session_count' => $sessionCount,
            'timer_mode' => $game->timer_mode,
            'status' => $game->status,
            'is_running' => $isRunning,
            'is_break' => $isBreak,
            'events' => $recentEvents,
        ]);
    }
}
