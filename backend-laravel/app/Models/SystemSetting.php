<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SystemSetting extends Model
{
    protected $table = 'system_settings';
    protected $primaryKey = 'setting_id';

    protected $fillable = [
        'setting_key',
        'setting_value',
        'updated_by_user_id',
    ];

    public function getValueAttribute(): mixed
    {
        $decoded = json_decode($this->setting_value, true);

        return $decoded['value'] ?? $decoded;
    }
}