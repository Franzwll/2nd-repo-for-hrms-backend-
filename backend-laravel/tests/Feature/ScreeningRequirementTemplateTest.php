<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\DB;
use Tests\Concerns\RefreshesSeededDatabase;
use Tests\TestCase;

/**
 * Screening Setup → Requirement Templates: the per-position requirement
 * entities HR creates and applies to a job post in the Job Post Builder.
 */
class ScreeningRequirementTemplateTest extends TestCase
{
    use RefreshesSeededDatabase;

    private const BASE = '/api/v1/screening/requirement-templates';

    public function test_requirement_template_crud_lifecycle(): void
    {
        $token = $this->superAdminToken();
        $positionId = (int) DB::table('positions')->value('position_id');

        $this->withToken($token)
            ->getJson(self::BASE)
            ->assertOk()
            ->assertJsonStructure(['success', 'data']);

        $created = $this->withToken($token)
            ->postJson(self::BASE, [
                'name' => 'Automation Test Template',
                'position_id' => $positionId,
                'description' => 'Created by the feature test.',
                'active' => true,
                'items' => [
                    ['entity_type' => 'skill', 'value' => 'Guest Relations'],
                    // Duplicate (case-insensitive) — must be de-duplicated.
                    ['entity_type' => 'skill', 'value' => 'guest relations'],
                    ['entity_type' => 'certification', 'value' => 'TESDA Cookery NC II'],
                    ['entity_type' => 'education', 'value' => "Bachelor's Degree"],
                    ['entity_type' => 'experience', 'value' => '1-2 Years'],
                ],
            ])
            ->assertCreated()
            ->json('data');

        $templateId = $created['template_id'];
        $this->assertCount(4, $created['items']);
        $this->assertSame($positionId, $created['position_id']);
        $this->assertNotNull($created['position_title']);

        $this->assertDatabaseHas('screening_requirement_templates', [
            'template_id' => $templateId,
            'name' => 'Automation Test Template',
        ]);
        $this->assertDatabaseHas('audit_logs', [
            'action' => 'Requirement Template Created',
            'target_type' => 'Screening Requirement Template',
        ]);

        // A second template with the same name for the same position is rejected.
        $this->withToken($token)
            ->postJson(self::BASE, [
                'name' => 'Automation Test Template',
                'position_id' => $positionId,
                'items' => [['entity_type' => 'skill', 'value' => 'Upselling']],
            ])
            ->assertStatus(422);

        // Update replaces the requirement entities.
        $updated = $this->withToken($token)
            ->putJson(self::BASE . '/' . $templateId, [
                'name' => 'Automation Test Template (revised)',
                'position_id' => $positionId,
                'description' => 'Revised by the feature test.',
                'active' => true,
                'items' => [
                    ['entity_type' => 'job_role', 'value' => 'Front Desk Receptionist'],
                    ['entity_type' => 'experience', 'value' => 'At least 3 years front office'],
                ],
            ])
            ->assertOk()
            ->json('data');

        $this->assertCount(2, $updated['items']);
        $this->assertDatabaseMissing('screening_requirement_template_items', [
            'template_id' => $templateId,
            'value' => 'Guest Relations',
        ]);
        $this->assertDatabaseHas('screening_requirement_template_items', [
            'template_id' => $templateId,
            'entity_type' => 'job_role',
            'value' => 'Front Desk Receptionist',
        ]);

        // Toggle hides the template from the builder picker without deleting it.
        $this->withToken($token)
            ->patchJson(self::BASE . '/' . $templateId . '/toggle')
            ->assertOk()
            ->assertJsonPath('data.active', false);

        $this->withToken($token)
            ->patchJson(self::BASE . '/' . $templateId . '/toggle')
            ->assertOk()
            ->assertJsonPath('data.active', true);

        // Delete removes the template and its entities.
        $this->withToken($token)
            ->deleteJson(self::BASE . '/' . $templateId)
            ->assertOk();

        $this->assertDatabaseMissing('screening_requirement_templates', ['template_id' => $templateId]);
        $this->assertDatabaseMissing('screening_requirement_template_items', ['template_id' => $templateId]);
    }

    public function test_seeded_starter_templates_carry_requirement_entities(): void
    {
        $token = $this->superAdminToken();

        $templates = $this->withToken($token)
            ->getJson(self::BASE)
            ->assertOk()
            ->json('data');

        $this->assertNotEmpty($templates, 'Expected the seeded starter requirement templates.');

        foreach ($templates as $template) {
            $this->assertNotEmpty(
                $template['items'],
                "Requirement template '{$template['name']}' has no entities."
            );

            foreach ($template['items'] as $item) {
                $this->assertContains($item['entity_type'], [
                    'skill',
                    'job_role',
                    'certification',
                    'education',
                    'experience',
                ]);
            }
        }
    }
}
