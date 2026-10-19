<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Re-application cooldown anchor on the applicant record.
     *
     *  - rejected_at        when the row entered the Rejected stage
     *                       (failed interview / assessment / practical /
     *                       final Not Recommended)
     *  - cooldown_lifted_at when HR explicitly allows early re-application
     *                       (override — skips the waiting period)
     *
     * Decliners (offer_status = Declined) never enter the cooldown — the
     * guard checks offer_status first and skips declined rows.
     */
    public function up(): void
    {
        Schema::table('applicants', function (Blueprint $table) {
            $table->timestamp('rejected_at')->nullable()->after('stage');
            $table->timestamp('cooldown_lifted_at')->nullable()->after('rejected_at');
        });

        // Backfill: existing Rejected rows anchor on their last update.
        DB::table('applicants')
            ->where('stage', 'Rejected')
            ->whereNull('rejected_at')
            ->update(['rejected_at' => DB::raw('updated_at')]);
    }

    public function down(): void
    {
        Schema::table('applicants', function (Blueprint $table) {
            $table->dropColumn(['rejected_at', 'cooldown_lifted_at']);
        });
    }
};
