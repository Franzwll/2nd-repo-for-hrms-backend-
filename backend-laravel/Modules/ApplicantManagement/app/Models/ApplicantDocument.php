<?php

namespace Modules\ApplicantManagement\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApplicantDocument extends Model
{
    protected $table = 'applicant_documents';
    protected $primaryKey = 'applicant_document_id';

    protected $fillable = [
        'applicant_id',
        'doc_type',
        'title',
        'original_copy',
        'file_path',
        'original_name',
        'verification_status',
        'verification_result_json',
        'extracted_profile_json',
        'verified_at',
    ];

    protected $casts = [
        'original_copy'            => 'boolean',
        'uploaded_at'              => 'datetime',
        'verification_result_json' => 'array',
        'extracted_profile_json'   => 'array',
        'verified_at'              => 'datetime',
    ];

    /* ------------------------------------------------------------------ */
    /* Relationships                                                         */
    /* ------------------------------------------------------------------ */

    public function applicant(): BelongsTo
    {
        return $this->belongsTo(Applicant::class, 'applicant_id', 'applicant_id');
    }
}
