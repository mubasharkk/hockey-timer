<?php

namespace App\Providers;

use App\Models\Event;
use App\Models\Game;
use App\Observers\EventObserver;
use App\Observers\GameObserver;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        Event::observe(EventObserver::class);
        Game::observe(GameObserver::class);
    }
}
