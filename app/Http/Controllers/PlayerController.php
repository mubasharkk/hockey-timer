<?php

namespace App\Http\Controllers;

use App\Actions\ContactPerson\SyncContactPersons;
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
use App\Services\Player\PassNumberService;
use App\Services\Player\PlayerEventQueryService;
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
        private readonly ImageService $imageService,
        private readonly PassNumberService $passNumberService,
        private readonly PlayerEventQueryService $playerEventQueryService,
    ) {}

    /**
     * Display a listing of players.
     */
    public function index(): Response
    {
        $query = Player::withInactive()->with(['teams', 'media'])->latest();

        if (!request()->user()->is_admin) {
            $query = $query->where('user_id', Auth::id());
        }

        return Inertia::render('Players/Index', [
            'players' => PlayerResource::collection($query->paginate(100)),
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
    public function processScan(ScanPlayerIdRequest $request, SyncContactPersons $syncContactPersons): RedirectResponse
    {
        $files = $request->file('id_documents');
        $additionalInfo = $request->input('additional_info');

        $processedFiles = $this->imageService->processMultiple($files);
        $extractedData = $this->idDocumentService->extractFromDocuments($processedFiles, $additionalInfo);

        $nicNumber = $extractedData['nic_number'] ?? null;
        if ($nicNumber) {
            $existingPlayer = Player::withInactive()->where('nic_number', $nicNumber)->first();
            if ($existingPlayer) {
                return redirect()
                    ->route('players.show', $existingPlayer)
                    ->with('error', "A player with NIC number {$nicNumber} already exists.");
            }
        }

        $player = Player::create([
            'user_id' => $request->user()->id,
            'name' => $extractedData['name'] ?? 'New Player',
            'player_pass_number' => $this->passNumberService->resolve(null),
            'nic_number' => $extractedData['nic_number'] ?? null,
            'date_of_birth' => $extractedData['date_of_birth'] ?? null,
            'gender' => $extractedData['gender'] ?? null,
            'phone' => $extractedData['phone'] ?? null,
            'blood_group' => $extractedData['blood_group'] ?? null,
            'player_type' => $extractedData['player_type'] ?? null,
            'description' => $additionalInfo,
            'is_active' => true,
        ]);

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

        $syncContactPersons($player, $extractedData['contact_persons'] ?? []);

        foreach ($processedFiles as $file) {
            $player->addMedia($file->getRealPath())
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

        $recentGames = $this->playerEventQueryService->getRecentGames($player);
        $events = $this->playerEventQueryService->getPlayerEvents($player);

        return Inertia::render('Players/Show', [
            'player' => PlayerResource::make($player),
            'teams' => TeamResource::collection($player->teams),
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
        $player = Player::withInactive()
            ->where('player_pass_number', $identifier)
            ->orWhere('nic_number', $identifier)
            ->orWhere('id', $identifier)
            ->firstOrFail();

        $player->load(['addresses', 'media', 'teams.club', 'teams.media', 'contactPersons']);

        return Inertia::render('Players/PublicProfile', [
            'player' => PlayerResource::make($player),
            'teams' => TeamResource::collection($player->teams)
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
    public function store(StorePlayerRequest $request, SyncContactPersons $syncContactPersons): RedirectResponse
    {
        $player = Player::create([
            'user_id' => Auth::id(),
            'name' => $request->string('name'),
            'player_pass_number' => $this->passNumberService->resolve($request->input('player_pass_number')),
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
            $player->addMediaFromRequest('photo')->preservingOriginal()->toMediaCollection('photo');
        }

        $syncContactPersons($player, $request->input('contact_persons', []));

        return redirect()->route('players.show', $player)->with('success', 'Player created.');
    }

    /**
     * Update the specified player.
     */
    public function update(UpdatePlayerRequest $request, Player $player, SyncContactPersons $syncContactPersons): RedirectResponse
    {
        $this->ensureAccess($player);

        $player->update([
            'name' => $request->string('name'),
            'player_pass_number' => $this->passNumberService->resolve($request->input('player_pass_number'), $player),
            'nic_number' => $request->string('nic_number') ?: null,
            'date_of_birth' => $request->date('date_of_birth') ?: null,
            'gender' => $request->string('gender') ?: null,
            'phone' => $request->string('phone') ?: null,
            'blood_group' => $request->string('blood_group') ?: null,
            'player_type' => $request->string('player_type') ?: null,
            'description' => $request->string('description') ?: null,
            'is_active' => $request->boolean('is_active', true),
        ]);

        $syncContactPersons($player, $request->input('contact_persons', []));

        $address = $request->input('address', []);
        $existingAddress = $player->addresses()->first();

        if ($this->shouldStoreAddress($address)) {
            $payload = [
                'street' => $address['street'],
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
            $player->addMediaFromRequest('photo')->preservingOriginal()->toMediaCollection('photo');
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
            ->with(['media'])
            ->limit(20)
            ->get();

        return response()->json(PlayerResource::collection($players));
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
