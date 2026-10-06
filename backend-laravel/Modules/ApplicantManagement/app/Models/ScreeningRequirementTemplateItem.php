<?php

namespace Modules\ApplicantManagement\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * One requirement entity inside a Screening Setup requirement template.
 *
 * `entity_type` mirrors the screening entity set (the same vocabulary the NLP
 * service recognizes in resumes) so a template can mix skills, job roles,
 * certifications, education and experience rows.
 */
class ScreeningRequirementTemplateItem extends Model
{
    public const TYPE_SKILL = 'skill';
    public const TYPE_JOB_ROLE = 'job_role';
    public const TYPE_CERTIFICATION = 'certification';
    /** Academic attainment requirements (degrees / levels). */
    public const TYPE_EDUCATION = 'education';
    /** Tenure / seniority requirements. */
    public const TYPE_EXPERIENCE = 'experience';

    public const TYPES = [
        self::TYPE_EDUCATION,
        self::TYPE_CERTIFICATION,
        self::TYPE_SKILL,
        self::TYPE_JOB_ROLE,
        self::TYPE_EXPERIENCE,
    ];

    /**
     * Values that map to the job_posts structured level columns when a template
     * is applied. Anything else stays a free-text qualification line, so HR is
     * never blocked from recording e.g. "BS Hospitality Management".
     */
    public const EDUCATION_LEVELS = [
        'High School Graduate',
        'Vocational / TESDA',
        'College Level',
        "Bachelor's Degree",
    ];

    public const EXPERIENCE_LEVELS = [
        'No Experience',
        '1-2 Years',
        '3-5 Years',
        '5+ Years',
    ];

    protected $table = 'screening_requirement_template_items';

    protected $primaryKey = 'item_id';

    /** Only created_at exists (set by the database default). */
    public $timestamps = false;

    protected $fillable = [
        'template_id',
        'entity_type',
        'value',
        'required',
    ];

    protected $casts = [
        'required' => 'boolean',
    ];

    public function template(): BelongsTo
    {
        return $this->belongsTo(ScreeningRequirementTemplate::class, 'template_id', 'template_id');
    }
}
