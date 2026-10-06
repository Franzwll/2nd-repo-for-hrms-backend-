<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Additive succession loop: ESS request -> Core HCM -> HR3 -> decision.
     * Links promotion_requests to hr3_recommendations without changing
     * the existing direct-approve path.
     */
    public function up(): void
    {
        // Idempotent: some environments already carry these columns
        // (added manually) without the migration record.
        Schema::table('promotion_requests', function (Blueprint $table) {
            if (! Schema::hasColumn('promotion_requests', 'hr3_recommendation_id')) {
                $table->unsignedBigInteger('hr3_recommendation_id')->nullable()->after('requested_salary_grade_id');
            }
            if (! Schema::hasColumn('promotion_requests', 'forwarded_to_hr3_by')) {
                $table->unsignedBigInteger('forwarded_to_hr3_by')->nullable()->after('reviewed_by');
            }
            if (! Schema::hasColumn('promotion_requests', 'forwarded_to_hr3_at')) {
                $table->timestamp('forwarded_to_hr3_at')->nullable()->after('forwarded_to_hr3_by');
            }
        });

        // Index on the link column (skipped if it already exists).
        try {
            Schema::table('promotion_requests', function (Blueprint $table) {
                $table->index('hr3_recommendation_id', 'idx_promo_req_hr3_rec');
            });
        } catch (\Throwable $e) {
        }

        // Broaden the status check to the new loop states (additive only).
        // MySQL uses DROP CHECK, MariaDB 10.4 uses DROP CONSTRAINT —
        // try both, then re-add the widened constraint.
        foreach ([
            'ALTER TABLE `promotion_requests` DROP CHECK `chk_promo_req_status`',
            'ALTER TABLE `promotion_requests` DROP CONSTRAINT `chk_promo_req_status`',
        ] as $drop) {
            try {
                DB::statement($drop);
                break;
            } catch (\Throwable $e) {
                // Wrong dialect or already dropped — try the next form.
            }
        }
        DB::statement("ALTER TABLE `promotion_requests` ADD CONSTRAINT `chk_promo_req_status` CHECK (`status` IN ('Pending','Under HR3 Review','Pending HR Action','Approved','Rejected','Returned','Terminated','Deferred'))");

        Schema::table('hr3_recommendations', function (Blueprint $table) {
            if (! Schema::hasColumn('hr3_recommendations', 'promotion_request_id')) {
                $table->unsignedBigInteger('promotion_request_id')->nullable()->after('employee_id');

                $table->index('promotion_request_id', 'idx_hr3_rec_promo_req');
                $table->foreign('promotion_request_id', 'fk_hr3_rec_promo_req')
                    ->references('promotion_request_id')->on('promotion_requests')->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::table('hr3_recommendations', function (Blueprint $table) {
            try {
                $table->dropForeign('fk_hr3_rec_promo_req');
            } catch (\Throwable $e) {
            }
            try {
                $table->dropIndex('idx_hr3_rec_promo_req');
            } catch (\Throwable $e) {
            }
            if (Schema::hasColumn('hr3_recommendations', 'promotion_request_id')) {
                $table->dropColumn('promotion_request_id');
            }
        });

        foreach ([
            'ALTER TABLE `promotion_requests` DROP CHECK `chk_promo_req_status`',
            'ALTER TABLE `promotion_requests` DROP CONSTRAINT `chk_promo_req_status`',
        ] as $drop) {
            try {
                DB::statement($drop);
                break;
            } catch (\Throwable $e) {
            }
        }
        DB::statement("ALTER TABLE `promotion_requests` ADD CONSTRAINT `chk_promo_req_status` CHECK (`status` IN ('Pending','Approved','Rejected','Returned'))");

        Schema::table('promotion_requests', function (Blueprint $table) {
            try {
                $table->dropIndex('idx_promo_req_hr3_rec');
            } catch (\Throwable $e) {
            }
            foreach (['hr3_recommendation_id', 'forwarded_to_hr3_by', 'forwarded_to_hr3_at'] as $col) {
                if (Schema::hasColumn('promotion_requests', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};
