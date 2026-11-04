<?php

use App\Models\EssCategory;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Ensures categories referenced by ESS request forms and module routing
     * (e.g. Career & Position, Shift Schedule) exist in ess_categories so that
     * createRequest correctly links category_id and module routing works seamlessly.
     */
    public function up(): void
    {
        $categories = [
            [
                'code' => 'ESS-CAREER',
                'name' => 'Career & Position',
                'description' => 'Promotions, lateral transfers, reclassification, and salary grade reviews.',
                'is_open' => true,
                'sort_order' => 10,
            ],
            [
                'code' => 'ESS-SCHED',
                'name' => 'Shift Schedule',
                'description' => 'Shift swap requests, roster adjustments, and schedule preferences.',
                'is_open' => true,
                'sort_order' => 11,
            ],
        ];

        foreach ($categories as $cat) {
            EssCategory::firstOrCreate(
                ['code' => $cat['code']],
                $cat
            );
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        EssCategory::whereIn('code', ['ESS-CAREER', 'ESS-SCHED'])->delete();
    }
};

