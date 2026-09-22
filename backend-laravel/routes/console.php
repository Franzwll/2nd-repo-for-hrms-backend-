<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// NOTE: automatic DB backups run via settings:auto-backup (every 6h, honors
// the Settings toggle + daily/weekly/monthly cadence). Host must run
// `schedule:run` every minute (cron, or Windows Task Scheduler on XAMPP).
