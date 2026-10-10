<?php

namespace Modules\ApplicantManagement\Services;

use Modules\Settings\Models\SystemSetting;

/**
 * Global Assessment Test / Practical Test switches owned by Core HCM.
 *
 * Stored in the existing `system_settings` key-value store so no new
 * table is required:
 *   assessments.assessment_test_enabled (bool, default true)
 *   assessments.practical_test_enabled  (bool, default true)
 *
 * Applicant Management only READS these flags (UI gating + API 422 gates).
 * Writes happen from Core HCM via PUT /api/v1/settings/bulk or
 * PUT /api/v1/settings/{key} (permission: Settings:Edit / Core HCM).
 */
class AssessmentConfig
{
    public const ASSESSMENT_KEY = 'assessments.assessment_test_enabled';
    public const PRACTICAL_KEY = 'assessments.practical_test_enabled';

    public static function assessmentTestEnabled(): bool
    {
        return self::flag(self::ASSESSMENT_KEY, true);
    }

    public static function practicalTestEnabled(): bool
    {
        return self::flag(self::PRACTICAL_KEY, true);
    }

    /** @return array{assessment_test_enabled: bool, practical_test_enabled: bool} */
    public static function all(): array
    {
        return [
            'assessment_test_enabled' => self::assessmentTestEnabled(),
            'practical_test_enabled' => self::practicalTestEnabled(),
        ];
    }

    private static function flag(string $key, bool $default): bool
    {
        try {
            $row = SystemSetting::where('setting_key', $key)->first();
            if (! $row) {
                return $default;
            }
            $v = $row->setting_value;
            if (is_bool($v)) {
                return $v;
            }
            if (is_array($v) && array_key_exists('enabled', $v)) {
                return (bool) $v['enabled'];
            }
            if (is_string($v)) {
                return ! in_array(strtolower($v), ['0', 'false', 'off', 'no'], true);
            }

            return (bool) $v;
        } catch (\Throwable) {
            return $default;
        }
    }
}
