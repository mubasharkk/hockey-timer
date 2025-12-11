<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTournamentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $tournamentId = $this->route('tournament')?->id;

        return [
            'title' => ['required', 'string', 'max:255'],
            'slug' => [
                'nullable',
                'string',
                'max:255',
                Rule::unique('tournaments', 'slug')->ignore($tournamentId),
            ],
            'venue' => ['required', 'string', 'max:255'],
            'start_date' => ['required', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'win_points' => ['required', 'integer', 'min:0', 'max:20'],
            'draw_points' => ['required', 'integer', 'min:0', 'max:20'],
            'loss_points' => ['required', 'integer', 'min:0', 'max:20'],
            'pools_count' => ['nullable', 'integer', 'min:1', 'max:26'],
        ];
    }
}
