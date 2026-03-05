<?php

namespace App\Http\Controllers;

use App\Http\Requests\AssignTournamentTeamsRequest;
use App\Http\Resources\TeamResource;
use App\Http\Resources\TournamentResource;
use App\Models\Tournament;
use App\Models\Team;
use Illuminate\Support\Facades\Auth;
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

        $teams = Team::query()->orderBy('name');

        if (!request()->user()->is_admin) {
            $teams = $teams->where('user_id', Auth::id());
        }

        $teams = $teams->get();

        return Inertia::render('Tournaments/AssignTeams', [
            'tournament' => TournamentResource::make($tournament),
            'teams' => TeamResource::collection($teams),
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
            $poolIds = $pools->pluck('id')->values()->all();
            foreach ($poolIds as $poolId) {
                $assignments[$poolId] = [];
            }
            foreach ($teamIds as $index => $teamId) {
                $targetPoolId = $poolIds[$index % $poolCount];
                $assignments[$targetPoolId][] = $teamId;
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
