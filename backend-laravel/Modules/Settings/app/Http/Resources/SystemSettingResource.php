<?php

namespace Modules\Settings\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SystemSettingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'setting_id'          => $this->setting_id,
            'setting_key'         => $this->setting_key,
            'setting_value'       => $this->setting_value,
            'updated_by_user_id'  => $this->updated_by_user_id,
            'created_at'          => $this->created_at?->toISOString(),
            'updated_at'          => $this->updated_at?->toISOString(),
        ];
    }
}
