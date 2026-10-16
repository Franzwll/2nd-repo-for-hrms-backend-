const fs = require('fs');

let sql = fs.readFileSync('database/kalat/update/hotel_hr.sql', 'utf8');

// Normalize to LF first for reliable replacements
const hadCRLF = sql.includes('\r\n');
sql = sql.replace(/\r\n/g, '\n');

// 1. Audit logs url column
const auditLogsSearch = '  `device_info` varchar(255) DEFAULT NULL\n) ENGINE=InnoDB';
const auditLogsReplace = '  `device_info` varchar(255) DEFAULT NULL,\n  `url` varchar(2048) DEFAULT NULL\n) ENGINE=InnoDB';
if (!sql.includes(auditLogsSearch)) {
  console.error('Could not find audit_logs structure to replace');
} else {
  sql = sql.replace(auditLogsSearch, auditLogsReplace);
  console.log('1. audit_logs `url` added');
}

// 2. System roles is_super_admin, is_protected
const systemRolesTableSearch = 'CREATE TABLE `system_roles` (\n  `role_id` bigint(20) UNSIGNED NOT NULL,\n  `role_name` varchar(50) NOT NULL,\n  `description` text DEFAULT NULL,\n  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),';
const systemRolesTableReplace = 'CREATE TABLE `system_roles` (\n  `role_id` bigint(20) UNSIGNED NOT NULL,\n  `role_name` varchar(50) NOT NULL,\n  `description` text DEFAULT NULL,\n  `is_super_admin` tinyint(1) NOT NULL DEFAULT 0,\n  `is_protected` tinyint(1) NOT NULL DEFAULT 0,\n  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),';
if (!sql.includes(systemRolesTableSearch)) {
  console.error('Could not find system_roles structure to replace');
} else {
  sql = sql.replace(systemRolesTableSearch, systemRolesTableReplace);
  console.log('2. system_roles columns added');
}

const systemRolesDataSearch = "INSERT INTO `system_roles` (`role_id`, `role_name`, `description`, `created_at`, `updated_at`) VALUES\n(1, 'Super Admin', 'Full system access across all modules and settings', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),\n(2, 'Admin', 'HR admin: recruitment, onboarding, employee records, ESS approval', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),\n(3, 'Employee', 'Self-service portal access for employees', '2026-08-17 17:41:34', '2026-08-17 17:41:34');";
const systemRolesDataReplace = "INSERT INTO `system_roles` (`role_id`, `role_name`, `description`, `is_super_admin`, `is_protected`, `created_at`, `updated_at`) VALUES\n(1, 'Super Admin', 'Full system access across all modules and settings', 1, 1, '2026-08-17 17:41:34', '2026-08-17 17:41:34'),\n(2, 'Admin', 'HR admin: recruitment, onboarding, employee records, ESS approval', 0, 0, '2026-08-17 17:41:34', '2026-08-17 17:41:34'),\n(3, 'Employee', 'Self-service portal access for employees', 0, 0, '2026-08-17 17:41:34', '2026-08-17 17:41:34');";
if (!sql.includes(systemRolesDataSearch)) {
  console.error('Could not find system_roles data to replace');
} else {
  sql = sql.replace(systemRolesDataSearch, systemRolesDataReplace);
  console.log('2b. system_roles seeded values updated');
}

// 3. New Tables: chatbot_faqs, chatbot_unanswered, social_recognitions, recognition_reactions
const tablesAddition = `
-- --------------------------------------------------------

--
-- Table structure for table \`chatbot_faqs\`
--

CREATE TABLE \`chatbot_faqs\` (
  \`faq_id\` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  \`question\` varchar(255) NOT NULL,
  \`answer\` text NOT NULL,
  \`keywords\` text DEFAULT NULL,
  \`enabled\` tinyint(1) NOT NULL DEFAULT 1,
  \`sort_order\` int(10) UNSIGNED NOT NULL DEFAULT 0,
  \`created_at\` timestamp NOT NULL DEFAULT current_timestamp(),
  \`updated_at\` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (\`faq_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table \`chatbot_unanswered\`
--

CREATE TABLE \`chatbot_unanswered\` (
  \`id\` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  \`session_id\` varchar(80) DEFAULT NULL,
  \`message\` text NOT NULL,
  \`intent\` varchar(40) DEFAULT NULL,
  \`created_at\` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (\`id\`),
  KEY \`idx_chatbot_unanswered_session_id\` (\`session_id\`),
  KEY \`idx_chatbot_unanswered_created_at\` (\`created_at\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table \`social_recognitions\`
--

CREATE TABLE \`social_recognitions\` (
  \`recognition_id\` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  \`sender_employee_id\` bigint(20) UNSIGNED DEFAULT NULL,
  \`recipient_employee_id\` bigint(20) UNSIGNED DEFAULT NULL,
  \`sender_name\` varchar(255) NOT NULL,
  \`recipient_name\` varchar(255) NOT NULL,
  \`sender_role\` varchar(255) DEFAULT NULL,
  \`recipient_role\` varchar(255) DEFAULT NULL,
  \`core_value\` varchar(100) NOT NULL,
  \`message\` text NOT NULL,
  \`clap_count\` int(10) UNSIGNED NOT NULL DEFAULT 0,
  \`heart_count\` int(10) UNSIGNED NOT NULL DEFAULT 0,
  \`star_count\` int(10) UNSIGNED NOT NULL DEFAULT 0,
  \`fire_count\` int(10) UNSIGNED NOT NULL DEFAULT 0,
  \`created_at\` timestamp NOT NULL DEFAULT current_timestamp(),
  \`updated_at\` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (\`recognition_id\`),
  KEY \`idx_social_recognitions_sender_employee_id\` (\`sender_employee_id\`),
  KEY \`idx_social_recognitions_recipient_employee_id\` (\`recipient_employee_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table \`social_recognitions\`
--

INSERT INTO \`social_recognitions\` (\`recognition_id\`, \`sender_employee_id\`, \`recipient_employee_id\`, \`sender_name\`, \`recipient_name\`, \`sender_role\`, \`recipient_role\`, \`core_value\`, \`message\`, \`clap_count\`, \`heart_count\`, \`star_count\`, \`fire_count\`, \`created_at\`, \`updated_at\`) VALUES
(1, NULL, 5, 'Chef Marco Rossi', 'Kevin Dela Cruz', 'Executive Chef · F&B', 'Line Cook · Kitchen / Culinary', 'Teamwork & Malasakit', 'Stepped up during the 200-guest executive banquet dinner rush and ensured flawless plating and zero delays!', 14, 8, 6, 5, '2026-08-21 09:30:00', '2026-08-21 09:30:00'),
(2, 3, 2, 'Paolo Cruz', 'Maria Santos', 'Payroll & HR Specialist · Administration / HR', 'Guest Relations Officer · Front Office', 'Guest Delight', 'Received a glowing 5-star TripAdvisor review from our corporate VIP praising your warmth, attentiveness, and swift check-in!', 19, 12, 10, 4, '2026-08-20 14:15:00', '2026-08-20 14:15:00'),
(3, 5, NULL, 'Kevin Dela Cruz', 'Chef Marco Rossi', 'Line Cook · Kitchen / Culinary', 'Executive Chef · F&B', 'Going the Extra Mile', 'Thank you for mentoring the team through the new seasonal tasting menu prep and always looking out for kitchen crew welfare!', 11, 7, 5, 2, '2026-08-19 17:00:00', '2026-08-19 17:00:00'),
(4, NULL, 7, 'Elena Torres', 'Ricardo Gomez', 'Housekeeping Supervisor · Housekeeping', 'Housekeeping Attendant · Housekeeping', 'Operational Excellence', 'Maintained a 100% spotless inspection pass rate across all 30 deluxe executive suites on Floor 8 with zero guest callbacks.', 9, 5, 8, 3, '2026-08-18 11:20:00', '2026-08-18 11:20:00');

-- --------------------------------------------------------

--
-- Table structure for table \`recognition_reactions\`
--

CREATE TABLE \`recognition_reactions\` (
  \`reaction_id\` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  \`recognition_id\` bigint(20) UNSIGNED NOT NULL,
  \`employee_id\` bigint(20) UNSIGNED DEFAULT NULL,
  \`reaction_type\` varchar(50) NOT NULL,
  \`created_at\` timestamp NOT NULL DEFAULT current_timestamp(),
  \`updated_at\` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (\`reaction_id\`),
  UNIQUE KEY \`rec_emp_react_unique\` (\`recognition_id\`, \`employee_id\`, \`reaction_type\`),
  KEY \`idx_recognition_reactions_employee_id\` (\`employee_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table \`recognition_reactions\`
--

INSERT INTO \`recognition_reactions\` (\`reaction_id\`, \`recognition_id\`, \`employee_id\`, \`reaction_type\`, \`created_at\`, \`updated_at\`) VALUES
(1, 1, 1, 'clap', '2026-08-21 10:00:00', '2026-08-21 10:00:00'),
(2, 1, 1, 'star', '2026-08-21 10:00:00', '2026-08-21 10:00:00'),
(3, 2, 1, 'heart', '2026-08-20 15:00:00', '2026-08-20 15:00:00'),
(4, 4, 1, 'fire', '2026-08-18 12:00:00', '2026-08-18 12:00:00');

`;

const indexesComment = '--\n-- Indexes for dumped tables\n--';
if (!sql.includes(indexesComment)) {
  console.error('Could not find Indexes header');
} else {
  sql = sql.replace(indexesComment, tablesAddition + indexesComment);
  console.log('3. New tables and data added');
}

// 4. Foreign key constraints at the end of the dump
const fkAddition = `
--
-- Constraints for table \`social_recognitions\`
--
ALTER TABLE \`social_recognitions\`
  ADD CONSTRAINT \`fk_social_recognitions_sender_employee_id\` FOREIGN KEY (\`sender_employee_id\`) REFERENCES \`employees\` (\`employee_id\`) ON DELETE SET NULL,
  ADD CONSTRAINT \`fk_social_recognitions_recipient_employee_id\` FOREIGN KEY (\`recipient_employee_id\`) REFERENCES \`employees\` (\`employee_id\`) ON DELETE SET NULL;

--
-- Constraints for table \`recognition_reactions\`
--
ALTER TABLE \`recognition_reactions\`
  ADD CONSTRAINT \`fk_recognition_reactions_recognition_id\` FOREIGN KEY (\`recognition_id\`) REFERENCES \`social_recognitions\` (\`recognition_id\`) ON DELETE CASCADE,
  ADD CONSTRAINT \`fk_recognition_reactions_employee_id\` FOREIGN KEY (\`employee_id\`) REFERENCES \`employees\` (\`employee_id\`) ON DELETE CASCADE;
`;

const commitComment = 'COMMIT;\n\n/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */';
if (!sql.includes(commitComment)) {
  console.error('Could not find COMMIT section');
} else {
  sql = sql.replace(commitComment, fkAddition + commitComment);
  console.log('4. Foreign keys added');
}

// Convert back to CRLF if originally CRLF
if (hadCRLF) {
  sql = sql.replace(/\n/g, '\r\n');
}

// Save updated hotel_hr.sql
fs.writeFileSync('database/kalat/update/hotel_hr.sql', sql, 'utf8');

// Also write an updated full schema/seed export in database/
fs.writeFileSync('database/hotel_hr_latest_export.sql', sql, 'utf8');

console.log('All updates successfully applied!');
