<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePlayerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'shirt_number' => ['nullable', 'integer', 'min:0', 'max:999'],
            'player_pass_number' => [
                'nullable',
                'string',
                'max:50',
                Rule::unique('players', 'player_pass_number'),
            ],
            'nic_number' => ['nullable', 'string', 'max:50'],
            'date_of_birth' => ['nullable', 'date'],
            'is_active' => ['sometimes', 'boolean'],
            'address.street' => ['nullable', 'string', 'max:60'],
            'address.street_extra' => ['nullable', 'string', 'max:60'],
            'address.city' => ['nullable', 'string', 'max:60'],
            'address.state' => ['nullable', 'string', 'max:60'],
            'address.post_code' => ['nullable', 'string', 'max:10'],
            'photo' => ['nullable', 'image', 'max:5120'],
        ];
    }
}
