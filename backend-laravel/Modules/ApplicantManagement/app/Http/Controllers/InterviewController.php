<?php

namespace Modules\ApplicantManagement\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Mail\ApplicantAcceptedMail;
use App\Mail\FacilityApprovalMail;
use App\Mail\InterviewCancelledMail;
use App\Mail\InterviewRescheduledMail;
use App\Services\AuditLogger;
use App\Services\NotificationService;
use App\Services\ZoomMeetingService;
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
        $query = Interview::with(['applicant.jobPost.department', 'facility'])
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

        // Facility request: when a facility is reserved for the interview the
        // schedule starts in "Waiting for Facility Approval". Confirmation of
        // the facility request (mock auto-approval from the UI after 3s, or
        // the approve endpoint) flips it to "Facility Approved".
        if (! empty($data['facility_id'])) {
            $data['facility_status'] = 'Waiting for Facility Approval';
        } else {
            $data['facility_status'] = 'Not Required';
        }

        $interview = Interview::create($data);

        // Virtual interviews auto-generate Zoom links (1st join + 2nd continue
        // + password) so the applicant email contains everything to join.
        if (($interview->mode ?? null) === 'Virtual') {
            $zoom = ZoomMeetingService::createForInterview(
                (string) $interview->interview_code,
                (string) (Applicant::find($data['applicant_id'])?->name ?? 'Applicant'),
                $interview->interviewer_name,
            );
            $interview->update([
                'zoom_meeting_id'   => $zoom['meeting_id'],
                'zoom_join_url'     => $zoom['join_url'],
                'zoom_continue_url' => $zoom['continue_url'],
                'zoom_password'     => $zoom['password'],
            ]);
            $interview->refresh();
        }

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
            targetId: (string) $interview->interview_id,
            onlyRoleNames: ['Admin', 'Super Admin']
        );

        if ($applicant->email) {
            try {
                Mail::to($applicant->email)->send(new ApplicantAcceptedMail(
                    recipientEmail: $applicant->email,
                    applicantName: $applicant->name,
                    position: $applicant->jobPost?->title ?? 'Position',
                    interviewDate: $interview->scheduled_date,
                    interviewTime: $interview->scheduled_time,
                    interviewMode: $interview->mode,
                    interviewerName: $interview->interviewer_name,
                    zoomJoinUrl: $interview->zoom_join_url,
                    zoomContinueUrl: $interview->zoom_continue_url,
                    zoomPassword: $interview->zoom_password
                ));
            } catch (\Throwable $e) {
                Log::warning("Failed to send interview invitation to {$applicant->email}: " . $e->getMessage());
            }
        }

        return response()->json(new InterviewResource($interview->load(['applicant.jobPost.department', 'facility'])), 201);
    }

    /* ------------------------------------------------------------------ */
    /* POST /api/v1/interviews/{interview}/facility-approve                */
    /* Confirms the facility request and emails the applicant. The UI     */
    /* calls this (mock) after 3 seconds of "Waiting for Facility Approval"*/
    /* ------------------------------------------------------------------ */

    public function facilityApprove(int $interview): JsonResponse
    {
        $model = Interview::with(['applicant.jobPost.department', 'facility'])->findOrFail($interview);
        $applicant = $model->applicant;

        if (! $model->facility_id || ! $model->facility) {
            return response()->json(['message' => 'This interview has no facility request to approve.'], 422);
        }

        if ($model->facility_status === 'Facility Approved') {
            return response()->json(new InterviewResource($model));
        }

        $model->update(['facility_status' => 'Facility Approved']);

        // Virtual interviews must have Zoom links before the confirmation email.
        if ($model->mode === 'Virtual' && empty($model->zoom_join_url)) {
            ZoomMeetingService::ensureForModel($model, $applicant?->jobPost?->title);
            $model->save();
            $model->refresh();
        }

        AuditLogger::log(
            action: 'Facility Request Approved',
            module: 'Applicant Management',
            severity: 'Info',
            targetType: 'Interview',
            targetId: (string) $model->interview_id,
            details: "Facility request approved — {$model->facility->name} for {$applicant?->name}'s interview on {$model->scheduled_date} at {$model->scheduled_time}. Confirmation email sent to {$applicant?->email}."
        );

        // Helpful-only: facility confirmation already emails the applicant and
        // stays in audit log. No bell needed.

        // Automatically email the applicant their confirmed schedule.
        if ($applicant?->email) {
            try {
                Mail::to($applicant->email)->send(new FacilityApprovalMail(
                    recipientEmail: $applicant->email,
                    applicantName: $applicant->name,
                    position: $applicant->jobPost?->title ?? 'Position',
                    facilityName: $model->facility->name,
                    interviewDate: (string) $model->scheduled_date,
                    interviewTime: (string) $model->scheduled_time,
                    facilityLocation: $model->facility->location,
                    interviewerName: $model->interviewer_name,
                    interviewMode: $model->mode,
                    zoomJoinUrl: $model->zoom_join_url,
                    zoomContinueUrl: $model->zoom_continue_url,
                    zoomPassword: $model->zoom_password,
                ));
            } catch (\Throwable $e) {
                Log::warning("Failed to send facility approval notice to {$applicant->email}: " . $e->getMessage());
            }
        }

        return response()->json(new InterviewResource($model));
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
    /* POST /api/v1/interviews/{interview}/zoom-signature                   */
    /* Mints a Meeting SDK signature so the frontend Component View can    */
    /* embed the REAL Zoom meeting inside the HRMS popup (no Zoom app).    */
    /* 428 when the interview has no meeting yet; 501 when SDK keys are    */
    /* missing (frontend falls back to local preview + join-link button).  */
    /* ------------------------------------------------------------------ */

    public function zoomSignature(Request $request, int $interview): JsonResponse
    {
        $model = Interview::findOrFail($interview);

        if ($model->mode !== 'Virtual' || empty($model->zoom_meeting_id)) {
            return response()->json([
                'message' => 'This interview has no Zoom meeting to embed yet.',
                'sdk_configured' => ZoomMeetingService::sdkConfigured(),
            ], 428);
        }

        if (! ZoomMeetingService::sdkConfigured()) {
            return response()->json([
                'message' => 'Zoom Meeting SDK is not configured (ZOOM_SDK_KEY/SECRET missing).',
                'sdk_configured' => false,
            ], 501);
        }

        $role = (int) $request->input('role', 0);
        $role = $role === 1 ? 1 : 0;
        $signature = ZoomMeetingService::sdkSignature((string) $model->zoom_meeting_id, $role);

        if ($signature === null) {
            return response()->json(['message' => 'Could not mint a meeting signature.'], 500);
        }

        return response()->json([
            'meeting_number' => preg_replace('/\D/', '', (string) $model->zoom_meeting_id),
            'password'       => $model->zoom_password,
            'join_url'       => $model->zoom_join_url,
            'sdk_key'        => (string) config('services.zoom.sdk_key'),
            'signature'      => $signature,
            'role'           => $role,
            'user_name'      => $model->interviewer_name ?: 'HR Interviewer',
        ]);
    }

    /* ------------------------------------------------------------------ */
    /* PUT /api/v1/interviews/{interview}                                  */
    /* ------------------------------------------------------------------ */

    /* ------------------------------------------------------------------ */
    /* PATCH /api/v1/interviews/{interview}/notes                            */
    /* Save interviewer notes during/after the interview.                  */
    /* ------------------------------------------------------------------ */

    public function saveNotes(Request $request, int $interview): JsonResponse
    {
        $request->validate([
            'notes' => 'nullable|string|max:10000',
        ]);

        $model = Interview::findOrFail($interview);
        $model->update(['interview_notes' => $request->input('notes')]);

        AuditLogger::log(
            action: 'Interview Notes Updated',
            module: 'Applicant Management',
            severity: 'Info',
            targetType: 'Interview',
            targetId: (string) $model->interview_id,
            details: "Interview notes saved for {$model->applicant?->name}'s interview."
        );

        return response()->json([
            'message' => 'Notes saved',
            'interview_notes' => $model->interview_notes,
        ]);
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
        $previousStatus = $model->status;

        $model->update($request->validated());

        // Switching to Virtual (or missing links) auto-generates Zoom links so
        // the reschedule email always has fresh Join + Continue + password.
        $model->refresh();
        if ($model->mode === 'Virtual' && empty($model->zoom_join_url)) {
            ZoomMeetingService::ensureForModel($model, $applicant?->jobPost?->title);
            $model->save();
            $model->refresh();
        }

        $applicant = $model->applicant;

        /* --- Cancellation via status update ------------------------------- */
        /* The interview record is KEPT and labelled "Cancelled"; the          */
        /* applicant is returned to the "Screened" stage so they can be        */
        /* re-booked, and a cancellation email is dispatched.                  */
        if ($model->status === 'Cancelled' && $previousStatus !== 'Cancelled') {
            if (
                $applicant
                && in_array($applicant->stage, ['Interview Scheduled', 'Accepted'])
            ) {
                $applicant->update(['stage' => 'Screened']);
            }

            AuditLogger::log(
                action: 'Interview Cancelled',
                module: 'Applicant Management',
                severity: 'Warning',
                targetType: 'Interview',
                targetId: (string) $model->interview_id,
                details: "Cancelled interview for {$applicant?->name} scheduled on {$model->scheduled_date} {$model->scheduled_time}."
            );

            NotificationService::send(
                title: "Interview cancelled: {$applicant?->name}",
                body: "Interview on {$model->scheduled_date} {$model->scheduled_time} was cancelled.",
                module: 'Applicant Management',
                type: 'warning',
                targetType: 'Interview',
                targetId: (string) $model->interview_id,
                onlyRoleNames: ['Admin', 'Super Admin']
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

            return response()->json(new InterviewResource($model->load('applicant.jobPost.department')));
        }

        /* Reactivated (re-booked) from a cancelled interview */
        if ($previousStatus === 'Cancelled' && $model->status !== 'Cancelled') {
            if ($applicant && in_array($applicant->stage, ['Screened', 'Accepted'])) {
                $applicant->update(['stage' => 'Interview Scheduled']);
            }
        }

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
                    previousTime: $previousTime,
                    interviewerName: $model->interviewer_name,
                    zoomJoinUrl: $model->zoom_join_url,
                    zoomContinueUrl: $model->zoom_continue_url,
                    zoomPassword: $model->zoom_password
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

        // Return the applicant to the "Screened" stage so they can be
        // re-booked (otherwise a cancelled/deleted interview leaves them
        // stranded at "Interview Scheduled" — e.g. still queued for assessment).
        if ($applicant && in_array($applicant->stage, ['Interview Scheduled', 'Accepted'])) {
            $applicant->update(['stage' => 'Screened']);
        }

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
            targetId: (string) $model->interview_id,
            onlyRoleNames: ['Admin', 'Super Admin']
        );

        $model->delete();

        return response()->json(['message' => 'Interview deleted successfully.']);
    }
}
