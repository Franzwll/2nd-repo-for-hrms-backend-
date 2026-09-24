<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Facility request confirmation — sent to the applicant's email once the
 * requested interview facility (Room 1-3 / Online Interview) is approved.
 */
class FacilityApprovalMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $recipientEmail,
        public string $applicantName,
        public string $position,
        public string $facilityName,
        public string $interviewDate,
        public string $interviewTime,
        public ?string $facilityLocation = null,
    ) {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Interview Facility Confirmed \u{2014} Oxford Suites Makati",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.facility-approval',
            with: [
                'applicantName'    => $this->applicantName,
                'position'         => $this->position,
                'facilityName'     => $this->facilityName,
                'interviewDate'    => $this->interviewDate,
                'interviewTime'    => $this->interviewTime,
                'facilityLocation' => $this->facilityLocation,
            ],
        );
    }
}
