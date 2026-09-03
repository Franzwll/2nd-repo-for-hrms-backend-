<?php

namespace Modules\Settings\Console;

use Carbon\Carbon;
use Illuminate\Console\Command;
use Modules\Settings\Models\SystemSetting;
use Modules\Settings\Services\BackupService;

class RunSettingsAutoBackup extends Command
{
    protected $signature = 'settings:auto-backup';

    protected $description = 'Create a database backup when the automatic backup schedule (system_settings.backup) is due';

    /** Minimum hours between automatic backups, per configured schedule. */
    private const INTERVAL_HOURS = [
        'daily'   => 24,
        'weekly'  => 168,
        'monthly' => 720,
    ];

    public function handle(): int
    {
        $config = SystemSetting::getValue('backup', []);

        if (! is_array($config) || ! ($config['enabled'] ?? false)) {
            $this->info('Automatic backups are disabled (system_settings.backup.enabled).');

            return self::SUCCESS;
        }

        $schedule = strtolower((string) ($config['schedule'] ?? 'daily'));
        $interval = self::INTERVAL_HOURS[$schedule] ?? 24;

        $lastAuto = collect(BackupService::entries())
            ->firstWhere('type', 'Automatic');

        if ($lastAuto) {
            $lastAt = Carbon::parse($lastAuto['timestamp']);
            $hoursAgo = $lastAt->diffInHours(now());

            if ($hoursAgo < $interval) {
                $this->info("Next {$schedule} backup not due yet (last run {$hoursAgo}h ago: {$lastAuto['id']}).");

                return self::SUCCESS;
            }
        }

        try {
            $entry = BackupService::create('Automatic');
        } catch (\Throwable $e) {
            $this->error('Automatic backup failed: ' . $e->getMessage());

            return self::FAILURE;
        }

        $this->info("Automatic {$schedule} backup created: {$entry['id']} ({$entry['size']}).");

        return self::SUCCESS;
    }
}
