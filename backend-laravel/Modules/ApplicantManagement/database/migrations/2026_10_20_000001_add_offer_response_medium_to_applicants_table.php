<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * How the applicant replied to the offer.
     *
     * There is no applicant portal / inbound email-SMS integration, so HR
     * reads the reply (email, SMS, call or walk-in) and records it together
     * with the accept/decline decision. These columns make that medium
     * auditable instead of implicit:
     *
     *  - offer_response_channel      Email | SMS | Call | In person
     *  - offer_response_note         optional free-text detail
     *  - offer_responded_at          when HR recorded the reply
     *  - offer_response_recorded_by  HR user who recorded it
     */
    public function up(): void
    {
        Schema::table('applicants', function (Blueprint $table) {
            $table->string('offer_response_channel', 20)->nullable()->after('offer_start_date');
            $table->text('offer_response_note')->nullable()->after('offer_response_channel');
            $table->timestamp('offer_responded_at')->nullable()->after('offer_response_note');
            $table->string('offer_response_recorded_by', 150)->nullable()->after('offer_responded_at');
        });

        DB::statement("ALTER TABLE `applicants` ADD CONSTRAINT `chk_applicants_offer_response_channel` CHECK (`offer_response_channel` IS NULL OR `offer_response_channel` IN ('Email', 'SMS', 'Call', 'In person'))");
    }

    public function down(): void
    {
        $this->dropResponseChannelCheck();

        Schema::table('applicants', function (Blueprint $table) {
            $table->dropColumn([
                'offer_response_channel',
                'offer_response_note',
                'offer_responded_at',
                'offer_response_recorded_by',
            ]);
        });
    }

    private function dropResponseChannelCheck(): void
    {
        $version = (string) DB::selectOne('SELECT VERSION() AS v')->v;
        $syntax = str_contains($version, 'MariaDB') ? 'DROP CONSTRAINT' : 'DROP CHECK';

        try {
            DB::statement("ALTER TABLE `applicants` {$syntax} `chk_applicants_offer_response_channel`");
        } catch (Throwable) {
            // The constraint may not exist (fresh schema) — nothing to drop.
        }
    }
};
