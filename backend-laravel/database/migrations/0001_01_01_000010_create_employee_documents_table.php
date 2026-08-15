<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employee_documents', function (Blueprint $table) {
            $table->id('document_id');
            $table->unsignedBigInteger('employee_id');
            $table->string('document_code', 50);
            $table->string('title', 200);
            $table->string('category', 80);
            $table->text('file_path')->nullable();
            $table->string('mime_type', 100)->nullable();
            $table->unsignedBigInteger('file_size_bytes')->nullable();
            $table->string('document_status', 30);
            $table->date('document_date')->nullable();
            $table->date('expiry_date')->nullable();
            $table->timestamp('last_updated_at')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

            $table->unique(['employee_id', 'document_code'], 'uq_employee_documents_natural');
            $table->index('category', 'idx_employee_documents_category');
            $table->index('document_status', 'idx_employee_documents_document_status');

            $table->foreign('employee_id', 'fk_employee_documents_employee_id')
                  ->references('employee_id')->on('employees')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employee_documents');
    }
};
