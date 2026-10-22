<?php

namespace Modules\EmployeeSelfService\Services;

use App\Models\EssRequest;

/**
 * Resolves which module owns a request after the ESS Management gate.
 *
 * Resolution order:
 *   1. `ess_categories.default_module` (admin override)
 *   2. `config('ess_routing.categories')` by category code
 *   3. keyword fallback on request_type / category name (legacy rows)
 *   4. null -> ESS Management handles and releases it internally
 */
class EssRoutingService
{
    public function enabled(): bool
    {
        return (bool) config('ess_routing.enabled', true);
    }

    public function resolve(EssRequest $request): ?string
    {
        if (! $this->enabled()) {
            return null;
        }

        $request->loadMissing('category');

        $category = $request->category;
        $code = strtolower((string) ($category?->code ?? ''));

        $configured = $category?->default_module
            ?: (config('ess_routing.categories')[$code] ?? null);

        if (is_string($configured) && $this->isKnownModule($configured)) {
            return $configured;
        }

        $haystack = strtolower(trim(
            (string) $request->request_type . ' ' . (string) ($category?->name ?? '')
        ));

        foreach ((array) config('ess_routing.keywords', []) as $module => $needles) {
            foreach ((array) $needles as $needle) {
                if ($needle !== '' && str_contains($haystack, strtolower((string) $needle))) {
                    return $this->isKnownModule($module) ? $module : null;
                }
            }
        }

        return null;
    }

    public function isKnownModule(?string $module): bool
    {
        return $module !== null
            && $module !== ''
            && is_array(config("ess_routing.modules.{$module}"));
    }

    public function label(?string $module): string
    {
        if (! $module) {
            return 'ESS Management';
        }

        return (string) (config("ess_routing.modules.{$module}.label") ?? ucfirst($module));
    }

    public function permissionFor(string $module): ?string
    {
        $permission = config("ess_routing.modules.{$module}.permission");

        return is_string($permission) && $permission !== '' ? $permission : null;
    }

    /** @return array<int, string> */
    public function moduleKeys(): array
    {
        return array_keys((array) config('ess_routing.modules', []));
    }
}
