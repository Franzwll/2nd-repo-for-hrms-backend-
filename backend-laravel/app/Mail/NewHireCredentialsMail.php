<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewHireCredentialsMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $employeeName,
        public string $email,
        public string $password,
        public ?string $position = null,
        public ?string $startDate = null,
    ) {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Welcome to Oxford Suites Makati — Your Employee Portal Credentials',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.new-hire-credentials',
            with: [
                'employeeName' => $this->employeeName,
                'email'        => $this->email,
                'password'     => $this->password,
                'position'     => $this->position,
                'startDate'    => $this->startDate,
            ],
        );
    }
}
