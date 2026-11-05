<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private const BACKUP_KEYS = [
        'cache'       => 'migration_backup.cache',
        'cache_locks' => 'migration_backup.cache_locks',
        'sessions'    => 'migration_backup.sessions',
    ];

    /**
     * Run the migrations.
     *
     * Phase 4c: cache, cache_locks and sessions move to the file drivers, so
     * the three database-backed framework tables are no longer needed. The
     * rows are snapshotted into system_settings first so a rollback can
     * restore the exact same state.
     */
    public function up(): void
    {
        if (! Schema::hasTable('system_settings')) {
            return;
        }

        foreach (self::BACKUP_KEYS as $table => $key) {
            if (! Schema::hasTable($table)) {
                continue;
            }

            $rows = DB::table($table)->get()->map(fn ($row) => (array) $row)->all();
            $encoded = json_encode($rows, JSON_INVALID_UTF8_SUBSTITUTE);

            DB::table('system_settings')->updateOrInsert(
                ['setting_key' => $key],
                [
                    'setting_value' => $encoded === false ? '[]' : $encoded,
                    'updated_at'    => now(),
                ]
            );
        }

        Schema::dropIfExists('cache');
        Schema::dropIfExists('cache_locks');
        Schema::dropIfExists('sessions');
    }

    /**
     * Reverse the migrations.
     *
     * Recreates the stock Laravel cache/cache_locks/sessions tables, restores
     * every snapshotted row, then removes the rollback keys.
     */
    public function down(): void
    {
        if (! Schema::hasTable('cache')) {
            Schema::create('cache', function (Blueprint $table) {
                $table->string('key')->primary();
                $table->mediumText('value');
                $table->integer('expiration')->index();
            });
        }

        if (! Schema::hasTable('cache_locks')) {
            Schema::create('cache_locks', function (Blueprint $table) {
                $table->string('key')->primary();
                $table->string('owner');
                $table->integer('expiration')->index();
            });
        }

        if (! Schema::hasTable('sessions')) {
            Schema::create('sessions', function (Blueprint $table) {
                $table->string('id')->primary();
                $table->foreignId('user_id')->nullable()->index();
                $table->string('ip_address', 45)->nullable();
                $table->text('user_agent')->nullable();
                $table->longText('payload');
                $table->integer('last_activity')->index();
            });
        }

        if (Schema::hasTable('system_settings')) {
            foreach (self::BACKUP_KEYS as $table => $key) {
                if (! Schema::hasTable($table)) {
                    continue;
                }

                $row = DB::table('system_settings')->where('setting_key', $key)->first();
                if (! $row || empty($row->setting_value)) {
                    continue;
                }

                $rows = json_decode((string) $row->setting_value, true);
                if (! is_array($rows)) {
                    continue;
                }

                foreach ($rows as $data) {
                    if (is_array($data)) {
                        DB::table($table)->insertOrIgnore($data);
                    }
                }
            }

            DB::table('system_settings')
                ->whereIn('setting_key', array_values(self::BACKUP_KEYS))
                ->delete();
        }
    }
};
