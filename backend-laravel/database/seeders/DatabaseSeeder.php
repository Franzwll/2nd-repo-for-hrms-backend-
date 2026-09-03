<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Modules\ApplicantManagement\Database\Seeders\ScreeningReferenceDataSeeder;
use Modules\Settings\Database\Seeders\SettingsDatabaseSeeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(HotelHrDatabaseSeeder::class);
        $this->call(SystemUserPasswordSeeder::class);
        $this->call(ScreeningReferenceDataSeeder::class);
        $this->call(SettingsDatabaseSeeder::class);
    }
}
