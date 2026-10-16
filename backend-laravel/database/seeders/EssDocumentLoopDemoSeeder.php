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
 * Seeds the ESS <-> ERM document-request demo loop with one Pending request
 * (waiting in the Employee Records inbox) and one Completed request with the
 * fulfilled file attached (so the employee side shows a working download).
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
                'status' => $fulfil ? 'Completed' : 'Pending',
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

        if (! $fulfil || ! $fulfilmentPath) {
            return;
        }

        EssRequestAttachment::create([
            'ess_request_id' => $request->ess_request_id,
            'direction' => 'hr',
            'file_path' => $fulfilmentPath,
            'original_name' => $fulfilmentName ?: basename($fulfilmentPath),
            'mime_type' => 'application/pdf',
            'file_size_bytes' => Storage::disk('public')->size($fulfilmentPath),
        ]);

        EssRequestStatusHistory::create([
            'ess_request_id' => $request->ess_request_id,
            'status' => 'Completed',
            'note' => 'Document fulfilled and sent to employee.',
        ]);
    }
}
