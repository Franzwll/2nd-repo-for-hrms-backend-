<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EssRequestAttachment extends Model
{
    protected $table = 'ess_request_attachments';
    protected $primaryKey = 'ess_request_attachment_id';

    protected $fillable = [
        'ess_request_id',
        'direction',
        'source_module',
        'file_path',
        'original_name',
        'mime_type',
        'file_size_bytes',
        'uploaded_by_user_id',
    ];

    protected $casts = [
        'file_size_bytes' => 'integer',
    ];

    public function request(): BelongsTo
    {
        return $this->belongsTo(EssRequest::class, 'ess_request_id', 'ess_request_id');
    }

    public function uploadedBy(): BelongsTo
    {
        return $this->belongsTo(SystemUser::class, 'uploaded_by_user_id', 'system_user_id');
    }

    public function isHrFulfillment(): bool
    {
        return $this->direction === 'hr';
    }

    public function isModuleOutput(): bool
    {
        return $this->direction === 'hr' && $this->source_module !== null;
    }
}
