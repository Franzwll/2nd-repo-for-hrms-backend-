-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 21, 2026 at 01:39 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `hotel_hr`
--
CREATE DATABASE IF NOT EXISTS `hotel_hr` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `hotel_hr`;

--
-- Table structure for table `employee_position_history`
--

CREATE TABLE IF NOT EXISTS `employee_position_history` (
  `position_history_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `employee_id` bigint(20) UNSIGNED NOT NULL,
  `effective_date` date NOT NULL,
  `change_type` varchar(30) NOT NULL DEFAULT 'Employment',
  `old_position_id` bigint(20) UNSIGNED DEFAULT NULL,
  `new_position_id` bigint(20) UNSIGNED DEFAULT NULL,
  `old_salary_grade_id` bigint(20) UNSIGNED DEFAULT NULL,
  `new_salary_grade_id` bigint(20) UNSIGNED DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`position_history_id`),
  KEY `idx_employee_position_history_employee_id` (`employee_id`),
  KEY `idx_employee_position_history_old_position_id` (`old_position_id`),
  KEY `idx_employee_position_history_new_position_id` (`new_position_id`),
  KEY `idx_employee_position_history_old_salary_grade_id` (`old_salary_grade_id`),
  KEY `idx_employee_position_history_new_salary_grade_id` (`new_salary_grade_id`)
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `employee_position_history`
--

INSERT INTO `employee_position_history` (`position_history_id`, `employee_id`, `effective_date`, `change_type`, `old_position_id`, `new_position_id`, `old_salary_grade_id`, `new_salary_grade_id`, `notes`, `created_at`) VALUES
(1, 1, '2019-02-11', 'Employment', NULL, 10, NULL, 6, 'Initial hiring as Front Office Manager', '2026-10-18 09:06:13'),
(2, 2, '2018-06-04', 'Employment', NULL, 11, NULL, 7, 'Initial hiring as F&B Director', '2026-10-18 09:06:13'),
(3, 3, '2017-11-20', 'Employment', NULL, 13, NULL, 6, 'Initial hiring as Executive Housekeeper', '2026-10-18 09:06:13'),
(4, 4, '2026-08-04', 'Employment', NULL, 2, NULL, 4, 'Initial hiring as Guest Relations Officer', '2026-10-18 09:06:13'),
(5, 5, '2026-04-15', 'Employment', NULL, 5, NULL, 2, 'Initial hiring as Line Cook', '2026-10-18 09:06:13'),
(6, 6, '2025-09-16', 'Employment', NULL, 3, NULL, 1, 'Initial hiring as Restaurant Server', '2026-10-18 09:06:13'),
(7, 7, '2016-01-18', 'Employment', NULL, 14, NULL, 7, 'Initial hiring as HR & Administration Manager', '2026-10-18 09:06:13'),
(8, 8, '2021-05-03', 'Employment', NULL, 15, NULL, 4, 'Initial hiring as Floor Supervisor', '2026-10-18 09:06:13'),
(9, 9, '2015-03-02', 'Employment', NULL, 9, NULL, 7, 'Initial hiring as General Manager', '2026-10-18 09:06:13'),
(10, 10, '2017-07-10', 'Employment', NULL, 12, NULL, 7, 'Initial hiring as Executive Chef', '2026-10-18 09:06:13'),
(11, 11, '2020-02-03', 'Employment', NULL, 16, NULL, 4, 'Initial hiring as HR Officer', '2026-10-18 09:06:13'),
(12, 12, '2019-08-19', 'Employment', NULL, 17, NULL, 4, 'Initial hiring as Accounting Supervisor', '2026-10-18 09:06:13'),
(13, 13, '2026-08-04', 'Employment', NULL, 1, NULL, 2, 'Initial hiring as Front Desk Receptionist', '2026-10-18 09:06:13'),
(14, 14, '2026-03-01', 'Employment', NULL, 4, NULL, 1, 'Initial hiring as Bartender', '2026-10-18 09:06:13'),
(15, 15, '2026-05-11', 'Employment', NULL, 1, NULL, 2, 'Initial hiring as Front Desk Receptionist', '2026-10-18 09:06:13'),
(16, 16, '2026-02-20', 'Employment', NULL, 7, NULL, 1, 'Initial hiring as Housekeeping Attendant', '2026-10-18 09:06:13'),
(17, 17, '2026-06-01', 'Employment', NULL, 8, NULL, 3, 'Initial hiring as HR Assistant', '2026-10-18 09:06:13'),
(18, 18, '2025-06-02', 'Employment', NULL, 6, NULL, 5, 'Initial hiring as Pastry Chef', '2026-10-18 09:06:13'),
(19, 19, '2025-03-19', 'Employment', NULL, 7, NULL, 1, 'Initial hiring as Housekeeping Attendant', '2026-10-18 09:06:13'),
(20, 20, '2025-11-10', 'Employment', NULL, 2, NULL, 4, 'Initial hiring as Guest Relations Officer', '2026-10-18 09:06:13'),
(21, 21, '2025-01-27', 'Employment', NULL, 8, NULL, 3, 'Initial hiring as HR Assistant', '2026-10-18 09:06:13'),
(22, 22, '2026-05-04', 'Employment', NULL, 1, NULL, 2, 'Initial hiring as Front Desk Receptionist', '2026-10-18 09:06:13'),
(23, 23, '2026-03-06', 'Employment', NULL, 7, NULL, 1, 'Initial hiring as Housekeeping Attendant', '2026-10-18 09:06:13'),
(24, 24, '2021-08-15', 'Employment', NULL, 18, NULL, 1, 'Initial hiring as Security Officer', '2026-10-18 09:06:13'),
(25, 25, '2023-02-10', 'Employment', NULL, 18, NULL, 1, 'Initial hiring as Security Officer', '2026-10-18 09:06:13'),
(26, 26, '2025-09-01', 'Employment', NULL, 18, NULL, 1, 'Initial hiring as Security Officer', '2026-10-18 09:06:13'),
(27, 27, '2019-05-20', 'Employment', NULL, 19, NULL, 4, 'Initial hiring as Security Supervisor', '2026-10-18 09:06:13'),
(28, 28, '2022-06-12', 'Employment', NULL, 20, NULL, 2, 'Initial hiring as Spa Therapist', '2026-10-18 09:06:13'),
(29, 29, '2025-11-01', 'Employment', NULL, 20, NULL, 2, 'Initial hiring as Spa Therapist', '2026-10-18 09:06:13'),
(30, 30, '2026-01-15', 'Employment', NULL, 21, NULL, 1, 'Initial hiring as Wellness / Gym Attendant', '2026-10-18 09:06:13'),
(31, 31, '2021-03-08', 'Employment', NULL, 22, NULL, 3, 'Initial hiring as Accounting Assistant', '2026-10-18 09:06:13'),
(32, 32, '2018-10-01', 'Employment', NULL, 23, NULL, 5, 'Initial hiring as Finance Officer', '2026-10-18 09:06:13'),
(33, 33, '2020-04-17', 'Employment', NULL, 24, NULL, 2, 'Initial hiring as Maintenance Technician', '2026-10-18 09:06:13'),
(34, 34, '2022-09-05', 'Employment', NULL, 24, NULL, 2, 'Initial hiring as Maintenance Technician', '2026-10-18 09:06:13'),
(35, 35, '2026-02-01', 'Employment', NULL, 24, NULL, 2, 'Initial hiring as Maintenance Technician', '2026-10-18 09:06:13'),
(36, 36, '2017-07-25', 'Employment', NULL, 25, NULL, 4, 'Initial hiring as Engineering Supervisor', '2026-10-18 09:06:13'),
(37, 37, '2021-12-10', 'Employment', NULL, 26, NULL, 2, 'Initial hiring as Electrician', '2026-10-18 09:06:13');

-- --------------------------------------------------------

--
-- Table structure for table `ess_categories`
--

CREATE TABLE IF NOT EXISTS `ess_categories` (
  `ess_category_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` varchar(40) NOT NULL,
  `name` varchar(120) NOT NULL,
  `description` text DEFAULT NULL,
  `is_open` tinyint(1) NOT NULL DEFAULT 1,
  `requires_fulfillment` tinyint(1) NOT NULL DEFAULT 0,
  `default_module` varchar(40) DEFAULT NULL,
  `requires_module_ack` tinyint(1) NOT NULL DEFAULT 1,
  `sla_hours` int(10) UNSIGNED DEFAULT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`ess_category_id`),
  UNIQUE KEY `ess_categories_code_unique` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `ess_categories`
--

INSERT INTO `ess_categories` (`ess_category_id`, `code`, `name`, `description`, `is_open`, `requires_fulfillment`, `default_module`, `requires_module_ack`, `sla_hours`, `sort_order`, `created_at`, `updated_at`) VALUES
(1, 'ESS-LEAVE', 'Leave', 'Vacation, sick, emergency and other leave filings.', 1, 0, NULL, 1, NULL, 1, '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(2, 'ESS-ATT', 'Attendance', 'Time in/out corrections, overtime and shift changes.', 1, 0, NULL, 1, NULL, 2, '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(3, 'ESS-PAY', 'Payroll', 'Payslips, payroll inquiries and salary certificates.', 1, 0, NULL, 1, NULL, 3, '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(4, 'ESS-PAYUPD', 'Payroll Update', 'Bank account, payment method and deduction updates.', 1, 0, NULL, 1, NULL, 4, '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(5, 'ESS-LOAN', 'Loan', 'Company loans, salary loans and cash advances.', 1, 0, NULL, 1, NULL, 5, '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(6, 'ESS-REIMB', 'Reimbursement', 'Transportation, travel and other expense claims.', 1, 0, NULL, 1, NULL, 6, '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(7, 'ESS-HRDOC', 'HR Document', 'Certificates, service records and employment verification.', 1, 1, 'erm', 1, NULL, 7, '2026-10-18 09:06:13', '2026-10-21 06:48:39'),
(8, 'ESS-PINFO', 'Personal Info', 'Address, contact, civil status and government ID updates.', 1, 0, NULL, 1, NULL, 8, '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(9, 'ESS-ACCT', 'Account', 'Password resets and ESS account access issues.', 1, 0, NULL, 1, NULL, 9, '2026-10-18 09:06:13', '2026-10-18 09:06:13');

-- --------------------------------------------------------

--
-- Table structure for table `ess_requests`
--

CREATE TABLE IF NOT EXISTS `ess_requests` (
  `ess_request_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `request_code` varchar(40) NOT NULL,
  `employee_id` bigint(20) UNSIGNED NOT NULL,
  `category_id` bigint(20) UNSIGNED DEFAULT NULL,
  `request_type` varchar(100) NOT NULL,
  `filed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `date_from` date DEFAULT NULL,
  `date_to` date DEFAULT NULL,
  `status` varchar(30) NOT NULL,
  `routed_module` varchar(40) DEFAULT NULL,
  `routed_at` timestamp NULL DEFAULT NULL,
  `module_responded_at` timestamp NULL DEFAULT NULL,
  `module_reference` varchar(100) DEFAULT NULL,
  `module_note` text DEFAULT NULL,
  `assigned_to_user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `details` text DEFAULT NULL,
  `review_note` text DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `released_at` timestamp NULL DEFAULT NULL,
  `released_by_user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `returned_count` int(11) NOT NULL DEFAULT 0,
  `attachment_path` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`ess_request_id`),
  UNIQUE KEY `ess_requests_request_code_unique` (`request_code`),
  KEY `idx_ess_requests_employee_id` (`employee_id`),
  KEY `idx_ess_requests_category_id` (`category_id`),
  KEY `idx_ess_requests_assigned_to_user_id` (`assigned_to_user_id`),
  KEY `idx_ess_requests_status` (`status`),
  KEY `idx_ess_requests_filed_at` (`filed_at`),
  KEY `idx_ess_requests_routed_module` (`routed_module`),
  KEY `fk_ess_requests_released_by` (`released_by_user_id`)
) ;

--
-- Dumping data for table `ess_requests`
--

INSERT INTO `ess_requests` (`ess_request_id`, `request_code`, `employee_id`, `category_id`, `request_type`, `filed_at`, `date_from`, `date_to`, `status`, `routed_module`, `routed_at`, `module_responded_at`, `module_reference`, `module_note`, `assigned_to_user_id`, `details`, `review_note`, `completed_at`, `released_at`, `released_by_user_id`, `returned_count`, `attachment_path`, `created_at`, `updated_at`) VALUES
(1, 'REQ-4410', 5, 1, 'Sick Leave', '2026-07-25 01:00:00', '2026-07-27', '2026-07-27', 'Pending', NULL, NULL, NULL, NULL, NULL, 2, '1 day sick leave with medical certificate attached.', NULL, NULL, NULL, NULL, 0, '/uploads/ess/req-4410-medical.pdf', '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(2, 'REQ-4409', 6, 7, 'Certificate of Employment', '2026-07-24 02:00:00', NULL, NULL, 'Under Review', NULL, NULL, NULL, NULL, NULL, 7, 'COE for bank loan application, needs salary details.', NULL, NULL, NULL, NULL, 0, NULL, '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(3, 'REQ-4408', 8, 2, 'Attendance Correction', '2026-07-24 03:00:00', NULL, NULL, 'Approved', NULL, NULL, NULL, NULL, NULL, 2, 'Missing time-out on 2026-07-22, verified with floor logbook.', 'Verified against floor logbook entry.', NULL, NULL, NULL, 0, NULL, '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(4, 'REQ-4407', 4, 3, 'Payslip Request', '2026-07-23 06:00:00', NULL, NULL, 'Completed', NULL, NULL, NULL, NULL, NULL, 8, 'Payslip copies for June 2026 cut-offs.', 'Copies released via HR portal.', NULL, NULL, NULL, 0, NULL, '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(5, 'REQ-4406', 5, 6, 'Transportation', '2026-07-21 01:00:00', NULL, NULL, 'Rejected', NULL, NULL, NULL, NULL, NULL, 8, 'Missing official receipt for claimed amount.', 'Official receipt not provided.', NULL, NULL, NULL, 1, NULL, '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(6, 'REQ-4405', 1, 5, 'Company Loan', '2026-07-20 05:00:00', NULL, NULL, 'Under Review', NULL, NULL, NULL, NULL, NULL, 8, 'PHP 50,000 company loan payable in 12 months.', NULL, NULL, NULL, NULL, 0, '/uploads/ess/req-4405-loan-agreement.pdf', '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(7, 'REQ-4404', 8, 8, 'Contact Number Update', '2026-07-19 01:00:00', NULL, NULL, 'Completed', NULL, NULL, NULL, NULL, NULL, 7, 'Updated mobile number and emergency contact.', 'Record updated in 201 file.', NULL, NULL, NULL, 0, NULL, '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(8, 'REQ-4411', 5, 3, 'Salary Loan Application', '2026-10-20 08:28:18', NULL, NULL, 'Pending', NULL, NULL, NULL, NULL, NULL, NULL, 'Employee requests a company salary loan application with an amortization schedule. Requested via ESS Statutory Benefits & Active Loans.', NULL, NULL, NULL, NULL, 0, NULL, '2026-10-20 08:28:18', '2026-10-20 08:28:18');

-- --------------------------------------------------------

--
-- Table structure for table `ess_request_attachments`
--

CREATE TABLE IF NOT EXISTS `ess_request_attachments` (
  `ess_request_attachment_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `ess_request_id` bigint(20) UNSIGNED NOT NULL,
  `direction` varchar(20) NOT NULL DEFAULT 'employee',
  `source_module` varchar(40) DEFAULT NULL,
  `file_path` text NOT NULL,
  `original_name` varchar(255) DEFAULT NULL,
  `mime_type` varchar(120) DEFAULT NULL,
  `file_size_bytes` bigint(20) UNSIGNED DEFAULT NULL,
  `uploaded_by_user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`ess_request_attachment_id`),
  KEY `idx_ess_request_attachments_request_id` (`ess_request_id`),
  KEY `idx_ess_request_attachments_direction` (`direction`),
  KEY `fk_ess_request_attachments_uploader` (`uploaded_by_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ess_request_routings`
--

CREATE TABLE IF NOT EXISTS `ess_request_routings` (
  `ess_request_routing_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `ess_request_id` bigint(20) UNSIGNED NOT NULL,
  `leg` smallint(5) UNSIGNED NOT NULL DEFAULT 1,
  `from_module` varchar(40) DEFAULT NULL,
  `to_module` varchar(40) DEFAULT NULL,
  `action` varchar(20) NOT NULL,
  `actor_user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `note` text DEFAULT NULL,
  `result_payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`result_payload`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`ess_request_routing_id`),
  KEY `idx_ess_request_routings_request_leg` (`ess_request_id`,`leg`),
  KEY `idx_ess_request_routings_module_action` (`to_module`,`action`),
  KEY `fk_ess_request_routings_actor` (`actor_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ess_request_status_histories`
--

CREATE TABLE IF NOT EXISTS `ess_request_status_histories` (
  `ess_request_status_history_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `ess_request_id` bigint(20) UNSIGNED NOT NULL,
  `status` varchar(30) NOT NULL,
  `actor_user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `note` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`ess_request_status_history_id`),
  KEY `idx_ess_request_status_histories_request_id` (`ess_request_id`),
  KEY `idx_ess_request_status_histories_status` (`status`),
  KEY `fk_ess_request_status_histories_actor` (`actor_user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `ess_request_status_histories`
--

INSERT INTO `ess_request_status_histories` (`ess_request_status_history_id`, `ess_request_id`, `status`, `actor_user_id`, `note`, `created_at`) VALUES
(1, 8, 'Pending', 4, 'Request filed by employee.', '2026-10-20 16:28:18');

-- --------------------------------------------------------

--
-- Table structure for table `facilities`
--

CREATE TABLE IF NOT EXISTS `facilities` (
  `facility_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(120) NOT NULL,
  `type` varchar(20) NOT NULL,
  `location` varchar(190) DEFAULT NULL,
  `capacity` int(10) UNSIGNED NOT NULL DEFAULT 1,
  `icon` varchar(60) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`facility_id`),
  UNIQUE KEY `facilities_name_unique` (`name`),
  KEY `idx_facilities_type` (`type`),
  KEY `idx_facilities_is_active` (`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `facilities`
--

INSERT INTO `facilities` (`facility_id`, `name`, `type`, `location`, `capacity`, `icon`, `description`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Room 1', 'On-site', 'Oxford Suites Makati, HR Office, 3rd Floor', 1, 'room', 'Primary on-site interview room with guest-facing setup.', 1, '2026-10-18 09:06:12', '2026-10-18 09:06:12'),
(2, 'Room 2', 'On-site', 'Oxford Suites Makati, HR Office, 3rd Floor', 1, 'room', 'Secondary on-site interview room for panel interviews.', 1, '2026-10-18 09:06:12', '2026-10-18 09:06:12'),
(3, 'Room 3', 'On-site', 'Oxford Suites Makati, HR Office, 3rd Floor', 2, 'room', 'Practical demonstration room for hands-on assessments.', 1, '2026-10-18 09:06:12', '2026-10-18 09:06:12'),
(4, 'Online Interview', 'Virtual', 'meet.oxfordsuites.ph/interview-room', 5, 'online', 'Virtual interview room hosted on the company meeting platform.', 1, '2026-10-18 09:06:12', '2026-10-18 09:06:12');

-- --------------------------------------------------------

--
-- Table structure for table `final_evaluations`
--

CREATE TABLE IF NOT EXISTS `final_evaluations` (
  `final_evaluation_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `applicant_id` bigint(20) UNSIGNED NOT NULL,
  `evaluated_by_user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `evaluation_date` date NOT NULL,
  `screening_score` decimal(5,2) DEFAULT NULL,
  `screening_status` varchar(40) DEFAULT NULL,
  `interview_score` decimal(5,2) DEFAULT NULL,
  `interview_result` varchar(10) DEFAULT NULL,
  `assessment_test_score` decimal(5,2) DEFAULT NULL,
  `assessment_test_result` varchar(10) DEFAULT NULL,
  `practical_required` tinyint(1) NOT NULL DEFAULT 0,
  `practical_test_score` decimal(5,2) DEFAULT NULL,
  `practical_test_result` varchar(10) DEFAULT NULL,
  `overall_score` decimal(5,2) DEFAULT NULL,
  `score_breakdown_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`score_breakdown_json`)),
  `recommendation` varchar(30) NOT NULL,
  `recommended_job_post_id` bigint(20) UNSIGNED DEFAULT NULL,
  `recommended_position_title` varchar(190) DEFAULT NULL,
  `overall_remarks` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`final_evaluation_id`),
  UNIQUE KEY `uq_final_evaluations_applicant_id` (`applicant_id`),
  KEY `idx_final_evaluations_evaluated_by` (`evaluated_by_user_id`),
  KEY `idx_final_evaluations_evaluation_date` (`evaluation_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `hr3_recommendations`
--

CREATE TABLE IF NOT EXISTS `hr3_recommendations` (
  `recommendation_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `employee_id` bigint(20) UNSIGNED NOT NULL,
  `promotion_request_id` bigint(20) UNSIGNED DEFAULT NULL,
  `recommendation_type` varchar(40) NOT NULL,
  `evaluation_score` decimal(5,2) DEFAULT NULL,
  `evaluator_user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `date_submitted` date NOT NULL,
  `status` varchar(40) NOT NULL,
  `suggested_position_id` bigint(20) UNSIGNED DEFAULT NULL,
  `suggested_salary_grade_id` bigint(20) UNSIGNED DEFAULT NULL,
  `current_employment_type` varchar(30) DEFAULT NULL,
  `comments` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`recommendation_id`),
  KEY `idx_hr3_recommendations_employee_id` (`employee_id`),
  KEY `idx_hr3_recommendations_evaluator_user_id` (`evaluator_user_id`),
  KEY `idx_hr3_recommendations_suggested_position_id` (`suggested_position_id`),
  KEY `idx_hr3_recommendations_suggested_salary_grade_id` (`suggested_salary_grade_id`),
  KEY `idx_hr3_rec_promo_req` (`promotion_request_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `hr3_recommendations`
--

INSERT INTO `hr3_recommendations` (`recommendation_id`, `employee_id`, `promotion_request_id`, `recommendation_type`, `evaluation_score`, `evaluator_user_id`, `date_submitted`, `status`, `suggested_position_id`, `suggested_salary_grade_id`, `current_employment_type`, `comments`, `created_at`, `updated_at`) VALUES
(1, 4, NULL, 'Regularization', 94.80, 3, '2026-08-01', 'Pending HR Action', 2, 4, 'Probationary', 'Exceeded guest satisfaction metrics during 6-month evaluation window. Highly recommended for full regularization.', '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(2, 5, NULL, 'Regularization', 91.20, NULL, '2026-07-28', 'Pending HR Action', 5, 2, 'Probationary', 'Punctual, excellent culinary prep speed and kitchen hygiene compliance. Recommended for regularization.', '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(3, 6, NULL, 'Promotion', 96.50, NULL, '2026-08-03', 'Pending HR Action', NULL, 4, 'Regular', 'Demonstrated strong leadership during banquet events. Passed succession planning assessment with distinction.', '2026-10-18 09:06:13', '2026-10-18 09:06:13');

-- --------------------------------------------------------

--
-- Table structure for table `interviews`
--

CREATE TABLE IF NOT EXISTS `interviews` (
  `interview_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `interview_code` varchar(40) NOT NULL,
  `applicant_id` bigint(20) UNSIGNED NOT NULL,
  `scheduled_date` date NOT NULL,
  `scheduled_time` time NOT NULL,
  `scheduled_end_time` time DEFAULT NULL,
  `mode` varchar(20) NOT NULL,
  `facility_id` bigint(20) UNSIGNED DEFAULT NULL,
  `facility_status` varchar(40) DEFAULT 'Not Required',
  `interviewer_employee_id` bigint(20) UNSIGNED DEFAULT NULL,
  `interviewer_name` varchar(160) DEFAULT NULL,
  `zoom_meeting_id` varchar(64) DEFAULT NULL,
  `zoom_join_url` text DEFAULT NULL,
  `zoom_continue_url` text DEFAULT NULL,
  `zoom_password` varchar(64) DEFAULT NULL,
  `status` varchar(20) NOT NULL,
  `interview_notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`interview_id`),
  UNIQUE KEY `interviews_interview_code_unique` (`interview_code`),
  KEY `idx_interviews_applicant_id` (`applicant_id`),
  KEY `idx_interviews_interviewer_employee_id` (`interviewer_employee_id`),
  KEY `idx_interviews_scheduled_date` (`scheduled_date`),
  KEY `idx_interviews_facility_id` (`facility_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `interviews`
--

INSERT INTO `interviews` (`interview_id`, `interview_code`, `applicant_id`, `scheduled_date`, `scheduled_time`, `scheduled_end_time`, `mode`, `facility_id`, `facility_status`, `interviewer_employee_id`, `interviewer_name`, `zoom_meeting_id`, `zoom_join_url`, `zoom_continue_url`, `zoom_password`, `status`, `interview_notes`, `created_at`, `updated_at`) VALUES
(1, 'INT-201', 10, '2026-07-28', '09:00:00', NULL, 'On-site', NULL, 'Not Required', 1, 'Ana Ramos', NULL, NULL, NULL, NULL, 'Scheduled', NULL, '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(2, 'INT-202', 2, '2026-07-28', '13:30:00', NULL, 'Virtual', NULL, 'Not Required', 7, 'Juan Dela Cruz', NULL, NULL, NULL, NULL, 'Scheduled', NULL, '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(3, 'INT-203', 4, '2026-07-29', '16:00:00', NULL, 'On-site', NULL, 'Not Required', 2, 'Chef Gabriel Mendoza', NULL, NULL, NULL, NULL, 'Scheduled', NULL, '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(4, 'INT-204', 5, '2026-07-30', '10:00:00', NULL, 'On-site', NULL, 'Not Required', 2, 'Chef Gabriel Mendoza', NULL, NULL, NULL, NULL, 'Completed', NULL, '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(5, 'INT-205', 9, '2026-07-31', '14:00:00', NULL, 'On-site', NULL, 'Not Required', 1, 'Ana Ramos', NULL, NULL, NULL, NULL, 'Scheduled', NULL, '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(6, 'INT-00206', 7, '2026-10-21', '15:00:00', '18:30:00', 'On-site', 1, 'Facility Approved', NULL, 'Lourdes Bautista', NULL, NULL, NULL, NULL, 'Scheduled', NULL, '2026-10-20 23:16:22', '2026-10-20 23:17:51'),
(7, 'INT-00207', 8, '2026-10-21', '15:00:00', '18:30:00', 'Virtual', NULL, 'Not Required', NULL, 'Ana Ramos', '95766371885', CONCAT('https://zoom.us/j/95766371885',CHAR(63),'pwd=SU5ULTAwMjA3OkVTRVRqOQ'), CONCAT('https://zoom.us/j/95766371885',CHAR(63),'pwd=SU5ULTAwMjA3OkVTRVRqOQ&continue=1#rejoin'), 'ESETj9', 'Scheduled', NULL, '2026-10-20 23:17:22', '2026-10-20 23:17:22');

-- --------------------------------------------------------

--
-- Table structure for table `job_posts`
--

CREATE TABLE IF NOT EXISTS `job_posts` (
  `job_post_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `slug` varchar(120) NOT NULL,
  `title` varchar(150) NOT NULL,
  `department_id` bigint(20) UNSIGNED NOT NULL,
  `position_id` bigint(20) UNSIGNED NOT NULL,
  `employment_type` varchar(30) NOT NULL,
  `schedule` varchar(120) DEFAULT NULL,
  `salary_min` decimal(12,2) DEFAULT NULL,
  `salary_max` decimal(12,2) DEFAULT NULL,
  `vacancies` int(11) NOT NULL DEFAULT 1,
  `filled_count` int(11) NOT NULL DEFAULT 0,
  `posted_date` date DEFAULT NULL,
  `status` varchar(20) NOT NULL,
  `requires_practical` tinyint(1) NOT NULL DEFAULT 0,
  `requires_assessment` tinyint(1) NOT NULL DEFAULT 0,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `experience_level` varchar(50) DEFAULT NULL,
  `experience_levels` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`experience_levels`)),
  `education_level` varchar(100) DEFAULT NULL,
  `education_levels` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`education_levels`)),
  `summary` text DEFAULT NULL,
  `description` text DEFAULT NULL,
  `responsibilities_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`responsibilities_json`)),
  `qualifications_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`qualifications_json`)),
  `skills_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`skills_json`)),
  `additional_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`additional_json`)),
  `instructions` text DEFAULT NULL,
  `about` text DEFAULT NULL,
  `picture` varchar(255) DEFAULT NULL,
  `blocks_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`blocks_json`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`job_post_id`),
  UNIQUE KEY `job_posts_slug_unique` (`slug`),
  KEY `idx_job_posts_department_id` (`department_id`),
  KEY `idx_job_posts_position_id` (`position_id`),
  KEY `idx_job_posts_status_active` (`status`,`active`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `job_posts`
--

INSERT INTO `job_posts` (`job_post_id`, `slug`, `title`, `department_id`, `position_id`, `employment_type`, `schedule`, `salary_min`, `salary_max`, `vacancies`, `filled_count`, `posted_date`, `status`, `requires_practical`, `requires_assessment`, `active`, `experience_level`, `experience_levels`, `education_level`, `education_levels`, `summary`, `description`, `responsibilities_json`, `qualifications_json`, `skills_json`, `additional_json`, `instructions`, `about`, `picture`, `blocks_json`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'front-desk-receptionist', 'Front Desk Receptionist', 1, 1, 'Full-time', 'Shifting Schedule', 18000.00, 22000.00, 3, 1, '2026-05-22', 'Open', 0, 0, 1, '1-2 Years', NULL, 'Bachelor\'s Degree', NULL, 'Welcome guests, manage reservations, answer inquiries, and provide excellent customer service.', 'We are looking for a friendly and professional Front Desk Receptionist to welcome guests, manage reservations, answer inquiries, and provide excellent customer service. The ideal candidate should have strong communication skills and be able to work in a fast-paced environment.', '[\"Welcome and assist hotel guests.\",\"Process check-in and check-out procedures.\",\"Manage room reservations.\",\"Handle guest inquiries and complaints professionally.\",\"Coordinate with housekeeping and other departments.\",\"Answer phone calls and emails.\"]', '[\"Bachelor\'s degree or College level in Hospitality Management or related field.\",\"Excellent communication and interpersonal skills.\",\"Basic computer skills.\",\"Customer service experience is an advantage.\",\"Willing to work shifts, weekends, and holidays.\"]', '[\"Customer Service\",\"Communication\",\"Hotel Operations\",\"Problem Solving\",\"Time Management\"]', NULL, NULL, NULL, NULL, NULL, '2026-10-18 09:06:13', '2026-10-18 09:06:13', NULL),
(2, 'line-cook', 'Line Cook', 3, 5, 'Full-time', 'Shifting Schedule', 18000.00, 22000.00, 9, 2, '2026-05-18', 'Open', 0, 0, 1, '1-2 Years', '[\"1-2 Years\"]', 'Vocational / TESDA', '[\"Vocational \\/ TESDA\"]', 'Oxford Suites Makati is seeking a dedicated Line Cook to join our dynamic Culinary team on a full-time basis. You will prepare exceptional dishes while demonstrating warm Filipino hospitality in our premier all-suite hotel. We currently have 9 vacancies available for passionate culinary professionals ready to elevate our guest dining experiences.', 'Oxford Suites Makati is seeking a dedicated Line Cook to join our dynamic Culinary team on a full-time basis. You will prepare exceptional dishes while demonstrating warm Filipino hospitality in our premier all-suite hotel. We currently have 9 vacancies available for passionate culinary professionals ready to elevate our guest dining experiences.', '[\"Prepare mise en place before each service.\",\"Cook and plate dishes to recipe standards.\",\"Maintain sanitation and food-safety compliance.\",\"Monitor inventory levels of station ingredients.\",\"Support banquet and room-service volume peaks.\",\"Execute daily food preparation and efficient mise en place across hot kitchen stations\",\"Apply exceptional Knife Skills to prep fresh ingredients according to recipe standards\",\"Ensure strict compliance with Food Safety and HACCP guidelines during all food handling\",\"Execute precise Plating for ala carte dining, room service, and banquet events\",\"Demonstrate strong Teamwork with kitchen and service staff during peak operations\",\"Maintain high standards of cleanliness, sanitation, and safety compliance in the kitchen\"]', '[\"TESDA NC II in Cookery or equivalent culinary training.\",\"At least 1 year in a hotel or full-service restaurant kitchen.\",\"Valid food handler\'s certificate.\",\"Able to work under pressure during peak service.\",\"Completed Vocational \\/ TESDA education with a valid TESDA Cookery NC II certification\",\"Minimum of 1-2 Years of hands-on hotel or restaurant kitchen experience\",\"Certified with a valid Food Handler Certificate and HACCP Awareness Training\",\"Proficient in Food Safety protocols, Knife Skills, Plating, and Hot Kitchen operations\",\"Possesses strong interpersonal skills and proven ability to foster Teamwork in a fast-paced environment\",\"HACCP Awareness Training\"]', '[\"Food Safety\",\"HACCP\",\"Knife Skills\",\"Plating\",\"Teamwork\"]', '[\"Willing to work on a shifting schedule to support 24\\/7 hotel culinary operations\",\"Competitive salary package with service charge and comprehensive medical benefits\",\"Duty meals provided daily at the employee cafeteria along with uniform maintenance\",\"Opportunities for continuous professional development and career advancement\"]', 'Please send your updated resume through this job posting or walk in directly at the HR Office, Oxford Suites Makati.', 'Oxford Suites Makati is a premier all-suite hotel located in the heart of Makati\'s bustling business district, renowned for delivering heartfelt and warm Filipino hospitality.', NULL, '[\"title\",\"info\",\"skills\",\"description\",\"responsibilities\",\"qualifications\",\"additional\",\"instructions\",\"about\",\"picture\"]', '2026-10-18 09:06:13', '2026-10-20 23:19:52', NULL),
(3, 'housekeeping-attendant', 'Housekeeping Attendant', 4, 7, 'Full-time', 'Shifting Schedule', 14000.00, 17000.00, 5, 3, '2026-05-10', 'Open', 0, 0, 1, 'No Experience', NULL, 'High School Graduate', NULL, 'Maintain guestroom cleanliness, linen turnover, and public-area presentation to brand standards.', 'Housekeeping Attendants keep guestrooms and public areas immaculate, restock amenities, and report maintenance issues. Full training is provided for applicants with no prior hotel experience.', '[\"Clean and prepare assigned guestrooms daily.\",\"Replenish linens, towels, and amenities.\",\"Report maintenance and lost-and-found items.\",\"Maintain housekeeping cart and supplies.\"]', '[\"High School Graduate.\",\"Physically fit and detail-oriented.\",\"Willing to work shifts including weekends and holidays.\"]', '[\"Attention to Detail\",\"Time Management\",\"Room Turnover\",\"Safety\"]', NULL, NULL, NULL, NULL, NULL, '2026-10-18 09:06:13', '2026-10-18 09:06:13', NULL),
(4, 'restaurant-server', 'Restaurant Server', 2, 3, 'Full-time', 'Shifting Schedule', 15000.00, 18000.00, 4, 1, '2026-05-20', 'Open', 0, 0, 1, 'No Experience', NULL, 'High School Graduate', NULL, 'Deliver warm, accurate table service across the dining room and banquet operations.', 'Restaurant Servers take orders, serve food and beverages, and ensure every guest leaves with a memorable dining experience at our all-day dining outlet.', '[\"Greet and seat guests warmly.\",\"Take and relay orders accurately to the kitchen.\",\"Serve food and beverages following service sequence.\",\"Handle billing and guest feedback.\"]', '[\"High School Graduate; hospitality training an advantage.\",\"Good communication skills in English and Filipino.\",\"Pleasant personality and grooming.\"]', '[\"Guest Service\",\"Upselling\",\"POS Systems\",\"Communication\"]', NULL, NULL, NULL, NULL, NULL, '2026-10-18 09:06:13', '2026-10-18 09:06:13', NULL),
(5, 'bartender', 'Bartender', 2, 4, 'Part-time', 'Night Shift', 16000.00, 19000.00, 2, 0, '2026-05-15', 'Open', 0, 0, 1, '3-5 Years', NULL, 'Vocational / TESDA', NULL, 'Craft classic and signature cocktails for the lobby lounge and rooftop bar.', 'The Bartender prepares beverages to recipe, manages bar inventory, and creates a lively yet refined guest experience at the lounge.', '[\"Prepare cocktails and beverages to standard.\",\"Maintain bar cleanliness and inventory.\",\"Engage guests and recommend pairings.\",\"Observe responsible alcohol service.\"]', '[\"TESDA Bartending NC II or equivalent.\",\"At least 3 years bar experience in hotels or restaurants.\",\"Knowledge of classic and modern mixology.\"]', '[\"Mixology\",\"Inventory Control\",\"Guest Engagement\",\"Cash Handling\"]', NULL, NULL, NULL, NULL, NULL, '2026-10-18 09:06:13', '2026-10-18 09:06:13', NULL),
(6, 'hr-assistant', 'HR Assistant', 5, 8, 'Full-time', 'Day Shift', 20000.00, 25000.00, 1, 0, '2026-05-08', 'Open', 0, 0, 0, '1-2 Years', NULL, 'Bachelor\'s Degree', NULL, 'Support recruitment, employee records, and HR document processing.', 'The HR Assistant supports end-to-end recruitment coordination, 201-file maintenance, and employee request processing for the property.', '[\"Coordinate interview schedules with department heads.\",\"Maintain complete and accurate 201 files.\",\"Process COE and employment verification requests.\",\"Assist in new-hire onboarding documentation.\"]', '[\"Bachelor\'s degree in Psychology, HR, or related field.\",\"At least 1 year HR experience.\",\"Strong organizational and documentation skills.\"]', '[\"Recruitment\",\"Documentation\",\"MS Office\",\"Confidentiality\"]', NULL, NULL, NULL, NULL, NULL, '2026-10-18 09:06:13', '2026-10-18 09:06:13', NULL),
(7, 'security-officer', 'Security Officer', 6, 18, 'Full-time', 'Shifting Schedule', 16000.00, 19000.00, 2, 0, '2026-05-25', 'Open', 0, 0, 1, '1-2 Years', NULL, 'High School Graduate', NULL, 'Guard guest floors, lobby posts, and CCTV monitoring on rotating shifts.', 'Security Officers keep guests, staff, and property safe through roving patrols, access control, and incident reporting across the hotel premises.', '[\"Conduct roving patrols of guest floors and back-of-house.\",\"Enforce access control at lobby and service entrances.\",\"Respond to incidents and prepare blotter reports.\",\"Coordinate with Engineering on safety hazards.\"]', '[\"High School Graduate; security license (SOSIA) required.\",\"At least 1 year hotel or commercial security experience.\",\"Physically fit and willing to work shifting schedules.\"]', '[\"Access Control\",\"Patrol\",\"Incident Reporting\",\"CCTV\"]', NULL, NULL, NULL, NULL, NULL, '2026-10-18 09:06:13', '2026-10-18 09:06:13', NULL),
(8, 'spa-therapist', 'Spa Therapist', 7, 20, 'Full-time', 'Shifting Schedule', 18000.00, 23000.00, 2, 0, '2026-05-26', 'Open', 0, 0, 1, '1-2 Years', NULL, 'Vocational / TESDA', NULL, 'Deliver signature massages and wellness treatments to hotel and walk-in guests.', 'Spa Therapists perform Filipino hilot, Swedish, and aromatherapy treatments while upselling wellness packages at the Oxford Suites spa.', '[\"Perform massage and body treatments to standard protocols.\",\"Prepare treatment rooms and sterilize tools.\",\"Recommend wellness packages to guests.\",\"Maintain guest treatment records.\"]', '[\"TESDA NC II in Massage Therapy or equivalent.\",\"At least 1 year spa experience; hotel spa an advantage.\",\"Warm guest-handling skills.\"]', '[\"Hilot\",\"Swedish Massage\",\"Guest Care\",\"Upselling\"]', NULL, NULL, NULL, NULL, NULL, '2026-10-18 09:06:13', '2026-10-18 09:06:13', NULL),
(9, 'accounting-assistant', 'Accounting Assistant', 8, 22, 'Full-time', 'Day Shift', 19000.00, 24000.00, 1, 0, '2026-05-27', 'Open', 0, 0, 1, '1-2 Years', NULL, 'Bachelor\'s Degree', NULL, 'Handle payables, receivables encoding, and month-end supporting schedules.', 'The Accounting Assistant supports the Finance Officer with AP/AR encoding, receipt audits from Front Office and F&B outlets, and BIR-ready documentation.', '[\"Encode supplier invoices and outlet remittances.\",\"Reconcile daily revenue reports from Front Office and F&B.\",\"Prepare BIR supporting schedules.\",\"Assist in month-end close.\"]', '[\"Bachelor\'s degree in Accountancy or related field.\",\"At least 1 year accounting experience.\",\"Proficient in MS Excel.\"]', '[\"Bookkeeping\",\"Reconciliation\",\"MS Excel\",\"Attention to Detail\"]', NULL, NULL, NULL, NULL, NULL, '2026-10-18 09:06:13', '2026-10-18 09:06:13', NULL),
(10, 'maintenance-technician', 'Maintenance Technician', 9, 24, 'Full-time', 'Shifting Schedule', 17000.00, 21000.00, 2, 0, '2026-05-28', 'Open', 0, 0, 1, '1-2 Years', NULL, 'Vocational / TESDA', NULL, 'Perform preventive maintenance on guestrooms, kitchen equipment, and facilities.', 'Maintenance Technicians respond to housekeeping and front-office work orders, repair plumbing, HVAC, and electrical faults across the property.', '[\"Respond to guestroom and public-area work orders.\",\"Perform preventive maintenance on HVAC and kitchen equipment.\",\"Troubleshoot minor plumbing and electrical faults.\",\"Log completed work in the facilities tracker.\"]', '[\"TESDA NC II in Electrical, Refrigeration, or equivalent.\",\"At least 1 year hotel or building maintenance experience.\",\"Willing to be on-call for emergencies.\"]', '[\"HVAC\",\"Plumbing\",\"Electrical\",\"Preventive Maintenance\"]', NULL, NULL, NULL, NULL, NULL, '2026-10-18 09:06:13', '2026-10-18 09:06:13', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `job_post_platforms`
--

CREATE TABLE IF NOT EXISTS `job_post_platforms` (
  `job_post_platform_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `job_post_id` bigint(20) UNSIGNED NOT NULL,
  `platform` varchar(60) NOT NULL,
  `published_at` timestamp NULL DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'published',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`job_post_platform_id`),
  UNIQUE KEY `uq_job_post_platforms_natural` (`job_post_id`,`platform`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `job_post_platforms`
--

INSERT INTO `job_post_platforms` (`job_post_platform_id`, `job_post_id`, `platform`, `published_at`, `status`, `created_at`) VALUES
(1, 1, 'Website', '2026-05-22 00:00:00', 'published', '2026-10-18 09:06:13'),
(2, 1, 'Facebook', '2026-05-22 00:15:00', 'published', '2026-10-18 09:06:13'),
(3, 1, 'Indeed', '2026-05-22 01:00:00', 'published', '2026-10-18 09:06:13'),
(4, 2, 'Website', '2026-10-20 23:19:52', 'published', '2026-10-18 09:06:13'),
(5, 2, 'Indeed', '2026-05-18 01:30:00', 'unpublished', '2026-10-18 09:06:13'),
(6, 3, 'Website', '2026-05-10 00:00:00', 'published', '2026-10-18 09:06:13'),
(7, 3, 'Facebook', '2026-05-10 00:20:00', 'published', '2026-10-18 09:06:13'),
(8, 4, 'Website', '2026-05-20 00:00:00', 'published', '2026-10-18 09:06:13'),
(9, 4, 'Facebook', '2026-05-20 00:30:00', 'published', '2026-10-18 09:06:13'),
(10, 4, 'Instagram', '2026-05-20 01:00:00', 'published', '2026-10-18 09:06:13'),
(11, 5, 'Website', '2026-05-15 00:00:00', 'published', '2026-10-18 09:06:13'),
(12, 5, 'Instagram', '2026-05-15 00:45:00', 'published', '2026-10-18 09:06:13'),
(13, 6, 'Website', '2026-05-08 00:00:00', 'published', '2026-10-18 09:06:13'),
(14, 6, 'Indeed', '2026-05-08 01:15:00', 'published', '2026-10-18 09:06:13'),
(15, 7, 'Website', '2026-05-25 00:00:00', 'published', '2026-10-18 09:06:13'),
(16, 7, 'Facebook', '2026-05-25 00:20:00', 'published', '2026-10-18 09:06:13'),
(17, 8, 'Website', '2026-05-26 00:00:00', 'published', '2026-10-18 09:06:13'),
(18, 8, 'Facebook', '2026-05-26 00:30:00', 'published', '2026-10-18 09:06:13'),
(19, 9, 'Website', '2026-05-27 00:00:00', 'published', '2026-10-18 09:06:13'),
(20, 9, 'Indeed', '2026-05-27 01:00:00', 'published', '2026-10-18 09:06:13'),
(21, 10, 'Website', '2026-05-28 00:00:00', 'published', '2026-10-18 09:06:13'),
(22, 10, 'Indeed', '2026-05-28 01:15:00', 'published', '2026-10-18 09:06:13');

-- --------------------------------------------------------

--
-- Table structure for table `learning_courses`
--

CREATE TABLE IF NOT EXISTS `learning_courses` (
  `course_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `course_code` varchar(40) NOT NULL,
  `title` varchar(200) NOT NULL,
  `category` varchar(120) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `content_text` longtext DEFAULT NULL,
  `material_path` varchar(255) DEFAULT NULL,
  `quiz_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`quiz_json`)),
  `quiz_generated_at` timestamp NULL DEFAULT NULL,
  `estimated_reading_minutes` smallint(5) UNSIGNED DEFAULT NULL,
  `estimated_pages` smallint(5) UNSIGNED DEFAULT NULL,
  `mandatory` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`course_id`),
  UNIQUE KEY `learning_courses_course_code_unique` (`course_code`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `learning_courses`
--

INSERT INTO `learning_courses` (`course_id`, `course_code`, `title`, `category`, `description`, `content_text`, `material_path`, `quiz_json`, `quiz_generated_at`, `estimated_reading_minutes`, `estimated_pages`, `mandatory`, `created_at`, `updated_at`) VALUES
(1, 'LMS-101', 'Food Safety & Sanitation Level 2', 'Culinary & Safety', 'HACCP-based food safety and sanitation practices for kitchen staff.', '# Food Safety & Sanitation — Level 2\n\n## 1. Why food safety matters\nFoodborne illness is preventable. Every team member is personally responsible for the\nsafety of the food we serve. A single lapse can cause guest illness, damage our reputation\nand put the property\'s licence at risk.\n\n## 2. Personal hygiene\n- Wash hands thoroughly with soap and warm water for at least 20 seconds.\n- Wash hands after using the restroom, handling raw meat, sneezing, or touching your face.\n- Keep fingernails short and clean. Do not wear nail polish or false nails in the kitchen.\n- Report any illness (vomiting, diarrhoea, fever, jaundice) to your supervisor immediately\n  and do not handle food.\n- Wear a clean uniform and keep hair restrained under a hat or hairnet.\n\n## 3. The temperature danger zone\nBacteria multiply fastest between 5 degrees Celsius (41 degrees Fahrenheit) and\n60 degrees Celsius (140 degrees Fahrenheit). Keep food out of this range.\n- Cold holding: 4 degrees Celsius (40 degrees Fahrenheit) or colder.\n- Hot holding: 60 degrees Celsius (140 degrees Fahrenheit) or hotter.\n- Refrigerators: 4 degrees Celsius (40 degrees Fahrenheit) or below.\n- Freezers: minus 18 degrees Celsius (0 degrees Fahrenheit) or below.\n- Reheating leftovers: heat to 74 degrees Celsius (165 degrees Fahrenheit) for at least 15 seconds.\n- The two-hour rule: food left in the danger zone for more than two hours must be discarded.\n\n## 4. Avoiding cross-contamination\n- Use separate cutting boards: one colour for raw meat, another for ready-to-eat food.\n- Never store raw meat above ready-to-eat food in the refrigerator.\n- Sanitise work surfaces, knives and utensils between tasks.\n- Change gloves and wash hands when moving from raw to ready-to-eat food.\n\n## 5. Receiving and storage\n- Inspect deliveries for temperature, packaging and expiry before accepting.\n- Reject any chilled item delivered above 4 degrees Celsius.\n- Apply FIFO (First In, First Out): store older stock in front, newer stock behind.\n- Label and date all prepared food; use within the marked shelf life.\n- Keep dry stores cool, dry and off the floor.\n\n## 6. Cleaning and sanitising\n- Cleaning removes dirt; sanitising reduces bacteria to safe levels. Do both.\n- Use the three-compartment sink method: wash, rinse, then sanitise.\n- Sanitiser must be mixed to the correct concentration; follow the label.\n- Clean as you go, and complete a full cleaning schedule at the end of every shift.\n\n## 7. HACCP in practice\nHazard Analysis and Critical Control Points (HACCP) is our food-safety system.\n- Identify hazards at each step of the flow of food.\n- Set critical limits (for example, cooking temperatures).\n- Monitor, record and correct any deviation.\n- Keep accurate temperature and cleaning logs — they are legal records.\n\n## 8. Allergen awareness\nThe fourteen major allergens include peanuts, tree nuts, milk, eggs, fish, shellfish,\nsoy, wheat and sesame. Always confirm allergens with the guest and never guess.\nPrevent cross-contact by using dedicated utensils and surfaces.\n\n## 9. Pest control\n- Keep bins covered and emptied regularly.\n- Report any signs of pests (droppings, gnaw marks, insects) to your supervisor at once.\n- Never store food on the floor, and fix leaks promptly to remove water sources.\n\n## 10. Your role\nFollow every procedure, complete your logs honestly, and speak up if something looks\nunsafe. When in doubt, throw it out.', NULL, CONCAT('{\"pass_mark\":80,\"time_limit_seconds\":600,\"generated_by\":\"groq\",\"questions\":[{\"id\":1,\"question\":\"How long should you wash your hands with soap and warm water',CHAR(63),'\",\"options\":[\"10 seconds\",\"20 seconds\",\"30 seconds\",\"60 seconds\"],\"correct_index\":1,\"explanation\":\"20 seconds ensures effective removal of microbes.\"},{\"id\":2,\"question\":\"At what temperature range do bacteria multiply fastest',CHAR(63),'\",\"options\":[\"0-4 \\u00b0C\",\"5-60 \\u00b0C\",\"61-74 \\u00b0C\",\">140 \\u00b0F\"],\"correct_index\":1,\"explanation\":\"Bacteria grow rapidly between 5 and 60 \\u00b0C.\"},{\"id\":3,\"question\":\"When reheating leftovers, to what temperature and for how long should you heat them',CHAR(63),'\",\"options\":[\"60 \\u00b0C for 30 seconds\",\"74 \\u00b0C for 15 seconds\",\"80 \\u00b0C for 5 seconds\",\"90 \\u00b0C for 20 seconds\"],\"correct_index\":1,\"explanation\":\"74\\u202f\\u00b0C for at least 15\\u202fs kills pathogens.\"},{\"id\":4,\"question\":\"If food sits in the danger zone for longer than how many hours',CHAR(63),'\",\"options\":[\"1 hour\",\"2 hours\",\"3 hours\",\"4 hours\"],\"correct_index\":1,\"explanation\":\"Food over two hours in the danger zone must be discarded.\"},{\"id\":5,\"question\":\"Which practice prevents cross\\u2011contamination of raw meat',CHAR(63),'\",\"options\":[\"Use a single cutting board for all items\",\"Use separate cutting boards for raw meat and ready\\u2011to\\u2011eat food\",\"Use the same board but wash it\",\"Use separate knives only\"],\"correct_index\":1,\"explanation\":\"Color\\u2011coded boards keep raw meat separate.\"},{\"id\":6,\"question\":\"What action is required when a chilled delivery is above 4\\u202f\\u00b0C',CHAR(63),'\",\"options\":[\"Accept and re\\u2011chill\",\"Reject the item\",\"Label it for later use\",\"Ignore the temperature\"],\"correct_index\":1,\"explanation\":\"Items above 4\\u202f\\u00b0C should be rejected.\"},{\"id\":7,\"question\":\"When sanitising, what must you do with the sanitiser',CHAR(63),'\",\"options\":[\"Use any concentration\",\"Follow the label\\u2019s concentration\",\"Use only the strongest concentration\",\"Do not mix\"],\"correct_index\":1,\"explanation\":\"Correct concentration is specified on the label.\"},{\"id\":8,\"question\":\"What purpose do temperature and cleaning logs serve',CHAR(63),'\",\"options\":[\"Optional record\",\"Internal reference\",\"Legal records\",\"Management only\"],\"correct_index\":2,\"explanation\":\"Logs are legal records of food safety.\"},{\"id\":9,\"question\":\"Which of the following are among the fourteen major allergens',CHAR(63),'\",\"options\":[\"Peanuts, tree nuts, milk, eggs\",\"Peanuts, tree nuts, milk, fish\",\"Peanuts, fish, soy, wheat\",\"Peanuts, shellfish, sesame, eggs\"],\"correct_index\":0,\"explanation\":\"Those four are listed as major allergens.\"},{\"id\":10,\"question\":\"What is a correct pest\\u2011control action',CHAR(63),'\",\"options\":[\"Ignore small droppings\",\"Fix leaks promptly\",\"Store food on the floor\",\"Leave bins uncovered\"],\"correct_index\":1,\"explanation\":\"Fixing leaks removes water sources for pests.\"}]}'), '2026-10-18 01:33:47', NULL, NULL, 1, '2026-10-18 09:06:13', '2026-10-19 12:51:05'),
(2, 'LMS-102', 'Customer Excellence in Hospitality', 'Service Quality', 'Service standards and guest-excellence behaviors across guest-facing roles.', '# Customer Excellence in Hospitality\n\n## 1. The Oxford Suites service promise\nEvery guest should feel welcomed, valued and cared for. Service is not a department —\nit is everyone\'s job, in every interaction, every shift.\n\n## 2. First impressions\n- Greet every guest within 10 seconds and with a genuine smile.\n- Use the guest\'s name whenever you know it.\n- Make eye contact and keep a friendly, open posture.\n\n## 3. Anticipating needs\nGreat service means acting before the guest has to ask. Notice the small things:\na full bin, a guest looking for directions, a family needing a highchair.\n\n## 4. Handling complaints (LEARN)\n- Listen fully without interrupting.\n- Empathise and apologise sincerely for the experience.\n- Ask questions to understand exactly what happened.\n- Resolve or escalate quickly — own the problem.\n- Notify the right team and follow up to confirm the guest is satisfied.\n\n## 5. Communication standards\n- Answer the phone within three rings with a warm, professional greeting.\n- Never say \"that\'s not my department\"; instead say \"let me get the right person for you\".\n- Keep promises: if you say you will follow up, do it.\n\n## 6. Recovering a dissatisfied guest\nA recovered guest can become our most loyal. Empower staff to make small gestures of\ngoodwill within policy, and always close the loop with a manager.\n\n## 7. Teamwork\nCoordinate with housekeeping, kitchen and front office so the guest never sees our\ninternal seams. Escalate unsafe or unresolved issues to your supervisor.\n\n## 8. Measuring excellence\nWe track guest satisfaction scores, review feedback and repeat visits. Every positive\nguest comment reflects the whole team.', NULL, '{\"pass_mark\":80,\"time_limit_seconds\":600,\"generated_by\":\"fallback\",\"questions\":[{\"id\":1,\"question\":\"Fill in the blank: Greet every ________ within 10 seconds and with a genuine smile.\",\"options\":[\"service\",\"Excellence\",\"guest\",\"department\"],\"correct_index\":2,\"explanation\":\"The handbook states: \\\"Greet every guest within 10 seconds and with a genuine smile.\\\"\"},{\"id\":2,\"question\":\"Fill in the blank: Use the guest\'s name ________ you know it.\",\"options\":[\"Excellence\",\"department\",\"service\",\"whenever\"],\"correct_index\":3,\"explanation\":\"The handbook states: \\\"Use the guest\'s name whenever you know it.\\\"\"},{\"id\":3,\"question\":\"Fill in the blank: Make eye ________ and keep a friendly, open posture.\",\"options\":[\"department\",\"contact\",\"service\",\"Excellence\"],\"correct_index\":1,\"explanation\":\"The handbook states: \\\"Make eye contact and keep a friendly, open posture.\\\"\"},{\"id\":4,\"question\":\"Fill in the blank: ________ and apologise sincerely for the experience.\",\"options\":[\"Department\",\"Empathise\",\"Service\",\"Excellence\"],\"correct_index\":1,\"explanation\":\"The handbook states: \\\"Empathise and apologise sincerely for the experience.\\\"\"},{\"id\":5,\"question\":\"Fill in the blank: Ask ________ to understand exactly what happened.\",\"options\":[\"service\",\"Excellence\",\"department\",\"questions\"],\"correct_index\":3,\"explanation\":\"The handbook states: \\\"Ask questions to understand exactly what happened.\\\"\"},{\"id\":6,\"question\":\"Fill in the blank: Resolve or ________ quickly — own the problem.\",\"options\":[\"escalate\",\"department\",\"Excellence\",\"service\"],\"correct_index\":0,\"explanation\":\"The handbook states: \\\"Resolve or escalate quickly — own the problem.\\\"\"},{\"id\":7,\"question\":\"Fill in the blank: Notify the ________ team and follow up to confirm the guest is satisfied.\",\"options\":[\"service\",\"Excellence\",\"department\",\"right\"],\"correct_index\":3,\"explanation\":\"The handbook states: \\\"Notify the right team and follow up to confirm the guest is satisfied.\\\"\"},{\"id\":8,\"question\":\"Fill in the blank: ________ the phone within three rings with a warm, professional greeting.\",\"options\":[\"Answer\",\"Department\",\"Excellence\",\"Service\"],\"correct_index\":0,\"explanation\":\"The handbook states: \\\"Answer the phone within three rings with a warm, professional greeting.\\\"\"},{\"id\":9,\"question\":\"Fill in the blank: Never say \\\"that\'s not my ________\\\"; instead say \\\"let me get the right person for you\\\".\",\"options\":[\"department\",\"Excellence\",\"small\",\"service\"],\"correct_index\":0,\"explanation\":\"The handbook states: \\\"Never say \\\"that\'s not my department\\\"; instead say \\\"let me get the right person for you\\\".\\\"\"},{\"id\":10,\"question\":\"Fill in the blank: Keep promises: if you say you will ________ up, do it.\",\"options\":[\"follow\",\"service\",\"Excellence\",\"small\"],\"correct_index\":0,\"explanation\":\"The handbook states: \\\"Keep promises: if you say you will follow up, do it.\\\"\"}]}', '2026-10-19 15:09:58', 2, 1, 0, '2026-10-18 09:06:13', '2026-10-20 14:44:22');
INSERT INTO `learning_courses` (`course_id`, `course_code`, `title`, `category`, `description`, `content_text`, `material_path`, `quiz_json`, `quiz_generated_at`, `estimated_reading_minutes`, `estimated_pages`, `mandatory`, `created_at`, `updated_at`) VALUES
(3, 'LMS-103', 'Fire Safety & Emergency Response', 'Compliance', 'Fire prevention, evacuation procedures, and emergency response drills.', 'OXFORD SUITES HOTEL & RESIDENCES\nFire Safety\nand Emergency\nResponse\nHandbook for all colleagues,\ncontractors, and duty managers\nDOCUMENT CODE OS-HR-SAF-003\nREVISION 4.0\nEFFECTIVE DATE 01 October 2026\nOWNER Director of Engineering and Safety\nAPPROVED BY General Manager\nHuman Resources | Safety and Compliance Internal use only\nHow to use this handbook\nRead Sections 1 to 4 for the principles, Sections 5 to 9 for prevention, and Sections 10 to 14 for what to\ndo during an emergency. Appendices A to C are working tools: keep the checklists with your shift\npaperwork and confirm the assembly point during your first week.\nDocument control\nField Detail\nDocument title Fire Safety and Emergency Response Handbook\nDocument code OS-HR-SAF-003\nRevision 4.0\nEffective date 01 October 2026\nNext scheduled review 01 October 2027, or sooner after a significant incident\nDocument owner Director of Engineering and Safety\nApprover General Manager\nApplies to All colleagues, contractors, tenants, and on-site partners\nClassification Internal use only\nRevision history\nRev. Date Summary of change\n1.0 Mar 2019 Initial issue for the property opening.\n2.0 Aug 2021 Added kitchen suppression, PWD evacuation, and warden roles.\n3.0 Nov 2023 Aligned to RA 9514 and its IRR; added impairment fire watch.\n4.0 01 October 2026 Multi-page reference edition; revised roles matrix and checklists.\nControlled document notice\nThe electronic copy on the HR portal is the controlled version. Printed copies are uncontrolled unless\nstamped by the Safety Office. Do not amend this handbook locally; submit proposed changes to the\nSafety Office for the next revision.\n1. Purpose, scope, and policy\nThis handbook sets out how Oxford Suites protects guests, colleagues, contractors, and property from fire.\nIt explains how fires start, how to prevent them, how to respond in the first critical minutes, and how we\nevacuate and account for everyone.\n1.1 Purpose\nThe purpose of this handbook is to give every person on the property a clear, practical, and consistent set\nof instructions. It supports compliance with the Fire Code of the Philippines (RA 9514) and its implementing\nrules, the Occupational Safety and Health Standards, and the property\'s fire safety inspection certificate.\n1.2 Scope\nThis handbook applies to:\n• All employees, whether permanent, probationary, casual, or agency-supplied.\n• Contractors, vendors, entertainers, and event suppliers working on site.\n• Tenants and retail partners operating within the property.\n• Any guest or visitor present during an emergency, who must be guided and assisted.\n1.3 Policy statement\nNo operational task is so urgent that it overrides safety. Every colleague has the authority, and the duty, to\nstop an unsafe act, raise the alarm, and challenge unsafe work. Fire prevention is a condition of\nemployment and of doing business with the property.\n1.4 Life safety priorities\n1. Life safety of guests, colleagues, and responders.\n2. Protection of the property and continuity of operations.\n3. Protection of the environment and neighbouring premises.\n4. Preservation of records, evidence, and reputation.\n2. Definitions\nThe following terms are used throughout this handbook. Where a term is defined in RA 9514 or its IRR, that\ndefinition prevails.\nTerm Meaning\nAssembly area A designated safe location outside the building where evacuees report for roll call.\nFire warden A trained colleague responsible for sweeping an assigned area and guiding evacuation.\nFlash point The lowest temperature at which a liquid gives off enough vapour to ignite.\nHot work Any activity producing heat, sparks, or flame, such as welding, cutting, or grinding.\nImpairment A condition where a fire protection system is out of service or reduced in capability.\nPEEP Personal Emergency Evacuation Plan for a guest or colleague who needs assistance.\nRACE Recognise, Alarm, Contain, Evacuate - the emergency response sequence in Section 10.\nRefuge area A protected temporary holding area for people who cannot use stairs.\nRoll call The process of confirming that everyone expected at an assembly area is present.\nStage A temporary event structure, platform, or set that may introduce ignition or blocking risks.\n3. Regulatory and standards framework\nThe property maintains a fire safety program that meets or exceeds the following requirements. Where a\nlocal ordinance is stricter, the stricter requirement applies.\n3.1 Primary legislation and codes\n• RA 9514 - Fire Code of the Philippines and its Revised Implementing Rules and Regulations.\n• RA 11058 - Occupational Safety and Health Standards, including worker training and reporting\nduties.\n• Bureau of Fire Protection (BFP) permits, including the Fire Safety Inspection Certificate (FSIC).\n• Local government fire safety, building, and business permit conditions.\n• NFPA 10 and NFPA 101 as technical reference for extinguishers and means of egress.\n3.2 Property obligations\nObligation How the property complies\nValid FSIC Renewed annually; posted at the front office and filed with Engineering.\nFire safety practitioner A designated safety officer coordinates inspections, drills, and records.\nMeans of egress Exits, stairs, and corridors kept clear and unlocked during operating hours.\nDetection and suppression Systems maintained under contract and tested on a scheduled basis.\nTraining and drills Induction training plus at least two evacuation drills per year.\nReporting All fires and near misses reported to management and, where required, the BFP.\n3.3 Individual obligations\nEvery colleague must know the location of the two nearest exits, the nearest manual call point, the nearest\nextinguisher, and the assembly area for their shift. Ignorance of these four facts is not an acceptable\nexcuse during an emergency.\n4. Fire science: how fire starts and spreads\n4.1 The fire triangle\nFire needs three things: fuel, oxygen, and heat. Remove any one and the fire cannot start or continue.\nPrevention means keeping fuel and heat sources apart; response means removing one side of the triangle\nas quickly and safely as possible.\nSide Examples in a hotel How we remove it\nFuel Linen, paper, grease, gas, fuel oil, furnishings,\nwaste.\nHousekeeping, storage discipline, and shutdown\nprocedures.\nOxygen Air in corridors, guest rooms, ducts, and voids. Closing doors and using fire doors to limit air and\nsmoke spread.\nHeat Cooking, electrical faults, smoking, hot work,\nfriction.\nMaintenance, permits, and safe work practices.\n4.2 How heat travels\n• Conduction - heat passes through solid materials, such as a metal duct or structural beam.\n• Convection - hot gases and smoke rise and spread through stairwells, shafts, and ceilings.\n• Radiation - heat travels in straight lines and can ignite materials some distance away.\n• Direct contact - flame touches a combustible surface and ignites it.\nConvection is the greatest life-safety hazard in a hotel. Most fire deaths are caused by smoke inhalation,\nnot burns. Smoke rises at roughly one metre per second, which is faster than most people can climb stairs.\nThis is why we close doors, keep stairwells clear, and evacuate early rather than waiting to see flames.\n4.3 Classes of fire\nClass Fuel Typical hotel example Correct agent\nA Ordinary combustibles Linen, paper, wood, rubbish Water, ABC dry powder\nB Flammable liquids Cooking oil, petrol, solvents Foam, ABC dry powder, CO2\nC Flammable gases LPG, methane, acetylene Shut off gas; dry powder\nD Combustible metals Magnesium, sodium (rare on site) Specialist D powder\nK Cooking oils and fats Deep fryer, wok, grease Wet chemical (K-class)\nNever use water on an electrical fire or on a fat or oil fire. Water conducts electricity and turns burning oil\ninto a steam-driven spray that can cause severe burns. Switch off the power first where it is safe to do so,\nthen use the correct agent.\n4.4 Stages of fire\n• Incipient - small, localised, and still controllable with a portable extinguisher.\n• Growth - the fire spreads to nearby fuel; heat and smoke increase rapidly.\n• Fully developed - the whole compartment is involved; only trained responders with protective\nequipment may intervene.\n• Decay - fuel or oxygen is exhausted; the structure may still be unsafe to enter.\n5. General fire prevention\nMost hotel fires are preventable and start from ordinary causes: cooking, electrical faults, smoking, and\ncareless storage. The following rules apply everywhere on the property.\n5.1 Housekeeping and egress\n• Keep exits, corridors, stairwells, and landings clear at all times.\n• Never wedge, prop, or chock a fire door open. Fire doors must close fully on their own.\n• Do not store linen, boxes, chairs, or equipment in corridors or against exit doors.\n• Keep the area around electrical panels, extinguishers, and hose reels clear.\n• Report blocked exits immediately to the duty manager, even if the blockage is temporary.\n5.2 Smoking\n• Smoking is permitted only in designated outdoor areas with proper receptacles.\n• Never smoke in guest rooms, corridors, storerooms, kitchens, or back-of-house areas.\n• Do not dispose of cigarette ends in planters, bins, or rubbish chutes.\n• If a guest is found smoking in a non-smoking room, notify the duty manager immediately.\n5.3 Hot work\nWelding, cutting, grinding, and any task producing heat or sparks requires a hot work permit approved by\nEngineering and the Safety Office. The permit requires a fire watch during the work and for at least 60\nminutes afterwards, a clear area within 10 metres, and a suitable extinguisher at the work point.\n5.4 Storage and waste\n• Store flammable materials away from heat sources, electrical panels, and ignition risks.\n• Keep combustible waste in covered metal bins and empty them at the end of each shift.\n• Do not allow cardboard, pallets, or packaging to accumulate in service corridors or loading bays.\n• Maintain at least one metre of clearance below sprinkler heads and around electrical equipment.\nStop and report\nIf you see an unsafe condition you cannot fix immediately, report it through the duty manager and log it in\nthe hazard register. Do not leave it for the next shift.\n6. Guest rooms and public areas\n6.1 Guest room fire safety\n• Guest room doors must be self-closing and positive-latching. Report defects the same day.\n• Do not permit cooking appliances, portable stoves, or candles in guest rooms.\n• Check that electrical sockets, lamps, and televisions show no scorching, cracking, or loose cords.\n• Ensure the evacuation card is present, legible, and shows the current exit route.\n• Housekeeping must report any smell of burning, smoke staining, or damaged wiring immediately.\n6.2 Public areas and corridors\n• Keep corridor widths clear; housekeeping carts must not block more than half the corridor.\n• Do not hang decorations, signage, or artwork over exit signs or fire equipment.\n• Treat curtains, drapes, and upholstery with flame-retardant treatment where required.\n• Keep fire hose reels, extinguishers, and manual call points visible and accessible.\n• Control candles, open flames, and cooking stations at events; require a permit for live flame.\n6.3 Event and function spaces\nEvent organisers must submit a layout plan showing exits, aisle widths, and the position of any temporary\nstructures. The Safety Office may require a fire watch for pyrotechnics, live flame, large sets, or\nhigh-occupancy events. Do not exceed the posted occupant load.\n6.4 Evacuation information for guests\nEvery guest room displays a floor plan with the two nearest exits and the assembly area. Front office\ncolleagues should point out the exit route at check-in for guests who ask, and must offer assistance to\nguests with mobility needs.\n7. Kitchens and food service\nCommercial kitchens are the highest-risk area on the property. Grease, open flame, hot surfaces, and high\nenergy use combine to create fires that spread quickly through hoods and ducts.\n7.1 Grease and hood cleaning\n• Clean cooking surfaces, filters, and drip trays at the end of every shift.\n• Clean hood filters at least weekly, or more often in high-volume kitchens.\n• Have hood and duct systems professionally cleaned on a documented schedule.\n• Keep the hood suppression system tagged, serviced, and linked to the kitchen fuel shut-off.\n• Never operate a cooking line with a suppression system under impairment without a fire watch.\n7.2 Safe cooking practices\n• Never leave cooking unattended. If you must step away, turn off the heat.\n• Control oil temperature and do not overfill fryers; wet food causes oil to surge and spill.\n• Keep combustible items away from burners, fryers, and hot surfaces.\n• Do not use water to extinguish an oil or fat fire. Cover the pan with a lid or use a K-class extinguisher.\n• Turn off gas and electrical supplies before leaving the kitchen at the end of service.\n7.3 Gas safety\n• If you smell gas, do not operate electrical switches or use a phone in the area.\n• Shut off the gas supply at the nearest isolation valve if it is safe to do so.\n• Open doors and windows for ventilation and evacuate the area.\n• Raise the alarm and notify Engineering and the duty manager from a safe location.\n• Do not re-enter or restore gas until Engineering confirms the area is safe.\n7.4 Kitchen response sequence\n1. Turn off the heat source and, if safe, the fuel supply.\n2. Raise the alarm and alert the kitchen team.\n3. Use the correct extinguisher or the hood suppression system for the fire type.\n4. Evacuate if the fire does not come under control immediately.\n5. Close the kitchen doors and proceed to the assembly area for roll call.\n8. Engineering, electrical, and back-of-house\n8.1 Electrical safety\n• Never overload sockets or daisy-chain extension cords and power strips.\n• Use extension cords only as a temporary measure; remove them after the task.\n• Report damaged cables, scorched plugs, buzzing panels, or flickering lights immediately.\n• Keep electrical panels clear to a depth of one metre and labelled clearly.\n• Only authorised electricians may open panels, modify circuits, or replace protective devices.\n8.2 Plant rooms and generators\n• Keep generator, boiler, and fuel rooms clean and free of combustible storage.\n• Store fuel only in approved containers and quantities, away from ignition sources.\n• Maintain ventilation and ensure fire detection and suppression are operational.\n• Log all maintenance and fuel transfers; report leaks immediately.\n• Restrict access to authorised engineering staff and maintain a key register.\n8.3 Laundry and linen\n• Clean lint filters before every shift and inspect dryers for overheating.\n• Allow hot linen to cool before folding or stacking; spontaneous ignition is possible.\n• Do not store linen against heaters, electrical panels, or in exit corridors.\n• Report dryers that take longer than normal or produce a burning smell.\n8.4 Vehicles and car parks\n• Keep vehicle aisles and ramps clear for fire appliances and evacuation.\n• Do not store fuel, paint, or gas cylinders in car parks.\n• Report leaking vehicles or strong fuel smells immediately.\n• For electric vehicle charging, follow the posted instructions and report damaged cables.\n8.5 Contractor control\nContractors must be inducted before work begins and must comply with this handbook. Hot work, isolation\nof fire systems, and work in occupied areas require a permit. The host department remains responsible for\ncontractor conduct and housekeeping.\n9. Detection, alarm, and suppression systems\n9.1 Detection\n• Smoke and heat detectors protect guest rooms, corridors, plant rooms, and back-of-house areas.\n• Do not paint, cover, or obstruct detectors, sprinkler heads, or alarm devices.\n• Report any detector that is beeping, damaged, or disconnected.\n• Do not use aerosol sprays, steam, or dust-generating work near detectors without a permit.\n9.2 Alarm and communication\n• Manual call points are located at exits and strategic corridor points.\n• The fire alarm panel is monitored at the security control room at all times.\n• Do not silence or reset the alarm panel unless you are authorised and have confirmed the cause.\n• Treat every alarm as real until the incident commander declares otherwise.\n9.3 Automatic sprinklers\nSprinklers activate individually by heat and are highly effective at controlling fire in its early stage. Never\nhang anything from a sprinkler head, and never stack stock within one metre below it. If a sprinkler\ndischarges, treat it as a fire signal and follow the response procedure.\n9.4 Extinguishers, hose reels, and standpipes\n• Extinguishers are inspected monthly and serviced annually by a competent provider.\n• Hose reels must be accessible and their valves unobstructed.\n• Standpipe outlets and fire department connections must remain clear and visible.\n• After any use, report the equipment immediately so it can be recharged or replaced.\n9.5 Impairments and fire watch\nWhen a fire protection system is impaired, the Safety Office must be notified, the affected area must be\nlogged, and a fire watch must be established until the system is restored. The fire watch is a dedicated\nperson with no other duties, an extinguisher, and a means of raising the alarm.\n10. Emergency response: RACE\nThe first three minutes decide the outcome. Use RACE in order. Do not skip the alarm to investigate; the\nalarm brings help and starts the evacuation clock.\n10.1 RACE\nStep Action\nRecognise Identify the emergency: smoke, flame, gas, heat, or a colleague\'s warning.\nAlarm Activate the nearest manual call point, call the emergency number, and alert people nearby.\nContain Close doors, switch off equipment if safe, and confine the fire where possible.\nEvacuate Leave by the nearest safe exit, assist others, and go to the assembly area.\n10.2 If you discover a fire\n1. Raise the alarm immediately. Do not wait to confirm the cause.\n2. Alert guests and colleagues in the immediate area.\n3. Call the emergency number and state the location clearly: building, floor, area, and what is burning.\n4. Attempt to control only a small, incipient fire with the correct extinguisher, keeping your back to an exit.\n5. Evacuate if the fire does not come under control with one extinguisher.\n6. Never re-enter a building once evacuated. Wait for the incident commander.\n10.3 Fire in a guest room\n• Do not open a hot door. Feel the door and handle with the back of your hand.\n• If the door is hot, keep it closed, seal gaps, and call the emergency number.\n• If the door is cool, open it slowly and stay low behind it.\n• If there is smoke, close the door and use the refuge or balcony if instructed.\n• Never use a lift. Never jump from a window except as a last resort directed by responders.\n10.4 If you are trapped\n• Close all doors between you and the fire.\n• Seal gaps around doors with wet towels or tape if available.\n• Stay low where the air is cleaner and call the emergency number.\n• Signal your location from a window with a light-coloured cloth or torch.\n• Do not break windows unless you must escape; it can draw fire and smoke toward you.\n11. Evacuation and assembly\n11.1 When to evacuate\nEvacuate immediately when the alarm sounds, when instructed by a warden or responder, or when the fire\nis beyond the incipient stage. Do not stop to collect belongings, finish a task, or investigate the source.\n11.2 Evacuation rules\n• Use the nearest safe exit and the stairs. Never use lifts during a fire.\n• Keep to the right in corridors and stairwells to let responders pass.\n• Close doors behind you as you go, if it is safe to do so.\n• Do not run; move quickly and calmly to avoid injury and panic.\n• Assist guests and colleagues who need help, following their PEEP where one exists.\n• If smoke is present, stay low, cover your nose and mouth, and feel doors before opening them.\n11.3 People who need assistance\nGuests and colleagues with mobility, sensory, or cognitive needs may require assistance. Where possible,\nmove them horizontally to a protected refuge area and notify the incident commander. Do not use a lift,\neven with assistance, unless directed by responders.\n11.4 Assembly and roll call\n1. Proceed to the assembly area assigned to your shift and location.\n2. Report to your fire warden and answer the roll call.\n3. Report anyone missing, injured, or last seen in the building.\n4. Do not leave the assembly area until the incident commander releases you.\n5. Do not re-enter the building until the fire service declares it safe.\nContractors and visitors\nThe hosting department must account for its contractors, vendors, and visitors at the assembly area. If\nyou invited them on site, you are responsible for confirming they are safe.\n12. Fire wardens and emergency roles\nThe following roles activate during an alarm. A person may hold more than one role on a shift, but the\nincident commander must never be the same person as the fire warden sweeping a floor.\nRole Primary responsibility\nIncident commander Takes command at the control point, decides on evacuation, liaises with the fire service.\nDeputy commander Assumes command if the commander is unavailable; manages the control log.\nFire warden Sweeps the assigned area, closes doors, guides people to the stairs, reports clear or\nmissing.\nSearcher Checks rooms, toilets, and back-of-house areas along the sweep route.\nStairwell monitor Controls flow at the stair entrance, prevents re-entry, assists responders.\nAssembly marshal Organises evacuees, conducts roll call, reports missing persons.\nCommunications officer Handles radio, PA announcements, and calls to emergency services.\nEngineering responder Isolates utilities, confirms system status, supports the fire service.\nSecurity responder Controls access, keeps routes clear, protects the perimeter.\nFirst aid responder Sets up the treatment point and triages injuries.\n12.1 Before an emergency\n• Know your sweep route and the location of exits, call points, and extinguishers.\n• Check that your radio is charged and on the correct channel at the start of each shift.\n• Confirm who is on duty and who is the incident commander for the shift.\n• Keep the warden vest and torch accessible, not locked in an office.\n12.2 After an emergency\n• Participate in the debrief and report what you observed.\n• Record missing-person reports, injuries, and equipment used.\n• Do not reset systems or restart operations until authorised.\n• Support colleagues affected by the incident and preserve evidence.\n13. Communication during an emergency\n13.1 Alarm and PA announcements\nUse calm, clear, and scripted language. Do not speculate about the cause or severity. The communications\nofficer reads the approved script and repeats it as needed.\nSample announcement\nAttention please. Attention please. We are responding to a fire alarm in the building. Please leave your\nroom, close the door behind you, use the nearest stairwell, and do not use the lifts. Proceed to the\nassembly area. Our team will assist you.\n13.2 Informing guests\n• Give short, direct instructions: what to do, where to go, and what not to do.\n• Use simple language and repeat key points; consider translation where possible.\n• Do not disclose unverified information or the identity of anyone involved.\n• Direct guests away from the incident and keep routes clear for responders.\n13.3 Internal escalation\n1. Duty manager and security control room.\n2. Incident commander and Safety Office.\n3. General Manager and department heads.\n4. Emergency services, as required by the situation.\n13.4 Media and social media\nOnly the General Manager or the designated spokesperson may speak to the media. Colleagues must not\npost about the incident, speculate, or share images until the incident is closed and communication is\nauthorised.\n14. Fire extinguishers and PASS\nOnly attempt to fight a fire if it is small, incipient, and you have a clear escape route. If in doubt, do not fight\nit: raise the alarm and evacuate.\n14.1 Using an extinguisher (PASS)\n1. Pull the pin.\n2. Aim at the base of the fire, not the flames.\n3. Squeeze the handle firmly.\n4. Sweep from side to side across the base of the fire.\n14.2 Safety rules\n• Always keep your back to an exit and never let the fire come between you and your way out.\n• Work in pairs where possible; one person fights the fire, the other watches.\n• Do not turn your back on a fire that is not fully extinguished.\n• If the fire grows, the smoke thickens, or the extinguisher empties, leave immediately.\n• After use, report the extinguisher so it is recharged or replaced.\n14.3 Selection\nUse the matrix in Appendix A. Using the wrong agent can make the fire worse: water on fat or electrical\nfires, or powder in a kitchen where it can contaminate food and equipment. When the correct agent is not\navailable, evacuate.\n14.4 Inspection\n• Monthly: check the gauge, pin, seal, hose, and label; record the check.\n• Annual: professional service and certification by a competent provider.\n• After any use or damage: remove from service and replace immediately.\n• Report missing, obstructed, or damaged extinguishers to Engineering the same day.\n15. Drills, training, and records\n15.1 Training\n• All new colleagues receive fire safety induction before their first solo shift.\n• All colleagues complete refresher training at least annually.\n• Fire wardens receive additional training in sweep procedures, radios, and roll call.\n• Kitchen teams receive specific training on hood suppression and K-class extinguishers.\n• Engineering and security receive training on isolation, panels, and fire watches.\n15.2 Drills\n• Conduct at least two full evacuation drills per year, at least one unannounced.\n• Include night shift and weekend scenarios, not only day-shift office hours.\n• Test the alarm, communications, stairwell flow, assembly roll call, and missing-person process.\n• Record the drill start time, evacuation time, and any issues.\n• Debrief within 48 hours and assign corrective actions with owners and dates.\n15.3 Records\nRecord Owner Retention\nTraining attendance and competency HR and Safety Office 5 years\nDrill reports and debrief actions Safety Office 5 years\nExtinguisher and system inspections Engineering 5 years\nHot work permits Engineering 3 years\nIncident and near-miss reports Safety Office 5 years\n16. Reporting, investigation, and improvement\n16.1 Immediate reporting\n• Report every fire, activation, near miss, and unsafe condition, however small.\n• Call the emergency number first for an active incident; report to your manager afterwards.\n• Do not disturb the scene more than necessary; preserve evidence for investigation.\n• Record names, times, locations, and what you observed while it is fresh.\n16.2 Investigation\nThe Safety Office leads the investigation with Engineering and the affected department. The investigation\nestablishes the origin, cause, spread, response effectiveness, and corrective actions. It is not a blame\nexercise; the goal is to prevent recurrence.\n16.3 Corrective actions\n• Assign each action an owner and a due date.\n• Track actions to completion and verify effectiveness.\n• Update this handbook, training, or procedures where the finding warrants it.\n• Share lessons learned with all departments without disclosing personal information.\n16.4 External notification\nWhere required by law or by the BFP, the General Manager or Safety Office notifies the authorities within\nthe prescribed period. Do not make external statements without authorisation.\nAppendix A. Extinguisher selection matrix\nUse this matrix to choose the correct agent. When two agents are listed, prefer the first. If the correct agent\nis not immediately available, evacuate and let responders handle the fire.\nFire type Preferred agent Do not use\nPaper, linen, wood, rubbish (Class A) Water or ABC dry powder CO2 alone (limited cooling)\nCooking oil, fat, grease (Class K) Wet chemical (K-class) Water, CO2, dry powder\nPetrol, solvent, paint (Class B) Foam or ABC dry powder Water jet\nLPG, gas (Class C) Shut off gas; ABC dry powder Water on the leak\nElectrical equipment CO2 or ABC dry powder after isolating\npower\nWater or foam\nCombustible metal (Class D) Specialist D powder Water, foam, CO2\nA.1 Extinguisher locations\nExtinguishers are placed at exits, kitchen lines, plant rooms, and back-of-house corridors. Your\ndepartment\'s location chart shows the nearest unit. Check it during your first week and whenever you\nchange departments.\nA.2 Monthly inspection record\nCheck Pass criteria\nAccess Visible, unobstructed, and within reach.\nPressure gauge Needle in the green operating band.\nPin and seal Pin in place; tamper seal intact.\nHose and nozzle No cracks, blockages, or damage.\nLabel Service tag current and legible.\nMounting Secure; not corroded or loose.\nAppendix B. Inspection checklists\nCopy these checklists for shift use or complete them electronically in the maintenance system. Record the\ndate, time, and initials. Escalate any failed item immediately.\nB.1 Daily - kitchen and food service\nDaily kitchen fire safety checklist Done\nCooking surfaces, filters, and drip trays cleaned. [ ]\nHood suppression system indicator normal and tagged. [ ]\nNo combustible items stored near burners or fryers. [ ]\nFryer oil level correct and temperature controlled. [ ]\nGas and electrical supplies switched off at end of service. [ ]\nExtinguisher accessible and gauge in the green band. [ ]\nExit route and kitchen door clear. [ ]\nB.2 Daily - public areas and back-of-house\nDaily egress and housekeeping checklist Done\nCorridors and stairwells clear of stores and equipment. [ ]\nFire doors close fully and are not wedged open. [ ]\nExit signs illuminated and unobstructed. [ ]\nManual call points visible and accessible. [ ]\nNo smoking outside designated areas. [ ]\nWaste bins covered and emptied. [ ]\nFire panel showing normal, no faults or isolations. [ ]\nB.3 Weekly and monthly\nWeekly and monthly fire safety checks Done\nWeekly: hood filters cleaned and recorded. [ ]\nWeekly: extinguisher locations checked for obstruction. [ ]\nWeekly: emergency lighting and exit signs tested. [ ]\nMonthly: extinguisher gauge, pin, seal, and hose inspected. [ ]\nMonthly: hose reels and valves checked. [ ]\nMonthly: fire doors and self-closers inspected. [ ]\nMonthly: warden radios and vests checked. [ ]\nRecord all checks in the fire safety log. A missed check is a finding, not a blank.\nAppendix C. Assembly points and evacuation map\nThe property has two primary assembly areas. Your assigned area depends on your work location and the\nwind direction at the time of the incident. Follow the wardens; do not choose an area based on\nconvenience.\nAssembly area Serves Notes\nAssembly Area 1 - Front\ndriveway\nFront office, lobby, F&B outlets, guest towers A and B Primary area for most\nday-shift colleagues.\nAssembly Area 2 - Staff car\npark\nKitchen, laundry, engineering, stores, back-of-house Keep clear of the fire\nappliance access lane.\nC.1 Evacuation map\nInsert or display the current floor evacuation plan here. The plan must show the two nearest exits, the route\nto the stairwell, the manual call point, the extinguisher, and the assembly area. Floor plans are also posted\nin every guest room and service corridor.\nMap placeholder\nThis reference edition leaves the floor plan as a placeholder. Replace it with the property\'s approved\nevacuation drawings before issuing the handbook to colleagues.\nC.2 Roll call sheet\nDepartment Expected Accounted for Missing\nFront Office\nHousekeeping\nFood and Beverage\nKitchen\nEngineering\nSecurity\nContractors and visitors\nAppendix D. Emergency contacts and acknowledgement\nD.1 Emergency contacts\nContact Number When to call\nFire, medical, and rescue 911 Any life-threatening emergency.\nSecurity control room Local extension 0 Alarm, suspicious activity, access control.\nDuty manager Local extension 100 Any incident after hours or when unsure.\nEngineering on-call Local extension 200 Utilities, gas, electrical, or system impairment.\nSafety Office Local extension 300 Reporting, investigation, training, permits.\nBFP local station See posted list Fire reporting and inspection matters.\nD.2 Acknowledgement\nI confirm that I have received, read, and understood this handbook. I know the location of my nearest exits,\nmanual call point, and extinguisher, and I know my assembly area. I understand that I must raise the alarm\nand evacuate when instructed, and that I must never re-enter a building until the incident commander\ndeclares it safe.\nField Entry\nName\nPosition\nDepartment\nSignature\nDate\nReturn the signed acknowledgement to Human Resources. Training records are retained for five years in line with Section\n15.3.\n- All employees, whether permanent, probationary, casual, or agency-supplied.\n- Contractors, vendors, entertainers, and event suppliers working on site.\n- Tenants and retail partners operating within the property.\n- Local government fire safety, building, and business permit conditions.\nwaste. procedures.\n- Direct contact - flame touches a combustible surface and ignites it.\n- Growth - the fire spreads to nearby fuel; heat and smoke increase rapidly.\n- Decay - fuel or oxygen is exhausted; the structure may still be unsafe to enter.\n- Keep exits, corridors, stairwells, and landings clear at all times.\n- Keep the area around electrical panels, extinguishers, and hose reels clear.\n- Smoking is permitted only in designated outdoor areas with proper receptacles.\n- Do not dispose of cigarette ends in planters, bins, or rubbish chutes.\n- Do not permit cooking appliances, portable stoves, or candles in guest rooms.\n- Do not hang decorations, signage, or artwork over exit signs or fire equipment.\n- Clean cooking surfaces, filters, and drip trays at the end of every shift.\n- Clean hood filters at least weekly, or more often in high-volume kitchens.\n- Have hood and duct systems professionally cleaned on a documented schedule.\n- Never leave cooking unattended. If you must step away, turn off the heat.\n- Keep combustible items away from burners, fryers, and hot surfaces.\n- If you smell gas, do not operate electrical switches or use a phone in the area.\n- Shut off the gas supply at the nearest isolation valve if it is safe to do so.\n- Open doors and windows for ventilation and evacuate the area.\n- Do not re-enter or restore gas until Engineering confirms the area is safe.\n- Never overload sockets or daisy-chain extension cords and power strips.\n- Use extension cords only as a temporary measure; remove them after the task.\n- Keep electrical panels clear to a depth of one metre and labelled clearly.\n- Keep generator, boiler, and fuel rooms clean and free of combustible storage.\n- Maintain ventilation and ensure fire detection and suppression are operational.\n- Log all maintenance and fuel transfers; report leaks immediately.\n- Restrict access to authorised engineering staff and maintain a key register.\n- Clean lint filters before every shift and inspect dryers for overheating.\n- Do not store linen against heaters, electrical panels, or in exit corridors.\n- Report dryers that take longer than normal or produce a burning smell.\n- Keep vehicle aisles and ramps clear for fire appliances and evacuation.\n- Do not store fuel, paint, or gas cylinders in car parks.\n- Report leaking vehicles or strong fuel smells immediately.\n- Do not paint, cover, or obstruct detectors, sprinkler heads, or alarm devices.\n- Report any detector that is beeping, damaged, or disconnected.\n- Manual call points are located at exits and strategic corridor points.\n- The fire alarm panel is monitored at the security control room at all times.\n- Treat every alarm as real until the incident commander declares otherwise.\n- Hose reels must be accessible and their valves unobstructed.\n- Standpipe outlets and fire department connections must remain clear and visible.\n- Do not open a hot door. Feel the door and handle with the back of your hand.\n- If the door is hot, keep it closed, seal gaps, and call the emergency number.\n- If the door is cool, open it slowly and stay low behind it.\n- If there is smoke, close the door and use the refuge or balcony if instructed.\n- Close all doors between you and the fire.\n- Seal gaps around doors with wet towels or tape if available.\n- Stay low where the air is cleaner and call the emergency number.\n- Signal your location from a window with a light-coloured cloth or torch.\n- Use the nearest safe exit and the stairs. Never use lifts during a fire.\n- Keep to the right in corridors and stairwells to let responders pass.\n- Close doors behind you as you go, if it is safe to do so.\n- Do not run; move quickly and calmly to avoid injury and panic.\n- Know your sweep route and the location of exits, call points, and extinguishers.\n- Confirm who is on duty and who is the incident commander for the shift.\n- Keep the warden vest and torch accessible, not locked in an office.\n- Participate in the debrief and report what you observed.\n- Record missing-person reports, injuries, and equipment used.\n- Do not reset systems or restart operations until authorised.\n- Support colleagues affected by the incident and preserve evidence.\n- Give short, direct instructions: what to do, where to go, and what not to do.\n- Use simple language and repeat key points; consider translation where possible.\n- Do not disclose unverified information or the identity of anyone involved.\n- Direct guests away from the incident and keep routes clear for responders.\n- Work in pairs where possible; one person fights the fire, the other watches.\n- Do not turn your back on a fire that is not fully extinguished.\n- After use, report the extinguisher so it is recharged or replaced.\n- Monthly: check the gauge, pin, seal, hose, and label; record the check.\n- Annual: professional service and certification by a competent provider.\n- After any use or damage: remove from service and replace immediately.\n- All new colleagues receive fire safety induction before their first solo shift.\n- All colleagues complete refresher training at least annually.\n- Conduct at least two full evacuation drills per year, at least one unannounced.\n- Include night shift and weekend scenarios, not only day-shift office hours.\n- Record the drill start time, evacuation time, and any issues.\n- Debrief within 48 hours and assign corrective actions with owners and dates.\n- Report every fire, activation, near miss, and unsafe condition, however small.\n- Record names, times, locations, and what you observed while it is fresh.\n- Assign each action an owner and a due date.\n- Track actions to completion and verify effectiveness.\n- Update this handbook, training, or procedures where the finding warrants it.\nElectrical equipment CO2 or ABC dry powder after isolating Water or foam\ndriveway day-shift colleagues.\npark appliance access lane.', 'handbooks/fire-safety.pdf', '{\"pass_mark\":80,\"time_limit_seconds\":600,\"generated_by\":\"fallback\",\"questions\":[{\"id\":1,\"question\":\"Fill in the blank: Appendices A to C are working tools: keep the checklists with your shift paperwork and confirm the ________ point during your first week.\",\"options\":[\"Safety\",\"Emergency\",\"report\",\"assembly\"],\"correct_index\":3,\"explanation\":\"The handbook states: \\\"Appendices A to C are working tools: keep the checklists with your shift paperwork and confirm the assembly point during your first week.\\\"\"},{\"id\":2,\"question\":\"Fill in the blank: Controlled ________ notice The electronic copy on the HR portal is the controlled version.\",\"options\":[\"report\",\"Safety\",\"Emergency\",\"document\"],\"correct_index\":3,\"explanation\":\"The handbook states: \\\"Controlled document notice The electronic copy on the HR portal is the controlled version.\\\"\"},{\"id\":3,\"question\":\"Fill in the blank: Printed copies are uncontrolled unless stamped by the ________ Office.\",\"options\":[\"Safety\",\"Emergency\",\"Report\",\"Alarm\"],\"correct_index\":0,\"explanation\":\"The handbook states: \\\"Printed copies are uncontrolled unless stamped by the Safety Office.\\\"\"},{\"id\":4,\"question\":\"Fill in the blank: Do not amend this handbook locally; submit proposed changes to the Safety ________ for the next revision.\",\"options\":[\"Emergency\",\"Report\",\"Alarm\",\"Office\"],\"correct_index\":3,\"explanation\":\"The handbook states: \\\"Do not amend this handbook locally; submit proposed changes to the Safety Office for the next revision.\\\"\"},{\"id\":5,\"question\":\"Fill in the blank: Purpose, scope, and policy This handbook sets out how Oxford Suites protects guests, ________, contractors, and property from fire.\",\"options\":[\"Emergency\",\"colleagues\",\"alarm\",\"report\"],\"correct_index\":1,\"explanation\":\"The handbook states: \\\"Purpose, scope, and policy This handbook sets out how Oxford Suites protects guests, colleagues, contractors, and property from fire.\\\"\"},{\"id\":6,\"question\":\"Fill in the blank: It explains how fires start, how to prevent them, how to respond in the first critical minutes, and how we ________ and account for everyone.\",\"options\":[\"alarm\",\"Emergency\",\"evacuate\",\"report\"],\"correct_index\":2,\"explanation\":\"The handbook states: \\\"It explains how fires start, how to prevent them, how to respond in the first critical minutes, and how we evacuate and account for everyone.\\\"\"},{\"id\":7,\"question\":\"Fill in the blank: 1.1 Purpose The purpose of this handbook is to give every person on the property a ________, practical, and consistent set of instructions.\",\"options\":[\"alarm\",\"Emergency\",\"report\",\"clear\"],\"correct_index\":3,\"explanation\":\"The handbook states: \\\"1.1 Purpose The purpose of this handbook is to give every person on the property a clear, practical, and consistent set of instructions.\\\"\"},{\"id\":8,\"question\":\"Fill in the blank: It supports compliance with the Fire Code of the Philippines (RA 9514) and its implementing rules, the Occupational Safety and Health Standards, and the ________\'s fire safety inspection certificate.\",\"options\":[\"report\",\"alarm\",\"property\",\"Emergency\"],\"correct_index\":2,\"explanation\":\"The handbook states: \\\"It supports compliance with the Fire Code of the Philippines (RA 9514) and its implementing rules, the Occupational Safety and Health Standards, and the property\'s fire safety inspection certificate.\\\"\"},{\"id\":9,\"question\":\"Fill in the blank: 1.2 Scope This ________ applies to: • All employees, whether permanent, probationary, casual, or agency-supplied.\",\"options\":[\"alarm\",\"handbook\",\"Emergency\",\"report\"],\"correct_index\":1,\"explanation\":\"The handbook states: \\\"1.2 Scope This handbook applies to: • All employees, whether permanent, probationary, casual, or agency-supplied.\\\"\"},{\"id\":10,\"question\":\"Fill in the blank: • ________, vendors, entertainers, and event suppliers working on site.\",\"options\":[\"Report\",\"Contractors\",\"Emergency\",\"Alarm\"],\"correct_index\":1,\"explanation\":\"The handbook states: \\\"• Contractors, vendors, entertainers, and event suppliers working on site.\\\"\"}]}', '2026-10-19 15:09:58', 30, 25, 1, '2026-10-18 09:06:13', '2026-10-19 15:09:58');

-- --------------------------------------------------------

--
-- Table structure for table `leave_balances`
--

CREATE TABLE IF NOT EXISTS `leave_balances` (
  `leave_balance_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `employee_id` bigint(20) UNSIGNED NOT NULL,
  `leave_type` varchar(80) NOT NULL,
  `period_year` smallint(6) NOT NULL,
  `total_days` decimal(6,2) NOT NULL DEFAULT 0.00,
  `used_days` decimal(6,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`leave_balance_id`),
  UNIQUE KEY `uq_leave_balances_natural` (`employee_id`,`leave_type`,`period_year`),
  KEY `idx_leave_balances_employee_id` (`employee_id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `leave_balances`
--

INSERT INTO `leave_balances` (`leave_balance_id`, `employee_id`, `leave_type`, `period_year`, `total_days`, `used_days`, `created_at`, `updated_at`) VALUES
(1, 5, 'Vacation Leave', 2026, 15.00, 4.00, '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(2, 5, 'Sick Leave', 2026, 15.00, 3.00, '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(3, 5, 'Emergency Leave', 2026, 5.00, 1.00, '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(4, 5, 'Solo Parent Leave', 2026, 7.00, 0.00, '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(5, 1, 'Vacation Leave', 2026, 15.00, 8.00, '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(6, 1, 'Sick Leave', 2026, 15.00, 5.00, '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(7, 1, 'Emergency Leave', 2026, 5.00, 2.00, '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(8, 6, 'Vacation Leave', 2026, 15.00, 6.00, '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(9, 6, 'Sick Leave', 2026, 15.00, 2.00, '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(10, 8, 'Vacation Leave', 2026, 15.00, 9.00, '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(11, 8, 'Sick Leave', 2026, 15.00, 4.00, '2026-10-18 09:06:13', '2026-10-18 09:06:13');

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE IF NOT EXISTS `migrations` (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=115 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000003_create_departments_table', 1),
(4, '0001_01_01_000004_create_salary_grades_table', 1),
(5, '0001_01_01_000005_create_positions_table', 1),
(6, '0001_01_01_000006_create_employees_table', 1),
(7, '0001_01_01_000007_create_employee_emergency_contacts_table', 1),
(8, '0001_01_01_000008_create_employee_position_history_table', 1),
(9, '0001_01_01_000009_create_employee_exit_records_table', 1),
(10, '0001_01_01_000010_create_employee_documents_table', 1),
(11, '0001_01_01_000011_create_system_roles_table', 1),
(12, '0001_01_01_000012_create_role_permissions_table', 1),
(13, '0001_01_01_000013_create_system_users_table', 1),
(14, '0001_01_01_000014_create_notifications_table', 1),
(15, '0001_01_01_000015_create_user_login_activity_table', 1),
(16, '0001_01_01_000016_create_audit_logs_table', 1),
(17, '0001_01_01_000017_create_announcements_table', 1),
(18, '0001_01_01_000018_create_ess_categories_table', 1),
(19, '0001_01_01_000019_create_ess_requests_table', 1),
(20, '0001_01_01_000020_create_leave_balances_table', 1),
(21, '0001_01_01_000021_create_attendance_records_table', 1),
(22, '0001_01_01_000022_create_work_schedules_table', 1),
(23, '0001_01_01_000023_create_payroll_periods_table', 1),
(24, '0001_01_01_000024_create_payroll_records_table', 1),
(25, '0001_01_01_000025_create_payroll_items_table', 1),
(26, '0001_01_01_000026_create_employee_benefits_table', 1),
(27, '0001_01_01_000027_create_learning_courses_table', 1),
(28, '0001_01_01_000028_create_employee_learning_table', 1),
(29, '0001_01_01_000029_create_performance_reviews_table', 1),
(30, '0001_01_01_000030_create_hr3_recommendations_table', 1),
(31, '2025_01_01_000001_create_job_posts_table', 1),
(32, '2025_01_01_000002_create_job_post_platforms_table', 1),
(33, '2025_01_01_000003_create_requisitions_table', 1),
(34, '2025_01_01_000004_make_job_posts_position_required', 1),
(35, '2025_01_02_000001_create_applicants_table', 1),
(36, '2025_01_02_000002_create_applicant_screening_entities_table', 1),
(37, '2025_01_02_000003_create_applicant_screening_scores_table', 1),
(38, '2025_01_02_000004_create_interviews_table', 1),
(39, '2025_01_02_000005_create_applicant_assessments_table', 1),
(40, '2025_01_03_000001_create_new_hires_table', 1),
(41, '2025_01_03_000002_create_onboarding_checklist_templates_table', 1),
(42, '2025_01_03_000003_create_onboarding_checklist_items_table', 1),
(43, '2025_01_03_000004_create_employee_onboarding_items_table', 1),
(44, '2025_01_03_000005_create_checklist_requests_table', 1),
(45, '2025_01_04_000001_create_system_settings_table', 1),
(46, '2026_08_15_171717_create_personal_access_tokens_table', 1),
(47, '2026_08_16_000001_add_picture_to_job_posts_table', 1),
(48, '2026_08_16_000002_make_employee_id_nullable_on_onboarding_items', 1),
(49, '2026_08_16_000004_add_accepted_to_applicants_stage_check', 1),
(50, '2026_08_18_000001_add_url_to_audit_logs_table', 1),
(51, '2026_08_18_000001_set_template_item_fk_set_null', 1),
(52, '2026_08_19_000001_dedupe_employee_onboarding_items', 1),
(53, '2026_08_19_000002_dedupe_legacy_onboarding_item_duplicates', 1),
(54, '2026_08_20_000001_create_chatbot_tables', 1),
(55, '2026_08_22_000001_add_upload_and_instructions_to_onboarding_items', 1),
(56, '2026_08_22_000001_create_social_recognitions_and_reactions_tables', 1),
(57, '2026_08_22_120000_add_super_admin_and_protected_flags_to_system_roles', 1),
(58, '2026_08_23_000001_create_applicant_screenings_table', 1),
(59, '2026_08_23_000002_create_screening_ground_truths_table', 1),
(60, '2026_08_24_000001_create_screening_reference_data_table', 1),
(61, '2026_08_25_000001_add_otp_enabled_to_system_users_table', 1),
(62, '2026_08_25_000002_add_submitted_at_to_employee_onboarding_items', 1),
(63, '2026_08_27_000001_add_resume_original_name_to_applicants_table', 1),
(64, '2026_08_29_000001_remove_benefits_from_job_posts_table', 1),
(65, '2026_08_31_000001_add_evaluation_requested_at_to_new_hires_table', 1),
(66, '2026_09_04_000001_add_resume_hash_to_applicants_table', 1),
(67, '2026_09_04_000002_create_promotion_requests_table', 1),
(68, '2026_09_04_100000_extend_chatbot_tables', 1),
(69, '2026_09_05_000001_add_requires_practical_to_job_posts_table', 1),
(70, '2026_09_05_000001_create_facilities_table', 1),
(71, '2026_09_05_000002_add_facility_to_interviews_table', 1),
(72, '2026_09_05_000003_extend_applicant_assessments_table', 1),
(73, '2026_09_05_000004_create_assessment_tests_table', 1),
(74, '2026_09_05_000005_create_practical_tests_table', 1),
(75, '2026_09_05_000006_create_final_evaluations_table', 1),
(76, '2026_09_05_000007_create_applicant_documents_table', 1),
(77, '2026_09_05_000008_extend_applicants_stage_check', 1),
(78, '2026_09_07_000001_add_verification_to_applicant_documents_table', 1),
(79, '2026_09_18_000001_add_hr3_loop_to_promotion_requests_table', 1),
(80, '2026_09_19_000001_add_mfa_to_system_users_table', 1),
(81, '2026_09_19_000002_add_lockout_to_system_users_table', 1),
(82, '2026_09_23_000001_add_document_verification_to_applicant_screenings_table', 1),
(83, '2026_09_26_000001_create_screening_requirement_templates_table', 1),
(84, '2026_10_03_000001_create_assessment_invites_table', 1),
(85, '2026_10_08_000001_add_overall_score_to_final_evaluations_table', 1),
(86, '2026_10_09_154650_add_requires_assessment_to_job_posts_table', 1),
(87, '2026_10_09_161957_add_assessment_fields_to_positions_table', 1),
(88, '2026_10_10_171231_add_profile_photo_and_gender_to_users_table', 1),
(89, '2026_10_11_000001_add_review_fields_to_employee_onboarding_items', 1),
(90, '2026_10_11_000001_add_zoom_to_interviews_table', 1),
(91, '2026_10_16_000001_create_ess_request_attachments_table', 1),
(92, '2026_10_16_000002_create_ess_request_status_histories_table', 1),
(93, '2026_10_16_000003_add_provenance_to_employee_documents_table', 1),
(94, '2026_10_18_000001_add_lms_content_to_learning_courses_table', 1),
(95, '2026_10_18_000002_create_employee_learning_attempts_table', 1),
(96, '2026_10_18_000003_add_completion_fields_to_employee_learning_table', 1),
(97, '2026_10_12_125011_add_interview_notes_to_interviews_table', 2),
(98, '2026_10_13_000001_add_additional_instructions_about_to_job_posts_table', 2),
(99, '2026_10_13_000001_fix_reference_data_education_skill_mistype', 2),
(100, '2026_10_14_000001_add_blocks_json_to_job_posts_table', 2),
(101, '2026_10_14_000002_backstop_education_experience_reference_levels', 2),
(102, '2026_10_14_000003_normalise_company_website_platform_label', 2),
(103, '2026_10_16_000001_add_scheduled_end_time_to_interviews_table', 2),
(104, '2026_10_16_000010_create_employee_code_sequences_table', 2),
(105, '2026_10_16_000011_add_soft_deletes_to_employees_table', 2),
(106, '2026_10_16_000012_add_soft_deletes_to_employee_documents_table', 2),
(107, '2026_10_16_000013_create_document_code_sequences_table', 2),
(108, '2026_10_18_000001_add_level_lists_to_job_posts_table', 3),
(109, '2026_10_19_000001_add_offer_fields_to_applicants_table', 3),
(110, '2026_10_19_000001_drop_job_posts_level_check_constraints', 3),
(111, '2026_10_19_000002_add_reapply_cooldown_to_applicants_table', 3),
(112, '2026_10_20_000001_add_ess_fulfillment_workflow', 3),
(113, '2026_10_20_000001_add_offer_response_medium_to_applicants_table', 3),
(114, '2026_10_21_000001_add_soft_deletes_to_job_posts_table', 4);

-- --------------------------------------------------------

--
-- Table structure for table `new_hires`
--

CREATE TABLE IF NOT EXISTS `new_hires` (
  `new_hire_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `new_hire_code` varchar(40) NOT NULL,
  `applicant_id` bigint(20) UNSIGNED DEFAULT NULL,
  `employee_id` bigint(20) UNSIGNED DEFAULT NULL,
  `name` varchar(160) NOT NULL,
  `email` varchar(190) DEFAULT NULL,
  `phone` varchar(40) DEFAULT NULL,
  `position_id` bigint(20) UNSIGNED DEFAULT NULL,
  `department_id` bigint(20) UNSIGNED DEFAULT NULL,
  `stage` varchar(30) NOT NULL,
  `start_date` date NOT NULL,
  `evaluation_requested_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`new_hire_id`),
  UNIQUE KEY `new_hires_new_hire_code_unique` (`new_hire_code`),
  KEY `idx_new_hires_applicant_id` (`applicant_id`),
  KEY `idx_new_hires_employee_id` (`employee_id`),
  KEY `idx_new_hires_position_id` (`position_id`),
  KEY `idx_new_hires_department_id` (`department_id`),
  KEY `idx_new_hires_stage` (`stage`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `new_hires`
--

INSERT INTO `new_hires` (`new_hire_id`, `new_hire_code`, `applicant_id`, `employee_id`, `name`, `email`, `phone`, `position_id`, `department_id`, `stage`, `start_date`, `evaluation_requested_at`, `created_at`, `updated_at`) VALUES
(1, 'NH-01', 1, 4, 'Camille Ortega', 'camille.ortega@email.com', '0917 664 2219', 2, 1, 'Pre-onboarding', '2026-08-04', NULL, '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(2, 'NH-02', 10, 13, 'Bianca Soriano', 'bianca.soriano@email.com', '0912 345 6789', 1, 1, 'Pre-onboarding', '2026-08-04', NULL, '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(3, 'NH-03', 5, 5, 'Kevin Dela Cruz', 'kevin.delacruz@email.com', '0921 774 9903', 5, 3, 'Probationary', '2026-04-15', NULL, '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(4, 'NH-04', 4, 14, 'Jompaks Berdugo', 'jompaks.berdugo@email.com', '0933 552 1180', 4, 2, 'Probationary', '2026-03-01', NULL, '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(5, 'NH-05', 9, 6, 'Marjun Devera', 'marjun.devera@email.com', '0917 664 2219', 3, 2, 'Regular', '2025-09-16', NULL, '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(6, 'NH-06', NULL, 15, 'Angelo Torres', 'angelo.torres@email.com', '0917 220 5541', 1, 1, 'Probationary', '2026-05-11', NULL, '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(7, 'NH-07', NULL, 16, 'Ligaya Santos', 'ligaya.santos@email.com', '0918 663 2201', 7, 4, 'Probationary', '2026-02-20', NULL, '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(8, 'NH-08', NULL, 17, 'Michael Reyes', 'michael.reyes@email.com', '0920 441 8873', 8, 5, 'Probationary', '2026-06-01', NULL, '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(9, 'NH-09', NULL, 18, 'Patricia Gomez', 'patricia.gomez@email.com', '0917 903 2245', 6, 3, 'Regular', '2025-06-02', NULL, '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(10, 'NH-10', NULL, 19, 'Ernesto Villar', 'ernesto.villar@email.com', '0921 556 7743', 7, 4, 'Regular', '2025-03-19', NULL, '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(11, 'NH-11', NULL, 20, 'Grace Panganiban', 'grace.panganiban@email.com', '0917 332 8890', 2, 1, 'Regular', '2025-11-10', NULL, '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(12, 'NH-12', NULL, 21, 'Noel Fajardo', 'noel.fajardo@email.com', '0918 774 3320', 8, 5, 'Regular', '2025-01-27', NULL, '2026-10-18 09:06:13', '2026-10-18 09:06:13');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE IF NOT EXISTS `notifications` (
  `notification_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `system_user_id` bigint(20) UNSIGNED NOT NULL,
  `type` varchar(50) NOT NULL,
  `title` varchar(200) NOT NULL,
  `body` text DEFAULT NULL,
  `module_name` varchar(100) DEFAULT NULL,
  `target_type` varchar(100) DEFAULT NULL,
  `target_id` varchar(100) DEFAULT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`notification_id`),
  KEY `idx_notifications_system_user_id` (`system_user_id`),
  KEY `idx_notifications_is_read` (`is_read`),
  KEY `idx_notifications_created_at` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`notification_id`, `system_user_id`, `type`, `title`, `body`, `module_name`, `target_type`, `target_id`, `is_read`, `read_at`, `created_at`) VALUES
(1, 2, 'ess_request', 'New ESS request pending', 'Sick leave request REQ-4410 filed by Kevin Dela Cruz awaits review.', 'ESS Management', 'ess_request', 'REQ-4410', 0, NULL, '2026-10-18 09:06:13'),
(2, 2, 'hr3', 'HR3 recommendation pending', 'Regularization recommendation for Camille Ortega is pending HR action.', 'Core HCM', 'hr3_recommendation', 'HR3-REC-01', 0, NULL, '2026-10-18 09:06:13'),
(3, 2, 'checklist', 'Checklist request raised', 'Miguel Torres probationary checklist requested (CR-001).', 'New Hire Onboarding', 'checklist_request', 'CR-001', 0, NULL, '2026-10-18 09:06:13'),
(4, 2, 'checklist', 'Checklist request raised', 'Andrea Lim probationary checklist requested (CR-002).', 'New Hire Onboarding', 'checklist_request', 'CR-002', 0, NULL, '2026-10-18 09:06:13'),
(5, 3, 'ess_request', 'Interview reminder', 'Interview with Bianca Soriano scheduled for 2026-07-28, 09:00 AM.', 'Applicant Management', 'interview', 'INT-201', 0, NULL, '2026-10-18 09:06:13'),
(6, 3, 'hr3', 'HR3 recommendation submitted', 'Regularization recommendation for Camille Ortega submitted for review.', 'Core HCM', 'hr3_recommendation', 'HR3-REC-01', 1, '2026-08-02 01:00:00', '2026-10-18 09:06:13'),
(7, 1, 'audit', 'Critical audit event', 'Permission matrix was modified for role Admin.', 'User Management', 'audit_log', 'LOG-9001', 0, NULL, '2026-10-18 09:06:13'),
(8, 7, 'ess_request', 'COE request assigned', 'Certificate of Employment request REQ-4409 assigned to you.', 'ESS Management', 'ess_request', 'REQ-4409', 0, NULL, '2026-10-18 09:06:13'),
(9, 8, 'ess_request', 'Loan application under review', 'Company loan application REQ-4405 assigned to you.', 'ESS Management', 'ess_request', 'REQ-4405', 0, NULL, '2026-10-18 09:06:13'),
(10, 4, 'warning', 'New sign-in to your account', 'We noticed a login to your account from a new IP address (127.0.0.1). If this wasn’t you, reset your password.', 'Authentication', 'user', '4', 1, '2026-10-20 07:11:34', '2026-10-18 01:08:01'),
(11, 3, 'warning', 'New sign-in to your account', 'We noticed a login to your account from a new IP address (127.0.0.1). If this wasn’t you, reset your password.', 'Authentication', 'user', '3', 0, NULL, '2026-10-18 03:49:43'),
(12, 1, 'warning', 'New sign-in to your account', 'We noticed a login to your account from a new IP address (127.0.0.1). If this wasn’t you, reset your password.', 'Authentication', 'user', '1', 0, NULL, '2026-10-19 00:38:04'),
(13, 1, 'info', 'Interview scheduled: Princess Mabangis', 'Booked on 2026-10-21 00:00:00 08:00 with Lourdes Bautista.', 'Applicant Management', 'Interview', '6', 0, NULL, '2026-10-20 23:16:22'),
(14, 2, 'info', 'Interview scheduled: Princess Mabangis', 'Booked on 2026-10-21 00:00:00 08:00 with Lourdes Bautista.', 'Applicant Management', 'Interview', '6', 0, NULL, '2026-10-20 23:16:22'),
(15, 3, 'info', 'Interview scheduled: Princess Mabangis', 'Booked on 2026-10-21 00:00:00 08:00 with Lourdes Bautista.', 'Applicant Management', 'Interview', '6', 0, NULL, '2026-10-20 23:16:22'),
(16, 7, 'info', 'Interview scheduled: Princess Mabangis', 'Booked on 2026-10-21 00:00:00 08:00 with Lourdes Bautista.', 'Applicant Management', 'Interview', '6', 0, NULL, '2026-10-20 23:16:22'),
(17, 8, 'info', 'Interview scheduled: Princess Mabangis', 'Booked on 2026-10-21 00:00:00 08:00 with Lourdes Bautista.', 'Applicant Management', 'Interview', '6', 0, NULL, '2026-10-20 23:16:22'),
(18, 1, 'info', 'Interview scheduled: Kanor Ornak', 'Booked on 2026-10-21 00:00:00 15:00:00 with Ana Ramos.', 'Applicant Management', 'Interview', '7', 0, NULL, '2026-10-20 23:17:22'),
(19, 2, 'info', 'Interview scheduled: Kanor Ornak', 'Booked on 2026-10-21 00:00:00 15:00:00 with Ana Ramos.', 'Applicant Management', 'Interview', '7', 0, NULL, '2026-10-20 23:17:22'),
(20, 3, 'info', 'Interview scheduled: Kanor Ornak', 'Booked on 2026-10-21 00:00:00 15:00:00 with Ana Ramos.', 'Applicant Management', 'Interview', '7', 0, NULL, '2026-10-20 23:17:22'),
(21, 7, 'info', 'Interview scheduled: Kanor Ornak', 'Booked on 2026-10-21 00:00:00 15:00:00 with Ana Ramos.', 'Applicant Management', 'Interview', '7', 0, NULL, '2026-10-20 23:17:22'),
(22, 8, 'info', 'Interview scheduled: Kanor Ornak', 'Booked on 2026-10-21 00:00:00 15:00:00 with Ana Ramos.', 'Applicant Management', 'Interview', '7', 0, NULL, '2026-10-20 23:17:22'),
(23, 1, 'info', 'New applicant from Landing: ARVIN KEITH DEL ROSARIO', 'Applied for Line Cook via Landing Page with screening score 92.00%.', 'Applicant Management', 'Applicant', '11', 0, NULL, '2026-10-20 23:22:37'),
(24, 2, 'info', 'New applicant from Landing: ARVIN KEITH DEL ROSARIO', 'Applied for Line Cook via Landing Page with screening score 92.00%.', 'Applicant Management', 'Applicant', '11', 0, NULL, '2026-10-20 23:22:37'),
(25, 3, 'info', 'New applicant from Landing: ARVIN KEITH DEL ROSARIO', 'Applied for Line Cook via Landing Page with screening score 92.00%.', 'Applicant Management', 'Applicant', '11', 0, NULL, '2026-10-20 23:22:37'),
(26, 7, 'info', 'New applicant from Landing: ARVIN KEITH DEL ROSARIO', 'Applied for Line Cook via Landing Page with screening score 92.00%.', 'Applicant Management', 'Applicant', '11', 0, NULL, '2026-10-20 23:22:37'),
(27, 8, 'info', 'New applicant from Landing: ARVIN KEITH DEL ROSARIO', 'Applied for Line Cook via Landing Page with screening score 92.00%.', 'Applicant Management', 'Applicant', '11', 0, NULL, '2026-10-20 23:22:37');

-- --------------------------------------------------------

--
-- Table structure for table `onboarding_checklist_items`
--

CREATE TABLE IF NOT EXISTS `onboarding_checklist_items` (
  `template_item_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `template_id` bigint(20) UNSIGNED NOT NULL,
  `item_text` text NOT NULL,
  `instructions` text DEFAULT NULL,
  `requires_upload` tinyint(1) NOT NULL DEFAULT 0,
  `upload_placeholder` varchar(255) DEFAULT NULL,
  `sort_order` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`template_item_id`),
  KEY `idx_onboarding_checklist_items_template_id` (`template_id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `onboarding_checklist_items`
--

INSERT INTO `onboarding_checklist_items` (`template_item_id`, `template_id`, `item_text`, `instructions`, `requires_upload`, `upload_placeholder`, `sort_order`, `created_at`) VALUES
(1, 1, 'Signed employment contract', NULL, 0, NULL, 1, '2026-10-18 09:06:13'),
(2, 1, 'NBI / Police clearance', NULL, 0, NULL, 2, '2026-10-18 09:06:13'),
(3, 1, 'Pre-employment medical exam', NULL, 0, NULL, 3, '2026-10-18 09:06:13'),
(4, 1, 'SSS / PhilHealth / Pag-IBIG / TIN', NULL, 0, NULL, 4, '2026-10-18 09:06:13'),
(5, 1, 'Birth certificate (PSA)', NULL, 0, NULL, 5, '2026-10-18 09:06:13'),
(6, 1, 'Company orientation attended', NULL, 0, NULL, 6, '2026-10-18 09:06:13'),
(7, 1, 'Uniform & ID issued', NULL, 0, NULL, 7, '2026-10-18 09:06:13'),
(8, 1, 'Department on-the-job training', NULL, 0, NULL, 8, '2026-10-18 09:06:13'),
(9, 2, 'Department orientation completed', NULL, 0, NULL, 1, '2026-10-18 09:06:13'),
(10, 2, 'Job description acknowledged', NULL, 0, NULL, 2, '2026-10-18 09:06:13'),
(11, 2, '1st month performance evaluation', NULL, 0, NULL, 3, '2026-10-18 09:06:13'),
(12, 2, '3rd month performance evaluation', NULL, 0, NULL, 4, '2026-10-18 09:06:13'),
(13, 2, '5th month performance evaluation', NULL, 0, NULL, 5, '2026-10-18 09:06:13'),
(14, 2, 'Training hours completed', NULL, 0, NULL, 6, '2026-10-18 09:06:13'),
(15, 3, 'Regularization contract signed', NULL, 0, NULL, 1, '2026-10-18 09:06:13'),
(16, 3, 'HMO enrollment submitted', NULL, 0, NULL, 2, '2026-10-18 09:06:13'),
(17, 3, 'Leave credits activated', NULL, 0, NULL, 3, '2026-10-18 09:06:13'),
(18, 3, 'Performance goals set', NULL, 0, NULL, 4, '2026-10-18 09:06:13');

-- --------------------------------------------------------

--
-- Table structure for table `onboarding_checklist_templates`
--

CREATE TABLE IF NOT EXISTS `onboarding_checklist_templates` (
  `template_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `template_code` varchar(40) NOT NULL,
  `title` varchar(200) NOT NULL,
  `phase` varchar(30) NOT NULL,
  `position_scope_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`position_scope_json`)),
  `status` varchar(20) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`template_id`),
  UNIQUE KEY `onboarding_checklist_templates_template_code_unique` (`template_code`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `onboarding_checklist_templates`
--

INSERT INTO `onboarding_checklist_templates` (`template_id`, `template_code`, `title`, `phase`, `position_scope_json`, `status`, `created_at`, `updated_at`) VALUES
(1, 'TPL-001', 'Pre-Employment Requirements', 'Pre-onboarding', '[\"all\"]', 'Active', '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(2, 'TPL-002', 'Standard Probationary Checklist', 'Probationary', '[\"all\"]', 'Active', '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(3, 'TPL-003', 'Regularization Checklist', 'Regular', '[\"all\"]', 'Active', '2026-10-18 09:06:13', '2026-10-18 09:06:13');

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE IF NOT EXISTS `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payroll_items`
--

CREATE TABLE IF NOT EXISTS `payroll_items` (
  `payroll_item_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `payroll_record_id` bigint(20) UNSIGNED NOT NULL,
  `item_type` varchar(30) NOT NULL,
  `label` varchar(120) NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`payroll_item_id`),
  KEY `idx_payroll_items_payroll_record_id` (`payroll_record_id`)
) ENGINE=InnoDB AUTO_INCREMENT=62 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payroll_items`
--

INSERT INTO `payroll_items` (`payroll_item_id`, `payroll_record_id`, `item_type`, `label`, `amount`, `created_at`) VALUES
(1, 1, 'Earning', 'Basic Pay', 8000.00, '2026-10-18 09:06:13'),
(2, 1, 'Earning', 'Overtime Pay', 950.00, '2026-10-18 09:06:13'),
(3, 1, 'Earning', 'Night Differential', 400.00, '2026-10-18 09:06:13'),
(4, 1, 'Earning', 'Meal Allowance', 750.00, '2026-10-18 09:06:13'),
(5, 1, 'Earning', 'Service Charge', 500.00, '2026-10-18 09:06:13'),
(6, 1, 'Deduction', 'SSS', 450.00, '2026-10-18 09:06:13'),
(7, 1, 'Deduction', 'PhilHealth', 275.00, '2026-10-18 09:06:13'),
(8, 1, 'Deduction', 'Pag-IBIG', 100.00, '2026-10-18 09:06:13'),
(9, 1, 'Deduction', 'Withholding Tax', 575.00, '2026-10-18 09:06:13'),
(10, 1, 'Deduction', 'Company Loan', 225.00, '2026-10-18 09:06:13'),
(11, 2, 'Earning', 'Basic Pay', 8000.00, '2026-10-18 09:06:13'),
(12, 2, 'Earning', 'Overtime Pay', 1000.00, '2026-10-18 09:06:13'),
(13, 2, 'Earning', 'Night Differential', 400.00, '2026-10-18 09:06:13'),
(14, 2, 'Earning', 'Meal Allowance', 750.00, '2026-10-18 09:06:13'),
(15, 2, 'Earning', 'Service Charge', 500.00, '2026-10-18 09:06:13'),
(16, 2, 'Deduction', 'SSS', 450.00, '2026-10-18 09:06:13'),
(17, 2, 'Deduction', 'PhilHealth', 275.00, '2026-10-18 09:06:13'),
(18, 2, 'Deduction', 'Pag-IBIG', 100.00, '2026-10-18 09:06:13'),
(19, 2, 'Deduction', 'Withholding Tax', 560.00, '2026-10-18 09:06:13'),
(20, 2, 'Deduction', 'Company Loan', 225.00, '2026-10-18 09:06:13'),
(21, 3, 'Earning', 'Basic Pay', 8000.00, '2026-10-18 09:06:13'),
(22, 3, 'Earning', 'Overtime Pay', 1050.00, '2026-10-18 09:06:13'),
(23, 3, 'Earning', 'Night Differential', 450.00, '2026-10-18 09:06:13'),
(24, 3, 'Earning', 'Meal Allowance', 750.00, '2026-10-18 09:06:13'),
(25, 3, 'Earning', 'Service Charge', 500.00, '2026-10-18 09:06:13'),
(26, 3, 'Deduction', 'SSS', 450.00, '2026-10-18 09:06:13'),
(27, 3, 'Deduction', 'PhilHealth', 275.00, '2026-10-18 09:06:13'),
(28, 3, 'Deduction', 'Pag-IBIG', 100.00, '2026-10-18 09:06:13'),
(29, 3, 'Deduction', 'Withholding Tax', 580.00, '2026-10-18 09:06:13'),
(30, 3, 'Deduction', 'Company Loan', 225.00, '2026-10-18 09:06:13'),
(31, 4, 'Earning', 'Basic Pay', 16000.00, '2026-10-18 09:06:13'),
(32, 4, 'Earning', 'Overtime Pay', 2100.00, '2026-10-18 09:06:13'),
(33, 4, 'Earning', 'Night Differential', 900.00, '2026-10-18 09:06:13'),
(34, 4, 'Earning', 'Meal Allowance', 1500.00, '2026-10-18 09:06:13'),
(35, 4, 'Earning', 'Service Charge', 1000.00, '2026-10-18 09:06:13'),
(36, 4, 'Deduction', 'SSS', 900.00, '2026-10-18 09:06:13'),
(37, 4, 'Deduction', 'PhilHealth', 550.00, '2026-10-18 09:06:13'),
(38, 4, 'Deduction', 'Pag-IBIG', 200.00, '2026-10-18 09:06:13'),
(39, 4, 'Deduction', 'Withholding Tax', 1160.00, '2026-10-18 09:06:13'),
(40, 4, 'Deduction', 'Company Loan', 450.00, '2026-10-18 09:06:13'),
(41, 5, 'Earning', 'Basic Pay', 14000.00, '2026-10-18 09:06:13'),
(42, 5, 'Earning', 'Service Charge', 1800.00, '2026-10-18 09:06:13'),
(43, 5, 'Earning', 'Meal Allowance', 1600.00, '2026-10-18 09:06:13'),
(44, 5, 'Deduction', 'SSS', 700.00, '2026-10-18 09:06:13'),
(45, 5, 'Deduction', 'PhilHealth', 400.00, '2026-10-18 09:06:13'),
(46, 5, 'Deduction', 'Pag-IBIG', 200.00, '2026-10-18 09:06:13'),
(47, 5, 'Deduction', 'Withholding Tax', 980.00, '2026-10-18 09:06:13'),
(48, 6, 'Earning', 'Basic Pay', 42000.00, '2026-10-18 09:06:13'),
(49, 6, 'Earning', 'Service Charge', 4000.00, '2026-10-18 09:06:13'),
(50, 6, 'Earning', 'Meal Allowance', 2000.00, '2026-10-18 09:06:13'),
(51, 6, 'Deduction', 'SSS', 1125.00, '2026-10-18 09:06:13'),
(52, 6, 'Deduction', 'PhilHealth', 750.00, '2026-10-18 09:06:13'),
(53, 6, 'Deduction', 'Pag-IBIG', 300.00, '2026-10-18 09:06:13'),
(54, 6, 'Deduction', 'Withholding Tax', 4525.00, '2026-10-18 09:06:13'),
(55, 7, 'Earning', 'Basic Pay', 23500.00, '2026-10-18 09:06:13'),
(56, 7, 'Earning', 'Service Charge', 1800.00, '2026-10-18 09:06:13'),
(57, 7, 'Earning', 'Meal Allowance', 700.00, '2026-10-18 09:06:13'),
(58, 7, 'Deduction', 'SSS', 800.00, '2026-10-18 09:06:13'),
(59, 7, 'Deduction', 'PhilHealth', 450.00, '2026-10-18 09:06:13'),
(60, 7, 'Deduction', 'Pag-IBIG', 200.00, '2026-10-18 09:06:13'),
(61, 7, 'Deduction', 'Withholding Tax', 1750.00, '2026-10-18 09:06:13');

-- --------------------------------------------------------

--
-- Table structure for table `payroll_periods`
--

CREATE TABLE IF NOT EXISTS `payroll_periods` (
  `payroll_period_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `period_code` varchar(40) NOT NULL,
  `period_name` varchar(120) NOT NULL,
  `period_start` date NOT NULL,
  `period_end` date NOT NULL,
  `payout_date` date DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'Open',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`payroll_period_id`),
  UNIQUE KEY `payroll_periods_period_code_unique` (`period_code`),
  KEY `idx_payroll_periods_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payroll_periods`
--

INSERT INTO `payroll_periods` (`payroll_period_id`, `period_code`, `period_name`, `period_start`, `period_end`, `payout_date`, `status`, `created_at`, `updated_at`) VALUES
(1, 'PAY-2026-06-1C', '1st Cut-off June 2026', '2026-06-01', '2026-06-15', '2026-06-20', 'Closed', '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(2, 'PAY-2026-06-2C', '2nd Cut-off June 2026', '2026-06-16', '2026-06-30', '2026-07-05', 'Closed', '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(3, 'PAY-2026-07-1C', '1st Cut-off July 2026', '2026-07-01', '2026-07-15', '2026-07-20', 'Closed', '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(4, 'PAY-2026-07-2C', '2nd Cut-off July 2026', '2026-07-16', '2026-07-31', '2026-08-05', 'Open', '2026-10-18 09:06:13', '2026-10-18 09:06:13');

-- --------------------------------------------------------

--
-- Table structure for table `payroll_records`
--

CREATE TABLE IF NOT EXISTS `payroll_records` (
  `payroll_record_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `employee_id` bigint(20) UNSIGNED NOT NULL,
  `payroll_period_id` bigint(20) UNSIGNED DEFAULT NULL,
  `pay_period_start` date NOT NULL,
  `pay_period_end` date NOT NULL,
  `payout_date` date DEFAULT NULL,
  `gross_pay` decimal(12,2) NOT NULL,
  `net_pay` decimal(12,2) NOT NULL,
  `status` varchar(30) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`payroll_record_id`),
  KEY `idx_payroll_records_employee_id` (`employee_id`),
  KEY `idx_payroll_records_payroll_period_id` (`payroll_period_id`),
  KEY `idx_payroll_records_pay_period_start` (`pay_period_start`),
  KEY `idx_payroll_records_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payroll_records`
--

INSERT INTO `payroll_records` (`payroll_record_id`, `employee_id`, `payroll_period_id`, `pay_period_start`, `pay_period_end`, `payout_date`, `gross_pay`, `net_pay`, `status`, `created_at`, `updated_at`) VALUES
(1, 5, 1, '2026-06-01', '2026-06-15', '2026-06-20', 10600.00, 8975.00, 'Released', '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(2, 5, 2, '2026-06-16', '2026-06-30', '2026-07-05', 10650.00, 9040.00, 'Released', '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(3, 5, 3, '2026-07-01', '2026-07-15', '2026-07-20', 10750.00, 9120.00, 'Released', '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(4, 5, 4, '2026-07-16', '2026-07-31', '2026-08-05', 21500.00, 18240.00, 'Draft', '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(5, 6, 3, '2026-07-01', '2026-07-15', '2026-07-20', 17400.00, 15120.00, 'Released', '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(6, 1, 3, '2026-07-01', '2026-07-15', '2026-07-20', 48000.00, 41300.00, 'Finalized', '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(7, 8, 3, '2026-07-01', '2026-07-15', '2026-07-20', 26000.00, 22800.00, 'Released', '2026-10-18 09:06:13', '2026-10-18 09:06:13');

-- --------------------------------------------------------

--
-- Table structure for table `performance_reviews`
--

CREATE TABLE IF NOT EXISTS `performance_reviews` (
  `performance_review_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `employee_id` bigint(20) UNSIGNED NOT NULL,
  `review_period` varchar(80) NOT NULL,
  `review_date` date DEFAULT NULL,
  `competency_level` varchar(50) DEFAULT NULL,
  `overall_rating` decimal(5,2) DEFAULT NULL,
  `salary_grade_id` bigint(20) UNSIGNED DEFAULT NULL,
  `salary_step` varchar(30) DEFAULT NULL,
  `evaluator_user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `comments` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`performance_review_id`),
  KEY `idx_performance_reviews_employee_id` (`employee_id`),
  KEY `idx_performance_reviews_salary_grade_id` (`salary_grade_id`),
  KEY `idx_performance_reviews_evaluator_user_id` (`evaluator_user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `performance_reviews`
--

INSERT INTO `performance_reviews` (`performance_review_id`, `employee_id`, `review_period`, `review_date`, `competency_level`, `overall_rating`, `salary_grade_id`, `salary_step`, `evaluator_user_id`, `comments`, `created_at`, `updated_at`) VALUES
(1, 5, 'Q2 2026', '2026-07-15', 'Proficient', 3.50, 2, 'Step 2', 3, 'Meets expectations; consistent food safety compliance and station discipline.', '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(2, 6, 'Q2 2026', '2026-07-15', 'Proficient', 4.00, 1, 'Step 1', 2, 'Strong banquet service support; recommended for promotion track.', '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(3, 1, 'Q2 2026', '2026-07-15', 'Expert', 4.50, 6, 'Step 3', 2, 'Highest guest satisfaction score this quarter among department heads.', '2026-10-18 09:06:13', '2026-10-18 09:06:13');

-- --------------------------------------------------------

--
-- Table structure for table `personal_access_tokens`
--

CREATE TABLE IF NOT EXISTS `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` text NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  KEY `personal_access_tokens_expires_at_index` (`expires_at`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `personal_access_tokens`
--

INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES
(2, 'App\\Models\\SystemUser', 4, 'auth-token', '641454ffe07654903c4ea0ce48f78003fff1f027b32a452fa17ced24d1a7728e', '[\"*\"]', '2026-10-18 01:47:41', '2026-10-18 13:47:33', '2026-10-18 01:47:33', '2026-10-18 01:47:41'),
(3, 'App\\Models\\SystemUser', 4, 'auth-token', '4b1467970571e5976656a52aa04994ca821d911d9c994ff99b6045a6d9c4bc5b', '[\"*\"]', '2026-10-18 01:51:03', '2026-10-18 13:51:02', '2026-10-18 01:51:02', '2026-10-18 01:51:03'),
(7, 'App\\Models\\SystemUser', 4, 'auth-token', 'b6599f17cfcf82c4ab4b6e98d73a5e499eb312c8ad26f4123e5e9fce281dbf6a', '[\"*\"]', '2026-10-18 04:15:55', '2026-10-18 15:50:46', '2026-10-18 03:50:46', '2026-10-18 04:15:55'),
(12, 'App\\Models\\SystemUser', 4, 'auth-token', '55a387e1dd63693afb912e4cc32cb0eb1a391b87407fc035cf34e6cea7a75caa', '[\"*\"]', '2026-10-19 07:15:00', '2026-10-19 18:56:21', '2026-10-19 06:56:21', '2026-10-19 07:15:00'),
(14, 'App\\Models\\SystemUser', 1, 'auth-token', '3322aff86ce0c076834b5856fa212e843c1ab8115013bf4e5acd59dad6ed1d67', '[\"*\"]', '2026-10-19 22:51:33', '2026-10-20 02:41:34', '2026-10-19 22:41:34', '2026-10-19 22:51:33'),
(18, 'App\\Models\\SystemUser', 4, 'auth-token', '95750824b9291d5da62eb3f62f525492d780d9bcbaca1048c1bcaa49bc4e3ff4', '[\"*\"]', '2026-10-20 19:37:32', '2026-10-21 07:13:25', '2026-10-20 19:13:25', '2026-10-20 19:37:32'),
(19, 'App\\Models\\SystemUser', 4, 'auth-token', '56c45ddc239abf0230f0224d9a495310aba948e4856090c8c229313843df21c8', '[\"*\"]', '2026-10-20 20:15:17', '2026-10-21 07:39:25', '2026-10-20 19:39:25', '2026-10-20 20:15:17'),
(20, 'App\\Models\\SystemUser', 4, 'auth-token', 'b693e9450cfee5b80f88d0f4100ca6139727dd60774dee0a09d294b27f6db682', '[\"*\"]', '2026-10-20 22:12:25', '2026-10-21 08:16:58', '2026-10-20 20:16:58', '2026-10-20 22:12:25');

-- --------------------------------------------------------

--
-- Table structure for table `positions`
--

CREATE TABLE IF NOT EXISTS `positions` (
  `position_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `position_code` varchar(30) NOT NULL,
  `title` varchar(150) NOT NULL,
  `department_id` bigint(20) UNSIGNED NOT NULL,
  `salary_grade_id` bigint(20) UNSIGNED DEFAULT NULL,
  `requires_assessment` tinyint(1) NOT NULL DEFAULT 0,
  `requires_practical` tinyint(1) NOT NULL DEFAULT 0,
  `level` varchar(30) NOT NULL,
  `headcount` int(11) NOT NULL DEFAULT 0,
  `filled_count` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`position_id`),
  UNIQUE KEY `positions_position_code_unique` (`position_code`),
  KEY `idx_positions_department_id` (`department_id`),
  KEY `idx_positions_salary_grade_id` (`salary_grade_id`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `positions`
--

INSERT INTO `positions` (`position_id`, `position_code`, `title`, `department_id`, `salary_grade_id`, `requires_assessment`, `requires_practical`, `level`, `headcount`, `filled_count`, `created_at`, `updated_at`) VALUES
(1, 'POS-001', 'Front Desk Receptionist', 1, 2, 0, 0, 'Rank & File', 8, 3, '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(2, 'POS-002', 'Guest Relations Officer', 1, 4, 0, 0, 'Supervisory', 3, 2, '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(3, 'POS-003', 'Restaurant Server', 2, 1, 0, 0, 'Rank & File', 12, 1, '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(4, 'POS-004', 'Bartender', 2, 1, 0, 0, 'Rank & File', 4, 1, '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(5, 'POS-005', 'Line Cook', 3, 2, 0, 0, 'Rank & File', 10, 1, '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(6, 'POS-006', 'Pastry Chef', 3, 5, 0, 0, 'Supervisory', 2, 1, '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(7, 'POS-007', 'Housekeeping Attendant', 4, 1, 0, 0, 'Rank & File', 18, 3, '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(8, 'POS-008', 'HR Assistant', 5, 3, 0, 0, 'Rank & File', 3, 2, '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(9, 'POS-009', 'General Manager', 5, 7, 0, 0, 'Executive', 1, 1, '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(10, 'POS-010', 'Front Office Manager', 1, 6, 0, 0, 'Managerial', 1, 1, '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(11, 'POS-011', 'F&B Director', 2, 7, 0, 0, 'Executive', 1, 1, '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(12, 'POS-012', 'Executive Chef', 3, 7, 0, 0, 'Executive', 1, 1, '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(13, 'POS-013', 'Executive Housekeeper', 4, 6, 0, 0, 'Managerial', 1, 1, '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(14, 'POS-014', 'HR & Administration Manager', 5, 7, 0, 0, 'Managerial', 1, 1, '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(15, 'POS-015', 'Floor Supervisor', 4, 4, 0, 0, 'Supervisory', 2, 1, '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(16, 'POS-016', 'HR Officer', 5, 4, 0, 0, 'Supervisory', 2, 1, '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(17, 'POS-017', 'Accounting Supervisor', 5, 4, 0, 0, 'Supervisory', 1, 1, '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(18, 'POS-018', 'Security Officer', 6, 1, 0, 0, 'Rank & File', 6, 4, '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(19, 'POS-019', 'Security Supervisor', 6, 4, 0, 0, 'Supervisory', 1, 1, '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(20, 'POS-020', 'Spa Therapist', 7, 2, 0, 0, 'Rank & File', 4, 2, '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(21, 'POS-021', 'Wellness / Gym Attendant', 7, 1, 0, 0, 'Rank & File', 2, 1, '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(22, 'POS-022', 'Accounting Assistant', 8, 3, 0, 0, 'Rank & File', 2, 1, '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(23, 'POS-023', 'Finance Officer', 8, 5, 0, 0, 'Supervisory', 1, 1, '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(24, 'POS-024', 'Maintenance Technician', 9, 2, 0, 0, 'Rank & File', 5, 3, '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(25, 'POS-025', 'Engineering Supervisor', 9, 4, 0, 0, 'Supervisory', 1, 1, '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(26, 'POS-026', 'Electrician', 9, 2, 0, 0, 'Rank & File', 2, 1, '2026-10-18 09:06:13', '2026-10-18 09:06:13');

-- --------------------------------------------------------

--
-- Table structure for table `practical_tests`
--

CREATE TABLE IF NOT EXISTS `practical_tests` (
  `practical_test_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `applicant_id` bigint(20) UNSIGNED NOT NULL,
  `assessor_user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `task_title` varchar(190) NOT NULL,
  `criteria_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`criteria_json`)),
  `scores_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`scores_json`)),
  `total_score` decimal(5,2) DEFAULT NULL,
  `result` varchar(10) NOT NULL,
  `test_date` date NOT NULL,
  `remarks` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`practical_test_id`),
  KEY `idx_practical_tests_applicant_id` (`applicant_id`),
  KEY `idx_practical_tests_assessor_user_id` (`assessor_user_id`),
  KEY `idx_practical_tests_test_date` (`test_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `promotion_requests`
--

CREATE TABLE IF NOT EXISTS `promotion_requests` (
  `promotion_request_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `employee_id` bigint(20) UNSIGNED NOT NULL,
  `current_position_id` bigint(20) UNSIGNED DEFAULT NULL,
  `requested_position_id` bigint(20) UNSIGNED DEFAULT NULL,
  `requested_salary_grade_id` bigint(20) UNSIGNED DEFAULT NULL,
  `hr3_recommendation_id` bigint(20) UNSIGNED DEFAULT NULL,
  `justification` text NOT NULL,
  `status` varchar(30) NOT NULL DEFAULT 'Pending',
  `reviewed_by` bigint(20) UNSIGNED DEFAULT NULL,
  `forwarded_to_hr3_by` bigint(20) UNSIGNED DEFAULT NULL,
  `forwarded_to_hr3_at` timestamp NULL DEFAULT NULL,
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `review_notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`promotion_request_id`),
  KEY `idx_promo_req_employee` (`employee_id`),
  KEY `idx_promo_req_status` (`status`),
  KEY `idx_promo_req_hr3_rec` (`hr3_recommendation_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `recognition_reactions`
--

CREATE TABLE IF NOT EXISTS `recognition_reactions` (
  `reaction_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `recognition_id` bigint(20) UNSIGNED NOT NULL,
  `employee_id` bigint(20) UNSIGNED DEFAULT NULL,
  `reaction_type` varchar(50) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`reaction_id`),
  UNIQUE KEY `rec_emp_react_unique` (`recognition_id`,`employee_id`,`reaction_type`),
  KEY `recognition_reactions_employee_id_foreign` (`employee_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `recognition_reactions`
--

INSERT INTO `recognition_reactions` (`reaction_id`, `recognition_id`, `employee_id`, `reaction_type`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 'clap', '2026-08-21 02:00:00', '2026-08-21 02:00:00'),
(2, 1, 1, 'star', '2026-08-21 02:00:00', '2026-08-21 02:00:00'),
(3, 2, 1, 'heart', '2026-08-20 07:00:00', '2026-08-20 07:00:00'),
(4, 4, 1, 'fire', '2026-08-18 04:00:00', '2026-08-18 04:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `requisitions`
--

CREATE TABLE IF NOT EXISTS `requisitions` (
  `requisition_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `requisition_code` varchar(40) NOT NULL,
  `position_id` bigint(20) UNSIGNED DEFAULT NULL,
  `position_title` varchar(150) DEFAULT NULL,
  `department_id` bigint(20) UNSIGNED NOT NULL,
  `requested_by_user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `requested_count` int(11) NOT NULL,
  `urgency` varchar(20) NOT NULL,
  `justification` text NOT NULL,
  `status` varchar(20) NOT NULL,
  `requested_at` date NOT NULL,
  `converted_job_post_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`requisition_id`),
  UNIQUE KEY `requisitions_requisition_code_unique` (`requisition_code`),
  KEY `idx_requisitions_position_id` (`position_id`),
  KEY `idx_requisitions_department_id` (`department_id`),
  KEY `idx_requisitions_requested_by_user_id` (`requested_by_user_id`),
  KEY `idx_requisitions_converted_job_post_id` (`converted_job_post_id`),
  KEY `idx_requisitions_status` (`status`),
  KEY `idx_requisitions_requested_at` (`requested_at`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `requisitions`
--

INSERT INTO `requisitions` (`requisition_id`, `requisition_code`, `position_id`, `position_title`, `department_id`, `requested_by_user_id`, `requested_count`, `urgency`, `justification`, `status`, `requested_at`, `converted_job_post_id`, `created_at`, `updated_at`) VALUES
(1, 'REQ-1001', 1, 'Front Desk Receptionist', 1, NULL, 2, 'High', 'Two front desk associates are due to transition to the Guest Relations team next month, and occupancy is trending up for the coming peak season. Backfilling now avoids a coverage gap on the AM/PM shift rotation.', 'Pending', '2024-05-02', 1, '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(2, 'REQ-1002', 7, 'Housekeeping Attendant', 4, NULL, 3, 'Urgent', 'Room turnover times have slipped past the 30-minute SLA due to persistent understaffing. Three additional attendants are needed to restore standard turnaround ahead of the group bookings arriving this quarter.', 'Pending', '2024-05-05', 3, '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(3, 'REQ-1003', 5, 'Line Cook', 3, NULL, 1, 'Normal', 'The kitchen brigade is short one station cook following a resignation. A replacement hire keeps the current menu rotation and banquet commitments fully staffed.', 'Pending', '2024-05-08', 2, '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(4, 'REQ-1004', 4, 'Bartender', 2, NULL, 1, 'Normal', 'The lobby bar needs weekend coverage now that the extended happy-hour promotion has launched.', 'Pending', '2024-05-11', 5, '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(5, 'REQ-1005', NULL, 'Security Officer', 6, NULL, 2, 'High', 'Perimeter patrol shifts are currently single-manned; two additional officers restore the standard two-person rotation.', 'Done', '2024-04-20', NULL, '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(6, 'REQ-1006', NULL, 'Spa Therapist', 7, NULL, 1, 'Low', 'Guest demand for spa bookings has grown following the new wellness package launch.', 'Pending', '2024-05-14', NULL, '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(7, 'REQ-1007', NULL, 'Reservations Agent', 1, NULL, 2, 'Normal', 'Call volume has outpaced current agent capacity during the booking surge.', 'Converted', '2024-03-30', NULL, '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(8, 'REQ-1008', NULL, 'Sous Chef', 3, NULL, 1, 'Urgent', 'Kitchen leadership gap after recent promotion; needs immediate backfill.', 'Pending', '2024-05-16', NULL, '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(9, 'REQ-1009', 15, 'Housekeeping Supervisor', 4, NULL, 1, 'High', 'Additional shift supervisor required to oversee the expanded night cleaning crew.', 'Done', '2024-04-05', NULL, '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(10, 'REQ-1010', NULL, 'Accounting Clerk', 8, NULL, 1, 'Normal', 'Month-end close workload has increased with the new property management system rollout.', 'Pending', '2024-05-18', NULL, '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(11, 'REQ-1011', NULL, 'Maintenance Technician', 9, NULL, 2, 'High', 'Preventive maintenance backlog requires two more technicians to stay on schedule.', 'Pending', '2024-05-19', NULL, '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(12, 'REQ-1012', 2, 'Guest Relations Officer', 1, NULL, 1, 'Normal', 'VIP guest volume has increased, requiring dedicated relations coverage.', 'Converted', '2024-03-12', NULL, '2026-10-18 09:06:13', '2026-10-18 09:06:13');

-- --------------------------------------------------------

--
-- Table structure for table `role_permissions`
--

CREATE TABLE IF NOT EXISTS `role_permissions` (
  `role_permission_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `role_id` bigint(20) UNSIGNED NOT NULL,
  `module_name` varchar(100) NOT NULL,
  `permission_level` varchar(40) NOT NULL DEFAULT 'None',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`role_permission_id`),
  UNIQUE KEY `uq_role_permissions_natural` (`role_id`,`module_name`),
  KEY `idx_role_permissions_role_id` (`role_id`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `role_permissions`
--

INSERT INTO `role_permissions` (`role_permission_id`, `role_id`, `module_name`, `permission_level`, `created_at`, `updated_at`) VALUES
(1, 1, 'Dashboard', 'Full', '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(2, 1, 'Applicant Management', 'Full', '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(3, 1, 'Recruitment Management', 'Full', '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(4, 1, 'New Hire Onboarding', 'Full', '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(5, 1, 'Core HCM', 'Full', '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(6, 1, 'Employee Records', 'Full', '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(7, 1, 'ESS Management', 'Full', '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(8, 1, 'User Management', 'Full', '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(9, 1, 'Audit Logs', 'Full', '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(10, 1, 'Settings', 'Full', '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(11, 2, 'Dashboard', 'View', '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(12, 2, 'Applicant Management', 'Edit', '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(13, 2, 'Recruitment Management', 'Edit', '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(14, 2, 'New Hire Onboarding', 'Edit', '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(15, 2, 'Core HCM', 'View', '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(16, 2, 'Employee Records', 'Edit', '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(17, 2, 'ESS Management', 'Approve / Reject Only', '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(18, 2, 'User Management', 'None', '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(19, 2, 'Audit Logs', 'None', '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(20, 2, 'Settings', 'View', '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(21, 3, 'Dashboard', 'View', '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(22, 3, 'Applicant Management', 'None', '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(23, 3, 'Recruitment Management', 'None', '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(24, 3, 'New Hire Onboarding', 'View', '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(25, 3, 'Core HCM', 'None', '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(26, 3, 'Employee Records', 'None', '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(27, 3, 'ESS Management', 'View', '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(28, 3, 'User Management', 'None', '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(29, 3, 'Audit Logs', 'None', '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(30, 3, 'Settings', 'View', '2026-10-18 09:06:13', '2026-10-18 09:06:13');

-- --------------------------------------------------------

--
-- Table structure for table `salary_grades`
--

CREATE TABLE IF NOT EXISTS `salary_grades` (
  `salary_grade_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` varchar(30) NOT NULL,
  `title` varchar(120) NOT NULL,
  `min_salary` decimal(12,2) NOT NULL,
  `max_salary` decimal(12,2) NOT NULL,
  `currency_code` char(3) NOT NULL DEFAULT 'PHP',
  `level` varchar(30) NOT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`salary_grade_id`),
  UNIQUE KEY `salary_grades_code_unique` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `salary_grades`
--

INSERT INTO `salary_grades` (`salary_grade_id`, `code`, `title`, `min_salary`, `max_salary`, `currency_code`, `level`, `notes`, `created_at`, `updated_at`) VALUES
(1, 'SG-01', 'Entry Rank & File', 14000.00, 17000.00, 'PHP', 'Rank & File', 'Housekeeping attendants, utility crew', '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(2, 'SG-05', 'Standard Rank & File', 18000.00, 22000.00, 'PHP', 'Rank & File', 'Front desk receptionist, line cooks', '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(3, 'SG-08', 'Senior Rank & File', 22000.00, 26000.00, 'PHP', 'Rank & File', 'HR assistant, senior receptionist', '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(4, 'SG-10', 'Junior Supervisory', 26000.00, 32000.00, 'PHP', 'Supervisory', 'Floor supervisor, guest relations supervisor', '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(5, 'SG-12', 'Senior Supervisory', 32000.00, 40000.00, 'PHP', 'Supervisory', 'Pastry chef supervisor, assistant manager', '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(6, 'SG-15', 'Department Manager', 45000.00, 60000.00, 'PHP', 'Managerial', 'Front office manager, executive housekeeper', '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(7, 'SG-18', 'Executive Director', 65000.00, 90000.00, 'PHP', 'Executive', 'F&B Director, HR Manager, GM', '2026-10-18 09:06:13', '2026-10-18 09:06:13');

-- --------------------------------------------------------

--
-- Table structure for table `screening_ground_truths`
--

CREATE TABLE IF NOT EXISTS `screening_ground_truths` (
  `gt_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `applicant_id` bigint(20) UNSIGNED NOT NULL,
  `job_post_id` bigint(20) UNSIGNED NOT NULL,
  `true_screening_result` varchar(30) NOT NULL,
  `true_qualification_score` decimal(5,2) DEFAULT NULL,
  `true_missing_information_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`true_missing_information_json`)),
  `true_unrecognized_skills_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`true_unrecognized_skills_json`)),
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  PRIMARY KEY (`gt_id`),
  UNIQUE KEY `uq_screening_ground_truths_applicant` (`applicant_id`),
  KEY `fk_screening_gt_job_post_id` (`job_post_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `screening_reference_data`
--

CREATE TABLE IF NOT EXISTS `screening_reference_data` (
  `ref_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `data_type` varchar(20) NOT NULL,
  `canonical_value` varchar(150) NOT NULL,
  `aliases_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`aliases_json`)),
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  PRIMARY KEY (`ref_id`),
  UNIQUE KEY `uq_screening_ref_type_value` (`data_type`,`canonical_value`),
  KEY `idx_screening_reference_data_type` (`data_type`)
) ENGINE=InnoDB AUTO_INCREMENT=261 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `screening_reference_data`
--

INSERT INTO `screening_reference_data` (`ref_id`, `data_type`, `canonical_value`, `aliases_json`, `active`, `created_at`, `updated_at`) VALUES
(1, 'skill', 'Attention to Detail', '[\"attention to detail\",\"detail oriented\",\"detail-oriented\"]', 1, '2026-10-18 09:06:13', NULL),
(2, 'skill', 'Auditing and Compliance', '[\"internal auditing\",\"corrective action monitoring\",\"restaurant compliance\",\"compliance monitoring\",\"quality audit\",\"compliance auditing\",\"safety audit\"]', 1, '2026-10-18 09:06:13', NULL),
(3, 'skill', 'Banquet Service', '[\"banquet service\",\"banquet operations\",\"function service\",\"banquet coordination\"]', 1, '2026-10-18 09:06:13', NULL),
(4, 'skill', 'Bar Operations', '[\"bar operations\",\"beverage service\",\"drink preparation\",\"cocktail service\",\"bar setup\",\"bar station management\"]', 1, '2026-10-18 09:06:13', NULL),
(5, 'skill', 'Barista Operations', '[\"barista operations\",\"barista\",\"cafe service\",\"coffee shop operations\"]', 1, '2026-10-18 09:06:13', NULL),
(6, 'skill', 'Beverage Operations Supervision', '[\"beverage operations supervision\"]', 1, '2026-10-18 09:06:13', NULL),
(7, 'skill', 'Beverage Quality Standards', '[\"beverage quality standards\"]', 1, '2026-10-18 09:06:13', NULL),
(8, 'skill', 'Booking Coordination & Confirmation', '[\"booking coordination & confirmation\",\"booking coordination and confirmation\"]', 1, '2026-10-18 09:06:13', NULL),
(9, 'skill', 'Budget & Supply Cost Awareness', '[\"budget & supply cost awareness\",\"budget and supply cost awareness\"]', 1, '2026-10-18 09:06:13', NULL),
(10, 'skill', 'CRM and Loyalty Management', '[\"crm systems\",\"customer feedback analysis\",\"customer retention\",\"loyalty program coordination\",\"relationship management\",\"guest preference management\"]', 1, '2026-10-18 09:06:13', NULL),
(11, 'skill', 'Cake Decoration', '[\"cake decoration\",\"cake decorating\",\"cake design\"]', 1, '2026-10-18 09:06:13', NULL),
(12, 'skill', 'Cash Handling', '[\"cash handling\",\"cashiering\",\"billing\",\"funds handling\",\"cash reconciliation\",\"cash drawer reconciliation\"]', 1, '2026-10-18 09:06:13', NULL),
(13, 'skill', 'Channel Management', '[\"channel management\",\"ota & distribution channel coordination\",\"distribution channel coordination\",\"channel manager\",\"reservation auditing\",\"group & fit booking processing\",\"ota coordination\"]', 1, '2026-10-18 09:06:13', NULL),
(14, 'skill', 'Check-in / Check-out', '[\"check-in \\/ check-out\",\"check in check out\",\"check-in\",\"check-out\",\"arrival and departure handling\"]', 1, '2026-10-18 09:06:13', NULL),
(15, 'skill', 'Chemical Safety', '[\"chemical safety\",\"cleaning chemical handling\"]', 1, '2026-10-18 09:06:13', NULL),
(16, 'skill', 'Cleaning Standards & SOPs', '[\"cleaning standards & sops\",\"cleaning standards and sops\"]', 1, '2026-10-18 09:06:13', NULL),
(17, 'skill', 'Coffee Preparation', '[\"coffee preparation\",\"coffee making\",\"espresso making\",\"espresso extraction\",\"latte art\",\"coffee brewing\",\"coffee craft\"]', 1, '2026-10-18 09:06:13', NULL),
(18, 'skill', 'Communication', '[\"communication\",\"communication skills\",\"verbal communication\",\"written communication\",\"professional communication\"]', 1, '2026-10-18 09:06:13', NULL),
(19, 'skill', 'Complaint Handling', '[\"complaint handling\",\"complaint resolution\",\"guest complaint management\",\"service recovery\",\"guest recovery\"]', 1, '2026-10-18 09:06:13', NULL),
(20, 'skill', 'Concierge Services', '[\"concierge services\",\"concierge\",\"vip guest assistance\",\"local area knowledge\",\"area knowledge\",\"transportation coordination\",\"restaurant & activity reservations\",\"restaurant reservations\",\"activity reservations\"]', 1, '2026-10-18 09:06:13', NULL),
(21, 'skill', 'Confidentiality', '[\"confidentiality\",\"data privacy\",\"records confidentiality\"]', 1, '2026-10-18 09:06:13', NULL),
(22, 'skill', 'Cost Accounting', '[\"basic cost accounting\",\"cost accounting\",\"materials control software\",\"materials control\",\"marketman\",\"supplier delivery verification\"]', 1, '2026-10-18 09:06:13', NULL),
(23, 'skill', 'Cost Reporting', '[\"cost reporting\",\"cost control\",\"f&b cost control\",\"variance analysis\",\"cost monitoring\",\"waste tracking\",\"waste reduction\",\"spoilage tracking\"]', 1, '2026-10-18 09:06:13', NULL),
(24, 'skill', 'Cost Tracking', '[\"cost tracking\"]', 1, '2026-10-18 09:06:13', NULL),
(25, 'skill', 'Cross-Department Coordination', '[\"cross-department coordination\"]', 1, '2026-10-18 09:06:13', NULL),
(26, 'skill', 'Culinary Operations', '[\"menu preparation\",\"kitchen operations\",\"prep schedules\",\"culinary preparation\",\"station preparation\",\"line preparation\"]', 1, '2026-10-18 09:06:13', NULL),
(27, 'skill', 'Customer Service', '[\"customer service\",\"guest service\",\"customer assistance\",\"client service\",\"customer care\"]', 1, '2026-10-18 09:06:13', NULL),
(28, 'skill', 'Daily Sales Reporting', '[\"daily sales reporting\",\"daily sales reports\",\"financial reporting\",\"sales reports\"]', 1, '2026-10-18 09:06:13', NULL),
(29, 'skill', 'Delivery Monitoring', '[\"delivery monitoring\"]', 1, '2026-10-18 09:06:13', NULL),
(30, 'skill', 'Event Coordination', '[\"event coordination\",\"events coordination\",\"event planning\",\"event logistics\",\"event setup\",\"function coordination\"]', 1, '2026-10-18 09:06:13', NULL),
(31, 'skill', 'Facility Maintenance', '[\"facility maintenance\",\"maintenance support\",\"electrical installation\",\"plumbing basics\",\"preventive maintenance\",\"equipment maintenance\",\"basic maintenance\",\"building maintenance\",\"repairs\"]', 1, '2026-10-18 09:06:13', NULL),
(32, 'skill', 'Fine Dining Service', '[\"fine dining service\",\"fine-dining service\",\"fine dining\",\"fine-dining\",\"guest greeting\",\"table management\",\"dining room coordination\"]', 1, '2026-10-18 09:06:13', NULL),
(33, 'skill', 'Food Safety', '[\"food safety\",\"food safety compliance\",\"food hygiene\",\"sanitation\",\"food sanitation\",\"sanitation standards\",\"food handling\"]', 1, '2026-10-18 09:06:13', NULL),
(34, 'skill', 'Front Office Operations', '[\"front office\",\"front office operations\",\"front desk\",\"reception operations\",\"hotel front office\",\"front desk operations\",\"front office procedures\"]', 1, '2026-10-18 09:06:13', NULL),
(35, 'skill', 'Guest Activities Coordination', '[\"guest activities coordination\"]', 1, '2026-10-18 09:06:13', NULL),
(36, 'skill', 'Guest Feedback Management', '[\"guest feedback management\"]', 1, '2026-10-18 09:06:13', NULL),
(37, 'skill', 'Guest Relations', '[\"guest relations\",\"guest relations management\",\"guest engagement\",\"client relations\"]', 1, '2026-10-18 09:06:13', NULL),
(38, 'skill', 'HACCP', '[\"haccp\",\"haccp compliance\",\"food safety management\",\"haccp protocols\"]', 1, '2026-10-18 09:06:13', NULL),
(39, 'skill', 'Hot Kitchen', '[\"hot kitchen\",\"hot line\",\"line cooking\",\"grill station\",\"saute station\",\"kitchen operations\",\"food preparation\"]', 1, '2026-10-18 09:06:13', NULL),
(40, 'skill', 'Hotel Operations', '[\"hotel operations\",\"property operations\"]', 1, '2026-10-18 09:06:13', NULL),
(41, 'skill', 'Housekeeping Operations', '[\"housekeeping\",\"housekeeping operations\",\"housekeeping procedures\",\"housekeeping management\"]', 1, '2026-10-18 09:06:13', NULL),
(42, 'skill', 'Housekeeping and Room Inspection', '[\"room inspection\",\"sanitation protocols\",\"guestroom inspection\",\"housekeeping standards\",\"cleaning inspection\"]', 1, '2026-10-18 09:06:13', NULL),
(43, 'skill', 'Inventory Control', '[\"inventory control\",\"inventory management\",\"stock control\",\"stocktaking\",\"inventory checks\",\"inventory support\",\"stock monitoring\",\"par-level tracking\"]', 1, '2026-10-18 09:06:13', NULL),
(44, 'skill', 'Inventory Counting', '[\"inventory counting\",\"physical inventory counting\",\"perpetual inventory\",\"stock reconciliation\"]', 1, '2026-10-18 09:06:13', NULL),
(45, 'skill', 'Knife Skills', '[\"knife skills\",\"knife handling\"]', 1, '2026-10-18 09:06:13', NULL),
(46, 'skill', 'Laundry Operations and Quality Control', '[\"laundry quality control\",\"uniform management\",\"linen inspection\",\"equipment monitoring\",\"laundry supervision\"]', 1, '2026-10-18 09:06:13', NULL),
(47, 'skill', 'Linen & Amenity Coordination', '[\"linen & amenity coordination\",\"linen and amenity coordination\"]', 1, '2026-10-18 09:06:13', NULL),
(48, 'skill', 'Linen Handling', '[\"linen handling\",\"linen management\",\"laundry operations\",\"laundry management\"]', 1, '2026-10-18 09:06:13', NULL),
(49, 'skill', 'MS Office', '[\"ms office\",\"microsoft office\",\"ms word\",\"ms excel\",\"excel\",\"word processing\",\"spreadsheets\",\"office suite\"]', 1, '2026-10-18 09:06:13', NULL),
(50, 'skill', 'Menu Knowledge & Pairing', '[\"menu knowledge & pairing\",\"menu knowledge and pairing\"]', 1, '2026-10-18 09:06:13', NULL),
(51, 'skill', 'Mise en Place', '[\"mise en place\",\"mise-en-place\",\"station setup\",\"prep lists\"]', 1, '2026-10-18 09:06:13', NULL),
(52, 'skill', 'Mixology', '[\"mixology\",\"cocktail preparation\",\"cocktail craft\",\"drink mixing\",\"beverage preparation\",\"bar operations\",\"beverage service\"]', 1, '2026-10-18 09:06:13', NULL),
(53, 'skill', 'Night Audit Procedures', '[\"night audit procedures\",\"night audit\",\"night auditing\",\"daily audit\",\"end-of-day reporting\"]', 1, '2026-10-18 09:06:13', NULL),
(54, 'skill', 'OTA Extranet Management', '[\"ota extranet management\"]', 1, '2026-10-18 09:06:13', NULL),
(55, 'skill', 'Operational Planning', '[\"operational planning\"]', 1, '2026-10-18 09:06:13', NULL),
(56, 'skill', 'Order Taking', '[\"order taking\",\"taking orders\",\"order processing\"]', 1, '2026-10-18 09:06:13', NULL),
(57, 'skill', 'POS Systems', '[\"pos systems\",\"pos\",\"point of sale\",\"point of sale systems\",\"micros\",\"micros pos\",\"toast pos\",\"pos operation\",\"pos system operation\"]', 1, '2026-10-18 09:06:13', NULL),
(58, 'skill', 'Pastry and Baking', '[\"pastry\",\"baking\",\"pastry arts\",\"dessert preparation\",\"breads and pastries\",\"pastry preparation\",\"basic baking\",\"bread production\"]', 1, '2026-10-18 09:06:13', NULL),
(59, 'skill', 'Payment Processing', '[\"payment processing\",\"processing payments\",\"credit card processing\"]', 1, '2026-10-18 09:06:13', NULL),
(60, 'skill', 'Payroll Support', '[\"payroll support\",\"payroll processing\",\"payroll assistance\"]', 1, '2026-10-18 09:06:13', NULL),
(61, 'skill', 'Plating', '[\"plating\",\"food plating\",\"plate presentation\",\"presentation\",\"dessert plating\"]', 1, '2026-10-18 09:06:13', NULL),
(62, 'skill', 'Problem Resolution', '[\"problem resolution\"]', 1, '2026-10-18 09:06:13', NULL),
(63, 'skill', 'Problem Solving', '[\"problem solving\",\"problem-solving\",\"troubleshooting\"]', 1, '2026-10-18 09:06:13', NULL),
(64, 'skill', 'Procurement Support', '[\"procurement\",\"purchasing\",\"purchase order processing\",\"purchase orders\",\"purchase order documentation\",\"vendor coordination\",\"supplier coordination\",\"receiving & inspection\"]', 1, '2026-10-18 09:06:13', NULL),
(65, 'skill', 'Property Management Systems', '[\"opera pms\",\"opera\",\"property management system\",\"pms systems\",\"pms\",\"opera cloud\",\"ids next\",\"siteminder\"]', 1, '2026-10-18 09:06:13', NULL),
(66, 'skill', 'Public Area Cleaning', '[\"public area cleaning\",\"public area maintenance\"]', 1, '2026-10-18 09:06:13', NULL),
(67, 'skill', 'Quality Assurance', '[\"quality assurance\",\"food quality control\",\"qa inspections\",\"internal audit\",\"compliance monitoring\"]', 1, '2026-10-18 09:06:13', NULL),
(68, 'skill', 'Records Documentation', '[\"documentation\",\"records management\",\"file management\",\"201 files\",\"inventory documentation\"]', 1, '2026-10-18 09:06:13', NULL),
(69, 'skill', 'Recreation Management', '[\"recreation equipment management\",\"guest activities supervision\",\"seasonal program development\",\"vendor & entertainment coordination\",\"activities supervision\",\"resort recreation\"]', 1, '2026-10-18 09:06:13', NULL),
(70, 'skill', 'Recreation Program Planning', '[\"recreation program planning\",\"guest recreation\",\"activity scheduling\",\"activity facilitation\",\"leisure coordination\"]', 1, '2026-10-18 09:06:13', NULL),
(71, 'skill', 'Recreation Safety Awareness', '[\"recreation safety awareness\"]', 1, '2026-10-18 09:06:13', NULL),
(72, 'skill', 'Recruitment Support', '[\"recruitment\",\"recruitment support\",\"sourcing and screening\"]', 1, '2026-10-18 09:06:13', NULL),
(73, 'skill', 'Reservation Reporting & Forecasting', '[\"reservation reporting & forecasting\",\"reservation reporting and forecasting\"]', 1, '2026-10-18 09:06:13', NULL),
(74, 'skill', 'Reservations', '[\"reservations\",\"reservation management\",\"booking management\",\"reservation support\",\"reservation updates\",\"room inventory\",\"ota coordination\"]', 1, '2026-10-18 09:06:13', NULL),
(75, 'skill', 'Resort Accommodation Services', '[\"resort accommodation services\"]', 1, '2026-10-18 09:06:13', NULL),
(76, 'skill', 'Responsible Alcohol Service', '[\"responsible alcohol service\",\"responsible service of alcohol\",\"alcohol awareness\"]', 1, '2026-10-18 09:06:13', NULL),
(77, 'skill', 'Restaurant Operations Management', '[\"restaurant operations management\",\"restaurant operations\",\"inventory monitoring & ordering\",\"service quality monitoring\",\"f&b operations\",\"food & beverage management\"]', 1, '2026-10-18 09:06:13', NULL),
(78, 'skill', 'Revenue Management Support', '[\"revenue management support\",\"revenue management\",\"rate parity\",\"occupancy forecasting\",\"rate monitoring\"]', 1, '2026-10-18 09:06:13', NULL),
(79, 'skill', 'Room Status Coordination', '[\"room status coordination\"]', 1, '2026-10-18 09:06:13', NULL),
(80, 'skill', 'Room Turnover', '[\"room turnover\",\"room cleaning\",\"guestroom cleaning\"]', 1, '2026-10-18 09:06:13', NULL),
(81, 'skill', 'Safety Compliance', '[\"safety compliance\",\"workplace safety\",\"safety procedures\",\"occupational safety\",\"safety protocols\"]', 1, '2026-10-18 09:06:13', NULL),
(82, 'skill', 'Scheduling', '[\"scheduling\",\"shift scheduling\",\"staff scheduling\",\"kitchen scheduling\"]', 1, '2026-10-18 09:06:13', NULL),
(83, 'skill', 'Spa Reception', '[\"spa reception\",\"spa operations\",\"wellness reception\"]', 1, '2026-10-18 09:06:13', NULL),
(84, 'skill', 'Staff Training', '[\"staff training\",\"team training\",\"new hire training\",\"staff coaching\",\"training & onboarding\"]', 1, '2026-10-18 09:06:13', NULL),
(85, 'skill', 'Table Management', '[\"table management\",\"seating management\",\"table turnover\",\"hostess duties\"]', 1, '2026-10-18 09:06:13', NULL),
(86, 'skill', 'Table Service', '[\"table service\",\"food service\",\"service sequence\",\"dining room service\",\"table setting\"]', 1, '2026-10-18 09:06:13', NULL),
(87, 'skill', 'Team Leadership', '[\"team leadership\",\"staff supervision\",\"team supervision\",\"leading teams\",\"shift supervision\",\"floor supervision\"]', 1, '2026-10-18 09:06:13', NULL),
(88, 'skill', 'Teamwork', '[\"teamwork\",\"team collaboration\",\"working with others\"]', 1, '2026-10-18 09:06:13', NULL),
(89, 'skill', 'Technical and Plumbing Maintenance', '[\"basic plumbing repair\",\"plumbing repair\",\"emergency repair response\",\"equipment inspection\",\"maintenance supply inventory\",\"electrical repair\",\"plumbing maintenance\"]', 1, '2026-10-18 09:06:13', NULL),
(90, 'skill', 'Telephone Etiquette', '[\"telephone etiquette\",\"phone etiquette\",\"call handling\",\"booking correspondence\"]', 1, '2026-10-18 09:06:13', NULL),
(91, 'skill', 'Time Management', '[\"time management\",\"prioritization\",\"multitasking\"]', 1, '2026-10-18 09:06:13', NULL),
(92, 'skill', 'Tourism Services', '[\"tourism services\"]', 1, '2026-10-18 09:06:13', NULL),
(93, 'skill', 'Training Program Development', '[\"training program development\"]', 1, '2026-10-18 09:06:13', NULL),
(94, 'skill', 'Upselling', '[\"upselling\",\"upsell techniques\",\"suggestive selling\",\"cross-selling\",\"sales & upselling\"]', 1, '2026-10-18 09:06:13', NULL),
(95, 'job_role', 'Accounts Assistant', '[\"accounts assistant\",\"accounting assistant\",\"finance assistant\",\"bookkeeper\"]', 1, '2026-10-18 09:06:13', NULL),
(96, 'job_role', 'Banquet Operations Supervisor', '[\"banquet operations supervisor\",\"banquet supervisor\",\"banquet operations manager\",\"banquet manager\"]', 1, '2026-10-18 09:06:13', NULL),
(97, 'job_role', 'Banquet Service Team Leader', '[\"banquet service team leader\",\"banquet team leader\",\"banquet service supervisor\",\"banquet team supervisor\"]', 1, '2026-10-18 09:06:13', NULL),
(98, 'job_role', 'Bar Operations Supervisor', '[\"bar operations supervisor\",\"restaurant bar operations supervisor\",\"bar supervisor\",\"bar manager\",\"bar lead\",\"bar team leader\"]', 1, '2026-10-18 09:06:13', NULL),
(99, 'job_role', 'Barista', '[\"barista\",\"coffee shop staff\",\"cafe barista\",\"coffee attendant\"]', 1, '2026-10-18 09:06:13', NULL),
(100, 'job_role', 'Bartender', '[\"bartender\",\"bar tender\",\"barman\",\"barkeep\",\"mixologist\"]', 1, '2026-10-18 09:06:13', NULL),
(101, 'job_role', 'Beverage Service Specialist', '[\"beverage service specialist\",\"restaurant beverage service specialist\",\"beverage specialist\",\"bar specialist\",\"beverage attendant\"]', 1, '2026-10-18 09:06:13', NULL),
(102, 'job_role', 'Catering Operations Coordinator', '[\"catering operations coordinator\",\"catering coordinator\",\"banquet catering coordinator\",\"catering operations\"]', 1, '2026-10-18 09:06:13', NULL),
(103, 'job_role', 'Catering and Banquet Sales Coordinator', '[\"catering and banquet sales coordinator\",\"catering sales coordinator\",\"banquet sales coordinator\",\"catering coordinator\",\"banquet sales assistant\"]', 1, '2026-10-18 09:06:13', NULL),
(104, 'job_role', 'Chef', '[\"chef\",\"sous chef\",\"head chef\",\"executive chef\",\"chef de partie\",\"executive sous chef\",\"banquet chef\",\"demi chef\"]', 1, '2026-10-18 09:06:13', NULL),
(105, 'job_role', 'Concierge', '[\"concierge\",\"hotel concierge\",\"bell captain\",\"bellman\"]', 1, '2026-10-18 09:06:13', NULL),
(106, 'job_role', 'Culinary Production Coordinator', '[\"culinary production coordinator\",\"kitchen production coordinator\",\"culinary coordinator\",\"culinary production\"]', 1, '2026-10-18 09:06:13', NULL),
(107, 'job_role', 'Dining Service Supervisor', '[\"dining service supervisor\",\"restaurant service supervisor\",\"dining supervisor\",\"service supervisor dining\",\"dining room supervisor\"]', 1, '2026-10-18 09:06:13', NULL),
(108, 'job_role', 'Events Catering Supervisor', '[\"events catering supervisor\",\"catering supervisor\",\"event catering coordinator\",\"banquet catering supervisor\"]', 1, '2026-10-18 09:06:13', NULL),
(109, 'job_role', 'Events Coordinator', '[\"sales and events coordinator\",\"hotel sales and events coordinator\",\"events coordinator\",\"banquet coordinator\",\"event coordinator\",\"catering assistant\",\"events and catering assistant\",\"banquet sales assistant\",\"banquet server\"]', 1, '2026-10-18 09:06:13', NULL),
(110, 'job_role', 'Executive Housekeeper', '[\"executive housekeeper\",\"housekeeping manager\",\"housekeeping executive\",\"head housekeeper\"]', 1, '2026-10-18 09:06:13', NULL),
(111, 'job_role', 'Food Beverage Events Supervisor', '[\"food beverage events supervisor\",\"food and beverage events supervisor\",\"f&b events supervisor\",\"food beverage supervisor\"]', 1, '2026-10-18 09:06:13', NULL),
(112, 'job_role', 'Food Production Supervisor', '[\"food production supervisor\",\"kitchen production supervisor\",\"food production coordinator\",\"culinary production supervisor\"]', 1, '2026-10-18 09:06:13', NULL),
(113, 'job_role', 'Food and Beverage Manager', '[\"food and beverage manager\",\"f&b manager\",\"restaurant manager\",\"food & beverage manager\"]', 1, '2026-10-18 09:06:13', NULL),
(114, 'job_role', 'Front Desk Associate', '[\"front desk associate\",\"front office associate\",\"front desk representative\",\"guest service representative\",\"front desk clerk\",\"front office intern\"]', 1, '2026-10-18 09:06:13', NULL),
(115, 'job_role', 'Front Desk Receptionist', '[\"front desk agent\",\"front desk officer\",\"front desk receptionist\",\"front desk staff\",\"front office associate\",\"guest service agent\",\"receptionist\"]', 1, '2026-10-18 09:06:13', NULL),
(116, 'job_role', 'Front Office Manager', '[\"front office manager\",\"front desk manager\",\"front office lead\",\"guest services manager\"]', 1, '2026-10-18 09:06:13', NULL),
(117, 'job_role', 'General Manager', '[\"general manager\",\"gm\",\"property manager\"]', 1, '2026-10-18 09:06:13', NULL),
(118, 'job_role', 'Guest Booking Team Leader', '[\"guest booking team leader\",\"booking team leader\",\"reservations team leader\",\"booking services team leader\"]', 1, '2026-10-18 09:06:13', NULL),
(119, 'job_role', 'Guest Experience Coordinator', '[\"guest experience coordinator\",\"guest experience and loyalty coordinator\",\"hotel guest experience and loyalty coordinator\",\"loyalty coordinator\"]', 1, '2026-10-18 09:06:13', NULL),
(120, 'job_role', 'Guest Experience Officer', '[\"guest experience officer\",\"guest experience coordinator\",\"guest experience specialist\",\"gxo\",\"guest experience officer hotel\"]', 1, '2026-10-18 09:06:13', NULL),
(121, 'job_role', 'Guest Relations Officer', '[\"gro\",\"guest relations coordinator\",\"guest relations officer\",\"guest service officer\",\"guest relations associate\"]', 1, '2026-10-18 09:06:13', NULL),
(122, 'job_role', 'HR Assistant', '[\"hr assistant\",\"human resource assistant\",\"human resources assistant\",\"hr staff\",\"recruitment assistant\"]', 1, '2026-10-18 09:06:13', NULL),
(123, 'job_role', 'HR Manager', '[\"hr manager\",\"human resources manager\",\"hr administration manager\"]', 1, '2026-10-18 09:06:13', NULL),
(124, 'job_role', 'Hospitality Client Relations Team Leader', '[\"hospitality client relations team leader\",\"client relations team leader\",\"client relations supervisor\",\"hospitality client relations supervisor\"]', 1, '2026-10-18 09:06:13', NULL),
(125, 'job_role', 'Hospitality Corporate Sales Coordinator', '[\"hospitality corporate sales coordinator\",\"corporate sales coordinator\",\"corporate sales officer\",\"sales coordinator corporate\",\"hospitality sales coordinator\"]', 1, '2026-10-18 09:06:13', NULL),
(126, 'job_role', 'Hospitality Facilities Team Leader', '[\"hospitality facilities team leader\",\"facilities team leader\",\"facilities supervisor\",\"hospitality facilities supervisor\"]', 1, '2026-10-18 09:06:13', NULL),
(127, 'job_role', 'Hospitality Kitchen Coordinator', '[\"hospitality kitchen coordinator\",\"kitchen coordinator\",\"hospitality kitchen\",\"culinary coordinator\"]', 1, '2026-10-18 09:06:13', NULL),
(128, 'job_role', 'Hospitality Maintenance Coordinator', '[\"hospitality maintenance coordinator\",\"maintenance coordinator\",\"facilities maintenance coordinator\",\"hospitality maintenance supervisor\"]', 1, '2026-10-18 09:06:13', NULL),
(129, 'job_role', 'Hospitality Reservations Specialist', '[\"hospitality reservations specialist\",\"reservations specialist\",\"hospitality reservations officer\",\"reservations officer hospitality\"]', 1, '2026-10-18 09:06:13', NULL),
(130, 'job_role', 'Hostess', '[\"hostess\",\"food host\",\"restaurant host\",\"fine dining restaurant host\",\"host\"]', 1, '2026-10-18 09:06:13', NULL),
(131, 'job_role', 'Hotel Banquet Coordinator', '[\"hotel banquet coordinator\",\"banquet coordinator\",\"hotel banquet\",\"banquet events coordinator\"]', 1, '2026-10-18 09:06:13', NULL),
(132, 'job_role', 'Hotel Booking Services Officer', '[\"hotel booking services officer\",\"booking services officer\",\"hotel booking officer\",\"booking officer hotel\"]', 1, '2026-10-18 09:06:13', NULL),
(133, 'job_role', 'Hotel Business Development Coordinator', '[\"hotel business development coordinator\",\"business development coordinator\",\"business development officer\",\"hotel sales development coordinator\",\"business development coordinator hotel\"]', 1, '2026-10-18 09:06:13', NULL),
(134, 'job_role', 'Hotel Engineering Operations Assistant', '[\"hotel engineering operations assistant\",\"engineering operations assistant\",\"hotel engineering assistant\",\"engineering assistant hotel\"]', 1, '2026-10-18 09:06:13', NULL),
(135, 'job_role', 'Hotel Events Sales Officer', '[\"hotel events sales officer\",\"events sales officer\",\"event sales officer\",\"hotel sales officer\",\"events officer hotel\"]', 1, '2026-10-18 09:06:13', NULL),
(136, 'job_role', 'Hotel Facilities Supervisor', '[\"hotel facilities supervisor\",\"facilities supervisor\",\"property maintenance supervisor\",\"hotel facilities manager\"]', 1, '2026-10-18 09:06:13', NULL),
(137, 'job_role', 'Hotel Front Office Supervisor', '[\"hotel front office supervisor\",\"front office supervisor\",\"front desk supervisor\",\"hotel front office manager\",\"front office lead\"]', 1, '2026-10-18 09:06:13', NULL),
(138, 'job_role', 'Hotel Night Auditor', '[\"night auditor\",\"hotel night auditor\",\"night audit associate\",\"night audit supervisor\"]', 1, '2026-10-18 09:06:13', NULL),
(139, 'job_role', 'Hotel Property Maintenance Supervisor', '[\"hotel property maintenance supervisor\",\"property maintenance supervisor\",\"maintenance supervisor hotel\",\"property maintenance manager\"]', 1, '2026-10-18 09:06:13', NULL),
(140, 'job_role', 'Hotel Reservations Manager', '[\"hotel reservations manager\",\"reservations manager\",\"hotel reservations supervisor\",\"reservations manager hotel\"]', 1, '2026-10-18 09:06:13', NULL),
(141, 'job_role', 'Hotel Reservations Sales Coordinator', '[\"hotel reservations sales coordinator\",\"reservations sales coordinator\",\"hotel reservations sales\",\"reservations coordinator sales\"]', 1, '2026-10-18 09:06:13', NULL),
(142, 'job_role', 'Hotel Reservations Supervisor', '[\"hotel reservations supervisor\",\"reservations supervisor\",\"hotel reservations manager\",\"reservations manager hotel\"]', 1, '2026-10-18 09:06:13', NULL),
(143, 'job_role', 'Hotel Revenue Analyst', '[\"hotel revenue analyst\",\"revenue analyst\",\"revenue management analyst\",\"hotel revenue management analyst\",\"pricing analyst\",\"revenue analyst hotel\"]', 1, '2026-10-18 09:06:13', NULL),
(144, 'job_role', 'Hotel Sales and Events Supervisor', '[\"hotel sales and events supervisor\",\"sales and events supervisor\",\"hotel sales supervisor\",\"sales events supervisor\",\"hotel sales and events coordinator\"]', 1, '2026-10-18 09:06:13', NULL),
(145, 'job_role', 'Housekeeping Attendant', '[\"housekeeping attendant\",\"room attendant\",\"housekeeper\",\"chambermaid\",\"roomboy\",\"public area attendant\"]', 1, '2026-10-18 09:06:13', NULL),
(146, 'job_role', 'Housekeeping Supervisor', '[\"housekeeping supervisor\",\"hotel housekeeping supervisor\",\"floor housekeeper\",\"executive housekeeper\"]', 1, '2026-10-18 09:06:13', NULL),
(147, 'job_role', 'Inventory Supervisor', '[\"inventory supervisor\",\"cost control supervisor\",\"restaurant inventory and cost control supervisor\",\"inventory and cost control supervisor\",\"stock controller\",\"inventory clerk\",\"restaurant stock controller\"]', 1, '2026-10-18 09:06:13', NULL),
(148, 'job_role', 'Kitchen Helper', '[\"kitchen helper\",\"dishwasher\",\"kitchen aide\",\"steward\",\"kitchen steward\",\"kitchen staff\"]', 1, '2026-10-18 09:06:13', NULL),
(149, 'job_role', 'Kitchen Operations Supervisor', '[\"kitchen operations supervisor\",\"culinary operations supervisor\",\"kitchen supervisor operations\",\"kitchen operations manager\"]', 1, '2026-10-18 09:06:13', NULL),
(150, 'job_role', 'Kitchen Supervisor', '[\"kitchen supervisor\",\"restaurant kitchen supervisor\",\"culinary supervisor\",\"chef supervisor\"]', 1, '2026-10-18 09:06:13', NULL),
(151, 'job_role', 'Laundry Attendant', '[\"laundry attendant\",\"laundry staff\"]', 1, '2026-10-18 09:06:13', NULL),
(152, 'job_role', 'Laundry Supervisor', '[\"laundry supervisor\",\"hotel laundry supervisor\",\"laundry team leader\"]', 1, '2026-10-18 09:06:13', NULL),
(153, 'job_role', 'Line Cook', '[\"line cook\",\"cook\",\"station cook\",\"hot kitchen cook\",\"commis chef\",\"kitchen cook\",\"senior line cook\"]', 1, '2026-10-18 09:06:13', NULL),
(154, 'job_role', 'Maintenance Technician', '[\"maintenance technician\",\"hotel maintenance technician\",\"maintenance staff\",\"handyman\",\"building maintenance staff\",\"facilities assistant\"]', 1, '2026-10-18 09:06:13', NULL),
(155, 'job_role', 'Pastry Chef', '[\"pastry chef\",\"baker\",\"pastry cook\",\"baker chef\"]', 1, '2026-10-18 09:06:13', NULL),
(156, 'job_role', 'Pastry and Bakery Assistant', '[\"pastry assistant\",\"bakery assistant\",\"bakery trainee\",\"pastry cook\"]', 1, '2026-10-18 09:06:13', NULL),
(157, 'job_role', 'Purchasing Coordinator', '[\"purchasing coordinator\",\"procurement coordinator\",\"hotel purchasing and procurement coordinator\",\"purchasing and inventory assistant\",\"purchasing assistant\",\"procurement assistant\"]', 1, '2026-10-18 09:06:13', NULL),
(158, 'job_role', 'Quality Assurance Officer', '[\"quality assurance officer\",\"restaurant quality assurance and food safety officer\",\"food safety officer\",\"qa officer\",\"qa and food safety officer\",\"qa assistant\",\"restaurant compliance officer\"]', 1, '2026-10-18 09:06:13', NULL),
(159, 'job_role', 'Recreation Supervisor', '[\"recreation supervisor\",\"resort recreation and activities supervisor\",\"activities supervisor\",\"recreation coordinator\",\"activities coordinator\",\"hotel recreation and activities coordinator\",\"resort activities assistant\"]', 1, '2026-10-18 09:06:13', NULL),
(160, 'job_role', 'Reservations Booking Coordinator', '[\"reservations booking coordinator\",\"booking coordinator\",\"reservations coordinator\",\"hotel booking coordinator\"]', 1, '2026-10-18 09:06:13', NULL),
(161, 'job_role', 'Reservations Coordinator', '[\"reservations coordinator\",\"hotel reservations and distribution coordinator\",\"reservations and distribution coordinator\",\"reservations officer\",\"reservations assistant\",\"hotel reservations assistant\",\"hotel reservations officer\"]', 1, '2026-10-18 09:06:13', NULL),
(162, 'job_role', 'Reservations Manager', '[\"reservations manager\",\"reservation manager\",\"booking manager\"]', 1, '2026-10-18 09:06:13', NULL),
(163, 'job_role', 'Resort Guest Experience Manager', '[\"resort guest experience manager\",\"guest experience manager\",\"guest experience supervisor\",\"resort guest relations manager\"]', 1, '2026-10-18 09:06:13', NULL),
(164, 'job_role', 'Resort Housekeeping Operations Manager', '[\"resort housekeeping operations manager\",\"housekeeping operations manager\",\"resort housekeeping manager\",\"housekeeping manager\",\"housekeeping operations supervisor\",\"resort housekeeping operations\"]', 1, '2026-10-18 09:06:13', NULL),
(165, 'job_role', 'Resort Operations Manager', '[\"resort operations manager\",\"hotel operations manager\",\"resort manager\",\"operations manager resort\"]', 1, '2026-10-18 09:06:13', NULL),
(166, 'job_role', 'Resort Property Operations Coordinator', '[\"resort property operations coordinator\",\"property operations coordinator\",\"property coordinator\",\"resort operations coordinator\"]', 1, '2026-10-18 09:06:13', NULL),
(167, 'job_role', 'Resort Recreation and Activities Manager', '[\"resort recreation and activities manager\",\"recreation and activities manager\",\"resort recreation manager\",\"activities manager\",\"recreation supervisor resort\"]', 1, '2026-10-18 09:06:13', NULL),
(168, 'job_role', 'Restaurant Beverage Supervisor', '[\"restaurant beverage supervisor\",\"beverage supervisor\",\"bar supervisor\",\"beverage service supervisor\",\"restaurant bar supervisor\"]', 1, '2026-10-18 09:06:13', NULL),
(169, 'job_role', 'Restaurant Cashier', '[\"restaurant cashier\",\"cashier\",\"cashier and customer service associate\",\"dining cashier\",\"customer service associate\"]', 1, '2026-10-18 09:06:13', NULL),
(170, 'job_role', 'Restaurant Culinary Operations Officer', '[\"restaurant culinary operations officer\",\"culinary operations officer\",\"restaurant culinary officer\",\"culinary officer restaurant\"]', 1, '2026-10-18 09:06:13', NULL),
(171, 'job_role', 'Restaurant Customer Experience Coordinator', '[\"restaurant customer experience coordinator\",\"customer experience coordinator\",\"cx coordinator\",\"guest experience coordinator restaurant\",\"customer experience coordinator restaurant\"]', 1, '2026-10-18 09:06:13', NULL),
(172, 'job_role', 'Restaurant Events and Banquet Coordinator', '[\"restaurant events and banquet coordinator\",\"events and banquet coordinator\",\"restaurant events coordinator\",\"banquet coordinator\",\"events coordinator restaurant\"]', 1, '2026-10-18 09:06:13', NULL),
(173, 'job_role', 'Restaurant Guest Relations Supervisor', '[\"restaurant guest relations supervisor\",\"guest relations supervisor\",\"restaurant guest relations coordinator\",\"guest relations supervisor restaurant\"]', 1, '2026-10-18 09:06:13', NULL),
(174, 'job_role', 'Restaurant Kitchen Team Leader', '[\"restaurant kitchen team leader\",\"kitchen team leader\",\"restaurant kitchen team\",\"kitchen supervisor team leader\"]', 1, '2026-10-18 09:06:13', NULL),
(175, 'job_role', 'Restaurant Procurement and Purchasing Coordinator', '[\"restaurant procurement and purchasing coordinator\",\"procurement and purchasing coordinator\",\"restaurant procurement coordinator\",\"purchasing coordinator\",\"procurement coordinator\"]', 1, '2026-10-18 09:06:13', NULL),
(176, 'job_role', 'Restaurant Relations Coordinator', '[\"restaurant relations coordinator\",\"guest relations coordinator\",\"relations coordinator\",\"restaurant guest relations coordinator\"]', 1, '2026-10-18 09:06:13', NULL),
(177, 'job_role', 'Restaurant Server', '[\"restaurant server\",\"waiter\",\"waitress\",\"food server\",\"server\",\"food and beverage attendant\",\"f&b attendant\",\"service crew\",\"restaurant crew member\"]', 1, '2026-10-18 09:06:14', NULL),
(178, 'job_role', 'Restaurant Service Team Leader', '[\"restaurant service team leader\",\"service team leader\",\"restaurant team leader\",\"service supervisor\",\"restaurant service supervisor\"]', 1, '2026-10-18 09:06:14', NULL),
(179, 'job_role', 'Restaurant Supervisor', '[\"restaurant supervisor\",\"floor supervisor\",\"service supervisor\",\"senior server lead\",\"food and beverage supervisor\",\"f&b supervisor\"]', 1, '2026-10-18 09:06:14', NULL),
(180, 'job_role', 'Revenue Management Assistant', '[\"revenue management assistant\",\"hotel revenue management assistant\",\"revenue assistant\",\"pricing assistant\"]', 1, '2026-10-18 09:06:14', NULL),
(181, 'job_role', 'Spa Receptionist', '[\"spa receptionist\",\"hotel spa and wellness receptionist\",\"wellness receptionist\",\"spa front desk\",\"spa and wellness receptionist\"]', 1, '2026-10-18 09:06:14', NULL),
(182, 'job_role', 'Supervisor', '[\"supervisor\",\"shift supervisor\",\"team leader\"]', 1, '2026-10-18 09:06:14', NULL),
(183, 'certification', 'Advanced Negotiation Skills for Sales Professionals, 2022', '[\"advanced negotiation skills for sales professionals, 2022\",\"advanced negotiation skills for sales professionals,\"]', 1, '2026-10-18 09:06:14', NULL),
(184, 'certification', 'Banquet and Event Service Excellence Training - Philippine Hotel Owners Association (2022)', '[\"banquet and event service excellence training - philippine hotel owners association (2022)\",\"banquet and event service excellence training - philippine hotel owners association\",\"banquet and event service excellence training\"]', 1, '2026-10-18 09:06:14', NULL),
(185, 'certification', 'Barista NC II', '[\"barista nc ii\",\"tesda barista nc ii\",\"coffee academy certificate\"]', 1, '2026-10-18 09:06:14', NULL),
(186, 'certification', 'Barista and Coffee Craft Training', '[\"barista and coffee craft training\",\"barista & coffee craft training\",\"coffee craft training\",\"barista training\"]', 1, '2026-10-18 09:06:14', NULL),
(187, 'certification', 'Basic Bookkeeping and Accounting Training', '[\"basic bookkeeping and accounting training\",\"basic bookkeeping training\",\"basic accounting for non-accountants\",\"bookkeeping training\",\"basic cost accounting training\"]', 1, '2026-10-18 09:06:14', NULL),
(188, 'certification', 'Basic Electrical Systems Maintenance Certificate - TESDA (2013)', '[\"basic electrical systems maintenance certificate - tesda (2013)\",\"basic electrical systems maintenance certificate - tesda\",\"basic electrical systems maintenance certificate\"]', 1, '2026-10-18 09:06:14', NULL),
(189, 'certification', 'Basic First Aid and CPR Certification', '[\"basic first aid and cpr certification\",\"basic first aid and cpr\",\"basic first aid training\",\"basic occupational first aid\",\"first aid and cpr\",\"basic life support and first aid certification\",\"basic first aid and safety training\",\"first aid certificate\",\"first aid training certificate\",\"standard first aid\",\"basic first aid\"]', 1, '2026-10-18 09:06:14', NULL),
(190, 'certification', 'Basic Occupational Safety and Health Training', '[\"basic occupational safety and health training\",\"occupational safety and health training\",\"occupational safety and health awareness training\",\"workplace safety training\",\"osh training\",\"bosh training\"]', 1, '2026-10-18 09:06:14', NULL),
(191, 'certification', 'Business Development Fundamentals for Hospitality, 2024', '[\"business development fundamentals for hospitality, 2024\",\"business development fundamentals for hospitality,\"]', 1, '2026-10-18 09:06:14', NULL),
(192, 'certification', 'Cash Handling and POS Training', '[\"cash handling and pos training\",\"cash handling & pos training\",\"cash handling and pos system operation\"]', 1, '2026-10-18 09:06:14', NULL),
(193, 'certification', 'Catering Sales Fundamentals Training, 2023', '[\"catering sales fundamentals training, 2023\",\"catering sales fundamentals training,\"]', 1, '2026-10-18 09:06:14', NULL),
(194, 'certification', 'Client Relations Leadership Workshop, 2024', '[\"client relations leadership workshop, 2024\",\"client relations leadership workshop,\"]', 1, '2026-10-18 09:06:14', NULL),
(195, 'certification', 'Culinary Diploma', '[\"culinary diploma\",\"diploma in culinary arts\",\"culinary arts diploma\",\"culinary arts\"]', 1, '2026-10-18 09:06:14', NULL),
(196, 'certification', 'Culinary Production Training, 2023', '[\"culinary production training, 2023\",\"culinary production training,\"]', 1, '2026-10-18 09:06:14', NULL),
(197, 'certification', 'Customer Service Excellence Training', '[\"customer service excellence training\",\"customer service excellence certification\",\"customer service excellence workshop\",\"customer service training\",\"hospitality guest relations training\",\"customer service and guest relations training\"]', 1, '2026-10-18 09:06:14', NULL),
(198, 'certification', 'Data Analysis Fundamentals', '[\"data analysis fundamentals\",\"data analysis fundamentals \\u2014 coursera\",\"hospitality data analytics\"]', 1, '2026-10-18 09:06:14', NULL),
(199, 'certification', 'Data Privacy and Information Security Training', '[\"data privacy and guest information awareness\",\"data privacy awareness\",\"guest data confidentiality training\"]', 1, '2026-10-18 09:06:14', NULL),
(200, 'certification', 'Driver\'s License', '[\"driver\'s license\",\"drivers license\",\"professional driver license\",\"non-professional driver license\"]', 1, '2026-10-18 09:06:14', NULL),
(201, 'certification', 'Event Management Training', '[\"events management training\",\"event management training\",\"event management fundamentals\",\"events and recreation management training\",\"event facilitation training certificate\",\"event facilitation training\"]', 1, '2026-10-18 09:06:14', NULL),
(202, 'certification', 'Facilities Management Training - Philippine Society of Ventilating, Air-Conditioning and Refrigerating Engineers (2020)', '[\"facilities management training - philippine society of ventilating, air-conditioning and refrigerating engineers (2020)\",\"facilities management training - philippine society of ventilating, air-conditioning and refrigerating engineers\",\"facilities management training - philippine society of ventilating, air\"]', 1, '2026-10-18 09:06:14', NULL),
(203, 'certification', 'Fine-Dining Service Training', '[\"fine-dining service training\",\"fine dining service training\",\"fine dining service training \\u2014 peninsula academy\",\"upscale dining service training\"]', 1, '2026-10-18 09:06:14', NULL),
(204, 'certification', 'Food Handler Certificate', '[\"food handler certificate\",\"food handler\'s certificate\",\"food handlers certificate\",\"food safety certificate\",\"food handler card\"]', 1, '2026-10-18 09:06:14', NULL),
(205, 'certification', 'Food Safety Awareness Certification, 2021', '[\"food safety awareness certification, 2021\",\"food safety awareness certification,\"]', 1, '2026-10-18 09:06:14', NULL),
(206, 'certification', 'Food Safety and Hygiene Certification', '[\"food safety and hygiene certification\",\"food safety and hygiene training\",\"food safety and sanitation training\",\"food safety supervisor certification\",\"food safety supervisor certification (haccp)\",\"food safety & hygiene certification\",\"food safety training\",\"food safety certification\",\"restaurant operations and food safety orientation\",\"hygiene and sanitation training\"]', 1, '2026-10-18 09:06:14', NULL),
(207, 'certification', 'Food and Beverage Cost Control Training', '[\"food and beverage cost control training\",\"f&b cost control training\",\"cost control training\"]', 1, '2026-10-18 09:06:14', NULL),
(208, 'certification', 'Front Office & Reservation Systems Training, 2022', '[\"front office & reservation systems training, 2022\",\"front office & reservation systems training,\"]', 1, '2026-10-18 09:06:14', NULL),
(209, 'certification', 'Front Office Team Leadership Workshop, 2024', '[\"front office team leadership workshop, 2024\",\"front office team leadership workshop,\"]', 1, '2026-10-18 09:06:14', NULL),
(210, 'certification', 'Guest Communication Standards Workshop, 2021', '[\"guest communication standards workshop, 2021\",\"guest communication standards workshop,\"]', 1, '2026-10-18 09:06:14', NULL),
(211, 'certification', 'Guest Relations and Customer Experience Training', '[\"guest relations and customer experience training\",\"guest relations and customer experience training - philippine hotel and restaurant association\",\"crm fundamentals training\",\"customer relationship management training\",\"professional communication and etiquette training\",\"professional etiquette training\",\"business communication workshop\"]', 1, '2026-10-18 09:06:14', NULL),
(212, 'certification', 'HACCP Awareness Training', '[\"haccp awareness training\",\"haccp certification\",\"haccp training\",\"food safety (haccp)\",\"food safety supervisor certification (haccp)\",\"haccp compliance training\"]', 1, '2026-10-18 09:06:14', NULL),
(213, 'certification', 'Hospitality Leadership Training - Hotel and Restaurant Association of the Philippines (2020)', '[\"hospitality leadership training - hotel and restaurant association of the philippines (2020)\",\"hospitality leadership training - hotel and restaurant association of the philippines\",\"hospitality leadership training\"]', 1, '2026-10-18 09:06:14', NULL),
(214, 'certification', 'Hospitality Sales Support Fundamentals, 2022', '[\"hospitality sales support fundamentals, 2022\",\"hospitality sales support fundamentals,\"]', 1, '2026-10-18 09:06:14', NULL),
(215, 'certification', 'Hospitality Sales Training, Philippine Hotel Sales Association, 2021', '[\"hospitality sales training, philippine hotel sales association, 2021\",\"hospitality sales training, philippine hotel sales association,\"]', 1, '2026-10-18 09:06:14', NULL),
(216, 'certification', 'Hotel Front Office Operations Training', '[\"hotel front office operations training\",\"front office operations training\",\"front office training\",\"hospitality service training (front office operations)\",\"hotel front office training\"]', 1, '2026-10-18 09:06:14', NULL),
(217, 'certification', 'Hotel Reservation Systems Training – Opera PMS Certification, 2021', '[\"hotel reservation systems training \\u2013 opera pms certification, 2021\",\"hotel reservation systems training \\u2013 opera pms certification,\"]', 1, '2026-10-18 09:06:14', NULL),
(218, 'certification', 'Hotel Revenue Management Training', '[\"hotel revenue management training\",\"revenue management training\"]', 1, '2026-10-18 09:06:14', NULL),
(219, 'certification', 'Housekeeping and Laundry Operations Training', '[\"housekeeping and sanitation training\",\"laundry operations training\",\"laundry operations training \\u2014 philippine hotel owners association\",\"hotel housekeeping operations training\"]', 1, '2026-10-18 09:06:14', NULL),
(220, 'certification', 'Internal Quality Audit Training', '[\"internal quality audit training\",\"internal quality audit training \\u2014 bureau veritas philippines\",\"quality audit training\",\"iso internal audit training\"]', 1, '2026-10-18 09:06:14', NULL),
(221, 'certification', 'Inventory Management Training', '[\"inventory management training\",\"inventory management training certificate\",\"inventory control training\"]', 1, '2026-10-18 09:06:14', NULL),
(222, 'certification', 'Kitchen Inventory & Cost Control Basics, 2023', '[\"kitchen inventory & cost control basics, 2023\",\"kitchen inventory & cost control basics,\"]', 1, '2026-10-18 09:06:14', NULL),
(223, 'certification', 'Kitchen Operations Training, Philippine Culinary Federation, 2022', '[\"kitchen operations training, philippine culinary federation, 2022\",\"kitchen operations training, philippine culinary federation,\"]', 1, '2026-10-18 09:06:14', NULL),
(224, 'certification', 'Microsoft Excel Certification', '[\"microsoft excel certification\",\"microsoft excel advanced certification\",\"advanced microsoft excel for business analytics\",\"microsoft excel for financial reporting\",\"microsoft excel training\",\"microsoft excel training (intermediate)\",\"microsoft excel intermediate certification\"]', 1, '2026-10-18 09:06:14', NULL),
(225, 'certification', 'Opera PMS Training', '[\"opera pms training\",\"opera cloud pms reservations training certificate\",\"opera pms reservation system training\",\"hotel reservation system fundamentals\",\"siteminder channel manager fundamentals\"]', 1, '2026-10-18 09:06:14', NULL),
(226, 'certification', 'Pastry and Dessert Plating Training', '[\"cake decoration and dessert plating training\",\"advanced pastry training\",\"advanced pastry training \\u2014 le cordon bleu manila\",\"dessert plating training\"]', 1, '2026-10-18 09:06:14', NULL),
(227, 'certification', 'Procurement and Supply Chain Fundamentals Training', '[\"procurement and supply chain fundamentals training\",\"basic purchasing and procurement training\",\"basic purchasing and vendor management training\",\"purchasing and supply management training\"]', 1, '2026-10-18 09:06:14', NULL),
(228, 'certification', 'Recreation and Leisure Management Training', '[\"recreation and leisure management training\",\"recreation management training\",\"activity facilitation and event coordination training\",\"events and recreation management training\",\"resort recreation management training\"]', 1, '2026-10-18 09:06:14', NULL),
(229, 'certification', 'Reservation & Rate Management Training, 2023', '[\"reservation & rate management training, 2023\",\"reservation & rate management training,\"]', 1, '2026-10-18 09:06:14', NULL),
(230, 'certification', 'Reservation & Sales Coordination Training, 2024', '[\"reservation & sales coordination training, 2024\",\"reservation & sales coordination training,\"]', 1, '2026-10-18 09:06:14', NULL),
(231, 'certification', 'Reservation Documentation & Booking Systems Training, 2023', '[\"reservation documentation & booking systems training, 2023\",\"reservation documentation & booking systems training,\"]', 1, '2026-10-18 09:06:14', NULL),
(232, 'certification', 'Responsible Beverage Service Training', '[\"responsible beverage service training\",\"responsible beverage service\",\"responsible alcohol service training\",\"beverage service training\",\"bar operations training\"]', 1, '2026-10-18 09:06:14', NULL),
(233, 'certification', 'Restaurant Service Standards Training, 2023', '[\"restaurant service standards training, 2023\",\"restaurant service standards training,\"]', 1, '2026-10-18 09:06:14', NULL),
(234, 'certification', 'Sales and Client Relations Training, 2023', '[\"sales and client relations training, 2023\",\"sales and client relations training,\"]', 1, '2026-10-18 09:06:14', NULL),
(235, 'certification', 'Service Recovery and Complaint Handling Workshop (2019)', '[\"service recovery and complaint handling workshop (2019)\",\"service recovery and complaint handling workshop\"]', 1, '2026-10-18 09:06:14', NULL),
(236, 'certification', 'Spa and Wellness Service Training', '[\"spa and wellness service training\",\"spa reception & guest service training\",\"spa reception and guest service training\",\"wellness & hospitality service training\",\"wellness and hospitality service training\"]', 1, '2026-10-18 09:06:14', NULL),
(237, 'certification', 'Supervisory and Leadership Training', '[\"basic supervisory skills training\",\"basic supervisory skills training - hospitality skills institute\",\"leadership and supervisory training\",\"hospitality supervisory skills training\"]', 1, '2026-10-18 09:06:14', NULL),
(238, 'certification', 'TESDA Bartending NC II', '[\"tesda bartending nc ii\",\"bartending nc ii\",\"bartending nc 2\",\"tesda nc ii in bartending\"]', 1, '2026-10-18 09:06:14', NULL),
(239, 'certification', 'TESDA Bread and Pastry Production NC II', '[\"bread and pastry production nc ii\",\"baking nc ii\",\"pastry production nc ii\",\"tesda bread and pastry production nc ii\",\"bread and pastry nc ii\"]', 1, '2026-10-18 09:06:14', NULL);
INSERT INTO `screening_reference_data` (`ref_id`, `data_type`, `canonical_value`, `aliases_json`, `active`, `created_at`, `updated_at`) VALUES
(240, 'certification', 'TESDA Cookery NC II', '[\"tesda cookery nc ii\",\"cookery nc ii\",\"tesda cookery nc 2\",\"commercial cooking nc ii\",\"tesda nc ii in cookery\",\"tesda cookery\"]', 1, '2026-10-18 09:06:14', NULL),
(241, 'certification', 'TESDA Electrical Installation and Maintenance NC II', '[\"electrical installation and maintenance nc ii\",\"tesda electrical installation and maintenance nc ii\",\"electrical installation nc ii\",\"electrical installation & maintenance nc ii\"]', 1, '2026-10-18 09:06:14', NULL),
(242, 'certification', 'TESDA Food and Beverage Services NC II', '[\"food and beverage services nc ii\",\"f&b services nc ii\",\"fb services nc ii\",\"food and beverage nc ii\",\"tesda food and beverage services nc ii\",\"food & beverage services nc ii\"]', 1, '2026-10-18 09:06:14', NULL),
(243, 'certification', 'TESDA Front Office NC II', '[\"tesda front office nc ii\",\"front office nc ii\",\"front office services nc ii\",\"tesda front office services nc ii\"]', 1, '2026-10-18 09:06:14', NULL),
(244, 'certification', 'TESDA Housekeeping NC II', '[\"tesda housekeeping nc ii\",\"housekeeping nc ii\",\"housekeeping nc 2\",\"tesda nc ii in housekeeping\"]', 1, '2026-10-18 09:06:14', NULL),
(245, 'certification', 'Team Leadership for Front Office Supervisors, 2022', '[\"team leadership for front office supervisors, 2022\",\"team leadership for front office supervisors,\"]', 1, '2026-10-18 09:06:14', NULL),
(246, 'certification', 'Technical Maintenance and Plumbing Training', '[\"basic plumbing training\",\"plumbing maintenance training\",\"facility maintenance training\"]', 1, '2026-10-18 09:06:14', NULL),
(247, 'education', 'High School Graduate', '[\"high school graduate\",\"high school\",\"secondary education\",\"senior high school\",\"senior high\",\"grade 12\",\"k to 12\"]', 1, '2026-10-19 09:05:25', NULL),
(248, 'education', 'Vocational / TESDA', '[\"vocational \\/ tesda\",\"vocational\",\"tesda\",\"vocational diploma\",\"technical course\",\"technical vocational\",\"nc ii holder\"]', 1, '2026-10-19 09:05:25', NULL),
(249, 'education', 'College Level', '[\"college level\",\"college undergraduate\",\"undergraduate\",\"some college\",\"associate degree\",\"associate\",\"diploma\"]', 1, '2026-10-19 09:05:25', NULL),
(250, 'education', 'Bachelor\'s Degree', '[\"bachelor\'s degree\",\"bachelor\'s\",\"bachelor\",\"b.s.\",\"bs\",\"b.a.\",\"ba\",\"college graduate\",\"bachelor\'s degree holder\",\"bachelor degree\"]', 1, '2026-10-19 09:05:25', NULL),
(251, 'education', 'Bachelor of Science in Hospitality Management', '[\"bachelor of science in hospitality management\",\"bs hospitality management\",\"bshm\",\"bs hm\",\"hospitality management degree\"]', 1, '2026-10-19 09:05:25', NULL),
(252, 'education', 'Bachelor of Science in Tourism Management', '[\"bachelor of science in tourism management\",\"bs tourism\",\"bs tourism management\",\"tourism degree\"]', 1, '2026-10-19 09:05:25', NULL),
(253, 'education', 'Bachelor of Science in Business Administration', '[\"bachelor of science in business administration\",\"bsba\",\"bs business administration\",\"business administration degree\"]', 1, '2026-10-19 09:05:25', NULL),
(254, 'education', 'Bachelor degree in Hospitality or related field', '[\"bachelor degree in hospitality or related field\",\"bachelor in hospitality\",\"hospitality degree or related field\",\"degree in hospitality\"]', 1, '2026-10-19 09:05:25', NULL),
(255, 'education', 'Master\'s Degree', '[\"master\'s degree\",\"master\'s\",\"master\",\"m.s.\",\"mba\",\"graduate degree\",\"postgraduate degree\"]', 1, '2026-10-19 09:05:25', NULL),
(256, 'education', 'Doctorate', '[\"doctorate\",\"phd\",\"doctoral degree\",\"ph.d.\"]', 1, '2026-10-19 09:05:25', NULL),
(257, 'experience', 'No Experience', '[\"no experience\",\"fresh graduate\",\"entry level\",\"no work experience\",\"student\"]', 1, '2026-10-19 09:05:25', NULL),
(258, 'experience', '1-2 Years', '[\"1-2 years\",\"1 to 2 years\",\"one to two years\",\"at least 1 year\",\"1 year experience\",\"2 years experience\"]', 1, '2026-10-19 09:05:25', NULL),
(259, 'experience', '3-5 Years', '[\"3-5 years\",\"3 to 5 years\",\"three to five years\",\"at least 3 years\",\"3 years experience\",\"5 years experience\"]', 1, '2026-10-19 09:05:25', NULL),
(260, 'experience', '5+ Years', '[\"5+ years\",\"5 years and above\",\"more than 5 years\",\"five plus years\",\"senior level experience\",\"extensive experience\"]', 1, '2026-10-19 09:05:25', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `screening_requirement_templates`
--

CREATE TABLE IF NOT EXISTS `screening_requirement_templates` (
  `template_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  `position_id` bigint(20) UNSIGNED DEFAULT NULL,
  `description` varchar(500) DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  PRIMARY KEY (`template_id`),
  KEY `idx_screening_req_templates_position` (`position_id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `screening_requirement_templates`
--

INSERT INTO `screening_requirement_templates` (`template_id`, `name`, `position_id`, `description`, `active`, `created_at`, `updated_at`) VALUES
(1, 'Front Desk Receptionist — Core Requirements', 1, 'Guest-facing front office essentials the spaCy screening scores against.', 1, '2026-10-18 01:06:14', '2026-10-18 01:06:14'),
(2, 'Guest Relations Officer — Core Requirements', 2, 'Complaint recovery and VIP handling for the guest relations desk.', 1, '2026-10-18 01:06:14', '2026-10-18 01:06:14'),
(3, 'Restaurant Server — Core Requirements', 3, 'Table service and upselling requirements for the all-day dining outlet.', 1, '2026-10-18 01:06:14', '2026-10-18 01:06:14'),
(4, 'Bartender — Core Requirements', 4, 'Bar craft, inventory control and the TESDA bartending credential.', 1, '2026-10-18 01:06:14', '2026-10-18 01:06:14'),
(5, 'Line Cook — Core Requirements', 5, 'Hot-kitchen station requirements with food safety credentials.', 1, '2026-10-18 01:06:14', '2026-10-18 01:06:14'),
(6, 'Pastry Chef — Core Requirements', 6, 'Baking and dessert plating requirements for the pastry section.', 1, '2026-10-18 01:06:14', '2026-10-18 01:06:14'),
(7, 'Housekeeping Attendant — Core Requirements', 7, 'Room turnover and chemical-safety requirements for rooms division.', 1, '2026-10-18 01:06:14', '2026-10-18 01:06:14'),
(8, 'HR Assistant — Core Requirements', 8, 'Recruitment support and records-management requirements.', 1, '2026-10-18 01:06:14', '2026-10-18 01:06:14');

-- --------------------------------------------------------

--
-- Table structure for table `screening_requirement_template_items`
--

CREATE TABLE IF NOT EXISTS `screening_requirement_template_items` (
  `item_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `template_id` bigint(20) UNSIGNED NOT NULL,
  `entity_type` varchar(20) NOT NULL,
  `value` varchar(255) NOT NULL,
  `required` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`item_id`),
  UNIQUE KEY `uq_screening_req_items_value` (`template_id`,`entity_type`,`value`),
  KEY `idx_screening_req_items_template` (`template_id`)
) ENGINE=InnoDB AUTO_INCREMENT=56 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `screening_requirement_template_items`
--

INSERT INTO `screening_requirement_template_items` (`item_id`, `template_id`, `entity_type`, `value`, `required`, `created_at`) VALUES
(1, 1, 'skill', 'Guest Relations', 1, '2026-10-18 09:06:14'),
(2, 1, 'skill', 'Opera PMS', 1, '2026-10-18 09:06:14'),
(3, 1, 'skill', 'Check-in / Check-out', 1, '2026-10-18 09:06:14'),
(4, 1, 'skill', 'Cash Handling', 1, '2026-10-18 09:06:14'),
(5, 1, 'skill', 'Reservations', 1, '2026-10-18 09:06:14'),
(6, 1, 'certification', 'TESDA Front Office NC II', 1, '2026-10-18 09:06:14'),
(7, 1, 'education', 'Bachelor\'s Degree', 1, '2026-10-18 09:06:14'),
(8, 1, 'experience', '1-2 Years', 1, '2026-10-18 09:06:14'),
(9, 2, 'skill', 'Guest Relations', 1, '2026-10-18 09:06:14'),
(10, 2, 'skill', 'Complaint Handling', 1, '2026-10-18 09:06:14'),
(11, 2, 'skill', 'VIP Handling', 1, '2026-10-18 09:06:14'),
(12, 2, 'skill', 'Multilingual', 1, '2026-10-18 09:06:14'),
(13, 2, 'education', 'Bachelor\'s Degree', 1, '2026-10-18 09:06:14'),
(14, 2, 'experience', '3-5 Years', 1, '2026-10-18 09:06:14'),
(15, 3, 'skill', 'Table Service', 1, '2026-10-18 09:06:14'),
(16, 3, 'skill', 'POS Systems', 1, '2026-10-18 09:06:14'),
(17, 3, 'skill', 'Banquet Service', 1, '2026-10-18 09:06:14'),
(18, 3, 'skill', 'Food Safety', 1, '2026-10-18 09:06:14'),
(19, 3, 'skill', 'Upselling', 1, '2026-10-18 09:06:14'),
(20, 3, 'education', 'High School Graduate', 1, '2026-10-18 09:06:14'),
(21, 3, 'experience', 'No Experience', 1, '2026-10-18 09:06:14'),
(22, 4, 'skill', 'Mixology', 1, '2026-10-18 09:06:14'),
(23, 4, 'skill', 'Cocktail Craft', 1, '2026-10-18 09:06:14'),
(24, 4, 'skill', 'Inventory', 1, '2026-10-18 09:06:14'),
(25, 4, 'skill', 'Bar Hygiene', 1, '2026-10-18 09:06:14'),
(26, 4, 'certification', 'TESDA Bartending NC II', 1, '2026-10-18 09:06:14'),
(27, 4, 'education', 'Vocational / TESDA', 1, '2026-10-18 09:06:14'),
(28, 4, 'experience', '1-2 Years', 1, '2026-10-18 09:06:14'),
(29, 5, 'skill', 'Hot Kitchen', 1, '2026-10-18 09:06:14'),
(30, 5, 'skill', 'Food Handler', 1, '2026-10-18 09:06:14'),
(31, 5, 'skill', 'HACCP', 1, '2026-10-18 09:06:14'),
(32, 5, 'skill', 'Mise en Place', 1, '2026-10-18 09:06:14'),
(33, 5, 'skill', 'Plating', 1, '2026-10-18 09:06:14'),
(34, 5, 'certification', 'TESDA Cookery NC II', 1, '2026-10-18 09:06:14'),
(35, 5, 'education', 'Vocational / TESDA', 1, '2026-10-18 09:06:14'),
(36, 5, 'experience', '1-2 Years', 1, '2026-10-18 09:06:14'),
(37, 6, 'skill', 'Pastry', 1, '2026-10-18 09:06:14'),
(38, 6, 'skill', 'Baking', 1, '2026-10-18 09:06:14'),
(39, 6, 'skill', 'Dessert Plating', 1, '2026-10-18 09:06:14'),
(40, 6, 'skill', 'HACCP', 1, '2026-10-18 09:06:14'),
(41, 6, 'education', 'Vocational / TESDA', 1, '2026-10-18 09:06:14'),
(42, 6, 'experience', '3-5 Years', 1, '2026-10-18 09:06:14'),
(43, 7, 'skill', 'Room Turnover', 1, '2026-10-18 09:06:14'),
(44, 7, 'skill', 'Linen Handling', 1, '2026-10-18 09:06:14'),
(45, 7, 'skill', 'Chemical Safety', 1, '2026-10-18 09:06:14'),
(46, 7, 'skill', 'Public Area Cleaning', 1, '2026-10-18 09:06:14'),
(47, 7, 'certification', 'TESDA Housekeeping NC II', 1, '2026-10-18 09:06:14'),
(48, 7, 'education', 'High School Graduate', 1, '2026-10-18 09:06:14'),
(49, 7, 'experience', 'No Experience', 1, '2026-10-18 09:06:14'),
(50, 8, 'skill', 'Recruitment', 1, '2026-10-18 09:06:14'),
(51, 8, 'skill', '201 Files', 1, '2026-10-18 09:06:14'),
(52, 8, 'skill', 'Payroll Support', 1, '2026-10-18 09:06:14'),
(53, 8, 'skill', 'DOLE Compliance', 1, '2026-10-18 09:06:14'),
(54, 8, 'education', 'Bachelor\'s Degree', 1, '2026-10-18 09:06:14'),
(55, 8, 'experience', '1-2 Years', 1, '2026-10-18 09:06:14');

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE IF NOT EXISTS `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('0mQJ6dElVBbwvD8gZZncT5ck0kHuCrbmyY22Q6em', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:158.0) Gecko/20100101 Firefox/158.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiWHA2QjVURHJ2UG50ZXBnOWk3M0MxcGRIaVFQMTlJaVpBWkxaZDZyTSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1792422978),
('gfpRRlHHIvuy4ZOM4vUSNDphONvifBNorNYYjxPM', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:158.0) Gecko/20100101 Firefox/158.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiY08wekEyYjRzVVJQRFN5RWdsRWVlNlBqWEJHbGFTUWhxQ05MZGc2byI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1792398913),
('JWUemD9Q0yGkeSMgk8AY4H5jhA0EqCxFvaeb0mRE', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:158.0) Gecko/20100101 Firefox/158.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiODBuZ1F6REpsSXVSd1BKcndEMkVITk4yaFNCWHV0Uk5uZ2c0U215ZCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1792387775),
('N5k11ckxsTmnxtkt7Fa2HxEqfl2JviOZUCsypJrK', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:158.0) Gecko/20100101 Firefox/158.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiMUREVGd3VXpPcGFhZjJ6Ukp6aUNtb0dqa0syVmR5TWhEMFM0QlBlMyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1792563106),
('WMZ8SNAY6a3jsRD6k1LMuj7GuiWf8W7H6vI4tec5', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Code/1.142.0 Chrome/150.0.7871.250 Electron/43.7.7 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiTUQyT3MxY0Uybjl1S2ZyWkg5VUtSM3RiN0M2ZkpRa2NrcXYzMng3ciI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1792478320),
('zkD9FZzEO6HxrM2n3JsRcQ25TKN9ASrb4GNiYdKZ', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:158.0) Gecko/20100101 Firefox/158.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiOHFuc2dnSlF1ZkZIcTJQMnBpaTBTSTJvbzc4RzV3YjdkTWJpOGZWbCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1792506845);

-- --------------------------------------------------------

--
-- Table structure for table `social_recognitions`
--

CREATE TABLE IF NOT EXISTS `social_recognitions` (
  `recognition_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `sender_employee_id` bigint(20) UNSIGNED DEFAULT NULL,
  `recipient_employee_id` bigint(20) UNSIGNED DEFAULT NULL,
  `sender_name` varchar(255) NOT NULL,
  `recipient_name` varchar(255) NOT NULL,
  `sender_role` varchar(255) DEFAULT NULL,
  `recipient_role` varchar(255) DEFAULT NULL,
  `core_value` varchar(100) NOT NULL,
  `message` text NOT NULL,
  `clap_count` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `heart_count` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `star_count` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `fire_count` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`recognition_id`),
  KEY `social_recognitions_sender_employee_id_index` (`sender_employee_id`),
  KEY `social_recognitions_recipient_employee_id_index` (`recipient_employee_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `social_recognitions`
--

INSERT INTO `social_recognitions` (`recognition_id`, `sender_employee_id`, `recipient_employee_id`, `sender_name`, `recipient_name`, `sender_role`, `recipient_role`, `core_value`, `message`, `clap_count`, `heart_count`, `star_count`, `fire_count`, `created_at`, `updated_at`) VALUES
(1, NULL, 5, 'Chef Marco Rossi', 'Kevin Dela Cruz', 'Executive Chef · F&B', 'Line Cook · Kitchen / Culinary', 'Teamwork & Malasakit', 'Stepped up during the 200-guest executive banquet dinner rush and ensured flawless plating and zero delays!', 14, 8, 6, 5, '2026-08-21 01:30:00', '2026-08-21 01:30:00'),
(2, 3, 2, 'Paolo Cruz', 'Maria Santos', 'Payroll & HR Specialist · Administration / HR', 'Guest Relations Officer · Front Office', 'Guest Delight', 'Received a glowing 5-star TripAdvisor review from our corporate VIP praising your warmth, attentiveness, and swift check-in!', 19, 12, 10, 4, '2026-08-20 06:15:00', '2026-08-20 06:15:00'),
(3, 5, NULL, 'Kevin Dela Cruz', 'Chef Marco Rossi', 'Line Cook · Kitchen / Culinary', 'Executive Chef · F&B', 'Going the Extra Mile', 'Thank you for mentoring the team through the new seasonal tasting menu prep and always looking out for kitchen crew welfare!', 11, 7, 5, 2, '2026-08-19 09:00:00', '2026-08-19 09:00:00'),
(4, NULL, 7, 'Elena Torres', 'Ricardo Gomez', 'Housekeeping Supervisor · Housekeeping', 'Housekeeping Attendant · Housekeeping', 'Operational Excellence', 'Maintained a 100% spotless inspection pass rate across all 30 deluxe executive suites on Floor 8 with zero guest callbacks.', 9, 5, 8, 3, '2026-08-18 03:20:00', '2026-08-18 03:20:00');

-- --------------------------------------------------------

--
-- Table structure for table `system_roles`
--

CREATE TABLE IF NOT EXISTS `system_roles` (
  `role_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `role_name` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `is_super_admin` tinyint(1) NOT NULL DEFAULT 0,
  `is_protected` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`role_id`),
  UNIQUE KEY `system_roles_role_name_unique` (`role_name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `system_roles`
--

INSERT INTO `system_roles` (`role_id`, `role_name`, `description`, `is_super_admin`, `is_protected`, `created_at`, `updated_at`) VALUES
(1, 'Super Admin', 'Full system access across all modules and settings', 1, 1, '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(2, 'Admin', 'HR admin: recruitment, onboarding, employee records, ESS approval', 0, 0, '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(3, 'Employee', 'Self-service portal access for employees', 0, 0, '2026-10-18 09:06:13', '2026-10-18 09:06:13');

-- --------------------------------------------------------

--
-- Table structure for table `system_settings`
--

CREATE TABLE IF NOT EXISTS `system_settings` (
  `setting_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `setting_key` varchar(120) NOT NULL,
  `setting_value` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`setting_value`)),
  `updated_by_user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`setting_id`),
  UNIQUE KEY `system_settings_setting_key_unique` (`setting_key`),
  KEY `idx_system_settings_updated_by_user_id` (`updated_by_user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `system_settings`
--

INSERT INTO `system_settings` (`setting_id`, `setting_key`, `setting_value`, `updated_by_user_id`, `created_at`, `updated_at`) VALUES
(1, 'company.name', '{\"value\": \"Oxford Suites Makati\"}', 1, '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(2, 'company.timezone', '{\"value\": \"Asia/Manila\"}', 1, '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(3, 'password_policy', '{\"minLength\": 8, \"requireUppercase\": true, \"requireLowercase\": true, \"requireNumber\": true, \"requireSymbol\": true, \"twoFactor\": true, \"sessionTimeout\": \"30 minutes\", \"maxLoginAttempts\": \"3 attempts\"}', 1, '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(4, 'default_password', '{\"password\": \"Oxford@2026\"}', 1, '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(5, 'recruitment.screening.enabled', '{\"value\": true}', 1, '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(6, 'ess.default_processing_role', '{\"value\": \"Admin\"}', 1, '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(7, 'company', '{\"name\":\"Oxford Suites\",\"email\":\"hr@oxfordsuites.com.ph\",\"contact\":\"+63 2 8999 0000\",\"businessHours\":\"Monday\\u2013Friday \\u00b7 8:00 AM \\u2013 6:00 PM\",\"address\":\"123 Makati Avenue, Makati City, Metro Manila\",\"tin\":\"000-000-000-000\"}', NULL, '2026-10-18 01:06:14', '2026-10-18 01:06:14'),
(8, 'preferences', '{\"theme\":\"Light\",\"language\":\"English\",\"dateFormat\":\"MM\\/DD\\/YYYY\",\"timeFormat\":\"12-hour\",\"timeZone\":\"Asia\\/Manila (GMT+8)\"}', NULL, '2026-10-18 01:06:14', '2026-10-18 01:06:14'),
(9, 'notifications', '{\"Email notifications\":true,\"Browser notifications\":false,\"System announcements\":true}', NULL, '2026-10-18 01:06:14', '2026-10-18 01:06:14'),
(10, 'security', '{\"twoFactor\":false,\"minLength\":8,\"requireUppercase\":true,\"requireLowercase\":true,\"requireNumber\":true,\"requireSymbol\":false,\"sessionTimeout\":\"30 minutes\",\"maxLoginAttempts\":\"5 attempts\"}', NULL, '2026-10-18 01:06:14', '2026-10-18 01:06:14'),
(11, 'backup', '{\"enabled\":true,\"schedule\":\"daily\"}', NULL, '2026-10-18 01:06:14', '2026-10-18 01:06:14'),
(12, 'onboarding.auto_regularize_days', '180', NULL, '2026-10-18 01:06:14', '2026-10-18 01:06:14'),
(13, 'my_preferences_kevin.delacruz@oxfordsuites.com.ph', '{\"theme\":\"Light\",\"language\":\"Filipino\",\"dateFormat\":\"MM\\/DD\\/YYYY\",\"timeFormat\":\"12-hour\",\"timeZone\":\"Asia\\/Manila (GMT+8)\"}', 4, '2026-10-20 07:11:08', '2026-10-20 07:11:15');

-- --------------------------------------------------------

--
-- Table structure for table `system_users`
--

CREATE TABLE IF NOT EXISTS `system_users` (
  `system_user_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL,
  `email` varchar(190) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `full_name` varchar(160) DEFAULT NULL,
  `department_name` varchar(120) DEFAULT NULL,
  `employee_id` bigint(20) UNSIGNED DEFAULT NULL,
  `role_id` bigint(20) UNSIGNED NOT NULL,
  `status` varchar(20) NOT NULL,
  `otp_enabled` tinyint(1) NOT NULL DEFAULT 1,
  `mfa_method` varchar(20) NOT NULL DEFAULT 'email_otp',
  `totp_secret` text DEFAULT NULL,
  `totp_confirmed_at` timestamp NULL DEFAULT NULL,
  `mfa_recovery_codes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`mfa_recovery_codes`)),
  `failed_attempts` tinyint(3) UNSIGNED NOT NULL DEFAULT 0,
  `locked_until` timestamp NULL DEFAULT NULL,
  `last_login_at` timestamp NULL DEFAULT NULL,
  `last_login_ip` varchar(45) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`system_user_id`),
  UNIQUE KEY `system_users_username_unique` (`username`),
  UNIQUE KEY `system_users_email_unique` (`email`),
  UNIQUE KEY `system_users_employee_id_unique` (`employee_id`),
  KEY `idx_system_users_role_id` (`role_id`),
  KEY `idx_system_users_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `system_users`
--

INSERT INTO `system_users` (`system_user_id`, `username`, `email`, `password_hash`, `full_name`, `department_name`, `employee_id`, `role_id`, `status`, `otp_enabled`, `mfa_method`, `totp_secret`, `totp_confirmed_at`, `mfa_recovery_codes`, `failed_attempts`, `locked_until`, `last_login_at`, `last_login_ip`, `created_at`, `updated_at`) VALUES
(1, 'bullseur', 'bullseur@oxfordsuites.com.ph', '$2y$12$6zy.ybJ5.IklJ4owHs1fIO3jUC6T0g1YbByHisItNfFhUn079IJVW', 'Bullseur Santiago', 'Administration / HR', NULL, 1, 'Active', 0, 'email_otp', NULL, NULL, NULL, 0, NULL, '2026-10-20 23:08:38', '127.0.0.1', '2026-10-18 09:06:13', '2026-10-20 23:08:38'),
(2, 'jdelacruz', 'juan.delacruz@oxfordsuites.com.ph', '$2y$12$6zy.ybJ5.IklJ4owHs1fIO3jUC6T0g1YbByHisItNfFhUn079IJVW', 'Juan Dela Cruz', 'Administration / HR', 7, 2, 'Active', 1, 'email_otp', NULL, NULL, NULL, 0, NULL, '2026-07-25 23:58:00', '192.168.10.22', '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(3, 'aramos', 'ana.ramos@oxfordsuites.com.ph', '$2y$12$6zy.ybJ5.IklJ4owHs1fIO3jUC6T0g1YbByHisItNfFhUn079IJVW', 'Ana Ramos', 'Front Office', 1, 2, 'Active', 1, 'email_otp', NULL, NULL, NULL, 0, NULL, '2026-10-20 22:12:53', '127.0.0.1', '2026-10-18 09:06:13', '2026-10-20 22:12:53'),
(4, 'kdelacruz', 'kevin.delacruz@oxfordsuites.com.ph', '$2y$12$6zy.ybJ5.IklJ4owHs1fIO3jUC6T0g1YbByHisItNfFhUn079IJVW', 'Kevin Dela Cruz', 'Kitchen / Culinary', 5, 3, 'Active', 0, 'email_otp', NULL, NULL, NULL, 0, NULL, '2026-10-20 22:14:15', '127.0.0.1', '2026-10-18 09:06:13', '2026-10-20 22:14:15'),
(5, 'mdevera', 'marjun.devera@oxfordsuites.com.ph', '$2y$12$6zy.ybJ5.IklJ4owHs1fIO3jUC6T0g1YbByHisItNfFhUn079IJVW', 'Marjun Devera', 'Food & Beverage', 6, 3, 'Suspended', 1, 'email_otp', NULL, NULL, NULL, 0, NULL, '2026-07-20 11:11:00', '10.0.4.101', '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(6, 'raquino', 'rosa.aquino@oxfordsuites.com.ph', '$2y$12$6zy.ybJ5.IklJ4owHs1fIO3jUC6T0g1YbByHisItNfFhUn079IJVW', 'Rosa Aquino', 'Housekeeping', 8, 3, 'Active', 1, 'email_otp', NULL, NULL, NULL, 0, NULL, '2026-07-25 22:03:00', '10.0.4.57', '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(7, 'mlim', 'maria.lim@oxfordsuites.com.ph', '$2y$12$6zy.ybJ5.IklJ4owHs1fIO3jUC6T0g1YbByHisItNfFhUn079IJVW', 'Maria Lim', 'Administration / HR', 11, 2, 'Active', 1, 'email_otp', NULL, NULL, NULL, 0, NULL, '2026-07-25 23:45:00', '192.168.10.18', '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(8, 'pcruz', 'paolo.cruz@oxfordsuites.com.ph', '$2y$12$6zy.ybJ5.IklJ4owHs1fIO3jUC6T0g1YbByHisItNfFhUn079IJVW', 'Paolo Cruz', 'Administration / HR', 12, 2, 'Active', 1, 'email_otp', NULL, NULL, NULL, 0, NULL, '2026-07-25 09:30:00', '192.168.10.12', '2026-10-18 09:06:13', '2026-10-18 09:06:13');

-- --------------------------------------------------------

--
-- Table structure for table `user_login_activity`
--

CREATE TABLE IF NOT EXISTS `user_login_activity` (
  `login_activity_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `system_user_id` bigint(20) UNSIGNED NOT NULL,
  `login_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `ip_address` varchar(45) DEFAULT NULL,
  `device_info` varchar(255) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'success',
  PRIMARY KEY (`login_activity_id`),
  KEY `idx_user_login_activity_system_user_id` (`system_user_id`),
  KEY `idx_user_login_activity_login_at` (`login_at`),
  KEY `idx_user_login_activity_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_login_activity`
--

INSERT INTO `user_login_activity` (`login_activity_id`, `system_user_id`, `login_at`, `ip_address`, `device_info`, `user_agent`, `status`) VALUES
(1, 4, '2026-07-31 00:12:00', '10.0.4.88', 'Chrome · Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'success'),
(2, 4, '2026-07-30 10:45:00', '10.0.4.88', 'Mobile App · Android', 'OxfordSuitesHR/1.0 (Android 14)', 'success'),
(3, 4, '2026-07-25 01:30:00', '10.0.4.88', 'Edge · Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edg/126.0', 'success'),
(4, 1, '2026-07-26 00:12:00', '192.168.10.4', 'Chrome · Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0', 'success'),
(5, 2, '2026-07-25 23:58:00', '192.168.10.22', 'Edge · Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edg/126.0', 'success'),
(6, 5, '2026-07-25 12:41:00', '10.0.4.101', 'Chrome · Android', 'Mozilla/5.0 (Linux; Android 13; Chrome/126.0)', 'failed'),
(7, 5, '2026-07-25 12:40:00', '10.0.4.101', 'Chrome · Android', 'Mozilla/5.0 (Linux; Android 13; Chrome/126.0)', 'failed'),
(8, 5, '2026-07-20 11:11:00', '10.0.4.101', 'Chrome · Android', 'Mozilla/5.0 (Linux; Android 13; Chrome/126.0)', 'success'),
(9, 4, '2026-10-18 01:08:01', '127.0.0.1', 'Firefox on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:158.0) Gecko/20100101 Firefox/158.0', 'success'),
(10, 4, '2026-10-18 02:16:27', '127.0.0.1', 'Firefox on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:158.0) Gecko/20100101 Firefox/158.0', 'success'),
(11, 4, '2026-10-18 03:33:52', '127.0.0.1', 'Firefox on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:158.0) Gecko/20100101 Firefox/158.0', 'success'),
(12, 3, '2026-10-18 03:49:43', '127.0.0.1', 'Firefox on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:158.0) Gecko/20100101 Firefox/158.0', 'success'),
(13, 4, '2026-10-18 03:50:46', '127.0.0.1', 'Firefox on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:158.0) Gecko/20100101 Firefox/158.0', 'success'),
(14, 4, '2026-10-18 21:50:39', '127.0.0.1', 'Firefox on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:158.0) Gecko/20100101 Firefox/158.0', 'success'),
(15, 3, '2026-10-19 00:36:22', '127.0.0.1', 'Firefox on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:158.0) Gecko/20100101 Firefox/158.0', 'success'),
(16, 1, '2026-10-19 00:38:04', '127.0.0.1', 'Firefox on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:158.0) Gecko/20100101 Firefox/158.0', 'success'),
(17, 4, '2026-10-19 00:39:39', '127.0.0.1', 'Firefox on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:158.0) Gecko/20100101 Firefox/158.0', 'success'),
(18, 4, '2026-10-19 06:56:21', '127.0.0.1', 'Firefox on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:158.0) Gecko/20100101 Firefox/158.0', 'success'),
(19, 4, '2026-10-19 07:17:23', '127.0.0.1', 'Firefox on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:158.0) Gecko/20100101 Firefox/158.0', 'success'),
(20, 1, '2026-10-19 22:41:34', '127.0.0.1', 'Firefox on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:158.0) Gecko/20100101 Firefox/158.0', 'success'),
(21, 4, '2026-10-20 06:34:41', '127.0.0.1', 'Firefox on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:158.0) Gecko/20100101 Firefox/158.0', 'success'),
(22, 4, '2026-10-20 09:53:25', '127.0.0.1', 'Firefox on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:158.0) Gecko/20100101 Firefox/158.0', 'success'),
(23, 4, '2026-10-20 10:47:10', '127.0.0.1', 'Firefox on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:158.0) Gecko/20100101 Firefox/158.0', 'success'),
(24, 4, '2026-10-20 19:13:25', '127.0.0.1', 'Firefox on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:158.0) Gecko/20100101 Firefox/158.0', 'success'),
(25, 4, '2026-10-20 19:39:25', '127.0.0.1', 'Firefox on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:158.0) Gecko/20100101 Firefox/158.0', 'success'),
(26, 4, '2026-10-20 20:16:58', '127.0.0.1', 'Firefox on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:158.0) Gecko/20100101 Firefox/158.0', 'success'),
(27, 1, '2026-10-20 21:10:02', '127.0.0.1', 'Firefox on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:158.0) Gecko/20100101 Firefox/158.0', 'success'),
(28, 3, '2026-10-20 22:12:53', '127.0.0.1', 'Firefox on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:158.0) Gecko/20100101 Firefox/158.0', 'success'),
(29, 1, '2026-10-20 22:13:30', '127.0.0.1', 'Firefox on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:158.0) Gecko/20100101 Firefox/158.0', 'success'),
(30, 4, '2026-10-20 22:14:15', '127.0.0.1', 'Firefox on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:158.0) Gecko/20100101 Firefox/158.0', 'success'),
(31, 1, '2026-10-20 22:21:50', '127.0.0.1', 'Firefox on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:158.0) Gecko/20100101 Firefox/158.0', 'success'),
(32, 1, '2026-10-20 23:08:38', '127.0.0.1', 'Firefox on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:158.0) Gecko/20100101 Firefox/158.0', 'success');

-- --------------------------------------------------------

--
-- Table structure for table `work_schedules`
--

CREATE TABLE IF NOT EXISTS `work_schedules` (
  `work_schedule_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `employee_id` bigint(20) UNSIGNED NOT NULL,
  `day_of_week` smallint(6) NOT NULL,
  `shift_name` varchar(80) DEFAULT NULL,
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `location` varchar(120) DEFAULT NULL,
  `is_rest_day` tinyint(1) NOT NULL DEFAULT 0,
  `effective_from` date NOT NULL,
  `effective_to` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`work_schedule_id`),
  KEY `idx_work_schedules_employee_id` (`employee_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `work_schedules`
--

INSERT INTO `work_schedules` (`work_schedule_id`, `employee_id`, `day_of_week`, `shift_name`, `start_time`, `end_time`, `location`, `is_rest_day`, `effective_from`, `effective_to`, `created_at`, `updated_at`) VALUES
(1, 5, 0, 'AM Shift', '07:00:00', '16:00:00', 'Main Kitchen', 0, '2026-07-01', NULL, '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(2, 5, 1, 'AM Shift', '07:00:00', '16:00:00', 'Main Kitchen', 0, '2026-07-01', NULL, '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(3, 5, 2, 'Mid Shift', '11:00:00', '20:00:00', 'Banquet', 0, '2026-07-01', NULL, '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(4, 5, 3, 'Mid Shift', '11:00:00', '20:00:00', 'Banquet', 0, '2026-07-01', NULL, '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(5, 5, 4, 'PM Shift', '14:00:00', '23:00:00', 'Main Kitchen', 0, '2026-07-01', NULL, '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(6, 5, 5, NULL, NULL, NULL, NULL, 1, '2026-07-01', NULL, '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(7, 5, 6, NULL, NULL, NULL, NULL, 1, '2026-07-01', NULL, '2026-10-18 09:06:13', '2026-10-18 09:06:13');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `chatbot_faqs`
--
ALTER TABLE `chatbot_faqs` ADD FULLTEXT KEY `ft_chatbot_faqs_search` (`question`,`keywords`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `announcements`
--
ALTER TABLE `announcements`
  ADD CONSTRAINT `fk_announcements_created_by_user_id` FOREIGN KEY (`created_by_user_id`) REFERENCES `system_users` (`system_user_id`);

--
-- Constraints for table `applicants`
--
ALTER TABLE `applicants`
  ADD CONSTRAINT `fk_applicants_job_post_id` FOREIGN KEY (`job_post_id`) REFERENCES `job_posts` (`job_post_id`);

--
-- Constraints for table `applicant_assessments`
--
ALTER TABLE `applicant_assessments`
  ADD CONSTRAINT `fk_applicant_assessments_applicant_id` FOREIGN KEY (`applicant_id`) REFERENCES `applicants` (`applicant_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_applicant_assessments_assessor_user_id` FOREIGN KEY (`assessor_user_id`) REFERENCES `system_users` (`system_user_id`);

--
-- Constraints for table `applicant_documents`
--
ALTER TABLE `applicant_documents`
  ADD CONSTRAINT `fk_applicant_documents_applicant_id` FOREIGN KEY (`applicant_id`) REFERENCES `applicants` (`applicant_id`) ON DELETE CASCADE;

--
-- Constraints for table `applicant_screenings`
--
ALTER TABLE `applicant_screenings`
  ADD CONSTRAINT `fk_applicant_screenings_applicant_id` FOREIGN KEY (`applicant_id`) REFERENCES `applicants` (`applicant_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_applicant_screenings_job_post_id` FOREIGN KEY (`job_post_id`) REFERENCES `job_posts` (`job_post_id`) ON DELETE CASCADE;

--
-- Constraints for table `applicant_screening_entities`
--
ALTER TABLE `applicant_screening_entities`
  ADD CONSTRAINT `fk_applicant_screening_entities_applicant_id` FOREIGN KEY (`applicant_id`) REFERENCES `applicants` (`applicant_id`) ON DELETE CASCADE;

--
-- Constraints for table `applicant_screening_scores`
--
ALTER TABLE `applicant_screening_scores`
  ADD CONSTRAINT `fk_applicant_screening_scores_applicant_id` FOREIGN KEY (`applicant_id`) REFERENCES `applicants` (`applicant_id`) ON DELETE CASCADE;

--
-- Constraints for table `assessment_invites`
--
ALTER TABLE `assessment_invites`
  ADD CONSTRAINT `fk_assessment_invites_applicant_id` FOREIGN KEY (`applicant_id`) REFERENCES `applicants` (`applicant_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_assessment_invites_created_by_user_id` FOREIGN KEY (`created_by_user_id`) REFERENCES `system_users` (`system_user_id`);

--
-- Constraints for table `assessment_tests`
--
ALTER TABLE `assessment_tests`
  ADD CONSTRAINT `fk_assessment_tests_applicant_id` FOREIGN KEY (`applicant_id`) REFERENCES `applicants` (`applicant_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_assessment_tests_assessor_user_id` FOREIGN KEY (`assessor_user_id`) REFERENCES `system_users` (`system_user_id`);

--
-- Constraints for table `attendance_records`
--
ALTER TABLE `attendance_records`
  ADD CONSTRAINT `fk_attendance_records_employee_id` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE CASCADE;

--
-- Constraints for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD CONSTRAINT `fk_audit_logs_system_user_id` FOREIGN KEY (`system_user_id`) REFERENCES `system_users` (`system_user_id`) ON DELETE SET NULL;

--
-- Constraints for table `checklist_requests`
--
ALTER TABLE `checklist_requests`
  ADD CONSTRAINT `fk_checklist_requests_employee_id` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`),
  ADD CONSTRAINT `fk_checklist_requests_requested_by_user_id` FOREIGN KEY (`requested_by_user_id`) REFERENCES `system_users` (`system_user_id`),
  ADD CONSTRAINT `fk_checklist_requests_template_id` FOREIGN KEY (`template_id`) REFERENCES `onboarding_checklist_templates` (`template_id`);

--
-- Constraints for table `departments`
--
ALTER TABLE `departments`
  ADD CONSTRAINT `fk_departments_head_employee_id` FOREIGN KEY (`head_employee_id`) REFERENCES `employees` (`employee_id`);

--
-- Constraints for table `employees`
--
ALTER TABLE `employees`
  ADD CONSTRAINT `fk_employees_department_id` FOREIGN KEY (`department_id`) REFERENCES `departments` (`department_id`),
  ADD CONSTRAINT `fk_employees_position_id` FOREIGN KEY (`position_id`) REFERENCES `positions` (`position_id`),
  ADD CONSTRAINT `fk_employees_salary_grade_id` FOREIGN KEY (`salary_grade_id`) REFERENCES `salary_grades` (`salary_grade_id`),
  ADD CONSTRAINT `fk_employees_supervisor_employee_id` FOREIGN KEY (`supervisor_employee_id`) REFERENCES `employees` (`employee_id`);

--
-- Constraints for table `employee_benefits`
--
ALTER TABLE `employee_benefits`
  ADD CONSTRAINT `fk_employee_benefits_employee_id` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE CASCADE;

--
-- Constraints for table `employee_documents`
--
ALTER TABLE `employee_documents`
  ADD CONSTRAINT `fk_employee_documents_employee_id` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE CASCADE;

--
-- Constraints for table `employee_emergency_contacts`
--
ALTER TABLE `employee_emergency_contacts`
  ADD CONSTRAINT `fk_employee_emergency_contacts_employee_id` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE CASCADE;

--
-- Constraints for table `employee_exit_records`
--
ALTER TABLE `employee_exit_records`
  ADD CONSTRAINT `fk_employee_exit_records_employee_id` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE CASCADE;

--
-- Constraints for table `employee_learning`
--
ALTER TABLE `employee_learning`
  ADD CONSTRAINT `fk_employee_learning_course_id` FOREIGN KEY (`course_id`) REFERENCES `learning_courses` (`course_id`),
  ADD CONSTRAINT `fk_employee_learning_employee_id` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE CASCADE;

--
-- Constraints for table `employee_learning_attempts`
--
ALTER TABLE `employee_learning_attempts`
  ADD CONSTRAINT `fk_attempts_course_id` FOREIGN KEY (`course_id`) REFERENCES `learning_courses` (`course_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_attempts_employee_id` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE CASCADE;

--
-- Constraints for table `employee_onboarding_items`
--
ALTER TABLE `employee_onboarding_items`
  ADD CONSTRAINT `fk_employee_onboarding_items_completed_by_user_id` FOREIGN KEY (`completed_by_user_id`) REFERENCES `system_users` (`system_user_id`),
  ADD CONSTRAINT `fk_employee_onboarding_items_employee_id` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_employee_onboarding_items_new_hire_id` FOREIGN KEY (`new_hire_id`) REFERENCES `new_hires` (`new_hire_id`),
  ADD CONSTRAINT `fk_employee_onboarding_items_template_item_id` FOREIGN KEY (`template_item_id`) REFERENCES `onboarding_checklist_items` (`template_item_id`) ON DELETE SET NULL;

--
-- Constraints for table `employee_position_history`
--
ALTER TABLE `employee_position_history`
  ADD CONSTRAINT `fk_employee_position_history_employee_id` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_employee_position_history_new_position_id` FOREIGN KEY (`new_position_id`) REFERENCES `positions` (`position_id`),
  ADD CONSTRAINT `fk_employee_position_history_new_salary_grade_id` FOREIGN KEY (`new_salary_grade_id`) REFERENCES `salary_grades` (`salary_grade_id`),
  ADD CONSTRAINT `fk_employee_position_history_old_position_id` FOREIGN KEY (`old_position_id`) REFERENCES `positions` (`position_id`),
  ADD CONSTRAINT `fk_employee_position_history_old_salary_grade_id` FOREIGN KEY (`old_salary_grade_id`) REFERENCES `salary_grades` (`salary_grade_id`);

--
-- Constraints for table `ess_requests`
--
ALTER TABLE `ess_requests`
  ADD CONSTRAINT `fk_ess_requests_assigned_to_user_id` FOREIGN KEY (`assigned_to_user_id`) REFERENCES `system_users` (`system_user_id`),
  ADD CONSTRAINT `fk_ess_requests_category_id` FOREIGN KEY (`category_id`) REFERENCES `ess_categories` (`ess_category_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_ess_requests_employee_id` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`),
  ADD CONSTRAINT `fk_ess_requests_released_by` FOREIGN KEY (`released_by_user_id`) REFERENCES `system_users` (`system_user_id`) ON DELETE SET NULL;

--
-- Constraints for table `ess_request_attachments`
--
ALTER TABLE `ess_request_attachments`
  ADD CONSTRAINT `fk_ess_request_attachments_request_id` FOREIGN KEY (`ess_request_id`) REFERENCES `ess_requests` (`ess_request_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_ess_request_attachments_uploader` FOREIGN KEY (`uploaded_by_user_id`) REFERENCES `system_users` (`system_user_id`);

--
-- Constraints for table `ess_request_routings`
--
ALTER TABLE `ess_request_routings`
  ADD CONSTRAINT `fk_ess_request_routings_actor` FOREIGN KEY (`actor_user_id`) REFERENCES `system_users` (`system_user_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_ess_request_routings_request` FOREIGN KEY (`ess_request_id`) REFERENCES `ess_requests` (`ess_request_id`) ON DELETE CASCADE;

--
-- Constraints for table `ess_request_status_histories`
--
ALTER TABLE `ess_request_status_histories`
  ADD CONSTRAINT `fk_ess_request_status_histories_actor` FOREIGN KEY (`actor_user_id`) REFERENCES `system_users` (`system_user_id`),
  ADD CONSTRAINT `fk_ess_request_status_histories_request_id` FOREIGN KEY (`ess_request_id`) REFERENCES `ess_requests` (`ess_request_id`) ON DELETE CASCADE;

--
-- Constraints for table `final_evaluations`
--
ALTER TABLE `final_evaluations`
  ADD CONSTRAINT `fk_final_evaluations_applicant_id` FOREIGN KEY (`applicant_id`) REFERENCES `applicants` (`applicant_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_final_evaluations_evaluated_by` FOREIGN KEY (`evaluated_by_user_id`) REFERENCES `system_users` (`system_user_id`);

--
-- Constraints for table `hr3_recommendations`
--
ALTER TABLE `hr3_recommendations`
  ADD CONSTRAINT `fk_hr3_rec_promo_req` FOREIGN KEY (`promotion_request_id`) REFERENCES `promotion_requests` (`promotion_request_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_hr3_recommendations_employee_id` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`),
  ADD CONSTRAINT `fk_hr3_recommendations_evaluator_user_id` FOREIGN KEY (`evaluator_user_id`) REFERENCES `system_users` (`system_user_id`),
  ADD CONSTRAINT `fk_hr3_recommendations_suggested_position_id` FOREIGN KEY (`suggested_position_id`) REFERENCES `positions` (`position_id`),
  ADD CONSTRAINT `fk_hr3_recommendations_suggested_salary_grade_id` FOREIGN KEY (`suggested_salary_grade_id`) REFERENCES `salary_grades` (`salary_grade_id`);

--
-- Constraints for table `interviews`
--
ALTER TABLE `interviews`
  ADD CONSTRAINT `fk_interviews_applicant_id` FOREIGN KEY (`applicant_id`) REFERENCES `applicants` (`applicant_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_interviews_facility_id` FOREIGN KEY (`facility_id`) REFERENCES `facilities` (`facility_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_interviews_interviewer_employee_id` FOREIGN KEY (`interviewer_employee_id`) REFERENCES `employees` (`employee_id`);

--
-- Constraints for table `job_posts`
--
ALTER TABLE `job_posts`
  ADD CONSTRAINT `fk_job_posts_department_id` FOREIGN KEY (`department_id`) REFERENCES `departments` (`department_id`),
  ADD CONSTRAINT `fk_job_posts_position_id` FOREIGN KEY (`position_id`) REFERENCES `positions` (`position_id`);

--
-- Constraints for table `job_post_platforms`
--
ALTER TABLE `job_post_platforms`
  ADD CONSTRAINT `fk_job_post_platforms_job_post_id` FOREIGN KEY (`job_post_id`) REFERENCES `job_posts` (`job_post_id`) ON DELETE CASCADE;

--
-- Constraints for table `leave_balances`
--
ALTER TABLE `leave_balances`
  ADD CONSTRAINT `fk_leave_balances_employee_id` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE CASCADE;

--
-- Constraints for table `new_hires`
--
ALTER TABLE `new_hires`
  ADD CONSTRAINT `fk_new_hires_applicant_id` FOREIGN KEY (`applicant_id`) REFERENCES `applicants` (`applicant_id`),
  ADD CONSTRAINT `fk_new_hires_department_id` FOREIGN KEY (`department_id`) REFERENCES `departments` (`department_id`),
  ADD CONSTRAINT `fk_new_hires_employee_id` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`),
  ADD CONSTRAINT `fk_new_hires_position_id` FOREIGN KEY (`position_id`) REFERENCES `positions` (`position_id`);

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `fk_notifications_system_user_id` FOREIGN KEY (`system_user_id`) REFERENCES `system_users` (`system_user_id`) ON DELETE CASCADE;

--
-- Constraints for table `onboarding_checklist_items`
--
ALTER TABLE `onboarding_checklist_items`
  ADD CONSTRAINT `fk_onboarding_checklist_items_template_id` FOREIGN KEY (`template_id`) REFERENCES `onboarding_checklist_templates` (`template_id`) ON DELETE CASCADE;

--
-- Constraints for table `payroll_items`
--
ALTER TABLE `payroll_items`
  ADD CONSTRAINT `fk_payroll_items_payroll_record_id` FOREIGN KEY (`payroll_record_id`) REFERENCES `payroll_records` (`payroll_record_id`) ON DELETE CASCADE;

--
-- Constraints for table `payroll_records`
--
ALTER TABLE `payroll_records`
  ADD CONSTRAINT `fk_payroll_records_employee_id` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`),
  ADD CONSTRAINT `fk_payroll_records_payroll_period_id` FOREIGN KEY (`payroll_period_id`) REFERENCES `payroll_periods` (`payroll_period_id`);

--
-- Constraints for table `performance_reviews`
--
ALTER TABLE `performance_reviews`
  ADD CONSTRAINT `fk_performance_reviews_employee_id` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`),
  ADD CONSTRAINT `fk_performance_reviews_evaluator_user_id` FOREIGN KEY (`evaluator_user_id`) REFERENCES `system_users` (`system_user_id`),
  ADD CONSTRAINT `fk_performance_reviews_salary_grade_id` FOREIGN KEY (`salary_grade_id`) REFERENCES `salary_grades` (`salary_grade_id`);

--
-- Constraints for table `positions`
--
ALTER TABLE `positions`
  ADD CONSTRAINT `fk_positions_department_id` FOREIGN KEY (`department_id`) REFERENCES `departments` (`department_id`),
  ADD CONSTRAINT `fk_positions_salary_grade_id` FOREIGN KEY (`salary_grade_id`) REFERENCES `salary_grades` (`salary_grade_id`);

--
-- Constraints for table `practical_tests`
--
ALTER TABLE `practical_tests`
  ADD CONSTRAINT `fk_practical_tests_applicant_id` FOREIGN KEY (`applicant_id`) REFERENCES `applicants` (`applicant_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_practical_tests_assessor_user_id` FOREIGN KEY (`assessor_user_id`) REFERENCES `system_users` (`system_user_id`);

--
-- Constraints for table `promotion_requests`
--
ALTER TABLE `promotion_requests`
  ADD CONSTRAINT `fk_promo_req_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE CASCADE;

--
-- Constraints for table `recognition_reactions`
--
ALTER TABLE `recognition_reactions`
  ADD CONSTRAINT `recognition_reactions_employee_id_foreign` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `recognition_reactions_recognition_id_foreign` FOREIGN KEY (`recognition_id`) REFERENCES `social_recognitions` (`recognition_id`) ON DELETE CASCADE;

--
-- Constraints for table `requisitions`
--
ALTER TABLE `requisitions`
  ADD CONSTRAINT `fk_requisitions_converted_job_post_id` FOREIGN KEY (`converted_job_post_id`) REFERENCES `job_posts` (`job_post_id`),
  ADD CONSTRAINT `fk_requisitions_department_id` FOREIGN KEY (`department_id`) REFERENCES `departments` (`department_id`),
  ADD CONSTRAINT `fk_requisitions_position_id` FOREIGN KEY (`position_id`) REFERENCES `positions` (`position_id`),
  ADD CONSTRAINT `fk_requisitions_requested_by_user_id` FOREIGN KEY (`requested_by_user_id`) REFERENCES `system_users` (`system_user_id`);

--
-- Constraints for table `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD CONSTRAINT `fk_role_permissions_role_id` FOREIGN KEY (`role_id`) REFERENCES `system_roles` (`role_id`) ON DELETE CASCADE;

--
-- Constraints for table `screening_ground_truths`
--
ALTER TABLE `screening_ground_truths`
  ADD CONSTRAINT `fk_screening_gt_applicant_id` FOREIGN KEY (`applicant_id`) REFERENCES `applicants` (`applicant_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_screening_gt_job_post_id` FOREIGN KEY (`job_post_id`) REFERENCES `job_posts` (`job_post_id`) ON DELETE CASCADE;

--
-- Constraints for table `screening_requirement_templates`
--
ALTER TABLE `screening_requirement_templates`
  ADD CONSTRAINT `fk_screening_req_templates_position` FOREIGN KEY (`position_id`) REFERENCES `positions` (`position_id`) ON DELETE SET NULL;

--
-- Constraints for table `screening_requirement_template_items`
--
ALTER TABLE `screening_requirement_template_items`
  ADD CONSTRAINT `fk_screening_req_items_template` FOREIGN KEY (`template_id`) REFERENCES `screening_requirement_templates` (`template_id`) ON DELETE CASCADE;

--
-- Constraints for table `social_recognitions`
--
ALTER TABLE `social_recognitions`
  ADD CONSTRAINT `social_recognitions_recipient_employee_id_foreign` FOREIGN KEY (`recipient_employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `social_recognitions_sender_employee_id_foreign` FOREIGN KEY (`sender_employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE SET NULL;

--
-- Constraints for table `system_settings`
--
ALTER TABLE `system_settings`
  ADD CONSTRAINT `fk_system_settings_updated_by_user_id` FOREIGN KEY (`updated_by_user_id`) REFERENCES `system_users` (`system_user_id`);

--
-- Constraints for table `system_users`
--
ALTER TABLE `system_users`
  ADD CONSTRAINT `fk_system_users_employee_id` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`),
  ADD CONSTRAINT `fk_system_users_role_id` FOREIGN KEY (`role_id`) REFERENCES `system_roles` (`role_id`);

--
-- Constraints for table `user_login_activity`
--
ALTER TABLE `user_login_activity`
  ADD CONSTRAINT `fk_user_login_activity_system_user_id` FOREIGN KEY (`system_user_id`) REFERENCES `system_users` (`system_user_id`) ON DELETE CASCADE;

--
-- Constraints for table `work_schedules`
--
ALTER TABLE `work_schedules`
  ADD CONSTRAINT `fk_work_schedules_employee_id` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE CASCADE;
COMMIT;


/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
