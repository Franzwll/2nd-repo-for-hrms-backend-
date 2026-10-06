<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Practical assessment requirement per job post. Only designated
     * positions require a practical exam after the assessment test.
     */
    public function up(): void
    {
        Schema::table('job_posts', function (Blueprint $table) {
            $table->boolean('requires_practical')->default(false)->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('job_posts', function (Blueprint $table) {
            $table->dropColumn('requires_practical');
        });
    }
};
