<?php

namespace App\Actions\Teams;

use App\Models\Team;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;

class CreateTeamAction
{
    /**
     * Create a team including logo and contact persons.
     *
     * @param array $data Validated request data
     * @param UploadedFile|null $logo
     * @return Team
     */
    public function execute(array $data, ?UploadedFile $logo = null): Team
    {
        $team = Team::create([
            'user_id' => Auth::id(),
            'club_id' => $data['club_id'] ?? null,
            'name' => $data['name'],
            'type' => $data['type'] ?? null,
            'coach' => $data['coach'] ?? null,
            'manager' => $data['manager'] ?? null,
            'email' => $data['email'] ?? null,
            'phone' => $data['phone'] ?? null,
            'description' => $data['description'] ?? null,
            'is_registered' => true,
        ]);

        if ($logo) {
            $team->addMediaFromRequest('logo')->toMediaCollection('logo');
        }

        // Handle contact persons
        $contactPersons = $data['contact_persons'] ?? [];
        foreach ($contactPersons as $contactPerson) {
            $team->contactPersons()->create([
                'name' => $contactPerson['name'],
                'role' => $contactPerson['role'] ?? null,
                'phone' => $contactPerson['phone'] ?? null,
                'email' => $contactPerson['email'] ?? null,
            ]);
        }

        return $team;
    }
}
