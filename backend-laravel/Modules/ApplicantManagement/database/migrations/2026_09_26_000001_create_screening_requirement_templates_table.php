<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Requirement templates for the Screening Setup
     * (Recruitment Management -> Screening setup -> Requirement Templates).
     *
     * A template is scoped to a Core HCM position (the "entity" it belongs to)
     * and lists the requirement entities a resume must satisfy — skill,
     * job_role, certification, education and experience rows. Templates are
     * applied to a job post draft in the Job Post Builder, seeding the post's
     * Required Skills / Qualifications blocks plus its structured education and
     * experience levels (the exact fields the NLP screening scores against).
     */
    public function up(): void
    {
        Schema::create('screening_requirement_templates', function (Blueprint $table) {
            $table->id('template_id');
            $table->string('name', 150);
            $table->unsignedBigInteger('position_id')->nullable();
            $table->string('description', 500)->nullable();
            $table->boolean('active')->default(1);
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->nullable()->useCurrentOnUpdate();

            $table->index('position_id', 'idx_screening_req_templates_position');
            $table->foreign('position_id', 'fk_screening_req_templates_position')
                  ->references('position_id')->on('positions')
                  ->nullOnDelete();
        });

        Schema::create('screening_requirement_template_items', function (Blueprint $table) {
            $table->id('item_id');
            $table->unsignedBigInteger('template_id');
            // skill | job_role | certification | education | experience
            $table->string('entity_type', 20);
            $table->string('value', 255);
            $table->boolean('required')->default(1);
            $table->timestamp('created_at')->useCurrent();

            $table->unique(['template_id', 'entity_type', 'value'], 'uq_screening_req_items_value');
            $table->index('template_id', 'idx_screening_req_items_template');
            $table->foreign('template_id', 'fk_screening_req_items_template')
                  ->references('template_id')->on('screening_requirement_templates')
                  ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('screening_requirement_template_items');
        Schema::dropIfExists('screening_requirement_templates');
    }
};
