-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: hotel_hr
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Dumping data for table `job_posts`
--
-- WHERE:  job_post_id=53

LOCK TABLES `job_posts` WRITE;
/*!40000 ALTER TABLE `job_posts` DISABLE KEYS */;
INSERT INTO `job_posts` VALUES (53,'executive-chef','Executive Chef',3,12,'Full-time','Shifting Schedule',65000.00,90000.00,1,0,'2026-10-14','Draft',0,0,0,NULL,NULL,NULL,NULL,'[]','[]','[]','[]','Interested applicants may send their updated resume through this posting or walk-in for an interview at the HR Office, Oxford Suites Makati.','Oxford Suites Makati is a premier all-suite hotel in the heart of Makati\'s business district, known for warm Filipino hospitality and dependable service.',NULL,'[\"title\",\"info\",\"skills\",\"about\",\"description\",\"responsibilities\",\"qualifications\",\"additional\",\"instructions\",\"picture\"]','2026-10-14 05:07:43','2026-10-14 05:12:28');
/*!40000 ALTER TABLE `job_posts` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-14 22:28:58
