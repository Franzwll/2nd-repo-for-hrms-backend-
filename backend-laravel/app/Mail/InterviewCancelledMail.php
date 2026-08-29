<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class InterviewCancelledMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $recipientEmail,
        public string $applicantName,
        public string $position,
        public ?string $interviewDate = null,
        public ?string $interviewTime = null,
        public ?string $interviewMode = null,
    ) {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Interview Cancelled: {$this->position} — Oxford Suites Makati",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.applicant-cancelled',
            with: [
                'applicantName' => $this->applicantName,
                'position'      => $this->position,
                'interviewDate' => $this->interviewDate,
                'interviewTime' => $this->interviewTime,
                'interviewMode' => $this->interviewMode,
            ],
        );
    }
}
