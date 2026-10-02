<?php

namespace Modules\ApplicantManagement\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AssessmentInvite extends Model
{
    protected $table = 'assessment_invites';
    protected $primaryKey = 'assessment_invite_id';

    protected $fillable = [
        'token',
        'applicant_id',
        'created_by_user_id',
        'test_title',
        'questions_json',
        'answers_json',
        'passing_score',
        'total_score',
        'result',
        'status',
        'expires_at',
        'submitted_at',
    ];

    protected $casts = [
        'questions_json' => 'array',
        'answers_json'   => 'array',
        'passing_score'  => 'decimal:2',
        'total_score'    => 'decimal:2',
        'expires_at'     => 'datetime',
        'submitted_at'   => 'datetime',
    ];

    public function applicant(): BelongsTo
    {
        return $this->belongsTo(Applicant::class, 'applicant_id', 'applicant_id');
    }
}
