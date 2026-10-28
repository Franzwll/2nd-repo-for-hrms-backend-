<?php

namespace Modules\EmployeeRecords\Providers;

use Nwidart\Modules\Support\ModuleServiceProvider;
use Illuminate\Console\Scheduling\Schedule;

class EmployeeRecordsServiceProvider extends ModuleServiceProvider
{
    /**
     * The name of the module.
     */
    protected string $name = 'EmployeeRecords';

    /**
     * The lowercase version of the module name.
     */
    protected string $nameLower = 'employeerecords';

    /**
     * Command classes to register.
     *
     * @var string[]
     */
    protected array $commands = [
        \Modules\EmployeeRecords\Console\NotifyExpiringDocuments::class,
        \Modules\EmployeeRecords\Console\BackfillEmployeeDocuments::class,
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
     */
    protected function configureSchedules(Schedule $schedule): void
    {
        $schedule->command('erm:notify-expiring-documents')->dailyAt('07:00');
    }
}
