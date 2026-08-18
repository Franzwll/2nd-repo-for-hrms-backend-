<?php

namespace Modules\Settings\Models;

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

    protected $casts = [
        'setting_value' => 'array',
    ];

    /* ------------------------------------------------------------------ */
    /* Helpers                                                              */
    /* ------------------------------------------------------------------ */

    /**
     * Retrieve a setting value by key, with optional default.
     */
    public static function getValue(string $key, mixed $default = null): mixed
    {
        $record = static::where('setting_key', $key)->first();
        return $record ? $record->setting_value : $default;
    }

    /**
     * Upsert a single setting key.
     */
    public static function setValue(string $key, mixed $value, ?int $userId = null): static
    {
        return static::updateOrCreate(
            ['setting_key' => $key],
            [
                'setting_value'       => $value,
                'updated_by_user_id'  => $userId,
            ]
        );
    }
}
