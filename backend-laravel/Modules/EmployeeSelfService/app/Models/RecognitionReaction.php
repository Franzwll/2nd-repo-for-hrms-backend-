<?php

namespace Modules\EmployeeSelfService\Models;

use App\Models\Employee;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RecognitionReaction extends Model
{
    protected $table = 'recognition_reactions';
    protected $primaryKey = 'reaction_id';

    protected $fillable = [
        'recognition_id',
        'employee_id',
        'reaction_type',
    ];

    public function recognition(): BelongsTo
    {
        return $this->belongsTo(SocialRecognition::class, 'recognition_id', 'recognition_id');
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'employee_id', 'employee_id');
    }
}
