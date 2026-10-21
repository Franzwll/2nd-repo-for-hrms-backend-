<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Accepted screening level chips ("any of these") on a job post.
     *
     * The Screening Requirements panel offers education / experience levels as
     * chips fed by Reference Data, so one posting can accept several levels.
     * The scalar experience_level / education_level columns keep holding the
     * WEAKEST accepted level (what the screener gates on); these JSON columns
     * carry the full accepted list. The builder has always sent both shapes,
     * but the migration that creates the list columns never landed in the
     * repository — only in the shared database — so every environment without
     * that manual alter failed to Save draft / Save changes with
     * SQLSTATE[42S22] Unknown column 'experience_levels'.
     *
     * Nullable so every existing row keeps working: a null value simply means
     * "only the scalar level applies", exactly like the legacy posts built
     * before the chips existed. Guarded with hasColumn so databases where the
     * columns were added by hand (without this migration being recorded) pick
     * the record up without a duplicate-column error.
     */
    public function up(): void
    {
        if (! Schema::hasColumn('job_posts', 'experience_levels')) {
            Schema::table('job_posts', function (Blueprint $table) {
                $table->json('experience_levels')->nullable()->after('experience_level');
            });
        }

        if (! Schema::hasColumn('job_posts', 'education_levels')) {
            Schema::table('job_posts', function (Blueprint $table) {
                $table->json('education_levels')->nullable()->after('education_level');
            });
        }
    }

    public function down(): void
    {
        Schema::table('job_posts', function (Blueprint $table) {
            $table->dropColumn(['experience_levels', 'education_levels']);
        });
    }
};
