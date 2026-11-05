<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Inlines the interview facilities into the existing `system_settings`
     * key-value store under `interview.facilities` (Phase 4b). Every row keeps
     * its original facility_id so `interviews.facility_id` stays a stable
     * reference. The FK from interviews.facility_id is dropped, but the column
     * is kept as a plain integer.
     */
    public function up(): void
    {
        if (! Schema::hasTable('facilities')) {
            return;
        }

        // 1. Snapshot the original rows for rollback and keep the same rows
        //    (original ids) in system_settings under interview.facilities.
        $facilities = DB::table('facilities')->orderBy('facility_id')->get();

        $rows = $facilities->map(fn ($row) => [
            'facility_id' => (int) $row->facility_id,
            'name'        => $row->name,
            'type'        => $row->type,
            'location'    => $row->location,
            'capacity'    => (int) $row->capacity,
            'icon'        => $row->icon,
            'description' => $row->description,
            'is_active'   => (bool) $row->is_active,
            'created_at'  => (string) $row->created_at,
            'updated_at'  => (string) $row->updated_at,
        ])->all();

        if (Schema::hasTable('system_settings')) {
            DB::table('system_settings')->updateOrInsert(
                ['setting_key' => 'migration_backup.facilities'],
                ['setting_value' => json_encode($rows), 'updated_at' => now()]
            );

            DB::table('system_settings')->updateOrInsert(
                ['setting_key' => 'interview.facilities'],
                ['setting_value' => json_encode($rows), 'updated_at' => now()]
            );
        }

        // 2. Drop the FK from interviews but keep facility_id as a plain key.
        if (Schema::hasTable('interviews')) {
            $create = collect(DB::select('SHOW CREATE TABLE interviews'))
                ->first()?->{'Create Table'} ?? '';

            if (str_contains($create, 'fk_interviews_facility_id')) {
                Schema::table('interviews', function (Blueprint $table) {
                    $table->dropForeign('fk_interviews_facility_id');
                });
            }
        }

        // 3. Drop the now-inlined table.
        Schema::dropIfExists('facilities');
    }

    /**
     * Reverse the migrations.
     *
     * Recreates facilities (structure, indexes and check constraint), restores
     * every original row from the backup (plus any facility added after the
     * merge from interview.facilities), re-adds the interviews FK, then drops
     * the setting and the backup key.
     */
    public function down(): void
    {
        // 1. Recreate facilities.
        if (! Schema::hasTable('facilities')) {
            Schema::create('facilities', function (Blueprint $table) {
                $table->id('facility_id');
                $table->string('name', 120)->unique();
                $table->string('type', 20);
                $table->string('location', 190)->nullable();
                $table->unsignedInteger('capacity')->default(1);
                $table->string('icon', 60)->nullable();
                $table->text('description')->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamp('created_at')->useCurrent();
                $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

                $table->index('type', 'idx_facilities_type');
                $table->index('is_active', 'idx_facilities_is_active');
            });

            DB::statement("ALTER TABLE `facilities` ADD CONSTRAINT `chk_facilities_type` CHECK (`type` IN ('On-site', 'Virtual'))");
        }

        // 2. Restore rows: the original backup first, then the live setting so
        //    edits/additions made after the merge win.
        $restore = [];

        foreach ([$this->settingRows('migration_backup.facilities'), $this->settingRows('interview.facilities')] as $source) {
            foreach ($source as $row) {
                $id = (int) ($row['facility_id'] ?? 0);
                if ($id > 0) {
                    $restore[$id] = $row;
                }
            }
        }

        foreach ($restore as $id => $row) {
            DB::table('facilities')->updateOrInsert(
                ['facility_id' => $id],
                [
                    'name'        => $row['name'] ?? 'Facility ' . $id,
                    'type'        => $row['type'] ?? 'On-site',
                    'location'    => $row['location'] ?? null,
                    'capacity'    => (int) ($row['capacity'] ?? 1),
                    'icon'        => $row['icon'] ?? null,
                    'description' => $row['description'] ?? null,
                    'is_active'   => (bool) ($row['is_active'] ?? true),
                    'created_at'  => $row['created_at'] ?? now(),
                    'updated_at'  => $row['updated_at'] ?? now(),
                ]
            );
        }

        if (! empty($restore)) {
            DB::statement('ALTER TABLE `facilities` AUTO_INCREMENT = ' . (max(array_keys($restore)) + 1));
        }

        // 3. Re-add the interviews FK (ON DELETE SET NULL, as before).
        if (Schema::hasTable('interviews')) {
            $create = collect(DB::select('SHOW CREATE TABLE interviews'))
                ->first()?->{'Create Table'} ?? '';

            if (! str_contains($create, 'fk_interviews_facility_id')) {
                DB::statement(
                    'ALTER TABLE `interviews`
                     ADD CONSTRAINT `fk_interviews_facility_id`
                     FOREIGN KEY (`facility_id`) REFERENCES `facilities` (`facility_id`)
                     ON DELETE SET NULL'
                );
            }
        }

        // 4. Clean up the setting and the rollback snapshot.
        if (Schema::hasTable('system_settings')) {
            DB::table('system_settings')
                ->whereIn('setting_key', ['interview.facilities', 'migration_backup.facilities'])
                ->delete();
        }
    }

    /** @return array<int, array<string, mixed>> */
    private function settingRows(string $key): array
    {
        if (! Schema::hasTable('system_settings')) {
            return [];
        }

        $row = DB::table('system_settings')->where('setting_key', $key)->first();
        if (! $row || empty($row->setting_value)) {
            return [];
        }

        $decoded = json_decode((string) $row->setting_value, true);

        return is_array($decoded) ? array_values(array_filter($decoded, 'is_array')) : [];
    }
};
