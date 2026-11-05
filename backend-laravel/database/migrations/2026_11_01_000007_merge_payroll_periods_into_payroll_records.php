<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Inlines payroll_periods (period_code, period_name) into payroll_records,
     * drops the foreign key constraint, and drops the payroll_periods table.
     */
    public function up(): void
    {
        if (!Schema::hasTable('payroll_periods')) {
            return;
        }

        // 1. Add period_code and period_name columns to payroll_records if missing
        if (Schema::hasTable('payroll_records')) {
            Schema::table('payroll_records', function (Blueprint $table) {
                if (!Schema::hasColumn('payroll_records', 'period_code')) {
                    $table->string('period_code', 40)->nullable()->after('payroll_period_id');
                }
                if (!Schema::hasColumn('payroll_records', 'period_name')) {
                    $table->string('period_name', 120)->nullable()->after('period_code');
                }
            });

            // 2. Backup all rows of payroll_periods for rollback
            $periods = DB::table('payroll_periods')->orderBy('payroll_period_id')->get();
            $backupData = [];
            foreach ($periods as $p) {
                $backupData[] = [
                    'payroll_period_id' => $p->payroll_period_id,
                    'period_code'       => $p->period_code,
                    'period_name'       => $p->period_name,
                    'period_start'      => $p->period_start,
                    'period_end'        => $p->period_end,
                    'payout_date'       => $p->payout_date,
                    'status'            => $p->status,
                    'created_at'        => $p->created_at,
                    'updated_at'        => $p->updated_at,
                ];

                // Update payroll_records with period_code and period_name
                DB::table('payroll_records')
                    ->where('payroll_period_id', $p->payroll_period_id)
                    ->update([
                        'period_code' => $p->period_code,
                        'period_name' => $p->period_name,
                    ]);
            }

            if (Schema::hasTable('system_settings')) {
                DB::table('system_settings')->updateOrInsert(
                    ['setting_key' => 'migration_backup.payroll_periods'],
                    ['setting_value' => json_encode($backupData), 'updated_at' => now()]
                );
            }

            // 3. Drop foreign key constraint on payroll_records
            Schema::table('payroll_records', function (Blueprint $table) {
                $table->dropForeign('fk_payroll_records_payroll_period_id');
            });
        }

        // 4. Drop payroll_periods table
        Schema::dropIfExists('payroll_periods');
    }

    /**
     * Reverse the migrations.
     * Recreates payroll_periods table, restores rows, and re-adds the foreign key.
     */
    public function down(): void
    {
        // 1. Recreate payroll_periods table
        if (!Schema::hasTable('payroll_periods')) {
            Schema::create('payroll_periods', function (Blueprint $table) {
                $table->id('payroll_period_id');
                $table->string('period_code', 40)->unique();
                $table->string('period_name', 120);
                $table->date('period_start');
                $table->date('period_end');
                $table->date('payout_date')->nullable();
                $table->string('status', 20)->default('Open');
                $table->timestamp('created_at')->useCurrent();
                $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

                $table->index('status', 'idx_payroll_periods_status');
            });

            DB::statement("ALTER TABLE `payroll_periods` ADD CONSTRAINT `chk_payroll_periods_status` CHECK (`status` IN ('Open', 'Closed'))");
        }

        // 2. Restore data from system_settings
        if (Schema::hasTable('system_settings')) {
            $row = DB::table('system_settings')->where('setting_key', 'migration_backup.payroll_periods')->first();
            if ($row && !empty($row->setting_value)) {
                $backupData = json_decode($row->setting_value, true);
                if (is_array($backupData)) {
                    $maxId = 0;
                    foreach ($backupData as $p) {
                        DB::table('payroll_periods')->insert([
                            'payroll_period_id' => $p['payroll_period_id'],
                            'period_code'       => $p['period_code'],
                            'period_name'       => $p['period_name'],
                            'period_start'      => $p['period_start'],
                            'period_end'        => $p['period_end'],
                            'payout_date'       => $p['payout_date'],
                            'status'            => $p['status'],
                            'created_at'        => $p['created_at'],
                            'updated_at'        => $p['updated_at'],
                        ]);
                        if ($p['payroll_period_id'] > $maxId) {
                            $maxId = $p['payroll_period_id'];
                        }
                    }

                    if ($maxId > 0) {
                        $next = $maxId + 1;
                        DB::statement("ALTER TABLE payroll_periods AUTO_INCREMENT = {$next}");
                    }
                }
            }

            DB::table('system_settings')->where('setting_key', 'migration_backup.payroll_periods')->delete();
        }

        // 3. Re-add foreign key constraint to payroll_records
        if (Schema::hasTable('payroll_records') && Schema::hasTable('payroll_periods')) {
            Schema::table('payroll_records', function (Blueprint $table) {
                $table->foreign('payroll_period_id', 'fk_payroll_records_payroll_period_id')
                      ->references('payroll_period_id')->on('payroll_periods');
            });

            // 4. Drop added columns from payroll_records
            Schema::table('payroll_records', function (Blueprint $table) {
                if (Schema::hasColumn('payroll_records', 'period_code')) {
                    $table->dropColumn('period_code');
                }
                if (Schema::hasColumn('payroll_records', 'period_name')) {
                    $table->dropColumn('period_name');
                }
            });
        }
    }
};

