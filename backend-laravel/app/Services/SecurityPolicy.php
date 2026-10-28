<?php

namespace App\Services;

use Modules\Settings\Models\SystemSetting;

class SecurityPolicy
{
    public static function settings(): array
    {
        $value = SystemSetting::getValue('security', []);

        return array_merge([
            'minLength' => 8,
            'requireUppercase' => true,
            'requireLowercase' => true,
            'requireNumber' => true,
            'requireSymbol' => false,
            'sessionTimeout' => '30 minutes',
            'maxLoginAttempts' => '5 attempts',
        ], is_array($value) ? $value : []);
    }

    public static function minLength(): int
    {
        return max(6, min(32, (int) (static::settings()['minLength'] ?? 8)));
    }

    public static function passwordRules(bool $required = true): array
    {
        $settings = static::settings();
        $rules = [
            $required ? 'required' : 'nullable',
            'string',
            'min:' . static::minLength(),
            'max:72',
        ];

        if (! empty($settings['requireUppercase'])) {
            $rules[] = 'regex:/[A-Z]/';
        }
        if (! empty($settings['requireLowercase'])) {
            $rules[] = 'regex:/[a-z]/';
        }
        if (! empty($settings['requireNumber'])) {
            $rules[] = 'regex:/[0-9]/';
        }
        if (! empty($settings['requireSymbol'])) {
            $rules[] = 'regex:/[^A-Za-z0-9]/';
        }

        return $rules;
    }

    public static function maxLoginAttempts(): int
    {
        $value = (string) (static::settings()['maxLoginAttempts'] ?? '5 attempts');

        return max(1, (int) (preg_match('/\d+/', $value, $matches) ? $matches[0] : 5));
    }

    public static function idleMinutes(): int
    {
        $value = (string) (static::settings()['sessionTimeout'] ?? '30 minutes');

        return max(1, (int) (preg_match('/\d+/', $value, $matches) ? $matches[0] : 30));
    }

    public static function publicPolicy(): array
    {
        $settings = static::settings();

        return [
            'min_length' => static::minLength(),
            'require_uppercase' => (bool) ($settings['requireUppercase'] ?? false),
            'require_lowercase' => (bool) ($settings['requireLowercase'] ?? false),
            'require_number' => (bool) ($settings['requireNumber'] ?? false),
            'require_symbol' => (bool) ($settings['requireSymbol'] ?? false),
            'max_login_attempts' => static::maxLoginAttempts(),
            'idle_timeout_minutes' => static::idleMinutes(),
        ];
    }
}
