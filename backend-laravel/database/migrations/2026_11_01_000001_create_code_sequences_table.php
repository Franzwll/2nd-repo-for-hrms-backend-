<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * DB consolidation – Phase 2a.
     *
     * `employee_code_sequences` and `document_code_sequences` were two
     * single-row, row-locked counters. They are merged into one keyed table so
     * both generators share the same locked-sequence mechanism:
     *
     *   employee_code -> Modules\CoreHCM\Services\EmployeeLifecycleService
     *   document_code -> Modules\EmployeeRecords\Services\EmployeeDocumentCodeGenerator
     *
     * The two old rows carry the same values into `code_sequences`; none of the
     * generation logic (floor against existing rows, +1, lockForUpdate) changes.
     */
    public function up(): void
    {
        if (Schema::hasTable('code_sequences')) {
            return;
        }

        Schema::create('code_sequences', function (Blueprint $table) {
            $table->string('seq_key', 50)->primary();
            $table->unsignedBigInteger('next_val')->default(0);
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
        });

        // Copy the original counters. On a legacy database where a seed row is
        // missing, fall back to the highest issued id so no code is re-issued.
        $employeeNext = Schema::hasTable('employee_code_sequences')
            ? DB::table('employee_code_sequences')->where('id', 1)->value('next_val')
            : null;

        $documentNext = Schema::hasTable('document_code_sequences')
            ? DB::table('document_code_sequences')->where('id', 1)->value('next_val')
            : null;

        $employeeFloor = Schema::hasTable('employees')
            ? max(
                (int) (DB::table('employees')->max('employee_id') ?? 0),
                (int) preg_replace('/\D/', '', (string) (DB::table('employees')->max('employee_code') ?? '0')),
            )
            : 0;

        $documentFloor = Schema::hasTable('employee_documents')
            ? (int) (DB::table('employee_documents')->max('document_id') ?? 0)
            : 0;

        $rows = [
            ['seq_key' => 'employee_code', 'next_val' => (int) ($employeeNext ?? $employeeFloor)],
            ['seq_key' => 'document_code', 'next_val' => (int) ($documentNext ?? $documentFloor)],
        ];

        DB::table('code_sequences')->insert($rows);

        $expected = count($rows);
        $copied = DB::table('code_sequences')->count();

        if ($copied !== $expected) {
            throw new RuntimeException(
                "Phase 2a copy failed: expected {$expected} code_sequences rows, found {$copied}. Old tables were not dropped."
            );
        }

        Schema::dropIfExists('employee_code_sequences');
        Schema::dropIfExists('document_code_sequences');
    }

    /**
     * Restores both original single-row tables and their counters.
     */
    public function down(): void
    {
        $employeeNext = Schema::hasTable('code_sequences')
            ? DB::table('code_sequences')->where('seq_key', 'employee_code')->value('next_val')
            : null;

        $documentNext = Schema::hasTable('code_sequences')
            ? DB::table('code_sequences')->where('seq_key', 'document_code')->value('next_val')
            : null;

        if (! Schema::hasTable('employee_code_sequences')) {
            Schema::create('employee_code_sequences', function (Blueprint $table) {
                $table->unsignedBigInteger('id')->primary();
                $table->unsignedBigInteger('next_val')->default(0);
                $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
            });
        }

        if ($employeeNext !== null) {
            DB::table('employee_code_sequences')->updateOrInsert(
                ['id' => 1],
                ['next_val' => (int) $employeeNext],
            );
        }

        if (! Schema::hasTable('document_code_sequences')) {
            Schema::create('document_code_sequences', function (Blueprint $table) {
                $table->unsignedBigInteger('id')->primary();
                $table->unsignedBigInteger('next_val')->default(1);
            });
        }

        if ($documentNext !== null) {
            DB::table('document_code_sequences')->updateOrInsert(
                ['id' => 1],
                ['next_val' => (int) $documentNext],
            );
        }

        Schema::dropIfExists('code_sequences');
    }
};
