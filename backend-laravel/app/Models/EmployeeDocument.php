<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class EmployeeDocument extends Model
{
    use SoftDeletes;

    protected $table = 'employee_documents';
    protected $primaryKey = 'document_id';

    protected $fillable = [
        'employee_id',
        'document_code',
        'title',
        'category',
        'source_type',
        'source_id',
        'original_name',
        'source_hash',
        'file_path',
        'mime_type',
        'file_size_bytes',
        'document_status',
        'document_date',
        'expiry_date',
        'last_updated_at',
    ];

    protected $casts = [
        'document_date' => 'date',
        'expiry_date' => 'date',
        'last_updated_at' => 'datetime',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'employee_id', 'employee_id');
    }
}