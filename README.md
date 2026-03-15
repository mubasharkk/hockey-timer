# HockeyApp

A comprehensive hockey tournament and game management application built with Laravel 12, React, and Inertia.js.

## Features

### Club & Team Management
- Create and manage hockey clubs with full contact information
- Organize teams within clubs
- Contact person management with address integration

### Player Management
- Player registration with detailed profiles
- Auto-generated unique pass numbers
- AI-powered ID document scanning via OpenAI
- PDF pass generation for players
- Cached player statistics (goals, assists, games played, etc.)

### Game Management
- Real-time game timer with optional lock to prevent manual edits
- Live scoring with period/quarter tracking
- Session-based game structure (halves, quarters, overtime)
- Comprehensive event logging (goals, penalties, substitutions, timeouts)
- Game synchronization service for state management

### Tournament System
- Tournament creation and management
- Pool stage configuration
- Automatic standings calculation
- Top scorer leaderboard
- Tournament-pool-team relationships

### Live Ticker & API
- Public REST API for real-time game updates
- Frontend live ticker views
- Real-time game state broadcasts

### Admin Panel
- Backpack CRUD 7 admin interface
- Full CRUD operations for all entities
- Media library integration for images

### Additional Features
- Address management with country data
- Social authentication (OAuth via Laravel Socialite)
- Multi-database support (SQLite default, MySQL compatible)
- Queue-based job processing
- Image processing and management
- Sanctum API authentication

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
| AI        | OpenAI API                          |

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
├── Observers/          # Model observers for auto-logic
├── Services/           # Domain logic services
│   ├── ContactPerson/
│   ├── Game/           # GameStateService, GameTimerService, GameScoreCalculatorService
│   └── Player/         # PassNumberService, PlayerEventQueryService
│   ├── GameService.php
│   ├── GameSyncService.php
│   ├── IdDocumentService.php
│   ├── ImageService.php
└── ...
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

## Models

- **Club** — Hockey clubs with contact info
- **Team** — Teams belonging to clubs
- **Player** — Players with pass numbers and stats
- **ContactPerson** — Club contact persons with addresses
- **Game** — Scheduled matches with timer and score
- **Event** — Game events (goals, penalties, etc.)
- **MatchSession** — Game periods/quarters
- **Tournament** — Tournament metadata
- **TournamentPool** — Tournament pool configuration
- **User** — Application users for auth

## License

This project is proprietary software.
