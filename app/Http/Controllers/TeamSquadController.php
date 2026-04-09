<?php

namespace App\Http\Controllers;

use App\Models\Player;
use App\Models\Team;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TeamSquadController extends Controller
{
    /**
     * Return all players attached to the team (active + inactive pivot rows).
     */
    public function index(Team $team): JsonResponse
    {
        $players = $team->allPlayers()
            ->withInactive()
            ->orderByRaw('player_team.is_active DESC')
            ->orderByRaw('player_team.shirt_number ASC')
            ->orderBy('players.name')
            ->get(['players.id', 'players.name']);

        return response()->json([
            'id'      => $team->id,
            'name'    => $team->name,
            'players' => $players->map(fn ($p) => [
                'id'           => $p->id,
                'name'         => $p->name,
                'shirt_number' => $p->pivot->shirt_number,
                'is_active'    => (bool) $p->pivot->is_active,
            ]),
        ]);
    }

    /**
     * Bulk-update shirt numbers and active flags.
     * Unchecked players get shirt_number = null automatically.
     */
    public function update(Request $request, Team $team): JsonResponse
    {
        $validated = $request->validate([
            'players'                  => 'required|array',
            'players.*.player_id'      => 'required|integer|exists:players,id',
            'players.*.shirt_number'   => 'nullable|integer|min:1|max:999',
            'players.*.is_active'      => 'required|boolean',
        ]);

        foreach ($validated['players'] as $row) {
            $team->allPlayers()->updateExistingPivot($row['player_id'], [
                'shirt_number' => $row['is_active'] ? ($row['shirt_number'] ?: null) : null,
                'is_active'    => $row['is_active'],
            ]);
        }

        return response()->json(['success' => true]);
    }

    /**
     * Create a new player and attach them to the team.
     */
    public function store(Request $request, Team $team): JsonResponse
    {
        $validated = $request->validate([
            'name'         => 'required|string|max:100',
            'shirt_number' => 'nullable|integer|min:1|max:999',
        ]);

        $player = Player::create([
            'name'      => $validated['name'],
            'is_active' => true,
            'user_id'   => auth()->id(),
        ]);

        $team->allPlayers()->attach($player->id, [
            'shirt_number' => $validated['shirt_number'] ?? null,
            'is_active'    => true,
        ]);

        return response()->json([
            'id'           => $player->id,
            'name'         => $player->name,
            'shirt_number' => $validated['shirt_number'] ?? null,
            'is_active'    => true,
        ], 201);
    }

    /**
     * Attach an existing player to the team.
     */
    public function attach(Request $request, Team $team): JsonResponse
    {
        $validated = $request->validate([
            'player_id'    => 'required|integer|exists:players,id',
            'shirt_number' => 'nullable|integer|min:1|max:999',
        ]);

        if ($team->allPlayers()->withoutGlobalScopes()->where('players.id', $validated['player_id'])->exists()) {
            return response()->json(['message' => 'Player is already in this team.'], 422);
        }

        $player = Player::withoutGlobalScope('active')->findOrFail($validated['player_id']);

        $team->allPlayers()->attach($player->id, [
            'shirt_number' => $validated['shirt_number'] ?? null,
            'is_active'    => true,
        ]);

        return response()->json([
            'id'           => $player->id,
            'name'         => $player->name,
            'shirt_number' => $validated['shirt_number'] ?? null,
            'is_active'    => true,
        ], 201);
    }
}
