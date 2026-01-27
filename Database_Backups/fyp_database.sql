-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: agile_dashboard
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `projects`
--

DROP TABLE IF EXISTS `projects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `projects` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  `status` varchar(50) DEFAULT 'To Do',
  `owner_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `sprint_count` int DEFAULT '0',
  `project_manager` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `owner_id` (`owner_id`),
  CONSTRAINT `projects_ibfk_1` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `projects`
--

LOCK TABLES `projects` WRITE;
/*!40000 ALTER TABLE `projects` DISABLE KEYS */;
INSERT INTO `projects` VALUES (1,'123','123','To Do',NULL,'2025-11-24 16:58:18',NULL,NULL,0,NULL),(2,'123','123','To Do',NULL,'2025-11-24 16:58:20',NULL,NULL,0,NULL),(3,'Testing 1','this is testing from 2/12/2025','To Do',NULL,'2025-12-01 17:13:26',NULL,NULL,0,NULL),(4,'asfasdf','asdfasdf','To Do',NULL,'2025-12-01 17:13:34',NULL,NULL,0,NULL),(5,'asdfasdf','asdfasdf','To Do',NULL,'2025-12-01 17:13:43',NULL,NULL,0,NULL),(6,'Hello World','testing hahaha','To Do',NULL,'2025-12-01 17:23:28',NULL,NULL,0,NULL);
/*!40000 ALTER TABLE `projects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `task_manager`
--

DROP TABLE IF EXISTS `task_manager`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `task_manager` (
  `id` int NOT NULL AUTO_INCREMENT,
  `project` varchar(80) NOT NULL,
  `title` varchar(80) NOT NULL,
  `status` varchar(45) NOT NULL,
  `priority` varchar(45) NOT NULL,
  `assignee` varchar(255) NOT NULL,
  `role` varchar(50) NOT NULL DEFAULT 'Default Role',
  `dueDate` date NOT NULL,
  `userStory` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `task_manager`
--

LOCK TABLES `task_manager` WRITE;
/*!40000 ALTER TABLE `task_manager` DISABLE KEYS */;
INSERT INTO `task_manager` VALUES (1,'aaa','bba','To Do','Low','Admin User','Admin','2026-01-21',NULL),(3,'ff','22','In Progress','High','Admin User','Default Role','2026-01-27','ttt'),(4,'Hello World','177','To Do','High','Admin User','Admin','2026-01-29',NULL),(5,'ff','ff2','In Progress','Medium','testing0101','Tester','2026-01-28','ttt');
/*!40000 ALTER TABLE `task_manager` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `role` varchar(50) DEFAULT 'Member',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin@test.com','123','Admin User','Admin','2025-11-24 15:31:35'),(2,'testing0101@test.com','0101','testing0101','Tester','2026-01-01 04:45:16'),(3,'testingpm@test.com','123','Testing PM','Product Manager','2026-01-23 08:21:52'),(4,'dt1@test.com','123','developer testing 1','Developer','2026-01-24 02:27:06'),(5,'productmt1@test.com','123','product manager testing 1','Product Manager','2026-01-24 02:27:40');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-27 22:53:37
