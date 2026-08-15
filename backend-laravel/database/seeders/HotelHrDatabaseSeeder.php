<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class HotelHrDatabaseSeeder extends Seeder
{
    /**
     * Load the hotel_hr seed data from the MySQL dump file.
     *
     * The dump contains the full 42-table dataset (departments, employees,
     * applicants, requisitions, hires, ESS, payroll, learning, settings...)
     * matching the initial frontend fixtures.
     */
    public function run(): void
    {
        $file = database_path('seeders/data/hotel_hr_seed_mysql.sql');

        if (! file_exists($file)) {
            $this->command?->error("Seed file not found: {$file}");
            return;
        }

        $sql = file_get_contents($file);

        // Drop the "USE hotel_hr;" statement so seeding always targets the
        // connection configured in .env, regardless of the database name.
        $sql = preg_replace('/^USE\s+`?[^`;]+`?\s*;/mi', '', $sql);

        DB::unprepared($sql);
    }
}
