CREATE DATABASE  IF NOT EXISTS `store_management` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `store_management`;
-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: store_management
-- ------------------------------------------------------
-- Server version	8.0.43

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
-- Table structure for table `cart_items`
--

DROP TABLE IF EXISTS `cart_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart_items` (
  `id_cart_item` int NOT NULL AUTO_INCREMENT,
  `id_cart` int NOT NULL,
  `id_product` int NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `added_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_cart_item`),
  UNIQUE KEY `uq_cart_items_cart_product` (`id_cart`,`id_product`),
  KEY `idx_cart_items_cart` (`id_cart`),
  KEY `idx_cart_items_product` (`id_product`),
  CONSTRAINT `fk_cart_items_cart` FOREIGN KEY (`id_cart`) REFERENCES `carts` (`id_cart`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_cart_items_product` FOREIGN KEY (`id_product`) REFERENCES `products` (`id_product`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `cart_items_chk_1` CHECK ((`quantity` > 0))
) ENGINE=InnoDB AUTO_INCREMENT=110 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart_items`
--

LOCK TABLES `cart_items` WRITE;
/*!40000 ALTER TABLE `cart_items` DISABLE KEYS */;
INSERT INTO `cart_items` VALUES (13,3,27,1,'2025-11-19 03:53:07'),(14,3,26,1,'2025-11-19 03:53:08'),(15,3,20,1,'2025-11-19 03:53:12'),(16,3,19,2,'2025-11-19 03:53:12'),(17,3,21,1,'2025-11-19 03:53:14'),(18,3,17,2,'2025-11-19 03:53:15'),(21,4,12,1,'2025-11-19 15:33:19'),(22,4,7,1,'2025-11-19 15:33:34'),(28,5,8,1,'2025-11-20 07:43:33'),(30,5,5,1,'2025-11-20 07:43:35'),(108,1,8,2,'2025-12-22 05:39:51'),(109,1,17,1,'2025-12-22 05:39:55');
/*!40000 ALTER TABLE `cart_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `carts`
--

DROP TABLE IF EXISTS `carts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `carts` (
  `id_cart` int NOT NULL AUTO_INCREMENT,
  `id_customer` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_cart`),
  UNIQUE KEY `uq_carts_customer` (`id_customer`),
  CONSTRAINT `fk_carts_customer` FOREIGN KEY (`id_customer`) REFERENCES `customers` (`id_customer`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `carts`
--

LOCK TABLES `carts` WRITE;
/*!40000 ALTER TABLE `carts` DISABLE KEYS */;
INSERT INTO `carts` VALUES (1,5,'2025-11-12 16:19:32','2025-11-12 16:19:32'),(3,12,'2025-11-19 03:53:07','2025-11-19 03:53:07'),(4,13,'2025-11-19 15:33:19','2025-11-19 15:33:19'),(5,15,'2025-11-20 07:43:26','2025-11-20 07:43:26'),(6,16,'2025-11-20 11:40:19','2025-11-20 11:40:19'),(7,7,'2025-11-20 15:38:01','2025-11-20 15:38:01');
/*!40000 ALTER TABLE `carts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id_category` int NOT NULL AUTO_INCREMENT,
  `category_name` varchar(255) NOT NULL,
  `code_prefix` varchar(10) DEFAULT '' COMMENT 'Prefix cho SKU: SP, LT, AO...',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_category`),
  UNIQUE KEY `uq_categories_name` (`category_name`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Điện thoại','DT','2025-11-08 16:29:33','2025-11-08 16:29:33'),(2,'Laptop','LT','2025-11-08 16:29:33','2025-11-08 16:29:33'),(3,'Tablet','TB','2025-11-08 16:29:33','2025-11-08 16:29:33'),(4,'Phụ kiện','PK','2025-11-08 16:29:33','2025-11-08 16:29:33'),(5,'Đồng hồ thông minh','DH','2025-11-08 16:29:33','2025-11-08 16:29:33');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chat_conversations`
--

DROP TABLE IF EXISTS `chat_conversations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chat_conversations` (
  `id_conversation` int NOT NULL AUTO_INCREMENT,
  `id_customer` int NOT NULL,
  `status` enum('OPEN','CLOSED') DEFAULT 'OPEN',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `last_viewed_by_admin_at` datetime DEFAULT NULL COMMENT 'Thời gian admin/employee xem conversation lần cuối',
  `last_viewed_by_customer_at` datetime DEFAULT NULL COMMENT 'Thời gian customer xem conversation lần cuối',
  PRIMARY KEY (`id_conversation`),
  KEY `idx_chat_conversations_customer` (`id_customer`),
  KEY `idx_chat_conversations_status` (`status`),
  KEY `idx_chat_conversations_last_viewed_admin` (`last_viewed_by_admin_at`),
  KEY `idx_chat_conversations_last_viewed_customer` (`last_viewed_by_customer_at`),
  CONSTRAINT `fk_chat_conversations_customer` FOREIGN KEY (`id_customer`) REFERENCES `customers` (`id_customer`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chat_conversations`
--

LOCK TABLES `chat_conversations` WRITE;
/*!40000 ALTER TABLE `chat_conversations` DISABLE KEYS */;
INSERT INTO `chat_conversations` VALUES (9,5,'OPEN','2025-11-13 03:24:17','2025-12-22 10:00:49','2025-12-22 17:00:49',NULL),(11,13,'OPEN','2025-11-19 08:07:58','2025-12-17 05:40:29','2025-12-17 12:40:29',NULL),(12,16,'OPEN','2025-11-20 04:40:08','2025-12-17 05:40:27','2025-12-17 12:40:27',NULL),(13,7,'OPEN','2025-11-20 08:50:01','2025-12-17 05:40:30','2025-12-17 12:40:30',NULL);
/*!40000 ALTER TABLE `chat_conversations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chat_messages`
--

DROP TABLE IF EXISTS `chat_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chat_messages` (
  `id_message` int NOT NULL AUTO_INCREMENT,
  `id_conversation` int NOT NULL,
  `sender_id` int NOT NULL COMMENT 'ID of user (customer/employee/admin)',
  `sender_type` enum('CUSTOMER','ADMIN','EMPLOYEE') NOT NULL,
  `message` text NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_message`),
  KEY `idx_chat_messages_conversation` (`id_conversation`),
  KEY `idx_chat_messages_sender` (`sender_id`,`sender_type`),
  KEY `idx_chat_messages_created` (`id_conversation`,`created_at`),
  CONSTRAINT `fk_chat_messages_conversation` FOREIGN KEY (`id_conversation`) REFERENCES `chat_conversations` (`id_conversation`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=128 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chat_messages`
--

LOCK TABLES `chat_messages` WRITE;
/*!40000 ALTER TABLE `chat_messages` DISABLE KEYS */;
INSERT INTO `chat_messages` VALUES (1,9,8,'EMPLOYEE','alo','2025-11-13 05:25:46','2025-11-13 05:25:46'),(2,9,9,'CUSTOMER','alo','2025-11-13 05:25:54','2025-11-13 05:25:54'),(3,9,10,'EMPLOYEE','hello','2025-11-13 05:27:43','2025-11-13 05:27:43'),(4,9,9,'CUSTOMER','xin chao','2025-11-13 05:55:01','2025-11-13 05:55:01'),(5,9,10,'EMPLOYEE','chao ban','2025-11-13 05:55:07','2025-11-13 05:55:07'),(6,9,10,'EMPLOYEE','ban can giup gi','2025-11-13 05:55:13','2025-11-13 05:55:13'),(7,9,9,'CUSTOMER','khong co gi','2025-11-13 05:55:19','2025-11-13 05:55:19'),(8,9,9,'CUSTOMER','test thoi hehe','2025-11-13 05:55:22','2025-11-13 05:55:22'),(9,9,9,'CUSTOMER','...','2025-11-13 06:06:49','2025-11-13 06:06:49'),(10,9,10,'EMPLOYEE','.....','2025-11-13 06:06:56','2025-11-13 06:06:56'),(11,9,9,'CUSTOMER','...','2025-11-13 06:12:51','2025-11-13 06:12:51'),(12,9,10,'EMPLOYEE','....','2025-11-13 06:12:55','2025-11-13 06:12:55'),(13,9,10,'EMPLOYEE','....','2025-11-13 06:12:59','2025-11-13 06:12:59'),(14,9,9,'CUSTOMER','...','2025-11-13 06:17:40','2025-11-13 06:17:40'),(15,9,10,'EMPLOYEE','..','2025-11-13 06:17:48','2025-11-13 06:17:48'),(16,9,9,'CUSTOMER','...','2025-11-13 06:17:58','2025-11-13 06:17:58'),(17,9,10,'EMPLOYEE','....','2025-11-13 06:18:04','2025-11-13 06:18:04'),(18,9,9,'CUSTOMER','hello','2025-11-13 09:13:55','2025-11-13 09:13:55'),(19,9,9,'CUSTOMER','...','2025-11-13 09:22:48','2025-11-13 09:22:48'),(20,9,10,'EMPLOYEE','dfd','2025-11-13 09:23:24','2025-11-13 09:23:24'),(21,9,9,'CUSTOMER','dfdf','2025-11-13 09:23:32','2025-11-13 09:23:32'),(22,9,10,'EMPLOYEE','dfdf','2025-11-13 09:23:37','2025-11-13 09:23:37'),(23,9,9,'CUSTOMER','...','2025-11-13 09:25:12','2025-11-13 09:25:12'),(24,9,10,'EMPLOYEE','...','2025-11-13 09:38:24','2025-11-13 09:38:24'),(25,9,9,'CUSTOMER','.....','2025-11-13 09:38:41','2025-11-13 09:38:41'),(26,9,10,'EMPLOYEE','....','2025-11-13 09:38:53','2025-11-13 09:38:53'),(27,9,9,'CUSTOMER','.....','2025-11-13 09:38:57','2025-11-13 09:38:57'),(28,9,10,'EMPLOYEE','....','2025-11-13 09:45:20','2025-11-13 09:45:20'),(29,9,9,'CUSTOMER','lô','2025-11-13 09:45:25','2025-11-13 09:45:25'),(30,9,10,'EMPLOYEE','oke','2025-11-13 09:45:29','2025-11-13 09:45:29'),(31,9,8,'EMPLOYEE','test','2025-11-13 09:45:48','2025-11-13 09:45:48'),(32,9,9,'CUSTOMER','oke','2025-11-13 09:45:52','2025-11-13 09:45:52'),(36,9,9,'CUSTOMER','test widget badge','2025-11-14 10:45:38','2025-11-14 10:45:38'),(37,9,9,'CUSTOMER','test again','2025-11-14 10:45:58','2025-11-14 10:45:58'),(39,9,8,'EMPLOYEE','oke','2025-11-14 10:46:34','2025-11-14 10:46:34'),(40,9,8,'EMPLOYEE','hello','2025-11-14 11:01:56','2025-11-14 11:01:56'),(41,9,9,'CUSTOMER','alo','2025-11-14 11:02:15','2025-11-14 11:02:15'),(42,9,8,'EMPLOYEE','alo','2025-11-14 11:11:30','2025-11-14 11:11:30'),(43,9,9,'CUSTOMER','alo','2025-11-14 11:11:48','2025-11-14 11:11:48'),(44,9,8,'EMPLOYEE','alo','2025-11-14 11:12:05','2025-11-14 11:12:05'),(46,9,8,'EMPLOYEE','alo','2025-11-14 11:12:15','2025-11-14 11:12:15'),(47,9,8,'EMPLOYEE','alo','2025-11-14 11:12:28','2025-11-14 11:12:28'),(48,9,9,'CUSTOMER','alo','2025-11-14 11:12:47','2025-11-14 11:12:47'),(49,9,8,'EMPLOYEE','alo','2025-11-14 11:13:08','2025-11-14 11:13:08'),(50,9,10,'EMPLOYEE','alo','2025-11-14 11:16:19','2025-11-14 11:16:19'),(52,9,8,'EMPLOYEE','alo','2025-11-14 11:16:57','2025-11-14 11:16:57'),(54,11,18,'CUSTOMER','alo','2025-11-19 08:08:04','2025-11-19 08:08:04'),(55,11,8,'EMPLOYEE','xin chào, tôi có thể giúp gì cho bạn','2025-11-19 08:09:12','2025-11-19 08:09:12'),(57,9,9,'CUSTOMER','alo','2025-11-19 09:49:59','2025-11-19 09:49:59'),(58,9,8,'EMPLOYEE','xin cahof','2025-11-19 21:53:41','2025-11-19 21:53:41'),(59,9,9,'CUSTOMER','oke','2025-11-19 21:54:07','2025-11-19 21:54:07'),(60,9,8,'EMPLOYEE','oke','2025-11-19 21:54:21','2025-11-19 21:54:21'),(62,9,9,'CUSTOMER','ghf','2025-11-19 21:56:00','2025-11-19 21:56:00'),(63,12,22,'CUSTOMER','alo','2025-11-20 04:40:11','2025-11-20 04:40:11'),(64,12,8,'EMPLOYEE','oke','2025-11-20 04:41:17','2025-11-20 04:41:17'),(65,9,8,'EMPLOYEE','hello','2025-11-20 04:41:49','2025-11-20 04:41:49'),(66,9,8,'EMPLOYEE','hi','2025-11-20 04:41:57','2025-11-20 04:41:57'),(67,9,8,'EMPLOYEE','hi','2025-11-20 04:42:03','2025-11-20 04:42:03'),(68,9,8,'EMPLOYEE','hi','2025-11-20 04:42:17','2025-11-20 04:42:17'),(69,9,8,'EMPLOYEE','hi','2025-11-20 04:42:23','2025-11-20 04:42:23'),(70,9,8,'EMPLOYEE','hello','2025-11-20 05:11:03','2025-11-20 05:11:03'),(71,9,8,'EMPLOYEE','hello','2025-11-20 05:11:10','2025-11-20 05:11:10'),(72,9,8,'EMPLOYEE','hêlo','2025-11-20 05:11:12','2025-11-20 05:11:12'),(73,9,8,'EMPLOYEE','hêlo','2025-11-20 05:11:15','2025-11-20 05:11:15'),(74,9,8,'EMPLOYEE','hêlo','2025-11-20 05:11:22','2025-11-20 05:11:22'),(75,11,8,'EMPLOYEE','hêlo','2025-11-20 05:11:28','2025-11-20 05:11:28'),(76,11,8,'EMPLOYEE','jdfd','2025-11-20 05:11:30','2025-11-20 05:11:30'),(77,11,8,'EMPLOYEE','fdfd','2025-11-20 05:11:31','2025-11-20 05:11:31'),(78,11,8,'EMPLOYEE','fdfd','2025-11-20 05:11:32','2025-11-20 05:11:32'),(79,11,8,'EMPLOYEE','fdfd','2025-11-20 05:11:33','2025-11-20 05:11:33'),(80,9,8,'EMPLOYEE','alo','2025-11-20 05:36:09','2025-11-20 05:36:09'),(81,9,8,'EMPLOYEE','alo','2025-11-20 05:36:12','2025-11-20 05:36:12'),(82,9,8,'EMPLOYEE','alo','2025-11-20 05:36:18','2025-11-20 05:36:18'),(83,9,8,'EMPLOYEE','alo','2025-11-20 05:37:30','2025-11-20 05:37:30'),(84,12,22,'CUSTOMER','bvbv','2025-11-20 06:13:58','2025-11-20 06:13:58'),(85,9,9,'CUSTOMER','hgfhg','2025-11-20 06:14:18','2025-11-20 06:14:18'),(86,9,9,'CUSTOMER','tytr','2025-11-20 06:14:19','2025-11-20 06:14:19'),(87,9,9,'CUSTOMER','ghh','2025-11-20 06:14:23','2025-11-20 06:14:23'),(88,9,8,'EMPLOYEE','fgfgfg','2025-11-20 06:14:34','2025-11-20 06:14:34'),(89,9,8,'EMPLOYEE','fgfh','2025-11-20 07:36:45','2025-11-20 07:36:45'),(90,9,8,'EMPLOYEE','fgfh','2025-11-20 07:36:46','2025-11-20 07:36:46'),(91,9,8,'EMPLOYEE','ghghgh','2025-11-20 07:36:48','2025-11-20 07:36:48'),(92,9,8,'EMPLOYEE','fgf','2025-11-20 07:36:50','2025-11-20 07:36:50'),(93,13,8,'EMPLOYEE','adfd','2025-11-20 09:07:56','2025-11-20 09:07:56'),(94,13,11,'CUSTOMER','alo','2025-11-21 01:58:16','2025-11-21 01:58:16'),(95,13,8,'EMPLOYEE','hello','2025-11-21 01:58:28','2025-11-21 01:58:28'),(96,13,11,'CUSTOMER','oke','2025-11-21 01:58:39','2025-11-21 01:58:39'),(97,9,9,'CUSTOMER','xin chào','2025-12-11 09:24:21','2025-12-11 09:24:21'),(98,9,8,'EMPLOYEE','oki','2025-12-11 09:24:28','2025-12-11 09:24:28'),(99,9,8,'EMPLOYEE','alo','2025-12-13 00:28:31','2025-12-13 00:28:31'),(100,9,9,'CUSTOMER','hi','2025-12-13 00:28:52','2025-12-13 00:28:52'),(101,9,8,'EMPLOYEE','xin chào','2025-12-13 00:29:01','2025-12-13 00:29:01'),(102,9,8,'EMPLOYEE','hello','2025-12-16 09:47:20','2025-12-16 09:47:20'),(103,9,9,'CUSTOMER','alo','2025-12-16 09:47:32','2025-12-16 09:47:32'),(104,9,8,'EMPLOYEE','alo','2025-12-16 09:47:36','2025-12-16 09:47:36'),(105,9,9,'CUSTOMER','xin chào','2025-12-16 09:47:56','2025-12-16 09:47:56'),(106,9,8,'EMPLOYEE','....','2025-12-17 00:01:53','2025-12-17 00:01:53'),(107,9,9,'CUSTOMER','tytyu','2025-12-17 00:02:02','2025-12-17 00:02:02'),(108,9,8,'EMPLOYEE','fgg','2025-12-17 00:02:17','2025-12-17 00:02:17'),(109,9,8,'EMPLOYEE','...','2025-12-17 05:34:36','2025-12-17 05:34:36'),(110,9,9,'CUSTOMER','uyuyuy','2025-12-17 05:34:43','2025-12-17 05:34:43'),(111,9,8,'EMPLOYEE','fff','2025-12-17 05:34:54','2025-12-17 05:34:54'),(112,9,8,'EMPLOYEE','ll','2025-12-17 05:39:34','2025-12-17 05:39:34'),(113,9,8,'EMPLOYEE','xin chao','2025-12-17 05:45:04','2025-12-17 05:45:04'),(114,9,8,'EMPLOYEE','hello','2025-12-17 05:45:47','2025-12-17 05:45:47'),(115,9,8,'EMPLOYEE','jjj','2025-12-17 05:45:59','2025-12-17 05:45:59'),(116,9,8,'EMPLOYEE','oke','2025-12-17 05:46:04','2025-12-17 05:46:04'),(117,9,9,'CUSTOMER','oach xa lach','2025-12-17 05:46:19','2025-12-17 05:46:19'),(118,9,9,'CUSTOMER','oke','2025-12-17 05:46:32','2025-12-17 05:46:32'),(119,9,8,'EMPLOYEE','gfg','2025-12-17 05:55:29','2025-12-17 05:55:29'),(120,9,8,'EMPLOYEE','dfdfd','2025-12-17 06:01:49','2025-12-17 06:01:49'),(121,9,9,'CUSTOMER','dvf','2025-12-17 06:01:54','2025-12-17 06:01:54'),(122,9,8,'EMPLOYEE','dfd','2025-12-18 09:39:16','2025-12-18 09:39:16'),(123,9,9,'CUSTOMER','dfd','2025-12-18 09:39:20','2025-12-18 09:39:20'),(124,9,8,'EMPLOYEE','fdf','2025-12-18 09:39:24','2025-12-18 09:39:24'),(125,9,9,'CUSTOMER','fdf','2025-12-18 09:39:27','2025-12-18 09:39:27'),(126,9,9,'CUSTOMER','dfd','2025-12-19 05:43:51','2025-12-19 05:43:51'),(127,9,8,'EMPLOYEE','dfd','2025-12-19 05:43:55','2025-12-19 05:43:55');
/*!40000 ALTER TABLE `chat_messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customers`
--

DROP TABLE IF EXISTS `customers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customers` (
  `id_customer` int NOT NULL AUTO_INCREMENT,
  `id_user` int DEFAULT NULL COMMENT 'Liên kết tới bảng users',
  `customer_name` varchar(255) NOT NULL,
  `address` text,
  `phone_number` varchar(20) NOT NULL,
  `customer_type` enum('VIP','REGULAR') DEFAULT 'REGULAR',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_customer`),
  UNIQUE KEY `uq_customers_phone` (`phone_number`),
  UNIQUE KEY `uq_customers_user` (`id_user`),
  KEY `idx_customer_name` (`customer_name`(100)),
  KEY `idx_customers_name` (`customer_name`),
  KEY `idx_customers_phone` (`phone_number`),
  CONSTRAINT `fk_customers_user` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customers`
--

LOCK TABLES `customers` WRITE;
/*!40000 ALTER TABLE `customers` DISABLE KEYS */;
INSERT INTO `customers` VALUES (5,9,'Nguyễn Văn Chung','Láng, Hà Nội','0123456789','VIP','2025-11-09 08:03:36','2025-12-12 19:47:22'),(7,11,'Ngọc Hải','Láng, Hà Nội','0123656789','REGULAR','2025-11-10 05:20:39','2025-11-10 05:20:39'),(9,14,'Ngọc Hải','Láng, Hà Nội','0123654789','REGULAR','2025-11-11 00:19:24','2025-11-11 00:19:24'),(12,17,'Vũ Ngọc Hải',NULL,'0325436523','REGULAR','2025-11-18 20:53:00','2025-11-18 20:53:00'),(13,18,'Đoàn Đạt',NULL,'0347821934','REGULAR','2025-11-19 08:07:52','2025-11-19 08:07:52'),(14,19,'Minh Đức',NULL,'0345832852','REGULAR','2025-11-19 09:46:05','2025-11-19 09:46:05'),(15,21,'testdk',NULL,'0345735478','REGULAR','2025-11-20 00:43:18','2025-11-20 00:43:18'),(16,22,'Văn Vũ',NULL,'0385343554','REGULAR','2025-11-20 04:39:59','2025-11-20 04:39:59'),(17,23,'Hoang Luong Xuan',NULL,'0983451365','REGULAR','2025-11-21 20:31:53','2025-11-21 20:31:53'),(18,26,'Minh Quân',NULL,'0462875132','REGULAR','2025-12-12 19:10:56','2025-12-12 19:10:56');
/*!40000 ALTER TABLE `customers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employees`
--

DROP TABLE IF EXISTS `employees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employees` (
  `id_employee` int NOT NULL AUTO_INCREMENT,
  `id_user` int DEFAULT NULL COMMENT 'Liên kết tới bảng users',
  `employee_name` varchar(255) NOT NULL,
  `hire_date` date DEFAULT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `address` text,
  `base_salary` decimal(12,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_employee`),
  UNIQUE KEY `uq_employees_user` (`id_user`),
  KEY `idx_employees_name` (`employee_name`),
  KEY `idx_employees_phone` (`phone_number`),
  CONSTRAINT `fk_employees_user` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `employees_chk_1` CHECK ((`base_salary` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employees`
--

LOCK TABLES `employees` WRITE;
/*!40000 ALTER TABLE `employees` DISABLE KEYS */;
INSERT INTO `employees` VALUES (4,10,'Vũ Ngọc Hải','2000-10-03','0912345672','Nam Định',10000000.00,'2025-11-09 08:10:08','2025-11-09 08:10:08'),(5,12,'Vũ Ngọc Hải','2000-10-03','0915345672','Nam Định',10000000.00,'2025-11-10 05:21:17','2025-11-10 05:21:17'),(6,15,'Vũ Ngọc Hải','2000-10-03','0915325672','Nam Định',10000000.00,'2025-11-11 00:32:45','2025-11-11 00:32:45'),(8,24,'Minh Quân',NULL,'0934612452',NULL,NULL,'2025-12-10 22:30:44','2025-12-10 22:30:44'),(9,27,'V Hải',NULL,'0943523745',NULL,NULL,'2025-12-16 09:42:09','2025-12-16 09:42:09');
/*!40000 ALTER TABLE `employees` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `flyway_schema_history`
--

DROP TABLE IF EXISTS `flyway_schema_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `flyway_schema_history` (
  `installed_rank` int NOT NULL,
  `version` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `script` varchar(1000) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` int DEFAULT NULL,
  `installed_by` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `installed_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `execution_time` int NOT NULL,
  `success` tinyint(1) NOT NULL,
  PRIMARY KEY (`installed_rank`),
  KEY `flyway_schema_history_s_idx` (`success`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `flyway_schema_history`
--

LOCK TABLES `flyway_schema_history` WRITE;
/*!40000 ALTER TABLE `flyway_schema_history` DISABLE KEYS */;
INSERT INTO `flyway_schema_history` VALUES (1,'1','Initial schema','SQL','V1__Initial_schema.sql',363074177,'root','2025-11-08 16:29:33',555,1),(2,'2','Seed initial data','SQL','V2__Seed_initial_data.sql',-608915367,'root','2025-11-08 16:29:33',8,1),(3,'3','Insert test data','SQL','V3__Insert_test_data.sql',-2027082344,'root','2025-11-08 16:29:33',27,1),(4,'4','Add ecommerce fields','SQL','V4__Add_ecommerce_fields.sql',-699256959,'root','2025-11-08 16:29:33',118,1),(5,'5','Add delivered at to orders','SQL','V5__Add_delivered_at_to_orders.sql',-506170383,'root','2025-11-08 16:29:33',47,1),(6,'6','Add PAYOS payment method','SQL','V6__Add_PAYOS_payment_method.sql',-1859613651,'root','2025-11-08 16:29:33',82,1),(7,'7','Add GHN fields to shipments','SQL','V7__Add_GHN_fields_to_shipments.sql',1121238681,'root','2025-11-08 16:29:34',279,1),(8,'8','Add notifications table','SQL','V8__Add_notifications_table.sql',1402999730,'root','2025-11-09 18:40:23',124,1),(9,'9','Add product images table','SQL','V9__Add_product_images_table.sql',-1376159102,'root','2025-11-09 19:53:04',117,1),(10,'10','Add chat tables','SQL','V10__Add_chat_tables.sql',-1334467984,'root','2025-11-09 19:53:04',80,1),(11,'11','Add updated at to product images','SQL','V11__Add_updated_at_to_product_images.sql',1165879535,'root','2025-11-10 05:44:25',94,1),(12,'12','Add avatar url to users','SQL','V12__Add_avatar_url_to_users.sql',513831504,'root','2025-11-10 09:38:28',77,1),(13,'13','Add product reviews table','SQL','V13__Add_product_reviews_table.sql',-935112182,'root','2025-11-13 05:32:39',188,1),(14,'14','Add promotions and rules tables','SQL','V14__Add_promotions_and_rules_tables.sql',801678916,'root','2025-11-13 05:32:39',239,1),(15,'15','Add GHN fields to shipping addresses','SQL','V15__Add_GHN_fields_to_shipping_addresses.sql',-997477901,'root','2025-11-13 05:32:39',80,1),(16,'16','Add updated at to chat messages','SQL','V16__Add_updated_at_to_chat_messages.sql',-447911544,'root','2025-11-13 10:21:46',93,1),(17,'17','Add last viewed at to chat conversations','SQL','V17__Add_last_viewed_at_to_chat_conversations.sql',-49233947,'root','2025-11-15 15:00:31',135,1),(18,'18','Add admin reply and edit count to reviews','SQL','V18__Add_admin_reply_and_edit_count_to_reviews.sql',-1808707542,'root','2025-11-15 16:59:04',176,1),(19,'19','Add product view table','SQL','V19__Add_product_view_table.sql',907245039,'root','2025-11-20 15:28:32',82,1),(20,'20','Add updated at to product view','SQL','V20__Add_updated_at_to_product_view.sql',43149253,'root','2025-11-20 15:28:32',10,1),(21,'21','Add create order returns','SQL','V21__Add_create_order_returns.sql',1946433636,'root','2025-12-02 05:15:22',174,1),(22,'22','Add extend reference type','SQL','V22__Add_extend_reference_type.sql',1520870065,'root','2025-12-02 05:15:22',83,1),(23,'23','Fix order return schema','SQL','V23__Fix_order_return_schema.sql',-1056987305,'root','2025-12-04 16:56:12',213,1),(24,'24','Create system settings','SQL','V24__Create_system_settings.sql',1565146992,'root','2025-12-10 16:28:46',92,1),(25,'25','Add review edit window setting','SQL','V25__Add_review_edit_window_setting.sql',-139427204,'root','2025-12-10 17:46:04',6,1),(26,'26','Add return window days to orders','SQL','V26__Add_return_window_days_to_orders.sql',-1583333717,'root','2025-12-11 09:58:15',132,1),(27,'27','Add shipping fee to orders','SQL','V27__Add_shipping_fee_to_orders.sql',-677155752,'root','2025-12-11 12:29:53',90,1),(28,'28','Add completed at to orders','SQL','V28__Add_completed_at_to_orders.sql',-355126904,'root','2025-12-11 12:48:34',53,1),(29,'29','Update final amount include shipping fee','SQL','V29__Update_final_amount_include_shipping_fee.sql',1276331028,'root','2025-12-11 13:03:27',139,1),(30,'30','Backfill return snapshot for old orders','SQL','V30__Backfill_return_snapshot_for_old_orders.sql',-541920839,'root','2025-12-11 15:56:50',13,1),(31,'31','optimize order returns search','SQL','V31__optimize_order_returns_search.sql',864451527,'root','2025-12-12 16:33:51',207,1),(32,'32','optimize search indexes','SQL','V32__optimize_search_indexes.sql',1910182326,'root','2025-12-12 17:54:11',636,1),(33,'33','Add promotion scope','SQL','V33__Add_promotion_scope.sql',1748280382,'root','2025-12-12 19:41:42',208,1),(34,'34','recalc purchase orders total amount','SQL','V34__recalc_purchase_orders_total_amount.sql',-45073341,'root','2025-12-13 03:11:05',10,1),(35,'35','Add shipping discount to orders','SQL','V35__Add_shipping_discount_to_orders.sql',1803635996,'root','2025-12-16 07:53:43',305,1),(36,'36','Add invoice print fields','SQL','V36__Add_invoice_print_fields.sql',-2142665432,'root','2025-12-16 16:59:47',215,1),(37,'37','Add password reset tokens table','SQL','V37__Add_password_reset_tokens_table.sql',-1507692204,'root','2025-12-17 06:47:52',79,1),(38,'38','Extend promotion for products','SQL','V38__Extend_promotion_for_products.sql',-1040148052,'root','2025-12-17 07:43:12',107,1),(39,'39','Seed product promotions','SQL','V39__Seed_product_promotions.sql',-1376988087,'root','2025-12-17 07:50:20',16,1),(40,'40','Deprecate notifications table','SQL','V40__Deprecate_notifications_table.sql',915285952,'root','2025-12-17 12:27:20',63,1),(41,'41','Add is delete to products','SQL','V41__Add_is_delete_to_products.sql',-1038708387,'root','2025-12-21 18:04:27',311,1);
/*!40000 ALTER TABLE `flyway_schema_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventory_transactions`
--

DROP TABLE IF EXISTS `inventory_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory_transactions` (
  `id_transaction` int NOT NULL AUTO_INCREMENT,
  `id_product` int NOT NULL,
  `transaction_type` enum('IN','OUT') NOT NULL,
  `quantity` int NOT NULL,
  `reference_type` enum('PURCHASE_ORDER','SALE_ORDER','ADJUSTMENT','SALE_RETURN','SALE_EXCHANGE') DEFAULT NULL,
  `reference_id` int DEFAULT NULL COMMENT 'ID của purchase_orders / orders (tuỳ loại)',
  `transaction_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `id_employee` int DEFAULT NULL,
  `notes` text,
  PRIMARY KEY (`id_transaction`),
  KEY `idx_inv_product` (`id_product`),
  KEY `idx_inv_employee` (`id_employee`),
  KEY `idx_inv_ref` (`reference_type`,`reference_id`),
  CONSTRAINT `fk_inv_employee` FOREIGN KEY (`id_employee`) REFERENCES `employees` (`id_employee`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_inv_product` FOREIGN KEY (`id_product`) REFERENCES `products` (`id_product`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `inventory_transactions_chk_1` CHECK ((`quantity` > 0))
) ENGINE=InnoDB AUTO_INCREMENT=132 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory_transactions`
--

LOCK TABLES `inventory_transactions` WRITE;
/*!40000 ALTER TABLE `inventory_transactions` DISABLE KEYS */;
INSERT INTO `inventory_transactions` VALUES (1,1,'IN',20,'PURCHASE_ORDER',1,'2025-01-05 03:00:00',NULL,'Nhập hàng từ NCC Apple Inc. - Đơn nhập #1'),(2,2,'IN',15,'PURCHASE_ORDER',1,'2025-01-05 03:00:00',NULL,'Nhập hàng từ NCC Apple Inc. - Đơn nhập #1'),(3,11,'IN',5,'PURCHASE_ORDER',1,'2025-01-05 03:00:00',NULL,'Nhập hàng từ NCC Apple Inc. - Đơn nhập #1'),(4,12,'IN',10,'PURCHASE_ORDER',1,'2025-01-05 03:00:00',NULL,'Nhập hàng từ NCC Apple Inc. - Đơn nhập #1'),(5,13,'IN',8,'PURCHASE_ORDER',1,'2025-01-05 03:00:00',NULL,'Nhập hàng từ NCC Apple Inc. - Đơn nhập #1'),(6,16,'IN',50,'PURCHASE_ORDER',1,'2025-01-05 03:00:00',NULL,'Nhập hàng từ NCC Apple Inc. - Đơn nhập #1'),(7,3,'IN',12,'PURCHASE_ORDER',2,'2025-01-10 07:30:00',NULL,'Nhập hàng từ NCC Samsung Electronics - Đơn nhập #2'),(8,4,'IN',50,'PURCHASE_ORDER',2,'2025-01-10 07:30:00',NULL,'Nhập hàng từ NCC Samsung Electronics - Đơn nhập #2'),(9,15,'IN',10,'PURCHASE_ORDER',2,'2025-01-10 07:30:00',NULL,'Nhập hàng từ NCC Samsung Electronics - Đơn nhập #2'),(10,21,'IN',30,'PURCHASE_ORDER',2,'2025-01-10 07:30:00',NULL,'Nhập hàng từ NCC Samsung Electronics - Đơn nhập #2'),(11,17,'IN',40,'PURCHASE_ORDER',2,'2025-01-10 07:30:00',NULL,'Nhập hàng từ NCC Samsung Electronics - Đơn nhập #2'),(12,1,'IN',30,'PURCHASE_ORDER',3,'2025-01-15 02:15:00',NULL,'Nhập hàng từ NCC Apple Inc. - Đơn nhập #3'),(13,13,'IN',12,'PURCHASE_ORDER',3,'2025-01-15 02:15:00',NULL,'Nhập hàng từ NCC Apple Inc. - Đơn nhập #3'),(14,14,'IN',20,'PURCHASE_ORDER',3,'2025-01-15 02:15:00',NULL,'Nhập hàng từ NCC Apple Inc. - Đơn nhập #3'),(15,16,'IN',80,'PURCHASE_ORDER',3,'2025-01-15 02:15:00',NULL,'Nhập hàng từ NCC Apple Inc. - Đơn nhập #3'),(16,20,'IN',25,'PURCHASE_ORDER',3,'2025-01-15 02:15:00',NULL,'Nhập hàng từ NCC Apple Inc. - Đơn nhập #3'),(17,5,'IN',20,'PURCHASE_ORDER',4,'2025-01-20 04:00:00',NULL,'Nhập hàng từ NCC Xiaomi Corporation - Đơn nhập #4'),(18,6,'IN',60,'PURCHASE_ORDER',4,'2025-01-20 04:00:00',NULL,'Nhập hàng từ NCC Xiaomi Corporation - Đơn nhập #4'),(19,7,'IN',10,'PURCHASE_ORDER',5,'2025-01-25 08:45:00',NULL,'Nhập hàng từ NCC HP Inc. - Đơn nhập #5'),(20,8,'IN',8,'PURCHASE_ORDER',5,'2025-01-25 08:45:00',NULL,'Nhập hàng từ NCC HP Inc. - Đơn nhập #5'),(21,7,'OUT',1,'SALE_ORDER',1,'2025-11-09 08:10:33',NULL,'Đơn hàng từ nhân viên cho khách hàng'),(22,5,'OUT',2,'SALE_ORDER',2,'2025-11-09 08:18:07',NULL,'Đơn hàng từ nhân viên cho khách hàng'),(23,10,'OUT',1,'SALE_ORDER',2,'2025-11-09 08:18:07',NULL,'Đơn hàng từ nhân viên cho khách hàng'),(24,5,'OUT',2,'SALE_ORDER',3,'2025-11-09 08:23:49',NULL,'Đơn hàng từ khách hàng (Buy Now)'),(25,7,'OUT',1,'SALE_ORDER',4,'2025-11-09 09:08:22',NULL,'Đơn hàng từ nhân viên cho khách hàng'),(26,5,'OUT',2,'SALE_ORDER',5,'2025-11-09 09:08:43',NULL,'Đơn hàng từ nhân viên cho khách hàng'),(27,10,'OUT',1,'SALE_ORDER',5,'2025-11-09 09:08:43',NULL,'Đơn hàng từ nhân viên cho khách hàng'),(28,5,'OUT',2,'SALE_ORDER',6,'2025-11-09 09:17:16',NULL,'Đơn hàng từ admin cho khách hàng'),(29,10,'OUT',1,'SALE_ORDER',6,'2025-11-09 09:17:16',NULL,'Đơn hàng từ admin cho khách hàng'),(30,1,'IN',10,'PURCHASE_ORDER',6,'2025-11-09 17:21:21',NULL,'Nhập hàng từ NCC Apple Inc. - Đơn nhập #6'),(31,2,'IN',5,'PURCHASE_ORDER',6,'2025-11-09 17:21:21',NULL,'Nhập hàng từ NCC Apple Inc. - Đơn nhập #6'),(32,1,'IN',10,'PURCHASE_ORDER',7,'2025-11-09 17:22:45',4,'Nhập hàng từ NCC Apple Inc. - Đơn nhập #7'),(33,2,'IN',5,'PURCHASE_ORDER',7,'2025-11-09 17:22:45',4,'Nhập hàng từ NCC Apple Inc. - Đơn nhập #7'),(34,5,'IN',2,'SALE_ORDER',3,'2025-11-12 10:25:05',NULL,'Hủy đơn hàng - hoàn trả hàng vào kho'),(35,5,'OUT',1,'SALE_ORDER',7,'2025-11-17 04:07:31',NULL,'Đơn hàng từ admin cho khách hàng'),(36,8,'OUT',1,'SALE_ORDER',7,'2025-11-17 04:07:31',NULL,'Đơn hàng từ admin cho khách hàng'),(37,26,'OUT',1,'SALE_ORDER',8,'2025-11-20 10:09:48',NULL,'Đơn hàng từ khách hàng'),(38,27,'OUT',1,'SALE_ORDER',8,'2025-11-20 10:09:48',NULL,'Đơn hàng từ khách hàng'),(39,17,'OUT',1,'SALE_ORDER',12,'2025-11-20 11:03:23',NULL,'Đơn hàng từ khách hàng (Buy Now)'),(44,27,'OUT',1,'SALE_ORDER',25,'2025-11-20 12:50:59',NULL,'Đơn hàng 0đ - tự động xác nhận thanh toán (không qua PayOS)'),(45,27,'OUT',1,'SALE_ORDER',27,'2025-11-20 21:50:45',NULL,'Đơn hàng 0đ - tự động xác nhận thanh toán (không qua PayOS)'),(46,27,'OUT',1,'SALE_ORDER',28,'2025-11-20 21:51:07',NULL,'Đơn hàng 0đ - tự động xác nhận thanh toán (không qua PayOS)'),(47,27,'OUT',2,'SALE_ORDER',33,'2025-11-21 00:56:51',NULL,'Đơn hàng từ khách hàng'),(48,27,'OUT',1,'SALE_ORDER',34,'2025-11-21 00:57:29',NULL,'Đơn hàng 0đ - tự động xác nhận thanh toán (không qua PayOS)'),(49,27,'OUT',1,'SALE_ORDER',35,'2025-11-21 01:04:33',NULL,'Đơn hàng 0đ - tự động xác nhận thanh toán (không qua PayOS)'),(50,19,'OUT',1,'SALE_ORDER',36,'2025-11-21 01:07:00',NULL,'Thanh toán PayOS thành công (sync từ getPaymentStatus) - Order #36'),(51,19,'OUT',1,'SALE_ORDER',38,'2025-11-21 01:17:28',NULL,'Thanh toán PayOS thành công (sync từ getPaymentStatus) - Order #38'),(52,19,'OUT',1,'SALE_ORDER',39,'2025-11-21 01:33:03',NULL,'Thanh toán PayOS thành công (sync từ getPaymentStatus) - Order #39'),(53,6,'OUT',1,'SALE_ORDER',40,'2025-11-21 02:24:17',NULL,'Đơn hàng từ khách hàng'),(54,6,'IN',1,'SALE_ORDER',40,'2025-11-21 02:24:24',NULL,'Hủy đơn hàng - hoàn trả hàng vào kho'),(55,26,'OUT',1,'SALE_ORDER',41,'2025-11-21 04:24:10',NULL,'Đơn hàng từ khách hàng'),(56,27,'OUT',2,'SALE_ORDER',41,'2025-11-21 04:24:10',NULL,'Đơn hàng từ khách hàng'),(57,26,'IN',1,'SALE_ORDER',41,'2025-11-21 04:24:18',NULL,'Hủy đơn hàng - hoàn trả hàng vào kho'),(58,27,'IN',2,'SALE_ORDER',41,'2025-11-21 04:24:18',NULL,'Hủy đơn hàng - hoàn trả hàng vào kho'),(59,27,'IN',1,'SALE_ORDER',42,'2025-11-21 04:24:56',NULL,'Hủy đơn hàng - hoàn trả hàng vào kho'),(60,26,'OUT',1,'SALE_ORDER',43,'2025-11-21 08:34:16',NULL,'Đơn hàng 0đ - tự động xác nhận thanh toán (không qua PayOS)'),(61,27,'OUT',1,'SALE_ORDER',43,'2025-11-21 08:34:16',NULL,'Đơn hàng 0đ - tự động xác nhận thanh toán (không qua PayOS)'),(62,18,'OUT',1,'SALE_ORDER',45,'2025-11-21 11:01:41',NULL,'Thanh toán PayOS thành công (sync từ getPaymentStatus) - Order #45'),(63,2,'OUT',1,'SALE_ORDER',46,'2025-11-21 19:28:41',NULL,'Đơn hàng 0đ - tự động xác nhận thanh toán (không qua PayOS)'),(64,27,'IN',2,'SALE_ORDER',48,'2025-12-04 22:06:20',NULL,'Hủy đơn hàng - hoàn trả hàng vào kho'),(65,26,'IN',1,'SALE_ORDER',44,'2025-12-10 10:12:32',NULL,'Hủy đơn hàng bởi Admin/Employee - hoàn trả hàng vào kho'),(66,5,'OUT',2,'SALE_ORDER',49,'2025-12-10 10:19:54',NULL,'Đơn hàng từ khách hàng'),(67,26,'OUT',1,'SALE_ORDER',49,'2025-12-10 10:19:54',NULL,'Đơn hàng từ khách hàng'),(68,27,'OUT',3,'SALE_ORDER',49,'2025-12-10 10:19:54',NULL,'Đơn hàng từ khách hàng'),(69,5,'OUT',3,'SALE_ORDER',50,'2025-12-10 22:11:34',NULL,'Đơn hàng từ khách hàng'),(70,18,'OUT',1,'SALE_ORDER',50,'2025-12-10 22:11:35',NULL,'Đơn hàng từ khách hàng'),(71,26,'OUT',1,'SALE_ORDER',50,'2025-12-10 22:11:35',NULL,'Đơn hàng từ khách hàng'),(72,27,'OUT',1,'SALE_ORDER',50,'2025-12-10 22:11:35',NULL,'Đơn hàng từ khách hàng'),(73,21,'OUT',1,'SALE_ORDER',51,'2025-12-11 05:08:03',NULL,'Đơn hàng từ khách hàng (Buy Now)'),(74,20,'OUT',1,'SALE_ORDER',52,'2025-12-11 05:14:23',NULL,'Đơn hàng từ khách hàng (Buy Now)'),(75,19,'OUT',1,'SALE_ORDER',53,'2025-12-11 05:15:32',NULL,'Đơn hàng từ khách hàng (Buy Now)'),(76,5,'OUT',2,'SALE_ORDER',54,'2025-12-11 05:27:58',NULL,'Đơn hàng từ khách hàng'),(77,26,'OUT',1,'SALE_ORDER',54,'2025-12-11 05:27:58',NULL,'Đơn hàng từ khách hàng'),(78,26,'OUT',1,'SALE_ORDER',55,'2025-12-11 05:32:55',NULL,'Đơn hàng từ khách hàng'),(79,16,'OUT',1,'SALE_ORDER',56,'2025-12-11 05:39:45',NULL,'Đơn hàng từ khách hàng'),(80,18,'OUT',1,'SALE_ORDER',57,'2025-12-11 05:54:14',NULL,'Đơn hàng từ khách hàng (Buy Now)'),(81,5,'IN',2,'SALE_ORDER',54,'2025-12-11 08:38:18',NULL,'Hủy đơn hàng - hoàn trả hàng vào kho'),(82,26,'IN',1,'SALE_ORDER',54,'2025-12-11 08:38:18',NULL,'Hủy đơn hàng - hoàn trả hàng vào kho'),(83,26,'OUT',1,'SALE_ORDER',58,'2025-12-11 08:41:37',NULL,'Đơn hàng từ khách hàng (Buy Now)'),(84,26,'IN',1,'SALE_ORDER',58,'2025-12-11 08:41:49',NULL,'Hủy đơn hàng - hoàn trả hàng vào kho'),(85,21,'OUT',1,'SALE_ORDER',59,'2025-12-11 08:42:31',NULL,'Đơn hàng từ khách hàng'),(86,26,'OUT',1,'SALE_ORDER',59,'2025-12-11 08:42:31',NULL,'Đơn hàng từ khách hàng'),(87,21,'IN',1,'SALE_ORDER',59,'2025-12-11 08:42:51',NULL,'Hủy đơn hàng - hoàn trả hàng vào kho'),(88,26,'IN',1,'SALE_ORDER',59,'2025-12-11 08:42:51',NULL,'Hủy đơn hàng - hoàn trả hàng vào kho'),(89,21,'OUT',1,'SALE_ORDER',60,'2025-12-11 08:50:21',NULL,'Đơn hàng từ khách hàng'),(90,26,'OUT',1,'SALE_ORDER',60,'2025-12-11 08:50:21',NULL,'Đơn hàng từ khách hàng'),(91,26,'OUT',1,'SALE_ORDER',61,'2025-12-11 08:51:19',NULL,'Đơn hàng từ khách hàng (Buy Now)'),(92,26,'OUT',1,'SALE_ORDER',62,'2025-12-11 08:58:37',NULL,'Đơn hàng từ khách hàng'),(93,2,'IN',1,'SALE_RETURN',46,'2025-12-11 09:08:54',NULL,'Khách trả hàng - Return #3'),(94,2,'IN',1,'SALE_RETURN',46,'2025-12-11 09:21:12',NULL,'Khách trả hàng - Return #2'),(95,27,'IN',2,'SALE_RETURN',49,'2025-12-11 09:36:16',NULL,'Khách trả hàng - Return #5'),(96,26,'IN',1,'SALE_EXCHANGE',62,'2025-12-11 09:56:35',NULL,'Đổi hàng - nhập lại SP cũ (Return #6)'),(97,26,'OUT',1,'SALE_ORDER',63,'2025-12-11 09:57:14',NULL,'Đơn hàng từ khách hàng'),(98,26,'IN',1,'SALE_EXCHANGE',63,'2025-12-11 09:59:27',NULL,'Đổi hàng - nhập lại SP cũ (Return #7)'),(99,27,'OUT',1,'SALE_ORDER',64,'2025-12-11 10:00:50',NULL,'Đơn hàng từ khách hàng'),(100,27,'IN',1,'SALE_RETURN',64,'2025-12-11 10:02:22',NULL,'Khách trả hàng - Return #8'),(101,26,'OUT',2,'SALE_ORDER',65,'2025-12-11 10:02:46',NULL,'Đơn hàng từ khách hàng'),(102,27,'OUT',1,'SALE_ORDER',65,'2025-12-11 10:02:46',NULL,'Đơn hàng từ khách hàng'),(103,26,'IN',1,'SALE_RETURN',65,'2025-12-11 10:05:29',NULL,'Khách trả hàng - Return #9'),(104,16,'OUT',1,'SALE_ORDER',66,'2025-12-11 10:20:47',NULL,'Đơn hàng từ khách hàng'),(105,21,'OUT',1,'SALE_ORDER',67,'2025-12-11 10:29:37',NULL,'Đơn hàng từ khách hàng'),(106,21,'IN',1,'SALE_RETURN',67,'2025-12-11 10:30:31',NULL,'Khách trả hàng - Return #11'),(107,18,'OUT',1,'SALE_ORDER',68,'2025-12-11 17:47:14',NULL,'Đơn hàng từ khách hàng (Buy Now)'),(108,27,'OUT',1,'SALE_ORDER',69,'2025-12-11 21:34:43',NULL,'Đơn hàng từ khách hàng (Buy Now)'),(109,27,'IN',1,'SALE_ORDER',69,'2025-12-11 21:35:01',NULL,'Hủy đơn hàng bởi Admin/Employee - hoàn trả hàng vào kho'),(110,26,'OUT',1,'SALE_ORDER',70,'2025-12-11 21:48:46',NULL,'Đơn hàng từ khách hàng (Buy Now)'),(111,26,'OUT',1,'SALE_ORDER',71,'2025-12-11 21:49:10',NULL,'Đơn hàng từ khách hàng'),(112,27,'OUT',1,'SALE_ORDER',71,'2025-12-11 21:49:10',NULL,'Đơn hàng từ khách hàng'),(113,26,'IN',1,'SALE_ORDER',71,'2025-12-11 21:49:14',NULL,'Hủy đơn hàng - hoàn trả hàng vào kho'),(114,27,'IN',1,'SALE_ORDER',71,'2025-12-11 21:49:14',NULL,'Hủy đơn hàng - hoàn trả hàng vào kho'),(115,21,'OUT',3,'SALE_ORDER',72,'2025-12-12 05:36:50',NULL,'Đơn hàng từ khách hàng'),(116,14,'OUT',1,'SALE_ORDER',73,'2025-12-12 05:37:06',NULL,'Đơn hàng từ khách hàng (Buy Now)'),(117,21,'IN',3,'SALE_ORDER',72,'2025-12-12 05:46:42',NULL,'Hủy đơn hàng - hoàn trả hàng vào kho'),(118,26,'OUT',2,'SALE_ORDER',74,'2025-12-12 10:58:46',NULL,'Thanh toán PayOS thành công (sync từ getPaymentStatus) - Order #74'),(119,27,'OUT',1,'SALE_ORDER',74,'2025-12-12 10:58:46',NULL,'Thanh toán PayOS thành công (sync từ getPaymentStatus) - Order #74'),(120,28,'IN',3,'PURCHASE_ORDER',8,'2025-12-12 19:34:51',NULL,'Nhập hàng từ NCC OPPO - Đơn nhập #8'),(121,28,'OUT',1,'SALE_ORDER',75,'2025-12-12 19:37:44',NULL,'Thanh toán PayOS thành công (sync từ getPaymentStatus) - Order #75'),(122,21,'OUT',1,'SALE_ORDER',76,'2025-12-12 21:13:41',NULL,'Đơn hàng từ khách hàng (Buy Now)'),(123,21,'OUT',15,'SALE_ORDER',77,'2025-12-12 22:10:35',NULL,'Đơn hàng từ khách hàng'),(124,1,'OUT',1,'SALE_ORDER',78,'2025-12-12 23:52:25',NULL,'Thanh toán PayOS thành công (sync từ getPaymentStatus) - Order #78'),(125,1,'IN',1,'SALE_RETURN',78,'2025-12-12 23:54:09',NULL,'Khách trả hàng - Return #12'),(126,19,'OUT',1,'SALE_ORDER',79,'2025-12-13 00:17:07',NULL,'Thanh toán PayOS thành công (sync từ getPaymentStatus) - Order #79'),(127,19,'OUT',1,'SALE_ORDER',80,'2025-12-13 01:03:40',NULL,'Thanh toán PayOS thành công (sync từ getPaymentStatus) - Order #80'),(128,19,'IN',1,'SALE_RETURN',80,'2025-12-13 01:04:52',NULL,'Khách trả hàng - Return #14'),(129,29,'IN',3,'PURCHASE_ORDER',9,'2025-12-15 23:37:33',NULL,'Nhập hàng từ NCC Dell Technologies - Đơn nhập #9'),(130,29,'IN',1,'PURCHASE_ORDER',10,'2025-12-16 00:39:47',NULL,'Nhập hàng từ NCC Dell Technologies - Đơn nhập #10'),(131,29,'IN',1,'PURCHASE_ORDER',11,'2025-12-16 00:48:27',NULL,'Nhập hàng từ NCC Xiaomi Corporation - Đơn nhập #11');
/*!40000 ALTER TABLE `inventory_transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id_notification` int NOT NULL AUTO_INCREMENT,
  `id_user` int NOT NULL COMMENT 'User nhận thông báo',
  `notification_type` enum('ORDER_STATUS','LOW_STOCK','NEW_ORDER','NEW_CUSTOMER','INVENTORY_UPDATE','PROMOTION') NOT NULL COMMENT 'Loại thông báo',
  `title` varchar(255) NOT NULL COMMENT 'Tiêu đề thông báo',
  `message` text NOT NULL COMMENT 'Nội dung thông báo',
  `reference_type` enum('ORDER','PRODUCT','CUSTOMER','IMPORT_ORDER','OTHER') DEFAULT NULL COMMENT 'Loại đối tượng liên quan',
  `reference_id` int DEFAULT NULL COMMENT 'ID đối tượng liên quan',
  `is_read` tinyint(1) DEFAULT '0' COMMENT 'Đã đọc chưa',
  `sent_email` tinyint(1) DEFAULT '0' COMMENT 'Đã gửi email chưa',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_notification`),
  KEY `idx_user_read` (`id_user`,`is_read`),
  KEY `idx_created_at` (`created_at` DESC),
  KEY `idx_notification_type` (`notification_type`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='[DEPRECATED] Notification module removed. Table preserved for historical data.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_details`
--

DROP TABLE IF EXISTS `order_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_details` (
  `id_order_detail` int NOT NULL AUTO_INCREMENT,
  `id_order` int NOT NULL,
  `id_product` int NOT NULL,
  `quantity` int NOT NULL,
  `price` decimal(12,2) NOT NULL COMMENT 'Giá tại thời điểm mua',
  `product_name_snapshot` varchar(255) DEFAULT NULL COMMENT 'Tên sản phẩm tại thời điểm mua',
  `product_code_snapshot` varchar(100) DEFAULT NULL COMMENT 'Mã sản phẩm tại thời điểm mua',
  `product_image_snapshot` varchar(500) DEFAULT NULL COMMENT 'URL ảnh tại thời điểm mua',
  PRIMARY KEY (`id_order_detail`),
  UNIQUE KEY `uq_order_details_order_product` (`id_order`,`id_product`),
  KEY `idx_order_details_order` (`id_order`),
  KEY `idx_order_details_product` (`id_product`),
  CONSTRAINT `fk_order_details_order` FOREIGN KEY (`id_order`) REFERENCES `orders` (`id_order`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_order_details_product` FOREIGN KEY (`id_product`) REFERENCES `products` (`id_product`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `order_details_chk_1` CHECK ((`quantity` > 0)),
  CONSTRAINT `order_details_chk_2` CHECK ((`price` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=108 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_details`
--

LOCK TABLES `order_details` WRITE;
/*!40000 ALTER TABLE `order_details` DISABLE KEYS */;
INSERT INTO `order_details` VALUES (1,1,7,1,15000000.00,'HP Pavilion 15','HPPAV15-001',NULL),(2,2,5,2,15000000.00,'Xiaomi 14 Pro','XMI14P-001',NULL),(3,2,10,1,12000000.00,'Dell Inspiron 15','DLINS15-001',NULL),(4,3,5,2,15000000.00,'Xiaomi 14 Pro','XMI14P-001',NULL),(5,4,7,1,15000000.00,'HP Pavilion 15','HPPAV15-001',NULL),(6,5,5,2,15000000.00,'Xiaomi 14 Pro','XMI14P-001',NULL),(7,5,10,1,12000000.00,'Dell Inspiron 15','DLINS15-001',NULL),(8,6,5,2,15000000.00,'Xiaomi 14 Pro','XMI14P-001',NULL),(9,6,10,1,12000000.00,'Dell Inspiron 15','DLINS15-001',NULL),(10,7,5,1,15000000.00,'Xiaomi 14 Pro','XMI14P-001',NULL),(11,7,8,1,25000000.00,'HP EliteBook X360','HPELB-001',NULL),(12,8,26,1,25000000.00,'iPhone 15 Pro','DT-20251110-2196',NULL),(13,8,27,1,30000000.00,'iPhone XS Max','DT-20251110-6021',NULL),(14,9,20,1,12000000.00,'Apple Watch Series 9','AW9-001',NULL),(15,9,21,1,8000000.00,'Samsung Galaxy Watch 6','SGW6-001',NULL),(16,10,27,1,30000000.00,'iPhone XS Max','DT-20251110-6021',NULL),(17,11,26,1,25000000.00,'iPhone 15 Pro','DT-20251110-2196',NULL),(18,12,17,1,4000000.00,'Galaxy Buds2 Pro','SGBUDS2-001',NULL),(19,13,19,1,150000.00,'Cáp sạc USB-C','CAPUSBC-001',NULL),(35,22,1,1,25000000.00,'iPhone 15 Pro','IP15PRO-001',NULL),(36,22,27,3,30000000.00,'iPhone XS Max','DT-20251110-6021',NULL),(37,23,27,1,30000000.00,'iPhone XS Max','DT-20251110-6021',NULL),(38,24,27,1,30000000.00,'iPhone XS Max','DT-20251110-6021',NULL),(39,25,27,1,30000000.00,'iPhone XS Max','DT-20251110-6021',NULL),(40,26,19,1,150000.00,'Cáp sạc USB-C','CAPUSBC-001',NULL),(41,27,27,1,30000000.00,'iPhone XS Max','DT-20251110-6021',NULL),(42,28,27,1,30000000.00,'iPhone XS Max','DT-20251110-6021',NULL),(43,29,27,1,30000000.00,'iPhone XS Max','DT-20251110-6021',NULL),(44,30,19,1,150000.00,'Cáp sạc USB-C','CAPUSBC-001',NULL),(45,31,27,1,30000000.00,'iPhone XS Max','DT-20251110-6021',NULL),(46,32,19,1,150000.00,'Cáp sạc USB-C','CAPUSBC-001',NULL),(47,33,27,2,30000000.00,'iPhone XS Max','DT-20251110-6021',NULL),(48,34,27,1,30000000.00,'iPhone XS Max','DT-20251110-6021',NULL),(49,35,27,1,30000000.00,'iPhone XS Max','DT-20251110-6021',NULL),(50,36,19,1,150000.00,'Cáp sạc USB-C','CAPUSBC-001',NULL),(51,37,27,1,30000000.00,'iPhone XS Max','DT-20251110-6021',NULL),(52,38,19,1,150000.00,'Cáp sạc USB-C','CAPUSBC-001',NULL),(53,39,19,1,150000.00,'Cáp sạc USB-C','CAPUSBC-001',NULL),(54,40,6,1,5000000.00,'Redmi Note 13','RMN13-001',NULL),(55,41,26,1,25000000.00,'iPhone 15 Pro','DT-20251110-2196',NULL),(56,41,27,2,30000000.00,'iPhone XS Max','DT-20251110-6021',NULL),(57,42,27,1,30000000.00,'iPhone XS Max','DT-20251110-6021',NULL),(58,43,26,1,25000000.00,'iPhone 15 Pro','DT-20251110-2196',NULL),(59,43,27,1,30000000.00,'iPhone XS Max','DT-20251110-6021',NULL),(60,44,26,1,25000000.00,'iPhone 15 Pro','DT-20251110-2196',NULL),(61,45,18,1,200000.00,'Ốp lưng iPhone 15 Pro','OPIP15-001',NULL),(62,46,2,1,18000000.00,'iPhone 14','IP14-001','/uploads/products/44b48ceb-cb7c-469a-a9d1-98844b7561c9.png'),(63,47,27,2,30000000.00,'iPhone XS Max','DT-20251110-6021','/uploads/products/5726cc57-d648-4565-a149-923aab76ca39.png'),(64,48,27,2,30000000.00,'iPhone XS Max','DT-20251110-6021','/uploads/products/5726cc57-d648-4565-a149-923aab76ca39.png'),(65,49,5,2,15000000.00,'Xiaomi 14 Pro','XMI14P-001','/uploads/products/34ca0e1e-f96c-462c-8d9d-33931051c6d0.png'),(66,49,26,1,25000000.00,'iPhone 15 Pro','DT-20251110-2196','/uploads/products/975b3753-39f6-4a85-a367-13deeab1e665.jpg'),(67,49,27,3,30000000.00,'iPhone XS Max','DT-20251110-6021','/uploads/products/5726cc57-d648-4565-a149-923aab76ca39.png'),(68,50,5,3,15000000.00,'Xiaomi 14 Pro','XMI14P-001','/uploads/products/34ca0e1e-f96c-462c-8d9d-33931051c6d0.png'),(69,50,18,1,200000.00,'Ốp lưng iPhone 15 Pro','OPIP15-001','/uploads/products/87c66e19-e8f4-476b-9c12-abb504845071.png'),(70,50,26,1,25000000.00,'iPhone 15 Pro','DT-20251110-2196','/uploads/products/975b3753-39f6-4a85-a367-13deeab1e665.jpg'),(71,50,27,1,30000000.00,'iPhone XS Max','DT-20251110-6021','/uploads/products/5726cc57-d648-4565-a149-923aab76ca39.png'),(72,51,21,1,8000000.00,'Samsung Galaxy Watch 6','SGW6-001','/uploads/products/5a810f52-e38c-482a-8967-b7958f84ad46.png'),(73,52,20,1,12000000.00,'Apple Watch Series 9','AW9-001','/uploads/products/3d2f020a-7c4d-45a8-a539-13d7d45ae04f.png'),(74,53,19,1,150000.00,'Cáp sạc USB-C','CAPUSBC-001','/uploads/products/bccbb5da-1b96-481a-bde4-7aa32a6fc526.png'),(75,54,5,2,15000000.00,'Xiaomi 14 Pro','XMI14P-001','/uploads/products/34ca0e1e-f96c-462c-8d9d-33931051c6d0.png'),(76,54,26,1,25000000.00,'iPhone 15 Pro','DT-20251110-2196','/uploads/products/975b3753-39f6-4a85-a367-13deeab1e665.jpg'),(77,55,26,1,25000000.00,'iPhone 15 Pro','DT-20251110-2196','/uploads/products/975b3753-39f6-4a85-a367-13deeab1e665.jpg'),(78,56,16,1,6000000.00,'AirPods Pro 2','APDP2-001','/uploads/products/698e30fa-26ab-4971-8f53-387885901e96.png'),(79,57,18,1,200000.00,'Ốp lưng iPhone 15 Pro','OPIP15-001','/uploads/products/87c66e19-e8f4-476b-9c12-abb504845071.png'),(80,58,26,1,25000000.00,'iPhone 15 Pro','DT-20251110-2196','/uploads/products/975b3753-39f6-4a85-a367-13deeab1e665.jpg'),(81,59,21,1,8000000.00,'Samsung Galaxy Watch 6','SGW6-001','/uploads/products/5a810f52-e38c-482a-8967-b7958f84ad46.png'),(82,59,26,1,25000000.00,'iPhone 15 Pro','DT-20251110-2196','/uploads/products/975b3753-39f6-4a85-a367-13deeab1e665.jpg'),(83,60,21,1,8000000.00,'Samsung Galaxy Watch 6','SGW6-001','/uploads/products/5a810f52-e38c-482a-8967-b7958f84ad46.png'),(84,60,26,1,25000000.00,'iPhone 15 Pro','DT-20251110-2196','/uploads/products/975b3753-39f6-4a85-a367-13deeab1e665.jpg'),(85,61,26,1,25000000.00,'iPhone 15 Pro','DT-20251110-2196','/uploads/products/975b3753-39f6-4a85-a367-13deeab1e665.jpg'),(86,62,26,1,25000000.00,'iPhone 15 Pro','DT-20251110-2196','/uploads/products/975b3753-39f6-4a85-a367-13deeab1e665.jpg'),(87,63,26,1,25000000.00,'iPhone 15 Pro','DT-20251110-2196','/uploads/products/975b3753-39f6-4a85-a367-13deeab1e665.jpg'),(88,64,27,1,30000000.00,'iPhone XS Max','DT-20251110-6021','/uploads/products/5726cc57-d648-4565-a149-923aab76ca39.png'),(89,65,26,2,25000000.00,'iPhone 15 Pro','DT-20251110-2196','/uploads/products/975b3753-39f6-4a85-a367-13deeab1e665.jpg'),(90,65,27,1,30000000.00,'iPhone XS Max','DT-20251110-6021','/uploads/products/5726cc57-d648-4565-a149-923aab76ca39.png'),(91,66,16,1,6000000.00,'AirPods Pro 2','APDP2-001','/uploads/products/698e30fa-26ab-4971-8f53-387885901e96.png'),(92,67,21,1,8000000.00,'Samsung Galaxy Watch 6','SGW6-001','/uploads/products/5a810f52-e38c-482a-8967-b7958f84ad46.png'),(93,68,18,1,200000.00,'Ốp lưng iPhone 15 Pro','OPIP15-001','/uploads/products/87c66e19-e8f4-476b-9c12-abb504845071.png'),(94,69,27,1,30000000.00,'iPhone XS Max','DT-20251110-6021','/uploads/products/5726cc57-d648-4565-a149-923aab76ca39.png'),(95,70,26,1,25000000.00,'iPhone 15 Pro','DT-20251110-2196','/uploads/products/975b3753-39f6-4a85-a367-13deeab1e665.jpg'),(96,71,26,1,25000000.00,'iPhone 15 Pro','DT-20251110-2196','/uploads/products/975b3753-39f6-4a85-a367-13deeab1e665.jpg'),(97,71,27,1,30000000.00,'iPhone XS Max','DT-20251110-6021','/uploads/products/5726cc57-d648-4565-a149-923aab76ca39.png'),(98,72,21,3,8000000.00,'Samsung Galaxy Watch 6','SGW6-001','/uploads/products/5a810f52-e38c-482a-8967-b7958f84ad46.png'),(99,73,14,1,15000000.00,'iPad Air','IPDA-001','/uploads/products/6eea8b7f-657f-4d08-b3a9-8a2253b61e32.png'),(100,74,26,2,25000000.00,'iPhone 15 Pro','DT-20251110-2196','/uploads/products/975b3753-39f6-4a85-a367-13deeab1e665.jpg'),(101,74,27,1,30000000.00,'iPhone XS Max','DT-20251110-6021','/uploads/products/5726cc57-d648-4565-a149-923aab76ca39.png'),(102,75,28,1,4000000.00,'OnePlus ACE 3v','DT-20251213-0571',NULL),(103,76,21,1,8000000.00,'Samsung Galaxy Watch 6','SGW6-001','/uploads/products/5a810f52-e38c-482a-8967-b7958f84ad46.png'),(104,77,21,15,8000000.00,'Samsung Galaxy Watch 6','SGW6-001','/uploads/products/5a810f52-e38c-482a-8967-b7958f84ad46.png'),(105,78,1,1,25000000.00,'iPhone 15 Pro','IP15PRO-001','/uploads/products/ed4f14aa-1fbf-4cd3-b989-6595fbc2eea7.png'),(106,79,19,1,150000.00,'Cáp sạc USB-C','CAPUSBC-001','/uploads/products/bccbb5da-1b96-481a-bde4-7aa32a6fc526.png'),(107,80,19,1,150000.00,'Cáp sạc USB-C','CAPUSBC-001','/uploads/products/bccbb5da-1b96-481a-bde4-7aa32a6fc526.png');
/*!40000 ALTER TABLE `order_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_return_items`
--

DROP TABLE IF EXISTS `order_return_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_return_items` (
  `id_return_item` int NOT NULL AUTO_INCREMENT,
  `id_return` int NOT NULL,
  `id_order_detail` int NOT NULL,
  `quantity` int NOT NULL,
  `exchange_product_id` int DEFAULT NULL,
  `exchange_quantity` int DEFAULT NULL,
  `line_refund_amount` decimal(15,2) DEFAULT NULL,
  PRIMARY KEY (`id_return_item`),
  KEY `fk_return_item_order_detail` (`id_order_detail`),
  KEY `fk_return_exchange` (`exchange_product_id`),
  KEY `fk_return_item` (`id_return`),
  CONSTRAINT `fk_return_exchange` FOREIGN KEY (`exchange_product_id`) REFERENCES `products` (`id_product`),
  CONSTRAINT `fk_return_item` FOREIGN KEY (`id_return`) REFERENCES `order_returns` (`id_return`) ON DELETE CASCADE,
  CONSTRAINT `fk_return_item_order_detail` FOREIGN KEY (`id_order_detail`) REFERENCES `order_details` (`id_order_detail`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_return_items`
--

LOCK TABLES `order_return_items` WRITE;
/*!40000 ALTER TABLE `order_return_items` DISABLE KEYS */;
INSERT INTO `order_return_items` VALUES (1,1,62,1,NULL,NULL,18000000.00),(2,2,62,1,NULL,NULL,18000000.00),(3,3,62,1,NULL,NULL,18000000.00),(4,4,86,1,NULL,1,25000000.00),(5,5,67,2,NULL,NULL,60000000.00),(6,6,86,1,NULL,1,25000000.00),(7,7,87,1,NULL,1,25000000.00),(8,8,88,1,NULL,NULL,30000000.00),(9,9,89,1,NULL,NULL,25000000.00),(10,10,91,1,NULL,NULL,6000000.00),(11,11,92,1,NULL,NULL,0.00),(12,12,105,1,NULL,NULL,0.00),(13,13,106,1,NULL,NULL,150000.00),(14,14,107,1,NULL,NULL,150000.00);
/*!40000 ALTER TABLE `order_return_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_returns`
--

DROP TABLE IF EXISTS `order_returns`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_returns` (
  `id_return` int NOT NULL AUTO_INCREMENT,
  `id_order` int NOT NULL,
  `return_type` enum('RETURN','EXCHANGE') COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('REQUESTED','APPROVED','REJECTED','COMPLETED','CANCELED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'REQUESTED',
  `reason` text COLLATE utf8mb4_unicode_ci,
  `note_admin` text COLLATE utf8mb4_unicode_ci,
  `refund_amount` decimal(15,2) DEFAULT NULL,
  `created_by_customer_id` int DEFAULT NULL,
  `processed_by_employee_id` int DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_return`),
  KEY `fk_return_employee` (`processed_by_employee_id`),
  KEY `idx_return_customer` (`created_by_customer_id`),
  KEY `idx_return_order` (`id_order`),
  KEY `idx_return_status` (`status`),
  CONSTRAINT `fk_return_customer` FOREIGN KEY (`created_by_customer_id`) REFERENCES `customers` (`id_customer`),
  CONSTRAINT `fk_return_employee` FOREIGN KEY (`processed_by_employee_id`) REFERENCES `employees` (`id_employee`),
  CONSTRAINT `fk_return_order` FOREIGN KEY (`id_order`) REFERENCES `orders` (`id_order`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_returns`
--

LOCK TABLES `order_returns` WRITE;
/*!40000 ALTER TABLE `order_returns` DISABLE KEYS */;
INSERT INTO `order_returns` VALUES (1,46,'RETURN','APPROVED','không còn nhu cầu',NULL,18000000.00,5,NULL,'2025-12-05 04:43:04','2025-12-11 16:36:30'),(2,46,'RETURN','COMPLETED','không còn nhu cầu',NULL,18000000.00,5,NULL,'2025-12-05 05:09:14','2025-12-11 16:21:12'),(3,46,'RETURN','COMPLETED','không còn như cầu mua hàng\n',NULL,18000000.00,5,NULL,'2025-12-05 05:40:00','2025-12-11 16:08:54'),(4,62,'EXCHANGE','REJECTED','','không còn hàng để đổi\n',25000000.00,5,NULL,'2025-12-11 16:07:49','2025-12-11 16:08:18'),(5,49,'RETURN','COMPLETED','',NULL,145000000.00,5,NULL,'2025-12-11 16:19:35','2025-12-11 16:36:16'),(6,62,'EXCHANGE','COMPLETED','',NULL,25000000.00,5,NULL,'2025-12-11 16:56:08','2025-12-11 16:56:35'),(7,63,'EXCHANGE','COMPLETED','',NULL,0.00,5,NULL,'2025-12-11 16:57:33','2025-12-11 16:59:27'),(8,64,'RETURN','COMPLETED','',NULL,15000000.00,5,NULL,'2025-12-11 17:02:03','2025-12-11 17:02:22'),(9,65,'RETURN','COMPLETED','',NULL,12500000.00,5,NULL,'2025-12-11 17:03:26','2025-12-11 17:05:29'),(10,66,'RETURN','REQUESTED','',NULL,6000000.00,5,NULL,'2025-12-11 17:21:18','2025-12-11 17:21:18'),(11,67,'RETURN','COMPLETED','',NULL,0.00,5,NULL,'2025-12-11 17:30:06','2025-12-11 17:30:31'),(12,78,'RETURN','COMPLETED','sản phẩm lỗi','ghi nhận',0.00,5,NULL,'2025-12-13 06:53:38','2025-12-13 06:54:09'),(13,79,'RETURN','REJECTED','không còn nhu cầu',NULL,150000.00,5,NULL,'2025-12-13 07:18:16','2025-12-13 07:18:41'),(14,80,'RETURN','COMPLETED','',NULL,150000.00,5,NULL,'2025-12-13 08:04:12','2025-12-13 08:04:52');
/*!40000 ALTER TABLE `order_returns` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id_order` int NOT NULL AUTO_INCREMENT,
  `id_customer` int DEFAULT NULL,
  `id_employee` int DEFAULT NULL,
  `order_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `status` enum('PENDING','CONFIRMED','COMPLETED','CANCELED') DEFAULT 'PENDING',
  `total_amount` decimal(15,2) DEFAULT '0.00',
  `discount` decimal(15,2) DEFAULT '0.00',
  `payment_method` enum('CASH','TRANSFER','ZALOPAY','PAYOS') DEFAULT NULL,
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `id_shipping_address` int DEFAULT NULL COMMENT 'Reference đến shipping_addresses',
  `shipping_address_snapshot` text COMMENT 'Snapshot của địa chỉ tại thời điểm đặt hàng',
  `delivered_at` timestamp NULL DEFAULT NULL COMMENT 'Thời điểm customer xác nhận đã nhận hàng',
  `payment_link_id` varchar(255) DEFAULT NULL COMMENT 'PayOS payment link ID - được set khi tạo payment link thành công',
  `id_promotion` int DEFAULT NULL COMMENT 'Reference đến promotions (nếu sử dụng mã giảm giá)',
  `promotion_code` varchar(50) DEFAULT NULL COMMENT 'Mã giảm giá được sử dụng',
  `id_promotion_rule` int DEFAULT NULL COMMENT 'Reference đến promotion_rules (nếu áp dụng discount tự động)',
  `return_window_days` int DEFAULT NULL COMMENT 'Snapshot số ngày cho phép đổi/trả tại thời điểm hoàn thành đơn',
  `shipping_fee` decimal(12,2) DEFAULT NULL COMMENT 'Phí giao hàng',
  `completed_at` timestamp NULL DEFAULT NULL,
  `final_amount` decimal(15,2) GENERATED ALWAYS AS (greatest(((ifnull(`total_amount`,0) + ifnull(`shipping_fee`,0)) - ifnull(`discount`,0)),0)) STORED COMMENT 'Tổng tiền cuối = total_amount + shipping_fee - discount (>=0)',
  `shipping_discount` decimal(15,2) DEFAULT '0.00' COMMENT 'Giảm giá phí vận chuyển riêng biệt với giảm giá đơn hàng',
  `shipping_promotion_code` varchar(50) DEFAULT NULL COMMENT 'Mã giảm giá phí vận chuyển đã sử dụng',
  `id_shipping_promotion` int DEFAULT NULL,
  `invoice_printed` tinyint(1) DEFAULT '0',
  `invoice_printed_at` datetime DEFAULT NULL,
  `invoice_printed_by` int DEFAULT NULL,
  PRIMARY KEY (`id_order`),
  KEY `idx_orders_customer` (`id_customer`),
  KEY `idx_orders_employee` (`id_employee`),
  KEY `idx_orders_shipping_address` (`id_shipping_address`),
  KEY `idx_orders_payment_link_id` (`payment_link_id`),
  KEY `idx_orders_promotion` (`id_promotion`),
  KEY `idx_orders_promotion_rule` (`id_promotion_rule`),
  KEY `idx_orders_customer_name` (`id_customer`),
  KEY `idx_orders_shipping_promotion` (`id_shipping_promotion`),
  CONSTRAINT `fk_orders_customer` FOREIGN KEY (`id_customer`) REFERENCES `customers` (`id_customer`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_orders_employee` FOREIGN KEY (`id_employee`) REFERENCES `employees` (`id_employee`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_orders_promotion` FOREIGN KEY (`id_promotion`) REFERENCES `promotions` (`id_promotion`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_orders_promotion_rule` FOREIGN KEY (`id_promotion_rule`) REFERENCES `promotion_rules` (`id_rule`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_orders_shipping_address` FOREIGN KEY (`id_shipping_address`) REFERENCES `shipping_addresses` (`id_shipping_address`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_orders_shipping_promotion` FOREIGN KEY (`id_shipping_promotion`) REFERENCES `promotions` (`id_promotion`) ON DELETE SET NULL,
  CONSTRAINT `orders_chk_1` CHECK ((`total_amount` >= 0)),
  CONSTRAINT `orders_chk_2` CHECK ((`discount` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=81 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` (`id_order`, `id_customer`, `id_employee`, `order_date`, `status`, `total_amount`, `discount`, `payment_method`, `notes`, `created_at`, `updated_at`, `id_shipping_address`, `shipping_address_snapshot`, `delivered_at`, `payment_link_id`, `id_promotion`, `promotion_code`, `id_promotion_rule`, `return_window_days`, `shipping_fee`, `completed_at`, `shipping_discount`, `shipping_promotion_code`, `id_shipping_promotion`, `invoice_printed`, `invoice_printed_at`, `invoice_printed_by`) VALUES (1,NULL,4,'2025-11-09 15:10:33','PENDING',15000000.00,0.00,'CASH','Khách hàng mua trực tiếp tại cửa hàng','2025-11-09 08:10:32','2025-11-09 08:10:32',NULL,'Nguyễn Văn Hải, Cầu Giấy, Hà Nội, 0912345670',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0.00,NULL,NULL,0,NULL,NULL),(2,NULL,4,'2025-11-09 15:18:07','PENDING',42000000.00,100000.00,'CASH','Khách hàng VIP','2025-11-09 08:18:07','2025-11-09 08:18:07',NULL,'Phạm Văn D, 101 Đường GHI, Quận 4, TP.HCM, 0945678901',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0.00,NULL,NULL,0,NULL,NULL),(3,5,NULL,'2025-11-09 15:23:49','CANCELED',30000000.00,0.00,'CASH','Giao hàng vào buổi sáng','2025-11-09 08:23:48','2025-11-12 17:25:05',NULL,'Nguyễn Văn Chung, Láng, Hà Nội, 0123456789',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0.00,NULL,NULL,0,NULL,NULL),(4,NULL,NULL,'2025-11-09 16:08:22','PENDING',15000000.00,0.00,'CASH','Khách hàng mua trực tiếp tại cửa hàng','2025-11-09 09:08:22','2025-11-09 09:08:22',NULL,'Nguyễn Văn Hải, Cầu Giấy, Hà Nội, 0912345670',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0.00,NULL,NULL,0,NULL,NULL),(5,NULL,NULL,'2025-11-09 16:08:43','PENDING',42000000.00,100000.00,'CASH','Khách hàng VIP','2025-11-09 09:08:43','2025-11-09 09:08:43',NULL,'Võ Văn F, 303 Đường MNO, Quận 6, TP.HCM, 0967890123',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0.00,NULL,NULL,0,NULL,NULL),(6,NULL,NULL,'2025-11-09 16:17:16','PENDING',42000000.00,100000.00,'CASH','Khách hàng VIP','2025-11-09 09:17:16','2025-11-09 09:17:16',NULL,'Võ Văn F, 303 Đường MNO, Quận 6, TP.HCM, 0967890123',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0.00,NULL,NULL,0,NULL,NULL),(7,NULL,NULL,'2025-11-17 11:07:31','COMPLETED',40000000.00,0.00,'CASH',NULL,'2025-11-17 11:07:30','2025-12-11 15:56:50',NULL,'nguyễn xuân, , 0123854348','2025-12-11 09:58:14',NULL,NULL,NULL,NULL,6,NULL,'2025-12-11 09:58:14',0.00,NULL,NULL,0,NULL,NULL),(8,7,NULL,'2025-11-20 17:09:48','PENDING',55000000.00,44000000.00,'CASH',NULL,'2025-11-20 17:09:47','2025-11-20 17:09:47',3,'Ngọc Hải, Láng, Hà Nội, 0123656789',NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,0.00,NULL,NULL,0,NULL,NULL),(9,7,NULL,'2025-11-20 17:10:50','PENDING',20000000.00,16000000.00,'PAYOS',NULL,'2025-11-20 17:10:49','2025-11-20 17:10:49',3,'Ngọc Hải, Láng, Hà Nội, 0123656789',NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,0.00,NULL,NULL,0,NULL,NULL),(10,7,NULL,'2025-11-20 17:42:20','PENDING',30000000.00,24000000.00,'PAYOS',NULL,'2025-11-20 17:42:19','2025-11-20 17:42:19',3,'Ngọc Hải, Láng, Hà Nội, 0123656789',NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,0.00,NULL,NULL,0,NULL,NULL),(11,7,NULL,'2025-11-20 17:54:27','PENDING',25000000.00,20000000.00,'PAYOS',NULL,'2025-11-20 17:54:26','2025-11-20 17:54:28',3,'Ngọc Hải, Láng, Hà Nội, 0123656789',NULL,'709a5240265b43f2a226eda95dab5162',NULL,NULL,1,NULL,NULL,NULL,0.00,NULL,NULL,0,NULL,NULL),(12,7,NULL,'2025-11-20 18:03:23','PENDING',4000000.00,0.00,'CASH',NULL,'2025-11-20 18:03:22','2025-11-20 18:03:22',3,'Ngọc Hải, Láng, Hà Nội, 0123656789',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0.00,NULL,NULL,0,NULL,NULL),(13,7,NULL,'2025-11-20 18:03:59','PENDING',150000.00,0.00,'PAYOS',NULL,'2025-11-20 18:03:59','2025-11-20 18:04:01',3,'Ngọc Hải, Láng, Hà Nội, 0123656789',NULL,'3f27beef5122467a90946cebe6193b5d',NULL,NULL,NULL,NULL,NULL,NULL,0.00,NULL,NULL,0,NULL,NULL),(22,7,NULL,'2025-11-20 19:28:49','PENDING',115000000.00,115000000.00,'PAYOS',NULL,'2025-11-20 19:28:48','2025-11-20 19:28:48',3,'Ngọc Hải, Láng, Hà Nội, 0123656789',NULL,NULL,NULL,'GIAM100',NULL,NULL,NULL,NULL,0.00,NULL,NULL,0,NULL,NULL),(23,7,NULL,'2025-11-20 19:31:28','PENDING',30000000.00,24000000.00,'PAYOS',NULL,'2025-11-20 19:31:28','2025-11-20 19:31:29',3,'Ngọc Hải, Láng, Hà Nội, 0123656789',NULL,'3961bd41882f4e55bf082abfc5b8f7c0',NULL,NULL,1,NULL,NULL,NULL,0.00,NULL,NULL,0,NULL,NULL),(24,7,NULL,'2025-11-20 19:39:12','PENDING',30000000.00,30000000.00,'PAYOS',NULL,'2025-11-20 19:39:11','2025-11-20 19:39:11',3,'Ngọc Hải, Láng, Hà Nội, 0123656789',NULL,NULL,NULL,'GIAM100',NULL,NULL,NULL,NULL,0.00,NULL,NULL,0,NULL,NULL),(25,7,NULL,'2025-11-20 19:50:59','COMPLETED',30000000.00,30000000.00,'PAYOS',NULL,'2025-11-20 19:50:58','2025-12-11 15:56:50',3,'Ngọc Hải, Láng, Hà Nội, 0123656789','2025-12-11 09:58:14',NULL,NULL,'GIAM100',NULL,6,NULL,'2025-12-11 09:58:14',0.00,NULL,NULL,0,NULL,NULL),(26,7,NULL,'2025-11-20 19:52:37','PENDING',150000.00,148500.00,'PAYOS',NULL,'2025-11-20 19:52:37','2025-11-20 19:52:38',3,'Ngọc Hải, Láng, Hà Nội, 0123656789',NULL,'6a53e9454769497d8a75a234e0ed1a20',NULL,'GIAM99',NULL,NULL,NULL,NULL,0.00,NULL,NULL,0,NULL,NULL),(27,7,NULL,'2025-11-21 04:50:44','COMPLETED',30000000.00,30000000.00,'PAYOS',NULL,'2025-11-21 04:50:44','2025-12-11 15:56:50',3,'Ngọc Hải, Láng, Hà Nội, 0123656789','2025-12-11 09:58:14',NULL,NULL,'GIAM100',NULL,6,NULL,'2025-12-11 09:58:14',0.00,NULL,NULL,0,NULL,NULL),(28,7,NULL,'2025-11-21 04:51:07','COMPLETED',30000000.00,30000000.00,'PAYOS',NULL,'2025-11-21 04:51:06','2025-12-11 15:56:50',3,'Ngọc Hải, Láng, Hà Nội, 0123656789','2025-12-11 09:58:14',NULL,NULL,'GIAM100',NULL,6,NULL,'2025-12-11 09:58:14',0.00,NULL,NULL,0,NULL,NULL),(29,7,NULL,'2025-11-21 04:51:57','PENDING',30000000.00,24000000.00,'PAYOS',NULL,'2025-11-21 04:51:56','2025-11-21 04:51:57',3,'Ngọc Hải, Láng, Hà Nội, 0123656789',NULL,'9c42dcce2b234b7e97aed55f448e470e',NULL,NULL,1,NULL,NULL,NULL,0.00,NULL,NULL,0,NULL,NULL),(30,7,NULL,'2025-11-21 04:56:16','PENDING',150000.00,148500.00,'PAYOS',NULL,'2025-11-21 04:56:16','2025-11-21 04:56:17',3,'Ngọc Hải, Láng, Hà Nội, 0123656789',NULL,'d07cbd3b012546d1945b46f1a130cdb7',NULL,'GIAM99',NULL,NULL,NULL,NULL,0.00,NULL,NULL,0,NULL,NULL),(31,7,NULL,'2025-11-21 05:29:18','PENDING',30000000.00,29700000.00,'PAYOS',NULL,'2025-11-21 05:29:17','2025-11-21 05:29:19',3,'Ngọc Hải, Láng, Hà Nội, 0123656789',NULL,'9ad51710f5464b15a3b94f6d382920d1',NULL,'GIAM99',NULL,NULL,NULL,NULL,0.00,NULL,NULL,0,NULL,NULL),(32,7,NULL,'2025-11-21 05:34:02','PENDING',150000.00,148500.00,'PAYOS',NULL,'2025-11-21 05:34:02','2025-11-21 05:34:03',3,'Ngọc Hải, Láng, Hà Nội, 0123656789',NULL,'77d02935cb8f470abd2a6d673a5de8ec',NULL,'GIAM99',NULL,NULL,NULL,NULL,0.00,NULL,NULL,0,NULL,NULL),(33,7,NULL,'2025-11-21 07:56:51','PENDING',60000000.00,60000000.00,'CASH',NULL,'2025-11-21 07:56:50','2025-11-21 07:56:50',3,'Ngọc Hải, Láng, Hà Nội, 0123656789',NULL,NULL,NULL,'GIAM100',NULL,NULL,NULL,NULL,0.00,NULL,NULL,0,NULL,NULL),(34,7,NULL,'2025-11-21 07:57:29','COMPLETED',30000000.00,30000000.00,'PAYOS',NULL,'2025-11-21 07:57:28','2025-12-11 15:56:50',3,'Ngọc Hải, Láng, Hà Nội, 0123656789','2025-12-11 09:58:14',NULL,NULL,'GIAM100',NULL,6,NULL,'2025-12-11 09:58:14',0.00,NULL,NULL,0,NULL,NULL),(35,7,NULL,'2025-11-21 08:04:33','COMPLETED',30000000.00,30000000.00,'PAYOS',NULL,'2025-11-21 08:04:32','2025-12-11 15:56:50',3,'Ngọc Hải, Láng, Hà Nội, 0123656789','2025-12-11 09:58:14',NULL,NULL,'GIAM100',NULL,6,NULL,'2025-12-11 09:58:14',0.00,NULL,NULL,0,NULL,NULL),(36,7,NULL,'2025-11-21 08:06:25','COMPLETED',150000.00,148500.00,'PAYOS',NULL,'2025-11-21 08:06:24','2025-12-11 15:56:50',3,'Ngọc Hải, Láng, Hà Nội, 0123656789','2025-12-11 09:58:14','0971f00f57414a95b2fcb692d4c94bad',NULL,'GIAM99',NULL,6,NULL,'2025-12-11 09:58:14',0.00,NULL,NULL,0,NULL,NULL),(37,7,NULL,'2025-11-21 08:11:20','PENDING',30000000.00,24000000.00,'PAYOS',NULL,'2025-11-21 08:11:20','2025-11-21 08:11:20',3,'Ngọc Hải, Láng, Hà Nội, 0123656789',NULL,'c1b1f00fd73b4f28bd7e7cedace65ab0',NULL,NULL,1,NULL,NULL,NULL,0.00,NULL,NULL,0,NULL,NULL),(38,7,NULL,'2025-11-21 08:17:01','COMPLETED',150000.00,148500.00,'PAYOS',NULL,'2025-11-21 08:17:01','2025-12-11 15:56:50',3,'Ngọc Hải, Láng, Hà Nội, 0123656789','2025-12-11 09:58:14','a4a6d62bb33846f5b75cb35228ca47fa',NULL,'GIAM99',NULL,6,NULL,'2025-12-11 09:58:14',0.00,NULL,NULL,0,NULL,NULL),(39,7,NULL,'2025-11-21 08:18:22','COMPLETED',150000.00,148500.00,'PAYOS',NULL,'2025-11-21 08:18:22','2025-12-11 15:56:50',3,'Ngọc Hải, Láng, Hà Nội, 0123656789','2025-12-11 09:58:14','daf10b9bf7124f45bda21e8dd4ba6e8d',NULL,'GIAM99',NULL,6,NULL,'2025-12-11 09:58:14',0.00,NULL,NULL,0,NULL,NULL),(40,7,NULL,'2025-11-21 09:24:17','CANCELED',5000000.00,0.00,'CASH',NULL,'2025-11-21 09:24:17','2025-11-21 09:24:24',3,'Ngọc Hải, Láng, Hà Nội, 0123656789',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0.00,NULL,NULL,0,NULL,NULL),(41,7,NULL,'2025-11-21 11:24:10','CANCELED',85000000.00,68000000.00,'CASH',NULL,'2025-11-21 11:24:09','2025-11-21 11:24:18',8,'hải, 159 phùng khoang, 0324543234',NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,0.00,NULL,NULL,0,NULL,NULL),(42,7,NULL,'2025-11-21 11:24:33','CANCELED',30000000.00,24000000.00,'PAYOS',NULL,'2025-11-21 11:24:32','2025-11-21 11:24:56',9,'hải, xóm 3, 0743852573',NULL,'b2eb13d7a43b447c81c2ce1f4bbdcd5f',NULL,NULL,1,NULL,NULL,NULL,0.00,NULL,NULL,0,NULL,NULL),(43,5,NULL,'2025-11-21 15:34:16','COMPLETED',55000000.00,55000000.00,'PAYOS',NULL,'2025-11-21 15:34:15','2025-12-11 15:56:50',NULL,'Vũ Hải, Nam Định, 0912345678','2025-12-11 09:58:14',NULL,NULL,'GIAM100',NULL,6,NULL,'2025-12-11 09:58:14',0.00,NULL,NULL,0,NULL,NULL),(44,5,NULL,'2025-11-21 15:55:49','CANCELED',25000000.00,24750000.00,'PAYOS',NULL,'2025-11-21 15:55:48','2025-12-10 17:12:31',10,'chung, 159 phùng khong, 0344535249',NULL,'58a867b60f524c13ab837a8af9bf0bbd',NULL,'GIAM99',NULL,NULL,NULL,NULL,0.00,NULL,NULL,0,NULL,NULL),(45,7,NULL,'2025-11-21 18:00:59','COMPLETED',200000.00,198000.00,'PAYOS',NULL,'2025-11-21 18:00:59','2025-12-11 15:56:50',9,'hải, xóm 3, 0743852573','2025-12-11 09:58:14','e42732abe4034cfd88975a68a50a56bc',NULL,'GIAM99',NULL,6,NULL,'2025-12-11 09:58:14',0.00,NULL,NULL,0,NULL,NULL),(46,5,NULL,'2025-11-22 02:28:41','COMPLETED',18000000.00,18000000.00,'PAYOS',NULL,'2025-11-22 02:28:41','2025-12-11 15:56:50',10,'chung, 159 phùng khong, 0344535249','2025-12-11 09:58:14',NULL,NULL,'GIAM100',NULL,6,NULL,'2025-12-11 09:58:14',0.00,NULL,NULL,0,NULL,NULL),(47,5,NULL,'2025-11-22 03:43:48','PENDING',60000000.00,59400000.00,'PAYOS',NULL,'2025-11-22 03:43:48','2025-11-22 03:43:48',10,'chung, 159 phùng khong, 0344535249',NULL,NULL,NULL,'GIAM99',NULL,NULL,NULL,NULL,0.00,NULL,NULL,0,NULL,NULL),(48,5,NULL,'2025-12-04 18:28:47','CANCELED',60000000.00,0.00,'PAYOS',NULL,'2025-12-04 18:28:47','2025-12-05 05:06:19',10,'chung, 159 phùng khong, 0344535249',NULL,'46c493c9d4404c1682f92d528ff4bb01',NULL,NULL,NULL,NULL,NULL,NULL,0.00,NULL,NULL,0,NULL,NULL),(49,5,NULL,'2025-12-10 17:19:54','COMPLETED',145000000.00,0.00,'CASH',NULL,'2025-12-10 17:19:54','2025-12-11 15:56:50',10,'chung, 159 phùng khong, 0344535249','2025-12-11 09:58:14',NULL,NULL,NULL,NULL,6,NULL,'2025-12-11 09:58:14',0.00,NULL,NULL,0,NULL,NULL),(50,5,NULL,'2025-12-11 05:11:34','PENDING',100200000.00,100200000.00,'CASH',NULL,'2025-12-11 05:11:34','2025-12-11 05:11:34',10,'chung, 159 phùng khong, 0344535249',NULL,NULL,NULL,'GIAM100',NULL,NULL,NULL,NULL,0.00,NULL,NULL,0,NULL,NULL),(51,5,NULL,'2025-12-11 12:08:03','COMPLETED',8000000.00,0.00,'CASH',NULL,'2025-12-11 12:08:02','2025-12-11 15:56:50',10,'chung, 159 phùng khong, 0344535249','2025-12-11 12:08:35',NULL,NULL,NULL,NULL,6,NULL,'2025-12-11 12:08:35',0.00,NULL,NULL,0,NULL,NULL),(52,5,NULL,'2025-12-11 12:14:23','COMPLETED',12000000.00,0.00,'CASH',NULL,'2025-12-11 12:14:23','2025-12-11 15:56:50',10,'chung, 159 phùng khong, 0344535249','2025-12-11 12:14:34',NULL,NULL,NULL,NULL,6,NULL,'2025-12-11 12:14:34',0.00,NULL,NULL,0,NULL,NULL),(53,5,NULL,'2025-12-11 12:15:32','COMPLETED',150000.00,0.00,'CASH',NULL,'2025-12-11 12:15:31','2025-12-11 15:56:50',10,'chung, 159 phùng khong, 0344535249','2025-12-11 12:15:45',NULL,NULL,NULL,NULL,6,NULL,'2025-12-11 12:15:45',0.00,NULL,NULL,0,NULL,NULL),(54,5,NULL,'2025-12-11 12:27:58','CANCELED',55000000.00,0.00,'CASH',NULL,'2025-12-11 12:27:58','2025-12-11 15:38:18',10,'chung, 159 phùng khong, 0344535249',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0.00,NULL,NULL,0,NULL,NULL),(55,5,NULL,'2025-12-11 12:32:55','COMPLETED',25000000.00,0.00,'CASH',NULL,'2025-12-11 12:32:54','2025-12-11 12:48:34',10,'chung, 159 phùng khong, 0344535249','2025-12-11 05:33:15',NULL,NULL,NULL,NULL,6,NULL,'2025-12-11 05:33:15',0.00,NULL,NULL,0,NULL,NULL),(56,5,NULL,'2025-12-11 12:39:45','COMPLETED',6000000.00,0.00,'CASH',NULL,'2025-12-11 12:39:44','2025-12-11 12:48:34',10,'chung, 159 phùng khong, 0344535249','2025-12-11 05:39:59',NULL,NULL,NULL,NULL,6,NULL,'2025-12-11 05:39:59',0.00,NULL,NULL,0,NULL,NULL),(57,5,NULL,'2025-12-11 12:54:14','COMPLETED',200000.00,0.00,'CASH',NULL,'2025-12-11 12:54:13','2025-12-11 12:54:30',10,'chung, 159 phùng khong, 0344535249','2025-12-11 05:54:31',NULL,NULL,NULL,NULL,6,NULL,'2025-12-11 05:54:31',0.00,NULL,NULL,0,NULL,NULL),(58,5,NULL,'2025-12-11 15:41:37','CANCELED',25000000.00,0.00,'CASH',NULL,'2025-12-11 15:41:37','2025-12-11 15:41:48',10,'chung, 159 phùng khong, 0344535249',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0.00,NULL,NULL,0,NULL,NULL),(59,5,NULL,'2025-12-11 15:42:31','CANCELED',33000000.00,0.00,'CASH',NULL,'2025-12-11 15:42:31','2025-12-11 15:42:50',10,'chung, 159 phùng khong, 0344535249',NULL,NULL,NULL,NULL,NULL,NULL,30000.00,NULL,0.00,NULL,NULL,0,NULL,NULL),(60,5,NULL,'2025-12-11 15:50:21','COMPLETED',33000000.00,0.00,'CASH',NULL,'2025-12-11 15:50:20','2025-12-11 15:50:30',10,'chung, 159 phùng khong, 0344535249','2025-12-11 08:50:30',NULL,NULL,NULL,NULL,6,30000.00,'2025-12-11 08:50:30',0.00,NULL,NULL,0,NULL,NULL),(61,5,NULL,'2025-12-11 15:51:19','COMPLETED',25000000.00,0.00,'CASH',NULL,'2025-12-11 15:51:19','2025-12-11 15:51:30',10,'chung, 159 phùng khong, 0344535249','2025-12-11 08:51:30',NULL,NULL,NULL,NULL,6,NULL,'2025-12-11 08:51:30',0.00,NULL,NULL,0,NULL,NULL),(62,5,NULL,'2025-12-11 15:58:37','COMPLETED',25000000.00,0.00,'CASH',NULL,'2025-12-11 15:58:37','2025-12-11 15:58:45',10,'chung, 159 phùng khong, 0344535249','2025-12-11 08:58:45',NULL,NULL,NULL,NULL,6,30000.00,'2025-12-11 08:58:45',0.00,NULL,NULL,0,NULL,NULL),(63,5,NULL,'2025-12-11 16:57:14','COMPLETED',25000000.00,25000000.00,'CASH',NULL,'2025-12-11 16:57:13','2025-12-11 16:57:24',10,'chung, 159 phùng khong, 0344535249','2025-12-11 09:57:25',NULL,NULL,'GIAM100',NULL,6,30000.00,'2025-12-11 09:57:25',0.00,NULL,NULL,0,NULL,NULL),(64,5,NULL,'2025-12-11 17:00:50','COMPLETED',30000000.00,15000000.00,'CASH',NULL,'2025-12-11 17:00:49','2025-12-11 17:01:02',10,'chung, 159 phùng khong, 0344535249','2025-12-11 10:01:03',NULL,NULL,'TD1250',NULL,6,30000.00,'2025-12-11 10:01:03',0.00,NULL,NULL,0,NULL,NULL),(65,5,NULL,'2025-12-11 17:02:46','COMPLETED',80000000.00,40000000.00,'CASH',NULL,'2025-12-11 17:02:45','2025-12-11 17:03:17',10,'chung, 159 phùng khong, 0344535249','2025-12-11 10:03:17',NULL,NULL,'TD1250',NULL,6,30000.00,'2025-12-11 10:03:17',0.00,NULL,NULL,0,NULL,NULL),(66,5,NULL,'2025-12-11 17:20:47','COMPLETED',6000000.00,6000000.00,'CASH',NULL,'2025-12-11 17:20:46','2025-12-11 17:21:02',10,'chung, 159 phùng khong, 0344535249','2025-12-11 10:21:02',NULL,NULL,'GIAM100',NULL,6,30000.00,'2025-12-11 10:21:02',0.00,NULL,NULL,0,NULL,NULL),(67,5,NULL,'2025-12-11 17:29:37','COMPLETED',8000000.00,8000000.00,'CASH',NULL,'2025-12-11 17:29:36','2025-12-11 17:29:55',10,'chung, 159 phùng khong, 0344535249','2025-12-11 10:29:55',NULL,NULL,'GIAM100',NULL,6,30000.00,'2025-12-11 10:29:55',0.00,NULL,NULL,0,NULL,NULL),(68,5,NULL,'2025-12-12 00:47:14','PENDING',200000.00,0.00,'CASH',NULL,'2025-12-12 00:47:13','2025-12-12 00:47:13',10,'chung, 159 phùng khong, 0344535249',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0.00,NULL,NULL,0,NULL,NULL),(69,5,NULL,'2025-12-12 04:34:43','CANCELED',30000000.00,0.00,'CASH',NULL,'2025-12-12 04:34:43','2025-12-12 04:35:00',10,'chung, 159 phùng khong, 0344535249',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0.00,NULL,NULL,0,NULL,NULL),(70,5,NULL,'2025-12-12 04:48:46','COMPLETED',25000000.00,0.00,'CASH',NULL,'2025-12-12 04:48:45','2025-12-12 04:48:55',10,'chung, 159 phùng khong, 0344535249','2025-12-11 21:48:56',NULL,NULL,NULL,NULL,6,30000.00,'2025-12-11 21:48:56',0.00,NULL,NULL,0,NULL,NULL),(71,5,NULL,'2025-12-12 04:49:10','CANCELED',55000000.00,0.00,'CASH',NULL,'2025-12-12 04:49:09','2025-12-12 04:49:13',10,'chung, 159 phùng khong, 0344535249',NULL,NULL,NULL,NULL,NULL,NULL,30000.00,NULL,0.00,NULL,NULL,0,NULL,NULL),(72,5,NULL,'2025-12-12 12:36:50','CANCELED',24000000.00,0.00,'CASH',NULL,'2025-12-12 12:36:50','2025-12-12 12:46:42',10,'chung, 159 phùng khong, 0344535249',NULL,NULL,NULL,NULL,NULL,NULL,30000.00,NULL,0.00,NULL,NULL,0,NULL,NULL),(73,5,NULL,'2025-12-12 12:37:06','PENDING',15000000.00,0.00,'CASH',NULL,'2025-12-12 12:37:06','2025-12-12 12:37:06',10,'chung, 159 phùng khong, 0344535249',NULL,NULL,NULL,NULL,NULL,NULL,30000.00,NULL,0.00,NULL,NULL,0,NULL,NULL),(74,5,NULL,'2025-12-12 17:57:27','COMPLETED',80000000.00,80000000.00,'PAYOS',NULL,'2025-12-12 17:57:27','2025-12-12 17:58:46',10,'chung, 159 phùng khong, 0344535249','2025-12-12 10:58:46','7d5db35d6fbc43739e76b7c4606ab494',NULL,'GIAM100',NULL,1,30000.00,'2025-12-12 10:58:46',0.00,NULL,NULL,0,NULL,NULL),(75,18,NULL,'2025-12-13 02:36:42','COMPLETED',4000000.00,4000000.00,'PAYOS',NULL,'2025-12-13 02:36:42','2025-12-13 02:37:43',11,'minh quân, ngõ 159 phùng khoang, 0934612452','2025-12-12 19:37:44','e4ac83edca0c4a2791463e105e57fa49',NULL,'GIAM100',NULL,1,30000.00,'2025-12-12 19:37:44',0.00,NULL,NULL,0,NULL,NULL),(76,5,NULL,'2025-12-13 04:13:41','PENDING',8000000.00,7920000.00,'CASH',NULL,'2025-12-13 04:13:41','2025-12-16 17:22:07',10,'chung, 159 phùng khong, 0344535249',NULL,NULL,NULL,'GIAM99',NULL,NULL,30000.00,NULL,0.00,NULL,NULL,1,'2025-12-16 17:22:07',NULL),(77,5,NULL,'2025-12-13 05:10:35','PENDING',120000000.00,96000000.00,'CASH',NULL,'2025-12-13 05:10:34','2025-12-13 05:10:34',10,'chung, 159 phùng khong, 0344535249',NULL,NULL,NULL,NULL,1,NULL,30000.00,NULL,0.00,NULL,NULL,0,NULL,NULL),(78,5,NULL,'2025-12-13 06:51:49','COMPLETED',25000000.00,25000000.00,'PAYOS',NULL,'2025-12-13 06:51:49','2025-12-16 18:11:54',10,'chung, 159 phùng khong, 0344535249','2025-12-12 23:52:25','352fca25a80d4ad89b4f5a9911c134b8',NULL,'GIAM100',NULL,1,30000.00,'2025-12-12 23:52:25',0.00,NULL,NULL,1,'2025-12-16 18:11:54',NULL),(79,5,NULL,'2025-12-13 07:16:35','COMPLETED',150000.00,0.00,'PAYOS',NULL,'2025-12-13 07:16:34','2025-12-16 18:10:05',10,'chung, 159 phùng khong, 0344535249','2025-12-13 00:17:07','520d9b79dbd94a718c94ef6d54e80884',NULL,NULL,NULL,1,30000.00,'2025-12-13 00:17:07',0.00,NULL,NULL,1,'2025-12-16 18:10:05',NULL),(80,5,NULL,'2025-12-13 08:03:17','COMPLETED',150000.00,0.00,'PAYOS',NULL,'2025-12-13 08:03:16','2025-12-16 17:14:08',10,'chung, 159 phùng khong, 0344535249','2025-12-13 01:03:40','f8cdcd218fe0435d87efd3fe9d3adc8e',NULL,NULL,NULL,1,30000.00,'2025-12-13 01:03:40',0.00,NULL,NULL,1,'2025-12-16 17:14:09',NULL);
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_tokens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` datetime NOT NULL,
  `used` tinyint(1) DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token` (`token`),
  KEY `idx_token` (`token`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_expires_at` (`expires_at`),
  CONSTRAINT `password_reset_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id_user`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
INSERT INTO `password_reset_tokens` VALUES (3,27,'UUanIEx1b5UMd7QqCBrLVAqjmeUQMjaq8P8Sp3wE2A0','2025-12-17 07:28:14',0,'2025-12-17 06:58:14');
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_images`
--

DROP TABLE IF EXISTS `product_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_images` (
  `id_product_image` int NOT NULL AUTO_INCREMENT,
  `id_product` int NOT NULL,
  `image_url` varchar(500) NOT NULL,
  `is_primary` tinyint(1) DEFAULT '0',
  `display_order` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_product_image`),
  KEY `idx_product_images_product` (`id_product`),
  KEY `idx_product_images_primary` (`id_product`,`is_primary`),
  KEY `idx_product_images_order` (`id_product`,`display_order`),
  CONSTRAINT `fk_product_images_product` FOREIGN KEY (`id_product`) REFERENCES `products` (`id_product`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_images`
--

LOCK TABLES `product_images` WRITE;
/*!40000 ALTER TABLE `product_images` DISABLE KEYS */;
INSERT INTO `product_images` VALUES (9,1,'/uploads/products/ed4f14aa-1fbf-4cd3-b989-6595fbc2eea7.png',1,0,'2025-11-21 12:05:43','2025-11-21 12:05:43'),(10,2,'/uploads/products/44b48ceb-cb7c-469a-a9d1-98844b7561c9.png',1,0,'2025-11-21 12:08:23','2025-11-21 12:08:23'),(11,3,'/uploads/products/6bc963df-3a13-4b10-aeca-10020117e16d.png',1,0,'2025-11-21 12:17:25','2025-11-21 12:17:25'),(12,4,'/uploads/products/0b1ca39c-131c-4974-943f-64a61813e9df.png',1,0,'2025-11-21 12:20:07','2025-11-21 12:20:07'),(13,5,'/uploads/products/34ca0e1e-f96c-462c-8d9d-33931051c6d0.png',1,0,'2025-11-21 12:22:21','2025-11-21 12:22:21'),(14,6,'/uploads/products/4fc29940-f23f-49f1-b52e-c245d156654c.png',1,0,'2025-11-21 12:25:29','2025-11-21 12:25:29'),(15,7,'/uploads/products/ac09ede2-a719-4032-9fc6-028e54acffa7.jpg',1,0,'2025-11-21 12:27:50','2025-11-21 12:27:50'),(16,8,'/uploads/products/96469811-1b95-4474-919e-53c790b9fc5e.png',1,0,'2025-11-21 12:29:40','2025-11-21 12:29:40'),(17,9,'/uploads/products/638c1660-d710-445e-832a-836d9b0ccdc6.png',1,0,'2025-11-21 12:31:02','2025-11-21 12:31:02'),(18,10,'/uploads/products/bf4a2a40-0f27-47b6-bf59-92237a338764.png',1,0,'2025-11-21 12:32:08','2025-11-21 12:32:08'),(19,27,'/uploads/products/5726cc57-d648-4565-a149-923aab76ca39.png',1,0,'2025-11-21 12:34:27','2025-11-21 12:34:27'),(20,26,'/uploads/products/975b3753-39f6-4a85-a367-13deeab1e665.jpg',1,0,'2025-11-21 12:35:48','2025-11-21 12:35:48'),(21,19,'/uploads/products/bccbb5da-1b96-481a-bde4-7aa32a6fc526.png',1,0,'2025-11-21 12:36:48','2025-11-21 12:36:48'),(22,14,'/uploads/products/6eea8b7f-657f-4d08-b3a9-8a2253b61e32.png',1,0,'2025-11-21 12:38:33','2025-11-21 12:38:33'),(23,11,'/uploads/products/66fdb689-8e72-43b1-aa80-32e9fa70e372.png',1,0,'2025-11-21 12:40:06','2025-11-21 12:40:06'),(24,12,'/uploads/products/bc4d639b-5a49-4523-a4cf-1c1ae0e3b80c.png',1,0,'2025-11-21 18:45:13','2025-11-21 18:45:13'),(25,13,'/uploads/products/2e7e702d-eb95-4988-aef3-5b19d878a2d0.png',1,0,'2025-11-21 18:46:09','2025-11-21 18:46:09'),(26,15,'/uploads/products/da7700ad-4941-4ab8-b7d1-7d2a56fa538c.png',1,0,'2025-11-21 18:46:56','2025-11-21 18:46:56'),(27,16,'/uploads/products/698e30fa-26ab-4971-8f53-387885901e96.png',1,0,'2025-11-21 18:48:14','2025-11-21 18:48:14'),(28,16,'/uploads/products/c4e66c3b-c0df-4414-bfb0-d4a645add59f.png',0,1,'2025-11-21 18:48:14','2025-11-21 18:48:14'),(29,17,'/uploads/products/fbee75f9-bbc6-4d73-94cf-4899e96fd29a.png',1,0,'2025-11-21 18:49:51','2025-11-21 18:49:51'),(30,18,'/uploads/products/87c66e19-e8f4-476b-9c12-abb504845071.png',1,0,'2025-11-21 18:51:14','2025-11-21 18:51:14'),(31,18,'/uploads/products/7f05ec50-392e-4dae-a573-541ecf2427b6.png',0,1,'2025-11-21 18:51:14','2025-11-21 18:51:14'),(32,18,'/uploads/products/36b330b5-af81-4c66-9364-80f33caa3f3a.png',0,2,'2025-11-21 18:51:14','2025-11-21 18:51:14'),(33,18,'/uploads/products/8561eef8-7875-46ce-b905-863aacbf8b1e.png',0,3,'2025-11-21 18:51:14','2025-11-21 18:51:14'),(34,20,'/uploads/products/3d2f020a-7c4d-45a8-a539-13d7d45ae04f.png',1,0,'2025-11-21 18:53:34','2025-11-21 18:53:34'),(35,21,'/uploads/products/5a810f52-e38c-482a-8967-b7958f84ad46.png',1,0,'2025-11-21 18:55:27','2025-11-21 18:55:27'),(36,22,'/uploads/products/b1408e59-227d-465d-b05f-511475493c34.png',1,0,'2025-11-21 18:57:30','2025-11-21 18:57:30'),(37,24,'/uploads/products/34992bf5-e0e2-435d-8ba1-bdb99ca7b828.png',1,0,'2025-11-21 18:58:47','2025-11-21 18:58:47'),(38,21,'/uploads/products/15dd1c9e-64ef-445a-9d4c-7798126cf9a7.webp',0,1,'2025-12-13 00:35:21','2025-12-13 00:35:21');
/*!40000 ALTER TABLE `product_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_promotions`
--

DROP TABLE IF EXISTS `product_promotions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_promotions` (
  `id_product_promotion` int NOT NULL AUTO_INCREMENT,
  `id_product` int NOT NULL,
  `discount_type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'PERCENTAGE or FIXED_AMOUNT',
  `discount_value` decimal(12,2) NOT NULL,
  `valid_from` datetime NOT NULL,
  `valid_to` datetime NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `promotion_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_product_promotion`),
  KEY `idx_product_promotions_active_valid` (`is_active`,`valid_from`,`valid_to`),
  KEY `idx_product_promotions_product` (`id_product`),
  CONSTRAINT `fk_product_promotion_product` FOREIGN KEY (`id_product`) REFERENCES `products` (`id_product`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_promotions`
--

LOCK TABLES `product_promotions` WRITE;
/*!40000 ALTER TABLE `product_promotions` DISABLE KEYS */;
INSERT INTO `product_promotions` VALUES (1,1,'PERCENTAGE',20.00,'2025-12-17 14:17:01','2026-01-16 14:17:01',1,'Flash Sale Tháng 12','Giảm 20% cho sản phẩm hot nhất tháng này','2025-12-17 14:17:01','2025-12-17 14:17:01'),(2,2,'PERCENTAGE',15.00,'2025-12-17 14:17:01','2025-12-24 14:17:01',1,'Ưu đãi cuối tuần','Giảm giá đặc biệt cuối tuần','2025-12-17 14:17:01','2025-12-17 14:17:01'),(3,3,'FIXED_AMOUNT',500000.00,'2025-12-17 14:17:01','2025-12-31 14:17:01',1,'Giảm 500K','Giảm trực tiếp 500.000đ cho đơn hàng','2025-12-17 14:17:01','2025-12-17 14:17:01'),(4,4,'PERCENTAGE',25.00,'2025-12-17 14:17:01','2025-12-20 14:17:01',1,'Flash Deal 3 ngày','Chỉ còn 3 ngày - Không thể bỏ lỡ!','2025-12-17 14:17:01','2025-12-17 14:17:01'),(5,5,'PERCENTAGE',10.00,'2025-12-17 14:17:01','2026-01-07 14:17:01',1,'Khuyến mãi tháng cuối năm','Ưu đãi đặc biệt dịp cuối năm','2025-12-17 14:17:01','2025-12-17 14:17:01');
/*!40000 ALTER TABLE `product_promotions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_reviews`
--

DROP TABLE IF EXISTS `product_reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_reviews` (
  `id_review` int NOT NULL AUTO_INCREMENT,
  `id_product` int NOT NULL,
  `id_customer` int NOT NULL,
  `id_order` int DEFAULT NULL COMMENT 'Reference đến order đã mua sản phẩm',
  `id_order_detail` int DEFAULT NULL COMMENT 'Reference đến order detail cụ thể',
  `rating` int NOT NULL,
  `comment` text NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `admin_reply` text COMMENT 'Câu trả lời từ admin/employee',
  `edit_count` int NOT NULL DEFAULT '0' COMMENT 'Số lần đã chỉnh sửa review (tối đa 1 lần)',
  PRIMARY KEY (`id_review`),
  UNIQUE KEY `uq_review_order_detail` (`id_order_detail`) COMMENT 'Mỗi order detail chỉ được review 1 lần',
  KEY `idx_reviews_product` (`id_product`),
  KEY `idx_reviews_customer` (`id_customer`),
  KEY `idx_reviews_order` (`id_order`),
  KEY `idx_reviews_order_detail` (`id_order_detail`),
  CONSTRAINT `fk_reviews_customer` FOREIGN KEY (`id_customer`) REFERENCES `customers` (`id_customer`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_reviews_order` FOREIGN KEY (`id_order`) REFERENCES `orders` (`id_order`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_reviews_order_detail` FOREIGN KEY (`id_order_detail`) REFERENCES `order_details` (`id_order_detail`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_reviews_product` FOREIGN KEY (`id_product`) REFERENCES `products` (`id_product`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `product_reviews_chk_1` CHECK (((`rating` >= 1) and (`rating` <= 5)))
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Bảng lưu đánh giá sản phẩm của khách hàng';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_reviews`
--

LOCK TABLES `product_reviews` WRITE;
/*!40000 ALTER TABLE `product_reviews` DISABLE KEYS */;
INSERT INTO `product_reviews` VALUES (1,27,5,43,59,5,'điện thoại xịn','2025-11-21 08:43:40','2025-11-21 08:47:17','cảm ơn bạn đã mua hàng',0),(2,19,7,38,52,5,'cáp sạc ổn','2025-11-21 12:42:48','2025-11-21 12:42:48',NULL,0),(3,27,5,49,67,5,'điện thoại đúng như mô tả','2025-12-10 10:26:45','2025-12-10 10:33:27','cảm ơn bạn đã mua hàng',0),(4,5,5,49,65,5,'nhận xét từ nguyenchung','2025-12-11 02:41:28','2025-12-11 02:41:28',NULL,0),(5,26,5,49,66,5,'ok','2025-12-11 04:58:32','2025-12-11 04:58:32',NULL,0),(6,19,5,79,106,5,'oke','2025-12-13 00:45:59','2025-12-13 00:45:59',NULL,0);
/*!40000 ALTER TABLE `product_reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_view`
--

DROP TABLE IF EXISTS `product_view`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_view` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `session_id` varchar(100) DEFAULT NULL,
  `product_id` int NOT NULL,
  `action_type` varchar(20) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_product_view_user_created` (`user_id`,`created_at`),
  KEY `idx_product_view_product_created` (`product_id`,`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=410 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_view`
--

LOCK TABLES `product_view` WRITE;
/*!40000 ALTER TABLE `product_view` DISABLE KEYS */;
INSERT INTO `product_view` VALUES (1,11,'A47D06170EFA912704D83D8D354FD4B3',27,'VIEW','2025-11-20 08:36:53','2025-11-20 08:36:53'),(2,11,'D775B401D26E092D5EEBD7B3F5E86AF9',27,'VIEW','2025-11-20 08:36:53','2025-11-20 08:36:53'),(3,11,'7B3D61C387FB9D4086B3B0A0439852A6',2,'VIEW','2025-11-20 08:37:05','2025-11-20 08:37:05'),(4,11,'E2BDAC60FCD97B74B98E264E8D17C39C',24,'VIEW','2025-11-20 08:37:09','2025-11-20 08:37:09'),(5,11,'EC9757C5EA0574CC92F53077DE8C9C11',26,'VIEW','2025-11-20 08:37:17','2025-11-20 08:37:17'),(6,11,'6FD65A46E0181AC20A99B112A61B999D',10,'VIEW','2025-11-20 08:37:54','2025-11-20 08:37:54'),(7,11,'6CF342BDB957AD164B1F9433B5ADF4A1',10,'VIEW','2025-11-20 08:37:54','2025-11-20 08:37:54'),(8,11,'60A48D8CB025E2B1B42114323574AEE0',9,'VIEW','2025-11-20 08:38:22','2025-11-20 08:38:22'),(9,11,'80B991ECF135562EB9E0BA09585BD680',9,'VIEW','2025-11-20 08:38:22','2025-11-20 08:38:22'),(10,11,'1DB4ECC18D40B49D8E53C11E87A3256A',12,'VIEW','2025-11-20 08:38:37','2025-11-20 08:38:37'),(11,11,'6AB09A9FCAFBACCC2D57DFA73A5B0420',7,'VIEW','2025-11-20 08:39:04','2025-11-20 08:39:04'),(12,11,'92C38A64E00B319CF84926FB20585679',7,'VIEW','2025-11-20 08:39:04','2025-11-20 08:39:04'),(13,11,'07160EAF61228F3BFE259D9F094616CB',27,'VIEW','2025-11-20 08:50:27','2025-11-20 08:50:27'),(14,11,'340C62E1AD58F3D49D015AE93A71646B',27,'VIEW','2025-11-20 08:50:27','2025-11-20 08:50:27'),(15,11,'52C7D94E9A7874DCFE394F1B8E7B438E',27,'VIEW','2025-11-20 08:50:32','2025-11-20 08:50:32'),(16,11,'BCE5C89600B22FEC11D9378EB05BED4C',27,'VIEW','2025-11-20 08:50:32','2025-11-20 08:50:32'),(17,11,'477A31023DE5756318B50B3B1E2719FD',14,'VIEW','2025-11-20 08:51:03','2025-11-20 08:51:03'),(18,11,'E733894DE54ACB9639D14E8F9F097EDE',14,'VIEW','2025-11-20 08:51:03','2025-11-20 08:51:03'),(19,11,'DB43AFB93B116FCC8A2F28364446C219',14,'VIEW','2025-11-20 08:51:14','2025-11-20 08:51:14'),(20,11,'2D43BD1CBC6A18ECB9367440F5972A6B',14,'VIEW','2025-11-20 08:51:14','2025-11-20 08:51:14'),(21,11,'AF6F87EE901AFD5CF5CDA8EED1DB86A5',27,'VIEW','2025-11-20 08:51:23','2025-11-20 08:51:23'),(22,11,'72E4A2F2C59E7CA4E179BF6C05B04DD5',27,'VIEW','2025-11-20 08:51:23','2025-11-20 08:51:23'),(23,11,'1BF64B29F8BEBE4A6A5B55277965C96F',11,'VIEW','2025-11-20 08:54:28','2025-11-20 08:54:28'),(24,11,'A4FF23CADE27A0FEAD73D768EA69C956',11,'VIEW','2025-11-20 08:54:28','2025-11-20 08:54:28'),(25,11,'C337CC6A4C14E309F9AD4E5C4D927AF8',11,'VIEW','2025-11-20 08:57:33','2025-11-20 08:57:33'),(26,11,'B1628DFB0A9BD96EE81775113223427F',11,'VIEW','2025-11-20 08:57:33','2025-11-20 08:57:33'),(27,11,'AFCB463DBF53F001463AC6E173E3DC50',27,'VIEW','2025-11-20 09:23:42','2025-11-20 09:23:42'),(28,11,'CE7B9A2C0125AF0835CA4BCE0D320413',27,'VIEW','2025-11-20 09:23:42','2025-11-20 09:23:42'),(29,11,'CBA9C0F63A2548B154ABC7C286B39306',20,'VIEW','2025-11-20 10:10:32','2025-11-20 10:10:32'),(30,11,'DE5C9705807B40E526950DD00E915578',20,'VIEW','2025-11-20 10:10:32','2025-11-20 10:10:32'),(31,11,'46F34C48E2853F63D66D9D93FBC08D67',17,'VIEW','2025-11-20 11:03:20','2025-11-20 11:03:20'),(32,11,'E96FCF87A39446B9078757CEF4E5B958',17,'VIEW','2025-11-20 11:03:20','2025-11-20 11:03:20'),(33,11,'4056D40D58CC09BFC0A393C1EBA52BE0',1,'VIEW','2025-11-20 11:58:44','2025-11-20 11:58:44'),(34,11,'53FAB05099C4DE4992246F5B147B204E',1,'VIEW','2025-11-20 11:58:44','2025-11-20 11:58:44'),(35,11,'6FD4DCDB5C726F1755CE7E02C2DE56E6',27,'VIEW','2025-11-20 12:13:14','2025-11-20 12:13:14'),(36,11,'16431AC24D80D2DFE938B24E119C4EE7',27,'VIEW','2025-11-20 12:13:14','2025-11-20 12:13:14'),(37,11,'35B48BAFC4786205FE8853D96560ED06',27,'VIEW','2025-11-20 21:50:53','2025-11-20 21:50:53'),(38,11,'32672E6A0014C2E1FED350A010B158EF',27,'VIEW','2025-11-20 21:50:53','2025-11-20 21:50:53'),(39,11,'6060796597A0C8757E6F1FCB55545EB0',27,'VIEW','2025-11-20 21:51:49','2025-11-20 21:51:49'),(40,11,'344FDDFB1B8A1CCEBF2CFF703742FC26',27,'VIEW','2025-11-20 21:51:49','2025-11-20 21:51:49'),(41,11,'E0AAB631B96A131420B7F39E715BED68',19,'VIEW','2025-11-20 21:56:00','2025-11-20 21:56:00'),(42,11,'64CFEA052023199A715FC319A5A2F7E7',19,'VIEW','2025-11-20 21:56:00','2025-11-20 21:56:00'),(43,11,'C3A80C36028854F0D4CA418DF09315FD',19,'VIEW','2025-11-20 22:33:27','2025-11-20 22:33:27'),(44,11,'67C0C25AB467510E8F36361ABAE0CD01',19,'VIEW','2025-11-20 22:33:27','2025-11-20 22:33:27'),(45,11,'75E268A476B1834A97E9DCA69E09F236',27,'VIEW','2025-11-21 00:57:11','2025-11-21 00:57:11'),(46,11,'E4368373CD46E736BB984602EE89C386',27,'VIEW','2025-11-21 00:57:11','2025-11-21 00:57:11'),(47,11,'9075FE49C0D381B7C0927672F668252C',27,'VIEW','2025-11-21 01:11:12','2025-11-21 01:11:12'),(48,11,'857DEEB695292BF71A868FBF1B331C32',27,'VIEW','2025-11-21 01:11:12','2025-11-21 01:11:12'),(49,11,'80565894E45B7A12E288A3E738BDBD92',19,'VIEW','2025-11-21 01:16:46','2025-11-21 01:16:46'),(50,11,'39F7C1E19B641EB35DA8AED0E8E20CC3',19,'VIEW','2025-11-21 01:16:46','2025-11-21 01:16:46'),(51,11,'CE79A9BEF5E51A795FC38DC9D1B38FD9',19,'VIEW','2025-11-21 01:18:09','2025-11-21 01:18:09'),(52,11,'B8EC90536156FBC5AF216B010ED2125C',19,'VIEW','2025-11-21 01:18:09','2025-11-21 01:18:09'),(53,11,'75A4E9374FFE05321821EFA5BE353A32',27,'VIEW','2025-11-21 01:32:30','2025-11-21 01:32:30'),(54,11,'09FA2DEB35F88F23587B36E4FFA4640C',27,'VIEW','2025-11-21 01:32:30','2025-11-21 01:32:30'),(55,11,'F3EE1923B3F858FF3156EFB2AF9B54DF',19,'VIEW','2025-11-21 01:45:19','2025-11-21 01:45:19'),(56,11,'D348115FCF4372C3917FF75E66E61866',19,'VIEW','2025-11-21 01:45:19','2025-11-21 01:45:19'),(57,11,'D6697657F3C19CA3756330668FDAE65A',19,'VIEW','2025-11-21 01:45:28','2025-11-21 01:45:28'),(58,11,'C2A4EEC6F99E37B7A5FA7A0FCCFB3373',19,'VIEW','2025-11-21 01:45:28','2025-11-21 01:45:28'),(59,11,'2AC6F9080DE00D2BC9DCDDA014B0468B',19,'VIEW','2025-11-21 01:45:32','2025-11-21 01:45:32'),(60,11,'3EBD4C0B04D6EEF23C4CB4F179270721',19,'VIEW','2025-11-21 01:45:32','2025-11-21 01:45:32'),(61,11,'FA2852689EDDEF15A34038A23F1661FB',19,'VIEW','2025-11-21 01:45:39','2025-11-21 01:45:39'),(62,11,'F218D8DF30DBC2F68C65C9B8F89B05AE',19,'VIEW','2025-11-21 01:45:39','2025-11-21 01:45:39'),(63,11,'0EBB958755ABD3F75C6E0EDA747C80C5',19,'VIEW','2025-11-21 01:45:51','2025-11-21 01:45:51'),(64,11,'726B7BCBF678BB2752A9F335BA08B71D',19,'VIEW','2025-11-21 01:45:51','2025-11-21 01:45:51'),(65,11,'DF9D197C9D795AE3EB80128290E908EF',20,'VIEW','2025-11-21 01:47:51','2025-11-21 01:47:51'),(66,11,'C80E6CBB19F4AE03D0CBD4DA33B5BB9D',20,'VIEW','2025-11-21 01:47:51','2025-11-21 01:47:51'),(67,11,'5437B161C983864623AEA1DEED8B2C0A',20,'VIEW','2025-11-21 01:47:58','2025-11-21 01:47:58'),(68,11,'6C15EE6EF21520C18E2876AD98812ECB',20,'VIEW','2025-11-21 01:47:58','2025-11-21 01:47:58'),(69,11,'DD6F9D63A155A74F46E9F2C96E019ADE',21,'VIEW','2025-11-21 01:51:06','2025-11-21 01:51:06'),(70,11,'D247478FAC4B6913F44973107F79FF01',21,'VIEW','2025-11-21 01:51:06','2025-11-21 01:51:06'),(71,11,'9E64A060BE0A15DAE63B0EE7449E11FC',6,'VIEW','2025-11-21 02:09:08','2025-11-21 02:09:08'),(72,11,'25D6E53B0D82F52EB055B9D03F64BEC5',6,'VIEW','2025-11-21 02:09:08','2025-11-21 02:09:08'),(73,11,'377F959895F3312088BFE6D3C04911BD',26,'VIEW','2025-11-21 02:34:25','2025-11-21 02:34:25'),(74,11,'ABB17889006339734B19A079330B98C0',26,'VIEW','2025-11-21 02:34:25','2025-11-21 02:34:25'),(75,11,'71854A8ADD22D1C6BBCA9E1CE9E34D30',27,'VIEW','2025-11-21 03:05:53','2025-11-21 03:05:53'),(76,11,'043859CB4CFF3FB282825E64947C9CB9',27,'VIEW','2025-11-21 03:05:53','2025-11-21 03:05:53'),(77,8,'AA69363A6888599F9C2092D325F16E3B',1,'VIEW','2025-11-21 03:19:27','2025-11-21 03:19:27'),(78,8,'A53328A32C2B350B76D29E5E56A2350F',1,'VIEW','2025-11-21 03:19:27','2025-11-21 03:19:27'),(79,11,'2346213084832A107AA38AE317811367',27,'VIEW','2025-11-21 03:19:38','2025-11-21 03:19:38'),(80,11,'A0380EE667A02615FC0602BD21F32B44',27,'VIEW','2025-11-21 03:19:38','2025-11-21 03:19:38'),(81,11,'BA6A84D13CB56345DE38372F66146184',27,'VIEW','2025-11-21 03:22:36','2025-11-21 03:22:36'),(82,11,'AAC9DA0275B8BC2666E0DB8F8FB2487D',27,'VIEW','2025-11-21 03:22:36','2025-11-21 03:22:36'),(83,11,'0379A39F91DBBA094CFB7C7C3A0FEBEC',27,'VIEW','2025-11-21 04:24:23','2025-11-21 04:24:23'),(84,11,'B77B1031F4CD7260C627416519B14909',27,'VIEW','2025-11-21 04:24:23','2025-11-21 04:24:23'),(85,9,'A3289B6A581A88108178201415DB5F98',5,'VIEW','2025-11-21 08:06:10','2025-11-21 08:06:10'),(86,9,'0EC9F091C719647187799EC63E635E38',5,'VIEW','2025-11-21 08:06:10','2025-11-21 08:06:10'),(87,9,'7FF585F1DA07BE50EFD316F61F866D16',23,'VIEW','2025-11-21 08:06:33','2025-11-21 08:06:33'),(88,9,'3779A9E75DE08417DEA4B30BC71AAF8D',23,'VIEW','2025-11-21 08:06:33','2025-11-21 08:06:33'),(89,9,'00A731A8B2801098268D0D0C601C4913',23,'VIEW','2025-11-21 08:33:42','2025-11-21 08:33:42'),(90,9,'AF258B0EF24789CF08F13597376FD8EE',23,'VIEW','2025-11-21 08:33:42','2025-11-21 08:33:42'),(91,9,'EEF57F2D3BC824B19C63247B6664DFB7',27,'VIEW','2025-11-21 08:35:05','2025-11-21 08:35:05'),(92,9,'C0347566CFF567E87BED6754C610112A',27,'VIEW','2025-11-21 08:35:05','2025-11-21 08:35:05'),(93,9,'07816CE7EB5CDDC8106AF1550F76C34C',27,'VIEW','2025-11-21 08:42:52','2025-11-21 08:42:52'),(94,9,'DACD46F053AD963D0C6A089CFF91335F',27,'VIEW','2025-11-21 08:42:52','2025-11-21 08:42:52'),(95,8,'2533AE5CC1CD0400F0549834080FE415',27,'VIEW','2025-11-21 08:44:23','2025-11-21 08:44:23'),(96,8,'E39800D0E12D46414194D43EDEC820EE',27,'VIEW','2025-11-21 08:44:23','2025-11-21 08:44:23'),(97,8,'F21D26C77CF08F954B50BC3201DF15EC',27,'VIEW','2025-11-21 08:45:54','2025-11-21 08:45:54'),(98,8,'F46B79AFB312CBFC5C918B607BC2AF1D',27,'VIEW','2025-11-21 08:45:54','2025-11-21 08:45:54'),(99,8,'37B05A99E77D773C7561A6902C4F9E20',27,'VIEW','2025-11-21 08:45:59','2025-11-21 08:45:59'),(100,8,'B8248F2D4557E99419BA4151754E7260',27,'VIEW','2025-11-21 08:45:59','2025-11-21 08:45:59'),(101,8,'66C360937EE03ED127FA27E9E2302BAC',27,'VIEW','2025-11-21 08:46:15','2025-11-21 08:46:15'),(102,8,'9F840BD7E4FA4D5F7ED489B1B0444CC9',27,'VIEW','2025-11-21 08:46:15','2025-11-21 08:46:15'),(103,9,'0425A6BF4476C0D9EBCF1541771788D0',27,'VIEW','2025-11-21 08:47:28','2025-11-21 08:47:28'),(104,9,'02F1033FD8171BD0A73CD45FA322F0F4',27,'VIEW','2025-11-21 08:47:28','2025-11-21 08:47:28'),(105,9,'429CAE59784B4C418741C27ADDBABC27',26,'VIEW','2025-11-21 08:54:07','2025-11-21 08:54:07'),(106,9,'560C60E7E2AFCD68614E61D4B4C11C9B',26,'VIEW','2025-11-21 08:54:07','2025-11-21 08:54:07'),(107,11,'9732F00DB74679C960DCB585572977BD',26,'VIEW','2025-11-21 10:41:15','2025-11-21 10:41:15'),(108,11,'96E32B66F32CDEA02F86F29BD2785746',26,'VIEW','2025-11-21 10:41:15','2025-11-21 10:41:15'),(109,11,'4547DBE3D30E5DAC78F656F157E18118',27,'VIEW','2025-11-21 10:41:52','2025-11-21 10:41:52'),(110,11,'1DEFD170618AF40A7333DD33ACDA3A48',27,'VIEW','2025-11-21 10:41:52','2025-11-21 10:41:52'),(111,11,'26F02730D0C489EDCE79FEE6FAF299EE',18,'VIEW','2025-11-21 11:00:31','2025-11-21 11:00:31'),(112,11,'CC93540AA48B10A94AED41FB3C76FF8B',18,'VIEW','2025-11-21 11:00:31','2025-11-21 11:00:31'),(113,11,'C4F4CF5855EE0B023E9033A95E671850',26,'VIEW','2025-11-21 11:37:45','2025-11-21 11:37:45'),(114,11,'9A5C4051D49B0AB23095DDECC27AF200',26,'VIEW','2025-11-21 11:37:45','2025-11-21 11:37:45'),(115,11,'50A57CBE2945C11F36EF4EF4866EEEF6',27,'VIEW','2025-11-21 11:47:25','2025-11-21 11:47:25'),(116,11,'9B57B393C0FA9ACB5711622A856857FC',27,'VIEW','2025-11-21 11:47:25','2025-11-21 11:47:25'),(117,11,'BED477CF6E1DCCAF2924C924C9691ACD',26,'VIEW','2025-11-21 12:02:01','2025-11-21 12:02:01'),(118,11,'B9EAAC1F9BDB9EEE9D834D93FCB51B59',26,'VIEW','2025-11-21 12:02:01','2025-11-21 12:02:01'),(119,11,'DC80210AE016FE7109D193B77B6483A5',26,'VIEW','2025-11-21 12:02:05','2025-11-21 12:02:05'),(120,11,'FC1600DFEFFAC3764192E76981D17B0A',26,'VIEW','2025-11-21 12:02:05','2025-11-21 12:02:05'),(121,11,'EBBF60D0D93C3BB0B08466E6181D8241',26,'VIEW','2025-11-21 12:02:06','2025-11-21 12:02:06'),(122,11,'0B8375C14F870934C1AE9ECC290AC31F',26,'VIEW','2025-11-21 12:02:06','2025-11-21 12:02:06'),(123,11,'1FA28CD83DB99CD68B4EE0CBBD1C62C3',26,'VIEW','2025-11-21 12:02:06','2025-11-21 12:02:06'),(124,11,'524F001F40D22B0B612F5007595ABC2D',26,'VIEW','2025-11-21 12:02:06','2025-11-21 12:02:06'),(125,8,'CAF6552E2064D3B929F2F3D4C9C77AD5',1,'VIEW','2025-11-21 12:02:12','2025-11-21 12:02:12'),(126,8,'356A6B487811FC9DC7F0C008862B4CBE',1,'VIEW','2025-11-21 12:02:12','2025-11-21 12:02:12'),(127,8,'D687E96849A06D52D20AAAF2EB4702A8',1,'VIEW','2025-11-21 12:02:34','2025-11-21 12:02:34'),(128,8,'EC70052F666181A1FAFE4CB7FEED6AFB',1,'VIEW','2025-11-21 12:02:34','2025-11-21 12:02:34'),(129,8,'DCD9AFB48245C28D2EB4D5230355FF65',1,'VIEW','2025-11-21 12:03:40','2025-11-21 12:03:40'),(130,8,'7FF2550FEDAC18721231E1D80C55AB06',1,'VIEW','2025-11-21 12:03:40','2025-11-21 12:03:40'),(131,8,'276BDC013067AB5656A15B36502FC454',1,'VIEW','2025-11-21 12:04:25','2025-11-21 12:04:25'),(132,8,'2C32E5A486E1224E422E4E53AEB6C0F6',1,'VIEW','2025-11-21 12:04:25','2025-11-21 12:04:25'),(133,8,'5D140A86D19559DF6BB4B6041B550594',1,'VIEW','2025-11-21 12:04:30','2025-11-21 12:04:30'),(134,8,'C3AD5ADBF726F1469708FA59649832DC',1,'VIEW','2025-11-21 12:04:30','2025-11-21 12:04:30'),(135,11,'0B350EF41B2DD176CF37D8EAAB6A46DF',26,'VIEW','2025-11-21 12:04:41','2025-11-21 12:04:41'),(136,11,'3079754B456D49A552AAAF887F844B42',26,'VIEW','2025-11-21 12:04:41','2025-11-21 12:04:41'),(137,11,'8CC7D9D73F754895D0561D73EF904459',26,'VIEW','2025-11-21 12:04:42','2025-11-21 12:04:42'),(138,11,'78FE8AD7D9CF2C1E5D6AA58925DBD1C7',26,'VIEW','2025-11-21 12:04:42','2025-11-21 12:04:42'),(139,11,'6D1175C9B24CF0144A04C95AA555F7B5',26,'VIEW','2025-11-21 12:04:42','2025-11-21 12:04:42'),(140,11,'BAF2E8A1C43224E0F2F2B8F78D83B126',26,'VIEW','2025-11-21 12:04:42','2025-11-21 12:04:42'),(141,11,'E1DCF426A4472D522DC178CDB7AD30BC',26,'VIEW','2025-11-21 12:04:43','2025-11-21 12:04:43'),(142,11,'8478E51FCF9F27C3E7D99D4DE5D1D9CC',26,'VIEW','2025-11-21 12:04:43','2025-11-21 12:04:43'),(143,11,'C6795D287BD2FE230DE1900B077EB11F',26,'VIEW','2025-11-21 12:04:43','2025-11-21 12:04:43'),(144,11,'B6CB9E0DCEDF0B71D573A69CAD9B7E14',26,'VIEW','2025-11-21 12:04:43','2025-11-21 12:04:43'),(145,11,'490F4EB749619CE2AE59DF84456F2F5D',26,'VIEW','2025-11-21 12:04:44','2025-11-21 12:04:44'),(146,11,'E6501ADE510BF724C7E572B3636C100D',26,'VIEW','2025-11-21 12:04:44','2025-11-21 12:04:44'),(147,11,'BB9BA923366B77BE0559E300E59AC251',26,'VIEW','2025-11-21 12:04:44','2025-11-21 12:04:44'),(148,11,'52ABC0844FB16ED5E962B3DD2E323F71',26,'VIEW','2025-11-21 12:04:44','2025-11-21 12:04:44'),(149,11,'EF2C64E688E561F7127C389F2C6C3CDA',26,'VIEW','2025-11-21 12:04:44','2025-11-21 12:04:44'),(150,11,'452D386D3F74C0ADF1D0CE7FA8EE6573',26,'VIEW','2025-11-21 12:04:44','2025-11-21 12:04:44'),(151,11,'9D69C26A93EF67311B8230DB5BB234FF',26,'VIEW','2025-11-21 12:04:45','2025-11-21 12:04:45'),(152,11,'BC2EB64B14E9E905B47911217D50A323',26,'VIEW','2025-11-21 12:04:45','2025-11-21 12:04:45'),(153,11,'CD025DDA0A6FB5B91E64E29756412FF2',26,'VIEW','2025-11-21 12:04:46','2025-11-21 12:04:46'),(154,11,'3E4F47AAE2E7FB9C9CC1142E035187DD',26,'VIEW','2025-11-21 12:04:46','2025-11-21 12:04:46'),(155,11,'BCE5F3F2FD9109BB599751ADF871FAD8',26,'VIEW','2025-11-21 12:04:46','2025-11-21 12:04:46'),(156,11,'17F22F75A80195579B374B51E982FCDA',26,'VIEW','2025-11-21 12:04:46','2025-11-21 12:04:46'),(157,8,'3587B8E45B59ED50A8F6332644D19CD0',1,'VIEW','2025-11-21 12:05:46','2025-11-21 12:05:46'),(158,8,'14DBDC0C1D9EE6B233C0924779CC16F7',1,'VIEW','2025-11-21 12:05:46','2025-11-21 12:05:46'),(159,8,'59151BEF8AACAAC0B65D07A40A9A92C5',2,'VIEW','2025-11-21 12:08:27','2025-11-21 12:08:27'),(160,8,'B6D96ACCCD68E563598D88A4A2FDA481',2,'VIEW','2025-11-21 12:08:27','2025-11-21 12:08:27'),(161,8,'A9D99FA21ECA19C20C0AFF528C6DFE0E',1,'VIEW','2025-11-21 12:09:28','2025-11-21 12:09:28'),(162,8,'846B89523B85D0A49D96FA9F0E292EAB',1,'VIEW','2025-11-21 12:09:28','2025-11-21 12:09:28'),(163,11,'AE64778B1133EE5AF7BCE39D4F75847D',26,'VIEW','2025-11-21 12:11:18','2025-11-21 12:11:18'),(164,11,'B5605A3D4E7F69680427DBEC48F71610',26,'VIEW','2025-11-21 12:11:18','2025-11-21 12:11:18'),(165,8,'D5C9BAEEB439ED17568E6AD05E7BF914',1,'VIEW','2025-11-21 12:11:45','2025-11-21 12:11:45'),(166,8,'5CE2128774C2C7166D6C39A94BC1C1F1',1,'VIEW','2025-11-21 12:11:45','2025-11-21 12:11:45'),(167,8,'76E7935EEDF531F3FEEAD4A68DBBBA5E',1,'VIEW','2025-11-21 12:12:40','2025-11-21 12:12:40'),(168,8,'F0A81B193184182EEEA7C2643A83F306',1,'VIEW','2025-11-21 12:12:40','2025-11-21 12:12:40'),(169,8,'AF4D5D5D134AC1290811597AB6171079',1,'VIEW','2025-11-21 12:12:45','2025-11-21 12:12:45'),(170,8,'B56CF7BAFF9BB07CF855B86DCFF6956E',1,'VIEW','2025-11-21 12:12:45','2025-11-21 12:12:45'),(171,8,'64339ED8530C2A82A3C1C6DDDDC559EC',1,'VIEW','2025-11-21 12:12:48','2025-11-21 12:12:48'),(172,8,'807047B15CC55859252AEF9B9C7B8A76',1,'VIEW','2025-11-21 12:12:48','2025-11-21 12:12:48'),(173,11,'D359F676379FF4C1ACAA89F90F746209',27,'VIEW','2025-11-21 12:15:09','2025-11-21 12:15:09'),(174,11,'8A19687BBAB6587996F3CD829045E765',27,'VIEW','2025-11-21 12:15:09','2025-11-21 12:15:09'),(175,11,'7B4DE04DC98A586F579E5D36A0341885',1,'VIEW','2025-11-21 12:15:21','2025-11-21 12:15:21'),(176,8,'1A3B084DCD12F79C9B34E19464E73AEA',1,'VIEW','2025-11-21 12:15:41','2025-11-21 12:15:41'),(177,8,'2F683801983CAEC9C68DFF787332D79E',1,'VIEW','2025-11-21 12:15:41','2025-11-21 12:15:41'),(178,8,'3F51E3E9BF07B34B8191980A785C34BC',1,'VIEW','2025-11-21 12:15:56','2025-11-21 12:15:56'),(179,8,'86CC924E50F370C50B543316ECBD8FDD',1,'VIEW','2025-11-21 12:15:56','2025-11-21 12:15:56'),(180,8,'4ABA9147C931EAABAFDCADFE69A4B312',3,'VIEW','2025-11-21 12:17:28','2025-11-21 12:17:28'),(181,8,'D7CC30A9C32750D41B11A0F7AD984DD6',3,'VIEW','2025-11-21 12:17:28','2025-11-21 12:17:28'),(182,11,'3030ED6630DEF95ECD8F04A68B1BC958',3,'VIEW','2025-11-21 12:17:42','2025-11-21 12:17:42'),(183,11,'81C1A63941846787292E08E3F4635214',3,'VIEW','2025-11-21 12:17:42','2025-11-21 12:17:42'),(184,8,'EB26897C246B514086F8836B58ABB649',4,'VIEW','2025-11-21 12:20:11','2025-11-21 12:20:11'),(185,8,'FDE2756752858E1BF5C278BC7DF04060',4,'VIEW','2025-11-21 12:20:11','2025-11-21 12:20:11'),(186,11,'61914ADC3A83FFF1E75873D08B333816',3,'VIEW','2025-11-21 12:20:18','2025-11-21 12:20:18'),(187,11,'810D267ED1C4861E313F992156B3697F',3,'VIEW','2025-11-21 12:20:18','2025-11-21 12:20:18'),(188,8,'248480F65FCFAB81B99C4BC0BC99B125',5,'VIEW','2025-11-21 12:22:24','2025-11-21 12:22:24'),(189,8,'632608DB68ADF4742FB5E0F8338E886F',5,'VIEW','2025-11-21 12:22:24','2025-11-21 12:22:24'),(190,11,'D6798BF195196E9F7F6C3036CF02408F',5,'VIEW','2025-11-21 12:22:49','2025-11-21 12:22:49'),(191,11,'B335DEE6D48D586799667D34D8A0EB07',5,'VIEW','2025-11-21 12:22:49','2025-11-21 12:22:49'),(192,8,'36C9CC1669E5E20FAC3A44CA6FD94F17',6,'VIEW','2025-11-21 12:26:11','2025-11-21 12:26:11'),(193,8,'0CCB347F762D946589B3AE9B542EA65E',6,'VIEW','2025-11-21 12:26:11','2025-11-21 12:26:11'),(194,8,'CD32F111AF3DA1F415C5A462A4DBCF34',7,'VIEW','2025-11-21 12:26:46','2025-11-21 12:26:46'),(195,8,'F413CF92C7A941654DA59F69D918A3A3',7,'VIEW','2025-11-21 12:26:46','2025-11-21 12:26:46'),(196,8,'B8648944C9A1F1E13DDA167C4983DA00',7,'VIEW','2025-11-21 12:27:55','2025-11-21 12:27:55'),(197,8,'6E34D7D9BC631B34AE4901045F28B61A',7,'VIEW','2025-11-21 12:27:55','2025-11-21 12:27:55'),(198,11,'CB0F6F411852318AD6AC9CE590653F06',26,'VIEW','2025-11-21 12:32:45','2025-11-21 12:32:45'),(199,11,'A455093410A7C5F80D59ED14E2CCA513',26,'VIEW','2025-11-21 12:32:45','2025-11-21 12:32:45'),(200,11,'A73455930AE14D08FC54289941B6D594',26,'VIEW','2025-11-21 12:32:48','2025-11-21 12:32:48'),(201,11,'0177A7F4862F19D42D8F0AB6A5F51B6E',26,'VIEW','2025-11-21 12:32:48','2025-11-21 12:32:48'),(202,11,'D4F90C84DB7C6762A92A016054B8291A',19,'VIEW','2025-11-21 12:42:25','2025-11-21 12:42:25'),(203,11,'D35DD38923602C33F3B679D3D6DE4C96',19,'VIEW','2025-11-21 12:42:25','2025-11-21 12:42:25'),(204,11,'BB7DC02DC4FF93C0D0643FCED4A58C72',19,'VIEW','2025-11-21 12:43:01','2025-11-21 12:43:01'),(205,11,'62E6E245C56BF35306509C4CFDE599C8',19,'VIEW','2025-11-21 12:43:01','2025-11-21 12:43:01'),(206,8,'340A862CC0FDC6AAFF4FF1B5B6A3877C',10,'VIEW','2025-11-21 18:42:25','2025-11-21 18:42:25'),(207,8,'B772FC8D617F5EFB21CF01905534899F',10,'VIEW','2025-11-21 18:42:25','2025-11-21 18:42:25'),(208,9,'522998466C3D526FA548DD38D2FA4C65',2,'VIEW','2025-11-21 19:01:01','2025-11-21 19:01:01'),(209,9,'079901A923476F1D84FFB19ACA2B3D2D',2,'VIEW','2025-11-21 19:01:01','2025-11-21 19:01:01'),(210,9,'98372309AD84972B76470679367464F7',26,'VIEW','2025-11-21 19:26:54','2025-11-21 19:26:54'),(211,9,'7D370215CACB28A017628EE221E2B600',26,'VIEW','2025-11-21 19:26:54','2025-11-21 19:26:54'),(212,8,'2F33715621B4ED2C9FE7FA97CF4EE2F5',1,'VIEW','2025-11-21 20:37:19','2025-11-21 20:37:19'),(213,8,'B98AB4B21314E0B7C0C5A3B193824D6A',1,'VIEW','2025-11-21 20:37:19','2025-11-21 20:37:19'),(214,9,'AFBF1905FEEBBF5064E7AF01EDD4D2B7',27,'VIEW','2025-11-21 20:41:28','2025-11-21 20:41:28'),(215,9,'0DA72C73912E40683DF4B6962644C76C',27,'VIEW','2025-11-21 20:41:28','2025-11-21 20:41:28'),(216,9,'CCF03E50101CA7F0B49B007767496B6F',27,'VIEW','2025-11-21 20:43:16','2025-11-21 20:43:16'),(217,9,'3F7D7520D0B03D056F3BAEA1A5D5A4ED',27,'VIEW','2025-11-21 20:43:16','2025-11-21 20:43:16'),(218,8,'0FABAA6A2554A7002E094B4D0704CB66',1,'VIEW','2025-11-21 20:45:02','2025-11-21 20:45:02'),(219,8,'FDDF32CB46363C15FEC7681244792A09',1,'VIEW','2025-11-21 20:45:02','2025-11-21 20:45:02'),(220,9,'A240B301218B262FED6EECCB3D345CAD',24,'VIEW','2025-12-04 11:14:40','2025-12-04 11:14:40'),(221,9,'89B2F3408AA361A2CEAF5EA19CD4A7CB',24,'VIEW','2025-12-04 11:14:40','2025-12-04 11:14:40'),(222,9,'B85354D48DD4A821041E49F3CEC1B529',24,'VIEW','2025-12-04 11:14:42','2025-12-04 11:14:42'),(223,9,'01ED5B42F90FA89C8AB07FABE7F3A22B',24,'VIEW','2025-12-04 11:14:42','2025-12-04 11:14:42'),(224,9,'FB841750BD38B60B0A3FCF05C367D9F0',27,'VIEW','2025-12-04 11:14:47','2025-12-04 11:14:47'),(225,9,'75DED9788AE6B0DBAB9B8C271F8F8040',27,'VIEW','2025-12-04 11:14:47','2025-12-04 11:14:47'),(226,9,'0F8F48CC96C9623F4BBB13D64784AF3C',27,'VIEW','2025-12-04 11:14:55','2025-12-04 11:14:55'),(227,9,'06F9C95801AC3EE8DD1BB41B49A4E6F4',27,'VIEW','2025-12-04 11:14:55','2025-12-04 11:14:55'),(228,9,'80D8CE694EB1E8B6A063BAE63014DCAC',27,'VIEW','2025-12-04 11:15:21','2025-12-04 11:15:21'),(229,9,'F381C7D43F705CDD00A8AE05C659064B',27,'VIEW','2025-12-04 11:15:21','2025-12-04 11:15:21'),(230,9,'3E2BDF06FBCB48AD20ADCB72FA7D10D5',26,'VIEW','2025-12-04 11:29:48','2025-12-04 11:29:48'),(231,9,'D1335D9B8CB77600168756AADD885E9B',26,'VIEW','2025-12-04 11:29:48','2025-12-04 11:29:48'),(232,9,'3C78AF852E857496853740E7DF0F76DC',27,'VIEW','2025-12-10 10:23:22','2025-12-10 10:23:22'),(233,9,'8FCAA16010D9509ACCBD5F170033A89B',27,'VIEW','2025-12-10 10:23:22','2025-12-10 10:23:22'),(234,9,'40BD3DD2A98ED7E540B366609211B09B',27,'VIEW','2025-12-10 10:25:48','2025-12-10 10:25:48'),(235,9,'C5FB9DD8888C8F6099BA1731A9A8645A',27,'VIEW','2025-12-10 10:25:48','2025-12-10 10:25:48'),(236,8,'167E704C64B22BD9FA17A40CF651C9BA',27,'VIEW','2025-12-10 10:33:11','2025-12-10 10:33:11'),(237,8,'0C73316D765601DDDDFF70137FE43CD0',27,'VIEW','2025-12-10 10:33:11','2025-12-10 10:33:11'),(238,9,'7781BC023458D52349720D2AC9BAFED8',27,'VIEW','2025-12-10 10:33:37','2025-12-10 10:33:37'),(239,9,'A75DC32ACE02FF8BF6F4A900D70C3A2E',27,'VIEW','2025-12-10 10:33:37','2025-12-10 10:33:37'),(240,9,'74F28AEBC05DF24CDAF9A11333648686',27,'VIEW','2025-12-10 11:05:30','2025-12-10 11:05:30'),(241,9,'C91C8BB0579A3C3C6775F11502E46980',27,'VIEW','2025-12-10 11:33:04','2025-12-10 11:33:04'),(242,9,'971851010C07125FBD710D7EDEE2FADC',27,'VIEW','2025-12-10 11:33:04','2025-12-10 11:33:04'),(243,9,'327B922BEECBFDD2B779E6500A68B385',27,'VIEW','2025-12-10 11:47:53','2025-12-10 11:47:53'),(244,9,'0BABA7E065EA503D0B50D8B1386AFA92',27,'VIEW','2025-12-10 11:47:53','2025-12-10 11:47:53'),(245,9,'D1811EF4A49B04CCE838616F67A2943F',27,'VIEW','2025-12-10 11:48:20','2025-12-10 11:48:20'),(246,9,'CEE6AD1E098A47C60899DD5437870A9B',27,'VIEW','2025-12-10 11:48:20','2025-12-10 11:48:20'),(247,9,'2BC16A157D4775C060AB9157988B2C28',27,'VIEW','2025-12-10 21:28:42','2025-12-10 21:28:42'),(248,9,'97B04A36D0C82D257F6CC9D902E50242',27,'VIEW','2025-12-10 21:28:42','2025-12-10 21:28:42'),(249,9,'998B9EF8284ADB7260EEC8CD61688472',5,'VIEW','2025-12-10 22:11:07','2025-12-10 22:11:07'),(250,9,'976E8E2561E1C146110BC39268880D26',5,'VIEW','2025-12-10 22:11:07','2025-12-10 22:11:07'),(251,9,'D5BB2B7317191EC56AE3BCDBF2F5AADA',18,'VIEW','2025-12-10 22:11:18','2025-12-10 22:11:18'),(252,9,'6789B2341ACABDDAC33DF8D90F1F5A93',18,'VIEW','2025-12-10 22:11:18','2025-12-10 22:11:18'),(253,9,'5697B15FAAC06D61F02FC8C038822248',27,'VIEW','2025-12-11 02:39:26','2025-12-11 02:39:26'),(254,9,'1EFEAF38F68DD72B3757494EC0DEB792',27,'VIEW','2025-12-11 02:39:26','2025-12-11 02:39:26'),(255,9,'D73762685791F10053D349036861D9DD',27,'VIEW','2025-12-11 02:41:34','2025-12-11 02:41:34'),(256,9,'38ADF3920B0B612203C87912EE23B792',27,'VIEW','2025-12-11 02:41:34','2025-12-11 02:41:34'),(257,9,'9340DE2F4F0AFCC4A96F84E41BE5E3A6',5,'VIEW','2025-12-11 02:41:38','2025-12-11 02:41:38'),(258,9,'A52010E6E111B947F1BEC205E260E58D',27,'VIEW','2025-12-11 03:01:09','2025-12-11 03:01:09'),(259,9,'4981C9AC512B44DF8578585A0F3ED65E',27,'VIEW','2025-12-11 03:01:09','2025-12-11 03:01:09'),(260,9,'0E4AC46D1530311FB1BC3A8F308F53E2',27,'VIEW','2025-12-11 03:06:37','2025-12-11 03:06:37'),(261,9,'9BD8C20A1F54D7F3FB2DCF5DFC381F6C',27,'VIEW','2025-12-11 03:06:37','2025-12-11 03:06:37'),(262,9,'BCF70BB9B8F769D0532FD8FB5CFD329A',26,'VIEW','2025-12-11 04:56:12','2025-12-11 04:56:12'),(263,9,'8305939B8A7985513DE26FA7651DB237',26,'VIEW','2025-12-11 04:56:12','2025-12-11 04:56:12'),(264,9,'9E6CB0B35E6616412B79ACBC3F24A812',27,'VIEW','2025-12-11 04:56:21','2025-12-11 04:56:21'),(265,9,'1942EE287C90B04C9E7863D398F00B4F',27,'VIEW','2025-12-11 04:56:21','2025-12-11 04:56:21'),(266,9,'890012DB4DA1D8A1307D78006AE0171A',26,'VIEW','2025-12-11 04:58:20','2025-12-11 04:58:20'),(267,9,'890CBFB871FF204957062911BAD1F390',26,'VIEW','2025-12-11 04:58:20','2025-12-11 04:58:20'),(268,9,'F91526CCF2846E19635F29D772ABFDF8',21,'VIEW','2025-12-11 05:08:01','2025-12-11 05:08:01'),(269,9,'FA03B9B1FDC78B25A2754A0EC27B3209',21,'VIEW','2025-12-11 05:08:01','2025-12-11 05:08:01'),(270,9,'BFF2451D9763337B8A020B8C240EF287',20,'VIEW','2025-12-11 05:14:22','2025-12-11 05:14:22'),(271,9,'94E9111CD56400E3071172DD9584DFC2',20,'VIEW','2025-12-11 05:14:22','2025-12-11 05:14:22'),(272,9,'2B4CD865DAC0D1EA83659426927710F6',19,'VIEW','2025-12-11 05:15:27','2025-12-11 05:15:27'),(273,9,'70260421343CF37931CD90AFD6B55E16',19,'VIEW','2025-12-11 05:15:27','2025-12-11 05:15:27'),(274,9,'EE1B61F95209B3B94DF8F3A3E3C110EC',18,'VIEW','2025-12-11 05:54:12','2025-12-11 05:54:12'),(275,9,'CE3F79E14107198E41F003DED73F1408',18,'VIEW','2025-12-11 05:54:12','2025-12-11 05:54:12'),(276,9,'CBF389BF9876D5F731EC325ADF3FF460',26,'VIEW','2025-12-11 08:41:36','2025-12-11 08:41:36'),(277,9,'0B3B7B13BD4679C257D483AAB98356E5',26,'VIEW','2025-12-11 08:41:36','2025-12-11 08:41:36'),(278,9,'DD228955520B23213D0190E6BD791283',26,'VIEW','2025-12-11 08:51:18','2025-12-11 08:51:18'),(279,9,'4D2ECDF8DBE8CC1E0E6CD3FD99AA854C',26,'VIEW','2025-12-11 08:51:18','2025-12-11 08:51:18'),(280,9,'F37A372859E8D7ACF3361EBE840E1EAF',27,'VIEW','2025-12-11 09:56:58','2025-12-11 09:56:58'),(281,9,'2463E37C9BED62ED97999393B3983851',27,'VIEW','2025-12-11 09:56:58','2025-12-11 09:56:58'),(282,9,'4EA97B116415E0247EEF37D6F1347534',18,'VIEW','2025-12-11 17:47:12','2025-12-11 17:47:12'),(283,9,'9CDD7122F16F5A0AD40DF6841C815603',18,'VIEW','2025-12-11 17:47:12','2025-12-11 17:47:12'),(284,9,'313B04FCB16DEF3DB15A5008C83EAB4A',22,'VIEW','2025-12-11 21:32:53','2025-12-11 21:32:53'),(285,9,'AECB4B504BDCBD1DE3C4FE2D02CDD099',22,'VIEW','2025-12-11 21:32:53','2025-12-11 21:32:53'),(286,9,'DDD67EF0B014122261007F027206AF5A',27,'VIEW','2025-12-11 21:32:56','2025-12-11 21:32:56'),(287,9,'0948DD425EAED47FB736F0ABAEDF6666',27,'VIEW','2025-12-11 21:32:56','2025-12-11 21:32:56'),(288,9,'2F209B82796DEC172635A759CAAFCD92',26,'VIEW','2025-12-11 21:48:33','2025-12-11 21:48:33'),(289,9,'217886F73148E8302559EC597ECEED68',26,'VIEW','2025-12-11 21:48:33','2025-12-11 21:48:33'),(290,9,'DC159300077ACEA420CA90C83593767E',21,'VIEW','2025-12-12 05:34:55','2025-12-12 05:34:55'),(291,9,'19E5BEC6FB227DD8061E8D916B9CAE3D',21,'VIEW','2025-12-12 05:34:55','2025-12-12 05:34:55'),(292,9,'68D4D4C01A76367182DBD85F6E4EEB51',14,'VIEW','2025-12-12 05:37:02','2025-12-12 05:37:02'),(293,9,'0F38F57DE5B816F9AAAF2642050EB287',14,'VIEW','2025-12-12 05:37:02','2025-12-12 05:37:02'),(294,9,'32F0AB5E5C599A63C8F645A77B7577E5',26,'VIEW','2025-12-12 09:07:29','2025-12-12 09:07:29'),(295,9,'991609575E766521E431F6333A5C7EA5',26,'VIEW','2025-12-12 09:07:29','2025-12-12 09:07:29'),(296,8,'1E56DBD9A4B7DE470FBB5499C3BD2A81',1,'VIEW','2025-12-12 09:08:26','2025-12-12 09:08:26'),(297,8,'91B60B64CF4950280857889D56956E0B',1,'VIEW','2025-12-12 09:08:26','2025-12-12 09:08:26'),(298,8,'DC2EA71E863A52C5E73CACC90C2D52DD',4,'VIEW','2025-12-12 09:08:33','2025-12-12 09:08:33'),(299,8,'1903C3A0CBE1BFF7F8CD6A6944E3F6C9',4,'VIEW','2025-12-12 09:08:33','2025-12-12 09:08:33'),(300,8,'C012716314E4826CB468253B75B773DF',27,'VIEW','2025-12-12 09:08:50','2025-12-12 09:08:50'),(301,8,'0F76EFE58C4F3C18D1570B65BEAB5EC8',27,'VIEW','2025-12-12 09:08:50','2025-12-12 09:08:50'),(302,9,'4EC3C5D8693611827ECFAC87815319DC',21,'VIEW','2025-12-12 11:05:39','2025-12-12 11:05:39'),(303,9,'D922FC15EAB50010C59CBA652AF6B3ED',21,'VIEW','2025-12-12 11:05:39','2025-12-12 11:05:39'),(304,8,'02371048AC7FFC948D4947E6B6280A00',4,'VIEW','2025-12-12 11:52:33','2025-12-12 11:52:33'),(305,8,'5A6A262CF3B1F3BC568F140074160A4C',4,'VIEW','2025-12-12 11:52:33','2025-12-12 11:52:33'),(306,26,'C7007BECFF5D367BF116D062924A018F',28,'VIEW','2025-12-12 19:35:02','2025-12-12 19:35:02'),(307,26,'DAE55008EF8A271BCBCD1CBE40F0BE4A',28,'VIEW','2025-12-12 19:35:02','2025-12-12 19:35:02'),(308,26,'CE22E27C4578C1AD85C5E49134F27344',28,'VIEW','2025-12-12 19:36:27','2025-12-12 19:36:27'),(309,26,'619E80F47871F3F284E59D00F0E3317D',28,'VIEW','2025-12-12 19:36:28','2025-12-12 19:36:28'),(310,8,'79A1409F8F029F35181AFF3ADAE61E06',1,'VIEW','2025-12-12 20:18:31','2025-12-12 20:18:31'),(311,8,'98F35FB31372BA6A11D266894F6EDEE6',1,'VIEW','2025-12-12 20:18:31','2025-12-12 20:18:31'),(312,8,'3AAD21A6C7D6443B9A331AFDE7279C98',1,'VIEW','2025-12-12 20:18:40','2025-12-12 20:18:40'),(313,8,'6A67EF00A07C9BDA556D0620091DFF9C',1,'VIEW','2025-12-12 20:18:40','2025-12-12 20:18:40'),(314,8,'6BAB9C4A9ADDD714254485BE3B8DD502',1,'VIEW','2025-12-12 20:20:04','2025-12-12 20:20:04'),(315,8,'85AA1B2208AC585D42711E542B937C1A',1,'VIEW','2025-12-12 20:20:04','2025-12-12 20:20:04'),(316,8,'FA44E08A372E9E5C858AD3735855421B',27,'VIEW','2025-12-12 20:21:02','2025-12-12 20:21:02'),(317,8,'4F3E2B4305A676BEA04166DDA682399E',27,'VIEW','2025-12-12 20:21:02','2025-12-12 20:21:02'),(318,8,'9C025A2E58FD2F31B53E8FE7C0E2ED57',27,'VIEW','2025-12-12 20:21:14','2025-12-12 20:21:14'),(319,8,'EAA7E98870B13D0C923FEA7C45749B8D',27,'VIEW','2025-12-12 20:21:14','2025-12-12 20:21:14'),(320,8,'CD70C327B5EB3B83A0BDF290CC1F2F9C',1,'VIEW','2025-12-12 20:23:45','2025-12-12 20:23:45'),(321,8,'6E13510EEA76852DFC34F467DF69ABAC',1,'VIEW','2025-12-12 20:23:45','2025-12-12 20:23:45'),(322,8,'33CF77A7AD448DDF16C4D1BF9FEAEC1C',27,'VIEW','2025-12-12 20:23:52','2025-12-12 20:23:52'),(323,8,'8F3F9584B4F770561A89C4C37D22B419',27,'VIEW','2025-12-12 20:23:52','2025-12-12 20:23:52'),(324,8,'3E655BAEDE2C8ED06CB528706B4D9332',27,'VIEW','2025-12-12 20:24:01','2025-12-12 20:24:01'),(325,8,'B90443612121C0B0A239A391FE277C98',27,'VIEW','2025-12-12 20:24:02','2025-12-12 20:24:02'),(326,26,'6EE3EE89611C55A1F400BC4D210A1069',28,'VIEW','2025-12-12 20:36:36','2025-12-12 20:36:36'),(327,26,'D14E1BEDEA283C0FAADC9B133CD5BB2B',28,'VIEW','2025-12-12 20:36:36','2025-12-12 20:36:36'),(328,26,'7E2430CD41AB51EDEBDF34D289245B4B',11,'VIEW','2025-12-12 20:36:50','2025-12-12 20:36:50'),(329,26,'38406F8F65E67D47A955BBA354BF08B7',11,'VIEW','2025-12-12 20:36:50','2025-12-12 20:36:50'),(330,9,'B6144E3D61172E82E8EF5A111159300E',28,'VIEW','2025-12-12 21:12:30','2025-12-12 21:12:30'),(331,9,'0AF8A78C89DFB6BABD10321B21D2FBB1',28,'VIEW','2025-12-12 21:12:30','2025-12-12 21:12:30'),(332,9,'0A5C13BCA53F012AB26038D267FF9711',21,'VIEW','2025-12-12 21:13:06','2025-12-12 21:13:06'),(333,9,'1953D4DBDCD9BB9B9E95ADD42D2D55A0',21,'VIEW','2025-12-12 21:13:06','2025-12-12 21:13:06'),(334,9,'8E0D6932C52DB22F2F413E7F063CACB9',19,'VIEW','2025-12-13 00:16:26','2025-12-13 00:16:26'),(335,9,'836263DE8F6AAE19CD969C2F5212BE5E',19,'VIEW','2025-12-13 00:16:26','2025-12-13 00:16:26'),(336,8,'F812530F3DFA8D866AF9739BFFC4F882',1,'VIEW','2025-12-13 00:21:50','2025-12-13 00:21:50'),(337,8,'704C49D3D534AA77472177E2042975A0',1,'VIEW','2025-12-13 00:21:50','2025-12-13 00:21:50'),(338,8,'DE36D8F204AEA00E6D1BF1D9FCE8AF98',27,'VIEW','2025-12-13 00:22:09','2025-12-13 00:22:09'),(339,8,'59B01C83C9AB64A03CE6BA7AC9B3856B',27,'VIEW','2025-12-13 00:22:09','2025-12-13 00:22:09'),(340,9,'81331C5611F36C7676CF744ECC7323C5',21,'VIEW','2025-12-13 00:34:05','2025-12-13 00:34:05'),(341,9,'A90F3286D9CF851260F5E338C83C95AD',21,'VIEW','2025-12-13 00:34:05','2025-12-13 00:34:05'),(342,8,'ACA4DF24B9CDFF252D38F13DA063743D',21,'VIEW','2025-12-13 00:35:00','2025-12-13 00:35:00'),(343,8,'B97C0143CBCDF72FD03451C0B915961B',21,'VIEW','2025-12-13 00:35:00','2025-12-13 00:35:00'),(344,8,'C56E1A9F17C8E85841AFB32F528C0A96',21,'VIEW','2025-12-13 00:35:23','2025-12-13 00:35:23'),(345,8,'8F75B2A020E448DF6747347AEC7897C2',21,'VIEW','2025-12-13 00:35:23','2025-12-13 00:35:23'),(346,9,'05D4E23BAC10D3A6E493EB84ACA04256',21,'VIEW','2025-12-13 00:35:29','2025-12-13 00:35:29'),(347,9,'7532A2AD523E48A059AE63C53E443579',21,'VIEW','2025-12-13 00:35:29','2025-12-13 00:35:29'),(348,9,'0F905C0C8DA667F836563A008137AD82',19,'VIEW','2025-12-13 00:45:24','2025-12-13 00:45:24'),(349,9,'CDFE9E8E07B064456CE174048E5BAA0D',19,'VIEW','2025-12-13 00:45:24','2025-12-13 00:45:24'),(350,8,'CEA93EE20709EE2FA286E723B1B73A92',21,'VIEW','2025-12-13 00:46:05','2025-12-13 00:46:05'),(351,8,'82A7E5EE3E921D7AE1DD9A745D29EA4E',21,'VIEW','2025-12-13 00:46:05','2025-12-13 00:46:05'),(352,8,'1ACEE9A3D5865DA4C9C4E3454EAB9AD0',19,'VIEW','2025-12-13 00:46:20','2025-12-13 00:46:20'),(353,8,'EDA4323795EFDC66F8BA46BB1DD24428',19,'VIEW','2025-12-13 00:46:20','2025-12-13 00:46:20'),(354,9,'AEDA763FA1BB9E5F95881A4D9DDE74C9',19,'VIEW','2025-12-13 01:03:07','2025-12-13 01:03:07'),(355,9,'182115E407184FA7894228652A387EB2',19,'VIEW','2025-12-13 01:03:07','2025-12-13 01:03:07'),(356,8,'DE4F37F0168CE90A29C3C1E34B41FC24',29,'VIEW','2025-12-15 23:36:31','2025-12-15 23:36:31'),(357,8,'783DC730DC53E4DD37F39624AB907D13',29,'VIEW','2025-12-15 23:36:31','2025-12-15 23:36:31'),(358,8,'24AC10470DD8DF69C9C07001A534D1FB',29,'VIEW','2025-12-15 23:38:03','2025-12-15 23:38:03'),(359,8,'F1AB997C28A2F37E2E35B2C58038D723',29,'VIEW','2025-12-15 23:38:03','2025-12-15 23:38:03'),(360,8,'0BC6E879C8943E528F564ADCD9851AAC',29,'VIEW','2025-12-15 23:41:28','2025-12-15 23:41:28'),(361,8,'0AAC883DB84B39FAF04CD45E4CA17A44',29,'VIEW','2025-12-15 23:41:28','2025-12-15 23:41:28'),(362,8,'6BB714721F14677B60CE86A6311DCF81',29,'VIEW','2025-12-16 00:39:11','2025-12-16 00:39:11'),(363,8,'CA298FB3D273CAB7645C78AABD7EDABC',29,'VIEW','2025-12-16 00:39:11','2025-12-16 00:39:11'),(364,8,'F530D30E4EA701F82C952463BDD5B652',29,'VIEW','2025-12-16 00:40:36','2025-12-16 00:40:36'),(365,8,'64D8631E21C054BED0C6ACBA1C6AD1E2',29,'VIEW','2025-12-16 00:40:36','2025-12-16 00:40:36'),(366,8,'920431207F2D5628260A31BE187EFE1F',29,'VIEW','2025-12-16 00:48:40','2025-12-16 00:48:40'),(367,8,'07C96C0D98A1E3BBBA58711BA6FCE170',29,'VIEW','2025-12-16 00:48:40','2025-12-16 00:48:40'),(368,9,'794A3EBEC0C3645D113DA8C108D4A1AB',29,'VIEW','2025-12-16 01:27:32','2025-12-16 01:27:32'),(369,9,'18CA05A83EF99C75BFBBF28515732E27',29,'VIEW','2025-12-16 01:27:32','2025-12-16 01:27:32'),(370,9,'BDEAB197374E087207FF717F3CC418D0',21,'VIEW','2025-12-16 02:39:45','2025-12-16 02:39:45'),(371,9,'8F8606A3E7595883CF9FFC2A78CD5A0C',21,'VIEW','2025-12-16 02:39:45','2025-12-16 02:39:45'),(372,9,'A81AC134B854323F908962EEA7CDA053',27,'VIEW','2025-12-16 02:39:53','2025-12-16 02:39:53'),(373,9,'8647259926D04305CBBC92B5F0EF9CAB',27,'VIEW','2025-12-16 02:39:53','2025-12-16 02:39:53'),(374,9,'A28648AF2802EEF91F34F1BD8E8E208C',17,'VIEW','2025-12-16 09:58:15','2025-12-16 09:58:15'),(375,9,'55A6F2CA17A8CC5A6B0D6C3130B816A5',17,'VIEW','2025-12-16 09:58:15','2025-12-16 09:58:15'),(376,9,'00D2B87463BFB739B507CEA763D34438',11,'VIEW','2025-12-17 02:07:34','2025-12-17 02:07:34'),(377,9,'DA10E69F4FD40A1A37383A2D35D524AD',11,'VIEW','2025-12-17 02:07:34','2025-12-17 02:07:34'),(378,9,'B81F8A23BD22222C6A42EECD316D3CBB',11,'VIEW','2025-12-17 02:08:13','2025-12-17 02:08:13'),(379,9,'B3BB6EEEE38A329023C313765EE150D7',11,'VIEW','2025-12-17 02:08:13','2025-12-17 02:08:13'),(380,9,'2CAB257C4D48D89DF48DFC229BD5BD7C',15,'VIEW','2025-12-17 02:32:47','2025-12-17 02:32:47'),(381,9,'0AB4B61B00CD896733D929A2A0F39353',15,'VIEW','2025-12-17 02:32:47','2025-12-17 02:32:47'),(382,9,'22D1641A8116639E786767409A633202',28,'VIEW','2025-12-17 03:15:23','2025-12-17 03:15:23'),(383,9,'756A97533BF9D24B4E0FEE8F1C371726',28,'VIEW','2025-12-17 03:15:23','2025-12-17 03:15:23'),(384,9,'D739F8BF32B58191A29BFB978165BF16',28,'VIEW','2025-12-17 05:16:06','2025-12-17 05:16:06'),(385,9,'A3E84F4F7CEF0B987FAFB56817924C9C',28,'VIEW','2025-12-17 05:16:06','2025-12-17 05:16:06'),(386,9,'1C8EBB7F038DF060F15A196AE35E36AA',29,'VIEW','2025-12-17 05:16:25','2025-12-17 05:16:25'),(387,9,'457C71BE373DB1F4218E0BFBAA1B26D9',29,'VIEW','2025-12-17 05:16:25','2025-12-17 05:16:25'),(388,9,'EDE3C52B92E7D193204F7EDF2979122E',28,'VIEW','2025-12-17 05:16:37','2025-12-17 05:16:37'),(389,9,'A3F32D90DCB534C243F4F79FD294AAB8',28,'VIEW','2025-12-17 05:16:37','2025-12-17 05:16:37'),(390,9,'1BAB150F173B0E6D56E78C20ED20077D',29,'VIEW','2025-12-17 05:21:57','2025-12-17 05:21:57'),(391,9,'82EAD6B5F422B79055A0F21CF8A17F63',29,'VIEW','2025-12-17 05:21:58','2025-12-17 05:21:58'),(392,9,'EECADE9780FD656F8F156B9B91D06252',28,'VIEW','2025-12-17 05:22:07','2025-12-17 05:22:07'),(393,9,'0537CA70FD4ACB21503B5B9A1A7E29D9',28,'VIEW','2025-12-17 05:22:07','2025-12-17 05:22:07'),(394,9,'B6586CFAF9925289882986421844AFCF',29,'VIEW','2025-12-17 05:33:47','2025-12-17 05:33:47'),(395,9,'C8F5C6CE1CEBC7F6BCB587D31E5B8837',29,'VIEW','2025-12-17 05:33:47','2025-12-17 05:33:47'),(396,9,'8B2E5ECE21A8DB53B7FC2A08FD71CEB3',29,'VIEW','2025-12-17 05:51:24','2025-12-17 05:51:24'),(397,9,'389D07935B31BE62981A5FEE54D95E78',29,'VIEW','2025-12-17 05:51:24','2025-12-17 05:51:24'),(398,9,'074059A5558D138DA5806D4D480EAF98',1,'VIEW','2025-12-21 12:17:13','2025-12-21 12:17:13'),(399,9,'2B22BA1E9ABC8A0021F15E064FECD088',1,'VIEW','2025-12-21 12:17:13','2025-12-21 12:17:13'),(400,8,'876FF555472531B800423B91F097F19F',26,'VIEW','2025-12-21 12:18:09','2025-12-21 12:18:09'),(401,8,'4B38CA7D95450364A26E99979C43075A',26,'VIEW','2025-12-21 12:18:09','2025-12-21 12:18:09'),(402,8,'4C292F53DB7BD43EB38765F728DF6007',1,'VIEW','2025-12-21 12:18:15','2025-12-21 12:18:15'),(403,8,'3862D12D1C556BB21EF16E82D3FDE913',1,'VIEW','2025-12-21 12:18:15','2025-12-21 12:18:15'),(404,9,'E13958CC8290F1F3869E72E487E9DAE9',8,'VIEW','2025-12-21 22:37:54','2025-12-21 22:37:54'),(405,9,'0F733809EF623B9992577BA77E412E22',8,'VIEW','2025-12-21 22:37:54','2025-12-21 22:37:54'),(406,9,'C33F7AD4C98773567F0B725449C79861',8,'VIEW','2025-12-21 22:38:40','2025-12-21 22:38:40'),(407,9,'D869C00B7EE71526E92FAF1782F12CFA',8,'VIEW','2025-12-21 22:38:40','2025-12-21 22:38:40'),(408,9,'F292F109A36E35F63F6C20A49CEED703',17,'VIEW','2025-12-21 22:39:54','2025-12-21 22:39:54'),(409,9,'7FD8C31A877C2DEE2581D117537B3C97',17,'VIEW','2025-12-21 22:39:54','2025-12-21 22:39:54');
/*!40000 ALTER TABLE `product_view` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id_product` int NOT NULL AUTO_INCREMENT,
  `id_category` int DEFAULT NULL,
  `id_supplier` int DEFAULT NULL COMMENT 'Nhà cung cấp = Brand (Apple, Samsung...)',
  `product_name` varchar(255) NOT NULL,
  `brand` varchar(100) DEFAULT NULL COMMENT 'Thương hiệu',
  `description` text,
  `price` decimal(12,2) NOT NULL,
  `stock_quantity` int DEFAULT '0',
  `status` enum('IN_STOCK','OUT_OF_STOCK','DISCONTINUED') DEFAULT 'IN_STOCK',
  `image_url` varchar(500) DEFAULT NULL,
  `product_code` varchar(100) NOT NULL DEFAULT '' COMMENT 'Mã: IMEI/Serial/SKU/Barcode',
  `code_type` enum('IMEI','SERIAL','SKU','BARCODE') DEFAULT 'SKU',
  `sku` varchar(50) DEFAULT NULL COMMENT 'SKU: PREFIX-XXXX',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_delete` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Soft delete flag',
  PRIMARY KEY (`id_product`),
  UNIQUE KEY `uq_products_product_code` (`product_code`),
  UNIQUE KEY `sku` (`sku`),
  KEY `idx_products_category` (`id_category`),
  KEY `idx_products_supplier` (`id_supplier`),
  KEY `idx_products_brand` (`brand`),
  KEY `idx_products_code_type` (`code_type`),
  KEY `idx_products_sku` (`sku`),
  KEY `idx_products_name` (`product_name`),
  KEY `idx_products_code` (`product_code`),
  KEY `idx_products_is_delete` (`is_delete`),
  CONSTRAINT `fk_products_category` FOREIGN KEY (`id_category`) REFERENCES `categories` (`id_category`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_products_supplier` FOREIGN KEY (`id_supplier`) REFERENCES `suppliers` (`id_supplier`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `products_chk_1` CHECK ((`price` >= 0)),
  CONSTRAINT `products_chk_2` CHECK ((`stock_quantity` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,1,1,'iPhone 15 Pro','Apple','Tổng quan về iPhone 15 Pro\niPhone 15 Pro là một trong những chiếc smartphone hàng đầu của Apple. Với thiết kế vuông vức, chất liệu cao cấp toát lên dáng vẻ sang trọng và hiện đại, máy có màn hình OLED Super Retina độ phân giải cao kích thước nhỏ gọn dễ sử dụng bằng một tay.\nĐược trang bị bộ xử lý siêu mạnh và mới nhất đến từ chính Apple cung cấp, tích hợp trí thông minh nhân cap cao cấp, iPhone 15 bản Pro mang đến hiệu năng siêu mạnh. Camera chất lượng cao cho khả năng chụp ảnh và quay video tuyệt vời. Đặc biệt, máy hỗ trợ kết nối 5G, nhận diện khuôn mặt 3D Face ID nhanh chóng.\n\nCấu hình iPhone 15 Pro mới nhất\nChiếc điện thoại 15 Pro của Apple sở hữu màn hình OLED và tần số làm mới 120Hz như bản Pro Max cùng Series, người dùng sẽ được trải nghiệm hình ảnh vô cùng sắc nét và mượt mà. Độ phân giải 1179 x 2556 pixel giúp hình ảnh hiển thị rõ nét và màu sắc sống động.\nVới sức mạnh của chipset Apple A17 6 nhân CPU đi kèm với GPU có 6 lõi đồ họa, điện thoại đảm bảo hiệu suất siêu mạnh mẽ và khả năng xử lý vô cùng nhanh chóng. Camera 48MP với công nghệ OIS sẽ mang lại những bức ảnh tuyệt đẹp và sắc nét. Pin Li-Ion cung cấp thời gian sử dụng lâu dài và sạc không dây 15W giúp người dùng tiện lợi hơn trong việc sạc pin.\niPhone 15 Pro hứa hẹn mang đến trải nghiệm tuyệt vời cho người dùng với iOS 17 và màn hình đục lỗ tích hợp Dynamic Island độc đáo.',25000000.00,60,'IN_STOCK','/uploads/products/ed4f14aa-1fbf-4cd3-b989-6595fbc2eea7.png','IP15PRO-001','SKU','DT-001','2025-11-08 16:29:33','2025-12-21 12:18:42',1),(2,1,1,'iPhone 14','Apple','Giới thiệu về iPhone 14 Chính hãng\nVào 00h00p ngày 08 tháng 9 năm 2022, tại sự kiện Far Out, Apple đã chính thức công bố iPhone 14 series. Đây là dòng điện thoại được mong chờ nhất năm 2022 với những cải tiến về cả thiết kế và hiệu năng. Trong lần ra mắt này, Apple đã mang tới 4 siêu phẩm mang tên: iPhone 14, iPhone 14 Plus, iPhone 14 Pro, iPhone 14 Pro Max. Trong đó phiên bản thường iPhone 14 Chính hãng là chiếc máy được thừa hưởng khá nhiều nét đẹp và sức mạnh từ iPhone 13. iPhone 14 vẫn sở hữu thiết kế tai thỏ đẹp mắt đi kèm với con chip mạnh mẽ Apple A15 Bionic.',18000000.00,26,'IN_STOCK','/uploads/products/44b48ceb-cb7c-469a-a9d1-98844b7561c9.png','IP14-001','SKU','DT-002','2025-11-08 16:29:33','2025-12-11 09:21:12',0),(3,1,2,'Samsung Galaxy S24 Ultra','Samsung','Samsung S24 Ultra là mẫu điện thoại mới với thiết kế cao cấp sang trọng, hỗ trợ bút S Pen, tiêu chuẩn IP68, tích hợp Galaxy AI với nhiều tính hấp dẫn, hiện đại mà chưa từng có.\nMáy sở hữu màn hình kích thước lớn hiển thị xuất sắc, camera 200MP đỉnh cao nhiếp ảnh, viên pin cung cấp thời lượng vượt trội.',28000000.00,12,'IN_STOCK','/uploads/products/6bc963df-3a13-4b10-aeca-10020117e16d.png','SGS24U-001','SKU','DT-003','2025-11-08 16:29:33','2025-11-21 12:17:25',0),(4,1,2,'Samsung Galaxy A54','Samsung','Galaxy A54 sẽ có thiết kế tương tự như người tiền nhiệm, toàn bộ vỏ máy được hoàn thiện từ nhựa, mặt lưng làm nhám dạng giả kính, phần khung được sơn bóng giả kim loại tăng sự sang trọng cho thiết bị. Cả 2 đều có chuẩn kháng nước IP67 giúp người dùng yên tâm sử dụng mà không sợ bị nước, bụi xâm nhập làm hỏng máy.Mặt trước của A54 vẫn là màn hình 6,5 inch tấm nền Super AMOLED độ phân giải FHD+ như A53 nhưng độ sáng tối đa của A54 đạt được 1200 nits cho khả năng sử dụng ngoài trời tốt hơn. Chúng ta vẫn được trải nghiệm tần số quét 120Hz trên Galaxy A54.\nhình ảnh iconĐiện thoại\nhình ảnh iconMáy tính bảng\nhình ảnh iconLaptop\nhình ảnh iconTivi\nhình ảnh iconPhụ kiện\nhình ảnh iconĐồng hồ thông minh\nhình ảnh iconTai nghe\nhình ảnh iconSửa chữa\nĐiện thoại Samsung Chính hãngĐiện thoại Samsung Galaxy A54 5G (Chính hãng)     (7 đánh giá)\nsamsung-galaxy-a54-5g-tim-minh-hoa\n6.950.000 ₫9.950.000₫ Sắp vềMàu sắcBộ nhớ6-128GB8-128GB\nThời gian bảo hành: \nBH Thường 12 Tháng Chính hãng\n (Xem chi tiết)\n\nGiao hàng tận nơi miễn phí trong 30 phút (Tìm hiểu thêm)\n\nKhuyến mãi\nTặng: Miễn phí BHV lần thứ 5, khi đã mua BHV lần thứ 4.\n(Quý khách Đăng nhập để kiểm tra đơn hàng)\n- Chat online: Chat Zalo\n- Hà Nội: 097.120.6688 - Đường đi\n- Tp.HCM: 0965.123.123 - Đường đi\n- Đà Nẵng: 096.123.9797 - Đường đi\n\nCHAT TƯ VẤNĐẶT HÀNG TRƯỚC\nMUA TRẢ GÓP 0%\n(Duyệt HS 5 phút, Trả góp qua thẻ)\nSản phẩm tương tự\nsamsung-galaxy-s26-pro-ro-ri-00-1\nSamsung Galaxy S26 Pro Chính hãng\n\n26.590.000 ₫\n\nXem chi tiết\n\nsamsung-galaxy-a17-4g-xanh\nSamsung Galaxy A17 Chính hãng\n\n4.750.000 ₫\n\nXem chi tiết\n\nsamsung-galaxy-a17-5g-xanh-nany\nSamsung Galaxy A17 5G Chính hãng\n\n4.750.000 ₫\n\nXem chi tiết\n\nsamsung-galaxy-a06-5g-xanh-la\nSamsung Galaxy A06 5G Chính hãng\n\n2.150.000 ₫\n\nXem chi tiết\n\nThông số kỹ thuật\nMàn hình:	Super AMOLED, 120Hz, 1000 nits (HBM)\n6.4 inches, Full HD+ (1080 x 2340 pixels), tỷ lệ 19.5:9\nHệ điều hành:	Android 13, One UI 5.1\nCamera sau:	50 MP, f/1.8 (góc rộng), PDAF, OIS\n12 MP, f/2.2, 123˚ (góc siêu rộng)\n5 MP, f/2.4, (macro)\nQuay phim: 4K@30fps, 1080p@30/60fps, 720p@480fps\nCamera trước:	32 MP, f/2.2, 26mm (góc rộng)\nQuay phim: 4K@30fps, 1080p@30fps\nCPU:	Exynos 1380 (5 nm)\n8 nhân (4x2.4 GHz & 4x2.0 GHz)\nGPU: Mali-G69\nRAM:	6-8GB\nBộ nhớ trong:	128-256GB\nThẻ SIM:	2 SIM, NanoSIM\nDung lượng pin:	Li-Po 5000 mAh\nSạc nhanh 25W\nThiết kế:	Thanh + Cảm ứng\nXem thêm cấu hình chi tiết\nVideo đánh giá & review Samsung Galaxy A54 5G (Chính hãng)\n\nTin tức liên quan\ndinh-noc-oneplus-ace-6t-de-dang-dat-165-fps-game-delta-force-mobile-1\nĐỉnh nóc: OnePlus Ace 6T dễ dàng đạt 165 FPS game Delta Force Mobile\n\nday-la-dung-luong-pin-oneplus-ace-6t\nĐây là dung lượng pin OnePlus Ace 6T, không thể khét hơn\n\nchinh-thuc-oneplus-ace-6t-ra-mat-tuan-toi\nChính thức: OnePlus Ace 6T ra mắt tuần tới, chip Snapdragon khủng\n\nbang-xep-hang-antutu-thang-11-2025\nBảng xếp hạng AnTuTu tháng 11 2025: Top 2 mới là nhân vật chính\n\nSamsung Galaxy A54 5G - Bản kế nhiệm hoàn hảo của A53 5G\nĐiện thoại Samsung Galaxy A54 5G Chính hãng giá rẻ nhất Hà Nội, Đà Nẵng, Tp.HCM. Mua điện thoại Galaxy A54 5G pin trâu 5100 mAh, camera 50MP, hỗ trợ trả góp 0%.\n\nTháng 3 năm 2022, Samsung đã cho ra mắt Galaxy A53 5G được sự chào đón nồng nhiệt của rất nhiều người yêu công nghệ. Để nối tiếp thành công đó, Samsung Galaxy A54 5G sẽ được gã khổng lồ Hàn Quốc ra mắt để thay thế cho Galaxy A53. Dự kiến máy sẽ có nhiều cải thiện đặc biệt là về hiệu năng và pin.\n\nsamsung-galaxy-a54-5g-pin-5100-minh-hoa-1.jpg\nGalaxy A54 5G (ảnh minh họa)\nSo sánh Samsung Galaxy A54 5G với Galaxy A53 5G\nTheo thông tin đã rò rỉ, Galaxy A54 sẽ có thiết kế tương tự như người tiền nhiệm, toàn bộ vỏ máy được hoàn thiện từ nhựa, mặt lưng làm nhám dạng giả kính, phần khung được sơn bóng giả kim loại tăng sự sang trọng cho thiết bị. Cả 2 đều có chuẩn kháng nước IP67 giúp người dùng yên tâm sử dụng mà không sợ bị nước, bụi xâm nhập làm hỏng máy.\n\nsamsung-galaxy-a53-5g-nhan-ban-cap-nhat-android-13-truoc-nam-2023-2.jpg\nSamsung Galaxy A53 5G\nMặt trước của A54 vẫn là màn hình 6,5 inch tấm nền Super AMOLED độ phân giải FHD+ như A53 nhưng độ sáng tối đa của A54 đạt được 1200 nits cho khả năng sử dụng ngoài trời tốt hơn. Chúng ta vẫn được trải nghiệm tần số quét 120Hz trên Galaxy A54.\n\nTheo tin đồn thì Galaxy A54 được sở hữu con chip Exynos 1290 là thế hệ kế nhiệm của Exynos 1280 trên Galaxy A53 5G. Máy sẽ có RAM tối thiểu 6GB và tối đa 8GB thay vì tối thiểu 4GB và cao nhất cũng 8GB như trên thế hệ trước.\n\nsamsung-galaxy-a54-5g-pin-5100-minh-hoa-0.jpg\nGalaxy A54 5G (ảnh minh họa)\nTrào lưu điện thoại sở hữu nhiều camera đã không còn thay vào đó nhà sản xuất sẽ tập trung tối ưu phần mềm, AI tốt hơn để camera chính phát huy được tối đa phần cứng của nó. Và Samsung cũng đã lầm như vậy trên Galaxy A54 5G khi lược bỏ camera 5MP đo độ sâu và giảm độ phân giải camera chính từ 64MP xuống 50MP. Cả hai vẫn để có camera trước 32MP hỗ trợ tốt chụp ảnh selfie.\nTheo tin đồn thì Galaxy A54 được sở hữu con chip Exynos 1290 là thế hệ kế nhiệm của Exynos 1280 trên Galaxy A53 5G. Máy sẽ có RAM tối thiểu 6GB và tối đa 8GB thay vì tối thiểu 4GB và cao nhất cũng 8GB như trên thế hệ trước',8000000.00,50,'IN_STOCK','/uploads/products/0b1ca39c-131c-4974-943f-64a61813e9df.png','SGA54-001','SKU','DT-004','2025-11-08 16:29:33','2025-11-21 12:20:07',0),(5,1,3,'Xiaomi 14 Pro','Xiaomi','Sản phẩm Xiaomi 14 Pro 5G là bản nâng cấp của Xiaomi 13 Pro với nhiều nâng cấp và cải tiến đáng chú ý, đặc biệt là về thiết kế. Theo đó, chiếc điện thoại cao cấp Xiaomi mới sẽ có chip cao cấp nhất của Qualcomm mang lại hiệu năng siêu mạnh mẽ.\n\nChiếc điện thoại Xiaomi 14 Pro 5G còn được trang bị màn hình LTPO AMOLED 120Hz với độ phân giải QHD+, độ sáng siêu cao, hệ thống camera Leica cực đỉnh, viên pin dung lượng lớn và đủ các công nghệ sạc cực nhanh và hiện đại.',15000000.00,8,'IN_STOCK','/uploads/products/34ca0e1e-f96c-462c-8d9d-33931051c6d0.png','XMI14P-001','SKU','DT-005','2025-11-08 16:29:33','2025-12-11 08:38:18',0),(6,1,3,'Redmi Note 13','Xiaomi','Điện thoại giá rẻ hiệu năng tốt',5000000.00,60,'IN_STOCK','/uploads/products/4fc29940-f23f-49f1-b52e-c245d156654c.png','RMN13-001','SKU','DT-006','2025-11-08 16:29:33','2025-11-21 12:25:29',0),(7,2,4,'HP Pavilion 15','HP','Laptop sở hữu thiết kế cực chanh xả. Với tông màu chủ đạo là bạc nhám. Về thiết kế, đây là một trong những laptop thuộc dòng laptop cao cấp mỏng nhẹ, sở hữu vỏ máy làm từ hợp kim Nhôm - Magie bền bỉ hơn 4 lần và nhẹ hơn 35% so với hợp kim nhôm thông thường kết hợp với tone màu bạc mang lại vẻ ngoài sang trọng, tinh tế cho người dùng\n\nKhông chỉ mặt lưng, toàn bộ phần khung máy và bề mặt máy được làm đồng bộ với nhau. Toàn bộ thân máy được thiết kế từ kim loại rất sang trọng, đẹp và đơn giản mang đậm phong cách của HP. Logo HP được đặt ở chính giữa nắp máy và làm bóng.\n\nThiết kế hợp kim nguyên khối của máy giúp giảm tác động từ rơi, va đập… tránh các tổn hại không đáng có trong các trường hợp sơ ý của khách hàng. Ngoài ra, An Phát Computer cũng khuyến cáo người sử dụng nên trang bị thêm cho mình túi chống xốc và các sản phẩm đi kèm khác nhằm nâng cao quá trình sử dụng và đảm bảo sản phẩm được bền, đẹp\n\nTuy kích thước máy lớn nhưng xét về độ linh hoạt, laptop không hề thua kém bất cứ “lão đại” nào trong cùng phân khúc. Máy có độ dày 1.7 mm với khối lượng 1.7 kg. Không chỉ giúp toát lên vẻ sang trọng của sản phẩm, thiết kế này còn giúp người sử dụng dễ dàng cầm nắm, tránh để lại vệt mồ hôi tay.',15000000.00,8,'IN_STOCK','/uploads/products/ac09ede2-a719-4032-9fc6-028e54acffa7.jpg','HPPAV15-001','SKU','LT-001','2025-11-08 16:29:33','2025-11-21 12:27:50',0),(8,2,4,'HP EliteBook X360','HP','HP EliteBook x360 1040 G5 5XD44PA - Laptop siêu mỏng dành cho doanh nhân',25000000.00,7,'IN_STOCK','/uploads/products/96469811-1b95-4474-919e-53c790b9fc5e.png','HPELB-001','SKU','LT-002','2025-11-08 16:29:33','2025-12-21 22:38:38',0),(9,2,5,'Dell XPS 13','Dell','Laptop Dell XPS 13 9350 71058714 – Hiệu năng đỉnh cao, thiết kế sang trọng\nLaptop Dell XPS 13 9350 71058714 là một sản phẩm thuộc dòng laptop Dell XPS cao cấp, nổi bật với thiết kế mỏng nhẹ và hiệu năng ổn định. Sản phẩm hướng đến người dùng có nhu cầu di động cao và cần một thiết bị đáng tin cậy cho công việc hàng ngày.\n\nKhả năng xử lý mạnh mẽ cho mọi nhu cầu\nDell XPS 13 9350 được trang bị RAM 16GB LPDDR5X với tốc độ 8533MT/s, mang lại khả năng xử lý đa nhiệm mượt mà. Loại RAM này hỗ trợ truyền dữ liệu nhanh, giúp máy phản hồi tốt khi chạy cùng lúc nhiều ứng dụng nặng. Dung lượng này là mức lý tưởng, đủ đáp ứng nhu cầu của đa số người dùng trong công việc hàng ngày và giải trí. Bên cạnh đó, laptop còn tích hợp ổ cứng SSD 1TB M.2 PCIe NVMe, cung cấp không gian rộng rãi để lưu trữ tài liệu, hình ảnh và video. Tốc độ đọc/ghi của ổ SSD này khá ấn tượng, giúp khởi động hệ điều hành và mở ứng dụng nhanh chóng.',30000000.00,10,'IN_STOCK','/uploads/products/638c1660-d710-445e-832a-836d9b0ccdc6.png','DLXPS13-001','SKU','LT-003','2025-11-08 16:29:33','2025-11-21 12:31:02',0),(10,2,5,'Dell Inspiron 15','Dell','Laptop Dell Inspiron 15 3530 J9XFD được trang bị RAM 16GB DDR4 và ổ cứng SSD 512GB PCIe 4.0, mang lại tốc độ đọc ghi vượt trội. Với trọng lượng chỉ 1.62 kg và lớp vỏ nhựa bền bỉ, sản phẩm laptop Dell Inspiron dễ dàng đồng hành cùng bạn trong mọi hành trình. Bộ vi xử lý Intel Core i5-1334U cho hiệu năng ổn định khi làm việc và giải trí cơ bản.',12000000.00,27,'IN_STOCK','/uploads/products/bf4a2a40-0f27-47b6-bf59-92237a338764.png','DLINS15-001','SKU','LT-004','2025-11-08 16:29:33','2025-11-21 12:32:08',0),(11,2,1,'MacBook Pro 14','Apple','MacBook Pro 14 inch M4 16GB 512GB mang nguồn sức mạnh ấn tượng với con chip M4 10 lõi, GPU 10 lõi Neural Engine 16 lõi khai phá tiềm năng AI kinh ngạc, nâng cấp hiệu năng vượt trội. MacBook sở hữu RAM 16GB mạnh mẽ với tốc độ băng thông 120GB/s cho mọi thao tác trơn tru và được xử lý tốc độ. Bộ nhớ 512GB với loại ổ cứng SSD đem đến không gian lưu trữ lớn cùng khả năng truy xuất dữ liệu tốc độ cao đồng thời bảo vệ dữ liệu an toàn.',45000000.00,5,'IN_STOCK','/uploads/products/66fdb689-8e72-43b1-aa80-32e9fa70e372.png','MBP14-001','SKU','LT-005','2025-11-08 16:29:33','2025-11-21 12:40:06',0),(12,2,1,'MacBook Air M2','Apple','Apple Macbook Air M2 2024 16GB 256GB thiết kế siêu mỏng 1.13cm, trang bị chip M2 8 nhân GPU, 16 nhân Neural Engine, RAM khủng 16GB, SSD 256GB, màn hình IPS Liquid Retina Display cùng hệ thống 4 loa cho trải nghiệm đỉnh cao.',25000000.00,10,'IN_STOCK','/uploads/products/bc4d639b-5a49-4523-a4cf-1c1ae0e3b80c.png','MBA-M2-001','SKU','LT-006','2025-11-08 16:29:33','2025-11-21 18:45:13',0),(13,3,1,'iPad Pro 12.9 inch','Apple','Tablet cao cấp với chip M2, 12.9 inch',28000000.00,20,'IN_STOCK','/uploads/products/2e7e702d-eb95-4988-aef3-5b19d878a2d0.png','IPDP12-001','SKU','TB-001','2025-11-08 16:29:33','2025-11-21 18:46:09',0),(14,3,1,'iPad Air','Apple','iPad Air M3 11 inch sở hữu hiệu suất cực mạnh mẽ với chip Apple M3, kết hợp RAM 8GB, bộ nhớ trong 128GB và tính năng Apple Intelligence đặc biệt. Thiết bị có màn hình Liquid Retina 11 inch hiển thị sắc nét cùng viên pin Li-Po 28,93 watt-giờ giúp duy trì hoạt động lâu dài. Máy cũng thiết kế tinh tế với vỏ nhôm tái chế 100% và trọng lượng chỉ 460g.',15000000.00,19,'IN_STOCK','/uploads/products/6eea8b7f-657f-4d08-b3a9-8a2253b61e32.png','IPDA-001','SKU','TB-002','2025-11-08 16:29:33','2025-12-12 05:37:06',0),(15,3,2,'Samsung Galaxy Tab S9','Samsung','Samsung Galaxy Tab S9 FE Plus Wifi sở hữu màn hình lớn với kích thước 12.4 inches siêu ấn tượng. Trang bị Chipset Exynos 1380 mạnh mẽ, hỗ trợ xử lý tác vụ mượt mà, kết hợp với bút S-pen thế hệ mới. Bộ nhớ trong 128GB với dung lượng RAM 8GB cho bạn thỏa sức lưu trữ.',20000000.00,10,'IN_STOCK','/uploads/products/da7700ad-4941-4ab8-b7d1-7d2a56fa538c.png','SGTABS9-001','SKU','TB-003','2025-11-08 16:29:33','2025-11-21 18:46:56',0),(16,4,1,'AirPods Pro 2','Apple','Airpods Pro 2 Type-C với công nghệ khử tiếng ồn chủ động mang lại khả năng khử ồn lên gấp 2 lần mang lại trải nghiệm nghe - gọi và trải nghiệm âm nhạc ấn tượng. Cùng với đó, điện thoại còn được trang bị công nghệ âm thanh không gian giúp trải nghiệm âm nhạc thêm phần sống động. Airpods Pro 2 Type-C với cổng sạc Type C tiện lợi cùng viên pin mang lại thời gian trải nghiệm lên đến 6 giờ tiện lợi.',6000000.00,128,'IN_STOCK','/uploads/products/698e30fa-26ab-4971-8f53-387885901e96.png','APDP2-001','SKU','PK-001','2025-11-08 16:29:33','2025-12-11 10:20:47',0),(17,4,2,'Galaxy Buds2 Pro','Samsung','Thiết kế sang trọng\nSamsung Buds 2 Pro thế hệ mới được Samsung tân trang với thiết kế hiện đại hơn, nhưng vẫn giữ kiểu dáng in-ear “hạt đậu” đặc trưng của dòng sản phẩm này. Có thể, nhà sản xuất tinh chỉnh lại ngoại hình nhỏ gọn hơn, mang lại cảm giác đeo lên tai dễ chịu, thoải mái. Và kiểu thiết kế của thiết bị này được nghiên cứu rất kỹ lưỡng, đạt chuẩn công thái học, nằm gọn trong tai nên khi sử dụng thời gian dài sẽ không bị đau, vướng.\nHộp sạc có kiểu dáng hình vuông, bo tròn các góc, cầm nắm dễ dàng, và khi để trong túi xách khá nhỏ gọn, gần như chỉ bằng một hộp phấn của các bạn nữ, lên không tốn quá nhiều diện tích. Ngoài ra, sản phẩm sở hữu ba phiên bản màu sắc mới mẻ: tím Bora, Trắng Ivory, Đen Graphite.\n\nNgoài ra, Samsung Buds 2 Pro cũng sẽ được trang bị chuẩn kháng nước và bụi bẩn IPX7. Nhờ đó mà người dùng có thể tự tin mang theo thiết bị trong quá trình tập luyện.\nChất âm cải tiến rõ rệt\nChất âm của Buds 2 Pro được Samsung cải tiến rất tốt, với dải bass chắc chắn hơn, và dải mid và treble hài hòa, cân bằng. Kết hợp với thiết kế kiểu in-ear, sản phẩm có thể khử tiếng ồn chủ động (ANC) một cách hiệu quả.\n\nĐặc biệt, có nguồn tin cho rằng Galaxy Buds Pro thế hệ mới trang bị cảm biến nhiệt độ cơ thể. Nếu điều này trở thành sự thật, thì sản phẩm không chỉ mang lại chất âm hoàn hảo, mà còn có công nghệ hỗ trợ kiểm tra sức khỏe cho bạn.',4000000.00,39,'IN_STOCK','/uploads/products/fbee75f9-bbc6-4d73-94cf-4899e96fd29a.png','SGBUDS2-001','SKU','PK-002','2025-11-08 16:29:33','2025-11-21 18:49:51',0),(18,4,NULL,'Ốp lưng iPhone 15 Pro','Generic','Ốp lưng trong suốt bảo vệ iPhone',200000.00,196,'IN_STOCK','/uploads/products/87c66e19-e8f4-476b-9c12-abb504845071.png','OPIP15-001','SKU','PK-003','2025-11-08 16:29:33','2025-12-11 17:47:14',0),(19,4,NULL,'Cáp sạc USB-C','Generic','Cáp sạc nhanh USB-C 2m',150000.00,295,'IN_STOCK','/uploads/products/bccbb5da-1b96-481a-bde4-7aa32a6fc526.png','CAPUSBC-001','SKU','PK-004','2025-11-08 16:29:33','2025-12-13 01:04:52',0),(20,5,1,'Apple Watch Series 9','Apple','Đồng hồ Apple Watch Series 9 45mm sở hữu on chip S9 SiP - CPU với 5,6 tỷ bóng bán dẫn giúp mang lại hiệu năng cải thiện hơn 60% so với thế hệ S8. Màn hình thiết bị với kích thước 45mm cùng độ sáng tối đa lên 2000 nit mang lại trải nghiệm hiển thị vượt trội. Cùng với đó, đồng hồ Apple Watch s9 này còn được trang bị nhiều tính năng hỗ trợ theo dõi sức khỏe và tập luyện thông minh.',12000000.00,24,'IN_STOCK','/uploads/products/3d2f020a-7c4d-45a8-a539-13d7d45ae04f.png','AW9-001','SKU','DH-001','2025-11-08 16:29:33','2025-12-11 05:14:23',0),(21,5,2,'Samsung Galaxy Watch 6','Samsung','Đồng hồ thông minh Samsung, 44mm',8000000.00,12,'IN_STOCK','/uploads/products/5a810f52-e38c-482a-8967-b7958f84ad46.png','SGW6-001','SKU','DH-002','2025-11-08 16:29:33','2025-12-12 22:10:35',0),(22,1,1,'iPhone 13 Pro','Apple','Điện thoại iPhone 13 Pro Max 512GB với bộ nhớ lưu trữ ấn tượng cùng dung lượng pin cao góp phần mang đến những trải nghiệm vượt trội cho người dùng. Cùng với hiệu năng hoạt động mạnh mẽ góp phần gia tăng trải nghiệm vượt trội cho người dùng\nKhám phá thêm thông tin về iPhone 13 Pro Max 1TB cuốn hút nhằm mang lại trải nghiệm vượt trội và đẳng cấp cho người dùng',20000000.00,0,'OUT_OF_STOCK','/uploads/products/b1408e59-227d-465d-b05f-511475493c34.png','IP13PRO-001','SKU','DT-007','2025-11-08 16:29:33','2025-11-21 18:57:30',0),(24,1,NULL,'iPhone 17 Pro MAX',NULL,'iPhone 17 Pro Max 1TB sở hữu bộ nhớ lưu trữ lớn, cho phép người dùng thoải mái quay video, lưu trữ kho phim ảnh và dữ liệu lớn. Máy được trang bị chip A19 Pro với CPU và GPU nâng cấp, mang đến hiệu năng xử lý mạnh mẽ và mượt mà. Màn hình OLED Super Retina XDR kích thước 6.9 inch cùng với độ sáng tối đa 3000 nits (ngoài trời) mang lại trải nghiệm hiển thị sống động.',25000000.00,0,'OUT_OF_STOCK','/uploads/products/34992bf5-e0e2-435d-8ba1-bdb99ca7b828.png','DT-20251110-1015','SKU','DT-20251110-1015','2025-11-10 05:45:01','2025-11-21 18:58:47',0),(26,1,1,'iPhone 15 Pro','Apple','Điện thoại cao cấp',25000000.00,0,'OUT_OF_STOCK','/uploads/products/975b3753-39f6-4a85-a367-13deeab1e665.jpg','DT-20251110-2196','SKU','DT-20251110-2196','2025-11-10 05:56:42','2025-12-12 10:58:46',0),(27,1,1,'iPhone XS Max','Apple','Chính thức ra mắt vào tháng 9 năm 2018, điện thoại iPhone XS Max một trong những dòng flagship thành công nhất của Apple. Không phụ kỳ vọng của người hâm mộ, iPhone XS MAX 64GB chính hãng VN/A sỡ hữu những công nghệ nổi bật như chip A12 mạnh mẽ, màn hình rộng đến 6.5 inches, camera kép AI, Face ID nâng cấp cùng dung lượng bộ nhớ tối ưu.',30000000.00,0,'OUT_OF_STOCK','/uploads/products/5726cc57-d648-4565-a149-923aab76ca39.png','DT-20251110-6021','SKU','DT-20251110-6021','2025-11-10 06:24:56','2025-12-12 10:58:46',0),(28,1,6,'OnePlus ACE 3v','OnePlus',NULL,4000000.00,2,'IN_STOCK',NULL,'DT-20251213-0571','SKU','DT-20251213-0571','2025-12-12 19:32:11','2025-12-21 12:12:57',1),(29,2,3,'Lenono Slim 5 2024','Lenovo',NULL,13500000.00,5,'IN_STOCK',NULL,'LT-20251216-0428','SKU','LT-20251216-0428','2025-12-15 23:36:20','2025-12-21 12:12:52',1);
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `promotion_products`
--

DROP TABLE IF EXISTS `promotion_products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `promotion_products` (
  `id_promotion` int NOT NULL,
  `id_product` int NOT NULL,
  PRIMARY KEY (`id_promotion`,`id_product`),
  KEY `idx_promotion_products_product` (`id_product`),
  CONSTRAINT `fk_promotion_products_product` FOREIGN KEY (`id_product`) REFERENCES `products` (`id_product`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_promotion_products_promotion` FOREIGN KEY (`id_promotion`) REFERENCES `promotions` (`id_promotion`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Bảng liên kết promotion với sản phẩm cụ thể';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `promotion_products`
--

LOCK TABLES `promotion_products` WRITE;
/*!40000 ALTER TABLE `promotion_products` DISABLE KEYS */;
/*!40000 ALTER TABLE `promotion_products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `promotion_rules`
--

DROP TABLE IF EXISTS `promotion_rules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `promotion_rules` (
  `id_rule` int NOT NULL AUTO_INCREMENT,
  `rule_name` varchar(255) NOT NULL,
  `discount_type` enum('PERCENTAGE','FIXED_AMOUNT') NOT NULL,
  `discount_value` decimal(12,2) NOT NULL,
  `min_order_amount` decimal(15,2) DEFAULT '0.00',
  `customer_type` enum('VIP','REGULAR','ALL') DEFAULT 'ALL',
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `priority` int DEFAULT '0' COMMENT 'Ưu tiên (số càng cao càng ưu tiên)',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `scope` enum('ORDER','SHIPPING','PRODUCT') NOT NULL DEFAULT 'ORDER' COMMENT 'Phạm vi áp dụng: ORDER = giảm giá đơn hàng, SHIPPING = giảm giá phí vận chuyển, PRODUCT = giảm giá sản phẩm',
  PRIMARY KEY (`id_rule`),
  KEY `idx_rules_active` (`is_active`),
  KEY `idx_rules_dates` (`start_date`,`end_date`),
  KEY `idx_rules_priority` (`priority`),
  KEY `idx_promotion_rules_scope` (`scope`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Bảng lưu quy tắc giảm giá tự động';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `promotion_rules`
--

LOCK TABLES `promotion_rules` WRITE;
/*!40000 ALTER TABLE `promotion_rules` DISABLE KEYS */;
INSERT INTO `promotion_rules` VALUES (1,'GIAMTD80','PERCENTAGE',80.00,10000000.00,'ALL','2025-12-15 17:00:00','2026-01-18 16:59:59',1,0,'2025-11-20 05:39:41','2025-12-17 01:13:07','ORDER'),(2,'FREE100','PERCENTAGE',100.00,0.00,'ALL','2025-12-15 17:00:00','2025-12-18 16:59:59',1,0,'2025-12-17 05:15:50','2025-12-17 05:15:50','SHIPPING');
/*!40000 ALTER TABLE `promotion_rules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `promotion_usage`
--

DROP TABLE IF EXISTS `promotion_usage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `promotion_usage` (
  `id_usage` int NOT NULL AUTO_INCREMENT,
  `id_promotion` int NOT NULL,
  `id_order` int NOT NULL,
  `id_customer` int NOT NULL,
  `used_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_usage`),
  KEY `idx_usage_promotion` (`id_promotion`),
  KEY `idx_usage_order` (`id_order`),
  KEY `idx_usage_customer` (`id_customer`),
  CONSTRAINT `fk_usage_customer` FOREIGN KEY (`id_customer`) REFERENCES `customers` (`id_customer`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_usage_order` FOREIGN KEY (`id_order`) REFERENCES `orders` (`id_order`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_usage_promotion` FOREIGN KEY (`id_promotion`) REFERENCES `promotions` (`id_promotion`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Bảng lưu lịch sử sử dụng mã giảm giá';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `promotion_usage`
--

LOCK TABLES `promotion_usage` WRITE;
/*!40000 ALTER TABLE `promotion_usage` DISABLE KEYS */;
/*!40000 ALTER TABLE `promotion_usage` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `promotions`
--

DROP TABLE IF EXISTS `promotions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `promotions` (
  `id_promotion` int NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL,
  `discount_type` enum('PERCENTAGE','FIXED_AMOUNT') NOT NULL,
  `discount_value` decimal(12,2) NOT NULL,
  `min_order_amount` decimal(15,2) DEFAULT '0.00',
  `usage_limit` int DEFAULT NULL COMMENT 'Số lần sử dụng tối đa (NULL = không giới hạn)',
  `usage_count` int DEFAULT '0',
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `scope` enum('ORDER','SHIPPING','PRODUCT') NOT NULL DEFAULT 'ORDER' COMMENT 'Phạm vi áp dụng: ORDER = giảm giá đơn hàng, SHIPPING = giảm giá phí vận chuyển, PRODUCT = giảm giá sản phẩm',
  PRIMARY KEY (`id_promotion`),
  UNIQUE KEY `uq_promotions_code` (`code`),
  KEY `idx_promotions_active` (`is_active`),
  KEY `idx_promotions_dates` (`start_date`,`end_date`),
  KEY `idx_promotions_code` (`code`),
  KEY `idx_promotions_scope` (`scope`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Bảng lưu mã giảm giá';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `promotions`
--

LOCK TABLES `promotions` WRITE;
/*!40000 ALTER TABLE `promotions` DISABLE KEYS */;
/*!40000 ALTER TABLE `promotions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `purchase_order_details`
--

DROP TABLE IF EXISTS `purchase_order_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `purchase_order_details` (
  `id_purchase_order_detail` int NOT NULL AUTO_INCREMENT,
  `id_purchase_order` int NOT NULL,
  `id_product` int NOT NULL,
  `quantity` int NOT NULL,
  `import_price` decimal(12,2) NOT NULL,
  PRIMARY KEY (`id_purchase_order_detail`),
  UNIQUE KEY `uq_po_details_order_product` (`id_purchase_order`,`id_product`),
  KEY `idx_po_details_order` (`id_purchase_order`),
  KEY `idx_po_details_product` (`id_product`),
  CONSTRAINT `fk_po_details_order` FOREIGN KEY (`id_purchase_order`) REFERENCES `purchase_orders` (`id_purchase_order`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_po_details_product` FOREIGN KEY (`id_product`) REFERENCES `products` (`id_product`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `purchase_order_details_chk_1` CHECK ((`quantity` > 0)),
  CONSTRAINT `purchase_order_details_chk_2` CHECK ((`import_price` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchase_order_details`
--

LOCK TABLES `purchase_order_details` WRITE;
/*!40000 ALTER TABLE `purchase_order_details` DISABLE KEYS */;
INSERT INTO `purchase_order_details` VALUES (1,1,1,20,20000000.00),(2,1,2,15,15000000.00),(3,1,11,5,38000000.00),(4,1,12,10,20000000.00),(5,1,13,8,22000000.00),(6,1,16,50,4500000.00),(7,2,3,12,24000000.00),(8,2,4,50,6500000.00),(9,2,15,10,16000000.00),(10,2,21,30,6500000.00),(11,2,17,40,3200000.00),(12,3,1,30,20000000.00),(13,3,13,12,22000000.00),(14,3,14,20,12000000.00),(15,3,16,80,4500000.00),(16,3,20,25,9500000.00),(17,4,5,20,12000000.00),(18,4,6,60,4000000.00),(19,5,7,10,12000000.00),(20,5,8,8,20000000.00),(21,6,1,10,20000000.00),(22,6,2,5,15000000.00),(23,7,1,10,20000000.00),(24,7,2,5,15000000.00),(25,8,28,3,4000000.00),(26,9,29,3,14000000.00),(27,10,29,1,10000000.00),(28,11,29,1,13000000.00);
/*!40000 ALTER TABLE `purchase_order_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `purchase_orders`
--

DROP TABLE IF EXISTS `purchase_orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `purchase_orders` (
  `id_purchase_order` int NOT NULL AUTO_INCREMENT,
  `id_supplier` int DEFAULT NULL,
  `id_employee` int DEFAULT NULL,
  `order_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `total_amount` decimal(15,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `invoice_printed` tinyint(1) DEFAULT '0',
  `invoice_printed_at` datetime DEFAULT NULL,
  `invoice_printed_by` int DEFAULT NULL,
  PRIMARY KEY (`id_purchase_order`),
  KEY `idx_po_supplier` (`id_supplier`),
  KEY `idx_po_employee` (`id_employee`),
  KEY `idx_purchase_orders_supplier` (`id_supplier`),
  CONSTRAINT `fk_po_employee` FOREIGN KEY (`id_employee`) REFERENCES `employees` (`id_employee`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_po_supplier` FOREIGN KEY (`id_supplier`) REFERENCES `suppliers` (`id_supplier`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `purchase_orders_chk_1` CHECK ((`total_amount` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchase_orders`
--

LOCK TABLES `purchase_orders` WRITE;
/*!40000 ALTER TABLE `purchase_orders` DISABLE KEYS */;
INSERT INTO `purchase_orders` VALUES (1,1,NULL,'2025-01-05 10:00:00',1416000000.00,'2025-11-08 16:29:33','2025-12-13 03:11:05',0,NULL,NULL),(2,2,NULL,'2025-01-10 14:30:00',1096000000.00,'2025-11-08 16:29:33','2025-12-13 03:11:05',0,NULL,NULL),(3,1,NULL,'2025-01-15 09:15:00',1701500000.00,'2025-11-08 16:29:33','2025-12-13 03:11:05',0,NULL,NULL),(4,3,NULL,'2025-01-20 11:00:00',480000000.00,'2025-11-08 16:29:33','2025-12-13 03:11:05',0,NULL,NULL),(5,4,NULL,'2025-01-25 15:45:00',280000000.00,'2025-11-08 16:29:33','2025-12-13 03:11:05',0,NULL,NULL),(6,1,NULL,'2025-11-10 00:21:21',275000000.00,'2025-11-09 17:21:21','2025-11-09 17:21:21',0,NULL,NULL),(7,1,4,'2025-11-10 00:22:45',275000000.00,'2025-11-09 17:22:44','2025-11-09 17:22:44',0,NULL,NULL),(8,6,NULL,'2025-12-13 02:34:51',12000000.00,'2025-12-13 02:34:51','2025-12-13 02:34:51',0,NULL,NULL),(9,5,NULL,'2025-12-16 06:37:33',42000000.00,'2025-12-16 06:37:32','2025-12-16 06:37:32',0,NULL,NULL),(10,5,NULL,'2025-12-16 07:39:47',10000000.00,'2025-12-16 07:39:46','2025-12-17 13:01:22',1,'2025-12-17 13:01:22',NULL),(11,3,NULL,'2025-12-16 07:48:27',13000000.00,'2025-12-16 07:48:27','2025-12-17 13:01:11',1,'2025-12-17 13:01:11',NULL);
/*!40000 ALTER TABLE `purchase_orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `shipments`
--

DROP TABLE IF EXISTS `shipments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `shipments` (
  `id_shipment` int NOT NULL AUTO_INCREMENT,
  `id_order` int NOT NULL,
  `shipping_status` enum('PREPARING','SHIPPED','DELIVERED') DEFAULT 'PREPARING',
  `tracking_number` varchar(50) DEFAULT NULL,
  `location_lat` decimal(9,6) DEFAULT NULL COMMENT 'Vĩ độ',
  `location_long` decimal(9,6) DEFAULT NULL COMMENT 'Kinh độ',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `ghn_order_code` varchar(50) DEFAULT NULL COMMENT 'Mã đơn hàng từ GHN API',
  `ghn_shipping_fee` decimal(12,2) DEFAULT NULL COMMENT 'Phí vận chuyển từ GHN',
  `ghn_expected_delivery_time` datetime DEFAULT NULL COMMENT 'Thời gian giao hàng dự kiến từ GHN',
  `ghn_status` varchar(50) DEFAULT NULL COMMENT 'Trạng thái đơn hàng từ GHN (ready_to_pick, delivering, delivered, etc.)',
  `ghn_updated_at` timestamp NULL DEFAULT NULL COMMENT 'Thời gian cập nhật trạng thái từ GHN webhook',
  `ghn_note` text COMMENT 'Ghi chú hoặc lý do từ GHN (ví dụ: lý do giao thất bại)',
  `shipping_method` enum('GHN','SELF_PICKUP') DEFAULT 'GHN' COMMENT 'Phương thức vận chuyển: GHN hoặc khách tự đến lấy',
  PRIMARY KEY (`id_shipment`),
  UNIQUE KEY `uq_shipments_order` (`id_order`),
  KEY `idx_shipments_ghn_order_code` (`ghn_order_code`),
  KEY `idx_shipments_shipping_method` (`shipping_method`),
  CONSTRAINT `fk_shipments_order` FOREIGN KEY (`id_order`) REFERENCES `orders` (`id_order`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=67 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shipments`
--

LOCK TABLES `shipments` WRITE;
/*!40000 ALTER TABLE `shipments` DISABLE KEYS */;
INSERT INTO `shipments` VALUES (1,3,'PREPARING',NULL,NULL,NULL,'2025-11-09 08:23:48','2025-11-09 08:23:48',NULL,NULL,NULL,NULL,NULL,NULL,'GHN'),(2,8,'PREPARING',NULL,NULL,NULL,'2025-11-20 17:09:47','2025-11-20 17:09:47',NULL,NULL,NULL,NULL,NULL,NULL,'GHN'),(3,9,'PREPARING',NULL,NULL,NULL,'2025-11-20 17:10:49','2025-11-20 17:10:49',NULL,NULL,NULL,NULL,NULL,NULL,'GHN'),(4,10,'PREPARING',NULL,NULL,NULL,'2025-11-20 17:42:20','2025-11-20 17:42:20',NULL,NULL,NULL,NULL,NULL,NULL,'GHN'),(5,11,'PREPARING',NULL,NULL,NULL,'2025-11-20 17:54:27','2025-11-20 17:54:27',NULL,NULL,NULL,NULL,NULL,NULL,'GHN'),(6,12,'PREPARING',NULL,NULL,NULL,'2025-11-20 18:03:22','2025-11-20 18:03:22',NULL,NULL,NULL,NULL,NULL,NULL,'GHN'),(7,13,'PREPARING',NULL,NULL,NULL,'2025-11-20 18:03:59','2025-11-20 18:03:59',NULL,NULL,NULL,NULL,NULL,NULL,'GHN'),(8,22,'PREPARING',NULL,NULL,NULL,'2025-11-20 19:28:48','2025-11-20 19:28:48',NULL,NULL,NULL,NULL,NULL,NULL,'GHN'),(9,23,'PREPARING',NULL,NULL,NULL,'2025-11-20 19:31:28','2025-11-20 19:31:28',NULL,NULL,NULL,NULL,NULL,NULL,'GHN'),(10,24,'PREPARING',NULL,NULL,NULL,'2025-11-20 19:39:11','2025-11-20 19:39:11',NULL,NULL,NULL,NULL,NULL,NULL,'GHN'),(11,25,'PREPARING',NULL,NULL,NULL,'2025-11-20 19:50:59','2025-11-20 19:50:59',NULL,NULL,NULL,NULL,NULL,NULL,'GHN'),(12,26,'PREPARING',NULL,NULL,NULL,'2025-11-20 19:52:37','2025-11-20 19:52:37',NULL,NULL,NULL,NULL,NULL,NULL,'GHN'),(13,27,'PREPARING',NULL,NULL,NULL,'2025-11-21 04:50:44','2025-11-21 04:50:44',NULL,NULL,NULL,NULL,NULL,NULL,'GHN'),(14,28,'PREPARING',NULL,NULL,NULL,'2025-11-21 04:51:06','2025-11-21 04:51:06',NULL,NULL,NULL,NULL,NULL,NULL,'GHN'),(15,29,'PREPARING',NULL,NULL,NULL,'2025-11-21 04:51:56','2025-11-21 04:51:56',NULL,NULL,NULL,NULL,NULL,NULL,'GHN'),(16,30,'PREPARING',NULL,NULL,NULL,'2025-11-21 04:56:16','2025-11-21 04:56:16',NULL,NULL,NULL,NULL,NULL,NULL,'GHN'),(17,31,'PREPARING',NULL,NULL,NULL,'2025-11-21 05:29:17','2025-11-21 05:29:17',NULL,NULL,NULL,NULL,NULL,NULL,'GHN'),(18,32,'PREPARING',NULL,NULL,NULL,'2025-11-21 05:34:02','2025-11-21 05:34:02',NULL,NULL,NULL,NULL,NULL,NULL,'GHN'),(19,33,'PREPARING',NULL,NULL,NULL,'2025-11-21 07:56:50','2025-11-21 07:56:50',NULL,NULL,NULL,NULL,NULL,NULL,'GHN'),(20,34,'PREPARING',NULL,NULL,NULL,'2025-11-21 07:57:28','2025-11-21 07:57:28',NULL,NULL,NULL,NULL,NULL,NULL,'GHN'),(21,35,'PREPARING',NULL,NULL,NULL,'2025-11-21 08:04:32','2025-11-21 08:04:32',NULL,NULL,NULL,NULL,NULL,NULL,'GHN'),(22,36,'PREPARING',NULL,NULL,NULL,'2025-11-21 08:06:24','2025-11-21 08:06:24',NULL,NULL,NULL,NULL,NULL,NULL,'GHN'),(23,37,'PREPARING',NULL,NULL,NULL,'2025-11-21 08:11:20','2025-11-21 08:11:20',NULL,NULL,NULL,NULL,NULL,NULL,'GHN'),(24,38,'PREPARING',NULL,NULL,NULL,'2025-11-21 08:17:01','2025-11-21 08:17:01',NULL,NULL,NULL,NULL,NULL,NULL,'GHN'),(25,39,'PREPARING',NULL,NULL,NULL,'2025-11-21 08:18:22','2025-11-21 08:18:22',NULL,NULL,NULL,NULL,NULL,NULL,'GHN'),(26,40,'PREPARING',NULL,NULL,NULL,'2025-11-21 09:24:17','2025-11-21 09:24:17',NULL,NULL,NULL,NULL,NULL,NULL,'GHN'),(27,41,'PREPARING',NULL,NULL,NULL,'2025-11-21 11:24:09','2025-11-21 11:24:09',NULL,NULL,NULL,NULL,NULL,NULL,'GHN'),(28,42,'PREPARING',NULL,NULL,NULL,'2025-11-21 11:24:32','2025-11-21 11:24:32',NULL,NULL,NULL,NULL,NULL,NULL,'GHN'),(29,43,'PREPARING',NULL,NULL,NULL,'2025-11-21 15:34:15','2025-11-21 15:34:15',NULL,NULL,NULL,NULL,NULL,NULL,'GHN'),(30,44,'PREPARING',NULL,NULL,NULL,'2025-11-21 15:55:48','2025-11-21 15:55:48',NULL,NULL,NULL,NULL,NULL,NULL,'GHN'),(31,45,'PREPARING',NULL,NULL,NULL,'2025-11-21 18:00:59','2025-11-21 18:00:59',NULL,NULL,NULL,NULL,NULL,NULL,'GHN'),(32,46,'PREPARING',NULL,NULL,NULL,'2025-11-22 02:28:41','2025-11-22 02:28:41',NULL,NULL,NULL,NULL,NULL,NULL,'GHN'),(33,47,'PREPARING',NULL,NULL,NULL,'2025-11-22 03:43:48','2025-11-22 03:43:48',NULL,NULL,NULL,NULL,NULL,NULL,'GHN'),(34,48,'PREPARING',NULL,NULL,NULL,'2025-12-04 18:28:47','2025-12-04 18:28:47',NULL,NULL,NULL,NULL,NULL,NULL,'GHN'),(35,49,'PREPARING',NULL,NULL,NULL,'2025-12-10 17:19:54','2025-12-10 17:19:54',NULL,NULL,NULL,NULL,NULL,NULL,'GHN'),(36,50,'PREPARING',NULL,NULL,NULL,'2025-12-11 05:11:34','2025-12-11 05:11:34',NULL,NULL,NULL,NULL,NULL,NULL,'GHN'),(37,51,'PREPARING',NULL,NULL,NULL,'2025-12-11 12:08:02','2025-12-11 12:08:02',NULL,NULL,NULL,NULL,NULL,NULL,'GHN'),(38,52,'PREPARING',NULL,NULL,NULL,'2025-12-11 12:14:23','2025-12-11 12:14:23',NULL,NULL,NULL,NULL,NULL,NULL,'GHN'),(39,53,'PREPARING',NULL,NULL,NULL,'2025-12-11 12:15:31','2025-12-11 12:15:31',NULL,NULL,NULL,NULL,NULL,NULL,'GHN'),(40,54,'PREPARING',NULL,NULL,NULL,'2025-12-11 12:27:58','2025-12-11 12:27:58',NULL,NULL,NULL,NULL,NULL,NULL,'GHN'),(41,55,'PREPARING',NULL,NULL,NULL,'2025-12-11 12:32:54','2025-12-11 12:32:54',NULL,NULL,NULL,NULL,NULL,NULL,'GHN'),(42,56,'PREPARING',NULL,NULL,NULL,'2025-12-11 12:39:44','2025-12-11 12:39:44',NULL,NULL,NULL,NULL,NULL,NULL,'GHN'),(43,57,'PREPARING',NULL,NULL,NULL,'2025-12-11 12:54:13','2025-12-11 12:54:13',NULL,NULL,NULL,NULL,NULL,NULL,'GHN'),(44,58,'PREPARING',NULL,NULL,NULL,'2025-12-11 15:41:37','2025-12-11 15:41:37',NULL,NULL,NULL,NULL,NULL,NULL,'GHN'),(45,59,'PREPARING',NULL,NULL,NULL,'2025-12-11 15:42:31','2025-12-11 15:42:31',NULL,NULL,NULL,NULL,NULL,NULL,'GHN'),(46,60,'PREPARING',NULL,NULL,NULL,'2025-12-11 15:50:20','2025-12-11 15:50:20',NULL,NULL,NULL,NULL,NULL,NULL,'GHN'),(47,61,'PREPARING',NULL,NULL,NULL,'2025-12-11 15:51:19','2025-12-11 15:51:19',NULL,NULL,NULL,NULL,NULL,NULL,'GHN'),(48,62,'PREPARING',NULL,NULL,NULL,'2025-12-11 15:58:37','2025-12-11 15:58:37',NULL,NULL,NULL,NULL,NULL,NULL,'GHN'),(49,63,'PREPARING',NULL,NULL,NULL,'2025-12-11 16:57:13','2025-12-11 16:57:13',NULL,NULL,NULL,NULL,NULL,NULL,'GHN'),(50,64,'PREPARING',NULL,NULL,NULL,'2025-12-11 17:00:49','2025-12-11 17:00:49',NULL,NULL,NULL,NULL,NULL,NULL,'GHN'),(51,65,'PREPARING',NULL,NULL,NULL,'2025-12-11 17:02:45','2025-12-11 17:02:45',NULL,NULL,NULL,NULL,NULL,NULL,'GHN'),(52,66,'PREPARING',NULL,NULL,NULL,'2025-12-11 17:20:46','2025-12-11 17:20:46',NULL,NULL,NULL,NULL,NULL,NULL,'GHN'),(53,67,'PREPARING',NULL,NULL,NULL,'2025-12-11 17:29:36','2025-12-11 17:29:36',NULL,NULL,NULL,NULL,NULL,NULL,'GHN'),(54,68,'PREPARING',NULL,NULL,NULL,'2025-12-12 00:47:13','2025-12-12 00:47:13',NULL,NULL,NULL,NULL,NULL,NULL,'GHN'),(55,69,'PREPARING',NULL,NULL,NULL,'2025-12-12 04:34:43','2025-12-12 04:34:43',NULL,NULL,NULL,NULL,NULL,NULL,'GHN'),(56,70,'PREPARING',NULL,NULL,NULL,'2025-12-12 04:48:45','2025-12-12 04:48:45',NULL,NULL,NULL,NULL,NULL,NULL,'GHN'),(57,71,'PREPARING',NULL,NULL,NULL,'2025-12-12 04:49:09','2025-12-12 04:49:09',NULL,NULL,NULL,NULL,NULL,NULL,'GHN'),(58,72,'PREPARING',NULL,NULL,NULL,'2025-12-12 12:36:50','2025-12-12 12:36:50',NULL,NULL,NULL,NULL,NULL,NULL,'GHN'),(59,73,'PREPARING',NULL,NULL,NULL,'2025-12-12 12:37:06','2025-12-12 12:37:06',NULL,NULL,NULL,NULL,NULL,NULL,'GHN'),(60,74,'PREPARING',NULL,NULL,NULL,'2025-12-12 17:57:27','2025-12-12 17:57:27',NULL,NULL,NULL,NULL,NULL,NULL,'GHN'),(61,75,'PREPARING',NULL,NULL,NULL,'2025-12-13 02:36:42','2025-12-13 02:36:42',NULL,NULL,NULL,NULL,NULL,NULL,'GHN'),(62,76,'PREPARING',NULL,NULL,NULL,'2025-12-13 04:13:41','2025-12-13 04:13:41',NULL,NULL,NULL,NULL,NULL,NULL,'GHN'),(63,77,'PREPARING',NULL,NULL,NULL,'2025-12-13 05:10:35','2025-12-13 05:10:35',NULL,NULL,NULL,NULL,NULL,NULL,'GHN'),(64,78,'PREPARING',NULL,NULL,NULL,'2025-12-13 06:51:49','2025-12-13 06:51:49',NULL,NULL,NULL,NULL,NULL,NULL,'GHN'),(65,79,'PREPARING',NULL,NULL,NULL,'2025-12-13 07:16:34','2025-12-13 07:16:34',NULL,NULL,NULL,NULL,NULL,NULL,'GHN'),(66,80,'PREPARING',NULL,NULL,NULL,'2025-12-13 08:03:16','2025-12-13 08:03:16',NULL,NULL,NULL,NULL,NULL,NULL,'GHN');
/*!40000 ALTER TABLE `shipments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `shipping_addresses`
--

DROP TABLE IF EXISTS `shipping_addresses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `shipping_addresses` (
  `id_shipping_address` int NOT NULL AUTO_INCREMENT,
  `id_customer` int NOT NULL,
  `recipient_name` varchar(255) NOT NULL,
  `phone_number` varchar(20) NOT NULL,
  `address` text NOT NULL,
  `is_default` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `province_id` int DEFAULT NULL COMMENT 'ID tỉnh/thành phố từ GHN API',
  `district_id` int DEFAULT NULL COMMENT 'ID quận/huyện từ GHN API',
  `ward_code` varchar(50) DEFAULT NULL COMMENT 'Code phường/xã từ GHN API',
  PRIMARY KEY (`id_shipping_address`),
  KEY `idx_shipping_addresses_customer` (`id_customer`),
  KEY `idx_shipping_addresses_province` (`province_id`),
  KEY `idx_shipping_addresses_district` (`district_id`),
  CONSTRAINT `fk_shipping_addresses_customer` FOREIGN KEY (`id_customer`) REFERENCES `customers` (`id_customer`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shipping_addresses`
--

LOCK TABLES `shipping_addresses` WRITE;
/*!40000 ALTER TABLE `shipping_addresses` DISABLE KEYS */;
INSERT INTO `shipping_addresses` VALUES (3,7,'Ngọc Hải','0123656789','Láng, Hà Nội',0,'2025-11-10 05:20:39','2025-11-21 03:05:46',NULL,NULL,NULL),(4,9,'Ngọc Hải','0123654789','Láng, Hà Nội',1,'2025-11-11 00:19:24','2025-11-11 00:19:24',NULL,NULL,NULL),(8,7,'hải','0324543234','159 phùng khoang',0,'2025-11-21 03:11:44','2025-11-21 04:21:48',201,3440,'13009'),(9,7,'hải','0743852573','xóm 3',1,'2025-11-21 04:21:48','2025-11-21 04:21:48',231,1840,'251008'),(10,5,'chung','0344535249','159 phùng khong',1,'2025-11-21 08:55:22','2025-11-21 08:55:22',201,3440,'13009'),(11,18,'minh quân','0934612452','ngõ 159 phùng khoang',1,'2025-12-12 19:35:44','2025-12-12 19:36:23',210,1787,'400403');
/*!40000 ALTER TABLE `shipping_addresses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `suppliers`
--

DROP TABLE IF EXISTS `suppliers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `suppliers` (
  `id_supplier` int NOT NULL AUTO_INCREMENT,
  `supplier_name` varchar(255) NOT NULL,
  `address` text,
  `phone_number` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_supplier`),
  KEY `idx_suppliers_name` (`supplier_name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `suppliers`
--

LOCK TABLES `suppliers` WRITE;
/*!40000 ALTER TABLE `suppliers` DISABLE KEYS */;
INSERT INTO `suppliers` VALUES (1,'Apple Inc.','1 Apple Park Way, Cupertino, CA 95014, USA','+1-408-996-1010','contact@apple.com','2025-11-08 16:29:33','2025-11-08 16:29:33'),(2,'Samsung Electronics','129 Samsung-ro, Yeongtong-gu, Suwon, Gyeonggi-do, South Korea','+82-2-2053-3000','contact@samsung.com','2025-11-08 16:29:33','2025-11-08 16:29:33'),(3,'Xiaomi Corporation','Wangjing Science and Technology Park, Beijing, China','+86-10-6060-6888','contact@mi.com','2025-11-08 16:29:33','2025-11-08 16:29:33'),(4,'HP Inc.','1501 Page Mill Rd, Palo Alto, CA 94304, USA','+1-650-857-1501','contact@hp.com','2025-11-08 16:29:33','2025-11-08 16:29:33'),(5,'Dell Technologies','One Dell Way, Round Rock, TX 78682, USA','+1-512-338-4400','contact@dell.com','2025-11-08 16:29:33','2025-11-08 16:29:33'),(6,'OPPO',NULL,'0451278327','oppo@gmail.com','2025-12-12 19:29:10','2025-12-13 02:29:10');
/*!40000 ALTER TABLE `suppliers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `system_settings`
--

DROP TABLE IF EXISTS `system_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `system_settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `setting_key` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `setting_value` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `setting_key` (`setting_key`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_settings`
--

LOCK TABLES `system_settings` WRITE;
/*!40000 ALTER TABLE `system_settings` DISABLE KEYS */;
INSERT INTO `system_settings` VALUES (1,'RETURN_WINDOW_DAYS','7','Số ngày cho phép khách hàng yêu cầu đổi/trả hàng sau khi nhận hàng','2025-12-17 10:04:52'),(2,'REVIEW_EDIT_WINDOW_HOURS','12','Số giờ cho phép khách hàng chỉnh sửa đánh giá sau khi tạo','2025-12-11 04:32:46');
/*!40000 ALTER TABLE `system_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id_user` int NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL COMMENT 'Lưu mật khẩu đã mã hoá (BCrypt/Argon2)',
  `email` varchar(255) NOT NULL,
  `role` enum('ADMIN','EMPLOYEE','CUSTOMER') NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `avatar_url` varchar(500) DEFAULT NULL COMMENT 'URL ảnh đại diện của user',
  PRIMARY KEY (`id_user`),
  UNIQUE KEY `uq_users_username` (`username`),
  UNIQUE KEY `uq_users_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (8,'admin','$2a$12$82TrTe7XpvoKM4PMYIOjVuO956T2C/WV3cXhTgfO53k/sozgW/SA6','admin@gmail.com','ADMIN',1,'2025-11-08 16:35:03','2025-12-12 20:32:24','/uploads/users/dbc2ec23-acee-42dd-8f68-aa54bd29a6f8.png'),(9,'nguyenchung','$2a$12$nhPr2t4hXYSQKJDChAfz/eItm15jjzBz89Vb7yCjhCzsFgMSjVzyG','chung@gmail.com','CUSTOMER',1,'2025-11-09 08:03:36','2025-12-04 11:27:52','/uploads/users/3e5b472b-6c1f-414a-9f07-85c1ebd7cd29.jpg'),(10,'employee_hai','$2a$12$huSH3NelgbaFFEszWm.FwuK6pehIMbacIE3sAfclND1n5rgz8JYXO','employee_hai@gmail.com','EMPLOYEE',1,'2025-11-09 08:10:08','2025-11-09 08:10:08',NULL),(11,'vuhai','$2a$12$phj4lZ2NoDPtro.NpQAn3OgDRS2Yb/7aLHfhefJ9kyLtt96PzgY4i','hai@gmail.com','CUSTOMER',1,'2025-11-10 05:20:39','2025-11-10 05:20:39',NULL),(12,'emp_hai','$2a$12$1F8NzR/VtNDf9lXD2PUG9ugasMQ0a58s54mmRCZEPPOBMFExoEw4C','emp_hai@gmail.com','EMPLOYEE',1,'2025-11-10 05:21:17','2025-11-11 22:40:13','/uploads/users/a0e338e1-b113-4918-8b73-ce2a1e4f0a59.png'),(14,'haik63','$2a$12$jbnvpUikMynouSLGPkMje.KrbYbX3WzThhhe86ikqEeqikVcs9lcK','haik63@gmail.com','CUSTOMER',1,'2025-11-11 00:19:24','2025-11-11 00:19:24',NULL),(15,'emp_vhai','$2a$12$AYtcoSxsfUbwUWwH3iMd3u4I6uzsIJ9Kblp5J/BTbh6c02C4Eoam6','emp_vhai@gmail.com','EMPLOYEE',1,'2025-11-11 00:32:45','2025-11-11 00:32:45',NULL),(17,'vungochai','$2a$12$Q/a/MFDwlBfMPX4g3q/VUOq5fMvVFOZpsKg/cV7heayEfLDR5cVC2','vungochai@gmail.com','CUSTOMER',1,'2025-11-18 20:53:00','2025-11-18 20:53:00',NULL),(18,'doandat','$2a$12$bb3LxA9zBU6k8raRGfraaeyN7mMg/TyepTtvrAu72GB4y4cjVCvJi','doandat202@gmail.com','CUSTOMER',1,'2025-11-19 08:07:52','2025-11-19 08:07:52',NULL),(19,'minhduc','$2a$12$x0ucMlxwVDiLUz0rRQ8hLe7YCI47SKuVylo9iH4nFkT95grak82li','minhduc123@gmail.com','CUSTOMER',1,'2025-11-19 09:46:05','2025-11-19 09:46:05',NULL),(21,'testdk','$2a$12$mDanp2hmgumI1fAGhVkOvOEhRnBOYaqxz87LZ5ZPRP6SNKWKJ84cC','testdk@gmail.com','CUSTOMER',1,'2025-11-20 00:43:17','2025-11-20 00:43:17',NULL),(22,'vanvu','$2a$12$S.4jMyh/YHdzu/iXgyJzouTXebQQ5FWbCg0qod03zzmSLGQasedRi','vanvu@gmail.com','CUSTOMER',1,'2025-11-20 04:39:59','2025-11-20 04:39:59',NULL),(23,'hoangxuan','$2a$12$UMnODFSyqKRdahP7A4N4FuQR5gGrnKPhQr1oVYj246zSMkz1AdCUK','xuan@gmail.com','CUSTOMER',1,'2025-11-21 20:31:53','2025-11-21 20:31:53',NULL),(24,'employee','$2a$12$cBVDf3eMXDT3/LzaY0PTgORod1CWZJ9po4VbBUXXo3JKgu3lvHSXG','minhquan@gmail.com','EMPLOYEE',1,'2025-12-10 22:30:44','2025-12-10 22:30:44',NULL),(26,'minhquan','$2a$12$K2XVJfZQMDKiolaDvj543OXwskZ18WJSvcv09c1zqVfkSl71UR6ny','mquan@gmail.com','CUSTOMER',1,'2025-12-12 19:10:56','2025-12-12 19:10:56',NULL),(27,'haiforgemini','$2a$12$jr6LUXIGEzkWrG.7SbxCH.X040V1EiidG6MchYmVLs8yWDjxSQbme','haiforgemini@gmail.com','EMPLOYEE',1,'2025-12-16 09:42:09','2025-12-16 09:46:10',NULL);
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

-- Dump completed on 2025-12-23  0:06:52
