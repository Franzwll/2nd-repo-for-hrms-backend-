<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

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

    /**
     * Lightweight extraction pass (text extraction + NER profile only - no
     * matching/classification). Powers the Add Applicant wizard's
     * "auto-fill contact fields from resume" behavior.
     * Returns ['ok' => bool, 'data' => ?array, 'error' => ?string].
     */
    public function extractResume(string $filePath, string $originalName): array
    {
        if (!is_file($filePath)) {
            return ['ok' => false, 'data' => null, 'error' => "Resume file not found at {$filePath}"];
        }

        try {
            $response = Http::timeout(30)
                ->attach('file', file_get_contents($filePath), $originalName)
                ->post("{$this->baseUrl}/extract-resume");

            if ($response->successful()) {
                return ['ok' => true, 'data' => $response->json(), 'error' => null];
            }

            Log::warning("NLP extract service returned status {$response->status()}", [
                'response' => Str::limit($response->body(), 500),
            ]);
            return ['ok' => false, 'data' => null, 'error' => "NLP service returned status {$response->status()}"];
        } catch (\Throwable $e) {
            Log::error("Failed to connect to NLP extract service: " . $e->getMessage());
            return ['ok' => false, 'data' => null, 'error' => $e->getMessage()];
        }
    }

    /**
     * Full screening call with structured role requirements and alternative open jobs.
     * Returns ['ok' => bool, 'data' => ?array, 'error' => ?string] so callers never fail silently.
     */
    public function screenResumeStructured(
        string $filePath,
        string $originalName,
        array $requirements,
        array $openJobs = [],
        int $timeoutSeconds = 120,
        ?array $referenceData = null
    ): array {
        if (!is_file($filePath)) {
            return ['ok' => false, 'data' => null, 'error' => "Resume file not found at {$filePath}"];
        }

        try {
            $payload = [
                'requirements' => json_encode($requirements),
                'open_jobs' => json_encode(array_values($openJobs)),
            ];
            // DB-managed reference data (skills/roles/certifications + aliases);
            // the NLP service falls back to its bundled seed JSON when absent.
            if ($referenceData) {
                $payload['reference_data'] = json_encode($referenceData);
            }

            $response = Http::timeout($timeoutSeconds)
                ->attach('file', file_get_contents($filePath), $originalName)
                ->post("{$this->baseUrl}/screening/score", $payload);

            if ($response->successful()) {
                return ['ok' => true, 'data' => $response->json(), 'error' => null];
            }

            $body = $response->json();
            $detail = is_array($body) ? ($body['detail'] ?? $response->body()) : $response->body();

            return [
                'ok' => false,
                'data' => null,
                'error' => "NLP service returned HTTP {$response->status()}: "
                    . (is_string($detail) ? mb_substr($detail, 0, 500) : json_encode($detail)),
            ];
        } catch (\Throwable $e) {
            Log::error("Failed to connect to NLP screening service: " . $e->getMessage());

            return [
                'ok' => false,
                'data' => null,
                'error' => 'Could not reach the NLP screening service: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Liveness probe used by the frontend to warn before running screening offline.
     */
    public function healthy(): bool
    {
        try {
            return (bool) Http::timeout(5)->get("{$this->baseUrl}/health")->successful();
        } catch (\Throwable) {
            return false;
        }
    }
}
