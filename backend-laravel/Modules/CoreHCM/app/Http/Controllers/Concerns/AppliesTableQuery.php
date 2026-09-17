<?php

namespace Modules\CoreHCM\Http\Controllers\Concerns;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

trait AppliesTableQuery
{
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
