-- Hotel staffing extension: fills Security / Wellness / Finance / Engineering
-- so the Staffing by Department chart shows hotel-realistic data instead of 0/0.
-- Safe to run on an existing DB (INSERT IGNORE = skips rows that already exist).
-- Run: mysql -u <user> -p <db> < hotel_hr_staffing_extension.sql

INSERT IGNORE INTO `positions` (`position_id`, `position_code`, `title`, `department_id`, `salary_grade_id`, `level`, `headcount`, `filled_count`) VALUES
(18, 'POS-018', 'Security Officer', 6, 1, 'Rank & File', 6, 4),
(19, 'POS-019', 'Security Supervisor', 6, 4, 'Supervisory', 1, 1),
(20, 'POS-020', 'Spa Therapist', 7, 2, 'Rank & File', 4, 2),
(21, 'POS-021', 'Wellness / Gym Attendant', 7, 1, 'Rank & File', 2, 1),
(22, 'POS-022', 'Accounting Assistant', 8, 3, 'Rank & File', 2, 1),
(23, 'POS-023', 'Finance Officer', 8, 5, 'Supervisory', 1, 1),
(24, 'POS-024', 'Maintenance Technician', 9, 2, 'Rank & File', 5, 3),
(25, 'POS-025', 'Engineering Supervisor', 9, 4, 'Supervisory', 1, 1),
(26, 'POS-026', 'Electrician', 9, 2, 'Rank & File', 2, 1);

INSERT IGNORE INTO `employees`
  (`employee_id`, `employee_code`, `first_name`, `middle_name`, `last_name`, `email`, `personal_email`,
   `phone`, `address`, `birth_date`, `gender`, `civil_status`, `nationality`,
   `sss_number`, `philhealth_number`, `pagibig_number`, `tin_number`,
   `position_id`, `department_id`, `employment_type`, `date_hired`, `supervisor_employee_id`,
   `status`, `onboarding_complete`, `salary_grade_id`, `employee_record_last_updated_at`, `salary_step`) VALUES
(24, 'EMP-0024', 'Ramon',  'D.', 'Aquino',    'ramon.aquino@oxfordsuites.com.ph',      NULL, '0917 555 2401', 'Makati City',      '1988-04-12', 'Male',   'Married', 'Filipino', NULL, NULL, NULL, NULL, 18, 6, 'Regular',      '2021-08-15', NULL, 'Active', 1, 1, NULL, 'Step 2'),
(25, 'EMP-0025', 'Jose',   'M.', 'Rizal',     'jose.rizal@oxfordsuites.com.ph',        NULL, '0917 555 2402', 'Pasay City',       '1992-07-20', 'Male',   'Single',  'Filipino', NULL, NULL, NULL, NULL, 18, 6, 'Regular',      '2023-02-10', NULL, 'Active', 1, 1, NULL, 'Step 1'),
(26, 'EMP-0026', 'Mario',  'S.', 'Santos',    'mario.santos@oxfordsuites.com.ph',      NULL, '0917 555 2403', 'Taguig City',      '1995-11-05', 'Male',   'Single',  'Filipino', NULL, NULL, NULL, NULL, 18, 6, 'Probationary', '2025-09-01', NULL, 'Active', 0, 1, NULL, 'Step 1'),
(27, 'EMP-0027', 'Dante',  'R.', 'Cruz',      'dante.cruz@oxfordsuites.com.ph',        NULL, '0917 555 2404', 'Makati City',      '1980-01-30', 'Male',   'Married', 'Filipino', NULL, NULL, NULL, NULL, 19, 6, 'Regular',      '2019-05-20', NULL, 'Active', 1, 4, NULL, 'Step 3'),
(28, 'EMP-0028', 'Lorna',  'V.', 'Dizon',     'lorna.dizon@oxfordsuites.com.ph',       NULL, '0917 555 2405', 'Mandaluyong City', '1994-03-17', 'Female', 'Single',  'Filipino', NULL, NULL, NULL, NULL, 20, 7, 'Regular',      '2022-06-12', NULL, 'Active', 1, 2, NULL, 'Step 2'),
(29, 'EMP-0029', 'Jenny',  'P.', 'Lim',       'jenny.lim@oxfordsuites.com.ph',         NULL, '0917 555 2406', 'Makati City',      '1996-09-25', 'Female', 'Single',  'Filipino', NULL, NULL, NULL, NULL, 20, 7, 'Probationary', '2025-11-01', NULL, 'Active', 0, 2, NULL, 'Step 1'),
(30, 'EMP-0030', 'Carlos', 'J.', 'Mendoza',   'carlos.mendoza@oxfordsuites.com.ph',    NULL, '0917 555 2407', 'Pasig City',       '1998-12-08', 'Male',   'Single',  'Filipino', NULL, NULL, NULL, NULL, 21, 7, 'Probationary', '2026-01-15', NULL, 'Active', 0, 1, NULL, 'Step 1'),
(31, 'EMP-0031', 'Rica',   'A.', 'Villanueva','rica.villanueva@oxfordsuites.com.ph',   NULL, '0917 555 2408', 'Makati City',      '1993-05-11', 'Female', 'Married', 'Filipino', NULL, NULL, NULL, NULL, 22, 8, 'Regular',      '2021-03-08', NULL, 'Active', 1, 3, NULL, 'Step 2'),
(32, 'EMP-0032', 'Paola',  'G.', 'Reyes',     'paola.reyes@oxfordsuites.com.ph',       NULL, '0917 555 2409', 'Quezon City',      '1989-08-19', 'Female', 'Married', 'Filipino', NULL, NULL, NULL, NULL, 23, 8, 'Regular',      '2018-10-01', NULL, 'Active', 1, 5, NULL, 'Step 3'),
(33, 'EMP-0033', 'Enrico', 'B.', 'Santos',    'enrico.santos@oxfordsuites.com.ph',     NULL, '0917 555 2410', 'Caloocan City',    '1987-06-22', 'Male',   'Married', 'Filipino', NULL, NULL, NULL, NULL, 24, 9, 'Regular',      '2020-04-17', NULL, 'Active', 1, 2, NULL, 'Step 2'),
(34, 'EMP-0034', 'Nardo',  'C.', 'Dela Cruz', 'nardo.delacruz@oxfordsuites.com.ph',    NULL, '0917 555 2411', 'Manila',           '1991-02-14', 'Male',   'Single',  'Filipino', NULL, NULL, NULL, NULL, 24, 9, 'Regular',      '2022-09-05', NULL, 'Active', 1, 2, NULL, 'Step 1'),
(35, 'EMP-0035', 'Felipe', 'D.', 'Ramos',     'felipe.ramos@oxfordsuites.com.ph',      NULL, '0917 555 2412', 'Makati City',      '1999-10-30', 'Male',   'Single',  'Filipino', NULL, NULL, NULL, NULL, 24, 9, 'Probationary', '2026-02-01', NULL, 'Active', 0, 2, NULL, 'Step 1'),
(36, 'EMP-0036', 'Victor', 'E.', 'Lim',       'victor.lim@oxfordsuites.com.ph',        NULL, '0917 555 2413', 'Pasay City',       '1984-12-12', 'Male',   'Married', 'Filipino', NULL, NULL, NULL, NULL, 25, 9, 'Regular',      '2017-07-25', NULL, 'Active', 1, 4, NULL, 'Step 3'),
(37, 'EMP-0037', 'Andres', 'F.', 'Bonifacio', 'andres.bonifacio@oxfordsuites.com.ph',  NULL, '0917 555 2414', 'Marikina City',    '1990-05-05', 'Male',   'Single',  'Filipino', NULL, NULL, NULL, NULL, 26, 9, 'Regular',      '2021-12-10', NULL, 'Active', 1, 2, NULL, 'Step 2');

UPDATE `departments` SET `head_employee_id` = 27 WHERE `department_id` = 6;
UPDATE `departments` SET `head_employee_id` = 28 WHERE `department_id` = 7;
UPDATE `departments` SET `head_employee_id` = 32 WHERE `department_id` = 8;
UPDATE `departments` SET `head_employee_id` = 36 WHERE `department_id` = 9;

UPDATE `employees` SET `supervisor_employee_id` = 27 WHERE `employee_id` IN (24, 25, 26);
UPDATE `employees` SET `supervisor_employee_id` = 28 WHERE `employee_id` IN (29, 30);
UPDATE `employees` SET `supervisor_employee_id` = 32 WHERE `employee_id` IN (31);
UPDATE `employees` SET `supervisor_employee_id` = 36 WHERE `employee_id` IN (33, 34, 35, 37);

-- Open roles that feed the "Open roles" (gold) bar per department.
INSERT IGNORE INTO `job_posts`
  (`job_post_id`, `slug`, `title`, `department_id`, `position_id`, `employment_type`, `schedule`,
   `salary_min`, `salary_max`, `vacancies`, `filled_count`, `posted_date`, `status`, `active`,
   `experience_level`, `education_level`, `summary`, `description`,
   `responsibilities_json`, `qualifications_json`, `skills_json`) VALUES
(7, 'security-officer', 'Security Officer', 6, 18, 'Full-time', 'Shifting Schedule', 16000.00, 19000.00, 2, 0, '2026-05-25', 'Open', 1, '1-2 Years', 'High School Graduate',
 'Guard guest floors, lobby posts, and CCTV monitoring on rotating shifts.',
 'Security Officers keep guests, staff, and property safe through roving patrols, access control, and incident reporting across the hotel premises.',
 '["Conduct roving patrols of guest floors and back-of-house.","Enforce access control at lobby and service entrances.","Respond to incidents and prepare blotter reports.","Coordinate with Engineering on safety hazards."]',
 '["High School Graduate; security license (SOSIA) required.","At least 1 year hotel or commercial security experience.","Physically fit and willing to work shifting schedules."]',
  '["Access Control","Patrol","Incident Reporting","CCTV"]'),
(8, 'spa-therapist', 'Spa Therapist', 7, 20, 'Full-time', 'Shifting Schedule', 18000.00, 23000.00, 2, 0, '2026-05-26', 'Open', 1, '1-2 Years', 'Vocational / TESDA',
 'Deliver signature massages and wellness treatments to hotel and walk-in guests.',
 'Spa Therapists perform Filipino hilot, Swedish, and aromatherapy treatments while upselling wellness packages at the Oxford Suites spa.',
 '["Perform massage and body treatments to standard protocols.","Prepare treatment rooms and sterilize tools.","Recommend wellness packages to guests.","Maintain guest treatment records."]',
 '["TESDA NC II in Massage Therapy or equivalent.","At least 1 year spa experience; hotel spa an advantage.","Warm guest-handling skills."]',
  '["Hilot","Swedish Massage","Guest Care","Upselling"]'),
(9, 'accounting-assistant', 'Accounting Assistant', 8, 22, 'Full-time', 'Day Shift', 19000.00, 24000.00, 1, 0, '2026-05-27', 'Open', 1, '1-2 Years', 'Bachelor''s Degree',
 'Handle payables, receivables encoding, and month-end supporting schedules.',
 'The Accounting Assistant supports the Finance Officer with AP/AR encoding, receipt audits from Front Office and F&B outlets, and BIR-ready documentation.',
 '["Encode supplier invoices and outlet remittances.","Reconcile daily revenue reports from Front Office and F&B.","Prepare BIR supporting schedules.","Assist in month-end close."]',
 '["Bachelor''s degree in Accountancy or related field.","At least 1 year accounting experience.","Proficient in MS Excel."]',
  '["Bookkeeping","Reconciliation","MS Excel","Attention to Detail"]'),
(10, 'maintenance-technician', 'Maintenance Technician', 9, 24, 'Full-time', 'Shifting Schedule', 17000.00, 21000.00, 2, 0, '2026-05-28', 'Open', 1, '1-2 Years', 'Vocational / TESDA',
 'Perform preventive maintenance on guestrooms, kitchen equipment, and facilities.',
 'Maintenance Technicians respond to housekeeping and front-office work orders, repair plumbing, HVAC, and electrical faults across the property.',
 '["Respond to guestroom and public-area work orders.","Perform preventive maintenance on HVAC and kitchen equipment.","Troubleshoot minor plumbing and electrical faults.","Log completed work in the facilities tracker."]',
 '["TESDA NC II in Electrical, Refrigeration, or equivalent.","At least 1 year hotel or building maintenance experience.","Willing to be on-call for emergencies."]',
  '["HVAC","Plumbing","Electrical","Preventive Maintenance"]');

INSERT IGNORE INTO `job_post_platforms` (`job_post_id`, `platform`, `published_at`, `status`) VALUES
(7, 'Company Website', '2026-05-25 08:00:00', 'published'),
(7, 'Facebook',        '2026-05-25 08:20:00', 'published'),
(8, 'Company Website', '2026-05-26 08:00:00', 'published'),
(8, 'Facebook',        '2026-05-26 08:30:00', 'published'),
(9, 'Company Website', '2026-05-27 08:00:00', 'published'),
(9, 'Indeed',          '2026-05-27 09:00:00', 'published'),
(10, 'Company Website', '2026-05-28 08:00:00', 'published'),
(10, 'Indeed',          '2026-05-28 09:15:00', 'published');
