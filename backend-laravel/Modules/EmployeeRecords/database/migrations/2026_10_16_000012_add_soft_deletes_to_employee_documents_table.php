<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Employee 201-file documents are archived, not destroyed. A document removed
 * from a record must remain recoverable for audit / retention, so deletes are
 * soft.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('employee_documents', function (Blueprint $table) {
            $table->softDeletes();
            $table->index('deleted_at', 'idx_employee_documents_deleted_at');
        });
    }

    public function down(): void
    {
        Schema::table('employee_documents', function (Blueprint $table) {
            $table->dropIndex('idx_employee_documents_deleted_at');
            $table->dropSoftDeletes();
        });
    }
};
