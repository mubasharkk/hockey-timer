<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTeamRequest;
use App\Http\Requests\UpdateTeamRequest;
use App\Models\Team;
use App\Http\Resources\TeamResource;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class TeamController extends Controller
{
    public function index(): Response
    {
        $teams = Team::query()
            ->where('user_id', Auth::id())
            ->with([
                'media',
                'players' => fn ($q) => $q->orderBy('shirt_number')->orderBy('name'),
            ])
            ->orderBy('name')
            ->get();

        return Inertia::render('Teams/Index', [
            'teams' => TeamResource::collection($teams),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Teams/Create');
    }

    public function store(StoreTeamRequest $request): RedirectResponse
    {
        $team = Team::create([
            'user_id' => Auth::id(),
            'name' => $request->string('name'),
            'coach' => $request->string('coach') ?: null,
            'manager' => $request->string('manager') ?: null,
            'is_registered' => true,
        ]);

        if ($request->hasFile('logo')) {
            $team
                ->addMediaFromRequest('logo')
                ->toMediaCollection('logo');
        }

        return redirect()->route('teams.show', $team)->with('success', 'Team registered. Add players next.');
    }

    public function show(Team $team): Response
    {
        $team->load([
            'media',
            'players' => fn ($q) => $q->orderBy('shirt_number')->orderBy('name'),
        ]);

        return Inertia::render('Teams/Show', [
            'team' => TeamResource::make($team),
        ]);
    }

    public function edit(Team $team): Response
    {
        $this->ensureManageable($team);

        return Inertia::render('Teams/Edit', [
            'team' => TeamResource::make($team),
        ]);
    }

    public function update(UpdateTeamRequest $request, Team $team): RedirectResponse
    {
        $this->ensureManageable($team);

        $team->update([
            'name' => $request->string('name'),
            'coach' => $request->string('coach') ?: null,
            'manager' => $request->string('manager') ?: null,
        ]);

        if ($request->boolean('remove_logo')) {
            $team->clearMediaCollection('logo');
        }

        if ($request->hasFile('logo')) {
            $team->clearMediaCollection('logo');
            $team
                ->addMediaFromRequest('logo')
                ->toMediaCollection('logo');
        }

        return redirect()->route('teams.show', $team)->with('success', 'Team updated.');
    }

    public function destroy(Team $team): RedirectResponse
    {
        $this->ensureManageable($team);

        $team->delete();

        return redirect()->route('teams.index')->with('success', 'Team deleted.');
    }

    private function ensureManageable(Team $team): void
    {
        abort_unless($team->user_id === Auth::id(), 403);
    }
}
