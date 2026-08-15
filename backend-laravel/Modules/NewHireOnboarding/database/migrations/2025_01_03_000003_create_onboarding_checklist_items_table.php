<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('onboarding_checklist_items', function (Blueprint $table) {
            $table->id('template_item_id');
            $table->unsignedBigInteger('template_id');
            $table->text('item_text');
            $table->integer('sort_order');
            $table->timestamp('created_at')->useCurrent();

            $table->index('template_id', 'idx_onboarding_checklist_items_template_id');

            $table->foreign('template_id', 'fk_onboarding_checklist_items_template_id')
                  ->references('template_id')->on('onboarding_checklist_templates')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('onboarding_checklist_items');
    }
};
