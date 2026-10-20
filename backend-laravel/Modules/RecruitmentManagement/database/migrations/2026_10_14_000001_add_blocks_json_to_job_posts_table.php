<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Remember the builder's block arrangement.
     *
     * The Job Post Builder canvas is drag-and-drop, so the order a recruiter
     * arranges the blocks in is part of how the post reads. That order lived
     * only in React state, so saving and reopening a post always snapped back to
     * the default sequence and the drag appeared to do nothing.
     *
     * `blocks_json` stores the ordered list of block ids. Nullable so every
     * existing row keeps working: a null value simply means "use the default
     * order", which is what those posts were built with anyway.
     */
    public function up(): void
    {
        Schema::table('job_posts', function (Blueprint $table) {
            $table->json('blocks_json')->nullable()->after('picture');
        });
    }

    public function down(): void
    {
        Schema::table('job_posts', function (Blueprint $table) {
            $table->dropColumn('blocks_json');
        });
    }
};
