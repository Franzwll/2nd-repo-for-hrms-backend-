<?php

namespace Modules\ApplicantManagement\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AssessmentTest extends Model
{
    protected $table = 'assessment_tests';
    protected $primaryKey = 'assessment_test_id';

    protected $fillable = [
        'applicant_id',
        'assessor_user_id',
        'test_title',
        'questions_json',
        'scores_json',
        'total_score',
        'passing_score',
        'result',
        'test_date',
        'remarks',
    ];

    protected $casts = [
        'questions_json' => 'array',
        'scores_json'    => 'array',
        'total_score'    => 'decimal:2',
        'passing_score'  => 'decimal:2',
        'test_date'      => 'date',
    ];

    /* ------------------------------------------------------------------ */
    /* Relationships                                                         */
    /* ------------------------------------------------------------------ */

    public function applicant(): BelongsTo
    {
        return $this->belongsTo(Applicant::class, 'applicant_id', 'applicant_id');
    }
}
