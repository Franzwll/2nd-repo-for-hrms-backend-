<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('new_hires', function (Blueprint $table) {
            if (! Schema::hasColumn('new_hires', 'completed_at')) {
                $table->timestamp('completed_at')->nullable()->after('evaluation_requested_at');
            }
        });
    }

    public function down(): void
    {
        Schema::table('new_hires', function (Blueprint $table) {
            if (Schema::hasColumn('new_hires', 'completed_at')) {
                $table->dropColumn('completed_at');
            }
        });
    }
};
