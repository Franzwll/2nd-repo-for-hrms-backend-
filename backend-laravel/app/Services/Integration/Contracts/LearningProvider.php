<?php

namespace App\Services\Integration\Contracts;

/**
 * Integration seam for Performance & Development (Cluster 4, Team 3):
 * Performance, Competency, Learning, Training, Succession.
 */
interface LearningProvider
{
    /** @return array<int, array<string, mixed>> course progress records */
    public function learningFor(int $employeeId): array;
}
