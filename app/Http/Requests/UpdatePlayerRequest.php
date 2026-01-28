<?php

namespace App\Http\Requests;

use App\Models\Player;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePlayerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $playerId = $this->route('player')?->id;

        return [
            'name' => ['required', 'string', 'max:255'],
            'player_pass_number' => [
                'nullable',
                'string',
                'max:32',
                Rule::unique('players', 'player_pass_number')->ignore($playerId),
            ],
            'nic_number' => [
                'nullable',
                'string',
                'max:32',
                Rule::unique('players', 'nic_number')->ignore($playerId),
            ],
            'date_of_birth' => ['nullable', 'date'],
            'gender' => ['nullable', 'string', Rule::in(array_keys(Player::GENDERS))],
            'phone' => ['nullable', 'string', 'max:50'],
            'blood_group' => ['nullable', 'string', Rule::in(array_keys(Player::BLOOD_GROUPS))],
            'player_type' => ['nullable', 'string', Rule::in(array_keys(Player::PLAYER_TYPES))],
            'description' => ['nullable', 'string', 'max:5000'],
            'is_active' => ['sometimes', 'boolean'],
            'contact_persons' => ['nullable', 'array'],
            'contact_persons.*.id' => ['nullable', 'integer', 'exists:contact_persons,id'],
            'contact_persons.*.name' => ['required', 'string', 'max:255'],
            'contact_persons.*.role' => ['nullable', 'string', 'max:255'],
            'contact_persons.*.phone' => ['nullable', 'string', 'max:50'],
            'contact_persons.*.email' => ['nullable', 'email', 'max:255'],
            'address.street' => ['nullable', 'string', 'max:60'],
            'address.street_extra' => ['nullable', 'string', 'max:60'],
            'address.city' => ['nullable', 'string', 'max:60'],
            'address.state' => ['nullable', 'string', 'max:60'],
            'address.post_code' => ['nullable', 'string', 'max:10'],
            'address.country' => ['nullable', 'string', 'max:2'],
            'photo' => ['nullable', 'image', 'max:5120'],
        ];
    }
}
