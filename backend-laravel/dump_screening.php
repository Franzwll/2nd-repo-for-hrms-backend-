<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Modules\ApplicantManagement\Models\ScreeningRequirementTemplate;
use Modules\ApplicantManagement\Models\ScreeningReferenceData;
use App\Models\Department;
use App\Models\Position;

echo "=== DEPARTMENTS ===\n";
foreach (Department::all() as $d) {
    echo "ID: {$d->department_id} | Code: {$d->department_code} | Name: {$d->department_name}\n";
}

echo "\n=== POSITIONS ===\n";
foreach (Position::with('department')->get() as $p) {
    $deptName = $p->department ? $p->department->department_name : 'No Dept';
    echo "ID: {$p->position_id} | Code: {$p->position_code} | Title: {$p->title} | Dept: {$deptName}\n";
}

echo "\n=== REQUIREMENT TEMPLATES ===\n";
foreach (ScreeningRequirementTemplate::with(['position', 'items'])->get() as $t) {
    $posTitle = $t->position ? $t->position->title : 'No Position';
    echo "\nTemplate ID: {$t->template_id} | Name: {$t->name} | Position: {$posTitle} (ID: {$t->position_id})\n";
    echo "Description: {$t->description}\n";
    echo "Items:\n";
    foreach ($t->items as $item) {
        $req = $item->required ? 'REQUIRED' : 'OPTIONAL';
        echo "  - [{$item->entity_type}] '{$item->value}' ({$req})\n";
    }
}

echo "\n=== EDUCATION, CERTIFICATION, EXPERIENCE ===\n";
foreach (['education', 'certification', 'experience'] as $type) {
    echo "\n--- " . strtoupper($type) . " ---\n";
    foreach (Illuminate\Support\Facades\DB::table('screening_reference_data')->where('data_type', $type)->get() as $item) {
        $aliases = json_decode($item->aliases_json, true) ?: [];
        echo "  • {$item->canonical_value} [Aliases: " . implode(', ', $aliases) . "]\n";
    }
}
