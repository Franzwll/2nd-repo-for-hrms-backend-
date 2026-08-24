<?php

namespace App\Providers;

use App\Models\Announcement;
use App\Models\ChatbotFaq;
use App\Models\Department;
use App\Models\Employee;
use App\Models\Hr3Recommendation;
use App\Models\Position;
use App\Models\SalaryGrade;
use App\Models\SystemRole;
use App\Models\SystemUser;
use App\Observers\ActivityObserver;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Employee::observe(ActivityObserver::class);
        Department::observe(ActivityObserver::class);
        Position::observe(ActivityObserver::class);
        SalaryGrade::observe(ActivityObserver::class);
        Hr3Recommendation::observe(ActivityObserver::class);
        SystemUser::observe(ActivityObserver::class);
        SystemRole::observe(ActivityObserver::class);
        Announcement::observe(ActivityObserver::class);
        ChatbotFaq::observe(ActivityObserver::class);
    }
}
