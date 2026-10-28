<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('applicants', function (Blueprint $table) {
            $table->timestamp('archived_at')->nullable();
            $table->string('archived_by', 160)->nullable();
            $table->text('archived_reason')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('applicants', function (Blueprint $table) {
            $table->dropColumn(['archived_at', 'archived_by', 'archived_reason']);
        });
    }
};

