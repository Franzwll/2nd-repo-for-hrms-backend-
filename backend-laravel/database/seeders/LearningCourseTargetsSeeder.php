<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Seeds department/position-specific learning courses and their target mappings.
 *
 * Department IDs (from hotel_hr_seed_mysql.sql):
 *   1 = Front Office    4 = Housekeeping     7 = Wellness
 *   2 = Food & Beverage 5 = Administration   8 = Finance
 *   3 = Kitchen         6 = Security         9 = Engineering
 *
 * Courses are divided into:
 *   - Universal (no targets) — every employee sees them
 *   - Department-specific — only employees in those departments see them
 *   - Position-specific — only employees in those positions see them
 *
 * Run: php artisan db:seed --class=LearningCourseTargetsSeeder
 */
class LearningCourseTargetsSeeder extends Seeder
{
    public function run(): void
    {
        $inserted = 0;
        $skipped = 0;

        // ── 1. Insert new department-specific courses ──────────────────────
        foreach ($this->newCourses() as $course) {
            $exists = DB::table('learning_courses')
                ->where('course_code', $course['course_code'])
                ->exists();

            if ($exists) {
                $skipped++;
                continue;
            }

            DB::table('learning_courses')->insert([
                'course_code'               => $course['course_code'],
                'title'                     => $course['title'],
                'category'                  => $course['category'],
                'description'               => $course['description'],
                'content_text'              => $course['content_text'] ?? null,
                'estimated_reading_minutes' => $course['estimated_reading_minutes'] ?? null,
                'estimated_pages'           => $course['estimated_pages'] ?? null,
                'mandatory'                 => $course['mandatory'] ?? false,
                'created_at'                => now(),
                'updated_at'                => now(),
            ]);

            $inserted++;
        }

        $this->command?->info("Inserted {$inserted} new courses, skipped {$skipped} existing.");

        // ── 2. Build target mappings ───────────────────────────────────────
        // Clear existing targets to re-seed cleanly.
        DB::table('learning_course_targets')->truncate();

        $targets = 0;

        foreach ($this->courseTargets() as $mapping) {
            $course = DB::table('learning_courses')
                ->where('course_code', $mapping['course_code'])
                ->first();

            if (! $course) {
                $this->command?->warn("Course {$mapping['course_code']} not found — skipping targets.");
                continue;
            }

            foreach ($mapping['targets'] as $target) {
                DB::table('learning_course_targets')->insert([
                    'course_id'     => $course->course_id,
                    'department_id' => $target['department_id'] ?? null,
                    'position_id'   => $target['position_id'] ?? null,
                    'is_mandatory'  => $target['is_mandatory'] ?? false,
                    'created_at'    => now(),
                ]);

                $targets++;
            }
        }

        $this->command?->info("Created {$targets} course target mappings.");

        // ── 3. Auto-assign courses to existing employees ──────────────────
        $this->autoAssignAll();
    }

    /**
     * Auto-assign applicable courses to every active employee who doesn't
     * already have an employee_learning row for that course.
     */
    private function autoAssignAll(): void
    {
        $employees = DB::table('employees')
            ->where('status', 'Active')
            ->get(['employee_id', 'department_id', 'position_id']);

        $assigned = 0;

        foreach ($employees as $emp) {
            $courseIds = $this->resolveCoursesFor(
                (int) $emp->department_id,
                $emp->position_id ? (int) $emp->position_id : null
            );

            foreach ($courseIds as $courseId) {
                $exists = DB::table('employee_learning')
                    ->where('employee_id', $emp->employee_id)
                    ->where('course_id', $courseId)
                    ->exists();

                if ($exists) {
                    continue;
                }

                DB::table('employee_learning')->insert([
                    'employee_id'   => $emp->employee_id,
                    'course_id'     => $courseId,
                    'status'        => 'Assigned',
                    'assigned_date' => now()->toDateString(),
                    'created_at'    => now(),
                    'updated_at'    => now(),
                ]);

                $assigned++;
            }
        }

        $this->command?->info("Auto-assigned {$assigned} course enrollments to existing employees.");
    }

    /**
     * Resolve which course IDs an employee should see based on their
     * department and position.
     *
     * @return int[]
     */
    private function resolveCoursesFor(int $departmentId, ?int $positionId): array
    {
        // Universal courses (no targets)
        $universal = DB::table('learning_courses')
            ->whereNotExists(function ($q) {
                $q->select(DB::raw(1))
                    ->from('learning_course_targets')
                    ->whereColumn('learning_course_targets.course_id', 'learning_courses.course_id');
            })
            ->pluck('course_id')
            ->all();

        // Targeted courses matching this employee's department or position
        $targeted = DB::table('learning_courses')
            ->whereExists(function ($q) use ($departmentId, $positionId) {
                $q->select(DB::raw(1))
                    ->from('learning_course_targets')
                    ->whereColumn('learning_course_targets.course_id', 'learning_courses.course_id')
                    ->where(function ($w) use ($departmentId, $positionId) {
                        $w->where('learning_course_targets.department_id', $departmentId);
                        if ($positionId) {
                            $w->orWhere('learning_course_targets.position_id', $positionId);
                        }
                    });
            })
            ->pluck('course_id')
            ->all();

        return array_unique(array_merge($universal, $targeted));
    }

    // =====================================================================
    // COURSE DEFINITIONS
    // =====================================================================

    /**
     * New department-specific courses to insert.
     * The original 3 (LMS-101, 102, 103) already exist in the main seeder.
     */
    private function newCourses(): array
    {
        return [
            // ── Front Office ─────────────────────────────────────────────
            [
                'course_code'               => 'LMS-201',
                'title'                     => 'Front Desk Operations & Check-In Protocol',
                'category'                  => 'Front Office',
                'description'               => 'Standard operating procedures for guest check-in, check-out, room assignment, and PMS usage.',
                'mandatory'                 => true,
                'estimated_reading_minutes' => 18,
                'estimated_pages'           => 8,
                'content_text'              => $this->frontDeskHandbook(),
            ],
            [
                'course_code'               => 'LMS-202',
                'title'                     => 'Reservations & Revenue Management Basics',
                'category'                  => 'Front Office',
                'description'               => 'Reservation handling, overbooking protocols, rate parity, and upselling techniques.',
                'mandatory'                 => false,
                'estimated_reading_minutes' => 14,
                'estimated_pages'           => 6,
                'content_text'              => $this->reservationsHandbook(),
            ],

            // ── Food & Beverage ──────────────────────────────────────────
            [
                'course_code'               => 'LMS-301',
                'title'                     => 'Restaurant Service Standards & Table Etiquette',
                'category'                  => 'Food & Beverage',
                'description'               => 'Table service flow, menu knowledge, wine service basics, and guest interaction standards.',
                'mandatory'                 => true,
                'estimated_reading_minutes' => 15,
                'estimated_pages'           => 7,
                'content_text'              => $this->fbServiceHandbook(),
            ],
            [
                'course_code'               => 'LMS-302',
                'title'                     => 'Responsible Alcohol Service',
                'category'                  => 'Food & Beverage',
                'description'               => 'Legal responsibilities, signs of intoxication, and refusal techniques for bartenders and servers.',
                'mandatory'                 => true,
                'estimated_reading_minutes' => 10,
                'estimated_pages'           => 5,
                'content_text'              => $this->alcoholServiceHandbook(),
            ],

            // ── Kitchen / Culinary ───────────────────────────────────────
            [
                'course_code'               => 'LMS-401',
                'title'                     => 'Kitchen Station Management & HACCP Compliance',
                'category'                  => 'Culinary & Safety',
                'description'               => 'Station setup, mise en place, HACCP logs, and kitchen workflow for line cooks and pastry chefs.',
                'mandatory'                 => true,
                'estimated_reading_minutes' => 20,
                'estimated_pages'           => 9,
                'content_text'              => $this->kitchenStationHandbook(),
            ],

            // ── Housekeeping ─────────────────────────────────────────────
            [
                'course_code'               => 'LMS-501',
                'title'                     => 'Guestroom Cleaning Standards & Turndown Protocol',
                'category'                  => 'Housekeeping',
                'description'               => 'Step-by-step room cleaning sequence, turndown service, minibar checks, and linen handling.',
                'mandatory'                 => true,
                'estimated_reading_minutes' => 16,
                'estimated_pages'           => 7,
                'content_text'              => $this->housekeepingHandbook(),
            ],

            // ── Security ─────────────────────────────────────────────────
            [
                'course_code'               => 'LMS-601',
                'title'                     => 'Hotel Security & Emergency Protocols',
                'category'                  => 'Security',
                'description'               => 'Patrol procedures, CCTV monitoring, incident reporting, and guest safety protocols.',
                'mandatory'                 => true,
                'estimated_reading_minutes' => 14,
                'estimated_pages'           => 6,
                'content_text'              => $this->securityHandbook(),
            ],

            // ── Wellness / Spa ───────────────────────────────────────────
            [
                'course_code'               => 'LMS-701',
                'title'                     => 'Spa Service Standards & Guest Wellness',
                'category'                  => 'Wellness',
                'description'               => 'Treatment protocols, hygiene standards, guest consultation, and spa equipment care.',
                'mandatory'                 => true,
                'estimated_reading_minutes' => 12,
                'estimated_pages'           => 5,
                'content_text'              => $this->spaHandbook(),
            ],

            // ── Admin / HR ───────────────────────────────────────────────
            [
                'course_code'               => 'LMS-801',
                'title'                     => 'HR Policies, Labor Law & Employee Handbook',
                'category'                  => 'Administration',
                'description'               => 'Company policies, DOLE labor standards, leave entitlements, and disciplinary procedures.',
                'mandatory'                 => true,
                'estimated_reading_minutes' => 20,
                'estimated_pages'           => 10,
                'content_text'              => $this->hrPoliciesHandbook(),
            ],

            // ── Finance ──────────────────────────────────────────────────
            [
                'course_code'               => 'LMS-901',
                'title'                     => 'Hotel Accounting & Financial Controls',
                'category'                  => 'Finance',
                'description'               => 'Revenue posting, petty cash procedures, month-end close, and audit compliance.',
                'mandatory'                 => true,
                'estimated_reading_minutes' => 16,
                'estimated_pages'           => 7,
                'content_text'              => $this->financeHandbook(),
            ],

            // ── Engineering ──────────────────────────────────────────────
            [
                'course_code'               => 'LMS-1001',
                'title'                     => 'Preventive Maintenance & Facilities Safety',
                'category'                  => 'Engineering',
                'description'               => 'PM schedules, work-order systems, electrical safety, and building code compliance.',
                'mandatory'                 => true,
                'estimated_reading_minutes' => 15,
                'estimated_pages'           => 7,
                'content_text'              => $this->engineeringHandbook(),
            ],
        ];
    }

    // =====================================================================
    // TARGET MAPPINGS
    // =====================================================================

    /**
     * Defines which courses target which departments/positions.
     * Courses NOT listed here become universal (everyone sees them).
     *
     * Department IDs:
     *   1=Front Office, 2=F&B, 3=Kitchen, 4=Housekeeping, 5=Admin/HR,
     *   6=Security, 7=Wellness, 8=Finance, 9=Engineering
     */
    private function courseTargets(): array
    {
        return [
            // ── Existing courses ──────────────────────────────────────────
            // LMS-101: Food Safety → Kitchen + F&B
            [
                'course_code' => 'LMS-101',
                'targets' => [
                    ['department_id' => 3, 'is_mandatory' => true],  // Kitchen
                    ['department_id' => 2, 'is_mandatory' => true],  // F&B
                ],
            ],
            // LMS-102: Customer Excellence → Front Office + F&B + Housekeeping + Wellness
            [
                'course_code' => 'LMS-102',
                'targets' => [
                    ['department_id' => 1, 'is_mandatory' => true],  // Front Office
                    ['department_id' => 2, 'is_mandatory' => true],  // F&B
                    ['department_id' => 4, 'is_mandatory' => false], // Housekeeping
                    ['department_id' => 7, 'is_mandatory' => true],  // Wellness
                ],
            ],
            // LMS-103: Fire Safety → Universal (NO targets = everyone)
            // (not listed here, so it stays universal)

            // ── New department-specific courses ───────────────────────────
            // Front Office courses
            [
                'course_code' => 'LMS-201',
                'targets' => [
                    ['department_id' => 1, 'is_mandatory' => true],
                ],
            ],
            [
                'course_code' => 'LMS-202',
                'targets' => [
                    ['department_id' => 1, 'is_mandatory' => false],
                ],
            ],
            // F&B courses
            [
                'course_code' => 'LMS-301',
                'targets' => [
                    ['department_id' => 2, 'is_mandatory' => true],
                ],
            ],
            [
                'course_code' => 'LMS-302',
                'targets' => [
                    ['department_id' => 2, 'is_mandatory' => true],
                    ['position_id' => 4, 'is_mandatory' => true], // Bartender specifically
                ],
            ],
            // Kitchen courses
            [
                'course_code' => 'LMS-401',
                'targets' => [
                    ['department_id' => 3, 'is_mandatory' => true],
                ],
            ],
            // Housekeeping courses
            [
                'course_code' => 'LMS-501',
                'targets' => [
                    ['department_id' => 4, 'is_mandatory' => true],
                ],
            ],
            // Security courses
            [
                'course_code' => 'LMS-601',
                'targets' => [
                    ['department_id' => 6, 'is_mandatory' => true],
                ],
            ],
            // Wellness courses
            [
                'course_code' => 'LMS-701',
                'targets' => [
                    ['department_id' => 7, 'is_mandatory' => true],
                ],
            ],
            // Admin/HR courses
            [
                'course_code' => 'LMS-801',
                'targets' => [
                    ['department_id' => 5, 'is_mandatory' => true],
                ],
            ],
            // Finance courses
            [
                'course_code' => 'LMS-901',
                'targets' => [
                    ['department_id' => 8, 'is_mandatory' => true],
                ],
            ],
            // Engineering courses
            [
                'course_code' => 'LMS-1001',
                'targets' => [
                    ['department_id' => 9, 'is_mandatory' => true],
                ],
            ],
        ];
    }

    // =====================================================================
    // HANDBOOK CONTENT (compact summaries for each department)
    // =====================================================================

    private function frontDeskHandbook(): string
    {
        return <<<'MD'
# Front Desk Operations & Check-In Protocol

## 1. The arrival experience
The front desk is the guest's first and last impression of our hotel. Every interaction must be warm, efficient, and professional.

## 2. Check-in procedure
- Greet the guest by name if the reservation is pulled up.
- Verify identification and credit card; explain the incidental hold.
- Confirm room type, rate, and length of stay.
- Issue key cards (always two) and explain Wi-Fi, breakfast, and checkout time.
- Offer a brief property orientation: pool, gym, restaurant hours, and emergency exits.

## 3. Room assignment
- Assign rooms based on guest preference (floor, view, bed type) and availability.
- Flag VIP, returning, and loyalty guests for upgrades when occupancy allows.
- Never assign a room that housekeeping has not released as inspected.

## 4. PMS (Property Management System)
- All check-ins, check-outs, and room moves must be logged in the PMS in real time.
- Post incidental charges (minibar, laundry) the same day they occur.
- Run the night audit checklist before the end of the graveyard shift.

## 5. Check-out procedure
- Review the folio with the guest, explain each charge clearly.
- Process payment and email the receipt.
- Ask about the stay and note any feedback in the PMS guest profile.
- Thank the guest by name and invite them to return.

## 6. Key control & safety
- Never disclose a guest's room number verbally; write it on the key card sleeve.
- Verify identity before issuing replacement keys.
- Report any suspicious activity to Security immediately.
MD;
    }

    private function reservationsHandbook(): string
    {
        return <<<'MD'
# Reservations & Revenue Management Basics

## 1. Reservation channels
- Direct (phone, walk-in, website)
- OTA (Online Travel Agencies: Booking.com, Agoda, Expedia)
- Corporate and group contracts

## 2. Overbooking policy
- Maintain a controlled overbooking buffer based on historical no-show rates.
- When a walk-away is required, offer alternative accommodation, transport, and a future-stay credit.

## 3. Rate parity
- Published rates must be consistent across all channels.
- Direct bookings may offer exclusive add-ons (free breakfast, late checkout) but not a lower base rate without approval.

## 4. Upselling techniques
- Offer room upgrades at check-in when occupancy permits.
- Suggest package add-ons: spa, dining credits, airport transfer.
- Use benefit-driven language: "For just ₱500 more, you'll enjoy a city-view suite with complimentary breakfast."

## 5. Cancellation & no-show
- Enforce the cancellation policy as published at time of booking.
- Log all cancellations with the reason in the PMS.
MD;
    }

    private function fbServiceHandbook(): string
    {
        return <<<'MD'
# Restaurant Service Standards & Table Etiquette

## 1. Pre-service preparation
- Inspect your station: table settings, glassware, cutlery alignment, and napkin folds.
- Know today's specials, unavailable items, and allergen notes.
- Attend the pre-shift briefing for VIP arrivals and special requests.

## 2. The service flow
- Greet within 30 seconds of seating; offer water and present menus.
- Take orders accurately; repeat back to confirm.
- Serve food from the guest's left, beverages from the right.
- Check back within two minutes of food delivery.
- Clear finished plates only when all guests at the table have finished.

## 3. Menu knowledge
- Every server must be able to describe all dishes, including cooking method, key ingredients, and recommended pairings.
- Disclose allergens proactively; never guess.

## 4. Wine service basics
- Present the bottle label-forward to the host.
- Open at the table, pour a tasting measure, then serve counter-clockwise.
- Refill glasses when they reach one-third full.

## 5. Handling complaints
- Apologise sincerely, remove the item, and offer a replacement or alternative immediately.
- Notify the manager for any compensation beyond a replacement dish.
MD;
    }

    private function alcoholServiceHandbook(): string
    {
        return <<<'MD'
# Responsible Alcohol Service

## 1. Legal responsibility
- Philippine law prohibits serving alcohol to anyone under 18 years old.
- Request government-issued ID if the guest appears under 25.

## 2. Signs of intoxication
- Slurred speech, loss of balance, aggressive behavior, drowsiness.
- Do not serve additional alcohol once signs are observed.

## 3. Refusal technique
- Be polite but firm: "I'm unable to serve another drink at this time, but I'd be happy to offer coffee or water."
- Notify the manager immediately; never argue with the guest.

## 4. Drink limits
- Track consumption per guest, especially during events and happy hours.
- Offer food alongside alcoholic drinks.

## 5. Incident documentation
- Log all refusals and incidents in the shift report.
- Security must be alerted if the guest becomes aggressive.
MD;
    }

    private function kitchenStationHandbook(): string
    {
        return <<<'MD'
# Kitchen Station Management & HACCP Compliance

## 1. Station setup (mise en place)
- Arrive 15 minutes before your shift to set up your station.
- Check that all ingredients are fresh, portioned, and within date.
- Ensure knives, utensils, and equipment are clean and sanitized.

## 2. Cooking temperatures
- Poultry: 74°C (165°F) internal.
- Ground meats: 71°C (160°F).
- Fish: 63°C (145°F).
- Use a calibrated probe thermometer and log every check.

## 3. HACCP logs
- Record temperatures at receiving, storage, cooking, and serving.
- Any deviation must be documented and escalated to the sous chef.

## 4. Cross-contamination prevention
- Use color-coded cutting boards: red for raw meat, green for vegetables, blue for fish.
- Change gloves and wash hands between tasks.
- Store raw proteins below ready-to-eat items in the walk-in.

## 5. Station breakdown
- Clean and sanitize all surfaces at the end of your shift.
- Return unused prep to labeled, dated containers.
- Sweep, mop, and check that all equipment is turned off.
MD;
    }

    private function housekeepingHandbook(): string
    {
        return <<<'MD'
# Guestroom Cleaning Standards & Turndown Protocol

## 1. Room cleaning sequence
- Knock and announce "Housekeeping" three times before entering.
- Open curtains and windows to ventilate.
- Strip the bed, collect used towels and amenities.
- Clean bathroom: toilet, shower/tub, sink, mirrors, floor.
- Dust all surfaces, including nightstands, desk, and TV.
- Make the bed with fresh linens; inspect for stains or damage.
- Restock amenities: towels, toiletries, stationery, minibar.
- Vacuum carpet or mop floor, working from the back toward the door.
- Final inspection: check lights, thermostat, remote, and door lock.

## 2. Turndown service
- Performed between 6:00 PM and 8:00 PM.
- Fold back the duvet at a 45° angle on the guest's preferred side.
- Place slippers, a bottle of water, and a goodnight card.
- Close curtains, dim lights, and set the thermostat to 22°C.

## 3. Linen handling
- Sort soiled linen by type; never place linen on the floor.
- Report stained or damaged linen for replacement.
- Follow FIFO for linen storage.

## 4. Lost and found
- Log every item found in a guest room, including location and date.
- Secure items in the lost-and-found locker; notify the front desk.
MD;
    }

    private function securityHandbook(): string
    {
        return <<<'MD'
# Hotel Security & Emergency Protocols

## 1. Patrol procedures
- Complete hourly patrols of all floors, parking areas, and back-of-house.
- Check fire exits, stairwells, and emergency lighting on every patrol.
- Document findings in the patrol log.

## 2. CCTV monitoring
- Monitor cameras continuously during your shift.
- Report any suspicious activity to the Security Supervisor immediately.
- CCTV footage is confidential; never share or delete recordings.

## 3. Incident reporting
- Complete an incident report within one hour of any event.
- Include date, time, location, persons involved, and action taken.
- Preserve evidence (photos, footage) and notify management.

## 4. Guest safety
- Escort guests to their room upon request, especially late at night.
- Never give room information to non-registered visitors.
- Activate the emergency plan for fire, earthquake, or medical events.

## 5. Access control
- All back-of-house doors must remain locked; use key cards only.
- Verify contractor IDs and escort them at all times.
MD;
    }

    private function spaHandbook(): string
    {
        return <<<'MD'
# Spa Service Standards & Guest Wellness

## 1. Guest consultation
- Complete a health intake form before every treatment.
- Ask about allergies, medical conditions, pregnancy, and preferences.
- Explain the treatment, duration, and aftercare.

## 2. Treatment protocols
- Prepare the treatment room 15 minutes before the appointment.
- Ensure correct temperature, lighting, and music selection.
- Use fresh linens and sanitized equipment for every guest.

## 3. Hygiene standards
- Wash and sanitize hands before and after every treatment.
- Disinfect all equipment between guests.
- Dispose of single-use items immediately after use.

## 4. Equipment care
- Clean and maintain all spa equipment daily.
- Report malfunctioning equipment to the supervisor immediately.
- Follow manufacturer guidelines for maintenance schedules.

## 5. Guest follow-up
- Offer water and a quiet resting area after the treatment.
- Ask for feedback and recommend a follow-up treatment schedule.
MD;
    }

    private function hrPoliciesHandbook(): string
    {
        return <<<'MD'
# HR Policies, Labor Law & Employee Handbook

## 1. Employment standards (DOLE)
- Standard work hours: 8 hours per day, 48 hours per week.
- Overtime: 125% of hourly rate (130% on rest days, 200% on holidays).
- Night differential: +10% for work between 10:00 PM and 6:00 AM.

## 2. Leave entitlements
- Service Incentive Leave: 5 days after one year of service.
- Sick Leave: as per company policy (non-cumulative).
- Maternity: 105 days paid (solo parent: +15 days). Paternity: 7 days.

## 3. Disciplinary procedures
- Verbal warning → Written warning → Suspension → Termination.
- Due process: notice to explain → hearing → decision within 5 working days.
- Serious offenses (theft, harassment, fraud) may warrant immediate dismissal per Art. 297.

## 4. Data privacy
- Employee records are confidential under the Data Privacy Act (RA 10173).
- Access is limited to authorized HR personnel only.
- Personal data must not be shared externally without written consent.

## 5. Attendance and timekeeping
- All employees must use the biometric or web-clocking system.
- Grace period: 15 minutes; beyond this is considered late.
- Three consecutive absences without notice may be considered AWOL.
MD;
    }

    private function financeHandbook(): string
    {
        return <<<'MD'
# Hotel Accounting & Financial Controls

## 1. Revenue posting
- Post all revenue transactions (room, F&B, spa) to the PMS daily.
- Reconcile PMS revenue with the POS system before the night audit.

## 2. Petty cash procedures
- Maximum petty cash fund: ₱10,000 per department.
- All disbursements require a signed petty cash voucher with receipts.
- Replenish when the fund reaches 30% of the original amount.

## 3. Month-end close
- Complete all journal entries by the 3rd business day of the new month.
- Reconcile bank statements, accounts receivable, and accounts payable.
- Submit the trial balance to the Finance Officer for review.

## 4. Internal controls
- Dual signature required for disbursements above ₱25,000.
- Segregation of duties: the person who approves cannot also release.
- Physical cash counts are conducted weekly and documented.

## 5. Audit compliance
- Maintain all supporting documents for at least 5 years.
- Cooperate fully with internal and external auditors.
- Report any irregularities to the Finance Officer immediately.
MD;
    }

    private function engineeringHandbook(): string
    {
        return <<<'MD'
# Preventive Maintenance & Facilities Safety

## 1. Preventive maintenance schedule
- Daily: HVAC filter checks, elevator inspection, generator test run.
- Weekly: Plumbing inspections, fire suppression system check.
- Monthly: Electrical panel inspection, pest control coordination.
- Quarterly: Full building systems audit and compliance review.

## 2. Work order system
- All maintenance requests must be logged in the work order system.
- Prioritize by urgency: guest room issues within 30 minutes, common areas within 2 hours.
- Close work orders with a description of work done and parts used.

## 3. Electrical safety
- Only licensed electricians may work on high-voltage systems.
- Lock-out/Tag-out (LOTO) procedures are mandatory for all electrical maintenance.
- Report frayed wiring, exposed conductors, or tripped breakers immediately.

## 4. Water and plumbing
- Check hot water temperature daily (target: 55°C at the boiler, 42°C at the tap).
- Report leaks immediately to prevent water damage and mold.
- Flush unused fixtures weekly to prevent Legionella contamination.

## 5. Building code compliance
- Maintain fire exits clear and illuminated at all times.
- Emergency lighting batteries must be tested monthly.
- Keep all permits and inspection certificates current and accessible.
MD;
    }
}
