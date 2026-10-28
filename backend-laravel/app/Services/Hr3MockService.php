<?php

namespace App\Services;

use App\Models\Employee;
use App\Models\Hr3Recommendation;
use App\Models\PromotionRequest;
use Modules\NewHireOnboarding\Models\NewHire;

class Hr3MockService
{
    public function enabled(): bool
    {
        return (bool) config('hr3.mock_enabled', false);
    }

    public function createForEmployee(Employee $employee, string $type, array $overrides = []): Hr3Recommendation
    {
        $existing = Hr3Recommendation::query()
            ->where('employee_id', $employee->employee_id)
            ->where('recommendation_type', $type)
            ->whereIn('status', ['Pending HR Action', 'Acknowledged'])
            ->latest('recommendation_id')
            ->first();

        if ($existing) {
            return $existing;
        }

        $score = $overrides['evaluation_score'] ?? config('hr3.default_score', 90);
        $comments = $overrides['comments'] ?? config('hr3.default_comments');

        $recommendation = Hr3Recommendation::create([
            'employee_id' => $employee->employee_id,
            'promotion_request_id' => $overrides['promotion_request_id'] ?? null,
            'recommendation_type' => $type,
            'evaluation_score' => $score,
            'evaluator_user_id' => $overrides['evaluator_user_id']
                ?? config('hr3.default_evaluator_user_id')
                ?? auth('sanctum')->id(),
            'date_submitted' => now()->toDateString(),
            'status' => 'Pending HR Action',
            'suggested_position_id' => $overrides['suggested_position_id'] ?? $employee->position_id,
            'suggested_salary_grade_id' => $overrides['suggested_salary_grade_id'] ?? $employee->salary_grade_id,
            'current_employment_type' => $employee->employment_type,
            'comments' => $comments,
        ]);

        AuditLogger::log(
            'Mock HR3 evaluation created',
            'Core HCM',
            'Info',
            'hr3_recommendation',
            (string) $recommendation->recommendation_id,
            "Auto-generated {$type} evaluation for {$employee->full_name} (demo mode).",
        );

        return $recommendation;
    }

    public function createForPromotionRequest(PromotionRequest $promotionRequest): Hr3Recommendation
    {
        $employee = $promotionRequest->employee;
        if (! $employee) {
            throw new \RuntimeException('Linked employee record no longer exists.');
        }

        $existing = Hr3Recommendation::query()
            ->where('employee_id', $employee->employee_id)
            ->where('recommendation_type', 'Promotion')
            ->whereIn('status', ['Pending HR Action', 'Acknowledged'])
            ->where(function ($query) use ($promotionRequest) {
                $query->whereNull('promotion_request_id')
                    ->orWhere('promotion_request_id', $promotionRequest->promotion_request_id);
            })
            ->latest('recommendation_id')
            ->first();

        $recommendation = $existing ?: $this->createForEmployee($employee, 'Promotion', [
            'promotion_request_id' => $promotionRequest->promotion_request_id,
            'suggested_position_id' => $promotionRequest->requested_position_id,
            'suggested_salary_grade_id' => $promotionRequest->requested_salary_grade_id,
            'comments' => 'Auto-accepted HR3 promotion evaluation (demo mode) for request #'
                . $promotionRequest->promotion_request_id . '.',
        ]);

        $recommendation->update(['promotion_request_id' => $promotionRequest->promotion_request_id]);
        $promotionRequest->update(['hr3_recommendation_id' => $recommendation->recommendation_id]);

        return $recommendation->fresh();
    }

    public function createForOnboarding(NewHire $newHire, ?Employee $employee = null): ?Hr3Recommendation
    {
        $employee ??= $newHire->employee_id
            ? Employee::find($newHire->employee_id)
            : Employee::where('email', $newHire->email)->first();

        if (! $employee) {
            return null;
        }

        return $this->createForEmployee($employee, 'Regularization', [
            'comments' => 'Auto-generated HR3 regularization evaluation from completed onboarding (demo mode).',
        ]);
    }
}
