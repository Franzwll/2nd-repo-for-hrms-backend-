<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Offer workflow on the applicant record.
     *
     * After a Final Evaluation recommends the candidate (Recommended for Hire
     * or For Another Position) the staff sends the offer email. The applicant
     * has 7 days to respond — HR records the reply (there is no applicant
     * portal), so these columns hold the offer state and the response window:
     *
     *  - offer_status      Pending | Accepted | Declined
     *  - offer_sent_at     when the offer email was sent
     *  - offer_expires_at  offer_sent_at + 7 days (no response = declined)
     *  - offer_start_date  first working day, set by HR when accepting —
     *                      becomes the new hire's onboarding start date
     *                      (the anchor for the "Days of Work" counter).
     */
    public function up(): void
    {
        Schema::table('applicants', function (Blueprint $table) {
            $table->string('offer_status', 20)->nullable()->after('stage');
            $table->timestamp('offer_sent_at')->nullable()->after('offer_status');
            $table->timestamp('offer_expires_at')->nullable()->after('offer_sent_at');
            $table->date('offer_start_date')->nullable()->after('offer_expires_at');
        });

        DB::statement("ALTER TABLE `applicants` ADD CONSTRAINT `chk_applicants_offer_status` CHECK (`offer_status` IS NULL OR `offer_status` IN ('Pending', 'Accepted', 'Declined'))");
    }

    public function down(): void
    {
        $this->dropOfferStatusCheck();

        Schema::table('applicants', function (Blueprint $table) {
            $table->dropColumn(['offer_status', 'offer_sent_at', 'offer_expires_at', 'offer_start_date']);
        });
    }

    private function dropOfferStatusCheck(): void
    {
        $version = (string) DB::selectOne('SELECT VERSION() AS v')->v;
        $syntax = str_contains($version, 'MariaDB') ? 'DROP CONSTRAINT' : 'DROP CHECK';

        try {
            DB::statement("ALTER TABLE `applicants` {$syntax} `chk_applicants_offer_status`");
        } catch (Throwable) {
            // The constraint may not exist (fresh schema) — nothing to drop.
        }
    }
};
