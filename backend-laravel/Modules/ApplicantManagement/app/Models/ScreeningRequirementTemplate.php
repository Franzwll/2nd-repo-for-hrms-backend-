<?php

namespace Modules\ApplicantManagement\Models;

use App\Models\Position;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * A Screening Setup requirement template — the reusable list of requirement
 * entities (skills, job roles, certifications, education, experience) defined
 * per Core HCM position and applied to a job post in the Job Post Builder.
 */
class ScreeningRequirementTemplate extends Model
{
    protected $table = 'screening_requirement_templates';

    protected $primaryKey = 'template_id';

    protected $fillable = [
        'name',
        'position_id',
        'description',
        'active',
    ];

    protected $casts = [
        'active' => 'boolean',
    ];

    public function items(): HasMany
    {
        return $this->hasMany(ScreeningRequirementTemplateItem::class, 'template_id', 'template_id');
    }

    public function position(): BelongsTo
    {
        return $this->belongsTo(Position::class, 'position_id', 'position_id');
    }
}
