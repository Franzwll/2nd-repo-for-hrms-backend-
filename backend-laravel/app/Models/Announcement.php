<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Announcement extends Model
{
    protected $table = 'announcements';
    protected $primaryKey = 'announcement_id';

    protected $fillable = [
        'published_date',
        'title',
        'body',
        'audience',
        'created_by_user_id',
        'status',
    ];

    protected $casts = [
        'published_date' => 'date',
    ];

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(SystemUser::class, 'created_by_user_id', 'system_user_id');
    }
}