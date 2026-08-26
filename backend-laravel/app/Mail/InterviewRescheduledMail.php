<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class InterviewRescheduledMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $applicantName,
        public string $position,
        public ?string $interviewDate,
        public ?string $interviewTime,
        public ?string $interviewMode,
        public ?string $previousDate = null,
        public ?string $previousTime = null,
    ) {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Interview Rescheduled: {$this->position} — Oxford Suites Makati",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.applicant-rescheduled',
            with: [
                'applicantName' => $this->applicantName,
                'position'      => $this->position,
                'interviewDate' => $this->interviewDate,
                'interviewTime' => $this->interviewTime,
                'interviewMode' => $this->interviewMode,
                'previousDate'  => $this->previousDate,
                'previousTime'  => $this->previousTime,
            ],
        );
    }
}
