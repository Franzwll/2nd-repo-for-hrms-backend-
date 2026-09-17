const fs = require('fs');

let seedSql = fs.readFileSync('backend-laravel/database/seeders/data/hotel_hr_seed_mysql.sql', 'utf8');

const hadCRLF = seedSql.includes('\r\n');
seedSql = seedSql.replace(/\r\n/g, '\n');

// 1. Check if social_recognitions is already in seedSql
if (!seedSql.includes('INSERT INTO `social_recognitions`')) {
  const recognitionSeed = `
-- social_recognitions
INSERT INTO \`social_recognitions\` (\`recognition_id\`, \`sender_employee_id\`, \`recipient_employee_id\`, \`sender_name\`, \`recipient_name\`, \`sender_role\`, \`recipient_role\`, \`core_value\`, \`message\`, \`clap_count\`, \`heart_count\`, \`star_count\`, \`fire_count\`, \`created_at\`, \`updated_at\`) VALUES
(1, NULL, 5, 'Chef Marco Rossi', 'Kevin Dela Cruz', 'Executive Chef · F&B', 'Line Cook · Kitchen / Culinary', 'Teamwork & Malasakit', 'Stepped up during the 200-guest executive banquet dinner rush and ensured flawless plating and zero delays!', 14, 8, 6, 5, '2026-08-21 09:30:00', '2026-08-21 09:30:00'),
(2, 3, 2, 'Paolo Cruz', 'Maria Santos', 'Payroll & HR Specialist · Administration / HR', 'Guest Relations Officer · Front Office', 'Guest Delight', 'Received a glowing 5-star TripAdvisor review from our corporate VIP praising your warmth, attentiveness, and swift check-in!', 19, 12, 10, 4, '2026-08-20 14:15:00', '2026-08-20 14:15:00'),
(3, 5, NULL, 'Kevin Dela Cruz', 'Chef Marco Rossi', 'Line Cook · Kitchen / Culinary', 'Executive Chef · F&B', 'Going the Extra Mile', 'Thank you for mentoring the team through the new seasonal tasting menu prep and always looking out for kitchen crew welfare!', 11, 7, 5, 2, '2026-08-19 17:00:00', '2026-08-19 17:00:00'),
(4, NULL, 7, 'Elena Torres', 'Ricardo Gomez', 'Housekeeping Supervisor · Housekeeping', 'Housekeeping Attendant · Housekeeping', 'Operational Excellence', 'Maintained a 100% spotless inspection pass rate across all 30 deluxe executive suites on Floor 8 with zero guest callbacks.', 9, 5, 8, 3, '2026-08-18 11:20:00', '2026-08-18 11:20:00');

-- recognition_reactions
INSERT INTO \`recognition_reactions\` (\`reaction_id\`, \`recognition_id\`, \`employee_id\`, \`reaction_type\`, \`created_at\`, \`updated_at\`) VALUES
(1, 1, 1, 'clap', '2026-08-21 10:00:00', '2026-08-21 10:00:00'),
(2, 1, 1, 'star', '2026-08-21 10:00:00', '2026-08-21 10:00:00'),
(3, 2, 1, 'heart', '2026-08-20 15:00:00', '2026-08-20 15:00:00'),
(4, 4, 1, 'fire', '2026-08-18 12:00:00', '2026-08-18 12:00:00');
`;

  // Insert before announcements
  const announcementsComment = '-- announcements';
  if (seedSql.includes(announcementsComment)) {
    seedSql = seedSql.replace(announcementsComment, recognitionSeed + '\n' + announcementsComment);
    console.log('Added social_recognitions seed data');
  } else {
    console.error('Could not find announcements section in seed file');
  }
}

if (hadCRLF) {
  seedSql = seedSql.replace(/\n/g, '\r\n');
}

fs.writeFileSync('backend-laravel/database/seeders/data/hotel_hr_seed_mysql.sql', seedSql, 'utf8');
console.log('hotel_hr_seed_mysql.sql updated successfully!');
