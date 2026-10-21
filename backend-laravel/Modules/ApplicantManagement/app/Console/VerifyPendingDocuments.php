<?php

namespace Modules\ApplicantManagement\Console;

use Illuminate\Console\Command;
use Modules\ApplicantManagement\Models\Applicant;
use Modules\ApplicantManagement\Services\DocumentVerificationService;
use Modules\ApplicantManagement\Services\ScreeningService;

/**
 * Backfill for supporting documents that were never compared to the resume.
 *
 * Public landing applications upload the COE / Certificate / Credential files
 * BEFORE the resume is screened, so at upload time there was no resume profile
 * to compare against and the document stayed at PENDING. New applications are
 * handled automatically by ScreeningService::screenAndPersist(); this command
 * repairs the ones that were created before that fix, so their
 * "Resume vs Documents Match" panel and ranking are populated too.
 */
class VerifyPendingDocuments extends Command
{
    protected $signature = 'applicants:verify-pending-documents
        {--applicant= : Only process this applicant_id}
        {--dry-run : List the applicants that would be processed without calling the NLP service}';

    protected $description = 'Verify supporting documents still unchecked against an applicant\'s resume screening';

    public function handle(DocumentVerificationService $documents, ScreeningService $screening): int
    {
        $query = Applicant::query()
            ->whereHas('documents', function ($query) {
                $query->whereIn('verification_status', DocumentVerificationService::PENDING_STATUSES)
                    ->orWhereNull('verification_status');
            })
            ->whereHas('screenings', fn ($query) => $query->whereNotNull('profile_json'));

        if ($applicantId = $this->option('applicant')) {
            $query->where('applicant_id', (int) $applicantId);
        }

        $applicants = $query->orderBy('applicant_id')->get();

        if ($applicants->isEmpty()) {
            $this->info('No unchecked supporting documents found.');

            return self::SUCCESS;
        }

        if ($this->option('dry-run')) {
            $this->table(
                ['Applicant', 'Name', 'Pending documents'],
                $applicants->map(fn (Applicant $applicant) => [
                    $applicant->applicant_id,
                    $applicant->name,
                    $applicant->documents()
                        ->where(function ($query) {
                            $query->whereIn('verification_status', DocumentVerificationService::PENDING_STATUSES)
                                ->orWhereNull('verification_status');
                        })
                        ->count(),
                ])->all()
            );

            return self::SUCCESS;
        }

        $progress = $this->output->createProgressBar($applicants->count());
        $progress->start();

        $checked = 0;
        $recomputed = 0;

        foreach ($applicants as $applicant) {
            $verified = $documents->verifyPendingDocuments($applicant);

            if ($verified > 0) {
                $checked += $verified;
                if ($screening->recomputeWithDocuments($applicant)) {
                    $recomputed++;
                }
            }

            $progress->advance();
        }

        $progress->finish();
        $this->newLine(2);
        $this->info(sprintf(
            'Verified %d document(s) for %d applicant(s); ranking recomputed for %d applicant(s).',
            $checked,
            $applicants->count(),
            $recomputed
        ));

        return self::SUCCESS;
    }
}
