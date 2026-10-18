<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Tier-1 thin LMS — handbook content patch.
 *
 * The learning catalog itself (LMS-101/102/103) is owned by
 * HotelHrDatabaseSeeder (database/seeders/data/hotel_hr_seed_mysql.sql, "Domain 6"),
 * which inserts the course rows with explicit ids. This seeder therefore only
 * patches the Tier-1 additions onto the existing rows:
 *
 *   content_text, estimated_reading_minutes, estimated_pages, mandatory
 *
 * It is UPDATE-ONLY on purpose — never insert here, or we would claim auto-increment
 * ids 1-3 and collide with the fixture's explicit ids ("Duplicate entry '1' for PRIMARY").
 *
 * Run standalone:  php artisan db:seed --class=LmsTierOneSeeder
 */
class LmsTierOneSeeder extends Seeder
{
    public function run(): void
    {
        $applied = 0;
        $missing = [];

        foreach ($this->courses() as $course) {
            $exists = DB::table('learning_courses')
                ->where('course_code', $course['course_code'])
                ->exists();

            if (! $exists) {
                $missing[] = $course['course_code'];
                continue;
            }

            DB::table('learning_courses')
                ->where('course_code', $course['course_code'])
                ->update([
                    'content_text' => $course['content_text'],
                    'estimated_reading_minutes' => $course['estimated_reading_minutes'],
                    'estimated_pages' => $course['estimated_pages'],
                    'mandatory' => $course['mandatory'],
                    'updated_at' => now(),
                ]);

            $applied++;
        }

        if ($missing !== []) {
            $this->command?->warn(
                'LMS course row(s) not found: '.implode(', ', $missing).
                '. Run HotelHrDatabaseSeeder first (it owns the catalog).'
            );
        }

        $this->command?->info("Tier-1 LMS handbook content patched onto {$applied} course(s).");
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function courses(): array
    {
        return [
            [
                'course_code' => 'LMS-101',
                'estimated_reading_minutes' => 20,
                'estimated_pages' => 18,
                'mandatory' => true,
                'content_text' => $this->foodSafetyHandbook(),
            ],
            [
                'course_code' => 'LMS-102',
                'estimated_reading_minutes' => 15,
                'estimated_pages' => 12,
                'mandatory' => false,
                'content_text' => $this->customerExcellenceHandbook(),
            ],
            [
                'course_code' => 'LMS-103',
                'estimated_reading_minutes' => 25,
                'estimated_pages' => 22,
                'mandatory' => true,
                'content_text' => $this->fireSafetyHandbook(),
            ],
        ];
    }

    private function foodSafetyHandbook(): string
    {
        return <<<'MD'
# Food Safety & Sanitation — Level 2

## 1. Why food safety matters
Foodborne illness is preventable. Every team member is personally responsible for the
safety of the food we serve. A single lapse can cause guest illness, damage our reputation
and put the property's licence at risk.

## 2. Personal hygiene
- Wash hands thoroughly with soap and warm water for at least 20 seconds.
- Wash hands after using the restroom, handling raw meat, sneezing, or touching your face.
- Keep fingernails short and clean. Do not wear nail polish or false nails in the kitchen.
- Report any illness (vomiting, diarrhoea, fever, jaundice) to your supervisor immediately
  and do not handle food.
- Wear a clean uniform and keep hair restrained under a hat or hairnet.

## 3. The temperature danger zone
Bacteria multiply fastest between 5 degrees Celsius (41 degrees Fahrenheit) and
60 degrees Celsius (140 degrees Fahrenheit). Keep food out of this range.
- Cold holding: 4 degrees Celsius (40 degrees Fahrenheit) or colder.
- Hot holding: 60 degrees Celsius (140 degrees Fahrenheit) or hotter.
- Refrigerators: 4 degrees Celsius (40 degrees Fahrenheit) or below.
- Freezers: minus 18 degrees Celsius (0 degrees Fahrenheit) or below.
- Reheating leftovers: heat to 74 degrees Celsius (165 degrees Fahrenheit) for at least 15 seconds.
- The two-hour rule: food left in the danger zone for more than two hours must be discarded.

## 4. Avoiding cross-contamination
- Use separate cutting boards: one colour for raw meat, another for ready-to-eat food.
- Never store raw meat above ready-to-eat food in the refrigerator.
- Sanitise work surfaces, knives and utensils between tasks.
- Change gloves and wash hands when moving from raw to ready-to-eat food.

## 5. Receiving and storage
- Inspect deliveries for temperature, packaging and expiry before accepting.
- Reject any chilled item delivered above 4 degrees Celsius.
- Apply FIFO (First In, First Out): store older stock in front, newer stock behind.
- Label and date all prepared food; use within the marked shelf life.
- Keep dry stores cool, dry and off the floor.

## 6. Cleaning and sanitising
- Cleaning removes dirt; sanitising reduces bacteria to safe levels. Do both.
- Use the three-compartment sink method: wash, rinse, then sanitise.
- Sanitiser must be mixed to the correct concentration; follow the label.
- Clean as you go, and complete a full cleaning schedule at the end of every shift.

## 7. HACCP in practice
Hazard Analysis and Critical Control Points (HACCP) is our food-safety system.
- Identify hazards at each step of the flow of food.
- Set critical limits (for example, cooking temperatures).
- Monitor, record and correct any deviation.
- Keep accurate temperature and cleaning logs — they are legal records.

## 8. Allergen awareness
The fourteen major allergens include peanuts, tree nuts, milk, eggs, fish, shellfish,
soy, wheat and sesame. Always confirm allergens with the guest and never guess.
Prevent cross-contact by using dedicated utensils and surfaces.

## 9. Pest control
- Keep bins covered and emptied regularly.
- Report any signs of pests (droppings, gnaw marks, insects) to your supervisor at once.
- Never store food on the floor, and fix leaks promptly to remove water sources.

## 10. Your role
Follow every procedure, complete your logs honestly, and speak up if something looks
unsafe. When in doubt, throw it out.
MD;
    }

    private function customerExcellenceHandbook(): string
    {
        return <<<'MD'
# Customer Excellence in Hospitality

## 1. The Oxford Suites service promise
Every guest should feel welcomed, valued and cared for. Service is not a department —
it is everyone's job, in every interaction, every shift.

## 2. First impressions
- Greet every guest within 10 seconds and with a genuine smile.
- Use the guest's name whenever you know it.
- Make eye contact and keep a friendly, open posture.

## 3. Anticipating needs
Great service means acting before the guest has to ask. Notice the small things:
a full bin, a guest looking for directions, a family needing a highchair.

## 4. Handling complaints (LEARN)
- Listen fully without interrupting.
- Empathise and apologise sincerely for the experience.
- Ask questions to understand exactly what happened.
- Resolve or escalate quickly — own the problem.
- Notify the right team and follow up to confirm the guest is satisfied.

## 5. Communication standards
- Answer the phone within three rings with a warm, professional greeting.
- Never say "that's not my department"; instead say "let me get the right person for you".
- Keep promises: if you say you will follow up, do it.

## 6. Recovering a dissatisfied guest
A recovered guest can become our most loyal. Empower staff to make small gestures of
goodwill within policy, and always close the loop with a manager.

## 7. Teamwork
Coordinate with housekeeping, kitchen and front office so the guest never sees our
internal seams. Escalate unsafe or unresolved issues to your supervisor.

## 8. Measuring excellence
We track guest satisfaction scores, review feedback and repeat visits. Every positive
guest comment reflects the whole team.
MD;
    }

    private function fireSafetyHandbook(): string
    {
        return <<<'MD'
# Fire Safety & Emergency Response

## 1. The fire triangle
Fire needs three things: fuel, oxygen and heat. Remove any one and the fire cannot
start or continue. Prevention means keeping fuel and heat sources apart.

## 2. Fire prevention
- Keep exits, corridors and stairwells clear at all times.
- Never overload electrical sockets; report damaged cables immediately.
- Keep cooking equipment clean and free of grease build-up.
- Store flammable materials away from heat sources.
- Do not smoke anywhere except designated areas.

## 3. Classes of fire
- Class A: solid materials such as wood, paper and cloth.
- Class B: flammable liquids such as oil and petrol.
- Class C: flammable gases.
- Electrical fires: switch off the power first if it is safe to do so.
- Never use water on an electrical fire or on a fat/oil fire.

## 4. Fire extinguishers (PASS)
- Pull the pin.
- Aim at the base of the fire.
- Squeeze the handle.
- Sweep from side to side.
Only tackle a small fire, always keep your back to an exit, and never let the fire
come between you and your way out.

## 5. If you discover a fire
1. Raise the alarm immediately.
2. Alert guests and colleagues.
3. Call the emergency number and state the location clearly.
4. Evacuate if the fire cannot be controlled with one extinguisher.
5. Never re-enter a building once evacuated.

## 6. Evacuation
- Know your nearest fire exit and the assembly point for your shift.
- Leave belongings behind; close doors as you go if safe to do so.
- Use stairs, never lifts.
- Assist guests with mobility needs.
- Do not return until the fire warden declares it safe.

## 7. Assembly and roll call
Report to your designated assembly point and answer the roll call so we can confirm
everyone is accounted for. Report anyone missing to the fire warden immediately.

## 8. Fire wardens
Wardens are responsible for sweeping their area, guiding evacuation and reporting to
the incident commander. Support them and follow their instructions.

## 9. Other emergencies
The same calm, staged response applies to medical emergencies, gas leaks and bomb
threats: alert, assess, act, and communicate clearly with the incident lead.

## 10. Your responsibility
Take every alarm seriously, keep escape routes clear, and complete your fire-safety
training every year.
MD;
    }
}
