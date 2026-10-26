<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\Position;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Modules\ApplicantManagement\Models\ScreeningReferenceData;
use Modules\ApplicantManagement\Models\ScreeningRequirementTemplate;
use Modules\ApplicantManagement\Models\ScreeningRequirementTemplateItem;

class ScreeningDemoSeeder extends Seeder
{
    public function run(): void
    {
        $this->command?->info('======================================================================');
        $this->command?->info('OXFORD SUITES MAKATI - PREPARING SCREENING REFERENCE DATA & TEMPLATES');
        $this->command?->info('======================================================================');

        // 1. DEPARTMENTS
        $departments = [
            ['code' => 'DEP-FO', 'name' => 'Front Office', 'description' => 'Lobby, guest registration, concierge, and rooms division.'],
            ['code' => 'DEP-FB', 'name' => 'Food & Beverage', 'description' => 'Restaurants, bars, banquets, and room service dining.'],
            ['code' => 'DEP-KC', 'name' => 'Kitchen / Culinary', 'description' => 'Food preparation, hot line stations, cold pantry, and food safety.'],
            ['code' => 'DEP-HK', 'name' => 'Housekeeping', 'description' => 'Guestroom cleanliness, public areas, and linen inventory.'],
            ['code' => 'DEP-SEC', 'name' => 'Security & Safety', 'description' => 'Perimeter security, CCTV surveillance, emergency evacuation, and asset protection.'],
            ['code' => 'DEP-ENG', 'name' => 'Engineering & Maintenance', 'description' => 'Hotel plant operations, HVAC chillers, generators, and facility maintenance.'],
            ['code' => 'DEP-WEL', 'name' => 'Spa & Wellness', 'description' => 'Holistic massage therapies, hydrothermal suites, and guest wellness.'],
            ['code' => 'DEP-HR', 'name' => 'Administration / HR', 'description' => 'Talent acquisition, employee welfare, labor compliance, and payroll.'],
        ];

        $deptIdMap = [];
        foreach ($departments as $d) {
            $dept = Department::where('code', $d['code'])->orWhere('name', $d['name'])->first();
            if ($dept) {
                $dept->update(['name' => $d['name'], 'description' => $d['description']]);
            } else {
                $dept = Department::create([
                    'code' => $d['code'],
                    'name' => $d['name'],
                    'description' => $d['description'],
                    'status' => 'Active',
                ]);
            }
            $deptIdMap[$d['code']] = $dept->department_id;
        }
        $this->command?->info('[1/4] Synced ' . count($departments) . ' departments.');

        // 2. POSITIONS
        $positions = [
            ['code' => 'POS-018', 'title' => 'Front Desk Receptionist', 'dept_code' => 'DEP-FO', 'level' => 'Staff', 'headcount' => 3],
            ['code' => 'POS-002', 'title' => 'Guest Relations Officer', 'dept_code' => 'DEP-FO', 'level' => 'Staff', 'headcount' => 2],
            ['code' => 'POS-004', 'title' => 'Bartender', 'dept_code' => 'DEP-FB', 'level' => 'Staff', 'headcount' => 2],
            ['code' => 'POS-003', 'title' => 'Restaurant Server', 'dept_code' => 'DEP-FB', 'level' => 'Staff', 'headcount' => 5],
            ['code' => 'POS-005', 'title' => 'Line Cook', 'dept_code' => 'DEP-KC', 'level' => 'Staff', 'headcount' => 4],
            ['code' => 'POS-006', 'title' => 'Pastry Chef', 'dept_code' => 'DEP-KC', 'level' => 'Staff', 'headcount' => 2],
            ['code' => 'POS-007', 'title' => 'Housekeeping Attendant', 'dept_code' => 'DEP-HK', 'level' => 'Staff', 'headcount' => 6],
            ['code' => 'POS-SEC-001', 'title' => 'Security and Loss Prevention Supervisor', 'dept_code' => 'DEP-SEC', 'level' => 'Supervisor', 'headcount' => 2],
            ['code' => 'POS-ENG-001', 'title' => 'Facilities Maintenance Supervisor', 'dept_code' => 'DEP-ENG', 'level' => 'Supervisor', 'headcount' => 2],
            ['code' => 'POS-SPA-001', 'title' => 'Spa and Wellness Supervisor', 'dept_code' => 'DEP-WEL', 'level' => 'Supervisor', 'headcount' => 2],
            ['code' => 'POS-008', 'title' => 'HR Assistant', 'dept_code' => 'DEP-HR', 'level' => 'Staff', 'headcount' => 2],
        ];

        $posIdMap = [];
        foreach ($positions as $p) {
            $deptId = $deptIdMap[$p['dept_code']] ?? 1;
            $pos = Position::where('title', $p['title'])->first();
            if ($pos) {
                $pos->update([
                    'department_id' => $deptId,
                    'requires_assessment' => 1,
                ]);
            } else {
                $pos = Position::create([
                    'position_code' => $p['code'],
                    'title' => $p['title'],
                    'department_id' => $deptId,
                    'salary_grade_id' => 4,
                    'requires_assessment' => 1,
                    'requires_practical' => 0,
                    'level' => $p['level'],
                    'headcount' => $p['headcount'],
                    'filled_count' => 0,
                ]);
            }
            $posIdMap[$p['title']] = $pos->position_id;
        }
        $this->command?->info('[2/4] Synced ' . count($positions) . ' positions.');

        // 3. REFERENCE DATA & ALIASES
        $referenceData = [
            'skill' => [
                ['Guest Relations', ['guest relations', 'guest relations management', 'guest engagement', 'vip guest relations']],
                ['Opera PMS', ['opera pms', 'opera', 'property management system', 'pms systems', 'pms', 'oracle hospitality opera']],
                ['Check-in / Check-out', ['check-in / check-out', 'check in check out', 'check-in', 'check-out', 'arrival and departure handling', 'express check-out']],
                ['Cash Handling', ['cash handling', 'cashiering', 'billing', 'funds handling', 'folio settlement', 'cash float']],
                ['Reservations', ['reservations', 'reservation management', 'booking management', 'room reservations']],
                ['Mixology', ['mixology', 'cocktail preparation', 'cocktail craft', 'drink mixing', 'beverage preparation']],
                ['Cocktail Craft', ['cocktail craft', 'signature cocktails', 'craft cocktails', 'cocktail garnishing']],
                ['Inventory', ['inventory', 'bar inventory', 'stock control', 'beverage par levels', 'stocktaking']],
                ['Bar Hygiene', ['bar hygiene', 'bar sanitation', 'glass washing', 'bar cleanliness']],
                ['Table Service', ['table service', 'food service', 'service sequence', 'dining room service']],
                ['POS Systems', ['pos systems', 'pos', 'point of sale', 'point of sale systems', 'micros', 'micros simphony', 'pos operation']],
                ['Banquet Service', ['banquet service', 'banquet operations', 'function service', 'catering service']],
                ['Food Safety', ['food safety', 'food safety compliance', 'food hygiene', 'sanitation', 'food sanitation']],
                ['Upselling', ['upselling', 'upsell techniques', 'suggestive selling', 'cross-selling']],
                ['Hot Kitchen', ['hot kitchen', 'hot line', 'line cooking', 'grill station', 'saute station']],
                ['Food Handler', ['food handler', 'food handling', 'safe food handling']],
                ['HACCP', ['haccp', 'haccp compliance', 'food safety management', 'haccp standards']],
                ['Mise en Place', ['mise en place', 'mise-en-place', 'prep work', 'station setup']],
                ['Plating', ['plating', 'food plating', 'plate presentation', 'culinary presentation']],
                ['Pastry', ['pastry', 'pastry arts', 'pastry production']],
                ['Baking', ['baking', 'commercial baking', 'oven operations']],
                ['Dessert Plating', ['dessert plating', 'pastry presentation', 'sweet course plating']],
                ['Room Turnover', ['room turnover', 'room cleaning', 'guestroom cleaning', 'bed making']],
                ['Linen Handling', ['linen handling', 'linen management', 'laundry operations', 'linen par levels']],
                ['Chemical Safety', ['chemical safety', 'cleaning chemical handling', 'msds compliance']],
                ['Public Area Cleaning', ['public area cleaning', 'public area maintenance', 'lobby sanitation']],
                ['Recruitment', ['recruitment', 'talent acquisition', 'sourcing', 'applicant screening']],
                ['201 Files', ['201 files', 'personnel files', 'employee records', 'records management']],
                ['Payroll Support', ['payroll support', 'payroll processing', 'payroll assistance', 'timekeeping']],
                ['DOLE Compliance', ['dole compliance', 'philippine labor standards', 'labor code compliance']],
                ['Complaint Handling', ['complaint handling', 'complaint resolution', 'guest complaint management', 'service recovery']],
                ['VIP Handling', ['vip handling', 'vip protocol', 'executive guest service']],
                ['Multilingual', ['multilingual', 'bilingual', 'foreign language']],
                ['CCTV Surveillance Matrix', ['cctv surveillance', 'cctv monitoring', 'security console', 'incident dispatch']],
                ['Access Control', ['access control', 'keycard audit', 'perimeter security', 'facility sentry']],
                ['Emergency Response', ['emergency response', 'fire safety', 'building evacuation', 'crisis response']],
                ['Building Management Systems (BMS)', ['bms', 'building management system', 'schneider ecostruxure', 'hvac controls']],
                ['Central HVAC Chiller Plant', ['chiller plant', 'central hvac', 'cooling towers', 'air handlers']],
                ['Generator ATS Systems', ['standby generator', 'ats switchgear', 'emergency power synchronization']],
                ['Preventive Maintenance (CMMS)', ['preventive maintenance', 'cmms', 'work order dispatch', 'facility repairs']],
                ['Luxury Spa Operations', ['spa operations', 'treatment protocols', 'spa management', 'wellness reception']],
                ['Therapist Scheduling', ['therapist scheduling', 'commission tracking', 'roster planning']],
                ['Hydrothermal Sanitation', ['hydrothermal sanitation', 'sauna cleaning', 'steam room hygiene', 'jacuzzi maintenance']],
                ['Traditional Hilot & Massage', ['hilot', 'swedish massage', 'deep tissue', 'shiatsu', 'massage therapy']],
            ],
            'certification' => [
                ['TESDA Front Office NC II', ['tesda front office nc ii', 'front office nc ii', 'front office services nc ii', 'tesda nc ii front office']],
                ['TESDA Bartending NC II', ['tesda bartending nc ii', 'bartending nc ii', 'bartending nc 2', 'tesda nc ii in bartending']],
                ['TESDA Food and Beverage Services NC II', ['food and beverage services nc ii', 'f&b services nc ii', 'fb services nc ii', 'tesda f&b nc ii']],
                ['TESDA Cookery NC II', ['tesda cookery nc ii', 'cookery nc ii', 'tesda cookery nc 2', 'commercial cooking nc ii', 'tesda nc ii in cookery']],
                ['TESDA Bread and Pastry Production NC II', ['bread and pastry production nc ii', 'baking nc ii', 'pastry production nc ii']],
                ['TESDA Housekeeping NC II', ['tesda housekeeping nc ii', 'housekeeping nc ii', 'housekeeping nc 2', 'tesda nc ii housekeeping']],
                ['Barista NC II', ['barista nc ii', 'tesda barista nc ii', 'coffee academy certificate']],
                ['Food Handler Certificate', ['food handler certificate', 'food handler\'s certificate', 'food handlers certificate', 'food safety certificate']],
                ['PNP-SOSIA Certified Security Officer License', ['pnp-sosia', 'pnp sosia', 'security officer license', 'blue card security']],
                ['Basic Occupational Safety and Health (BOSH SO2)', ['bosh', 'bosh so2', 'occupational safety and health certificate', 'dole osh']],
                ['PRC Registered Electrical Engineer License', ['registered electrical engineer', 'ree license', 'prc ree', 'professional electrical engineer']],
                ['Department of Health (DOH) Licensed Massage Therapist', ['doh lmt', 'licensed massage therapist', 'doh massage license', 'lmt']],
                ['TESDA Beauty Care (Skin & Body) Services NC II', ['tesda beauty care nc ii', 'beauty care nc ii', 'skin and body nc ii']],
            ],
            'education' => [
                ['Bachelor\'s Degree', ['bachelor\'s degree', 'bachelor\'s', 'bachelor', 'b.s.', 'bs', 'b.a.', 'ba', 'college graduate', 'bachelor degree']],
                ['Bachelor of Science in Hospitality Management', ['bachelor of science in hospitality management', 'bs hospitality management', 'bshm', 'bs hm', 'hospitality management degree', 'bs hotel and restaurant management', 'bshrm']],
                ['Bachelor of Science in Business Administration', ['bachelor of science in business administration', 'bsba', 'bs business administration', 'business administration degree']],
                ['Bachelor of Science in Tourism Management', ['bachelor of science in tourism management', 'bs tourism', 'bs tourism management', 'tourism degree']],
                ['Bachelor of Science in Criminology', ['bachelor of science in criminology', 'bs criminology', 'bs crim', 'criminology graduate']],
                ['Bachelor of Science in Electrical Engineering', ['bachelor of science in electrical engineering', 'bs electrical engineering', 'bsee', 'electrical engineering degree']],
                ['Vocational / TESDA', ['vocational / tesda', 'vocational', 'tesda', 'vocational diploma', 'technical course', 'technical vocational', 'nc ii holder']],
                ['High School Graduate', ['high school graduate', 'high school', 'secondary education', 'senior high school', 'senior high', 'grade 12', 'k to 12']],
                ['College Level', ['college level', 'college undergraduate', 'undergraduate', 'some college', 'associate degree', 'associate', 'diploma']],
                ['Master\'s Degree', ['master\'s degree', 'master\'s', 'master', 'm.s.', 'mba', 'graduate degree', 'postgraduate degree']],
            ],
            'experience' => [
                ['No Experience', ['no experience', 'fresh graduate', 'entry level', 'no work experience', 'student']],
                ['1-2 Years', ['1-2 years', '1 to 2 years', 'one to two years', 'at least 1 year', '1 year experience', '2 years experience']],
                ['3-5 Years', ['3-5 years', '3 to 5 years', 'three to five years', 'at least 3 years', '3 years experience', '5 years experience']],
                ['5+ Years', ['5+ years', '5 years and above', 'more than 5 years', 'five plus years', 'senior level experience', 'extensive experience']],
            ],
            'job_role' => [
                ['Front Desk Receptionist', ['front desk receptionist', 'front desk agent', 'hotel receptionist', 'front office attendant']],
                ['Guest Relations Officer', ['guest relations officer', 'gro', 'guest experience specialist', 'vip receptionist']],
                ['Bartender', ['bartender', 'mixologist', 'bar attendant', 'barkada', 'lead bartender']],
                ['Restaurant Server', ['restaurant server', 'waiter', 'waitress', 'food server', 'server', 'food and beverage attendant', 'f&b attendant', 'service crew']],
                ['Line Cook', ['line cook', 'station chef', 'commis chef', 'cook', 'station cook']],
                ['Pastry Chef', ['pastry chef', 'baker', 'commis pastry', 'dessert chef']],
                ['Housekeeping Attendant', ['housekeeping attendant', 'room attendant', 'hotel cleaner', 'chambermaid']],
                ['Security and Loss Prevention Supervisor', ['security supervisor', 'loss prevention supervisor', 'security shift in-charge']],
                ['Facilities Maintenance Supervisor', ['facilities supervisor', 'maintenance supervisor', 'chief engineer', 'building engineer']],
                ['Spa and Wellness Supervisor', ['spa supervisor', 'wellness supervisor', 'lead therapist']],
                ['HR Assistant', ['hr assistant', 'human resources assistant', 'hr records clerk', 'personnel assistant']],
            ],
        ];

        $refCount = 0;
        foreach ($referenceData as $dataType => $items) {
            foreach ($items as [$canonical, $aliases]) {
                ScreeningReferenceData::updateOrCreate(
                    ['data_type' => $dataType, 'canonical_value' => $canonical],
                    ['aliases_json' => $aliases, 'active' => true]
                );
                $refCount++;
            }
        }
        $this->command?->info("[3/4] Synced {$refCount} reference data items across 5 entity types.");

        // 4. REQUIREMENT TEMPLATES
        $requirementTemplates = [
            [
                'name' => 'Front Desk Receptionist — Core Requirements',
                'position_title' => 'Front Desk Receptionist',
                'description' => 'Guest-facing front office essentials the spaCy screening scores against.',
                'items' => [
                    ['skill', 'Guest Relations', true],
                    ['skill', 'Opera PMS', true],
                    ['skill', 'Check-in / Check-out', true],
                    ['skill', 'Cash Handling', true],
                    ['skill', 'Reservations', true],
                    ['certification', 'TESDA Front Office NC II', true],
                    ['education', 'Bachelor\'s Degree', true],
                    ['experience', '1-2 Years', true],
                ],
            ],
            [
                'name' => 'Bartender — Core Requirements',
                'position_title' => 'Bartender',
                'description' => 'Bar craft, inventory control and the TESDA bartending credential.',
                'items' => [
                    ['skill', 'Mixology', true],
                    ['skill', 'Cocktail Craft', true],
                    ['skill', 'Inventory', true],
                    ['skill', 'Bar Hygiene', true],
                    ['certification', 'TESDA Bartending NC II', true],
                    ['education', 'Vocational / TESDA', true],
                    ['experience', '1-2 Years', true],
                ],
            ],
            [
                'name' => 'Restaurant Server — Core Requirements',
                'position_title' => 'Restaurant Server',
                'description' => 'Table service and upselling requirements for the all-day dining outlet.',
                'items' => [
                    ['skill', 'Table Service', true],
                    ['skill', 'POS Systems', true],
                    ['skill', 'Banquet Service', true],
                    ['skill', 'Food Safety', true],
                    ['skill', 'Upselling', true],
                    ['education', 'High School Graduate', true],
                    ['experience', 'No Experience', true],
                ],
            ],
            [
                'name' => 'Line Cook — Core Requirements',
                'position_title' => 'Line Cook',
                'description' => 'Hot-kitchen station requirements with food safety credentials.',
                'items' => [
                    ['skill', 'Hot Kitchen', true],
                    ['skill', 'Food Handler', true],
                    ['skill', 'HACCP', true],
                    ['skill', 'Mise en Place', true],
                    ['skill', 'Plating', true],
                    ['certification', 'TESDA Cookery NC II', true],
                    ['education', 'Vocational / TESDA', true],
                    ['experience', '1-2 Years', true],
                ],
            ],
            [
                'name' => 'Housekeeping Attendant — Core Requirements',
                'position_title' => 'Housekeeping Attendant',
                'description' => 'Room turnover and chemical-safety requirements for rooms division.',
                'items' => [
                    ['skill', 'Room Turnover', true],
                    ['skill', 'Linen Handling', true],
                    ['skill', 'Chemical Safety', true],
                    ['skill', 'Public Area Cleaning', true],
                    ['certification', 'TESDA Housekeeping NC II', true],
                    ['education', 'High School Graduate', true],
                    ['experience', 'No Experience', true],
                ],
            ],
            [
                'name' => 'Security & Loss Prevention Supervisor — Core Requirements',
                'position_title' => 'Security and Loss Prevention Supervisor',
                'description' => 'CCTV surveillance matrix, keycard audits, and PNP-SOSIA security standards.',
                'items' => [
                    ['skill', 'CCTV Surveillance Matrix', true],
                    ['skill', 'Access Control', true],
                    ['skill', 'Emergency Response', true],
                    ['certification', 'PNP-SOSIA Certified Security Officer License', true],
                    ['education', 'Bachelor of Science in Criminology', true],
                    ['experience', '3-5 Years', true],
                ],
            ],
            [
                'name' => 'Facilities Maintenance Supervisor — Core Requirements',
                'position_title' => 'Facilities Maintenance Supervisor',
                'description' => 'BMS automation, centralized chillers, and electrical engineering operations.',
                'items' => [
                    ['skill', 'Building Management Systems (BMS)', true],
                    ['skill', 'Central HVAC Chiller Plant', true],
                    ['skill', 'Generator ATS Systems', true],
                    ['skill', 'Preventive Maintenance (CMMS)', true],
                    ['certification', 'PRC Registered Electrical Engineer License', true],
                    ['education', 'Bachelor of Science in Electrical Engineering', true],
                    ['experience', '3-5 Years', true],
                ],
            ],
            [
                'name' => 'Spa and Wellness Supervisor — Core Requirements',
                'position_title' => 'Spa and Wellness Supervisor',
                'description' => 'Luxury wellness SOPs, therapist scheduling, and DOH LMT standards.',
                'items' => [
                    ['skill', 'Luxury Spa Operations', true],
                    ['skill', 'Therapist Scheduling', true],
                    ['skill', 'Hydrothermal Sanitation', true],
                    ['skill', 'Traditional Hilot & Massage', true],
                    ['certification', 'Department of Health (DOH) Licensed Massage Therapist', true],
                    ['education', 'Bachelor of Science in Hospitality Management', true],
                    ['experience', '1-2 Years', true],
                ],
            ],
            [
                'name' => 'HR Assistant — Core Requirements',
                'position_title' => 'HR Assistant',
                'description' => 'Recruitment support, employee 201 records, and DOLE compliance.',
                'items' => [
                    ['skill', 'Recruitment', true],
                    ['skill', '201 Files', true],
                    ['skill', 'Payroll Support', true],
                    ['skill', 'DOLE Compliance', true],
                    ['education', 'Bachelor\'s Degree', true],
                    ['experience', '1-2 Years', true],
                ],
            ],
        ];

        foreach ($requirementTemplates as $t) {
            $posId = $posIdMap[$t['position_title']] ?? null;
            $template = ScreeningRequirementTemplate::updateOrCreate(
                ['name' => $t['name']],
                [
                    'position_id' => $posId,
                    'description' => $t['description'],
                    'active' => true,
                ]
            );

            // Re-seed chips cleanly
            $template->items()->delete();
            foreach ($t['items'] as [$entityType, $val, $req]) {
                ScreeningRequirementTemplateItem::create([
                    'template_id' => $template->template_id,
                    'entity_type' => $entityType,
                    'value' => $val,
                    'required' => (bool) $req,
                ]);
            }
        }
        $this->command?->info('[4/4] Synced ' . count($requirementTemplates) . ' requirement templates with active chips.');

        // Clear cache
        Artisan::call('cache:clear');
        $this->command?->info('Laravel cache cleared successfully!');
        $this->command?->info('======================================================================');
        $this->command?->info('READY FOR DEMO / SCREENING IN DOKPLOY & LOCAL ENVIRONMENTS!');
        $this->command?->info('======================================================================');
    }
}
