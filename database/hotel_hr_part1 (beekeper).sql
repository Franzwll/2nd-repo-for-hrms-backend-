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
(1, '2026-05-24', 'Job Fair: Hotel & Restaurant Careers Day', 'Walk-in interviews for Front Office, F&B, and Kitchen roles at the Grand Ballroom.', 'All', 1, 'published', '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(2, '2026-05-18', 'TESDA Certification Sponsorship', 'Oxford Suites now sponsors NC II certification for qualified regular employees.', 'All', 1, 'published', '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(3, '2026-05-02', 'Service Excellence Awards 2026', 'Congratulations to Front Office for the highest guest satisfaction score this quarter.', 'All', 1, 'published', '2026-10-18 09:06:13', '2026-10-18 09:06:13');

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
  `rejected_at` timestamp NULL DEFAULT NULL,
  `cooldown_lifted_at` timestamp NULL DEFAULT NULL,
  `offer_status` varchar(20) DEFAULT NULL,
  `offer_sent_at` timestamp NULL DEFAULT NULL,
  `offer_expires_at` timestamp NULL DEFAULT NULL,
  `offer_start_date` date DEFAULT NULL,
  `offer_response_channel` varchar(20) DEFAULT NULL,
  `offer_response_note` text DEFAULT NULL,
  `offer_responded_at` timestamp NULL DEFAULT NULL,
  `offer_response_recorded_by` varchar(150) DEFAULT NULL,
  `source` varchar(60) DEFAULT NULL,
  `resume_file_path` text DEFAULT NULL,
  `resume_original_name` varchar(255) DEFAULT NULL,
  `resume_hash` char(64) DEFAULT NULL,
  `summary` text DEFAULT NULL,
  `flags_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`flags_json`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`applicant_id`),
  UNIQUE KEY `applicants_applicant_code_unique` (`applicant_code`),
  KEY `idx_applicants_job_post_id` (`job_post_id`),
  KEY `idx_applicants_status` (`status`),
  KEY `idx_applicants_stage` (`stage`),
  KEY `idx_applicants_applied_at` (`applied_at`),
  KEY `idx_applicants_email_job_stage` (`email`,`job_post_id`,`stage`),
  KEY `idx_applicants_resume_hash` (`resume_hash`)
) ;

--
-- Dumping data for table `applicants`
--

INSERT INTO `applicants` (`applicant_id`, `applicant_code`, `job_post_id`, `name`, `email`, `phone`, `applied_at`, `fit_score`, `status`, `stage`, `rejected_at`, `cooldown_lifted_at`, `offer_status`, `offer_sent_at`, `offer_expires_at`, `offer_start_date`, `offer_response_channel`, `offer_response_note`, `offer_responded_at`, `offer_response_recorded_by`, `source`, `resume_file_path`, `resume_original_name`, `resume_hash`, `summary`, `flags_json`, `created_at`, `updated_at`) VALUES
(1, 'APP-1032', 1, 'Camille Ortega', 'camille.ortega@email.com', '0917 664 2219', '2026-07-22 07:47:00', 93.00, 'fit', 'Hired', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Referral', '/uploads/resumes/camille_ortega_resume.pdf', NULL, NULL, 'Referred by Front Office Manager; completed practical assessment with 94%.', '[]', '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(2, 'APP-1033', 6, 'Juan De La Cruz', 'juan.delacruz@email.com', '0912 345 6789', '2026-07-23 01:31:00', 76.00, 'fit', 'Interview Scheduled', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Indeed', '/uploads/resumes/juan_delacruz_resume.pdf', NULL, NULL, 'Agency recruitment coordinator transitioning to in-house HR.', '[]', '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(3, 'APP-1034', 3, 'Mark Reyes', 'mark.reyes@email.com', '0908 441 2277', '2026-07-24 03:05:00', 69.00, 'other-role', 'Screened', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Walk-in', '/uploads/resumes/mark_reyes_resume.pdf', NULL, NULL, 'Building maintenance background; endorse to Facilities vacancy.', '[\"Stronger match: Facilities Maintenance (81%)\"]', '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(4, 'APP-1035', 5, 'Jompaks Berdugo', 'jompaks.berdugo@email.com', '0933 552 1180', '2026-07-24 06:22:00', 84.00, 'fit', 'Assessed', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Facebook', '/uploads/resumes/jompaks_berdugo_resume.pdf', NULL, NULL, 'Rooftop bar experience with strong signature-cocktail portfolio.', '[]', '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(5, 'APP-1036', 2, 'Kevin Dela Cruz', 'kevin.delacruz@email.com', '0921 774 9903', '2026-07-24 08:48:00', 91.00, 'fit', 'Offer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Online Portal', '/uploads/resumes/kevin_delacruz_resume.pdf', NULL, NULL, 'Certified cook with four years hot-kitchen experience across two hotel outlets.', '[]', '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(6, 'APP-1037', 2, 'Elena Torres', 'elena.torres@email.com', '0918 220 3341', '2026-07-25 11:02:00', 22.00, 'not-fit', 'Rejected', '2026-10-18 09:06:13', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Online Portal', '/uploads/resumes/elena_torres_resume.pdf', NULL, NULL, 'Clerical background with no hospitality or culinary entities detected.', '[\"No culinary certification\",\"No kitchen experience detected\"]', '2026-10-18 09:06:13', '2026-10-21 06:48:39'),
(7, 'APP-1038', 3, 'Princess Mabangis', 'princess.mabangis@email', '0912 345', '2026-07-25 12:10:00', 58.00, 'credential', 'Interview Scheduled', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Walk-in', '/uploads/resumes/princess_mabangis_resume.pdf', NULL, NULL, 'Relevant housekeeping experience but contact details failed NER validation.', '[\"Malformed email address\",\"Incomplete phone number\",\"Job position typo on application form\"]', '2026-10-18 09:06:13', '2026-10-20 23:16:22'),
(8, 'APP-1039', 1, 'Kanor Ornak', 'kanor.ornak@email.com', '0905 118 7742', '2026-07-25 13:12:00', 74.00, 'other-role', 'Interview Scheduled', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Indeed', '/uploads/resumes/kanor_ornak_resume.pdf', NULL, NULL, 'Retail and cafe service background; better aligned to F&B service roles.', '[\"Stronger match: Restaurant Server (86%)\"]', '2026-10-18 09:06:13', '2026-10-20 23:17:22'),
(9, 'APP-1040', 4, 'Marjun Devera', 'marjun.devera@email.com', '0917 664 2219', '2026-07-25 14:40:00', 88.00, 'fit', 'Screened', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Referral', '/uploads/resumes/marjun_devera_resume.pdf', NULL, NULL, 'Strong dining-room service background with banquet exposure.', '[]', '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(10, 'APP-1041', 1, 'Bianca Soriano', 'bianca.soriano@email.com', '0912 345 6789', '2026-07-25 15:15:00', 96.00, 'fit', 'Interview Scheduled', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Online Portal', '/uploads/resumes/bianca_soriano_resume.pdf', NULL, NULL, 'Three years front office experience at a 4-star property, PMS proficient, complete credentials.', '[]', '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(11, 'APP-00011', 2, 'ARVIN KEITH DEL ROSARIO', 'arvin.delrosario.cook@outlook.ph', '09175208831', '2026-10-20 23:22:35', 92.00, 'credential', 'Screened', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Landing Page', 'resumes/NiYc3RKLMJn5WuzlQRKYSWO4vmfoLiDCh2WcVsZu.docx', 'Arvin_Keith_Del_Rosario_Resume.docx', 'fb0ff183b6ff2436a595a3dfd30ec3d1b8d5f660b668ee80365184ac846f48a9', 'Matched skills: Food Safety, HACCP, Knife Skills, Plating; Education requirement satisfied; Experience requirement satisfied (7.33 yrs vs 1.0 yrs required); All required certifications matched — meets Line Cook requirements. Supporting-document verification: 3 verified, 2 with discrepancies, 0 unable to verify — ranking score 92% (resume match 92%).', '[\"Unrecognized skill: Commercial Kitchen Equipment Operation\",\"Unrecognized skill: Cross-Contamination Prevention\",\"Unrecognized skill: Food Portioning\",\"Unrecognized skill: Fry Stations)\",\"Unrecognized skill: Grill\",\"Unrecognized skill: Perishable Stock Rotation\",\"Unrecognized skill: Prep Station Organization\",\"Unrecognized skill: Recipe Standardization\",\"Unrecognized skill: Roast\",\"Unrecognized skill: TESDA Cookery Standards\",\"Unrecognized skill: Temperature Danger Zone Controls\",\"Unrecognized job role: Kitchen Prep Assistant\",\"[DOCUMENT] COE verified: the document corroborates the resume claims.\",\"[DOCUMENT] COE discrepancy: the document contradicts the resume on Start date.\",\"[DOCUMENT] Credential verified: the document corroborates the resume claims.\",\"[DOCUMENT] Certificate verified: the document corroborates the resume claims.\",\"[DOCUMENT] Certificate discrepancy: the document contradicts the resume on Certification.\"]', '2026-10-20 23:22:35', '2026-10-20 23:22:37');

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
  `comments_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`comments_json`)),
  `total_score` decimal(5,2) DEFAULT NULL,
  `outcome` varchar(20) NOT NULL,
  `result` varchar(10) DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`assessment_id`),
  KEY `idx_applicant_assessments_applicant_id` (`applicant_id`),
  KEY `idx_applicant_assessments_assessor_user_id` (`assessor_user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `applicant_assessments`
--

INSERT INTO `applicant_assessments` (`assessment_id`, `applicant_id`, `assessor_user_id`, `assessment_date`, `scores_json`, `comments_json`, `total_score`, `outcome`, `result`, `remarks`, `created_at`, `updated_at`) VALUES
(1, 1, 2, '2026-07-23', '{\"Guest Service Orientation\":19,\"Communication Skills\":18,\"Technical / Practical Skill\":20,\"Grooming & Professionalism\":18,\"Availability & Flexibility\":19}', NULL, 94.00, 'Recommended', NULL, 'Practical front desk simulation passed with 94%. Advanced to job offer.', '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(2, 5, 2, '2026-07-26', '{\"Guest Service Orientation\":16,\"Communication Skills\":17,\"Technical / Practical Skill\":18,\"Grooming & Professionalism\":16,\"Availability & Flexibility\":15}', NULL, 82.00, 'Recommended', NULL, 'Cook test assessment passed; solid knife skills and station timing.', '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(3, 4, 2, '2026-07-27', '{\"Guest Service Orientation\":17,\"Communication Skills\":18,\"Technical / Practical Skill\":19,\"Grooming & Professionalism\":17,\"Availability & Flexibility\":17}', NULL, 88.00, 'Recommended', NULL, 'Mixology practical assessment passed with 88%.', '2026-10-18 09:06:13', '2026-10-18 09:06:13');

-- --------------------------------------------------------

--
-- Table structure for table `applicant_documents`
--

CREATE TABLE IF NOT EXISTS `applicant_documents` (
  `applicant_document_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
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
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`applicant_document_id`),
  KEY `idx_applicant_documents_applicant_id` (`applicant_id`),
  KEY `idx_applicant_documents_doc_type` (`doc_type`),
  KEY `idx_applicant_documents_verification_status` (`verification_status`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `applicant_documents`
--

INSERT INTO `applicant_documents` (`applicant_document_id`, `applicant_id`, `doc_type`, `title`, `original_copy`, `file_path`, `original_name`, `verification_status`, `verification_result_json`, `extracted_profile_json`, `verified_at`, `uploaded_at`, `created_at`, `updated_at`) VALUES
(1, 11, 'COE', 'Arvin_Keith_Del_Rosario_COE_Current_Employer.pdf', 0, 'applicant-documents/GjIdXAvnAs8hH963JzxovbANzM5vsn4GRZoKJAoh.pdf', 'Arvin_Keith_Del_Rosario_COE_Current_Employer.pdf', 'VERIFIED', '{\"success\":true,\"document_type\":\"COE\",\"verification_status\":\"VERIFIED\",\"checks\":{\"company\":{\"resume_value\":\"I\'M Hotel Makati\",\"document_value\":\"I\'M Hotel Makati\",\"normalized_resume\":\"i\'m hotel makati\",\"normalized_document\":\"i\'m hotel makati\",\"match_method\":\"exact\",\"result\":\"MATCH\",\"compared_resume_entry\":{\"entry_index\":0,\"total_entries\":3,\"company\":\"I\'M Hotel Makati\",\"job_title\":\"Line Cook \\/ Station Chef\",\"period\":\"November 2022 - Present\",\"location\":\"Makati City, Metro Manila\"}},\"position\":{\"resume_value\":\"Line Cook \\/ Station Chef\",\"document_value\":\"LINE COOK \\/ STATION CHEF\",\"normalized_resume\":\"line cook \\/ station chef\",\"normalized_document\":\"line cook \\/ station chef\",\"match_method\":\"exact\",\"result\":\"MATCH\",\"compared_resume_entry\":{\"entry_index\":0,\"total_entries\":3,\"company\":\"I\'M Hotel Makati\",\"job_title\":\"Line Cook \\/ Station Chef\",\"period\":\"November 2022 - Present\",\"location\":\"Makati City, Metro Manila\"}},\"start_date\":{\"resume_value\":\"November 2022 - Present\",\"document_value\":\"since November 2022 \\u2013 Present\",\"normalized_resume\":\"2022-11\",\"normalized_document\":\"2022-11\",\"match_method\":\"exact\",\"result\":\"MATCH\",\"compared_resume_entry\":{\"entry_index\":0,\"total_entries\":3,\"company\":\"I\'M Hotel Makati\",\"job_title\":\"Line Cook \\/ Station Chef\",\"period\":\"November 2022 - Present\",\"location\":\"Makati City, Metro Manila\"}},\"end_date\":{\"resume_value\":\"November 2022 - Present\",\"document_value\":\"since November 2022 \\u2013 Present\",\"normalized_resume\":\"present\",\"normalized_document\":\"present\",\"match_method\":\"exact\",\"result\":\"MATCH\",\"compared_resume_entry\":{\"entry_index\":0,\"total_entries\":3,\"company\":\"I\'M Hotel Makati\",\"job_title\":\"Line Cook \\/ Station Chef\",\"period\":\"November 2022 - Present\",\"location\":\"Makati City, Metro Manila\"}}},\"summary\":\"All 4 comparable field(s) on the certificate of employment match the resume claims.\",\"extracted_document_profile\":{\"name\":\"Official Human Resources Directorate\",\"organizations\":[],\"job_titles_raw\":[\"Chef\",\"Line Cook\"],\"education\":[\"CERTIFICATE OF EMPLOYMENT\\nTO WHOM IT MAY CONCERN\"],\"certifications_raw\":[\"This Certification\",\"Certified True And Correct\",\"Victoria M. Alcantara\",\"Victoria M. Alcantara, Chrp\",\"Vice President\",\"Official Certificate Of Employment\"],\"work_history\":[],\"sections_detected\":[\"additional\",\"certifications\",\"experience\"],\"estimated_years_experience\":0,\"document_claims\":{\"company\":\"I\'M Hotel Makati\",\"position\":\"LINE COOK \\/ STATION CHEF\",\"employment_dates\":\"since November 2022 \\u2013 Present\"}},\"text_extraction\":{\"method\":\"pypdfium2\",\"pages\":1,\"extension\":\".pdf\",\"character_count\":1176}}', '{\"name\":\"Official Human Resources Directorate\",\"organizations\":[],\"job_titles_raw\":[\"Chef\",\"Line Cook\"],\"education\":[\"CERTIFICATE OF EMPLOYMENT\\nTO WHOM IT MAY CONCERN\"],\"certifications_raw\":[\"This Certification\",\"Certified True And Correct\",\"Victoria M. Alcantara\",\"Victoria M. Alcantara, Chrp\",\"Vice President\",\"Official Certificate Of Employment\"],\"work_history\":[],\"sections_detected\":[\"additional\",\"certifications\",\"experience\"],\"estimated_years_experience\":0,\"document_claims\":{\"company\":\"I\'M Hotel Makati\",\"position\":\"LINE COOK \\/ STATION CHEF\",\"employment_dates\":\"since November 2022 \\u2013 Present\"}}', '2026-10-20 23:22:35', '2026-10-21 07:22:35', '2026-10-20 23:22:35', '2026-10-20 23:22:35'),
(2, 11, 'COE', 'Arvin_Keith_Del_Rosario_COE_Previous_Employer.pdf', 0, 'applicant-documents/PK7nlqpm1sqHYpoROK6XL7XspMn0qx6j8bagLoGM.pdf', 'Arvin_Keith_Del_Rosario_COE_Previous_Employer.pdf', 'DISCREPANCY_FOUND', '{\"success\":true,\"document_type\":\"COE\",\"verification_status\":\"DISCREPANCY_FOUND\",\"checks\":{\"company\":{\"resume_value\":\"Dusit Thani Manila\",\"document_value\":\"Dusit Thani Manila\",\"normalized_resume\":\"dusit thani manila\",\"normalized_document\":\"dusit thani manila\",\"match_method\":\"exact\",\"result\":\"MATCH\",\"compared_resume_entry\":{\"entry_index\":1,\"total_entries\":3,\"company\":\"Dusit Thani Manila\",\"job_title\":\"Commis Chef\",\"period\":\"January 2021 - October 2022\",\"location\":\"Makati City, Metro Manila\"}},\"position\":{\"resume_value\":\"Commis Chef\",\"document_value\":\"COMMIS CHEF\",\"normalized_resume\":\"commis chef\",\"normalized_document\":\"commis chef\",\"match_method\":\"exact\",\"result\":\"MATCH\",\"compared_resume_entry\":{\"entry_index\":1,\"total_entries\":3,\"company\":\"Dusit Thani Manila\",\"job_title\":\"Commis Chef\",\"period\":\"January 2021 - October 2022\",\"location\":\"Makati City, Metro Manila\"}},\"start_date\":{\"resume_value\":\"January 2021 - October 2022\",\"document_value\":\"April 1, 2021 - October 15, 2022\",\"normalized_resume\":\"2021-01\",\"normalized_document\":\"2021-04\",\"match_method\":\"exact\",\"result\":\"MISMATCH\",\"compared_resume_entry\":{\"entry_index\":1,\"total_entries\":3,\"company\":\"Dusit Thani Manila\",\"job_title\":\"Commis Chef\",\"period\":\"January 2021 - October 2022\",\"location\":\"Makati City, Metro Manila\"}},\"end_date\":{\"resume_value\":\"January 2021 - October 2022\",\"document_value\":\"April 1, 2021 - October 15, 2022\",\"normalized_resume\":\"2022-10\",\"normalized_document\":\"2022-10\",\"match_method\":\"exact\",\"result\":\"MATCH\",\"compared_resume_entry\":{\"entry_index\":1,\"total_entries\":3,\"company\":\"Dusit Thani Manila\",\"job_title\":\"Commis Chef\",\"period\":\"January 2021 - October 2022\",\"location\":\"Makati City, Metro Manila\"}}},\"summary\":\"Discrepancy found in Start date - the certificate of employment does not fully match the resume claims.\",\"extracted_document_profile\":{\"name\":\"DUSIT THANI HR\",\"organizations\":[\"Gerardo B. Mendoza\",\"VERIFIED ARCHIVE\"],\"job_titles_raw\":[\"Chef\",\"Line Cook\"],\"education\":[\"CERTIFICATE OF EMPLOYMENT AND CLEARANCE\\nTO WHOM IT MAY CONCERN\"],\"certifications_raw\":[\"This Certification\",\"Certified And Cleared By\",\"Gerardo B. Mendoza Exit Clearance\",\"Gerardo B. Mendoza, Fhrm Verified Archive\"],\"work_history\":[{\"job_title\":\"October 15, 2022\",\"company\":\"Gerardo B. Mendoza\",\"location\":null,\"recognized_role\":false,\"period\":null,\"raw_line\":\"EXIT CLEARANCE\",\"date_range\":{\"start\":null,\"end\":null,\"is_current\":false,\"start_year\":null,\"start_month\":null,\"end_year\":null,\"end_month\":null}},{\"job_title\":\"Director of Human Resources & Employee Relations\",\"company\":\"VERIFIED ARCHIVE\",\"location\":\"METRO MANILA\",\"recognized_role\":false,\"period\":null,\"raw_line\":\"Dusit Thani Manila\",\"date_range\":{\"start\":null,\"end\":null,\"is_current\":false,\"start_year\":null,\"start_month\":null,\"end_year\":null,\"end_month\":null}}],\"sections_detected\":[\"additional\",\"certifications\",\"experience\"],\"estimated_years_experience\":1.58,\"document_claims\":{\"company\":\"Dusit Thani Manila\",\"position\":\"COMMIS CHEF\",\"employment_dates\":\"April 1, 2021 - October 15, 2022\"}},\"text_extraction\":{\"method\":\"pdf-text (pdfplumber+pypdfium2)\",\"pages\":1,\"extension\":\".pdf\",\"character_count\":1017}}', '{\"name\":\"DUSIT THANI HR\",\"organizations\":[\"Gerardo B. Mendoza\",\"VERIFIED ARCHIVE\"],\"job_titles_raw\":[\"Chef\",\"Line Cook\"],\"education\":[\"CERTIFICATE OF EMPLOYMENT AND CLEARANCE\\nTO WHOM IT MAY CONCERN\"],\"certifications_raw\":[\"This Certification\",\"Certified And Cleared By\",\"Gerardo B. Mendoza Exit Clearance\",\"Gerardo B. Mendoza, Fhrm Verified Archive\"],\"work_history\":[{\"job_title\":\"October 15, 2022\",\"company\":\"Gerardo B. Mendoza\",\"location\":null,\"recognized_role\":false,\"period\":null,\"raw_line\":\"EXIT CLEARANCE\",\"date_range\":{\"start\":null,\"end\":null,\"is_current\":false,\"start_year\":null,\"start_month\":null,\"end_year\":null,\"end_month\":null}},{\"job_title\":\"Director of Human Resources & Employee Relations\",\"company\":\"VERIFIED ARCHIVE\",\"location\":\"METRO MANILA\",\"recognized_role\":false,\"period\":null,\"raw_line\":\"Dusit Thani Manila\",\"date_range\":{\"start\":null,\"end\":null,\"is_current\":false,\"start_year\":null,\"start_month\":null,\"end_year\":null,\"end_month\":null}}],\"sections_detected\":[\"additional\",\"certifications\",\"experience\"],\"estimated_years_experience\":1.58,\"document_claims\":{\"company\":\"Dusit Thani Manila\",\"position\":\"COMMIS CHEF\",\"employment_dates\":\"April 1, 2021 - October 15, 2022\"}}', '2026-10-20 23:22:36', '2026-10-21 07:22:35', '2026-10-20 23:22:35', '2026-10-20 23:22:36'),
(3, 11, 'Credential', 'Arvin_Keith_Del_Rosario_Diploma.pdf', 0, 'applicant-documents/vTijhznh7kFEwWmx20Q6SangQHY4K1kjlajjtuZK.pdf', 'Arvin_Keith_Del_Rosario_Diploma.pdf', 'VERIFIED', '{\"success\":true,\"document_type\":\"Credential\",\"verification_status\":\"VERIFIED\",\"checks\":{\"degree\":{\"resume_value\":null,\"document_value\":\"University Registrar University President\",\"normalized_resume\":null,\"normalized_document\":\"university registrar university president\",\"match_method\":\"unable\",\"result\":\"UNABLE_TO_EXTRACT\"},\"institution\":{\"resume_value\":\"De La Salle-College of Saint Benilde (DLS-CSB) - Malate, Manila\",\"document_value\":\"DE LA SALLE-COLLEGE OF SAINT BENILDE (DLS-CSB)\",\"normalized_resume\":\"de la salle-college of saint benilde (dls-csb) - malate, manila\",\"normalized_document\":\"de la salle-college of saint benilde (dls-csb)\",\"match_method\":\"token_set\",\"result\":\"MATCH\"}},\"summary\":\"All 1 comparable field(s) on the credential document match the resume claims. Degree could not be compared because the resume carries no equivalent value.\",\"extracted_document_profile\":{\"name\":\"REPUBLIKA NG PILIPINAS\",\"organizations\":[],\"job_titles_raw\":[],\"education\":[\"University Registrar University President\"],\"certifications_raw\":[\"Culinary Diploma\"],\"work_history\":[],\"sections_detected\":[\"education\"],\"estimated_years_experience\":0,\"document_claims\":{\"degree\":\"University Registrar University President\",\"institution\":\"DE LA SALLE-COLLEGE OF SAINT BENILDE (DLS-CSB)\"}},\"text_extraction\":{\"method\":\"pdf-text (pypdfium2+pdfplumber)\",\"pages\":1,\"extension\":\".pdf\",\"character_count\":776}}', '{\"name\":\"REPUBLIKA NG PILIPINAS\",\"organizations\":[],\"job_titles_raw\":[],\"education\":[\"University Registrar University President\"],\"certifications_raw\":[\"Culinary Diploma\"],\"work_history\":[],\"sections_detected\":[\"education\"],\"estimated_years_experience\":0,\"document_claims\":{\"degree\":\"University Registrar University President\",\"institution\":\"DE LA SALLE-COLLEGE OF SAINT BENILDE (DLS-CSB)\"}}', '2026-10-20 23:22:36', '2026-10-21 07:22:35', '2026-10-20 23:22:35', '2026-10-20 23:22:36'),
(4, 11, 'Others', 'Arvin_Keith_Del_Rosario_Incomplete_Certificate.pdf', 0, 'applicant-documents/jpSJDBfJQtLgLPpkeWLvXfBHuA8LriMT3yJ6j84d.pdf', 'Arvin_Keith_Del_Rosario_Incomplete_Certificate.pdf', 'UNABLE_TO_VERIFY', '{\"success\":true,\"document_type\":\"Others\",\"verification_status\":\"UNABLE_TO_VERIFY\",\"checks\":[],\"summary\":\"The document could not be read: This PDF has no text layer (scanned document) and no OCR engine is available on this server. Install Tesseract OCR to process it.\",\"error\":\"This PDF has no text layer (scanned document) and no OCR engine is available on this server. Install Tesseract OCR to process it.\",\"extracted_document_profile\":[]}', '[]', '2026-10-20 23:22:36', '2026-10-21 07:22:35', '2026-10-20 23:22:35', '2026-10-20 23:22:36'),
(5, 11, 'Others', 'Arvin_Keith_Del_Rosario_Resume.jpg', 0, 'applicant-documents/yWJ0UAgAqS9pTnzYVHbz5nRTld9zunsu3KxAVq6Y.jpg', 'Arvin_Keith_Del_Rosario_Resume.jpg', 'UNABLE_TO_VERIFY', '{\"success\":true,\"document_type\":\"Others\",\"verification_status\":\"UNABLE_TO_VERIFY\",\"checks\":[],\"summary\":\"The document could not be read: OCR engine not available on this server. Image resumes require Tesseract OCR.\",\"error\":\"OCR engine not available on this server. Image resumes require Tesseract OCR.\",\"extracted_document_profile\":[]}', '[]', '2026-10-20 23:22:36', '2026-10-21 07:22:35', '2026-10-20 23:22:35', '2026-10-20 23:22:36'),
(6, 11, 'Others', 'Arvin_Keith_Del_Rosario_Resume.pdf', 0, 'applicant-documents/d3foT35BNNYmZOQg02aMg6iErjPiv0djDAPo5Okz.pdf', 'Arvin_Keith_Del_Rosario_Resume.pdf', 'UNABLE_TO_VERIFY', '{\"success\":true,\"document_type\":\"Others\",\"verification_status\":\"UNABLE_TO_VERIFY\",\"checks\":[],\"summary\":\"Document type \'Others\' cannot be mapped to a resume section automatically; the extracted content is stored for manual HR review.\",\"extracted_document_profile\":{\"name\":\"ARVIN KEITH DEL ROSARIO\",\"organizations\":[\"I\'M Hotel Makati\",\"Dusit Thani Manila\",\"Romulo Caf\\u00e9 Makati\"],\"job_titles_raw\":[\"Line Cook \\/ Station Chef\",\"Commis Chef\",\"Kitchen Prep Assistant\"],\"education\":[\"Associate Degree in Culinary Arts and Kitchen Management\",\"De La Salle-College of Saint Benilde (DLS-CSB)\"],\"certifications_raw\":[\"TESDA Cookery NC II\",\"Servsafe Food Handler & Kitchen Sanitation\",\"Culinary Knife Skills And Modern Plating\",\"Culinary Diploma\"],\"work_history\":[{\"job_title\":\"Line Cook \\/ Station Chef\",\"company\":\"I\'M Hotel Makati\",\"location\":\"Makati City, Metro Manila\",\"recognized_role\":true,\"period\":\"November 2022 - Present\",\"raw_line\":\"I\'M Hotel Makati November 2022 - Present\",\"date_range\":{\"start\":\"2022-11\",\"end\":\"present\",\"is_current\":true,\"start_year\":2022,\"start_month\":11,\"end_year\":2026,\"end_month\":10,\"explicit_start_month\":true,\"explicit_end_month\":true}},{\"job_title\":\"Commis Chef\",\"company\":\"Dusit Thani Manila\",\"location\":\"Makati City, Metro Manila\",\"recognized_role\":true,\"period\":\"January 2021 - October 2022\",\"raw_line\":\"Dusit Thani Manila January 2021 - October 2022\",\"date_range\":{\"start\":\"2021-01\",\"end\":\"2022-10\",\"is_current\":false,\"start_year\":2021,\"start_month\":1,\"end_year\":2022,\"end_month\":10,\"explicit_start_month\":true,\"explicit_end_month\":true}},{\"job_title\":\"Kitchen Prep Assistant\",\"company\":\"Romulo Caf\\u00e9 Makati\",\"location\":\"Makati City, Metro Manila\",\"recognized_role\":false,\"period\":\"July 2019 - December 2020\",\"raw_line\":\"Romulo Caf\\u00e9 Makati July 2019 - December 2020\",\"date_range\":{\"start\":\"2019-07\",\"end\":\"2020-12\",\"is_current\":false,\"start_year\":2019,\"start_month\":7,\"end_year\":2020,\"end_month\":12,\"explicit_start_month\":true,\"explicit_end_month\":true}}],\"sections_detected\":[\"certifications\",\"contact\",\"education\",\"experience\",\"skills\",\"summary\"],\"estimated_years_experience\":7.33},\"text_extraction\":{\"method\":\"pdf-text (pypdfium2+pdfplumber)\",\"pages\":1,\"extension\":\".pdf\",\"character_count\":3615}}', '{\"name\":\"ARVIN KEITH DEL ROSARIO\",\"organizations\":[\"I\'M Hotel Makati\",\"Dusit Thani Manila\",\"Romulo Caf\\u00e9 Makati\"],\"job_titles_raw\":[\"Line Cook \\/ Station Chef\",\"Commis Chef\",\"Kitchen Prep Assistant\"],\"education\":[\"Associate Degree in Culinary Arts and Kitchen Management\",\"De La Salle-College of Saint Benilde (DLS-CSB)\"],\"certifications_raw\":[\"TESDA Cookery NC II\",\"Servsafe Food Handler & Kitchen Sanitation\",\"Culinary Knife Skills And Modern Plating\",\"Culinary Diploma\"],\"work_history\":[{\"job_title\":\"Line Cook \\/ Station Chef\",\"company\":\"I\'M Hotel Makati\",\"location\":\"Makati City, Metro Manila\",\"recognized_role\":true,\"period\":\"November 2022 - Present\",\"raw_line\":\"I\'M Hotel Makati November 2022 - Present\",\"date_range\":{\"start\":\"2022-11\",\"end\":\"present\",\"is_current\":true,\"start_year\":2022,\"start_month\":11,\"end_year\":2026,\"end_month\":10,\"explicit_start_month\":true,\"explicit_end_month\":true}},{\"job_title\":\"Commis Chef\",\"company\":\"Dusit Thani Manila\",\"location\":\"Makati City, Metro Manila\",\"recognized_role\":true,\"period\":\"January 2021 - October 2022\",\"raw_line\":\"Dusit Thani Manila January 2021 - October 2022\",\"date_range\":{\"start\":\"2021-01\",\"end\":\"2022-10\",\"is_current\":false,\"start_year\":2021,\"start_month\":1,\"end_year\":2022,\"end_month\":10,\"explicit_start_month\":true,\"explicit_end_month\":true}},{\"job_title\":\"Kitchen Prep Assistant\",\"company\":\"Romulo Caf\\u00e9 Makati\",\"location\":\"Makati City, Metro Manila\",\"recognized_role\":false,\"period\":\"July 2019 - December 2020\",\"raw_line\":\"Romulo Caf\\u00e9 Makati July 2019 - December 2020\",\"date_range\":{\"start\":\"2019-07\",\"end\":\"2020-12\",\"is_current\":false,\"start_year\":2019,\"start_month\":7,\"end_year\":2020,\"end_month\":12,\"explicit_start_month\":true,\"explicit_end_month\":true}}],\"sections_detected\":[\"certifications\",\"contact\",\"education\",\"experience\",\"skills\",\"summary\"],\"estimated_years_experience\":7.33}', '2026-10-20 23:22:36', '2026-10-21 07:22:35', '2026-10-20 23:22:35', '2026-10-20 23:22:36'),
(7, 11, 'Others', 'Arvin_Keith_Del_Rosario_Resume.png', 0, 'applicant-documents/kuIyP1wOnyGeLSYP05lGbtxwWn4jl21AyG3Sd7kq.png', 'Arvin_Keith_Del_Rosario_Resume.png', 'UNABLE_TO_VERIFY', '{\"success\":true,\"document_type\":\"Others\",\"verification_status\":\"UNABLE_TO_VERIFY\",\"checks\":[],\"summary\":\"The document could not be read: OCR engine not available on this server. Image resumes require Tesseract OCR.\",\"error\":\"OCR engine not available on this server. Image resumes require Tesseract OCR.\",\"extracted_document_profile\":[]}', '[]', '2026-10-20 23:22:36', '2026-10-21 07:22:35', '2026-10-20 23:22:35', '2026-10-20 23:22:36'),
(8, 11, 'Others', 'Arvin_Keith_Del_Rosario_Resume_Blurred.jpg', 0, 'applicant-documents/Ncwwo4DJ94sqsa4IwRrk4NsGNeITNd7ghAs6jKg3.jpg', 'Arvin_Keith_Del_Rosario_Resume_Blurred.jpg', 'UNABLE_TO_VERIFY', '{\"success\":true,\"document_type\":\"Others\",\"verification_status\":\"UNABLE_TO_VERIFY\",\"checks\":[],\"summary\":\"The document could not be read: OCR engine not available on this server. Image resumes require Tesseract OCR.\",\"error\":\"OCR engine not available on this server. Image resumes require Tesseract OCR.\",\"extracted_document_profile\":[]}', '[]', '2026-10-20 23:22:36', '2026-10-21 07:22:35', '2026-10-20 23:22:35', '2026-10-20 23:22:36'),
(9, 11, 'Others', 'Arvin_Keith_Del_Rosario_Resume_Blurred.png', 0, 'applicant-documents/WxZgU1spYBwMgfqVRYdXX9HMbo3yN07sAJ38bRq0.png', 'Arvin_Keith_Del_Rosario_Resume_Blurred.png', 'UNABLE_TO_VERIFY', '{\"success\":true,\"document_type\":\"Others\",\"verification_status\":\"UNABLE_TO_VERIFY\",\"checks\":[],\"summary\":\"The document could not be read: OCR engine not available on this server. Image resumes require Tesseract OCR.\",\"error\":\"OCR engine not available on this server. Image resumes require Tesseract OCR.\",\"extracted_document_profile\":[]}', '[]', '2026-10-20 23:22:36', '2026-10-21 07:22:35', '2026-10-20 23:22:35', '2026-10-20 23:22:36'),
(10, 11, 'Certificate', 'Arvin_Keith_Del_Rosario_Training_Certificate_FoodSafety.pdf', 0, 'applicant-documents/MBT1zCCom1mvyOdDS8zuQ4MHcFJC0m1Op9wRJneE.pdf', 'Arvin_Keith_Del_Rosario_Training_Certificate_FoodSafety.pdf', 'VERIFIED', '{\"success\":true,\"document_type\":\"Certificate\",\"verification_status\":\"VERIFIED\",\"checks\":{\"certification\":{\"resume_value\":\"TESDA Cookery NC II\",\"document_value\":\"TESDA Cookery NC II\",\"normalized_resume\":\"tesda cookery nc ii\",\"normalized_document\":\"tesda cookery nc ii\",\"match_method\":\"exact\",\"result\":\"MATCH\"},\"issuer\":{\"resume_value\":\"TESDA Cookery NC II\",\"document_value\":\"TECHNICAL EDUCATION AND SKILLS DEVELOPMENT AUTHORITY (TESDA)\",\"normalized_resume\":\"tesda cookery nc ii\",\"normalized_document\":\"technical education and skills development authority (tesda)\",\"match_method\":\"acronym\",\"result\":\"MATCH\"}},\"summary\":\"All 2 comparable field(s) on the educational certificate match the resume claims.\",\"extracted_document_profile\":{\"name\":\"ARVIN KEITH DEL ROSARIO\",\"organizations\":[],\"job_titles_raw\":[],\"education\":[\"CERTIFICATE OF COMPETENCY AND COMPLETION\\nThis is to officially certify that\"],\"certifications_raw\":[\"Of Competency And Completion\",\"This Is To Officially Certify That\",\"TESDA Cookery NC II\",\"Enrico J. Salcedo\",\"Lead Certified Trainer\",\"Dr. Corazon G. Reyes\",\"Enrico J. Salcedo Dr. Corazon G. Reyes\"],\"work_history\":[],\"sections_detected\":[\"certifications\",\"skills\"],\"estimated_years_experience\":0,\"document_claims\":{\"certification\":\"TESDA Cookery NC II\",\"issuer\":\"TECHNICAL EDUCATION AND SKILLS DEVELOPMENT AUTHORITY (TESDA)\"}},\"text_extraction\":{\"method\":\"pdf-text (pypdfium2+pdfplumber)\",\"pages\":1,\"extension\":\".pdf\",\"character_count\":638}}', '{\"name\":\"ARVIN KEITH DEL ROSARIO\",\"organizations\":[],\"job_titles_raw\":[],\"education\":[\"CERTIFICATE OF COMPETENCY AND COMPLETION\\nThis is to officially certify that\"],\"certifications_raw\":[\"Of Competency And Completion\",\"This Is To Officially Certify That\",\"TESDA Cookery NC II\",\"Enrico J. Salcedo\",\"Lead Certified Trainer\",\"Dr. Corazon G. Reyes\",\"Enrico J. Salcedo Dr. Corazon G. Reyes\"],\"work_history\":[],\"sections_detected\":[\"certifications\",\"skills\"],\"estimated_years_experience\":0,\"document_claims\":{\"certification\":\"TESDA Cookery NC II\",\"issuer\":\"TECHNICAL EDUCATION AND SKILLS DEVELOPMENT AUTHORITY (TESDA)\"}}', '2026-10-20 23:22:36', '2026-10-21 07:22:35', '2026-10-20 23:22:35', '2026-10-20 23:22:36'),
(11, 11, 'Certificate', 'Arvin_Keith_Del_Rosario_Training_Certificate_Service.pdf', 0, 'applicant-documents/zYBHOYyUuusQBNClRVKGDnqv94Y3MGNvd3OZhLpM.pdf', 'Arvin_Keith_Del_Rosario_Training_Certificate_Service.pdf', 'DISCREPANCY_FOUND', '{\"success\":true,\"document_type\":\"Certificate\",\"verification_status\":\"DISCREPANCY_FOUND\",\"checks\":{\"certification\":{\"resume_value\":\"Culinary Knife Skills And Modern Plating Workshop\",\"document_value\":\"Basic Occupational Safety and Health Training\",\"normalized_resume\":\"culinary knife skills and modern plating workshop\",\"normalized_document\":\"basic occupational safety and health training\",\"match_method\":\"fuzzy\",\"result\":\"MISMATCH\"},\"issuer\":{\"resume_value\":null,\"document_value\":\"National Institute for Hospitality Professional Development\",\"normalized_resume\":null,\"normalized_document\":\"national institute for hospitality professional development\",\"match_method\":\"unable\",\"result\":\"UNABLE_TO_EXTRACT\"}},\"summary\":\"Discrepancy found in Certification - the educational certificate does not fully match the resume claims.\",\"extracted_document_profile\":{\"name\":\"ARVIN KEITH DEL ROSARIO\",\"organizations\":[],\"job_titles_raw\":[],\"education\":[\"CERTIFICATE OF TRAINING PARTICIPATION\\nThis certificate is proudly awarded t\"],\"certifications_raw\":[\"Basic Occupational Safety and Health Training\",\"This Certificate\",\"Fundamentals Of Basic Western Bakery And Pastry Arts\",\"Ramon F. Bautista\",\"Ramon F. Bautista Managing Director\",\"Lourdes M. Tan\",\"Lead Program Facilitator\",\"Ramon F. Bautista Lourdes M. Tan\"],\"work_history\":[],\"sections_detected\":[\"certifications\"],\"estimated_years_experience\":0,\"document_claims\":{\"certification\":\"Basic Occupational Safety and Health Training\",\"issuer\":\"National Institute for Hospitality Professional Development\"}},\"text_extraction\":{\"method\":\"pdf-text (pypdfium2+pdfplumber)\",\"pages\":1,\"extension\":\".pdf\",\"character_count\":572}}', '{\"name\":\"ARVIN KEITH DEL ROSARIO\",\"organizations\":[],\"job_titles_raw\":[],\"education\":[\"CERTIFICATE OF TRAINING PARTICIPATION\\nThis certificate is proudly awarded t\"],\"certifications_raw\":[\"Basic Occupational Safety and Health Training\",\"This Certificate\",\"Fundamentals Of Basic Western Bakery And Pastry Arts\",\"Ramon F. Bautista\",\"Ramon F. Bautista Managing Director\",\"Lourdes M. Tan\",\"Lead Program Facilitator\",\"Ramon F. Bautista Lourdes M. Tan\"],\"work_history\":[],\"sections_detected\":[\"certifications\"],\"estimated_years_experience\":0,\"document_claims\":{\"certification\":\"Basic Occupational Safety and Health Training\",\"issuer\":\"National Institute for Hospitality Professional Development\"}}', '2026-10-20 23:22:37', '2026-10-21 07:22:35', '2026-10-20 23:22:35', '2026-10-20 23:22:37');

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
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  PRIMARY KEY (`screening_id`),
  KEY `idx_applicant_screenings_applicant_id` (`applicant_id`),
  KEY `idx_applicant_screenings_job_post_id` (`job_post_id`),
  KEY `idx_applicant_screenings_processing_status` (`processing_status`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `applicant_screenings`
--

INSERT INTO `applicant_screenings` (`screening_id`, `applicant_id`, `job_post_id`, `processing_status`, `screening_result`, `match_score`, `resume_match_score`, `score_breakdown_json`, `profile_json`, `entities_json`, `missing_information_json`, `validation_json`, `alternative_job_json`, `document_verification_json`, `reasons_json`, `model_info_json`, `error_message`, `processed_at`, `created_at`, `updated_at`) VALUES
(1, 11, 2, 'PARTIALLY_PROCESSED', 'credential', 92.00, 92.00, '{\"skills\":{\"weight\":0.4,\"earned\":32,\"max\":40,\"matched_required\":[\"Food Safety\",\"HACCP\",\"Knife Skills\",\"Plating\"],\"fuzzy_matched_required\":[],\"missing_required\":[\"Teamwork\"],\"matched_preferred\":[],\"missing_preferred\":[],\"required_coverage\":0.8,\"preferred_coverage\":1},\"experience\":{\"weight\":0.3,\"earned\":30,\"max\":30,\"estimated_years\":7.33,\"min_years_required\":1,\"requirement_met\":true},\"education\":{\"weight\":0.2,\"earned\":20,\"max\":20,\"applicant_highest_level\":[\"Associate Degree in Culinary Arts and Kitchen Management\",\"De La Salle-College of Saint Benilde (DLS-CSB) - Malate, Manila\"],\"required_level\":\"Vocational \\/ TESDA\",\"requirement_met\":true},\"certifications\":{\"weight\":0.1,\"earned\":10,\"max\":10,\"matched\":[\"TESDA Cookery NC II\",\"Food Handler Certificate\"],\"missing\":[],\"no_requirements\":false}}', '{\"personal_information\":{\"name\":\"ARVIN KEITH DEL ROSARIO\",\"email\":\"arvin.delrosario.cook@outlook.ph\",\"phone\":\"+63 917 520 8831\",\"address\":\"67 Chino Roces Avenue, Bangkal, 1233 Makati City, Philippines\"},\"education\":[\"Associate Degree in Culinary Arts and Kitchen Management\",\"De La Salle-College of Saint Benilde (DLS-CSB) - Malate, Manila\"],\"work_experience\":[{\"job_title\":\"Line Cook \\/ Station Chef\",\"company\":\"I\'M Hotel Makati\",\"location\":\"Makati City, Metro Manila\",\"period\":\"November 2022 - Present\",\"recognized_role\":true},{\"job_title\":\"Commis Chef\",\"company\":\"Dusit Thani Manila\",\"location\":\"Makati City, Metro Manila\",\"period\":\"January 2021 - October 2022\",\"recognized_role\":true},{\"job_title\":\"Kitchen Prep Assistant\",\"company\":\"Romulo Caf\\u00e9 Makati\",\"location\":\"Makati City, Metro Manila\",\"period\":\"July 2019 - December 2020\",\"recognized_role\":false}],\"skills\":[\"Food Safety\",\"HACCP\",\"Hot Kitchen\",\"Knife Skills\",\"Mise en Place\",\"Pastry and Baking\",\"Plating\"],\"certifications\":[\"Culinary Diploma\",\"Food Handler Certificate\",\"TESDA Cookery NC II\",\"Culinary Knife Skills And Modern Plating Workshop\"],\"unrecognized_certifications\":[\"Culinary Knife Skills And Modern Plating Workshop\"],\"estimated_years_experience\":7.33,\"estimated_experience_months\":88,\"job_roles\":{\"recognized\":[\"Line Cook\"],\"unrecognized\":[\"Kitchen Prep Assistant\"]},\"unrecognized_skills\":[\"Commercial Kitchen Equipment Operation\",\"Cross-Contamination Prevention\",\"Food Portioning\",\"Fry Stations)\",\"Grill\",\"Perishable Stock Rotation\",\"Prep Station Organization\",\"Recipe Standardization\",\"Roast\",\"TESDA Cookery Standards\",\"Temperature Danger Zone Controls\"]}', '[{\"label\":\"PERSON\",\"value\":\"ARVIN KEITH DEL ROSARIO\",\"source\":\"rule\"},{\"label\":\"EDUCATION\",\"value\":\"Associate Degree in Culinary Arts and Kitchen Management\",\"source\":\"section_rule\"},{\"label\":\"EDUCATION\",\"value\":\"De La Salle-College of Saint Benilde (DLS-CSB) - Malate, Manila\",\"source\":\"section_rule\"},{\"label\":\"JOB_TITLE\",\"value\":\"Line Cook \\/ Station Chef\",\"source\":\"section_rule\"},{\"label\":\"JOB_TITLE\",\"value\":\"Commis Chef\",\"source\":\"section_rule\"},{\"label\":\"JOB_TITLE\",\"value\":\"Kitchen Prep Assistant\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Food Safety\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"HACCP\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Hot Kitchen\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Knife Skills\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Mise en Place\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Pastry and Baking\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Plating\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Grill\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Roast\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Fry Stations)\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Perishable Stock Rotation\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Prep Station Organization\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Recipe Standardization\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Food Portioning\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Commercial Kitchen Equipment Operation\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Temperature Danger Zone Controls\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"TESDA Cookery Standards\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Cross-Contamination Prevention\",\"source\":\"section_rule\"},{\"label\":\"CERTIFICATION\",\"value\":\"TESDA Cookery NC II\",\"source\":\"section_rule\"},{\"label\":\"CERTIFICATION\",\"value\":\"Food Handler Certificate\",\"source\":\"section_rule\"},{\"label\":\"CERTIFICATION\",\"value\":\"Culinary Knife Skills And Modern Plating Workshop\",\"source\":\"hint_pattern\"},{\"label\":\"CERTIFICATION\",\"value\":\"Culinary Diploma\",\"source\":\"reference_scan\"},{\"label\":\"ORGANIZATION\",\"value\":\"I\'M Hotel Makati\",\"source\":\"section_rule\"},{\"label\":\"ORGANIZATION\",\"value\":\"Dusit Thani Manila\",\"source\":\"section_rule\"},{\"label\":\"ORGANIZATION\",\"value\":\"Romulo Caf\\u00e9 Makati\",\"source\":\"section_rule\"},{\"label\":\"ORGANIZATION\",\"value\":\"Commis\",\"source\":\"section_rule\"},{\"label\":\"EMAIL\",\"value\":\"arvin.delrosario.cook@outlook.ph\",\"source\":\"regex\"},{\"label\":\"PHONE\",\"value\":\"+63 917 520 8831\",\"source\":\"regex\"}]', '[]', '{\"missing_information\":[],\"invalid_format\":[],\"skill_analysis\":{\"recognized\":[\"Food Safety\",\"HACCP\",\"Hot Kitchen\",\"Knife Skills\",\"Mise en Place\",\"Pastry and Baking\",\"Plating\"],\"unrecognized\":[\"Commercial Kitchen Equipment Operation\",\"Cross-Contamination Prevention\",\"Food Portioning\",\"Fry Stations)\",\"Grill\",\"Perishable Stock Rotation\",\"Prep Station Organization\",\"Recipe Standardization\",\"Roast\",\"TESDA Cookery Standards\",\"Temperature Danger Zone Controls\"]},\"job_role_analysis\":{\"recognized\":[\"Line Cook\"],\"unrecognized\":[\"Kitchen Prep Assistant\"]},\"credential_analysis\":[{\"required\":\"TESDA Cookery NC II\",\"status\":\"RECOGNIZED\",\"matched_value\":\"TESDA Cookery NC II\"},{\"required\":\"Food Handler Certificate\",\"status\":\"RECOGNIZED\",\"matched_value\":\"Food Handler Certificate\"},{\"required\":null,\"extracted\":\"Culinary Knife Skills And Modern Plating Workshop\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"}],\"credential_issues\":[],\"credential_verification\":{\"flags\":[],\"warning_count\":0,\"info_count\":0,\"risk_level\":\"LOW\",\"score_penalty\":0,\"escalate_invalid\":false,\"summary\":\"All internal credential consistency checks passed. No timeline or credential anomalies detected.\",\"checks_performed\":[\"timeline_overlap\",\"future_dates\",\"experience_graduation_gap\",\"seniority_experience_mismatch\",\"excessive_job_hopping\",\"education_cert_prerequisites\",\"chronological_coherence\"]},\"review_flags\":[{\"type\":\"UNRECOGNIZED_JOB_ROLE\",\"detail\":\"Kitchen Prep Assistant\",\"note\":\"Not found in system reference data; flagged for manual review only.\"}]}', NULL, '{\"status\":\"DISCREPANCY\",\"weight\":0.15,\"documents_total\":11,\"decisive_count\":5,\"verified_count\":3,\"discrepancy_count\":2,\"unable_count\":0,\"pending_count\":0,\"ignored_count\":6,\"credit_ratio\":0.6,\"documents_score\":60,\"score_penalty\":0,\"score_bonus\":0,\"escalate_invalid\":true,\"mismatched_fields\":[\"Certification\",\"Start date\"],\"flags\":[\"COE verified: the document corroborates the resume claims.\",\"COE discrepancy: the document contradicts the resume on Start date.\",\"Credential verified: the document corroborates the resume claims.\",\"Certificate verified: the document corroborates the resume claims.\",\"Certificate discrepancy: the document contradicts the resume on Certification.\"],\"per_document\":[{\"applicant_document_id\":1,\"doc_type\":\"COE\",\"verification_status\":\"VERIFIED\",\"counted\":true,\"credit\":1,\"mismatched_fields\":[],\"summary\":\"All 4 comparable field(s) on the certificate of employment match the resume claims.\",\"ignored_reason\":null},{\"applicant_document_id\":2,\"doc_type\":\"COE\",\"verification_status\":\"DISCREPANCY_FOUND\",\"counted\":true,\"credit\":0,\"mismatched_fields\":[\"Start date\"],\"summary\":\"Discrepancy found in Start date - the certificate of employment does not fully match the resume claims.\",\"ignored_reason\":null},{\"applicant_document_id\":3,\"doc_type\":\"Credential\",\"verification_status\":\"VERIFIED\",\"counted\":true,\"credit\":1,\"mismatched_fields\":[],\"summary\":\"All 1 comparable field(s) on the credential document match the resume claims. Degree could not be compared because the resume carries no equivalent value.\",\"ignored_reason\":null},{\"applicant_document_id\":4,\"doc_type\":\"Others\",\"verification_status\":\"UNABLE_TO_VERIFY\",\"counted\":false,\"credit\":null,\"mismatched_fields\":[],\"summary\":\"The document could not be read: This PDF has no text layer (scanned document) and no OCR engine is available on this server. Install Tesseract OCR to process it.\",\"ignored_reason\":\"document type cannot be mapped to a resume section\"},{\"applicant_document_id\":5,\"doc_type\":\"Others\",\"verification_status\":\"UNABLE_TO_VERIFY\",\"counted\":false,\"credit\":null,\"mismatched_fields\":[],\"summary\":\"The document could not be read: OCR engine not available on this server. Image resumes require Tesseract OCR.\",\"ignored_reason\":\"document type cannot be mapped to a resume section\"},{\"applicant_document_id\":6,\"doc_type\":\"Others\",\"verification_status\":\"UNABLE_TO_VERIFY\",\"counted\":false,\"credit\":null,\"mismatched_fields\":[],\"summary\":\"Document type \'Others\' cannot be mapped to a resume section automatically; the extracted content is stored for manual HR review.\",\"ignored_reason\":\"document type cannot be mapped to a resume section\"},{\"applicant_document_id\":7,\"doc_type\":\"Others\",\"verification_status\":\"UNABLE_TO_VERIFY\",\"counted\":false,\"credit\":null,\"mismatched_fields\":[],\"summary\":\"The document could not be read: OCR engine not available on this server. Image resumes require Tesseract OCR.\",\"ignored_reason\":\"document type cannot be mapped to a resume section\"},{\"applicant_document_id\":8,\"doc_type\":\"Others\",\"verification_status\":\"UNABLE_TO_VERIFY\",\"counted\":false,\"credit\":null,\"mismatched_fields\":[],\"summary\":\"The document could not be read: OCR engine not available on this server. Image resumes require Tesseract OCR.\",\"ignored_reason\":\"document type cannot be mapped to a resume section\"},{\"applicant_document_id\":9,\"doc_type\":\"Others\",\"verification_status\":\"UNABLE_TO_VERIFY\",\"counted\":false,\"credit\":null,\"mismatched_fields\":[],\"summary\":\"The document could not be read: OCR engine not available on this server. Image resumes require Tesseract OCR.\",\"ignored_reason\":\"document type cannot be mapped to a resume section\"},{\"applicant_document_id\":10,\"doc_type\":\"Certificate\",\"verification_status\":\"VERIFIED\",\"counted\":true,\"credit\":1,\"mismatched_fields\":[],\"summary\":\"All 2 comparable field(s) on the educational certificate match the resume claims.\",\"ignored_reason\":null},{\"applicant_document_id\":11,\"doc_type\":\"Certificate\",\"verification_status\":\"DISCREPANCY_FOUND\",\"counted\":true,\"credit\":0,\"mismatched_fields\":[\"Certification\"],\"summary\":\"Discrepancy found in Certification - the educational certificate does not fully match the resume claims.\",\"ignored_reason\":null}]}', '[\"Supporting-document verification (3 verified, 2 with discrepancies) kept the score at 92.0% (documents score 60.0% at a 15% weighting).\",\"COE verified: the document corroborates the resume claims.\",\"COE discrepancy: the document contradicts the resume on Start date.\",\"Credential verified: the document corroborates the resume claims.\",\"Certificate verified: the document corroborates the resume claims.\",\"Certificate discrepancy: the document contradicts the resume on Certification.\",\"Supporting-document verification found a discrepancy on Certification, Start date - the uploaded document contradicts the resume claims.\",\"Classification INVALID_CREDENTIAL means \'invalid or requires verification based on system validation rules\'; it does not imply fraud.\"]', '{\"base_model\":\"en_core_web_sm\",\"custom_ner_loaded\":true,\"custom_ner_path\":\"C:\\\\Users\\\\clare\\\\OneDrive\\\\Documents\\\\GitHub\\\\2nd-repo-for-hrms-backend-\\\\nlp-service\\\\models_spacy\\\\role_specific_ner\"}', NULL, '2026-10-20 23:22:37', '2026-10-20 23:22:35', '2026-10-20 23:22:37');

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
  KEY `idx_applicant_screening_entities_applicant_id` (`applicant_id`)
) ENGINE=InnoDB AUTO_INCREMENT=67 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `applicant_screening_entities`
--

INSERT INTO `applicant_screening_entities` (`entity_id`, `applicant_id`, `label`, `value`, `created_at`) VALUES
(1, 1, 'SKILL', 'Guest Relations', '2026-10-18 09:06:13'),
(2, 1, 'CERT', 'TESDA Front Office NC II', '2026-10-18 09:06:13'),
(3, 1, 'EDU', 'BS Tourism', '2026-10-18 09:06:13'),
(4, 2, 'SKILL', 'Recruitment', '2026-10-18 09:06:13'),
(5, 2, 'EDU', 'BS Psychology', '2026-10-18 09:06:13'),
(6, 2, 'ORG', 'Metro Staffing', '2026-10-18 09:06:13'),
(7, 3, 'SKILL', 'Maintenance', '2026-10-18 09:06:13'),
(8, 3, 'SKILL', 'Laundry Operations', '2026-10-18 09:06:13'),
(9, 4, 'SKILL', 'Mixology', '2026-10-18 09:06:13'),
(10, 4, 'CERT', 'TESDA Bartending NC II', '2026-10-18 09:06:13'),
(11, 4, 'ORG', 'Sky Lounge BGC', '2026-10-18 09:06:13'),
(12, 5, 'SKILL', 'Hot Kitchen', '2026-10-18 09:06:13'),
(13, 5, 'CERT', 'TESDA Cookery NC II', '2026-10-18 09:06:13'),
(14, 5, 'CERT', 'Food Handler', '2026-10-18 09:06:13'),
(15, 5, 'ORG', 'Seaside Grill', '2026-10-18 09:06:13'),
(16, 6, 'SKILL', 'Data Entry', '2026-10-18 09:06:13'),
(17, 6, 'EDU', 'BS Accountancy', '2026-10-18 09:06:13'),
(18, 7, 'SKILL', 'Room Turnover', '2026-10-18 09:06:13'),
(19, 7, 'ORG', 'Sunrise Inn', '2026-10-18 09:06:13'),
(20, 8, 'SKILL', 'Cash Handling', '2026-10-18 09:06:13'),
(21, 8, 'SKILL', 'Inventory', '2026-10-18 09:06:13'),
(22, 8, 'ORG', 'Cafe Verde', '2026-10-18 09:06:13'),
(23, 8, 'EDU', 'College Level', '2026-10-18 09:06:13'),
(24, 9, 'SKILL', 'Table Service', '2026-10-18 09:06:13'),
(25, 9, 'SKILL', 'POS Systems', '2026-10-18 09:06:13'),
(26, 9, 'ORG', 'Bistro Manila', '2026-10-18 09:06:13'),
(27, 9, 'EDU', 'HRM Vocational', '2026-10-18 09:06:13'),
(28, 10, 'SKILL', 'Guest Relations', '2026-10-18 09:06:13'),
(29, 10, 'SKILL', 'Opera PMS', '2026-10-18 09:06:13'),
(30, 10, 'ORG', 'Grand Horizon Hotel', '2026-10-18 09:06:13'),
(31, 10, 'EDU', 'BS Hospitality Management', '2026-10-18 09:06:13'),
(32, 10, 'CERT', 'TESDA Front Office NC II', '2026-10-18 09:06:13'),
(33, 11, 'PERSON', 'ARVIN KEITH DEL ROSARIO', '2026-10-21 07:22:35'),
(34, 11, 'EDUCATION', 'Associate Degree in Culinary Arts and Kitchen Management', '2026-10-21 07:22:35'),
(35, 11, 'EDUCATION', 'De La Salle-College of Saint Benilde (DLS-CSB) - Malate, Manila', '2026-10-21 07:22:35'),
(36, 11, 'JOB_TITLE', 'Line Cook / Station Chef', '2026-10-21 07:22:35'),
(37, 11, 'JOB_TITLE', 'Commis Chef', '2026-10-21 07:22:35'),
(38, 11, 'JOB_TITLE', 'Kitchen Prep Assistant', '2026-10-21 07:22:35'),
(39, 11, 'SKILL', 'Food Safety', '2026-10-21 07:22:35'),
(40, 11, 'SKILL', 'HACCP', '2026-10-21 07:22:35'),
(41, 11, 'SKILL', 'Hot Kitchen', '2026-10-21 07:22:35'),
(42, 11, 'SKILL', 'Knife Skills', '2026-10-21 07:22:35'),
(43, 11, 'SKILL', 'Mise en Place', '2026-10-21 07:22:35'),
(44, 11, 'SKILL', 'Pastry and Baking', '2026-10-21 07:22:35'),
(45, 11, 'SKILL', 'Plating', '2026-10-21 07:22:35'),
(46, 11, 'SKILL', 'Grill', '2026-10-21 07:22:35'),
(47, 11, 'SKILL', 'Roast', '2026-10-21 07:22:35'),
(48, 11, 'SKILL', 'Fry Stations)', '2026-10-21 07:22:35'),
(49, 11, 'SKILL', 'Perishable Stock Rotation', '2026-10-21 07:22:35'),
(50, 11, 'SKILL', 'Prep Station Organization', '2026-10-21 07:22:35'),
(51, 11, 'SKILL', 'Recipe Standardization', '2026-10-21 07:22:35'),
(52, 11, 'SKILL', 'Food Portioning', '2026-10-21 07:22:35'),
(53, 11, 'SKILL', 'Commercial Kitchen Equipment Operation', '2026-10-21 07:22:35'),
(54, 11, 'SKILL', 'Temperature Danger Zone Controls', '2026-10-21 07:22:35'),
(55, 11, 'SKILL', 'TESDA Cookery Standards', '2026-10-21 07:22:35'),
(56, 11, 'SKILL', 'Cross-Contamination Prevention', '2026-10-21 07:22:35'),
(57, 11, 'CERTIFICATION', 'TESDA Cookery NC II', '2026-10-21 07:22:35'),
(58, 11, 'CERTIFICATION', 'Food Handler Certificate', '2026-10-21 07:22:35'),
(59, 11, 'CERTIFICATION', 'Culinary Knife Skills And Modern Plating Workshop', '2026-10-21 07:22:35'),
(60, 11, 'CERTIFICATION', 'Culinary Diploma', '2026-10-21 07:22:35'),
(61, 11, 'ORGANIZATION', 'I\'M Hotel Makati', '2026-10-21 07:22:35'),
(62, 11, 'ORGANIZATION', 'Dusit Thani Manila', '2026-10-21 07:22:35'),
(63, 11, 'ORGANIZATION', 'Romulo Café Makati', '2026-10-21 07:22:35'),
(64, 11, 'ORGANIZATION', 'Commis', '2026-10-21 07:22:35'),
(65, 11, 'EMAIL', 'arvin.delrosario.cook@outlook.ph', '2026-10-21 07:22:35'),
(66, 11, 'PHONE', '+63 917 520 8831', '2026-10-21 07:22:35');

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
  KEY `idx_applicant_screening_scores_applicant_id` (`applicant_id`)
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `applicant_screening_scores`
--

INSERT INTO `applicant_screening_scores` (`score_id`, `applicant_id`, `criterion`, `score`, `created_at`) VALUES
(1, 1, 'Skills', 37.00, '2026-10-18 09:06:13'),
(2, 1, 'Work Experience', 28.00, '2026-10-18 09:06:13'),
(3, 1, 'Educational Background', 19.00, '2026-10-18 09:06:13'),
(4, 1, 'Certifications', 9.00, '2026-10-18 09:06:13'),
(5, 2, 'Skills', 28.00, '2026-10-18 09:06:13'),
(6, 2, 'Work Experience', 23.00, '2026-10-18 09:06:13'),
(7, 2, 'Educational Background', 18.00, '2026-10-18 09:06:13'),
(8, 2, 'Certifications', 7.00, '2026-10-18 09:06:13'),
(9, 3, 'Skills', 24.00, '2026-10-18 09:06:13'),
(10, 3, 'Work Experience', 21.00, '2026-10-18 09:06:13'),
(11, 3, 'Educational Background', 14.00, '2026-10-18 09:06:13'),
(12, 3, 'Certifications', 10.00, '2026-10-18 09:06:13'),
(13, 4, 'Skills', 32.00, '2026-10-18 09:06:13'),
(14, 4, 'Work Experience', 25.00, '2026-10-18 09:06:13'),
(15, 4, 'Educational Background', 17.00, '2026-10-18 09:06:13'),
(16, 4, 'Certifications', 10.00, '2026-10-18 09:06:13'),
(17, 5, 'Skills', 36.00, '2026-10-18 09:06:13'),
(18, 5, 'Work Experience', 27.00, '2026-10-18 09:06:13'),
(19, 5, 'Educational Background', 18.00, '2026-10-18 09:06:13'),
(20, 5, 'Certifications', 10.00, '2026-10-18 09:06:13'),
(21, 6, 'Skills', 8.00, '2026-10-18 09:06:13'),
(22, 6, 'Work Experience', 6.00, '2026-10-18 09:06:13'),
(23, 6, 'Educational Background', 6.00, '2026-10-18 09:06:13'),
(24, 6, 'Certifications', 2.00, '2026-10-18 09:06:13'),
(25, 7, 'Skills', 24.00, '2026-10-18 09:06:13'),
(26, 7, 'Work Experience', 18.00, '2026-10-18 09:06:13'),
(27, 7, 'Educational Background', 10.00, '2026-10-18 09:06:13'),
(28, 7, 'Certifications', 6.00, '2026-10-18 09:06:13'),
(29, 8, 'Skills', 26.00, '2026-10-18 09:06:13'),
(30, 8, 'Work Experience', 22.00, '2026-10-18 09:06:13'),
(31, 8, 'Educational Background', 16.00, '2026-10-18 09:06:13'),
(32, 8, 'Certifications', 10.00, '2026-10-18 09:06:13'),
(33, 9, 'Skills', 34.00, '2026-10-18 09:06:13'),
(34, 9, 'Work Experience', 26.00, '2026-10-18 09:06:13'),
(35, 9, 'Educational Background', 18.00, '2026-10-18 09:06:13'),
(36, 9, 'Certifications', 10.00, '2026-10-18 09:06:13'),
(37, 10, 'Skills', 38.00, '2026-10-18 09:06:13'),
(38, 10, 'Work Experience', 28.00, '2026-10-18 09:06:13'),
(39, 10, 'Educational Background', 20.00, '2026-10-18 09:06:13'),
(40, 10, 'Certifications', 10.00, '2026-10-18 09:06:13'),
(41, 11, 'Skills', 32.00, '2026-10-21 07:22:35'),
(42, 11, 'Experience', 30.00, '2026-10-21 07:22:35'),
(43, 11, 'Education', 20.00, '2026-10-21 07:22:35'),
(44, 11, 'Certifications', 10.00, '2026-10-21 07:22:35');

-- --------------------------------------------------------

--
-- Table structure for table `assessment_invites`
--

CREATE TABLE IF NOT EXISTS `assessment_invites` (
  `assessment_invite_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
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
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`assessment_invite_id`),
  UNIQUE KEY `assessment_invites_token_unique` (`token`),
  KEY `idx_assessment_invites_applicant_id` (`applicant_id`),
  KEY `idx_assessment_invites_status` (`status`),
  KEY `fk_assessment_invites_created_by_user_id` (`created_by_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `assessment_tests`
--

CREATE TABLE IF NOT EXISTS `assessment_tests` (
  `assessment_test_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
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
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`assessment_test_id`),
  KEY `idx_assessment_tests_applicant_id` (`applicant_id`),
  KEY `idx_assessment_tests_assessor_user_id` (`assessor_user_id`),
  KEY `idx_assessment_tests_test_date` (`test_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  KEY `idx_attendance_records_employee_id` (`employee_id`),
  KEY `idx_attendance_records_work_date` (`work_date`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `attendance_records`
--

INSERT INTO `attendance_records` (`attendance_id`, `employee_id`, `work_date`, `time_in`, `time_out`, `break_in`, `break_out`, `hours_worked`, `late_minutes`, `undertime_minutes`, `overtime_hours`, `remark`, `status`, `created_at`, `updated_at`) VALUES
(1, 5, '2026-07-21', '2026-07-20 23:50:00', '2026-07-21 08:30:00', '2026-07-21 04:00:00', '2026-07-21 04:58:00', 8.10, 0, 0, 0.00, 'Present', 'Completed', '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(2, 5, '2026-07-22', NULL, NULL, NULL, NULL, 0.00, 0, 0, 0.00, 'Sick Leave', NULL, '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(3, 5, '2026-07-23', '2026-07-22 23:55:00', '2026-07-23 10:40:00', '2026-07-23 04:00:00', '2026-07-23 04:55:00', 10.20, 0, 0, 2.00, 'Overtime 2h', 'Completed', '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(4, 5, '2026-07-24', '2026-07-24 00:07:00', '2026-07-24 09:10:00', '2026-07-24 04:05:00', '2026-07-24 04:58:00', 8.50, 7, 0, 0.00, 'Late 7 mins', 'Completed', '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(5, 5, '2026-07-25', '2026-07-24 23:48:00', '2026-07-25 08:32:00', '2026-07-25 04:00:00', '2026-07-25 04:58:00', 8.20, 0, 0, 0.00, 'Present', 'Completed', '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(6, 6, '2026-07-24', '2026-07-24 01:58:00', '2026-07-24 10:02:00', '2026-07-24 04:00:00', '2026-07-24 04:45:00', 8.10, 0, 0, 0.00, 'Present', 'Completed', '2026-10-18 09:06:13', '2026-10-18 09:06:13'),
(7, 6, '2026-07-25', '2026-07-25 01:55:00', '2026-07-25 10:05:00', '2026-07-25 04:02:00', '2026-07-25 04:50:00', 8.20, 0, 0, 0.00, 'Present', 'Completed', '2026-10-18 09:06:13', '2026-10-18 09:06:13');

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
  KEY `idx_audit_logs_system_user_id` (`system_user_id`),
  KEY `idx_audit_logs_occurred_at` (`occurred_at`),
  KEY `idx_audit_logs_module_name` (`module_name`),
  KEY `idx_audit_logs_severity` (`severity`)
) ENGINE=InnoDB AUTO_INCREMENT=127 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
(40, 4, 'Employee', 'Kitchen / Culinary', '2026-10-18 01:07:44', 'OTP sent', 'Authentication', 'user', 'kdelacruz', 'One-time password emailed to k************@oxfordsuites.com.ph', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/login'),
(41, 4, 'Employee', 'Kitchen / Culinary', '2026-10-18 01:08:02', 'User logged in', 'Authentication', 'user', 'kdelacruz', 'Two-factor login completed.', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/otp'),
(42, 4, 'Employee', 'Kitchen / Culinary', '2026-10-18 01:08:24', 'System user updated', 'User Management', 'user', '4', 'Changed: otp_enabled', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/employee/settings'),
(48, 4, 'Employee', 'Kitchen / Culinary', '2026-10-18 01:33:44', 'LMS Reading Completed', 'Learning Management', 'EmployeeLearning', '1', 'Kevin D. Dela Cruz finished reading LMS-101 - Food Safety & Sanitation Level 2', 'Info', '127.0.0.1', 'Firefox', CONCAT('http://localhost:5173/employee/ess',CHAR(63),'category=Performance')),
(49, 4, 'Employee', 'Kitchen / Culinary', '2026-10-18 01:47:36', 'LMS Reading Completed', 'Learning Management', 'EmployeeLearning', '3', 'Kevin D. Dela Cruz finished reading LMS-103 - Fire Safety & Emergency Response', 'Info', '127.0.0.1', 'Unknown', 'http://127.0.0.1:8000/api/v1/ess/my-learning/LMS-103/reading-complete'),
(50, 4, 'Employee', 'Kitchen / Culinary', '2026-10-18 01:47:40', 'LMS Quiz Submitted', 'Learning Management', 'EmployeeLearning', '3', 'Kevin D. Dela Cruz scored 100% on LMS-103 (pass)', 'Info', '127.0.0.1', 'Unknown', 'http://127.0.0.1:8000/api/v1/ess/my-learning/LMS-103/quiz'),
(51, 4, 'Employee', 'Kitchen / Culinary', '2026-10-18 02:05:28', 'User logged out', 'Authentication', 'user', 'kdelacruz', 'Session token revoked.', 'Info', '127.0.0.1', 'Firefox', CONCAT('http://localhost:5173/employee/ess',CHAR(63),'category=Performance')),
(52, 4, 'Employee', 'Kitchen / Culinary', '2026-10-18 02:16:27', 'User logged in', 'Authentication', 'user', 'kdelacruz', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/login'),
(53, 4, 'Employee', 'Kitchen / Culinary', '2026-10-18 02:18:08', 'LMS Reading Completed', 'Learning Management', 'EmployeeLearning', '3', 'Kevin D. Dela Cruz finished reading LMS-103 - Fire Safety & Emergency Response', 'Info', '127.0.0.1', 'Firefox', CONCAT('http://localhost:5173/employee/ess',CHAR(63),'category=Performance')),
(54, 4, 'Employee', 'Kitchen / Culinary', '2026-10-18 03:19:45', 'User logged out', 'Authentication', 'user', 'kdelacruz', 'Session token revoked.', 'Info', '127.0.0.1', 'Firefox', CONCAT('http://localhost:5173/employee/ess',CHAR(63),'category=Performance')),
(55, 4, 'Employee', 'Kitchen / Culinary', '2026-10-18 03:33:52', 'User logged in', 'Authentication', 'user', 'kdelacruz', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/login'),
(56, 4, 'Employee', 'Kitchen / Culinary', '2026-10-18 03:35:26', 'LMS Reading Completed', 'Learning Management', 'EmployeeLearning', '3', 'Kevin D. Dela Cruz finished reading LMS-103 - Fire Safety & Emergency Response', 'Info', '127.0.0.1', 'Firefox', CONCAT('http://localhost:5173/employee/ess',CHAR(63),'category=Performance')),
(57, 4, 'Employee', 'Kitchen / Culinary', '2026-10-18 03:36:54', 'LMS Reading Completed', 'Learning Management', 'EmployeeLearning', '3', 'Kevin D. Dela Cruz finished reading LMS-103 - Fire Safety & Emergency Response', 'Info', '127.0.0.1', 'Firefox', CONCAT('http://localhost:5173/employee/ess',CHAR(63),'category=Performance')),
(58, 4, 'Employee', 'Kitchen / Culinary', '2026-10-18 03:37:20', 'LMS Reading Completed', 'Learning Management', 'EmployeeLearning', '3', 'Kevin D. Dela Cruz finished reading LMS-103 - Fire Safety & Emergency Response', 'Info', '127.0.0.1', 'Firefox', CONCAT('http://localhost:5173/employee/ess',CHAR(63),'category=Performance')),
(59, 4, 'Employee', 'Kitchen / Culinary', '2026-10-18 03:38:00', 'LMS Quiz Submitted', 'Learning Management', 'EmployeeLearning', '3', 'Kevin D. Dela Cruz scored 60% on LMS-103 (fail)', 'Info', '127.0.0.1', 'Firefox', CONCAT('http://localhost:5173/employee/ess',CHAR(63),'category=Performance')),
(60, 4, 'Employee', 'Kitchen / Culinary', '2026-10-18 03:49:24', 'User logged out', 'Authentication', 'user', 'kdelacruz', 'Session token revoked.', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/employee/onboarding'),
(61, 3, 'Admin', 'Front Office', '2026-10-18 03:49:31', 'OTP sent', 'Authentication', 'user', 'aramos', 'One-time password emailed to a*******@oxfordsuites.com.ph', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/login'),
(62, 3, 'Admin', 'Front Office', '2026-10-18 03:49:43', 'User logged in', 'Authentication', 'user', 'aramos', 'Two-factor login completed.', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/otp'),
(63, 3, 'Admin', 'Front Office', '2026-10-18 03:50:42', 'User logged out', 'Authentication', 'user', 'aramos', 'Session token revoked.', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/admin/applicants'),
(64, 4, 'Employee', 'Kitchen / Culinary', '2026-10-18 03:50:46', 'User logged in', 'Authentication', 'user', 'kdelacruz', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/login'),
(65, 4, 'Employee', 'Kitchen / Culinary', '2026-10-18 21:50:39', 'User logged in', 'Authentication', 'user', 'kdelacruz', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/login'),
(66, 4, 'Employee', 'Kitchen / Culinary', '2026-10-18 22:24:19', 'User logged out', 'Authentication', 'user', 'kdelacruz', 'Session token revoked.', 'Info', '127.0.0.1', 'Firefox', CONCAT('http://localhost:5173/employee/ess',CHAR(63),'category=Performance')),
(67, 3, 'Admin', 'Front Office', '2026-10-19 00:36:03', 'OTP sent', 'Authentication', 'user', 'aramos', 'One-time password emailed to a*******@oxfordsuites.com.ph', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/login'),
(68, 3, 'Admin', 'Front Office', '2026-10-19 00:36:22', 'User logged in', 'Authentication', 'user', 'aramos', 'Two-factor login completed.', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/otp'),
(69, 3, 'Admin', 'Front Office', '2026-10-19 00:37:49', 'User logged out', 'Authentication', 'user', 'aramos', 'Session token revoked.', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/admin/org-chart'),
(70, 1, 'Super Admin', 'Administration / HR', '2026-10-19 00:37:57', 'OTP sent', 'Authentication', 'user', 'bullseur', 'One-time password emailed to b******@oxfordsuites.com.ph', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/login'),
(71, 1, 'Super Admin', 'Administration / HR', '2026-10-19 00:38:04', 'User logged in', 'Authentication', 'user', 'bullseur', 'Two-factor login completed.', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/otp'),
(72, 1, 'Super Admin', 'Administration / HR', '2026-10-19 00:38:11', 'System user updated', 'User Management', 'user', '1', 'Changed: otp_enabled', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/superadmin/settings'),
(73, 1, 'Super Admin', 'Administration / HR', '2026-10-19 00:39:34', 'User logged out', 'Authentication', 'user', 'bullseur', 'Session token revoked.', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/superadmin/dept-pos'),
(74, 4, 'Employee', 'Kitchen / Culinary', '2026-10-19 00:39:39', 'User logged in', 'Authentication', 'user', 'kdelacruz', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/login'),
(75, 4, 'Employee', 'Kitchen / Culinary', '2026-10-19 01:37:00', 'User logged out', 'Authentication', 'user', 'kdelacruz', 'Session token revoked.', 'Info', '127.0.0.1', 'Firefox', CONCAT('http://localhost:5173/employee/ess',CHAR(63),'category=Promotion')),
(76, 4, 'Employee', 'Kitchen / Culinary', '2026-10-19 06:56:21', 'User logged in', 'Authentication', 'user', 'kdelacruz', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/login'),
(77, 4, 'Employee', 'Kitchen / Culinary', '2026-10-19 06:57:22', 'LMS Reading Completed', 'Learning Management', 'EmployeeLearning', '3', 'Kevin D. Dela Cruz finished reading LMS-103 - Fire Safety & Emergency Response', 'Info', '127.0.0.1', 'Firefox', CONCAT('http://localhost:5173/employee/ess',CHAR(63),'category=Promotion')),
(78, 4, 'Employee', 'Kitchen / Culinary', '2026-10-19 06:58:43', 'LMS Reading Completed', 'Learning Management', 'EmployeeLearning', '3', 'Kevin D. Dela Cruz finished reading LMS-103 - Fire Safety & Emergency Response', 'Info', '127.0.0.1', 'Firefox', CONCAT('http://localhost:5173/employee/ess',CHAR(63),'category=Promotion')),
(79, 4, 'Employee', 'Kitchen / Culinary', '2026-10-19 07:17:23', 'User logged in', 'Authentication', 'user', 'kdelacruz', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/login'),
(80, 4, 'Employee', 'Kitchen / Culinary', '2026-10-19 07:19:33', 'LMS Reading Completed', 'Learning Management', 'EmployeeLearning', '3', 'Kevin D. Dela Cruz finished reading LMS-103 - Fire Safety & Emergency Response', 'Info', '127.0.0.1', 'Firefox', CONCAT('http://localhost:5173/employee/ess',CHAR(63),'category=Promotion')),
(81, 4, 'Employee', 'Kitchen / Culinary', '2026-10-19 07:20:10', 'LMS Quiz Submitted', 'Learning Management', 'EmployeeLearning', '3', 'Kevin D. Dela Cruz scored 20% on LMS-103 (fail)', 'Info', '127.0.0.1', 'Firefox', CONCAT('http://localhost:5173/employee/ess',CHAR(63),'category=Promotion')),
(82, 4, 'Employee', 'Kitchen / Culinary', '2026-10-19 07:50:55', 'User logged out', 'Authentication', 'user', 'kdelacruz', 'Session token revoked.', 'Info', '127.0.0.1', 'Firefox', CONCAT('http://localhost:5173/employee/ess',CHAR(63),'category=Documents')),
(83, 1, 'Super Admin', 'Administration / HR', '2026-10-19 22:41:35', 'User logged in', 'Authentication', 'user', 'bullseur', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/login'),
(84, 4, 'Employee', 'Kitchen / Culinary', '2026-10-20 06:34:41', 'User logged in', 'Authentication', 'user', 'kdelacruz', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/login'),
(85, 4, 'Employee', 'Kitchen / Culinary', '2026-10-20 08:28:18', 'ESS Request Submitted', 'Employee Self-Service', 'EssRequest', '8', 'Employee Kevin D. Dela Cruz filed Salary Loan Application (REQ-4411)', 'Info', '127.0.0.1', 'Firefox', CONCAT('http://localhost:5173/employee/ess',CHAR(63),'category=Payroll')),
(86, 4, 'Employee', 'Kitchen / Culinary', '2026-10-20 09:35:34', 'User logged out', 'Authentication', 'user', 'kdelacruz', 'Session token revoked.', 'Info', '127.0.0.1', 'Firefox', CONCAT('http://localhost:5173/employee/ess',CHAR(63),'category=Documents')),
(87, 4, 'Employee', 'Kitchen / Culinary', '2026-10-20 09:53:25', 'User logged in', 'Authentication', 'user', 'kdelacruz', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/login'),
(88, 4, 'Employee', 'Kitchen / Culinary', '2026-10-20 10:46:53', 'User logged out', 'Authentication', 'user', 'kdelacruz', 'Session token revoked.', 'Info', '127.0.0.1', 'Firefox', CONCAT('http://localhost:5173/employee/ess',CHAR(63),'category=Payroll')),
(89, 4, 'Employee', 'Kitchen / Culinary', '2026-10-20 10:47:10', 'User logged in', 'Authentication', 'user', 'kdelacruz', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/login'),
(90, 4, 'Employee', 'Kitchen / Culinary', '2026-10-20 13:04:27', 'User logged out', 'Authentication', 'user', 'kdelacruz', 'Session token revoked.', 'Info', '127.0.0.1', 'Firefox', CONCAT('http://localhost:5173/employee/ess',CHAR(63),'category=Payroll')),
(91, 4, 'Employee', 'Kitchen / Culinary', '2026-10-20 19:13:25', 'User logged in', 'Authentication', 'user', 'kdelacruz', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/login'),
(92, 4, 'Employee', 'Kitchen / Culinary', '2026-10-20 19:39:25', 'User logged in', 'Authentication', 'user', 'kdelacruz', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/login'),
(93, 4, 'Employee', 'Kitchen / Culinary', '2026-10-20 20:16:58', 'User logged in', 'Authentication', 'user', 'kdelacruz', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/login'),
(94, 1, 'Super Admin', 'Administration / HR', '2026-10-20 21:10:02', 'User logged in', 'Authentication', 'user', 'bullseur', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/login'),
(95, 1, 'Super Admin', 'Administration / HR', '2026-10-20 21:23:52', 'User logged out', 'Authentication', 'user', 'bullseur', 'Session token revoked.', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/superadmin/org-chart'),
(96, 3, 'Admin', 'Front Office', '2026-10-20 22:12:41', 'OTP sent', 'Authentication', 'user', 'aramos', 'One-time password emailed to a*******@oxfordsuites.com.ph', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/login'),
(97, 3, 'Admin', 'Front Office', '2026-10-20 22:12:53', 'User logged in', 'Authentication', 'user', 'aramos', 'Two-factor login completed.', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/otp'),
(98, 3, 'Admin', 'Front Office', '2026-10-20 22:13:25', 'User logged out', 'Authentication', 'user', 'aramos', 'Session token revoked.', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/admin/employees'),
(99, 1, 'Super Admin', 'Administration / HR', '2026-10-20 22:13:30', 'User logged in', 'Authentication', 'user', 'bullseur', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/login'),
(100, 1, 'Super Admin', 'Administration / HR', '2026-10-20 22:14:00', 'User logged out', 'Authentication', 'user', 'bullseur', 'Session token revoked.', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/superadmin/users'),
(101, 4, 'Employee', 'Kitchen / Culinary', '2026-10-20 22:14:15', 'User logged in', 'Authentication', 'user', 'kdelacruz', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/login'),
(102, 4, 'Employee', 'Kitchen / Culinary', '2026-10-20 22:21:31', 'User logged out', 'Authentication', 'user', 'kdelacruz', 'Session token revoked.', 'Info', '127.0.0.1', 'Firefox', CONCAT('http://localhost:5173/employee/ess',CHAR(63),'category=Attendance')),
(103, 1, 'Super Admin', 'Administration / HR', '2026-10-20 22:21:50', 'User logged in', 'Authentication', 'user', 'bullseur', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/login'),
(104, 1, 'Super Admin', 'Administration / HR', '2026-10-20 22:33:57', 'User logged out', 'Authentication', 'user', 'bullseur', 'Session token revoked.', 'Info', '127.0.0.1', 'Firefox', CONCAT('http://localhost:5173/employee/ess',CHAR(63),'category=Promotion')),
(105, 3, 'Admin', 'Front Office', '2026-10-20 23:08:24', 'OTP sent', 'Authentication', 'user', 'aramos', 'One-time password emailed to a*******@oxfordsuites.com.ph', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/login'),
(106, 1, 'Super Admin', 'Administration / HR', '2026-10-20 23:08:38', 'User logged in', 'Authentication', 'user', 'bullseur', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/login'),
(107, 1, 'Super Admin', 'Administration / HR', '2026-10-20 23:16:10', 'Applicant Stage Changed to Accepted', 'Applicant Management', 'Applicant', '7', 'Stage changed from Screened to Accepted for Princess Mabangis (Housekeeping Attendant).', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/superadmin/applicants'),
(108, 1, 'Super Admin', 'Administration / HR', '2026-10-20 23:16:22', 'Interview Booked', 'Applicant Management', 'Interview', '6', 'Scheduled interview for Princess Mabangis on 2026-10-21 00:00:00 at 08:00 (On-site).', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/superadmin/applicants'),
(109, 1, 'Super Admin', 'Administration / HR', '2026-10-20 23:16:33', 'Facility Request Approved', 'Applicant Management', 'Interview', '6', 'Facility request approved — Room 1 for Princess Mabangis\'s interview on 2026-10-21 00:00:00 at 08:00:00. Confirmation email sent to princess.mabangis@email.', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/superadmin/applicants'),
(110, 1, 'Super Admin', 'Administration / HR', '2026-10-20 23:16:43', 'Applicant Stage Changed to Accepted', 'Applicant Management', 'Applicant', '8', 'Stage changed from Screened to Accepted for Kanor Ornak (Front Desk Receptionist).', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/superadmin/applicants'),
(111, 1, 'Super Admin', 'Administration / HR', '2026-10-20 23:17:22', 'Interview Booked', 'Applicant Management', 'Interview', '7', 'Scheduled interview for Kanor Ornak on 2026-10-21 00:00:00 at 15:00:00 (Virtual).', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/superadmin/applicants'),
(112, 1, 'Super Admin', 'Administration / HR', '2026-10-20 23:17:59', 'Interview Updated / Rescheduled', 'Applicant Management', 'Interview', '6', 'Updated interview for Princess Mabangis on 2026-10-21 00:00:00 at 15:00:00 (Scheduled).', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/superadmin/applicants'),
(113, 1, 'Super Admin', 'Administration / HR', '2026-10-20 23:19:32', 'Job Draft Generated', 'Recruitment Management', 'Job Post Draft', 'Line Cook', 'AI draft generated for \'Line Cook\' (8 vocab skills matched, 0 new) via Google Gemini.', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/superadmin/recruitment'),
(114, 1, 'Super Admin', 'Administration / HR', '2026-10-20 23:19:52', 'Job Post Updated', 'Recruitment Management', 'Job Post', '2', 'Updated job post \'Line Cook\' (status: Open).', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/superadmin/recruitment'),
(115, 1, 'Super Admin', 'Administration / HR', '2026-10-20 23:21:37', 'User logged out', 'Authentication', 'user', 'bullseur', 'Session token revoked.', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/superadmin/recruitment'),
(116, NULL, 'System', 'System', '2026-10-20 23:22:35', 'Verification Document Checked', 'Applicant Management', 'Applicant Document', '1', 'Supporting-document verification for Arvin_Keith_Del_Rosario_COE_Current_Employer.pdf (COE): VERIFIED.', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/jobs/2'),
(117, NULL, 'System', 'System', '2026-10-20 23:22:36', 'Verification Document Checked', 'Applicant Management', 'Applicant Document', '2', 'Supporting-document verification for Arvin_Keith_Del_Rosario_COE_Previous_Employer.pdf (COE): DISCREPANCY_FOUND.', 'Warning', '127.0.0.1', 'Firefox', 'http://localhost:5173/jobs/2'),
(118, NULL, 'System', 'System', '2026-10-20 23:22:36', 'Verification Document Checked', 'Applicant Management', 'Applicant Document', '3', 'Supporting-document verification for Arvin_Keith_Del_Rosario_Diploma.pdf (Credential): VERIFIED.', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/jobs/2'),
(119, NULL, 'System', 'System', '2026-10-20 23:22:36', 'Verification Document Checked', 'Applicant Management', 'Applicant Document', '4', 'Supporting-document verification for Arvin_Keith_Del_Rosario_Incomplete_Certificate.pdf (Others): UNABLE_TO_VERIFY.', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/jobs/2'),
(120, NULL, 'System', 'System', '2026-10-20 23:22:36', 'Verification Document Checked', 'Applicant Management', 'Applicant Document', '5', 'Supporting-document verification for Arvin_Keith_Del_Rosario_Resume.jpg (Others): UNABLE_TO_VERIFY.', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/jobs/2'),
(121, NULL, 'System', 'System', '2026-10-20 23:22:36', 'Verification Document Checked', 'Applicant Management', 'Applicant Document', '6', 'Supporting-document verification for Arvin_Keith_Del_Rosario_Resume.pdf (Others): UNABLE_TO_VERIFY.', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/jobs/2'),
(122, NULL, 'System', 'System', '2026-10-20 23:22:36', 'Verification Document Checked', 'Applicant Management', 'Applicant Document', '7', 'Supporting-document verification for Arvin_Keith_Del_Rosario_Resume.png (Others): UNABLE_TO_VERIFY.', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/jobs/2'),
(123, NULL, 'System', 'System', '2026-10-20 23:22:36', 'Verification Document Checked', 'Applicant Management', 'Applicant Document', '8', 'Supporting-document verification for Arvin_Keith_Del_Rosario_Resume_Blurred.jpg (Others): UNABLE_TO_VERIFY.', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/jobs/2'),
(124, NULL, 'System', 'System', '2026-10-20 23:22:36', 'Verification Document Checked', 'Applicant Management', 'Applicant Document', '9', 'Supporting-document verification for Arvin_Keith_Del_Rosario_Resume_Blurred.png (Others): UNABLE_TO_VERIFY.', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/jobs/2'),
(125, NULL, 'System', 'System', '2026-10-20 23:22:36', 'Verification Document Checked', 'Applicant Management', 'Applicant Document', '10', 'Supporting-document verification for Arvin_Keith_Del_Rosario_Training_Certificate_FoodSafety.pdf (Certificate): VERIFIED.', 'Info', '127.0.0.1', 'Firefox', 'http://localhost:5173/jobs/2'),
(126, NULL, 'System', 'System', '2026-10-20 23:22:37', 'Verification Document Checked', 'Applicant Management', 'Applicant Document', '11', 'Supporting-document verification for Arvin_Keith_Del_Rosario_Training_Certificate_Service.pdf (Certificate): DISCREPANCY_FOUND.', 'Warning', '127.0.0.1', 'Firefox', 'http://localhost:5173/jobs/2');

-- --------------------------------------------------------

COMMIT;


/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
