SET FOREIGN_KEY_CHECKS = 0;
-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Aug 26, 2026 at 06:35 PM
-- Server version: 10.4.27-MariaDB
-- PHP Version: 8.2.0

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

DROP TABLE IF EXISTS `announcements`;
CREATE TABLE `announcements` (
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

DROP TABLE IF EXISTS `applicants`;
CREATE TABLE `applicants` (
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
) ENGINE=InnoDB AUTO_INCREMENT=50 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
(10, 'APP-1041', 1, 'Bianca Soriano', 'bianca.soriano@email.com', '0912 345 6789', '2026-07-25 07:15:00', 96.00, 'fit', 'Interview Scheduled', 'Online Portal', '/uploads/resumes/bianca_soriano_resume.pdf', NULL, 'Three years front office experience at a 4-star property, PMS proficient, complete credentials.', '[]', '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(15, 'APL-01042', 1, 'juan', 'juan@gmail.com', '0912312300', '2026-08-18 11:55:43', 92.00, 'fit', 'Interview Scheduled', 'Online Portal', 'resumes/uQMocQfpx2nSlMO6oXThxQGf7HMS7KgGvf2257pJ.pdf', NULL, 'Added via document screening — GE.pdf.', NULL, '2026-08-18 03:55:43', '2026-08-18 04:04:08'),
(16, 'APL-01043', 1, 'im1', 'im1@gmail.com', '0912312300', '2026-08-18 12:03:17', 80.00, 'fit', 'Offer', 'Walk-in', 'resumes/wOSR1iTpehXQSrBS4GedkAGjzkHM6ag19Md6bHSM.png', NULL, 'Added via image (OCR) screening — war.png.', NULL, '2026-08-18 04:03:17', '2026-08-18 09:51:00'),
(17, 'APL-01044', 1, 'ADMIN-file1', 'ADMIN-file1@gmail.com', '0912312300', '2026-08-18 13:33:35', 95.00, 'fit', 'Interview Scheduled', 'Online Portal', 'resumes/6e1gYz92oDu5oO4730OMhtf5wHiImdyDp1m0i9ue.pdf', NULL, 'Added via document screening — cover (1).pdf.', NULL, '2026-08-18 05:33:35', '2026-08-18 05:41:23'),
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
(34, 'APL-01057', 16, 'MARIA ANGELA SANTOS', 'maria.santos.hospitality@gmail.com', '09172456183', '2026-08-25 20:11:13', 100.00, 'fit', 'Screened', 'Online Portal', 'resumes/OsWIuRb88xSIB9f9uXLpdScTXz5FD7QZhMWNVyWM.pdf', NULL, 'Matched skills: Cash Handling, Check-in / Check-out, Guest Relations, Property Management Systems, Reservations; Education requirement satisfied; Experience requirement satisfied (5.0 yrs vs 1.0 yrs required); No certification requirements defined for this role — meets Front Desk Receptionist requirements.', '[\"Unrecognized skill: Payment Processing\",\"Unrecognized job role: Hotel Front Desk Associate\",\"Unrecognized job role: confirm satisfaction\"]', '2026-08-25 12:11:13', '2026-08-25 12:11:13'),
(35, 'APL-01058', 16, 'Marielle Anne Santos', 'marielle.santos.fbcontrol@gmail.com', '09186632947', '2026-08-25 20:58:53', 72.00, 'not-fit', 'Screened', 'Online Portal', 'resumes/QcyyG24q07YuzWghzVTF0ZiJoYQEaPIjcse2oUdF.pdf', NULL, 'Education requirement satisfied; Experience requirement satisfied (7.5 yrs vs 1.0 yrs required); No certification requirements defined for this role — meets Front Desk Receptionist requirements. No available position achieved the required qualification level.', '[\"Unrecognized skill: Basic\",\"Unrecognized skill: Cost Accounting\",\"Unrecognized skill: Cross-Functional Team Coordination\",\"Unrecognized skill: MarketMan\",\"Unrecognized skill: Materials Control Software\",\"Unrecognized skill: Physical Inventory Counting\",\"Unrecognized skill: Supplier Delivery Verification\",\"Unrecognized skill: Waste & Spoilage Tracking\",\"Unrecognized job role: Caf\\u00e9 Verano Manila\",\"Unrecognized job role: retraining\"]', '2026-08-25 12:58:53', '2026-08-25 12:58:53'),
(36, 'APL-01059', 16, 'NICOLE FRANCES HERRERA', 'nicole.herrera.recreation@gmail.com', '09196781234', '2026-08-25 21:00:33', 83.20, 'other-role', 'Screened', 'Online Portal', 'resumes/E789K4ueKMncdcwZUm0d2OTLJa0OAqvVRt8AvikA.pdf', NULL, 'Matched skills: Check-in / Check-out, Guest Relations; Education requirement satisfied; Experience requirement satisfied (5.0 yrs vs 1.0 yrs required); No certification requirements defined for this role — meets Front Desk Receptionist requirements.', '[\"Unrecognized job role: Hotel Recreation and Activities Coordinator\",\"Stronger match: Bartender (88.8%)\"]', '2026-08-25 13:00:33', '2026-08-25 13:00:33'),
(37, 'APL-01060', 16, 'PATRICIA ANNE MENDOZA', 'patriciamendoza.hr@example.cor', '09174821936', '2026-08-25 21:02:20', 72.00, 'not-fit', 'Screened', 'Walk-in', 'resumes/SkNcb7oYfeOmuMpdkWxP537hMbD5Z9g6gCvlOVig.png', NULL, 'Education requirement satisfied; Experience requirement satisfied (5.9 yrs vs 1.0 yrs required); No certification requirements defined for this role — meets Front Desk Receptionist requirements. No available position achieved the required qualification level.', '[]', '2026-08-25 13:02:20', '2026-08-25 13:02:20'),
(38, 'APL-01061', 16, 'RAFAEL DOMINIC LIM', 'rafael.lim.fnb@gmail.com', '09184567890', '2026-08-25 21:04:12', 77.60, 'not-fit', 'Screened', 'Walk-in', 'resumes/MXXrhii8YalTsD7kT6No86l27JXnKNIwenZwtDBD.jpg', NULL, 'Matched skills: Cash Handling; Education requirement satisfied; Experience requirement satisfied (5.8 yrs vs 1.0 yrs required); No certification requirements defined for this role — meets Front Desk Receptionist requirements. No available position achieved the required qualification level.', '[\"Unrecognized job role: Beverage Service Specialist\",\"Unrecognized job role: The Marigold Hotel Restaurant\",\"Unrecognized job role: in monthly incremental revenue\"]', '2026-08-25 13:04:12', '2026-08-25 13:04:13'),
(39, 'APL-01062', 16, 'Roberto James Castillo', 'roberto.castillo.laundry@gmail.com', '09193375502', '2026-08-25 21:13:41', 62.00, 'not-fit', 'Screened', 'Online Portal', 'resumes/L5bWDLh1mJreR6s5PHknU2dIFUlTAR1DjssSpeOa.docx', NULL, 'Experience requirement satisfied (7.5 yrs vs 1.0 yrs required); No certification requirements defined for this role — meets Front Desk Receptionist requirements. No available position achieved the required qualification level.', '[\"Unrecognized skill: Hygiene\",\"Unrecognized skill: Laundry Quality Control\",\"Unrecognized skill: Staff Supervision\",\"Unrecognized skill: Team Leadership\",\"Unrecognized skill: Uniform Management\"]', '2026-08-25 13:13:41', '2026-08-25 13:13:41'),
(40, 'APL-01063', 16, 'Roberto James Castillo', 'roberto.castillo.laundry@gmail.com', '09193375502', '2026-08-25 21:20:15', 62.00, 'not-fit', 'Screened', 'Online Portal', 'resumes/EyvXKY3tZjAz63gu1Q0bgfn6C9xG77SVczgUSFZF.docx', NULL, 'Experience requirement satisfied (7.5 yrs vs 1.0 yrs required); No certification requirements defined for this role — meets Front Desk Receptionist requirements. No available position achieved the required qualification level.', '[\"Unrecognized skill: Hygiene\",\"Unrecognized skill: Laundry Quality Control\",\"Unrecognized skill: Staff Supervision\",\"Unrecognized skill: Team Leadership\",\"Unrecognized skill: Uniform Management\"]', '2026-08-25 13:20:15', '2026-08-25 13:20:15'),
(41, 'APL-01064', 16, 'Samantha Nicole Dela Cruz', 'samantha.delacruz.fnb@gmail.com', '09186642317', '2026-08-25 21:20:53', 83.20, 'not-fit', 'Screened', 'Online Portal', 'resumes/jXVxN4fGBILIhFbng3vhXSAb65KlMmqGQ1CcASVk.pdf', NULL, 'Matched skills: Cash Handling, Guest Relations; Education requirement satisfied; Experience requirement satisfied (7.5 yrs vs 1.0 yrs required); No certification requirements defined for this role — meets Front Desk Receptionist requirements. No available position achieved the required qualification level.', '[\"Unrecognized job role: Copper & Vine Restaurant and Lounge\",\"Unrecognized job role: The Ember Room, Aurelia Hotel Manila\"]', '2026-08-25 13:20:53', '2026-08-25 13:20:53'),
(42, 'APL-01065', 16, 'Vincent Paul Soriano', 'vincent.soriano.hotel@gmail.com', '09172458813', '2026-08-25 21:42:45', 100.00, 'fit', 'Screened', 'Online Portal', 'resumes/YVPqKQsG9a36IIZNZ7oSgKdxWFAIRbafZqBiKFK0.docx', 'Vincent_Paul_Soriano_Night_Auditor.docx', 'Matched skills: Cash Handling, Check-in / Check-out, Guest Relations, Property Management Systems, Reservations; Education requirement satisfied; Experience requirement satisfied (5.0 yrs vs 1.0 yrs required); No certification requirements defined for this role — meets Front Desk Receptionist requirements.', '[\"Unrecognized skill: Cash Reconciliation\",\"Unrecognized skill: Hotel Reservation Systems\",\"Unrecognized skill: Night Audit Procedures\",\"Unrecognized skill: Payment Processing\",\"Unrecognized job role: Front Desk Associate\",\"Unrecognized job role: Hotel Night Auditor\"]', '2026-08-25 13:42:45', '2026-08-25 13:42:45'),
(43, 'APL-01066', 16, 'ANGELA MARIE CRUZ', 'angela.cruz.fnb@gmail.com', '09063728841', '2026-08-25 21:45:32', 57.60, 'not-fit', 'Screened', 'Walk-in', 'resumes/oK2JmshYE5YjMS72pCehD2001Hr7glSkBIVMJfWr.png', 'Angela_Cruz_Restaurant_Server_Resume.png', 'Matched skills: Cash Handling; Experience requirement satisfied (3.75 yrs vs 1.0 yrs required); No certification requirements defined for this role — meets Front Desk Receptionist requirements. No available position achieved the required qualification level.', '[\"Unrecognized job role: Cloudwater Coffee Roasters\"]', '2026-08-25 13:45:32', '2026-08-25 13:45:32'),
(44, 'APL-01067', 16, 'Bianca Louise Garcia', 'bianca.garcia.qa@gmail.com', '09186624471', '2026-08-25 21:47:37', 72.00, 'not-fit', 'Screened', 'Online Portal', 'resumes/z8IdXBsIbq5v0xGoMXxDTUCywQBCvT5Y9ijLhly0.docx', 'Bianca_Louise_Garcia_QA_Food_Safety.docx', 'Education requirement satisfied; Experience requirement satisfied (6.25 yrs vs 1.0 yrs required); No certification requirements defined for this role — meets Front Desk Receptionist requirements. No available position achieved the required qualification level.', '[\"Unrecognized skill: Food Handling Standards\",\"Unrecognized skill: Internal Auditing\",\"Unrecognized skill: Quality Assurance\",\"Unrecognized skill: Restaurant Compliance\",\"Unrecognized job role: Food Safety Officer\",\"Unrecognized job role: Restaurant Quality Assurance Officer\"]', '2026-08-25 13:47:37', '2026-08-25 13:47:37'),
(45, 'APL-01068', 16, 'ALYSSA MARIE', '5678alyssa.valdez.spa@gmail.com', '09172345678', '2026-08-26 02:04:44', 100.00, 'fit', 'Screened', 'Online Portal', 'resumes/tf2QxEZ8CkmibdYeEzPvRfAlPriNqxxGE0d9nMUn.pdf', 'Alyssa_Marie_Valdez_Spa_Wellness_Receptionist.pdf', 'Matched skills: Cash Handling, Check-in / Check-out, Guest Relations, Property Management Systems, Reservations; Education requirement satisfied; Experience requirement satisfied (3.75 yrs vs 1.0 yrs required); No certification requirements defined for this role — meets Front Desk Receptionist requirements.', '[\"Unrecognized skill: Payment Processing\",\"Unrecognized skill: Spa Reception\",\"Unrecognized job role: Spa Front Desk Associate\"]', '2026-08-25 18:04:44', '2026-08-25 18:04:46'),
(46, 'APL-01069', 16, 'Vincent Paul Soriano', 'vincent.soriano.hotel@gmail.com', '09172458813', '2026-08-26 02:33:18', 100.00, 'fit', 'Screened', 'Online Portal', 'resumes/6Pl9O0xaU2b7fZD9PrKz5ukMFETrw1OSjHLHplbU.pdf', 'Vincent_Paul_Soriano_Night_Auditor.pdf', 'Matched skills: Cash Handling, Check-in / Check-out, Guest Relations, Property Management Systems, Reservations; Education requirement satisfied; Experience requirement satisfied (5.0 yrs vs 1.0 yrs required); No certification requirements defined for this role — meets Front Desk Receptionist requirements.', '[\"Unrecognized skill: Cash Reconciliation\",\"Unrecognized skill: Hotel Reservation Systems\",\"Unrecognized skill: Night Audit Procedures\",\"Unrecognized skill: Payment Processing\",\"Unrecognized job role: Bayview Suites & Residences\",\"Unrecognized job role: Hotel Night Auditor\",\"Unrecognized job role: with on-duty staff\"]', '2026-08-25 18:33:18', '2026-08-25 18:33:18'),
(47, 'APP-01042', 16, 'Test Applicant', 'test.applicant.1787743495635@example.com', '09171234567', '2026-08-26 03:24:58', NULL, 'fit', 'Screened', 'Landing Page', NULL, NULL, '', NULL, '2026-08-26 03:24:58', '2026-08-26 03:24:58');

-- --------------------------------------------------------

--
-- Table structure for table `applicant_assessments`
--

DROP TABLE IF EXISTS `applicant_assessments`;
CREATE TABLE `applicant_assessments` (
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

DROP TABLE IF EXISTS `applicant_screenings`;
CREATE TABLE `applicant_screenings` (
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
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
(21, 46, 16, 'PARTIALLY_PROCESSED', 'fit', 100.00, '{\"skills\":{\"weight\":0.4,\"earned\":40,\"max\":40,\"matched_required\":[\"Cash Handling\",\"Check-in \\/ Check-out\",\"Guest Relations\",\"Property Management Systems\",\"Reservations\"],\"fuzzy_matched_required\":[],\"missing_required\":[],\"matched_preferred\":[],\"missing_preferred\":[],\"required_coverage\":1,\"preferred_coverage\":1},\"experience\":{\"weight\":0.3,\"earned\":30,\"max\":30,\"estimated_years\":5,\"min_years_required\":1,\"requirement_met\":true},\"education\":{\"weight\":0.2,\"earned\":20,\"max\":20,\"applicant_highest_level\":[\"Bachelor of Science in Hospitality Management - Philippine School of Business Admin\"],\"required_level\":\"Bachelor\'s Degree\",\"requirement_met\":true},\"certifications\":{\"weight\":0.1,\"earned\":10,\"max\":10,\"matched\":[],\"missing\":[],\"no_requirements\":true}}', '{\"personal_information\":{\"name\":\"Vincent Paul Soriano\",\"email\":\"vincent.soriano.hotel@gmail.com\",\"phone\":\"+63 917 245 8813\",\"address\":\"Blk 14 Lot 7, Sampaguita St., Brgy. San Isidro, Manila, Philippines\"},\"education\":[\"Bachelor of Science in Hospitality Management - Philippine School of Business Admin\"],\"work_experience\":[{\"job_title\":\"Hotel Night Auditor\",\"company\":\"Hotel Night Auditor\",\"location\":null,\"period\":\"March 2023 - Present\",\"recognized_role\":false},{\"job_title\":\"with on-duty staff\",\"company\":\"Front Desk Associate\",\"location\":null,\"period\":\"June 2021 - February 2023\",\"recognized_role\":false},{\"job_title\":\"Bayview Suites & Residences\",\"company\":\"Accounts Assistant\",\"location\":null,\"period\":\"August 2020 - May 2021\",\"recognized_role\":false}],\"skills\":[\"Attention to Detail\",\"Cash Handling\",\"Check-in \\/ Check-out\",\"Customer Service\",\"Front Office Operations\",\"Guest Relations\",\"Housekeeping Operations\",\"MS Office\",\"POS Systems\",\"Problem Solving\",\"Property Management Systems\",\"Records Documentation\",\"Reservations\",\"Time Management\"],\"certifications\":[\"Basic Bookkeeping And Accounting Training\",\"Customer Service Excellence Training - Manila Tourism Training\",\"Hotel Front Office Operations Training\",\"Microsoft Excel For Financial Reporting - Online Certification\"],\"unrecognized_certifications\":[\"Basic Bookkeeping And Accounting Training\",\"Customer Service Excellence Training - Manila Tourism Training\",\"Hotel Front Office Operations Training\",\"Microsoft Excel For Financial Reporting - Online Certification\"],\"estimated_years_experience\":5,\"job_roles\":{\"recognized\":[],\"unrecognized\":[\"Bayview Suites & Residences\",\"Hotel Night Auditor\",\"with on-duty staff\"]},\"unrecognized_skills\":[\"Cash Reconciliation\",\"Hotel Reservation Systems\",\"Night Audit Procedures\",\"Payment Processing\"]}', '[{\"label\":\"PERSON\",\"value\":\"Vincent Paul Soriano\",\"source\":\"rule\"},{\"label\":\"EDUCATION\",\"value\":\"Bachelor of Science in Hospitality Management - Philippine School of Business Admin\",\"source\":\"section_rule\"},{\"label\":\"JOB_TITLE\",\"value\":\"Hotel Night Auditor\",\"source\":\"section_rule\"},{\"label\":\"JOB_TITLE\",\"value\":\"with on-duty staff\",\"source\":\"section_rule\"},{\"label\":\"JOB_TITLE\",\"value\":\"Bayview Suites & Residences\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Night Audit Procedures\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Front Office Operations\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Cash Reconciliation\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Hotel Reservation Systems\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Guest Relations\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Payment Processing\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Check-in \\/ Check-out\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Records Documentation\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Attention to Detail\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Problem Solving\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Time Management\",\"source\":\"section_rule\"},{\"label\":\"SKILL\",\"value\":\"Cash Handling\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Customer Service\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Housekeeping Operations\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"MS Office\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"POS Systems\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Property Management Systems\",\"source\":\"reference_scan\"},{\"label\":\"SKILL\",\"value\":\"Reservations\",\"source\":\"reference_scan\"},{\"label\":\"CERTIFICATION\",\"value\":\"Hotel Front Office Operations Training\",\"source\":\"hint_pattern\"},{\"label\":\"CERTIFICATION\",\"value\":\"Basic Bookkeeping And Accounting Training\",\"source\":\"hint_pattern\"},{\"label\":\"CERTIFICATION\",\"value\":\"Customer Service Excellence Training - Manila Tourism Training\",\"source\":\"hint_pattern\"},{\"label\":\"CERTIFICATION\",\"value\":\"Microsoft Excel For Financial Reporting - Online Certification\",\"source\":\"hint_pattern\"},{\"label\":\"ORGANIZATION\",\"value\":\"Hotel Night Auditor\",\"source\":\"section_rule\"},{\"label\":\"ORGANIZATION\",\"value\":\"Front Desk Associate\",\"source\":\"section_rule\"},{\"label\":\"ORGANIZATION\",\"value\":\"Accounts Assistant\",\"source\":\"section_rule\"},{\"label\":\"ORGANIZATION\",\"value\":\"Opera PMS\",\"source\":\"section_rule\"},{\"label\":\"ORGANIZATION\",\"value\":\"Bayview Suites & Residences\",\"source\":\"section_rule\"},{\"label\":\"EMAIL\",\"value\":\"vincent.soriano.hotel@gmail.com\",\"source\":\"regex\"},{\"label\":\"PHONE\",\"value\":\"+63 917 245 8813\",\"source\":\"regex\"}]', '[]', '{\"missing_information\":[],\"invalid_format\":[],\"skill_analysis\":{\"recognized\":[\"Attention to Detail\",\"Cash Handling\",\"Check-in \\/ Check-out\",\"Customer Service\",\"Front Office Operations\",\"Guest Relations\",\"Housekeeping Operations\",\"MS Office\",\"POS Systems\",\"Problem Solving\",\"Property Management Systems\",\"Records Documentation\",\"Reservations\",\"Time Management\"],\"unrecognized\":[\"Cash Reconciliation\",\"Hotel Reservation Systems\",\"Night Audit Procedures\",\"Payment Processing\"]},\"job_role_analysis\":{\"recognized\":[],\"unrecognized\":[\"Bayview Suites & Residences\",\"Hotel Night Auditor\",\"with on-duty staff\"]},\"credential_analysis\":[{\"required\":null,\"extracted\":\"Basic Bookkeeping And Accounting Training\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"},{\"required\":null,\"extracted\":\"Customer Service Excellence Training - Manila Tourism Training\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"},{\"required\":null,\"extracted\":\"Hotel Front Office Operations Training\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"},{\"required\":null,\"extracted\":\"Microsoft Excel For Financial Reporting - Online Certification\",\"status\":\"UNRECOGNIZED\",\"note\":\"Invalid or requires verification based on system validation rules.\"}],\"credential_issues\":[],\"review_flags\":[{\"type\":\"UNRECOGNIZED_JOB_ROLE\",\"detail\":\"Bayview Suites & Residences\",\"note\":\"Not found in system reference data; flagged for manual review only.\"},{\"type\":\"UNRECOGNIZED_JOB_ROLE\",\"detail\":\"Hotel Night Auditor\",\"note\":\"Not found in system reference data; flagged for manual review only.\"},{\"type\":\"UNRECOGNIZED_JOB_ROLE\",\"detail\":\"with on-duty staff\",\"note\":\"Not found in system reference data; flagged for manual review only.\"}]}', NULL, '[\"Overall match score 100.0% reached the required threshold of 75.0% for Front Desk Receptionist.\",\"Matched required skills: Cash Handling, Check-in \\/ Check-out, Guest Relations, Property Management Systems, Reservations.\",\"Education requirement met: True; experience requirement met: True (5.0 yrs vs 1.0 yrs minimum).\"]', '{\"base_model\":\"en_core_web_sm\",\"custom_ner_loaded\":true,\"custom_ner_path\":\"C:\\\\Users\\\\Windows 10 Lite\\\\Downloads\\\\MUNJOR\\\\4TH YR\\\\DEV\\\\LATEST CLONE\\\\v5\\\\2nd-repo-for-hrms-backend-\\\\nlp-service\\\\models_spacy\\\\role_specific_ner\"}', NULL, '2026-08-25 18:33:18', '2026-08-25 18:33:18', '2026-08-25 18:33:18');

-- --------------------------------------------------------

--
-- Table structure for table `applicant_screening_entities`
--

DROP TABLE IF EXISTS `applicant_screening_entities`;
CREATE TABLE `applicant_screening_entities` (
  `entity_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `applicant_id` bigint(20) UNSIGNED NOT NULL,
  `label` varchar(80) NOT NULL,
  `value` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`entity_id`),
  KEY `fk_applicant_screening_entities_applicant_id` (`applicant_id`)
) ENGINE=InnoDB AUTO_INCREMENT=521 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
(520, 46, 'PHONE', '+63 917 245 8813', '2026-08-26 02:33:18');

-- --------------------------------------------------------

--
-- Table structure for table `applicant_screening_scores`
--

DROP TABLE IF EXISTS `applicant_screening_scores`;
CREATE TABLE `applicant_screening_scores` (
  `score_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `applicant_id` bigint(20) UNSIGNED NOT NULL,
  `criterion` varchar(120) NOT NULL,
  `score` decimal(5,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`score_id`),
  KEY `fk_applicant_screening_scores_applicant_id` (`applicant_id`)
) ENGINE=InnoDB AUTO_INCREMENT=121 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
(120, 46, 'Certifications', 10.00, '2026-08-26 02:33:18');

-- --------------------------------------------------------

--
-- Table structure for table `attendance_records`
--

DROP TABLE IF EXISTS `attendance_records`;
CREATE TABLE `attendance_records` (
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

DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE `audit_logs` (
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
) ENGINE=InnoDB AUTO_INCREMENT=373 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
(372, 1, 'Super Admin', 'Administration / HR', '2026-08-26 08:27:15', 'Failed login attempt', 'Authentication', 'user', 'bullseur', 'Invalid credentials supplied.', 'Warning', '127.0.0.1', 'Chrome', 'http://localhost:5173/login');

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

DROP TABLE IF EXISTS `cache`;
CREATE TABLE `cache` (
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
('oxford-suites-hrms-cache-5c785c036466adea360111aa28563bfd556b5fba', 'i:1;', 1787761694),
('oxford-suites-hrms-cache-5c785c036466adea360111aa28563bfd556b5fba:timer', 'i:1787761694;', 1787761694),
('oxford-suites-hrms-cache-auth.otp.4JdJqdO5TVJS9x2zJ1LY8g6py9JPPcpOr9TTJg5aqy14bBorlTGhM4KJ7NItYut1', 'a:4:{s:7:\"user_id\";i:2;s:9:\"code_hash\";s:64:\"53657566f8af0f173cb01ddeae2c62dd619ea7585ba1d86daec8a934cadf2746\";s:8:\"attempts\";i:0;s:10:\"expires_at\";i:1787622026;}', 1787622026),
('oxford-suites-hrms-cache-auth.otp.6f9snzZg8dIv9lHR560Q97sKDGIDgQEl7G82NevdmWEbNmDFOkJuHgWwLlCA0wSn', 'a:4:{s:7:\"user_id\";i:6;s:9:\"code_hash\";s:64:\"e1976c689957c4237cc740a21a221da5b645c595d261070869bbbdaf6bf4f292\";s:8:\"attempts\";i:0;s:10:\"expires_at\";i:1787655270;}', 1787655270),
('oxford-suites-hrms-cache-auth.otp.8iaP1hDmINIgcsMBTcaUjQHJtI7DpcWyI8VKdPik9eLiF98O9AvsFADgzoVPVUKC', 'a:4:{s:7:\"user_id\";i:4;s:9:\"code_hash\";s:64:\"068e2d178bf2573f66e45184aeb0801aed268cb0475bc81d146f44fce4927518\";s:8:\"attempts\";i:0;s:10:\"expires_at\";i:1787623405;}', 1787623405),
('oxford-suites-hrms-cache-auth.otp.9vK8oIYk5SliCHC5ajUa0Q64Dl3jtb24puNuQjVklLgwGIMEE5ConGtTyGlL4c2Q', 'a:4:{s:7:\"user_id\";i:1;s:9:\"code_hash\";s:64:\"c39a505be6d3901dc8855d6d8d686fb0d0dffd1f4d5ac75874c3490dc9eca5a2\";s:8:\"attempts\";i:0;s:10:\"expires_at\";i:1787623355;}', 1787623355),
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
('oxford-suites-hrms-cache-screening_reference_data', 'a:3:{s:6:\"skills\";a:48:{s:19:\"Attention to Detail\";a:3:{i:0;s:19:\"attention to detail\";i:1;s:15:\"detail oriented\";i:2;s:15:\"detail-oriented\";}s:15:\"Banquet Service\";a:3:{i:0;s:15:\"banquet service\";i:1;s:18:\"banquet operations\";i:2;s:16:\"function service\";}s:18:\"Barista Operations\";a:3:{i:0;s:18:\"barista operations\";i:1;s:7:\"barista\";i:2;s:12:\"cafe service\";}s:15:\"Cake Decoration\";a:2:{i:0;s:15:\"cake decorating\";i:1;s:11:\"cake design\";}s:13:\"Cash Handling\";a:4:{i:0;s:13:\"cash handling\";i:1;s:10:\"cashiering\";i:2;s:7:\"billing\";i:3;s:14:\"funds handling\";}s:20:\"Check-in / Check-out\";a:5:{i:0;s:20:\"check-in / check-out\";i:1;s:18:\"check in check out\";i:2;s:8:\"check-in\";i:3;s:9:\"check-out\";i:4;s:30:\"arrival and departure handling\";}s:15:\"Chemical Safety\";a:2:{i:0;s:15:\"chemical safety\";i:1;s:26:\"cleaning chemical handling\";}s:18:\"Coffee Preparation\";a:6:{i:0;s:18:\"coffee preparation\";i:1;s:13:\"coffee making\";i:2;s:15:\"espresso making\";i:3;s:19:\"espresso extraction\";i:4;s:9:\"latte art\";i:5;s:14:\"coffee brewing\";}s:13:\"Communication\";a:4:{i:0;s:13:\"communication\";i:1;s:20:\"communication skills\";i:2;s:20:\"verbal communication\";i:3;s:21:\"written communication\";}s:18:\"Complaint Handling\";a:3:{i:0;s:18:\"complaint handling\";i:1;s:20:\"complaint resolution\";i:2;s:26:\"guest complaint management\";}s:15:\"Confidentiality\";a:3:{i:0;s:15:\"confidentiality\";i:1;s:12:\"data privacy\";i:2;s:23:\"records confidentiality\";}s:16:\"Customer Service\";a:4:{i:0;s:16:\"customer service\";i:1;s:13:\"guest service\";i:2;s:19:\"customer assistance\";i:3;s:14:\"client service\";}s:11:\"Food Safety\";a:5:{i:0;s:11:\"food safety\";i:1;s:22:\"food safety compliance\";i:2;s:12:\"food hygiene\";i:3;s:10:\"sanitation\";i:4;s:15:\"food sanitation\";}s:23:\"Front Office Operations\";a:5:{i:0;s:12:\"front office\";i:1;s:23:\"front office operations\";i:2;s:10:\"front desk\";i:3;s:20:\"reception operations\";i:4;s:18:\"hotel front office\";}s:14:\"Guest Recovery\";a:1:{i:0;s:16:\"service recovery\";}s:15:\"Guest Relations\";a:3:{i:0;s:15:\"guest relations\";i:1;s:26:\"guest relations management\";i:2;s:16:\"guest engagement\";}s:5:\"HACCP\";a:3:{i:0;s:5:\"haccp\";i:1;s:16:\"haccp compliance\";i:2;s:22:\"food safety management\";}s:11:\"Hot Kitchen\";a:5:{i:0;s:11:\"hot kitchen\";i:1;s:8:\"hot line\";i:2;s:12:\"line cooking\";i:3;s:13:\"grill station\";i:4;s:13:\"saute station\";}s:16:\"Hotel Operations\";a:2:{i:0;s:16:\"hotel operations\";i:1;s:19:\"property operations\";}s:23:\"Housekeeping Operations\";a:3:{i:0;s:12:\"housekeeping\";i:1;s:23:\"housekeeping operations\";i:2;s:23:\"housekeeping procedures\";}s:17:\"Inventory Control\";a:6:{i:0;s:17:\"inventory control\";i:1;s:20:\"inventory management\";i:2;s:13:\"stock control\";i:3;s:11:\"stocktaking\";i:4;s:16:\"inventory checks\";i:5;s:17:\"inventory support\";}s:15:\"Kitchen Hygiene\";a:1:{i:0;s:18:\"kitchen sanitation\";}s:12:\"Knife Skills\";a:2:{i:0;s:12:\"knife skills\";i:1;s:14:\"knife handling\";}s:14:\"Linen Handling\";a:3:{i:0;s:14:\"linen handling\";i:1;s:16:\"linen management\";i:2;s:18:\"laundry operations\";}s:18:\"Maintenance Basics\";a:4:{i:0;s:17:\"basic maintenance\";i:1;s:20:\"building maintenance\";i:2;s:22:\"facilities maintenance\";i:3;s:7:\"repairs\";}s:13:\"Mise en Place\";a:2:{i:0;s:13:\"mise en place\";i:1;s:13:\"mise-en-place\";}s:8:\"Mixology\";a:5:{i:0;s:8:\"mixology\";i:1;s:20:\"cocktail preparation\";i:2;s:14:\"cocktail craft\";i:3;s:12:\"drink mixing\";i:4;s:20:\"beverage preparation\";}s:9:\"MS Office\";a:6:{i:0;s:9:\"ms office\";i:1;s:16:\"microsoft office\";i:2;s:7:\"ms word\";i:3;s:8:\"ms excel\";i:4;s:5:\"excel\";i:5;s:15:\"word processing\";}s:17:\"Pastry and Baking\";a:7:{i:0;s:6:\"pastry\";i:1;s:6:\"baking\";i:2;s:11:\"pastry arts\";i:3;s:19:\"dessert preparation\";i:4;s:19:\"breads and pastries\";i:5;s:18:\"pastry preparation\";i:6;s:12:\"basic baking\";}s:15:\"Payroll Support\";a:3:{i:0;s:15:\"payroll support\";i:1;s:18:\"payroll processing\";i:2;s:18:\"payroll assistance\";}s:7:\"Plating\";a:4:{i:0;s:7:\"plating\";i:1;s:12:\"food plating\";i:2;s:18:\"plate presentation\";i:3;s:12:\"presentation\";}s:11:\"POS Systems\";a:6:{i:0;s:11:\"pos systems\";i:1;s:3:\"pos\";i:2;s:13:\"point of sale\";i:3;s:21:\"point of sale systems\";i:4;s:6:\"micros\";i:5;s:13:\"pos operation\";}s:15:\"Problem Solving\";a:3:{i:0;s:15:\"problem solving\";i:1;s:15:\"problem-solving\";i:2;s:15:\"troubleshooting\";}s:27:\"Property Management Systems\";a:5:{i:0;s:9:\"opera pms\";i:1;s:5:\"opera\";i:2;s:26:\"property management system\";i:3;s:11:\"pms systems\";i:4;s:3:\"pms\";}s:20:\"Public Area Cleaning\";a:2:{i:0;s:20:\"public area cleaning\";i:1;s:23:\"public area maintenance\";}s:21:\"Records Documentation\";a:4:{i:0;s:9:\"201 files\";i:1;s:13:\"documentation\";i:2;s:18:\"records management\";i:3;s:15:\"file management\";}s:19:\"Recruitment Support\";a:3:{i:0;s:11:\"recruitment\";i:1;s:19:\"recruitment support\";i:2;s:22:\"sourcing and screening\";}s:12:\"Reservations\";a:5:{i:0;s:12:\"reservations\";i:1;s:22:\"reservation management\";i:2;s:18:\"booking management\";i:3;s:19:\"reservation support\";i:4;s:19:\"reservation updates\";}s:27:\"Responsible Alcohol Service\";a:3:{i:0;s:27:\"responsible alcohol service\";i:1;s:30:\"responsible service of alcohol\";i:2;s:17:\"alcohol awareness\";}s:13:\"Room Turnover\";a:3:{i:0;s:13:\"room turnover\";i:1;s:13:\"room cleaning\";i:2;s:18:\"guestroom cleaning\";}s:17:\"Safety Compliance\";a:3:{i:0;s:17:\"safety compliance\";i:1;s:16:\"workplace safety\";i:2;s:17:\"safety procedures\";}s:10:\"Scheduling\";a:2:{i:0;s:16:\"shift scheduling\";i:1;s:16:\"staff scheduling\";}s:17:\"Shift Supervision\";a:1:{i:0;s:17:\"floor supervision\";}s:14:\"Staff Training\";a:3:{i:0;s:13:\"team training\";i:1;s:17:\"new hire training\";i:2;s:14:\"staff coaching\";}s:13:\"Table Service\";a:4:{i:0;s:13:\"table service\";i:1;s:12:\"food service\";i:2;s:16:\"service sequence\";i:3;s:19:\"dining room service\";}s:8:\"Teamwork\";a:3:{i:0;s:8:\"teamwork\";i:1;s:18:\"team collaboration\";i:2;s:19:\"working with others\";}s:15:\"Time Management\";a:3:{i:0;s:15:\"time management\";i:1;s:14:\"prioritization\";i:2;s:12:\"multitasking\";}s:9:\"Upselling\";a:4:{i:0;s:9:\"upselling\";i:1;s:17:\"upsell techniques\";i:2;s:18:\"suggestive selling\";i:3;s:13:\"cross-selling\";}}s:9:\"job_roles\";a:20:{s:7:\"Barista\";a:4:{i:0;s:7:\"barista\";i:1;s:17:\"coffee shop staff\";i:2;s:12:\"cafe barista\";i:3;s:16:\"coffee attendant\";}s:9:\"Bartender\";a:5:{i:0;s:9:\"bartender\";i:1;s:10:\"bar tender\";i:2;s:6:\"barman\";i:3;s:7:\"barkeep\";i:4;s:10:\"mixologist\";}s:4:\"Chef\";a:5:{i:0;s:4:\"chef\";i:1;s:9:\"sous chef\";i:2;s:9:\"head chef\";i:3;s:14:\"executive chef\";i:4;s:14:\"chef de partie\";}s:9:\"Concierge\";a:3:{i:0;s:9:\"concierge\";i:1;s:12:\"bell captain\";i:2;s:7:\"bellman\";}s:23:\"Front Desk Receptionist\";a:7:{i:0;s:23:\"front desk receptionist\";i:1;s:18:\"front desk officer\";i:2;s:12:\"receptionist\";i:3;s:16:\"front desk agent\";i:4;s:16:\"front desk staff\";i:5;s:22:\"front office associate\";i:6;s:19:\"guest service agent\";}s:15:\"General Manager\";a:3:{i:0;s:15:\"general manager\";i:1;s:2:\"gm\";i:2;s:16:\"property manager\";}s:23:\"Guest Relations Officer\";a:4:{i:0;s:23:\"guest relations officer\";i:1;s:3:\"gro\";i:2;s:27:\"guest relations coordinator\";i:3;s:21:\"guest service officer\";}s:7:\"Hostess\";a:3:{i:0;s:7:\"hostess\";i:1;s:9:\"food host\";i:2;s:15:\"restaurant host\";}s:22:\"Housekeeping Attendant\";a:6:{i:0;s:22:\"housekeeping attendant\";i:1;s:14:\"room attendant\";i:2;s:11:\"housekeeper\";i:3;s:11:\"chambermaid\";i:4;s:7:\"roomboy\";i:5;s:21:\"public area attendant\";}s:12:\"HR Assistant\";a:5:{i:0;s:12:\"hr assistant\";i:1;s:24:\"human resource assistant\";i:2;s:25:\"human resources assistant\";i:3;s:8:\"hr staff\";i:4;s:21:\"recruitment assistant\";}s:10:\"HR Manager\";a:3:{i:0;s:10:\"hr manager\";i:1;s:23:\"human resources manager\";i:2;s:25:\"hr administration manager\";}s:14:\"Kitchen Helper\";a:5:{i:0;s:14:\"kitchen helper\";i:1;s:10:\"dishwasher\";i:2;s:12:\"kitchen aide\";i:3;s:7:\"steward\";i:4;s:15:\"kitchen steward\";}s:17:\"Laundry Attendant\";a:2:{i:0;s:17:\"laundry attendant\";i:1;s:13:\"laundry staff\";}s:9:\"Line Cook\";a:6:{i:0;s:9:\"line cook\";i:1;s:4:\"cook\";i:2;s:12:\"station cook\";i:3;s:16:\"hot kitchen cook\";i:4;s:11:\"commis chef\";i:5;s:12:\"kitchen cook\";}s:22:\"Maintenance Technician\";a:4:{i:0;s:22:\"maintenance technician\";i:1;s:17:\"maintenance staff\";i:2;s:8:\"handyman\";i:3;s:26:\"building maintenance staff\";}s:27:\"Pastry and Bakery Assistant\";a:4:{i:0;s:16:\"pastry assistant\";i:1;s:16:\"bakery assistant\";i:2;s:14:\"bakery trainee\";i:3;s:11:\"pastry cook\";}s:11:\"Pastry Chef\";a:4:{i:0;s:11:\"pastry chef\";i:1;s:5:\"baker\";i:2;s:11:\"pastry cook\";i:3;s:10:\"baker chef\";}s:17:\"Restaurant Server\";a:8:{i:0;s:17:\"restaurant server\";i:1;s:6:\"waiter\";i:2;s:8:\"waitress\";i:3;s:11:\"food server\";i:4;s:6:\"server\";i:5;s:27:\"food and beverage attendant\";i:6;s:13:\"f&b attendant\";i:7;s:12:\"service crew\";}s:21:\"Restaurant Supervisor\";a:3:{i:0;s:16:\"floor supervisor\";i:1;s:18:\"service supervisor\";i:2;s:18:\"senior server lead\";}s:10:\"Supervisor\";a:3:{i:0;s:10:\"supervisor\";i:1;s:16:\"shift supervisor\";i:2;s:11:\"team leader\";}}s:14:\"certifications\";a:11:{s:13:\"Barista NC II\";a:3:{i:0;s:13:\"barista nc ii\";i:1;s:19:\"tesda barista nc ii\";i:2;s:26:\"coffee academy certificate\";}s:16:\"Culinary Diploma\";a:3:{i:0;s:16:\"culinary diploma\";i:1;s:24:\"diploma in culinary arts\";i:2;s:21:\"culinary arts diploma\";}s:16:\"Driver\'s License\";a:4:{i:0;s:16:\"driver\'s license\";i:1;s:15:\"drivers license\";i:2;s:27:\"professional driver license\";i:3;s:31:\"non-professional driver license\";}s:21:\"First Aid Certificate\";a:3:{i:0;s:21:\"first aid certificate\";i:1;s:30:\"first aid training certificate\";i:2;s:18:\"standard first aid\";}s:24:\"Food Handler Certificate\";a:5:{i:0;s:24:\"food handler certificate\";i:1;s:26:\"food handler\'s certificate\";i:2;s:25:\"food handlers certificate\";i:3;s:23:\"food safety certificate\";i:4;s:17:\"food handler card\";}s:22:\"TESDA Bartending NC II\";a:4:{i:0;s:22:\"tesda bartending nc ii\";i:1;s:16:\"bartending nc ii\";i:2;s:15:\"bartending nc 2\";i:3;s:25:\"tesda nc ii in bartending\";}s:39:\"TESDA Bread and Pastry Production NC II\";a:3:{i:0;s:33:\"bread and pastry production nc ii\";i:1;s:12:\"baking nc ii\";i:2;s:23:\"pastry production nc ii\";}s:19:\"TESDA Cookery NC II\";a:5:{i:0;s:19:\"tesda cookery nc ii\";i:1;s:13:\"cookery nc ii\";i:2;s:18:\"tesda cookery nc 2\";i:3;s:24:\"commercial cooking nc ii\";i:4;s:22:\"tesda nc ii in cookery\";}s:38:\"TESDA Food and Beverage Services NC II\";a:4:{i:0;s:32:\"food and beverage services nc ii\";i:1;s:18:\"f&b services nc ii\";i:2;s:17:\"fb services nc ii\";i:3;s:23:\"food and beverage nc ii\";}s:24:\"TESDA Front Office NC II\";a:3:{i:0;s:24:\"tesda front office nc ii\";i:1;s:18:\"front office nc ii\";i:2;s:27:\"front office services nc ii\";}s:24:\"TESDA Housekeeping NC II\";a:3:{i:0;s:24:\"tesda housekeeping nc ii\";i:1;s:18:\"housekeeping nc ii\";i:2;s:17:\"housekeeping nc 2\";}}}', 1787711870),
('oxford-suites-hrms-cache-smoke-test', 's:2:\"ok\";', 1787427712);

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

DROP TABLE IF EXISTS `cache_locks`;
CREATE TABLE `cache_locks` (
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

DROP TABLE IF EXISTS `chatbot_faqs`;
CREATE TABLE `chatbot_faqs` (
  `faq_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `question` varchar(255) NOT NULL,
  `answer` text NOT NULL,
  `keywords` text DEFAULT NULL,
  `enabled` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`faq_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `chatbot_faqs`
--

INSERT INTO `chatbot_faqs` (`faq_id`, `question`, `answer`, `keywords`, `enabled`, `sort_order`, `created_at`, `updated_at`) VALUES
(2, 'What is the dress code for interviews?', 'Smart business or business-casual attire is recommended. For ladies, a neat blouse and slacks or a modest dress; for men, a collared shirt with slacks. Avoid ripped jeans, sandals, and revealing clothing.', 'dress code,dress,wear,attire,outfit,what to wear,uniform', 1, 1, '2026-08-19 13:20:18', '2026-08-19 13:20:18');


-- --------------------------------------------------------

--
-- Table structure for table `chatbot_unanswered`
--

DROP TABLE IF EXISTS `chatbot_unanswered`;
CREATE TABLE `chatbot_unanswered` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `session_id` varchar(80) DEFAULT NULL,
  `message` text NOT NULL,
  `intent` varchar(40) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_chatbot_unanswered_session_id` (`session_id`),
  KEY `idx_chatbot_unanswered_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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

DROP TABLE IF EXISTS `checklist_requests`;
CREATE TABLE `checklist_requests` (
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

DROP TABLE IF EXISTS `departments`;
CREATE TABLE `departments` (
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

DROP TABLE IF EXISTS `employees`;
CREATE TABLE `employees` (
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

DROP TABLE IF EXISTS `employee_benefits`;
CREATE TABLE `employee_benefits` (
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

DROP TABLE IF EXISTS `employee_documents`;
CREATE TABLE `employee_documents` (
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

DROP TABLE IF EXISTS `employee_emergency_contacts`;
CREATE TABLE `employee_emergency_contacts` (
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

DROP TABLE IF EXISTS `employee_exit_records`;
CREATE TABLE `employee_exit_records` (
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

--
-- Dumping data for table `employee_exit_records`
--

INSERT INTO `employee_exit_records` (`exit_record_id`, `employee_id`, `exit_type`, `exit_date`, `clearance_status`, `coe_status`, `notes`, `created_at`, `updated_at`) VALUES
(1, 1, 'Terminated', '2026-08-17', 'Pending', 'Pending', 'Employee exit via Terminated', '2026-08-17 10:51:56', '2026-08-17 10:51:56');


-- --------------------------------------------------------

--
-- Table structure for table `employee_learning`
--

DROP TABLE IF EXISTS `employee_learning`;
CREATE TABLE `employee_learning` (
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

DROP TABLE IF EXISTS `employee_onboarding_items`;
CREATE TABLE `employee_onboarding_items` (
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
) ENGINE=InnoDB AUTO_INCREMENT=318 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `employee_onboarding_items`
--

INSERT INTO `employee_onboarding_items` (`employee_onboarding_item_id`, `employee_id`, `new_hire_id`, `template_item_id`, `item_text`, `file_path`, `file_name`, `notes`, `done`, `submitted_at`, `completed_at`, `completed_by_user_id`, `created_at`, `updated_at`) VALUES
(1, 4, 1, NULL, 'Signed employment contract', NULL, NULL, NULL, 1, NULL, '2026-07-31 18:00:00', 2, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(2, 4, 1, NULL, 'NBI / Police clearance', NULL, NULL, 'NBI clearance reference NBI-2026-0901', 1, '2026-08-25 06:40:17', '2026-07-31 18:05:00', 2, '2026-08-17 00:31:34', '2026-08-25 06:40:17'),
(3, 4, 1, NULL, 'Pre-employment medical exam', NULL, NULL, 'Submitted for verification', 1, '2026-08-25 04:52:31', '2026-08-25 05:13:49', NULL, '2026-08-17 00:31:34', '2026-08-25 05:13:49'),
(4, 4, 1, NULL, 'SSS / PhilHealth / Pag-IBIG / TIN', NULL, NULL, 'Submitted from verification script', 0, '2026-08-25 06:41:59', NULL, NULL, '2026-08-17 00:31:34', '2026-08-25 06:41:59'),
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
(17, 5, 3, NULL, 'Signed employment contract', NULL, NULL, NULL, 0, NULL, NULL, NULL, '2026-08-17 00:31:34', '2026-08-18 08:53:43'),
(18, 5, 3, NULL, 'NBI / Police clearance', NULL, NULL, NULL, 0, NULL, NULL, NULL, '2026-08-17 00:31:34', '2026-08-18 08:53:43'),
(19, 5, 3, NULL, 'Pre-employment medical exam', NULL, NULL, NULL, 0, NULL, NULL, NULL, '2026-08-17 00:31:34', '2026-08-18 08:53:44'),
(20, 5, 3, NULL, 'SSS / PhilHealth / Pag-IBIG / TIN', NULL, NULL, NULL, 0, NULL, NULL, NULL, '2026-08-17 00:31:34', '2026-08-18 08:53:44'),
(21, 5, 3, NULL, 'Birth certificate (PSA)', NULL, NULL, NULL, 0, NULL, NULL, NULL, '2026-08-17 00:31:34', '2026-08-18 08:53:45'),
(22, 5, 3, NULL, 'Company orientation attended', NULL, NULL, NULL, 0, NULL, NULL, NULL, '2026-08-17 00:31:34', '2026-08-18 08:53:45'),
(23, 5, 3, NULL, 'Uniform & ID issued', NULL, NULL, NULL, 0, NULL, NULL, NULL, '2026-08-17 00:31:34', '2026-08-25 05:16:53'),
(24, 5, 3, NULL, 'Department on-the-job training', NULL, NULL, NULL, 0, NULL, NULL, NULL, '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
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
(293, 5, 3, NULL, 'PROPRO', NULL, NULL, NULL, 0, NULL, NULL, NULL, '2026-08-18 09:54:03', '2026-08-25 05:14:19'),
(294, 14, 4, NULL, 'PROPRO', NULL, NULL, NULL, 0, NULL, NULL, NULL, '2026-08-18 09:54:03', '2026-08-18 09:54:03'),
(295, 15, 6, NULL, 'PROPRO', NULL, NULL, NULL, 0, NULL, NULL, NULL, '2026-08-18 09:54:03', '2026-08-18 09:54:03'),
(296, 16, 7, NULL, 'PROPRO', NULL, NULL, NULL, 0, NULL, NULL, NULL, '2026-08-18 09:54:03', '2026-08-18 09:54:03'),
(297, 17, 8, NULL, 'PROPRO', NULL, NULL, NULL, 0, NULL, NULL, NULL, '2026-08-18 09:54:03', '2026-08-18 09:54:03'),
(298, NULL, 16, NULL, 'PROPRO', NULL, NULL, NULL, 1, NULL, '2026-08-24 20:39:49', NULL, '2026-08-18 09:54:03', '2026-08-24 20:39:49'),
(301, NULL, 14, 122, 'PROSPROS', NULL, NULL, NULL, 0, NULL, NULL, NULL, '2026-08-18 11:06:44', '2026-08-18 11:06:44'),
(302, NULL, 19, 123, 'PRESPRES', NULL, NULL, NULL, 1, NULL, '2026-08-18 21:51:46', NULL, '2026-08-18 21:51:45', '2026-08-18 21:51:46'),
(305, NULL, 19, 9, 'Department orientation completed', NULL, NULL, NULL, 1, NULL, '2026-08-25 03:13:07', NULL, '2026-08-25 03:13:05', '2026-08-25 03:13:07'),
(306, NULL, 19, 124, 'P_R_O', NULL, NULL, NULL, 1, NULL, '2026-08-25 04:25:36', NULL, '2026-08-25 03:14:03', '2026-08-25 04:25:36'),
(307, NULL, 19, 122, 'PROSPROS', NULL, NULL, NULL, 1, NULL, '2026-08-26 04:36:03', NULL, '2026-08-25 03:14:10', '2026-08-26 04:36:04'),
(308, 5, 3, 122, 'PROSPROS', NULL, NULL, NULL, 1, NULL, '2026-08-25 05:22:04', NULL, '2026-08-25 03:15:46', '2026-08-25 05:22:04'),
(309, 5, 3, 124, 'P_R_O', NULL, NULL, NULL, 1, NULL, '2026-08-25 05:22:03', NULL, '2026-08-25 03:15:56', '2026-08-25 05:22:03'),
(310, NULL, 19, 125, 'meron upload', NULL, NULL, NULL, 1, NULL, '2026-08-25 03:22:25', NULL, '2026-08-25 03:22:23', '2026-08-25 03:22:25'),
(311, 5, 3, 125, 'meron upload', 'onboarding_documents/xpXmyT5QkeFgMew4spYMWswZEDEkQmJIUm9e1lYf.jpg', 'Adrian_Luis_Navarro_Hotel_Concierge_Resume.jpg', 'test', 0, '2026-08-25 05:11:55', NULL, NULL, '2026-08-25 03:22:51', '2026-08-25 07:16:51'),
(312, NULL, 16, 124, 'P_R_O', NULL, NULL, NULL, 1, NULL, '2026-08-25 05:14:06', NULL, '2026-08-25 05:14:05', '2026-08-25 05:14:06'),
(313, NULL, 16, 125, 'meron upload', NULL, NULL, NULL, 0, NULL, NULL, NULL, '2026-08-25 05:14:09', '2026-08-25 05:14:11'),
(314, 5, 3, 126, 'try', NULL, NULL, 'eto yun', 1, '2026-08-25 05:22:38', '2026-08-25 05:43:46', NULL, '2026-08-25 05:22:38', '2026-08-25 05:43:46'),
(315, 5, 3, 127, 'test', NULL, NULL, 'test', 1, '2026-08-25 05:26:07', '2026-08-25 05:26:24', NULL, '2026-08-25 05:25:54', '2026-08-25 05:26:24'),
(316, NULL, 19, 126, 'try', NULL, NULL, NULL, 1, NULL, '2026-08-26 04:36:09', NULL, '2026-08-26 04:36:04', '2026-08-26 04:36:09'),
(317, NULL, 19, 127, 'test', NULL, NULL, NULL, 1, NULL, '2026-08-26 04:36:10', NULL, '2026-08-26 04:36:05', '2026-08-26 04:36:10');

-- --------------------------------------------------------

--
-- Table structure for table `employee_position_history`
--

DROP TABLE IF EXISTS `employee_position_history`;
CREATE TABLE `employee_position_history` (
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

DROP TABLE IF EXISTS `ess_categories`;
CREATE TABLE `ess_categories` (
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

DROP TABLE IF EXISTS `ess_requests`;
CREATE TABLE `ess_requests` (
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

DROP TABLE IF EXISTS `hr3_recommendations`;
CREATE TABLE `hr3_recommendations` (
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

DROP TABLE IF EXISTS `interviews`;
CREATE TABLE `interviews` (
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
-- Table structure for table `job_posts`
--

DROP TABLE IF EXISTS `job_posts`;
CREATE TABLE `job_posts` (
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
(2, 'line-cook', 'Line Cook', 3, 5, 'Full-time', 'Shifting Schedule', 16000.00, 20000.00, 4, 2, '2026-05-18', 'Open', 1, '1-2 Years', 'Vocational / TESDA', 'Prepare and cook menu items to standard, maintain station cleanliness and food safety compliance.', 'Prepare and cook menu items to standard, maintain station cleanliness and food safety compliance.', '[\"Prepare mise en place before each service.\",\"Cook and plate dishes to recipe standards.\",\"Maintain sanitation and food-safety compliance.\",\"Monitor inventory levels of station ingredients.\",\"Support banquet and room-service volume peaks.\"]', '[\"TESDA NC II in Cookery or equivalent culinary training.\",\"At least 1 year in a hotel or full-service restaurant kitchen.\",\"Valid food handler\'s certificate.\",\"Able to work under pressure during peak service.\"]', '[\"Food Safety\",\"HACCP\",\"Knife Skills\",\"Plating\",\"Teamwork\"]', '[\"HMO\",\"Service Charge\",\"Meal Allowance\",\"Uniform\",\"Training\"]', NULL, '2026-08-17 00:31:34', '2026-08-26 03:31:17'),
(3, 'housekeeping-attendant', 'Housekeeping Attendant', 4, 7, 'Full-time', 'Shifting Schedule', 14000.00, 17000.00, 5, 3, '2026-05-10', 'Closed', 0, 'No Experience', 'High School Graduate', 'Maintain guestroom cleanliness, linen turnover, and public-area presentation to brand standards.', 'Housekeeping Attendants keep guestrooms and public areas immaculate, restock amenities, and report maintenance issues. Full training is provided for applicants with no prior hotel experience.', '[\"Clean and prepare assigned guestrooms daily.\",\"Replenish linens, towels, and amenities.\",\"Report maintenance and lost-and-found items.\",\"Maintain housekeeping cart and supplies.\"]', '[\"High School Graduate.\",\"Physically fit and detail-oriented.\",\"Willing to work shifts including weekends and holidays.\"]', '[\"Attention to Detail\",\"Time Management\",\"Room Turnover\",\"Safety\"]', '[\"HMO\",\"Service Charge\",\"Meal Allowance\",\"Uniform\"]', NULL, '2026-08-17 00:31:34', '2026-08-18 09:20:38'),
(4, 'restaurant-server', 'Restaurant Server', 2, 3, 'Full-time', 'Shifting Schedule', 15000.00, 18000.00, 4, 1, '2026-05-20', 'Closed', 0, 'No Experience', 'High School Graduate', 'Deliver warm, accurate table service across the dining room and banquet operations.', 'Restaurant Servers take orders, serve food and beverages, and ensure every guest leaves with a memorable dining experience at our all-day dining outlet.', '[\"Greet and seat guests warmly.\",\"Take and relay orders accurately to the kitchen.\",\"Serve food and beverages following service sequence.\",\"Handle billing and guest feedback.\"]', '[\"High School Graduate; hospitality training an advantage.\",\"Good communication skills in English and Filipino.\",\"Pleasant personality and grooming.\"]', '[\"Guest Service\",\"Upselling\",\"POS Systems\",\"Communication\"]', '[\"HMO\",\"Service Charge\",\"Meal Allowance\",\"Tips\"]', NULL, '2026-08-17 00:31:34', '2026-08-18 09:20:41'),
(5, 'bartender', 'Bartender', 2, 4, 'Part-time', 'Night Shift', 16000.00, 19000.00, 2, 0, '2026-05-15', 'Closed', 0, '3-5 Years', 'Vocational / TESDA', 'Craft classic and signature cocktails for the lobby lounge and rooftop bar.', 'The Bartender prepares beverages to recipe, manages bar inventory, and creates a lively yet refined guest experience at the lounge.', '[\"Prepare cocktails and beverages to standard.\",\"Maintain bar cleanliness and inventory.\",\"Engage guests and recommend pairings.\",\"Observe responsible alcohol service.\"]', '[\"TESDA Bartending NC II or equivalent.\",\"At least 3 years bar experience in hotels or restaurants.\",\"Knowledge of classic and modern mixology.\"]', '[\"Mixology\",\"Inventory Control\",\"Guest Engagement\",\"Cash Handling\"]', '[\"HMO\",\"Service Charge\",\"Meal Allowance\",\"Night Differential\"]', NULL, '2026-08-17 00:31:34', '2026-08-18 09:20:40'),
(6, 'hr-assistant', 'HR Assistant', 5, 8, 'Full-time', 'Day Shift', 20000.00, 25000.00, 1, 0, '2026-05-08', 'Closed', 0, '1-2 Years', 'Bachelor\'s Degree', 'Support recruitment, employee records, and HR document processing.', 'The HR Assistant supports end-to-end recruitment coordination, 201-file maintenance, and employee request processing for the property.', '[\"Coordinate interview schedules with department heads.\",\"Maintain complete and accurate 201 files.\",\"Process COE and employment verification requests.\",\"Assist in new-hire onboarding documentation.\"]', '[\"Bachelor\'s degree in Psychology, HR, or related field.\",\"At least 1 year HR experience.\",\"Strong organizational and documentation skills.\"]', '[\"Recruitment\",\"Documentation\",\"MS Office\",\"Confidentiality\"]', '[\"HMO\",\"Paid Leave\",\"Career Growth\",\"Training\"]', NULL, '2026-08-17 00:31:34', '2026-08-18 09:20:39'),
(12, 'general-manager', 'General Manager', 5, 9, 'Seasonal', 'Shifting Schedule5', 5.00, 5.00, 15, 0, '2026-08-18', 'Closed', 0, NULL, NULL, '5', '5', '[\"5\"]', '[\"5\"]', '[\"5\"]', '[\"5\"]', 'job-post-pictures/N9uA1rNh0yLgaItzh0VLBSwZwTLgKGUhw7jKA9Mg.jpg', '2026-08-18 09:22:12', '2026-08-25 03:07:32'),
(13, 'hr-administration-manager', 'HR & Administration Manager', 5, 14, 'Full-time', 'Shifting Schedule', 0.00, 0.00, 1, 0, '2026-08-18', 'Closed', 0, NULL, NULL, NULL, NULL, '[]', '[]', '[]', '[]', 'job-post-pictures/TV36vkczRy1cSnj20lFuGTJb3wjBYwIuFIziCXNu.jpg', '2026-08-18 09:32:56', '2026-08-25 03:07:31'),
(14, 'front-office-manager', 'Front Office Manager', 1, 10, 'Full-time', 'Shifting Schedule', 0.00, 0.00, 1, 0, '2026-08-19', 'Closed', 0, NULL, NULL, NULL, NULL, '[]', '[]', '[]', '[]', 'job-post-pictures/ilbUmYCHlO6iCL5mkVMCfeCzmN2SmOpE9LWjNzII.png', '2026-08-19 04:53:42', '2026-08-25 03:07:15'),
(15, 'guest-relations-officer', 'Guest Relations Officer', 1, 2, 'Full-time', NULL, 20000.00, 28000.00, 1, 0, NULL, 'Open', 1, '1-2 Years', 'Bachelor\'s Degree', NULL, 'Welcomes and assists hotel guests, coordinates with front office and housekeeping, and handles service recovery.', NULL, '[\"Bachelor degree in Hospitality or related field\",\"At least 1 year guest-facing experience\"]', '[\"Guest Relations\",\"Front Office Operations\",\"Reservations\",\"Complaint Handling\"]', NULL, NULL, '2026-08-24 03:53:23', '2026-08-24 03:53:23'),
(16, 'front-desk-receptionist', 'Front Desk Receptionist', 1, 1, 'Full-time', NULL, 18000.00, 25000.00, 2, 0, NULL, 'Open', 1, '1-2 Years', 'Bachelor\'s Degree', NULL, 'Front-line hotel reception: check-in and check-out, reservations, guest inquiries, and coordination with housekeeping.', NULL, '[\"Bachelor degree in Hospitality or related field preferred\",\"At least 1 year front desk experience\"]', '[\"Guest Relations\",\"Check-in \\/ Check-out\",\"Reservations\",\"Property Management Systems\",\"Cash Handling\"]', NULL, NULL, '2026-08-24 04:04:50', '2026-08-24 04:04:50');

-- --------------------------------------------------------

--
-- Table structure for table `job_post_platforms`
--

DROP TABLE IF EXISTS `job_post_platforms`;
CREATE TABLE `job_post_platforms` (
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

DROP TABLE IF EXISTS `learning_courses`;
CREATE TABLE `learning_courses` (
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

DROP TABLE IF EXISTS `leave_balances`;
CREATE TABLE `leave_balances` (
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

DROP TABLE IF EXISTS `migrations`;
CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=68 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
(67, '2026_08_22_120000_add_super_admin_and_protected_flags_to_system_roles', 20);

-- --------------------------------------------------------

--
-- Table structure for table `new_hires`
--

DROP TABLE IF EXISTS `new_hires`;
CREATE TABLE `new_hires` (
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

DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
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
) ENGINE=InnoDB AUTO_INCREMENT=304 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
(152, 3, 'info', 'New applicant: NICOLE FRANCES HERRERA', 'Submitted application with screening score 83.20%.', 'Applicant Management', 'Applicant', '36', 0, NULL, '2026-08-25 13:00:33'),
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
(208, 3, 'info', 'New applicant: Roberto James Castillo', 'Submitted application with screening score 62.00%.', 'Applicant Management', 'Applicant', '40', 0, NULL, '2026-08-25 13:20:15'),
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
(222, 3, 'info', 'New applicant: Samantha Nicole Dela Cruz', 'Submitted application with screening score 83.20%.', 'Applicant Management', 'Applicant', '41', 0, NULL, '2026-08-25 13:20:53'),
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
(236, 3, 'info', 'New applicant: Vincent Paul Soriano', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '42', 0, NULL, '2026-08-25 13:42:45'),
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
(269, 10, 'info', 'New applicant: Bianca Louise Garcia', 'Submitted application with screening score 72.00%.', 'Applicant Management', 'Applicant', '44', 0, NULL, '2026-08-25 13:47:37'),
(270, 11, 'info', 'New applicant: Bianca Louise Garcia', 'Submitted application with screening score 72.00%.', 'Applicant Management', 'Applicant', '44', 0, NULL, '2026-08-25 13:47:37');
INSERT INTO `notifications` (`notification_id`, `system_user_id`, `type`, `title`, `body`, `module_name`, `target_type`, `target_id`, `is_read`, `read_at`, `created_at`) VALUES
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
(303, 16, 'info', 'New applicant: Vincent Paul Soriano', 'Submitted application with screening score 100.00%.', 'Applicant Management', 'Applicant', '46', 0, NULL, '2026-08-25 18:33:18');

-- --------------------------------------------------------

--
-- Table structure for table `onboarding_checklist_items`
--

DROP TABLE IF EXISTS `onboarding_checklist_items`;
CREATE TABLE `onboarding_checklist_items` (
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
) ENGINE=InnoDB AUTO_INCREMENT=128 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
(127, 8, 'test', NULL, 0, NULL, 4, '2026-08-25 13:25:49');

-- --------------------------------------------------------

--
-- Table structure for table `onboarding_checklist_templates`
--

DROP TABLE IF EXISTS `onboarding_checklist_templates`;
CREATE TABLE `onboarding_checklist_templates` (
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
(8, 'OCT-0008', 'PROSs', 'Probationary', '[]', 'Active', '2026-08-18 11:03:07', '2026-08-25 03:15:36'),
(9, 'OCT-0009', 'PRESs', 'Pre-onboarding', '[]', 'Inactive', '2026-08-18 11:03:48', '2026-08-25 03:21:18');

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payroll_items`
--

DROP TABLE IF EXISTS `payroll_items`;
CREATE TABLE `payroll_items` (
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

DROP TABLE IF EXISTS `payroll_periods`;
CREATE TABLE `payroll_periods` (
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

DROP TABLE IF EXISTS `payroll_records`;
CREATE TABLE `payroll_records` (
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

DROP TABLE IF EXISTS `performance_reviews`;
CREATE TABLE `performance_reviews` (
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

DROP TABLE IF EXISTS `personal_access_tokens`;
CREATE TABLE `personal_access_tokens` (
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
) ENGINE=InnoDB AUTO_INCREMENT=82 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
(80, 'App\\Models\\SystemUser', 3, 'auth-token', '0a7ed41018ca4059bee0c00061e2ddbf7a2af3ccc98bc61f66f9429b0602fb7a', '[\"*\"]', NULL, NULL, '2026-08-26 08:19:12', '2026-08-26 08:19:12');

-- --------------------------------------------------------

--
-- Table structure for table `positions`
--

DROP TABLE IF EXISTS `positions`;
CREATE TABLE `positions` (
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
-- Table structure for table `recognition_reactions`
--

DROP TABLE IF EXISTS `recognition_reactions`;
CREATE TABLE `recognition_reactions` (
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

DROP TABLE IF EXISTS `requisitions`;
CREATE TABLE `requisitions` (
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

DROP TABLE IF EXISTS `role_permissions`;
CREATE TABLE `role_permissions` (
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

DROP TABLE IF EXISTS `salary_grades`;
CREATE TABLE `salary_grades` (
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

DROP TABLE IF EXISTS `screening_ground_truths`;
CREATE TABLE `screening_ground_truths` (
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

DROP TABLE IF EXISTS `screening_reference_data`;
CREATE TABLE `screening_reference_data` (
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

DROP TABLE IF EXISTS `sessions`;
CREATE TABLE `sessions` (
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
-- Table structure for table `social_recognitions`
--

DROP TABLE IF EXISTS `social_recognitions`;
CREATE TABLE `social_recognitions` (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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

DROP TABLE IF EXISTS `system_roles`;
CREATE TABLE `system_roles` (
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

DROP TABLE IF EXISTS `system_settings`;
CREATE TABLE `system_settings` (
  `setting_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `setting_key` varchar(120) NOT NULL,
  `setting_value` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`setting_value`)),
  `updated_by_user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`setting_id`),
  UNIQUE KEY `setting_key` (`setting_key`),
  KEY `idx_system_settings_updated_by_user_id` (`updated_by_user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
(19, 'my_preferences_rosa.aquino@oxfordsuites.com.ph', '{\"dateFormat\":\"DD\\/MM\\/YYYY\",\"timeZone\":\"Asia\\/Manila (GMT+8)\",\"language\":\"Filipino\",\"timeFormat\":\"12-hour\",\"theme\":\"Light\"}', NULL, '2026-08-24 17:59:59', '2026-08-24 17:59:59');

-- --------------------------------------------------------

--
-- Table structure for table `system_users`
--

DROP TABLE IF EXISTS `system_users`;
CREATE TABLE `system_users` (
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
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `system_users`
--

INSERT INTO `system_users` (`system_user_id`, `username`, `email`, `password_hash`, `full_name`, `department_name`, `employee_id`, `role_id`, `status`, `otp_enabled`, `last_login_at`, `last_login_ip`, `created_at`, `updated_at`) VALUES
(1, 'bullseur', 'bullseur@oxfordsuites.com.ph', '$2y$12$ZvXS75gRgB9PmlQPui8Ao.bZlUnSW84Ric.DlKLS3o6DxWVIGjo3m', 'Bullseur Santiago', 'Administration / HR', NULL, 1, 'Active', 1, '2026-08-26 05:18:59', '127.0.0.1', '2026-08-17 17:41:34', '2026-08-26 05:18:59'),
(2, 'jdelacruz', 'juan.delacruz@oxfordsuites.com.ph', '$2y$12$ZvXS75gRgB9PmlQPui8Ao.bZlUnSW84Ric.DlKLS3o6DxWVIGjo3m', 'Juan Dela Cruz', 'Administration / HR', 7, 2, 'Active', 1, '2026-08-26 02:44:48', '127.0.0.1', '2026-08-17 17:41:34', '2026-08-26 02:44:48'),
(3, 'aramos', 'ana.ramos@oxfordsuites.com.ph', '$2y$12$j528H0H.yZIfbG2bx1sXYejFAFUkwTKi4sLs4G6ZVNn2vAK9knzxe', 'Ana Ramos', 'Front Office', 1, 2, 'Active', 0, '2026-08-26 08:25:17', '127.0.0.1', '2026-08-17 17:41:34', '2026-08-26 08:25:17'),
(4, 'kdelacruz', 'kevin.delacruz@oxfordsuites.com.ph', '$2y$12$q4fJK6wGGoqhARF8/jmLm.zmVBl9aAxpWjweSAuYavILNkKleZR5e', 'Kevin Dela Cruz', 'Kitchen / Culinary', 5, 3, 'Active', 0, '2026-08-26 07:50:53', '127.0.0.1', '2026-08-17 17:41:34', '2026-08-26 07:50:53'),
(5, 'mdevera', 'marjun.devera@oxfordsuites.com.ph', '$2y$12$ZvXS75gRgB9PmlQPui8Ao.bZlUnSW84Ric.DlKLS3o6DxWVIGjo3m', 'Marjun Devera', 'Food & Beverage', 6, 3, 'Suspended', 1, '2026-07-20 11:11:00', '10.0.4.101', '2026-08-17 17:41:34', '2026-08-23 17:17:32'),
(6, 'raquino', 'rosa.aquino@oxfordsuites.com.ph', '$2y$12$ZvXS75gRgB9PmlQPui8Ao.bZlUnSW84Ric.DlKLS3o6DxWVIGjo3m', 'Rosa Aquino', 'Housekeeping', 8, 3, 'Active', 1, '2026-07-25 22:03:00', '10.0.4.57', '2026-08-17 17:41:34', '2026-08-23 17:17:32'),
(7, 'mlim', 'maria.lim@oxfordsuites.com.ph', '$2y$12$ZvXS75gRgB9PmlQPui8Ao.bZlUnSW84Ric.DlKLS3o6DxWVIGjo3m', 'Maria Lim', 'Administration / HR', 11, 2, 'Active', 1, '2026-07-25 23:45:00', '192.168.10.18', '2026-08-17 17:41:34', '2026-08-23 17:17:32'),
(8, 'pcruz', 'paolo.cruz@oxfordsuites.com.ph', '$2y$12$ZvXS75gRgB9PmlQPui8Ao.bZlUnSW84Ric.DlKLS3o6DxWVIGjo3m', 'Paolo Cruz', 'Administration / HR', 12, 2, 'Active', 1, '2026-07-25 09:30:00', '192.168.10.12', '2026-08-17 17:41:34', '2026-08-23 17:17:32'),
(10, 'bcbc', 'bcbc@mga.com', '$2y$12$ZvXS75gRgB9PmlQPui8Ao.bZlUnSW84Ric.DlKLS3o6DxWVIGjo3m', 'bcbc', 'Food & Beverage', NULL, 3, 'Active', 1, NULL, NULL, '2026-08-18 10:43:08', '2026-08-23 17:17:32'),
(11, 'admin-img2', 'ADMIN-img2@gmail.com', '$2y$12$ZvXS75gRgB9PmlQPui8Ao.bZlUnSW84Ric.DlKLS3o6DxWVIGjo3m', 'ADMIN-img2', 'Food & Beverage', NULL, 3, 'Active', 1, NULL, NULL, '2026-08-18 10:44:41', '2026-08-23 17:17:32'),
(12, 'f1', 'f1@gmail.com', '$2y$12$ZvXS75gRgB9PmlQPui8Ao.bZlUnSW84Ric.DlKLS3o6DxWVIGjo3m', 'f1', 'Food & Beverage', NULL, 3, 'Active', 1, NULL, NULL, '2026-08-18 10:48:14', '2026-08-23 17:17:32'),
(13, 'kevin.santos', 'kevin.santos@oxfordsuites.com.ph', '$2y$12$ZvXS75gRgB9PmlQPui8Ao.bZlUnSW84Ric.DlKLS3o6DxWVIGjo3m', 'kevin.santos', NULL, NULL, 3, 'Active', 1, NULL, NULL, '2026-08-18 10:50:19', '2026-08-23 17:17:32'),
(14, 'hahakdog', 'hahakdoghahalaman890@gmail.com', '$2y$12$ZvXS75gRgB9PmlQPui8Ao.bZlUnSW84Ric.DlKLS3o6DxWVIGjo3m', 'Andrew e', 'Administration / HR', NULL, 1, 'Active', 1, '2026-08-23 12:55:25', '127.0.0.1', '2026-08-22 11:57:47', '2026-08-23 12:55:25'),
(15, 'naniboogsh', 'naniboogsh890123@gmail.com', '$2y$12$ZvXS75gRgB9PmlQPui8Ao.bZlUnSW84Ric.DlKLS3o6DxWVIGjo3m', 'Nani Boogsh', 'Administration / HR', NULL, 3, 'Active', 1, '2026-08-23 12:53:42', '127.0.0.1', '2026-08-22 11:57:47', '2026-08-23 12:53:42'),
(16, 'juniorespe', 'juniorespenapogi@gmail.com', '$2y$12$ZvXS75gRgB9PmlQPui8Ao.bZlUnSW84Ric.DlKLS3o6DxWVIGjo3m', 'Juniorespe Napogi', 'Administration / HR', NULL, 2, 'Active', 1, NULL, NULL, '2026-08-22 12:10:37', '2026-08-23 17:17:32');

-- --------------------------------------------------------

--
-- Table structure for table `user_login_activity`
--

DROP TABLE IF EXISTS `user_login_activity`;
CREATE TABLE `user_login_activity` (
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
) ENGINE=InnoDB AUTO_INCREMENT=83 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
(82, 3, '2026-08-26 08:25:17', '127.0.0.1', 'Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'success');

-- --------------------------------------------------------

--
-- Table structure for table `work_schedules`
--

DROP TABLE IF EXISTS `work_schedules`;
CREATE TABLE `work_schedules` (
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
