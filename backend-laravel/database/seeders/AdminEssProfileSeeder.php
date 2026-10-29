<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AdminEssProfileSeeder extends Seeder
{
    public function run(): void
    {
        $user = DB::table('system_users')->where('system_user_id', 1)->first();
        if (!$user) {
            return;
        }

        $emp = DB::table('employees')->where('email', $user->email)->first();

        if (!$emp) {
            $nextCodeNumber = (DB::table('employees')->max('employee_id') ?? 0) + 1;
            $code = 'EMP-' . str_pad((string) $nextCodeNumber, 4, '0', STR_PAD_LEFT);

            $empId = DB::table('employees')->insertGetId([
                'employee_code'   => $code,
                'first_name'      => 'Bullseur',
                'middle_name'     => 'M.',
                'last_name'       => 'Santiago',
                'email'           => $user->email,
                'personal_email'  => 'bullseur.santiago@gmail.com',
                'phone'           => '0917 555 1234',
                'address'         => 'Ayala Avenue, Makati City',
                'birth_date'      => '1988-11-20',
                'gender'          => 'Male',
                'civil_status'    => 'Married',
                'nationality'     => 'Filipino',
                'sss_number'      => '34-9876543-2',
                'philhealth_number'=> '12-987654321-0',
                'pagibig_number'  => '1234-9876-5432',
                'tin_number'      => '987-654-321',
                'position_id'     => 14, // HR & Administration Manager
                'department_id'   => 5,  // Administration / HR
                'employment_type' => 'Regular',
                'date_hired'      => '2022-03-01',
                'supervisor_employee_id' => null,
                'status'          => 'Active',
                'onboarding_complete' => 1,
                'salary_grade_id' => 7, // SG-18
                'salary_step'     => 'Step 3',
                'created_at'      => Carbon::now(),
                'updated_at'      => Carbon::now(),
            ]);
        } else {
            $empId = $emp->employee_id;
            DB::table('employees')->where('employee_id', $empId)->update([
                'position_id'     => 14,
                'department_id'   => 5,
                'salary_grade_id' => 7,
                'status'          => 'Active',
                'onboarding_complete' => 1,
                'salary_step'     => 'Step 3',
                'updated_at'      => Carbon::now(),
            ]);
        }

        DB::table('system_users')->where('system_user_id', 1)->update([
            'employee_id' => $empId,
            'updated_at' => Carbon::now(),
        ]);

        // Work Schedules
        DB::table('work_schedules')->where('employee_id', $empId)->delete();
        $days = [
            ['dow' => 1, 'name' => 'Executive Day Shift', 'start' => '08:00:00', 'end' => '17:00:00', 'loc' => 'HR Executive Office', 'rest' => 0],
            ['dow' => 2, 'name' => 'Executive Day Shift', 'start' => '08:00:00', 'end' => '17:00:00', 'loc' => 'HR Executive Office', 'rest' => 0],
            ['dow' => 3, 'name' => 'Executive Day Shift', 'start' => '08:00:00', 'end' => '17:00:00', 'loc' => 'HR Executive Office', 'rest' => 0],
            ['dow' => 4, 'name' => 'Executive Day Shift', 'start' => '08:00:00', 'end' => '17:00:00', 'loc' => 'HR Executive Office', 'rest' => 0],
            ['dow' => 5, 'name' => 'Executive Day Shift', 'start' => '08:00:00', 'end' => '17:00:00', 'loc' => 'HR Executive Office', 'rest' => 0],
            ['dow' => 6, 'name' => null, 'start' => null, 'end' => null, 'loc' => null, 'rest' => 1],
            ['dow' => 0, 'name' => null, 'start' => null, 'end' => null, 'loc' => null, 'rest' => 1],
        ];
        foreach ($days as $d) {
            DB::table('work_schedules')->insert([
                'employee_id'    => $empId,
                'day_of_week'    => $d['dow'],
                'shift_name'     => $d['name'],
                'start_time'     => $d['start'],
                'end_time'       => $d['end'],
                'location'       => $d['loc'],
                'is_rest_day'    => $d['rest'],
                'effective_from' => '2026-01-01',
                'created_at'     => Carbon::now(),
                'updated_at'     => Carbon::now(),
            ]);
        }

        // Leave Balances
        DB::table('leave_balances')->where('employee_id', $empId)->delete();
        $year = Carbon::now()->year;
        foreach ([
            ['leave_type' => 'Vacation Leave', 'total' => 15, 'used' => 3],
            ['leave_type' => 'Sick Leave', 'total' => 15, 'used' => 1],
            ['leave_type' => 'Emergency Leave', 'total' => 5, 'used' => 0],
            ['leave_type' => 'Birthday Leave', 'total' => 1, 'used' => 0],
        ] as $le) {
            DB::table('leave_balances')->insert([
                'employee_id' => $empId,
                'leave_type'  => $le['leave_type'],
                'period_year' => $year,
                'total_days'  => $le['total'],
                'used_days'   => $le['used'],
                'created_at'  => Carbon::now(),
                'updated_at'  => Carbon::now(),
            ]);
        }

        // Attendance Records
        DB::table('attendance_records')->where('employee_id', $empId)->delete();
        foreach ([
            ['date' => '2026-10-24', 'in' => '2026-10-24 07:55:00', 'out' => '2026-10-24 17:05:00', 'bin' => '2026-10-24 12:00:00', 'bout' => '2026-10-24 13:00:00', 'hrs' => 8.17, 'late' => 0, 'ut' => 0, 'ot' => 0, 'rem' => 'Present', 'stat' => 'Completed'],
            ['date' => '2026-10-27', 'in' => '2026-10-27 07:58:00', 'out' => '2026-10-27 17:15:00', 'bin' => '2026-10-27 12:00:00', 'bout' => '2026-10-27 13:00:00', 'hrs' => 8.28, 'late' => 0, 'ut' => 0, 'ot' => 0, 'rem' => 'Present', 'stat' => 'Completed'],
            ['date' => '2026-10-28', 'in' => '2026-10-28 08:00:00', 'out' => '2026-10-28 17:00:00', 'bin' => '2026-10-28 12:00:00', 'bout' => '2026-10-28 13:00:00', 'hrs' => 8.00, 'late' => 0, 'ut' => 0, 'ot' => 0, 'rem' => 'Present', 'stat' => 'Completed'],
            ['date' => Carbon::today()->toDateString(), 'in' => Carbon::today()->toDateString() . ' 07:52:00', 'out' => null, 'bin' => null, 'bout' => null, 'hrs' => 0.00, 'late' => 0, 'ut' => 0, 'ot' => 0, 'rem' => 'Present', 'stat' => 'Completed'],
        ] as $a) {
            DB::table('attendance_records')->insert([
                'employee_id'       => $empId,
                'work_date'         => $a['date'],
                'time_in'           => $a['in'],
                'time_out'          => $a['out'],
                'break_in'          => $a['bin'],
                'break_out'         => $a['bout'],
                'hours_worked'      => $a['hrs'],
                'late_minutes'      => $a['late'],
                'undertime_minutes' => $a['ut'],
                'overtime_hours'    => $a['ot'],
                'remark'            => $a['rem'],
                'status'            => $a['stat'],
                'created_at'        => Carbon::now(),
                'updated_at'        => Carbon::now(),
            ]);
        }

        // Payroll Records & Items
        $existingPrs = DB::table('payroll_records')->where('employee_id', $empId)->pluck('payroll_record_id');
        if ($existingPrs->isNotEmpty()) {
            DB::table('payroll_items')->whereIn('payroll_record_id', $existingPrs)->delete();
            DB::table('payroll_records')->where('employee_id', $empId)->delete();
        }

        foreach ([
            ['pid' => 1, 'start' => '2026-06-01', 'end' => '2026-06-15', 'payout' => '2026-06-20', 'gross' => 36000.00, 'net' => 30125.00, 'status' => 'Released'],
            ['pid' => 2, 'start' => '2026-06-16', 'end' => '2026-06-30', 'payout' => '2026-07-05', 'gross' => 36000.00, 'net' => 30125.00, 'status' => 'Released'],
            ['pid' => 3, 'start' => '2026-07-01', 'end' => '2026-07-15', 'payout' => '2026-07-20', 'gross' => 36000.00, 'net' => 30125.00, 'status' => 'Released'],
            ['pid' => 4, 'start' => '2026-07-16', 'end' => '2026-07-31', 'payout' => '2026-08-05', 'gross' => 36000.00, 'net' => 30125.00, 'status' => 'Released'],
        ] as $pp) {
            $prId = DB::table('payroll_records')->insertGetId([
                'employee_id'       => $empId,
                'payroll_period_id' => $pp['pid'],
                'pay_period_start'  => $pp['start'],
                'pay_period_end'    => $pp['end'],
                'payout_date'       => $pp['payout'],
                'gross_pay'         => $pp['gross'],
                'net_pay'           => $pp['net'],
                'status'            => $pp['status'],
                'created_at'        => Carbon::now(),
                'updated_at'        => Carbon::now(),
            ]);

            foreach ([
                ['type' => 'Earning', 'label' => 'Basic Pay', 'amount' => 32500.00],
                ['type' => 'Earning', 'label' => 'Management Allowance', 'amount' => 3500.00],
                ['type' => 'Deduction', 'label' => 'SSS Contribution', 'amount' => 1462.50],
                ['type' => 'Deduction', 'label' => 'PhilHealth', 'amount' => 812.50],
                ['type' => 'Deduction', 'label' => 'Pag-IBIG HDMF', 'amount' => 200.00],
                ['type' => 'Deduction', 'label' => 'Withholding Tax', 'amount' => 3400.00],
            ] as $it) {
                DB::table('payroll_items')->insert([
                    'payroll_record_id' => $prId,
                    'item_type'         => $it['type'],
                    'label'             => $it['label'],
                    'amount'            => $it['amount'],
                    'created_at'        => Carbon::now(),
                ]);
            }
        }

        // Performance Review
        DB::table('performance_reviews')->where('employee_id', $empId)->delete();
        DB::table('performance_reviews')->insert([
            'employee_id'        => $empId,
            'review_period'      => 'Annual 2025 / Q3 2026',
            'review_date'        => '2026-07-15',
            'competency_level'   => 'Role Model',
            'overall_rating'     => 4.85,
            'salary_grade_id'    => 7,
            'salary_step'        => 'Step 3',
            'evaluator_user_id'  => 1,
            'comments'           => 'Demonstrates strategic leadership, outstanding organizational discipline, and proactive employee relations. Mentors team members across all hotel divisions.',
            'created_at'         => Carbon::now(),
            'updated_at'         => Carbon::now(),
        ]);

        // Learning
        DB::table('employee_learning')->where('employee_id', $empId)->delete();
        foreach ([
            ['cid' => 1, 'score' => 98.0, 'status' => 'Completed', 'adate' => '2026-05-01', 'cdate' => '2026-05-15'],
            ['cid' => 2, 'score' => 96.0, 'status' => 'Completed', 'adate' => '2026-05-01', 'cdate' => '2026-05-20'],
            ['cid' => 3, 'score' => 100.0, 'status' => 'Completed', 'adate' => '2026-06-01', 'cdate' => '2026-06-10'],
        ] as $l) {
            DB::table('employee_learning')->insert([
                'employee_id'          => $empId,
                'course_id'            => $l['cid'],
                'status'               => $l['status'],
                'score'                => $l['score'],
                'assigned_date'        => $l['adate'],
                'completed_date'       => $l['cdate'],
                'completion_source'    => 'system',
                'reading_completed_at' => $l['cdate'] . ' 10:00:00',
                'created_at'           => Carbon::now(),
                'updated_at'           => Carbon::now(),
            ]);
        }

        // Documents
        DB::table('employee_documents')->where('employee_id', $empId)->delete();
        foreach ([
            ['code' => 'DOC-038-01', 'title' => 'Executive Employment Contract', 'cat' => 'Employment', 'path' => '/files/emp-0038/doc-001.pdf', 'mime' => 'application/pdf', 'size' => 350000, 'stat' => 'Verified', 'date' => '2022-03-01', 'exp' => null],
            ['code' => 'DOC-038-02', 'title' => 'BIR Form 2316 (Annual Tax Return)', 'cat' => 'Tax Document', 'path' => '/files/emp-0038/doc-002.pdf', 'mime' => 'application/pdf', 'size' => 280000, 'stat' => 'Verified', 'date' => '2026-01-15', 'exp' => null],
            ['code' => 'DOC-038-03', 'title' => 'SSS Member Data Record (MDR)', 'cat' => 'Government ID', 'path' => '/files/emp-0038/doc-003.pdf', 'mime' => 'application/pdf', 'size' => 195000, 'stat' => 'Verified', 'date' => '2022-03-05', 'exp' => null],
            ['code' => 'DOC-038-04', 'title' => 'PhilHealth Membership Certificate', 'cat' => 'Government ID', 'path' => '/files/emp-0038/doc-004.pdf', 'mime' => 'application/pdf', 'size' => 210000, 'stat' => 'Verified', 'date' => '2022-03-05', 'exp' => null],
            ['code' => 'DOC-038-05', 'title' => 'Pag-IBIG Member ID & Certificate', 'cat' => 'Government ID', 'path' => '/files/emp-0038/doc-005.pdf', 'mime' => 'application/pdf', 'size' => 205000, 'stat' => 'Verified', 'date' => '2022-03-05', 'exp' => null],
            ['code' => 'DOC-038-06', 'title' => 'Executive Annual Physical Examination Clearance', 'cat' => 'Clearance', 'path' => '/files/emp-0038/doc-006.pdf', 'mime' => 'application/pdf', 'size' => 520000, 'stat' => 'Verified', 'date' => '2026-03-12', 'exp' => '2027-03-12'],
        ] as $d) {
            DB::table('employee_documents')->insert([
                'employee_id'     => $empId,
                'document_code'   => $d['code'],
                'title'           => $d['title'],
                'category'        => $d['cat'],
                'file_path'       => $d['path'],
                'mime_type'       => $d['mime'],
                'file_size_bytes' => $d['size'],
                'document_status' => $d['stat'],
                'document_date'   => $d['date'],
                'expiry_date'     => $d['exp'],
                'created_at'      => Carbon::now(),
                'updated_at'      => Carbon::now(),
            ]);
        }

        // Benefits
        DB::table('employee_benefits')->where('employee_id', $empId)->delete();
        foreach ([
            ['benefit_name' => 'SSS', 'reference_value' => '34-9876543-2', 'note' => 'Active executive contributions', 'effective_date' => '2022-03-01', 'status' => 'Active'],
            ['benefit_name' => 'PhilHealth', 'reference_value' => '12-987654321-0', 'note' => 'Active executive member', 'effective_date' => '2022-03-01', 'status' => 'Active'],
            ['benefit_name' => 'Pag-IBIG', 'reference_value' => '1234-9876-5432', 'note' => 'Active + Executive MP2 Savings', 'effective_date' => '2022-03-01', 'status' => 'Active'],
            ['benefit_name' => 'BIR Tax Status', 'reference_value' => 'M — Married', 'note' => 'TIN 987-654-321', 'effective_date' => '2022-03-01', 'status' => 'Active'],
            ['benefit_name' => 'HMO', 'reference_value' => 'Maxicare Executive Diamond Plus', 'note' => 'Comprehensive coverage + Dependents', 'effective_date' => '2022-03-01', 'status' => 'Active'],
        ] as $b) {
            DB::table('employee_benefits')->insert([
                'employee_id'     => $empId,
                ...$b,
                'created_at'      => Carbon::now(),
                'updated_at'      => Carbon::now(),
            ]);
        }
    }
}
