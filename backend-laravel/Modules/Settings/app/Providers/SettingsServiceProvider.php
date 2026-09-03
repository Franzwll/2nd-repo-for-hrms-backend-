<?php

namespace Modules\Settings\Providers;

use Nwidart\Modules\Support\ModuleServiceProvider;
use Illuminate\Console\Scheduling\Schedule;

class SettingsServiceProvider extends ModuleServiceProvider
{
    /**
     * The name of the module.
     */
    protected string $name = 'Settings';

    /**
     * The lowercase version of the module name.
     */
    protected string $nameLower = 'settings';

    /**
     * Command classes to register.
     *
     * @var string[]
     */
    protected array $commands = [
        \Modules\Settings\Console\RunSettingsAutoBackup::class,
    ];

    /**
     * Provider classes to register.
     *
     * @var string[]
     */
    protected array $providers = [
        EventServiceProvider::class,
        RouteServiceProvider::class,
    ];

    /**
     * Define module schedules.
     *
     * The command itself reads system_settings.backup and only creates a dump
     * when the configured cadence (daily / weekly / monthly) is actually due.
     */
    protected function configureSchedules(Schedule $schedule): void
    {
        $schedule->command('settings:auto-backup')->everySixHours();
    }
}
