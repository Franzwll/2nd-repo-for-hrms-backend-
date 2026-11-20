<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * DB consolidation – Phase 2e.
     *
     * Merges five recruitment evaluation tables into `applicant_evaluations`:
     *
     *   applicant_assessments  → eval_type = 'interview_assessment'
     *   assessment_tests       → eval_type = 'assessment_test'
     *   practical_tests        → eval_type = 'practical_test'
     *   final_evaluations      → eval_type = 'final_evaluation'
     *   assessment_invites     → eval_type = 'assessment_invite'
     *
     * All five Eloquent models remain in place with global scopes on `eval_type`,
     * maintaining full backward compatibility for controllers, resources, and API responses.
     */
    public const INTERVIEW_ASSESSMENT = 'interview_assessment';

    public const ASSESSMENT_TEST = 'assessment_test';

    public const PRACTICAL_TEST = 'practical_test';

    public const FINAL_EVALUATION = 'final_evaluation';

    public const ASSESSMENT_INVITE = 'assessment_invite';

    public function up(): void
    {
        if (! Schema::hasTable('applicant_assessments')
            && ! Schema::hasTable('assessment_tests')
            && ! Schema::hasTable('practical_tests')
            && ! Schema::hasTable('final_evaluations')
            && ! Schema::hasTable('assessment_invites')) {
            return;
        }

        if (Schema::hasTable('applicant_evaluations')) {
            throw new RuntimeException(
                'Phase 2e cannot start: applicant_evaluations already exists. Resolve the partial migration first.'
            );
        }

        $this->createApplicantEvaluationsTable();

        $expectedInterview = $this->copyInterviewAssessments();
        $expectedAssessment = $this->copyAssessmentTests();
        $expectedPractical = $this->copyPracticalTests();
        $expectedFinal = $this->copyFinalEvaluations();
        $expectedInvite = $this->copyAssessmentInvites();

        $this->assertCopied(self::INTERVIEW_ASSESSMENT, $expectedInterview);
        $this->assertCopied(self::ASSESSMENT_TEST, $expectedAssessment);
        $this->assertCopied(self::PRACTICAL_TEST, $expectedPractical);
        $this->assertCopied(self::FINAL_EVALUATION, $expectedFinal);
        $this->assertCopied(self::ASSESSMENT_INVITE, $expectedInvite);

        Schema::dropIfExists('assessment_invites');
        Schema::dropIfExists('final_evaluations');
        Schema::dropIfExists('practical_tests');
        Schema::dropIfExists('assessment_tests');
        Schema::dropIfExists('applicant_assessments');
    }

    public function down(): void
    {
        if (! Schema::hasTable('applicant_evaluations')) {
            return;
        }

        $this->createApplicantAssessmentsTable();
        $this->createAssessmentTestsTable();
        $this->createPracticalTestsTable();
        $this->createFinalEvaluationsTable();
        $this->createAssessmentInvitesTable();

        $expectedInterview = $this->countEvaluations(self::INTERVIEW_ASSESSMENT);
        $expectedAssessment = $this->countEvaluations(self::ASSESSMENT_TEST);
        $expectedPractical = $this->countEvaluations(self::PRACTICAL_TEST);
        $expectedFinal = $this->countEvaluations(self::FINAL_EVALUATION);
        $expectedInvite = $this->countEvaluations(self::ASSESSMENT_INVITE);

        $this->restoreInterviewAssessments();
        $this->restoreAssessmentTests();
        $this->restorePracticalTests();
        $this->restoreFinalEvaluations();
        $this->restoreAssessmentInvites();

        $this->assertRestored('applicant_assessments', $expectedInterview);
        $this->assertRestored('assessment_tests', $expectedAssessment);
        $this->assertRestored('practical_tests', $expectedPractical);
        $this->assertRestored('final_evaluations', $expectedFinal);
        $this->assertRestored('assessment_invites', $expectedInvite);

        Schema::dropIfExists('applicant_evaluations');
    }

    private function createApplicantEvaluationsTable(): void
    {
        Schema::create('applicant_evaluations', function (Blueprint $table) {
            $table->id('evaluation_id');
            $table->string('eval_type', 30);
            $table->unsignedBigInteger('original_id')->nullable();
            $table->unsignedBigInteger('applicant_id');
            $table->unsignedBigInteger('assessor_user_id')->nullable();
            $table->date('evaluation_date')->nullable();

            // Titles and labels
            $table->string('title', 190)->nullable();

            // Scores and results
            $table->decimal('total_score', 5, 2)->nullable();
            $table->decimal('passing_score', 5, 2)->nullable();
            $table->string('result', 20)->nullable();
            $table->string('outcome', 30)->nullable();
            $table->text('remarks')->nullable();

            // Structured payloads
            $table->json('scores_json')->nullable();
            $table->json('comments_json')->nullable();
            $table->json('questions_json')->nullable();
            $table->json('criteria_json')->nullable();
            $table->json('answers_json')->nullable();

            // Assessment invite specific
            $table->string('token', 64)->nullable()->unique();
            $table->string('status', 20)->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('submitted_at')->nullable();

            // Final evaluation snapshot and recommendation fields
            $table->decimal('screening_score', 5, 2)->nullable();
            $table->string('screening_status', 40)->nullable();
            $table->decimal('interview_score', 5, 2)->nullable();
            $table->string('interview_result', 10)->nullable();
            $table->decimal('assessment_test_score', 5, 2)->nullable();
            $table->string('assessment_test_result', 10)->nullable();
            $table->boolean('practical_required')->default(false);
            $table->decimal('practical_test_score', 5, 2)->nullable();
            $table->string('practical_test_result', 10)->nullable();
            $table->decimal('overall_score', 5, 2)->nullable();
            $table->json('score_breakdown_json')->nullable();
            $table->string('recommendation', 30)->nullable();
            $table->unsignedBigInteger('recommended_job_post_id')->nullable();
            $table->string('recommended_position_title', 190)->nullable();

            $table->json('details_json')->nullable();

            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->nullable();

            $table->index(['applicant_id', 'eval_type'], 'idx_applicant_evaluations_applicant_type');
            $table->index(['eval_type', 'created_at'], 'idx_applicant_evaluations_type_created');
            $table->index('assessor_user_id', 'idx_applicant_evaluations_assessor');
            $table->index('evaluation_date', 'idx_applicant_evaluations_date');
            $table->index('status', 'idx_applicant_evaluations_status');

            $table->foreign('applicant_id', 'fk_applicant_evaluations_applicant_id')
                ->references('applicant_id')->on('applicants')
                ->onDelete('cascade');

            $table->foreign('assessor_user_id', 'fk_applicant_evaluations_assessor_user_id')
                ->references('system_user_id')->on('system_users')
                ->onDelete('set null');

            $table->foreign('recommended_job_post_id', 'fk_applicant_evaluations_recommended_post')
                ->references('job_post_id')->on('job_posts')
                ->onDelete('set null');
        });

        DB::statement(
            "ALTER TABLE `applicant_evaluations` ADD CONSTRAINT `chk_applicant_evaluations_eval_type` "
            . "CHECK (`eval_type` IN ('interview_assessment', 'assessment_test', 'practical_test', 'final_evaluation', 'assessment_invite'))"
        );
    }

    private function copyInterviewAssessments(): int
    {
        if (! Schema::hasTable('applicant_assessments')) {
            return 0;
        }

        $expected = DB::table('applicant_assessments')->count();

        DB::table('applicant_assessments')->chunkById(500, function ($rows) {
            $insert = [];

            foreach ($rows as $row) {
                $insert[] = [
                    'eval_type' => self::INTERVIEW_ASSESSMENT,
                    'original_id' => $row->assessment_id,
                    'applicant_id' => $row->applicant_id,
                    'assessor_user_id' => $row->assessor_user_id,
                    'evaluation_date' => $row->assessment_date,
                    'total_score' => $row->total_score,
                    'outcome' => $row->outcome,
                    'result' => $row->result,
                    'remarks' => $row->remarks,
                    'scores_json' => $row->scores_json,
                    'comments_json' => $row->comments_json ?? null,
                    'created_at' => $row->created_at ?? now(),
                    'updated_at' => $row->updated_at,
                ];
            }

            if ($insert !== []) {
                DB::table('applicant_evaluations')->insert($insert);
            }
        }, 'assessment_id');

        return $expected;
    }

    private function copyAssessmentTests(): int
    {
        if (! Schema::hasTable('assessment_tests')) {
            return 0;
        }

        $expected = DB::table('assessment_tests')->count();

        DB::table('assessment_tests')->chunkById(500, function ($rows) {
            $insert = [];

            foreach ($rows as $row) {
                $insert[] = [
                    'eval_type' => self::ASSESSMENT_TEST,
                    'original_id' => $row->assessment_test_id,
                    'applicant_id' => $row->applicant_id,
                    'assessor_user_id' => $row->assessor_user_id,
                    'evaluation_date' => $row->test_date,
                    'title' => $row->test_title,
                    'questions_json' => $row->questions_json,
                    'scores_json' => $row->scores_json,
                    'total_score' => $row->total_score,
                    'passing_score' => $row->passing_score ?? 75.00,
                    'result' => $row->result,
                    'remarks' => $row->remarks,
                    'created_at' => $row->created_at ?? now(),
                    'updated_at' => $row->updated_at,
                ];
            }

            if ($insert !== []) {
                DB::table('applicant_evaluations')->insert($insert);
            }
        }, 'assessment_test_id');

        return $expected;
    }

    private function copyPracticalTests(): int
    {
        if (! Schema::hasTable('practical_tests')) {
            return 0;
        }

        $expected = DB::table('practical_tests')->count();

        DB::table('practical_tests')->chunkById(500, function ($rows) {
            $insert = [];

            foreach ($rows as $row) {
                $insert[] = [
                    'eval_type' => self::PRACTICAL_TEST,
                    'original_id' => $row->practical_test_id,
                    'applicant_id' => $row->applicant_id,
                    'assessor_user_id' => $row->assessor_user_id,
                    'evaluation_date' => $row->test_date,
                    'title' => $row->task_title,
                    'criteria_json' => $row->criteria_json,
                    'scores_json' => $row->scores_json,
                    'total_score' => $row->total_score,
                    'result' => $row->result,
                    'remarks' => $row->remarks,
                    'created_at' => $row->created_at ?? now(),
                    'updated_at' => $row->updated_at,
                ];
            }

            if ($insert !== []) {
                DB::table('applicant_evaluations')->insert($insert);
            }
        }, 'practical_test_id');

        return $expected;
    }

    private function copyFinalEvaluations(): int
    {
        if (! Schema::hasTable('final_evaluations')) {
            return 0;
        }

        $expected = DB::table('final_evaluations')->count();

        DB::table('final_evaluations')->chunkById(500, function ($rows) {
            $insert = [];

            foreach ($rows as $row) {
                $insert[] = [
                    'eval_type' => self::FINAL_EVALUATION,
                    'original_id' => $row->final_evaluation_id,
                    'applicant_id' => $row->applicant_id,
                    'assessor_user_id' => $row->evaluated_by_user_id,
                    'evaluation_date' => $row->evaluation_date,
                    'screening_score' => $row->screening_score,
                    'screening_status' => $row->screening_status,
                    'interview_score' => $row->interview_score,
                    'interview_result' => $row->interview_result,
                    'assessment_test_score' => $row->assessment_test_score,
                    'assessment_test_result' => $row->assessment_test_result,
                    'practical_required' => $row->practical_required ?? false,
                    'practical_test_score' => $row->practical_test_score,
                    'practical_test_result' => $row->practical_test_result,
                    'overall_score' => $row->overall_score ?? null,
                    'score_breakdown_json' => $row->score_breakdown_json ?? null,
                    'recommendation' => $row->recommendation,
                    'recommended_job_post_id' => $row->recommended_job_post_id ?? null,
                    'recommended_position_title' => $row->recommended_position_title ?? null,
                    'remarks' => $row->overall_remarks,
                    'created_at' => $row->created_at ?? now(),
                    'updated_at' => $row->updated_at,
                ];
            }

            if ($insert !== []) {
                DB::table('applicant_evaluations')->insert($insert);
            }
        }, 'final_evaluation_id');

        return $expected;
    }

    private function copyAssessmentInvites(): int
    {
        if (! Schema::hasTable('assessment_invites')) {
            return 0;
        }

        $expected = DB::table('assessment_invites')->count();

        DB::table('assessment_invites')->chunkById(500, function ($rows) {
            $insert = [];

            foreach ($rows as $row) {
                $insert[] = [
                    'eval_type' => self::ASSESSMENT_INVITE,
                    'original_id' => $row->assessment_invite_id,
                    'token' => $row->token,
                    'applicant_id' => $row->applicant_id,
                    'assessor_user_id' => $row->created_by_user_id,
                    'title' => $row->test_title,
                    'questions_json' => $row->questions_json,
                    'answers_json' => $row->answers_json,
                    'passing_score' => $row->passing_score ?? 75.00,
                    'total_score' => $row->total_score,
                    'result' => $row->result,
                    'status' => $row->status ?? 'Pending',
                    'expires_at' => $row->expires_at,
                    'submitted_at' => $row->submitted_at,
                    'created_at' => $row->created_at ?? now(),
                    'updated_at' => $row->updated_at,
                ];
            }

            if ($insert !== []) {
                DB::table('applicant_evaluations')->insert($insert);
            }
        }, 'assessment_invite_id');

        return $expected;
    }

    private function createApplicantAssessmentsTable(): void
    {
        if (Schema::hasTable('applicant_assessments')) {
            return;
        }

        Schema::create('applicant_assessments', function (Blueprint $table) {
            $table->id('assessment_id');
            $table->unsignedBigInteger('applicant_id');
            $table->unsignedBigInteger('assessor_user_id')->nullable();
            $table->date('assessment_date');
            $table->json('scores_json')->nullable();
            $table->json('comments_json')->nullable();
            $table->decimal('total_score', 5, 2)->nullable();
            $table->string('outcome', 20);
            $table->string('result', 10)->nullable();
            $table->text('remarks')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

            $table->index('applicant_id', 'idx_applicant_assessments_applicant_id');
            $table->index('assessor_user_id', 'idx_applicant_assessments_assessor_user_id');

            $table->foreign('applicant_id', 'fk_applicant_assessments_applicant_id')
                ->references('applicant_id')->on('applicants')->onDelete('cascade');
            $table->foreign('assessor_user_id', 'fk_applicant_assessments_assessor_user_id')
                ->references('system_user_id')->on('system_users');
        });

        DB::statement("ALTER TABLE `applicant_assessments` ADD CONSTRAINT `chk_applicant_assessments_outcome` CHECK (`outcome` IN ('Recommended', 'Hold', 'Not Recommended'))");
        DB::statement("ALTER TABLE `applicant_assessments` ADD CONSTRAINT `chk_applicant_assessments_result` CHECK (`result` IS NULL OR `result` IN ('Passed', 'Failed'))");
    }

    private function createAssessmentTestsTable(): void
    {
        if (Schema::hasTable('assessment_tests')) {
            return;
        }

        Schema::create('assessment_tests', function (Blueprint $table) {
            $table->id('assessment_test_id');
            $table->unsignedBigInteger('applicant_id');
            $table->unsignedBigInteger('assessor_user_id')->nullable();
            $table->string('test_title', 190);
            $table->json('questions_json')->nullable();
            $table->json('scores_json')->nullable();
            $table->decimal('total_score', 5, 2)->nullable();
            $table->decimal('passing_score', 5, 2)->default(75.00);
            $table->string('result', 10);
            $table->date('test_date');
            $table->text('remarks')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

            $table->index('applicant_id', 'idx_assessment_tests_applicant_id');
            $table->index('assessor_user_id', 'idx_assessment_tests_assessor_user_id');
            $table->index('test_date', 'idx_assessment_tests_test_date');

            $table->foreign('applicant_id', 'fk_assessment_tests_applicant_id')
                ->references('applicant_id')->on('applicants')->onDelete('cascade');
            $table->foreign('assessor_user_id', 'fk_assessment_tests_assessor_user_id')
                ->references('system_user_id')->on('system_users');
        });

        DB::statement("ALTER TABLE `assessment_tests` ADD CONSTRAINT `chk_assessment_tests_result` CHECK (`result` IN ('Passed', 'Failed'))");
    }

    private function createPracticalTestsTable(): void
    {
        if (Schema::hasTable('practical_tests')) {
            return;
        }

        Schema::create('practical_tests', function (Blueprint $table) {
            $table->id('practical_test_id');
            $table->unsignedBigInteger('applicant_id');
            $table->unsignedBigInteger('assessor_user_id')->nullable();
            $table->string('task_title', 190);
            $table->json('criteria_json')->nullable();
            $table->json('scores_json')->nullable();
            $table->decimal('total_score', 5, 2)->nullable();
            $table->string('result', 10);
            $table->date('test_date');
            $table->text('remarks')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

            $table->index('applicant_id', 'idx_practical_tests_applicant_id');
            $table->index('assessor_user_id', 'idx_practical_tests_assessor_user_id');
            $table->index('test_date', 'idx_practical_tests_test_date');

            $table->foreign('applicant_id', 'fk_practical_tests_applicant_id')
                ->references('applicant_id')->on('applicants')->onDelete('cascade');
            $table->foreign('assessor_user_id', 'fk_practical_tests_assessor_user_id')
                ->references('system_user_id')->on('system_users');
        });

        DB::statement("ALTER TABLE `practical_tests` ADD CONSTRAINT `chk_practical_tests_result` CHECK (`result` IN ('Passed', 'Failed'))");
    }

    private function createFinalEvaluationsTable(): void
    {
        if (Schema::hasTable('final_evaluations')) {
            return;
        }

        Schema::create('final_evaluations', function (Blueprint $table) {
            $table->id('final_evaluation_id');
            $table->unsignedBigInteger('applicant_id');
            $table->unsignedBigInteger('evaluated_by_user_id')->nullable();
            $table->date('evaluation_date');

            $table->decimal('screening_score', 5, 2)->nullable();
            $table->string('screening_status', 40)->nullable();
            $table->decimal('interview_score', 5, 2)->nullable();
            $table->string('interview_result', 10)->nullable();
            $table->decimal('assessment_test_score', 5, 2)->nullable();
            $table->string('assessment_test_result', 10)->nullable();
            $table->boolean('practical_required')->default(false);
            $table->decimal('practical_test_score', 5, 2)->nullable();
            $table->string('practical_test_result', 10)->nullable();
            $table->decimal('overall_score', 5, 2)->nullable();
            $table->json('score_breakdown_json')->nullable();

            $table->string('recommendation', 30);
            $table->unsignedBigInteger('recommended_job_post_id')->nullable();
            $table->string('recommended_position_title', 190)->nullable();
            $table->text('overall_remarks')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

            $table->unique('applicant_id', 'uq_final_evaluations_applicant_id');
            $table->index('evaluated_by_user_id', 'idx_final_evaluations_evaluated_by');
            $table->index('evaluation_date', 'idx_final_evaluations_evaluation_date');

            $table->foreign('applicant_id', 'fk_final_evaluations_applicant_id')
                ->references('applicant_id')->on('applicants')->onDelete('cascade');
            $table->foreign('evaluated_by_user_id', 'fk_final_evaluations_evaluated_by')
                ->references('system_user_id')->on('system_users');
        });

        DB::statement("ALTER TABLE `final_evaluations` ADD CONSTRAINT `chk_final_evaluations_recommendation` CHECK (`recommendation` IN ('Recommended for Hire', 'For Another Position', 'Not Recommended'))");
        DB::statement("ALTER TABLE `final_evaluations` ADD CONSTRAINT `chk_final_evaluations_results` CHECK (`interview_result` IN ('Passed', 'Failed') AND `assessment_test_result` IN ('Passed', 'Failed') AND (`practical_test_result` IS NULL OR `practical_test_result` IN ('Passed', 'Failed')))");
    }

    private function createAssessmentInvitesTable(): void
    {
        if (Schema::hasTable('assessment_invites')) {
            return;
        }

        Schema::create('assessment_invites', function (Blueprint $table) {
            $table->id('assessment_invite_id');
            $table->string('token', 64)->unique();
            $table->unsignedBigInteger('applicant_id');
            $table->unsignedBigInteger('created_by_user_id')->nullable();
            $table->string('test_title', 190);
            $table->json('questions_json');
            $table->json('answers_json')->nullable();
            $table->decimal('passing_score', 5, 2)->default(75.00);
            $table->decimal('total_score', 5, 2)->nullable();
            $table->string('result', 10)->nullable();
            $table->string('status', 20)->default('Pending');
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

            $table->index('applicant_id', 'idx_assessment_invites_applicant_id');
            $table->index('status', 'idx_assessment_invites_status');

            $table->foreign('applicant_id', 'fk_assessment_invites_applicant_id')
                ->references('applicant_id')->on('applicants')->onDelete('cascade');
            $table->foreign('created_by_user_id', 'fk_assessment_invites_created_by_user_id')
                ->references('system_user_id')->on('system_users');
        });
    }

    private function restoreInterviewAssessments(): void
    {
        DB::table('applicant_evaluations')
            ->where('eval_type', self::INTERVIEW_ASSESSMENT)
            ->orderBy('evaluation_id')
            ->chunk(500, function ($rows) {
                $insert = [];

                foreach ($rows as $row) {
                    $record = [
                        'applicant_id' => $row->applicant_id,
                        'assessor_user_id' => $row->assessor_user_id,
                        'assessment_date' => $row->evaluation_date,
                        'scores_json' => $row->scores_json,
                        'comments_json' => $row->comments_json,
                        'total_score' => $row->total_score,
                        'outcome' => $row->outcome ?? 'Recommended',
                        'result' => $row->result,
                        'remarks' => $row->remarks,
                        'created_at' => $row->created_at,
                        'updated_at' => $row->updated_at,
                    ];
                    if ($row->original_id) {
                        $record['assessment_id'] = $row->original_id;
                    }
                    $insert[] = $record;
                }

                if ($insert !== []) {
                    DB::table('applicant_assessments')->insert($insert);
                }
            });
    }

    private function restoreAssessmentTests(): void
    {
        DB::table('applicant_evaluations')
            ->where('eval_type', self::ASSESSMENT_TEST)
            ->orderBy('evaluation_id')
            ->chunk(500, function ($rows) {
                $insert = [];

                foreach ($rows as $row) {
                    $record = [
                        'applicant_id' => $row->applicant_id,
                        'assessor_user_id' => $row->assessor_user_id,
                        'test_title' => $row->title ?? '',
                        'questions_json' => $row->questions_json,
                        'scores_json' => $row->scores_json,
                        'total_score' => $row->total_score,
                        'passing_score' => $row->passing_score ?? 75.00,
                        'result' => $row->result ?? 'Passed',
                        'test_date' => $row->evaluation_date,
                        'remarks' => $row->remarks,
                        'created_at' => $row->created_at,
                        'updated_at' => $row->updated_at,
                    ];
                    if ($row->original_id) {
                        $record['assessment_test_id'] = $row->original_id;
                    }
                    $insert[] = $record;
                }

                if ($insert !== []) {
                    DB::table('assessment_tests')->insert($insert);
                }
            });
    }

    private function restorePracticalTests(): void
    {
        DB::table('applicant_evaluations')
            ->where('eval_type', self::PRACTICAL_TEST)
            ->orderBy('evaluation_id')
            ->chunk(500, function ($rows) {
                $insert = [];

                foreach ($rows as $row) {
                    $record = [
                        'applicant_id' => $row->applicant_id,
                        'assessor_user_id' => $row->assessor_user_id,
                        'task_title' => $row->title ?? '',
                        'criteria_json' => $row->criteria_json,
                        'scores_json' => $row->scores_json,
                        'total_score' => $row->total_score,
                        'result' => $row->result ?? 'Passed',
                        'test_date' => $row->evaluation_date,
                        'remarks' => $row->remarks,
                        'created_at' => $row->created_at,
                        'updated_at' => $row->updated_at,
                    ];
                    if ($row->original_id) {
                        $record['practical_test_id'] = $row->original_id;
                    }
                    $insert[] = $record;
                }

                if ($insert !== []) {
                    DB::table('practical_tests')->insert($insert);
                }
            });
    }

    private function restoreFinalEvaluations(): void
    {
        DB::table('applicant_evaluations')
            ->where('eval_type', self::FINAL_EVALUATION)
            ->orderBy('evaluation_id')
            ->chunk(500, function ($rows) {
                $insert = [];

                foreach ($rows as $row) {
                    $record = [
                        'applicant_id' => $row->applicant_id,
                        'evaluated_by_user_id' => $row->assessor_user_id,
                        'evaluation_date' => $row->evaluation_date,
                        'screening_score' => $row->screening_score,
                        'screening_status' => $row->screening_status,
                        'interview_score' => $row->interview_score,
                        'interview_result' => $row->interview_result,
                        'assessment_test_score' => $row->assessment_test_score,
                        'assessment_test_result' => $row->assessment_test_result,
                        'practical_required' => (bool) $row->practical_required,
                        'practical_test_score' => $row->practical_test_score,
                        'practical_test_result' => $row->practical_test_result,
                        'overall_score' => $row->overall_score,
                        'score_breakdown_json' => $row->score_breakdown_json,
                        'recommendation' => $row->recommendation ?? 'Recommended for Hire',
                        'recommended_job_post_id' => $row->recommended_job_post_id,
                        'recommended_position_title' => $row->recommended_position_title,
                        'overall_remarks' => $row->remarks,
                        'created_at' => $row->created_at,
                        'updated_at' => $row->updated_at,
                    ];
                    if ($row->original_id) {
                        $record['final_evaluation_id'] = $row->original_id;
                    }
                    $insert[] = $record;
                }

                if ($insert !== []) {
                    DB::table('final_evaluations')->insert($insert);
                }
            });
    }

    private function restoreAssessmentInvites(): void
    {
        DB::table('applicant_evaluations')
            ->where('eval_type', self::ASSESSMENT_INVITE)
            ->orderBy('evaluation_id')
            ->chunk(500, function ($rows) {
                $insert = [];

                foreach ($rows as $row) {
                    $record = [
                        'token' => $row->token,
                        'applicant_id' => $row->applicant_id,
                        'created_by_user_id' => $row->assessor_user_id,
                        'test_title' => $row->title ?? '',
                        'questions_json' => $row->questions_json,
                        'answers_json' => $row->answers_json,
                        'passing_score' => $row->passing_score ?? 75.00,
                        'total_score' => $row->total_score,
                        'result' => $row->result,
                        'status' => $row->status ?? 'Pending',
                        'expires_at' => $row->expires_at,
                        'submitted_at' => $row->submitted_at,
                        'created_at' => $row->created_at,
                        'updated_at' => $row->updated_at,
                    ];
                    if ($row->original_id) {
                        $record['assessment_invite_id'] = $row->original_id;
                    }
                    $insert[] = $record;
                }

                if ($insert !== []) {
                    DB::table('assessment_invites')->insert($insert);
                }
            });
    }

    private function countEvaluations(string $evalType): int
    {
        return DB::table('applicant_evaluations')->where('eval_type', $evalType)->count();
    }

    private function assertCopied(string $evalType, int $expected): void
    {
        $copied = $this->countEvaluations($evalType);

        if ($copied !== $expected) {
            throw new RuntimeException(
                "Phase 2e copy failed: expected {$expected} {$evalType} rows, copied {$copied}. "
                . 'The old evaluation tables were not dropped.'
            );
        }
    }

    private function assertRestored(string $table, int $expected): void
    {
        $restored = DB::table($table)->count();

        if ($restored !== $expected) {
            throw new RuntimeException(
                "Phase 2e rollback failed: expected {$expected} rows in {$table}, restored {$restored}. "
                . 'applicant_evaluations was not dropped.'
            );
        }
    }
};

