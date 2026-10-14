<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('employee_onboarding_items', function (Blueprint $table) {
            $table->text('review_note')->nullable();
            $table->unsignedInteger('returned_count')->default(0);
        });
    }

    public function down(): void
    {
        Schema::table('employee_onboarding_items', function (Blueprint $table) {
            $table->dropColumn(['review_note', 'returned_count']);
        });
    }
};
