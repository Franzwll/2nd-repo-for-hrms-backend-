<?php

namespace Modules\ApplicantManagement\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApplicantBlockHistory extends Model
{
    protected $table = 'applicant_block_history';
    protected $primaryKey = 'block_history_id';
    public $timestamps = false;

    protected $fillable = [
        'applicant_id',
        'action',
        'performed_by',
        'reason',
        'scope',
        'performed_at',
    ];

    protected $casts = [
        'performed_at' => 'datetime',
    ];

    public function applicant(): BelongsTo
    {
        return $this->belongsTo(Applicant::class, 'applicant_id', 'applicant_id');
    }
}

