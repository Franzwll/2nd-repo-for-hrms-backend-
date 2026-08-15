<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('salary_grades', function (Blueprint $table) {
            $table->id('salary_grade_id');
            $table->string('code', 30)->unique();
            $table->string('title', 120);
            $table->decimal('min_salary', 12, 2);
            $table->decimal('max_salary', 12, 2);
            $table->char('currency_code', 3)->default('PHP');
            $table->string('level', 30);
            $table->text('notes')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('salary_grades');
    }
};
