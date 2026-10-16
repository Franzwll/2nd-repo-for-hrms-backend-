<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Append-only timeline for an ESS request. Each status change (filed,
     * received by HR, fulfilled, rejected, returned) writes one row so the
     * employee-facing UI can show the Filed -> Received -> Fulfilled ->
     * Downloaded progress of the request.
     */
    public function up(): void
    {
        Schema::create('ess_request_status_histories', function (Blueprint $table) {
            $table->id('ess_request_status_history_id');
            $table->unsignedBigInteger('ess_request_id');
            $table->string('status', 30);
            $table->unsignedBigInteger('actor_user_id')->nullable();
            $table->text('note')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index('ess_request_id', 'idx_ess_request_status_histories_request_id');
            $table->index('status', 'idx_ess_request_status_histories_status');

            $table->foreign('ess_request_id', 'fk_ess_request_status_histories_request_id')
                  ->references('ess_request_id')->on('ess_requests')->onDelete('cascade');
            $table->foreign('actor_user_id', 'fk_ess_request_status_histories_actor')
                  ->references('system_user_id')->on('system_users');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ess_request_status_histories');
    }
};
