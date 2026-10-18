<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tier-1 thin LMS — §1c (completion_source) and §1e (reading_completed_at).
 * `score` / `status` / `completed_date` already exist and are unchanged.
 * Additive; rollback with `php artisan migrate:rollback`.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('employee_learning', function (Blueprint $table) {
            // §1c — 'quiz' | 'hr' | 'import'
            $table->string('completion_source', 20)->nullable()->after('completed_date');

            // §1e — hard read gate (quiz endpoint refuses until this is set)
            $table->timestamp('reading_completed_at')->nullable()->after('completion_source');
        });
    }

    public function down(): void
    {
        Schema::table('employee_learning', function (Blueprint $table) {
            $table->dropColumn(['completion_source', 'reading_completed_at']);
        });
    }
};
