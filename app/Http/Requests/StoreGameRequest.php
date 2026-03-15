<?php

namespace App\Http\Requests;

use App\Models\Game;
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
                Rule::exists('teams', 'id'),
            ],
            'away_team_id' => [
                'required',
                'integer',
                'different:home_team_id',
                Rule::exists('teams', 'id'),
            ],
            'tournament_id' => ['nullable', 'integer', 'exists:tournaments,id'],
            'game_type' => ['required', 'string', Rule::in(array_keys(Game::allowedTypes()))],
            'tournament_pool_id' => ['nullable', 'integer', 'exists:tournament_pools,id'],
            'knockout_round' => ['nullable', 'string', Rule::in(array_keys(Game::allowedKnockoutRounds()))],
            'knockout_position' => ['nullable', 'integer', 'min:1'],
            'venue' => ['required', 'string', 'max:255'],
            'excerpt' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
            'game_date' => ['required', 'date'],
            'game_time' => ['required', 'date_format:H:i'],
            'sessions' => ['required', 'integer', 'in:1,2,4,6,8'],
            'session_duration_minutes' => ['required', 'integer', 'min:1'],
            'timer_mode' => ['required', 'in:ASC,DESC'],
            'sport_type' => ['nullable', 'string', 'max:50'],
            'continue_timer_on_goal' => ['nullable', 'boolean'],
            'game_officials' => ['nullable', 'string', 'max:500'],
        ];
    }
}
