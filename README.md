# HockeyApp

A hockey tournament and game management application built with Laravel 12, React, and Inertia.js.

## Features

- **Club & Team Management** — Create and manage clubs, teams, and contact persons
- **Player Management** — Register players with auto-generated pass numbers and ID document scanning (via OpenAI)
- **Game Management** — Track games with real-time timer, scoring, sessions, and event logging
- **Tournament System** — Organize tournaments with pool stages, standings, and top scorer views
- **Live Ticker** — Public API and frontend for real-time game updates
- **Admin Panel** — Backpack CRUD admin interface
- **Player Statistics** — Cached per-player stats (goals, assists, etc.)

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Backend   | PHP 8.2+, Laravel 12, Sanctum      |
| Frontend  | React 18, Inertia.js, Tailwind CSS |
| Admin     | Backpack CRUD 7                     |
| Build     | Vite 7                              |
| Database  | SQLite (default), MySQL supported   |
| Media     | Spatie Media Library                |
| Queue     | Database driver                     |

## Prerequisites

- PHP 8.2+
- Composer
- Node.js & npm

## Setup

```bash
# Clone the repository
git clone <repo-url> && cd app

# Install dependencies and build assets
composer setup
```

The `composer setup` script will:
1. Install PHP dependencies
2. Copy `.env.example` to `.env` (if not present)
3. Generate the application key
4. Run database migrations
5. Install npm packages
6. Build frontend assets

## Development

Start all development services (web server, queue worker, log tail, Vite) concurrently:

```bash
composer dev
```

This runs the Laravel dev server, queue listener, Pail log viewer, and Vite dev server in parallel.

## Testing

```bash
composer test
```

## Environment Variables

Copy `.env.example` and configure as needed. Notable settings:

| Variable           | Description                              |
|--------------------|------------------------------------------|
| `GAME_TIMER_LOCK`  | Lock game timer to prevent manual edits  |
| `OPENAI_API_KEY`   | Required for player ID document scanning |

## Project Structure

```
app/
├── Actions/            # Single-purpose action classes
│   ├── Clubs/
│   ├── ContactPerson/
│   └── Players/
├── Http/Controllers/   # Request handling
├── Models/             # Eloquent models (Club, Team, Player, Game, Event, Tournament, …)
├── Services/           # Domain logic services
│   ├── ContactPerson/
│   ├── Game/           # GameStateService, GameTimerService, GameScoreCalculatorService
│   └── Player/         # PassNumberService, PlayerEventQueryService
resources/js/
├── Pages/              # Inertia React pages
│   ├── Clubs/
│   ├── Teams/
│   ├── Players/
│   ├── Game/
│   ├── Tournaments/
│   └── Public/         # Live ticker views
routes/
├── web.php             # Web routes
├── api.php             # Public ticker API
├── auth.php            # Authentication routes
└── backpack/           # Admin panel routes
```

## License

This project is proprietary software.
