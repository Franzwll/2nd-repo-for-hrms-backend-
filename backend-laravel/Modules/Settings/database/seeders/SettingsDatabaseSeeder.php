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

            // Interview facilities (Phase 4b). Kept with their original ids so
            // interviews.facility_id remains a stable reference.
            'interview.facilities' => [
                [
                    'facility_id' => 1,
                    'name'        => 'Room 1',
                    'type'        => 'On-site',
                    'location'    => 'Oxford Suites Makati, HR Office, 3rd Floor',
                    'capacity'    => 1,
                    'icon'        => 'room',
                    'description' => 'Primary on-site interview room with guest-facing setup.',
                    'is_active'   => true,
                    'created_at'  => '2026-10-18 17:06:12',
                    'updated_at'  => '2026-10-18 17:06:12',
                ],
                [
                    'facility_id' => 2,
                    'name'        => 'Room 2',
                    'type'        => 'On-site',
                    'location'    => 'Oxford Suites Makati, HR Office, 3rd Floor',
                    'capacity'    => 1,
                    'icon'        => 'room',
                    'description' => 'Secondary on-site interview room for panel interviews.',
                    'is_active'   => true,
                    'created_at'  => '2026-10-18 17:06:12',
                    'updated_at'  => '2026-10-18 17:06:12',
                ],
                [
                    'facility_id' => 3,
                    'name'        => 'Room 3',
                    'type'        => 'On-site',
                    'location'    => 'Oxford Suites Makati, HR Office, 3rd Floor',
                    'capacity'    => 2,
                    'icon'        => 'room',
                    'description' => 'Practical demonstration room for hands-on assessments.',
                    'is_active'   => true,
                    'created_at'  => '2026-10-18 17:06:12',
                    'updated_at'  => '2026-10-18 17:06:12',
                ],
                [
                    'facility_id' => 4,
                    'name'        => 'Online Interview',
                    'type'        => 'Virtual',
                    'location'    => 'meet.oxfordsuites.ph/interview-room',
                    'capacity'    => 5,
                    'icon'        => 'online',
                    'description' => 'Virtual interview room hosted on the company meeting platform.',
                    'is_active'   => true,
                    'created_at'  => '2026-10-18 17:06:12',
                    'updated_at'  => '2026-10-18 17:06:12',
                ],
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
