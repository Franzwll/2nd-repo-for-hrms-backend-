<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Timestamp of when HR requested the probationary performance
        // evaluation for this hire. Null = no request pending. This powers
        // the DOLE auto-regularization rule (6 months worked without a
        // completed evaluation => regular by operation of law) and must be
        // shared by every admin session, so it lives on the hire record
        // itself rather than in browser state.
        Schema::table('new_hires', function (Blueprint $table) {
            $table->timestamp('evaluation_requested_at')->nullable()->after('start_date');
        });
    }

    public function down(): void
    {
        Schema::table('new_hires', function (Blueprint $table) {
            $table->dropColumn('evaluation_requested_at');
        });
    }
};
