-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 24, 2026 at 04:36 PM
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
CREATE DATABASE IF NOT EXISTS `hotel_hr` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `hotel_hr`;

-- --------------------------------------------------------

--
-- Table structure for table `announcements`
--

CREATE TABLE IF NOT EXISTS `announcements` (
  `announcement_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `published_date` date NOT NULL,
  `title` varchar(200) NOT NULL,
  `body` text NOT NULL,
  `audience` varchar(20) NOT NULL DEFAULT 'All',
  `created_by_user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'published',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`announcement_id`),
  KEY `idx_announcements_created_by_user_id` (`created_by_user_id`),
  KEY `idx_announcements_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `announcements`
--

INSERT INTO `announcements` (`announcement_id`, `published_date`, `title`, `body`, `audience`, `created_by_user_id`, `status`, `created_at`, `updated_at`) VALUES
(1, '2026-05-24', 'Job Fair: Hotel & Restaurant Careers Day', 'Walk-in interviews for Front Office, F&B, and Kitchen roles at the Grand Ballroom.', 'All', 1, 'published', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(2, '2026-05-18', 'TESDA Certification Sponsorship', 'Oxford Suites now sponsors NC II certification for qualified regular employees.', 'All', 1, 'published', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(3, '2026-05-02', 'Service Excellence Awards 2026', 'Congratulations to Front Office for the highest guest satisfaction score this quarter.', 'All', 1, 'published', '2026-08-17 17:41:34', '2026-08-17 17:41:34');

-- --------------------------------------------------------

--
-- Table structure for table `applicants`
--

CREATE TABLE IF NOT EXISTS `applicants` (
  `applicant_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
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
  `summary` text DEFAULT NULL,
  `flags_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`flags_json`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`applicant_id`),
  UNIQUE KEY `uq_applicants_applicant_code` (`applicant_code`),
  KEY `fk_applicants_job_post_id` (`job_post_id`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `applicants`
--

INSERT INTO `applicants` (`applicant_id`, `applicant_code`, `job_post_id`, `name`, `email`, `phone`, `applied_at`, `fit_score`, `status`, `stage`, `source`, `resume_file_path`, `summary`, `flags_json`, `created_at`, `updated_at`) VALUES
(1, 'APP-1032', 1, 'Camille Ortega', 'camille.ortega@email.com', '0917 664 2219', '2026-07-21 23:47:00', 93.00, 'fit', 'Hired', 'Referral', '/uploads/resumes/camille_ortega_resume.pdf', 'Referred by Front Office Manager; completed practical assessment with 94%.', '[]', '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(2, 'APP-1033', 6, 'Juan De La Cruz', 'juan.delacruz@email.com', '0912 345 6789', '2026-07-22 17:31:00', 76.00, 'fit', 'Interview Scheduled', 'Indeed', '/uploads/resumes/juan_delacruz_resume.pdf', 'Agency recruitment coordinator transitioning to in-house HR.', '[]', '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(3, 'APP-1034', 3, 'Mark Reyes', 'mark.reyes@email.com', '0908 441 2277', '2026-07-23 19:05:00', 69.00, 'other-role', 'Screened', 'Walk-in', '/uploads/resumes/mark_reyes_resume.pdf', 'Building maintenance background; endorse to Facilities vacancy.', '[\"Stronger match: Facilities Maintenance (81%)\"]', '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(4, 'APP-1035', 5, 'Jompaks Berdugo', 'jompaks.berdugo@email.com', '0933 552 1180', '2026-07-23 22:22:00', 84.00, 'fit', 'Hired', 'Facebook', '/uploads/resumes/jompaks_berdugo_resume.pdf', 'Rooftop bar experience with strong signature-cocktail portfolio.', '[]', '2026-08-17 00:31:34', '2026-08-18 03:54:56'),
(5, 'APP-1036', 2, 'Kevin Dela Cruz', 'kevin.delacruz@email.com', '0921 774 9903', '2026-07-24 00:48:00', 91.00, 'fit', 'Offer', 'Online Portal', '/uploads/resumes/kevin_delacruz_resume.pdf', 'Certified cook with four years hot-kitchen experience across two hotel outlets.', '[]', '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(6, 'APP-1037', 2, 'Elena Torres', 'elena.torres@email.com', '0918 220 3341', '2026-07-25 03:02:00', 22.00, 'not-fit', 'Rejected', 'Online Portal', '/uploads/resumes/elena_torres_resume.pdf', 'Clerical background with no hospitality or culinary entities detected.', '[\"No culinary certification\",\"No kitchen experience detected\"]', '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(7, 'APP-1038', 3, 'Princess Mabangis', 'princess.mabangis@email', '0912 345', '2026-07-25 04:10:00', 58.00, 'credential', 'Screened', 'Walk-in', '/uploads/resumes/princess_mabangis_resume.pdf', 'Relevant housekeeping experience but contact details failed NER validation.', '[\"Malformed email address\",\"Incomplete phone number\",\"Job position typo on application form\"]', '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(8, 'APP-1039', 1, 'Kanor Ornak', 'kanor.ornak@email.com', '0905 118 7742', '2026-07-25 05:12:00', 74.00, 'other-role', 'Screened', 'Indeed', '/uploads/resumes/kanor_ornak_resume.pdf', 'Retail and cafe service background; better aligned to F&B service roles.', '[\"Stronger match: Restaurant Server (86%)\"]', '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(9, 'APP-1040', 4, 'Marjun Devera', 'marjun.devera@email.com', '0917 664 2219', '2026-07-25 06:40:00', 88.00, 'fit', 'Accepted', 'Referral', '/uploads/resumes/marjun_devera_resume.pdf', 'Strong dining-room service background with banquet exposure.', '[]', '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(10, 'APP-1041', 1, 'Bianca Soriano', 'bianca.soriano@email.com', '0912 345 6789', '2026-07-25 07:15:00', 96.00, 'fit', 'Interview Scheduled', 'Online Portal', '/uploads/resumes/bianca_soriano_resume.pdf', 'Three years front office experience at a 4-star property, PMS proficient, complete credentials.', '[]', '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(15, 'APL-01042', 1, 'juan', 'juan@gmail.com', '0912312300', '2026-08-18 11:55:43', 92.00, 'fit', 'Interview Scheduled', 'Online Portal', 'resumes/uQMocQfpx2nSlMO6oXThxQGf7HMS7KgGvf2257pJ.pdf', 'Added via document screening — GE.pdf.', NULL, '2026-08-18 03:55:43', '2026-08-18 04:04:08'),
(16, 'APL-01043', 1, 'im1', 'im1@gmail.com', '0912312300', '2026-08-18 12:03:17', 80.00, 'fit', 'Offer', 'Walk-in', 'resumes/wOSR1iTpehXQSrBS4GedkAGjzkHM6ag19Md6bHSM.png', 'Added via image (OCR) screening — war.png.', NULL, '2026-08-18 04:03:17', '2026-08-18 09:51:00'),
(17, 'APL-01044', 1, 'ADMIN-file1', 'ADMIN-file1@gmail.com', '0912312300', '2026-08-18 13:33:35', 95.00, 'fit', 'Interview Scheduled', 'Online Portal', 'resumes/6e1gYz92oDu5oO4730OMhtf5wHiImdyDp1m0i9ue.pdf', 'Added via document screening — cover (1).pdf.', NULL, '2026-08-18 05:33:35', '2026-08-18 05:41:23'),
(18, 'APL-01045', 1, 'ADMIN-img1', 'ADMIN-img1@gmail.com', '0912312300', '2026-08-18 13:37:20', 95.00, 'fit', 'Accepted', 'Walk-in', 'resumes/4uKxNaMBDt9Q64H18l3Uc87qerI5b1Au45E3JUoQ.jpg', 'Added via image (OCR) screening — e731c965-945f-48cb-9f96-8efa53a49cfefile_2865782.jpg.', NULL, '2026-08-18 05:37:20', '2026-08-18 05:40:13'),
(19, 'APL-01046', 1, 'ADMIN-img2', 'ADMIN-img2@gmail.com', '0912312300', '2026-08-18 13:49:54', 80.00, 'fit', 'Offer', 'Walk-in', 'resumes/wJ9ropYSxjOiGhWP0FbnXN2fDAOLUCBpBrlIpZjL.jpg', 'Added via image (OCR) screening — 356210748_228235520034010_75676984280719317_n.jpg.', NULL, '2026-08-18 05:49:54', '2026-08-18 10:44:38'),
(22, 'APL-01047', 1, 'imga1', 'imga1@gmail.com', '09123123001', '2026-08-18 16:41:50', 92.00, 'fit', 'Offer', 'Walk-in', 'resumes/n79nRKdVawxHI19PJTpWpa8nQwAA3TCJa99VdmQh.jpg', 'Added via image (OCR) screening — e731c965-945f-48cb-9f96-8efa53a49cfefile_2865782.jpg.', '[]', '2026-08-18 08:41:50', '2026-08-18 08:48:26'),
(23, 'APL-01048', 1, 'bcbc', 'bcbc@mga.com', '0912312300', '2026-08-18 16:47:03', 80.00, 'fit', 'Hired', 'Online Portal', 'resumes/dmhkkMKpzNOKty5Epy3XHX7hJZFy1SpCMxiWjzxY.pdf', 'Added via document screening — Handout-TABLE-OF-RULES-OF-INFERENCE (1).pdf.', '[]', '2026-08-18 08:47:03', '2026-08-18 10:43:06'),
(24, 'APL-01049', 1, 'f1', 'f1@gmail.com', '0912312300', '2026-08-18 18:47:16', 80.00, 'fit', 'Accepted', 'Online Portal', 'resumes/ymPioYX9roI8L6MTY8KwTegjgXJDZmKuDTchTc3C.pdf', 'Added via document screening — ulit.pdf.', '[]', '2026-08-18 10:47:16', '2026-08-18 11:29:42'),
(25, 'APL-01050', 1, 'Andrew e', 'hahakdoghahalaman890@gmail.com', '0912332199', '2026-08-22 13:01:19', 87.00, 'fit', 'Screened', 'Walk-in', 'resumes/SeXqrbhLez21NwJ2E2OfLuAjet4MNdMZvVty6YZl.jpg', 'Added via image (OCR) screening — avatar_Luffy_2_7a08f9d75e.jpg.', '[]', '2026-08-22 05:01:19', '2026-08-22 11:29:29'),
(27, 'APL-01051', 5, 'MARIA SANTOS', 'maria.santos@email.com', '0917 555 1234', '2026-08-22 23:51:52', 100.00, 'fit', 'Screened', 'Walk-in', 'resumes/7EcegIBFi8XAPmH3OVZPLp7NX8MmErUEFNMeNmAh.pdf', 'Matched skills: Cash Handling, Guest Relations, Inventory Control, Mixology; Education requirement satisfied; Experience requirement satisfied (5.0 yrs vs 3.0 yrs required); All required certifications matched — meets Bartender requirements.', '[]', '2026-08-22 15:51:52', '2026-08-22 15:51:53'),
(29, 'APL-01052', 1, 'MARIA SANTOS', 'maria.santos@email.com', '0917 555 1234', '2026-08-23 01:09:11', 57.00, 'not-fit', 'Screened', 'Online Portal', 'resumes/Fbgd3ui5d1fWrS8R7ORcZJdkIYK15iCs6lhrFxpg.pdf', 'Experience requirement satisfied (5.0 yrs vs 1.0 yrs required); No certification requirements defined for this role — meets Bartender requirements. No available position achieved the required qualification level.', '[]', '2026-08-22 17:09:11', '2026-08-22 17:09:11'),
(30, 'APL-01053', 6, 'Basil Fawty', 'basilfawty@gmail.com', '0912332188', '2026-08-23 02:31:15', 42.00, 'not-fit', 'Screened', 'Walk-in', 'resumes/ANuF0uAo99kwaoiKAdtaYD68UNtrVt7pUcBa35sz.jpg', 'Education requirement satisfied; No certification requirements defined for this role — meets HR Assistant requirements. No available position achieved the required qualification level.', '[\"Unrecognized skill: TRAVELING i\",\"Missing: email\",\"Missing: phone\"]', '2026-08-22 18:31:15', '2026-08-22 18:31:16'),
(31, 'APL-01054', 1, 'Julian Rivera', 'julian.rivera@email.com', '+1 (555) 342-8891', '2026-08-23 17:50:39', 79.00, 'not-fit', 'Screened', 'Online Portal', 'resumes/Py2cHfJqTJUANHfQs3fmqRPQvuk8tKPA3u5bmyjZ.pdf', 'Matched skills: Customer Service; Education requirement satisfied; Experience requirement satisfied (3.8 yrs vs 1.0 yrs required); No certification requirements defined for this role — meets Bartender requirements. No available position achieved the required qualification level.', '[\"Unrecognized skill: CGarvicea Fyrallancea\",\"Unrecognized skill: Ciiide Stand\",\"Unrecognized skill: Guest Recovery\",\"Unrecognized skill: Hospitality Systems\",\"Unrecognized skill: Manager, First\",\"Unrecognized skill: Office Suite\",\"Unrecognized skill: Oracle Hosp\",\"Unrecognized skill: Professional Certifications\",\"Unrecognized skill: Service Excellence\",\"Unrecognized skill: stay surveys\",\"Unrecognized skill: the Night Audit\",\"Unrecognized job role: Beach,\",\"Unrecognized job role: F&B team\",\"Unrecognized job role: Five-Diamond properties\",\"Unrecognized job role: Front Office Intern\",\"Unrecognized job role: Housekeeping and Engineering\",\"Unrecognized job role: ServSafe Food\",\"Unrecognized job role: The Ritz-Carlton,\",\"Unrecognized job role: Upselling Techniques\"]', '2026-08-23 09:50:39', '2026-08-23 09:50:39');

-- --------------------------------------------------------

--
-- Table structure for table `applicant_assessments`
--

CREATE TABLE IF NOT EXISTS `applicant_assessments` (
  `assessment_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `applicant_id` bigint(20) UNSIGNED NOT NULL,
  `assessor_user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `assessment_date` date NOT NULL,
  `scores_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`scores_json`)),
  `total_score` decimal(5,2) DEFAULT NULL,
  `outcome` varchar(20) NOT NULL,
  `remarks` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`assessment_id`),
  KEY `fk_applicant_assessments_applicant_id` (`applicant_id`),
  KEY `fk_applicant_assessments_assessor_user_id` (`assessor_user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `applicant_assessments`
--

INSERT INTO `applicant_assessments` (`assessment_id`, `applicant_id`, `assessor_user_id`, `assessment_date`, `scores_json`, `total_score`, `outcome`, `remarks`, `created_at`, `updated_at`) VALUES
(1, 1, 2, '2026-07-23', '{\"Guest Service Orientation\":19,\"Communication Skills\":18,\"Technical / Practical Skill\":20,\"Grooming & Professionalism\":18,\"Availability & Flexibility\":19}', 94.00, 'Recommended', 'Practical front desk simulation passed with 94%. Advanced to job offer.', '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(2, 5, 2, '2026-07-26', '{\"Guest Service Orientation\":16,\"Communication Skills\":17,\"Technical / Practical Skill\":18,\"Grooming & Professionalism\":16,\"Availability & Flexibility\":15}', 82.00, 'Recommended', 'Cook test assessment passed; solid knife skills and station timing.', '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(3, 4, 2, '2026-07-27', '{\"Guest Service Orientation\":17,\"Communication Skills\":18,\"Technical / Practical Skill\":19,\"Grooming & Professionalism\":17,\"Availability & Flexibility\":17}', 88.00, 'Recommended', 'Mixology practical assessment passed with 88%.', '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(6, 16, 3, '2026-08-18', '{\"Guest Service Orientation\":4,\"Communication Skills\":4,\"Technical \\/ Practical Skill\":4,\"Grooming & Professionalism\":4,\"Availability & Flexibility\":4}', 80.00, 'Recommended', 'No remarks recorded.', '2026-08-18 04:04:25', '2026-08-18 04:04:25'),
(7, 22, 1, '2026-08-19', '{\"Guest Service Orientation\":5,\"Communication Skills\":4,\"Technical \\/ Practical Skill\":5,\"Grooming & Professionalism\":4,\"Availability & Flexibility\":5}', 92.00, 'Recommended', 'nays', '2026-08-18 08:43:30', '2026-08-18 08:43:30'),
(8, 23, NULL, '2026-08-19', '{\"Guest Service Orientation\":4,\"Communication Skills\":4,\"Technical \\/ Practical Skill\":4,\"Grooming & Professionalism\":4,\"Availability & Flexibility\":4}', 80.00, 'Recommended', 'No remarks recorded.', '2026-08-18 08:47:54', '2026-08-18 08:47:54'),
(9, 19, 4, '2026-08-19', '{\"Guest Service Orientation\":4,\"Communication Skills\":4,\"Technical \\/ Practical Skill\":4,\"Grooming & Professionalism\":4,\"Availability & Flexibility\":4}', 80.00, 'Recommended', 'gw', '2026-08-18 10:43:02', '2026-08-18 10:43:02'),
(10, 24, 5, '2026-08-19', '{\"Guest Service Orientation\":4,\"Communication Skills\":4,\"Technical \\/ Practical Skill\":4,\"Grooming & Professionalism\":4,\"Availability & Flexibility\":4}', 80.00, 'Recommended', 'ggg', '2026-08-18 10:47:57', '2026-08-18 10:47:57');

-- --------------------------------------------------------

--
-- Table structure for table `applicant_screenings`
--

CREATE TABLE IF NOT EXISTS `applicant_screenings` (
  `screening_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `applicant_id` bigint(20) UNSIGNED NOT NULL,
  `job_post_id` bigint(20) UNSIGNED NOT NULL,
  `processing_status` varchar(30) NOT NULL DEFAULT 'PENDING',
  `screening_result` varchar(30) DEFAULT NULL,
  `match_score` decimal(5,2) DEFAULT NULL,
  `score_breakdown_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`score_breakdown_json`)),
  `profile_json` longtext DEFAULT NULL,
  `entities_json` longtext DEFAULT NULL,
  `missing_information_json` longtext DEFAULT NULL,
  `validation_json` longtext DEFAULT NULL,
  `alternative_job_json` longtext DEFAULT NULL,
  `reasons_json` longtext DEFAULT NULL,
  `model_info_json` longtext DEFAULT NULL,
  `error_message` text DEFAULT NULL,
  `processed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  PRIMARY KEY (`screening_id`),
  KEY `idx_applicant_screenings_applicant_id` (`applicant_id`),
  KEY `idx_applicant_screenings_job_post_id` (`job_post_id`),
  KEY `idx_applicant_screenings_processing_status` (`processing_status`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `applicant_screenings`
--

INSERT INTO `applicant_screenings` (`screening_id`, `applicant_id`, `job_post_id`, `processing_status`, `screening_result`, `match_score`, `score_breakdown_json`, `profile_json`, `entities_json`, `missing_information_json`, `validation_json`, `alternative_job_json`, `reasons_json`, `model_info_json`, `error_message`, `processed_at`, `created_at`, `updated_at`) VALUES
(2, 27, 5, 'PROCESSED', 'fit', 100.00, '{\"skills\":{\"weight\":0.4,\"earned\":40,\"max\":40,\"matched_required\":[\"Cash Handling\",\"Guest Relations\",\"Inventory Control\",\"Mixology\"],\"missing_required\":[],\"matched_preferred\":[],\"missing_preferred\":[],\"required_coverage\":1,\"preferred_coverage\":1},\"experience\":{\"weight\":0.3,\"earned\":30,\"max\":30,\"estimated_years\":5,\"min_years_required\":3,\"requirement_met\":true},\"education\":{\"weight\":0.2,\"earned\":20,\"max\":20,\"applicant_highest_level\":[\"Vocational \\/ TESDA Bartending Course\"],\"required_level\":\"Vocational \\/ TESDA\",\"requirement_met\":true},\"certifications\":{\"weight\":0.1,\"earned\":10,\"max\":10,\"matched\":[\"TESDA Bartending NC II\"],\"missing\":[],\"no_requirements\":false}}', '{\"personal_information\":{\"name\":\"MARIA SANTOS\",\"email\":\"maria.santos@email.com\",\"phone\":\"0917 555 1234\"},\"education\":[\"Vocational \\/ TESDA Bartending Course\"],\"work_experience\":[{\"job_title\":\"Bartender\",\"period\":\"Mar 2021 - Present\",\"recognized_role\":true}],\"skills\":[\"Cash Handling\",\"Guest Relations\",\"Inventory Control\",\"Mixology\",\"Responsible Alcohol Service\"],\"certifications\":[\"TESDA Bartending NC II\"],\"estimated_years_experience\":5,\"job_roles\":{\"recognized\":[\"Bartender\"],\"unrecognized\":[]},\"unrecognized_skills\":[]}', '[{\"label\":\"PERSON\",\"value\":\"MARIA SANTOS\",\"source\":\"custom_ner\"},{\"label\":\"EDUCATION\",\"value\":\"Vocational \\/ TESDA Bartending Course\",\"source\":\"custom_ner\"},{\"label\":\"JOB_TITLE\",\"value\":\"Bartender\",\"source\":\"custom_ner\"},{\"label\":\"SKILL\",\"value\":\"Inventory Control\",\"source\":\"custom_ner\"},{\"label\":\"SKILL\",\"value\":\"Mixology\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Guest Relations\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Cash Handling\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Responsible Alcohol Service\",\"source\":\"reference_scan\"},{\"label\":\"CERTIFICATION\",\"value\":\"TESDA Bartending NC II\",\"source\":\"section_rule\"},{\"label\":\"ORGANIZATION\",\"value\":\"Bartender - Sky Lounge BGC\",\"source\":\"spacy_base\"},{\"label\":\"EMAIL\",\"value\":\"maria.santos@email.com\",\"source\":\"regex\"},{\"label\":\"PHONE\",\"value\":\"0917 555 1234\",\"source\":\"regex\"}]', '[]', '{\"missing_information\":[],\"invalid_format\":[],\"skill_analysis\":{\"recognized\":[\"Cash Handling\",\"Guest Relations\",\"Inventory Control\",\"Mixology\",\"Responsible Alcohol Service\"],\"unrecognized\":[]},\"job_role_analysis\":{\"recognized\":[\"Bartender\"],\"unrecognized\":[]},\"credential_analysis\":[{\"required\":\"TESDA Bartending NC II\",\"status\":\"RECOGNIZED\",\"matched_value\":\"TESDA Bartending NC II\"}],\"credential_issues\":[],\"review_flags\":[]}', NULL, '[\"Overall match score 100.0% reached the required threshold of 75.0% for Bartender.\",\"Matched required skills: Cash Handling, Guest Relations, Inventory Control, Mixology.\",\"Education requirement met: True; experience requirement met: True (5.0 yrs vs 3.0 yrs minimum).\"]', '{\"base_model\":\"en_core_web_sm\",\"custom_ner_loaded\":true,\"custom_ner_path\":\"C:\\\\Users\\\\PC\\\\Downloads\\\\Ferdi\\\\4TH_YR\\\\DEV\\\\v4\\\\2nd-repo-for-hrms-backend-\\\\nlp-service\\\\models_spacy\\\\role_specific_ner\"}', NULL, '2026-08-22 15:51:52', '2026-08-22 15:51:52', '2026-08-22 15:51:52'),
(4, 29, 1, 'PROCESSED', 'not-fit', 57.00, '{\"skills\":{\"weight\":0.4,\"earned\":12,\"max\":40,\"matched_required\":[],\"missing_required\":[\"Communication\",\"Customer Service\",\"Hotel Operations\",\"Problem Solving\"],\"matched_preferred\":[],\"missing_preferred\":[],\"required_coverage\":0,\"preferred_coverage\":1},\"experience\":{\"weight\":0.3,\"earned\":30,\"max\":30,\"estimated_years\":5,\"min_years_required\":1,\"requirement_met\":true},\"education\":{\"weight\":0.2,\"earned\":5,\"max\":20,\"applicant_highest_level\":[\"Vocational \\/ TESDA Bartending Course\"],\"required_level\":\"Bachelor\'s Degree\",\"requirement_met\":false},\"certifications\":{\"weight\":0.1,\"earned\":10,\"max\":10,\"matched\":[],\"missing\":[],\"no_requirements\":true}}', '{\"personal_information\":{\"name\":\"MARIA SANTOS\",\"email\":\"maria.santos@email.com\",\"phone\":\"0917 555 1234\"},\"education\":[\"Vocational \\/ TESDA Bartending Course\"],\"work_experience\":[{\"job_title\":\"Bartender\",\"period\":\"Mar 2021 - Present\",\"recognized_role\":true}],\"skills\":[\"Cash Handling\",\"Guest Relations\",\"Inventory Control\",\"Mixology\",\"Responsible Alcohol Service\"],\"certifications\":[\"TESDA Bartending NC II\"],\"estimated_years_experience\":5,\"job_roles\":{\"recognized\":[\"Bartender\"],\"unrecognized\":[]},\"unrecognized_skills\":[]}', '[{\"label\":\"PERSON\",\"value\":\"MARIA SANTOS\",\"source\":\"custom_ner\"},{\"label\":\"EDUCATION\",\"value\":\"Vocational \\/ TESDA Bartending Course\",\"source\":\"custom_ner\"},{\"label\":\"JOB_TITLE\",\"value\":\"Bartender\",\"source\":\"custom_ner\"},{\"label\":\"SKILL\",\"value\":\"Inventory Control\",\"source\":\"custom_ner\"},{\"label\":\"SKILL\",\"value\":\"Mixology\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Guest Relations\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Cash Handling\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Responsible Alcohol Service\",\"source\":\"reference_scan\"},{\"label\":\"CERTIFICATION\",\"value\":\"TESDA Bartending NC II\",\"source\":\"section_rule\"},{\"label\":\"ORGANIZATION\",\"value\":\"Bartender - Sky Lounge BGC\",\"source\":\"spacy_base\"},{\"label\":\"EMAIL\",\"value\":\"maria.santos@email.com\",\"source\":\"regex\"},{\"label\":\"PHONE\",\"value\":\"0917 555 1234\",\"source\":\"regex\"}]', '[]', '{\"missing_information\":[],\"invalid_format\":[],\"skill_analysis\":{\"recognized\":[\"Cash Handling\",\"Guest Relations\",\"Inventory Control\",\"Mixology\",\"Responsible Alcohol Service\"],\"unrecognized\":[]},\"job_role_analysis\":{\"recognized\":[\"Bartender\"],\"unrecognized\":[]},\"credential_analysis\":[],\"credential_issues\":[],\"review_flags\":[]}', NULL, '[\"Education does not meet the requirement of the applied job.\",\"Required-skills coverage 0% is below the 60% minimum. Missing: Communication, Customer Service, Hotel Operations, Problem Solving.\",\"Overall score 57.0% is below the 75.0% threshold.\",\"Alternative job analysis found no eligible open positions.\"]', '{\"base_model\":\"en_core_web_sm\",\"custom_ner_loaded\":true,\"custom_ner_path\":\"C:\\\\Users\\\\PC\\\\Downloads\\\\Ferdi\\\\4TH_YR\\\\DEV\\\\v4\\\\2nd-repo-for-hrms-backend-\\\\nlp-service\\\\models_spacy\\\\role_specific_ner\"}', NULL, '2026-08-22 17:09:11', '2026-08-22 17:09:11', '2026-08-22 17:09:11'),
(5, 30, 6, 'PARTIALLY_PROCESSED', 'not-fit', 42.00, '{\"skills\":{\"weight\":0.4,\"earned\":12,\"max\":40,\"matched_required\":[],\"missing_required\":[\"Confidentiality\",\"MS Office\",\"Records Documentation\",\"Recruitment Support\"],\"matched_preferred\":[],\"missing_preferred\":[],\"required_coverage\":0,\"preferred_coverage\":1},\"experience\":{\"weight\":0.3,\"earned\":0,\"max\":30,\"estimated_years\":0,\"min_years_required\":1,\"requirement_met\":false},\"education\":{\"weight\":0.2,\"earned\":20,\"max\":20,\"applicant_highest_level\":[\"Bachelor\'s in Hospitality Management\"],\"required_level\":\"Bachelor\'s Degree\",\"requirement_met\":true},\"certifications\":{\"weight\":0.1,\"earned\":10,\"max\":10,\"matched\":[],\"missing\":[],\"no_requirements\":true}}', '{\"personal_information\":{\"name\":\"HosPIALTY MANAGER\",\"email\":null,\"phone\":null},\"education\":[\"Bachelor\'s in Hospitality Management\"],\"work_experience\":[],\"skills\":[\"Plating\"],\"certifications\":[],\"estimated_years_experience\":0,\"job_roles\":{\"recognized\":[],\"unrecognized\":[]},\"unrecognized_skills\":[\"TRAVELING i\"]}', '[{\"label\":\"PERSON\",\"value\":\"HosPIALTY MANAGER\",\"source\":\"custom_ner\"},{\"label\":\"EDUCATION\",\"value\":\"Bachelor\'s in Hospitality Management\",\"source\":\"custom_ner\"},{\"label\":\"SKILL\",\"value\":\"TRAVELING i\",\"source\":\"custom_ner\"},{\"label\":\"SKILL\",\"value\":\"Plating\",\"source\":\"reference_scan\"},{\"label\":\"ORGANIZATION\",\"value\":\"Hecdhlas GOURMET NIGHT @ Restaurant\",\"source\":\"spacy_base\"}]', '[\"email\",\"phone\"]', '{\"missing_information\":[\"email\",\"phone\"],\"invalid_format\":[],\"skill_analysis\":{\"recognized\":[\"Plating\"],\"unrecognized\":[\"TRAVELING i\"]},\"job_role_analysis\":{\"recognized\":[],\"unrecognized\":[]},\"credential_analysis\":[],\"credential_issues\":[],\"review_flags\":[]}', NULL, '[\"Estimated experience 0.0 yrs is below the 1.0 yrs minimum.\",\"Required-skills coverage 0% is below the 60% minimum. Missing: Confidentiality, MS Office, Records Documentation, Recruitment Support.\",\"Essential information missing: email, phone.\",\"Overall score 42.0% is below the 75.0% threshold.\",\"Alternative job analysis: highest-scoring open position \'Bartender\' reached only 42.0%, below the 75.0% recommendation threshold.\"]', '{\"base_model\":\"en_core_web_sm\",\"custom_ner_loaded\":true,\"custom_ner_path\":\"C:\\\\Users\\\\PC\\\\Downloads\\\\Ferdi\\\\4TH_YR\\\\DEV\\\\v4\\\\2nd-repo-for-hrms-backend-\\\\nlp-service\\\\models_spacy\\\\role_specific_ner\"}', NULL, '2026-08-22 18:31:15', '2026-08-22 18:31:15', '2026-08-22 18:31:15'),
(6, 31, 1, 'PARTIALLY_PROCESSED', 'not-fit', 79.00, '{\"skills\":{\"weight\":0.4,\"earned\":19,\"max\":40,\"matched_required\":[\"Customer Service\"],\"missing_required\":[\"Communication\",\"Hotel Operations\",\"Problem Solving\"],\"matched_preferred\":[],\"missing_preferred\":[],\"required_coverage\":0.25,\"preferred_coverage\":1},\"experience\":{\"weight\":0.3,\"earned\":30,\"max\":30,\"estimated_years\":3.8,\"min_years_required\":1,\"requirement_met\":true},\"education\":{\"weight\":0.2,\"earned\":20,\"max\":20,\"applicant_highest_level\":[\"Bachelor of\",\"Florida International University\",\"Bachelor of Science in Hospitality Management\"],\"required_level\":\"Bachelor\'s Degree\",\"requirement_met\":true},\"certifications\":{\"weight\":0.1,\"earned\":10,\"max\":10,\"matched\":[],\"missing\":[],\"no_requirements\":true}}', '{\"personal_information\":{\"name\":\"Julian Rivera\",\"email\":\"julian.rivera@email.com\",\"phone\":\"1 (655) 342-8891\"},\"education\":[\"Bachelor of\",\"Florida International University\",\"Bachelor of Science in Hospitality Management\",\"Hospitality Management\"],\"work_experience\":[],\"skills\":[\"Cash Handling\",\"Check-in \\/ Check-out\",\"Customer Service\",\"Front Office Operations\",\"Guest Relations\",\"Housekeeping Operations\",\"MS Office\",\"Property Management Systems\",\"Reservations\",\"Upselling\"],\"certifications\":[],\"estimated_years_experience\":3.8,\"job_roles\":{\"recognized\":[],\"unrecognized\":[\"Beach,\",\"F&B team\",\"Five-Diamond properties\",\"Front Office Intern\",\"Housekeeping and Engineering\",\"ServSafe Food\",\"The Ritz-Carlton,\",\"Upselling Techniques\"]},\"unrecognized_skills\":[\"CGarvicea Fyrallancea\",\"Ciiide Stand\",\"Guest Recovery\",\"Hospitality Systems\",\"Manager, First\",\"Office Suite\",\"Oracle Hosp\",\"Professional Certifications\",\"Service Excellence\",\"stay surveys\",\"the Night Audit\"]}', '[{\"label\":\"PERSON\",\"value\":\"Julian Rivera\",\"source\":\"custom_ner\"},{\"label\":\"EDUCATION\",\"value\":\"Bachelor of\",\"source\":\"custom_ner\"},{\"label\":\"EDUCATION\",\"value\":\"Florida International University\",\"source\":\"custom_ner\"},{\"label\":\"EDUCATION\",\"value\":\"Bachelor of Science in Hospitality Management\",\"source\":\"section_rule\"},{\"label\":\"EDUCATION\",\"value\":\"Hospitality Management\",\"source\":\"section_rule\"},{\"label\":\"JOB_TITLE\",\"value\":\"Five-Diamond properties\",\"source\":\"custom_ner\"},{\"label\":\"JOB_TITLE\",\"value\":\"Front Office Intern\",\"source\":\"custom_ner\"},{\"label\":\"JOB_TITLE\",\"value\":\"The Ritz-Carlton,\",\"source\":\"custom_ner\"},{\"label\":\"JOB_TITLE\",\"value\":\"Beach,\",\"source\":\"custom_ner\"},{\"label\":\"JOB_TITLE\",\"value\":\"Housekeeping and Engineering\",\"source\":\"custom_ner\"},{\"label\":\"JOB_TITLE\",\"value\":\"F&B team\",\"source\":\"custom_ner\"},{\"label\":\"JOB_TITLE\",\"value\":\"Upselling Techniques\",\"source\":\"custom_ner\"},{\"label\":\"JOB_TITLE\",\"value\":\"ServSafe Food\",\"source\":\"custom_ner\"},{\"label\":\"SKILL\",\"value\":\"Front Office Operations\",\"source\":\"custom_ner\"},{\"label\":\"SKILL\",\"value\":\"the Night Audit\",\"source\":\"custom_ner\"},{\"label\":\"SKILL\",\"value\":\"Property Management Systems\",\"source\":\"custom_ner\"},{\"label\":\"SKILL\",\"value\":\"Reservations\",\"source\":\"custom_ner\"},{\"label\":\"SKILL\",\"value\":\"stay surveys\",\"source\":\"custom_ner\"},{\"label\":\"SKILL\",\"value\":\"Oracle Hosp\",\"source\":\"custom_ner\"},{\"label\":\"SKILL\",\"value\":\"MS Office\",\"source\":\"custom_ner\"},{\"label\":\"SKILL\",\"value\":\"CGarvicea Fyrallancea\",\"source\":\"custom_ner\"},{\"label\":\"SKILL\",\"value\":\"Ciiide Stand\",\"source\":\"custom_ner\"},{\"label\":\"SKILL\",\"value\":\"Office Suite\",\"source\":\"custom_ner\"},{\"label\":\"SKILL\",\"value\":\"Service Excellence\",\"source\":\"custom_ner\"},{\"label\":\"SKILL\",\"value\":\"Guest Recovery\",\"source\":\"custom_ner\"},{\"label\":\"SKILL\",\"value\":\"Professional Certifications\",\"source\":\"custom_ner\"},{\"label\":\"SKILL\",\"value\":\"Hospitality Systems\",\"source\":\"custom_ner\"},{\"label\":\"SKILL\",\"value\":\"Manager, First\",\"source\":\"custom_ner\"},{\"label\":\"SKILL\",\"value\":\"Upselling\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Customer Service\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Guest Relations\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Check-in \\/ Check-out\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Cash Handling\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Housekeeping Operations\",\"source\":\"reference_scan\"},{\"label\":\"ORGANIZATION\",\"value\":\"Biltmore Hotel\",\"source\":\"spacy_base\"},{\"label\":\"EMAIL\",\"value\":\"julian.rivera@email.com\",\"source\":\"regex\"},{\"label\":\"PHONE\",\"value\":\"1 (655) 342-8891\",\"source\":\"regex\"}]', '[]', '{\"missing_information\":[],\"invalid_format\":[],\"skill_analysis\":{\"recognized\":[\"Cash Handling\",\"Check-in \\/ Check-out\",\"Customer Service\",\"Front Office Operations\",\"Guest Relations\",\"Housekeeping Operations\",\"MS Office\",\"Property Management Systems\",\"Reservations\",\"Upselling\"],\"unrecognized\":[\"CGarvicea Fyrallancea\",\"Ciiide Stand\",\"Guest Recovery\",\"Hospitality Systems\",\"Manager, First\",\"Office Suite\",\"Oracle Hosp\",\"Professional Certifications\",\"Service Excellence\",\"stay surveys\",\"the Night Audit\"]},\"job_role_analysis\":{\"recognized\":[],\"unrecognized\":[\"Beach,\",\"F&B team\",\"Five-Diamond properties\",\"Front Office Intern\",\"Housekeeping and Engineering\",\"ServSafe Food\",\"The Ritz-Carlton,\",\"Upselling Techniques\"]},\"credential_analysis\":[],\"credential_issues\":[],\"review_flags\":[{\"type\":\"UNRECOGNIZED_JOB_ROLE\",\"detail\":\"Beach,\",\"note\":\"Not found in system reference data; flagged for manual review only.\"},{\"type\":\"UNRECOGNIZED_JOB_ROLE\",\"detail\":\"F&B team\",\"note\":\"Not found in system reference data; flagged for manual review only.\"},{\"type\":\"UNRECOGNIZED_JOB_ROLE\",\"detail\":\"Five-Diamond properties\",\"note\":\"Not found in system reference data; flagged for manual review only.\"},{\"type\":\"UNRECOGNIZED_JOB_ROLE\",\"detail\":\"Front Office Intern\",\"note\":\"Not found in system reference data; flagged for manual review only.\"},{\"type\":\"UNRECOGNIZED_JOB_ROLE\",\"detail\":\"Housekeeping and Engineering\",\"note\":\"Not found in system reference data; flagged for manual review only.\"},{\"type\":\"UNRECOGNIZED_JOB_ROLE\",\"detail\":\"ServSafe Food\",\"note\":\"Not found in system reference data; flagged for manual review only.\"},{\"type\":\"UNRECOGNIZED_JOB_ROLE\",\"detail\":\"The Ritz-Carlton,\",\"note\":\"Not found in system reference data; flagged for manual review only.\"},{\"type\":\"UNRECOGNIZED_JOB_ROLE\",\"detail\":\"Upselling Techniques\",\"note\":\"Not found in system reference data; flagged for manual review only.\"}]}', NULL, '[\"Required-skills coverage 25% is below the 60% minimum. Missing: Communication, Hotel Operations, Problem Solving.\",\"Alternative job analysis found no eligible open positions.\"]', '{\"base_model\":\"en_core_web_sm\",\"custom_ner_loaded\":true,\"custom_ner_path\":\"C:\\\\Users\\\\PC\\\\Downloads\\\\Ferdi\\\\4TH_YR\\\\DEV\\\\v4\\\\2nd-repo-for-hrms-backend-LATEST\\\\2nd-repo-for-hrms-backend-\\\\nlp-service\\\\models_spacy\\\\role_specific_ner\"}', NULL, '2026-08-23 09:50:39', '2026-08-23 09:50:39', '2026-08-23 09:50:39');

-- --------------------------------------------------------

--
-- Table structure for table `applicant_screening_entities`
--

CREATE TABLE IF NOT EXISTS `applicant_screening_entities` (
  `entity_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `applicant_id` bigint(20) UNSIGNED NOT NULL,
  `label` varchar(80) NOT NULL,
  `value` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`entity_id`),
  KEY `fk_applicant_screening_entities_applicant_id` (`applicant_id`)
) ENGINE=InnoDB AUTO_INCREMENT=118 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `applicant_screening_entities`
--

INSERT INTO `applicant_screening_entities` (`entity_id`, `applicant_id`, `label`, `value`, `created_at`) VALUES
(1, 1, 'SKILL', 'Guest Relations', '2026-08-17 00:31:34'),
(2, 1, 'CERT', 'TESDA Front Office NC II', '2026-08-17 00:31:34'),
(3, 1, 'EDU', 'BS Tourism', '2026-08-17 00:31:34'),
(4, 2, 'SKILL', 'Recruitment', '2026-08-17 00:31:34'),
(5, 2, 'EDU', 'BS Psychology', '2026-08-17 00:31:34'),
(6, 2, 'ORG', 'Metro Staffing', '2026-08-17 00:31:34'),
(7, 3, 'SKILL', 'Maintenance', '2026-08-17 00:31:34'),
(8, 3, 'SKILL', 'Laundry Operations', '2026-08-17 00:31:34'),
(9, 4, 'SKILL', 'Mixology', '2026-08-17 00:31:34'),
(10, 4, 'CERT', 'TESDA Bartending NC II', '2026-08-17 00:31:34'),
(11, 4, 'ORG', 'Sky Lounge BGC', '2026-08-17 00:31:34'),
(12, 5, 'SKILL', 'Hot Kitchen', '2026-08-17 00:31:34'),
(13, 5, 'CERT', 'TESDA Cookery NC II', '2026-08-17 00:31:34'),
(14, 5, 'CERT', 'Food Handler', '2026-08-17 00:31:34'),
(15, 5, 'ORG', 'Seaside Grill', '2026-08-17 00:31:34'),
(16, 6, 'SKILL', 'Data Entry', '2026-08-17 00:31:34'),
(17, 6, 'EDU', 'BS Accountancy', '2026-08-17 00:31:34'),
(18, 7, 'SKILL', 'Room Turnover', '2026-08-17 00:31:34'),
(19, 7, 'ORG', 'Sunrise Inn', '2026-08-17 00:31:34'),
(20, 8, 'SKILL', 'Cash Handling', '2026-08-17 00:31:34'),
(21, 8, 'SKILL', 'Inventory', '2026-08-17 00:31:34'),
(22, 8, 'ORG', 'Cafe Verde', '2026-08-17 00:31:34'),
(23, 8, 'EDU', 'College Level', '2026-08-17 00:31:34'),
(24, 9, 'SKILL', 'Table Service', '2026-08-17 00:31:34'),
(25, 9, 'SKILL', 'POS Systems', '2026-08-17 00:31:34'),
(26, 9, 'ORG', 'Bistro Manila', '2026-08-17 00:31:34'),
(27, 9, 'EDU', 'HRM Vocational', '2026-08-17 00:31:34'),
(28, 10, 'SKILL', 'Guest Relations', '2026-08-17 00:31:34'),
(29, 10, 'SKILL', 'Opera PMS', '2026-08-17 00:31:34'),
(30, 10, 'ORG', 'Grand Horizon Hotel', '2026-08-17 00:31:34'),
(31, 10, 'EDU', 'BS Hospitality Management', '2026-08-17 00:31:34'),
(32, 10, 'CERT', 'TESDA Front Office NC II', '2026-08-17 00:31:34'),
(52, 27, 'PERSON', 'MARIA SANTOS', '2026-08-22 23:51:52'),
(53, 27, 'EDUCATION', 'Vocational / TESDA Bartending Course', '2026-08-22 23:51:52'),
(54, 27, 'JOB_TITLE', 'Bartender', '2026-08-22 23:51:52'),
(55, 27, 'SKILL', 'Inventory Control', '2026-08-22 23:51:52'),
(56, 27, 'SKILL', 'Mixology', '2026-08-22 23:51:52'),
(57, 27, 'SKILL', 'Guest Relations', '2026-08-22 23:51:52'),
(58, 27, 'SKILL', 'Cash Handling', '2026-08-22 23:51:52'),
(59, 27, 'SKILL', 'Responsible Alcohol Service', '2026-08-22 23:51:52'),
(60, 27, 'CERTIFICATION', 'TESDA Bartending NC II', '2026-08-22 23:51:52'),
(61, 27, 'ORGANIZATION', 'Bartender - Sky Lounge BGC', '2026-08-22 23:51:52'),
(62, 27, 'EMAIL', 'maria.santos@email.com', '2026-08-22 23:51:52'),
(63, 27, 'PHONE', '0917 555 1234', '2026-08-22 23:51:52'),
(64, 29, 'PERSON', 'MARIA SANTOS', '2026-08-23 01:09:11'),
(65, 29, 'EDUCATION', 'Vocational / TESDA Bartending Course', '2026-08-23 01:09:11'),
(66, 29, 'JOB_TITLE', 'Bartender', '2026-08-23 01:09:11'),
(67, 29, 'SKILL', 'Inventory Control', '2026-08-23 01:09:11'),
(68, 29, 'SKILL', 'Mixology', '2026-08-23 01:09:11'),
(69, 29, 'SKILL', 'Guest Relations', '2026-08-23 01:09:11'),
(70, 29, 'SKILL', 'Cash Handling', '2026-08-23 01:09:11'),
(71, 29, 'SKILL', 'Responsible Alcohol Service', '2026-08-23 01:09:11'),
(72, 29, 'CERTIFICATION', 'TESDA Bartending NC II', '2026-08-23 01:09:11'),
(73, 29, 'ORGANIZATION', 'Bartender - Sky Lounge BGC', '2026-08-23 01:09:11'),
(74, 29, 'EMAIL', 'maria.santos@email.com', '2026-08-23 01:09:11'),
(75, 29, 'PHONE', '0917 555 1234', '2026-08-23 01:09:11'),
(76, 30, 'PERSON', 'HosPIALTY MANAGER', '2026-08-23 02:31:15'),
(77, 30, 'EDUCATION', 'Bachelor\'s in Hospitality Management', '2026-08-23 02:31:15'),
(78, 30, 'SKILL', 'TRAVELING i', '2026-08-23 02:31:15'),
(79, 30, 'SKILL', 'Plating', '2026-08-23 02:31:15'),
(80, 30, 'ORGANIZATION', 'Hecdhlas GOURMET NIGHT @ Restaurant', '2026-08-23 02:31:15'),
(81, 31, 'PERSON', 'Julian Rivera', '2026-08-23 17:50:39'),
(82, 31, 'EDUCATION', 'Bachelor of', '2026-08-23 17:50:39'),
(83, 31, 'EDUCATION', 'Florida International University', '2026-08-23 17:50:39'),
(84, 31, 'EDUCATION', 'Bachelor of Science in Hospitality Management', '2026-08-23 17:50:39'),
(85, 31, 'EDUCATION', 'Hospitality Management', '2026-08-23 17:50:39'),
(86, 31, 'JOB_TITLE', 'Five-Diamond properties', '2026-08-23 17:50:39'),
(87, 31, 'JOB_TITLE', 'Front Office Intern', '2026-08-23 17:50:39'),
(88, 31, 'JOB_TITLE', 'The Ritz-Carlton,', '2026-08-23 17:50:39'),
(89, 31, 'JOB_TITLE', 'Beach,', '2026-08-23 17:50:39'),
(90, 31, 'JOB_TITLE', 'Housekeeping and Engineering', '2026-08-23 17:50:39'),
(91, 31, 'JOB_TITLE', 'F&B team', '2026-08-23 17:50:39'),
(92, 31, 'JOB_TITLE', 'Upselling Techniques', '2026-08-23 17:50:39'),
(93, 31, 'JOB_TITLE', 'ServSafe Food', '2026-08-23 17:50:39'),
(94, 31, 'SKILL', 'Front Office Operations', '2026-08-23 17:50:39'),
(95, 31, 'SKILL', 'the Night Audit', '2026-08-23 17:50:39'),
(96, 31, 'SKILL', 'Property Management Systems', '2026-08-23 17:50:39'),
(97, 31, 'SKILL', 'Reservations', '2026-08-23 17:50:39'),
(98, 31, 'SKILL', 'stay surveys', '2026-08-23 17:50:39'),
(99, 31, 'SKILL', 'Oracle Hosp', '2026-08-23 17:50:39'),
(100, 31, 'SKILL', 'MS Office', '2026-08-23 17:50:39'),
(101, 31, 'SKILL', 'CGarvicea Fyrallancea', '2026-08-23 17:50:39'),
(102, 31, 'SKILL', 'Ciiide Stand', '2026-08-23 17:50:39'),
(103, 31, 'SKILL', 'Office Suite', '2026-08-23 17:50:39'),
(104, 31, 'SKILL', 'Service Excellence', '2026-08-23 17:50:39'),
(105, 31, 'SKILL', 'Guest Recovery', '2026-08-23 17:50:39'),
(106, 31, 'SKILL', 'Professional Certifications', '2026-08-23 17:50:39'),
(107, 31, 'SKILL', 'Hospitality Systems', '2026-08-23 17:50:39'),
(108, 31, 'SKILL', 'Manager, First', '2026-08-23 17:50:39'),
(109, 31, 'SKILL', 'Upselling', '2026-08-23 17:50:39'),
(110, 31, 'SKILL', 'Customer Service', '2026-08-23 17:50:39'),
(111, 31, 'SKILL', 'Guest Relations', '2026-08-23 17:50:39'),
(112, 31, 'SKILL', 'Check-in / Check-out', '2026-08-23 17:50:39'),
(113, 31, 'SKILL', 'Cash Handling', '2026-08-23 17:50:39'),
(114, 31, 'SKILL', 'Housekeeping Operations', '2026-08-23 17:50:39'),
(115, 31, 'ORGANIZATION', 'Biltmore Hotel', '2026-08-23 17:50:39'),
(116, 31, 'EMAIL', 'julian.rivera@email.com', '2026-08-23 17:50:39'),
(117, 31, 'PHONE', '1 (655) 342-8891', '2026-08-23 17:50:39');

-- --------------------------------------------------------

--
-- Table structure for table `applicant_screening_scores`
--

CREATE TABLE IF NOT EXISTS `applicant_screening_scores` (
  `score_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `applicant_id` bigint(20) UNSIGNED NOT NULL,
  `criterion` varchar(120) NOT NULL,
  `score` decimal(5,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`score_id`),
  KEY `fk_applicant_screening_scores_applicant_id` (`applicant_id`)
) ENGINE=InnoDB AUTO_INCREMENT=61 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `applicant_screening_scores`
--

INSERT INTO `applicant_screening_scores` (`score_id`, `applicant_id`, `criterion`, `score`, `created_at`) VALUES
(1, 1, 'Skills', 37.00, '2026-08-17 00:31:34'),
(2, 1, 'Work Experience', 28.00, '2026-08-17 00:31:34'),
(3, 1, 'Educational Background', 19.00, '2026-08-17 00:31:34'),
(4, 1, 'Certifications', 9.00, '2026-08-17 00:31:34'),
(5, 2, 'Skills', 28.00, '2026-08-17 00:31:34'),
(6, 2, 'Work Experience', 23.00, '2026-08-17 00:31:34'),
(7, 2, 'Educational Background', 18.00, '2026-08-17 00:31:34'),
(8, 2, 'Certifications', 7.00, '2026-08-17 00:31:34'),
(9, 3, 'Skills', 24.00, '2026-08-17 00:31:34'),
(10, 3, 'Work Experience', 21.00, '2026-08-17 00:31:34'),
(11, 3, 'Educational Background', 14.00, '2026-08-17 00:31:34'),
(12, 3, 'Certifications', 10.00, '2026-08-17 00:31:34'),
(13, 4, 'Skills', 32.00, '2026-08-17 00:31:34'),
(14, 4, 'Work Experience', 25.00, '2026-08-17 00:31:34'),
(15, 4, 'Educational Background', 17.00, '2026-08-17 00:31:34'),
(16, 4, 'Certifications', 10.00, '2026-08-17 00:31:34'),
(17, 5, 'Skills', 36.00, '2026-08-17 00:31:34'),
(18, 5, 'Work Experience', 27.00, '2026-08-17 00:31:34'),
(19, 5, 'Educational Background', 18.00, '2026-08-17 00:31:34'),
(20, 5, 'Certifications', 10.00, '2026-08-17 00:31:34'),
(21, 6, 'Skills', 8.00, '2026-08-17 00:31:34'),
(22, 6, 'Work Experience', 6.00, '2026-08-17 00:31:34'),
(23, 6, 'Educational Background', 6.00, '2026-08-17 00:31:34'),
(24, 6, 'Certifications', 2.00, '2026-08-17 00:31:34'),
(25, 7, 'Skills', 24.00, '2026-08-17 00:31:34'),
(26, 7, 'Work Experience', 18.00, '2026-08-17 00:31:34'),
(27, 7, 'Educational Background', 10.00, '2026-08-17 00:31:34'),
(28, 7, 'Certifications', 6.00, '2026-08-17 00:31:34'),
(29, 8, 'Skills', 26.00, '2026-08-17 00:31:34'),
(30, 8, 'Work Experience', 22.00, '2026-08-17 00:31:34'),
(31, 8, 'Educational Background', 16.00, '2026-08-17 00:31:34'),
(32, 8, 'Certifications', 10.00, '2026-08-17 00:31:34'),
(33, 9, 'Skills', 34.00, '2026-08-17 00:31:34'),
(34, 9, 'Work Experience', 26.00, '2026-08-17 00:31:34'),
(35, 9, 'Educational Background', 18.00, '2026-08-17 00:31:34'),
(36, 9, 'Certifications', 10.00, '2026-08-17 00:31:34'),
(37, 10, 'Skills', 38.00, '2026-08-17 00:31:34'),
(38, 10, 'Work Experience', 28.00, '2026-08-17 00:31:34'),
(39, 10, 'Educational Background', 20.00, '2026-08-17 00:31:34'),
(40, 10, 'Certifications', 10.00, '2026-08-17 00:31:34'),
(45, 27, 'Skills', 40.00, '2026-08-22 23:51:52'),
(46, 27, 'Experience', 30.00, '2026-08-22 23:51:53'),
(47, 27, 'Education', 20.00, '2026-08-22 23:51:53'),
(48, 27, 'Certifications', 10.00, '2026-08-22 23:51:53'),
(49, 29, 'Skills', 12.00, '2026-08-23 01:09:11'),
(50, 29, 'Experience', 30.00, '2026-08-23 01:09:11'),
(51, 29, 'Education', 5.00, '2026-08-23 01:09:11'),
(52, 29, 'Certifications', 10.00, '2026-08-23 01:09:11'),
(53, 30, 'Skills', 12.00, '2026-08-23 02:31:15'),
(54, 30, 'Experience', 0.00, '2026-08-23 02:31:16'),
(55, 30, 'Education', 20.00, '2026-08-23 02:31:16'),
(56, 30, 'Certifications', 10.00, '2026-08-23 02:31:16'),
(57, 31, 'Skills', 19.00, '2026-08-23 17:50:39'),
(58, 31, 'Experience', 30.00, '2026-08-23 17:50:39'),
(59, 31, 'Education', 20.00, '2026-08-23 17:50:39'),
(60, 31, 'Certifications', 10.00, '2026-08-23 17:50:39');

-- --------------------------------------------------------

--
-- Table structure for table `attendance_records`
--

CREATE TABLE IF NOT EXISTS `attendance_records` (
  `attendance_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
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
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`attendance_id`),
  UNIQUE KEY `uq_attendance_records_natural` (`employee_id`,`work_date`),
  KEY `idx_attendance_records_work_date` (`work_date`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `attendance_records`
--

INSERT INTO `attendance_records` (`attendance_id`, `employee_id`, `work_date`, `time_in`, `time_out`, `break_in`, `break_out`, `hours_worked`, `late_minutes`, `undertime_minutes`, `overtime_hours`, `remark`, `status`, `created_at`, `updated_at`) VALUES
(1, 5, '2026-07-21', '2026-07-20 23:50:00', '2026-07-21 08:30:00', '2026-07-21 04:00:00', '2026-07-21 04:58:00', 8.10, 0, 0, 0.00, 'Present', 'Completed', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(2, 5, '2026-07-22', NULL, NULL, NULL, NULL, 0.00, 0, 0, 0.00, 'Sick Leave', NULL, '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(3, 5, '2026-07-23', '2026-07-22 23:55:00', '2026-07-23 10:40:00', '2026-07-23 04:00:00', '2026-07-23 04:55:00', 10.20, 0, 0, 2.00, 'Overtime 2h', 'Completed', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(4, 5, '2026-07-24', '2026-07-24 00:07:00', '2026-07-24 09:10:00', '2026-07-24 04:05:00', '2026-07-24 04:58:00', 8.50, 7, 0, 0.00, 'Late 7 mins', 'Completed', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(5, 5, '2026-07-25', '2026-07-24 23:48:00', '2026-07-25 08:32:00', '2026-07-25 04:00:00', '2026-07-25 04:58:00', 8.20, 0, 0, 0.00, 'Present', 'Completed', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(6, 6, '2026-07-24', '2026-07-24 01:58:00', '2026-07-24 10:02:00', '2026-07-24 04:00:00', '2026-07-24 04:45:00', 8.10, 0, 0, 0.00, 'Present', 'Completed', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(7, 6, '2026-07-25', '2026-07-25 01:55:00', '2026-07-25 10:05:00', '2026-07-25 04:02:00', '2026-07-25 04:50:00', 8.20, 0, 0, 0.00, 'Present', 'Completed', '2026-08-17 17:41:34', '2026-08-17 17:41:34');

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE IF NOT EXISTS `audit_logs` (
  `audit_log_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
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
  `url` varchar(2048) DEFAULT NULL,
  PRIMARY KEY (`audit_log_id`),
  KEY `fk_audit_logs_system_user_id` (`system_user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=165 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `audit_logs`
--

INSERT INTO `audit_logs` (`audit_log_id`, `system_user_id`, `actor_role`, `actor_department`, `occurred_at`, `action`, `module_name`, `target_type`, `target_id`, `details`, `severity`, `ip_address`, `device_info`, `url`) VALUES
(1, 1, 'Super Admin', 'Administration / HR', '2026-07-25 16:14:00', 'Updated permission matrix for role Admin', 'User Management', 'role', 'Admin', 'Set ESS Management to Approve / Reject Only.', 'Critical', '192.168.10.4', 'Chrome on Windows', NULL),
(2, 2, 'Admin', 'Administration / HR', '2026-07-25 16:02:00', 'Approved leave request LR-2231', 'ESS Management', 'ess_request', 'LR-2231', 'Sick leave approved for 1 day.', 'Info', '192.168.10.22', 'Edge on Windows', NULL),
(3, 3, 'Admin', 'Front Office', '2026-07-25 07:20:00', 'Scheduled interview for APP-1041', 'Applicant Management', 'applicant', 'APP-1041', 'On-site interview booked for 2026-07-28, 09:00 AM.', 'Info', '192.168.10.31', 'Safari on macOS', NULL),
(4, NULL, 'System', 'System', '2026-07-25 06:58:00', 'Resume screening batch completed (14 resumes, NER model v2.3)', 'Applicant Management', 'system', 'batch', 'NER screening pipeline finished.', 'Info', '127.0.0.1', 'Server process', NULL),
(5, 5, 'Employee', 'Food & Beverage', '2026-07-25 04:41:00', 'Failed login attempt (3rd) — account suspended', 'Authentication', 'user', 'USR-005', 'Account auto-suspended after repeated failures.', 'Warning', '10.0.4.101', 'Chrome on Android', NULL),
(6, 1, 'Super Admin', 'Administration / HR', '2026-07-25 01:09:00', 'Deleted job position POS-011 (Seasonal Banquet Server)', 'Core HCM', 'position', 'POS-011', 'Position removed from master.', 'Critical', '192.168.10.4', 'Chrome on Windows', NULL),
(7, 2, 'Admin', 'Administration / HR', '2026-07-24 19:22:00', 'Published job post \'Line Cook\' to Indeed and Facebook', 'Recruitment Management', 'job_post', 'line-cook', 'Publishing platforms updated.', 'Info', '192.168.10.22', 'Edge on Windows', NULL),
(8, 1, 'Super Admin', 'Administration / HR', '2026-07-24 17:15:00', 'Modified password policy to require strong credentials', 'User Management', 'setting', 'password_policy', 'Policy requires 8+ chars, uppercase, number, symbol.', 'Warning', '192.168.10.4', 'Chrome on Windows', NULL),
(9, 3, 'Admin', 'Front Office', '2026-07-24 00:45:00', 'Created new employee record for Camille Ortega', 'Core HCM', 'employee', 'EMP-0004', 'Probationary Guest Relations Officer record created.', 'Info', '192.168.10.31', 'Safari on macOS', NULL),
(10, 2, 'Admin', 'Administration / HR', '2026-07-23 22:10:00', 'Exported monthly HR headcount report to PDF', 'Employee Records', 'report', 'headcount', 'Monthly report exported.', 'Info', '192.168.10.22', 'Edge on Windows', NULL),
(11, 4, 'Employee', 'Kitchen / Culinary', '2026-07-23 18:05:00', 'Submitted shift swap request with Marco Santos', 'ESS Management', 'ess_request', 'SHIFT-SWAP-001', 'Shift swap between kitchen crew.', 'Info', '10.0.4.88', 'Chrome on Android', NULL),
(12, 1, 'Super Admin', 'Administration / HR', '2026-07-23 02:30:00', 'Revoked active session for user mdevera', 'User Management', 'user', 'USR-005', 'All sessions terminated.', 'Critical', '192.168.10.4', 'Chrome on Windows', NULL),
(13, 3, 'Admin', 'Housekeeping', '2026-07-22 23:12:00', 'Updated room attendant onboarding checklist', 'New Hire Onboarding', 'template', 'TPL-002', 'Checklist items adjusted.', 'Info', '192.168.10.31', 'Safari on macOS', NULL),
(14, 2, 'Admin', 'Administration / HR', '2026-07-22 19:00:00', 'Approved overtime request for Front Office team', 'ESS Management', 'ess_request', 'OT-FO-001', 'Overtime for peak season approved.', 'Info', '192.168.10.22', 'Edge on Windows', NULL),
(15, 2, 'Admin', 'Administration / HR', '2026-07-19 17:12:00', 'Applicant Added', 'Screening', 'applicant', 'APP-1032', 'Added via document screening — camille_resume.pdf, scored 93%.', 'Info', '192.168.10.22', 'Edge on Windows', NULL),
(16, 3, 'Admin', 'Front Office', '2026-07-20 18:40:00', 'Interview Booked', 'Interview Scheduling', 'applicant', 'APP-1032', 'On-site interview booked for 2026-07-22, 09:00 AM.', 'Info', '192.168.10.31', 'Safari on macOS', NULL),
(17, 3, 'Admin', 'Front Office', '2026-07-21 17:05:00', 'Interview Completed', 'Interview Scheduling', 'applicant', 'APP-1032', 'Interview marked complete, strong guest-facing presence noted.', 'Info', '192.168.10.31', 'Safari on macOS', NULL),
(18, 2, 'Admin', 'Administration / HR', '2026-07-22 22:15:00', 'Assessment Started', 'Assessment', 'applicant', 'APP-1032', 'Practical front desk simulation started.', 'Info', '192.168.10.22', 'Edge on Windows', NULL),
(19, 2, 'Admin', 'Administration / HR', '2026-07-22 23:40:00', 'Assessment Accepted', 'Assessment', 'applicant', 'APP-1032', 'Assessment score 94% — advanced to job offer.', 'Info', '192.168.10.22', 'Edge on Windows', NULL),
(20, NULL, 'F&B Director', 'Food & Beverage', '2026-07-23 19:00:00', 'Interview Booked', 'Interview Scheduling', 'applicant', 'APP-1035', 'On-site interview booked for 2026-07-29, 04:00 PM.', 'Info', '192.168.10.2', 'Chrome on Windows', NULL),
(21, NULL, 'F&B Director', 'Food & Beverage', '2026-07-23 21:20:00', 'Interview Booked', 'Interview Scheduling', 'applicant', 'APP-1036', 'On-site interview booked for 2026-07-30, 10:00 AM.', 'Info', '192.168.10.2', 'Chrome on Windows', NULL),
(22, 2, 'Admin', 'Administration / HR', '2026-07-24 01:05:00', 'Status Change', 'Screening', 'applicant', 'APP-1034', 'Stage moved to Screened after resume re-check.', 'Info', '192.168.10.22', 'Edge on Windows', NULL),
(23, NULL, 'Executive Housekeeper', 'Housekeeping', '2026-07-24 01:30:00', 'Applicant Transferred', 'Screening', 'applicant', 'APP-1034', 'Flagged as stronger match for Facilities Maintenance.', 'Info', '192.168.10.3', 'Chrome on Windows', NULL),
(24, 2, 'Admin', 'Administration / HR', '2026-07-24 16:50:00', 'Applicant Rejected', 'Screening', 'applicant', 'APP-1037', 'No culinary certification or kitchen experience detected.', 'Info', '192.168.10.22', 'Edge on Windows', NULL),
(25, 2, 'Admin', 'Administration / HR', '2026-07-24 17:35:00', 'Applicant Added', 'Screening', 'applicant', 'APP-1038', 'Added via image (OCR) screening — walk-in resume scan.', 'Info', '192.168.10.22', 'Edge on Windows', NULL),
(26, 2, 'Admin', 'Administration / HR', '2026-07-24 18:15:00', 'Applicant Added', 'Screening', 'applicant', 'APP-1039', 'Added via document screening from Indeed source.', 'Info', '192.168.10.22', 'Edge on Windows', NULL),
(27, 3, 'Admin', 'Front Office', '2026-07-24 19:02:00', 'Applicant Transferred', 'Screening', 'applicant', 'APP-1039', 'Suggested stronger match: Restaurant Server (86%).', 'Info', '192.168.10.31', 'Safari on macOS', NULL),
(28, 2, 'Admin', 'Administration / HR', '2026-07-24 21:48:00', 'Applicant Added', 'Screening', 'applicant', 'APP-1040', 'Added via document screening — referral source.', 'Info', '192.168.10.22', 'Edge on Windows', NULL),
(29, 2, 'Admin', 'Administration / HR', '2026-07-25 00:30:00', 'Applicant Added', 'Screening', 'applicant', 'APP-1041', 'Added via document screening — online portal, scored 96%.', 'Info', '192.168.10.22', 'Edge on Windows', NULL),
(30, 3, 'Admin', 'Front Office', '2026-07-25 17:00:00', 'Interview Booked', 'Interview Scheduling', 'applicant', 'APP-1041', 'On-site interview booked for 2026-07-28, 09:00 AM.', 'Info', '192.168.10.31', 'Safari on macOS', NULL),
(31, 2, 'Admin', 'Administration / HR', '2026-07-25 17:20:00', 'Interview Booked', 'Interview Scheduling', 'applicant', 'APP-1033', 'Virtual interview booked for 2026-07-28, 01:30 PM.', 'Info', '192.168.10.22', 'Edge on Windows', NULL),
(32, NULL, 'F&B Director', 'Food & Beverage', '2026-07-25 18:10:00', 'Interview Completed', 'Interview Scheduling', 'applicant', 'APP-1036', 'Cook test completed, solid knife skills and station timing.', 'Info', '192.168.10.2', 'Chrome on Windows', NULL),
(33, 2, 'Admin', 'Administration / HR', '2026-07-25 18:45:00', 'Assessment Started', 'Assessment', 'applicant', 'APP-1036', 'Practical cook test assessment started.', 'Info', '192.168.10.22', 'Edge on Windows', NULL),
(34, 2, 'Admin', 'Administration / HR', '2026-07-25 19:30:00', 'Assessment Accepted', 'Assessment', 'applicant', 'APP-1036', 'Assessment score 82% — advanced to job offer.', 'Info', '192.168.10.22', 'Edge on Windows', NULL),
(35, NULL, 'F&B Director', 'Food & Beverage', '2026-07-26 22:00:00', 'Assessment Started', 'Assessment', 'applicant', 'APP-1035', 'Mixology practical assessment started.', 'Info', '192.168.10.2', 'Chrome on Windows', NULL),
(36, NULL, 'F&B Director', 'Food & Beverage', '2026-07-26 23:10:00', 'Assessment Accepted', 'Assessment', 'applicant', 'APP-1035', 'Assessment score 88% — advanced to job offer.', 'Info', '192.168.10.2', 'Chrome on Windows', NULL),
(37, 3, 'Admin', 'Front Office', '2026-07-27 17:05:00', 'Interview Completed', 'Interview Scheduling', 'applicant', 'APP-1041', 'Front office simulation completed successfully.', 'Info', '192.168.10.31', 'Safari on macOS', NULL),
(38, 2, 'Admin', 'Administration / HR', '2026-07-27 21:45:00', 'Interview No-Show', 'Interview Scheduling', 'applicant', 'APP-1033', 'Candidate did not join the virtual meeting room.', 'Warning', '192.168.10.22', 'Edge on Windows', NULL),
(39, NULL, 'F&B Director', 'Food & Beverage', '2026-07-29 00:30:00', 'Interview Cancelled', 'Interview Scheduling', 'applicant', 'APP-1035', 'Follow-up panel interview cancelled — role already filled.', 'Info', '192.168.10.2', 'Chrome on Windows', NULL),
(40, NULL, 'System', 'System', '2026-08-21 03:22:40', 'Failed login attempt', 'Authentication', 'user', NULL, 'Invalid credentials supplied.', 'Warning', '127.0.0.1', 'Unknown', 'http://127.0.0.1:8000/api/v1/auth/login'),
(41, 1, 'Super Admin', 'Administration / HR', '2026-08-21 03:23:03', 'Failed login attempt', 'Authentication', 'user', 'bullseur', 'Invalid credentials supplied.', 'Warning', '127.0.0.1', 'Unknown', 'http://127.0.0.1:8000/api/v1/auth/login'),
(42, 1, 'Super Admin', 'Administration / HR', '2026-08-21 03:23:17', 'Failed login attempt', 'Authentication', 'user', 'bullseur', 'Invalid credentials supplied.', 'Warning', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(43, 1, 'Super Admin', 'Administration / HR', '2026-08-21 03:23:25', 'OTP sent', 'Authentication', 'user', 'bullseur', 'One-time password emailed to b******@oxfordsuites.com.ph', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(44, 1, 'Super Admin', 'Administration / HR', '2026-08-21 03:26:36', 'OTP sent', 'Authentication', 'user', 'bullseur', 'One-time password emailed to b******@oxfordsuites.com.ph', 'Info', '127.0.0.1', 'Unknown', 'http://127.0.0.1:8000/api/v1/auth/login'),
(45, 1, 'Super Admin', 'Administration / HR', '2026-08-21 03:26:48', 'OTP sent', 'Authentication', 'user', 'bullseur', 'One-time password emailed to b******@oxfordsuites.com.ph', 'Info', '127.0.0.1', 'Unknown', 'http://127.0.0.1:8000/api/v1/auth/login'),
(46, 1, 'Super Admin', 'Administration / HR', '2026-08-21 03:27:41', 'Failed login attempt', 'Authentication', 'user', 'bullseur', 'Invalid credentials supplied.', 'Warning', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(47, 1, 'Super Admin', 'Administration / HR', '2026-08-21 03:27:46', 'Failed login attempt', 'Authentication', 'user', 'bullseur', 'Invalid credentials supplied.', 'Warning', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(48, 1, 'Super Admin', 'Administration / HR', '2026-08-21 03:27:50', 'Failed login attempt', 'Authentication', 'user', 'bullseur', 'Invalid credentials supplied.', 'Warning', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(49, 1, 'Super Admin', 'Administration / HR', '2026-08-21 03:27:58', 'Failed login attempt', 'Authentication', 'user', 'bullseur', 'Invalid credentials supplied.', 'Warning', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(50, 1, 'Super Admin', 'Administration / HR', '2026-08-21 03:28:11', 'Failed login attempt', 'Authentication', 'user', 'bullseur', 'Invalid credentials supplied.', 'Warning', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(51, 1, 'Super Admin', 'Administration / HR', '2026-08-21 05:01:12', 'Failed login attempt', 'Authentication', 'user', 'bullseur', 'Invalid credentials supplied.', 'Warning', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(52, 1, 'Super Admin', 'Administration / HR', '2026-08-21 05:01:17', 'Failed login attempt', 'Authentication', 'user', 'bullseur', 'Invalid credentials supplied.', 'Warning', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(53, 4, 'Employee', 'Kitchen / Culinary', '2026-08-21 05:01:26', 'Failed login attempt', 'Authentication', 'user', 'kdelacruz', 'Invalid credentials supplied.', 'Warning', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(54, 4, 'Employee', 'Kitchen / Culinary', '2026-08-21 05:01:34', 'OTP sent', 'Authentication', 'user', 'kdelacruz', 'One-time password emailed to k************@oxfordsuites.com.ph', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(55, 1, 'Super Admin', 'Administration / HR', '2026-08-21 05:01:44', 'Failed login attempt', 'Authentication', 'user', 'bullseur', 'Invalid credentials supplied.', 'Warning', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(56, 1, 'Super Admin', 'Administration / HR', '2026-08-21 05:02:57', 'Failed login attempt', 'Authentication', 'user', 'bullseur', 'Invalid credentials supplied.', 'Warning', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(57, 1, 'Super Admin', 'Administration / HR', '2026-08-21 05:03:04', 'Failed login attempt', 'Authentication', 'user', 'bullseur', 'Invalid credentials supplied.', 'Warning', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(58, 1, 'Super Admin', 'Administration / HR', '2026-08-21 05:03:11', 'Failed login attempt', 'Authentication', 'user', 'bullseur', 'Invalid credentials supplied.', 'Warning', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(59, 4, 'Employee', 'Kitchen / Culinary', '2026-08-21 05:03:25', 'Failed login attempt', 'Authentication', 'user', 'kdelacruz', 'Invalid credentials supplied.', 'Warning', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(60, 4, 'Employee', 'Kitchen / Culinary', '2026-08-21 05:03:33', 'OTP sent', 'Authentication', 'user', 'kdelacruz', 'One-time password emailed to k************@oxfordsuites.com.ph', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(61, NULL, 'System', 'System', '2026-08-22 11:29:29', 'Applicant Re-activated', 'Applicant Management', 'Applicant', '25', 'Re-activated applicant Andrew e (APL-01050); stage reset from Rejected to Screened.', 'Info', '127.0.0.1', 'Unknown', 'http://localhost'),
(62, NULL, 'System', 'System', '2026-08-22 11:47:25', 'Failed login attempt', 'Authentication', 'user', NULL, 'Invalid credentials supplied.', 'Warning', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(63, NULL, 'System', 'System', '2026-08-22 11:48:41', 'Failed login attempt', 'Authentication', 'user', NULL, 'Invalid credentials supplied.', 'Warning', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(64, NULL, 'System', 'System', '2026-08-22 11:48:42', 'Failed login attempt', 'Authentication', 'user', NULL, 'Invalid credentials supplied.', 'Warning', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(65, 14, 'Super Admin', 'Administration / HR', '2026-08-22 12:00:30', 'OTP sent', 'Authentication', 'user', 'hahakdog', 'One-time password emailed to h******************@gmail.com', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(66, 14, 'Super Admin', 'Administration / HR', '2026-08-22 12:00:45', 'User logged in', 'Authentication', 'user', 'hahakdog', 'Two-factor login completed.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/otp'),
(67, NULL, 'System', 'System', '2026-08-22 15:48:14', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '5', 'Preview screening scored 100% with status PERFECT_FOR_THE_JOB.', 'Info', '127.0.0.1', 'Unknown', 'http://127.0.0.1:8000/api/v1/applicants/screen-resume'),
(68, NULL, 'System', 'System', '2026-08-22 15:48:31', 'Applicant Screened', 'Applicant Management', 'Applicant', '26', 'spaCy screening for MARIA SANTOS: Perfect for the Job (100.00%), processing status PROCESSED.', 'Info', '127.0.0.1', 'Unknown', 'http://127.0.0.1:8000/api/v1/applicants'),
(69, NULL, 'System', 'System', '2026-08-22 15:48:31', 'Applicant Created', 'Applicant Management', 'Applicant', '26', 'Added new applicant MARIA SANTOS for position ID 5.', 'Info', '127.0.0.1', 'Unknown', 'http://127.0.0.1:8000/api/v1/applicants'),
(70, NULL, 'System', 'System', '2026-08-22 15:51:21', 'Applicant Deleted', 'Applicant Management', 'Applicant', '26', 'Removed applicant record MARIA SANTOS (APL-01051).', 'Warning', '127.0.0.1', 'Unknown', 'http://127.0.0.1:8000/api/v1/applicants/26'),
(71, NULL, 'System', 'System', '2026-08-22 15:51:22', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '5', 'Preview screening scored 100% with status PERFECT_FOR_THE_JOB.', 'Info', '127.0.0.1', 'Unknown', 'http://127.0.0.1:8000/api/v1/applicants/screen-resume'),
(72, NULL, 'System', 'System', '2026-08-22 15:51:53', 'Applicant Screened', 'Applicant Management', 'Applicant', '27', 'spaCy screening for MARIA SANTOS: Perfect for the Job (100.00%), processing status PROCESSED.', 'Info', '127.0.0.1', 'Unknown', 'http://127.0.0.1:8000/api/v1/applicants'),
(73, NULL, 'System', 'System', '2026-08-22 15:51:53', 'Applicant Created', 'Applicant Management', 'Applicant', '27', 'Added new applicant MARIA SANTOS for position ID 5.', 'Info', '127.0.0.1', 'Unknown', 'http://127.0.0.1:8000/api/v1/applicants'),
(74, NULL, 'System', 'System', '2026-08-22 15:54:20', 'Applicant Screened', 'Applicant Management', 'Applicant', '28', 'spaCy screening for TEST PDF OFFLINE: Perfect for the Job (n/a%), processing status FAILED.', 'Warning', '127.0.0.1', 'Unknown', 'http://127.0.0.1:8000/api/v1/applicants'),
(75, NULL, 'System', 'System', '2026-08-22 15:54:20', 'Applicant Created', 'Applicant Management', 'Applicant', '28', 'Added new applicant TEST PDF OFFLINE for position ID 5.', 'Info', '127.0.0.1', 'Unknown', 'http://127.0.0.1:8000/api/v1/applicants'),
(76, 1, 'Super Admin', 'Administration / HR', '2026-08-22 16:55:10', 'OTP sent', 'Authentication', 'user', 'bullseur', 'One-time password emailed to b******@oxfordsuites.com.ph', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(77, 1, 'Super Admin', 'Administration / HR', '2026-08-22 16:56:15', 'User logged in', 'Authentication', 'user', 'bullseur', 'Two-factor login completed.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/otp'),
(78, 1, 'Super Admin', 'Administration / HR', '2026-08-22 17:06:37', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '1', 'Preview screening scored 57% with status FIT_FOR_OTHER_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/superadmin/applicants'),
(79, 1, 'Super Admin', 'Administration / HR', '2026-08-22 17:08:38', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '1', 'Preview screening scored 57% with status NOT_FITTED_TO_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/superadmin/applicants'),
(80, 1, 'Super Admin', 'Administration / HR', '2026-08-22 17:09:11', 'Applicant Screened', 'Applicant Management', 'Applicant', '29', 'spaCy screening for MARIA SANTOS: Not Fitted to Job (57.00%), processing status PROCESSED.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/superadmin/applicants'),
(81, 1, 'Super Admin', 'Administration / HR', '2026-08-22 17:09:11', 'Applicant Created', 'Applicant Management', 'Applicant', '29', 'Added new applicant MARIA SANTOS for position ID 1.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/superadmin/applicants'),
(82, NULL, 'System', 'System', '2026-08-22 17:20:08', 'Screening Ground Truth Recorded', 'Applicant Management', 'Applicant', '27', 'Expert screening label \'fit\' recorded for MARIA SANTOS.', 'Info', '127.0.0.1', 'Unknown', 'http://127.0.0.1:8000/api/v1/applicants/27/ground-truth'),
(83, NULL, 'System', 'System', '2026-08-22 17:20:09', 'Screening Ground Truth Recorded', 'Applicant Management', 'Applicant', '29', 'Expert screening label \'not-fit\' recorded for MARIA SANTOS.', 'Info', '127.0.0.1', 'Unknown', 'http://127.0.0.1:8000/api/v1/applicants/29/ground-truth'),
(84, NULL, 'System', 'System', '2026-08-22 17:20:39', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '5', 'Preview screening failed: NLP service returned HTTP 500: Internal Server Error', 'Warning', '127.0.0.1', 'Unknown', 'http://127.0.0.1:8000/api/v1/applicants/screen-resume'),
(85, NULL, 'System', 'System', '2026-08-22 17:20:39', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '5', 'Preview screening failed: NLP service returned HTTP 422: {\"success\":false,\"processing_status\":\"FAILED\",\"error\":\"No readable text could be extracted from \'empty.txt\'.\",\"file\":{\"name\":\"empty.txt\"}}', 'Warning', '127.0.0.1', 'Unknown', 'http://127.0.0.1:8000/api/v1/applicants/screen-resume'),
(86, NULL, 'System', 'System', '2026-08-22 17:20:40', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '5', 'Preview screening failed: NLP service returned HTTP 422: {\"success\":false,\"processing_status\":\"FAILED\",\"error\":\"Unsupported resume format \'.exe\'. Supported: PDF, DOCX, TXT and common images.\",\"file\":{\"name\":\"fake.exe\"}}', 'Warning', '127.0.0.1', 'Unknown', 'http://127.0.0.1:8000/api/v1/applicants/screen-resume'),
(87, NULL, 'System', 'System', '2026-08-22 17:20:56', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '5', 'Preview screening failed: NLP service returned HTTP 422: {\"success\":false,\"processing_status\":\"FAILED\",\"error\":\"No readable text could be extracted from \'blank.png\'.\",\"file\":{\"name\":\"blank.png\"}}', 'Warning', '127.0.0.1', 'Unknown', 'http://127.0.0.1:8000/api/v1/applicants/screen-resume'),
(88, NULL, 'System', 'System', '2026-08-22 17:22:39', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '5', 'Preview screening failed: NLP service returned HTTP 500: Internal Server Error', 'Warning', '127.0.0.1', 'Unknown', 'http://127.0.0.1:8000/api/v1/applicants/screen-resume'),
(89, NULL, 'System', 'System', '2026-08-22 17:23:14', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '5', 'Preview screening failed: NLP service returned HTTP 500: Internal Server Error', 'Warning', '127.0.0.1', 'Unknown', 'http://127.0.0.1:8000/api/v1/applicants/screen-resume'),
(90, NULL, 'System', 'System', '2026-08-22 17:25:05', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '5', 'Preview screening failed: NLP service returned HTTP 422: {\"success\":false,\"processing_status\":\"FAILED\",\"error\":\"Internal processing error: No \\/Root object! - Is this really a PDF?\",\"file\":[]}', 'Warning', '127.0.0.1', 'Unknown', 'http://127.0.0.1:8000/api/v1/applicants/screen-resume'),
(91, 14, 'Super Admin', 'Administration / HR', '2026-08-22 18:26:38', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '4', 'Preview screening scored 72% with status NOT_FITTED_TO_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/superadmin/applicants'),
(92, 14, 'Super Admin', 'Administration / HR', '2026-08-22 18:28:44', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '3', 'Preview screening scored 72% with status NOT_FITTED_TO_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/superadmin/applicants'),
(93, 14, 'Super Admin', 'Administration / HR', '2026-08-22 18:28:50', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '3', 'Preview screening scored 72% with status NOT_FITTED_TO_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/superadmin/applicants'),
(94, 14, 'Super Admin', 'Administration / HR', '2026-08-22 18:28:52', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '3', 'Preview screening scored 72% with status NOT_FITTED_TO_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/superadmin/applicants'),
(95, 14, 'Super Admin', 'Administration / HR', '2026-08-22 18:28:54', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '3', 'Preview screening scored 72% with status NOT_FITTED_TO_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/superadmin/applicants'),
(96, 14, 'Super Admin', 'Administration / HR', '2026-08-22 18:29:34', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '3', 'Preview screening scored 72% with status NOT_FITTED_TO_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/superadmin/applicants'),
(97, 14, 'Super Admin', 'Administration / HR', '2026-08-22 18:30:35', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '6', 'Preview screening scored 42% with status NOT_FITTED_TO_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/superadmin/applicants'),
(98, 14, 'Super Admin', 'Administration / HR', '2026-08-22 18:30:41', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '6', 'Preview screening scored 42% with status NOT_FITTED_TO_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/superadmin/applicants'),
(99, 14, 'Super Admin', 'Administration / HR', '2026-08-22 18:30:43', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '6', 'Preview screening scored 42% with status NOT_FITTED_TO_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/superadmin/applicants'),
(100, 14, 'Super Admin', 'Administration / HR', '2026-08-22 18:31:16', 'Applicant Screened', 'Applicant Management', 'Applicant', '30', 'spaCy screening for Basil Fawty: Not Fitted to Job (42.00%), processing status PARTIALLY_PROCESSED.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/superadmin/applicants'),
(101, 14, 'Super Admin', 'Administration / HR', '2026-08-22 18:31:16', 'Applicant Created', 'Applicant Management', 'Applicant', '30', 'Added new applicant Basil Fawty for position ID 6.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/superadmin/applicants'),
(102, 14, 'Super Admin', 'Administration / HR', '2026-08-22 18:40:03', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '6', 'Preview screening failed: NLP service returned HTTP 422: {\"success\":false,\"processing_status\":\"FAILED\",\"error\":\"No readable text could be extracted from \'Julian Rivera \\u2014 Guest Services Professional.pdf\'.\",\"file\":{\"name\":\"Julian Rivera \\u2014 Guest Services Professional.pdf\"}}', 'Warning', '127.0.0.1', 'Chrome', 'http://localhost:8080/superadmin/applicants'),
(103, 14, 'Super Admin', 'Administration / HR', '2026-08-22 18:40:07', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '6', 'Preview screening failed: NLP service returned HTTP 422: {\"success\":false,\"processing_status\":\"FAILED\",\"error\":\"No readable text could be extracted from \'Julian Rivera \\u2014 Guest Services Professional.pdf\'.\",\"file\":{\"name\":\"Julian Rivera \\u2014 Guest Services Professional.pdf\"}}', 'Warning', '127.0.0.1', 'Chrome', 'http://localhost:8080/superadmin/applicants'),
(104, 14, 'Super Admin', 'Administration / HR', '2026-08-22 18:44:51', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '6', 'Preview screening failed: NLP service returned HTTP 422: {\"success\":false,\"processing_status\":\"FAILED\",\"error\":\"No readable text could be extracted from \'Julian Rivera \\u2014 Guest Services Professional.pdf\'.\",\"file\":{\"name\":\"Julian Rivera \\u2014 Guest Services Professional.pdf\"}}', 'Warning', '127.0.0.1', 'Chrome', 'http://localhost:8080/superadmin/applicants'),
(105, 14, 'Super Admin', 'Administration / HR', '2026-08-22 18:45:02', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '6', 'Preview screening failed: NLP service returned HTTP 422: {\"success\":false,\"processing_status\":\"FAILED\",\"error\":\"No readable text could be extracted from \'Julian Rivera \\u2014 Guest Services Professional.pdf\'.\",\"file\":{\"name\":\"Julian Rivera \\u2014 Guest Services Professional.pdf\"}}', 'Warning', '127.0.0.1', 'Chrome', 'http://localhost:8080/superadmin/applicants'),
(106, 14, 'Super Admin', 'Administration / HR', '2026-08-22 18:46:04', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '6', 'Preview screening failed: NLP service returned HTTP 422: {\"success\":false,\"processing_status\":\"FAILED\",\"error\":\"No readable text could be extracted from \'Julian Rivera \\u2014 Guest Services Professional.pdf\'.\",\"file\":{\"name\":\"Julian Rivera \\u2014 Guest Services Professional.pdf\"}}', 'Warning', '127.0.0.1', 'Chrome', 'http://localhost:8080/superadmin/applicants'),
(107, 14, 'Super Admin', 'Administration / HR', '2026-08-22 18:48:32', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '6', 'Preview screening failed: NLP service returned HTTP 422: {\"success\":false,\"processing_status\":\"FAILED\",\"error\":\"No readable text could be extracted from \'Julian Rivera \\u2014 Guest Services Professional.pdf\'.\",\"file\":{\"name\":\"Julian Rivera \\u2014 Guest Services Professional.pdf\"}}', 'Warning', '127.0.0.1', 'Chrome', 'http://localhost:8080/superadmin/applicants'),
(108, 14, 'Super Admin', 'Administration / HR', '2026-08-22 18:48:33', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '6', 'Preview screening failed: NLP service returned HTTP 422: {\"success\":false,\"processing_status\":\"FAILED\",\"error\":\"No readable text could be extracted from \'Julian Rivera \\u2014 Guest Services Professional.pdf\'.\",\"file\":{\"name\":\"Julian Rivera \\u2014 Guest Services Professional.pdf\"}}', 'Warning', '127.0.0.1', 'Chrome', 'http://localhost:8080/superadmin/applicants'),
(109, 14, 'Super Admin', 'Administration / HR', '2026-08-22 18:48:34', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '6', 'Preview screening failed: NLP service returned HTTP 422: {\"success\":false,\"processing_status\":\"FAILED\",\"error\":\"No readable text could be extracted from \'Julian Rivera \\u2014 Guest Services Professional.pdf\'.\",\"file\":{\"name\":\"Julian Rivera \\u2014 Guest Services Professional.pdf\"}}', 'Warning', '127.0.0.1', 'Chrome', 'http://localhost:8080/superadmin/applicants'),
(110, 14, 'Super Admin', 'Administration / HR', '2026-08-22 18:48:34', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '6', 'Preview screening failed: NLP service returned HTTP 422: {\"success\":false,\"processing_status\":\"FAILED\",\"error\":\"No readable text could be extracted from \'Julian Rivera \\u2014 Guest Services Professional.pdf\'.\",\"file\":{\"name\":\"Julian Rivera \\u2014 Guest Services Professional.pdf\"}}', 'Warning', '127.0.0.1', 'Chrome', 'http://localhost:8080/superadmin/applicants'),
(111, 1, 'Super Admin', 'Administration / HR', '2026-08-23 09:17:11', 'Failed login attempt', 'Authentication', 'user', 'bullseur', 'Invalid credentials supplied.', 'Warning', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(112, 1, 'Super Admin', 'Administration / HR', '2026-08-23 09:17:46', 'OTP sent', 'Authentication', 'user', 'bullseur', 'One-time password emailed to b******@oxfordsuites.com.ph', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(113, 1, 'Super Admin', 'Administration / HR', '2026-08-23 09:18:19', 'User logged in', 'Authentication', 'user', 'bullseur', 'Two-factor login completed.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/otp'),
(114, 1, 'Super Admin', 'Administration / HR', '2026-08-23 09:49:23', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '1', 'Preview screening scored 79% with status NOT_FITTED_TO_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/superadmin/applicants'),
(115, 1, 'Super Admin', 'Administration / HR', '2026-08-23 09:50:39', 'Applicant Screened', 'Applicant Management', 'Applicant', '31', 'spaCy screening for Julian Rivera: Not Fitted to Job (79.00%), processing status PARTIALLY_PROCESSED.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/superadmin/applicants'),
(116, 1, 'Super Admin', 'Administration / HR', '2026-08-23 09:50:39', 'Applicant Created', 'Applicant Management', 'Applicant', '31', 'Added new applicant Julian Rivera for position ID 1.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/superadmin/applicants'),
(117, NULL, 'System', 'System', '2026-08-23 11:04:22', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '1', 'Preview screening scored 79% with status NOT_FITTED_TO_JOB.', 'Info', '127.0.0.1', 'Unknown', 'http://127.0.0.1:8000/api/v1/applicants/screen-resume'),
(118, NULL, 'System', 'System', '2026-08-23 11:07:33', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '1', 'Preview screening scored 79% with status NOT_FITTED_TO_JOB.', 'Info', '127.0.0.1', 'Unknown', 'http://127.0.0.1:8000/api/v1/applicants/screen-resume'),
(119, NULL, 'System', 'System', '2026-08-23 11:29:07', 'Reference Data Added', 'Applicant Management', 'Screening Reference Data', '73', 'Added skill \'Temp Test Skill\' (aliases: temp alias one, temp alias two) to the spaCy screening vocabulary.', 'Info', '127.0.0.1', 'Unknown', 'http://127.0.0.1:8000/api/v1/screening/reference-data'),
(120, NULL, 'System', 'System', '2026-08-23 11:29:08', 'Reference Data Updated', 'Applicant Management', 'Screening Reference Data', '73', 'Updated screening reference \'skill:Temp Test Skill\' -> \'skill:Temp Test Skill Edited\'.', 'Info', '127.0.0.1', 'Unknown', 'http://127.0.0.1:8000/api/v1/screening/reference-data/73'),
(121, NULL, 'System', 'System', '2026-08-23 11:29:08', 'Reference Data Deactivated', 'Applicant Management', 'Screening Reference Data', '73', 'Deactivated skill \'Temp Test Skill Edited\'.', 'Info', '127.0.0.1', 'Unknown', 'http://127.0.0.1:8000/api/v1/screening/reference-data/73/toggle'),
(122, NULL, 'System', 'System', '2026-08-23 11:29:09', 'Reference Data Activated', 'Applicant Management', 'Screening Reference Data', '73', 'Activated skill \'Temp Test Skill Edited\'.', 'Info', '127.0.0.1', 'Unknown', 'http://127.0.0.1:8000/api/v1/screening/reference-data/73/toggle'),
(123, NULL, 'System', 'System', '2026-08-23 11:29:10', 'Reference Data Deleted', 'Applicant Management', 'Screening Reference Data', '73', 'Deleted screening reference \'skill:Temp Test Skill Edited\'.', 'Warning', '127.0.0.1', 'Unknown', 'http://127.0.0.1:8000/api/v1/screening/reference-data/73'),
(124, 1, 'Super Admin', 'Administration / HR', '2026-08-23 11:50:18', 'Reference Data Added', 'Applicant Management', 'Screening Reference Data', '74', 'Added skill \'Role Test Skill\' (aliases: role alias) to the spaCy screening vocabulary.', 'Info', '127.0.0.1', 'Unknown', 'http://127.0.0.1:8000/api/v1/screening/reference-data'),
(125, 1, 'Super Admin', 'Administration / HR', '2026-08-23 11:50:18', 'Reference Data Deleted', 'Applicant Management', 'Screening Reference Data', '74', 'Deleted screening reference \'skill:Role Test Skill\'.', 'Warning', '127.0.0.1', 'Unknown', 'http://127.0.0.1:8000/api/v1/screening/reference-data/74'),
(126, 2, 'Admin', 'Administration / HR', '2026-08-23 11:50:38', 'Reference Data Added', 'Applicant Management', 'Screening Reference Data', '75', 'Added skill \'Admin Distinct Skill\' to the spaCy screening vocabulary.', 'Info', '127.0.0.1', 'Unknown', 'http://127.0.0.1:8000/api/v1/screening/reference-data'),
(127, 2, 'Admin', 'Administration / HR', '2026-08-23 11:50:38', 'Reference Data Deleted', 'Applicant Management', 'Screening Reference Data', '75', 'Deleted screening reference \'skill:Admin Distinct Skill\'.', 'Warning', '127.0.0.1', 'Unknown', 'http://127.0.0.1:8000/api/v1/screening/reference-data/75'),
(128, 2, 'Admin', 'Administration / HR', '2026-08-23 12:03:10', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '1', 'Preview screening scored 57% with status NOT_FITTED_TO_JOB.', 'Info', '127.0.0.1', 'Unknown', 'http://127.0.0.1:8000/api/v1/applicants/screen-resume'),
(129, 15, 'Employee', 'Administration / HR', '2026-08-23 12:52:39', 'OTP sent', 'Authentication', 'user', 'naniboogsh', 'One-time password emailed to n**************@gmail.com', 'Info', '127.0.0.1', 'Chrome', 'http://192.168.254.107:8080/login'),
(130, 15, 'Employee', 'Administration / HR', '2026-08-23 12:53:42', 'User logged in', 'Authentication', 'user', 'naniboogsh', 'Two-factor login completed.', 'Info', '127.0.0.1', 'Chrome', 'http://192.168.254.107:8080/otp'),
(131, 15, 'Employee', 'Administration / HR', '2026-08-23 12:54:51', 'User logged out', 'Authentication', 'user', 'naniboogsh', 'Session token revoked.', 'Info', '127.0.0.1', 'Chrome', 'http://192.168.254.107:8080/employee'),
(132, 14, 'Super Admin', 'Administration / HR', '2026-08-23 12:55:11', 'OTP sent', 'Authentication', 'user', 'hahakdog', 'One-time password emailed to h******************@gmail.com', 'Info', '127.0.0.1', 'Chrome', 'http://192.168.254.107:8080/login'),
(133, 14, 'Super Admin', 'Administration / HR', '2026-08-23 12:55:26', 'User logged in', 'Authentication', 'user', 'hahakdog', 'Two-factor login completed.', 'Info', '127.0.0.1', 'Chrome', 'http://192.168.254.107:8080/otp'),
(134, 14, 'Super Admin', 'Administration / HR', '2026-08-23 13:27:07', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '4', 'Preview screening scored 79% with status NOT_FITTED_TO_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://192.168.254.107:8080/superadmin/applicants'),
(135, 14, 'Super Admin', 'Administration / HR', '2026-08-23 13:31:13', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '4', 'Preview screening scored 79% with status NOT_FITTED_TO_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://192.168.254.107:8080/superadmin/applicants'),
(136, 14, 'Super Admin', 'Administration / HR', '2026-08-23 13:31:15', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '4', 'Preview screening scored 79% with status NOT_FITTED_TO_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://192.168.254.107:8080/superadmin/applicants'),
(137, 14, 'Super Admin', 'Administration / HR', '2026-08-23 13:31:21', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '4', 'Preview screening scored 79% with status NOT_FITTED_TO_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://192.168.254.107:8080/superadmin/applicants'),
(138, 14, 'Super Admin', 'Administration / HR', '2026-08-23 13:32:16', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '6', 'Preview screening scored 79% with status NOT_FITTED_TO_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://192.168.254.107:8080/superadmin/applicants'),
(139, 14, 'Super Admin', 'Administration / HR', '2026-08-23 13:33:30', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '6', 'Preview screening scored 79% with status NOT_FITTED_TO_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://192.168.254.107:8080/superadmin/applicants'),
(140, 14, 'Super Admin', 'Administration / HR', '2026-08-23 13:33:40', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '6', 'Preview screening scored 79% with status NOT_FITTED_TO_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://192.168.254.107:8080/superadmin/applicants'),
(141, 14, 'Super Admin', 'Administration / HR', '2026-08-23 13:34:44', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '6', 'Preview screening scored 79% with status NOT_FITTED_TO_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://192.168.254.107:8080/superadmin/applicants'),
(142, 14, 'Super Admin', 'Administration / HR', '2026-08-23 13:39:29', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '6', 'Preview screening scored 52% with status NOT_FITTED_TO_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://192.168.254.107:8080/superadmin/applicants'),
(143, 14, 'Super Admin', 'Administration / HR', '2026-08-23 13:53:58', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '6', 'Preview screening scored 79% with status NOT_FITTED_TO_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://192.168.254.107:8080/superadmin/applicants'),
(144, 14, 'Super Admin', 'Administration / HR', '2026-08-23 14:01:08', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '2', 'Preview screening scored 67.6% with status NOT_FITTED_TO_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://192.168.254.107:8080/superadmin/applicants'),
(145, 14, 'Super Admin', 'Administration / HR', '2026-08-23 14:22:38', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '6', 'Preview screening scored 79% with status NOT_FITTED_TO_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://192.168.254.107:8080/superadmin/applicants'),
(146, 14, 'Super Admin', 'Administration / HR', '2026-08-23 14:30:51', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '4', 'Preview screening scored 79% with status NOT_FITTED_TO_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://192.168.254.107:8080/superadmin/applicants'),
(147, 14, 'Super Admin', 'Administration / HR', '2026-08-23 14:34:20', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '4', 'Preview screening scored 79% with status NOT_FITTED_TO_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://192.168.254.107:8080/superadmin/applicants'),
(148, 14, 'Super Admin', 'Administration / HR', '2026-08-23 14:34:21', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '4', 'Preview screening scored 79% with status NOT_FITTED_TO_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://192.168.254.107:8080/superadmin/applicants'),
(149, 14, 'Super Admin', 'Administration / HR', '2026-08-23 14:46:39', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '6', 'Preview screening scored 79% with status NOT_FITTED_TO_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://192.168.254.107:8080/superadmin/applicants'),
(150, 14, 'Super Admin', 'Administration / HR', '2026-08-23 15:02:50', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '6', 'Preview screening scored 79% with status NOT_FITTED_TO_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://192.168.254.107:8080/superadmin/applicants'),
(151, 14, 'Super Admin', 'Administration / HR', '2026-08-23 15:08:39', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '6', 'Preview screening scored 79% with status NOT_FITTED_TO_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://192.168.254.107:8080/superadmin/applicants'),
(152, 2, 'Admin', 'Administration / HR', '2026-08-24 03:27:37', 'OTP sent', 'Authentication', 'user', 'jdelacruz', 'One-time password emailed to j***********@oxfordsuites.com.ph', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(153, NULL, 'System', 'System', '2026-08-24 03:33:08', 'Failed OTP verification', 'Authentication', 'user', NULL, 'Invalid or expired OTP attempt.', 'Warning', '127.0.0.1', 'Chrome', 'http://localhost:8080/otp'),
(154, 2, 'Admin', 'Administration / HR', '2026-08-24 03:36:59', 'OTP sent', 'Authentication', 'user', 'jdelacruz', 'One-time password emailed to j***********@oxfordsuites.com.ph', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(155, 2, 'Admin', 'Administration / HR', '2026-08-24 03:39:24', 'User logged in', 'Authentication', 'user', 'jdelacruz', 'Two-factor login completed.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/otp'),
(156, 2, 'Admin', 'Administration / HR', '2026-08-24 03:55:17', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '15', 'Preview screening scored 100% with status PERFECT_FOR_THE_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/admin/applicants'),
(157, 2, 'Admin', 'Administration / HR', '2026-08-24 03:58:04', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '15', 'Preview screening scored 100% with status PERFECT_FOR_THE_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/admin/applicants'),
(158, 2, 'Admin', 'Administration / HR', '2026-08-24 03:58:44', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '15', 'Preview screening scored 100% with status PERFECT_FOR_THE_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/admin/applicants'),
(159, 2, 'Admin', 'Administration / HR', '2026-08-24 04:09:57', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '16', 'Preview screening scored 100% with status PERFECT_FOR_THE_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/admin/applicants'),
(160, 2, 'Admin', 'Administration / HR', '2026-08-24 04:19:39', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '16', 'Preview screening scored 97% with status NOT_FITTED_TO_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/admin/applicants'),
(161, 2, 'Admin', 'Administration / HR', '2026-08-24 04:19:43', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '16', 'Preview screening scored 97% with status NOT_FITTED_TO_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/admin/applicants'),
(162, 2, 'Admin', 'Administration / HR', '2026-08-24 04:19:46', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '16', 'Preview screening scored 97% with status NOT_FITTED_TO_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/admin/applicants'),
(163, 2, 'Admin', 'Administration / HR', '2026-08-24 04:22:19', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '4', 'Preview screening scored 86% with status NOT_FITTED_TO_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/admin/applicants'),
(164, 2, 'Admin', 'Administration / HR', '2026-08-24 05:27:27', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '16', 'Preview screening scored 94.4% with status PERFECT_FOR_THE_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/admin/applicants');

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE IF NOT EXISTS `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cache`
--

INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES
('oxford-suites-hrms-cache-5c785c036466adea360111aa28563bfd556b5fba', 'i:1;', 1787571624),
('oxford-suites-hrms-cache-5c785c036466adea360111aa28563bfd556b5fba:timer', 'i:1787571624;', 1787571624),
('oxford-suites-hrms-cache-screening_reference_data', 'a:3:{s:6:\"skills\";a:48:{s:19:\"Attention to Detail\";a:3:{i:0;s:19:\"attention to detail\";i:1;s:15:\"detail oriented\";i:2;s:15:\"detail-oriented\";}s:15:\"Banquet Service\";a:3:{i:0;s:15:\"banquet service\";i:1;s:18:\"banquet operations\";i:2;s:16:\"function service\";}s:18:\"Barista Operations\";a:3:{i:0;s:18:\"barista operations\";i:1;s:7:\"barista\";i:2;s:12:\"cafe service\";}s:15:\"Cake Decoration\";a:2:{i:0;s:15:\"cake decorating\";i:1;s:11:\"cake design\";}s:13:\"Cash Handling\";a:4:{i:0;s:13:\"cash handling\";i:1;s:10:\"cashiering\";i:2;s:7:\"billing\";i:3;s:14:\"funds handling\";}s:20:\"Check-in / Check-out\";a:5:{i:0;s:20:\"check-in / check-out\";i:1;s:18:\"check in check out\";i:2;s:8:\"check-in\";i:3;s:9:\"check-out\";i:4;s:30:\"arrival and departure handling\";}s:15:\"Chemical Safety\";a:2:{i:0;s:15:\"chemical safety\";i:1;s:26:\"cleaning chemical handling\";}s:18:\"Coffee Preparation\";a:6:{i:0;s:18:\"coffee preparation\";i:1;s:13:\"coffee making\";i:2;s:15:\"espresso making\";i:3;s:19:\"espresso extraction\";i:4;s:9:\"latte art\";i:5;s:14:\"coffee brewing\";}s:13:\"Communication\";a:4:{i:0;s:13:\"communication\";i:1;s:20:\"communication skills\";i:2;s:20:\"verbal communication\";i:3;s:21:\"written communication\";}s:18:\"Complaint Handling\";a:3:{i:0;s:18:\"complaint handling\";i:1;s:20:\"complaint resolution\";i:2;s:26:\"guest complaint management\";}s:15:\"Confidentiality\";a:3:{i:0;s:15:\"confidentiality\";i:1;s:12:\"data privacy\";i:2;s:23:\"records confidentiality\";}s:16:\"Customer Service\";a:4:{i:0;s:16:\"customer service\";i:1;s:13:\"guest service\";i:2;s:19:\"customer assistance\";i:3;s:14:\"client service\";}s:11:\"Food Safety\";a:5:{i:0;s:11:\"food safety\";i:1;s:22:\"food safety compliance\";i:2;s:12:\"food hygiene\";i:3;s:10:\"sanitation\";i:4;s:15:\"food sanitation\";}s:23:\"Front Office Operations\";a:5:{i:0;s:12:\"front office\";i:1;s:23:\"front office operations\";i:2;s:10:\"front desk\";i:3;s:20:\"reception operations\";i:4;s:18:\"hotel front office\";}s:14:\"Guest Recovery\";a:1:{i:0;s:16:\"service recovery\";}s:15:\"Guest Relations\";a:3:{i:0;s:15:\"guest relations\";i:1;s:26:\"guest relations management\";i:2;s:16:\"guest engagement\";}s:5:\"HACCP\";a:3:{i:0;s:5:\"haccp\";i:1;s:16:\"haccp compliance\";i:2;s:22:\"food safety management\";}s:11:\"Hot Kitchen\";a:5:{i:0;s:11:\"hot kitchen\";i:1;s:8:\"hot line\";i:2;s:12:\"line cooking\";i:3;s:13:\"grill station\";i:4;s:13:\"saute station\";}s:16:\"Hotel Operations\";a:2:{i:0;s:16:\"hotel operations\";i:1;s:19:\"property operations\";}s:23:\"Housekeeping Operations\";a:3:{i:0;s:12:\"housekeeping\";i:1;s:23:\"housekeeping operations\";i:2;s:23:\"housekeeping procedures\";}s:17:\"Inventory Control\";a:6:{i:0;s:17:\"inventory control\";i:1;s:20:\"inventory management\";i:2;s:13:\"stock control\";i:3;s:11:\"stocktaking\";i:4;s:16:\"inventory checks\";i:5;s:17:\"inventory support\";}s:15:\"Kitchen Hygiene\";a:1:{i:0;s:18:\"kitchen sanitation\";}s:12:\"Knife Skills\";a:2:{i:0;s:12:\"knife skills\";i:1;s:14:\"knife handling\";}s:14:\"Linen Handling\";a:3:{i:0;s:14:\"linen handling\";i:1;s:16:\"linen management\";i:2;s:18:\"laundry operations\";}s:18:\"Maintenance Basics\";a:4:{i:0;s:17:\"basic maintenance\";i:1;s:20:\"building maintenance\";i:2;s:22:\"facilities maintenance\";i:3;s:7:\"repairs\";}s:13:\"Mise en Place\";a:2:{i:0;s:13:\"mise en place\";i:1;s:13:\"mise-en-place\";}s:8:\"Mixology\";a:5:{i:0;s:8:\"mixology\";i:1;s:20:\"cocktail preparation\";i:2;s:14:\"cocktail craft\";i:3;s:12:\"drink mixing\";i:4;s:20:\"beverage preparation\";}s:9:\"MS Office\";a:6:{i:0;s:9:\"ms office\";i:1;s:16:\"microsoft office\";i:2;s:7:\"ms word\";i:3;s:8:\"ms excel\";i:4;s:5:\"excel\";i:5;s:15:\"word processing\";}s:17:\"Pastry and Baking\";a:7:{i:0;s:6:\"pastry\";i:1;s:6:\"baking\";i:2;s:11:\"pastry arts\";i:3;s:19:\"dessert preparation\";i:4;s:19:\"breads and pastries\";i:5;s:18:\"pastry preparation\";i:6;s:12:\"basic baking\";}s:15:\"Payroll Support\";a:3:{i:0;s:15:\"payroll support\";i:1;s:18:\"payroll processing\";i:2;s:18:\"payroll assistance\";}s:7:\"Plating\";a:4:{i:0;s:7:\"plating\";i:1;s:12:\"food plating\";i:2;s:18:\"plate presentation\";i:3;s:12:\"presentation\";}s:11:\"POS Systems\";a:6:{i:0;s:11:\"pos systems\";i:1;s:3:\"pos\";i:2;s:13:\"point of sale\";i:3;s:21:\"point of sale systems\";i:4;s:6:\"micros\";i:5;s:13:\"pos operation\";}s:15:\"Problem Solving\";a:3:{i:0;s:15:\"problem solving\";i:1;s:15:\"problem-solving\";i:2;s:15:\"troubleshooting\";}s:27:\"Property Management Systems\";a:5:{i:0;s:9:\"opera pms\";i:1;s:5:\"opera\";i:2;s:26:\"property management system\";i:3;s:11:\"pms systems\";i:4;s:3:\"pms\";}s:20:\"Public Area Cleaning\";a:2:{i:0;s:20:\"public area cleaning\";i:1;s:23:\"public area maintenance\";}s:21:\"Records Documentation\";a:4:{i:0;s:9:\"201 files\";i:1;s:13:\"documentation\";i:2;s:18:\"records management\";i:3;s:15:\"file management\";}s:19:\"Recruitment Support\";a:3:{i:0;s:11:\"recruitment\";i:1;s:19:\"recruitment support\";i:2;s:22:\"sourcing and screening\";}s:12:\"Reservations\";a:5:{i:0;s:12:\"reservations\";i:1;s:22:\"reservation management\";i:2;s:18:\"booking management\";i:3;s:19:\"reservation support\";i:4;s:19:\"reservation updates\";}s:27:\"Responsible Alcohol Service\";a:3:{i:0;s:27:\"responsible alcohol service\";i:1;s:30:\"responsible service of alcohol\";i:2;s:17:\"alcohol awareness\";}s:13:\"Room Turnover\";a:3:{i:0;s:13:\"room turnover\";i:1;s:13:\"room cleaning\";i:2;s:18:\"guestroom cleaning\";}s:17:\"Safety Compliance\";a:3:{i:0;s:17:\"safety compliance\";i:1;s:16:\"workplace safety\";i:2;s:17:\"safety procedures\";}s:10:\"Scheduling\";a:2:{i:0;s:16:\"shift scheduling\";i:1;s:16:\"staff scheduling\";}s:17:\"Shift Supervision\";a:1:{i:0;s:17:\"floor supervision\";}s:14:\"Staff Training\";a:3:{i:0;s:13:\"team training\";i:1;s:17:\"new hire training\";i:2;s:14:\"staff coaching\";}s:13:\"Table Service\";a:4:{i:0;s:13:\"table service\";i:1;s:12:\"food service\";i:2;s:16:\"service sequence\";i:3;s:19:\"dining room service\";}s:8:\"Teamwork\";a:3:{i:0;s:8:\"teamwork\";i:1;s:18:\"team collaboration\";i:2;s:19:\"working with others\";}s:15:\"Time Management\";a:3:{i:0;s:15:\"time management\";i:1;s:14:\"prioritization\";i:2;s:12:\"multitasking\";}s:9:\"Upselling\";a:4:{i:0;s:9:\"upselling\";i:1;s:17:\"upsell techniques\";i:2;s:18:\"suggestive selling\";i:3;s:13:\"cross-selling\";}}s:9:\"job_roles\";a:20:{s:7:\"Barista\";a:4:{i:0;s:7:\"barista\";i:1;s:17:\"coffee shop staff\";i:2;s:12:\"cafe barista\";i:3;s:16:\"coffee attendant\";}s:9:\"Bartender\";a:5:{i:0;s:9:\"bartender\";i:1;s:10:\"bar tender\";i:2;s:6:\"barman\";i:3;s:7:\"barkeep\";i:4;s:10:\"mixologist\";}s:4:\"Chef\";a:5:{i:0;s:4:\"chef\";i:1;s:9:\"sous chef\";i:2;s:9:\"head chef\";i:3;s:14:\"executive chef\";i:4;s:14:\"chef de partie\";}s:9:\"Concierge\";a:3:{i:0;s:9:\"concierge\";i:1;s:12:\"bell captain\";i:2;s:7:\"bellman\";}s:23:\"Front Desk Receptionist\";a:7:{i:0;s:23:\"front desk receptionist\";i:1;s:18:\"front desk officer\";i:2;s:12:\"receptionist\";i:3;s:16:\"front desk agent\";i:4;s:16:\"front desk staff\";i:5;s:22:\"front office associate\";i:6;s:19:\"guest service agent\";}s:15:\"General Manager\";a:3:{i:0;s:15:\"general manager\";i:1;s:2:\"gm\";i:2;s:16:\"property manager\";}s:23:\"Guest Relations Officer\";a:4:{i:0;s:23:\"guest relations officer\";i:1;s:3:\"gro\";i:2;s:27:\"guest relations coordinator\";i:3;s:21:\"guest service officer\";}s:7:\"Hostess\";a:3:{i:0;s:7:\"hostess\";i:1;s:9:\"food host\";i:2;s:15:\"restaurant host\";}s:22:\"Housekeeping Attendant\";a:6:{i:0;s:22:\"housekeeping attendant\";i:1;s:14:\"room attendant\";i:2;s:11:\"housekeeper\";i:3;s:11:\"chambermaid\";i:4;s:7:\"roomboy\";i:5;s:21:\"public area attendant\";}s:12:\"HR Assistant\";a:5:{i:0;s:12:\"hr assistant\";i:1;s:24:\"human resource assistant\";i:2;s:25:\"human resources assistant\";i:3;s:8:\"hr staff\";i:4;s:21:\"recruitment assistant\";}s:10:\"HR Manager\";a:3:{i:0;s:10:\"hr manager\";i:1;s:23:\"human resources manager\";i:2;s:25:\"hr administration manager\";}s:14:\"Kitchen Helper\";a:5:{i:0;s:14:\"kitchen helper\";i:1;s:10:\"dishwasher\";i:2;s:12:\"kitchen aide\";i:3;s:7:\"steward\";i:4;s:15:\"kitchen steward\";}s:17:\"Laundry Attendant\";a:2:{i:0;s:17:\"laundry attendant\";i:1;s:13:\"laundry staff\";}s:9:\"Line Cook\";a:6:{i:0;s:9:\"line cook\";i:1;s:4:\"cook\";i:2;s:12:\"station cook\";i:3;s:16:\"hot kitchen cook\";i:4;s:11:\"commis chef\";i:5;s:12:\"kitchen cook\";}s:22:\"Maintenance Technician\";a:4:{i:0;s:22:\"maintenance technician\";i:1;s:17:\"maintenance staff\";i:2;s:8:\"handyman\";i:3;s:26:\"building maintenance staff\";}s:27:\"Pastry and Bakery Assistant\";a:4:{i:0;s:16:\"pastry assistant\";i:1;s:16:\"bakery assistant\";i:2;s:14:\"bakery trainee\";i:3;s:11:\"pastry cook\";}s:11:\"Pastry Chef\";a:4:{i:0;s:11:\"pastry chef\";i:1;s:5:\"baker\";i:2;s:11:\"pastry cook\";i:3;s:10:\"baker chef\";}s:17:\"Restaurant Server\";a:8:{i:0;s:17:\"restaurant server\";i:1;s:6:\"waiter\";i:2;s:8:\"waitress\";i:3;s:11:\"food server\";i:4;s:6:\"server\";i:5;s:27:\"food and beverage attendant\";i:6;s:13:\"f&b attendant\";i:7;s:12:\"service crew\";}s:21:\"Restaurant Supervisor\";a:3:{i:0;s:16:\"floor supervisor\";i:1;s:18:\"service supervisor\";i:2;s:18:\"senior server lead\";}s:10:\"Supervisor\";a:3:{i:0;s:10:\"supervisor\";i:1;s:16:\"shift supervisor\";i:2;s:11:\"team leader\";}}s:14:\"certifications\";a:11:{s:13:\"Barista NC II\";a:3:{i:0;s:13:\"barista nc ii\";i:1;s:19:\"tesda barista nc ii\";i:2;s:26:\"coffee academy certificate\";}s:16:\"Culinary Diploma\";a:3:{i:0;s:16:\"culinary diploma\";i:1;s:24:\"diploma in culinary arts\";i:2;s:21:\"culinary arts diploma\";}s:16:\"Driver\'s License\";a:4:{i:0;s:16:\"driver\'s license\";i:1;s:15:\"drivers license\";i:2;s:27:\"professional driver license\";i:3;s:31:\"non-professional driver license\";}s:21:\"First Aid Certificate\";a:3:{i:0;s:21:\"first aid certificate\";i:1;s:30:\"first aid training certificate\";i:2;s:18:\"standard first aid\";}s:24:\"Food Handler Certificate\";a:5:{i:0;s:24:\"food handler certificate\";i:1;s:26:\"food handler\'s certificate\";i:2;s:25:\"food handlers certificate\";i:3;s:23:\"food safety certificate\";i:4;s:17:\"food handler card\";}s:22:\"TESDA Bartending NC II\";a:4:{i:0;s:22:\"tesda bartending nc ii\";i:1;s:16:\"bartending nc ii\";i:2;s:15:\"bartending nc 2\";i:3;s:25:\"tesda nc ii in bartending\";}s:39:\"TESDA Bread and Pastry Production NC II\";a:3:{i:0;s:33:\"bread and pastry production nc ii\";i:1;s:12:\"baking nc ii\";i:2;s:23:\"pastry production nc ii\";}s:19:\"TESDA Cookery NC II\";a:5:{i:0;s:19:\"tesda cookery nc ii\";i:1;s:13:\"cookery nc ii\";i:2;s:18:\"tesda cookery nc 2\";i:3;s:24:\"commercial cooking nc ii\";i:4;s:22:\"tesda nc ii in cookery\";}s:38:\"TESDA Food and Beverage Services NC II\";a:4:{i:0;s:32:\"food and beverage services nc ii\";i:1;s:18:\"f&b services nc ii\";i:2;s:17:\"fb services nc ii\";i:3;s:23:\"food and beverage nc ii\";}s:24:\"TESDA Front Office NC II\";a:3:{i:0;s:24:\"tesda front office nc ii\";i:1;s:18:\"front office nc ii\";i:2;s:27:\"front office services nc ii\";}s:24:\"TESDA Housekeeping NC II\";a:3:{i:0;s:24:\"tesda housekeeping nc ii\";i:1;s:18:\"housekeeping nc ii\";i:2;s:17:\"housekeeping nc 2\";}}}', 1787578346),
('oxford-suites-hrms-cache-smoke-test', 's:2:\"ok\";', 1787427712);

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

CREATE TABLE IF NOT EXISTS `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_locks_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `checklist_requests`
--

CREATE TABLE IF NOT EXISTS `checklist_requests` (
  `checklist_request_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `request_code` varchar(40) NOT NULL,
  `employee_id` bigint(20) UNSIGNED NOT NULL,
  `template_id` bigint(20) UNSIGNED DEFAULT NULL,
  `phase` varchar(30) NOT NULL,
  `items_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`items_json`)),
  `status` varchar(30) NOT NULL DEFAULT 'Pending',
  `requested_by_user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `requested_at` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`checklist_request_id`),
  UNIQUE KEY `uq_checklist_requests_request_code` (`request_code`),
  KEY `fk_checklist_requests_employee_id` (`employee_id`),
  KEY `fk_checklist_requests_requested_by_user_id` (`requested_by_user_id`),
  KEY `fk_checklist_requests_template_id` (`template_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `checklist_requests`
--

INSERT INTO `checklist_requests` (`checklist_request_id`, `request_code`, `employee_id`, `template_id`, `phase`, `items_json`, `status`, `requested_by_user_id`, `requested_at`, `created_at`, `updated_at`) VALUES
(1, 'CR-001', 22, 2, 'Probationary', '[\"Guest-handling scenario evaluation\",\"PMS (Opera) proficiency check\",\"Supervisor sign-off: guest complaints handling\",\"Supervisor sign-off: reservations process\"]', 'Pending', 2, '2026-08-04', '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(2, 'CR-002', 23, 2, 'Probationary', '[\"Room-turnover timing check (30-minute SLA)\",\"Chemical-handling and safety procedure\",\"Linen and amenities restocking check\",\"Supervisor sign-off\"]', 'Pending', 2, '2026-08-06', '2026-08-17 00:31:34', '2026-08-17 00:31:34');

-- --------------------------------------------------------

--
-- Table structure for table `departments`
--

CREATE TABLE IF NOT EXISTS `departments` (
  `department_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` varchar(30) NOT NULL,
  `name` varchar(120) NOT NULL,
  `description` text DEFAULT NULL,
  `head_employee_id` bigint(20) UNSIGNED DEFAULT NULL,
  `budget` decimal(14,2) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`department_id`),
  UNIQUE KEY `code` (`code`),
  UNIQUE KEY `name` (`name`),
  KEY `idx_departments_head_employee_id` (`head_employee_id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `departments`
--

INSERT INTO `departments` (`department_id`, `code`, `name`, `description`, `head_employee_id`, `budget`, `created_at`, `updated_at`) VALUES
(1, 'DEP-FO', 'Front Office', 'Front Desk, Concierge, Reservations, Guest Services', 1, 2800000.00, '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(2, 'DEP-FB', 'Food & Beverage', 'Dining Room, Bar Operations, Room Service', 2, 3500000.00, '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(3, 'DEP-KC', 'Kitchen / Culinary', 'Main Hotel Kitchen, Banquet Catering, Pastry', 10, 4200000.00, '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(4, 'DEP-HK', 'Housekeeping', 'Guestroom Operations, Linen & Laundry, Public Areas', 3, 2400000.00, '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(5, 'DEP-HR', 'Administration / HR', 'Human Resources, Accounting, General Maintenance', 7, 3100000.00, '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(6, 'DEP-SEC', 'Security', 'Guest and property security, patrol operations', NULL, 900000.00, '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(7, 'DEP-WEL', 'Wellness', 'Spa, gym, and wellness centre services', NULL, 700000.00, '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(8, 'DEP-FIN', 'Finance', 'Accounting, payables, receivables, month-end close', NULL, 1100000.00, '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(9, 'DEP-ENG', 'Engineering', 'Building maintenance, preventive maintenance, facilities', NULL, 1300000.00, '2026-08-17 17:41:34', '2026-08-17 17:41:34');

-- --------------------------------------------------------

--
-- Table structure for table `employees`
--

CREATE TABLE IF NOT EXISTS `employees` (
  `employee_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
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
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`employee_id`),
  UNIQUE KEY `employee_code` (`employee_code`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_employees_department_id` (`department_id`),
  KEY `idx_employees_position_id` (`position_id`),
  KEY `idx_employees_salary_grade_id` (`salary_grade_id`),
  KEY `idx_employees_supervisor_employee_id` (`supervisor_employee_id`),
  KEY `idx_employees_status` (`status`),
  KEY `idx_employees_date_hired` (`date_hired`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `employees`
--

INSERT INTO `employees` (`employee_id`, `employee_code`, `first_name`, `middle_name`, `last_name`, `email`, `personal_email`, `phone`, `address`, `birth_date`, `gender`, `civil_status`, `nationality`, `sss_number`, `philhealth_number`, `pagibig_number`, `tin_number`, `position_id`, `department_id`, `employment_type`, `date_hired`, `supervisor_employee_id`, `status`, `onboarding_complete`, `salary_grade_id`, `employee_record_last_updated_at`, `salary_step`, `created_at`, `updated_at`) VALUES
(1, 'EMP-0001', 'Ana', 'M.', 'Ramos', 'ana.ramos@oxfordsuites.com.ph', NULL, '0917 100 1001', 'Makati City', '1986-05-14', 'Female', 'Married', 'Filipino', NULL, NULL, NULL, NULL, 10, 1, 'Regular', '2019-02-11', 9, 'Active', 1, 6, '2026-01-10', 'Step 3', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(2, 'EMP-0002', 'Gabriel', 'S.', 'Mendoza', 'gabriel.mendoza@oxfordsuites.com.ph', NULL, '0917 100 1002', 'Makati City', '1979-11-02', 'Male', 'Married', 'Filipino', NULL, NULL, NULL, NULL, 11, 2, 'Regular', '2018-06-04', 9, 'Active', 1, 7, '2025-11-02', 'Step 4', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(3, 'EMP-0003', 'Lourdes', 'B.', 'Bautista', 'lourdes.bautista@oxfordsuites.com.ph', NULL, '0917 100 1003', 'Quezon City', '1971-03-27', 'Female', 'Married', 'Filipino', NULL, NULL, NULL, NULL, 13, 4, 'Regular', '2017-11-20', 9, 'Active', 1, 6, '2012-06-15', 'Step 3', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(4, 'EMP-0004', 'Camille', 'T.', 'Ortega', 'camille.ortega@oxfordsuites.com.ph', NULL, '0917 664 2219', 'Makati City', '2001-02-09', 'Female', 'Single', 'Filipino', NULL, NULL, NULL, NULL, 2, 1, 'Probationary', '2026-08-04', 1, 'Active', 0, 4, '2026-01-14', 'Step 1', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(5, 'EMP-0005', 'Kevin', 'D.', 'Dela Cruz', 'kevin.delacruz@oxfordsuites.com.ph', NULL, '0921 774 9903', '14 Kalayaan Ave, Makati City', '1998-08-17', 'Male', 'Single', 'Filipino', '34-1234567-8', '12-345678901-2', '1234-5678-9012', '123-456-789', 5, 3, 'Probationary', '2026-04-15', 10, 'Active', 0, 2, '2026-01-20', 'Step 2', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(6, 'EMP-0006', 'Marjun', 'V.', 'Devera', 'marjun.devera@oxfordsuites.com.ph', NULL, '0917 664 2219', 'Pasay City', '1999-12-03', 'Male', 'Single', 'Filipino', NULL, NULL, NULL, NULL, 3, 2, 'Regular', '2025-09-16', 2, 'Active', 1, 1, '2011-03-30', 'Step 1', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(7, 'EMP-0007', 'Juan', 'C.', 'Dela Cruz', 'juan.delacruz@oxfordsuites.com.ph', NULL, '0917 100 1007', 'Makati City', '1982-06-21', 'Male', 'Married', 'Filipino', NULL, NULL, NULL, NULL, 14, 5, 'Regular', '2016-01-18', 9, 'Active', 1, 7, '2024-08-08', 'Step 3', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(8, 'EMP-0008', 'Rosa', 'P.', 'Aquino', 'rosa.aquino@oxfordsuites.com.ph', NULL, '0917 100 1008', 'Taguig City', '1990-01-30', 'Female', 'Married', 'Filipino', NULL, NULL, NULL, NULL, 15, 4, 'Regular', '2021-05-03', 3, 'Active', 1, 4, '2025-05-19', 'Step 2', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(9, 'EMP-0009', 'Ricardo', 'A.', 'Villanueva', 'ricardo.villanueva@oxfordsuites.com.ph', NULL, '0917 100 1009', 'Makati City', '1975-09-12', 'Male', 'Married', 'Filipino', NULL, NULL, NULL, NULL, 9, 5, 'Regular', '2015-03-02', NULL, 'Active', 1, 7, NULL, 'Step 5', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(10, 'EMP-0010', 'Marco', 'D.', 'Santos', 'marco.santos@oxfordsuites.com.ph', NULL, '0917 100 1010', 'Mandaluyong City', '1980-04-25', 'Male', 'Married', 'Filipino', NULL, NULL, NULL, NULL, 12, 3, 'Regular', '2017-07-10', NULL, 'Active', 1, 7, NULL, 'Step 4', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(11, 'EMP-0011', 'Maria', 'L.', 'Lim', 'maria.lim@oxfordsuites.com.ph', NULL, '0917 100 1011', 'Makati City', '1993-10-08', 'Female', 'Single', 'Filipino', NULL, NULL, NULL, NULL, 16, 5, 'Regular', '2020-02-03', 7, 'Active', 1, 4, NULL, 'Step 2', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(12, 'EMP-0012', 'Paolo', 'R.', 'Cruz', 'paolo.cruz@oxfordsuites.com.ph', NULL, '0917 100 1012', 'Pasig City', '1988-07-15', 'Male', 'Married', 'Filipino', NULL, NULL, NULL, NULL, 17, 5, 'Regular', '2019-08-19', 7, 'Active', 1, 4, NULL, 'Step 2', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(13, 'EMP-0013', 'Bianca', 'S.', 'Soriano', 'bianca.soriano@oxfordsuites.com.ph', NULL, '0912 345 6789', 'Manila', '2000-04-22', 'Female', 'Single', 'Filipino', NULL, NULL, NULL, NULL, 1, 1, 'Probationary', '2026-08-04', 1, 'Active', 0, 2, NULL, 'Step 1', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(14, 'EMP-0014', 'Jompaks', 'B.', 'Berdugo', 'jompaks.berdugo@oxfordsuites.com.ph', NULL, '0933 552 1180', 'Parañaque City', '1996-09-05', 'Male', 'Single', 'Filipino', NULL, NULL, NULL, NULL, 4, 2, 'Probationary', '2026-03-01', 2, 'Active', 1, 1, NULL, 'Step 1', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(15, 'EMP-0015', 'Angelo', 'T.', 'Torres', 'angelo.torres@oxfordsuites.com.ph', NULL, '0917 220 5541', 'Makati City', '1999-03-18', 'Male', 'Single', 'Filipino', NULL, NULL, NULL, NULL, 1, 1, 'Probationary', '2026-05-11', 1, 'Active', 0, 2, NULL, 'Step 1', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(16, 'EMP-0016', 'Ligaya', 'S.', 'Santos', 'ligaya.santos@oxfordsuites.com.ph', NULL, '0918 663 2201', 'Caloocan City', '1987-12-11', 'Female', 'Married', 'Filipino', NULL, NULL, NULL, NULL, 7, 4, 'Probationary', '2026-02-20', 3, 'Active', 0, 1, NULL, 'Step 1', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(17, 'EMP-0017', 'Michael', 'R.', 'Reyes', 'michael.reyes@oxfordsuites.com.ph', NULL, '0920 441 8873', 'Quezon City', '2002-01-27', 'Male', 'Single', 'Filipino', NULL, NULL, NULL, NULL, 8, 5, 'Probationary', '2026-06-01', 7, 'Active', 0, 3, NULL, 'Step 1', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(18, 'EMP-0018', 'Patricia', 'G.', 'Gomez', 'patricia.gomez@oxfordsuites.com.ph', NULL, '0917 903 2245', 'Makati City', '1991-06-09', 'Female', 'Married', 'Filipino', NULL, NULL, NULL, NULL, 6, 3, 'Regular', '2025-06-02', 10, 'Active', 1, 5, NULL, 'Step 2', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(19, 'EMP-0019', 'Ernesto', 'V.', 'Villar', 'ernesto.villar@oxfordsuites.com.ph', NULL, '0921 556 7743', 'Manila', '1985-05-30', 'Male', 'Married', 'Filipino', NULL, NULL, NULL, NULL, 7, 4, 'Regular', '2025-03-19', 3, 'Active', 1, 1, NULL, 'Step 2', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(20, 'EMP-0020', 'Grace', 'P.', 'Panganiban', 'grace.panganiban@oxfordsuites.com.ph', NULL, '0917 332 8890', 'Makati City', '1997-02-14', 'Female', 'Single', 'Filipino', NULL, NULL, NULL, NULL, 2, 1, 'Regular', '2025-11-10', 1, 'Active', 0, 4, NULL, 'Step 1', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(21, 'EMP-0021', 'Noel', 'F.', 'Fajardo', 'noel.fajardo@oxfordsuites.com.ph', NULL, '0918 774 3320', 'Valenzuela City', '1984-10-19', 'Male', 'Married', 'Filipino', NULL, NULL, NULL, NULL, 8, 5, 'Regular', '2025-01-27', 7, 'Active', 1, 3, NULL, 'Step 2', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(22, 'EMP-0022', 'Miguel', 'T.', 'Torres', 'miguel.torres@oxfordsuites.com.ph', NULL, '0917 442 1177', 'Makati City', '1998-11-25', 'Male', 'Single', 'Filipino', NULL, NULL, NULL, NULL, 1, 1, 'Probationary', '2026-05-04', 1, 'Active', 0, 2, NULL, 'Step 1', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(23, 'EMP-0023', 'Andrea', 'L.', 'Lim', 'andrea.lim@oxfordsuites.com.ph', NULL, '0917 883 5566', 'Mandaluyong City', '1999-08-02', 'Female', 'Single', 'Filipino', NULL, NULL, NULL, NULL, 7, 4, 'Probationary', '2026-03-06', 3, 'Active', 0, 1, NULL, 'Step 1', '2026-08-17 17:41:34', '2026-08-17 17:41:34');

-- --------------------------------------------------------

--
-- Table structure for table `employee_benefits`
--

CREATE TABLE IF NOT EXISTS `employee_benefits` (
  `employee_benefit_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `employee_id` bigint(20) UNSIGNED NOT NULL,
  `benefit_name` varchar(100) NOT NULL,
  `reference_value` varchar(190) DEFAULT NULL,
  `note` text DEFAULT NULL,
  `effective_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `status` varchar(30) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`employee_benefit_id`),
  KEY `idx_employee_benefits_employee_id` (`employee_id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `employee_benefits`
--

INSERT INTO `employee_benefits` (`employee_benefit_id`, `employee_id`, `benefit_name`, `reference_value`, `note`, `effective_date`, `end_date`, `status`, `created_at`, `updated_at`) VALUES
(1, 5, 'SSS', '34-1234567-8', 'Active contributions', '2026-04-15', NULL, 'Active', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(2, 5, 'PhilHealth', '12-345678901-2', 'Active', '2026-04-15', NULL, 'Active', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(3, 5, 'Pag-IBIG', '1234-5678-9012', 'Active + MP2', '2026-04-15', NULL, 'Active', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(4, 5, 'BIR Tax Status', 'S — Single', 'TIN 123-456-789', '2026-04-15', NULL, 'Active', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(5, 5, 'HMO', 'Maxicare Platinum', 'Effective after regularization', '2026-08-15', NULL, 'Inactive', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(6, 5, 'Insurance', 'Group Life', 'PHP 500,000 coverage', '2026-04-15', NULL, 'Active', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(7, 1, 'SSS', '34-2233445-6', 'Active contributions', '2019-02-11', NULL, 'Active', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(8, 1, 'HMO', 'Maxicare Gold', 'Executive plan', '2019-03-01', NULL, 'Active', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(9, 6, 'SSS', '34-5566778-9', 'Active contributions', '2025-09-16', NULL, 'Active', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(10, 6, 'HMO', 'Maxicare Silver', 'Effective after regularization', '2026-03-15', NULL, 'Active', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(11, 8, 'SSS', '34-7788990-1', 'Active contributions', '2021-05-03', NULL, 'Active', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(12, 8, 'Insurance', 'Group Life', 'PHP 300,000 coverage', '2021-05-03', NULL, 'Active', '2026-08-17 17:41:34', '2026-08-17 17:41:34');

-- --------------------------------------------------------

--
-- Table structure for table `employee_documents`
--

CREATE TABLE IF NOT EXISTS `employee_documents` (
  `document_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
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
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`document_id`),
  UNIQUE KEY `uq_employee_documents_natural` (`employee_id`,`document_code`),
  KEY `idx_employee_documents_category` (`category`),
  KEY `idx_employee_documents_document_status` (`document_status`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `employee_documents`
--

INSERT INTO `employee_documents` (`document_id`, `employee_id`, `document_code`, `title`, `category`, `file_path`, `mime_type`, `file_size_bytes`, `document_status`, `document_date`, `expiry_date`, `last_updated_at`, `created_at`, `updated_at`) VALUES
(1, 5, 'DOC-001', 'BIR Form 2316 (2025)', 'Tax Document', '/files/emp-0005/doc-001.pdf', 'application/pdf', 245760, 'Available', '2026-01-15', NULL, '2026-01-14 16:00:00', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(2, 5, 'DOC-002', 'Certificate of Employment (COE)', 'Employment', '/files/emp-0005/doc-002.pdf', 'application/pdf', 184320, 'Released', '2026-06-01', NULL, '2026-05-31 16:00:00', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(3, 5, 'DOC-003', 'Medical Clearance Certificate', 'Onboarding', '/files/emp-0005/doc-003.pdf', 'application/pdf', 1258291, 'Submitted', '2026-02-03', NULL, '2026-02-02 16:00:00', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(4, 5, 'DOC-004', 'SSS Form E-1', 'Government ID', '/files/emp-0005/doc-004.pdf', 'application/pdf', 317440, 'Submitted', '2026-02-02', NULL, '2026-02-01 16:00:00', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(5, 5, 'DOC-005', 'NBI Clearance (2026)', 'Clearance', NULL, NULL, NULL, 'Missing', NULL, '2026-08-15', NULL, '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(6, 4, 'DOC-101', 'Signed Employment Contract', 'Employment', '/files/emp-0004/doc-101.pdf', 'application/pdf', 409600, 'Submitted', '2026-08-04', NULL, '2026-08-03 16:00:00', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(7, 4, 'DOC-102', 'NBI / Police Clearance', 'Clearance', '/files/emp-0004/doc-102.pdf', 'application/pdf', 204800, 'Submitted', '2026-07-20', '2027-07-20', '2026-08-03 16:00:00', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(8, 13, 'DOC-201', 'Signed Employment Contract', 'Employment', '/files/emp-0013/doc-201.pdf', 'application/pdf', 405504, 'Submitted', '2026-08-04', NULL, '2026-08-03 16:00:00', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(9, 1, 'DOC-301', 'Employment Contract (2019)', 'Employment', '/files/emp-0001/doc-301.pdf', 'application/pdf', 450560, 'Archived', '2019-02-11', NULL, '2026-01-09 16:00:00', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(10, 3, 'DOC-302', 'Archived 201 File', 'Personnel File', '/files/emp-0003/doc-302.pdf', 'application/pdf', 2100000, 'Archived', '2012-06-15', NULL, '2012-06-14 16:00:00', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(11, 6, 'DOC-303', 'Archived 201 File', 'Personnel File', '/files/emp-0006/doc-303.pdf', 'application/pdf', 1950000, 'Archived', '2011-03-30', NULL, '2011-03-29 16:00:00', '2026-08-17 17:41:34', '2026-08-17 17:41:34');

-- --------------------------------------------------------

--
-- Table structure for table `employee_emergency_contacts`
--

CREATE TABLE IF NOT EXISTS `employee_emergency_contacts` (
  `emergency_contact_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `employee_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(160) NOT NULL,
  `relationship` varchar(80) DEFAULT NULL,
  `phone` varchar(40) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `is_primary` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`emergency_contact_id`),
  KEY `idx_employee_emergency_contacts_employee_id` (`employee_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `employee_emergency_contacts`
--

INSERT INTO `employee_emergency_contacts` (`emergency_contact_id`, `employee_id`, `name`, `relationship`, `phone`, `address`, `is_primary`, `created_at`, `updated_at`) VALUES
(1, 5, 'Liza Santos', 'Spouse', '0918 222 4410', '14 Kalayaan Ave, Makati City', 1, '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(2, 1, 'Daniel Ramos', 'Spouse', '0917 555 1212', 'Makati City', 1, '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(3, 4, 'Lorna Ortega', 'Mother', '0917 888 2323', 'San Fernando, Pampanga', 1, '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(4, 6, 'Fely Devera', 'Mother', '0917 777 3434', 'Pasay City', 1, '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(5, 8, 'Ramon Aquino', 'Spouse', '0917 666 4545', 'Taguig City', 1, '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(6, 13, 'Nelia Soriano', 'Mother', '0912 345 6789', 'Manila', 1, '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(7, 14, 'Bert Berdugo', 'Father', '0933 552 1180', 'Parañaque City', 1, '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(8, 15, 'Sonia Torres', 'Mother', '0917 220 5541', 'Makati City', 1, '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(9, 16, 'Mario Santos', 'Spouse', '0918 663 2201', 'Caloocan City', 1, '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(10, 22, 'Teresa Torres', 'Mother', '0917 442 1177', 'Makati City', 1, '2026-08-17 17:41:34', '2026-08-17 17:41:34');

-- --------------------------------------------------------

--
-- Table structure for table `employee_exit_records`
--

CREATE TABLE IF NOT EXISTS `employee_exit_records` (
  `exit_record_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `employee_id` bigint(20) UNSIGNED NOT NULL,
  `exit_type` varchar(30) NOT NULL,
  `exit_date` date NOT NULL,
  `clearance_status` varchar(20) NOT NULL,
  `coe_status` varchar(20) NOT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`exit_record_id`),
  UNIQUE KEY `employee_id` (`employee_id`),
  KEY `idx_employee_exit_records_employee_id` (`employee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `employee_learning`
--

CREATE TABLE IF NOT EXISTS `employee_learning` (
  `employee_learning_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `employee_id` bigint(20) UNSIGNED NOT NULL,
  `course_id` bigint(20) UNSIGNED NOT NULL,
  `status` varchar(30) NOT NULL,
  `score` decimal(5,2) DEFAULT NULL,
  `assigned_date` date DEFAULT NULL,
  `completed_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`employee_learning_id`),
  UNIQUE KEY `uq_employee_learning_natural` (`employee_id`,`course_id`),
  KEY `idx_employee_learning_course_id` (`course_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `employee_learning`
--

INSERT INTO `employee_learning` (`employee_learning_id`, `employee_id`, `course_id`, `status`, `score`, `assigned_date`, `completed_date`, `created_at`, `updated_at`) VALUES
(1, 5, 1, 'Completed', 95.00, '2026-05-10', '2026-07-10', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(2, 5, 2, 'Completed', 88.00, '2026-05-10', '2026-06-24', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(3, 5, 3, 'In Progress', NULL, '2026-07-15', NULL, '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(4, 6, 2, 'Completed', 90.00, '2026-04-01', '2026-06-30', '2026-08-17 17:41:34', '2026-08-17 17:41:34');

-- --------------------------------------------------------

--
-- Table structure for table `employee_onboarding_items`
--

CREATE TABLE IF NOT EXISTS `employee_onboarding_items` (
  `employee_onboarding_item_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `employee_id` bigint(20) UNSIGNED DEFAULT NULL,
  `new_hire_id` bigint(20) UNSIGNED DEFAULT NULL,
  `template_item_id` bigint(20) UNSIGNED DEFAULT NULL,
  `item_text` text NOT NULL,
  `file_path` varchar(500) DEFAULT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `done` tinyint(1) NOT NULL DEFAULT 0,
  `completed_at` timestamp NULL DEFAULT NULL,
  `completed_by_user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`employee_onboarding_item_id`),
  KEY `fk_employee_onboarding_items_completed_by_user_id` (`completed_by_user_id`),
  KEY `fk_employee_onboarding_items_employee_id` (`employee_id`),
  KEY `fk_employee_onboarding_items_new_hire_id` (`new_hire_id`),
  KEY `fk_employee_onboarding_items_template_item_id` (`template_item_id`)
) ENGINE=InnoDB AUTO_INCREMENT=305 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `employee_onboarding_items`
--

INSERT INTO `employee_onboarding_items` (`employee_onboarding_item_id`, `employee_id`, `new_hire_id`, `template_item_id`, `item_text`, `file_path`, `file_name`, `notes`, `done`, `completed_at`, `completed_by_user_id`, `created_at`, `updated_at`) VALUES
(1, 4, 1, NULL, 'Signed employment contract', NULL, NULL, NULL, 1, '2026-07-31 18:00:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(2, 4, 1, NULL, 'NBI / Police clearance', NULL, NULL, NULL, 1, '2026-07-31 18:05:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(3, 4, 1, NULL, 'Pre-employment medical exam', NULL, NULL, NULL, 0, NULL, NULL, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(4, 4, 1, NULL, 'SSS / PhilHealth / Pag-IBIG / TIN', NULL, NULL, NULL, 0, NULL, NULL, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(5, 4, 1, NULL, 'Birth certificate (PSA)', NULL, NULL, NULL, 0, NULL, NULL, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(6, 4, 1, NULL, 'Company orientation attended', NULL, NULL, NULL, 0, NULL, NULL, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(7, 4, 1, NULL, 'Uniform & ID issued', NULL, NULL, NULL, 0, NULL, NULL, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(8, 4, 1, NULL, 'Department on-the-job training', NULL, NULL, NULL, 0, NULL, NULL, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(9, 13, 2, NULL, 'Signed employment contract', NULL, NULL, NULL, 1, '2026-07-31 18:10:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(10, 13, 2, NULL, 'NBI / Police clearance', NULL, NULL, NULL, 1, '2026-07-31 18:12:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(11, 13, 2, NULL, 'Pre-employment medical exam', NULL, NULL, NULL, 1, '2026-08-01 17:00:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(12, 13, 2, NULL, 'SSS / PhilHealth / Pag-IBIG / TIN', NULL, NULL, NULL, 1, '2026-08-01 17:30:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(13, 13, 2, NULL, 'Birth certificate (PSA)', NULL, NULL, NULL, 1, '2026-08-01 18:00:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(14, 13, 2, NULL, 'Company orientation attended', NULL, NULL, NULL, 0, NULL, NULL, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(15, 13, 2, NULL, 'Uniform & ID issued', NULL, NULL, NULL, 0, NULL, NULL, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(16, 13, 2, NULL, 'Department on-the-job training', NULL, NULL, NULL, 0, NULL, NULL, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(17, 5, 3, NULL, 'Signed employment contract', NULL, NULL, NULL, 0, NULL, NULL, '2026-08-17 00:31:34', '2026-08-18 08:53:43'),
(18, 5, 3, NULL, 'NBI / Police clearance', NULL, NULL, NULL, 0, NULL, NULL, '2026-08-17 00:31:34', '2026-08-18 08:53:43'),
(19, 5, 3, NULL, 'Pre-employment medical exam', NULL, NULL, NULL, 0, NULL, NULL, '2026-08-17 00:31:34', '2026-08-18 08:53:44'),
(20, 5, 3, NULL, 'SSS / PhilHealth / Pag-IBIG / TIN', NULL, NULL, NULL, 0, NULL, NULL, '2026-08-17 00:31:34', '2026-08-18 08:53:44'),
(21, 5, 3, NULL, 'Birth certificate (PSA)', NULL, NULL, NULL, 0, NULL, NULL, '2026-08-17 00:31:34', '2026-08-18 08:53:45'),
(22, 5, 3, NULL, 'Company orientation attended', NULL, NULL, NULL, 0, NULL, NULL, '2026-08-17 00:31:34', '2026-08-18 08:53:45'),
(23, 5, 3, NULL, 'Uniform & ID issued', NULL, NULL, NULL, 0, NULL, NULL, '2026-08-17 00:31:34', '2026-08-18 08:53:46'),
(24, 5, 3, NULL, 'Department on-the-job training', NULL, NULL, NULL, 0, NULL, NULL, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(25, 14, 4, NULL, 'Signed employment contract', NULL, NULL, NULL, 1, '2026-02-25 18:00:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(26, 14, 4, NULL, 'NBI / Police clearance', NULL, NULL, NULL, 1, '2026-02-25 18:10:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(27, 14, 4, NULL, 'Pre-employment medical exam', NULL, NULL, NULL, 1, '2026-02-26 17:00:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(28, 14, 4, NULL, 'SSS / PhilHealth / Pag-IBIG / TIN', NULL, NULL, NULL, 1, '2026-02-26 17:30:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(29, 14, 4, NULL, 'Birth certificate (PSA)', NULL, NULL, NULL, 1, '2026-02-26 18:00:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(30, 14, 4, NULL, 'Company orientation attended', NULL, NULL, NULL, 1, '2026-02-27 16:00:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(31, 14, 4, NULL, 'Uniform & ID issued', NULL, NULL, NULL, 1, '2026-02-27 16:30:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(32, 14, 4, NULL, 'Department on-the-job training', NULL, NULL, NULL, 1, '2026-02-28 00:00:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(33, 6, 5, NULL, 'Signed employment contract', NULL, NULL, NULL, 1, '2025-09-11 18:00:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(34, 6, 5, NULL, 'NBI / Police clearance', NULL, NULL, NULL, 1, '2025-09-11 18:10:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(35, 6, 5, NULL, 'Pre-employment medical exam', NULL, NULL, NULL, 1, '2025-09-12 17:00:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(36, 6, 5, NULL, 'SSS / PhilHealth / Pag-IBIG / TIN', NULL, NULL, NULL, 1, '2025-09-12 17:30:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(37, 6, 5, NULL, 'Birth certificate (PSA)', NULL, NULL, NULL, 1, '2025-09-12 18:00:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(38, 6, 5, NULL, 'Company orientation attended', NULL, NULL, NULL, 1, '2025-09-14 16:00:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(39, 6, 5, NULL, 'Uniform & ID issued', NULL, NULL, NULL, 1, '2025-09-14 16:30:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(40, 6, 5, NULL, 'Regularization evaluation passed', NULL, NULL, NULL, 1, '2026-03-14 22:00:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(41, 15, 6, 9, 'Department orientation completed', NULL, NULL, NULL, 1, '2026-05-10 16:00:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(42, 15, 6, 10, 'Job description acknowledged', NULL, NULL, NULL, 1, '2026-05-10 16:20:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(43, 15, 6, 11, '1st month performance evaluation', NULL, NULL, NULL, 1, '2026-06-09 17:00:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(44, 15, 6, 12, '3rd month performance evaluation', NULL, NULL, NULL, 0, NULL, NULL, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(45, 15, 6, 13, '5th month performance evaluation', NULL, NULL, NULL, 0, NULL, NULL, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(46, 15, 6, 14, 'Training hours completed', NULL, NULL, NULL, 0, NULL, NULL, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(47, 16, 7, 9, 'Department orientation completed', NULL, NULL, NULL, 1, '2026-02-19 16:00:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(48, 16, 7, 10, 'Job description acknowledged', NULL, NULL, NULL, 1, '2026-02-19 16:20:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(49, 16, 7, 11, '1st month performance evaluation', NULL, NULL, NULL, 1, '2026-03-19 17:00:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(50, 16, 7, 12, '3rd month performance evaluation', NULL, NULL, NULL, 1, '2026-05-19 17:00:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(51, 16, 7, 13, '5th month performance evaluation', NULL, NULL, NULL, 0, NULL, NULL, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(52, 16, 7, 14, 'Training hours completed', NULL, NULL, NULL, 0, NULL, NULL, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(53, 17, 8, 9, 'Department orientation completed', NULL, NULL, NULL, 1, '2026-05-31 16:00:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(54, 17, 8, 10, 'Job description acknowledged', NULL, NULL, NULL, 0, NULL, NULL, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(55, 17, 8, 11, '1st month performance evaluation', NULL, NULL, NULL, 0, NULL, NULL, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(56, 17, 8, 12, '3rd month performance evaluation', NULL, NULL, NULL, 0, NULL, NULL, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(57, 17, 8, 13, '5th month performance evaluation', NULL, NULL, NULL, 0, NULL, NULL, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(58, 17, 8, 14, 'Training hours completed', NULL, NULL, NULL, 0, NULL, NULL, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(59, 18, 9, NULL, 'Regularization contract signed', NULL, NULL, NULL, 1, '2025-05-29 18:00:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(60, 18, 9, NULL, 'HMO enrollment submitted', NULL, NULL, NULL, 1, '2025-05-29 18:30:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(61, 18, 9, NULL, 'Leave credits activated', NULL, NULL, NULL, 1, '2025-06-01 17:00:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(62, 18, 9, NULL, 'Performance goals set', NULL, NULL, NULL, 1, '2025-06-01 17:30:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(63, 19, 10, NULL, 'Regularization contract signed', NULL, NULL, NULL, 1, '2025-03-13 18:00:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(64, 19, 10, NULL, 'HMO enrollment submitted', NULL, NULL, NULL, 1, '2025-03-13 18:30:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(65, 19, 10, NULL, 'Leave credits activated', NULL, NULL, NULL, 1, '2025-03-16 17:00:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(66, 19, 10, NULL, 'Performance goals set', NULL, NULL, NULL, 1, '2025-03-16 17:30:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(67, 20, 11, NULL, 'Regularization contract signed', NULL, NULL, NULL, 1, '2025-11-06 18:00:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(68, 20, 11, NULL, 'HMO enrollment submitted', NULL, NULL, NULL, 1, '2025-11-06 18:30:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(69, 20, 11, NULL, 'Leave credits activated', NULL, NULL, NULL, 1, '2025-11-09 17:00:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(70, 20, 11, NULL, 'Performance goals set', NULL, NULL, NULL, 0, NULL, NULL, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(71, 21, 12, NULL, 'Regularization contract signed', NULL, NULL, NULL, 1, '2025-01-22 18:00:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(72, 21, 12, NULL, 'HMO enrollment submitted', NULL, NULL, NULL, 1, '2025-01-22 18:30:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(73, 21, 12, NULL, 'Leave credits activated', NULL, NULL, NULL, 1, '2025-01-26 17:00:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(74, 21, 12, NULL, 'Performance goals set', NULL, NULL, NULL, 1, '2025-01-26 17:30:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(75, NULL, NULL, NULL, 'Signed employment contract', NULL, NULL, NULL, 1, '2026-08-16 22:55:40', NULL, '2026-08-16 22:52:32', '2026-08-16 22:55:40'),
(76, NULL, NULL, NULL, 'NBI / Police clearance', NULL, NULL, NULL, 1, '2026-08-16 22:55:41', NULL, '2026-08-16 22:52:32', '2026-08-16 22:55:41'),
(77, NULL, NULL, NULL, 'Pre-employment medical exam', NULL, NULL, NULL, 1, '2026-08-16 22:56:16', NULL, '2026-08-16 22:52:32', '2026-08-16 22:56:16'),
(78, NULL, NULL, NULL, 'SSS / PhilHealth / Pag-IBIG / TIN', NULL, NULL, NULL, 1, '2026-08-16 22:56:17', NULL, '2026-08-16 22:52:32', '2026-08-16 22:56:17'),
(79, NULL, NULL, NULL, 'Birth certificate (PSA)', NULL, NULL, NULL, 1, '2026-08-16 22:56:19', NULL, '2026-08-16 22:52:32', '2026-08-16 22:56:19'),
(80, NULL, NULL, NULL, 'Company orientation attended', NULL, NULL, NULL, 1, '2026-08-16 22:56:25', NULL, '2026-08-16 22:52:33', '2026-08-16 22:56:25'),
(81, NULL, NULL, NULL, 'Uniform & ID issued', NULL, NULL, NULL, 1, '2026-08-16 22:56:25', NULL, '2026-08-16 22:52:33', '2026-08-16 22:56:25'),
(82, NULL, NULL, NULL, 'Department on-the-job training', NULL, NULL, NULL, 1, '2026-08-16 22:56:24', NULL, '2026-08-16 22:52:33', '2026-08-16 22:56:24'),
(99, NULL, 14, NULL, 'Signed employment contract', NULL, NULL, NULL, 1, '2026-08-18 09:50:44', NULL, '2026-08-18 08:49:26', '2026-08-18 09:50:44'),
(100, NULL, 14, NULL, 'NBI / Police clearance', NULL, NULL, NULL, 1, '2026-08-18 09:50:44', NULL, '2026-08-18 08:49:26', '2026-08-18 09:50:44'),
(101, NULL, 14, NULL, 'Pre-employment medical exam', NULL, NULL, NULL, 1, '2026-08-18 11:01:11', NULL, '2026-08-18 08:49:26', '2026-08-18 11:01:11'),
(102, NULL, 14, NULL, 'SSS / PhilHealth / Pag-IBIG / TIN', NULL, NULL, NULL, 1, '2026-08-18 11:01:12', NULL, '2026-08-18 08:49:26', '2026-08-18 11:01:12'),
(103, NULL, 14, NULL, 'Birth certificate (PSA)', NULL, NULL, NULL, 1, '2026-08-18 11:01:12', NULL, '2026-08-18 08:49:26', '2026-08-18 11:01:12'),
(104, NULL, 14, NULL, 'Company orientation attended', NULL, NULL, NULL, 1, '2026-08-18 11:01:13', NULL, '2026-08-18 08:49:26', '2026-08-18 11:01:13'),
(105, NULL, 14, NULL, 'Uniform & ID issued', NULL, NULL, NULL, 1, '2026-08-18 11:01:17', NULL, '2026-08-18 08:49:26', '2026-08-18 11:01:17'),
(106, NULL, 14, NULL, 'Department on-the-job training', NULL, NULL, NULL, 1, '2026-08-18 11:01:18', NULL, '2026-08-18 08:49:26', '2026-08-18 11:01:18'),
(107, NULL, 15, NULL, 'Signed employment contract', NULL, NULL, NULL, 0, NULL, NULL, '2026-08-18 08:49:26', '2026-08-18 08:49:26'),
(108, NULL, 15, NULL, 'NBI / Police clearance', NULL, NULL, NULL, 0, NULL, NULL, '2026-08-18 08:49:26', '2026-08-18 08:49:26'),
(109, NULL, 15, NULL, 'Pre-employment medical exam', NULL, NULL, NULL, 0, NULL, NULL, '2026-08-18 08:49:26', '2026-08-18 08:49:26'),
(110, NULL, 15, NULL, 'SSS / PhilHealth / Pag-IBIG / TIN', NULL, NULL, NULL, 0, NULL, NULL, '2026-08-18 08:49:26', '2026-08-18 08:49:26'),
(111, NULL, 15, NULL, 'Birth certificate (PSA)', NULL, NULL, NULL, 0, NULL, NULL, '2026-08-18 08:49:26', '2026-08-18 08:49:26'),
(112, NULL, 15, NULL, 'Company orientation attended', NULL, NULL, NULL, 0, NULL, NULL, '2026-08-18 08:49:26', '2026-08-18 08:49:26'),
(113, NULL, 15, NULL, 'Uniform & ID issued', NULL, NULL, NULL, 0, NULL, NULL, '2026-08-18 08:49:26', '2026-08-18 08:49:26'),
(114, NULL, 15, NULL, 'Department on-the-job training', NULL, NULL, NULL, 0, NULL, NULL, '2026-08-18 08:49:26', '2026-08-18 08:49:26'),
(211, 4, 1, NULL, 'PREPRE', NULL, NULL, NULL, 0, NULL, NULL, '2026-08-18 08:51:16', '2026-08-18 08:51:16'),
(212, 13, 2, NULL, 'PREPRE', NULL, NULL, NULL, 0, NULL, NULL, '2026-08-18 08:51:16', '2026-08-18 08:51:16'),
(213, NULL, 14, NULL, 'PREPRE', NULL, NULL, NULL, 1, '2026-08-18 11:05:29', NULL, '2026-08-18 08:51:16', '2026-08-18 11:05:29'),
(214, NULL, 15, NULL, 'PREPRE', NULL, NULL, NULL, 0, NULL, NULL, '2026-08-18 08:51:16', '2026-08-18 08:51:16'),
(284, NULL, 16, NULL, 'Signed employment contract', NULL, NULL, NULL, 1, '2026-08-18 09:51:54', NULL, '2026-08-18 09:51:14', '2026-08-18 09:51:54'),
(285, NULL, 16, NULL, 'NBI / Police clearance', NULL, NULL, NULL, 1, '2026-08-18 09:51:54', NULL, '2026-08-18 09:51:14', '2026-08-18 09:51:54'),
(286, NULL, 16, NULL, 'Pre-employment medical exam', NULL, NULL, NULL, 0, NULL, NULL, '2026-08-18 09:51:14', '2026-08-18 09:51:52'),
(287, NULL, 16, NULL, 'SSS / PhilHealth / Pag-IBIG / TIN', NULL, NULL, NULL, 0, NULL, NULL, '2026-08-18 09:51:14', '2026-08-18 09:51:52'),
(288, NULL, 16, NULL, 'Birth certificate (PSA)', NULL, NULL, NULL, 0, NULL, NULL, '2026-08-18 09:51:14', '2026-08-18 09:51:53'),
(289, NULL, 16, NULL, 'Company orientation attended', NULL, NULL, NULL, 1, '2026-08-18 09:51:54', NULL, '2026-08-18 09:51:14', '2026-08-18 09:51:54'),
(290, NULL, 16, NULL, 'Uniform & ID issued', NULL, NULL, NULL, 1, '2026-08-18 09:51:46', NULL, '2026-08-18 09:51:14', '2026-08-18 09:51:46'),
(291, NULL, 16, NULL, 'Department on-the-job training', NULL, NULL, NULL, 1, '2026-08-18 09:51:46', NULL, '2026-08-18 09:51:14', '2026-08-18 09:51:46'),
(293, 5, 3, NULL, 'PROPRO', NULL, NULL, NULL, 0, NULL, NULL, '2026-08-18 09:54:03', '2026-08-18 09:54:03'),
(294, 14, 4, NULL, 'PROPRO', NULL, NULL, NULL, 0, NULL, NULL, '2026-08-18 09:54:03', '2026-08-18 09:54:03'),
(295, 15, 6, NULL, 'PROPRO', NULL, NULL, NULL, 0, NULL, NULL, '2026-08-18 09:54:03', '2026-08-18 09:54:03'),
(296, 16, 7, NULL, 'PROPRO', NULL, NULL, NULL, 0, NULL, NULL, '2026-08-18 09:54:03', '2026-08-18 09:54:03'),
(297, 17, 8, NULL, 'PROPRO', NULL, NULL, NULL, 0, NULL, NULL, '2026-08-18 09:54:03', '2026-08-18 09:54:03'),
(298, NULL, 16, NULL, 'PROPRO', NULL, NULL, NULL, 0, NULL, NULL, '2026-08-18 09:54:03', '2026-08-18 09:54:03'),
(301, NULL, 14, 122, 'PROSPROS', NULL, NULL, NULL, 0, NULL, NULL, '2026-08-18 11:06:44', '2026-08-18 11:06:44'),
(302, NULL, 19, 123, 'PRESPRES', NULL, NULL, NULL, 1, '2026-08-18 21:51:46', NULL, '2026-08-18 21:51:45', '2026-08-18 21:51:46');

-- --------------------------------------------------------

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
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `employee_position_history`
--

INSERT INTO `employee_position_history` (`position_history_id`, `employee_id`, `effective_date`, `change_type`, `old_position_id`, `new_position_id`, `old_salary_grade_id`, `new_salary_grade_id`, `notes`, `created_at`) VALUES
(1, 1, '2019-02-11', 'Employment', NULL, 10, NULL, 6, 'Initial hiring as Front Office Manager', '2026-08-17 17:41:34'),
(2, 2, '2018-06-04', 'Employment', NULL, 11, NULL, 7, 'Initial hiring as F&B Director', '2026-08-17 17:41:34'),
(3, 3, '2017-11-20', 'Employment', NULL, 13, NULL, 6, 'Initial hiring as Executive Housekeeper', '2026-08-17 17:41:34'),
(4, 4, '2026-08-04', 'Employment', NULL, 2, NULL, 4, 'Initial hiring as Guest Relations Officer', '2026-08-17 17:41:34'),
(5, 5, '2026-04-15', 'Employment', NULL, 5, NULL, 2, 'Initial hiring as Line Cook', '2026-08-17 17:41:34'),
(6, 6, '2025-09-16', 'Employment', NULL, 3, NULL, 1, 'Initial hiring as Restaurant Server', '2026-08-17 17:41:34'),
(7, 7, '2016-01-18', 'Employment', NULL, 14, NULL, 7, 'Initial hiring as HR & Administration Manager', '2026-08-17 17:41:34'),
(8, 8, '2021-05-03', 'Employment', NULL, 15, NULL, 4, 'Initial hiring as Floor Supervisor', '2026-08-17 17:41:34'),
(9, 9, '2015-03-02', 'Employment', NULL, 9, NULL, 7, 'Initial hiring as General Manager', '2026-08-17 17:41:34'),
(10, 10, '2017-07-10', 'Employment', NULL, 12, NULL, 7, 'Initial hiring as Executive Chef', '2026-08-17 17:41:34'),
(11, 11, '2020-02-03', 'Employment', NULL, 16, NULL, 4, 'Initial hiring as HR Officer', '2026-08-17 17:41:34'),
(12, 12, '2019-08-19', 'Employment', NULL, 17, NULL, 4, 'Initial hiring as Accounting Supervisor', '2026-08-17 17:41:34'),
(13, 13, '2026-08-04', 'Employment', NULL, 1, NULL, 2, 'Initial hiring as Front Desk Receptionist', '2026-08-17 17:41:34'),
(14, 14, '2026-03-01', 'Employment', NULL, 4, NULL, 1, 'Initial hiring as Bartender', '2026-08-17 17:41:34'),
(15, 15, '2026-05-11', 'Employment', NULL, 1, NULL, 2, 'Initial hiring as Front Desk Receptionist', '2026-08-17 17:41:34'),
(16, 16, '2026-02-20', 'Employment', NULL, 7, NULL, 1, 'Initial hiring as Housekeeping Attendant', '2026-08-17 17:41:34'),
(17, 17, '2026-06-01', 'Employment', NULL, 8, NULL, 3, 'Initial hiring as HR Assistant', '2026-08-17 17:41:34'),
(18, 18, '2025-06-02', 'Employment', NULL, 6, NULL, 5, 'Initial hiring as Pastry Chef', '2026-08-17 17:41:34'),
(19, 19, '2025-03-19', 'Employment', NULL, 7, NULL, 1, 'Initial hiring as Housekeeping Attendant', '2026-08-17 17:41:34'),
(20, 20, '2025-11-10', 'Employment', NULL, 2, NULL, 4, 'Initial hiring as Guest Relations Officer', '2026-08-17 17:41:34'),
(21, 21, '2025-01-27', 'Employment', NULL, 8, NULL, 3, 'Initial hiring as HR Assistant', '2026-08-17 17:41:34'),
(22, 22, '2026-05-04', 'Employment', NULL, 1, NULL, 2, 'Initial hiring as Front Desk Receptionist', '2026-08-17 17:41:34'),
(23, 23, '2026-03-06', 'Employment', NULL, 7, NULL, 1, 'Initial hiring as Housekeeping Attendant', '2026-08-17 17:41:34');

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
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`ess_category_id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ess_categories`
--

INSERT INTO `ess_categories` (`ess_category_id`, `code`, `name`, `description`, `is_open`, `sort_order`, `created_at`, `updated_at`) VALUES
(1, 'ESS-LEAVE', 'Leave', 'Vacation, sick, emergency and other leave filings.', 1, 1, '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(2, 'ESS-ATT', 'Attendance', 'Time in/out corrections, overtime and shift changes.', 1, 2, '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(3, 'ESS-PAY', 'Payroll', 'Payslips, payroll inquiries and salary certificates.', 1, 3, '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(4, 'ESS-PAYUPD', 'Payroll Update', 'Bank account, payment method and deduction updates.', 1, 4, '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(5, 'ESS-LOAN', 'Loan', 'Company loans, salary loans and cash advances.', 1, 5, '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(6, 'ESS-REIMB', 'Reimbursement', 'Transportation, travel and other expense claims.', 1, 6, '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(7, 'ESS-HRDOC', 'HR Document', 'Certificates, service records and employment verification.', 1, 7, '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(8, 'ESS-PINFO', 'Personal Info', 'Address, contact, civil status and government ID updates.', 1, 8, '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(9, 'ESS-ACCT', 'Account', 'Password resets and ESS account access issues.', 1, 9, '2026-08-17 17:41:34', '2026-08-17 17:41:34');

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
  `assigned_to_user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `details` text DEFAULT NULL,
  `review_note` text DEFAULT NULL,
  `returned_count` int(11) NOT NULL DEFAULT 0,
  `attachment_path` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`ess_request_id`),
  UNIQUE KEY `request_code` (`request_code`),
  KEY `idx_ess_requests_employee_id` (`employee_id`),
  KEY `idx_ess_requests_category_id` (`category_id`),
  KEY `idx_ess_requests_assigned_to_user_id` (`assigned_to_user_id`),
  KEY `idx_ess_requests_status` (`status`),
  KEY `idx_ess_requests_filed_at` (`filed_at`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `ess_requests`
--

INSERT INTO `ess_requests` (`ess_request_id`, `request_code`, `employee_id`, `category_id`, `request_type`, `filed_at`, `date_from`, `date_to`, `status`, `assigned_to_user_id`, `details`, `review_note`, `returned_count`, `attachment_path`, `created_at`, `updated_at`) VALUES
(1, 'REQ-4410', 5, 1, 'Sick Leave', '2026-07-25 01:00:00', '2026-07-27', '2026-07-27', 'Pending', 2, '1 day sick leave with medical certificate attached.', NULL, 0, '/uploads/ess/req-4410-medical.pdf', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(2, 'REQ-4409', 6, 7, 'Certificate of Employment', '2026-07-24 02:00:00', NULL, NULL, 'Under Review', 7, 'COE for bank loan application, needs salary details.', NULL, 0, NULL, '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(3, 'REQ-4408', 8, 2, 'Attendance Correction', '2026-07-24 03:00:00', NULL, NULL, 'Approved', 2, 'Missing time-out on 2026-07-22, verified with floor logbook.', 'Verified against floor logbook entry.', 0, NULL, '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(4, 'REQ-4407', 4, 3, 'Payslip Request', '2026-07-23 06:00:00', NULL, NULL, 'Completed', 8, 'Payslip copies for June 2026 cut-offs.', 'Copies released via HR portal.', 0, NULL, '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(5, 'REQ-4406', 5, 6, 'Transportation', '2026-07-21 01:00:00', NULL, NULL, 'Rejected', 8, 'Missing official receipt for claimed amount.', 'Official receipt not provided.', 1, NULL, '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(6, 'REQ-4405', 1, 5, 'Company Loan', '2026-07-20 05:00:00', NULL, NULL, 'Under Review', 8, 'PHP 50,000 company loan payable in 12 months.', NULL, 0, '/uploads/ess/req-4405-loan-agreement.pdf', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(7, 'REQ-4404', 8, 8, 'Contact Number Update', '2026-07-19 01:00:00', NULL, NULL, 'Completed', 7, 'Updated mobile number and emergency contact.', 'Record updated in 201 file.', 0, NULL, '2026-08-17 17:41:34', '2026-08-17 17:41:34');

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE IF NOT EXISTS `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `hr3_recommendations`
--

CREATE TABLE IF NOT EXISTS `hr3_recommendations` (
  `recommendation_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `employee_id` bigint(20) UNSIGNED NOT NULL,
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
  KEY `idx_hr3_recommendations_suggested_salary_grade_id` (`suggested_salary_grade_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `hr3_recommendations`
--

INSERT INTO `hr3_recommendations` (`recommendation_id`, `employee_id`, `recommendation_type`, `evaluation_score`, `evaluator_user_id`, `date_submitted`, `status`, `suggested_position_id`, `suggested_salary_grade_id`, `current_employment_type`, `comments`, `created_at`, `updated_at`) VALUES
(1, 4, 'Regularization', 94.80, 3, '2026-08-01', 'Pending HR Action', 2, 4, 'Probationary', 'Exceeded guest satisfaction metrics during 6-month evaluation window. Highly recommended for full regularization.', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(2, 5, 'Regularization', 91.20, NULL, '2026-07-28', 'Pending HR Action', 5, 2, 'Probationary', 'Punctual, excellent culinary prep speed and kitchen hygiene compliance. Recommended for regularization.', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(3, 6, 'Promotion', 96.50, NULL, '2026-08-03', 'Pending HR Action', NULL, 4, 'Regular', 'Demonstrated strong leadership during banquet events. Passed succession planning assessment with distinction.', '2026-08-17 17:41:34', '2026-08-17 17:41:34');

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
  `mode` varchar(20) NOT NULL,
  `interviewer_employee_id` bigint(20) UNSIGNED DEFAULT NULL,
  `interviewer_name` varchar(160) DEFAULT NULL,
  `status` varchar(20) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`interview_id`),
  UNIQUE KEY `uq_interviews_interview_code` (`interview_code`),
  KEY `fk_interviews_applicant_id` (`applicant_id`),
  KEY `fk_interviews_interviewer_employee_id` (`interviewer_employee_id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `interviews`
--

INSERT INTO `interviews` (`interview_id`, `interview_code`, `applicant_id`, `scheduled_date`, `scheduled_time`, `mode`, `interviewer_employee_id`, `interviewer_name`, `status`, `created_at`, `updated_at`) VALUES
(1, 'INT-201', 10, '2026-07-28', '09:00:00', 'On-site', 1, 'Ana Ramos', 'Scheduled', '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(2, 'INT-202', 2, '2026-07-28', '13:30:00', 'Virtual', 7, 'Juan Dela Cruz', 'Scheduled', '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(3, 'INT-203', 4, '2026-07-29', '16:00:00', 'On-site', 2, 'Chef Gabriel Mendoza', 'Scheduled', '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(4, 'INT-204', 5, '2026-07-30', '10:00:00', 'On-site', 2, 'Chef Gabriel Mendoza', 'Completed', '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(5, 'INT-205', 9, '2026-08-17', '08:00:00', 'On-site', 1, 'Chef Gabriel Mendoza', 'Scheduled', '2026-08-17 00:31:34', '2026-08-16 22:28:41'),
(12, 'INT-00207', 16, '2026-08-18', '08:00:00', 'On-site', NULL, 'Ana Ramos', 'Scheduled', '2026-08-18 04:03:48', '2026-08-18 04:03:48'),
(13, 'INT-00208', 15, '2026-08-18', '08:00:00', 'On-site', NULL, 'Ana Ramos', 'Scheduled', '2026-08-18 04:04:08', '2026-08-18 04:04:08'),
(14, 'INT-00209', 18, '2026-08-19', '08:00:00', 'On-site', NULL, 'Chef Gabriel Mendoza', 'Scheduled', '2026-08-18 05:40:08', '2026-08-18 10:46:32'),
(15, 'INT-00210', 17, '2026-08-18', '08:00:00', 'On-site', NULL, 'Ana Ramos', 'Scheduled', '2026-08-18 05:41:23', '2026-08-18 05:41:23'),
(16, 'INT-00211', 19, '2026-08-19', '08:00:00', 'On-site', NULL, 'Ana Ramos', 'Scheduled', '2026-08-18 08:17:21', '2026-08-18 08:17:45'),
(18, 'INT-00212', 22, '2026-08-19', '08:00:00', 'On-site', NULL, 'Ana Ramos', 'Scheduled', '2026-08-18 08:42:14', '2026-08-18 08:42:57'),
(19, 'INT-00213', 23, '2026-08-19', '08:00:00', 'On-site', NULL, 'Ana Ramos', 'Scheduled', '2026-08-18 08:47:20', '2026-08-18 08:47:20'),
(20, 'INT-00214', 24, '2026-08-19', '08:00:00', 'On-site', NULL, 'Ana Ramos', 'Scheduled', '2026-08-18 10:47:34', '2026-08-18 10:47:34');

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE IF NOT EXISTS `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_batches`
--

CREATE TABLE IF NOT EXISTS `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `experience_level` varchar(50) DEFAULT NULL,
  `education_level` varchar(100) DEFAULT NULL,
  `summary` text DEFAULT NULL,
  `description` text DEFAULT NULL,
  `responsibilities_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`responsibilities_json`)),
  `qualifications_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`qualifications_json`)),
  `skills_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`skills_json`)),
  `benefits_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`benefits_json`)),
  `picture` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`job_post_id`),
  UNIQUE KEY `uq_job_posts_slug` (`slug`),
  KEY `fk_job_posts_department_id` (`department_id`),
  KEY `fk_job_posts_position_id` (`position_id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `job_posts`
--

INSERT INTO `job_posts` (`job_post_id`, `slug`, `title`, `department_id`, `position_id`, `employment_type`, `schedule`, `salary_min`, `salary_max`, `vacancies`, `filled_count`, `posted_date`, `status`, `active`, `experience_level`, `education_level`, `summary`, `description`, `responsibilities_json`, `qualifications_json`, `skills_json`, `benefits_json`, `picture`, `created_at`, `updated_at`) VALUES
(1, 'bartender-1', 'Bartender', 2, 4, 'Full-time', 'Night Shift5', 190005.00, 230005.00, 25, 1, '2026-05-22', 'Open', 1, '1-2 Years', 'Bachelor\'s Degree', 'updated summary5', 'updated summary5', '[\"x5\"]', '[\"Bachelor\'s degree or College level in Hospitality Management or related field.\",\"Excellent communication and interpersonal skills.\",\"Basic computer skills.\",\"Customer service experience is an advantage.\",\"Willing to work shifts, weekends, and holidays.5\"]', '[\"Customer Service\",\"Communication\",\"Hotel Operations\",\"Problem Solving\",\"Time Management5\"]', '[\"HMO\",\"Service Charge\",\"Paid Leave\",\"Meal Allowance\",\"Career Growth5\"]', 'job-post-pictures/eHC33w4haLFV8cmXrtwFzis3ij8fOF9BxBddk1gs.jpg', '2026-08-17 00:31:34', '2026-08-18 09:21:14'),
(2, 'line-cook', 'Line Cook', 3, 5, 'Full-time', 'Shifting Schedule', 16000.00, 20000.00, 4, 2, '2026-05-18', 'Closed', 0, '1-2 Years', 'Vocational / TESDA', 'Prepare and cook menu items to standard, maintain station cleanliness and food safety compliance.', 'The Line Cook prepares and plates dishes according to Oxford Suites Makati recipes and standards, maintains a clean and organized station, and observes HACCP food-safety practices at all times.', '[\"Prepare mise en place before each service.\",\"Cook and plate dishes to recipe standards.\",\"Maintain sanitation and food-safety compliance.\",\"Monitor inventory levels of station ingredients.\",\"Support banquet and room-service volume peaks.\"]', '[\"TESDA NC II in Cookery or equivalent culinary training.\",\"At least 1 year in a hotel or full-service restaurant kitchen.\",\"Valid food handler\'s certificate.\",\"Able to work under pressure during peak service.\"]', '[\"Food Safety\",\"HACCP\",\"Knife Skills\",\"Plating\",\"Teamwork\"]', '[\"HMO\",\"Service Charge\",\"Meal Allowance\",\"Uniform\",\"Training\"]', NULL, '2026-08-17 00:31:34', '2026-08-18 09:20:37'),
(3, 'housekeeping-attendant', 'Housekeeping Attendant', 4, 7, 'Full-time', 'Shifting Schedule', 14000.00, 17000.00, 5, 3, '2026-05-10', 'Closed', 0, 'No Experience', 'High School Graduate', 'Maintain guestroom cleanliness, linen turnover, and public-area presentation to brand standards.', 'Housekeeping Attendants keep guestrooms and public areas immaculate, restock amenities, and report maintenance issues. Full training is provided for applicants with no prior hotel experience.', '[\"Clean and prepare assigned guestrooms daily.\",\"Replenish linens, towels, and amenities.\",\"Report maintenance and lost-and-found items.\",\"Maintain housekeeping cart and supplies.\"]', '[\"High School Graduate.\",\"Physically fit and detail-oriented.\",\"Willing to work shifts including weekends and holidays.\"]', '[\"Attention to Detail\",\"Time Management\",\"Room Turnover\",\"Safety\"]', '[\"HMO\",\"Service Charge\",\"Meal Allowance\",\"Uniform\"]', NULL, '2026-08-17 00:31:34', '2026-08-18 09:20:38'),
(4, 'restaurant-server', 'Restaurant Server', 2, 3, 'Full-time', 'Shifting Schedule', 15000.00, 18000.00, 4, 1, '2026-05-20', 'Closed', 0, 'No Experience', 'High School Graduate', 'Deliver warm, accurate table service across the dining room and banquet operations.', 'Restaurant Servers take orders, serve food and beverages, and ensure every guest leaves with a memorable dining experience at our all-day dining outlet.', '[\"Greet and seat guests warmly.\",\"Take and relay orders accurately to the kitchen.\",\"Serve food and beverages following service sequence.\",\"Handle billing and guest feedback.\"]', '[\"High School Graduate; hospitality training an advantage.\",\"Good communication skills in English and Filipino.\",\"Pleasant personality and grooming.\"]', '[\"Guest Service\",\"Upselling\",\"POS Systems\",\"Communication\"]', '[\"HMO\",\"Service Charge\",\"Meal Allowance\",\"Tips\"]', NULL, '2026-08-17 00:31:34', '2026-08-18 09:20:41'),
(5, 'bartender', 'Bartender', 2, 4, 'Part-time', 'Night Shift', 16000.00, 19000.00, 2, 0, '2026-05-15', 'Closed', 0, '3-5 Years', 'Vocational / TESDA', 'Craft classic and signature cocktails for the lobby lounge and rooftop bar.', 'The Bartender prepares beverages to recipe, manages bar inventory, and creates a lively yet refined guest experience at the lounge.', '[\"Prepare cocktails and beverages to standard.\",\"Maintain bar cleanliness and inventory.\",\"Engage guests and recommend pairings.\",\"Observe responsible alcohol service.\"]', '[\"TESDA Bartending NC II or equivalent.\",\"At least 3 years bar experience in hotels or restaurants.\",\"Knowledge of classic and modern mixology.\"]', '[\"Mixology\",\"Inventory Control\",\"Guest Engagement\",\"Cash Handling\"]', '[\"HMO\",\"Service Charge\",\"Meal Allowance\",\"Night Differential\"]', NULL, '2026-08-17 00:31:34', '2026-08-18 09:20:40'),
(6, 'hr-assistant', 'HR Assistant', 5, 8, 'Full-time', 'Day Shift', 20000.00, 25000.00, 1, 0, '2026-05-08', 'Closed', 0, '1-2 Years', 'Bachelor\'s Degree', 'Support recruitment, employee records, and HR document processing.', 'The HR Assistant supports end-to-end recruitment coordination, 201-file maintenance, and employee request processing for the property.', '[\"Coordinate interview schedules with department heads.\",\"Maintain complete and accurate 201 files.\",\"Process COE and employment verification requests.\",\"Assist in new-hire onboarding documentation.\"]', '[\"Bachelor\'s degree in Psychology, HR, or related field.\",\"At least 1 year HR experience.\",\"Strong organizational and documentation skills.\"]', '[\"Recruitment\",\"Documentation\",\"MS Office\",\"Confidentiality\"]', '[\"HMO\",\"Paid Leave\",\"Career Growth\",\"Training\"]', NULL, '2026-08-17 00:31:34', '2026-08-18 09:20:39'),
(12, 'general-manager', 'General Manager', 5, 9, 'Seasonal', 'Shifting Schedule5', 5.00, 5.00, 15, 0, '2026-08-18', 'Open', 1, NULL, NULL, '5', '5', '[\"5\"]', '[\"5\"]', '[\"5\"]', '[\"5\"]', 'job-post-pictures/N9uA1rNh0yLgaItzh0VLBSwZwTLgKGUhw7jKA9Mg.jpg', '2026-08-18 09:22:12', '2026-08-18 09:23:03'),
(13, 'hr-administration-manager', 'HR & Administration Manager', 5, 14, 'Full-time', 'Shifting Schedule', 0.00, 0.00, 1, 0, '2026-08-18', 'Open', 1, NULL, NULL, NULL, NULL, '[]', '[]', '[]', '[]', 'job-post-pictures/TV36vkczRy1cSnj20lFuGTJb3wjBYwIuFIziCXNu.jpg', '2026-08-18 09:32:56', '2026-08-18 09:32:56'),
(14, 'front-office-manager', 'Front Office Manager', 1, 10, 'Full-time', 'Shifting Schedule', 0.00, 0.00, 1, 0, '2026-08-19', 'Open', 1, NULL, NULL, NULL, NULL, '[]', '[]', '[]', '[]', 'job-post-pictures/ilbUmYCHlO6iCL5mkVMCfeCzmN2SmOpE9LWjNzII.png', '2026-08-19 04:53:42', '2026-08-19 04:53:42'),
(15, 'guest-relations-officer', 'Guest Relations Officer', 1, 2, 'Full-time', NULL, 20000.00, 28000.00, 1, 0, NULL, 'Open', 1, '1-2 Years', 'Bachelor\'s Degree', NULL, 'Welcomes and assists hotel guests, coordinates with front office and housekeeping, and handles service recovery.', NULL, '[\"Bachelor degree in Hospitality or related field\",\"At least 1 year guest-facing experience\"]', '[\"Guest Relations\",\"Front Office Operations\",\"Reservations\",\"Complaint Handling\"]', NULL, NULL, '2026-08-24 03:53:23', '2026-08-24 03:53:23'),
(16, 'front-desk-receptionist', 'Front Desk Receptionist', 1, 1, 'Full-time', NULL, 18000.00, 25000.00, 2, 0, NULL, 'Open', 1, '1-2 Years', 'Bachelor\'s Degree', NULL, 'Front-line hotel reception: check-in and check-out, reservations, guest inquiries, and coordination with housekeeping.', NULL, '[\"Bachelor degree in Hospitality or related field preferred\",\"At least 1 year front desk experience\"]', '[\"Guest Relations\",\"Check-in \\/ Check-out\",\"Reservations\",\"Property Management Systems\",\"Cash Handling\"]', NULL, NULL, '2026-08-24 04:04:50', '2026-08-24 04:04:50');

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
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `job_post_platforms`
--

INSERT INTO `job_post_platforms` (`job_post_platform_id`, `job_post_id`, `platform`, `published_at`, `status`, `created_at`) VALUES
(1, 1, 'Company Website', '2026-05-21 16:00:00', 'unpublished', '2026-08-17 00:31:34'),
(2, 1, 'Facebook', '2026-08-18 09:21:14', 'published', '2026-08-17 00:31:34'),
(3, 1, 'Indeed', '2026-08-18 09:21:14', 'published', '2026-08-17 00:31:34'),
(4, 2, 'Company Website', '2026-05-17 16:00:00', 'published', '2026-08-17 00:31:34'),
(5, 2, 'Indeed', '2026-05-17 17:30:00', 'published', '2026-08-17 00:31:34'),
(6, 3, 'Company Website', '2026-05-09 16:00:00', 'published', '2026-08-17 00:31:34'),
(7, 3, 'Facebook', '2026-05-09 16:20:00', 'published', '2026-08-17 00:31:34'),
(8, 4, 'Company Website', '2026-05-19 16:00:00', 'published', '2026-08-17 00:31:34'),
(9, 4, 'Facebook', '2026-05-19 16:30:00', 'published', '2026-08-17 00:31:34'),
(10, 4, 'Instagram', '2026-05-19 17:00:00', 'published', '2026-08-17 00:31:34'),
(11, 5, 'Company Website', '2026-05-14 16:00:00', 'published', '2026-08-17 00:31:34'),
(12, 5, 'Instagram', '2026-05-14 16:45:00', 'published', '2026-08-17 00:31:34'),
(13, 6, 'Company Website', '2026-05-07 16:00:00', 'published', '2026-08-17 00:31:34'),
(14, 6, 'Indeed', '2026-05-07 17:15:00', 'published', '2026-08-17 00:31:34'),
(22, 1, 'Website', '2026-08-18 09:21:14', 'published', '2026-08-18 17:21:14'),
(23, 12, 'Website', '2026-08-18 09:23:03', 'published', '2026-08-18 17:22:12'),
(24, 12, 'Facebook', '2026-08-18 09:23:03', 'published', '2026-08-18 17:22:12'),
(25, 12, 'Indeed', '2026-08-18 09:23:03', 'published', '2026-08-18 17:22:12'),
(26, 13, 'Website', '2026-08-18 09:32:56', 'published', '2026-08-18 17:32:56'),
(27, 13, 'Facebook', '2026-08-18 09:32:56', 'published', '2026-08-18 17:32:56'),
(28, 13, 'Indeed', '2026-08-18 09:32:56', 'published', '2026-08-18 17:32:56'),
(29, 14, 'Website', '2026-08-19 04:53:42', 'published', '2026-08-19 12:53:42'),
(30, 14, 'Facebook', '2026-08-19 04:53:42', 'published', '2026-08-19 12:53:42'),
(31, 14, 'Indeed', '2026-08-19 04:53:42', 'published', '2026-08-19 12:53:42');

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
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`course_id`),
  UNIQUE KEY `course_code` (`course_code`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `learning_courses`
--

INSERT INTO `learning_courses` (`course_id`, `course_code`, `title`, `category`, `description`, `created_at`, `updated_at`) VALUES
(1, 'LMS-101', 'Food Safety & Sanitation Level 2', 'Culinary & Safety', 'HACCP-based food safety and sanitation practices for kitchen staff.', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(2, 'LMS-102', 'Customer Excellence in Hospitality', 'Service Quality', 'Service standards and guest-excellence behaviors across guest-facing roles.', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(3, 'LMS-103', 'Fire Safety & Emergency Response', 'Compliance', 'Fire prevention, evacuation procedures, and emergency response drills.', '2026-08-17 17:41:34', '2026-08-17 17:41:34');

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
  UNIQUE KEY `uq_leave_balances_natural` (`employee_id`,`leave_type`,`period_year`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `leave_balances`
--

INSERT INTO `leave_balances` (`leave_balance_id`, `employee_id`, `leave_type`, `period_year`, `total_days`, `used_days`, `created_at`, `updated_at`) VALUES
(1, 5, 'Vacation Leave', 2026, 15.00, 4.00, '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(2, 5, 'Sick Leave', 2026, 15.00, 3.00, '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(3, 5, 'Emergency Leave', 2026, 5.00, 1.00, '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(4, 5, 'Solo Parent Leave', 2026, 7.00, 0.00, '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(5, 1, 'Vacation Leave', 2026, 15.00, 8.00, '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(6, 1, 'Sick Leave', 2026, 15.00, 5.00, '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(7, 1, 'Emergency Leave', 2026, 5.00, 2.00, '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(8, 6, 'Vacation Leave', 2026, 15.00, 6.00, '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(9, 6, 'Sick Leave', 2026, 15.00, 2.00, '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(10, 8, 'Vacation Leave', 2026, 15.00, 9.00, '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(11, 8, 'Sick Leave', 2026, 15.00, 4.00, '2026-08-17 17:41:34', '2026-08-17 17:41:34');

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE IF NOT EXISTS `migrations` (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=62 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '2026_08_19_000001_dedupe_employee_onboarding_items', 1),
(2, '2026_08_19_000002_dedupe_legacy_onboarding_item_duplicates', 2),
(3, '2026_08_18_000001_set_template_item_fk_set_null', 3),
(4, '0001_01_01_000000_create_users_table', 10),
(7, '0001_01_01_000003_create_departments_table', 10),
(8, '0001_01_01_000004_create_salary_grades_table', 10),
(9, '0001_01_01_000005_create_positions_table', 10),
(10, '0001_01_01_000006_create_employees_table', 10),
(11, '0001_01_01_000007_create_employee_emergency_contacts_table', 10),
(12, '0001_01_01_000008_create_employee_position_history_table', 10),
(13, '0001_01_01_000009_create_employee_exit_records_table', 10),
(14, '0001_01_01_000010_create_employee_documents_table', 10),
(15, '0001_01_01_000011_create_system_roles_table', 10),
(16, '0001_01_01_000012_create_role_permissions_table', 10),
(17, '0001_01_01_000013_create_system_users_table', 10),
(18, '0001_01_01_000014_create_notifications_table', 10),
(19, '0001_01_01_000015_create_user_login_activity_table', 10),
(20, '0001_01_01_000016_create_audit_logs_table', 10),
(21, '0001_01_01_000017_create_announcements_table', 10),
(22, '0001_01_01_000018_create_ess_categories_table', 10),
(23, '0001_01_01_000019_create_ess_requests_table', 10),
(24, '0001_01_01_000020_create_leave_balances_table', 10),
(25, '0001_01_01_000021_create_attendance_records_table', 10),
(26, '0001_01_01_000022_create_work_schedules_table', 10),
(27, '0001_01_01_000023_create_payroll_periods_table', 10),
(28, '0001_01_01_000024_create_payroll_records_table', 10),
(29, '0001_01_01_000025_create_payroll_items_table', 10),
(30, '0001_01_01_000026_create_employee_benefits_table', 10),
(31, '0001_01_01_000027_create_learning_courses_table', 10),
(32, '0001_01_01_000028_create_employee_learning_table', 10),
(33, '0001_01_01_000029_create_performance_reviews_table', 10),
(34, '0001_01_01_000030_create_hr3_recommendations_table', 10),
(35, '2025_01_01_000001_create_job_posts_table', 10),
(36, '2025_01_01_000002_create_job_post_platforms_table', 10),
(37, '2025_01_01_000003_create_requisitions_table', 10),
(38, '2025_01_01_000004_make_job_posts_position_required', 10),
(39, '2025_01_02_000001_create_applicants_table', 10),
(40, '2025_01_02_000002_create_applicant_screening_entities_table', 10),
(41, '2025_01_02_000003_create_applicant_screening_scores_table', 10),
(42, '2025_01_02_000004_create_interviews_table', 10),
(43, '2025_01_02_000005_create_applicant_assessments_table', 10),
(44, '2025_01_03_000001_create_new_hires_table', 10),
(45, '2025_01_03_000002_create_onboarding_checklist_templates_table', 10),
(46, '2025_01_03_000003_create_onboarding_checklist_items_table', 10),
(47, '2025_01_03_000004_create_employee_onboarding_items_table', 10),
(48, '2025_01_03_000005_create_checklist_requests_table', 10),
(49, '2025_01_04_000001_create_system_settings_table', 10),
(51, '2026_08_16_000001_add_picture_to_job_posts_table', 10),
(52, '2026_08_16_000002_make_employee_id_nullable_on_onboarding_items', 10),
(53, '2026_08_16_000004_add_accepted_to_applicants_stage_check', 10),
(54, '2026_08_18_000001_add_url_to_audit_logs_table', 10),
(55, '0001_01_01_000001_create_cache_table', 11),
(56, '0001_01_01_000002_create_jobs_table', 12),
(57, '2026_08_15_171717_create_personal_access_tokens_table', 13),
(58, '2026_08_23_000001_create_applicant_screenings_table', 14),
(59, '2026_08_22_000001_add_upload_and_instructions_to_onboarding_items', 15),
(60, '2026_08_23_000002_create_screening_ground_truths_table', 15),
(61, '2026_08_24_000001_create_screening_reference_data_table', 16);

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
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`new_hire_id`),
  UNIQUE KEY `uq_new_hires_new_hire_code` (`new_hire_code`),
  KEY `fk_new_hires_applicant_id` (`applicant_id`),
  KEY `fk_new_hires_department_id` (`department_id`),
  KEY `fk_new_hires_employee_id` (`employee_id`),
  KEY `fk_new_hires_position_id` (`position_id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `new_hires`
--

INSERT INTO `new_hires` (`new_hire_id`, `new_hire_code`, `applicant_id`, `employee_id`, `name`, `email`, `phone`, `position_id`, `department_id`, `stage`, `start_date`, `created_at`, `updated_at`) VALUES
(1, 'NH-01', 1, 4, 'Camille Ortega', 'camille.ortega@email.com', '0917 664 2219', 2, 1, 'Pre-onboarding', '2026-08-04', '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(2, 'NH-02', 10, 13, 'Bianca Soriano', 'bianca.soriano@email.com', '0912 345 6789', 1, 1, 'Pre-onboarding', '2026-08-04', '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(3, 'NH-03', 5, 5, 'Kevin Dela Cruz', 'kevin.delacruz@email.com', '0921 774 9903', 5, 3, 'Probationary', '2026-04-15', '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(4, 'NH-04', 4, 14, 'Jompaks Berdugo', 'jompaks.berdugo@email.com', '0933 552 1180', 4, 2, 'Probationary', '2026-03-01', '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(5, 'NH-05', 9, 6, 'Marjun Devera', 'marjun.devera@email.com', '0917 664 2219', 3, 2, 'Regular', '2025-09-16', '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(6, 'NH-06', NULL, 15, 'Angelo Torres', 'angelo.torres@email.com', '0917 220 5541', 1, 1, 'Probationary', '2026-05-11', '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(7, 'NH-07', NULL, 16, 'Ligaya Santos', 'ligaya.santos@email.com', '0918 663 2201', 7, 4, 'Probationary', '2026-02-20', '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(8, 'NH-08', NULL, 17, 'Michael Reyes', 'michael.reyes@email.com', '0920 441 8873', 8, 5, 'Probationary', '2026-06-01', '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(9, 'NH-09', NULL, 18, 'Patricia Gomez', 'patricia.gomez@email.com', '0917 903 2245', 6, 3, 'Regular', '2025-06-02', '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(10, 'NH-10', NULL, 19, 'Ernesto Villar', 'ernesto.villar@email.com', '0921 556 7743', 7, 4, 'Regular', '2025-03-19', '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(11, 'NH-11', NULL, 20, 'Grace Panganiban', 'grace.panganiban@email.com', '0917 332 8890', 2, 1, 'Regular', '2025-11-10', '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(12, 'NH-12', NULL, 21, 'Noel Fajardo', 'noel.fajardo@email.com', '0918 774 3320', 8, 5, 'Regular', '2025-01-27', '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(14, 'NH-00013', 23, NULL, 'bcbc', 'bcbc@mga.com', '0912312300', 1, 1, 'Probationary', '2026-08-18', '2026-08-18 08:48:00', '2026-08-18 11:06:44'),
(15, 'NH-00014', 22, NULL, 'imga1', 'imga1@gmail.com', '09123123001', 1, 1, 'Pre-onboarding', '2026-08-18', '2026-08-18 08:48:29', '2026-08-18 08:48:29'),
(16, 'NH-00015', 16, NULL, 'im1', 'im1@gmail.com', '0912312300', 4, 2, 'Probationary', '2026-08-18', '2026-08-18 09:51:02', '2026-08-18 09:52:14'),
(18, 'NH-00016', 23, NULL, 'bcbc', 'bcbc@mga.com', '0912312300', 4, 2, 'Pre-onboarding', '2026-08-18', '2026-08-18 10:43:08', '2026-08-18 10:43:08'),
(19, 'NH-00017', 19, NULL, 'ADMIN-img2', 'ADMIN-img2@gmail.com', '0912312300', 4, 2, 'Probationary', '2026-08-18', '2026-08-18 10:44:40', '2026-08-18 21:52:05'),
(20, 'NH-00018', 24, NULL, 'f1', 'f1@gmail.com', '0912312300', 4, 2, 'Pre-onboarding', '2026-08-18', '2026-08-18 10:48:14', '2026-08-18 10:48:14');

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
  KEY `fk_notifications_system_user_id` (`system_user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=94 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`notification_id`, `system_user_id`, `type`, `title`, `body`, `module_name`, `target_type`, `target_id`, `is_read`, `read_at`, `created_at`) VALUES
(1, 2, 'ess_request', 'New ESS request pending', 'Sick leave request REQ-4410 filed by Kevin Dela Cruz awaits review.', 'ESS Management', 'ess_request', 'REQ-4410', 0, NULL, '2026-08-17 00:31:35'),
(2, 2, 'hr3', 'HR3 recommendation pending', 'Regularization recommendation for Camille Ortega is pending HR action.', 'Core HCM', 'hr3_recommendation', 'HR3-REC-01', 0, NULL, '2026-08-17 00:31:35'),
(3, 2, 'checklist', 'Checklist request raised', 'Miguel Torres probationary checklist requested (CR-001).', 'New Hire Onboarding', 'checklist_request', 'CR-001', 0, NULL, '2026-08-17 00:31:35'),
(4, 2, 'checklist', 'Checklist request raised', 'Andrea Lim probationary checklist requested (CR-002).', 'New Hire Onboarding', 'checklist_request', 'CR-002', 0, NULL, '2026-08-17 00:31:35'),
(5, 3, 'ess_request', 'Interview reminder', 'Interview with Bianca Soriano scheduled for 2026-07-28, 09:00 AM.', 'Applicant Management', 'interview', 'INT-201', 0, NULL, '2026-08-17 00:31:35'),
(6, 3, 'hr3', 'HR3 recommendation submitted', 'Regularization recommendation for Camille Ortega submitted for review.', 'Core HCM', 'hr3_recommendation', 'HR3-REC-01', 1, '2026-08-01 17:00:00', '2026-08-17 00:31:35'),
(7, 1, 'audit', 'Critical audit event', 'Permission matrix was modified for role Admin.', 'User Management', 'audit_log', 'LOG-9001', 0, NULL, '2026-08-17 00:31:35'),
(8, 7, 'ess_request', 'COE request assigned', 'Certificate of Employment request REQ-4409 assigned to you.', 'ESS Management', 'ess_request', 'REQ-4409', 0, NULL, '2026-08-17 00:31:35'),
(9, 8, 'ess_request', 'Loan application under review', 'Company loan application REQ-4405 assigned to you.', 'ESS Management', 'ess_request', 'REQ-4405', 0, NULL, '2026-08-17 00:31:35'),
(10, 1, 'info', 'New applicant: MARIA SANTOS', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '26', 0, NULL, '2026-08-22 15:48:31'),
(11, 2, 'info', 'New applicant: MARIA SANTOS', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '26', 0, NULL, '2026-08-22 15:48:31'),
(12, 3, 'info', 'New applicant: MARIA SANTOS', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '26', 0, NULL, '2026-08-22 15:48:31'),
(13, 4, 'info', 'New applicant: MARIA SANTOS', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '26', 0, NULL, '2026-08-22 15:48:31'),
(14, 6, 'info', 'New applicant: MARIA SANTOS', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '26', 0, NULL, '2026-08-22 15:48:31'),
(15, 7, 'info', 'New applicant: MARIA SANTOS', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '26', 0, NULL, '2026-08-22 15:48:31'),
(16, 8, 'info', 'New applicant: MARIA SANTOS', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '26', 0, NULL, '2026-08-22 15:48:31'),
(17, 10, 'info', 'New applicant: MARIA SANTOS', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '26', 0, NULL, '2026-08-22 15:48:31'),
(18, 11, 'info', 'New applicant: MARIA SANTOS', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '26', 0, NULL, '2026-08-22 15:48:31'),
(19, 12, 'info', 'New applicant: MARIA SANTOS', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '26', 0, NULL, '2026-08-22 15:48:31'),
(20, 13, 'info', 'New applicant: MARIA SANTOS', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '26', 0, NULL, '2026-08-22 15:48:31'),
(21, 14, 'info', 'New applicant: MARIA SANTOS', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '26', 0, NULL, '2026-08-22 15:48:31'),
(22, 15, 'info', 'New applicant: MARIA SANTOS', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '26', 0, NULL, '2026-08-22 15:48:31'),
(23, 16, 'info', 'New applicant: MARIA SANTOS', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '26', 0, NULL, '2026-08-22 15:48:31'),
(24, 1, 'info', 'New applicant: MARIA SANTOS', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '27', 0, NULL, '2026-08-22 15:51:53'),
(25, 2, 'info', 'New applicant: MARIA SANTOS', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '27', 0, NULL, '2026-08-22 15:51:53'),
(26, 3, 'info', 'New applicant: MARIA SANTOS', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '27', 0, NULL, '2026-08-22 15:51:53'),
(27, 4, 'info', 'New applicant: MARIA SANTOS', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '27', 0, NULL, '2026-08-22 15:51:53'),
(28, 6, 'info', 'New applicant: MARIA SANTOS', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '27', 0, NULL, '2026-08-22 15:51:53'),
(29, 7, 'info', 'New applicant: MARIA SANTOS', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '27', 0, NULL, '2026-08-22 15:51:53'),
(30, 8, 'info', 'New applicant: MARIA SANTOS', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '27', 0, NULL, '2026-08-22 15:51:53'),
(31, 10, 'info', 'New applicant: MARIA SANTOS', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '27', 0, NULL, '2026-08-22 15:51:53'),
(32, 11, 'info', 'New applicant: MARIA SANTOS', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '27', 0, NULL, '2026-08-22 15:51:53'),
(33, 12, 'info', 'New applicant: MARIA SANTOS', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '27', 0, NULL, '2026-08-22 15:51:53'),
(34, 13, 'info', 'New applicant: MARIA SANTOS', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '27', 0, NULL, '2026-08-22 15:51:53'),
(35, 14, 'info', 'New applicant: MARIA SANTOS', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '27', 0, NULL, '2026-08-22 15:51:53'),
(36, 15, 'info', 'New applicant: MARIA SANTOS', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '27', 0, NULL, '2026-08-22 15:51:53'),
(37, 16, 'info', 'New applicant: MARIA SANTOS', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '27', 0, NULL, '2026-08-22 15:51:53'),
(38, 1, 'info', 'New applicant: TEST PDF OFFLINE', 'Submitted application with screening score 0%.', 'Applicant Management', 'Applicant', '28', 0, NULL, '2026-08-22 15:54:20'),
(39, 2, 'info', 'New applicant: TEST PDF OFFLINE', 'Submitted application with screening score 0%.', 'Applicant Management', 'Applicant', '28', 0, NULL, '2026-08-22 15:54:20'),
(40, 3, 'info', 'New applicant: TEST PDF OFFLINE', 'Submitted application with screening score 0%.', 'Applicant Management', 'Applicant', '28', 0, NULL, '2026-08-22 15:54:20'),
(41, 4, 'info', 'New applicant: TEST PDF OFFLINE', 'Submitted application with screening score 0%.', 'Applicant Management', 'Applicant', '28', 0, NULL, '2026-08-22 15:54:20'),
(42, 6, 'info', 'New applicant: TEST PDF OFFLINE', 'Submitted application with screening score 0%.', 'Applicant Management', 'Applicant', '28', 0, NULL, '2026-08-22 15:54:20'),
(43, 7, 'info', 'New applicant: TEST PDF OFFLINE', 'Submitted application with screening score 0%.', 'Applicant Management', 'Applicant', '28', 0, NULL, '2026-08-22 15:54:20'),
(44, 8, 'info', 'New applicant: TEST PDF OFFLINE', 'Submitted application with screening score 0%.', 'Applicant Management', 'Applicant', '28', 0, NULL, '2026-08-22 15:54:20'),
(45, 10, 'info', 'New applicant: TEST PDF OFFLINE', 'Submitted application with screening score 0%.', 'Applicant Management', 'Applicant', '28', 0, NULL, '2026-08-22 15:54:20'),
(46, 11, 'info', 'New applicant: TEST PDF OFFLINE', 'Submitted application with screening score 0%.', 'Applicant Management', 'Applicant', '28', 0, NULL, '2026-08-22 15:54:20'),
(47, 12, 'info', 'New applicant: TEST PDF OFFLINE', 'Submitted application with screening score 0%.', 'Applicant Management', 'Applicant', '28', 0, NULL, '2026-08-22 15:54:20'),
(48, 13, 'info', 'New applicant: TEST PDF OFFLINE', 'Submitted application with screening score 0%.', 'Applicant Management', 'Applicant', '28', 0, NULL, '2026-08-22 15:54:20'),
(49, 14, 'info', 'New applicant: TEST PDF OFFLINE', 'Submitted application with screening score 0%.', 'Applicant Management', 'Applicant', '28', 0, NULL, '2026-08-22 15:54:20'),
(50, 15, 'info', 'New applicant: TEST PDF OFFLINE', 'Submitted application with screening score 0%.', 'Applicant Management', 'Applicant', '28', 0, NULL, '2026-08-22 15:54:20'),
(51, 16, 'info', 'New applicant: TEST PDF OFFLINE', 'Submitted application with screening score 0%.', 'Applicant Management', 'Applicant', '28', 0, NULL, '2026-08-22 15:54:20'),
(52, 1, 'info', 'New applicant: MARIA SANTOS', 'Submitted application with screening score 57.00%.', 'Applicant Management', 'Applicant', '29', 0, NULL, '2026-08-22 17:09:11'),
(53, 2, 'info', 'New applicant: MARIA SANTOS', 'Submitted application with screening score 57.00%.', 'Applicant Management', 'Applicant', '29', 0, NULL, '2026-08-22 17:09:11'),
(54, 3, 'info', 'New applicant: MARIA SANTOS', 'Submitted application with screening score 57.00%.', 'Applicant Management', 'Applicant', '29', 0, NULL, '2026-08-22 17:09:11'),
(55, 4, 'info', 'New applicant: MARIA SANTOS', 'Submitted application with screening score 57.00%.', 'Applicant Management', 'Applicant', '29', 0, NULL, '2026-08-22 17:09:11'),
(56, 6, 'info', 'New applicant: MARIA SANTOS', 'Submitted application with screening score 57.00%.', 'Applicant Management', 'Applicant', '29', 0, NULL, '2026-08-22 17:09:11'),
(57, 7, 'info', 'New applicant: MARIA SANTOS', 'Submitted application with screening score 57.00%.', 'Applicant Management', 'Applicant', '29', 0, NULL, '2026-08-22 17:09:11'),
(58, 8, 'info', 'New applicant: MARIA SANTOS', 'Submitted application with screening score 57.00%.', 'Applicant Management', 'Applicant', '29', 0, NULL, '2026-08-22 17:09:11'),
(59, 10, 'info', 'New applicant: MARIA SANTOS', 'Submitted application with screening score 57.00%.', 'Applicant Management', 'Applicant', '29', 0, NULL, '2026-08-22 17:09:11'),
(60, 11, 'info', 'New applicant: MARIA SANTOS', 'Submitted application with screening score 57.00%.', 'Applicant Management', 'Applicant', '29', 0, NULL, '2026-08-22 17:09:11'),
(61, 12, 'info', 'New applicant: MARIA SANTOS', 'Submitted application with screening score 57.00%.', 'Applicant Management', 'Applicant', '29', 0, NULL, '2026-08-22 17:09:11'),
(62, 13, 'info', 'New applicant: MARIA SANTOS', 'Submitted application with screening score 57.00%.', 'Applicant Management', 'Applicant', '29', 0, NULL, '2026-08-22 17:09:11'),
(63, 14, 'info', 'New applicant: MARIA SANTOS', 'Submitted application with screening score 57.00%.', 'Applicant Management', 'Applicant', '29', 0, NULL, '2026-08-22 17:09:11'),
(64, 15, 'info', 'New applicant: MARIA SANTOS', 'Submitted application with screening score 57.00%.', 'Applicant Management', 'Applicant', '29', 0, NULL, '2026-08-22 17:09:11'),
(65, 16, 'info', 'New applicant: MARIA SANTOS', 'Submitted application with screening score 57.00%.', 'Applicant Management', 'Applicant', '29', 0, NULL, '2026-08-22 17:09:11'),
(66, 1, 'info', 'New applicant: Basil Fawty', 'Submitted application with screening score 42.00%.', 'Applicant Management', 'Applicant', '30', 0, NULL, '2026-08-22 18:31:16'),
(67, 2, 'info', 'New applicant: Basil Fawty', 'Submitted application with screening score 42.00%.', 'Applicant Management', 'Applicant', '30', 0, NULL, '2026-08-22 18:31:16'),
(68, 3, 'info', 'New applicant: Basil Fawty', 'Submitted application with screening score 42.00%.', 'Applicant Management', 'Applicant', '30', 0, NULL, '2026-08-22 18:31:16'),
(69, 4, 'info', 'New applicant: Basil Fawty', 'Submitted application with screening score 42.00%.', 'Applicant Management', 'Applicant', '30', 0, NULL, '2026-08-22 18:31:16'),
(70, 6, 'info', 'New applicant: Basil Fawty', 'Submitted application with screening score 42.00%.', 'Applicant Management', 'Applicant', '30', 0, NULL, '2026-08-22 18:31:16'),
(71, 7, 'info', 'New applicant: Basil Fawty', 'Submitted application with screening score 42.00%.', 'Applicant Management', 'Applicant', '30', 0, NULL, '2026-08-22 18:31:16'),
(72, 8, 'info', 'New applicant: Basil Fawty', 'Submitted application with screening score 42.00%.', 'Applicant Management', 'Applicant', '30', 0, NULL, '2026-08-22 18:31:16'),
(73, 10, 'info', 'New applicant: Basil Fawty', 'Submitted application with screening score 42.00%.', 'Applicant Management', 'Applicant', '30', 0, NULL, '2026-08-22 18:31:16'),
(74, 11, 'info', 'New applicant: Basil Fawty', 'Submitted application with screening score 42.00%.', 'Applicant Management', 'Applicant', '30', 0, NULL, '2026-08-22 18:31:16'),
(75, 12, 'info', 'New applicant: Basil Fawty', 'Submitted application with screening score 42.00%.', 'Applicant Management', 'Applicant', '30', 0, NULL, '2026-08-22 18:31:16'),
(76, 13, 'info', 'New applicant: Basil Fawty', 'Submitted application with screening score 42.00%.', 'Applicant Management', 'Applicant', '30', 0, NULL, '2026-08-22 18:31:16'),
(77, 14, 'info', 'New applicant: Basil Fawty', 'Submitted application with screening score 42.00%.', 'Applicant Management', 'Applicant', '30', 0, NULL, '2026-08-22 18:31:16'),
(78, 15, 'info', 'New applicant: Basil Fawty', 'Submitted application with screening score 42.00%.', 'Applicant Management', 'Applicant', '30', 0, NULL, '2026-08-22 18:31:16'),
(79, 16, 'info', 'New applicant: Basil Fawty', 'Submitted application with screening score 42.00%.', 'Applicant Management', 'Applicant', '30', 0, NULL, '2026-08-22 18:31:16'),
(80, 1, 'info', 'New applicant: Julian Rivera', 'Submitted application with screening score 79.00%.', 'Applicant Management', 'Applicant', '31', 0, NULL, '2026-08-23 09:50:39'),
(81, 2, 'info', 'New applicant: Julian Rivera', 'Submitted application with screening score 79.00%.', 'Applicant Management', 'Applicant', '31', 0, NULL, '2026-08-23 09:50:39'),
(82, 3, 'info', 'New applicant: Julian Rivera', 'Submitted application with screening score 79.00%.', 'Applicant Management', 'Applicant', '31', 0, NULL, '2026-08-23 09:50:39'),
(83, 4, 'info', 'New applicant: Julian Rivera', 'Submitted application with screening score 79.00%.', 'Applicant Management', 'Applicant', '31', 0, NULL, '2026-08-23 09:50:39'),
(84, 6, 'info', 'New applicant: Julian Rivera', 'Submitted application with screening score 79.00%.', 'Applicant Management', 'Applicant', '31', 0, NULL, '2026-08-23 09:50:39'),
(85, 7, 'info', 'New applicant: Julian Rivera', 'Submitted application with screening score 79.00%.', 'Applicant Management', 'Applicant', '31', 0, NULL, '2026-08-23 09:50:39'),
(86, 8, 'info', 'New applicant: Julian Rivera', 'Submitted application with screening score 79.00%.', 'Applicant Management', 'Applicant', '31', 0, NULL, '2026-08-23 09:50:39'),
(87, 10, 'info', 'New applicant: Julian Rivera', 'Submitted application with screening score 79.00%.', 'Applicant Management', 'Applicant', '31', 0, NULL, '2026-08-23 09:50:39'),
(88, 11, 'info', 'New applicant: Julian Rivera', 'Submitted application with screening score 79.00%.', 'Applicant Management', 'Applicant', '31', 0, NULL, '2026-08-23 09:50:39'),
(89, 12, 'info', 'New applicant: Julian Rivera', 'Submitted application with screening score 79.00%.', 'Applicant Management', 'Applicant', '31', 0, NULL, '2026-08-23 09:50:39'),
(90, 13, 'info', 'New applicant: Julian Rivera', 'Submitted application with screening score 79.00%.', 'Applicant Management', 'Applicant', '31', 0, NULL, '2026-08-23 09:50:39'),
(91, 14, 'info', 'New applicant: Julian Rivera', 'Submitted application with screening score 79.00%.', 'Applicant Management', 'Applicant', '31', 0, NULL, '2026-08-23 09:50:39'),
(92, 15, 'info', 'New applicant: Julian Rivera', 'Submitted application with screening score 79.00%.', 'Applicant Management', 'Applicant', '31', 0, NULL, '2026-08-23 09:50:39'),
(93, 16, 'info', 'New applicant: Julian Rivera', 'Submitted application with screening score 79.00%.', 'Applicant Management', 'Applicant', '31', 0, NULL, '2026-08-23 09:50:39');

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
  KEY `fk_onboarding_checklist_items_template_id` (`template_id`)
) ENGINE=InnoDB AUTO_INCREMENT=125 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `onboarding_checklist_items`
--

INSERT INTO `onboarding_checklist_items` (`template_item_id`, `template_id`, `item_text`, `instructions`, `requires_upload`, `upload_placeholder`, `sort_order`, `created_at`) VALUES
(9, 2, 'Department orientation completed', NULL, 0, NULL, 1, '2026-08-17 00:31:34'),
(10, 2, 'Job description acknowledged', NULL, 0, NULL, 2, '2026-08-17 00:31:34'),
(11, 2, '1st month performance evaluation', NULL, 0, NULL, 3, '2026-08-17 00:31:34'),
(12, 2, '3rd month performance evaluation', NULL, 0, NULL, 4, '2026-08-17 00:31:34'),
(13, 2, '5th month performance evaluation', NULL, 0, NULL, 5, '2026-08-17 00:31:34'),
(14, 2, 'Training hours completed', NULL, 0, NULL, 6, '2026-08-17 00:31:34'),
(122, 8, 'PROSPROS', NULL, 0, NULL, 0, '2026-08-18 19:03:07'),
(123, 9, 'PRESPRES', NULL, 0, NULL, 0, '2026-08-18 19:03:48'),
(124, 8, 'P_R_O', NULL, 0, NULL, 1, '2026-08-18 19:13:25');

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
  UNIQUE KEY `uq_onboarding_checklist_templates_template_code` (`template_code`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `onboarding_checklist_templates`
--

INSERT INTO `onboarding_checklist_templates` (`template_id`, `template_code`, `title`, `phase`, `position_scope_json`, `status`, `created_at`, `updated_at`) VALUES
(2, 'TPL-002', 'Standard Probationary Checklist', 'Probationary', '[]', 'Inactive', '2026-08-17 00:31:34', '2026-08-16 22:53:17'),
(8, 'OCT-0008', 'PROSs', 'Probationary', '[]', 'Inactive', '2026-08-18 11:03:07', '2026-08-19 07:10:59'),
(9, 'OCT-0009', 'PRESs', 'Pre-onboarding', '[]', 'Inactive', '2026-08-18 11:03:48', '2026-08-19 07:10:46');

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
) ENGINE=InnoDB AUTO_INCREMENT=62 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payroll_items`
--

INSERT INTO `payroll_items` (`payroll_item_id`, `payroll_record_id`, `item_type`, `label`, `amount`, `created_at`) VALUES
(1, 1, 'Earning', 'Basic Pay', 8000.00, '2026-08-17 17:41:34'),
(2, 1, 'Earning', 'Overtime Pay', 950.00, '2026-08-17 17:41:34'),
(3, 1, 'Earning', 'Night Differential', 400.00, '2026-08-17 17:41:34'),
(4, 1, 'Earning', 'Meal Allowance', 750.00, '2026-08-17 17:41:34'),
(5, 1, 'Earning', 'Service Charge', 500.00, '2026-08-17 17:41:34'),
(6, 1, 'Deduction', 'SSS', 450.00, '2026-08-17 17:41:34'),
(7, 1, 'Deduction', 'PhilHealth', 275.00, '2026-08-17 17:41:34'),
(8, 1, 'Deduction', 'Pag-IBIG', 100.00, '2026-08-17 17:41:34'),
(9, 1, 'Deduction', 'Withholding Tax', 575.00, '2026-08-17 17:41:34'),
(10, 1, 'Deduction', 'Company Loan', 225.00, '2026-08-17 17:41:34'),
(11, 2, 'Earning', 'Basic Pay', 8000.00, '2026-08-17 17:41:34'),
(12, 2, 'Earning', 'Overtime Pay', 1000.00, '2026-08-17 17:41:34'),
(13, 2, 'Earning', 'Night Differential', 400.00, '2026-08-17 17:41:34'),
(14, 2, 'Earning', 'Meal Allowance', 750.00, '2026-08-17 17:41:34'),
(15, 2, 'Earning', 'Service Charge', 500.00, '2026-08-17 17:41:34'),
(16, 2, 'Deduction', 'SSS', 450.00, '2026-08-17 17:41:34'),
(17, 2, 'Deduction', 'PhilHealth', 275.00, '2026-08-17 17:41:34'),
(18, 2, 'Deduction', 'Pag-IBIG', 100.00, '2026-08-17 17:41:34'),
(19, 2, 'Deduction', 'Withholding Tax', 560.00, '2026-08-17 17:41:34'),
(20, 2, 'Deduction', 'Company Loan', 225.00, '2026-08-17 17:41:34'),
(21, 3, 'Earning', 'Basic Pay', 8000.00, '2026-08-17 17:41:34'),
(22, 3, 'Earning', 'Overtime Pay', 1050.00, '2026-08-17 17:41:34'),
(23, 3, 'Earning', 'Night Differential', 450.00, '2026-08-17 17:41:34'),
(24, 3, 'Earning', 'Meal Allowance', 750.00, '2026-08-17 17:41:34'),
(25, 3, 'Earning', 'Service Charge', 500.00, '2026-08-17 17:41:34'),
(26, 3, 'Deduction', 'SSS', 450.00, '2026-08-17 17:41:34'),
(27, 3, 'Deduction', 'PhilHealth', 275.00, '2026-08-17 17:41:34'),
(28, 3, 'Deduction', 'Pag-IBIG', 100.00, '2026-08-17 17:41:34'),
(29, 3, 'Deduction', 'Withholding Tax', 580.00, '2026-08-17 17:41:34'),
(30, 3, 'Deduction', 'Company Loan', 225.00, '2026-08-17 17:41:34'),
(31, 4, 'Earning', 'Basic Pay', 16000.00, '2026-08-17 17:41:34'),
(32, 4, 'Earning', 'Overtime Pay', 2100.00, '2026-08-17 17:41:34'),
(33, 4, 'Earning', 'Night Differential', 900.00, '2026-08-17 17:41:34'),
(34, 4, 'Earning', 'Meal Allowance', 1500.00, '2026-08-17 17:41:34'),
(35, 4, 'Earning', 'Service Charge', 1000.00, '2026-08-17 17:41:34'),
(36, 4, 'Deduction', 'SSS', 900.00, '2026-08-17 17:41:34'),
(37, 4, 'Deduction', 'PhilHealth', 550.00, '2026-08-17 17:41:34'),
(38, 4, 'Deduction', 'Pag-IBIG', 200.00, '2026-08-17 17:41:34'),
(39, 4, 'Deduction', 'Withholding Tax', 1160.00, '2026-08-17 17:41:34'),
(40, 4, 'Deduction', 'Company Loan', 450.00, '2026-08-17 17:41:34'),
(41, 5, 'Earning', 'Basic Pay', 14000.00, '2026-08-17 17:41:34'),
(42, 5, 'Earning', 'Service Charge', 1800.00, '2026-08-17 17:41:34'),
(43, 5, 'Earning', 'Meal Allowance', 1600.00, '2026-08-17 17:41:34'),
(44, 5, 'Deduction', 'SSS', 700.00, '2026-08-17 17:41:34'),
(45, 5, 'Deduction', 'PhilHealth', 400.00, '2026-08-17 17:41:34'),
(46, 5, 'Deduction', 'Pag-IBIG', 200.00, '2026-08-17 17:41:34'),
(47, 5, 'Deduction', 'Withholding Tax', 980.00, '2026-08-17 17:41:34'),
(48, 6, 'Earning', 'Basic Pay', 42000.00, '2026-08-17 17:41:34'),
(49, 6, 'Earning', 'Service Charge', 4000.00, '2026-08-17 17:41:34'),
(50, 6, 'Earning', 'Meal Allowance', 2000.00, '2026-08-17 17:41:34'),
(51, 6, 'Deduction', 'SSS', 1125.00, '2026-08-17 17:41:34'),
(52, 6, 'Deduction', 'PhilHealth', 750.00, '2026-08-17 17:41:34'),
(53, 6, 'Deduction', 'Pag-IBIG', 300.00, '2026-08-17 17:41:34'),
(54, 6, 'Deduction', 'Withholding Tax', 4525.00, '2026-08-17 17:41:34'),
(55, 7, 'Earning', 'Basic Pay', 23500.00, '2026-08-17 17:41:34'),
(56, 7, 'Earning', 'Service Charge', 1800.00, '2026-08-17 17:41:34'),
(57, 7, 'Earning', 'Meal Allowance', 700.00, '2026-08-17 17:41:34'),
(58, 7, 'Deduction', 'SSS', 800.00, '2026-08-17 17:41:34'),
(59, 7, 'Deduction', 'PhilHealth', 450.00, '2026-08-17 17:41:34'),
(60, 7, 'Deduction', 'Pag-IBIG', 200.00, '2026-08-17 17:41:34'),
(61, 7, 'Deduction', 'Withholding Tax', 1750.00, '2026-08-17 17:41:34');

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
  UNIQUE KEY `period_code` (`period_code`),
  KEY `idx_payroll_periods_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payroll_periods`
--

INSERT INTO `payroll_periods` (`payroll_period_id`, `period_code`, `period_name`, `period_start`, `period_end`, `payout_date`, `status`, `created_at`, `updated_at`) VALUES
(1, 'PAY-2026-06-1C', '1st Cut-off June 2026', '2026-06-01', '2026-06-15', '2026-06-20', 'Closed', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(2, 'PAY-2026-06-2C', '2nd Cut-off June 2026', '2026-06-16', '2026-06-30', '2026-07-05', 'Closed', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(3, 'PAY-2026-07-1C', '1st Cut-off July 2026', '2026-07-01', '2026-07-15', '2026-07-20', 'Closed', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(4, 'PAY-2026-07-2C', '2nd Cut-off July 2026', '2026-07-16', '2026-07-31', '2026-08-05', 'Open', '2026-08-17 17:41:34', '2026-08-17 17:41:34');

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
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payroll_records`
--

INSERT INTO `payroll_records` (`payroll_record_id`, `employee_id`, `payroll_period_id`, `pay_period_start`, `pay_period_end`, `payout_date`, `gross_pay`, `net_pay`, `status`, `created_at`, `updated_at`) VALUES
(1, 5, 1, '2026-06-01', '2026-06-15', '2026-06-20', 10600.00, 8975.00, 'Released', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(2, 5, 2, '2026-06-16', '2026-06-30', '2026-07-05', 10650.00, 9040.00, 'Released', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(3, 5, 3, '2026-07-01', '2026-07-15', '2026-07-20', 10750.00, 9120.00, 'Released', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(4, 5, 4, '2026-07-16', '2026-07-31', '2026-08-05', 21500.00, 18240.00, 'Draft', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(5, 6, 3, '2026-07-01', '2026-07-15', '2026-07-20', 17400.00, 15120.00, 'Released', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(6, 1, 3, '2026-07-01', '2026-07-15', '2026-07-20', 48000.00, 41300.00, 'Finalized', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(7, 8, 3, '2026-07-01', '2026-07-15', '2026-07-20', 26000.00, 22800.00, 'Released', '2026-08-17 17:41:34', '2026-08-17 17:41:34');

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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `performance_reviews`
--

INSERT INTO `performance_reviews` (`performance_review_id`, `employee_id`, `review_period`, `review_date`, `competency_level`, `overall_rating`, `salary_grade_id`, `salary_step`, `evaluator_user_id`, `comments`, `created_at`, `updated_at`) VALUES
(1, 5, 'Q2 2026', '2026-07-15', 'Proficient', 3.50, 2, 'Step 2', 3, 'Meets expectations; consistent food safety compliance and station discipline.', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(2, 6, 'Q2 2026', '2026-07-15', 'Proficient', 4.00, 1, 'Step 1', 2, 'Strong banquet service support; recommended for promotion track.', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(3, 1, 'Q2 2026', '2026-07-15', 'Expert', 4.50, 6, 'Step 3', 2, 'Highest guest satisfaction score this quarter among department heads.', '2026-08-17 17:41:34', '2026-08-17 17:41:34');

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
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `personal_access_tokens`
--

INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES
(1, 'App\\Models\\SystemUser', 14, 'auth-token', 'c902832860a09e26ca641d4d36dd2ee282f6dada9cead92b6840e8759d915ca0', '[\"*\"]', '2026-08-22 19:20:05', NULL, '2026-08-22 12:00:45', '2026-08-22 19:20:05'),
(2, 'App\\Models\\SystemUser', 1, 'auth-token', 'ff0671b1360ab0328569b317fa99d9060a77f6f50064963f972b60f21d8b385c', '[\"*\"]', '2026-08-22 17:14:17', NULL, '2026-08-22 16:56:14', '2026-08-22 17:14:17'),
(3, 'App\\Models\\SystemUser', 1, 'auth-token', '6e0a5274c309fb4cd1f8bea866fab90290528b7d3a24af440511d42005ae3e59', '[\"*\"]', '2026-08-23 09:50:39', NULL, '2026-08-23 09:18:18', '2026-08-23 09:50:39'),
(11, 'App\\Models\\SystemUser', 14, 'auth-token', '6dc47d1775d2d727b45dcd95a9e3eaa6cad78b7d63511982b781a0f4204d48c9', '[\"*\"]', '2026-08-23 15:11:19', NULL, '2026-08-23 12:55:25', '2026-08-23 15:11:19'),
(12, 'App\\Models\\SystemUser', 2, 'auth-token', '3df8dbb4d16e155244dd54d2965f1bf4a9664f813d0cc33a0cd16442b626d3f1', '[\"*\"]', '2026-08-24 06:12:53', NULL, '2026-08-24 03:39:24', '2026-08-24 06:12:53');

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
  `level` varchar(30) NOT NULL,
  `headcount` int(11) NOT NULL DEFAULT 0,
  `filled_count` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`position_id`),
  UNIQUE KEY `position_code` (`position_code`),
  KEY `idx_positions_department_id` (`department_id`),
  KEY `idx_positions_salary_grade_id` (`salary_grade_id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `positions`
--

INSERT INTO `positions` (`position_id`, `position_code`, `title`, `department_id`, `salary_grade_id`, `level`, `headcount`, `filled_count`, `created_at`, `updated_at`) VALUES
(1, 'POS-001', 'Front Desk Receptionist', 1, 2, 'Rank & File', 8, 3, '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(2, 'POS-002', 'Guest Relations Officer', 1, 4, 'Supervisory', 3, 2, '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(3, 'POS-003', 'Restaurant Server', 2, 1, 'Rank & File', 12, 1, '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(4, 'POS-004', 'Bartender', 2, 1, 'Rank & File', 4, 1, '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(5, 'POS-005', 'Line Cook', 3, 2, 'Rank & File', 10, 1, '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(6, 'POS-006', 'Pastry Chef', 3, 5, 'Supervisory', 2, 1, '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(7, 'POS-007', 'Housekeeping Attendant', 4, 1, 'Rank & File', 18, 3, '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(8, 'POS-008', 'HR Assistant', 5, 3, 'Rank & File', 3, 2, '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(9, 'POS-009', 'General Manager', 5, 7, 'Executive', 1, 1, '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(10, 'POS-010', 'Front Office Manager', 1, 6, 'Managerial', 1, 1, '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(11, 'POS-011', 'F&B Director', 2, 7, 'Executive', 1, 1, '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(12, 'POS-012', 'Executive Chef', 3, 7, 'Executive', 1, 1, '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(13, 'POS-013', 'Executive Housekeeper', 4, 6, 'Managerial', 1, 1, '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(14, 'POS-014', 'HR & Administration Manager', 5, 7, 'Managerial', 1, 1, '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(15, 'POS-015', 'Floor Supervisor', 4, 4, 'Supervisory', 2, 1, '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(16, 'POS-016', 'HR Officer', 5, 4, 'Supervisory', 2, 1, '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(17, 'POS-017', 'Accounting Supervisor', 5, 4, 'Supervisory', 1, 1, '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(18, 'POS-018', 'Front Desk Receptionist', 1, 4, 'Staff', 2, 0, '2026-08-24 04:04:50', '2026-08-24 04:04:50');

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
  UNIQUE KEY `uq_requisitions_requisition_code` (`requisition_code`),
  KEY `fk_requisitions_converted_job_post_id` (`converted_job_post_id`),
  KEY `fk_requisitions_department_id` (`department_id`),
  KEY `fk_requisitions_position_id` (`position_id`),
  KEY `fk_requisitions_requested_by_user_id` (`requested_by_user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `requisitions`
--

INSERT INTO `requisitions` (`requisition_id`, `requisition_code`, `position_id`, `position_title`, `department_id`, `requested_by_user_id`, `requested_count`, `urgency`, `justification`, `status`, `requested_at`, `converted_job_post_id`, `created_at`, `updated_at`) VALUES
(1, 'REQ-1001', 1, 'Front Desk Receptionist', 1, NULL, 2, 'High', 'Two front desk associates are due to transition to the Guest Relations team next month, and occupancy is trending up for the coming peak season. Backfilling now avoids a coverage gap on the AM/PM shift rotation.', 'Pending', '2024-05-02', 1, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(2, 'REQ-1002', 7, 'Housekeeping Attendant', 4, NULL, 3, 'Urgent', 'Room turnover times have slipped past the 30-minute SLA due to persistent understaffing. Three additional attendants are needed to restore standard turnaround ahead of the group bookings arriving this quarter.', 'Pending', '2024-05-05', 3, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(3, 'REQ-1003', 5, 'Line Cook', 3, NULL, 1, 'Normal', 'The kitchen brigade is short one station cook following a resignation. A replacement hire keeps the current menu rotation and banquet commitments fully staffed.', 'Pending', '2024-05-08', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(4, 'REQ-1004', 4, 'Bartender', 2, NULL, 1, 'Normal', 'The lobby bar needs weekend coverage now that the extended happy-hour promotion has launched.', 'Pending', '2024-05-11', 5, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(5, 'REQ-1005', NULL, 'Security Officer', 6, NULL, 2, 'High', 'Perimeter patrol shifts are currently single-manned; two additional officers restore the standard two-person rotation.', 'Done', '2024-04-20', NULL, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(6, 'REQ-1006', NULL, 'Spa Therapist', 7, NULL, 1, 'Low', 'Guest demand for spa bookings has grown following the new wellness package launch.', 'Pending', '2024-05-14', NULL, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(7, 'REQ-1007', NULL, 'Reservations Agent', 1, NULL, 2, 'Normal', 'Call volume has outpaced current agent capacity during the booking surge.', 'Converted', '2024-03-30', NULL, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(8, 'REQ-1008', NULL, 'Sous Chef', 3, NULL, 1, 'Urgent', 'Kitchen leadership gap after recent promotion; needs immediate backfill.', 'Pending', '2024-05-16', NULL, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(9, 'REQ-1009', 15, 'Housekeeping Supervisor', 4, NULL, 1, 'High', 'Additional shift supervisor required to oversee the expanded night cleaning crew.', 'Done', '2024-04-05', NULL, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(10, 'REQ-1010', NULL, 'Accounting Clerk', 8, NULL, 1, 'Normal', 'Month-end close workload has increased with the new property management system rollout.', 'Pending', '2024-05-18', NULL, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(11, 'REQ-1011', NULL, 'Maintenance Technician', 9, NULL, 2, 'High', 'Preventive maintenance backlog requires two more technicians to stay on schedule.', 'Converted', '2024-05-19', NULL, '2026-08-17 00:31:34', '2026-08-18 08:56:01'),
(12, 'REQ-1012', 2, 'Guest Relations Officer', 1, NULL, 1, 'Normal', 'VIP guest volume has increased, requiring dedicated relations coverage.', 'Converted', '2024-03-12', NULL, '2026-08-17 00:31:34', '2026-08-17 00:31:34');

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
(1, 1, 'Dashboard', 'Full', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(2, 1, 'Applicant Management', 'Full', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(3, 1, 'Recruitment Management', 'Full', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(4, 1, 'New Hire Onboarding', 'Full', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(5, 1, 'Core HCM', 'Full', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(6, 1, 'Employee Records', 'Full', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(7, 1, 'ESS Management', 'Full', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(8, 1, 'User Management', 'Full', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(9, 1, 'Audit Logs', 'Full', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(10, 1, 'Settings', 'Full', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(11, 2, 'Dashboard', 'View', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(12, 2, 'Applicant Management', 'Edit', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(13, 2, 'Recruitment Management', 'Edit', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(14, 2, 'New Hire Onboarding', 'Edit', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(15, 2, 'Core HCM', 'View', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(16, 2, 'Employee Records', 'Edit', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(17, 2, 'ESS Management', 'Approve / Reject Only', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(18, 2, 'User Management', 'None', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(19, 2, 'Audit Logs', 'None', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(20, 2, 'Settings', 'View', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(21, 3, 'Dashboard', 'View', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(22, 3, 'Applicant Management', 'None', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(23, 3, 'Recruitment Management', 'None', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(24, 3, 'New Hire Onboarding', 'View', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(25, 3, 'Core HCM', 'None', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(26, 3, 'Employee Records', 'None', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(27, 3, 'ESS Management', 'View', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(28, 3, 'User Management', 'None', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(29, 3, 'Audit Logs', 'None', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(30, 3, 'Settings', 'View', '2026-08-17 17:41:34', '2026-08-17 17:41:34');

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
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `salary_grades`
--

INSERT INTO `salary_grades` (`salary_grade_id`, `code`, `title`, `min_salary`, `max_salary`, `currency_code`, `level`, `notes`, `created_at`, `updated_at`) VALUES
(1, 'SG-01', 'Entry Rank & File', 14000.00, 17000.00, 'PHP', 'Rank & File', 'Housekeeping attendants, utility crew', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(2, 'SG-05', 'Standard Rank & File', 18000.00, 22000.00, 'PHP', 'Rank & File', 'Front desk receptionist, line cooks', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(3, 'SG-08', 'Senior Rank & File', 22000.00, 26000.00, 'PHP', 'Rank & File', 'HR assistant, senior receptionist', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(4, 'SG-10', 'Junior Supervisory', 26000.00, 32000.00, 'PHP', 'Supervisory', 'Floor supervisor, guest relations supervisor', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(5, 'SG-12', 'Senior Supervisory', 32000.00, 40000.00, 'PHP', 'Supervisory', 'Pastry chef supervisor, assistant manager', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(6, 'SG-15', 'Department Manager', 45000.00, 60000.00, 'PHP', 'Managerial', 'Front office manager, executive housekeeper', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(7, 'SG-18', 'Executive Director', 65000.00, 90000.00, 'PHP', 'Executive', 'F&B Director, HR Manager, GM', '2026-08-17 17:41:34', '2026-08-17 17:41:34');

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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `screening_ground_truths`
--

INSERT INTO `screening_ground_truths` (`gt_id`, `applicant_id`, `job_post_id`, `true_screening_result`, `true_qualification_score`, `true_missing_information_json`, `true_unrecognized_skills_json`, `notes`, `created_at`, `updated_at`) VALUES
(1, 27, 5, 'fit', 95.00, '[]', '[]', NULL, '2026-08-22 17:20:08', '2026-08-22 17:20:08'),
(2, 29, 1, 'not-fit', 55.00, '[]', '[]', NULL, '2026-08-22 17:20:09', '2026-08-22 17:20:09');

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
) ENGINE=InnoDB AUTO_INCREMENT=84 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `screening_reference_data`
--

INSERT INTO `screening_reference_data` (`ref_id`, `data_type`, `canonical_value`, `aliases_json`, `active`, `created_at`, `updated_at`) VALUES
(1, 'skill', 'Customer Service', '[\"customer service\",\"guest service\",\"customer assistance\",\"client service\"]', 1, '2026-08-23 18:47:07', NULL),
(2, 'skill', 'Communication', '[\"communication\",\"communication skills\",\"verbal communication\",\"written communication\"]', 1, '2026-08-23 18:47:07', NULL),
(3, 'skill', 'Coffee Preparation', '[\"coffee preparation\",\"coffee making\",\"espresso making\",\"espresso extraction\",\"latte art\",\"coffee brewing\"]', 1, '2026-08-23 18:47:07', NULL),
(4, 'skill', 'Barista Operations', '[\"barista operations\",\"barista\",\"cafe service\"]', 1, '2026-08-23 18:47:07', NULL),
(5, 'skill', 'Mixology', '[\"mixology\",\"cocktail preparation\",\"cocktail craft\",\"drink mixing\",\"beverage preparation\"]', 1, '2026-08-23 18:47:07', NULL),
(6, 'skill', 'Food Safety', '[\"food safety\",\"food safety compliance\",\"food hygiene\",\"sanitation\",\"food sanitation\"]', 1, '2026-08-23 18:47:07', NULL),
(7, 'skill', 'HACCP', '[\"haccp\",\"haccp compliance\",\"food safety management\"]', 1, '2026-08-23 18:47:07', NULL),
(8, 'skill', 'Knife Skills', '[\"knife skills\",\"knife handling\"]', 1, '2026-08-23 18:47:07', NULL),
(9, 'skill', 'Plating', '[\"plating\",\"food plating\",\"plate presentation\",\"presentation\"]', 1, '2026-08-23 18:47:07', NULL),
(10, 'skill', 'Mise en Place', '[\"mise en place\",\"mise-en-place\"]', 1, '2026-08-23 18:47:07', NULL),
(11, 'skill', 'Hot Kitchen', '[\"hot kitchen\",\"hot line\",\"line cooking\",\"grill station\",\"saute station\"]', 1, '2026-08-23 18:47:07', NULL),
(12, 'skill', 'Pastry and Baking', '[\"pastry\",\"baking\",\"pastry arts\",\"dessert preparation\",\"breads and pastries\",\"pastry preparation\",\"basic baking\"]', 1, '2026-08-23 18:47:07', '2026-08-24 01:35:52'),
(13, 'skill', 'Room Turnover', '[\"room turnover\",\"room cleaning\",\"guestroom cleaning\"]', 1, '2026-08-23 18:47:07', NULL),
(14, 'skill', 'Linen Handling', '[\"linen handling\",\"linen management\",\"laundry operations\"]', 1, '2026-08-23 18:47:07', NULL),
(15, 'skill', 'Public Area Cleaning', '[\"public area cleaning\",\"public area maintenance\"]', 1, '2026-08-23 18:47:07', NULL),
(16, 'skill', 'Chemical Safety', '[\"chemical safety\",\"cleaning chemical handling\"]', 1, '2026-08-23 18:47:07', NULL),
(17, 'skill', 'Guest Relations', '[\"guest relations\",\"guest relations management\",\"guest engagement\"]', 1, '2026-08-23 18:47:07', NULL),
(18, 'skill', 'Front Office Operations', '[\"front office\",\"front office operations\",\"front desk\",\"reception operations\",\"hotel front office\"]', 1, '2026-08-23 18:47:07', '2026-08-24 01:35:52'),
(19, 'skill', 'Check-in / Check-out', '[\"check-in \\/ check-out\",\"check in check out\",\"check-in\",\"check-out\",\"arrival and departure handling\"]', 1, '2026-08-23 18:47:07', NULL),
(20, 'skill', 'Reservations', '[\"reservations\",\"reservation management\",\"booking management\",\"reservation support\",\"reservation updates\"]', 1, '2026-08-23 18:47:07', '2026-08-24 01:35:52'),
(21, 'skill', 'Property Management Systems', '[\"opera pms\",\"opera\",\"property management system\",\"pms systems\",\"pms\"]', 1, '2026-08-23 18:47:07', '2026-08-24 01:35:52'),
(22, 'skill', 'POS Systems', '[\"pos systems\",\"pos\",\"point of sale\",\"point of sale systems\",\"micros\",\"pos operation\"]', 1, '2026-08-23 18:47:07', NULL),
(23, 'skill', 'Cash Handling', '[\"cash handling\",\"cashiering\",\"billing\",\"funds handling\"]', 1, '2026-08-23 18:47:07', NULL),
(24, 'skill', 'Upselling', '[\"upselling\",\"upsell techniques\",\"suggestive selling\",\"cross-selling\"]', 1, '2026-08-23 18:47:07', NULL),
(25, 'skill', 'Table Service', '[\"table service\",\"food service\",\"service sequence\",\"dining room service\"]', 1, '2026-08-23 18:47:07', NULL),
(26, 'skill', 'Banquet Service', '[\"banquet service\",\"banquet operations\",\"function service\"]', 1, '2026-08-23 18:47:07', NULL),
(27, 'skill', 'Inventory Control', '[\"inventory control\",\"inventory management\",\"stock control\",\"stocktaking\",\"inventory checks\",\"inventory support\"]', 1, '2026-08-23 18:47:07', '2026-08-24 01:35:52'),
(28, 'skill', 'Housekeeping Operations', '[\"housekeeping\",\"housekeeping operations\",\"housekeeping procedures\"]', 1, '2026-08-23 18:47:07', NULL),
(29, 'skill', 'Complaint Handling', '[\"complaint handling\",\"complaint resolution\",\"guest complaint management\"]', 1, '2026-08-23 18:47:07', NULL),
(30, 'skill', 'Teamwork', '[\"teamwork\",\"team collaboration\",\"working with others\"]', 1, '2026-08-23 18:47:07', NULL),
(31, 'skill', 'Time Management', '[\"time management\",\"prioritization\",\"multitasking\"]', 1, '2026-08-23 18:47:07', NULL),
(32, 'skill', 'Attention to Detail', '[\"attention to detail\",\"detail oriented\",\"detail-oriented\"]', 1, '2026-08-23 18:47:07', NULL),
(33, 'skill', 'Problem Solving', '[\"problem solving\",\"problem-solving\",\"troubleshooting\"]', 1, '2026-08-23 18:47:07', NULL),
(34, 'skill', 'Hotel Operations', '[\"hotel operations\",\"property operations\"]', 1, '2026-08-23 18:47:07', NULL),
(35, 'skill', 'Recruitment Support', '[\"recruitment\",\"recruitment support\",\"sourcing and screening\"]', 1, '2026-08-23 18:47:07', NULL),
(36, 'skill', 'Records Documentation', '[\"201 files\",\"documentation\",\"records management\",\"file management\"]', 1, '2026-08-23 18:47:07', NULL),
(37, 'skill', 'MS Office', '[\"ms office\",\"microsoft office\",\"ms word\",\"ms excel\",\"excel\",\"word processing\"]', 1, '2026-08-23 18:47:07', NULL),
(38, 'skill', 'Confidentiality', '[\"confidentiality\",\"data privacy\",\"records confidentiality\"]', 1, '2026-08-23 18:47:07', NULL),
(39, 'skill', 'Payroll Support', '[\"payroll support\",\"payroll processing\",\"payroll assistance\"]', 1, '2026-08-23 18:47:07', NULL),
(40, 'skill', 'Maintenance Basics', '[\"basic maintenance\",\"building maintenance\",\"facilities maintenance\",\"repairs\"]', 1, '2026-08-23 18:47:07', NULL),
(41, 'skill', 'Safety Compliance', '[\"safety compliance\",\"workplace safety\",\"safety procedures\"]', 1, '2026-08-23 18:47:07', NULL),
(42, 'skill', 'Responsible Alcohol Service', '[\"responsible alcohol service\",\"responsible service of alcohol\",\"alcohol awareness\"]', 1, '2026-08-23 18:47:07', NULL),
(43, 'job_role', 'Bartender', '[\"bartender\",\"bar tender\",\"barman\",\"barkeep\",\"mixologist\"]', 1, '2026-08-23 18:47:07', NULL),
(44, 'job_role', 'Barista', '[\"barista\",\"coffee shop staff\",\"cafe barista\",\"coffee attendant\"]', 1, '2026-08-23 18:47:07', NULL),
(45, 'job_role', 'Line Cook', '[\"line cook\",\"cook\",\"station cook\",\"hot kitchen cook\",\"commis chef\",\"kitchen cook\"]', 1, '2026-08-23 18:47:07', NULL),
(46, 'job_role', 'Chef', '[\"chef\",\"sous chef\",\"head chef\",\"executive chef\",\"chef de partie\"]', 1, '2026-08-23 18:47:07', NULL),
(47, 'job_role', 'Pastry Chef', '[\"pastry chef\",\"baker\",\"pastry cook\",\"baker chef\"]', 1, '2026-08-23 18:47:07', NULL),
(48, 'job_role', 'Kitchen Helper', '[\"kitchen helper\",\"dishwasher\",\"kitchen aide\",\"steward\",\"kitchen steward\"]', 1, '2026-08-23 18:47:07', NULL),
(49, 'job_role', 'Housekeeping Attendant', '[\"housekeeping attendant\",\"room attendant\",\"housekeeper\",\"chambermaid\",\"roomboy\",\"public area attendant\"]', 1, '2026-08-23 18:47:07', NULL),
(50, 'job_role', 'Laundry Attendant', '[\"laundry attendant\",\"laundry staff\"]', 1, '2026-08-23 18:47:07', NULL),
(51, 'job_role', 'Restaurant Server', '[\"restaurant server\",\"waiter\",\"waitress\",\"food server\",\"server\",\"food and beverage attendant\",\"f&b attendant\",\"service crew\"]', 1, '2026-08-23 18:47:07', NULL),
(52, 'job_role', 'Hostess', '[\"hostess\",\"food host\",\"restaurant host\"]', 1, '2026-08-23 18:47:07', NULL),
(53, 'job_role', 'Front Desk Receptionist', '[\"front desk receptionist\",\"front desk officer\",\"receptionist\",\"front desk agent\",\"front desk staff\",\"front office associate\",\"guest service agent\"]', 1, '2026-08-23 18:47:07', '2026-08-24 01:35:52'),
(54, 'job_role', 'Guest Relations Officer', '[\"guest relations officer\",\"gro\",\"guest relations coordinator\",\"guest service officer\"]', 1, '2026-08-23 18:47:07', '2026-08-24 01:35:52'),
(55, 'job_role', 'Concierge', '[\"concierge\",\"bell captain\",\"bellman\"]', 1, '2026-08-23 18:47:07', NULL),
(56, 'job_role', 'HR Assistant', '[\"hr assistant\",\"human resource assistant\",\"human resources assistant\",\"hr staff\",\"recruitment assistant\"]', 1, '2026-08-23 18:47:07', NULL),
(57, 'job_role', 'HR Manager', '[\"hr manager\",\"human resources manager\",\"hr administration manager\"]', 1, '2026-08-23 18:47:07', NULL),
(58, 'job_role', 'General Manager', '[\"general manager\",\"gm\",\"property manager\"]', 1, '2026-08-23 18:47:07', NULL),
(59, 'job_role', 'Supervisor', '[\"supervisor\",\"shift supervisor\",\"team leader\"]', 1, '2026-08-23 18:47:07', NULL),
(60, 'job_role', 'Maintenance Technician', '[\"maintenance technician\",\"maintenance staff\",\"handyman\",\"building maintenance staff\"]', 1, '2026-08-23 18:47:07', NULL),
(61, 'certification', 'TESDA Cookery NC II', '[\"tesda cookery nc ii\",\"cookery nc ii\",\"tesda cookery nc 2\",\"commercial cooking nc ii\",\"tesda nc ii in cookery\"]', 1, '2026-08-23 18:47:07', NULL),
(62, 'certification', 'TESDA Bartending NC II', '[\"tesda bartending nc ii\",\"bartending nc ii\",\"bartending nc 2\",\"tesda nc ii in bartending\"]', 1, '2026-08-23 18:47:07', NULL),
(63, 'certification', 'TESDA Housekeeping NC II', '[\"tesda housekeeping nc ii\",\"housekeeping nc ii\",\"housekeeping nc 2\"]', 1, '2026-08-23 18:47:07', NULL),
(64, 'certification', 'TESDA Front Office NC II', '[\"tesda front office nc ii\",\"front office nc ii\",\"front office services nc ii\"]', 1, '2026-08-23 18:47:07', NULL),
(65, 'certification', 'TESDA Food and Beverage Services NC II', '[\"food and beverage services nc ii\",\"f&b services nc ii\",\"fb services nc ii\",\"food and beverage nc ii\"]', 1, '2026-08-23 18:47:07', NULL),
(66, 'certification', 'TESDA Bread and Pastry Production NC II', '[\"bread and pastry production nc ii\",\"baking nc ii\",\"pastry production nc ii\"]', 1, '2026-08-23 18:47:07', NULL),
(67, 'certification', 'Food Handler Certificate', '[\"food handler certificate\",\"food handler\'s certificate\",\"food handlers certificate\",\"food safety certificate\",\"food handler card\"]', 1, '2026-08-23 18:47:07', NULL),
(68, 'certification', 'First Aid Certificate', '[\"first aid certificate\",\"first aid training certificate\",\"standard first aid\"]', 1, '2026-08-23 18:47:07', NULL),
(69, 'certification', 'Culinary Diploma', '[\"culinary diploma\",\"diploma in culinary arts\",\"culinary arts diploma\"]', 1, '2026-08-23 18:47:07', NULL),
(70, 'certification', 'Driver\'s License', '[\"driver\'s license\",\"drivers license\",\"professional driver license\",\"non-professional driver license\"]', 1, '2026-08-23 18:47:07', NULL),
(71, 'certification', 'Barista NC II', '[\"barista nc ii\",\"tesda barista nc ii\",\"coffee academy certificate\"]', 1, '2026-08-23 18:47:07', NULL),
(76, 'skill', 'Shift Supervision', '[\"floor supervision\"]', 1, '2026-08-24 01:35:52', '2026-08-24 01:35:52'),
(77, 'skill', 'Guest Recovery', '[\"service recovery\"]', 1, '2026-08-24 01:35:52', '2026-08-24 01:35:52'),
(78, 'skill', 'Staff Training', '[\"team training\",\"new hire training\",\"staff coaching\"]', 1, '2026-08-24 01:35:52', '2026-08-24 01:35:52'),
(79, 'skill', 'Scheduling', '[\"shift scheduling\",\"staff scheduling\"]', 1, '2026-08-24 01:35:52', '2026-08-24 01:35:52'),
(80, 'skill', 'Cake Decoration', '[\"cake decorating\",\"cake design\"]', 1, '2026-08-24 01:35:52', '2026-08-24 01:35:52'),
(81, 'skill', 'Kitchen Hygiene', '[\"kitchen sanitation\"]', 1, '2026-08-24 01:35:52', '2026-08-24 01:35:52'),
(82, 'job_role', 'Restaurant Supervisor', '[\"floor supervisor\",\"service supervisor\",\"senior server lead\"]', 1, '2026-08-24 01:35:52', '2026-08-24 01:35:52'),
(83, 'job_role', 'Pastry and Bakery Assistant', '[\"pastry assistant\",\"bakery assistant\",\"bakery trainee\",\"pastry cook\"]', 1, '2026-08-24 01:35:52', '2026-08-24 01:35:52');

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
  KEY `idx_sessions_user_id` (`user_id`),
  KEY `idx_sessions_last_activity` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('5kA2HT34cIbJl4wI3umn72a6IAoXoB5CZ2CdILEZ', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-PH) WindowsPowerShell/5.1.19041.6456', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoialRLSVpTVmFldjd4ZXBtd1plRHMxWDd1R1lUVlVzblRPVkUyN2YzVCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6Mjc6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9sb2dpbiI7czo1OiJyb3V0ZSI7czo1OiJsb2dpbiI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1787513377),
('9CKgHqNSJ8IO0HOUQYdRVhNyja4RsAgo6F1gyBPL', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-PH) WindowsPowerShell/5.1.19041.6456', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiTjJTbGR5ZFo5SzBmanZIYVNjb1NOUENYa3VmcVlmdEl5SVU5RnRidCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6Mjc6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9sb2dpbiI7czo1OiJyb3V0ZSI7czo1OiJsb2dpbiI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1787564153),
('GKUs7XLenwGw2IZ5YmFavnLTWGTZAmkpVqkjnGOz', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-PH) WindowsPowerShell/5.1.19041.6456', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoicFRta1haMWt1Tmg2dVNNTHp3UzZXM0YxZzZiUjlFWEdRc2huQmVYVyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1787077270),
('HHntJhIGIn4Cm0ZKBkr2i6f3PqMuFMjSikc4ftZx', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-PH) WindowsPowerShell/5.1.19041.6456', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiZ2tXZGI5QlNVMUROTmF4TkdxMGx6eDRpZ25GNW9sWmxmMTNtak5nVSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1787077270),
('KKs2QMh0t1lHzoEBS2nyw5KDAbwIpt4HjuaanAAc', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-PH) WindowsPowerShell/5.1.19041.6456', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiV0hCbDdmb285UmNncGVIcnc3UmFqSm9KMXdQQndtVWFaV0ljOVk2bSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1787077277),
('sxJY5uq8a6w54b9CPaPWRPqk0gHvBgBHEFYFIe4E', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-PH) WindowsPowerShell/5.1.19041.6456', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiN3lLck1lRGZGT01RRFh0UldpM1ljMzNWcVBiQXVoMlQ1SVBNbU52NCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1787077268);

-- --------------------------------------------------------

--
-- Table structure for table `system_roles`
--

CREATE TABLE IF NOT EXISTS `system_roles` (
  `role_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `role_name` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`role_id`),
  UNIQUE KEY `role_name` (`role_name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `system_roles`
--

INSERT INTO `system_roles` (`role_id`, `role_name`, `description`, `created_at`, `updated_at`) VALUES
(1, 'Super Admin', 'Full system access across all modules and settings', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(2, 'Admin', 'HR admin: recruitment, onboarding, employee records, ESS approval', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(3, 'Employee', 'Self-service portal access for employees', '2026-08-17 17:41:34', '2026-08-17 17:41:34');

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
  UNIQUE KEY `setting_key` (`setting_key`),
  KEY `idx_system_settings_updated_by_user_id` (`updated_by_user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `system_settings`
--

INSERT INTO `system_settings` (`setting_id`, `setting_key`, `setting_value`, `updated_by_user_id`, `created_at`, `updated_at`) VALUES
(1, 'company', '{\"name\": \"Oxford Suites Makati\", \"email\": \"info@oxfordsuites.com.ph\", \"contact\": \"(02) 8888-0000\", \"businessHours\": \"24/7 Front Desk Operations\", \"address\": \"Ayala Center, Makati City\", \"tin\": \"000-000-000-000\", \"timezone\": \"Asia/Manila\"}', 1, '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(2, 'preferences', '{\"theme\":\"Dark\",\"language\":\"Filipino\",\"dateFormat\":\"YYYY-MM-DD\",\"timeFormat\":\"24-hour\",\"timeZone\":\"America\\/Los_Angeles (GMT-8)\"}', NULL, '2026-08-17 17:41:34', '2026-08-18 09:59:42'),
(3, 'security', '{\"twoFactor\": true, \"sessionTimeout\": \"30 minutes\", \"maxLoginAttempts\": \"3 attempts\", \"minLength\": 8, \"requireUppercase\": true, \"requireLowercase\": true, \"requireNumber\": true, \"requireSymbol\": true}', 1, '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(4, 'notifications', '{\"Email notifications\": true, \"Browser notifications\": true, \"System announcements\": true}', 1, '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(5, 'default_password', '{\"password\":\"pogiako123\"}', NULL, '2026-08-17 17:41:34', '2026-08-17 09:45:43'),
(6, 'recruitment.screening.enabled', '{\"value\": true}', 1, '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(7, 'interview.schedulable_days', '[\"Monday\",\"Tuesday\",\"Wednesday\",\"Thursday\",\"Friday\",\"Saturday\",\"Sunday\"]', NULL, '2026-08-17 17:41:34', '2026-08-17 09:45:05'),
(9, 'my_notifications_kevin.santos@oxfordsuites.com.ph', '{\"Email notifications\":false,\"Browser notifications\":false,\"System announcements\":false}', NULL, '2026-08-18 11:09:26', '2026-08-18 11:09:28'),
(10, 'my_preferences_kevin.santos@oxfordsuites.com.ph', '{\"theme\":\"Dark\",\"language\":\"Filipino\",\"dateFormat\":\"YYYY-MM-DD\",\"timeFormat\":\"12-hour\",\"timeZone\":\"America\\/Los_Angeles (GMT-8)\"}', NULL, '2026-08-18 11:09:54', '2026-08-18 11:09:54'),
(11, 'my_notifications_juan.delacruz@oxfordsuites.com.ph', '{\"Email notifications\":true,\"Browser notifications\":false,\"System announcements\":true}', NULL, '2026-08-18 11:10:32', '2026-08-18 11:10:32');

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
  `last_login_at` timestamp NULL DEFAULT NULL,
  `last_login_ip` varchar(45) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`system_user_id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `employee_id` (`employee_id`),
  KEY `idx_system_users_role_id` (`role_id`),
  KEY `idx_system_users_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `system_users`
--

INSERT INTO `system_users` (`system_user_id`, `username`, `email`, `password_hash`, `full_name`, `department_name`, `employee_id`, `role_id`, `status`, `last_login_at`, `last_login_ip`, `created_at`, `updated_at`) VALUES
(1, 'bullseur', 'bullseur@oxfordsuites.com.ph', '$2y$12$ZvXS75gRgB9PmlQPui8Ao.bZlUnSW84Ric.DlKLS3o6DxWVIGjo3m', 'Bullseur Santiago', 'Administration / HR', NULL, 1, 'Active', '2026-08-23 09:18:19', '127.0.0.1', '2026-08-17 17:41:34', '2026-08-23 09:18:19'),
(2, 'jdelacruz', 'juan.delacruz@oxfordsuites.com.ph', '$2y$12$ZvXS75gRgB9PmlQPui8Ao.bZlUnSW84Ric.DlKLS3o6DxWVIGjo3m', 'Juan Dela Cruz', 'Administration / HR', 7, 2, 'Active', '2026-08-24 03:39:24', '127.0.0.1', '2026-08-17 17:41:34', '2026-08-24 03:39:24'),
(3, 'aramos', 'ana.ramos@oxfordsuites.com.ph', '$2y$12$ZvXS75gRgB9PmlQPui8Ao.bZlUnSW84Ric.DlKLS3o6DxWVIGjo3m', 'Ana Ramos', 'Front Office', 1, 2, 'Active', '2026-07-25 13:04:00', '192.168.10.31', '2026-08-17 17:41:34', '2026-08-23 17:17:32'),
(4, 'kdelacruz', 'kevin.delacruz@oxfordsuites.com.ph', '$2y$12$ZvXS75gRgB9PmlQPui8Ao.bZlUnSW84Ric.DlKLS3o6DxWVIGjo3m', 'Kevin Dela Cruz', 'Kitchen / Culinary', 5, 3, 'Active', '2026-07-25 06:40:00', '10.0.4.88', '2026-08-17 17:41:34', '2026-08-23 17:17:32'),
(5, 'mdevera', 'marjun.devera@oxfordsuites.com.ph', '$2y$12$ZvXS75gRgB9PmlQPui8Ao.bZlUnSW84Ric.DlKLS3o6DxWVIGjo3m', 'Marjun Devera', 'Food & Beverage', 6, 3, 'Suspended', '2026-07-20 11:11:00', '10.0.4.101', '2026-08-17 17:41:34', '2026-08-23 17:17:32'),
(6, 'raquino', 'rosa.aquino@oxfordsuites.com.ph', '$2y$12$ZvXS75gRgB9PmlQPui8Ao.bZlUnSW84Ric.DlKLS3o6DxWVIGjo3m', 'Rosa Aquino', 'Housekeeping', 8, 3, 'Active', '2026-07-25 22:03:00', '10.0.4.57', '2026-08-17 17:41:34', '2026-08-23 17:17:32'),
(7, 'mlim', 'maria.lim@oxfordsuites.com.ph', '$2y$12$ZvXS75gRgB9PmlQPui8Ao.bZlUnSW84Ric.DlKLS3o6DxWVIGjo3m', 'Maria Lim', 'Administration / HR', 11, 2, 'Active', '2026-07-25 23:45:00', '192.168.10.18', '2026-08-17 17:41:34', '2026-08-23 17:17:32'),
(8, 'pcruz', 'paolo.cruz@oxfordsuites.com.ph', '$2y$12$ZvXS75gRgB9PmlQPui8Ao.bZlUnSW84Ric.DlKLS3o6DxWVIGjo3m', 'Paolo Cruz', 'Administration / HR', 12, 2, 'Active', '2026-07-25 09:30:00', '192.168.10.12', '2026-08-17 17:41:34', '2026-08-23 17:17:32'),
(10, 'bcbc', 'bcbc@mga.com', '$2y$12$ZvXS75gRgB9PmlQPui8Ao.bZlUnSW84Ric.DlKLS3o6DxWVIGjo3m', 'bcbc', 'Food & Beverage', NULL, 3, 'Active', NULL, NULL, '2026-08-18 10:43:08', '2026-08-23 17:17:32'),
(11, 'admin-img2', 'ADMIN-img2@gmail.com', '$2y$12$ZvXS75gRgB9PmlQPui8Ao.bZlUnSW84Ric.DlKLS3o6DxWVIGjo3m', 'ADMIN-img2', 'Food & Beverage', NULL, 3, 'Active', NULL, NULL, '2026-08-18 10:44:41', '2026-08-23 17:17:32'),
(12, 'f1', 'f1@gmail.com', '$2y$12$ZvXS75gRgB9PmlQPui8Ao.bZlUnSW84Ric.DlKLS3o6DxWVIGjo3m', 'f1', 'Food & Beverage', NULL, 3, 'Active', NULL, NULL, '2026-08-18 10:48:14', '2026-08-23 17:17:32'),
(13, 'kevin.santos', 'kevin.santos@oxfordsuites.com.ph', '$2y$12$ZvXS75gRgB9PmlQPui8Ao.bZlUnSW84Ric.DlKLS3o6DxWVIGjo3m', 'kevin.santos', NULL, NULL, 3, 'Active', NULL, NULL, '2026-08-18 10:50:19', '2026-08-23 17:17:32'),
(14, 'hahakdog', 'hahakdoghahalaman890@gmail.com', '$2y$12$ZvXS75gRgB9PmlQPui8Ao.bZlUnSW84Ric.DlKLS3o6DxWVIGjo3m', 'Andrew e', 'Administration / HR', NULL, 1, 'Active', '2026-08-23 12:55:25', '127.0.0.1', '2026-08-22 11:57:47', '2026-08-23 12:55:25'),
(15, 'naniboogsh', 'naniboogsh890123@gmail.com', '$2y$12$ZvXS75gRgB9PmlQPui8Ao.bZlUnSW84Ric.DlKLS3o6DxWVIGjo3m', 'Nani Boogsh', 'Administration / HR', NULL, 3, 'Active', '2026-08-23 12:53:42', '127.0.0.1', '2026-08-22 11:57:47', '2026-08-23 12:53:42'),
(16, 'juniorespe', 'juniorespenapogi@gmail.com', '$2y$12$ZvXS75gRgB9PmlQPui8Ao.bZlUnSW84Ric.DlKLS3o6DxWVIGjo3m', 'Juniorespe Napogi', 'Administration / HR', NULL, 2, 'Active', NULL, NULL, '2026-08-22 12:10:37', '2026-08-23 17:17:32');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE IF NOT EXISTS `users` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
(9, 14, '2026-08-22 12:00:45', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'success'),
(10, 1, '2026-08-22 16:56:15', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/149.0.0.0 Safari/537.36', 'success'),
(11, 1, '2026-08-23 09:18:19', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/149.0.0.0 Safari/537.36', 'success'),
(12, 15, '2026-08-23 12:53:42', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'success'),
(13, 14, '2026-08-23 12:55:25', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'success'),
(14, 2, '2026-08-24 03:39:24', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'success');

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
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `work_schedules`
--

INSERT INTO `work_schedules` (`work_schedule_id`, `employee_id`, `day_of_week`, `shift_name`, `start_time`, `end_time`, `location`, `is_rest_day`, `effective_from`, `effective_to`, `created_at`, `updated_at`) VALUES
(1, 5, 0, 'AM Shift', '07:00:00', '16:00:00', 'Main Kitchen', 0, '2026-07-01', NULL, '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(2, 5, 1, 'AM Shift', '07:00:00', '16:00:00', 'Main Kitchen', 0, '2026-07-01', NULL, '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(3, 5, 2, 'Mid Shift', '11:00:00', '20:00:00', 'Banquet', 0, '2026-07-01', NULL, '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(4, 5, 3, 'Mid Shift', '11:00:00', '20:00:00', 'Banquet', 0, '2026-07-01', NULL, '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(5, 5, 4, 'PM Shift', '14:00:00', '23:00:00', 'Main Kitchen', 0, '2026-07-01', NULL, '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(6, 5, 5, NULL, NULL, NULL, NULL, 1, '2026-07-01', NULL, '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(7, 5, 6, NULL, NULL, NULL, NULL, 1, '2026-07-01', NULL, '2026-08-17 17:41:34', '2026-08-17 17:41:34');

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
-- Constraints for table `hr3_recommendations`
--
ALTER TABLE `hr3_recommendations`
  ADD CONSTRAINT `fk_hr3_recommendations_employee_id` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`),
  ADD CONSTRAINT `fk_hr3_recommendations_evaluator_user_id` FOREIGN KEY (`evaluator_user_id`) REFERENCES `system_users` (`system_user_id`),
  ADD CONSTRAINT `fk_hr3_recommendations_suggested_position_id` FOREIGN KEY (`suggested_position_id`) REFERENCES `positions` (`position_id`),
  ADD CONSTRAINT `fk_hr3_recommendations_suggested_salary_grade_id` FOREIGN KEY (`suggested_salary_grade_id`) REFERENCES `salary_grades` (`salary_grade_id`);

--
-- Constraints for table `interviews`
--
ALTER TABLE `interviews`
  ADD CONSTRAINT `fk_interviews_applicant_id` FOREIGN KEY (`applicant_id`) REFERENCES `applicants` (`applicant_id`) ON DELETE CASCADE,
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
