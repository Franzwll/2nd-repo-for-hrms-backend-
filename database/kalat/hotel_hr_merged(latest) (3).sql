-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 02, 2026 at 11:12 AM
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
  `resume_original_name` varchar(255) DEFAULT NULL,
  `summary` text DEFAULT NULL,
  `flags_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`flags_json`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`applicant_id`),
  UNIQUE KEY `uq_applicants_applicant_code` (`applicant_code`),
  KEY `fk_applicants_job_post_id` (`job_post_id`)
) ENGINE=InnoDB AUTO_INCREMENT=60 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `applicants`
--

INSERT INTO `applicants` (`applicant_id`, `applicant_code`, `job_post_id`, `name`, `email`, `phone`, `applied_at`, `fit_score`, `status`, `stage`, `source`, `resume_file_path`, `resume_original_name`, `summary`, `flags_json`, `created_at`, `updated_at`) VALUES
(1, 'APP-1032', 1, 'Camille Ortega', 'camille.ortega@email.com', '0917 664 2219', '2026-07-21 23:47:00', 93.00, 'fit', 'Hired', 'Referral', '/uploads/resumes/camille_ortega_resume.pdf', NULL, 'Referred by Front Office Manager; completed practical assessment with 94%.', '[]', '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(2, 'APP-1033', 6, 'Juan De La Cruz', 'juan.delacruz@email.com', '0912 345 6789', '2026-07-22 17:31:00', 76.00, 'fit', 'Interview Scheduled', 'Indeed', '/uploads/resumes/juan_delacruz_resume.pdf', NULL, 'Agency recruitment coordinator transitioning to in-house HR.', '[]', '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(3, 'APP-1034', 3, 'Mark Reyes', 'mark.reyes@email.com', '0908 441 2277', '2026-07-23 19:05:00', 69.00, 'other-role', 'Screened', 'Walk-in', '/uploads/resumes/mark_reyes_resume.pdf', NULL, 'Building maintenance background; endorse to Facilities vacancy.', '[\"Stronger match: Facilities Maintenance (81%)\"]', '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(4, 'APP-1035', 5, 'Jompaks Berdugo', 'jompaks.berdugo@email.com', '0933 552 1180', '2026-07-23 22:22:00', 84.00, 'fit', 'Hired', 'Facebook', '/uploads/resumes/jompaks_berdugo_resume.pdf', NULL, 'Rooftop bar experience with strong signature-cocktail portfolio.', '[]', '2026-08-17 00:31:34', '2026-08-18 03:54:56'),
(5, 'APP-1036', 2, 'Kevin Dela Cruz', 'kevin.delacruz@email.com', '0921 774 9903', '2026-07-24 00:48:00', 91.00, 'fit', 'Offer', 'Online Portal', '/uploads/resumes/kevin_delacruz_resume.pdf', NULL, 'Certified cook with four years hot-kitchen experience across two hotel outlets.', '[]', '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(6, 'APP-1037', 2, 'Elena Torres', 'elena.torres@email.com', '0918 220 3341', '2026-07-25 03:02:00', 22.00, 'not-fit', 'Rejected', 'Online Portal', '/uploads/resumes/elena_torres_resume.pdf', NULL, 'Clerical background with no hospitality or culinary entities detected.', '[\"No culinary certification\",\"No kitchen experience detected\"]', '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(7, 'APP-1038', 3, 'Princess Mabangis', 'princess.mabangis@email', '0912 345', '2026-07-25 04:10:00', 58.00, 'credential', 'Screened', 'Walk-in', '/uploads/resumes/princess_mabangis_resume.pdf', NULL, 'Relevant housekeeping experience but contact details failed NER validation.', '[\"Malformed email address\",\"Incomplete phone number\",\"Job position typo on application form\"]', '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(8, 'APP-1039', 1, 'Kanor Ornak', 'kanor.ornak@email.com', '0905 118 7742', '2026-07-25 05:12:00', 74.00, 'other-role', 'Screened', 'Indeed', '/uploads/resumes/kanor_ornak_resume.pdf', NULL, 'Retail and cafe service background; better aligned to F&B service roles.', '[\"Stronger match: Restaurant Server (86%)\"]', '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(9, 'APP-1040', 4, 'Marjun Devera', 'marjun.devera@email.com', '0917 664 2219', '2026-07-25 06:40:00', 88.00, 'fit', 'Accepted', 'Referral', '/uploads/resumes/marjun_devera_resume.pdf', NULL, 'Strong dining-room service background with banquet exposure.', '[]', '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(10, 'APP-1041', 1, 'Bianca Soriano', 'bianca.soriano@email.com', '0912 345 6789', '2026-07-25 07:15:00', 80.00, 'fit', 'Offer', 'Online Portal', '/uploads/resumes/bianca_soriano_resume.pdf', NULL, 'Three years front office experience at a 4-star property, PMS proficient, complete credentials.', '[]', '2026-08-17 00:31:34', '2026-09-02 00:04:13'),
(15, 'APL-01042', 1, 'juan', 'juan@gmail.com', '0912312300', '2026-08-18 11:55:43', 80.00, 'fit', 'Rejected', 'Online Portal', 'resumes/uQMocQfpx2nSlMO6oXThxQGf7HMS7KgGvf2257pJ.pdf', NULL, 'Added via document screening — GE.pdf.', NULL, '2026-08-18 03:55:43', '2026-08-31 13:35:10'),
(16, 'APL-01043', 1, 'im1', 'im1@gmail.com', '0912312300', '2026-08-18 12:03:17', 80.00, 'fit', 'Offer', 'Walk-in', 'resumes/wOSR1iTpehXQSrBS4GedkAGjzkHM6ag19Md6bHSM.png', NULL, 'Added via image (OCR) screening — war.png.', NULL, '2026-08-18 04:03:17', '2026-08-18 09:51:00'),
(17, 'APL-01044', 1, 'ADMIN-file1', 'ADMIN-file1@gmail.com', '0912312300', '2026-08-18 13:33:35', 95.00, 'fit', 'Screened', 'Online Portal', 'resumes/6e1gYz92oDu5oO4730OMhtf5wHiImdyDp1m0i9ue.pdf', NULL, 'Added via document screening — cover (1).pdf.', NULL, '2026-08-18 05:33:35', '2026-08-31 16:09:06'),
(18, 'APL-01045', 1, 'ADMIN-img1', 'ADMIN-img1@gmail.com', '0912312300', '2026-08-18 13:37:20', 95.00, 'fit', 'Accepted', 'Walk-in', 'resumes/4uKxNaMBDt9Q64H18l3Uc87qerI5b1Au45E3JUoQ.jpg', NULL, 'Added via image (OCR) screening — e731c965-945f-48cb-9f96-8efa53a49cfefile_2865782.jpg.', NULL, '2026-08-18 05:37:20', '2026-08-18 05:40:13'),
(19, 'APL-01046', 1, 'ADMIN-img2', 'ADMIN-img2@gmail.com', '0912312300', '2026-08-18 13:49:54', 80.00, 'fit', 'Offer', 'Walk-in', 'resumes/wJ9ropYSxjOiGhWP0FbnXN2fDAOLUCBpBrlIpZjL.jpg', NULL, 'Added via image (OCR) screening — 356210748_228235520034010_75676984280719317_n.jpg.', NULL, '2026-08-18 05:49:54', '2026-08-18 10:44:38'),
(22, 'APL-01047', 1, 'imga1', 'imga1@gmail.com', '09123123001', '2026-08-18 16:41:50', 92.00, 'fit', 'Offer', 'Walk-in', 'resumes/n79nRKdVawxHI19PJTpWpa8nQwAA3TCJa99VdmQh.jpg', NULL, 'Added via image (OCR) screening — e731c965-945f-48cb-9f96-8efa53a49cfefile_2865782.jpg.', '[]', '2026-08-18 08:41:50', '2026-08-18 08:48:26'),
(23, 'APL-01048', 1, 'bcbc', 'bcbc@mga.com', '0912312300', '2026-08-18 16:47:03', 80.00, 'fit', 'Hired', 'Online Portal', 'resumes/dmhkkMKpzNOKty5Epy3XHX7hJZFy1SpCMxiWjzxY.pdf', NULL, 'Added via document screening — Handout-TABLE-OF-RULES-OF-INFERENCE (1).pdf.', '[]', '2026-08-18 08:47:03', '2026-08-18 10:43:06'),
(24, 'APL-01049', 1, 'f1', 'f1@gmail.com', '0912312300', '2026-08-18 18:47:16', 80.00, 'fit', 'Accepted', 'Online Portal', 'resumes/ymPioYX9roI8L6MTY8KwTegjgXJDZmKuDTchTc3C.pdf', NULL, 'Added via document screening — ulit.pdf.', '[]', '2026-08-18 10:47:16', '2026-08-18 11:29:42'),
(25, 'APL-01050', 1, 'Andrew e', 'hahakdoghahalaman890@gmail.com', '0912332199', '2026-08-22 13:01:19', 87.00, 'fit', 'Screened', 'Walk-in', 'resumes/SeXqrbhLez21NwJ2E2OfLuAjet4MNdMZvVty6YZl.jpg', NULL, 'Added via image (OCR) screening — avatar_Luffy_2_7a08f9d75e.jpg.', '[]', '2026-08-22 05:01:19', '2026-08-22 11:29:29'),
(27, 'APL-01051', 5, 'MARIA SANTOS', 'maria.santos@email.com', '0917 555 1234', '2026-08-22 23:51:52', 100.00, 'fit', 'Screened', 'Walk-in', 'resumes/7EcegIBFi8XAPmH3OVZPLp7NX8MmErUEFNMeNmAh.pdf', NULL, 'Matched skills: Cash Handling, Guest Relations, Inventory Control, Mixology; Education requirement satisfied; Experience requirement satisfied (5.0 yrs vs 3.0 yrs required); All required certifications matched — meets Bartender requirements.', '[]', '2026-08-22 15:51:52', '2026-08-22 15:51:53'),
(29, 'APL-01052', 1, 'MARIA SANTOS', 'maria.santos@email.com', '0917 555 1234', '2026-08-23 01:09:11', 57.00, 'not-fit', 'Screened', 'Online Portal', 'resumes/Fbgd3ui5d1fWrS8R7ORcZJdkIYK15iCs6lhrFxpg.pdf', NULL, 'Experience requirement satisfied (5.0 yrs vs 1.0 yrs required); No certification requirements defined for this role — meets Bartender requirements. No available position achieved the required qualification level.', '[]', '2026-08-22 17:09:11', '2026-08-22 17:09:11'),
(30, 'APL-01053', 6, 'Basil Fawty', 'basilfawty@gmail.com', '0912332188', '2026-08-23 02:31:15', 42.00, 'not-fit', 'Screened', 'Walk-in', 'resumes/ANuF0uAo99kwaoiKAdtaYD68UNtrVt7pUcBa35sz.jpg', NULL, 'Education requirement satisfied; No certification requirements defined for this role — meets HR Assistant requirements. No available position achieved the required qualification level.', '[\"Unrecognized skill: TRAVELING i\",\"Missing: email\",\"Missing: phone\"]', '2026-08-22 18:31:15', '2026-08-22 18:31:16'),
(31, 'APL-01054', 1, 'Julian Rivera', 'julian.rivera@email.com', '+1 (555) 342-8891', '2026-08-23 17:50:39', 79.00, 'not-fit', 'Screened', 'Online Portal', 'resumes/Py2cHfJqTJUANHfQs3fmqRPQvuk8tKPA3u5bmyjZ.pdf', NULL, 'Matched skills: Customer Service; Education requirement satisfied; Experience requirement satisfied (3.8 yrs vs 1.0 yrs required); No certification requirements defined for this role — meets Bartender requirements. No available position achieved the required qualification level.', '[\"Unrecognized skill: CGarvicea Fyrallancea\",\"Unrecognized skill: Ciiide Stand\",\"Unrecognized skill: Guest Recovery\",\"Unrecognized skill: Hospitality Systems\",\"Unrecognized skill: Manager, First\",\"Unrecognized skill: Office Suite\",\"Unrecognized skill: Oracle Hosp\",\"Unrecognized skill: Professional Certifications\",\"Unrecognized skill: Service Excellence\",\"Unrecognized skill: stay surveys\",\"Unrecognized skill: the Night Audit\",\"Unrecognized job role: Beach,\",\"Unrecognized job role: F&B team\",\"Unrecognized job role: Five-Diamond properties\",\"Unrecognized job role: Front Office Intern\",\"Unrecognized job role: Housekeeping and Engineering\",\"Unrecognized job role: ServSafe Food\",\"Unrecognized job role: The Ritz-Carlton,\",\"Unrecognized job role: Upselling Techniques\"]', '2026-08-23 09:50:39', '2026-08-23 09:50:39'),
(32, 'APL-01055', 6, 'Lorenzo Miguel Santiago', 'lorenzo.santiago@culinarymail.com', '09087743312', '2026-08-25 19:52:46', 62.00, 'fit', 'Screened', 'Online Portal', 'resumes/U4egKaOlKu1lF3Br2GkGMlEM3VMcxKWDoyW0qmQi.pdf', NULL, 'Experience requirement satisfied (7.5 yrs vs 1.0 yrs required); No certification requirements defined for this role — meets Front Desk Receptionist requirements. No available position achieved the required qualification level.', '[\"Unrecognized job role: Fairmont Makati\",\"Referred to HR Assistant\"]', '2026-08-25 11:52:46', '2026-08-25 12:05:10'),
(33, 'APL-01056', 16, 'ALYSSA MARIE', '5678alyssa.valdez.spa@gmail.com', '09172345678', '2026-08-25 19:59:05', 100.00, 'fit', 'Screened', 'Online Portal', 'resumes/mxbdGZSqRwL4UtGOEZJcLQ7GBFmesbOneu8prDQ3.pdf', NULL, 'Matched skills: Cash Handling, Check-in / Check-out, Guest Relations, Property Management Systems, Reservations; Education requirement satisfied; Experience requirement satisfied (3.75 yrs vs 1.0 yrs required); No certification requirements defined for this role — meets Front Desk Receptionist requirements.', '[\"Unrecognized skill: Payment Processing\",\"Unrecognized skill: Spa Reception\",\"Unrecognized job role: Spa Front Desk Associate\"]', '2026-08-25 11:59:05', '2026-08-25 11:59:06'),
(34, 'APL-01057', 16, 'MARIA ANGELA SANTOS', 'maria.santos.hospitality@gmail.com', '09172456183', '2026-08-25 20:11:13', 100.00, 'fit', 'Rejected', 'Online Portal', 'resumes/OsWIuRb88xSIB9f9uXLpdScTXz5FD7QZhMWNVyWM.pdf', NULL, 'Matched skills: Cash Handling, Check-in / Check-out, Guest Relations, Property Management Systems, Reservations; Education requirement satisfied; Experience requirement satisfied (5.0 yrs vs 1.0 yrs required); No certification requirements defined for this role — meets Front Desk Receptionist requirements.', '[\"Unrecognized skill: Payment Processing\",\"Unrecognized job role: Hotel Front Desk Associate\",\"Unrecognized job role: confirm satisfaction\"]', '2026-08-25 12:11:13', '2026-08-31 13:38:28'),
(35, 'APL-01058', 16, 'Marielle Anne Santos', 'marielle.santos.fbcontrol@gmail.com', '09186632947', '2026-08-25 20:58:53', 72.00, 'not-fit', 'Screened', 'Online Portal', 'resumes/QcyyG24q07YuzWghzVTF0ZiJoYQEaPIjcse2oUdF.pdf', NULL, 'Education requirement satisfied; Experience requirement satisfied (7.5 yrs vs 1.0 yrs required); No certification requirements defined for this role — meets Front Desk Receptionist requirements. No available position achieved the required qualification level.', '[\"Unrecognized skill: Basic\",\"Unrecognized skill: Cost Accounting\",\"Unrecognized skill: Cross-Functional Team Coordination\",\"Unrecognized skill: MarketMan\",\"Unrecognized skill: Materials Control Software\",\"Unrecognized skill: Physical Inventory Counting\",\"Unrecognized skill: Supplier Delivery Verification\",\"Unrecognized skill: Waste & Spoilage Tracking\",\"Unrecognized job role: Caf\\u00e9 Verano Manila\",\"Unrecognized job role: retraining\"]', '2026-08-25 12:58:53', '2026-08-25 12:58:53'),
(36, 'APL-01059', 16, 'NICOLE FRANCES HERRERA', 'nicole.herrera.recreation@gmail.com', '09196781234', '2026-08-25 21:00:33', 83.20, 'other-role', 'Screened', 'Online Portal', 'resumes/E789K4ueKMncdcwZUm0d2OTLJa0OAqvVRt8AvikA.pdf', NULL, 'Matched skills: Check-in / Check-out, Guest Relations; Education requirement satisfied; Experience requirement satisfied (5.0 yrs vs 1.0 yrs required); No certification requirements defined for this role — meets Front Desk Receptionist requirements.', '[\"Unrecognized job role: Hotel Recreation and Activities Coordinator\",\"Stronger match: Bartender (88.8%)\"]', '2026-08-25 13:00:33', '2026-08-25 13:00:33'),
(37, 'APL-01060', 16, 'PATRICIA ANNE MENDOZA', 'patriciamendoza.hr@example.cor', '09174821936', '2026-08-25 21:02:20', 72.00, 'not-fit', 'Screened', 'Walk-in', 'resumes/SkNcb7oYfeOmuMpdkWxP537hMbD5Z9g6gCvlOVig.png', NULL, 'Education requirement satisfied; Experience requirement satisfied (5.9 yrs vs 1.0 yrs required); No certification requirements defined for this role — meets Front Desk Receptionist requirements. No available position achieved the required qualification level.', '[]', '2026-08-25 13:02:20', '2026-08-25 13:02:20'),
(38, 'APL-01061', 16, 'RAFAEL DOMINIC LIM', 'rafael.lim.fnb@gmail.com', '09184567890', '2026-08-25 21:04:12', 77.60, 'not-fit', 'Screened', 'Walk-in', 'resumes/MXXrhii8YalTsD7kT6No86l27JXnKNIwenZwtDBD.jpg', NULL, 'Matched skills: Cash Handling; Education requirement satisfied; Experience requirement satisfied (5.8 yrs vs 1.0 yrs required); No certification requirements defined for this role — meets Front Desk Receptionist requirements. No available position achieved the required qualification level.', '[\"Unrecognized job role: Beverage Service Specialist\",\"Unrecognized job role: The Marigold Hotel Restaurant\",\"Unrecognized job role: in monthly incremental revenue\"]', '2026-08-25 13:04:12', '2026-08-25 13:04:13'),
(39, 'APL-01062', 16, 'Roberto James Castillo', 'roberto.castillo.laundry@gmail.com', '09193375502', '2026-08-25 21:13:41', 62.00, 'not-fit', 'Screened', 'Online Portal', 'resumes/L5bWDLh1mJreR6s5PHknU2dIFUlTAR1DjssSpeOa.docx', NULL, 'Experience requirement satisfied (7.5 yrs vs 1.0 yrs required); No certification requirements defined for this role — meets Front Desk Receptionist requirements. No available position achieved the required qualification level.', '[\"Unrecognized skill: Hygiene\",\"Unrecognized skill: Laundry Quality Control\",\"Unrecognized skill: Staff Supervision\",\"Unrecognized skill: Team Leadership\",\"Unrecognized skill: Uniform Management\"]', '2026-08-25 13:13:41', '2026-08-25 13:13:41'),
(40, 'APL-01063', 16, 'Roberto James Castillo', 'roberto.castillo.laundry@gmail.com', '09193375502', '2026-08-25 21:20:15', 62.00, 'not-fit', 'Screened', 'Online Portal', 'resumes/EyvXKY3tZjAz63gu1Q0bgfn6C9xG77SVczgUSFZF.docx', NULL, 'Experience requirement satisfied (7.5 yrs vs 1.0 yrs required); No certification requirements defined for this role — meets Front Desk Receptionist requirements. No available position achieved the required qualification level.', '[\"Unrecognized skill: Hygiene\",\"Unrecognized skill: Laundry Quality Control\",\"Unrecognized skill: Staff Supervision\",\"Unrecognized skill: Team Leadership\",\"Unrecognized skill: Uniform Management\"]', '2026-08-25 13:20:15', '2026-08-25 13:20:15'),
(41, 'APL-01064', 16, 'Samantha Nicole Dela Cruz', 'samantha.delacruz.fnb@gmail.com', '09186642317', '2026-08-25 21:20:53', 83.20, 'not-fit', 'Screened', 'Online Portal', 'resumes/jXVxN4fGBILIhFbng3vhXSAb65KlMmqGQ1CcASVk.pdf', NULL, 'Matched skills: Cash Handling, Guest Relations; Education requirement satisfied; Experience requirement satisfied (7.5 yrs vs 1.0 yrs required); No certification requirements defined for this role — meets Front Desk Receptionist requirements. No available position achieved the required qualification level.', '[\"Unrecognized job role: Copper & Vine Restaurant and Lounge\",\"Unrecognized job role: The Ember Room, Aurelia Hotel Manila\"]', '2026-08-25 13:20:53', '2026-08-25 13:20:53'),
(42, 'APL-01065', 16, 'Vincent Paul Soriano', 'vincent.soriano.hotel@gmail.com', '09172458813', '2026-08-25 21:42:45', 100.00, 'fit', 'Accepted', 'Online Portal', 'resumes/YVPqKQsG9a36IIZNZ7oSgKdxWFAIRbafZqBiKFK0.docx', 'Vincent_Paul_Soriano_Night_Auditor.docx', 'Matched skills: Cash Handling, Check-in / Check-out, Guest Relations, Property Management Systems, Reservations; Education requirement satisfied; Experience requirement satisfied (5.0 yrs vs 1.0 yrs required); No certification requirements defined for this role — meets Front Desk Receptionist requirements.', '[\"Unrecognized skill: Cash Reconciliation\",\"Unrecognized skill: Hotel Reservation Systems\",\"Unrecognized skill: Night Audit Procedures\",\"Unrecognized skill: Payment Processing\",\"Unrecognized job role: Front Desk Associate\",\"Unrecognized job role: Hotel Night Auditor\"]', '2026-08-25 13:42:45', '2026-08-31 11:49:35'),
(43, 'APL-01066', 16, 'ANGELA MARIE CRUZ', 'angela.cruz.fnb@gmail.com', '09063728841', '2026-08-25 21:45:32', 57.60, 'not-fit', 'Screened', 'Walk-in', 'resumes/oK2JmshYE5YjMS72pCehD2001Hr7glSkBIVMJfWr.png', 'Angela_Cruz_Restaurant_Server_Resume.png', 'Matched skills: Cash Handling; Experience requirement satisfied (3.75 yrs vs 1.0 yrs required); No certification requirements defined for this role — meets Front Desk Receptionist requirements. No available position achieved the required qualification level.', '[\"Unrecognized job role: Cloudwater Coffee Roasters\"]', '2026-08-25 13:45:32', '2026-08-25 13:45:32'),
(44, 'APL-01067', 16, 'Bianca Louise Garcia', 'bianca.garcia.qa@gmail.com', '09186624471', '2026-08-25 21:47:37', 72.00, 'not-fit', 'Rejected', 'Online Portal', 'resumes/z8IdXBsIbq5v0xGoMXxDTUCywQBCvT5Y9ijLhly0.docx', 'Bianca_Louise_Garcia_QA_Food_Safety.docx', 'Education requirement satisfied; Experience requirement satisfied (6.25 yrs vs 1.0 yrs required); No certification requirements defined for this role — meets Front Desk Receptionist requirements. No available position achieved the required qualification level.', '[\"Unrecognized skill: Food Handling Standards\",\"Unrecognized skill: Internal Auditing\",\"Unrecognized skill: Quality Assurance\",\"Unrecognized skill: Restaurant Compliance\",\"Unrecognized job role: Food Safety Officer\",\"Unrecognized job role: Restaurant Quality Assurance Officer\"]', '2026-08-25 13:47:37', '2026-08-31 13:38:50'),
(45, 'APL-01068', 16, 'ALYSSA MARIE', '5678alyssa.valdez.spa@gmail.com', '09172345678', '2026-08-26 02:04:44', 100.00, 'fit', 'Accepted', 'Online Portal', 'resumes/tf2QxEZ8CkmibdYeEzPvRfAlPriNqxxGE0d9nMUn.pdf', 'Alyssa_Marie_Valdez_Spa_Wellness_Receptionist.pdf', 'Matched skills: Cash Handling, Check-in / Check-out, Guest Relations, Property Management Systems, Reservations; Education requirement satisfied; Experience requirement satisfied (3.75 yrs vs 1.0 yrs required); No certification requirements defined for this role — meets Front Desk Receptionist requirements.', '[\"Unrecognized skill: Payment Processing\",\"Unrecognized skill: Spa Reception\",\"Unrecognized job role: Spa Front Desk Associate\"]', '2026-08-25 18:04:44', '2026-08-31 11:30:08'),
(46, 'APL-01069', 16, 'Vincent Paul Soriano', 'vincent.soriano.hotel@gmail.com', '09172458813', '2026-08-26 02:33:18', 84.00, 'fit', 'Offer', 'Online Portal', 'resumes/6Pl9O0xaU2b7fZD9PrKz5ukMFETrw1OSjHLHplbU.pdf', 'Vincent_Paul_Soriano_Night_Auditor.pdf', 'Matched skills: Cash Handling, Check-in / Check-out, Guest Relations, Property Management Systems, Reservations; Education requirement satisfied; Experience requirement satisfied (5.0 yrs vs 1.0 yrs required); No certification requirements defined for this role — meets Front Desk Receptionist requirements.', '[\"Unrecognized skill: Cash Reconciliation\",\"Unrecognized skill: Hotel Reservation Systems\",\"Unrecognized skill: Night Audit Procedures\",\"Unrecognized skill: Payment Processing\",\"Unrecognized job role: Bayview Suites & Residences\",\"Unrecognized job role: Hotel Night Auditor\",\"Unrecognized job role: with on-duty staff\"]', '2026-08-25 18:33:18', '2026-08-31 12:52:38'),
(47, 'APP-01042', 16, 'Test Applicant', 'test.applicant.1787743495635@example.com', '09171234567', '2026-08-26 03:24:58', NULL, 'fit', 'Accepted', 'Landing Page', NULL, NULL, '', NULL, '2026-08-26 03:24:58', '2026-08-31 15:41:37'),
(53, 'APL-01070', 6, 'ALYSSA MARIE', '5678alyssa.valdez.spa@gmail.com', '09172345678', '2026-08-30 23:09:41', 79.00, 'other-role', 'Accepted', 'Online Portal', 'resumes/0Xq3Y9KLcCf799zUQrge4lr76Ez8k6dQPCrq1apa.pdf', 'Alyssa_Marie_Valdez_Spa_Wellness_Receptionist.pdf', 'Matched skills: MS Office; Education requirement satisfied; Experience requirement satisfied (3.75 yrs vs 1.0 yrs required); No certification requirements defined for this role — meets HR Assistant requirements.', '[\"Unrecognized skill: Payment Processing\",\"Unrecognized skill: Spa Reception\",\"Unrecognized job role: Spa Front Desk Associate\",\"Stronger match: Guest Relations Officer (1%)\"]', '2026-08-30 15:09:41', '2026-08-31 11:34:13'),
(54, 'APL-01071', 3, 'Adrian Paolo Mercado', 'adrian.mercado.hk@gmail.com', '09396620148', '2026-08-31 20:15:27', 81.33, 'not-fit', 'Interview Scheduled', 'Online Portal', 'resumes/AZAuPRaYXrVteGxXizdi3CE85b8KWOV74qShlBjY.pdf', 'Adrian_Paolo_Mercado_Housekeeping_Operations_Manager.pdf', 'Matched skills: Room Turnover; Education requirement satisfied; Experience requirement satisfied (11.25 yrs vs 0.0 yrs required); No certification requirements defined for this role — meets Housekeeping Attendant requirements. No available position achieved the required qualification level.', '[\"Unrecognized skill: Cleaning Standards & SOPs\",\"Unrecognized skill: Cross-Department Coordination\",\"Unrecognized skill: Linen & Amenity Coordination\",\"Unrecognized skill: Occupational Health & Safety\",\"Unrecognized skill: Operational Planning\",\"Unrecognized skill: Staff Supervision & Development\",\"Unrecognized skill: Training Program Development\",\"Unrecognized job role: Isla Verde Beach Resort\",\"Unrecognized job role: Tanawin Cove Resort\"]', '2026-08-31 12:15:27', '2026-08-31 12:17:36'),
(55, 'APL-01072', 2, 'CARLO MIGUEL FERNAN', 'carlo.fernandez.chef@gmail.com', '09284417702', '2026-08-31 20:56:08', 80.00, 'fit', 'Offer', 'Walk-in', 'resumes/4bwV5Tus6NezrAu6LUsbv6XTOKxfD7b11YUnO9vg.png', 'Carlo_Miguel_Fernandez_Kitchen_Supervisor_Resume.png', 'Matched skills: Food Safety, HACCP, Knife Skills, Plating; Education requirement satisfied; Experience requirement satisfied (6.25 yrs vs 1.0 yrs required) — meets Line Cook requirements.', '[\"Unrecognized job role: Bistro Verde Restaurant Group\",\"Unrecognized job role: period through improved par-level tracking\",\"Referred to Line Cook\"]', '2026-08-31 12:56:08', '2026-08-31 12:58:44'),
(56, 'APL-01073', 15, 'CARLO MIGUEL FERNANDEZ', 'carlo.fernandez.chef@gmail.com', '09284417702', '2026-09-01 00:26:36', 72.00, 'other-role', 'Rejected', 'Online Portal', 'resumes/nzKnJ2emZbfGBwH7UugcjQO3hXCTpugYnaHR7iuN.pdf', 'Carlo_Miguel_Fernandez_Kitchen_Supervisor_Resume.pdf', 'Education requirement satisfied; Experience requirement satisfied (6.25 yrs vs 1.0 yrs required); No certification requirements defined for this role — meets Guest Relations Officer requirements.', '[\"Unrecognized job role: Bistro Verde Restaurant Group\",\"Unrecognized job role: period through improved par-level tracking\",\"Stronger match: Line Cook (84.4%)\"]', '2026-08-31 16:26:36', '2026-08-31 16:27:14'),
(57, 'APL-01074', 15, 'NATHANIEL JAMES MERCADO', 'nathaniel.mercado.culinary@gmail.com', '09286714459', '2026-09-02 05:54:41', 72.00, 'other-role', 'Screened', 'Online Portal', 'resumes/mg4PWpUhD6MGpsnnezMtN3l3y5qUG6voocEhFMrC.pdf', 'Nathaniel_James_Mercado_Hotel_Kitchen_Operations_Supervisor.pdf', 'Education requirement satisfied; Experience requirement satisfied (11.2 yrs vs 1.0 yrs required); No certification requirements defined for this role — meets Guest Relations Officer requirements.', '[\"Stronger match: Line Cook (78.8%)\"]', '2026-09-01 21:54:41', '2026-09-01 21:54:41'),
(58, 'APL-01075', 15, 'Bianca Nicole Castillo', '0917-542-3186bianca.castillo.hospitality@gmail.com', '09175423186', '2026-09-02 06:19:43', 86.00, 'other-role', 'Interview Scheduled', 'Online Portal', 'resumes/l1dGsI82cqW7F7sSy6fzdbThLMa3oyBcYe32oi1Q.pdf', 'Bianca_Nicole_Castillo_Hotel_Reservations_Supervisor.pdf', 'Matched skills: Front Office Operations, Reservations; Education requirement satisfied; Experience requirement satisfied (8.75 yrs vs 1.0 yrs required); No certification requirements defined for this role — meets Guest Relations Officer requirements.', '[\"Unrecognized skill: Group booking coordination Rate\",\"Unrecognized skill: mentoring\",\"Stronger match: Front Desk Receptionist (88.8%)\"]', '2026-09-01 22:19:43', '2026-09-01 22:21:20'),
(59, 'APL-01076', 16, 'Camille Rose Evangelista', 'camille.evangelista.spa@gmail.com', '09953182647', '2026-09-02 08:05:05', 80.00, 'not-fit', 'Offer', 'Online Portal', 'resumes/vhbQA7vo0NwOUcdcJEWnHALlqqkgBKP0jEaKGpP6.pdf', 'Camille_Rose_Evangelista_Resort_Spa_Operations_Supervisor.pdf', 'Matched skills: Guest Relations; Education requirement satisfied; Experience requirement satisfied (8.75 yrs vs 1.0 yrs required); No certification requirements defined for this role — meets Front Desk Receptionist requirements. No available position achieved the required qualification level.', '[\"Unrecognized skill: Spa operations management\",\"Unrecognized skill: Therapist capacity planning\",\"Unrecognized skill: onboarding\",\"Unrecognized job role: Spa and Wellness Operations Coordinator\",\"Unrecognized job role: Wellness Services Associate\"]', '2026-09-02 00:05:05', '2026-09-02 00:05:29');

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
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
(10, 24, 5, '2026-08-19', '{\"Guest Service Orientation\":4,\"Communication Skills\":4,\"Technical \\/ Practical Skill\":4,\"Grooming & Professionalism\":4,\"Availability & Flexibility\":4}', 80.00, 'Recommended', 'ggg', '2026-08-18 10:47:57', '2026-08-18 10:47:57'),
(11, 46, 3, '2026-09-01', '{\"Guest Service Orientation\":5,\"Communication Skills\":5,\"Technical \\/ Practical Skill\":3,\"Grooming & Professionalism\":4,\"Availability & Flexibility\":4}', 84.00, 'Recommended', 'try', '2026-08-31 12:47:29', '2026-08-31 12:47:29'),
(12, 55, 3, '2026-09-01', '{\"Guest Service Orientation\":4,\"Communication Skills\":4,\"Technical \\/ Practical Skill\":4,\"Grooming & Professionalism\":4,\"Availability & Flexibility\":4}', 80.00, 'Recommended', 'ge', '2026-08-31 12:57:38', '2026-08-31 12:57:38'),
(13, 15, NULL, '2026-09-01', '{\"Guest Service Orientation\":4,\"Communication Skills\":4,\"Technical \\/ Practical Skill\":4,\"Grooming & Professionalism\":4,\"Availability & Flexibility\":4}', 80.00, 'Recommended', 'No remarks recorded.', '2026-08-31 13:34:35', '2026-08-31 13:34:35'),
(14, 10, 3, '2026-09-02', '{\"Guest Service Orientation\":4,\"Communication Skills\":4,\"Technical \\/ Practical Skill\":4,\"Grooming & Professionalism\":4,\"Availability & Flexibility\":4}', 80.00, 'Recommended', 'No remarks recorded.', '2026-09-02 00:04:02', '2026-09-02 00:04:02'),
(15, 59, 3, '2026-09-02', '{\"Guest Service Orientation\":4,\"Communication Skills\":4,\"Technical \\/ Practical Skill\":4,\"Grooming & Professionalism\":4,\"Availability & Flexibility\":4}', 80.00, 'Recommended', 'No remarks recorded.', '2026-09-02 00:05:27', '2026-09-02 00:05:27');

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
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `applicant_screenings`
--

INSERT INTO `applicant_screenings` (`screening_id`, `applicant_id`, `job_post_id`, `processing_status`, `screening_result`, `match_score`, `score_breakdown_json`, `profile_json`, `entities_json`, `missing_information_json`, `validation_json`, `alternative_job_json`, `reasons_json`, `model_info_json`, `error_message`, `processed_at`, `created_at`, `updated_at`) VALUES
(2, 27, 5, 'PROCESSED', 'fit', 100.00, '{\"skills\":{\"weight\":0.4,\"earned\":40,\"max\":40,\"matched_required\":[\"Cash Handling\",\"Guest Relations\",\"Inventory Control\",\"Mixology\"],\"missing_required\":[],\"matched_preferred\":[],\"missing_preferred\":[],\"required_coverage\":1,\"preferred_coverage\":1},\"experience\":{\"weight\":0.3,\"earned\":30,\"max\":30,\"estimated_years\":5,\"min_years_required\":3,\"requirement_met\":true},\"education\":{\"weight\":0.2,\"earned\":20,\"max\":20,\"applicant_highest_level\":[\"Vocational \\/ TESDA Bartending Course\"],\"required_level\":\"Vocational \\/ TESDA\",\"requirement_met\":true},\"certifications\":{\"weight\":0.1,\"earned\":10,\"max\":10,\"matched\":[\"TESDA Bartending NC II\"],\"missing\":[],\"no_requirements\":false}}', '{\"personal_information\":{\"name\":\"MARIA SANTOS\",\"email\":\"maria.santos@email.com\",\"phone\":\"0917 555 1234\"},\"education\":[\"Vocational \\/ TESDA Bartending Course\"],\"work_experience\":[{\"job_title\":\"Bartender\",\"period\":\"Mar 2021 - Present\",\"recognized_role\":true}],\"skills\":[\"Cash Handling\",\"Guest Relations\",\"Inventory Control\",\"Mixology\",\"Responsible Alcohol Service\"],\"certifications\":[\"TESDA Bartending NC II\"],\"estimated_years_experience\":5,\"job_roles\":{\"recognized\":[\"Bartender\"],\"unrecognized\":[]},\"unrecognized_skills\":[]}', '[{\"label\":\"PERSON\",\"value\":\"MARIA SANTOS\",\"source\":\"custom_ner\"},{\"label\":\"EDUCATION\",\"value\":\"Vocational \\/ TESDA Bartending Course\",\"source\":\"custom_ner\"},{\"label\":\"JOB_TITLE\",\"value\":\"Bartender\",\"source\":\"custom_ner\"},{\"label\":\"SKILL\",\"value\":\"Inventory Control\",\"source\":\"custom_ner\"},{\"label\":\"SKILL\",\"value\":\"Mixology\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Guest Relations\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Cash Handling\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Responsible Alcohol Service\",\"source\":\"reference_scan\"},{\"label\":\"CERTIFICATION\",\"value\":\"TESDA Bartending NC II\",\"source\":\"section_rule\"},{\"label\":\"ORGANIZATION\",\"value\":\"Bartender - Sky Lounge BGC\",\"source\":\"spacy_base\"},{\"label\":\"EMAIL\",\"value\":\"maria.santos@email.com\",\"source\":\"regex\"},{\"label\":\"PHONE\",\"value\":\"0917 555 1234\",\"source\":\"regex\"}]', '[]', '{\"missing_information\":[],\"invalid_format\":[],\"skill_analysis\":{\"recognized\":[\"Cash Handling\",\"Guest Relations\",\"Inventory Control\",\"Mixology\",\"Responsible Alcohol Service\"],\"unrecognized\":[]},\"job_role_analysis\":{\"recognized\":[\"Bartender\"],\"unrecognized\":[]},\"credential_analysis\":[{\"required\":\"TESDA Bartending NC II\",\"status\":\"RECOGNIZED\",\"matched_value\":\"TESDA Bartending NC II\"}],\"credential_issues\":[],\"review_flags\":[]}', NULL, '[\"Overall match score 100.0% reached the required threshold of 75.0% for Bartender.\",\"Matched required skills: Cash Handling, Guest Relations, Inventory Control, Mixology.\",\"Education requirement met: True; experience requirement met: True (5.0 yrs vs 3.0 yrs minimum).\"]', '{\"base_model\":\"en_core_web_sm\",\"custom_ner_loaded\":true,\"custom_ner_path\":\"C:\\\\Users\\\\PC\\\\Downloads\\\\Ferdi\\\\4TH_YR\\\\DEV\\\\v4\\\\2nd-repo-for-hrms-backend-\\\\nlp-service\\\\models_spacy\\\\role_specific_ner\"}', NULL, '2026-08-22 15:51:52', '2026-08-22 15:51:52', '2026-08-22 15:51:52'),
(4, 29, 1, 'PROCESSED', 'not-fit', 57.00, '{\"skills\":{\"weight\":0.4,\"earned\":12,\"max\":40,\"matched_required\":[],\"missing_required\":[\"Communication\",\"Customer Service\",\"Hotel Operations\",\"Problem Solving\"],\"matched_preferred\":[],\"missing_preferred\":[],\"required_coverage\":0,\"preferred_coverage\":1},\"experience\":{\"weight\":0.3,\"earned\":30,\"max\":30,\"estimated_years\":5,\"min_years_required\":1,\"requirement_met\":true},\"education\":{\"weight\":0.2,\"earned\":5,\"max\":20,\"applicant_highest_level\":[\"Vocational \\/ TESDA Bartending Course\"],\"required_level\":\"Bachelor\'s Degree\",\"requirement_met\":false},\"certifications\":{\"weight\":0.1,\"earned\":10,\"max\":10,\"matched\":[],\"missing\":[],\"no_requirements\":true}}', '{\"personal_information\":{\"name\":\"MARIA SANTOS\",\"email\":\"maria.santos@email.com\",\"phone\":\"0917 555 1234\"},\"education\":[\"Vocational \\/ TESDA Bartending Course\"],\"work_experience\":[{\"job_title\":\"Bartender\",\"period\":\"Mar 2021 - Present\",\"recognized_role\":true}],\"skills\":[\"Cash Handling\",\"Guest Relations\",\"Inventory Control\",\"Mixology\",\"Responsible Alcohol Service\"],\"certifications\":[\"TESDA Bartending NC II\"],\"estimated_years_experience\":5,\"job_roles\":{\"recognized\":[\"Bartender\"],\"unrecognized\":[]},\"unrecognized_skills\":[]}', '[{\"label\":\"PERSON\",\"value\":\"MARIA SANTOS\",\"source\":\"custom_ner\"},{\"label\":\"EDUCATION\",\"value\":\"Vocational \\/ TESDA Bartending Course\",\"source\":\"custom_ner\"},{\"label\":\"JOB_TITLE\",\"value\":\"Bartender\",\"source\":\"custom_ner\"},{\"label\":\"SKILL\",\"value\":\"Inventory Control\",\"source\":\"custom_ner\"},{\"label\":\"SKILL\",\"value\":\"Mixology\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Guest Relations\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Cash Handling\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Responsible Alcohol Service\",\"source\":\"reference_scan\"},{\"label\":\"CERTIFICATION\",\"value\":\"TESDA Bartending NC II\",\"source\":\"section_rule\"},{\"label\":\"ORGANIZATION\",\"value\":\"Bartender - Sky Lounge BGC\",\"source\":\"spacy_base\"},{\"label\":\"EMAIL\",\"value\":\"maria.santos@email.com\",\"source\":\"regex\"},{\"label\":\"PHONE\",\"value\":\"0917 555 1234\",\"source\":\"regex\"}]', '[]', '{\"missing_information\":[],\"invalid_format\":[],\"skill_analysis\":{\"recognized\":[\"Cash Handling\",\"Guest Relations\",\"Inventory Control\",\"Mixology\",\"Responsible Alcohol Service\"],\"unrecognized\":[]},\"job_role_analysis\":{\"recognized\":[\"Bartender\"],\"unrecognized\":[]},\"credential_analysis\":[],\"credential_issues\":[],\"review_flags\":[]}', NULL, '[\"Education does not meet the requirement of the applied job.\",\"Required-skills coverage 0% is below the 60% minimum. Missing: Communication, Customer Service, Hotel Operations, Problem Solving.\",\"Overall score 57.0% is below the 75.0% threshold.\",\"Alternative job analysis found no eligible open positions.\"]', '{\"base_model\":\"en_core_web_sm\",\"custom_ner_loaded\":true,\"custom_ner_path\":\"C:\\\\Users\\\\PC\\\\Downloads\\\\Ferdi\\\\4TH_YR\\\\DEV\\\\v4\\\\2nd-repo-for-hrms-backend-\\\\nlp-service\\\\models_spacy\\\\role_specific_ner\"}', NULL, '2026-08-22 17:09:11', '2026-08-22 17:09:11', '2026-08-22 17:09:11'),
(5, 30, 6, 'PARTIALLY_PROCESSED', 'not-fit', 42.00, '{\"skills\":{\"weight\":0.4,\"earned\":12,\"max\":40,\"matched_required\":[],\"missing_required\":[\"Confidentiality\",\"MS Office\",\"Records Documentation\",\"Recruitment Support\"],\"matched_preferred\":[],\"missing_preferred\":[],\"required_coverage\":0,\"preferred_coverage\":1},\"experience\":{\"weight\":0.3,\"earned\":0,\"max\":30,\"estimated_years\":0,\"min_years_required\":1,\"requirement_met\":false},\"education\":{\"weight\":0.2,\"earned\":20,\"max\":20,\"applicant_highest_level\":[\"Bachelor\'s in Hospitality Management\"],\"required_level\":\"Bachelor\'s Degree\",\"requirement_met\":true},\"certifications\":{\"weight\":0.1,\"earned\":10,\"max\":10,\"matched\":[],\"missing\":[],\"no_requirements\":true}}', '{\"personal_information\":{\"name\":\"HosPIALTY MANAGER\",\"email\":null,\"phone\":null},\"education\":[\"Bachelor\'s in Hospitality Management\"],\"work_experience\":[],\"skills\":[\"Plating\"],\"certifications\":[],\"estimated_years_experience\":0,\"job_roles\":{\"recognized\":[],\"unrecognized\":[]},\"unrecognized_skills\":[\"TRAVELING i\"]}', '[{\"label\":\"PERSON\",\"value\":\"HosPIALTY MANAGER\",\"source\":\"custom_ner\"},{\"label\":\"EDUCATION\",\"value\":\"Bachelor\'s in Hospitality Management\",\"source\":\"custom_ner\"},{\"label\":\"SKILL\",\"value\":\"TRAVELING i\",\"source\":\"custom_ner\"},{\"label\":\"SKILL\",\"value\":\"Plating\",\"source\":\"reference_scan\"},{\"label\":\"ORGANIZATION\",\"value\":\"Hecdhlas GOURMET NIGHT @ Restaurant\",\"source\":\"spacy_base\"}]', '[\"email\",\"phone\"]', '{\"missing_information\":[\"email\",\"phone\"],\"invalid_format\":[],\"skill_analysis\":{\"recognized\":[\"Plating\"],\"unrecognized\":[\"TRAVELING i\"]},\"job_role_analysis\":{\"recognized\":[],\"unrecognized\":[]},\"credential_analysis\":[],\"credential_issues\":[],\"review_flags\":[]}', NULL, '[\"Estimated experience 0.0 yrs is below the 1.0 yrs minimum.\",\"Required-skills coverage 0% is below the 60% minimum. Missing: Confidentiality, MS Office, Records Documentation, Recruitment Support.\",\"Essential information missing: email, phone.\",\"Overall score 42.0% is below the 75.0% threshold.\",\"Alternative job analysis: highest-scoring open position \'Bartender\' reached only 42.0%, below the 75.0% recommendation threshold.\"]', '{\"base_model\":\"en_core_web_sm\",\"custom_ner_loaded\":true,\"custom_ner_path\":\"C:\\\\Users\\\\PC\\\\Downloads\\\\Ferdi\\\\4TH_YR\\\\DEV\\\\v4\\\\2nd-repo-for-hrms-backend-\\\\nlp-service\\\\models_spacy\\\\role_specific_ner\"}', NULL, '2026-08-22 18:31:15', '2026-08-22 18:31:15', '2026-08-22 18:31:15'),
(6, 31, 1, 'PARTIALLY_PROCESSED', 'not-fit', 79.00, '{\"skills\":{\"weight\":0.4,\"earned\":19,\"max\":40,\"matched_required\":[\"Customer Service\"],\"missing_required\":[\"Communication\",\"Hotel Operations\",\"Problem Solving\"],\"matched_preferred\":[],\"missing_preferred\":[],\"required_coverage\":0.25,\"preferred_coverage\":1},\"experience\":{\"weight\":0.3,\"earned\":30,\"max\":30,\"estimated_years\":3.8,\"min_years_required\":1,\"requirement_met\":true},\"education\":{\"weight\":0.2,\"earned\":20,\"max\":20,\"applicant_highest_level\":[\"Bachelor of\",\"Florida International University\",\"Bachelor of Science in Hospitality Management\"],\"required_level\":\"Bachelor\'s Degree\",\"requirement_met\":true},\"certifications\":{\"weight\":0.1,\"earned\":10,\"max\":10,\"matched\":[],\"missing\":[],\"no_requirements\":true}}', '{\"personal_information\":{\"name\":\"Julian Rivera\",\"email\":\"julian.rivera@email.com\",\"phone\":\"1 (655) 342-8891\"},\"education\":[\"Bachelor of\",\"Florida International University\",\"Bachelor of Science in Hospitality Management\",\"Hospitality Management\"],\"work_experience\":[],\"skills\":[\"Cash Handling\",\"Check-in \\/ Check-out\",\"Customer Service\",\"Front Office Operations\",\"Guest Relations\",\"Housekeeping Operations\",\"MS Office\",\"Property Management Systems\",\"Reservations\",\"Upselling\"],\"certifications\":[],\"estimated_years_experience\":3.8,\"job_roles\":{\"recognized\":[],\"unrecognized\":[\"Beach,\",\"F&B team\",\"Five-Diamond properties\",\"Front Office Intern\",\"Housekeeping and Engineering\",\"ServSafe Food\",\"The Ritz-Carlton,\",\"Upselling Techniques\"]},\"unrecognized_skills\":[\"CGarvicea Fyrallancea\",\"Ciiide Stand\",\"Guest Recovery\",\"Hospitality Systems\",\"Manager, First\",\"Office Suite\",\"Oracle Hosp\",\"Professional Certifications\",\"Service Excellence\",\"stay surveys\",\"the Night Audit\"]}', '[{\"label\":\"PERSON\",\"value\":\"Julian Rivera\",\"source\":\"custom_ner\"},{\"label\":\"EDUCATION\",\"value\":\"Bachelor of\",\"source\":\"custom_ner\"},{\"label\":\"EDUCATION\",\"value\":\"Florida International University\",\"source\":\"custom_ner\"},{\"label\":\"EDUCATION\",\"value\":\"Bachelor of Science in Hospitality Management\",\"source\":\"section_rule\"},{\"label\":\"EDUCATION\",\"value\":\"Hospitality Management\",\"source\":\"section_rule\"},{\"label\":\"JOB_TITLE\",\"value\":\"Five-Diamond properties\",\"source\":\"custom_ner\"},{\"label\":\"JOB_TITLE\",\"value\":\"Front Office Intern\",\"source\":\"custom_ner\"},{\"label\":\"JOB_TITLE\",\"value\":\"The Ritz-Carlton,\",\"source\":\"custom_ner\"},{\"label\":\"JOB_TITLE\",\"value\":\"Beach,\",\"source\":\"custom_ner\"},{\"label\":\"JOB_TITLE\",\"value\":\"Housekeeping and Engineering\",\"source\":\"custom_ner\"},{\"label\":\"JOB_TITLE\",\"value\":\"F&B team\",\"source\":\"custom_ner\"},{\"label\":\"JOB_TITLE\",\"value\":\"Upselling Techniques\",\"source\":\"custom_ner\"},{\"label\":\"JOB_TITLE\",\"value\":\"ServSafe Food\",\"source\":\"custom_ner\"},{\"label\":\"SKILL\",\"value\":\"Front Office Operations\",\"source\":\"custom_ner\"},{\"label\":\"SKILL\",\"value\":\"the Night Audit\",\"source\":\"custom_ner\"},{\"label\":\"SKILL\",\"value\":\"Property Management Systems\",\"source\":\"custom_ner\"},{\"label\":\"SKILL\",\"value\":\"Reservations\",\"source\":\"custom_ner\"},{\"label\":\"SKILL\",\"value\":\"stay surveys\",\"source\":\"custom_ner\"},{\"label\":\"SKILL\",\"value\":\"Oracle Hosp\",\"source\":\"custom_ner\"},{\"label\":\"SKILL\",\"value\":\"MS Office\",\"source\":\"custom_ner\"},{\"label\":\"SKILL\",\"value\":\"CGarvicea Fyrallancea\",\"source\":\"custom_ner\"},{\"label\":\"SKILL\",\"value\":\"Ciiide Stand\",\"source\":\"custom_ner\"},{\"label\":\"SKILL\",\"value\":\"Office Suite\",\"source\":\"custom_ner\"},{\"label\":\"SKILL\",\"value\":\"Service Excellence\",\"source\":\"custom_ner\"},{\"label\":\"SKILL\",\"value\":\"Guest Recovery\",\"source\":\"custom_ner\"},{\"label\":\"SKILL\",\"value\":\"Professional Certifications\",\"source\":\"custom_ner\"},{\"label\":\"SKILL\",\"value\":\"Hospitality Systems\",\"source\":\"custom_ner\"},{\"label\":\"SKILL\",\"value\":\"Manager, First\",\"source\":\"custom_ner\"},{\"label\":\"SKILL\",\"value\":\"Upselling\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Customer Service\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Guest Relations\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Check-in \\/ Check-out\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Cash Handling\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Housekeeping Operations\",\"source\":\"reference_scan\"},{\"label\":\"ORGANIZATION\",\"value\":\"Biltmore Hotel\",\"source\":\"spacy_base\"},{\"label\":\"EMAIL\",\"value\":\"julian.rivera@email.com\",\"source\":\"regex\"},{\"label\":\"PHONE\",\"value\":\"1 (655) 342-8891\",\"source\":\"regex\"}]', '[]', '{\"missing_information\":[],\"invalid_format\":[],\"skill_analysis\":{\"recognized\":[\"Cash Handling\",\"Check-in \\/ Check-out\",\"Customer Service\",\"Front Office Operations\",\"Guest Relations\",\"Housekeeping Operations\",\"MS Office\",\"Property Management Systems\",\"Reservations\",\"Upselling\"],\"unrecognized\":[\"CGarvicea Fyrallancea\",\"Ciiide Stand\",\"Guest Recovery\",\"Hospitality Systems\",\"Manager, First\",\"Office Suite\",\"Oracle Hosp\",\"Professional Certifications\",\"Service Excellence\",\"stay surveys\",\"the Night Audit\"]},\"job_role_analysis\":{\"recognized\":[],\"unrecognized\":[\"Beach,\",\"F&B team\",\"Five-Diamond properties\",\"Front Office Intern\",\"Housekeeping and Engineering\",\"ServSafe Food\",\"The Ritz-Carlton,\",\"Upselling Techniques\"]},\"credential_analysis\":[],\"credential_issues\":[],\"review_flags\":[{\"type\":\"UNRECOGNIZED_JOB_ROLE\",\"detail\":\"Beach,\",\"note\":\"Not found in system reference data; flagged for manual review only.\"},{\"type\":\"UNRECOGNIZED_JOB_ROLE\",\"detail\":\"F&B team\",\"note\":\"Not found in system reference data; flagged for manual review only.\"},{\"type\":\"UNRECOGNIZED_JOB_ROLE\",\"detail\":\"Five-Diamond properties\",\"note\":\"Not found in system reference data; flagged for manual review only.\"},{\"type\":\"UNRECOGNIZED_JOB_ROLE\",\"detail\":\"Front Office Intern\",\"note\":\"Not found in system reference data; flagged for manual review only.\"},{\"type\":\"UNRECOGNIZED_JOB_ROLE\",\"detail\":\"Housekeeping and Engineering\",\"note\":\"Not found in system reference data; flagged for manual review only.\"},{\"type\":\"UNRECOGNIZED_JOB_ROLE\",\"detail\":\"ServSafe Food\",\"note\":\"Not found in system reference data; flagged for manual review only.\"},{\"type\":\"UNRECOGNIZED_JOB_ROLE\",\"detail\":\"The Ritz-Carlton,\",\"note\":\"Not found in system reference data; flagged for manual review only.\"},{\"type\":\"UNRECOGNIZED_JOB_ROLE\",\"detail\":\"Upselling Techniques\",\"note\":\"Not found in system reference data; flagged for manual review only.\"}]}', NULL, '[\"Required-skills coverage 25% is below the 60% minimum. Missing: Communication, Hotel Operations, Problem Solving.\",\"Alternative job analysis found no eligible open positions.\"]', '{\"base_model\":\"en_core_web_sm\",\"custom_ner_loaded\":true,\"custom_ner_path\":\"C:\\\\Users\\\\PC\\\\Downloads\\\\Ferdi\\\\4TH_YR\\\\DEV\\\\v4\\\\2nd-repo-for-hrms-backend-LATEST\\\\2nd-repo-for-hrms-backend-\\\\nlp-service\\\\models_spacy\\\\role_specific_ner\"}', NULL, '2026-08-23 09:50:39', '2026-08-23 09:50:39', '2026-08-23 09:50:39'),
(7, 32, 16, 'PARTIALLY_PROCESSED', 'not-fit', 62.00, '{\"skills\":{\"weight\":0.4,\"earned\":12,\"max\":40,\"matched_required\":[],\"fuzzy_matched_required\":[],\"missing_required\":[\"Cash Handling\",\"Check-in \\/ Check-out\",\"Guest Relations\",\"Property Management Systems\",\"Reservations\"],\"matched_preferred\":[],\"missing_preferred\":[],\"required_coverage\":0,\"preferred_coverage\":1},\"experience\":{\"weight\":0.3,\"earned\":30,\"max\":30,\"estimated_years\":7.5,\"min_years_required\":1,\"requirement_met\":true},\"education\":{\"weight\":0.2,\"earned\":10,\"max\":20,\"applicant_highest_level\":[\"Diploma in Baking and Pastry Arts\"],\"required_level\":\"Bachelor\'s Degree\",\"requirement_met\":false},\"certifications\":{\"weight\":0.1,\"earned\":10,\"max\":10,\"matched\":[],\"missing\":[],\"no_requirements\":true}}', '{\"personal_information\":{\"name\":\"Lorenzo Miguel Santiago\",\"email\":\"lorenzo.santiago@culinarymail.com\",\"phone\":\"+63 908 774 3312\",\"address\":\"Pasay City, Philippines\"},\"education\":[\"Diploma in Baking and Pastry Arts\"],\"work_experience\":[{\"job_title\":\"Pastry Chef\",\"company\":\"Shangri-La at the Fort Manila\",\"location\":\"Taguig City, Philippines\",\"period\":\"May 2022 - Present\",\"recognized_role\":true},{\"job_title\":\"Pastry Chef\",\"company\":\"Pastry Cook\",\"location\":null,\"period\":\"Jul 2019 - Apr 2022\",\"recognized_role\":true},{\"job_title\":\"Fairmont Makati\",\"company\":\"Bakery Assistant\",\"location\":null,\"period\":\"Feb 2018 - Jun 2019\",\"recognized_role\":false}],\"skills\":[\"Attention to Detail\",\"Cake Decoration\",\"Food Safety\",\"HACCP\",\"Pastry and Baking\",\"Plating\",\"Teamwork\"],\"certifications\":[\"TESDA Bread and Pastry Production NC II\",\"Advanced Pastry Training\",\"C E R T I F I C At I O N S\",\"Cake Decoration And Dessert Plating Training\",\"Food Safety And Hygiene Certification\",\"Hotel Pastry Chef \\/ Pastry Cook\",\"Plated Desserts Artisan Breads Celebration Cakes Banquet Production\",\"\\ud83c\\udf70 \\ud83c\\udf63 \\ud83c\\udf82 \\u2728\"],\"unrecognized_certifications\":[\"Advanced Pastry Training\",\"C E R T I F I C At I O N S\",\"Cake Decoration And Dessert Plating Training\",\"Food Safety And Hygiene Certification\",\"Hotel Pastry Chef \\/ Pastry Cook\",\"Plated Desserts Artisan Breads Celebration Cakes Banquet Production\",\"\\ud83c\\udf70 \\ud83c\\udf63 \\ud83c\\udf82 \\u2728\"],\"estimated_years_experience\":7.5,\"job_roles\":{\"recognized\":[\"Pastry Chef\"],\"unrecognized\":[\"Fairmont Makati\"]},\"unrecognized_skills\":[]}', '[{\"label\":\"PERSON\",\"value\":\"Lorenzo Miguel Santiago\",\"source\":\"rule\"},{\"label\":\"EDUCATION\",\"value\":\"Diploma in Baking and Pastry Arts\",\"source\":\"section_rule\"},{\"label\":\"JOB_TITLE\",\"value\":\"Pastry Chef\",\"source\":\"section_rule\"},{\"label\":\"JOB_TITLE\",\"value\":\"Fairmont Makati\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Attention to Detail\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Cake Decoration\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Food Safety\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"HACCP\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Pastry and Baking\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Plating\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Teamwork\",\"source\":\"reference_scan\"},{\"label\":\"CERTIFICATION\",\"value\":\"C E R T I F I C At I O N S\",\"source\":\"section_rule\"},{\"label\":\"CERTIFICATION\",\"value\":\"TESDA Bread and Pastry Production NC II\",\"source\":\"section_rule\"},{\"label\":\"CERTIFICATION\",\"value\":\"Food Safety And Hygiene Certification\",\"source\":\"hint_pattern\"},{\"label\":\"CERTIFICATION\",\"value\":\"Advanced Pastry Training\",\"source\":\"hint_pattern\"},{\"label\":\"CERTIFICATION\",\"value\":\"Cake Decoration And Dessert Plating Training\",\"source\":\"hint_pattern\"},{\"label\":\"CERTIFICATION\",\"value\":\"Hotel Pastry Chef \\/ Pastry Cook\",\"source\":\"section_rule\"},{\"label\":\"CERTIFICATION\",\"value\":\"\\ud83c\\udf70 \\ud83c\\udf63 \\ud83c\\udf82 \\u2728\",\"source\":\"section_rule\"},{\"label\":\"CERTIFICATION\",\"value\":\"Plated Desserts Artisan Breads Celebration Cakes Banquet Production\",\"source\":\"section_rule\"},{\"label\":\"ORGANIZATION\",\"value\":\"Shangri-La at the Fort Manila\",\"source\":\"section_rule\"},{\"label\":\"ORGANIZATION\",\"value\":\"Pastry Cook\",\"source\":\"section_rule\"},{\"label\":\"ORGANIZATION\",\"value\":\"Bakery Assistant\",\"source\":\"section_rule\"},{\"label\":\"ORGANIZATION\",\"value\":\"Shangri-La\",\"source\":\"section_rule\"},{\"label\":\"EMAIL\",\"value\":\"lorenzo.santiago@culinarymail.com\",\"source\":\"regex\"},{\"label\":\"PHONE\",\"value\":\"+63 908 774 3312\",\"source\":\"regex\"}]', '[]', '{\"missing_information\":[],\"invalid_format\":[],\"skill_analysis\":{\"recognized\":[\"Attention to Detail\",\"Cake Decoration\",\"Food Safety\",\"HACCP\",\"Pastry and Baking\",\"Plating\",\"Teamwork\"],\"unrecognized\":[]},\"job_role_analysis\":{\"recognized\":[\"Pastry Chef\"],\"unrecognized\":[\"Fairmont Makati\"]},\"credential_analysis\":[{\"required\":null,\"extracted\":\"Advanced Pastry Training\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"},{\"required\":null,\"extracted\":\"C E R T I F I C At I O N S\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"},{\"required\":null,\"extracted\":\"Cake Decoration And Dessert Plating Training\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"},{\"required\":null,\"extracted\":\"Food Safety And Hygiene Certification\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"},{\"required\":null,\"extracted\":\"Hotel Pastry Chef \\/ Pastry Cook\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"},{\"required\":null,\"extracted\":\"Plated Desserts Artisan Breads Celebration Cakes Banquet Production\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"},{\"required\":null,\"extracted\":\"\\ud83c\\udf70 \\ud83c\\udf63 \\ud83c\\udf82 \\u2728\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"}],\"credential_issues\":[],\"review_flags\":[{\"type\":\"UNRECOGNIZED_JOB_ROLE\",\"detail\":\"Fairmont Makati\",\"note\":\"Not found in system reference data; flagged for manual review only.\"}]}', NULL, '[\"Education does not meet the requirement of the applied job.\",\"Required-skills coverage 0% is below the 60% minimum. Missing: Cash Handling, Check-in \\/ Check-out, Guest Relations, Property Management Systems, Reservations.\",\"Overall score 62.0% is below the 75.0% threshold.\",\"Lowest-scoring component: skills (12.0\\/40.0 pts).\",\"Alternative job analysis: highest-scoring open position \'Bartender\' reached only 62.0%, below the 75.0% recommendation threshold.\"]', '{\"base_model\":\"en_core_web_sm\",\"custom_ner_loaded\":true,\"custom_ner_path\":\"C:\\\\Users\\\\Windows 10 Lite\\\\Downloads\\\\MUNJOR\\\\4TH YR\\\\DEV\\\\LATEST CLONE\\\\v5\\\\2nd-repo-for-hrms-backend-\\\\nlp-service\\\\models_spacy\\\\role_specific_ner\"}', NULL, '2026-08-25 11:52:46', '2026-08-25 11:52:46', '2026-08-25 11:52:46'),
(8, 33, 16, 'PARTIALLY_PROCESSED', 'fit', 100.00, '{\"skills\":{\"weight\":0.4,\"earned\":40,\"max\":40,\"matched_required\":[\"Cash Handling\",\"Check-in \\/ Check-out\",\"Guest Relations\",\"Property Management Systems\",\"Reservations\"],\"fuzzy_matched_required\":[],\"missing_required\":[],\"matched_preferred\":[],\"missing_preferred\":[],\"required_coverage\":1,\"preferred_coverage\":1},\"experience\":{\"weight\":0.3,\"earned\":30,\"max\":30,\"estimated_years\":3.75,\"min_years_required\":1,\"requirement_met\":true},\"education\":{\"weight\":0.2,\"earned\":20,\"max\":20,\"applicant_highest_level\":[\"Bachelor of Science in Hospitality Management\"],\"required_level\":\"Bachelor\'s Degree\",\"requirement_met\":true},\"certifications\":{\"weight\":0.1,\"earned\":10,\"max\":10,\"matched\":[],\"missing\":[],\"no_requirements\":true}}', '{\"personal_information\":{\"name\":\"ALYSSA MARIE\",\"email\":\"5678alyssa.valdez.spa@gmail.com\",\"phone\":\"+63 917 234 5678\",\"address\":\"Antipolo City, Rizal, Philippines\"},\"education\":[\"Bachelor of Science in Hospitality Management\"],\"work_experience\":[{\"job_title\":\"Front Desk Receptionist\",\"company\":\"The Cortina Wellness Resort & Spa\",\"location\":null,\"period\":\"June 2022 - Present\",\"recognized_role\":true},{\"job_title\":\"Spa Front Desk Associate\",\"company\":\"Serenity Springs Day Spa\",\"location\":null,\"period\":\"August 2020 - February 2021\",\"recognized_role\":false}],\"skills\":[\"Attention to Detail\",\"Cash Handling\",\"Check-in \\/ Check-out\",\"Communication\",\"Complaint Handling\",\"Customer Service\",\"Front Office Operations\",\"Guest Relations\",\"Housekeeping Operations\",\"MS Office\",\"POS Systems\",\"Property Management Systems\",\"Reservations\",\"Scheduling\",\"Time Management\"],\"certifications\":[\"Basic First Aid Training\",\"Cross Ph)\",\"Customer Service Excellence\",\"Spa Reception & Guest Service\",\"Wellness & Hospitality Service\"],\"unrecognized_certifications\":[\"Basic First Aid Training\",\"Cross Ph)\",\"Customer Service Excellence\",\"Spa Reception & Guest Service\",\"Wellness & Hospitality Service\"],\"estimated_years_experience\":3.75,\"job_roles\":{\"recognized\":[\"Concierge\",\"Front Desk Receptionist\"],\"unrecognized\":[\"Spa Front Desk Associate\"]},\"unrecognized_skills\":[\"Payment Processing\",\"Spa Reception\"]}', '[{\"label\":\"PERSON\",\"value\":\"ALYSSA MARIE\",\"source\":\"rule\"},{\"label\":\"EDUCATION\",\"value\":\"Bachelor of Science in Hospitality Management\",\"source\":\"section_rule\"},{\"label\":\"JOB_TITLE\",\"value\":\"Front Desk Receptionist\",\"source\":\"section_rule\"},{\"label\":\"JOB_TITLE\",\"value\":\"Concierge\",\"source\":\"section_rule\"},{\"label\":\"JOB_TITLE\",\"value\":\"Spa Front Desk Associate\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Spa Reception\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Scheduling\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Guest Relations\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Reservations\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Front Office Operations\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Payment Processing\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"POS Systems\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Customer Service\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Complaint Handling\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Time Management\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Attention to Detail\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Cash Handling\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Check-in \\/ Check-out\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Communication\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Housekeeping Operations\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"MS Office\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Property Management Systems\",\"source\":\"reference_scan\"},{\"label\":\"CERTIFICATION\",\"value\":\"Customer Service Excellence\",\"source\":\"section_rule\"},{\"label\":\"CERTIFICATION\",\"value\":\"Spa Reception & Guest Service\",\"source\":\"section_rule\"},{\"label\":\"CERTIFICATION\",\"value\":\"Basic First Aid Training\",\"source\":\"hint_pattern\"},{\"label\":\"CERTIFICATION\",\"value\":\"Cross Ph)\",\"source\":\"section_rule\"},{\"label\":\"CERTIFICATION\",\"value\":\"Wellness & Hospitality Service\",\"source\":\"section_rule\"},{\"label\":\"ORGANIZATION\",\"value\":\"The Cortina Wellness Resort & Spa\",\"source\":\"section_rule\"},{\"label\":\"ORGANIZATION\",\"value\":\"Serenity Springs Day Spa\",\"source\":\"section_rule\"},{\"label\":\"ORGANIZATION\",\"value\":\"Opera\",\"source\":\"section_rule\"},{\"label\":\"EMAIL\",\"value\":\"5678alyssa.valdez.spa@gmail.com\",\"source\":\"regex\"},{\"label\":\"PHONE\",\"value\":\"+63 917 234 5678\",\"source\":\"regex\"}]', '[]', '{\"missing_information\":[],\"invalid_format\":[],\"skill_analysis\":{\"recognized\":[\"Attention to Detail\",\"Cash Handling\",\"Check-in \\/ Check-out\",\"Communication\",\"Complaint Handling\",\"Customer Service\",\"Front Office Operations\",\"Guest Relations\",\"Housekeeping Operations\",\"MS Office\",\"POS Systems\",\"Property Management Systems\",\"Reservations\",\"Scheduling\",\"Time Management\"],\"unrecognized\":[\"Payment Processing\",\"Spa Reception\"]},\"job_role_analysis\":{\"recognized\":[\"Concierge\",\"Front Desk Receptionist\"],\"unrecognized\":[\"Spa Front Desk Associate\"]},\"credential_analysis\":[{\"required\":null,\"extracted\":\"Basic First Aid Training\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"},{\"required\":null,\"extracted\":\"Cross Ph)\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"},{\"required\":null,\"extracted\":\"Customer Service Excellence\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"},{\"required\":null,\"extracted\":\"Spa Reception & Guest Service\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"},{\"required\":null,\"extracted\":\"Wellness & Hospitality Service\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"}],\"credential_issues\":[],\"review_flags\":[{\"type\":\"UNRECOGNIZED_JOB_ROLE\",\"detail\":\"Spa Front Desk Associate\",\"note\":\"Not found in system reference data; flagged for manual review only.\"}]}', NULL, '[\"Overall match score 100.0% reached the required threshold of 75.0% for Front Desk Receptionist.\",\"Matched required skills: Cash Handling, Check-in \\/ Check-out, Guest Relations, Property Management Systems, Reservations.\",\"Education requirement met: True; experience requirement met: True (3.75 yrs vs 1.0 yrs minimum).\"]', '{\"base_model\":\"en_core_web_sm\",\"custom_ner_loaded\":true,\"custom_ner_path\":\"C:\\\\Users\\\\Windows 10 Lite\\\\Downloads\\\\MUNJOR\\\\4TH YR\\\\DEV\\\\LATEST CLONE\\\\v5\\\\2nd-repo-for-hrms-backend-\\\\nlp-service\\\\models_spacy\\\\role_specific_ner\"}', NULL, '2026-08-25 11:59:05', '2026-08-25 11:59:05', '2026-08-25 11:59:05'),
(9, 34, 16, 'PARTIALLY_PROCESSED', 'fit', 100.00, '{\"skills\":{\"weight\":0.4,\"earned\":40,\"max\":40,\"matched_required\":[\"Cash Handling\",\"Check-in \\/ Check-out\",\"Guest Relations\",\"Property Management Systems\",\"Reservations\"],\"fuzzy_matched_required\":[],\"missing_required\":[],\"matched_preferred\":[],\"missing_preferred\":[],\"required_coverage\":1,\"preferred_coverage\":1},\"experience\":{\"weight\":0.3,\"earned\":30,\"max\":30,\"estimated_years\":5,\"min_years_required\":1,\"requirement_met\":true},\"education\":{\"weight\":0.2,\"earned\":20,\"max\":20,\"applicant_highest_level\":[\"Bachelor of Science in Hospitality Management\"],\"required_level\":\"Bachelor\'s Degree\",\"requirement_met\":true},\"certifications\":{\"weight\":0.1,\"earned\":10,\"max\":10,\"matched\":[],\"missing\":[],\"no_requirements\":true}}', '{\"personal_information\":{\"name\":\"MARIA ANGELA SANTOS\",\"email\":\"maria.santos.hospitality@gmail.com\",\"phone\":\"0917 245 6183\",\"address\":\"Quezon City, Philippines\"},\"education\":[\"Bachelor of Science in Hospitality Management\"],\"work_experience\":[{\"job_title\":\"Hotel Front Desk Associate\",\"company\":\"Hotel Front Desk Associate\",\"location\":null,\"period\":\"June 2023 - Present\",\"recognized_role\":false},{\"job_title\":\"Front Desk Receptionist\",\"company\":\"Guest Service Representative\",\"location\":null,\"period\":\"March 2021 - May 2023\",\"recognized_role\":true},{\"job_title\":\"confirm satisfaction\",\"company\":\"Front Office Intern\",\"location\":null,\"period\":\"October 2020 - February 2021\",\"recognized_role\":false}],\"skills\":[\"Attention to Detail\",\"Cash Handling\",\"Check-in \\/ Check-out\",\"Communication\",\"Complaint Handling\",\"Customer Service\",\"Front Office Operations\",\"Guest Relations\",\"Housekeeping Operations\",\"MS Office\",\"Plating\",\"Property Management Systems\",\"Reservations\",\"Teamwork\",\"Time Management\"],\"certifications\":[\"Basic Life Support And First Aid Certification\",\"Customer Service Excellence Training\",\"Hospitality Service Training\"],\"unrecognized_certifications\":[\"Basic Life Support And First Aid Certification\",\"Customer Service Excellence Training\",\"Hospitality Service Training\"],\"estimated_years_experience\":5,\"job_roles\":{\"recognized\":[\"Front Desk Receptionist\"],\"unrecognized\":[\"Hotel Front Desk Associate\",\"confirm satisfaction\"]},\"unrecognized_skills\":[\"Payment Processing\"]}', '[{\"label\":\"PERSON\",\"value\":\"MARIA ANGELA SANTOS\",\"source\":\"rule\"},{\"label\":\"EDUCATION\",\"value\":\"Bachelor of Science in Hospitality Management\",\"source\":\"section_rule\"},{\"label\":\"JOB_TITLE\",\"value\":\"Hotel Front Desk Associate\",\"source\":\"section_rule\"},{\"label\":\"JOB_TITLE\",\"value\":\"Front Desk Receptionist\",\"source\":\"section_rule\"},{\"label\":\"JOB_TITLE\",\"value\":\"confirm satisfaction\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Guest Relations\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Check-in \\/ Check-out\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Reservations\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Complaint Handling\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Cash Handling\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Payment Processing\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Front Office Operations\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Time Management\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Communication\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Attention to Detail\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Customer Service\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Housekeeping Operations\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"MS Office\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Plating\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Property Management Systems\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Teamwork\",\"source\":\"reference_scan\"},{\"label\":\"CERTIFICATION\",\"value\":\"Customer Service Excellence Training\",\"source\":\"hint_pattern\"},{\"label\":\"CERTIFICATION\",\"value\":\"Basic Life Support And First Aid Certification\",\"source\":\"hint_pattern\"},{\"label\":\"CERTIFICATION\",\"value\":\"Hospitality Service Training\",\"source\":\"hint_pattern\"},{\"label\":\"ORGANIZATION\",\"value\":\"Hotel Front Desk Associate\",\"source\":\"section_rule\"},{\"label\":\"ORGANIZATION\",\"value\":\"Guest Service Representative\",\"source\":\"section_rule\"},{\"label\":\"ORGANIZATION\",\"value\":\"Front Office Intern\",\"source\":\"section_rule\"},{\"label\":\"ORGANIZATION\",\"value\":\"Opera PMS\",\"source\":\"section_rule\"},{\"label\":\"EMAIL\",\"value\":\"maria.santos.hospitality@gmail.com\",\"source\":\"regex\"},{\"label\":\"PHONE\",\"value\":\"0917 245 6183\",\"source\":\"regex\"}]', '[]', '{\"missing_information\":[],\"invalid_format\":[],\"skill_analysis\":{\"recognized\":[\"Attention to Detail\",\"Cash Handling\",\"Check-in \\/ Check-out\",\"Communication\",\"Complaint Handling\",\"Customer Service\",\"Front Office Operations\",\"Guest Relations\",\"Housekeeping Operations\",\"MS Office\",\"Plating\",\"Property Management Systems\",\"Reservations\",\"Teamwork\",\"Time Management\"],\"unrecognized\":[\"Payment Processing\"]},\"job_role_analysis\":{\"recognized\":[\"Front Desk Receptionist\"],\"unrecognized\":[\"Hotel Front Desk Associate\",\"confirm satisfaction\"]},\"credential_analysis\":[{\"required\":null,\"extracted\":\"Basic Life Support And First Aid Certification\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"},{\"required\":null,\"extracted\":\"Customer Service Excellence Training\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"},{\"required\":null,\"extracted\":\"Hospitality Service Training\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"}],\"credential_issues\":[],\"review_flags\":[{\"type\":\"UNRECOGNIZED_JOB_ROLE\",\"detail\":\"Hotel Front Desk Associate\",\"note\":\"Not found in system reference data; flagged for manual review only.\"},{\"type\":\"UNRECOGNIZED_JOB_ROLE\",\"detail\":\"confirm satisfaction\",\"note\":\"Not found in system reference data; flagged for manual review only.\"}]}', NULL, '[\"Overall match score 100.0% reached the required threshold of 75.0% for Front Desk Receptionist.\",\"Matched required skills: Cash Handling, Check-in \\/ Check-out, Guest Relations, Property Management Systems, Reservations.\",\"Education requirement met: True; experience requirement met: True (5.0 yrs vs 1.0 yrs minimum).\"]', '{\"base_model\":\"en_core_web_sm\",\"custom_ner_loaded\":true,\"custom_ner_path\":\"C:\\\\Users\\\\Windows 10 Lite\\\\Downloads\\\\MUNJOR\\\\4TH YR\\\\DEV\\\\LATEST CLONE\\\\v5\\\\2nd-repo-for-hrms-backend-\\\\nlp-service\\\\models_spacy\\\\role_specific_ner\"}', NULL, '2026-08-25 12:11:13', '2026-08-25 12:11:13', '2026-08-25 12:11:13'),
(10, 35, 16, 'PARTIALLY_PROCESSED', 'not-fit', 72.00, '{\"skills\":{\"weight\":0.4,\"earned\":12,\"max\":40,\"matched_required\":[],\"fuzzy_matched_required\":[],\"missing_required\":[\"Cash Handling\",\"Check-in \\/ Check-out\",\"Guest Relations\",\"Property Management Systems\",\"Reservations\"],\"matched_preferred\":[],\"missing_preferred\":[],\"required_coverage\":0,\"preferred_coverage\":1},\"experience\":{\"weight\":0.3,\"earned\":30,\"max\":30,\"estimated_years\":7.5,\"min_years_required\":1,\"requirement_met\":true},\"education\":{\"weight\":0.2,\"earned\":20,\"max\":20,\"applicant_highest_level\":[\"Bachelor of Science in Business Administration\"],\"required_level\":\"Bachelor\'s Degree\",\"requirement_met\":true},\"certifications\":{\"weight\":0.1,\"earned\":10,\"max\":10,\"matched\":[],\"missing\":[],\"no_requirements\":true}}', '{\"personal_information\":{\"name\":\"Marielle Anne Santos\",\"email\":\"marielle.santos.fbcontrol@gmail.com\",\"phone\":\"+63 918 663 2947\",\"address\":\"Antipolo City, Philippines\"},\"education\":[\"Bachelor of Science in Business Administration\"],\"work_experience\":[{\"job_title\":\"Supervisor\",\"company\":\"Restaurant Inventory and Cost Control Supervisor\",\"location\":null,\"period\":\"January 2023 - Present\",\"recognized_role\":true},{\"job_title\":\"retraining\",\"company\":\"Food and Beverage Cost Control Assistant\",\"location\":null,\"period\":\"April 2020 - December 2022\",\"recognized_role\":false},{\"job_title\":\"Caf\\u00e9 Verano Manila\",\"company\":\"Inventory Control Officer\",\"location\":null,\"period\":\"June 2018 - March 2020\",\"recognized_role\":false}],\"skills\":[\"Food Safety\",\"Inventory Control\",\"MS Office\",\"POS Systems\",\"Records Documentation\"],\"certifications\":[\"Basic Accounting For Non-Accountants, Tesda (2019)\",\"Food And Beverage Cost Control Training\",\"Inventory Management Training Certificate\",\"Microsoft Excel Advanced Certification\",\"Restaurant Operations And Food Safety Orientation (2018)\"],\"unrecognized_certifications\":[\"Basic Accounting For Non-Accountants, Tesda (2019)\",\"Food And Beverage Cost Control Training\",\"Inventory Management Training Certificate\",\"Microsoft Excel Advanced Certification\",\"Restaurant Operations And Food Safety Orientation (2018)\"],\"estimated_years_experience\":7.5,\"job_roles\":{\"recognized\":[\"Supervisor\"],\"unrecognized\":[\"Caf\\u00e9 Verano Manila\",\"retraining\"]},\"unrecognized_skills\":[\"Basic\",\"Cost Accounting\",\"Cross-Functional Team Coordination\",\"MarketMan\",\"Materials Control Software\",\"Physical Inventory Counting\",\"Supplier Delivery Verification\",\"Waste & Spoilage Tracking\"]}', '[{\"label\":\"PERSON\",\"value\":\"Marielle Anne Santos\",\"source\":\"rule\"},{\"label\":\"EDUCATION\",\"value\":\"Bachelor of Science in Business Administration\",\"source\":\"section_rule\"},{\"label\":\"JOB_TITLE\",\"value\":\"Supervisor\",\"source\":\"section_rule\"},{\"label\":\"JOB_TITLE\",\"value\":\"retraining\",\"source\":\"section_rule\"},{\"label\":\"JOB_TITLE\",\"value\":\"Caf\\u00e9 Verano Manila\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Inventory Control\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Physical Inventory Counting\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Waste & Spoilage Tracking\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Supplier Delivery Verification\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Records Documentation\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"MarketMan\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Materials Control Software\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"MS Office\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Basic\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Cost Accounting\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Cross-Functional Team Coordination\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Food Safety\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"POS Systems\",\"source\":\"reference_scan\"},{\"label\":\"CERTIFICATION\",\"value\":\"Food And Beverage Cost Control Training\",\"source\":\"hint_pattern\"},{\"label\":\"CERTIFICATION\",\"value\":\"Inventory Management Training Certificate\",\"source\":\"hint_pattern\"},{\"label\":\"CERTIFICATION\",\"value\":\"Basic Accounting For Non-Accountants, Tesda (2019)\",\"source\":\"section_rule\"},{\"label\":\"CERTIFICATION\",\"value\":\"Microsoft Excel Advanced Certification\",\"source\":\"hint_pattern\"},{\"label\":\"CERTIFICATION\",\"value\":\"Restaurant Operations And Food Safety Orientation (2018)\",\"source\":\"section_rule\"},{\"label\":\"ORGANIZATION\",\"value\":\"Restaurant Inventory and Cost Control Supervisor\",\"source\":\"section_rule\"},{\"label\":\"ORGANIZATION\",\"value\":\"Food and Beverage Cost Control Assistant\",\"source\":\"section_rule\"},{\"label\":\"ORGANIZATION\",\"value\":\"Inventory Control Officer\",\"source\":\"section_rule\"},{\"label\":\"EMAIL\",\"value\":\"marielle.santos.fbcontrol@gmail.com\",\"source\":\"regex\"},{\"label\":\"PHONE\",\"value\":\"+63 918 663 2947\",\"source\":\"regex\"}]', '[]', '{\"missing_information\":[],\"invalid_format\":[],\"skill_analysis\":{\"recognized\":[\"Food Safety\",\"Inventory Control\",\"MS Office\",\"POS Systems\",\"Records Documentation\"],\"unrecognized\":[\"Basic\",\"Cost Accounting\",\"Cross-Functional Team Coordination\",\"MarketMan\",\"Materials Control Software\",\"Physical Inventory Counting\",\"Supplier Delivery Verification\",\"Waste & Spoilage Tracking\"]},\"job_role_analysis\":{\"recognized\":[\"Supervisor\"],\"unrecognized\":[\"Caf\\u00e9 Verano Manila\",\"retraining\"]},\"credential_analysis\":[{\"required\":null,\"extracted\":\"Basic Accounting For Non-Accountants, Tesda (2019)\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"},{\"required\":null,\"extracted\":\"Food And Beverage Cost Control Training\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"},{\"required\":null,\"extracted\":\"Inventory Management Training Certificate\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"},{\"required\":null,\"extracted\":\"Microsoft Excel Advanced Certification\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"},{\"required\":null,\"extracted\":\"Restaurant Operations And Food Safety Orientation (2018)\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"}],\"credential_issues\":[],\"review_flags\":[{\"type\":\"UNRECOGNIZED_JOB_ROLE\",\"detail\":\"Caf\\u00e9 Verano Manila\",\"note\":\"Not found in system reference data; flagged for manual review only.\"},{\"type\":\"UNRECOGNIZED_JOB_ROLE\",\"detail\":\"retraining\",\"note\":\"Not found in system reference data; flagged for manual review only.\"}]}', NULL, '[\"Required-skills coverage 0% is below the 60% minimum. Missing: Cash Handling, Check-in \\/ Check-out, Guest Relations, Property Management Systems, Reservations.\",\"Overall score 72.0% is below the 75.0% threshold.\",\"Lowest-scoring component: skills (12.0\\/40.0 pts).\",\"Alternative job analysis: highest-scoring open position \'Bartender\' reached only 72.0%, below the 75.0% recommendation threshold.\"]', '{\"base_model\":\"en_core_web_sm\",\"custom_ner_loaded\":true,\"custom_ner_path\":\"C:\\\\Users\\\\Windows 10 Lite\\\\Downloads\\\\MUNJOR\\\\4TH YR\\\\DEV\\\\LATEST CLONE\\\\v5\\\\2nd-repo-for-hrms-backend-\\\\nlp-service\\\\models_spacy\\\\role_specific_ner\"}', NULL, '2026-08-25 12:58:53', '2026-08-25 12:58:53', '2026-08-25 12:58:53');
INSERT INTO `applicant_screenings` (`screening_id`, `applicant_id`, `job_post_id`, `processing_status`, `screening_result`, `match_score`, `score_breakdown_json`, `profile_json`, `entities_json`, `missing_information_json`, `validation_json`, `alternative_job_json`, `reasons_json`, `model_info_json`, `error_message`, `processed_at`, `created_at`, `updated_at`) VALUES
(11, 36, 16, 'PARTIALLY_PROCESSED', 'other-role', 83.20, '{\"skills\":{\"weight\":0.4,\"earned\":23.2,\"max\":40,\"matched_required\":[\"Check-in \\/ Check-out\",\"Guest Relations\"],\"fuzzy_matched_required\":[],\"missing_required\":[\"Cash Handling\",\"Property Management Systems\",\"Reservations\"],\"matched_preferred\":[],\"missing_preferred\":[],\"required_coverage\":0.4,\"preferred_coverage\":1},\"experience\":{\"weight\":0.3,\"earned\":30,\"max\":30,\"estimated_years\":5,\"min_years_required\":1,\"requirement_met\":true},\"education\":{\"weight\":0.2,\"earned\":20,\"max\":20,\"applicant_highest_level\":[\"Bachelor of Science in Tourism Management\"],\"required_level\":\"Bachelor\'s Degree\",\"requirement_met\":true},\"certifications\":{\"weight\":0.1,\"earned\":10,\"max\":10,\"matched\":[],\"missing\":[],\"no_requirements\":true}}', '{\"personal_information\":{\"name\":\"NICOLE FRANCES HERRERA\",\"email\":\"nicole.herrera.recreation@gmail.com\",\"phone\":\"+63 919 678 1234\",\"address\":\"Tagaytay City, Philippines\"},\"education\":[\"Bachelor of Science in Tourism Management\"],\"work_experience\":[{\"job_title\":\"Hotel Recreation and Activities Coordinator\",\"company\":\"Hotel Recreation and Activities Coordinator\",\"location\":null,\"period\":\"Feb 2023 - Present\",\"recognized_role\":false}],\"skills\":[\"Check-in \\/ Check-out\",\"Communication\",\"Customer Service\",\"Front Office Operations\",\"Guest Relations\",\"Housekeeping Operations\",\"Problem Solving\",\"Scheduling\",\"Teamwork\"],\"certifications\":[\"Activity Facilitation And Event Coordination Training\",\"Basic First Aid And Safety Training\",\"Customer Service Excellence Training\",\"Events And Recreation Management Training\"],\"unrecognized_certifications\":[\"Activity Facilitation And Event Coordination Training\",\"Basic First Aid And Safety Training\",\"Customer Service Excellence Training\",\"Events And Recreation Management Training\"],\"estimated_years_experience\":5,\"job_roles\":{\"recognized\":[],\"unrecognized\":[\"Hotel Recreation and Activities Coordinator\"]},\"unrecognized_skills\":[]}', '[{\"label\":\"PERSON\",\"value\":\"NICOLE FRANCES HERRERA\",\"source\":\"rule\"},{\"label\":\"EDUCATION\",\"value\":\"Bachelor of Science in Tourism Management\",\"source\":\"section_rule\"},{\"label\":\"JOB_TITLE\",\"value\":\"Hotel Recreation and Activities Coordinator\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Problem Solving\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Check-in \\/ Check-out\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Communication\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Customer Service\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Front Office Operations\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Guest Relations\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Housekeeping Operations\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Scheduling\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Teamwork\",\"source\":\"reference_scan\"},{\"label\":\"CERTIFICATION\",\"value\":\"Events And Recreation Management Training\",\"source\":\"hint_pattern\"},{\"label\":\"CERTIFICATION\",\"value\":\"Basic First Aid And Safety Training\",\"source\":\"hint_pattern\"},{\"label\":\"CERTIFICATION\",\"value\":\"Customer Service Excellence Training\",\"source\":\"hint_pattern\"},{\"label\":\"CERTIFICATION\",\"value\":\"Activity Facilitation And Event Coordination Training\",\"source\":\"hint_pattern\"},{\"label\":\"ORGANIZATION\",\"value\":\"Hotel Recreation and Activities Coordinator\",\"source\":\"section_rule\"},{\"label\":\"ORGANIZATION\",\"value\":\"F&B\",\"source\":\"section_rule\"},{\"label\":\"EMAIL\",\"value\":\"nicole.herrera.recreation@gmail.com\",\"source\":\"regex\"},{\"label\":\"PHONE\",\"value\":\"+63 919 678 1234\",\"source\":\"regex\"}]', '[]', '{\"missing_information\":[],\"invalid_format\":[],\"skill_analysis\":{\"recognized\":[\"Check-in \\/ Check-out\",\"Communication\",\"Customer Service\",\"Front Office Operations\",\"Guest Relations\",\"Housekeeping Operations\",\"Problem Solving\",\"Scheduling\",\"Teamwork\"],\"unrecognized\":[]},\"job_role_analysis\":{\"recognized\":[],\"unrecognized\":[\"Hotel Recreation and Activities Coordinator\"]},\"credential_analysis\":[{\"required\":null,\"extracted\":\"Activity Facilitation And Event Coordination Training\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"},{\"required\":null,\"extracted\":\"Basic First Aid And Safety Training\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"},{\"required\":null,\"extracted\":\"Customer Service Excellence Training\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"},{\"required\":null,\"extracted\":\"Events And Recreation Management Training\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"}],\"credential_issues\":[],\"review_flags\":[{\"type\":\"UNRECOGNIZED_JOB_ROLE\",\"detail\":\"Hotel Recreation and Activities Coordinator\",\"note\":\"Not found in system reference data; flagged for manual review only.\"}]}', '{\"job_post_id\":1,\"title\":\"Bartender\",\"alternative_match_score\":88.8,\"applied_job_score\":83.2,\"matched_skills\":[\"Communication\",\"Customer Service\",\"Problem Solving\"],\"reason\":\"The applicant did not sufficiently match Front Desk Receptionist (83.2%) but strongly matches Bartender (88.8%): Matched skills: Communication, Customer Service, Problem Solving; Education requirement satisfied; Experience requirement satisfied (5.0 yrs vs 1.0 yrs required); No certification requirements defined for this role \\u2014 meets Bartender requirements.\"}', '[\"Required-skills coverage 40% is below the 60% minimum. Missing: Cash Handling, Property Management Systems, Reservations.\",\"Applied-job requirements were not fully satisfied, so other open positions were analysed.\",\"Best alternative \'Bartender\' scored 88.8% and satisfied that role\'s mandatory requirements.\"]', '{\"base_model\":\"en_core_web_sm\",\"custom_ner_loaded\":true,\"custom_ner_path\":\"C:\\\\Users\\\\Windows 10 Lite\\\\Downloads\\\\MUNJOR\\\\4TH YR\\\\DEV\\\\LATEST CLONE\\\\v5\\\\2nd-repo-for-hrms-backend-\\\\nlp-service\\\\models_spacy\\\\role_specific_ner\"}', NULL, '2026-08-25 13:00:33', '2026-08-25 13:00:33', '2026-08-25 13:00:33'),
(12, 37, 16, 'PARTIALLY_PROCESSED', 'not-fit', 72.00, '{\"skills\":{\"weight\":0.4,\"earned\":12,\"max\":40,\"matched_required\":[],\"fuzzy_matched_required\":[],\"missing_required\":[\"Cash Handling\",\"Check-in \\/ Check-out\",\"Guest Relations\",\"Property Management Systems\",\"Reservations\"],\"matched_preferred\":[],\"missing_preferred\":[],\"required_coverage\":0,\"preferred_coverage\":1},\"experience\":{\"weight\":0.3,\"earned\":30,\"max\":30,\"estimated_years\":5.9,\"min_years_required\":1,\"requirement_met\":true},\"education\":{\"weight\":0.2,\"earned\":20,\"max\":20,\"applicant_highest_level\":[\"Bachelor of Science in Hospitality Management\"],\"required_level\":\"Bachelor\'s Degree\",\"requirement_met\":true},\"certifications\":{\"weight\":0.1,\"earned\":10,\"max\":10,\"matched\":[],\"missing\":[],\"no_requirements\":true}}', '{\"personal_information\":{\"name\":\"PATRICIA ANNE MENDOZA\",\"email\":\"patriciamendoza.hr@example.cor\",\"phone\":\"+63 917 482 1936\",\"address\":\"Pasay City, Philippines\"},\"education\":[\"Bachelor of Science in Hospitality Management\"],\"work_experience\":[{\"job_title\":\"Supervisor\",\"company\":null,\"location\":null,\"period\":\"Jun 2023 - Present\",\"recognized_role\":true},{\"job_title\":\"Housekeeping Attendant\",\"company\":null,\"location\":null,\"period\":\"Jan 2021 - May 2023\",\"recognized_role\":true},{\"job_title\":\"Housekeeping Attendant\",\"company\":null,\"location\":null,\"period\":\"Jul 2020 - Dec 2020\",\"recognized_role\":true}],\"skills\":[\"Customer Service\",\"Food Safety\",\"Housekeeping Operations\",\"Inventory Control\",\"Linen Handling\",\"MS Office\",\"Problem Solving\",\"Safety Compliance\",\"Scheduling\"],\"certifications\":[\"TESDA Housekeeping NC II\",\"Customer Service Excellence Workshop\",\"Housekeeping And Sanitation Training\",\"Occupational Safety And Health Awareness Training\"],\"unrecognized_certifications\":[\"Customer Service Excellence Workshop\",\"Housekeeping And Sanitation Training\",\"Occupational Safety And Health Awareness Training\"],\"estimated_years_experience\":5.9,\"job_roles\":{\"recognized\":[\"Housekeeping Attendant\",\"Supervisor\"],\"unrecognized\":[]},\"unrecognized_skills\":[]}', '[{\"label\":\"PERSON\",\"value\":\"PATRICIA ANNE MENDOZA\",\"source\":\"rule\"},{\"label\":\"EDUCATION\",\"value\":\"Bachelor of Science in Hospitality Management\",\"source\":\"section_rule\"},{\"label\":\"JOB_TITLE\",\"value\":\"Supervisor\",\"source\":\"section_rule\"},{\"label\":\"JOB_TITLE\",\"value\":\"Housekeeping Attendant\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Customer Service\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Food Safety\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Housekeeping Operations\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Inventory Control\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Linen Handling\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"MS Office\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Problem Solving\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Safety Compliance\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Scheduling\",\"source\":\"reference_scan\"},{\"label\":\"CERTIFICATION\",\"value\":\"TESDA Housekeeping NC II\",\"source\":\"section_rule\"},{\"label\":\"CERTIFICATION\",\"value\":\"Housekeeping And Sanitation Training\",\"source\":\"hint_pattern\"},{\"label\":\"CERTIFICATION\",\"value\":\"Occupational Safety And Health Awareness Training\",\"source\":\"hint_pattern\"},{\"label\":\"CERTIFICATION\",\"value\":\"Customer Service Excellence Workshop\",\"source\":\"hint_pattern\"},{\"label\":\"EMAIL\",\"value\":\"patriciamendoza.hr@example.cor\",\"source\":\"regex\"},{\"label\":\"EMAIL\",\"value\":\"patricia.mendoza.hr@example.com\",\"source\":\"regex\"},{\"label\":\"PHONE\",\"value\":\"+63 917 482 1936\",\"source\":\"regex\"}]', '[]', '{\"missing_information\":[],\"invalid_format\":[],\"skill_analysis\":{\"recognized\":[\"Customer Service\",\"Food Safety\",\"Housekeeping Operations\",\"Inventory Control\",\"Linen Handling\",\"MS Office\",\"Problem Solving\",\"Safety Compliance\",\"Scheduling\"],\"unrecognized\":[]},\"job_role_analysis\":{\"recognized\":[\"Housekeeping Attendant\",\"Supervisor\"],\"unrecognized\":[]},\"credential_analysis\":[{\"required\":null,\"extracted\":\"Customer Service Excellence Workshop\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"},{\"required\":null,\"extracted\":\"Housekeeping And Sanitation Training\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"},{\"required\":null,\"extracted\":\"Occupational Safety And Health Awareness Training\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"}],\"credential_issues\":[],\"review_flags\":[]}', NULL, '[\"Required-skills coverage 0% is below the 60% minimum. Missing: Cash Handling, Check-in \\/ Check-out, Guest Relations, Property Management Systems, Reservations.\",\"Overall score 72.0% is below the 75.0% threshold.\",\"Lowest-scoring component: skills (12.0\\/40.0 pts).\",\"Alternative job analysis: highest-scoring open position \'Bartender\' reached only 83.2%, below the 75.0% recommendation threshold.\"]', '{\"base_model\":\"en_core_web_sm\",\"custom_ner_loaded\":true,\"custom_ner_path\":\"C:\\\\Users\\\\Windows 10 Lite\\\\Downloads\\\\MUNJOR\\\\4TH YR\\\\DEV\\\\LATEST CLONE\\\\v5\\\\2nd-repo-for-hrms-backend-\\\\nlp-service\\\\models_spacy\\\\role_specific_ner\"}', NULL, '2026-08-25 13:02:20', '2026-08-25 13:02:20', '2026-08-25 13:02:20'),
(13, 38, 16, 'PARTIALLY_PROCESSED', 'not-fit', 77.60, '{\"skills\":{\"weight\":0.4,\"earned\":17.6,\"max\":40,\"matched_required\":[\"Cash Handling\"],\"fuzzy_matched_required\":[],\"missing_required\":[\"Check-in \\/ Check-out\",\"Guest Relations\",\"Property Management Systems\",\"Reservations\"],\"matched_preferred\":[],\"missing_preferred\":[],\"required_coverage\":0.2,\"preferred_coverage\":1},\"experience\":{\"weight\":0.3,\"earned\":30,\"max\":30,\"estimated_years\":5.8,\"min_years_required\":1,\"requirement_met\":true},\"education\":{\"weight\":0.2,\"earned\":20,\"max\":20,\"applicant_highest_level\":[\"Bachelor of Science in Hospitality Management\"],\"required_level\":\"Bachelor\'s Degree\",\"requirement_met\":true},\"certifications\":{\"weight\":0.1,\"earned\":10,\"max\":10,\"matched\":[],\"missing\":[],\"no_requirements\":true}}', '{\"personal_information\":{\"name\":\"RAFAEL DOMINIC LIM\",\"email\":\"rafael.lim.fnb@gmail.com\",\"phone\":\"+63 918 4567890\",\"address\":\"Makati City, Philippines\"},\"education\":[\"Bachelor of Science in Hospitality Management\"],\"work_experience\":[{\"job_title\":\"Beverage Service Specialist\",\"company\":\"Beverage Service Specialist\",\"location\":null,\"period\":\"January 2023 - Present\",\"recognized_role\":false},{\"job_title\":\"in monthly incremental revenue\",\"company\":\"Restaurant Server\",\"location\":null,\"period\":\"June 2021 - December 2022\",\"recognized_role\":false},{\"job_title\":\"The Marigold Hotel Restaurant\",\"company\":\"Hotel Food and Beverage Attendant\",\"location\":null,\"period\":\"August 2020 - May 2021\",\"recognized_role\":false}],\"skills\":[\"Attention to Detail\",\"Cash Handling\",\"Customer Service\",\"Food Safety\",\"POS Systems\",\"Table Service\",\"Upselling\"],\"certifications\":[\"Beverage Service Training\",\"Customer Service Excellence Training\",\"Food Safety And Hygiene Certification\",\"Responsible Beverage Service Training\"],\"unrecognized_certifications\":[\"Beverage Service Training\",\"Customer Service Excellence Training\",\"Food Safety And Hygiene Certification\",\"Responsible Beverage Service Training\"],\"estimated_years_experience\":5.8,\"job_roles\":{\"recognized\":[\"Supervisor\"],\"unrecognized\":[\"Beverage Service Specialist\",\"The Marigold Hotel Restaurant\",\"in monthly incremental revenue\"]},\"unrecognized_skills\":[]}', '[{\"label\":\"PERSON\",\"value\":\"RAFAEL DOMINIC LIM\",\"source\":\"rule\"},{\"label\":\"EDUCATION\",\"value\":\"Bachelor of Science in Hospitality Management\",\"source\":\"section_rule\"},{\"label\":\"JOB_TITLE\",\"value\":\"Beverage Service Specialist\",\"source\":\"section_rule\"},{\"label\":\"JOB_TITLE\",\"value\":\"in monthly incremental revenue\",\"source\":\"section_rule\"},{\"label\":\"JOB_TITLE\",\"value\":\"The Marigold Hotel Restaurant\",\"source\":\"section_rule\"},{\"label\":\"JOB_TITLE\",\"value\":\"Supervisor\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Upselling\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"POS Systems\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Customer Service\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Attention to Detail\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Cash Handling\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Food Safety\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Table Service\",\"source\":\"reference_scan\"},{\"label\":\"CERTIFICATION\",\"value\":\"Food Safety And Hygiene Certification\",\"source\":\"hint_pattern\"},{\"label\":\"CERTIFICATION\",\"value\":\"Beverage Service Training\",\"source\":\"hint_pattern\"},{\"label\":\"CERTIFICATION\",\"value\":\"Responsible Beverage Service Training\",\"source\":\"hint_pattern\"},{\"label\":\"CERTIFICATION\",\"value\":\"Customer Service Excellence Training\",\"source\":\"hint_pattern\"},{\"label\":\"ORGANIZATION\",\"value\":\"Beverage Service Specialist\",\"source\":\"section_rule\"},{\"label\":\"ORGANIZATION\",\"value\":\"Restaurant Server\",\"source\":\"section_rule\"},{\"label\":\"ORGANIZATION\",\"value\":\"Hotel Food and Beverage Attendant\",\"source\":\"section_rule\"},{\"label\":\"EMAIL\",\"value\":\"rafael.lim.fnb@gmail.com\",\"source\":\"regex\"},{\"label\":\"PHONE\",\"value\":\"+63 918 4567890\",\"source\":\"regex\"}]', '[]', '{\"missing_information\":[],\"invalid_format\":[],\"skill_analysis\":{\"recognized\":[\"Attention to Detail\",\"Cash Handling\",\"Customer Service\",\"Food Safety\",\"POS Systems\",\"Table Service\",\"Upselling\"],\"unrecognized\":[]},\"job_role_analysis\":{\"recognized\":[\"Supervisor\"],\"unrecognized\":[\"Beverage Service Specialist\",\"The Marigold Hotel Restaurant\",\"in monthly incremental revenue\"]},\"credential_analysis\":[{\"required\":null,\"extracted\":\"Beverage Service Training\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"},{\"required\":null,\"extracted\":\"Customer Service Excellence Training\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"},{\"required\":null,\"extracted\":\"Food Safety And Hygiene Certification\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"},{\"required\":null,\"extracted\":\"Responsible Beverage Service Training\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"}],\"credential_issues\":[],\"review_flags\":[{\"type\":\"UNRECOGNIZED_JOB_ROLE\",\"detail\":\"Beverage Service Specialist\",\"note\":\"Not found in system reference data; flagged for manual review only.\"},{\"type\":\"UNRECOGNIZED_JOB_ROLE\",\"detail\":\"The Marigold Hotel Restaurant\",\"note\":\"Not found in system reference data; flagged for manual review only.\"},{\"type\":\"UNRECOGNIZED_JOB_ROLE\",\"detail\":\"in monthly incremental revenue\",\"note\":\"Not found in system reference data; flagged for manual review only.\"}]}', NULL, '[\"Required-skills coverage 20% is below the 60% minimum. Missing: Check-in \\/ Check-out, Guest Relations, Property Management Systems, Reservations.\",\"Alternative job analysis: highest-scoring open position \'Bartender\' reached only 77.6%, below the 75.0% recommendation threshold.\"]', '{\"base_model\":\"en_core_web_sm\",\"custom_ner_loaded\":true,\"custom_ner_path\":\"C:\\\\Users\\\\Windows 10 Lite\\\\Downloads\\\\MUNJOR\\\\4TH YR\\\\DEV\\\\LATEST CLONE\\\\v5\\\\2nd-repo-for-hrms-backend-\\\\nlp-service\\\\models_spacy\\\\role_specific_ner\"}', NULL, '2026-08-25 13:04:12', '2026-08-25 13:04:12', '2026-08-25 13:04:12'),
(14, 39, 16, 'PARTIALLY_PROCESSED', 'not-fit', 62.00, '{\"skills\":{\"weight\":0.4,\"earned\":12,\"max\":40,\"matched_required\":[],\"fuzzy_matched_required\":[],\"missing_required\":[\"Cash Handling\",\"Check-in \\/ Check-out\",\"Guest Relations\",\"Property Management Systems\",\"Reservations\"],\"matched_preferred\":[],\"missing_preferred\":[],\"required_coverage\":0,\"preferred_coverage\":1},\"experience\":{\"weight\":0.3,\"earned\":30,\"max\":30,\"estimated_years\":7.5,\"min_years_required\":1,\"requirement_met\":true},\"education\":{\"weight\":0.2,\"earned\":10,\"max\":20,\"applicant_highest_level\":[\"Diploma in Hospitality Services - STI College, Pasay\"],\"required_level\":\"Bachelor\'s Degree\",\"requirement_met\":false},\"certifications\":{\"weight\":0.1,\"earned\":10,\"max\":10,\"matched\":[],\"missing\":[],\"no_requirements\":true}}', '{\"personal_information\":{\"name\":\"Roberto James Castillo\",\"email\":\"roberto.castillo.laundry@gmail.com\",\"phone\":\"+63 919 337 5502\",\"address\":\"88 Malvar St., Brgy. Malibay, Pasay City, Philippines\"},\"education\":[\"Diploma in Hospitality Services - STI College, Pasay\"],\"work_experience\":[{\"job_title\":\"Supervisor\",\"company\":null,\"location\":null,\"period\":\"April 2022 - Present\",\"recognized_role\":true},{\"job_title\":\"Laundry Attendant\",\"company\":null,\"location\":null,\"period\":\"January 2020 - March 2022\",\"recognized_role\":true},{\"job_title\":\"Laundry Attendant\",\"company\":null,\"location\":null,\"period\":\"June 2018 - December 2019\",\"recognized_role\":true}],\"skills\":[\"Food Safety\",\"Housekeeping Operations\",\"Inventory Control\",\"Linen Handling\",\"Problem Solving\",\"Safety Compliance\",\"Scheduling\",\"Time Management\"],\"certifications\":[\"TESDA Housekeeping NC II\",\"Hygiene And Sanitation Training\",\"Laundry Operations Training\",\"Workplace Safety Training\"],\"unrecognized_certifications\":[\"Hygiene And Sanitation Training\",\"Laundry Operations Training\",\"Workplace Safety Training\"],\"estimated_years_experience\":7.5,\"job_roles\":{\"recognized\":[\"Laundry Attendant\",\"Supervisor\"],\"unrecognized\":[]},\"unrecognized_skills\":[\"Hygiene\",\"Laundry Quality Control\",\"Staff Supervision\",\"Team Leadership\",\"Uniform Management\"]}', '[{\"label\":\"PERSON\",\"value\":\"Roberto James Castillo\",\"source\":\"rule\"},{\"label\":\"EDUCATION\",\"value\":\"Diploma in Hospitality Services - STI College, Pasay\",\"source\":\"section_rule\"},{\"label\":\"JOB_TITLE\",\"value\":\"Supervisor\",\"source\":\"section_rule\"},{\"label\":\"JOB_TITLE\",\"value\":\"Laundry Attendant\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Linen Handling\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Staff Supervision\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Laundry Quality Control\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Uniform Management\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Inventory Control\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Scheduling\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Hygiene\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Food Safety\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Team Leadership\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Time Management\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Problem Solving\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Housekeeping Operations\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Safety Compliance\",\"source\":\"reference_scan\"},{\"label\":\"CERTIFICATION\",\"value\":\"TESDA Housekeeping NC II\",\"source\":\"section_rule\"},{\"label\":\"CERTIFICATION\",\"value\":\"Laundry Operations Training\",\"source\":\"hint_pattern\"},{\"label\":\"CERTIFICATION\",\"value\":\"Workplace Safety Training\",\"source\":\"hint_pattern\"},{\"label\":\"CERTIFICATION\",\"value\":\"Hygiene And Sanitation Training\",\"source\":\"hint_pattern\"},{\"label\":\"ORGANIZATION\",\"value\":\"Oversee\",\"source\":\"section_rule\"},{\"label\":\"ORGANIZATION\",\"value\":\"Enforce\",\"source\":\"section_rule\"},{\"label\":\"EMAIL\",\"value\":\"roberto.castillo.laundry@gmail.com\",\"source\":\"regex\"},{\"label\":\"PHONE\",\"value\":\"+63 919 337 5502\",\"source\":\"regex\"}]', '[]', '{\"missing_information\":[],\"invalid_format\":[],\"skill_analysis\":{\"recognized\":[\"Food Safety\",\"Housekeeping Operations\",\"Inventory Control\",\"Linen Handling\",\"Problem Solving\",\"Safety Compliance\",\"Scheduling\",\"Time Management\"],\"unrecognized\":[\"Hygiene\",\"Laundry Quality Control\",\"Staff Supervision\",\"Team Leadership\",\"Uniform Management\"]},\"job_role_analysis\":{\"recognized\":[\"Laundry Attendant\",\"Supervisor\"],\"unrecognized\":[]},\"credential_analysis\":[{\"required\":null,\"extracted\":\"Hygiene And Sanitation Training\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"},{\"required\":null,\"extracted\":\"Laundry Operations Training\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"},{\"required\":null,\"extracted\":\"Workplace Safety Training\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"}],\"credential_issues\":[],\"review_flags\":[]}', NULL, '[\"Education does not meet the requirement of the applied job.\",\"Required-skills coverage 0% is below the 60% minimum. Missing: Cash Handling, Check-in \\/ Check-out, Guest Relations, Property Management Systems, Reservations.\",\"Overall score 62.0% is below the 75.0% threshold.\",\"Lowest-scoring component: skills (12.0\\/40.0 pts).\",\"Alternative job analysis: highest-scoring open position \'Bartender\' reached only 73.2%, below the 75.0% recommendation threshold.\"]', '{\"base_model\":\"en_core_web_sm\",\"custom_ner_loaded\":true,\"custom_ner_path\":\"C:\\\\Users\\\\Windows 10 Lite\\\\Downloads\\\\MUNJOR\\\\4TH YR\\\\DEV\\\\LATEST CLONE\\\\v5\\\\2nd-repo-for-hrms-backend-\\\\nlp-service\\\\models_spacy\\\\role_specific_ner\"}', NULL, '2026-08-25 13:13:41', '2026-08-25 13:13:41', '2026-08-25 13:13:41'),
(15, 40, 16, 'PARTIALLY_PROCESSED', 'not-fit', 62.00, '{\"skills\":{\"weight\":0.4,\"earned\":12,\"max\":40,\"matched_required\":[],\"fuzzy_matched_required\":[],\"missing_required\":[\"Cash Handling\",\"Check-in \\/ Check-out\",\"Guest Relations\",\"Property Management Systems\",\"Reservations\"],\"matched_preferred\":[],\"missing_preferred\":[],\"required_coverage\":0,\"preferred_coverage\":1},\"experience\":{\"weight\":0.3,\"earned\":30,\"max\":30,\"estimated_years\":7.5,\"min_years_required\":1,\"requirement_met\":true},\"education\":{\"weight\":0.2,\"earned\":10,\"max\":20,\"applicant_highest_level\":[\"Diploma in Hospitality Services - STI College, Pasay\"],\"required_level\":\"Bachelor\'s Degree\",\"requirement_met\":false},\"certifications\":{\"weight\":0.1,\"earned\":10,\"max\":10,\"matched\":[],\"missing\":[],\"no_requirements\":true}}', '{\"personal_information\":{\"name\":\"Roberto James Castillo\",\"email\":\"roberto.castillo.laundry@gmail.com\",\"phone\":\"+63 919 337 5502\",\"address\":\"88 Malvar St., Brgy. Malibay, Pasay City, Philippines\"},\"education\":[\"Diploma in Hospitality Services - STI College, Pasay\"],\"work_experience\":[{\"job_title\":\"Supervisor\",\"company\":null,\"location\":null,\"period\":\"April 2022 - Present\",\"recognized_role\":true},{\"job_title\":\"Laundry Attendant\",\"company\":null,\"location\":null,\"period\":\"January 2020 - March 2022\",\"recognized_role\":true},{\"job_title\":\"Laundry Attendant\",\"company\":null,\"location\":null,\"period\":\"June 2018 - December 2019\",\"recognized_role\":true}],\"skills\":[\"Food Safety\",\"Housekeeping Operations\",\"Inventory Control\",\"Linen Handling\",\"Problem Solving\",\"Safety Compliance\",\"Scheduling\",\"Time Management\"],\"certifications\":[\"TESDA Housekeeping NC II\",\"Hygiene And Sanitation Training\",\"Laundry Operations Training\",\"Workplace Safety Training\"],\"unrecognized_certifications\":[\"Hygiene And Sanitation Training\",\"Laundry Operations Training\",\"Workplace Safety Training\"],\"estimated_years_experience\":7.5,\"job_roles\":{\"recognized\":[\"Laundry Attendant\",\"Supervisor\"],\"unrecognized\":[]},\"unrecognized_skills\":[\"Hygiene\",\"Laundry Quality Control\",\"Staff Supervision\",\"Team Leadership\",\"Uniform Management\"]}', '[{\"label\":\"PERSON\",\"value\":\"Roberto James Castillo\",\"source\":\"rule\"},{\"label\":\"EDUCATION\",\"value\":\"Diploma in Hospitality Services - STI College, Pasay\",\"source\":\"section_rule\"},{\"label\":\"JOB_TITLE\",\"value\":\"Supervisor\",\"source\":\"section_rule\"},{\"label\":\"JOB_TITLE\",\"value\":\"Laundry Attendant\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Linen Handling\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Staff Supervision\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Laundry Quality Control\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Uniform Management\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Inventory Control\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Scheduling\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Hygiene\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Food Safety\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Team Leadership\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Time Management\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Problem Solving\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Housekeeping Operations\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Safety Compliance\",\"source\":\"reference_scan\"},{\"label\":\"CERTIFICATION\",\"value\":\"TESDA Housekeeping NC II\",\"source\":\"section_rule\"},{\"label\":\"CERTIFICATION\",\"value\":\"Laundry Operations Training\",\"source\":\"hint_pattern\"},{\"label\":\"CERTIFICATION\",\"value\":\"Workplace Safety Training\",\"source\":\"hint_pattern\"},{\"label\":\"CERTIFICATION\",\"value\":\"Hygiene And Sanitation Training\",\"source\":\"hint_pattern\"},{\"label\":\"ORGANIZATION\",\"value\":\"Oversee\",\"source\":\"section_rule\"},{\"label\":\"ORGANIZATION\",\"value\":\"Enforce\",\"source\":\"section_rule\"},{\"label\":\"EMAIL\",\"value\":\"roberto.castillo.laundry@gmail.com\",\"source\":\"regex\"},{\"label\":\"PHONE\",\"value\":\"+63 919 337 5502\",\"source\":\"regex\"}]', '[]', '{\"missing_information\":[],\"invalid_format\":[],\"skill_analysis\":{\"recognized\":[\"Food Safety\",\"Housekeeping Operations\",\"Inventory Control\",\"Linen Handling\",\"Problem Solving\",\"Safety Compliance\",\"Scheduling\",\"Time Management\"],\"unrecognized\":[\"Hygiene\",\"Laundry Quality Control\",\"Staff Supervision\",\"Team Leadership\",\"Uniform Management\"]},\"job_role_analysis\":{\"recognized\":[\"Laundry Attendant\",\"Supervisor\"],\"unrecognized\":[]},\"credential_analysis\":[{\"required\":null,\"extracted\":\"Hygiene And Sanitation Training\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"},{\"required\":null,\"extracted\":\"Laundry Operations Training\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"},{\"required\":null,\"extracted\":\"Workplace Safety Training\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"}],\"credential_issues\":[],\"review_flags\":[]}', NULL, '[\"Education does not meet the requirement of the applied job.\",\"Required-skills coverage 0% is below the 60% minimum. Missing: Cash Handling, Check-in \\/ Check-out, Guest Relations, Property Management Systems, Reservations.\",\"Overall score 62.0% is below the 75.0% threshold.\",\"Lowest-scoring component: skills (12.0\\/40.0 pts).\",\"Alternative job analysis: highest-scoring open position \'Bartender\' reached only 73.2%, below the 75.0% recommendation threshold.\"]', '{\"base_model\":\"en_core_web_sm\",\"custom_ner_loaded\":true,\"custom_ner_path\":\"C:\\\\Users\\\\Windows 10 Lite\\\\Downloads\\\\MUNJOR\\\\4TH YR\\\\DEV\\\\LATEST CLONE\\\\v5\\\\2nd-repo-for-hrms-backend-\\\\nlp-service\\\\models_spacy\\\\role_specific_ner\"}', NULL, '2026-08-25 13:20:15', '2026-08-25 13:20:15', '2026-08-25 13:20:15'),
(16, 41, 16, 'PARTIALLY_PROCESSED', 'not-fit', 83.20, '{\"skills\":{\"weight\":0.4,\"earned\":23.2,\"max\":40,\"matched_required\":[\"Cash Handling\",\"Guest Relations\"],\"fuzzy_matched_required\":[],\"missing_required\":[\"Check-in \\/ Check-out\",\"Property Management Systems\",\"Reservations\"],\"matched_preferred\":[],\"missing_preferred\":[],\"required_coverage\":0.4,\"preferred_coverage\":1},\"experience\":{\"weight\":0.3,\"earned\":30,\"max\":30,\"estimated_years\":7.5,\"min_years_required\":1,\"requirement_met\":true},\"education\":{\"weight\":0.2,\"earned\":20,\"max\":20,\"applicant_highest_level\":[\"Bachelor of Science in Hospitality Management\"],\"required_level\":\"Bachelor\'s Degree\",\"requirement_met\":true},\"certifications\":{\"weight\":0.1,\"earned\":10,\"max\":10,\"matched\":[],\"missing\":[],\"no_requirements\":true}}', '{\"personal_information\":{\"name\":\"Samantha Nicole Dela Cruz\",\"email\":\"samantha.delacruz.fnb@gmail.com\",\"phone\":\"+63 918 664 2317\",\"address\":\"Mandaluyong City, Philippines\"},\"education\":[\"Bachelor of Science in Hospitality Management\"],\"work_experience\":[{\"job_title\":\"Supervisor\",\"company\":\"Restaurant Bar Operations Supervisor\",\"location\":null,\"period\":\"January 2023 - Present\",\"recognized_role\":true},{\"job_title\":\"Copper & Vine Restaurant and Lounge\",\"company\":\"Senior Bartender\",\"location\":null,\"period\":\"March 2020 - December 2022\",\"recognized_role\":false},{\"job_title\":\"The Ember Room, Aurelia Hotel Manila\",\"company\":\"Bar Team Leader\",\"location\":null,\"period\":\"July 2018 - February 2020\",\"recognized_role\":false}],\"skills\":[\"Cash Handling\",\"Complaint Handling\",\"Customer Service\",\"Guest Recovery\",\"Guest Relations\",\"Inventory Control\",\"MS Office\",\"POS Systems\",\"Problem Solving\",\"Scheduling\",\"Staff Training\",\"Upselling\"],\"certifications\":[\"Bar Operations Training\",\"Basic Supervisory Skills Training\",\"Customer Service Excellence Training\",\"Responsible Beverage Service Training\"],\"unrecognized_certifications\":[\"Bar Operations Training\",\"Basic Supervisory Skills Training\",\"Customer Service Excellence Training\",\"Responsible Beverage Service Training\"],\"estimated_years_experience\":7.5,\"job_roles\":{\"recognized\":[\"Supervisor\"],\"unrecognized\":[\"Copper & Vine Restaurant and Lounge\",\"The Ember Room, Aurelia Hotel Manila\"]},\"unrecognized_skills\":[]}', '[{\"label\":\"PERSON\",\"value\":\"Samantha Nicole Dela Cruz\",\"source\":\"rule\"},{\"label\":\"EDUCATION\",\"value\":\"Bachelor of Science in Hospitality Management\",\"source\":\"section_rule\"},{\"label\":\"JOB_TITLE\",\"value\":\"Supervisor\",\"source\":\"section_rule\"},{\"label\":\"JOB_TITLE\",\"value\":\"Copper & Vine Restaurant and Lounge\",\"source\":\"section_rule\"},{\"label\":\"JOB_TITLE\",\"value\":\"The Ember Room, Aurelia Hotel Manila\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Cash Handling\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Complaint Handling\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Customer Service\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Guest Recovery\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Guest Relations\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Inventory Control\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"MS Office\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"POS Systems\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Problem Solving\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Scheduling\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Staff Training\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Upselling\",\"source\":\"reference_scan\"},{\"label\":\"CERTIFICATION\",\"value\":\"Responsible Beverage Service Training\",\"source\":\"hint_pattern\"},{\"label\":\"CERTIFICATION\",\"value\":\"Basic Supervisory Skills Training\",\"source\":\"hint_pattern\"},{\"label\":\"CERTIFICATION\",\"value\":\"Bar Operations Training\",\"source\":\"hint_pattern\"},{\"label\":\"CERTIFICATION\",\"value\":\"Customer Service Excellence Training\",\"source\":\"hint_pattern\"},{\"label\":\"ORGANIZATION\",\"value\":\"Restaurant Bar Operations Supervisor\",\"source\":\"section_rule\"},{\"label\":\"ORGANIZATION\",\"value\":\"Senior Bartender\",\"source\":\"section_rule\"},{\"label\":\"ORGANIZATION\",\"value\":\"Bar Team Leader\",\"source\":\"section_rule\"},{\"label\":\"ORGANIZATION\",\"value\":\"Coordinated\",\"source\":\"section_rule\"},{\"label\":\"ORGANIZATION\",\"value\":\"Salt & Barrel Gastropub\",\"source\":\"section_rule\"},{\"label\":\"ORGANIZATION\",\"value\":\"Assisted\",\"source\":\"section_rule\"},{\"label\":\"EMAIL\",\"value\":\"samantha.delacruz.fnb@gmail.com\",\"source\":\"regex\"},{\"label\":\"PHONE\",\"value\":\"+63 918 664 2317\",\"source\":\"regex\"}]', '[]', '{\"missing_information\":[],\"invalid_format\":[],\"skill_analysis\":{\"recognized\":[\"Cash Handling\",\"Complaint Handling\",\"Customer Service\",\"Guest Recovery\",\"Guest Relations\",\"Inventory Control\",\"MS Office\",\"POS Systems\",\"Problem Solving\",\"Scheduling\",\"Staff Training\",\"Upselling\"],\"unrecognized\":[]},\"job_role_analysis\":{\"recognized\":[\"Supervisor\"],\"unrecognized\":[\"Copper & Vine Restaurant and Lounge\",\"The Ember Room, Aurelia Hotel Manila\"]},\"credential_analysis\":[{\"required\":null,\"extracted\":\"Bar Operations Training\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"},{\"required\":null,\"extracted\":\"Basic Supervisory Skills Training\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"},{\"required\":null,\"extracted\":\"Customer Service Excellence Training\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"},{\"required\":null,\"extracted\":\"Responsible Beverage Service Training\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"}],\"credential_issues\":[],\"review_flags\":[{\"type\":\"UNRECOGNIZED_JOB_ROLE\",\"detail\":\"Copper & Vine Restaurant and Lounge\",\"note\":\"Not found in system reference data; flagged for manual review only.\"},{\"type\":\"UNRECOGNIZED_JOB_ROLE\",\"detail\":\"The Ember Room, Aurelia Hotel Manila\",\"note\":\"Not found in system reference data; flagged for manual review only.\"}]}', NULL, '[\"Required-skills coverage 40% is below the 60% minimum. Missing: Check-in \\/ Check-out, Property Management Systems, Reservations.\",\"Alternative job analysis: highest-scoring open position \'Guest Relations Officer\' reached only 86.0%, below the 75.0% recommendation threshold.\"]', '{\"base_model\":\"en_core_web_sm\",\"custom_ner_loaded\":true,\"custom_ner_path\":\"C:\\\\Users\\\\Windows 10 Lite\\\\Downloads\\\\MUNJOR\\\\4TH YR\\\\DEV\\\\LATEST CLONE\\\\v5\\\\2nd-repo-for-hrms-backend-\\\\nlp-service\\\\models_spacy\\\\role_specific_ner\"}', NULL, '2026-08-25 13:20:53', '2026-08-25 13:20:53', '2026-08-25 13:20:53'),
(17, 42, 16, 'PARTIALLY_PROCESSED', 'fit', 100.00, '{\"skills\":{\"weight\":0.4,\"earned\":40,\"max\":40,\"matched_required\":[\"Cash Handling\",\"Check-in \\/ Check-out\",\"Guest Relations\",\"Property Management Systems\",\"Reservations\"],\"fuzzy_matched_required\":[],\"missing_required\":[],\"matched_preferred\":[],\"missing_preferred\":[],\"required_coverage\":1,\"preferred_coverage\":1},\"experience\":{\"weight\":0.3,\"earned\":30,\"max\":30,\"estimated_years\":5,\"min_years_required\":1,\"requirement_met\":true},\"education\":{\"weight\":0.2,\"earned\":20,\"max\":20,\"applicant_highest_level\":[\"Bachelor of Science in Hospitality Management - Philippine School of Business Admin\"],\"required_level\":\"Bachelor\'s Degree\",\"requirement_met\":true},\"certifications\":{\"weight\":0.1,\"earned\":10,\"max\":10,\"matched\":[],\"missing\":[],\"no_requirements\":true}}', '{\"personal_information\":{\"name\":\"Vincent Paul Soriano\",\"email\":\"vincent.soriano.hotel@gmail.com\",\"phone\":\"+63 917 245 8813\",\"address\":\"Blk 14 Lot 7, Sampaguita St., Brgy. San Isidro, Manila, Philippines\"},\"education\":[\"Bachelor of Science in Hospitality Management - Philippine School of Business Admin\"],\"work_experience\":[{\"job_title\":\"Hotel Night Auditor\",\"company\":null,\"location\":null,\"period\":\"March 2023 - Present\",\"recognized_role\":false},{\"job_title\":\"Front Desk Associate\",\"company\":null,\"location\":null,\"period\":\"June 2021 - February 2023\",\"recognized_role\":false}],\"skills\":[\"Attention to Detail\",\"Cash Handling\",\"Check-in \\/ Check-out\",\"Customer Service\",\"Front Office Operations\",\"Guest Relations\",\"Housekeeping Operations\",\"MS Office\",\"POS Systems\",\"Problem Solving\",\"Property Management Systems\",\"Records Documentation\",\"Reservations\",\"Time Management\"],\"certifications\":[\"Basic Bookkeeping And Accounting Training\",\"Customer Service Excellence Training - Manila Tourism Training\",\"Hotel Front Office Operations Training\",\"Microsoft Excel For Financial Reporting - Online Certification\"],\"unrecognized_certifications\":[\"Basic Bookkeeping And Accounting Training\",\"Customer Service Excellence Training - Manila Tourism Training\",\"Hotel Front Office Operations Training\",\"Microsoft Excel For Financial Reporting - Online Certification\"],\"estimated_years_experience\":5,\"job_roles\":{\"recognized\":[\"Maintenance Technician\"],\"unrecognized\":[\"Front Desk Associate\",\"Hotel Night Auditor\"]},\"unrecognized_skills\":[\"Cash Reconciliation\",\"Hotel Reservation Systems\",\"Night Audit Procedures\",\"Payment Processing\"]}', '[{\"label\":\"PERSON\",\"value\":\"Vincent Paul Soriano\",\"source\":\"rule\"},{\"label\":\"EDUCATION\",\"value\":\"Bachelor of Science in Hospitality Management - Philippine School of Business Admin\",\"source\":\"section_rule\"},{\"label\":\"JOB_TITLE\",\"value\":\"Hotel Night Auditor\",\"source\":\"section_rule\"},{\"label\":\"JOB_TITLE\",\"value\":\"Maintenance Technician\",\"source\":\"section_rule\"},{\"label\":\"JOB_TITLE\",\"value\":\"Front Desk Associate\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Night Audit Procedures\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Front Office Operations\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Cash Reconciliation\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Hotel Reservation Systems\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Guest Relations\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Payment Processing\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Check-in \\/ Check-out\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Records Documentation\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Attention to Detail\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Problem Solving\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Time Management\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Cash Handling\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Customer Service\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Housekeeping Operations\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"MS Office\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"POS Systems\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Property Management Systems\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Reservations\",\"source\":\"reference_scan\"},{\"label\":\"CERTIFICATION\",\"value\":\"Hotel Front Office Operations Training\",\"source\":\"hint_pattern\"},{\"label\":\"CERTIFICATION\",\"value\":\"Basic Bookkeeping And Accounting Training\",\"source\":\"hint_pattern\"},{\"label\":\"CERTIFICATION\",\"value\":\"Customer Service Excellence Training - Manila Tourism Training\",\"source\":\"hint_pattern\"},{\"label\":\"CERTIFICATION\",\"value\":\"Microsoft Excel For Financial Reporting - Online Certification\",\"source\":\"hint_pattern\"},{\"label\":\"ORGANIZATION\",\"value\":\"Prepare\",\"source\":\"section_rule\"},{\"label\":\"ORGANIZATION\",\"value\":\"Opera PMS\",\"source\":\"section_rule\"},{\"label\":\"EMAIL\",\"value\":\"vincent.soriano.hotel@gmail.com\",\"source\":\"regex\"},{\"label\":\"PHONE\",\"value\":\"+63 917 245 8813\",\"source\":\"regex\"}]', '[]', '{\"missing_information\":[],\"invalid_format\":[],\"skill_analysis\":{\"recognized\":[\"Attention to Detail\",\"Cash Handling\",\"Check-in \\/ Check-out\",\"Customer Service\",\"Front Office Operations\",\"Guest Relations\",\"Housekeeping Operations\",\"MS Office\",\"POS Systems\",\"Problem Solving\",\"Property Management Systems\",\"Records Documentation\",\"Reservations\",\"Time Management\"],\"unrecognized\":[\"Cash Reconciliation\",\"Hotel Reservation Systems\",\"Night Audit Procedures\",\"Payment Processing\"]},\"job_role_analysis\":{\"recognized\":[\"Maintenance Technician\"],\"unrecognized\":[\"Front Desk Associate\",\"Hotel Night Auditor\"]},\"credential_analysis\":[{\"required\":null,\"extracted\":\"Basic Bookkeeping And Accounting Training\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"},{\"required\":null,\"extracted\":\"Customer Service Excellence Training - Manila Tourism Training\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"},{\"required\":null,\"extracted\":\"Hotel Front Office Operations Training\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"},{\"required\":null,\"extracted\":\"Microsoft Excel For Financial Reporting - Online Certification\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"}],\"credential_issues\":[],\"review_flags\":[{\"type\":\"UNRECOGNIZED_JOB_ROLE\",\"detail\":\"Front Desk Associate\",\"note\":\"Not found in system reference data; flagged for manual review only.\"},{\"type\":\"UNRECOGNIZED_JOB_ROLE\",\"detail\":\"Hotel Night Auditor\",\"note\":\"Not found in system reference data; flagged for manual review only.\"}]}', NULL, '[\"Overall match score 100.0% reached the required threshold of 75.0% for Front Desk Receptionist.\",\"Matched required skills: Cash Handling, Check-in \\/ Check-out, Guest Relations, Property Management Systems, Reservations.\",\"Education requirement met: True; experience requirement met: True (5.0 yrs vs 1.0 yrs minimum).\"]', '{\"base_model\":\"en_core_web_sm\",\"custom_ner_loaded\":true,\"custom_ner_path\":\"C:\\\\Users\\\\Windows 10 Lite\\\\Downloads\\\\MUNJOR\\\\4TH YR\\\\DEV\\\\LATEST CLONE\\\\v5\\\\2nd-repo-for-hrms-backend-\\\\nlp-service\\\\models_spacy\\\\role_specific_ner\"}', NULL, '2026-08-25 13:42:45', '2026-08-25 13:42:45', '2026-08-25 13:42:45');
INSERT INTO `applicant_screenings` (`screening_id`, `applicant_id`, `job_post_id`, `processing_status`, `screening_result`, `match_score`, `score_breakdown_json`, `profile_json`, `entities_json`, `missing_information_json`, `validation_json`, `alternative_job_json`, `reasons_json`, `model_info_json`, `error_message`, `processed_at`, `created_at`, `updated_at`) VALUES
(18, 43, 16, 'PARTIALLY_PROCESSED', 'not-fit', 57.60, '{\"skills\":{\"weight\":0.4,\"earned\":17.6,\"max\":40,\"matched_required\":[\"Cash Handling\"],\"fuzzy_matched_required\":[],\"missing_required\":[\"Check-in \\/ Check-out\",\"Guest Relations\",\"Property Management Systems\",\"Reservations\"],\"matched_preferred\":[],\"missing_preferred\":[],\"required_coverage\":0.2,\"preferred_coverage\":1},\"experience\":{\"weight\":0.3,\"earned\":30,\"max\":30,\"estimated_years\":3.75,\"min_years_required\":1,\"requirement_met\":true},\"education\":{\"weight\":0.2,\"earned\":0,\"max\":20,\"applicant_highest_level\":[\"Senior High School Diploma\"],\"required_level\":\"Bachelor\'s Degree\",\"requirement_met\":false},\"certifications\":{\"weight\":0.1,\"earned\":10,\"max\":10,\"matched\":[],\"missing\":[],\"no_requirements\":true}}', '{\"personal_information\":{\"name\":\"ANGELA MARIE CRUZ\",\"email\":\"angela.cruz.fnb@gmail.com\",\"phone\":\"0906 3728841\",\"address\":\"Quezon City, Philippines\"},\"education\":[\"Senior High School Diploma\"],\"work_experience\":[{\"job_title\":\"Barista\",\"company\":\"Cloudwater Coffee Roasters\",\"location\":\"Quezon City, Philippines\",\"period\":\"April 2024 - Present\",\"recognized_role\":true},{\"job_title\":\"Cloudwater Coffee Roasters\",\"company\":\"Restaurant Server\",\"location\":null,\"period\":\"February 2022 - March 2024\",\"recognized_role\":false},{\"job_title\":\"Supervisor\",\"company\":\"Food and Beverage Attendant\",\"location\":null,\"period\":\"June 2021 - January 2022\",\"recognized_role\":true}],\"skills\":[\"Barista Operations\",\"Cash Handling\",\"Coffee Preparation\",\"Customer Service\",\"Food Safety\",\"POS Systems\",\"Plating\",\"Teamwork\",\"Time Management\",\"Upselling\"],\"certifications\":[\"TESDA Food and Beverage Services NC II\",\"Barista And Coffee Craft Training\",\"Customer Service Excellence Training\",\"Food Safety And Hygiene Training\"],\"unrecognized_certifications\":[\"Barista And Coffee Craft Training\",\"Customer Service Excellence Training\",\"Food Safety And Hygiene Training\"],\"estimated_years_experience\":3.75,\"job_roles\":{\"recognized\":[\"Barista\",\"Supervisor\"],\"unrecognized\":[\"Cloudwater Coffee Roasters\"]},\"unrecognized_skills\":[]}', '[{\"label\":\"PERSON\",\"value\":\"ANGELA MARIE CRUZ\",\"source\":\"rule\"},{\"label\":\"EDUCATION\",\"value\":\"Senior High School Diploma\",\"source\":\"section_rule\"},{\"label\":\"JOB_TITLE\",\"value\":\"Barista\",\"source\":\"section_rule\"},{\"label\":\"JOB_TITLE\",\"value\":\"Cloudwater Coffee Roasters\",\"source\":\"section_rule\"},{\"label\":\"JOB_TITLE\",\"value\":\"Supervisor\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Cash Handling\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Barista Operations\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Coffee Preparation\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Customer Service\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Food Safety\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Plating\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"POS Systems\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Teamwork\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Time Management\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Upselling\",\"source\":\"reference_scan\"},{\"label\":\"CERTIFICATION\",\"value\":\"TESDA Food and Beverage Services NC II\",\"source\":\"section_rule\"},{\"label\":\"CERTIFICATION\",\"value\":\"Barista And Coffee Craft Training\",\"source\":\"hint_pattern\"},{\"label\":\"CERTIFICATION\",\"value\":\"Food Safety And Hygiene Training\",\"source\":\"hint_pattern\"},{\"label\":\"CERTIFICATION\",\"value\":\"Customer Service Excellence Training\",\"source\":\"hint_pattern\"},{\"label\":\"ORGANIZATION\",\"value\":\"Cloudwater Coffee Roasters\",\"source\":\"section_rule\"},{\"label\":\"ORGANIZATION\",\"value\":\"Restaurant Server\",\"source\":\"section_rule\"},{\"label\":\"ORGANIZATION\",\"value\":\"Food and Beverage Attendant\",\"source\":\"section_rule\"},{\"label\":\"ORGANIZATION\",\"value\":\"Prepare\",\"source\":\"section_rule\"},{\"label\":\"ORGANIZATION\",\"value\":\"Regularly\",\"source\":\"section_rule\"},{\"label\":\"EMAIL\",\"value\":\"angela.cruz.fnb@gmail.com\",\"source\":\"regex\"},{\"label\":\"PHONE\",\"value\":\"0906 3728841\",\"source\":\"regex\"},{\"label\":\"PHONE\",\"value\":\"09063728841\",\"source\":\"regex\"}]', '[]', '{\"missing_information\":[],\"invalid_format\":[],\"skill_analysis\":{\"recognized\":[\"Barista Operations\",\"Cash Handling\",\"Coffee Preparation\",\"Customer Service\",\"Food Safety\",\"POS Systems\",\"Plating\",\"Teamwork\",\"Time Management\",\"Upselling\"],\"unrecognized\":[]},\"job_role_analysis\":{\"recognized\":[\"Barista\",\"Supervisor\"],\"unrecognized\":[\"Cloudwater Coffee Roasters\"]},\"credential_analysis\":[{\"required\":null,\"extracted\":\"Barista And Coffee Craft Training\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"},{\"required\":null,\"extracted\":\"Customer Service Excellence Training\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"},{\"required\":null,\"extracted\":\"Food Safety And Hygiene Training\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"}],\"credential_issues\":[],\"review_flags\":[{\"type\":\"UNRECOGNIZED_JOB_ROLE\",\"detail\":\"Cloudwater Coffee Roasters\",\"note\":\"Not found in system reference data; flagged for manual review only.\"}]}', NULL, '[\"Education does not meet the requirement of the applied job.\",\"Required-skills coverage 20% is below the 60% minimum. Missing: Check-in \\/ Check-out, Guest Relations, Property Management Systems, Reservations.\",\"Overall score 57.6% is below the 75.0% threshold.\",\"Lowest-scoring component: education (0.0\\/20.0 pts).\",\"Alternative job analysis: highest-scoring open position \'Bartender\' reached only 63.2%, below the 75.0% recommendation threshold.\"]', '{\"base_model\":\"en_core_web_sm\",\"custom_ner_loaded\":true,\"custom_ner_path\":\"C:\\\\Users\\\\Windows 10 Lite\\\\Downloads\\\\MUNJOR\\\\4TH YR\\\\DEV\\\\LATEST CLONE\\\\v5\\\\2nd-repo-for-hrms-backend-\\\\nlp-service\\\\models_spacy\\\\role_specific_ner\"}', NULL, '2026-08-25 13:45:32', '2026-08-25 13:45:32', '2026-08-25 13:45:32'),
(19, 44, 16, 'PARTIALLY_PROCESSED', 'not-fit', 72.00, '{\"skills\":{\"weight\":0.4,\"earned\":12,\"max\":40,\"matched_required\":[],\"fuzzy_matched_required\":[],\"missing_required\":[\"Cash Handling\",\"Check-in \\/ Check-out\",\"Guest Relations\",\"Property Management Systems\",\"Reservations\"],\"matched_preferred\":[],\"missing_preferred\":[],\"required_coverage\":0,\"preferred_coverage\":1},\"experience\":{\"weight\":0.3,\"earned\":30,\"max\":30,\"estimated_years\":6.25,\"min_years_required\":1,\"requirement_met\":true},\"education\":{\"weight\":0.2,\"earned\":20,\"max\":20,\"applicant_highest_level\":[\"Bachelor of Science in Food Technology - University of Perpetual Help System DALTA\"],\"required_level\":\"Bachelor\'s Degree\",\"requirement_met\":true},\"certifications\":{\"weight\":0.1,\"earned\":10,\"max\":10,\"matched\":[],\"missing\":[],\"no_requirements\":true}}', '{\"personal_information\":{\"name\":\"Bianca Louise Garcia\",\"email\":\"bianca.garcia.qa@gmail.com\",\"phone\":\"+63 918 662 4471\",\"address\":\"45 Marigold St., BF Resort Village, Las Pi\\u00f1as City, Philippines\"},\"education\":[\"Bachelor of Science in Food Technology - University of Perpetual Help System DALTA\"],\"work_experience\":[{\"job_title\":\"Restaurant Quality Assurance Officer\",\"company\":null,\"location\":null,\"period\":\"January 2023 - Present\",\"recognized_role\":false},{\"job_title\":\"Food Safety Officer\",\"company\":null,\"location\":null,\"period\":\"July 2020 - December 2022\",\"recognized_role\":false},{\"job_title\":\"Supervisor\",\"company\":null,\"location\":null,\"period\":\"March 2019 - June 2020\",\"recognized_role\":true}],\"skills\":[\"Attention to Detail\",\"Food Safety\",\"HACCP\",\"MS Office\",\"Problem Solving\",\"Records Documentation\",\"Staff Training\"],\"certifications\":[\"Basic Occupational Safety And Health Training\",\"Food Safety And Hygiene Certification\",\"Haccp Awareness Training\",\"Internal Quality Audit Training\"],\"unrecognized_certifications\":[\"Basic Occupational Safety And Health Training\",\"Food Safety And Hygiene Certification\",\"Haccp Awareness Training\",\"Internal Quality Audit Training\"],\"estimated_years_experience\":6.25,\"job_roles\":{\"recognized\":[\"Supervisor\"],\"unrecognized\":[\"Food Safety Officer\",\"Restaurant Quality Assurance Officer\"]},\"unrecognized_skills\":[\"Food Handling Standards\",\"Internal Auditing\",\"Quality Assurance\",\"Restaurant Compliance\"]}', '[{\"label\":\"PERSON\",\"value\":\"Bianca Louise Garcia\",\"source\":\"rule\"},{\"label\":\"EDUCATION\",\"value\":\"Bachelor of Science in Food Technology - University of Perpetual Help System DALTA\",\"source\":\"section_rule\"},{\"label\":\"JOB_TITLE\",\"value\":\"Restaurant Quality Assurance Officer\",\"source\":\"section_rule\"},{\"label\":\"JOB_TITLE\",\"value\":\"Food Safety Officer\",\"source\":\"section_rule\"},{\"label\":\"JOB_TITLE\",\"value\":\"Supervisor\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"HACCP\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Quality Assurance\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Food Safety\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Food Handling Standards\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Restaurant Compliance\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Records Documentation\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Staff Training\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Internal Auditing\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Attention to Detail\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Problem Solving\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"MS Office\",\"source\":\"reference_scan\"},{\"label\":\"CERTIFICATION\",\"value\":\"Food Safety And Hygiene Certification\",\"source\":\"hint_pattern\"},{\"label\":\"CERTIFICATION\",\"value\":\"Haccp Awareness Training\",\"source\":\"hint_pattern\"},{\"label\":\"CERTIFICATION\",\"value\":\"Basic Occupational Safety And Health Training\",\"source\":\"hint_pattern\"},{\"label\":\"CERTIFICATION\",\"value\":\"Internal Quality Audit Training\",\"source\":\"hint_pattern\"},{\"label\":\"ORGANIZATION\",\"value\":\"Prepare\",\"source\":\"section_rule\"},{\"label\":\"EMAIL\",\"value\":\"bianca.garcia.qa@gmail.com\",\"source\":\"regex\"},{\"label\":\"PHONE\",\"value\":\"+63 918 662 4471\",\"source\":\"regex\"}]', '[]', '{\"missing_information\":[],\"invalid_format\":[],\"skill_analysis\":{\"recognized\":[\"Attention to Detail\",\"Food Safety\",\"HACCP\",\"MS Office\",\"Problem Solving\",\"Records Documentation\",\"Staff Training\"],\"unrecognized\":[\"Food Handling Standards\",\"Internal Auditing\",\"Quality Assurance\",\"Restaurant Compliance\"]},\"job_role_analysis\":{\"recognized\":[\"Supervisor\"],\"unrecognized\":[\"Food Safety Officer\",\"Restaurant Quality Assurance Officer\"]},\"credential_analysis\":[{\"required\":null,\"extracted\":\"Basic Occupational Safety And Health Training\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"},{\"required\":null,\"extracted\":\"Food Safety And Hygiene Certification\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"},{\"required\":null,\"extracted\":\"Haccp Awareness Training\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"},{\"required\":null,\"extracted\":\"Internal Quality Audit Training\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"}],\"credential_issues\":[],\"review_flags\":[{\"type\":\"UNRECOGNIZED_JOB_ROLE\",\"detail\":\"Food Safety Officer\",\"note\":\"Not found in system reference data; flagged for manual review only.\"},{\"type\":\"UNRECOGNIZED_JOB_ROLE\",\"detail\":\"Restaurant Quality Assurance Officer\",\"note\":\"Not found in system reference data; flagged for manual review only.\"}]}', NULL, '[\"Required-skills coverage 0% is below the 60% minimum. Missing: Cash Handling, Check-in \\/ Check-out, Guest Relations, Property Management Systems, Reservations.\",\"Overall score 72.0% is below the 75.0% threshold.\",\"Lowest-scoring component: skills (12.0\\/40.0 pts).\",\"Alternative job analysis: highest-scoring open position \'Bartender\' reached only 77.6%, below the 75.0% recommendation threshold.\"]', '{\"base_model\":\"en_core_web_sm\",\"custom_ner_loaded\":true,\"custom_ner_path\":\"C:\\\\Users\\\\Windows 10 Lite\\\\Downloads\\\\MUNJOR\\\\4TH YR\\\\DEV\\\\LATEST CLONE\\\\v5\\\\2nd-repo-for-hrms-backend-\\\\nlp-service\\\\models_spacy\\\\role_specific_ner\"}', NULL, '2026-08-25 13:47:37', '2026-08-25 13:47:37', '2026-08-25 13:47:37'),
(20, 45, 16, 'PARTIALLY_PROCESSED', 'fit', 100.00, '{\"skills\":{\"weight\":0.4,\"earned\":40,\"max\":40,\"matched_required\":[\"Cash Handling\",\"Check-in \\/ Check-out\",\"Guest Relations\",\"Property Management Systems\",\"Reservations\"],\"fuzzy_matched_required\":[],\"missing_required\":[],\"matched_preferred\":[],\"missing_preferred\":[],\"required_coverage\":1,\"preferred_coverage\":1},\"experience\":{\"weight\":0.3,\"earned\":30,\"max\":30,\"estimated_years\":3.75,\"min_years_required\":1,\"requirement_met\":true},\"education\":{\"weight\":0.2,\"earned\":20,\"max\":20,\"applicant_highest_level\":[\"Bachelor of Science in Hospitality Management\"],\"required_level\":\"Bachelor\'s Degree\",\"requirement_met\":true},\"certifications\":{\"weight\":0.1,\"earned\":10,\"max\":10,\"matched\":[],\"missing\":[],\"no_requirements\":true}}', '{\"personal_information\":{\"name\":\"ALYSSA MARIE\",\"email\":\"5678alyssa.valdez.spa@gmail.com\",\"phone\":\"+63 917 234 5678\",\"address\":\"Antipolo City, Rizal, Philippines\"},\"education\":[\"Bachelor of Science in Hospitality Management\"],\"work_experience\":[{\"job_title\":\"Front Desk Receptionist\",\"company\":\"The Cortina Wellness Resort & Spa\",\"location\":null,\"period\":\"June 2022 - Present\",\"recognized_role\":true},{\"job_title\":\"Spa Front Desk Associate\",\"company\":\"Serenity Springs Day Spa\",\"location\":null,\"period\":\"August 2020 - February 2021\",\"recognized_role\":false}],\"skills\":[\"Attention to Detail\",\"Cash Handling\",\"Check-in \\/ Check-out\",\"Communication\",\"Complaint Handling\",\"Customer Service\",\"Front Office Operations\",\"Guest Relations\",\"Housekeeping Operations\",\"MS Office\",\"POS Systems\",\"Property Management Systems\",\"Reservations\",\"Scheduling\",\"Time Management\"],\"certifications\":[\"Basic First Aid Training\",\"Cross Ph)\",\"Customer Service Excellence\",\"Spa Reception & Guest Service\",\"Wellness & Hospitality Service\"],\"unrecognized_certifications\":[\"Basic First Aid Training\",\"Cross Ph)\",\"Customer Service Excellence\",\"Spa Reception & Guest Service\",\"Wellness & Hospitality Service\"],\"estimated_years_experience\":3.75,\"job_roles\":{\"recognized\":[\"Concierge\",\"Front Desk Receptionist\"],\"unrecognized\":[\"Spa Front Desk Associate\"]},\"unrecognized_skills\":[\"Payment Processing\",\"Spa Reception\"]}', '[{\"label\":\"PERSON\",\"value\":\"ALYSSA MARIE\",\"source\":\"rule\"},{\"label\":\"EDUCATION\",\"value\":\"Bachelor of Science in Hospitality Management\",\"source\":\"section_rule\"},{\"label\":\"JOB_TITLE\",\"value\":\"Front Desk Receptionist\",\"source\":\"section_rule\"},{\"label\":\"JOB_TITLE\",\"value\":\"Concierge\",\"source\":\"section_rule\"},{\"label\":\"JOB_TITLE\",\"value\":\"Spa Front Desk Associate\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Spa Reception\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Scheduling\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Guest Relations\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Reservations\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Front Office Operations\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Payment Processing\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"POS Systems\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Customer Service\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Complaint Handling\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Time Management\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Attention to Detail\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Cash Handling\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Check-in \\/ Check-out\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Communication\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Housekeeping Operations\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"MS Office\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Property Management Systems\",\"source\":\"reference_scan\"},{\"label\":\"CERTIFICATION\",\"value\":\"Customer Service Excellence\",\"source\":\"section_rule\"},{\"label\":\"CERTIFICATION\",\"value\":\"Spa Reception & Guest Service\",\"source\":\"section_rule\"},{\"label\":\"CERTIFICATION\",\"value\":\"Basic First Aid Training\",\"source\":\"hint_pattern\"},{\"label\":\"CERTIFICATION\",\"value\":\"Cross Ph)\",\"source\":\"section_rule\"},{\"label\":\"CERTIFICATION\",\"value\":\"Wellness & Hospitality Service\",\"source\":\"section_rule\"},{\"label\":\"ORGANIZATION\",\"value\":\"The Cortina Wellness Resort & Spa\",\"source\":\"section_rule\"},{\"label\":\"ORGANIZATION\",\"value\":\"Serenity Springs Day Spa\",\"source\":\"section_rule\"},{\"label\":\"ORGANIZATION\",\"value\":\"Opera\",\"source\":\"section_rule\"},{\"label\":\"EMAIL\",\"value\":\"5678alyssa.valdez.spa@gmail.com\",\"source\":\"regex\"},{\"label\":\"PHONE\",\"value\":\"+63 917 234 5678\",\"source\":\"regex\"}]', '[]', '{\"missing_information\":[],\"invalid_format\":[],\"skill_analysis\":{\"recognized\":[\"Attention to Detail\",\"Cash Handling\",\"Check-in \\/ Check-out\",\"Communication\",\"Complaint Handling\",\"Customer Service\",\"Front Office Operations\",\"Guest Relations\",\"Housekeeping Operations\",\"MS Office\",\"POS Systems\",\"Property Management Systems\",\"Reservations\",\"Scheduling\",\"Time Management\"],\"unrecognized\":[\"Payment Processing\",\"Spa Reception\"]},\"job_role_analysis\":{\"recognized\":[\"Concierge\",\"Front Desk Receptionist\"],\"unrecognized\":[\"Spa Front Desk Associate\"]},\"credential_analysis\":[{\"required\":null,\"extracted\":\"Basic First Aid Training\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"},{\"required\":null,\"extracted\":\"Cross Ph)\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"},{\"required\":null,\"extracted\":\"Customer Service Excellence\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"},{\"required\":null,\"extracted\":\"Spa Reception & Guest Service\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"},{\"required\":null,\"extracted\":\"Wellness & Hospitality Service\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"}],\"credential_issues\":[],\"review_flags\":[{\"type\":\"UNRECOGNIZED_JOB_ROLE\",\"detail\":\"Spa Front Desk Associate\",\"note\":\"Not found in system reference data; flagged for manual review only.\"}]}', NULL, '[\"Overall match score 100.0% reached the required threshold of 75.0% for Front Desk Receptionist.\",\"Matched required skills: Cash Handling, Check-in \\/ Check-out, Guest Relations, Property Management Systems, Reservations.\",\"Education requirement met: True; experience requirement met: True (3.75 yrs vs 1.0 yrs minimum).\"]', '{\"base_model\":\"en_core_web_sm\",\"custom_ner_loaded\":true,\"custom_ner_path\":\"C:\\\\Users\\\\Windows 10 Lite\\\\Downloads\\\\MUNJOR\\\\4TH YR\\\\DEV\\\\LATEST CLONE\\\\v5\\\\2nd-repo-for-hrms-backend-\\\\nlp-service\\\\models_spacy\\\\role_specific_ner\"}', NULL, '2026-08-25 18:04:44', '2026-08-25 18:04:44', '2026-08-25 18:04:44'),
(21, 46, 16, 'PARTIALLY_PROCESSED', 'fit', 100.00, '{\"skills\":{\"weight\":0.4,\"earned\":40,\"max\":40,\"matched_required\":[\"Cash Handling\",\"Check-in \\/ Check-out\",\"Guest Relations\",\"Property Management Systems\",\"Reservations\"],\"fuzzy_matched_required\":[],\"missing_required\":[],\"matched_preferred\":[],\"missing_preferred\":[],\"required_coverage\":1,\"preferred_coverage\":1},\"experience\":{\"weight\":0.3,\"earned\":30,\"max\":30,\"estimated_years\":5,\"min_years_required\":1,\"requirement_met\":true},\"education\":{\"weight\":0.2,\"earned\":20,\"max\":20,\"applicant_highest_level\":[\"Bachelor of Science in Hospitality Management - Philippine School of Business Admin\"],\"required_level\":\"Bachelor\'s Degree\",\"requirement_met\":true},\"certifications\":{\"weight\":0.1,\"earned\":10,\"max\":10,\"matched\":[],\"missing\":[],\"no_requirements\":true}}', '{\"personal_information\":{\"name\":\"Vincent Paul Soriano\",\"email\":\"vincent.soriano.hotel@gmail.com\",\"phone\":\"+63 917 245 8813\",\"address\":\"Blk 14 Lot 7, Sampaguita St., Brgy. San Isidro, Manila, Philippines\"},\"education\":[\"Bachelor of Science in Hospitality Management - Philippine School of Business Admin\"],\"work_experience\":[{\"job_title\":\"Hotel Night Auditor\",\"company\":\"Hotel Night Auditor\",\"location\":null,\"period\":\"March 2023 - Present\",\"recognized_role\":false},{\"job_title\":\"with on-duty staff\",\"company\":\"Front Desk Associate\",\"location\":null,\"period\":\"June 2021 - February 2023\",\"recognized_role\":false},{\"job_title\":\"Bayview Suites & Residences\",\"company\":\"Accounts Assistant\",\"location\":null,\"period\":\"August 2020 - May 2021\",\"recognized_role\":false}],\"skills\":[\"Attention to Detail\",\"Cash Handling\",\"Check-in \\/ Check-out\",\"Customer Service\",\"Front Office Operations\",\"Guest Relations\",\"Housekeeping Operations\",\"MS Office\",\"POS Systems\",\"Problem Solving\",\"Property Management Systems\",\"Records Documentation\",\"Reservations\",\"Time Management\"],\"certifications\":[\"Basic Bookkeeping And Accounting Training\",\"Customer Service Excellence Training - Manila Tourism Training\",\"Hotel Front Office Operations Training\",\"Microsoft Excel For Financial Reporting - Online Certification\"],\"unrecognized_certifications\":[\"Basic Bookkeeping And Accounting Training\",\"Customer Service Excellence Training - Manila Tourism Training\",\"Hotel Front Office Operations Training\",\"Microsoft Excel For Financial Reporting - Online Certification\"],\"estimated_years_experience\":5,\"job_roles\":{\"recognized\":[],\"unrecognized\":[\"Bayview Suites & Residences\",\"Hotel Night Auditor\",\"with on-duty staff\"]},\"unrecognized_skills\":[\"Cash Reconciliation\",\"Hotel Reservation Systems\",\"Night Audit Procedures\",\"Payment Processing\"]}', '[{\"label\":\"PERSON\",\"value\":\"Vincent Paul Soriano\",\"source\":\"rule\"},{\"label\":\"EDUCATION\",\"value\":\"Bachelor of Science in Hospitality Management - Philippine School of Business Admin\",\"source\":\"section_rule\"},{\"label\":\"JOB_TITLE\",\"value\":\"Hotel Night Auditor\",\"source\":\"section_rule\"},{\"label\":\"JOB_TITLE\",\"value\":\"with on-duty staff\",\"source\":\"section_rule\"},{\"label\":\"JOB_TITLE\",\"value\":\"Bayview Suites & Residences\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Night Audit Procedures\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Front Office Operations\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Cash Reconciliation\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Hotel Reservation Systems\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Guest Relations\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Payment Processing\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Check-in \\/ Check-out\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Records Documentation\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Attention to Detail\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Problem Solving\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Time Management\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Cash Handling\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Customer Service\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Housekeeping Operations\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"MS Office\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"POS Systems\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Property Management Systems\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Reservations\",\"source\":\"reference_scan\"},{\"label\":\"CERTIFICATION\",\"value\":\"Hotel Front Office Operations Training\",\"source\":\"hint_pattern\"},{\"label\":\"CERTIFICATION\",\"value\":\"Basic Bookkeeping And Accounting Training\",\"source\":\"hint_pattern\"},{\"label\":\"CERTIFICATION\",\"value\":\"Customer Service Excellence Training - Manila Tourism Training\",\"source\":\"hint_pattern\"},{\"label\":\"CERTIFICATION\",\"value\":\"Microsoft Excel For Financial Reporting - Online Certification\",\"source\":\"hint_pattern\"},{\"label\":\"ORGANIZATION\",\"value\":\"Hotel Night Auditor\",\"source\":\"section_rule\"},{\"label\":\"ORGANIZATION\",\"value\":\"Front Desk Associate\",\"source\":\"section_rule\"},{\"label\":\"ORGANIZATION\",\"value\":\"Accounts Assistant\",\"source\":\"section_rule\"},{\"label\":\"ORGANIZATION\",\"value\":\"Opera PMS\",\"source\":\"section_rule\"},{\"label\":\"ORGANIZATION\",\"value\":\"Bayview Suites & Residences\",\"source\":\"section_rule\"},{\"label\":\"EMAIL\",\"value\":\"vincent.soriano.hotel@gmail.com\",\"source\":\"regex\"},{\"label\":\"PHONE\",\"value\":\"+63 917 245 8813\",\"source\":\"regex\"}]', '[]', '{\"missing_information\":[],\"invalid_format\":[],\"skill_analysis\":{\"recognized\":[\"Attention to Detail\",\"Cash Handling\",\"Check-in \\/ Check-out\",\"Customer Service\",\"Front Office Operations\",\"Guest Relations\",\"Housekeeping Operations\",\"MS Office\",\"POS Systems\",\"Problem Solving\",\"Property Management Systems\",\"Records Documentation\",\"Reservations\",\"Time Management\"],\"unrecognized\":[\"Cash Reconciliation\",\"Hotel Reservation Systems\",\"Night Audit Procedures\",\"Payment Processing\"]},\"job_role_analysis\":{\"recognized\":[],\"unrecognized\":[\"Bayview Suites & Residences\",\"Hotel Night Auditor\",\"with on-duty staff\"]},\"credential_analysis\":[{\"required\":null,\"extracted\":\"Basic Bookkeeping And Accounting Training\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"},{\"required\":null,\"extracted\":\"Customer Service Excellence Training - Manila Tourism Training\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"},{\"required\":null,\"extracted\":\"Hotel Front Office Operations Training\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"},{\"required\":null,\"extracted\":\"Microsoft Excel For Financial Reporting - Online Certification\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"}],\"credential_issues\":[],\"review_flags\":[{\"type\":\"UNRECOGNIZED_JOB_ROLE\",\"detail\":\"Bayview Suites & Residences\",\"note\":\"Not found in system reference data; flagged for manual review only.\"},{\"type\":\"UNRECOGNIZED_JOB_ROLE\",\"detail\":\"Hotel Night Auditor\",\"note\":\"Not found in system reference data; flagged for manual review only.\"},{\"type\":\"UNRECOGNIZED_JOB_ROLE\",\"detail\":\"with on-duty staff\",\"note\":\"Not found in system reference data; flagged for manual review only.\"}]}', NULL, '[\"Overall match score 100.0% reached the required threshold of 75.0% for Front Desk Receptionist.\",\"Matched required skills: Cash Handling, Check-in \\/ Check-out, Guest Relations, Property Management Systems, Reservations.\",\"Education requirement met: True; experience requirement met: True (5.0 yrs vs 1.0 yrs minimum).\"]', '{\"base_model\":\"en_core_web_sm\",\"custom_ner_loaded\":true,\"custom_ner_path\":\"C:\\\\Users\\\\Windows 10 Lite\\\\Downloads\\\\MUNJOR\\\\4TH YR\\\\DEV\\\\LATEST CLONE\\\\v5\\\\2nd-repo-for-hrms-backend-\\\\nlp-service\\\\models_spacy\\\\role_specific_ner\"}', NULL, '2026-08-25 18:33:18', '2026-08-25 18:33:18', '2026-08-25 18:33:18'),
(24, 53, 6, 'PARTIALLY_PROCESSED', 'other-role', 79.00, '{\"skills\":{\"weight\":0.4,\"earned\":19,\"max\":40,\"matched_required\":[\"MS Office\"],\"fuzzy_matched_required\":[],\"missing_required\":[\"Confidentiality\",\"Records Documentation\",\"Recruitment Support\"],\"matched_preferred\":[],\"missing_preferred\":[],\"required_coverage\":0.25,\"preferred_coverage\":1},\"experience\":{\"weight\":0.3,\"earned\":30,\"max\":30,\"estimated_years\":3.75,\"min_years_required\":1,\"requirement_met\":true},\"education\":{\"weight\":0.2,\"earned\":20,\"max\":20,\"applicant_highest_level\":[\"Bachelor of Science in Hospitality Management\"],\"required_level\":\"Bachelor\'s Degree\",\"requirement_met\":true},\"certifications\":{\"weight\":0.1,\"earned\":10,\"max\":10,\"matched\":[],\"missing\":[],\"no_requirements\":true}}', '{\"personal_information\":{\"name\":\"ALYSSA MARIE\",\"email\":\"5678alyssa.valdez.spa@gmail.com\",\"phone\":\"+63 917 234 5678\",\"address\":\"Antipolo City, Rizal, Philippines\"},\"education\":[\"Bachelor of Science in Hospitality Management\"],\"work_experience\":[{\"job_title\":\"Front Desk Receptionist\",\"company\":\"The Cortina Wellness Resort & Spa\",\"location\":null,\"period\":\"June 2022 - Present\",\"recognized_role\":true},{\"job_title\":\"Spa Front Desk Associate\",\"company\":\"Serenity Springs Day Spa\",\"location\":null,\"period\":\"August 2020 - February 2021\",\"recognized_role\":false}],\"skills\":[\"Attention to Detail\",\"Cash Handling\",\"Check-in \\/ Check-out\",\"Communication\",\"Complaint Handling\",\"Customer Service\",\"Front Office Operations\",\"Guest Relations\",\"Housekeeping Operations\",\"MS Office\",\"POS Systems\",\"Property Management Systems\",\"Reservations\",\"Scheduling\",\"Time Management\"],\"certifications\":[\"Basic First Aid Training\",\"Cross Ph)\",\"Customer Service Excellence\",\"Spa Reception & Guest Service\",\"Wellness & Hospitality Service\"],\"unrecognized_certifications\":[\"Basic First Aid Training\",\"Cross Ph)\",\"Customer Service Excellence\",\"Spa Reception & Guest Service\",\"Wellness & Hospitality Service\"],\"estimated_years_experience\":3.75,\"job_roles\":{\"recognized\":[\"Concierge\",\"Front Desk Receptionist\"],\"unrecognized\":[\"Spa Front Desk Associate\"]},\"unrecognized_skills\":[\"Payment Processing\",\"Spa Reception\"]}', '[{\"label\":\"PERSON\",\"value\":\"ALYSSA MARIE\",\"source\":\"rule\"},{\"label\":\"EDUCATION\",\"value\":\"Bachelor of Science in Hospitality Management\",\"source\":\"section_rule\"},{\"label\":\"JOB_TITLE\",\"value\":\"Front Desk Receptionist\",\"source\":\"section_rule\"},{\"label\":\"JOB_TITLE\",\"value\":\"Concierge\",\"source\":\"section_rule\"},{\"label\":\"JOB_TITLE\",\"value\":\"Spa Front Desk Associate\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Spa Reception\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Scheduling\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Guest Relations\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Reservations\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Front Office Operations\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Payment Processing\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"POS Systems\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Customer Service\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Complaint Handling\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Time Management\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Attention to Detail\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Cash Handling\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Check-in \\/ Check-out\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Communication\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Housekeeping Operations\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"MS Office\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Property Management Systems\",\"source\":\"reference_scan\"},{\"label\":\"CERTIFICATION\",\"value\":\"Customer Service Excellence\",\"source\":\"section_rule\"},{\"label\":\"CERTIFICATION\",\"value\":\"Spa Reception & Guest Service\",\"source\":\"section_rule\"},{\"label\":\"CERTIFICATION\",\"value\":\"Basic First Aid Training\",\"source\":\"hint_pattern\"},{\"label\":\"CERTIFICATION\",\"value\":\"Cross Ph)\",\"source\":\"section_rule\"},{\"label\":\"CERTIFICATION\",\"value\":\"Wellness & Hospitality Service\",\"source\":\"section_rule\"},{\"label\":\"ORGANIZATION\",\"value\":\"The Cortina Wellness Resort & Spa\",\"source\":\"section_rule\"},{\"label\":\"ORGANIZATION\",\"value\":\"Serenity Springs Day Spa\",\"source\":\"section_rule\"},{\"label\":\"ORGANIZATION\",\"value\":\"Opera\",\"source\":\"section_rule\"},{\"label\":\"EMAIL\",\"value\":\"5678alyssa.valdez.spa@gmail.com\",\"source\":\"regex\"},{\"label\":\"PHONE\",\"value\":\"+63 917 234 5678\",\"source\":\"regex\"}]', '[]', '{\"missing_information\":[],\"invalid_format\":[],\"skill_analysis\":{\"recognized\":[\"Attention to Detail\",\"Cash Handling\",\"Check-in \\/ Check-out\",\"Communication\",\"Complaint Handling\",\"Customer Service\",\"Front Office Operations\",\"Guest Relations\",\"Housekeeping Operations\",\"MS Office\",\"POS Systems\",\"Property Management Systems\",\"Reservations\",\"Scheduling\",\"Time Management\"],\"unrecognized\":[\"Payment Processing\",\"Spa Reception\"]},\"job_role_analysis\":{\"recognized\":[\"Concierge\",\"Front Desk Receptionist\"],\"unrecognized\":[\"Spa Front Desk Associate\"]},\"credential_analysis\":[{\"required\":null,\"extracted\":\"Basic First Aid Training\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"},{\"required\":null,\"extracted\":\"Cross Ph)\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"},{\"required\":null,\"extracted\":\"Customer Service Excellence\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"},{\"required\":null,\"extracted\":\"Spa Reception & Guest Service\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"},{\"required\":null,\"extracted\":\"Wellness & Hospitality Service\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"}],\"credential_issues\":[],\"review_flags\":[{\"type\":\"UNRECOGNIZED_JOB_ROLE\",\"detail\":\"Spa Front Desk Associate\",\"note\":\"Not found in system reference data; flagged for manual review only.\"}]}', '{\"job_post_id\":15,\"title\":\"Guest Relations Officer\",\"alternative_match_score\":100,\"applied_job_score\":79,\"matched_skills\":[\"Complaint Handling\",\"Front Office Operations\",\"Guest Relations\",\"Reservations\"],\"reason\":\"The applicant did not sufficiently match HR Assistant (79.0%) but strongly matches Guest Relations Officer (100.0%): Matched skills: Complaint Handling, Front Office Operations, Guest Relations, Reservations; Education requirement satisfied; Experience requirement satisfied (3.75 yrs vs 1.0 yrs required); No certification requirements defined for this role \\u2014 meets Guest Relations Officer requirements.\"}', '[\"Required-skills coverage 25% is below the 60% minimum. Missing: Confidentiality, Records Documentation, Recruitment Support.\",\"Applied-job requirements were not fully satisfied, so other open positions were analysed.\",\"Best alternative \'Guest Relations Officer\' scored 100.0% and satisfied that role\'s mandatory requirements.\"]', '{\"base_model\":\"en_core_web_sm\",\"custom_ner_loaded\":true,\"custom_ner_path\":\"C:\\\\Users\\\\PC\\\\Downloads\\\\Ferdi\\\\4TH_YR\\\\DEV\\\\v7 (orig)\\\\2nd-repo-for-hrms-backend-\\\\nlp-service\\\\models_spacy\\\\role_specific_ner\"}', NULL, '2026-08-30 15:09:41', '2026-08-30 15:09:41', '2026-08-30 15:09:41'),
(25, 54, 3, 'PARTIALLY_PROCESSED', 'not-fit', 81.33, '{\"skills\":{\"weight\":0.4,\"earned\":21.33,\"max\":40,\"matched_required\":[\"Room Turnover\"],\"fuzzy_matched_required\":[],\"missing_required\":[\"Attention to Detail\",\"Time Management\"],\"matched_preferred\":[],\"missing_preferred\":[],\"required_coverage\":0.3333,\"preferred_coverage\":1},\"experience\":{\"weight\":0.3,\"earned\":30,\"max\":30,\"estimated_years\":11.25,\"min_years_required\":0,\"requirement_met\":true},\"education\":{\"weight\":0.2,\"earned\":20,\"max\":20,\"applicant_highest_level\":[\"Bachelor of Science in Hospitality Management Housekeeping NC II - TESDA\",\"Certificate in Hotel and Accommodation Services\"],\"required_level\":\"High School Graduate\",\"requirement_met\":true},\"certifications\":{\"weight\":0.1,\"earned\":10,\"max\":10,\"matched\":[],\"missing\":[],\"no_requirements\":true}}', '{\"personal_information\":{\"name\":\"Adrian Paolo Mercado\",\"email\":\"adrian.mercado.hk@gmail.com\",\"phone\":\"+63 939 662 0148\",\"address\":\"Batangas City, Batangas, Philippines\"},\"education\":[\"Bachelor of Science in Hospitality Management Housekeeping NC II - TESDA\",\"Certificate in Hotel and Accommodation Services\"],\"work_experience\":[{\"job_title\":\"Tanawin Cove Resort\",\"company\":\"Housekeeping Manager\",\"location\":null,\"period\":\"June 2018 - April 2021\",\"recognized_role\":false},{\"job_title\":\"Isla Verde Beach Resort\",\"company\":\"Assistant Housekeeping Manager\",\"location\":null,\"period\":\"March 2016 - May 2018\",\"recognized_role\":false},{\"job_title\":\"Isla Verde Beach Resort\",\"company\":\"Housekeeping Supervisor\",\"location\":null,\"period\":\"January 2014 - February 2016\",\"recognized_role\":false}],\"skills\":[\"Check-in \\/ Check-out\",\"Communication\",\"Customer Service\",\"Food Safety\",\"Front Office Operations\",\"Guest Recovery\",\"Housekeeping Operations\",\"Inventory\",\"Inventory Control\",\"Plating\",\"Room Turnover\",\"Safety Compliance\",\"Scheduling\",\"Staff Training\"],\"certifications\":[\"TESDA Housekeeping NC II\"],\"unrecognized_certifications\":[],\"estimated_years_experience\":11.25,\"job_roles\":{\"recognized\":[],\"unrecognized\":[\"Isla Verde Beach Resort\",\"Tanawin Cove Resort\"]},\"unrecognized_skills\":[\"Cleaning Standards & SOPs\",\"Cross-Department Coordination\",\"Linen & Amenity Coordination\",\"Occupational Health & Safety\",\"Operational Planning\",\"Staff Supervision & Development\",\"Training Program Development\"]}', '[{\"label\":\"PERSON\",\"value\":\"Adrian Paolo Mercado\",\"source\":\"rule\"},{\"label\":\"EDUCATION\",\"value\":\"Bachelor of Science in Hospitality Management Housekeeping NC II - TESDA\",\"source\":\"section_rule\"},{\"label\":\"EDUCATION\",\"value\":\"Certificate in Hotel and Accommodation Services\",\"source\":\"section_rule\"},{\"label\":\"JOB_TITLE\",\"value\":\"Tanawin Cove Resort\",\"source\":\"section_rule\"},{\"label\":\"JOB_TITLE\",\"value\":\"Isla Verde Beach Resort\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Housekeeping Operations\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Staff Supervision & Development\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Linen & Amenity Coordination\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Inventory Control\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Scheduling\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Training Program Development\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Cleaning Standards & SOPs\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Guest Recovery\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Operational Planning\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Cross-Department Coordination\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Occupational Health & Safety\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Check-in \\/ Check-out\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Communication\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Customer Service\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Food Safety\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Front Office Operations\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Inventory\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Plating\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Room Turnover\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Safety Compliance\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Staff Training\",\"source\":\"reference_scan\"},{\"label\":\"CERTIFICATION\",\"value\":\"TESDA Housekeeping NC II\",\"source\":\"reference_scan\"},{\"label\":\"ORGANIZATION\",\"value\":\"Housekeeping Manager\",\"source\":\"section_rule\"},{\"label\":\"ORGANIZATION\",\"value\":\"Assistant Housekeeping Manager\",\"source\":\"section_rule\"},{\"label\":\"ORGANIZATION\",\"value\":\"Housekeeping Supervisor\",\"source\":\"section_rule\"},{\"label\":\"EMAIL\",\"value\":\"adrian.mercado.hk@gmail.com\",\"source\":\"regex\"},{\"label\":\"PHONE\",\"value\":\"+63 939 662 0148\",\"source\":\"regex\"}]', '[]', '{\"missing_information\":[],\"invalid_format\":[],\"skill_analysis\":{\"recognized\":[\"Check-in \\/ Check-out\",\"Communication\",\"Customer Service\",\"Food Safety\",\"Front Office Operations\",\"Guest Recovery\",\"Housekeeping Operations\",\"Inventory\",\"Inventory Control\",\"Plating\",\"Room Turnover\",\"Safety Compliance\",\"Scheduling\",\"Staff Training\"],\"unrecognized\":[\"Cleaning Standards & SOPs\",\"Cross-Department Coordination\",\"Linen & Amenity Coordination\",\"Occupational Health & Safety\",\"Operational Planning\",\"Staff Supervision & Development\",\"Training Program Development\"]},\"job_role_analysis\":{\"recognized\":[],\"unrecognized\":[\"Isla Verde Beach Resort\",\"Tanawin Cove Resort\"]},\"credential_analysis\":[],\"credential_issues\":[],\"review_flags\":[{\"type\":\"UNRECOGNIZED_JOB_ROLE\",\"detail\":\"Isla Verde Beach Resort\",\"note\":\"Not found in system reference data; flagged for manual review only.\"},{\"type\":\"UNRECOGNIZED_JOB_ROLE\",\"detail\":\"Tanawin Cove Resort\",\"note\":\"Not found in system reference data; flagged for manual review only.\"}]}', NULL, '[\"Required-skills coverage 33% is below the 60% minimum. Missing: Attention to Detail, Time Management.\",\"Alternative job analysis: highest-scoring open position \'Line Cook\' reached only 73.2%, below the 75.0% recommendation threshold.\"]', '{\"base_model\":\"en_core_web_sm\",\"custom_ner_loaded\":true,\"custom_ner_path\":\"C:\\\\Users\\\\PC\\\\Downloads\\\\Ferdi\\\\4TH_YR\\\\DEV\\\\v7 (orig)\\\\2nd-repo-for-hrms-backend-\\\\nlp-service\\\\models_spacy\\\\role_specific_ner\"}', NULL, '2026-08-31 12:15:27', '2026-08-31 12:15:27', '2026-08-31 12:15:27');
INSERT INTO `applicant_screenings` (`screening_id`, `applicant_id`, `job_post_id`, `processing_status`, `screening_result`, `match_score`, `score_breakdown_json`, `profile_json`, `entities_json`, `missing_information_json`, `validation_json`, `alternative_job_json`, `reasons_json`, `model_info_json`, `error_message`, `processed_at`, `created_at`, `updated_at`) VALUES
(26, 55, 2, 'PARTIALLY_PROCESSED', 'fit', 89.40, '{\"skills\":{\"weight\":0.4,\"earned\":34.4,\"max\":40,\"matched_required\":[\"Food Safety\",\"HACCP\",\"Knife Skills\",\"Plating\"],\"fuzzy_matched_required\":[],\"missing_required\":[\"Teamwork\"],\"matched_preferred\":[],\"missing_preferred\":[],\"required_coverage\":0.8,\"preferred_coverage\":1},\"experience\":{\"weight\":0.3,\"earned\":30,\"max\":30,\"estimated_years\":6.25,\"min_years_required\":1,\"requirement_met\":true},\"education\":{\"weight\":0.2,\"earned\":20,\"max\":20,\"applicant_highest_level\":[\"Bachelor of Science in Hospitality Management (2 years completed) 2016 - 2018\"],\"required_level\":\"Vocational \\/ TESDA\",\"requirement_met\":true},\"certifications\":{\"weight\":0.1,\"earned\":5,\"max\":10,\"matched\":[\"TESDA Cookery NC II\"],\"missing\":[\"Food Handler Certificate\"],\"no_requirements\":false}}', '{\"personal_information\":{\"name\":\"CARLO MIGUEL FERNAN\",\"email\":\"carlo.fernandez.chef@gmail.com\",\"phone\":\"+63 928 4417702\",\"address\":\"Paranaque City, Philippines\"},\"education\":[\"Bachelor of Science in Hospitality Management (2 years completed) 2016 - 2018\"],\"work_experience\":[{\"job_title\":\"Supervisor\",\"company\":\"Kitchen Supervisor\",\"location\":null,\"period\":\"Mar 2023 - Present\",\"recognized_role\":true},{\"job_title\":\"period through improved par-level tracking\",\"company\":\"Senior Line Cook\",\"location\":null,\"period\":\"Jul 2021 - Feb 2023\",\"recognized_role\":false},{\"job_title\":\"Supervisor\",\"company\":\"Line Cook\",\"location\":null,\"period\":\"Jan 2020 - Jun 2021\",\"recognized_role\":true},{\"job_title\":\"Bistro Verde Restaurant Group\",\"company\":\"Kitchen Staff\",\"location\":null,\"period\":\"Jun 2019 - Dec 2019\",\"recognized_role\":false}],\"skills\":[\"Food Safety\",\"HACCP\",\"Inventory\",\"Inventory Control\",\"Knife Skills\",\"Maintenance Basics\",\"POS Systems\",\"Plating\",\"Scheduling\",\"Time Management\"],\"certifications\":[\"Culinary Diploma\",\"TESDA Cookery NC II\",\"Basic Occupational Safety And Health Training\",\"Food Safety And Hygiene Certification\"],\"unrecognized_certifications\":[\"Basic Occupational Safety And Health Training\",\"Food Safety And Hygiene Certification\"],\"estimated_years_experience\":6.25,\"job_roles\":{\"recognized\":[\"Supervisor\"],\"unrecognized\":[\"Bistro Verde Restaurant Group\",\"period through improved par-level tracking\"]},\"unrecognized_skills\":[]}', '[{\"label\":\"PERSON\",\"value\":\"CARLO MIGUEL FERNAN\",\"source\":\"rule\"},{\"label\":\"EDUCATION\",\"value\":\"Bachelor of Science in Hospitality Management (2 years completed) 2016 - 2018\",\"source\":\"section_rule\"},{\"label\":\"JOB_TITLE\",\"value\":\"Supervisor\",\"source\":\"section_rule\"},{\"label\":\"JOB_TITLE\",\"value\":\"period through improved par-level tracking\",\"source\":\"section_rule\"},{\"label\":\"JOB_TITLE\",\"value\":\"Bistro Verde Restaurant Group\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Food Safety\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"HACCP\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Inventory\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Inventory Control\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Knife Skills\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Maintenance Basics\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Plating\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"POS Systems\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Scheduling\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Time Management\",\"source\":\"reference_scan\"},{\"label\":\"CERTIFICATION\",\"value\":\"TESDA Cookery NC II\",\"source\":\"section_rule\"},{\"label\":\"CERTIFICATION\",\"value\":\"Food Safety And Hygiene Certification\",\"source\":\"hint_pattern\"},{\"label\":\"CERTIFICATION\",\"value\":\"Basic Occupational Safety And Health Training\",\"source\":\"hint_pattern\"},{\"label\":\"CERTIFICATION\",\"value\":\"Culinary Diploma\",\"source\":\"reference_scan\"},{\"label\":\"ORGANIZATION\",\"value\":\"Kitchen Supervisor\",\"source\":\"section_rule\"},{\"label\":\"ORGANIZATION\",\"value\":\"Senior Line Cook\",\"source\":\"section_rule\"},{\"label\":\"ORGANIZATION\",\"value\":\"Line Cook\",\"source\":\"section_rule\"},{\"label\":\"ORGANIZATION\",\"value\":\"Kitchen Staff\",\"source\":\"section_rule\"},{\"label\":\"ORGANIZATION\",\"value\":\"Assisted\",\"source\":\"section_rule\"},{\"label\":\"ORGANIZATION\",\"value\":\"FIFO\",\"source\":\"section_rule\"},{\"label\":\"EMAIL\",\"value\":\"carlo.fernandez.chef@gmail.com\",\"source\":\"regex\"},{\"label\":\"PHONE\",\"value\":\"+63 928 4417702\",\"source\":\"regex\"}]', '[]', '{\"missing_information\":[],\"invalid_format\":[],\"skill_analysis\":{\"recognized\":[\"Food Safety\",\"HACCP\",\"Inventory\",\"Inventory Control\",\"Knife Skills\",\"Maintenance Basics\",\"POS Systems\",\"Plating\",\"Scheduling\",\"Time Management\"],\"unrecognized\":[]},\"job_role_analysis\":{\"recognized\":[\"Supervisor\"],\"unrecognized\":[\"Bistro Verde Restaurant Group\",\"period through improved par-level tracking\"]},\"credential_analysis\":[{\"required\":\"TESDA Cookery NC II\",\"status\":\"RECOGNIZED\",\"matched_value\":\"TESDA Cookery NC II\"},{\"required\":\"Food Handler Certificate\",\"status\":\"MISSING\",\"matched_value\":null,\"note\":\"Required certification not found in resume; treated as unmet qualification requirement.\"},{\"required\":null,\"extracted\":\"Basic Occupational Safety And Health Training\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"},{\"required\":null,\"extracted\":\"Food Safety And Hygiene Certification\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"}],\"credential_issues\":[],\"review_flags\":[{\"type\":\"UNRECOGNIZED_JOB_ROLE\",\"detail\":\"Bistro Verde Restaurant Group\",\"note\":\"Not found in system reference data; flagged for manual review only.\"},{\"type\":\"UNRECOGNIZED_JOB_ROLE\",\"detail\":\"period through improved par-level tracking\",\"note\":\"Not found in system reference data; flagged for manual review only.\"}]}', NULL, '[\"Overall match score 89.4% reached the required threshold of 75.0% for Line Cook.\",\"Matched required skills: Food Safety, HACCP, Knife Skills, Plating.\",\"Education requirement met: True; experience requirement met: True (6.25 yrs vs 1.0 yrs minimum).\"]', '{\"base_model\":\"en_core_web_sm\",\"custom_ner_loaded\":true,\"custom_ner_path\":\"C:\\\\Users\\\\PC\\\\Downloads\\\\Ferdi\\\\4TH_YR\\\\DEV\\\\v7 (orig)\\\\2nd-repo-for-hrms-backend-\\\\nlp-service\\\\models_spacy\\\\role_specific_ner\"}', NULL, '2026-08-31 12:56:08', '2026-08-31 12:56:08', '2026-08-31 12:56:08'),
(27, 56, 15, 'PARTIALLY_PROCESSED', 'other-role', 72.00, '{\"skills\":{\"weight\":0.4,\"earned\":12,\"max\":40,\"matched_required\":[],\"fuzzy_matched_required\":[],\"missing_required\":[\"Complaint Handling\",\"Front Office Operations\",\"Guest Relations\",\"Reservations\"],\"matched_preferred\":[],\"missing_preferred\":[],\"required_coverage\":0,\"preferred_coverage\":1},\"experience\":{\"weight\":0.3,\"earned\":30,\"max\":30,\"estimated_years\":6.25,\"min_years_required\":1,\"requirement_met\":true},\"education\":{\"weight\":0.2,\"earned\":20,\"max\":20,\"applicant_highest_level\":[\"Bachelor of Science in Hospitality Management (2 years completed)\"],\"required_level\":\"Bachelor\'s Degree\",\"requirement_met\":true},\"certifications\":{\"weight\":0.1,\"earned\":10,\"max\":10,\"matched\":[],\"missing\":[],\"no_requirements\":true}}', '{\"personal_information\":{\"name\":\"CARLO MIGUEL FERNANDEZ\",\"email\":\"carlo.fernandez.chef@gmail.com\",\"phone\":\"+63 928 441 7702\",\"address\":\"Para\\u00f1aque City, Philippines\"},\"education\":[\"Bachelor of Science in Hospitality Management (2 years completed)\"],\"work_experience\":[{\"job_title\":\"Supervisor\",\"company\":\"Kitchen Supervisor\",\"location\":null,\"period\":\"Mar 2023 - Present\",\"recognized_role\":true},{\"job_title\":\"period through improved par-level tracking\",\"company\":\"Senior Line Cook\",\"location\":null,\"period\":\"Jul 2021 - Feb 2023\",\"recognized_role\":false},{\"job_title\":\"Supervisor\",\"company\":\"Line Cook\",\"location\":null,\"period\":\"Jan 2020 - Jun 2021\",\"recognized_role\":true},{\"job_title\":\"Bistro Verde Restaurant Group\",\"company\":\"Kitchen Staff\",\"location\":null,\"period\":\"Jun 2019 - Dec 2019\",\"recognized_role\":false}],\"skills\":[\"Food Safety\",\"HACCP\",\"Inventory\",\"Inventory Control\",\"Knife Skills\",\"Maintenance Basics\",\"POS Systems\",\"Plating\",\"Scheduling\",\"Time Management\"],\"certifications\":[\"Culinary Diploma\",\"TESDA Cookery NC II\"],\"unrecognized_certifications\":[],\"estimated_years_experience\":6.25,\"job_roles\":{\"recognized\":[\"Supervisor\"],\"unrecognized\":[\"Bistro Verde Restaurant Group\",\"period through improved par-level tracking\"]},\"unrecognized_skills\":[]}', '[{\"label\":\"PERSON\",\"value\":\"CARLO MIGUEL FERNANDEZ\",\"source\":\"rule\"},{\"label\":\"EDUCATION\",\"value\":\"Bachelor of Science in Hospitality Management (2 years completed)\",\"source\":\"section_rule\"},{\"label\":\"JOB_TITLE\",\"value\":\"Supervisor\",\"source\":\"section_rule\"},{\"label\":\"JOB_TITLE\",\"value\":\"period through improved par-level tracking\",\"source\":\"section_rule\"},{\"label\":\"JOB_TITLE\",\"value\":\"Bistro Verde Restaurant Group\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Food Safety\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"HACCP\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Inventory\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Inventory Control\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Knife Skills\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Maintenance Basics\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Plating\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"POS Systems\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Scheduling\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Time Management\",\"source\":\"reference_scan\"},{\"label\":\"CERTIFICATION\",\"value\":\"Culinary Diploma\",\"source\":\"reference_scan\"},{\"label\":\"CERTIFICATION\",\"value\":\"TESDA Cookery NC II\",\"source\":\"reference_scan\"},{\"label\":\"ORGANIZATION\",\"value\":\"Kitchen Supervisor\",\"source\":\"section_rule\"},{\"label\":\"ORGANIZATION\",\"value\":\"Senior Line Cook\",\"source\":\"section_rule\"},{\"label\":\"ORGANIZATION\",\"value\":\"Line Cook\",\"source\":\"section_rule\"},{\"label\":\"ORGANIZATION\",\"value\":\"Kitchen Staff\",\"source\":\"section_rule\"},{\"label\":\"ORGANIZATION\",\"value\":\"la carte\",\"source\":\"section_rule\"},{\"label\":\"ORGANIZATION\",\"value\":\"FIFO\",\"source\":\"section_rule\"},{\"label\":\"EMAIL\",\"value\":\"carlo.fernandez.chef@gmail.com\",\"source\":\"regex\"},{\"label\":\"PHONE\",\"value\":\"+63 928 441 7702\",\"source\":\"regex\"}]', '[]', '{\"missing_information\":[],\"invalid_format\":[],\"skill_analysis\":{\"recognized\":[\"Food Safety\",\"HACCP\",\"Inventory\",\"Inventory Control\",\"Knife Skills\",\"Maintenance Basics\",\"POS Systems\",\"Plating\",\"Scheduling\",\"Time Management\"],\"unrecognized\":[]},\"job_role_analysis\":{\"recognized\":[\"Supervisor\"],\"unrecognized\":[\"Bistro Verde Restaurant Group\",\"period through improved par-level tracking\"]},\"credential_analysis\":[],\"credential_issues\":[],\"review_flags\":[{\"type\":\"UNRECOGNIZED_JOB_ROLE\",\"detail\":\"Bistro Verde Restaurant Group\",\"note\":\"Not found in system reference data; flagged for manual review only.\"},{\"type\":\"UNRECOGNIZED_JOB_ROLE\",\"detail\":\"period through improved par-level tracking\",\"note\":\"Not found in system reference data; flagged for manual review only.\"}]}', '{\"job_post_id\":2,\"title\":\"Line Cook\",\"alternative_match_score\":84.4,\"applied_job_score\":72,\"matched_skills\":[\"Food Safety\",\"HACCP\",\"Knife Skills\",\"Plating\"],\"reason\":\"The applicant did not sufficiently match Guest Relations Officer (72.0%) but strongly matches Line Cook (84.4%): Matched skills: Food Safety, HACCP, Knife Skills, Plating; Education requirement satisfied; Experience requirement satisfied (6.25 yrs vs 1.0 yrs required) \\u2014 meets Line Cook requirements.\"}', '[\"Required-skills coverage 0% is below the 60% minimum. Missing: Complaint Handling, Front Office Operations, Guest Relations, Reservations.\",\"Overall score 72.0% is below the 75.0% threshold.\",\"Lowest-scoring component: skills (12.0\\/40.0 pts).\",\"Applied-job requirements were not fully satisfied, so other open positions were analysed.\",\"Best alternative \'Line Cook\' scored 84.4% and satisfied that role\'s mandatory requirements.\"]', '{\"base_model\":\"en_core_web_sm\",\"custom_ner_loaded\":true,\"custom_ner_path\":\"C:\\\\Users\\\\PC\\\\Downloads\\\\Ferdi\\\\4TH_YR\\\\DEV\\\\v7 (orig)\\\\2nd-repo-for-hrms-backend-\\\\nlp-service\\\\models_spacy\\\\role_specific_ner\"}', NULL, '2026-08-31 16:26:36', '2026-08-31 16:26:36', '2026-08-31 16:26:36'),
(28, 57, 15, 'PROCESSED', 'other-role', 72.00, '{\"skills\":{\"weight\":0.4,\"earned\":12,\"max\":40,\"matched_required\":[],\"fuzzy_matched_required\":[],\"missing_required\":[\"Complaint Handling\",\"Front Office Operations\",\"Guest Relations\",\"Reservations\"],\"matched_preferred\":[],\"missing_preferred\":[],\"required_coverage\":0,\"preferred_coverage\":1},\"experience\":{\"weight\":0.3,\"earned\":30,\"max\":30,\"estimated_years\":11.2,\"min_years_required\":1,\"requirement_met\":true},\"education\":{\"weight\":0.2,\"earned\":20,\"max\":20,\"applicant_highest_level\":[\"Bachelor of Science in Hotel and Restaurant Management\"],\"required_level\":\"Bachelor\'s Degree\",\"requirement_met\":true},\"certifications\":{\"weight\":0.1,\"earned\":10,\"max\":10,\"matched\":[],\"missing\":[],\"no_requirements\":true}}', '{\"personal_information\":{\"name\":\"NATHANIEL JAMES MERCADO\",\"email\":\"nathaniel.mercado.culinary@gmail.com\",\"phone\":\"0928-671-4459\",\"address\":\"Mandaluyong City, Metro Manila, Philippines\"},\"education\":[\"Bachelor of Science in Hotel and Restaurant Management\"],\"work_experience\":[],\"skills\":[\"Banquet Service\",\"Food Safety\",\"HACCP\",\"Inventory\",\"Mise en Place\",\"Plating\",\"Safety Compliance\",\"Scheduling\"],\"certifications\":[\"Food Handler Certificate\",\"C E R T I F I C A T Ion S\",\"Culinary Arts, Cordova Institute Of Culinary And Hospitality Arts, Provider\",\"Haccp Awareness Training\",\"Provider\",\"Supervisory Skills Workshop - Metro Manila Hospitality Training\",\"Workplace Safety Seminar\",\"Workplace Safety Seminar - Occupational Safety And Health Centeraccredited Provider\"],\"unrecognized_certifications\":[\"C E R T I F I C A T Ion S\",\"Culinary Arts, Cordova Institute Of Culinary And Hospitality Arts, Provider\",\"Haccp Awareness Training\",\"Provider\",\"Supervisory Skills Workshop - Metro Manila Hospitality Training\",\"Workplace Safety Seminar\",\"Workplace Safety Seminar - Occupational Safety And Health Centeraccredited Provider\"],\"estimated_years_experience\":11.2,\"job_roles\":{\"recognized\":[\"Chef\",\"Line Cook\",\"Supervisor\"],\"unrecognized\":[]},\"unrecognized_skills\":[]}', '[{\"label\":\"PERSON\",\"value\":\"NATHANIEL JAMES MERCADO\",\"source\":\"rule\"},{\"label\":\"EDUCATION\",\"value\":\"Bachelor of Science in Hotel and Restaurant Management\",\"source\":\"section_rule\"},{\"label\":\"JOB_TITLE\",\"value\":\"Chef\",\"source\":\"reference_scan\"},{\"label\":\"JOB_TITLE\",\"value\":\"Line Cook\",\"source\":\"reference_scan\"},{\"label\":\"JOB_TITLE\",\"value\":\"Supervisor\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Banquet Service\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Food Safety\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"HACCP\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Inventory\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Mise en Place\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Plating\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Safety Compliance\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Scheduling\",\"source\":\"reference_scan\"},{\"label\":\"CERTIFICATION\",\"value\":\"C E R T I F I C A T Ion S\",\"source\":\"section_rule\"},{\"label\":\"CERTIFICATION\",\"value\":\"Food Handler Certificate\",\"source\":\"section_rule\"},{\"label\":\"CERTIFICATION\",\"value\":\"Provider\",\"source\":\"section_rule\"},{\"label\":\"CERTIFICATION\",\"value\":\"Haccp Awareness Training\",\"source\":\"hint_pattern\"},{\"label\":\"CERTIFICATION\",\"value\":\"Supervisory Skills Workshop - Metro Manila Hospitality Training\",\"source\":\"hint_pattern\"},{\"label\":\"CERTIFICATION\",\"value\":\"Workplace Safety Seminar - Occupational Safety And Health Centeraccredited Provider\",\"source\":\"section_rule\"},{\"label\":\"CERTIFICATION\",\"value\":\"Culinary Arts, Cordova Institute Of Culinary And Hospitality Arts, Provider\",\"source\":\"section_rule\"},{\"label\":\"CERTIFICATION\",\"value\":\"Workplace Safety Seminar\",\"source\":\"section_rule\"},{\"label\":\"EMAIL\",\"value\":\"nathaniel.mercado.culinary@gmail.com\",\"source\":\"regex\"},{\"label\":\"PHONE\",\"value\":\"0928-671-4459\",\"source\":\"regex\"}]', '[]', '{\"missing_information\":[],\"invalid_format\":[],\"skill_analysis\":{\"recognized\":[\"Banquet Service\",\"Food Safety\",\"HACCP\",\"Inventory\",\"Mise en Place\",\"Plating\",\"Safety Compliance\",\"Scheduling\"],\"unrecognized\":[]},\"job_role_analysis\":{\"recognized\":[\"Chef\",\"Line Cook\",\"Supervisor\"],\"unrecognized\":[]},\"credential_analysis\":[{\"required\":null,\"extracted\":\"C E R T I F I C A T Ion S\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"},{\"required\":null,\"extracted\":\"Culinary Arts, Cordova Institute Of Culinary And Hospitality Arts, Provider\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"},{\"required\":null,\"extracted\":\"Haccp Awareness Training\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"},{\"required\":null,\"extracted\":\"Provider\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"},{\"required\":null,\"extracted\":\"Supervisory Skills Workshop - Metro Manila Hospitality Training\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"},{\"required\":null,\"extracted\":\"Workplace Safety Seminar\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"},{\"required\":null,\"extracted\":\"Workplace Safety Seminar - Occupational Safety And Health Centeraccredited Provider\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"}],\"credential_issues\":[],\"review_flags\":[]}', '{\"job_post_id\":2,\"title\":\"Line Cook\",\"alternative_match_score\":78.8,\"applied_job_score\":72,\"matched_skills\":[\"Food Safety\",\"HACCP\",\"Plating\"],\"reason\":\"The applicant did not sufficiently match Guest Relations Officer (72.0%) but strongly matches Line Cook (78.8%): Matched skills: Food Safety, HACCP, Plating; Education requirement satisfied; Experience requirement satisfied (11.2 yrs vs 1.0 yrs required) \\u2014 meets Line Cook requirements.\"}', '[\"Required-skills coverage 0% is below the 60% minimum. Missing: Complaint Handling, Front Office Operations, Guest Relations, Reservations.\",\"Overall score 72.0% is below the 75.0% threshold.\",\"Lowest-scoring component: skills (12.0\\/40.0 pts).\",\"Applied-job requirements were not fully satisfied, so other open positions were analysed.\",\"Best alternative \'Line Cook\' scored 78.8% and satisfied that role\'s mandatory requirements.\"]', '{\"base_model\":\"en_core_web_sm\",\"custom_ner_loaded\":true,\"custom_ner_path\":\"C:\\\\Users\\\\PC\\\\Downloads\\\\Ferdi\\\\4TH_YR\\\\DEV\\\\v7 (orig)\\\\2nd-repo-for-hrms-backend-\\\\nlp-service\\\\models_spacy\\\\role_specific_ner\"}', NULL, '2026-09-01 21:54:41', '2026-09-01 21:54:41', '2026-09-01 21:54:41'),
(29, 58, 15, 'PARTIALLY_PROCESSED', 'other-role', 86.00, '{\"skills\":{\"weight\":0.4,\"earned\":26,\"max\":40,\"matched_required\":[\"Front Office Operations\",\"Reservations\"],\"fuzzy_matched_required\":[],\"missing_required\":[\"Complaint Handling\",\"Guest Relations\"],\"matched_preferred\":[],\"missing_preferred\":[],\"required_coverage\":0.5,\"preferred_coverage\":1},\"experience\":{\"weight\":0.3,\"earned\":30,\"max\":30,\"estimated_years\":8.75,\"min_years_required\":1,\"requirement_met\":true},\"education\":{\"weight\":0.2,\"earned\":20,\"max\":20,\"applicant_highest_level\":[\"Bachelor of Science in Hospitality Management\"],\"required_level\":\"Bachelor\'s Degree\",\"requirement_met\":true},\"certifications\":{\"weight\":0.1,\"earned\":10,\"max\":10,\"matched\":[],\"missing\":[],\"no_requirements\":true}}', '{\"personal_information\":{\"name\":\"Bianca Nicole Castillo\",\"email\":\"0917-542-3186bianca.castillo.hospitality@gmail.com\",\"phone\":\"0917-542-3186\",\"address\":\"Quezon City, Metro Manila, Philippines\"},\"education\":[\"Bachelor of Science in Hospitality Management\"],\"work_experience\":[],\"skills\":[\"Attention to Detail\",\"Check-in \\/ Check-out\",\"Customer Service\",\"Front Office Operations\",\"Inventory\",\"Inventory Control\",\"Property Management Systems\",\"Reservations\",\"Staff Training\"],\"certifications\":[\"Bianca Nicole Castillo 0917\",\"C E R T I F I C A T Ion S\",\"Center\",\"Front Office Operations Certificate\",\"Guest Service Excellence Workshop\",\"Hotel Reservations Management Training\",\"Hotel Reservations Supervisor Quezon City, Metro Manila, Philippines\",\"Institute\",\"Revenue And Room Inventory Fundamentals\",\"Tourism And Hospitality, Quezon City (June\"],\"unrecognized_certifications\":[\"Bianca Nicole Castillo 0917\",\"C E R T I F I C A T Ion S\",\"Center\",\"Front Office Operations Certificate\",\"Guest Service Excellence Workshop\",\"Hotel Reservations Management Training\",\"Hotel Reservations Supervisor Quezon City, Metro Manila, Philippines\",\"Institute\",\"Revenue And Room Inventory Fundamentals\",\"Tourism And Hospitality, Quezon City (June\"],\"estimated_years_experience\":8.75,\"job_roles\":{\"recognized\":[\"Supervisor\"],\"unrecognized\":[]},\"unrecognized_skills\":[\"Group booking coordination Rate\",\"mentoring\"]}', '[{\"label\":\"PERSON\",\"value\":\"Bianca Nicole Castillo\",\"source\":\"rule\"},{\"label\":\"EDUCATION\",\"value\":\"Bachelor of Science in Hospitality Management\",\"source\":\"section_rule\"},{\"label\":\"JOB_TITLE\",\"value\":\"Supervisor\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"mentoring\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Group booking coordination Rate\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Attention to Detail\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Check-in \\/ Check-out\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Customer Service\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Front Office Operations\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Inventory\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Inventory Control\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Property Management Systems\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Reservations\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Staff Training\",\"source\":\"reference_scan\"},{\"label\":\"CERTIFICATION\",\"value\":\"C E R T I F I C A T Ion S\",\"source\":\"section_rule\"},{\"label\":\"CERTIFICATION\",\"value\":\"Front Office Operations Certificate\",\"source\":\"hint_pattern\"},{\"label\":\"CERTIFICATION\",\"value\":\"Hotel Reservations Management Training\",\"source\":\"hint_pattern\"},{\"label\":\"CERTIFICATION\",\"value\":\"Center\",\"source\":\"section_rule\"},{\"label\":\"CERTIFICATION\",\"value\":\"Revenue And Room Inventory Fundamentals\",\"source\":\"section_rule\"},{\"label\":\"CERTIFICATION\",\"value\":\"Institute\",\"source\":\"section_rule\"},{\"label\":\"CERTIFICATION\",\"value\":\"Guest Service Excellence Workshop\",\"source\":\"hint_pattern\"},{\"label\":\"CERTIFICATION\",\"value\":\"Bianca Nicole Castillo 0917\",\"source\":\"section_rule\"},{\"label\":\"CERTIFICATION\",\"value\":\"Hotel Reservations Supervisor Quezon City, Metro Manila, Philippines\",\"source\":\"section_rule\"},{\"label\":\"CERTIFICATION\",\"value\":\"Tourism And Hospitality, Quezon City (June\",\"source\":\"section_rule\"},{\"label\":\"EMAIL\",\"value\":\"0917-542-3186bianca.castillo.hospitality@gmail.com\",\"source\":\"regex\"},{\"label\":\"PHONE\",\"value\":\"0917-542-3186\",\"source\":\"regex\"}]', '[]', '{\"missing_information\":[],\"invalid_format\":[],\"skill_analysis\":{\"recognized\":[\"Attention to Detail\",\"Check-in \\/ Check-out\",\"Customer Service\",\"Front Office Operations\",\"Inventory\",\"Inventory Control\",\"Property Management Systems\",\"Reservations\",\"Staff Training\"],\"unrecognized\":[\"Group booking coordination Rate\",\"mentoring\"]},\"job_role_analysis\":{\"recognized\":[\"Supervisor\"],\"unrecognized\":[]},\"credential_analysis\":[{\"required\":null,\"extracted\":\"Bianca Nicole Castillo 0917\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"},{\"required\":null,\"extracted\":\"C E R T I F I C A T Ion S\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"},{\"required\":null,\"extracted\":\"Center\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"},{\"required\":null,\"extracted\":\"Front Office Operations Certificate\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"},{\"required\":null,\"extracted\":\"Guest Service Excellence Workshop\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"},{\"required\":null,\"extracted\":\"Hotel Reservations Management Training\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"},{\"required\":null,\"extracted\":\"Hotel Reservations Supervisor Quezon City, Metro Manila, Philippines\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"},{\"required\":null,\"extracted\":\"Institute\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"},{\"required\":null,\"extracted\":\"Revenue And Room Inventory Fundamentals\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"},{\"required\":null,\"extracted\":\"Tourism And Hospitality, Quezon City (June\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"}],\"credential_issues\":[],\"review_flags\":[]}', '{\"job_post_id\":16,\"title\":\"Front Desk Receptionist\",\"alternative_match_score\":88.8,\"applied_job_score\":86,\"matched_skills\":[\"Check-in \\/ Check-out\",\"Property Management Systems\",\"Reservations\"],\"reason\":\"The applicant did not sufficiently match Guest Relations Officer (86.0%) but strongly matches Front Desk Receptionist (88.8%): Matched skills: Check-in \\/ Check-out, Property Management Systems, Reservations; Education requirement satisfied; Experience requirement satisfied (8.75 yrs vs 1.0 yrs required); No certification requirements defined for this role \\u2014 meets Front Desk Receptionist requirements.\"}', '[\"Required-skills coverage 50% is below the 60% minimum. Missing: Complaint Handling, Guest Relations.\",\"Applied-job requirements were not fully satisfied, so other open positions were analysed.\",\"Best alternative \'Front Desk Receptionist\' scored 88.8% and satisfied that role\'s mandatory requirements.\"]', '{\"base_model\":\"en_core_web_sm\",\"custom_ner_loaded\":true,\"custom_ner_path\":\"C:\\\\Users\\\\PC\\\\Downloads\\\\Ferdi\\\\4TH_YR\\\\DEV\\\\v7 (orig)\\\\2nd-repo-for-hrms-backend-\\\\nlp-service\\\\models_spacy\\\\role_specific_ner\"}', NULL, '2026-09-01 22:19:43', '2026-09-01 22:19:43', '2026-09-01 22:19:43'),
(30, 59, 16, 'PARTIALLY_PROCESSED', 'not-fit', 77.60, '{\"skills\":{\"weight\":0.4,\"earned\":17.6,\"max\":40,\"matched_required\":[\"Guest Relations\"],\"fuzzy_matched_required\":[],\"missing_required\":[\"Cash Handling\",\"Check-in \\/ Check-out\",\"Property Management Systems\",\"Reservations\"],\"matched_preferred\":[],\"missing_preferred\":[],\"required_coverage\":0.2,\"preferred_coverage\":1},\"experience\":{\"weight\":0.3,\"earned\":30,\"max\":30,\"estimated_years\":8.75,\"min_years_required\":1,\"requirement_met\":true},\"education\":{\"weight\":0.2,\"earned\":20,\"max\":20,\"applicant_highest_level\":[\"Bachelor of Science in Tourism Management\"],\"required_level\":\"Bachelor\'s Degree\",\"requirement_met\":true},\"certifications\":{\"weight\":0.1,\"earned\":10,\"max\":10,\"matched\":[],\"missing\":[],\"no_requirements\":true}}', '{\"personal_information\":{\"name\":\"Camille Rose Evangelista\",\"email\":\"camille.evangelista.spa@gmail.com\",\"phone\":\"0995-318-2647\",\"address\":\"Tagaytay City, Cavite, Philippines\"},\"education\":[\"Bachelor of Science in Tourism Management\"],\"work_experience\":[{\"job_title\":\"Spa Receptionist\",\"company\":\"Lakeside Serenity Spa and Wellness Resort\",\"location\":null,\"period\":\"April 2017 - August 2019\",\"recognized_role\":true},{\"job_title\":\"Wellness Services Associate\",\"company\":\"Palmera Cove Resort and Spa\",\"location\":null,\"period\":\"September 2019 - January 2022\",\"recognized_role\":false},{\"job_title\":\"Spa and Wellness Operations Coordinator\",\"company\":\"Altavista Resort and Wellness Retreat\",\"location\":null,\"period\":\"February 2022 - Present\",\"recognized_role\":false}],\"skills\":[\"Customer Service\",\"Guest Recovery\",\"Guest Relations\",\"Inventory\",\"Inventory Control\",\"Scheduling\",\"Staff Training\"],\"certifications\":[\"Association-Accredited Provider\",\"C E R T I F I C A T I O N S\",\"Cavite Wellness Training\",\"Hospitality Training\",\"Institute\",\"Recreation Safety Training\",\"Resort Guest Relations Seminar\",\"Resort Spa Operations Supervisor\",\"Spa Operations Certificate\",\"Wellness Service Coordination Workshop\"],\"unrecognized_certifications\":[\"Association-Accredited Provider\",\"C E R T I F I C A T I O N S\",\"Cavite Wellness Training\",\"Hospitality Training\",\"Institute\",\"Recreation Safety Training\",\"Resort Guest Relations Seminar\",\"Resort Spa Operations Supervisor\",\"Spa Operations Certificate\",\"Wellness Service Coordination Workshop\"],\"estimated_years_experience\":8.75,\"job_roles\":{\"recognized\":[\"Spa Receptionist\"],\"unrecognized\":[\"Spa and Wellness Operations Coordinator\",\"Wellness Services Associate\"]},\"unrecognized_skills\":[\"Spa operations management\",\"Therapist capacity planning\",\"onboarding\"]}', '[{\"label\":\"PERSON\",\"value\":\"Camille Rose Evangelista\",\"source\":\"rule\"},{\"label\":\"EDUCATION\",\"value\":\"Bachelor of Science in Tourism Management\",\"source\":\"section_rule\"},{\"label\":\"JOB_TITLE\",\"value\":\"Spa Receptionist\",\"source\":\"section_rule\"},{\"label\":\"JOB_TITLE\",\"value\":\"Wellness Services Associate\",\"source\":\"section_rule\"},{\"label\":\"JOB_TITLE\",\"value\":\"Spa and Wellness Operations Coordinator\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Spa operations management\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Therapist capacity planning\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Staff Training\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"onboarding\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Scheduling\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Inventory Control\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Guest Recovery\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Customer Service\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Guest Relations\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Inventory\",\"source\":\"reference_scan\"},{\"label\":\"CERTIFICATION\",\"value\":\"C E R T I F I C A T I O N S\",\"source\":\"section_rule\"},{\"label\":\"CERTIFICATION\",\"value\":\"Spa Operations Certificate\",\"source\":\"hint_pattern\"},{\"label\":\"CERTIFICATION\",\"value\":\"Association-Accredited Provider\",\"source\":\"section_rule\"},{\"label\":\"CERTIFICATION\",\"value\":\"Wellness Service Coordination Workshop\",\"source\":\"hint_pattern\"},{\"label\":\"CERTIFICATION\",\"value\":\"Cavite Wellness Training\",\"source\":\"hint_pattern\"},{\"label\":\"CERTIFICATION\",\"value\":\"Resort Guest Relations Seminar\",\"source\":\"section_rule\"},{\"label\":\"CERTIFICATION\",\"value\":\"Hospitality Training\",\"source\":\"hint_pattern\"},{\"label\":\"CERTIFICATION\",\"value\":\"Recreation Safety Training\",\"source\":\"hint_pattern\"},{\"label\":\"CERTIFICATION\",\"value\":\"Institute\",\"source\":\"section_rule\"},{\"label\":\"CERTIFICATION\",\"value\":\"Resort Spa Operations Supervisor\",\"source\":\"section_rule\"},{\"label\":\"ORGANIZATION\",\"value\":\"Lakeside Serenity Spa and Wellness Resort\",\"source\":\"section_rule\"},{\"label\":\"ORGANIZATION\",\"value\":\"Palmera Cove Resort and Spa\",\"source\":\"section_rule\"},{\"label\":\"ORGANIZATION\",\"value\":\"Altavista Resort and Wellness Retreat\",\"source\":\"section_rule\"},{\"label\":\"ORGANIZATION\",\"value\":\"Wellness\",\"source\":\"section_rule\"},{\"label\":\"EMAIL\",\"value\":\"camille.evangelista.spa@gmail.com\",\"source\":\"regex\"},{\"label\":\"PHONE\",\"value\":\"0995-318-2647\",\"source\":\"regex\"}]', '[]', '{\"missing_information\":[],\"invalid_format\":[],\"skill_analysis\":{\"recognized\":[\"Customer Service\",\"Guest Recovery\",\"Guest Relations\",\"Inventory\",\"Inventory Control\",\"Scheduling\",\"Staff Training\"],\"unrecognized\":[\"Spa operations management\",\"Therapist capacity planning\",\"onboarding\"]},\"job_role_analysis\":{\"recognized\":[\"Spa Receptionist\"],\"unrecognized\":[\"Spa and Wellness Operations Coordinator\",\"Wellness Services Associate\"]},\"credential_analysis\":[{\"required\":null,\"extracted\":\"Association-Accredited Provider\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"},{\"required\":null,\"extracted\":\"C E R T I F I C A T I O N S\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"},{\"required\":null,\"extracted\":\"Cavite Wellness Training\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"},{\"required\":null,\"extracted\":\"Hospitality Training\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"},{\"required\":null,\"extracted\":\"Institute\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"},{\"required\":null,\"extracted\":\"Recreation Safety Training\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"},{\"required\":null,\"extracted\":\"Resort Guest Relations Seminar\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"},{\"required\":null,\"extracted\":\"Resort Spa Operations Supervisor\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"},{\"required\":null,\"extracted\":\"Spa Operations Certificate\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"},{\"required\":null,\"extracted\":\"Wellness Service Coordination Workshop\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"}],\"credential_issues\":[],\"review_flags\":[{\"type\":\"UNRECOGNIZED_JOB_ROLE\",\"detail\":\"Spa and Wellness Operations Coordinator\",\"note\":\"Not found in system reference data; flagged for manual review only.\"},{\"type\":\"UNRECOGNIZED_JOB_ROLE\",\"detail\":\"Wellness Services Associate\",\"note\":\"Not found in system reference data; flagged for manual review only.\"}]}', NULL, '[\"Required-skills coverage 20% is below the 60% minimum. Missing: Cash Handling, Check-in \\/ Check-out, Property Management Systems, Reservations.\",\"Alternative job analysis: highest-scoring open position \'Guest Relations Officer\' reached only 79.0%, below the 75.0% recommendation threshold.\"]', '{\"base_model\":\"en_core_web_sm\",\"custom_ner_loaded\":true,\"custom_ner_path\":\"C:\\\\Users\\\\PC\\\\Downloads\\\\Ferdi\\\\4TH_YR\\\\DEV\\\\v7 (orig)\\\\2nd-repo-for-hrms-backend-\\\\nlp-service\\\\models_spacy\\\\role_specific_ner\"}', NULL, '2026-09-02 00:05:05', '2026-09-02 00:05:05', '2026-09-02 00:05:05');

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
) ENGINE=InnoDB AUTO_INCREMENT=767 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
(117, 31, 'PHONE', '1 (655) 342-8891', '2026-08-23 17:50:39'),
(118, 32, 'PERSON', 'Lorenzo Miguel Santiago', '2026-08-25 19:52:47'),
(119, 32, 'EDUCATION', 'Diploma in Baking and Pastry Arts', '2026-08-25 19:52:47'),
(120, 32, 'JOB_TITLE', 'Pastry Chef', '2026-08-25 19:52:47'),
(121, 32, 'JOB_TITLE', 'Fairmont Makati', '2026-08-25 19:52:47'),
(122, 32, 'SKILL', 'Attention to Detail', '2026-08-25 19:52:47'),
(123, 32, 'SKILL', 'Cake Decoration', '2026-08-25 19:52:47'),
(124, 32, 'SKILL', 'Food Safety', '2026-08-25 19:52:47'),
(125, 32, 'SKILL', 'HACCP', '2026-08-25 19:52:47'),
(126, 32, 'SKILL', 'Pastry and Baking', '2026-08-25 19:52:47'),
(127, 32, 'SKILL', 'Plating', '2026-08-25 19:52:47'),
(128, 32, 'SKILL', 'Teamwork', '2026-08-25 19:52:47'),
(129, 32, 'CERTIFICATION', 'C E R T I F I C At I O N S', '2026-08-25 19:52:47'),
(130, 32, 'CERTIFICATION', 'TESDA Bread and Pastry Production NC II', '2026-08-25 19:52:47'),
(131, 32, 'CERTIFICATION', 'Food Safety And Hygiene Certification', '2026-08-25 19:52:47'),
(132, 32, 'CERTIFICATION', 'Advanced Pastry Training', '2026-08-25 19:52:47'),
(133, 32, 'CERTIFICATION', 'Cake Decoration And Dessert Plating Training', '2026-08-25 19:52:47'),
(134, 32, 'CERTIFICATION', 'Hotel Pastry Chef / Pastry Cook', '2026-08-25 19:52:47'),
(135, 32, 'CERTIFICATION', '🍰 🍣 🎂 ✨', '2026-08-25 19:52:47'),
(136, 32, 'CERTIFICATION', 'Plated Desserts Artisan Breads Celebration Cakes Banquet Production', '2026-08-25 19:52:47'),
(137, 32, 'ORGANIZATION', 'Shangri-La at the Fort Manila', '2026-08-25 19:52:47'),
(138, 32, 'ORGANIZATION', 'Pastry Cook', '2026-08-25 19:52:47'),
(139, 32, 'ORGANIZATION', 'Bakery Assistant', '2026-08-25 19:52:47'),
(140, 32, 'ORGANIZATION', 'Shangri-La', '2026-08-25 19:52:47'),
(141, 32, 'EMAIL', 'lorenzo.santiago@culinarymail.com', '2026-08-25 19:52:47'),
(142, 32, 'PHONE', '+63 908 774 3312', '2026-08-25 19:52:47'),
(143, 33, 'PERSON', 'ALYSSA MARIE', '2026-08-25 19:59:05'),
(144, 33, 'EDUCATION', 'Bachelor of Science in Hospitality Management', '2026-08-25 19:59:05'),
(145, 33, 'JOB_TITLE', 'Front Desk Receptionist', '2026-08-25 19:59:05'),
(146, 33, 'JOB_TITLE', 'Concierge', '2026-08-25 19:59:05'),
(147, 33, 'JOB_TITLE', 'Spa Front Desk Associate', '2026-08-25 19:59:05'),
(148, 33, 'SKILL', 'Spa Reception', '2026-08-25 19:59:05'),
(149, 33, 'SKILL', 'Scheduling', '2026-08-25 19:59:05'),
(150, 33, 'SKILL', 'Guest Relations', '2026-08-25 19:59:05'),
(151, 33, 'SKILL', 'Reservations', '2026-08-25 19:59:05'),
(152, 33, 'SKILL', 'Front Office Operations', '2026-08-25 19:59:05'),
(153, 33, 'SKILL', 'Payment Processing', '2026-08-25 19:59:05'),
(154, 33, 'SKILL', 'POS Systems', '2026-08-25 19:59:05'),
(155, 33, 'SKILL', 'Customer Service', '2026-08-25 19:59:06'),
(156, 33, 'SKILL', 'Complaint Handling', '2026-08-25 19:59:06'),
(157, 33, 'SKILL', 'Time Management', '2026-08-25 19:59:06'),
(158, 33, 'SKILL', 'Attention to Detail', '2026-08-25 19:59:06'),
(159, 33, 'SKILL', 'Cash Handling', '2026-08-25 19:59:06'),
(160, 33, 'SKILL', 'Check-in / Check-out', '2026-08-25 19:59:06'),
(161, 33, 'SKILL', 'Communication', '2026-08-25 19:59:06'),
(162, 33, 'SKILL', 'Housekeeping Operations', '2026-08-25 19:59:06'),
(163, 33, 'SKILL', 'MS Office', '2026-08-25 19:59:06'),
(164, 33, 'SKILL', 'Property Management Systems', '2026-08-25 19:59:06'),
(165, 33, 'CERTIFICATION', 'Customer Service Excellence', '2026-08-25 19:59:06'),
(166, 33, 'CERTIFICATION', 'Spa Reception & Guest Service', '2026-08-25 19:59:06'),
(167, 33, 'CERTIFICATION', 'Basic First Aid Training', '2026-08-25 19:59:06'),
(168, 33, 'CERTIFICATION', 'Cross Ph)', '2026-08-25 19:59:06'),
(169, 33, 'CERTIFICATION', 'Wellness & Hospitality Service', '2026-08-25 19:59:06'),
(170, 33, 'ORGANIZATION', 'The Cortina Wellness Resort & Spa', '2026-08-25 19:59:06'),
(171, 33, 'ORGANIZATION', 'Serenity Springs Day Spa', '2026-08-25 19:59:06'),
(172, 33, 'ORGANIZATION', 'Opera', '2026-08-25 19:59:06'),
(173, 33, 'EMAIL', '5678alyssa.valdez.spa@gmail.com', '2026-08-25 19:59:06'),
(174, 33, 'PHONE', '+63 917 234 5678', '2026-08-25 19:59:06'),
(175, 34, 'PERSON', 'MARIA ANGELA SANTOS', '2026-08-25 20:11:13'),
(176, 34, 'EDUCATION', 'Bachelor of Science in Hospitality Management', '2026-08-25 20:11:13'),
(177, 34, 'JOB_TITLE', 'Hotel Front Desk Associate', '2026-08-25 20:11:13'),
(178, 34, 'JOB_TITLE', 'Front Desk Receptionist', '2026-08-25 20:11:13'),
(179, 34, 'JOB_TITLE', 'confirm satisfaction', '2026-08-25 20:11:13'),
(180, 34, 'SKILL', 'Guest Relations', '2026-08-25 20:11:13'),
(181, 34, 'SKILL', 'Check-in / Check-out', '2026-08-25 20:11:13'),
(182, 34, 'SKILL', 'Reservations', '2026-08-25 20:11:13'),
(183, 34, 'SKILL', 'Complaint Handling', '2026-08-25 20:11:13'),
(184, 34, 'SKILL', 'Cash Handling', '2026-08-25 20:11:13'),
(185, 34, 'SKILL', 'Payment Processing', '2026-08-25 20:11:13'),
(186, 34, 'SKILL', 'Front Office Operations', '2026-08-25 20:11:13'),
(187, 34, 'SKILL', 'Time Management', '2026-08-25 20:11:13'),
(188, 34, 'SKILL', 'Communication', '2026-08-25 20:11:13'),
(189, 34, 'SKILL', 'Attention to Detail', '2026-08-25 20:11:13'),
(190, 34, 'SKILL', 'Customer Service', '2026-08-25 20:11:13'),
(191, 34, 'SKILL', 'Housekeeping Operations', '2026-08-25 20:11:13'),
(192, 34, 'SKILL', 'MS Office', '2026-08-25 20:11:13'),
(193, 34, 'SKILL', 'Plating', '2026-08-25 20:11:13'),
(194, 34, 'SKILL', 'Property Management Systems', '2026-08-25 20:11:13'),
(195, 34, 'SKILL', 'Teamwork', '2026-08-25 20:11:13'),
(196, 34, 'CERTIFICATION', 'Customer Service Excellence Training', '2026-08-25 20:11:13'),
(197, 34, 'CERTIFICATION', 'Basic Life Support And First Aid Certification', '2026-08-25 20:11:13'),
(198, 34, 'CERTIFICATION', 'Hospitality Service Training', '2026-08-25 20:11:13'),
(199, 34, 'ORGANIZATION', 'Hotel Front Desk Associate', '2026-08-25 20:11:13'),
(200, 34, 'ORGANIZATION', 'Guest Service Representative', '2026-08-25 20:11:13'),
(201, 34, 'ORGANIZATION', 'Front Office Intern', '2026-08-25 20:11:13'),
(202, 34, 'ORGANIZATION', 'Opera PMS', '2026-08-25 20:11:13'),
(203, 34, 'EMAIL', 'maria.santos.hospitality@gmail.com', '2026-08-25 20:11:13'),
(204, 34, 'PHONE', '0917 245 6183', '2026-08-25 20:11:13'),
(205, 35, 'PERSON', 'Marielle Anne Santos', '2026-08-25 20:58:53'),
(206, 35, 'EDUCATION', 'Bachelor of Science in Business Administration', '2026-08-25 20:58:53'),
(207, 35, 'JOB_TITLE', 'Supervisor', '2026-08-25 20:58:53'),
(208, 35, 'JOB_TITLE', 'retraining', '2026-08-25 20:58:53'),
(209, 35, 'JOB_TITLE', 'Café Verano Manila', '2026-08-25 20:58:53'),
(210, 35, 'SKILL', 'Inventory Control', '2026-08-25 20:58:53'),
(211, 35, 'SKILL', 'Physical Inventory Counting', '2026-08-25 20:58:53'),
(212, 35, 'SKILL', 'Waste & Spoilage Tracking', '2026-08-25 20:58:53'),
(213, 35, 'SKILL', 'Supplier Delivery Verification', '2026-08-25 20:58:53'),
(214, 35, 'SKILL', 'Records Documentation', '2026-08-25 20:58:53'),
(215, 35, 'SKILL', 'MarketMan', '2026-08-25 20:58:53'),
(216, 35, 'SKILL', 'Materials Control Software', '2026-08-25 20:58:53'),
(217, 35, 'SKILL', 'MS Office', '2026-08-25 20:58:53'),
(218, 35, 'SKILL', 'Basic', '2026-08-25 20:58:53'),
(219, 35, 'SKILL', 'Cost Accounting', '2026-08-25 20:58:53'),
(220, 35, 'SKILL', 'Cross-Functional Team Coordination', '2026-08-25 20:58:53'),
(221, 35, 'SKILL', 'Food Safety', '2026-08-25 20:58:53'),
(222, 35, 'SKILL', 'POS Systems', '2026-08-25 20:58:53'),
(223, 35, 'CERTIFICATION', 'Food And Beverage Cost Control Training', '2026-08-25 20:58:53'),
(224, 35, 'CERTIFICATION', 'Inventory Management Training Certificate', '2026-08-25 20:58:53'),
(225, 35, 'CERTIFICATION', 'Basic Accounting For Non-Accountants, Tesda (2019)', '2026-08-25 20:58:53'),
(226, 35, 'CERTIFICATION', 'Microsoft Excel Advanced Certification', '2026-08-25 20:58:53'),
(227, 35, 'CERTIFICATION', 'Restaurant Operations And Food Safety Orientation (2018)', '2026-08-25 20:58:53'),
(228, 35, 'ORGANIZATION', 'Restaurant Inventory and Cost Control Supervisor', '2026-08-25 20:58:53'),
(229, 35, 'ORGANIZATION', 'Food and Beverage Cost Control Assistant', '2026-08-25 20:58:53'),
(230, 35, 'ORGANIZATION', 'Inventory Control Officer', '2026-08-25 20:58:53'),
(231, 35, 'EMAIL', 'marielle.santos.fbcontrol@gmail.com', '2026-08-25 20:58:53'),
(232, 35, 'PHONE', '+63 918 663 2947', '2026-08-25 20:58:53'),
(233, 36, 'PERSON', 'NICOLE FRANCES HERRERA', '2026-08-25 21:00:33'),
(234, 36, 'EDUCATION', 'Bachelor of Science in Tourism Management', '2026-08-25 21:00:33'),
(235, 36, 'JOB_TITLE', 'Hotel Recreation and Activities Coordinator', '2026-08-25 21:00:33'),
(236, 36, 'SKILL', 'Problem Solving', '2026-08-25 21:00:33'),
(237, 36, 'SKILL', 'Check-in / Check-out', '2026-08-25 21:00:33'),
(238, 36, 'SKILL', 'Communication', '2026-08-25 21:00:33'),
(239, 36, 'SKILL', 'Customer Service', '2026-08-25 21:00:33'),
(240, 36, 'SKILL', 'Front Office Operations', '2026-08-25 21:00:33'),
(241, 36, 'SKILL', 'Guest Relations', '2026-08-25 21:00:33'),
(242, 36, 'SKILL', 'Housekeeping Operations', '2026-08-25 21:00:33'),
(243, 36, 'SKILL', 'Scheduling', '2026-08-25 21:00:33'),
(244, 36, 'SKILL', 'Teamwork', '2026-08-25 21:00:33'),
(245, 36, 'CERTIFICATION', 'Events And Recreation Management Training', '2026-08-25 21:00:33'),
(246, 36, 'CERTIFICATION', 'Basic First Aid And Safety Training', '2026-08-25 21:00:33'),
(247, 36, 'CERTIFICATION', 'Customer Service Excellence Training', '2026-08-25 21:00:33'),
(248, 36, 'CERTIFICATION', 'Activity Facilitation And Event Coordination Training', '2026-08-25 21:00:33'),
(249, 36, 'ORGANIZATION', 'Hotel Recreation and Activities Coordinator', '2026-08-25 21:00:33'),
(250, 36, 'ORGANIZATION', 'F&B', '2026-08-25 21:00:33'),
(251, 36, 'EMAIL', 'nicole.herrera.recreation@gmail.com', '2026-08-25 21:00:33'),
(252, 36, 'PHONE', '+63 919 678 1234', '2026-08-25 21:00:33'),
(253, 37, 'PERSON', 'PATRICIA ANNE MENDOZA', '2026-08-25 21:02:20'),
(254, 37, 'EDUCATION', 'Bachelor of Science in Hospitality Management', '2026-08-25 21:02:20'),
(255, 37, 'JOB_TITLE', 'Supervisor', '2026-08-25 21:02:20'),
(256, 37, 'JOB_TITLE', 'Housekeeping Attendant', '2026-08-25 21:02:20'),
(257, 37, 'SKILL', 'Customer Service', '2026-08-25 21:02:20'),
(258, 37, 'SKILL', 'Food Safety', '2026-08-25 21:02:20'),
(259, 37, 'SKILL', 'Housekeeping Operations', '2026-08-25 21:02:20'),
(260, 37, 'SKILL', 'Inventory Control', '2026-08-25 21:02:20'),
(261, 37, 'SKILL', 'Linen Handling', '2026-08-25 21:02:20'),
(262, 37, 'SKILL', 'MS Office', '2026-08-25 21:02:20'),
(263, 37, 'SKILL', 'Problem Solving', '2026-08-25 21:02:20'),
(264, 37, 'SKILL', 'Safety Compliance', '2026-08-25 21:02:20'),
(265, 37, 'SKILL', 'Scheduling', '2026-08-25 21:02:20'),
(266, 37, 'CERTIFICATION', 'TESDA Housekeeping NC II', '2026-08-25 21:02:20'),
(267, 37, 'CERTIFICATION', 'Housekeeping And Sanitation Training', '2026-08-25 21:02:20'),
(268, 37, 'CERTIFICATION', 'Occupational Safety And Health Awareness Training', '2026-08-25 21:02:20'),
(269, 37, 'CERTIFICATION', 'Customer Service Excellence Workshop', '2026-08-25 21:02:20'),
(270, 37, 'EMAIL', 'patriciamendoza.hr@example.cor', '2026-08-25 21:02:20'),
(271, 37, 'EMAIL', 'patricia.mendoza.hr@example.com', '2026-08-25 21:02:20'),
(272, 37, 'PHONE', '+63 917 482 1936', '2026-08-25 21:02:20'),
(273, 38, 'PERSON', 'RAFAEL DOMINIC LIM', '2026-08-25 21:04:12'),
(274, 38, 'EDUCATION', 'Bachelor of Science in Hospitality Management', '2026-08-25 21:04:12'),
(275, 38, 'JOB_TITLE', 'Beverage Service Specialist', '2026-08-25 21:04:12'),
(276, 38, 'JOB_TITLE', 'in monthly incremental revenue', '2026-08-25 21:04:12'),
(277, 38, 'JOB_TITLE', 'The Marigold Hotel Restaurant', '2026-08-25 21:04:12'),
(278, 38, 'JOB_TITLE', 'Supervisor', '2026-08-25 21:04:13'),
(279, 38, 'SKILL', 'Upselling', '2026-08-25 21:04:13'),
(280, 38, 'SKILL', 'POS Systems', '2026-08-25 21:04:13'),
(281, 38, 'SKILL', 'Customer Service', '2026-08-25 21:04:13'),
(282, 38, 'SKILL', 'Attention to Detail', '2026-08-25 21:04:13'),
(283, 38, 'SKILL', 'Cash Handling', '2026-08-25 21:04:13'),
(284, 38, 'SKILL', 'Food Safety', '2026-08-25 21:04:13'),
(285, 38, 'SKILL', 'Table Service', '2026-08-25 21:04:13'),
(286, 38, 'CERTIFICATION', 'Food Safety And Hygiene Certification', '2026-08-25 21:04:13'),
(287, 38, 'CERTIFICATION', 'Beverage Service Training', '2026-08-25 21:04:13'),
(288, 38, 'CERTIFICATION', 'Responsible Beverage Service Training', '2026-08-25 21:04:13'),
(289, 38, 'CERTIFICATION', 'Customer Service Excellence Training', '2026-08-25 21:04:13'),
(290, 38, 'ORGANIZATION', 'Beverage Service Specialist', '2026-08-25 21:04:13'),
(291, 38, 'ORGANIZATION', 'Restaurant Server', '2026-08-25 21:04:13'),
(292, 38, 'ORGANIZATION', 'Hotel Food and Beverage Attendant', '2026-08-25 21:04:13'),
(293, 38, 'EMAIL', 'rafael.lim.fnb@gmail.com', '2026-08-25 21:04:13'),
(294, 38, 'PHONE', '+63 918 4567890', '2026-08-25 21:04:13'),
(295, 39, 'PERSON', 'Roberto James Castillo', '2026-08-25 21:13:41'),
(296, 39, 'EDUCATION', 'Diploma in Hospitality Services - STI College, Pasay', '2026-08-25 21:13:41'),
(297, 39, 'JOB_TITLE', 'Supervisor', '2026-08-25 21:13:41'),
(298, 39, 'JOB_TITLE', 'Laundry Attendant', '2026-08-25 21:13:41'),
(299, 39, 'SKILL', 'Linen Handling', '2026-08-25 21:13:41'),
(300, 39, 'SKILL', 'Staff Supervision', '2026-08-25 21:13:41'),
(301, 39, 'SKILL', 'Laundry Quality Control', '2026-08-25 21:13:41'),
(302, 39, 'SKILL', 'Uniform Management', '2026-08-25 21:13:41'),
(303, 39, 'SKILL', 'Inventory Control', '2026-08-25 21:13:41'),
(304, 39, 'SKILL', 'Scheduling', '2026-08-25 21:13:41'),
(305, 39, 'SKILL', 'Hygiene', '2026-08-25 21:13:41'),
(306, 39, 'SKILL', 'Food Safety', '2026-08-25 21:13:41'),
(307, 39, 'SKILL', 'Team Leadership', '2026-08-25 21:13:41'),
(308, 39, 'SKILL', 'Time Management', '2026-08-25 21:13:41'),
(309, 39, 'SKILL', 'Problem Solving', '2026-08-25 21:13:41'),
(310, 39, 'SKILL', 'Housekeeping Operations', '2026-08-25 21:13:41'),
(311, 39, 'SKILL', 'Safety Compliance', '2026-08-25 21:13:41'),
(312, 39, 'CERTIFICATION', 'TESDA Housekeeping NC II', '2026-08-25 21:13:41'),
(313, 39, 'CERTIFICATION', 'Laundry Operations Training', '2026-08-25 21:13:41'),
(314, 39, 'CERTIFICATION', 'Workplace Safety Training', '2026-08-25 21:13:41'),
(315, 39, 'CERTIFICATION', 'Hygiene And Sanitation Training', '2026-08-25 21:13:41'),
(316, 39, 'ORGANIZATION', 'Oversee', '2026-08-25 21:13:41'),
(317, 39, 'ORGANIZATION', 'Enforce', '2026-08-25 21:13:41'),
(318, 39, 'EMAIL', 'roberto.castillo.laundry@gmail.com', '2026-08-25 21:13:41'),
(319, 39, 'PHONE', '+63 919 337 5502', '2026-08-25 21:13:41'),
(320, 40, 'PERSON', 'Roberto James Castillo', '2026-08-25 21:20:15'),
(321, 40, 'EDUCATION', 'Diploma in Hospitality Services - STI College, Pasay', '2026-08-25 21:20:15'),
(322, 40, 'JOB_TITLE', 'Supervisor', '2026-08-25 21:20:15'),
(323, 40, 'JOB_TITLE', 'Laundry Attendant', '2026-08-25 21:20:15'),
(324, 40, 'SKILL', 'Linen Handling', '2026-08-25 21:20:15'),
(325, 40, 'SKILL', 'Staff Supervision', '2026-08-25 21:20:15'),
(326, 40, 'SKILL', 'Laundry Quality Control', '2026-08-25 21:20:15'),
(327, 40, 'SKILL', 'Uniform Management', '2026-08-25 21:20:15'),
(328, 40, 'SKILL', 'Inventory Control', '2026-08-25 21:20:15'),
(329, 40, 'SKILL', 'Scheduling', '2026-08-25 21:20:15'),
(330, 40, 'SKILL', 'Hygiene', '2026-08-25 21:20:15'),
(331, 40, 'SKILL', 'Food Safety', '2026-08-25 21:20:15'),
(332, 40, 'SKILL', 'Team Leadership', '2026-08-25 21:20:15'),
(333, 40, 'SKILL', 'Time Management', '2026-08-25 21:20:15'),
(334, 40, 'SKILL', 'Problem Solving', '2026-08-25 21:20:15'),
(335, 40, 'SKILL', 'Housekeeping Operations', '2026-08-25 21:20:15'),
(336, 40, 'SKILL', 'Safety Compliance', '2026-08-25 21:20:15'),
(337, 40, 'CERTIFICATION', 'TESDA Housekeeping NC II', '2026-08-25 21:20:15'),
(338, 40, 'CERTIFICATION', 'Laundry Operations Training', '2026-08-25 21:20:15'),
(339, 40, 'CERTIFICATION', 'Workplace Safety Training', '2026-08-25 21:20:15'),
(340, 40, 'CERTIFICATION', 'Hygiene And Sanitation Training', '2026-08-25 21:20:15'),
(341, 40, 'ORGANIZATION', 'Oversee', '2026-08-25 21:20:15'),
(342, 40, 'ORGANIZATION', 'Enforce', '2026-08-25 21:20:15'),
(343, 40, 'EMAIL', 'roberto.castillo.laundry@gmail.com', '2026-08-25 21:20:15'),
(344, 40, 'PHONE', '+63 919 337 5502', '2026-08-25 21:20:15'),
(345, 41, 'PERSON', 'Samantha Nicole Dela Cruz', '2026-08-25 21:20:53'),
(346, 41, 'EDUCATION', 'Bachelor of Science in Hospitality Management', '2026-08-25 21:20:53'),
(347, 41, 'JOB_TITLE', 'Supervisor', '2026-08-25 21:20:53'),
(348, 41, 'JOB_TITLE', 'Copper & Vine Restaurant and Lounge', '2026-08-25 21:20:53'),
(349, 41, 'JOB_TITLE', 'The Ember Room, Aurelia Hotel Manila', '2026-08-25 21:20:53'),
(350, 41, 'SKILL', 'Cash Handling', '2026-08-25 21:20:53'),
(351, 41, 'SKILL', 'Complaint Handling', '2026-08-25 21:20:53'),
(352, 41, 'SKILL', 'Customer Service', '2026-08-25 21:20:53'),
(353, 41, 'SKILL', 'Guest Recovery', '2026-08-25 21:20:53'),
(354, 41, 'SKILL', 'Guest Relations', '2026-08-25 21:20:53'),
(355, 41, 'SKILL', 'Inventory Control', '2026-08-25 21:20:53'),
(356, 41, 'SKILL', 'MS Office', '2026-08-25 21:20:53'),
(357, 41, 'SKILL', 'POS Systems', '2026-08-25 21:20:53'),
(358, 41, 'SKILL', 'Problem Solving', '2026-08-25 21:20:53'),
(359, 41, 'SKILL', 'Scheduling', '2026-08-25 21:20:53'),
(360, 41, 'SKILL', 'Staff Training', '2026-08-25 21:20:53'),
(361, 41, 'SKILL', 'Upselling', '2026-08-25 21:20:53'),
(362, 41, 'CERTIFICATION', 'Responsible Beverage Service Training', '2026-08-25 21:20:53'),
(363, 41, 'CERTIFICATION', 'Basic Supervisory Skills Training', '2026-08-25 21:20:53'),
(364, 41, 'CERTIFICATION', 'Bar Operations Training', '2026-08-25 21:20:53'),
(365, 41, 'CERTIFICATION', 'Customer Service Excellence Training', '2026-08-25 21:20:53'),
(366, 41, 'ORGANIZATION', 'Restaurant Bar Operations Supervisor', '2026-08-25 21:20:53'),
(367, 41, 'ORGANIZATION', 'Senior Bartender', '2026-08-25 21:20:53'),
(368, 41, 'ORGANIZATION', 'Bar Team Leader', '2026-08-25 21:20:53'),
(369, 41, 'ORGANIZATION', 'Coordinated', '2026-08-25 21:20:53'),
(370, 41, 'ORGANIZATION', 'Salt & Barrel Gastropub', '2026-08-25 21:20:53'),
(371, 41, 'ORGANIZATION', 'Assisted', '2026-08-25 21:20:53'),
(372, 41, 'EMAIL', 'samantha.delacruz.fnb@gmail.com', '2026-08-25 21:20:53'),
(373, 41, 'PHONE', '+63 918 664 2317', '2026-08-25 21:20:53'),
(374, 42, 'PERSON', 'Vincent Paul Soriano', '2026-08-25 21:42:45'),
(375, 42, 'EDUCATION', 'Bachelor of Science in Hospitality Management - Philippine School of Business Admin', '2026-08-25 21:42:45'),
(376, 42, 'JOB_TITLE', 'Hotel Night Auditor', '2026-08-25 21:42:45'),
(377, 42, 'JOB_TITLE', 'Maintenance Technician', '2026-08-25 21:42:45'),
(378, 42, 'JOB_TITLE', 'Front Desk Associate', '2026-08-25 21:42:45'),
(379, 42, 'SKILL', 'Night Audit Procedures', '2026-08-25 21:42:45'),
(380, 42, 'SKILL', 'Front Office Operations', '2026-08-25 21:42:45'),
(381, 42, 'SKILL', 'Cash Reconciliation', '2026-08-25 21:42:45'),
(382, 42, 'SKILL', 'Hotel Reservation Systems', '2026-08-25 21:42:45'),
(383, 42, 'SKILL', 'Guest Relations', '2026-08-25 21:42:45'),
(384, 42, 'SKILL', 'Payment Processing', '2026-08-25 21:42:45'),
(385, 42, 'SKILL', 'Check-in / Check-out', '2026-08-25 21:42:45'),
(386, 42, 'SKILL', 'Records Documentation', '2026-08-25 21:42:45'),
(387, 42, 'SKILL', 'Attention to Detail', '2026-08-25 21:42:45'),
(388, 42, 'SKILL', 'Problem Solving', '2026-08-25 21:42:45'),
(389, 42, 'SKILL', 'Time Management', '2026-08-25 21:42:45'),
(390, 42, 'SKILL', 'Cash Handling', '2026-08-25 21:42:45'),
(391, 42, 'SKILL', 'Customer Service', '2026-08-25 21:42:45'),
(392, 42, 'SKILL', 'Housekeeping Operations', '2026-08-25 21:42:45'),
(393, 42, 'SKILL', 'MS Office', '2026-08-25 21:42:45'),
(394, 42, 'SKILL', 'POS Systems', '2026-08-25 21:42:45'),
(395, 42, 'SKILL', 'Property Management Systems', '2026-08-25 21:42:45'),
(396, 42, 'SKILL', 'Reservations', '2026-08-25 21:42:45'),
(397, 42, 'CERTIFICATION', 'Hotel Front Office Operations Training', '2026-08-25 21:42:45'),
(398, 42, 'CERTIFICATION', 'Basic Bookkeeping And Accounting Training', '2026-08-25 21:42:45'),
(399, 42, 'CERTIFICATION', 'Customer Service Excellence Training - Manila Tourism Training', '2026-08-25 21:42:45'),
(400, 42, 'CERTIFICATION', 'Microsoft Excel For Financial Reporting - Online Certification', '2026-08-25 21:42:45'),
(401, 42, 'ORGANIZATION', 'Prepare', '2026-08-25 21:42:45'),
(402, 42, 'ORGANIZATION', 'Opera PMS', '2026-08-25 21:42:45'),
(403, 42, 'EMAIL', 'vincent.soriano.hotel@gmail.com', '2026-08-25 21:42:45'),
(404, 42, 'PHONE', '+63 917 245 8813', '2026-08-25 21:42:45'),
(405, 43, 'PERSON', 'ANGELA MARIE CRUZ', '2026-08-25 21:45:32'),
(406, 43, 'EDUCATION', 'Senior High School Diploma', '2026-08-25 21:45:32'),
(407, 43, 'JOB_TITLE', 'Barista', '2026-08-25 21:45:32'),
(408, 43, 'JOB_TITLE', 'Cloudwater Coffee Roasters', '2026-08-25 21:45:32'),
(409, 43, 'JOB_TITLE', 'Supervisor', '2026-08-25 21:45:32'),
(410, 43, 'SKILL', 'Cash Handling', '2026-08-25 21:45:32'),
(411, 43, 'SKILL', 'Barista Operations', '2026-08-25 21:45:32'),
(412, 43, 'SKILL', 'Coffee Preparation', '2026-08-25 21:45:32'),
(413, 43, 'SKILL', 'Customer Service', '2026-08-25 21:45:32'),
(414, 43, 'SKILL', 'Food Safety', '2026-08-25 21:45:32'),
(415, 43, 'SKILL', 'Plating', '2026-08-25 21:45:32'),
(416, 43, 'SKILL', 'POS Systems', '2026-08-25 21:45:32'),
(417, 43, 'SKILL', 'Teamwork', '2026-08-25 21:45:32'),
(418, 43, 'SKILL', 'Time Management', '2026-08-25 21:45:32'),
(419, 43, 'SKILL', 'Upselling', '2026-08-25 21:45:32'),
(420, 43, 'CERTIFICATION', 'TESDA Food and Beverage Services NC II', '2026-08-25 21:45:32'),
(421, 43, 'CERTIFICATION', 'Barista And Coffee Craft Training', '2026-08-25 21:45:32'),
(422, 43, 'CERTIFICATION', 'Food Safety And Hygiene Training', '2026-08-25 21:45:32'),
(423, 43, 'CERTIFICATION', 'Customer Service Excellence Training', '2026-08-25 21:45:32'),
(424, 43, 'ORGANIZATION', 'Cloudwater Coffee Roasters', '2026-08-25 21:45:32'),
(425, 43, 'ORGANIZATION', 'Restaurant Server', '2026-08-25 21:45:32'),
(426, 43, 'ORGANIZATION', 'Food and Beverage Attendant', '2026-08-25 21:45:32'),
(427, 43, 'ORGANIZATION', 'Prepare', '2026-08-25 21:45:32'),
(428, 43, 'ORGANIZATION', 'Regularly', '2026-08-25 21:45:32'),
(429, 43, 'EMAIL', 'angela.cruz.fnb@gmail.com', '2026-08-25 21:45:32'),
(430, 43, 'PHONE', '0906 3728841', '2026-08-25 21:45:32'),
(431, 43, 'PHONE', '09063728841', '2026-08-25 21:45:32'),
(432, 44, 'PERSON', 'Bianca Louise Garcia', '2026-08-25 21:47:37'),
(433, 44, 'EDUCATION', 'Bachelor of Science in Food Technology - University of Perpetual Help System DALTA', '2026-08-25 21:47:37'),
(434, 44, 'JOB_TITLE', 'Restaurant Quality Assurance Officer', '2026-08-25 21:47:37'),
(435, 44, 'JOB_TITLE', 'Food Safety Officer', '2026-08-25 21:47:37'),
(436, 44, 'JOB_TITLE', 'Supervisor', '2026-08-25 21:47:37'),
(437, 44, 'SKILL', 'HACCP', '2026-08-25 21:47:37'),
(438, 44, 'SKILL', 'Quality Assurance', '2026-08-25 21:47:37'),
(439, 44, 'SKILL', 'Food Safety', '2026-08-25 21:47:37'),
(440, 44, 'SKILL', 'Food Handling Standards', '2026-08-25 21:47:37'),
(441, 44, 'SKILL', 'Restaurant Compliance', '2026-08-25 21:47:37'),
(442, 44, 'SKILL', 'Records Documentation', '2026-08-25 21:47:37'),
(443, 44, 'SKILL', 'Staff Training', '2026-08-25 21:47:37'),
(444, 44, 'SKILL', 'Internal Auditing', '2026-08-25 21:47:37'),
(445, 44, 'SKILL', 'Attention to Detail', '2026-08-25 21:47:37'),
(446, 44, 'SKILL', 'Problem Solving', '2026-08-25 21:47:37'),
(447, 44, 'SKILL', 'MS Office', '2026-08-25 21:47:37'),
(448, 44, 'CERTIFICATION', 'Food Safety And Hygiene Certification', '2026-08-25 21:47:37'),
(449, 44, 'CERTIFICATION', 'Haccp Awareness Training', '2026-08-25 21:47:37'),
(450, 44, 'CERTIFICATION', 'Basic Occupational Safety And Health Training', '2026-08-25 21:47:37'),
(451, 44, 'CERTIFICATION', 'Internal Quality Audit Training', '2026-08-25 21:47:37'),
(452, 44, 'ORGANIZATION', 'Prepare', '2026-08-25 21:47:37'),
(453, 44, 'EMAIL', 'bianca.garcia.qa@gmail.com', '2026-08-25 21:47:37'),
(454, 44, 'PHONE', '+63 918 662 4471', '2026-08-25 21:47:37'),
(455, 45, 'PERSON', 'ALYSSA MARIE', '2026-08-26 02:04:44'),
(456, 45, 'EDUCATION', 'Bachelor of Science in Hospitality Management', '2026-08-26 02:04:44'),
(457, 45, 'JOB_TITLE', 'Front Desk Receptionist', '2026-08-26 02:04:44'),
(458, 45, 'JOB_TITLE', 'Concierge', '2026-08-26 02:04:44'),
(459, 45, 'JOB_TITLE', 'Spa Front Desk Associate', '2026-08-26 02:04:44'),
(460, 45, 'SKILL', 'Spa Reception', '2026-08-26 02:04:44'),
(461, 45, 'SKILL', 'Scheduling', '2026-08-26 02:04:44'),
(462, 45, 'SKILL', 'Guest Relations', '2026-08-26 02:04:44'),
(463, 45, 'SKILL', 'Reservations', '2026-08-26 02:04:44'),
(464, 45, 'SKILL', 'Front Office Operations', '2026-08-26 02:04:45'),
(465, 45, 'SKILL', 'Payment Processing', '2026-08-26 02:04:45'),
(466, 45, 'SKILL', 'POS Systems', '2026-08-26 02:04:45'),
(467, 45, 'SKILL', 'Customer Service', '2026-08-26 02:04:45'),
(468, 45, 'SKILL', 'Complaint Handling', '2026-08-26 02:04:45'),
(469, 45, 'SKILL', 'Time Management', '2026-08-26 02:04:45'),
(470, 45, 'SKILL', 'Attention to Detail', '2026-08-26 02:04:45'),
(471, 45, 'SKILL', 'Cash Handling', '2026-08-26 02:04:45'),
(472, 45, 'SKILL', 'Check-in / Check-out', '2026-08-26 02:04:45'),
(473, 45, 'SKILL', 'Communication', '2026-08-26 02:04:45'),
(474, 45, 'SKILL', 'Housekeeping Operations', '2026-08-26 02:04:45'),
(475, 45, 'SKILL', 'MS Office', '2026-08-26 02:04:45'),
(476, 45, 'SKILL', 'Property Management Systems', '2026-08-26 02:04:45'),
(477, 45, 'CERTIFICATION', 'Customer Service Excellence', '2026-08-26 02:04:46'),
(478, 45, 'CERTIFICATION', 'Spa Reception & Guest Service', '2026-08-26 02:04:46'),
(479, 45, 'CERTIFICATION', 'Basic First Aid Training', '2026-08-26 02:04:46'),
(480, 45, 'CERTIFICATION', 'Cross Ph)', '2026-08-26 02:04:46'),
(481, 45, 'CERTIFICATION', 'Wellness & Hospitality Service', '2026-08-26 02:04:46'),
(482, 45, 'ORGANIZATION', 'The Cortina Wellness Resort & Spa', '2026-08-26 02:04:46'),
(483, 45, 'ORGANIZATION', 'Serenity Springs Day Spa', '2026-08-26 02:04:46'),
(484, 45, 'ORGANIZATION', 'Opera', '2026-08-26 02:04:46'),
(485, 45, 'EMAIL', '5678alyssa.valdez.spa@gmail.com', '2026-08-26 02:04:46'),
(486, 45, 'PHONE', '+63 917 234 5678', '2026-08-26 02:04:46'),
(487, 46, 'PERSON', 'Vincent Paul Soriano', '2026-08-26 02:33:18'),
(488, 46, 'EDUCATION', 'Bachelor of Science in Hospitality Management - Philippine School of Business Admin', '2026-08-26 02:33:18'),
(489, 46, 'JOB_TITLE', 'Hotel Night Auditor', '2026-08-26 02:33:18'),
(490, 46, 'JOB_TITLE', 'with on-duty staff', '2026-08-26 02:33:18'),
(491, 46, 'JOB_TITLE', 'Bayview Suites & Residences', '2026-08-26 02:33:18'),
(492, 46, 'SKILL', 'Night Audit Procedures', '2026-08-26 02:33:18'),
(493, 46, 'SKILL', 'Front Office Operations', '2026-08-26 02:33:18'),
(494, 46, 'SKILL', 'Cash Reconciliation', '2026-08-26 02:33:18'),
(495, 46, 'SKILL', 'Hotel Reservation Systems', '2026-08-26 02:33:18'),
(496, 46, 'SKILL', 'Guest Relations', '2026-08-26 02:33:18'),
(497, 46, 'SKILL', 'Payment Processing', '2026-08-26 02:33:18'),
(498, 46, 'SKILL', 'Check-in / Check-out', '2026-08-26 02:33:18'),
(499, 46, 'SKILL', 'Records Documentation', '2026-08-26 02:33:18'),
(500, 46, 'SKILL', 'Attention to Detail', '2026-08-26 02:33:18'),
(501, 46, 'SKILL', 'Problem Solving', '2026-08-26 02:33:18'),
(502, 46, 'SKILL', 'Time Management', '2026-08-26 02:33:18'),
(503, 46, 'SKILL', 'Cash Handling', '2026-08-26 02:33:18'),
(504, 46, 'SKILL', 'Customer Service', '2026-08-26 02:33:18'),
(505, 46, 'SKILL', 'Housekeeping Operations', '2026-08-26 02:33:18'),
(506, 46, 'SKILL', 'MS Office', '2026-08-26 02:33:18'),
(507, 46, 'SKILL', 'POS Systems', '2026-08-26 02:33:18'),
(508, 46, 'SKILL', 'Property Management Systems', '2026-08-26 02:33:18'),
(509, 46, 'SKILL', 'Reservations', '2026-08-26 02:33:18'),
(510, 46, 'CERTIFICATION', 'Hotel Front Office Operations Training', '2026-08-26 02:33:18'),
(511, 46, 'CERTIFICATION', 'Basic Bookkeeping And Accounting Training', '2026-08-26 02:33:18'),
(512, 46, 'CERTIFICATION', 'Customer Service Excellence Training - Manila Tourism Training', '2026-08-26 02:33:18'),
(513, 46, 'CERTIFICATION', 'Microsoft Excel For Financial Reporting - Online Certification', '2026-08-26 02:33:18'),
(514, 46, 'ORGANIZATION', 'Hotel Night Auditor', '2026-08-26 02:33:18'),
(515, 46, 'ORGANIZATION', 'Front Desk Associate', '2026-08-26 02:33:18'),
(516, 46, 'ORGANIZATION', 'Accounts Assistant', '2026-08-26 02:33:18'),
(517, 46, 'ORGANIZATION', 'Opera PMS', '2026-08-26 02:33:18'),
(518, 46, 'ORGANIZATION', 'Bayview Suites & Residences', '2026-08-26 02:33:18'),
(519, 46, 'EMAIL', 'vincent.soriano.hotel@gmail.com', '2026-08-26 02:33:18'),
(520, 46, 'PHONE', '+63 917 245 8813', '2026-08-26 02:33:18'),
(571, 53, 'PERSON', 'ALYSSA MARIE', '2026-08-30 23:09:41'),
(572, 53, 'EDUCATION', 'Bachelor of Science in Hospitality Management', '2026-08-30 23:09:41'),
(573, 53, 'JOB_TITLE', 'Front Desk Receptionist', '2026-08-30 23:09:41'),
(574, 53, 'JOB_TITLE', 'Concierge', '2026-08-30 23:09:41'),
(575, 53, 'JOB_TITLE', 'Spa Front Desk Associate', '2026-08-30 23:09:41'),
(576, 53, 'SKILL', 'Spa Reception', '2026-08-30 23:09:41'),
(577, 53, 'SKILL', 'Scheduling', '2026-08-30 23:09:41'),
(578, 53, 'SKILL', 'Guest Relations', '2026-08-30 23:09:41'),
(579, 53, 'SKILL', 'Reservations', '2026-08-30 23:09:41'),
(580, 53, 'SKILL', 'Front Office Operations', '2026-08-30 23:09:41'),
(581, 53, 'SKILL', 'Payment Processing', '2026-08-30 23:09:41'),
(582, 53, 'SKILL', 'POS Systems', '2026-08-30 23:09:41'),
(583, 53, 'SKILL', 'Customer Service', '2026-08-30 23:09:41'),
(584, 53, 'SKILL', 'Complaint Handling', '2026-08-30 23:09:41'),
(585, 53, 'SKILL', 'Time Management', '2026-08-30 23:09:41'),
(586, 53, 'SKILL', 'Attention to Detail', '2026-08-30 23:09:41'),
(587, 53, 'SKILL', 'Cash Handling', '2026-08-30 23:09:41'),
(588, 53, 'SKILL', 'Check-in / Check-out', '2026-08-30 23:09:41'),
(589, 53, 'SKILL', 'Communication', '2026-08-30 23:09:41'),
(590, 53, 'SKILL', 'Housekeeping Operations', '2026-08-30 23:09:41'),
(591, 53, 'SKILL', 'MS Office', '2026-08-30 23:09:41'),
(592, 53, 'SKILL', 'Property Management Systems', '2026-08-30 23:09:41'),
(593, 53, 'CERTIFICATION', 'Customer Service Excellence', '2026-08-30 23:09:41'),
(594, 53, 'CERTIFICATION', 'Spa Reception & Guest Service', '2026-08-30 23:09:41'),
(595, 53, 'CERTIFICATION', 'Basic First Aid Training', '2026-08-30 23:09:41'),
(596, 53, 'CERTIFICATION', 'Cross Ph)', '2026-08-30 23:09:41'),
(597, 53, 'CERTIFICATION', 'Wellness & Hospitality Service', '2026-08-30 23:09:41'),
(598, 53, 'ORGANIZATION', 'The Cortina Wellness Resort & Spa', '2026-08-30 23:09:41'),
(599, 53, 'ORGANIZATION', 'Serenity Springs Day Spa', '2026-08-30 23:09:41'),
(600, 53, 'ORGANIZATION', 'Opera', '2026-08-30 23:09:41'),
(601, 53, 'EMAIL', '5678alyssa.valdez.spa@gmail.com', '2026-08-30 23:09:41'),
(602, 53, 'PHONE', '+63 917 234 5678', '2026-08-30 23:09:41'),
(603, 54, 'PERSON', 'Adrian Paolo Mercado', '2026-08-31 20:15:27'),
(604, 54, 'EDUCATION', 'Bachelor of Science in Hospitality Management Housekeeping NC II - TESDA', '2026-08-31 20:15:27'),
(605, 54, 'EDUCATION', 'Certificate in Hotel and Accommodation Services', '2026-08-31 20:15:27'),
(606, 54, 'JOB_TITLE', 'Tanawin Cove Resort', '2026-08-31 20:15:27'),
(607, 54, 'JOB_TITLE', 'Isla Verde Beach Resort', '2026-08-31 20:15:27'),
(608, 54, 'SKILL', 'Housekeeping Operations', '2026-08-31 20:15:27'),
(609, 54, 'SKILL', 'Staff Supervision & Development', '2026-08-31 20:15:27'),
(610, 54, 'SKILL', 'Linen & Amenity Coordination', '2026-08-31 20:15:27'),
(611, 54, 'SKILL', 'Inventory Control', '2026-08-31 20:15:27'),
(612, 54, 'SKILL', 'Scheduling', '2026-08-31 20:15:27'),
(613, 54, 'SKILL', 'Training Program Development', '2026-08-31 20:15:27'),
(614, 54, 'SKILL', 'Cleaning Standards & SOPs', '2026-08-31 20:15:27'),
(615, 54, 'SKILL', 'Guest Recovery', '2026-08-31 20:15:27'),
(616, 54, 'SKILL', 'Operational Planning', '2026-08-31 20:15:27'),
(617, 54, 'SKILL', 'Cross-Department Coordination', '2026-08-31 20:15:27'),
(618, 54, 'SKILL', 'Occupational Health & Safety', '2026-08-31 20:15:27'),
(619, 54, 'SKILL', 'Check-in / Check-out', '2026-08-31 20:15:27'),
(620, 54, 'SKILL', 'Communication', '2026-08-31 20:15:27'),
(621, 54, 'SKILL', 'Customer Service', '2026-08-31 20:15:27'),
(622, 54, 'SKILL', 'Food Safety', '2026-08-31 20:15:28'),
(623, 54, 'SKILL', 'Front Office Operations', '2026-08-31 20:15:28'),
(624, 54, 'SKILL', 'Inventory', '2026-08-31 20:15:28'),
(625, 54, 'SKILL', 'Plating', '2026-08-31 20:15:28'),
(626, 54, 'SKILL', 'Room Turnover', '2026-08-31 20:15:28'),
(627, 54, 'SKILL', 'Safety Compliance', '2026-08-31 20:15:28'),
(628, 54, 'SKILL', 'Staff Training', '2026-08-31 20:15:28'),
(629, 54, 'CERTIFICATION', 'TESDA Housekeeping NC II', '2026-08-31 20:15:28'),
(630, 54, 'ORGANIZATION', 'Housekeeping Manager', '2026-08-31 20:15:28'),
(631, 54, 'ORGANIZATION', 'Assistant Housekeeping Manager', '2026-08-31 20:15:28'),
(632, 54, 'ORGANIZATION', 'Housekeeping Supervisor', '2026-08-31 20:15:28'),
(633, 54, 'EMAIL', 'adrian.mercado.hk@gmail.com', '2026-08-31 20:15:28'),
(634, 54, 'PHONE', '+63 939 662 0148', '2026-08-31 20:15:28'),
(635, 55, 'PERSON', 'CARLO MIGUEL FERNAN', '2026-08-31 20:56:08'),
(636, 55, 'EDUCATION', 'Bachelor of Science in Hospitality Management (2 years completed) 2016 - 2018', '2026-08-31 20:56:08'),
(637, 55, 'JOB_TITLE', 'Supervisor', '2026-08-31 20:56:08'),
(638, 55, 'JOB_TITLE', 'period through improved par-level tracking', '2026-08-31 20:56:08'),
(639, 55, 'JOB_TITLE', 'Bistro Verde Restaurant Group', '2026-08-31 20:56:08'),
(640, 55, 'SKILL', 'Food Safety', '2026-08-31 20:56:08'),
(641, 55, 'SKILL', 'HACCP', '2026-08-31 20:56:08'),
(642, 55, 'SKILL', 'Inventory', '2026-08-31 20:56:08'),
(643, 55, 'SKILL', 'Inventory Control', '2026-08-31 20:56:08'),
(644, 55, 'SKILL', 'Knife Skills', '2026-08-31 20:56:08'),
(645, 55, 'SKILL', 'Maintenance Basics', '2026-08-31 20:56:08'),
(646, 55, 'SKILL', 'Plating', '2026-08-31 20:56:08'),
(647, 55, 'SKILL', 'POS Systems', '2026-08-31 20:56:08'),
(648, 55, 'SKILL', 'Scheduling', '2026-08-31 20:56:08'),
(649, 55, 'SKILL', 'Time Management', '2026-08-31 20:56:08'),
(650, 55, 'CERTIFICATION', 'TESDA Cookery NC II', '2026-08-31 20:56:08'),
(651, 55, 'CERTIFICATION', 'Food Safety And Hygiene Certification', '2026-08-31 20:56:08'),
(652, 55, 'CERTIFICATION', 'Basic Occupational Safety And Health Training', '2026-08-31 20:56:08'),
(653, 55, 'CERTIFICATION', 'Culinary Diploma', '2026-08-31 20:56:08'),
(654, 55, 'ORGANIZATION', 'Kitchen Supervisor', '2026-08-31 20:56:08'),
(655, 55, 'ORGANIZATION', 'Senior Line Cook', '2026-08-31 20:56:08'),
(656, 55, 'ORGANIZATION', 'Line Cook', '2026-08-31 20:56:08'),
(657, 55, 'ORGANIZATION', 'Kitchen Staff', '2026-08-31 20:56:08'),
(658, 55, 'ORGANIZATION', 'Assisted', '2026-08-31 20:56:08'),
(659, 55, 'ORGANIZATION', 'FIFO', '2026-08-31 20:56:08'),
(660, 55, 'EMAIL', 'carlo.fernandez.chef@gmail.com', '2026-08-31 20:56:08'),
(661, 55, 'PHONE', '+63 928 4417702', '2026-08-31 20:56:08'),
(662, 56, 'PERSON', 'CARLO MIGUEL FERNANDEZ', '2026-09-01 00:26:36'),
(663, 56, 'EDUCATION', 'Bachelor of Science in Hospitality Management (2 years completed)', '2026-09-01 00:26:36'),
(664, 56, 'JOB_TITLE', 'Supervisor', '2026-09-01 00:26:36'),
(665, 56, 'JOB_TITLE', 'period through improved par-level tracking', '2026-09-01 00:26:36'),
(666, 56, 'JOB_TITLE', 'Bistro Verde Restaurant Group', '2026-09-01 00:26:36'),
(667, 56, 'SKILL', 'Food Safety', '2026-09-01 00:26:36'),
(668, 56, 'SKILL', 'HACCP', '2026-09-01 00:26:36'),
(669, 56, 'SKILL', 'Inventory', '2026-09-01 00:26:36'),
(670, 56, 'SKILL', 'Inventory Control', '2026-09-01 00:26:36'),
(671, 56, 'SKILL', 'Knife Skills', '2026-09-01 00:26:36'),
(672, 56, 'SKILL', 'Maintenance Basics', '2026-09-01 00:26:36'),
(673, 56, 'SKILL', 'Plating', '2026-09-01 00:26:36'),
(674, 56, 'SKILL', 'POS Systems', '2026-09-01 00:26:36'),
(675, 56, 'SKILL', 'Scheduling', '2026-09-01 00:26:36'),
(676, 56, 'SKILL', 'Time Management', '2026-09-01 00:26:36'),
(677, 56, 'CERTIFICATION', 'Culinary Diploma', '2026-09-01 00:26:36'),
(678, 56, 'CERTIFICATION', 'TESDA Cookery NC II', '2026-09-01 00:26:36'),
(679, 56, 'ORGANIZATION', 'Kitchen Supervisor', '2026-09-01 00:26:36'),
(680, 56, 'ORGANIZATION', 'Senior Line Cook', '2026-09-01 00:26:36'),
(681, 56, 'ORGANIZATION', 'Line Cook', '2026-09-01 00:26:36'),
(682, 56, 'ORGANIZATION', 'Kitchen Staff', '2026-09-01 00:26:36'),
(683, 56, 'ORGANIZATION', 'la carte', '2026-09-01 00:26:36'),
(684, 56, 'ORGANIZATION', 'FIFO', '2026-09-01 00:26:36'),
(685, 56, 'EMAIL', 'carlo.fernandez.chef@gmail.com', '2026-09-01 00:26:36'),
(686, 56, 'PHONE', '+63 928 441 7702', '2026-09-01 00:26:36'),
(687, 57, 'PERSON', 'NATHANIEL JAMES MERCADO', '2026-09-02 05:54:41'),
(688, 57, 'EDUCATION', 'Bachelor of Science in Hotel and Restaurant Management', '2026-09-02 05:54:41'),
(689, 57, 'JOB_TITLE', 'Chef', '2026-09-02 05:54:41'),
(690, 57, 'JOB_TITLE', 'Line Cook', '2026-09-02 05:54:41'),
(691, 57, 'JOB_TITLE', 'Supervisor', '2026-09-02 05:54:41'),
(692, 57, 'SKILL', 'Banquet Service', '2026-09-02 05:54:41'),
(693, 57, 'SKILL', 'Food Safety', '2026-09-02 05:54:41'),
(694, 57, 'SKILL', 'HACCP', '2026-09-02 05:54:41'),
(695, 57, 'SKILL', 'Inventory', '2026-09-02 05:54:41'),
(696, 57, 'SKILL', 'Mise en Place', '2026-09-02 05:54:41'),
(697, 57, 'SKILL', 'Plating', '2026-09-02 05:54:41'),
(698, 57, 'SKILL', 'Safety Compliance', '2026-09-02 05:54:41'),
(699, 57, 'SKILL', 'Scheduling', '2026-09-02 05:54:41'),
(700, 57, 'CERTIFICATION', 'C E R T I F I C A T Ion S', '2026-09-02 05:54:41'),
(701, 57, 'CERTIFICATION', 'Food Handler Certificate', '2026-09-02 05:54:41'),
(702, 57, 'CERTIFICATION', 'Provider', '2026-09-02 05:54:41'),
(703, 57, 'CERTIFICATION', 'Haccp Awareness Training', '2026-09-02 05:54:41'),
(704, 57, 'CERTIFICATION', 'Supervisory Skills Workshop - Metro Manila Hospitality Training', '2026-09-02 05:54:41'),
(705, 57, 'CERTIFICATION', 'Workplace Safety Seminar - Occupational Safety And Health Centeraccredited Provider', '2026-09-02 05:54:41'),
(706, 57, 'CERTIFICATION', 'Culinary Arts, Cordova Institute Of Culinary And Hospitality Arts, Provider', '2026-09-02 05:54:41'),
(707, 57, 'CERTIFICATION', 'Workplace Safety Seminar', '2026-09-02 05:54:41'),
(708, 57, 'EMAIL', 'nathaniel.mercado.culinary@gmail.com', '2026-09-02 05:54:41'),
(709, 57, 'PHONE', '0928-671-4459', '2026-09-02 05:54:41'),
(710, 58, 'PERSON', 'Bianca Nicole Castillo', '2026-09-02 06:19:43'),
(711, 58, 'EDUCATION', 'Bachelor of Science in Hospitality Management', '2026-09-02 06:19:43'),
(712, 58, 'JOB_TITLE', 'Supervisor', '2026-09-02 06:19:43'),
(713, 58, 'SKILL', 'mentoring', '2026-09-02 06:19:43'),
(714, 58, 'SKILL', 'Group booking coordination Rate', '2026-09-02 06:19:43'),
(715, 58, 'SKILL', 'Attention to Detail', '2026-09-02 06:19:43'),
(716, 58, 'SKILL', 'Check-in / Check-out', '2026-09-02 06:19:43'),
(717, 58, 'SKILL', 'Customer Service', '2026-09-02 06:19:43'),
(718, 58, 'SKILL', 'Front Office Operations', '2026-09-02 06:19:43'),
(719, 58, 'SKILL', 'Inventory', '2026-09-02 06:19:43'),
(720, 58, 'SKILL', 'Inventory Control', '2026-09-02 06:19:43'),
(721, 58, 'SKILL', 'Property Management Systems', '2026-09-02 06:19:43'),
(722, 58, 'SKILL', 'Reservations', '2026-09-02 06:19:43'),
(723, 58, 'SKILL', 'Staff Training', '2026-09-02 06:19:43'),
(724, 58, 'CERTIFICATION', 'C E R T I F I C A T Ion S', '2026-09-02 06:19:43'),
(725, 58, 'CERTIFICATION', 'Front Office Operations Certificate', '2026-09-02 06:19:43'),
(726, 58, 'CERTIFICATION', 'Hotel Reservations Management Training', '2026-09-02 06:19:43'),
(727, 58, 'CERTIFICATION', 'Center', '2026-09-02 06:19:43'),
(728, 58, 'CERTIFICATION', 'Revenue And Room Inventory Fundamentals', '2026-09-02 06:19:43'),
(729, 58, 'CERTIFICATION', 'Institute', '2026-09-02 06:19:43'),
(730, 58, 'CERTIFICATION', 'Guest Service Excellence Workshop', '2026-09-02 06:19:43'),
(731, 58, 'CERTIFICATION', 'Bianca Nicole Castillo 0917', '2026-09-02 06:19:43'),
(732, 58, 'CERTIFICATION', 'Hotel Reservations Supervisor Quezon City, Metro Manila, Philippines', '2026-09-02 06:19:43'),
(733, 58, 'CERTIFICATION', 'Tourism And Hospitality, Quezon City (June', '2026-09-02 06:19:43'),
(734, 58, 'EMAIL', '0917-542-3186bianca.castillo.hospitality@gmail.com', '2026-09-02 06:19:43'),
(735, 58, 'PHONE', '0917-542-3186', '2026-09-02 06:19:43'),
(736, 59, 'PERSON', 'Camille Rose Evangelista', '2026-09-02 08:05:05'),
(737, 59, 'EDUCATION', 'Bachelor of Science in Tourism Management', '2026-09-02 08:05:05'),
(738, 59, 'JOB_TITLE', 'Spa Receptionist', '2026-09-02 08:05:05'),
(739, 59, 'JOB_TITLE', 'Wellness Services Associate', '2026-09-02 08:05:05'),
(740, 59, 'JOB_TITLE', 'Spa and Wellness Operations Coordinator', '2026-09-02 08:05:05'),
(741, 59, 'SKILL', 'Spa operations management', '2026-09-02 08:05:05'),
(742, 59, 'SKILL', 'Therapist capacity planning', '2026-09-02 08:05:05'),
(743, 59, 'SKILL', 'Staff Training', '2026-09-02 08:05:05'),
(744, 59, 'SKILL', 'onboarding', '2026-09-02 08:05:05'),
(745, 59, 'SKILL', 'Scheduling', '2026-09-02 08:05:05'),
(746, 59, 'SKILL', 'Inventory Control', '2026-09-02 08:05:05'),
(747, 59, 'SKILL', 'Guest Recovery', '2026-09-02 08:05:05'),
(748, 59, 'SKILL', 'Customer Service', '2026-09-02 08:05:05'),
(749, 59, 'SKILL', 'Guest Relations', '2026-09-02 08:05:05'),
(750, 59, 'SKILL', 'Inventory', '2026-09-02 08:05:05'),
(751, 59, 'CERTIFICATION', 'C E R T I F I C A T I O N S', '2026-09-02 08:05:05'),
(752, 59, 'CERTIFICATION', 'Spa Operations Certificate', '2026-09-02 08:05:05'),
(753, 59, 'CERTIFICATION', 'Association-Accredited Provider', '2026-09-02 08:05:05'),
(754, 59, 'CERTIFICATION', 'Wellness Service Coordination Workshop', '2026-09-02 08:05:05'),
(755, 59, 'CERTIFICATION', 'Cavite Wellness Training', '2026-09-02 08:05:05'),
(756, 59, 'CERTIFICATION', 'Resort Guest Relations Seminar', '2026-09-02 08:05:05'),
(757, 59, 'CERTIFICATION', 'Hospitality Training', '2026-09-02 08:05:05'),
(758, 59, 'CERTIFICATION', 'Recreation Safety Training', '2026-09-02 08:05:05'),
(759, 59, 'CERTIFICATION', 'Institute', '2026-09-02 08:05:05'),
(760, 59, 'CERTIFICATION', 'Resort Spa Operations Supervisor', '2026-09-02 08:05:05'),
(761, 59, 'ORGANIZATION', 'Lakeside Serenity Spa and Wellness Resort', '2026-09-02 08:05:05'),
(762, 59, 'ORGANIZATION', 'Palmera Cove Resort and Spa', '2026-09-02 08:05:05'),
(763, 59, 'ORGANIZATION', 'Altavista Resort and Wellness Retreat', '2026-09-02 08:05:05'),
(764, 59, 'ORGANIZATION', 'Wellness', '2026-09-02 08:05:05'),
(765, 59, 'EMAIL', 'camille.evangelista.spa@gmail.com', '2026-09-02 08:05:05'),
(766, 59, 'PHONE', '0995-318-2647', '2026-09-02 08:05:05');

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
) ENGINE=InnoDB AUTO_INCREMENT=157 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
(60, 31, 'Certifications', 10.00, '2026-08-23 17:50:39'),
(61, 32, 'Skills', 12.00, '2026-08-25 19:52:47'),
(62, 32, 'Experience', 30.00, '2026-08-25 19:52:47'),
(63, 32, 'Education', 10.00, '2026-08-25 19:52:47'),
(64, 32, 'Certifications', 10.00, '2026-08-25 19:52:47'),
(65, 33, 'Skills', 40.00, '2026-08-25 19:59:06'),
(66, 33, 'Experience', 30.00, '2026-08-25 19:59:06'),
(67, 33, 'Education', 20.00, '2026-08-25 19:59:06'),
(68, 33, 'Certifications', 10.00, '2026-08-25 19:59:06'),
(69, 34, 'Skills', 40.00, '2026-08-25 20:11:13'),
(70, 34, 'Experience', 30.00, '2026-08-25 20:11:13'),
(71, 34, 'Education', 20.00, '2026-08-25 20:11:13'),
(72, 34, 'Certifications', 10.00, '2026-08-25 20:11:13'),
(73, 35, 'Skills', 12.00, '2026-08-25 20:58:53'),
(74, 35, 'Experience', 30.00, '2026-08-25 20:58:53'),
(75, 35, 'Education', 20.00, '2026-08-25 20:58:53'),
(76, 35, 'Certifications', 10.00, '2026-08-25 20:58:53'),
(77, 36, 'Skills', 23.20, '2026-08-25 21:00:33'),
(78, 36, 'Experience', 30.00, '2026-08-25 21:00:33'),
(79, 36, 'Education', 20.00, '2026-08-25 21:00:33'),
(80, 36, 'Certifications', 10.00, '2026-08-25 21:00:33'),
(81, 37, 'Skills', 12.00, '2026-08-25 21:02:20'),
(82, 37, 'Experience', 30.00, '2026-08-25 21:02:20'),
(83, 37, 'Education', 20.00, '2026-08-25 21:02:20'),
(84, 37, 'Certifications', 10.00, '2026-08-25 21:02:20'),
(85, 38, 'Skills', 17.60, '2026-08-25 21:04:13'),
(86, 38, 'Experience', 30.00, '2026-08-25 21:04:13'),
(87, 38, 'Education', 20.00, '2026-08-25 21:04:13'),
(88, 38, 'Certifications', 10.00, '2026-08-25 21:04:13'),
(89, 39, 'Skills', 12.00, '2026-08-25 21:13:41'),
(90, 39, 'Experience', 30.00, '2026-08-25 21:13:41'),
(91, 39, 'Education', 10.00, '2026-08-25 21:13:41'),
(92, 39, 'Certifications', 10.00, '2026-08-25 21:13:41'),
(93, 40, 'Skills', 12.00, '2026-08-25 21:20:15'),
(94, 40, 'Experience', 30.00, '2026-08-25 21:20:15'),
(95, 40, 'Education', 10.00, '2026-08-25 21:20:15'),
(96, 40, 'Certifications', 10.00, '2026-08-25 21:20:15'),
(97, 41, 'Skills', 23.20, '2026-08-25 21:20:53'),
(98, 41, 'Experience', 30.00, '2026-08-25 21:20:53'),
(99, 41, 'Education', 20.00, '2026-08-25 21:20:53'),
(100, 41, 'Certifications', 10.00, '2026-08-25 21:20:53'),
(101, 42, 'Skills', 40.00, '2026-08-25 21:42:45'),
(102, 42, 'Experience', 30.00, '2026-08-25 21:42:45'),
(103, 42, 'Education', 20.00, '2026-08-25 21:42:45'),
(104, 42, 'Certifications', 10.00, '2026-08-25 21:42:45'),
(105, 43, 'Skills', 17.60, '2026-08-25 21:45:32'),
(106, 43, 'Experience', 30.00, '2026-08-25 21:45:32'),
(107, 43, 'Education', 0.00, '2026-08-25 21:45:32'),
(108, 43, 'Certifications', 10.00, '2026-08-25 21:45:32'),
(109, 44, 'Skills', 12.00, '2026-08-25 21:47:37'),
(110, 44, 'Experience', 30.00, '2026-08-25 21:47:37'),
(111, 44, 'Education', 20.00, '2026-08-25 21:47:37'),
(112, 44, 'Certifications', 10.00, '2026-08-25 21:47:37'),
(113, 45, 'Skills', 40.00, '2026-08-26 02:04:46'),
(114, 45, 'Experience', 30.00, '2026-08-26 02:04:46'),
(115, 45, 'Education', 20.00, '2026-08-26 02:04:46'),
(116, 45, 'Certifications', 10.00, '2026-08-26 02:04:46'),
(117, 46, 'Skills', 40.00, '2026-08-26 02:33:18'),
(118, 46, 'Experience', 30.00, '2026-08-26 02:33:18'),
(119, 46, 'Education', 20.00, '2026-08-26 02:33:18'),
(120, 46, 'Certifications', 10.00, '2026-08-26 02:33:18'),
(129, 53, 'Skills', 19.00, '2026-08-30 23:09:41'),
(130, 53, 'Experience', 30.00, '2026-08-30 23:09:41'),
(131, 53, 'Education', 20.00, '2026-08-30 23:09:41'),
(132, 53, 'Certifications', 10.00, '2026-08-30 23:09:41'),
(133, 54, 'Skills', 21.33, '2026-08-31 20:15:28'),
(134, 54, 'Experience', 30.00, '2026-08-31 20:15:28'),
(135, 54, 'Education', 20.00, '2026-08-31 20:15:28'),
(136, 54, 'Certifications', 10.00, '2026-08-31 20:15:28'),
(137, 55, 'Skills', 34.40, '2026-08-31 20:56:08'),
(138, 55, 'Experience', 30.00, '2026-08-31 20:56:08'),
(139, 55, 'Education', 20.00, '2026-08-31 20:56:08'),
(140, 55, 'Certifications', 5.00, '2026-08-31 20:56:08'),
(141, 56, 'Skills', 12.00, '2026-09-01 00:26:36'),
(142, 56, 'Experience', 30.00, '2026-09-01 00:26:36'),
(143, 56, 'Education', 20.00, '2026-09-01 00:26:36'),
(144, 56, 'Certifications', 10.00, '2026-09-01 00:26:36'),
(145, 57, 'Skills', 12.00, '2026-09-02 05:54:41'),
(146, 57, 'Experience', 30.00, '2026-09-02 05:54:41'),
(147, 57, 'Education', 20.00, '2026-09-02 05:54:41'),
(148, 57, 'Certifications', 10.00, '2026-09-02 05:54:41'),
(149, 58, 'Skills', 26.00, '2026-09-02 06:19:43'),
(150, 58, 'Experience', 30.00, '2026-09-02 06:19:43'),
(151, 58, 'Education', 20.00, '2026-09-02 06:19:43'),
(152, 58, 'Certifications', 10.00, '2026-09-02 06:19:43'),
(153, 59, 'Skills', 17.60, '2026-09-02 08:05:05'),
(154, 59, 'Experience', 30.00, '2026-09-02 08:05:05'),
(155, 59, 'Education', 20.00, '2026-09-02 08:05:05'),
(156, 59, 'Certifications', 10.00, '2026-09-02 08:05:05');

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
) ENGINE=InnoDB AUTO_INCREMENT=726 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
(164, 2, 'Admin', 'Administration / HR', '2026-08-24 05:27:27', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '16', 'Preview screening scored 94.4% with status PERFECT_FOR_THE_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/admin/applicants'),
(165, 4, 'Employee', 'Kitchen / Culinary', '2026-08-24 17:35:26', 'User logged in', 'Authentication', 'user', 'kdelacruz', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Unknown', 'http://127.0.0.1:8013/api/v1/auth/login'),
(166, 2, 'Admin', 'Administration / HR', '2026-08-24 17:35:31', 'OTP sent', 'Authentication', 'user', 'jdelacruz', 'One-time password emailed to j***********@oxfordsuites.com.ph', 'Info', '127.0.0.1', 'Unknown', 'http://127.0.0.1:8013/api/v1/auth/login'),
(167, 1, 'Super Admin', 'Administration / HR', '2026-08-24 17:35:37', 'OTP sent', 'Authentication', 'user', 'bullseur', 'One-time password emailed to b******@oxfordsuites.com.ph', 'Info', '127.0.0.1', 'Unknown', 'http://127.0.0.1:8013/api/v1/auth/login'),
(168, 4, 'Employee', 'Kitchen / Culinary', '2026-08-24 17:35:43', 'OTP sent', 'Authentication', 'user', 'kdelacruz', 'One-time password emailed to k************@oxfordsuites.com.ph', 'Info', '127.0.0.1', 'Unknown', 'http://127.0.0.1:8013/api/v1/auth/login'),
(169, 1, 'Super Admin', 'Administration / HR', '2026-08-24 17:57:41', 'OTP sent', 'Authentication', 'user', 'bullseur', 'One-time password emailed to b******@oxfordsuites.com.ph', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(170, 4, 'Employee', 'Kitchen / Culinary', '2026-08-24 17:57:49', 'User logged in', 'Authentication', 'user', 'kdelacruz', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(171, 4, 'Employee', 'Kitchen / Culinary', '2026-08-24 17:57:52', 'User logged out', 'Authentication', 'user', 'kdelacruz', 'Session token revoked.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/employee'),
(172, 4, 'Employee', 'Kitchen / Culinary', '2026-08-24 17:57:59', 'User logged in', 'Authentication', 'user', 'kdelacruz', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(173, 4, 'Employee', 'Kitchen / Culinary', '2026-08-24 17:58:23', 'User logged out', 'Authentication', 'user', 'kdelacruz', 'Session token revoked.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/employee/settings'),
(174, 4, 'Employee', 'Kitchen / Culinary', '2026-08-24 17:58:30', 'OTP sent', 'Authentication', 'user', 'kdelacruz', 'One-time password emailed to k************@oxfordsuites.com.ph', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(175, 4, 'Employee', 'Kitchen / Culinary', '2026-08-24 18:53:54', 'OTP sent', 'Authentication', 'user', 'kdelacruz', 'One-time password emailed to k************@oxfordsuites.com.ph', 'Info', '127.0.0.1', 'Unknown', 'http://127.0.0.1:8016/api/v1/auth/login'),
(176, 4, 'Employee', 'Kitchen / Culinary', '2026-08-24 18:53:55', 'User logged in', 'Authentication', 'user', 'kdelacruz', 'Two-factor login completed.', 'Info', '127.0.0.1', 'Unknown', 'http://127.0.0.1:8016/api/v1/auth/otp/verify'),
(177, 4, 'Employee', 'Kitchen / Culinary', '2026-08-24 18:53:57', 'User logged in', 'Authentication', 'user', 'kdelacruz', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Unknown', 'http://127.0.0.1:8016/api/v1/auth/login'),
(178, 6, 'Employee', 'Housekeeping', '2026-08-24 18:54:02', 'OTP sent', 'Authentication', 'user', 'raquino', 'One-time password emailed to r*********@oxfordsuites.com.ph', 'Info', '127.0.0.1', 'Unknown', 'http://127.0.0.1:8016/api/v1/auth/login'),
(179, 4, 'Employee', 'Kitchen / Culinary', '2026-08-24 18:54:07', 'OTP sent', 'Authentication', 'user', 'kdelacruz', 'One-time password emailed to k************@oxfordsuites.com.ph', 'Info', '127.0.0.1', 'Unknown', 'http://127.0.0.1:8016/api/v1/auth/login'),
(180, 4, 'Employee', 'Kitchen / Culinary', '2026-08-24 19:18:28', 'OTP sent', 'Authentication', 'user', 'kdelacruz', 'One-time password emailed to k************@oxfordsuites.com.ph', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(181, 4, 'Employee', 'Kitchen / Culinary', '2026-08-24 19:21:56', 'OTP sent', 'Authentication', 'user', 'kdelacruz', 'One-time password emailed to k************@oxfordsuites.com.ph', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(182, 4, 'Employee', 'Kitchen / Culinary', '2026-08-24 19:24:46', 'User logged in', 'Authentication', 'user', 'kdelacruz', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Unknown', 'http://127.0.0.1:8017/api/v1/auth/login');
INSERT INTO `audit_logs` (`audit_log_id`, `system_user_id`, `actor_role`, `actor_department`, `occurred_at`, `action`, `module_name`, `target_type`, `target_id`, `details`, `severity`, `ip_address`, `device_info`, `url`) VALUES
(183, 3, 'Admin', 'Front Office', '2026-08-24 19:24:47', 'User logged in', 'Authentication', 'user', 'aramos', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Unknown', 'http://127.0.0.1:8017/api/v1/auth/login'),
(184, 4, 'Employee', 'Kitchen / Culinary', '2026-08-24 19:25:56', 'User logged in', 'Authentication', 'user', 'kdelacruz', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(185, 4, 'Employee', 'Kitchen / Culinary', '2026-08-24 20:30:10', 'User logged in', 'Authentication', 'user', 'kdelacruz', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(186, 4, 'Employee', 'Kitchen / Culinary', '2026-08-24 20:30:12', 'User logged out', 'Authentication', 'user', 'kdelacruz', 'Session token revoked.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/employee'),
(187, 4, 'Employee', 'Kitchen / Culinary', '2026-08-24 20:30:23', 'User logged in', 'Authentication', 'user', 'kdelacruz', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(188, 4, 'Employee', 'Kitchen / Culinary', '2026-08-24 20:30:30', 'User logged out', 'Authentication', 'user', 'kdelacruz', 'Session token revoked.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/employee/settings'),
(189, 4, 'Employee', 'Kitchen / Culinary', '2026-08-24 20:30:37', 'OTP sent', 'Authentication', 'user', 'kdelacruz', 'One-time password emailed to k************@oxfordsuites.com.ph', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(190, 4, 'Employee', 'Kitchen / Culinary', '2026-08-24 20:32:46', 'User logged in', 'Authentication', 'user', 'kdelacruz', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(191, 4, 'Employee', 'Kitchen / Culinary', '2026-08-24 20:32:48', 'User logged out', 'Authentication', 'user', 'kdelacruz', 'Session token revoked.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/employee'),
(192, 3, 'Admin', 'Front Office', '2026-08-24 20:33:02', 'User logged in', 'Authentication', 'user', 'aramos', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(193, 3, 'Admin', 'Front Office', '2026-08-24 20:33:38', 'User logged out', 'Authentication', 'user', 'aramos', 'Session token revoked.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/admin'),
(194, 3, 'Admin', 'Front Office', '2026-08-24 20:33:50', 'OTP sent', 'Authentication', 'user', 'aramos', 'One-time password emailed to a*******@oxfordsuites.com.ph', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(195, 3, 'Admin', 'Front Office', '2026-08-24 20:34:07', 'User logged in', 'Authentication', 'user', 'aramos', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(196, 3, 'Admin', 'Front Office', '2026-08-24 20:43:42', 'User logged out', 'Authentication', 'user', 'aramos', 'Session token revoked.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/admin/settings'),
(197, 3, 'Admin', 'Front Office', '2026-08-24 20:43:45', 'Failed login attempt', 'Authentication', 'user', 'aramos', 'Invalid credentials supplied.', 'Warning', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(198, 3, 'Admin', 'Front Office', '2026-08-24 20:43:53', 'User logged in', 'Authentication', 'user', 'aramos', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(199, 3, 'Admin', 'Front Office', '2026-08-24 20:50:02', 'User logged out', 'Authentication', 'user', 'aramos', 'Session token revoked.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/admin/settings'),
(200, 4, 'Employee', 'Kitchen / Culinary', '2026-08-24 20:50:06', 'User logged in', 'Authentication', 'user', 'kdelacruz', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(201, 4, 'Employee', 'Kitchen / Culinary', '2026-08-25 02:27:48', 'User logged out', 'Authentication', 'user', 'kdelacruz', 'Session token revoked.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/employee/settings'),
(202, 4, 'Employee', 'Kitchen / Culinary', '2026-08-25 02:27:52', 'Failed login attempt', 'Authentication', 'user', 'kdelacruz', 'Invalid credentials supplied.', 'Warning', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(203, 4, 'Employee', 'Kitchen / Culinary', '2026-08-25 02:28:00', 'OTP sent', 'Authentication', 'user', 'kdelacruz', 'One-time password emailed to k************@oxfordsuites.com.ph', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(204, 4, 'Employee', 'Kitchen / Culinary', '2026-08-25 02:29:22', 'Failed login attempt', 'Authentication', 'user', 'kdelacruz', 'Invalid credentials supplied.', 'Warning', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(205, 4, 'Employee', 'Kitchen / Culinary', '2026-08-25 02:29:28', 'User logged in', 'Authentication', 'user', 'kdelacruz', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(206, 4, 'Employee', 'Kitchen / Culinary', '2026-08-25 02:29:59', 'User logged out', 'Authentication', 'user', 'kdelacruz', 'Session token revoked.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/employee/settings'),
(207, 4, 'Employee', 'Kitchen / Culinary', '2026-08-25 02:30:03', 'User logged in', 'Authentication', 'user', 'kdelacruz', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(208, 4, 'Employee', 'Kitchen / Culinary', '2026-08-25 02:30:05', 'User logged out', 'Authentication', 'user', 'kdelacruz', 'Session token revoked.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/employee'),
(209, 3, 'Admin', 'Front Office', '2026-08-25 02:30:15', 'Failed login attempt', 'Authentication', 'user', 'aramos', 'Invalid credentials supplied.', 'Warning', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(210, 3, 'Admin', 'Front Office', '2026-08-25 02:30:22', 'Failed login attempt', 'Authentication', 'user', 'aramos', 'Invalid credentials supplied.', 'Warning', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(211, 3, 'Admin', 'Front Office', '2026-08-25 02:30:26', 'User logged in', 'Authentication', 'user', 'aramos', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(212, 3, 'Admin', 'Front Office', '2026-08-25 02:31:09', 'User logged out', 'Authentication', 'user', 'aramos', 'Session token revoked.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/admin/settings'),
(213, 3, 'Admin', 'Front Office', '2026-08-25 02:31:15', 'User logged in', 'Authentication', 'user', 'aramos', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(214, 3, 'Admin', 'Front Office', '2026-08-25 02:31:17', 'User logged out', 'Authentication', 'user', 'aramos', 'Session token revoked.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/admin'),
(215, 6, 'Employee', 'Housekeeping', '2026-08-25 02:35:40', 'OTP sent', 'Authentication', 'user', 'raquino', 'One-time password emailed to r*********@oxfordsuites.com.ph', 'Info', '127.0.0.1', 'Unknown', 'http://127.0.0.1:8018/api/v1/auth/login'),
(216, 6, 'Employee', 'Housekeeping', '2026-08-25 02:49:37', 'OTP sent', 'Authentication', 'user', 'raquino', 'One-time password emailed to r*********@oxfordsuites.com.ph', 'Info', '127.0.0.1', 'Unknown', 'http://127.0.0.1:8019/api/v1/auth/login'),
(217, 4, 'Employee', 'Kitchen / Culinary', '2026-08-25 02:57:22', 'User logged in', 'Authentication', 'user', 'kdelacruz', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(218, 4, 'Employee', 'Kitchen / Culinary', '2026-08-25 03:01:06', 'User logged out', 'Authentication', 'user', 'kdelacruz', 'Session token revoked.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/employee/onboarding'),
(219, 1, 'Super Admin', 'Administration / HR', '2026-08-25 03:01:16', 'OTP sent', 'Authentication', 'user', 'bullseur', 'One-time password emailed to b******@oxfordsuites.com.ph', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(220, 1, 'Super Admin', 'Administration / HR', '2026-08-25 03:01:58', 'User logged in', 'Authentication', 'user', 'bullseur', 'Two-factor login completed.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/otp'),
(221, 3, 'Admin', 'Front Office', '2026-08-25 03:09:22', 'User logged in', 'Authentication', 'user', 'aramos', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(222, 3, 'Admin', 'Front Office', '2026-08-25 03:11:56', 'User logged out', 'Authentication', 'user', 'aramos', 'Session token revoked.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/admin/applicants'),
(223, 4, 'Employee', 'Kitchen / Culinary', '2026-08-25 03:12:01', 'User logged in', 'Authentication', 'user', 'kdelacruz', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(224, 4, 'Employee', 'Kitchen / Culinary', '2026-08-25 04:24:38', 'User logged in', 'Authentication', 'user', 'kdelacruz', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(225, 1, 'Super Admin', 'Administration / HR', '2026-08-25 06:04:34', 'OTP sent', 'Authentication', 'user', 'bullseur', 'One-time password emailed to b******@oxfordsuites.com.ph', 'Info', '127.0.0.1', 'Unknown', 'http://127.0.0.1:8000/api/v1/auth/login'),
(226, 1, 'Super Admin', 'Administration / HR', '2026-08-25 06:04:35', 'User logged in', 'Authentication', 'user', 'bullseur', 'Two-factor login completed.', 'Info', '127.0.0.1', 'Unknown', 'http://127.0.0.1:8000/api/v1/auth/otp/verify'),
(227, 1, 'Super Admin', 'Administration / HR', '2026-08-25 06:31:26', 'OTP sent', 'Authentication', 'user', 'bullseur', 'One-time password emailed to b******@oxfordsuites.com.ph', 'Info', '127.0.0.1', 'Unknown', 'http://127.0.0.1:8000/api/v1/auth/login'),
(228, 1, 'Super Admin', 'Administration / HR', '2026-08-25 06:31:29', 'User logged in', 'Authentication', 'user', 'bullseur', 'Two-factor login completed.', 'Info', '127.0.0.1', 'Unknown', 'http://127.0.0.1:8000/api/v1/auth/otp/verify'),
(229, 3, 'Admin', 'Front Office', '2026-08-25 11:45:39', 'User logged in', 'Authentication', 'user', 'aramos', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(230, 3, 'Admin', 'Front Office', '2026-08-25 11:51:46', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '16', 'Preview screening scored 62% with status NOT_FITTED_TO_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/admin/applicants'),
(231, 3, 'Admin', 'Front Office', '2026-08-25 11:52:47', 'Applicant Screened', 'Applicant Management', 'Applicant', '32', 'spaCy screening for Lorenzo Miguel Santiago: Not Fitted to Job (62.00%), processing status PARTIALLY_PROCESSED.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/admin/applicants'),
(232, 3, 'Admin', 'Front Office', '2026-08-25 11:52:47', 'Applicant Created', 'Applicant Management', 'Applicant', '32', 'Added new applicant Lorenzo Miguel Santiago for position ID 16.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/admin/applicants'),
(233, 3, 'Admin', 'Front Office', '2026-08-25 11:58:08', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '16', 'Preview screening scored 100% with status PERFECT_FOR_THE_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/admin/applicants'),
(234, 3, 'Admin', 'Front Office', '2026-08-25 11:59:06', 'Applicant Screened', 'Applicant Management', 'Applicant', '33', 'spaCy screening for ALYSSA MARIE: Perfect for the Job (100.00%), processing status PARTIALLY_PROCESSED.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/admin/applicants'),
(235, 3, 'Admin', 'Front Office', '2026-08-25 11:59:06', 'Applicant Created', 'Applicant Management', 'Applicant', '33', 'Added new applicant ALYSSA MARIE for position ID 16.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/admin/applicants'),
(236, 3, 'Admin', 'Front Office', '2026-08-25 12:04:47', 'Applicant Referred to New Position', 'Applicant Management', 'Applicant', '32', 'Referred Lorenzo Miguel Santiago to new position Restaurant Server.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/admin/applicants'),
(237, 3, 'Admin', 'Front Office', '2026-08-25 12:04:56', 'Applicant Referred to New Position', 'Applicant Management', 'Applicant', '32', 'Referred Lorenzo Miguel Santiago to new position Bartender.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/admin/applicants'),
(238, 3, 'Admin', 'Front Office', '2026-08-25 12:05:03', 'Applicant Referred to New Position', 'Applicant Management', 'Applicant', '32', 'Referred Lorenzo Miguel Santiago to new position Line Cook.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/admin/applicants'),
(239, 3, 'Admin', 'Front Office', '2026-08-25 12:05:10', 'Applicant Referred to New Position', 'Applicant Management', 'Applicant', '32', 'Referred Lorenzo Miguel Santiago to new position HR Assistant.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/admin/applicants'),
(240, 3, 'Admin', 'Front Office', '2026-08-25 12:07:26', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '16', 'Preview screening scored 100% with status PERFECT_FOR_THE_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/admin/applicants'),
(241, 3, 'Admin', 'Front Office', '2026-08-25 12:07:46', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '16', 'Preview screening scored 100% with status PERFECT_FOR_THE_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/admin/applicants'),
(242, 3, 'Admin', 'Front Office', '2026-08-25 12:11:05', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '16', 'Preview screening scored 100% with status PERFECT_FOR_THE_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/admin/applicants'),
(243, 3, 'Admin', 'Front Office', '2026-08-25 12:11:13', 'Applicant Screened', 'Applicant Management', 'Applicant', '34', 'spaCy screening for MARIA ANGELA SANTOS: Perfect for the Job (100.00%), processing status PARTIALLY_PROCESSED.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/admin/applicants'),
(244, 3, 'Admin', 'Front Office', '2026-08-25 12:11:13', 'Applicant Created', 'Applicant Management', 'Applicant', '34', 'Added new applicant MARIA ANGELA SANTOS for position ID 16.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/admin/applicants'),
(245, 3, 'Admin', 'Front Office', '2026-08-25 12:11:36', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '16', 'Preview screening scored 100% with status PERFECT_FOR_THE_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/admin/applicants'),
(246, 3, 'Admin', 'Front Office', '2026-08-25 12:58:45', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '16', 'Preview screening scored 72% with status NOT_FITTED_TO_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/admin/applicants'),
(247, 3, 'Admin', 'Front Office', '2026-08-25 12:58:53', 'Applicant Screened', 'Applicant Management', 'Applicant', '35', 'spaCy screening for Marielle Anne Santos: Not Fitted to Job (72.00%), processing status PARTIALLY_PROCESSED.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/admin/applicants'),
(248, 3, 'Admin', 'Front Office', '2026-08-25 12:58:53', 'Applicant Created', 'Applicant Management', 'Applicant', '35', 'Added new applicant Marielle Anne Santos for position ID 16.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/admin/applicants'),
(249, 3, 'Admin', 'Front Office', '2026-08-25 12:59:48', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '16', 'Preview screening scored 83.2% with status FIT_FOR_OTHER_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/admin/applicants'),
(250, 3, 'Admin', 'Front Office', '2026-08-25 12:59:59', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '16', 'Preview screening scored 83.2% with status FIT_FOR_OTHER_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/admin/applicants'),
(251, 3, 'Admin', 'Front Office', '2026-08-25 13:00:33', 'Applicant Screened', 'Applicant Management', 'Applicant', '36', 'spaCy screening for NICOLE FRANCES HERRERA: Fit for Other Job (83.20%), processing status PARTIALLY_PROCESSED.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/admin/applicants'),
(252, 3, 'Admin', 'Front Office', '2026-08-25 13:00:33', 'Applicant Created', 'Applicant Management', 'Applicant', '36', 'Added new applicant NICOLE FRANCES HERRERA for position ID 16.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/admin/applicants'),
(253, 3, 'Admin', 'Front Office', '2026-08-25 13:00:40', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '16', 'Preview screening scored 83.2% with status FIT_FOR_OTHER_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/admin/applicants'),
(254, 3, 'Admin', 'Front Office', '2026-08-25 13:02:12', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '16', 'Preview screening scored 72% with status NOT_FITTED_TO_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/admin/applicants'),
(255, 3, 'Admin', 'Front Office', '2026-08-25 13:02:20', 'Applicant Screened', 'Applicant Management', 'Applicant', '37', 'spaCy screening for PATRICIA ANNE MENDOZA: Not Fitted to Job (72.00%), processing status PARTIALLY_PROCESSED.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/admin/applicants'),
(256, 3, 'Admin', 'Front Office', '2026-08-25 13:02:20', 'Applicant Created', 'Applicant Management', 'Applicant', '37', 'Added new applicant PATRICIA ANNE MENDOZA for position ID 16.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/admin/applicants'),
(257, 3, 'Admin', 'Front Office', '2026-08-25 13:02:37', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '16', 'Preview screening scored 72% with status NOT_FITTED_TO_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/admin/applicants'),
(258, 3, 'Admin', 'Front Office', '2026-08-25 13:03:51', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '16', 'Preview screening scored 77.6% with status NOT_FITTED_TO_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/admin/applicants'),
(259, 3, 'Admin', 'Front Office', '2026-08-25 13:04:13', 'Applicant Screened', 'Applicant Management', 'Applicant', '38', 'spaCy screening for RAFAEL DOMINIC LIM: Not Fitted to Job (77.60%), processing status PARTIALLY_PROCESSED.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/admin/applicants'),
(260, 3, 'Admin', 'Front Office', '2026-08-25 13:04:13', 'Applicant Created', 'Applicant Management', 'Applicant', '38', 'Added new applicant RAFAEL DOMINIC LIM for position ID 16.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/admin/applicants'),
(261, 3, 'Admin', 'Front Office', '2026-08-25 13:04:31', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '16', 'Preview screening scored 77.6% with status NOT_FITTED_TO_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/admin/applicants'),
(262, 3, 'Admin', 'Front Office', '2026-08-25 13:10:26', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '16', 'Preview screening scored 77.6% with status NOT_FITTED_TO_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/admin/applicants'),
(263, 3, 'Admin', 'Front Office', '2026-08-25 13:10:35', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '16', 'Preview screening scored 77.6% with status NOT_FITTED_TO_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/admin/applicants'),
(264, 3, 'Admin', 'Front Office', '2026-08-25 13:10:43', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '16', 'Preview screening scored 77.6% with status NOT_FITTED_TO_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/admin/applicants'),
(265, 3, 'Admin', 'Front Office', '2026-08-25 13:13:35', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '16', 'Preview screening scored 62% with status NOT_FITTED_TO_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/admin/applicants'),
(266, 3, 'Admin', 'Front Office', '2026-08-25 13:13:41', 'Applicant Screened', 'Applicant Management', 'Applicant', '39', 'spaCy screening for Roberto James Castillo: Not Fitted to Job (62.00%), processing status PARTIALLY_PROCESSED.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/admin/applicants'),
(267, 3, 'Admin', 'Front Office', '2026-08-25 13:13:41', 'Applicant Created', 'Applicant Management', 'Applicant', '39', 'Added new applicant Roberto James Castillo for position ID 16.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/admin/applicants'),
(268, 3, 'Admin', 'Front Office', '2026-08-25 13:18:27', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '16', 'Preview screening scored 62% with status NOT_FITTED_TO_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/admin/applicants'),
(269, 3, 'Admin', 'Front Office', '2026-08-25 13:20:15', 'Applicant Screened', 'Applicant Management', 'Applicant', '40', 'spaCy screening for Roberto James Castillo: Not Fitted to Job (62.00%), processing status PARTIALLY_PROCESSED.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/admin/applicants'),
(270, 3, 'Admin', 'Front Office', '2026-08-25 13:20:15', 'Applicant Created', 'Applicant Management', 'Applicant', '40', 'Added new applicant Roberto James Castillo for position ID 16.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/admin/applicants'),
(271, 3, 'Admin', 'Front Office', '2026-08-25 13:20:44', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '16', 'Preview screening scored 83.2% with status NOT_FITTED_TO_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/admin/applicants'),
(272, 3, 'Admin', 'Front Office', '2026-08-25 13:20:53', 'Applicant Screened', 'Applicant Management', 'Applicant', '41', 'spaCy screening for Samantha Nicole Dela Cruz: Not Fitted to Job (83.20%), processing status PARTIALLY_PROCESSED.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/admin/applicants'),
(273, 3, 'Admin', 'Front Office', '2026-08-25 13:20:53', 'Applicant Created', 'Applicant Management', 'Applicant', '41', 'Added new applicant Samantha Nicole Dela Cruz for position ID 16.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/admin/applicants'),
(274, 3, 'Admin', 'Front Office', '2026-08-25 13:40:55', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '16', 'Preview screening scored 77.6% with status FIT_FOR_OTHER_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/admin/applicants'),
(275, 3, 'Admin', 'Front Office', '2026-08-25 13:42:31', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '16', 'Preview screening scored 100% with status PERFECT_FOR_THE_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/admin/applicants'),
(276, 3, 'Admin', 'Front Office', '2026-08-25 13:42:45', 'Applicant Screened', 'Applicant Management', 'Applicant', '42', 'spaCy screening for Vincent Paul Soriano: Perfect for the Job (100.00%), processing status PARTIALLY_PROCESSED.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/admin/applicants'),
(277, 3, 'Admin', 'Front Office', '2026-08-25 13:42:45', 'Applicant Created', 'Applicant Management', 'Applicant', '42', 'Added new applicant Vincent Paul Soriano for position ID 16.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/admin/applicants'),
(278, 3, 'Admin', 'Front Office', '2026-08-25 13:44:57', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '16', 'Preview screening scored 57.6% with status NOT_FITTED_TO_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/admin/applicants'),
(279, 3, 'Admin', 'Front Office', '2026-08-25 13:45:32', 'Applicant Screened', 'Applicant Management', 'Applicant', '43', 'spaCy screening for ANGELA MARIE CRUZ: Not Fitted to Job (57.60%), processing status PARTIALLY_PROCESSED.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/admin/applicants'),
(280, 3, 'Admin', 'Front Office', '2026-08-25 13:45:32', 'Applicant Created', 'Applicant Management', 'Applicant', '43', 'Added new applicant ANGELA MARIE CRUZ for position ID 16.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/admin/applicants'),
(281, 3, 'Admin', 'Front Office', '2026-08-25 13:47:07', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '16', 'Preview screening scored 72% with status NOT_FITTED_TO_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/admin/applicants'),
(282, 3, 'Admin', 'Front Office', '2026-08-25 13:47:37', 'Applicant Screened', 'Applicant Management', 'Applicant', '44', 'spaCy screening for Bianca Louise Garcia: Not Fitted to Job (72.00%), processing status PARTIALLY_PROCESSED.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/admin/applicants'),
(283, 3, 'Admin', 'Front Office', '2026-08-25 13:47:37', 'Applicant Created', 'Applicant Management', 'Applicant', '44', 'Added new applicant Bianca Louise Garcia for position ID 16.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/admin/applicants'),
(284, 3, 'Admin', 'Front Office', '2026-08-25 13:57:05', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '16', 'Preview screening scored 72% with status NOT_FITTED_TO_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/admin/applicants'),
(285, 3, 'Admin', 'Front Office', '2026-08-25 14:05:31', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '16', 'Preview screening scored 63.2% with status NOT_FITTED_TO_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/admin/applicants'),
(286, 3, 'Admin', 'Front Office', '2026-08-25 14:06:03', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '16', 'Preview screening scored 63.2% with status NOT_FITTED_TO_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/admin/applicants'),
(287, 3, 'Admin', 'Front Office', '2026-08-25 14:20:10', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '16', 'Preview screening scored 94.4% with status PERFECT_FOR_THE_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/admin/applicants'),
(288, 3, 'Admin', 'Front Office', '2026-08-25 14:44:00', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '16', 'Preview screening scored 83.2% with status NOT_FITTED_TO_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/admin/applicants'),
(289, 3, 'Admin', 'Front Office', '2026-08-25 14:46:02', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '16', 'Preview screening scored 83.2% with status NOT_FITTED_TO_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/admin/applicants'),
(290, 1, 'Super Admin', 'Administration / HR', '2026-08-25 15:24:55', 'OTP sent', 'Authentication', 'user', 'bullseur', 'One-time password emailed to b******@oxfordsuites.com.ph', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(291, 3, 'Admin', 'Front Office', '2026-08-25 15:25:07', 'User logged in', 'Authentication', 'user', 'aramos', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(292, 3, 'Admin', 'Front Office', '2026-08-25 15:32:12', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '16', 'Preview screening scored 77.6% with status NOT_FITTED_TO_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/admin/applicants'),
(293, 3, 'Admin', 'Front Office', '2026-08-25 16:37:02', 'User logged in', 'Authentication', 'user', 'aramos', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(294, 3, 'Admin', 'Front Office', '2026-08-25 18:04:33', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '16', 'Preview screening scored 100% with status PERFECT_FOR_THE_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/admin/applicants'),
(295, 3, 'Admin', 'Front Office', '2026-08-25 18:04:46', 'Applicant Screened', 'Applicant Management', 'Applicant', '45', 'spaCy screening for ALYSSA MARIE: Perfect for the Job (100.00%), processing status PARTIALLY_PROCESSED.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/admin/applicants'),
(296, 3, 'Admin', 'Front Office', '2026-08-25 18:04:46', 'Applicant Created', 'Applicant Management', 'Applicant', '45', 'Added new applicant ALYSSA MARIE for position ID 16.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/admin/applicants'),
(297, 1, 'Super Admin', 'Administration / HR', '2026-08-25 18:25:05', 'Interview Scheduled', 'Applicant Management', 'Applicant', '45', 'Virtual interview scheduled for ALYSSA MARIE on 2026-08-27 at 10:00 AM with HR Team', 'Info', '127.0.0.1', 'Unknown', 'http://localhost'),
(298, 3, 'Admin', 'Front Office', '2026-08-25 18:32:52', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '16', 'Preview screening scored 100% with status PERFECT_FOR_THE_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/admin/applicants'),
(299, 3, 'Admin', 'Front Office', '2026-08-25 18:33:18', 'Applicant Screened', 'Applicant Management', 'Applicant', '46', 'spaCy screening for Vincent Paul Soriano: Perfect for the Job (100.00%), processing status PARTIALLY_PROCESSED.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/admin/applicants'),
(300, 3, 'Admin', 'Front Office', '2026-08-25 18:33:18', 'Applicant Created', 'Applicant Management', 'Applicant', '46', 'Added new applicant Vincent Paul Soriano for position ID 16.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/admin/applicants'),
(301, 3, 'Admin', 'Front Office', '2026-08-26 01:32:38', 'User logged in', 'Authentication', 'user', 'aramos', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(302, 1, 'Super Admin', 'Administration / HR', '2026-08-26 01:32:59', 'OTP sent', 'Authentication', 'user', 'bullseur', 'One-time password emailed to b******@oxfordsuites.com.ph', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(303, 1, 'Super Admin', 'Administration / HR', '2026-08-26 01:33:23', 'User logged in', 'Authentication', 'user', 'bullseur', 'Two-factor login completed.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/otp'),
(304, 4, 'Employee', 'Kitchen / Culinary', '2026-08-26 01:33:44', 'User logged in', 'Authentication', 'user', 'kdelacruz', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(305, 1, 'Super Admin', 'Administration / HR', '2026-08-26 01:34:50', 'OTP sent', 'Authentication', 'user', 'bullseur', 'One-time password emailed to b******@oxfordsuites.com.ph', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(306, 1, 'Super Admin', 'Administration / HR', '2026-08-26 01:35:02', 'User logged in', 'Authentication', 'user', 'bullseur', 'Two-factor login completed.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/otp'),
(307, 4, 'Employee', 'Kitchen / Culinary', '2026-08-26 01:35:36', 'User logged in', 'Authentication', 'user', 'kdelacruz', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(308, 4, 'Employee', 'Kitchen / Culinary', '2026-08-26 02:03:01', 'User logged out', 'Authentication', 'user', 'kdelacruz', 'Session token revoked.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/employee/settings'),
(309, 1, 'Super Admin', 'Administration / HR', '2026-08-26 02:03:12', 'OTP sent', 'Authentication', 'user', 'bullseur', 'One-time password emailed to b******@oxfordsuites.com.ph', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(310, 1, 'Super Admin', 'Administration / HR', '2026-08-26 02:03:23', 'User logged in', 'Authentication', 'user', 'bullseur', 'Two-factor login completed.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/otp'),
(311, 3, 'Admin', 'Front Office', '2026-08-26 02:03:59', 'User logged in', 'Authentication', 'user', 'aramos', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(312, 2, 'Admin', 'Administration / HR', '2026-08-26 02:44:40', 'OTP sent', 'Authentication', 'user', 'jdelacruz', 'One-time password emailed to j***********@oxfordsuites.com.ph', 'Info', '127.0.0.1', 'Unknown', 'http://127.0.0.1:8000/api/v1/auth/login'),
(313, 2, 'Admin', 'Administration / HR', '2026-08-26 02:44:48', 'User logged in', 'Authentication', 'user', 'jdelacruz', 'Two-factor login completed.', 'Info', '127.0.0.1', 'Unknown', 'http://127.0.0.1:8000/api/v1/auth/otp/verify'),
(314, 2, 'Admin', 'Administration / HR', '2026-08-26 02:45:05', 'OTP sent', 'Authentication', 'user', 'jdelacruz', 'One-time password emailed to j***********@oxfordsuites.com.ph', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(315, 3, 'Admin', 'Front Office', '2026-08-26 02:54:01', 'User logged in', 'Authentication', 'user', 'aramos', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(316, 1, 'Super Admin', 'Administration / HR', '2026-08-26 02:58:25', 'OTP sent', 'Authentication', 'user', 'bullseur', 'One-time password emailed to b******@oxfordsuites.com.ph', 'Info', '127.0.0.1', 'Unknown', 'http://127.0.0.1:8000/api/v1/auth/login'),
(317, 1, 'Super Admin', 'Administration / HR', '2026-08-26 02:58:33', 'User logged in', 'Authentication', 'user', 'bullseur', 'Two-factor login completed.', 'Info', '127.0.0.1', 'Unknown', 'http://127.0.0.1:8000/api/v1/auth/otp/verify'),
(318, 2, 'Admin', 'Administration / HR', '2026-08-26 03:03:46', 'User logged out', 'Authentication', 'user', 'jdelacruz', 'Session token revoked.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/admin/applicants'),
(319, 3, 'Admin', 'Front Office', '2026-08-26 03:04:12', 'User logged in', 'Authentication', 'user', 'aramos', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(320, 3, 'Admin', 'Front Office', '2026-08-26 03:04:29', 'User logged out', 'Authentication', 'user', 'aramos', 'Session token revoked.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/admin/profile'),
(321, 4, 'Employee', 'Kitchen / Culinary', '2026-08-26 03:04:58', 'User logged in', 'Authentication', 'user', 'kdelacruz', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(322, 4, 'Employee', 'Kitchen / Culinary', '2026-08-26 03:06:03', 'User logged out', 'Authentication', 'user', 'kdelacruz', 'Session token revoked.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/employee/ess'),
(323, 3, 'Admin', 'Front Office', '2026-08-26 03:06:08', 'User logged in', 'Authentication', 'user', 'aramos', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(324, 3, 'Admin', 'Front Office', '2026-08-26 03:06:11', 'User logged out', 'Authentication', 'user', 'aramos', 'Session token revoked.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/admin/profile'),
(325, 4, 'Employee', 'Kitchen / Culinary', '2026-08-26 03:06:14', 'User logged in', 'Authentication', 'user', 'kdelacruz', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(326, 4, 'Employee', 'Kitchen / Culinary', '2026-08-26 03:09:15', 'User logged out', 'Authentication', 'user', 'kdelacruz', 'Session token revoked.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/employee/ess?category=Recognition'),
(327, 3, 'Admin', 'Front Office', '2026-08-26 03:27:22', 'User logged in', 'Authentication', 'user', 'aramos', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(328, 3, 'Admin', 'Front Office', '2026-08-26 04:22:31', 'User logged out', 'Authentication', 'user', 'aramos', 'Session token revoked.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/admin/recruitment'),
(329, 4, 'Employee', 'Kitchen / Culinary', '2026-08-26 04:22:36', 'User logged in', 'Authentication', 'user', 'kdelacruz', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(330, 4, 'Employee', 'Kitchen / Culinary', '2026-08-26 04:23:24', 'User logged out', 'Authentication', 'user', 'kdelacruz', 'Session token revoked.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/employee/ess?category=Performance'),
(331, 3, 'Admin', 'Front Office', '2026-08-26 04:23:32', 'User logged in', 'Authentication', 'user', 'aramos', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(332, 3, 'Admin', 'Front Office', '2026-08-26 04:31:16', 'User logged out', 'Authentication', 'user', 'aramos', 'Session token revoked.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/admin/dept-pos'),
(333, 4, 'Employee', 'Kitchen / Culinary', '2026-08-26 04:31:21', 'User logged in', 'Authentication', 'user', 'kdelacruz', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(334, 4, 'Employee', 'Kitchen / Culinary', '2026-08-26 04:31:31', 'User logged in', 'Authentication', 'user', 'kdelacruz', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(335, 4, 'Employee', 'Kitchen / Culinary', '2026-08-26 04:31:39', 'User logged out', 'Authentication', 'user', 'kdelacruz', 'Session token revoked.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/employee'),
(336, 3, 'Admin', 'Front Office', '2026-08-26 04:33:58', 'User logged in', 'Authentication', 'user', 'aramos', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(337, 3, 'Admin', 'Front Office', '2026-08-26 04:43:44', 'User logged out', 'Authentication', 'user', 'aramos', 'Session token revoked.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/admin/employees'),
(338, 1, 'Super Admin', 'Administration / HR', '2026-08-26 04:46:16', 'OTP sent', 'Authentication', 'user', 'bullseur', 'One-time password emailed to b******@oxfordsuites.com.ph', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(339, 4, 'Employee', 'Kitchen / Culinary', '2026-08-26 04:48:09', 'User logged in', 'Authentication', 'user', 'kdelacruz', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(340, 4, 'Employee', 'Kitchen / Culinary', '2026-08-26 04:48:44', 'User logged out', 'Authentication', 'user', 'kdelacruz', 'Session token revoked.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/employee'),
(341, 3, 'Admin', 'Front Office', '2026-08-26 04:48:55', 'User logged in', 'Authentication', 'user', 'aramos', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(342, 4, 'Employee', 'Kitchen / Culinary', '2026-08-26 05:08:35', 'User logged in', 'Authentication', 'user', 'kdelacruz', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(343, 4, 'Employee', 'Kitchen / Culinary', '2026-08-26 05:13:04', 'User logged out', 'Authentication', 'user', 'kdelacruz', 'Session token revoked.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/employee/ess'),
(344, 4, 'Employee', 'Kitchen / Culinary', '2026-08-26 05:13:10', 'User logged in', 'Authentication', 'user', 'kdelacruz', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(345, 4, 'Employee', 'Kitchen / Culinary', '2026-08-26 05:13:18', 'User logged out', 'Authentication', 'user', 'kdelacruz', 'Session token revoked.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/employee'),
(346, 3, 'Admin', 'Front Office', '2026-08-26 05:13:24', 'User logged in', 'Authentication', 'user', 'aramos', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(347, 3, 'Admin', 'Front Office', '2026-08-26 05:13:34', 'User logged in', 'Authentication', 'user', 'aramos', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(348, 3, 'Admin', 'Front Office', '2026-08-26 05:18:20', 'User logged out', 'Authentication', 'user', 'aramos', 'Session token revoked.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/admin/employees'),
(349, 1, 'Super Admin', 'Administration / HR', '2026-08-26 05:18:29', 'OTP sent', 'Authentication', 'user', 'bullseur', 'One-time password emailed to b******@oxfordsuites.com.ph', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(350, 1, 'Super Admin', 'Administration / HR', '2026-08-26 05:18:59', 'User logged in', 'Authentication', 'user', 'bullseur', 'Two-factor login completed.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/otp'),
(351, 3, 'Admin', 'Front Office', '2026-08-26 05:24:32', 'User logged in', 'Authentication', 'user', 'aramos', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(352, 3, 'Admin', 'Front Office', '2026-08-26 06:20:55', 'User logged in', 'Authentication', 'user', 'aramos', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(353, 3, 'Admin', 'Front Office', '2026-08-26 06:43:28', 'User logged in', 'Authentication', 'user', 'aramos', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(354, 3, 'Admin', 'Front Office', '2026-08-26 07:07:54', 'User logged in', 'Authentication', 'user', 'aramos', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(355, 3, 'Admin', 'Front Office', '2026-08-26 07:34:39', 'User logged in', 'Authentication', 'user', 'aramos', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(356, 3, 'Admin', 'Front Office', '2026-08-26 07:38:54', 'User logged in', 'Authentication', 'user', 'aramos', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(357, 4, 'Employee', 'Kitchen / Culinary', '2026-08-26 07:39:09', 'User logged in', 'Authentication', 'user', 'kdelacruz', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(358, 4, 'Employee', 'Kitchen / Culinary', '2026-08-26 07:40:51', 'User logged out', 'Authentication', 'user', 'kdelacruz', 'Session token revoked.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/employee'),
(359, 1, 'Super Admin', 'Administration / HR', '2026-08-26 07:41:06', 'OTP sent', 'Authentication', 'user', 'bullseur', 'One-time password emailed to b******@oxfordsuites.com.ph', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(360, 3, 'Admin', 'Front Office', '2026-08-26 07:41:12', 'User logged in', 'Authentication', 'user', 'aramos', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(361, 3, 'Admin', 'Front Office', '2026-08-26 07:50:48', 'User logged out', 'Authentication', 'user', 'aramos', 'Session token revoked.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/admin/ess'),
(362, 4, 'Employee', 'Kitchen / Culinary', '2026-08-26 07:50:53', 'User logged in', 'Authentication', 'user', 'kdelacruz', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(363, 4, 'Employee', 'Kitchen / Culinary', '2026-08-26 07:51:27', 'User logged out', 'Authentication', 'user', 'kdelacruz', 'Session token revoked.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/employee/ess?category=Performance'),
(364, 3, 'Admin', 'Front Office', '2026-08-26 07:51:35', 'User logged in', 'Authentication', 'user', 'aramos', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(365, 3, 'Admin', 'Front Office', '2026-08-26 08:06:19', 'User logged out', 'Authentication', 'user', 'aramos', 'Session token revoked.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/admin/applicants'),
(366, 3, 'Admin', 'Front Office', '2026-08-26 08:19:12', 'User logged in', 'Authentication', 'user', 'aramos', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:8080/login'),
(367, 3, 'Admin', 'Front Office', '2026-08-26 08:24:58', 'Failed login attempt', 'Authentication', 'user', 'aramos', 'Invalid credentials supplied.', 'Warning', '127.0.0.1', 'Chrome', 'http://localhost:5173/login'),
(368, 3, 'Admin', 'Front Office', '2026-08-26 08:25:03', 'Failed login attempt', 'Authentication', 'user', 'aramos', 'Invalid credentials supplied.', 'Warning', '127.0.0.1', 'Chrome', 'http://localhost:5173/login'),
(369, 3, 'Admin', 'Front Office', '2026-08-26 08:25:12', 'Failed login attempt', 'Authentication', 'user', 'aramos', 'Invalid credentials supplied.', 'Warning', '127.0.0.1', 'Chrome', 'http://localhost:5173/login'),
(370, 3, 'Admin', 'Front Office', '2026-08-26 08:25:17', 'User logged in', 'Authentication', 'user', 'aramos', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/login'),
(371, 3, 'Admin', 'Front Office', '2026-08-26 08:26:27', 'User logged out', 'Authentication', 'user', 'aramos', 'Session token revoked.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/onboarding'),
(372, 1, 'Super Admin', 'Administration / HR', '2026-08-26 08:27:15', 'Failed login attempt', 'Authentication', 'user', 'bullseur', 'Invalid credentials supplied.', 'Warning', '127.0.0.1', 'Chrome', 'http://localhost:5173/login'),
(373, 4, 'Employee', 'Kitchen / Culinary', '2026-08-29 12:07:02', 'User logged in', 'Authentication', 'user', 'kdelacruz', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/login'),
(374, 4, 'Employee', 'Kitchen / Culinary', '2026-08-29 12:07:09', 'User logged out', 'Authentication', 'user', 'kdelacruz', 'Session token revoked.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/employee'),
(375, 3, 'Admin', 'Front Office', '2026-08-29 12:07:12', 'User logged in', 'Authentication', 'user', 'aramos', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/login'),
(376, 3, 'Admin', 'Front Office', '2026-08-29 12:07:19', 'User logged out', 'Authentication', 'user', 'aramos', 'Session token revoked.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin'),
(377, 4, 'Employee', 'Kitchen / Culinary', '2026-08-29 12:07:22', 'User logged in', 'Authentication', 'user', 'kdelacruz', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/login'),
(378, 4, 'Employee', 'Kitchen / Culinary', '2026-08-29 12:07:24', 'User logged out', 'Authentication', 'user', 'kdelacruz', 'Session token revoked.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/employee'),
(379, 3, 'Admin', 'Front Office', '2026-08-29 12:07:27', 'User logged in', 'Authentication', 'user', 'aramos', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/login'),
(380, 3, 'Admin', 'Front Office', '2026-08-29 12:07:31', 'User logged out', 'Authentication', 'user', 'aramos', 'Session token revoked.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin'),
(381, 1, 'Super Admin', 'Administration / HR', '2026-08-29 12:07:41', 'OTP sent', 'Authentication', 'user', 'bullseur', 'One-time password emailed to b******@oxfordsuites.com.ph', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/login'),
(382, NULL, 'System', 'System', '2026-08-29 12:08:23', 'Failed OTP verification', 'Authentication', 'user', NULL, 'Invalid or expired OTP attempt.', 'Warning', '127.0.0.1', 'Chrome', 'http://localhost:5173/otp'),
(383, 1, 'Super Admin', 'Administration / HR', '2026-08-29 12:08:32', 'User logged in', 'Authentication', 'user', 'bullseur', 'Two-factor login completed.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/otp'),
(384, 1, 'Super Admin', 'Administration / HR', '2026-08-29 12:22:27', 'Onboarding Item Toggled', 'New Hire Onboarding', 'Onboarding Item', '311', 'Completed onboarding item \'meron upload\' (new hire #3).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/superadmin/onboarding'),
(385, 1, 'Super Admin', 'Administration / HR', '2026-08-29 12:23:04', 'Onboarding Item Document Submitted', 'New Hire Onboarding', 'Onboarding Item', '318', 'Submitted document \'Front_Office_Supervisor.pdf\' for onboarding item \'meron upload\' (new hire #14).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/employee/onboarding');
INSERT INTO `audit_logs` (`audit_log_id`, `system_user_id`, `actor_role`, `actor_department`, `occurred_at`, `action`, `module_name`, `target_type`, `target_id`, `details`, `severity`, `ip_address`, `device_info`, `url`) VALUES
(386, 1, 'Super Admin', 'Administration / HR', '2026-08-29 12:23:45', 'Onboarding Item Document Submitted', 'New Hire Onboarding', 'Onboarding Item', '318', 'Submitted notes for onboarding item \'meron upload\' (new hire #14).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/employee/onboarding'),
(387, 1, 'Super Admin', 'Administration / HR', '2026-08-29 12:23:59', 'Onboarding Item Document Submitted', 'New Hire Onboarding', 'Onboarding Item', '318', 'Submitted document \'Front_Office_Supervisor.pdf\' for onboarding item \'meron upload\' (new hire #14).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/employee/onboarding'),
(388, 1, 'Super Admin', 'Administration / HR', '2026-08-29 12:24:03', 'Onboarding Item Document Submitted', 'New Hire Onboarding', 'Onboarding Item', '318', 'Submitted notes for onboarding item \'meron upload\' (new hire #14).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/employee/onboarding'),
(389, 1, 'Super Admin', 'Administration / HR', '2026-08-29 12:25:26', 'Onboarding Item Document Submitted', 'New Hire Onboarding', 'Onboarding Item', '319', 'Submitted document \'Hotel_Culinary_Production_Coordinator.docx\' for onboarding item \'try\' (new hire #14).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/employee/onboarding'),
(390, 1, 'Super Admin', 'Administration / HR', '2026-08-29 12:26:06', 'Onboarding Item Toggled', 'New Hire Onboarding', 'Onboarding Item', '314', 'Reopened onboarding item \'try\' (new hire #3).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/superadmin/onboarding'),
(391, 1, 'Super Admin', 'Administration / HR', '2026-08-29 12:26:27', 'Onboarding Item Document Submitted', 'New Hire Onboarding', 'Onboarding Item', '319', 'Submitted document \'Kitchen_Operations_Supervisor.pdf\' for onboarding item \'try\' (new hire #14).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/employee/onboarding'),
(392, 1, 'Super Admin', 'Administration / HR', '2026-08-29 12:27:05', 'Onboarding Item Document Submitted', 'New Hire Onboarding', 'Onboarding Item', '319', 'Submitted notes for onboarding item \'try\' (new hire #14).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/employee/onboarding'),
(393, 1, 'Super Admin', 'Administration / HR', '2026-08-29 12:27:54', 'Checklist Template Updated', 'New Hire Onboarding', 'Checklist Template', '8', 'Updated onboarding checklist template \'PROSs\' (status: Active).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/superadmin/onboarding'),
(394, 1, 'Super Admin', 'Administration / HR', '2026-08-29 12:28:22', 'Onboarding Item Document Submitted', 'New Hire Onboarding', 'Onboarding Item', '320', 'Submitted document \'Kitchen_Operations_Supervisor.pdf\' for onboarding item \'g\' (new hire #14).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/employee/onboarding'),
(395, 1, 'Super Admin', 'Administration / HR', '2026-08-29 12:37:05', 'Onboarding Item Toggled', 'New Hire Onboarding', 'Onboarding Item', '321', 'Completed onboarding item \'g\' (new hire #3).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/superadmin/onboarding'),
(396, 1, 'Super Admin', 'Administration / HR', '2026-08-29 12:37:23', 'Onboarding Item Toggled', 'New Hire Onboarding', 'Onboarding Item', '314', 'Completed onboarding item \'try\' (new hire #3).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/superadmin/onboarding'),
(397, 1, 'Super Admin', 'Administration / HR', '2026-08-29 13:08:32', 'Checklist Template Updated', 'New Hire Onboarding', 'Checklist Template', '8', 'Updated onboarding checklist template \'PROSs\' (status: Active).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/superadmin/onboarding'),
(398, 1, 'Super Admin', 'Administration / HR', '2026-08-29 13:09:03', 'Onboarding Item Document Submitted', 'New Hire Onboarding', 'Onboarding Item', '322', 'Submitted document \'Front_Office_Supervisor.pdf\' for onboarding item \'trra\' (new hire #14).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/employee/onboarding'),
(399, 1, 'Super Admin', 'Administration / HR', '2026-08-29 13:12:31', 'Onboarding Item Document Submitted', 'New Hire Onboarding', 'Onboarding Item', '322', 'Submitted document \'Housekeeping_Supervisor.pdf\' for onboarding item \'trra\' (new hire #14).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/employee/onboarding'),
(400, 1, 'Super Admin', 'Administration / HR', '2026-08-29 13:14:24', 'User logged out', 'Authentication', 'user', 'bullseur', 'Session token revoked.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/employee/onboarding'),
(401, 1, 'Super Admin', 'Administration / HR', '2026-08-29 13:14:32', 'OTP sent', 'Authentication', 'user', 'bullseur', 'One-time password emailed to b******@oxfordsuites.com.ph', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/login'),
(402, 1, 'Super Admin', 'Administration / HR', '2026-08-29 13:14:48', 'User logged in', 'Authentication', 'user', 'bullseur', 'Two-factor login completed.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/otp'),
(403, 1, 'Super Admin', 'Administration / HR', '2026-08-29 13:15:25', 'User logged out', 'Authentication', 'user', 'bullseur', 'Session token revoked.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/superadmin/onboarding'),
(404, 4, 'Employee', 'Kitchen / Culinary', '2026-08-29 13:15:28', 'User logged in', 'Authentication', 'user', 'kdelacruz', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/login'),
(405, 4, 'Employee', 'Kitchen / Culinary', '2026-08-29 13:25:12', 'Onboarding Item Document Submitted', 'New Hire Onboarding', 'Onboarding Item', '314', 'Submitted document \'Daniel_Villanueva_Reservations_Officer_Resume.pdf\' for onboarding item \'try\' (new hire #3).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/employee/onboarding'),
(406, 4, 'Employee', 'Kitchen / Culinary', '2026-08-29 13:25:23', 'User logged out', 'Authentication', 'user', 'kdelacruz', 'Session token revoked.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/employee/onboarding'),
(407, 1, 'Super Admin', 'Administration / HR', '2026-08-29 13:25:31', 'OTP sent', 'Authentication', 'user', 'bullseur', 'One-time password emailed to b******@oxfordsuites.com.ph', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/login'),
(408, 1, 'Super Admin', 'Administration / HR', '2026-08-29 13:25:52', 'User logged in', 'Authentication', 'user', 'bullseur', 'Two-factor login completed.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/otp'),
(409, 1, 'Super Admin', 'Administration / HR', '2026-08-29 13:26:38', 'Onboarding Item Toggled', 'New Hire Onboarding', 'Onboarding Item', '314', 'Reopened onboarding item \'try\' (new hire #3).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/superadmin/onboarding'),
(410, 1, 'Super Admin', 'Administration / HR', '2026-08-29 13:26:43', 'Onboarding Item Toggled', 'New Hire Onboarding', 'Onboarding Item', '308', 'Reopened onboarding item \'PROSPROS\' (new hire #3).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/superadmin/onboarding'),
(411, 1, 'Super Admin', 'Administration / HR', '2026-08-29 13:26:45', 'Onboarding Item Toggled', 'New Hire Onboarding', 'Onboarding Item', '309', 'Reopened onboarding item \'P_R_O\' (new hire #3).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/superadmin/onboarding'),
(412, 1, 'Super Admin', 'Administration / HR', '2026-08-29 13:26:57', 'User logged out', 'Authentication', 'user', 'bullseur', 'Session token revoked.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/superadmin/onboarding'),
(413, 4, 'Employee', 'Kitchen / Culinary', '2026-08-29 13:27:00', 'User logged in', 'Authentication', 'user', 'kdelacruz', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/login'),
(414, 4, 'Employee', 'Kitchen / Culinary', '2026-08-29 13:36:27', 'Onboarding Item Document Submitted', 'New Hire Onboarding', 'Onboarding Item', '314', 'Submitted document \'Jerome_Vincent_Alonzo_Hotel_Transportation_Services_Supervisor.pdf\' for onboarding item \'try\' (new hire #3).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/employee/onboarding'),
(415, 4, 'Employee', 'Kitchen / Culinary', '2026-08-29 13:36:35', 'User logged out', 'Authentication', 'user', 'kdelacruz', 'Session token revoked.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/employee/onboarding'),
(416, 3, 'Admin', 'Front Office', '2026-08-29 13:36:38', 'User logged in', 'Authentication', 'user', 'aramos', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/login'),
(417, 3, 'Admin', 'Front Office', '2026-08-29 13:38:31', 'Checklist Template Updated', 'New Hire Onboarding', 'Checklist Template', '8', 'Updated onboarding checklist template \'PROSs\' (status: Active).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/onboarding'),
(418, 3, 'Admin', 'Front Office', '2026-08-29 13:38:43', 'Checklist Template Updated', 'New Hire Onboarding', 'Checklist Template', '8', 'Updated onboarding checklist template \'PROSs\' (status: Active).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/onboarding'),
(419, 3, 'Admin', 'Front Office', '2026-08-29 13:39:27', 'User logged out', 'Authentication', 'user', 'aramos', 'Session token revoked.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/onboarding'),
(420, 4, 'Employee', 'Kitchen / Culinary', '2026-08-29 13:39:30', 'User logged in', 'Authentication', 'user', 'kdelacruz', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/login'),
(421, 4, 'Employee', 'Kitchen / Culinary', '2026-08-29 13:39:45', 'Onboarding Item Document Submitted', 'New Hire Onboarding', 'Onboarding Item', '323', 'Submitted document \'Daniel_Villanueva_Reservations_Officer_Resume.pdf\' for onboarding item \'1\' (new hire #3).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/employee/onboarding'),
(422, 4, 'Employee', 'Kitchen / Culinary', '2026-08-29 13:39:50', 'User logged out', 'Authentication', 'user', 'kdelacruz', 'Session token revoked.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/employee/onboarding'),
(423, 3, 'Admin', 'Front Office', '2026-08-29 13:39:53', 'User logged in', 'Authentication', 'user', 'aramos', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/login'),
(424, 3, 'Admin', 'Front Office', '2026-08-29 13:39:57', 'User logged in', 'Authentication', 'user', 'aramos', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/login'),
(425, 3, 'Admin', 'Front Office', '2026-08-29 13:41:32', 'User logged out', 'Authentication', 'user', 'aramos', 'Session token revoked.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/onboarding'),
(426, 4, 'Employee', 'Kitchen / Culinary', '2026-08-29 13:41:35', 'User logged in', 'Authentication', 'user', 'kdelacruz', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/login'),
(427, 4, 'Employee', 'Kitchen / Culinary', '2026-08-29 13:48:54', 'Onboarding Item Document Submitted', 'New Hire Onboarding', 'Onboarding Item', '314', 'Submitted document \'Daniel_Villanueva_Reservations_Officer_Resume.pdf\' for onboarding item \'try\' (new hire #3).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/employee/onboarding'),
(428, 4, 'Employee', 'Kitchen / Culinary', '2026-08-29 14:07:10', 'Onboarding Item Document Submitted', 'New Hire Onboarding', 'Onboarding Item', '311', 'Submitted document \'Daniel_Villanueva_Reservations_Officer_Resume.docx\' for onboarding item \'meron upload\' (new hire #3).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/employee/onboarding'),
(429, 4, 'Employee', 'Kitchen / Culinary', '2026-08-29 14:07:28', 'User logged out', 'Authentication', 'user', 'kdelacruz', 'Session token revoked.', 'Info', '127.0.0.1', 'Chrome', 'http://127.0.0.1:8000/api/v1/auth/logout'),
(430, 3, 'Admin', 'Front Office', '2026-08-29 14:07:43', 'User logged in', 'Authentication', 'user', 'aramos', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Chrome', 'http://127.0.0.1:8000/api/v1/auth/login'),
(431, 3, 'Admin', 'Front Office', '2026-08-29 14:07:44', 'User logged in', 'Authentication', 'user', 'aramos', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Chrome', 'http://127.0.0.1:8000/api/v1/auth/login'),
(432, 3, 'Admin', 'Front Office', '2026-08-29 14:07:44', 'User logged in', 'Authentication', 'user', 'aramos', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/login'),
(433, 3, 'Admin', 'Front Office', '2026-08-29 14:14:18', 'User logged out', 'Authentication', 'user', 'aramos', 'Session token revoked.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/onboarding'),
(434, 4, 'Employee', 'Kitchen / Culinary', '2026-08-29 14:14:21', 'User logged in', 'Authentication', 'user', 'kdelacruz', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/login'),
(435, 4, 'Employee', 'Kitchen / Culinary', '2026-08-29 14:15:24', 'Onboarding Item Document Submitted', 'New Hire Onboarding', 'Onboarding Item', '314', 'Submitted document \'Jerome_Vincent_Alonzo_Hotel_Airport_Transfer_Coordinator.png\' for onboarding item \'try\' (new hire #3).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/employee/onboarding'),
(436, 4, 'Employee', 'Kitchen / Culinary', '2026-08-29 14:15:41', 'User logged out', 'Authentication', 'user', 'kdelacruz', 'Session token revoked.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/employee/onboarding'),
(437, 3, 'Admin', 'Front Office', '2026-08-29 14:15:44', 'User logged in', 'Authentication', 'user', 'aramos', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/login'),
(438, 3, 'Admin', 'Front Office', '2026-08-29 14:25:07', 'User logged out', 'Authentication', 'user', 'aramos', 'Session token revoked.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/onboarding'),
(439, 4, 'Employee', 'Kitchen / Culinary', '2026-08-29 14:25:10', 'User logged in', 'Authentication', 'user', 'kdelacruz', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/login'),
(440, 4, 'Employee', 'Kitchen / Culinary', '2026-08-29 14:28:35', 'Onboarding Item Document Submitted', 'New Hire Onboarding', 'Onboarding Item', '323', 'Submitted document \'Jerome_Vincent_Alonzo_Hotel_Transportation_Services_Supervisor.pdf\' for onboarding item \'1\' (new hire #3).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/employee/onboarding'),
(441, 4, 'Employee', 'Kitchen / Culinary', '2026-08-29 14:44:16', 'Onboarding Item Document Submitted', 'New Hire Onboarding', 'Onboarding Item', '323', 'Submitted document \'Jerome_Vincent_Alonzo_Hotel_Transportation_Services_Supervisor.pdf\' for onboarding item \'1\' (new hire #3).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/employee/onboarding'),
(442, 4, 'Employee', 'Kitchen / Culinary', '2026-08-29 14:45:00', 'User logged out', 'Authentication', 'user', 'kdelacruz', 'Session token revoked.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/employee/onboarding'),
(443, 3, 'Admin', 'Front Office', '2026-08-29 14:45:03', 'User logged in', 'Authentication', 'user', 'aramos', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/login'),
(444, 3, 'Admin', 'Front Office', '2026-08-29 14:53:38', 'User logged out', 'Authentication', 'user', 'aramos', 'Session token revoked.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/onboarding'),
(445, 4, 'Employee', 'Kitchen / Culinary', '2026-08-29 14:53:41', 'User logged in', 'Authentication', 'user', 'kdelacruz', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/login'),
(446, 4, 'Employee', 'Kitchen / Culinary', '2026-08-29 14:54:12', 'Onboarding Item Document Submitted', 'New Hire Onboarding', 'Onboarding Item', '323', 'Submitted document \'Marcus_Elijah_Navarro_Banquet_Operations_Supervisor.pdf\' for onboarding item \'1\' (new hire #3).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/employee/onboarding'),
(447, 4, 'Employee', 'Kitchen / Culinary', '2026-08-29 14:54:30', 'Onboarding Item Document Submitted', 'New Hire Onboarding', 'Onboarding Item', '323', 'Submitted notes for onboarding item \'1\' (new hire #3).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/employee/onboarding'),
(448, 4, 'Employee', 'Kitchen / Culinary', '2026-08-29 14:55:22', 'User logged out', 'Authentication', 'user', 'kdelacruz', 'Session token revoked.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/employee/onboarding'),
(449, 3, 'Admin', 'Front Office', '2026-08-29 14:55:25', 'User logged in', 'Authentication', 'user', 'aramos', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/login'),
(450, 3, 'Admin', 'Front Office', '2026-08-29 15:13:43', 'User logged in', 'Authentication', 'user', 'aramos', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/login'),
(451, 3, 'Admin', 'Front Office', '2026-08-29 15:14:54', 'User logged in', 'Authentication', 'user', 'aramos', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Edge', 'http://localhost:5173/login'),
(452, 3, 'Admin', 'Front Office', '2026-08-29 15:19:00', 'Checklist Template Updated', 'New Hire Onboarding', 'Checklist Template', '8', 'Updated onboarding checklist template \'PROSs\' (status: Active).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/onboarding'),
(453, 3, 'Admin', 'Front Office', '2026-08-29 15:19:03', 'User logged out', 'Authentication', 'user', 'aramos', 'Session token revoked.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/onboarding'),
(454, 4, 'Employee', 'Kitchen / Culinary', '2026-08-29 15:19:07', 'User logged in', 'Authentication', 'user', 'kdelacruz', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/login'),
(455, 3, 'Admin', 'Front Office', '2026-08-29 15:19:12', 'User logged in', 'Authentication', 'user', 'aramos', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/login'),
(456, 3, 'Admin', 'Front Office', '2026-08-29 15:19:17', 'User logged out', 'Authentication', 'user', 'aramos', 'Session token revoked.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/onboarding'),
(457, 4, 'Employee', 'Kitchen / Culinary', '2026-08-29 15:19:19', 'User logged in', 'Authentication', 'user', 'kdelacruz', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/login'),
(458, 3, 'Admin', 'Front Office', '2026-08-29 15:19:47', 'Checklist Template Updated', 'New Hire Onboarding', 'Checklist Template', '8', 'Updated onboarding checklist template \'PROSs\' (status: Active).', 'Info', '127.0.0.1', 'Edge', 'http://localhost:5173/admin/onboarding'),
(459, 4, 'Employee', 'Kitchen / Culinary', '2026-08-29 15:37:58', 'Onboarding Item Document Submitted', 'New Hire Onboarding', 'Onboarding Item', '323', 'Submitted document \'Marcus_Elijah_Navarro_Banquet_Operations_Supervisor.pdf\' for onboarding item \'1\' (new hire #3).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/employee/onboarding'),
(460, 4, 'Employee', 'Kitchen / Culinary', '2026-08-29 15:53:00', 'Onboarding Item Document Submitted', 'New Hire Onboarding', 'Onboarding Item', '323', 'Submitted document \'Patricia_Elaine_Ramos_Hotel_Purchasing_Supervisor.pdf\' for onboarding item \'1\' (new hire #3).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/employee/onboarding'),
(461, 4, 'Employee', 'Kitchen / Culinary', '2026-08-29 15:54:14', 'Onboarding Item Document Submitted', 'New Hire Onboarding', 'Onboarding Item', '323', 'Submitted document \'Patricia_Elaine_Ramos_Food_and_Beverage_Purchasing_Officer.png\' for onboarding item \'1\' (new hire #3).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/employee/onboarding'),
(462, 4, 'Employee', 'Kitchen / Culinary', '2026-08-29 15:54:23', 'Onboarding Item Document Submitted', 'New Hire Onboarding', 'Onboarding Item', '323', 'Submitted document \'Patricia_Elaine_Ramos_Restaurant_Supply_Chain_Coordinator.jpg\' for onboarding item \'1\' (new hire #3).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/employee/onboarding'),
(463, 4, 'Employee', 'Kitchen / Culinary', '2026-08-29 16:05:46', 'User logged out', 'Authentication', 'user', 'kdelacruz', 'Session token revoked.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/employee/onboarding'),
(464, 3, 'Admin', 'Front Office', '2026-08-29 16:05:50', 'User logged in', 'Authentication', 'user', 'aramos', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/login'),
(465, 3, 'Admin', 'Front Office', '2026-08-29 16:08:45', 'User logged out', 'Authentication', 'user', 'aramos', 'Session token revoked.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/onboarding'),
(466, 4, 'Employee', 'Kitchen / Culinary', '2026-08-29 16:08:48', 'User logged in', 'Authentication', 'user', 'kdelacruz', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/login'),
(467, 4, 'Employee', 'Kitchen / Culinary', '2026-08-29 16:09:20', 'Onboarding Item Document Submitted', 'New Hire Onboarding', 'Onboarding Item', '321', 'Submitted document \'Patricia_Elaine_Ramos_Hotel_Purchasing_Supervisor.pdf\' for onboarding item \'g\' (new hire #3).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/employee/onboarding'),
(468, 3, 'Admin', 'Front Office', '2026-08-29 16:37:23', 'User logged in', 'Authentication', 'user', 'aramos', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/login'),
(469, 3, 'Admin', 'Front Office', '2026-08-29 16:46:45', 'Onboarding Item Toggled', 'New Hire Onboarding', 'Onboarding Item', '2', 'Reopened onboarding item \'NBI / Police clearance\' (new hire #1).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/onboarding'),
(470, 3, 'Admin', 'Front Office', '2026-08-29 16:49:04', 'Onboarding Item Toggled', 'New Hire Onboarding', 'Onboarding Item', '4', 'Completed onboarding item \'SSS / PhilHealth / Pag-IBIG / TIN\' (new hire #1).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/onboarding'),
(471, 3, 'Admin', 'Front Office', '2026-08-29 16:50:36', 'Onboarding Item Toggled', 'New Hire Onboarding', 'Onboarding Item', '324', 'Completed onboarding item \'1\' (new hire #14).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/onboarding'),
(472, 3, 'Admin', 'Front Office', '2026-08-29 16:50:59', 'Onboarding Item Toggled', 'New Hire Onboarding', 'Onboarding Item', '325', 'Completed onboarding item \'2\' (new hire #14).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/onboarding'),
(473, 3, 'Admin', 'Front Office', '2026-08-29 16:51:00', 'Onboarding Item Toggled', 'New Hire Onboarding', 'Onboarding Item', '326', 'Completed onboarding item \'P_R_O\' (new hire #14).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/onboarding'),
(474, 3, 'Admin', 'Front Office', '2026-08-29 17:01:16', 'Onboarding Item Toggled', 'New Hire Onboarding', 'Onboarding Item', '320', 'Completed onboarding item \'g\' (new hire #14).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/onboarding'),
(475, 3, 'Admin', 'Front Office', '2026-08-29 17:01:17', 'Onboarding Item Toggled', 'New Hire Onboarding', 'Onboarding Item', '322', 'Completed onboarding item \'trra\' (new hire #14).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/onboarding'),
(476, 3, 'Admin', 'Front Office', '2026-08-29 17:01:27', 'Onboarding Item Toggled', 'New Hire Onboarding', 'Onboarding Item', '322', 'Reopened onboarding item \'trra\' (new hire #14).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/onboarding'),
(477, 3, 'Admin', 'Front Office', '2026-08-29 17:01:38', 'Onboarding Item Toggled', 'New Hire Onboarding', 'Onboarding Item', '319', 'Completed onboarding item \'try\' (new hire #14).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/onboarding'),
(478, 3, 'Admin', 'Front Office', '2026-08-29 17:01:39', 'Onboarding Item Toggled', 'New Hire Onboarding', 'Onboarding Item', '322', 'Completed onboarding item \'trra\' (new hire #14).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/onboarding'),
(479, 3, 'Admin', 'Front Office', '2026-08-29 17:01:58', 'Onboarding Item Toggled', 'New Hire Onboarding', 'Onboarding Item', '327', 'Completed onboarding item \'trra\' (new hire #8).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/onboarding'),
(480, 3, 'Admin', 'Front Office', '2026-08-29 17:01:59', 'Onboarding Item Toggled', 'New Hire Onboarding', 'Onboarding Item', '328', 'Completed onboarding item \'g\' (new hire #8).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/onboarding'),
(481, 3, 'Admin', 'Front Office', '2026-08-29 17:02:00', 'Onboarding Item Toggled', 'New Hire Onboarding', 'Onboarding Item', '329', 'Completed onboarding item \'test\' (new hire #8).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/onboarding'),
(482, 4, 'Employee', 'Kitchen / Culinary', '2026-08-29 17:07:52', 'User logged out', 'Authentication', 'user', 'kdelacruz', 'Session token revoked.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/employee/onboarding'),
(483, 4, 'Employee', 'Kitchen / Culinary', '2026-08-29 17:07:57', 'User logged in', 'Authentication', 'user', 'kdelacruz', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/login'),
(484, 4, 'Employee', 'Kitchen / Culinary', '2026-08-29 17:08:23', 'User logged out', 'Authentication', 'user', 'kdelacruz', 'Session token revoked.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/employee'),
(485, 1, 'Super Admin', 'Administration / HR', '2026-08-29 17:08:36', 'OTP sent', 'Authentication', 'user', 'bullseur', 'One-time password emailed to b******@oxfordsuites.com.ph', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/login'),
(486, 1, 'Super Admin', 'Administration / HR', '2026-08-29 17:08:52', 'User logged in', 'Authentication', 'user', 'bullseur', 'Two-factor login completed.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/otp'),
(487, 1, 'Super Admin', 'Administration / HR', '2026-08-29 19:13:42', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '16', 'Preview screening scored 77.6% with status NOT_FITTED_TO_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/superadmin/recruitment'),
(488, 3, 'Admin', 'Front Office', '2026-08-30 14:01:53', 'Failed login attempt', 'Authentication', 'user', 'aramos', 'Invalid credentials supplied.', 'Warning', '127.0.0.1', 'Unknown', 'http://127.0.0.1:8000/api/v1/auth/login'),
(489, 3, 'Admin', 'Front Office', '2026-08-30 14:02:06', 'Failed login attempt', 'Authentication', 'user', 'aramos', 'Invalid credentials supplied.', 'Warning', '127.0.0.1', 'Unknown', 'http://127.0.0.1:8000/api/v1/auth/login'),
(490, 3, 'Admin', 'Front Office', '2026-08-30 14:02:10', 'Failed login attempt', 'Authentication', 'user', 'aramos', 'Invalid credentials supplied.', 'Warning', '127.0.0.1', 'Unknown', 'http://127.0.0.1:8000/api/v1/auth/login'),
(491, 3, 'Admin', 'Front Office', '2026-08-30 14:06:37', 'Failed login attempt', 'Authentication', 'user', 'aramos', 'Invalid credentials supplied.', 'Warning', '127.0.0.1', 'Unknown', 'http://127.0.0.1:8000/api/v1/auth/login'),
(492, 3, 'Admin', 'Front Office', '2026-08-30 14:07:38', 'User logged in', 'Authentication', 'user', 'aramos', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Unknown', 'http://127.0.0.1:8000/api/v1/auth/login'),
(493, 1, 'Super Admin', 'Administration / HR', '2026-08-30 14:11:15', 'OTP sent', 'Authentication', 'user', 'bullseur', 'One-time password emailed to b******@oxfordsuites.com.ph', 'Info', '127.0.0.1', 'Unknown', 'http://127.0.0.1:8000/api/v1/auth/login'),
(494, 1, 'Super Admin', 'Administration / HR', '2026-08-30 14:11:51', 'User logged in', 'Authentication', 'user', 'bullseur', 'Two-factor login completed.', 'Info', '127.0.0.1', 'Unknown', 'http://127.0.0.1:8000/api/v1/auth/otp/verify'),
(495, 3, 'Admin', 'Front Office', '2026-08-30 14:20:48', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '16', 'Preview screening scored 88.8% with status PERFECT_FOR_THE_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5199/admin/recruitment'),
(496, 3, 'Admin', 'Front Office', '2026-08-30 14:22:31', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '16', 'Preview screening scored 88.8% with status PERFECT_FOR_THE_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5199/admin/recruitment'),
(497, 3, 'Admin', 'Front Office', '2026-08-30 14:23:46', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '16', 'Preview screening scored 88.8% with status PERFECT_FOR_THE_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5199/admin/recruitment'),
(498, 3, 'Admin', 'Front Office', '2026-08-30 14:23:47', 'Applicant Screened', 'Applicant Management', 'Applicant', '51', 'spaCy screening for Adrian Luis Navarro: Perfect for the Job (88.80%), processing status PARTIALLY_PROCESSED.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5199/admin/recruitment'),
(499, 3, 'Admin', 'Front Office', '2026-08-30 14:23:47', 'Applicant Created', 'Applicant Management', 'Applicant', '51', 'Added new applicant Adrian Luis Navarro for position ID 16.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5199/admin/recruitment'),
(500, 1, 'Super Admin', 'Administration / HR', '2026-08-30 14:26:49', 'Job Post Created', 'Recruitment Management', 'Job Post', '17', 'Created job post \'Executive Housekeeper\'.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5199/superadmin/recruitment'),
(501, 1, 'Super Admin', 'Administration / HR', '2026-08-30 14:26:51', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '17', 'Preview screening scored 100% with status PERFECT_FOR_THE_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5199/superadmin/recruitment'),
(502, 1, 'Super Admin', 'Administration / HR', '2026-08-30 14:26:52', 'Applicant Screened', 'Applicant Management', 'Applicant', '52', 'spaCy screening for Adrian Luis Navarro: Perfect for the Job (100.00%), processing status PARTIALLY_PROCESSED.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5199/superadmin/recruitment'),
(503, 1, 'Super Admin', 'Administration / HR', '2026-08-30 14:26:52', 'Applicant Created', 'Applicant Management', 'Applicant', '52', 'Added new applicant Adrian Luis Navarro for position ID 17.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5199/superadmin/recruitment'),
(504, 1, 'Super Admin', 'Administration / HR', '2026-08-30 15:04:41', 'OTP sent', 'Authentication', 'user', 'bullseur', 'One-time password emailed to b******@oxfordsuites.com.ph', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/login'),
(505, 1, 'Super Admin', 'Administration / HR', '2026-08-30 15:05:11', 'User logged in', 'Authentication', 'user', 'bullseur', 'Two-factor login completed.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/otp'),
(506, 1, 'Super Admin', 'Administration / HR', '2026-08-30 15:09:32', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '6', 'Preview screening scored 79% with status FIT_FOR_OTHER_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/superadmin/recruitment'),
(507, 1, 'Super Admin', 'Administration / HR', '2026-08-30 15:09:41', 'Applicant Screened', 'Applicant Management', 'Applicant', '53', 'spaCy screening for ALYSSA MARIE: Fit for Other Job (79.00%), processing status PARTIALLY_PROCESSED.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/superadmin/recruitment'),
(508, 1, 'Super Admin', 'Administration / HR', '2026-08-30 15:09:41', 'Applicant Created', 'Applicant Management', 'Applicant', '53', 'Added new applicant ALYSSA MARIE for position ID 6.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/superadmin/recruitment'),
(509, 1, 'Super Admin', 'Administration / HR', '2026-08-30 15:10:17', 'User logged out', 'Authentication', 'user', 'bullseur', 'Session token revoked.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/superadmin/recruitment'),
(510, 3, 'Admin', 'Front Office', '2026-08-30 15:10:20', 'User logged in', 'Authentication', 'user', 'aramos', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/login'),
(511, 1, 'Super Admin', 'Administration / HR', '2026-08-30 15:22:22', 'OTP sent', 'Authentication', 'user', 'bullseur', 'One-time password emailed to b******@oxfordsuites.com.ph', 'Info', '127.0.0.1', 'Unknown', 'http://127.0.0.1:8000/api/v1/auth/login'),
(512, 1, 'Super Admin', 'Administration / HR', '2026-08-30 15:22:25', 'User logged in', 'Authentication', 'user', 'bullseur', 'Two-factor login completed.', 'Info', '127.0.0.1', 'Unknown', 'http://127.0.0.1:8000/api/v1/auth/otp/verify'),
(513, 3, 'Admin', 'Front Office', '2026-08-30 15:25:04', 'User logged out', 'Authentication', 'user', 'aramos', 'Session token revoked.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/recruitment'),
(514, 1, 'Super Admin', 'Administration / HR', '2026-08-30 15:25:15', 'OTP sent', 'Authentication', 'user', 'bullseur', 'One-time password emailed to b******@oxfordsuites.com.ph', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/login'),
(515, 1, 'Super Admin', 'Administration / HR', '2026-08-30 15:25:35', 'User logged in', 'Authentication', 'user', 'bullseur', 'Two-factor login completed.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/otp'),
(516, 1, 'Super Admin', 'Administration / HR', '2026-08-30 15:26:41', 'Position created', 'Core HCM', 'position', '19', 'Position ha', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/superadmin/dept-pos'),
(517, 1, 'Super Admin', 'Administration / HR', '2026-08-30 15:33:54', 'Onboarding Item Toggled', 'New Hire Onboarding', 'Onboarding Item', '306', 'Completed onboarding item \'P_R_O\' (new hire #19).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/superadmin/onboarding'),
(518, 1, 'Super Admin', 'Administration / HR', '2026-08-30 15:33:54', 'Onboarding Item Toggled', 'New Hire Onboarding', 'Onboarding Item', '307', 'Completed onboarding item \'PROSPROS\' (new hire #19).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/superadmin/onboarding'),
(519, 1, 'Super Admin', 'Administration / HR', '2026-08-30 15:33:54', 'Onboarding Item Toggled', 'New Hire Onboarding', 'Onboarding Item', '310', 'Completed onboarding item \'meron upload\' (new hire #19).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/superadmin/onboarding'),
(520, 1, 'Super Admin', 'Administration / HR', '2026-08-30 15:33:55', 'Onboarding Item Toggled', 'New Hire Onboarding', 'Onboarding Item', '316', 'Completed onboarding item \'try\' (new hire #19).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/superadmin/onboarding'),
(521, 1, 'Super Admin', 'Administration / HR', '2026-08-30 15:33:55', 'Onboarding Item Toggled', 'New Hire Onboarding', 'Onboarding Item', '317', 'Completed onboarding item \'test\' (new hire #19).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/superadmin/onboarding'),
(522, 1, 'Super Admin', 'Administration / HR', '2026-08-30 15:33:57', 'Onboarding Item Toggled', 'New Hire Onboarding', 'Onboarding Item', '330', 'Completed onboarding item \'g\' (new hire #19).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/superadmin/onboarding'),
(523, 1, 'Super Admin', 'Administration / HR', '2026-08-30 15:33:57', 'Onboarding Item Toggled', 'New Hire Onboarding', 'Onboarding Item', '331', 'Completed onboarding item \'trra\' (new hire #19).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/superadmin/onboarding'),
(524, 1, 'Super Admin', 'Administration / HR', '2026-08-30 15:33:58', 'Onboarding Item Toggled', 'New Hire Onboarding', 'Onboarding Item', '332', 'Completed onboarding item \'1\' (new hire #19).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/superadmin/onboarding'),
(525, 1, 'Super Admin', 'Administration / HR', '2026-08-30 15:33:58', 'Onboarding Item Toggled', 'New Hire Onboarding', 'Onboarding Item', '333', 'Completed onboarding item \'2\' (new hire #19).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/superadmin/onboarding'),
(526, 3, 'Admin', 'Front Office', '2026-08-30 16:11:37', 'User logged in', 'Authentication', 'user', 'aramos', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Unknown', 'http://127.0.0.1:8000/api/v1/auth/login'),
(527, 3, 'Admin', 'Front Office', '2026-08-30 16:25:00', 'New Hire Updated', 'New Hire Onboarding', 'New Hire', '19', 'Updated new hire record (code: NH-00017, stage: Probationary).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5199/admin/onboarding'),
(528, 1, 'Super Admin', 'Administration / HR', '2026-08-30 16:27:29', 'OTP sent', 'Authentication', 'user', 'bullseur', 'One-time password emailed to b******@oxfordsuites.com.ph', 'Info', '127.0.0.1', 'Unknown', 'http://127.0.0.1:8000/api/v1/auth/login'),
(529, 1, 'Super Admin', 'Administration / HR', '2026-08-30 16:27:33', 'User logged in', 'Authentication', 'user', 'bullseur', 'Two-factor login completed.', 'Info', '127.0.0.1', 'Unknown', 'http://127.0.0.1:8000/api/v1/auth/otp/verify'),
(530, 1, 'Super Admin', 'Administration / HR', '2026-08-30 16:28:38', 'New Hire Updated', 'New Hire Onboarding', 'New Hire', '19', 'Updated new hire record (code: NH-00017, stage: Probationary).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5199/superadmin/onboarding'),
(531, 1, 'Super Admin', 'Administration / HR', '2026-08-30 16:31:10', 'New Hire Stage Promoted', 'New Hire Onboarding', 'New Hire', '19', 'Promoted new hire (code: NH-00017) to Regular stage.', 'Info', '127.0.0.1', 'Unknown', 'http://127.0.0.1:8000/api/v1/new-hires/19/promote-stage'),
(532, 1, 'Super Admin', 'Administration / HR', '2026-08-30 16:31:27', 'New Hire Updated', 'New Hire Onboarding', 'New Hire', '19', 'Updated new hire record (code: NH-00017, stage: Regular).', 'Info', '127.0.0.1', 'Unknown', 'http://127.0.0.1:8000/api/v1/new-hires/19'),
(533, 1, 'Super Admin', 'Administration / HR', '2026-08-30 16:32:08', 'New Hire Updated', 'New Hire Onboarding', 'New Hire', '19', 'Updated new hire record (code: NH-00017, stage: Probationary).', 'Info', '127.0.0.1', 'Unknown', 'http://127.0.0.1:8000/api/v1/new-hires/19'),
(534, 1, 'Super Admin', 'Administration / HR', '2026-08-30 16:32:20', 'New Hire Updated', 'New Hire Onboarding', 'New Hire', '19', 'Updated new hire record (code: NH-00017, stage: Probationary).', 'Info', '127.0.0.1', 'Unknown', 'http://127.0.0.1:8000/api/v1/new-hires/19'),
(535, 1, 'Super Admin', 'Administration / HR', '2026-08-30 16:32:38', 'New Hire Updated', 'New Hire Onboarding', 'New Hire', '19', 'Updated new hire record (code: NH-00017, stage: Probationary).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5199/superadmin/onboarding'),
(536, 1, 'Super Admin', 'Administration / HR', '2026-08-30 16:32:38', 'New Hire Stage Promoted', 'New Hire Onboarding', 'New Hire', '19', 'Promoted new hire (code: NH-00017) to Regular stage.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5199/superadmin/onboarding'),
(537, 1, 'Super Admin', 'Administration / HR', '2026-08-30 16:33:14', 'New Hire Updated', 'New Hire Onboarding', 'New Hire', '19', 'Updated new hire record (code: NH-00017, stage: Probationary).', 'Info', '127.0.0.1', 'Unknown', 'http://127.0.0.1:8000/api/v1/new-hires/19'),
(538, 1, 'Super Admin', 'Administration / HR', '2026-08-30 17:00:24', 'Onboarding Item Toggled', 'New Hire Onboarding', 'Onboarding Item', '17', 'Completed onboarding item \'Signed employment contract\' (new hire #3).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/superadmin/onboarding'),
(539, 1, 'Super Admin', 'Administration / HR', '2026-08-30 17:00:24', 'Onboarding Item Toggled', 'New Hire Onboarding', 'Onboarding Item', '18', 'Completed onboarding item \'NBI / Police clearance\' (new hire #3).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/superadmin/onboarding'),
(540, 1, 'Super Admin', 'Administration / HR', '2026-08-30 17:00:26', 'Onboarding Item Toggled', 'New Hire Onboarding', 'Onboarding Item', '19', 'Completed onboarding item \'Pre-employment medical exam\' (new hire #3).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/superadmin/onboarding'),
(541, 1, 'Super Admin', 'Administration / HR', '2026-08-30 17:00:27', 'Onboarding Item Toggled', 'New Hire Onboarding', 'Onboarding Item', '20', 'Completed onboarding item \'SSS / PhilHealth / Pag-IBIG / TIN\' (new hire #3).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/superadmin/onboarding'),
(542, 1, 'Super Admin', 'Administration / HR', '2026-08-30 17:00:28', 'Onboarding Item Toggled', 'New Hire Onboarding', 'Onboarding Item', '19', 'Completed onboarding item \'Pre-employment medical exam\' (new hire #3).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/superadmin/onboarding'),
(543, 1, 'Super Admin', 'Administration / HR', '2026-08-30 17:00:28', 'Onboarding Item Toggled', 'New Hire Onboarding', 'Onboarding Item', '21', 'Completed onboarding item \'Birth certificate (PSA)\' (new hire #3).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/superadmin/onboarding'),
(544, 1, 'Super Admin', 'Administration / HR', '2026-08-30 17:00:29', 'Onboarding Item Toggled', 'New Hire Onboarding', 'Onboarding Item', '22', 'Completed onboarding item \'Company orientation attended\' (new hire #3).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/superadmin/onboarding'),
(545, 1, 'Super Admin', 'Administration / HR', '2026-08-30 17:00:29', 'Onboarding Item Toggled', 'New Hire Onboarding', 'Onboarding Item', '23', 'Completed onboarding item \'Uniform & ID issued\' (new hire #3).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/superadmin/onboarding'),
(546, 1, 'Super Admin', 'Administration / HR', '2026-08-30 17:00:29', 'Onboarding Item Toggled', 'New Hire Onboarding', 'Onboarding Item', '24', 'Completed onboarding item \'Department on-the-job training\' (new hire #3).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/superadmin/onboarding'),
(547, 1, 'Super Admin', 'Administration / HR', '2026-08-30 17:00:30', 'Onboarding Item Toggled', 'New Hire Onboarding', 'Onboarding Item', '293', 'Completed onboarding item \'PROPRO\' (new hire #3).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/superadmin/onboarding'),
(548, 1, 'Super Admin', 'Administration / HR', '2026-08-30 17:00:38', 'Onboarding Item Toggled', 'New Hire Onboarding', 'Onboarding Item', '17', 'Completed onboarding item \'Signed employment contract\' (new hire #3).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/superadmin/onboarding'),
(549, 1, 'Super Admin', 'Administration / HR', '2026-08-30 17:00:38', 'Onboarding Item Toggled', 'New Hire Onboarding', 'Onboarding Item', '18', 'Completed onboarding item \'NBI / Police clearance\' (new hire #3).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/superadmin/onboarding'),
(550, 1, 'Super Admin', 'Administration / HR', '2026-08-30 17:00:38', 'Onboarding Item Toggled', 'New Hire Onboarding', 'Onboarding Item', '19', 'Completed onboarding item \'Pre-employment medical exam\' (new hire #3).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/superadmin/onboarding'),
(551, 1, 'Super Admin', 'Administration / HR', '2026-08-30 17:00:39', 'Onboarding Item Toggled', 'New Hire Onboarding', 'Onboarding Item', '20', 'Completed onboarding item \'SSS / PhilHealth / Pag-IBIG / TIN\' (new hire #3).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/superadmin/onboarding'),
(552, 1, 'Super Admin', 'Administration / HR', '2026-08-30 17:00:39', 'Onboarding Item Toggled', 'New Hire Onboarding', 'Onboarding Item', '21', 'Completed onboarding item \'Birth certificate (PSA)\' (new hire #3).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/superadmin/onboarding'),
(553, 1, 'Super Admin', 'Administration / HR', '2026-08-30 17:00:39', 'Onboarding Item Toggled', 'New Hire Onboarding', 'Onboarding Item', '22', 'Completed onboarding item \'Company orientation attended\' (new hire #3).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/superadmin/onboarding'),
(554, 1, 'Super Admin', 'Administration / HR', '2026-08-30 17:00:40', 'Onboarding Item Toggled', 'New Hire Onboarding', 'Onboarding Item', '23', 'Completed onboarding item \'Uniform & ID issued\' (new hire #3).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/superadmin/onboarding'),
(555, 1, 'Super Admin', 'Administration / HR', '2026-08-30 17:00:40', 'Onboarding Item Toggled', 'New Hire Onboarding', 'Onboarding Item', '24', 'Completed onboarding item \'Department on-the-job training\' (new hire #3).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/superadmin/onboarding'),
(556, 1, 'Super Admin', 'Administration / HR', '2026-08-30 17:00:40', 'Onboarding Item Toggled', 'New Hire Onboarding', 'Onboarding Item', '293', 'Completed onboarding item \'PROPRO\' (new hire #3).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/superadmin/onboarding'),
(557, 1, 'Super Admin', 'Administration / HR', '2026-08-30 17:00:43', 'Onboarding Item Toggled', 'New Hire Onboarding', 'Onboarding Item', '308', 'Completed onboarding item \'PROSPROS\' (new hire #3).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/superadmin/onboarding'),
(558, 1, 'Super Admin', 'Administration / HR', '2026-08-30 17:00:43', 'Onboarding Item Toggled', 'New Hire Onboarding', 'Onboarding Item', '308', 'Completed onboarding item \'PROSPROS\' (new hire #3).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/superadmin/onboarding'),
(559, 1, 'Super Admin', 'Administration / HR', '2026-08-30 17:00:44', 'Onboarding Item Toggled', 'New Hire Onboarding', 'Onboarding Item', '309', 'Completed onboarding item \'P_R_O\' (new hire #3).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/superadmin/onboarding'),
(560, 1, 'Super Admin', 'Administration / HR', '2026-08-30 17:00:45', 'Onboarding Item Toggled', 'New Hire Onboarding', 'Onboarding Item', '309', 'Completed onboarding item \'P_R_O\' (new hire #3).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/superadmin/onboarding'),
(561, 1, 'Super Admin', 'Administration / HR', '2026-08-30 17:00:45', 'Onboarding Item Toggled', 'New Hire Onboarding', 'Onboarding Item', '314', 'Completed onboarding item \'try\' (new hire #3).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/superadmin/onboarding'),
(562, 1, 'Super Admin', 'Administration / HR', '2026-08-30 17:00:46', 'Onboarding Item Toggled', 'New Hire Onboarding', 'Onboarding Item', '314', 'Completed onboarding item \'try\' (new hire #3).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/superadmin/onboarding'),
(563, 1, 'Super Admin', 'Administration / HR', '2026-08-30 17:00:50', 'Onboarding Item Toggled', 'New Hire Onboarding', 'Onboarding Item', '334', 'Completed onboarding item \'trra\' (new hire #3).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/superadmin/onboarding'),
(564, 1, 'Super Admin', 'Administration / HR', '2026-08-30 17:00:50', 'Onboarding Item Toggled', 'New Hire Onboarding', 'Onboarding Item', '323', 'Completed onboarding item \'1\' (new hire #3).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/superadmin/onboarding'),
(565, 1, 'Super Admin', 'Administration / HR', '2026-08-30 17:00:50', 'Onboarding Item Toggled', 'New Hire Onboarding', 'Onboarding Item', '335', 'Completed onboarding item \'2\' (new hire #3).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/superadmin/onboarding'),
(566, 1, 'Super Admin', 'Administration / HR', '2026-08-30 17:00:51', 'Onboarding Item Toggled', 'New Hire Onboarding', 'Onboarding Item', '334', 'Completed onboarding item \'trra\' (new hire #3).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/superadmin/onboarding'),
(567, 1, 'Super Admin', 'Administration / HR', '2026-08-30 17:00:51', 'Onboarding Item Toggled', 'New Hire Onboarding', 'Onboarding Item', '335', 'Completed onboarding item \'2\' (new hire #3).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/superadmin/onboarding'),
(568, 1, 'Super Admin', 'Administration / HR', '2026-08-30 17:00:53', 'New Hire Updated', 'New Hire Onboarding', 'New Hire', '3', 'Updated new hire record (code: NH-03, stage: Probationary).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/superadmin/onboarding'),
(569, 1, 'Super Admin', 'Administration / HR', '2026-08-30 17:00:54', 'New Hire Updated', 'New Hire Onboarding', 'New Hire', '3', 'Updated new hire record (code: NH-03, stage: Probationary).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/superadmin/onboarding'),
(570, 1, 'Super Admin', 'Administration / HR', '2026-08-30 17:00:54', 'New Hire Stage Promoted', 'New Hire Onboarding', 'New Hire', '3', 'Promoted new hire (code: NH-03) to Regular stage.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/superadmin/onboarding');
INSERT INTO `audit_logs` (`audit_log_id`, `system_user_id`, `actor_role`, `actor_department`, `occurred_at`, `action`, `module_name`, `target_type`, `target_id`, `details`, `severity`, `ip_address`, `device_info`, `url`) VALUES
(571, 1, 'Super Admin', 'Administration / HR', '2026-08-30 17:23:16', 'OTP sent', 'Authentication', 'user', 'bullseur', 'One-time password emailed to b******@oxfordsuites.com.ph', 'Info', '127.0.0.1', 'Unknown', 'http://127.0.0.1:8000/api/v1/auth/login'),
(572, 1, 'Super Admin', 'Administration / HR', '2026-08-30 17:23:20', 'User logged in', 'Authentication', 'user', 'bullseur', 'Two-factor login completed.', 'Info', '127.0.0.1', 'Unknown', 'http://127.0.0.1:8000/api/v1/auth/otp/verify'),
(573, 1, 'Super Admin', 'Administration / HR', '2026-08-30 17:24:10', 'New Hire Updated', 'New Hire Onboarding', 'New Hire', '19', 'Updated new hire record (code: NH-00017, stage: Probationary).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5199/superadmin/onboarding'),
(574, 1, 'Super Admin', 'Administration / HR', '2026-08-30 17:24:14', 'New Hire Updated', 'New Hire Onboarding', 'New Hire', '19', 'Updated new hire record (code: NH-00017, stage: Probationary).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5199/superadmin/onboarding'),
(575, 1, 'Super Admin', 'Administration / HR', '2026-08-30 17:24:15', 'New Hire Stage Promoted', 'New Hire Onboarding', 'New Hire', '19', 'Promoted new hire (code: NH-00017) to Regular stage.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5199/superadmin/onboarding'),
(576, 1, 'Super Admin', 'Administration / HR', '2026-08-30 17:24:15', 'Employee created', 'Core HCM', 'employee', '24', 'Hired ADMIN-img2 ADMIN-img2', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5199/superadmin/onboarding'),
(577, 1, 'Super Admin', 'Administration / HR', '2026-08-30 17:24:16', 'Employee Record Created', 'New Hire Onboarding', 'Employee', '24', 'Employee record EMP-0024 created for regularized hire NH-00017.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5199/superadmin/onboarding'),
(578, 1, 'Super Admin', 'Administration / HR', '2026-08-30 17:24:16', 'Employee regularized', 'New Hire Onboarding', 'Employee', '24', 'Employment type of ADMIN-img2 ADMIN-img2 set to Regular (hire NH-00017 reached the Regular stage).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5199/superadmin/onboarding'),
(579, NULL, 'System', 'System', '2026-08-30 18:00:28', 'Employee deleted', 'Core HCM', 'employee', '24', 'Hired ADMIN-img2 ADMIN-img2', 'Warning', '127.0.0.1', 'Unknown', 'http://localhost'),
(580, 1, 'Super Admin', 'Administration / HR', '2026-08-30 19:10:35', 'OTP sent', 'Authentication', 'user', 'bullseur', 'One-time password emailed to b******@oxfordsuites.com.ph', 'Info', '127.0.0.1', 'Unknown', 'http://127.0.0.1:8000/api/v1/auth/login'),
(581, 1, 'Super Admin', 'Administration / HR', '2026-08-30 19:10:39', 'User logged in', 'Authentication', 'user', 'bullseur', 'Two-factor login completed.', 'Info', '127.0.0.1', 'Unknown', 'http://127.0.0.1:8000/api/v1/auth/otp/verify'),
(582, 1, 'Super Admin', 'Administration / HR', '2026-08-30 19:12:40', 'Screening Configuration Saved', 'Applicant Management', 'Screening Configuration', 'screening.configuration', 'Criteria weights saved (Skills 70%, Experience 30%, Education off%, Certifications off%) — passing score 50%, coverage minimum 60%%.', 'Info', '127.0.0.1', 'Unknown', 'http://127.0.0.1:8000/api/v1/screening/configuration'),
(583, 1, 'Super Admin', 'Administration / HR', '2026-08-30 19:14:29', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '16', 'Preview screening scored 80.4% with status PERFECT_FOR_THE_JOB.', 'Info', '127.0.0.1', 'Unknown', 'http://127.0.0.1:8000/api/v1/applicants/screen-resume'),
(584, 1, 'Super Admin', 'Administration / HR', '2026-08-30 19:14:44', 'Screening Configuration Saved', 'Applicant Management', 'Screening Configuration', 'screening.configuration', 'Criteria weights saved (Skills 40%, Experience 30%, Education 20%, Certifications 10%) — passing score 75%, coverage minimum 60%%.', 'Info', '127.0.0.1', 'Unknown', 'http://127.0.0.1:8000/api/v1/screening/configuration'),
(585, 1, 'Super Admin', 'Administration / HR', '2026-08-30 19:14:45', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '16', 'Preview screening scored 88.8% with status PERFECT_FOR_THE_JOB.', 'Info', '127.0.0.1', 'Unknown', 'http://127.0.0.1:8000/api/v1/applicants/screen-resume'),
(586, 1, 'Super Admin', 'Administration / HR', '2026-08-30 19:17:00', 'Screening Configuration Saved', 'Applicant Management', 'Screening Configuration', 'screening.configuration', 'Criteria weights saved (Skills 40%, Experience 30%, Education 20%, Certifications 10%) — passing score 60%, coverage minimum 60%%.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5199/superadmin/recruitment'),
(587, 1, 'Super Admin', 'Administration / HR', '2026-08-30 19:18:12', 'Screening Configuration Saved', 'Applicant Management', 'Screening Configuration', 'screening.configuration', 'Criteria weights saved (Skills 40%, Experience 30%, Education 20%, Certifications 10%) — passing score 75%, coverage minimum 60%%.', 'Info', '127.0.0.1', 'Unknown', 'http://127.0.0.1:8000/api/v1/screening/configuration'),
(588, 1, 'Super Admin', 'Administration / HR', '2026-08-30 19:48:36', 'OTP sent', 'Authentication', 'user', 'bullseur', 'One-time password emailed to b******@oxfordsuites.com.ph', 'Info', '127.0.0.1', 'Unknown', 'http://127.0.0.1:8000/api/v1/auth/login'),
(589, 1, 'Super Admin', 'Administration / HR', '2026-08-30 19:48:40', 'User logged in', 'Authentication', 'user', 'bullseur', 'Two-factor login completed.', 'Info', '127.0.0.1', 'Unknown', 'http://127.0.0.1:8000/api/v1/auth/otp/verify'),
(590, 1, 'Super Admin', 'Administration / HR', '2026-08-30 19:54:51', 'Screening Configuration Saved', 'Applicant Management', 'Screening Configuration', 'screening.configuration', 'Criteria weights saved (Skills 40%, Experience 30%, Education 20%, Certifications 10%) — passing score 85%, coverage minimum 60%%.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5199/superadmin/recruitment'),
(591, 1, 'Super Admin', 'Administration / HR', '2026-08-30 19:55:26', 'Screening Configuration Saved', 'Applicant Management', 'Screening Configuration', 'screening.configuration', 'Criteria weights saved (Skills 40%, Experience 30%, Education 20%, Certifications 10%) — passing score 75%, coverage minimum 60%%.', 'Info', '127.0.0.1', 'Unknown', 'http://127.0.0.1:8000/api/v1/screening/configuration'),
(592, 1, 'Super Admin', 'Administration / HR', '2026-08-30 20:23:45', 'Reference Data Added', 'Applicant Management', 'Screening Reference Data', '84', 'Added skill \'VIP Handling\' to the spaCy screening vocabulary.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/superadmin/recruitment'),
(593, 1, 'Super Admin', 'Administration / HR', '2026-08-30 20:23:46', 'Reference Data Added', 'Applicant Management', 'Screening Reference Data', '85', 'Added skill \'BS Tourism\' to the spaCy screening vocabulary.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/superadmin/recruitment'),
(594, 1, 'Super Admin', 'Administration / HR', '2026-08-30 20:23:46', 'Reference Data Added', 'Applicant Management', 'Screening Reference Data', '86', 'Added skill \'Multilingual\' to the spaCy screening vocabulary.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/superadmin/recruitment'),
(595, 1, 'Super Admin', 'Administration / HR', '2026-08-30 20:24:04', 'Reference Data Added', 'Applicant Management', 'Screening Reference Data', '87', 'Added skill \'Inventory\' to the spaCy screening vocabulary.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/superadmin/recruitment'),
(596, 1, 'Super Admin', 'Administration / HR', '2026-08-30 20:24:04', 'Reference Data Added', 'Applicant Management', 'Screening Reference Data', '88', 'Added skill \'Bar Hygiene\' to the spaCy screening vocabulary.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/superadmin/recruitment'),
(597, 1, 'Super Admin', 'Administration / HR', '2026-08-30 20:24:10', 'Reference Data Added', 'Applicant Management', 'Screening Reference Data', '89', 'Added skill \'try\' to the spaCy screening vocabulary.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/superadmin/recruitment'),
(598, 1, 'Super Admin', 'Administration / HR', '2026-08-30 20:28:19', 'OTP sent', 'Authentication', 'user', 'bullseur', 'One-time password emailed to b******@oxfordsuites.com.ph', 'Info', '127.0.0.1', 'Unknown', 'http://127.0.0.1:8000/api/v1/auth/login'),
(599, 1, 'Super Admin', 'Administration / HR', '2026-08-30 20:28:23', 'User logged in', 'Authentication', 'user', 'bullseur', 'Two-factor login completed.', 'Info', '127.0.0.1', 'Unknown', 'http://127.0.0.1:8000/api/v1/auth/otp/verify'),
(600, 1, 'Super Admin', 'Administration / HR', '2026-08-30 20:29:13', 'Reference Data Deleted', 'Applicant Management', 'Screening Reference Data', '89', 'Deleted screening reference \'skill:try\'.', 'Warning', '127.0.0.1', 'Chrome', 'http://localhost:5173/superadmin/recruitment'),
(601, 1, 'Super Admin', 'Administration / HR', '2026-08-30 20:30:27', 'Reference Data Added', 'Applicant Management', 'Screening Reference Data', '90', 'Added skill \'BS Psychology\' to the spaCy screening vocabulary.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5199/superadmin/recruitment'),
(602, 1, 'Super Admin', 'Administration / HR', '2026-08-30 20:57:58', 'Reference Data Added', 'Applicant Management', 'Screening Reference Data', '91', 'Added certification \'Food Handler\' to the spaCy screening vocabulary.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5199/superadmin/recruitment'),
(603, 1, 'Super Admin', 'Administration / HR', '2026-08-30 20:58:03', 'Reference Data Added', 'Applicant Management', 'Screening Reference Data', '92', 'Added skill \'Opera Cloud PMS\' to the spaCy screening vocabulary.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5199/superadmin/recruitment'),
(604, 3, 'Admin', 'Front Office', '2026-08-31 10:42:06', 'User logged in', 'Authentication', 'user', 'aramos', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/login'),
(605, 3, 'Admin', 'Front Office', '2026-08-31 11:26:01', 'Applicant Stage Changed to Accepted', 'Applicant Management', 'Applicant', '46', 'Stage changed from Screened to Accepted for Vincent Paul Soriano (Front Desk Receptionist).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/applicants'),
(606, 3, 'Admin', 'Front Office', '2026-08-31 11:30:08', 'Applicant Stage Changed to Accepted', 'Applicant Management', 'Applicant', '45', 'Stage changed from Screened to Accepted for ALYSSA MARIE (Front Desk Receptionist).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/applicants'),
(607, 3, 'Admin', 'Front Office', '2026-08-31 11:30:34', 'Interview Booked', 'Applicant Management', 'Interview', '21', 'Scheduled interview for ALYSSA MARIE on 2026-09-01 00:00:00 at 08:00 (On-site).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/applicants'),
(608, 3, 'Admin', 'Front Office', '2026-08-31 11:32:46', 'Interview Updated / Rescheduled', 'Applicant Management', 'Interview', '21', 'Updated interview for ALYSSA MARIE on 2026-09-02 00:00:00 at 08:00 (Scheduled).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/applicants'),
(609, 3, 'Admin', 'Front Office', '2026-08-31 11:33:23', 'Interview Cancelled', 'Applicant Management', 'Interview', '21', 'Cancelled interview for ALYSSA MARIE scheduled on 2026-09-02 00:00:00 08:00:00.', 'Warning', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/applicants'),
(610, 3, 'Admin', 'Front Office', '2026-08-31 11:33:36', 'Applicant Stage Changed to Accepted', 'Applicant Management', 'Applicant', '53', 'Stage changed from Interview Scheduled to Accepted for ALYSSA MARIE (HR Assistant).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/applicants'),
(611, 3, 'Admin', 'Front Office', '2026-08-31 11:33:56', 'Interview Booked', 'Applicant Management', 'Interview', '22', 'Scheduled interview for ALYSSA MARIE on 2026-09-01 00:00:00 at 08:00 (On-site).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/applicants'),
(612, 3, 'Admin', 'Front Office', '2026-08-31 11:34:13', 'Applicant Stage Changed to Accepted', 'Applicant Management', 'Applicant', '53', 'Stage changed from Interview Scheduled to Accepted for ALYSSA MARIE (HR Assistant).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/applicants'),
(613, 3, 'Admin', 'Front Office', '2026-08-31 11:40:25', 'Interview Booked', 'Applicant Management', 'Interview', '23', 'Scheduled interview for Vincent Paul Soriano on 2026-09-29 00:00:00 at 08:00 (On-site).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/applicants'),
(614, 3, 'Admin', 'Front Office', '2026-08-31 11:43:29', 'Interview Updated / Rescheduled', 'Applicant Management', 'Interview', '23', 'Updated interview for Vincent Paul Soriano on 2026-09-25 00:00:00 at 08:00 (Scheduled).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/applicants'),
(615, 3, 'Admin', 'Front Office', '2026-08-31 11:47:00', 'Interview Updated / Rescheduled', 'Applicant Management', 'Interview', '23', 'Updated interview for Vincent Paul Soriano on 2026-09-22 00:00:00 at 08:00 (Scheduled).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/applicants'),
(616, 3, 'Admin', 'Front Office', '2026-08-31 11:47:32', 'Interview Cancelled', 'Applicant Management', 'Interview', '23', 'Cancelled interview for Vincent Paul Soriano scheduled on 2026-09-22 00:00:00 08:00:00.', 'Warning', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/applicants'),
(617, 3, 'Admin', 'Front Office', '2026-08-31 11:49:35', 'Applicant Stage Changed to Accepted', 'Applicant Management', 'Applicant', '42', 'Stage changed from Screened to Accepted for Vincent Paul Soriano (Front Desk Receptionist).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/applicants'),
(618, 3, 'Admin', 'Front Office', '2026-08-31 11:50:12', 'Interview Booked', 'Applicant Management', 'Interview', '24', 'Scheduled interview for Vincent Paul Soriano on 2026-09-01 00:00:00 at 08:00 (On-site).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/applicants'),
(619, 3, 'Admin', 'Front Office', '2026-08-31 11:50:25', 'Interview Cancelled', 'Applicant Management', 'Interview', '24', 'Cancelled interview for Vincent Paul Soriano scheduled on 2026-09-01 00:00:00 08:00:00.', 'Warning', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/applicants'),
(620, 3, 'Admin', 'Front Office', '2026-08-31 11:58:23', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '3', 'Preview screening scored 72% with status NOT_FITTED_TO_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/recruitment'),
(621, 3, 'Admin', 'Front Office', '2026-08-31 11:58:32', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '3', 'Preview screening scored 72% with status NOT_FITTED_TO_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/recruitment'),
(622, 3, 'Admin', 'Front Office', '2026-08-31 11:58:33', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '3', 'Preview screening scored 72% with status NOT_FITTED_TO_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/recruitment'),
(623, 3, 'Admin', 'Front Office', '2026-08-31 11:58:34', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '3', 'Preview screening scored 72% with status NOT_FITTED_TO_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/recruitment'),
(624, 3, 'Admin', 'Front Office', '2026-08-31 11:59:06', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '3', 'Preview screening scored 72% with status NOT_FITTED_TO_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/recruitment'),
(625, 3, 'Admin', 'Front Office', '2026-08-31 11:59:32', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '3', 'Preview screening scored 81.33% with status NOT_FITTED_TO_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/recruitment'),
(626, 3, 'Admin', 'Front Office', '2026-08-31 11:59:44', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '3', 'Preview screening scored 72% with status NOT_FITTED_TO_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/recruitment'),
(627, 3, 'Admin', 'Front Office', '2026-08-31 11:59:55', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '3', 'Preview screening scored 81.33% with status NOT_FITTED_TO_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/recruitment'),
(628, 3, 'Admin', 'Front Office', '2026-08-31 12:01:10', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '3', 'Preview screening scored 81.33% with status NOT_FITTED_TO_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/recruitment'),
(629, 3, 'Admin', 'Front Office', '2026-08-31 12:11:09', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '3', 'Preview screening scored 81.33% with status NOT_FITTED_TO_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/recruitment'),
(630, 3, 'Admin', 'Front Office', '2026-08-31 12:13:16', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '3', 'Preview screening scored 62% with status NOT_FITTED_TO_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/recruitment'),
(631, 3, 'Admin', 'Front Office', '2026-08-31 12:14:05', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '3', 'Preview screening scored 81.33% with status NOT_FITTED_TO_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/recruitment'),
(632, 3, 'Admin', 'Front Office', '2026-08-31 12:14:23', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '3', 'Preview screening scored 81.33% with status NOT_FITTED_TO_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/recruitment'),
(633, 3, 'Admin', 'Front Office', '2026-08-31 12:15:28', 'Applicant Screened', 'Applicant Management', 'Applicant', '54', 'spaCy screening for Adrian Paolo Mercado: Not Fitted to Job (81.33%), processing status PARTIALLY_PROCESSED.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/recruitment'),
(634, 3, 'Admin', 'Front Office', '2026-08-31 12:15:28', 'Applicant Created', 'Applicant Management', 'Applicant', '54', 'Added new applicant Adrian Paolo Mercado for position ID 3.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/recruitment'),
(635, 3, 'Admin', 'Front Office', '2026-08-31 12:17:28', 'Applicant Stage Changed to Accepted', 'Applicant Management', 'Applicant', '54', 'Stage changed from Screened to Accepted for Adrian Paolo Mercado (Housekeeping Attendant).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/applicants'),
(636, 3, 'Admin', 'Front Office', '2026-08-31 12:17:36', 'Interview Booked', 'Applicant Management', 'Interview', '25', 'Scheduled interview for Adrian Paolo Mercado on 2026-09-10 00:00:00 at 08:00 (On-site).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/applicants'),
(637, 3, 'Admin', 'Front Office', '2026-08-31 12:18:11', 'Interview Cancelled', 'Applicant Management', 'Interview', '25', 'Cancelled interview for Adrian Paolo Mercado scheduled on 2026-09-10 00:00:00 08:00:00.', 'Warning', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/applicants'),
(638, 3, 'Admin', 'Front Office', '2026-08-31 12:21:19', 'Interview Updated / Rescheduled', 'Applicant Management', 'Interview', '15', 'Updated interview for ADMIN-file1 on 2026-09-01 00:00:00 at 08:00 (Scheduled).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/applicants'),
(639, 3, 'Admin', 'Front Office', '2026-08-31 12:22:13', 'Interview Updated / Rescheduled', 'Applicant Management', 'Interview', '2', 'Updated interview for Juan De La Cruz on 2026-09-21 00:00:00 at 01:30 (Scheduled).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/applicants'),
(640, 3, 'Admin', 'Front Office', '2026-08-31 12:22:30', 'Interview Updated / Rescheduled', 'Applicant Management', 'Interview', '2', 'Updated interview for Juan De La Cruz on 2026-09-01 00:00:00 at 01:30 (Scheduled).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/applicants'),
(641, 3, 'Admin', 'Front Office', '2026-08-31 12:22:43', 'Interview Cancelled', 'Applicant Management', 'Interview', '2', 'Cancelled interview for Juan De La Cruz scheduled on 2026-09-01 00:00:00 01:30:00.', 'Warning', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/applicants'),
(642, 3, 'Admin', 'Front Office', '2026-08-31 12:45:05', 'Interview Booked', 'Applicant Management', 'Interview', '26', 'Scheduled interview for Vincent Paul Soriano on 2026-09-01 00:00:00 at 08:00 (On-site).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/applicants'),
(643, 3, 'Admin', 'Front Office', '2026-08-31 12:47:29', 'Interview Assessment Completed', 'Applicant Management', 'Assessment', '11', 'Recorded assessment for Vincent Paul Soriano with total score 84.00% and outcome Recommended.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/applicants'),
(644, 3, 'Admin', 'Front Office', '2026-08-31 12:52:38', 'Applicant Advanced to Offer', 'Applicant Management', 'Applicant', '46', 'Advanced Vincent Paul Soriano to Offer for Front Desk Receptionist.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/applicants'),
(645, 3, 'Admin', 'Front Office', '2026-08-31 12:52:45', 'New Hire Created', 'New Hire Onboarding', 'New Hire', '22', 'Created new hire record (code: NH-00019).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/onboarding'),
(646, 3, 'Admin', 'Front Office', '2026-08-31 12:54:41', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '2', 'Preview screening scored 89.4% with status PERFECT_FOR_THE_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/recruitment'),
(647, 3, 'Admin', 'Front Office', '2026-08-31 12:55:01', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '2', 'Preview screening scored 89.4% with status PERFECT_FOR_THE_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/recruitment'),
(648, 3, 'Admin', 'Front Office', '2026-08-31 12:55:15', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '2', 'Preview screening scored 89.4% with status PERFECT_FOR_THE_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/recruitment'),
(649, 3, 'Admin', 'Front Office', '2026-08-31 12:55:35', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '2', 'Preview screening scored 89.4% with status PERFECT_FOR_THE_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/recruitment'),
(650, 3, 'Admin', 'Front Office', '2026-08-31 12:56:05', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '2', 'Preview screening scored 89.4% with status PERFECT_FOR_THE_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/recruitment'),
(651, 3, 'Admin', 'Front Office', '2026-08-31 12:56:08', 'Applicant Screened', 'Applicant Management', 'Applicant', '55', 'spaCy screening for CARLO MIGUEL FERNAN: Perfect for the Job (89.40%), processing status PARTIALLY_PROCESSED.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/recruitment'),
(652, 3, 'Admin', 'Front Office', '2026-08-31 12:56:08', 'Applicant Created', 'Applicant Management', 'Applicant', '55', 'Added new applicant CARLO MIGUEL FERNAN for position ID 2.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/recruitment'),
(653, 3, 'Admin', 'Front Office', '2026-08-31 12:56:46', 'Applicant Referred to New Position', 'Applicant Management', 'Applicant', '55', 'Referred CARLO MIGUEL FERNAN to new position Restaurant Server.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/applicants'),
(654, 3, 'Admin', 'Front Office', '2026-08-31 12:56:53', 'Applicant Referred to New Position', 'Applicant Management', 'Applicant', '55', 'Referred CARLO MIGUEL FERNAN to new position Line Cook.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/applicants'),
(655, 3, 'Admin', 'Front Office', '2026-08-31 12:57:10', 'Applicant Stage Changed to Accepted', 'Applicant Management', 'Applicant', '55', 'Stage changed from Screened to Accepted for CARLO MIGUEL FERNAN (Line Cook).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/applicants'),
(656, 3, 'Admin', 'Front Office', '2026-08-31 12:57:21', 'Interview Booked', 'Applicant Management', 'Interview', '27', 'Scheduled interview for CARLO MIGUEL FERNAN on 2026-09-01 00:00:00 at 08:00 (On-site).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/applicants'),
(657, 3, 'Admin', 'Front Office', '2026-08-31 12:57:38', 'Interview Assessment Completed', 'Applicant Management', 'Assessment', '12', 'Recorded assessment for CARLO MIGUEL FERNAN with total score 80.00% and outcome Recommended.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/applicants'),
(658, 3, 'Admin', 'Front Office', '2026-08-31 12:58:44', 'Applicant Advanced to Offer', 'Applicant Management', 'Applicant', '55', 'Advanced CARLO MIGUEL FERNAN to Offer for Line Cook.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/applicants'),
(659, 3, 'Admin', 'Front Office', '2026-08-31 12:58:49', 'New Hire Created', 'New Hire Onboarding', 'New Hire', '23', 'Created new hire record (code: NH-00020).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/onboarding'),
(660, 3, 'Admin', 'Front Office', '2026-08-31 12:59:04', 'Checklist Template Updated', 'New Hire Onboarding', 'Checklist Template', '8', 'Updated onboarding checklist template \'PROSs\' (status: Inactive).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/onboarding'),
(661, 3, 'Admin', 'Front Office', '2026-08-31 12:59:07', 'Checklist Template Updated', 'New Hire Onboarding', 'Checklist Template', '9', 'Updated onboarding checklist template \'PRESs\' (status: Active).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/onboarding'),
(662, 3, 'Admin', 'Front Office', '2026-08-31 13:33:27', 'Interview Cancelled', 'Applicant Management', 'Interview', '19', 'Cancelled interview for bcbc scheduled on 2026-08-19 00:00:00 08:00:00.', 'Warning', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/applicants'),
(663, 3, 'Admin', 'Front Office', '2026-08-31 13:34:11', 'Interview Updated / Rescheduled', 'Applicant Management', 'Interview', '13', 'Updated interview for juan on 2026-09-01 00:00:00 at 08:00 (Scheduled).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/applicants'),
(664, 3, 'Admin', 'Front Office', '2026-08-31 13:34:35', 'Interview Assessment Completed', 'Applicant Management', 'Assessment', '13', 'Recorded assessment for juan with total score 80.00% and outcome Recommended.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/applicants'),
(665, 3, 'Admin', 'Front Office', '2026-08-31 13:35:10', 'Applicant Stage Changed to Rejected', 'Applicant Management', 'Applicant', '15', 'Stage changed from Assessed to Rejected for juan (Bartender).', 'Warning', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/applicants'),
(666, 3, 'Admin', 'Front Office', '2026-08-31 13:38:28', 'Applicant Stage Changed to Rejected', 'Applicant Management', 'Applicant', '34', 'Stage changed from Screened to Rejected for MARIA ANGELA SANTOS (Front Desk Receptionist).', 'Warning', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/applicants'),
(667, 3, 'Admin', 'Front Office', '2026-08-31 13:38:50', 'Applicant Stage Changed to Rejected', 'Applicant Management', 'Applicant', '44', 'Stage changed from Screened to Rejected for Bianca Louise Garcia (Front Desk Receptionist).', 'Warning', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/applicants'),
(668, 3, 'Admin', 'Front Office', '2026-08-31 15:41:38', 'Applicant Stage Changed to Accepted', 'Applicant Management', 'Applicant', '47', 'Stage changed from Screened to Accepted for Test Applicant (Front Desk Receptionist).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/applicants'),
(669, 3, 'Admin', 'Front Office', '2026-08-31 16:09:06', 'Interview Cancelled', 'Applicant Management', 'Interview', '15', 'Cancelled interview for ADMIN-file1 scheduled on 2026-09-01 00:00:00 08:00:00.', 'Warning', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/applicants'),
(670, 3, 'Admin', 'Front Office', '2026-08-31 16:26:18', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '15', 'Preview screening scored 72% with status FIT_FOR_OTHER_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/recruitment'),
(671, 3, 'Admin', 'Front Office', '2026-08-31 16:26:36', 'Applicant Screened', 'Applicant Management', 'Applicant', '56', 'spaCy screening for CARLO MIGUEL FERNANDEZ: Fit for Other Job (72.00%), processing status PARTIALLY_PROCESSED.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/recruitment'),
(672, 3, 'Admin', 'Front Office', '2026-08-31 16:26:36', 'Applicant Created', 'Applicant Management', 'Applicant', '56', 'Added new applicant CARLO MIGUEL FERNANDEZ for position ID 15.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/recruitment'),
(673, 3, 'Admin', 'Front Office', '2026-08-31 16:27:14', 'Applicant Stage Changed to Rejected', 'Applicant Management', 'Applicant', '56', 'Stage changed from Screened to Rejected for CARLO MIGUEL FERNANDEZ (Guest Relations Officer).', 'Warning', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/applicants'),
(674, 1, 'Super Admin', 'Administration / HR', '2026-08-31 17:53:58', 'OTP sent', 'Authentication', 'user', 'bullseur', 'One-time password emailed to b******@oxfordsuites.com.ph', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5174/login'),
(675, 1, 'Super Admin', 'Administration / HR', '2026-08-31 17:55:37', 'User logged in', 'Authentication', 'user', 'bullseur', 'Two-factor login completed.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5174/otp'),
(676, 3, 'Admin', 'Front Office', '2026-09-01 17:44:29', 'User logged in', 'Authentication', 'user', 'aramos', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/login'),
(677, 3, 'Admin', 'Front Office', '2026-09-01 18:14:11', 'User logged out', 'Authentication', 'user', 'aramos', 'Session token revoked.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/applicants'),
(678, 3, 'Admin', 'Front Office', '2026-09-01 18:17:17', 'User logged in', 'Authentication', 'user', 'aramos', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/login'),
(679, 3, 'Admin', 'Front Office', '2026-09-01 18:18:49', 'User logged out', 'Authentication', 'user', 'aramos', 'Session token revoked.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/applicants'),
(680, 3, 'Admin', 'Front Office', '2026-09-01 18:32:55', 'User logged in', 'Authentication', 'user', 'aramos', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/login'),
(681, 3, 'Admin', 'Front Office', '2026-09-01 18:36:16', 'User logged out', 'Authentication', 'user', 'aramos', 'Session token revoked.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/recruitment'),
(682, 3, 'Admin', 'Front Office', '2026-09-01 18:36:24', 'User logged in', 'Authentication', 'user', 'aramos', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/login'),
(683, 3, 'Admin', 'Front Office', '2026-09-01 18:42:01', 'User logged out', 'Authentication', 'user', 'aramos', 'Session token revoked.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/settings'),
(684, 3, 'Admin', 'Front Office', '2026-09-01 19:02:04', 'User logged in', 'Authentication', 'user', 'aramos', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/login'),
(685, 3, 'Admin', 'Front Office', '2026-09-01 20:37:00', 'User logged out', 'Authentication', 'user', 'aramos', 'Session token revoked.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/profile'),
(686, 3, 'Admin', 'Front Office', '2026-09-01 20:37:05', 'User logged in', 'Authentication', 'user', 'aramos', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/login'),
(687, 3, 'Admin', 'Front Office', '2026-09-01 21:00:36', 'User logged out', 'Authentication', 'user', 'aramos', 'Session token revoked.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/recruitment'),
(688, 3, 'Admin', 'Front Office', '2026-09-01 21:04:47', 'User logged in', 'Authentication', 'user', 'aramos', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/login'),
(689, 3, 'Admin', 'Front Office', '2026-09-01 21:18:16', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '15', 'Preview screening scored 72% with status FIT_FOR_OTHER_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/recruitment'),
(690, 3, 'Admin', 'Front Office', '2026-09-01 21:54:36', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '15', 'Preview screening scored 72% with status FIT_FOR_OTHER_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/recruitment'),
(691, 3, 'Admin', 'Front Office', '2026-09-01 21:54:41', 'Applicant Screened', 'Applicant Management', 'Applicant', '57', 'spaCy screening for NATHANIEL JAMES MERCADO: Fit for Other Job (72.00%), processing status PROCESSED.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/recruitment'),
(692, 3, 'Admin', 'Front Office', '2026-09-01 21:54:41', 'Applicant Created', 'Applicant Management', 'Applicant', '57', 'Added new applicant NATHANIEL JAMES MERCADO for position ID 15.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/recruitment'),
(693, 3, 'Admin', 'Front Office', '2026-09-01 21:55:33', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '15', 'Preview screening scored 86% with status FIT_FOR_OTHER_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/recruitment'),
(694, 3, 'Admin', 'Front Office', '2026-09-01 22:06:00', 'User logged out', 'Authentication', 'user', 'aramos', 'Session token revoked.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/settings#security'),
(695, 3, 'Admin', 'Front Office', '2026-09-01 22:08:30', 'User logged in', 'Authentication', 'user', 'aramos', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/login'),
(696, 3, 'Admin', 'Front Office', '2026-09-01 22:18:42', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '15', 'Preview screening scored 86% with status FIT_FOR_OTHER_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/recruitment'),
(697, 3, 'Admin', 'Front Office', '2026-09-01 22:19:37', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '15', 'Preview screening scored 86% with status FIT_FOR_OTHER_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/recruitment'),
(698, 3, 'Admin', 'Front Office', '2026-09-01 22:19:43', 'Applicant Screened', 'Applicant Management', 'Applicant', '58', 'spaCy screening for Bianca Nicole Castillo: Fit for Other Job (86.00%), processing status PARTIALLY_PROCESSED.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/recruitment'),
(699, 3, 'Admin', 'Front Office', '2026-09-01 22:19:43', 'Applicant Created', 'Applicant Management', 'Applicant', '58', 'Added new applicant Bianca Nicole Castillo for position ID 15.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/recruitment'),
(700, 3, 'Admin', 'Front Office', '2026-09-01 22:21:10', 'Applicant Stage Changed to Accepted', 'Applicant Management', 'Applicant', '58', 'Stage changed from Screened to Accepted for Bianca Nicole Castillo (Guest Relations Officer).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/applicants'),
(701, 3, 'Admin', 'Front Office', '2026-09-01 22:21:20', 'Interview Booked', 'Applicant Management', 'Interview', '28', 'Scheduled interview for Bianca Nicole Castillo on 2026-09-24 00:00:00 at 08:00 (On-site).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/applicants'),
(702, 3, 'Admin', 'Front Office', '2026-09-01 22:23:15', 'Interview Updated / Rescheduled', 'Applicant Management', 'Interview', '28', 'Updated interview for Bianca Nicole Castillo on 2026-09-01 00:00:00 at 08:00 (Scheduled).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/applicants'),
(703, 3, 'Admin', 'Front Office', '2026-09-01 22:27:42', 'Job Post Created', 'Recruitment Management', 'Job Post', '18', 'Created job post \'Floor Supervisor\'.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/recruitment'),
(704, 3, 'Admin', 'Front Office', '2026-09-01 23:57:56', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '16', 'Preview screening scored 88.8% with status PERFECT_FOR_THE_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/recruitment'),
(705, 3, 'Admin', 'Front Office', '2026-09-01 23:59:28', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '16', 'Preview screening scored 100% with status PERFECT_FOR_THE_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/recruitment'),
(706, 3, 'Admin', 'Front Office', '2026-09-02 00:04:02', 'Interview Updated / Rescheduled', 'Applicant Management', 'Interview', '1', 'Updated interview for Bianca Soriano on 2026-09-02 00:00:00 at 09:00 (Scheduled).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/applicants'),
(707, 3, 'Admin', 'Front Office', '2026-09-02 00:04:02', 'Interview Assessment Completed', 'Applicant Management', 'Assessment', '14', 'Recorded assessment for Bianca Soriano with total score 80.00% and outcome Recommended.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/applicants'),
(708, 3, 'Admin', 'Front Office', '2026-09-02 00:04:13', 'Applicant Advanced to Offer', 'Applicant Management', 'Applicant', '10', 'Advanced Bianca Soriano to Offer for Bartender.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/applicants'),
(709, 3, 'Admin', 'Front Office', '2026-09-02 00:04:20', 'New Hire Created', 'New Hire Onboarding', 'New Hire', '24', 'Created new hire record (code: NH-00021).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/onboarding'),
(710, 3, 'Admin', 'Front Office', '2026-09-02 00:05:03', 'Resume Screening Preview', 'Applicant Management', 'Job Post', '16', 'Preview screening scored 77.6% with status NOT_FITTED_TO_JOB.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/recruitment'),
(711, 3, 'Admin', 'Front Office', '2026-09-02 00:05:05', 'Applicant Screened', 'Applicant Management', 'Applicant', '59', 'spaCy screening for Camille Rose Evangelista: Not Fitted to Job (77.60%), processing status PARTIALLY_PROCESSED.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/recruitment'),
(712, 3, 'Admin', 'Front Office', '2026-09-02 00:05:05', 'Applicant Created', 'Applicant Management', 'Applicant', '59', 'Added new applicant Camille Rose Evangelista for position ID 16.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/recruitment'),
(713, 3, 'Admin', 'Front Office', '2026-09-02 00:05:16', 'Applicant Stage Changed to Accepted', 'Applicant Management', 'Applicant', '59', 'Stage changed from Screened to Accepted for Camille Rose Evangelista (Front Desk Receptionist).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/applicants'),
(714, 3, 'Admin', 'Front Office', '2026-09-02 00:05:22', 'Interview Booked', 'Applicant Management', 'Interview', '29', 'Scheduled interview for Camille Rose Evangelista on 2026-09-02 00:00:00 at 08:00 (On-site).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/applicants'),
(715, 3, 'Admin', 'Front Office', '2026-09-02 00:05:27', 'Interview Assessment Completed', 'Applicant Management', 'Assessment', '15', 'Recorded assessment for Camille Rose Evangelista with total score 80.00% and outcome Recommended.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/applicants'),
(716, 3, 'Admin', 'Front Office', '2026-09-02 00:05:29', 'Applicant Advanced to Offer', 'Applicant Management', 'Applicant', '59', 'Advanced Camille Rose Evangelista to Offer for Front Desk Receptionist.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/applicants'),
(717, 3, 'Admin', 'Front Office', '2026-09-02 00:05:36', 'New Hire Created', 'New Hire Onboarding', 'New Hire', '25', 'Created new hire record (code: NH-00022).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/onboarding'),
(718, 3, 'Admin', 'Front Office', '2026-09-02 00:06:21', 'Onboarding Item Toggled', 'New Hire Onboarding', 'Onboarding Item', '337', 'Completed onboarding item \'PRESPRES\' (new hire #25).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/onboarding'),
(719, 3, 'Admin', 'Front Office', '2026-09-02 00:06:23', 'Onboarding Item Toggled', 'New Hire Onboarding', 'Onboarding Item', '337', 'Reopened onboarding item \'PRESPRES\' (new hire #25).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/onboarding'),
(720, 3, 'Admin', 'Front Office', '2026-09-02 00:06:23', 'Onboarding Item Toggled', 'New Hire Onboarding', 'Onboarding Item', '337', 'Completed onboarding item \'PRESPRES\' (new hire #25).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/onboarding'),
(721, 3, 'Admin', 'Front Office', '2026-09-02 00:06:48', 'New Hire Updated', 'New Hire Onboarding', 'New Hire', '25', 'Updated new hire record (code: NH-00022, stage: Pre-onboarding).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/onboarding'),
(722, 3, 'Admin', 'Front Office', '2026-09-02 00:06:48', 'New Hire Stage Promoted', 'New Hire Onboarding', 'New Hire', '25', 'Promoted new hire (code: NH-00022) to Probationary stage.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/onboarding'),
(723, 3, 'Admin', 'Front Office', '2026-09-02 00:10:18', 'User logged out', 'Authentication', 'user', 'aramos', 'Session token revoked.', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/admin/applicants'),
(724, 1, 'Super Admin', 'Administration / HR', '2026-09-02 00:10:34', 'OTP sent', 'Authentication', 'user', 'bullseur', 'One-time password emailed to b******@oxfordsuites.com.ph', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/login'),
(725, 3, 'Admin', 'Front Office', '2026-09-02 00:11:47', 'User logged in', 'Authentication', 'user', 'aramos', 'Signed in with email and password (OTP disabled for role).', 'Info', '127.0.0.1', 'Chrome', 'http://localhost:5173/login');

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
('oxford-suites-hrms-cache-5c785c036466adea360111aa28563bfd556b5fba', 'i:1;', 1788336766),
('oxford-suites-hrms-cache-5c785c036466adea360111aa28563bfd556b5fba:timer', 'i:1788336766;', 1788336766),
('oxford-suites-hrms-cache-auth.otp.4JdJqdO5TVJS9x2zJ1LY8g6py9JPPcpOr9TTJg5aqy14bBorlTGhM4KJ7NItYut1', 'a:4:{s:7:\"user_id\";i:2;s:9:\"code_hash\";s:64:\"53657566f8af0f173cb01ddeae2c62dd619ea7585ba1d86daec8a934cadf2746\";s:8:\"attempts\";i:0;s:10:\"expires_at\";i:1787622026;}', 1787622026),
('oxford-suites-hrms-cache-auth.otp.6f9snzZg8dIv9lHR560Q97sKDGIDgQEl7G82NevdmWEbNmDFOkJuHgWwLlCA0wSn', 'a:4:{s:7:\"user_id\";i:6;s:9:\"code_hash\";s:64:\"e1976c689957c4237cc740a21a221da5b645c595d261070869bbbdaf6bf4f292\";s:8:\"attempts\";i:0;s:10:\"expires_at\";i:1787655270;}', 1787655270),
('oxford-suites-hrms-cache-auth.otp.8iaP1hDmINIgcsMBTcaUjQHJtI7DpcWyI8VKdPik9eLiF98O9AvsFADgzoVPVUKC', 'a:4:{s:7:\"user_id\";i:4;s:9:\"code_hash\";s:64:\"068e2d178bf2573f66e45184aeb0801aed268cb0475bc81d146f44fce4927518\";s:8:\"attempts\";i:0;s:10:\"expires_at\";i:1787623405;}', 1787623405),
('oxford-suites-hrms-cache-auth.otp.9vK8oIYk5SliCHC5ajUa0Q64Dl3jtb24puNuQjVklLgwGIMEE5ConGtTyGlL4c2Q', 'a:4:{s:7:\"user_id\";i:1;s:9:\"code_hash\";s:64:\"c39a505be6d3901dc8855d6d8d686fb0d0dffd1f4d5ac75874c3490dc9eca5a2\";s:8:\"attempts\";i:0;s:10:\"expires_at\";i:1787623355;}', 1787623355),
('oxford-suites-hrms-cache-auth.otp.BClSxzjm3UKEJ39tIOrTfyL1gMo02MauVzs9XuQhNL84sXsGJjJ4FJZUC2MnvBin', 'a:4:{s:7:\"user_id\";i:1;s:9:\"code_hash\";s:64:\"8895f9ef8beba57e5d055dc4de9da88376e31e35ea4c1ce6425edbe8c1e2c39d\";s:8:\"attempts\";i:0;s:10:\"expires_at\";i:1788336929;}', 1788336929),
('oxford-suites-hrms-cache-auth.otp.gMD06oMmIThhgLhfR1NCca8AlZamnZM5li1dTcZoDpijp1PViab6kzeuHkRipUnP', 'a:4:{s:7:\"user_id\";i:1;s:9:\"code_hash\";s:64:\"4c1d77cf5e1123c03e8cbe8e01dcdeb6d4b146ca1d6c157fdf312d42713c3ea6\";s:8:\"attempts\";i:0;s:10:\"expires_at\";i:1787700588;}', 1787700588),
('oxford-suites-hrms-cache-auth.otp.guiK7gIhj3GlRJM8wyAUPMwFFLZ5fahONYq5jtPeKpOnhIj3f8361EVFHRUwwGQU', 'a:4:{s:7:\"user_id\";i:4;s:9:\"code_hash\";s:64:\"73466377af1a655cd165626359c9617e9da42cb8ea6f52850eb4bd32b75e0051\";s:8:\"attempts\";i:0;s:10:\"expires_at\";i:1787622038;}', 1787622038),
('oxford-suites-hrms-cache-auth.otp.H7NZrKqGG0RwRDtWbRQDqGrYkYV572OnSNKlNLguZTeLK8K5Yi9HNFVfGaRkAYKJ', 'a:4:{s:7:\"user_id\";i:6;s:9:\"code_hash\";s:64:\"7e9605654eb46dcd54bf4560a788a6d4d6c244970eac3f92942116fcab8dec47\";s:8:\"attempts\";i:0;s:10:\"expires_at\";i:1787626737;}', 1787626737),
('oxford-suites-hrms-cache-auth.otp.JnkNDrH7BtFSNWb2RtuWO7GdMq5fCihyaV9G4ejRN9YmN0ayJi8cP34734MHw7Z7', 'a:4:{s:7:\"user_id\";i:4;s:9:\"code_hash\";s:64:\"37bf812a18983bab5b052549d4c115c2b2ea045931056f574f47bb6472074761\";s:8:\"attempts\";i:0;s:10:\"expires_at\";i:1787653975;}', 1787653975),
('oxford-suites-hrms-cache-auth.otp.L5NAXM9awT2EhQdXvx8Be3GrHYEPfEVZ4RcRASEffY6izfIZA8i1K65KSLEYf0wV', 'a:4:{s:7:\"user_id\";i:4;s:9:\"code_hash\";s:64:\"195ce34a6ec648697ea6195ff1072ca3827128487ff2d5628246d16d361f21cc\";s:8:\"attempts\";i:0;s:10:\"expires_at\";i:1787628202;}', 1787628202),
('oxford-suites-hrms-cache-auth.otp.PjlxR4DB9sJ2tPxqSy6YtixqcwOLBCCCLnDwburfQXcw3ltPT6lyqitSF1S8G9TM', 'a:4:{s:7:\"user_id\";i:4;s:9:\"code_hash\";s:64:\"88c88250af36c301c5e528d8362a6391bdb9cdc6daf3be19beb435e85eadee14\";s:8:\"attempts\";i:0;s:10:\"expires_at\";i:1787628411;}', 1787628411),
('oxford-suites-hrms-cache-auth.otp.rtDpwBSATToJv4SVe6X88WJ082EyONDdRdu10J1P7edGcbLvY996LmadHUc96PQQ', 'a:4:{s:7:\"user_id\";i:4;s:9:\"code_hash\";s:64:\"8de97489e9dfcd64762f7fbd27089e765c5de6eb88e295ba9dfab175412cc55d\";s:8:\"attempts\";i:0;s:10:\"expires_at\";i:1787626743;}', 1787626743),
('oxford-suites-hrms-cache-auth.otp.s1LIAaPKuO1QtLRJcPc3POe2he9xvPELoNY4orpmitKXe1yaIaPoZZk2TxtNqUWB', 'a:4:{s:7:\"user_id\";i:4;s:9:\"code_hash\";s:64:\"79f05d103f47d421f19df445c538d54418caf9389cc3450b674988070da039a3\";s:8:\"attempts\";i:0;s:10:\"expires_at\";i:1787632532;}', 1787632532),
('oxford-suites-hrms-cache-auth.otp.SBUSbqSqPublOSzuzceWAcEfKO6J5bSZl77O9LiKPxwkwDcW2tbZkfAAtxGCfm92', 'a:4:{s:7:\"user_id\";i:3;s:9:\"code_hash\";s:64:\"d7719567727850ccea29b66b6c55dcb06b6315d1787ecb6b7027f22805250382\";s:8:\"attempts\";i:0;s:10:\"expires_at\";i:1787632726;}', 1787632726),
('oxford-suites-hrms-cache-auth.otp.t7XmWBMITpYSytsV9m97x1nlH7niNQX3QqWiG0VxkKtVGJZAbRKXqpEVRUjHfKC8', 'a:4:{s:7:\"user_id\";i:1;s:9:\"code_hash\";s:64:\"b3daf78feb440a5a9bd896002eda9bf2664b0312114dbe3d3b8a6a96e6c9ba26\";s:8:\"attempts\";i:0;s:10:\"expires_at\";i:1787759160;}', 1787759160),
('oxford-suites-hrms-cache-auth.otp.TBUjnEIPolSx94EZ031t9LFQ5jOWigbZTs9P35KEKCQJAaBgfCQ0LzfimzYn4zQE', 'a:4:{s:7:\"user_id\";i:2;s:9:\"code_hash\";s:64:\"4221a738fd6e8a74070b9f22deb3748db27a668b99c87d097b44c702089aa60a\";s:8:\"attempts\";i:0;s:10:\"expires_at\";i:1787741393;}', 1787741393),
('oxford-suites-hrms-cache-auth.otp.V4FWgy4f4hYet7kzmCe5EFJAvSPPr79GmKzFXEE0WsOqJZyabATgxjDEKXybZSNM', 'a:4:{s:7:\"user_id\";i:1;s:9:\"code_hash\";s:64:\"bbb8aebae62129788cd5830b1273ea421296e1494544e6226606145b88609de6\";s:8:\"attempts\";i:0;s:10:\"expires_at\";i:1787748668;}', 1787748668),
('oxford-suites-hrms-cache-auth.otp.ZO8z1SmxCsrKjS87XbZlU4BudUIeWqeFk8w5Hmp92MpkVXoCWx0qhr8SCsE9KtGd', 'a:4:{s:7:\"user_id\";i:6;s:9:\"code_hash\";s:64:\"68f81b8c6518ead2ca4c3e0a130214b2859765431639a2004737fa56eccfe104\";s:8:\"attempts\";i:0;s:10:\"expires_at\";i:1787654434;}', 1787654434),
('oxford-suites-hrms-cache-auth.otp.ZSJv9CV4KkyhytFhL6THLiPVkggcv8CFmdilCVLCDDMuZRjeNhapkDPUHJzgaSR6', 'a:4:{s:7:\"user_id\";i:1;s:9:\"code_hash\";s:64:\"b62d48179b241ce91aee2f7d049b709e5352d9e47e9e5e6e45ca7b5b8307e815\";s:8:\"attempts\";i:0;s:10:\"expires_at\";i:1787622033;}', 1787622033),
('oxford-suites-hrms-cache-screening_reference_data', 'a:3:{s:6:\"skills\";a:53:{s:19:\"Attention to Detail\";a:3:{i:0;s:19:\"attention to detail\";i:1;s:15:\"detail oriented\";i:2;s:15:\"detail-oriented\";}s:15:\"Banquet Service\";a:3:{i:0;s:15:\"banquet service\";i:1;s:18:\"banquet operations\";i:2;s:16:\"function service\";}s:11:\"Bar Hygiene\";a:0:{}s:18:\"Barista Operations\";a:3:{i:0;s:18:\"barista operations\";i:1;s:7:\"barista\";i:2;s:12:\"cafe service\";}s:10:\"BS Tourism\";a:0:{}s:15:\"Cake Decoration\";a:2:{i:0;s:15:\"cake decorating\";i:1;s:11:\"cake design\";}s:13:\"Cash Handling\";a:4:{i:0;s:13:\"cash handling\";i:1;s:10:\"cashiering\";i:2;s:7:\"billing\";i:3;s:14:\"funds handling\";}s:20:\"Check-in / Check-out\";a:5:{i:0;s:20:\"check-in / check-out\";i:1;s:18:\"check in check out\";i:2;s:8:\"check-in\";i:3;s:9:\"check-out\";i:4;s:30:\"arrival and departure handling\";}s:15:\"Chemical Safety\";a:2:{i:0;s:15:\"chemical safety\";i:1;s:26:\"cleaning chemical handling\";}s:18:\"Coffee Preparation\";a:6:{i:0;s:18:\"coffee preparation\";i:1;s:13:\"coffee making\";i:2;s:15:\"espresso making\";i:3;s:19:\"espresso extraction\";i:4;s:9:\"latte art\";i:5;s:14:\"coffee brewing\";}s:13:\"Communication\";a:4:{i:0;s:13:\"communication\";i:1;s:20:\"communication skills\";i:2;s:20:\"verbal communication\";i:3;s:21:\"written communication\";}s:18:\"Complaint Handling\";a:3:{i:0;s:18:\"complaint handling\";i:1;s:20:\"complaint resolution\";i:2;s:26:\"guest complaint management\";}s:15:\"Confidentiality\";a:3:{i:0;s:15:\"confidentiality\";i:1;s:12:\"data privacy\";i:2;s:23:\"records confidentiality\";}s:16:\"Customer Service\";a:4:{i:0;s:16:\"customer service\";i:1;s:13:\"guest service\";i:2;s:19:\"customer assistance\";i:3;s:14:\"client service\";}s:11:\"Food Safety\";a:5:{i:0;s:11:\"food safety\";i:1;s:22:\"food safety compliance\";i:2;s:12:\"food hygiene\";i:3;s:10:\"sanitation\";i:4;s:15:\"food sanitation\";}s:23:\"Front Office Operations\";a:4:{i:0;s:12:\"front office\";i:1;s:23:\"front office operations\";i:2;s:10:\"front desk\";i:3;s:20:\"reception operations\";}s:14:\"Guest Recovery\";a:1:{i:0;s:16:\"service recovery\";}s:15:\"Guest Relations\";a:3:{i:0;s:15:\"guest relations\";i:1;s:26:\"guest relations management\";i:2;s:16:\"guest engagement\";}s:5:\"HACCP\";a:3:{i:0;s:5:\"haccp\";i:1;s:16:\"haccp compliance\";i:2;s:22:\"food safety management\";}s:11:\"Hot Kitchen\";a:5:{i:0;s:11:\"hot kitchen\";i:1;s:8:\"hot line\";i:2;s:12:\"line cooking\";i:3;s:13:\"grill station\";i:4;s:13:\"saute station\";}s:16:\"Hotel Operations\";a:2:{i:0;s:16:\"hotel operations\";i:1;s:19:\"property operations\";}s:23:\"Housekeeping Operations\";a:3:{i:0;s:12:\"housekeeping\";i:1;s:23:\"housekeeping operations\";i:2;s:23:\"housekeeping procedures\";}s:9:\"Inventory\";a:0:{}s:17:\"Inventory Control\";a:4:{i:0;s:17:\"inventory control\";i:1;s:20:\"inventory management\";i:2;s:13:\"stock control\";i:3;s:11:\"stocktaking\";}s:15:\"Kitchen Hygiene\";a:1:{i:0;s:18:\"kitchen sanitation\";}s:12:\"Knife Skills\";a:2:{i:0;s:12:\"knife skills\";i:1;s:14:\"knife handling\";}s:14:\"Linen Handling\";a:3:{i:0;s:14:\"linen handling\";i:1;s:16:\"linen management\";i:2;s:18:\"laundry operations\";}s:18:\"Maintenance Basics\";a:4:{i:0;s:17:\"basic maintenance\";i:1;s:20:\"building maintenance\";i:2;s:22:\"facilities maintenance\";i:3;s:7:\"repairs\";}s:13:\"Mise en Place\";a:2:{i:0;s:13:\"mise en place\";i:1;s:13:\"mise-en-place\";}s:8:\"Mixology\";a:5:{i:0;s:8:\"mixology\";i:1;s:20:\"cocktail preparation\";i:2;s:14:\"cocktail craft\";i:3;s:12:\"drink mixing\";i:4;s:20:\"beverage preparation\";}s:9:\"MS Office\";a:6:{i:0;s:9:\"ms office\";i:1;s:16:\"microsoft office\";i:2;s:7:\"ms word\";i:3;s:8:\"ms excel\";i:4;s:5:\"excel\";i:5;s:15:\"word processing\";}s:12:\"Multilingual\";a:0:{}s:17:\"Pastry and Baking\";a:5:{i:0;s:6:\"pastry\";i:1;s:6:\"baking\";i:2;s:11:\"pastry arts\";i:3;s:19:\"dessert preparation\";i:4;s:19:\"breads and pastries\";}s:15:\"Payroll Support\";a:3:{i:0;s:15:\"payroll support\";i:1;s:18:\"payroll processing\";i:2;s:18:\"payroll assistance\";}s:7:\"Plating\";a:4:{i:0;s:7:\"plating\";i:1;s:12:\"food plating\";i:2;s:18:\"plate presentation\";i:3;s:12:\"presentation\";}s:11:\"POS Systems\";a:6:{i:0;s:11:\"pos systems\";i:1;s:3:\"pos\";i:2;s:13:\"point of sale\";i:3;s:21:\"point of sale systems\";i:4;s:6:\"micros\";i:5;s:13:\"pos operation\";}s:15:\"Problem Solving\";a:3:{i:0;s:15:\"problem solving\";i:1;s:15:\"problem-solving\";i:2;s:15:\"troubleshooting\";}s:27:\"Property Management Systems\";a:5:{i:0;s:9:\"opera pms\";i:1;s:5:\"opera\";i:2;s:26:\"property management system\";i:3;s:11:\"pms systems\";i:4;s:3:\"pms\";}s:20:\"Public Area Cleaning\";a:2:{i:0;s:20:\"public area cleaning\";i:1;s:23:\"public area maintenance\";}s:21:\"Records Documentation\";a:4:{i:0;s:9:\"201 files\";i:1;s:13:\"documentation\";i:2;s:18:\"records management\";i:3;s:15:\"file management\";}s:19:\"Recruitment Support\";a:3:{i:0;s:11:\"recruitment\";i:1;s:19:\"recruitment support\";i:2;s:22:\"sourcing and screening\";}s:12:\"Reservations\";a:3:{i:0;s:12:\"reservations\";i:1;s:22:\"reservation management\";i:2;s:18:\"booking management\";}s:27:\"Responsible Alcohol Service\";a:3:{i:0;s:27:\"responsible alcohol service\";i:1;s:30:\"responsible service of alcohol\";i:2;s:17:\"alcohol awareness\";}s:13:\"Room Turnover\";a:3:{i:0;s:13:\"room turnover\";i:1;s:13:\"room cleaning\";i:2;s:18:\"guestroom cleaning\";}s:17:\"Safety Compliance\";a:3:{i:0;s:17:\"safety compliance\";i:1;s:16:\"workplace safety\";i:2;s:17:\"safety procedures\";}s:10:\"Scheduling\";a:2:{i:0;s:16:\"shift scheduling\";i:1;s:16:\"staff scheduling\";}s:17:\"Shift Supervision\";a:1:{i:0;s:17:\"floor supervision\";}s:14:\"Staff Training\";a:3:{i:0;s:13:\"team training\";i:1;s:17:\"new hire training\";i:2;s:14:\"staff coaching\";}s:13:\"Table Service\";a:4:{i:0;s:13:\"table service\";i:1;s:12:\"food service\";i:2;s:16:\"service sequence\";i:3;s:19:\"dining room service\";}s:8:\"Teamwork\";a:3:{i:0;s:8:\"teamwork\";i:1;s:18:\"team collaboration\";i:2;s:19:\"working with others\";}s:15:\"Time Management\";a:3:{i:0;s:15:\"time management\";i:1;s:14:\"prioritization\";i:2;s:12:\"multitasking\";}s:9:\"Upselling\";a:4:{i:0;s:9:\"upselling\";i:1;s:17:\"upsell techniques\";i:2;s:18:\"suggestive selling\";i:3;s:13:\"cross-selling\";}s:12:\"VIP Handling\";a:0:{}}s:9:\"job_roles\";a:88:{s:18:\"Accounts Assistant\";a:4:{i:0;s:18:\"accounts assistant\";i:1;s:20:\"accounting assistant\";i:2;s:17:\"finance assistant\";i:3;s:10:\"bookkeeper\";}s:29:\"Banquet Operations Supervisor\";a:4:{i:0;s:29:\"banquet operations supervisor\";i:1;s:18:\"banquet supervisor\";i:2;s:26:\"banquet operations manager\";i:3;s:15:\"banquet manager\";}s:27:\"Banquet Service Team Leader\";a:4:{i:0;s:27:\"banquet service team leader\";i:1;s:19:\"banquet team leader\";i:2;s:26:\"banquet service supervisor\";i:3;s:23:\"banquet team supervisor\";}s:25:\"Bar Operations Supervisor\";a:6:{i:0;s:25:\"bar operations supervisor\";i:1;s:36:\"restaurant bar operations supervisor\";i:2;s:14:\"bar supervisor\";i:3;s:11:\"bar manager\";i:4;s:8:\"bar lead\";i:5;s:15:\"bar team leader\";}s:7:\"Barista\";a:4:{i:0;s:7:\"barista\";i:1;s:17:\"coffee shop staff\";i:2;s:12:\"cafe barista\";i:3;s:16:\"coffee attendant\";}s:9:\"Bartender\";a:5:{i:0;s:9:\"bartender\";i:1;s:10:\"bar tender\";i:2;s:6:\"barman\";i:3;s:7:\"barkeep\";i:4;s:10:\"mixologist\";}s:27:\"Beverage Service Specialist\";a:5:{i:0;s:27:\"beverage service specialist\";i:1;s:38:\"restaurant beverage service specialist\";i:2;s:19:\"beverage specialist\";i:3;s:14:\"bar specialist\";i:4;s:18:\"beverage attendant\";}s:38:\"Catering and Banquet Sales Coordinator\";a:5:{i:0;s:38:\"catering and banquet sales coordinator\";i:1;s:26:\"catering sales coordinator\";i:2;s:25:\"banquet sales coordinator\";i:3;s:20:\"catering coordinator\";i:4;s:23:\"banquet sales assistant\";}s:31:\"Catering Operations Coordinator\";a:4:{i:0;s:31:\"catering operations coordinator\";i:1;s:20:\"catering coordinator\";i:2;s:28:\"banquet catering coordinator\";i:3;s:19:\"catering operations\";}s:4:\"Chef\";a:8:{i:0;s:4:\"chef\";i:1;s:9:\"sous chef\";i:2;s:9:\"head chef\";i:3;s:14:\"executive chef\";i:4;s:14:\"chef de partie\";i:5;s:19:\"executive sous chef\";i:6;s:12:\"banquet chef\";i:7;s:9:\"demi chef\";}s:9:\"Concierge\";a:4:{i:0;s:9:\"concierge\";i:1;s:15:\"hotel concierge\";i:2;s:12:\"bell captain\";i:3;s:7:\"bellman\";}s:31:\"Culinary Production Coordinator\";a:4:{i:0;s:31:\"culinary production coordinator\";i:1;s:30:\"kitchen production coordinator\";i:2;s:20:\"culinary coordinator\";i:3;s:19:\"culinary production\";}s:25:\"Dining Service Supervisor\";a:5:{i:0;s:25:\"dining service supervisor\";i:1;s:29:\"restaurant service supervisor\";i:2;s:17:\"dining supervisor\";i:3;s:25:\"service supervisor dining\";i:4;s:22:\"dining room supervisor\";}s:26:\"Events Catering Supervisor\";a:4:{i:0;s:26:\"events catering supervisor\";i:1;s:19:\"catering supervisor\";i:2;s:26:\"event catering coordinator\";i:3;s:27:\"banquet catering supervisor\";}s:18:\"Events Coordinator\";a:9:{i:0;s:28:\"sales and events coordinator\";i:1;s:34:\"hotel sales and events coordinator\";i:2;s:18:\"events coordinator\";i:3;s:19:\"banquet coordinator\";i:4;s:17:\"event coordinator\";i:5;s:18:\"catering assistant\";i:6;s:29:\"events and catering assistant\";i:7;s:23:\"banquet sales assistant\";i:8;s:14:\"banquet server\";}s:21:\"Executive Housekeeper\";a:4:{i:0;s:21:\"executive housekeeper\";i:1;s:20:\"housekeeping manager\";i:2;s:22:\"housekeeping executive\";i:3;s:16:\"head housekeeper\";}s:25:\"Food and Beverage Manager\";a:4:{i:0;s:25:\"food and beverage manager\";i:1;s:11:\"f&b manager\";i:2;s:18:\"restaurant manager\";i:3;s:23:\"food & beverage manager\";}s:31:\"Food Beverage Events Supervisor\";a:4:{i:0;s:31:\"food beverage events supervisor\";i:1;s:35:\"food and beverage events supervisor\";i:2;s:21:\"f&b events supervisor\";i:3;s:24:\"food beverage supervisor\";}s:26:\"Food Production Supervisor\";a:4:{i:0;s:26:\"food production supervisor\";i:1;s:29:\"kitchen production supervisor\";i:2;s:27:\"food production coordinator\";i:3;s:30:\"culinary production supervisor\";}s:20:\"Front Desk Associate\";a:6:{i:0;s:20:\"front desk associate\";i:1;s:22:\"front office associate\";i:2;s:25:\"front desk representative\";i:3;s:28:\"guest service representative\";i:4;s:16:\"front desk clerk\";i:5;s:19:\"front office intern\";}s:23:\"Front Desk Receptionist\";a:7:{i:0;s:16:\"front desk agent\";i:1;s:18:\"front desk officer\";i:2;s:23:\"front desk receptionist\";i:3;s:16:\"front desk staff\";i:4;s:22:\"front office associate\";i:5;s:19:\"guest service agent\";i:6;s:12:\"receptionist\";}s:20:\"Front Office Manager\";a:4:{i:0;s:20:\"front office manager\";i:1;s:18:\"front desk manager\";i:2;s:17:\"front office lead\";i:3;s:22:\"guest services manager\";}s:15:\"General Manager\";a:3:{i:0;s:15:\"general manager\";i:1;s:2:\"gm\";i:2;s:16:\"property manager\";}s:25:\"Guest Booking Team Leader\";a:4:{i:0;s:25:\"guest booking team leader\";i:1;s:19:\"booking team leader\";i:2;s:24:\"reservations team leader\";i:3;s:28:\"booking services team leader\";}s:28:\"Guest Experience Coordinator\";a:4:{i:0;s:28:\"guest experience coordinator\";i:1;s:40:\"guest experience and loyalty coordinator\";i:2;s:46:\"hotel guest experience and loyalty coordinator\";i:3;s:19:\"loyalty coordinator\";}s:24:\"Guest Experience Officer\";a:5:{i:0;s:24:\"guest experience officer\";i:1;s:28:\"guest experience coordinator\";i:2;s:27:\"guest experience specialist\";i:3;s:3:\"gxo\";i:4;s:30:\"guest experience officer hotel\";}s:23:\"Guest Relations Officer\";a:5:{i:0;s:3:\"gro\";i:1;s:27:\"guest relations coordinator\";i:2;s:23:\"guest relations officer\";i:3;s:21:\"guest service officer\";i:4;s:25:\"guest relations associate\";}s:40:\"Hospitality Client Relations Team Leader\";a:4:{i:0;s:40:\"hospitality client relations team leader\";i:1;s:28:\"client relations team leader\";i:2;s:27:\"client relations supervisor\";i:3;s:39:\"hospitality client relations supervisor\";}s:39:\"Hospitality Corporate Sales Coordinator\";a:5:{i:0;s:39:\"hospitality corporate sales coordinator\";i:1;s:27:\"corporate sales coordinator\";i:2;s:23:\"corporate sales officer\";i:3;s:27:\"sales coordinator corporate\";i:4;s:29:\"hospitality sales coordinator\";}s:34:\"Hospitality Facilities Team Leader\";a:4:{i:0;s:34:\"hospitality facilities team leader\";i:1;s:22:\"facilities team leader\";i:2;s:21:\"facilities supervisor\";i:3;s:33:\"hospitality facilities supervisor\";}s:31:\"Hospitality Kitchen Coordinator\";a:4:{i:0;s:31:\"hospitality kitchen coordinator\";i:1;s:19:\"kitchen coordinator\";i:2;s:19:\"hospitality kitchen\";i:3;s:20:\"culinary coordinator\";}s:35:\"Hospitality Maintenance Coordinator\";a:4:{i:0;s:35:\"hospitality maintenance coordinator\";i:1;s:23:\"maintenance coordinator\";i:2;s:34:\"facilities maintenance coordinator\";i:3;s:34:\"hospitality maintenance supervisor\";}s:35:\"Hospitality Reservations Specialist\";a:4:{i:0;s:35:\"hospitality reservations specialist\";i:1;s:23:\"reservations specialist\";i:2;s:32:\"hospitality reservations officer\";i:3;s:32:\"reservations officer hospitality\";}s:7:\"Hostess\";a:5:{i:0;s:7:\"hostess\";i:1;s:9:\"food host\";i:2;s:15:\"restaurant host\";i:3;s:27:\"fine dining restaurant host\";i:4;s:4:\"host\";}s:25:\"Hotel Banquet Coordinator\";a:4:{i:0;s:25:\"hotel banquet coordinator\";i:1;s:19:\"banquet coordinator\";i:2;s:13:\"hotel banquet\";i:3;s:26:\"banquet events coordinator\";}s:30:\"Hotel Booking Services Officer\";a:4:{i:0;s:30:\"hotel booking services officer\";i:1;s:24:\"booking services officer\";i:2;s:21:\"hotel booking officer\";i:3;s:21:\"booking officer hotel\";}s:38:\"Hotel Business Development Coordinator\";a:5:{i:0;s:38:\"hotel business development coordinator\";i:1;s:32:\"business development coordinator\";i:2;s:28:\"business development officer\";i:3;s:35:\"hotel sales development coordinator\";i:4;s:38:\"business development coordinator hotel\";}s:38:\"Hotel Engineering Operations Assistant\";a:4:{i:0;s:38:\"hotel engineering operations assistant\";i:1;s:32:\"engineering operations assistant\";i:2;s:27:\"hotel engineering assistant\";i:3;s:27:\"engineering assistant hotel\";}s:26:\"Hotel Events Sales Officer\";a:5:{i:0;s:26:\"hotel events sales officer\";i:1;s:20:\"events sales officer\";i:2;s:19:\"event sales officer\";i:3;s:19:\"hotel sales officer\";i:4;s:20:\"events officer hotel\";}s:27:\"Hotel Facilities Supervisor\";a:4:{i:0;s:27:\"hotel facilities supervisor\";i:1;s:21:\"facilities supervisor\";i:2;s:31:\"property maintenance supervisor\";i:3;s:24:\"hotel facilities manager\";}s:29:\"Hotel Front Office Supervisor\";a:5:{i:0;s:29:\"hotel front office supervisor\";i:1;s:23:\"front office supervisor\";i:2;s:21:\"front desk supervisor\";i:3;s:26:\"hotel front office manager\";i:4;s:17:\"front office lead\";}s:19:\"Hotel Night Auditor\";a:4:{i:0;s:13:\"night auditor\";i:1;s:19:\"hotel night auditor\";i:2;s:21:\"night audit associate\";i:3;s:22:\"night audit supervisor\";}s:37:\"Hotel Property Maintenance Supervisor\";a:4:{i:0;s:37:\"hotel property maintenance supervisor\";i:1;s:31:\"property maintenance supervisor\";i:2;s:28:\"maintenance supervisor hotel\";i:3;s:28:\"property maintenance manager\";}s:26:\"Hotel Reservations Manager\";a:4:{i:0;s:26:\"hotel reservations manager\";i:1;s:20:\"reservations manager\";i:2;s:29:\"hotel reservations supervisor\";i:3;s:26:\"reservations manager hotel\";}s:36:\"Hotel Reservations Sales Coordinator\";a:4:{i:0;s:36:\"hotel reservations sales coordinator\";i:1;s:30:\"reservations sales coordinator\";i:2;s:24:\"hotel reservations sales\";i:3;s:30:\"reservations coordinator sales\";}s:29:\"Hotel Reservations Supervisor\";a:4:{i:0;s:29:\"hotel reservations supervisor\";i:1;s:23:\"reservations supervisor\";i:2;s:26:\"hotel reservations manager\";i:3;s:26:\"reservations manager hotel\";}s:21:\"Hotel Revenue Analyst\";a:6:{i:0;s:21:\"hotel revenue analyst\";i:1;s:15:\"revenue analyst\";i:2;s:26:\"revenue management analyst\";i:3;s:32:\"hotel revenue management analyst\";i:4;s:15:\"pricing analyst\";i:5;s:21:\"revenue analyst hotel\";}s:33:\"Hotel Sales and Events Supervisor\";a:5:{i:0;s:33:\"hotel sales and events supervisor\";i:1;s:27:\"sales and events supervisor\";i:2;s:22:\"hotel sales supervisor\";i:3;s:23:\"sales events supervisor\";i:4;s:34:\"hotel sales and events coordinator\";}s:22:\"Housekeeping Attendant\";a:6:{i:0;s:22:\"housekeeping attendant\";i:1;s:14:\"room attendant\";i:2;s:11:\"housekeeper\";i:3;s:11:\"chambermaid\";i:4;s:7:\"roomboy\";i:5;s:21:\"public area attendant\";}s:23:\"Housekeeping Supervisor\";a:4:{i:0;s:23:\"housekeeping supervisor\";i:1;s:29:\"hotel housekeeping supervisor\";i:2;s:17:\"floor housekeeper\";i:3;s:21:\"executive housekeeper\";}s:12:\"HR Assistant\";a:5:{i:0;s:12:\"hr assistant\";i:1;s:24:\"human resource assistant\";i:2;s:25:\"human resources assistant\";i:3;s:8:\"hr staff\";i:4;s:21:\"recruitment assistant\";}s:10:\"HR Manager\";a:3:{i:0;s:10:\"hr manager\";i:1;s:23:\"human resources manager\";i:2;s:25:\"hr administration manager\";}s:20:\"Inventory Supervisor\";a:7:{i:0;s:20:\"inventory supervisor\";i:1;s:23:\"cost control supervisor\";i:2;s:48:\"restaurant inventory and cost control supervisor\";i:3;s:37:\"inventory and cost control supervisor\";i:4;s:16:\"stock controller\";i:5;s:15:\"inventory clerk\";i:6;s:27:\"restaurant stock controller\";}s:14:\"Kitchen Helper\";a:6:{i:0;s:14:\"kitchen helper\";i:1;s:10:\"dishwasher\";i:2;s:12:\"kitchen aide\";i:3;s:7:\"steward\";i:4;s:15:\"kitchen steward\";i:5;s:13:\"kitchen staff\";}s:29:\"Kitchen Operations Supervisor\";a:4:{i:0;s:29:\"kitchen operations supervisor\";i:1;s:30:\"culinary operations supervisor\";i:2;s:29:\"kitchen supervisor operations\";i:3;s:26:\"kitchen operations manager\";}s:18:\"Kitchen Supervisor\";a:4:{i:0;s:18:\"kitchen supervisor\";i:1;s:29:\"restaurant kitchen supervisor\";i:2;s:19:\"culinary supervisor\";i:3;s:15:\"chef supervisor\";}s:17:\"Laundry Attendant\";a:2:{i:0;s:17:\"laundry attendant\";i:1;s:13:\"laundry staff\";}s:18:\"Laundry Supervisor\";a:3:{i:0;s:18:\"laundry supervisor\";i:1;s:24:\"hotel laundry supervisor\";i:2;s:19:\"laundry team leader\";}s:9:\"Line Cook\";a:7:{i:0;s:9:\"line cook\";i:1;s:4:\"cook\";i:2;s:12:\"station cook\";i:3;s:16:\"hot kitchen cook\";i:4;s:11:\"commis chef\";i:5;s:12:\"kitchen cook\";i:6;s:16:\"senior line cook\";}s:22:\"Maintenance Technician\";a:6:{i:0;s:22:\"maintenance technician\";i:1;s:28:\"hotel maintenance technician\";i:2;s:17:\"maintenance staff\";i:3;s:8:\"handyman\";i:4;s:26:\"building maintenance staff\";i:5;s:20:\"facilities assistant\";}s:27:\"Pastry and Bakery Assistant\";a:4:{i:0;s:16:\"pastry assistant\";i:1;s:16:\"bakery assistant\";i:2;s:14:\"bakery trainee\";i:3;s:11:\"pastry cook\";}s:11:\"Pastry Chef\";a:4:{i:0;s:11:\"pastry chef\";i:1;s:5:\"baker\";i:2;s:11:\"pastry cook\";i:3;s:10:\"baker chef\";}s:22:\"Purchasing Coordinator\";a:6:{i:0;s:22:\"purchasing coordinator\";i:1;s:23:\"procurement coordinator\";i:2;s:44:\"hotel purchasing and procurement coordinator\";i:3;s:34:\"purchasing and inventory assistant\";i:4;s:20:\"purchasing assistant\";i:5;s:21:\"procurement assistant\";}s:25:\"Quality Assurance Officer\";a:7:{i:0;s:25:\"quality assurance officer\";i:1;s:52:\"restaurant quality assurance and food safety officer\";i:2;s:19:\"food safety officer\";i:3;s:10:\"qa officer\";i:4;s:26:\"qa and food safety officer\";i:5;s:12:\"qa assistant\";i:6;s:29:\"restaurant compliance officer\";}s:21:\"Recreation Supervisor\";a:7:{i:0;s:21:\"recreation supervisor\";i:1;s:43:\"resort recreation and activities supervisor\";i:2;s:21:\"activities supervisor\";i:3;s:22:\"recreation coordinator\";i:4;s:22:\"activities coordinator\";i:5;s:43:\"hotel recreation and activities coordinator\";i:6;s:27:\"resort activities assistant\";}s:32:\"Reservations Booking Coordinator\";a:4:{i:0;s:32:\"reservations booking coordinator\";i:1;s:19:\"booking coordinator\";i:2;s:24:\"reservations coordinator\";i:3;s:25:\"hotel booking coordinator\";}s:24:\"Reservations Coordinator\";a:7:{i:0;s:24:\"reservations coordinator\";i:1;s:47:\"hotel reservations and distribution coordinator\";i:2;s:41:\"reservations and distribution coordinator\";i:3;s:20:\"reservations officer\";i:4;s:22:\"reservations assistant\";i:5;s:28:\"hotel reservations assistant\";i:6;s:26:\"hotel reservations officer\";}s:20:\"Reservations Manager\";a:3:{i:0;s:20:\"reservations manager\";i:1;s:19:\"reservation manager\";i:2;s:15:\"booking manager\";}s:31:\"Resort Guest Experience Manager\";a:4:{i:0;s:31:\"resort guest experience manager\";i:1;s:24:\"guest experience manager\";i:2;s:27:\"guest experience supervisor\";i:3;s:30:\"resort guest relations manager\";}s:38:\"Resort Housekeeping Operations Manager\";a:6:{i:0;s:38:\"resort housekeeping operations manager\";i:1;s:31:\"housekeeping operations manager\";i:2;s:27:\"resort housekeeping manager\";i:3;s:20:\"housekeeping manager\";i:4;s:34:\"housekeeping operations supervisor\";i:5;s:30:\"resort housekeeping operations\";}s:25:\"Resort Operations Manager\";a:4:{i:0;s:25:\"resort operations manager\";i:1;s:24:\"hotel operations manager\";i:2;s:14:\"resort manager\";i:3;s:25:\"operations manager resort\";}s:38:\"Resort Property Operations Coordinator\";a:4:{i:0;s:38:\"resort property operations coordinator\";i:1;s:31:\"property operations coordinator\";i:2;s:20:\"property coordinator\";i:3;s:29:\"resort operations coordinator\";}s:40:\"Resort Recreation and Activities Manager\";a:5:{i:0;s:40:\"resort recreation and activities manager\";i:1;s:33:\"recreation and activities manager\";i:2;s:25:\"resort recreation manager\";i:3;s:18:\"activities manager\";i:4;s:28:\"recreation supervisor resort\";}s:30:\"Restaurant Beverage Supervisor\";a:5:{i:0;s:30:\"restaurant beverage supervisor\";i:1;s:19:\"beverage supervisor\";i:2;s:14:\"bar supervisor\";i:3;s:27:\"beverage service supervisor\";i:4;s:25:\"restaurant bar supervisor\";}s:18:\"Restaurant Cashier\";a:5:{i:0;s:18:\"restaurant cashier\";i:1;s:7:\"cashier\";i:2;s:38:\"cashier and customer service associate\";i:3;s:14:\"dining cashier\";i:4;s:26:\"customer service associate\";}s:38:\"Restaurant Culinary Operations Officer\";a:4:{i:0;s:38:\"restaurant culinary operations officer\";i:1;s:27:\"culinary operations officer\";i:2;s:27:\"restaurant culinary officer\";i:3;s:27:\"culinary officer restaurant\";}s:42:\"Restaurant Customer Experience Coordinator\";a:5:{i:0;s:42:\"restaurant customer experience coordinator\";i:1;s:31:\"customer experience coordinator\";i:2;s:14:\"cx coordinator\";i:3;s:39:\"guest experience coordinator restaurant\";i:4;s:42:\"customer experience coordinator restaurant\";}s:41:\"Restaurant Events and Banquet Coordinator\";a:5:{i:0;s:41:\"restaurant events and banquet coordinator\";i:1;s:30:\"events and banquet coordinator\";i:2;s:29:\"restaurant events coordinator\";i:3;s:19:\"banquet coordinator\";i:4;s:29:\"events coordinator restaurant\";}s:37:\"Restaurant Guest Relations Supervisor\";a:4:{i:0;s:37:\"restaurant guest relations supervisor\";i:1;s:26:\"guest relations supervisor\";i:2;s:38:\"restaurant guest relations coordinator\";i:3;s:37:\"guest relations supervisor restaurant\";}s:30:\"Restaurant Kitchen Team Leader\";a:4:{i:0;s:30:\"restaurant kitchen team leader\";i:1;s:19:\"kitchen team leader\";i:2;s:23:\"restaurant kitchen team\";i:3;s:30:\"kitchen supervisor team leader\";}s:49:\"Restaurant Procurement and Purchasing Coordinator\";a:5:{i:0;s:49:\"restaurant procurement and purchasing coordinator\";i:1;s:38:\"procurement and purchasing coordinator\";i:2;s:34:\"restaurant procurement coordinator\";i:3;s:22:\"purchasing coordinator\";i:4;s:23:\"procurement coordinator\";}s:32:\"Restaurant Relations Coordinator\";a:4:{i:0;s:32:\"restaurant relations coordinator\";i:1;s:27:\"guest relations coordinator\";i:2;s:21:\"relations coordinator\";i:3;s:38:\"restaurant guest relations coordinator\";}s:17:\"Restaurant Server\";a:9:{i:0;s:17:\"restaurant server\";i:1;s:6:\"waiter\";i:2;s:8:\"waitress\";i:3;s:11:\"food server\";i:4;s:6:\"server\";i:5;s:27:\"food and beverage attendant\";i:6;s:13:\"f&b attendant\";i:7;s:12:\"service crew\";i:8;s:22:\"restaurant crew member\";}s:30:\"Restaurant Service Team Leader\";a:5:{i:0;s:30:\"restaurant service team leader\";i:1;s:19:\"service team leader\";i:2;s:22:\"restaurant team leader\";i:3;s:18:\"service supervisor\";i:4;s:29:\"restaurant service supervisor\";}s:21:\"Restaurant Supervisor\";a:6:{i:0;s:21:\"restaurant supervisor\";i:1;s:16:\"floor supervisor\";i:2;s:18:\"service supervisor\";i:3;s:18:\"senior server lead\";i:4;s:28:\"food and beverage supervisor\";i:5;s:14:\"f&b supervisor\";}s:28:\"Revenue Management Assistant\";a:4:{i:0;s:28:\"revenue management assistant\";i:1;s:34:\"hotel revenue management assistant\";i:2;s:17:\"revenue assistant\";i:3;s:17:\"pricing assistant\";}s:16:\"Spa Receptionist\";a:5:{i:0;s:16:\"spa receptionist\";i:1;s:35:\"hotel spa and wellness receptionist\";i:2;s:21:\"wellness receptionist\";i:3;s:14:\"spa front desk\";i:4;s:29:\"spa and wellness receptionist\";}s:10:\"Supervisor\";a:3:{i:0;s:10:\"supervisor\";i:1;s:16:\"shift supervisor\";i:2;s:11:\"team leader\";}}s:14:\"certifications\";a:11:{s:13:\"Barista NC II\";a:3:{i:0;s:13:\"barista nc ii\";i:1;s:19:\"tesda barista nc ii\";i:2;s:26:\"coffee academy certificate\";}s:16:\"Culinary Diploma\";a:3:{i:0;s:16:\"culinary diploma\";i:1;s:24:\"diploma in culinary arts\";i:2;s:21:\"culinary arts diploma\";}s:16:\"Driver\'s License\";a:4:{i:0;s:16:\"driver\'s license\";i:1;s:15:\"drivers license\";i:2;s:27:\"professional driver license\";i:3;s:31:\"non-professional driver license\";}s:21:\"First Aid Certificate\";a:3:{i:0;s:21:\"first aid certificate\";i:1;s:30:\"first aid training certificate\";i:2;s:18:\"standard first aid\";}s:24:\"Food Handler Certificate\";a:5:{i:0;s:24:\"food handler certificate\";i:1;s:26:\"food handler\'s certificate\";i:2;s:25:\"food handlers certificate\";i:3;s:23:\"food safety certificate\";i:4;s:17:\"food handler card\";}s:22:\"TESDA Bartending NC II\";a:4:{i:0;s:22:\"tesda bartending nc ii\";i:1;s:16:\"bartending nc ii\";i:2;s:15:\"bartending nc 2\";i:3;s:25:\"tesda nc ii in bartending\";}s:39:\"TESDA Bread and Pastry Production NC II\";a:3:{i:0;s:33:\"bread and pastry production nc ii\";i:1;s:12:\"baking nc ii\";i:2;s:23:\"pastry production nc ii\";}s:19:\"TESDA Cookery NC II\";a:5:{i:0;s:19:\"tesda cookery nc ii\";i:1;s:13:\"cookery nc ii\";i:2;s:18:\"tesda cookery nc 2\";i:3;s:24:\"commercial cooking nc ii\";i:4;s:22:\"tesda nc ii in cookery\";}s:38:\"TESDA Food and Beverage Services NC II\";a:4:{i:0;s:32:\"food and beverage services nc ii\";i:1;s:18:\"f&b services nc ii\";i:2;s:17:\"fb services nc ii\";i:3;s:23:\"food and beverage nc ii\";}s:24:\"TESDA Front Office NC II\";a:3:{i:0;s:24:\"tesda front office nc ii\";i:1;s:18:\"front office nc ii\";i:2;s:27:\"front office services nc ii\";}s:24:\"TESDA Housekeeping NC II\";a:3:{i:0;s:24:\"tesda housekeeping nc ii\";i:1;s:18:\"housekeeping nc ii\";i:2;s:17:\"housekeeping nc 2\";}}}', 1788336602),
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
-- Table structure for table `chatbot_faqs`
--

CREATE TABLE IF NOT EXISTS `chatbot_faqs` (
  `faq_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `question` varchar(255) NOT NULL,
  `answer` text NOT NULL,
  `keywords` text DEFAULT NULL,
  `enabled` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`faq_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `chatbot_faqs`
--

INSERT INTO `chatbot_faqs` (`faq_id`, `question`, `answer`, `keywords`, `enabled`, `sort_order`, `created_at`, `updated_at`) VALUES
(2, 'What is the dress code for interviews?', 'Smart business or business-casual attire is recommended. For ladies, a neat blouse and slacks or a modest dress; for men, a collared shirt with slacks. Avoid ripped jeans, sandals, and revealing clothing.', 'dress code,dress,wear,attire,outfit,what to wear,uniform', 1, 1, '2026-08-19 13:20:18', '2026-08-19 13:20:18');

-- --------------------------------------------------------

--
-- Table structure for table `chatbot_unanswered`
--

CREATE TABLE IF NOT EXISTS `chatbot_unanswered` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `session_id` varchar(80) DEFAULT NULL,
  `message` text NOT NULL,
  `intent` varchar(40) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_chatbot_unanswered_session_id` (`session_id`),
  KEY `idx_chatbot_unanswered_created_at` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `chatbot_unanswered`
--

INSERT INTO `chatbot_unanswered` (`id`, `session_id`, `message`, `intent`, `created_at`) VALUES
(1, 'test-4074675d', 'gibberish zzz qqq', NULL, '2026-08-19 21:16:26'),
(2, 'cbt-mt0lqz0z-2c6owk', 'suot', NULL, '2026-08-19 21:35:29');

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
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `employees`
--

INSERT INTO `employees` (`employee_id`, `employee_code`, `first_name`, `middle_name`, `last_name`, `email`, `personal_email`, `phone`, `address`, `birth_date`, `gender`, `civil_status`, `nationality`, `sss_number`, `philhealth_number`, `pagibig_number`, `tin_number`, `position_id`, `department_id`, `employment_type`, `date_hired`, `supervisor_employee_id`, `status`, `onboarding_complete`, `salary_grade_id`, `employee_record_last_updated_at`, `salary_step`, `created_at`, `updated_at`) VALUES
(1, 'EMP-0001', 'Ana', 'M.', 'Ramos', 'ana.ramos@oxfordsuites.com.ph', NULL, '0917 100 1001', 'Makati City', '1986-05-14', 'Female', 'Married', 'Filipino', NULL, NULL, NULL, NULL, 10, 1, 'Regular', '2019-02-11', 9, 'Active', 1, 6, '2026-01-10', 'Step 3', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(2, 'EMP-0002', 'Gabriel', 'S.', 'Mendoza', 'gabriel.mendoza@oxfordsuites.com.ph', NULL, '0917 100 1002', 'Makati City', '1979-11-02', 'Male', 'Married', 'Filipino', NULL, NULL, NULL, NULL, 11, 2, 'Regular', '2018-06-04', 9, 'Active', 1, 7, '2025-11-02', 'Step 4', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(3, 'EMP-0003', 'Lourdes', 'B.', 'Bautista', 'lourdes.bautista@oxfordsuites.com.ph', NULL, '0917 100 1003', 'Quezon City', '1971-03-27', 'Female', 'Married', 'Filipino', NULL, NULL, NULL, NULL, 13, 4, 'Regular', '2017-11-20', 9, 'Active', 1, 6, '2012-06-15', 'Step 3', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(4, 'EMP-0004', 'Camille', 'T.', 'Ortega', 'camille.ortega@oxfordsuites.com.ph', NULL, '0917 664 2219', 'Makati City', '2001-02-09', 'Female', 'Single', 'Filipino', NULL, NULL, NULL, NULL, 2, 1, 'Probationary', '2026-08-04', 1, 'Active', 0, 4, '2026-01-14', 'Step 1', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(5, 'EMP-0005', 'Kevin', 'D.', 'Dela Cruz', 'kevin.delacruz@oxfordsuites.com.ph', NULL, '0921 774 9903', '14 Kalayaan Ave, Makati City', '1998-08-17', 'Male', 'Single', 'Filipino', '34-1234567-8', '12-345678901-2', '1234-5678-9012', '123-456-789', 5, 3, 'Probationary', '2026-04-15', 10, 'Active', 1, 2, '2026-01-20', 'Step 2', '2026-08-17 17:41:34', '2026-08-31 01:00:50'),
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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `employee_exit_records`
--

INSERT INTO `employee_exit_records` (`exit_record_id`, `employee_id`, `exit_type`, `exit_date`, `clearance_status`, `coe_status`, `notes`, `created_at`, `updated_at`) VALUES
(1, 1, 'Terminated', '2026-08-17', 'Pending', 'Pending', 'Employee exit via Terminated', '2026-08-17 10:51:56', '2026-08-17 10:51:56');

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
  `submitted_at` timestamp NULL DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `completed_by_user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`employee_onboarding_item_id`),
  KEY `fk_employee_onboarding_items_completed_by_user_id` (`completed_by_user_id`),
  KEY `fk_employee_onboarding_items_employee_id` (`employee_id`),
  KEY `fk_employee_onboarding_items_new_hire_id` (`new_hire_id`),
  KEY `fk_employee_onboarding_items_template_item_id` (`template_item_id`)
) ENGINE=InnoDB AUTO_INCREMENT=338 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `employee_onboarding_items`
--

INSERT INTO `employee_onboarding_items` (`employee_onboarding_item_id`, `employee_id`, `new_hire_id`, `template_item_id`, `item_text`, `file_path`, `file_name`, `notes`, `done`, `submitted_at`, `completed_at`, `completed_by_user_id`, `created_at`, `updated_at`) VALUES
(1, 4, 1, NULL, 'Signed employment contract', NULL, NULL, NULL, 1, NULL, '2026-07-31 18:00:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(2, 4, 1, NULL, 'NBI / Police clearance', NULL, NULL, 'NBI clearance reference NBI-2026-0901', 0, '2026-08-25 06:40:17', NULL, NULL, '2026-08-17 00:31:34', '2026-08-29 16:46:45'),
(3, 4, 1, NULL, 'Pre-employment medical exam', NULL, NULL, 'Submitted for verification', 1, '2026-08-25 04:52:31', '2026-08-25 05:13:49', NULL, '2026-08-17 00:31:34', '2026-08-25 05:13:49'),
(4, 4, 1, NULL, 'SSS / PhilHealth / Pag-IBIG / TIN', NULL, NULL, 'Submitted from verification script', 1, '2026-08-25 06:41:59', '2026-08-29 16:49:04', NULL, '2026-08-17 00:31:34', '2026-08-29 16:49:04'),
(5, 4, 1, NULL, 'Birth certificate (PSA)', NULL, NULL, NULL, 1, NULL, '2026-08-25 07:12:45', NULL, '2026-08-17 00:31:34', '2026-08-25 07:12:45'),
(6, 4, 1, NULL, 'Company orientation attended', NULL, NULL, NULL, 0, NULL, NULL, NULL, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(7, 4, 1, NULL, 'Uniform & ID issued', NULL, NULL, NULL, 0, NULL, NULL, NULL, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(8, 4, 1, NULL, 'Department on-the-job training', NULL, NULL, NULL, 1, NULL, '2026-08-25 05:43:29', NULL, '2026-08-17 00:31:34', '2026-08-25 05:43:29'),
(9, 13, 2, NULL, 'Signed employment contract', NULL, NULL, NULL, 0, NULL, NULL, NULL, '2026-08-17 00:31:34', '2026-08-25 05:14:01'),
(10, 13, 2, NULL, 'NBI / Police clearance', NULL, NULL, NULL, 1, NULL, '2026-07-31 18:12:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(11, 13, 2, NULL, 'Pre-employment medical exam', NULL, NULL, NULL, 1, NULL, '2026-08-01 17:00:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(12, 13, 2, NULL, 'SSS / PhilHealth / Pag-IBIG / TIN', NULL, NULL, NULL, 1, NULL, '2026-08-01 17:30:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(13, 13, 2, NULL, 'Birth certificate (PSA)', NULL, NULL, NULL, 1, NULL, '2026-08-01 18:00:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(14, 13, 2, NULL, 'Company orientation attended', NULL, NULL, NULL, 0, NULL, NULL, NULL, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(15, 13, 2, NULL, 'Uniform & ID issued', NULL, NULL, NULL, 0, NULL, NULL, NULL, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(16, 13, 2, NULL, 'Department on-the-job training', NULL, NULL, NULL, 0, NULL, NULL, NULL, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(17, 5, 3, NULL, 'Signed employment contract', NULL, NULL, NULL, 1, NULL, '2026-08-30 17:00:38', NULL, '2026-08-17 00:31:34', '2026-08-30 17:00:38'),
(18, 5, 3, NULL, 'NBI / Police clearance', NULL, NULL, NULL, 1, NULL, '2026-08-30 17:00:38', NULL, '2026-08-17 00:31:34', '2026-08-30 17:00:38'),
(19, 5, 3, NULL, 'Pre-employment medical exam', NULL, NULL, NULL, 1, NULL, '2026-08-30 17:00:38', NULL, '2026-08-17 00:31:34', '2026-08-30 17:00:38'),
(20, 5, 3, NULL, 'SSS / PhilHealth / Pag-IBIG / TIN', NULL, NULL, NULL, 1, NULL, '2026-08-30 17:00:39', NULL, '2026-08-17 00:31:34', '2026-08-30 17:00:39'),
(21, 5, 3, NULL, 'Birth certificate (PSA)', NULL, NULL, NULL, 1, NULL, '2026-08-30 17:00:39', NULL, '2026-08-17 00:31:34', '2026-08-30 17:00:39'),
(22, 5, 3, NULL, 'Company orientation attended', NULL, NULL, NULL, 1, NULL, '2026-08-30 17:00:39', NULL, '2026-08-17 00:31:34', '2026-08-30 17:00:39'),
(23, 5, 3, NULL, 'Uniform & ID issued', NULL, NULL, NULL, 1, NULL, '2026-08-30 17:00:40', NULL, '2026-08-17 00:31:34', '2026-08-30 17:00:40'),
(24, 5, 3, NULL, 'Department on-the-job training', NULL, NULL, NULL, 1, NULL, '2026-08-30 17:00:40', NULL, '2026-08-17 00:31:34', '2026-08-30 17:00:40'),
(25, 14, 4, NULL, 'Signed employment contract', NULL, NULL, NULL, 1, NULL, '2026-02-25 18:00:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(26, 14, 4, NULL, 'NBI / Police clearance', NULL, NULL, NULL, 1, NULL, '2026-02-25 18:10:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(27, 14, 4, NULL, 'Pre-employment medical exam', NULL, NULL, NULL, 1, NULL, '2026-02-26 17:00:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(28, 14, 4, NULL, 'SSS / PhilHealth / Pag-IBIG / TIN', NULL, NULL, NULL, 1, NULL, '2026-02-26 17:30:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(29, 14, 4, NULL, 'Birth certificate (PSA)', NULL, NULL, NULL, 1, NULL, '2026-02-26 18:00:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(30, 14, 4, NULL, 'Company orientation attended', NULL, NULL, NULL, 1, NULL, '2026-02-27 16:00:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(31, 14, 4, NULL, 'Uniform & ID issued', NULL, NULL, NULL, 1, NULL, '2026-02-27 16:30:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(32, 14, 4, NULL, 'Department on-the-job training', NULL, NULL, NULL, 1, NULL, '2026-02-28 00:00:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(33, 6, 5, NULL, 'Signed employment contract', NULL, NULL, NULL, 1, NULL, '2025-09-11 18:00:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(34, 6, 5, NULL, 'NBI / Police clearance', NULL, NULL, NULL, 1, NULL, '2025-09-11 18:10:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(35, 6, 5, NULL, 'Pre-employment medical exam', NULL, NULL, NULL, 1, NULL, '2025-09-12 17:00:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(36, 6, 5, NULL, 'SSS / PhilHealth / Pag-IBIG / TIN', NULL, NULL, NULL, 1, NULL, '2025-09-12 17:30:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(37, 6, 5, NULL, 'Birth certificate (PSA)', NULL, NULL, NULL, 1, NULL, '2025-09-12 18:00:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(38, 6, 5, NULL, 'Company orientation attended', NULL, NULL, NULL, 1, NULL, '2025-09-14 16:00:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(39, 6, 5, NULL, 'Uniform & ID issued', NULL, NULL, NULL, 1, NULL, '2025-09-14 16:30:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(40, 6, 5, NULL, 'Regularization evaluation passed', NULL, NULL, NULL, 1, NULL, '2026-03-14 22:00:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(41, 15, 6, 9, 'Department orientation completed', NULL, NULL, NULL, 1, NULL, '2026-05-10 16:00:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(42, 15, 6, 10, 'Job description acknowledged', NULL, NULL, NULL, 1, NULL, '2026-05-10 16:20:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(43, 15, 6, 11, '1st month performance evaluation', NULL, NULL, NULL, 1, NULL, '2026-06-09 17:00:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(44, 15, 6, 12, '3rd month performance evaluation', NULL, NULL, NULL, 0, NULL, NULL, NULL, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(45, 15, 6, 13, '5th month performance evaluation', NULL, NULL, NULL, 0, NULL, NULL, NULL, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(46, 15, 6, 14, 'Training hours completed', NULL, NULL, NULL, 0, NULL, NULL, NULL, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(47, 16, 7, 9, 'Department orientation completed', NULL, NULL, NULL, 1, NULL, '2026-02-19 16:00:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(48, 16, 7, 10, 'Job description acknowledged', NULL, NULL, NULL, 1, NULL, '2026-02-19 16:20:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(49, 16, 7, 11, '1st month performance evaluation', NULL, NULL, NULL, 1, NULL, '2026-03-19 17:00:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(50, 16, 7, 12, '3rd month performance evaluation', NULL, NULL, NULL, 1, NULL, '2026-05-19 17:00:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(51, 16, 7, 13, '5th month performance evaluation', NULL, NULL, NULL, 0, NULL, NULL, NULL, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(52, 16, 7, 14, 'Training hours completed', NULL, NULL, NULL, 0, NULL, NULL, NULL, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(53, 17, 8, 9, 'Department orientation completed', NULL, NULL, NULL, 1, NULL, '2026-05-31 16:00:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(54, 17, 8, 10, 'Job description acknowledged', NULL, NULL, NULL, 0, NULL, NULL, NULL, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(55, 17, 8, 11, '1st month performance evaluation', NULL, NULL, NULL, 0, NULL, NULL, NULL, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(56, 17, 8, 12, '3rd month performance evaluation', NULL, NULL, NULL, 0, NULL, NULL, NULL, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(57, 17, 8, 13, '5th month performance evaluation', NULL, NULL, NULL, 0, NULL, NULL, NULL, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(58, 17, 8, 14, 'Training hours completed', NULL, NULL, NULL, 0, NULL, NULL, NULL, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(59, 18, 9, NULL, 'Regularization contract signed', NULL, NULL, NULL, 1, NULL, '2025-05-29 18:00:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(60, 18, 9, NULL, 'HMO enrollment submitted', NULL, NULL, NULL, 1, NULL, '2025-05-29 18:30:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(61, 18, 9, NULL, 'Leave credits activated', NULL, NULL, NULL, 1, NULL, '2025-06-01 17:00:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(62, 18, 9, NULL, 'Performance goals set', NULL, NULL, NULL, 1, NULL, '2025-06-01 17:30:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(63, 19, 10, NULL, 'Regularization contract signed', NULL, NULL, NULL, 1, NULL, '2025-03-13 18:00:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(64, 19, 10, NULL, 'HMO enrollment submitted', NULL, NULL, NULL, 1, NULL, '2025-03-13 18:30:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(65, 19, 10, NULL, 'Leave credits activated', NULL, NULL, NULL, 1, NULL, '2025-03-16 17:00:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(66, 19, 10, NULL, 'Performance goals set', NULL, NULL, NULL, 1, NULL, '2025-03-16 17:30:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(67, 20, 11, NULL, 'Regularization contract signed', NULL, NULL, NULL, 1, NULL, '2025-11-06 18:00:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(68, 20, 11, NULL, 'HMO enrollment submitted', NULL, NULL, NULL, 1, NULL, '2025-11-06 18:30:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(69, 20, 11, NULL, 'Leave credits activated', NULL, NULL, NULL, 1, NULL, '2025-11-09 17:00:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(70, 20, 11, NULL, 'Performance goals set', NULL, NULL, NULL, 0, NULL, NULL, NULL, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(71, 21, 12, NULL, 'Regularization contract signed', NULL, NULL, NULL, 1, NULL, '2025-01-22 18:00:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(72, 21, 12, NULL, 'HMO enrollment submitted', NULL, NULL, NULL, 1, NULL, '2025-01-22 18:30:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(73, 21, 12, NULL, 'Leave credits activated', NULL, NULL, NULL, 1, NULL, '2025-01-26 17:00:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(74, 21, 12, NULL, 'Performance goals set', NULL, NULL, NULL, 1, NULL, '2025-01-26 17:30:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(75, NULL, NULL, NULL, 'Signed employment contract', NULL, NULL, NULL, 1, NULL, '2026-08-16 22:55:40', NULL, '2026-08-16 22:52:32', '2026-08-16 22:55:40'),
(76, NULL, NULL, NULL, 'NBI / Police clearance', NULL, NULL, NULL, 1, NULL, '2026-08-16 22:55:41', NULL, '2026-08-16 22:52:32', '2026-08-16 22:55:41'),
(77, NULL, NULL, NULL, 'Pre-employment medical exam', NULL, NULL, NULL, 1, NULL, '2026-08-16 22:56:16', NULL, '2026-08-16 22:52:32', '2026-08-16 22:56:16'),
(78, NULL, NULL, NULL, 'SSS / PhilHealth / Pag-IBIG / TIN', NULL, NULL, NULL, 1, NULL, '2026-08-16 22:56:17', NULL, '2026-08-16 22:52:32', '2026-08-16 22:56:17'),
(79, NULL, NULL, NULL, 'Birth certificate (PSA)', NULL, NULL, NULL, 1, NULL, '2026-08-16 22:56:19', NULL, '2026-08-16 22:52:32', '2026-08-16 22:56:19'),
(80, NULL, NULL, NULL, 'Company orientation attended', NULL, NULL, NULL, 1, NULL, '2026-08-16 22:56:25', NULL, '2026-08-16 22:52:33', '2026-08-16 22:56:25'),
(81, NULL, NULL, NULL, 'Uniform & ID issued', NULL, NULL, NULL, 1, NULL, '2026-08-16 22:56:25', NULL, '2026-08-16 22:52:33', '2026-08-16 22:56:25'),
(82, NULL, NULL, NULL, 'Department on-the-job training', NULL, NULL, NULL, 1, NULL, '2026-08-16 22:56:24', NULL, '2026-08-16 22:52:33', '2026-08-16 22:56:24'),
(99, NULL, 14, NULL, 'Signed employment contract', NULL, NULL, NULL, 1, NULL, '2026-08-18 09:50:44', NULL, '2026-08-18 08:49:26', '2026-08-18 09:50:44'),
(100, NULL, 14, NULL, 'NBI / Police clearance', NULL, NULL, NULL, 1, NULL, '2026-08-18 09:50:44', NULL, '2026-08-18 08:49:26', '2026-08-18 09:50:44'),
(101, NULL, 14, NULL, 'Pre-employment medical exam', NULL, NULL, NULL, 1, NULL, '2026-08-18 11:01:11', NULL, '2026-08-18 08:49:26', '2026-08-18 11:01:11'),
(102, NULL, 14, NULL, 'SSS / PhilHealth / Pag-IBIG / TIN', NULL, NULL, NULL, 1, NULL, '2026-08-18 11:01:12', NULL, '2026-08-18 08:49:26', '2026-08-18 11:01:12'),
(103, NULL, 14, NULL, 'Birth certificate (PSA)', NULL, NULL, NULL, 1, NULL, '2026-08-18 11:01:12', NULL, '2026-08-18 08:49:26', '2026-08-18 11:01:12'),
(104, NULL, 14, NULL, 'Company orientation attended', NULL, NULL, NULL, 1, NULL, '2026-08-18 11:01:13', NULL, '2026-08-18 08:49:26', '2026-08-18 11:01:13'),
(105, NULL, 14, NULL, 'Uniform & ID issued', NULL, NULL, NULL, 1, NULL, '2026-08-18 11:01:17', NULL, '2026-08-18 08:49:26', '2026-08-18 11:01:17'),
(106, NULL, 14, NULL, 'Department on-the-job training', NULL, NULL, NULL, 1, NULL, '2026-08-18 11:01:18', NULL, '2026-08-18 08:49:26', '2026-08-18 11:01:18'),
(107, NULL, 15, NULL, 'Signed employment contract', NULL, NULL, NULL, 0, NULL, NULL, NULL, '2026-08-18 08:49:26', '2026-08-18 08:49:26'),
(108, NULL, 15, NULL, 'NBI / Police clearance', NULL, NULL, NULL, 0, NULL, NULL, NULL, '2026-08-18 08:49:26', '2026-08-18 08:49:26'),
(109, NULL, 15, NULL, 'Pre-employment medical exam', NULL, NULL, NULL, 0, NULL, NULL, NULL, '2026-08-18 08:49:26', '2026-08-18 08:49:26'),
(110, NULL, 15, NULL, 'SSS / PhilHealth / Pag-IBIG / TIN', NULL, NULL, NULL, 0, NULL, NULL, NULL, '2026-08-18 08:49:26', '2026-08-18 08:49:26'),
(111, NULL, 15, NULL, 'Birth certificate (PSA)', NULL, NULL, NULL, 1, NULL, '2026-08-25 07:14:03', NULL, '2026-08-18 08:49:26', '2026-08-25 07:14:03'),
(112, NULL, 15, NULL, 'Company orientation attended', NULL, NULL, NULL, 1, NULL, '2026-08-25 07:14:04', NULL, '2026-08-18 08:49:26', '2026-08-25 07:14:04'),
(113, NULL, 15, NULL, 'Uniform & ID issued', NULL, NULL, NULL, 0, NULL, NULL, NULL, '2026-08-18 08:49:26', '2026-08-18 08:49:26'),
(114, NULL, 15, NULL, 'Department on-the-job training', NULL, NULL, NULL, 0, NULL, NULL, NULL, '2026-08-18 08:49:26', '2026-08-18 08:49:26'),
(211, 4, 1, NULL, 'PREPRE', NULL, NULL, NULL, 1, NULL, '2026-08-25 05:43:30', NULL, '2026-08-18 08:51:16', '2026-08-25 05:43:30'),
(212, 13, 2, NULL, 'PREPRE', NULL, NULL, NULL, 1, NULL, '2026-08-25 05:14:00', NULL, '2026-08-18 08:51:16', '2026-08-25 05:14:00'),
(213, NULL, 14, NULL, 'PREPRE', NULL, NULL, NULL, 1, NULL, '2026-08-18 11:05:29', NULL, '2026-08-18 08:51:16', '2026-08-18 11:05:29'),
(214, NULL, 15, NULL, 'PREPRE', NULL, NULL, NULL, 0, NULL, NULL, NULL, '2026-08-18 08:51:16', '2026-08-18 08:51:16'),
(284, NULL, 16, NULL, 'Signed employment contract', NULL, NULL, NULL, 1, NULL, '2026-08-24 20:39:51', NULL, '2026-08-18 09:51:14', '2026-08-24 20:39:51'),
(285, NULL, 16, NULL, 'NBI / Police clearance', NULL, NULL, NULL, 1, NULL, '2026-08-18 09:51:54', NULL, '2026-08-18 09:51:14', '2026-08-18 09:51:54'),
(286, NULL, 16, NULL, 'Pre-employment medical exam', NULL, NULL, 'Cleared last week, reference ME-2026-114', 1, '2026-08-25 04:49:35', '2026-08-25 04:49:36', NULL, '2026-08-18 09:51:14', '2026-08-25 04:49:36'),
(287, NULL, 16, NULL, 'SSS / PhilHealth / Pag-IBIG / TIN', 'onboarding_documents/pDz74ZFNFjWzcyTGw7A6IoO6ALgx4V9tKf8DB5WE.txt', 'requirements.pdf', 'Reference no. 123-456-789 - uploaded from employee portal', 1, NULL, '2026-08-25 03:08:40', NULL, '2026-08-18 09:51:14', '2026-08-25 03:08:40'),
(288, NULL, 16, NULL, 'Birth certificate (PSA)', NULL, NULL, NULL, 1, NULL, '2026-08-24 20:39:50', NULL, '2026-08-18 09:51:14', '2026-08-24 20:39:50'),
(289, NULL, 16, NULL, 'Company orientation attended', NULL, NULL, NULL, 1, NULL, '2026-08-18 09:51:54', NULL, '2026-08-18 09:51:14', '2026-08-18 09:51:54'),
(290, NULL, 16, NULL, 'Uniform & ID issued', NULL, NULL, NULL, 1, NULL, '2026-08-18 09:51:46', NULL, '2026-08-18 09:51:14', '2026-08-18 09:51:46'),
(291, NULL, 16, NULL, 'Department on-the-job training', NULL, NULL, NULL, 1, NULL, '2026-08-18 09:51:46', NULL, '2026-08-18 09:51:14', '2026-08-18 09:51:46'),
(293, 5, 3, NULL, 'PROPRO', NULL, NULL, NULL, 1, NULL, '2026-08-30 17:00:40', NULL, '2026-08-18 09:54:03', '2026-08-30 17:00:40'),
(294, 14, 4, NULL, 'PROPRO', NULL, NULL, NULL, 0, NULL, NULL, NULL, '2026-08-18 09:54:03', '2026-08-18 09:54:03'),
(295, 15, 6, NULL, 'PROPRO', NULL, NULL, NULL, 0, NULL, NULL, NULL, '2026-08-18 09:54:03', '2026-08-18 09:54:03'),
(296, 16, 7, NULL, 'PROPRO', NULL, NULL, NULL, 0, NULL, NULL, NULL, '2026-08-18 09:54:03', '2026-08-18 09:54:03'),
(297, 17, 8, NULL, 'PROPRO', NULL, NULL, NULL, 0, NULL, NULL, NULL, '2026-08-18 09:54:03', '2026-08-18 09:54:03'),
(298, NULL, 16, NULL, 'PROPRO', NULL, NULL, NULL, 1, NULL, '2026-08-24 20:39:49', NULL, '2026-08-18 09:54:03', '2026-08-24 20:39:49'),
(301, NULL, 14, 122, 'PROSPROS', NULL, NULL, NULL, 0, NULL, NULL, NULL, '2026-08-18 11:06:44', '2026-08-18 11:06:44'),
(302, NULL, 19, 123, 'PRESPRES', NULL, NULL, NULL, 1, NULL, '2026-08-18 21:51:46', NULL, '2026-08-18 21:51:45', '2026-08-18 21:51:46'),
(305, NULL, 19, 9, 'Department orientation completed', NULL, NULL, NULL, 1, NULL, '2026-08-25 03:13:07', NULL, '2026-08-25 03:13:05', '2026-08-25 03:13:07'),
(306, NULL, 19, 124, 'P_R_O', NULL, NULL, NULL, 1, NULL, '2026-08-30 15:33:54', NULL, '2026-08-25 03:14:03', '2026-08-30 15:33:54'),
(307, NULL, 19, 122, 'PROSPROS', NULL, NULL, NULL, 1, NULL, '2026-08-30 15:33:54', NULL, '2026-08-25 03:14:10', '2026-08-30 15:33:54'),
(308, 5, 3, 122, 'PROSPROS', NULL, NULL, NULL, 1, NULL, '2026-08-30 17:00:43', NULL, '2026-08-25 03:15:46', '2026-08-30 17:00:43'),
(309, 5, 3, 124, 'P_R_O', NULL, NULL, NULL, 1, NULL, '2026-08-30 17:00:45', NULL, '2026-08-25 03:15:56', '2026-08-30 17:00:45'),
(310, NULL, 19, 125, 'meron upload', NULL, NULL, NULL, 1, NULL, '2026-08-30 15:33:54', NULL, '2026-08-25 03:22:23', '2026-08-30 15:33:54'),
(311, 5, 3, 125, 'meron upload', 'onboarding_documents/y1TugAbpGpnSaoh5cVNWyXa6GNXSz5sAkeDKpBxX.bin', 'Daniel_Villanueva_Reservations_Officer_Resume.docx', 'test', 1, '2026-08-29 14:07:10', '2026-08-29 12:22:27', NULL, '2026-08-25 03:22:51', '2026-08-29 14:07:10'),
(312, NULL, 16, 124, 'P_R_O', NULL, NULL, NULL, 1, NULL, '2026-08-25 05:14:06', NULL, '2026-08-25 05:14:05', '2026-08-25 05:14:06'),
(313, NULL, 16, 125, 'meron upload', NULL, NULL, NULL, 0, NULL, NULL, NULL, '2026-08-25 05:14:09', '2026-08-25 05:14:11'),
(314, 5, 3, 126, 'try', 'onboarding_documents/zwPSuaVxOuWgoh9yGNAqtCSxcsFukpsHNBSlRAkl.png', 'Jerome_Vincent_Alonzo_Hotel_Airport_Transfer_Coordinator.png', 'daniel', 1, '2026-08-29 14:15:24', '2026-08-30 17:00:46', NULL, '2026-08-25 05:22:38', '2026-08-30 17:00:46'),
(315, 5, 3, 127, 'test', NULL, NULL, 'test', 1, '2026-08-25 05:26:07', '2026-08-25 05:26:24', NULL, '2026-08-25 05:25:54', '2026-08-25 05:26:24'),
(316, NULL, 19, 126, 'try', NULL, NULL, NULL, 1, NULL, '2026-08-30 15:33:55', NULL, '2026-08-26 04:36:04', '2026-08-30 15:33:55'),
(317, NULL, 19, 127, 'test', NULL, NULL, NULL, 1, NULL, '2026-08-30 15:33:55', NULL, '2026-08-26 04:36:05', '2026-08-30 15:33:55'),
(318, NULL, 14, 125, 'meron upload', 'onboarding_documents/Oi1CfrVaxJNkAasgaIaEOgH07hfpFsL59tnwiEwV.pdf', 'Front_Office_Supervisor.pdf', NULL, 0, '2026-08-29 12:24:03', NULL, NULL, '2026-08-29 12:23:04', '2026-08-29 12:24:03'),
(319, NULL, 14, 126, 'try', 'onboarding_documents/o0XSP1BF6EAdv8Enx9qhKi3Od8DoanJopgbJmFxb.pdf', 'Kitchen_Operations_Supervisor.pdf', 'try try', 1, '2026-08-29 12:27:05', '2026-08-29 17:01:38', NULL, '2026-08-29 12:25:25', '2026-08-29 17:01:38'),
(320, NULL, 14, 128, 'g', 'onboarding_documents/21Gm5EASBj2Rhcdnp89kPD1SccTj1GBGmQxGY7qc.pdf', 'Kitchen_Operations_Supervisor.pdf', 'ggg', 1, '2026-08-29 12:28:22', '2026-08-29 17:01:16', NULL, '2026-08-29 12:28:22', '2026-08-29 17:01:16'),
(321, 5, 3, 128, 'g', 'onboarding_documents/0rF6eDBbhWMzWbYZuFAf2udymqfeYvaCNmlxrGlT.pdf', 'Patricia_Elaine_Ramos_Hotel_Purchasing_Supervisor.pdf', NULL, 1, '2026-08-29 16:09:20', '2026-08-29 12:37:05', NULL, '2026-08-29 12:37:05', '2026-08-29 16:09:20'),
(322, NULL, 14, 129, 'trra', 'onboarding_documents/M0Byxj2vSZTtIqP1UQGCBJBs6nZcrj57Tro2o1wf.pdf', 'Housekeeping_Supervisor.pdf', 'hehehehe', 1, '2026-08-29 13:12:31', '2026-08-29 17:01:39', NULL, '2026-08-29 13:09:02', '2026-08-29 17:01:39'),
(323, 5, 3, 130, '1', 'onboarding_documents/XGmjAx08Npn8Zh26w1vHpkuRICdk2Z4rmjEm4qYf.jpg', 'Patricia_Elaine_Ramos_Restaurant_Supply_Chain_Coordinator.jpg', 'jjjj', 1, '2026-08-29 15:54:23', '2026-08-30 17:00:50', NULL, '2026-08-29 13:39:45', '2026-08-30 17:00:50'),
(324, NULL, 14, 130, '1', NULL, NULL, NULL, 1, NULL, '2026-08-29 16:50:36', NULL, '2026-08-29 16:50:35', '2026-08-29 16:50:36'),
(325, NULL, 14, 131, '2', NULL, NULL, NULL, 1, NULL, '2026-08-29 16:50:59', NULL, '2026-08-29 16:50:58', '2026-08-29 16:50:59'),
(326, NULL, 14, 124, 'P_R_O', NULL, NULL, NULL, 1, NULL, '2026-08-29 16:51:00', NULL, '2026-08-29 16:51:00', '2026-08-29 16:51:00'),
(327, 17, 8, 129, 'trra', NULL, NULL, NULL, 1, NULL, '2026-08-29 17:01:58', NULL, '2026-08-29 17:01:57', '2026-08-29 17:01:58'),
(328, 17, 8, 128, 'g', NULL, NULL, NULL, 1, NULL, '2026-08-29 17:01:59', NULL, '2026-08-29 17:01:58', '2026-08-29 17:01:59'),
(329, 17, 8, 127, 'test', NULL, NULL, NULL, 1, NULL, '2026-08-29 17:02:00', NULL, '2026-08-29 17:02:00', '2026-08-29 17:02:00'),
(330, NULL, 19, 128, 'g', NULL, NULL, NULL, 1, NULL, '2026-08-30 15:33:57', NULL, '2026-08-30 15:33:55', '2026-08-30 15:33:57'),
(331, NULL, 19, 129, 'trra', NULL, NULL, NULL, 1, NULL, '2026-08-30 15:33:57', NULL, '2026-08-30 15:33:55', '2026-08-30 15:33:57'),
(332, NULL, 19, 130, '1', NULL, NULL, NULL, 1, NULL, '2026-08-30 15:33:57', NULL, '2026-08-30 15:33:56', '2026-08-30 15:33:57'),
(333, NULL, 19, 131, '2', NULL, NULL, NULL, 1, NULL, '2026-08-30 15:33:58', NULL, '2026-08-30 15:33:56', '2026-08-30 15:33:58'),
(334, 5, 3, 129, 'trra', NULL, NULL, NULL, 1, NULL, '2026-08-30 17:00:50', NULL, '2026-08-30 17:00:44', '2026-08-30 17:00:50'),
(335, 5, 3, 131, '2', NULL, NULL, NULL, 1, NULL, '2026-08-30 17:00:51', NULL, '2026-08-30 17:00:44', '2026-08-30 17:00:51'),
(336, NULL, 24, 123, 'PRESPRES', NULL, NULL, NULL, 0, NULL, NULL, NULL, '2026-09-02 00:04:20', '2026-09-02 00:04:20'),
(337, NULL, 25, 123, 'PRESPRES', NULL, NULL, NULL, 1, NULL, '2026-09-02 00:06:23', NULL, '2026-09-02 00:05:36', '2026-09-02 00:06:23');

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
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `interviews`
--

INSERT INTO `interviews` (`interview_id`, `interview_code`, `applicant_id`, `scheduled_date`, `scheduled_time`, `mode`, `interviewer_employee_id`, `interviewer_name`, `status`, `created_at`, `updated_at`) VALUES
(1, 'INT-201', 10, '2026-09-02', '09:00:00', 'On-site', 1, 'Ana Ramos', 'Scheduled', '2026-08-17 00:31:34', '2026-09-02 00:03:52'),
(3, 'INT-203', 4, '2026-07-29', '16:00:00', 'On-site', 2, 'Chef Gabriel Mendoza', 'Scheduled', '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(4, 'INT-204', 5, '2026-07-30', '10:00:00', 'On-site', 2, 'Chef Gabriel Mendoza', 'Completed', '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(5, 'INT-205', 9, '2026-08-17', '08:00:00', 'On-site', 1, 'Chef Gabriel Mendoza', 'Scheduled', '2026-08-17 00:31:34', '2026-08-16 22:28:41'),
(12, 'INT-00207', 16, '2026-08-18', '08:00:00', 'On-site', NULL, 'Ana Ramos', 'Scheduled', '2026-08-18 04:03:48', '2026-08-18 04:03:48'),
(13, 'INT-00208', 15, '2026-09-01', '08:00:00', 'On-site', NULL, 'Ana Ramos', 'Scheduled', '2026-08-18 04:04:08', '2026-08-31 13:34:06'),
(14, 'INT-00209', 18, '2026-08-19', '08:00:00', 'On-site', NULL, 'Chef Gabriel Mendoza', 'Scheduled', '2026-08-18 05:40:08', '2026-08-18 10:46:32'),
(15, 'INT-00210', 17, '2026-09-01', '08:00:00', 'On-site', NULL, 'Ana Ramos', 'Cancelled', '2026-08-18 05:41:23', '2026-08-31 16:09:06'),
(16, 'INT-00211', 19, '2026-08-19', '08:00:00', 'On-site', NULL, 'Ana Ramos', 'Scheduled', '2026-08-18 08:17:21', '2026-08-18 08:17:45'),
(18, 'INT-00212', 22, '2026-08-19', '08:00:00', 'On-site', NULL, 'Ana Ramos', 'Scheduled', '2026-08-18 08:42:14', '2026-08-18 08:42:57'),
(20, 'INT-00214', 24, '2026-08-19', '08:00:00', 'On-site', NULL, 'Ana Ramos', 'Scheduled', '2026-08-18 10:47:34', '2026-08-18 10:47:34'),
(22, 'INT-00215', 53, '2026-09-01', '08:00:00', 'On-site', NULL, 'Juan Dela Cruz', 'Scheduled', '2026-08-31 11:33:56', '2026-08-31 11:33:56'),
(26, 'INT-00216', 46, '2026-09-01', '08:00:00', 'On-site', NULL, 'Ana Ramos', 'Scheduled', '2026-08-31 12:45:05', '2026-08-31 12:45:05'),
(27, 'INT-00217', 55, '2026-09-01', '08:00:00', 'On-site', NULL, 'Ana Ramos', 'Scheduled', '2026-08-31 12:57:21', '2026-08-31 12:57:21'),
(28, 'INT-00218', 58, '2026-09-01', '08:00:00', 'On-site', NULL, 'Ana Ramos', 'Scheduled', '2026-09-01 22:21:20', '2026-09-01 22:23:11'),
(29, 'INT-00219', 59, '2026-09-02', '08:00:00', 'On-site', NULL, 'Ana Ramos', 'Scheduled', '2026-09-02 00:05:22', '2026-09-02 00:05:22');

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
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `job_posts`
--

INSERT INTO `job_posts` (`job_post_id`, `slug`, `title`, `department_id`, `position_id`, `employment_type`, `schedule`, `salary_min`, `salary_max`, `vacancies`, `filled_count`, `posted_date`, `status`, `active`, `experience_level`, `education_level`, `summary`, `description`, `responsibilities_json`, `qualifications_json`, `skills_json`, `benefits_json`, `picture`, `created_at`, `updated_at`) VALUES
(1, 'bartender-1', 'Bartender', 2, 4, 'Full-time', 'Night Shift5', 190005.00, 230005.00, 25, 1, '2026-05-22', 'Open', 1, '1-2 Years', 'Bachelor\'s Degree', 'updated summary5', 'updated summary5', '[\"x5\"]', '[\"Bachelor\'s degree or College level in Hospitality Management or related field.\",\"Excellent communication and interpersonal skills.\",\"Basic computer skills.\",\"Customer service experience is an advantage.\",\"Willing to work shifts, weekends, and holidays.5\"]', '[\"Customer Service\",\"Communication\",\"Hotel Operations\",\"Problem Solving\",\"Time Management5\"]', '[\"HMO\",\"Service Charge\",\"Paid Leave\",\"Meal Allowance\",\"Career Growth5\"]', 'job-post-pictures/eHC33w4haLFV8cmXrtwFzis3ij8fOF9BxBddk1gs.jpg', '2026-08-17 00:31:34', '2026-08-18 09:21:14'),
(2, 'line-cook', 'Line Cook', 3, 5, 'Full-time', 'Shifting Schedule', 16000.00, 20000.00, 4, 2, '2026-05-18', 'Open', 1, '1-2 Years', 'Vocational / TESDA', 'Prepare and cook menu items to standard, maintain station cleanliness and food safety compliance.', 'Prepare and cook menu items to standard, maintain station cleanliness and food safety compliance.', '[\"Prepare mise en place before each service.\",\"Cook and plate dishes to recipe standards.\",\"Maintain sanitation and food-safety compliance.\",\"Monitor inventory levels of station ingredients.\",\"Support banquet and room-service volume peaks.\"]', '[\"TESDA NC II in Cookery or equivalent culinary training.\",\"At least 1 year in a hotel or full-service restaurant kitchen.\",\"Valid food handler\'s certificate.\",\"Able to work under pressure during peak service.\"]', '[\"Food Safety\",\"HACCP\",\"Knife Skills\",\"Plating\",\"Teamwork\"]', '[\"HMO\",\"Service Charge\",\"Meal Allowance\",\"Uniform\",\"Training\"]', NULL, '2026-08-17 00:31:34', '2026-08-26 03:31:17'),
(3, 'housekeeping-attendant', 'Housekeeping Attendant', 4, 7, 'Full-time', 'Shifting Schedule', 14000.00, 17000.00, 5, 3, '2026-05-10', 'Open', 1, 'No Experience', 'High School Graduate', 'Maintain guestroom cleanliness, linen turnover, and public-area presentation to brand standards.', 'Housekeeping Attendants keep guestrooms and public areas immaculate, restock amenities, and report maintenance issues. Full training is provided for applicants with no prior hotel experience.', '[\"Clean and prepare assigned guestrooms daily.\",\"Replenish linens, towels, and amenities.\",\"Report maintenance and lost-and-found items.\",\"Maintain housekeeping cart and supplies.\"]', '[\"High School Graduate.\",\"Physically fit and detail-oriented.\",\"Willing to work shifts including weekends and holidays.\"]', '[\"Attention to Detail\",\"Time Management\",\"Room Turnover\",\"Safety\"]', '[\"HMO\",\"Service Charge\",\"Meal Allowance\",\"Uniform\"]', NULL, '2026-08-17 00:31:34', '2026-08-31 11:51:30'),
(4, 'restaurant-server', 'Restaurant Server', 2, 3, 'Full-time', 'Shifting Schedule', 15000.00, 18000.00, 4, 1, '2026-05-20', 'Closed', 0, 'No Experience', 'High School Graduate', 'Deliver warm, accurate table service across the dining room and banquet operations.', 'Restaurant Servers take orders, serve food and beverages, and ensure every guest leaves with a memorable dining experience at our all-day dining outlet.', '[\"Greet and seat guests warmly.\",\"Take and relay orders accurately to the kitchen.\",\"Serve food and beverages following service sequence.\",\"Handle billing and guest feedback.\"]', '[\"High School Graduate; hospitality training an advantage.\",\"Good communication skills in English and Filipino.\",\"Pleasant personality and grooming.\"]', '[\"Guest Service\",\"Upselling\",\"POS Systems\",\"Communication\"]', '[\"HMO\",\"Service Charge\",\"Meal Allowance\",\"Tips\"]', NULL, '2026-08-17 00:31:34', '2026-08-18 09:20:41'),
(5, 'bartender', 'Bartender', 2, 4, 'Part-time', 'Night Shift', 16000.00, 19000.00, 2, 0, '2026-05-15', 'Closed', 0, '3-5 Years', 'Vocational / TESDA', 'Craft classic and signature cocktails for the lobby lounge and rooftop bar.', 'The Bartender prepares beverages to recipe, manages bar inventory, and creates a lively yet refined guest experience at the lounge.', '[\"Prepare cocktails and beverages to standard.\",\"Maintain bar cleanliness and inventory.\",\"Engage guests and recommend pairings.\",\"Observe responsible alcohol service.\"]', '[\"TESDA Bartending NC II or equivalent.\",\"At least 3 years bar experience in hotels or restaurants.\",\"Knowledge of classic and modern mixology.\"]', '[\"Mixology\",\"Inventory Control\",\"Guest Engagement\",\"Cash Handling\"]', '[\"HMO\",\"Service Charge\",\"Meal Allowance\",\"Night Differential\"]', NULL, '2026-08-17 00:31:34', '2026-08-18 09:20:40'),
(6, 'hr-assistant', 'HR Assistant', 5, 8, 'Full-time', 'Day Shift', 20000.00, 25000.00, 1, 0, '2026-05-08', 'Open', 1, '1-2 Years', 'Bachelor\'s Degree', 'Support recruitment, employee records, and HR document processing.', 'The HR Assistant supports end-to-end recruitment coordination, 201-file maintenance, and employee request processing for the property.', '[\"Coordinate interview schedules with department heads.\",\"Maintain complete and accurate 201 files.\",\"Process COE and employment verification requests.\",\"Assist in new-hire onboarding documentation.\"]', '[\"Bachelor\'s degree in Psychology, HR, or related field.\",\"At least 1 year HR experience.\",\"Strong organizational and documentation skills.\"]', '[\"Recruitment\",\"Documentation\",\"MS Office\",\"Confidentiality\"]', '[\"HMO\",\"Paid Leave\",\"Career Growth\",\"Training\"]', NULL, '2026-08-17 00:31:34', '2026-08-30 15:07:43'),
(12, 'general-manager', 'General Manager', 5, 9, 'Seasonal', 'Shifting Schedule5', 5.00, 5.00, 15, 0, '2026-08-18', 'Closed', 0, NULL, NULL, '5', '5', '[\"5\"]', '[\"5\"]', '[\"5\"]', '[\"5\"]', 'job-post-pictures/N9uA1rNh0yLgaItzh0VLBSwZwTLgKGUhw7jKA9Mg.jpg', '2026-08-18 09:22:12', '2026-08-25 03:07:32'),
(13, 'hr-administration-manager', 'HR & Administration Manager', 5, 14, 'Full-time', 'Shifting Schedule', 0.00, 0.00, 1, 0, '2026-08-18', 'Closed', 0, NULL, NULL, NULL, NULL, '[]', '[]', '[]', '[]', 'job-post-pictures/TV36vkczRy1cSnj20lFuGTJb3wjBYwIuFIziCXNu.jpg', '2026-08-18 09:32:56', '2026-08-25 03:07:31'),
(14, 'front-office-manager', 'Front Office Manager', 1, 10, 'Full-time', 'Shifting Schedule', 0.00, 0.00, 1, 0, '2026-08-19', 'Closed', 0, NULL, NULL, NULL, NULL, '[]', '[]', '[]', '[]', 'job-post-pictures/ilbUmYCHlO6iCL5mkVMCfeCzmN2SmOpE9LWjNzII.png', '2026-08-19 04:53:42', '2026-08-25 03:07:15'),
(15, 'guest-relations-officer', 'Guest Relations Officer', 1, 2, 'Full-time', NULL, 20000.00, 28000.00, 1, 0, NULL, 'Open', 1, '1-2 Years', 'Bachelor\'s Degree', NULL, 'Welcomes and assists hotel guests, coordinates with front office and housekeeping, and handles service recovery.', NULL, '[\"Bachelor degree in Hospitality or related field\",\"At least 1 year guest-facing experience\"]', '[\"Guest Relations\",\"Front Office Operations\",\"Reservations\",\"Complaint Handling\"]', NULL, NULL, '2026-08-24 03:53:23', '2026-08-24 03:53:23'),
(16, 'front-desk-receptionist', 'Front Desk Receptionist', 1, 1, 'Full-time', NULL, 18000.00, 25000.00, 2, 0, NULL, 'Open', 1, '1-2 Years', 'Bachelor\'s Degree', NULL, 'Front-line hotel reception: check-in and check-out, reservations, guest inquiries, and coordination with housekeeping.', NULL, '[\"Bachelor degree in Hospitality or related field preferred\",\"At least 1 year front desk experience\"]', '[\"Guest Relations\",\"Check-in \\/ Check-out\",\"Reservations\",\"Property Management Systems\",\"Cash Handling\"]', NULL, NULL, '2026-08-24 04:04:50', '2026-08-24 04:04:50'),
(18, 'floor-supervisor', 'Floor Supervisor', 4, 15, 'Full-time', 'Shifting Schedule', 0.00, 0.00, 1, 0, '2026-09-02', 'Draft', 0, NULL, NULL, 'hahahahaha', 'hahahahaha', '[]', '[]', '[]', NULL, NULL, '2026-09-01 22:27:42', '2026-09-01 22:27:42');

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
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `job_post_platforms`
--

INSERT INTO `job_post_platforms` (`job_post_platform_id`, `job_post_id`, `platform`, `published_at`, `status`, `created_at`) VALUES
(1, 1, 'Company Website', '2026-05-21 16:00:00', 'unpublished', '2026-08-17 00:31:34'),
(2, 1, 'Facebook', '2026-08-18 09:21:14', 'published', '2026-08-17 00:31:34'),
(3, 1, 'Indeed', '2026-08-18 09:21:14', 'published', '2026-08-17 00:31:34'),
(4, 2, 'Company Website', '2026-05-17 16:00:00', 'unpublished', '2026-08-17 00:31:34'),
(5, 2, 'Indeed', '2026-08-26 03:31:17', 'published', '2026-08-17 00:31:34'),
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
(31, 14, 'Indeed', '2026-08-19 04:53:42', 'published', '2026-08-19 12:53:42'),
(32, 2, 'Website', '2026-08-26 03:31:17', 'published', '2026-08-26 11:31:17'),
(33, 2, 'Facebook', '2026-08-26 03:31:17', 'published', '2026-08-26 11:31:17');

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
) ENGINE=InnoDB AUTO_INCREMENT=69 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
(57, '2026_08_15_171717_create_personal_access_tokens_table', 13),
(58, '2026_08_23_000001_create_applicant_screenings_table', 14),
(59, '2026_08_22_000001_add_upload_and_instructions_to_onboarding_items', 15),
(60, '2026_08_23_000002_create_screening_ground_truths_table', 15),
(61, '2026_08_24_000001_create_screening_reference_data_table', 16),
(62, '2026_08_25_000001_add_otp_enabled_to_system_users_table', 17),
(63, '2026_08_25_000002_add_submitted_at_to_employee_onboarding_items', 18),
(64, '2026_08_27_000001_add_resume_original_name_to_applicants_table', 19),
(65, '2026_08_20_000001_create_chatbot_tables', 20),
(66, '2026_08_22_000001_create_social_recognitions_and_reactions_tables', 20),
(67, '2026_08_22_120000_add_super_admin_and_protected_flags_to_system_roles', 20),
(68, '2026_08_31_000001_add_evaluation_requested_at_to_new_hires_table', 21);

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
  UNIQUE KEY `uq_new_hires_new_hire_code` (`new_hire_code`),
  KEY `fk_new_hires_applicant_id` (`applicant_id`),
  KEY `fk_new_hires_department_id` (`department_id`),
  KEY `fk_new_hires_employee_id` (`employee_id`),
  KEY `fk_new_hires_position_id` (`position_id`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `new_hires`
--

INSERT INTO `new_hires` (`new_hire_id`, `new_hire_code`, `applicant_id`, `employee_id`, `name`, `email`, `phone`, `position_id`, `department_id`, `stage`, `start_date`, `evaluation_requested_at`, `created_at`, `updated_at`) VALUES
(1, 'NH-01', 1, 4, 'Camille Ortega', 'camille.ortega@email.com', '0917 664 2219', 2, 1, 'Pre-onboarding', '2026-08-04', NULL, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(2, 'NH-02', 10, 13, 'Bianca Soriano', 'bianca.soriano@email.com', '0912 345 6789', 1, 1, 'Pre-onboarding', '2026-08-04', NULL, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(3, 'NH-03', 5, 5, 'Kevin Dela Cruz', 'kevin.delacruz@email.com', '0921 774 9903', 5, 3, 'Regular', '2026-04-15', NULL, '2026-08-17 00:31:34', '2026-08-30 17:00:54'),
(4, 'NH-04', 4, 14, 'Jompaks Berdugo', 'jompaks.berdugo@email.com', '0933 552 1180', 4, 2, 'Probationary', '2026-03-01', NULL, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(5, 'NH-05', 9, 6, 'Marjun Devera', 'marjun.devera@email.com', '0917 664 2219', 3, 2, 'Regular', '2025-09-16', NULL, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(6, 'NH-06', NULL, 15, 'Angelo Torres', 'angelo.torres@email.com', '0917 220 5541', 1, 1, 'Probationary', '2026-05-11', NULL, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(7, 'NH-07', NULL, 16, 'Ligaya Santos', 'ligaya.santos@email.com', '0918 663 2201', 7, 4, 'Probationary', '2026-02-20', NULL, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(8, 'NH-08', NULL, 17, 'Michael Reyes', 'michael.reyes@email.com', '0920 441 8873', 8, 5, 'Probationary', '2026-06-01', NULL, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(9, 'NH-09', NULL, 18, 'Patricia Gomez', 'patricia.gomez@email.com', '0917 903 2245', 6, 3, 'Regular', '2025-06-02', NULL, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(10, 'NH-10', NULL, 19, 'Ernesto Villar', 'ernesto.villar@email.com', '0921 556 7743', 7, 4, 'Regular', '2025-03-19', NULL, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(11, 'NH-11', NULL, 20, 'Grace Panganiban', 'grace.panganiban@email.com', '0917 332 8890', 2, 1, 'Regular', '2025-11-10', NULL, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(12, 'NH-12', NULL, 21, 'Noel Fajardo', 'noel.fajardo@email.com', '0918 774 3320', 8, 5, 'Regular', '2025-01-27', NULL, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(14, 'NH-00013', 23, NULL, 'bcbc', 'bcbc@mga.com', '0912312300', 1, 1, 'Probationary', '2026-08-18', NULL, '2026-08-18 08:48:00', '2026-08-18 11:06:44'),
(15, 'NH-00014', 22, NULL, 'imga1', 'imga1@gmail.com', '09123123001', 1, 1, 'Pre-onboarding', '2026-08-18', NULL, '2026-08-18 08:48:29', '2026-08-18 08:48:29'),
(16, 'NH-00015', 16, NULL, 'im1', 'im1@gmail.com', '0912312300', 4, 2, 'Probationary', '2026-08-18', NULL, '2026-08-18 09:51:02', '2026-08-18 09:52:14'),
(18, 'NH-00016', 23, NULL, 'bcbc', 'bcbc@mga.com', '0912312300', 4, 2, 'Pre-onboarding', '2026-08-18', NULL, '2026-08-18 10:43:08', '2026-08-18 10:43:08'),
(19, 'NH-00017', 19, NULL, 'ADMIN-img2', 'ADMIN-img2@gmail.com', '0912312300', 4, 2, 'Probationary', '2026-08-18', NULL, '2026-08-18 10:44:40', '2026-08-30 18:00:27'),
(20, 'NH-00018', 24, NULL, 'f1', 'f1@gmail.com', '0912312300', 4, 2, 'Pre-onboarding', '2026-08-18', NULL, '2026-08-18 10:48:14', '2026-08-18 10:48:14'),
(22, 'NH-00019', 46, NULL, 'Vincent Paul Soriano', 'vincent.soriano.hotel@gmail.com', '09172458813', 1, 1, 'Pre-onboarding', '2026-08-31', NULL, '2026-08-31 12:52:45', '2026-08-31 12:52:45'),
(23, 'NH-00020', 55, NULL, 'CARLO MIGUEL FERNAN', 'carlo.fernandez.chef@gmail.com', '09284417702', 5, 3, 'Pre-onboarding', '2026-08-31', NULL, '2026-08-31 12:58:49', '2026-08-31 12:58:49'),
(24, 'NH-00021', 10, NULL, 'Bianca Soriano', 'bianca.soriano@email.com', '0912 345 6789', 4, 2, 'Pre-onboarding', '2026-09-02', NULL, '2026-09-02 00:04:20', '2026-09-02 00:04:20'),
(25, 'NH-00022', 59, NULL, 'Camille Rose Evangelista', 'camille.evangelista.spa@gmail.com', '09953182647', 1, 1, 'Probationary', '2026-09-02', NULL, '2026-09-02 00:05:36', '2026-09-02 00:06:48');

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
) ENGINE=InnoDB AUTO_INCREMENT=1040 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`notification_id`, `system_user_id`, `type`, `title`, `body`, `module_name`, `target_type`, `target_id`, `is_read`, `read_at`, `created_at`) VALUES
(1, 2, 'ess_request', 'New ESS request pending', 'Sick leave request REQ-4410 filed by Kevin Dela Cruz awaits review.', 'ESS Management', 'ess_request', 'REQ-4410', 0, NULL, '2026-08-17 00:31:35'),
(2, 2, 'hr3', 'HR3 recommendation pending', 'Regularization recommendation for Camille Ortega is pending HR action.', 'Core HCM', 'hr3_recommendation', 'HR3-REC-01', 0, NULL, '2026-08-17 00:31:35'),
(3, 2, 'checklist', 'Checklist request raised', 'Miguel Torres probationary checklist requested (CR-001).', 'New Hire Onboarding', 'checklist_request', 'CR-001', 0, NULL, '2026-08-17 00:31:35'),
(4, 2, 'checklist', 'Checklist request raised', 'Andrea Lim probationary checklist requested (CR-002).', 'New Hire Onboarding', 'checklist_request', 'CR-002', 0, NULL, '2026-08-17 00:31:35'),
(5, 3, 'ess_request', 'Interview reminder', 'Interview with Bianca Soriano scheduled for 2026-07-28, 09:00 AM.', 'Applicant Management', 'interview', 'INT-201', 1, '2026-08-26 06:27:25', '2026-08-17 00:31:35'),
(6, 3, 'hr3', 'HR3 recommendation submitted', 'Regularization recommendation for Camille Ortega submitted for review.', 'Core HCM', 'hr3_recommendation', 'HR3-REC-01', 1, '2026-08-01 17:00:00', '2026-08-17 00:31:35'),
(7, 1, 'audit', 'Critical audit event', 'Permission matrix was modified for role Admin.', 'User Management', 'audit_log', 'LOG-9001', 1, '2026-08-26 02:03:34', '2026-08-17 00:31:35'),
(8, 7, 'ess_request', 'COE request assigned', 'Certificate of Employment request REQ-4409 assigned to you.', 'ESS Management', 'ess_request', 'REQ-4409', 0, NULL, '2026-08-17 00:31:35'),
(9, 8, 'ess_request', 'Loan application under review', 'Company loan application REQ-4405 assigned to you.', 'ESS Management', 'ess_request', 'REQ-4405', 0, NULL, '2026-08-17 00:31:35'),
(10, 1, 'info', 'New applicant: MARIA SANTOS', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '26', 1, '2026-08-26 02:03:34', '2026-08-22 15:48:31'),
(11, 2, 'info', 'New applicant: MARIA SANTOS', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '26', 0, NULL, '2026-08-22 15:48:31'),
(12, 3, 'info', 'New applicant: MARIA SANTOS', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '26', 1, '2026-08-26 06:27:26', '2026-08-22 15:48:31'),
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
(24, 1, 'info', 'New applicant: MARIA SANTOS', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '27', 1, '2026-08-26 02:03:34', '2026-08-22 15:51:53'),
(25, 2, 'info', 'New applicant: MARIA SANTOS', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '27', 0, NULL, '2026-08-22 15:51:53'),
(26, 3, 'info', 'New applicant: MARIA SANTOS', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '27', 1, '2026-08-26 06:27:26', '2026-08-22 15:51:53'),
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
(38, 1, 'info', 'New applicant: TEST PDF OFFLINE', 'Submitted application with screening score 0%.', 'Applicant Management', 'Applicant', '28', 1, '2026-08-26 02:03:34', '2026-08-22 15:54:20'),
(39, 2, 'info', 'New applicant: TEST PDF OFFLINE', 'Submitted application with screening score 0%.', 'Applicant Management', 'Applicant', '28', 0, NULL, '2026-08-22 15:54:20'),
(40, 3, 'info', 'New applicant: TEST PDF OFFLINE', 'Submitted application with screening score 0%.', 'Applicant Management', 'Applicant', '28', 1, '2026-08-26 06:27:27', '2026-08-22 15:54:20'),
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
(52, 1, 'info', 'New applicant: MARIA SANTOS', 'Submitted application with screening score 57.00%.', 'Applicant Management', 'Applicant', '29', 1, '2026-08-26 02:03:34', '2026-08-22 17:09:11'),
(53, 2, 'info', 'New applicant: MARIA SANTOS', 'Submitted application with screening score 57.00%.', 'Applicant Management', 'Applicant', '29', 0, NULL, '2026-08-22 17:09:11'),
(54, 3, 'info', 'New applicant: MARIA SANTOS', 'Submitted application with screening score 57.00%.', 'Applicant Management', 'Applicant', '29', 1, '2026-08-26 06:27:28', '2026-08-22 17:09:11'),
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
(66, 1, 'info', 'New applicant: Basil Fawty', 'Submitted application with screening score 42.00%.', 'Applicant Management', 'Applicant', '30', 1, '2026-08-26 02:03:34', '2026-08-22 18:31:16'),
(67, 2, 'info', 'New applicant: Basil Fawty', 'Submitted application with screening score 42.00%.', 'Applicant Management', 'Applicant', '30', 0, NULL, '2026-08-22 18:31:16'),
(68, 3, 'info', 'New applicant: Basil Fawty', 'Submitted application with screening score 42.00%.', 'Applicant Management', 'Applicant', '30', 1, '2026-08-26 06:27:28', '2026-08-22 18:31:16'),
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
(80, 1, 'info', 'New applicant: Julian Rivera', 'Submitted application with screening score 79.00%.', 'Applicant Management', 'Applicant', '31', 1, '2026-08-26 02:03:34', '2026-08-23 09:50:39'),
(81, 2, 'info', 'New applicant: Julian Rivera', 'Submitted application with screening score 79.00%.', 'Applicant Management', 'Applicant', '31', 0, NULL, '2026-08-23 09:50:39'),
(82, 3, 'info', 'New applicant: Julian Rivera', 'Submitted application with screening score 79.00%.', 'Applicant Management', 'Applicant', '31', 1, '2026-08-26 06:27:31', '2026-08-23 09:50:39'),
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
(93, 16, 'info', 'New applicant: Julian Rivera', 'Submitted application with screening score 79.00%.', 'Applicant Management', 'Applicant', '31', 0, NULL, '2026-08-23 09:50:39'),
(94, 1, 'info', 'New applicant: Lorenzo Miguel Santiago', 'Submitted application with screening score 62.00%.', 'Applicant Management', 'Applicant', '32', 1, '2026-08-26 02:03:34', '2026-08-25 11:52:47'),
(95, 2, 'info', 'New applicant: Lorenzo Miguel Santiago', 'Submitted application with screening score 62.00%.', 'Applicant Management', 'Applicant', '32', 0, NULL, '2026-08-25 11:52:47'),
(96, 3, 'info', 'New applicant: Lorenzo Miguel Santiago', 'Submitted application with screening score 62.00%.', 'Applicant Management', 'Applicant', '32', 1, '2026-08-26 06:27:29', '2026-08-25 11:52:47'),
(97, 4, 'info', 'New applicant: Lorenzo Miguel Santiago', 'Submitted application with screening score 62.00%.', 'Applicant Management', 'Applicant', '32', 0, NULL, '2026-08-25 11:52:47'),
(98, 6, 'info', 'New applicant: Lorenzo Miguel Santiago', 'Submitted application with screening score 62.00%.', 'Applicant Management', 'Applicant', '32', 0, NULL, '2026-08-25 11:52:47'),
(99, 7, 'info', 'New applicant: Lorenzo Miguel Santiago', 'Submitted application with screening score 62.00%.', 'Applicant Management', 'Applicant', '32', 0, NULL, '2026-08-25 11:52:47'),
(100, 8, 'info', 'New applicant: Lorenzo Miguel Santiago', 'Submitted application with screening score 62.00%.', 'Applicant Management', 'Applicant', '32', 0, NULL, '2026-08-25 11:52:47'),
(101, 10, 'info', 'New applicant: Lorenzo Miguel Santiago', 'Submitted application with screening score 62.00%.', 'Applicant Management', 'Applicant', '32', 0, NULL, '2026-08-25 11:52:47'),
(102, 11, 'info', 'New applicant: Lorenzo Miguel Santiago', 'Submitted application with screening score 62.00%.', 'Applicant Management', 'Applicant', '32', 0, NULL, '2026-08-25 11:52:47'),
(103, 12, 'info', 'New applicant: Lorenzo Miguel Santiago', 'Submitted application with screening score 62.00%.', 'Applicant Management', 'Applicant', '32', 0, NULL, '2026-08-25 11:52:47'),
(104, 13, 'info', 'New applicant: Lorenzo Miguel Santiago', 'Submitted application with screening score 62.00%.', 'Applicant Management', 'Applicant', '32', 0, NULL, '2026-08-25 11:52:47'),
(105, 14, 'info', 'New applicant: Lorenzo Miguel Santiago', 'Submitted application with screening score 62.00%.', 'Applicant Management', 'Applicant', '32', 0, NULL, '2026-08-25 11:52:47'),
(106, 15, 'info', 'New applicant: Lorenzo Miguel Santiago', 'Submitted application with screening score 62.00%.', 'Applicant Management', 'Applicant', '32', 0, NULL, '2026-08-25 11:52:47'),
(107, 16, 'info', 'New applicant: Lorenzo Miguel Santiago', 'Submitted application with screening score 62.00%.', 'Applicant Management', 'Applicant', '32', 0, NULL, '2026-08-25 11:52:47'),
(108, 1, 'info', 'New applicant: ALYSSA MARIE', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '33', 1, '2026-08-26 02:03:34', '2026-08-25 11:59:06'),
(109, 2, 'info', 'New applicant: ALYSSA MARIE', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '33', 0, NULL, '2026-08-25 11:59:06'),
(110, 3, 'info', 'New applicant: ALYSSA MARIE', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '33', 1, '2026-08-26 06:27:20', '2026-08-25 11:59:06'),
(111, 4, 'info', 'New applicant: ALYSSA MARIE', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '33', 0, NULL, '2026-08-25 11:59:06'),
(112, 6, 'info', 'New applicant: ALYSSA MARIE', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '33', 0, NULL, '2026-08-25 11:59:06'),
(113, 7, 'info', 'New applicant: ALYSSA MARIE', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '33', 0, NULL, '2026-08-25 11:59:06'),
(114, 8, 'info', 'New applicant: ALYSSA MARIE', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '33', 0, NULL, '2026-08-25 11:59:06'),
(115, 10, 'info', 'New applicant: ALYSSA MARIE', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '33', 0, NULL, '2026-08-25 11:59:06'),
(116, 11, 'info', 'New applicant: ALYSSA MARIE', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '33', 0, NULL, '2026-08-25 11:59:06'),
(117, 12, 'info', 'New applicant: ALYSSA MARIE', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '33', 0, NULL, '2026-08-25 11:59:06'),
(118, 13, 'info', 'New applicant: ALYSSA MARIE', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '33', 0, NULL, '2026-08-25 11:59:06'),
(119, 14, 'info', 'New applicant: ALYSSA MARIE', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '33', 0, NULL, '2026-08-25 11:59:06'),
(120, 15, 'info', 'New applicant: ALYSSA MARIE', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '33', 0, NULL, '2026-08-25 11:59:06'),
(121, 16, 'info', 'New applicant: ALYSSA MARIE', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '33', 0, NULL, '2026-08-25 11:59:06'),
(122, 1, 'info', 'New applicant: MARIA ANGELA SANTOS', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '34', 1, '2026-08-26 02:03:34', '2026-08-25 12:11:13'),
(123, 2, 'info', 'New applicant: MARIA ANGELA SANTOS', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '34', 0, NULL, '2026-08-25 12:11:13'),
(124, 3, 'info', 'New applicant: MARIA ANGELA SANTOS', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '34', 1, '2026-08-26 06:27:19', '2026-08-25 12:11:13'),
(125, 4, 'info', 'New applicant: MARIA ANGELA SANTOS', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '34', 0, NULL, '2026-08-25 12:11:13'),
(126, 6, 'info', 'New applicant: MARIA ANGELA SANTOS', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '34', 0, NULL, '2026-08-25 12:11:13'),
(127, 7, 'info', 'New applicant: MARIA ANGELA SANTOS', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '34', 0, NULL, '2026-08-25 12:11:13'),
(128, 8, 'info', 'New applicant: MARIA ANGELA SANTOS', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '34', 0, NULL, '2026-08-25 12:11:13'),
(129, 10, 'info', 'New applicant: MARIA ANGELA SANTOS', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '34', 0, NULL, '2026-08-25 12:11:13'),
(130, 11, 'info', 'New applicant: MARIA ANGELA SANTOS', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '34', 0, NULL, '2026-08-25 12:11:13'),
(131, 12, 'info', 'New applicant: MARIA ANGELA SANTOS', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '34', 0, NULL, '2026-08-25 12:11:13'),
(132, 13, 'info', 'New applicant: MARIA ANGELA SANTOS', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '34', 0, NULL, '2026-08-25 12:11:13'),
(133, 14, 'info', 'New applicant: MARIA ANGELA SANTOS', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '34', 0, NULL, '2026-08-25 12:11:13'),
(134, 15, 'info', 'New applicant: MARIA ANGELA SANTOS', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '34', 0, NULL, '2026-08-25 12:11:13'),
(135, 16, 'info', 'New applicant: MARIA ANGELA SANTOS', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '34', 0, NULL, '2026-08-25 12:11:13'),
(136, 1, 'info', 'New applicant: Marielle Anne Santos', 'Submitted application with screening score 72.00%.', 'Applicant Management', 'Applicant', '35', 1, '2026-08-26 02:03:34', '2026-08-25 12:58:53'),
(137, 2, 'info', 'New applicant: Marielle Anne Santos', 'Submitted application with screening score 72.00%.', 'Applicant Management', 'Applicant', '35', 0, NULL, '2026-08-25 12:58:53'),
(138, 3, 'info', 'New applicant: Marielle Anne Santos', 'Submitted application with screening score 72.00%.', 'Applicant Management', 'Applicant', '35', 1, '2026-08-26 06:27:25', '2026-08-25 12:58:53'),
(139, 4, 'info', 'New applicant: Marielle Anne Santos', 'Submitted application with screening score 72.00%.', 'Applicant Management', 'Applicant', '35', 0, NULL, '2026-08-25 12:58:53'),
(140, 6, 'info', 'New applicant: Marielle Anne Santos', 'Submitted application with screening score 72.00%.', 'Applicant Management', 'Applicant', '35', 0, NULL, '2026-08-25 12:58:53'),
(141, 7, 'info', 'New applicant: Marielle Anne Santos', 'Submitted application with screening score 72.00%.', 'Applicant Management', 'Applicant', '35', 0, NULL, '2026-08-25 12:58:53'),
(142, 8, 'info', 'New applicant: Marielle Anne Santos', 'Submitted application with screening score 72.00%.', 'Applicant Management', 'Applicant', '35', 0, NULL, '2026-08-25 12:58:53'),
(143, 10, 'info', 'New applicant: Marielle Anne Santos', 'Submitted application with screening score 72.00%.', 'Applicant Management', 'Applicant', '35', 0, NULL, '2026-08-25 12:58:53'),
(144, 11, 'info', 'New applicant: Marielle Anne Santos', 'Submitted application with screening score 72.00%.', 'Applicant Management', 'Applicant', '35', 0, NULL, '2026-08-25 12:58:53'),
(145, 12, 'info', 'New applicant: Marielle Anne Santos', 'Submitted application with screening score 72.00%.', 'Applicant Management', 'Applicant', '35', 0, NULL, '2026-08-25 12:58:53'),
(146, 13, 'info', 'New applicant: Marielle Anne Santos', 'Submitted application with screening score 72.00%.', 'Applicant Management', 'Applicant', '35', 0, NULL, '2026-08-25 12:58:53'),
(147, 14, 'info', 'New applicant: Marielle Anne Santos', 'Submitted application with screening score 72.00%.', 'Applicant Management', 'Applicant', '35', 0, NULL, '2026-08-25 12:58:53'),
(148, 15, 'info', 'New applicant: Marielle Anne Santos', 'Submitted application with screening score 72.00%.', 'Applicant Management', 'Applicant', '35', 0, NULL, '2026-08-25 12:58:53'),
(149, 16, 'info', 'New applicant: Marielle Anne Santos', 'Submitted application with screening score 72.00%.', 'Applicant Management', 'Applicant', '35', 0, NULL, '2026-08-25 12:58:53'),
(150, 1, 'info', 'New applicant: NICOLE FRANCES HERRERA', 'Submitted application with screening score 83.20%.', 'Applicant Management', 'Applicant', '36', 1, '2026-08-26 02:03:34', '2026-08-25 13:00:33'),
(151, 2, 'info', 'New applicant: NICOLE FRANCES HERRERA', 'Submitted application with screening score 83.20%.', 'Applicant Management', 'Applicant', '36', 0, NULL, '2026-08-25 13:00:33'),
(152, 3, 'info', 'New applicant: NICOLE FRANCES HERRERA', 'Submitted application with screening score 83.20%.', 'Applicant Management', 'Applicant', '36', 1, '2026-08-31 11:56:38', '2026-08-25 13:00:33'),
(153, 4, 'info', 'New applicant: NICOLE FRANCES HERRERA', 'Submitted application with screening score 83.20%.', 'Applicant Management', 'Applicant', '36', 0, NULL, '2026-08-25 13:00:33'),
(154, 6, 'info', 'New applicant: NICOLE FRANCES HERRERA', 'Submitted application with screening score 83.20%.', 'Applicant Management', 'Applicant', '36', 0, NULL, '2026-08-25 13:00:33'),
(155, 7, 'info', 'New applicant: NICOLE FRANCES HERRERA', 'Submitted application with screening score 83.20%.', 'Applicant Management', 'Applicant', '36', 0, NULL, '2026-08-25 13:00:33'),
(156, 8, 'info', 'New applicant: NICOLE FRANCES HERRERA', 'Submitted application with screening score 83.20%.', 'Applicant Management', 'Applicant', '36', 0, NULL, '2026-08-25 13:00:33'),
(157, 10, 'info', 'New applicant: NICOLE FRANCES HERRERA', 'Submitted application with screening score 83.20%.', 'Applicant Management', 'Applicant', '36', 0, NULL, '2026-08-25 13:00:33'),
(158, 11, 'info', 'New applicant: NICOLE FRANCES HERRERA', 'Submitted application with screening score 83.20%.', 'Applicant Management', 'Applicant', '36', 0, NULL, '2026-08-25 13:00:33'),
(159, 12, 'info', 'New applicant: NICOLE FRANCES HERRERA', 'Submitted application with screening score 83.20%.', 'Applicant Management', 'Applicant', '36', 0, NULL, '2026-08-25 13:00:33'),
(160, 13, 'info', 'New applicant: NICOLE FRANCES HERRERA', 'Submitted application with screening score 83.20%.', 'Applicant Management', 'Applicant', '36', 0, NULL, '2026-08-25 13:00:33'),
(161, 14, 'info', 'New applicant: NICOLE FRANCES HERRERA', 'Submitted application with screening score 83.20%.', 'Applicant Management', 'Applicant', '36', 0, NULL, '2026-08-25 13:00:33'),
(162, 15, 'info', 'New applicant: NICOLE FRANCES HERRERA', 'Submitted application with screening score 83.20%.', 'Applicant Management', 'Applicant', '36', 0, NULL, '2026-08-25 13:00:33'),
(163, 16, 'info', 'New applicant: NICOLE FRANCES HERRERA', 'Submitted application with screening score 83.20%.', 'Applicant Management', 'Applicant', '36', 0, NULL, '2026-08-25 13:00:33'),
(164, 1, 'info', 'New applicant: PATRICIA ANNE MENDOZA', 'Submitted application with screening score 72.00%.', 'Applicant Management', 'Applicant', '37', 1, '2026-08-26 02:03:34', '2026-08-25 13:02:20'),
(165, 2, 'info', 'New applicant: PATRICIA ANNE MENDOZA', 'Submitted application with screening score 72.00%.', 'Applicant Management', 'Applicant', '37', 0, NULL, '2026-08-25 13:02:20'),
(166, 3, 'info', 'New applicant: PATRICIA ANNE MENDOZA', 'Submitted application with screening score 72.00%.', 'Applicant Management', 'Applicant', '37', 1, '2026-08-26 06:27:15', '2026-08-25 13:02:20'),
(167, 4, 'info', 'New applicant: PATRICIA ANNE MENDOZA', 'Submitted application with screening score 72.00%.', 'Applicant Management', 'Applicant', '37', 0, NULL, '2026-08-25 13:02:20'),
(168, 6, 'info', 'New applicant: PATRICIA ANNE MENDOZA', 'Submitted application with screening score 72.00%.', 'Applicant Management', 'Applicant', '37', 0, NULL, '2026-08-25 13:02:20'),
(169, 7, 'info', 'New applicant: PATRICIA ANNE MENDOZA', 'Submitted application with screening score 72.00%.', 'Applicant Management', 'Applicant', '37', 0, NULL, '2026-08-25 13:02:20'),
(170, 8, 'info', 'New applicant: PATRICIA ANNE MENDOZA', 'Submitted application with screening score 72.00%.', 'Applicant Management', 'Applicant', '37', 0, NULL, '2026-08-25 13:02:20'),
(171, 10, 'info', 'New applicant: PATRICIA ANNE MENDOZA', 'Submitted application with screening score 72.00%.', 'Applicant Management', 'Applicant', '37', 0, NULL, '2026-08-25 13:02:20'),
(172, 11, 'info', 'New applicant: PATRICIA ANNE MENDOZA', 'Submitted application with screening score 72.00%.', 'Applicant Management', 'Applicant', '37', 0, NULL, '2026-08-25 13:02:20'),
(173, 12, 'info', 'New applicant: PATRICIA ANNE MENDOZA', 'Submitted application with screening score 72.00%.', 'Applicant Management', 'Applicant', '37', 0, NULL, '2026-08-25 13:02:20'),
(174, 13, 'info', 'New applicant: PATRICIA ANNE MENDOZA', 'Submitted application with screening score 72.00%.', 'Applicant Management', 'Applicant', '37', 0, NULL, '2026-08-25 13:02:20'),
(175, 14, 'info', 'New applicant: PATRICIA ANNE MENDOZA', 'Submitted application with screening score 72.00%.', 'Applicant Management', 'Applicant', '37', 0, NULL, '2026-08-25 13:02:20'),
(176, 15, 'info', 'New applicant: PATRICIA ANNE MENDOZA', 'Submitted application with screening score 72.00%.', 'Applicant Management', 'Applicant', '37', 0, NULL, '2026-08-25 13:02:20'),
(177, 16, 'info', 'New applicant: PATRICIA ANNE MENDOZA', 'Submitted application with screening score 72.00%.', 'Applicant Management', 'Applicant', '37', 0, NULL, '2026-08-25 13:02:20'),
(178, 1, 'info', 'New applicant: RAFAEL DOMINIC LIM', 'Submitted application with screening score 77.60%.', 'Applicant Management', 'Applicant', '38', 1, '2026-08-26 02:03:34', '2026-08-25 13:04:13'),
(179, 2, 'info', 'New applicant: RAFAEL DOMINIC LIM', 'Submitted application with screening score 77.60%.', 'Applicant Management', 'Applicant', '38', 0, NULL, '2026-08-25 13:04:13'),
(180, 3, 'info', 'New applicant: RAFAEL DOMINIC LIM', 'Submitted application with screening score 77.60%.', 'Applicant Management', 'Applicant', '38', 1, '2026-08-26 06:27:16', '2026-08-25 13:04:13'),
(181, 4, 'info', 'New applicant: RAFAEL DOMINIC LIM', 'Submitted application with screening score 77.60%.', 'Applicant Management', 'Applicant', '38', 0, NULL, '2026-08-25 13:04:13'),
(182, 6, 'info', 'New applicant: RAFAEL DOMINIC LIM', 'Submitted application with screening score 77.60%.', 'Applicant Management', 'Applicant', '38', 0, NULL, '2026-08-25 13:04:13'),
(183, 7, 'info', 'New applicant: RAFAEL DOMINIC LIM', 'Submitted application with screening score 77.60%.', 'Applicant Management', 'Applicant', '38', 0, NULL, '2026-08-25 13:04:13'),
(184, 8, 'info', 'New applicant: RAFAEL DOMINIC LIM', 'Submitted application with screening score 77.60%.', 'Applicant Management', 'Applicant', '38', 0, NULL, '2026-08-25 13:04:13'),
(185, 10, 'info', 'New applicant: RAFAEL DOMINIC LIM', 'Submitted application with screening score 77.60%.', 'Applicant Management', 'Applicant', '38', 0, NULL, '2026-08-25 13:04:13'),
(186, 11, 'info', 'New applicant: RAFAEL DOMINIC LIM', 'Submitted application with screening score 77.60%.', 'Applicant Management', 'Applicant', '38', 0, NULL, '2026-08-25 13:04:13'),
(187, 12, 'info', 'New applicant: RAFAEL DOMINIC LIM', 'Submitted application with screening score 77.60%.', 'Applicant Management', 'Applicant', '38', 0, NULL, '2026-08-25 13:04:13'),
(188, 13, 'info', 'New applicant: RAFAEL DOMINIC LIM', 'Submitted application with screening score 77.60%.', 'Applicant Management', 'Applicant', '38', 0, NULL, '2026-08-25 13:04:13'),
(189, 14, 'info', 'New applicant: RAFAEL DOMINIC LIM', 'Submitted application with screening score 77.60%.', 'Applicant Management', 'Applicant', '38', 0, NULL, '2026-08-25 13:04:13'),
(190, 15, 'info', 'New applicant: RAFAEL DOMINIC LIM', 'Submitted application with screening score 77.60%.', 'Applicant Management', 'Applicant', '38', 0, NULL, '2026-08-25 13:04:13'),
(191, 16, 'info', 'New applicant: RAFAEL DOMINIC LIM', 'Submitted application with screening score 77.60%.', 'Applicant Management', 'Applicant', '38', 0, NULL, '2026-08-25 13:04:13'),
(192, 1, 'info', 'New applicant: Roberto James Castillo', 'Submitted application with screening score 62.00%.', 'Applicant Management', 'Applicant', '39', 1, '2026-08-26 02:03:34', '2026-08-25 13:13:41'),
(193, 2, 'info', 'New applicant: Roberto James Castillo', 'Submitted application with screening score 62.00%.', 'Applicant Management', 'Applicant', '39', 0, NULL, '2026-08-25 13:13:41'),
(194, 3, 'info', 'New applicant: Roberto James Castillo', 'Submitted application with screening score 62.00%.', 'Applicant Management', 'Applicant', '39', 1, '2026-08-26 06:27:18', '2026-08-25 13:13:41'),
(195, 4, 'info', 'New applicant: Roberto James Castillo', 'Submitted application with screening score 62.00%.', 'Applicant Management', 'Applicant', '39', 0, NULL, '2026-08-25 13:13:41'),
(196, 6, 'info', 'New applicant: Roberto James Castillo', 'Submitted application with screening score 62.00%.', 'Applicant Management', 'Applicant', '39', 0, NULL, '2026-08-25 13:13:41'),
(197, 7, 'info', 'New applicant: Roberto James Castillo', 'Submitted application with screening score 62.00%.', 'Applicant Management', 'Applicant', '39', 0, NULL, '2026-08-25 13:13:41'),
(198, 8, 'info', 'New applicant: Roberto James Castillo', 'Submitted application with screening score 62.00%.', 'Applicant Management', 'Applicant', '39', 0, NULL, '2026-08-25 13:13:41'),
(199, 10, 'info', 'New applicant: Roberto James Castillo', 'Submitted application with screening score 62.00%.', 'Applicant Management', 'Applicant', '39', 0, NULL, '2026-08-25 13:13:41'),
(200, 11, 'info', 'New applicant: Roberto James Castillo', 'Submitted application with screening score 62.00%.', 'Applicant Management', 'Applicant', '39', 0, NULL, '2026-08-25 13:13:41'),
(201, 12, 'info', 'New applicant: Roberto James Castillo', 'Submitted application with screening score 62.00%.', 'Applicant Management', 'Applicant', '39', 0, NULL, '2026-08-25 13:13:41'),
(202, 13, 'info', 'New applicant: Roberto James Castillo', 'Submitted application with screening score 62.00%.', 'Applicant Management', 'Applicant', '39', 0, NULL, '2026-08-25 13:13:41'),
(203, 14, 'info', 'New applicant: Roberto James Castillo', 'Submitted application with screening score 62.00%.', 'Applicant Management', 'Applicant', '39', 0, NULL, '2026-08-25 13:13:41'),
(204, 15, 'info', 'New applicant: Roberto James Castillo', 'Submitted application with screening score 62.00%.', 'Applicant Management', 'Applicant', '39', 0, NULL, '2026-08-25 13:13:41'),
(205, 16, 'info', 'New applicant: Roberto James Castillo', 'Submitted application with screening score 62.00%.', 'Applicant Management', 'Applicant', '39', 0, NULL, '2026-08-25 13:13:41'),
(206, 1, 'info', 'New applicant: Roberto James Castillo', 'Submitted application with screening score 62.00%.', 'Applicant Management', 'Applicant', '40', 1, '2026-08-26 02:03:34', '2026-08-25 13:20:15'),
(207, 2, 'info', 'New applicant: Roberto James Castillo', 'Submitted application with screening score 62.00%.', 'Applicant Management', 'Applicant', '40', 0, NULL, '2026-08-25 13:20:15'),
(208, 3, 'info', 'New applicant: Roberto James Castillo', 'Submitted application with screening score 62.00%.', 'Applicant Management', 'Applicant', '40', 1, '2026-08-31 11:56:37', '2026-08-25 13:20:15'),
(209, 4, 'info', 'New applicant: Roberto James Castillo', 'Submitted application with screening score 62.00%.', 'Applicant Management', 'Applicant', '40', 0, NULL, '2026-08-25 13:20:15'),
(210, 6, 'info', 'New applicant: Roberto James Castillo', 'Submitted application with screening score 62.00%.', 'Applicant Management', 'Applicant', '40', 0, NULL, '2026-08-25 13:20:15'),
(211, 7, 'info', 'New applicant: Roberto James Castillo', 'Submitted application with screening score 62.00%.', 'Applicant Management', 'Applicant', '40', 0, NULL, '2026-08-25 13:20:15'),
(212, 8, 'info', 'New applicant: Roberto James Castillo', 'Submitted application with screening score 62.00%.', 'Applicant Management', 'Applicant', '40', 0, NULL, '2026-08-25 13:20:15'),
(213, 10, 'info', 'New applicant: Roberto James Castillo', 'Submitted application with screening score 62.00%.', 'Applicant Management', 'Applicant', '40', 0, NULL, '2026-08-25 13:20:15'),
(214, 11, 'info', 'New applicant: Roberto James Castillo', 'Submitted application with screening score 62.00%.', 'Applicant Management', 'Applicant', '40', 0, NULL, '2026-08-25 13:20:15'),
(215, 12, 'info', 'New applicant: Roberto James Castillo', 'Submitted application with screening score 62.00%.', 'Applicant Management', 'Applicant', '40', 0, NULL, '2026-08-25 13:20:15'),
(216, 13, 'info', 'New applicant: Roberto James Castillo', 'Submitted application with screening score 62.00%.', 'Applicant Management', 'Applicant', '40', 0, NULL, '2026-08-25 13:20:15'),
(217, 14, 'info', 'New applicant: Roberto James Castillo', 'Submitted application with screening score 62.00%.', 'Applicant Management', 'Applicant', '40', 0, NULL, '2026-08-25 13:20:15'),
(218, 15, 'info', 'New applicant: Roberto James Castillo', 'Submitted application with screening score 62.00%.', 'Applicant Management', 'Applicant', '40', 0, NULL, '2026-08-25 13:20:15'),
(219, 16, 'info', 'New applicant: Roberto James Castillo', 'Submitted application with screening score 62.00%.', 'Applicant Management', 'Applicant', '40', 0, NULL, '2026-08-25 13:20:15'),
(220, 1, 'info', 'New applicant: Samantha Nicole Dela Cruz', 'Submitted application with screening score 83.20%.', 'Applicant Management', 'Applicant', '41', 1, '2026-08-26 02:03:34', '2026-08-25 13:20:53'),
(221, 2, 'info', 'New applicant: Samantha Nicole Dela Cruz', 'Submitted application with screening score 83.20%.', 'Applicant Management', 'Applicant', '41', 0, NULL, '2026-08-25 13:20:53'),
(222, 3, 'info', 'New applicant: Samantha Nicole Dela Cruz', 'Submitted application with screening score 83.20%.', 'Applicant Management', 'Applicant', '41', 1, '2026-08-31 11:56:36', '2026-08-25 13:20:53'),
(223, 4, 'info', 'New applicant: Samantha Nicole Dela Cruz', 'Submitted application with screening score 83.20%.', 'Applicant Management', 'Applicant', '41', 0, NULL, '2026-08-25 13:20:53'),
(224, 6, 'info', 'New applicant: Samantha Nicole Dela Cruz', 'Submitted application with screening score 83.20%.', 'Applicant Management', 'Applicant', '41', 0, NULL, '2026-08-25 13:20:53'),
(225, 7, 'info', 'New applicant: Samantha Nicole Dela Cruz', 'Submitted application with screening score 83.20%.', 'Applicant Management', 'Applicant', '41', 0, NULL, '2026-08-25 13:20:53'),
(226, 8, 'info', 'New applicant: Samantha Nicole Dela Cruz', 'Submitted application with screening score 83.20%.', 'Applicant Management', 'Applicant', '41', 0, NULL, '2026-08-25 13:20:53'),
(227, 10, 'info', 'New applicant: Samantha Nicole Dela Cruz', 'Submitted application with screening score 83.20%.', 'Applicant Management', 'Applicant', '41', 0, NULL, '2026-08-25 13:20:53'),
(228, 11, 'info', 'New applicant: Samantha Nicole Dela Cruz', 'Submitted application with screening score 83.20%.', 'Applicant Management', 'Applicant', '41', 0, NULL, '2026-08-25 13:20:53'),
(229, 12, 'info', 'New applicant: Samantha Nicole Dela Cruz', 'Submitted application with screening score 83.20%.', 'Applicant Management', 'Applicant', '41', 0, NULL, '2026-08-25 13:20:53'),
(230, 13, 'info', 'New applicant: Samantha Nicole Dela Cruz', 'Submitted application with screening score 83.20%.', 'Applicant Management', 'Applicant', '41', 0, NULL, '2026-08-25 13:20:53'),
(231, 14, 'info', 'New applicant: Samantha Nicole Dela Cruz', 'Submitted application with screening score 83.20%.', 'Applicant Management', 'Applicant', '41', 0, NULL, '2026-08-25 13:20:53'),
(232, 15, 'info', 'New applicant: Samantha Nicole Dela Cruz', 'Submitted application with screening score 83.20%.', 'Applicant Management', 'Applicant', '41', 0, NULL, '2026-08-25 13:20:53'),
(233, 16, 'info', 'New applicant: Samantha Nicole Dela Cruz', 'Submitted application with screening score 83.20%.', 'Applicant Management', 'Applicant', '41', 0, NULL, '2026-08-25 13:20:53'),
(234, 1, 'info', 'New applicant: Vincent Paul Soriano', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '42', 1, '2026-08-26 02:03:34', '2026-08-25 13:42:45'),
(235, 2, 'info', 'New applicant: Vincent Paul Soriano', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '42', 0, NULL, '2026-08-25 13:42:45'),
(236, 3, 'info', 'New applicant: Vincent Paul Soriano', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '42', 1, '2026-08-31 11:56:36', '2026-08-25 13:42:45'),
(237, 4, 'info', 'New applicant: Vincent Paul Soriano', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '42', 0, NULL, '2026-08-25 13:42:45'),
(238, 6, 'info', 'New applicant: Vincent Paul Soriano', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '42', 0, NULL, '2026-08-25 13:42:45'),
(239, 7, 'info', 'New applicant: Vincent Paul Soriano', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '42', 0, NULL, '2026-08-25 13:42:45'),
(240, 8, 'info', 'New applicant: Vincent Paul Soriano', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '42', 0, NULL, '2026-08-25 13:42:45'),
(241, 10, 'info', 'New applicant: Vincent Paul Soriano', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '42', 0, NULL, '2026-08-25 13:42:45'),
(242, 11, 'info', 'New applicant: Vincent Paul Soriano', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '42', 0, NULL, '2026-08-25 13:42:45'),
(243, 12, 'info', 'New applicant: Vincent Paul Soriano', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '42', 0, NULL, '2026-08-25 13:42:45'),
(244, 13, 'info', 'New applicant: Vincent Paul Soriano', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '42', 0, NULL, '2026-08-25 13:42:45'),
(245, 14, 'info', 'New applicant: Vincent Paul Soriano', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '42', 0, NULL, '2026-08-25 13:42:45'),
(246, 15, 'info', 'New applicant: Vincent Paul Soriano', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '42', 0, NULL, '2026-08-25 13:42:45'),
(247, 16, 'info', 'New applicant: Vincent Paul Soriano', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '42', 0, NULL, '2026-08-25 13:42:45'),
(248, 1, 'info', 'New applicant: ANGELA MARIE CRUZ', 'Submitted application with screening score 57.60%.', 'Applicant Management', 'Applicant', '43', 1, '2026-08-26 02:03:34', '2026-08-25 13:45:32'),
(249, 2, 'info', 'New applicant: ANGELA MARIE CRUZ', 'Submitted application with screening score 57.60%.', 'Applicant Management', 'Applicant', '43', 0, NULL, '2026-08-25 13:45:32'),
(250, 3, 'info', 'New applicant: ANGELA MARIE CRUZ', 'Submitted application with screening score 57.60%.', 'Applicant Management', 'Applicant', '43', 1, '2026-08-26 06:27:12', '2026-08-25 13:45:32'),
(251, 4, 'info', 'New applicant: ANGELA MARIE CRUZ', 'Submitted application with screening score 57.60%.', 'Applicant Management', 'Applicant', '43', 0, NULL, '2026-08-25 13:45:32'),
(252, 6, 'info', 'New applicant: ANGELA MARIE CRUZ', 'Submitted application with screening score 57.60%.', 'Applicant Management', 'Applicant', '43', 0, NULL, '2026-08-25 13:45:32'),
(253, 7, 'info', 'New applicant: ANGELA MARIE CRUZ', 'Submitted application with screening score 57.60%.', 'Applicant Management', 'Applicant', '43', 0, NULL, '2026-08-25 13:45:32'),
(254, 8, 'info', 'New applicant: ANGELA MARIE CRUZ', 'Submitted application with screening score 57.60%.', 'Applicant Management', 'Applicant', '43', 0, NULL, '2026-08-25 13:45:33'),
(255, 10, 'info', 'New applicant: ANGELA MARIE CRUZ', 'Submitted application with screening score 57.60%.', 'Applicant Management', 'Applicant', '43', 0, NULL, '2026-08-25 13:45:33'),
(256, 11, 'info', 'New applicant: ANGELA MARIE CRUZ', 'Submitted application with screening score 57.60%.', 'Applicant Management', 'Applicant', '43', 0, NULL, '2026-08-25 13:45:33'),
(257, 12, 'info', 'New applicant: ANGELA MARIE CRUZ', 'Submitted application with screening score 57.60%.', 'Applicant Management', 'Applicant', '43', 0, NULL, '2026-08-25 13:45:33'),
(258, 13, 'info', 'New applicant: ANGELA MARIE CRUZ', 'Submitted application with screening score 57.60%.', 'Applicant Management', 'Applicant', '43', 0, NULL, '2026-08-25 13:45:33'),
(259, 14, 'info', 'New applicant: ANGELA MARIE CRUZ', 'Submitted application with screening score 57.60%.', 'Applicant Management', 'Applicant', '43', 0, NULL, '2026-08-25 13:45:33'),
(260, 15, 'info', 'New applicant: ANGELA MARIE CRUZ', 'Submitted application with screening score 57.60%.', 'Applicant Management', 'Applicant', '43', 0, NULL, '2026-08-25 13:45:33'),
(261, 16, 'info', 'New applicant: ANGELA MARIE CRUZ', 'Submitted application with screening score 57.60%.', 'Applicant Management', 'Applicant', '43', 0, NULL, '2026-08-25 13:45:33'),
(262, 1, 'info', 'New applicant: Bianca Louise Garcia', 'Submitted application with screening score 72.00%.', 'Applicant Management', 'Applicant', '44', 1, '2026-08-26 02:03:34', '2026-08-25 13:47:37'),
(263, 2, 'info', 'New applicant: Bianca Louise Garcia', 'Submitted application with screening score 72.00%.', 'Applicant Management', 'Applicant', '44', 0, NULL, '2026-08-25 13:47:37'),
(264, 3, 'info', 'New applicant: Bianca Louise Garcia', 'Submitted application with screening score 72.00%.', 'Applicant Management', 'Applicant', '44', 1, '2026-08-26 06:27:08', '2026-08-25 13:47:37'),
(265, 4, 'info', 'New applicant: Bianca Louise Garcia', 'Submitted application with screening score 72.00%.', 'Applicant Management', 'Applicant', '44', 0, NULL, '2026-08-25 13:47:37'),
(266, 6, 'info', 'New applicant: Bianca Louise Garcia', 'Submitted application with screening score 72.00%.', 'Applicant Management', 'Applicant', '44', 0, NULL, '2026-08-25 13:47:37'),
(267, 7, 'info', 'New applicant: Bianca Louise Garcia', 'Submitted application with screening score 72.00%.', 'Applicant Management', 'Applicant', '44', 0, NULL, '2026-08-25 13:47:37'),
(268, 8, 'info', 'New applicant: Bianca Louise Garcia', 'Submitted application with screening score 72.00%.', 'Applicant Management', 'Applicant', '44', 0, NULL, '2026-08-25 13:47:37'),
(269, 10, 'info', 'New applicant: Bianca Louise Garcia', 'Submitted application with screening score 72.00%.', 'Applicant Management', 'Applicant', '44', 0, NULL, '2026-08-25 13:47:37');
INSERT INTO `notifications` (`notification_id`, `system_user_id`, `type`, `title`, `body`, `module_name`, `target_type`, `target_id`, `is_read`, `read_at`, `created_at`) VALUES
(270, 11, 'info', 'New applicant: Bianca Louise Garcia', 'Submitted application with screening score 72.00%.', 'Applicant Management', 'Applicant', '44', 0, NULL, '2026-08-25 13:47:37'),
(271, 12, 'info', 'New applicant: Bianca Louise Garcia', 'Submitted application with screening score 72.00%.', 'Applicant Management', 'Applicant', '44', 0, NULL, '2026-08-25 13:47:37'),
(272, 13, 'info', 'New applicant: Bianca Louise Garcia', 'Submitted application with screening score 72.00%.', 'Applicant Management', 'Applicant', '44', 0, NULL, '2026-08-25 13:47:37'),
(273, 14, 'info', 'New applicant: Bianca Louise Garcia', 'Submitted application with screening score 72.00%.', 'Applicant Management', 'Applicant', '44', 0, NULL, '2026-08-25 13:47:37'),
(274, 15, 'info', 'New applicant: Bianca Louise Garcia', 'Submitted application with screening score 72.00%.', 'Applicant Management', 'Applicant', '44', 0, NULL, '2026-08-25 13:47:37'),
(275, 16, 'info', 'New applicant: Bianca Louise Garcia', 'Submitted application with screening score 72.00%.', 'Applicant Management', 'Applicant', '44', 0, NULL, '2026-08-25 13:47:37'),
(276, 1, 'info', 'New applicant: ALYSSA MARIE', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '45', 1, '2026-08-26 02:03:34', '2026-08-25 18:04:46'),
(277, 2, 'info', 'New applicant: ALYSSA MARIE', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '45', 0, NULL, '2026-08-25 18:04:46'),
(278, 3, 'info', 'New applicant: ALYSSA MARIE', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '45', 1, '2026-08-26 06:27:04', '2026-08-25 18:04:46'),
(279, 4, 'info', 'New applicant: ALYSSA MARIE', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '45', 0, NULL, '2026-08-25 18:04:46'),
(280, 6, 'info', 'New applicant: ALYSSA MARIE', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '45', 0, NULL, '2026-08-25 18:04:46'),
(281, 7, 'info', 'New applicant: ALYSSA MARIE', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '45', 0, NULL, '2026-08-25 18:04:46'),
(282, 8, 'info', 'New applicant: ALYSSA MARIE', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '45', 0, NULL, '2026-08-25 18:04:46'),
(283, 10, 'info', 'New applicant: ALYSSA MARIE', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '45', 0, NULL, '2026-08-25 18:04:46'),
(284, 11, 'info', 'New applicant: ALYSSA MARIE', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '45', 0, NULL, '2026-08-25 18:04:46'),
(285, 12, 'info', 'New applicant: ALYSSA MARIE', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '45', 0, NULL, '2026-08-25 18:04:46'),
(286, 13, 'info', 'New applicant: ALYSSA MARIE', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '45', 0, NULL, '2026-08-25 18:04:46'),
(287, 14, 'info', 'New applicant: ALYSSA MARIE', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '45', 0, NULL, '2026-08-25 18:04:46'),
(288, 15, 'info', 'New applicant: ALYSSA MARIE', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '45', 0, NULL, '2026-08-25 18:04:46'),
(289, 16, 'info', 'New applicant: ALYSSA MARIE', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '45', 0, NULL, '2026-08-25 18:04:46'),
(290, 1, 'info', 'New applicant: Vincent Paul Soriano', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '46', 1, '2026-08-26 02:03:34', '2026-08-25 18:33:18'),
(291, 2, 'info', 'New applicant: Vincent Paul Soriano', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '46', 0, NULL, '2026-08-25 18:33:18'),
(292, 3, 'info', 'New applicant: Vincent Paul Soriano', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '46', 1, '2026-08-26 06:27:00', '2026-08-25 18:33:18'),
(293, 4, 'info', 'New applicant: Vincent Paul Soriano', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '46', 0, NULL, '2026-08-25 18:33:18'),
(294, 6, 'info', 'New applicant: Vincent Paul Soriano', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '46', 0, NULL, '2026-08-25 18:33:18'),
(295, 7, 'info', 'New applicant: Vincent Paul Soriano', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '46', 0, NULL, '2026-08-25 18:33:18'),
(296, 8, 'info', 'New applicant: Vincent Paul Soriano', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '46', 0, NULL, '2026-08-25 18:33:18'),
(297, 10, 'info', 'New applicant: Vincent Paul Soriano', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '46', 0, NULL, '2026-08-25 18:33:18'),
(298, 11, 'info', 'New applicant: Vincent Paul Soriano', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '46', 0, NULL, '2026-08-25 18:33:18'),
(299, 12, 'info', 'New applicant: Vincent Paul Soriano', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '46', 0, NULL, '2026-08-25 18:33:18'),
(300, 13, 'info', 'New applicant: Vincent Paul Soriano', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '46', 0, NULL, '2026-08-25 18:33:18'),
(301, 14, 'info', 'New applicant: Vincent Paul Soriano', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '46', 0, NULL, '2026-08-25 18:33:18'),
(302, 15, 'info', 'New applicant: Vincent Paul Soriano', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '46', 0, NULL, '2026-08-25 18:33:18'),
(303, 16, 'info', 'New applicant: Vincent Paul Soriano', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '46', 0, NULL, '2026-08-25 18:33:18'),
(304, 1, 'info', 'New applicant: Adrian Luis Navarro', 'Submitted application with screening score 88.80%.', 'Applicant Management', 'Applicant', '51', 0, NULL, '2026-08-30 14:23:47'),
(305, 2, 'info', 'New applicant: Adrian Luis Navarro', 'Submitted application with screening score 88.80%.', 'Applicant Management', 'Applicant', '51', 0, NULL, '2026-08-30 14:23:47'),
(306, 3, 'info', 'New applicant: Adrian Luis Navarro', 'Submitted application with screening score 88.80%.', 'Applicant Management', 'Applicant', '51', 1, '2026-08-31 11:56:32', '2026-08-30 14:23:47'),
(307, 4, 'info', 'New applicant: Adrian Luis Navarro', 'Submitted application with screening score 88.80%.', 'Applicant Management', 'Applicant', '51', 0, NULL, '2026-08-30 14:23:47'),
(308, 6, 'info', 'New applicant: Adrian Luis Navarro', 'Submitted application with screening score 88.80%.', 'Applicant Management', 'Applicant', '51', 0, NULL, '2026-08-30 14:23:47'),
(309, 7, 'info', 'New applicant: Adrian Luis Navarro', 'Submitted application with screening score 88.80%.', 'Applicant Management', 'Applicant', '51', 0, NULL, '2026-08-30 14:23:47'),
(310, 8, 'info', 'New applicant: Adrian Luis Navarro', 'Submitted application with screening score 88.80%.', 'Applicant Management', 'Applicant', '51', 0, NULL, '2026-08-30 14:23:47'),
(311, 10, 'info', 'New applicant: Adrian Luis Navarro', 'Submitted application with screening score 88.80%.', 'Applicant Management', 'Applicant', '51', 0, NULL, '2026-08-30 14:23:47'),
(312, 11, 'info', 'New applicant: Adrian Luis Navarro', 'Submitted application with screening score 88.80%.', 'Applicant Management', 'Applicant', '51', 0, NULL, '2026-08-30 14:23:47'),
(313, 12, 'info', 'New applicant: Adrian Luis Navarro', 'Submitted application with screening score 88.80%.', 'Applicant Management', 'Applicant', '51', 0, NULL, '2026-08-30 14:23:47'),
(314, 13, 'info', 'New applicant: Adrian Luis Navarro', 'Submitted application with screening score 88.80%.', 'Applicant Management', 'Applicant', '51', 0, NULL, '2026-08-30 14:23:47'),
(315, 14, 'info', 'New applicant: Adrian Luis Navarro', 'Submitted application with screening score 88.80%.', 'Applicant Management', 'Applicant', '51', 0, NULL, '2026-08-30 14:23:47'),
(316, 15, 'info', 'New applicant: Adrian Luis Navarro', 'Submitted application with screening score 88.80%.', 'Applicant Management', 'Applicant', '51', 0, NULL, '2026-08-30 14:23:47'),
(317, 16, 'info', 'New applicant: Adrian Luis Navarro', 'Submitted application with screening score 88.80%.', 'Applicant Management', 'Applicant', '51', 0, NULL, '2026-08-30 14:23:47'),
(318, 1, 'info', 'New applicant: Adrian Luis Navarro', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '52', 0, NULL, '2026-08-30 14:26:52'),
(319, 2, 'info', 'New applicant: Adrian Luis Navarro', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '52', 0, NULL, '2026-08-30 14:26:52'),
(320, 3, 'info', 'New applicant: Adrian Luis Navarro', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '52', 1, '2026-08-31 11:56:32', '2026-08-30 14:26:52'),
(321, 4, 'info', 'New applicant: Adrian Luis Navarro', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '52', 0, NULL, '2026-08-30 14:26:52'),
(322, 6, 'info', 'New applicant: Adrian Luis Navarro', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '52', 0, NULL, '2026-08-30 14:26:52'),
(323, 7, 'info', 'New applicant: Adrian Luis Navarro', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '52', 0, NULL, '2026-08-30 14:26:52'),
(324, 8, 'info', 'New applicant: Adrian Luis Navarro', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '52', 0, NULL, '2026-08-30 14:26:52'),
(325, 10, 'info', 'New applicant: Adrian Luis Navarro', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '52', 0, NULL, '2026-08-30 14:26:52'),
(326, 11, 'info', 'New applicant: Adrian Luis Navarro', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '52', 0, NULL, '2026-08-30 14:26:52'),
(327, 12, 'info', 'New applicant: Adrian Luis Navarro', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '52', 0, NULL, '2026-08-30 14:26:52'),
(328, 13, 'info', 'New applicant: Adrian Luis Navarro', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '52', 0, NULL, '2026-08-30 14:26:52'),
(329, 14, 'info', 'New applicant: Adrian Luis Navarro', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '52', 0, NULL, '2026-08-30 14:26:52'),
(330, 15, 'info', 'New applicant: Adrian Luis Navarro', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '52', 0, NULL, '2026-08-30 14:26:52'),
(331, 16, 'info', 'New applicant: Adrian Luis Navarro', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '52', 0, NULL, '2026-08-30 14:26:52'),
(332, 1, 'info', 'New applicant: ALYSSA MARIE', 'Submitted application with screening score 79.00%.', 'Applicant Management', 'Applicant', '53', 0, NULL, '2026-08-30 15:09:41'),
(333, 2, 'info', 'New applicant: ALYSSA MARIE', 'Submitted application with screening score 79.00%.', 'Applicant Management', 'Applicant', '53', 0, NULL, '2026-08-30 15:09:41'),
(334, 3, 'info', 'New applicant: ALYSSA MARIE', 'Submitted application with screening score 79.00%.', 'Applicant Management', 'Applicant', '53', 1, '2026-08-31 11:56:32', '2026-08-30 15:09:41'),
(335, 4, 'info', 'New applicant: ALYSSA MARIE', 'Submitted application with screening score 79.00%.', 'Applicant Management', 'Applicant', '53', 0, NULL, '2026-08-30 15:09:41'),
(336, 6, 'info', 'New applicant: ALYSSA MARIE', 'Submitted application with screening score 79.00%.', 'Applicant Management', 'Applicant', '53', 0, NULL, '2026-08-30 15:09:41'),
(337, 7, 'info', 'New applicant: ALYSSA MARIE', 'Submitted application with screening score 79.00%.', 'Applicant Management', 'Applicant', '53', 0, NULL, '2026-08-30 15:09:41'),
(338, 8, 'info', 'New applicant: ALYSSA MARIE', 'Submitted application with screening score 79.00%.', 'Applicant Management', 'Applicant', '53', 0, NULL, '2026-08-30 15:09:41'),
(339, 10, 'info', 'New applicant: ALYSSA MARIE', 'Submitted application with screening score 79.00%.', 'Applicant Management', 'Applicant', '53', 0, NULL, '2026-08-30 15:09:41'),
(340, 11, 'info', 'New applicant: ALYSSA MARIE', 'Submitted application with screening score 79.00%.', 'Applicant Management', 'Applicant', '53', 0, NULL, '2026-08-30 15:09:41'),
(341, 12, 'info', 'New applicant: ALYSSA MARIE', 'Submitted application with screening score 79.00%.', 'Applicant Management', 'Applicant', '53', 0, NULL, '2026-08-30 15:09:41'),
(342, 13, 'info', 'New applicant: ALYSSA MARIE', 'Submitted application with screening score 79.00%.', 'Applicant Management', 'Applicant', '53', 0, NULL, '2026-08-30 15:09:41'),
(343, 14, 'info', 'New applicant: ALYSSA MARIE', 'Submitted application with screening score 79.00%.', 'Applicant Management', 'Applicant', '53', 0, NULL, '2026-08-30 15:09:41'),
(344, 15, 'info', 'New applicant: ALYSSA MARIE', 'Submitted application with screening score 79.00%.', 'Applicant Management', 'Applicant', '53', 0, NULL, '2026-08-30 15:09:41'),
(345, 16, 'info', 'New applicant: ALYSSA MARIE', 'Submitted application with screening score 79.00%.', 'Applicant Management', 'Applicant', '53', 0, NULL, '2026-08-30 15:09:41'),
(346, 2, 'info', 'Position created', '\"ha\" was created.', 'Core HCM', 'position', '19', 0, NULL, '2026-08-30 15:26:41'),
(347, 3, 'info', 'Position created', '\"ha\" was created.', 'Core HCM', 'position', '19', 1, '2026-08-31 11:56:31', '2026-08-30 15:26:41'),
(348, 7, 'info', 'Position created', '\"ha\" was created.', 'Core HCM', 'position', '19', 0, NULL, '2026-08-30 15:26:41'),
(349, 8, 'info', 'Position created', '\"ha\" was created.', 'Core HCM', 'position', '19', 0, NULL, '2026-08-30 15:26:41'),
(350, 16, 'info', 'Position created', '\"ha\" was created.', 'Core HCM', 'position', '19', 0, NULL, '2026-08-30 15:26:41'),
(351, 14, 'info', 'Position created', '\"ha\" was created.', 'Core HCM', 'position', '19', 0, NULL, '2026-08-30 15:26:41'),
(352, 2, 'success', 'New employee added', 'ADMIN-img2 ADMIN-img2 was added to Core HCM.', 'Core HCM', 'employee', '24', 0, NULL, '2026-08-30 17:24:15'),
(353, 3, 'success', 'New employee added', 'ADMIN-img2 ADMIN-img2 was added to Core HCM.', 'Core HCM', 'employee', '24', 1, '2026-08-31 11:56:29', '2026-08-30 17:24:15'),
(354, 7, 'success', 'New employee added', 'ADMIN-img2 ADMIN-img2 was added to Core HCM.', 'Core HCM', 'employee', '24', 0, NULL, '2026-08-30 17:24:15'),
(355, 8, 'success', 'New employee added', 'ADMIN-img2 ADMIN-img2 was added to Core HCM.', 'Core HCM', 'employee', '24', 0, NULL, '2026-08-30 17:24:15'),
(356, 16, 'success', 'New employee added', 'ADMIN-img2 ADMIN-img2 was added to Core HCM.', 'Core HCM', 'employee', '24', 0, NULL, '2026-08-30 17:24:15'),
(357, 14, 'success', 'New employee added', 'ADMIN-img2 ADMIN-img2 was added to Core HCM.', 'Core HCM', 'employee', '24', 0, NULL, '2026-08-30 17:24:15'),
(358, 1, 'warning', 'Employee removed', 'ADMIN-img2 ADMIN-img2 was removed from Core HCM.', 'Core HCM', 'employee', '24', 0, NULL, '2026-08-30 18:00:28'),
(359, 14, 'warning', 'Employee removed', 'ADMIN-img2 ADMIN-img2 was removed from Core HCM.', 'Core HCM', 'employee', '24', 0, NULL, '2026-08-30 18:00:28'),
(360, 1, 'info', 'Applicant Vincent Paul Soriano: Accepted', 'Stage updated from Screened to Accepted for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '46', 0, NULL, '2026-08-31 11:26:01'),
(361, 2, 'info', 'Applicant Vincent Paul Soriano: Accepted', 'Stage updated from Screened to Accepted for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '46', 0, NULL, '2026-08-31 11:26:01'),
(362, 3, 'info', 'Applicant Vincent Paul Soriano: Accepted', 'Stage updated from Screened to Accepted for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '46', 1, '2026-08-31 11:56:30', '2026-08-31 11:26:01'),
(363, 4, 'info', 'Applicant Vincent Paul Soriano: Accepted', 'Stage updated from Screened to Accepted for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '46', 0, NULL, '2026-08-31 11:26:01'),
(364, 6, 'info', 'Applicant Vincent Paul Soriano: Accepted', 'Stage updated from Screened to Accepted for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '46', 0, NULL, '2026-08-31 11:26:01'),
(365, 7, 'info', 'Applicant Vincent Paul Soriano: Accepted', 'Stage updated from Screened to Accepted for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '46', 0, NULL, '2026-08-31 11:26:01'),
(366, 8, 'info', 'Applicant Vincent Paul Soriano: Accepted', 'Stage updated from Screened to Accepted for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '46', 0, NULL, '2026-08-31 11:26:01'),
(367, 10, 'info', 'Applicant Vincent Paul Soriano: Accepted', 'Stage updated from Screened to Accepted for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '46', 0, NULL, '2026-08-31 11:26:01'),
(368, 11, 'info', 'Applicant Vincent Paul Soriano: Accepted', 'Stage updated from Screened to Accepted for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '46', 0, NULL, '2026-08-31 11:26:01'),
(369, 12, 'info', 'Applicant Vincent Paul Soriano: Accepted', 'Stage updated from Screened to Accepted for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '46', 0, NULL, '2026-08-31 11:26:01'),
(370, 13, 'info', 'Applicant Vincent Paul Soriano: Accepted', 'Stage updated from Screened to Accepted for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '46', 0, NULL, '2026-08-31 11:26:01'),
(371, 14, 'info', 'Applicant Vincent Paul Soriano: Accepted', 'Stage updated from Screened to Accepted for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '46', 0, NULL, '2026-08-31 11:26:01'),
(372, 15, 'info', 'Applicant Vincent Paul Soriano: Accepted', 'Stage updated from Screened to Accepted for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '46', 0, NULL, '2026-08-31 11:26:01'),
(373, 16, 'info', 'Applicant Vincent Paul Soriano: Accepted', 'Stage updated from Screened to Accepted for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '46', 0, NULL, '2026-08-31 11:26:01'),
(374, 1, 'info', 'Applicant ALYSSA MARIE: Accepted', 'Stage updated from Screened to Accepted for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '45', 0, NULL, '2026-08-31 11:30:08'),
(375, 2, 'info', 'Applicant ALYSSA MARIE: Accepted', 'Stage updated from Screened to Accepted for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '45', 0, NULL, '2026-08-31 11:30:08'),
(376, 3, 'info', 'Applicant ALYSSA MARIE: Accepted', 'Stage updated from Screened to Accepted for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '45', 1, '2026-08-31 11:56:30', '2026-08-31 11:30:08'),
(377, 4, 'info', 'Applicant ALYSSA MARIE: Accepted', 'Stage updated from Screened to Accepted for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '45', 0, NULL, '2026-08-31 11:30:08'),
(378, 6, 'info', 'Applicant ALYSSA MARIE: Accepted', 'Stage updated from Screened to Accepted for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '45', 0, NULL, '2026-08-31 11:30:08'),
(379, 7, 'info', 'Applicant ALYSSA MARIE: Accepted', 'Stage updated from Screened to Accepted for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '45', 0, NULL, '2026-08-31 11:30:08'),
(380, 8, 'info', 'Applicant ALYSSA MARIE: Accepted', 'Stage updated from Screened to Accepted for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '45', 0, NULL, '2026-08-31 11:30:08'),
(381, 10, 'info', 'Applicant ALYSSA MARIE: Accepted', 'Stage updated from Screened to Accepted for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '45', 0, NULL, '2026-08-31 11:30:08'),
(382, 11, 'info', 'Applicant ALYSSA MARIE: Accepted', 'Stage updated from Screened to Accepted for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '45', 0, NULL, '2026-08-31 11:30:08'),
(383, 12, 'info', 'Applicant ALYSSA MARIE: Accepted', 'Stage updated from Screened to Accepted for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '45', 0, NULL, '2026-08-31 11:30:08'),
(384, 13, 'info', 'Applicant ALYSSA MARIE: Accepted', 'Stage updated from Screened to Accepted for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '45', 0, NULL, '2026-08-31 11:30:08'),
(385, 14, 'info', 'Applicant ALYSSA MARIE: Accepted', 'Stage updated from Screened to Accepted for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '45', 0, NULL, '2026-08-31 11:30:08'),
(386, 15, 'info', 'Applicant ALYSSA MARIE: Accepted', 'Stage updated from Screened to Accepted for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '45', 0, NULL, '2026-08-31 11:30:08'),
(387, 16, 'info', 'Applicant ALYSSA MARIE: Accepted', 'Stage updated from Screened to Accepted for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '45', 0, NULL, '2026-08-31 11:30:08'),
(388, 1, 'info', 'Interview scheduled: ALYSSA MARIE', 'Booked on 2026-09-01 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '21', 0, NULL, '2026-08-31 11:30:34'),
(389, 2, 'info', 'Interview scheduled: ALYSSA MARIE', 'Booked on 2026-09-01 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '21', 0, NULL, '2026-08-31 11:30:34'),
(390, 3, 'info', 'Interview scheduled: ALYSSA MARIE', 'Booked on 2026-09-01 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '21', 1, '2026-08-31 11:56:27', '2026-08-31 11:30:34'),
(391, 4, 'info', 'Interview scheduled: ALYSSA MARIE', 'Booked on 2026-09-01 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '21', 0, NULL, '2026-08-31 11:30:34'),
(392, 6, 'info', 'Interview scheduled: ALYSSA MARIE', 'Booked on 2026-09-01 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '21', 0, NULL, '2026-08-31 11:30:34'),
(393, 7, 'info', 'Interview scheduled: ALYSSA MARIE', 'Booked on 2026-09-01 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '21', 0, NULL, '2026-08-31 11:30:34'),
(394, 8, 'info', 'Interview scheduled: ALYSSA MARIE', 'Booked on 2026-09-01 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '21', 0, NULL, '2026-08-31 11:30:34'),
(395, 10, 'info', 'Interview scheduled: ALYSSA MARIE', 'Booked on 2026-09-01 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '21', 0, NULL, '2026-08-31 11:30:34'),
(396, 11, 'info', 'Interview scheduled: ALYSSA MARIE', 'Booked on 2026-09-01 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '21', 0, NULL, '2026-08-31 11:30:34'),
(397, 12, 'info', 'Interview scheduled: ALYSSA MARIE', 'Booked on 2026-09-01 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '21', 0, NULL, '2026-08-31 11:30:34'),
(398, 13, 'info', 'Interview scheduled: ALYSSA MARIE', 'Booked on 2026-09-01 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '21', 0, NULL, '2026-08-31 11:30:34'),
(399, 14, 'info', 'Interview scheduled: ALYSSA MARIE', 'Booked on 2026-09-01 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '21', 0, NULL, '2026-08-31 11:30:34'),
(400, 15, 'info', 'Interview scheduled: ALYSSA MARIE', 'Booked on 2026-09-01 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '21', 0, NULL, '2026-08-31 11:30:34'),
(401, 16, 'info', 'Interview scheduled: ALYSSA MARIE', 'Booked on 2026-09-01 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '21', 0, NULL, '2026-08-31 11:30:34'),
(402, 1, 'warning', 'Interview cancelled: ALYSSA MARIE', 'Interview on 2026-09-02 00:00:00 08:00:00 was cancelled.', 'Applicant Management', 'Interview', '21', 0, NULL, '2026-08-31 11:33:28'),
(403, 2, 'warning', 'Interview cancelled: ALYSSA MARIE', 'Interview on 2026-09-02 00:00:00 08:00:00 was cancelled.', 'Applicant Management', 'Interview', '21', 0, NULL, '2026-08-31 11:33:28'),
(404, 3, 'warning', 'Interview cancelled: ALYSSA MARIE', 'Interview on 2026-09-02 00:00:00 08:00:00 was cancelled.', 'Applicant Management', 'Interview', '21', 1, '2026-08-31 11:56:27', '2026-08-31 11:33:28'),
(405, 4, 'warning', 'Interview cancelled: ALYSSA MARIE', 'Interview on 2026-09-02 00:00:00 08:00:00 was cancelled.', 'Applicant Management', 'Interview', '21', 0, NULL, '2026-08-31 11:33:28'),
(406, 6, 'warning', 'Interview cancelled: ALYSSA MARIE', 'Interview on 2026-09-02 00:00:00 08:00:00 was cancelled.', 'Applicant Management', 'Interview', '21', 0, NULL, '2026-08-31 11:33:28'),
(407, 7, 'warning', 'Interview cancelled: ALYSSA MARIE', 'Interview on 2026-09-02 00:00:00 08:00:00 was cancelled.', 'Applicant Management', 'Interview', '21', 0, NULL, '2026-08-31 11:33:28'),
(408, 8, 'warning', 'Interview cancelled: ALYSSA MARIE', 'Interview on 2026-09-02 00:00:00 08:00:00 was cancelled.', 'Applicant Management', 'Interview', '21', 0, NULL, '2026-08-31 11:33:28'),
(409, 10, 'warning', 'Interview cancelled: ALYSSA MARIE', 'Interview on 2026-09-02 00:00:00 08:00:00 was cancelled.', 'Applicant Management', 'Interview', '21', 0, NULL, '2026-08-31 11:33:28'),
(410, 11, 'warning', 'Interview cancelled: ALYSSA MARIE', 'Interview on 2026-09-02 00:00:00 08:00:00 was cancelled.', 'Applicant Management', 'Interview', '21', 0, NULL, '2026-08-31 11:33:28'),
(411, 12, 'warning', 'Interview cancelled: ALYSSA MARIE', 'Interview on 2026-09-02 00:00:00 08:00:00 was cancelled.', 'Applicant Management', 'Interview', '21', 0, NULL, '2026-08-31 11:33:28'),
(412, 13, 'warning', 'Interview cancelled: ALYSSA MARIE', 'Interview on 2026-09-02 00:00:00 08:00:00 was cancelled.', 'Applicant Management', 'Interview', '21', 0, NULL, '2026-08-31 11:33:28'),
(413, 14, 'warning', 'Interview cancelled: ALYSSA MARIE', 'Interview on 2026-09-02 00:00:00 08:00:00 was cancelled.', 'Applicant Management', 'Interview', '21', 0, NULL, '2026-08-31 11:33:28'),
(414, 15, 'warning', 'Interview cancelled: ALYSSA MARIE', 'Interview on 2026-09-02 00:00:00 08:00:00 was cancelled.', 'Applicant Management', 'Interview', '21', 0, NULL, '2026-08-31 11:33:28'),
(415, 16, 'warning', 'Interview cancelled: ALYSSA MARIE', 'Interview on 2026-09-02 00:00:00 08:00:00 was cancelled.', 'Applicant Management', 'Interview', '21', 0, NULL, '2026-08-31 11:33:28'),
(416, 1, 'info', 'Applicant ALYSSA MARIE: Accepted', 'Stage updated from Interview Scheduled to Accepted for HR Assistant.', 'Applicant Management', 'Applicant', '53', 0, NULL, '2026-08-31 11:33:36'),
(417, 2, 'info', 'Applicant ALYSSA MARIE: Accepted', 'Stage updated from Interview Scheduled to Accepted for HR Assistant.', 'Applicant Management', 'Applicant', '53', 0, NULL, '2026-08-31 11:33:36'),
(418, 3, 'info', 'Applicant ALYSSA MARIE: Accepted', 'Stage updated from Interview Scheduled to Accepted for HR Assistant.', 'Applicant Management', 'Applicant', '53', 1, '2026-08-31 11:56:26', '2026-08-31 11:33:36'),
(419, 4, 'info', 'Applicant ALYSSA MARIE: Accepted', 'Stage updated from Interview Scheduled to Accepted for HR Assistant.', 'Applicant Management', 'Applicant', '53', 0, NULL, '2026-08-31 11:33:36'),
(420, 6, 'info', 'Applicant ALYSSA MARIE: Accepted', 'Stage updated from Interview Scheduled to Accepted for HR Assistant.', 'Applicant Management', 'Applicant', '53', 0, NULL, '2026-08-31 11:33:36'),
(421, 7, 'info', 'Applicant ALYSSA MARIE: Accepted', 'Stage updated from Interview Scheduled to Accepted for HR Assistant.', 'Applicant Management', 'Applicant', '53', 0, NULL, '2026-08-31 11:33:36'),
(422, 8, 'info', 'Applicant ALYSSA MARIE: Accepted', 'Stage updated from Interview Scheduled to Accepted for HR Assistant.', 'Applicant Management', 'Applicant', '53', 0, NULL, '2026-08-31 11:33:36'),
(423, 10, 'info', 'Applicant ALYSSA MARIE: Accepted', 'Stage updated from Interview Scheduled to Accepted for HR Assistant.', 'Applicant Management', 'Applicant', '53', 0, NULL, '2026-08-31 11:33:36'),
(424, 11, 'info', 'Applicant ALYSSA MARIE: Accepted', 'Stage updated from Interview Scheduled to Accepted for HR Assistant.', 'Applicant Management', 'Applicant', '53', 0, NULL, '2026-08-31 11:33:36'),
(425, 12, 'info', 'Applicant ALYSSA MARIE: Accepted', 'Stage updated from Interview Scheduled to Accepted for HR Assistant.', 'Applicant Management', 'Applicant', '53', 0, NULL, '2026-08-31 11:33:36'),
(426, 13, 'info', 'Applicant ALYSSA MARIE: Accepted', 'Stage updated from Interview Scheduled to Accepted for HR Assistant.', 'Applicant Management', 'Applicant', '53', 0, NULL, '2026-08-31 11:33:36'),
(427, 14, 'info', 'Applicant ALYSSA MARIE: Accepted', 'Stage updated from Interview Scheduled to Accepted for HR Assistant.', 'Applicant Management', 'Applicant', '53', 0, NULL, '2026-08-31 11:33:36'),
(428, 15, 'info', 'Applicant ALYSSA MARIE: Accepted', 'Stage updated from Interview Scheduled to Accepted for HR Assistant.', 'Applicant Management', 'Applicant', '53', 0, NULL, '2026-08-31 11:33:36'),
(429, 16, 'info', 'Applicant ALYSSA MARIE: Accepted', 'Stage updated from Interview Scheduled to Accepted for HR Assistant.', 'Applicant Management', 'Applicant', '53', 0, NULL, '2026-08-31 11:33:36'),
(430, 1, 'info', 'Interview scheduled: ALYSSA MARIE', 'Booked on 2026-09-01 00:00:00 08:00 with Juan Dela Cruz.', 'Applicant Management', 'Interview', '22', 0, NULL, '2026-08-31 11:33:56'),
(431, 2, 'info', 'Interview scheduled: ALYSSA MARIE', 'Booked on 2026-09-01 00:00:00 08:00 with Juan Dela Cruz.', 'Applicant Management', 'Interview', '22', 0, NULL, '2026-08-31 11:33:56'),
(432, 3, 'info', 'Interview scheduled: ALYSSA MARIE', 'Booked on 2026-09-01 00:00:00 08:00 with Juan Dela Cruz.', 'Applicant Management', 'Interview', '22', 1, '2026-08-31 11:56:26', '2026-08-31 11:33:56'),
(433, 4, 'info', 'Interview scheduled: ALYSSA MARIE', 'Booked on 2026-09-01 00:00:00 08:00 with Juan Dela Cruz.', 'Applicant Management', 'Interview', '22', 0, NULL, '2026-08-31 11:33:56'),
(434, 6, 'info', 'Interview scheduled: ALYSSA MARIE', 'Booked on 2026-09-01 00:00:00 08:00 with Juan Dela Cruz.', 'Applicant Management', 'Interview', '22', 0, NULL, '2026-08-31 11:33:56'),
(435, 7, 'info', 'Interview scheduled: ALYSSA MARIE', 'Booked on 2026-09-01 00:00:00 08:00 with Juan Dela Cruz.', 'Applicant Management', 'Interview', '22', 0, NULL, '2026-08-31 11:33:56'),
(436, 8, 'info', 'Interview scheduled: ALYSSA MARIE', 'Booked on 2026-09-01 00:00:00 08:00 with Juan Dela Cruz.', 'Applicant Management', 'Interview', '22', 0, NULL, '2026-08-31 11:33:56'),
(437, 10, 'info', 'Interview scheduled: ALYSSA MARIE', 'Booked on 2026-09-01 00:00:00 08:00 with Juan Dela Cruz.', 'Applicant Management', 'Interview', '22', 0, NULL, '2026-08-31 11:33:56'),
(438, 11, 'info', 'Interview scheduled: ALYSSA MARIE', 'Booked on 2026-09-01 00:00:00 08:00 with Juan Dela Cruz.', 'Applicant Management', 'Interview', '22', 0, NULL, '2026-08-31 11:33:56'),
(439, 12, 'info', 'Interview scheduled: ALYSSA MARIE', 'Booked on 2026-09-01 00:00:00 08:00 with Juan Dela Cruz.', 'Applicant Management', 'Interview', '22', 0, NULL, '2026-08-31 11:33:56'),
(440, 13, 'info', 'Interview scheduled: ALYSSA MARIE', 'Booked on 2026-09-01 00:00:00 08:00 with Juan Dela Cruz.', 'Applicant Management', 'Interview', '22', 0, NULL, '2026-08-31 11:33:56'),
(441, 14, 'info', 'Interview scheduled: ALYSSA MARIE', 'Booked on 2026-09-01 00:00:00 08:00 with Juan Dela Cruz.', 'Applicant Management', 'Interview', '22', 0, NULL, '2026-08-31 11:33:56'),
(442, 15, 'info', 'Interview scheduled: ALYSSA MARIE', 'Booked on 2026-09-01 00:00:00 08:00 with Juan Dela Cruz.', 'Applicant Management', 'Interview', '22', 0, NULL, '2026-08-31 11:33:56'),
(443, 16, 'info', 'Interview scheduled: ALYSSA MARIE', 'Booked on 2026-09-01 00:00:00 08:00 with Juan Dela Cruz.', 'Applicant Management', 'Interview', '22', 0, NULL, '2026-08-31 11:33:56'),
(444, 1, 'info', 'Applicant ALYSSA MARIE: Accepted', 'Stage updated from Interview Scheduled to Accepted for HR Assistant.', 'Applicant Management', 'Applicant', '53', 0, NULL, '2026-08-31 11:34:13'),
(445, 2, 'info', 'Applicant ALYSSA MARIE: Accepted', 'Stage updated from Interview Scheduled to Accepted for HR Assistant.', 'Applicant Management', 'Applicant', '53', 0, NULL, '2026-08-31 11:34:13'),
(446, 3, 'info', 'Applicant ALYSSA MARIE: Accepted', 'Stage updated from Interview Scheduled to Accepted for HR Assistant.', 'Applicant Management', 'Applicant', '53', 1, '2026-08-31 11:56:25', '2026-08-31 11:34:13'),
(447, 4, 'info', 'Applicant ALYSSA MARIE: Accepted', 'Stage updated from Interview Scheduled to Accepted for HR Assistant.', 'Applicant Management', 'Applicant', '53', 0, NULL, '2026-08-31 11:34:13'),
(448, 6, 'info', 'Applicant ALYSSA MARIE: Accepted', 'Stage updated from Interview Scheduled to Accepted for HR Assistant.', 'Applicant Management', 'Applicant', '53', 0, NULL, '2026-08-31 11:34:13'),
(449, 7, 'info', 'Applicant ALYSSA MARIE: Accepted', 'Stage updated from Interview Scheduled to Accepted for HR Assistant.', 'Applicant Management', 'Applicant', '53', 0, NULL, '2026-08-31 11:34:13'),
(450, 8, 'info', 'Applicant ALYSSA MARIE: Accepted', 'Stage updated from Interview Scheduled to Accepted for HR Assistant.', 'Applicant Management', 'Applicant', '53', 0, NULL, '2026-08-31 11:34:13'),
(451, 10, 'info', 'Applicant ALYSSA MARIE: Accepted', 'Stage updated from Interview Scheduled to Accepted for HR Assistant.', 'Applicant Management', 'Applicant', '53', 0, NULL, '2026-08-31 11:34:13'),
(452, 11, 'info', 'Applicant ALYSSA MARIE: Accepted', 'Stage updated from Interview Scheduled to Accepted for HR Assistant.', 'Applicant Management', 'Applicant', '53', 0, NULL, '2026-08-31 11:34:13'),
(453, 12, 'info', 'Applicant ALYSSA MARIE: Accepted', 'Stage updated from Interview Scheduled to Accepted for HR Assistant.', 'Applicant Management', 'Applicant', '53', 0, NULL, '2026-08-31 11:34:13'),
(454, 13, 'info', 'Applicant ALYSSA MARIE: Accepted', 'Stage updated from Interview Scheduled to Accepted for HR Assistant.', 'Applicant Management', 'Applicant', '53', 0, NULL, '2026-08-31 11:34:13'),
(455, 14, 'info', 'Applicant ALYSSA MARIE: Accepted', 'Stage updated from Interview Scheduled to Accepted for HR Assistant.', 'Applicant Management', 'Applicant', '53', 0, NULL, '2026-08-31 11:34:13'),
(456, 15, 'info', 'Applicant ALYSSA MARIE: Accepted', 'Stage updated from Interview Scheduled to Accepted for HR Assistant.', 'Applicant Management', 'Applicant', '53', 0, NULL, '2026-08-31 11:34:13'),
(457, 16, 'info', 'Applicant ALYSSA MARIE: Accepted', 'Stage updated from Interview Scheduled to Accepted for HR Assistant.', 'Applicant Management', 'Applicant', '53', 0, NULL, '2026-08-31 11:34:13'),
(458, 1, 'info', 'Interview scheduled: Vincent Paul Soriano', 'Booked on 2026-09-29 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '23', 0, NULL, '2026-08-31 11:40:25'),
(459, 2, 'info', 'Interview scheduled: Vincent Paul Soriano', 'Booked on 2026-09-29 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '23', 0, NULL, '2026-08-31 11:40:25'),
(460, 3, 'info', 'Interview scheduled: Vincent Paul Soriano', 'Booked on 2026-09-29 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '23', 1, '2026-08-31 11:56:24', '2026-08-31 11:40:25'),
(461, 4, 'info', 'Interview scheduled: Vincent Paul Soriano', 'Booked on 2026-09-29 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '23', 0, NULL, '2026-08-31 11:40:25'),
(462, 6, 'info', 'Interview scheduled: Vincent Paul Soriano', 'Booked on 2026-09-29 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '23', 0, NULL, '2026-08-31 11:40:25'),
(463, 7, 'info', 'Interview scheduled: Vincent Paul Soriano', 'Booked on 2026-09-29 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '23', 0, NULL, '2026-08-31 11:40:25'),
(464, 8, 'info', 'Interview scheduled: Vincent Paul Soriano', 'Booked on 2026-09-29 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '23', 0, NULL, '2026-08-31 11:40:25'),
(465, 10, 'info', 'Interview scheduled: Vincent Paul Soriano', 'Booked on 2026-09-29 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '23', 0, NULL, '2026-08-31 11:40:25'),
(466, 11, 'info', 'Interview scheduled: Vincent Paul Soriano', 'Booked on 2026-09-29 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '23', 0, NULL, '2026-08-31 11:40:25'),
(467, 12, 'info', 'Interview scheduled: Vincent Paul Soriano', 'Booked on 2026-09-29 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '23', 0, NULL, '2026-08-31 11:40:25'),
(468, 13, 'info', 'Interview scheduled: Vincent Paul Soriano', 'Booked on 2026-09-29 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '23', 0, NULL, '2026-08-31 11:40:25'),
(469, 14, 'info', 'Interview scheduled: Vincent Paul Soriano', 'Booked on 2026-09-29 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '23', 0, NULL, '2026-08-31 11:40:25'),
(470, 15, 'info', 'Interview scheduled: Vincent Paul Soriano', 'Booked on 2026-09-29 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '23', 0, NULL, '2026-08-31 11:40:25'),
(471, 16, 'info', 'Interview scheduled: Vincent Paul Soriano', 'Booked on 2026-09-29 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '23', 0, NULL, '2026-08-31 11:40:25'),
(472, 1, 'warning', 'Interview cancelled: Vincent Paul Soriano', 'Interview on 2026-09-22 00:00:00 08:00:00 was cancelled.', 'Applicant Management', 'Interview', '23', 0, NULL, '2026-08-31 11:47:36'),
(473, 2, 'warning', 'Interview cancelled: Vincent Paul Soriano', 'Interview on 2026-09-22 00:00:00 08:00:00 was cancelled.', 'Applicant Management', 'Interview', '23', 0, NULL, '2026-08-31 11:47:36'),
(474, 3, 'warning', 'Interview cancelled: Vincent Paul Soriano', 'Interview on 2026-09-22 00:00:00 08:00:00 was cancelled.', 'Applicant Management', 'Interview', '23', 1, '2026-08-31 11:56:23', '2026-08-31 11:47:36'),
(475, 4, 'warning', 'Interview cancelled: Vincent Paul Soriano', 'Interview on 2026-09-22 00:00:00 08:00:00 was cancelled.', 'Applicant Management', 'Interview', '23', 0, NULL, '2026-08-31 11:47:36'),
(476, 6, 'warning', 'Interview cancelled: Vincent Paul Soriano', 'Interview on 2026-09-22 00:00:00 08:00:00 was cancelled.', 'Applicant Management', 'Interview', '23', 0, NULL, '2026-08-31 11:47:36'),
(477, 7, 'warning', 'Interview cancelled: Vincent Paul Soriano', 'Interview on 2026-09-22 00:00:00 08:00:00 was cancelled.', 'Applicant Management', 'Interview', '23', 0, NULL, '2026-08-31 11:47:36'),
(478, 8, 'warning', 'Interview cancelled: Vincent Paul Soriano', 'Interview on 2026-09-22 00:00:00 08:00:00 was cancelled.', 'Applicant Management', 'Interview', '23', 0, NULL, '2026-08-31 11:47:36'),
(479, 10, 'warning', 'Interview cancelled: Vincent Paul Soriano', 'Interview on 2026-09-22 00:00:00 08:00:00 was cancelled.', 'Applicant Management', 'Interview', '23', 0, NULL, '2026-08-31 11:47:36'),
(480, 11, 'warning', 'Interview cancelled: Vincent Paul Soriano', 'Interview on 2026-09-22 00:00:00 08:00:00 was cancelled.', 'Applicant Management', 'Interview', '23', 0, NULL, '2026-08-31 11:47:36'),
(481, 12, 'warning', 'Interview cancelled: Vincent Paul Soriano', 'Interview on 2026-09-22 00:00:00 08:00:00 was cancelled.', 'Applicant Management', 'Interview', '23', 0, NULL, '2026-08-31 11:47:36'),
(482, 13, 'warning', 'Interview cancelled: Vincent Paul Soriano', 'Interview on 2026-09-22 00:00:00 08:00:00 was cancelled.', 'Applicant Management', 'Interview', '23', 0, NULL, '2026-08-31 11:47:36'),
(483, 14, 'warning', 'Interview cancelled: Vincent Paul Soriano', 'Interview on 2026-09-22 00:00:00 08:00:00 was cancelled.', 'Applicant Management', 'Interview', '23', 0, NULL, '2026-08-31 11:47:36'),
(484, 15, 'warning', 'Interview cancelled: Vincent Paul Soriano', 'Interview on 2026-09-22 00:00:00 08:00:00 was cancelled.', 'Applicant Management', 'Interview', '23', 0, NULL, '2026-08-31 11:47:36'),
(485, 16, 'warning', 'Interview cancelled: Vincent Paul Soriano', 'Interview on 2026-09-22 00:00:00 08:00:00 was cancelled.', 'Applicant Management', 'Interview', '23', 0, NULL, '2026-08-31 11:47:36'),
(486, 1, 'info', 'Applicant Vincent Paul Soriano: Accepted', 'Stage updated from Screened to Accepted for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '42', 0, NULL, '2026-08-31 11:49:35'),
(487, 2, 'info', 'Applicant Vincent Paul Soriano: Accepted', 'Stage updated from Screened to Accepted for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '42', 0, NULL, '2026-08-31 11:49:35'),
(488, 3, 'info', 'Applicant Vincent Paul Soriano: Accepted', 'Stage updated from Screened to Accepted for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '42', 1, '2026-08-31 11:56:22', '2026-08-31 11:49:35'),
(489, 4, 'info', 'Applicant Vincent Paul Soriano: Accepted', 'Stage updated from Screened to Accepted for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '42', 0, NULL, '2026-08-31 11:49:35'),
(490, 6, 'info', 'Applicant Vincent Paul Soriano: Accepted', 'Stage updated from Screened to Accepted for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '42', 0, NULL, '2026-08-31 11:49:35'),
(491, 7, 'info', 'Applicant Vincent Paul Soriano: Accepted', 'Stage updated from Screened to Accepted for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '42', 0, NULL, '2026-08-31 11:49:35'),
(492, 8, 'info', 'Applicant Vincent Paul Soriano: Accepted', 'Stage updated from Screened to Accepted for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '42', 0, NULL, '2026-08-31 11:49:35'),
(493, 10, 'info', 'Applicant Vincent Paul Soriano: Accepted', 'Stage updated from Screened to Accepted for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '42', 0, NULL, '2026-08-31 11:49:35'),
(494, 11, 'info', 'Applicant Vincent Paul Soriano: Accepted', 'Stage updated from Screened to Accepted for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '42', 0, NULL, '2026-08-31 11:49:35'),
(495, 12, 'info', 'Applicant Vincent Paul Soriano: Accepted', 'Stage updated from Screened to Accepted for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '42', 0, NULL, '2026-08-31 11:49:35'),
(496, 13, 'info', 'Applicant Vincent Paul Soriano: Accepted', 'Stage updated from Screened to Accepted for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '42', 0, NULL, '2026-08-31 11:49:35'),
(497, 14, 'info', 'Applicant Vincent Paul Soriano: Accepted', 'Stage updated from Screened to Accepted for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '42', 0, NULL, '2026-08-31 11:49:35'),
(498, 15, 'info', 'Applicant Vincent Paul Soriano: Accepted', 'Stage updated from Screened to Accepted for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '42', 0, NULL, '2026-08-31 11:49:35'),
(499, 16, 'info', 'Applicant Vincent Paul Soriano: Accepted', 'Stage updated from Screened to Accepted for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '42', 0, NULL, '2026-08-31 11:49:35'),
(500, 1, 'info', 'Interview scheduled: Vincent Paul Soriano', 'Booked on 2026-09-01 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '24', 0, NULL, '2026-08-31 11:50:12'),
(501, 2, 'info', 'Interview scheduled: Vincent Paul Soriano', 'Booked on 2026-09-01 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '24', 0, NULL, '2026-08-31 11:50:12'),
(502, 3, 'info', 'Interview scheduled: Vincent Paul Soriano', 'Booked on 2026-09-01 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '24', 1, '2026-08-31 11:56:20', '2026-08-31 11:50:12'),
(503, 4, 'info', 'Interview scheduled: Vincent Paul Soriano', 'Booked on 2026-09-01 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '24', 0, NULL, '2026-08-31 11:50:12'),
(504, 6, 'info', 'Interview scheduled: Vincent Paul Soriano', 'Booked on 2026-09-01 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '24', 0, NULL, '2026-08-31 11:50:12'),
(505, 7, 'info', 'Interview scheduled: Vincent Paul Soriano', 'Booked on 2026-09-01 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '24', 0, NULL, '2026-08-31 11:50:12'),
(506, 8, 'info', 'Interview scheduled: Vincent Paul Soriano', 'Booked on 2026-09-01 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '24', 0, NULL, '2026-08-31 11:50:12'),
(507, 10, 'info', 'Interview scheduled: Vincent Paul Soriano', 'Booked on 2026-09-01 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '24', 0, NULL, '2026-08-31 11:50:12'),
(508, 11, 'info', 'Interview scheduled: Vincent Paul Soriano', 'Booked on 2026-09-01 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '24', 0, NULL, '2026-08-31 11:50:12'),
(509, 12, 'info', 'Interview scheduled: Vincent Paul Soriano', 'Booked on 2026-09-01 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '24', 0, NULL, '2026-08-31 11:50:12'),
(510, 13, 'info', 'Interview scheduled: Vincent Paul Soriano', 'Booked on 2026-09-01 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '24', 0, NULL, '2026-08-31 11:50:12'),
(511, 14, 'info', 'Interview scheduled: Vincent Paul Soriano', 'Booked on 2026-09-01 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '24', 0, NULL, '2026-08-31 11:50:12'),
(512, 15, 'info', 'Interview scheduled: Vincent Paul Soriano', 'Booked on 2026-09-01 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '24', 0, NULL, '2026-08-31 11:50:12'),
(513, 16, 'info', 'Interview scheduled: Vincent Paul Soriano', 'Booked on 2026-09-01 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '24', 0, NULL, '2026-08-31 11:50:12'),
(514, 1, 'warning', 'Interview cancelled: Vincent Paul Soriano', 'Interview on 2026-09-01 00:00:00 08:00:00 was cancelled.', 'Applicant Management', 'Interview', '24', 0, NULL, '2026-08-31 11:50:30'),
(515, 2, 'warning', 'Interview cancelled: Vincent Paul Soriano', 'Interview on 2026-09-01 00:00:00 08:00:00 was cancelled.', 'Applicant Management', 'Interview', '24', 0, NULL, '2026-08-31 11:50:30'),
(516, 3, 'warning', 'Interview cancelled: Vincent Paul Soriano', 'Interview on 2026-09-01 00:00:00 08:00:00 was cancelled.', 'Applicant Management', 'Interview', '24', 1, '2026-08-31 11:56:19', '2026-08-31 11:50:30'),
(517, 4, 'warning', 'Interview cancelled: Vincent Paul Soriano', 'Interview on 2026-09-01 00:00:00 08:00:00 was cancelled.', 'Applicant Management', 'Interview', '24', 0, NULL, '2026-08-31 11:50:30'),
(518, 6, 'warning', 'Interview cancelled: Vincent Paul Soriano', 'Interview on 2026-09-01 00:00:00 08:00:00 was cancelled.', 'Applicant Management', 'Interview', '24', 0, NULL, '2026-08-31 11:50:30'),
(519, 7, 'warning', 'Interview cancelled: Vincent Paul Soriano', 'Interview on 2026-09-01 00:00:00 08:00:00 was cancelled.', 'Applicant Management', 'Interview', '24', 0, NULL, '2026-08-31 11:50:30'),
(520, 8, 'warning', 'Interview cancelled: Vincent Paul Soriano', 'Interview on 2026-09-01 00:00:00 08:00:00 was cancelled.', 'Applicant Management', 'Interview', '24', 0, NULL, '2026-08-31 11:50:30'),
(521, 10, 'warning', 'Interview cancelled: Vincent Paul Soriano', 'Interview on 2026-09-01 00:00:00 08:00:00 was cancelled.', 'Applicant Management', 'Interview', '24', 0, NULL, '2026-08-31 11:50:30'),
(522, 11, 'warning', 'Interview cancelled: Vincent Paul Soriano', 'Interview on 2026-09-01 00:00:00 08:00:00 was cancelled.', 'Applicant Management', 'Interview', '24', 0, NULL, '2026-08-31 11:50:30'),
(523, 12, 'warning', 'Interview cancelled: Vincent Paul Soriano', 'Interview on 2026-09-01 00:00:00 08:00:00 was cancelled.', 'Applicant Management', 'Interview', '24', 0, NULL, '2026-08-31 11:50:30'),
(524, 13, 'warning', 'Interview cancelled: Vincent Paul Soriano', 'Interview on 2026-09-01 00:00:00 08:00:00 was cancelled.', 'Applicant Management', 'Interview', '24', 0, NULL, '2026-08-31 11:50:30'),
(525, 14, 'warning', 'Interview cancelled: Vincent Paul Soriano', 'Interview on 2026-09-01 00:00:00 08:00:00 was cancelled.', 'Applicant Management', 'Interview', '24', 0, NULL, '2026-08-31 11:50:30'),
(526, 15, 'warning', 'Interview cancelled: Vincent Paul Soriano', 'Interview on 2026-09-01 00:00:00 08:00:00 was cancelled.', 'Applicant Management', 'Interview', '24', 0, NULL, '2026-08-31 11:50:30'),
(527, 16, 'warning', 'Interview cancelled: Vincent Paul Soriano', 'Interview on 2026-09-01 00:00:00 08:00:00 was cancelled.', 'Applicant Management', 'Interview', '24', 0, NULL, '2026-08-31 11:50:30'),
(528, 1, 'info', 'New applicant: Adrian Paolo Mercado', 'Submitted application with screening score 81.33%.', 'Applicant Management', 'Applicant', '54', 0, NULL, '2026-08-31 12:15:28'),
(529, 2, 'info', 'New applicant: Adrian Paolo Mercado', 'Submitted application with screening score 81.33%.', 'Applicant Management', 'Applicant', '54', 0, NULL, '2026-08-31 12:15:28'),
(530, 3, 'info', 'New applicant: Adrian Paolo Mercado', 'Submitted application with screening score 81.33%.', 'Applicant Management', 'Applicant', '54', 1, '2026-09-01 21:33:59', '2026-08-31 12:15:28');
INSERT INTO `notifications` (`notification_id`, `system_user_id`, `type`, `title`, `body`, `module_name`, `target_type`, `target_id`, `is_read`, `read_at`, `created_at`) VALUES
(531, 4, 'info', 'New applicant: Adrian Paolo Mercado', 'Submitted application with screening score 81.33%.', 'Applicant Management', 'Applicant', '54', 0, NULL, '2026-08-31 12:15:28'),
(532, 6, 'info', 'New applicant: Adrian Paolo Mercado', 'Submitted application with screening score 81.33%.', 'Applicant Management', 'Applicant', '54', 0, NULL, '2026-08-31 12:15:28'),
(533, 7, 'info', 'New applicant: Adrian Paolo Mercado', 'Submitted application with screening score 81.33%.', 'Applicant Management', 'Applicant', '54', 0, NULL, '2026-08-31 12:15:28'),
(534, 8, 'info', 'New applicant: Adrian Paolo Mercado', 'Submitted application with screening score 81.33%.', 'Applicant Management', 'Applicant', '54', 0, NULL, '2026-08-31 12:15:28'),
(535, 10, 'info', 'New applicant: Adrian Paolo Mercado', 'Submitted application with screening score 81.33%.', 'Applicant Management', 'Applicant', '54', 0, NULL, '2026-08-31 12:15:28'),
(536, 11, 'info', 'New applicant: Adrian Paolo Mercado', 'Submitted application with screening score 81.33%.', 'Applicant Management', 'Applicant', '54', 0, NULL, '2026-08-31 12:15:28'),
(537, 12, 'info', 'New applicant: Adrian Paolo Mercado', 'Submitted application with screening score 81.33%.', 'Applicant Management', 'Applicant', '54', 0, NULL, '2026-08-31 12:15:28'),
(538, 13, 'info', 'New applicant: Adrian Paolo Mercado', 'Submitted application with screening score 81.33%.', 'Applicant Management', 'Applicant', '54', 0, NULL, '2026-08-31 12:15:28'),
(539, 14, 'info', 'New applicant: Adrian Paolo Mercado', 'Submitted application with screening score 81.33%.', 'Applicant Management', 'Applicant', '54', 0, NULL, '2026-08-31 12:15:28'),
(540, 15, 'info', 'New applicant: Adrian Paolo Mercado', 'Submitted application with screening score 81.33%.', 'Applicant Management', 'Applicant', '54', 0, NULL, '2026-08-31 12:15:28'),
(541, 16, 'info', 'New applicant: Adrian Paolo Mercado', 'Submitted application with screening score 81.33%.', 'Applicant Management', 'Applicant', '54', 0, NULL, '2026-08-31 12:15:28'),
(542, 1, 'info', 'Applicant Adrian Paolo Mercado: Accepted', 'Stage updated from Screened to Accepted for Housekeeping Attendant.', 'Applicant Management', 'Applicant', '54', 0, NULL, '2026-08-31 12:17:28'),
(543, 2, 'info', 'Applicant Adrian Paolo Mercado: Accepted', 'Stage updated from Screened to Accepted for Housekeeping Attendant.', 'Applicant Management', 'Applicant', '54', 0, NULL, '2026-08-31 12:17:28'),
(544, 3, 'info', 'Applicant Adrian Paolo Mercado: Accepted', 'Stage updated from Screened to Accepted for Housekeeping Attendant.', 'Applicant Management', 'Applicant', '54', 1, '2026-09-01 21:33:58', '2026-08-31 12:17:28'),
(545, 4, 'info', 'Applicant Adrian Paolo Mercado: Accepted', 'Stage updated from Screened to Accepted for Housekeeping Attendant.', 'Applicant Management', 'Applicant', '54', 0, NULL, '2026-08-31 12:17:28'),
(546, 6, 'info', 'Applicant Adrian Paolo Mercado: Accepted', 'Stage updated from Screened to Accepted for Housekeeping Attendant.', 'Applicant Management', 'Applicant', '54', 0, NULL, '2026-08-31 12:17:28'),
(547, 7, 'info', 'Applicant Adrian Paolo Mercado: Accepted', 'Stage updated from Screened to Accepted for Housekeeping Attendant.', 'Applicant Management', 'Applicant', '54', 0, NULL, '2026-08-31 12:17:28'),
(548, 8, 'info', 'Applicant Adrian Paolo Mercado: Accepted', 'Stage updated from Screened to Accepted for Housekeeping Attendant.', 'Applicant Management', 'Applicant', '54', 0, NULL, '2026-08-31 12:17:28'),
(549, 10, 'info', 'Applicant Adrian Paolo Mercado: Accepted', 'Stage updated from Screened to Accepted for Housekeeping Attendant.', 'Applicant Management', 'Applicant', '54', 0, NULL, '2026-08-31 12:17:28'),
(550, 11, 'info', 'Applicant Adrian Paolo Mercado: Accepted', 'Stage updated from Screened to Accepted for Housekeeping Attendant.', 'Applicant Management', 'Applicant', '54', 0, NULL, '2026-08-31 12:17:28'),
(551, 12, 'info', 'Applicant Adrian Paolo Mercado: Accepted', 'Stage updated from Screened to Accepted for Housekeeping Attendant.', 'Applicant Management', 'Applicant', '54', 0, NULL, '2026-08-31 12:17:28'),
(552, 13, 'info', 'Applicant Adrian Paolo Mercado: Accepted', 'Stage updated from Screened to Accepted for Housekeeping Attendant.', 'Applicant Management', 'Applicant', '54', 0, NULL, '2026-08-31 12:17:28'),
(553, 14, 'info', 'Applicant Adrian Paolo Mercado: Accepted', 'Stage updated from Screened to Accepted for Housekeeping Attendant.', 'Applicant Management', 'Applicant', '54', 0, NULL, '2026-08-31 12:17:28'),
(554, 15, 'info', 'Applicant Adrian Paolo Mercado: Accepted', 'Stage updated from Screened to Accepted for Housekeeping Attendant.', 'Applicant Management', 'Applicant', '54', 0, NULL, '2026-08-31 12:17:28'),
(555, 16, 'info', 'Applicant Adrian Paolo Mercado: Accepted', 'Stage updated from Screened to Accepted for Housekeeping Attendant.', 'Applicant Management', 'Applicant', '54', 0, NULL, '2026-08-31 12:17:28'),
(556, 1, 'info', 'Interview scheduled: Adrian Paolo Mercado', 'Booked on 2026-09-10 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '25', 0, NULL, '2026-08-31 12:17:36'),
(557, 2, 'info', 'Interview scheduled: Adrian Paolo Mercado', 'Booked on 2026-09-10 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '25', 0, NULL, '2026-08-31 12:17:36'),
(558, 3, 'info', 'Interview scheduled: Adrian Paolo Mercado', 'Booked on 2026-09-10 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '25', 1, '2026-09-01 21:33:57', '2026-08-31 12:17:36'),
(559, 4, 'info', 'Interview scheduled: Adrian Paolo Mercado', 'Booked on 2026-09-10 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '25', 0, NULL, '2026-08-31 12:17:36'),
(560, 6, 'info', 'Interview scheduled: Adrian Paolo Mercado', 'Booked on 2026-09-10 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '25', 0, NULL, '2026-08-31 12:17:36'),
(561, 7, 'info', 'Interview scheduled: Adrian Paolo Mercado', 'Booked on 2026-09-10 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '25', 0, NULL, '2026-08-31 12:17:36'),
(562, 8, 'info', 'Interview scheduled: Adrian Paolo Mercado', 'Booked on 2026-09-10 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '25', 0, NULL, '2026-08-31 12:17:36'),
(563, 10, 'info', 'Interview scheduled: Adrian Paolo Mercado', 'Booked on 2026-09-10 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '25', 0, NULL, '2026-08-31 12:17:36'),
(564, 11, 'info', 'Interview scheduled: Adrian Paolo Mercado', 'Booked on 2026-09-10 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '25', 0, NULL, '2026-08-31 12:17:36'),
(565, 12, 'info', 'Interview scheduled: Adrian Paolo Mercado', 'Booked on 2026-09-10 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '25', 0, NULL, '2026-08-31 12:17:36'),
(566, 13, 'info', 'Interview scheduled: Adrian Paolo Mercado', 'Booked on 2026-09-10 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '25', 0, NULL, '2026-08-31 12:17:36'),
(567, 14, 'info', 'Interview scheduled: Adrian Paolo Mercado', 'Booked on 2026-09-10 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '25', 0, NULL, '2026-08-31 12:17:36'),
(568, 15, 'info', 'Interview scheduled: Adrian Paolo Mercado', 'Booked on 2026-09-10 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '25', 0, NULL, '2026-08-31 12:17:36'),
(569, 16, 'info', 'Interview scheduled: Adrian Paolo Mercado', 'Booked on 2026-09-10 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '25', 0, NULL, '2026-08-31 12:17:36'),
(570, 1, 'warning', 'Interview cancelled: Adrian Paolo Mercado', 'Interview on 2026-09-10 00:00:00 08:00:00 was cancelled.', 'Applicant Management', 'Interview', '25', 0, NULL, '2026-08-31 12:18:15'),
(571, 2, 'warning', 'Interview cancelled: Adrian Paolo Mercado', 'Interview on 2026-09-10 00:00:00 08:00:00 was cancelled.', 'Applicant Management', 'Interview', '25', 0, NULL, '2026-08-31 12:18:15'),
(572, 3, 'warning', 'Interview cancelled: Adrian Paolo Mercado', 'Interview on 2026-09-10 00:00:00 08:00:00 was cancelled.', 'Applicant Management', 'Interview', '25', 1, '2026-09-01 21:33:57', '2026-08-31 12:18:15'),
(573, 4, 'warning', 'Interview cancelled: Adrian Paolo Mercado', 'Interview on 2026-09-10 00:00:00 08:00:00 was cancelled.', 'Applicant Management', 'Interview', '25', 0, NULL, '2026-08-31 12:18:15'),
(574, 6, 'warning', 'Interview cancelled: Adrian Paolo Mercado', 'Interview on 2026-09-10 00:00:00 08:00:00 was cancelled.', 'Applicant Management', 'Interview', '25', 0, NULL, '2026-08-31 12:18:15'),
(575, 7, 'warning', 'Interview cancelled: Adrian Paolo Mercado', 'Interview on 2026-09-10 00:00:00 08:00:00 was cancelled.', 'Applicant Management', 'Interview', '25', 0, NULL, '2026-08-31 12:18:15'),
(576, 8, 'warning', 'Interview cancelled: Adrian Paolo Mercado', 'Interview on 2026-09-10 00:00:00 08:00:00 was cancelled.', 'Applicant Management', 'Interview', '25', 0, NULL, '2026-08-31 12:18:15'),
(577, 10, 'warning', 'Interview cancelled: Adrian Paolo Mercado', 'Interview on 2026-09-10 00:00:00 08:00:00 was cancelled.', 'Applicant Management', 'Interview', '25', 0, NULL, '2026-08-31 12:18:15'),
(578, 11, 'warning', 'Interview cancelled: Adrian Paolo Mercado', 'Interview on 2026-09-10 00:00:00 08:00:00 was cancelled.', 'Applicant Management', 'Interview', '25', 0, NULL, '2026-08-31 12:18:15'),
(579, 12, 'warning', 'Interview cancelled: Adrian Paolo Mercado', 'Interview on 2026-09-10 00:00:00 08:00:00 was cancelled.', 'Applicant Management', 'Interview', '25', 0, NULL, '2026-08-31 12:18:15'),
(580, 13, 'warning', 'Interview cancelled: Adrian Paolo Mercado', 'Interview on 2026-09-10 00:00:00 08:00:00 was cancelled.', 'Applicant Management', 'Interview', '25', 0, NULL, '2026-08-31 12:18:15'),
(581, 14, 'warning', 'Interview cancelled: Adrian Paolo Mercado', 'Interview on 2026-09-10 00:00:00 08:00:00 was cancelled.', 'Applicant Management', 'Interview', '25', 0, NULL, '2026-08-31 12:18:15'),
(582, 15, 'warning', 'Interview cancelled: Adrian Paolo Mercado', 'Interview on 2026-09-10 00:00:00 08:00:00 was cancelled.', 'Applicant Management', 'Interview', '25', 0, NULL, '2026-08-31 12:18:15'),
(583, 16, 'warning', 'Interview cancelled: Adrian Paolo Mercado', 'Interview on 2026-09-10 00:00:00 08:00:00 was cancelled.', 'Applicant Management', 'Interview', '25', 0, NULL, '2026-08-31 12:18:15'),
(584, 1, 'warning', 'Interview cancelled: Juan De La Cruz', 'Interview on 2026-09-01 00:00:00 01:30:00 was cancelled.', 'Applicant Management', 'Interview', '2', 0, NULL, '2026-08-31 12:22:47'),
(585, 2, 'warning', 'Interview cancelled: Juan De La Cruz', 'Interview on 2026-09-01 00:00:00 01:30:00 was cancelled.', 'Applicant Management', 'Interview', '2', 0, NULL, '2026-08-31 12:22:47'),
(586, 3, 'warning', 'Interview cancelled: Juan De La Cruz', 'Interview on 2026-09-01 00:00:00 01:30:00 was cancelled.', 'Applicant Management', 'Interview', '2', 1, '2026-09-01 21:33:56', '2026-08-31 12:22:47'),
(587, 4, 'warning', 'Interview cancelled: Juan De La Cruz', 'Interview on 2026-09-01 00:00:00 01:30:00 was cancelled.', 'Applicant Management', 'Interview', '2', 0, NULL, '2026-08-31 12:22:47'),
(588, 6, 'warning', 'Interview cancelled: Juan De La Cruz', 'Interview on 2026-09-01 00:00:00 01:30:00 was cancelled.', 'Applicant Management', 'Interview', '2', 0, NULL, '2026-08-31 12:22:47'),
(589, 7, 'warning', 'Interview cancelled: Juan De La Cruz', 'Interview on 2026-09-01 00:00:00 01:30:00 was cancelled.', 'Applicant Management', 'Interview', '2', 0, NULL, '2026-08-31 12:22:47'),
(590, 8, 'warning', 'Interview cancelled: Juan De La Cruz', 'Interview on 2026-09-01 00:00:00 01:30:00 was cancelled.', 'Applicant Management', 'Interview', '2', 0, NULL, '2026-08-31 12:22:47'),
(591, 10, 'warning', 'Interview cancelled: Juan De La Cruz', 'Interview on 2026-09-01 00:00:00 01:30:00 was cancelled.', 'Applicant Management', 'Interview', '2', 0, NULL, '2026-08-31 12:22:47'),
(592, 11, 'warning', 'Interview cancelled: Juan De La Cruz', 'Interview on 2026-09-01 00:00:00 01:30:00 was cancelled.', 'Applicant Management', 'Interview', '2', 0, NULL, '2026-08-31 12:22:47'),
(593, 12, 'warning', 'Interview cancelled: Juan De La Cruz', 'Interview on 2026-09-01 00:00:00 01:30:00 was cancelled.', 'Applicant Management', 'Interview', '2', 0, NULL, '2026-08-31 12:22:47'),
(594, 13, 'warning', 'Interview cancelled: Juan De La Cruz', 'Interview on 2026-09-01 00:00:00 01:30:00 was cancelled.', 'Applicant Management', 'Interview', '2', 0, NULL, '2026-08-31 12:22:47'),
(595, 14, 'warning', 'Interview cancelled: Juan De La Cruz', 'Interview on 2026-09-01 00:00:00 01:30:00 was cancelled.', 'Applicant Management', 'Interview', '2', 0, NULL, '2026-08-31 12:22:47'),
(596, 15, 'warning', 'Interview cancelled: Juan De La Cruz', 'Interview on 2026-09-01 00:00:00 01:30:00 was cancelled.', 'Applicant Management', 'Interview', '2', 0, NULL, '2026-08-31 12:22:47'),
(597, 16, 'warning', 'Interview cancelled: Juan De La Cruz', 'Interview on 2026-09-01 00:00:00 01:30:00 was cancelled.', 'Applicant Management', 'Interview', '2', 0, NULL, '2026-08-31 12:22:47'),
(598, 1, 'info', 'Interview scheduled: Vincent Paul Soriano', 'Booked on 2026-09-01 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '26', 0, NULL, '2026-08-31 12:45:05'),
(599, 2, 'info', 'Interview scheduled: Vincent Paul Soriano', 'Booked on 2026-09-01 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '26', 0, NULL, '2026-08-31 12:45:05'),
(600, 3, 'info', 'Interview scheduled: Vincent Paul Soriano', 'Booked on 2026-09-01 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '26', 1, '2026-09-01 21:33:55', '2026-08-31 12:45:05'),
(601, 4, 'info', 'Interview scheduled: Vincent Paul Soriano', 'Booked on 2026-09-01 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '26', 0, NULL, '2026-08-31 12:45:05'),
(602, 6, 'info', 'Interview scheduled: Vincent Paul Soriano', 'Booked on 2026-09-01 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '26', 0, NULL, '2026-08-31 12:45:05'),
(603, 7, 'info', 'Interview scheduled: Vincent Paul Soriano', 'Booked on 2026-09-01 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '26', 0, NULL, '2026-08-31 12:45:05'),
(604, 8, 'info', 'Interview scheduled: Vincent Paul Soriano', 'Booked on 2026-09-01 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '26', 0, NULL, '2026-08-31 12:45:05'),
(605, 10, 'info', 'Interview scheduled: Vincent Paul Soriano', 'Booked on 2026-09-01 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '26', 0, NULL, '2026-08-31 12:45:05'),
(606, 11, 'info', 'Interview scheduled: Vincent Paul Soriano', 'Booked on 2026-09-01 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '26', 0, NULL, '2026-08-31 12:45:05'),
(607, 12, 'info', 'Interview scheduled: Vincent Paul Soriano', 'Booked on 2026-09-01 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '26', 0, NULL, '2026-08-31 12:45:05'),
(608, 13, 'info', 'Interview scheduled: Vincent Paul Soriano', 'Booked on 2026-09-01 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '26', 0, NULL, '2026-08-31 12:45:05'),
(609, 14, 'info', 'Interview scheduled: Vincent Paul Soriano', 'Booked on 2026-09-01 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '26', 0, NULL, '2026-08-31 12:45:05'),
(610, 15, 'info', 'Interview scheduled: Vincent Paul Soriano', 'Booked on 2026-09-01 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '26', 0, NULL, '2026-08-31 12:45:05'),
(611, 16, 'info', 'Interview scheduled: Vincent Paul Soriano', 'Booked on 2026-09-01 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '26', 0, NULL, '2026-08-31 12:45:05'),
(612, 1, 'info', 'Assessment completed: Vincent Paul Soriano', 'Scored 84.00% — Outcome: Recommended.', 'Applicant Management', 'Assessment', '11', 0, NULL, '2026-08-31 12:47:29'),
(613, 2, 'info', 'Assessment completed: Vincent Paul Soriano', 'Scored 84.00% — Outcome: Recommended.', 'Applicant Management', 'Assessment', '11', 0, NULL, '2026-08-31 12:47:29'),
(614, 3, 'info', 'Assessment completed: Vincent Paul Soriano', 'Scored 84.00% — Outcome: Recommended.', 'Applicant Management', 'Assessment', '11', 1, '2026-09-01 21:33:55', '2026-08-31 12:47:29'),
(615, 4, 'info', 'Assessment completed: Vincent Paul Soriano', 'Scored 84.00% — Outcome: Recommended.', 'Applicant Management', 'Assessment', '11', 0, NULL, '2026-08-31 12:47:29'),
(616, 6, 'info', 'Assessment completed: Vincent Paul Soriano', 'Scored 84.00% — Outcome: Recommended.', 'Applicant Management', 'Assessment', '11', 0, NULL, '2026-08-31 12:47:29'),
(617, 7, 'info', 'Assessment completed: Vincent Paul Soriano', 'Scored 84.00% — Outcome: Recommended.', 'Applicant Management', 'Assessment', '11', 0, NULL, '2026-08-31 12:47:29'),
(618, 8, 'info', 'Assessment completed: Vincent Paul Soriano', 'Scored 84.00% — Outcome: Recommended.', 'Applicant Management', 'Assessment', '11', 0, NULL, '2026-08-31 12:47:29'),
(619, 10, 'info', 'Assessment completed: Vincent Paul Soriano', 'Scored 84.00% — Outcome: Recommended.', 'Applicant Management', 'Assessment', '11', 0, NULL, '2026-08-31 12:47:29'),
(620, 11, 'info', 'Assessment completed: Vincent Paul Soriano', 'Scored 84.00% — Outcome: Recommended.', 'Applicant Management', 'Assessment', '11', 0, NULL, '2026-08-31 12:47:29'),
(621, 12, 'info', 'Assessment completed: Vincent Paul Soriano', 'Scored 84.00% — Outcome: Recommended.', 'Applicant Management', 'Assessment', '11', 0, NULL, '2026-08-31 12:47:29'),
(622, 13, 'info', 'Assessment completed: Vincent Paul Soriano', 'Scored 84.00% — Outcome: Recommended.', 'Applicant Management', 'Assessment', '11', 0, NULL, '2026-08-31 12:47:29'),
(623, 14, 'info', 'Assessment completed: Vincent Paul Soriano', 'Scored 84.00% — Outcome: Recommended.', 'Applicant Management', 'Assessment', '11', 0, NULL, '2026-08-31 12:47:29'),
(624, 15, 'info', 'Assessment completed: Vincent Paul Soriano', 'Scored 84.00% — Outcome: Recommended.', 'Applicant Management', 'Assessment', '11', 0, NULL, '2026-08-31 12:47:29'),
(625, 16, 'info', 'Assessment completed: Vincent Paul Soriano', 'Scored 84.00% — Outcome: Recommended.', 'Applicant Management', 'Assessment', '11', 0, NULL, '2026-08-31 12:47:29'),
(626, 1, 'success', 'Applicant Vincent Paul Soriano &rarr; Offer', 'Applicant advanced to Offer stage.', 'Applicant Management', 'Applicant', '46', 0, NULL, '2026-08-31 12:52:38'),
(627, 2, 'success', 'Applicant Vincent Paul Soriano &rarr; Offer', 'Applicant advanced to Offer stage.', 'Applicant Management', 'Applicant', '46', 0, NULL, '2026-08-31 12:52:38'),
(628, 3, 'success', 'Applicant Vincent Paul Soriano &rarr; Offer', 'Applicant advanced to Offer stage.', 'Applicant Management', 'Applicant', '46', 1, '2026-09-01 21:33:54', '2026-08-31 12:52:38'),
(629, 4, 'success', 'Applicant Vincent Paul Soriano &rarr; Offer', 'Applicant advanced to Offer stage.', 'Applicant Management', 'Applicant', '46', 0, NULL, '2026-08-31 12:52:38'),
(630, 6, 'success', 'Applicant Vincent Paul Soriano &rarr; Offer', 'Applicant advanced to Offer stage.', 'Applicant Management', 'Applicant', '46', 0, NULL, '2026-08-31 12:52:38'),
(631, 7, 'success', 'Applicant Vincent Paul Soriano &rarr; Offer', 'Applicant advanced to Offer stage.', 'Applicant Management', 'Applicant', '46', 0, NULL, '2026-08-31 12:52:38'),
(632, 8, 'success', 'Applicant Vincent Paul Soriano &rarr; Offer', 'Applicant advanced to Offer stage.', 'Applicant Management', 'Applicant', '46', 0, NULL, '2026-08-31 12:52:38'),
(633, 10, 'success', 'Applicant Vincent Paul Soriano &rarr; Offer', 'Applicant advanced to Offer stage.', 'Applicant Management', 'Applicant', '46', 0, NULL, '2026-08-31 12:52:38'),
(634, 11, 'success', 'Applicant Vincent Paul Soriano &rarr; Offer', 'Applicant advanced to Offer stage.', 'Applicant Management', 'Applicant', '46', 0, NULL, '2026-08-31 12:52:38'),
(635, 12, 'success', 'Applicant Vincent Paul Soriano &rarr; Offer', 'Applicant advanced to Offer stage.', 'Applicant Management', 'Applicant', '46', 0, NULL, '2026-08-31 12:52:38'),
(636, 13, 'success', 'Applicant Vincent Paul Soriano &rarr; Offer', 'Applicant advanced to Offer stage.', 'Applicant Management', 'Applicant', '46', 0, NULL, '2026-08-31 12:52:38'),
(637, 14, 'success', 'Applicant Vincent Paul Soriano &rarr; Offer', 'Applicant advanced to Offer stage.', 'Applicant Management', 'Applicant', '46', 0, NULL, '2026-08-31 12:52:38'),
(638, 15, 'success', 'Applicant Vincent Paul Soriano &rarr; Offer', 'Applicant advanced to Offer stage.', 'Applicant Management', 'Applicant', '46', 0, NULL, '2026-08-31 12:52:38'),
(639, 16, 'success', 'Applicant Vincent Paul Soriano &rarr; Offer', 'Applicant advanced to Offer stage.', 'Applicant Management', 'Applicant', '46', 0, NULL, '2026-08-31 12:52:38'),
(640, 1, 'info', 'New applicant: CARLO MIGUEL FERNAN', 'Submitted application with screening score 89.40%.', 'Applicant Management', 'Applicant', '55', 0, NULL, '2026-08-31 12:56:08'),
(641, 2, 'info', 'New applicant: CARLO MIGUEL FERNAN', 'Submitted application with screening score 89.40%.', 'Applicant Management', 'Applicant', '55', 0, NULL, '2026-08-31 12:56:08'),
(642, 3, 'info', 'New applicant: CARLO MIGUEL FERNAN', 'Submitted application with screening score 89.40%.', 'Applicant Management', 'Applicant', '55', 1, '2026-09-01 21:33:54', '2026-08-31 12:56:08'),
(643, 4, 'info', 'New applicant: CARLO MIGUEL FERNAN', 'Submitted application with screening score 89.40%.', 'Applicant Management', 'Applicant', '55', 0, NULL, '2026-08-31 12:56:08'),
(644, 6, 'info', 'New applicant: CARLO MIGUEL FERNAN', 'Submitted application with screening score 89.40%.', 'Applicant Management', 'Applicant', '55', 0, NULL, '2026-08-31 12:56:08'),
(645, 7, 'info', 'New applicant: CARLO MIGUEL FERNAN', 'Submitted application with screening score 89.40%.', 'Applicant Management', 'Applicant', '55', 0, NULL, '2026-08-31 12:56:08'),
(646, 8, 'info', 'New applicant: CARLO MIGUEL FERNAN', 'Submitted application with screening score 89.40%.', 'Applicant Management', 'Applicant', '55', 0, NULL, '2026-08-31 12:56:08'),
(647, 10, 'info', 'New applicant: CARLO MIGUEL FERNAN', 'Submitted application with screening score 89.40%.', 'Applicant Management', 'Applicant', '55', 0, NULL, '2026-08-31 12:56:08'),
(648, 11, 'info', 'New applicant: CARLO MIGUEL FERNAN', 'Submitted application with screening score 89.40%.', 'Applicant Management', 'Applicant', '55', 0, NULL, '2026-08-31 12:56:08'),
(649, 12, 'info', 'New applicant: CARLO MIGUEL FERNAN', 'Submitted application with screening score 89.40%.', 'Applicant Management', 'Applicant', '55', 0, NULL, '2026-08-31 12:56:08'),
(650, 13, 'info', 'New applicant: CARLO MIGUEL FERNAN', 'Submitted application with screening score 89.40%.', 'Applicant Management', 'Applicant', '55', 0, NULL, '2026-08-31 12:56:08'),
(651, 14, 'info', 'New applicant: CARLO MIGUEL FERNAN', 'Submitted application with screening score 89.40%.', 'Applicant Management', 'Applicant', '55', 0, NULL, '2026-08-31 12:56:08'),
(652, 15, 'info', 'New applicant: CARLO MIGUEL FERNAN', 'Submitted application with screening score 89.40%.', 'Applicant Management', 'Applicant', '55', 0, NULL, '2026-08-31 12:56:08'),
(653, 16, 'info', 'New applicant: CARLO MIGUEL FERNAN', 'Submitted application with screening score 89.40%.', 'Applicant Management', 'Applicant', '55', 0, NULL, '2026-08-31 12:56:08'),
(654, 18, 'info', 'New applicant: CARLO MIGUEL FERNAN', 'Submitted application with screening score 89.40%.', 'Applicant Management', 'Applicant', '55', 0, NULL, '2026-08-31 12:56:08'),
(655, 1, 'info', 'Applicant CARLO MIGUEL FERNAN: Accepted', 'Stage updated from Screened to Accepted for Line Cook.', 'Applicant Management', 'Applicant', '55', 0, NULL, '2026-08-31 12:57:10'),
(656, 2, 'info', 'Applicant CARLO MIGUEL FERNAN: Accepted', 'Stage updated from Screened to Accepted for Line Cook.', 'Applicant Management', 'Applicant', '55', 0, NULL, '2026-08-31 12:57:10'),
(657, 3, 'info', 'Applicant CARLO MIGUEL FERNAN: Accepted', 'Stage updated from Screened to Accepted for Line Cook.', 'Applicant Management', 'Applicant', '55', 1, '2026-09-01 18:14:05', '2026-08-31 12:57:10'),
(658, 4, 'info', 'Applicant CARLO MIGUEL FERNAN: Accepted', 'Stage updated from Screened to Accepted for Line Cook.', 'Applicant Management', 'Applicant', '55', 0, NULL, '2026-08-31 12:57:10'),
(659, 6, 'info', 'Applicant CARLO MIGUEL FERNAN: Accepted', 'Stage updated from Screened to Accepted for Line Cook.', 'Applicant Management', 'Applicant', '55', 0, NULL, '2026-08-31 12:57:10'),
(660, 7, 'info', 'Applicant CARLO MIGUEL FERNAN: Accepted', 'Stage updated from Screened to Accepted for Line Cook.', 'Applicant Management', 'Applicant', '55', 0, NULL, '2026-08-31 12:57:10'),
(661, 8, 'info', 'Applicant CARLO MIGUEL FERNAN: Accepted', 'Stage updated from Screened to Accepted for Line Cook.', 'Applicant Management', 'Applicant', '55', 0, NULL, '2026-08-31 12:57:10'),
(662, 10, 'info', 'Applicant CARLO MIGUEL FERNAN: Accepted', 'Stage updated from Screened to Accepted for Line Cook.', 'Applicant Management', 'Applicant', '55', 0, NULL, '2026-08-31 12:57:10'),
(663, 11, 'info', 'Applicant CARLO MIGUEL FERNAN: Accepted', 'Stage updated from Screened to Accepted for Line Cook.', 'Applicant Management', 'Applicant', '55', 0, NULL, '2026-08-31 12:57:10'),
(664, 12, 'info', 'Applicant CARLO MIGUEL FERNAN: Accepted', 'Stage updated from Screened to Accepted for Line Cook.', 'Applicant Management', 'Applicant', '55', 0, NULL, '2026-08-31 12:57:10'),
(665, 13, 'info', 'Applicant CARLO MIGUEL FERNAN: Accepted', 'Stage updated from Screened to Accepted for Line Cook.', 'Applicant Management', 'Applicant', '55', 0, NULL, '2026-08-31 12:57:10'),
(666, 14, 'info', 'Applicant CARLO MIGUEL FERNAN: Accepted', 'Stage updated from Screened to Accepted for Line Cook.', 'Applicant Management', 'Applicant', '55', 0, NULL, '2026-08-31 12:57:10'),
(667, 15, 'info', 'Applicant CARLO MIGUEL FERNAN: Accepted', 'Stage updated from Screened to Accepted for Line Cook.', 'Applicant Management', 'Applicant', '55', 0, NULL, '2026-08-31 12:57:10'),
(668, 16, 'info', 'Applicant CARLO MIGUEL FERNAN: Accepted', 'Stage updated from Screened to Accepted for Line Cook.', 'Applicant Management', 'Applicant', '55', 0, NULL, '2026-08-31 12:57:10'),
(669, 18, 'info', 'Applicant CARLO MIGUEL FERNAN: Accepted', 'Stage updated from Screened to Accepted for Line Cook.', 'Applicant Management', 'Applicant', '55', 0, NULL, '2026-08-31 12:57:10'),
(670, 1, 'info', 'Interview scheduled: CARLO MIGUEL FERNAN', 'Booked on 2026-09-01 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '27', 0, NULL, '2026-08-31 12:57:21'),
(671, 2, 'info', 'Interview scheduled: CARLO MIGUEL FERNAN', 'Booked on 2026-09-01 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '27', 0, NULL, '2026-08-31 12:57:21'),
(672, 3, 'info', 'Interview scheduled: CARLO MIGUEL FERNAN', 'Booked on 2026-09-01 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '27', 1, '2026-09-01 18:14:04', '2026-08-31 12:57:21'),
(673, 4, 'info', 'Interview scheduled: CARLO MIGUEL FERNAN', 'Booked on 2026-09-01 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '27', 0, NULL, '2026-08-31 12:57:21'),
(674, 6, 'info', 'Interview scheduled: CARLO MIGUEL FERNAN', 'Booked on 2026-09-01 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '27', 0, NULL, '2026-08-31 12:57:21'),
(675, 7, 'info', 'Interview scheduled: CARLO MIGUEL FERNAN', 'Booked on 2026-09-01 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '27', 0, NULL, '2026-08-31 12:57:21'),
(676, 8, 'info', 'Interview scheduled: CARLO MIGUEL FERNAN', 'Booked on 2026-09-01 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '27', 0, NULL, '2026-08-31 12:57:21'),
(677, 10, 'info', 'Interview scheduled: CARLO MIGUEL FERNAN', 'Booked on 2026-09-01 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '27', 0, NULL, '2026-08-31 12:57:21'),
(678, 11, 'info', 'Interview scheduled: CARLO MIGUEL FERNAN', 'Booked on 2026-09-01 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '27', 0, NULL, '2026-08-31 12:57:21'),
(679, 12, 'info', 'Interview scheduled: CARLO MIGUEL FERNAN', 'Booked on 2026-09-01 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '27', 0, NULL, '2026-08-31 12:57:21'),
(680, 13, 'info', 'Interview scheduled: CARLO MIGUEL FERNAN', 'Booked on 2026-09-01 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '27', 0, NULL, '2026-08-31 12:57:21'),
(681, 14, 'info', 'Interview scheduled: CARLO MIGUEL FERNAN', 'Booked on 2026-09-01 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '27', 0, NULL, '2026-08-31 12:57:21'),
(682, 15, 'info', 'Interview scheduled: CARLO MIGUEL FERNAN', 'Booked on 2026-09-01 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '27', 0, NULL, '2026-08-31 12:57:21'),
(683, 16, 'info', 'Interview scheduled: CARLO MIGUEL FERNAN', 'Booked on 2026-09-01 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '27', 0, NULL, '2026-08-31 12:57:21'),
(684, 18, 'info', 'Interview scheduled: CARLO MIGUEL FERNAN', 'Booked on 2026-09-01 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '27', 0, NULL, '2026-08-31 12:57:21'),
(685, 1, 'info', 'Assessment completed: CARLO MIGUEL FERNAN', 'Scored 80.00% — Outcome: Recommended.', 'Applicant Management', 'Assessment', '12', 0, NULL, '2026-08-31 12:57:38'),
(686, 2, 'info', 'Assessment completed: CARLO MIGUEL FERNAN', 'Scored 80.00% — Outcome: Recommended.', 'Applicant Management', 'Assessment', '12', 0, NULL, '2026-08-31 12:57:38'),
(687, 3, 'info', 'Assessment completed: CARLO MIGUEL FERNAN', 'Scored 80.00% — Outcome: Recommended.', 'Applicant Management', 'Assessment', '12', 1, '2026-09-01 18:14:03', '2026-08-31 12:57:38'),
(688, 4, 'info', 'Assessment completed: CARLO MIGUEL FERNAN', 'Scored 80.00% — Outcome: Recommended.', 'Applicant Management', 'Assessment', '12', 0, NULL, '2026-08-31 12:57:38'),
(689, 6, 'info', 'Assessment completed: CARLO MIGUEL FERNAN', 'Scored 80.00% — Outcome: Recommended.', 'Applicant Management', 'Assessment', '12', 0, NULL, '2026-08-31 12:57:38'),
(690, 7, 'info', 'Assessment completed: CARLO MIGUEL FERNAN', 'Scored 80.00% — Outcome: Recommended.', 'Applicant Management', 'Assessment', '12', 0, NULL, '2026-08-31 12:57:38'),
(691, 8, 'info', 'Assessment completed: CARLO MIGUEL FERNAN', 'Scored 80.00% — Outcome: Recommended.', 'Applicant Management', 'Assessment', '12', 0, NULL, '2026-08-31 12:57:38'),
(692, 10, 'info', 'Assessment completed: CARLO MIGUEL FERNAN', 'Scored 80.00% — Outcome: Recommended.', 'Applicant Management', 'Assessment', '12', 0, NULL, '2026-08-31 12:57:38'),
(693, 11, 'info', 'Assessment completed: CARLO MIGUEL FERNAN', 'Scored 80.00% — Outcome: Recommended.', 'Applicant Management', 'Assessment', '12', 0, NULL, '2026-08-31 12:57:38'),
(694, 12, 'info', 'Assessment completed: CARLO MIGUEL FERNAN', 'Scored 80.00% — Outcome: Recommended.', 'Applicant Management', 'Assessment', '12', 0, NULL, '2026-08-31 12:57:38'),
(695, 13, 'info', 'Assessment completed: CARLO MIGUEL FERNAN', 'Scored 80.00% — Outcome: Recommended.', 'Applicant Management', 'Assessment', '12', 0, NULL, '2026-08-31 12:57:38'),
(696, 14, 'info', 'Assessment completed: CARLO MIGUEL FERNAN', 'Scored 80.00% — Outcome: Recommended.', 'Applicant Management', 'Assessment', '12', 0, NULL, '2026-08-31 12:57:38'),
(697, 15, 'info', 'Assessment completed: CARLO MIGUEL FERNAN', 'Scored 80.00% — Outcome: Recommended.', 'Applicant Management', 'Assessment', '12', 0, NULL, '2026-08-31 12:57:38'),
(698, 16, 'info', 'Assessment completed: CARLO MIGUEL FERNAN', 'Scored 80.00% — Outcome: Recommended.', 'Applicant Management', 'Assessment', '12', 0, NULL, '2026-08-31 12:57:38'),
(699, 18, 'info', 'Assessment completed: CARLO MIGUEL FERNAN', 'Scored 80.00% — Outcome: Recommended.', 'Applicant Management', 'Assessment', '12', 0, NULL, '2026-08-31 12:57:38'),
(700, 1, 'success', 'Applicant CARLO MIGUEL FERNAN &rarr; Offer', 'Applicant advanced to Offer stage.', 'Applicant Management', 'Applicant', '55', 0, NULL, '2026-08-31 12:58:44'),
(701, 2, 'success', 'Applicant CARLO MIGUEL FERNAN &rarr; Offer', 'Applicant advanced to Offer stage.', 'Applicant Management', 'Applicant', '55', 0, NULL, '2026-08-31 12:58:44'),
(702, 3, 'success', 'Applicant CARLO MIGUEL FERNAN &rarr; Offer', 'Applicant advanced to Offer stage.', 'Applicant Management', 'Applicant', '55', 1, '2026-09-01 21:33:52', '2026-08-31 12:58:44'),
(703, 4, 'success', 'Applicant CARLO MIGUEL FERNAN &rarr; Offer', 'Applicant advanced to Offer stage.', 'Applicant Management', 'Applicant', '55', 0, NULL, '2026-08-31 12:58:44'),
(704, 6, 'success', 'Applicant CARLO MIGUEL FERNAN &rarr; Offer', 'Applicant advanced to Offer stage.', 'Applicant Management', 'Applicant', '55', 0, NULL, '2026-08-31 12:58:44'),
(705, 7, 'success', 'Applicant CARLO MIGUEL FERNAN &rarr; Offer', 'Applicant advanced to Offer stage.', 'Applicant Management', 'Applicant', '55', 0, NULL, '2026-08-31 12:58:44'),
(706, 8, 'success', 'Applicant CARLO MIGUEL FERNAN &rarr; Offer', 'Applicant advanced to Offer stage.', 'Applicant Management', 'Applicant', '55', 0, NULL, '2026-08-31 12:58:44'),
(707, 10, 'success', 'Applicant CARLO MIGUEL FERNAN &rarr; Offer', 'Applicant advanced to Offer stage.', 'Applicant Management', 'Applicant', '55', 0, NULL, '2026-08-31 12:58:44'),
(708, 11, 'success', 'Applicant CARLO MIGUEL FERNAN &rarr; Offer', 'Applicant advanced to Offer stage.', 'Applicant Management', 'Applicant', '55', 0, NULL, '2026-08-31 12:58:44'),
(709, 12, 'success', 'Applicant CARLO MIGUEL FERNAN &rarr; Offer', 'Applicant advanced to Offer stage.', 'Applicant Management', 'Applicant', '55', 0, NULL, '2026-08-31 12:58:44'),
(710, 13, 'success', 'Applicant CARLO MIGUEL FERNAN &rarr; Offer', 'Applicant advanced to Offer stage.', 'Applicant Management', 'Applicant', '55', 0, NULL, '2026-08-31 12:58:44'),
(711, 14, 'success', 'Applicant CARLO MIGUEL FERNAN &rarr; Offer', 'Applicant advanced to Offer stage.', 'Applicant Management', 'Applicant', '55', 0, NULL, '2026-08-31 12:58:44'),
(712, 15, 'success', 'Applicant CARLO MIGUEL FERNAN &rarr; Offer', 'Applicant advanced to Offer stage.', 'Applicant Management', 'Applicant', '55', 0, NULL, '2026-08-31 12:58:44'),
(713, 16, 'success', 'Applicant CARLO MIGUEL FERNAN &rarr; Offer', 'Applicant advanced to Offer stage.', 'Applicant Management', 'Applicant', '55', 0, NULL, '2026-08-31 12:58:44'),
(714, 18, 'success', 'Applicant CARLO MIGUEL FERNAN &rarr; Offer', 'Applicant advanced to Offer stage.', 'Applicant Management', 'Applicant', '55', 0, NULL, '2026-08-31 12:58:44'),
(715, 1, 'warning', 'Interview cancelled: bcbc', 'Interview on 2026-08-19 00:00:00 08:00:00 was cancelled.', 'Applicant Management', 'Interview', '19', 0, NULL, '2026-08-31 13:33:31'),
(716, 2, 'warning', 'Interview cancelled: bcbc', 'Interview on 2026-08-19 00:00:00 08:00:00 was cancelled.', 'Applicant Management', 'Interview', '19', 0, NULL, '2026-08-31 13:33:31'),
(717, 3, 'warning', 'Interview cancelled: bcbc', 'Interview on 2026-08-19 00:00:00 08:00:00 was cancelled.', 'Applicant Management', 'Interview', '19', 1, '2026-09-01 18:14:02', '2026-08-31 13:33:31'),
(718, 4, 'warning', 'Interview cancelled: bcbc', 'Interview on 2026-08-19 00:00:00 08:00:00 was cancelled.', 'Applicant Management', 'Interview', '19', 0, NULL, '2026-08-31 13:33:31'),
(719, 6, 'warning', 'Interview cancelled: bcbc', 'Interview on 2026-08-19 00:00:00 08:00:00 was cancelled.', 'Applicant Management', 'Interview', '19', 0, NULL, '2026-08-31 13:33:31'),
(720, 7, 'warning', 'Interview cancelled: bcbc', 'Interview on 2026-08-19 00:00:00 08:00:00 was cancelled.', 'Applicant Management', 'Interview', '19', 0, NULL, '2026-08-31 13:33:31'),
(721, 8, 'warning', 'Interview cancelled: bcbc', 'Interview on 2026-08-19 00:00:00 08:00:00 was cancelled.', 'Applicant Management', 'Interview', '19', 0, NULL, '2026-08-31 13:33:31'),
(722, 10, 'warning', 'Interview cancelled: bcbc', 'Interview on 2026-08-19 00:00:00 08:00:00 was cancelled.', 'Applicant Management', 'Interview', '19', 0, NULL, '2026-08-31 13:33:31'),
(723, 11, 'warning', 'Interview cancelled: bcbc', 'Interview on 2026-08-19 00:00:00 08:00:00 was cancelled.', 'Applicant Management', 'Interview', '19', 0, NULL, '2026-08-31 13:33:31'),
(724, 12, 'warning', 'Interview cancelled: bcbc', 'Interview on 2026-08-19 00:00:00 08:00:00 was cancelled.', 'Applicant Management', 'Interview', '19', 0, NULL, '2026-08-31 13:33:31'),
(725, 13, 'warning', 'Interview cancelled: bcbc', 'Interview on 2026-08-19 00:00:00 08:00:00 was cancelled.', 'Applicant Management', 'Interview', '19', 0, NULL, '2026-08-31 13:33:31'),
(726, 14, 'warning', 'Interview cancelled: bcbc', 'Interview on 2026-08-19 00:00:00 08:00:00 was cancelled.', 'Applicant Management', 'Interview', '19', 0, NULL, '2026-08-31 13:33:31'),
(727, 15, 'warning', 'Interview cancelled: bcbc', 'Interview on 2026-08-19 00:00:00 08:00:00 was cancelled.', 'Applicant Management', 'Interview', '19', 0, NULL, '2026-08-31 13:33:31'),
(728, 16, 'warning', 'Interview cancelled: bcbc', 'Interview on 2026-08-19 00:00:00 08:00:00 was cancelled.', 'Applicant Management', 'Interview', '19', 0, NULL, '2026-08-31 13:33:31'),
(729, 18, 'warning', 'Interview cancelled: bcbc', 'Interview on 2026-08-19 00:00:00 08:00:00 was cancelled.', 'Applicant Management', 'Interview', '19', 0, NULL, '2026-08-31 13:33:31'),
(730, 19, 'warning', 'Interview cancelled: bcbc', 'Interview on 2026-08-19 00:00:00 08:00:00 was cancelled.', 'Applicant Management', 'Interview', '19', 0, NULL, '2026-08-31 13:33:31'),
(731, 1, 'info', 'Assessment completed: juan', 'Scored 80.00% — Outcome: Recommended.', 'Applicant Management', 'Assessment', '13', 0, NULL, '2026-08-31 13:34:35'),
(732, 2, 'info', 'Assessment completed: juan', 'Scored 80.00% — Outcome: Recommended.', 'Applicant Management', 'Assessment', '13', 0, NULL, '2026-08-31 13:34:35'),
(733, 3, 'info', 'Assessment completed: juan', 'Scored 80.00% — Outcome: Recommended.', 'Applicant Management', 'Assessment', '13', 1, '2026-09-01 18:14:02', '2026-08-31 13:34:35'),
(734, 4, 'info', 'Assessment completed: juan', 'Scored 80.00% — Outcome: Recommended.', 'Applicant Management', 'Assessment', '13', 0, NULL, '2026-08-31 13:34:35'),
(735, 6, 'info', 'Assessment completed: juan', 'Scored 80.00% — Outcome: Recommended.', 'Applicant Management', 'Assessment', '13', 0, NULL, '2026-08-31 13:34:35'),
(736, 7, 'info', 'Assessment completed: juan', 'Scored 80.00% — Outcome: Recommended.', 'Applicant Management', 'Assessment', '13', 0, NULL, '2026-08-31 13:34:35'),
(737, 8, 'info', 'Assessment completed: juan', 'Scored 80.00% — Outcome: Recommended.', 'Applicant Management', 'Assessment', '13', 0, NULL, '2026-08-31 13:34:35'),
(738, 10, 'info', 'Assessment completed: juan', 'Scored 80.00% — Outcome: Recommended.', 'Applicant Management', 'Assessment', '13', 0, NULL, '2026-08-31 13:34:35'),
(739, 11, 'info', 'Assessment completed: juan', 'Scored 80.00% — Outcome: Recommended.', 'Applicant Management', 'Assessment', '13', 0, NULL, '2026-08-31 13:34:35'),
(740, 12, 'info', 'Assessment completed: juan', 'Scored 80.00% — Outcome: Recommended.', 'Applicant Management', 'Assessment', '13', 0, NULL, '2026-08-31 13:34:35'),
(741, 13, 'info', 'Assessment completed: juan', 'Scored 80.00% — Outcome: Recommended.', 'Applicant Management', 'Assessment', '13', 0, NULL, '2026-08-31 13:34:35'),
(742, 14, 'info', 'Assessment completed: juan', 'Scored 80.00% — Outcome: Recommended.', 'Applicant Management', 'Assessment', '13', 0, NULL, '2026-08-31 13:34:35'),
(743, 15, 'info', 'Assessment completed: juan', 'Scored 80.00% — Outcome: Recommended.', 'Applicant Management', 'Assessment', '13', 0, NULL, '2026-08-31 13:34:35'),
(744, 16, 'info', 'Assessment completed: juan', 'Scored 80.00% — Outcome: Recommended.', 'Applicant Management', 'Assessment', '13', 0, NULL, '2026-08-31 13:34:35'),
(745, 18, 'info', 'Assessment completed: juan', 'Scored 80.00% — Outcome: Recommended.', 'Applicant Management', 'Assessment', '13', 0, NULL, '2026-08-31 13:34:35'),
(746, 19, 'info', 'Assessment completed: juan', 'Scored 80.00% — Outcome: Recommended.', 'Applicant Management', 'Assessment', '13', 0, NULL, '2026-08-31 13:34:35'),
(747, 1, 'warning', 'Applicant juan: Rejected', 'Stage updated from Assessed to Rejected for Bartender.', 'Applicant Management', 'Applicant', '15', 0, NULL, '2026-08-31 13:35:10'),
(748, 2, 'warning', 'Applicant juan: Rejected', 'Stage updated from Assessed to Rejected for Bartender.', 'Applicant Management', 'Applicant', '15', 0, NULL, '2026-08-31 13:35:10'),
(749, 3, 'warning', 'Applicant juan: Rejected', 'Stage updated from Assessed to Rejected for Bartender.', 'Applicant Management', 'Applicant', '15', 1, '2026-09-01 18:14:01', '2026-08-31 13:35:10'),
(750, 4, 'warning', 'Applicant juan: Rejected', 'Stage updated from Assessed to Rejected for Bartender.', 'Applicant Management', 'Applicant', '15', 0, NULL, '2026-08-31 13:35:10'),
(751, 6, 'warning', 'Applicant juan: Rejected', 'Stage updated from Assessed to Rejected for Bartender.', 'Applicant Management', 'Applicant', '15', 0, NULL, '2026-08-31 13:35:10'),
(752, 7, 'warning', 'Applicant juan: Rejected', 'Stage updated from Assessed to Rejected for Bartender.', 'Applicant Management', 'Applicant', '15', 0, NULL, '2026-08-31 13:35:10'),
(753, 8, 'warning', 'Applicant juan: Rejected', 'Stage updated from Assessed to Rejected for Bartender.', 'Applicant Management', 'Applicant', '15', 0, NULL, '2026-08-31 13:35:10'),
(754, 10, 'warning', 'Applicant juan: Rejected', 'Stage updated from Assessed to Rejected for Bartender.', 'Applicant Management', 'Applicant', '15', 0, NULL, '2026-08-31 13:35:10'),
(755, 11, 'warning', 'Applicant juan: Rejected', 'Stage updated from Assessed to Rejected for Bartender.', 'Applicant Management', 'Applicant', '15', 0, NULL, '2026-08-31 13:35:10'),
(756, 12, 'warning', 'Applicant juan: Rejected', 'Stage updated from Assessed to Rejected for Bartender.', 'Applicant Management', 'Applicant', '15', 0, NULL, '2026-08-31 13:35:10'),
(757, 13, 'warning', 'Applicant juan: Rejected', 'Stage updated from Assessed to Rejected for Bartender.', 'Applicant Management', 'Applicant', '15', 0, NULL, '2026-08-31 13:35:10'),
(758, 14, 'warning', 'Applicant juan: Rejected', 'Stage updated from Assessed to Rejected for Bartender.', 'Applicant Management', 'Applicant', '15', 0, NULL, '2026-08-31 13:35:10'),
(759, 15, 'warning', 'Applicant juan: Rejected', 'Stage updated from Assessed to Rejected for Bartender.', 'Applicant Management', 'Applicant', '15', 0, NULL, '2026-08-31 13:35:10'),
(760, 16, 'warning', 'Applicant juan: Rejected', 'Stage updated from Assessed to Rejected for Bartender.', 'Applicant Management', 'Applicant', '15', 0, NULL, '2026-08-31 13:35:10'),
(761, 18, 'warning', 'Applicant juan: Rejected', 'Stage updated from Assessed to Rejected for Bartender.', 'Applicant Management', 'Applicant', '15', 0, NULL, '2026-08-31 13:35:10'),
(762, 19, 'warning', 'Applicant juan: Rejected', 'Stage updated from Assessed to Rejected for Bartender.', 'Applicant Management', 'Applicant', '15', 0, NULL, '2026-08-31 13:35:10'),
(763, 1, 'warning', 'Applicant MARIA ANGELA SANTOS: Rejected', 'Stage updated from Screened to Rejected for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '34', 0, NULL, '2026-08-31 13:38:28'),
(764, 2, 'warning', 'Applicant MARIA ANGELA SANTOS: Rejected', 'Stage updated from Screened to Rejected for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '34', 0, NULL, '2026-08-31 13:38:28'),
(765, 3, 'warning', 'Applicant MARIA ANGELA SANTOS: Rejected', 'Stage updated from Screened to Rejected for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '34', 1, '2026-09-01 21:33:52', '2026-08-31 13:38:28'),
(766, 4, 'warning', 'Applicant MARIA ANGELA SANTOS: Rejected', 'Stage updated from Screened to Rejected for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '34', 0, NULL, '2026-08-31 13:38:28'),
(767, 6, 'warning', 'Applicant MARIA ANGELA SANTOS: Rejected', 'Stage updated from Screened to Rejected for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '34', 0, NULL, '2026-08-31 13:38:28'),
(768, 7, 'warning', 'Applicant MARIA ANGELA SANTOS: Rejected', 'Stage updated from Screened to Rejected for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '34', 0, NULL, '2026-08-31 13:38:28'),
(769, 8, 'warning', 'Applicant MARIA ANGELA SANTOS: Rejected', 'Stage updated from Screened to Rejected for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '34', 0, NULL, '2026-08-31 13:38:28'),
(770, 10, 'warning', 'Applicant MARIA ANGELA SANTOS: Rejected', 'Stage updated from Screened to Rejected for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '34', 0, NULL, '2026-08-31 13:38:28'),
(771, 11, 'warning', 'Applicant MARIA ANGELA SANTOS: Rejected', 'Stage updated from Screened to Rejected for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '34', 0, NULL, '2026-08-31 13:38:28'),
(772, 12, 'warning', 'Applicant MARIA ANGELA SANTOS: Rejected', 'Stage updated from Screened to Rejected for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '34', 0, NULL, '2026-08-31 13:38:28'),
(773, 13, 'warning', 'Applicant MARIA ANGELA SANTOS: Rejected', 'Stage updated from Screened to Rejected for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '34', 0, NULL, '2026-08-31 13:38:28'),
(774, 14, 'warning', 'Applicant MARIA ANGELA SANTOS: Rejected', 'Stage updated from Screened to Rejected for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '34', 0, NULL, '2026-08-31 13:38:28'),
(775, 15, 'warning', 'Applicant MARIA ANGELA SANTOS: Rejected', 'Stage updated from Screened to Rejected for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '34', 0, NULL, '2026-08-31 13:38:28'),
(776, 16, 'warning', 'Applicant MARIA ANGELA SANTOS: Rejected', 'Stage updated from Screened to Rejected for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '34', 0, NULL, '2026-08-31 13:38:28'),
(777, 18, 'warning', 'Applicant MARIA ANGELA SANTOS: Rejected', 'Stage updated from Screened to Rejected for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '34', 0, NULL, '2026-08-31 13:38:28'),
(778, 19, 'warning', 'Applicant MARIA ANGELA SANTOS: Rejected', 'Stage updated from Screened to Rejected for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '34', 0, NULL, '2026-08-31 13:38:28'),
(779, 1, 'warning', 'Applicant Bianca Louise Garcia: Rejected', 'Stage updated from Screened to Rejected for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '44', 0, NULL, '2026-08-31 13:38:50'),
(780, 2, 'warning', 'Applicant Bianca Louise Garcia: Rejected', 'Stage updated from Screened to Rejected for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '44', 0, NULL, '2026-08-31 13:38:50'),
(781, 3, 'warning', 'Applicant Bianca Louise Garcia: Rejected', 'Stage updated from Screened to Rejected for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '44', 1, '2026-09-01 21:33:51', '2026-08-31 13:38:50'),
(782, 4, 'warning', 'Applicant Bianca Louise Garcia: Rejected', 'Stage updated from Screened to Rejected for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '44', 0, NULL, '2026-08-31 13:38:50'),
(783, 6, 'warning', 'Applicant Bianca Louise Garcia: Rejected', 'Stage updated from Screened to Rejected for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '44', 0, NULL, '2026-08-31 13:38:50'),
(784, 7, 'warning', 'Applicant Bianca Louise Garcia: Rejected', 'Stage updated from Screened to Rejected for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '44', 0, NULL, '2026-08-31 13:38:50'),
(785, 8, 'warning', 'Applicant Bianca Louise Garcia: Rejected', 'Stage updated from Screened to Rejected for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '44', 0, NULL, '2026-08-31 13:38:50'),
(786, 10, 'warning', 'Applicant Bianca Louise Garcia: Rejected', 'Stage updated from Screened to Rejected for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '44', 0, NULL, '2026-08-31 13:38:50'),
(787, 11, 'warning', 'Applicant Bianca Louise Garcia: Rejected', 'Stage updated from Screened to Rejected for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '44', 0, NULL, '2026-08-31 13:38:50'),
(788, 12, 'warning', 'Applicant Bianca Louise Garcia: Rejected', 'Stage updated from Screened to Rejected for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '44', 0, NULL, '2026-08-31 13:38:50'),
(789, 13, 'warning', 'Applicant Bianca Louise Garcia: Rejected', 'Stage updated from Screened to Rejected for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '44', 0, NULL, '2026-08-31 13:38:50'),
(790, 14, 'warning', 'Applicant Bianca Louise Garcia: Rejected', 'Stage updated from Screened to Rejected for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '44', 0, NULL, '2026-08-31 13:38:50'),
(791, 15, 'warning', 'Applicant Bianca Louise Garcia: Rejected', 'Stage updated from Screened to Rejected for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '44', 0, NULL, '2026-08-31 13:38:50'),
(792, 16, 'warning', 'Applicant Bianca Louise Garcia: Rejected', 'Stage updated from Screened to Rejected for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '44', 0, NULL, '2026-08-31 13:38:50');
INSERT INTO `notifications` (`notification_id`, `system_user_id`, `type`, `title`, `body`, `module_name`, `target_type`, `target_id`, `is_read`, `read_at`, `created_at`) VALUES
(793, 18, 'warning', 'Applicant Bianca Louise Garcia: Rejected', 'Stage updated from Screened to Rejected for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '44', 0, NULL, '2026-08-31 13:38:50'),
(794, 19, 'warning', 'Applicant Bianca Louise Garcia: Rejected', 'Stage updated from Screened to Rejected for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '44', 0, NULL, '2026-08-31 13:38:50'),
(795, 1, 'info', 'Applicant Test Applicant: Accepted', 'Stage updated from Screened to Accepted for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '47', 0, NULL, '2026-08-31 15:41:38'),
(796, 2, 'info', 'Applicant Test Applicant: Accepted', 'Stage updated from Screened to Accepted for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '47', 0, NULL, '2026-08-31 15:41:38'),
(797, 3, 'info', 'Applicant Test Applicant: Accepted', 'Stage updated from Screened to Accepted for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '47', 1, '2026-09-01 21:33:50', '2026-08-31 15:41:38'),
(798, 4, 'info', 'Applicant Test Applicant: Accepted', 'Stage updated from Screened to Accepted for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '47', 0, NULL, '2026-08-31 15:41:38'),
(799, 6, 'info', 'Applicant Test Applicant: Accepted', 'Stage updated from Screened to Accepted for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '47', 0, NULL, '2026-08-31 15:41:38'),
(800, 7, 'info', 'Applicant Test Applicant: Accepted', 'Stage updated from Screened to Accepted for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '47', 0, NULL, '2026-08-31 15:41:38'),
(801, 8, 'info', 'Applicant Test Applicant: Accepted', 'Stage updated from Screened to Accepted for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '47', 0, NULL, '2026-08-31 15:41:38'),
(802, 10, 'info', 'Applicant Test Applicant: Accepted', 'Stage updated from Screened to Accepted for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '47', 0, NULL, '2026-08-31 15:41:38'),
(803, 11, 'info', 'Applicant Test Applicant: Accepted', 'Stage updated from Screened to Accepted for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '47', 0, NULL, '2026-08-31 15:41:38'),
(804, 12, 'info', 'Applicant Test Applicant: Accepted', 'Stage updated from Screened to Accepted for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '47', 0, NULL, '2026-08-31 15:41:38'),
(805, 13, 'info', 'Applicant Test Applicant: Accepted', 'Stage updated from Screened to Accepted for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '47', 0, NULL, '2026-08-31 15:41:38'),
(806, 14, 'info', 'Applicant Test Applicant: Accepted', 'Stage updated from Screened to Accepted for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '47', 0, NULL, '2026-08-31 15:41:38'),
(807, 15, 'info', 'Applicant Test Applicant: Accepted', 'Stage updated from Screened to Accepted for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '47', 0, NULL, '2026-08-31 15:41:38'),
(808, 16, 'info', 'Applicant Test Applicant: Accepted', 'Stage updated from Screened to Accepted for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '47', 0, NULL, '2026-08-31 15:41:38'),
(809, 18, 'info', 'Applicant Test Applicant: Accepted', 'Stage updated from Screened to Accepted for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '47', 0, NULL, '2026-08-31 15:41:38'),
(810, 19, 'info', 'Applicant Test Applicant: Accepted', 'Stage updated from Screened to Accepted for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '47', 0, NULL, '2026-08-31 15:41:38'),
(811, 1, 'warning', 'Interview cancelled: ADMIN-file1', 'Interview on 2026-09-01 00:00:00 08:00:00 was cancelled.', 'Applicant Management', 'Interview', '15', 0, NULL, '2026-08-31 16:09:06'),
(812, 2, 'warning', 'Interview cancelled: ADMIN-file1', 'Interview on 2026-09-01 00:00:00 08:00:00 was cancelled.', 'Applicant Management', 'Interview', '15', 0, NULL, '2026-08-31 16:09:06'),
(813, 3, 'warning', 'Interview cancelled: ADMIN-file1', 'Interview on 2026-09-01 00:00:00 08:00:00 was cancelled.', 'Applicant Management', 'Interview', '15', 1, '2026-09-01 22:02:59', '2026-08-31 16:09:06'),
(814, 4, 'warning', 'Interview cancelled: ADMIN-file1', 'Interview on 2026-09-01 00:00:00 08:00:00 was cancelled.', 'Applicant Management', 'Interview', '15', 0, NULL, '2026-08-31 16:09:06'),
(815, 6, 'warning', 'Interview cancelled: ADMIN-file1', 'Interview on 2026-09-01 00:00:00 08:00:00 was cancelled.', 'Applicant Management', 'Interview', '15', 0, NULL, '2026-08-31 16:09:06'),
(816, 7, 'warning', 'Interview cancelled: ADMIN-file1', 'Interview on 2026-09-01 00:00:00 08:00:00 was cancelled.', 'Applicant Management', 'Interview', '15', 0, NULL, '2026-08-31 16:09:06'),
(817, 8, 'warning', 'Interview cancelled: ADMIN-file1', 'Interview on 2026-09-01 00:00:00 08:00:00 was cancelled.', 'Applicant Management', 'Interview', '15', 0, NULL, '2026-08-31 16:09:06'),
(818, 10, 'warning', 'Interview cancelled: ADMIN-file1', 'Interview on 2026-09-01 00:00:00 08:00:00 was cancelled.', 'Applicant Management', 'Interview', '15', 0, NULL, '2026-08-31 16:09:06'),
(819, 11, 'warning', 'Interview cancelled: ADMIN-file1', 'Interview on 2026-09-01 00:00:00 08:00:00 was cancelled.', 'Applicant Management', 'Interview', '15', 0, NULL, '2026-08-31 16:09:06'),
(820, 12, 'warning', 'Interview cancelled: ADMIN-file1', 'Interview on 2026-09-01 00:00:00 08:00:00 was cancelled.', 'Applicant Management', 'Interview', '15', 0, NULL, '2026-08-31 16:09:06'),
(821, 13, 'warning', 'Interview cancelled: ADMIN-file1', 'Interview on 2026-09-01 00:00:00 08:00:00 was cancelled.', 'Applicant Management', 'Interview', '15', 0, NULL, '2026-08-31 16:09:06'),
(822, 14, 'warning', 'Interview cancelled: ADMIN-file1', 'Interview on 2026-09-01 00:00:00 08:00:00 was cancelled.', 'Applicant Management', 'Interview', '15', 0, NULL, '2026-08-31 16:09:06'),
(823, 15, 'warning', 'Interview cancelled: ADMIN-file1', 'Interview on 2026-09-01 00:00:00 08:00:00 was cancelled.', 'Applicant Management', 'Interview', '15', 0, NULL, '2026-08-31 16:09:06'),
(824, 16, 'warning', 'Interview cancelled: ADMIN-file1', 'Interview on 2026-09-01 00:00:00 08:00:00 was cancelled.', 'Applicant Management', 'Interview', '15', 0, NULL, '2026-08-31 16:09:06'),
(825, 18, 'warning', 'Interview cancelled: ADMIN-file1', 'Interview on 2026-09-01 00:00:00 08:00:00 was cancelled.', 'Applicant Management', 'Interview', '15', 0, NULL, '2026-08-31 16:09:06'),
(826, 19, 'warning', 'Interview cancelled: ADMIN-file1', 'Interview on 2026-09-01 00:00:00 08:00:00 was cancelled.', 'Applicant Management', 'Interview', '15', 0, NULL, '2026-08-31 16:09:06'),
(827, 1, 'info', 'New applicant: CARLO MIGUEL FERNANDEZ', 'Submitted application with screening score 72.00%.', 'Applicant Management', 'Applicant', '56', 0, NULL, '2026-08-31 16:26:36'),
(828, 2, 'info', 'New applicant: CARLO MIGUEL FERNANDEZ', 'Submitted application with screening score 72.00%.', 'Applicant Management', 'Applicant', '56', 0, NULL, '2026-08-31 16:26:36'),
(829, 3, 'info', 'New applicant: CARLO MIGUEL FERNANDEZ', 'Submitted application with screening score 72.00%.', 'Applicant Management', 'Applicant', '56', 1, '2026-09-01 22:02:59', '2026-08-31 16:26:36'),
(830, 4, 'info', 'New applicant: CARLO MIGUEL FERNANDEZ', 'Submitted application with screening score 72.00%.', 'Applicant Management', 'Applicant', '56', 0, NULL, '2026-08-31 16:26:36'),
(831, 6, 'info', 'New applicant: CARLO MIGUEL FERNANDEZ', 'Submitted application with screening score 72.00%.', 'Applicant Management', 'Applicant', '56', 0, NULL, '2026-08-31 16:26:36'),
(832, 7, 'info', 'New applicant: CARLO MIGUEL FERNANDEZ', 'Submitted application with screening score 72.00%.', 'Applicant Management', 'Applicant', '56', 0, NULL, '2026-08-31 16:26:36'),
(833, 8, 'info', 'New applicant: CARLO MIGUEL FERNANDEZ', 'Submitted application with screening score 72.00%.', 'Applicant Management', 'Applicant', '56', 0, NULL, '2026-08-31 16:26:36'),
(834, 10, 'info', 'New applicant: CARLO MIGUEL FERNANDEZ', 'Submitted application with screening score 72.00%.', 'Applicant Management', 'Applicant', '56', 0, NULL, '2026-08-31 16:26:36'),
(835, 11, 'info', 'New applicant: CARLO MIGUEL FERNANDEZ', 'Submitted application with screening score 72.00%.', 'Applicant Management', 'Applicant', '56', 0, NULL, '2026-08-31 16:26:36'),
(836, 12, 'info', 'New applicant: CARLO MIGUEL FERNANDEZ', 'Submitted application with screening score 72.00%.', 'Applicant Management', 'Applicant', '56', 0, NULL, '2026-08-31 16:26:36'),
(837, 13, 'info', 'New applicant: CARLO MIGUEL FERNANDEZ', 'Submitted application with screening score 72.00%.', 'Applicant Management', 'Applicant', '56', 0, NULL, '2026-08-31 16:26:36'),
(838, 14, 'info', 'New applicant: CARLO MIGUEL FERNANDEZ', 'Submitted application with screening score 72.00%.', 'Applicant Management', 'Applicant', '56', 0, NULL, '2026-08-31 16:26:36'),
(839, 15, 'info', 'New applicant: CARLO MIGUEL FERNANDEZ', 'Submitted application with screening score 72.00%.', 'Applicant Management', 'Applicant', '56', 0, NULL, '2026-08-31 16:26:36'),
(840, 16, 'info', 'New applicant: CARLO MIGUEL FERNANDEZ', 'Submitted application with screening score 72.00%.', 'Applicant Management', 'Applicant', '56', 0, NULL, '2026-08-31 16:26:36'),
(841, 18, 'info', 'New applicant: CARLO MIGUEL FERNANDEZ', 'Submitted application with screening score 72.00%.', 'Applicant Management', 'Applicant', '56', 0, NULL, '2026-08-31 16:26:36'),
(842, 19, 'info', 'New applicant: CARLO MIGUEL FERNANDEZ', 'Submitted application with screening score 72.00%.', 'Applicant Management', 'Applicant', '56', 0, NULL, '2026-08-31 16:26:36'),
(843, 1, 'warning', 'Applicant CARLO MIGUEL FERNANDEZ: Rejected', 'Stage updated from Screened to Rejected for Guest Relations Officer.', 'Applicant Management', 'Applicant', '56', 0, NULL, '2026-08-31 16:27:14'),
(844, 2, 'warning', 'Applicant CARLO MIGUEL FERNANDEZ: Rejected', 'Stage updated from Screened to Rejected for Guest Relations Officer.', 'Applicant Management', 'Applicant', '56', 0, NULL, '2026-08-31 16:27:14'),
(845, 3, 'warning', 'Applicant CARLO MIGUEL FERNANDEZ: Rejected', 'Stage updated from Screened to Rejected for Guest Relations Officer.', 'Applicant Management', 'Applicant', '56', 1, '2026-09-01 22:02:58', '2026-08-31 16:27:14'),
(846, 4, 'warning', 'Applicant CARLO MIGUEL FERNANDEZ: Rejected', 'Stage updated from Screened to Rejected for Guest Relations Officer.', 'Applicant Management', 'Applicant', '56', 0, NULL, '2026-08-31 16:27:14'),
(847, 6, 'warning', 'Applicant CARLO MIGUEL FERNANDEZ: Rejected', 'Stage updated from Screened to Rejected for Guest Relations Officer.', 'Applicant Management', 'Applicant', '56', 0, NULL, '2026-08-31 16:27:14'),
(848, 7, 'warning', 'Applicant CARLO MIGUEL FERNANDEZ: Rejected', 'Stage updated from Screened to Rejected for Guest Relations Officer.', 'Applicant Management', 'Applicant', '56', 0, NULL, '2026-08-31 16:27:14'),
(849, 8, 'warning', 'Applicant CARLO MIGUEL FERNANDEZ: Rejected', 'Stage updated from Screened to Rejected for Guest Relations Officer.', 'Applicant Management', 'Applicant', '56', 0, NULL, '2026-08-31 16:27:14'),
(850, 10, 'warning', 'Applicant CARLO MIGUEL FERNANDEZ: Rejected', 'Stage updated from Screened to Rejected for Guest Relations Officer.', 'Applicant Management', 'Applicant', '56', 0, NULL, '2026-08-31 16:27:14'),
(851, 11, 'warning', 'Applicant CARLO MIGUEL FERNANDEZ: Rejected', 'Stage updated from Screened to Rejected for Guest Relations Officer.', 'Applicant Management', 'Applicant', '56', 0, NULL, '2026-08-31 16:27:14'),
(852, 12, 'warning', 'Applicant CARLO MIGUEL FERNANDEZ: Rejected', 'Stage updated from Screened to Rejected for Guest Relations Officer.', 'Applicant Management', 'Applicant', '56', 0, NULL, '2026-08-31 16:27:14'),
(853, 13, 'warning', 'Applicant CARLO MIGUEL FERNANDEZ: Rejected', 'Stage updated from Screened to Rejected for Guest Relations Officer.', 'Applicant Management', 'Applicant', '56', 0, NULL, '2026-08-31 16:27:14'),
(854, 14, 'warning', 'Applicant CARLO MIGUEL FERNANDEZ: Rejected', 'Stage updated from Screened to Rejected for Guest Relations Officer.', 'Applicant Management', 'Applicant', '56', 0, NULL, '2026-08-31 16:27:14'),
(855, 15, 'warning', 'Applicant CARLO MIGUEL FERNANDEZ: Rejected', 'Stage updated from Screened to Rejected for Guest Relations Officer.', 'Applicant Management', 'Applicant', '56', 0, NULL, '2026-08-31 16:27:14'),
(856, 16, 'warning', 'Applicant CARLO MIGUEL FERNANDEZ: Rejected', 'Stage updated from Screened to Rejected for Guest Relations Officer.', 'Applicant Management', 'Applicant', '56', 0, NULL, '2026-08-31 16:27:14'),
(857, 18, 'warning', 'Applicant CARLO MIGUEL FERNANDEZ: Rejected', 'Stage updated from Screened to Rejected for Guest Relations Officer.', 'Applicant Management', 'Applicant', '56', 0, NULL, '2026-08-31 16:27:14'),
(858, 19, 'warning', 'Applicant CARLO MIGUEL FERNANDEZ: Rejected', 'Stage updated from Screened to Rejected for Guest Relations Officer.', 'Applicant Management', 'Applicant', '56', 0, NULL, '2026-08-31 16:27:14'),
(859, 1, 'info', 'New applicant: NATHANIEL JAMES MERCADO', 'Submitted application with screening score 72.00%.', 'Applicant Management', 'Applicant', '57', 0, NULL, '2026-09-01 21:54:41'),
(860, 2, 'info', 'New applicant: NATHANIEL JAMES MERCADO', 'Submitted application with screening score 72.00%.', 'Applicant Management', 'Applicant', '57', 0, NULL, '2026-09-01 21:54:41'),
(861, 3, 'info', 'New applicant: NATHANIEL JAMES MERCADO', 'Submitted application with screening score 72.00%.', 'Applicant Management', 'Applicant', '57', 1, '2026-09-01 22:02:58', '2026-09-01 21:54:41'),
(862, 4, 'info', 'New applicant: NATHANIEL JAMES MERCADO', 'Submitted application with screening score 72.00%.', 'Applicant Management', 'Applicant', '57', 0, NULL, '2026-09-01 21:54:41'),
(863, 6, 'info', 'New applicant: NATHANIEL JAMES MERCADO', 'Submitted application with screening score 72.00%.', 'Applicant Management', 'Applicant', '57', 0, NULL, '2026-09-01 21:54:41'),
(864, 7, 'info', 'New applicant: NATHANIEL JAMES MERCADO', 'Submitted application with screening score 72.00%.', 'Applicant Management', 'Applicant', '57', 0, NULL, '2026-09-01 21:54:41'),
(865, 8, 'info', 'New applicant: NATHANIEL JAMES MERCADO', 'Submitted application with screening score 72.00%.', 'Applicant Management', 'Applicant', '57', 0, NULL, '2026-09-01 21:54:41'),
(866, 10, 'info', 'New applicant: NATHANIEL JAMES MERCADO', 'Submitted application with screening score 72.00%.', 'Applicant Management', 'Applicant', '57', 0, NULL, '2026-09-01 21:54:41'),
(867, 11, 'info', 'New applicant: NATHANIEL JAMES MERCADO', 'Submitted application with screening score 72.00%.', 'Applicant Management', 'Applicant', '57', 0, NULL, '2026-09-01 21:54:41'),
(868, 12, 'info', 'New applicant: NATHANIEL JAMES MERCADO', 'Submitted application with screening score 72.00%.', 'Applicant Management', 'Applicant', '57', 0, NULL, '2026-09-01 21:54:41'),
(869, 13, 'info', 'New applicant: NATHANIEL JAMES MERCADO', 'Submitted application with screening score 72.00%.', 'Applicant Management', 'Applicant', '57', 0, NULL, '2026-09-01 21:54:41'),
(870, 14, 'info', 'New applicant: NATHANIEL JAMES MERCADO', 'Submitted application with screening score 72.00%.', 'Applicant Management', 'Applicant', '57', 0, NULL, '2026-09-01 21:54:41'),
(871, 15, 'info', 'New applicant: NATHANIEL JAMES MERCADO', 'Submitted application with screening score 72.00%.', 'Applicant Management', 'Applicant', '57', 0, NULL, '2026-09-01 21:54:41'),
(872, 16, 'info', 'New applicant: NATHANIEL JAMES MERCADO', 'Submitted application with screening score 72.00%.', 'Applicant Management', 'Applicant', '57', 0, NULL, '2026-09-01 21:54:41'),
(873, 18, 'info', 'New applicant: NATHANIEL JAMES MERCADO', 'Submitted application with screening score 72.00%.', 'Applicant Management', 'Applicant', '57', 0, NULL, '2026-09-01 21:54:41'),
(874, 19, 'info', 'New applicant: NATHANIEL JAMES MERCADO', 'Submitted application with screening score 72.00%.', 'Applicant Management', 'Applicant', '57', 0, NULL, '2026-09-01 21:54:41'),
(875, 1, 'info', 'New applicant: Bianca Nicole Castillo', 'Submitted application with screening score 86.00%.', 'Applicant Management', 'Applicant', '58', 0, NULL, '2026-09-01 22:19:43'),
(876, 2, 'info', 'New applicant: Bianca Nicole Castillo', 'Submitted application with screening score 86.00%.', 'Applicant Management', 'Applicant', '58', 0, NULL, '2026-09-01 22:19:43'),
(877, 3, 'info', 'New applicant: Bianca Nicole Castillo', 'Submitted application with screening score 86.00%.', 'Applicant Management', 'Applicant', '58', 1, '2026-09-02 00:09:41', '2026-09-01 22:19:43'),
(878, 4, 'info', 'New applicant: Bianca Nicole Castillo', 'Submitted application with screening score 86.00%.', 'Applicant Management', 'Applicant', '58', 0, NULL, '2026-09-01 22:19:43'),
(879, 6, 'info', 'New applicant: Bianca Nicole Castillo', 'Submitted application with screening score 86.00%.', 'Applicant Management', 'Applicant', '58', 0, NULL, '2026-09-01 22:19:43'),
(880, 7, 'info', 'New applicant: Bianca Nicole Castillo', 'Submitted application with screening score 86.00%.', 'Applicant Management', 'Applicant', '58', 0, NULL, '2026-09-01 22:19:43'),
(881, 8, 'info', 'New applicant: Bianca Nicole Castillo', 'Submitted application with screening score 86.00%.', 'Applicant Management', 'Applicant', '58', 0, NULL, '2026-09-01 22:19:43'),
(882, 10, 'info', 'New applicant: Bianca Nicole Castillo', 'Submitted application with screening score 86.00%.', 'Applicant Management', 'Applicant', '58', 0, NULL, '2026-09-01 22:19:43'),
(883, 11, 'info', 'New applicant: Bianca Nicole Castillo', 'Submitted application with screening score 86.00%.', 'Applicant Management', 'Applicant', '58', 0, NULL, '2026-09-01 22:19:43'),
(884, 12, 'info', 'New applicant: Bianca Nicole Castillo', 'Submitted application with screening score 86.00%.', 'Applicant Management', 'Applicant', '58', 0, NULL, '2026-09-01 22:19:43'),
(885, 13, 'info', 'New applicant: Bianca Nicole Castillo', 'Submitted application with screening score 86.00%.', 'Applicant Management', 'Applicant', '58', 0, NULL, '2026-09-01 22:19:43'),
(886, 14, 'info', 'New applicant: Bianca Nicole Castillo', 'Submitted application with screening score 86.00%.', 'Applicant Management', 'Applicant', '58', 0, NULL, '2026-09-01 22:19:43'),
(887, 15, 'info', 'New applicant: Bianca Nicole Castillo', 'Submitted application with screening score 86.00%.', 'Applicant Management', 'Applicant', '58', 0, NULL, '2026-09-01 22:19:43'),
(888, 16, 'info', 'New applicant: Bianca Nicole Castillo', 'Submitted application with screening score 86.00%.', 'Applicant Management', 'Applicant', '58', 0, NULL, '2026-09-01 22:19:43'),
(889, 18, 'info', 'New applicant: Bianca Nicole Castillo', 'Submitted application with screening score 86.00%.', 'Applicant Management', 'Applicant', '58', 0, NULL, '2026-09-01 22:19:43'),
(890, 19, 'info', 'New applicant: Bianca Nicole Castillo', 'Submitted application with screening score 86.00%.', 'Applicant Management', 'Applicant', '58', 0, NULL, '2026-09-01 22:19:43'),
(891, 1, 'info', 'Applicant Bianca Nicole Castillo: Accepted', 'Stage updated from Screened to Accepted for Guest Relations Officer.', 'Applicant Management', 'Applicant', '58', 0, NULL, '2026-09-01 22:21:10'),
(892, 2, 'info', 'Applicant Bianca Nicole Castillo: Accepted', 'Stage updated from Screened to Accepted for Guest Relations Officer.', 'Applicant Management', 'Applicant', '58', 0, NULL, '2026-09-01 22:21:10'),
(893, 3, 'info', 'Applicant Bianca Nicole Castillo: Accepted', 'Stage updated from Screened to Accepted for Guest Relations Officer.', 'Applicant Management', 'Applicant', '58', 1, '2026-09-02 00:09:40', '2026-09-01 22:21:10'),
(894, 4, 'info', 'Applicant Bianca Nicole Castillo: Accepted', 'Stage updated from Screened to Accepted for Guest Relations Officer.', 'Applicant Management', 'Applicant', '58', 0, NULL, '2026-09-01 22:21:10'),
(895, 6, 'info', 'Applicant Bianca Nicole Castillo: Accepted', 'Stage updated from Screened to Accepted for Guest Relations Officer.', 'Applicant Management', 'Applicant', '58', 0, NULL, '2026-09-01 22:21:10'),
(896, 7, 'info', 'Applicant Bianca Nicole Castillo: Accepted', 'Stage updated from Screened to Accepted for Guest Relations Officer.', 'Applicant Management', 'Applicant', '58', 0, NULL, '2026-09-01 22:21:10'),
(897, 8, 'info', 'Applicant Bianca Nicole Castillo: Accepted', 'Stage updated from Screened to Accepted for Guest Relations Officer.', 'Applicant Management', 'Applicant', '58', 0, NULL, '2026-09-01 22:21:10'),
(898, 10, 'info', 'Applicant Bianca Nicole Castillo: Accepted', 'Stage updated from Screened to Accepted for Guest Relations Officer.', 'Applicant Management', 'Applicant', '58', 0, NULL, '2026-09-01 22:21:10'),
(899, 11, 'info', 'Applicant Bianca Nicole Castillo: Accepted', 'Stage updated from Screened to Accepted for Guest Relations Officer.', 'Applicant Management', 'Applicant', '58', 0, NULL, '2026-09-01 22:21:10'),
(900, 12, 'info', 'Applicant Bianca Nicole Castillo: Accepted', 'Stage updated from Screened to Accepted for Guest Relations Officer.', 'Applicant Management', 'Applicant', '58', 0, NULL, '2026-09-01 22:21:10'),
(901, 13, 'info', 'Applicant Bianca Nicole Castillo: Accepted', 'Stage updated from Screened to Accepted for Guest Relations Officer.', 'Applicant Management', 'Applicant', '58', 0, NULL, '2026-09-01 22:21:10'),
(902, 14, 'info', 'Applicant Bianca Nicole Castillo: Accepted', 'Stage updated from Screened to Accepted for Guest Relations Officer.', 'Applicant Management', 'Applicant', '58', 0, NULL, '2026-09-01 22:21:10'),
(903, 15, 'info', 'Applicant Bianca Nicole Castillo: Accepted', 'Stage updated from Screened to Accepted for Guest Relations Officer.', 'Applicant Management', 'Applicant', '58', 0, NULL, '2026-09-01 22:21:10'),
(904, 16, 'info', 'Applicant Bianca Nicole Castillo: Accepted', 'Stage updated from Screened to Accepted for Guest Relations Officer.', 'Applicant Management', 'Applicant', '58', 0, NULL, '2026-09-01 22:21:10'),
(905, 18, 'info', 'Applicant Bianca Nicole Castillo: Accepted', 'Stage updated from Screened to Accepted for Guest Relations Officer.', 'Applicant Management', 'Applicant', '58', 0, NULL, '2026-09-01 22:21:10'),
(906, 19, 'info', 'Applicant Bianca Nicole Castillo: Accepted', 'Stage updated from Screened to Accepted for Guest Relations Officer.', 'Applicant Management', 'Applicant', '58', 0, NULL, '2026-09-01 22:21:10'),
(907, 1, 'info', 'Interview scheduled: Bianca Nicole Castillo', 'Booked on 2026-09-24 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '28', 0, NULL, '2026-09-01 22:21:20'),
(908, 2, 'info', 'Interview scheduled: Bianca Nicole Castillo', 'Booked on 2026-09-24 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '28', 0, NULL, '2026-09-01 22:21:20'),
(909, 3, 'info', 'Interview scheduled: Bianca Nicole Castillo', 'Booked on 2026-09-24 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '28', 1, '2026-09-02 00:09:40', '2026-09-01 22:21:20'),
(910, 4, 'info', 'Interview scheduled: Bianca Nicole Castillo', 'Booked on 2026-09-24 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '28', 0, NULL, '2026-09-01 22:21:20'),
(911, 6, 'info', 'Interview scheduled: Bianca Nicole Castillo', 'Booked on 2026-09-24 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '28', 0, NULL, '2026-09-01 22:21:20'),
(912, 7, 'info', 'Interview scheduled: Bianca Nicole Castillo', 'Booked on 2026-09-24 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '28', 0, NULL, '2026-09-01 22:21:20'),
(913, 8, 'info', 'Interview scheduled: Bianca Nicole Castillo', 'Booked on 2026-09-24 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '28', 0, NULL, '2026-09-01 22:21:20'),
(914, 10, 'info', 'Interview scheduled: Bianca Nicole Castillo', 'Booked on 2026-09-24 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '28', 0, NULL, '2026-09-01 22:21:20'),
(915, 11, 'info', 'Interview scheduled: Bianca Nicole Castillo', 'Booked on 2026-09-24 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '28', 0, NULL, '2026-09-01 22:21:20'),
(916, 12, 'info', 'Interview scheduled: Bianca Nicole Castillo', 'Booked on 2026-09-24 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '28', 0, NULL, '2026-09-01 22:21:20'),
(917, 13, 'info', 'Interview scheduled: Bianca Nicole Castillo', 'Booked on 2026-09-24 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '28', 0, NULL, '2026-09-01 22:21:20'),
(918, 14, 'info', 'Interview scheduled: Bianca Nicole Castillo', 'Booked on 2026-09-24 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '28', 0, NULL, '2026-09-01 22:21:20'),
(919, 15, 'info', 'Interview scheduled: Bianca Nicole Castillo', 'Booked on 2026-09-24 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '28', 0, NULL, '2026-09-01 22:21:20'),
(920, 16, 'info', 'Interview scheduled: Bianca Nicole Castillo', 'Booked on 2026-09-24 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '28', 0, NULL, '2026-09-01 22:21:20'),
(921, 18, 'info', 'Interview scheduled: Bianca Nicole Castillo', 'Booked on 2026-09-24 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '28', 0, NULL, '2026-09-01 22:21:20'),
(922, 19, 'info', 'Interview scheduled: Bianca Nicole Castillo', 'Booked on 2026-09-24 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '28', 0, NULL, '2026-09-01 22:21:20'),
(923, 1, 'info', 'Assessment completed: Bianca Soriano', 'Scored 80.00% — Outcome: Recommended.', 'Applicant Management', 'Assessment', '14', 0, NULL, '2026-09-02 00:04:02'),
(924, 2, 'info', 'Assessment completed: Bianca Soriano', 'Scored 80.00% — Outcome: Recommended.', 'Applicant Management', 'Assessment', '14', 0, NULL, '2026-09-02 00:04:02'),
(925, 3, 'info', 'Assessment completed: Bianca Soriano', 'Scored 80.00% — Outcome: Recommended.', 'Applicant Management', 'Assessment', '14', 1, '2026-09-02 00:09:39', '2026-09-02 00:04:02'),
(926, 4, 'info', 'Assessment completed: Bianca Soriano', 'Scored 80.00% — Outcome: Recommended.', 'Applicant Management', 'Assessment', '14', 0, NULL, '2026-09-02 00:04:02'),
(927, 6, 'info', 'Assessment completed: Bianca Soriano', 'Scored 80.00% — Outcome: Recommended.', 'Applicant Management', 'Assessment', '14', 0, NULL, '2026-09-02 00:04:02'),
(928, 7, 'info', 'Assessment completed: Bianca Soriano', 'Scored 80.00% — Outcome: Recommended.', 'Applicant Management', 'Assessment', '14', 0, NULL, '2026-09-02 00:04:02'),
(929, 8, 'info', 'Assessment completed: Bianca Soriano', 'Scored 80.00% — Outcome: Recommended.', 'Applicant Management', 'Assessment', '14', 0, NULL, '2026-09-02 00:04:02'),
(930, 10, 'info', 'Assessment completed: Bianca Soriano', 'Scored 80.00% — Outcome: Recommended.', 'Applicant Management', 'Assessment', '14', 0, NULL, '2026-09-02 00:04:02'),
(931, 11, 'info', 'Assessment completed: Bianca Soriano', 'Scored 80.00% — Outcome: Recommended.', 'Applicant Management', 'Assessment', '14', 0, NULL, '2026-09-02 00:04:02'),
(932, 12, 'info', 'Assessment completed: Bianca Soriano', 'Scored 80.00% — Outcome: Recommended.', 'Applicant Management', 'Assessment', '14', 0, NULL, '2026-09-02 00:04:02'),
(933, 13, 'info', 'Assessment completed: Bianca Soriano', 'Scored 80.00% — Outcome: Recommended.', 'Applicant Management', 'Assessment', '14', 0, NULL, '2026-09-02 00:04:02'),
(934, 14, 'info', 'Assessment completed: Bianca Soriano', 'Scored 80.00% — Outcome: Recommended.', 'Applicant Management', 'Assessment', '14', 0, NULL, '2026-09-02 00:04:02'),
(935, 15, 'info', 'Assessment completed: Bianca Soriano', 'Scored 80.00% — Outcome: Recommended.', 'Applicant Management', 'Assessment', '14', 0, NULL, '2026-09-02 00:04:03'),
(936, 16, 'info', 'Assessment completed: Bianca Soriano', 'Scored 80.00% — Outcome: Recommended.', 'Applicant Management', 'Assessment', '14', 0, NULL, '2026-09-02 00:04:03'),
(937, 18, 'info', 'Assessment completed: Bianca Soriano', 'Scored 80.00% — Outcome: Recommended.', 'Applicant Management', 'Assessment', '14', 0, NULL, '2026-09-02 00:04:03'),
(938, 19, 'info', 'Assessment completed: Bianca Soriano', 'Scored 80.00% — Outcome: Recommended.', 'Applicant Management', 'Assessment', '14', 0, NULL, '2026-09-02 00:04:03'),
(939, 1, 'success', 'Applicant Bianca Soriano &rarr; Offer', 'Applicant advanced to Offer stage.', 'Applicant Management', 'Applicant', '10', 0, NULL, '2026-09-02 00:04:13'),
(940, 2, 'success', 'Applicant Bianca Soriano &rarr; Offer', 'Applicant advanced to Offer stage.', 'Applicant Management', 'Applicant', '10', 0, NULL, '2026-09-02 00:04:13'),
(941, 3, 'success', 'Applicant Bianca Soriano &rarr; Offer', 'Applicant advanced to Offer stage.', 'Applicant Management', 'Applicant', '10', 1, '2026-09-02 00:09:38', '2026-09-02 00:04:13'),
(942, 4, 'success', 'Applicant Bianca Soriano &rarr; Offer', 'Applicant advanced to Offer stage.', 'Applicant Management', 'Applicant', '10', 0, NULL, '2026-09-02 00:04:13'),
(943, 6, 'success', 'Applicant Bianca Soriano &rarr; Offer', 'Applicant advanced to Offer stage.', 'Applicant Management', 'Applicant', '10', 0, NULL, '2026-09-02 00:04:13'),
(944, 7, 'success', 'Applicant Bianca Soriano &rarr; Offer', 'Applicant advanced to Offer stage.', 'Applicant Management', 'Applicant', '10', 0, NULL, '2026-09-02 00:04:13'),
(945, 8, 'success', 'Applicant Bianca Soriano &rarr; Offer', 'Applicant advanced to Offer stage.', 'Applicant Management', 'Applicant', '10', 0, NULL, '2026-09-02 00:04:13'),
(946, 10, 'success', 'Applicant Bianca Soriano &rarr; Offer', 'Applicant advanced to Offer stage.', 'Applicant Management', 'Applicant', '10', 0, NULL, '2026-09-02 00:04:13'),
(947, 11, 'success', 'Applicant Bianca Soriano &rarr; Offer', 'Applicant advanced to Offer stage.', 'Applicant Management', 'Applicant', '10', 0, NULL, '2026-09-02 00:04:13'),
(948, 12, 'success', 'Applicant Bianca Soriano &rarr; Offer', 'Applicant advanced to Offer stage.', 'Applicant Management', 'Applicant', '10', 0, NULL, '2026-09-02 00:04:13'),
(949, 13, 'success', 'Applicant Bianca Soriano &rarr; Offer', 'Applicant advanced to Offer stage.', 'Applicant Management', 'Applicant', '10', 0, NULL, '2026-09-02 00:04:13'),
(950, 14, 'success', 'Applicant Bianca Soriano &rarr; Offer', 'Applicant advanced to Offer stage.', 'Applicant Management', 'Applicant', '10', 0, NULL, '2026-09-02 00:04:13'),
(951, 15, 'success', 'Applicant Bianca Soriano &rarr; Offer', 'Applicant advanced to Offer stage.', 'Applicant Management', 'Applicant', '10', 0, NULL, '2026-09-02 00:04:13'),
(952, 16, 'success', 'Applicant Bianca Soriano &rarr; Offer', 'Applicant advanced to Offer stage.', 'Applicant Management', 'Applicant', '10', 0, NULL, '2026-09-02 00:04:13'),
(953, 18, 'success', 'Applicant Bianca Soriano &rarr; Offer', 'Applicant advanced to Offer stage.', 'Applicant Management', 'Applicant', '10', 0, NULL, '2026-09-02 00:04:13'),
(954, 19, 'success', 'Applicant Bianca Soriano &rarr; Offer', 'Applicant advanced to Offer stage.', 'Applicant Management', 'Applicant', '10', 0, NULL, '2026-09-02 00:04:13'),
(955, 1, 'info', 'New applicant: Camille Rose Evangelista', 'Submitted application with screening score 77.60%.', 'Applicant Management', 'Applicant', '59', 0, NULL, '2026-09-02 00:05:05'),
(956, 2, 'info', 'New applicant: Camille Rose Evangelista', 'Submitted application with screening score 77.60%.', 'Applicant Management', 'Applicant', '59', 0, NULL, '2026-09-02 00:05:05'),
(957, 3, 'info', 'New applicant: Camille Rose Evangelista', 'Submitted application with screening score 77.60%.', 'Applicant Management', 'Applicant', '59', 1, '2026-09-02 00:09:38', '2026-09-02 00:05:05'),
(958, 4, 'info', 'New applicant: Camille Rose Evangelista', 'Submitted application with screening score 77.60%.', 'Applicant Management', 'Applicant', '59', 0, NULL, '2026-09-02 00:05:05'),
(959, 6, 'info', 'New applicant: Camille Rose Evangelista', 'Submitted application with screening score 77.60%.', 'Applicant Management', 'Applicant', '59', 0, NULL, '2026-09-02 00:05:05'),
(960, 7, 'info', 'New applicant: Camille Rose Evangelista', 'Submitted application with screening score 77.60%.', 'Applicant Management', 'Applicant', '59', 0, NULL, '2026-09-02 00:05:05'),
(961, 8, 'info', 'New applicant: Camille Rose Evangelista', 'Submitted application with screening score 77.60%.', 'Applicant Management', 'Applicant', '59', 0, NULL, '2026-09-02 00:05:05'),
(962, 10, 'info', 'New applicant: Camille Rose Evangelista', 'Submitted application with screening score 77.60%.', 'Applicant Management', 'Applicant', '59', 0, NULL, '2026-09-02 00:05:05'),
(963, 11, 'info', 'New applicant: Camille Rose Evangelista', 'Submitted application with screening score 77.60%.', 'Applicant Management', 'Applicant', '59', 0, NULL, '2026-09-02 00:05:05'),
(964, 12, 'info', 'New applicant: Camille Rose Evangelista', 'Submitted application with screening score 77.60%.', 'Applicant Management', 'Applicant', '59', 0, NULL, '2026-09-02 00:05:05'),
(965, 13, 'info', 'New applicant: Camille Rose Evangelista', 'Submitted application with screening score 77.60%.', 'Applicant Management', 'Applicant', '59', 0, NULL, '2026-09-02 00:05:05'),
(966, 14, 'info', 'New applicant: Camille Rose Evangelista', 'Submitted application with screening score 77.60%.', 'Applicant Management', 'Applicant', '59', 0, NULL, '2026-09-02 00:05:05'),
(967, 15, 'info', 'New applicant: Camille Rose Evangelista', 'Submitted application with screening score 77.60%.', 'Applicant Management', 'Applicant', '59', 0, NULL, '2026-09-02 00:05:05'),
(968, 16, 'info', 'New applicant: Camille Rose Evangelista', 'Submitted application with screening score 77.60%.', 'Applicant Management', 'Applicant', '59', 0, NULL, '2026-09-02 00:05:05'),
(969, 18, 'info', 'New applicant: Camille Rose Evangelista', 'Submitted application with screening score 77.60%.', 'Applicant Management', 'Applicant', '59', 0, NULL, '2026-09-02 00:05:05'),
(970, 19, 'info', 'New applicant: Camille Rose Evangelista', 'Submitted application with screening score 77.60%.', 'Applicant Management', 'Applicant', '59', 0, NULL, '2026-09-02 00:05:05'),
(971, 20, 'info', 'New applicant: Camille Rose Evangelista', 'Submitted application with screening score 77.60%.', 'Applicant Management', 'Applicant', '59', 0, NULL, '2026-09-02 00:05:05'),
(972, 1, 'info', 'Applicant Camille Rose Evangelista: Accepted', 'Stage updated from Screened to Accepted for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '59', 0, NULL, '2026-09-02 00:05:16'),
(973, 2, 'info', 'Applicant Camille Rose Evangelista: Accepted', 'Stage updated from Screened to Accepted for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '59', 0, NULL, '2026-09-02 00:05:16'),
(974, 3, 'info', 'Applicant Camille Rose Evangelista: Accepted', 'Stage updated from Screened to Accepted for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '59', 1, '2026-09-02 00:09:37', '2026-09-02 00:05:16'),
(975, 4, 'info', 'Applicant Camille Rose Evangelista: Accepted', 'Stage updated from Screened to Accepted for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '59', 0, NULL, '2026-09-02 00:05:16'),
(976, 6, 'info', 'Applicant Camille Rose Evangelista: Accepted', 'Stage updated from Screened to Accepted for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '59', 0, NULL, '2026-09-02 00:05:16'),
(977, 7, 'info', 'Applicant Camille Rose Evangelista: Accepted', 'Stage updated from Screened to Accepted for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '59', 0, NULL, '2026-09-02 00:05:16'),
(978, 8, 'info', 'Applicant Camille Rose Evangelista: Accepted', 'Stage updated from Screened to Accepted for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '59', 0, NULL, '2026-09-02 00:05:16'),
(979, 10, 'info', 'Applicant Camille Rose Evangelista: Accepted', 'Stage updated from Screened to Accepted for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '59', 0, NULL, '2026-09-02 00:05:16'),
(980, 11, 'info', 'Applicant Camille Rose Evangelista: Accepted', 'Stage updated from Screened to Accepted for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '59', 0, NULL, '2026-09-02 00:05:16'),
(981, 12, 'info', 'Applicant Camille Rose Evangelista: Accepted', 'Stage updated from Screened to Accepted for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '59', 0, NULL, '2026-09-02 00:05:16'),
(982, 13, 'info', 'Applicant Camille Rose Evangelista: Accepted', 'Stage updated from Screened to Accepted for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '59', 0, NULL, '2026-09-02 00:05:16'),
(983, 14, 'info', 'Applicant Camille Rose Evangelista: Accepted', 'Stage updated from Screened to Accepted for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '59', 0, NULL, '2026-09-02 00:05:16'),
(984, 15, 'info', 'Applicant Camille Rose Evangelista: Accepted', 'Stage updated from Screened to Accepted for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '59', 0, NULL, '2026-09-02 00:05:16'),
(985, 16, 'info', 'Applicant Camille Rose Evangelista: Accepted', 'Stage updated from Screened to Accepted for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '59', 0, NULL, '2026-09-02 00:05:16'),
(986, 18, 'info', 'Applicant Camille Rose Evangelista: Accepted', 'Stage updated from Screened to Accepted for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '59', 0, NULL, '2026-09-02 00:05:16'),
(987, 19, 'info', 'Applicant Camille Rose Evangelista: Accepted', 'Stage updated from Screened to Accepted for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '59', 0, NULL, '2026-09-02 00:05:16'),
(988, 20, 'info', 'Applicant Camille Rose Evangelista: Accepted', 'Stage updated from Screened to Accepted for Front Desk Receptionist.', 'Applicant Management', 'Applicant', '59', 0, NULL, '2026-09-02 00:05:16'),
(989, 1, 'info', 'Interview scheduled: Camille Rose Evangelista', 'Booked on 2026-09-02 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '29', 0, NULL, '2026-09-02 00:05:22'),
(990, 2, 'info', 'Interview scheduled: Camille Rose Evangelista', 'Booked on 2026-09-02 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '29', 0, NULL, '2026-09-02 00:05:22'),
(991, 3, 'info', 'Interview scheduled: Camille Rose Evangelista', 'Booked on 2026-09-02 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '29', 1, '2026-09-02 00:09:37', '2026-09-02 00:05:22'),
(992, 4, 'info', 'Interview scheduled: Camille Rose Evangelista', 'Booked on 2026-09-02 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '29', 0, NULL, '2026-09-02 00:05:22'),
(993, 6, 'info', 'Interview scheduled: Camille Rose Evangelista', 'Booked on 2026-09-02 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '29', 0, NULL, '2026-09-02 00:05:22'),
(994, 7, 'info', 'Interview scheduled: Camille Rose Evangelista', 'Booked on 2026-09-02 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '29', 0, NULL, '2026-09-02 00:05:22'),
(995, 8, 'info', 'Interview scheduled: Camille Rose Evangelista', 'Booked on 2026-09-02 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '29', 0, NULL, '2026-09-02 00:05:22'),
(996, 10, 'info', 'Interview scheduled: Camille Rose Evangelista', 'Booked on 2026-09-02 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '29', 0, NULL, '2026-09-02 00:05:22'),
(997, 11, 'info', 'Interview scheduled: Camille Rose Evangelista', 'Booked on 2026-09-02 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '29', 0, NULL, '2026-09-02 00:05:22'),
(998, 12, 'info', 'Interview scheduled: Camille Rose Evangelista', 'Booked on 2026-09-02 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '29', 0, NULL, '2026-09-02 00:05:22'),
(999, 13, 'info', 'Interview scheduled: Camille Rose Evangelista', 'Booked on 2026-09-02 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '29', 0, NULL, '2026-09-02 00:05:22'),
(1000, 14, 'info', 'Interview scheduled: Camille Rose Evangelista', 'Booked on 2026-09-02 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '29', 0, NULL, '2026-09-02 00:05:22'),
(1001, 15, 'info', 'Interview scheduled: Camille Rose Evangelista', 'Booked on 2026-09-02 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '29', 0, NULL, '2026-09-02 00:05:22'),
(1002, 16, 'info', 'Interview scheduled: Camille Rose Evangelista', 'Booked on 2026-09-02 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '29', 0, NULL, '2026-09-02 00:05:22'),
(1003, 18, 'info', 'Interview scheduled: Camille Rose Evangelista', 'Booked on 2026-09-02 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '29', 0, NULL, '2026-09-02 00:05:22'),
(1004, 19, 'info', 'Interview scheduled: Camille Rose Evangelista', 'Booked on 2026-09-02 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '29', 0, NULL, '2026-09-02 00:05:22'),
(1005, 20, 'info', 'Interview scheduled: Camille Rose Evangelista', 'Booked on 2026-09-02 00:00:00 08:00 with Ana Ramos.', 'Applicant Management', 'Interview', '29', 0, NULL, '2026-09-02 00:05:22'),
(1006, 1, 'info', 'Assessment completed: Camille Rose Evangelista', 'Scored 80.00% — Outcome: Recommended.', 'Applicant Management', 'Assessment', '15', 0, NULL, '2026-09-02 00:05:27'),
(1007, 2, 'info', 'Assessment completed: Camille Rose Evangelista', 'Scored 80.00% — Outcome: Recommended.', 'Applicant Management', 'Assessment', '15', 0, NULL, '2026-09-02 00:05:27'),
(1008, 3, 'info', 'Assessment completed: Camille Rose Evangelista', 'Scored 80.00% — Outcome: Recommended.', 'Applicant Management', 'Assessment', '15', 1, '2026-09-02 00:09:35', '2026-09-02 00:05:27'),
(1009, 4, 'info', 'Assessment completed: Camille Rose Evangelista', 'Scored 80.00% — Outcome: Recommended.', 'Applicant Management', 'Assessment', '15', 0, NULL, '2026-09-02 00:05:27'),
(1010, 6, 'info', 'Assessment completed: Camille Rose Evangelista', 'Scored 80.00% — Outcome: Recommended.', 'Applicant Management', 'Assessment', '15', 0, NULL, '2026-09-02 00:05:27'),
(1011, 7, 'info', 'Assessment completed: Camille Rose Evangelista', 'Scored 80.00% — Outcome: Recommended.', 'Applicant Management', 'Assessment', '15', 0, NULL, '2026-09-02 00:05:27'),
(1012, 8, 'info', 'Assessment completed: Camille Rose Evangelista', 'Scored 80.00% — Outcome: Recommended.', 'Applicant Management', 'Assessment', '15', 0, NULL, '2026-09-02 00:05:27'),
(1013, 10, 'info', 'Assessment completed: Camille Rose Evangelista', 'Scored 80.00% — Outcome: Recommended.', 'Applicant Management', 'Assessment', '15', 0, NULL, '2026-09-02 00:05:27'),
(1014, 11, 'info', 'Assessment completed: Camille Rose Evangelista', 'Scored 80.00% — Outcome: Recommended.', 'Applicant Management', 'Assessment', '15', 0, NULL, '2026-09-02 00:05:27'),
(1015, 12, 'info', 'Assessment completed: Camille Rose Evangelista', 'Scored 80.00% — Outcome: Recommended.', 'Applicant Management', 'Assessment', '15', 0, NULL, '2026-09-02 00:05:27'),
(1016, 13, 'info', 'Assessment completed: Camille Rose Evangelista', 'Scored 80.00% — Outcome: Recommended.', 'Applicant Management', 'Assessment', '15', 0, NULL, '2026-09-02 00:05:27'),
(1017, 14, 'info', 'Assessment completed: Camille Rose Evangelista', 'Scored 80.00% — Outcome: Recommended.', 'Applicant Management', 'Assessment', '15', 0, NULL, '2026-09-02 00:05:27'),
(1018, 15, 'info', 'Assessment completed: Camille Rose Evangelista', 'Scored 80.00% — Outcome: Recommended.', 'Applicant Management', 'Assessment', '15', 0, NULL, '2026-09-02 00:05:27'),
(1019, 16, 'info', 'Assessment completed: Camille Rose Evangelista', 'Scored 80.00% — Outcome: Recommended.', 'Applicant Management', 'Assessment', '15', 0, NULL, '2026-09-02 00:05:27'),
(1020, 18, 'info', 'Assessment completed: Camille Rose Evangelista', 'Scored 80.00% — Outcome: Recommended.', 'Applicant Management', 'Assessment', '15', 0, NULL, '2026-09-02 00:05:27'),
(1021, 19, 'info', 'Assessment completed: Camille Rose Evangelista', 'Scored 80.00% — Outcome: Recommended.', 'Applicant Management', 'Assessment', '15', 0, NULL, '2026-09-02 00:05:28'),
(1022, 20, 'info', 'Assessment completed: Camille Rose Evangelista', 'Scored 80.00% — Outcome: Recommended.', 'Applicant Management', 'Assessment', '15', 0, NULL, '2026-09-02 00:05:28'),
(1023, 1, 'success', 'Applicant Camille Rose Evangelista &rarr; Offer', 'Applicant advanced to Offer stage.', 'Applicant Management', 'Applicant', '59', 0, NULL, '2026-09-02 00:05:29'),
(1024, 2, 'success', 'Applicant Camille Rose Evangelista &rarr; Offer', 'Applicant advanced to Offer stage.', 'Applicant Management', 'Applicant', '59', 0, NULL, '2026-09-02 00:05:29'),
(1025, 3, 'success', 'Applicant Camille Rose Evangelista &rarr; Offer', 'Applicant advanced to Offer stage.', 'Applicant Management', 'Applicant', '59', 1, '2026-09-02 00:09:35', '2026-09-02 00:05:29'),
(1026, 4, 'success', 'Applicant Camille Rose Evangelista &rarr; Offer', 'Applicant advanced to Offer stage.', 'Applicant Management', 'Applicant', '59', 0, NULL, '2026-09-02 00:05:29'),
(1027, 6, 'success', 'Applicant Camille Rose Evangelista &rarr; Offer', 'Applicant advanced to Offer stage.', 'Applicant Management', 'Applicant', '59', 0, NULL, '2026-09-02 00:05:29'),
(1028, 7, 'success', 'Applicant Camille Rose Evangelista &rarr; Offer', 'Applicant advanced to Offer stage.', 'Applicant Management', 'Applicant', '59', 0, NULL, '2026-09-02 00:05:29'),
(1029, 8, 'success', 'Applicant Camille Rose Evangelista &rarr; Offer', 'Applicant advanced to Offer stage.', 'Applicant Management', 'Applicant', '59', 0, NULL, '2026-09-02 00:05:29'),
(1030, 10, 'success', 'Applicant Camille Rose Evangelista &rarr; Offer', 'Applicant advanced to Offer stage.', 'Applicant Management', 'Applicant', '59', 0, NULL, '2026-09-02 00:05:29'),
(1031, 11, 'success', 'Applicant Camille Rose Evangelista &rarr; Offer', 'Applicant advanced to Offer stage.', 'Applicant Management', 'Applicant', '59', 0, NULL, '2026-09-02 00:05:29'),
(1032, 12, 'success', 'Applicant Camille Rose Evangelista &rarr; Offer', 'Applicant advanced to Offer stage.', 'Applicant Management', 'Applicant', '59', 0, NULL, '2026-09-02 00:05:29'),
(1033, 13, 'success', 'Applicant Camille Rose Evangelista &rarr; Offer', 'Applicant advanced to Offer stage.', 'Applicant Management', 'Applicant', '59', 0, NULL, '2026-09-02 00:05:29'),
(1034, 14, 'success', 'Applicant Camille Rose Evangelista &rarr; Offer', 'Applicant advanced to Offer stage.', 'Applicant Management', 'Applicant', '59', 0, NULL, '2026-09-02 00:05:29'),
(1035, 15, 'success', 'Applicant Camille Rose Evangelista &rarr; Offer', 'Applicant advanced to Offer stage.', 'Applicant Management', 'Applicant', '59', 0, NULL, '2026-09-02 00:05:29'),
(1036, 16, 'success', 'Applicant Camille Rose Evangelista &rarr; Offer', 'Applicant advanced to Offer stage.', 'Applicant Management', 'Applicant', '59', 0, NULL, '2026-09-02 00:05:29'),
(1037, 18, 'success', 'Applicant Camille Rose Evangelista &rarr; Offer', 'Applicant advanced to Offer stage.', 'Applicant Management', 'Applicant', '59', 0, NULL, '2026-09-02 00:05:29'),
(1038, 19, 'success', 'Applicant Camille Rose Evangelista &rarr; Offer', 'Applicant advanced to Offer stage.', 'Applicant Management', 'Applicant', '59', 0, NULL, '2026-09-02 00:05:29'),
(1039, 20, 'success', 'Applicant Camille Rose Evangelista &rarr; Offer', 'Applicant advanced to Offer stage.', 'Applicant Management', 'Applicant', '59', 0, NULL, '2026-09-02 00:05:29');

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
) ENGINE=InnoDB AUTO_INCREMENT=132 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `onboarding_checklist_items`
--

INSERT INTO `onboarding_checklist_items` (`template_item_id`, `template_id`, `item_text`, `instructions`, `requires_upload`, `upload_placeholder`, `sort_order`, `created_at`) VALUES
(9, 2, 'Department orientation completed', NULL, 0, NULL, 0, '2026-08-17 00:31:34'),
(10, 2, 'Job description acknowledged', NULL, 0, NULL, 1, '2026-08-17 00:31:34'),
(11, 2, '1st month performance evaluation', NULL, 0, NULL, 2, '2026-08-17 00:31:34'),
(12, 2, '3rd month performance evaluation', NULL, 0, NULL, 3, '2026-08-17 00:31:34'),
(13, 2, '5th month performance evaluation', NULL, 0, NULL, 4, '2026-08-17 00:31:34'),
(14, 2, 'Training hours completed', NULL, 0, NULL, 5, '2026-08-17 00:31:34'),
(122, 8, 'PROSPROS', NULL, 0, NULL, 0, '2026-08-18 19:03:07'),
(123, 9, 'PRESPRES', NULL, 0, NULL, 0, '2026-08-18 19:03:48'),
(124, 8, 'P_R_O', NULL, 0, NULL, 1, '2026-08-18 19:13:25'),
(125, 8, 'meron upload', 'mag upload ka', 1, 'magpasa ka form 123', 2, '2026-08-25 11:21:56'),
(126, 8, 'try', NULL, 1, NULL, 3, '2026-08-25 13:22:25'),
(127, 8, 'test', NULL, 0, NULL, 4, '2026-08-25 13:25:49'),
(128, 8, 'g', NULL, 1, NULL, 5, '2026-08-29 20:27:54'),
(129, 8, 'trra', NULL, 1, NULL, 6, '2026-08-29 21:08:32'),
(130, 8, '1', NULL, 1, 'g', 7, '2026-08-29 21:38:43'),
(131, 8, '2', NULL, 1, 'g', 8, '2026-08-29 23:19:47');

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
(2, 'TPL-002', 'Standard Probationary Checklist', 'Probationary', '[]', 'Inactive', '2026-08-17 00:31:34', '2026-08-25 03:13:47'),
(8, 'OCT-0008', 'PROSs', 'Probationary', '[]', 'Inactive', '2026-08-18 11:03:07', '2026-08-31 12:59:04'),
(9, 'OCT-0009', 'PRESs', 'Pre-onboarding', '[]', 'Active', '2026-08-18 11:03:48', '2026-08-31 12:59:07');

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
) ENGINE=InnoDB AUTO_INCREMENT=140 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `personal_access_tokens`
--

INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES
(1, 'App\\Models\\SystemUser', 14, 'auth-token', 'c902832860a09e26ca641d4d36dd2ee282f6dada9cead92b6840e8759d915ca0', '[\"*\"]', '2026-08-22 19:20:05', NULL, '2026-08-22 12:00:45', '2026-08-22 19:20:05'),
(2, 'App\\Models\\SystemUser', 1, 'auth-token', 'ff0671b1360ab0328569b317fa99d9060a77f6f50064963f972b60f21d8b385c', '[\"*\"]', '2026-08-22 17:14:17', NULL, '2026-08-22 16:56:14', '2026-08-22 17:14:17'),
(3, 'App\\Models\\SystemUser', 1, 'auth-token', '6e0a5274c309fb4cd1f8bea866fab90290528b7d3a24af440511d42005ae3e59', '[\"*\"]', '2026-08-23 09:50:39', NULL, '2026-08-23 09:18:18', '2026-08-23 09:50:39'),
(11, 'App\\Models\\SystemUser', 14, 'auth-token', '6dc47d1775d2d727b45dcd95a9e3eaa6cad78b7d63511982b781a0f4204d48c9', '[\"*\"]', '2026-08-23 15:11:19', NULL, '2026-08-23 12:55:25', '2026-08-23 15:11:19'),
(12, 'App\\Models\\SystemUser', 2, 'auth-token', '3df8dbb4d16e155244dd54d2965f1bf4a9664f813d0cc33a0cd16442b626d3f1', '[\"*\"]', '2026-08-24 06:12:53', NULL, '2026-08-24 03:39:24', '2026-08-24 06:12:53'),
(14, 'App\\Models\\SystemUser', 4, 'auth-token', '50f20bc5afe6f81bbd962f8787aef40e1d0218b2ae811cc91579f5ce8b20a6f0', '[\"*\"]', NULL, NULL, '2026-08-24 17:35:26', '2026-08-24 17:35:26'),
(17, 'App\\Models\\SystemUser', 4, 'auth-token', '09f8ba98332068953be680a41d4a4c289cd3e026ce17f91e0439f9d690c46d7c', '[\"*\"]', '2026-08-24 18:53:56', NULL, '2026-08-24 18:53:55', '2026-08-24 18:53:56'),
(18, 'App\\Models\\SystemUser', 4, 'auth-token', '3ddbbadf33859bafa8af03dd686bc9d6fa6ed97dbf12833882a3834723a63bcd', '[\"*\"]', NULL, NULL, '2026-08-24 18:53:57', '2026-08-24 18:53:57'),
(19, 'App\\Models\\SystemUser', 4, 'auth-token', 'e5da90ef40104366f989f70c8aa6935ecae85e2cce45921e31b2d0af45de1d03', '[\"*\"]', NULL, NULL, '2026-08-24 19:24:46', '2026-08-24 19:24:46'),
(20, 'App\\Models\\SystemUser', 3, 'auth-token', '4fb2d4fd521322257e88bb1e1dd74d7924aa52ccc2e76083364def67622e186b', '[\"*\"]', NULL, NULL, '2026-08-24 19:24:47', '2026-08-24 19:24:47'),
(21, 'App\\Models\\SystemUser', 4, 'auth-token', '59450b7ca1345bb60009435a4ce48368697d6765c7aa8e852e2b24fc981c42ee', '[\"*\"]', '2026-08-24 19:26:01', NULL, '2026-08-24 19:25:56', '2026-08-24 19:26:01'),
(34, 'App\\Models\\SystemUser', 1, 'auth-token', '1f9d6ff0d6cab8ed5758edb146bd8f169f3f4c345e593b5d5bb5860f52c30477', '[\"*\"]', '2026-08-25 05:43:24', NULL, '2026-08-25 03:01:58', '2026-08-25 05:43:24'),
(36, 'App\\Models\\SystemUser', 4, 'auth-token', '26fd37777742dd1dd17624ebab513f1c9dd3b7685187d3e63cc62118f5f00f44', '[\"*\"]', '2026-08-25 03:22:02', NULL, '2026-08-25 03:12:01', '2026-08-25 03:22:02'),
(37, 'App\\Models\\SystemUser', 4, 'auth-token', 'f00cbda4eb9a73feda0d6b39bba82e4e87da2c484370057a09f67d5a92b38f13', '[\"*\"]', '2026-08-25 05:26:01', NULL, '2026-08-25 04:24:38', '2026-08-25 05:26:01'),
(38, 'App\\Models\\SystemUser', 1, 'auth-token', '1a9618b50d453d74316e599f4ed747f3077214b279936fe78cd9e2d855fd9dcb', '[\"*\"]', NULL, NULL, '2026-08-25 06:04:35', '2026-08-25 06:04:35'),
(39, 'App\\Models\\SystemUser', 1, 'auth-token', 'cfc99793aeef016b63f935227f66cf0d10e93a1043bcf9d81600cd769c184166', '[\"*\"]', '2026-08-25 07:40:04', NULL, '2026-08-25 06:31:29', '2026-08-25 07:40:04'),
(40, 'App\\Models\\SystemUser', 3, 'auth-token', 'bda3c1eccfe439599ae0450f9e2cc86b077bb1a1b689a2eafc47deba046a64a6', '[\"*\"]', '2026-08-25 15:05:57', NULL, '2026-08-25 11:45:39', '2026-08-25 15:05:57'),
(41, 'App\\Models\\SystemUser', 3, 'auth-token', 'adc1bbd3610d95d4ab7d386837adbc123bf4d690935b95ebbc4dca56fbc63044', '[\"*\"]', '2026-08-25 16:30:41', NULL, '2026-08-25 15:25:07', '2026-08-25 16:30:41'),
(42, 'App\\Models\\SystemUser', 3, 'auth-token', 'c9cdc6332b117952bf3ff298a845652d1bb41f70a538d2968782b9b147bdc3da', '[\"*\"]', '2026-08-25 18:49:34', NULL, '2026-08-25 16:37:02', '2026-08-25 18:49:34'),
(43, 'App\\Models\\SystemUser', 3, 'auth-token', '76c1eb289f68f051ba32578f34d4ac8bcc06ea5f8e75f664c962cc1b58d9ce13', '[\"*\"]', '2026-08-26 01:32:41', NULL, '2026-08-26 01:32:38', '2026-08-26 01:32:41'),
(44, 'App\\Models\\SystemUser', 1, 'auth-token', '50402dbf4972eff8fe5a294124ac0462807ac9555ca382c8974b38df469d4bfa', '[\"*\"]', NULL, NULL, '2026-08-26 01:33:23', '2026-08-26 01:33:23'),
(45, 'App\\Models\\SystemUser', 4, 'auth-token', '72b9e909f40a0174a61633077dcbeaa6e7ab06c270de9929aa5b57765ab4d2d5', '[\"*\"]', '2026-08-26 01:33:48', NULL, '2026-08-26 01:33:44', '2026-08-26 01:33:48'),
(46, 'App\\Models\\SystemUser', 1, 'auth-token', '666d089017f44a1456c852474d3670e7b71d04cc86d71a7d8fbd9a82b23eb78a', '[\"*\"]', NULL, NULL, '2026-08-26 01:35:02', '2026-08-26 01:35:02'),
(48, 'App\\Models\\SystemUser', 1, 'auth-token', '9bd81bd85a55f8d5291ab4dfb79e9c62d38842d0fb38389e26c926748fbbd7b6', '[\"*\"]', '2026-08-26 02:03:49', NULL, '2026-08-26 02:03:23', '2026-08-26 02:03:49'),
(49, 'App\\Models\\SystemUser', 3, 'auth-token', '7805a2a79cd5afe3c9a5d028191591a0641525abbf7df3af82217fc274302f83', '[\"*\"]', '2026-08-26 02:09:50', NULL, '2026-08-26 02:03:59', '2026-08-26 02:09:50'),
(51, 'App\\Models\\SystemUser', 3, 'auth-token', '6f0645fc21599652b28becb1f84882cde72efc64522b42d9363062ce622dd9ee', '[\"*\"]', '2026-08-26 03:03:49', NULL, '2026-08-26 02:54:01', '2026-08-26 03:03:49'),
(52, 'App\\Models\\SystemUser', 1, 'auth-token', '7ed92de2aac2478acb55d78ebedd2938d6b1a3b54b55fdbf0b853c1f17854e4d', '[\"*\"]', '2026-08-26 02:58:41', NULL, '2026-08-26 02:58:33', '2026-08-26 02:58:41'),
(60, 'App\\Models\\SystemUser', 4, 'auth-token', '5286d81910baf522ae1f6ff5d8818b058b8c46f2d89f75a0824a5513efdd0571', '[\"*\"]', '2026-08-26 04:31:29', NULL, '2026-08-26 04:31:21', '2026-08-26 04:31:29'),
(64, 'App\\Models\\SystemUser', 3, 'auth-token', 'fb7492e4ef9355490fe4deb64d472a932e158c091e352df9ba3b68eb95bb5091', '[\"*\"]', '2026-08-26 04:53:18', NULL, '2026-08-26 04:48:54', '2026-08-26 04:53:18'),
(67, 'App\\Models\\SystemUser', 3, 'auth-token', '6d58f85213270f6554d494b29063d1f9681b0ca0251d8c02740ea0b0a67981a8', '[\"*\"]', '2026-08-26 05:13:33', NULL, '2026-08-26 05:13:24', '2026-08-26 05:13:33'),
(69, 'App\\Models\\SystemUser', 1, 'auth-token', '60eb2263d40294d2ce69800427d64ed1f8cae21393069eed97d2098089525c53', '[\"*\"]', '2026-08-26 05:22:30', NULL, '2026-08-26 05:18:59', '2026-08-26 05:22:30'),
(70, 'App\\Models\\SystemUser', 3, 'auth-token', '0aa464369bf25958c72bad9847591ff3afcedecc1931104da8426fb4a12a30d8', '[\"*\"]', '2026-08-26 05:46:05', NULL, '2026-08-26 05:24:32', '2026-08-26 05:46:05'),
(71, 'App\\Models\\SystemUser', 3, 'auth-token', '95dd7f9ea46d5fcdacf46f775c2b398370be285f1c2dc913f06739b1adf42049', '[\"*\"]', '2026-08-26 06:43:04', NULL, '2026-08-26 06:20:55', '2026-08-26 06:43:04'),
(72, 'App\\Models\\SystemUser', 3, 'auth-token', '65ae5d65be44e99c546893e289b29d88c8b35d17ce03de07cf4c059cdcaa779e', '[\"*\"]', '2026-08-26 06:54:36', NULL, '2026-08-26 06:43:28', '2026-08-26 06:54:36'),
(73, 'App\\Models\\SystemUser', 3, 'auth-token', '78249d0f504320f8fa9d9df526ee857bea518e6e0ea4fd27068385de0bb1935e', '[\"*\"]', '2026-08-26 07:12:59', NULL, '2026-08-26 07:07:54', '2026-08-26 07:12:59'),
(74, 'App\\Models\\SystemUser', 3, 'auth-token', '282c018c98758378d08f8dbb78e7d35b39cad55561c379b3c9e09929d6b5af99', '[\"*\"]', NULL, NULL, '2026-08-26 07:34:39', '2026-08-26 07:34:39'),
(75, 'App\\Models\\SystemUser', 3, 'auth-token', '33400d7e6ec4ec552f987cbb34ed95779c8a6dccf8e606c96f5e83b0c41f78b7', '[\"*\"]', NULL, NULL, '2026-08-26 07:38:54', '2026-08-26 07:38:54'),
(80, 'App\\Models\\SystemUser', 3, 'auth-token', '0a7ed41018ca4059bee0c00061e2ddbf7a2af3ccc98bc61f66f9429b0602fb7a', '[\"*\"]', NULL, NULL, '2026-08-26 08:19:12', '2026-08-26 08:19:12'),
(93, 'App\\Models\\SystemUser', 3, 'auth-token', '4dfceebfedf927a5a6a27c7f056cea2feea0df08526bcd97305c7d2986d25e1c', '[\"*\"]', '2026-08-29 13:39:54', NULL, '2026-08-29 13:39:53', '2026-08-29 13:39:54'),
(96, 'App\\Models\\SystemUser', 3, 'auth-token', '798fad45206caef30b59d83fad5982cd2f90d1aecc581e4ff0aec4c5d08b5eba', '[\"*\"]', NULL, NULL, '2026-08-29 14:07:43', '2026-08-29 14:07:43'),
(97, 'App\\Models\\SystemUser', 3, 'auth-token', 'd04d5cb3ec013f30f5a949953b4d41d5f9a487fe749053b92510cc1186813d3a', '[\"*\"]', NULL, NULL, '2026-08-29 14:07:44', '2026-08-29 14:07:44'),
(105, 'App\\Models\\SystemUser', 1, 'diag', 'f4d1a9c6faa1931b1f9782de70f3e6d1588e3050bbefb042b8dfbcc36ed0f4cc', '[\"*\"]', '2026-08-29 15:18:30', NULL, '2026-08-29 15:07:56', '2026-08-29 15:18:30'),
(106, 'App\\Models\\SystemUser', 3, 'auth-token', '4f5d330f9b730eb27da85a31e8866b1a43324e73eef7e0a9f3c4a0cf34da706b', '[\"*\"]', '2026-08-29 15:13:50', NULL, '2026-08-29 15:13:43', '2026-08-29 15:13:50'),
(107, 'App\\Models\\SystemUser', 3, 'auth-token', '7bf36e639a3c5b5845f680458f6e7644bd3ca528f6c619f57348f205370ebbc4', '[\"*\"]', '2026-08-29 15:28:41', NULL, '2026-08-29 15:14:54', '2026-08-29 15:28:41'),
(108, 'App\\Models\\SystemUser', 4, 'auth-token', '49933adbfc476b4bc40e10c06ee98c83b1a94a0a2ab02486621ec2ee4b73042b', '[\"*\"]', '2026-08-29 15:19:07', NULL, '2026-08-29 15:19:07', '2026-08-29 15:19:07'),
(111, 'App\\Models\\SystemUser', 1, 'diag', 'be920e9b7c283b891c07e3fce117c7439e2d820e328332859ff25148f05399c7', '[\"*\"]', NULL, NULL, '2026-08-29 16:02:27', '2026-08-29 16:02:27'),
(114, 'App\\Models\\SystemUser', 3, 'auth-token', '63471f15315ace9e77ba1fabdf0308cf3d4bf3f06d47112e45a1116ad56ff71e', '[\"*\"]', '2026-08-29 19:53:07', NULL, '2026-08-29 16:37:23', '2026-08-29 19:53:07'),
(116, 'App\\Models\\SystemUser', 1, 'auth-token', '59d181fa74f7a00bcbbb1a50a07c44673305fe81fc4a70418cc65648542ff86f', '[\"*\"]', '2026-08-29 19:53:12', NULL, '2026-08-29 17:08:52', '2026-08-29 19:53:12'),
(117, 'App\\Models\\SystemUser', 3, 'auth-token', '4cd85ef66b5fcba1dd55a651ef37e2389f546e73cfda4e9e1270d584ee7592f9', '[\"*\"]', '2026-08-30 14:34:04', NULL, '2026-08-30 14:07:38', '2026-08-30 14:34:04'),
(118, 'App\\Models\\SystemUser', 1, 'auth-token', '93b7ebc249f4b8984ca0800ac254c0dc11a8d888964aa891f92bc41a0aca6659', '[\"*\"]', '2026-08-30 14:30:19', NULL, '2026-08-30 14:11:51', '2026-08-30 14:30:19'),
(121, 'App\\Models\\SystemUser', 1, 'auth-token', 'c27e072835cbe4febc5df35c04e7a55aabb0123603d07601bf140b898d76f9bc', '[\"*\"]', '2026-08-30 15:23:09', NULL, '2026-08-30 15:22:25', '2026-08-30 15:23:09'),
(122, 'App\\Models\\SystemUser', 1, 'auth-token', '04f77e00f2dff4851dbeb6a9b7ac780d52e1b5bf1a8b56d15f074d333f45f7d9', '[\"*\"]', '2026-08-30 21:13:23', NULL, '2026-08-30 15:25:35', '2026-08-30 21:13:23'),
(123, 'App\\Models\\SystemUser', 3, 'auth-token', '069cb1fa2af8266f932bc224965ed1f13d1708094147880c796cefcc3914f400', '[\"*\"]', '2026-08-30 16:34:10', NULL, '2026-08-30 16:11:37', '2026-08-30 16:34:10'),
(124, 'App\\Models\\SystemUser', 1, 'auth-token', '192acf66922f5853d06ebf3e46a5482fbcfda8351e4c024ce85e17a60e792d48', '[\"*\"]', '2026-08-30 16:33:14', NULL, '2026-08-30 16:27:33', '2026-08-30 16:33:14'),
(125, 'App\\Models\\SystemUser', 1, 'auth-token', 'd41d30ad178e9373f2f7dbd76096a4f2332c0d0d223aaf9a82a6d5fadeb67549', '[\"*\"]', '2026-08-30 17:58:36', NULL, '2026-08-30 17:23:20', '2026-08-30 17:58:36'),
(126, 'App\\Models\\SystemUser', 1, 'auth-token', 'b10b13fa5430cdf921bcce3f82c667b179128138b8dbd9bd42aacd6c76fe1c7c', '[\"*\"]', '2026-08-30 19:18:12', NULL, '2026-08-30 19:10:39', '2026-08-30 19:18:12'),
(127, 'App\\Models\\SystemUser', 1, 'auth-token', 'e80964c5c91354d85a19980a3a79e276a3f6cb7f89e2fb72996f69ec76e83e1b', '[\"*\"]', '2026-08-30 19:55:26', NULL, '2026-08-30 19:48:40', '2026-08-30 19:55:26'),
(128, 'App\\Models\\SystemUser', 1, 'auth-token', '2ae31ea136e560ce3538779fba97a3bc98cfa1945e3913cabf7f3bf04888ad55', '[\"*\"]', '2026-08-30 21:49:09', NULL, '2026-08-30 20:28:23', '2026-08-30 21:49:09'),
(129, 'App\\Models\\SystemUser', 3, 'auth-token', '8f73037cf44daa8b9d6238af7ddc4f0d8c817bbf642731c703abfe973cff4b88', '[\"*\"]', '2026-08-31 18:05:44', NULL, '2026-08-31 10:42:06', '2026-08-31 18:05:44'),
(130, 'App\\Models\\SystemUser', 1, 'auth-token', '89e7c2350083eeb36872f4fba5366c62dd5e6e587eb79f840055264431560983', '[\"*\"]', '2026-09-01 00:10:12', NULL, '2026-08-31 17:55:36', '2026-09-01 00:10:12'),
(139, 'App\\Models\\SystemUser', 3, 'auth-token', '377de75366dd7bafb5e7c6106e645d2e2e1f7765062cc5b5bf87a63c9c5140fe', '[\"*\"]', '2026-09-02 01:09:56', NULL, '2026-09-02 00:11:47', '2026-09-02 01:09:56');

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
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `positions`
--

INSERT INTO `positions` (`position_id`, `position_code`, `title`, `department_id`, `salary_grade_id`, `level`, `headcount`, `filled_count`, `created_at`, `updated_at`) VALUES
(1, 'POS-001', 'Front Desk Receptionist', 1, 2, 'Rank & File', 8, 3, '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(2, 'POS-002', 'Guest Relations Officer', 1, 4, 'Supervisory', 3, 2, '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(3, 'POS-003', 'Restaurant Server', 2, 1, 'Rank & File', 12, 1, '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(4, 'POS-004', 'Bartender', 2, 1, 'Rank & File', 4, 0, '2026-08-17 17:41:34', '2026-08-30 18:00:27'),
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
(18, 'POS-018', 'Front Desk Receptionist', 1, 4, 'Staff', 2, 0, '2026-08-24 04:04:50', '2026-08-24 04:04:50'),
(19, 'POS-019', 'ha', 9, 2, 'Rank & File', 5, 0, '2026-08-30 15:26:41', '2026-08-30 15:26:41');

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=InnoDB AUTO_INCREMENT=161 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
(12, 'skill', 'Pastry and Baking', '[\"pastry\",\"baking\",\"pastry arts\",\"dessert preparation\",\"breads and pastries\"]', 1, '2026-08-23 18:47:07', '2026-09-02 07:33:25'),
(13, 'skill', 'Room Turnover', '[\"room turnover\",\"room cleaning\",\"guestroom cleaning\"]', 1, '2026-08-23 18:47:07', NULL),
(14, 'skill', 'Linen Handling', '[\"linen handling\",\"linen management\",\"laundry operations\"]', 1, '2026-08-23 18:47:07', NULL),
(15, 'skill', 'Public Area Cleaning', '[\"public area cleaning\",\"public area maintenance\"]', 1, '2026-08-23 18:47:07', NULL),
(16, 'skill', 'Chemical Safety', '[\"chemical safety\",\"cleaning chemical handling\"]', 1, '2026-08-23 18:47:07', NULL),
(17, 'skill', 'Guest Relations', '[\"guest relations\",\"guest relations management\",\"guest engagement\"]', 1, '2026-08-23 18:47:07', NULL),
(18, 'skill', 'Front Office Operations', '[\"front office\",\"front office operations\",\"front desk\",\"reception operations\"]', 1, '2026-08-23 18:47:07', '2026-09-02 07:33:25'),
(19, 'skill', 'Check-in / Check-out', '[\"check-in \\/ check-out\",\"check in check out\",\"check-in\",\"check-out\",\"arrival and departure handling\"]', 1, '2026-08-23 18:47:07', NULL),
(20, 'skill', 'Reservations', '[\"reservations\",\"reservation management\",\"booking management\"]', 1, '2026-08-23 18:47:07', '2026-09-02 07:33:25'),
(21, 'skill', 'Property Management Systems', '[\"opera pms\",\"opera\",\"property management system\",\"pms systems\",\"pms\"]', 1, '2026-08-23 18:47:07', '2026-08-24 01:35:52'),
(22, 'skill', 'POS Systems', '[\"pos systems\",\"pos\",\"point of sale\",\"point of sale systems\",\"micros\",\"pos operation\"]', 1, '2026-08-23 18:47:07', NULL),
(23, 'skill', 'Cash Handling', '[\"cash handling\",\"cashiering\",\"billing\",\"funds handling\"]', 1, '2026-08-23 18:47:07', NULL),
(24, 'skill', 'Upselling', '[\"upselling\",\"upsell techniques\",\"suggestive selling\",\"cross-selling\"]', 1, '2026-08-23 18:47:07', NULL),
(25, 'skill', 'Table Service', '[\"table service\",\"food service\",\"service sequence\",\"dining room service\"]', 1, '2026-08-23 18:47:07', NULL),
(26, 'skill', 'Banquet Service', '[\"banquet service\",\"banquet operations\",\"function service\"]', 1, '2026-08-23 18:47:07', NULL),
(27, 'skill', 'Inventory Control', '[\"inventory control\",\"inventory management\",\"stock control\",\"stocktaking\"]', 1, '2026-08-23 18:47:07', '2026-09-02 07:33:25'),
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
(45, 'job_role', 'Line Cook', '[\"line cook\",\"cook\",\"station cook\",\"hot kitchen cook\",\"commis chef\",\"kitchen cook\",\"senior line cook\"]', 1, '2026-08-23 18:47:07', '2026-09-02 07:33:25'),
(46, 'job_role', 'Chef', '[\"chef\",\"sous chef\",\"head chef\",\"executive chef\",\"chef de partie\",\"executive sous chef\",\"banquet chef\",\"demi chef\"]', 1, '2026-08-23 18:47:07', '2026-09-02 07:33:25'),
(47, 'job_role', 'Pastry Chef', '[\"pastry chef\",\"baker\",\"pastry cook\",\"baker chef\"]', 1, '2026-08-23 18:47:07', NULL),
(48, 'job_role', 'Kitchen Helper', '[\"kitchen helper\",\"dishwasher\",\"kitchen aide\",\"steward\",\"kitchen steward\",\"kitchen staff\"]', 1, '2026-08-23 18:47:07', '2026-09-02 07:33:25'),
(49, 'job_role', 'Housekeeping Attendant', '[\"housekeeping attendant\",\"room attendant\",\"housekeeper\",\"chambermaid\",\"roomboy\",\"public area attendant\"]', 1, '2026-08-23 18:47:07', NULL),
(50, 'job_role', 'Laundry Attendant', '[\"laundry attendant\",\"laundry staff\"]', 1, '2026-08-23 18:47:07', NULL),
(51, 'job_role', 'Restaurant Server', '[\"restaurant server\",\"waiter\",\"waitress\",\"food server\",\"server\",\"food and beverage attendant\",\"f&b attendant\",\"service crew\",\"restaurant crew member\"]', 1, '2026-08-23 18:47:07', '2026-09-02 07:33:25'),
(52, 'job_role', 'Hostess', '[\"hostess\",\"food host\",\"restaurant host\",\"fine dining restaurant host\",\"host\"]', 1, '2026-08-23 18:47:07', '2026-09-02 07:33:25'),
(53, 'job_role', 'Front Desk Receptionist', '[\"front desk agent\",\"front desk officer\",\"front desk receptionist\",\"front desk staff\",\"front office associate\",\"guest service agent\",\"receptionist\"]', 1, '2026-08-23 18:47:07', '2026-09-02 07:33:25'),
(54, 'job_role', 'Guest Relations Officer', '[\"gro\",\"guest relations coordinator\",\"guest relations officer\",\"guest service officer\",\"guest relations associate\"]', 1, '2026-08-23 18:47:07', '2026-09-02 07:33:25'),
(55, 'job_role', 'Concierge', '[\"concierge\",\"hotel concierge\",\"bell captain\",\"bellman\"]', 1, '2026-08-23 18:47:07', '2026-09-02 07:33:25'),
(56, 'job_role', 'HR Assistant', '[\"hr assistant\",\"human resource assistant\",\"human resources assistant\",\"hr staff\",\"recruitment assistant\"]', 1, '2026-08-23 18:47:07', NULL),
(57, 'job_role', 'HR Manager', '[\"hr manager\",\"human resources manager\",\"hr administration manager\"]', 1, '2026-08-23 18:47:07', NULL),
(58, 'job_role', 'General Manager', '[\"general manager\",\"gm\",\"property manager\"]', 1, '2026-08-23 18:47:07', NULL),
(59, 'job_role', 'Supervisor', '[\"supervisor\",\"shift supervisor\",\"team leader\"]', 1, '2026-08-23 18:47:07', NULL),
(60, 'job_role', 'Maintenance Technician', '[\"maintenance technician\",\"hotel maintenance technician\",\"maintenance staff\",\"handyman\",\"building maintenance staff\",\"facilities assistant\"]', 1, '2026-08-23 18:47:07', '2026-09-02 07:33:25'),
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
(82, 'job_role', 'Restaurant Supervisor', '[\"restaurant supervisor\",\"floor supervisor\",\"service supervisor\",\"senior server lead\",\"food and beverage supervisor\",\"f&b supervisor\"]', 1, '2026-08-24 01:35:52', '2026-09-02 07:33:25'),
(83, 'job_role', 'Pastry and Bakery Assistant', '[\"pastry assistant\",\"bakery assistant\",\"bakery trainee\",\"pastry cook\"]', 1, '2026-08-24 01:35:52', '2026-08-24 01:35:52'),
(84, 'skill', 'VIP Handling', '[]', 1, '2026-08-30 20:23:44', '2026-08-30 20:23:44'),
(85, 'skill', 'BS Tourism', '[]', 1, '2026-08-30 20:23:46', '2026-08-30 20:23:46'),
(86, 'skill', 'Multilingual', '[]', 1, '2026-08-30 20:23:46', '2026-08-30 20:23:46'),
(87, 'skill', 'Inventory', '[]', 1, '2026-08-30 20:24:04', '2026-08-30 20:24:04'),
(88, 'skill', 'Bar Hygiene', '[]', 1, '2026-08-30 20:24:04', '2026-08-30 20:24:04'),
(93, 'job_role', 'Front Desk Associate', '[\"front desk associate\",\"front office associate\",\"front desk representative\",\"guest service representative\",\"front desk clerk\",\"front office intern\"]', 1, '2026-09-02 07:33:25', NULL),
(94, 'job_role', 'Hotel Night Auditor', '[\"night auditor\",\"hotel night auditor\",\"night audit associate\",\"night audit supervisor\"]', 1, '2026-09-02 07:33:25', NULL),
(95, 'job_role', 'Kitchen Supervisor', '[\"kitchen supervisor\",\"restaurant kitchen supervisor\",\"culinary supervisor\",\"chef supervisor\"]', 1, '2026-09-02 07:33:25', NULL),
(96, 'job_role', 'Bar Operations Supervisor', '[\"bar operations supervisor\",\"restaurant bar operations supervisor\",\"bar supervisor\",\"bar manager\",\"bar lead\",\"bar team leader\"]', 1, '2026-09-02 07:33:25', NULL),
(97, 'job_role', 'Laundry Supervisor', '[\"laundry supervisor\",\"hotel laundry supervisor\",\"laundry team leader\"]', 1, '2026-09-02 07:33:25', NULL),
(98, 'job_role', 'Spa Receptionist', '[\"spa receptionist\",\"hotel spa and wellness receptionist\",\"wellness receptionist\",\"spa front desk\",\"spa and wellness receptionist\"]', 1, '2026-09-02 07:33:25', NULL),
(99, 'job_role', 'Revenue Management Assistant', '[\"revenue management assistant\",\"hotel revenue management assistant\",\"revenue assistant\",\"pricing assistant\"]', 1, '2026-09-02 07:33:25', NULL),
(100, 'job_role', 'Purchasing Coordinator', '[\"purchasing coordinator\",\"procurement coordinator\",\"hotel purchasing and procurement coordinator\",\"purchasing and inventory assistant\",\"purchasing assistant\",\"procurement assistant\"]', 1, '2026-09-02 07:33:25', NULL),
(101, 'job_role', 'Inventory Supervisor', '[\"inventory supervisor\",\"cost control supervisor\",\"restaurant inventory and cost control supervisor\",\"inventory and cost control supervisor\",\"stock controller\",\"inventory clerk\",\"restaurant stock controller\"]', 1, '2026-09-02 07:33:25', NULL),
(102, 'job_role', 'Restaurant Cashier', '[\"restaurant cashier\",\"cashier\",\"cashier and customer service associate\",\"dining cashier\",\"customer service associate\"]', 1, '2026-09-02 07:33:25', NULL),
(103, 'job_role', 'Events Coordinator', '[\"sales and events coordinator\",\"hotel sales and events coordinator\",\"events coordinator\",\"banquet coordinator\",\"event coordinator\",\"catering assistant\",\"events and catering assistant\",\"banquet sales assistant\",\"banquet server\"]', 1, '2026-09-02 07:33:25', NULL),
(104, 'job_role', 'Recreation Supervisor', '[\"recreation supervisor\",\"resort recreation and activities supervisor\",\"activities supervisor\",\"recreation coordinator\",\"activities coordinator\",\"hotel recreation and activities coordinator\",\"resort activities assistant\"]', 1, '2026-09-02 07:33:25', NULL),
(105, 'job_role', 'Beverage Service Specialist', '[\"beverage service specialist\",\"restaurant beverage service specialist\",\"beverage specialist\",\"bar specialist\",\"beverage attendant\"]', 1, '2026-09-02 07:33:25', NULL),
(106, 'job_role', 'Quality Assurance Officer', '[\"quality assurance officer\",\"restaurant quality assurance and food safety officer\",\"food safety officer\",\"qa officer\",\"qa and food safety officer\",\"qa assistant\",\"restaurant compliance officer\"]', 1, '2026-09-02 07:33:25', NULL),
(107, 'job_role', 'Reservations Coordinator', '[\"reservations coordinator\",\"hotel reservations and distribution coordinator\",\"reservations and distribution coordinator\",\"reservations officer\",\"reservations assistant\",\"hotel reservations assistant\",\"hotel reservations officer\"]', 1, '2026-09-02 07:33:25', NULL),
(108, 'job_role', 'Guest Experience Coordinator', '[\"guest experience coordinator\",\"guest experience and loyalty coordinator\",\"hotel guest experience and loyalty coordinator\",\"loyalty coordinator\"]', 1, '2026-09-02 07:33:25', NULL),
(109, 'job_role', 'Accounts Assistant', '[\"accounts assistant\",\"accounting assistant\",\"finance assistant\",\"bookkeeper\"]', 1, '2026-09-02 07:33:25', NULL),
(110, 'job_role', 'Housekeeping Supervisor', '[\"housekeeping supervisor\",\"hotel housekeeping supervisor\",\"floor housekeeper\",\"executive housekeeper\"]', 1, '2026-09-02 07:33:25', NULL),
(111, 'job_role', 'Resort Housekeeping Operations Manager', '[\"resort housekeeping operations manager\",\"housekeeping operations manager\",\"resort housekeeping manager\",\"housekeeping manager\",\"housekeeping operations supervisor\",\"resort housekeeping operations\"]', 1, '2026-09-02 07:33:25', NULL),
(112, 'job_role', 'Hotel Revenue Analyst', '[\"hotel revenue analyst\",\"revenue analyst\",\"revenue management analyst\",\"hotel revenue management analyst\",\"pricing analyst\",\"revenue analyst hotel\"]', 1, '2026-09-02 07:33:25', NULL),
(113, 'job_role', 'Restaurant Guest Relations Supervisor', '[\"restaurant guest relations supervisor\",\"guest relations supervisor\",\"restaurant guest relations coordinator\",\"guest relations supervisor restaurant\"]', 1, '2026-09-02 07:33:25', NULL),
(114, 'job_role', 'Restaurant Customer Experience Coordinator', '[\"restaurant customer experience coordinator\",\"customer experience coordinator\",\"cx coordinator\",\"guest experience coordinator restaurant\",\"customer experience coordinator restaurant\"]', 1, '2026-09-02 07:33:25', NULL),
(115, 'job_role', 'Dining Service Supervisor', '[\"dining service supervisor\",\"restaurant service supervisor\",\"dining supervisor\",\"service supervisor dining\",\"dining room supervisor\"]', 1, '2026-09-02 07:33:25', NULL),
(116, 'job_role', 'Guest Experience Officer', '[\"guest experience officer\",\"guest experience coordinator\",\"guest experience specialist\",\"gxo\",\"guest experience officer hotel\"]', 1, '2026-09-02 07:33:25', NULL),
(117, 'job_role', 'Restaurant Relations Coordinator', '[\"restaurant relations coordinator\",\"guest relations coordinator\",\"relations coordinator\",\"restaurant guest relations coordinator\"]', 1, '2026-09-02 07:33:25', NULL),
(118, 'job_role', 'Restaurant Service Team Leader', '[\"restaurant service team leader\",\"service team leader\",\"restaurant team leader\",\"service supervisor\",\"restaurant service supervisor\"]', 1, '2026-09-02 07:33:25', NULL),
(119, 'job_role', 'Restaurant Beverage Supervisor', '[\"restaurant beverage supervisor\",\"beverage supervisor\",\"bar supervisor\",\"beverage service supervisor\",\"restaurant bar supervisor\"]', 1, '2026-09-02 07:33:25', NULL),
(120, 'job_role', 'Restaurant Events and Banquet Coordinator', '[\"restaurant events and banquet coordinator\",\"events and banquet coordinator\",\"restaurant events coordinator\",\"banquet coordinator\",\"events coordinator restaurant\"]', 1, '2026-09-02 07:33:25', NULL),
(121, 'job_role', 'Hotel Sales and Events Supervisor', '[\"hotel sales and events supervisor\",\"sales and events supervisor\",\"hotel sales supervisor\",\"sales events supervisor\",\"hotel sales and events coordinator\"]', 1, '2026-09-02 07:33:25', NULL),
(122, 'job_role', 'Hospitality Corporate Sales Coordinator', '[\"hospitality corporate sales coordinator\",\"corporate sales coordinator\",\"corporate sales officer\",\"sales coordinator corporate\",\"hospitality sales coordinator\"]', 1, '2026-09-02 07:33:25', NULL),
(123, 'job_role', 'Hotel Events Sales Officer', '[\"hotel events sales officer\",\"events sales officer\",\"event sales officer\",\"hotel sales officer\",\"events officer hotel\"]', 1, '2026-09-02 07:33:25', NULL),
(124, 'job_role', 'Catering and Banquet Sales Coordinator', '[\"catering and banquet sales coordinator\",\"catering sales coordinator\",\"banquet sales coordinator\",\"catering coordinator\",\"banquet sales assistant\"]', 1, '2026-09-02 07:33:25', NULL),
(125, 'job_role', 'Hospitality Client Relations Team Leader', '[\"hospitality client relations team leader\",\"client relations team leader\",\"client relations supervisor\",\"hospitality client relations supervisor\"]', 1, '2026-09-02 07:33:25', NULL),
(126, 'job_role', 'Hotel Business Development Coordinator', '[\"hotel business development coordinator\",\"business development coordinator\",\"business development officer\",\"hotel sales development coordinator\",\"business development coordinator hotel\"]', 1, '2026-09-02 07:33:25', NULL),
(127, 'job_role', 'Hospitality Facilities Team Leader', '[\"hospitality facilities team leader\",\"facilities team leader\",\"facilities supervisor\",\"hospitality facilities supervisor\"]', 1, '2026-09-02 07:33:25', NULL),
(128, 'job_role', 'Hospitality Maintenance Coordinator', '[\"hospitality maintenance coordinator\",\"maintenance coordinator\",\"facilities maintenance coordinator\",\"hospitality maintenance supervisor\"]', 1, '2026-09-02 07:33:25', NULL),
(129, 'job_role', 'Hotel Engineering Operations Assistant', '[\"hotel engineering operations assistant\",\"engineering operations assistant\",\"hotel engineering assistant\",\"engineering assistant hotel\"]', 1, '2026-09-02 07:33:25', NULL),
(130, 'job_role', 'Hotel Facilities Supervisor', '[\"hotel facilities supervisor\",\"facilities supervisor\",\"property maintenance supervisor\",\"hotel facilities manager\"]', 1, '2026-09-02 07:33:25', NULL),
(131, 'job_role', 'Hotel Property Maintenance Supervisor', '[\"hotel property maintenance supervisor\",\"property maintenance supervisor\",\"maintenance supervisor hotel\",\"property maintenance manager\"]', 1, '2026-09-02 07:33:25', NULL),
(132, 'job_role', 'Resort Property Operations Coordinator', '[\"resort property operations coordinator\",\"property operations coordinator\",\"property coordinator\",\"resort operations coordinator\"]', 1, '2026-09-02 07:33:25', NULL),
(133, 'job_role', 'Restaurant Procurement and Purchasing Coordinator', '[\"restaurant procurement and purchasing coordinator\",\"procurement and purchasing coordinator\",\"restaurant procurement coordinator\",\"purchasing coordinator\",\"procurement coordinator\"]', 1, '2026-09-02 07:33:25', NULL),
(134, 'job_role', 'Guest Booking Team Leader', '[\"guest booking team leader\",\"booking team leader\",\"reservations team leader\",\"booking services team leader\"]', 1, '2026-09-02 07:33:25', NULL),
(135, 'job_role', 'Hospitality Reservations Specialist', '[\"hospitality reservations specialist\",\"reservations specialist\",\"hospitality reservations officer\",\"reservations officer hospitality\"]', 1, '2026-09-02 07:33:25', NULL),
(136, 'job_role', 'Hotel Booking Services Officer', '[\"hotel booking services officer\",\"booking services officer\",\"hotel booking officer\",\"booking officer hotel\"]', 1, '2026-09-02 07:33:25', NULL),
(137, 'job_role', 'Hotel Reservations Sales Coordinator', '[\"hotel reservations sales coordinator\",\"reservations sales coordinator\",\"hotel reservations sales\",\"reservations coordinator sales\"]', 1, '2026-09-02 07:33:25', NULL),
(138, 'job_role', 'Hotel Reservations Supervisor', '[\"hotel reservations supervisor\",\"reservations supervisor\",\"hotel reservations manager\",\"reservations manager hotel\"]', 1, '2026-09-02 07:33:25', NULL),
(139, 'job_role', 'Reservations Booking Coordinator', '[\"reservations booking coordinator\",\"booking coordinator\",\"reservations coordinator\",\"hotel booking coordinator\"]', 1, '2026-09-02 07:33:25', NULL),
(140, 'job_role', 'Resort Recreation and Activities Manager', '[\"resort recreation and activities manager\",\"recreation and activities manager\",\"resort recreation manager\",\"activities manager\",\"recreation supervisor resort\"]', 1, '2026-09-02 07:33:25', NULL),
(141, 'job_role', 'Banquet Operations Supervisor', '[\"banquet operations supervisor\",\"banquet supervisor\",\"banquet operations manager\",\"banquet manager\"]', 1, '2026-09-02 07:33:25', NULL),
(142, 'job_role', 'Banquet Service Team Leader', '[\"banquet service team leader\",\"banquet team leader\",\"banquet service supervisor\",\"banquet team supervisor\"]', 1, '2026-09-02 07:33:25', NULL),
(143, 'job_role', 'Catering Operations Coordinator', '[\"catering operations coordinator\",\"catering coordinator\",\"banquet catering coordinator\",\"catering operations\"]', 1, '2026-09-02 07:33:25', NULL),
(144, 'job_role', 'Events Catering Supervisor', '[\"events catering supervisor\",\"catering supervisor\",\"event catering coordinator\",\"banquet catering supervisor\"]', 1, '2026-09-02 07:33:25', NULL),
(145, 'job_role', 'Food Beverage Events Supervisor', '[\"food beverage events supervisor\",\"food and beverage events supervisor\",\"f&b events supervisor\",\"food beverage supervisor\"]', 1, '2026-09-02 07:33:25', NULL),
(146, 'job_role', 'Hotel Banquet Coordinator', '[\"hotel banquet coordinator\",\"banquet coordinator\",\"hotel banquet\",\"banquet events coordinator\"]', 1, '2026-09-02 07:33:25', NULL),
(147, 'job_role', 'Resort Guest Experience Manager', '[\"resort guest experience manager\",\"guest experience manager\",\"guest experience supervisor\",\"resort guest relations manager\"]', 1, '2026-09-02 07:33:25', NULL),
(148, 'job_role', 'Hotel Reservations Manager', '[\"hotel reservations manager\",\"reservations manager\",\"hotel reservations supervisor\",\"reservations manager hotel\"]', 1, '2026-09-02 07:33:25', NULL),
(149, 'job_role', 'Culinary Production Coordinator', '[\"culinary production coordinator\",\"kitchen production coordinator\",\"culinary coordinator\",\"culinary production\"]', 1, '2026-09-02 07:33:25', NULL),
(150, 'job_role', 'Food Production Supervisor', '[\"food production supervisor\",\"kitchen production supervisor\",\"food production coordinator\",\"culinary production supervisor\"]', 1, '2026-09-02 07:33:25', NULL),
(151, 'job_role', 'Hospitality Kitchen Coordinator', '[\"hospitality kitchen coordinator\",\"kitchen coordinator\",\"hospitality kitchen\",\"culinary coordinator\"]', 1, '2026-09-02 07:33:25', NULL),
(152, 'job_role', 'Kitchen Operations Supervisor', '[\"kitchen operations supervisor\",\"culinary operations supervisor\",\"kitchen supervisor operations\",\"kitchen operations manager\"]', 1, '2026-09-02 07:33:25', NULL),
(153, 'job_role', 'Restaurant Culinary Operations Officer', '[\"restaurant culinary operations officer\",\"culinary operations officer\",\"restaurant culinary officer\",\"culinary officer restaurant\"]', 1, '2026-09-02 07:33:25', NULL),
(154, 'job_role', 'Restaurant Kitchen Team Leader', '[\"restaurant kitchen team leader\",\"kitchen team leader\",\"restaurant kitchen team\",\"kitchen supervisor team leader\"]', 1, '2026-09-02 07:33:25', NULL),
(155, 'job_role', 'Hotel Front Office Supervisor', '[\"hotel front office supervisor\",\"front office supervisor\",\"front desk supervisor\",\"hotel front office manager\",\"front office lead\"]', 1, '2026-09-02 07:33:25', NULL),
(156, 'job_role', 'Food and Beverage Manager', '[\"food and beverage manager\",\"f&b manager\",\"restaurant manager\",\"food & beverage manager\"]', 1, '2026-09-02 07:33:25', NULL),
(157, 'job_role', 'Executive Housekeeper', '[\"executive housekeeper\",\"housekeeping manager\",\"housekeeping executive\",\"head housekeeper\"]', 1, '2026-09-02 07:33:25', NULL),
(158, 'job_role', 'Resort Operations Manager', '[\"resort operations manager\",\"hotel operations manager\",\"resort manager\",\"operations manager resort\"]', 1, '2026-09-02 07:33:25', NULL),
(159, 'job_role', 'Front Office Manager', '[\"front office manager\",\"front desk manager\",\"front office lead\",\"guest services manager\"]', 1, '2026-09-02 07:33:25', NULL),
(160, 'job_role', 'Reservations Manager', '[\"reservations manager\",\"reservation manager\",\"booking manager\"]', 1, '2026-09-02 07:33:25', NULL);

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
('AyQRFiQy9vKUE7DPrhEjCxS2S5B9KK2PdvmhIBDN', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiSGVuVE1vdExBeHRZaTZIY3gyRExNbGlsUnplZVc0bFR3a2FrRzhQbiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6Mjc6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9sb2dpbiI7czo1OiJyb3V0ZSI7czo1OiJsb2dpbiI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1788040136),
('c26yuquKxIL7aRrvfDcvQPuOVXIjLQDYWkVJEGG0', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-PH) WindowsPowerShell/5.1.19041.6456', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiazRtV1g0MEZnR0I0VlF3SUN4Z1ZNZlFNanJjcDdXUkJoQmFVVHFOZSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1788127255),
('dhsSO8MWSAqzQ7ykYBWKPfA9RxZ2vG32SZNG6Epw', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-PH) WindowsPowerShell/5.1.19041.6456', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiamlNa0EwcnRjN2pYcTFzcHdMOTZrTnI3N3RLY0VreXJVY1pPaXRQeCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6Mjc6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9sb2dpbiI7czo1OiJyb3V0ZSI7czo1OiJsb2dpbiI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1788127015),
('IeDw8X9tqZiPJineEmrneQ3lDOohC872owrHrMkx', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-PH) WindowsPowerShell/5.1.19041.6456', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiWHBBZzRyREdIWXprZURSZ1lKOWpwY3A1ZGtvNFFzdVZSUFZWSG9LMSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1788127272),
('IHwJgW4yqNVEO5Gt8Wvqy4Y7mYMRvk8cD7zFQgFT', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-PH) WindowsPowerShell/5.1.19041.6456', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiZ0NZdHBxQUhwWlpRSnZ4bGFlaUpxMXNjU25mVVVublNKcWtSUlZoRSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1788127136),
('O1QXLDO0EaMnisCzk6we7lNfhHbHELA5DopmCvRu', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-PH) WindowsPowerShell/5.1.19041.6456', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiaGs1dXBWS21KaXJrcmN5Qzc5OXpFVkFicXFYTzUwaW8yajJ3NUdxRiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6Mjc6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9sb2dpbiI7czo1OiJyb3V0ZSI7czo1OiJsb2dpbiI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1788224278),
('tGPgbM5Y8MWnuy4vlvLj1Qv1SbNIARb4WxoXHjGo', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-PH) WindowsPowerShell/5.1.19041.6456', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiSGprUVlIMlFmY0F1bjFIR1NNd1JycGQ3TmNxN3h3OFpyemtZaUVzNSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1788127374),
('UogOrXii9GakiAe8T7T2p827P7naLgRmS98V7akj', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-PH) WindowsPowerShell/5.1.19041.6456', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiODNVRGJxeFpZdTFHMHZRcmpRRjBxT1FOemRUNkRXVjkzazhHSUY0NiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1788127353);

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
(1, NULL, NULL, 'Chef Antonio', 'Aldrex M. Cordon', 'Kitchen Staff - Culinary', 'Front Desk Receptionist', 'Teamwork & Malasakit', 'Maintained peak efficiency and spotless kitchen line standards during the Saturday banquet rush.', 15, 8, 6, 4, '2026-08-21 22:50:16', '2026-08-21 22:50:16'),
(2, NULL, NULL, 'Maria Santos', 'Chef Marco Rossi', 'Front Desk Supervisor', 'Executive Sous Chef', 'Guest Delight', 'Personally crafted an exceptional off-menu gluten-free banquet dish for a VIP wedding party on 15 minutes notice.', 12, 5, 3, 1, '2026-08-21 22:50:16', '2026-08-21 22:50:16'),
(3, NULL, NULL, 'David Lee', 'Elena Vasquez', 'Guest Relations Manager', 'Concierge Executive', 'Going the Extra Mile', 'Coordinated emergency medical assistance and translated hospital documentation for an international guest during typhoon season.', 18, 9, 7, 5, '2026-08-21 22:50:16', '2026-08-21 22:50:16'),
(4, NULL, NULL, 'Ana Ramos', 'Gabriel Mendoza', 'HR Manager', 'Security Shift Lead', 'Integrity & Trust', 'Demonstrated total honesty and swift action by returning a misplaced diamond watch to the lost-and-found vault.', 10, 4, 2, 1, '2026-08-21 22:50:16', '2026-08-21 22:50:16');

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
  UNIQUE KEY `role_name` (`role_name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `system_roles`
--

INSERT INTO `system_roles` (`role_id`, `role_name`, `description`, `is_super_admin`, `is_protected`, `created_at`, `updated_at`) VALUES
(1, 'Super Admin', 'Full system access across all modules and settings', 1, 1, '2026-08-17 17:41:34', '2026-08-26 09:52:46'),
(2, 'Admin', 'HR admin: recruitment, onboarding, employee records, ESS approval', 0, 0, '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(3, 'Employee', 'Self-service portal access for employees', 0, 0, '2026-08-17 17:41:34', '2026-08-17 17:41:34');

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
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
(11, 'my_notifications_juan.delacruz@oxfordsuites.com.ph', '{\"Browser notifications\":false,\"Email notifications\":false,\"System announcements\":false}', NULL, '2026-08-18 11:10:32', '2026-08-24 17:58:31'),
(12, 'backup', '{\"enabled\":true,\"schedule\":\"daily\"}', NULL, '2026-08-24 17:12:28', '2026-08-24 17:12:28'),
(13, 'backups', '[{\"id\":\"BKP-3\",\"timestamp\":\"2026-08-25 01:17\",\"size\":\"267.8 KB\",\"type\":\"Manual\",\"filename\":\"BKP-3-20260825-011746.sql\"},{\"id\":\"BKP-2\",\"timestamp\":\"2026-08-25 01:15\",\"size\":\"267.7 KB\",\"type\":\"Automatic\",\"filename\":\"BKP-2-20260825-011508.sql\"},{\"id\":\"BKP-1\",\"timestamp\":\"2026-08-25 01:13\",\"size\":\"267.5 KB\",\"type\":\"Manual\",\"filename\":\"BKP-1-20260825-011328.sql\"}]', NULL, '2026-08-24 17:14:56', '2026-08-24 17:17:54'),
(15, 'my_notifications_kevin.delacruz@oxfordsuites.com.ph', '{\"Email notifications\":true,\"Browser notifications\":false,\"System announcements\":true}', 4, '2026-08-24 17:58:30', '2026-08-25 02:25:33'),
(16, 'my_notifications_rosa.aquino@oxfordsuites.com.ph', '{\"Browser notifications\":true,\"Email notifications\":false,\"System announcements\":false}', NULL, '2026-08-24 17:58:30', '2026-08-24 17:58:30'),
(17, 'my_notifications_ana.ramos@oxfordsuites.com.ph', '{\"Browser notifications\":true,\"Email notifications\":true,\"System announcements\":true}', NULL, '2026-08-24 17:58:31', '2026-08-24 17:58:31'),
(18, 'my_preferences_kevin.delacruz@oxfordsuites.com.ph', '{\"theme\":\"Dark\",\"language\":\"English\",\"dateFormat\":\"YYYY-MM-DD\",\"timeFormat\":\"24-hour\",\"timeZone\":\"Asia\\/Manila (GMT+8)\"}', 4, '2026-08-24 17:59:59', '2026-08-25 02:26:31'),
(19, 'my_preferences_rosa.aquino@oxfordsuites.com.ph', '{\"dateFormat\":\"DD\\/MM\\/YYYY\",\"timeZone\":\"Asia\\/Manila (GMT+8)\",\"language\":\"Filipino\",\"timeFormat\":\"12-hour\",\"theme\":\"Light\"}', NULL, '2026-08-24 17:59:59', '2026-08-24 17:59:59'),
(20, 'my_notifications_bullseur@oxfordsuites.com.ph', '{\"Email notifications\":true,\"Browser notifications\":true,\"System announcements\":true}', 1, '2026-08-29 17:40:03', '2026-08-29 17:40:08'),
(21, 'onboarding.auto_regularize_days', '180', NULL, '2026-08-30 16:28:37', '2026-08-31 02:00:40'),
(22, 'screening.configuration', '{\"passing_score\":75,\"required_skills_coverage_min\":0.6,\"criteria\":{\"Skills\":{\"weight\":40,\"enabled\":true},\"Work Experience\":{\"weight\":30,\"enabled\":true},\"Educational Background\":{\"weight\":20,\"enabled\":true},\"Certifications\":{\"weight\":10,\"enabled\":true}}}', NULL, '2026-08-30 19:12:40', '2026-08-30 19:55:26');

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
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `system_users`
--

INSERT INTO `system_users` (`system_user_id`, `username`, `email`, `password_hash`, `full_name`, `department_name`, `employee_id`, `role_id`, `status`, `otp_enabled`, `last_login_at`, `last_login_ip`, `created_at`, `updated_at`) VALUES
(1, 'bullseur', 'bullseur@oxfordsuites.com.ph', '$2y$12$ZvXS75gRgB9PmlQPui8Ao.bZlUnSW84Ric.DlKLS3o6DxWVIGjo3m', 'Bullseur Santiago', 'Administration / HR', NULL, 1, 'Active', 1, '2026-08-31 17:55:36', '127.0.0.1', '2026-08-17 17:41:34', '2026-08-31 17:55:36'),
(2, 'jdelacruz', 'juan.delacruz@oxfordsuites.com.ph', '$2y$12$ZvXS75gRgB9PmlQPui8Ao.bZlUnSW84Ric.DlKLS3o6DxWVIGjo3m', 'Juan Dela Cruz', 'Administration / HR', 7, 2, 'Active', 1, '2026-08-26 02:44:48', '127.0.0.1', '2026-08-17 17:41:34', '2026-08-26 02:44:48'),
(3, 'aramos', 'ana.ramos@oxfordsuites.com.ph', '$2y$12$j528H0H.yZIfbG2bx1sXYejFAFUkwTKi4sLs4G6ZVNn2vAK9knzxe', 'Ana Ramos', 'Front Office', 1, 2, 'Active', 0, '2026-09-02 00:11:47', '127.0.0.1', '2026-08-17 17:41:34', '2026-09-02 00:11:47'),
(4, 'kdelacruz', 'kevin.delacruz@oxfordsuites.com.ph', '$2y$12$q4fJK6wGGoqhARF8/jmLm.zmVBl9aAxpWjweSAuYavILNkKleZR5e', 'Kevin Dela Cruz', 'Kitchen / Culinary', 5, 3, 'Active', 0, '2026-08-29 17:07:57', '127.0.0.1', '2026-08-17 17:41:34', '2026-08-29 17:07:57'),
(5, 'mdevera', 'marjun.devera@oxfordsuites.com.ph', '$2y$12$ZvXS75gRgB9PmlQPui8Ao.bZlUnSW84Ric.DlKLS3o6DxWVIGjo3m', 'Marjun Devera', 'Food & Beverage', 6, 3, 'Suspended', 1, '2026-07-20 11:11:00', '10.0.4.101', '2026-08-17 17:41:34', '2026-08-23 17:17:32'),
(6, 'raquino', 'rosa.aquino@oxfordsuites.com.ph', '$2y$12$ZvXS75gRgB9PmlQPui8Ao.bZlUnSW84Ric.DlKLS3o6DxWVIGjo3m', 'Rosa Aquino', 'Housekeeping', 8, 3, 'Active', 1, '2026-07-25 22:03:00', '10.0.4.57', '2026-08-17 17:41:34', '2026-08-23 17:17:32'),
(7, 'mlim', 'maria.lim@oxfordsuites.com.ph', '$2y$12$ZvXS75gRgB9PmlQPui8Ao.bZlUnSW84Ric.DlKLS3o6DxWVIGjo3m', 'Maria Lim', 'Administration / HR', 11, 2, 'Active', 1, '2026-07-25 23:45:00', '192.168.10.18', '2026-08-17 17:41:34', '2026-08-23 17:17:32'),
(8, 'pcruz', 'paolo.cruz@oxfordsuites.com.ph', '$2y$12$ZvXS75gRgB9PmlQPui8Ao.bZlUnSW84Ric.DlKLS3o6DxWVIGjo3m', 'Paolo Cruz', 'Administration / HR', 12, 2, 'Active', 1, '2026-07-25 09:30:00', '192.168.10.12', '2026-08-17 17:41:34', '2026-08-23 17:17:32'),
(10, 'bcbc', 'bcbc@mga.com', '$2y$12$ZvXS75gRgB9PmlQPui8Ao.bZlUnSW84Ric.DlKLS3o6DxWVIGjo3m', 'bcbc', 'Food & Beverage', NULL, 3, 'Active', 1, NULL, NULL, '2026-08-18 10:43:08', '2026-08-23 17:17:32'),
(11, 'admin-img2', 'ADMIN-img2@gmail.com', '$2y$12$ZvXS75gRgB9PmlQPui8Ao.bZlUnSW84Ric.DlKLS3o6DxWVIGjo3m', 'ADMIN-img2', 'Food & Beverage', NULL, 3, 'Active', 1, NULL, NULL, '2026-08-18 10:44:41', '2026-08-30 18:00:27'),
(12, 'f1', 'f1@gmail.com', '$2y$12$ZvXS75gRgB9PmlQPui8Ao.bZlUnSW84Ric.DlKLS3o6DxWVIGjo3m', 'f1', 'Food & Beverage', NULL, 3, 'Active', 1, NULL, NULL, '2026-08-18 10:48:14', '2026-08-23 17:17:32'),
(13, 'kevin.santos', 'kevin.santos@oxfordsuites.com.ph', '$2y$12$ZvXS75gRgB9PmlQPui8Ao.bZlUnSW84Ric.DlKLS3o6DxWVIGjo3m', 'kevin.santos', NULL, NULL, 3, 'Active', 1, NULL, NULL, '2026-08-18 10:50:19', '2026-08-23 17:17:32'),
(14, 'hahakdog', 'hahakdoghahalaman890@gmail.com', '$2y$12$ZvXS75gRgB9PmlQPui8Ao.bZlUnSW84Ric.DlKLS3o6DxWVIGjo3m', 'Andrew e', 'Administration / HR', NULL, 1, 'Active', 1, '2026-08-23 12:55:25', '127.0.0.1', '2026-08-22 11:57:47', '2026-08-23 12:55:25'),
(15, 'naniboogsh', 'naniboogsh890123@gmail.com', '$2y$12$ZvXS75gRgB9PmlQPui8Ao.bZlUnSW84Ric.DlKLS3o6DxWVIGjo3m', 'Nani Boogsh', 'Administration / HR', NULL, 3, 'Active', 1, '2026-08-23 12:53:42', '127.0.0.1', '2026-08-22 11:57:47', '2026-08-23 12:53:42'),
(16, 'juniorespe', 'juniorespenapogi@gmail.com', '$2y$12$ZvXS75gRgB9PmlQPui8Ao.bZlUnSW84Ric.DlKLS3o6DxWVIGjo3m', 'Juniorespe Napogi', 'Administration / HR', NULL, 2, 'Active', 1, NULL, NULL, '2026-08-22 12:10:37', '2026-08-23 17:17:32'),
(18, 'vincent.soriano.hotel', 'vincent.soriano.hotel@gmail.com', '$2y$12$m0u9e2TfJLR69B1FNdzVCuE6UOWxcAJbhM/uzFiUOOmQr3dutCDqK', 'Vincent Paul Soriano', 'Front Office', NULL, 3, 'Active', 1, NULL, NULL, '2026-08-31 12:52:45', '2026-08-31 12:52:45'),
(19, 'carlo.fernandez.chef', 'carlo.fernandez.chef@gmail.com', '$2y$12$RdWReKtPIYnXjmyqFO5cAutSWeNQFY7w9EB/KJpumQb/ew4eGE6T.', 'CARLO MIGUEL FERNAN', 'Kitchen / Culinary', NULL, 3, 'Active', 1, NULL, NULL, '2026-08-31 12:58:49', '2026-08-31 12:58:49'),
(20, 'bianca.soriano', 'bianca.soriano@email.com', '$2y$12$T8VTJvE2u0hwJ5DUpzrLO.TEMNLLFqOxVjOTAjgFShuf1gkohaB/C', 'Bianca Soriano', 'Food & Beverage', NULL, 3, 'Active', 1, NULL, NULL, '2026-09-02 00:04:21', '2026-09-02 00:04:21'),
(21, 'camille.evangelista.spa', 'camille.evangelista.spa@gmail.com', '$2y$12$OdAtq7mOqv0jlfrNvjWMKu/0a17O5Gwd9kAmNIwrFUNyqQFkfmxHq', 'Camille Rose Evangelista', 'Front Office', NULL, 3, 'Active', 1, NULL, NULL, '2026-09-02 00:05:36', '2026-09-02 00:05:36');

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
) ENGINE=InnoDB AUTO_INCREMENT=139 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
(14, 2, '2026-08-24 03:39:24', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'success'),
(15, 4, '2026-08-24 17:35:26', '127.0.0.1', 'Unknown device', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.19041.1', 'success'),
(16, 4, '2026-08-24 17:57:49', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'success'),
(17, 4, '2026-08-24 17:57:59', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'success'),
(18, 4, '2026-08-24 18:53:55', '127.0.0.1', 'Unknown device', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.19041.1', 'success'),
(19, 4, '2026-08-24 18:53:57', '127.0.0.1', 'Unknown device', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.19041.1', 'success'),
(20, 4, '2026-08-24 19:24:46', '127.0.0.1', 'Unknown device', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.19041.1', 'success'),
(21, 3, '2026-08-24 19:24:47', '127.0.0.1', 'Unknown device', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.19041.1', 'success'),
(22, 4, '2026-08-24 19:25:56', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'success'),
(23, 4, '2026-08-24 20:30:10', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'success'),
(24, 4, '2026-08-24 20:30:23', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'success'),
(25, 4, '2026-08-24 20:32:46', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'success'),
(26, 3, '2026-08-24 20:33:02', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'success'),
(27, 3, '2026-08-24 20:34:07', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'success'),
(28, 3, '2026-08-24 20:43:53', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'success'),
(29, 4, '2026-08-24 20:50:06', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'success'),
(30, 4, '2026-08-25 02:29:28', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'success'),
(31, 4, '2026-08-25 02:30:03', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'success'),
(32, 3, '2026-08-25 02:30:26', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'success'),
(33, 3, '2026-08-25 02:31:15', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'success'),
(34, 4, '2026-08-25 02:57:22', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'success'),
(35, 1, '2026-08-25 03:01:58', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'success'),
(36, 3, '2026-08-25 03:09:22', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'success'),
(37, 4, '2026-08-25 03:12:01', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'success'),
(38, 4, '2026-08-25 04:24:38', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'success'),
(39, 1, '2026-08-25 06:04:35', '127.0.0.1', 'Unknown device', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.19041.1', 'success'),
(40, 1, '2026-08-25 06:31:29', '127.0.0.1', 'Unknown device', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.19041.1', 'success'),
(41, 3, '2026-08-25 11:45:39', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'success'),
(42, 3, '2026-08-25 15:25:07', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'success'),
(43, 3, '2026-08-25 16:37:02', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'success'),
(44, 3, '2026-08-26 01:32:38', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'success'),
(45, 1, '2026-08-26 01:33:23', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'success'),
(46, 4, '2026-08-26 01:33:44', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'success'),
(47, 1, '2026-08-26 01:35:02', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'success'),
(48, 4, '2026-08-26 01:35:36', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'success'),
(49, 1, '2026-08-26 02:03:23', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'success'),
(50, 3, '2026-08-26 02:03:59', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'success'),
(51, 2, '2026-08-26 02:44:48', '127.0.0.1', 'Unknown device', 'curl/7.55.1', 'success'),
(52, 3, '2026-08-26 02:54:01', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'success'),
(53, 1, '2026-08-26 02:58:33', '127.0.0.1', 'Unknown device', 'curl/7.55.1', 'success'),
(54, 3, '2026-08-26 03:04:12', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'success'),
(55, 4, '2026-08-26 03:04:58', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'success'),
(56, 3, '2026-08-26 03:06:08', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'success'),
(57, 4, '2026-08-26 03:06:14', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'success'),
(58, 3, '2026-08-26 03:27:22', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'success'),
(59, 4, '2026-08-26 04:22:36', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'success'),
(60, 3, '2026-08-26 04:23:32', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'success'),
(61, 4, '2026-08-26 04:31:21', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'success'),
(62, 4, '2026-08-26 04:31:31', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'success'),
(63, 3, '2026-08-26 04:33:58', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'success'),
(64, 4, '2026-08-26 04:48:09', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'success'),
(65, 3, '2026-08-26 04:48:55', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'success'),
(66, 4, '2026-08-26 05:08:35', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'success'),
(67, 4, '2026-08-26 05:13:10', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'success'),
(68, 3, '2026-08-26 05:13:24', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'success'),
(69, 3, '2026-08-26 05:13:34', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'success'),
(70, 1, '2026-08-26 05:18:59', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'success'),
(71, 3, '2026-08-26 05:24:32', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'success'),
(72, 3, '2026-08-26 06:20:55', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'success'),
(73, 3, '2026-08-26 06:43:28', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'success'),
(74, 3, '2026-08-26 07:07:54', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'success'),
(75, 3, '2026-08-26 07:34:39', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'success'),
(76, 3, '2026-08-26 07:38:54', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'success'),
(77, 4, '2026-08-26 07:39:09', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'success'),
(78, 3, '2026-08-26 07:41:12', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'success'),
(79, 4, '2026-08-26 07:50:53', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'success'),
(80, 3, '2026-08-26 07:51:35', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'success'),
(81, 3, '2026-08-26 08:19:12', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'success'),
(82, 3, '2026-08-26 08:25:17', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'success'),
(83, 4, '2026-08-29 12:07:02', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', 'success'),
(84, 3, '2026-08-29 12:07:12', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', 'success'),
(85, 4, '2026-08-29 12:07:22', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', 'success'),
(86, 3, '2026-08-29 12:07:27', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', 'success'),
(87, 1, '2026-08-29 12:08:32', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', 'success'),
(88, 1, '2026-08-29 13:14:48', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', 'success'),
(89, 4, '2026-08-29 13:15:28', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', 'success'),
(90, 1, '2026-08-29 13:25:52', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', 'success'),
(91, 4, '2026-08-29 13:27:00', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', 'success'),
(92, 3, '2026-08-29 13:36:38', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', 'success'),
(93, 4, '2026-08-29 13:39:30', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', 'success'),
(94, 3, '2026-08-29 13:39:53', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', 'success'),
(95, 3, '2026-08-29 13:39:57', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', 'success'),
(96, 4, '2026-08-29 13:41:35', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', 'success'),
(97, 3, '2026-08-29 14:07:43', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', 'success'),
(98, 3, '2026-08-29 14:07:44', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', 'success'),
(99, 3, '2026-08-29 14:07:44', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', 'success'),
(100, 4, '2026-08-29 14:14:21', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', 'success'),
(101, 3, '2026-08-29 14:15:44', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', 'success'),
(102, 4, '2026-08-29 14:25:10', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', 'success'),
(103, 3, '2026-08-29 14:45:03', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', 'success'),
(104, 4, '2026-08-29 14:53:41', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', 'success'),
(105, 3, '2026-08-29 14:55:25', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', 'success'),
(106, 3, '2026-08-29 15:13:43', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', 'success'),
(107, 3, '2026-08-29 15:14:54', '127.0.0.1', 'Edge on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0', 'success'),
(108, 4, '2026-08-29 15:19:07', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', 'success'),
(109, 3, '2026-08-29 15:19:12', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', 'success'),
(110, 4, '2026-08-29 15:19:19', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', 'success'),
(111, 3, '2026-08-29 16:05:50', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', 'success'),
(112, 4, '2026-08-29 16:08:48', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', 'success'),
(113, 3, '2026-08-29 16:37:23', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', 'success'),
(114, 4, '2026-08-29 17:07:57', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', 'success'),
(115, 1, '2026-08-29 17:08:52', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', 'success'),
(116, 3, '2026-08-30 14:07:38', '127.0.0.1', 'Unknown device', 'curl/8.13.0', 'success'),
(117, 1, '2026-08-30 14:11:51', '127.0.0.1', 'Unknown device', 'curl/8.13.0', 'success'),
(118, 1, '2026-08-30 15:05:11', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', 'success'),
(119, 3, '2026-08-30 15:10:20', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', 'success'),
(120, 1, '2026-08-30 15:22:25', '127.0.0.1', 'Unknown device', 'curl/8.13.0', 'success'),
(121, 1, '2026-08-30 15:25:35', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', 'success'),
(122, 3, '2026-08-30 16:11:37', '127.0.0.1', 'Unknown device', 'curl/8.13.0', 'success'),
(123, 1, '2026-08-30 16:27:33', '127.0.0.1', 'Unknown device', 'curl/8.13.0', 'success'),
(124, 1, '2026-08-30 17:23:20', '127.0.0.1', 'Unknown device', 'curl/8.13.0', 'success'),
(125, 1, '2026-08-30 19:10:39', '127.0.0.1', 'Unknown device', 'curl/8.13.0', 'success'),
(126, 1, '2026-08-30 19:48:40', '127.0.0.1', 'Unknown device', 'curl/8.13.0', 'success'),
(127, 1, '2026-08-30 20:28:23', '127.0.0.1', 'Unknown device', 'curl/8.13.0', 'success'),
(128, 3, '2026-08-31 10:42:06', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', 'success'),
(129, 1, '2026-08-31 17:55:37', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', 'success'),
(130, 3, '2026-09-01 17:44:29', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', 'success'),
(131, 3, '2026-09-01 18:17:17', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', 'success'),
(132, 3, '2026-09-01 18:32:55', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', 'success'),
(133, 3, '2026-09-01 18:36:24', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', 'success'),
(134, 3, '2026-09-01 19:02:04', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', 'success'),
(135, 3, '2026-09-01 20:37:05', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', 'success'),
(136, 3, '2026-09-01 21:04:47', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', 'success'),
(137, 3, '2026-09-01 22:08:30', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', 'success'),
(138, 3, '2026-09-02 00:11:47', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', 'success');

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
