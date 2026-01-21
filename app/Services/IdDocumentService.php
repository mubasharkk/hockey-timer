<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use OpenAI\Laravel\Facades\OpenAI;

class IdDocumentService
{
    /**
     * Extract player information from multiple ID documents using OpenAI Vision API.
     *
     * @param array<UploadedFile> $files The uploaded ID document images (1-2 files)
     * @return array Extracted player data
     */
    public function extractFromDocuments(array $files): array
    {
        try {
            $imageContents = [];

            foreach ($files as $file) {
                $base64Image = base64_encode(file_get_contents($file->getRealPath()));
                $mimeType = $file->getMimeType();

                $imageContents[] = [
                    'type' => 'image_url',
                    'image_url' => [
                        'url' => "data:{$mimeType};base64,{$base64Image}",
                    ],
                ];
            }

            $userContent = array_merge(
                [
                    [
                        'type' => 'text',
                        'text' => count($files) > 1
                            ? 'Extract player information from these ID documents. They may show front and back of the same ID, or different documents. Combine all information found. Return the data in JSON format.'
                            : 'Extract player information from this ID document. Return the data in JSON format.',
                    ],
                ],
                $imageContents
            );

            $response = OpenAI::chat()->create([
                'model' => 'gpt-4o',
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => $this->getSystemPrompt(),
                    ],
                    [
                        'role' => 'user',
                        'content' => $userContent,
                    ],
                ],
                'max_tokens' => 1000,
                'response_format' => ['type' => 'json_object'],
            ]);

            $content = $response->choices[0]->message->content;
            $extracted = json_decode($content, true);

            return $this->normalizeExtractedData($extracted ?? []);
        } catch (\Exception $e) {
            Log::error('ID Document extraction failed', [
                'error' => $e->getMessage(),
                'files' => array_map(fn($f) => $f->getClientOriginalName(), $files),
            ]);

            return $this->getEmptyResult();
        }
    }

    /**
     * Extract player information from a single ID document.
     *
     * @param UploadedFile $file The uploaded ID document image
     * @return array Extracted player data
     */
    public function extractFromDocument(UploadedFile $file): array
    {
        return $this->extractFromDocuments([$file]);
    }

    /**
     * Get the system prompt for OpenAI.
     */
    private function getSystemPrompt(): string
    {
        return <<<'PROMPT'
You are an expert at extracting information from identity documents (ID cards, passports, driver's licenses, sports federation cards, etc.).

Extract the following information from the document if available:
- Full name
- Date of birth (extraction format : DD/MM/YYYY)
- ID/NIC number (national identity card number)
- Address (street, city, state/province, postal code)

The document is in Urdu and English both. Extract and translate the data accordingly.

Return the data as a JSON object with the following structure:
{
    "name": "Full Name",
    "date_of_birth": "YYYY-MM-DD",
    "nic_number": "ID number if found",
    "address": {
        "street": "Street address",
        "city": "City name",
        "state": "State or province",
        "post_code": "Postal/ZIP code"
    },
    "confidence": "high|medium|low",
    "document_type": "Type of document detected"
}

If a field cannot be extracted, use null for that field.
Set confidence based on image quality and how clearly information could be read.
PROMPT;
    }

    /**
     * Normalize extracted data to match player form fields.
     */
    private function normalizeExtractedData(array $data): array
    {
        return [
            'name' => $data['name'] ?? null,
            'date_of_birth' => $this->normalizeDate($data['date_of_birth'] ?? null),
            'nic_number' => $data['nic_number'] ?? null,
            'address' => [
                'street' => $data['address']['street'] ?? null,
                'city' => $data['address']['city'] ?? null,
                'state' => $data['address']['state'] ?? null,
                'post_code' => $data['address']['post_code'] ?? null,
            ],
            'confidence' => $data['confidence'] ?? 'low',
            'document_type' => $data['document_type'] ?? 'unknown',
            'extracted' => true,
        ];
    }

    /**
     * Normalize date to YYYY-MM-DD format.
     * Handles various input formats including DD/MM/YYYY.
     */
    private function normalizeDate(?string $date): ?string
    {
        if (!$date) {
            return null;
        }

        try {
            // Try DD/MM/YYYY format first (common in ID documents)
            if (preg_match('/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/', $date, $matches)) {
                $day = str_pad($matches[1], 2, '0', STR_PAD_LEFT);
                $month = str_pad($matches[2], 2, '0', STR_PAD_LEFT);
                $year = $matches[3];
                return "{$year}-{$month}-{$day}";
            }

            // Fall back to Carbon parsing for other formats
            return \Carbon\Carbon::parse($date)->format('Y-m-d');
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Get empty result structure.
     */
    private function getEmptyResult(): array
    {
        return [
            'name' => null,
            'date_of_birth' => null,
            'nic_number' => null,
            'address' => [
                'street' => null,
                'city' => null,
                'state' => null,
                'post_code' => null,
            ],
            'confidence' => null,
            'document_type' => null,
            'extracted' => false,
        ];
    }
}
