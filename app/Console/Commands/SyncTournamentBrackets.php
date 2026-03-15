<?php

namespace App\Console\Commands;

use App\Models\Tournament;
use App\Services\KnockoutBracketService;
use Illuminate\Console\Command;

class SyncTournamentBrackets extends Command
{
    protected $signature = 'tournaments:sync-brackets {tournament? : The tournament ID or slug}
                                                    {--all : Sync all tournaments with knockout games}';

    protected $description = 'Sync knockout bracket for a tournament or all tournaments';

    public function __construct(
        private KnockoutBracketService $bracketService
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        $tournamentId = $this->argument('tournament');
        $syncAll = $this->option('all');

        if (!$tournamentId && !$syncAll) {
            $this->error('Please provide a tournament ID/slug or use --all flag');
            return Command::FAILURE;
        }

        if ($syncAll) {
            return $this->syncAll();
        }

        return $this->syncOne($tournamentId);
    }

    private function syncAll(): int
    {
        $tournaments = Tournament::whereNotNull('knockout_bracket')
            ->whereRaw('JSON_EXTRACT(knockout_bracket, "$.rounds") IS NOT NULL')
            ->get();

        if ($tournaments->isEmpty()) {
            $this->info('No tournaments with knockout brackets found.');
            return Command::SUCCESS;
        }

        $this->info("Found {$tournaments->count()} tournament(s) with brackets.");

        $bar = $this->output->progressBar($tournaments->count());

        foreach ($tournaments as $tournament) {
            $bar->advance();
            $this->bracketService->rebuildBracket($tournament);
            $this->line(" <info>Synced:</info> {$tournament->title}");
        }

        $bar->finish();
        $this->newLine();
        $this->info('All brackets synced successfully.');

        return Command::SUCCESS;
    }

    private function syncOne(string $identifier): int
    {
        $tournament = Tournament::where('id', $identifier)
            ->orWhere('slug', $identifier)
            ->first();

        if (!$tournament) {
            $this->error("Tournament not found: {$identifier}");
            return Command::FAILURE;
        }

        $this->info("Syncing bracket for: {$tournament->title}");
        $this->bracketService->rebuildBracket($tournament);
        $this->info('Bracket synced successfully.');

        return Command::SUCCESS;
    }
}
