<?php

namespace Modules\RecruitmentManagement\Http\Requests\Concerns;

use Illuminate\Validation\Rule;

/**
 * Accepted education / experience level values for a job post.
 *
 * The Screening Requirements chips are fed by Screening Reference Data, so a
 * post may legitimately carry any canonical level the admin has defined there
 * (e.g. "Master's Degree", "Bachelor of Science in Tourism Management") - not
 * just the four built-in bands. Validation therefore accepts the built-ins plus
 * the active Reference Data canonical values, and falls back to the built-ins
 * alone when Reference Data is unavailable (mirrors the frontend's fallback).
 */
trait ResolvesLevelOptions
{
    /** Built-in bands, kept for older clients and a reference-data-less server. */
    public const EDUCATION_LEVELS = [
        'High School Graduate',
        'Vocational / TESDA',
        'College Level',
        "Bachelor's Degree",
    ];

    public const EXPERIENCE_LEVELS = [
        'No Experience',
        '1-2 Years',
        '3-5 Years',
        '5+ Years',
    ];

    /**
     * Built-in bands merged with the active Reference Data canonical values for
     * one level type.
     *
     * @param  list<string>  $builtIns
     * @return list<string>
     */
    protected function levelOptions(string $type, array $builtIns): array
    {
        $values = $builtIns;

        try {
            if (class_exists(\Modules\ApplicantManagement\Models\ScreeningReferenceData::class)) {
                $values = array_merge($values, array_keys(
                    \Modules\ApplicantManagement\Models\ScreeningReferenceData::mappingFor($type),
                ));
            }
        } catch (\Throwable) {
            // Reference Data unavailable - the built-in bands still validate.
        }

        return array_values(array_unique(array_filter($values)));
    }

    /** @return list<mixed> */
    protected function educationLevelRule(): array
    {
        return ['string', 'max:100', Rule::in($this->levelOptions('education', self::EDUCATION_LEVELS))];
    }

    /** @return list<mixed> */
    protected function experienceLevelRule(): array
    {
        return ['string', 'max:50', Rule::in($this->levelOptions('experience', self::EXPERIENCE_LEVELS))];
    }
}
