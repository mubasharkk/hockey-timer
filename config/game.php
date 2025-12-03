<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Timer Lock (Prevent Screen Sleep)
    |--------------------------------------------------------------------------
    |
    | Enable to request Wake Lock / screen-on behavior on timer screens.
    | This value can be overridden via env: GAME_TIMER_LOCK=true/false.
    |
    */
    'timer_lock' => env('GAME_TIMER_LOCK', true),

    /*
    |--------------------------------------------------------------------------
    | Supported Sports
    |--------------------------------------------------------------------------
    |
    | Configurable list of sports types available when creating/editing a game.
    | These are informational only.
    |
    */
    'sports' => [
        'football' => 'Football',
        'field_hockey' => 'Field Hockey',
        'futsal' => 'Futsal',
        'handball' => 'Handball',
        'basketball' => 'Basketball',
    ],
];
