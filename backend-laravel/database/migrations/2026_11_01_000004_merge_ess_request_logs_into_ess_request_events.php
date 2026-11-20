<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * DB consolidation – Phase 2d.
     *
     * The three append-only ESS request trails now share one table:
     *
     *   ess_request_routings          → event_type = 'routing'
     *   ess_request_status_histories  → event_type = 'status'
     *   ess_request_attachments       → event_type = 'attachment'
     *
     * The three model classes stay in place and scope every query by
     * event_type, so the workflow, controllers, resources and API payloads do
     * not change. Old column names are exposed with accessors on the models.
     *
     * The table is created and rows are copied before the old tables are
     * dropped, so the copy can be verified per event type.
     */
    private const ROUTING = 'routing';

    private const STATUS = 'status';

    private const ATTACHMENT = 'attachment';

    public function up(): void
    {
        // Nothing to merge on a database that never had the ESS migrations.
        if (! Schema::hasTable('ess_request_routings')
            && ! Schema::hasTable('ess_request_status_histories')
            && ! Schema::hasTable('ess_request_attachments')) {
            return;
        }

        if (Schema::hasTable('ess_request_events')) {
            throw new RuntimeException(
                'Phase 2d cannot start: ess_request_events already exists. Resolve the partial migration first.'
            );
        }

        $this->createEventsTable();

        $expectedRouting = $this->copyRoutings();
        $expectedStatus = $this->copyStatusHistories();
        $expectedAttachment = $this->copyAttachments();

        $this->assertCopied(self::ROUTING, $expectedRouting);
        $this->assertCopied(self::STATUS, $expectedStatus);
        $this->assertCopied(self::ATTACHMENT, $expectedAttachment);

        Schema::dropIfExists('ess_request_attachments');
        Schema::dropIfExists('ess_request_status_histories');
        Schema::dropIfExists('ess_request_routings');
    }

    /**
     * Restores the three tables from the merged rows and drops the shared
     * table. Every event type is copied back before anything is dropped.
     */
    public function down(): void
    {
        if (! Schema::hasTable('ess_request_events')) {
            return;
        }

        $this->createRoutingTable();
        $this->createStatusHistoryTable();
        $this->createAttachmentTable();

        $expectedRouting = $this->countEvents(self::ROUTING);
        $expectedStatus = $this->countEvents(self::STATUS);
        $expectedAttachment = $this->countEvents(self::ATTACHMENT);

        $this->restoreRoutings();
        $this->restoreStatusHistories();
        $this->restoreAttachments();

        $this->assertRestored('ess_request_routings', $expectedRouting);
        $this->assertRestored('ess_request_status_histories', $expectedStatus);
        $this->assertRestored('ess_request_attachments', $expectedAttachment);

        Schema::dropIfExists('ess_request_events');
    }

    private function createEventsTable(): void
    {
        Schema::create('ess_request_events', function (Blueprint $table) {
            $table->id('ess_request_event_id');
            $table->unsignedBigInteger('ess_request_id');
            $table->string('event_type', 20); // routing | status | attachment

            // Routing hand-off fields.
            $table->unsignedSmallInteger('leg')->nullable()->default(1);
            $table->string('from_module', 40)->nullable();
            $table->string('to_module', 40)->nullable();
            $table->string('action', 20)->nullable();

            // Shared actor / note.
            $table->unsignedBigInteger('actor_user_id')->nullable();
            $table->text('note')->nullable();

            // Status-history field.
            $table->string('status', 30)->nullable();

            // Routing result payload.
            $table->json('result_payload')->nullable();

            // Attachment fields.
            $table->string('direction', 20)->nullable(); // employee | hr
            $table->string('source_module', 40)->nullable();
            $table->text('file_path')->nullable();
            $table->string('original_name', 255)->nullable();
            $table->string('mime_type', 120)->nullable();
            $table->unsignedBigInteger('file_size_bytes')->nullable();
            $table->unsignedBigInteger('uploaded_by_user_id')->nullable();

            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->nullable();

            $table->index(['ess_request_id', 'event_type'], 'idx_ess_request_events_request_type');
            $table->index(['event_type', 'created_at'], 'idx_ess_request_events_type_created');
            $table->index(['to_module', 'action'], 'idx_ess_request_events_module_action');
            $table->index('status', 'idx_ess_request_events_status');
            $table->index('direction', 'idx_ess_request_events_direction');

            $table->foreign('ess_request_id', 'fk_ess_request_events_request')
                ->references('ess_request_id')->on('ess_requests')
                ->onDelete('cascade');

            $table->foreign('actor_user_id', 'fk_ess_request_events_actor')
                ->references('system_user_id')->on('system_users')
                ->onDelete('set null');

            $table->foreign('uploaded_by_user_id', 'fk_ess_request_events_uploader')
                ->references('system_user_id')->on('system_users')
                ->onDelete('set null');
        });

        DB::statement(
            "ALTER TABLE `ess_request_events` ADD CONSTRAINT `chk_ess_request_events_direction` "
            . "CHECK (`event_type` <> 'attachment' OR `direction` IN ('employee', 'hr'))"
        );
    }

    private function copyRoutings(): int
    {
        if (! Schema::hasTable('ess_request_routings')) {
            return 0;
        }

        $expected = DB::table('ess_request_routings')->count();

        DB::table('ess_request_routings')->chunkById(500, function ($rows) {
            $insert = [];

            foreach ($rows as $row) {
                $insert[] = [
                    'ess_request_id' => $row->ess_request_id,
                    'event_type' => self::ROUTING,
                    'leg' => $row->leg,
                    'from_module' => $row->from_module,
                    'to_module' => $row->to_module,
                    'action' => $row->action,
                    'actor_user_id' => $row->actor_user_id,
                    'note' => $row->note,
                    'result_payload' => $row->result_payload,
                    'created_at' => $row->created_at ?? now(),
                    'updated_at' => $row->updated_at,
                ];
            }

            if ($insert !== []) {
                DB::table('ess_request_events')->insert($insert);
            }
        }, 'ess_request_routing_id');

        return $expected;
    }

    private function copyStatusHistories(): int
    {
        if (! Schema::hasTable('ess_request_status_histories')) {
            return 0;
        }

        $expected = DB::table('ess_request_status_histories')->count();

        DB::table('ess_request_status_histories')->chunkById(500, function ($rows) {
            $insert = [];

            foreach ($rows as $row) {
                $insert[] = [
                    'ess_request_id' => $row->ess_request_id,
                    'event_type' => self::STATUS,
                    'status' => $row->status,
                    'actor_user_id' => $row->actor_user_id,
                    'note' => $row->note,
                    'created_at' => $row->created_at ?? now(),
                ];
            }

            if ($insert !== []) {
                DB::table('ess_request_events')->insert($insert);
            }
        }, 'ess_request_status_history_id');

        return $expected;
    }

    private function copyAttachments(): int
    {
        if (! Schema::hasTable('ess_request_attachments')) {
            return 0;
        }

        $expected = DB::table('ess_request_attachments')->count();

        DB::table('ess_request_attachments')->chunkById(500, function ($rows) {
            $insert = [];

            foreach ($rows as $row) {
                $insert[] = [
                    'ess_request_id' => $row->ess_request_id,
                    'event_type' => self::ATTACHMENT,
                    'direction' => $row->direction,
                    'source_module' => $row->source_module ?? null,
                    'file_path' => $row->file_path,
                    'original_name' => $row->original_name,
                    'mime_type' => $row->mime_type,
                    'file_size_bytes' => $row->file_size_bytes,
                    'uploaded_by_user_id' => $row->uploaded_by_user_id,
                    'created_at' => $row->created_at ?? now(),
                    'updated_at' => $row->updated_at ?? now(),
                ];
            }

            if ($insert !== []) {
                DB::table('ess_request_events')->insert($insert);
            }
        }, 'ess_request_attachment_id');

        return $expected;
    }

    private function createRoutingTable(): void
    {
        if (Schema::hasTable('ess_request_routings')) {
            return;
        }

        Schema::create('ess_request_routings', function (Blueprint $table) {
            $table->id('ess_request_routing_id');
            $table->unsignedBigInteger('ess_request_id');
            $table->unsignedSmallInteger('leg')->default(1);
            $table->string('from_module', 40)->nullable();
            $table->string('to_module', 40)->nullable();
            $table->string('action', 20);
            $table->unsignedBigInteger('actor_user_id')->nullable();
            $table->text('note')->nullable();
            $table->json('result_payload')->nullable();
            $table->timestamps();

            $table->index(['ess_request_id', 'leg'], 'idx_ess_request_routings_request_leg');
            $table->index(['to_module', 'action'], 'idx_ess_request_routings_module_action');

            $table->foreign('ess_request_id', 'fk_ess_request_routings_request')
                ->references('ess_request_id')->on('ess_requests')
                ->onDelete('cascade');
            $table->foreign('actor_user_id', 'fk_ess_request_routings_actor')
                ->references('system_user_id')->on('system_users')
                ->onDelete('set null');
        });
    }

    private function createStatusHistoryTable(): void
    {
        if (Schema::hasTable('ess_request_status_histories')) {
            return;
        }

        Schema::create('ess_request_status_histories', function (Blueprint $table) {
            $table->id('ess_request_status_history_id');
            $table->unsignedBigInteger('ess_request_id');
            $table->string('status', 30);
            $table->unsignedBigInteger('actor_user_id')->nullable();
            $table->text('note')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index('ess_request_id', 'idx_ess_request_status_histories_request_id');
            $table->index('status', 'idx_ess_request_status_histories_status');

            $table->foreign('ess_request_id', 'fk_ess_request_status_histories_request_id')
                ->references('ess_request_id')->on('ess_requests')
                ->onDelete('cascade');
            $table->foreign('actor_user_id', 'fk_ess_request_status_histories_actor')
                ->references('system_user_id')->on('system_users');
        });
    }

    private function createAttachmentTable(): void
    {
        if (Schema::hasTable('ess_request_attachments')) {
            return;
        }

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

    private function restoreRoutings(): void
    {
        DB::table('ess_request_events')
            ->where('event_type', self::ROUTING)
            ->orderBy('ess_request_event_id')
            ->chunk(500, function ($rows) {
                $insert = [];

                foreach ($rows as $row) {
                    $insert[] = [
                        'ess_request_id' => $row->ess_request_id,
                        'leg' => $row->leg ?? 1,
                        'from_module' => $row->from_module,
                        'to_module' => $row->to_module,
                        'action' => $row->action,
                        'actor_user_id' => $row->actor_user_id,
                        'note' => $row->note,
                        'result_payload' => $row->result_payload,
                        'created_at' => $row->created_at,
                        'updated_at' => $row->updated_at,
                    ];
                }

                if ($insert !== []) {
                    DB::table('ess_request_routings')->insert($insert);
                }
            });
    }

    private function restoreStatusHistories(): void
    {
        DB::table('ess_request_events')
            ->where('event_type', self::STATUS)
            ->orderBy('ess_request_event_id')
            ->chunk(500, function ($rows) {
                $insert = [];

                foreach ($rows as $row) {
                    $insert[] = [
                        'ess_request_id' => $row->ess_request_id,
                        'status' => $row->status,
                        'actor_user_id' => $row->actor_user_id,
                        'note' => $row->note,
                        'created_at' => $row->created_at ?? now(),
                    ];
                }

                if ($insert !== []) {
                    DB::table('ess_request_status_histories')->insert($insert);
                }
            });
    }

    private function restoreAttachments(): void
    {
        DB::table('ess_request_events')
            ->where('event_type', self::ATTACHMENT)
            ->orderBy('ess_request_event_id')
            ->chunk(500, function ($rows) {
                $insert = [];

                foreach ($rows as $row) {
                    $insert[] = [
                        'ess_request_id' => $row->ess_request_id,
                        'direction' => $row->direction ?? 'employee',
                        'source_module' => $row->source_module,
                        'file_path' => $row->file_path,
                        'original_name' => $row->original_name,
                        'mime_type' => $row->mime_type,
                        'file_size_bytes' => $row->file_size_bytes,
                        'uploaded_by_user_id' => $row->uploaded_by_user_id,
                        'created_at' => $row->created_at ?? now(),
                        'updated_at' => $row->updated_at ?? now(),
                    ];
                }

                if ($insert !== []) {
                    DB::table('ess_request_attachments')->insert($insert);
                }
            });
    }

    private function countEvents(string $eventType): int
    {
        return DB::table('ess_request_events')->where('event_type', $eventType)->count();
    }

    private function assertCopied(string $eventType, int $expected): void
    {
        $copied = $this->countEvents($eventType);

        if ($copied !== $expected) {
            throw new RuntimeException(
                "Phase 2d copy failed: expected {$expected} {$eventType} rows, copied {$copied}. "
                . 'The old ESS tables were not dropped.'
            );
        }
    }

    private function assertRestored(string $table, int $expected): void
    {
        $restored = DB::table($table)->count();

        if ($restored !== $expected) {
            throw new RuntimeException(
                "Phase 2d rollback failed: expected {$expected} rows in {$table}, restored {$restored}. "
                . 'ess_request_events was not dropped.'
            );
        }
    }
};
