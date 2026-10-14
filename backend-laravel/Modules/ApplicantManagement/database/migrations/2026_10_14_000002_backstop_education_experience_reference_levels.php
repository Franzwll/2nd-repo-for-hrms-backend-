<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Backstop for the education / experience vocabulary the builder dropdowns
     * read, plus one more mis-typed row repair.
     *
     * The Job Post Builder's "Education level" and "Experience level" selects are
     * driven by screening reference data instead of hard-coded option lists, so
     * the four standard levels must always be present. This is updateOrInsert,
     * so re-running it is safe and it will not duplicate existing rows — on a
     * healthy database it is a no-op that only restores anything deleted.
     */
    public function up(): void
    {
        $table = 'screening_reference_data';

        if (! DB::getSchemaBuilder()->hasTable($table)) {
            return;
        }

        $seed = [
            'education' => [
                'High School Graduate' => ['high school graduate', 'high school', 'secondary education', 'senior high school', 'senior high', 'grade 12', 'k to 12'],
                'Vocational / TESDA' => ['vocational / tesda', 'vocational', 'tesda', 'vocational diploma', 'technical course', 'technical vocational', 'nc ii holder'],
                'College Level' => ['college level', 'college undergraduate', 'undergraduate', 'some college', 'associate degree', 'associate', 'diploma'],
                "Bachelor's Degree" => ["bachelor's degree", "bachelor's", 'bachelor', 'b.s.', 'bs', 'b.a.', 'ba', 'college graduate', "bachelor's degree holder", 'bachelor degree'],
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

        // The Experience dropdown lists whatever is typed as "experience", so a
        // division name mistyped into that column showed up as a selectable
        // experience level ("Front Office"). It is a job role — move it back.
        DB::table($table)
            ->where('data_type', 'experience')
            ->whereIn('canonical_value', ['Front Office'])
            ->update(['data_type' => 'job_role', 'updated_at' => now()]);

        // Note: narrower education entries such as "BS Tourism" stay. The
        // builder's Education select lists the whole education vocabulary, and
        // those are legitimate qualifications an HR officer can require.

        $this->flushCache();
    }

    public function down(): void
    {
        // Data repair is intentionally not reversible — re-mistyping the row
        // would put "Front Office" back in the Experience dropdown.
    }

    private function flushCache(): void
    {
        try {
            \Illuminate\Support\Facades\Cache::forget('screening_reference_data');
        } catch (\Throwable) {
        }
    }
};
