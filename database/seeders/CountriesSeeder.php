<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CountriesSeeder extends Seeder
{
    public function run(): void
    {
        $tableName = config('countries.table_name', 'countries');

        // Disable foreign key checks and truncate table
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        DB::table($tableName)->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // Read countries from vendor package JSON
        $jsonPath = base_path('vendor/webpatser/laravel-countries/src/Webpatser/Countries/Models/countries.json');

        if (!file_exists($jsonPath)) {
            $this->command->error('Countries JSON file not found at: ' . $jsonPath);
            return;
        }

        $countries = json_decode(file_get_contents($jsonPath), true);

        if (empty($countries)) {
            $this->command->error('Failed to parse countries JSON file');
            return;
        }

        $insertData = [];

        foreach ($countries as $id => $country) {
            $insertData[] = [
                'id' => (int) $id,
                'capital' => $country['capital'] ?? null,
                'citizenship' => $country['citizenship'] ?? null,
                'country_code' => $country['country-code'] ?? '',
                'currency' => $country['currency'] ?? null,
                'currency_code' => $country['currency_code'] ?? null,
                'currency_sub_unit' => $country['currency_sub_unit'] ?? null,
                'currency_symbol' => $country['currency_symbol'] ?? null,
                'currency_decimals' => isset($country['currency_decimals']) ? (int) $country['currency_decimals'] : null,
                'full_name' => $country['full_name'] ?? null,
                'iso_3166_2' => $country['iso_3166_2'] ?? '',
                'iso_3166_3' => $country['iso_3166_3'] ?? '',
                'name' => $country['name'] ?? '',
                'region_code' => $country['region-code'] ?? '',
                'sub_region_code' => $country['sub-region-code'] ?? '',
                'eea' => (bool) ($country['eea'] ?? false),
                'calling_code' => $country['calling_code'] ?? null,
                'flag' => $country['flag'] ?? null,
            ];
        }

        // Insert in chunks to avoid memory issues
        foreach (array_chunk($insertData, 50) as $chunk) {
            DB::table($tableName)->insert($chunk);
        }

        $this->command->info('Seeded ' . count($insertData) . ' countries from vendor JSON.');
    }
}
