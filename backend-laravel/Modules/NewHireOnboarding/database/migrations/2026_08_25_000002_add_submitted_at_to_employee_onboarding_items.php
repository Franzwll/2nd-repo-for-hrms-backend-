<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Employees SUBMIT requirements (document + notes); only Admin/Super Admin
     * verification toggles `done` and moves the hire's progress forward.
     */
    public function up(): void
    {
        Schema::table('employee_onboarding_items', function (Blueprint $table) {
            $table->timestamp('submitted_at')->nullable()->after('done');
        });
    }

    public function down(): void
    {
        Schema::table('employee_onboarding_items', function (Blueprint $table) {
            $table->dropColumn('submitted_at');
        });
    }
};
