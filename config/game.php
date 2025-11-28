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
];
