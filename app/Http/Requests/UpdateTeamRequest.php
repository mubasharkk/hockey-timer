<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTeamRequest extends FormRequest
{
    public function authorize(): bool
    {
        $team = $this->route('team');

        if (! $team || ! $team->is_registered) {
            return false;
        }

        return $team->user_id === $this->user()?->id;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'coach' => ['nullable', 'string', 'max:255'],
            'manager' => ['nullable', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'website' => ['nullable', 'url', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'logo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,gif', 'max:5120'],
            'remove_logo' => ['nullable', 'boolean'],
            'contact_persons' => ['nullable', 'array'],
            'contact_persons.*.id' => ['nullable', 'integer', 'exists:team_contact_persons,id'],
            'contact_persons.*.name' => ['required', 'string', 'max:255'],
            'contact_persons.*.role' => ['nullable', 'string', 'max:255'],
            'contact_persons.*.phone' => ['nullable', 'string', 'max:50'],
            'contact_persons.*.email' => ['nullable', 'email', 'max:255'],
        ];
    }
}
