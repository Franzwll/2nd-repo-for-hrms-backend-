<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Normalises the seeded "Company Website" channel label to "Website".
     *
     * The Publish To row keys its toggles as Website / Facebook / Instagram /
     * Indeed, and the builder writes exactly those strings. Older seed rows used
     * the longer "Company Website", which left the data in two states:
     *
     *   - a post that only ever had the old label (it read as having no website
     *     channel, and re-saving would have dropped it off the careers page);
     *   - a post that had been re-saved, leaving a stale "Company Website"
     *     /unpublished row behind next to the real "Website" /published one.
     *
     * The unique key on (job_post_id, platform) forbids a blind rename, so
     * the collision is resolved first: the stale duplicate is deleted, keeping
     * the "Website" row and the stronger of the two statuses. Only then are
     * the remaining legacy rows renamed.
     */
    public function up(): void
    {
        $table = 'job_post_platforms';

        if (! DB::getSchemaBuilder()->hasTable($table)) {
            return;
        }

        $legacy = DB::table($table)->where('platform', 'Company Website')->get(['job_post_id', 'status']);

        foreach ($legacy as $row) {
            $modern = DB::table($table)
                ->where('job_post_id', $row->job_post_id)
                ->where('platform', 'Website')
                ->first(['status', 'published_at']);

            if ($modern === null) {
                continue; // no collision — the rename below handles it
            }

            // The post is already on the modern label. Keep whichever row
            // says published — that is the truth about the careers page.
            if ($row->status === 'published' && $modern->status !== 'published') {
                DB::table($table)
                    ->where('job_post_id', $row->job_post_id)
                    ->where('platform', 'Website')
                    ->update(['status' => 'published', 'published_at' => now()]);
            }

            DB::table($table)
                ->where('job_post_id', $row->job_post_id)
                ->where('platform', 'Company Website')
                ->delete();
        }

        DB::table($table)
            ->where('platform', 'Company Website')
            ->update(['platform' => 'Website']);

        $this->flushCache();
    }

    public function down(): void
    {
        // Not reversible: the builder can only write "Website", so renaming
        // back would leave the post unreadable to the Publish To row.
    }

    private function flushCache(): void
    {
        try {
            \Illuminate\Support\Facades\Cache::forget('screening_reference_data');
        } catch (\Throwable) {
        }
    }
};
