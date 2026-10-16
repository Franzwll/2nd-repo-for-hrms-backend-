<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EssRequestStatusHistory extends Model
{
    protected $table = 'ess_request_status_histories';
    protected $primaryKey = 'ess_request_status_history_id';

    public $timestamps = false; // only created_at

    protected $fillable = [
        'ess_request_id',
        'status',
        'actor_user_id',
        'note',
        'created_at',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    public function request(): BelongsTo
    {
        return $this->belongsTo(EssRequest::class, 'ess_request_id', 'ess_request_id');
    }

    public function actor(): BelongsTo
    {
        return $this->belongsTo(SystemUser::class, 'actor_user_id', 'system_user_id');
    }
}
