<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Persist the three builder text blocks that were previously
     * draft-only: Additional Info (list), Instructions + About (prose).
     * All nullable so existing rows keep working untouched.
     */
    public function up(): void
    {
        Schema::table('job_posts', function (Blueprint $table) {
            $table->json('additional_json')->nullable()->after('skills_json');
            $table->text('instructions')->nullable()->after('additional_json');
            $table->text('about')->nullable()->after('instructions');
        });
    }

    public function down(): void
    {
        Schema::table('job_posts', function (Blueprint $table) {
            $table->dropColumn(['additional_json', 'instructions', 'about']);
        });
    }
};
