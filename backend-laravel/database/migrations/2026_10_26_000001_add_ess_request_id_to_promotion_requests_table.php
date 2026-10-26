<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Links the HR promotion work item to the employee-visible ESS request so
     * both records can be created and updated together. Defensive: some
     * deployed databases already carry the column without the migration row.
     */
    public function up(): void
    {
        if (! Schema::hasColumn('promotion_requests', 'ess_request_id')) {
            Schema::table('promotion_requests', function (Blueprint $table) {
                $table->unsignedBigInteger('ess_request_id')->nullable()->after('employee_id');
                $table->index('ess_request_id', 'idx_promo_req_ess_request');
            });
        }

        try {
            Schema::table('promotion_requests', function (Blueprint $table) {
                $table->foreign('ess_request_id', 'fk_promo_req_ess_request')
                    ->references('ess_request_id')->on('ess_requests')->nullOnDelete();
            });
        } catch (\Throwable $e) {
            // Foreign key may already exist or the engine may not support it.
        }
    }

    public function down(): void
    {
        try {
            Schema::table('promotion_requests', function (Blueprint $table) {
                $table->dropForeign('fk_promo_req_ess_request');
            });
        } catch (\Throwable $e) {
        }

        try {
            Schema::table('promotion_requests', function (Blueprint $table) {
                $table->dropIndex('idx_promo_req_ess_request');
            });
        } catch (\Throwable $e) {
        }

        if (Schema::hasColumn('promotion_requests', 'ess_request_id')) {
            Schema::table('promotion_requests', function (Blueprint $table) {
                $table->dropColumn('ess_request_id');
            });
        }
    }
};
