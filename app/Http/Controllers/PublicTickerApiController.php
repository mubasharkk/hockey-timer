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
            'sessions' => fn ($q) => $q->orderBy('number'),
            'events' => fn ($q) => $q->orderByDesc('occurred_at')->limit(10),
        ]);

        $home = $game->teams->firstWhere('side', 'home');
        $away = $game->teams->firstWhere('side', 'away');

        // Determine current session
        $sessionCount = $game->sessions->count() ?: ($game->sessions ?? $game->sessions()->count());
        $endedSessions = $game->events->where('event_type', 'session_end')->count();
        $currentSessionNumber = max(1, min($sessionCount ?: 1, $endedSessions + 1));
        $currentSession = $game->sessions->firstWhere('number', $currentSessionNumber)
            ?: $game->sessions->sortBy('number')->first();

        $elapsed = $currentSession?->actual_duration_seconds ?? 0;
        $planned = $currentSession?->planned_duration_seconds ?? ($game->session_duration_minutes * 60);

        $timerSeconds = $game->timer_mode === 'DESC'
            ? max($planned - $elapsed, 0)
            : max($elapsed, 0);

        $recentEvents = $game->events->take(5)->values()->map(function ($event) {
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
            'team_a_score' => $home?->score ?? 0,
            'team_b_score' => $away?->score ?? 0,
            'timer_seconds' => $timerSeconds,
            'current_period' => $currentSessionNumber,
            'session_count' => $sessionCount,
            'timer_mode' => $game->timer_mode,
            'events' => $recentEvents,
        ]);
    }
}
