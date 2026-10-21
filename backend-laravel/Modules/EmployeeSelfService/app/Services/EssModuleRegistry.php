<?php

namespace Modules\EmployeeSelfService\Services;

use Modules\EmployeeSelfService\Adapters\DatabaseModuleAdapter;
use Modules\EmployeeSelfService\Contracts\EssModuleAdapter;

/**
 * Resolves the adapter for a module key and enforces that the request is
 * actually routed there.
 */
class EssModuleRegistry
{
    /** @var array<string, EssModuleAdapter> */
    private array $resolved = [];

    public function __construct(private readonly EssRoutingService $routing)
    {
    }

    public function adapter(string $module): EssModuleAdapter
    {
        if (isset($this->resolved[$module])) {
            return $this->resolved[$module];
        }

        $class = config("ess_routing.modules.{$module}.adapter");

        if (is_string($class) && class_exists($class)) {
            $adapter = app($class);

            if ($adapter instanceof EssModuleAdapter) {
                return $this->resolved[$module] = $adapter;
            }
        }

        return $this->resolved[$module] = new DatabaseModuleAdapter($module);
    }

    public function for(string $module): EssModuleAdapter
    {
        if (! $this->routing->isKnownModule($module)) {
            throw new \RuntimeException('Unknown ESS module.');
        }

        return $this->adapter($module);
    }

    public function permissionFor(string $module): ?string
    {
        return $this->routing->permissionFor($module);
    }

    public function label(string $module): string
    {
        return $this->routing->label($module);
    }

    /** @return array<int, string> */
    public function moduleKeys(): array
    {
        return $this->routing->moduleKeys();
    }
}
