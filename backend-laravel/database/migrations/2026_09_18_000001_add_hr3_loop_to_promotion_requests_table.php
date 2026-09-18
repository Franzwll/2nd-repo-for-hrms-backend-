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
        Schema::table('promotion_requests', function (Blueprint $table) {
            if (! Schema::hasColumn('promotion_requests', 'hr3_recommendation_id')) {
                $table->unsignedBigInteger('hr3_recommendation_id')->nullable()->after('requested_salary_grade_id');
                $table->index('hr3_recommendation_id', 'idx_promo_req_hr3_rec');
            }
            if (! Schema::hasColumn('promotion_requests', 'forwarded_to_hr3_by')) {
                $table->unsignedBigInteger('forwarded_to_hr3_by')->nullable()->after('reviewed_by');
            }
            if (! Schema::hasColumn('promotion_requests', 'forwarded_to_hr3_at')) {
                $table->timestamp('forwarded_to_hr3_at')->nullable()->after('forwarded_to_hr3_by');
            }
        });

        // Broaden the status check to the new loop states (additive only).
        // MariaDB uses DROP CONSTRAINT; MySQL 8.0.16+ supports DROP CHECK / DROP CONSTRAINT.
        try {
            DB::statement('ALTER TABLE `promotion_requests` DROP CONSTRAINT `chk_promo_req_status`');
        } catch (\Throwable $e) {
            try {
                DB::statement('ALTER TABLE `promotion_requests` DROP CHECK `chk_promo_req_status`');
            } catch (\Throwable $e2) {
                // Constraint may not exist on some installs — continue.
            }
        }
        try {
            DB::statement("ALTER TABLE `promotion_requests` ADD CONSTRAINT `chk_promo_req_status` CHECK (`status` IN ('Pending','Under HR3 Review','Pending HR Action','Approved','Rejected','Returned','Terminated','Deferred'))");
        } catch (\Throwable $e) {
            // If constraint could not be added, continue without crashing.
        }

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

        try {
            DB::statement('ALTER TABLE `promotion_requests` DROP CONSTRAINT `chk_promo_req_status`');
        } catch (\Throwable $e) {
            try {
                DB::statement('ALTER TABLE `promotion_requests` DROP CHECK `chk_promo_req_status`');
            } catch (\Throwable $e2) {
            }
        }
        try {
            DB::statement("ALTER TABLE `promotion_requests` ADD CONSTRAINT `chk_promo_req_status` CHECK (`status` IN ('Pending','Approved','Rejected','Returned'))");
        } catch (\Throwable $e) {
        }

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
