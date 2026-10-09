<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Assessment test score notice — emailed to the applicant automatically
 * after they submit their assessment test (public self-service link) or
 * after staff records the test on their behalf.
 */
class AssessmentTestResultMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $recipientEmail,
        public string $applicantName,
        public string $position,
        public string $testTitle,
        public float $totalScore,
        public string $result,
        public float $passingScore,
    ) {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Your Assessment Test Result: {$this->testTitle} — Oxford Suites Makati",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.assessment-test-result',
            with: [
                'applicantName' => $this->applicantName,
                'position'      => $this->position,
                'testTitle'     => $this->testTitle,
                'totalScore'    => $this->totalScore,
                'result'        => $this->result,
                'passingScore'  => $this->passingScore,
                'passed'        => $this->result === 'Passed',
            ],
        );
    }
}
