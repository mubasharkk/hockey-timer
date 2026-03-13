<?php

namespace App\Http\Controllers;

use App\Models\Player;
use App\Models\Team;
use App\Http\Resources\PlayerResource;
use App\Http\Resources\TeamResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class TeamPlayerController extends Controller
{
    /**
     * Show the page to add a player to the team.
     */
    public function create(Team $team): Response
    {
        $this->ensureTeamAccess($team);

        return Inertia::render('Teams/Players/Add', [
            'team' => TeamResource::make($team),
        ]);
    }

    /**
     * Search for players to add to a team.
     */
    public function search(Team $team, Request $request): JsonResponse
    {
        $this->ensureTeamAccess($team);

        $query = $request->input('q', '');

        if (strlen($query) < 2) {
            return response()->json([]);
        }

        // Get players not already in this team
        $existingPlayerIds = $team->allPlayers()->pluck('players.id');

        $players = Player::search($query)
            ->whereNotIn('id', $existingPlayerIds)
            ->with('media')
            ->limit(10)
            ->get();

        return response()->json(PlayerResource::collection($players));
    }

    /**
     * Add a player to the team.
     */
    public function store(Team $team, Request $request): RedirectResponse
    {
        $this->ensureTeamAccess($team);

        $request->validate([
            'player_id' => ['required', 'exists:players,id'],
            'shirt_number' => ['nullable', 'integer', 'min:1', 'max:99'],
        ]);

        $playerId = $request->input('player_id');
        $shirtNumber = $request->input('shirt_number');

        // Check if player already in team
        if ($team->allPlayers()->where('players.id', $playerId)->exists()) {
            return back()->withErrors(['player_id' => 'Player is already in this team.']);
        }

        // Check if shirt number is taken in this team
        if ($shirtNumber && $team->allPlayers()->wherePivot('shirt_number', $shirtNumber)->exists()) {
            return back()->withErrors(['shirt_number' => 'This shirt number is already taken in this team.']);
        }

        $team->allPlayers()->attach($playerId, [
            'shirt_number' => $shirtNumber,
            'is_active' => true,
        ]);

        return redirect()
            ->route('teams.show', $team)
            ->with('success', 'Player added to team.');
    }

    /**
     * Update a player's details in the team (shirt number, status).
     */
    public function update(Team $team, Player $player, Request $request): RedirectResponse
    {
        $this->ensureTeamAccess($team);

        $request->validate([
            'shirt_number' => ['nullable', 'integer', 'min:1', 'max:99'],
            'is_active' => ['boolean'],
        ]);

        $shirtNumber = $request->input('shirt_number');

        // Check if shirt number is taken by another player in this team
        if ($shirtNumber) {
            $taken = $team->allPlayers()
                ->wherePivot('shirt_number', $shirtNumber)
                ->where('players.id', '!=', $player->id)
                ->exists();

            if ($taken) {
                return back()->withErrors(['shirt_number' => 'This shirt number is already taken in this team.']);
            }
        }

        $team->allPlayers()->updateExistingPivot($player->id, [
            'shirt_number' => $shirtNumber,
            'is_active' => $request->boolean('is_active', true),
        ]);

        return back()->with('success', 'Player updated.');
    }

    /**
     * Remove a player from the team.
     */
    public function destroy(Team $team, Player $player): RedirectResponse
    {
        $this->ensureTeamAccess($team);

        $team->allPlayers()->detach($player->id);

        return redirect()
            ->route('teams.show', $team)
            ->with('success', 'Player removed from team.');
    }

    private function ensureTeamAccess(Team $team): void
    {
        abort_unless($team->user_id === Auth::id(), 403);
    }
}
