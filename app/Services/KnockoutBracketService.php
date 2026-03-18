<?php

namespace App\Services;

use App\Models\Game;
use App\Models\Team;
use App\Models\Tournament;

class KnockoutBracketService
{
    /**
     * Sync a game into its bracket slot in the tournament JSON.
     */
    public function syncBracketSlot(Game $game): void
    {
        if ($game->game_type !== 'knockout' || !$game->tournament_id || !$game->knockout_round || !$game->knockout_position) {
            return;
        }

        $tournament = Tournament::find($game->tournament_id);
        if (!$tournament) {
            return;
        }

        $bracket = $tournament->knockout_bracket ?? ['rounds' => []];
        $roundIndex = $this->findRoundIndex($bracket, $game->knockout_round);

        if ($roundIndex === null) {
            return;
        }

        $matchups = &$bracket['rounds'][$roundIndex]['matchups'];
        $slotIndex = $this->findSlotIndex($matchups, $game->knockout_position);

        if ($slotIndex === null) {
            $matchups[] = $this->buildSlot($game);
        } else {
            $home = $game->home_team_id ? Team::find($game->home_team_id) : null;
            $away = $game->away_team_id ? Team::find($game->away_team_id) : null;
            $scores = $game->getGoalCounts();
            $shootout = $this->getShootoutCounts($game);

            $matchups[$slotIndex]['game_id'] = $game->id;
            $matchups[$slotIndex]['home_team_id'] = $game->home_team_id;
            $matchups[$slotIndex]['home_team_name'] = $home?->name;
            $matchups[$slotIndex]['home_team_uid'] = $home?->uid;
            $matchups[$slotIndex]['home_team_logo'] = $home?->logo_url;
            $matchups[$slotIndex]['home_score'] = $scores['home'];
            $matchups[$slotIndex]['home_shootout'] = $shootout['home'];
            $matchups[$slotIndex]['away_team_id'] = $game->away_team_id;
            $matchups[$slotIndex]['away_team_name'] = $away?->name;
            $matchups[$slotIndex]['away_team_uid'] = $away?->uid;
            $matchups[$slotIndex]['away_team_logo'] = $away?->logo_url;
            $matchups[$slotIndex]['away_score'] = $scores['away'];
            $matchups[$slotIndex]['away_shootout'] = $shootout['away'];
            $matchups[$slotIndex]['game_status'] = $game->status;
            $matchups[$slotIndex]['game_excerpt'] = $game->excerpt;
            $matchups[$slotIndex]['game_started_at'] = $game->started_at?->toIso8601String();
        }

        // Remove rounds with no games and 3rd place if no game
        $bracket['rounds'] = array_filter($bracket['rounds'], function ($round) {
            return !empty($round['matchups']);
        });

        $tournament->updateQuietly(['knockout_bracket' => $bracket]);
    }

    /**
     * Determine the winner and propagate to the next round slot.
     */
    public function advanceWinner(Game $game): void
    {
        if ($game->game_type !== 'knockout' || !$game->tournament_id) {
            return;
        }

        $tournament = Tournament::find($game->tournament_id);
        if (!$tournament) {
            return;
        }

        $bracket = $tournament->knockout_bracket ?? ['rounds' => []];
        $roundIndex = $this->findRoundIndex($bracket, $game->knockout_round);

        if ($roundIndex === null) {
            return;
        }

        $matchups = &$bracket['rounds'][$roundIndex]['matchups'];
        $slotIndex = $this->findSlotIndex($matchups, $game->knockout_position);

        if ($slotIndex === null) {
            return;
        }

        $scores = $game->getGoalCounts();
        $winnerId = $scores['home'] > $scores['away'] ? $game->home_team_id : (
            $scores['away'] > $scores['home'] ? $game->away_team_id : null
        );

        $matchups[$slotIndex]['winner_team_id'] = $winnerId;

        if ($winnerId) {
            $this->propagateToNextRound($bracket, $game, $winnerId);
        }

        $loserId = null;
        if ($winnerId && $game->home_team_id && $game->away_team_id) {
            $loserId = $winnerId === $game->home_team_id ? $game->away_team_id : $game->home_team_id;
        }

        if ($loserId) {
            $this->propagateLoserTo3rdPlace($bracket, $game, $loserId);
        }

        $tournament->updateQuietly(['knockout_bracket' => $bracket]);
    }

    /**
     * Remove a game from the bracket.
     */
    public function removeFromBracket(Game $game): void
    {
        if ($game->game_type !== 'knockout' || !$game->tournament_id) {
            return;
        }

        $tournament = Tournament::find($game->tournament_id);
        if (!$tournament) {
            return;
        }

        $bracket = $tournament->knockout_bracket ?? ['rounds' => []];
        $changed = false;

        foreach ($bracket['rounds'] as &$round) {
            foreach ($round['matchups'] as &$matchup) {
                if (($matchup['game_id'] ?? null) === $game->id) {
                    $matchup['game_id'] = null;
                    $matchup['winner_team_id'] = null;
                    $changed = true;
                }
            }
        }

        if ($changed) {
            $tournament->updateQuietly(['knockout_bracket' => $bracket]);
        }
    }

    /**
     * Rebuild entire bracket from all knockout games in a tournament.
     */
    public function rebuildBracket(Tournament $tournament): void
    {
        $games = Game::where('tournament_id', $tournament->id)
            ->where('game_type', 'knockout')
            ->orderBy('knockout_round')
            ->orderBy('knockout_position')
            ->get();

        // Build fresh bracket structure from tournament rounds config
        $bracket = ['rounds' => []];

        // Get existing round keys from tournament or use defaults
        $roundKeys = ['round_of_16', 'quarterfinal', 'semifinal', 'final', '3rd_place'];

        foreach ($roundKeys as $key) {
            $bracket['rounds'][] = [
                'key' => $key,
                'label' => $this->formatRoundLabel($key),
                'matchups' => [],
            ];
        }

        // Populate with games
        foreach ($games as $game) {
            $roundIndex = $this->findRoundIndex($bracket, $game->knockout_round);
            if ($roundIndex === null) {
                continue;
            }

            $matchups = &$bracket['rounds'][$roundIndex]['matchups'];
            $slotIndex = $this->findSlotIndex($matchups, $game->knockout_position);

            if ($slotIndex === null) {
                $matchups[] = $this->buildSlot($game);
            } else {
                $home = $game->home_team_id ? Team::find($game->home_team_id) : null;
                $away = $game->away_team_id ? Team::find($game->away_team_id) : null;
                $scores = $game->getGoalCounts();
                $shootout = $this->getShootoutCounts($game);

                $matchups[$slotIndex]['game_id'] = $game->id;
                $matchups[$slotIndex]['home_team_id'] = $game->home_team_id;
                $matchups[$slotIndex]['home_team_name'] = $home?->name;
                $matchups[$slotIndex]['home_team_uid'] = $home?->uid;
                $matchups[$slotIndex]['home_team_logo'] = $home?->logo_url;
                $matchups[$slotIndex]['home_score'] = $scores['home'];
                $matchups[$slotIndex]['home_shootout'] = $shootout['home'];
                $matchups[$slotIndex]['away_team_id'] = $game->away_team_id;
                $matchups[$slotIndex]['away_team_name'] = $away?->name;
                $matchups[$slotIndex]['away_team_uid'] = $away?->uid;
                $matchups[$slotIndex]['away_team_logo'] = $away?->logo_url;
                $matchups[$slotIndex]['away_score'] = $scores['away'];
                $matchups[$slotIndex]['away_shootout'] = $shootout['away'];
                $matchups[$slotIndex]['game_status'] = $game->status;
                $matchups[$slotIndex]['game_excerpt'] = $game->excerpt;
                $matchups[$slotIndex]['game_started_at'] = $game->started_at?->toIso8601String();
            }
        }

        // Update winners from finished games
        foreach ($games as $game) {
            if ($game->status === 'finished') {
                $roundIndex = $this->findRoundIndex($bracket, $game->knockout_round);
                if ($roundIndex === null) {
                    continue;
                }

                $matchups = &$bracket['rounds'][$roundIndex]['matchups'];
                $slotIndex = $this->findSlotIndex($matchups, $game->knockout_position);

                if ($slotIndex !== null) {
                    $scores = $game->getGoalCounts();
                    $winnerId = $scores['home'] > $scores['away'] ? $game->home_team_id : (
                        $scores['away'] > $scores['home'] ? $game->away_team_id : null
                    );
                    $matchups[$slotIndex]['winner_team_id'] = $winnerId;
                }
            }
        }

        // Remove rounds with no games and 3rd place if no game
        $bracket['rounds'] = array_filter($bracket['rounds'], function ($round) {
            if ($round['key'] === '3rd_place') {
                return !empty($round['matchups']);
            }
            return !empty($round['matchups']);
        });

        $tournament->updateQuietly(['knockout_bracket' => $bracket]);
    }

    /**
     * Push the winner into the next round based on position convention.
     */
    private function propagateToNextRound(array &$bracket, Game $game, int $winnerId): void
    {
        $roundKeys = array_column($bracket['rounds'], 'key');
        $currentIndex = array_search($game->knockout_round, $roundKeys);

        if ($currentIndex === false) {
            return;
        }

        $nextRoundKey = $this->resolveNextRound($game->knockout_round);
        if (!$nextRoundKey) {
            return;
        }

        $nextRoundIndex = array_search($nextRoundKey, $roundKeys);
        if ($nextRoundIndex === false) {
            return;
        }

        $nextPosition = (int) ceil($game->knockout_position / 2);
        $slot = ($game->knockout_position % 2 !== 0) ? 'home_team_id' : 'away_team_id';

        $nextMatchups = &$bracket['rounds'][$nextRoundIndex]['matchups'];
        $nextSlotIndex = $this->findSlotIndex($nextMatchups, $nextPosition);

        if ($nextSlotIndex === null) {
            $nextMatchups[] = [
                'position' => $nextPosition,
                'game_id' => null,
                'home_label' => null,
                'away_label' => null,
                'home_team_id' => null,
                'away_team_id' => null,
                'home_score' => null,
                'away_score' => null,
                'winner_team_id' => null,
            ];
            $nextSlotIndex = array_key_last($nextMatchups);
        }

        $winner = Team::find($winnerId);
        $nameSlot = str_replace('_id', '_name', $slot);
        $uidSlot = str_replace('_id', '_uid', $slot);

        $nextMatchups[$nextSlotIndex][$slot] = $winnerId;
        $nextMatchups[$nextSlotIndex][$nameSlot] = $winner?->name;
        $nextMatchups[$nextSlotIndex][$uidSlot] = $winner?->uid;

        if ($nextMatchups[$nextSlotIndex]['game_id']) {
            Game::where('id', $nextMatchups[$nextSlotIndex]['game_id'])
                ->update([$slot => $winnerId]);
        }
    }

    /**
     * For semifinals, push the loser into the 3rd place match.
     */
    private function propagateLoserTo3rdPlace(array &$bracket, Game $game, int $loserId): void
    {
        if ($game->knockout_round !== 'semifinal') {
            return;
        }

        $roundKeys = array_column($bracket['rounds'], 'key');
        $thirdIndex = array_search('3rd_place', $roundKeys);

        if ($thirdIndex === false) {
            return;
        }

        $slot = ($game->knockout_position % 2 !== 0) ? 'home_team_id' : 'away_team_id';
        $matchups = &$bracket['rounds'][$thirdIndex]['matchups'];
        $slotIndex = $this->findSlotIndex($matchups, 1);

        if ($slotIndex === null) {
            $matchups[] = [
                'position' => 1,
                'game_id' => null,
                'home_label' => null,
                'away_label' => null,
                'home_team_id' => null,
                'away_team_id' => null,
                'home_score' => null,
                'away_score' => null,
                'winner_team_id' => null,
            ];
            $slotIndex = array_key_last($matchups);
        }

        $loser = Team::find($loserId);
        $nameSlot = str_replace('_id', '_name', $slot);
        $uidSlot = str_replace('_id', '_uid', $slot);

        $matchups[$slotIndex][$slot] = $loserId;
        $matchups[$slotIndex][$nameSlot] = $loser?->name;
        $matchups[$slotIndex][$uidSlot] = $loser?->uid;

        if ($matchups[$slotIndex]['game_id']) {
            Game::where('id', $matchups[$slotIndex]['game_id'])
                ->update([$slot => $loserId]);
        }
    }

    private function resolveNextRound(string $currentRound): ?string
    {
        $progression = [
            'round_of_16' => 'quarterfinal',
            'quarterfinal' => 'semifinal',
            'semifinal' => 'final',
        ];

        return $progression[$currentRound] ?? null;
    }

    private function findRoundIndex(array $bracket, string $roundKey): ?int
    {
        foreach ($bracket['rounds'] ?? [] as $i => $round) {
            if (($round['key'] ?? null) === $roundKey) {
                return $i;
            }
        }

        return null;
    }

    private function findSlotIndex(array $matchups, int $position): ?int
    {
        foreach ($matchups as $i => $m) {
            if (($m['position'] ?? null) === $position) {
                return $i;
            }
        }

        return null;
    }

    private function buildSlot(Game $game): array
    {
        $home = $game->home_team_id ? Team::find($game->home_team_id) : null;
        $away = $game->away_team_id ? Team::find($game->away_team_id) : null;
        $scores = $game->getGoalCounts();
        $shootout = $this->getShootoutCounts($game);

        return [
            'position' => $game->knockout_position,
            'game_id' => $game->id,
            'home_label' => null,
            'away_label' => null,
            'home_team_id' => $game->home_team_id,
            'home_team_name' => $home?->name,
            'home_team_uid' => $home?->uid,
            'home_team_logo' => $home?->logo_url,
            'home_score' => $scores['home'],
            'home_shootout' => $shootout['home'],
            'away_team_id' => $game->away_team_id,
            'away_team_name' => $away?->name,
            'away_team_uid' => $away?->uid,
            'away_team_logo' => $away?->logo_url,
            'away_score' => $scores['away'],
            'away_shootout' => $shootout['away'],
            'game_status' => $game->status,
            'game_excerpt' => $game->excerpt,
            'game_started_at' => $game->started_at?->toIso8601String(),
            'winner_team_id' => null,
        ];
    }

    private function formatRoundLabel(string $key): string
    {
        return match ($key) {
            'round_of_16' => 'Round of 16',
            'quarterfinal' => 'Quarter-Finals',
            'semifinal' => 'Semi-Finals',
            'final' => 'Final',
            '3rd_place' => '3rd Place',
            default => ucfirst($key),
        };
    }

    private function getShootoutCounts(Game $game): array
    {
        $homeCount = $game->events()
            ->where('event_type', 'goal')
            ->where('goal_type', 'shootout')
            ->where('team_id', $game->home_team_id)
            ->count();

        $awayCount = $game->events()
            ->where('event_type', 'goal')
            ->where('goal_type', 'shootout')
            ->where('team_id', $game->away_team_id)
            ->count();

        return [
            'home' => $homeCount,
            'away' => $awayCount,
        ];
    }
}
