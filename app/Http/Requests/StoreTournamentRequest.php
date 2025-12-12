<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTournamentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('tournaments', 'slug')],
            'venue' => ['required', 'string', 'max:255'],
            'start_date' => ['required', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'win_points' => ['required', 'integer', 'min:0', 'max:20'],
            'draw_points' => ['required', 'integer', 'min:0', 'max:20'],
            'loss_points' => ['required', 'integer', 'min:0', 'max:20'],
            'pools_count' => ['required', 'integer', 'min:1', 'max:26'],
            'logo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,gif', 'max:5120'],
            'sponsor_logos' => ['nullable', 'array'],
            'sponsor_logos.*' => ['image', 'mimes:jpg,jpeg,png,gif', 'max:5120'],
        ];
    }
}
