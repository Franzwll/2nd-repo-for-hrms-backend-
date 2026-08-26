<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SendPortalCredentialsMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $password,
        public string $name,
    ) {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your Oxford Suites Makati HRMS portal credentials',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.portal-credentials',
            with: [
                'password' => $this->password,
                'name' => $this->name,
            ],
        );
    }
}