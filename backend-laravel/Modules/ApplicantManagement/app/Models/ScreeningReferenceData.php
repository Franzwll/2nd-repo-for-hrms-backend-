<?php

namespace Modules\ApplicantManagement\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class ScreeningReferenceData extends Model
{
    public const TYPE_SKILL = 'skill';
    public const TYPE_JOB_ROLE = 'job_role';
    public const TYPE_CERTIFICATION = 'certification';

    public const TYPES = [
        self::TYPE_SKILL,
        self::TYPE_JOB_ROLE,
        self::TYPE_CERTIFICATION,
    ];

    protected $table = 'screening_reference_data';

    protected $primaryKey = 'ref_id';

    protected $fillable = [
        'data_type',
        'canonical_value',
        'aliases_json',
        'active',
    ];

    protected $casts = [
        'aliases_json' => 'array',
        'active' => 'boolean',
    ];

    /** Active rows of one type as {canonical_value: [aliases]} (NLP payload shape). */
    public static function mappingFor(string $type): array
    {
        return static::query()
            ->where('data_type', $type)
            ->where('active', 1)
            ->orderBy('canonical_value')
            ->get()
            ->mapWithKeys(fn (self $row) => [$row->canonical_value => $row->aliases_json ?? []])
            ->all();
    }

    public function scopeOfType(Builder $query, string $type): Builder
    {
        return $query->where('data_type', $type);
    }
}
