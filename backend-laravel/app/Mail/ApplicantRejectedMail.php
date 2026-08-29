<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ApplicantRejectedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $recipientEmail,
        public string $applicantName,
        public string $position,
    ) {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Update on your application for {$this->position} — Oxford Suites Makati",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.applicant-rejected',
            with: [
                'applicantName' => $this->applicantName,
                'position'      => $this->position,
            ],
        );
    }
}
