<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('document_code_sequences', function (Blueprint $table) {
            $table->unsignedBigInteger('id')->primary();
            $table->unsignedBigInteger('next_val')->default(1);
        });

        // Seed the sequence past whatever already exists so legacy / seeded
        // documents can never have their code re-issued.
        $floor = (int) (DB::table('employee_documents')->max('document_id') ?? 0);
        DB::table('document_code_sequences')->insert(['id' => 1, 'next_val' => $floor]);
    }

    public function down(): void
    {
        Schema::dropIfExists('document_code_sequences');
    }
};
