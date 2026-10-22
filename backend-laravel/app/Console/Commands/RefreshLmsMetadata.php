<?php

namespace App\Console\Commands;

use App\Services\HandbookTextCleaner;
use App\Services\LmsQuizGenerator;
use App\Services\NlpService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

/**
 * Refresh page count and reading time for file-based LMS handbooks.
 *
 * Text-based courses derive their metadata from content_text on first open;
 * file-based courses need one extraction pass so the cards can show a real page
 * count before any employee opens the player.
 */
class RefreshLmsMetadata extends Command
{
    protected $signature = 'lms:refresh-metadata {--course= : Only refresh this course code}';

    protected $description = 'Extract file-based LMS handbooks and refresh page/read-time metadata.';

    public function handle(NlpService $nlp): int
    {
        $query = DB::table('learning_courses')->whereNotNull('material_path');

        if ($code = $this->option('course')) {
            $query->where('course_code', $code);
        }

        $courses = $query->get();

        if ($courses->isEmpty()) {
            $this->warn('No file-based courses found.');

            return self::SUCCESS;
        }

        foreach ($courses as $course) {
            $relative = ltrim((string) $course->material_path, '/');
            if (str_starts_with($relative, 'storage/')) {
                $relative = substr($relative, strlen('storage/'));
            }

            if (! Storage::disk('public')->exists($relative)) {
                $this->error("{$course->course_code}: missing file {$relative}");

                continue;
            }

            $result = $nlp->extractDocumentText(
                Storage::disk('public')->path($relative),
                basename($relative),
            );

            $text = HandbookTextCleaner::clean((string) data_get($result, 'data.text', ''));
            if (! ($result['ok'] ?? false) || $text === '') {
                $this->error("{$course->course_code}: extraction failed - ".($result['error'] ?? 'no text'));

                continue;
            }

            $pages = (int) data_get($result, 'data.page_count', 0) ?: null;
            $minutes = max(1, (int) ceil(str_word_count(strip_tags($text)) / 200));

            DB::table('learning_courses')->where('course_id', $course->course_id)->update([
                'content_text' => $text,
                'estimated_pages' => $pages,
                'estimated_reading_minutes' => $minutes,
            ]);

            $this->info("{$course->course_code}: {$pages} pages, {$minutes} min");

            // Pre-warm the quiz so the employee's first open is instant rather
            // than a synchronous (and slow) AI call inside the request.
            if (empty($course->quiz_json) && $this->cacheQuiz($course, $text)) {
                $this->info("  quiz cached for {$course->course_code}");
            }
        }

        return self::SUCCESS;
    }

    /**
     * Build + persist the canonical quiz bank for a course. Uses the shared AI
     * chain but always falls back to the deterministic bank, and is bounded by
     * the generator's wall-clock budget.
     */
    private function cacheQuiz(object $course, string $text): bool
    {
        $generated = app(LmsQuizGenerator::class)->generate(
            (string) $course->title,
            $course->category ?? null,
            $text,
            (int) config('services.ess_lms.question_count', 10),
        );

        if (! ($generated['ok'] ?? false)) {
            $this->warn("  quiz generation failed for {$course->course_code}: ".($generated['error'] ?? 'unknown'));

            return false;
        }

        DB::table('learning_courses')->where('course_id', $course->course_id)->update([
            'quiz_json' => json_encode([
                'pass_mark' => (int) config('services.ess_lms.pass_mark', 80),
                'time_limit_seconds' => (int) config('services.ess_lms.time_limit_seconds', 600),
                'generated_by' => $generated['generated_by'] ?? 'ai',
                'questions' => $generated['questions'],
            ]),
            'quiz_generated_at' => now(),
        ]);

        return true;
    }
}
