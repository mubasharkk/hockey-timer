<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTeamRequest;
use App\Models\Team;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class TeamController extends Controller
{
    public function index(): Response
    {
        $teams = Team::query()
            ->where('is_registered', true)
            ->with(['players' => fn ($q) => $q->orderBy('shirt_number')->orderBy('name')])
            ->orderBy('name')
            ->get();

        return Inertia::render('Teams/Index', [
            'teams' => $teams,
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

        return redirect()->route('teams.show', $team)->with('success', 'Team registered. Add players next.');
    }

    public function show(Team $team): Response
    {
        abort_unless($team->is_registered, 404);

        $team->load(['players' => fn ($q) => $q->orderBy('shirt_number')->orderBy('name')]);

        return Inertia::render('Teams/Show', [
            'team' => $team,
        ]);
    }
}
