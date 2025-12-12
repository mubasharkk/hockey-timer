<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTournamentRequest;
use App\Http\Requests\UpdateTournamentRequest;
use App\Models\Tournament;
use App\Models\TournamentPool;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class TournamentController extends Controller
{
    public function index(): Response
    {
        $tournaments = Tournament::orderByDesc('id')->get();

        return Inertia::render('Tournaments/Index', [
            'tournaments' => $tournaments,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Tournaments/Create');
    }

    public function show(Tournament $tournament): Response
    {
        $tournament->load([
            'pools.teams',
            'games' => fn ($q) => $q->orderBy('game_date')->orderBy('game_time'),
        ]);

        return Inertia::render('Tournaments/Show', [
            'tournament' => $tournament,
        ]);
    }

    public function edit(Tournament $tournament): Response
    {
        $tournament->load('pools');

        return Inertia::render('Tournaments/Edit', [
            'tournament' => $tournament,
        ]);
    }

    public function store(StoreTournamentRequest $request): RedirectResponse
    {
        $title = $request->string('title');
        $slug = $request->string('slug') ?: $this->uniqueSlug($title, null, $request->input('start_date'));

        $tournament = Tournament::create([
            'user_id' => Auth::id(),
            'title' => $title,
            'slug' => $slug,
            'venue' => $request->string('venue'),
            'start_date' => $request->date('start_date'),
            'end_date' => $request->date('end_date') ?: null,
            'win_points' => $request->integer('win_points'),
            'draw_points' => $request->integer('draw_points'),
            'loss_points' => $request->integer('loss_points'),
        ]);

        if ($request->hasFile('logo')) {
            $tournament->clearMediaCollection('logo');
            $tournament->addMediaFromRequest('logo')->toMediaCollection('logo');
        }

        if ($request->hasFile('sponsor_logos')) {
            $tournament->clearMediaCollection('sponsor_logos');
            foreach ($request->file('sponsor_logos', []) as $file) {
                $tournament->addMedia($file)->toMediaCollection('sponsor_logos');
            }
        }

        $this->seedPools($tournament, (int) $request->input('pools_count', 1));

        return redirect()->route('tournaments.index')->with('success', 'Tournament created.');
    }

    public function update(UpdateTournamentRequest $request, Tournament $tournament): RedirectResponse
    {
        $title = $request->string('title');
        $slug = $request->string('slug') ?: $this->uniqueSlug($title, $tournament->id, $request->input('start_date'));

        $tournament->update([
            'title' => $title,
            'slug' => $slug,
            'venue' => $request->string('venue'),
            'start_date' => $request->date('start_date'),
            'end_date' => $request->date('end_date') ?: null,
            'win_points' => $request->integer('win_points'),
            'draw_points' => $request->integer('draw_points'),
            'loss_points' => $request->integer('loss_points'),
        ]);

        if ($request->hasFile('logo')) {
            $tournament->clearMediaCollection('logo');
            $tournament->addMediaFromRequest('logo')->toMediaCollection('logo');
        }

        if ($request->hasFile('sponsor_logos')) {
            $tournament->clearMediaCollection('sponsor_logos');
            foreach ($request->file('sponsor_logos', []) as $file) {
                $tournament->addMedia($file)->toMediaCollection('sponsor_logos');
            }
        }

        if ($request->filled('pools_count')) {
            $this->seedPools($tournament, (int) $request->input('pools_count'));
        }

        return redirect()->route('tournaments.index')->with('success', 'Tournament updated.');
    }

    public function destroy(Tournament $tournament): RedirectResponse
    {
        $tournament->delete();

        return redirect()->route('tournaments.index')->with('success', 'Tournament deleted.');
    }

    private function uniqueSlug(string $title, ?int $ignoreId = null, ?string $startDate = null): string
    {
        $suffix = $startDate
            ? \Illuminate\Support\Carbon::parse($startDate)->format('M-Y')
            : now()->format('M-Y');
        $base = Str::slug("{$title}-{$suffix}");
        $slug = $base;
        $i = 1;

        while (Tournament::where('slug', $slug)->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))->exists()) {
            $slug = "{$base}-{$i}";
            $i++;
        }

        return $slug;
    }

    private function seedPools(Tournament $tournament, int $count): void
    {
        $count = max(1, min($count, 26));
        $existing = $tournament->pools()->count();

        if ($existing >= $count) {
            return;
        }

        for ($i = $existing; $i < $count; $i++) {
            $name = chr(65 + $i); // A, B, C...
            TournamentPool::firstOrCreate(
                ['tournament_id' => $tournament->id, 'order' => $i],
                ['name' => $name]
            );
        }
    }
}
