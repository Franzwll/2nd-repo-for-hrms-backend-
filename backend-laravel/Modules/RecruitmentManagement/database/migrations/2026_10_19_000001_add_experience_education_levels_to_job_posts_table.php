<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Accepted screening-level lists ("any of these") for experience and
     * education. The scalar experience_level / education_level columns keep
     * holding the weakest accepted level; these JSON columns store the full
     * chip selections chosen in the job-post builder.
     */
    public function up(): void
    {
        Schema::table('job_posts', function (Blueprint $table) {
            $table->json('experience_levels')->nullable()->after('experience_level');
            $table->json('education_levels')->nullable()->after('education_level');
        });
    }

    public function down(): void
    {
        Schema::table('job_posts', function (Blueprint $table) {
            $table->dropColumn(['experience_levels', 'education_levels']);
        });
    }
};
