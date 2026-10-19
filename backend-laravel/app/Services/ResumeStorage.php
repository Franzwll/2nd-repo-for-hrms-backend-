<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;

/**
 * Stores applicant resumes under a random filename while preserving the real
 * extension from the client's original filename.
 *
 * UploadedFile::store() derives the extension via guessExtension() (MIME based),
 * which reports ".bin" for common formats such as .docx. The NLP screening keys
 * off the stored file name, so ".bin" resumes were rejected as unsupported.
 */
class ResumeStorage
{
    public static function store(UploadedFile $file, string $directory = 'resumes'): string
    {
        $ext = strtolower($file->getClientOriginalExtension());
        $name = Str::random(40) . ($ext !== '' ? '.' . $ext : '');

        return $file->storeAs($directory, $name, 'public');
    }
}
