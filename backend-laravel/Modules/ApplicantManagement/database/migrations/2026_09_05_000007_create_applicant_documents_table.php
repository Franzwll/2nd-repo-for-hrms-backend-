<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Verification documents uploaded with an applicant (Recruitment
     * Management "Add Applicant" and the landing-page apply form). Used to
     * verify the content claimed in the resume and to rank Top Candidates.
     *
     * doc_type: COE | Certificate | Credential | Others
     * original_copy: whether the uploaded proof is an original copy of the
     *                requirement (as opposed to a photocopy / scan).
     */
    public function up(): void
    {
        Schema::create('applicant_documents', function (Blueprint $table) {
            $table->id('applicant_document_id');
            $table->unsignedBigInteger('applicant_id');
            $table->string('doc_type', 30);                              // COE | Certificate | Credential | Others
            $table->string('title', 190)->nullable();
            $table->boolean('original_copy')->default(false);
            $table->text('file_path')->nullable();
            $table->string('original_name', 255)->nullable();
            $table->timestamp('uploaded_at')->useCurrent();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

            $table->index('applicant_id', 'idx_applicant_documents_applicant_id');
            $table->index('doc_type', 'idx_applicant_documents_doc_type');

            $table->foreign('applicant_id', 'fk_applicant_documents_applicant_id')
                  ->references('applicant_id')->on('applicants')->onDelete('cascade');
        });

        DB::statement("ALTER TABLE `applicant_documents` ADD CONSTRAINT `chk_applicant_documents_doc_type` CHECK (`doc_type` IN ('COE', 'Certificate', 'Credential', 'Others'))");
    }

    public function down(): void
    {
        Schema::dropIfExists('applicant_documents');
    }
};
