-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 20, 2026 at 11:42 AM
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
) ;

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
  `summary` text DEFAULT NULL,
  `flags_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`flags_json`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
(24, 'APL-01049', 1, 'f1', 'f1@gmail.com', '0912312300', '2026-08-18 18:47:16', 80.00, 'fit', 'Accepted', 'Online Portal', 'resumes/ymPioYX9roI8L6MTY8KwTegjgXJDZmKuDTchTc3C.pdf', 'Added via document screening — ulit.pdf.', '[]', '2026-08-18 10:47:16', '2026-08-18 11:29:42');

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
  `total_score` decimal(5,2) DEFAULT NULL,
  `outcome` varchar(20) NOT NULL,
  `remarks` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
-- Table structure for table `applicant_screening_entities`
--

CREATE TABLE `applicant_screening_entities` (
  `entity_id` bigint(20) UNSIGNED NOT NULL,
  `applicant_id` bigint(20) UNSIGNED NOT NULL,
  `label` varchar(80) NOT NULL,
  `value` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
(32, 10, 'CERT', 'TESDA Front Office NC II', '2026-08-17 00:31:34');

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
(40, 10, 'Certifications', 10.00, '2026-08-17 00:31:34');

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `device_info` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `audit_logs`
--

INSERT INTO `audit_logs` (`audit_log_id`, `system_user_id`, `actor_role`, `actor_department`, `occurred_at`, `action`, `module_name`, `target_type`, `target_id`, `details`, `severity`, `ip_address`, `device_info`) VALUES
(1, 1, 'Super Admin', 'Administration / HR', '2026-07-25 16:14:00', 'Updated permission matrix for role Admin', 'User Management', 'role', 'Admin', 'Set ESS Management to Approve / Reject Only.', 'Critical', '192.168.10.4', 'Chrome on Windows'),
(2, 2, 'Admin', 'Administration / HR', '2026-07-25 16:02:00', 'Approved leave request LR-2231', 'ESS Management', 'ess_request', 'LR-2231', 'Sick leave approved for 1 day.', 'Info', '192.168.10.22', 'Edge on Windows'),
(3, 3, 'Admin', 'Front Office', '2026-07-25 07:20:00', 'Scheduled interview for APP-1041', 'Applicant Management', 'applicant', 'APP-1041', 'On-site interview booked for 2026-07-28, 09:00 AM.', 'Info', '192.168.10.31', 'Safari on macOS'),
(4, NULL, 'System', 'System', '2026-07-25 06:58:00', 'Resume screening batch completed (14 resumes, NER model v2.3)', 'Applicant Management', 'system', 'batch', 'NER screening pipeline finished.', 'Info', '127.0.0.1', 'Server process'),
(5, 5, 'Employee', 'Food & Beverage', '2026-07-25 04:41:00', 'Failed login attempt (3rd) — account suspended', 'Authentication', 'user', 'USR-005', 'Account auto-suspended after repeated failures.', 'Warning', '10.0.4.101', 'Chrome on Android'),
(6, 1, 'Super Admin', 'Administration / HR', '2026-07-25 01:09:00', 'Deleted job position POS-011 (Seasonal Banquet Server)', 'Core HCM', 'position', 'POS-011', 'Position removed from master.', 'Critical', '192.168.10.4', 'Chrome on Windows'),
(7, 2, 'Admin', 'Administration / HR', '2026-07-24 19:22:00', 'Published job post \'Line Cook\' to Indeed and Facebook', 'Recruitment Management', 'job_post', 'line-cook', 'Publishing platforms updated.', 'Info', '192.168.10.22', 'Edge on Windows'),
(8, 1, 'Super Admin', 'Administration / HR', '2026-07-24 17:15:00', 'Modified password policy to require strong credentials', 'User Management', 'setting', 'password_policy', 'Policy requires 8+ chars, uppercase, number, symbol.', 'Warning', '192.168.10.4', 'Chrome on Windows'),
(9, 3, 'Admin', 'Front Office', '2026-07-24 00:45:00', 'Created new employee record for Camille Ortega', 'Core HCM', 'employee', 'EMP-0004', 'Probationary Guest Relations Officer record created.', 'Info', '192.168.10.31', 'Safari on macOS'),
(10, 2, 'Admin', 'Administration / HR', '2026-07-23 22:10:00', 'Exported monthly HR headcount report to PDF', 'Employee Records', 'report', 'headcount', 'Monthly report exported.', 'Info', '192.168.10.22', 'Edge on Windows'),
(11, 4, 'Employee', 'Kitchen / Culinary', '2026-07-23 18:05:00', 'Submitted shift swap request with Marco Santos', 'ESS Management', 'ess_request', 'SHIFT-SWAP-001', 'Shift swap between kitchen crew.', 'Info', '10.0.4.88', 'Chrome on Android'),
(12, 1, 'Super Admin', 'Administration / HR', '2026-07-23 02:30:00', 'Revoked active session for user mdevera', 'User Management', 'user', 'USR-005', 'All sessions terminated.', 'Critical', '192.168.10.4', 'Chrome on Windows'),
(13, 3, 'Admin', 'Housekeeping', '2026-07-22 23:12:00', 'Updated room attendant onboarding checklist', 'New Hire Onboarding', 'template', 'TPL-002', 'Checklist items adjusted.', 'Info', '192.168.10.31', 'Safari on macOS'),
(14, 2, 'Admin', 'Administration / HR', '2026-07-22 19:00:00', 'Approved overtime request for Front Office team', 'ESS Management', 'ess_request', 'OT-FO-001', 'Overtime for peak season approved.', 'Info', '192.168.10.22', 'Edge on Windows'),
(15, 2, 'Admin', 'Administration / HR', '2026-07-19 17:12:00', 'Applicant Added', 'Screening', 'applicant', 'APP-1032', 'Added via document screening — camille_resume.pdf, scored 93%.', 'Info', '192.168.10.22', 'Edge on Windows'),
(16, 3, 'Admin', 'Front Office', '2026-07-20 18:40:00', 'Interview Booked', 'Interview Scheduling', 'applicant', 'APP-1032', 'On-site interview booked for 2026-07-22, 09:00 AM.', 'Info', '192.168.10.31', 'Safari on macOS'),
(17, 3, 'Admin', 'Front Office', '2026-07-21 17:05:00', 'Interview Completed', 'Interview Scheduling', 'applicant', 'APP-1032', 'Interview marked complete, strong guest-facing presence noted.', 'Info', '192.168.10.31', 'Safari on macOS'),
(18, 2, 'Admin', 'Administration / HR', '2026-07-22 22:15:00', 'Assessment Started', 'Assessment', 'applicant', 'APP-1032', 'Practical front desk simulation started.', 'Info', '192.168.10.22', 'Edge on Windows'),
(19, 2, 'Admin', 'Administration / HR', '2026-07-22 23:40:00', 'Assessment Accepted', 'Assessment', 'applicant', 'APP-1032', 'Assessment score 94% — advanced to job offer.', 'Info', '192.168.10.22', 'Edge on Windows'),
(20, NULL, 'F&B Director', 'Food & Beverage', '2026-07-23 19:00:00', 'Interview Booked', 'Interview Scheduling', 'applicant', 'APP-1035', 'On-site interview booked for 2026-07-29, 04:00 PM.', 'Info', '192.168.10.2', 'Chrome on Windows'),
(21, NULL, 'F&B Director', 'Food & Beverage', '2026-07-23 21:20:00', 'Interview Booked', 'Interview Scheduling', 'applicant', 'APP-1036', 'On-site interview booked for 2026-07-30, 10:00 AM.', 'Info', '192.168.10.2', 'Chrome on Windows'),
(22, 2, 'Admin', 'Administration / HR', '2026-07-24 01:05:00', 'Status Change', 'Screening', 'applicant', 'APP-1034', 'Stage moved to Screened after resume re-check.', 'Info', '192.168.10.22', 'Edge on Windows'),
(23, NULL, 'Executive Housekeeper', 'Housekeeping', '2026-07-24 01:30:00', 'Applicant Transferred', 'Screening', 'applicant', 'APP-1034', 'Flagged as stronger match for Facilities Maintenance.', 'Info', '192.168.10.3', 'Chrome on Windows'),
(24, 2, 'Admin', 'Administration / HR', '2026-07-24 16:50:00', 'Applicant Rejected', 'Screening', 'applicant', 'APP-1037', 'No culinary certification or kitchen experience detected.', 'Info', '192.168.10.22', 'Edge on Windows'),
(25, 2, 'Admin', 'Administration / HR', '2026-07-24 17:35:00', 'Applicant Added', 'Screening', 'applicant', 'APP-1038', 'Added via image (OCR) screening — walk-in resume scan.', 'Info', '192.168.10.22', 'Edge on Windows'),
(26, 2, 'Admin', 'Administration / HR', '2026-07-24 18:15:00', 'Applicant Added', 'Screening', 'applicant', 'APP-1039', 'Added via document screening from Indeed source.', 'Info', '192.168.10.22', 'Edge on Windows'),
(27, 3, 'Admin', 'Front Office', '2026-07-24 19:02:00', 'Applicant Transferred', 'Screening', 'applicant', 'APP-1039', 'Suggested stronger match: Restaurant Server (86%).', 'Info', '192.168.10.31', 'Safari on macOS'),
(28, 2, 'Admin', 'Administration / HR', '2026-07-24 21:48:00', 'Applicant Added', 'Screening', 'applicant', 'APP-1040', 'Added via document screening — referral source.', 'Info', '192.168.10.22', 'Edge on Windows'),
(29, 2, 'Admin', 'Administration / HR', '2026-07-25 00:30:00', 'Applicant Added', 'Screening', 'applicant', 'APP-1041', 'Added via document screening — online portal, scored 96%.', 'Info', '192.168.10.22', 'Edge on Windows'),
(30, 3, 'Admin', 'Front Office', '2026-07-25 17:00:00', 'Interview Booked', 'Interview Scheduling', 'applicant', 'APP-1041', 'On-site interview booked for 2026-07-28, 09:00 AM.', 'Info', '192.168.10.31', 'Safari on macOS'),
(31, 2, 'Admin', 'Administration / HR', '2026-07-25 17:20:00', 'Interview Booked', 'Interview Scheduling', 'applicant', 'APP-1033', 'Virtual interview booked for 2026-07-28, 01:30 PM.', 'Info', '192.168.10.22', 'Edge on Windows'),
(32, NULL, 'F&B Director', 'Food & Beverage', '2026-07-25 18:10:00', 'Interview Completed', 'Interview Scheduling', 'applicant', 'APP-1036', 'Cook test completed, solid knife skills and station timing.', 'Info', '192.168.10.2', 'Chrome on Windows'),
(33, 2, 'Admin', 'Administration / HR', '2026-07-25 18:45:00', 'Assessment Started', 'Assessment', 'applicant', 'APP-1036', 'Practical cook test assessment started.', 'Info', '192.168.10.22', 'Edge on Windows'),
(34, 2, 'Admin', 'Administration / HR', '2026-07-25 19:30:00', 'Assessment Accepted', 'Assessment', 'applicant', 'APP-1036', 'Assessment score 82% — advanced to job offer.', 'Info', '192.168.10.22', 'Edge on Windows'),
(35, NULL, 'F&B Director', 'Food & Beverage', '2026-07-26 22:00:00', 'Assessment Started', 'Assessment', 'applicant', 'APP-1035', 'Mixology practical assessment started.', 'Info', '192.168.10.2', 'Chrome on Windows'),
(36, NULL, 'F&B Director', 'Food & Beverage', '2026-07-26 23:10:00', 'Assessment Accepted', 'Assessment', 'applicant', 'APP-1035', 'Assessment score 88% — advanced to job offer.', 'Info', '192.168.10.2', 'Chrome on Windows'),
(37, 3, 'Admin', 'Front Office', '2026-07-27 17:05:00', 'Interview Completed', 'Interview Scheduling', 'applicant', 'APP-1041', 'Front office simulation completed successfully.', 'Info', '192.168.10.31', 'Safari on macOS'),
(38, 2, 'Admin', 'Administration / HR', '2026-07-27 21:45:00', 'Interview No-Show', 'Interview Scheduling', 'applicant', 'APP-1033', 'Candidate did not join the virtual meeting room.', 'Warning', '192.168.10.22', 'Edge on Windows'),
(39, NULL, 'F&B Director', 'Food & Beverage', '2026-07-29 00:30:00', 'Interview Cancelled', 'Interview Scheduling', 'applicant', 'APP-1035', 'Follow-up panel interview cancelled — role already filled.', 'Info', '192.168.10.2', 'Chrome on Windows');

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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

CREATE TABLE `departments` (
  `department_id` bigint(20) UNSIGNED NOT NULL,
  `code` varchar(30) NOT NULL,
  `name` varchar(120) NOT NULL,
  `description` text DEFAULT NULL,
  `head_employee_id` bigint(20) UNSIGNED DEFAULT NULL,
  `budget` decimal(14,2) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
) ;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
) ;

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
(1, 5, 1, 'Completed', 95.00, '2026-05-10', '2026-07-10', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(2, 5, 2, 'Completed', 88.00, '2026-05-10', '2026-06-24', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(3, 5, 3, 'In Progress', NULL, '2026-07-15', NULL, '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(4, 6, 2, 'Completed', 90.00, '2026-04-01', '2026-06-30', '2026-08-17 17:41:34', '2026-08-17 17:41:34');

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
  `done` tinyint(1) NOT NULL DEFAULT 0,
  `completed_at` timestamp NULL DEFAULT NULL,
  `completed_by_user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `employee_onboarding_items`
--

INSERT INTO `employee_onboarding_items` (`employee_onboarding_item_id`, `employee_id`, `new_hire_id`, `template_item_id`, `item_text`, `done`, `completed_at`, `completed_by_user_id`, `created_at`, `updated_at`) VALUES
(1, 4, 1, NULL, 'Signed employment contract', 1, '2026-07-31 18:00:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(2, 4, 1, NULL, 'NBI / Police clearance', 1, '2026-07-31 18:05:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(3, 4, 1, NULL, 'Pre-employment medical exam', 0, NULL, NULL, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(4, 4, 1, NULL, 'SSS / PhilHealth / Pag-IBIG / TIN', 0, NULL, NULL, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(5, 4, 1, NULL, 'Birth certificate (PSA)', 0, NULL, NULL, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(6, 4, 1, NULL, 'Company orientation attended', 0, NULL, NULL, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(7, 4, 1, NULL, 'Uniform & ID issued', 0, NULL, NULL, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(8, 4, 1, NULL, 'Department on-the-job training', 0, NULL, NULL, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(9, 13, 2, NULL, 'Signed employment contract', 1, '2026-07-31 18:10:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(10, 13, 2, NULL, 'NBI / Police clearance', 1, '2026-07-31 18:12:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(11, 13, 2, NULL, 'Pre-employment medical exam', 1, '2026-08-01 17:00:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(12, 13, 2, NULL, 'SSS / PhilHealth / Pag-IBIG / TIN', 1, '2026-08-01 17:30:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(13, 13, 2, NULL, 'Birth certificate (PSA)', 1, '2026-08-01 18:00:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(14, 13, 2, NULL, 'Company orientation attended', 0, NULL, NULL, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(15, 13, 2, NULL, 'Uniform & ID issued', 0, NULL, NULL, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(16, 13, 2, NULL, 'Department on-the-job training', 0, NULL, NULL, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(17, 5, 3, NULL, 'Signed employment contract', 0, NULL, NULL, '2026-08-17 00:31:34', '2026-08-18 08:53:43'),
(18, 5, 3, NULL, 'NBI / Police clearance', 0, NULL, NULL, '2026-08-17 00:31:34', '2026-08-18 08:53:43'),
(19, 5, 3, NULL, 'Pre-employment medical exam', 0, NULL, NULL, '2026-08-17 00:31:34', '2026-08-18 08:53:44'),
(20, 5, 3, NULL, 'SSS / PhilHealth / Pag-IBIG / TIN', 0, NULL, NULL, '2026-08-17 00:31:34', '2026-08-18 08:53:44'),
(21, 5, 3, NULL, 'Birth certificate (PSA)', 0, NULL, NULL, '2026-08-17 00:31:34', '2026-08-18 08:53:45'),
(22, 5, 3, NULL, 'Company orientation attended', 0, NULL, NULL, '2026-08-17 00:31:34', '2026-08-18 08:53:45'),
(23, 5, 3, NULL, 'Uniform & ID issued', 0, NULL, NULL, '2026-08-17 00:31:34', '2026-08-18 08:53:46'),
(24, 5, 3, NULL, 'Department on-the-job training', 0, NULL, NULL, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(25, 14, 4, NULL, 'Signed employment contract', 1, '2026-02-25 18:00:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(26, 14, 4, NULL, 'NBI / Police clearance', 1, '2026-02-25 18:10:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(27, 14, 4, NULL, 'Pre-employment medical exam', 1, '2026-02-26 17:00:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(28, 14, 4, NULL, 'SSS / PhilHealth / Pag-IBIG / TIN', 1, '2026-02-26 17:30:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(29, 14, 4, NULL, 'Birth certificate (PSA)', 1, '2026-02-26 18:00:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(30, 14, 4, NULL, 'Company orientation attended', 1, '2026-02-27 16:00:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(31, 14, 4, NULL, 'Uniform & ID issued', 1, '2026-02-27 16:30:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(32, 14, 4, NULL, 'Department on-the-job training', 1, '2026-02-28 00:00:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(33, 6, 5, NULL, 'Signed employment contract', 1, '2025-09-11 18:00:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(34, 6, 5, NULL, 'NBI / Police clearance', 1, '2025-09-11 18:10:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(35, 6, 5, NULL, 'Pre-employment medical exam', 1, '2025-09-12 17:00:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(36, 6, 5, NULL, 'SSS / PhilHealth / Pag-IBIG / TIN', 1, '2025-09-12 17:30:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(37, 6, 5, NULL, 'Birth certificate (PSA)', 1, '2025-09-12 18:00:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(38, 6, 5, NULL, 'Company orientation attended', 1, '2025-09-14 16:00:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(39, 6, 5, NULL, 'Uniform & ID issued', 1, '2025-09-14 16:30:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(40, 6, 5, NULL, 'Regularization evaluation passed', 1, '2026-03-14 22:00:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(41, 15, 6, 9, 'Department orientation completed', 1, '2026-05-10 16:00:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(42, 15, 6, 10, 'Job description acknowledged', 1, '2026-05-10 16:20:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(43, 15, 6, 11, '1st month performance evaluation', 1, '2026-06-09 17:00:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(44, 15, 6, 12, '3rd month performance evaluation', 0, NULL, NULL, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(45, 15, 6, 13, '5th month performance evaluation', 0, NULL, NULL, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(46, 15, 6, 14, 'Training hours completed', 0, NULL, NULL, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(47, 16, 7, 9, 'Department orientation completed', 1, '2026-02-19 16:00:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(48, 16, 7, 10, 'Job description acknowledged', 1, '2026-02-19 16:20:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(49, 16, 7, 11, '1st month performance evaluation', 1, '2026-03-19 17:00:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(50, 16, 7, 12, '3rd month performance evaluation', 1, '2026-05-19 17:00:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(51, 16, 7, 13, '5th month performance evaluation', 0, NULL, NULL, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(52, 16, 7, 14, 'Training hours completed', 0, NULL, NULL, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(53, 17, 8, 9, 'Department orientation completed', 1, '2026-05-31 16:00:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(54, 17, 8, 10, 'Job description acknowledged', 0, NULL, NULL, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(55, 17, 8, 11, '1st month performance evaluation', 0, NULL, NULL, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(56, 17, 8, 12, '3rd month performance evaluation', 0, NULL, NULL, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(57, 17, 8, 13, '5th month performance evaluation', 0, NULL, NULL, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(58, 17, 8, 14, 'Training hours completed', 0, NULL, NULL, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(59, 18, 9, NULL, 'Regularization contract signed', 1, '2025-05-29 18:00:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(60, 18, 9, NULL, 'HMO enrollment submitted', 1, '2025-05-29 18:30:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(61, 18, 9, NULL, 'Leave credits activated', 1, '2025-06-01 17:00:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(62, 18, 9, NULL, 'Performance goals set', 1, '2025-06-01 17:30:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(63, 19, 10, NULL, 'Regularization contract signed', 1, '2025-03-13 18:00:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(64, 19, 10, NULL, 'HMO enrollment submitted', 1, '2025-03-13 18:30:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(65, 19, 10, NULL, 'Leave credits activated', 1, '2025-03-16 17:00:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(66, 19, 10, NULL, 'Performance goals set', 1, '2025-03-16 17:30:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(67, 20, 11, NULL, 'Regularization contract signed', 1, '2025-11-06 18:00:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(68, 20, 11, NULL, 'HMO enrollment submitted', 1, '2025-11-06 18:30:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(69, 20, 11, NULL, 'Leave credits activated', 1, '2025-11-09 17:00:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(70, 20, 11, NULL, 'Performance goals set', 0, NULL, NULL, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(71, 21, 12, NULL, 'Regularization contract signed', 1, '2025-01-22 18:00:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(72, 21, 12, NULL, 'HMO enrollment submitted', 1, '2025-01-22 18:30:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(73, 21, 12, NULL, 'Leave credits activated', 1, '2025-01-26 17:00:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(74, 21, 12, NULL, 'Performance goals set', 1, '2025-01-26 17:30:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(75, NULL, NULL, NULL, 'Signed employment contract', 1, '2026-08-16 22:55:40', NULL, '2026-08-16 22:52:32', '2026-08-16 22:55:40'),
(76, NULL, NULL, NULL, 'NBI / Police clearance', 1, '2026-08-16 22:55:41', NULL, '2026-08-16 22:52:32', '2026-08-16 22:55:41'),
(77, NULL, NULL, NULL, 'Pre-employment medical exam', 1, '2026-08-16 22:56:16', NULL, '2026-08-16 22:52:32', '2026-08-16 22:56:16'),
(78, NULL, NULL, NULL, 'SSS / PhilHealth / Pag-IBIG / TIN', 1, '2026-08-16 22:56:17', NULL, '2026-08-16 22:52:32', '2026-08-16 22:56:17'),
(79, NULL, NULL, NULL, 'Birth certificate (PSA)', 1, '2026-08-16 22:56:19', NULL, '2026-08-16 22:52:32', '2026-08-16 22:56:19'),
(80, NULL, NULL, NULL, 'Company orientation attended', 1, '2026-08-16 22:56:25', NULL, '2026-08-16 22:52:33', '2026-08-16 22:56:25'),
(81, NULL, NULL, NULL, 'Uniform & ID issued', 1, '2026-08-16 22:56:25', NULL, '2026-08-16 22:52:33', '2026-08-16 22:56:25'),
(82, NULL, NULL, NULL, 'Department on-the-job training', 1, '2026-08-16 22:56:24', NULL, '2026-08-16 22:52:33', '2026-08-16 22:56:24'),
(99, NULL, 14, NULL, 'Signed employment contract', 1, '2026-08-18 09:50:44', NULL, '2026-08-18 08:49:26', '2026-08-18 09:50:44'),
(100, NULL, 14, NULL, 'NBI / Police clearance', 1, '2026-08-18 09:50:44', NULL, '2026-08-18 08:49:26', '2026-08-18 09:50:44'),
(101, NULL, 14, NULL, 'Pre-employment medical exam', 1, '2026-08-18 11:01:11', NULL, '2026-08-18 08:49:26', '2026-08-18 11:01:11'),
(102, NULL, 14, NULL, 'SSS / PhilHealth / Pag-IBIG / TIN', 1, '2026-08-18 11:01:12', NULL, '2026-08-18 08:49:26', '2026-08-18 11:01:12'),
(103, NULL, 14, NULL, 'Birth certificate (PSA)', 1, '2026-08-18 11:01:12', NULL, '2026-08-18 08:49:26', '2026-08-18 11:01:12'),
(104, NULL, 14, NULL, 'Company orientation attended', 1, '2026-08-18 11:01:13', NULL, '2026-08-18 08:49:26', '2026-08-18 11:01:13'),
(105, NULL, 14, NULL, 'Uniform & ID issued', 1, '2026-08-18 11:01:17', NULL, '2026-08-18 08:49:26', '2026-08-18 11:01:17'),
(106, NULL, 14, NULL, 'Department on-the-job training', 1, '2026-08-18 11:01:18', NULL, '2026-08-18 08:49:26', '2026-08-18 11:01:18'),
(107, NULL, 15, NULL, 'Signed employment contract', 0, NULL, NULL, '2026-08-18 08:49:26', '2026-08-18 08:49:26'),
(108, NULL, 15, NULL, 'NBI / Police clearance', 0, NULL, NULL, '2026-08-18 08:49:26', '2026-08-18 08:49:26'),
(109, NULL, 15, NULL, 'Pre-employment medical exam', 0, NULL, NULL, '2026-08-18 08:49:26', '2026-08-18 08:49:26'),
(110, NULL, 15, NULL, 'SSS / PhilHealth / Pag-IBIG / TIN', 0, NULL, NULL, '2026-08-18 08:49:26', '2026-08-18 08:49:26'),
(111, NULL, 15, NULL, 'Birth certificate (PSA)', 0, NULL, NULL, '2026-08-18 08:49:26', '2026-08-18 08:49:26'),
(112, NULL, 15, NULL, 'Company orientation attended', 0, NULL, NULL, '2026-08-18 08:49:26', '2026-08-18 08:49:26'),
(113, NULL, 15, NULL, 'Uniform & ID issued', 0, NULL, NULL, '2026-08-18 08:49:26', '2026-08-18 08:49:26'),
(114, NULL, 15, NULL, 'Department on-the-job training', 0, NULL, NULL, '2026-08-18 08:49:26', '2026-08-18 08:49:26'),
(211, 4, 1, NULL, 'PREPRE', 0, NULL, NULL, '2026-08-18 08:51:16', '2026-08-18 08:51:16'),
(212, 13, 2, NULL, 'PREPRE', 0, NULL, NULL, '2026-08-18 08:51:16', '2026-08-18 08:51:16'),
(213, NULL, 14, NULL, 'PREPRE', 1, '2026-08-18 11:05:29', NULL, '2026-08-18 08:51:16', '2026-08-18 11:05:29'),
(214, NULL, 15, NULL, 'PREPRE', 0, NULL, NULL, '2026-08-18 08:51:16', '2026-08-18 08:51:16'),
(284, NULL, 16, NULL, 'Signed employment contract', 1, '2026-08-18 09:51:54', NULL, '2026-08-18 09:51:14', '2026-08-18 09:51:54'),
(285, NULL, 16, NULL, 'NBI / Police clearance', 1, '2026-08-18 09:51:54', NULL, '2026-08-18 09:51:14', '2026-08-18 09:51:54'),
(286, NULL, 16, NULL, 'Pre-employment medical exam', 0, NULL, NULL, '2026-08-18 09:51:14', '2026-08-18 09:51:52'),
(287, NULL, 16, NULL, 'SSS / PhilHealth / Pag-IBIG / TIN', 0, NULL, NULL, '2026-08-18 09:51:14', '2026-08-18 09:51:52'),
(288, NULL, 16, NULL, 'Birth certificate (PSA)', 0, NULL, NULL, '2026-08-18 09:51:14', '2026-08-18 09:51:53'),
(289, NULL, 16, NULL, 'Company orientation attended', 1, '2026-08-18 09:51:54', NULL, '2026-08-18 09:51:14', '2026-08-18 09:51:54'),
(290, NULL, 16, NULL, 'Uniform & ID issued', 1, '2026-08-18 09:51:46', NULL, '2026-08-18 09:51:14', '2026-08-18 09:51:46'),
(291, NULL, 16, NULL, 'Department on-the-job training', 1, '2026-08-18 09:51:46', NULL, '2026-08-18 09:51:14', '2026-08-18 09:51:46'),
(293, 5, 3, NULL, 'PROPRO', 0, NULL, NULL, '2026-08-18 09:54:03', '2026-08-18 09:54:03'),
(294, 14, 4, NULL, 'PROPRO', 0, NULL, NULL, '2026-08-18 09:54:03', '2026-08-18 09:54:03'),
(295, 15, 6, NULL, 'PROPRO', 0, NULL, NULL, '2026-08-18 09:54:03', '2026-08-18 09:54:03'),
(296, 16, 7, NULL, 'PROPRO', 0, NULL, NULL, '2026-08-18 09:54:03', '2026-08-18 09:54:03'),
(297, 17, 8, NULL, 'PROPRO', 0, NULL, NULL, '2026-08-18 09:54:03', '2026-08-18 09:54:03'),
(298, NULL, 16, NULL, 'PROPRO', 0, NULL, NULL, '2026-08-18 09:54:03', '2026-08-18 09:54:03'),
(301, NULL, 14, 122, 'PROSPROS', 0, NULL, NULL, '2026-08-18 11:06:44', '2026-08-18 11:06:44'),
(302, NULL, 19, 123, 'PRESPRES', 1, '2026-08-18 21:51:46', NULL, '2026-08-18 21:51:45', '2026-08-18 21:51:46');

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
) ;

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

CREATE TABLE `ess_categories` (
  `ess_category_id` bigint(20) UNSIGNED NOT NULL,
  `code` varchar(40) NOT NULL,
  `name` varchar(120) NOT NULL,
  `description` text DEFAULT NULL,
  `is_open` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
(1, 'REQ-4410', 5, 1, 'Sick Leave', '2026-07-25 01:00:00', '2026-07-27', '2026-07-27', 'Pending', 2, '1 day sick leave with medical certificate attached.', NULL, 0, '/uploads/ess/req-4410-medical.pdf', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(2, 'REQ-4409', 6, 7, 'Certificate of Employment', '2026-07-24 02:00:00', NULL, NULL, 'Under Review', 7, 'COE for bank loan application, needs salary details.', NULL, 0, NULL, '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(3, 'REQ-4408', 8, 2, 'Attendance Correction', '2026-07-24 03:00:00', NULL, NULL, 'Approved', 2, 'Missing time-out on 2026-07-22, verified with floor logbook.', 'Verified against floor logbook entry.', 0, NULL, '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(4, 'REQ-4407', 4, 3, 'Payslip Request', '2026-07-23 06:00:00', NULL, NULL, 'Completed', 8, 'Payslip copies for June 2026 cut-offs.', 'Copies released via HR portal.', 0, NULL, '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(5, 'REQ-4406', 5, 6, 'Transportation', '2026-07-21 01:00:00', NULL, NULL, 'Rejected', 8, 'Missing official receipt for claimed amount.', 'Official receipt not provided.', 1, NULL, '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(6, 'REQ-4405', 1, 5, 'Company Loan', '2026-07-20 05:00:00', NULL, NULL, 'Under Review', 8, 'PHP 50,000 company loan payable in 12 months.', NULL, 0, '/uploads/ess/req-4405-loan-agreement.pdf', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(7, 'REQ-4404', 8, 8, 'Contact Number Update', '2026-07-19 01:00:00', NULL, NULL, 'Completed', 7, 'Updated mobile number and emergency contact.', 'Record updated in 201 file.', 0, NULL, '2026-08-17 17:41:34', '2026-08-17 17:41:34');

-- --------------------------------------------------------

--
-- Table structure for table `hr3_recommendations`
--

CREATE TABLE `hr3_recommendations` (
  `recommendation_id` bigint(20) UNSIGNED NOT NULL,
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
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

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

CREATE TABLE `interviews` (
  `interview_id` bigint(20) UNSIGNED NOT NULL,
  `interview_code` varchar(40) NOT NULL,
  `applicant_id` bigint(20) UNSIGNED NOT NULL,
  `scheduled_date` date NOT NULL,
  `scheduled_time` time NOT NULL,
  `mode` varchar(20) NOT NULL,
  `interviewer_employee_id` bigint(20) UNSIGNED DEFAULT NULL,
  `interviewer_name` varchar(160) DEFAULT NULL,
  `status` varchar(20) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
(14, 'front-office-manager', 'Front Office Manager', 1, 10, 'Full-time', 'Shifting Schedule', 0.00, 0.00, 1, 0, '2026-08-19', 'Open', 1, NULL, NULL, NULL, NULL, '[]', '[]', '[]', '[]', 'job-post-pictures/ilbUmYCHlO6iCL5mkVMCfeCzmN2SmOpE9LWjNzII.png', '2026-08-19 04:53:42', '2026-08-19 04:53:42');

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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

CREATE TABLE `learning_courses` (
  `course_id` bigint(20) UNSIGNED NOT NULL,
  `course_code` varchar(40) NOT NULL,
  `title` varchar(200) NOT NULL,
  `category` varchar(120) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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

CREATE TABLE `leave_balances` (
  `leave_balance_id` bigint(20) UNSIGNED NOT NULL,
  `employee_id` bigint(20) UNSIGNED NOT NULL,
  `leave_type` varchar(80) NOT NULL,
  `period_year` smallint(6) NOT NULL,
  `total_days` decimal(6,2) NOT NULL DEFAULT 0.00,
  `used_days` decimal(6,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '2026_08_19_000001_dedupe_employee_onboarding_items', 1),
(2, '2026_08_19_000002_dedupe_legacy_onboarding_item_duplicates', 2),
(3, '2026_08_18_000001_set_template_item_fk_set_null', 3);

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
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
(9, 8, 'ess_request', 'Loan application under review', 'Company loan application REQ-4405 assigned to you.', 'ESS Management', 'ess_request', 'REQ-4405', 0, NULL, '2026-08-17 00:31:35');

-- --------------------------------------------------------

--
-- Table structure for table `onboarding_checklist_items`
--

CREATE TABLE `onboarding_checklist_items` (
  `template_item_id` bigint(20) UNSIGNED NOT NULL,
  `template_id` bigint(20) UNSIGNED NOT NULL,
  `item_text` text NOT NULL,
  `sort_order` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `onboarding_checklist_items`
--

INSERT INTO `onboarding_checklist_items` (`template_item_id`, `template_id`, `item_text`, `sort_order`, `created_at`) VALUES
(9, 2, 'Department orientation completed', 1, '2026-08-17 00:31:34'),
(10, 2, 'Job description acknowledged', 2, '2026-08-17 00:31:34'),
(11, 2, '1st month performance evaluation', 3, '2026-08-17 00:31:34'),
(12, 2, '3rd month performance evaluation', 4, '2026-08-17 00:31:34'),
(13, 2, '5th month performance evaluation', 5, '2026-08-17 00:31:34'),
(14, 2, 'Training hours completed', 6, '2026-08-17 00:31:34'),
(122, 8, 'PROSPROS', 0, '2026-08-18 19:03:07'),
(123, 9, 'PRESPRES', 0, '2026-08-18 19:03:48'),
(124, 8, 'P_R_O', 1, '2026-08-18 19:13:25');

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `onboarding_checklist_templates`
--

INSERT INTO `onboarding_checklist_templates` (`template_id`, `template_code`, `title`, `phase`, `position_scope_json`, `status`, `created_at`, `updated_at`) VALUES
(2, 'TPL-002', 'Standard Probationary Checklist', 'Probationary', '[]', 'Inactive', '2026-08-17 00:31:34', '2026-08-16 22:53:17'),
(8, 'OCT-0008', 'PROSs', 'Probationary', '[]', 'Inactive', '2026-08-18 11:03:07', '2026-08-19 07:10:59'),
(9, 'OCT-0009', 'PRESs', 'Pre-onboarding', '[]', 'Inactive', '2026-08-18 11:03:48', '2026-08-19 07:10:46');

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
(1, 'PAY-2026-06-1C', '1st Cut-off June 2026', '2026-06-01', '2026-06-15', '2026-06-20', 'Closed', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(2, 'PAY-2026-06-2C', '2nd Cut-off June 2026', '2026-06-16', '2026-06-30', '2026-07-05', 'Closed', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(3, 'PAY-2026-07-1C', '1st Cut-off July 2026', '2026-07-01', '2026-07-15', '2026-07-20', 'Closed', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(4, 'PAY-2026-07-2C', '2nd Cut-off July 2026', '2026-07-16', '2026-07-31', '2026-08-05', 'Open', '2026-08-17 17:41:34', '2026-08-17 17:41:34');

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `performance_reviews`
--

INSERT INTO `performance_reviews` (`performance_review_id`, `employee_id`, `review_period`, `review_date`, `competency_level`, `overall_rating`, `salary_grade_id`, `salary_step`, `evaluator_user_id`, `comments`, `created_at`, `updated_at`) VALUES
(1, 5, 'Q2 2026', '2026-07-15', 'Proficient', 3.50, 2, 'Step 2', 3, 'Meets expectations; consistent food safety compliance and station discipline.', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(2, 6, 'Q2 2026', '2026-07-15', 'Proficient', 4.00, 1, 'Step 1', 2, 'Strong banquet service support; recommended for promotion track.', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(3, 1, 'Q2 2026', '2026-07-15', 'Expert', 4.50, 6, 'Step 3', 2, 'Highest guest satisfaction score this quarter among department heads.', '2026-08-17 17:41:34', '2026-08-17 17:41:34');

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
) ;

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
(17, 'POS-017', 'Accounting Supervisor', 5, 4, 'Supervisory', 1, 1, '2026-08-17 17:41:34', '2026-08-17 17:41:34');

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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

CREATE TABLE `role_permissions` (
  `role_permission_id` bigint(20) UNSIGNED NOT NULL,
  `role_id` bigint(20) UNSIGNED NOT NULL,
  `module_name` varchar(100) NOT NULL,
  `permission_level` varchar(40) NOT NULL DEFAULT 'None',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

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
) ;

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
('GKUs7XLenwGw2IZ5YmFavnLTWGTZAmkpVqkjnGOz', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-PH) WindowsPowerShell/5.1.19041.6456', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoicFRta1haMWt1Tmg2dVNNTHp3UzZXM0YxZzZiUjlFWEdRc2huQmVYVyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1787077270),
('HHntJhIGIn4Cm0ZKBkr2i6f3PqMuFMjSikc4ftZx', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-PH) WindowsPowerShell/5.1.19041.6456', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiZ2tXZGI5QlNVMUROTmF4TkdxMGx6eDRpZ25GNW9sWmxmMTNtak5nVSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1787077270),
('KKs2QMh0t1lHzoEBS2nyw5KDAbwIpt4HjuaanAAc', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-PH) WindowsPowerShell/5.1.19041.6456', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiV0hCbDdmb285UmNncGVIcnc3UmFqSm9KMXdQQndtVWFaV0ljOVk2bSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1787077277),
('sxJY5uq8a6w54b9CPaPWRPqk0gHvBgBHEFYFIe4E', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-PH) WindowsPowerShell/5.1.19041.6456', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiN3lLck1lRGZGT01RRFh0UldpM1ljMzNWcVBiQXVoMlQ1SVBNbU52NCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1787077268);

-- --------------------------------------------------------

--
-- Table structure for table `system_roles`
--

CREATE TABLE `system_roles` (
  `role_id` bigint(20) UNSIGNED NOT NULL,
  `role_name` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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

CREATE TABLE `system_settings` (
  `setting_id` bigint(20) UNSIGNED NOT NULL,
  `setting_key` varchar(120) NOT NULL,
  `setting_value` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`setting_value`)),
  `updated_by_user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `last_login_at` timestamp NULL DEFAULT NULL,
  `last_login_ip` varchar(45) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

--
-- Dumping data for table `system_users`
--

INSERT INTO `system_users` (`system_user_id`, `username`, `email`, `password_hash`, `full_name`, `department_name`, `employee_id`, `role_id`, `status`, `last_login_at`, `last_login_ip`, `created_at`, `updated_at`) VALUES
(1, 'bullseur', 'bullseur@oxfordsuites.com.ph', '$2y$12$dbtjwR9Coj1n0BmOlLIif.dHbmzQ.Gb9hWFiOhdAyLNXs7BivSHDm', 'Bullseur Santiago', 'Administration / HR', NULL, 1, 'Active', '2026-07-26 00:12:00', '192.168.10.4', '2026-08-17 17:41:34', '2026-08-19 20:59:42'),
(2, 'jdelacruz', 'juan.delacruz@oxfordsuites.com.ph', '$2y$12$dbtjwR9Coj1n0BmOlLIif.dHbmzQ.Gb9hWFiOhdAyLNXs7BivSHDm', 'Juan Dela Cruz', 'Administration / HR', 7, 2, 'Active', '2026-07-25 23:58:00', '192.168.10.22', '2026-08-17 17:41:34', '2026-08-17 09:45:43'),
(3, 'aramos', 'ana.ramos@oxfordsuites.com.ph', '$2y$12$dbtjwR9Coj1n0BmOlLIif.dHbmzQ.Gb9hWFiOhdAyLNXs7BivSHDm', 'Ana Ramos', 'Front Office', 1, 2, 'Active', '2026-07-25 13:04:00', '192.168.10.31', '2026-08-17 17:41:34', '2026-08-17 09:45:43'),
(4, 'kdelacruz', 'kevin.delacruz@oxfordsuites.com.ph', '$2y$12$dbtjwR9Coj1n0BmOlLIif.dHbmzQ.Gb9hWFiOhdAyLNXs7BivSHDm', 'Kevin Dela Cruz', 'Kitchen / Culinary', 5, 3, 'Active', '2026-07-25 06:40:00', '10.0.4.88', '2026-08-17 17:41:34', '2026-08-17 09:45:43'),
(5, 'mdevera', 'marjun.devera@oxfordsuites.com.ph', '$2b$10$Oji0t1I10YUhX3drMn6WnuvNPzEdTSF4/XFIbIqIsEK2cFv2kOas6', 'Marjun Devera', 'Food & Beverage', 6, 3, 'Suspended', '2026-07-20 11:11:00', '10.0.4.101', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(6, 'raquino', 'rosa.aquino@oxfordsuites.com.ph', '$2y$12$dbtjwR9Coj1n0BmOlLIif.dHbmzQ.Gb9hWFiOhdAyLNXs7BivSHDm', 'Rosa Aquino', 'Housekeeping', 8, 3, 'Active', '2026-07-25 22:03:00', '10.0.4.57', '2026-08-17 17:41:34', '2026-08-17 09:45:43'),
(7, 'mlim', 'maria.lim@oxfordsuites.com.ph', '$2y$12$dbtjwR9Coj1n0BmOlLIif.dHbmzQ.Gb9hWFiOhdAyLNXs7BivSHDm', 'Maria Lim', 'Administration / HR', 11, 2, 'Active', '2026-07-25 23:45:00', '192.168.10.18', '2026-08-17 17:41:34', '2026-08-17 09:45:43'),
(8, 'pcruz', 'paolo.cruz@oxfordsuites.com.ph', '$2y$12$dbtjwR9Coj1n0BmOlLIif.dHbmzQ.Gb9hWFiOhdAyLNXs7BivSHDm', 'Paolo Cruz', 'Administration / HR', 12, 2, 'Active', '2026-07-25 09:30:00', '192.168.10.12', '2026-08-17 17:41:34', '2026-08-17 09:45:43'),
(10, 'bcbc', 'bcbc@mga.com', '$2y$12$v9BFODVCXeNG3WHrYC3uMuAafstMMpI5OuIcB/AXvtcnXhG8BQPRa', 'bcbc', 'Food & Beverage', NULL, 3, 'Active', NULL, NULL, '2026-08-18 10:43:08', '2026-08-18 10:43:08'),
(11, 'admin-img2', 'ADMIN-img2@gmail.com', '$2y$12$wPEAs28Pgjrru14..AqGwuLDBxwMd/AldKiDuGu6rgzYIAAVCuKgu', 'ADMIN-img2', 'Food & Beverage', NULL, 3, 'Active', NULL, NULL, '2026-08-18 10:44:41', '2026-08-18 10:44:41'),
(12, 'f1', 'f1@gmail.com', '$2y$12$ewa1aHnUb.A6C860A809s.bCbeM1pM5h0QEmsb1U9cFFB/7ojsBmu', 'f1', 'Food & Beverage', NULL, 3, 'Active', NULL, NULL, '2026-08-18 10:48:14', '2026-08-18 10:48:14'),
(13, 'kevin.santos', 'kevin.santos@oxfordsuites.com.ph', 'testtest', 'kevin.santos', NULL, NULL, 3, 'Active', NULL, NULL, '2026-08-18 10:50:19', '2026-08-18 19:08:20');

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
) ;

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
(8, 5, '2026-07-20 11:11:00', '10.0.4.101', 'Chrome · Android', 'Mozilla/5.0 (Linux; Android 13; Chrome/126.0)', 'success');

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
(1, 5, 0, 'AM Shift', '07:00:00', '16:00:00', 'Main Kitchen', 0, '2026-07-01', NULL, '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(2, 5, 1, 'AM Shift', '07:00:00', '16:00:00', 'Main Kitchen', 0, '2026-07-01', NULL, '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(3, 5, 2, 'Mid Shift', '11:00:00', '20:00:00', 'Banquet', 0, '2026-07-01', NULL, '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(4, 5, 3, 'Mid Shift', '11:00:00', '20:00:00', 'Banquet', 0, '2026-07-01', NULL, '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(5, 5, 4, 'PM Shift', '14:00:00', '23:00:00', 'Main Kitchen', 0, '2026-07-01', NULL, '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(6, 5, 5, NULL, NULL, NULL, NULL, 1, '2026-07-01', NULL, '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(7, 5, 6, NULL, NULL, NULL, NULL, 1, '2026-07-01', NULL, '2026-08-17 17:41:34', '2026-08-17 17:41:34');

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
  ADD UNIQUE KEY `uq_applicants_applicant_code` (`applicant_code`),
  ADD KEY `fk_applicants_job_post_id` (`job_post_id`);

--
-- Indexes for table `applicant_assessments`
--
ALTER TABLE `applicant_assessments`
  ADD PRIMARY KEY (`assessment_id`),
  ADD KEY `fk_applicant_assessments_applicant_id` (`applicant_id`),
  ADD KEY `fk_applicant_assessments_assessor_user_id` (`assessor_user_id`);

--
-- Indexes for table `applicant_screening_entities`
--
ALTER TABLE `applicant_screening_entities`
  ADD PRIMARY KEY (`entity_id`),
  ADD KEY `fk_applicant_screening_entities_applicant_id` (`applicant_id`);

--
-- Indexes for table `applicant_screening_scores`
--
ALTER TABLE `applicant_screening_scores`
  ADD PRIMARY KEY (`score_id`),
  ADD KEY `fk_applicant_screening_scores_applicant_id` (`applicant_id`);

--
-- Indexes for table `attendance_records`
--
ALTER TABLE `attendance_records`
  ADD PRIMARY KEY (`attendance_id`),
  ADD UNIQUE KEY `uq_attendance_records_natural` (`employee_id`,`work_date`),
  ADD KEY `idx_attendance_records_work_date` (`work_date`);

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`audit_log_id`),
  ADD KEY `fk_audit_logs_system_user_id` (`system_user_id`);

--
-- Indexes for table `checklist_requests`
--
ALTER TABLE `checklist_requests`
  ADD PRIMARY KEY (`checklist_request_id`),
  ADD UNIQUE KEY `uq_checklist_requests_request_code` (`request_code`),
  ADD KEY `fk_checklist_requests_employee_id` (`employee_id`),
  ADD KEY `fk_checklist_requests_requested_by_user_id` (`requested_by_user_id`),
  ADD KEY `fk_checklist_requests_template_id` (`template_id`);

--
-- Indexes for table `departments`
--
ALTER TABLE `departments`
  ADD PRIMARY KEY (`department_id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD UNIQUE KEY `name` (`name`),
  ADD KEY `idx_departments_head_employee_id` (`head_employee_id`);

--
-- Indexes for table `employees`
--
ALTER TABLE `employees`
  ADD PRIMARY KEY (`employee_id`),
  ADD UNIQUE KEY `employee_code` (`employee_code`),
  ADD UNIQUE KEY `email` (`email`),
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
  ADD UNIQUE KEY `employee_id` (`employee_id`),
  ADD KEY `idx_employee_exit_records_employee_id` (`employee_id`);

--
-- Indexes for table `employee_learning`
--
ALTER TABLE `employee_learning`
  ADD PRIMARY KEY (`employee_learning_id`),
  ADD UNIQUE KEY `uq_employee_learning_natural` (`employee_id`,`course_id`),
  ADD KEY `idx_employee_learning_course_id` (`course_id`);

--
-- Indexes for table `employee_onboarding_items`
--
ALTER TABLE `employee_onboarding_items`
  ADD PRIMARY KEY (`employee_onboarding_item_id`),
  ADD KEY `fk_employee_onboarding_items_completed_by_user_id` (`completed_by_user_id`),
  ADD KEY `fk_employee_onboarding_items_employee_id` (`employee_id`),
  ADD KEY `fk_employee_onboarding_items_new_hire_id` (`new_hire_id`),
  ADD KEY `fk_employee_onboarding_items_template_item_id` (`template_item_id`);

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
  ADD UNIQUE KEY `code` (`code`);

--
-- Indexes for table `ess_requests`
--
ALTER TABLE `ess_requests`
  ADD PRIMARY KEY (`ess_request_id`),
  ADD UNIQUE KEY `request_code` (`request_code`),
  ADD KEY `idx_ess_requests_employee_id` (`employee_id`),
  ADD KEY `idx_ess_requests_category_id` (`category_id`),
  ADD KEY `idx_ess_requests_assigned_to_user_id` (`assigned_to_user_id`),
  ADD KEY `idx_ess_requests_status` (`status`),
  ADD KEY `idx_ess_requests_filed_at` (`filed_at`);

--
-- Indexes for table `hr3_recommendations`
--
ALTER TABLE `hr3_recommendations`
  ADD PRIMARY KEY (`recommendation_id`),
  ADD KEY `idx_hr3_recommendations_employee_id` (`employee_id`),
  ADD KEY `idx_hr3_recommendations_evaluator_user_id` (`evaluator_user_id`),
  ADD KEY `idx_hr3_recommendations_suggested_position_id` (`suggested_position_id`),
  ADD KEY `idx_hr3_recommendations_suggested_salary_grade_id` (`suggested_salary_grade_id`);

--
-- Indexes for table `interviews`
--
ALTER TABLE `interviews`
  ADD PRIMARY KEY (`interview_id`),
  ADD UNIQUE KEY `uq_interviews_interview_code` (`interview_code`),
  ADD KEY `fk_interviews_applicant_id` (`applicant_id`),
  ADD KEY `fk_interviews_interviewer_employee_id` (`interviewer_employee_id`);

--
-- Indexes for table `job_posts`
--
ALTER TABLE `job_posts`
  ADD PRIMARY KEY (`job_post_id`),
  ADD UNIQUE KEY `uq_job_posts_slug` (`slug`),
  ADD KEY `fk_job_posts_department_id` (`department_id`),
  ADD KEY `fk_job_posts_position_id` (`position_id`);

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
  ADD UNIQUE KEY `course_code` (`course_code`);

--
-- Indexes for table `leave_balances`
--
ALTER TABLE `leave_balances`
  ADD PRIMARY KEY (`leave_balance_id`),
  ADD UNIQUE KEY `uq_leave_balances_natural` (`employee_id`,`leave_type`,`period_year`);

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
  ADD UNIQUE KEY `uq_new_hires_new_hire_code` (`new_hire_code`),
  ADD KEY `fk_new_hires_applicant_id` (`applicant_id`),
  ADD KEY `fk_new_hires_department_id` (`department_id`),
  ADD KEY `fk_new_hires_employee_id` (`employee_id`),
  ADD KEY `fk_new_hires_position_id` (`position_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`notification_id`),
  ADD KEY `fk_notifications_system_user_id` (`system_user_id`);

--
-- Indexes for table `onboarding_checklist_items`
--
ALTER TABLE `onboarding_checklist_items`
  ADD PRIMARY KEY (`template_item_id`),
  ADD KEY `fk_onboarding_checklist_items_template_id` (`template_id`);

--
-- Indexes for table `onboarding_checklist_templates`
--
ALTER TABLE `onboarding_checklist_templates`
  ADD PRIMARY KEY (`template_id`),
  ADD UNIQUE KEY `uq_onboarding_checklist_templates_template_code` (`template_code`);

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
  ADD UNIQUE KEY `period_code` (`period_code`),
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
-- Indexes for table `positions`
--
ALTER TABLE `positions`
  ADD PRIMARY KEY (`position_id`),
  ADD UNIQUE KEY `position_code` (`position_code`),
  ADD KEY `idx_positions_department_id` (`department_id`),
  ADD KEY `idx_positions_salary_grade_id` (`salary_grade_id`);

--
-- Indexes for table `requisitions`
--
ALTER TABLE `requisitions`
  ADD PRIMARY KEY (`requisition_id`),
  ADD UNIQUE KEY `uq_requisitions_requisition_code` (`requisition_code`),
  ADD KEY `fk_requisitions_converted_job_post_id` (`converted_job_post_id`),
  ADD KEY `fk_requisitions_department_id` (`department_id`),
  ADD KEY `fk_requisitions_position_id` (`position_id`),
  ADD KEY `fk_requisitions_requested_by_user_id` (`requested_by_user_id`);

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
  ADD UNIQUE KEY `code` (`code`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_sessions_user_id` (`user_id`),
  ADD KEY `idx_sessions_last_activity` (`last_activity`);

--
-- Indexes for table `system_roles`
--
ALTER TABLE `system_roles`
  ADD PRIMARY KEY (`role_id`),
  ADD UNIQUE KEY `role_name` (`role_name`);

--
-- Indexes for table `system_settings`
--
ALTER TABLE `system_settings`
  ADD PRIMARY KEY (`setting_id`),
  ADD UNIQUE KEY `setting_key` (`setting_key`),
  ADD KEY `idx_system_settings_updated_by_user_id` (`updated_by_user_id`);

--
-- Indexes for table `system_users`
--
ALTER TABLE `system_users`
  ADD PRIMARY KEY (`system_user_id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `employee_id` (`employee_id`),
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
  MODIFY `announcement_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `applicants`
--
ALTER TABLE `applicants`
  MODIFY `applicant_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `applicant_assessments`
--
ALTER TABLE `applicant_assessments`
  MODIFY `assessment_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

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
-- AUTO_INCREMENT for table `attendance_records`
--
ALTER TABLE `attendance_records`
  MODIFY `attendance_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `audit_log_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- AUTO_INCREMENT for table `checklist_requests`
--
ALTER TABLE `checklist_requests`
  MODIFY `checklist_request_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `departments`
--
ALTER TABLE `departments`
  MODIFY `department_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `employees`
--
ALTER TABLE `employees`
  MODIFY `employee_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

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
  MODIFY `employee_onboarding_item_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=305;

--
-- AUTO_INCREMENT for table `employee_position_history`
--
ALTER TABLE `employee_position_history`
  MODIFY `position_history_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

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
-- AUTO_INCREMENT for table `hr3_recommendations`
--
ALTER TABLE `hr3_recommendations`
  MODIFY `recommendation_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `interviews`
--
ALTER TABLE `interviews`
  MODIFY `interview_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `job_posts`
--
ALTER TABLE `job_posts`
  MODIFY `job_post_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `job_post_platforms`
--
ALTER TABLE `job_post_platforms`
  MODIFY `job_post_platform_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

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
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `new_hires`
--
ALTER TABLE `new_hires`
  MODIFY `new_hire_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `notification_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `onboarding_checklist_items`
--
ALTER TABLE `onboarding_checklist_items`
  MODIFY `template_item_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=125;

--
-- AUTO_INCREMENT for table `onboarding_checklist_templates`
--
ALTER TABLE `onboarding_checklist_templates`
  MODIFY `template_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

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
-- AUTO_INCREMENT for table `positions`
--
ALTER TABLE `positions`
  MODIFY `position_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `requisitions`
--
ALTER TABLE `requisitions`
  MODIFY `requisition_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `role_permissions`
--
ALTER TABLE `role_permissions`
  MODIFY `role_permission_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `salary_grades`
--
ALTER TABLE `salary_grades`
  MODIFY `salary_grade_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `system_roles`
--
ALTER TABLE `system_roles`
  MODIFY `role_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `system_settings`
--
ALTER TABLE `system_settings`
  MODIFY `setting_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `system_users`
--
ALTER TABLE `system_users`
  MODIFY `system_user_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_login_activity`
--
ALTER TABLE `user_login_activity`
  MODIFY `login_activity_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

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
