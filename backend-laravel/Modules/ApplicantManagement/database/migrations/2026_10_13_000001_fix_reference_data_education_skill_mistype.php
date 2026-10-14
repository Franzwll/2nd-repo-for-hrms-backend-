<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Repairs mis-typed screening reference rows and backfills the managed
     * education / experience vocabulary.
     *
     * Why: degrees such as "Bachelor's Degree" / "BS Tourism" /
     * "Bachelor degree in Hospitality or related field" were saved with
     * data_type = skill (the Add dialog defaults to skill), so they render
     * under Skill while the Education section stays empty. The original
     * seeder also only seeded skill / job_role / certification, so education
     * and experience could never populate.
     */
    public function up(): void
    {
        $table = 'screening_reference_data';

        if (! DB::getSchemaBuilder()->hasTable($table)) {
            return;
        }

        // 1) Move known degree values from skill -> education.
        $misTypedEducation = [
            'Bachelor degree in Hospitality or related field',
            "Bachelor's Degree",
            'BS Tourism',
        ];
        DB::table($table)
            ->where('data_type', 'skill')
            ->whereIn('canonical_value', $misTypedEducation)
            ->update(['data_type' => 'education', 'updated_at' => now()]);

        // 2) Backfill education + experience vocab (idempotent).
        $seed = [
            'education' => [
                'High School Graduate' => ['high school graduate', 'high school', 'secondary education', 'senior high school', 'senior high', 'grade 12', 'k to 12'],
                'Vocational / TESDA' => ['vocational / tesda', 'vocational', 'tesda', 'vocational diploma', 'technical course', 'technical vocational', 'nc ii holder'],
                'College Level' => ['college level', 'college undergraduate', 'undergraduate', 'some college', 'associate degree', 'associate', 'diploma'],
                "Bachelor's Degree" => ["bachelor's degree", "bachelor's", 'bachelor', 'b.s.', 'bs', 'b.a.', 'ba', 'college graduate', "bachelor's degree holder", 'bachelor degree'],
                'Bachelor of Science in Hospitality Management' => ['bachelor of science in hospitality management', 'bs hospitality management', 'bshm', 'bs hm', 'hospitality management degree'],
                'Bachelor of Science in Tourism Management' => ['bachelor of science in tourism management', 'bs tourism', 'bs tourism management', 'tourism degree'],
                'Bachelor of Science in Business Administration' => ['bachelor of science in business administration', 'bsba', 'bs business administration', 'business administration degree'],
                'Bachelor degree in Hospitality or related field' => ['bachelor degree in hospitality or related field', 'bachelor in hospitality', 'hospitality degree or related field', 'degree in hospitality'],
                "Master's Degree" => ["master's degree", "master's", 'master', 'm.s.', 'mba', 'graduate degree', 'postgraduate degree'],
                'Doctorate' => ['doctorate', 'phd', 'doctoral degree', 'ph.d.'],
            ],
            'experience' => [
                'No Experience' => ['no experience', 'fresh graduate', 'entry level', 'no work experience', 'student'],
                '1-2 Years' => ['1-2 years', '1 to 2 years', 'one to two years', 'at least 1 year', '1 year experience', '2 years experience'],
                '3-5 Years' => ['3-5 years', '3 to 5 years', 'three to five years', 'at least 3 years', '3 years experience', '5 years experience'],
                '5+ Years' => ['5+ years', '5 years and above', 'more than 5 years', 'five plus years', 'senior level experience', 'extensive experience'],
            ],
        ];

        foreach ($seed as $type => $entries) {
            foreach ($entries as $canonical => $aliases) {
                DB::table($table)->updateOrInsert(
                    ['data_type' => $type, 'canonical_value' => $canonical],
                    ['aliases_json' => json_encode($aliases), 'active' => true]
                );
            }
        }

        // 3) Drop the stale grouped-mapping cache so the UI reflects the fix.
        try {
            \Illuminate\Support\Facades\Cache::forget('screening_reference_data');
        } catch (\Throwable) {
        }
    }

    public function down(): void
    {
        // Data repair is intentionally not reversible: re-mistyping degrees
        // would bring the bug back. Education / experience rows stay.
    }
};
