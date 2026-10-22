<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\EssCategory;
use App\Models\EssRequest;
use App\Models\EssRequestAttachment;
use App\Models\EssRequestStatusHistory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;

/**
 * Seeds the ESS <-> ERM document-request demo loop with one request routed to
 * Employee Records (For Dispatch — ESS Management already accepted it) and one
 * released request with the fulfilled file attached (so the employee side shows
 * a working download).
 *
 * Run: php artisan db:seed --class=EssDocumentLoopDemoSeeder
 */
class EssDocumentLoopDemoSeeder extends Seeder
{
    public function run(): void
    {
        $employee = Employee::where('employee_code', 'EMP-0005')->first()
            ?? Employee::orderBy('employee_id')->first();

        if (! $employee) {
            $this->command?->warn('No employees found — skipping ESS document loop demo seed.');

            return;
        }

        $category = EssCategory::whereIn('code', ['ESS-HRDOC', 'hr_document'])
            ->orWhere('name', 'LIKE', '%Document%')
            ->first();

        $this->seedRequest(
            employeeId: $employee->employee_id,
            categoryId: $category?->ess_category_id,
            code: 'REQ-DEMO-COE',
            type: 'Certificate of Employment',
            details: 'COE needed for a bank loan application (demo).',
            fulfil: false,
        );

        $path = 'ess-request-fulfillments/demo-coe.pdf';
        Storage::disk('public')->put($path, "Demo Certificate of Employment\n");

        $this->seedRequest(
            employeeId: $employee->employee_id,
            categoryId: $category?->ess_category_id,
            code: 'REQ-DEMO-SR',
            type: 'Service Record',
            details: 'Service record for visa processing (demo).',
            fulfil: true,
            fulfilmentPath: $path,
            fulfilmentName: 'service-record.pdf',
        );

        $this->command?->info('ESS document loop demo data seeded.');
    }

    private function seedRequest(
        int $employeeId,
        ?int $categoryId,
        string $code,
        string $type,
        string $details,
        bool $fulfil,
        ?string $fulfilmentPath = null,
        ?string $fulfilmentName = null,
    ): void {
        $request = EssRequest::firstOrCreate(
            ['request_code' => $code],
            [
                'employee_id' => $employeeId,
                'category_id' => $categoryId,
                'request_type' => $type,
                'filed_at' => now()->subDays(2),
                'status' => $fulfil ? 'Completed' : 'For Dispatch',
                'routed_module' => 'erm',
                'routed_at' => now()->subDays(2)->addHour(),
                'module_responded_at' => $fulfil ? now()->subDays(1) : null,
                'released_at' => $fulfil ? now()->subDay() : null,
                'completed_at' => $fulfil ? now()->subDay() : null,
                'details' => $details,
            ]
        );

        if (! $request->wasRecentlyCreated) {
            return;
        }

        EssRequestStatusHistory::create([
            'ess_request_id' => $request->ess_request_id,
            'status' => 'Pending',
            'note' => 'Request filed by employee.',
        ]);

        EssRequestStatusHistory::create([
            'ess_request_id' => $request->ess_request_id,
            'status' => 'For Dispatch',
            'note' => 'Approved by ESS Management and routed to Employee Records.',
        ]);

        if (! $fulfil || ! $fulfilmentPath) {
            return;
        }

        EssRequestAttachment::create([
            'ess_request_id' => $request->ess_request_id,
            'direction' => 'hr',
            'source_module' => 'erm',
            'file_path' => $fulfilmentPath,
            'original_name' => $fulfilmentName ?: basename($fulfilmentPath),
            'mime_type' => 'application/pdf',
            'file_size_bytes' => Storage::disk('public')->size($fulfilmentPath),
        ]);

        foreach ([
            ['status' => 'With Module', 'note' => 'Employee Records accepted the request.'],
            ['status' => 'For Release', 'note' => 'Employee Records sent the document back for release.'],
            ['status' => 'Completed', 'note' => 'Released to the employee by ESS Management.'],
        ] as $step) {
            EssRequestStatusHistory::create([
                'ess_request_id' => $request->ess_request_id,
                'status' => $step['status'],
                'note' => $step['note'],
            ]);
        }
    }
}
