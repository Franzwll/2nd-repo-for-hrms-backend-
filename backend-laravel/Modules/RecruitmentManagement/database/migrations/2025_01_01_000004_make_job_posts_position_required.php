<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Modules\RecruitmentManagement\Models\JobPost;

return new class extends Migration
{
    /**
     * Tie every job post to a Core HR position:
     *  - backfill missing position_id by matching the legacy title
     *  - sync title/slug from the position so both refer to position.title
     *  - make position_id required
     */
    public function up(): void
    {
        DB::statement(
            'UPDATE `job_posts` jp JOIN `positions` p ON p.title = jp.title '.
            'SET jp.position_id = p.position_id WHERE jp.position_id IS NULL'
        );

        $orphans = DB::table('job_posts')->whereNull('position_id')->get();
        foreach ($orphans as $orphan) {
            logger()->warning(
                'Deleting orphan job post without a matching Core HR position: '.
                "id={$orphan->job_post_id} title={$orphan->title}"
            );
        }
        DB::table('job_posts')->whereNull('position_id')->delete();

        DB::statement(
            'UPDATE `job_posts` jp JOIN `positions` p ON p.position_id = jp.position_id '.
            'SET jp.title = p.title WHERE jp.title <> p.title'
        );

        foreach (JobPost::all() as $jobPost) {
            $position = $jobPost->position()->first();
            if (! $position) {
                continue;
            }
            $expectedSlug = Str::slug($position->title);
            if ($jobPost->slug !== $expectedSlug) {
                $jobPost->forceFill([
                    'slug' => JobPost::generateSlug($position->title, $jobPost->job_post_id),
                ])->saveQuietly();
            }
        }

        Schema::table('job_posts', function (Blueprint $table) {
            $table->unsignedBigInteger('position_id')->nullable(false)->change();
        });
    }

    public function down(): void
    {
        Schema::table('job_posts', function (Blueprint $table) {
            $table->unsignedBigInteger('position_id')->nullable()->change();
        });
    }
};
