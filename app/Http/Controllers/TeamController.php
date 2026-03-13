<?php

namespace App\Http\Controllers;

use App\Actions\Teams\CreateTeamAction;
use App\Actions\Teams\DeleteTeamAction;
use App\Actions\Teams\GetClubsForTeamSelectAction;
use App\Actions\Teams\UpdateTeamAction;
use App\Http\Controllers\Concerns\EnsuresOwnership;
use App\Http\Requests\StoreTeamRequest;
use App\Http\Requests\UpdateTeamRequest;
use App\Models\Club;
use App\Models\Team;
use App\Http\Resources\ClubResource;
use App\Http\Resources\TeamResource;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class TeamController extends Controller
{
    use EnsuresOwnership;

    public function index(): Response
    {
        $query = Team::query()
            ->with([
                'media',
                'club',
                'players' => fn ($q) => $q->orderBy('shirt_number')->orderBy('name'),
                'contactPersons',
            ])
            ->orderBy('name');

        if (!request()->user()->is_admin) {
            $query = $query->where('user_id', Auth::id());
        }

        return Inertia::render('Teams/Index', [
            'teams' => TeamResource::collection($query->get()),
        ]);
    }

    public function create(GetClubsForTeamSelectAction $getClubs): Response
    {
        return Inertia::render('Teams/Create', [
            'clubs' => ClubResource::collection($getClubs->execute()),
            'teamTypes' => Team::TYPES,
        ]);
    }

    public function createForClub(Club $club): Response
    {
        $this->ensureAccess($club);

        return Inertia::render('Teams/Create', [
            'club' => ClubResource::make($club),
            'clubs' => ClubResource::collection(collect([$club])),
            'teamTypes' => Team::TYPES,
        ]);
    }

    public function store(StoreTeamRequest $request, CreateTeamAction $createTeam): RedirectResponse
    {
        $team = $createTeam->execute(
            $request->validated(),
            $request->hasFile('logo') ? $request->file('logo') : null
        );

        return redirect()->route('teams.show', $team)->with('success', 'Team registered. Add players next.');
    }

    public function storeForClub(StoreTeamRequest $request, Club $club, CreateTeamAction $createTeam): RedirectResponse
    {
        $this->ensureAccess($club);

        $data = array_merge($request->validated(), ['club_id' => $club->id]);
        $team = $createTeam->execute(
            $data,
            $request->hasFile('logo') ? $request->file('logo') : null
        );

        return redirect()->route('teams.show', $team)->with('success', 'Team registered. Add players next.');
    }

    public function show(Team $team): Response
    {
        $team->load([
            'media',
            'club',
            'allPlayers' => fn ($q) => $q->withInactive()->orderBy('shirt_number')->orderBy('name'),
            'allPlayers.media',
            'contactPersons',
        ]);

        return Inertia::render('Teams/Show', [
            'team' => TeamResource::make($team),
        ]);
    }

    public function edit(Team $team, GetClubsForTeamSelectAction $getClubs): Response
    {
        $this->ensureAccess($team);

        $team->load(['contactPersons', 'club']);

        return Inertia::render('Teams/Edit', [
            'team' => TeamResource::make($team),
            'clubs' => ClubResource::collection($getClubs->execute()),
            'teamTypes' => Team::TYPES,
        ]);
    }

    public function update(UpdateTeamRequest $request, Team $team, UpdateTeamAction $updateTeam): RedirectResponse
    {
        $this->ensureAccess($team);

        $updateTeam->execute(
            $team,
            $request->validated(),
            $request->hasFile('logo') ? $request->file('logo') : null
        );

        return redirect()->route('teams.show', $team)->with('success', 'Team updated.');
    }

    public function destroy(Team $team, DeleteTeamAction $deleteTeam): RedirectResponse
    {
        $this->ensureAccess($team);

        $deleteTeam->execute($team);

        return redirect()->route('teams.index')->with('success', 'Team deleted.');
    }

    public function publicProfile(string $uid): Response
    {
        $team = Team::where('uid', $uid)->firstOrFail();

        $team->load([
            'media',
            'club.media',
            'club.addresses.country',
            'players' => fn ($q) => $q->orderBy('shirt_number')->orderBy('name'),
            'players.media',
            'contactPersons',
        ]);

        return Inertia::render('Teams/PublicProfile', [
            'team' => TeamResource::make($team),
        ]);
    }
}
