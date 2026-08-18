<?php

namespace Modules\ApplicantManagement\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApplicantScreeningScore extends Model
{
    protected $table = 'applicant_screening_scores';
    protected $primaryKey = 'score_id';

    public $timestamps = false; // only created_at in schema

    protected $fillable = [
        'applicant_id',
        'criterion',
        'score',
    ];

    protected $casts = [
        'score'      => 'decimal:2',
        'created_at' => 'datetime',
    ];

    public function applicant(): BelongsTo
    {
        return $this->belongsTo(Applicant::class, 'applicant_id', 'applicant_id');
    }
}
