<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Provenance for employee files. When an applicant is promoted to an
     * employee their resume and supporting documents are copied into the ERM
     * as employee_documents; these columns record where each file originated
     * (applicant vs manual vs ESS fulfilment) so the record can be traced.
     */
    public function up(): void
    {
        Schema::table('employee_documents', function (Blueprint $table) {
            $table->string('source_type', 30)->nullable()->after('category'); // applicant | manual | fulfillment
            $table->unsignedBigInteger('source_id')->nullable()->after('source_type');
            $table->string('original_name', 255)->nullable()->after('source_id');
            $table->string('source_hash', 128)->nullable()->after('original_name');

            $table->index(['source_type', 'source_id'], 'idx_employee_documents_source');
        });
    }

    public function down(): void
    {
        Schema::table('employee_documents', function (Blueprint $table) {
            $table->dropIndex('idx_employee_documents_source');
            $table->dropColumn(['source_type', 'source_id', 'original_name', 'source_hash']);
        });
    }
};
