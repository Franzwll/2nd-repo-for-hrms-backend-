<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Auto-assignment pivot: maps learning courses to departments and/or positions.
 *
 * - A course with NO targets is universal (shown to every employee).
 * - A course targeting department_id=3 is only shown to Kitchen employees.
 * - A course can have multiple targets (e.g., Kitchen + F&B).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('learning_course_targets', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('course_id');
            $table->unsignedBigInteger('department_id')->nullable();
            $table->unsignedBigInteger('position_id')->nullable();
            $table->boolean('is_mandatory')->default(false);
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('course_id', 'fk_lct_course')
                  ->references('course_id')->on('learning_courses')->onDelete('cascade');
            $table->foreign('department_id', 'fk_lct_department')
                  ->references('department_id')->on('departments')->onDelete('cascade');
            $table->foreign('position_id', 'fk_lct_position')
                  ->references('position_id')->on('positions')->onDelete('cascade');

            $table->index(['course_id', 'department_id'], 'idx_lct_course_dept');
            $table->index(['course_id', 'position_id'], 'idx_lct_course_pos');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('learning_course_targets');
    }
};
