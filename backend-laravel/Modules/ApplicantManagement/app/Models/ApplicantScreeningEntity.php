<?php

namespace Modules\ApplicantManagement\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApplicantScreeningEntity extends Model
{
    protected $table = 'applicant_screening_entities';
    protected $primaryKey = 'entity_id';

    public $timestamps = false; // only created_at in schema

    protected $casts = [
        'created_at' => 'datetime',
    ];

    protected $fillable = [
        'applicant_id',
        'label',
        'value',
    ];

    public function applicant(): BelongsTo
    {
        return $this->belongsTo(Applicant::class, 'applicant_id', 'applicant_id');
    }
}
