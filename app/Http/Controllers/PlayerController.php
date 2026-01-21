<?php

namespace App\Http\Controllers;

use App\Http\Requests\ScanPlayerIdRequest;
use App\Http\Requests\StorePlayerRequest;
use App\Http\Requests\UpdatePlayerRequest;
use App\Models\Player;
use App\Models\Team;
use App\Models\Event;
use App\Http\Resources\PlayerResource;
use App\Http\Resources\TeamResource;
use App\Http\Resources\GameResource;
use App\Services\IdDocumentService;
use App\Services\ImageService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PlayerController extends Controller
{
    public function __construct(
        private readonly IdDocumentService $idDocumentService,
        private readonly ImageService $imageService
    ) {}

    /**
     * Step 1: Show the ID document scan page.
     */
    public function scan(Team $team): Response
    {
        $this->ensureTeamAccess($team);

        return Inertia::render('Players/Scan', [
            'team' => TeamResource::make($team),
        ]);
    }

    /**
     * Step 1b: Process the scanned ID documents and create player.
     */
    public function processScan(ScanPlayerIdRequest $request, Team $team): RedirectResponse
    {
        $this->ensureTeamAccess($team);

        $files = $request->file('id_documents');

        // Fix image orientation before processing
        $processedFiles = $this->imageService->processMultiple($files);

        // Extract data from ID documents (supports 1-2 files)
        $extractedData = $this->idDocumentService->extractFromDocuments($processedFiles);

        // Create player with extracted data
        $player = $team->players()->create([
            'registered_player_id' => null,
            'name' => $extractedData['name'] ?? 'New Player',
            'shirt_number' => null,
            'player_pass_number' => $this->resolvePassNumber(null),
            'nic_number' => $extractedData['nic_number'] ?? null,
            'date_of_birth' => $extractedData['date_of_birth'] ?? null,
            'is_active' => true,
        ]);

        // Store address if extracted
        $address = $extractedData['address'] ?? [];
        if ($this->shouldStoreAddress($address)) {
            $player->addAddress([
                'street' => $address['street'],
                'street_extra' => null,
                'city' => $address['city'],
                'state' => $address['state'] ?? null,
                'post_code' => $address['post_code'],
                'country_id' => 0,
            ]);
        }

        // Store the ID documents as media (with fixed orientation)
        foreach ($processedFiles as $file) {
            $player
                ->addMedia($file->getRealPath())
                ->usingFileName($file->getClientOriginalName())
                ->preservingOriginal()
                ->toMediaCollection('id_document');
        }

        $message = $extractedData['extracted']
            ? 'Player created from ID document(s). Please review and complete the details.'
            : 'Player created. ID scan could not extract data - please fill in manually.';

        return redirect()
            ->route('teams.players.edit', [$team, $player])
            ->with('success', $message)
            ->with('extracted_confidence', $extractedData['confidence'] ?? null);
    }

    /**
     * Step 2: Show the create form (manual entry or continue without ID).
     */
    public function create(Team $team): Response
    {
        $this->ensureTeamAccess($team);

        return Inertia::render('Players/Create', [
            'team' => TeamResource::make($team),
        ]);
    }

    public function show(Player $player): Response
    {
        // Load player with relationships
        $player->load(['addresses', 'media', 'team']);

        // Find all player records for the same person (by registered_player_id or player_pass_number)
        $relatedPlayerIds = $this->getRelatedPlayerIds($player);

        // Get all teams this player belongs to
        $teams = Team::whereHas('players', function ($query) use ($relatedPlayerIds) {
            $query->whereIn('id', $relatedPlayerIds);
        })
            ->with(['players' => function ($q) use ($relatedPlayerIds) {
                $q->whereIn('id', $relatedPlayerIds);
            }, 'media'])
            ->get();

        // Get player statistics across all teams
        $statistics = $this->getPlayerStatistics($player, $relatedPlayerIds);

        // Get recent games where player participated
        $recentGames = $this->getRecentGames($player, $relatedPlayerIds);

        // Get player events
        $events = $this->getPlayerEvents($player, $relatedPlayerIds);

        return Inertia::render('Players/Show', [
            'player' => PlayerResource::make($player),
            'teams' => TeamResource::collection($teams),
            'statistics' => $statistics,
            'recentGames' => GameResource::collection($recentGames),
            'events' => $events,
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

    private function getRelatedPlayerIds(Player $player): array
    {
        $ids = [$player->id];

        // Find players with the same registered_player_id
        if ($player->registered_player_id) {
            $related = Player::where('registered_player_id', $player->registered_player_id)
                ->pluck('id')
                ->toArray();
            $ids = array_merge($ids, $related);
        }

        // Also find players with the same player_pass_number (if it exists and is unique)
        if ($player->player_pass_number) {
            $related = Player::where('player_pass_number', $player->player_pass_number)
                ->pluck('id')
                ->toArray();
            $ids = array_merge($ids, $related);
        }

        return array_unique($ids);
    }

    private function getPlayerStatistics(Player $player, array $relatedPlayerIds): array
    {
        // Get all teams for related players
        $teamIds = Player::whereIn('id', $relatedPlayerIds)
            ->pluck('team_id')
            ->unique()
            ->toArray();

        // Get shirt numbers for this player across all teams
        $shirtNumbers = Player::whereIn('id', $relatedPlayerIds)
            ->whereNotNull('shirt_number')
            ->pluck('shirt_number')
            ->unique()
            ->toArray();

        if (empty($shirtNumbers) || empty($teamIds)) {
            return [
                'goals' => 0,
                'yellow_cards' => 0,
                'red_cards' => 0,
                'green_cards' => 0,
                'penalty_corners' => 0,
                'penalty_strokes' => 0,
                'total_games' => 0,
            ];
        }

        // Get events for this player across all teams and shirt numbers
        $events = Event::whereIn('team_id', $teamIds)
            ->whereIn('player_shirt_number', $shirtNumbers)
            ->get();

        return [
            'goals' => $events->where('event_type', 'goal')->count(),
            'yellow_cards' => $events->where('event_type', 'card')->where('card_type', 'yellow')->count(),
            'red_cards' => $events->where('event_type', 'card')->where('card_type', 'red')->count(),
            'green_cards' => $events->where('event_type', 'card')->where('card_type', 'green')->count(),
            'penalty_corners' => $events->where('event_type', 'penalty_corner')->count(),
            'penalty_strokes' => $events->where('event_type', 'penalty_stroke')->count(),
            'total_games' => $events->pluck('game_id')->unique()->count(),
        ];
    }

    private function getRecentGames(Player $player, array $relatedPlayerIds): \Illuminate\Database\Eloquent\Collection
    {
        // Get all teams for related players
        $teamIds = Player::whereIn('id', $relatedPlayerIds)
            ->pluck('team_id')
            ->unique()
            ->toArray();

        // Get shirt numbers for this player across all teams
        $shirtNumbers = Player::whereIn('id', $relatedPlayerIds)
            ->whereNotNull('shirt_number')
            ->pluck('shirt_number')
            ->unique()
            ->toArray();

        if (empty($shirtNumbers) || empty($teamIds)) {
            return collect();
        }

        $gameIds = Event::whereIn('team_id', $teamIds)
            ->whereIn('player_shirt_number', $shirtNumbers)
            ->pluck('game_id')
            ->unique();

        return \App\Models\Game::whereIn('id', $gameIds)
            ->with('tournament:id,title')
            ->orderBy('game_date', 'desc')
            ->orderBy('game_time', 'desc')
            ->limit(10)
            ->get([
                'id',
                'team_a_name',
                'team_b_name',
                'tournament_id',
                'venue',
                'sport_type',
                'code',
                'game_date',
                'game_time',
                'status',
                'ended_at',
            ]);
    }

    private function getPlayerEvents(Player $player, array $relatedPlayerIds): \Illuminate\Http\Resources\Json\AnonymousResourceCollection
    {
        // Get all teams for related players
        $teamIds = Player::whereIn('id', $relatedPlayerIds)
            ->pluck('team_id')
            ->unique()
            ->toArray();

        // Get shirt numbers for this player across all teams
        $shirtNumbers = Player::whereIn('id', $relatedPlayerIds)
            ->whereNotNull('shirt_number')
            ->pluck('shirt_number')
            ->unique()
            ->toArray();

        if (empty($shirtNumbers) || empty($teamIds)) {
            return \App\Http\Resources\EventResource::collection(collect());
        }

        $events = Event::whereIn('team_id', $teamIds)
            ->whereIn('player_shirt_number', $shirtNumbers)
            ->with(['game:id,team_a_name,team_b_name,home_team_id,away_team_id,game_date,game_time,code', 'team:id,name'])
            ->orderBy('occurred_at', 'desc')
            ->limit(50)
            ->get();

        return \App\Http\Resources\EventResource::collection($events);
    }
}
