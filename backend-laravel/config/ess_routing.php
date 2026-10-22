<?php

use Modules\EmployeeSelfService\Adapters\AttendanceModuleAdapter;
use Modules\EmployeeSelfService\Adapters\ErmModuleAdapter;
use Modules\EmployeeSelfService\Adapters\PayrollModuleAdapter;
use Modules\EmployeeSelfService\Adapters\PerformanceModuleAdapter;

/**
 * ESS module-routing registry.
 *
 * The pipeline is: Employee -> ESS Management (gate) -> module -> ESS
 * Management (release) -> Employee. A module is anything that can own a
 * request after the gate: Employee Records, Attendance, Payroll, Performance.
 */
return [
    // Kill switch. When false the gate no longer dispatches to modules and the
    // request stops at For Release for manual ESS Management handling.
    'enabled' => env('ESS_MODULE_ROUTING_ENABLED', true),

    /*
     * Category code -> module key. `ess_categories.default_module` wins when
     * set, so administrators can override this map per category.
     */
    'categories' => [
        'hr_document' => 'erm',
        'ess-hrdoc' => 'erm',
        'leave' => 'attendance',
        'schedule' => 'attendance',
        'attendance' => 'attendance',
        'payroll' => 'payroll',
        'benefits' => 'payroll',
        'career' => 'performance',
        'promotion' => 'performance',
    ],

    /*
     * Legacy/imported rows may not carry a category. Fall back to these
     * keywords on request_type before giving up and leaving the request with
     * ESS Management.
     */
    'keywords' => [
        'erm' => ['document', 'certificate', 'coe', 'service record', 'employment', 'clearance'],
        'attendance' => ['leave', 'shift', 'schedule', 'attendance', 'undertime', 'overtime'],
        'payroll' => ['payslip', 'payroll', 'salary', 'tax', 'benefit', 'loan', 'allowance'],
        'performance' => ['promotion', 'performance', 'reclassification', 'career', 'transfer'],
    ],

    'modules' => [
        'erm' => [
            'label' => 'Employee Records',
            'permission' => 'Employee Records',
            'adapter' => ErmModuleAdapter::class,
        ],
        'attendance' => [
            'label' => 'Attendance',
            // The dedicated Workforce module does not exist yet, so ESS
            // Management staff act as the interim queue owner.
            'permission' => 'ESS Management',
            'adapter' => AttendanceModuleAdapter::class,
        ],
        'payroll' => [
            'label' => 'Payroll',
            'permission' => 'ESS Management',
            'adapter' => PayrollModuleAdapter::class,
        ],
        'performance' => [
            'label' => 'Performance',
            'permission' => 'ESS Management',
            'adapter' => PerformanceModuleAdapter::class,
        ],
    ],
];
