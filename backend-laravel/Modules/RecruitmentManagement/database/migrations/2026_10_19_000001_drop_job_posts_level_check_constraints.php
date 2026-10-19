<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /** @var string[] */
    private array $constraints = [
        'chk_job_posts_experience_level',
        'chk_job_posts_education_level',
    ];

    /**
     * Drop the fixed four-value CHECK constraints on the job post education /
     * experience levels.
     *
     * The builder's level chips are fed by screening Reference Data (see the
     * level-list columns), so HR can require any level the screening vocabulary
     * knows — degree specialisations, Master's, Doctorate, custom experience
     * bands. The original checks only allowed the four base ranks, so every
     * other reference value was rejected at the database layer.
     */
    public function up(): void
    {
        foreach ($this->constraints as $constraint) {
            $this->dropConstraint($constraint);
        }
    }

    public function down(): void
    {
        // Only valid while every stored level is one of the four base ranks.
        $this->addCheck(
            'chk_job_posts_experience_level',
            "`experience_level` IS NULL OR `experience_level` IN ('No Experience', '1-2 Years', '3-5 Years', '5+ Years')",
        );
        $this->addCheck(
            'chk_job_posts_education_level',
            "`education_level` IS NULL OR `education_level` IN ('High School Graduate', 'Vocational / TESDA', 'College Level', 'Bachelor''s Degree')",
        );
    }

    private function dropConstraint(string $constraint): void
    {
        if (! $this->hasConstraint($constraint)) {
            return;
        }

        $driver = DB::connection()->getDriverName();

        DB::statement(match ($driver) {
            'pgsql' => "ALTER TABLE \"job_posts\" DROP CONSTRAINT \"{$constraint}\"",
            default => "ALTER TABLE `job_posts` DROP CONSTRAINT `{$constraint}`",
        });
    }

    private function addCheck(string $constraint, string $clause): void
    {
        if ($this->hasConstraint($constraint)) {
            return;
        }

        $driver = DB::connection()->getDriverName();
        $clause = $driver === 'pgsql' ? str_replace('`', '"', $clause) : $clause;

        DB::statement("ALTER TABLE job_posts ADD CONSTRAINT {$constraint} CHECK ({$clause})");
    }

    private function hasConstraint(string $constraint): bool
    {
        try {
            $query = DB::table('information_schema.table_constraints')
                ->where('table_name', 'job_posts')
                ->where('constraint_name', $constraint);

            if (DB::connection()->getDriverName() !== 'pgsql') {
                $query->where('table_schema', DB::connection()->getDatabaseName());
            }

            return $query->exists();
        } catch (Throwable) {
            return false;
        }
    }
};
