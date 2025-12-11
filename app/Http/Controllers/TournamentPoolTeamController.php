<?php

namespace App\Http\Controllers;

use App\Http\Requests\AssignTournamentTeamsRequest;
use App\Models\Tournament;
use App\Models\TournamentPool;
use App\Models\Team;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Arr;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class TournamentPoolTeamController extends Controller
{
    public function edit(Tournament $tournament): Response
    {
        $tournament->load('pools.teams');
        $teams = Team::where('is_registered', true)->orderBy('name')->get();

        return Inertia::render('Tournaments/AssignTeams', [
            'tournament' => $tournament,
            'teams' => $teams,
        ]);
    }

    public function update(AssignTournamentTeamsRequest $request, Tournament $tournament): RedirectResponse
    {
        $tournament->load('pools');
        $pools = $tournament->pools;
        $poolCount = $pools->count();
        $assignments = [];

        if ($request->boolean('randomize')) {
            $teamIds = array_values(array_unique(array_filter($request->input('team_ids', []))));
            shuffle($teamIds);
            $chunkSize = count($teamIds) / $poolCount;
            $chunks = array_chunk($teamIds, $chunkSize);

            foreach ($pools as $index => $pool) {
                $assignments[$pool->id] = $chunks[$index] ?? [];
            }
        } else {
            foreach ($request->input('pools', []) as $poolId => $teamIds) {
                $assignments[$poolId] = array_values(array_unique(array_filter($teamIds ?? [])));
            }
        }

        $this->syncAssignments($pools, $assignments);

        return redirect()->route('tournaments.show', $tournament)->with('success', 'Pools updated.');
    }

    private function syncAssignments(Collection $pools, array $assignments): void
    {
        foreach ($pools as $pool) {
            $teamIds = $assignments[$pool->id] ?? [];
            $pool->teams()->sync($teamIds);
        }
    }
}
