<?php

namespace Modules\CoreHCM\Http\Controllers\Concerns;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

trait AppliesTableQuery
{
    /**
     * Cache TTL (seconds) for Core HCM read endpoints (departments,
     * positions, salary grades, org chart). Reference data changes rarely
     * but is fetched on every portal visit — 60s absorbs the burst while
     * staying fresh. Any store/update/destroy must call
     * HcmCache::flush() (below) so writes are visible immediately.
     */
    protected function hcmCacheTtl(): int
    {
        return 60;
    }

    /**
     * Cache a paginated index response. Only the default first-page,
     * unfiltered listing is cached — filtered/search/sorted/paginated
     * variants always hit the DB so they stay correct.
     *
     * @template T
     * @param callable(): T $build
     * @return T
     */
    protected function rememberHcmIndex(Request $request, string $key, callable $build)
    {
        if ($this->isDefaultHcmListing($request)) {
            return Cache::remember($key . ':' . $request->integer('per_page', 25), $this->hcmCacheTtl(), $build);
        }

        return $build();
    }

    /**
     * True when the request is the plain default listing (page 1, default
     * per_page or less, no search/filter/sort params). These are the only
     * shapes cached — everything else bypasses the cache.
     */
    protected function isDefaultHcmListing(Request $request): bool
    {
        if ($request->integer('page', 1) !== 1) {
            return false;
        }

        foreach (['q', 'sort', 'dir', 'direction', 'filter', 'department_id', 'position_id', 'status', 'employment_type', 'level', 'salary_grade_id', 'code'] as $param) {
            if ($request->filled($param)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Apply ?sort=field&dir=asc|desc with a whitelist.
     * Falls back to $default ({column, direction}).
     */
    protected function applySort(Request $request, Builder $query, array $allowed, array $default = []): void
    {
        $sort = (string) $request->query('sort', '');
        $dir = strtolower((string) $request->query('dir', $request->query('direction', 'asc')));
        $dir = $dir === 'desc' ? 'desc' : 'asc';

        if ($sort !== '' && isset($allowed[$sort])) {
            $query->orderBy($allowed[$sort], $dir);

            return;
        }

        if (! empty($default)) {
            $query->orderBy($default[0], $default[1] ?? 'asc');
        }
    }

    /**
     * Apply exact-match ?filter[field]=value filters with a whitelist.
     */
    protected function applyFilters(Request $request, Builder $query, array $allowed): void
    {
        $filters = $request->query('filter', []);
        if (! is_array($filters)) {
            return;
        }

        foreach ($allowed as $key => $column) {
            if (isset($filters[$key]) && $filters[$key] !== '' && $filters[$key] !== null) {
                $query->where($column, $filters[$key]);
            }
        }
    }
}
