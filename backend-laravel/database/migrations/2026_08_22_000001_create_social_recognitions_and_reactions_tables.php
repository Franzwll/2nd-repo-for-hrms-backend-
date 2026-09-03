<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (! Schema::hasTable('social_recognitions')) {
            Schema::create('social_recognitions', function (Blueprint $table) {
                $table->id('recognition_id');
                $table->unsignedBigInteger('sender_employee_id')->nullable()->index();
                $table->unsignedBigInteger('recipient_employee_id')->nullable()->index();
                $table->string('sender_name');
                $table->string('recipient_name');
                $table->string('sender_role')->nullable();
                $table->string('recipient_role')->nullable();
                $table->string('core_value', 100);
                $table->text('message');
                $table->unsignedInteger('clap_count')->default(0);
                $table->unsignedInteger('heart_count')->default(0);
                $table->unsignedInteger('star_count')->default(0);
                $table->unsignedInteger('fire_count')->default(0);
                $table->timestamps();

                $table->foreign('sender_employee_id')
                    ->references('employee_id')
                    ->on('employees')
                    ->onDelete('set null');

                $table->foreign('recipient_employee_id')
                    ->references('employee_id')
                    ->on('employees')
                    ->onDelete('set null');
            });
        }

        if (! Schema::hasTable('recognition_reactions')) {
            Schema::create('recognition_reactions', function (Blueprint $table) {
                $table->id('reaction_id');
                $table->unsignedBigInteger('recognition_id');
                $table->unsignedBigInteger('employee_id')->nullable();
                $table->string('reaction_type', 50); // clap, heart, star, fire
                $table->timestamps();

                $table->foreign('recognition_id')
                    ->references('recognition_id')
                    ->on('social_recognitions')
                    ->onDelete('cascade');

                $table->foreign('employee_id')
                    ->references('employee_id')
                    ->on('employees')
                    ->onDelete('cascade');

                $table->unique(['recognition_id', 'employee_id', 'reaction_type'], 'rec_emp_react_unique');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('recognition_reactions');
        Schema::dropIfExists('social_recognitions');
    }
};
