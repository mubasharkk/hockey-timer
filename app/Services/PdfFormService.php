<?php

namespace App\Services;

use App\Models\Game;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class PdfFormService
{
    /**
     * Generate an official PDF by filling a blank template with game data.
     * If a PDF library (FPDI) is not available, a minimal placeholder PDF is written.
     */
    public function generate(Game $game, ?string $outputPath = null): string
    {
        $outputPath = $outputPath ?? storage_path("app/reports/game-{$game->id}.pdf");
        Storage::makeDirectory('reports');

        $templatePath = config('game.official_pdf_template', storage_path('app/templates/official_form.pdf'));
        $hasFpdi = class_exists('\\setasign\\Fpdi\\Fpdi');

        if ($hasFpdi && is_file($templatePath)) {
            return $this->generateWithFpdi($game, $templatePath, $outputPath);
        }

        Log::warning('FPDI not installed or template missing, writing placeholder PDF', [
            'template_exists' => is_file($templatePath),
            'output' => $outputPath,
        ]);

        $content = $this->buildTextContent($game);
        $this->writeStubPdf($outputPath, $content);

        return $outputPath;
    }

    private function generateWithFpdi(Game $game, string $templatePath, string $outputPath): string
    {
        $pdf = new \setasign\Fpdi\Fpdi();
        $pageCount = $pdf->setSourceFile($templatePath);
        $tplIdx = $pdf->importPage(1);

        $pdf->AddPage();
        $pdf->useTemplate($tplIdx);
        $pdf->SetFont('Helvetica', '', 10);
        $pdf->SetTextColor(0, 0, 0);

        $pdf->SetXY(20, 30);
        $pdf->Write(6, "{$game->team_a_name} vs {$game->team_b_name}");

        $pdf->SetXY(20, 38);
        $pdf->Write(6, "Venue: {$game->venue} · {$game->game_date} {$game->game_time}");

        $pdf->SetXY(20, 46);
        $pdf->Write(6, "Sessions: {$game->sessions} x {$game->session_duration_minutes} min");

        // Players listing (basic placement)
        $pdf->SetXY(20, 60);
        $pdf->Write(6, 'Team A Players:');
        $y = 66;
        foreach (($game->teams->firstWhere('side', 'home')?->players ?? []) as $player) {
            $pdf->SetXY(24, $y);
            $pdf->Write(5, ($player->shirt_number ? "#{$player->shirt_number} " : '') . ($player->name ?? ''));
            $y += 5;
        }

        $pdf->SetXY(110, 60);
        $pdf->Write(6, 'Team B Players:');
        $y = 66;
        foreach (($game->teams->firstWhere('side', 'away')?->players ?? []) as $player) {
            $pdf->SetXY(114, $y);
            $pdf->Write(5, ($player->shirt_number ? "#{$player->shirt_number} " : '') . ($player->name ?? ''));
            $y += 5;
        }

        $pdf->Output($outputPath, 'F');

        return $outputPath;
    }

    private function buildTextContent(Game $game): string
    {
        $home = $game->teams->firstWhere('side', 'home');
        $away = $game->teams->firstWhere('side', 'away');

        $lines = [
            'Official Match Report (placeholder)',
            "{$game->team_a_name} vs {$game->team_b_name}",
            "Venue: {$game->venue}",
            "Date/Time: {$game->game_date} {$game->game_time}",
            "Sessions: {$game->sessions} x {$game->session_duration_minutes} min",
            '--- Team A ---',
        ];

        foreach (($home?->players ?? []) as $p) {
            $lines[] = ($p->shirt_number ? "#{$p->shirt_number} " : '') . ($p->name ?? '');
        }
        $lines[] = '--- Team B ---';
        foreach (($away?->players ?? []) as $p) {
            $lines[] = ($p->shirt_number ? "#{$p->shirt_number} " : '') . ($p->name ?? '');
        }

        return implode("\n", $lines);
    }

    /**
     * Minimal PDF writer (single page with text) to avoid hard dependency when FPDI is unavailable.
     */
    private function writeStubPdf(string $path, string $text): void
    {
        $text = str_replace(['\\', '(', ')'], ['\\\\', '\\(', '\\)'], $text);
        $lines = explode("\n", $text);
        $content = "BT\n/F1 10 Tf\n";
        $y = 800;
        foreach ($lines as $line) {
            $content .= "72 {$y} Td ({$line}) Tj\n";
            $content .= "0 -14 Td\n";
        }
        $content .= "ET";

        $pdf = "%PDF-1.4\n";
        $objects = [];
        // Font object
        $objects[] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";
        // Page content
        $objects[] = "<< /Length " . strlen($content) . " >>\nstream\n{$content}\nendstream";
        // Page
        $objects[] = "<< /Type /Page /Parent 4 0 R /Resources << /Font << /F1 1 0 R >> >> /Contents 2 0 R /MediaBox [0 0 612 792] >>";
        // Pages
        $objects[] = "<< /Type /Pages /Kids [3 0 R] /Count 1 >>";
        // Catalog
        $objects[] = "<< /Type /Catalog /Pages 4 0 R >>";

        $offsets = [];
        foreach ($objects as $i => $obj) {
            $offsets[$i + 1] = strlen($pdf);
            $pdf .= ($i + 1) . " 0 obj\n" . $obj . "\nendobj\n";
        }
        $xref = strlen($pdf);
        $pdf .= "xref\n0 " . (count($objects) + 1) . "\n0000000000 65535 f \n";
        for ($i = 1; $i <= count($objects); $i++) {
            $pdf .= sprintf("%010d 00000 n \n", $offsets[$i]);
        }
        $pdf .= "trailer\n<< /Size " . (count($objects) + 1) . " /Root 5 0 R >>\nstartxref\n{$xref}\n%%EOF";

        file_put_contents($path, $pdf);
    }
}
