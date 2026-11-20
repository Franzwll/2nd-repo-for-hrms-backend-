<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Inlines job_post_platforms into job_posts.platforms_json,
     * drops the foreign key, and drops the job_post_platforms table.
     */
    public function up(): void
    {
        if (!Schema::hasTable('job_post_platforms')) {
            return;
        }

        // 1. Add platforms_json column to job_posts if missing
        if (Schema::hasTable('job_posts') && !Schema::hasColumn('job_posts', 'platforms_json')) {
            Schema::table('job_posts', function (Blueprint $table) {
                $table->longText('platforms_json')->nullable()->after('blocks_json');
            });
        }

        // 2. Fetch all platforms and group by job_post_id
        $platforms = DB::table('job_post_platforms')->orderBy('job_post_platform_id')->get();
        $allPlatforms = [];
        $byJobPost = [];

        foreach ($platforms as $p) {
            $data = [
                'job_post_platform_id' => $p->job_post_platform_id,
                'job_post_id'          => $p->job_post_id,
                'platform'             => $p->platform,
                'published_at'         => $p->published_at,
                'status'               => $p->status,
                'created_at'           => $p->created_at,
            ];
            $allPlatforms[] = $data;
            $byJobPost[$p->job_post_id][] = $data;
        }

        // 3. Update each job_post with inlined platforms_json
        foreach ($byJobPost as $postId => $postPlatforms) {
            DB::table('job_posts')
                ->where('job_post_id', $postId)
                ->update(['platforms_json' => json_encode($postPlatforms)]);
        }

        // 4. Save rollback snapshot to system_settings
        if (Schema::hasTable('system_settings')) {
            DB::table('system_settings')->updateOrInsert(
                ['setting_key' => 'migration_backup.job_post_platforms'],
                ['setting_value' => json_encode($allPlatforms), 'updated_at' => now()]
            );
        }

        // 5. Drop foreign key constraint and table
        Schema::table('job_post_platforms', function (Blueprint $table) {
            $table->dropForeign('fk_job_post_platforms_job_post_id');
        });
        Schema::dropIfExists('job_post_platforms');
    }

    /**
     * Reverse the migrations.
     * Recreates job_post_platforms table, restores rows, and drops platforms_json column.
     */
    public function down(): void
    {
        // 1. Recreate job_post_platforms table
        if (!Schema::hasTable('job_post_platforms')) {
            Schema::create('job_post_platforms', function (Blueprint $table) {
                $table->id('job_post_platform_id');
                $table->unsignedBigInteger('job_post_id');
                $table->string('platform', 60);
                $table->timestamp('published_at')->nullable();
                $table->string('status', 20)->default('published');
                $table->timestamp('created_at')->useCurrent();

                $table->unique(['job_post_id', 'platform'], 'uq_job_post_platforms_natural');
                $table->foreign('job_post_id', 'fk_job_post_platforms_job_post_id')
                      ->references('job_post_id')->on('job_posts')->onDelete('cascade');
            });

            DB::statement("ALTER TABLE `job_post_platforms` ADD CONSTRAINT `chk_job_post_platforms_status` CHECK (`status` IN ('published', 'unpublished'))");
        }

        // 2. Restore rows from system_settings or from job_posts.platforms_json
        $backupPlatforms = null;
        if (Schema::hasTable('system_settings')) {
            $row = DB::table('system_settings')->where('setting_key', 'migration_backup.job_post_platforms')->first();
            if ($row && !empty($row->setting_value)) {
                $backupPlatforms = json_decode($row->setting_value, true);
            }
        }

        $maxId = 0;
        if (is_array($backupPlatforms) && !empty($backupPlatforms)) {
            foreach ($backupPlatforms as $p) {
                DB::table('job_post_platforms')->insert([
                    'job_post_platform_id' => $p['job_post_platform_id'],
                    'job_post_id'          => $p['job_post_id'],
                    'platform'             => $p['platform'],
                    'published_at'         => $p['published_at'],
                    'status'               => $p['status'],
                    'created_at'           => $p['created_at'],
                ]);
                if ($p['job_post_platform_id'] > $maxId) {
                    $maxId = $p['job_post_platform_id'];
                }
            }
        } elseif (Schema::hasTable('job_posts')) {
            // Fallback: restore from job_posts.platforms_json
            $posts = DB::table('job_posts')->whereNotNull('platforms_json')->get();
            foreach ($posts as $post) {
                $items = json_decode($post->platforms_json, true);
                if (is_array($items)) {
                    foreach ($items as $item) {
                        $insertData = [
                            'job_post_id'  => $post->job_post_id,
                            'platform'     => $item['platform'],
                            'published_at' => $item['published_at'] ?? now(),
                            'status'       => $item['status'] ?? 'published',
                            'created_at'   => $item['created_at'] ?? now(),
                        ];
                        if (!empty($item['job_post_platform_id'])) {
                            $insertData['job_post_platform_id'] = $item['job_post_platform_id'];
                            if ($item['job_post_platform_id'] > $maxId) {
                                $maxId = $item['job_post_platform_id'];
                            }
                        }
                        DB::table('job_post_platforms')->insert($insertData);
                    }
                }
            }
        }

        if ($maxId > 0) {
            $next = $maxId + 1;
            DB::statement("ALTER TABLE job_post_platforms AUTO_INCREMENT = {$next}");
        }

        // 3. Drop platforms_json from job_posts
        if (Schema::hasTable('job_posts') && Schema::hasColumn('job_posts', 'platforms_json')) {
            Schema::table('job_posts', function (Blueprint $table) {
                $table->dropColumn('platforms_json');
            });
        }

        // 4. Delete backup key from system_settings
        if (Schema::hasTable('system_settings')) {
            DB::table('system_settings')->where('setting_key', 'migration_backup.job_post_platforms')->delete();
        }
    }
};

