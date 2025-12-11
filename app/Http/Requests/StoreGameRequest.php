<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreGameRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'home_team_id' => [
                'required',
                'integer',
                Rule::exists('teams', 'id')->where(fn ($q) => $q->where('is_registered', true)),
            ],
            'away_team_id' => [
                'required',
                'integer',
                'different:home_team_id',
                Rule::exists('teams', 'id')->where(fn ($q) => $q->where('is_registered', true)),
            ],
            'tournament_id' => ['nullable', 'integer', 'exists:tournaments,id'],
            'venue' => ['required', 'string', 'max:255'],
            'game_date' => ['required', 'date'],
            'game_time' => ['required', 'date_format:H:i'],
            'sessions' => ['required', 'integer', 'in:2,4,6,8'],
            'session_duration_minutes' => ['required', 'integer', 'min:1'],
            'timer_mode' => ['required', 'in:ASC,DESC'],
            'sport_type' => ['nullable', 'string', 'max:50'],
            'continue_timer_on_goal' => ['nullable', 'boolean'],
            'game_officials' => ['nullable', 'string', 'max:500'],
        ];
    }
}
