-- Backup taken before deleting positions.position_id = 18
-- (duplicate 'Front Desk Receptionist' in Front Office, POS-018, Staff level, SG-10).
-- Restoring: re-insert the positions row, then set
--   screening_requirement_templates.template_id=1 . position_id = 18;

position_id	position_code	title	department_id	salary_grade_id	requires_assessment	requires_practical	level	headcount	filled_count	created_at	updated_at
18	POS-018	Front Desk Receptionist	1	4	0	0	Staff	2	0	2026-08-24 12:04:50	2026-08-24 12:04:50
template_id	name	position_id	description	active	created_at	updated_at
1	Front Desk Receptionist ? Core Requirements	18	Guest-facing front office essentials the spaCy screening scores against.	1	2026-09-26 11:04:15	2026-09-26 11:04:15
item_id	template_id	entity_type	value	required	created_at
6	1	certification	TESDA Front Office NC II	1	2026-09-26 19:04:15
7	1	education	Bachelor's Degree	1	2026-09-26 19:04:15
8	1	experience	1-2 Years	1	2026-09-26 19:04:15
4	1	skill	Cash Handling	1	2026-09-26 19:04:15
3	1	skill	Check-in / Check-out	1	2026-09-26 19:04:15
1	1	skill	Guest Relations	1	2026-09-26 19:04:15
2	1	skill	Opera PMS	1	2026-09-26 19:04:15
5	1	skill	Reservations	1	2026-09-26 19:04:15
