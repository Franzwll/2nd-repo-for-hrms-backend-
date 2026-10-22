-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 09, 2026 at 11:16 PM
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

-- --------------------------------------------------------

--
-- Table structure for table `announcements`
--

CREATE TABLE `announcements` (
  `announcement_id` bigint(20) UNSIGNED NOT NULL,
  `published_date` date NOT NULL,
  `title` varchar(200) NOT NULL,
  `body` text NOT NULL,
  `audience` varchar(20) NOT NULL DEFAULT 'All',
  `created_by_user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'published',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `announcements`
--

INSERT INTO `announcements` (`announcement_id`, `published_date`, `title`, `body`, `audience`, `created_by_user_id`, `status`, `created_at`, `updated_at`) VALUES
(1, '2026-05-24', 'Job Fair: Hotel & Restaurant Careers Day', 'Walk-in interviews for Front Office, F&B, and Kitchen roles at the Grand Ballroom.', 'All', 1, 'published', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(2, '2026-05-18', 'TESDA Certification Sponsorship', 'Oxford Suites now sponsors NC II certification for qualified regular employees.', 'All', 1, 'published', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(3, '2026-05-02', 'Service Excellence Awards 2026', 'Congratulations to Front Office for the highest guest satisfaction score this quarter.', 'All', 1, 'published', '2026-10-02 06:24:35', '2026-10-02 06:24:35');

-- --------------------------------------------------------

--
-- Table structure for table `applicants`
--

CREATE TABLE `applicants` (
  `applicant_id` bigint(20) UNSIGNED NOT NULL,
  `applicant_code` varchar(40) NOT NULL,
  `job_post_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(160) NOT NULL,
  `email` varchar(190) NOT NULL,
  `phone` varchar(40) DEFAULT NULL,
  `applied_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `fit_score` decimal(5,2) DEFAULT NULL,
  `status` varchar(30) NOT NULL,
  `stage` varchar(40) NOT NULL,
  `source` varchar(60) DEFAULT NULL,
  `resume_file_path` text DEFAULT NULL,
  `resume_original_name` varchar(255) DEFAULT NULL,
  `resume_hash` char(64) DEFAULT NULL,
  `summary` text DEFAULT NULL,
  `flags_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`flags_json`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

--
-- Dumping data for table `applicants`
--

INSERT INTO `applicants` (`applicant_id`, `applicant_code`, `job_post_id`, `name`, `email`, `phone`, `applied_at`, `fit_score`, `status`, `stage`, `source`, `resume_file_path`, `resume_original_name`, `resume_hash`, `summary`, `flags_json`, `created_at`, `updated_at`) VALUES
(1, 'APP-1032', 1, 'Camille Ortega', 'camille.ortega@email.com', '0917 664 2219', '2026-07-22 07:47:00', 93.00, 'fit', 'Hired', 'Referral', '/uploads/resumes/camille_ortega_resume.pdf', NULL, NULL, 'Referred by Front Office Manager; completed practical assessment with 94%.', '[]', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(2, 'APP-1033', 6, 'Juan De La Cruz', 'juan.delacruz@email.com', '0912 345 6789', '2026-07-23 01:31:00', 76.00, 'fit', 'Interview Scheduled', 'Indeed', '/uploads/resumes/juan_delacruz_resume.pdf', NULL, NULL, 'Agency recruitment coordinator transitioning to in-house HR.', '[]', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(3, 'APP-1034', 3, 'Mark Reyes', 'mark.reyes@email.com', '0908 441 2277', '2026-07-24 03:05:00', 69.00, 'other-role', 'Screened', 'Walk-in', '/uploads/resumes/mark_reyes_resume.pdf', NULL, NULL, 'Building maintenance background; endorse to Facilities vacancy.', '[\"Stronger match: Facilities Maintenance (81%)\"]', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(4, 'APP-1035', 5, 'Jompaks Berdugo', 'jompaks.berdugo@email.com', '0933 552 1180', '2026-07-24 06:22:00', 84.00, 'fit', 'Assessed', 'Facebook', '/uploads/resumes/jompaks_berdugo_resume.pdf', NULL, NULL, 'Rooftop bar experience with strong signature-cocktail portfolio.', '[]', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(5, 'APP-1036', 2, 'Kevin Dela Cruz', 'kevin.delacruz@email.com', '0921 774 9903', '2026-07-24 08:48:00', 91.00, 'fit', 'Offer', 'Online Portal', '/uploads/resumes/kevin_delacruz_resume.pdf', NULL, NULL, 'Certified cook with four years hot-kitchen experience across two hotel outlets.', '[]', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(6, 'APP-1037', 2, 'Elena Torres', 'elena.torres@email.com', '0918 220 3341', '2026-07-25 11:02:00', 22.00, 'not-fit', 'Rejected', 'Online Portal', '/uploads/resumes/elena_torres_resume.pdf', NULL, NULL, 'Clerical background with no hospitality or culinary entities detected.', '[\"No culinary certification\",\"No kitchen experience detected\"]', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(7, 'APP-1038', 3, 'Princess Mabangis', 'princess.mabangis@email', '0912 345', '2026-07-25 12:10:00', 58.00, 'credential', 'Screened', 'Walk-in', '/uploads/resumes/princess_mabangis_resume.pdf', NULL, NULL, 'Relevant housekeeping experience but contact details failed NER validation.', '[\"Malformed email address\",\"Incomplete phone number\",\"Job position typo on application form\"]', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(8, 'APP-1039', 1, 'Kanor Ornak', 'kanor.ornak@email.com', '0905 118 7742', '2026-07-25 13:12:00', 74.00, 'other-role', 'Screened', 'Indeed', '/uploads/resumes/kanor_ornak_resume.pdf', NULL, NULL, 'Retail and cafe service background; better aligned to F&B service roles.', '[\"Stronger match: Restaurant Server (86%)\"]', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(9, 'APP-1040', 4, 'Marjun Devera', 'marjun.devera@email.com', '0917 664 2219', '2026-07-25 14:40:00', 88.00, 'fit', 'Screened', 'Referral', '/uploads/resumes/marjun_devera_resume.pdf', NULL, NULL, 'Strong dining-room service background with banquet exposure.', '[]', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(10, 'APP-1041', 1, 'Bianca Soriano', 'bianca.soriano@email.com', '0912 345 6789', '2026-07-25 15:15:00', 96.00, 'fit', 'Interview Scheduled', 'Online Portal', '/uploads/resumes/bianca_soriano_resume.pdf', NULL, NULL, 'Three years front office experience at a 4-star property, PMS proficient, complete credentials.', '[]', '2026-10-02 06:24:35', '2026-10-02 06:24:35');

-- --------------------------------------------------------

--
-- Table structure for table `applicant_assessments`
--

CREATE TABLE `applicant_assessments` (
  `assessment_id` bigint(20) UNSIGNED NOT NULL,
  `applicant_id` bigint(20) UNSIGNED NOT NULL,
  `assessor_user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `assessment_date` date NOT NULL,
  `scores_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`scores_json`)),
  `comments_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`comments_json`)),
  `total_score` decimal(5,2) DEFAULT NULL,
  `outcome` varchar(20) NOT NULL,
  `result` varchar(10) DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

--
-- Dumping data for table `applicant_assessments`
--

INSERT INTO `applicant_assessments` (`assessment_id`, `applicant_id`, `assessor_user_id`, `assessment_date`, `scores_json`, `comments_json`, `total_score`, `outcome`, `result`, `remarks`, `created_at`, `updated_at`) VALUES
(1, 1, 2, '2026-07-23', '{\"Guest Service Orientation\":19,\"Communication Skills\":18,\"Technical / Practical Skill\":20,\"Grooming & Professionalism\":18,\"Availability & Flexibility\":19}', NULL, 94.00, 'Recommended', NULL, 'Practical front desk simulation passed with 94%. Advanced to job offer.', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(2, 5, 2, '2026-07-26', '{\"Guest Service Orientation\":16,\"Communication Skills\":17,\"Technical / Practical Skill\":18,\"Grooming & Professionalism\":16,\"Availability & Flexibility\":15}', NULL, 82.00, 'Recommended', NULL, 'Cook test assessment passed; solid knife skills and station timing.', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(3, 4, 2, '2026-07-27', '{\"Guest Service Orientation\":17,\"Communication Skills\":18,\"Technical / Practical Skill\":19,\"Grooming & Professionalism\":17,\"Availability & Flexibility\":17}', NULL, 88.00, 'Recommended', NULL, 'Mixology practical assessment passed with 88%.', '2026-10-02 06:24:35', '2026-10-02 06:24:35');

-- --------------------------------------------------------

--
-- Table structure for table `applicant_documents`
--

CREATE TABLE `applicant_documents` (
  `applicant_document_id` bigint(20) UNSIGNED NOT NULL,
  `applicant_id` bigint(20) UNSIGNED NOT NULL,
  `doc_type` varchar(30) NOT NULL,
  `title` varchar(190) DEFAULT NULL,
  `original_copy` tinyint(1) NOT NULL DEFAULT 0,
  `file_path` text DEFAULT NULL,
  `original_name` varchar(255) DEFAULT NULL,
  `verification_status` varchar(30) DEFAULT 'PENDING',
  `verification_result_json` longtext DEFAULT NULL,
  `extracted_profile_json` longtext DEFAULT NULL,
  `verified_at` timestamp NULL DEFAULT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

-- --------------------------------------------------------

--
-- Table structure for table `applicant_screenings`
--

CREATE TABLE `applicant_screenings` (
  `screening_id` bigint(20) UNSIGNED NOT NULL,
  `applicant_id` bigint(20) UNSIGNED NOT NULL,
  `job_post_id` bigint(20) UNSIGNED NOT NULL,
  `processing_status` varchar(30) NOT NULL DEFAULT 'PENDING',
  `screening_result` varchar(30) DEFAULT NULL,
  `match_score` decimal(5,2) DEFAULT NULL,
  `resume_match_score` decimal(5,2) DEFAULT NULL,
  `score_breakdown_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`score_breakdown_json`)),
  `profile_json` longtext DEFAULT NULL,
  `entities_json` longtext DEFAULT NULL,
  `missing_information_json` longtext DEFAULT NULL,
  `validation_json` longtext DEFAULT NULL,
  `alternative_job_json` longtext DEFAULT NULL,
  `document_verification_json` longtext DEFAULT NULL,
  `reasons_json` longtext DEFAULT NULL,
  `model_info_json` longtext DEFAULT NULL,
  `error_message` text DEFAULT NULL,
  `processed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `applicant_screening_entities`
--

CREATE TABLE `applicant_screening_entities` (
  `entity_id` bigint(20) UNSIGNED NOT NULL,
  `applicant_id` bigint(20) UNSIGNED NOT NULL,
  `label` varchar(80) NOT NULL,
  `value` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `applicant_screening_entities`
--

INSERT INTO `applicant_screening_entities` (`entity_id`, `applicant_id`, `label`, `value`, `created_at`) VALUES
(1, 1, 'SKILL', 'Guest Relations', '2026-10-02 06:24:35'),
(2, 1, 'CERT', 'TESDA Front Office NC II', '2026-10-02 06:24:35'),
(3, 1, 'EDU', 'BS Tourism', '2026-10-02 06:24:35'),
(4, 2, 'SKILL', 'Recruitment', '2026-10-02 06:24:35'),
(5, 2, 'EDU', 'BS Psychology', '2026-10-02 06:24:35'),
(6, 2, 'ORG', 'Metro Staffing', '2026-10-02 06:24:35'),
(7, 3, 'SKILL', 'Maintenance', '2026-10-02 06:24:35'),
(8, 3, 'SKILL', 'Laundry Operations', '2026-10-02 06:24:35'),
(9, 4, 'SKILL', 'Mixology', '2026-10-02 06:24:35'),
(10, 4, 'CERT', 'TESDA Bartending NC II', '2026-10-02 06:24:35'),
(11, 4, 'ORG', 'Sky Lounge BGC', '2026-10-02 06:24:35'),
(12, 5, 'SKILL', 'Hot Kitchen', '2026-10-02 06:24:35'),
(13, 5, 'CERT', 'TESDA Cookery NC II', '2026-10-02 06:24:35'),
(14, 5, 'CERT', 'Food Handler', '2026-10-02 06:24:35'),
(15, 5, 'ORG', 'Seaside Grill', '2026-10-02 06:24:35'),
(16, 6, 'SKILL', 'Data Entry', '2026-10-02 06:24:35'),
(17, 6, 'EDU', 'BS Accountancy', '2026-10-02 06:24:35'),
(18, 7, 'SKILL', 'Room Turnover', '2026-10-02 06:24:35'),
(19, 7, 'ORG', 'Sunrise Inn', '2026-10-02 06:24:35'),
(20, 8, 'SKILL', 'Cash Handling', '2026-10-02 06:24:35'),
(21, 8, 'SKILL', 'Inventory', '2026-10-02 06:24:35'),
(22, 8, 'ORG', 'Cafe Verde', '2026-10-02 06:24:35'),
(23, 8, 'EDU', 'College Level', '2026-10-02 06:24:35'),
(24, 9, 'SKILL', 'Table Service', '2026-10-02 06:24:35'),
(25, 9, 'SKILL', 'POS Systems', '2026-10-02 06:24:35'),
(26, 9, 'ORG', 'Bistro Manila', '2026-10-02 06:24:35'),
(27, 9, 'EDU', 'HRM Vocational', '2026-10-02 06:24:35'),
(28, 10, 'SKILL', 'Guest Relations', '2026-10-02 06:24:35'),
(29, 10, 'SKILL', 'Opera PMS', '2026-10-02 06:24:35'),
(30, 10, 'ORG', 'Grand Horizon Hotel', '2026-10-02 06:24:35'),
(31, 10, 'EDU', 'BS Hospitality Management', '2026-10-02 06:24:35'),
(32, 10, 'CERT', 'TESDA Front Office NC II', '2026-10-02 06:24:35');

-- --------------------------------------------------------

--
-- Table structure for table `applicant_screening_scores`
--

CREATE TABLE `applicant_screening_scores` (
  `score_id` bigint(20) UNSIGNED NOT NULL,
  `applicant_id` bigint(20) UNSIGNED NOT NULL,
  `criterion` varchar(120) NOT NULL,
  `score` decimal(5,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `applicant_screening_scores`
--

INSERT INTO `applicant_screening_scores` (`score_id`, `applicant_id`, `criterion`, `score`, `created_at`) VALUES
(1, 1, 'Skills', 37.00, '2026-10-02 06:24:35'),
(2, 1, 'Work Experience', 28.00, '2026-10-02 06:24:35'),
(3, 1, 'Educational Background', 19.00, '2026-10-02 06:24:35'),
(4, 1, 'Certifications', 9.00, '2026-10-02 06:24:35'),
(5, 2, 'Skills', 28.00, '2026-10-02 06:24:35'),
(6, 2, 'Work Experience', 23.00, '2026-10-02 06:24:35'),
(7, 2, 'Educational Background', 18.00, '2026-10-02 06:24:35'),
(8, 2, 'Certifications', 7.00, '2026-10-02 06:24:35'),
(9, 3, 'Skills', 24.00, '2026-10-02 06:24:35'),
(10, 3, 'Work Experience', 21.00, '2026-10-02 06:24:35'),
(11, 3, 'Educational Background', 14.00, '2026-10-02 06:24:35'),
(12, 3, 'Certifications', 10.00, '2026-10-02 06:24:35'),
(13, 4, 'Skills', 32.00, '2026-10-02 06:24:35'),
(14, 4, 'Work Experience', 25.00, '2026-10-02 06:24:35'),
(15, 4, 'Educational Background', 17.00, '2026-10-02 06:24:35'),
(16, 4, 'Certifications', 10.00, '2026-10-02 06:24:35'),
(17, 5, 'Skills', 36.00, '2026-10-02 06:24:35'),
(18, 5, 'Work Experience', 27.00, '2026-10-02 06:24:35'),
(19, 5, 'Educational Background', 18.00, '2026-10-02 06:24:35'),
(20, 5, 'Certifications', 10.00, '2026-10-02 06:24:35'),
(21, 6, 'Skills', 8.00, '2026-10-02 06:24:35'),
(22, 6, 'Work Experience', 6.00, '2026-10-02 06:24:35'),
(23, 6, 'Educational Background', 6.00, '2026-10-02 06:24:35'),
(24, 6, 'Certifications', 2.00, '2026-10-02 06:24:35'),
(25, 7, 'Skills', 24.00, '2026-10-02 06:24:35'),
(26, 7, 'Work Experience', 18.00, '2026-10-02 06:24:35'),
(27, 7, 'Educational Background', 10.00, '2026-10-02 06:24:35'),
(28, 7, 'Certifications', 6.00, '2026-10-02 06:24:35'),
(29, 8, 'Skills', 26.00, '2026-10-02 06:24:35'),
(30, 8, 'Work Experience', 22.00, '2026-10-02 06:24:35'),
(31, 8, 'Educational Background', 16.00, '2026-10-02 06:24:35'),
(32, 8, 'Certifications', 10.00, '2026-10-02 06:24:35'),
(33, 9, 'Skills', 34.00, '2026-10-02 06:24:35'),
(34, 9, 'Work Experience', 26.00, '2026-10-02 06:24:35'),
(35, 9, 'Educational Background', 18.00, '2026-10-02 06:24:35'),
(36, 9, 'Certifications', 10.00, '2026-10-02 06:24:35'),
(37, 10, 'Skills', 38.00, '2026-10-02 06:24:35'),
(38, 10, 'Work Experience', 28.00, '2026-10-02 06:24:35'),
(39, 10, 'Educational Background', 20.00, '2026-10-02 06:24:35'),
(40, 10, 'Certifications', 10.00, '2026-10-02 06:24:35');

-- --------------------------------------------------------

--
-- Table structure for table `assessment_invites`
--

CREATE TABLE `assessment_invites` (
  `assessment_invite_id` bigint(20) UNSIGNED NOT NULL,
  `token` varchar(64) NOT NULL,
  `applicant_id` bigint(20) UNSIGNED NOT NULL,
  `created_by_user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `test_title` varchar(190) NOT NULL,
  `questions_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`questions_json`)),
  `answers_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`answers_json`)),
  `passing_score` decimal(5,2) NOT NULL DEFAULT 75.00,
  `total_score` decimal(5,2) DEFAULT NULL,
  `result` varchar(10) DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'Pending',
  `expires_at` timestamp NULL DEFAULT NULL,
  `submitted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `assessment_tests`
--

CREATE TABLE `assessment_tests` (
  `assessment_test_id` bigint(20) UNSIGNED NOT NULL,
  `applicant_id` bigint(20) UNSIGNED NOT NULL,
  `assessor_user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `test_title` varchar(190) NOT NULL,
  `questions_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`questions_json`)),
  `scores_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`scores_json`)),
  `total_score` decimal(5,2) DEFAULT NULL,
  `passing_score` decimal(5,2) NOT NULL DEFAULT 75.00,
  `result` varchar(10) NOT NULL,
  `test_date` date NOT NULL,
  `remarks` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

-- --------------------------------------------------------

--
-- Table structure for table `attendance_records`
--

CREATE TABLE `attendance_records` (
  `attendance_id` bigint(20) UNSIGNED NOT NULL,
  `employee_id` bigint(20) UNSIGNED NOT NULL,
  `work_date` date NOT NULL,
  `time_in` timestamp NULL DEFAULT NULL,
  `time_out` timestamp NULL DEFAULT NULL,
  `break_in` timestamp NULL DEFAULT NULL,
  `break_out` timestamp NULL DEFAULT NULL,
  `hours_worked` decimal(7,2) NOT NULL DEFAULT 0.00,
  `late_minutes` int(11) NOT NULL DEFAULT 0,
  `undertime_minutes` int(11) NOT NULL DEFAULT 0,
  `overtime_hours` decimal(7,2) NOT NULL DEFAULT 0.00,
  `remark` varchar(255) DEFAULT NULL,
  `status` varchar(30) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `attendance_records`
--

INSERT INTO `attendance_records` (`attendance_id`, `employee_id`, `work_date`, `time_in`, `time_out`, `break_in`, `break_out`, `hours_worked`, `late_minutes`, `undertime_minutes`, `overtime_hours`, `remark`, `status`, `created_at`, `updated_at`) VALUES
(1, 5, '2026-07-21', '2026-07-20 23:50:00', '2026-07-21 08:30:00', '2026-07-21 04:00:00', '2026-07-21 04:58:00', 8.10, 0, 0, 0.00, 'Present', 'Completed', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(2, 5, '2026-07-22', NULL, NULL, NULL, NULL, 0.00, 0, 0, 0.00, 'Sick Leave', NULL, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(3, 5, '2026-07-23', '2026-07-22 23:55:00', '2026-07-23 10:40:00', '2026-07-23 04:00:00', '2026-07-23 04:55:00', 10.20, 0, 0, 2.00, 'Overtime 2h', 'Completed', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(4, 5, '2026-07-24', '2026-07-24 00:07:00', '2026-07-24 09:10:00', '2026-07-24 04:05:00', '2026-07-24 04:58:00', 8.50, 7, 0, 0.00, 'Late 7 mins', 'Completed', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(5, 5, '2026-07-25', '2026-07-24 23:48:00', '2026-07-25 08:32:00', '2026-07-25 04:00:00', '2026-07-25 04:58:00', 8.20, 0, 0, 0.00, 'Present', 'Completed', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(6, 6, '2026-07-24', '2026-07-24 01:58:00', '2026-07-24 10:02:00', '2026-07-24 04:00:00', '2026-07-24 04:45:00', 8.10, 0, 0, 0.00, 'Present', 'Completed', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(7, 6, '2026-07-25', '2026-07-25 01:55:00', '2026-07-25 10:05:00', '2026-07-25 04:02:00', '2026-07-25 04:50:00', 8.20, 0, 0, 0.00, 'Present', 'Completed', '2026-10-02 06:24:35', '2026-10-02 06:24:35');

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `audit_log_id` bigint(20) UNSIGNED NOT NULL,
  `system_user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `actor_role` varchar(50) DEFAULT NULL,
  `actor_department` varchar(120) DEFAULT NULL,
  `occurred_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `action` varchar(255) NOT NULL,
  `module_name` varchar(100) NOT NULL,
  `target_type` varchar(100) DEFAULT NULL,
  `target_id` varchar(100) DEFAULT NULL,
  `details` text DEFAULT NULL,
  `severity` varchar(20) NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `device_info` varchar(255) DEFAULT NULL,
  `url` varchar(2048) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `audit_logs`
--

INSERT INTO `audit_logs` (`audit_log_id`, `system_user_id`, `actor_role`, `actor_department`, `occurred_at`, `action`, `module_name`, `target_type`, `target_id`, `details`, `severity`, `ip_address`, `device_info`, `url`) VALUES
(1, 1, 'Super Admin', 'Administration / HR', '2026-07-26 00:14:00', 'Updated permission matrix for role Admin', 'User Management', 'role', 'Admin', 'Set ESS Management to Approve / Reject Only.', 'Critical', '192.168.10.4', 'Chrome on Windows', NULL),
(2, 2, 'Admin', 'Administration / HR', '2026-07-26 00:02:00', 'Approved leave request LR-2231', 'ESS Management', 'ess_request', 'LR-2231', 'Sick leave approved for 1 day.', 'Info', '192.168.10.22', 'Edge on Windows', NULL),
(3, 3, 'Admin', 'Front Office', '2026-07-25 15:20:00', 'Scheduled interview for APP-1041', 'Applicant Management', 'applicant', 'APP-1041', 'On-site interview booked for 2026-07-28, 09:00 AM.', 'Info', '192.168.10.31', 'Safari on macOS', NULL),
(4, NULL, 'System', 'System', '2026-07-25 14:58:00', 'Resume screening batch completed (14 resumes, NER model v2.3)', 'Applicant Management', 'system', 'batch', 'NER screening pipeline finished.', 'Info', '127.0.0.1', 'Server process', NULL),
(5, 5, 'Employee', 'Food & Beverage', '2026-07-25 12:41:00', 'Failed login attempt (3rd) — account suspended', 'Authentication', 'user', 'USR-005', 'Account auto-suspended after repeated failures.', 'Warning', '10.0.4.101', 'Chrome on Android', NULL),
(6, 1, 'Super Admin', 'Administration / HR', '2026-07-25 09:09:00', 'Deleted job position POS-011 (Seasonal Banquet Server)', 'Core HCM', 'position', 'POS-011', 'Position removed from master.', 'Critical', '192.168.10.4', 'Chrome on Windows', NULL),
(7, 2, 'Admin', 'Administration / HR', '2026-07-25 03:22:00', 'Published job post \'Line Cook\' to Indeed and Facebook', 'Recruitment Management', 'job_post', 'line-cook', 'Publishing platforms updated.', 'Info', '192.168.10.22', 'Edge on Windows', NULL),
(8, 1, 'Super Admin', 'Administration / HR', '2026-07-25 01:15:00', 'Modified password policy to require strong credentials', 'User Management', 'setting', 'password_policy', 'Policy requires 8+ chars, uppercase, number, symbol.', 'Warning', '192.168.10.4', 'Chrome on Windows', NULL),
(9, 3, 'Admin', 'Front Office', '2026-07-24 08:45:00', 'Created new employee record for Camille Ortega', 'Core HCM', 'employee', 'EMP-0004', 'Probationary Guest Relations Officer record created.', 'Info', '192.168.10.31', 'Safari on macOS', NULL),
(10, 2, 'Admin', 'Administration / HR', '2026-07-24 06:10:00', 'Exported monthly HR headcount report to PDF', 'Employee Records', 'report', 'headcount', 'Monthly report exported.', 'Info', '192.168.10.22', 'Edge on Windows', NULL),
(11, 4, 'Employee', 'Kitchen / Culinary', '2026-07-24 02:05:00', 'Submitted shift swap request with Marco Santos', 'ESS Management', 'ess_request', 'SHIFT-SWAP-001', 'Shift swap between kitchen crew.', 'Info', '10.0.4.88', 'Chrome on Android', NULL),
(12, 1, 'Super Admin', 'Administration / HR', '2026-07-23 10:30:00', 'Revoked active session for user mdevera', 'User Management', 'user', 'USR-005', 'All sessions terminated.', 'Critical', '192.168.10.4', 'Chrome on Windows', NULL),
(13, 3, 'Admin', 'Housekeeping', '2026-07-23 07:12:00', 'Updated room attendant onboarding checklist', 'New Hire Onboarding', 'template', 'TPL-002', 'Checklist items adjusted.', 'Info', '192.168.10.31', 'Safari on macOS', NULL),
(14, 2, 'Admin', 'Administration / HR', '2026-07-23 03:00:00', 'Approved overtime request for Front Office team', 'ESS Management', 'ess_request', 'OT-FO-001', 'Overtime for peak season approved.', 'Info', '192.168.10.22', 'Edge on Windows', NULL),
(15, 2, 'Admin', 'Administration / HR', '2026-07-20 01:12:00', 'Applicant Added', 'Screening', 'applicant', 'APP-1032', 'Added via document screening — camille_resume.pdf, scored 93%.', 'Info', '192.168.10.22', 'Edge on Windows', NULL),
(16, 3, 'Admin', 'Front Office', '2026-07-21 02:40:00', 'Interview Booked', 'Interview Scheduling', 'applicant', 'APP-1032', 'On-site interview booked for 2026-07-22, 09:00 AM.', 'Info', '192.168.10.31', 'Safari on macOS', NULL),
(17, 3, 'Admin', 'Front Office', '2026-07-22 01:05:00', 'Interview Completed', 'Interview Scheduling', 'applicant', 'APP-1032', 'Interview marked complete, strong guest-facing presence noted.', 'Info', '192.168.10.31', 'Safari on macOS', NULL),
(18, 2, 'Admin', 'Administration / HR', '2026-07-23 06:15:00', 'Assessment Started', 'Assessment', 'applicant', 'APP-1032', 'Practical front desk simulation started.', 'Info', '192.168.10.22', 'Edge on Windows', NULL),
(19, 2, 'Admin', 'Administration / HR', '2026-07-23 07:40:00', 'Assessment Accepted', 'Assessment', 'applicant', 'APP-1032', 'Assessment score 94% — advanced to job offer.', 'Info', '192.168.10.22', 'Edge on Windows', NULL),
(20, NULL, 'F&B Director', 'Food & Beverage', '2026-07-24 03:00:00', 'Interview Booked', 'Interview Scheduling', 'applicant', 'APP-1035', 'On-site interview booked for 2026-07-29, 04:00 PM.', 'Info', '192.168.10.2', 'Chrome on Windows', NULL),
(21, NULL, 'F&B Director', 'Food & Beverage', '2026-07-24 05:20:00', 'Interview Booked', 'Interview Scheduling', 'applicant', 'APP-1036', 'On-site interview booked for 2026-07-30, 10:00 AM.', 'Info', '192.168.10.2', 'Chrome on Windows', NULL),
(22, 2, 'Admin', 'Administration / HR', '2026-07-24 09:05:00', 'Status Change', 'Screening', 'applicant', 'APP-1034', 'Stage moved to Screened after resume re-check.', 'Info', '192.168.10.22', 'Edge on Windows', NULL),
(23, NULL, 'Executive Housekeeper', 'Housekeeping', '2026-07-24 09:30:00', 'Applicant Transferred', 'Screening', 'applicant', 'APP-1034', 'Flagged as stronger match for Facilities Maintenance.', 'Info', '192.168.10.3', 'Chrome on Windows', NULL),
(24, 2, 'Admin', 'Administration / HR', '2026-07-25 00:50:00', 'Applicant Rejected', 'Screening', 'applicant', 'APP-1037', 'No culinary certification or kitchen experience detected.', 'Info', '192.168.10.22', 'Edge on Windows', NULL),
(25, 2, 'Admin', 'Administration / HR', '2026-07-25 01:35:00', 'Applicant Added', 'Screening', 'applicant', 'APP-1038', 'Added via image (OCR) screening — walk-in resume scan.', 'Info', '192.168.10.22', 'Edge on Windows', NULL),
(26, 2, 'Admin', 'Administration / HR', '2026-07-25 02:15:00', 'Applicant Added', 'Screening', 'applicant', 'APP-1039', 'Added via document screening from Indeed source.', 'Info', '192.168.10.22', 'Edge on Windows', NULL),
(27, 3, 'Admin', 'Front Office', '2026-07-25 03:02:00', 'Applicant Transferred', 'Screening', 'applicant', 'APP-1039', 'Suggested stronger match: Restaurant Server (86%).', 'Info', '192.168.10.31', 'Safari on macOS', NULL),
(28, 2, 'Admin', 'Administration / HR', '2026-07-25 05:48:00', 'Applicant Added', 'Screening', 'applicant', 'APP-1040', 'Added via document screening — referral source.', 'Info', '192.168.10.22', 'Edge on Windows', NULL),
(29, 2, 'Admin', 'Administration / HR', '2026-07-25 08:30:00', 'Applicant Added', 'Screening', 'applicant', 'APP-1041', 'Added via document screening — online portal, scored 96%.', 'Info', '192.168.10.22', 'Edge on Windows', NULL),
(30, 3, 'Admin', 'Front Office', '2026-07-26 01:00:00', 'Interview Booked', 'Interview Scheduling', 'applicant', 'APP-1041', 'On-site interview booked for 2026-07-28, 09:00 AM.', 'Info', '192.168.10.31', 'Safari on macOS', NULL),
(31, 2, 'Admin', 'Administration / HR', '2026-07-26 01:20:00', 'Interview Booked', 'Interview Scheduling', 'applicant', 'APP-1033', 'Virtual interview booked for 2026-07-28, 01:30 PM.', 'Info', '192.168.10.22', 'Edge on Windows', NULL),
(32, NULL, 'F&B Director', 'Food & Beverage', '2026-07-26 02:10:00', 'Interview Completed', 'Interview Scheduling', 'applicant', 'APP-1036', 'Cook test completed, solid knife skills and station timing.', 'Info', '192.168.10.2', 'Chrome on Windows', NULL),
(33, 2, 'Admin', 'Administration / HR', '2026-07-26 02:45:00', 'Assessment Started', 'Assessment', 'applicant', 'APP-1036', 'Practical cook test assessment started.', 'Info', '192.168.10.22', 'Edge on Windows', NULL),
(34, 2, 'Admin', 'Administration / HR', '2026-07-26 03:30:00', 'Assessment Accepted', 'Assessment', 'applicant', 'APP-1036', 'Assessment score 82% — advanced to job offer.', 'Info', '192.168.10.22', 'Edge on Windows', NULL),
(35, NULL, 'F&B Director', 'Food & Beverage', '2026-07-27 06:00:00', 'Assessment Started', 'Assessment', 'applicant', 'APP-1035', 'Mixology practical assessment started.', 'Info', '192.168.10.2', 'Chrome on Windows', NULL),
(36, NULL, 'F&B Director', 'Food & Beverage', '2026-07-27 07:10:00', 'Assessment Accepted', 'Assessment', 'applicant', 'APP-1035', 'Assessment score 88% — advanced to job offer.', 'Info', '192.168.10.2', 'Chrome on Windows', NULL),
(37, 3, 'Admin', 'Front Office', '2026-07-28 01:05:00', 'Interview Completed', 'Interview Scheduling', 'applicant', 'APP-1041', 'Front office simulation completed successfully.', 'Info', '192.168.10.31', 'Safari on macOS', NULL),
(38, 2, 'Admin', 'Administration / HR', '2026-07-28 05:45:00', 'Interview No-Show', 'Interview Scheduling', 'applicant', 'APP-1033', 'Candidate did not join the virtual meeting room.', 'Warning', '192.168.10.22', 'Edge on Windows', NULL),
(39, NULL, 'F&B Director', 'Food & Beverage', '2026-07-29 08:30:00', 'Interview Cancelled', 'Interview Scheduling', 'applicant', 'APP-1035', 'Follow-up panel interview cancelled — role already filled.', 'Info', '192.168.10.2', 'Chrome on Windows', NULL),
(40, 4, 'Employee', 'Kitchen / Culinary', '2026-10-01 22:30:32', 'OTP sent', 'Authentication', 'user', 'kdelacruz', 'One-time password emailed to k************@oxfordsuites.com.ph', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/login'),
(41, 4, 'Employee', 'Kitchen / Culinary', '2026-10-01 22:32:32', 'User logged in', 'Authentication', 'user', 'kdelacruz', 'Two-factor login completed.', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/otp'),
(42, 4, 'Employee', 'Kitchen / Culinary', '2026-10-01 22:45:26', 'System user updated', 'User Management', 'user', '4', 'Changed: otp_enabled', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/employee/settings'),
(43, 4, 'Employee', 'Kitchen / Culinary', '2026-10-01 22:52:05', 'User logged in', 'Authentication', 'user', 'kdelacruz', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/login'),
(44, 4, 'Employee', 'Kitchen / Culinary', '2026-10-01 23:25:27', 'User logged out', 'Authentication', 'user', 'kdelacruz', 'Session token revoked.', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/employee'),
(45, NULL, 'System', 'System', '2026-10-01 23:25:46', 'Failed login attempt', 'Authentication', 'user', 'rexx12872@gmail.com', 'Invalid credentials supplied.', 'Warning', '127.0.0.1', 'Firefox', 'http://localhost:5173/login'),
(46, 1, 'Super Admin', 'Administration / HR', '2026-10-01 23:26:44', 'OTP sent', 'Authentication', 'user', 'bullseur', 'One-time password emailed to b******@oxfordsuites.com.ph', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/login'),
(47, 1, 'Super Admin', 'Administration / HR', '2026-10-01 23:27:05', 'User logged in', 'Authentication', 'user', 'bullseur', 'Two-factor login completed.', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/otp'),
(48, 1, 'Super Admin', 'Administration / HR', '2026-10-01 23:27:27', 'System user updated', 'User Management', 'user', '1', 'Changed: otp_enabled', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/superadmin/settings'),
(49, 1, 'Super Admin', 'Administration / HR', '2026-10-01 23:31:26', 'User logged out', 'Authentication', 'user', 'bullseur', 'Session token revoked.', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/superadmin/applicants'),
(50, 4, 'Employee', 'Kitchen / Culinary', '2026-10-01 23:31:30', 'User logged in', 'Authentication', 'user', 'kdelacruz', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/login'),
(51, 4, 'Employee', 'Kitchen / Culinary', '2026-10-02 01:20:05', 'User logged out', 'Authentication', 'user', 'kdelacruz', 'Session token revoked.', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/employee/ess?category=Payroll'),
(52, 4, 'Employee', 'Kitchen / Culinary', '2026-10-02 01:33:42', 'User logged in', 'Authentication', 'user', 'kdelacruz', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/login'),
(53, 4, 'Employee', 'Kitchen / Culinary', '2026-10-03 05:33:58', 'User logged in', 'Authentication', 'user', 'kdelacruz', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/login'),
(54, 4, 'Employee', 'Kitchen / Culinary', '2026-10-03 06:11:48', 'User logged out', 'Authentication', 'user', 'kdelacruz', 'Session token revoked.', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/employee/ess'),
(55, 4, 'Employee', 'Kitchen / Culinary', '2026-10-04 20:28:54', 'User logged in', 'Authentication', 'user', 'kdelacruz', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/login'),
(56, 4, 'Employee', 'Kitchen / Culinary', '2026-10-04 21:17:41', 'User logged out', 'Authentication', 'user', 'kdelacruz', 'Session token revoked.', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/employee/ess?category=Documents'),
(57, 4, 'Employee', 'Kitchen / Culinary', '2026-10-04 21:21:33', 'User logged in', 'Authentication', 'user', 'kdelacruz', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/login'),
(58, 4, 'Employee', 'Kitchen / Culinary', '2026-10-05 01:17:28', 'User logged in', 'Authentication', 'user', 'kdelacruz', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/login'),
(59, 4, 'Employee', 'Kitchen / Culinary', '2026-10-05 01:22:55', 'User logged in', 'Authentication', 'user', 'kdelacruz', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/login'),
(60, 4, 'Employee', 'Kitchen / Culinary', '2026-10-05 01:26:44', 'User logged out', 'Authentication', 'user', 'kdelacruz', 'Session token revoked.', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/employee/ess'),
(61, 4, 'Employee', 'Kitchen / Culinary', '2026-10-05 01:26:49', 'User logged in', 'Authentication', 'user', 'kdelacruz', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/login'),
(62, 4, 'Employee', 'Kitchen / Culinary', '2026-10-05 01:56:26', 'User logged in', 'Authentication', 'user', 'kdelacruz', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/login'),
(63, 4, 'Employee', 'Kitchen / Culinary', '2026-10-05 03:07:08', 'User logged out', 'Authentication', 'user', 'kdelacruz', 'Session token revoked.', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/employee'),
(64, 4, 'Employee', 'Kitchen / Culinary', '2026-10-05 03:19:24', 'User logged in', 'Authentication', 'user', 'kdelacruz', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/login'),
(65, 4, 'Employee', 'Kitchen / Culinary', '2026-10-05 03:46:56', 'User logged out', 'Authentication', 'user', 'kdelacruz', 'Session token revoked.', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/employee/onboarding'),
(66, 4, 'Employee', 'Kitchen / Culinary', '2026-10-05 03:47:05', 'User logged in', 'Authentication', 'user', 'kdelacruz', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/login'),
(67, 4, 'Employee', 'Kitchen / Culinary', '2026-10-05 03:47:08', 'User logged out', 'Authentication', 'user', 'kdelacruz', 'Session token revoked.', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/employee'),
(68, 1, 'Super Admin', 'Administration / HR', '2026-10-05 03:47:12', 'User logged in', 'Authentication', 'user', 'bullseur', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/login'),
(69, 1, 'Super Admin', 'Administration / HR', '2026-10-05 03:49:11', 'User logged out', 'Authentication', 'user', 'bullseur', 'Session token revoked.', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/superadmin/onboarding'),
(70, 4, 'Employee', 'Kitchen / Culinary', '2026-10-05 03:49:15', 'User logged in', 'Authentication', 'user', 'kdelacruz', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/login'),
(71, 4, 'Employee', 'Kitchen / Culinary', '2026-10-05 06:42:40', 'User logged in', 'Authentication', 'user', 'kdelacruz', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/login'),
(72, 4, 'Employee', 'Kitchen / Culinary', '2026-10-05 21:08:54', 'User logged in', 'Authentication', 'user', 'kdelacruz', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/login'),
(73, 4, 'Employee', 'Kitchen / Culinary', '2026-10-07 07:02:32', 'User logged in', 'Authentication', 'user', 'kdelacruz', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/login'),
(74, 4, 'Employee', 'Kitchen / Culinary', '2026-10-07 08:06:11', 'User logged out', 'Authentication', 'user', 'kdelacruz', 'Session token revoked.', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/employee/ess?category=Recognition'),
(75, 4, 'Employee', 'Kitchen / Culinary', '2026-10-07 08:10:36', 'User logged in', 'Authentication', 'user', 'kdelacruz', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/login'),
(76, 4, 'Employee', 'Kitchen / Culinary', '2026-10-07 23:04:35', 'User logged in', 'Authentication', 'user', 'kdelacruz', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/login'),
(77, 4, 'Employee', 'Kitchen / Culinary', '2026-10-07 23:24:04', 'User logged out', 'Authentication', 'user', 'kdelacruz', 'Session token revoked.', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/employee/onboarding'),
(78, 3, 'Admin', 'Front Office', '2026-10-07 23:24:18', 'OTP sent', 'Authentication', 'user', 'aramos', 'One-time password emailed to a*******@oxfordsuites.com.ph', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/login'),
(79, 1, 'Super Admin', 'Administration / HR', '2026-10-07 23:24:30', 'User logged in', 'Authentication', 'user', 'bullseur', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/login'),
(80, 1, 'Super Admin', 'Administration / HR', '2026-10-07 23:24:40', 'System user updated', 'User Management', 'user', '1', 'Changed: otp_enabled', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/superadmin/settings'),
(81, 1, 'Super Admin', 'Administration / HR', '2026-10-07 23:24:41', 'System user updated', 'User Management', 'user', '1', 'Changed: otp_enabled', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/superadmin/settings'),
(82, 1, 'Super Admin', 'Administration / HR', '2026-10-07 23:27:18', 'User logged out', 'Authentication', 'user', 'bullseur', 'Session token revoked.', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/superadmin/onboarding'),
(83, 4, 'Employee', 'Kitchen / Culinary', '2026-10-07 23:27:32', 'User logged in', 'Authentication', 'user', 'kdelacruz', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/login'),
(84, 4, 'Employee', 'Kitchen / Culinary', '2026-10-07 23:27:55', 'User logged out', 'Authentication', 'user', 'kdelacruz', 'Session token revoked.', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/employee/onboarding'),
(85, 3, 'Admin', 'Front Office', '2026-10-07 23:27:58', 'OTP sent', 'Authentication', 'user', 'aramos', 'One-time password emailed to a*******@oxfordsuites.com.ph', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/login'),
(86, 1, 'Super Admin', 'Administration / HR', '2026-10-07 23:28:03', 'User logged in', 'Authentication', 'user', 'bullseur', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/login'),
(87, 1, 'Super Admin', 'Administration / HR', '2026-10-07 23:33:16', 'User logged out', 'Authentication', 'user', 'bullseur', 'Session token revoked.', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/superadmin/recruitment'),
(88, 1, 'Super Admin', 'Administration / HR', '2026-10-07 23:33:22', 'User logged in', 'Authentication', 'user', 'bullseur', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/login'),
(89, 1, 'Super Admin', 'Administration / HR', '2026-10-07 23:43:35', 'User logged out', 'Authentication', 'user', 'bullseur', 'Session token revoked.', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/superadmin'),
(90, 1, 'Super Admin', 'Administration / HR', '2026-10-07 23:44:11', 'User logged in', 'Authentication', 'user', 'bullseur', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/login'),
(91, 1, 'Super Admin', 'Administration / HR', '2026-10-07 23:44:44', 'User logged out', 'Authentication', 'user', 'bullseur', 'Session token revoked.', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/superadmin/onboarding'),
(92, 4, 'Employee', 'Kitchen / Culinary', '2026-10-07 23:44:47', 'User logged in', 'Authentication', 'user', 'kdelacruz', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/login'),
(93, 4, 'Employee', 'Kitchen / Culinary', '2026-10-07 23:47:39', 'User logged out', 'Authentication', 'user', 'kdelacruz', 'Session token revoked.', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/employee/onboarding'),
(94, 1, 'Super Admin', 'Administration / HR', '2026-10-07 23:47:48', 'User logged in', 'Authentication', 'user', 'bullseur', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/login'),
(95, 1, 'Super Admin', 'Administration / HR', '2026-10-07 23:59:29', 'User logged out', 'Authentication', 'user', 'bullseur', 'Session token revoked.', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/superadmin/applicants'),
(96, 1, 'Super Admin', 'Administration / HR', '2026-10-08 00:08:07', 'User logged in', 'Authentication', 'user', 'bullseur', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/login'),
(97, 1, 'Super Admin', 'Administration / HR', '2026-10-08 00:13:51', 'User logged out', 'Authentication', 'user', 'bullseur', 'Session token revoked.', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/superadmin/applicants'),
(98, 4, 'Employee', 'Kitchen / Culinary', '2026-10-08 00:13:58', 'User logged in', 'Authentication', 'user', 'kdelacruz', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/login'),
(99, 1, 'Super Admin', 'Administration / HR', '2026-10-08 00:32:31', 'User logged in', 'Authentication', 'user', 'bullseur', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/login'),
(100, 1, 'Super Admin', 'Administration / HR', '2026-10-08 00:35:07', 'User logged out', 'Authentication', 'user', 'bullseur', 'Session token revoked.', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/superadmin/org-chart'),
(101, 1, 'Super Admin', 'Administration / HR', '2026-10-08 00:35:10', 'User logged in', 'Authentication', 'user', 'bullseur', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/login'),
(102, 1, 'Super Admin', 'Administration / HR', '2026-10-08 00:35:33', 'User logged out', 'Authentication', 'user', 'bullseur', 'Session token revoked.', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/superadmin'),
(103, 4, 'Employee', 'Kitchen / Culinary', '2026-10-08 00:35:36', 'User logged in', 'Authentication', 'user', 'kdelacruz', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/login'),
(104, 4, 'Employee', 'Kitchen / Culinary', '2026-10-08 04:01:47', 'User logged out', 'Authentication', 'user', 'kdelacruz', 'Session token revoked.', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/employee/onboarding'),
(105, 4, 'Employee', 'Kitchen / Culinary', '2026-10-09 01:06:59', 'User logged in', 'Authentication', 'user', 'kdelacruz', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/login'),
(106, 4, 'Employee', 'Kitchen / Culinary', '2026-10-09 01:26:47', 'User logged in', 'Authentication', 'user', 'kdelacruz', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/login'),
(107, 4, 'Employee', 'Kitchen / Culinary', '2026-10-09 02:07:31', 'User logged in', 'Authentication', 'user', 'kdelacruz', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/login'),
(108, 4, 'Employee', 'Kitchen / Culinary', '2026-10-09 03:02:38', 'LMS Course Started', 'Learning Management', 'EmployeeLearning', '3', 'Kevin D. Dela Cruz started LMS-103 — Fire Safety & Emergency Response', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/employee/ess?category=Performance'),
(109, 4, 'Employee', 'Kitchen / Culinary', '2026-10-09 03:48:27', 'User logged out', 'Authentication', 'user', 'kdelacruz', 'Session token revoked.', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/employee/ess?category=Performance'),
(110, 4, 'Employee', 'Kitchen / Culinary', '2026-10-09 04:35:06', 'User logged in', 'Authentication', 'user', 'kdelacruz', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/login'),
(111, 4, 'Employee', 'Kitchen / Culinary', '2026-10-09 05:05:52', 'User logged out', 'Authentication', 'user', 'kdelacruz', 'Session token revoked.', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/employee/ess?category=Documents'),
(112, 4, 'Employee', 'Kitchen / Culinary', '2026-10-09 05:22:51', 'User logged in', 'Authentication', 'user', 'kdelacruz', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/login'),
(113, 4, 'Employee', 'Kitchen / Culinary', '2026-10-09 05:56:30', 'User logged in', 'Authentication', 'user', 'kdelacruz', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/login'),
(114, 4, 'Employee', 'Kitchen / Culinary', '2026-10-09 06:38:10', 'LMS Course Started', 'Learning Management', 'EmployeeLearning', '3', 'Kevin D. Dela Cruz started LMS-103 — Fire Safety & Emergency Response', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/employee/ess?category=Performance'),
(115, 4, 'Employee', 'Kitchen / Culinary', '2026-10-09 06:51:40', 'User logged out', 'Authentication', 'user', 'kdelacruz', 'Session token revoked.', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/employee'),
(116, 1, 'Super Admin', 'Administration / HR', '2026-10-09 06:51:47', 'User logged in', 'Authentication', 'user', 'bullseur', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/login'),
(117, 1, 'Super Admin', 'Administration / HR', '2026-10-09 06:52:02', 'User logged out', 'Authentication', 'user', 'bullseur', 'Session token revoked.', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/superadmin/applicants'),
(118, 4, 'Employee', 'Kitchen / Culinary', '2026-10-09 06:52:05', 'User logged in', 'Authentication', 'user', 'kdelacruz', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/login'),
(119, 4, 'Employee', 'Kitchen / Culinary', '2026-10-09 08:09:07', 'User logged out', 'Authentication', 'user', 'kdelacruz', 'Session token revoked.', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/employee/ess?category=Recognition'),
(120, 1, 'Super Admin', 'Administration / HR', '2026-10-09 08:23:09', 'User logged in', 'Authentication', 'user', 'bullseur', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/login'),
(121, 1, 'Super Admin', 'Administration / HR', '2026-10-09 08:31:14', 'User logged out', 'Authentication', 'user', 'bullseur', 'Session token revoked.', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/superadmin'),
(122, 4, 'Employee', 'Kitchen / Culinary', '2026-10-09 08:31:17', 'User logged in', 'Authentication', 'user', 'kdelacruz', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/login'),
(123, 4, 'Employee', 'Kitchen / Culinary', '2026-10-09 09:26:33', 'User logged out', 'Authentication', 'user', 'kdelacruz', 'Session token revoked.', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/employee'),
(124, 1, 'Super Admin', 'Administration / HR', '2026-10-09 09:26:38', 'User logged in', 'Authentication', 'user', 'bullseur', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/login'),
(125, 1, 'Super Admin', 'Administration / HR', '2026-10-09 09:30:44', 'User logged out', 'Authentication', 'user', 'bullseur', 'Session token revoked.', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/superadmin'),
(126, 4, 'Employee', 'Kitchen / Culinary', '2026-10-09 09:30:48', 'User logged in', 'Authentication', 'user', 'kdelacruz', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/login'),
(127, 4, 'Employee', 'Kitchen / Culinary', '2026-10-09 09:34:39', 'User logged out', 'Authentication', 'user', 'kdelacruz', 'Session token revoked.', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/employee'),
(128, 1, 'Super Admin', 'Administration / HR', '2026-10-09 09:34:44', 'User logged in', 'Authentication', 'user', 'bullseur', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/login'),
(129, 1, 'Super Admin', 'Administration / HR', '2026-10-09 09:35:44', 'User logged out', 'Authentication', 'user', 'bullseur', 'Session token revoked.', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/superadmin'),
(130, 4, 'Employee', 'Kitchen / Culinary', '2026-10-09 09:35:46', 'User logged in', 'Authentication', 'user', 'kdelacruz', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/login'),
(131, 4, 'Employee', 'Kitchen / Culinary', '2026-10-09 10:09:49', 'User logged out', 'Authentication', 'user', 'kdelacruz', 'Session token revoked.', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/employee/ess?category=Documents'),
(132, 3, 'Admin', 'Front Office', '2026-10-09 10:09:55', 'OTP sent', 'Authentication', 'user', 'aramos', 'One-time password emailed to a*******@oxfordsuites.com.ph', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/login'),
(133, 3, 'Admin', 'Front Office', '2026-10-09 10:10:29', 'User logged in', 'Authentication', 'user', 'aramos', 'Two-factor login completed.', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/otp'),
(134, 3, 'Admin', 'Front Office', '2026-10-09 10:10:43', 'System user updated', 'User Management', 'user', '3', 'Changed: otp_enabled', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/admin/settings'),
(135, 3, 'Admin', 'Front Office', '2026-10-09 10:30:49', 'User logged out', 'Authentication', 'user', 'aramos', 'Session token revoked.', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/admin/onboarding'),
(136, 3, 'Admin', 'Front Office', '2026-10-09 10:36:39', 'User logged in', 'Authentication', 'user', 'aramos', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/login'),
(137, 3, 'Admin', 'Front Office', '2026-10-09 10:53:10', 'User logged out', 'Authentication', 'user', 'aramos', 'Session token revoked.', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/admin/applicants'),
(138, 4, 'Employee', 'Kitchen / Culinary', '2026-10-09 10:53:14', 'User logged in', 'Authentication', 'user', 'kdelacruz', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/login'),
(139, 4, 'Employee', 'Kitchen / Culinary', '2026-10-09 11:23:40', 'User logged out', 'Authentication', 'user', 'kdelacruz', 'Session token revoked.', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/employee'),
(140, 4, 'Employee', 'Kitchen / Culinary', '2026-10-09 11:56:03', 'User logged in', 'Authentication', 'user', 'kdelacruz', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/login'),
(141, 4, 'Employee', 'Kitchen / Culinary', '2026-10-09 12:11:13', 'User logged in', 'Authentication', 'user', 'kdelacruz', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/login'),
(142, 4, 'Employee', 'Kitchen / Culinary', '2026-10-09 12:17:45', 'User logged out', 'Authentication', 'user', 'kdelacruz', 'Session token revoked.', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/employee'),
(143, 3, 'Admin', 'Front Office', '2026-10-09 12:17:55', 'User logged in', 'Authentication', 'user', 'aramos', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/login'),
(144, 3, 'Admin', 'Front Office', '2026-10-09 12:33:05', 'User logged out', 'Authentication', 'user', 'aramos', 'Session token revoked.', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/admin'),
(145, 4, 'Employee', 'Kitchen / Culinary', '2026-10-09 13:07:56', 'User logged in', 'Authentication', 'user', 'kdelacruz', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/login');

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cache`
--

INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES
('hotel-restaurant-hr-cache-03cf579e49c51b83d1ab36f58545821a', 'i:1;', 1791536977),
('hotel-restaurant-hr-cache-03cf579e49c51b83d1ab36f58545821a:timer', 'i:1791536977;', 1791536977),
('hotel-restaurant-hr-cache-356a192b7913b04c54574d18c28d46e6395428ab', 'i:3;', 1791444441),
('hotel-restaurant-hr-cache-356a192b7913b04c54574d18c28d46e6395428ab:timer', 'i:1791444441;', 1791444441),
('hotel-restaurant-hr-cache-5c785c036466adea360111aa28563bfd556b5fba', 'i:1;', 1791580136),
('hotel-restaurant-hr-cache-5c785c036466adea360111aa28563bfd556b5fba:timer', 'i:1791580136;', 1791580136),
('hotel-restaurant-hr-cache-auth.otp.CWYaPrVMTnkqrKNCkQ9NjRSF6KynsnBU3FxDx5aqv261FS8mMuaTzDqxjMDJSrYy', 'a:5:{s:7:\"user_id\";i:3;s:9:\"code_hash\";s:64:\"1ebe712a56744ca0a9fffc2d40d71c67e2e00a416e79eb36c8f059c935e0d0e0\";s:8:\"attempts\";i:0;s:10:\"expires_at\";i:1791444598;s:14:\"captcha_passed\";b:1;}', 1791444598),
('hotel-restaurant-hr-cache-auth.otp.t30Uh7XFH5EO5CHRXGKXrGxMTfgV7AUzsvErdKPoCBrzEEDRba5N3iPhQaNRxprf', 'a:5:{s:7:\"user_id\";i:3;s:9:\"code_hash\";s:64:\"593e1d14f6ce066839581bcb47d45e2ef0fa17a6aab4bbdb61c6f4b1660e730e\";s:8:\"attempts\";i:0;s:10:\"expires_at\";i:1791444377;s:14:\"captcha_passed\";b:1;}', 1791444377);

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `chatbot_faqs`
--

CREATE TABLE `chatbot_faqs` (
  `faq_id` bigint(20) UNSIGNED NOT NULL,
  `question` varchar(255) NOT NULL,
  `answer` text NOT NULL,
  `keywords` text DEFAULT NULL,
  `enabled` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `chatbot_faqs`
--

INSERT INTO `chatbot_faqs` (`faq_id`, `question`, `answer`, `keywords`, `enabled`, `sort_order`, `created_at`, `updated_at`) VALUES
(1, 'How do employee promotions work in the HRMS?', 'Employees file a promotion request from their ESS portal (Promotion tab). HR reviews it under Core HCM → Promotion Requests; approving applies the position transfer and history entry immediately.', 'promotion,promotions,regularization,regularize,hr3,evaluation,handoff,salary increase,demote', 1, 90, '2026-10-01 22:12:34', '2026-10-01 22:12:34'),
(2, 'How do job requisitions become job posts?', 'Requisitions are raised in Core HCM (Departments & Positions → Requisitions). Recruitment then converts an approved requisition into a live job post via the Requisitions tab.', 'requisition,requisitions,headcount,vacancy request,job order,hiring request,convert', 1, 91, '2026-10-01 22:12:34', '2026-10-01 22:12:34'),
(3, 'How do I export a report?', 'Every module header has a Generate Report control — use it to export the current view as PDF, DOCX or Excel.', 'report,reports,export,pdf,docx,excel,generate report,download', 1, 92, '2026-10-01 22:12:34', '2026-10-01 22:12:34'),
(4, 'How do I file a leave request?', 'Open the ESS portal, go to Request Center (or Attendance tab for leave balances), pick the leave type and date range, then submit. HR sees it instantly in the ESS Management queue.', 'leave,leave request,vl,sl,file leave,time off,absence,leave credits,attendance', 1, 93, '2026-10-01 22:12:34', '2026-10-01 22:12:34');

-- --------------------------------------------------------

--
-- Table structure for table `chatbot_messages`
--

CREATE TABLE `chatbot_messages` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `session_id` varchar(80) DEFAULT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `role` varchar(20) NOT NULL DEFAULT 'guest',
  `message` text NOT NULL,
  `reply` text NOT NULL,
  `source` varchar(20) NOT NULL DEFAULT 'fallback',
  `faq_ids` text DEFAULT NULL,
  `had_faq_context` tinyint(1) NOT NULL DEFAULT 0,
  `feedback` tinyint(4) DEFAULT NULL,
  `prompt_tokens` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `completion_tokens` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `chatbot_messages`
--

INSERT INTO `chatbot_messages` (`id`, `session_id`, `user_id`, `role`, `message`, `reply`, `source`, `faq_ids`, `had_faq_context`, `feedback`, `prompt_tokens`, `completion_tokens`, `created_at`, `updated_at`) VALUES
(1, NULL, NULL, 'employee', 'hello', 'Hi there! I can help with open jobs, pay, required documents, the hiring timeline, and how to apply. What would you like to know?', 'fallback', '[]', 0, NULL, 0, 0, '2026-10-05 02:12:56', '2026-10-05 02:12:56'),
(2, NULL, NULL, 'employee', 'What does my HMO healthcare cover?', 'Teammates enjoy service charge, meal allowance, and HMO coverage after regularization, plus paid on-the-job training when you start.', 'fallback', '[]', 0, NULL, 0, 0, '2026-10-05 02:16:19', '2026-10-05 02:16:19'),
(3, NULL, NULL, 'employee', 'heyyy', 'Hi there! I can help with open jobs, pay, required documents, the hiring timeline, and how to apply. What would you like to know?', 'fallback', '[]', 0, NULL, 0, 0, '2026-10-07 23:06:06', '2026-10-07 23:06:06'),
(4, NULL, NULL, 'employee', 'can i know the how the payroll works', 'From ₱14,000.00 to ₱24,000.00 per month, depending on the role. Ask me about a specific role for its exact range.', 'fallback', '[]', 0, NULL, 0, 0, '2026-10-07 23:06:59', '2026-10-07 23:06:59'),
(5, NULL, NULL, 'employee', 'ano ang proseso ng ess sa performance', 'Head to the Find Jobs section, open the position you like, and fill in the application form on that page — full name, email, phone, location, and your resume file (PDF, DOC, or DOCX, up to 5MB). No account or sign-up needed.', 'fallback', '[]', 0, NULL, 0, 0, '2026-10-07 23:08:15', '2026-10-07 23:08:15'),
(6, NULL, NULL, 'employee', 'tagalog ka', 'I\'m still learning! I can help with open jobs, how to apply, required documents, resume screening, the hiring timeline, salary & benefits, and contact info. For anything else, email hr@oxfordsuites.com.ph.', 'fallback', '[]', 0, NULL, 0, 0, '2026-10-07 23:08:27', '2026-10-07 23:08:27'),
(7, NULL, NULL, 'employee', 'what company name of this hrms system', 'You can reach HR at hr@oxfordsuites.com.ph or +63 2 8888 8688 (24 Hours). You can also visit us at 528 P. Burgos Street, Makati City, Metro Manila, Philippines 1210.', 'fallback', '[]', 0, NULL, 0, 0, '2026-10-07 23:09:17', '2026-10-07 23:09:17'),
(8, NULL, NULL, 'employee', 'dwadsadwa', 'I\'m still learning! I can help with open jobs, how to apply, required documents, resume screening, the hiring timeline, salary & benefits, and contact info. For anything else, email hr@oxfordsuites.com.ph.', 'fallback', '[]', 0, NULL, 0, 0, '2026-10-07 23:09:32', '2026-10-07 23:09:32'),
(9, NULL, NULL, 'employee', 'bobo kaba', 'I\'m still learning! I can help with open jobs, how to apply, required documents, resume screening, the hiring timeline, salary & benefits, and contact info. For anything else, email hr@oxfordsuites.com.ph.', 'fallback', '[]', 0, NULL, 0, 0, '2026-10-07 23:18:09', '2026-10-07 23:18:09'),
(10, NULL, NULL, 'employee', 'pwede mo bang bigay sakin ang aking payslip', 'From ₱14,000.00 to ₱24,000.00 per month, depending on the role. Ask me about a specific role for its exact range.', 'fallback', '[]', 0, NULL, 0, 0, '2026-10-08 00:25:09', '2026-10-08 00:25:09'),
(11, NULL, NULL, 'employee', 'pwede mo bang bigay sakin ang aking payslip', 'From ₱14,000.00 to ₱24,000.00 per month, depending on the role. Ask me about a specific role for its exact range.', 'fallback', '[]', 0, NULL, 0, 0, '2026-10-09 01:08:37', '2026-10-09 01:08:37');

-- --------------------------------------------------------

--
-- Table structure for table `chatbot_unanswered`
--

CREATE TABLE `chatbot_unanswered` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `session_id` varchar(80) DEFAULT NULL,
  `message` text NOT NULL,
  `intent` varchar(40) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `chatbot_unanswered`
--

INSERT INTO `chatbot_unanswered` (`id`, `session_id`, `message`, `intent`, `created_at`) VALUES
(1, NULL, 'tagalog ka', NULL, '2026-10-08 07:08:27'),
(2, NULL, 'dwadsadwa', NULL, '2026-10-08 07:09:32'),
(3, NULL, 'bobo kaba', NULL, '2026-10-08 07:18:09');

-- --------------------------------------------------------

--
-- Table structure for table `checklist_requests`
--

CREATE TABLE `checklist_requests` (
  `checklist_request_id` bigint(20) UNSIGNED NOT NULL,
  `request_code` varchar(40) NOT NULL,
  `employee_id` bigint(20) UNSIGNED NOT NULL,
  `template_id` bigint(20) UNSIGNED DEFAULT NULL,
  `phase` varchar(30) NOT NULL,
  `items_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`items_json`)),
  `status` varchar(30) NOT NULL DEFAULT 'Pending',
  `requested_by_user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `requested_at` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

--
-- Dumping data for table `checklist_requests`
--

INSERT INTO `checklist_requests` (`checklist_request_id`, `request_code`, `employee_id`, `template_id`, `phase`, `items_json`, `status`, `requested_by_user_id`, `requested_at`, `created_at`, `updated_at`) VALUES
(1, 'CR-001', 22, 2, 'Probationary', '[\"Guest-handling scenario evaluation\",\"PMS (Opera) proficiency check\",\"Supervisor sign-off: guest complaints handling\",\"Supervisor sign-off: reservations process\"]', 'Pending', 2, '2026-08-04', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(2, 'CR-002', 23, 2, 'Probationary', '[\"Room-turnover timing check (30-minute SLA)\",\"Chemical-handling and safety procedure\",\"Linen and amenities restocking check\",\"Supervisor sign-off\"]', 'Pending', 2, '2026-08-06', '2026-10-02 06:24:35', '2026-10-02 06:24:35');

-- --------------------------------------------------------

--
-- Table structure for table `departments`
--

CREATE TABLE `departments` (
  `department_id` bigint(20) UNSIGNED NOT NULL,
  `code` varchar(30) NOT NULL,
  `name` varchar(120) NOT NULL,
  `description` text DEFAULT NULL,
  `head_employee_id` bigint(20) UNSIGNED DEFAULT NULL,
  `budget` decimal(14,2) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `departments`
--

INSERT INTO `departments` (`department_id`, `code`, `name`, `description`, `head_employee_id`, `budget`, `created_at`, `updated_at`) VALUES
(1, 'DEP-FO', 'Front Office', 'Front Desk, Concierge, Reservations, Guest Services', 1, 2800000.00, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(2, 'DEP-FB', 'Food & Beverage', 'Dining Room, Bar Operations, Room Service', 2, 3500000.00, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(3, 'DEP-KC', 'Kitchen / Culinary', 'Main Hotel Kitchen, Banquet Catering, Pastry', 10, 4200000.00, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(4, 'DEP-HK', 'Housekeeping', 'Guestroom Operations, Linen & Laundry, Public Areas', 3, 2400000.00, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(5, 'DEP-HR', 'Administration / HR', 'Human Resources, Accounting, General Maintenance', 7, 3100000.00, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(6, 'DEP-SEC', 'Security', 'Guest and property security, patrol operations', 27, 900000.00, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(7, 'DEP-WEL', 'Wellness', 'Spa, gym, and wellness centre services', 28, 700000.00, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(8, 'DEP-FIN', 'Finance', 'Accounting, payables, receivables, month-end close', 32, 1100000.00, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(9, 'DEP-ENG', 'Engineering', 'Building maintenance, preventive maintenance, facilities', 36, 1300000.00, '2026-10-02 06:24:35', '2026-10-02 06:24:35');

-- --------------------------------------------------------

--
-- Table structure for table `employees`
--

CREATE TABLE `employees` (
  `employee_id` bigint(20) UNSIGNED NOT NULL,
  `employee_code` varchar(40) NOT NULL,
  `first_name` varchar(80) NOT NULL,
  `middle_name` varchar(80) DEFAULT NULL,
  `last_name` varchar(80) NOT NULL,
  `email` varchar(190) NOT NULL,
  `personal_email` varchar(190) DEFAULT NULL,
  `phone` varchar(40) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `birth_date` date DEFAULT NULL,
  `gender` varchar(20) DEFAULT NULL,
  `civil_status` varchar(20) DEFAULT NULL,
  `nationality` varchar(60) DEFAULT NULL,
  `sss_number` varchar(30) DEFAULT NULL,
  `philhealth_number` varchar(30) DEFAULT NULL,
  `pagibig_number` varchar(30) DEFAULT NULL,
  `tin_number` varchar(30) DEFAULT NULL,
  `position_id` bigint(20) UNSIGNED NOT NULL,
  `department_id` bigint(20) UNSIGNED NOT NULL,
  `employment_type` varchar(30) NOT NULL,
  `date_hired` date NOT NULL,
  `supervisor_employee_id` bigint(20) UNSIGNED DEFAULT NULL,
  `status` varchar(30) NOT NULL,
  `onboarding_complete` tinyint(1) NOT NULL DEFAULT 0,
  `salary_grade_id` bigint(20) UNSIGNED DEFAULT NULL,
  `employee_record_last_updated_at` date DEFAULT NULL,
  `salary_step` varchar(30) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `employees`
--

INSERT INTO `employees` (`employee_id`, `employee_code`, `first_name`, `middle_name`, `last_name`, `email`, `personal_email`, `phone`, `address`, `birth_date`, `gender`, `civil_status`, `nationality`, `sss_number`, `philhealth_number`, `pagibig_number`, `tin_number`, `position_id`, `department_id`, `employment_type`, `date_hired`, `supervisor_employee_id`, `status`, `onboarding_complete`, `salary_grade_id`, `employee_record_last_updated_at`, `salary_step`, `created_at`, `updated_at`) VALUES
(1, 'EMP-0001', 'Ana', 'M.', 'Ramos', 'ana.ramos@oxfordsuites.com.ph', NULL, '0917 100 1001', 'Makati City', '1986-05-14', 'Female', 'Married', 'Filipino', NULL, NULL, NULL, NULL, 10, 1, 'Regular', '2019-02-11', 9, 'Active', 1, 6, '2026-01-10', 'Step 3', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(2, 'EMP-0002', 'Gabriel', 'S.', 'Mendoza', 'gabriel.mendoza@oxfordsuites.com.ph', NULL, '0917 100 1002', 'Makati City', '1979-11-02', 'Male', 'Married', 'Filipino', NULL, NULL, NULL, NULL, 11, 2, 'Regular', '2018-06-04', 9, 'Active', 1, 7, '2025-11-02', 'Step 4', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(3, 'EMP-0003', 'Lourdes', 'B.', 'Bautista', 'lourdes.bautista@oxfordsuites.com.ph', NULL, '0917 100 1003', 'Quezon City', '1971-03-27', 'Female', 'Married', 'Filipino', NULL, NULL, NULL, NULL, 13, 4, 'Regular', '2017-11-20', 9, 'Active', 1, 6, '2012-06-15', 'Step 3', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(4, 'EMP-0004', 'Camille', 'T.', 'Ortega', 'camille.ortega@oxfordsuites.com.ph', NULL, '0917 664 2219', 'Makati City', '2001-02-09', 'Female', 'Single', 'Filipino', NULL, NULL, NULL, NULL, 2, 1, 'Probationary', '2026-08-04', 1, 'Active', 0, 4, '2026-01-14', 'Step 1', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(5, 'EMP-0005', 'Kevin', 'D.', 'Dela Cruz', 'kevin.delacruz@oxfordsuites.com.ph', NULL, '0921 774 9903', '14 Kalayaan Ave, Makati City', '1998-08-17', 'Male', 'Single', 'Filipino', '34-1234567-8', '12-345678901-2', '1234-5678-9012', '123-456-789', 5, 3, 'Probationary', '2026-04-15', 10, 'Active', 0, 2, '2026-01-20', 'Step 2', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(6, 'EMP-0006', 'Marjun', 'V.', 'Devera', 'marjun.devera@oxfordsuites.com.ph', NULL, '0917 664 2219', 'Pasay City', '1999-12-03', 'Male', 'Single', 'Filipino', NULL, NULL, NULL, NULL, 3, 2, 'Regular', '2025-09-16', 2, 'Active', 1, 1, '2011-03-30', 'Step 1', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(7, 'EMP-0007', 'Juan', 'C.', 'Dela Cruz', 'juan.delacruz@oxfordsuites.com.ph', NULL, '0917 100 1007', 'Makati City', '1982-06-21', 'Male', 'Married', 'Filipino', NULL, NULL, NULL, NULL, 14, 5, 'Regular', '2016-01-18', 9, 'Active', 1, 7, '2024-08-08', 'Step 3', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(8, 'EMP-0008', 'Rosa', 'P.', 'Aquino', 'rosa.aquino@oxfordsuites.com.ph', NULL, '0917 100 1008', 'Taguig City', '1990-01-30', 'Female', 'Married', 'Filipino', NULL, NULL, NULL, NULL, 15, 4, 'Regular', '2021-05-03', 3, 'Active', 1, 4, '2025-05-19', 'Step 2', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(9, 'EMP-0009', 'Ricardo', 'A.', 'Villanueva', 'ricardo.villanueva@oxfordsuites.com.ph', NULL, '0917 100 1009', 'Makati City', '1975-09-12', 'Male', 'Married', 'Filipino', NULL, NULL, NULL, NULL, 9, 5, 'Regular', '2015-03-02', NULL, 'Active', 1, 7, NULL, 'Step 5', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(10, 'EMP-0010', 'Marco', 'D.', 'Santos', 'marco.santos@oxfordsuites.com.ph', NULL, '0917 100 1010', 'Mandaluyong City', '1980-04-25', 'Male', 'Married', 'Filipino', NULL, NULL, NULL, NULL, 12, 3, 'Regular', '2017-07-10', NULL, 'Active', 1, 7, NULL, 'Step 4', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(11, 'EMP-0011', 'Maria', 'L.', 'Lim', 'maria.lim@oxfordsuites.com.ph', NULL, '0917 100 1011', 'Makati City', '1993-10-08', 'Female', 'Single', 'Filipino', NULL, NULL, NULL, NULL, 16, 5, 'Regular', '2020-02-03', 7, 'Active', 1, 4, NULL, 'Step 2', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(12, 'EMP-0012', 'Paolo', 'R.', 'Cruz', 'paolo.cruz@oxfordsuites.com.ph', NULL, '0917 100 1012', 'Pasig City', '1988-07-15', 'Male', 'Married', 'Filipino', NULL, NULL, NULL, NULL, 17, 5, 'Regular', '2019-08-19', 7, 'Active', 1, 4, NULL, 'Step 2', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(13, 'EMP-0013', 'Bianca', 'S.', 'Soriano', 'bianca.soriano@oxfordsuites.com.ph', NULL, '0912 345 6789', 'Manila', '2000-04-22', 'Female', 'Single', 'Filipino', NULL, NULL, NULL, NULL, 1, 1, 'Probationary', '2026-08-04', 1, 'Active', 0, 2, NULL, 'Step 1', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(14, 'EMP-0014', 'Jompaks', 'B.', 'Berdugo', 'jompaks.berdugo@oxfordsuites.com.ph', NULL, '0933 552 1180', 'Parañaque City', '1996-09-05', 'Male', 'Single', 'Filipino', NULL, NULL, NULL, NULL, 4, 2, 'Probationary', '2026-03-01', 2, 'Active', 1, 1, NULL, 'Step 1', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(15, 'EMP-0015', 'Angelo', 'T.', 'Torres', 'angelo.torres@oxfordsuites.com.ph', NULL, '0917 220 5541', 'Makati City', '1999-03-18', 'Male', 'Single', 'Filipino', NULL, NULL, NULL, NULL, 1, 1, 'Probationary', '2026-05-11', 1, 'Active', 0, 2, NULL, 'Step 1', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(16, 'EMP-0016', 'Ligaya', 'S.', 'Santos', 'ligaya.santos@oxfordsuites.com.ph', NULL, '0918 663 2201', 'Caloocan City', '1987-12-11', 'Female', 'Married', 'Filipino', NULL, NULL, NULL, NULL, 7, 4, 'Probationary', '2026-02-20', 3, 'Active', 0, 1, NULL, 'Step 1', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(17, 'EMP-0017', 'Michael', 'R.', 'Reyes', 'michael.reyes@oxfordsuites.com.ph', NULL, '0920 441 8873', 'Quezon City', '2002-01-27', 'Male', 'Single', 'Filipino', NULL, NULL, NULL, NULL, 8, 5, 'Probationary', '2026-06-01', 7, 'Active', 0, 3, NULL, 'Step 1', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(18, 'EMP-0018', 'Patricia', 'G.', 'Gomez', 'patricia.gomez@oxfordsuites.com.ph', NULL, '0917 903 2245', 'Makati City', '1991-06-09', 'Female', 'Married', 'Filipino', NULL, NULL, NULL, NULL, 6, 3, 'Regular', '2025-06-02', 10, 'Active', 1, 5, NULL, 'Step 2', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(19, 'EMP-0019', 'Ernesto', 'V.', 'Villar', 'ernesto.villar@oxfordsuites.com.ph', NULL, '0921 556 7743', 'Manila', '1985-05-30', 'Male', 'Married', 'Filipino', NULL, NULL, NULL, NULL, 7, 4, 'Regular', '2025-03-19', 3, 'Active', 1, 1, NULL, 'Step 2', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(20, 'EMP-0020', 'Grace', 'P.', 'Panganiban', 'grace.panganiban@oxfordsuites.com.ph', NULL, '0917 332 8890', 'Makati City', '1997-02-14', 'Female', 'Single', 'Filipino', NULL, NULL, NULL, NULL, 2, 1, 'Regular', '2025-11-10', 1, 'Active', 0, 4, NULL, 'Step 1', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(21, 'EMP-0021', 'Noel', 'F.', 'Fajardo', 'noel.fajardo@oxfordsuites.com.ph', NULL, '0918 774 3320', 'Valenzuela City', '1984-10-19', 'Male', 'Married', 'Filipino', NULL, NULL, NULL, NULL, 8, 5, 'Regular', '2025-01-27', 7, 'Active', 1, 3, NULL, 'Step 2', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(22, 'EMP-0022', 'Miguel', 'T.', 'Torres', 'miguel.torres@oxfordsuites.com.ph', NULL, '0917 442 1177', 'Makati City', '1998-11-25', 'Male', 'Single', 'Filipino', NULL, NULL, NULL, NULL, 1, 1, 'Probationary', '2026-05-04', 1, 'Active', 0, 2, NULL, 'Step 1', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(23, 'EMP-0023', 'Andrea', 'L.', 'Lim', 'andrea.lim@oxfordsuites.com.ph', NULL, '0917 883 5566', 'Mandaluyong City', '1999-08-02', 'Female', 'Single', 'Filipino', NULL, NULL, NULL, NULL, 7, 4, 'Probationary', '2026-03-06', 3, 'Active', 0, 1, NULL, 'Step 1', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(24, 'EMP-0024', 'Ramon', 'D.', 'Aquino', 'ramon.aquino@oxfordsuites.com.ph', NULL, '0917 555 2401', 'Makati City', '1988-04-12', 'Male', 'Married', 'Filipino', NULL, NULL, NULL, NULL, 18, 6, 'Regular', '2021-08-15', 27, 'Active', 1, 1, NULL, 'Step 2', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(25, 'EMP-0025', 'Jose', 'M.', 'Rizal', 'jose.rizal@oxfordsuites.com.ph', NULL, '0917 555 2402', 'Pasay City', '1992-07-20', 'Male', 'Single', 'Filipino', NULL, NULL, NULL, NULL, 18, 6, 'Regular', '2023-02-10', 27, 'Active', 1, 1, NULL, 'Step 1', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(26, 'EMP-0026', 'Mario', 'S.', 'Santos', 'mario.santos@oxfordsuites.com.ph', NULL, '0917 555 2403', 'Taguig City', '1995-11-05', 'Male', 'Single', 'Filipino', NULL, NULL, NULL, NULL, 18, 6, 'Probationary', '2025-09-01', 27, 'Active', 0, 1, NULL, 'Step 1', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(27, 'EMP-0027', 'Dante', 'R.', 'Cruz', 'dante.cruz@oxfordsuites.com.ph', NULL, '0917 555 2404', 'Makati City', '1980-01-30', 'Male', 'Married', 'Filipino', NULL, NULL, NULL, NULL, 19, 6, 'Regular', '2019-05-20', NULL, 'Active', 1, 4, NULL, 'Step 3', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(28, 'EMP-0028', 'Lorna', 'V.', 'Dizon', 'lorna.dizon@oxfordsuites.com.ph', NULL, '0917 555 2405', 'Mandaluyong City', '1994-03-17', 'Female', 'Single', 'Filipino', NULL, NULL, NULL, NULL, 20, 7, 'Regular', '2022-06-12', NULL, 'Active', 1, 2, NULL, 'Step 2', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(29, 'EMP-0029', 'Jenny', 'P.', 'Lim', 'jenny.lim@oxfordsuites.com.ph', NULL, '0917 555 2406', 'Makati City', '1996-09-25', 'Female', 'Single', 'Filipino', NULL, NULL, NULL, NULL, 20, 7, 'Probationary', '2025-11-01', 28, 'Active', 0, 2, NULL, 'Step 1', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(30, 'EMP-0030', 'Carlos', 'J.', 'Mendoza', 'carlos.mendoza@oxfordsuites.com.ph', NULL, '0917 555 2407', 'Pasig City', '1998-12-08', 'Male', 'Single', 'Filipino', NULL, NULL, NULL, NULL, 21, 7, 'Probationary', '2026-01-15', 28, 'Active', 0, 1, NULL, 'Step 1', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(31, 'EMP-0031', 'Rica', 'A.', 'Villanueva', 'rica.villanueva@oxfordsuites.com.ph', NULL, '0917 555 2408', 'Makati City', '1993-05-11', 'Female', 'Married', 'Filipino', NULL, NULL, NULL, NULL, 22, 8, 'Regular', '2021-03-08', 32, 'Active', 1, 3, NULL, 'Step 2', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(32, 'EMP-0032', 'Paola', 'G.', 'Reyes', 'paola.reyes@oxfordsuites.com.ph', NULL, '0917 555 2409', 'Quezon City', '1989-08-19', 'Female', 'Married', 'Filipino', NULL, NULL, NULL, NULL, 23, 8, 'Regular', '2018-10-01', NULL, 'Active', 1, 5, NULL, 'Step 3', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(33, 'EMP-0033', 'Enrico', 'B.', 'Santos', 'enrico.santos@oxfordsuites.com.ph', NULL, '0917 555 2410', 'Caloocan City', '1987-06-22', 'Male', 'Married', 'Filipino', NULL, NULL, NULL, NULL, 24, 9, 'Regular', '2020-04-17', 36, 'Active', 1, 2, NULL, 'Step 2', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(34, 'EMP-0034', 'Nardo', 'C.', 'Dela Cruz', 'nardo.delacruz@oxfordsuites.com.ph', NULL, '0917 555 2411', 'Manila', '1991-02-14', 'Male', 'Single', 'Filipino', NULL, NULL, NULL, NULL, 24, 9, 'Regular', '2022-09-05', 36, 'Active', 1, 2, NULL, 'Step 1', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(35, 'EMP-0035', 'Felipe', 'D.', 'Ramos', 'felipe.ramos@oxfordsuites.com.ph', NULL, '0917 555 2412', 'Makati City', '1999-10-30', 'Male', 'Single', 'Filipino', NULL, NULL, NULL, NULL, 24, 9, 'Probationary', '2026-02-01', 36, 'Active', 0, 2, NULL, 'Step 1', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(36, 'EMP-0036', 'Victor', 'E.', 'Lim', 'victor.lim@oxfordsuites.com.ph', NULL, '0917 555 2413', 'Pasay City', '1984-12-12', 'Male', 'Married', 'Filipino', NULL, NULL, NULL, NULL, 25, 9, 'Regular', '2017-07-25', NULL, 'Active', 1, 4, NULL, 'Step 3', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(37, 'EMP-0037', 'Andres', 'F.', 'Bonifacio', 'andres.bonifacio@oxfordsuites.com.ph', NULL, '0917 555 2414', 'Marikina City', '1990-05-05', 'Male', 'Single', 'Filipino', NULL, NULL, NULL, NULL, 26, 9, 'Regular', '2021-12-10', 36, 'Active', 1, 2, NULL, 'Step 2', '2026-10-02 06:24:35', '2026-10-02 06:24:35');

-- --------------------------------------------------------

--
-- Table structure for table `employee_benefits`
--

CREATE TABLE `employee_benefits` (
  `employee_benefit_id` bigint(20) UNSIGNED NOT NULL,
  `employee_id` bigint(20) UNSIGNED NOT NULL,
  `benefit_name` varchar(100) NOT NULL,
  `reference_value` varchar(190) DEFAULT NULL,
  `note` text DEFAULT NULL,
  `effective_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `status` varchar(30) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

--
-- Dumping data for table `employee_benefits`
--

INSERT INTO `employee_benefits` (`employee_benefit_id`, `employee_id`, `benefit_name`, `reference_value`, `note`, `effective_date`, `end_date`, `status`, `created_at`, `updated_at`) VALUES
(1, 5, 'SSS', '34-1234567-8', 'Active contributions', '2026-04-15', NULL, 'Active', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(2, 5, 'PhilHealth', '12-345678901-2', 'Active', '2026-04-15', NULL, 'Active', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(3, 5, 'Pag-IBIG', '1234-5678-9012', 'Active + MP2', '2026-04-15', NULL, 'Active', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(4, 5, 'BIR Tax Status', 'S — Single', 'TIN 123-456-789', '2026-04-15', NULL, 'Active', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(5, 5, 'HMO', 'Maxicare Platinum', 'Effective after regularization', '2026-08-15', NULL, 'Inactive', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(6, 5, 'Insurance', 'Group Life', 'PHP 500,000 coverage', '2026-04-15', NULL, 'Active', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(7, 1, 'SSS', '34-2233445-6', 'Active contributions', '2019-02-11', NULL, 'Active', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(8, 1, 'HMO', 'Maxicare Gold', 'Executive plan', '2019-03-01', NULL, 'Active', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(9, 6, 'SSS', '34-5566778-9', 'Active contributions', '2025-09-16', NULL, 'Active', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(10, 6, 'HMO', 'Maxicare Silver', 'Effective after regularization', '2026-03-15', NULL, 'Active', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(11, 8, 'SSS', '34-7788990-1', 'Active contributions', '2021-05-03', NULL, 'Active', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(12, 8, 'Insurance', 'Group Life', 'PHP 300,000 coverage', '2021-05-03', NULL, 'Active', '2026-10-02 06:24:35', '2026-10-02 06:24:35');

-- --------------------------------------------------------

--
-- Table structure for table `employee_documents`
--

CREATE TABLE `employee_documents` (
  `document_id` bigint(20) UNSIGNED NOT NULL,
  `employee_id` bigint(20) UNSIGNED NOT NULL,
  `document_code` varchar(50) NOT NULL,
  `title` varchar(200) NOT NULL,
  `category` varchar(80) NOT NULL,
  `file_path` text DEFAULT NULL,
  `mime_type` varchar(100) DEFAULT NULL,
  `file_size_bytes` bigint(20) UNSIGNED DEFAULT NULL,
  `document_status` varchar(30) NOT NULL,
  `document_date` date DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `last_updated_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `employee_documents`
--

INSERT INTO `employee_documents` (`document_id`, `employee_id`, `document_code`, `title`, `category`, `file_path`, `mime_type`, `file_size_bytes`, `document_status`, `document_date`, `expiry_date`, `last_updated_at`, `created_at`, `updated_at`) VALUES
(1, 5, 'DOC-001', 'BIR Form 2316 (2025)', 'Tax Document', '/files/emp-0005/doc-001.pdf', 'application/pdf', 245760, 'Available', '2026-01-15', NULL, '2026-01-14 16:00:00', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(2, 5, 'DOC-002', 'Certificate of Employment (COE)', 'Employment', '/files/emp-0005/doc-002.pdf', 'application/pdf', 184320, 'Released', '2026-06-01', NULL, '2026-05-31 16:00:00', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(3, 5, 'DOC-003', 'Medical Clearance Certificate', 'Onboarding', '/files/emp-0005/doc-003.pdf', 'application/pdf', 1258291, 'Submitted', '2026-02-03', NULL, '2026-02-02 16:00:00', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(4, 5, 'DOC-004', 'SSS Form E-1', 'Government ID', '/files/emp-0005/doc-004.pdf', 'application/pdf', 317440, 'Submitted', '2026-02-02', NULL, '2026-02-01 16:00:00', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(5, 5, 'DOC-005', 'NBI Clearance (2026)', 'Clearance', NULL, NULL, NULL, 'Missing', NULL, '2026-08-15', NULL, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(6, 4, 'DOC-101', 'Signed Employment Contract', 'Employment', '/files/emp-0004/doc-101.pdf', 'application/pdf', 409600, 'Submitted', '2026-08-04', NULL, '2026-08-03 16:00:00', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(7, 4, 'DOC-102', 'NBI / Police Clearance', 'Clearance', '/files/emp-0004/doc-102.pdf', 'application/pdf', 204800, 'Submitted', '2026-07-20', '2027-07-20', '2026-08-03 16:00:00', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(8, 13, 'DOC-201', 'Signed Employment Contract', 'Employment', '/files/emp-0013/doc-201.pdf', 'application/pdf', 405504, 'Submitted', '2026-08-04', NULL, '2026-08-03 16:00:00', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(9, 1, 'DOC-301', 'Employment Contract (2019)', 'Employment', '/files/emp-0001/doc-301.pdf', 'application/pdf', 450560, 'Archived', '2019-02-11', NULL, '2026-01-09 16:00:00', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(10, 3, 'DOC-302', 'Archived 201 File', 'Personnel File', '/files/emp-0003/doc-302.pdf', 'application/pdf', 2100000, 'Archived', '2012-06-15', NULL, '2012-06-14 16:00:00', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(11, 6, 'DOC-303', 'Archived 201 File', 'Personnel File', '/files/emp-0006/doc-303.pdf', 'application/pdf', 1950000, 'Archived', '2011-03-30', NULL, '2011-03-29 16:00:00', '2026-10-02 06:24:35', '2026-10-02 06:24:35');

-- --------------------------------------------------------

--
-- Table structure for table `employee_emergency_contacts`
--

CREATE TABLE `employee_emergency_contacts` (
  `emergency_contact_id` bigint(20) UNSIGNED NOT NULL,
  `employee_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(160) NOT NULL,
  `relationship` varchar(80) DEFAULT NULL,
  `phone` varchar(40) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `is_primary` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `employee_emergency_contacts`
--

INSERT INTO `employee_emergency_contacts` (`emergency_contact_id`, `employee_id`, `name`, `relationship`, `phone`, `address`, `is_primary`, `created_at`, `updated_at`) VALUES
(1, 5, 'Liza Santos', 'Spouse', '0918 222 4410', '14 Kalayaan Ave, Makati City', 1, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(2, 1, 'Daniel Ramos', 'Spouse', '0917 555 1212', 'Makati City', 1, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(3, 4, 'Lorna Ortega', 'Mother', '0917 888 2323', 'San Fernando, Pampanga', 1, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(4, 6, 'Fely Devera', 'Mother', '0917 777 3434', 'Pasay City', 1, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(5, 8, 'Ramon Aquino', 'Spouse', '0917 666 4545', 'Taguig City', 1, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(6, 13, 'Nelia Soriano', 'Mother', '0912 345 6789', 'Manila', 1, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(7, 14, 'Bert Berdugo', 'Father', '0933 552 1180', 'Parañaque City', 1, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(8, 15, 'Sonia Torres', 'Mother', '0917 220 5541', 'Makati City', 1, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(9, 16, 'Mario Santos', 'Spouse', '0918 663 2201', 'Caloocan City', 1, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(10, 22, 'Teresa Torres', 'Mother', '0917 442 1177', 'Makati City', 1, '2026-10-02 06:24:35', '2026-10-02 06:24:35');

-- --------------------------------------------------------

--
-- Table structure for table `employee_exit_records`
--

CREATE TABLE `employee_exit_records` (
  `exit_record_id` bigint(20) UNSIGNED NOT NULL,
  `employee_id` bigint(20) UNSIGNED NOT NULL,
  `exit_type` varchar(30) NOT NULL,
  `exit_date` date NOT NULL,
  `clearance_status` varchar(20) NOT NULL,
  `coe_status` varchar(20) NOT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `employee_learning`
--

CREATE TABLE `employee_learning` (
  `employee_learning_id` bigint(20) UNSIGNED NOT NULL,
  `employee_id` bigint(20) UNSIGNED NOT NULL,
  `course_id` bigint(20) UNSIGNED NOT NULL,
  `status` varchar(30) NOT NULL,
  `score` decimal(5,2) DEFAULT NULL,
  `assigned_date` date DEFAULT NULL,
  `completed_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

--
-- Dumping data for table `employee_learning`
--

INSERT INTO `employee_learning` (`employee_learning_id`, `employee_id`, `course_id`, `status`, `score`, `assigned_date`, `completed_date`, `created_at`, `updated_at`) VALUES
(1, 5, 1, 'Completed', 95.00, '2026-05-10', '2026-07-10', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(2, 5, 2, 'Completed', 88.00, '2026-05-10', '2026-06-24', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(3, 5, 3, 'In Progress', NULL, '2026-07-15', NULL, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(4, 6, 2, 'Completed', 90.00, '2026-04-01', '2026-06-30', '2026-10-02 06:24:35', '2026-10-02 06:24:35');

-- --------------------------------------------------------

--
-- Table structure for table `employee_onboarding_items`
--

CREATE TABLE `employee_onboarding_items` (
  `employee_onboarding_item_id` bigint(20) UNSIGNED NOT NULL,
  `employee_id` bigint(20) UNSIGNED DEFAULT NULL,
  `new_hire_id` bigint(20) UNSIGNED DEFAULT NULL,
  `template_item_id` bigint(20) UNSIGNED DEFAULT NULL,
  `item_text` text NOT NULL,
  `file_path` varchar(500) DEFAULT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `done` tinyint(1) NOT NULL DEFAULT 0,
  `submitted_at` timestamp NULL DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `completed_by_user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `employee_onboarding_items`
--

INSERT INTO `employee_onboarding_items` (`employee_onboarding_item_id`, `employee_id`, `new_hire_id`, `template_item_id`, `item_text`, `file_path`, `file_name`, `notes`, `done`, `submitted_at`, `completed_at`, `completed_by_user_id`, `created_at`, `updated_at`) VALUES
(1, 4, 1, 1, 'Signed employment contract', NULL, NULL, NULL, 1, NULL, '2026-08-01 02:00:00', 2, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(2, 4, 1, 2, 'NBI / Police clearance', NULL, NULL, NULL, 1, NULL, '2026-08-01 02:05:00', 2, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(3, 4, 1, 3, 'Pre-employment medical exam', NULL, NULL, NULL, 0, NULL, NULL, NULL, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(4, 4, 1, 4, 'SSS / PhilHealth / Pag-IBIG / TIN', NULL, NULL, NULL, 0, NULL, NULL, NULL, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(5, 4, 1, 5, 'Birth certificate (PSA)', NULL, NULL, NULL, 0, NULL, NULL, NULL, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(6, 4, 1, 6, 'Company orientation attended', NULL, NULL, NULL, 0, NULL, NULL, NULL, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(7, 4, 1, 7, 'Uniform & ID issued', NULL, NULL, NULL, 0, NULL, NULL, NULL, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(8, 4, 1, 8, 'Department on-the-job training', NULL, NULL, NULL, 0, NULL, NULL, NULL, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(9, 13, 2, 1, 'Signed employment contract', NULL, NULL, NULL, 1, NULL, '2026-08-01 02:10:00', 2, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(10, 13, 2, 2, 'NBI / Police clearance', NULL, NULL, NULL, 1, NULL, '2026-08-01 02:12:00', 2, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(11, 13, 2, 3, 'Pre-employment medical exam', NULL, NULL, NULL, 1, NULL, '2026-08-02 01:00:00', 2, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(12, 13, 2, 4, 'SSS / PhilHealth / Pag-IBIG / TIN', NULL, NULL, NULL, 1, NULL, '2026-08-02 01:30:00', 2, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(13, 13, 2, 5, 'Birth certificate (PSA)', NULL, NULL, NULL, 1, NULL, '2026-08-02 02:00:00', 2, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(14, 13, 2, 6, 'Company orientation attended', NULL, NULL, NULL, 0, NULL, NULL, NULL, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(15, 13, 2, 7, 'Uniform & ID issued', NULL, NULL, NULL, 0, NULL, NULL, NULL, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(16, 13, 2, 8, 'Department on-the-job training', NULL, NULL, NULL, 0, NULL, NULL, NULL, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(17, 5, 3, 1, 'Signed employment contract', NULL, NULL, NULL, 1, NULL, '2026-04-13 02:00:00', 2, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(18, 5, 3, 2, 'NBI / Police clearance', NULL, NULL, NULL, 1, NULL, '2026-04-13 02:10:00', 2, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(19, 5, 3, 3, 'Pre-employment medical exam', NULL, NULL, NULL, 1, NULL, '2026-04-14 01:00:00', 2, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(20, 5, 3, 4, 'SSS / PhilHealth / Pag-IBIG / TIN', NULL, NULL, NULL, 1, NULL, '2026-04-14 01:20:00', 2, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(21, 5, 3, 5, 'Birth certificate (PSA)', NULL, NULL, NULL, 1, NULL, '2026-04-14 01:40:00', 2, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(22, 5, 3, 6, 'Company orientation attended', NULL, NULL, NULL, 1, NULL, '2026-04-15 00:00:00', 2, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(23, 5, 3, 7, 'Uniform & ID issued', NULL, NULL, NULL, 1, NULL, '2026-04-15 00:30:00', 2, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(24, 5, 3, 8, 'Department on-the-job training', NULL, NULL, NULL, 0, NULL, NULL, NULL, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(25, 14, 4, 1, 'Signed employment contract', NULL, NULL, NULL, 1, NULL, '2026-02-26 02:00:00', 2, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(26, 14, 4, 2, 'NBI / Police clearance', NULL, NULL, NULL, 1, NULL, '2026-02-26 02:10:00', 2, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(27, 14, 4, 3, 'Pre-employment medical exam', NULL, NULL, NULL, 1, NULL, '2026-02-27 01:00:00', 2, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(28, 14, 4, 4, 'SSS / PhilHealth / Pag-IBIG / TIN', NULL, NULL, NULL, 1, NULL, '2026-02-27 01:30:00', 2, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(29, 14, 4, 5, 'Birth certificate (PSA)', NULL, NULL, NULL, 1, NULL, '2026-02-27 02:00:00', 2, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(30, 14, 4, 6, 'Company orientation attended', NULL, NULL, NULL, 1, NULL, '2026-02-28 00:00:00', 2, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(31, 14, 4, 7, 'Uniform & ID issued', NULL, NULL, NULL, 1, NULL, '2026-02-28 00:30:00', 2, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(32, 14, 4, 8, 'Department on-the-job training', NULL, NULL, NULL, 1, NULL, '2026-02-28 08:00:00', 2, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(33, 6, 5, 1, 'Signed employment contract', NULL, NULL, NULL, 1, NULL, '2025-09-12 02:00:00', 2, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(34, 6, 5, 2, 'NBI / Police clearance', NULL, NULL, NULL, 1, NULL, '2025-09-12 02:10:00', 2, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(35, 6, 5, 3, 'Pre-employment medical exam', NULL, NULL, NULL, 1, NULL, '2025-09-13 01:00:00', 2, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(36, 6, 5, 4, 'SSS / PhilHealth / Pag-IBIG / TIN', NULL, NULL, NULL, 1, NULL, '2025-09-13 01:30:00', 2, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(37, 6, 5, 5, 'Birth certificate (PSA)', NULL, NULL, NULL, 1, NULL, '2025-09-13 02:00:00', 2, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(38, 6, 5, 6, 'Company orientation attended', NULL, NULL, NULL, 1, NULL, '2025-09-15 00:00:00', 2, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(39, 6, 5, 7, 'Uniform & ID issued', NULL, NULL, NULL, 1, NULL, '2025-09-15 00:30:00', 2, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(40, 6, 5, NULL, 'Regularization evaluation passed', NULL, NULL, NULL, 1, NULL, '2026-03-15 06:00:00', 2, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(41, 15, 6, 9, 'Department orientation completed', NULL, NULL, NULL, 1, NULL, '2026-05-11 00:00:00', 2, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(42, 15, 6, 10, 'Job description acknowledged', NULL, NULL, NULL, 1, NULL, '2026-05-11 00:20:00', 2, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(43, 15, 6, 11, '1st month performance evaluation', NULL, NULL, NULL, 1, NULL, '2026-06-10 01:00:00', 2, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(44, 15, 6, 12, '3rd month performance evaluation', NULL, NULL, NULL, 0, NULL, NULL, NULL, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(45, 15, 6, 13, '5th month performance evaluation', NULL, NULL, NULL, 0, NULL, NULL, NULL, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(46, 15, 6, 14, 'Training hours completed', NULL, NULL, NULL, 0, NULL, NULL, NULL, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(47, 16, 7, 9, 'Department orientation completed', NULL, NULL, NULL, 1, NULL, '2026-02-20 00:00:00', 2, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(48, 16, 7, 10, 'Job description acknowledged', NULL, NULL, NULL, 1, NULL, '2026-02-20 00:20:00', 2, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(49, 16, 7, 11, '1st month performance evaluation', NULL, NULL, NULL, 1, NULL, '2026-03-20 01:00:00', 2, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(50, 16, 7, 12, '3rd month performance evaluation', NULL, NULL, NULL, 1, NULL, '2026-05-20 01:00:00', 2, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(51, 16, 7, 13, '5th month performance evaluation', NULL, NULL, NULL, 0, NULL, NULL, NULL, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(52, 16, 7, 14, 'Training hours completed', NULL, NULL, NULL, 0, NULL, NULL, NULL, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(53, 17, 8, 9, 'Department orientation completed', NULL, NULL, NULL, 1, NULL, '2026-06-01 00:00:00', 2, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(54, 17, 8, 10, 'Job description acknowledged', NULL, NULL, NULL, 0, NULL, NULL, NULL, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(55, 17, 8, 11, '1st month performance evaluation', NULL, NULL, NULL, 0, NULL, NULL, NULL, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(56, 17, 8, 12, '3rd month performance evaluation', NULL, NULL, NULL, 0, NULL, NULL, NULL, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(57, 17, 8, 13, '5th month performance evaluation', NULL, NULL, NULL, 0, NULL, NULL, NULL, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(58, 17, 8, 14, 'Training hours completed', NULL, NULL, NULL, 0, NULL, NULL, NULL, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(59, 18, 9, 15, 'Regularization contract signed', NULL, NULL, NULL, 1, NULL, '2025-05-30 02:00:00', 2, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(60, 18, 9, 16, 'HMO enrollment submitted', NULL, NULL, NULL, 1, NULL, '2025-05-30 02:30:00', 2, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(61, 18, 9, 17, 'Leave credits activated', NULL, NULL, NULL, 1, NULL, '2025-06-02 01:00:00', 2, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(62, 18, 9, 18, 'Performance goals set', NULL, NULL, NULL, 1, NULL, '2025-06-02 01:30:00', 2, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(63, 19, 10, 15, 'Regularization contract signed', NULL, NULL, NULL, 1, NULL, '2025-03-14 02:00:00', 2, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(64, 19, 10, 16, 'HMO enrollment submitted', NULL, NULL, NULL, 1, NULL, '2025-03-14 02:30:00', 2, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(65, 19, 10, 17, 'Leave credits activated', NULL, NULL, NULL, 1, NULL, '2025-03-17 01:00:00', 2, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(66, 19, 10, 18, 'Performance goals set', NULL, NULL, NULL, 1, NULL, '2025-03-17 01:30:00', 2, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(67, 20, 11, 15, 'Regularization contract signed', NULL, NULL, NULL, 1, NULL, '2025-11-07 02:00:00', 2, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(68, 20, 11, 16, 'HMO enrollment submitted', NULL, NULL, NULL, 1, NULL, '2025-11-07 02:30:00', 2, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(69, 20, 11, 17, 'Leave credits activated', NULL, NULL, NULL, 1, NULL, '2025-11-10 01:00:00', 2, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(70, 20, 11, 18, 'Performance goals set', NULL, NULL, NULL, 0, NULL, NULL, NULL, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(71, 21, 12, 15, 'Regularization contract signed', NULL, NULL, NULL, 1, NULL, '2025-01-23 02:00:00', 2, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(72, 21, 12, 16, 'HMO enrollment submitted', NULL, NULL, NULL, 1, NULL, '2025-01-23 02:30:00', 2, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(73, 21, 12, 17, 'Leave credits activated', NULL, NULL, NULL, 1, NULL, '2025-01-27 01:00:00', 2, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(74, 21, 12, 18, 'Performance goals set', NULL, NULL, NULL, 1, NULL, '2025-01-27 01:30:00', 2, '2026-10-02 06:24:35', '2026-10-02 06:24:35');

-- --------------------------------------------------------

--
-- Table structure for table `employee_position_history`
--

CREATE TABLE `employee_position_history` (
  `position_history_id` bigint(20) UNSIGNED NOT NULL,
  `employee_id` bigint(20) UNSIGNED NOT NULL,
  `effective_date` date NOT NULL,
  `change_type` varchar(30) NOT NULL DEFAULT 'Employment',
  `old_position_id` bigint(20) UNSIGNED DEFAULT NULL,
  `new_position_id` bigint(20) UNSIGNED DEFAULT NULL,
  `old_salary_grade_id` bigint(20) UNSIGNED DEFAULT NULL,
  `new_salary_grade_id` bigint(20) UNSIGNED DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `employee_position_history`
--

INSERT INTO `employee_position_history` (`position_history_id`, `employee_id`, `effective_date`, `change_type`, `old_position_id`, `new_position_id`, `old_salary_grade_id`, `new_salary_grade_id`, `notes`, `created_at`) VALUES
(1, 1, '2019-02-11', 'Employment', NULL, 10, NULL, 6, 'Initial hiring as Front Office Manager', '2026-10-02 06:24:35'),
(2, 2, '2018-06-04', 'Employment', NULL, 11, NULL, 7, 'Initial hiring as F&B Director', '2026-10-02 06:24:35'),
(3, 3, '2017-11-20', 'Employment', NULL, 13, NULL, 6, 'Initial hiring as Executive Housekeeper', '2026-10-02 06:24:35'),
(4, 4, '2026-08-04', 'Employment', NULL, 2, NULL, 4, 'Initial hiring as Guest Relations Officer', '2026-10-02 06:24:35'),
(5, 5, '2026-04-15', 'Employment', NULL, 5, NULL, 2, 'Initial hiring as Line Cook', '2026-10-02 06:24:35'),
(6, 6, '2025-09-16', 'Employment', NULL, 3, NULL, 1, 'Initial hiring as Restaurant Server', '2026-10-02 06:24:35'),
(7, 7, '2016-01-18', 'Employment', NULL, 14, NULL, 7, 'Initial hiring as HR & Administration Manager', '2026-10-02 06:24:35'),
(8, 8, '2021-05-03', 'Employment', NULL, 15, NULL, 4, 'Initial hiring as Floor Supervisor', '2026-10-02 06:24:35'),
(9, 9, '2015-03-02', 'Employment', NULL, 9, NULL, 7, 'Initial hiring as General Manager', '2026-10-02 06:24:35'),
(10, 10, '2017-07-10', 'Employment', NULL, 12, NULL, 7, 'Initial hiring as Executive Chef', '2026-10-02 06:24:35'),
(11, 11, '2020-02-03', 'Employment', NULL, 16, NULL, 4, 'Initial hiring as HR Officer', '2026-10-02 06:24:35'),
(12, 12, '2019-08-19', 'Employment', NULL, 17, NULL, 4, 'Initial hiring as Accounting Supervisor', '2026-10-02 06:24:35'),
(13, 13, '2026-08-04', 'Employment', NULL, 1, NULL, 2, 'Initial hiring as Front Desk Receptionist', '2026-10-02 06:24:35'),
(14, 14, '2026-03-01', 'Employment', NULL, 4, NULL, 1, 'Initial hiring as Bartender', '2026-10-02 06:24:35'),
(15, 15, '2026-05-11', 'Employment', NULL, 1, NULL, 2, 'Initial hiring as Front Desk Receptionist', '2026-10-02 06:24:35'),
(16, 16, '2026-02-20', 'Employment', NULL, 7, NULL, 1, 'Initial hiring as Housekeeping Attendant', '2026-10-02 06:24:35'),
(17, 17, '2026-06-01', 'Employment', NULL, 8, NULL, 3, 'Initial hiring as HR Assistant', '2026-10-02 06:24:35'),
(18, 18, '2025-06-02', 'Employment', NULL, 6, NULL, 5, 'Initial hiring as Pastry Chef', '2026-10-02 06:24:35'),
(19, 19, '2025-03-19', 'Employment', NULL, 7, NULL, 1, 'Initial hiring as Housekeeping Attendant', '2026-10-02 06:24:35'),
(20, 20, '2025-11-10', 'Employment', NULL, 2, NULL, 4, 'Initial hiring as Guest Relations Officer', '2026-10-02 06:24:35'),
(21, 21, '2025-01-27', 'Employment', NULL, 8, NULL, 3, 'Initial hiring as HR Assistant', '2026-10-02 06:24:35'),
(22, 22, '2026-05-04', 'Employment', NULL, 1, NULL, 2, 'Initial hiring as Front Desk Receptionist', '2026-10-02 06:24:35'),
(23, 23, '2026-03-06', 'Employment', NULL, 7, NULL, 1, 'Initial hiring as Housekeeping Attendant', '2026-10-02 06:24:35'),
(24, 24, '2021-08-15', 'Employment', NULL, 18, NULL, 1, 'Initial hiring as Security Officer', '2026-10-02 06:24:35'),
(25, 25, '2023-02-10', 'Employment', NULL, 18, NULL, 1, 'Initial hiring as Security Officer', '2026-10-02 06:24:35'),
(26, 26, '2025-09-01', 'Employment', NULL, 18, NULL, 1, 'Initial hiring as Security Officer', '2026-10-02 06:24:35'),
(27, 27, '2019-05-20', 'Employment', NULL, 19, NULL, 4, 'Initial hiring as Security Supervisor', '2026-10-02 06:24:35'),
(28, 28, '2022-06-12', 'Employment', NULL, 20, NULL, 2, 'Initial hiring as Spa Therapist', '2026-10-02 06:24:35'),
(29, 29, '2025-11-01', 'Employment', NULL, 20, NULL, 2, 'Initial hiring as Spa Therapist', '2026-10-02 06:24:35'),
(30, 30, '2026-01-15', 'Employment', NULL, 21, NULL, 1, 'Initial hiring as Wellness / Gym Attendant', '2026-10-02 06:24:35'),
(31, 31, '2021-03-08', 'Employment', NULL, 22, NULL, 3, 'Initial hiring as Accounting Assistant', '2026-10-02 06:24:35'),
(32, 32, '2018-10-01', 'Employment', NULL, 23, NULL, 5, 'Initial hiring as Finance Officer', '2026-10-02 06:24:35'),
(33, 33, '2020-04-17', 'Employment', NULL, 24, NULL, 2, 'Initial hiring as Maintenance Technician', '2026-10-02 06:24:35'),
(34, 34, '2022-09-05', 'Employment', NULL, 24, NULL, 2, 'Initial hiring as Maintenance Technician', '2026-10-02 06:24:35'),
(35, 35, '2026-02-01', 'Employment', NULL, 24, NULL, 2, 'Initial hiring as Maintenance Technician', '2026-10-02 06:24:35'),
(36, 36, '2017-07-25', 'Employment', NULL, 25, NULL, 4, 'Initial hiring as Engineering Supervisor', '2026-10-02 06:24:35'),
(37, 37, '2021-12-10', 'Employment', NULL, 26, NULL, 2, 'Initial hiring as Electrician', '2026-10-02 06:24:35');

-- --------------------------------------------------------

--
-- Table structure for table `ess_categories`
--

CREATE TABLE `ess_categories` (
  `ess_category_id` bigint(20) UNSIGNED NOT NULL,
  `code` varchar(40) NOT NULL,
  `name` varchar(120) NOT NULL,
  `description` text DEFAULT NULL,
  `is_open` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `ess_categories`
--

INSERT INTO `ess_categories` (`ess_category_id`, `code`, `name`, `description`, `is_open`, `sort_order`, `created_at`, `updated_at`) VALUES
(1, 'ESS-LEAVE', 'Leave', 'Vacation, sick, emergency and other leave filings.', 1, 1, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(2, 'ESS-ATT', 'Attendance', 'Time in/out corrections, overtime and shift changes.', 1, 2, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(3, 'ESS-PAY', 'Payroll', 'Payslips, payroll inquiries and salary certificates.', 1, 3, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(4, 'ESS-PAYUPD', 'Payroll Update', 'Bank account, payment method and deduction updates.', 1, 4, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(5, 'ESS-LOAN', 'Loan', 'Company loans, salary loans and cash advances.', 1, 5, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(6, 'ESS-REIMB', 'Reimbursement', 'Transportation, travel and other expense claims.', 1, 6, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(7, 'ESS-HRDOC', 'HR Document', 'Certificates, service records and employment verification.', 1, 7, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(8, 'ESS-PINFO', 'Personal Info', 'Address, contact, civil status and government ID updates.', 1, 8, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(9, 'ESS-ACCT', 'Account', 'Password resets and ESS account access issues.', 1, 9, '2026-10-02 06:24:35', '2026-10-02 06:24:35');

-- --------------------------------------------------------

--
-- Table structure for table `ess_requests`
--

CREATE TABLE `ess_requests` (
  `ess_request_id` bigint(20) UNSIGNED NOT NULL,
  `request_code` varchar(40) NOT NULL,
  `employee_id` bigint(20) UNSIGNED NOT NULL,
  `category_id` bigint(20) UNSIGNED DEFAULT NULL,
  `request_type` varchar(100) NOT NULL,
  `filed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `date_from` date DEFAULT NULL,
  `date_to` date DEFAULT NULL,
  `status` varchar(30) NOT NULL,
  `assigned_to_user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `details` text DEFAULT NULL,
  `review_note` text DEFAULT NULL,
  `returned_count` int(11) NOT NULL DEFAULT 0,
  `attachment_path` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

--
-- Dumping data for table `ess_requests`
--

INSERT INTO `ess_requests` (`ess_request_id`, `request_code`, `employee_id`, `category_id`, `request_type`, `filed_at`, `date_from`, `date_to`, `status`, `assigned_to_user_id`, `details`, `review_note`, `returned_count`, `attachment_path`, `created_at`, `updated_at`) VALUES
(1, 'REQ-4410', 5, 1, 'Sick Leave', '2026-07-25 01:00:00', '2026-07-27', '2026-07-27', 'Pending', 2, '1 day sick leave with medical certificate attached.', NULL, 0, '/uploads/ess/req-4410-medical.pdf', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(2, 'REQ-4409', 6, 7, 'Certificate of Employment', '2026-07-24 02:00:00', NULL, NULL, 'Under Review', 7, 'COE for bank loan application, needs salary details.', NULL, 0, NULL, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(3, 'REQ-4408', 8, 2, 'Attendance Correction', '2026-07-24 03:00:00', NULL, NULL, 'Approved', 2, 'Missing time-out on 2026-07-22, verified with floor logbook.', 'Verified against floor logbook entry.', 0, NULL, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(4, 'REQ-4407', 4, 3, 'Payslip Request', '2026-07-23 06:00:00', NULL, NULL, 'Completed', 8, 'Payslip copies for June 2026 cut-offs.', 'Copies released via HR portal.', 0, NULL, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(5, 'REQ-4406', 5, 6, 'Transportation', '2026-07-21 01:00:00', NULL, NULL, 'Rejected', 8, 'Missing official receipt for claimed amount.', 'Official receipt not provided.', 1, NULL, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(6, 'REQ-4405', 1, 5, 'Company Loan', '2026-07-20 05:00:00', NULL, NULL, 'Under Review', 8, 'PHP 50,000 company loan payable in 12 months.', NULL, 0, '/uploads/ess/req-4405-loan-agreement.pdf', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(7, 'REQ-4404', 8, 8, 'Contact Number Update', '2026-07-19 01:00:00', NULL, NULL, 'Completed', 7, 'Updated mobile number and emergency contact.', 'Record updated in 201 file.', 0, NULL, '2026-10-02 06:24:35', '2026-10-02 06:24:35');

-- --------------------------------------------------------

--
-- Table structure for table `facilities`
--

CREATE TABLE `facilities` (
  `facility_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(120) NOT NULL,
  `type` varchar(20) NOT NULL,
  `location` varchar(190) DEFAULT NULL,
  `capacity` int(10) UNSIGNED NOT NULL DEFAULT 1,
  `icon` varchar(60) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

--
-- Dumping data for table `facilities`
--

INSERT INTO `facilities` (`facility_id`, `name`, `type`, `location`, `capacity`, `icon`, `description`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Room 1', 'On-site', 'Oxford Suites Makati, HR Office, 3rd Floor', 1, 'room', 'Primary on-site interview room with guest-facing setup.', 1, '2026-10-02 06:12:34', '2026-10-02 06:12:34'),
(2, 'Room 2', 'On-site', 'Oxford Suites Makati, HR Office, 3rd Floor', 1, 'room', 'Secondary on-site interview room for panel interviews.', 1, '2026-10-02 06:12:34', '2026-10-02 06:12:34'),
(3, 'Room 3', 'On-site', 'Oxford Suites Makati, HR Office, 3rd Floor', 2, 'room', 'Practical demonstration room for hands-on assessments.', 1, '2026-10-02 06:12:34', '2026-10-02 06:12:34'),
(4, 'Online Interview', 'Virtual', 'meet.oxfordsuites.ph/interview-room', 5, 'online', 'Virtual interview room hosted on the company meeting platform.', 1, '2026-10-02 06:12:34', '2026-10-02 06:12:34');

-- --------------------------------------------------------

--
-- Table structure for table `final_evaluations`
--

CREATE TABLE `final_evaluations` (
  `final_evaluation_id` bigint(20) UNSIGNED NOT NULL,
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
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

-- --------------------------------------------------------

--
-- Table structure for table `hr3_recommendations`
--

CREATE TABLE `hr3_recommendations` (
  `recommendation_id` bigint(20) UNSIGNED NOT NULL,
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
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

--
-- Dumping data for table `hr3_recommendations`
--

INSERT INTO `hr3_recommendations` (`recommendation_id`, `employee_id`, `promotion_request_id`, `recommendation_type`, `evaluation_score`, `evaluator_user_id`, `date_submitted`, `status`, `suggested_position_id`, `suggested_salary_grade_id`, `current_employment_type`, `comments`, `created_at`, `updated_at`) VALUES
(1, 4, NULL, 'Regularization', 94.80, 3, '2026-08-01', 'Pending HR Action', 2, 4, 'Probationary', 'Exceeded guest satisfaction metrics during 6-month evaluation window. Highly recommended for full regularization.', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(2, 5, NULL, 'Regularization', 91.20, NULL, '2026-07-28', 'Pending HR Action', 5, 2, 'Probationary', 'Punctual, excellent culinary prep speed and kitchen hygiene compliance. Recommended for regularization.', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(3, 6, NULL, 'Promotion', 96.50, NULL, '2026-08-03', 'Pending HR Action', NULL, 4, 'Regular', 'Demonstrated strong leadership during banquet events. Passed succession planning assessment with distinction.', '2026-10-02 06:24:35', '2026-10-02 06:24:35');

-- --------------------------------------------------------

--
-- Table structure for table `interviews`
--

CREATE TABLE `interviews` (
  `interview_id` bigint(20) UNSIGNED NOT NULL,
  `interview_code` varchar(40) NOT NULL,
  `applicant_id` bigint(20) UNSIGNED NOT NULL,
  `scheduled_date` date NOT NULL,
  `scheduled_time` time NOT NULL,
  `mode` varchar(20) NOT NULL,
  `facility_id` bigint(20) UNSIGNED DEFAULT NULL,
  `facility_status` varchar(40) DEFAULT 'Not Required',
  `interviewer_employee_id` bigint(20) UNSIGNED DEFAULT NULL,
  `interviewer_name` varchar(160) DEFAULT NULL,
  `status` varchar(20) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

--
-- Dumping data for table `interviews`
--

INSERT INTO `interviews` (`interview_id`, `interview_code`, `applicant_id`, `scheduled_date`, `scheduled_time`, `mode`, `facility_id`, `facility_status`, `interviewer_employee_id`, `interviewer_name`, `status`, `created_at`, `updated_at`) VALUES
(1, 'INT-201', 10, '2026-07-28', '09:00:00', 'On-site', NULL, 'Not Required', 1, 'Ana Ramos', 'Scheduled', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(2, 'INT-202', 2, '2026-07-28', '13:30:00', 'Virtual', NULL, 'Not Required', 7, 'Juan Dela Cruz', 'Scheduled', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(3, 'INT-203', 4, '2026-07-29', '16:00:00', 'On-site', NULL, 'Not Required', 2, 'Chef Gabriel Mendoza', 'Scheduled', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(4, 'INT-204', 5, '2026-07-30', '10:00:00', 'On-site', NULL, 'Not Required', 2, 'Chef Gabriel Mendoza', 'Completed', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(5, 'INT-205', 9, '2026-07-31', '14:00:00', 'On-site', NULL, 'Not Required', 1, 'Ana Ramos', 'Scheduled', '2026-10-02 06:24:35', '2026-10-02 06:24:35');

-- --------------------------------------------------------

--
-- Table structure for table `job_posts`
--

CREATE TABLE `job_posts` (
  `job_post_id` bigint(20) UNSIGNED NOT NULL,
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
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `experience_level` varchar(50) DEFAULT NULL,
  `education_level` varchar(100) DEFAULT NULL,
  `summary` text DEFAULT NULL,
  `description` text DEFAULT NULL,
  `responsibilities_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`responsibilities_json`)),
  `qualifications_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`qualifications_json`)),
  `skills_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`skills_json`)),
  `picture` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

--
-- Dumping data for table `job_posts`
--

INSERT INTO `job_posts` (`job_post_id`, `slug`, `title`, `department_id`, `position_id`, `employment_type`, `schedule`, `salary_min`, `salary_max`, `vacancies`, `filled_count`, `posted_date`, `status`, `requires_practical`, `active`, `experience_level`, `education_level`, `summary`, `description`, `responsibilities_json`, `qualifications_json`, `skills_json`, `picture`, `created_at`, `updated_at`) VALUES
(1, 'front-desk-receptionist', 'Front Desk Receptionist', 1, 1, 'Full-time', 'Shifting Schedule', 18000.00, 22000.00, 3, 1, '2026-05-22', 'Open', 0, 1, '1-2 Years', 'Bachelor\'s Degree', 'Welcome guests, manage reservations, answer inquiries, and provide excellent customer service.', 'We are looking for a friendly and professional Front Desk Receptionist to welcome guests, manage reservations, answer inquiries, and provide excellent customer service. The ideal candidate should have strong communication skills and be able to work in a fast-paced environment.', '[\"Welcome and assist hotel guests.\",\"Process check-in and check-out procedures.\",\"Manage room reservations.\",\"Handle guest inquiries and complaints professionally.\",\"Coordinate with housekeeping and other departments.\",\"Answer phone calls and emails.\"]', '[\"Bachelor\'s degree or College level in Hospitality Management or related field.\",\"Excellent communication and interpersonal skills.\",\"Basic computer skills.\",\"Customer service experience is an advantage.\",\"Willing to work shifts, weekends, and holidays.\"]', '[\"Customer Service\",\"Communication\",\"Hotel Operations\",\"Problem Solving\",\"Time Management\"]', NULL, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(2, 'line-cook', 'Line Cook', 3, 5, 'Full-time', 'Shifting Schedule', 16000.00, 20000.00, 4, 2, '2026-05-18', 'Open', 0, 1, '1-2 Years', 'Vocational / TESDA', 'Prepare and cook menu items to standard, maintain station cleanliness and food safety compliance.', 'The Line Cook prepares and plates dishes according to Oxford Suites Makati recipes and standards, maintains a clean and organized station, and observes HACCP food-safety practices at all times.', '[\"Prepare mise en place before each service.\",\"Cook and plate dishes to recipe standards.\",\"Maintain sanitation and food-safety compliance.\",\"Monitor inventory levels of station ingredients.\",\"Support banquet and room-service volume peaks.\"]', '[\"TESDA NC II in Cookery or equivalent culinary training.\",\"At least 1 year in a hotel or full-service restaurant kitchen.\",\"Valid food handler\'s certificate.\",\"Able to work under pressure during peak service.\"]', '[\"Food Safety\",\"HACCP\",\"Knife Skills\",\"Plating\",\"Teamwork\"]', NULL, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(3, 'housekeeping-attendant', 'Housekeeping Attendant', 4, 7, 'Full-time', 'Shifting Schedule', 14000.00, 17000.00, 5, 3, '2026-05-10', 'Open', 0, 1, 'No Experience', 'High School Graduate', 'Maintain guestroom cleanliness, linen turnover, and public-area presentation to brand standards.', 'Housekeeping Attendants keep guestrooms and public areas immaculate, restock amenities, and report maintenance issues. Full training is provided for applicants with no prior hotel experience.', '[\"Clean and prepare assigned guestrooms daily.\",\"Replenish linens, towels, and amenities.\",\"Report maintenance and lost-and-found items.\",\"Maintain housekeeping cart and supplies.\"]', '[\"High School Graduate.\",\"Physically fit and detail-oriented.\",\"Willing to work shifts including weekends and holidays.\"]', '[\"Attention to Detail\",\"Time Management\",\"Room Turnover\",\"Safety\"]', NULL, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(4, 'restaurant-server', 'Restaurant Server', 2, 3, 'Full-time', 'Shifting Schedule', 15000.00, 18000.00, 4, 1, '2026-05-20', 'Open', 0, 1, 'No Experience', 'High School Graduate', 'Deliver warm, accurate table service across the dining room and banquet operations.', 'Restaurant Servers take orders, serve food and beverages, and ensure every guest leaves with a memorable dining experience at our all-day dining outlet.', '[\"Greet and seat guests warmly.\",\"Take and relay orders accurately to the kitchen.\",\"Serve food and beverages following service sequence.\",\"Handle billing and guest feedback.\"]', '[\"High School Graduate; hospitality training an advantage.\",\"Good communication skills in English and Filipino.\",\"Pleasant personality and grooming.\"]', '[\"Guest Service\",\"Upselling\",\"POS Systems\",\"Communication\"]', NULL, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(5, 'bartender', 'Bartender', 2, 4, 'Part-time', 'Night Shift', 16000.00, 19000.00, 2, 0, '2026-05-15', 'Open', 0, 1, '3-5 Years', 'Vocational / TESDA', 'Craft classic and signature cocktails for the lobby lounge and rooftop bar.', 'The Bartender prepares beverages to recipe, manages bar inventory, and creates a lively yet refined guest experience at the lounge.', '[\"Prepare cocktails and beverages to standard.\",\"Maintain bar cleanliness and inventory.\",\"Engage guests and recommend pairings.\",\"Observe responsible alcohol service.\"]', '[\"TESDA Bartending NC II or equivalent.\",\"At least 3 years bar experience in hotels or restaurants.\",\"Knowledge of classic and modern mixology.\"]', '[\"Mixology\",\"Inventory Control\",\"Guest Engagement\",\"Cash Handling\"]', NULL, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(6, 'hr-assistant', 'HR Assistant', 5, 8, 'Full-time', 'Day Shift', 20000.00, 25000.00, 1, 0, '2026-05-08', 'Open', 0, 0, '1-2 Years', 'Bachelor\'s Degree', 'Support recruitment, employee records, and HR document processing.', 'The HR Assistant supports end-to-end recruitment coordination, 201-file maintenance, and employee request processing for the property.', '[\"Coordinate interview schedules with department heads.\",\"Maintain complete and accurate 201 files.\",\"Process COE and employment verification requests.\",\"Assist in new-hire onboarding documentation.\"]', '[\"Bachelor\'s degree in Psychology, HR, or related field.\",\"At least 1 year HR experience.\",\"Strong organizational and documentation skills.\"]', '[\"Recruitment\",\"Documentation\",\"MS Office\",\"Confidentiality\"]', NULL, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(7, 'security-officer', 'Security Officer', 6, 18, 'Full-time', 'Shifting Schedule', 16000.00, 19000.00, 2, 0, '2026-05-25', 'Open', 0, 1, '1-2 Years', 'High School Graduate', 'Guard guest floors, lobby posts, and CCTV monitoring on rotating shifts.', 'Security Officers keep guests, staff, and property safe through roving patrols, access control, and incident reporting across the hotel premises.', '[\"Conduct roving patrols of guest floors and back-of-house.\",\"Enforce access control at lobby and service entrances.\",\"Respond to incidents and prepare blotter reports.\",\"Coordinate with Engineering on safety hazards.\"]', '[\"High School Graduate; security license (SOSIA) required.\",\"At least 1 year hotel or commercial security experience.\",\"Physically fit and willing to work shifting schedules.\"]', '[\"Access Control\",\"Patrol\",\"Incident Reporting\",\"CCTV\"]', NULL, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(8, 'spa-therapist', 'Spa Therapist', 7, 20, 'Full-time', 'Shifting Schedule', 18000.00, 23000.00, 2, 0, '2026-05-26', 'Open', 0, 1, '1-2 Years', 'Vocational / TESDA', 'Deliver signature massages and wellness treatments to hotel and walk-in guests.', 'Spa Therapists perform Filipino hilot, Swedish, and aromatherapy treatments while upselling wellness packages at the Oxford Suites spa.', '[\"Perform massage and body treatments to standard protocols.\",\"Prepare treatment rooms and sterilize tools.\",\"Recommend wellness packages to guests.\",\"Maintain guest treatment records.\"]', '[\"TESDA NC II in Massage Therapy or equivalent.\",\"At least 1 year spa experience; hotel spa an advantage.\",\"Warm guest-handling skills.\"]', '[\"Hilot\",\"Swedish Massage\",\"Guest Care\",\"Upselling\"]', NULL, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(9, 'accounting-assistant', 'Accounting Assistant', 8, 22, 'Full-time', 'Day Shift', 19000.00, 24000.00, 1, 0, '2026-05-27', 'Open', 0, 1, '1-2 Years', 'Bachelor\'s Degree', 'Handle payables, receivables encoding, and month-end supporting schedules.', 'The Accounting Assistant supports the Finance Officer with AP/AR encoding, receipt audits from Front Office and F&B outlets, and BIR-ready documentation.', '[\"Encode supplier invoices and outlet remittances.\",\"Reconcile daily revenue reports from Front Office and F&B.\",\"Prepare BIR supporting schedules.\",\"Assist in month-end close.\"]', '[\"Bachelor\'s degree in Accountancy or related field.\",\"At least 1 year accounting experience.\",\"Proficient in MS Excel.\"]', '[\"Bookkeeping\",\"Reconciliation\",\"MS Excel\",\"Attention to Detail\"]', NULL, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(10, 'maintenance-technician', 'Maintenance Technician', 9, 24, 'Full-time', 'Shifting Schedule', 17000.00, 21000.00, 2, 0, '2026-05-28', 'Open', 0, 1, '1-2 Years', 'Vocational / TESDA', 'Perform preventive maintenance on guestrooms, kitchen equipment, and facilities.', 'Maintenance Technicians respond to housekeeping and front-office work orders, repair plumbing, HVAC, and electrical faults across the property.', '[\"Respond to guestroom and public-area work orders.\",\"Perform preventive maintenance on HVAC and kitchen equipment.\",\"Troubleshoot minor plumbing and electrical faults.\",\"Log completed work in the facilities tracker.\"]', '[\"TESDA NC II in Electrical, Refrigeration, or equivalent.\",\"At least 1 year hotel or building maintenance experience.\",\"Willing to be on-call for emergencies.\"]', '[\"HVAC\",\"Plumbing\",\"Electrical\",\"Preventive Maintenance\"]', NULL, '2026-10-02 06:24:35', '2026-10-02 06:24:35');

-- --------------------------------------------------------

--
-- Table structure for table `job_post_platforms`
--

CREATE TABLE `job_post_platforms` (
  `job_post_platform_id` bigint(20) UNSIGNED NOT NULL,
  `job_post_id` bigint(20) UNSIGNED NOT NULL,
  `platform` varchar(60) NOT NULL,
  `published_at` timestamp NULL DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'published',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ;

--
-- Dumping data for table `job_post_platforms`
--

INSERT INTO `job_post_platforms` (`job_post_platform_id`, `job_post_id`, `platform`, `published_at`, `status`, `created_at`) VALUES
(1, 1, 'Company Website', '2026-05-22 00:00:00', 'published', '2026-10-02 06:24:35'),
(2, 1, 'Facebook', '2026-05-22 00:15:00', 'published', '2026-10-02 06:24:35'),
(3, 1, 'Indeed', '2026-05-22 01:00:00', 'published', '2026-10-02 06:24:35'),
(4, 2, 'Company Website', '2026-05-18 00:00:00', 'published', '2026-10-02 06:24:35'),
(5, 2, 'Indeed', '2026-05-18 01:30:00', 'published', '2026-10-02 06:24:35'),
(6, 3, 'Company Website', '2026-05-10 00:00:00', 'published', '2026-10-02 06:24:35'),
(7, 3, 'Facebook', '2026-05-10 00:20:00', 'published', '2026-10-02 06:24:35'),
(8, 4, 'Company Website', '2026-05-20 00:00:00', 'published', '2026-10-02 06:24:35'),
(9, 4, 'Facebook', '2026-05-20 00:30:00', 'published', '2026-10-02 06:24:35'),
(10, 4, 'Instagram', '2026-05-20 01:00:00', 'published', '2026-10-02 06:24:35'),
(11, 5, 'Company Website', '2026-05-15 00:00:00', 'published', '2026-10-02 06:24:35'),
(12, 5, 'Instagram', '2026-05-15 00:45:00', 'published', '2026-10-02 06:24:35'),
(13, 6, 'Company Website', '2026-05-08 00:00:00', 'published', '2026-10-02 06:24:35'),
(14, 6, 'Indeed', '2026-05-08 01:15:00', 'published', '2026-10-02 06:24:35'),
(15, 7, 'Company Website', '2026-05-25 00:00:00', 'published', '2026-10-02 06:24:35'),
(16, 7, 'Facebook', '2026-05-25 00:20:00', 'published', '2026-10-02 06:24:35'),
(17, 8, 'Company Website', '2026-05-26 00:00:00', 'published', '2026-10-02 06:24:35'),
(18, 8, 'Facebook', '2026-05-26 00:30:00', 'published', '2026-10-02 06:24:35'),
(19, 9, 'Company Website', '2026-05-27 00:00:00', 'published', '2026-10-02 06:24:35'),
(20, 9, 'Indeed', '2026-05-27 01:00:00', 'published', '2026-10-02 06:24:35'),
(21, 10, 'Company Website', '2026-05-28 00:00:00', 'published', '2026-10-02 06:24:35'),
(22, 10, 'Indeed', '2026-05-28 01:15:00', 'published', '2026-10-02 06:24:35');

-- --------------------------------------------------------

--
-- Table structure for table `learning_courses`
--

CREATE TABLE `learning_courses` (
  `course_id` bigint(20) UNSIGNED NOT NULL,
  `course_code` varchar(40) NOT NULL,
  `title` varchar(200) NOT NULL,
  `category` varchar(120) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `learning_courses`
--

INSERT INTO `learning_courses` (`course_id`, `course_code`, `title`, `category`, `description`, `created_at`, `updated_at`) VALUES
(1, 'LMS-101', 'Food Safety & Sanitation Level 2', 'Culinary & Safety', 'HACCP-based food safety and sanitation practices for kitchen staff.', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(2, 'LMS-102', 'Customer Excellence in Hospitality', 'Service Quality', 'Service standards and guest-excellence behaviors across guest-facing roles.', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(3, 'LMS-103', 'Fire Safety & Emergency Response', 'Compliance', 'Fire prevention, evacuation procedures, and emergency response drills.', '2026-10-02 06:24:35', '2026-10-02 06:24:35');

-- --------------------------------------------------------

--
-- Table structure for table `leave_balances`
--

CREATE TABLE `leave_balances` (
  `leave_balance_id` bigint(20) UNSIGNED NOT NULL,
  `employee_id` bigint(20) UNSIGNED NOT NULL,
  `leave_type` varchar(80) NOT NULL,
  `period_year` smallint(6) NOT NULL,
  `total_days` decimal(6,2) NOT NULL DEFAULT 0.00,
  `used_days` decimal(6,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `leave_balances`
--

INSERT INTO `leave_balances` (`leave_balance_id`, `employee_id`, `leave_type`, `period_year`, `total_days`, `used_days`, `created_at`, `updated_at`) VALUES
(1, 5, 'Vacation Leave', 2026, 15.00, 4.00, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(2, 5, 'Sick Leave', 2026, 15.00, 3.00, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(3, 5, 'Emergency Leave', 2026, 5.00, 1.00, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(4, 5, 'Solo Parent Leave', 2026, 7.00, 0.00, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(5, 1, 'Vacation Leave', 2026, 15.00, 8.00, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(6, 1, 'Sick Leave', 2026, 15.00, 5.00, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(7, 1, 'Emergency Leave', 2026, 5.00, 2.00, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(8, 6, 'Vacation Leave', 2026, 15.00, 6.00, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(9, 6, 'Sick Leave', 2026, 15.00, 2.00, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(10, 8, 'Vacation Leave', 2026, 15.00, 9.00, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(11, 8, 'Sick Leave', 2026, 15.00, 4.00, '2026-10-02 06:24:35', '2026-10-02 06:24:35');

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
(80, '2026_09_18_000001_add_hr3_loop_to_promotion_requests_table-DESKTOP-T31RHI0', 1),
(81, '2026_09_19_000001_add_mfa_to_system_users_table', 1),
(82, '2026_09_19_000002_add_lockout_to_system_users_table', 1),
(83, '2026_09_23_000001_add_document_verification_to_applicant_screenings_table', 1),
(84, '2026_09_26_000001_create_screening_requirement_templates_table', 1),
(85, '2026_10_03_000001_create_assessment_invites_table', 2),
(86, '2026_10_08_000001_add_overall_score_to_final_evaluations_table', 3),
(87, '2026_10_09_000001_add_shares_count_to_social_recognitions_table', 3);

-- --------------------------------------------------------

--
-- Table structure for table `new_hires`
--

CREATE TABLE `new_hires` (
  `new_hire_id` bigint(20) UNSIGNED NOT NULL,
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
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

--
-- Dumping data for table `new_hires`
--

INSERT INTO `new_hires` (`new_hire_id`, `new_hire_code`, `applicant_id`, `employee_id`, `name`, `email`, `phone`, `position_id`, `department_id`, `stage`, `start_date`, `evaluation_requested_at`, `created_at`, `updated_at`) VALUES
(1, 'NH-01', 1, 4, 'Camille Ortega', 'camille.ortega@email.com', '0917 664 2219', 2, 1, 'Pre-onboarding', '2026-08-04', NULL, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(2, 'NH-02', 10, 13, 'Bianca Soriano', 'bianca.soriano@email.com', '0912 345 6789', 1, 1, 'Pre-onboarding', '2026-08-04', NULL, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(3, 'NH-03', 5, 5, 'Kevin Dela Cruz', 'kevin.delacruz@email.com', '0921 774 9903', 5, 3, 'Probationary', '2026-04-15', NULL, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(4, 'NH-04', 4, 14, 'Jompaks Berdugo', 'jompaks.berdugo@email.com', '0933 552 1180', 4, 2, 'Probationary', '2026-03-01', NULL, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(5, 'NH-05', 9, 6, 'Marjun Devera', 'marjun.devera@email.com', '0917 664 2219', 3, 2, 'Regular', '2025-09-16', NULL, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(6, 'NH-06', NULL, 15, 'Angelo Torres', 'angelo.torres@email.com', '0917 220 5541', 1, 1, 'Probationary', '2026-05-11', NULL, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(7, 'NH-07', NULL, 16, 'Ligaya Santos', 'ligaya.santos@email.com', '0918 663 2201', 7, 4, 'Probationary', '2026-02-20', NULL, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(8, 'NH-08', NULL, 17, 'Michael Reyes', 'michael.reyes@email.com', '0920 441 8873', 8, 5, 'Probationary', '2026-06-01', NULL, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(9, 'NH-09', NULL, 18, 'Patricia Gomez', 'patricia.gomez@email.com', '0917 903 2245', 6, 3, 'Regular', '2025-06-02', NULL, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(10, 'NH-10', NULL, 19, 'Ernesto Villar', 'ernesto.villar@email.com', '0921 556 7743', 7, 4, 'Regular', '2025-03-19', NULL, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(11, 'NH-11', NULL, 20, 'Grace Panganiban', 'grace.panganiban@email.com', '0917 332 8890', 2, 1, 'Regular', '2025-11-10', NULL, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(12, 'NH-12', NULL, 21, 'Noel Fajardo', 'noel.fajardo@email.com', '0918 774 3320', 8, 5, 'Regular', '2025-01-27', NULL, '2026-10-02 06:24:35', '2026-10-02 06:24:35');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `notification_id` bigint(20) UNSIGNED NOT NULL,
  `system_user_id` bigint(20) UNSIGNED NOT NULL,
  `type` varchar(50) NOT NULL,
  `title` varchar(200) NOT NULL,
  `body` text DEFAULT NULL,
  `module_name` varchar(100) DEFAULT NULL,
  `target_type` varchar(100) DEFAULT NULL,
  `target_id` varchar(100) DEFAULT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`notification_id`, `system_user_id`, `type`, `title`, `body`, `module_name`, `target_type`, `target_id`, `is_read`, `read_at`, `created_at`) VALUES
(1, 2, 'ess_request', 'New ESS request pending', 'Sick leave request REQ-4410 filed by Kevin Dela Cruz awaits review.', 'ESS Management', 'ess_request', 'REQ-4410', 0, NULL, '2026-10-02 06:24:35'),
(2, 2, 'hr3', 'HR3 recommendation pending', 'Regularization recommendation for Camille Ortega is pending HR action.', 'Core HCM', 'hr3_recommendation', 'HR3-REC-01', 0, NULL, '2026-10-02 06:24:35'),
(3, 2, 'checklist', 'Checklist request raised', 'Miguel Torres probationary checklist requested (CR-001).', 'New Hire Onboarding', 'checklist_request', 'CR-001', 0, NULL, '2026-10-02 06:24:35'),
(4, 2, 'checklist', 'Checklist request raised', 'Andrea Lim probationary checklist requested (CR-002).', 'New Hire Onboarding', 'checklist_request', 'CR-002', 0, NULL, '2026-10-02 06:24:35'),
(5, 3, 'ess_request', 'Interview reminder', 'Interview with Bianca Soriano scheduled for 2026-07-28, 09:00 AM.', 'Applicant Management', 'interview', 'INT-201', 0, NULL, '2026-10-02 06:24:35'),
(6, 3, 'hr3', 'HR3 recommendation submitted', 'Regularization recommendation for Camille Ortega submitted for review.', 'Core HCM', 'hr3_recommendation', 'HR3-REC-01', 1, '2026-08-02 01:00:00', '2026-10-02 06:24:35'),
(7, 1, 'audit', 'Critical audit event', 'Permission matrix was modified for role Admin.', 'User Management', 'audit_log', 'LOG-9001', 0, NULL, '2026-10-02 06:24:35'),
(8, 7, 'ess_request', 'COE request assigned', 'Certificate of Employment request REQ-4409 assigned to you.', 'ESS Management', 'ess_request', 'REQ-4409', 0, NULL, '2026-10-02 06:24:35'),
(9, 8, 'ess_request', 'Loan application under review', 'Company loan application REQ-4405 assigned to you.', 'ESS Management', 'ess_request', 'REQ-4405', 0, NULL, '2026-10-02 06:24:35'),
(10, 4, 'warning', 'New sign-in to your account', 'We noticed a login to your account from a new IP address (127.0.0.1). If this wasn’t you, reset your password.', 'Authentication', 'user', '4', 0, NULL, '2026-10-01 22:32:32'),
(11, 1, 'warning', 'New sign-in to your account', 'We noticed a login to your account from a new IP address (127.0.0.1). If this wasn’t you, reset your password.', 'Authentication', 'user', '1', 0, NULL, '2026-10-01 23:27:05'),
(12, 3, 'warning', 'New sign-in to your account', 'We noticed a login to your account from a new IP address (127.0.0.1). If this wasn’t you, reset your password.', 'Authentication', 'user', '3', 0, NULL, '2026-10-09 10:10:29');

-- --------------------------------------------------------

--
-- Table structure for table `onboarding_checklist_items`
--

CREATE TABLE `onboarding_checklist_items` (
  `template_item_id` bigint(20) UNSIGNED NOT NULL,
  `template_id` bigint(20) UNSIGNED NOT NULL,
  `item_text` text NOT NULL,
  `instructions` text DEFAULT NULL,
  `requires_upload` tinyint(1) NOT NULL DEFAULT 0,
  `upload_placeholder` varchar(255) DEFAULT NULL,
  `sort_order` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `onboarding_checklist_items`
--

INSERT INTO `onboarding_checklist_items` (`template_item_id`, `template_id`, `item_text`, `instructions`, `requires_upload`, `upload_placeholder`, `sort_order`, `created_at`) VALUES
(1, 1, 'Signed employment contract', NULL, 0, NULL, 1, '2026-10-02 06:24:35'),
(2, 1, 'NBI / Police clearance', NULL, 0, NULL, 2, '2026-10-02 06:24:35'),
(3, 1, 'Pre-employment medical exam', NULL, 0, NULL, 3, '2026-10-02 06:24:35'),
(4, 1, 'SSS / PhilHealth / Pag-IBIG / TIN', NULL, 0, NULL, 4, '2026-10-02 06:24:35'),
(5, 1, 'Birth certificate (PSA)', NULL, 0, NULL, 5, '2026-10-02 06:24:35'),
(6, 1, 'Company orientation attended', NULL, 0, NULL, 6, '2026-10-02 06:24:35'),
(7, 1, 'Uniform & ID issued', NULL, 0, NULL, 7, '2026-10-02 06:24:35'),
(8, 1, 'Department on-the-job training', NULL, 0, NULL, 8, '2026-10-02 06:24:35'),
(9, 2, 'Department orientation completed', NULL, 0, NULL, 1, '2026-10-02 06:24:35'),
(10, 2, 'Job description acknowledged', NULL, 0, NULL, 2, '2026-10-02 06:24:35'),
(11, 2, '1st month performance evaluation', NULL, 0, NULL, 3, '2026-10-02 06:24:35'),
(12, 2, '3rd month performance evaluation', NULL, 0, NULL, 4, '2026-10-02 06:24:35'),
(13, 2, '5th month performance evaluation', NULL, 0, NULL, 5, '2026-10-02 06:24:35'),
(14, 2, 'Training hours completed', NULL, 0, NULL, 6, '2026-10-02 06:24:35'),
(15, 3, 'Regularization contract signed', NULL, 0, NULL, 1, '2026-10-02 06:24:35'),
(16, 3, 'HMO enrollment submitted', NULL, 0, NULL, 2, '2026-10-02 06:24:35'),
(17, 3, 'Leave credits activated', NULL, 0, NULL, 3, '2026-10-02 06:24:35'),
(18, 3, 'Performance goals set', NULL, 0, NULL, 4, '2026-10-02 06:24:35');

-- --------------------------------------------------------

--
-- Table structure for table `onboarding_checklist_templates`
--

CREATE TABLE `onboarding_checklist_templates` (
  `template_id` bigint(20) UNSIGNED NOT NULL,
  `template_code` varchar(40) NOT NULL,
  `title` varchar(200) NOT NULL,
  `phase` varchar(30) NOT NULL,
  `position_scope_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`position_scope_json`)),
  `status` varchar(20) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

--
-- Dumping data for table `onboarding_checklist_templates`
--

INSERT INTO `onboarding_checklist_templates` (`template_id`, `template_code`, `title`, `phase`, `position_scope_json`, `status`, `created_at`, `updated_at`) VALUES
(1, 'TPL-001', 'Pre-Employment Requirements', 'Pre-onboarding', '[\"all\"]', 'Active', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(2, 'TPL-002', 'Standard Probationary Checklist', 'Probationary', '[\"all\"]', 'Active', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(3, 'TPL-003', 'Regularization Checklist', 'Regular', '[\"all\"]', 'Active', '2026-10-02 06:24:35', '2026-10-02 06:24:35');

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payroll_items`
--

CREATE TABLE `payroll_items` (
  `payroll_item_id` bigint(20) UNSIGNED NOT NULL,
  `payroll_record_id` bigint(20) UNSIGNED NOT NULL,
  `item_type` varchar(30) NOT NULL,
  `label` varchar(120) NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ;

--
-- Dumping data for table `payroll_items`
--

INSERT INTO `payroll_items` (`payroll_item_id`, `payroll_record_id`, `item_type`, `label`, `amount`, `created_at`) VALUES
(1, 1, 'Earning', 'Basic Pay', 8000.00, '2026-10-02 06:24:35'),
(2, 1, 'Earning', 'Overtime Pay', 950.00, '2026-10-02 06:24:35'),
(3, 1, 'Earning', 'Night Differential', 400.00, '2026-10-02 06:24:35'),
(4, 1, 'Earning', 'Meal Allowance', 750.00, '2026-10-02 06:24:35'),
(5, 1, 'Earning', 'Service Charge', 500.00, '2026-10-02 06:24:35'),
(6, 1, 'Deduction', 'SSS', 450.00, '2026-10-02 06:24:35'),
(7, 1, 'Deduction', 'PhilHealth', 275.00, '2026-10-02 06:24:35'),
(8, 1, 'Deduction', 'Pag-IBIG', 100.00, '2026-10-02 06:24:35'),
(9, 1, 'Deduction', 'Withholding Tax', 575.00, '2026-10-02 06:24:35'),
(10, 1, 'Deduction', 'Company Loan', 225.00, '2026-10-02 06:24:35'),
(11, 2, 'Earning', 'Basic Pay', 8000.00, '2026-10-02 06:24:35'),
(12, 2, 'Earning', 'Overtime Pay', 1000.00, '2026-10-02 06:24:35'),
(13, 2, 'Earning', 'Night Differential', 400.00, '2026-10-02 06:24:35'),
(14, 2, 'Earning', 'Meal Allowance', 750.00, '2026-10-02 06:24:35'),
(15, 2, 'Earning', 'Service Charge', 500.00, '2026-10-02 06:24:35'),
(16, 2, 'Deduction', 'SSS', 450.00, '2026-10-02 06:24:35'),
(17, 2, 'Deduction', 'PhilHealth', 275.00, '2026-10-02 06:24:35'),
(18, 2, 'Deduction', 'Pag-IBIG', 100.00, '2026-10-02 06:24:35'),
(19, 2, 'Deduction', 'Withholding Tax', 560.00, '2026-10-02 06:24:35'),
(20, 2, 'Deduction', 'Company Loan', 225.00, '2026-10-02 06:24:35'),
(21, 3, 'Earning', 'Basic Pay', 8000.00, '2026-10-02 06:24:35'),
(22, 3, 'Earning', 'Overtime Pay', 1050.00, '2026-10-02 06:24:35'),
(23, 3, 'Earning', 'Night Differential', 450.00, '2026-10-02 06:24:35'),
(24, 3, 'Earning', 'Meal Allowance', 750.00, '2026-10-02 06:24:35'),
(25, 3, 'Earning', 'Service Charge', 500.00, '2026-10-02 06:24:35'),
(26, 3, 'Deduction', 'SSS', 450.00, '2026-10-02 06:24:35'),
(27, 3, 'Deduction', 'PhilHealth', 275.00, '2026-10-02 06:24:35'),
(28, 3, 'Deduction', 'Pag-IBIG', 100.00, '2026-10-02 06:24:35'),
(29, 3, 'Deduction', 'Withholding Tax', 580.00, '2026-10-02 06:24:35'),
(30, 3, 'Deduction', 'Company Loan', 225.00, '2026-10-02 06:24:35'),
(31, 4, 'Earning', 'Basic Pay', 16000.00, '2026-10-02 06:24:35'),
(32, 4, 'Earning', 'Overtime Pay', 2100.00, '2026-10-02 06:24:35'),
(33, 4, 'Earning', 'Night Differential', 900.00, '2026-10-02 06:24:35'),
(34, 4, 'Earning', 'Meal Allowance', 1500.00, '2026-10-02 06:24:35'),
(35, 4, 'Earning', 'Service Charge', 1000.00, '2026-10-02 06:24:35'),
(36, 4, 'Deduction', 'SSS', 900.00, '2026-10-02 06:24:35'),
(37, 4, 'Deduction', 'PhilHealth', 550.00, '2026-10-02 06:24:35'),
(38, 4, 'Deduction', 'Pag-IBIG', 200.00, '2026-10-02 06:24:35'),
(39, 4, 'Deduction', 'Withholding Tax', 1160.00, '2026-10-02 06:24:35'),
(40, 4, 'Deduction', 'Company Loan', 450.00, '2026-10-02 06:24:35'),
(41, 5, 'Earning', 'Basic Pay', 14000.00, '2026-10-02 06:24:35'),
(42, 5, 'Earning', 'Service Charge', 1800.00, '2026-10-02 06:24:35'),
(43, 5, 'Earning', 'Meal Allowance', 1600.00, '2026-10-02 06:24:35'),
(44, 5, 'Deduction', 'SSS', 700.00, '2026-10-02 06:24:35'),
(45, 5, 'Deduction', 'PhilHealth', 400.00, '2026-10-02 06:24:35'),
(46, 5, 'Deduction', 'Pag-IBIG', 200.00, '2026-10-02 06:24:35'),
(47, 5, 'Deduction', 'Withholding Tax', 980.00, '2026-10-02 06:24:35'),
(48, 6, 'Earning', 'Basic Pay', 42000.00, '2026-10-02 06:24:35'),
(49, 6, 'Earning', 'Service Charge', 4000.00, '2026-10-02 06:24:35'),
(50, 6, 'Earning', 'Meal Allowance', 2000.00, '2026-10-02 06:24:35'),
(51, 6, 'Deduction', 'SSS', 1125.00, '2026-10-02 06:24:35'),
(52, 6, 'Deduction', 'PhilHealth', 750.00, '2026-10-02 06:24:35'),
(53, 6, 'Deduction', 'Pag-IBIG', 300.00, '2026-10-02 06:24:35'),
(54, 6, 'Deduction', 'Withholding Tax', 4525.00, '2026-10-02 06:24:35'),
(55, 7, 'Earning', 'Basic Pay', 23500.00, '2026-10-02 06:24:35'),
(56, 7, 'Earning', 'Service Charge', 1800.00, '2026-10-02 06:24:35'),
(57, 7, 'Earning', 'Meal Allowance', 700.00, '2026-10-02 06:24:35'),
(58, 7, 'Deduction', 'SSS', 800.00, '2026-10-02 06:24:35'),
(59, 7, 'Deduction', 'PhilHealth', 450.00, '2026-10-02 06:24:35'),
(60, 7, 'Deduction', 'Pag-IBIG', 200.00, '2026-10-02 06:24:35'),
(61, 7, 'Deduction', 'Withholding Tax', 1750.00, '2026-10-02 06:24:35');

-- --------------------------------------------------------

--
-- Table structure for table `payroll_periods`
--

CREATE TABLE `payroll_periods` (
  `payroll_period_id` bigint(20) UNSIGNED NOT NULL,
  `period_code` varchar(40) NOT NULL,
  `period_name` varchar(120) NOT NULL,
  `period_start` date NOT NULL,
  `period_end` date NOT NULL,
  `payout_date` date DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'Open',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

--
-- Dumping data for table `payroll_periods`
--

INSERT INTO `payroll_periods` (`payroll_period_id`, `period_code`, `period_name`, `period_start`, `period_end`, `payout_date`, `status`, `created_at`, `updated_at`) VALUES
(1, 'PAY-2026-06-1C', '1st Cut-off June 2026', '2026-06-01', '2026-06-15', '2026-06-20', 'Closed', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(2, 'PAY-2026-06-2C', '2nd Cut-off June 2026', '2026-06-16', '2026-06-30', '2026-07-05', 'Closed', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(3, 'PAY-2026-07-1C', '1st Cut-off July 2026', '2026-07-01', '2026-07-15', '2026-07-20', 'Closed', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(4, 'PAY-2026-07-2C', '2nd Cut-off July 2026', '2026-07-16', '2026-07-31', '2026-08-05', 'Open', '2026-10-02 06:24:35', '2026-10-02 06:24:35');

-- --------------------------------------------------------

--
-- Table structure for table `payroll_records`
--

CREATE TABLE `payroll_records` (
  `payroll_record_id` bigint(20) UNSIGNED NOT NULL,
  `employee_id` bigint(20) UNSIGNED NOT NULL,
  `payroll_period_id` bigint(20) UNSIGNED DEFAULT NULL,
  `pay_period_start` date NOT NULL,
  `pay_period_end` date NOT NULL,
  `payout_date` date DEFAULT NULL,
  `gross_pay` decimal(12,2) NOT NULL,
  `net_pay` decimal(12,2) NOT NULL,
  `status` varchar(30) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

--
-- Dumping data for table `payroll_records`
--

INSERT INTO `payroll_records` (`payroll_record_id`, `employee_id`, `payroll_period_id`, `pay_period_start`, `pay_period_end`, `payout_date`, `gross_pay`, `net_pay`, `status`, `created_at`, `updated_at`) VALUES
(1, 5, 1, '2026-06-01', '2026-06-15', '2026-06-20', 10600.00, 8975.00, 'Released', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(2, 5, 2, '2026-06-16', '2026-06-30', '2026-07-05', 10650.00, 9040.00, 'Released', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(3, 5, 3, '2026-07-01', '2026-07-15', '2026-07-20', 10750.00, 9120.00, 'Released', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(4, 5, 4, '2026-07-16', '2026-07-31', '2026-08-05', 21500.00, 18240.00, 'Draft', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(5, 6, 3, '2026-07-01', '2026-07-15', '2026-07-20', 17400.00, 15120.00, 'Released', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(6, 1, 3, '2026-07-01', '2026-07-15', '2026-07-20', 48000.00, 41300.00, 'Finalized', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(7, 8, 3, '2026-07-01', '2026-07-15', '2026-07-20', 26000.00, 22800.00, 'Released', '2026-10-02 06:24:35', '2026-10-02 06:24:35');

-- --------------------------------------------------------

--
-- Table structure for table `performance_reviews`
--

CREATE TABLE `performance_reviews` (
  `performance_review_id` bigint(20) UNSIGNED NOT NULL,
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
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `performance_reviews`
--

INSERT INTO `performance_reviews` (`performance_review_id`, `employee_id`, `review_period`, `review_date`, `competency_level`, `overall_rating`, `salary_grade_id`, `salary_step`, `evaluator_user_id`, `comments`, `created_at`, `updated_at`) VALUES
(1, 5, 'Q2 2026', '2026-07-15', 'Proficient', 3.50, 2, 'Step 2', 3, 'Meets expectations; consistent food safety compliance and station discipline.', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(2, 6, 'Q2 2026', '2026-07-15', 'Proficient', 4.00, 1, 'Step 1', 2, 'Strong banquet service support; recommended for promotion track.', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(3, 1, 'Q2 2026', '2026-07-15', 'Expert', 4.50, 6, 'Step 3', 2, 'Highest guest satisfaction score this quarter among department heads.', '2026-10-02 06:24:35', '2026-10-02 06:24:35');

-- --------------------------------------------------------

--
-- Table structure for table `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` text NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `personal_access_tokens`
--

INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES
(1, 'App\\Models\\SystemUser', 4, 'auth-token', 'f484a1cbea0a0d6ca0a57b8ed034aa620cec2ec998e5955ce97a12dc041685d0', '[\"*\"]', '2026-10-01 22:49:55', '2026-10-02 10:32:32', '2026-10-01 22:32:32', '2026-10-01 22:49:55'),
(5, 'App\\Models\\SystemUser', 4, 'auth-token', '276259855f22fe2c2502c206fce69846a8563666c3e3d6520c9eaa6d2835b2ae', '[\"*\"]', '2026-10-02 01:51:10', '2026-10-02 13:33:42', '2026-10-02 01:33:42', '2026-10-02 01:51:10'),
(8, 'App\\Models\\SystemUser', 4, 'auth-token', '5ed1e59cde388e0dbbcc3b096b00d404b631d183fc0256a2b1aa7463a3b46a16', '[\"*\"]', '2026-10-04 23:45:40', '2026-10-05 09:21:33', '2026-10-04 21:21:33', '2026-10-04 23:45:40'),
(9, 'App\\Models\\SystemUser', 4, 'auth-token', 'eef79835b58eab746e74932bded51e65ae90fc9f357ac2e87686c3961a0f52dc', '[\"*\"]', '2026-10-05 01:22:32', '2026-10-05 13:17:28', '2026-10-05 01:17:28', '2026-10-05 01:22:32'),
(11, 'App\\Models\\SystemUser', 4, 'auth-token', 'ef672eb3015763b9843e8d3e6663181cf98c81872c2aed91f57d498df052f39c', '[\"*\"]', '2026-10-05 01:56:19', '2026-10-05 13:26:49', '2026-10-05 01:26:49', '2026-10-05 01:56:19'),
(16, 'App\\Models\\SystemUser', 4, 'auth-token', 'dd67bdef02f4162a58ba2de8ca035f112776bd7533d7a24d20ca2abe6c1ea15c', '[\"*\"]', '2026-10-05 04:32:18', '2026-10-05 15:49:15', '2026-10-05 03:49:15', '2026-10-05 04:32:18'),
(17, 'App\\Models\\SystemUser', 4, 'auth-token', 'c296e82afa91abf9560090295f788b6ba81fd59813ee3bca72c9c3042a57e20a', '[\"*\"]', '2026-10-05 07:06:27', '2026-10-05 18:42:40', '2026-10-05 06:42:40', '2026-10-05 07:06:27'),
(18, 'App\\Models\\SystemUser', 4, 'auth-token', 'd60419d1058748e79279b72a26d89c4b5c5e6e46b8fb444679b4957f5951b1e0', '[\"*\"]', '2026-10-05 21:33:28', '2026-10-06 09:08:54', '2026-10-05 21:08:54', '2026-10-05 21:33:28'),
(20, 'App\\Models\\SystemUser', 4, 'auth-token', '59cb5794d1ed6cad983f6e9a71b063ece9a648edcf3818c5325946939cbe2828', '[\"*\"]', '2026-10-07 08:27:28', '2026-10-07 20:10:36', '2026-10-07 08:10:36', '2026-10-07 08:27:28'),
(30, 'App\\Models\\SystemUser', 4, 'auth-token', '20c5713b1dd3ab10537ba4a50fb9ec7556259fbf3a00228d0195ded9f9067393', '[\"*\"]', '2026-10-08 00:26:46', '2026-10-08 12:13:58', '2026-10-08 00:13:58', '2026-10-08 00:26:46'),
(34, 'App\\Models\\SystemUser', 4, 'auth-token', 'ae42982082dd019e7bf9d3db697ea09c611f84853e34ff0143730c7331a13971', '[\"*\"]', '2026-10-09 01:26:35', '2026-10-09 13:06:59', '2026-10-09 01:06:59', '2026-10-09 01:26:35'),
(35, 'App\\Models\\SystemUser', 4, 'auth-token', 'b181a1ae217c3a8a2daaa2f63cb1c2d370324a22252f048b9016f5a71afa5451', '[\"*\"]', '2026-10-09 02:07:20', '2026-10-09 13:26:47', '2026-10-09 01:26:47', '2026-10-09 02:07:20'),
(38, 'App\\Models\\SystemUser', 4, 'auth-token', '9a9e741b18b9cf7798621a7cb96ac0003459c7d33f10c0f898d70f210a1921d0', '[\"*\"]', '2026-10-09 05:55:18', '2026-10-09 17:22:51', '2026-10-09 05:22:51', '2026-10-09 05:55:18'),
(51, 'App\\Models\\SystemUser', 4, 'auth-token', '0f6b4b70df8c0ef3c8e9fe657a75cd9b75cd8e4827b2ed4eeb888cabcc7bac56', '[\"*\"]', '2026-10-09 12:11:01', '2026-10-09 23:56:03', '2026-10-09 11:56:03', '2026-10-09 12:11:01'),
(54, 'App\\Models\\SystemUser', 4, 'auth-token', '5581f53e936f67c381e74f839a9f68402b4dcee8ae8b7a9d60f36c310cf1bd22', '[\"*\"]', '2026-10-09 13:15:21', '2026-10-10 01:07:56', '2026-10-09 13:07:56', '2026-10-09 13:15:21');

-- --------------------------------------------------------

--
-- Table structure for table `positions`
--

CREATE TABLE `positions` (
  `position_id` bigint(20) UNSIGNED NOT NULL,
  `position_code` varchar(30) NOT NULL,
  `title` varchar(150) NOT NULL,
  `department_id` bigint(20) UNSIGNED NOT NULL,
  `salary_grade_id` bigint(20) UNSIGNED DEFAULT NULL,
  `level` varchar(30) NOT NULL,
  `headcount` int(11) NOT NULL DEFAULT 0,
  `filled_count` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `positions`
--

INSERT INTO `positions` (`position_id`, `position_code`, `title`, `department_id`, `salary_grade_id`, `level`, `headcount`, `filled_count`, `created_at`, `updated_at`) VALUES
(1, 'POS-001', 'Front Desk Receptionist', 1, 2, 'Rank & File', 8, 3, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(2, 'POS-002', 'Guest Relations Officer', 1, 4, 'Supervisory', 3, 2, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(3, 'POS-003', 'Restaurant Server', 2, 1, 'Rank & File', 12, 1, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(4, 'POS-004', 'Bartender', 2, 1, 'Rank & File', 4, 1, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(5, 'POS-005', 'Line Cook', 3, 2, 'Rank & File', 10, 1, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(6, 'POS-006', 'Pastry Chef', 3, 5, 'Supervisory', 2, 1, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(7, 'POS-007', 'Housekeeping Attendant', 4, 1, 'Rank & File', 18, 3, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(8, 'POS-008', 'HR Assistant', 5, 3, 'Rank & File', 3, 2, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(9, 'POS-009', 'General Manager', 5, 7, 'Executive', 1, 1, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(10, 'POS-010', 'Front Office Manager', 1, 6, 'Managerial', 1, 1, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(11, 'POS-011', 'F&B Director', 2, 7, 'Executive', 1, 1, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(12, 'POS-012', 'Executive Chef', 3, 7, 'Executive', 1, 1, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(13, 'POS-013', 'Executive Housekeeper', 4, 6, 'Managerial', 1, 1, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(14, 'POS-014', 'HR & Administration Manager', 5, 7, 'Managerial', 1, 1, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(15, 'POS-015', 'Floor Supervisor', 4, 4, 'Supervisory', 2, 1, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(16, 'POS-016', 'HR Officer', 5, 4, 'Supervisory', 2, 1, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(17, 'POS-017', 'Accounting Supervisor', 5, 4, 'Supervisory', 1, 1, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(18, 'POS-018', 'Security Officer', 6, 1, 'Rank & File', 6, 4, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(19, 'POS-019', 'Security Supervisor', 6, 4, 'Supervisory', 1, 1, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(20, 'POS-020', 'Spa Therapist', 7, 2, 'Rank & File', 4, 2, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(21, 'POS-021', 'Wellness / Gym Attendant', 7, 1, 'Rank & File', 2, 1, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(22, 'POS-022', 'Accounting Assistant', 8, 3, 'Rank & File', 2, 1, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(23, 'POS-023', 'Finance Officer', 8, 5, 'Supervisory', 1, 1, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(24, 'POS-024', 'Maintenance Technician', 9, 2, 'Rank & File', 5, 3, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(25, 'POS-025', 'Engineering Supervisor', 9, 4, 'Supervisory', 1, 1, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(26, 'POS-026', 'Electrician', 9, 2, 'Rank & File', 2, 1, '2026-10-02 06:24:35', '2026-10-02 06:24:35');

-- --------------------------------------------------------

--
-- Table structure for table `practical_tests`
--

CREATE TABLE `practical_tests` (
  `practical_test_id` bigint(20) UNSIGNED NOT NULL,
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
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

-- --------------------------------------------------------

--
-- Table structure for table `promotion_requests`
--

CREATE TABLE `promotion_requests` (
  `promotion_request_id` bigint(20) UNSIGNED NOT NULL,
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
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

-- --------------------------------------------------------

--
-- Table structure for table `recognition_reactions`
--

CREATE TABLE `recognition_reactions` (
  `reaction_id` bigint(20) UNSIGNED NOT NULL,
  `recognition_id` bigint(20) UNSIGNED NOT NULL,
  `employee_id` bigint(20) UNSIGNED DEFAULT NULL,
  `reaction_type` varchar(50) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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

CREATE TABLE `requisitions` (
  `requisition_id` bigint(20) UNSIGNED NOT NULL,
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
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

--
-- Dumping data for table `requisitions`
--

INSERT INTO `requisitions` (`requisition_id`, `requisition_code`, `position_id`, `position_title`, `department_id`, `requested_by_user_id`, `requested_count`, `urgency`, `justification`, `status`, `requested_at`, `converted_job_post_id`, `created_at`, `updated_at`) VALUES
(1, 'REQ-1001', 1, 'Front Desk Receptionist', 1, NULL, 2, 'High', 'Two front desk associates are due to transition to the Guest Relations team next month, and occupancy is trending up for the coming peak season. Backfilling now avoids a coverage gap on the AM/PM shift rotation.', 'Pending', '2024-05-02', 1, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(2, 'REQ-1002', 7, 'Housekeeping Attendant', 4, NULL, 3, 'Urgent', 'Room turnover times have slipped past the 30-minute SLA due to persistent understaffing. Three additional attendants are needed to restore standard turnaround ahead of the group bookings arriving this quarter.', 'Pending', '2024-05-05', 3, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(3, 'REQ-1003', 5, 'Line Cook', 3, NULL, 1, 'Normal', 'The kitchen brigade is short one station cook following a resignation. A replacement hire keeps the current menu rotation and banquet commitments fully staffed.', 'Pending', '2024-05-08', 2, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(4, 'REQ-1004', 4, 'Bartender', 2, NULL, 1, 'Normal', 'The lobby bar needs weekend coverage now that the extended happy-hour promotion has launched.', 'Pending', '2024-05-11', 5, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(5, 'REQ-1005', NULL, 'Security Officer', 6, NULL, 2, 'High', 'Perimeter patrol shifts are currently single-manned; two additional officers restore the standard two-person rotation.', 'Done', '2024-04-20', NULL, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(6, 'REQ-1006', NULL, 'Spa Therapist', 7, NULL, 1, 'Low', 'Guest demand for spa bookings has grown following the new wellness package launch.', 'Pending', '2024-05-14', NULL, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(7, 'REQ-1007', NULL, 'Reservations Agent', 1, NULL, 2, 'Normal', 'Call volume has outpaced current agent capacity during the booking surge.', 'Converted', '2024-03-30', NULL, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(8, 'REQ-1008', NULL, 'Sous Chef', 3, NULL, 1, 'Urgent', 'Kitchen leadership gap after recent promotion; needs immediate backfill.', 'Pending', '2024-05-16', NULL, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(9, 'REQ-1009', 15, 'Housekeeping Supervisor', 4, NULL, 1, 'High', 'Additional shift supervisor required to oversee the expanded night cleaning crew.', 'Done', '2024-04-05', NULL, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(10, 'REQ-1010', NULL, 'Accounting Clerk', 8, NULL, 1, 'Normal', 'Month-end close workload has increased with the new property management system rollout.', 'Pending', '2024-05-18', NULL, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(11, 'REQ-1011', NULL, 'Maintenance Technician', 9, NULL, 2, 'High', 'Preventive maintenance backlog requires two more technicians to stay on schedule.', 'Pending', '2024-05-19', NULL, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(12, 'REQ-1012', 2, 'Guest Relations Officer', 1, NULL, 1, 'Normal', 'VIP guest volume has increased, requiring dedicated relations coverage.', 'Converted', '2024-03-12', NULL, '2026-10-02 06:24:35', '2026-10-02 06:24:35');

-- --------------------------------------------------------

--
-- Table structure for table `role_permissions`
--

CREATE TABLE `role_permissions` (
  `role_permission_id` bigint(20) UNSIGNED NOT NULL,
  `role_id` bigint(20) UNSIGNED NOT NULL,
  `module_name` varchar(100) NOT NULL,
  `permission_level` varchar(40) NOT NULL DEFAULT 'None',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `role_permissions`
--

INSERT INTO `role_permissions` (`role_permission_id`, `role_id`, `module_name`, `permission_level`, `created_at`, `updated_at`) VALUES
(1, 1, 'Dashboard', 'Full', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(2, 1, 'Applicant Management', 'Full', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(3, 1, 'Recruitment Management', 'Full', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(4, 1, 'New Hire Onboarding', 'Full', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(5, 1, 'Core HCM', 'Full', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(6, 1, 'Employee Records', 'Full', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(7, 1, 'ESS Management', 'Full', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(8, 1, 'User Management', 'Full', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(9, 1, 'Audit Logs', 'Full', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(10, 1, 'Settings', 'Full', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(11, 2, 'Dashboard', 'View', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(12, 2, 'Applicant Management', 'Edit', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(13, 2, 'Recruitment Management', 'Edit', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(14, 2, 'New Hire Onboarding', 'Edit', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(15, 2, 'Core HCM', 'View', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(16, 2, 'Employee Records', 'Edit', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(17, 2, 'ESS Management', 'Approve / Reject Only', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(18, 2, 'User Management', 'None', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(19, 2, 'Audit Logs', 'None', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(20, 2, 'Settings', 'View', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(21, 3, 'Dashboard', 'View', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(22, 3, 'Applicant Management', 'None', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(23, 3, 'Recruitment Management', 'None', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(24, 3, 'New Hire Onboarding', 'View', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(25, 3, 'Core HCM', 'None', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(26, 3, 'Employee Records', 'None', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(27, 3, 'ESS Management', 'View', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(28, 3, 'User Management', 'None', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(29, 3, 'Audit Logs', 'None', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(30, 3, 'Settings', 'View', '2026-10-02 06:24:35', '2026-10-02 06:24:35');

-- --------------------------------------------------------

--
-- Table structure for table `salary_grades`
--

CREATE TABLE `salary_grades` (
  `salary_grade_id` bigint(20) UNSIGNED NOT NULL,
  `code` varchar(30) NOT NULL,
  `title` varchar(120) NOT NULL,
  `min_salary` decimal(12,2) NOT NULL,
  `max_salary` decimal(12,2) NOT NULL,
  `currency_code` char(3) NOT NULL DEFAULT 'PHP',
  `level` varchar(30) NOT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `salary_grades`
--

INSERT INTO `salary_grades` (`salary_grade_id`, `code`, `title`, `min_salary`, `max_salary`, `currency_code`, `level`, `notes`, `created_at`, `updated_at`) VALUES
(1, 'SG-01', 'Entry Rank & File', 14000.00, 17000.00, 'PHP', 'Rank & File', 'Housekeeping attendants, utility crew', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(2, 'SG-05', 'Standard Rank & File', 18000.00, 22000.00, 'PHP', 'Rank & File', 'Front desk receptionist, line cooks', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(3, 'SG-08', 'Senior Rank & File', 22000.00, 26000.00, 'PHP', 'Rank & File', 'HR assistant, senior receptionist', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(4, 'SG-10', 'Junior Supervisory', 26000.00, 32000.00, 'PHP', 'Supervisory', 'Floor supervisor, guest relations supervisor', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(5, 'SG-12', 'Senior Supervisory', 32000.00, 40000.00, 'PHP', 'Supervisory', 'Pastry chef supervisor, assistant manager', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(6, 'SG-15', 'Department Manager', 45000.00, 60000.00, 'PHP', 'Managerial', 'Front office manager, executive housekeeper', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(7, 'SG-18', 'Executive Director', 65000.00, 90000.00, 'PHP', 'Executive', 'F&B Director, HR Manager, GM', '2026-10-02 06:24:35', '2026-10-02 06:24:35');

-- --------------------------------------------------------

--
-- Table structure for table `screening_ground_truths`
--

CREATE TABLE `screening_ground_truths` (
  `gt_id` bigint(20) UNSIGNED NOT NULL,
  `applicant_id` bigint(20) UNSIGNED NOT NULL,
  `job_post_id` bigint(20) UNSIGNED NOT NULL,
  `true_screening_result` varchar(30) NOT NULL,
  `true_qualification_score` decimal(5,2) DEFAULT NULL,
  `true_missing_information_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`true_missing_information_json`)),
  `true_unrecognized_skills_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`true_unrecognized_skills_json`)),
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `screening_reference_data`
--

CREATE TABLE `screening_reference_data` (
  `ref_id` bigint(20) UNSIGNED NOT NULL,
  `data_type` varchar(20) NOT NULL,
  `canonical_value` varchar(150) NOT NULL,
  `aliases_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`aliases_json`)),
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `screening_reference_data`
--

INSERT INTO `screening_reference_data` (`ref_id`, `data_type`, `canonical_value`, `aliases_json`, `active`, `created_at`, `updated_at`) VALUES
(1, 'skill', 'Attention to Detail', '[\"attention to detail\",\"detail oriented\",\"detail-oriented\"]', 1, '2026-10-02 06:24:35', NULL),
(2, 'skill', 'Auditing and Compliance', '[\"internal auditing\",\"corrective action monitoring\",\"restaurant compliance\",\"compliance monitoring\",\"quality audit\",\"compliance auditing\",\"safety audit\"]', 1, '2026-10-02 06:24:35', NULL),
(3, 'skill', 'Banquet Service', '[\"banquet service\",\"banquet operations\",\"function service\",\"banquet coordination\"]', 1, '2026-10-02 06:24:35', NULL),
(4, 'skill', 'Bar Operations', '[\"bar operations\",\"beverage service\",\"drink preparation\",\"cocktail service\",\"bar setup\",\"bar station management\"]', 1, '2026-10-02 06:24:35', NULL),
(5, 'skill', 'Barista Operations', '[\"barista operations\",\"barista\",\"cafe service\",\"coffee shop operations\"]', 1, '2026-10-02 06:24:35', NULL),
(6, 'skill', 'Beverage Operations Supervision', '[\"beverage operations supervision\"]', 1, '2026-10-02 06:24:35', NULL),
(7, 'skill', 'Beverage Quality Standards', '[\"beverage quality standards\"]', 1, '2026-10-02 06:24:35', NULL),
(8, 'skill', 'Booking Coordination & Confirmation', '[\"booking coordination & confirmation\",\"booking coordination and confirmation\"]', 1, '2026-10-02 06:24:35', NULL),
(9, 'skill', 'Budget & Supply Cost Awareness', '[\"budget & supply cost awareness\",\"budget and supply cost awareness\"]', 1, '2026-10-02 06:24:35', NULL),
(10, 'skill', 'CRM and Loyalty Management', '[\"crm systems\",\"customer feedback analysis\",\"customer retention\",\"loyalty program coordination\",\"relationship management\",\"guest preference management\"]', 1, '2026-10-02 06:24:35', NULL),
(11, 'skill', 'Cake Decoration', '[\"cake decoration\",\"cake decorating\",\"cake design\"]', 1, '2026-10-02 06:24:35', NULL),
(12, 'skill', 'Cash Handling', '[\"cash handling\",\"cashiering\",\"billing\",\"funds handling\",\"cash reconciliation\",\"cash drawer reconciliation\"]', 1, '2026-10-02 06:24:35', NULL),
(13, 'skill', 'Channel Management', '[\"channel management\",\"ota & distribution channel coordination\",\"distribution channel coordination\",\"channel manager\",\"reservation auditing\",\"group & fit booking processing\",\"ota coordination\"]', 1, '2026-10-02 06:24:35', NULL),
(14, 'skill', 'Check-in / Check-out', '[\"check-in \\/ check-out\",\"check in check out\",\"check-in\",\"check-out\",\"arrival and departure handling\"]', 1, '2026-10-02 06:24:35', NULL),
(15, 'skill', 'Chemical Safety', '[\"chemical safety\",\"cleaning chemical handling\"]', 1, '2026-10-02 06:24:35', NULL),
(16, 'skill', 'Cleaning Standards & SOPs', '[\"cleaning standards & sops\",\"cleaning standards and sops\"]', 1, '2026-10-02 06:24:35', NULL),
(17, 'skill', 'Coffee Preparation', '[\"coffee preparation\",\"coffee making\",\"espresso making\",\"espresso extraction\",\"latte art\",\"coffee brewing\",\"coffee craft\"]', 1, '2026-10-02 06:24:35', NULL),
(18, 'skill', 'Communication', '[\"communication\",\"communication skills\",\"verbal communication\",\"written communication\",\"professional communication\"]', 1, '2026-10-02 06:24:35', NULL),
(19, 'skill', 'Complaint Handling', '[\"complaint handling\",\"complaint resolution\",\"guest complaint management\",\"service recovery\",\"guest recovery\"]', 1, '2026-10-02 06:24:35', NULL),
(20, 'skill', 'Concierge Services', '[\"concierge services\",\"concierge\",\"vip guest assistance\",\"local area knowledge\",\"area knowledge\",\"transportation coordination\",\"restaurant & activity reservations\",\"restaurant reservations\",\"activity reservations\"]', 1, '2026-10-02 06:24:35', NULL),
(21, 'skill', 'Confidentiality', '[\"confidentiality\",\"data privacy\",\"records confidentiality\"]', 1, '2026-10-02 06:24:35', NULL),
(22, 'skill', 'Cost Accounting', '[\"basic cost accounting\",\"cost accounting\",\"materials control software\",\"materials control\",\"marketman\",\"supplier delivery verification\"]', 1, '2026-10-02 06:24:35', NULL),
(23, 'skill', 'Cost Reporting', '[\"cost reporting\",\"cost control\",\"f&b cost control\",\"variance analysis\",\"cost monitoring\",\"waste tracking\",\"waste reduction\",\"spoilage tracking\"]', 1, '2026-10-02 06:24:35', NULL),
(24, 'skill', 'Cost Tracking', '[\"cost tracking\"]', 1, '2026-10-02 06:24:35', NULL),
(25, 'skill', 'Cross-Department Coordination', '[\"cross-department coordination\"]', 1, '2026-10-02 06:24:35', NULL),
(26, 'skill', 'Culinary Operations', '[\"menu preparation\",\"kitchen operations\",\"prep schedules\",\"culinary preparation\",\"station preparation\",\"line preparation\"]', 1, '2026-10-02 06:24:35', NULL),
(27, 'skill', 'Customer Service', '[\"customer service\",\"guest service\",\"customer assistance\",\"client service\",\"customer care\"]', 1, '2026-10-02 06:24:35', NULL),
(28, 'skill', 'Daily Sales Reporting', '[\"daily sales reporting\",\"daily sales reports\",\"financial reporting\",\"sales reports\"]', 1, '2026-10-02 06:24:35', NULL),
(29, 'skill', 'Delivery Monitoring', '[\"delivery monitoring\"]', 1, '2026-10-02 06:24:35', NULL),
(30, 'skill', 'Event Coordination', '[\"event coordination\",\"events coordination\",\"event planning\",\"event logistics\",\"event setup\",\"function coordination\"]', 1, '2026-10-02 06:24:35', NULL),
(31, 'skill', 'Facility Maintenance', '[\"facility maintenance\",\"maintenance support\",\"electrical installation\",\"plumbing basics\",\"preventive maintenance\",\"equipment maintenance\",\"basic maintenance\",\"building maintenance\",\"repairs\"]', 1, '2026-10-02 06:24:35', NULL),
(32, 'skill', 'Fine Dining Service', '[\"fine dining service\",\"fine-dining service\",\"fine dining\",\"fine-dining\",\"guest greeting\",\"table management\",\"dining room coordination\"]', 1, '2026-10-02 06:24:35', NULL),
(33, 'skill', 'Food Safety', '[\"food safety\",\"food safety compliance\",\"food hygiene\",\"sanitation\",\"food sanitation\",\"sanitation standards\",\"food handling\"]', 1, '2026-10-02 06:24:35', NULL),
(34, 'skill', 'Front Office Operations', '[\"front office\",\"front office operations\",\"front desk\",\"reception operations\",\"hotel front office\",\"front desk operations\",\"front office procedures\"]', 1, '2026-10-02 06:24:35', NULL),
(35, 'skill', 'Guest Activities Coordination', '[\"guest activities coordination\"]', 1, '2026-10-02 06:24:35', NULL),
(36, 'skill', 'Guest Feedback Management', '[\"guest feedback management\"]', 1, '2026-10-02 06:24:35', NULL),
(37, 'skill', 'Guest Relations', '[\"guest relations\",\"guest relations management\",\"guest engagement\",\"client relations\"]', 1, '2026-10-02 06:24:35', NULL),
(38, 'skill', 'HACCP', '[\"haccp\",\"haccp compliance\",\"food safety management\",\"haccp protocols\"]', 1, '2026-10-02 06:24:35', NULL),
(39, 'skill', 'Hot Kitchen', '[\"hot kitchen\",\"hot line\",\"line cooking\",\"grill station\",\"saute station\",\"kitchen operations\",\"food preparation\"]', 1, '2026-10-02 06:24:35', NULL),
(40, 'skill', 'Hotel Operations', '[\"hotel operations\",\"property operations\"]', 1, '2026-10-02 06:24:35', NULL),
(41, 'skill', 'Housekeeping Operations', '[\"housekeeping\",\"housekeeping operations\",\"housekeeping procedures\",\"housekeeping management\"]', 1, '2026-10-02 06:24:35', NULL),
(42, 'skill', 'Housekeeping and Room Inspection', '[\"room inspection\",\"sanitation protocols\",\"guestroom inspection\",\"housekeeping standards\",\"cleaning inspection\"]', 1, '2026-10-02 06:24:35', NULL),
(43, 'skill', 'Inventory Control', '[\"inventory control\",\"inventory management\",\"stock control\",\"stocktaking\",\"inventory checks\",\"inventory support\",\"stock monitoring\",\"par-level tracking\"]', 1, '2026-10-02 06:24:35', NULL),
(44, 'skill', 'Inventory Counting', '[\"inventory counting\",\"physical inventory counting\",\"perpetual inventory\",\"stock reconciliation\"]', 1, '2026-10-02 06:24:35', NULL),
(45, 'skill', 'Knife Skills', '[\"knife skills\",\"knife handling\"]', 1, '2026-10-02 06:24:35', NULL),
(46, 'skill', 'Laundry Operations and Quality Control', '[\"laundry quality control\",\"uniform management\",\"linen inspection\",\"equipment monitoring\",\"laundry supervision\"]', 1, '2026-10-02 06:24:35', NULL),
(47, 'skill', 'Linen & Amenity Coordination', '[\"linen & amenity coordination\",\"linen and amenity coordination\"]', 1, '2026-10-02 06:24:35', NULL),
(48, 'skill', 'Linen Handling', '[\"linen handling\",\"linen management\",\"laundry operations\",\"laundry management\"]', 1, '2026-10-02 06:24:35', NULL),
(49, 'skill', 'MS Office', '[\"ms office\",\"microsoft office\",\"ms word\",\"ms excel\",\"excel\",\"word processing\",\"spreadsheets\",\"office suite\"]', 1, '2026-10-02 06:24:35', NULL),
(50, 'skill', 'Menu Knowledge & Pairing', '[\"menu knowledge & pairing\",\"menu knowledge and pairing\"]', 1, '2026-10-02 06:24:35', NULL),
(51, 'skill', 'Mise en Place', '[\"mise en place\",\"mise-en-place\",\"station setup\",\"prep lists\"]', 1, '2026-10-02 06:24:35', NULL),
(52, 'skill', 'Mixology', '[\"mixology\",\"cocktail preparation\",\"cocktail craft\",\"drink mixing\",\"beverage preparation\",\"bar operations\",\"beverage service\"]', 1, '2026-10-02 06:24:35', NULL),
(53, 'skill', 'Night Audit Procedures', '[\"night audit procedures\",\"night audit\",\"night auditing\",\"daily audit\",\"end-of-day reporting\"]', 1, '2026-10-02 06:24:35', NULL),
(54, 'skill', 'OTA Extranet Management', '[\"ota extranet management\"]', 1, '2026-10-02 06:24:35', NULL),
(55, 'skill', 'Operational Planning', '[\"operational planning\"]', 1, '2026-10-02 06:24:35', NULL),
(56, 'skill', 'Order Taking', '[\"order taking\",\"taking orders\",\"order processing\"]', 1, '2026-10-02 06:24:35', NULL),
(57, 'skill', 'POS Systems', '[\"pos systems\",\"pos\",\"point of sale\",\"point of sale systems\",\"micros\",\"micros pos\",\"toast pos\",\"pos operation\",\"pos system operation\"]', 1, '2026-10-02 06:24:35', NULL),
(58, 'skill', 'Pastry and Baking', '[\"pastry\",\"baking\",\"pastry arts\",\"dessert preparation\",\"breads and pastries\",\"pastry preparation\",\"basic baking\",\"bread production\"]', 1, '2026-10-02 06:24:35', NULL),
(59, 'skill', 'Payment Processing', '[\"payment processing\",\"processing payments\",\"credit card processing\"]', 1, '2026-10-02 06:24:35', NULL),
(60, 'skill', 'Payroll Support', '[\"payroll support\",\"payroll processing\",\"payroll assistance\"]', 1, '2026-10-02 06:24:35', NULL),
(61, 'skill', 'Plating', '[\"plating\",\"food plating\",\"plate presentation\",\"presentation\",\"dessert plating\"]', 1, '2026-10-02 06:24:35', NULL),
(62, 'skill', 'Problem Resolution', '[\"problem resolution\"]', 1, '2026-10-02 06:24:35', NULL),
(63, 'skill', 'Problem Solving', '[\"problem solving\",\"problem-solving\",\"troubleshooting\"]', 1, '2026-10-02 06:24:35', NULL),
(64, 'skill', 'Procurement Support', '[\"procurement\",\"purchasing\",\"purchase order processing\",\"purchase orders\",\"purchase order documentation\",\"vendor coordination\",\"supplier coordination\",\"receiving & inspection\"]', 1, '2026-10-02 06:24:35', NULL),
(65, 'skill', 'Property Management Systems', '[\"opera pms\",\"opera\",\"property management system\",\"pms systems\",\"pms\",\"opera cloud\",\"ids next\",\"siteminder\"]', 1, '2026-10-02 06:24:35', NULL),
(66, 'skill', 'Public Area Cleaning', '[\"public area cleaning\",\"public area maintenance\"]', 1, '2026-10-02 06:24:35', NULL),
(67, 'skill', 'Quality Assurance', '[\"quality assurance\",\"food quality control\",\"qa inspections\",\"internal audit\",\"compliance monitoring\"]', 1, '2026-10-02 06:24:35', NULL),
(68, 'skill', 'Records Documentation', '[\"documentation\",\"records management\",\"file management\",\"201 files\",\"inventory documentation\"]', 1, '2026-10-02 06:24:35', NULL),
(69, 'skill', 'Recreation Management', '[\"recreation equipment management\",\"guest activities supervision\",\"seasonal program development\",\"vendor & entertainment coordination\",\"activities supervision\",\"resort recreation\"]', 1, '2026-10-02 06:24:35', NULL),
(70, 'skill', 'Recreation Program Planning', '[\"recreation program planning\",\"guest recreation\",\"activity scheduling\",\"activity facilitation\",\"leisure coordination\"]', 1, '2026-10-02 06:24:35', NULL),
(71, 'skill', 'Recreation Safety Awareness', '[\"recreation safety awareness\"]', 1, '2026-10-02 06:24:35', NULL),
(72, 'skill', 'Recruitment Support', '[\"recruitment\",\"recruitment support\",\"sourcing and screening\"]', 1, '2026-10-02 06:24:35', NULL),
(73, 'skill', 'Reservation Reporting & Forecasting', '[\"reservation reporting & forecasting\",\"reservation reporting and forecasting\"]', 1, '2026-10-02 06:24:35', NULL),
(74, 'skill', 'Reservations', '[\"reservations\",\"reservation management\",\"booking management\",\"reservation support\",\"reservation updates\",\"room inventory\",\"ota coordination\"]', 1, '2026-10-02 06:24:35', NULL),
(75, 'skill', 'Resort Accommodation Services', '[\"resort accommodation services\"]', 1, '2026-10-02 06:24:35', NULL),
(76, 'skill', 'Responsible Alcohol Service', '[\"responsible alcohol service\",\"responsible service of alcohol\",\"alcohol awareness\"]', 1, '2026-10-02 06:24:35', NULL),
(77, 'skill', 'Restaurant Operations Management', '[\"restaurant operations management\",\"restaurant operations\",\"inventory monitoring & ordering\",\"service quality monitoring\",\"f&b operations\",\"food & beverage management\"]', 1, '2026-10-02 06:24:35', NULL),
(78, 'skill', 'Revenue Management Support', '[\"revenue management support\",\"revenue management\",\"rate parity\",\"occupancy forecasting\",\"rate monitoring\"]', 1, '2026-10-02 06:24:35', NULL),
(79, 'skill', 'Room Status Coordination', '[\"room status coordination\"]', 1, '2026-10-02 06:24:35', NULL),
(80, 'skill', 'Room Turnover', '[\"room turnover\",\"room cleaning\",\"guestroom cleaning\"]', 1, '2026-10-02 06:24:35', NULL),
(81, 'skill', 'Safety Compliance', '[\"safety compliance\",\"workplace safety\",\"safety procedures\",\"occupational safety\",\"safety protocols\"]', 1, '2026-10-02 06:24:35', NULL),
(82, 'skill', 'Scheduling', '[\"scheduling\",\"shift scheduling\",\"staff scheduling\",\"kitchen scheduling\"]', 1, '2026-10-02 06:24:35', NULL),
(83, 'skill', 'Spa Reception', '[\"spa reception\",\"spa operations\",\"wellness reception\"]', 1, '2026-10-02 06:24:35', NULL),
(84, 'skill', 'Staff Training', '[\"staff training\",\"team training\",\"new hire training\",\"staff coaching\",\"training & onboarding\"]', 1, '2026-10-02 06:24:35', NULL),
(85, 'skill', 'Table Management', '[\"table management\",\"seating management\",\"table turnover\",\"hostess duties\"]', 1, '2026-10-02 06:24:35', NULL),
(86, 'skill', 'Table Service', '[\"table service\",\"food service\",\"service sequence\",\"dining room service\",\"table setting\"]', 1, '2026-10-02 06:24:35', NULL),
(87, 'skill', 'Team Leadership', '[\"team leadership\",\"staff supervision\",\"team supervision\",\"leading teams\",\"shift supervision\",\"floor supervision\"]', 1, '2026-10-02 06:24:35', NULL),
(88, 'skill', 'Teamwork', '[\"teamwork\",\"team collaboration\",\"working with others\"]', 1, '2026-10-02 06:24:35', NULL),
(89, 'skill', 'Technical and Plumbing Maintenance', '[\"basic plumbing repair\",\"plumbing repair\",\"emergency repair response\",\"equipment inspection\",\"maintenance supply inventory\",\"electrical repair\",\"plumbing maintenance\"]', 1, '2026-10-02 06:24:35', NULL),
(90, 'skill', 'Telephone Etiquette', '[\"telephone etiquette\",\"phone etiquette\",\"call handling\",\"booking correspondence\"]', 1, '2026-10-02 06:24:35', NULL),
(91, 'skill', 'Time Management', '[\"time management\",\"prioritization\",\"multitasking\"]', 1, '2026-10-02 06:24:35', NULL),
(92, 'skill', 'Tourism Services', '[\"tourism services\"]', 1, '2026-10-02 06:24:35', NULL),
(93, 'skill', 'Training Program Development', '[\"training program development\"]', 1, '2026-10-02 06:24:35', NULL),
(94, 'skill', 'Upselling', '[\"upselling\",\"upsell techniques\",\"suggestive selling\",\"cross-selling\",\"sales & upselling\"]', 1, '2026-10-02 06:24:35', NULL),
(95, 'job_role', 'Accounts Assistant', '[\"accounts assistant\",\"accounting assistant\",\"finance assistant\",\"bookkeeper\"]', 1, '2026-10-02 06:24:35', NULL),
(96, 'job_role', 'Banquet Operations Supervisor', '[\"banquet operations supervisor\",\"banquet supervisor\",\"banquet operations manager\",\"banquet manager\"]', 1, '2026-10-02 06:24:35', NULL),
(97, 'job_role', 'Banquet Service Team Leader', '[\"banquet service team leader\",\"banquet team leader\",\"banquet service supervisor\",\"banquet team supervisor\"]', 1, '2026-10-02 06:24:35', NULL),
(98, 'job_role', 'Bar Operations Supervisor', '[\"bar operations supervisor\",\"restaurant bar operations supervisor\",\"bar supervisor\",\"bar manager\",\"bar lead\",\"bar team leader\"]', 1, '2026-10-02 06:24:35', NULL),
(99, 'job_role', 'Barista', '[\"barista\",\"coffee shop staff\",\"cafe barista\",\"coffee attendant\"]', 1, '2026-10-02 06:24:35', NULL),
(100, 'job_role', 'Bartender', '[\"bartender\",\"bar tender\",\"barman\",\"barkeep\",\"mixologist\"]', 1, '2026-10-02 06:24:35', NULL),
(101, 'job_role', 'Beverage Service Specialist', '[\"beverage service specialist\",\"restaurant beverage service specialist\",\"beverage specialist\",\"bar specialist\",\"beverage attendant\"]', 1, '2026-10-02 06:24:35', NULL),
(102, 'job_role', 'Catering Operations Coordinator', '[\"catering operations coordinator\",\"catering coordinator\",\"banquet catering coordinator\",\"catering operations\"]', 1, '2026-10-02 06:24:35', NULL),
(103, 'job_role', 'Catering and Banquet Sales Coordinator', '[\"catering and banquet sales coordinator\",\"catering sales coordinator\",\"banquet sales coordinator\",\"catering coordinator\",\"banquet sales assistant\"]', 1, '2026-10-02 06:24:35', NULL),
(104, 'job_role', 'Chef', '[\"chef\",\"sous chef\",\"head chef\",\"executive chef\",\"chef de partie\",\"executive sous chef\",\"banquet chef\",\"demi chef\"]', 1, '2026-10-02 06:24:35', NULL),
(105, 'job_role', 'Concierge', '[\"concierge\",\"hotel concierge\",\"bell captain\",\"bellman\"]', 1, '2026-10-02 06:24:35', NULL),
(106, 'job_role', 'Culinary Production Coordinator', '[\"culinary production coordinator\",\"kitchen production coordinator\",\"culinary coordinator\",\"culinary production\"]', 1, '2026-10-02 06:24:35', NULL),
(107, 'job_role', 'Dining Service Supervisor', '[\"dining service supervisor\",\"restaurant service supervisor\",\"dining supervisor\",\"service supervisor dining\",\"dining room supervisor\"]', 1, '2026-10-02 06:24:35', NULL),
(108, 'job_role', 'Events Catering Supervisor', '[\"events catering supervisor\",\"catering supervisor\",\"event catering coordinator\",\"banquet catering supervisor\"]', 1, '2026-10-02 06:24:35', NULL),
(109, 'job_role', 'Events Coordinator', '[\"sales and events coordinator\",\"hotel sales and events coordinator\",\"events coordinator\",\"banquet coordinator\",\"event coordinator\",\"catering assistant\",\"events and catering assistant\",\"banquet sales assistant\",\"banquet server\"]', 1, '2026-10-02 06:24:35', NULL),
(110, 'job_role', 'Executive Housekeeper', '[\"executive housekeeper\",\"housekeeping manager\",\"housekeeping executive\",\"head housekeeper\"]', 1, '2026-10-02 06:24:35', NULL),
(111, 'job_role', 'Food Beverage Events Supervisor', '[\"food beverage events supervisor\",\"food and beverage events supervisor\",\"f&b events supervisor\",\"food beverage supervisor\"]', 1, '2026-10-02 06:24:35', NULL),
(112, 'job_role', 'Food Production Supervisor', '[\"food production supervisor\",\"kitchen production supervisor\",\"food production coordinator\",\"culinary production supervisor\"]', 1, '2026-10-02 06:24:35', NULL),
(113, 'job_role', 'Food and Beverage Manager', '[\"food and beverage manager\",\"f&b manager\",\"restaurant manager\",\"food & beverage manager\"]', 1, '2026-10-02 06:24:35', NULL),
(114, 'job_role', 'Front Desk Associate', '[\"front desk associate\",\"front office associate\",\"front desk representative\",\"guest service representative\",\"front desk clerk\",\"front office intern\"]', 1, '2026-10-02 06:24:35', NULL),
(115, 'job_role', 'Front Desk Receptionist', '[\"front desk agent\",\"front desk officer\",\"front desk receptionist\",\"front desk staff\",\"front office associate\",\"guest service agent\",\"receptionist\"]', 1, '2026-10-02 06:24:35', NULL),
(116, 'job_role', 'Front Office Manager', '[\"front office manager\",\"front desk manager\",\"front office lead\",\"guest services manager\"]', 1, '2026-10-02 06:24:35', NULL),
(117, 'job_role', 'General Manager', '[\"general manager\",\"gm\",\"property manager\"]', 1, '2026-10-02 06:24:35', NULL),
(118, 'job_role', 'Guest Booking Team Leader', '[\"guest booking team leader\",\"booking team leader\",\"reservations team leader\",\"booking services team leader\"]', 1, '2026-10-02 06:24:35', NULL),
(119, 'job_role', 'Guest Experience Coordinator', '[\"guest experience coordinator\",\"guest experience and loyalty coordinator\",\"hotel guest experience and loyalty coordinator\",\"loyalty coordinator\"]', 1, '2026-10-02 06:24:35', NULL),
(120, 'job_role', 'Guest Experience Officer', '[\"guest experience officer\",\"guest experience coordinator\",\"guest experience specialist\",\"gxo\",\"guest experience officer hotel\"]', 1, '2026-10-02 06:24:35', NULL),
(121, 'job_role', 'Guest Relations Officer', '[\"gro\",\"guest relations coordinator\",\"guest relations officer\",\"guest service officer\",\"guest relations associate\"]', 1, '2026-10-02 06:24:35', NULL),
(122, 'job_role', 'HR Assistant', '[\"hr assistant\",\"human resource assistant\",\"human resources assistant\",\"hr staff\",\"recruitment assistant\"]', 1, '2026-10-02 06:24:35', NULL),
(123, 'job_role', 'HR Manager', '[\"hr manager\",\"human resources manager\",\"hr administration manager\"]', 1, '2026-10-02 06:24:35', NULL),
(124, 'job_role', 'Hospitality Client Relations Team Leader', '[\"hospitality client relations team leader\",\"client relations team leader\",\"client relations supervisor\",\"hospitality client relations supervisor\"]', 1, '2026-10-02 06:24:35', NULL),
(125, 'job_role', 'Hospitality Corporate Sales Coordinator', '[\"hospitality corporate sales coordinator\",\"corporate sales coordinator\",\"corporate sales officer\",\"sales coordinator corporate\",\"hospitality sales coordinator\"]', 1, '2026-10-02 06:24:35', NULL),
(126, 'job_role', 'Hospitality Facilities Team Leader', '[\"hospitality facilities team leader\",\"facilities team leader\",\"facilities supervisor\",\"hospitality facilities supervisor\"]', 1, '2026-10-02 06:24:35', NULL),
(127, 'job_role', 'Hospitality Kitchen Coordinator', '[\"hospitality kitchen coordinator\",\"kitchen coordinator\",\"hospitality kitchen\",\"culinary coordinator\"]', 1, '2026-10-02 06:24:35', NULL),
(128, 'job_role', 'Hospitality Maintenance Coordinator', '[\"hospitality maintenance coordinator\",\"maintenance coordinator\",\"facilities maintenance coordinator\",\"hospitality maintenance supervisor\"]', 1, '2026-10-02 06:24:35', NULL),
(129, 'job_role', 'Hospitality Reservations Specialist', '[\"hospitality reservations specialist\",\"reservations specialist\",\"hospitality reservations officer\",\"reservations officer hospitality\"]', 1, '2026-10-02 06:24:36', NULL),
(130, 'job_role', 'Hostess', '[\"hostess\",\"food host\",\"restaurant host\",\"fine dining restaurant host\",\"host\"]', 1, '2026-10-02 06:24:36', NULL),
(131, 'job_role', 'Hotel Banquet Coordinator', '[\"hotel banquet coordinator\",\"banquet coordinator\",\"hotel banquet\",\"banquet events coordinator\"]', 1, '2026-10-02 06:24:36', NULL),
(132, 'job_role', 'Hotel Booking Services Officer', '[\"hotel booking services officer\",\"booking services officer\",\"hotel booking officer\",\"booking officer hotel\"]', 1, '2026-10-02 06:24:36', NULL),
(133, 'job_role', 'Hotel Business Development Coordinator', '[\"hotel business development coordinator\",\"business development coordinator\",\"business development officer\",\"hotel sales development coordinator\",\"business development coordinator hotel\"]', 1, '2026-10-02 06:24:36', NULL),
(134, 'job_role', 'Hotel Engineering Operations Assistant', '[\"hotel engineering operations assistant\",\"engineering operations assistant\",\"hotel engineering assistant\",\"engineering assistant hotel\"]', 1, '2026-10-02 06:24:36', NULL),
(135, 'job_role', 'Hotel Events Sales Officer', '[\"hotel events sales officer\",\"events sales officer\",\"event sales officer\",\"hotel sales officer\",\"events officer hotel\"]', 1, '2026-10-02 06:24:36', NULL),
(136, 'job_role', 'Hotel Facilities Supervisor', '[\"hotel facilities supervisor\",\"facilities supervisor\",\"property maintenance supervisor\",\"hotel facilities manager\"]', 1, '2026-10-02 06:24:36', NULL),
(137, 'job_role', 'Hotel Front Office Supervisor', '[\"hotel front office supervisor\",\"front office supervisor\",\"front desk supervisor\",\"hotel front office manager\",\"front office lead\"]', 1, '2026-10-02 06:24:36', NULL),
(138, 'job_role', 'Hotel Night Auditor', '[\"night auditor\",\"hotel night auditor\",\"night audit associate\",\"night audit supervisor\"]', 1, '2026-10-02 06:24:36', NULL),
(139, 'job_role', 'Hotel Property Maintenance Supervisor', '[\"hotel property maintenance supervisor\",\"property maintenance supervisor\",\"maintenance supervisor hotel\",\"property maintenance manager\"]', 1, '2026-10-02 06:24:36', NULL),
(140, 'job_role', 'Hotel Reservations Manager', '[\"hotel reservations manager\",\"reservations manager\",\"hotel reservations supervisor\",\"reservations manager hotel\"]', 1, '2026-10-02 06:24:36', NULL),
(141, 'job_role', 'Hotel Reservations Sales Coordinator', '[\"hotel reservations sales coordinator\",\"reservations sales coordinator\",\"hotel reservations sales\",\"reservations coordinator sales\"]', 1, '2026-10-02 06:24:36', NULL),
(142, 'job_role', 'Hotel Reservations Supervisor', '[\"hotel reservations supervisor\",\"reservations supervisor\",\"hotel reservations manager\",\"reservations manager hotel\"]', 1, '2026-10-02 06:24:36', NULL),
(143, 'job_role', 'Hotel Revenue Analyst', '[\"hotel revenue analyst\",\"revenue analyst\",\"revenue management analyst\",\"hotel revenue management analyst\",\"pricing analyst\",\"revenue analyst hotel\"]', 1, '2026-10-02 06:24:36', NULL),
(144, 'job_role', 'Hotel Sales and Events Supervisor', '[\"hotel sales and events supervisor\",\"sales and events supervisor\",\"hotel sales supervisor\",\"sales events supervisor\",\"hotel sales and events coordinator\"]', 1, '2026-10-02 06:24:36', NULL),
(145, 'job_role', 'Housekeeping Attendant', '[\"housekeeping attendant\",\"room attendant\",\"housekeeper\",\"chambermaid\",\"roomboy\",\"public area attendant\"]', 1, '2026-10-02 06:24:36', NULL),
(146, 'job_role', 'Housekeeping Supervisor', '[\"housekeeping supervisor\",\"hotel housekeeping supervisor\",\"floor housekeeper\",\"executive housekeeper\"]', 1, '2026-10-02 06:24:36', NULL),
(147, 'job_role', 'Inventory Supervisor', '[\"inventory supervisor\",\"cost control supervisor\",\"restaurant inventory and cost control supervisor\",\"inventory and cost control supervisor\",\"stock controller\",\"inventory clerk\",\"restaurant stock controller\"]', 1, '2026-10-02 06:24:36', NULL),
(148, 'job_role', 'Kitchen Helper', '[\"kitchen helper\",\"dishwasher\",\"kitchen aide\",\"steward\",\"kitchen steward\",\"kitchen staff\"]', 1, '2026-10-02 06:24:36', NULL),
(149, 'job_role', 'Kitchen Operations Supervisor', '[\"kitchen operations supervisor\",\"culinary operations supervisor\",\"kitchen supervisor operations\",\"kitchen operations manager\"]', 1, '2026-10-02 06:24:36', NULL),
(150, 'job_role', 'Kitchen Supervisor', '[\"kitchen supervisor\",\"restaurant kitchen supervisor\",\"culinary supervisor\",\"chef supervisor\"]', 1, '2026-10-02 06:24:36', NULL),
(151, 'job_role', 'Laundry Attendant', '[\"laundry attendant\",\"laundry staff\"]', 1, '2026-10-02 06:24:36', NULL),
(152, 'job_role', 'Laundry Supervisor', '[\"laundry supervisor\",\"hotel laundry supervisor\",\"laundry team leader\"]', 1, '2026-10-02 06:24:36', NULL),
(153, 'job_role', 'Line Cook', '[\"line cook\",\"cook\",\"station cook\",\"hot kitchen cook\",\"commis chef\",\"kitchen cook\",\"senior line cook\"]', 1, '2026-10-02 06:24:36', NULL),
(154, 'job_role', 'Maintenance Technician', '[\"maintenance technician\",\"hotel maintenance technician\",\"maintenance staff\",\"handyman\",\"building maintenance staff\",\"facilities assistant\"]', 1, '2026-10-02 06:24:36', NULL),
(155, 'job_role', 'Pastry Chef', '[\"pastry chef\",\"baker\",\"pastry cook\",\"baker chef\"]', 1, '2026-10-02 06:24:36', NULL),
(156, 'job_role', 'Pastry and Bakery Assistant', '[\"pastry assistant\",\"bakery assistant\",\"bakery trainee\",\"pastry cook\"]', 1, '2026-10-02 06:24:36', NULL),
(157, 'job_role', 'Purchasing Coordinator', '[\"purchasing coordinator\",\"procurement coordinator\",\"hotel purchasing and procurement coordinator\",\"purchasing and inventory assistant\",\"purchasing assistant\",\"procurement assistant\"]', 1, '2026-10-02 06:24:36', NULL),
(158, 'job_role', 'Quality Assurance Officer', '[\"quality assurance officer\",\"restaurant quality assurance and food safety officer\",\"food safety officer\",\"qa officer\",\"qa and food safety officer\",\"qa assistant\",\"restaurant compliance officer\"]', 1, '2026-10-02 06:24:36', NULL),
(159, 'job_role', 'Recreation Supervisor', '[\"recreation supervisor\",\"resort recreation and activities supervisor\",\"activities supervisor\",\"recreation coordinator\",\"activities coordinator\",\"hotel recreation and activities coordinator\",\"resort activities assistant\"]', 1, '2026-10-02 06:24:36', NULL),
(160, 'job_role', 'Reservations Booking Coordinator', '[\"reservations booking coordinator\",\"booking coordinator\",\"reservations coordinator\",\"hotel booking coordinator\"]', 1, '2026-10-02 06:24:36', NULL),
(161, 'job_role', 'Reservations Coordinator', '[\"reservations coordinator\",\"hotel reservations and distribution coordinator\",\"reservations and distribution coordinator\",\"reservations officer\",\"reservations assistant\",\"hotel reservations assistant\",\"hotel reservations officer\"]', 1, '2026-10-02 06:24:36', NULL),
(162, 'job_role', 'Reservations Manager', '[\"reservations manager\",\"reservation manager\",\"booking manager\"]', 1, '2026-10-02 06:24:36', NULL),
(163, 'job_role', 'Resort Guest Experience Manager', '[\"resort guest experience manager\",\"guest experience manager\",\"guest experience supervisor\",\"resort guest relations manager\"]', 1, '2026-10-02 06:24:36', NULL),
(164, 'job_role', 'Resort Housekeeping Operations Manager', '[\"resort housekeeping operations manager\",\"housekeeping operations manager\",\"resort housekeeping manager\",\"housekeeping manager\",\"housekeeping operations supervisor\",\"resort housekeeping operations\"]', 1, '2026-10-02 06:24:36', NULL),
(165, 'job_role', 'Resort Operations Manager', '[\"resort operations manager\",\"hotel operations manager\",\"resort manager\",\"operations manager resort\"]', 1, '2026-10-02 06:24:36', NULL),
(166, 'job_role', 'Resort Property Operations Coordinator', '[\"resort property operations coordinator\",\"property operations coordinator\",\"property coordinator\",\"resort operations coordinator\"]', 1, '2026-10-02 06:24:36', NULL),
(167, 'job_role', 'Resort Recreation and Activities Manager', '[\"resort recreation and activities manager\",\"recreation and activities manager\",\"resort recreation manager\",\"activities manager\",\"recreation supervisor resort\"]', 1, '2026-10-02 06:24:36', NULL),
(168, 'job_role', 'Restaurant Beverage Supervisor', '[\"restaurant beverage supervisor\",\"beverage supervisor\",\"bar supervisor\",\"beverage service supervisor\",\"restaurant bar supervisor\"]', 1, '2026-10-02 06:24:36', NULL),
(169, 'job_role', 'Restaurant Cashier', '[\"restaurant cashier\",\"cashier\",\"cashier and customer service associate\",\"dining cashier\",\"customer service associate\"]', 1, '2026-10-02 06:24:36', NULL),
(170, 'job_role', 'Restaurant Culinary Operations Officer', '[\"restaurant culinary operations officer\",\"culinary operations officer\",\"restaurant culinary officer\",\"culinary officer restaurant\"]', 1, '2026-10-02 06:24:36', NULL),
(171, 'job_role', 'Restaurant Customer Experience Coordinator', '[\"restaurant customer experience coordinator\",\"customer experience coordinator\",\"cx coordinator\",\"guest experience coordinator restaurant\",\"customer experience coordinator restaurant\"]', 1, '2026-10-02 06:24:36', NULL),
(172, 'job_role', 'Restaurant Events and Banquet Coordinator', '[\"restaurant events and banquet coordinator\",\"events and banquet coordinator\",\"restaurant events coordinator\",\"banquet coordinator\",\"events coordinator restaurant\"]', 1, '2026-10-02 06:24:36', NULL),
(173, 'job_role', 'Restaurant Guest Relations Supervisor', '[\"restaurant guest relations supervisor\",\"guest relations supervisor\",\"restaurant guest relations coordinator\",\"guest relations supervisor restaurant\"]', 1, '2026-10-02 06:24:36', NULL),
(174, 'job_role', 'Restaurant Kitchen Team Leader', '[\"restaurant kitchen team leader\",\"kitchen team leader\",\"restaurant kitchen team\",\"kitchen supervisor team leader\"]', 1, '2026-10-02 06:24:36', NULL),
(175, 'job_role', 'Restaurant Procurement and Purchasing Coordinator', '[\"restaurant procurement and purchasing coordinator\",\"procurement and purchasing coordinator\",\"restaurant procurement coordinator\",\"purchasing coordinator\",\"procurement coordinator\"]', 1, '2026-10-02 06:24:36', NULL),
(176, 'job_role', 'Restaurant Relations Coordinator', '[\"restaurant relations coordinator\",\"guest relations coordinator\",\"relations coordinator\",\"restaurant guest relations coordinator\"]', 1, '2026-10-02 06:24:36', NULL),
(177, 'job_role', 'Restaurant Server', '[\"restaurant server\",\"waiter\",\"waitress\",\"food server\",\"server\",\"food and beverage attendant\",\"f&b attendant\",\"service crew\",\"restaurant crew member\"]', 1, '2026-10-02 06:24:36', NULL),
(178, 'job_role', 'Restaurant Service Team Leader', '[\"restaurant service team leader\",\"service team leader\",\"restaurant team leader\",\"service supervisor\",\"restaurant service supervisor\"]', 1, '2026-10-02 06:24:36', NULL),
(179, 'job_role', 'Restaurant Supervisor', '[\"restaurant supervisor\",\"floor supervisor\",\"service supervisor\",\"senior server lead\",\"food and beverage supervisor\",\"f&b supervisor\"]', 1, '2026-10-02 06:24:36', NULL),
(180, 'job_role', 'Revenue Management Assistant', '[\"revenue management assistant\",\"hotel revenue management assistant\",\"revenue assistant\",\"pricing assistant\"]', 1, '2026-10-02 06:24:36', NULL),
(181, 'job_role', 'Spa Receptionist', '[\"spa receptionist\",\"hotel spa and wellness receptionist\",\"wellness receptionist\",\"spa front desk\",\"spa and wellness receptionist\"]', 1, '2026-10-02 06:24:36', NULL),
(182, 'job_role', 'Supervisor', '[\"supervisor\",\"shift supervisor\",\"team leader\"]', 1, '2026-10-02 06:24:36', NULL),
(183, 'certification', 'Advanced Negotiation Skills for Sales Professionals, 2022', '[\"advanced negotiation skills for sales professionals, 2022\",\"advanced negotiation skills for sales professionals,\"]', 1, '2026-10-02 06:24:36', NULL),
(184, 'certification', 'Banquet and Event Service Excellence Training - Philippine Hotel Owners Association (2022)', '[\"banquet and event service excellence training - philippine hotel owners association (2022)\",\"banquet and event service excellence training - philippine hotel owners association\",\"banquet and event service excellence training\"]', 1, '2026-10-02 06:24:36', NULL),
(185, 'certification', 'Barista NC II', '[\"barista nc ii\",\"tesda barista nc ii\",\"coffee academy certificate\"]', 1, '2026-10-02 06:24:36', NULL),
(186, 'certification', 'Barista and Coffee Craft Training', '[\"barista and coffee craft training\",\"barista & coffee craft training\",\"coffee craft training\",\"barista training\"]', 1, '2026-10-02 06:24:36', NULL),
(187, 'certification', 'Basic Bookkeeping and Accounting Training', '[\"basic bookkeeping and accounting training\",\"basic bookkeeping training\",\"basic accounting for non-accountants\",\"bookkeeping training\",\"basic cost accounting training\"]', 1, '2026-10-02 06:24:36', NULL),
(188, 'certification', 'Basic Electrical Systems Maintenance Certificate - TESDA (2013)', '[\"basic electrical systems maintenance certificate - tesda (2013)\",\"basic electrical systems maintenance certificate - tesda\",\"basic electrical systems maintenance certificate\"]', 1, '2026-10-02 06:24:36', NULL),
(189, 'certification', 'Basic First Aid and CPR Certification', '[\"basic first aid and cpr certification\",\"basic first aid and cpr\",\"basic first aid training\",\"basic occupational first aid\",\"first aid and cpr\",\"basic life support and first aid certification\",\"basic first aid and safety training\",\"first aid certificate\",\"first aid training certificate\",\"standard first aid\",\"basic first aid\"]', 1, '2026-10-02 06:24:36', NULL),
(190, 'certification', 'Basic Occupational Safety and Health Training', '[\"basic occupational safety and health training\",\"occupational safety and health training\",\"occupational safety and health awareness training\",\"workplace safety training\",\"osh training\",\"bosh training\"]', 1, '2026-10-02 06:24:36', NULL),
(191, 'certification', 'Business Development Fundamentals for Hospitality, 2024', '[\"business development fundamentals for hospitality, 2024\",\"business development fundamentals for hospitality,\"]', 1, '2026-10-02 06:24:36', NULL),
(192, 'certification', 'Cash Handling and POS Training', '[\"cash handling and pos training\",\"cash handling & pos training\",\"cash handling and pos system operation\"]', 1, '2026-10-02 06:24:36', NULL),
(193, 'certification', 'Catering Sales Fundamentals Training, 2023', '[\"catering sales fundamentals training, 2023\",\"catering sales fundamentals training,\"]', 1, '2026-10-02 06:24:36', NULL),
(194, 'certification', 'Client Relations Leadership Workshop, 2024', '[\"client relations leadership workshop, 2024\",\"client relations leadership workshop,\"]', 1, '2026-10-02 06:24:36', NULL),
(195, 'certification', 'Culinary Diploma', '[\"culinary diploma\",\"diploma in culinary arts\",\"culinary arts diploma\",\"culinary arts\"]', 1, '2026-10-02 06:24:36', NULL),
(196, 'certification', 'Culinary Production Training, 2023', '[\"culinary production training, 2023\",\"culinary production training,\"]', 1, '2026-10-02 06:24:36', NULL),
(197, 'certification', 'Customer Service Excellence Training', '[\"customer service excellence training\",\"customer service excellence certification\",\"customer service excellence workshop\",\"customer service training\",\"hospitality guest relations training\",\"customer service and guest relations training\"]', 1, '2026-10-02 06:24:36', NULL),
(198, 'certification', 'Data Analysis Fundamentals', '[\"data analysis fundamentals\",\"data analysis fundamentals \\u2014 coursera\",\"hospitality data analytics\"]', 1, '2026-10-02 06:24:36', NULL),
(199, 'certification', 'Data Privacy and Information Security Training', '[\"data privacy and guest information awareness\",\"data privacy awareness\",\"guest data confidentiality training\"]', 1, '2026-10-02 06:24:36', NULL),
(200, 'certification', 'Driver\'s License', '[\"driver\'s license\",\"drivers license\",\"professional driver license\",\"non-professional driver license\"]', 1, '2026-10-02 06:24:36', NULL),
(201, 'certification', 'Event Management Training', '[\"events management training\",\"event management training\",\"event management fundamentals\",\"events and recreation management training\",\"event facilitation training certificate\",\"event facilitation training\"]', 1, '2026-10-02 06:24:36', NULL),
(202, 'certification', 'Facilities Management Training - Philippine Society of Ventilating, Air-Conditioning and Refrigerating Engineers (2020)', '[\"facilities management training - philippine society of ventilating, air-conditioning and refrigerating engineers (2020)\",\"facilities management training - philippine society of ventilating, air-conditioning and refrigerating engineers\",\"facilities management training - philippine society of ventilating, air\"]', 1, '2026-10-02 06:24:36', NULL),
(203, 'certification', 'Fine-Dining Service Training', '[\"fine-dining service training\",\"fine dining service training\",\"fine dining service training \\u2014 peninsula academy\",\"upscale dining service training\"]', 1, '2026-10-02 06:24:36', NULL),
(204, 'certification', 'Food Handler Certificate', '[\"food handler certificate\",\"food handler\'s certificate\",\"food handlers certificate\",\"food safety certificate\",\"food handler card\"]', 1, '2026-10-02 06:24:36', NULL),
(205, 'certification', 'Food Safety Awareness Certification, 2021', '[\"food safety awareness certification, 2021\",\"food safety awareness certification,\"]', 1, '2026-10-02 06:24:36', NULL),
(206, 'certification', 'Food Safety and Hygiene Certification', '[\"food safety and hygiene certification\",\"food safety and hygiene training\",\"food safety and sanitation training\",\"food safety supervisor certification\",\"food safety supervisor certification (haccp)\",\"food safety & hygiene certification\",\"food safety training\",\"food safety certification\",\"restaurant operations and food safety orientation\",\"hygiene and sanitation training\"]', 1, '2026-10-02 06:24:36', NULL),
(207, 'certification', 'Food and Beverage Cost Control Training', '[\"food and beverage cost control training\",\"f&b cost control training\",\"cost control training\"]', 1, '2026-10-02 06:24:36', NULL),
(208, 'certification', 'Front Office & Reservation Systems Training, 2022', '[\"front office & reservation systems training, 2022\",\"front office & reservation systems training,\"]', 1, '2026-10-02 06:24:36', NULL),
(209, 'certification', 'Front Office Team Leadership Workshop, 2024', '[\"front office team leadership workshop, 2024\",\"front office team leadership workshop,\"]', 1, '2026-10-02 06:24:36', NULL),
(210, 'certification', 'Guest Communication Standards Workshop, 2021', '[\"guest communication standards workshop, 2021\",\"guest communication standards workshop,\"]', 1, '2026-10-02 06:24:36', NULL),
(211, 'certification', 'Guest Relations and Customer Experience Training', '[\"guest relations and customer experience training\",\"guest relations and customer experience training - philippine hotel and restaurant association\",\"crm fundamentals training\",\"customer relationship management training\",\"professional communication and etiquette training\",\"professional etiquette training\",\"business communication workshop\"]', 1, '2026-10-02 06:24:36', NULL),
(212, 'certification', 'HACCP Awareness Training', '[\"haccp awareness training\",\"haccp certification\",\"haccp training\",\"food safety (haccp)\",\"food safety supervisor certification (haccp)\",\"haccp compliance training\"]', 1, '2026-10-02 06:24:36', NULL),
(213, 'certification', 'Hospitality Leadership Training - Hotel and Restaurant Association of the Philippines (2020)', '[\"hospitality leadership training - hotel and restaurant association of the philippines (2020)\",\"hospitality leadership training - hotel and restaurant association of the philippines\",\"hospitality leadership training\"]', 1, '2026-10-02 06:24:36', NULL),
(214, 'certification', 'Hospitality Sales Support Fundamentals, 2022', '[\"hospitality sales support fundamentals, 2022\",\"hospitality sales support fundamentals,\"]', 1, '2026-10-02 06:24:36', NULL),
(215, 'certification', 'Hospitality Sales Training, Philippine Hotel Sales Association, 2021', '[\"hospitality sales training, philippine hotel sales association, 2021\",\"hospitality sales training, philippine hotel sales association,\"]', 1, '2026-10-02 06:24:36', NULL),
(216, 'certification', 'Hotel Front Office Operations Training', '[\"hotel front office operations training\",\"front office operations training\",\"front office training\",\"hospitality service training (front office operations)\",\"hotel front office training\"]', 1, '2026-10-02 06:24:36', NULL),
(217, 'certification', 'Hotel Reservation Systems Training – Opera PMS Certification, 2021', '[\"hotel reservation systems training \\u2013 opera pms certification, 2021\",\"hotel reservation systems training \\u2013 opera pms certification,\"]', 1, '2026-10-02 06:24:36', NULL),
(218, 'certification', 'Hotel Revenue Management Training', '[\"hotel revenue management training\",\"revenue management training\"]', 1, '2026-10-02 06:24:36', NULL),
(219, 'certification', 'Housekeeping and Laundry Operations Training', '[\"housekeeping and sanitation training\",\"laundry operations training\",\"laundry operations training \\u2014 philippine hotel owners association\",\"hotel housekeeping operations training\"]', 1, '2026-10-02 06:24:36', NULL),
(220, 'certification', 'Internal Quality Audit Training', '[\"internal quality audit training\",\"internal quality audit training \\u2014 bureau veritas philippines\",\"quality audit training\",\"iso internal audit training\"]', 1, '2026-10-02 06:24:36', NULL),
(221, 'certification', 'Inventory Management Training', '[\"inventory management training\",\"inventory management training certificate\",\"inventory control training\"]', 1, '2026-10-02 06:24:36', NULL),
(222, 'certification', 'Kitchen Inventory & Cost Control Basics, 2023', '[\"kitchen inventory & cost control basics, 2023\",\"kitchen inventory & cost control basics,\"]', 1, '2026-10-02 06:24:36', NULL),
(223, 'certification', 'Kitchen Operations Training, Philippine Culinary Federation, 2022', '[\"kitchen operations training, philippine culinary federation, 2022\",\"kitchen operations training, philippine culinary federation,\"]', 1, '2026-10-02 06:24:36', NULL),
(224, 'certification', 'Microsoft Excel Certification', '[\"microsoft excel certification\",\"microsoft excel advanced certification\",\"advanced microsoft excel for business analytics\",\"microsoft excel for financial reporting\",\"microsoft excel training\",\"microsoft excel training (intermediate)\",\"microsoft excel intermediate certification\"]', 1, '2026-10-02 06:24:36', NULL),
(225, 'certification', 'Opera PMS Training', '[\"opera pms training\",\"opera cloud pms reservations training certificate\",\"opera pms reservation system training\",\"hotel reservation system fundamentals\",\"siteminder channel manager fundamentals\"]', 1, '2026-10-02 06:24:36', NULL),
(226, 'certification', 'Pastry and Dessert Plating Training', '[\"cake decoration and dessert plating training\",\"advanced pastry training\",\"advanced pastry training \\u2014 le cordon bleu manila\",\"dessert plating training\"]', 1, '2026-10-02 06:24:36', NULL),
(227, 'certification', 'Procurement and Supply Chain Fundamentals Training', '[\"procurement and supply chain fundamentals training\",\"basic purchasing and procurement training\",\"basic purchasing and vendor management training\",\"purchasing and supply management training\"]', 1, '2026-10-02 06:24:36', NULL),
(228, 'certification', 'Recreation and Leisure Management Training', '[\"recreation and leisure management training\",\"recreation management training\",\"activity facilitation and event coordination training\",\"events and recreation management training\",\"resort recreation management training\"]', 1, '2026-10-02 06:24:36', NULL),
(229, 'certification', 'Reservation & Rate Management Training, 2023', '[\"reservation & rate management training, 2023\",\"reservation & rate management training,\"]', 1, '2026-10-02 06:24:36', NULL),
(230, 'certification', 'Reservation & Sales Coordination Training, 2024', '[\"reservation & sales coordination training, 2024\",\"reservation & sales coordination training,\"]', 1, '2026-10-02 06:24:36', NULL),
(231, 'certification', 'Reservation Documentation & Booking Systems Training, 2023', '[\"reservation documentation & booking systems training, 2023\",\"reservation documentation & booking systems training,\"]', 1, '2026-10-02 06:24:36', NULL),
(232, 'certification', 'Responsible Beverage Service Training', '[\"responsible beverage service training\",\"responsible beverage service\",\"responsible alcohol service training\",\"beverage service training\",\"bar operations training\"]', 1, '2026-10-02 06:24:36', NULL),
(233, 'certification', 'Restaurant Service Standards Training, 2023', '[\"restaurant service standards training, 2023\",\"restaurant service standards training,\"]', 1, '2026-10-02 06:24:36', NULL),
(234, 'certification', 'Sales and Client Relations Training, 2023', '[\"sales and client relations training, 2023\",\"sales and client relations training,\"]', 1, '2026-10-02 06:24:36', NULL),
(235, 'certification', 'Service Recovery and Complaint Handling Workshop (2019)', '[\"service recovery and complaint handling workshop (2019)\",\"service recovery and complaint handling workshop\"]', 1, '2026-10-02 06:24:36', NULL),
(236, 'certification', 'Spa and Wellness Service Training', '[\"spa and wellness service training\",\"spa reception & guest service training\",\"spa reception and guest service training\",\"wellness & hospitality service training\",\"wellness and hospitality service training\"]', 1, '2026-10-02 06:24:36', NULL),
(237, 'certification', 'Supervisory and Leadership Training', '[\"basic supervisory skills training\",\"basic supervisory skills training - hospitality skills institute\",\"leadership and supervisory training\",\"hospitality supervisory skills training\"]', 1, '2026-10-02 06:24:36', NULL),
(238, 'certification', 'TESDA Bartending NC II', '[\"tesda bartending nc ii\",\"bartending nc ii\",\"bartending nc 2\",\"tesda nc ii in bartending\"]', 1, '2026-10-02 06:24:36', NULL),
(239, 'certification', 'TESDA Bread and Pastry Production NC II', '[\"bread and pastry production nc ii\",\"baking nc ii\",\"pastry production nc ii\",\"tesda bread and pastry production nc ii\",\"bread and pastry nc ii\"]', 1, '2026-10-02 06:24:36', NULL);
INSERT INTO `screening_reference_data` (`ref_id`, `data_type`, `canonical_value`, `aliases_json`, `active`, `created_at`, `updated_at`) VALUES
(240, 'certification', 'TESDA Cookery NC II', '[\"tesda cookery nc ii\",\"cookery nc ii\",\"tesda cookery nc 2\",\"commercial cooking nc ii\",\"tesda nc ii in cookery\",\"tesda cookery\"]', 1, '2026-10-02 06:24:36', NULL),
(241, 'certification', 'TESDA Electrical Installation and Maintenance NC II', '[\"electrical installation and maintenance nc ii\",\"tesda electrical installation and maintenance nc ii\",\"electrical installation nc ii\",\"electrical installation & maintenance nc ii\"]', 1, '2026-10-02 06:24:36', NULL),
(242, 'certification', 'TESDA Food and Beverage Services NC II', '[\"food and beverage services nc ii\",\"f&b services nc ii\",\"fb services nc ii\",\"food and beverage nc ii\",\"tesda food and beverage services nc ii\",\"food & beverage services nc ii\"]', 1, '2026-10-02 06:24:36', NULL),
(243, 'certification', 'TESDA Front Office NC II', '[\"tesda front office nc ii\",\"front office nc ii\",\"front office services nc ii\",\"tesda front office services nc ii\"]', 1, '2026-10-02 06:24:36', NULL),
(244, 'certification', 'TESDA Housekeeping NC II', '[\"tesda housekeeping nc ii\",\"housekeeping nc ii\",\"housekeeping nc 2\",\"tesda nc ii in housekeeping\"]', 1, '2026-10-02 06:24:36', NULL),
(245, 'certification', 'Team Leadership for Front Office Supervisors, 2022', '[\"team leadership for front office supervisors, 2022\",\"team leadership for front office supervisors,\"]', 1, '2026-10-02 06:24:36', NULL),
(246, 'certification', 'Technical Maintenance and Plumbing Training', '[\"basic plumbing training\",\"plumbing maintenance training\",\"facility maintenance training\"]', 1, '2026-10-02 06:24:36', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `screening_requirement_templates`
--

CREATE TABLE `screening_requirement_templates` (
  `template_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(150) NOT NULL,
  `position_id` bigint(20) UNSIGNED DEFAULT NULL,
  `description` varchar(500) DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `screening_requirement_templates`
--

INSERT INTO `screening_requirement_templates` (`template_id`, `name`, `position_id`, `description`, `active`, `created_at`, `updated_at`) VALUES
(1, 'Front Desk Receptionist — Core Requirements', 1, 'Guest-facing front office essentials the spaCy screening scores against.', 1, '2026-10-01 22:24:36', '2026-10-01 22:24:36'),
(2, 'Guest Relations Officer — Core Requirements', 2, 'Complaint recovery and VIP handling for the guest relations desk.', 1, '2026-10-01 22:24:36', '2026-10-01 22:24:36'),
(3, 'Restaurant Server — Core Requirements', 3, 'Table service and upselling requirements for the all-day dining outlet.', 1, '2026-10-01 22:24:36', '2026-10-01 22:24:36'),
(4, 'Bartender — Core Requirements', 4, 'Bar craft, inventory control and the TESDA bartending credential.', 1, '2026-10-01 22:24:36', '2026-10-01 22:24:36'),
(5, 'Line Cook — Core Requirements', 5, 'Hot-kitchen station requirements with food safety credentials.', 1, '2026-10-01 22:24:36', '2026-10-01 22:24:36'),
(6, 'Pastry Chef — Core Requirements', 6, 'Baking and dessert plating requirements for the pastry section.', 1, '2026-10-01 22:24:36', '2026-10-01 22:24:36'),
(7, 'Housekeeping Attendant — Core Requirements', 7, 'Room turnover and chemical-safety requirements for rooms division.', 1, '2026-10-01 22:24:36', '2026-10-01 22:24:36'),
(8, 'HR Assistant — Core Requirements', 8, 'Recruitment support and records-management requirements.', 1, '2026-10-01 22:24:36', '2026-10-01 22:24:36');

-- --------------------------------------------------------

--
-- Table structure for table `screening_requirement_template_items`
--

CREATE TABLE `screening_requirement_template_items` (
  `item_id` bigint(20) UNSIGNED NOT NULL,
  `template_id` bigint(20) UNSIGNED NOT NULL,
  `entity_type` varchar(20) NOT NULL,
  `value` varchar(255) NOT NULL,
  `required` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `screening_requirement_template_items`
--

INSERT INTO `screening_requirement_template_items` (`item_id`, `template_id`, `entity_type`, `value`, `required`, `created_at`) VALUES
(1, 1, 'skill', 'Guest Relations', 1, '2026-10-02 06:24:36'),
(2, 1, 'skill', 'Opera PMS', 1, '2026-10-02 06:24:36'),
(3, 1, 'skill', 'Check-in / Check-out', 1, '2026-10-02 06:24:36'),
(4, 1, 'skill', 'Cash Handling', 1, '2026-10-02 06:24:36'),
(5, 1, 'skill', 'Reservations', 1, '2026-10-02 06:24:36'),
(6, 1, 'certification', 'TESDA Front Office NC II', 1, '2026-10-02 06:24:36'),
(7, 1, 'education', 'Bachelor\'s Degree', 1, '2026-10-02 06:24:36'),
(8, 1, 'experience', '1-2 Years', 1, '2026-10-02 06:24:36'),
(9, 2, 'skill', 'Guest Relations', 1, '2026-10-02 06:24:36'),
(10, 2, 'skill', 'Complaint Handling', 1, '2026-10-02 06:24:36'),
(11, 2, 'skill', 'VIP Handling', 1, '2026-10-02 06:24:36'),
(12, 2, 'skill', 'Multilingual', 1, '2026-10-02 06:24:36'),
(13, 2, 'education', 'Bachelor\'s Degree', 1, '2026-10-02 06:24:36'),
(14, 2, 'experience', '3-5 Years', 1, '2026-10-02 06:24:36'),
(15, 3, 'skill', 'Table Service', 1, '2026-10-02 06:24:36'),
(16, 3, 'skill', 'POS Systems', 1, '2026-10-02 06:24:36'),
(17, 3, 'skill', 'Banquet Service', 1, '2026-10-02 06:24:36'),
(18, 3, 'skill', 'Food Safety', 1, '2026-10-02 06:24:36'),
(19, 3, 'skill', 'Upselling', 1, '2026-10-02 06:24:36'),
(20, 3, 'education', 'High School Graduate', 1, '2026-10-02 06:24:36'),
(21, 3, 'experience', 'No Experience', 1, '2026-10-02 06:24:36'),
(22, 4, 'skill', 'Mixology', 1, '2026-10-02 06:24:36'),
(23, 4, 'skill', 'Cocktail Craft', 1, '2026-10-02 06:24:36'),
(24, 4, 'skill', 'Inventory', 1, '2026-10-02 06:24:36'),
(25, 4, 'skill', 'Bar Hygiene', 1, '2026-10-02 06:24:36'),
(26, 4, 'certification', 'TESDA Bartending NC II', 1, '2026-10-02 06:24:36'),
(27, 4, 'education', 'Vocational / TESDA', 1, '2026-10-02 06:24:36'),
(28, 4, 'experience', '1-2 Years', 1, '2026-10-02 06:24:36'),
(29, 5, 'skill', 'Hot Kitchen', 1, '2026-10-02 06:24:36'),
(30, 5, 'skill', 'Food Handler', 1, '2026-10-02 06:24:36'),
(31, 5, 'skill', 'HACCP', 1, '2026-10-02 06:24:36'),
(32, 5, 'skill', 'Mise en Place', 1, '2026-10-02 06:24:36'),
(33, 5, 'skill', 'Plating', 1, '2026-10-02 06:24:36'),
(34, 5, 'certification', 'TESDA Cookery NC II', 1, '2026-10-02 06:24:36'),
(35, 5, 'education', 'Vocational / TESDA', 1, '2026-10-02 06:24:36'),
(36, 5, 'experience', '1-2 Years', 1, '2026-10-02 06:24:36'),
(37, 6, 'skill', 'Pastry', 1, '2026-10-02 06:24:36'),
(38, 6, 'skill', 'Baking', 1, '2026-10-02 06:24:36'),
(39, 6, 'skill', 'Dessert Plating', 1, '2026-10-02 06:24:36'),
(40, 6, 'skill', 'HACCP', 1, '2026-10-02 06:24:36'),
(41, 6, 'education', 'Vocational / TESDA', 1, '2026-10-02 06:24:36'),
(42, 6, 'experience', '3-5 Years', 1, '2026-10-02 06:24:36'),
(43, 7, 'skill', 'Room Turnover', 1, '2026-10-02 06:24:36'),
(44, 7, 'skill', 'Linen Handling', 1, '2026-10-02 06:24:36'),
(45, 7, 'skill', 'Chemical Safety', 1, '2026-10-02 06:24:36'),
(46, 7, 'skill', 'Public Area Cleaning', 1, '2026-10-02 06:24:36'),
(47, 7, 'certification', 'TESDA Housekeeping NC II', 1, '2026-10-02 06:24:36'),
(48, 7, 'education', 'High School Graduate', 1, '2026-10-02 06:24:36'),
(49, 7, 'experience', 'No Experience', 1, '2026-10-02 06:24:36'),
(50, 8, 'skill', 'Recruitment', 1, '2026-10-02 06:24:36'),
(51, 8, 'skill', '201 Files', 1, '2026-10-02 06:24:36'),
(52, 8, 'skill', 'Payroll Support', 1, '2026-10-02 06:24:36'),
(53, 8, 'skill', 'DOLE Compliance', 1, '2026-10-02 06:24:36'),
(54, 8, 'education', 'Bachelor\'s Degree', 1, '2026-10-02 06:24:36'),
(55, 8, 'experience', '1-2 Years', 1, '2026-10-02 06:24:36');

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('aiMV0pLxfRG8zvZ1z2jIV7y5FmtBryXjIgCH6qns', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiZWtUTnZ5TFMyS0pqRHJCMTFoM21Ma3R6eWtEdTc1ajdpSnhCckVQZSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1791263296),
('aM9cqLLftuCCRhUBEpO8770BFJuXMchcGgoidtzK', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Code/1.141.0 Chrome/150.0.7871.250 Electron/43.7.7 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiRmM1ZUVncktUaTVLUFdxZ2Z0aTRkSjVhU29YVmd5dmRtWW82VEEwTCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1791580572),
('AqKNBOsF7V8zqetCUaBSJvRNupHddARmKACEizIX', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiMTJPaGtyRlJsbkxUN1N1UE5ENk5MRjdzV0M2YWg0SXNOVmdGV1F2TiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1791174301),
('GqwjqLXriLx4PT8s6o1oZTzIi75ZFWhPfpKl31kV', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiTFJObG4zZm54SUdvNnNYTndIR3J4Uk5ubUM5VDNiYjNXVmNEd2lveiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1791554144),
('gTmeQGrc1f8yROb77hrk90FO6V5ZlDdsXwfHOPdu', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiczJJblpxQlM0VXQwSXNSSTlUTXNKeDR1YTI0ZndSdzNsUVg5RVAxSyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1791385304),
('hO68LGmBOnmikAozjadfKwc43vMqXe8ipwNDQxeX', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiemJRQXhuUGZCS1ZsZ3loY2xMNkFiV3o5Mjh2dUpUQlU2alRPckdtOSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1791211320),
('khP0grDzuRS3iYl3p0zuD9P2s3CBPChJTLm5c8Fv', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:156.0) Gecko/20100101 Firefox/156.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiY1hHZVFRdGgzZzJpQlNyNVo4bzBPZkNpYWVPdHM0THdJQkZXV1U5NyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1790923879),
('qiwcMAb5zXnQyd3wxondS9Wd443NHPhbZOswALG5', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:156.0) Gecko/20100101 Firefox/156.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiZTY3b3lZTHlzeFdCTXRoVGNvblc3OEpDMjJ1UnhIbTh1Umk0cUdjQSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1791034385),
('swyAB222ucvEResBEmLPUGA7ObtEzptjCqNeiW2N', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Code/1.141.0 Chrome/150.0.7871.250 Electron/43.7.7 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiVFU3dUxTaXBtMkdCV0JYNWRVU2xoMWs3bHY3YTJObmN0WWFXTHBvdiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1791554127),
('wPLrZLoKDw5DzghJpRnjNfr3zICd3PAVt18CxEMP', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiZ0Jwc3loQzNXRFNpMzNiaGNOem5XNUJpc25yYXE5T1E3Um1nTGlTVCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1791580603),
('XmcVfUvON0oRzJ6nBg0wvlnI6QIRa65dicz2WUcv', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Code/1.141.0 Chrome/150.0.7871.250 Electron/43.7.7 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiQmIyS3kwTEJFMGxhRGk0M1RWTVFqdTMwVzlCVXJZNVI4Zno5UllORyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1791536696),
('ZFVzp5XCyMldaX8V2fBQPN9Ajxh1IhGJR8NzqGUO', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoib242bVlGUzNhajBhS1hsUWVuRjN1SFVzV1VGaU4yMFAwNVBlcDQzUiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1791443018);

-- --------------------------------------------------------

--
-- Table structure for table `social_recognitions`
--

CREATE TABLE `social_recognitions` (
  `recognition_id` bigint(20) UNSIGNED NOT NULL,
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
  `shares_count` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `social_recognitions`
--

INSERT INTO `social_recognitions` (`recognition_id`, `sender_employee_id`, `recipient_employee_id`, `sender_name`, `recipient_name`, `sender_role`, `recipient_role`, `core_value`, `message`, `clap_count`, `heart_count`, `star_count`, `fire_count`, `shares_count`, `created_at`, `updated_at`) VALUES
(1, NULL, 5, 'Chef Marco Rossi', 'Kevin Dela Cruz', 'Executive Chef · F&B', 'Line Cook · Kitchen / Culinary', 'Teamwork & Malasakit', 'Stepped up during the 200-guest executive banquet dinner rush and ensured flawless plating and zero delays!', 14, 8, 6, 5, 0, '2026-08-21 01:30:00', '2026-08-21 01:30:00'),
(2, 3, 2, 'Paolo Cruz', 'Maria Santos', 'Payroll & HR Specialist · Administration / HR', 'Guest Relations Officer · Front Office', 'Guest Delight', 'Received a glowing 5-star TripAdvisor review from our corporate VIP praising your warmth, attentiveness, and swift check-in!', 19, 12, 10, 4, 0, '2026-08-20 06:15:00', '2026-08-20 06:15:00'),
(3, 5, NULL, 'Kevin Dela Cruz', 'Chef Marco Rossi', 'Line Cook · Kitchen / Culinary', 'Executive Chef · F&B', 'Going the Extra Mile', 'Thank you for mentoring the team through the new seasonal tasting menu prep and always looking out for kitchen crew welfare!', 11, 7, 5, 2, 0, '2026-08-19 09:00:00', '2026-08-19 09:00:00'),
(4, NULL, 7, 'Elena Torres', 'Ricardo Gomez', 'Housekeeping Supervisor · Housekeeping', 'Housekeeping Attendant · Housekeeping', 'Operational Excellence', 'Maintained a 100% spotless inspection pass rate across all 30 deluxe executive suites on Floor 8 with zero guest callbacks.', 9, 5, 8, 3, 0, '2026-08-18 03:20:00', '2026-08-18 03:20:00');

-- --------------------------------------------------------

--
-- Table structure for table `system_roles`
--

CREATE TABLE `system_roles` (
  `role_id` bigint(20) UNSIGNED NOT NULL,
  `role_name` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `is_super_admin` tinyint(1) NOT NULL DEFAULT 0,
  `is_protected` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `system_roles`
--

INSERT INTO `system_roles` (`role_id`, `role_name`, `description`, `is_super_admin`, `is_protected`, `created_at`, `updated_at`) VALUES
(1, 'Super Admin', 'Full system access across all modules and settings', 1, 1, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(2, 'Admin', 'HR admin: recruitment, onboarding, employee records, ESS approval', 0, 0, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(3, 'Employee', 'Self-service portal access for employees', 0, 0, '2026-10-02 06:24:35', '2026-10-02 06:24:35');

-- --------------------------------------------------------

--
-- Table structure for table `system_settings`
--

CREATE TABLE `system_settings` (
  `setting_id` bigint(20) UNSIGNED NOT NULL,
  `setting_key` varchar(120) NOT NULL,
  `setting_value` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`setting_value`)),
  `updated_by_user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `system_settings`
--

INSERT INTO `system_settings` (`setting_id`, `setting_key`, `setting_value`, `updated_by_user_id`, `created_at`, `updated_at`) VALUES
(1, 'company.name', '{\"value\": \"Oxford Suites Makati\"}', 1, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(2, 'company.timezone', '{\"value\": \"Asia/Manila\"}', 1, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(3, 'password_policy', '{\"minLength\": 8, \"requireUppercase\": true, \"requireLowercase\": true, \"requireNumber\": true, \"requireSymbol\": true, \"twoFactor\": true, \"sessionTimeout\": \"30 minutes\", \"maxLoginAttempts\": \"3 attempts\"}', 1, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(4, 'default_password', '{\"password\": \"Oxford@2026\"}', 1, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(5, 'recruitment.screening.enabled', '{\"value\": true}', 1, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(6, 'ess.default_processing_role', '{\"value\": \"Admin\"}', 1, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(7, 'company', '{\"name\":\"Oxford Suites\",\"email\":\"hr@oxfordsuites.com.ph\",\"contact\":\"+63 2 8999 0000\",\"businessHours\":\"Monday\\u2013Friday \\u00b7 8:00 AM \\u2013 6:00 PM\",\"address\":\"123 Makati Avenue, Makati City, Metro Manila\",\"tin\":\"000-000-000-000\"}', NULL, '2026-10-01 22:24:36', '2026-10-01 22:24:36'),
(8, 'preferences', '{\"theme\":\"Light\",\"language\":\"English\",\"dateFormat\":\"MM\\/DD\\/YYYY\",\"timeFormat\":\"12-hour\",\"timeZone\":\"Asia\\/Manila (GMT+8)\"}', NULL, '2026-10-01 22:24:36', '2026-10-01 22:24:36'),
(9, 'notifications', '{\"Email notifications\":true,\"Browser notifications\":false,\"System announcements\":true}', NULL, '2026-10-01 22:24:36', '2026-10-01 22:24:36'),
(10, 'security', '{\"twoFactor\":false,\"minLength\":8,\"requireUppercase\":true,\"requireLowercase\":true,\"requireNumber\":true,\"requireSymbol\":false,\"sessionTimeout\":\"30 minutes\",\"maxLoginAttempts\":\"5 attempts\"}', NULL, '2026-10-01 22:24:36', '2026-10-01 22:24:36'),
(11, 'backup', '{\"enabled\":true,\"schedule\":\"daily\"}', NULL, '2026-10-01 22:24:36', '2026-10-01 22:24:36'),
(12, 'my_notifications_kevin.delacruz@oxfordsuites.com.ph', '{\"Email notifications\":true,\"Browser notifications\":false,\"System announcements\":true}', 4, '2026-10-01 22:45:28', '2026-10-01 22:45:28'),
(13, 'my_preferences_kevin.delacruz@oxfordsuites.com.ph', '{\"theme\":\"Light\",\"language\":\"English\",\"dateFormat\":\"MM\\/DD\\/YYYY\",\"timeFormat\":\"12-hour\",\"timeZone\":\"Asia\\/Manila (GMT+8)\"}', 4, '2026-10-04 20:45:37', '2026-10-04 22:04:48'),
(14, 'onboarding.auto_regularize_days', '180', NULL, '2026-10-09 02:24:31', '2026-10-09 02:24:31');

-- --------------------------------------------------------

--
-- Table structure for table `system_users`
--

CREATE TABLE `system_users` (
  `system_user_id` bigint(20) UNSIGNED NOT NULL,
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
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `system_users`
--

INSERT INTO `system_users` (`system_user_id`, `username`, `email`, `password_hash`, `full_name`, `department_name`, `employee_id`, `role_id`, `status`, `otp_enabled`, `mfa_method`, `totp_secret`, `totp_confirmed_at`, `mfa_recovery_codes`, `failed_attempts`, `locked_until`, `last_login_at`, `last_login_ip`, `created_at`, `updated_at`) VALUES
(1, 'bullseur', 'bullseur@oxfordsuites.com.ph', '$2y$12$ozkKQUVriwNqQRfIkkf.ruoVKPNmYJTBKRBOJxnccoBPhMzz0d9yW', 'Bullseur Santiago', 'Administration / HR', NULL, 1, 'Active', 0, 'email_otp', NULL, NULL, NULL, 0, NULL, '2026-10-09 09:34:44', '127.0.0.1', '2026-10-02 06:24:35', '2026-10-09 09:34:44'),
(2, 'jdelacruz', 'juan.delacruz@oxfordsuites.com.ph', '$2y$12$ozkKQUVriwNqQRfIkkf.ruoVKPNmYJTBKRBOJxnccoBPhMzz0d9yW', 'Juan Dela Cruz', 'Administration / HR', 7, 2, 'Active', 1, 'email_otp', NULL, NULL, NULL, 0, NULL, '2026-07-25 23:58:00', '192.168.10.22', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(3, 'aramos', 'ana.ramos@oxfordsuites.com.ph', '$2y$12$ozkKQUVriwNqQRfIkkf.ruoVKPNmYJTBKRBOJxnccoBPhMzz0d9yW', 'Ana Ramos', 'Front Office', 1, 2, 'Active', 0, 'email_otp', NULL, NULL, NULL, 0, NULL, '2026-10-09 12:17:55', '127.0.0.1', '2026-10-02 06:24:35', '2026-10-09 12:17:55'),
(4, 'kdelacruz', 'kevin.delacruz@oxfordsuites.com.ph', '$2y$12$ozkKQUVriwNqQRfIkkf.ruoVKPNmYJTBKRBOJxnccoBPhMzz0d9yW', 'Kevin Dela Cruz', 'Kitchen / Culinary', 5, 3, 'Active', 0, 'email_otp', NULL, NULL, NULL, 0, NULL, '2026-10-09 13:07:56', '127.0.0.1', '2026-10-02 06:24:35', '2026-10-09 13:07:56'),
(5, 'mdevera', 'marjun.devera@oxfordsuites.com.ph', '$2y$12$ozkKQUVriwNqQRfIkkf.ruoVKPNmYJTBKRBOJxnccoBPhMzz0d9yW', 'Marjun Devera', 'Food & Beverage', 6, 3, 'Suspended', 1, 'email_otp', NULL, NULL, NULL, 0, NULL, '2026-07-20 11:11:00', '10.0.4.101', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(6, 'raquino', 'rosa.aquino@oxfordsuites.com.ph', '$2y$12$ozkKQUVriwNqQRfIkkf.ruoVKPNmYJTBKRBOJxnccoBPhMzz0d9yW', 'Rosa Aquino', 'Housekeeping', 8, 3, 'Active', 1, 'email_otp', NULL, NULL, NULL, 0, NULL, '2026-07-25 22:03:00', '10.0.4.57', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(7, 'mlim', 'maria.lim@oxfordsuites.com.ph', '$2y$12$ozkKQUVriwNqQRfIkkf.ruoVKPNmYJTBKRBOJxnccoBPhMzz0d9yW', 'Maria Lim', 'Administration / HR', 11, 2, 'Active', 1, 'email_otp', NULL, NULL, NULL, 0, NULL, '2026-07-25 23:45:00', '192.168.10.18', '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(8, 'pcruz', 'paolo.cruz@oxfordsuites.com.ph', '$2y$12$ozkKQUVriwNqQRfIkkf.ruoVKPNmYJTBKRBOJxnccoBPhMzz0d9yW', 'Paolo Cruz', 'Administration / HR', 12, 2, 'Active', 1, 'email_otp', NULL, NULL, NULL, 0, NULL, '2026-07-25 09:30:00', '192.168.10.12', '2026-10-02 06:24:35', '2026-10-02 06:24:35');

-- --------------------------------------------------------

--
-- Table structure for table `user_login_activity`
--

CREATE TABLE `user_login_activity` (
  `login_activity_id` bigint(20) UNSIGNED NOT NULL,
  `system_user_id` bigint(20) UNSIGNED NOT NULL,
  `login_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `ip_address` varchar(45) DEFAULT NULL,
  `device_info` varchar(255) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'success'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
(9, 4, '2026-10-01 22:32:32', '127.0.0.1', 'Firefox on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:156.0) Gecko/20100101 Firefox/156.0', 'success'),
(10, 4, '2026-10-01 22:52:05', '127.0.0.1', 'Firefox on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:156.0) Gecko/20100101 Firefox/156.0', 'success'),
(11, 1, '2026-10-01 23:27:05', '127.0.0.1', 'Firefox on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:156.0) Gecko/20100101 Firefox/156.0', 'success'),
(12, 4, '2026-10-01 23:31:30', '127.0.0.1', 'Firefox on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:156.0) Gecko/20100101 Firefox/156.0', 'success'),
(13, 4, '2026-10-02 01:33:42', '127.0.0.1', 'Firefox on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:156.0) Gecko/20100101 Firefox/156.0', 'success'),
(14, 4, '2026-10-03 05:33:58', '127.0.0.1', 'Firefox on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:156.0) Gecko/20100101 Firefox/156.0', 'success'),
(15, 4, '2026-10-04 20:28:54', '127.0.0.1', 'Firefox on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', 'success'),
(16, 4, '2026-10-04 21:21:33', '127.0.0.1', 'Firefox on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', 'success'),
(17, 4, '2026-10-05 01:17:28', '127.0.0.1', 'Firefox on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', 'success'),
(18, 4, '2026-10-05 01:22:55', '127.0.0.1', 'Firefox on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', 'success'),
(19, 4, '2026-10-05 01:26:49', '127.0.0.1', 'Firefox on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', 'success'),
(20, 4, '2026-10-05 01:56:26', '127.0.0.1', 'Firefox on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', 'success'),
(21, 4, '2026-10-05 03:19:24', '127.0.0.1', 'Firefox on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', 'success'),
(22, 4, '2026-10-05 03:47:05', '127.0.0.1', 'Firefox on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', 'success'),
(23, 1, '2026-10-05 03:47:12', '127.0.0.1', 'Firefox on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', 'success'),
(24, 4, '2026-10-05 03:49:15', '127.0.0.1', 'Firefox on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', 'success'),
(25, 4, '2026-10-05 06:42:40', '127.0.0.1', 'Firefox on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', 'success'),
(26, 4, '2026-10-05 21:08:54', '127.0.0.1', 'Firefox on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', 'success'),
(27, 4, '2026-10-07 07:02:32', '127.0.0.1', 'Firefox on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', 'success'),
(28, 4, '2026-10-07 08:10:36', '127.0.0.1', 'Firefox on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', 'success'),
(29, 4, '2026-10-07 23:04:35', '127.0.0.1', 'Firefox on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', 'success'),
(30, 1, '2026-10-07 23:24:30', '127.0.0.1', 'Firefox on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', 'success'),
(31, 4, '2026-10-07 23:27:32', '127.0.0.1', 'Firefox on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', 'success'),
(32, 1, '2026-10-07 23:28:03', '127.0.0.1', 'Firefox on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', 'success'),
(33, 1, '2026-10-07 23:33:22', '127.0.0.1', 'Firefox on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', 'success'),
(34, 1, '2026-10-07 23:44:11', '127.0.0.1', 'Firefox on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', 'success'),
(35, 4, '2026-10-07 23:44:47', '127.0.0.1', 'Firefox on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', 'success'),
(36, 1, '2026-10-07 23:47:48', '127.0.0.1', 'Firefox on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', 'success'),
(37, 1, '2026-10-08 00:08:07', '127.0.0.1', 'Firefox on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', 'success'),
(38, 4, '2026-10-08 00:13:58', '127.0.0.1', 'Firefox on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', 'success'),
(39, 1, '2026-10-08 00:32:31', '127.0.0.1', 'Firefox on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', 'success'),
(40, 1, '2026-10-08 00:35:10', '127.0.0.1', 'Firefox on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', 'success'),
(41, 4, '2026-10-08 00:35:36', '127.0.0.1', 'Firefox on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', 'success'),
(42, 4, '2026-10-09 01:06:59', '127.0.0.1', 'Firefox on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', 'success'),
(43, 4, '2026-10-09 01:26:47', '127.0.0.1', 'Firefox on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', 'success'),
(44, 4, '2026-10-09 02:07:31', '127.0.0.1', 'Firefox on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', 'success'),
(45, 4, '2026-10-09 04:35:06', '127.0.0.1', 'Firefox on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', 'success'),
(46, 4, '2026-10-09 05:22:51', '127.0.0.1', 'Firefox on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', 'success'),
(47, 4, '2026-10-09 05:56:30', '127.0.0.1', 'Firefox on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', 'success'),
(48, 1, '2026-10-09 06:51:47', '127.0.0.1', 'Firefox on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', 'success'),
(49, 4, '2026-10-09 06:52:05', '127.0.0.1', 'Firefox on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', 'success'),
(50, 1, '2026-10-09 08:23:09', '127.0.0.1', 'Firefox on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', 'success'),
(51, 4, '2026-10-09 08:31:17', '127.0.0.1', 'Firefox on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', 'success'),
(52, 1, '2026-10-09 09:26:38', '127.0.0.1', 'Firefox on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', 'success'),
(53, 4, '2026-10-09 09:30:48', '127.0.0.1', 'Firefox on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', 'success'),
(54, 1, '2026-10-09 09:34:44', '127.0.0.1', 'Firefox on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', 'success'),
(55, 4, '2026-10-09 09:35:46', '127.0.0.1', 'Firefox on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', 'success'),
(56, 3, '2026-10-09 10:10:29', '127.0.0.1', 'Firefox on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', 'success'),
(57, 3, '2026-10-09 10:36:39', '127.0.0.1', 'Firefox on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', 'success'),
(58, 4, '2026-10-09 10:53:14', '127.0.0.1', 'Firefox on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', 'success'),
(59, 4, '2026-10-09 11:56:03', '127.0.0.1', 'Firefox on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', 'success'),
(60, 4, '2026-10-09 12:11:13', '127.0.0.1', 'Firefox on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', 'success'),
(61, 3, '2026-10-09 12:17:55', '127.0.0.1', 'Firefox on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', 'success'),
(62, 4, '2026-10-09 13:07:56', '127.0.0.1', 'Firefox on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', 'success');

-- --------------------------------------------------------

--
-- Table structure for table `work_schedules`
--

CREATE TABLE `work_schedules` (
  `work_schedule_id` bigint(20) UNSIGNED NOT NULL,
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
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

--
-- Dumping data for table `work_schedules`
--

INSERT INTO `work_schedules` (`work_schedule_id`, `employee_id`, `day_of_week`, `shift_name`, `start_time`, `end_time`, `location`, `is_rest_day`, `effective_from`, `effective_to`, `created_at`, `updated_at`) VALUES
(1, 5, 0, 'AM Shift', '07:00:00', '16:00:00', 'Main Kitchen', 0, '2026-07-01', NULL, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(2, 5, 1, 'AM Shift', '07:00:00', '16:00:00', 'Main Kitchen', 0, '2026-07-01', NULL, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(3, 5, 2, 'Mid Shift', '11:00:00', '20:00:00', 'Banquet', 0, '2026-07-01', NULL, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(4, 5, 3, 'Mid Shift', '11:00:00', '20:00:00', 'Banquet', 0, '2026-07-01', NULL, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(5, 5, 4, 'PM Shift', '14:00:00', '23:00:00', 'Main Kitchen', 0, '2026-07-01', NULL, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(6, 5, 5, NULL, NULL, NULL, NULL, 1, '2026-07-01', NULL, '2026-10-02 06:24:35', '2026-10-02 06:24:35'),
(7, 5, 6, NULL, NULL, NULL, NULL, 1, '2026-07-01', NULL, '2026-10-02 06:24:35', '2026-10-02 06:24:35');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `announcements`
--
ALTER TABLE `announcements`
  ADD PRIMARY KEY (`announcement_id`),
  ADD KEY `idx_announcements_created_by_user_id` (`created_by_user_id`),
  ADD KEY `idx_announcements_status` (`status`);

--
-- Indexes for table `applicants`
--
ALTER TABLE `applicants`
  ADD PRIMARY KEY (`applicant_id`),
  ADD UNIQUE KEY `applicants_applicant_code_unique` (`applicant_code`),
  ADD KEY `idx_applicants_job_post_id` (`job_post_id`),
  ADD KEY `idx_applicants_status` (`status`),
  ADD KEY `idx_applicants_stage` (`stage`),
  ADD KEY `idx_applicants_applied_at` (`applied_at`),
  ADD KEY `idx_applicants_email_job_stage` (`email`,`job_post_id`,`stage`),
  ADD KEY `idx_applicants_resume_hash` (`resume_hash`);

--
-- Indexes for table `applicant_assessments`
--
ALTER TABLE `applicant_assessments`
  ADD PRIMARY KEY (`assessment_id`),
  ADD KEY `idx_applicant_assessments_applicant_id` (`applicant_id`),
  ADD KEY `idx_applicant_assessments_assessor_user_id` (`assessor_user_id`);

--
-- Indexes for table `applicant_documents`
--
ALTER TABLE `applicant_documents`
  ADD PRIMARY KEY (`applicant_document_id`),
  ADD KEY `idx_applicant_documents_applicant_id` (`applicant_id`),
  ADD KEY `idx_applicant_documents_doc_type` (`doc_type`),
  ADD KEY `idx_applicant_documents_verification_status` (`verification_status`);

--
-- Indexes for table `applicant_screenings`
--
ALTER TABLE `applicant_screenings`
  ADD PRIMARY KEY (`screening_id`),
  ADD KEY `idx_applicant_screenings_applicant_id` (`applicant_id`),
  ADD KEY `idx_applicant_screenings_job_post_id` (`job_post_id`),
  ADD KEY `idx_applicant_screenings_processing_status` (`processing_status`);

--
-- Indexes for table `applicant_screening_entities`
--
ALTER TABLE `applicant_screening_entities`
  ADD PRIMARY KEY (`entity_id`),
  ADD KEY `idx_applicant_screening_entities_applicant_id` (`applicant_id`);

--
-- Indexes for table `applicant_screening_scores`
--
ALTER TABLE `applicant_screening_scores`
  ADD PRIMARY KEY (`score_id`),
  ADD KEY `idx_applicant_screening_scores_applicant_id` (`applicant_id`);

--
-- Indexes for table `assessment_invites`
--
ALTER TABLE `assessment_invites`
  ADD PRIMARY KEY (`assessment_invite_id`),
  ADD UNIQUE KEY `assessment_invites_token_unique` (`token`),
  ADD KEY `idx_assessment_invites_applicant_id` (`applicant_id`),
  ADD KEY `idx_assessment_invites_status` (`status`),
  ADD KEY `fk_assessment_invites_created_by_user_id` (`created_by_user_id`);

--
-- Indexes for table `assessment_tests`
--
ALTER TABLE `assessment_tests`
  ADD PRIMARY KEY (`assessment_test_id`),
  ADD KEY `idx_assessment_tests_applicant_id` (`applicant_id`),
  ADD KEY `idx_assessment_tests_assessor_user_id` (`assessor_user_id`),
  ADD KEY `idx_assessment_tests_test_date` (`test_date`);

--
-- Indexes for table `attendance_records`
--
ALTER TABLE `attendance_records`
  ADD PRIMARY KEY (`attendance_id`),
  ADD UNIQUE KEY `uq_attendance_records_natural` (`employee_id`,`work_date`),
  ADD KEY `idx_attendance_records_employee_id` (`employee_id`),
  ADD KEY `idx_attendance_records_work_date` (`work_date`);

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`audit_log_id`),
  ADD KEY `idx_audit_logs_system_user_id` (`system_user_id`),
  ADD KEY `idx_audit_logs_occurred_at` (`occurred_at`),
  ADD KEY `idx_audit_logs_module_name` (`module_name`),
  ADD KEY `idx_audit_logs_severity` (`severity`);

--
-- Indexes for table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_expiration_index` (`expiration`);

--
-- Indexes for table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_locks_expiration_index` (`expiration`);

--
-- Indexes for table `chatbot_faqs`
--
ALTER TABLE `chatbot_faqs`
  ADD PRIMARY KEY (`faq_id`);
ALTER TABLE `chatbot_faqs` ADD FULLTEXT KEY `ft_chatbot_faqs_search` (`question`,`keywords`);

--
-- Indexes for table `chatbot_messages`
--
ALTER TABLE `chatbot_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_chatbot_messages_session` (`session_id`),
  ADD KEY `idx_chatbot_messages_user` (`user_id`),
  ADD KEY `idx_chatbot_messages_created` (`created_at`),
  ADD KEY `idx_chatbot_messages_source` (`source`);

--
-- Indexes for table `chatbot_unanswered`
--
ALTER TABLE `chatbot_unanswered`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_chatbot_unanswered_session_id` (`session_id`),
  ADD KEY `idx_chatbot_unanswered_created_at` (`created_at`);

--
-- Indexes for table `checklist_requests`
--
ALTER TABLE `checklist_requests`
  ADD PRIMARY KEY (`checklist_request_id`),
  ADD UNIQUE KEY `checklist_requests_request_code_unique` (`request_code`),
  ADD KEY `idx_checklist_requests_employee_id` (`employee_id`),
  ADD KEY `idx_checklist_requests_template_id` (`template_id`),
  ADD KEY `idx_checklist_requests_requested_by_user_id` (`requested_by_user_id`),
  ADD KEY `idx_checklist_requests_status` (`status`);

--
-- Indexes for table `departments`
--
ALTER TABLE `departments`
  ADD PRIMARY KEY (`department_id`),
  ADD UNIQUE KEY `departments_code_unique` (`code`),
  ADD UNIQUE KEY `departments_name_unique` (`name`),
  ADD KEY `idx_departments_head_employee_id` (`head_employee_id`);

--
-- Indexes for table `employees`
--
ALTER TABLE `employees`
  ADD PRIMARY KEY (`employee_id`),
  ADD UNIQUE KEY `employees_employee_code_unique` (`employee_code`),
  ADD UNIQUE KEY `employees_email_unique` (`email`),
  ADD KEY `idx_employees_department_id` (`department_id`),
  ADD KEY `idx_employees_position_id` (`position_id`),
  ADD KEY `idx_employees_salary_grade_id` (`salary_grade_id`),
  ADD KEY `idx_employees_supervisor_employee_id` (`supervisor_employee_id`),
  ADD KEY `idx_employees_status` (`status`),
  ADD KEY `idx_employees_date_hired` (`date_hired`);

--
-- Indexes for table `employee_benefits`
--
ALTER TABLE `employee_benefits`
  ADD PRIMARY KEY (`employee_benefit_id`),
  ADD KEY `idx_employee_benefits_employee_id` (`employee_id`);

--
-- Indexes for table `employee_documents`
--
ALTER TABLE `employee_documents`
  ADD PRIMARY KEY (`document_id`),
  ADD UNIQUE KEY `uq_employee_documents_natural` (`employee_id`,`document_code`),
  ADD KEY `idx_employee_documents_category` (`category`),
  ADD KEY `idx_employee_documents_document_status` (`document_status`);

--
-- Indexes for table `employee_emergency_contacts`
--
ALTER TABLE `employee_emergency_contacts`
  ADD PRIMARY KEY (`emergency_contact_id`),
  ADD KEY `idx_employee_emergency_contacts_employee_id` (`employee_id`);

--
-- Indexes for table `employee_exit_records`
--
ALTER TABLE `employee_exit_records`
  ADD PRIMARY KEY (`exit_record_id`),
  ADD UNIQUE KEY `employee_exit_records_employee_id_unique` (`employee_id`),
  ADD KEY `idx_employee_exit_records_employee_id` (`employee_id`);

--
-- Indexes for table `employee_learning`
--
ALTER TABLE `employee_learning`
  ADD PRIMARY KEY (`employee_learning_id`),
  ADD UNIQUE KEY `uq_employee_learning_natural` (`employee_id`,`course_id`),
  ADD KEY `idx_employee_learning_employee_id` (`employee_id`),
  ADD KEY `idx_employee_learning_course_id` (`course_id`);

--
-- Indexes for table `employee_onboarding_items`
--
ALTER TABLE `employee_onboarding_items`
  ADD PRIMARY KEY (`employee_onboarding_item_id`),
  ADD KEY `idx_employee_onboarding_items_employee_id` (`employee_id`),
  ADD KEY `idx_employee_onboarding_items_new_hire_id` (`new_hire_id`),
  ADD KEY `idx_employee_onboarding_items_template_item_id` (`template_item_id`),
  ADD KEY `idx_employee_onboarding_items_completed_by_user_id` (`completed_by_user_id`);

--
-- Indexes for table `employee_position_history`
--
ALTER TABLE `employee_position_history`
  ADD PRIMARY KEY (`position_history_id`),
  ADD KEY `idx_employee_position_history_employee_id` (`employee_id`),
  ADD KEY `idx_employee_position_history_old_position_id` (`old_position_id`),
  ADD KEY `idx_employee_position_history_new_position_id` (`new_position_id`),
  ADD KEY `idx_employee_position_history_old_salary_grade_id` (`old_salary_grade_id`),
  ADD KEY `idx_employee_position_history_new_salary_grade_id` (`new_salary_grade_id`);

--
-- Indexes for table `ess_categories`
--
ALTER TABLE `ess_categories`
  ADD PRIMARY KEY (`ess_category_id`),
  ADD UNIQUE KEY `ess_categories_code_unique` (`code`);

--
-- Indexes for table `ess_requests`
--
ALTER TABLE `ess_requests`
  ADD PRIMARY KEY (`ess_request_id`),
  ADD UNIQUE KEY `ess_requests_request_code_unique` (`request_code`),
  ADD KEY `idx_ess_requests_employee_id` (`employee_id`),
  ADD KEY `idx_ess_requests_category_id` (`category_id`),
  ADD KEY `idx_ess_requests_assigned_to_user_id` (`assigned_to_user_id`),
  ADD KEY `idx_ess_requests_status` (`status`),
  ADD KEY `idx_ess_requests_filed_at` (`filed_at`);

--
-- Indexes for table `facilities`
--
ALTER TABLE `facilities`
  ADD PRIMARY KEY (`facility_id`),
  ADD UNIQUE KEY `facilities_name_unique` (`name`),
  ADD KEY `idx_facilities_type` (`type`),
  ADD KEY `idx_facilities_is_active` (`is_active`);

--
-- Indexes for table `final_evaluations`
--
ALTER TABLE `final_evaluations`
  ADD PRIMARY KEY (`final_evaluation_id`),
  ADD UNIQUE KEY `uq_final_evaluations_applicant_id` (`applicant_id`),
  ADD KEY `idx_final_evaluations_evaluated_by` (`evaluated_by_user_id`),
  ADD KEY `idx_final_evaluations_evaluation_date` (`evaluation_date`);

--
-- Indexes for table `hr3_recommendations`
--
ALTER TABLE `hr3_recommendations`
  ADD PRIMARY KEY (`recommendation_id`),
  ADD KEY `idx_hr3_recommendations_employee_id` (`employee_id`),
  ADD KEY `idx_hr3_recommendations_evaluator_user_id` (`evaluator_user_id`),
  ADD KEY `idx_hr3_recommendations_suggested_position_id` (`suggested_position_id`),
  ADD KEY `idx_hr3_recommendations_suggested_salary_grade_id` (`suggested_salary_grade_id`),
  ADD KEY `idx_hr3_rec_promo_req` (`promotion_request_id`);

--
-- Indexes for table `interviews`
--
ALTER TABLE `interviews`
  ADD PRIMARY KEY (`interview_id`),
  ADD UNIQUE KEY `interviews_interview_code_unique` (`interview_code`),
  ADD KEY `idx_interviews_applicant_id` (`applicant_id`),
  ADD KEY `idx_interviews_interviewer_employee_id` (`interviewer_employee_id`),
  ADD KEY `idx_interviews_scheduled_date` (`scheduled_date`),
  ADD KEY `idx_interviews_facility_id` (`facility_id`);

--
-- Indexes for table `job_posts`
--
ALTER TABLE `job_posts`
  ADD PRIMARY KEY (`job_post_id`),
  ADD UNIQUE KEY `job_posts_slug_unique` (`slug`),
  ADD KEY `idx_job_posts_department_id` (`department_id`),
  ADD KEY `idx_job_posts_position_id` (`position_id`),
  ADD KEY `idx_job_posts_status_active` (`status`,`active`);

--
-- Indexes for table `job_post_platforms`
--
ALTER TABLE `job_post_platforms`
  ADD PRIMARY KEY (`job_post_platform_id`),
  ADD UNIQUE KEY `uq_job_post_platforms_natural` (`job_post_id`,`platform`);

--
-- Indexes for table `learning_courses`
--
ALTER TABLE `learning_courses`
  ADD PRIMARY KEY (`course_id`),
  ADD UNIQUE KEY `learning_courses_course_code_unique` (`course_code`);

--
-- Indexes for table `leave_balances`
--
ALTER TABLE `leave_balances`
  ADD PRIMARY KEY (`leave_balance_id`),
  ADD UNIQUE KEY `uq_leave_balances_natural` (`employee_id`,`leave_type`,`period_year`),
  ADD KEY `idx_leave_balances_employee_id` (`employee_id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `new_hires`
--
ALTER TABLE `new_hires`
  ADD PRIMARY KEY (`new_hire_id`),
  ADD UNIQUE KEY `new_hires_new_hire_code_unique` (`new_hire_code`),
  ADD KEY `idx_new_hires_applicant_id` (`applicant_id`),
  ADD KEY `idx_new_hires_employee_id` (`employee_id`),
  ADD KEY `idx_new_hires_position_id` (`position_id`),
  ADD KEY `idx_new_hires_department_id` (`department_id`),
  ADD KEY `idx_new_hires_stage` (`stage`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`notification_id`),
  ADD KEY `idx_notifications_system_user_id` (`system_user_id`),
  ADD KEY `idx_notifications_is_read` (`is_read`),
  ADD KEY `idx_notifications_created_at` (`created_at`);

--
-- Indexes for table `onboarding_checklist_items`
--
ALTER TABLE `onboarding_checklist_items`
  ADD PRIMARY KEY (`template_item_id`),
  ADD KEY `idx_onboarding_checklist_items_template_id` (`template_id`);

--
-- Indexes for table `onboarding_checklist_templates`
--
ALTER TABLE `onboarding_checklist_templates`
  ADD PRIMARY KEY (`template_id`),
  ADD UNIQUE KEY `onboarding_checklist_templates_template_code_unique` (`template_code`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `payroll_items`
--
ALTER TABLE `payroll_items`
  ADD PRIMARY KEY (`payroll_item_id`),
  ADD KEY `idx_payroll_items_payroll_record_id` (`payroll_record_id`);

--
-- Indexes for table `payroll_periods`
--
ALTER TABLE `payroll_periods`
  ADD PRIMARY KEY (`payroll_period_id`),
  ADD UNIQUE KEY `payroll_periods_period_code_unique` (`period_code`),
  ADD KEY `idx_payroll_periods_status` (`status`);

--
-- Indexes for table `payroll_records`
--
ALTER TABLE `payroll_records`
  ADD PRIMARY KEY (`payroll_record_id`),
  ADD KEY `idx_payroll_records_employee_id` (`employee_id`),
  ADD KEY `idx_payroll_records_payroll_period_id` (`payroll_period_id`),
  ADD KEY `idx_payroll_records_pay_period_start` (`pay_period_start`),
  ADD KEY `idx_payroll_records_status` (`status`);

--
-- Indexes for table `performance_reviews`
--
ALTER TABLE `performance_reviews`
  ADD PRIMARY KEY (`performance_review_id`),
  ADD KEY `idx_performance_reviews_employee_id` (`employee_id`),
  ADD KEY `idx_performance_reviews_salary_grade_id` (`salary_grade_id`),
  ADD KEY `idx_performance_reviews_evaluator_user_id` (`evaluator_user_id`);

--
-- Indexes for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  ADD KEY `personal_access_tokens_expires_at_index` (`expires_at`);

--
-- Indexes for table `positions`
--
ALTER TABLE `positions`
  ADD PRIMARY KEY (`position_id`),
  ADD UNIQUE KEY `positions_position_code_unique` (`position_code`),
  ADD KEY `idx_positions_department_id` (`department_id`),
  ADD KEY `idx_positions_salary_grade_id` (`salary_grade_id`);

--
-- Indexes for table `practical_tests`
--
ALTER TABLE `practical_tests`
  ADD PRIMARY KEY (`practical_test_id`),
  ADD KEY `idx_practical_tests_applicant_id` (`applicant_id`),
  ADD KEY `idx_practical_tests_assessor_user_id` (`assessor_user_id`),
  ADD KEY `idx_practical_tests_test_date` (`test_date`);

--
-- Indexes for table `promotion_requests`
--
ALTER TABLE `promotion_requests`
  ADD PRIMARY KEY (`promotion_request_id`),
  ADD KEY `idx_promo_req_employee` (`employee_id`),
  ADD KEY `idx_promo_req_status` (`status`),
  ADD KEY `idx_promo_req_hr3_rec` (`hr3_recommendation_id`);

--
-- Indexes for table `recognition_reactions`
--
ALTER TABLE `recognition_reactions`
  ADD PRIMARY KEY (`reaction_id`),
  ADD UNIQUE KEY `rec_emp_react_unique` (`recognition_id`,`employee_id`,`reaction_type`),
  ADD KEY `recognition_reactions_employee_id_foreign` (`employee_id`);

--
-- Indexes for table `requisitions`
--
ALTER TABLE `requisitions`
  ADD PRIMARY KEY (`requisition_id`),
  ADD UNIQUE KEY `requisitions_requisition_code_unique` (`requisition_code`),
  ADD KEY `idx_requisitions_position_id` (`position_id`),
  ADD KEY `idx_requisitions_department_id` (`department_id`),
  ADD KEY `idx_requisitions_requested_by_user_id` (`requested_by_user_id`),
  ADD KEY `idx_requisitions_converted_job_post_id` (`converted_job_post_id`),
  ADD KEY `idx_requisitions_status` (`status`),
  ADD KEY `idx_requisitions_requested_at` (`requested_at`);

--
-- Indexes for table `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD PRIMARY KEY (`role_permission_id`),
  ADD UNIQUE KEY `uq_role_permissions_natural` (`role_id`,`module_name`),
  ADD KEY `idx_role_permissions_role_id` (`role_id`);

--
-- Indexes for table `salary_grades`
--
ALTER TABLE `salary_grades`
  ADD PRIMARY KEY (`salary_grade_id`),
  ADD UNIQUE KEY `salary_grades_code_unique` (`code`);

--
-- Indexes for table `screening_ground_truths`
--
ALTER TABLE `screening_ground_truths`
  ADD PRIMARY KEY (`gt_id`),
  ADD UNIQUE KEY `uq_screening_ground_truths_applicant` (`applicant_id`),
  ADD KEY `fk_screening_gt_job_post_id` (`job_post_id`);

--
-- Indexes for table `screening_reference_data`
--
ALTER TABLE `screening_reference_data`
  ADD PRIMARY KEY (`ref_id`),
  ADD UNIQUE KEY `uq_screening_ref_type_value` (`data_type`,`canonical_value`),
  ADD KEY `idx_screening_reference_data_type` (`data_type`);

--
-- Indexes for table `screening_requirement_templates`
--
ALTER TABLE `screening_requirement_templates`
  ADD PRIMARY KEY (`template_id`),
  ADD KEY `idx_screening_req_templates_position` (`position_id`);

--
-- Indexes for table `screening_requirement_template_items`
--
ALTER TABLE `screening_requirement_template_items`
  ADD PRIMARY KEY (`item_id`),
  ADD UNIQUE KEY `uq_screening_req_items_value` (`template_id`,`entity_type`,`value`),
  ADD KEY `idx_screening_req_items_template` (`template_id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `social_recognitions`
--
ALTER TABLE `social_recognitions`
  ADD PRIMARY KEY (`recognition_id`),
  ADD KEY `social_recognitions_sender_employee_id_index` (`sender_employee_id`),
  ADD KEY `social_recognitions_recipient_employee_id_index` (`recipient_employee_id`);

--
-- Indexes for table `system_roles`
--
ALTER TABLE `system_roles`
  ADD PRIMARY KEY (`role_id`),
  ADD UNIQUE KEY `system_roles_role_name_unique` (`role_name`);

--
-- Indexes for table `system_settings`
--
ALTER TABLE `system_settings`
  ADD PRIMARY KEY (`setting_id`),
  ADD UNIQUE KEY `system_settings_setting_key_unique` (`setting_key`),
  ADD KEY `idx_system_settings_updated_by_user_id` (`updated_by_user_id`);

--
-- Indexes for table `system_users`
--
ALTER TABLE `system_users`
  ADD PRIMARY KEY (`system_user_id`),
  ADD UNIQUE KEY `system_users_username_unique` (`username`),
  ADD UNIQUE KEY `system_users_email_unique` (`email`),
  ADD UNIQUE KEY `system_users_employee_id_unique` (`employee_id`),
  ADD KEY `idx_system_users_role_id` (`role_id`),
  ADD KEY `idx_system_users_status` (`status`);

--
-- Indexes for table `user_login_activity`
--
ALTER TABLE `user_login_activity`
  ADD PRIMARY KEY (`login_activity_id`),
  ADD KEY `idx_user_login_activity_system_user_id` (`system_user_id`),
  ADD KEY `idx_user_login_activity_login_at` (`login_at`),
  ADD KEY `idx_user_login_activity_status` (`status`);

--
-- Indexes for table `work_schedules`
--
ALTER TABLE `work_schedules`
  ADD PRIMARY KEY (`work_schedule_id`),
  ADD KEY `idx_work_schedules_employee_id` (`employee_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `announcements`
--
ALTER TABLE `announcements`
  MODIFY `announcement_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `applicants`
--
ALTER TABLE `applicants`
  MODIFY `applicant_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `applicant_assessments`
--
ALTER TABLE `applicant_assessments`
  MODIFY `assessment_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `applicant_documents`
--
ALTER TABLE `applicant_documents`
  MODIFY `applicant_document_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `applicant_screenings`
--
ALTER TABLE `applicant_screenings`
  MODIFY `screening_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `applicant_screening_entities`
--
ALTER TABLE `applicant_screening_entities`
  MODIFY `entity_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT for table `applicant_screening_scores`
--
ALTER TABLE `applicant_screening_scores`
  MODIFY `score_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT for table `assessment_invites`
--
ALTER TABLE `assessment_invites`
  MODIFY `assessment_invite_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `assessment_tests`
--
ALTER TABLE `assessment_tests`
  MODIFY `assessment_test_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `attendance_records`
--
ALTER TABLE `attendance_records`
  MODIFY `attendance_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `audit_log_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=146;

--
-- AUTO_INCREMENT for table `chatbot_faqs`
--
ALTER TABLE `chatbot_faqs`
  MODIFY `faq_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `chatbot_messages`
--
ALTER TABLE `chatbot_messages`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `chatbot_unanswered`
--
ALTER TABLE `chatbot_unanswered`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `checklist_requests`
--
ALTER TABLE `checklist_requests`
  MODIFY `checklist_request_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `departments`
--
ALTER TABLE `departments`
  MODIFY `department_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `employees`
--
ALTER TABLE `employees`
  MODIFY `employee_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT for table `employee_benefits`
--
ALTER TABLE `employee_benefits`
  MODIFY `employee_benefit_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `employee_documents`
--
ALTER TABLE `employee_documents`
  MODIFY `document_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `employee_emergency_contacts`
--
ALTER TABLE `employee_emergency_contacts`
  MODIFY `emergency_contact_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `employee_exit_records`
--
ALTER TABLE `employee_exit_records`
  MODIFY `exit_record_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `employee_learning`
--
ALTER TABLE `employee_learning`
  MODIFY `employee_learning_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `employee_onboarding_items`
--
ALTER TABLE `employee_onboarding_items`
  MODIFY `employee_onboarding_item_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=75;

--
-- AUTO_INCREMENT for table `employee_position_history`
--
ALTER TABLE `employee_position_history`
  MODIFY `position_history_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT for table `ess_categories`
--
ALTER TABLE `ess_categories`
  MODIFY `ess_category_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `ess_requests`
--
ALTER TABLE `ess_requests`
  MODIFY `ess_request_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `facilities`
--
ALTER TABLE `facilities`
  MODIFY `facility_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `final_evaluations`
--
ALTER TABLE `final_evaluations`
  MODIFY `final_evaluation_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `hr3_recommendations`
--
ALTER TABLE `hr3_recommendations`
  MODIFY `recommendation_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `interviews`
--
ALTER TABLE `interviews`
  MODIFY `interview_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `job_posts`
--
ALTER TABLE `job_posts`
  MODIFY `job_post_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `job_post_platforms`
--
ALTER TABLE `job_post_platforms`
  MODIFY `job_post_platform_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `learning_courses`
--
ALTER TABLE `learning_courses`
  MODIFY `course_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `leave_balances`
--
ALTER TABLE `leave_balances`
  MODIFY `leave_balance_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=88;

--
-- AUTO_INCREMENT for table `new_hires`
--
ALTER TABLE `new_hires`
  MODIFY `new_hire_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `notification_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `onboarding_checklist_items`
--
ALTER TABLE `onboarding_checklist_items`
  MODIFY `template_item_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `onboarding_checklist_templates`
--
ALTER TABLE `onboarding_checklist_templates`
  MODIFY `template_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payroll_items`
--
ALTER TABLE `payroll_items`
  MODIFY `payroll_item_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payroll_periods`
--
ALTER TABLE `payroll_periods`
  MODIFY `payroll_period_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payroll_records`
--
ALTER TABLE `payroll_records`
  MODIFY `payroll_record_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `performance_reviews`
--
ALTER TABLE `performance_reviews`
  MODIFY `performance_review_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=55;

--
-- AUTO_INCREMENT for table `positions`
--
ALTER TABLE `positions`
  MODIFY `position_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `practical_tests`
--
ALTER TABLE `practical_tests`
  MODIFY `practical_test_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `promotion_requests`
--
ALTER TABLE `promotion_requests`
  MODIFY `promotion_request_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `recognition_reactions`
--
ALTER TABLE `recognition_reactions`
  MODIFY `reaction_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `requisitions`
--
ALTER TABLE `requisitions`
  MODIFY `requisition_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `role_permissions`
--
ALTER TABLE `role_permissions`
  MODIFY `role_permission_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `salary_grades`
--
ALTER TABLE `salary_grades`
  MODIFY `salary_grade_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `screening_ground_truths`
--
ALTER TABLE `screening_ground_truths`
  MODIFY `gt_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `screening_reference_data`
--
ALTER TABLE `screening_reference_data`
  MODIFY `ref_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=247;

--
-- AUTO_INCREMENT for table `screening_requirement_templates`
--
ALTER TABLE `screening_requirement_templates`
  MODIFY `template_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `screening_requirement_template_items`
--
ALTER TABLE `screening_requirement_template_items`
  MODIFY `item_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=56;

--
-- AUTO_INCREMENT for table `social_recognitions`
--
ALTER TABLE `social_recognitions`
  MODIFY `recognition_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `system_roles`
--
ALTER TABLE `system_roles`
  MODIFY `role_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `system_settings`
--
ALTER TABLE `system_settings`
  MODIFY `setting_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `system_users`
--
ALTER TABLE `system_users`
  MODIFY `system_user_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `user_login_activity`
--
ALTER TABLE `user_login_activity`
  MODIFY `login_activity_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=63;

--
-- AUTO_INCREMENT for table `work_schedules`
--
ALTER TABLE `work_schedules`
  MODIFY `work_schedule_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

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
  ADD CONSTRAINT `fk_ess_requests_employee_id` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`);

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
