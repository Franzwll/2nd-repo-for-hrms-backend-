<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class SystemUserPasswordSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $hash = Hash::make('Oxford@2026');

        DB::table('system_users')->update(['password_hash' => $hash]);
    }
}