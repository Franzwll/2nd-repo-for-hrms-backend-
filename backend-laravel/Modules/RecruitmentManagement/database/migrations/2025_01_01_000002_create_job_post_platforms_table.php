<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
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

    public function down(): void
    {
        Schema::dropIfExists('job_post_platforms');
    }
};
