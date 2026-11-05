<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\DB;
use Modules\NewHireOnboarding\Models\NewHire;
use Tests\Concerns\RefreshesSeededDatabase;
use Tests\TestCase;

/**
 * New Hire Onboarding → Checklist Templates.
 *
 * Phase 4a inlines onboarding_checklist_items into
 * onboarding_checklist_templates.items_json, so these tests guard the JSON
 * read/write helpers and the stable template_item_id contract used by
 * employee_onboarding_items.
 */
class OnboardingChecklistTemplateTest extends TestCase
{
    use RefreshesSeededDatabase;

    private const BASE = '/api/v1/checklist-templates';

    public function test_template_crud_inlines_items_and_preserves_stable_ids(): void
    {
        $token = $this->superAdminToken();

        $created = $this->withToken($token)
            ->postJson(self::BASE, [
                'title' => 'Automation Onboarding Template',
                'phase' => 'Probationary',
                'position_scope_json' => ['all'],
                'status' => 'Inactive',
                'items' => [
                    ['item_text' => 'Bring valid ID', 'requires_upload' => true, 'upload_placeholder' => 'Upload ID', 'sort_order' => 0],
                    ['item_text' => 'Sign handbook', 'sort_order' => 1],
                ],
            ])
            ->assertCreated()
            ->json();

        $templateId = $created['template_id'];
        $this->assertCount(2, $created['items']);
        $this->assertSame(
            ['template_item_id', 'item_text', 'instructions', 'requires_upload', 'upload_placeholder', 'sort_order'],
            array_keys($created['items'][0])
        );

        $firstId = $created['items'][0]['template_item_id'];
        $secondId = $created['items'][1]['template_item_id'];

        $json = json_decode(
            (string) DB::table('onboarding_checklist_templates')->where('template_id', $templateId)->value('items_json'),
            true
        );
        $this->assertCount(2, $json);
        $this->assertSame('Bring valid ID', $json[0]['item_text']);

        // Update keeps existing ids for the same positions and drops removed items.
        $updated = $this->withToken($token)
            ->putJson(self::BASE . '/' . $templateId, [
                'items' => [
                    ['item_text' => 'Bring valid ID (revised)', 'requires_upload' => true, 'sort_order' => 0],
                ],
            ])
            ->assertOk()
            ->json();

        $this->assertCount(1, $updated['items']);
        $this->assertSame($firstId, $updated['items'][0]['template_item_id']);
        $this->assertNotContains(
            $secondId,
            array_column($updated['items'], 'template_item_id')
        );

        // Add a single item with a fresh stable id.
        $added = $this->withToken($token)
            ->postJson(self::BASE . '/' . $templateId . '/items', [
                'item_text' => 'Return signed contract',
                'sort_order' => 2,
            ])
            ->assertCreated()
            ->json();

        $this->assertNotSame($firstId, $added['template_item_id']);
        $this->assertGreaterThan(0, $added['template_item_id']);

        // Edit and remove that item through the shared item routes.
        $this->withToken($token)
            ->putJson('/api/v1/checklist-items/' . $added['template_item_id'], [
                'item_text' => 'Return signed contract (HR copy)',
            ])
            ->assertOk()
            ->assertJsonPath('item_text', 'Return signed contract (HR copy)');

        $this->withToken($token)
            ->deleteJson('/api/v1/checklist-items/' . $added['template_item_id'])
            ->assertOk();

        $remaining = $this->withToken($token)
            ->getJson(self::BASE . '/' . $templateId)
            ->assertOk()
            ->json('items');

        $this->assertCount(1, $remaining);
        $this->assertSame($firstId, $remaining[0]['template_item_id']);

        // Deleting the template removes its inlined items with it.
        $this->withToken($token)->deleteJson(self::BASE . '/' . $templateId)->assertOk();
        $this->assertDatabaseMissing('onboarding_checklist_templates', ['template_id' => $templateId]);
    }

    public function test_seeded_templates_expose_their_inlined_items(): void
    {
        $token = $this->superAdminToken();

        $templates = $this->withToken($token)
            ->getJson(self::BASE)
            ->assertOk()
            ->json('data');

        $this->assertNotEmpty($templates);

        foreach ($templates as $template) {
            $this->assertNotEmpty($template['items'], "Template '{$template['title']}' has no items.");
            $this->assertSame($template['items_count'], count($template['items']));
        }
    }

    public function test_materialize_resolves_a_template_item_from_items_json(): void
    {
        $token = $this->superAdminToken();
        $hire = NewHire::query()->firstOrFail();

        $templateId = $this->withToken($token)
            ->postJson(self::BASE, [
                'title' => 'Materialize Probe Template',
                'phase' => 'Probationary',
                'position_scope_json' => ['all'],
                'status' => 'Inactive',
                'items' => [
                    ['item_text' => 'Materialize me', 'sort_order' => 0],
                ],
            ])
            ->assertCreated()
            ->json('template_id');

        $itemsJson = DB::table('onboarding_checklist_templates')
            ->where('template_id', $templateId)
            ->value('items_json');
        $templateItemId = json_decode((string) $itemsJson, true)[0]['template_item_id'];

        $materialized = $this->withToken($token)
            ->postJson("/api/v1/new-hires/{$hire->new_hire_id}/onboarding-items", [
                'template_item_id' => $templateItemId,
            ])
            ->assertCreated()
            ->json();

        $this->assertSame($templateItemId, $materialized['template_item_id']);
        $this->assertSame('Materialize me', $materialized['item_text']);
        $this->assertDatabaseHas('employee_onboarding_items', [
            'employee_onboarding_item_id' => $materialized['employee_onboarding_item_id'],
            'template_item_id' => $templateItemId,
        ]);

        // An unknown template item id is rejected by the validator.
        $this->withToken($token)
            ->postJson("/api/v1/new-hires/{$hire->new_hire_id}/onboarding-items", [
                'template_item_id' => 999999,
            ])
            ->assertStatus(422);

        $this->withToken($token)->deleteJson(self::BASE . '/' . $templateId)->assertOk();
    }
}
