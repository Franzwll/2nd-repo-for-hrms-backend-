<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Decision record 4b: restore the facilities table and the interviews FK.
     *
     * Live rows in interview.facilities win; the migration_backup.facilities
     * snapshot is the fallback. The setting is removed once the table holds the
     * same rows, so there is a single source of truth.
     */
    public function up(): void
    {
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

        $rows = [];

        if (Schema::hasTable('system_settings')) {
            foreach (['migration_backup.facilities', 'interview.facilities'] as $key) {
                $raw = DB::table('system_settings')->where('setting_key', $key)->value('setting_value');
                $decoded = is_string($raw) ? json_decode($raw, true) : $raw;
                if (! is_array($decoded)) {
                    continue;
                }

                foreach ($decoded as $row) {
                    $id = (int) ($row['facility_id'] ?? 0);
                    if ($id > 0) {
                        $rows[$id] = $row;
                    }
                }
            }
        }

        foreach ($rows as $id => $row) {
            DB::table('facilities')->updateOrInsert(
                ['facility_id' => $id],
                [
                    'name' => $row['name'] ?? 'Facility ' . $id,
                    'type' => $row['type'] ?? 'On-site',
                    'location' => $row['location'] ?? null,
                    'capacity' => (int) ($row['capacity'] ?? 1),
                    'icon' => $row['icon'] ?? null,
                    'description' => $row['description'] ?? null,
                    'is_active' => (bool) ($row['is_active'] ?? true),
                    'created_at' => $row['created_at'] ?? now(),
                    'updated_at' => $row['updated_at'] ?? now(),
                ]
            );
        }

        if ($rows !== []) {
            DB::statement('ALTER TABLE `facilities` AUTO_INCREMENT = ' . (max(array_keys($rows)) + 1));
        }

        $this->addInterviewsForeignKeys();

        if (Schema::hasTable('system_settings')) {
            DB::table('system_settings')->where('setting_key', 'interview.facilities')->delete();
        }
    }

    public function down(): void
    {
        if (! Schema::hasTable('facilities')) {
            return;
        }

        $rows = DB::table('facilities')->orderBy('facility_id')->get()->map(fn ($row) => [
            'facility_id' => $row->facility_id,
            'name' => $row->name,
            'type' => $row->type,
            'location' => $row->location,
            'capacity' => (int) $row->capacity,
            'icon' => $row->icon,
            'description' => $row->description,
            'is_active' => (bool) $row->is_active,
            'created_at' => $row->created_at,
            'updated_at' => $row->updated_at,
        ])->values()->all();

        if (Schema::hasTable('system_settings')) {
            DB::table('system_settings')->updateOrInsert(
                ['setting_key' => 'interview.facilities'],
                ['setting_value' => json_encode($rows), 'updated_at' => now()]
            );
        }

        $this->dropInterviewsForeignKey();

        Schema::dropIfExists('facilities');
    }

    private function addInterviewsForeignKeys(): void
    {
        if (! Schema::hasTable('interviews')) {
            return;
        }

        $create = collect(DB::select('SHOW CREATE TABLE interviews'))->first()?->{'Create Table'} ?? '';
        if (str_contains($create, 'fk_interviews_facility_id')) {
            return;
        }

        DB::statement(
            'ALTER TABLE `interviews`
             ADD CONSTRAINT `fk_interviews_facility_id`
             FOREIGN KEY (`facility_id`) REFERENCES `facilities` (`facility_id`)
             ON DELETE SET NULL'
        );
    }

    private function dropInterviewsForeignKey(): void
    {
        if (! Schema::hasTable('interviews')) {
            return;
        }

        $create = collect(DB::select('SHOW CREATE TABLE interviews'))->first()?->{'Create Table'} ?? '';
        if (str_contains($create, 'fk_interviews_facility_id')) {
            DB::statement('ALTER TABLE `interviews` DROP FOREIGN KEY `fk_interviews_facility_id`');
        }
    }
};
