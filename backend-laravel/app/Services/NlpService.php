<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class NlpService
{
    protected string $baseUrl;

    public function __construct()
    {
        $this->baseUrl = config('services.nlp.url', env('NLP_SERVICE_URL', 'http://127.0.0.1:8001'));
    }

    /**
     * Send resume file / text to the Python NLP service for OCR, NER extraction, and scoring.
     */
    public function screenResume(string $filePath, ?string $jobRequirements = null): ?array
    {
        try {
            $response = Http::timeout(30)
                ->attach('file', file_get_contents($filePath), basename($filePath))
                ->post("{$this->baseUrl}/screening/score", [
                    'requirements' => $jobRequirements,
                ]);

            if ($response->successful()) {
                return $response->json();
            }

            Log::warning("NLP screening service returned status {$response->status()}", [
                'response' => $response->body(),
            ]);
        } catch (\Throwable $e) {
            Log::error("Failed to connect to NLP screening service: " . $e->getMessage());
        }

        return null;
    }
}
