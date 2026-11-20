<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Decision record 2d: split ESS attachments back out of the shared event
     * table. Live rows are copied first, then removed from ess_request_events.
     */
    public function up(): void
    {
        if (! Schema::hasTable('ess_request_events')) {
            return;
        }

        if (! Schema::hasTable('ess_request_attachments')) {
            Schema::create('ess_request_attachments', function (Blueprint $table) {
                $table->id('ess_request_attachment_id');
                $table->unsignedBigInteger('ess_request_id');
                $table->string('direction', 20)->default('employee');
                $table->string('source_module', 40)->nullable();
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
                    ->references('ess_request_id')->on('ess_requests')
                    ->onDelete('cascade');
                $table->foreign('uploaded_by_user_id', 'fk_ess_request_attachments_uploader')
                    ->references('system_user_id')->on('system_users');
            });

            DB::statement(
                "ALTER TABLE `ess_request_attachments` ADD CONSTRAINT `chk_ess_request_attachments_direction` "
                . "CHECK (`direction` IN ('employee', 'hr'))"
            );
        }

        $rows = DB::table('ess_request_events')
            ->where('event_type', 'attachment')
            ->orderBy('ess_request_event_id')
            ->get();

        foreach ($rows as $row) {
            DB::table('ess_request_attachments')->updateOrInsert(
                ['ess_request_attachment_id' => $row->ess_request_event_id],
                [
                    'ess_request_id' => $row->ess_request_id,
                    'direction' => $row->direction ?? 'employee',
                    'source_module' => $row->source_module,
                    'file_path' => $row->file_path ?? '',
                    'original_name' => $row->original_name,
                    'mime_type' => $row->mime_type,
                    'file_size_bytes' => $row->file_size_bytes,
                    'uploaded_by_user_id' => $row->uploaded_by_user_id,
                    'created_at' => $row->created_at ?? now(),
                    'updated_at' => $row->updated_at ?? now(),
                ]
            );
        }

        DB::table('ess_request_events')->where('event_type', 'attachment')->delete();
    }

    public function down(): void
    {
        if (! Schema::hasTable('ess_request_attachments')) {
            return;
        }

        if (Schema::hasTable('ess_request_events')) {
            foreach (DB::table('ess_request_attachments')->orderBy('ess_request_attachment_id')->get() as $row) {
                DB::table('ess_request_events')->updateOrInsert(
                    ['ess_request_event_id' => $row->ess_request_attachment_id],
                    [
                        'ess_request_id' => $row->ess_request_id,
                        'event_type' => 'attachment',
                        'direction' => $row->direction,
                        'source_module' => $row->source_module,
                        'file_path' => $row->file_path,
                        'original_name' => $row->original_name,
                        'mime_type' => $row->mime_type,
                        'file_size_bytes' => $row->file_size_bytes,
                        'uploaded_by_user_id' => $row->uploaded_by_user_id,
                        'created_at' => $row->created_at ?? now(),
                        'updated_at' => $row->updated_at ?? now(),
                    ]
                );
            }
        }

        Schema::dropIfExists('ess_request_attachments');
    }
};
