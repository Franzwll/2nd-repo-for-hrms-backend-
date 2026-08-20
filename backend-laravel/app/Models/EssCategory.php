<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EssCategory extends Model
{
    protected $table = 'ess_categories';
    protected $primaryKey = 'ess_category_id';

    public $timestamps = true;

    protected $fillable = [
        'code',
        'name',
        'description',
        'is_open',
        'sort_order',
    ];

    protected $casts = [
        'is_open' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function requests(): HasMany
    {
        return $this->hasMany(EssRequest::class, 'category_id', 'ess_category_id');
    }
}
