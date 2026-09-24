<?php

namespace Modules\ApplicantManagement\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Facility extends Model
{
    protected $table = 'facilities';
    protected $primaryKey = 'facility_id';

    protected $fillable = [
        'name',
        'type',
        'location',
        'capacity',
        'icon',
        'description',
        'is_active',
    ];

    protected $casts = [
        'capacity'  => 'integer',
        'is_active' => 'boolean',
    ];

    /* ------------------------------------------------------------------ */
    /* Relationships                                                         */
    /* ------------------------------------------------------------------ */

    public function interviews(): HasMany
    {
        return $this->hasMany(Interview::class, 'facility_id', 'facility_id');
    }
}
