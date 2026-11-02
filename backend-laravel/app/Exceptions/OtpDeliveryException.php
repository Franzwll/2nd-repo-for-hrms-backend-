<?php

namespace App\Exceptions;

use RuntimeException;

/**
 * Thrown when the one-time password could not be handed to the mailer.
 *
 * OTP delivery used to fail silently: the code was cached, the SMTP error
 * was only reported to the logs, and the caller still answered "OTP sent".
 * Users were then stuck waiting for an email that never arrived. Callers
 * should surface this as a temporary delivery problem, not as a bad login.
 */
class OtpDeliveryException extends RuntimeException
{
    public static function forUser(string $email, ?\Throwable $previous = null): self
    {
        return new self(
            "Could not deliver the one-time password to {$email}.",
            0,
            $previous
        );
    }
}
