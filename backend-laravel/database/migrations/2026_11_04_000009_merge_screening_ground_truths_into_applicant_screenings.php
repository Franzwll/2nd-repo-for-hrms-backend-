<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Phase 5e: merge screening_ground_truths into applicant_screenings as
     * ground-truth columns. The truth is stored on the applicant's latest
     * screening for the job, or on a synthetic screening row when none exists.
     */
    public function up(): void
    {
        if (! Schema::hasTable('applicant_screenings')) {
            return;
        }

        $this->addTruthColumns();

        if (! Schema::hasTable('screening_ground_truths')) {
            return;
        }

        $truths = DB::table('screening_ground_truths')->orderBy('gt_id')->get();

        foreach ($truths as $truth) {
            $screeningId = DB::table('applicant_screenings')
                ->where('applicant_id', $truth->applicant_id)
                ->where('job_post_id', $truth->job_post_id)
                ->orderByDesc('screening_id')
                ->value('screening_id');

            if (! $screeningId) {
                $screeningId = DB::table('applicant_screenings')->insertGetId([
                    'applicant_id' => $truth->applicant_id,
                    'job_post_id' => $truth->job_post_id,
                    'processing_status' => 'PENDING',
                    'created_at' => $truth->created_at ?? now(),
                    'updated_at' => $truth->updated_at ?? now(),
                ]);
            }

            DB::table('applicant_screenings')->where('screening_id', $screeningId)->update([
                'true_screening_result' => $truth->true_screening_result,
                'true_qualification_score' => $truth->true_qualification_score,
                'true_missing_information_json' => $truth->true_missing_information_json,
                'true_unrecognized_skills_json' => $truth->true_unrecognized_skills_json,
                'ground_truth_notes' => $truth->notes,
                'ground_truth_recorded_at' => $truth->created_at ?? now(),
            ]);
        }

        Schema::dropIfExists('screening_ground_truths');
    }

    public function down(): void
    {
        if (! Schema::hasTable('applicant_screenings')) {
            return;
        }

        if (! Schema::hasTable('screening_ground_truths')) {
            Schema::create('screening_ground_truths', function (Blueprint $table) {
                $table->id('gt_id');
                $table->unsignedBigInteger('applicant_id');
                $table->unsignedBigInteger('job_post_id');
                $table->string('true_screening_result', 30);
                $table->decimal('true_qualification_score', 5, 2)->nullable();
                $table->json('true_missing_information_json')->nullable();
                $table->json('true_unrecognized_skills_json')->nullable();
                $table->text('notes')->nullable();
                $table->timestamp('created_at')->useCurrent();
                $table->timestamp('updated_at')->nullable()->useCurrentOnUpdate();

                $table->unique('applicant_id', 'uq_screening_ground_truths_applicant');

                $table->foreign('applicant_id', 'fk_screening_gt_applicant_id')
                    ->references('applicant_id')->on('applicants')->onDelete('cascade');
                $table->foreign('job_post_id', 'fk_screening_gt_job_post_id')
                    ->references('job_post_id')->on('job_posts')->onDelete('cascade');
            });
        }

        if (! Schema::hasColumn('applicant_screenings', 'true_screening_result')) {
            return;
        }

        $rows = DB::table('applicant_screenings')
            ->whereNotNull('true_screening_result')
            ->orderByDesc('screening_id')
            ->get()
            ->unique('applicant_id');

        foreach ($rows as $row) {
            DB::table('screening_ground_truths')->updateOrInsert(
                ['applicant_id' => $row->applicant_id],
                [
                    'job_post_id' => $row->job_post_id,
                    'true_screening_result' => $row->true_screening_result,
                    'true_qualification_score' => $row->true_qualification_score,
                    'true_missing_information_json' => $row->true_missing_information_json,
                    'true_unrecognized_skills_json' => $row->true_unrecognized_skills_json,
                    'notes' => $row->ground_truth_notes,
                    'created_at' => $row->ground_truth_recorded_at ?? $row->created_at ?? now(),
                    'updated_at' => $row->ground_truth_recorded_at ?? $row->updated_at ?? now(),
                ]
            );
        }

        $this->dropTruthColumns();
    }

    private function addTruthColumns(): void
    {
        Schema::table('applicant_screenings', function (Blueprint $table) {
            if (! Schema::hasColumn('applicant_screenings', 'true_screening_result')) {
                $table->string('true_screening_result', 30)->nullable()->after('screening_result');
            }
            if (! Schema::hasColumn('applicant_screenings', 'true_qualification_score')) {
                $table->decimal('true_qualification_score', 5, 2)->nullable()->after('true_screening_result');
            }
            if (! Schema::hasColumn('applicant_screenings', 'true_missing_information_json')) {
                $table->longText('true_missing_information_json')->nullable()->after('true_qualification_score');
            }
            if (! Schema::hasColumn('applicant_screenings', 'true_unrecognized_skills_json')) {
                $table->longText('true_unrecognized_skills_json')->nullable()->after('true_missing_information_json');
            }
            if (! Schema::hasColumn('applicant_screenings', 'ground_truth_notes')) {
                $table->text('ground_truth_notes')->nullable()->after('true_unrecognized_skills_json');
            }
            if (! Schema::hasColumn('applicant_screenings', 'ground_truth_recorded_at')) {
                $table->timestamp('ground_truth_recorded_at')->nullable()->after('ground_truth_notes');
            }
        });
    }

    private function dropTruthColumns(): void
    {
        Schema::table('applicant_screenings', function (Blueprint $table) {
            $table->dropColumn([
                'true_screening_result',
                'true_qualification_score',
                'true_missing_information_json',
                'true_unrecognized_skills_json',
                'ground_truth_notes',
                'ground_truth_recorded_at',
            ]);
        });
    }
};
