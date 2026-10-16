<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Custom interview ranges — an interview booked at any clock time can also
 * carry an explicit end time (e.g. "10:00 – 11:00"). Null keeps the previous
 * behaviour: the end is derived from the configured slot interval.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('interviews', function (Blueprint $table) {
            $table->time('scheduled_end_time')->nullable()->after('scheduled_time');
        });
    }

    public function down(): void
    {
        Schema::table('interviews', function (Blueprint $table) {
            $table->dropColumn('scheduled_end_time');
        });
    }
};
