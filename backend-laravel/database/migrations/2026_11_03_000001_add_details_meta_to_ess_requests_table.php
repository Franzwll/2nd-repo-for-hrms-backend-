<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Structured request payloads (loan amount, term, amortization, and future
     * type-specific fields). `details` remains the free-text justification;
     * this column lets the tracker render readable summaries such as
     * "₱20,000 · 6 months · ₱3,333/mo" without parsing prose.
     */
    public function up(): void
    {
        if (Schema::hasColumn('ess_requests', 'details_meta')) {
            return;
        }

        Schema::table('ess_requests', function (Blueprint $table) {
            $table->json('details_meta')->nullable()->after('details');
        });
    }

    public function down(): void
    {
        if (! Schema::hasColumn('ess_requests', 'details_meta')) {
            return;
        }

        Schema::table('ess_requests', function (Blueprint $table) {
            $table->dropColumn('details_meta');
        });
    }
};
