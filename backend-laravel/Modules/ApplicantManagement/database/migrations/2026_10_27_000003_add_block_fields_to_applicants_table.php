<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('applicants', function (Blueprint $table) {
            $table->boolean('is_blocked')->default(false);
            $table->timestamp('blocked_at')->nullable();
            $table->string('blocked_by', 160)->nullable();
            $table->text('blocked_reason')->nullable();
            $table->string('block_scope', 100)->nullable();
            $table->timestamp('block_expires_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('applicants', function (Blueprint $table) {
            $table->dropColumn([
                'is_blocked',
                'blocked_at',
                'blocked_by',
                'blocked_reason',
                'block_scope',
                'block_expires_at',
            ]);
        });
    }
};

