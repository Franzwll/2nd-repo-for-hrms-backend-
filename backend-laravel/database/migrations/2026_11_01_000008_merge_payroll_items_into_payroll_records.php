<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Inlines payroll_items into payroll_records.items_json,
     * drops the foreign key, and drops the payroll_items table.
     */
    public function up(): void
    {
        if (!Schema::hasTable('payroll_items')) {
            return;
        }

        // 1. Add items_json column to payroll_records if missing
        if (Schema::hasTable('payroll_records') && !Schema::hasColumn('payroll_records', 'items_json')) {
            Schema::table('payroll_records', function (Blueprint $table) {
                $table->longText('items_json')->nullable()->after('net_pay');
            });
        }

        // 2. Fetch all items and group by payroll_record_id
        $items = DB::table('payroll_items')->orderBy('payroll_item_id')->get();
        $allItems = [];
        $itemsByRecord = [];

        foreach ($items as $item) {
            $data = [
                'payroll_item_id'   => $item->payroll_item_id,
                'payroll_record_id' => $item->payroll_record_id,
                'item_type'         => $item->item_type,
                'label'             => $item->label,
                'amount'            => (float) $item->amount,
                'created_at'        => $item->created_at,
            ];
            $allItems[] = $data;
            $itemsByRecord[$item->payroll_record_id][] = $data;
        }

        // 3. Update each payroll_record with its inlined items
        foreach ($itemsByRecord as $recordId => $recordItems) {
            DB::table('payroll_records')
                ->where('payroll_record_id', $recordId)
                ->update(['items_json' => json_encode($recordItems)]);
        }

        // 4. Save rollback snapshot to system_settings
        if (Schema::hasTable('system_settings')) {
            DB::table('system_settings')->updateOrInsert(
                ['setting_key' => 'migration_backup.payroll_items'],
                ['setting_value' => json_encode($allItems), 'updated_at' => now()]
            );
        }

        // 5. Drop foreign key constraint and table
        Schema::table('payroll_items', function (Blueprint $table) {
            $table->dropForeign('fk_payroll_items_payroll_record_id');
        });
        Schema::dropIfExists('payroll_items');
    }

    /**
     * Reverse the migrations.
     * Recreates payroll_items table, restores rows, and drops items_json column.
     */
    public function down(): void
    {
        // 1. Recreate payroll_items table
        if (!Schema::hasTable('payroll_items')) {
            Schema::create('payroll_items', function (Blueprint $table) {
                $table->id('payroll_item_id');
                $table->unsignedBigInteger('payroll_record_id');
                $table->string('item_type', 30);
                $table->string('label', 120);
                $table->decimal('amount', 12, 2);
                $table->timestamp('created_at')->useCurrent();

                $table->index('payroll_record_id', 'idx_payroll_items_payroll_record_id');
                $table->foreign('payroll_record_id', 'fk_payroll_items_payroll_record_id')
                      ->references('payroll_record_id')->on('payroll_records')->onDelete('cascade');
            });

            DB::statement("ALTER TABLE `payroll_items` ADD CONSTRAINT `chk_payroll_items_item_type` CHECK (`item_type` IN ('Earning', 'Deduction'))");
        }

        // 2. Restore rows from system_settings or from payroll_records.items_json
        $backupItems = null;
        if (Schema::hasTable('system_settings')) {
            $row = DB::table('system_settings')->where('setting_key', 'migration_backup.payroll_items')->first();
            if ($row && !empty($row->setting_value)) {
                $backupItems = json_decode($row->setting_value, true);
            }
        }

        $maxId = 0;
        if (is_array($backupItems) && !empty($backupItems)) {
            foreach ($backupItems as $it) {
                DB::table('payroll_items')->insert([
                    'payroll_item_id'   => $it['payroll_item_id'],
                    'payroll_record_id' => $it['payroll_record_id'],
                    'item_type'         => $it['item_type'],
                    'label'             => $it['label'],
                    'amount'            => $it['amount'],
                    'created_at'        => $it['created_at'],
                ]);
                if ($it['payroll_item_id'] > $maxId) {
                    $maxId = $it['payroll_item_id'];
                }
            }
        } elseif (Schema::hasTable('payroll_records')) {
            // Fallback: restore from payroll_records.items_json
            $records = DB::table('payroll_records')->whereNotNull('items_json')->get();
            foreach ($records as $r) {
                $recordItems = json_decode($r->items_json, true);
                if (is_array($recordItems)) {
                    foreach ($recordItems as $it) {
                        $insertData = [
                            'payroll_record_id' => $r->payroll_record_id,
                            'item_type'         => $it['item_type'] ?? 'Earning',
                            'label'             => $it['label'] ?? '',
                            'amount'            => $it['amount'] ?? 0,
                            'created_at'        => $it['created_at'] ?? now(),
                        ];
                        if (!empty($it['payroll_item_id'])) {
                            $insertData['payroll_item_id'] = $it['payroll_item_id'];
                            if ($it['payroll_item_id'] > $maxId) {
                                $maxId = $it['payroll_item_id'];
                            }
                        }
                        DB::table('payroll_items')->insert($insertData);
                    }
                }
            }
        }

        if ($maxId > 0) {
            $next = $maxId + 1;
            DB::statement("ALTER TABLE payroll_items AUTO_INCREMENT = {$next}");
        }

        // 3. Drop items_json from payroll_records
        if (Schema::hasTable('payroll_records') && Schema::hasColumn('payroll_records', 'items_json')) {
            Schema::table('payroll_records', function (Blueprint $table) {
                $table->dropColumn('items_json');
            });
        }

        // 4. Delete backup key from system_settings
        if (Schema::hasTable('system_settings')) {
            DB::table('system_settings')->where('setting_key', 'migration_backup.payroll_items')->delete();
        }
    }
};

