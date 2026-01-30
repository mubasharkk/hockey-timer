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
use Inertia\Inertia;
use Inertia\Response;
use Webpatser\Countries\Countries;
use App\Http\Controllers\Concerns\EnsuresOwnership;

class PlayerController extends Controller
{
    use EnsuresOwnership;
    public function __construct(
        private readonly IdDocumentService $idDocumentService,
        private readonly ImageService $imageService
    ) {}

    /**
     * Display a listing of players.
     */
    public function index(): Response
    {
        $query = Player::with(['teams', 'media'])
            ->latest();

        if (!backpack_user()?->is_admin) {
            $query->where('user_id', Auth::id());
        }

        return Inertia::render('Players/Index', [
            'players' => PlayerResource::collection($query->paginate(20)),
        ]);
    }

    /**
     * Step 1: Show the ID document scan page.
     */
    public function scan(): Response
    {
        return Inertia::render('Players/Scan');
    }

    /**
     * Step 1b: Process the scanned ID documents and create player.
     */
    public function processScan(ScanPlayerIdRequest $request): RedirectResponse
    {
        $files = $request->file('id_documents');
        $additionalInfo = $request->input('additional_info');

        // Fix image orientation before processing
        $processedFiles = $this->imageService->processMultiple($files);

        // Extract data from ID documents with additional info (supports 1-2 files)
        $extractedData = $this->idDocumentService->extractFromDocuments($processedFiles, $additionalInfo);

        // Check if player with this NIC already exists
        $nicNumber = $extractedData['nic_number'] ?? null;
        if ($nicNumber) {
            $existingPlayer = Player::where('nic_number', $nicNumber)->first();
            if ($existingPlayer) {
                return redirect()
                    ->route('players.show', $existingPlayer)
                    ->with('error', "A player with NIC number {$nicNumber} already exists.");
            }
        }

        // Create player with extracted data
        $player = Player::create([
            'user_id' => $request->user()->id,
            'name' => $extractedData['name'] ?? 'New Player',
            'player_pass_number' => $this->resolvePassNumber(null),
            'nic_number' => $extractedData['nic_number'] ?? null,
            'date_of_birth' => $extractedData['date_of_birth'] ?? null,
            'gender' => $extractedData['gender'] ?? null,
            'phone' => $extractedData['phone'] ?? null,
            'blood_group' => $extractedData['blood_group'] ?? null,
            'player_type' => $extractedData['player_type'] ?? null,
            'description' => $additionalInfo,
            'is_active' => true,
        ]);

        // Store address if extracted
        $address = $extractedData['address'] ?? [];
        if ($this->shouldStoreAddress($address)) {
            try {
                $country = $address['country'] && strlen($address['country']) === 2 ? $address['country'] : 'PK';

                $player->addAddress([
                    'street' => $address['street'],
                    'street_extra' => null,
                    'city' => $address['city'],
                    'state' => $address['state'] ?? null,
                    'post_code' => $address['post_code'] ?? '----',
                    'country' => $country,
                ]);
            } catch (\Lecturize\Addresses\Exceptions\FailedValidationException $e) {
                // Silently skip address storage if validation fails
            }
        }

        // Create contact persons if extracted
        foreach ($extractedData['contact_persons'] ?? [] as $contactPerson) {
            if (!empty($contactPerson['name'])) {
                $player->contactPersons()->create([
                    'name' => $contactPerson['name'],
                    'role' => $contactPerson['role'] ?? null,
                    'phone' => $contactPerson['phone'] ?? null,
                    'email' => $contactPerson['email'] ?? null,
                ]);
            }
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
            ->route('players.edit', $player)
            ->with('success', $message)
            ->with('extracted_confidence', $extractedData['confidence'] ?? null);
    }

    /**
     * Show the create form (manual entry).
     */
    public function create(): Response
    {
        return Inertia::render('Players/Create', [
            'genders' => Player::GENDERS,
            'bloodGroups' => Player::BLOOD_GROUPS,
            'playerTypes' => Player::PLAYER_TYPES,
        ]);
    }

    /**
     * Display the specified player.
     */
    public function show(Player $player): Response
    {
        $player->load(['addresses', 'media', 'teams.club', 'teams.media', 'contactPersons']);

        $statistics = $this->getPlayerStatistics($player);
        $recentGames = $this->getRecentGames($player);
        $events = $this->getPlayerEvents($player);

        return Inertia::render('Players/Show', [
            'player' => PlayerResource::make($player),
            'teams' => TeamResource::collection($player->teams),
            'statistics' => $statistics,
            'recentGames' => GameResource::collection($recentGames),
            'events' => $events,
            'can' => [
                'edit' => $this->hasAccess($player),
                'delete' => $this->hasAccess($player),
            ],
        ]);
    }

    /**
     * Display public player profile (no auth required).
     */
    public function publicProfile(string $identifier): Response
    {
        $player = Player::where('player_pass_number', $identifier)
            ->orWhere('nic_number', $identifier)
            ->orWhere('id', $identifier)
            ->firstOrFail();

        $player->load(['addresses', 'media', 'teams.club', 'teams.media', 'contactPersons']);

        $statistics = $this->getPlayerStatistics($player);

        return Inertia::render('Players/PublicProfile', [
            'player' => PlayerResource::make($player),
            'teams' => TeamResource::collection($player->teams),
            'statistics' => $statistics,
        ]);
    }

    /**
     * Show the form for editing the specified player.
     */
    public function edit(Player $player): Response
    {
        $this->ensureAccess($player);

        $player->load(['addresses', 'media', 'contactPersons', 'teams']);

        return Inertia::render('Players/Edit', [
            'player' => PlayerResource::make($player),
            'genders' => Player::GENDERS,
            'bloodGroups' => Player::BLOOD_GROUPS,
            'playerTypes' => Player::PLAYER_TYPES,
        ]);
    }

    /**
     * Store a newly created player.
     */
    public function store(StorePlayerRequest $request): RedirectResponse
    {
        $player = Player::create([
            'user_id' => Auth::id(),
            'name' => $request->string('name'),
            'player_pass_number' => $this->resolvePassNumber($request->input('player_pass_number')),
            'nic_number' => $request->string('nic_number') ?: null,
            'date_of_birth' => $request->date('date_of_birth') ?: null,
            'gender' => $request->string('gender') ?: null,
            'phone' => $request->string('phone') ?: null,
            'blood_group' => $request->string('blood_group') ?: null,
            'player_type' => $request->string('player_type') ?: null,
            'description' => $request->string('description') ?: null,
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
                'country' => $address['country'] ?? 'PK',
                'is_primary' => true,
            ]);
        }

        if ($request->hasFile('photo')) {
            $player
                ->addMediaFromRequest('photo')
                ->preservingOriginal()
                ->toMediaCollection('photo');
        }

        if ($request->has('contact_persons')) {
            foreach ($request->input('contact_persons', []) as $contactPerson) {
                $player->contactPersons()->create([
                    'name' => $contactPerson['name'],
                    'role' => $contactPerson['role'] ?? null,
                    'phone' => $contactPerson['phone'] ?? null,
                    'email' => $contactPerson['email'] ?? null,
                ]);
            }
        }

        return redirect()->route('players.show', $player)->with('success', 'Player created.');
    }

    /**
     * Update the specified player.
     */
    public function update(UpdatePlayerRequest $request, Player $player): RedirectResponse
    {
        $this->ensureAccess($player);

        $player->update([
            'name' => $request->string('name'),
            'player_pass_number' => $this->resolvePassNumber($request->input('player_pass_number'), $player),
            'nic_number' => $request->string('nic_number') ?: null,
            'date_of_birth' => $request->date('date_of_birth') ?: null,
            'gender' => $request->string('gender') ?: null,
            'phone' => $request->string('phone') ?: null,
            'blood_group' => $request->string('blood_group') ?: null,
            'player_type' => $request->string('player_type') ?: null,
            'description' => $request->string('description') ?: null,
            'is_active' => $request->boolean('is_active', true),
        ]);

        // Sync contact persons
        $submittedIds = [];
        foreach ($request->input('contact_persons', []) as $contactPerson) {
            if (!empty($contactPerson['id'])) {
                $player->contactPersons()->where('id', $contactPerson['id'])->update([
                    'name' => $contactPerson['name'],
                    'role' => $contactPerson['role'] ?? null,
                    'phone' => $contactPerson['phone'] ?? null,
                    'email' => $contactPerson['email'] ?? null,
                ]);
                $submittedIds[] = $contactPerson['id'];
            } else {
                $newContact = $player->contactPersons()->create([
                    'name' => $contactPerson['name'],
                    'role' => $contactPerson['role'] ?? null,
                    'phone' => $contactPerson['phone'] ?? null,
                    'email' => $contactPerson['email'] ?? null,
                ]);
                $submittedIds[] = $newContact->id;
            }
        }
        $player->contactPersons()->whereNotIn('id', $submittedIds)->delete();

        $address = $request->input('address', []);
        $existingAddress = $player->addresses()->first();

        if ($this->shouldStoreAddress($address)) {
            $payload = [
                'street' => $address['street'],
                //'street_extra' => $address['street_extra'] ?? null,
                'city' => $address['city'],
                'state' => $address['state'] ?? null,
                'post_code' => $address['post_code'],
                'country_id' => Countries::where('iso_3166_2', $address['country'])->first()->id,
                'is_primary' => true,
            ];

            if ($existingAddress) {
                $existingAddress->update($payload);
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

        return redirect()->route('players.show', $player)->with('success', 'Player updated.');
    }

    /**
     * Remove the specified player.
     */
    public function destroy(Player $player): RedirectResponse
    {
        $this->ensureAccess($player);

        $player->delete();

        return redirect()->route('players.index')->with('success', 'Player deleted.');
    }

    /**
     * Search players by NIC or pass number.
     */
    public function search(): \Illuminate\Http\JsonResponse
    {
        $query = request('q', '');

        if (strlen($query) < 2) {
            return response()->json([]);
        }

        $players = Player::search($query)
            ->with(['teams:id,name', 'media'])
            ->limit(10)
            ->get();

        return response()->json(PlayerResource::collection($players));
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

    private function getPlayerStatistics(Player $player): array
    {
        $teamIds = $player->teams()->pluck('teams.id')->toArray();

        // Get shirt numbers for this player across all teams
        $shirtNumbers = $player->teams()
            ->whereNotNull('player_team.shirt_number')
            ->pluck('player_team.shirt_number')
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

    private function getRecentGames(Player $player): \Illuminate\Support\Collection
    {
        $teamIds = $player->teams()->pluck('teams.id')->toArray();

        $shirtNumbers = $player->teams()
            ->whereNotNull('player_team.shirt_number')
            ->pluck('player_team.shirt_number')
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

    private function getPlayerEvents(Player $player): \Illuminate\Http\Resources\Json\AnonymousResourceCollection
    {
        $teamIds = $player->teams()->pluck('teams.id')->toArray();

        $shirtNumbers = $player->teams()
            ->whereNotNull('player_team.shirt_number')
            ->pluck('player_team.shirt_number')
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
