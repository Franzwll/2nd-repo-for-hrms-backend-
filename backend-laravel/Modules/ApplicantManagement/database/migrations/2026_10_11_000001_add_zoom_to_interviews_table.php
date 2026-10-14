<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Zoom virtual-interview links on interviews.
     *
     * Virtual (Online) interviews auto-generate a Zoom meeting on booking:
     *  - zoom_meeting_id   : Zoom-style meeting ID (mock-generated until a
     *                        real Zoom Server-to-Server OAuth app is wired).
     *  - zoom_join_url     : 1st link emailed to the applicant (Join Zoom).
     *  - zoom_continue_url : 2nd link emailed (Continue / Rejoin if dropped).
     *  - zoom_password     : meeting password emailed to the applicant.
     */
    public function up(): void
    {
        Schema::table('interviews', function (Blueprint $table) {
            $table->string('zoom_meeting_id', 64)->nullable()->after('interviewer_name');
            $table->text('zoom_join_url')->nullable()->after('zoom_meeting_id');
            $table->text('zoom_continue_url')->nullable()->after('zoom_join_url');
            $table->string('zoom_password', 64)->nullable()->after('zoom_continue_url');
        });
    }

    public function down(): void
    {
        Schema::table('interviews', function (Blueprint $table) {
            $table->dropColumn(['zoom_meeting_id', 'zoom_join_url', 'zoom_continue_url', 'zoom_password']);
        });
    }
};
