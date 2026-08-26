<?php

namespace Modules\Settings\Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\Settings\Models\SystemSetting;

class SettingsDatabaseSeeder extends Seeder
{
    /**
     * Seed the default portal settings (idempotent — existing keys are kept).
     */
    public function run(): void
    {
        $defaults = [
            'company' => [
                'name'          => 'Oxford Suites',
                'email'         => 'hr@oxfordsuites.com.ph',
                'contact'       => '+63 2 8999 0000',
                'businessHours' => 'Monday–Friday · 8:00 AM – 6:00 PM',
                'address'       => '123 Makati Avenue, Makati City, Metro Manila',
                'tin'           => '000-000-000-000',
            ],

            'preferences' => [
                'theme'      => 'Light',
                'language'   => 'English',
                'dateFormat' => 'MM/DD/YYYY',
                'timeFormat' => '12-hour',
                'timeZone'   => 'Asia/Manila (GMT+8)',
            ],

            'notifications' => [
                'Email notifications'  => true,
                'Browser notifications' => false,
                'System announcements'  => true,
            ],

            'security' => [
                'twoFactor'        => false,
                'minLength'        => 8,
                'requireUppercase' => true,
                'requireLowercase' => true,
                'requireNumber'    => true,
                'requireSymbol'    => false,
                'sessionTimeout'   => '30 minutes',
                'maxLoginAttempts' => '5 attempts',
            ],

            // Automatic backup schedule consumed by settings:auto-backup
            'backup' => [
                'enabled'  => true,
                'schedule' => 'daily',
            ],

            // Default password used for new user accounts / auto-provisioned
            // demo portals (see MySettingsController::changePassword).
            'default_password' => [
                'password' => 'Oxford@2026',
            ],
        ];

        foreach ($defaults as $key => $value) {
            if (SystemSetting::where('setting_key', $key)->doesntExist()) {
                SystemSetting::setValue($key, $value);
            }
        }
    }
}
