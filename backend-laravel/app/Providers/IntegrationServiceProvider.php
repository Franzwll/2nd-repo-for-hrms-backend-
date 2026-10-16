<?php

namespace App\Providers;

use App\Services\Integration\Contracts\AttendanceProvider;
use App\Services\Integration\Contracts\DocumentArchiveProvider;
use App\Services\Integration\Contracts\LearningProvider;
use App\Services\Integration\Contracts\PayrollProvider;
use App\Services\Integration\Mocks\MockAttendanceProvider;
use App\Services\Integration\Mocks\MockDocumentArchiveProvider;
use App\Services\Integration\Mocks\MockLearningProvider;
use App\Services\Integration\Mocks\MockPayrollProvider;
use Illuminate\Support\ServiceProvider;

/**
 * Binds the cross-team integration seams to local mocks.
 *
 * Each contract maps to a Cluster 4 team that owns the source data:
 *   AttendanceProvider      -> Team 2 (Workforce Management)
 *   LearningProvider        -> Team 3 (Performance & Development)
 *   PayrollProvider         -> Team 4 (Payroll & Benefits)
 *   DocumentArchiveProvider -> Team 8 (Document Management / Archiving)
 *
 * To go live, swap the mock binding for an HTTP-backed client — no consumer
 * (ESS, Employee Records) changes required.
 */
class IntegrationServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(AttendanceProvider::class, MockAttendanceProvider::class);
        $this->app->bind(LearningProvider::class, MockLearningProvider::class);
        $this->app->bind(PayrollProvider::class, MockPayrollProvider::class);
        $this->app->bind(DocumentArchiveProvider::class, MockDocumentArchiveProvider::class);
    }
}
