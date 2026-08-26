<?php

namespace Modules\ApplicantManagement\Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Modules\ApplicantManagement\Models\ScreeningReferenceData;

/**
 * Seeds screening_reference_data from the same values as the NLP service
 * bundled seed JSON (app/data/*.json), making the database the manageable
 * source of truth for skills, job roles, certifications and aliases.
 */
class ScreeningReferenceDataSeeder extends Seeder
{
    public function run(): void
    {
        $seed = [            'skill' => [
                'Customer Service' => ['customer service', 'guest service', 'customer assistance', 'client service'],
                'Communication' => ['communication', 'communication skills', 'verbal communication', 'written communication'],
                'Coffee Preparation' => ['coffee preparation', 'coffee making', 'espresso making', 'espresso extraction', 'latte art', 'coffee brewing'],
                'Barista Operations' => ['barista operations', 'barista', 'cafe service'],
                'Mixology' => ['mixology', 'cocktail preparation', 'cocktail craft', 'drink mixing', 'beverage preparation'],
                'Food Safety' => ['food safety', 'food safety compliance', 'food hygiene', 'sanitation', 'food sanitation'],
                'HACCP' => ['haccp', 'haccp compliance', 'food safety management'],
                'Knife Skills' => ['knife skills', 'knife handling'],
                'Plating' => ['plating', 'food plating', 'plate presentation', 'presentation'],
                'Mise en Place' => ['mise en place', 'mise-en-place'],
                'Hot Kitchen' => ['hot kitchen', 'hot line', 'line cooking', 'grill station', 'saute station'],
                'Pastry and Baking' => ['pastry', 'baking', 'pastry arts', 'dessert preparation', 'breads and pastries'],
                'Room Turnover' => ['room turnover', 'room cleaning', 'guestroom cleaning'],
                'Linen Handling' => ['linen handling', 'linen management', 'laundry operations'],
                'Public Area Cleaning' => ['public area cleaning', 'public area maintenance'],
                'Chemical Safety' => ['chemical safety', 'cleaning chemical handling'],
                'Guest Relations' => ['guest relations', 'guest relations management', 'guest engagement'],
                'Front Office Operations' => ['front office', 'front office operations', 'front desk', 'reception operations'],
                'Check-in / Check-out' => ['check-in / check-out', 'check in check out', 'check-in', 'check-out', 'arrival and departure handling'],
                'Reservations' => ['reservations', 'reservation management', 'booking management'],
                'Property Management Systems' => ['opera pms', 'opera', 'property management system', 'pms systems', 'pms'],
                'POS Systems' => ['pos systems', 'pos', 'point of sale', 'point of sale systems', 'micros', 'pos operation'],
                'Cash Handling' => ['cash handling', 'cashiering', 'billing', 'funds handling'],
                'Upselling' => ['upselling', 'upsell techniques', 'suggestive selling', 'cross-selling'],
                'Table Service' => ['table service', 'food service', 'service sequence', 'dining room service'],
                'Banquet Service' => ['banquet service', 'banquet operations', 'function service'],
                'Inventory Control' => ['inventory control', 'inventory management', 'stock control', 'stocktaking'],
                'Housekeeping Operations' => ['housekeeping', 'housekeeping operations', 'housekeeping procedures'],
                'Complaint Handling' => ['complaint handling', 'complaint resolution', 'guest complaint management'],
                'Teamwork' => ['teamwork', 'team collaboration', 'working with others'],
                'Time Management' => ['time management', 'prioritization', 'multitasking'],
                'Attention to Detail' => ['attention to detail', 'detail oriented', 'detail-oriented'],
                'Problem Solving' => ['problem solving', 'problem-solving', 'troubleshooting'],
                'Hotel Operations' => ['hotel operations', 'property operations'],
                'Recruitment Support' => ['recruitment', 'recruitment support', 'sourcing and screening'],
                'Records Documentation' => ['201 files', 'documentation', 'records management', 'file management'],
                'MS Office' => ['ms office', 'microsoft office', 'ms word', 'ms excel', 'excel', 'word processing'],
                'Confidentiality' => ['confidentiality', 'data privacy', 'records confidentiality'],
                'Payroll Support' => ['payroll support', 'payroll processing', 'payroll assistance'],
                'Maintenance Basics' => ['basic maintenance', 'building maintenance', 'facilities maintenance', 'repairs'],
                'Safety Compliance' => ['safety compliance', 'workplace safety', 'safety procedures'],
                'Responsible Alcohol Service' => ['responsible alcohol service', 'responsible service of alcohol', 'alcohol awareness'],
            ],
            'job_role' => [
                'Bartender' => ['bartender', 'bar tender', 'barman', 'barkeep', 'mixologist'],
                'Barista' => ['barista', 'coffee shop staff', 'cafe barista', 'coffee attendant'],
                'Line Cook' => ['line cook', 'cook', 'station cook', 'hot kitchen cook', 'commis chef', 'kitchen cook'],
                'Chef' => ['chef', 'sous chef', 'head chef', 'executive chef', 'chef de partie'],
                'Pastry Chef' => ['pastry chef', 'baker', 'pastry cook', 'baker chef'],
                'Kitchen Helper' => ['kitchen helper', 'dishwasher', 'kitchen aide', 'steward', 'kitchen steward'],
                'Housekeeping Attendant' => ['housekeeping attendant', 'room attendant', 'housekeeper', 'chambermaid', 'roomboy', 'public area attendant'],
                'Laundry Attendant' => ['laundry attendant', 'laundry staff'],
                'Restaurant Server' => ['restaurant server', 'waiter', 'waitress', 'food server', 'server', 'food and beverage attendant', 'f&b attendant', 'service crew'],
                'Hostess' => ['hostess', 'food host', 'restaurant host'],
                'Front Desk Receptionist' => ['front desk receptionist', 'front desk officer', 'receptionist', 'front desk agent', 'front desk staff', 'front office associate', 'guest service agent'],
                'Guest Relations Officer' => ['guest relations officer', 'gro', 'guest relations coordinator'],
                'Concierge' => ['concierge', 'bell captain', 'bellman'],
                'HR Assistant' => ['hr assistant', 'human resource assistant', 'human resources assistant', 'hr staff', 'recruitment assistant'],
                'HR Manager' => ['hr manager', 'human resources manager', 'hr administration manager'],
                'General Manager' => ['general manager', 'gm', 'property manager'],
                'Supervisor' => ['supervisor', 'shift supervisor', 'team leader'],
                'Maintenance Technician' => ['maintenance technician', 'maintenance staff', 'handyman', 'building maintenance staff'],
            ],
            'certification' => [
                'TESDA Cookery NC II' => ['tesda cookery nc ii', 'cookery nc ii', 'tesda cookery nc 2', 'commercial cooking nc ii', 'tesda nc ii in cookery'],
                'TESDA Bartending NC II' => ['tesda bartending nc ii', 'bartending nc ii', 'bartending nc 2', 'tesda nc ii in bartending'],
                'TESDA Housekeeping NC II' => ['tesda housekeeping nc ii', 'housekeeping nc ii', 'housekeeping nc 2'],
                'TESDA Front Office NC II' => ['tesda front office nc ii', 'front office nc ii', 'front office services nc ii'],
                'TESDA Food and Beverage Services NC II' => ['food and beverage services nc ii', 'f&b services nc ii', 'fb services nc ii', 'food and beverage nc ii'],
                'TESDA Bread and Pastry Production NC II' => ['bread and pastry production nc ii', 'baking nc ii', 'pastry production nc ii'],
                'Food Handler Certificate' => ['food handler certificate', 'food handler\'s certificate', 'food handlers certificate', 'food safety certificate', 'food handler card'],
                'First Aid Certificate' => ['first aid certificate', 'first aid training certificate', 'standard first aid'],
                'Culinary Diploma' => ['culinary diploma', 'diploma in culinary arts', 'culinary arts diploma'],
                'Driver\'s License' => ['driver\'s license', 'drivers license', 'professional driver license', 'non-professional driver license'],
                'Barista NC II' => ['barista nc ii', 'tesda barista nc ii', 'coffee academy certificate'],
            ],
        ];

        foreach ($seed as $type => $entries) {
            foreach ($entries as $canonical => $aliases) {
                DB::table((new ScreeningReferenceData)->getTable())->updateOrInsert([
                    'data_type' => $type,
                    'canonical_value' => $canonical,
                ], [
                    'aliases_json' => json_encode($aliases),
                    'active' => true,
                ]);
            }
        }
    }
}