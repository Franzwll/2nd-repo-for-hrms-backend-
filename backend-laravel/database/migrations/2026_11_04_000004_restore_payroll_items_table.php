<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Decision record 3c: restore payroll_items from the live items_json
     * column. The backup snapshot only fills lines that live data lost.
     */
    public function up(): void
    {
        if (! Schema::hasTable('payroll_records')) {
            return;
        }

        if (! Schema::hasTable('payroll_items')) {
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

        $items = [];

        foreach (DB::table('payroll_records')->whereNotNull('items_json')->orderBy('payroll_record_id')->get() as $record) {
            $decoded = json_decode((string) $record->items_json, true);
            if (! is_array($decoded)) {
                continue;
            }

            foreach ($decoded as $item) {
                if (! is_array($item)) {
                    continue;
                }

                $id = (int) ($item['payroll_item_id'] ?? 0);
                $key = $id > 0 ? (string) $id : 'r' . $record->payroll_record_id . ':' . md5(json_encode($item));
                $items[$key] = [
                    'payroll_item_id' => $id > 0 ? $id : null,
                    'payroll_record_id' => (int) $record->payroll_record_id,
                    'item_type' => in_array($item['item_type'] ?? '', ['Earning', 'Deduction'], true)
                        ? $item['item_type']
                        : 'Earning',
                    'label' => (string) ($item['label'] ?? ''),
                    'amount' => (float) ($item['amount'] ?? 0),
                    'created_at' => $item['created_at'] ?? now(),
                ];
            }
        }

        foreach ($this->backupItems() as $row) {
            $key = (string) $row['payroll_item_id'];
            if (! isset($items[$key])) {
                $items[$key] = $row;
            }
        }

        foreach ($items as $item) {
            $values = [
                'payroll_record_id' => $item['payroll_record_id'],
                'item_type' => $item['item_type'],
                'label' => $item['label'],
                'amount' => $item['amount'],
                'created_at' => $item['created_at'],
            ];

            if (! empty($item['payroll_item_id'])) {
                DB::table('payroll_items')->updateOrInsert(
                    ['payroll_item_id' => $item['payroll_item_id']],
                    $values
                );
            } else {
                DB::table('payroll_items')->insert($values);
            }
        }

        $maxId = (int) DB::table('payroll_items')->max('payroll_item_id');
        if ($maxId > 0) {
            DB::statement('ALTER TABLE `payroll_items` AUTO_INCREMENT = ' . ($maxId + 1));
        }
    }

    public function down(): void
    {
        if (! Schema::hasTable('payroll_items')) {
            return;
        }

        if (Schema::hasTable('payroll_records')) {
            $byRecord = DB::table('payroll_items')->orderBy('payroll_item_id')->get()->groupBy('payroll_record_id');

            foreach ($byRecord as $recordId => $rows) {
                $json = $rows->map(fn ($row) => [
                    'payroll_item_id' => (int) $row->payroll_item_id,
                    'payroll_record_id' => (int) $row->payroll_record_id,
                    'item_type' => $row->item_type,
                    'label' => $row->label,
                    'amount' => (float) $row->amount,
                    'created_at' => $row->created_at,
                ])->values()->all();

                DB::table('payroll_records')
                    ->where('payroll_record_id', $recordId)
                    ->update(['items_json' => json_encode($json)]);
            }
        }

        Schema::dropIfExists('payroll_items');
    }

    /**
     * @return array<string, array<string, mixed>>
     */
    private function backupItems(): array
    {
        if (! Schema::hasTable('system_settings')) {
            return [];
        }

        $raw = DB::table('system_settings')
            ->where('setting_key', 'migration_backup.payroll_items')
            ->value('setting_value');
        $decoded = is_string($raw) ? json_decode($raw, true) : $raw;
        if (! is_array($decoded)) {
            return [];
        }

        $rows = [];
        foreach ($decoded as $row) {
            $id = (int) ($row['payroll_item_id'] ?? 0);
            if ($id > 0) {
                $rows[(string) $id] = [
                    'payroll_item_id' => $id,
                    'payroll_record_id' => (int) ($row['payroll_record_id'] ?? 0),
                    'item_type' => in_array($row['item_type'] ?? '', ['Earning', 'Deduction'], true)
                        ? $row['item_type']
                        : 'Earning',
                    'label' => (string) ($row['label'] ?? ''),
                    'amount' => (float) ($row['amount'] ?? 0),
                    'created_at' => $row['created_at'] ?? now(),
                ];
            }
        }

        return $rows;
    }
};
