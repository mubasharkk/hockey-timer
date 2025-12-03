<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreGameRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'team_a_name' => ['required', 'string', 'max:255'],
            'team_b_name' => ['required', 'string', 'max:255'],
            'venue' => ['required', 'string', 'max:255'],
            'game_date' => ['required', 'date'],
            'game_time' => ['required', 'date_format:H:i'],
            'sessions' => ['required', 'integer', 'in:2,4,6,8'],
            'session_duration_minutes' => ['required', 'integer', 'in:15,20,30,45'],
            'timer_mode' => ['required', 'in:ASC,DESC'],
            'sport_type' => ['nullable', 'string', 'max:50'],
            'continue_timer_on_goal' => ['nullable', 'boolean'],
            'team_a_players_text' => ['nullable', 'string'],
            'team_b_players_text' => ['nullable', 'string'],
            'team_a_coach' => ['nullable', 'string', 'max:255'],
            'team_a_manager' => ['nullable', 'string', 'max:255'],
            'team_b_coach' => ['nullable', 'string', 'max:255'],
            'team_b_manager' => ['nullable', 'string', 'max:255'],
            'game_officials' => ['nullable', 'string', 'max:500'],
        ];
    }
}
