<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('applicant_screening_entities', function (Blueprint $table) {
            $table->id('entity_id');
            $table->unsignedBigInteger('applicant_id');
            $table->string('label', 80);
            $table->text('value');
            $table->timestamp('created_at')->useCurrent();

            $table->index('applicant_id', 'idx_applicant_screening_entities_applicant_id');

            $table->foreign('applicant_id', 'fk_applicant_screening_entities_applicant_id')
                  ->references('applicant_id')->on('applicants')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('applicant_screening_entities');
    }
};
