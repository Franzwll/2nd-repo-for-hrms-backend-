<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Gives ESS requests a real fulfilment step.
 *
 * - HR Document requests are approved into "For Fulfillment" and can only be
 *   completed once a file is attached.
 * - "Returned for Clarification" and "Cancelled" become first-class statuses
 *   (previously "Returned" was silently stored as Pending).
 */
return new class extends Migration
{
    private const STATUSES = [
        'Pending',
        'Under Review',
        'Approved',
        'For Fulfillment',
        'Rejected',
        'Returned for Clarification',
        'Completed',
        'Cancelled',
    ];

    public function up(): void
    {
        if (Schema::hasTable('ess_requests') && ! Schema::hasColumn('ess_requests', 'completed_at')) {
            Schema::table('ess_requests', function (Blueprint $table) {
                $table->timestamp('completed_at')->nullable()->after('review_note');
            });
        }

        if (Schema::hasTable('ess_categories') && ! Schema::hasColumn('ess_categories', 'requires_fulfillment')) {
            Schema::table('ess_categories', function (Blueprint $table) {
                $table->boolean('requires_fulfillment')->default(false)->after('is_open');
            });
        }

        // HR documents are the only category that must produce a file today.
        DB::table('ess_categories')
            ->where('code', 'ESS-HRDOC')
            ->orWhere('name', 'HR Document')
            ->update(['requires_fulfillment' => true]);

        // Existing Approved document requests were stuck at a dead-end; move
        // them into the fulfiller's queue so they can be completed.
        $legacy = DB::table('ess_requests as r')
            ->leftJoin('ess_categories as c', 'c.ess_category_id', '=', 'r.category_id')
            ->where('r.status', 'Approved')
            ->where(function ($q) {
                $q->whereIn('c.code', ['ESS-HRDOC', 'hr_document'])
                    ->orWhere('c.name', 'LIKE', '%Document%')
                    ->orWhere('r.request_type', 'LIKE', '%document%')
                    ->orWhere('r.request_type', 'LIKE', '%certificate%')
                    ->orWhere('r.request_type', 'LIKE', '%COE%')
                    ->orWhere('r.request_type', 'LIKE', '%service record%')
                    ->orWhere('r.request_type', 'LIKE', '%employment%');
            })
            ->pluck('r.ess_request_id');

        foreach ($legacy as $id) {
            DB::table('ess_requests')->where('ess_request_id', $id)->update([
                'status' => 'For Fulfillment',
                'updated_at' => now(),
            ]);
        }

        $this->setStatusConstraint(self::STATUSES);
    }

    public function down(): void
    {
        // Best-effort mapping back to the old five-status model.
        DB::table('ess_requests')->where('status', 'For Fulfillment')->update(['status' => 'Approved']);
        DB::table('ess_requests')->where('status', 'Returned for Clarification')->update(['status' => 'Pending']);
        DB::table('ess_requests')->where('status', 'Cancelled')->update(['status' => 'Rejected']);

        $this->setStatusConstraint(['Pending', 'Under Review', 'Approved', 'Rejected', 'Completed']);

        if (Schema::hasTable('ess_requests') && Schema::hasColumn('ess_requests', 'completed_at')) {
            Schema::table('ess_requests', function (Blueprint $table) {
                $table->dropColumn('completed_at');
            });
        }

        if (Schema::hasTable('ess_categories') && Schema::hasColumn('ess_categories', 'requires_fulfillment')) {
            Schema::table('ess_categories', function (Blueprint $table) {
                $table->dropColumn('requires_fulfillment');
            });
        }
    }

    private function setStatusConstraint(array $statuses): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        $list = implode("', '", $statuses);
        $exists = fn (): bool => (int) DB::selectOne(
            "SELECT COUNT(*) AS c FROM information_schema.table_constraints
             WHERE constraint_schema = DATABASE()
               AND table_name = 'ess_requests'
               AND constraint_name = 'chk_ess_requests_status'
               AND constraint_type = 'CHECK'"
        )->c > 0;

        if ($exists()) {
            // MySQL 8 uses DROP CHECK; MariaDB (and some MySQL builds) use
            // DROP CONSTRAINT. Try both and only continue once it is gone.
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
                    break;
                }
            }
        }

        if ($exists()) {
            throw new \RuntimeException(
                'Could not replace the ess_requests status constraint; it still exists.'
            );
        }

        DB::statement(
            "ALTER TABLE `ess_requests` ADD CONSTRAINT `chk_ess_requests_status` CHECK (`status` IN ('{$list}'))"
        );
    }
};
