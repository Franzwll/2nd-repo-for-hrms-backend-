const fs = require('fs');
const path = 'database/hotel_hr_merged(latest).sql';
let sql = fs.readFileSync(path, 'utf8');

// Add DROP TABLE IF EXISTS before each CREATE TABLE
sql = sql.replace(/CREATE TABLE (?:IF NOT EXISTS )?(`[a-zA-Z0-9_]+`)/g, 'DROP TABLE IF EXISTS $1;\nCREATE TABLE $1');

fs.writeFileSync(path, sql, 'utf8');
console.log('Successfully updated SQL file with DROP TABLE IF EXISTS statements!');
