<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Adds the module-routing pipeline to ESS requests.
 *
 * Employee -> ESS Management (gate) -> module (ERM / Attendance / Payroll /
 * Performance) -> ESS Management (release) -> Employee.
 *
 * The routing ledger is append-only: every hand-off between ESS Management and
 * a module is recorded with its leg, action, actor and result payload.
 */
return new class extends Migration
{
    private const STATUSES = [
        'Pending',
        'Under Review',
        'For Dispatch',
        'With Module',
        'For Release',
        'Rejected',
        'Returned for Clarification',
        'Completed',
        'Cancelled',
    ];

    private const LEGACY_STATUSES = [
        'Pending',
        'Under Review',
        'Approved',
        'For Fulfillment',
        'Rejected',
        'Returned for Clarification',
        'Completed',
        'Cancelled',
    ];

    private const CATEGORY_MODULES = [
        'hr_document' => 'erm',
        'ESS-HRDOC' => 'erm',
        'leave' => 'attendance',
        'schedule' => 'attendance',
        'attendance' => 'attendance',
        'payroll' => 'payroll',
        'benefits' => 'payroll',
        'career' => 'performance',
    ];

    public function up(): void
    {
        if (! Schema::hasTable('ess_request_routings')) {
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
                    ->references('ess_request_id')->on('ess_requests')->onDelete('cascade');
                $table->foreign('actor_user_id', 'fk_ess_request_routings_actor')
                    ->references('system_user_id')->on('system_users')->onDelete('set null');
            });
        }

        if (Schema::hasTable('ess_requests')) {
            Schema::table('ess_requests', function (Blueprint $table) {
                if (! Schema::hasColumn('ess_requests', 'routed_module')) {
                    $table->string('routed_module', 40)->nullable();
                }
                if (! Schema::hasColumn('ess_requests', 'routed_at')) {
                    $table->timestamp('routed_at')->nullable();
                }
                if (! Schema::hasColumn('ess_requests', 'module_responded_at')) {
                    $table->timestamp('module_responded_at')->nullable();
                }
                if (! Schema::hasColumn('ess_requests', 'module_reference')) {
                    $table->string('module_reference', 100)->nullable();
                }
                if (! Schema::hasColumn('ess_requests', 'module_note')) {
                    $table->text('module_note')->nullable();
                }
                if (! Schema::hasColumn('ess_requests', 'released_at')) {
                    $table->timestamp('released_at')->nullable();
                }
                if (! Schema::hasColumn('ess_requests', 'released_by_user_id')) {
                    $table->unsignedBigInteger('released_by_user_id')->nullable();
                }
            });

            Schema::table('ess_requests', function (Blueprint $table) {
                if (! $this->hasIndex('ess_requests', 'idx_ess_requests_routed_module')) {
                    $table->index('routed_module', 'idx_ess_requests_routed_module');
                }
            });

            if (DB::getDriverName() === 'mysql' && ! $this->hasForeignKey('ess_requests', 'fk_ess_requests_released_by')) {
                Schema::table('ess_requests', function (Blueprint $table) {
                    $table->foreign('released_by_user_id', 'fk_ess_requests_released_by')
                        ->references('system_user_id')->on('system_users')->onDelete('set null');
                });
            }
        }

        if (Schema::hasTable('ess_categories')) {
            Schema::table('ess_categories', function (Blueprint $table) {
                if (! Schema::hasColumn('ess_categories', 'default_module')) {
                    $table->string('default_module', 40)->nullable();
                }
                if (! Schema::hasColumn('ess_categories', 'requires_module_ack')) {
                    $table->boolean('requires_module_ack')->default(true);
                }
                if (! Schema::hasColumn('ess_categories', 'sla_hours')) {
                    $table->unsignedInteger('sla_hours')->nullable();
                }
            });

            foreach (self::CATEGORY_MODULES as $code => $module) {
                DB::table('ess_categories')->where('code', $code)->update(['default_module' => $module]);
            }
        }

        if (Schema::hasTable('ess_request_attachments') && ! Schema::hasColumn('ess_request_attachments', 'source_module')) {
            Schema::table('ess_request_attachments', function (Blueprint $table) {
                $table->string('source_module', 40)->nullable()->after('direction');
            });
        }

        // The old CHECK constraint does not allow the new statuses, so drop it
        // before rewriting in-flight rows and add the new one afterwards.
        $this->dropStatusConstraint();
        $this->migrateLegacyStatuses();
        $this->addStatusConstraint(self::STATUSES);
    }

    public function down(): void
    {
        $this->dropStatusConstraint();

        if (Schema::hasTable('ess_requests')) {
            DB::table('ess_requests')->where('status', 'For Dispatch')->update(['status' => 'Under Review']);
            DB::table('ess_requests')->where('status', 'With Module')->update(['status' => 'For Fulfillment']);
            DB::table('ess_requests')->where('status', 'For Release')->update(['status' => 'Approved']);
        }

        $this->addStatusConstraint(self::LEGACY_STATUSES);

        if (Schema::hasTable('ess_request_attachments') && Schema::hasColumn('ess_request_attachments', 'source_module')) {
            Schema::table('ess_request_attachments', function (Blueprint $table) {
                $table->dropColumn('source_module');
            });
        }

        if (Schema::hasTable('ess_categories')) {
            Schema::table('ess_categories', function (Blueprint $table) {
                $table->dropColumn(['default_module', 'requires_module_ack', 'sla_hours']);
            });
        }

        if (Schema::hasTable('ess_requests')) {
            Schema::table('ess_requests', function (Blueprint $table) {
                if ($this->hasForeignKey('ess_requests', 'fk_ess_requests_released_by')) {
                    $table->dropForeign('fk_ess_requests_released_by');
                }
                if ($this->hasIndex('ess_requests', 'idx_ess_requests_routed_module')) {
                    $table->dropIndex('idx_ess_requests_routed_module');
                }
                $table->dropColumn([
                    'routed_module',
                    'routed_at',
                    'module_responded_at',
                    'module_reference',
                    'module_note',
                    'released_at',
                    'released_by_user_id',
                ]);
            });
        }

        Schema::dropIfExists('ess_request_routings');
    }

    /**
     * Map the old five/eight-status model onto the routing model without
     * losing work already in flight:
     *   For Fulfillment -> With Module (routed to ERM for documents)
     *   Approved        -> For Release   (ESS Admin still needs to release)
     */
    private function migrateLegacyStatuses(): void
    {
        if (! Schema::hasTable('ess_requests')) {
            return;
        }

        $documentIds = DB::table('ess_requests as r')
            ->leftJoin('ess_categories as c', 'c.ess_category_id', '=', 'r.category_id')
            ->where('r.status', 'For Fulfillment')
            ->where(function ($q) {
                $q->whereIn('c.code', ['HR_DOCUMENT', 'hr_document', 'ESS-HRDOC'])
                    ->orWhere('c.name', 'LIKE', '%Document%')
                    ->orWhere('r.request_type', 'LIKE', '%document%')
                    ->orWhere('r.request_type', 'LIKE', '%certificate%')
                    ->orWhere('r.request_type', 'LIKE', '%COE%')
                    ->orWhere('r.request_type', 'LIKE', '%service record%');
            })
            ->pluck('r.ess_request_id');

        if ($documentIds->isNotEmpty()) {
            DB::table('ess_requests')->whereIn('ess_request_id', $documentIds)->update([
                'status' => 'With Module',
                'routed_module' => 'erm',
                'routed_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Any remaining non-document rows were already approved under the old
        // model; put them in the release queue rather than leaving them in a
        // module stage with no routed_module.
        DB::table('ess_requests')->where('status', 'For Fulfillment')->update([
            'status' => 'For Release',
            'updated_at' => now(),
        ]);

        DB::table('ess_requests')->where('status', 'Approved')->update([
            'status' => 'For Release',
            'updated_at' => now(),
        ]);
    }

    private function dropStatusConstraint(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        $exists = fn (): bool => (int) DB::selectOne(
            "SELECT COUNT(*) AS c FROM information_schema.table_constraints
             WHERE constraint_schema = DATABASE()
               AND table_name = 'ess_requests'
               AND constraint_name = 'chk_ess_requests_status'
               AND constraint_type = 'CHECK'"
        )->c > 0;

        if (! $exists()) {
            return;
        }

        foreach ([
            'ALTER TABLE `ess_requests` DROP CHECK `chk_ess_requests_status`',
            'ALTER TABLE `ess_requests` DROP CONSTRAINT `chk_ess_requests_status`',
        ] as $drop) {
            try {
                DB::statement($drop);
            } catch (\Throwable) {
                // Try the next syntax.
            }

            if (! $exists()) {
                return;
            }
        }

        throw new \RuntimeException(
            'Could not replace the ess_requests status constraint; it still exists.'
        );
    }

    private function addStatusConstraint(array $statuses): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        $list = implode("', '", $statuses);

        DB::statement(
            "ALTER TABLE `ess_requests` ADD CONSTRAINT `chk_ess_requests_status` CHECK (`status` IN ('{$list}'))"
        );
    }

    private function hasIndex(string $table, string $index): bool
    {
        if (DB::getDriverName() !== 'mysql') {
            return false;
        }

        return (int) DB::selectOne(
            "SELECT COUNT(*) AS c FROM information_schema.statistics
             WHERE table_schema = DATABASE()
               AND table_name = ?
               AND index_name = ?",
            [$table, $index]
        )->c > 0;
    }

    private function hasForeignKey(string $table, string $foreignKey): bool
    {
        if (DB::getDriverName() !== 'mysql') {
            return false;
        }

        return (int) DB::selectOne(
            "SELECT COUNT(*) AS c FROM information_schema.table_constraints
             WHERE constraint_schema = DATABASE()
               AND table_name = ?
               AND constraint_name = ?
               AND constraint_type = 'FOREIGN KEY'",
            [$table, $foreignKey]
        )->c > 0;
    }
};
