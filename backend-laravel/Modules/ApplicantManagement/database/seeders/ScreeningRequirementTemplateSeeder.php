<?php

namespace Modules\ApplicantManagement\Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Modules\ApplicantManagement\Models\ScreeningRequirementTemplate;
use Modules\ApplicantManagement\Models\ScreeningRequirementTemplateItem;

/**
 * Starter requirement templates for the Screening Setup — one per seeded Core
 * HCM position, mirroring the curated keyword library the screening checklist
 * used to carry in the frontend.
 *
 * Idempotent: templates already present for a position are left untouched, so
 * re-running the seeder never overwrites HR edits. Positions that do not exist
 * in the database are skipped.
 */
class ScreeningRequirementTemplateSeeder extends Seeder
{
    public function run(): void
    {
        /** @var array<string, int> $positions title => position_id */
        $positions = DB::table('positions')->pluck('position_id', 'title')->all();

        foreach ($this->templates() as $template) {
            $title = $template['position'];
            $positionId = $positions[$title] ?? null;
            if ($positionId === null) {
                continue;
            }

            $exists = ScreeningRequirementTemplate::query()
                ->where('position_id', $positionId)
                ->where('name', $template['name'])
                ->exists();
            if ($exists) {
                continue;
            }

            $record = ScreeningRequirementTemplate::create([
                'name' => $template['name'],
                'position_id' => $positionId,
                'description' => $template['description'] ?? null,
                'active' => true,
            ]);

            $record->items()->createMany($template['items']);
        }
    }

    /**
     * Requirement entities per position. Education / experience rows use the
     * job_posts structured levels so applying the template also sets those
     * columns; everything else seeds the post's skills / qualifications.
     *
     * @return array<int, array<string, mixed>>
     */
    private function templates(): array
    {
        return [
            [
                'position' => 'Front Desk Receptionist',
                'name' => 'Front Desk Receptionist — Core Requirements',
                'description' => 'Guest-facing front office essentials the spaCy screening scores against.',
                'items' => [
                    ['entity_type' => ScreeningRequirementTemplateItem::TYPE_SKILL, 'value' => 'Guest Relations'],
                    ['entity_type' => ScreeningRequirementTemplateItem::TYPE_SKILL, 'value' => 'Opera PMS'],
                    ['entity_type' => ScreeningRequirementTemplateItem::TYPE_SKILL, 'value' => 'Check-in / Check-out'],
                    ['entity_type' => ScreeningRequirementTemplateItem::TYPE_SKILL, 'value' => 'Cash Handling'],
                    ['entity_type' => ScreeningRequirementTemplateItem::TYPE_SKILL, 'value' => 'Reservations'],
                    ['entity_type' => ScreeningRequirementTemplateItem::TYPE_CERTIFICATION, 'value' => 'TESDA Front Office NC II'],
                    ['entity_type' => ScreeningRequirementTemplateItem::TYPE_EDUCATION, 'value' => "Bachelor's Degree"],
                    ['entity_type' => ScreeningRequirementTemplateItem::TYPE_EXPERIENCE, 'value' => '1-2 Years'],
                ],
            ],
            [
                'position' => 'Guest Relations Officer',
                'name' => 'Guest Relations Officer — Core Requirements',
                'description' => 'Complaint recovery and VIP handling for the guest relations desk.',
                'items' => [
                    ['entity_type' => ScreeningRequirementTemplateItem::TYPE_SKILL, 'value' => 'Guest Relations'],
                    ['entity_type' => ScreeningRequirementTemplateItem::TYPE_SKILL, 'value' => 'Complaint Handling'],
                    ['entity_type' => ScreeningRequirementTemplateItem::TYPE_SKILL, 'value' => 'VIP Handling'],
                    ['entity_type' => ScreeningRequirementTemplateItem::TYPE_SKILL, 'value' => 'Multilingual'],
                    ['entity_type' => ScreeningRequirementTemplateItem::TYPE_EDUCATION, 'value' => "Bachelor's Degree"],
                    ['entity_type' => ScreeningRequirementTemplateItem::TYPE_EXPERIENCE, 'value' => '3-5 Years'],
                ],
            ],
            [
                'position' => 'Restaurant Server',
                'name' => 'Restaurant Server — Core Requirements',
                'description' => 'Table service and upselling requirements for the all-day dining outlet.',
                'items' => [
                    ['entity_type' => ScreeningRequirementTemplateItem::TYPE_SKILL, 'value' => 'Table Service'],
                    ['entity_type' => ScreeningRequirementTemplateItem::TYPE_SKILL, 'value' => 'POS Systems'],
                    ['entity_type' => ScreeningRequirementTemplateItem::TYPE_SKILL, 'value' => 'Banquet Service'],
                    ['entity_type' => ScreeningRequirementTemplateItem::TYPE_SKILL, 'value' => 'Food Safety'],
                    ['entity_type' => ScreeningRequirementTemplateItem::TYPE_SKILL, 'value' => 'Upselling'],
                    ['entity_type' => ScreeningRequirementTemplateItem::TYPE_EDUCATION, 'value' => 'High School Graduate'],
                    ['entity_type' => ScreeningRequirementTemplateItem::TYPE_EXPERIENCE, 'value' => 'No Experience'],
                ],
            ],
            [
                'position' => 'Bartender',
                'name' => 'Bartender — Core Requirements',
                'description' => 'Bar craft, inventory control and the TESDA bartending credential.',
                'items' => [
                    ['entity_type' => ScreeningRequirementTemplateItem::TYPE_SKILL, 'value' => 'Mixology'],
                    ['entity_type' => ScreeningRequirementTemplateItem::TYPE_SKILL, 'value' => 'Cocktail Craft'],
                    ['entity_type' => ScreeningRequirementTemplateItem::TYPE_SKILL, 'value' => 'Inventory'],
                    ['entity_type' => ScreeningRequirementTemplateItem::TYPE_SKILL, 'value' => 'Bar Hygiene'],
                    ['entity_type' => ScreeningRequirementTemplateItem::TYPE_CERTIFICATION, 'value' => 'TESDA Bartending NC II'],
                    ['entity_type' => ScreeningRequirementTemplateItem::TYPE_EDUCATION, 'value' => 'Vocational / TESDA'],
                    ['entity_type' => ScreeningRequirementTemplateItem::TYPE_EXPERIENCE, 'value' => '1-2 Years'],
                ],
            ],
            [
                'position' => 'Line Cook',
                'name' => 'Line Cook — Core Requirements',
                'description' => 'Hot-kitchen station requirements with food safety credentials.',
                'items' => [
                    ['entity_type' => ScreeningRequirementTemplateItem::TYPE_SKILL, 'value' => 'Hot Kitchen'],
                    ['entity_type' => ScreeningRequirementTemplateItem::TYPE_SKILL, 'value' => 'Food Handler'],
                    ['entity_type' => ScreeningRequirementTemplateItem::TYPE_SKILL, 'value' => 'HACCP'],
                    ['entity_type' => ScreeningRequirementTemplateItem::TYPE_SKILL, 'value' => 'Mise en Place'],
                    ['entity_type' => ScreeningRequirementTemplateItem::TYPE_SKILL, 'value' => 'Plating'],
                    ['entity_type' => ScreeningRequirementTemplateItem::TYPE_CERTIFICATION, 'value' => 'TESDA Cookery NC II'],
                    ['entity_type' => ScreeningRequirementTemplateItem::TYPE_EDUCATION, 'value' => 'Vocational / TESDA'],
                    ['entity_type' => ScreeningRequirementTemplateItem::TYPE_EXPERIENCE, 'value' => '1-2 Years'],
                ],
            ],
            [
                'position' => 'Pastry Chef',
                'name' => 'Pastry Chef — Core Requirements',
                'description' => 'Baking and dessert plating requirements for the pastry section.',
                'items' => [
                    ['entity_type' => ScreeningRequirementTemplateItem::TYPE_SKILL, 'value' => 'Pastry'],
                    ['entity_type' => ScreeningRequirementTemplateItem::TYPE_SKILL, 'value' => 'Baking'],
                    ['entity_type' => ScreeningRequirementTemplateItem::TYPE_SKILL, 'value' => 'Dessert Plating'],
                    ['entity_type' => ScreeningRequirementTemplateItem::TYPE_SKILL, 'value' => 'HACCP'],
                    ['entity_type' => ScreeningRequirementTemplateItem::TYPE_EDUCATION, 'value' => 'Vocational / TESDA'],
                    ['entity_type' => ScreeningRequirementTemplateItem::TYPE_EXPERIENCE, 'value' => '3-5 Years'],
                ],
            ],
            [
                'position' => 'Housekeeping Attendant',
                'name' => 'Housekeeping Attendant — Core Requirements',
                'description' => 'Room turnover and chemical-safety requirements for rooms division.',
                'items' => [
                    ['entity_type' => ScreeningRequirementTemplateItem::TYPE_SKILL, 'value' => 'Room Turnover'],
                    ['entity_type' => ScreeningRequirementTemplateItem::TYPE_SKILL, 'value' => 'Linen Handling'],
                    ['entity_type' => ScreeningRequirementTemplateItem::TYPE_SKILL, 'value' => 'Chemical Safety'],
                    ['entity_type' => ScreeningRequirementTemplateItem::TYPE_SKILL, 'value' => 'Public Area Cleaning'],
                    ['entity_type' => ScreeningRequirementTemplateItem::TYPE_CERTIFICATION, 'value' => 'TESDA Housekeeping NC II'],
                    ['entity_type' => ScreeningRequirementTemplateItem::TYPE_EDUCATION, 'value' => 'High School Graduate'],
                    ['entity_type' => ScreeningRequirementTemplateItem::TYPE_EXPERIENCE, 'value' => 'No Experience'],
                ],
            ],
            [
                'position' => 'HR Assistant',
                'name' => 'HR Assistant — Core Requirements',
                'description' => 'Recruitment support and records-management requirements.',
                'items' => [
                    ['entity_type' => ScreeningRequirementTemplateItem::TYPE_SKILL, 'value' => 'Recruitment'],
                    ['entity_type' => ScreeningRequirementTemplateItem::TYPE_SKILL, 'value' => '201 Files'],
                    ['entity_type' => ScreeningRequirementTemplateItem::TYPE_SKILL, 'value' => 'Payroll Support'],
                    ['entity_type' => ScreeningRequirementTemplateItem::TYPE_SKILL, 'value' => 'DOLE Compliance'],
                    ['entity_type' => ScreeningRequirementTemplateItem::TYPE_EDUCATION, 'value' => "Bachelor's Degree"],
                    ['entity_type' => ScreeningRequirementTemplateItem::TYPE_EXPERIENCE, 'value' => '1-2 Years'],
                ],
            ],
        ];
    }
}
