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
            $table->unsignedBigInteger('hr3_recommendation_id')->nullable()->after('requested_salary_grade_id');
            $table->unsignedBigInteger('forwarded_to_hr3_by')->nullable()->after('reviewed_by');
            $table->timestamp('forwarded_to_hr3_at')->nullable()->after('forwarded_to_hr3_by');

            $table->index('hr3_recommendation_id', 'idx_promo_req_hr3_rec');
        });

        // Broaden the status check to the new loop states (additive only).
        // MySQL has no DROP CONSTRAINT IF EXISTS for CHECKs on all versions,
        // so drop by name and re-add.
        try {
            DB::statement('ALTER TABLE `promotion_requests` DROP CHECK `chk_promo_req_status`');
        } catch (\Throwable $e) {
            // Constraint may not exist on some installs — continue.
        }
        DB::statement("ALTER TABLE `promotion_requests` ADD CONSTRAINT `chk_promo_req_status` CHECK (`status` IN ('Pending','Under HR3 Review','Pending HR Action','Approved','Rejected','Returned','Terminated','Deferred'))");

        Schema::table('hr3_recommendations', function (Blueprint $table) {
            $table->unsignedBigInteger('promotion_request_id')->nullable()->after('employee_id');

            $table->index('promotion_request_id', 'idx_hr3_rec_promo_req');
            $table->foreign('promotion_request_id', 'fk_hr3_rec_promo_req')
                ->references('promotion_request_id')->on('promotion_requests')->nullOnDelete();
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
            DB::statement('ALTER TABLE `promotion_requests` DROP CHECK `chk_promo_req_status`');
        } catch (\Throwable $e) {
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
