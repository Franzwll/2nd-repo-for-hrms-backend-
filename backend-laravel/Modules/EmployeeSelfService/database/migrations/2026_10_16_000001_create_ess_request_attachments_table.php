<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Bidirectional files attached to an ESS request. The employee can attach
     * supporting files when filing (direction = 'employee'); HR fulfils the
     * request by attaching the generated/archived file (direction = 'hr').
     *
     * Kept separate from ess_requests.attachment_path so a request can carry
     * several files across its lifecycle and every file keeps its own audit
     * trail (who uploaded it, when, original name).
     */
    public function up(): void
    {
        Schema::create('ess_request_attachments', function (Blueprint $table) {
            $table->id('ess_request_attachment_id');
            $table->unsignedBigInteger('ess_request_id');
            $table->string('direction', 20)->default('employee'); // employee | hr
            $table->text('file_path');
            $table->string('original_name', 255)->nullable();
            $table->string('mime_type', 120)->nullable();
            $table->unsignedBigInteger('file_size_bytes')->nullable();
            $table->unsignedBigInteger('uploaded_by_user_id')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

            $table->index('ess_request_id', 'idx_ess_request_attachments_request_id');
            $table->index('direction', 'idx_ess_request_attachments_direction');

            $table->foreign('ess_request_id', 'fk_ess_request_attachments_request_id')
                  ->references('ess_request_id')->on('ess_requests')->onDelete('cascade');
            $table->foreign('uploaded_by_user_id', 'fk_ess_request_attachments_uploader')
                  ->references('system_user_id')->on('system_users');
        });

        DB::statement("ALTER TABLE `ess_request_attachments` ADD CONSTRAINT `chk_ess_request_attachments_direction` CHECK (`direction` IN ('employee', 'hr'))");
    }

    public function down(): void
    {
        Schema::dropIfExists('ess_request_attachments');
    }
};
