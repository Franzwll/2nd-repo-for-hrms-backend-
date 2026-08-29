<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{ 
    public function up(): void
    {
        if (Schema::hasColumn('job_posts', 'benefits_json')) {
            Schema::table('job_posts', function (Blueprint $table) {
                $table->dropColumn('benefits_json');
            });
        }
    }

    public function down(): void
    {
        if (! Schema::hasColumn('job_posts', 'benefits_json')) {
            Schema::table('job_posts', function (Blueprint $table) {
                $table->json('benefits_json')->nullable()->after('skills_json');
            });
        }
    }
};
