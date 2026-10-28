<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewHireWelcomeMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $recipientEmail,
        public string $employeeName,
        public ?string $position = null,
        public ?string $startDate = null,
    ) {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Welcome to Oxford Suites Makati — Your Start Date Confirmation',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.new-hire-welcome',
            with: [
                'employeeName' => $this->employeeName,
                'position'     => $this->position,
                'startDate'    => $this->startDate,
            ],
        );
    }
}