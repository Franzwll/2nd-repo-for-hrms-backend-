<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Assessment test invitation — emailed to the applicant automatically once a
 * secure test link is generated (right after they pass the interview
 * assessment). The link needs no login and expires after the configured days.
 */
class AssessmentTestInviteMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $recipientEmail,
        public string $applicantName,
        public string $position,
        public string $testTitle,
        public string $testUrl,
        public float $passingScore,
        public ?string $expiresAt = null,
    ) {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Assessment Test Invitation: {$this->testTitle} — Oxford Suites Makati",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.assessment-test-invite',
            with: [
                'applicantName' => $this->applicantName,
                'position'      => $this->position,
                'testTitle'     => $this->testTitle,
                'testUrl'       => $this->testUrl,
                'passingScore'  => $this->passingScore,
                'expiresAt'     => $this->expiresAt,
            ],
        );
    }
}
