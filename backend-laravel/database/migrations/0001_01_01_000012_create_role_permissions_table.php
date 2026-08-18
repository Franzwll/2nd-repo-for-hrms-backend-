<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('role_permissions', function (Blueprint $table) {
            $table->id('role_permission_id');
            $table->unsignedBigInteger('role_id');
            $table->string('module_name', 100);
            $table->string('permission_level', 40)->default('None');
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

            $table->unique(['role_id', 'module_name'], 'uq_role_permissions_natural');
            $table->index('role_id', 'idx_role_permissions_role_id');

            $table->foreign('role_id', 'fk_role_permissions_role_id')
                  ->references('role_id')->on('system_roles')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('role_permissions');
    }
};
