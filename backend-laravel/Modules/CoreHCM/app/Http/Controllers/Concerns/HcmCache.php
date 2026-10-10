<?php

namespace Modules\CoreHCM\Http\Controllers\Concerns;

use Illuminate\Support\Facades\Cache;

/**
 * Single place to flush Core HCM reference-data caches after any
 * department / position / salary-grade / employee write, so cached
 * listings (60s TTL) never serve stale headcounts.
 */
class HcmCache
{
    public static function flush(): void
    {
        // Cache store is `database` on XAMPP — tags aren't supported there,
        // so forget the known dept-pos listing keys explicitly.
        foreach ([25, 50, 100, 200, 500] as $perPage) {
            Cache::forget('hcm:departments:' . $perPage);
            Cache::forget('hcm:positions:' . $perPage);
            Cache::forget('hcm:salary-grades:' . $perPage);
            Cache::forget('hcm:employees:' . $perPage);
        }
        Cache::forget('hcm:org-chart');
    }
}
