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
     * Inlines screening_requirement_template_items into
     * screening_requirement_templates.items_json (items ordered by item_id)
     * and drops the child table. Original rows are snapshotted in
     * system_settings so down() can restore the exact table, rows,
     * auto-increment and unique constraint.
     */
    public function up(): void
    {
        if (! Schema::hasTable('screening_requirement_template_items')) {
            return;
        }

        // 1. Add items_json column to templates if missing
        if (Schema::hasTable('screening_requirement_templates') && ! Schema::hasColumn('screening_requirement_templates', 'items_json')) {
            Schema::table('screening_requirement_templates', function (Blueprint $table) {
                $table->longText('items_json')->nullable()->after('active');
            });
        }

        // 2. Snapshot original rows for rollback
        $items = DB::table('screening_requirement_template_items')->orderBy('item_id')->get();

        if (Schema::hasTable('system_settings')) {
            DB::table('system_settings')->updateOrInsert(
                ['setting_key' => 'migration_backup.screening_requirement_template_items'],
                ['setting_value' => json_encode($items->map(fn ($r) => (array) $r)->all()), 'updated_at' => now()]
            );
        }

        // 3. Group by template_id and inline as JSON
        $byTemplate = [];
        foreach ($items as $item) {
            $byTemplate[$item->template_id][] = [
                'item_id'     => (int) $item->item_id,
                'template_id' => (int) $item->template_id,
                'entity_type' => $item->entity_type,
                'value'       => $item->value,
                'required'    => (bool) $item->required,
                'created_at'  => (string) $item->created_at,
            ];
        }

        foreach ($byTemplate as $templateId => $templateItems) {
            DB::table('screening_requirement_templates')
                ->where('template_id', $templateId)
                ->update(['items_json' => json_encode($templateItems)]);
        }

        // 4. Drop foreign key, then the child table
        Schema::table('screening_requirement_template_items', function (Blueprint $table) {
            $table->dropForeign('fk_screening_req_items_template');
        });
        Schema::dropIfExists('screening_requirement_template_items');
    }

    /**
     * Reverse the migrations.
     *
     * Recreates screening_requirement_template_items (structure, unique key,
     * index and FK), restores every original row with its item_id, then drops
     * the items_json column from templates.
     */
    public function down(): void
    {
        // 1. Recreate screening_requirement_template_items
        if (! Schema::hasTable('screening_requirement_template_items')) {
            Schema::create('screening_requirement_template_items', function (Blueprint $table) {
                $table->id('item_id');
                $table->unsignedBigInteger('template_id');
                // skill | job_role | certification | education | experience
                $table->string('entity_type', 20);
                $table->string('value', 255);
                $table->boolean('required')->default(1);
                $table->timestamp('created_at')->useCurrent();

                $table->unique(['template_id', 'entity_type', 'value'], 'uq_screening_req_items_value');
                $table->index('template_id', 'idx_screening_req_items_template');
                $table->foreign('template_id', 'fk_screening_req_items_template')
                      ->references('template_id')->on('screening_requirement_templates')
                      ->cascadeOnDelete();
            });
        }

        // 2. Restore rows from system_settings backup (preferred) or from the
        //    templates' items_json (fallback)
        $backupRows = null;
        if (Schema::hasTable('system_settings')) {
            $row = DB::table('system_settings')
                ->where('setting_key', 'migration_backup.screening_requirement_template_items')
                ->first();
            if ($row && ! empty($row->setting_value)) {
                $backupRows = json_decode($row->setting_value, true);
            }
        }

        $maxId = 0;

        if (is_array($backupRows) && ! empty($backupRows)) {
            foreach ($backupRows as $r) {
                DB::table('screening_requirement_template_items')->insert([
                    'item_id'     => $r['item_id'],
                    'template_id' => $r['template_id'],
                    'entity_type' => $r['entity_type'],
                    'value'       => $r['value'],
                    'required'    => (int) $r['required'],
                    'created_at'  => $r['created_at'] ?? now(),
                ]);
                $maxId = max($maxId, (int) $r['item_id']);
            }
        } elseif (Schema::hasTable('screening_requirement_templates') && Schema::hasColumn('screening_requirement_templates', 'items_json')) {
            $templates = DB::table('screening_requirement_templates')->whereNotNull('items_json')->get();

            foreach ($templates as $t) {
                $items = json_decode((string) $t->items_json, true) ?: [];
                foreach ($items as $item) {
                    $maxId++;
                    DB::table('screening_requirement_template_items')->insert([
                        'item_id'     => $maxId,
                        'template_id' => (int) ($item['template_id'] ?? $t->template_id),
                        'entity_type' => $item['entity_type'],
                        'value'       => $item['value'],
                        'required'    => ! empty($item['required']),
                        'created_at'  => $item['created_at'] ?? now(),
                    ]);
                }
            }
        }

        if ($maxId > 0) {
            DB::statement('ALTER TABLE screening_requirement_template_items AUTO_INCREMENT = ' . ($maxId + 1));
        }

        // 3. Drop items_json from templates
        if (Schema::hasTable('screening_requirement_templates') && Schema::hasColumn('screening_requirement_templates', 'items_json')) {
            Schema::table('screening_requirement_templates', function (Blueprint $table) {
                $table->dropColumn('items_json');
            });
        }

        // 4. Clean up the backup key
        if (Schema::hasTable('system_settings')) {
            DB::table('system_settings')
                ->where('setting_key', 'migration_backup.screening_requirement_template_items')
                ->delete();
        }
    }
};