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
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `task_manager`
--

LOCK TABLES `task_manager` WRITE;
/*!40000 ALTER TABLE `task_manager` DISABLE KEYS */;
INSERT INTO `task_manager` VALUES (1,'aaa','bba','To Do','Low','Admin User','Admin',NULL,7,NULL),(3,'ff','22','In Progress','High','Admin User','Default Role',NULL,8,'ttt'),(4,'Hello World','222','To Do','High','Admin User','Admin',NULL,10,'TTT'),(5,'ff','ff2','In Progress','Medium','testing0101','Tester',NULL,5,'ttt'),(6,'Hello World','Y','In Progress','High','product manager testing 1','Project Manager',1,22,'UU'),(7,'Hello World','111','To Do','Medium','Admin User','Admin',2,14,'2'),(8,'Hello World','hee','To Do','Medium','developer testing 1','Developer',3,21,'11'),(9,'ff123','testing25','To Do','Medium','Admin User','Admin',2,7,'gsdfgsdfg'),(10,'testing25demo','demo1edited','Review','Low','Admin User','Admin',3,12,'this is demo task.bilibala hello world');
/*!40000 ALTER TABLE `task_manager` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-17 16:37:40
