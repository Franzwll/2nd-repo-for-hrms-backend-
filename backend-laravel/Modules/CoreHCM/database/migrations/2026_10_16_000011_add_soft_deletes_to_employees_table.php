<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Employees are archived, not hard-deleted. Statutory 201-file retention means
 * a separated employee's record (and its position history) must survive; the
 * old destroy() physically removed the row and cascaded the documents away.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->softDeletes();
            $table->index('deleted_at', 'idx_employees_deleted_at');
        });
    }

    public function down(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->dropIndex('idx_employees_deleted_at');
            $table->dropSoftDeletes();
        });
    }
};
