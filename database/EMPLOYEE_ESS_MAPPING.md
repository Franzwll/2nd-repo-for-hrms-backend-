# Employee ESS → Database Mapping

This document maps the data keys used by the `EmployeeEss` frontend component to the corresponding database tables and columns in `hotel_hr_schema_postgres.sql` (Revision 2.2).

## Overview
- Frontend uses camelCase identifiers (e.g. `myProfile`, `myPayroll`) while the DB uses snake_case (e.g. `employees`, `payroll_records`).
- The API layer / backend should translate between these shapes and perform necessary formatting (dates, currency, derived counters).

## Key mappings

- `myProfile` → `employees`
  - `employeeId` → `employees.employee_id`
  - `employeeCode` → `employees.employee_code`
  - `firstName`, `lastName`, `middleName` → `first_name`, `last_name`, `middle_name`
  - `email` → `employees.email`
  - `positionId` → `employees.position_id` (JOIN `positions`)
  - `departmentId` → `employees.department_id` (JOIN `departments`)
  - `employmentType` → `employees.employment_type`
  - `dateHired` → `employees.date_hired`
  - `salaryGradeId` / `salaryStep` → `employees.salary_grade_id`, `employees.salary_step`

- `essRequests` (all requests) → `ess_requests`
  - `id/requestCode` → `ess_requests.ess_request_id` / `request_code`
  - `employeeId` → `ess_requests.employee_id`
  - `category` → `ess_categories` (via `ess_requests.category_id`)
  - `type` → `ess_requests.request_type`
  - `filed` / `filedAt` → `ess_requests.filed_at`
  - `status` → `ess_requests.status`
  - `details` → `ess_requests.details`
  - `attachment` → `ess_requests.attachment_path`

- `myAttendance` → `attendance_records`
  - `today.timeIn` / `timeOut` → `attendance_records.time_in`, `time_out` (filter by `work_date`)
  - `history` → rows from `attendance_records` (ordered by `work_date`)
  - aggregated fields (monthly present/late/overtime) are computed by queries on `attendance_records`

- `mySchedule` → `work_schedules`
  - map `day`, `shift`, `time`, `location` → `work_schedules.day_of_week`, `shift_name`, `start_time`, `end_time`, `location`

- `myPayroll` → `payroll_records`, `payroll_items`, `payroll_periods`
  - `net`, `gross`, `payslips` → `payroll_records.net_pay`, `payroll_records.gross_pay`, join `payroll_items` for breakdown
  - `payslip` release/download references → `payroll_records.status` and file-generation endpoint

- `myEmployeeDocuments` → `employee_documents`
  - `documentId` → `employee_documents.document_id`
  - `title`, `category`, `status`, `file_path`, `document_date`, `expiry_date`

- `myBenefits` → `employee_benefits`
  - `benefitName`, `referenceValue`, `effectiveDate`, `status`

- `myLeaveBalances` → `leave_balances`
  - `leaveType`, `totalDays`, `usedDays` → `leave_balances.leave_type`, `total_days`, `used_days`

- `myLearningCourses` / `employeeLearning` → `learning_courses`, `employee_learning`
  - `courseId` → `learning_courses.course_id`
  - `status`, `score`, `completedDate` → `employee_learning.status`, `score`, `completed_date`

- `myPerformance` → `performance_reviews`, `hr3_recommendations`
  - recent review, competency, salary_grade, salary_step → `performance_reviews` (filter latest by `employee_id`)
  - promotion requests → `hr3_recommendations` (or dedicated promotion table if present)

## Example SQL queries

- Employee profile
```sql
SELECT e.employee_id, e.employee_code, e.first_name, e.last_name, e.email, p.title AS position_title, d.name AS department
FROM employees e
LEFT JOIN positions p ON p.position_id = e.position_id
LEFT JOIN departments d ON d.department_id = e.department_id
WHERE e.employee_id = :employee_id;
```

- Attendance history (last 30 days)
```sql
SELECT work_date, time_in, time_out, break_in, break_out, hours_worked, late_minutes, overtime_hours, remark
FROM attendance_records
WHERE employee_id = :employee_id
ORDER BY work_date DESC
LIMIT 30;
```

- ESS requests for employee
```sql
SELECT r.ess_request_id, r.request_code, c.name AS category, r.request_type, r.filed_at, r.status, r.details, r.attachment_path
FROM ess_requests r
LEFT JOIN ess_categories c ON c.ess_category_id = r.category_id
WHERE r.employee_id = :employee_id
ORDER BY r.filed_at DESC;
```

- Latest payroll record + breakdown
```sql
SELECT pr.payroll_record_id, pr.pay_period_start, pr.pay_period_end, pr.gross_pay, pr.net_pay, pr.status
FROM payroll_records pr
WHERE pr.employee_id = :employee_id
ORDER BY pr.pay_period_end DESC
LIMIT 1;

SELECT pi.label, pi.amount, pi.item_type
FROM payroll_items pi
WHERE pi.payroll_record_id = :payroll_record_id;
```

## Notes & recommendations

- Enum/string values: DB CHECK constraints define canonical status strings (e.g. `ess_requests.status` values: 'Pending', 'Under Review', 'Approved', 'Rejected', 'Completed'). Keep frontend strings in sync or map them in the API.
- Date/time formatting: return ISO timestamps from the API and format in the frontend; do not persist display strings in DB.
- Derived counters (e.g. `filled_count`, `onboarding_complete`) must be maintained by the backend service layer; frontend may treat these as read-only.
- `wireframeActivity` appears to be UI/mock data; persistent auditing belongs in `audit_logs` or `ess_requests` history.

## Next actions (optional)
- Produce a CSV/JSON file with one-to-one field mappings for automation.
- Generate API endpoint templates (GET/POST routes) and example controller SQL.

If you want the CSV/JSON mapping or the API templates, say which format you prefer and I'll add them.
