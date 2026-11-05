# hotel_hr â€” Old schema (31 Oct 2026 dump) vs current database

> Generated: 2026-11-04 02:52 from `hotel_hr (oct 31).sql` (989444 bytes) and the live `hotel_hr` MySQL database.
> Consolidation history and per-step details: `docs/DATABASE_CONSOLIDATION_PLAN.md`.

## 1. Summary

| Metric | Old â€” `hotel_hr (oct 31).sql` | Current â€” live `hotel_hr` |
|---|---|---|
| Tables | 71 | 46 |
| Old tables still present | 42 | 42 |
| Old tables removed | â€” | 29 (merged or dropped) |
| New tables added | â€” | 4 |

The old dump has **71** tables; the live database now has **46**.
## 2. Removed old tables and where their data went (29)

| Old table | Outcome |
|---|---|
| `applicant_assessments` | Merged into applicant_evaluations (Phase 2e), eval_type = interview_assessment. |
| `applicant_block_history` | Merged into audit_logs (Phase 2c). |
| `applicant_screening_entities` | Inlined into applicant_screenings.entities_json (Phase 3a). |
| `applicant_screening_scores` | Inlined into applicant_screenings.score_breakdown_json (Phase 3a). |
| `assessment_invites` | Merged into applicant_evaluations (Phase 2e), eval_type = assessment_invite. |
| `assessment_tests` | Merged into applicant_evaluations (Phase 2e), eval_type = assessment_test. |
| `cache` | Dropped; cache moved to the file driver, CACHE_STORE=file (Phase 4c). |
| `cache_locks` | Dropped; cache locks moved to the file driver (Phase 4c). |
| `chatbot_unanswered` | Merged into chatbot_messages (Phase 2b) with source = unanswered. |
| `document_code_sequences` | Merged into code_sequences (Phase 2a) as seq_key = document_code. |
| `employee_code_sequences` | Merged into code_sequences (Phase 2a) as seq_key = employee_code. |
| `employee_emergency_contacts` | Inlined into employees.emergency_contacts_json (Phase 3i). |
| `employee_exit_records` | Inlined as columns on employees (exit_type, exit_date, clearance_status, coe_status, exit_notes) (Phase 3g). |
| `employee_learning_attempts` | Inlined into employee_learning.attempts_json (Phase 3f). |
| `ess_request_attachments` | Merged into ess_request_events (Phase 2d), event_type = attachment. |
| `ess_request_routings` | Merged into ess_request_events (Phase 2d), event_type = routing. |
| `ess_request_status_histories` | Merged into ess_request_events (Phase 2d), event_type = status. |
| `facilities` | Moved to system_settings key interview.facilities (Phase 4b). |
| `final_evaluations` | Merged into applicant_evaluations (Phase 2e), eval_type = final_evaluation. |
| `job_post_platforms` | Inlined into job_posts.platforms_json (Phase 3d). |
| `onboarding_checklist_items` | Inlined into onboarding_checklist_templates.items_json (Phase 4a). |
| `password_reset_tokens` | Dropped in Phase 1 (unused; reset tokens live in the cache). |
| `payroll_items` | Inlined into payroll_records.items_json (Phase 3c). |
| `payroll_periods` | Inlined into payroll_records (period_code, period_name) (Phase 3b). |
| `practical_tests` | Merged into applicant_evaluations (Phase 2e), eval_type = practical_test. |
| `recognition_reactions` | Inlined into social_recognitions.reactions_json (Phase 3e). |
| `screening_requirement_template_items` | Inlined into screening_requirement_templates.items_json (Phase 3h). |
| `sessions` | Dropped; sessions moved to the file driver, SESSION_DRIVER=file (Phase 4c). |
| `user_login_activity` | Merged into audit_logs (Phase 2c). |


## 3. New tables (4)

| New table | Purpose |
|---|---|
| `applicant_evaluations` | Unified evaluation table: interview assessment, assessment test, practical test, final evaluation, assessment invite (Phase 2e). |
| `code_sequences` | Code sequence generator merged from employee_code_sequences + document_code_sequences (Phase 2a). |
| `ess_requests` | â€” |
| `ess_request_events` | Unified ESS routing / status / attachment event log (Phase 2d). |


## 4. Column-level changes on tables kept in both schemas

Only column names are compared (type-only changes are not listed).

| Table | Added columns | Removed columns |
|---|---|---|
| `announcements` | `announcement_id` bigint(20) unsigned<br>`published_date` date<br>`title` varchar(200)<br>`body` text<br>`audience` varchar(20)<br>`created_by_user_id` bigint(20) unsigned<br>`status` varchar(20)<br>`created_at` timestamp<br>`updated_at` timestamp | â€” |
| `applicants` | `applicant_id` bigint(20) unsigned<br>`applicant_code` varchar(40)<br>`job_post_id` bigint(20) unsigned<br>`name` varchar(160)<br>`email` varchar(190)<br>`phone` varchar(40)<br>`address` text<br>`applied_at` timestamp<br>`fit_score` decimal(5,2)<br>`status` varchar(30)<br>`stage` varchar(40)<br>`rejected_at` timestamp<br>`cooldown_lifted_at` timestamp<br>`offer_status` varchar(20)<br>`offer_sent_at` timestamp<br>`offer_expires_at` timestamp<br>`offer_start_date` date<br>`offer_response_channel` varchar(20)<br>`offer_response_note` text<br>`offer_responded_at` timestamp<br>`offer_response_recorded_by` varchar(150)<br>`source` varchar(60)<br>`resume_file_path` text<br>`resume_original_name` varchar(255)<br>`resume_hash` char(64)<br>`summary` text<br>`flags_json` longtext<br>`created_at` timestamp<br>`updated_at` timestamp<br>`archived_at` timestamp<br>`archived_by` varchar(160)<br>`archived_reason` text<br>`is_blocked` tinyint(1)<br>`blocked_at` timestamp<br>`blocked_by` varchar(160)<br>`blocked_reason` text<br>`block_scope` varchar(100)<br>`block_expires_at` timestamp | â€” |
| `applicant_documents` | `applicant_document_id` bigint(20) unsigned<br>`applicant_id` bigint(20) unsigned<br>`doc_type` varchar(30)<br>`title` varchar(190)<br>`original_copy` tinyint(1)<br>`file_path` text<br>`original_name` varchar(255)<br>`verification_status` varchar(30)<br>`verification_result_json` longtext<br>`extracted_profile_json` longtext<br>`verified_at` timestamp<br>`uploaded_at` timestamp<br>`created_at` timestamp<br>`updated_at` timestamp | â€” |
| `applicant_screenings` | `screening_id` bigint(20) unsigned<br>`applicant_id` bigint(20) unsigned<br>`job_post_id` bigint(20) unsigned<br>`processing_status` varchar(30)<br>`screening_result` varchar(30)<br>`match_score` decimal(5,2)<br>`resume_match_score` decimal(5,2)<br>`score_breakdown_json` longtext<br>`profile_json` longtext<br>`entities_json` longtext<br>`missing_information_json` longtext<br>`validation_json` longtext<br>`alternative_job_json` longtext<br>`document_verification_json` longtext<br>`reasons_json` longtext<br>`model_info_json` longtext<br>`error_message` text<br>`processed_at` timestamp<br>`created_at` timestamp<br>`updated_at` timestamp | â€” |
| `attendance_records` | `attendance_id` bigint(20) unsigned<br>`employee_id` bigint(20) unsigned<br>`work_date` date<br>`time_in` timestamp<br>`time_out` timestamp<br>`break_in` timestamp<br>`break_out` timestamp<br>`hours_worked` decimal(7,2)<br>`late_minutes` int(11)<br>`undertime_minutes` int(11)<br>`overtime_hours` decimal(7,2)<br>`remark` varchar(255)<br>`status` varchar(30)<br>`created_at` timestamp<br>`updated_at` timestamp | â€” |
| `audit_logs` | `audit_log_id` bigint(20) unsigned<br>`system_user_id` bigint(20) unsigned<br>`actor_role` varchar(50)<br>`actor_department` varchar(120)<br>`occurred_at` timestamp<br>`action` varchar(255)<br>`module_name` varchar(100)<br>`target_type` varchar(100)<br>`target_id` varchar(100)<br>`details` text<br>`severity` varchar(20)<br>`ip_address` varchar(45)<br>`device_info` varchar(255)<br>`user_agent` text<br>`status` varchar(20)<br>`extra_json` longtext<br>`url` varchar(2048) | â€” |
| `chatbot_faqs` | `faq_id` bigint(20) unsigned<br>`question` varchar(255)<br>`answer` text<br>`keywords` text<br>`enabled` tinyint(1)<br>`sort_order` int(10) unsigned<br>`created_at` timestamp<br>`updated_at` timestamp | â€” |
| `chatbot_messages` | `id` bigint(20) unsigned<br>`session_id` varchar(80)<br>`user_id` bigint(20) unsigned<br>`role` varchar(20)<br>`message` text<br>`reply` text<br>`source` varchar(20)<br>`intent` varchar(40)<br>`faq_ids` text<br>`had_faq_context` tinyint(1)<br>`feedback` tinyint(4)<br>`prompt_tokens` int(10) unsigned<br>`completion_tokens` int(10) unsigned<br>`created_at` timestamp<br>`updated_at` timestamp | â€” |
| `checklist_requests` | `checklist_request_id` bigint(20) unsigned<br>`request_code` varchar(40)<br>`employee_id` bigint(20) unsigned<br>`template_id` bigint(20) unsigned<br>`phase` varchar(30)<br>`items_json` longtext<br>`status` varchar(30)<br>`requested_by_user_id` bigint(20) unsigned<br>`requested_at` date<br>`created_at` timestamp<br>`updated_at` timestamp | â€” |
| `departments` | `department_id` bigint(20) unsigned<br>`code` varchar(30)<br>`name` varchar(120)<br>`description` text<br>`head_employee_id` bigint(20) unsigned<br>`budget` decimal(14,2)<br>`created_at` timestamp<br>`updated_at` timestamp | â€” |
| `employees` | `employee_id` bigint(20) unsigned<br>`employee_code` varchar(40)<br>`first_name` varchar(80)<br>`middle_name` varchar(80)<br>`last_name` varchar(80)<br>`email` varchar(190)<br>`personal_email` varchar(190)<br>`phone` varchar(40)<br>`address` text<br>`birth_date` date<br>`gender` varchar(20)<br>`civil_status` varchar(20)<br>`nationality` varchar(60)<br>`sss_number` varchar(30)<br>`philhealth_number` varchar(30)<br>`pagibig_number` varchar(30)<br>`tin_number` varchar(30)<br>`position_id` bigint(20) unsigned<br>`department_id` bigint(20) unsigned<br>`employment_type` varchar(30)<br>`date_hired` date<br>`supervisor_employee_id` bigint(20) unsigned<br>`status` varchar(30)<br>`onboarding_complete` tinyint(1)<br>`salary_grade_id` bigint(20) unsigned<br>`employee_record_last_updated_at` date<br>`salary_step` varchar(30)<br>`exit_type` varchar(30)<br>`exit_date` date<br>`clearance_status` varchar(20)<br>`coe_status` varchar(20)<br>`exit_notes` text<br>`emergency_contacts_json` longtext<br>`created_at` timestamp<br>`updated_at` timestamp<br>`deleted_at` timestamp | â€” |
| `employee_benefits` | `employee_benefit_id` bigint(20) unsigned<br>`employee_id` bigint(20) unsigned<br>`benefit_name` varchar(100)<br>`reference_value` varchar(190)<br>`note` text<br>`effective_date` date<br>`end_date` date<br>`status` varchar(30)<br>`created_at` timestamp<br>`updated_at` timestamp | â€” |
| `employee_documents` | `document_id` bigint(20) unsigned<br>`employee_id` bigint(20) unsigned<br>`document_code` varchar(50)<br>`title` varchar(200)<br>`category` varchar(80)<br>`source_type` varchar(30)<br>`source_id` bigint(20) unsigned<br>`original_name` varchar(255)<br>`source_hash` varchar(128)<br>`file_path` text<br>`mime_type` varchar(100)<br>`file_size_bytes` bigint(20) unsigned<br>`document_status` varchar(30)<br>`document_date` date<br>`expiry_date` date<br>`last_updated_at` timestamp<br>`created_at` timestamp<br>`updated_at` timestamp<br>`deleted_at` timestamp | â€” |
| `employee_learning` | `employee_learning_id` bigint(20) unsigned<br>`employee_id` bigint(20) unsigned<br>`course_id` bigint(20) unsigned<br>`status` varchar(30)<br>`score` decimal(5,2)<br>`assigned_date` date<br>`completed_date` date<br>`completion_source` varchar(20)<br>`reading_completed_at` timestamp<br>`attempts_json` longtext<br>`created_at` timestamp<br>`updated_at` timestamp | â€” |
| `employee_onboarding_items` | `employee_onboarding_item_id` bigint(20) unsigned<br>`employee_id` bigint(20) unsigned<br>`new_hire_id` bigint(20) unsigned<br>`template_item_id` bigint(20) unsigned<br>`item_text` text<br>`file_path` varchar(500)<br>`file_name` varchar(255)<br>`notes` text<br>`done` tinyint(1)<br>`submitted_at` timestamp<br>`completed_at` timestamp<br>`completed_by_user_id` bigint(20) unsigned<br>`created_at` timestamp<br>`updated_at` timestamp<br>`review_note` text<br>`returned_count` int(10) unsigned | â€” |
| `employee_position_history` | `position_history_id` bigint(20) unsigned<br>`employee_id` bigint(20) unsigned<br>`effective_date` date<br>`change_type` varchar(30)<br>`old_position_id` bigint(20) unsigned<br>`new_position_id` bigint(20) unsigned<br>`old_salary_grade_id` bigint(20) unsigned<br>`new_salary_grade_id` bigint(20) unsigned<br>`notes` text<br>`created_at` timestamp | â€” |
| `ess_categories` | `ess_category_id` bigint(20) unsigned<br>`code` varchar(40)<br>`name` varchar(120)<br>`description` text<br>`is_open` tinyint(1)<br>`requires_fulfillment` tinyint(1)<br>`default_module` varchar(40)<br>`requires_module_ack` tinyint(1)<br>`sla_hours` int(10) unsigned<br>`sort_order` int(11)<br>`created_at` timestamp<br>`updated_at` timestamp | â€” |
| `hr3_recommendations` | `recommendation_id` bigint(20) unsigned<br>`employee_id` bigint(20) unsigned<br>`promotion_request_id` bigint(20) unsigned<br>`recommendation_type` varchar(40)<br>`evaluation_score` decimal(5,2)<br>`evaluator_user_id` bigint(20) unsigned<br>`date_submitted` date<br>`status` varchar(40)<br>`suggested_position_id` bigint(20) unsigned<br>`suggested_salary_grade_id` bigint(20) unsigned<br>`current_employment_type` varchar(30)<br>`comments` text<br>`created_at` timestamp<br>`updated_at` timestamp | â€” |
| `interviews` | `interview_id` bigint(20) unsigned<br>`interview_code` varchar(40)<br>`applicant_id` bigint(20) unsigned<br>`scheduled_date` date<br>`scheduled_time` time<br>`scheduled_end_time` time<br>`mode` varchar(20)<br>`facility_id` bigint(20) unsigned<br>`facility_status` varchar(40)<br>`interviewer_employee_id` bigint(20) unsigned<br>`interviewer_name` varchar(160)<br>`zoom_meeting_id` varchar(64)<br>`zoom_join_url` text<br>`zoom_continue_url` text<br>`zoom_password` varchar(64)<br>`status` varchar(20)<br>`interview_notes` text<br>`created_at` timestamp<br>`updated_at` timestamp | â€” |
| `job_posts` | `job_post_id` bigint(20) unsigned<br>`slug` varchar(120)<br>`title` varchar(150)<br>`department_id` bigint(20) unsigned<br>`position_id` bigint(20) unsigned<br>`employment_type` varchar(30)<br>`schedule` varchar(120)<br>`salary_min` decimal(12,2)<br>`salary_max` decimal(12,2)<br>`vacancies` int(11)<br>`filled_count` int(11)<br>`posted_date` date<br>`status` varchar(20)<br>`requires_practical` tinyint(1)<br>`requires_assessment` tinyint(1)<br>`active` tinyint(1)<br>`experience_level` varchar(50)<br>`experience_levels` longtext<br>`education_level` varchar(100)<br>`education_levels` longtext<br>`summary` text<br>`description` text<br>`responsibilities_json` longtext<br>`qualifications_json` longtext<br>`skills_json` longtext<br>`additional_json` longtext<br>`instructions` text<br>`about` text<br>`picture` varchar(255)<br>`blocks_json` longtext<br>`platforms_json` longtext<br>`created_at` timestamp<br>`updated_at` timestamp<br>`deleted_at` timestamp | â€” |
| `learning_courses` | `course_id` bigint(20) unsigned<br>`course_code` varchar(40)<br>`title` varchar(200)<br>`category` varchar(120)<br>`description` text<br>`content_text` longtext<br>`material_path` varchar(255)<br>`quiz_json` longtext<br>`quiz_generated_at` timestamp<br>`estimated_reading_minutes` smallint(5) unsigned<br>`estimated_pages` smallint(5) unsigned<br>`mandatory` tinyint(1)<br>`created_at` timestamp<br>`updated_at` timestamp | â€” |
| `leave_balances` | `leave_balance_id` bigint(20) unsigned<br>`employee_id` bigint(20) unsigned<br>`leave_type` varchar(80)<br>`period_year` smallint(6)<br>`total_days` decimal(6,2)<br>`used_days` decimal(6,2)<br>`created_at` timestamp<br>`updated_at` timestamp | â€” |
| `migrations` | `id` int(10) unsigned<br>`migration` varchar(255)<br>`batch` int(11) | â€” |
| `new_hires` | `new_hire_id` bigint(20) unsigned<br>`new_hire_code` varchar(40)<br>`applicant_id` bigint(20) unsigned<br>`employee_id` bigint(20) unsigned<br>`name` varchar(160)<br>`email` varchar(190)<br>`phone` varchar(40)<br>`position_id` bigint(20) unsigned<br>`department_id` bigint(20) unsigned<br>`stage` varchar(30)<br>`start_date` date<br>`evaluation_requested_at` timestamp<br>`completed_at` timestamp<br>`created_at` timestamp<br>`updated_at` timestamp | â€” |
| `notifications` | `notification_id` bigint(20) unsigned<br>`system_user_id` bigint(20) unsigned<br>`type` varchar(50)<br>`title` varchar(200)<br>`body` text<br>`module_name` varchar(100)<br>`target_type` varchar(100)<br>`target_id` varchar(100)<br>`is_read` tinyint(1)<br>`read_at` timestamp<br>`created_at` timestamp | â€” |
| `onboarding_checklist_templates` | `template_id` bigint(20) unsigned<br>`template_code` varchar(40)<br>`title` varchar(200)<br>`phase` varchar(30)<br>`position_scope_json` longtext<br>`status` varchar(20)<br>`items_json` longtext<br>`created_at` timestamp<br>`updated_at` timestamp | â€” |
| `payroll_records` | `payroll_record_id` bigint(20) unsigned<br>`employee_id` bigint(20) unsigned<br>`payroll_period_id` bigint(20) unsigned<br>`period_code` varchar(40)<br>`period_name` varchar(120)<br>`pay_period_start` date<br>`pay_period_end` date<br>`payout_date` date<br>`gross_pay` decimal(12,2)<br>`net_pay` decimal(12,2)<br>`items_json` longtext<br>`status` varchar(30)<br>`created_at` timestamp<br>`updated_at` timestamp | â€” |
| `performance_reviews` | `performance_review_id` bigint(20) unsigned<br>`employee_id` bigint(20) unsigned<br>`review_period` varchar(80)<br>`review_date` date<br>`competency_level` varchar(50)<br>`overall_rating` decimal(5,2)<br>`salary_grade_id` bigint(20) unsigned<br>`salary_step` varchar(30)<br>`evaluator_user_id` bigint(20) unsigned<br>`comments` text<br>`created_at` timestamp<br>`updated_at` timestamp | â€” |
| `personal_access_tokens` | `id` bigint(20) unsigned<br>`tokenable_type` varchar(255)<br>`tokenable_id` bigint(20) unsigned<br>`name` text<br>`token` varchar(64)<br>`abilities` text<br>`last_used_at` timestamp<br>`expires_at` timestamp<br>`created_at` timestamp<br>`updated_at` timestamp | â€” |
| `positions` | `position_id` bigint(20) unsigned<br>`position_code` varchar(30)<br>`title` varchar(150)<br>`department_id` bigint(20) unsigned<br>`salary_grade_id` bigint(20) unsigned<br>`requires_assessment` tinyint(1)<br>`requires_practical` tinyint(1)<br>`level` varchar(30)<br>`headcount` int(11)<br>`filled_count` int(11)<br>`created_at` timestamp<br>`updated_at` timestamp | â€” |
| `promotion_requests` | `promotion_request_id` bigint(20) unsigned<br>`employee_id` bigint(20) unsigned<br>`ess_request_id` bigint(20) unsigned<br>`current_position_id` bigint(20) unsigned<br>`requested_position_id` bigint(20) unsigned<br>`requested_salary_grade_id` bigint(20) unsigned<br>`hr3_recommendation_id` bigint(20) unsigned<br>`justification` text<br>`status` varchar(30)<br>`reviewed_by` bigint(20) unsigned<br>`forwarded_to_hr3_by` bigint(20) unsigned<br>`forwarded_to_hr3_at` timestamp<br>`reviewed_at` timestamp<br>`review_notes` text<br>`created_at` timestamp<br>`updated_at` timestamp | â€” |
| `requisitions` | `requisition_id` bigint(20) unsigned<br>`requisition_code` varchar(40)<br>`position_id` bigint(20) unsigned<br>`position_title` varchar(150)<br>`department_id` bigint(20) unsigned<br>`requested_by_user_id` bigint(20) unsigned<br>`requested_count` int(11)<br>`urgency` varchar(20)<br>`justification` text<br>`status` varchar(20)<br>`requested_at` date<br>`converted_job_post_id` bigint(20) unsigned<br>`created_at` timestamp<br>`updated_at` timestamp | â€” |
| `role_permissions` | `role_permission_id` bigint(20) unsigned<br>`role_id` bigint(20) unsigned<br>`module_name` varchar(100)<br>`permission_level` varchar(40)<br>`created_at` timestamp<br>`updated_at` timestamp | â€” |
| `salary_grades` | `salary_grade_id` bigint(20) unsigned<br>`code` varchar(30)<br>`title` varchar(120)<br>`min_salary` decimal(12,2)<br>`max_salary` decimal(12,2)<br>`currency_code` char(3)<br>`level` varchar(30)<br>`notes` text<br>`created_at` timestamp<br>`updated_at` timestamp | â€” |
| `screening_ground_truths` | `gt_id` bigint(20) unsigned<br>`applicant_id` bigint(20) unsigned<br>`job_post_id` bigint(20) unsigned<br>`true_screening_result` varchar(30)<br>`true_qualification_score` decimal(5,2)<br>`true_missing_information_json` longtext<br>`true_unrecognized_skills_json` longtext<br>`notes` text<br>`created_at` timestamp<br>`updated_at` timestamp | â€” |
| `screening_reference_data` | `ref_id` bigint(20) unsigned<br>`data_type` varchar(20)<br>`canonical_value` varchar(150)<br>`aliases_json` longtext<br>`active` tinyint(1)<br>`created_at` timestamp<br>`updated_at` timestamp | â€” |
| `screening_requirement_templates` | `template_id` bigint(20) unsigned<br>`name` varchar(150)<br>`position_id` bigint(20) unsigned<br>`description` varchar(500)<br>`active` tinyint(1)<br>`items_json` longtext<br>`created_at` timestamp<br>`updated_at` timestamp | â€” |
| `social_recognitions` | `recognition_id` bigint(20) unsigned<br>`sender_employee_id` bigint(20) unsigned<br>`recipient_employee_id` bigint(20) unsigned<br>`sender_name` varchar(255)<br>`recipient_name` varchar(255)<br>`sender_role` varchar(255)<br>`recipient_role` varchar(255)<br>`core_value` varchar(100)<br>`message` text<br>`clap_count` int(10) unsigned<br>`heart_count` int(10) unsigned<br>`star_count` int(10) unsigned<br>`fire_count` int(10) unsigned<br>`reactions_json` longtext<br>`created_at` timestamp<br>`updated_at` timestamp | â€” |
| `system_roles` | `role_id` bigint(20) unsigned<br>`role_name` varchar(50)<br>`description` text<br>`is_super_admin` tinyint(1)<br>`is_protected` tinyint(1)<br>`created_at` timestamp<br>`updated_at` timestamp | â€” |
| `system_settings` | `setting_id` bigint(20) unsigned<br>`setting_key` varchar(120)<br>`setting_value` longtext<br>`updated_by_user_id` bigint(20) unsigned<br>`created_at` timestamp<br>`updated_at` timestamp | â€” |
| `system_users` | `system_user_id` bigint(20) unsigned<br>`username` varchar(100)<br>`email` varchar(190)<br>`password_hash` varchar(255)<br>`full_name` varchar(160)<br>`department_name` varchar(120)<br>`employee_id` bigint(20) unsigned<br>`role_id` bigint(20) unsigned<br>`status` varchar(20)<br>`otp_enabled` tinyint(1)<br>`mfa_method` varchar(20)<br>`totp_secret` text<br>`totp_confirmed_at` timestamp<br>`mfa_recovery_codes` longtext<br>`failed_attempts` tinyint(3) unsigned<br>`locked_until` timestamp<br>`last_login_at` timestamp<br>`last_login_ip` varchar(45)<br>`created_at` timestamp<br>`updated_at` timestamp | â€” |
| `work_schedules` | `work_schedule_id` bigint(20) unsigned<br>`employee_id` bigint(20) unsigned<br>`day_of_week` smallint(6)<br>`shift_name` varchar(80)<br>`start_time` time<br>`end_time` time<br>`location` varchar(120)<br>`is_rest_day` tinyint(1)<br>`effective_from` date<br>`effective_to` date<br>`created_at` timestamp<br>`updated_at` timestamp | â€” |


## 5. Current schema â€” live `hotel_hr` (46 tables)

Row counts are live at generation time. `PK` = primary key, `UNIQUE` = unique indexes.

### `announcements` â€” 9 columns Â· 3 rows
PK: `announcement_id`
Columns: `announcement_id` bigint(20) unsigned, `published_date` date, `title` varchar(200), `body` text, `audience` varchar(20), `created_by_user_id` bigint(20) unsigned, `status` varchar(20), `created_at` timestamp, `updated_at` timestamp

### `applicants` â€” 38 columns Â· 13 rows
PK: `applicant_id` Â· UNIQUE: applicants_applicant_code_unique (applicant_code)
Columns: `applicant_id` bigint(20) unsigned, `applicant_code` varchar(40), `job_post_id` bigint(20) unsigned, `name` varchar(160), `email` varchar(190), `phone` varchar(40), `address` text, `applied_at` timestamp, `fit_score` decimal(5,2), `status` varchar(30), `stage` varchar(40), `rejected_at` timestamp, `cooldown_lifted_at` timestamp, `offer_status` varchar(20), `offer_sent_at` timestamp, `offer_expires_at` timestamp, `offer_start_date` date, `offer_response_channel` varchar(20), `offer_response_note` text, `offer_responded_at` timestamp, `offer_response_recorded_by` varchar(150), `source` varchar(60), `resume_file_path` text, `resume_original_name` varchar(255), `resume_hash` char(64), `summary` text, `flags_json` longtext, `created_at` timestamp, `updated_at` timestamp, `archived_at` timestamp, `archived_by` varchar(160), `archived_reason` text, `is_blocked` tinyint(1), `blocked_at` timestamp, `blocked_by` varchar(160), `blocked_reason` text, `block_scope` varchar(100), `block_expires_at` timestamp

### `applicant_documents` â€” 14 columns Â· 33 rows
PK: `applicant_document_id`
Columns: `applicant_document_id` bigint(20) unsigned, `applicant_id` bigint(20) unsigned, `doc_type` varchar(30), `title` varchar(190), `original_copy` tinyint(1), `file_path` text, `original_name` varchar(255), `verification_status` varchar(30), `verification_result_json` longtext, `extracted_profile_json` longtext, `verified_at` timestamp, `uploaded_at` timestamp, `created_at` timestamp, `updated_at` timestamp

### `applicant_evaluations` â€” 38 columns Â· 7 rows
PK: `evaluation_id` Â· UNIQUE: applicant_evaluations_token_unique (token)
Columns: `evaluation_id` bigint(20) unsigned, `eval_type` varchar(30), `original_id` bigint(20) unsigned, `applicant_id` bigint(20) unsigned, `assessor_user_id` bigint(20) unsigned, `evaluation_date` date, `title` varchar(190), `total_score` decimal(5,2), `passing_score` decimal(5,2), `result` varchar(20), `outcome` varchar(30), `remarks` text, `scores_json` longtext, `comments_json` longtext, `questions_json` longtext, `criteria_json` longtext, `answers_json` longtext, `token` varchar(64), `status` varchar(20), `expires_at` timestamp, `submitted_at` timestamp, `screening_score` decimal(5,2), `screening_status` varchar(40), `interview_score` decimal(5,2), `interview_result` varchar(10), `assessment_test_score` decimal(5,2), `assessment_test_result` varchar(10), `practical_required` tinyint(1), `practical_test_score` decimal(5,2), `practical_test_result` varchar(10), `overall_score` decimal(5,2), `score_breakdown_json` longtext, `recommendation` varchar(30), `recommended_job_post_id` bigint(20) unsigned, `recommended_position_title` varchar(190), `details_json` longtext, `created_at` timestamp, `updated_at` timestamp

### `applicant_screenings` â€” 20 columns Â· 13 rows
PK: `screening_id`
Columns: `screening_id` bigint(20) unsigned, `applicant_id` bigint(20) unsigned, `job_post_id` bigint(20) unsigned, `processing_status` varchar(30), `screening_result` varchar(30), `match_score` decimal(5,2), `resume_match_score` decimal(5,2), `score_breakdown_json` longtext, `profile_json` longtext, `entities_json` longtext, `missing_information_json` longtext, `validation_json` longtext, `alternative_job_json` longtext, `document_verification_json` longtext, `reasons_json` longtext, `model_info_json` longtext, `error_message` text, `processed_at` timestamp, `created_at` timestamp, `updated_at` timestamp

### `attendance_records` â€” 15 columns Â· 11 rows
PK: `attendance_id` Â· UNIQUE: uq_attendance_records_natural (employee_id,work_date)
Columns: `attendance_id` bigint(20) unsigned, `employee_id` bigint(20) unsigned, `work_date` date, `time_in` timestamp, `time_out` timestamp, `break_in` timestamp, `break_out` timestamp, `hours_worked` decimal(7,2), `late_minutes` int(11), `undertime_minutes` int(11), `overtime_hours` decimal(7,2), `remark` varchar(255), `status` varchar(30), `created_at` timestamp, `updated_at` timestamp

### `audit_logs` â€” 17 columns Â· 772 rows
PK: `audit_log_id`
Columns: `audit_log_id` bigint(20) unsigned, `system_user_id` bigint(20) unsigned, `actor_role` varchar(50), `actor_department` varchar(120), `occurred_at` timestamp, `action` varchar(255), `module_name` varchar(100), `target_type` varchar(100), `target_id` varchar(100), `details` text, `severity` varchar(20), `ip_address` varchar(45), `device_info` varchar(255), `user_agent` text, `status` varchar(20), `extra_json` longtext, `url` varchar(2048)

### `chatbot_faqs` â€” 8 columns Â· 4 rows
PK: `faq_id`
Columns: `faq_id` bigint(20) unsigned, `question` varchar(255), `answer` text, `keywords` text, `enabled` tinyint(1), `sort_order` int(10) unsigned, `created_at` timestamp, `updated_at` timestamp

### `chatbot_messages` â€” 15 columns Â· 1 rows
PK: `id`
Columns: `id` bigint(20) unsigned, `session_id` varchar(80), `user_id` bigint(20) unsigned, `role` varchar(20), `message` text, `reply` text, `source` varchar(20), `intent` varchar(40), `faq_ids` text, `had_faq_context` tinyint(1), `feedback` tinyint(4), `prompt_tokens` int(10) unsigned, `completion_tokens` int(10) unsigned, `created_at` timestamp, `updated_at` timestamp

### `checklist_requests` â€” 11 columns Â· 2 rows
PK: `checklist_request_id` Â· UNIQUE: checklist_requests_request_code_unique (request_code)
Columns: `checklist_request_id` bigint(20) unsigned, `request_code` varchar(40), `employee_id` bigint(20) unsigned, `template_id` bigint(20) unsigned, `phase` varchar(30), `items_json` longtext, `status` varchar(30), `requested_by_user_id` bigint(20) unsigned, `requested_at` date, `created_at` timestamp, `updated_at` timestamp

### `code_sequences` â€” 3 columns Â· 2 rows
PK: `seq_key`
Columns: `seq_key` varchar(50), `next_val` bigint(20) unsigned, `updated_at` timestamp

### `departments` â€” 8 columns Â· 9 rows
PK: `department_id` Â· UNIQUE: departments_code_unique (code); departments_name_unique (name)
Columns: `department_id` bigint(20) unsigned, `code` varchar(30), `name` varchar(120), `description` text, `head_employee_id` bigint(20) unsigned, `budget` decimal(14,2), `created_at` timestamp, `updated_at` timestamp

### `employees` â€” 36 columns Â· 38 rows
PK: `employee_id` Â· UNIQUE: employees_email_unique (email); employees_employee_code_unique (employee_code)
Columns: `employee_id` bigint(20) unsigned, `employee_code` varchar(40), `first_name` varchar(80), `middle_name` varchar(80), `last_name` varchar(80), `email` varchar(190), `personal_email` varchar(190), `phone` varchar(40), `address` text, `birth_date` date, `gender` varchar(20), `civil_status` varchar(20), `nationality` varchar(60), `sss_number` varchar(30), `philhealth_number` varchar(30), `pagibig_number` varchar(30), `tin_number` varchar(30), `position_id` bigint(20) unsigned, `department_id` bigint(20) unsigned, `employment_type` varchar(30), `date_hired` date, `supervisor_employee_id` bigint(20) unsigned, `status` varchar(30), `onboarding_complete` tinyint(1), `salary_grade_id` bigint(20) unsigned, `employee_record_last_updated_at` date, `salary_step` varchar(30), `exit_type` varchar(30), `exit_date` date, `clearance_status` varchar(20), `coe_status` varchar(20), `exit_notes` text, `emergency_contacts_json` longtext, `created_at` timestamp, `updated_at` timestamp, `deleted_at` timestamp

### `employee_benefits` â€” 10 columns Â· 17 rows
PK: `employee_benefit_id`
Columns: `employee_benefit_id` bigint(20) unsigned, `employee_id` bigint(20) unsigned, `benefit_name` varchar(100), `reference_value` varchar(190), `note` text, `effective_date` date, `end_date` date, `status` varchar(30), `created_at` timestamp, `updated_at` timestamp

### `employee_documents` â€” 19 columns Â· 19 rows
PK: `document_id` Â· UNIQUE: uq_employee_documents_natural (employee_id,document_code)
Columns: `document_id` bigint(20) unsigned, `employee_id` bigint(20) unsigned, `document_code` varchar(50), `title` varchar(200), `category` varchar(80), `source_type` varchar(30), `source_id` bigint(20) unsigned, `original_name` varchar(255), `source_hash` varchar(128), `file_path` text, `mime_type` varchar(100), `file_size_bytes` bigint(20) unsigned, `document_status` varchar(30), `document_date` date, `expiry_date` date, `last_updated_at` timestamp, `created_at` timestamp, `updated_at` timestamp, `deleted_at` timestamp

### `employee_learning` â€” 12 columns Â· 7 rows
PK: `employee_learning_id` Â· UNIQUE: uq_employee_learning_natural (employee_id,course_id)
Columns: `employee_learning_id` bigint(20) unsigned, `employee_id` bigint(20) unsigned, `course_id` bigint(20) unsigned, `status` varchar(30), `score` decimal(5,2), `assigned_date` date, `completed_date` date, `completion_source` varchar(20), `reading_completed_at` timestamp, `attempts_json` longtext, `created_at` timestamp, `updated_at` timestamp

### `employee_onboarding_items` â€” 16 columns Â· 80 rows
PK: `employee_onboarding_item_id`
Columns: `employee_onboarding_item_id` bigint(20) unsigned, `employee_id` bigint(20) unsigned, `new_hire_id` bigint(20) unsigned, `template_item_id` bigint(20) unsigned, `item_text` text, `file_path` varchar(500), `file_name` varchar(255), `notes` text, `done` tinyint(1), `submitted_at` timestamp, `completed_at` timestamp, `completed_by_user_id` bigint(20) unsigned, `created_at` timestamp, `updated_at` timestamp, `review_note` text, `returned_count` int(10) unsigned

### `employee_position_history` â€” 10 columns Â· 38 rows
PK: `position_history_id`
Columns: `position_history_id` bigint(20) unsigned, `employee_id` bigint(20) unsigned, `effective_date` date, `change_type` varchar(30), `old_position_id` bigint(20) unsigned, `new_position_id` bigint(20) unsigned, `old_salary_grade_id` bigint(20) unsigned, `new_salary_grade_id` bigint(20) unsigned, `notes` text, `created_at` timestamp

### `ess_categories` â€” 12 columns Â· 9 rows
PK: `ess_category_id` Â· UNIQUE: ess_categories_code_unique (code)
Columns: `ess_category_id` bigint(20) unsigned, `code` varchar(40), `name` varchar(120), `description` text, `is_open` tinyint(1), `requires_fulfillment` tinyint(1), `default_module` varchar(40), `requires_module_ack` tinyint(1), `sla_hours` int(10) unsigned, `sort_order` int(11), `created_at` timestamp, `updated_at` timestamp

### `ess_requests` â€” 24 columns Â· 9 rows
PK: `ess_request_id` Â· UNIQUE: ess_requests_request_code_unique (request_code)
Columns: `ess_request_id` bigint(20) unsigned, `request_code` varchar(40), `employee_id` bigint(20) unsigned, `category_id` bigint(20) unsigned, `request_type` varchar(100), `filed_at` timestamp, `date_from` date, `date_to` date, `status` varchar(30), `routed_module` varchar(40), `routed_at` timestamp, `module_responded_at` timestamp, `module_reference` varchar(100), `module_note` text, `assigned_to_user_id` bigint(20) unsigned, `details` text, `review_note` text, `completed_at` timestamp, `released_at` timestamp, `released_by_user_id` bigint(20) unsigned, `returned_count` int(11), `attachment_path` text, `created_at` timestamp, `updated_at` timestamp

### `ess_request_events` â€” 20 columns Â· 2 rows
PK: `ess_request_event_id`
Columns: `ess_request_event_id` bigint(20) unsigned, `ess_request_id` bigint(20) unsigned, `event_type` varchar(20), `leg` smallint(5) unsigned, `from_module` varchar(40), `to_module` varchar(40), `action` varchar(20), `actor_user_id` bigint(20) unsigned, `note` text, `status` varchar(30), `result_payload` longtext, `direction` varchar(20), `source_module` varchar(40), `file_path` text, `original_name` varchar(255), `mime_type` varchar(120), `file_size_bytes` bigint(20) unsigned, `uploaded_by_user_id` bigint(20) unsigned, `created_at` timestamp, `updated_at` timestamp

### `hr3_recommendations` â€” 14 columns Â· 4 rows
PK: `recommendation_id`
Columns: `recommendation_id` bigint(20) unsigned, `employee_id` bigint(20) unsigned, `promotion_request_id` bigint(20) unsigned, `recommendation_type` varchar(40), `evaluation_score` decimal(5,2), `evaluator_user_id` bigint(20) unsigned, `date_submitted` date, `status` varchar(40), `suggested_position_id` bigint(20) unsigned, `suggested_salary_grade_id` bigint(20) unsigned, `current_employment_type` varchar(30), `comments` text, `created_at` timestamp, `updated_at` timestamp

### `interviews` â€” 19 columns Â· 8 rows
PK: `interview_id` Â· UNIQUE: interviews_interview_code_unique (interview_code)
Columns: `interview_id` bigint(20) unsigned, `interview_code` varchar(40), `applicant_id` bigint(20) unsigned, `scheduled_date` date, `scheduled_time` time, `scheduled_end_time` time, `mode` varchar(20), `facility_id` bigint(20) unsigned, `facility_status` varchar(40), `interviewer_employee_id` bigint(20) unsigned, `interviewer_name` varchar(160), `zoom_meeting_id` varchar(64), `zoom_join_url` text, `zoom_continue_url` text, `zoom_password` varchar(64), `status` varchar(20), `interview_notes` text, `created_at` timestamp, `updated_at` timestamp

### `job_posts` â€” 34 columns Â· 10 rows
PK: `job_post_id` Â· UNIQUE: job_posts_slug_unique (slug)
Columns: `job_post_id` bigint(20) unsigned, `slug` varchar(120), `title` varchar(150), `department_id` bigint(20) unsigned, `position_id` bigint(20) unsigned, `employment_type` varchar(30), `schedule` varchar(120), `salary_min` decimal(12,2), `salary_max` decimal(12,2), `vacancies` int(11), `filled_count` int(11), `posted_date` date, `status` varchar(20), `requires_practical` tinyint(1), `requires_assessment` tinyint(1), `active` tinyint(1), `experience_level` varchar(50), `experience_levels` longtext, `education_level` varchar(100), `education_levels` longtext, `summary` text, `description` text, `responsibilities_json` longtext, `qualifications_json` longtext, `skills_json` longtext, `additional_json` longtext, `instructions` text, `about` text, `picture` varchar(255), `blocks_json` longtext, `platforms_json` longtext, `created_at` timestamp, `updated_at` timestamp, `deleted_at` timestamp

### `learning_courses` â€” 14 columns Â· 3 rows
PK: `course_id` Â· UNIQUE: learning_courses_course_code_unique (course_code)
Columns: `course_id` bigint(20) unsigned, `course_code` varchar(40), `title` varchar(200), `category` varchar(120), `description` text, `content_text` longtext, `material_path` varchar(255), `quiz_json` longtext, `quiz_generated_at` timestamp, `estimated_reading_minutes` smallint(5) unsigned, `estimated_pages` smallint(5) unsigned, `mandatory` tinyint(1), `created_at` timestamp, `updated_at` timestamp

### `leave_balances` â€” 8 columns Â· 15 rows
PK: `leave_balance_id` Â· UNIQUE: uq_leave_balances_natural (employee_id,leave_type,period_year)
Columns: `leave_balance_id` bigint(20) unsigned, `employee_id` bigint(20) unsigned, `leave_type` varchar(80), `period_year` smallint(6), `total_days` decimal(6,2), `used_days` decimal(6,2), `created_at` timestamp, `updated_at` timestamp

### `migrations` â€” 3 columns Â· 139 rows
PK: `id`
Columns: `id` int(10) unsigned, `migration` varchar(255), `batch` int(11)

### `new_hires` â€” 15 columns Â· 12 rows
PK: `new_hire_id` Â· UNIQUE: new_hires_new_hire_code_unique (new_hire_code)
Columns: `new_hire_id` bigint(20) unsigned, `new_hire_code` varchar(40), `applicant_id` bigint(20) unsigned, `employee_id` bigint(20) unsigned, `name` varchar(160), `email` varchar(190), `phone` varchar(40), `position_id` bigint(20) unsigned, `department_id` bigint(20) unsigned, `stage` varchar(30), `start_date` date, `evaluation_requested_at` timestamp, `completed_at` timestamp, `created_at` timestamp, `updated_at` timestamp

### `notifications` â€” 11 columns Â· 187 rows
PK: `notification_id`
Columns: `notification_id` bigint(20) unsigned, `system_user_id` bigint(20) unsigned, `type` varchar(50), `title` varchar(200), `body` text, `module_name` varchar(100), `target_type` varchar(100), `target_id` varchar(100), `is_read` tinyint(1), `read_at` timestamp, `created_at` timestamp

### `onboarding_checklist_templates` â€” 9 columns Â· 3 rows
PK: `template_id` Â· UNIQUE: onboarding_checklist_templates_template_code_unique (template_code)
Columns: `template_id` bigint(20) unsigned, `template_code` varchar(40), `title` varchar(200), `phase` varchar(30), `position_scope_json` longtext, `status` varchar(20), `items_json` longtext, `created_at` timestamp, `updated_at` timestamp

### `payroll_records` â€” 14 columns Â· 11 rows
PK: `payroll_record_id`
Columns: `payroll_record_id` bigint(20) unsigned, `employee_id` bigint(20) unsigned, `payroll_period_id` bigint(20) unsigned, `period_code` varchar(40), `period_name` varchar(120), `pay_period_start` date, `pay_period_end` date, `payout_date` date, `gross_pay` decimal(12,2), `net_pay` decimal(12,2), `items_json` longtext, `status` varchar(30), `created_at` timestamp, `updated_at` timestamp

### `performance_reviews` â€” 12 columns Â· 4 rows
PK: `performance_review_id`
Columns: `performance_review_id` bigint(20) unsigned, `employee_id` bigint(20) unsigned, `review_period` varchar(80), `review_date` date, `competency_level` varchar(50), `overall_rating` decimal(5,2), `salary_grade_id` bigint(20) unsigned, `salary_step` varchar(30), `evaluator_user_id` bigint(20) unsigned, `comments` text, `created_at` timestamp, `updated_at` timestamp

### `personal_access_tokens` â€” 10 columns Â· 24 rows
PK: `id` Â· UNIQUE: personal_access_tokens_token_unique (token)
Columns: `id` bigint(20) unsigned, `tokenable_type` varchar(255), `tokenable_id` bigint(20) unsigned, `name` text, `token` varchar(64), `abilities` text, `last_used_at` timestamp, `expires_at` timestamp, `created_at` timestamp, `updated_at` timestamp

### `positions` â€” 12 columns Â· 26 rows
PK: `position_id` Â· UNIQUE: positions_position_code_unique (position_code)
Columns: `position_id` bigint(20) unsigned, `position_code` varchar(30), `title` varchar(150), `department_id` bigint(20) unsigned, `salary_grade_id` bigint(20) unsigned, `requires_assessment` tinyint(1), `requires_practical` tinyint(1), `level` varchar(30), `headcount` int(11), `filled_count` int(11), `created_at` timestamp, `updated_at` timestamp

### `promotion_requests` â€” 16 columns Â· 0 rows
PK: `promotion_request_id`
Columns: `promotion_request_id` bigint(20) unsigned, `employee_id` bigint(20) unsigned, `ess_request_id` bigint(20) unsigned, `current_position_id` bigint(20) unsigned, `requested_position_id` bigint(20) unsigned, `requested_salary_grade_id` bigint(20) unsigned, `hr3_recommendation_id` bigint(20) unsigned, `justification` text, `status` varchar(30), `reviewed_by` bigint(20) unsigned, `forwarded_to_hr3_by` bigint(20) unsigned, `forwarded_to_hr3_at` timestamp, `reviewed_at` timestamp, `review_notes` text, `created_at` timestamp, `updated_at` timestamp

### `requisitions` â€” 14 columns Â· 12 rows
PK: `requisition_id` Â· UNIQUE: requisitions_requisition_code_unique (requisition_code)
Columns: `requisition_id` bigint(20) unsigned, `requisition_code` varchar(40), `position_id` bigint(20) unsigned, `position_title` varchar(150), `department_id` bigint(20) unsigned, `requested_by_user_id` bigint(20) unsigned, `requested_count` int(11), `urgency` varchar(20), `justification` text, `status` varchar(20), `requested_at` date, `converted_job_post_id` bigint(20) unsigned, `created_at` timestamp, `updated_at` timestamp

### `role_permissions` â€” 6 columns Â· 30 rows
PK: `role_permission_id` Â· UNIQUE: uq_role_permissions_natural (role_id,module_name)
Columns: `role_permission_id` bigint(20) unsigned, `role_id` bigint(20) unsigned, `module_name` varchar(100), `permission_level` varchar(40), `created_at` timestamp, `updated_at` timestamp

### `salary_grades` â€” 10 columns Â· 7 rows
PK: `salary_grade_id` Â· UNIQUE: salary_grades_code_unique (code)
Columns: `salary_grade_id` bigint(20) unsigned, `code` varchar(30), `title` varchar(120), `min_salary` decimal(12,2), `max_salary` decimal(12,2), `currency_code` char(3), `level` varchar(30), `notes` text, `created_at` timestamp, `updated_at` timestamp

### `screening_ground_truths` â€” 10 columns Â· 0 rows
PK: `gt_id` Â· UNIQUE: uq_screening_ground_truths_applicant (applicant_id)
Columns: `gt_id` bigint(20) unsigned, `applicant_id` bigint(20) unsigned, `job_post_id` bigint(20) unsigned, `true_screening_result` varchar(30), `true_qualification_score` decimal(5,2), `true_missing_information_json` longtext, `true_unrecognized_skills_json` longtext, `notes` text, `created_at` timestamp, `updated_at` timestamp

### `screening_reference_data` â€” 7 columns Â· 260 rows
PK: `ref_id` Â· UNIQUE: uq_screening_ref_type_value (data_type,canonical_value)
Columns: `ref_id` bigint(20) unsigned, `data_type` varchar(20), `canonical_value` varchar(150), `aliases_json` longtext, `active` tinyint(1), `created_at` timestamp, `updated_at` timestamp

### `screening_requirement_templates` â€” 8 columns Â· 8 rows
PK: `template_id`
Columns: `template_id` bigint(20) unsigned, `name` varchar(150), `position_id` bigint(20) unsigned, `description` varchar(500), `active` tinyint(1), `items_json` longtext, `created_at` timestamp, `updated_at` timestamp

### `social_recognitions` â€” 16 columns Â· 6 rows
PK: `recognition_id`
Columns: `recognition_id` bigint(20) unsigned, `sender_employee_id` bigint(20) unsigned, `recipient_employee_id` bigint(20) unsigned, `sender_name` varchar(255), `recipient_name` varchar(255), `sender_role` varchar(255), `recipient_role` varchar(255), `core_value` varchar(100), `message` text, `clap_count` int(10) unsigned, `heart_count` int(10) unsigned, `star_count` int(10) unsigned, `fire_count` int(10) unsigned, `reactions_json` longtext, `created_at` timestamp, `updated_at` timestamp

### `system_roles` â€” 7 columns Â· 3 rows
PK: `role_id` Â· UNIQUE: system_roles_role_name_unique (role_name)
Columns: `role_id` bigint(20) unsigned, `role_name` varchar(50), `description` text, `is_super_admin` tinyint(1), `is_protected` tinyint(1), `created_at` timestamp, `updated_at` timestamp

### `system_settings` â€” 6 columns Â· 31 rows
PK: `setting_id` Â· UNIQUE: system_settings_setting_key_unique (setting_key)
Columns: `setting_id` bigint(20) unsigned, `setting_key` varchar(120), `setting_value` longtext, `updated_by_user_id` bigint(20) unsigned, `created_at` timestamp, `updated_at` timestamp

### `system_users` â€” 20 columns Â· 9 rows
PK: `system_user_id` Â· UNIQUE: system_users_email_unique (email); system_users_employee_id_unique (employee_id); system_users_username_unique (username)
Columns: `system_user_id` bigint(20) unsigned, `username` varchar(100), `email` varchar(190), `password_hash` varchar(255), `full_name` varchar(160), `department_name` varchar(120), `employee_id` bigint(20) unsigned, `role_id` bigint(20) unsigned, `status` varchar(20), `otp_enabled` tinyint(1), `mfa_method` varchar(20), `totp_secret` text, `totp_confirmed_at` timestamp, `mfa_recovery_codes` longtext, `failed_attempts` tinyint(3) unsigned, `locked_until` timestamp, `last_login_at` timestamp, `last_login_ip` varchar(45), `created_at` timestamp, `updated_at` timestamp

### `work_schedules` â€” 12 columns Â· 14 rows
PK: `work_schedule_id`
Columns: `work_schedule_id` bigint(20) unsigned, `employee_id` bigint(20) unsigned, `day_of_week` smallint(6), `shift_name` varchar(80), `start_time` time, `end_time` time, `location` varchar(120), `is_rest_day` tinyint(1), `effective_from` date, `effective_to` date, `created_at` timestamp, `updated_at` timestamp


## 6. Old schema â€” `hotel_hr (oct 31).sql` (71 tables)

Column definitions are exactly as they appear in the dump (types include length/unsigned hints).

### `announcements` â€” 0 columns
Columns: 

### `applicants` â€” 0 columns
Columns: 

### `applicant_assessments` â€” 0 columns
Columns: 

### `applicant_block_history` â€” 0 columns
Columns: 

### `applicant_documents` â€” 0 columns
Columns: 

### `applicant_screenings` â€” 0 columns
Columns: 

### `applicant_screening_entities` â€” 0 columns
Columns: 

### `applicant_screening_scores` â€” 0 columns
Columns: 

### `assessment_invites` â€” 0 columns
Columns: 

### `assessment_tests` â€” 0 columns
Columns: 

### `attendance_records` â€” 0 columns
Columns: 

### `audit_logs` â€” 0 columns
Columns: 

### `cache` â€” 0 columns
Columns: 

### `cache_locks` â€” 0 columns
Columns: 

### `chatbot_faqs` â€” 0 columns
Columns: 

### `chatbot_messages` â€” 0 columns
Columns: 

### `chatbot_unanswered` â€” 0 columns
Columns: 

### `checklist_requests` â€” 0 columns
Columns: 

### `departments` â€” 0 columns
Columns: 

### `document_code_sequences` â€” 0 columns
Columns: 

### `employees` â€” 0 columns
Columns: 

### `employee_benefits` â€” 0 columns
Columns: 

### `employee_code_sequences` â€” 0 columns
Columns: 

### `employee_documents` â€” 0 columns
Columns: 

### `employee_emergency_contacts` â€” 0 columns
Columns: 

### `employee_exit_records` â€” 0 columns
Columns: 

### `employee_learning` â€” 0 columns
Columns: 

### `employee_learning_attempts` â€” 0 columns
Columns: 

### `employee_onboarding_items` â€” 0 columns
Columns: 

### `employee_position_history` â€” 0 columns
Columns: 

### `ess_categories` â€” 0 columns
Columns: 

### `ess_request_attachments` â€” 0 columns
Columns: 

### `ess_request_routings` â€” 0 columns
Columns: 

### `ess_request_status_histories` â€” 0 columns
Columns: 

### `facilities` â€” 0 columns
Columns: 

### `final_evaluations` â€” 0 columns
Columns: 

### `hr3_recommendations` â€” 0 columns
Columns: 

### `interviews` â€” 0 columns
Columns: 

### `job_posts` â€” 0 columns
Columns: 

### `job_post_platforms` â€” 0 columns
Columns: 

### `learning_courses` â€” 0 columns
Columns: 

### `leave_balances` â€” 0 columns
Columns: 

### `migrations` â€” 0 columns
Columns: 

### `new_hires` â€” 0 columns
Columns: 

### `notifications` â€” 0 columns
Columns: 

### `onboarding_checklist_items` â€” 0 columns
Columns: 

### `onboarding_checklist_templates` â€” 0 columns
Columns: 

### `password_reset_tokens` â€” 0 columns
Columns: 

### `payroll_items` â€” 0 columns
Columns: 

### `payroll_periods` â€” 0 columns
Columns: 

### `payroll_records` â€” 0 columns
Columns: 

### `performance_reviews` â€” 0 columns
Columns: 

### `personal_access_tokens` â€” 0 columns
Columns: 

### `positions` â€” 0 columns
Columns: 

### `practical_tests` â€” 0 columns
Columns: 

### `promotion_requests` â€” 0 columns
Columns: 

### `recognition_reactions` â€” 0 columns
Columns: 

### `requisitions` â€” 0 columns
Columns: 

### `role_permissions` â€” 0 columns
Columns: 

### `salary_grades` â€” 0 columns
Columns: 

### `screening_ground_truths` â€” 0 columns
Columns: 

### `screening_reference_data` â€” 0 columns
Columns: 

### `screening_requirement_templates` â€” 0 columns
Columns: 

### `screening_requirement_template_items` â€” 0 columns
Columns: 

### `sessions` â€” 0 columns
Columns: 

### `social_recognitions` â€” 0 columns
Columns: 

### `system_roles` â€” 0 columns
Columns: 

### `system_settings` â€” 0 columns
Columns: 

### `system_users` â€” 0 columns
Columns: 

### `user_login_activity` â€” 0 columns
Columns: 

### `work_schedules` â€” 0 columns
Columns: 


---

_Generated automatically from the SQL dump and `information_schema`. Re-run the generator after any further migration._
