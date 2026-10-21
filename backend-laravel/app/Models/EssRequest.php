<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EssRequest extends Model
{
    protected $table = 'ess_requests';
    protected $primaryKey = 'ess_request_id';

    public $timestamps = true;

    protected $fillable = [
        'request_code',
        'employee_id',
        'category_id',
        'request_type',
        'filed_at',
        'date_from',
        'date_to',
        'status',
        'assigned_to_user_id',
        'details',
        'review_note',
        'returned_count',
        'attachment_path',
        'completed_at',
        'routed_module',
        'routed_at',
        'module_responded_at',
        'module_reference',
        'module_note',
        'released_at',
        'released_by_user_id',
    ];

    protected $casts = [
        'filed_at' => 'datetime',
        'date_from' => 'date',
        'date_to' => 'date',
        'returned_count' => 'integer',
        'completed_at' => 'datetime',
        'routed_at' => 'datetime',
        'module_responded_at' => 'datetime',
        'released_at' => 'datetime',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'employee_id', 'employee_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(EssCategory::class, 'category_id', 'ess_category_id');
    }

    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(SystemUser::class, 'assigned_to_user_id', 'system_user_id');
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(EssRequestAttachment::class, 'ess_request_id', 'ess_request_id')
            ->orderBy('ess_request_attachment_id');
    }

    public function statusHistory(): HasMany
    {
        return $this->hasMany(EssRequestStatusHistory::class, 'ess_request_id', 'ess_request_id')
            ->orderBy('ess_request_status_history_id');
    }

    public function routings(): HasMany
    {
        return $this->hasMany(EssRequestRouting::class, 'ess_request_id', 'ess_request_id')
            ->orderBy('leg')
            ->orderBy('ess_request_routing_id');
    }

    public function releasedBy(): BelongsTo
    {
        return $this->belongsTo(SystemUser::class, 'released_by_user_id', 'system_user_id');
    }

    /**
     * Convenience: the file the employee can download after release.
     */
    public function fulfillmentAttachment(): ?EssRequestAttachment
    {
        return $this->attachments
            ->firstWhere('direction', 'hr');
    }

    public function outboundAttachment(): ?EssRequestAttachment
    {
        return $this->fulfillmentAttachment();
    }

    public function isWithModule(): bool
    {
        return in_array($this->status, ['For Dispatch', 'With Module'], true);
    }
}
