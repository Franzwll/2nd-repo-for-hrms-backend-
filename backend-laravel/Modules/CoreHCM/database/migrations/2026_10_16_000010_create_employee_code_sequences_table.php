<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Dedicated sequence backing Core HCM employee code generation.
 *
 * The previous generator read MAX(employee_code), released its advisory lock,
 * and only then inserted the row inside an outer transaction — two concurrent
 * hires could therefore mint the same code. A single locked sequence row fixes
 * that: lockForUpdate() on it serialises code allocation and holds until the
 * caller's transaction commits.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employee_code_sequences', function (Blueprint $table) {
            $table->unsignedBigInteger('id')->primary();
            $table->unsignedBigInteger('next_val')->default(0);
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
        });

        // Seed from the highest existing employee so freshly generated codes
        // never clash with rows created before the sequence existed.
        $lastId = (int) (DB::table('employees')->max('employee_id') ?? 0);

        DB::table('employee_code_sequences')->insert([
            'id' => 1,
            'next_val' => $lastId,
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('employee_code_sequences');
    }
};
