<?php

namespace App\Http\Controllers;

use App\Actions\ContactPerson\SyncContactPersons;
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

    public function create(): Response
    {
        $clubs = Club::query()
            ->where('user_id', Auth::id())
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('Teams/Create', [
            'clubs' => ClubResource::collection($clubs),
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

    public function store(StoreTeamRequest $request, SyncContactPersons $syncContactPersons): RedirectResponse
    {
        $team = Team::create([
            'user_id' => Auth::id(),
            'club_id' => $request->input('club_id') ?: null,
            'name' => $request->string('name'),
            'type' => $request->string('type') ?: null,
            'coach' => $request->string('coach') ?: null,
            'manager' => $request->string('manager') ?: null,
            'email' => $request->string('email') ?: null,
            'phone' => $request->string('phone') ?: null,
            'description' => $request->string('description') ?: null,
            'is_registered' => true,
        ]);

        if ($request->hasFile('logo')) {
            $team->addMediaFromRequest('logo')->toMediaCollection('logo');
        }

        $syncContactPersons($team, $request->input('contact_persons', []));

        return redirect()->route('teams.show', $team)->with('success', 'Team registered. Add players next.');
    }

    public function storeForClub(StoreTeamRequest $request, Club $club, SyncContactPersons $syncContactPersons): RedirectResponse
    {
        $this->ensureAccess($club);

        $team = Team::create([
            'user_id' => Auth::id(),
            'club_id' => $club->id,
            'name' => $request->string('name'),
            'type' => $request->string('type') ?: null,
            'coach' => $request->string('coach') ?: null,
            'manager' => $request->string('manager') ?: null,
            'email' => $request->string('email') ?: null,
            'phone' => $request->string('phone') ?: null,
            'description' => $request->string('description') ?: null,
            'is_registered' => true,
        ]);

        if ($request->hasFile('logo')) {
            $team->addMediaFromRequest('logo')->toMediaCollection('logo');
        }

        $syncContactPersons($team, $request->input('contact_persons', []));

        return redirect()->route('teams.show', $team)->with('success', 'Team registered. Add players next.');
    }

    public function show(Team $team): Response
    {
        $team->load([
            'media',
            'club',
            'players' => fn ($q) => $q->orderBy('shirt_number')->orderBy('name'),
            'contactPersons',
        ]);

        return Inertia::render('Teams/Show', [
            'team' => TeamResource::make($team),
        ]);
    }

    public function edit(Team $team): Response
    {
        $this->ensureAccess($team);

        $team->load(['contactPersons', 'club']);

        $clubs = Club::query()
            ->where('user_id', Auth::id())
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('Teams/Edit', [
            'team' => TeamResource::make($team),
            'clubs' => ClubResource::collection($clubs),
            'teamTypes' => Team::TYPES,
        ]);
    }

    public function update(UpdateTeamRequest $request, Team $team, SyncContactPersons $syncContactPersons): RedirectResponse
    {
        $this->ensureAccess($team);

        $team->update([
            'club_id' => $request->input('club_id') ?: null,
            'name' => $request->string('name'),
            'type' => $request->string('type') ?: null,
            'coach' => $request->string('coach') ?: null,
            'manager' => $request->string('manager') ?: null,
            'email' => $request->string('email') ?: null,
            'phone' => $request->string('phone') ?: null,
            'description' => $request->string('description') ?: null,
        ]);

        if ($request->boolean('remove_logo')) {
            $team->clearMediaCollection('logo');
        }

        if ($request->hasFile('logo')) {
            $team->clearMediaCollection('logo');
            $team->addMediaFromRequest('logo')->toMediaCollection('logo');
        }

        $syncContactPersons($team, $request->input('contact_persons', []));

        return redirect()->route('teams.show', $team)->with('success', 'Team updated.');
    }

    public function destroy(Team $team): RedirectResponse
    {
        $this->ensureAccess($team);

        $team->delete();

        return redirect()->route('teams.index')->with('success', 'Team deleted.');
    }

}
