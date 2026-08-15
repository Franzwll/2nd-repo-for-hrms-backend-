<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('job_posts', function (Blueprint $table) {
            $table->id('job_post_id');
            $table->string('slug', 120)->unique();
            $table->string('title', 150);
            $table->unsignedBigInteger('department_id');
            $table->unsignedBigInteger('position_id')->nullable();
            $table->string('employment_type', 30);
            $table->string('schedule', 120)->nullable();
            $table->decimal('salary_min', 12, 2)->nullable();
            $table->decimal('salary_max', 12, 2)->nullable();
            $table->integer('vacancies')->default(1);
            $table->integer('filled_count')->default(0);
            $table->date('posted_date')->nullable();
            $table->string('status', 20);
            $table->boolean('active')->default(true);
            $table->string('experience_level', 50)->nullable();
            $table->string('education_level', 100)->nullable();
            $table->text('summary')->nullable();
            $table->text('description')->nullable();
            $table->json('responsibilities_json')->nullable();
            $table->json('qualifications_json')->nullable();
            $table->json('skills_json')->nullable();
            $table->json('benefits_json')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

            $table->index('department_id', 'idx_job_posts_department_id');
            $table->index('position_id', 'idx_job_posts_position_id');
            $table->index(['status', 'active'], 'idx_job_posts_status_active');

            $table->foreign('department_id', 'fk_job_posts_department_id')
                  ->references('department_id')->on('departments');
            $table->foreign('position_id', 'fk_job_posts_position_id')
                  ->references('position_id')->on('positions');
        });

        DB::statement("ALTER TABLE `job_posts` ADD CONSTRAINT `chk_job_posts_status` CHECK (`status` IN ('Open', 'Closed', 'Draft'))");
        DB::statement("ALTER TABLE `job_posts` ADD CONSTRAINT `chk_job_posts_employment_type` CHECK (`employment_type` IN ('Full-time', 'Part-time', 'Contract', 'Seasonal'))");
        DB::statement("ALTER TABLE `job_posts` ADD CONSTRAINT `chk_job_posts_experience_level` CHECK (`experience_level` IS NULL OR `experience_level` IN ('No Experience', '1-2 Years', '3-5 Years', '5+ Years'))");
        DB::statement("ALTER TABLE `job_posts` ADD CONSTRAINT `chk_job_posts_education_level` CHECK (`education_level` IS NULL OR `education_level` IN ('High School Graduate', 'Vocational / TESDA', 'College Level', 'Bachelor''s Degree'))");
    }

    public function down(): void
    {
        Schema::dropIfExists('job_posts');
    }
};
