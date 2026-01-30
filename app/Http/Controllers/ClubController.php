<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreClubRequest;
use App\Http\Requests\UpdateClubRequest;
use App\Models\Club;
use App\Http\Resources\ClubResource;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use App\Http\Controllers\Concerns\EnsuresOwnership;

class ClubController extends Controller
{
    use EnsuresOwnership;
    public function index(): Response
    {
        $query = Club::query()
            ->with(['media', 'teams', 'contactPersons'])
            ->withCount('teams')
            ->orderBy('name');

        if (!backpack_user()->is_admin) {
            $query = $query->where('user_id', Auth::id());
        }

        return Inertia::render('Clubs/Index', [
            'clubs' => ClubResource::collection($query->get()),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Clubs/Create');
    }

    public function store(StoreClubRequest $request): RedirectResponse
    {
        $club = Club::create([
            'user_id' => Auth::id(),
            'name' => $request->string('name'),
            'email' => $request->string('email'),
            'phone' => $request->string('phone') ?: null,
            'website' => $request->string('website') ?: null,
            'description' => $request->string('description') ?: null,
        ]);

        // Handle address
        $address = $request->input('address', []);
        if ($this->shouldStoreAddress($address)) {
            $club->addAddress([
                'street' => $address['street'],
                'city' => $address['city'],
                'state' => $address['state'] ?? null,
                'post_code' => $address['post_code'],
                'country_id' => $address['country_id'] ?? 0,
            ]);
        }

        // Handle logo
        if ($request->hasFile('logo')) {
            $club
                ->addMediaFromRequest('logo')
                ->toMediaCollection('logo');
        }

        // Handle contact persons
        if ($request->has('contact_persons')) {
            foreach ($request->input('contact_persons', []) as $contactPerson) {
                $club->contactPersons()->create([
                    'name' => $contactPerson['name'],
                    'role' => $contactPerson['role'] ?? null,
                    'phone' => $contactPerson['phone'] ?? null,
                    'email' => $contactPerson['email'] ?? null,
                ]);
            }
        }

        return redirect()->route('clubs.show', $club)->with('success', 'Club created successfully.');
    }

    public function show(Club $club): Response
    {
        //$this->ensureAccess($club);

        $club->load([
            'media',
            'addresses',
            'contactPersons',
            'teams' => fn ($q) => $q->with('media')->withCount('players')->orderBy('name'),
        ]);

        return Inertia::render('Clubs/Show', [
            'club' => ClubResource::make($club),
        ]);
    }

    public function edit(Club $club): Response
    {
        $this->ensureAccess($club);

        $club->load(['media', 'addresses', 'contactPersons']);

        return Inertia::render('Clubs/Edit', [
            'club' => ClubResource::make($club),
        ]);
    }

    public function update(UpdateClubRequest $request, Club $club): RedirectResponse
    {
        $this->ensureAccess($club);

        $club->update([
            'name' => $request->string('name'),
            'email' => $request->string('email'),
            'phone' => $request->string('phone') ?: null,
            'website' => $request->string('website') ?: null,
            'description' => $request->string('description') ?: null,
        ]);

        // Handle address
        $address = $request->input('address', []);
        $existingAddress = $club->addresses()->first();

        if ($this->shouldStoreAddress($address)) {
            $payload = [
                'street' => $address['street'],
                'city' => $address['city'],
                'state' => $address['state'] ?? null,
                'post_code' => $address['post_code'],
                'country_id' => $address['country_id'] ?? 0,
            ];

            if ($existingAddress) {
                $club->updateAddress($existingAddress, $payload);
            } else {
                $club->addAddress($payload);
            }
        } elseif ($existingAddress) {
            $club->flushAddresses();
        }

        // Handle logo
        if ($request->boolean('remove_logo')) {
            $club->clearMediaCollection('logo');
        }

        if ($request->hasFile('logo')) {
            $club->clearMediaCollection('logo');
            $club
                ->addMediaFromRequest('logo')
                ->toMediaCollection('logo');
        }

        // Sync contact persons
        if ($request->has('contact_persons')) {
            $existingIds = [];
            foreach ($request->input('contact_persons', []) as $contactPerson) {
                if (isset($contactPerson['id'])) {
                    $club->contactPersons()->where('id', $contactPerson['id'])->update([
                        'name' => $contactPerson['name'],
                        'role' => $contactPerson['role'] ?? null,
                        'phone' => $contactPerson['phone'] ?? null,
                        'email' => $contactPerson['email'] ?? null,
                    ]);
                    $existingIds[] = $contactPerson['id'];
                } else {
                    $newContact = $club->contactPersons()->create([
                        'name' => $contactPerson['name'],
                        'role' => $contactPerson['role'] ?? null,
                        'phone' => $contactPerson['phone'] ?? null,
                        'email' => $contactPerson['email'] ?? null,
                    ]);
                    $existingIds[] = $newContact->id;
                }
            }
            $club->contactPersons()->whereNotIn('id', $existingIds)->delete();
        } else {
            $club->contactPersons()->delete();
        }

        return redirect()->route('clubs.show', $club)->with('success', 'Club updated successfully.');
    }

    public function destroy(Club $club): RedirectResponse
    {
        $this->ensureAccess($club);

        $club->delete();

        return redirect()->route('clubs.index')->with('success', 'Club deleted successfully.');
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
