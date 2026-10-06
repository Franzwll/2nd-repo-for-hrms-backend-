<?php

namespace Modules\ApplicantManagement\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PracticalTest extends Model
{
    protected $table = 'practical_tests';
    protected $primaryKey = 'practical_test_id';

    protected $fillable = [
        'applicant_id',
        'assessor_user_id',
        'task_title',
        'criteria_json',
        'scores_json',
        'total_score',
        'result',
        'test_date',
        'remarks',
    ];

    protected $casts = [
        'criteria_json' => 'array',
        'scores_json'   => 'array',
        'total_score'   => 'decimal:2',
        'test_date'     => 'date',
    ];

    /* ------------------------------------------------------------------ */
    /* Relationships                                                         */
    /* ------------------------------------------------------------------ */

    public function applicant(): BelongsTo
    {
        return $this->belongsTo(Applicant::class, 'applicant_id', 'applicant_id');
    }
}
