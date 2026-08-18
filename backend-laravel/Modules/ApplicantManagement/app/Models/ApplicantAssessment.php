<?php

namespace Modules\ApplicantManagement\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApplicantAssessment extends Model
{
    protected $table = 'applicant_assessments';
    protected $primaryKey = 'assessment_id';

    protected $fillable = [
        'applicant_id',
        'assessor_user_id',
        'assessment_date',
        'scores_json',
        'total_score',
        'outcome',
        'remarks',
    ];

    protected $casts = [
        'scores_json'     => 'array',
        'total_score'     => 'decimal:2',
        'assessment_date' => 'date',
    ];

    /* ------------------------------------------------------------------ */
    /* Relationships                                                         */
    /* ------------------------------------------------------------------ */

    public function applicant(): BelongsTo
    {
        return $this->belongsTo(Applicant::class, 'applicant_id', 'applicant_id');
    }
}
