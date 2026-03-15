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
    /*
    |--------------------------------------------------------------------------
    | Game Types
    |--------------------------------------------------------------------------
    |
    | Configurable list of game types. The key is stored in the database,
    | the value is the human-readable label shown in the UI.
    |
    */
    'types' => [
        'pool' => 'Pool / Group Stage',
        'knockout' => 'Knockout',
        'friendly' => 'Friendly',
        'placement' => 'Placement',
    ],

    /*
    |--------------------------------------------------------------------------
    | Knockout Rounds
    |--------------------------------------------------------------------------
    |
    | Ordered list of knockout round keys. The order defines progression
    | (earlier rounds feed into later rounds). 'size' is the number of
    | matchups in that round for a standard bracket.
    |
    */
    'knockout_rounds' => [
        'round_of_16' => ['label' => 'Round of 16', 'size' => 8],
        'quarterfinal' => ['label' => 'Quarterfinals', 'size' => 4],
        'semifinal'    => ['label' => 'Semifinals',    'size' => 2],
        '3rd_place'    => ['label' => '3rd Place',     'size' => 1],
        'final'        => ['label' => 'Final',         'size' => 1],
    ],

    'sports' => [
        'football' => 'Football',
        'field_hockey' => 'Field Hockey',
        'futsal' => 'Futsal',
        'handball' => 'Handball',
        'basketball' => 'Basketball',
    ],
];
