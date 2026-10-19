<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OfferNewJobMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $recipientEmail,
        public string $applicantName,
        public string $offeredPosition,
        public ?string $details = null,
        /** Deadline the applicant must respond by (7-day window), when the
         *  offer requires a response — null for plain referral emails. */
        public ?string $responseDeadline = null,
        public ?int $responseWindowDays = null,
    ) {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Exciting Opportunity for {$this->offeredPosition} — Oxford Suites Makati",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.applicant-offer',
            with: [
                'applicantName'      => $this->applicantName,
                'offeredPosition'    => $this->offeredPosition,
                'details'            => $this->details,
                'responseDeadline'   => $this->responseDeadline,
                'responseWindowDays' => $this->responseWindowDays,
            ],
        );
    }
}
