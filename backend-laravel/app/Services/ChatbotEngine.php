<?php

namespace App\Services;

use App\Models\ChatbotFaq;
use App\Models\ChatbotUnanswered;
use App\Models\JobPost;
use App\Models\SystemSetting;

class ChatbotEngine
{
    /** @var string[] */
    private const STARTERS = [
        'What jobs are open?',
        'How do I apply?',
        'What documents do I need?',
        'How long is the hiring process?',
    ];

    /** @var array<string, string[]> */
    private const INTENTS = [
        'open_jobs' => ['job', 'open', 'vacan', 'opening', 'are you hiring', 'you hiring', 'hiring now'],
        'apply' => ['apply', 'application', 'form', 'submit', 'sign up', 'register'],
        'documents' => ['document', 'requirement', 'paper', 'id', 'certificate', 'clearance', 'prepar'],
        'resume' => ['resume', 'cv', 'screen', 'nlp', 'ner', 'parse', 'spacy', 'match', 'score'],
        'timeline' => ['long', 'process', 'how soon', 'when', 'interview', 'step', 'day', 'week', 'timeline', 'shortlist', 'hear back', 'notified'],
        'salary' => ['salary', 'pay', 'compensation', 'wage', 'rate', 'earn', 'income', 'money'],
        'benefits' => ['benefit', 'hmo', 'allowance', 'meal', 'perk', 'insurance', 'leave', 'dependents'],
        'experience' => ['experience', 'entry', 'no experience', 'fresh', 'trainee', 'beginner', 'ojt'],
        'contact' => ['contact', 'hr', 'phone', 'email', 'address', 'location', 'visit', 'reach', 'walk in', 'hotline'],
        'about' => ['about', 'company', 'hotel', 'mission', 'vision', 'values', 'who are', 'what is oxford'],
        'hours' => ['hours', 'schedule', 'shift', 'time of day', 'when open'],
        'greeting' => ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'good day'],
        'thanks' => ['thank', 'thanks', 'appreciate'],
        'bye' => ['bye', 'goodbye', 'see you'],
    ];

    /** @var string[] */
    private const STOPWORDS = [
        'a', 'an', 'the', 'is', 'are', 'was', 'were', 'am', 'do', 'does', 'did',
        'i', 'me', 'my', 'we', 'you', 'your', 'for', 'about', 'tell', 'please',
        'can', 'could', 'to', 'of', 'in', 'on', 'at', 'and', 'or', 'it', 'with',
        'like', 'looking', 'want', 'any', 'there', 'where', 'when', 'who', 'which',
        'as', 'some', 'what', 'how', 'has', 'have', 'help', 'share',
    ];

    /**
     * @return array{reply: string, quick_replies: string[], topic: string|null}
     */
    public function respond(string $message, ?string $sessionId = null, ?string $topic = null): array
    {
        $jobs = $this->jobs();
        $company = $this->companyData();

        $role = $this->findRole($message, $jobs);
        $contextJob = $role ?? ($topic !== null ? $this->jobByTitle($jobs, $topic) : null);

        foreach (['thanks', 'bye'] as $intent) {
            if ($this->hasAny($message, self::INTENTS[$intent])) {
                return $intent === 'thanks'
                    ? $this->reply("You're welcome! Is there anything else I can help with?", null)
                    : $this->reply("Goodbye! Best of luck with your application — feel free to come back anytime.", null, ['What jobs are open?']);
            }
        }

        $handlers = [
            'open_jobs' => fn () => $this->openJobsReply($jobs, $company),
            'apply' => fn () => $this->applyReply($contextJob),
            'documents' => fn () => $this->documentsReply($contextJob),
            'salary' => fn () => $this->salaryReply($contextJob, $jobs),
            'benefits' => fn () => $this->benefitsReply($contextJob),
        ];

        foreach ($handlers as $intent => $handler) {
            if ($this->hasAny($message, self::INTENTS[$intent])) {
                return $handler();
            }
        }

        if ($role !== null) {
            return $this->reply($this->roleDetails($role), $role->title);
        }

        $faq = $this->matchFaq($message);
        if ($faq !== null) {
            return $this->reply($faq->answer, null);
        }

        $generic = [
            'timeline' => fn () => $this->reply(
                "Shortlisted applicants are usually contacted within 3–5 working days. The full process — resume screening, interview, practical assessment, and verification — typically takes two to three weeks.",
                null,
                ['How is my resume screened?', 'Contact HR']
            ),
            'resume' => fn () => $this->reply(
                "Your resume is parsed with spaCy-based NLP. Named Entity Recognition extracts your skills, work history, education, and certifications, then scores your match against the criteria HR set for that role — no manual screening of each resume.",
                null,
                ['How long is the hiring process?', 'What jobs are open?']
            ),
            'experience' => fn () => $this->reply(
                "Yes — Housekeeping and Food & Beverage roles accept entry-level applicants, and we provide paid on-the-job training. Fresh graduates are welcome to apply.",
                null,
                ['What jobs are open?', 'How do I apply?']
            ),
            'contact' => fn () => $this->reply(
                "You can reach HR at {$company['email']} or {$company['phone']}" . ($company['hours'] ? " ({$company['hours']})" : '') . ". You can also visit us at {$company['address']}.",
                null,
                ['What jobs are open?', 'How do I apply?']
            ),
            'about' => fn () => $this->reply(
                "{$company['about']}\n\nMission: {$company['mission']}\nVision: {$company['vision']}\nValues: " . implode(', ', $company['values']) . '.',
                null,
                ['What jobs are open?', 'How long is the hiring process?']
            ),
            'hours' => fn () => $this->reply(
                "Our HR team is available {$company['hours']} — but the chat is open around the clock. Want the full list of open roles?",
                null,
                ['What jobs are open?', 'Contact HR']
            ),
            'greeting' => fn () => $this->reply(
                "Hi there! I can help with open jobs, pay, required documents, the hiring timeline, and how to apply. What would you like to know?",
                null
            ),
        ];

        foreach ($generic as $intent => $handler) {
            if ($this->hasAny($message, self::INTENTS[$intent])) {
                return $handler();
            }
        }

        $this->logUnanswered($message, $sessionId);

        return $this->reply(
            "I'm still learning! I can help with open jobs, how to apply, required documents, resume screening, the hiring timeline, salary & benefits, and contact info. For anything else, email {$company['email']}.",
            null
        );
    }

    /* ------------------------------------------------------------------ */
    /* Reply builders                                                      */
    /* ------------------------------------------------------------------ */

    /**
     * @param string[] $quickReplies
     * @return array{reply: string, quick_replies: string[], topic: string|null}
     */
    private function reply(string $text, ?string $topic, array $quickReplies = []): array
    {
        return [
            'reply' => $text,
            'quick_replies' => $quickReplies ?: array_slice(self::STARTERS, 0, 3),
            'topic' => $topic,
        ];
    }

    private function roleDetails(JobPost $job): string
    {
        $lines = [
            "{$job->title} · " . ($job->department?->name ?? 'Various'),
            'Employment: ' . $job->employment_type . ($job->schedule ? " · {$job->schedule}" : ''),
            'Salary: ' . $this->salaryText($job),
            "Vacancies: {$job->vacancies} open" . ($job->filled_count ? " ({$job->filled_count} filled)" : ''),
        ];
        if ($job->experience_level) {
            $lines[] = "Experience: {$job->experience_level}";
        }
        if ($job->education_level) {
            $lines[] = "Education: {$job->education_level}";
        }
        if ($job->summary) {
            $lines[] = "About: {$job->summary}";
        }
        if (is_array($job->qualifications_json) && count($job->qualifications_json)) {
            $lines[] = 'Key requirements:';
            foreach (array_slice($job->qualifications_json, 0, 3) as $q) {
                $lines[] = "• {$q}";
            }
        }
        if (is_array($job->benefits_json) && count($job->benefits_json)) {
            $lines[] = 'Benefits: ' . implode(', ', $job->benefits_json);
        }

        return implode("\n", $lines);
    }

    private function openJobsReply($jobs, array $company): array
    {
        if (! count($jobs)) {
            return $this->reply(
                "We don't have any open positions right now — but check back soon, or email your resume to {$company['email']} and we'll keep it on file for future openings.",
                null,
                ['How do I apply?', 'Contact HR']
            );
        }

        $shown = array_slice($jobs->all(), 0, 6);
        $lines = ["We're currently hiring:"];
        foreach ($shown as $job) {
            $lines[] = "• {$job->title} (" . ($job->department?->name ?? 'Various') . ') — ' . $this->salaryText($job);
        }
        if (count($jobs) > count($shown)) {
            $lines[] = '…and ' . (count($jobs) - count($shown)) . ' more.';
        }
        $lines[] = 'Tap a role below to learn more.';

        $quick = [];
        foreach (array_slice($jobs->all(), 0, 4) as $job) {
            $quick[] = "Tell me about {$job->title}";
        }

        return $this->reply(implode("\n", $lines), null, $quick);
    }

    private function applyReply(?JobPost $job): array
    {
        $base = 'Head to the Find Jobs section, open the position you like, and fill in the application form on that page — full name, email, phone, location, and your resume file (PDF, DOC, or DOCX, up to 5MB). No account or sign-up needed.';

        return $this->reply(
            $job ? "To apply for {$job->title}: {$base}" : $base,
            $job?->title,
            ['What documents do I need?', 'How long is the hiring process?']
        );
    }

    private function documentsReply(?JobPost $job): array
    {
        $general = 'Prepare an updated resume, a valid government ID, NBI clearance, and role-specific certificates (such as TESDA NC II, food handler, or bartending licenses if required).';
        $extra = '';
        if ($job && is_array($job->qualifications_json) && count($job->qualifications_json)) {
            $extra = "\n\nFor {$job->title} specifically, we ask for: " . implode('; ', array_slice($job->qualifications_json, 0, 3)) . '.';
        }

        return $this->reply($general . $extra, $job?->title, ['How do I apply?']);
    }

    private function salaryReply(?JobPost $job, $jobs): array
    {
        if ($job !== null) {
            $benefits = is_array($job->benefits_json) && count($job->benefits_json)
                ? ' Benefits include: ' . implode(', ', $job->benefits_json) . '.'
                : '';

            return $this->reply(
                "{$job->title} pays {$this->salaryText($job)}.{$benefits}",
                $job->title,
                ['What documents do I need?', 'How do I apply?']
            );
        }

        $mins = array_values(array_filter(array_map(fn ($j) => (float) ($j->salary_min ?? 0), $jobs->all()), fn ($n) => $n > 0));
        $maxs = array_values(array_filter(array_map(fn ($j) => (float) ($j->salary_max ?? 0), $jobs->all()), fn ($n) => $n > 0));

        if (! count($mins)) {
            return $this->reply('Salaries vary by role and are discussed at interview.', null, $this->roleQuickReplies($jobs));
        }

        $range = 'From ' . $this->peso(min($mins)) . ' to ' . $this->peso(max($maxs)) . ' per month, depending on the role.';

        return $this->reply($range . ' Ask me about a specific role for its exact range.', null, $this->roleQuickReplies($jobs));
    }

    private function benefitsReply(?JobPost $job): array
    {
        $base = 'Teammates enjoy service charge, meal allowance, and HMO coverage after regularization, plus paid on-the-job training when you start.';
        $extra = '';
        if ($job && is_array($job->benefits_json) && count($job->benefits_json)) {
            $extra = "\n\n{$job->title} specifically lists: " . implode(', ', $job->benefits_json) . '.';
        }

        return $this->reply($base . $extra, $job?->title, ['What jobs are open?', 'How do I apply?']);
    }

    /* ------------------------------------------------------------------ */
    /* Matching helpers                                                    */
    /* ------------------------------------------------------------------ */

    private function normalize(string $text): string
    {
        $text = mb_strtolower($text);

        return trim((string) preg_replace('/\s+/', ' ', (string) preg_replace('/[^a-z0-9\s-]/', ' ', $text)));
    }

    /** @return string[] */
    private function queryTokens(string $text): array
    {
        $words = explode(' ', $this->normalize($text));

        return array_values(array_filter($words, fn ($w) => mb_strlen($w) > 1 && ! in_array($w, self::STOPWORDS, true)));
    }

    private function hasAny(string $text, array $keywords): bool
    {
        $t = $this->normalize($text);
        foreach ($keywords as $k) {
            if (str_contains($t, $k)) {
                return true;
            }
        }

        return false;
    }

    private function findRole(string $message, $jobs): ?JobPost
    {
        $tokens = $this->queryTokens($message);
        if (! $tokens) {
            return null;
        }

        $best = null;
        $bestScore = 0;
        foreach ($jobs as $job) {
            $pool = $this->queryTokens(implode(' ', array_merge(
                [$job->title],
                [$job->department?->name ?? ''],
                is_array($job->skills_json) ? $job->skills_json : [],
            )));
            $score = count(array_intersect($tokens, $pool));
            if ($score > $bestScore) {
                $bestScore = $score;
                $best = $job;
            }
        }

        if ($best === null) {
            return null;
        }

        $confident = $bestScore >= 2 || ($bestScore >= 1 && count($tokens) <= 2);

        return $confident ? $best : null;
    }

    private function jobByTitle($jobs, string $title): ?JobPost
    {
        foreach ($jobs as $job) {
            if (mb_strtolower($job->title) === mb_strtolower(trim($title))) {
                return $job;
            }
        }

        return null;
    }

    private function matchFaq(string $message): ?ChatbotFaq
    {
        $tokens = $this->queryTokens($message);
        if (! $tokens) {
            return null;
        }

        $best = null;
        $bestScore = 0;
        foreach (ChatbotFaq::where('enabled', true)->orderBy('sort_order')->get() as $faq) {
            $score = 0;
            foreach (array_filter(array_map('trim', explode(',', (string) $faq->keywords))) as $keyword) {
                $keyword = $this->normalize($keyword);
                if ($keyword !== '' && in_array($keyword, $tokens, true)) {
                    $score += 3;
                }
            }
            $score += count(array_intersect($tokens, $this->queryTokens($faq->question)));

            if ($score > $bestScore) {
                $bestScore = $score;
                $best = $faq;
            }
        }

        return $bestScore >= 3 ? $best : null;
    }

    private function logUnanswered(string $message, ?string $sessionId): void
    {
        ChatbotUnanswered::create([
            'session_id' => $sessionId,
            'message' => $message,
            'intent' => null,
        ]);
    }

    /* ------------------------------------------------------------------ */
    /* Data                                                                */
    /* ------------------------------------------------------------------ */

    private function jobs()
    {
        return JobPost::query()
            ->with(['department', 'position'])
            ->whereIn('status', ['published', 'Open'])
            ->where('active', 1)
            ->orderByDesc('posted_date')
            ->get();
    }

    /** @return array<string, mixed> */
    private function companyData(): array
    {
        $keys = [
            'company.name', 'company.timezone', 'company.address', 'company.phone',
            'company.email', 'company.hours', 'company.facilities', 'company.faqs', 'company.socials',
        ];
        $settings = SystemSetting::whereIn('setting_key', $keys)->pluck('setting_value', 'setting_key');

        $value = function (string $key, mixed $default) use ($settings) {
            $decoded = json_decode($settings[$key] ?? null, true);

            return is_array($decoded) ? ($decoded['value'] ?? $default) : $default;
        };

        return [
            'name' => $value('company.name', 'Oxford Suites Makati'),
            'address' => $value('company.address', '528 P. Burgos Street, Makati City, Metro Manila, Philippines 1210'),
            'phone' => $value('company.phone', '+63 2 8888 8688'),
            'email' => $value('company.email', 'hr@oxfordsuites.com.ph'),
            'hours' => $value('company.hours', '24 Hours'),
            'about' => 'Oxford Suites Makati is a boutique hotel delivering warm Filipino hospitality in the heart of Makati. We invest in our people because they are the heart of every guest experience.',
            'mission' => 'To provide outstanding service and create memorable experiences for every guest, while nurturing a workplace where every employee can grow and thrive.',
            'vision' => 'To be the preferred boutique hotel in the Philippines, known for genuine care, consistency, and an engaged, empowered workforce.',
            'values' => ['Care', 'Integrity', 'Excellence', 'Teamwork', 'Hospitality'],
        ];
    }

    /** @return string[] */
    private function roleQuickReplies($jobs): array
    {
        $quick = [];
        foreach (array_slice($jobs->all(), 0, 4) as $job) {
            $quick[] = "Tell me about {$job->title}";
        }

        return $quick;
    }

    private function salaryText(JobPost $job): string
    {
        $lo = (float) ($job->salary_min ?? 0);
        $hi = (float) ($job->salary_max ?? 0);
        if ($lo && $hi) {
            return $this->peso($lo) . ' – ' . $this->peso($hi) . '/month';
        }
        if ($lo) {
            return 'from ' . $this->peso($lo) . '/month';
        }

        return 'competitive (discussed at interview)';
    }

    private function peso(float $n): string
    {
        return '₱' . number_format($n, 2, '.', ',');
    }
}