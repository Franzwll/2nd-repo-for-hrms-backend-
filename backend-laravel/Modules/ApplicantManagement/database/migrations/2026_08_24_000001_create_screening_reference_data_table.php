<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * DB-managed reference data for spaCy screening (skills, job roles,
     * certifications + their aliases). Replaces the bundled seed JSON files
     * as the single manageable source once seeded; the NLP service keeps its
     * bundled copy only as a resilience fallback.
     */
    public function up(): void
    {
        Schema::create('screening_reference_data', function (Blueprint $table) {
            $table->id('ref_id');
            $table->string('data_type', 20); // skill | job_role | certification
            $table->string('canonical_value', 150);
            $table->json('aliases_json')->nullable();
            $table->boolean('active')->default(1);
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->nullable()->useCurrentOnUpdate();

            $table->unique(['data_type', 'canonical_value'], 'uq_screening_ref_type_value');
            $table->index('data_type', 'idx_screening_reference_data_type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('screening_reference_data');
    }
};
