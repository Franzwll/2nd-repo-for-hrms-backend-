<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

/**
 * Unlock an ESS LMS quiz by clearing an employee's attempts for one course.
 *
 * Tier-1 policy is one attempt only, so a failed attempt locks the quiz. This
 * command is the deliberate admin/testing escape hatch: it removes the attempt
 * history and resets the course card to "In Progress" without forcing the
 * employee to re-read the handbook.
 */
class ResetQuizAttempt extends Command
{
    protected $signature = 'ess:reset-quiz-attempt
                            {email : Employee email address}
                            {course : Course code, for example LMS-101}
                            {--force : Skip the confirmation prompt}';

    protected $description = 'Unlock an ESS LMS quiz by deleting an employee\'s attempts for a course.';

    public function handle(): int
    {
        $email = trim((string) $this->argument('email'));
        $courseCode = trim((string) $this->argument('course'));

        $employee = DB::table('employees')
            ->whereRaw('LOWER(email) = ?', [mb_strtolower($email)])
            ->whereNull('deleted_at')
            ->first(['employee_id', 'email', 'first_name', 'last_name']);

        if (! $employee) {
            $this->error("No employee found for email [{$email}].");

            return self::FAILURE;
        }

        $course = DB::table('learning_courses')
            ->whereRaw('LOWER(course_code) = ?', [mb_strtolower($courseCode)])
            ->first(['course_id', 'course_code', 'title']);

        if (! $course) {
            $this->error("No learning course found for code [{$courseCode}].");

            return self::FAILURE;
        }

        $attempts = DB::table('employee_learning_attempts')
            ->where('employee_id', (int) $employee->employee_id)
            ->where('course_id', (int) $course->course_id);

        $attemptCount = $attempts->clone()->count();
        $failedCount = $attempts->clone()->where('passed', false)->count();

        $employeeName = trim(($employee->first_name ?? '').' '.($employee->last_name ?? ''))
            ?: $employee->email;

        $this->newLine();
        $this->line("Employee: <info>{$employeeName}</info> ({$employee->email})");
        $this->line("Course:   <info>{$course->course_code}</info> - {$course->title}");
        $this->line("Attempts: {$attemptCount} ({$failedCount} failed)");
        $this->newLine();

        if (! $this->option('force')
            && ! $this->confirm('Delete these attempts and reset the course progress?', false)) {
            $this->warn('Cancelled. Nothing was changed.');

            return self::SUCCESS;
        }

        $deleted = $attempts->delete();
        $reset = DB::table('employee_learning')
            ->where('employee_id', (int) $employee->employee_id)
            ->where('course_id', (int) $course->course_id)
            ->update([
                'status' => 'In Progress',
                'score' => null,
                'completed_date' => null,
                'completion_source' => null,
            ]);

        $this->info("Deleted {$deleted} attempt(s).");

        if ($reset) {
            $this->info('Course progress reset to In Progress. Reading completion was preserved.');
        } else {
            $this->line('No employee_learning row existed for this employee/course.');
        }

        $this->newLine();
        $this->info('Quiz unlocked. Refresh the ESS page and open the quiz again.');

        return self::SUCCESS;
    }
}
