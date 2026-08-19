-- ============================================================================
-- Hotel & Restaurant HR1 - Seed Data (MySQL 8.0+)
-- Revision: matches schema rev 2.3 (42 tables)
-- Source: frontend/src/data/*.ts fixtures (hr, jobs, applicants, requisitions,
--         hires, ess, users, records, company) so the initial UI stays
--         recognizable during migration. See PRD Section 11.
-- Notes:
--   * Foreign keys are disabled at the start; inserts are still ordered so the
--     data is referentially consistent.
--   * All system users share the password hash for "Oxford@2026" (bcrypt,
--     cost 10). Regenerate with the application on first boot if desired.
--   * positions.filled_count / job_posts.filled_count / employees.onboarding_complete
--     are derived counters kept consistent with the seeded rows.
-- ============================================================================

-- Self-contained: run against the database created by the schema script.
USE `hotel_hr`;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS=0;

-- ---------------------------------------------------------------------------
-- Domain 1: Organization & Core HCM
-- ---------------------------------------------------------------------------

-- departments (ids 1-9)
INSERT INTO `departments` (`department_id`, `code`, `name`, `description`, `head_employee_id`, `budget`) VALUES
(1, 'DEP-FO', 'Front Office', 'Front Desk, Concierge, Reservations, Guest Services', NULL, 2800000.00),
(2, 'DEP-FB', 'Food & Beverage', 'Dining Room, Bar Operations, Room Service', NULL, 3500000.00),
(3, 'DEP-KC', 'Kitchen / Culinary', 'Main Hotel Kitchen, Banquet Catering, Pastry', NULL, 4200000.00),
(4, 'DEP-HK', 'Housekeeping', 'Guestroom Operations, Linen & Laundry, Public Areas', NULL, 2400000.00),
(5, 'DEP-HR', 'Administration / HR', 'Human Resources, Accounting, General Maintenance', NULL, 3100000.00),
(6, 'DEP-SEC', 'Security', 'Guest and property security, patrol operations', NULL, 900000.00),
(7, 'DEP-WEL', 'Wellness', 'Spa, gym, and wellness centre services', NULL, 700000.00),
(8, 'DEP-FIN', 'Finance', 'Accounting, payables, receivables, month-end close', NULL, 1100000.00),
(9, 'DEP-ENG', 'Engineering', 'Building maintenance, preventive maintenance, facilities', NULL, 1300000.00);

-- salary_grades (ids 1-7)
INSERT INTO `salary_grades` (`salary_grade_id`, `code`, `title`, `min_salary`, `max_salary`, `currency_code`, `level`, `notes`) VALUES
(1, 'SG-01', 'Entry Rank & File', 14000.00, 17000.00, 'PHP', 'Rank & File', 'Housekeeping attendants, utility crew'),
(2, 'SG-05', 'Standard Rank & File', 18000.00, 22000.00, 'PHP', 'Rank & File', 'Front desk receptionist, line cooks'),
(3, 'SG-08', 'Senior Rank & File', 22000.00, 26000.00, 'PHP', 'Rank & File', 'HR assistant, senior receptionist'),
(4, 'SG-10', 'Junior Supervisory', 26000.00, 32000.00, 'PHP', 'Supervisory', 'Floor supervisor, guest relations supervisor'),
(5, 'SG-12', 'Senior Supervisory', 32000.00, 40000.00, 'PHP', 'Supervisory', 'Pastry chef supervisor, assistant manager'),
(6, 'SG-15', 'Department Manager', 45000.00, 60000.00, 'PHP', 'Managerial', 'Front office manager, executive housekeeper'),
(7, 'SG-18', 'Executive Director', 65000.00, 90000.00, 'PHP', 'Executive', 'F&B Director, HR Manager, GM');

-- positions (ids 1-17)
INSERT INTO `positions` (`position_id`, `position_code`, `title`, `department_id`, `salary_grade_id`, `level`, `headcount`, `filled_count`) VALUES
(1, 'POS-001', 'Front Desk Receptionist', 1, 2, 'Rank & File', 8, 3),
(2, 'POS-002', 'Guest Relations Officer', 1, 4, 'Supervisory', 3, 2),
(3, 'POS-003', 'Restaurant Server', 2, 1, 'Rank & File', 12, 1),
(4, 'POS-004', 'Bartender', 2, 1, 'Rank & File', 4, 1),
(5, 'POS-005', 'Line Cook', 3, 2, 'Rank & File', 10, 1),
(6, 'POS-006', 'Pastry Chef', 3, 5, 'Supervisory', 2, 1),
(7, 'POS-007', 'Housekeeping Attendant', 4, 1, 'Rank & File', 18, 3),
(8, 'POS-008', 'HR Assistant', 5, 3, 'Rank & File', 3, 2),
(9, 'POS-009', 'General Manager', 5, 7, 'Executive', 1, 1),
(10, 'POS-010', 'Front Office Manager', 1, 6, 'Managerial', 1, 1),
(11, 'POS-011', 'F&B Director', 2, 7, 'Executive', 1, 1),
(12, 'POS-012', 'Executive Chef', 3, 7, 'Executive', 1, 1),
(13, 'POS-013', 'Executive Housekeeper', 4, 6, 'Managerial', 1, 1),
(14, 'POS-014', 'HR & Administration Manager', 5, 7, 'Managerial', 1, 1),
(15, 'POS-015', 'Floor Supervisor', 4, 4, 'Supervisory', 2, 1),
(16, 'POS-016', 'HR Officer', 5, 4, 'Supervisory', 2, 1),
(17, 'POS-017', 'Accounting Supervisor', 5, 4, 'Supervisory', 1, 1);

-- employees (ids 1-23; supervisors assigned via UPDATE after insert)
INSERT INTO `employees` (
  `employee_id`, `employee_code`, `first_name`, `middle_name`, `last_name`, `email`, `personal_email`,
  `phone`, `address`, `birth_date`, `gender`, `civil_status`, `nationality`,
  `sss_number`, `philhealth_number`, `pagibig_number`, `tin_number`,
  `position_id`, `department_id`, `employment_type`, `date_hired`, `supervisor_employee_id`,
  `status`, `onboarding_complete`, `salary_grade_id`, `employee_record_last_updated_at`, `salary_step`
) VALUES
(1,  'EMP-0001', 'Ana',        'M.',  'Ramos',        'ana.ramos@oxfordsuites.com.ph',           NULL, '0917 100 1001', 'Makati City',                 '1986-05-14', 'Female', 'Married',   'Filipino', NULL, NULL, NULL, NULL, 10, 1, 'Regular',      '2019-02-11', NULL, 'Active', 1, 6, '2026-01-10', 'Step 3'),
(2,  'EMP-0002', 'Gabriel',    'S.',  'Mendoza',      'gabriel.mendoza@oxfordsuites.com.ph',      NULL, '0917 100 1002', 'Makati City',                 '1979-11-02', 'Male',   'Married',   'Filipino', NULL, NULL, NULL, NULL, 11, 2, 'Regular',      '2018-06-04', NULL, 'Active', 1, 7, '2025-11-02', 'Step 4'),
(3,  'EMP-0003', 'Lourdes',    'B.',  'Bautista',     'lourdes.bautista@oxfordsuites.com.ph',     NULL, '0917 100 1003', 'Quezon City',                 '1971-03-27', 'Female', 'Married',   'Filipino', NULL, NULL, NULL, NULL, 13, 4, 'Regular',      '2017-11-20', NULL, 'Active', 1, 6, '2012-06-15', 'Step 3'),
(4,  'EMP-0004', 'Camille',    'T.',  'Ortega',       'camille.ortega@oxfordsuites.com.ph',       NULL, '0917 664 2219', 'Makati City',                 '2001-02-09', 'Female', 'Single',    'Filipino', NULL, NULL, NULL, NULL, 2,  1, 'Probationary', '2026-08-04', NULL, 'Active', 0, 4, '2026-01-14', 'Step 1'),
(5,  'EMP-0005', 'Kevin',      'D.',  'Dela Cruz',    'kevin.delacruz@oxfordsuites.com.ph',       NULL, '0921 774 9903', '14 Kalayaan Ave, Makati City', '1998-08-17', 'Male',   'Single',    'Filipino', '34-1234567-8', '12-345678901-2', '1234-5678-9012', '123-456-789', 5, 3, 'Probationary', '2026-04-15', NULL, 'Active', 0, 2, '2026-01-20', 'Step 2'),
(6,  'EMP-0006', 'Marjun',     'V.',  'Devera',       'marjun.devera@oxfordsuites.com.ph',        NULL, '0917 664 2219', 'Pasay City',                  '1999-12-03', 'Male',   'Single',    'Filipino', NULL, NULL, NULL, NULL, 3,  2, 'Regular',      '2025-09-16', NULL, 'Active', 1, 1, '2011-03-30', 'Step 1'),
(7,  'EMP-0007', 'Juan',       'C.',  'Dela Cruz',    'juan.delacruz@oxfordsuites.com.ph',        NULL, '0917 100 1007', 'Makati City',                 '1982-06-21', 'Male',   'Married',   'Filipino', NULL, NULL, NULL, NULL, 14, 5, 'Regular',      '2016-01-18', NULL, 'Active', 1, 7, '2024-08-08', 'Step 3'),
(8,  'EMP-0008', 'Rosa',       'P.',  'Aquino',       'rosa.aquino@oxfordsuites.com.ph',          NULL, '0917 100 1008', 'Taguig City',                 '1990-01-30', 'Female', 'Married',   'Filipino', NULL, NULL, NULL, NULL, 15, 4, 'Regular',      '2021-05-03', NULL, 'Active', 1, 4, '2025-05-19', 'Step 2'),
(9,  'EMP-0009', 'Ricardo',    'A.',  'Villanueva',   'ricardo.villanueva@oxfordsuites.com.ph',   NULL, '0917 100 1009', 'Makati City',                 '1975-09-12', 'Male',   'Married',   'Filipino', NULL, NULL, NULL, NULL, 9,  5, 'Regular',      '2015-03-02', NULL, 'Active', 1, 7, NULL, 'Step 5'),
(10, 'EMP-0010', 'Marco',      'D.',  'Santos',       'marco.santos@oxfordsuites.com.ph',         NULL, '0917 100 1010', 'Mandaluyong City',            '1980-04-25', 'Male',   'Married',   'Filipino', NULL, NULL, NULL, NULL, 12, 3, 'Regular',      '2017-07-10', NULL, 'Active', 1, 7, NULL, 'Step 4'),
(11, 'EMP-0011', 'Maria',      'L.',  'Lim',          'maria.lim@oxfordsuites.com.ph',            NULL, '0917 100 1011', 'Makati City',                 '1993-10-08', 'Female', 'Single',    'Filipino', NULL, NULL, NULL, NULL, 16, 5, 'Regular',      '2020-02-03', NULL, 'Active', 1, 4, NULL, 'Step 2'),
(12, 'EMP-0012', 'Paolo',      'R.',  'Cruz',         'paolo.cruz@oxfordsuites.com.ph',           NULL, '0917 100 1012', 'Pasig City',                  '1988-07-15', 'Male',   'Married',   'Filipino', NULL, NULL, NULL, NULL, 17, 5, 'Regular',      '2019-08-19', NULL, 'Active', 1, 4, NULL, 'Step 2'),
(13, 'EMP-0013', 'Bianca',     'S.',  'Soriano',      'bianca.soriano@oxfordsuites.com.ph',       NULL, '0912 345 6789', 'Manila',                     '2000-04-22', 'Female', 'Single',    'Filipino', NULL, NULL, NULL, NULL, 1,  1, 'Probationary', '2026-08-04', NULL, 'Active', 0, 2, NULL, 'Step 1'),
(14, 'EMP-0014', 'Jompaks',    'B.',  'Berdugo',      'jompaks.berdugo@oxfordsuites.com.ph',      NULL, '0933 552 1180', 'Parañaque City',              '1996-09-05', 'Male',   'Single',    'Filipino', NULL, NULL, NULL, NULL, 4,  2, 'Probationary', '2026-03-01', NULL, 'Active', 1, 1, NULL, 'Step 1'),
(15, 'EMP-0015', 'Angelo',     'T.',  'Torres',       'angelo.torres@oxfordsuites.com.ph',        NULL, '0917 220 5541', 'Makati City',                 '1999-03-18', 'Male',   'Single',    'Filipino', NULL, NULL, NULL, NULL, 1,  1, 'Probationary', '2026-05-11', NULL, 'Active', 0, 2, NULL, 'Step 1'),
(16, 'EMP-0016', 'Ligaya',     'S.',  'Santos',       'ligaya.santos@oxfordsuites.com.ph',        NULL, '0918 663 2201', 'Caloocan City',               '1987-12-11', 'Female', 'Married',   'Filipino', NULL, NULL, NULL, NULL, 7,  4, 'Probationary', '2026-02-20', NULL, 'Active', 0, 1, NULL, 'Step 1'),
(17, 'EMP-0017', 'Michael',    'R.',  'Reyes',        'michael.reyes@oxfordsuites.com.ph',        NULL, '0920 441 8873', 'Quezon City',                 '2002-01-27', 'Male',   'Single',    'Filipino', NULL, NULL, NULL, NULL, 8,  5, 'Probationary', '2026-06-01', NULL, 'Active', 0, 3, NULL, 'Step 1'),
(18, 'EMP-0018', 'Patricia',   'G.',  'Gomez',        'patricia.gomez@oxfordsuites.com.ph',       NULL, '0917 903 2245', 'Makati City',                 '1991-06-09', 'Female', 'Married',   'Filipino', NULL, NULL, NULL, NULL, 6,  3, 'Regular',      '2025-06-02', NULL, 'Active', 1, 5, NULL, 'Step 2'),
(19, 'EMP-0019', 'Ernesto',    'V.',  'Villar',       'ernesto.villar@oxfordsuites.com.ph',       NULL, '0921 556 7743', 'Manila',                      '1985-05-30', 'Male',   'Married',   'Filipino', NULL, NULL, NULL, NULL, 7,  4, 'Regular',      '2025-03-19', NULL, 'Active', 1, 1, NULL, 'Step 2'),
(20, 'EMP-0020', 'Grace',      'P.',  'Panganiban',   'grace.panganiban@oxfordsuites.com.ph',     NULL, '0917 332 8890', 'Makati City',                 '1997-02-14', 'Female', 'Single',    'Filipino', NULL, NULL, NULL, NULL, 2,  1, 'Regular',      '2025-11-10', NULL, 'Active', 0, 4, NULL, 'Step 1'),
(21, 'EMP-0021', 'Noel',       'F.',  'Fajardo',      'noel.fajardo@oxfordsuites.com.ph',         NULL, '0918 774 3320', 'Valenzuela City',             '1984-10-19', 'Male',   'Married',   'Filipino', NULL, NULL, NULL, NULL, 8,  5, 'Regular',      '2025-01-27', NULL, 'Active', 1, 3, NULL, 'Step 2'),
(22, 'EMP-0022', 'Miguel',     'T.',  'Torres',       'miguel.torres@oxfordsuites.com.ph',        NULL, '0917 442 1177', 'Makati City',                 '1998-11-25', 'Male',   'Single',    'Filipino', NULL, NULL, NULL, NULL, 1,  1, 'Probationary', '2026-05-04', NULL, 'Active', 0, 2, NULL, 'Step 1'),
(23, 'EMP-0023', 'Andrea',     'L.',  'Lim',          'andrea.lim@oxfordsuites.com.ph',           NULL, '0917 883 5566', 'Mandaluyong City',            '1999-08-02', 'Female', 'Single',    'Filipino', NULL, NULL, NULL, NULL, 7,  4, 'Probationary', '2026-03-06', NULL, 'Active', 0, 1, NULL, 'Step 1');

-- assign department heads (circular FK resolved after employee insert)
UPDATE `departments` SET `head_employee_id` = 1  WHERE `department_id` = 1; -- Ana Ramos / Front Office
UPDATE `departments` SET `head_employee_id` = 2  WHERE `department_id` = 2; -- Chef Gabriel Mendoza / F&B
UPDATE `departments` SET `head_employee_id` = 10 WHERE `department_id` = 3; -- Executive Chef Marco / Kitchen
UPDATE `departments` SET `head_employee_id` = 3  WHERE `department_id` = 4; -- Lourdes Bautista / Housekeeping
UPDATE `departments` SET `head_employee_id` = 7  WHERE `department_id` = 5; -- Juan Dela Cruz / Admin & HR

-- assign supervisors
UPDATE `employees` SET `supervisor_employee_id` = 9  WHERE `employee_id` IN (1, 2, 3, 7);
UPDATE `employees` SET `supervisor_employee_id` = 10 WHERE `employee_id` IN (5, 18);
UPDATE `employees` SET `supervisor_employee_id` = 2  WHERE `employee_id` IN (6, 14);
UPDATE `employees` SET `supervisor_employee_id` = 3  WHERE `employee_id` IN (8, 16, 19);
UPDATE `employees` SET `supervisor_employee_id` = 7  WHERE `employee_id` IN (11, 12, 17, 21);
UPDATE `employees` SET `supervisor_employee_id` = 1  WHERE `employee_id` IN (4, 13, 15, 20, 22);
UPDATE `employees` SET `supervisor_employee_id` = 3  WHERE `employee_id` = 23;

-- employee_emergency_contacts
INSERT INTO `employee_emergency_contacts` (`employee_id`, `name`, `relationship`, `phone`, `address`, `is_primary`) VALUES
(5,  'Liza Santos',       'Spouse',  '0918 222 4410', '14 Kalayaan Ave, Makati City', 1),
(1,  'Daniel Ramos',      'Spouse',  '0917 555 1212', 'Makati City',                   1),
(4,  'Lorna Ortega',      'Mother',  '0917 888 2323', 'San Fernando, Pampanga',        1),
(6,  'Fely Devera',       'Mother',  '0917 777 3434', 'Pasay City',                    1),
(8,  'Ramon Aquino',      'Spouse',  '0917 666 4545', 'Taguig City',                   1),
(13, 'Nelia Soriano',     'Mother',  '0912 345 6789', 'Manila',                        1),
(14, 'Bert Berdugo',      'Father',  '0933 552 1180', 'Parañaque City',                1),
(15, 'Sonia Torres',      'Mother',  '0917 220 5541', 'Makati City',                   1),
(16, 'Mario Santos',      'Spouse',  '0918 663 2201', 'Caloocan City',                 1),
(22, 'Teresa Torres',     'Mother',  '0917 442 1177', 'Makati City',                   1);

-- employee_position_history (initial employment event per employee)
INSERT INTO `employee_position_history` (`employee_id`, `effective_date`, `change_type`, `old_position_id`, `new_position_id`, `old_salary_grade_id`, `new_salary_grade_id`, `notes`) VALUES
(1,  '2019-02-11', 'Employment', NULL, 10, NULL, 6, 'Initial hiring as Front Office Manager'),
(2,  '2018-06-04', 'Employment', NULL, 11, NULL, 7, 'Initial hiring as F&B Director'),
(3,  '2017-11-20', 'Employment', NULL, 13, NULL, 6, 'Initial hiring as Executive Housekeeper'),
(4,  '2026-08-04', 'Employment', NULL, 2,  NULL, 4, 'Initial hiring as Guest Relations Officer'),
(5,  '2026-04-15', 'Employment', NULL, 5,  NULL, 2, 'Initial hiring as Line Cook'),
(6,  '2025-09-16', 'Employment', NULL, 3,  NULL, 1, 'Initial hiring as Restaurant Server'),
(7,  '2016-01-18', 'Employment', NULL, 14, NULL, 7, 'Initial hiring as HR & Administration Manager'),
(8,  '2021-05-03', 'Employment', NULL, 15, NULL, 4, 'Initial hiring as Floor Supervisor'),
(9,  '2015-03-02', 'Employment', NULL, 9,  NULL, 7, 'Initial hiring as General Manager'),
(10, '2017-07-10', 'Employment', NULL, 12, NULL, 7, 'Initial hiring as Executive Chef'),
(11, '2020-02-03', 'Employment', NULL, 16, NULL, 4, 'Initial hiring as HR Officer'),
(12, '2019-08-19', 'Employment', NULL, 17, NULL, 4, 'Initial hiring as Accounting Supervisor'),
(13, '2026-08-04', 'Employment', NULL, 1,  NULL, 2, 'Initial hiring as Front Desk Receptionist'),
(14, '2026-03-01', 'Employment', NULL, 4,  NULL, 1, 'Initial hiring as Bartender'),
(15, '2026-05-11', 'Employment', NULL, 1,  NULL, 2, 'Initial hiring as Front Desk Receptionist'),
(16, '2026-02-20', 'Employment', NULL, 7,  NULL, 1, 'Initial hiring as Housekeeping Attendant'),
(17, '2026-06-01', 'Employment', NULL, 8,  NULL, 3, 'Initial hiring as HR Assistant'),
(18, '2025-06-02', 'Employment', NULL, 6,  NULL, 5, 'Initial hiring as Pastry Chef'),
(19, '2025-03-19', 'Employment', NULL, 7,  NULL, 1, 'Initial hiring as Housekeeping Attendant'),
(20, '2025-11-10', 'Employment', NULL, 2,  NULL, 4, 'Initial hiring as Guest Relations Officer'),
(21, '2025-01-27', 'Employment', NULL, 8,  NULL, 3, 'Initial hiring as HR Assistant'),
(22, '2026-05-04', 'Employment', NULL, 1,  NULL, 2, 'Initial hiring as Front Desk Receptionist'),
(23, '2026-03-06', 'Employment', NULL, 7,  NULL, 1, 'Initial hiring as Housekeeping Attendant');

-- employee_documents
INSERT INTO `employee_documents` (`employee_id`, `document_code`, `title`, `category`, `file_path`, `mime_type`, `file_size_bytes`, `document_status`, `document_date`, `expiry_date`, `last_updated_at`) VALUES
(5,  'DOC-001', 'BIR Form 2316 (2025)',        'Tax Document',   '/files/emp-0005/doc-001.pdf', 'application/pdf', 245760,  'Available', '2026-01-15', NULL,       '2026-01-15 00:00:00'),
(5,  'DOC-002', 'Certificate of Employment (COE)', 'Employment', '/files/emp-0005/doc-002.pdf', 'application/pdf', 184320,  'Released',  '2026-06-01', NULL,       '2026-06-01 00:00:00'),
(5,  'DOC-003', 'Medical Clearance Certificate', 'Onboarding',    '/files/emp-0005/doc-003.pdf', 'application/pdf', 1258291, 'Submitted', '2026-02-03', NULL,       '2026-02-03 00:00:00'),
(5,  'DOC-004', 'SSS Form E-1',                'Government ID',  '/files/emp-0005/doc-004.pdf', 'application/pdf', 317440,  'Submitted', '2026-02-02', NULL,       '2026-02-02 00:00:00'),
(5,  'DOC-005', 'NBI Clearance (2026)',        'Clearance',      NULL, NULL, NULL, 'Missing', NULL, '2026-08-15', NULL),
(4,  'DOC-101', 'Signed Employment Contract',  'Employment',     '/files/emp-0004/doc-101.pdf', 'application/pdf', 409600,  'Submitted', '2026-08-04', NULL,       '2026-08-04 00:00:00'),
(4,  'DOC-102', 'NBI / Police Clearance',      'Clearance',      '/files/emp-0004/doc-102.pdf', 'application/pdf', 204800,  'Submitted', '2026-07-20', '2027-07-20', '2026-08-04 00:00:00'),
(13, 'DOC-201', 'Signed Employment Contract',  'Employment',     '/files/emp-0013/doc-201.pdf', 'application/pdf', 405504,  'Submitted', '2026-08-04', NULL,       '2026-08-04 00:00:00'),
(1,  'DOC-301', 'Employment Contract (2019)',  'Employment',     '/files/emp-0001/doc-301.pdf', 'application/pdf', 450560,  'Archived',  '2019-02-11', NULL,       '2026-01-10 00:00:00'),
(3,  'DOC-302', 'Archived 201 File',           'Personnel File', '/files/emp-0003/doc-302.pdf', 'application/pdf', 2100000, 'Archived',  '2012-06-15', NULL,       '2012-06-15 00:00:00'),
(6,  'DOC-303', 'Archived 201 File',           'Personnel File', '/files/emp-0006/doc-303.pdf', 'application/pdf', 1950000, 'Archived',  '2011-03-30', NULL,       '2011-03-30 00:00:00');

-- ---------------------------------------------------------------------------
-- Domain 2: Recruitment
-- ---------------------------------------------------------------------------

-- job_posts (ids 1-6). position_id is required and references the Core HR
-- position; slug/title mirror positions.title (kept in sync by the app).
INSERT INTO `job_posts` (
  `job_post_id`, `slug`, `title`, `department_id`, `position_id`, `employment_type`, `schedule`,
  `salary_min`, `salary_max`, `vacancies`, `filled_count`, `posted_date`, `status`, `active`,
  `experience_level`, `education_level`, `summary`, `description`,
  `responsibilities_json`, `qualifications_json`, `skills_json`, `benefits_json`
) VALUES
(1, 'front-desk-receptionist', 'Front Desk Receptionist', 1, 1, 'Full-time', 'Shifting Schedule', 18000.00, 22000.00, 3, 1, '2026-05-22', 'Open', 1, '1-2 Years', 'Bachelor''s Degree',
 'Welcome guests, manage reservations, answer inquiries, and provide excellent customer service.',
 'We are looking for a friendly and professional Front Desk Receptionist to welcome guests, manage reservations, answer inquiries, and provide excellent customer service. The ideal candidate should have strong communication skills and be able to work in a fast-paced environment.',
 '["Welcome and assist hotel guests.","Process check-in and check-out procedures.","Manage room reservations.","Handle guest inquiries and complaints professionally.","Coordinate with housekeeping and other departments.","Answer phone calls and emails."]',
 '["Bachelor''s degree or College level in Hospitality Management or related field.","Excellent communication and interpersonal skills.","Basic computer skills.","Customer service experience is an advantage.","Willing to work shifts, weekends, and holidays."]',
 '["Customer Service","Communication","Hotel Operations","Problem Solving","Time Management"]',
 '["HMO","Service Charge","Paid Leave","Meal Allowance","Career Growth"]'),
(2, 'line-cook', 'Line Cook', 3, 5, 'Full-time', 'Shifting Schedule', 16000.00, 20000.00, 4, 2, '2026-05-18', 'Open', 1, '1-2 Years', 'Vocational / TESDA',
 'Prepare and cook menu items to standard, maintain station cleanliness and food safety compliance.',
 'The Line Cook prepares and plates dishes according to Oxford Suites Makati recipes and standards, maintains a clean and organized station, and observes HACCP food-safety practices at all times.',
 '["Prepare mise en place before each service.","Cook and plate dishes to recipe standards.","Maintain sanitation and food-safety compliance.","Monitor inventory levels of station ingredients.","Support banquet and room-service volume peaks."]',
 '["TESDA NC II in Cookery or equivalent culinary training.","At least 1 year in a hotel or full-service restaurant kitchen.","Valid food handler''s certificate.","Able to work under pressure during peak service."]',
 '["Food Safety","HACCP","Knife Skills","Plating","Teamwork"]',
 '["HMO","Service Charge","Meal Allowance","Uniform","Training"]'),
(3, 'housekeeping-attendant', 'Housekeeping Attendant', 4, 7, 'Full-time', 'Shifting Schedule', 14000.00, 17000.00, 5, 3, '2026-05-10', 'Open', 1, 'No Experience', 'High School Graduate',
 'Maintain guestroom cleanliness, linen turnover, and public-area presentation to brand standards.',
 'Housekeeping Attendants keep guestrooms and public areas immaculate, restock amenities, and report maintenance issues. Full training is provided for applicants with no prior hotel experience.',
 '["Clean and prepare assigned guestrooms daily.","Replenish linens, towels, and amenities.","Report maintenance and lost-and-found items.","Maintain housekeeping cart and supplies."]',
 '["High School Graduate.","Physically fit and detail-oriented.","Willing to work shifts including weekends and holidays."]',
 '["Attention to Detail","Time Management","Room Turnover","Safety"]',
 '["HMO","Service Charge","Meal Allowance","Uniform"]'),
(4, 'restaurant-server', 'Restaurant Server', 2, 3, 'Full-time', 'Shifting Schedule', 15000.00, 18000.00, 4, 1, '2026-05-20', 'Open', 1, 'No Experience', 'High School Graduate',
 'Deliver warm, accurate table service across the dining room and banquet operations.',
 'Restaurant Servers take orders, serve food and beverages, and ensure every guest leaves with a memorable dining experience at our all-day dining outlet.',
 '["Greet and seat guests warmly.","Take and relay orders accurately to the kitchen.","Serve food and beverages following service sequence.","Handle billing and guest feedback."]',
 '["High School Graduate; hospitality training an advantage.","Good communication skills in English and Filipino.","Pleasant personality and grooming."]',
 '["Guest Service","Upselling","POS Systems","Communication"]',
 '["HMO","Service Charge","Meal Allowance","Tips"]'),
(5, 'bartender', 'Bartender', 2, 4, 'Part-time', 'Night Shift', 16000.00, 19000.00, 2, 0, '2026-05-15', 'Open', 1, '3-5 Years', 'Vocational / TESDA',
 'Craft classic and signature cocktails for the lobby lounge and rooftop bar.',
 'The Bartender prepares beverages to recipe, manages bar inventory, and creates a lively yet refined guest experience at the lounge.',
 '["Prepare cocktails and beverages to standard.","Maintain bar cleanliness and inventory.","Engage guests and recommend pairings.","Observe responsible alcohol service."]',
 '["TESDA Bartending NC II or equivalent.","At least 3 years bar experience in hotels or restaurants.","Knowledge of classic and modern mixology."]',
 '["Mixology","Inventory Control","Guest Engagement","Cash Handling"]',
 '["HMO","Service Charge","Meal Allowance","Night Differential"]'),
(6, 'hr-assistant', 'HR Assistant', 5, 8, 'Full-time', 'Day Shift', 20000.00, 25000.00, 1, 0, '2026-05-08', 'Open', 0, '1-2 Years', 'Bachelor''s Degree',
 'Support recruitment, employee records, and HR document processing.',
 'The HR Assistant supports end-to-end recruitment coordination, 201-file maintenance, and employee request processing for the property.',
 '["Coordinate interview schedules with department heads.","Maintain complete and accurate 201 files.","Process COE and employment verification requests.","Assist in new-hire onboarding documentation."]',
 '["Bachelor''s degree in Psychology, HR, or related field.","At least 1 year HR experience.","Strong organizational and documentation skills."]',
 '["Recruitment","Documentation","MS Office","Confidentiality"]',
 '["HMO","Paid Leave","Career Growth","Training"]');

-- job_post_platforms
INSERT INTO `job_post_platforms` (`job_post_id`, `platform`, `published_at`, `status`) VALUES
(1, 'Company Website', '2026-05-22 08:00:00', 'published'),
(1, 'Facebook',        '2026-05-22 08:15:00', 'published'),
(1, 'Indeed',          '2026-05-22 09:00:00', 'published'),
(2, 'Company Website', '2026-05-18 08:00:00', 'published'),
(2, 'Indeed',          '2026-05-18 09:30:00', 'published'),
(3, 'Company Website', '2026-05-10 08:00:00', 'published'),
(3, 'Facebook',        '2026-05-10 08:20:00', 'published'),
(4, 'Company Website', '2026-05-20 08:00:00', 'published'),
(4, 'Facebook',        '2026-05-20 08:30:00', 'published'),
(4, 'Instagram',       '2026-05-20 09:00:00', 'published'),
(5, 'Company Website', '2026-05-15 08:00:00', 'published'),
(5, 'Instagram',       '2026-05-15 08:45:00', 'published'),
(6, 'Company Website', '2026-05-08 08:00:00', 'published'),
(6, 'Indeed',          '2026-05-08 09:15:00', 'published');

-- applicants (ids 1-10)
INSERT INTO `applicants` (`applicant_id`, `applicant_code`, `job_post_id`, `name`, `email`, `phone`, `applied_at`, `fit_score`, `status`, `stage`, `source`, `resume_file_path`, `summary`, `flags_json`) VALUES
(1,  'APP-1032', 1, 'Camille Ortega',     'camille.ortega@email.com',     '0917 664 2219', '2026-07-22 15:47:00', 93.00, 'fit',        'Hired',              'Referral',     '/uploads/resumes/camille_ortega_resume.pdf', 'Referred by Front Office Manager; completed practical assessment with 94%.', '[]'),
(2,  'APP-1033', 6, 'Juan De La Cruz',    'juan.delacruz@email.com',      '0912 345 6789', '2026-07-23 09:31:00', 76.00, 'fit',        'Interview Scheduled', 'Indeed',       '/uploads/resumes/juan_delacruz_resume.pdf',   'Agency recruitment coordinator transitioning to in-house HR.', '[]'),
(3,  'APP-1034', 3, 'Mark Reyes',         'mark.reyes@email.com',         '0908 441 2277', '2026-07-24 11:05:00', 69.00, 'other-role', 'Screened',           'Walk-in',      '/uploads/resumes/mark_reyes_resume.pdf',      'Building maintenance background; endorse to Facilities vacancy.', '["Stronger match: Facilities Maintenance (81%)"]'),
(4,  'APP-1035', 5, 'Jompaks Berdugo',    'jompaks.berdugo@email.com',    '0933 552 1180', '2026-07-24 14:22:00', 84.00, 'fit',        'Assessed',           'Facebook',     '/uploads/resumes/jompaks_berdugo_resume.pdf',  'Rooftop bar experience with strong signature-cocktail portfolio.', '[]'),
(5,  'APP-1036', 2, 'Kevin Dela Cruz',    'kevin.delacruz@email.com',     '0921 774 9903', '2026-07-24 16:48:00', 91.00, 'fit',        'Offer',              'Online Portal', '/uploads/resumes/kevin_delacruz_resume.pdf',   'Certified cook with four years hot-kitchen experience across two hotel outlets.', '[]'),
(6,  'APP-1037', 2, 'Elena Torres',       'elena.torres@email.com',       '0918 220 3341', '2026-07-25 19:02:00', 22.00, 'not-fit',    'Rejected',           'Online Portal', '/uploads/resumes/elena_torres_resume.pdf',     'Clerical background with no hospitality or culinary entities detected.', '["No culinary certification","No kitchen experience detected"]'),
(7,  'APP-1038', 3, 'Princess Mabangis',  'princess.mabangis@email',      '0912 345',      '2026-07-25 20:10:00', 58.00, 'credential', 'Screened',           'Walk-in',      '/uploads/resumes/princess_mabangis_resume.pdf', 'Relevant housekeeping experience but contact details failed NER validation.', '["Malformed email address","Incomplete phone number","Job position typo on application form"]'),
(8,  'APP-1039', 1, 'Kanor Ornak',        'kanor.ornak@email.com',        '0905 118 7742', '2026-07-25 21:12:00', 74.00, 'other-role', 'Screened',           'Indeed',       '/uploads/resumes/kanor_ornak_resume.pdf',      'Retail and cafe service background; better aligned to F&B service roles.', '["Stronger match: Restaurant Server (86%)"]'),
(9,  'APP-1040', 4, 'Marjun Devera',      'marjun.devera@email.com',      '0917 664 2219', '2026-07-25 22:40:00', 88.00, 'fit',        'Accepted',           'Referral',     '/uploads/resumes/marjun_devera_resume.pdf',    'Strong dining-room service background with banquet exposure.', '[]'),
(10, 'APP-1041', 1, 'Bianca Soriano',     'bianca.soriano@email.com',     '0912 345 6789', '2026-07-25 23:15:00', 96.00, 'fit',        'Interview Scheduled', 'Online Portal', '/uploads/resumes/bianca_soriano_resume.pdf',   'Three years front office experience at a 4-star property, PMS proficient, complete credentials.', '[]');

-- applicant_screening_entities
INSERT INTO `applicant_screening_entities` (`applicant_id`, `label`, `value`) VALUES
(1,  'SKILL', 'Guest Relations'),
(1,  'CERT',  'TESDA Front Office NC II'),
(1,  'EDU',   'BS Tourism'),
(2,  'SKILL', 'Recruitment'),
(2,  'EDU',   'BS Psychology'),
(2,  'ORG',   'Metro Staffing'),
(3,  'SKILL', 'Maintenance'),
(3,  'SKILL', 'Laundry Operations'),
(4,  'SKILL', 'Mixology'),
(4,  'CERT',  'TESDA Bartending NC II'),
(4,  'ORG',   'Sky Lounge BGC'),
(5,  'SKILL', 'Hot Kitchen'),
(5,  'CERT',  'TESDA Cookery NC II'),
(5,  'CERT',  'Food Handler'),
(5,  'ORG',   'Seaside Grill'),
(6,  'SKILL', 'Data Entry'),
(6,  'EDU',   'BS Accountancy'),
(7,  'SKILL', 'Room Turnover'),
(7,  'ORG',   'Sunrise Inn'),
(8,  'SKILL', 'Cash Handling'),
(8,  'SKILL', 'Inventory'),
(8,  'ORG',   'Cafe Verde'),
(8,  'EDU',   'College Level'),
(9,  'SKILL', 'Table Service'),
(9,  'SKILL', 'POS Systems'),
(9,  'ORG',   'Bistro Manila'),
(9,  'EDU',   'HRM Vocational'),
(10, 'SKILL', 'Guest Relations'),
(10, 'SKILL', 'Opera PMS'),
(10, 'ORG',   'Grand Horizon Hotel'),
(10, 'EDU',   'BS Hospitality Management'),
(10, 'CERT',  'TESDA Front Office NC II');

-- applicant_screening_scores (Skills 40 / Work Experience 30 / Education 20 / Certifications 10)
INSERT INTO `applicant_screening_scores` (`applicant_id`, `criterion`, `score`) VALUES
(1,  'Skills', 37), (1,  'Work Experience', 28), (1,  'Educational Background', 19), (1,  'Certifications', 9),
(2,  'Skills', 28), (2,  'Work Experience', 23), (2,  'Educational Background', 18), (2,  'Certifications', 7),
(3,  'Skills', 24), (3,  'Work Experience', 21), (3,  'Educational Background', 14), (3,  'Certifications', 10),
(4,  'Skills', 32), (4,  'Work Experience', 25), (4,  'Educational Background', 17), (4,  'Certifications', 10),
(5,  'Skills', 36), (5,  'Work Experience', 27), (5,  'Educational Background', 18), (5,  'Certifications', 10),
(6,  'Skills', 8),  (6,  'Work Experience', 6),  (6,  'Educational Background', 6),  (6,  'Certifications', 2),
(7,  'Skills', 24), (7,  'Work Experience', 18), (7,  'Educational Background', 10), (7,  'Certifications', 6),
(8,  'Skills', 26), (8,  'Work Experience', 22), (8,  'Educational Background', 16), (8,  'Certifications', 10),
(9,  'Skills', 34), (9,  'Work Experience', 26), (9,  'Educational Background', 18), (9,  'Certifications', 10),
(10, 'Skills', 38), (10, 'Work Experience', 28), (10, 'Educational Background', 20), (10, 'Certifications', 10);

-- interviews
INSERT INTO `interviews` (`interview_id`, `interview_code`, `applicant_id`, `scheduled_date`, `scheduled_time`, `mode`, `interviewer_employee_id`, `interviewer_name`, `status`) VALUES
(1, 'INT-201', 10, '2026-07-28', '09:00:00', 'On-site',  1, 'Ana Ramos',            'Scheduled'),
(2, 'INT-202', 2,  '2026-07-28', '13:30:00', 'Virtual',  7, 'Juan Dela Cruz',       'Scheduled'),
(3, 'INT-203', 4,  '2026-07-29', '16:00:00', 'On-site',  2, 'Chef Gabriel Mendoza', 'Scheduled'),
(4, 'INT-204', 5,  '2026-07-30', '10:00:00', 'On-site',  2, 'Chef Gabriel Mendoza', 'Completed'),
(5, 'INT-205', 9,  '2026-07-31', '14:00:00', 'On-site',  1, 'Ana Ramos',            'Scheduled');

-- applicant_assessments (5 criteria, /100)
INSERT INTO `applicant_assessments` (`assessment_id`, `applicant_id`, `assessor_user_id`, `assessment_date`, `scores_json`, `total_score`, `outcome`, `remarks`) VALUES
(1, 1, 2, '2026-07-23', '{"Guest Service Orientation":19,"Communication Skills":18,"Technical / Practical Skill":20,"Grooming & Professionalism":18,"Availability & Flexibility":19}', 94.00, 'Recommended', 'Practical front desk simulation passed with 94%. Advanced to job offer.'),
(2, 5, 2, '2026-07-26', '{"Guest Service Orientation":16,"Communication Skills":17,"Technical / Practical Skill":18,"Grooming & Professionalism":16,"Availability & Flexibility":15}', 82.00, 'Recommended', 'Cook test assessment passed; solid knife skills and station timing.'),
(3, 4, 2, '2026-07-27', '{"Guest Service Orientation":17,"Communication Skills":18,"Technical / Practical Skill":19,"Grooming & Professionalism":17,"Availability & Flexibility":17}', 88.00, 'Recommended', 'Mixology practical assessment passed with 88%.');

-- ---------------------------------------------------------------------------
-- Domain 3: Hiring & Onboarding
-- ---------------------------------------------------------------------------

-- requisitions (position_id NULL where the position is not yet in the master;
-- position_title is the snapshot)
INSERT INTO `requisitions` (`requisition_id`, `requisition_code`, `position_id`, `position_title`, `department_id`, `requested_by_user_id`, `requested_count`, `urgency`, `justification`, `status`, `requested_at`, `converted_job_post_id`) VALUES
(1,  'REQ-1001', 1,  'Front Desk Receptionist',   1, NULL, 2, 'High',   'Two front desk associates are due to transition to the Guest Relations team next month, and occupancy is trending up for the coming peak season. Backfilling now avoids a coverage gap on the AM/PM shift rotation.', 'Pending',   '2024-05-02', 1),
(2,  'REQ-1002', 7,  'Housekeeping Attendant',    4, NULL, 3, 'Urgent', 'Room turnover times have slipped past the 30-minute SLA due to persistent understaffing. Three additional attendants are needed to restore standard turnaround ahead of the group bookings arriving this quarter.', 'Pending',   '2024-05-05', 3),
(3,  'REQ-1003', 5,  'Line Cook',                 3, NULL, 1, 'Normal', 'The kitchen brigade is short one station cook following a resignation. A replacement hire keeps the current menu rotation and banquet commitments fully staffed.', 'Pending',   '2024-05-08', 2),
(4,  'REQ-1004', 4,  'Bartender',                 2, NULL, 1, 'Normal', 'The lobby bar needs weekend coverage now that the extended happy-hour promotion has launched.', 'Pending',   '2024-05-11', 5),
(5,  'REQ-1005', NULL, 'Security Officer',        6, NULL, 2, 'High',   'Perimeter patrol shifts are currently single-manned; two additional officers restore the standard two-person rotation.', 'Done',      '2024-04-20', NULL),
(6,  'REQ-1006', NULL, 'Spa Therapist',           7, NULL, 1, 'Low',    'Guest demand for spa bookings has grown following the new wellness package launch.', 'Pending',   '2024-05-14', NULL),
(7,  'REQ-1007', NULL, 'Reservations Agent',      1, NULL, 2, 'Normal', 'Call volume has outpaced current agent capacity during the booking surge.', 'Converted', '2024-03-30', NULL),
(8,  'REQ-1008', NULL, 'Sous Chef',               3, NULL, 1, 'Urgent', 'Kitchen leadership gap after recent promotion; needs immediate backfill.', 'Pending',   '2024-05-16', NULL),
(9,  'REQ-1009', 15, 'Housekeeping Supervisor',   4, NULL, 1, 'High',   'Additional shift supervisor required to oversee the expanded night cleaning crew.', 'Done',      '2024-04-05', NULL),
(10, 'REQ-1010', NULL, 'Accounting Clerk',        8, NULL, 1, 'Normal', 'Month-end close workload has increased with the new property management system rollout.', 'Pending',   '2024-05-18', NULL),
(11, 'REQ-1011', NULL, 'Maintenance Technician',  9, NULL, 2, 'High',   'Preventive maintenance backlog requires two more technicians to stay on schedule.', 'Pending',   '2024-05-19', NULL),
(12, 'REQ-1012', 2,  'Guest Relations Officer',   1, NULL, 1, 'Normal', 'VIP guest volume has increased, requiring dedicated relations coverage.', 'Converted', '2024-03-12', NULL);

-- new_hires
INSERT INTO `new_hires` (`new_hire_id`, `new_hire_code`, `applicant_id`, `employee_id`, `name`, `email`, `phone`, `position_id`, `department_id`, `stage`, `start_date`) VALUES
(1,  'NH-01', 1,  4,  'Camille Ortega',     'camille.ortega@email.com',      '0917 664 2219', 2, 1, 'Pre-onboarding', '2026-08-04'),
(2,  'NH-02', 10, 13, 'Bianca Soriano',     'bianca.soriano@email.com',      '0912 345 6789', 1, 1, 'Pre-onboarding', '2026-08-04'),
(3,  'NH-03', 5,  5,  'Kevin Dela Cruz',    'kevin.delacruz@email.com',      '0921 774 9903', 5, 3, 'Probationary',   '2026-04-15'),
(4,  'NH-04', 4,  14, 'Jompaks Berdugo',    'jompaks.berdugo@email.com',     '0933 552 1180', 4, 2, 'Probationary',   '2026-03-01'),
(5,  'NH-05', 9,  6,  'Marjun Devera',      'marjun.devera@email.com',       '0917 664 2219', 3, 2, 'Regular',        '2025-09-16'),
(6,  'NH-06', NULL, 15, 'Angelo Torres',    'angelo.torres@email.com',       '0917 220 5541', 1, 1, 'Probationary',   '2026-05-11'),
(7,  'NH-07', NULL, 16, 'Ligaya Santos',    'ligaya.santos@email.com',       '0918 663 2201', 7, 4, 'Probationary',   '2026-02-20'),
(8,  'NH-08', NULL, 17, 'Michael Reyes',    'michael.reyes@email.com',       '0920 441 8873', 8, 5, 'Probationary',   '2026-06-01'),
(9,  'NH-09', NULL, 18, 'Patricia Gomez',   'patricia.gomez@email.com',      '0917 903 2245', 6, 3, 'Regular',        '2025-06-02'),
(10, 'NH-10', NULL, 19, 'Ernesto Villar',   'ernesto.villar@email.com',      '0921 556 7743', 7, 4, 'Regular',        '2025-03-19'),
(11, 'NH-11', NULL, 20, 'Grace Panganiban', 'grace.panganiban@email.com',    '0917 332 8890', 2, 1, 'Regular',        '2025-11-10'),
(12, 'NH-12', NULL, 21, 'Noel Fajardo',     'noel.fajardo@email.com',        '0918 774 3320', 8, 5, 'Regular',        '2025-01-27');

-- onboarding_checklist_templates (ids 1-3)
INSERT INTO `onboarding_checklist_templates` (`template_id`, `template_code`, `title`, `phase`, `position_scope_json`, `status`) VALUES
(1, 'TPL-001', 'Pre-Employment Requirements', 'Pre-onboarding', '["all"]', 'Active'),
(2, 'TPL-002', 'Standard Probationary Checklist', 'Probationary', '["all"]', 'Active'),
(3, 'TPL-003', 'Regularization Checklist', 'Regular', '["all"]', 'Active');

-- onboarding_checklist_items (ids 1-8 = TPL-001, 9-14 = TPL-002, 15-18 = TPL-003)
INSERT INTO `onboarding_checklist_items` (`template_item_id`, `template_id`, `item_text`, `sort_order`) VALUES
(1,  1, 'Signed employment contract', 1),
(2,  1, 'NBI / Police clearance', 2),
(3,  1, 'Pre-employment medical exam', 3),
(4,  1, 'SSS / PhilHealth / Pag-IBIG / TIN', 4),
(5,  1, 'Birth certificate (PSA)', 5),
(6,  1, 'Company orientation attended', 6),
(7,  1, 'Uniform & ID issued', 7),
(8,  1, 'Department on-the-job training', 8),
(9,  2, 'Department orientation completed', 1),
(10, 2, 'Job description acknowledged', 2),
(11, 2, '1st month performance evaluation', 3),
(12, 2, '3rd month performance evaluation', 4),
(13, 2, '5th month performance evaluation', 5),
(14, 2, 'Training hours completed', 6),
(15, 3, 'Regularization contract signed', 1),
(16, 3, 'HMO enrollment submitted', 2),
(17, 3, 'Leave credits activated', 3),
(18, 3, 'Performance goals set', 4);

-- employee_onboarding_items (per-employee snapshots + done flags from fixture)
INSERT INTO `employee_onboarding_items` (`employee_id`, `new_hire_id`, `template_item_id`, `item_text`, `done`, `completed_at`, `completed_by_user_id`) VALUES
(4,  1, 1,  'Signed employment contract',             1, '2026-08-01 10:00:00', 2),
(4,  1, 2,  'NBI / Police clearance',                1, '2026-08-01 10:05:00', 2),
(4,  1, 3,  'Pre-employment medical exam',           0, NULL, NULL),
(4,  1, 4,  'SSS / PhilHealth / Pag-IBIG / TIN',     0, NULL, NULL),
(4,  1, 5,  'Birth certificate (PSA)',               0, NULL, NULL),
(4,  1, 6,  'Company orientation attended',          0, NULL, NULL),
(4,  1, 7,  'Uniform & ID issued',                   0, NULL, NULL),
(4,  1, 8,  'Department on-the-job training',        0, NULL, NULL),
(13, 2, 1,  'Signed employment contract',             1, '2026-08-01 10:10:00', 2),
(13, 2, 2,  'NBI / Police clearance',                1, '2026-08-01 10:12:00', 2),
(13, 2, 3,  'Pre-employment medical exam',           1, '2026-08-02 09:00:00', 2),
(13, 2, 4,  'SSS / PhilHealth / Pag-IBIG / TIN',     1, '2026-08-02 09:30:00', 2),
(13, 2, 5,  'Birth certificate (PSA)',               1, '2026-08-02 10:00:00', 2),
(13, 2, 6,  'Company orientation attended',          0, NULL, NULL),
(13, 2, 7,  'Uniform & ID issued',                   0, NULL, NULL),
(13, 2, 8,  'Department on-the-job training',        0, NULL, NULL),
(5,  3, 1,  'Signed employment contract',             1, '2026-04-13 10:00:00', 2),
(5,  3, 2,  'NBI / Police clearance',                1, '2026-04-13 10:10:00', 2),
(5,  3, 3,  'Pre-employment medical exam',           1, '2026-04-14 09:00:00', 2),
(5,  3, 4,  'SSS / PhilHealth / Pag-IBIG / TIN',     1, '2026-04-14 09:20:00', 2),
(5,  3, 5,  'Birth certificate (PSA)',               1, '2026-04-14 09:40:00', 2),
(5,  3, 6,  'Company orientation attended',          1, '2026-04-15 08:00:00', 2),
(5,  3, 7,  'Uniform & ID issued',                   1, '2026-04-15 08:30:00', 2),
(5,  3, 8,  'Department on-the-job training',        0, NULL, NULL),
(14, 4, 1,  'Signed employment contract',             1, '2026-02-26 10:00:00', 2),
(14, 4, 2,  'NBI / Police clearance',                1, '2026-02-26 10:10:00', 2),
(14, 4, 3,  'Pre-employment medical exam',           1, '2026-02-27 09:00:00', 2),
(14, 4, 4,  'SSS / PhilHealth / Pag-IBIG / TIN',     1, '2026-02-27 09:30:00', 2),
(14, 4, 5,  'Birth certificate (PSA)',               1, '2026-02-27 10:00:00', 2),
(14, 4, 6,  'Company orientation attended',          1, '2026-02-28 08:00:00', 2),
(14, 4, 7,  'Uniform & ID issued',                   1, '2026-02-28 08:30:00', 2),
(14, 4, 8,  'Department on-the-job training',        1, '2026-02-28 16:00:00', 2),
(6,  5, 1,  'Signed employment contract',             1, '2025-09-12 10:00:00', 2),
(6,  5, 2,  'NBI / Police clearance',                1, '2025-09-12 10:10:00', 2),
(6,  5, 3,  'Pre-employment medical exam',           1, '2025-09-13 09:00:00', 2),
(6,  5, 4,  'SSS / PhilHealth / Pag-IBIG / TIN',     1, '2025-09-13 09:30:00', 2),
(6,  5, 5,  'Birth certificate (PSA)',               1, '2025-09-13 10:00:00', 2),
(6,  5, 6,  'Company orientation attended',          1, '2025-09-15 08:00:00', 2),
(6,  5, 7,  'Uniform & ID issued',                   1, '2025-09-15 08:30:00', 2),
(6,  5, NULL, 'Regularization evaluation passed',    1, '2026-03-15 14:00:00', 2),
(15, 6, 9,  'Department orientation completed',       1, '2026-05-11 08:00:00', 2),
(15, 6, 10, 'Job description acknowledged',          1, '2026-05-11 08:20:00', 2),
(15, 6, 11, '1st month performance evaluation',      1, '2026-06-10 09:00:00', 2),
(15, 6, 12, '3rd month performance evaluation',      0, NULL, NULL),
(15, 6, 13, '5th month performance evaluation',      0, NULL, NULL),
(15, 6, 14, 'Training hours completed',              0, NULL, NULL),
(16, 7, 9,  'Department orientation completed',       1, '2026-02-20 08:00:00', 2),
(16, 7, 10, 'Job description acknowledged',          1, '2026-02-20 08:20:00', 2),
(16, 7, 11, '1st month performance evaluation',      1, '2026-03-20 09:00:00', 2),
(16, 7, 12, '3rd month performance evaluation',      1, '2026-05-20 09:00:00', 2),
(16, 7, 13, '5th month performance evaluation',      0, NULL, NULL),
(16, 7, 14, 'Training hours completed',              0, NULL, NULL),
(17, 8, 9,  'Department orientation completed',       1, '2026-06-01 08:00:00', 2),
(17, 8, 10, 'Job description acknowledged',          0, NULL, NULL),
(17, 8, 11, '1st month performance evaluation',      0, NULL, NULL),
(17, 8, 12, '3rd month performance evaluation',      0, NULL, NULL),
(17, 8, 13, '5th month performance evaluation',      0, NULL, NULL),
(17, 8, 14, 'Training hours completed',              0, NULL, NULL),
(18, 9, 15, 'Regularization contract signed',        1, '2025-05-30 10:00:00', 2),
(18, 9, 16, 'HMO enrollment submitted',             1, '2025-05-30 10:30:00', 2),
(18, 9, 17, 'Leave credits activated',              1, '2025-06-02 09:00:00', 2),
(18, 9, 18, 'Performance goals set',                 1, '2025-06-02 09:30:00', 2),
(19, 10, 15, 'Regularization contract signed',       1, '2025-03-14 10:00:00', 2),
(19, 10, 16, 'HMO enrollment submitted',            1, '2025-03-14 10:30:00', 2),
(19, 10, 17, 'Leave credits activated',             1, '2025-03-17 09:00:00', 2),
(19, 10, 18, 'Performance goals set',                1, '2025-03-17 09:30:00', 2),
(20, 11, 15, 'Regularization contract signed',       1, '2025-11-07 10:00:00', 2),
(20, 11, 16, 'HMO enrollment submitted',            1, '2025-11-07 10:30:00', 2),
(20, 11, 17, 'Leave credits activated',             1, '2025-11-10 09:00:00', 2),
(20, 11, 18, 'Performance goals set',                0, NULL, NULL),
(21, 12, 15, 'Regularization contract signed',       1, '2025-01-23 10:00:00', 2),
(21, 12, 16, 'HMO enrollment submitted',            1, '2025-01-23 10:30:00', 2),
(21, 12, 17, 'Leave credits activated',             1, '2025-01-27 09:00:00', 2),
(21, 12, 18, 'Performance goals set',                1, '2025-01-27 09:30:00', 2);

-- checklist_requests (from Performance workflow)
INSERT INTO `checklist_requests` (`checklist_request_id`, `request_code`, `employee_id`, `template_id`, `phase`, `items_json`, `status`, `requested_by_user_id`, `requested_at`) VALUES
(1, 'CR-001', 22, 2, 'Probationary', '["Guest-handling scenario evaluation","PMS (Opera) proficiency check","Supervisor sign-off: guest complaints handling","Supervisor sign-off: reservations process"]', 'Pending', 2, '2026-08-04'),
(2, 'CR-002', 23, 2, 'Probationary', '["Room-turnover timing check (30-minute SLA)","Chemical-handling and safety procedure","Linen and amenities restocking check","Supervisor sign-off"]', 'Pending', 2, '2026-08-06');

-- ---------------------------------------------------------------------------
-- Domain 4: Employee Self-Service
-- ---------------------------------------------------------------------------

-- ess_categories (ids 1-9)
INSERT INTO `ess_categories` (`ess_category_id`, `code`, `name`, `description`, `is_open`, `sort_order`) VALUES
(1, 'ESS-LEAVE',  'Leave',          'Vacation, sick, emergency and other leave filings.', 1, 1),
(2, 'ESS-ATT',    'Attendance',     'Time in/out corrections, overtime and shift changes.', 1, 2),
(3, 'ESS-PAY',    'Payroll',        'Payslips, payroll inquiries and salary certificates.', 1, 3),
(4, 'ESS-PAYUPD', 'Payroll Update', 'Bank account, payment method and deduction updates.', 1, 4),
(5, 'ESS-LOAN',   'Loan',           'Company loans, salary loans and cash advances.', 1, 5),
(6, 'ESS-REIMB',  'Reimbursement',  'Transportation, travel and other expense claims.', 1, 6),
(7, 'ESS-HRDOC',  'HR Document',    'Certificates, service records and employment verification.', 1, 7),
(8, 'ESS-PINFO',  'Personal Info',  'Address, contact, civil status and government ID updates.', 1, 8),
(9, 'ESS-ACCT',   'Account',        'Password resets and ESS account access issues.', 1, 9);

-- ess_requests
INSERT INTO `ess_requests` (`ess_request_id`, `request_code`, `employee_id`, `category_id`, `request_type`, `filed_at`, `date_from`, `date_to`, `status`, `assigned_to_user_id`, `details`, `review_note`, `returned_count`, `attachment_path`) VALUES
(1, 'REQ-4410', 5,  1, 'Sick Leave',                '2026-07-25 09:00:00', '2026-07-27', '2026-07-27', 'Pending',     2, '1 day sick leave with medical certificate attached.', NULL, 0, '/uploads/ess/req-4410-medical.pdf'),
(2, 'REQ-4409', 6,  7, 'Certificate of Employment', '2026-07-24 10:00:00', NULL, NULL, 'Under Review', 7, 'COE for bank loan application, needs salary details.', NULL, 0, NULL),
(3, 'REQ-4408', 8,  2, 'Attendance Correction',     '2026-07-24 11:00:00', NULL, NULL, 'Approved',     2, 'Missing time-out on 2026-07-22, verified with floor logbook.', 'Verified against floor logbook entry.', 0, NULL),
(4, 'REQ-4407', 4,  3, 'Payslip Request',           '2026-07-23 14:00:00', NULL, NULL, 'Completed',    8, 'Payslip copies for June 2026 cut-offs.', 'Copies released via HR portal.', 0, NULL),
(5, 'REQ-4406', 5,  6, 'Transportation',            '2026-07-21 09:00:00', NULL, NULL, 'Rejected',     8, 'Missing official receipt for claimed amount.', 'Official receipt not provided.', 1, NULL),
(6, 'REQ-4405', 1,  5, 'Company Loan',              '2026-07-20 13:00:00', NULL, NULL, 'Under Review', 8, 'PHP 50,000 company loan payable in 12 months.', NULL, 0, '/uploads/ess/req-4405-loan-agreement.pdf'),
(7, 'REQ-4404', 8,  8, 'Contact Number Update',     '2026-07-19 09:00:00', NULL, NULL, 'Completed',    7, 'Updated mobile number and emergency contact.', 'Record updated in 201 file.', 0, NULL);

-- leave_balances (year 2026)
INSERT INTO `leave_balances` (`employee_id`, `leave_type`, `period_year`, `total_days`, `used_days`) VALUES
(5,  'Vacation Leave',  2026, 15.00, 4.00),
(5,  'Sick Leave',      2026, 15.00, 3.00),
(5,  'Emergency Leave', 2026, 5.00,  1.00),
(5,  'Solo Parent Leave', 2026, 7.00, 0.00),
(1,  'Vacation Leave',  2026, 15.00, 8.00),
(1,  'Sick Leave',      2026, 15.00, 5.00),
(1,  'Emergency Leave', 2026, 5.00,  2.00),
(6,  'Vacation Leave',  2026, 15.00, 6.00),
(6,  'Sick Leave',      2026, 15.00, 2.00),
(8,  'Vacation Leave',  2026, 15.00, 9.00),
(8,  'Sick Leave',      2026, 15.00, 4.00);

-- attendance_records (Kevin Dela Cruz, employee_id 5)
INSERT INTO `attendance_records` (`employee_id`, `work_date`, `time_in`, `time_out`, `break_in`, `break_out`, `hours_worked`, `late_minutes`, `undertime_minutes`, `overtime_hours`, `remark`, `status`) VALUES
(5, '2026-07-21', '2026-07-21 07:50:00', '2026-07-21 16:30:00', '2026-07-21 12:00:00', '2026-07-21 12:58:00', 8.10, 0, 0, 0.00, 'Present',     'Completed'),
(5, '2026-07-22', NULL,                   NULL,                   NULL,                    NULL,                   0.00,  0, 0, 0.00, 'Sick Leave',  NULL),
(5, '2026-07-23', '2026-07-23 07:55:00', '2026-07-23 18:40:00', '2026-07-23 12:00:00', '2026-07-23 12:55:00', 10.20, 0, 0, 2.00, 'Overtime 2h', 'Completed'),
(5, '2026-07-24', '2026-07-24 08:07:00', '2026-07-24 17:10:00', '2026-07-24 12:05:00', '2026-07-24 12:58:00', 8.50,  7, 0, 0.00, 'Late 7 mins', 'Completed'),
(5, '2026-07-25', '2026-07-25 07:48:00', '2026-07-25 16:32:00', '2026-07-25 12:00:00', '2026-07-25 12:58:00', 8.20,  0, 0, 0.00, 'Present',     'Completed'),
(6, '2026-07-24', '2026-07-24 09:58:00', '2026-07-24 18:02:00', '2026-07-24 12:00:00', '2026-07-24 12:45:00', 8.10,  0, 0, 0.00, 'Present',     'Completed'),
(6, '2026-07-25', '2026-07-25 09:55:00', '2026-07-25 18:05:00', '2026-07-25 12:02:00', '2026-07-25 12:50:00', 8.20,  0, 0, 0.00, 'Present',     'Completed');

-- work_schedules (Kevin Dela Cruz; day_of_week 0 = Monday ... 6 = Sunday)
INSERT INTO `work_schedules` (`employee_id`, `day_of_week`, `shift_name`, `start_time`, `end_time`, `location`, `is_rest_day`, `effective_from`, `effective_to`) VALUES
(5, 0, 'AM Shift', '07:00:00', '16:00:00', 'Main Kitchen', 0, '2026-07-01', NULL),
(5, 1, 'AM Shift', '07:00:00', '16:00:00', 'Main Kitchen', 0, '2026-07-01', NULL),
(5, 2, 'Mid Shift', '11:00:00', '20:00:00', 'Banquet',      0, '2026-07-01', NULL),
(5, 3, 'Mid Shift', '11:00:00', '20:00:00', 'Banquet',      0, '2026-07-01', NULL),
(5, 4, 'PM Shift', '14:00:00', '23:00:00', 'Main Kitchen', 0, '2026-07-01', NULL),
(5, 5, NULL,        NULL,        NULL,        NULL,          1, '2026-07-01', NULL),
(5, 6, NULL,        NULL,        NULL,        NULL,          1, '2026-07-01', NULL);

-- ---------------------------------------------------------------------------
-- Domain 5: Payroll & Benefits
-- ---------------------------------------------------------------------------

-- payroll_periods (ids 1-4)
INSERT INTO `payroll_periods` (`payroll_period_id`, `period_code`, `period_name`, `period_start`, `period_end`, `payout_date`, `status`) VALUES
(1, 'PAY-2026-06-1C', '1st Cut-off June 2026', '2026-06-01', '2026-06-15', '2026-06-20', 'Closed'),
(2, 'PAY-2026-06-2C', '2nd Cut-off June 2026', '2026-06-16', '2026-06-30', '2026-07-05', 'Closed'),
(3, 'PAY-2026-07-1C', '1st Cut-off July 2026', '2026-07-01', '2026-07-15', '2026-07-20', 'Closed'),
(4, 'PAY-2026-07-2C', '2nd Cut-off July 2026', '2026-07-16', '2026-07-31', '2026-08-05', 'Open');

-- payroll_records
INSERT INTO `payroll_records` (`payroll_record_id`, `employee_id`, `payroll_period_id`, `pay_period_start`, `pay_period_end`, `payout_date`, `gross_pay`, `net_pay`, `status`) VALUES
(1, 5, 1, '2026-06-01', '2026-06-15', '2026-06-20', 10600.00,  8975.00,  'Released'),
(2, 5, 2, '2026-06-16', '2026-06-30', '2026-07-05', 10650.00,  9040.00,  'Released'),
(3, 5, 3, '2026-07-01', '2026-07-15', '2026-07-20', 10750.00,  9120.00,  'Released'),
(4, 5, 4, '2026-07-16', '2026-07-31', '2026-08-05', 21500.00, 18240.00,  'Draft'),
(5, 6, 3, '2026-07-01', '2026-07-15', '2026-07-20', 17400.00, 15120.00,  'Released'),
(6, 1, 3, '2026-07-01', '2026-07-15', '2026-07-20', 48000.00, 41300.00,  'Finalized'),
(7, 8, 3, '2026-07-01', '2026-07-15', '2026-07-20', 26000.00, 22800.00,  'Released');

-- payroll_items (earnings sum to gross_pay; deductions sum to gross-net)
INSERT INTO `payroll_items` (`payroll_record_id`, `item_type`, `label`, `amount`) VALUES
(1, 'Earning',   'Basic Pay',            8000.00),
(1, 'Earning',   'Overtime Pay',          950.00),
(1, 'Earning',   'Night Differential',    400.00),
(1, 'Earning',   'Meal Allowance',        750.00),
(1, 'Earning',   'Service Charge',        500.00),
(1, 'Deduction', 'SSS',                   450.00),
(1, 'Deduction', 'PhilHealth',            275.00),
(1, 'Deduction', 'Pag-IBIG',              100.00),
(1, 'Deduction', 'Withholding Tax',       575.00),
(1, 'Deduction', 'Company Loan',          225.00),
(2, 'Earning',   'Basic Pay',            8000.00),
(2, 'Earning',   'Overtime Pay',         1000.00),
(2, 'Earning',   'Night Differential',    400.00),
(2, 'Earning',   'Meal Allowance',        750.00),
(2, 'Earning',   'Service Charge',        500.00),
(2, 'Deduction', 'SSS',                   450.00),
(2, 'Deduction', 'PhilHealth',            275.00),
(2, 'Deduction', 'Pag-IBIG',              100.00),
(2, 'Deduction', 'Withholding Tax',       560.00),
(2, 'Deduction', 'Company Loan',          225.00),
(3, 'Earning',   'Basic Pay',            8000.00),
(3, 'Earning',   'Overtime Pay',         1050.00),
(3, 'Earning',   'Night Differential',    450.00),
(3, 'Earning',   'Meal Allowance',        750.00),
(3, 'Earning',   'Service Charge',        500.00),
(3, 'Deduction', 'SSS',                   450.00),
(3, 'Deduction', 'PhilHealth',            275.00),
(3, 'Deduction', 'Pag-IBIG',              100.00),
(3, 'Deduction', 'Withholding Tax',       580.00),
(3, 'Deduction', 'Company Loan',          225.00),
(4, 'Earning',   'Basic Pay',           16000.00),
(4, 'Earning',   'Overtime Pay',         2100.00),
(4, 'Earning',   'Night Differential',    900.00),
(4, 'Earning',   'Meal Allowance',       1500.00),
(4, 'Earning',   'Service Charge',       1000.00),
(4, 'Deduction', 'SSS',                   900.00),
(4, 'Deduction', 'PhilHealth',            550.00),
(4, 'Deduction', 'Pag-IBIG',              200.00),
(4, 'Deduction', 'Withholding Tax',      1160.00),
(4, 'Deduction', 'Company Loan',          450.00),
(5, 'Earning',   'Basic Pay',           14000.00),
(5, 'Earning',   'Service Charge',       1800.00),
(5, 'Earning',   'Meal Allowance',       1600.00),
(5, 'Deduction', 'SSS',                   700.00),
(5, 'Deduction', 'PhilHealth',            400.00),
(5, 'Deduction', 'Pag-IBIG',              200.00),
(5, 'Deduction', 'Withholding Tax',       980.00),
(6, 'Earning',   'Basic Pay',           42000.00),
(6, 'Earning',   'Service Charge',       4000.00),
(6, 'Earning',   'Meal Allowance',       2000.00),
(6, 'Deduction', 'SSS',                  1125.00),
(6, 'Deduction', 'PhilHealth',            750.00),
(6, 'Deduction', 'Pag-IBIG',              300.00),
(6, 'Deduction', 'Withholding Tax',      4525.00),
(7, 'Earning',   'Basic Pay',           23500.00),
(7, 'Earning',   'Service Charge',       1800.00),
(7, 'Earning',   'Meal Allowance',        700.00),
(7, 'Deduction', 'SSS',                   800.00),
(7, 'Deduction', 'PhilHealth',            450.00),
(7, 'Deduction', 'Pag-IBIG',              200.00),
(7, 'Deduction', 'Withholding Tax',      1750.00);

-- employee_benefits
INSERT INTO `employee_benefits` (`employee_id`, `benefit_name`, `reference_value`, `note`, `effective_date`, `end_date`, `status`) VALUES
(5, 'SSS',          '34-1234567-8',     'Active contributions',              '2026-04-15', NULL,          'Active'),
(5, 'PhilHealth',   '12-345678901-2',   'Active',                            '2026-04-15', NULL,          'Active'),
(5, 'Pag-IBIG',     '1234-5678-9012',   'Active + MP2',                      '2026-04-15', NULL,          'Active'),
(5, 'BIR Tax Status', 'S — Single',     'TIN 123-456-789',                   '2026-04-15', NULL,          'Active'),
(5, 'HMO',          'Maxicare Platinum','Effective after regularization',     '2026-08-15', NULL,          'Inactive'),
(5, 'Insurance',    'Group Life',       'PHP 500,000 coverage',              '2026-04-15', NULL,          'Active'),
(1, 'SSS',          '34-2233445-6',     'Active contributions',              '2019-02-11', NULL,          'Active'),
(1, 'HMO',          'Maxicare Gold',    'Executive plan',                    '2019-03-01', NULL,          'Active'),
(6, 'SSS',          '34-5566778-9',     'Active contributions',              '2025-09-16', NULL,          'Active'),
(6, 'HMO',          'Maxicare Silver',  'Effective after regularization',    '2026-03-15', NULL,          'Active'),
(8, 'SSS',          '34-7788990-1',     'Active contributions',              '2021-05-03', NULL,          'Active'),
(8, 'Insurance',    'Group Life',       'PHP 300,000 coverage',              '2021-05-03', NULL,          'Active');

-- ---------------------------------------------------------------------------
-- Domain 6: Learning & Performance
-- ---------------------------------------------------------------------------

-- learning_courses
INSERT INTO `learning_courses` (`course_id`, `course_code`, `title`, `category`, `description`) VALUES
(1, 'LMS-101', 'Food Safety & Sanitation Level 2', 'Culinary & Safety', 'HACCP-based food safety and sanitation practices for kitchen staff.'),
(2, 'LMS-102', 'Customer Excellence in Hospitality', 'Service Quality', 'Service standards and guest-excellence behaviors across guest-facing roles.'),
(3, 'LMS-103', 'Fire Safety & Emergency Response', 'Compliance', 'Fire prevention, evacuation procedures, and emergency response drills.');

-- employee_learning
INSERT INTO `employee_learning` (`employee_id`, `course_id`, `status`, `score`, `assigned_date`, `completed_date`) VALUES
(5, 1, 'Completed',   95.00, '2026-05-10', '2026-07-10'),
(5, 2, 'Completed',   88.00, '2026-05-10', '2026-06-24'),
(5, 3, 'In Progress', NULL,  '2026-07-15', NULL),
(6, 2, 'Completed',   90.00, '2026-04-01', '2026-06-30');

-- performance_reviews
INSERT INTO `performance_reviews` (`employee_id`, `review_period`, `review_date`, `competency_level`, `overall_rating`, `salary_grade_id`, `salary_step`, `evaluator_user_id`, `comments`) VALUES
(5, 'Q2 2026', '2026-07-15', 'Proficient', 3.50, 2, 'Step 2', 3, 'Meets expectations; consistent food safety compliance and station discipline.'),
(6, 'Q2 2026', '2026-07-15', 'Proficient', 4.00, 1, 'Step 1', 2, 'Strong banquet service support; recommended for promotion track.'),
(1, 'Q2 2026', '2026-07-15', 'Expert',     4.50, 6, 'Step 3', 2, 'Highest guest satisfaction score this quarter among department heads.');

-- hr3_recommendations
INSERT INTO `hr3_recommendations` (`recommendation_id`, `employee_id`, `recommendation_type`, `evaluation_score`, `evaluator_user_id`, `date_submitted`, `status`, `suggested_position_id`, `suggested_salary_grade_id`, `current_employment_type`, `comments`) VALUES
(1, 4, 'Regularization', 94.80, 3, '2026-08-01', 'Pending HR Action', 2,  4, 'Probationary', 'Exceeded guest satisfaction metrics during 6-month evaluation window. Highly recommended for full regularization.'),
(2, 5, 'Regularization', 91.20, NULL, '2026-07-28', 'Pending HR Action', 5,  2, 'Probationary', 'Punctual, excellent culinary prep speed and kitchen hygiene compliance. Recommended for regularization.'),
(3, 6, 'Promotion',      96.50, NULL, '2026-08-03', 'Pending HR Action', NULL, 4, 'Regular', 'Demonstrated strong leadership during banquet events. Passed succession planning assessment with distinction.');

-- ---------------------------------------------------------------------------
-- Domain 7: Access Control, Audit & System
-- ---------------------------------------------------------------------------

-- system_roles (ids 1-3)
INSERT INTO `system_roles` (`role_id`, `role_name`, `description`) VALUES
(1, 'Super Admin', 'Full system access across all modules and settings'),
(2, 'Admin', 'HR admin: recruitment, onboarding, employee records, ESS approval'),
(3, 'Employee', 'Self-service portal access for employees');

-- role_permissions (30 rows = 3 roles x 10 modules, from users.ts defaultMatrix)
INSERT INTO `role_permissions` (`role_id`, `module_name`, `permission_level`) VALUES
(1, 'Dashboard', 'Full'), (1, 'Applicant Management', 'Full'), (1, 'Recruitment Management', 'Full'), (1, 'New Hire Onboarding', 'Full'), (1, 'Core HCM', 'Full'), (1, 'Employee Records', 'Full'), (1, 'ESS Management', 'Full'), (1, 'User Management', 'Full'), (1, 'Audit Logs', 'Full'), (1, 'Settings', 'Full'),
(2, 'Dashboard', 'View'), (2, 'Applicant Management', 'Edit'), (2, 'Recruitment Management', 'Edit'), (2, 'New Hire Onboarding', 'Edit'), (2, 'Core HCM', 'View'), (2, 'Employee Records', 'Edit'), (2, 'ESS Management', 'Approve / Reject Only'), (2, 'User Management', 'None'), (2, 'Audit Logs', 'None'), (2, 'Settings', 'View'),
(3, 'Dashboard', 'View'), (3, 'Applicant Management', 'None'), (3, 'Recruitment Management', 'None'), (3, 'New Hire Onboarding', 'View'), (3, 'Core HCM', 'None'), (3, 'Employee Records', 'None'), (3, 'ESS Management', 'View'), (3, 'User Management', 'None'), (3, 'Audit Logs', 'None'), (3, 'Settings', 'View');

-- system_users (password hash = bcrypt("Oxford@2026"))
INSERT INTO `system_users` (`system_user_id`, `username`, `email`, `password_hash`, `full_name`, `department_name`, `employee_id`, `role_id`, `status`, `last_login_at`, `last_login_ip`) VALUES
(1, 'bullseur',  'bullseur@oxfordsuites.com.ph',          '$2b$10$Oji0t1I10YUhX3drMn6WnuvNPzEdTSF4/XFIbIqIsEK2cFv2kOas6', 'Bullseur Santiago',    'Administration / HR', NULL,     1, 'Active',    '2026-07-26 08:12:00', '192.168.10.4'),
(2, 'jdelacruz', 'juan.delacruz@oxfordsuites.com.ph',     '$2b$10$Oji0t1I10YUhX3drMn6WnuvNPzEdTSF4/XFIbIqIsEK2cFv2kOas6', 'Juan Dela Cruz',       'Administration / HR', 7,       2, 'Active',    '2026-07-26 07:58:00', '192.168.10.22'),
(3, 'aramos',    'ana.ramos@oxfordsuites.com.ph',         '$2b$10$Oji0t1I10YUhX3drMn6WnuvNPzEdTSF4/XFIbIqIsEK2cFv2kOas6', 'Ana Ramos',            'Front Office',        1,       2, 'Active',    '2026-07-25 21:04:00', '192.168.10.31'),
(4, 'kdelacruz', 'kevin.delacruz@oxfordsuites.com.ph',    '$2b$10$Oji0t1I10YUhX3drMn6WnuvNPzEdTSF4/XFIbIqIsEK2cFv2kOas6', 'Kevin Dela Cruz',      'Kitchen / Culinary',   5,       3, 'Active',    '2026-07-25 14:40:00', '10.0.4.88'),
(5, 'mdevera',   'marjun.devera@oxfordsuites.com.ph',     '$2b$10$Oji0t1I10YUhX3drMn6WnuvNPzEdTSF4/XFIbIqIsEK2cFv2kOas6', 'Marjun Devera',        'Food & Beverage',     6,       3, 'Suspended', '2026-07-20 19:11:00', '10.0.4.101'),
(6, 'raquino',   'rosa.aquino@oxfordsuites.com.ph',       '$2b$10$Oji0t1I10YUhX3drMn6WnuvNPzEdTSF4/XFIbIqIsEK2cFv2kOas6', 'Rosa Aquino',          'Housekeeping',        8,       3, 'Active',    '2026-07-26 06:03:00', '10.0.4.57'),
(7, 'mlim',      'maria.lim@oxfordsuites.com.ph',         '$2b$10$Oji0t1I10YUhX3drMn6WnuvNPzEdTSF4/XFIbIqIsEK2cFv2kOas6', 'Maria Lim',            'Administration / HR', 11,      2, 'Active',    '2026-07-26 07:45:00', '192.168.10.18'),
(8, 'pcruz',     'paolo.cruz@oxfordsuites.com.ph',        '$2b$10$Oji0t1I10YUhX3drMn6WnuvNPzEdTSF4/XFIbIqIsEK2cFv2kOas6', 'Paolo Cruz',           'Administration / HR', 12,      2, 'Active',    '2026-07-25 17:30:00', '192.168.10.12');

-- notifications
INSERT INTO `notifications` (`system_user_id`, `type`, `title`, `body`, `module_name`, `target_type`, `target_id`, `is_read`, `read_at`) VALUES
(2, 'ess_request',  'New ESS request pending',      'Sick leave request REQ-4410 filed by Kevin Dela Cruz awaits review.',    'ESS Management', 'ess_request', 'REQ-4410', 0, NULL),
(2, 'hr3',          'HR3 recommendation pending',   'Regularization recommendation for Camille Ortega is pending HR action.', 'Core HCM',       'hr3_recommendation', 'HR3-REC-01', 0, NULL),
(2, 'checklist',    'Checklist request raised',     'Miguel Torres probationary checklist requested (CR-001).',                'New Hire Onboarding', 'checklist_request', 'CR-001', 0, NULL),
(2, 'checklist',    'Checklist request raised',     'Andrea Lim probationary checklist requested (CR-002).',                   'New Hire Onboarding', 'checklist_request', 'CR-002', 0, NULL),
(3, 'ess_request',  'Interview reminder',           'Interview with Bianca Soriano scheduled for 2026-07-28, 09:00 AM.',       'Applicant Management', 'interview', 'INT-201', 0, NULL),
(3, 'hr3',          'HR3 recommendation submitted', 'Regularization recommendation for Camille Ortega submitted for review.',   'Core HCM',       'hr3_recommendation', 'HR3-REC-01', 1, '2026-08-02 09:00:00'),
(1, 'audit',        'Critical audit event',         'Permission matrix was modified for role Admin.',                            'User Management', 'audit_log', 'LOG-9001', 0, NULL),
(7, 'ess_request',  'COE request assigned',         'Certificate of Employment request REQ-4409 assigned to you.',              'ESS Management', 'ess_request', 'REQ-4409', 0, NULL),
(8, 'ess_request',  'Loan application under review','Company loan application REQ-4405 assigned to you.',                       'ESS Management', 'ess_request', 'REQ-4405', 0, NULL);

-- user_login_activity
INSERT INTO `user_login_activity` (`system_user_id`, `login_at`, `ip_address`, `device_info`, `user_agent`, `status`) VALUES
(4, '2026-07-31 08:12:00', '10.0.4.88',  'Chrome · Windows',      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'success'),
(4, '2026-07-30 18:45:00', '10.0.4.88',  'Mobile App · Android',  'OxfordSuitesHR/1.0 (Android 14)',                                'success'),
(4, '2026-07-25 09:30:00', '10.0.4.88',  'Edge · Windows',        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edg/126.0',           'success'),
(1, '2026-07-26 08:12:00', '192.168.10.4', 'Chrome · Windows',    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0',        'success'),
(2, '2026-07-26 07:58:00', '192.168.10.22', 'Edge · Windows',     'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edg/126.0',           'success'),
(5, '2026-07-25 20:41:00', '10.0.4.101', 'Chrome · Android',       'Mozilla/5.0 (Linux; Android 13; Chrome/126.0)',                 'failed'),
(5, '2026-07-25 20:40:00', '10.0.4.101', 'Chrome · Android',       'Mozilla/5.0 (Linux; Android 13; Chrome/126.0)',                 'failed'),
(5, '2026-07-20 19:11:00', '10.0.4.101', 'Chrome · Android',       'Mozilla/5.0 (Linux; Android 13; Chrome/126.0)',                 'success');

-- audit_logs (system-user activity log + applicant-management audit trail)
INSERT INTO `audit_logs` (`system_user_id`, `actor_role`, `actor_department`, `occurred_at`, `action`, `module_name`, `target_type`, `target_id`, `details`, `severity`, `ip_address`, `device_info`) VALUES
(1, 'Super Admin', 'Administration / HR', '2026-07-26 08:14:00', 'Updated permission matrix for role Admin', 'User Management', 'role', 'Admin', 'Set ESS Management to Approve / Reject Only.', 'Critical', '192.168.10.4', 'Chrome on Windows'),
(2, 'Admin', 'Administration / HR', '2026-07-26 08:02:00', 'Approved leave request LR-2231', 'ESS Management', 'ess_request', 'LR-2231', 'Sick leave approved for 1 day.', 'Info', '192.168.10.22', 'Edge on Windows'),
(3, 'Admin', 'Front Office', '2026-07-25 23:20:00', 'Scheduled interview for APP-1041', 'Applicant Management', 'applicant', 'APP-1041', 'On-site interview booked for 2026-07-28, 09:00 AM.', 'Info', '192.168.10.31', 'Safari on macOS'),
(NULL, 'System', 'System', '2026-07-25 22:58:00', 'Resume screening batch completed (14 resumes, NER model v2.3)', 'Applicant Management', 'system', 'batch', 'NER screening pipeline finished.', 'Info', '127.0.0.1', 'Server process'),
(5, 'Employee', 'Food & Beverage', '2026-07-25 20:41:00', 'Failed login attempt (3rd) — account suspended', 'Authentication', 'user', 'USR-005', 'Account auto-suspended after repeated failures.', 'Warning', '10.0.4.101', 'Chrome on Android'),
(1, 'Super Admin', 'Administration / HR', '2026-07-25 17:09:00', 'Deleted job position POS-011 (Seasonal Banquet Server)', 'Core HCM', 'position', 'POS-011', 'Position removed from master.', 'Critical', '192.168.10.4', 'Chrome on Windows'),
(2, 'Admin', 'Administration / HR', '2026-07-25 11:22:00', 'Published job post ''Line Cook'' to Indeed and Facebook', 'Recruitment Management', 'job_post', 'line-cook', 'Publishing platforms updated.', 'Info', '192.168.10.22', 'Edge on Windows'),
(1, 'Super Admin', 'Administration / HR', '2026-07-25 09:15:00', 'Modified password policy to require strong credentials', 'User Management', 'setting', 'password_policy', 'Policy requires 8+ chars, uppercase, number, symbol.', 'Warning', '192.168.10.4', 'Chrome on Windows'),
(3, 'Admin', 'Front Office', '2026-07-24 16:45:00', 'Created new employee record for Camille Ortega', 'Core HCM', 'employee', 'EMP-0004', 'Probationary Guest Relations Officer record created.', 'Info', '192.168.10.31', 'Safari on macOS'),
(2, 'Admin', 'Administration / HR', '2026-07-24 14:10:00', 'Exported monthly HR headcount report to PDF', 'Employee Records', 'report', 'headcount', 'Monthly report exported.', 'Info', '192.168.10.22', 'Edge on Windows'),
(4, 'Employee', 'Kitchen / Culinary', '2026-07-24 10:05:00', 'Submitted shift swap request with Marco Santos', 'ESS Management', 'ess_request', 'SHIFT-SWAP-001', 'Shift swap between kitchen crew.', 'Info', '10.0.4.88', 'Chrome on Android'),
(1, 'Super Admin', 'Administration / HR', '2026-07-23 18:30:00', 'Revoked active session for user mdevera', 'User Management', 'user', 'USR-005', 'All sessions terminated.', 'Critical', '192.168.10.4', 'Chrome on Windows'),
(3, 'Admin', 'Housekeeping', '2026-07-23 15:12:00', 'Updated room attendant onboarding checklist', 'New Hire Onboarding', 'template', 'TPL-002', 'Checklist items adjusted.', 'Info', '192.168.10.31', 'Safari on macOS'),
(2, 'Admin', 'Administration / HR', '2026-07-23 11:00:00', 'Approved overtime request for Front Office team', 'ESS Management', 'ess_request', 'OT-FO-001', 'Overtime for peak season approved.', 'Info', '192.168.10.22', 'Edge on Windows'),
(2, 'Admin', 'Administration / HR', '2026-07-20 09:12:00', 'Applicant Added', 'Screening', 'applicant', 'APP-1032', 'Added via document screening — camille_resume.pdf, scored 93%.', 'Info', '192.168.10.22', 'Edge on Windows'),
(3, 'Admin', 'Front Office', '2026-07-21 10:40:00', 'Interview Booked', 'Interview Scheduling', 'applicant', 'APP-1032', 'On-site interview booked for 2026-07-22, 09:00 AM.', 'Info', '192.168.10.31', 'Safari on macOS'),
(3, 'Admin', 'Front Office', '2026-07-22 09:05:00', 'Interview Completed', 'Interview Scheduling', 'applicant', 'APP-1032', 'Interview marked complete, strong guest-facing presence noted.', 'Info', '192.168.10.31', 'Safari on macOS'),
(2, 'Admin', 'Administration / HR', '2026-07-23 14:15:00', 'Assessment Started', 'Assessment', 'applicant', 'APP-1032', 'Practical front desk simulation started.', 'Info', '192.168.10.22', 'Edge on Windows'),
(2, 'Admin', 'Administration / HR', '2026-07-23 15:40:00', 'Assessment Accepted', 'Assessment', 'applicant', 'APP-1032', 'Assessment score 94% — advanced to job offer.', 'Info', '192.168.10.22', 'Edge on Windows'),
(NULL, 'F&B Director', 'Food & Beverage', '2026-07-24 11:00:00', 'Interview Booked', 'Interview Scheduling', 'applicant', 'APP-1035', 'On-site interview booked for 2026-07-29, 04:00 PM.', 'Info', '192.168.10.2', 'Chrome on Windows'),
(NULL, 'F&B Director', 'Food & Beverage', '2026-07-24 13:20:00', 'Interview Booked', 'Interview Scheduling', 'applicant', 'APP-1036', 'On-site interview booked for 2026-07-30, 10:00 AM.', 'Info', '192.168.10.2', 'Chrome on Windows'),
(2, 'Admin', 'Administration / HR', '2026-07-24 17:05:00', 'Status Change', 'Screening', 'applicant', 'APP-1034', 'Stage moved to Screened after resume re-check.', 'Info', '192.168.10.22', 'Edge on Windows'),
(NULL, 'Executive Housekeeper', 'Housekeeping', '2026-07-24 17:30:00', 'Applicant Transferred', 'Screening', 'applicant', 'APP-1034', 'Flagged as stronger match for Facilities Maintenance.', 'Info', '192.168.10.3', 'Chrome on Windows'),
(2, 'Admin', 'Administration / HR', '2026-07-25 08:50:00', 'Applicant Rejected', 'Screening', 'applicant', 'APP-1037', 'No culinary certification or kitchen experience detected.', 'Info', '192.168.10.22', 'Edge on Windows'),
(2, 'Admin', 'Administration / HR', '2026-07-25 09:35:00', 'Applicant Added', 'Screening', 'applicant', 'APP-1038', 'Added via image (OCR) screening — walk-in resume scan.', 'Info', '192.168.10.22', 'Edge on Windows'),
(2, 'Admin', 'Administration / HR', '2026-07-25 10:15:00', 'Applicant Added', 'Screening', 'applicant', 'APP-1039', 'Added via document screening from Indeed source.', 'Info', '192.168.10.22', 'Edge on Windows'),
(3, 'Admin', 'Front Office', '2026-07-25 11:02:00', 'Applicant Transferred', 'Screening', 'applicant', 'APP-1039', 'Suggested stronger match: Restaurant Server (86%).', 'Info', '192.168.10.31', 'Safari on macOS'),
(2, 'Admin', 'Administration / HR', '2026-07-25 13:48:00', 'Applicant Added', 'Screening', 'applicant', 'APP-1040', 'Added via document screening — referral source.', 'Info', '192.168.10.22', 'Edge on Windows'),
(2, 'Admin', 'Administration / HR', '2026-07-25 16:30:00', 'Applicant Added', 'Screening', 'applicant', 'APP-1041', 'Added via document screening — online portal, scored 96%.', 'Info', '192.168.10.22', 'Edge on Windows'),
(3, 'Admin', 'Front Office', '2026-07-26 09:00:00', 'Interview Booked', 'Interview Scheduling', 'applicant', 'APP-1041', 'On-site interview booked for 2026-07-28, 09:00 AM.', 'Info', '192.168.10.31', 'Safari on macOS'),
(2, 'Admin', 'Administration / HR', '2026-07-26 09:20:00', 'Interview Booked', 'Interview Scheduling', 'applicant', 'APP-1033', 'Virtual interview booked for 2026-07-28, 01:30 PM.', 'Info', '192.168.10.22', 'Edge on Windows'),
(NULL, 'F&B Director', 'Food & Beverage', '2026-07-26 10:10:00', 'Interview Completed', 'Interview Scheduling', 'applicant', 'APP-1036', 'Cook test completed, solid knife skills and station timing.', 'Info', '192.168.10.2', 'Chrome on Windows'),
(2, 'Admin', 'Administration / HR', '2026-07-26 10:45:00', 'Assessment Started', 'Assessment', 'applicant', 'APP-1036', 'Practical cook test assessment started.', 'Info', '192.168.10.22', 'Edge on Windows'),
(2, 'Admin', 'Administration / HR', '2026-07-26 11:30:00', 'Assessment Accepted', 'Assessment', 'applicant', 'APP-1036', 'Assessment score 82% — advanced to job offer.', 'Info', '192.168.10.22', 'Edge on Windows'),
(NULL, 'F&B Director', 'Food & Beverage', '2026-07-27 14:00:00', 'Assessment Started', 'Assessment', 'applicant', 'APP-1035', 'Mixology practical assessment started.', 'Info', '192.168.10.2', 'Chrome on Windows'),
(NULL, 'F&B Director', 'Food & Beverage', '2026-07-27 15:10:00', 'Assessment Accepted', 'Assessment', 'applicant', 'APP-1035', 'Assessment score 88% — advanced to job offer.', 'Info', '192.168.10.2', 'Chrome on Windows'),
(3, 'Admin', 'Front Office', '2026-07-28 09:05:00', 'Interview Completed', 'Interview Scheduling', 'applicant', 'APP-1041', 'Front office simulation completed successfully.', 'Info', '192.168.10.31', 'Safari on macOS'),
(2, 'Admin', 'Administration / HR', '2026-07-28 13:45:00', 'Interview No-Show', 'Interview Scheduling', 'applicant', 'APP-1033', 'Candidate did not join the virtual meeting room.', 'Warning', '192.168.10.22', 'Edge on Windows'),
(NULL, 'F&B Director', 'Food & Beverage', '2026-07-29 16:30:00', 'Interview Cancelled', 'Interview Scheduling', 'applicant', 'APP-1035', 'Follow-up panel interview cancelled — role already filled.', 'Info', '192.168.10.2', 'Chrome on Windows');

-- announcements
INSERT INTO `announcements` (`published_date`, `title`, `body`, `audience`, `created_by_user_id`, `status`) VALUES
('2026-05-24', 'Job Fair: Hotel & Restaurant Careers Day', 'Walk-in interviews for Front Office, F&B, and Kitchen roles at the Grand Ballroom.', 'All', 1, 'published'),
('2026-05-18', 'TESDA Certification Sponsorship', 'Oxford Suites now sponsors NC II certification for qualified regular employees.', 'All', 1, 'published'),
('2026-05-02', 'Service Excellence Awards 2026', 'Congratulations to Front Office for the highest guest satisfaction score this quarter.', 'All', 1, 'published');

-- system_settings
-- Keys are standardised to the sections the Settings UI reads:
--   company, preferences, security, notifications, interview.schedulable_days
INSERT INTO `system_settings` (`setting_key`, `setting_value`, `updated_by_user_id`) VALUES
('company', '{"name": "Oxford Suites Makati", "email": "info@oxfordsuites.com.ph", "contact": "(02) 8888-0000", "businessHours": "24/7 Front Desk Operations", "address": "Ayala Center, Makati City", "tin": "000-000-000-000", "timezone": "Asia/Manila"}', 1),
('preferences', '{"theme": "Light", "language": "English", "dateFormat": "MM/DD/YYYY", "timeFormat": "12-hour", "timeZone": "Asia/Manila (GMT+8)"}', 1),
('security', '{"twoFactor": true, "sessionTimeout": "30 minutes", "maxLoginAttempts": "3 attempts", "minLength": 8, "requireUppercase": true, "requireLowercase": true, "requireNumber": true, "requireSymbol": true}', 1),
('notifications', '{"Email notifications": true, "Browser notifications": true, "System announcements": true}', 1),
('default_password', '{"password": "Oxford@2026"}', 1),
('recruitment.screening.enabled', '{"value": true}', 1),
('interview.schedulable_days', '["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]', 1);

SET FOREIGN_KEY_CHECKS=1;
