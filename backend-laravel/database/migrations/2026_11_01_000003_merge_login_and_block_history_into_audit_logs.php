<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * DB consolidation – Phase 2c.
     *
     * `user_login_activity` and `applicant_block_history` are both append-only
     * activity trails, so they now live in `audit_logs`:
     *
     *   - sign-ins   → module_name = 'Auth', action = 'Login'
     *   - block logs → module_name = 'Applicant Management',
     *                  target_type = 'applicant',
     *                  action = 'blocked' | 'unblocked'
     *
     * The existing AuditLogger rows keep their capitalised actions
     * ('Applicant Blocked') and target type ('Applicant'), so the two trails
     * never mix.
     */
    private const LOGIN_MODULE = 'Auth';

    private const LOGIN_ACTION = 'Login';

    private const BLOCK_MODULE = 'Applicant Management';

    private const BLOCK_TARGET = 'applicant';

    /** @var string[] */
    private const BLOCK_ACTIONS = ['blocked', 'unblocked'];

    public function up(): void
    {
        if (! Schema::hasTable('audit_logs')) {
            return;
        }

        $this->addAuditColumns();

        $beforeLogin = $this->loginRows()->count();
        $expectedLogin = 0;

        if (Schema::hasTable('user_login_activity')) {
            $expectedLogin = DB::table('user_login_activity')->count();

            DB::table('user_login_activity')->chunkById(500, function ($rows) {
                $insert = [];

                foreach ($rows as $row) {
                    $insert[] = [
                        'system_user_id' => $row->system_user_id,
                        'actor_role' => null,
                        'actor_department' => null,
                        'occurred_at' => $row->login_at ?? now(),
                        'action' => self::LOGIN_ACTION,
                        'module_name' => self::LOGIN_MODULE,
                        'target_type' => 'user',
                        'target_id' => (string) $row->system_user_id,
                        'details' => null,
                        'severity' => 'Info',
                        'ip_address' => $row->ip_address,
                        'device_info' => $row->device_info,
                        'url' => null,
                        'user_agent' => $row->user_agent,
                        'status' => $row->status ?? 'success',
                        'extra_json' => null,
                    ];
                }

                if ($insert !== []) {
                    DB::table('audit_logs')->insert($insert);
                }
            }, 'login_activity_id');
        }

        $copiedLogin = $this->loginRows()->count() - $beforeLogin;

        if ($copiedLogin !== $expectedLogin) {
            throw new RuntimeException(
                "Phase 2c copy failed: expected {$expectedLogin} login rows, copied {$copiedLogin}. user_login_activity was not dropped."
            );
        }

        $beforeBlock = $this->blockRows()->count();
        $expectedBlock = 0;

        if (Schema::hasTable('applicant_block_history')) {
            $expectedBlock = DB::table('applicant_block_history')->count();

            DB::table('applicant_block_history')->chunkById(500, function ($rows) {
                $insert = [];

                foreach ($rows as $row) {
                    $insert[] = [
                        'system_user_id' => null,
                        'actor_role' => null,
                        'actor_department' => null,
                        'occurred_at' => $row->performed_at ?? now(),
                        'action' => $row->action,
                        'module_name' => self::BLOCK_MODULE,
                        'target_type' => self::BLOCK_TARGET,
                        'target_id' => (string) $row->applicant_id,
                        'details' => $row->reason,
                        'severity' => $row->action === 'blocked' ? 'Warning' : 'Info',
                        'ip_address' => null,
                        'device_info' => null,
                        'url' => null,
                        'user_agent' => null,
                        'status' => null,
                        'extra_json' => json_encode([
                            'performed_by' => $row->performed_by,
                            'scope' => $row->scope,
                        ]),
                    ];
                }

                if ($insert !== []) {
                    DB::table('audit_logs')->insert($insert);
                }
            }, 'block_history_id');
        }

        $copiedBlock = $this->blockRows()->count() - $beforeBlock;

        if ($copiedBlock !== $expectedBlock) {
            throw new RuntimeException(
                "Phase 2c copy failed: expected {$expectedBlock} block-history rows, copied {$copiedBlock}. applicant_block_history was not dropped."
            );
        }

        Schema::dropIfExists('applicant_block_history');
        Schema::dropIfExists('user_login_activity');
    }

    /**
     * Restores both old tables, copies the merged rows back, removes them from
     * audit_logs and drops the columns added in up().
     */
    public function down(): void
    {
        if (! Schema::hasTable('audit_logs')) {
            return;
        }

        if (! Schema::hasTable('user_login_activity')) {
            Schema::create('user_login_activity', function (Blueprint $table) {
                $table->id('login_activity_id');
                $table->unsignedBigInteger('system_user_id');
                $table->timestamp('login_at')->useCurrent();
                $table->string('ip_address', 45)->nullable();
                $table->string('device_info', 255)->nullable();
                $table->text('user_agent')->nullable();
                $table->string('status', 20)->default('success');

                $table->index('system_user_id', 'idx_user_login_activity_system_user_id');
                $table->index('login_at', 'idx_user_login_activity_login_at');
                $table->index('status', 'idx_user_login_activity_status');

                $table->foreign('system_user_id', 'fk_user_login_activity_system_user_id')
                    ->references('system_user_id')->on('system_users')
                    ->onDelete('cascade');
            });
        }

        if (! Schema::hasTable('applicant_block_history')) {
            Schema::create('applicant_block_history', function (Blueprint $table) {
                $table->id('block_history_id');
                $table->unsignedBigInteger('applicant_id');
                $table->string('action', 20);
                $table->string('performed_by', 160);
                $table->text('reason');
                $table->string('scope', 100)->nullable();
                $table->timestamp('performed_at')->useCurrent();

                $table->index('applicant_id', 'idx_applicant_block_history_applicant_id');
                $table->foreign('applicant_id', 'fk_applicant_block_history_applicant_id')
                    ->references('applicant_id')->on('applicants')
                    ->onDelete('cascade');
            });
        }

        $loginQuery = $this->loginRows()->whereNotNull('system_user_id');
        $mergedLogin = $loginQuery->count();
        $beforeLogin = DB::table('user_login_activity')->count();

        $loginQuery->chunkById(500, function ($rows) {
            $insert = [];

            foreach ($rows as $row) {
                $insert[] = [
                    'system_user_id' => $row->system_user_id,
                    'login_at' => $row->occurred_at ?? now(),
                    'ip_address' => $row->ip_address,
                    'device_info' => $row->device_info,
                    'user_agent' => $row->user_agent,
                    'status' => $row->status ?? 'success',
                ];
            }

            if ($insert !== []) {
                DB::table('user_login_activity')->insert($insert);
            }
        }, 'audit_log_id');

        $restoredLogin = DB::table('user_login_activity')->count() - $beforeLogin;

        if ($restoredLogin !== $mergedLogin) {
            throw new RuntimeException(
                "Phase 2c rollback failed: expected {$mergedLogin} login rows, restored {$restoredLogin}. Merged rows were kept."
            );
        }

        $blockQuery = $this->blockRows()
            ->whereIn('target_id', DB::table('applicants')->select('applicant_id'));
        $mergedBlock = $blockQuery->count();
        $beforeBlock = DB::table('applicant_block_history')->count();

        $blockQuery->chunkById(500, function ($rows) {
            $insert = [];

            foreach ($rows as $row) {
                $extra = json_decode((string) $row->extra_json, true);
                $extra = is_array($extra) ? $extra : [];

                $insert[] = [
                    'applicant_id' => (int) $row->target_id,
                    'action' => $row->action,
                    'performed_by' => $extra['performed_by'] ?? 'System',
                    'reason' => $row->details ?? '',
                    'scope' => $extra['scope'] ?? null,
                    'performed_at' => $row->occurred_at ?? now(),
                ];
            }

            if ($insert !== []) {
                DB::table('applicant_block_history')->insert($insert);
            }
        }, 'audit_log_id');

        $restoredBlock = DB::table('applicant_block_history')->count() - $beforeBlock;

        if ($restoredBlock !== $mergedBlock) {
            throw new RuntimeException(
                "Phase 2c rollback failed: expected {$mergedBlock} block-history rows, restored {$restoredBlock}. Merged rows were kept."
            );
        }

        $this->loginRows()->delete();
        $this->blockRows()->delete();

        foreach (['extra_json', 'status', 'user_agent'] as $column) {
            if (Schema::hasColumn('audit_logs', $column)) {
                Schema::table('audit_logs', function (Blueprint $table) use ($column) {
                    $table->dropColumn($column);
                });
            }
        }
    }

    private function addAuditColumns(): void
    {
        if (! Schema::hasColumn('audit_logs', 'user_agent')) {
            Schema::table('audit_logs', function (Blueprint $table) {
                $table->text('user_agent')->nullable()->after('device_info');
            });
        }

        if (! Schema::hasColumn('audit_logs', 'status')) {
            Schema::table('audit_logs', function (Blueprint $table) {
                $table->string('status', 20)->nullable()->after('user_agent');
            });
        }

        if (! Schema::hasColumn('audit_logs', 'extra_json')) {
            Schema::table('audit_logs', function (Blueprint $table) {
                $table->json('extra_json')->nullable()->after('status');
            });
        }
    }

    private function loginRows()
    {
        return DB::table('audit_logs')
            ->where('module_name', self::LOGIN_MODULE)
            ->where('action', self::LOGIN_ACTION);
    }

    private function blockRows()
    {
        return DB::table('audit_logs')
            ->where('module_name', self::BLOCK_MODULE)
            ->where('target_type', self::BLOCK_TARGET)
            ->whereIn('action', self::BLOCK_ACTIONS);
    }
};
