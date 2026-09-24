<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Adds supporting-document verification results to the EXISTING
     * applicant_documents table (no new tables, no changes to other tables):
     *
     * verification_status       PENDING | VERIFIED | DISCREPANCY_FOUND | UNABLE_TO_VERIFY | PROCESSING
     * verification_result_json  Full structured field-by-field comparison from the NLP service
     * extracted_profile_json    Raw entity extraction taken from the document itself
     * verified_at               When the last verification run completed
     */
    public function up(): void
    {
        Schema::table('applicant_documents', function (Blueprint $table) {
            $table->string('verification_status', 30)->nullable()->default('PENDING')
                  ->after('original_name');
            $table->longtext('verification_result_json')->nullable()
                  ->after('verification_status');
            $table->longtext('extracted_profile_json')->nullable()
                  ->after('verification_result_json');
            $table->timestamp('verified_at')->nullable()
                  ->after('extracted_profile_json');

            $table->index('verification_status', 'idx_applicant_documents_verification_status');
        });
    }

    public function down(): void
    {
        Schema::table('applicant_documents', function (Blueprint $table) {
            $table->dropIndex('idx_applicant_documents_verification_status');
            $table->dropColumn([
                'verification_status',
                'verification_result_json',
                'extracted_profile_json',
                'verified_at',
            ]);
        });
    }
};
