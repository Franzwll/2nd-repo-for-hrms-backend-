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
                'name'          => 'Oxford Suites Makati',
                'email'         => 'hr@oxfordsuites.com.ph',
                'contact'       => '+63 2 8888 8688',
                'businessHours' => '24 Hours',
                'address'       => '528 P. Burgos Street, Makati City, Metro Manila, Philippines 1210',
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

            // Probationary day threshold consumed by New Hire Onboarding
            // auto-regularization (admin ticker + employee countdown).
            // Scalar on purpose — readers do Number(setting_value).
            'onboarding.auto_regularize_days' => 180,
        ];

        foreach ($defaults as $key => $value) {
            if (SystemSetting::where('setting_key', $key)->doesntExist()) {
                SystemSetting::setValue($key, $value);
            }
        }
    }
}
