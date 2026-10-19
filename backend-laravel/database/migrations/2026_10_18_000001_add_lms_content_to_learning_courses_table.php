<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tier-1 thin LMS — §1a (handbook content + cached quiz) and §1d (card-parity columns).
 * Purely additive; rollback with `php artisan migrate:rollback`.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('learning_courses', function (Blueprint $table) {
            // §1a — reading material + server-only quiz cache
            $table->longText('content_text')->nullable()->after('description');
            $table->string('material_path', 255)->nullable()->after('content_text');
            $table->json('quiz_json')->nullable()->after('material_path');
            $table->timestamp('quiz_generated_at')->nullable()->after('quiz_json');

            // §1d — card parity (pages / read-time / mandatory tag, spell-corrected)
            $table->unsignedSmallInteger('estimated_reading_minutes')->nullable()->after('quiz_generated_at');
            $table->unsignedSmallInteger('estimated_pages')->nullable()->after('estimated_reading_minutes');
            $table->boolean('mandatory')->default(false)->after('estimated_pages');
        });
    }

    public function down(): void
    {
        Schema::table('learning_courses', function (Blueprint $table) {
            $table->dropColumn([
                'content_text',
                'material_path',
                'quiz_json',
                'quiz_generated_at',
                'estimated_reading_minutes',
                'estimated_pages',
                'mandatory',
            ]);
        });
    }
};
