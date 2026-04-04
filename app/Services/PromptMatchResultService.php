<?php

namespace App\Services;

use App\Models\Event;
use App\Models\Game;
use Illuminate\Support\Facades\Log;
use OpenAI\Laravel\Facades\OpenAI;

class PromptMatchResultService
{
    public function __construct(private GameReportSnapshotService $snapshotService) {}

    /**
     * Step 1 — Parse a free-text prompt via GPT and return structured events for preview.
     * Nothing is written to the database.
     */
    public function parse(Game $game, string $prompt): array
    {
        $game->load([
            'homeTeam.players',
            'awayTeam.players',
            'sessions'      => fn ($q) => $q->orderBy('number'),
            'tournament',
            'tournamentPool',
        ]);

        $parsed = $this->callGpt($game, $prompt);

        if (empty($parsed['events'])) {
            return [
                'success'    => false,
                'events'     => [],
                'unresolved' => $parsed['unresolved'] ?? [],
                'summary'    => $parsed['summary'] ?? null,
                'error'      => 'No events could be extracted from the provided text.',
            ];
        }

        return [
            'success'    => true,
            'events'     => $parsed['events'],
            'unresolved' => $parsed['unresolved'] ?? [],
            'summary'    => $parsed['summary'] ?? null,
        ];
    }

    /**
     * Step 2 — Persist confirmed events, mark game finished and generate report snapshot.
     */
    public function apply(Game $game, array $events): array
    {
        $now  = now();
        $rows = array_map(fn ($e) => array_merge($e, [
            'game_id'     => $game->id,
            'occurred_at' => $now,
            'created_at'  => $now,
            'updated_at'  => $now,
        ]), $events);

        Event::insert($rows);

        $game->update([
            'status'   => 'finished',
            'ended_at' => $now,
        ]);

        $snapshot = $this->snapshotService->build($game->fresh());
        $game->update(['report_snapshot' => $snapshot]);

        return [
            'success'      => true,
            'events_count' => count($rows),
            'redirect_url' => route('games.report', $game),
        ];
    }

    // -------------------------------------------------------------------------

    private function callGpt(Game $game, string $prompt): array
    {
        try {
            $response = OpenAI::chat()->create([
                'model'           => 'gpt-4o',
                'messages'        => [
                    ['role' => 'system', 'content' => $this->buildSystemPrompt($game)],
                    ['role' => 'user',   'content' => $prompt],
                ],
                'max_tokens'      => 4000,
                'response_format' => ['type' => 'json_object'],
            ]);

            $parsed = json_decode($response->choices[0]->message->content, true);

            $playerMap = $this->buildPlayerMap($game);

            return [
                'events'     => $this->normalizeEvents($parsed['events'] ?? [], $game, $playerMap),
                'unresolved' => $parsed['unresolved'] ?? [],
                'summary'    => $parsed['summary'] ?? null,
            ];
        } catch (\Exception $e) {
            Log::error('PromptMatchResultService GPT call failed', ['error' => $e->getMessage()]);

            return ['events' => [], 'unresolved' => [], 'summary' => null];
        }
    }

    private function buildSystemPrompt(Game $game): string
    {
        $homeTeam   = $game->homeTeam;
        $awayTeam   = $game->awayTeam;
        $sessions   = $game->relationLoaded('sessions')
            ? $game->getRelation('sessions')->count()
            : (int) ($game->getAttribute('sessions') ?? 2);

        // Game properties
        $sport        = $game->sport_type ?? 'field_hockey';
        $sessionMin   = $game->session_duration_minutes ?? 35;
        $timerMode    = $game->timer_mode ?? 'ASC';
        $totalSecs    = $sessionMin * 60;
        $gameType     = $game->game_type ?? 'friendly';
        $gameDate     = $game->game_date?->format('Y-m-d') ?? 'N/A';
        $gameTime     = $game->game_time ?? 'N/A';
        $venue        = $game->venue ?? 'N/A';
        $officials    = $game->game_officials ?? 'N/A';
        $gameCode     = $game->code ?? 'N/A';
        $status       = $game->status ?? 'scheduled';
        $tournament   = $game->relationLoaded('tournament') ? ($game->tournament?->title ?? 'N/A') : 'N/A';
        $pool         = $game->relationLoaded('tournamentPool') ? ($game->tournamentPool?->name ?? 'N/A') : 'N/A';
        $knockoutRound = $game->knockout_round ?? null;

        $homeName = $homeTeam?->name ?? $game->team_a_name ?? 'Home';
        $awayName = $awayTeam?->name ?? $game->team_b_name ?? 'Away';
        $homeId   = $homeTeam?->id;
        $awayId   = $awayTeam?->id;

        $homeRoster = $this->formatRoster($homeTeam?->players ?? collect());
        $awayRoster = $this->formatRoster($awayTeam?->players ?? collect());

        $timerNote = $timerMode === 'DESC'
            ? "counts DOWN from {$sessionMin}:00 to 0:00 — elapsed = ({$totalSecs}s) − (displayed seconds). e.g. displayed 6:15 → elapsed = " . ($totalSecs - 375) . "s"
            : "counts UP from 0:00 — convert directly. e.g. 3:45 → 225s";

        $knockoutLine = $knockoutRound ? "\n  Knockout round : {$knockoutRound}" : '';

        return <<<PROMPT
You are a match data entry assistant for a {$sport} game management system.
Your job is to read a free-text match result description and extract structured game events.

GAME CONTEXT:
  Game ID        : {$game->id}
  Code           : {$gameCode}
  Sport          : {$sport}
  Game type      : {$gameType}{$knockoutLine}
  Tournament     : {$tournament}
  Pool           : {$pool}
  Date           : {$gameDate}
  Time           : {$gameTime}
  Venue          : {$venue}
  Officials      : {$officials}
  Status         : {$status}
  Sessions       : {$sessions} x {$sessionMin} min
  Timer mode     : {$timerMode} ({$timerNote})
  Home team      : {$homeName} (team_id: {$homeId})
  Away team      : {$awayName} (team_id: {$awayId})

HOME TEAM ROSTER (team_id: {$homeId}):
{$homeRoster}

AWAY TEAM ROSTER (team_id: {$awayId}):
{$awayRoster}

ALLOWED event_type values:
  goal          — a goal scored
  card          — a disciplinary card issued to a player
  penalty_corner — a penalty corner awarded to a team
  penalty_stroke — a penalty stroke awarded to a team
  highlight      — any notable moment (use for generic highlights)
  session_start  — start of a session/half/quarter (no team_id, no player)
  session_end    — end of a session/half/quarter (no team_id, no player)
  game_end       — final whistle / end of game (no team_id, no player)

ALLOWED goal_type values (only when event_type is "goal"):
  FG (field goal), PG (penalty goal), shootout

ALLOWED card_type values (only when event_type is "card"):
  green, yellow, red

EXTRACTION RULES:
1. Read the text naturally — it may be informal English like "Ali scored in the 12th minute of the first half".
2. Extract EVERY event mentioned — do not skip session starts, session ends, penalty corners, cards or goals.
3. For every session mentioned as started → emit a session_start event with timer_value_seconds: 0.
4. For every session mentioned as ended → emit a session_end event with timer_value_seconds equal to the full session duration in seconds.
5. For the final whistle / game end → emit a game_end event.
6. session_start, session_end, game_end events must have team_id: null and player_id: null.
7. Map player names and shirt numbers to entries in the rosters above.
8. player_id MUST be the integer shown as (player_id: X) in the roster — it is a database ID, NOT the shirt number.
9. player_shirt_number MUST be the #number shown at the start of the roster line — it is separate from player_id.
10. note MUST be set to the player's full name (as shown in the roster) whenever the event involves a player. Leave null only for events with no player (e.g. penalty_corner, session_start).
11. If a player is only mentioned by shirt number (e.g. "#7"), look up that number in the correct team's roster to get their player_id and name.
12. If a name cannot be matched to any roster entry, add a description to the "unresolved" array and set player_id to null.
13. Convert displayed times to timer_value_seconds using the Timer mode rule above. If no time is given, set null.
14. Infer session_number from context: "first half" / "H1" / "Q1" = 1, "second half" / "H2" / "Q2" = 2, etc.
15. For goals, always set goal_type; default to "FG" if unspecified.
16. For cards, always set card_type.
17. Preserve event order exactly as described in the text.
18. Do NOT invent events not mentioned in the text.

RESPOND ONLY with valid JSON in this exact structure — no extra text:
{
  "events": [
    {
      "team_id": <integer — team_id from roster>,
      "player_id": <integer|null — the (player_id: X) value from roster, NOT shirt number>,
      "player_shirt_number": <integer|null — the #number from roster, NOT player_id>,
      "session_number": <integer>,
      "event_type": "<string>",
      "goal_type": "<string|null>",
      "card_type": "<string|null>",
      "timer_value_seconds": <integer|null>,
      "note": "<player full name from roster, or null if no player>"
    }
  ],
  "unresolved": ["<description of each unmatched name or reference>"],
  "summary": "<one-line match result summary, e.g. Home 3–2 Away>"
}
PROMPT;
    }

    private function formatRoster(\Illuminate\Support\Collection $players): string
    {
        if ($players->isEmpty()) {
            return '  (no players registered)';
        }

        return $players->map(fn ($p) => sprintf(
            '  #%-3s %-30s (player_id: %d)',
            $p->pivot?->shirt_number ?? $p->shirt_number ?? '?',
            $p->name,
            $p->id
        ))->implode("\n");
    }

    /**
     * Build a lookup map: player_id => ['name' => ..., 'shirt_number' => ...]
     * Used to authoritatively override GPT's note and player_shirt_number.
     */
    private function buildPlayerMap(Game $game): array
    {
        $map = [];

        foreach ([$game->homeTeam, $game->awayTeam] as $team) {
            if (! $team) continue;
            foreach ($team->players as $player) {
                $map[$player->id] = [
                    'name'         => $player->name,
                    'shirt_number' => $player->pivot?->shirt_number ?? $player->shirt_number ?? null,
                ];
            }
        }

        return $map;
    }

    /**
     * Strip unknown fields, validate team IDs, and authoritatively set
     * player_shirt_number and note from the DB roster (not GPT's output).
     */
    private function normalizeEvents(array $events, Game $game, array $playerMap): array
    {
        $allowed      = ['team_id', 'player_id', 'player_shirt_number', 'session_number',
                         'event_type', 'goal_type', 'card_type', 'timer_value_seconds', 'note'];
        $validTeamIds = array_filter([$game->home_team_id, $game->away_team_id]);

        $noTeamTypes = ['session_start', 'session_end', 'game_end'];

        $filtered = array_filter(
            array_map(fn ($e) => array_intersect_key($e, array_flip($allowed)), $events),
            fn ($e) => !empty($e['event_type'])
                && (
                    in_array($e['event_type'], $noTeamTypes)          // session/game boundary — no team needed
                    || empty($e['team_id'])                           // team_id absent or null — allow through
                    || in_array($e['team_id'], $validTeamIds)         // valid team
                )
        );

        return array_values(array_map(function (array $e) use ($playerMap) {
            $playerId = isset($e['player_id']) ? (int) $e['player_id'] : null;

            if ($playerId && isset($playerMap[$playerId])) {
                // Authoritative values from DB — never trust GPT for these
                $e['player_shirt_number'] = $playerMap[$playerId]['shirt_number'];
                $e['note']                = $playerMap[$playerId]['name'];
            } else {
                $e['player_id']           = null;
                $e['player_shirt_number'] = null;
                // keep note as-is if GPT set something, otherwise null
                $e['note'] = $e['note'] ?? null;
            }

            return $e;
        }, $filtered));
    }
}
