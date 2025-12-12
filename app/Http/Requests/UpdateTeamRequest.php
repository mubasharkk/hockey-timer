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
            'logo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,gif', 'max:5120'],
            'remove_logo' => ['nullable', 'boolean'],
        ];
    }
}
