<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePlayerRequest;
use App\Http\Requests\UpdatePlayerRequest;
use App\Models\Player;
use App\Models\Team;
use App\Http\Resources\PlayerResource;
use App\Http\Resources\TeamResource;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PlayerController extends Controller
{
    public function create(Team $team): Response
    {
        $this->ensureTeamAccess($team);

        return Inertia::render('Players/Create', [
            'team' => TeamResource::make($team),
        ]);
    }

    public function edit(Team $team, Player $player): Response
    {
        $this->ensureTeamAccess($team);
        abort_unless($player->team_id === $team->id, 404);

        $player->load(['addresses', 'media']);

        return Inertia::render('Players/Edit', [
            'team' => TeamResource::make($team),
            'player' => PlayerResource::make($player),
        ]);
    }

    public function store(StorePlayerRequest $request, Team $team): RedirectResponse
    {
        $this->ensureTeamAccess($team);

        $player = $team->players()->create([
            'registered_player_id' => null,
            'name' => $request->string('name'),
            'shirt_number' => $request->integer('shirt_number'),
            'player_pass_number' => $this->resolvePassNumber($request->input('player_pass_number')),
            'nic_number' => $request->string('nic_number') ?: null,
            'date_of_birth' => $request->date('date_of_birth') ?: null,
            'is_active' => $request->boolean('is_active', true),
        ]);

        $address = $request->input('address', []);
        if ($this->shouldStoreAddress($address)) {
            $player->addAddress([
                'street' => $address['street'],
                'street_extra' => $address['street_extra'] ?? null,
                'city' => $address['city'],
                'state' => $address['state'] ?? null,
                'post_code' => $address['post_code'],
                // Fallback when no country lookup table is seeded yet.
                'country_id' => $address['country_id'] ?? 0,
            ]);
        }

        if ($request->hasFile('photo')) {
            $player
                ->addMediaFromRequest('photo')
                ->preservingOriginal()
                ->toMediaCollection('photo');
        }

        return redirect()->route('teams.show', $team)->with('success', 'Player added.');
    }

    public function update(UpdatePlayerRequest $request, Team $team, Player $player): RedirectResponse
    {
        $this->ensureTeamAccess($team);
        abort_unless($player->team_id === $team->id, 404);

        $player->update([
            'name' => $request->string('name'),
            'shirt_number' => $request->integer('shirt_number'),
            'player_pass_number' => $this->resolvePassNumber($request->input('player_pass_number'), $player),
            'nic_number' => $request->string('nic_number') ?: null,
            'date_of_birth' => $request->date('date_of_birth') ?: null,
            'is_active' => $request->boolean('is_active', true),
        ]);

        $address = $request->input('address', []);
        $existingAddress = $player->addresses()->first();

        if ($this->shouldStoreAddress($address)) {
            $payload = [
                'street' => $address['street'],
                'street_extra' => $address['street_extra'] ?? null,
                'city' => $address['city'],
                'state' => $address['state'] ?? null,
                'post_code' => $address['post_code'],
                'country_id' => $address['country_id'] ?? 0,
            ];

            if ($existingAddress) {
                $player->updateAddress($existingAddress, $payload);
            } else {
                $player->addAddress($payload);
            }
        } elseif ($existingAddress) {
            $player->flushAddresses();
        }

        if ($request->hasFile('photo')) {
            $player->clearMediaCollection('photo');
            $player
                ->addMediaFromRequest('photo')
                ->preservingOriginal()
                ->toMediaCollection('photo');
        }

        return redirect()->route('teams.show', $team)->with('success', 'Player updated.');
    }

    public function destroy(Team $team, Player $player): RedirectResponse
    {
        $this->ensureTeamAccess($team);
        abort_unless($player->team_id === $team->id, 404);

        $player->delete();

        return redirect()->route('teams.show', $team)->with('success', 'Player removed.');
    }

    private function ensureTeamAccess(Team $team): void
    {
        abort_unless($team->user_id === Auth::id(), 403);
    }

    private function resolvePassNumber(?string $value, ?Player $current = null): string
    {
        $candidate = $value ?: $this->generatePassNumber();
        while (
            Player::where('player_pass_number', $candidate)
                ->when($current?->id, fn ($q) => $q->where('id', '!=', $current->id))
                ->exists()
        ) {
            $candidate = $this->generatePassNumber();
        }

        return $candidate;
    }

    private function generatePassNumber(): string
    {
        return Str::upper(Str::random(6));
    }

    private function shouldStoreAddress(array $address): bool
    {
        if (empty($address)) {
            return false;
        }

        $street = $address['street'] ?? null;
        $city = $address['city'] ?? null;
        $post = $address['post_code'] ?? null;

        return $street && $city && $post && strlen($post) >= 4;
    }
}
