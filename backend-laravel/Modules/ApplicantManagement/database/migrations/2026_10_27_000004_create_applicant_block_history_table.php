<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('applicant_block_history', function (Blueprint $table) {
            $table->id('block_history_id');
            $table->unsignedBigInteger('applicant_id');
            $table->string('action', 20);
            $table->string('performed_by', 160);
            $table->text('reason');
            $table->string('scope', 100)->nullable();
            $table->timestamp('performed_at')->useCurrent();

            $table->index('applicant_id', 'idx_applicant_block_history_applicant_id');
            $table->foreign('applicant_id', 'fk_applicant_block_history_applicant_id')
                ->references('applicant_id')->on('applicants')
                ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('applicant_block_history');
    }
};

