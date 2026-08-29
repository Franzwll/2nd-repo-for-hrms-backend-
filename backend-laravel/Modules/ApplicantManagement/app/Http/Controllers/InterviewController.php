<?php

namespace Modules\ApplicantManagement\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Mail\ApplicantAcceptedMail;
use App\Mail\InterviewCancelledMail;
use App\Mail\InterviewRescheduledMail;
use App\Services\AuditLogger;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Modules\ApplicantManagement\Http\Requests\StoreInterviewRequest;
use Modules\ApplicantManagement\Http\Requests\UpdateInterviewRequest;
use Modules\ApplicantManagement\Http\Resources\InterviewResource;
use Modules\ApplicantManagement\Models\Applicant;
use Modules\ApplicantManagement\Models\Interview;

class InterviewController extends Controller
{
    /* ------------------------------------------------------------------ */
    /* GET /api/v1/interviews                                              */
    /* ------------------------------------------------------------------ */

    public function index(Request $request): JsonResponse
    {
        $query = Interview::with('applicant.jobPost.department')
            ->orderByDesc('scheduled_date');

        if ($applicantId = $request->query('applicant_id')) {
            $query->where('applicant_id', $applicantId);
        }
        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }
        if ($date = $request->query('date')) {
            $query->whereDate('scheduled_date', $date);
        }

        $perPage = (int) $request->query('per_page', 15);
        $paginated = $query->paginate($perPage);

        return response()->json([
            'data' => InterviewResource::collection($paginated->items()),
            'meta' => [
                'current_page' => $paginated->currentPage(),
                'last_page'    => $paginated->lastPage(),
                'per_page'     => $paginated->perPage(),
                'total'        => $paginated->total(),
            ],
        ]);
    }

    /* ------------------------------------------------------------------ */
    /* POST /api/v1/interviews                                             */
    /* Also advances applicant stage to "Interview Scheduled"              */
    /* ------------------------------------------------------------------ */

    public function store(StoreInterviewRequest $request): JsonResponse
    {
        $data = $request->validated();

        // An applicant can only be booked/scheduled once
        $alreadyBooked = Interview::where('applicant_id', $data['applicant_id'])
            ->whereIn('status', ['Scheduled', 'Completed'])
            ->exists();

        if ($alreadyBooked) {
            return response()->json([
                'message' => 'This applicant already has a booked interview and can only be scheduled once.',
            ], 422);
        }

        $data['status'] = $data['status'] ?? 'Scheduled';
        $data['interview_code'] = Interview::generateCode();

        $interview = Interview::create($data);

        // Advance applicant to "Interview Scheduled" stage
        $applicant = Applicant::findOrFail($data['applicant_id']);
        if (in_array($applicant->stage, ['Screened', 'Accepted'])) {
            $applicant->update(['stage' => 'Interview Scheduled']);
        }

        AuditLogger::log(
            action: 'Interview Booked',
            module: 'Applicant Management',
            severity: 'Info',
            targetType: 'Interview',
            targetId: (string) $interview->interview_id,
            details: "Scheduled interview for {$applicant->name} on {$interview->scheduled_date} at {$interview->scheduled_time} ({$interview->mode})."
        );

        NotificationService::send(
            title: "Interview scheduled: {$applicant->name}",
            body: "Booked on {$interview->scheduled_date} {$interview->scheduled_time} with {$interview->interviewer_name}.",
            module: 'Applicant Management',
            type: 'info',
            targetType: 'Interview',
            targetId: (string) $interview->interview_id
        );

        if ($applicant->email) {
            try {
                Mail::to($applicant->email)->send(new ApplicantAcceptedMail(
                    recipientEmail: $applicant->email,
                    applicantName: $applicant->name,
                    position: $applicant->jobPost?->title ?? 'Position',
                    interviewDate: $interview->scheduled_date,
                    interviewTime: $interview->scheduled_time,
                    interviewMode: $interview->mode
                ));
            } catch (\Throwable $e) {
                Log::warning("Failed to send interview invitation to {$applicant->email}: " . $e->getMessage());
            }
        }

        return response()->json(new InterviewResource($interview->load('applicant.jobPost.department')), 201);
    }

    /* ------------------------------------------------------------------ */
    /* GET /api/v1/interviews/{interview}                                  */
    /* ------------------------------------------------------------------ */

    public function show(int $interview): JsonResponse
    {
        $model = Interview::with('applicant.jobPost.department')->findOrFail($interview);
        return response()->json(new InterviewResource($model));
    }

    /* ------------------------------------------------------------------ */
    /* PUT /api/v1/interviews/{interview}                                  */
    /* ------------------------------------------------------------------ */

    public function update(UpdateInterviewRequest $request, int $interview): JsonResponse
    {
        $model = Interview::with('applicant')->findOrFail($interview);

        $previousDate = $model->scheduled_date;
        $previousTime = $model->scheduled_time;
        $previousMode = $model->mode;

        $model->update($request->validated());

        $applicant = $model->applicant;
        $scheduleChanged = $model->scheduled_date !== $previousDate
            || $model->scheduled_time !== $previousTime
            || $model->mode !== $previousMode;

        if ($scheduleChanged && $applicant?->email) {
            try {
                Mail::to($applicant->email)->send(new InterviewRescheduledMail(
                    recipientEmail: $applicant->email,
                    applicantName: $applicant->name,
                    position: $applicant->jobPost?->title ?? 'Position',
                    interviewDate: $model->scheduled_date,
                    interviewTime: $model->scheduled_time,
                    interviewMode: $model->mode,
                    previousDate: $previousDate,
                    previousTime: $previousTime
                ));
            } catch (\Throwable $e) {
                Log::warning("Failed to send reschedule notice to {$applicant->email}: " . $e->getMessage());
            }
        }

        AuditLogger::log(
            action: 'Interview Updated / Rescheduled',
            module: 'Applicant Management',
            severity: 'Info',
            targetType: 'Interview',
            targetId: (string) $model->interview_id,
            details: "Updated interview for {$model->applicant?->name} on {$model->scheduled_date} at {$model->scheduled_time} ({$model->status})."
        );

        return response()->json(new InterviewResource($model->load('applicant.jobPost.department')));
    }

    /* ------------------------------------------------------------------ */
    /* DELETE /api/v1/interviews/{interview}                               */
    /* ------------------------------------------------------------------ */

    public function destroy(int $interview): JsonResponse
    {
        $model = Interview::with(['applicant.jobPost'])->findOrFail($interview);
        $applicant = $model->applicant;
        $applicantName = $applicant?->name ?? "Applicant #{$model->applicant_id}";

        AuditLogger::log(
            action: 'Interview Cancelled',
            module: 'Applicant Management',
            severity: 'Warning',
            targetType: 'Interview',
            targetId: (string) $model->interview_id,
            details: "Cancelled interview for {$applicantName} scheduled on {$model->scheduled_date} {$model->scheduled_time}."
        );

        if ($applicant?->email) {
            try {
                Mail::to($applicant->email)->send(new InterviewCancelledMail(
                    recipientEmail: $applicant->email,
                    applicantName: $applicant->name,
                    position: $applicant->jobPost?->title ?? 'Position',
                    interviewDate: $model->scheduled_date,
                    interviewTime: $model->scheduled_time,
                    interviewMode: $model->mode
                ));
            } catch (\Throwable $e) {
                Log::warning("Failed to send cancellation notice to {$applicant->email}: " . $e->getMessage());
            }
        }

        NotificationService::send(
            title: "Interview cancelled: {$applicantName}",
            body: "Interview on {$model->scheduled_date} {$model->scheduled_time} was cancelled.",
            module: 'Applicant Management',
            type: 'warning',
            targetType: 'Interview',
            targetId: (string) $model->interview_id
        );

        $model->delete();

        return response()->json(['message' => 'Interview deleted successfully.']);
    }
}
