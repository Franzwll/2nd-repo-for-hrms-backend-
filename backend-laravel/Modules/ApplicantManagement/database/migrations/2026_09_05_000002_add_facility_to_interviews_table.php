<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Facility request on interviews: every scheduled interview may reserve a
     * facility (Room 1-3 / Online Interview). Requests start in
     * "Waiting for Facility Approval" and are confirmed ("Facility Approved")
     * by the facility owner — mocked as an automatic approval in the UI.
     */
    public function up(): void
    {
        Schema::table('interviews', function (Blueprint $table) {
            $table->unsignedBigInteger('facility_id')->nullable()->after('mode');
            $table->string('facility_status', 40)->nullable()->default('Not Required')->after('facility_id');

            $table->index('facility_id', 'idx_interviews_facility_id');

            $table->foreign('facility_id', 'fk_interviews_facility_id')
                  ->references('facility_id')->on('facilities')
                  ->nullOnDelete();
        });

        DB::statement("ALTER TABLE `interviews` ADD CONSTRAINT `chk_interviews_facility_status` CHECK (`facility_status` IN ('Not Required', 'Waiting for Facility Approval', 'Facility Approved', 'Facility Declined'))");
    }

    public function down(): void
    {
        $version = (string) DB::selectOne('SELECT VERSION() AS v')->v;
        $syntax = str_contains($version, 'MariaDB') ? 'DROP CONSTRAINT' : 'DROP CHECK';

        try {
            DB::statement("ALTER TABLE `interviews` {$syntax} `chk_interviews_facility_status`");
        } catch (Throwable) {
            // Constraint may not exist on a fresh schema.
        }

        Schema::table('interviews', function (Blueprint $table) {
            $table->dropForeign('fk_interviews_facility_id');
            $table->dropIndex('idx_interviews_facility_id');
            $table->dropColumn(['facility_id', 'facility_status']);
        });
    }
};
