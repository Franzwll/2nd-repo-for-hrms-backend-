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
     * Inlines onboarding_checklist_items into onboarding_checklist_templates.items_json
     * (items ordered by template_item_id), then drops the child table. The FK from
     * employee_onboarding_items.template_item_id is dropped too, but the column is kept
     * as a plain integer so every applied row still references its template item's stable
     * key (the same template_item_id stored inside the JSON).
     */
    public function up(): void
    {
        if (! Schema::hasTable('onboarding_checklist_items')) {
            return;
        }

        // 1. Add items_json column to templates if missing
        if (Schema::hasTable('onboarding_checklist_templates') && ! Schema::hasColumn('onboarding_checklist_templates', 'items_json')) {
            Schema::table('onboarding_checklist_templates', function (Blueprint $table) {
                $table->longText('items_json')->nullable()->after('status');
            });
        }

        // 2. Snapshot original rows for rollback
        $items = DB::table('onboarding_checklist_items')->orderBy('template_item_id')->get();

        if (Schema::hasTable('system_settings')) {
            DB::table('system_settings')->updateOrInsert(
                ['setting_key' => 'migration_backup.onboarding_checklist_items'],
                ['setting_value' => json_encode($items->map(fn ($r) => (array) $r)->all()), 'updated_at' => now()]
            );
        }

        // 3. Group by template_id and inline as JSON
        $byTemplate = [];
        foreach ($items as $item) {
            $byTemplate[$item->template_id][] = [
                'template_item_id'    => (int) $item->template_item_id,
                'template_id'         => (int) $item->template_id,
                'item_text'           => $item->item_text,
                'instructions'        => $item->instructions,
                'requires_upload'     => (bool) $item->requires_upload,
                'upload_placeholder'  => $item->upload_placeholder,
                'sort_order'          => (int) $item->sort_order,
                'created_at'          => (string) $item->created_at,
            ];
        }

        foreach ($byTemplate as $templateId => $templateItems) {
            DB::table('onboarding_checklist_templates')
                ->where('template_id', $templateId)
                ->update(['items_json' => json_encode($templateItems)]);
        }

        // 4. Drop the FK from employee_onboarding_items (keeps template_item_id as a
        //    plain stable key), then drop the child table
        if (Schema::hasTable('employee_onboarding_items')) {
            Schema::table('employee_onboarding_items', function (Blueprint $table) {
                $table->dropForeign('fk_employee_onboarding_items_template_item_id');
            });
        }
        Schema::dropIfExists('onboarding_checklist_items');
    }

    /**
     * Reverse the migrations.
     *
     * Recreates onboarding_checklist_items (structure + index + FK), restores every
     * original row from the backup, then inserts any template items that were created
     * after the merge (from templates' items_json) so re-adding the employee FK never
     * fails on a dangling id. Finally drops items_json from templates.
     */
    public function down(): void
    {
        // 1. Recreate onboarding_checklist_items
        if (! Schema::hasTable('onboarding_checklist_items')) {
            Schema::create('onboarding_checklist_items', function (Blueprint $table) {
                $table->id('template_item_id');
                $table->unsignedBigInteger('template_id');
                $table->text('item_text');
                $table->text('instructions')->nullable();
                $table->boolean('requires_upload')->default(0);
                $table->string('upload_placeholder', 255)->nullable();
                $table->integer('sort_order');
                $table->timestamp('created_at')->useCurrent();

                $table->index('template_id', 'idx_onboarding_checklist_items_template_id');

                $table->foreign('template_id', 'fk_onboarding_checklist_items_template_id')
                      ->references('template_id')->on('onboarding_checklist_templates')
                      ->onDelete('cascade');
            });
        }

        // 2. Restore rows from system_settings backup
        $backupRows = null;
        if (Schema::hasTable('system_settings')) {
            $row = DB::table('system_settings')
                ->where('setting_key', 'migration_backup.onboarding_checklist_items')
                ->first();
            if ($row && ! empty($row->setting_value)) {
                $backupRows = json_decode($row->setting_value, true);
            }
        }

        $maxId = 0;
        $restoredIds = [];

        if (is_array($backupRows) && ! empty($backupRows)) {
            foreach ($backupRows as $r) {
                DB::table('onboarding_checklist_items')->insert([
                    'template_item_id'    => $r['template_item_id'],
                    'template_id'         => $r['template_id'],
                    'item_text'           => $r['item_text'],
                    'instructions'        => $r['instructions'] ?? null,
                    'requires_upload'     => (int) $r['requires_upload'],
                    'upload_placeholder'  => $r['upload_placeholder'] ?? null,
                    'sort_order'          => (int) $r['sort_order'],
                    'created_at'          => $r['created_at'] ?? now(),
                ]);
                $restoredIds[(int) $r['template_item_id']] = true;
                $maxId = max($maxId, (int) $r['template_item_id']);
            }
        }

        // 3. Insert any template items created after the merge (from items_json) so
        //    re-adding the employee FK never fails on a dangling template_item_id.
        if (Schema::hasTable('onboarding_checklist_templates') && Schema::hasColumn('onboarding_checklist_templates', 'items_json')) {
            $templates = DB::table('onboarding_checklist_templates')->whereNotNull('items_json')->get();

            foreach ($templates as $t) {
                $templateItems = json_decode((string) $t->items_json, true) ?: [];
                foreach ($templateItems as $ti) {
                    $itemId = (int) ($ti['template_item_id'] ?? 0);
                    if ($itemId > 0 && isset($restoredIds[$itemId])) {
                        continue;
                    }
                    $maxId++;
                    $itemId = $itemId > 0 ? $itemId : $maxId;
                    DB::table('onboarding_checklist_items')->insert([
                        'template_item_id'    => $itemId,
                        'template_id'         => (int) ($ti['template_id'] ?? $t->template_id),
                        'item_text'           => $ti['item_text'] ?? '',
                        'instructions'        => $ti['instructions'] ?? null,
                        'requires_upload'     => ! empty($ti['requires_upload']),
                        'upload_placeholder'  => $ti['upload_placeholder'] ?? null,
                        'sort_order'          => (int) ($ti['sort_order'] ?? 0),
                        'created_at'          => $ti['created_at'] ?? now(),
                    ]);
                    $maxId = max($maxId, $itemId);
                }
            }
        }

        if ($maxId > 0) {
            DB::statement('ALTER TABLE onboarding_checklist_items AUTO_INCREMENT = ' . ($maxId + 1));
        }

        // 4. Re-add the employee_onboarding_items FK (ON DELETE SET NULL)
        if (Schema::hasTable('employee_onboarding_items')) {
            $fks = collect(DB::select('SHOW CREATE TABLE employee_onboarding_items'))
                ->first()?->{'Create Table'} ?? '';
            if (! str_contains($fks, 'fk_employee_onboarding_items_template_item_id')) {
                DB::statement(
                    'ALTER TABLE `employee_onboarding_items`
                     ADD CONSTRAINT `fk_employee_onboarding_items_template_item_id`
                     FOREIGN KEY (`template_item_id`) REFERENCES `onboarding_checklist_items` (`template_item_id`)
                     ON DELETE SET NULL'
                );
            }
        }

        // 5. Drop items_json from templates
        if (Schema::hasTable('onboarding_checklist_templates') && Schema::hasColumn('onboarding_checklist_templates', 'items_json')) {
            Schema::table('onboarding_checklist_templates', function (Blueprint $table) {
                $table->dropColumn('items_json');
            });
        }

        // 6. Clean up the backup key
        if (Schema::hasTable('system_settings')) {
            DB::table('system_settings')
                ->where('setting_key', 'migration_backup.onboarding_checklist_items')
                ->delete();
        }
    }
};