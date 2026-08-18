<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('positions', function (Blueprint $table) {
            $table->id('position_id');
            $table->string('position_code', 30)->unique();
            $table->string('title', 150);
            $table->unsignedBigInteger('department_id');
            $table->unsignedBigInteger('salary_grade_id')->nullable();
            $table->string('level', 30);
            $table->integer('headcount')->default(0);
            $table->integer('filled_count')->default(0);
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

            $table->index('department_id', 'idx_positions_department_id');
            $table->index('salary_grade_id', 'idx_positions_salary_grade_id');

            $table->foreign('department_id', 'fk_positions_department_id')
                  ->references('department_id')->on('departments');
            $table->foreign('salary_grade_id', 'fk_positions_salary_grade_id')
                  ->references('salary_grade_id')->on('salary_grades');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('positions');
    }
};
