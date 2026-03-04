<?php

namespace App\Http\Requests;

use App\Http\Requests\Concerns\AuthorizesOwnership;
use App\Models\Team;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTeamRequest extends FormRequest
{
    use AuthorizesOwnership;

    public function authorize(): bool
    {
        $team = $this->route('team');

        if (!$team || !$team->is_registered) {
            return false;
        }

        return $this->userOwnsOrAdmin($team);
    }

    public function rules(): array
    {
        return [
            'club_id' => ['nullable', 'integer', 'exists:clubs,id'],
            'name' => ['required', 'string', 'max:255'],
            'type' => ['nullable', 'string', Rule::in(array_keys(Team::TYPES))],
            'coach' => ['nullable', 'string', 'max:255'],
            'manager' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'description' => ['nullable', 'string', 'max:5000'],
            'logo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,gif', 'max:5120'],
            'remove_logo' => ['nullable', 'boolean'],
            'contact_persons' => ['nullable', 'array'],
            'contact_persons.*.id' => ['nullable', 'integer', 'exists:contact_persons,id'],
            'contact_persons.*.name' => ['required', 'string', 'max:255'],
            'contact_persons.*.role' => ['nullable', 'string', 'max:255'],
            'contact_persons.*.phone' => ['nullable', 'string', 'max:50'],
            'contact_persons.*.email' => ['nullable', 'email', 'max:255'],
        ];
    }
}
