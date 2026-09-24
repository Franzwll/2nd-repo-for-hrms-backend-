<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Adds the supporting-document verification evidence to the EXISTING
     * applicant_screenings table so the candidate's ranking percentage and
     * official status can be recomputed whenever a document is uploaded,
     * re-verified or removed:
     *
     * document_verification_json  Full evidence block returned by the NLP
     *                             service (documents score, verified /
     *                             discrepancy / unable counts, penalty, flags)
     * resume_match_score          The resume-only score BEFORE the document
     *                             evidence was blended in, so HR can see both.
     *
     * Both columns are nullable, so existing rows need no backfill.
     */
    public function up(): void
    {
        Schema::table('applicant_screenings', function (Blueprint $table) {
            $table->decimal('resume_match_score', 5, 2)->nullable()->after('match_score');
            $table->longtext('document_verification_json')->nullable()->after('alternative_job_json');
        });
    }

    public function down(): void
    {
        Schema::table('applicant_screenings', function (Blueprint $table) {
            $table->dropColumn(['resume_match_score', 'document_verification_json']);
        });
    }
};
