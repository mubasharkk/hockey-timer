<?php

namespace App\Jobs;

use App\Models\Game;
use App\Services\PdfFormService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class GenerateOfficialPdfJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(private Game $game, private ?string $outputPath = null)
    {
    }

    public function handle(PdfFormService $pdfFormService): void
    {
        $pdfFormService->generate($this->game, $this->outputPath);
    }
}
