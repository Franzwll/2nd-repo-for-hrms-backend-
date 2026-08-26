<?php

namespace Modules\RecruitmentManagement\Enums;

/**
 * Enumerates the work schedule options available to the job post builder.
 * Kept in sync with WORK_SCHEDULE_OPTIONS in RecruitmentManagement.tsx.
 */
enum WorkSchedule: string
{
    case Shifting = 'Shifting Schedule';
    case DayShift = 'Day Shift (8:00 AM - 5:00 PM)';
    case NightShift = 'Night Shift (10:00 PM - 6:00 AM)';
    case Weekdays = 'Monday to Friday (9:00 AM - 6:00 PM)';
    case Flexible = 'Flexible Schedule';
    case Weekend = 'Weekend Shift';
    case Rotating = 'Rotating Shifts';

    /** @return list<string> */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
