CREATE DATABASE  IF NOT EXISTS `agile_dashboard` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `agile_dashboard`;
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
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,2,'You have been added to project: testing noti 2',0,'2026-02-19 03:54:47'),(2,4,'You have been added to project: testing noti 2',0,'2026-02-19 03:54:52');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project_members`
--

DROP TABLE IF EXISTS `project_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_members` (
  `id` int NOT NULL AUTO_INCREMENT,
  `project_id` int NOT NULL,
  `user_id` int NOT NULL,
  `joined_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_project` (`project_id`,`user_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `project_members_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `project_members_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_members`
--

LOCK TABLES `project_members` WRITE;
/*!40000 ALTER TABLE `project_members` DISABLE KEYS */;
INSERT INTO `project_members` VALUES (1,9,2,'2026-02-17 08:34:48'),(2,9,4,'2026-02-17 08:34:52'),(3,8,6,'2026-02-17 08:35:20'),(4,8,3,'2026-02-17 08:35:21'),(5,8,4,'2026-02-17 08:35:23'),(6,8,1,'2026-02-17 08:35:24'),(7,7,2,'2026-02-18 03:04:07'),(9,7,4,'2026-02-18 03:04:12'),(10,7,5,'2026-02-18 03:04:14'),(11,4,1,'2026-02-19 03:31:06'),(12,4,2,'2026-02-19 03:31:08'),(13,4,3,'2026-02-19 03:31:09'),(14,4,4,'2026-02-19 03:31:11'),(15,4,5,'2026-02-19 03:31:12'),(16,4,6,'2026-02-19 03:31:13'),(17,10,2,'2026-02-19 03:41:49'),(18,10,3,'2026-02-19 03:41:50'),(20,10,1,'2026-02-19 03:41:56'),(21,10,6,'2026-02-19 03:43:17'),(22,10,5,'2026-02-19 03:43:52'),(23,11,2,'2026-02-19 03:54:47'),(24,11,4,'2026-02-19 03:54:52');
/*!40000 ALTER TABLE `project_members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project_messages`
--

DROP TABLE IF EXISTS `project_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `project_id` int NOT NULL,
  `user_id` int NOT NULL,
  `user_name` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `project_id` (`project_id`),
  CONSTRAINT `project_messages_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_messages`
--

LOCK TABLES `project_messages` WRITE;
/*!40000 ALTER TABLE `project_messages` DISABLE KEYS */;
INSERT INTO `project_messages` VALUES (1,1,1,'Admin User','hi','2026-02-19 03:15:39'),(2,9,1,'Admin User','testing testing','2026-02-19 03:16:04'),(3,9,3,'Testing PM','what up','2026-02-19 03:16:23'),(4,8,3,'Testing PM','hello','2026-02-19 03:21:23'),(5,1,1,'Admin User','hello','2026-02-19 10:08:34'),(6,1,3,'Testing PM','hi','2026-02-19 10:24:09');
/*!40000 ALTER TABLE `project_messages` ENABLE KEYS */;
UNLOCK TABLES;

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
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `projects`
--

LOCK TABLES `projects` WRITE;
/*!40000 ALTER TABLE `projects` DISABLE KEYS */;
INSERT INTO `projects` VALUES (1,'123','123','To Do',NULL,'2025-11-24 16:58:18','2026-02-18','2026-03-11',2,'Testing PM'),(2,'123','123','To Do',NULL,'2025-11-24 16:58:20',NULL,NULL,0,NULL),(3,'Testing 1','this is testing from 2/12/2025','To Do',NULL,'2025-12-01 17:13:26',NULL,NULL,0,'product manager testing 1'),(4,'asfasdf','asdfasdf','To Do',NULL,'2025-12-01 17:13:34',NULL,NULL,0,'Testing PM'),(5,'asdfasdf','asdfasdf','To Do',NULL,'2025-12-01 17:13:43',NULL,NULL,0,NULL),(6,'Hello World','testing hahaha','To Do',NULL,'2025-12-01 17:23:28',NULL,NULL,3,NULL),(7,'ff123','aa','To Do',NULL,'2026-01-27 15:28:43','2026-01-14','2026-01-21',2,''),(8,'testing25demo','this is a demo project','To Do',NULL,'2026-02-05 03:31:57','2026-03-12','2026-02-19',3,'Testing PM'),(9,'ProjectNY','This is going to test pm selection','To Do',NULL,'2026-02-17 08:12:26','2026-02-17','2026-03-05',5,'Testing PM'),(10,'Testing notification','use to test noti','To Do',NULL,'2026-02-19 03:40:44','2026-03-05','2026-02-03',4,'Testing PM'),(11,'testing noti 2','','To Do',NULL,'2026-02-19 03:53:50','2026-02-11','2026-03-04',1,'product manager testing 1');
/*!40000 ALTER TABLE `projects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sprints`
--

DROP TABLE IF EXISTS `sprints`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sprints` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `time_range` varchar(255) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `task_count` int DEFAULT '0',
  `completed_count` int DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sprints`
--

LOCK TABLES `sprints` WRITE;
/*!40000 ALTER TABLE `sprints` DISABLE KEYS */;
INSERT INTO `sprints` VALUES (1,'Sprint 1','2025.10.1-2025.10.7','In progress',5,2),(2,'Sprint 2','2025.10.8-2025.10.14','done',3,3);
/*!40000 ALTER TABLE `sprints` ENABLE KEYS */;
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
  `sprint` int DEFAULT NULL,
  `noDates` int NOT NULL,
  `userStory` text,
  `codeUrl` text,
  `testCase` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `task_manager`
--

LOCK TABLES `task_manager` WRITE;
/*!40000 ALTER TABLE `task_manager` DISABLE KEYS */;
INSERT INTO `task_manager` VALUES (1,'aaa','bba','BA(Business Analyst)','Low','Admin User','Admin',NULL,7,'11',NULL,NULL),(3,'ff','22','In Progress','High','Admin User','Default Role',NULL,8,'ttt',NULL,NULL),(4,'Hello World','222','To Do','High','Admin User','Admin',NULL,10,'TTT',NULL,NULL),(5,'ff','ff2','In Progress','Medium','testing0101','Tester',NULL,5,'ttt',NULL,NULL),(6,'Hello World','Y','In Progress','High','product manager testing 1','Project Manager',1,22,'yy11',NULL,'Test Case1'),(7,'Hello World','111','To Do','Medium','Admin User','Admin',2,14,'2',NULL,NULL),(8,'Hello World','hee','To Do','Medium','developer testing 1','Developer',3,21,'11',NULL,NULL),(9,'ff123','testing25','To Do','Medium','Admin User','Admin',2,7,'gsdfgsdfg',NULL,NULL),(10,'testing25demo','demo1edited','Review','Low','Admin User','Admin',3,12,'this is demo task.bilibala hello world',NULL,NULL),(11,'Testing notification','11','To Do','Medium','Testing PM','Project Manager',4,2,'yyy',NULL,NULL),(12,'Testing notification','22','To Do','Medium','Testing PM','Project Manager',4,44,'4',NULL,NULL),(13,'testing noti 2','222','dev(developer)','Medium','BA1','Business Analyst',1,22,'111',NULL,NULL),(14,'ProjectNY','pro','test(tester)','Low','TA00','Tester',5,22,NULL,NULL,NULL),(15,'testing25demo','11','dev(developer)','Medium','product manager testing 1','Project Manager',3,2,NULL,NULL,NULL),(16,'testing25demo','tt','BA(Business Analyst)','Medium','BA1','Business Analyst',3,2,NULL,NULL,NULL),(17,'testing noti 2','o','BA(Business Analyst)','Medium','developer testing 1','Developer',1,2,NULL,'http://localhost:5173/task-manager',NULL);
/*!40000 ALTER TABLE `task_manager` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tasks`
--

DROP TABLE IF EXISTS `tasks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tasks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `assignee` varchar(100) DEFAULT NULL,
  `status` varchar(50) NOT NULL,
  `sprint_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `sprint_id` (`sprint_id`),
  CONSTRAINT `tasks_ibfk_1` FOREIGN KEY (`sprint_id`) REFERENCES `sprints` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tasks`
--

LOCK TABLES `tasks` WRITE;
/*!40000 ALTER TABLE `tasks` DISABLE KEYS */;
INSERT INTO `tasks` VALUES (1,'Progress report export function','Osman','completed',1),(2,'User Permission Management','Lucas','completed',1),(3,'Mobile adaptation','Desmond','inProgress',2),(4,'Unit test writing','Lucas','todo',2),(5,'Burn-down chart data statistics API','Samson','completed',1),(6,'Design the login page UI','Osman','completed',1),(7,'Implement user authentication API','Desmond','todo',2),(8,'Database schema design','Lucas','inProgress',2),(10,'this is demo task 1','','completed',1),(11,'ths is demo 2','osman','completed',2);
/*!40000 ALTER TABLE `tasks` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin@test.com','123','Admin User','Admin','2025-11-24 15:31:35'),(2,'testing0101@test.com.hk','0101','testing0101','UAT User','2026-01-01 04:45:16'),(3,'testingpm@test.com','123','Testing PM','Project Manager','2026-01-23 08:21:52'),(4,'dt1@test.com','123','developer testing 1','Developer','2026-01-24 02:27:06'),(5,'productmt1@test.com','123','product manager testing 1','Project Manager','2026-01-24 02:27:40'),(6,'testing251@test.com','1234','testing25','Developer','2026-02-05 03:31:09'),(8,'ba@gmail.com','123','BA1','Business Analyst','2026-02-19 10:31:58'),(9,'ta22@gmail.com','123','TA00','Tester','2026-02-19 11:19:50');
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

-- Dump completed on 2026-02-21 17:09:43
