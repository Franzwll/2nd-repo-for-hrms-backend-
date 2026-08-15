<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('learning_courses', function (Blueprint $table) {
            $table->id('course_id');
            $table->string('course_code', 50)->unique();
            $table->string('title', 200);
            $table->text('description')->nullable();
            $table->string('category', 80)->nullable();
            $table->string('level', 30)->nullable();
            $table->integer('duration_minutes')->nullable();
            $table->string('course_format', 30)->nullable();
            $table->string('status', 20)->default('active');
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

            $table->index('status', 'idx_learning_courses_status');
            $table->index('category', 'idx_learning_courses_category');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('learning_courses');
    }
};
