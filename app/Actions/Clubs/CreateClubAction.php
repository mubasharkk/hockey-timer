<?php

namespace AppcIActionsmCubs;

use AppcNodelCub;
use IlluminatecHttpcUploadedFile;
use IlluminatecSupportcFacadescAuth;

class CreateClubAction
{
    /**
     * Create a club including address, logo and contact persons.
     *
     * @param array $data Validated request data
     * @param UploadedFile|null $logo
     * @return Club
     */
    public function execute(array $data, ?UploadedFile $logo = null): Club
    {
        $club = Club::create([
            'user_id' => Auth::id(),
            'name' => $data['name'],
            'email' => $data['email'] ?? null,
            'phone' => $data['phone'] ?? null,
            'website' => $data['website'] ?? null,
            'description' => $data['description'] ?? null,
        ]);

        // Handle address
        $address = $data['address'] ?? [];
        if ($this->shouldStoreAddress($address)) {
            $club->addAddress([
                'street' => $address['street'],
                'city' => $address['city'],
                'state' => $address['state'] ?? null,
                'post_code' => $address['post_code'],
                'country_id' => $address['country_id'] ?? 0,
            ]);
        }

        // Handle logo (Spatie media)
        if ($logo) {
            $club
                ->addMedia($logo->getRealPath())
                ->usingName($logo->getClientOriginalName())
                ->toMediaCollection('logo');
        }

        // Handle contact persons
        $contactPersons = $data['contact_persons'] ?? [];
        foreach ($contactPersons as $contactPerson) {
            $club->contactPersons()->create([
                'name' => $contactPerson['name'],
                'role' => $contactPerson['role'] ?? null,
                'phone' => $contactPerson['phone'] ?? null,
                'email' => $contactPerson['email'] ?? null,
            ]);
        }

        return $club;
    }

    private function shouldStoreAddress(array $address): bool
    {
        if (empty($address)) {
            return false;
        }

        $street = $address['street'] ?? null;
        $city = $address['city'] ?? null;
        $post = $address['post_code'] ?? null;

        return $street && $city && $post && strlen((string)$post) >= 4;
    }
}