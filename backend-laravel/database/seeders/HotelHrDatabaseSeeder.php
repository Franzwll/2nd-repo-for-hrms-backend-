<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class HotelHrDatabaseSeeder extends Seeder
{
    /**
     * Load the hotel_hr seed data from the MySQL dump file.
     *
     * The dump contains the full 42-table dataset (departments, employees,
     * applicants, requisitions, hires, ESS, payroll, learning, settings...)
     * matching the initial frontend fixtures.
     *
     * The dump uses explicit primary keys and plain INSERTs (no TRUNCATE), so it
     * can only run against an EMPTY schema. Guard re-runs: otherwise `db:seed` on
     * a populated database aborts with "Duplicate entry '…' for key 'PRIMARY'".
     */
    public function run(): void
    {
        if (Schema::hasTable('employees') && DB::table('employees')->exists()) {
            $this->command?->warn(
                'HotelHrDatabaseSeeder: database already contains data - skipping. '.
                'For a clean rebuild run: php artisan migrate:fresh --seed'
            );

            return;
        }

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
