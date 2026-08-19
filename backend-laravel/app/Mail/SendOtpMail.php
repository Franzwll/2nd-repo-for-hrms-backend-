<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SendOtpMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $code,
        public string $name,
        public int $expiresInSeconds = 300,
    ) {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your Oxford Suites Makati HRMS verification code',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.otp',
            with: [
                'code' => $this->code,
                'name' => $this->name,
                'expiresInMinutes' => (int) ceil($this->expiresInSeconds / 60),
            ],
        );
    }
}