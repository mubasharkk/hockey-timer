<?php

namespace App\Services;

use App\Models\Player;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use OpenAI\Laravel\Facades\OpenAI;

class IdDocumentService
{
    /**
     * Extract player information from multiple ID documents using OpenAI Vision API.
     *
     * @param array<UploadedFile> $files The uploaded ID document images (1-2 files)
     * @param string|null $additionalInfo User-provided text that takes precedence over OCR
     * @return array Extracted player data
     */
    public function extractFromDocuments(array $files, ?string $additionalInfo = null): array
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

            // Build user message with optional additional info
            $userText = $this->buildUserMessage($additionalInfo, count($files));

            $userContent = array_merge(
                [
                    [
                        'type' => 'text',
                        'text' => $userText,
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
                'max_tokens' => 1500,
                'response_format' => ['type' => 'json_object'],
            ]);

            $content = $response->choices[0]->message->content;
            $extracted = json_decode($content, true);

            return $this->normalizeExtractedData($extracted ?? [], $additionalInfo);
        } catch (\Exception $e) {
            Log::error('ID Document extraction failed', [
                'error' => $e->getMessage(),
                'files' => array_map(fn($f) => $f->getClientOriginalName(), $files),
            ]);

            return $this->getEmptyResult($additionalInfo);
        }
    }

    /**
     * Extract player information from a single ID document.
     *
     * @param UploadedFile $file The uploaded ID document image
     * @param string|null $additionalInfo User-provided text that takes precedence over OCR
     * @return array Extracted player data
     */
    public function extractFromDocument(UploadedFile $file, ?string $additionalInfo = null): array
    {
        return $this->extractFromDocuments([$file], $additionalInfo);
    }

    /**
     * Build the user message for OpenAI, including additional info if provided.
     */
    private function buildUserMessage(?string $additionalInfo, int $fileCount): string
    {
        $baseMessage = $fileCount > 1
            ? 'Extract player information from these ID documents. They may show front and back of the same ID, or different documents. Combine all information found.'
            : 'Extract player information from this ID document.';

        if ($additionalInfo && trim($additionalInfo) !== '') {
            return <<<MSG
=== USER-PROVIDED INFORMATION (HIGHEST PRIORITY) ===
Use these values FIRST. They override any data from the images.

{$additionalInfo}

=== END OF USER-PROVIDED INFO ===

{$baseMessage}

For any fields not specified in the user-provided information above, extract from the document images.
Return all data in JSON format.
MSG;
        }

        return $baseMessage . ' Return the data in JSON format.';
    }

    /**
     * Get the system prompt for OpenAI.
     */
    private function getSystemPrompt(): string
    {
        $genders = implode(', ', array_keys(Player::GENDERS));
        $bloodGroups = implode(', ', array_keys(Player::BLOOD_GROUPS));
        $playerTypes = implode(', ', array_keys(Player::PLAYER_TYPES));

        return <<<PROMPT
You are an expert at extracting player registration information from identity documents (ID cards, passports, driver's licenses, sports federation cards, etc.) and user-provided text.

IMPORTANT: If the user provides additional information, those values take ABSOLUTE PRECEDENCE over what you extract from the images. Only use image OCR to fill in fields NOT provided by the user.

Extract the following information:

PLAYER DETAILS:
- Full name
- Shirt/Jersey number (if mentioned)
- Date of birth (format: DD/MM/YYYY)
- Gender (valid values: {$genders})
- ID/NIC number (national identity card number)
- Phone number
- Blood group (valid values: {$bloodGroups})
- Player type/position (valid values: {$playerTypes})

ADDRESS:
- Street address
- City
- State/Province
- Postal/ZIP code
- Country (in ISO-3166 / 2 Chars)

CONTACT PERSONS (guardians, parents, emergency contacts):
- Name
- Role/Relationship (e.g., Father, Mother, Guardian, Coach)
- Phone number
- Email address

The document may be in Urdu and English. Extract and translate the data accordingly.

Return the data as a JSON object with this structure:
{
    "name": "Full Name",
    "shirt_number": 10,
    "date_of_birth": "YYYY-MM-DD",
    "gender": "male" (use exact values: {$genders}),
    "nic_number": "ID number if found",
    "phone": "Player phone number",
    "blood_group": "B+" (use exact values: {$bloodGroups}),
    "player_type": "midfield" (use exact values: {$playerTypes}),
    "address": {
        "street": "Street address",
        "city": "City name",
        "state": "State or province",
        "post_code": "Postal/ZIP code",
        "country": "Country in ISO-3166 (2 Chars)",
    },
    "contact_persons": [
        {
            "name": "Contact person name",
            "role": "Father/Mother/Guardian/etc",
            "phone": "Contact phone",
            "email": "Contact email or null"
        }
    ],
    "confidence": "high|medium|low",
    "document_type": "Type of document detected"
}

If a field cannot be extracted and wasn't provided by user, use null for that field.
Set confidence based on image quality and how clearly information could be read.
PROMPT;
    }

    /**
     * Normalize extracted data to match player form fields.
     */
    private function normalizeExtractedData(array $data, ?string $additionalInfo = null): array
    {
        // Normalize gender to valid value
        $gender = $data['gender'] ?? null;
        if ($gender && !array_key_exists($gender, Player::GENDERS)) {
            $gender = $this->normalizeGender($gender);
        }

        // Normalize blood group to valid value
        $bloodGroup = $data['blood_group'] ?? null;
        if ($bloodGroup && !array_key_exists($bloodGroup, Player::BLOOD_GROUPS)) {
            $bloodGroup = null;
        }

        // Normalize player type to valid value
        $playerType = $data['player_type'] ?? null;
        if ($playerType && !array_key_exists($playerType, Player::PLAYER_TYPES)) {
            // Try to match common variations
            $playerType = $this->normalizePlayerType($playerType);
        }

        // Normalize contact persons
        $contactPersons = [];
        if (!empty($data['contact_persons']) && is_array($data['contact_persons'])) {
            foreach ($data['contact_persons'] as $contact) {
                if (!empty($contact['name'])) {
                    $contactPersons[] = [
                        'name' => $contact['name'],
                        'role' => $contact['role'] ?? null,
                        'phone' => $contact['phone'] ?? null,
                        'email' => $contact['email'] ?? null,
                    ];
                }
            }
        }

        return [
            'name' => $data['name'] ?? null,
            'shirt_number' => isset($data['shirt_number']) ? (int) $data['shirt_number'] : null,
            'date_of_birth' => $this->normalizeDate($data['date_of_birth'] ?? null),
            'gender' => $gender,
            'nic_number' => $data['nic_number'] ?? null,
            'phone' => $data['phone'] ?? null,
            'blood_group' => $bloodGroup,
            'player_type' => $playerType,
            'address' => [
                'street' => $data['address']['street'] ?? null,
                'city' => $data['address']['city'] ?? null,
                'state' => $data['address']['state'] ?? null,
                'post_code' => $data['address']['post_code'] ?? null,
                'country' => $data['address']['country'] ?? null,
            ],
            'contact_persons' => $contactPersons,
            'additional_info' => $additionalInfo,
            'confidence' => $data['confidence'] ?? 'low',
            'document_type' => $data['document_type'] ?? 'unknown',
            'extracted' => true,
        ];
    }

    /**
     * Normalize gender from various inputs to valid enum values.
     */
    private function normalizeGender(?string $gender): ?string
    {
        if (!$gender) {
            return null;
        }

        $gender = strtolower(trim($gender));

        $mappings = [
            'male' => Player::GENDER_MALE,
            'm' => Player::GENDER_MALE,
            'man' => Player::GENDER_MALE,
            'boy' => Player::GENDER_MALE,
            'female' => Player::GENDER_FEMALE,
            'f' => Player::GENDER_FEMALE,
            'woman' => Player::GENDER_FEMALE,
            'girl' => Player::GENDER_FEMALE,
        ];

        return $mappings[$gender] ?? null;
    }

    /**
     * Normalize player type from various inputs to valid enum values.
     */
    private function normalizePlayerType(?string $type): ?string
    {
        if (!$type) {
            return null;
        }

        $type = strtolower(trim($type));

        $mappings = [
            'offensive' => Player::TYPE_OFFENSIVE,
            'forward' => Player::TYPE_OFFENSIVE,
            'striker' => Player::TYPE_OFFENSIVE,
            'attacker' => Player::TYPE_OFFENSIVE,
            'defensive' => Player::TYPE_DEFENSIVE,
            'defender' => Player::TYPE_DEFENSIVE,
            'defense' => Player::TYPE_DEFENSIVE,
            'back' => Player::TYPE_DEFENSIVE,
            'goalkeeper' => Player::TYPE_GOALKEEPER,
            'goalie' => Player::TYPE_GOALKEEPER,
            'keeper' => Player::TYPE_GOALKEEPER,
            'gk' => Player::TYPE_GOALKEEPER,
            'goal keeper' => Player::TYPE_GOALKEEPER,
            'midfield' => Player::TYPE_MIDFIELD,
            'midfielder' => Player::TYPE_MIDFIELD,
            'mid' => Player::TYPE_MIDFIELD,
        ];

        return $mappings[$type] ?? null;
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
    private function getEmptyResult(?string $additionalInfo = null): array
    {
        return [
            'name' => null,
            'shirt_number' => null,
            'date_of_birth' => null,
            'gender' => null,
            'nic_number' => null,
            'phone' => null,
            'blood_group' => null,
            'player_type' => null,
            'address' => [
                'street' => null,
                'city' => null,
                'state' => null,
                'post_code' => null,
            ],
            'contact_persons' => [],
            'additional_info' => $additionalInfo,
            'confidence' => null,
            'document_type' => null,
            'extracted' => false,
        ];
    }
}
