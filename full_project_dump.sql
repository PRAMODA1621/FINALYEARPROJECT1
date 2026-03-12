-- MySQL dump 10.13  Distrib 8.0.40, for Win64 (x86_64)
--
-- Host: localhost    Database: venus_db
-- ------------------------------------------------------
-- Server version	8.0.40

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `cart`
--

DROP TABLE IF EXISTS `cart`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `session_id` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_cart` (`user_id`),
  CONSTRAINT `cart_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart`
--

LOCK TABLES `cart` WRITE;
/*!40000 ALTER TABLE `cart` DISABLE KEYS */;
INSERT INTO `cart` VALUES (1,12,'dff406e5-9f3b-49f5-a1e1-53cd5acc9baa','2026-03-07 20:12:21','2026-03-07 20:12:21'),(2,15,'15bfa78c-ce41-4671-b3c1-89577bea3e5f','2026-03-08 05:21:48','2026-03-08 05:21:48'),(3,11,'29609241-93f3-4d20-b4bc-5c5013279c46','2026-03-08 05:23:24','2026-03-08 05:23:24'),(4,19,'78455da9-add4-4e56-a3c0-d23b4ad17538','2026-03-08 05:57:39','2026-03-08 05:57:39');
/*!40000 ALTER TABLE `cart` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cart_items`
--

DROP TABLE IF EXISTS `cart_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cart_id` int NOT NULL,
  `product_id` int NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `customization_data` json DEFAULT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `cart_id` (`cart_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `cart_items_ibfk_1` FOREIGN KEY (`cart_id`) REFERENCES `cart` (`id`) ON DELETE CASCADE,
  CONSTRAINT `cart_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=81 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart_items`
--

LOCK TABLES `cart_items` WRITE;
/*!40000 ALTER TABLE `cart_items` DISABLE KEYS */;
INSERT INTO `cart_items` VALUES (43,2,1,1,NULL,1999.00,'2026-03-08 18:54:15','2026-03-08 18:54:15'),(57,2,6,1,NULL,1899.00,'2026-03-09 11:46:18','2026-03-09 11:46:18');
/*!40000 ALTER TABLE `cart_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customization_options`
--

DROP TABLE IF EXISTS `customization_options`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customization_options` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `option_type` enum('text','color','image','select') NOT NULL,
  `option_name` varchar(100) NOT NULL,
  `option_values` json DEFAULT NULL,
  `additional_price` decimal(10,2) DEFAULT '0.00',
  `is_required` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `customization_options_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customization_options`
--

LOCK TABLES `customization_options` WRITE;
/*!40000 ALTER TABLE `customization_options` DISABLE KEYS */;
/*!40000 ALTER TABLE `customization_options` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `helpdesk_tickets`
--

DROP TABLE IF EXISTS `helpdesk_tickets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `helpdesk_tickets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ticket_number` varchar(50) NOT NULL,
  `user_id` int NOT NULL,
  `subject` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `status` enum('open','in_progress','resolved','closed') DEFAULT 'open',
  `priority` enum('low','medium','high','urgent') DEFAULT 'medium',
  `category` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ticket_number` (`ticket_number`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `helpdesk_tickets_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `helpdesk_tickets`
--

LOCK TABLES `helpdesk_tickets` WRITE;
/*!40000 ALTER TABLE `helpdesk_tickets` DISABLE KEYS */;
INSERT INTO `helpdesk_tickets` VALUES (1,'TKT-1772945262449-3fb7',12,'sdfsd','sfddf','open','medium','General','2026-03-08 04:47:42','2026-03-08 04:47:42'),(2,'TKT-1772986248221-5577',19,'sdf','sdfsdf','open','medium','General','2026-03-08 16:10:48','2026-03-08 16:10:48'),(3,'TKT-1772995986442-0664',15,'woief','asfs','open','medium','General','2026-03-08 18:53:06','2026-03-08 18:53:06'),(4,'TKT-1773077183826-b311',19,',mkl;','l,,','open','medium','General','2026-03-09 17:26:23','2026-03-09 17:26:23'),(5,'TKT-1773114025114-a20f',19,'sdc','asxcx','open','medium','General','2026-03-10 03:40:25','2026-03-10 03:40:25');
/*!40000 ALTER TABLE `helpdesk_tickets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `product_id` int NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `quantity` int NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `customization_data` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (1,1,4,'Wooden Pen Stand',1,699.00,NULL,'2026-03-07 20:15:12'),(2,2,1,'Engraved Wooden Name Plate',1,1299.00,NULL,'2026-03-07 20:15:46'),(3,2,2,'Wooden Photo Frame Plaque',1,1499.00,NULL,'2026-03-07 20:15:46'),(4,3,1,'Engraved Wooden Name Plate',1,1299.00,NULL,'2026-03-07 20:21:56'),(5,3,2,'Wooden Photo Frame Plaque',1,1499.00,NULL,'2026-03-07 20:21:56'),(6,4,3,'Wooden Business Card Holder',1,899.00,NULL,'2026-03-07 20:22:48'),(7,5,6,'Acrylic LED Name Plate',1,1899.00,NULL,'2026-03-08 02:51:46'),(8,5,7,'Acrylic Trophy Award',1,1799.00,NULL,'2026-03-08 02:51:46'),(9,6,1,'Engraved Wooden Name Plate',1,1299.00,NULL,'2026-03-08 03:18:21'),(10,7,1,'Engraved Wooden Name Plate',1,1299.00,NULL,'2026-03-08 03:30:26'),(11,7,2,'Wooden Photo Frame Plaque',1,1499.00,NULL,'2026-03-08 03:30:26'),(12,8,3,'Wooden Business Card Holder',1,899.00,NULL,'2026-03-08 03:38:37'),(13,8,2,'Wooden Photo Frame Plaque',1,1499.00,NULL,'2026-03-08 03:38:37'),(14,9,2,'Wooden Photo Frame Plaque',1,1499.00,NULL,'2026-03-08 04:42:26'),(15,9,1,'Engraved Wooden Name Plate',1,1299.00,NULL,'2026-03-08 04:42:26'),(16,10,2,'Wooden Photo Frame Plaque',1,1499.00,NULL,'2026-03-08 05:06:39'),(17,10,1,'Engraved Wooden Name Plate',1,1299.00,NULL,'2026-03-08 05:06:39'),(18,11,2,'Wooden Photo Frame Plaque',1,1499.00,NULL,'2026-03-08 05:41:18'),(19,11,3,'Wooden Business Card Holder',1,899.00,NULL,'2026-03-08 05:41:18'),(20,12,3,'Wooden Business Card Holder',1,899.00,NULL,'2026-03-08 06:25:07'),(21,13,3,'Wooden Business Card Holder',1,899.00,NULL,'2026-03-08 06:25:44'),(22,13,1,'Engraved Wooden Name Plate',1,1299.00,NULL,'2026-03-08 06:25:44'),(23,13,2,'Wooden Photo Frame Plaque',1,1499.00,NULL,'2026-03-08 06:25:44'),(24,14,2,'Wooden Photo Frame Plaque',1,1499.00,NULL,'2026-03-08 11:48:40'),(25,14,3,'Wooden Business Card Holder',1,899.00,NULL,'2026-03-08 11:48:40'),(26,15,1,'Engraved Wooden Name Plate',1,1299.00,NULL,'2026-03-08 16:10:20'),(27,15,2,'Wooden Photo Frame Plaque',1,1499.00,NULL,'2026-03-08 16:10:20'),(28,16,1,'Engraved Wooden Name Plate',1,1299.00,NULL,'2026-03-08 17:00:45'),(29,17,7,'Acrylic Trophy Award',1,1799.00,NULL,'2026-03-08 18:51:59'),(30,17,1,'Engraved Wooden Name Plate',4,1999.00,NULL,'2026-03-08 18:51:59'),(31,18,1,'Engraved Wooden Name Plate',1,1299.00,NULL,'2026-03-09 11:13:09'),(32,18,36,'Custom Gift',1,1999.00,NULL,'2026-03-09 11:13:09'),(33,19,1,'Engraved Wooden Name Plate',2,1299.00,NULL,'2026-03-09 17:25:46'),(34,20,7,'Acrylic Trophy Award',1,1799.00,NULL,'2026-03-10 03:40:01'),(35,20,2,'Wooden Photo Frame Plaque',1,1499.00,NULL,'2026-03-10 03:40:01'),(36,21,1,'Engraved Wooden Name Plate',2,1299.00,NULL,'2026-03-10 12:58:06'),(37,21,2,'Wooden Photo Frame Plaque',1,1499.00,NULL,'2026-03-10 12:58:06'),(38,22,2,'Wooden Photo Frame Plaque',2,1499.00,NULL,'2026-03-10 13:04:03'),(39,23,2,'Wooden Photo Frame Plaque',2,1499.00,NULL,'2026-03-10 13:25:16'),(40,23,7,'Acrylic Trophy Award',1,1799.00,NULL,'2026-03-10 13:25:16'),(41,24,2,'Wooden Photo Frame Plaque',3,1499.00,NULL,'2026-03-11 03:10:54');
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_number` varchar(50) NOT NULL,
  `user_id` int NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `tax_amount` decimal(10,2) DEFAULT '0.00',
  `shipping_amount` decimal(10,2) DEFAULT '0.00',
  `discount_amount` decimal(10,2) DEFAULT '0.00',
  `payment_method` enum('card','upi','cod') NOT NULL,
  `payment_status` enum('pending','completed','failed','refunded') DEFAULT 'pending',
  `order_status` enum('pending','processing','shipped','delivered','cancelled') DEFAULT 'pending',
  `shipping_address` text NOT NULL,
  `billing_address` text,
  `phone` varchar(20) NOT NULL,
  `email` varchar(255) NOT NULL,
  `notes` text,
  `customization_data` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_number` (`order_number`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,'ORD-1772914512432-9dd77b',12,699.00,699.00,0.00,0.00,0.00,'upi','pending','pending','14th Cross,Chandralayout\n#1621, Bengaluru, Karnataka - 560072',NULL,'09742983552','nppramodaofficial@gmail.com',NULL,NULL,'2026-03-07 20:15:12','2026-03-07 20:15:12'),(2,'ORD-1772914546889-cfd5b8',12,2798.00,2798.00,0.00,0.00,0.00,'upi','pending','pending','14th Cross,Chandralayout\n#1621, Bengaluru, Karnataka - 560072',NULL,'09742983552','nppramodaofficial@gmail.com',NULL,NULL,'2026-03-07 20:15:46','2026-03-07 20:15:46'),(3,'ORD-1772914916595-2a4cb3',12,2798.00,2798.00,0.00,0.00,0.00,'cod','pending','pending','14th Cross,Chandralayout\n#1621, Bengaluru, Karnataka - 560072',NULL,'09742983552','nppramodaofficial@gmail.com',NULL,NULL,'2026-03-07 20:21:56','2026-03-07 20:21:56'),(4,'ORD-1772914968455-3423c6',12,899.00,899.00,0.00,0.00,0.00,'cod','pending','pending','14th Cross,Chandralayout\n#1621, Bengaluru, Karnataka - 560072',NULL,'09742983552','nppramodaofficial@gmail.com',NULL,NULL,'2026-03-07 20:22:48','2026-03-07 20:22:48'),(5,'ORD-1772938306316-a89475',12,3698.00,3698.00,0.00,0.00,0.00,'upi','pending','pending','14th Cross,Chandralayout\n#1621, Bengaluru, Karnataka - 560072',NULL,'09742983552','nppramodaofficial@gmail.com',NULL,NULL,'2026-03-08 02:51:46','2026-03-08 02:51:46'),(6,'ORD-1772939901729-d1aed8',12,1299.00,1299.00,0.00,0.00,0.00,'cod','pending','shipped','14th Cross,Chandralayout\n#1621, Bengaluru, Karnataka - 560072',NULL,'09742983552','nppramodaofficial@gmail.com',NULL,NULL,'2026-03-08 03:18:21','2026-03-10 13:07:07'),(7,'ORD-1772940626960-15d1b7',12,2798.00,2798.00,0.00,0.00,0.00,'cod','pending','shipped','14th Cross,Chandralayout\n#1621, Bengaluru, Karnataka - 560072',NULL,'09742983552','nppramodaofficial@gmail.com',NULL,NULL,'2026-03-08 03:30:26','2026-03-10 13:07:04'),(8,'ORD-1772941117363-42013c',12,2398.00,2398.00,0.00,0.00,0.00,'upi','pending','delivered','14th Cross,Chandralayout\n#1621, Bengaluru, Karnataka - 560072',NULL,'09742983552','nppramodaofficial@gmail.com',NULL,NULL,'2026-03-08 03:38:37','2026-03-10 12:52:58'),(9,'ORD-1772944946387-2216e7',12,2798.00,2798.00,0.00,0.00,0.00,'cod','pending','processing','14th Cross,Chandralayout\n#1621, Bengaluru, Karnataka - 560072',NULL,'09742983552','nppramodaofficial@gmail.com',NULL,NULL,'2026-03-08 04:42:26','2026-03-08 05:21:58'),(10,'ORD-1772946399146-f9c73e',12,2798.00,2798.00,0.00,0.00,0.00,'upi','pending','delivered','14th Cross,Chandralayout\n#1621, Bengaluru, Karnataka - 560072',NULL,'09742983552','nppramodaofficial@gmail.com',NULL,NULL,'2026-03-08 05:06:39','2026-03-10 12:52:56'),(11,'ORD-1772948478222-8a2cd3',11,2398.00,2398.00,0.00,0.00,0.00,'upi','pending','delivered','14th Cross,Chandralayout\n#1621, Bengaluru, Karnataka - 560072',NULL,'9876543210','user@venus.com',NULL,NULL,'2026-03-08 05:41:18','2026-03-10 12:53:02'),(12,'ORD-1772951107771-744f62',19,899.00,899.00,0.00,0.00,0.00,'upi','pending','delivered','14th Cross,Chandralayout\n#1621, Bengaluru, Karnataka - 560072',NULL,'09742983552','pramodakrishna108@gmail.com',NULL,NULL,'2026-03-08 06:25:07','2026-03-10 12:52:54'),(13,'ORD-1772951144772-a8d24d',19,3697.00,3697.00,0.00,0.00,0.00,'cod','pending','delivered','14th Cross,Chandralayout\n#1621, Bengaluru, Karnataka - 560072',NULL,'09742983552','pramodakrishna108@gmail.com',NULL,NULL,'2026-03-08 06:25:44','2026-03-10 12:52:51'),(14,'ORD-1772970520093-231927',19,2398.00,2398.00,0.00,0.00,0.00,'upi','pending','delivered','14th Cross,Chandralayout\n#1621, Bengaluru, Karnataka - 560072',NULL,'09742983552','pramodakrishna108@gmail.com',NULL,NULL,'2026-03-08 11:48:40','2026-03-10 12:52:50'),(15,'ORD-1772986220691-614d45',19,2798.00,2798.00,0.00,0.00,0.00,'cod','pending','delivered','14th Cross,Chandralayout\n#1621, Bengaluru, Karnataka - 560072',NULL,'09742983552','pramodakrishna108@gmail.com',NULL,NULL,'2026-03-08 16:10:20','2026-03-10 12:52:47'),(16,'ORD-1772989245324-dab1fc',11,1299.00,1299.00,0.00,0.00,0.00,'upi','pending','delivered','14th Cross,Chandralayout\n#1621, Bengaluru, Karnataka - 560072',NULL,'9876543210','user@venus.com',NULL,NULL,'2026-03-08 17:00:45','2026-03-10 12:52:46'),(17,'ORD-1772995919362-18ebb0',11,9795.00,9795.00,0.00,0.00,0.00,'upi','pending','delivered','14th Cross,Chandralayout\n#1621, Bengaluru, Karnataka - 560072',NULL,'9876543210','user@venus.com',NULL,NULL,'2026-03-08 18:51:59','2026-03-10 12:52:44'),(18,'ORD-1773054789742-971cc3',11,3298.00,3298.00,0.00,0.00,0.00,'cod','pending','delivered','14th Cross,Chandralayout\n#1621, Bengaluru, Karnataka - 560072',NULL,'9876543210','user@venus.com',NULL,NULL,'2026-03-09 11:13:09','2026-03-09 17:27:09'),(19,'ORD-1773077146549-0dcd07',19,2598.00,2598.00,0.00,0.00,0.00,'cod','pending','shipped','14th Cross,Chandralayout\n#1621, Bengaluru, Karnataka - 560072',NULL,'09742983552','pramodakrishna108@gmail.com',NULL,NULL,'2026-03-09 17:25:46','2026-03-09 17:27:06'),(20,'ORD-1773114001993-fe1bb6',19,3298.00,3298.00,0.00,0.00,0.00,'upi','pending','pending','14th Cross,Chandralayout\n#1621, Bengaluru, Karnataka - 560072',NULL,'09742983552','pramodakrishna108@gmail.com',NULL,NULL,'2026-03-10 03:40:01','2026-03-10 03:40:01'),(21,'ORD-1773147486741-2069b7',19,4097.00,4097.00,0.00,0.00,0.00,'upi','pending','delivered','14th Cross,Chandralayout, Bengaluru, Karnataka - 560072',NULL,'09742983552','pramodakrishna108@gmail.com',NULL,NULL,'2026-03-10 12:58:06','2026-03-11 02:27:06'),(22,'ORD-1773147843885-5dc0a4',19,2998.00,2998.00,0.00,0.00,0.00,'upi','pending','delivered','14th Cross,Chandralayout\n#1621, Bengaluru, Karnataka - 560072',NULL,'09742983552','pramodakrishna108@gmail.com',NULL,NULL,'2026-03-10 13:04:03','2026-03-10 13:26:29'),(23,'ORD-1773149116852-0c84b6',19,4797.00,4797.00,0.00,0.00,0.00,'upi','pending','delivered','14th Cross,Chandralayout\n#1621, Bengaluru, Karnataka - 560072',NULL,'09742983552','pramodakrishna108@gmail.com',NULL,NULL,'2026-03-10 13:25:16','2026-03-10 13:26:35'),(24,'ORD-1773198654616-9a7ca7',19,4497.00,4497.00,0.00,0.00,0.00,'upi','pending','pending','14th Cross,Chandralayout\n#1621, Bengaluru, Karnataka - 560072',NULL,'09742983552','pramodakrishna108@gmail.com',NULL,NULL,'2026-03-11 03:10:54','2026-03-11 03:10:54');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_reviews`
--

DROP TABLE IF EXISTS `product_reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_reviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `user_id` int NOT NULL,
  `rating` int NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `comment` text,
  `is_verified_purchase` tinyint(1) DEFAULT '0',
  `is_approved` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_product_id` (`product_id`),
  KEY `idx_user_id` (`user_id`),
  CONSTRAINT `product_reviews_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `product_reviews_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `product_reviews_chk_1` CHECK (((`rating` >= 1) and (`rating` <= 5)))
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_reviews`
--

LOCK TABLES `product_reviews` WRITE;
/*!40000 ALTER TABLE `product_reviews` DISABLE KEYS */;
INSERT INTO `product_reviews` VALUES (1,2,19,5,'It was good','IT was very durable\n',0,1,'2026-03-10 10:23:14','2026-03-10 10:23:26'),(2,2,11,5,'IT was superb','I liked the design and texture',0,1,'2026-03-10 10:24:03','2026-03-10 10:24:03'),(3,7,19,5,'BEST!!!!!!!!!!!','It is a good product with good texture\n',0,1,'2026-03-10 10:44:34','2026-03-10 10:44:34'),(4,4,19,5,'good','quality product\n',0,1,'2026-03-11 02:19:43','2026-03-11 02:19:43'),(5,4,11,5,'Good','Nice Product',0,1,'2026-03-11 02:20:35','2026-03-11 02:20:35');
/*!40000 ALTER TABLE `product_reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  `category` varchar(100) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `stock` int NOT NULL DEFAULT '0',
  `image_url` varchar(500) DEFAULT NULL,
  `is_featured` tinyint(1) DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_custom` tinyint DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'Engraved Wooden Name Plate','Premium teak wood name plate with laser engraving. Perfect for office desks and executive cabins. Customize with name, designation, and company logo.','Wooden',1299.00,67,'/images/wooden/wooden-name-plate.jpg',1,1,'2026-03-07 14:23:39','2026-03-10 12:58:06',0),(2,'Wooden Photo Frame Plaque','Handcrafted wooden photo frame with engraved message. Perfect for farewell gifts and employee recognition.','Wooden',1499.00,41,'/images/wooden/photo-frame.jpg',0,1,'2026-03-07 14:23:39','2026-03-11 03:10:54',0),(3,'Wooden Business Card Holder','Handcrafted wooden business card holder with engraved company logo. Holds 20-25 cards.','Wooden',899.00,69,'/images/wooden/card-holder.jpg',0,1,'2026-03-07 14:23:39','2026-03-08 11:48:40',0),(4,'Wooden Pen Stand','Elegant wooden pen stand with laser engraved base. Perfect for office desks.','Wooden',699.00,99,'/images/wooden/pen-stand.jpg',0,1,'2026-03-07 14:23:39','2026-03-07 20:15:12',0),(5,'Wooden Award Plaque','Premium wooden award plaque with metal inscription plate. Ideal for employee recognition.','Wooden',1999.00,40,'/images/wooden/award-plaque.jpg',1,1,'2026-03-07 14:23:39','2026-03-07 14:23:39',0),(6,'Acrylic LED Name Plate','Modern acrylic name plate with energy-efficient LED backlighting. Touch-sensitive on/off switch.','Acrylic',1899.00,44,'/images/acrylic/acrylic-frame.jpg',1,1,'2026-03-07 14:23:39','2026-03-08 18:49:50',0),(7,'Acrylic Trophy Award','Modern acrylic trophy for corporate competitions. Clear acrylic with colored base.','Acrylic',1799.00,46,'/images/acrylic/acrylic-trophy.jpg',1,1,'2026-03-07 14:23:39','2026-03-10 13:25:16',0),(8,'Acrylic Paper Weight','Clear acrylic paper weight with 3D laser engraved logo inside.','Acrylic',599.00,100,'/images/acrylic/acrylic-standee.jpg',0,1,'2026-03-07 14:23:39','2026-03-08 18:49:50',0),(9,'Acrylic Plaque','Crystal clear acrylic plaque with engraved text. Perfect for service awards.','Acrylic',1299.00,65,'/images/acrylic/acrylic-award.jpg',0,1,'2026-03-07 14:23:39','2026-03-08 18:49:50',0),(10,'Acrylic Desk Sign','Elegant acrylic desk sign with custom engraved text. Ideal for reception areas.','Acrylic',999.00,80,'/images/acrylic/acrylic-desk-item.jpg',0,1,'2026-03-07 14:23:39','2026-03-08 18:49:50',0),(11,'Metal Engraved Pen','Stainless steel executive pen with precision laser engraving. Smooth ink flow. Gift box included.','Metal',799.00,120,'/images/metal/engraved-pen.jpg',1,1,'2026-03-07 14:23:39','2026-03-07 14:23:39',0),(12,'Metal Keychain','Stainless steel keychain with laser engraving. Perfect for corporate giveaways.','Metal',399.00,200,'/images/metal/metal-trophy.jpg',0,1,'2026-03-07 14:23:39','2026-03-08 18:49:50',0),(13,'Corporate Desk Clock','Elegant desk clock with brushed metal frame and silent quartz movement. Engraving plate included.','Metal',1899.00,45,'/images/metal/metal-shield.jpg',1,1,'2026-03-07 14:23:39','2026-03-08 18:49:50',0),(14,'Metal Business Card Case','Premium stainless steel business card case with laser engraved logo. Slim pocket design.','Metal',699.00,85,'/images/metal/metal-memento.jpg',0,1,'2026-03-07 14:23:39','2026-03-08 18:49:50',0),(15,'Metal Letter Opener','Stainless steel letter opener with engraved handle. Classic corporate gift.','Metal',499.00,150,'/images/metal/metal-plate.jpg',0,1,'2026-03-07 14:23:39','2026-03-08 18:49:50',0),(16,'Metal Money Clip','Slim stainless steel money clip with laser engraving. Holds bills and cards securely.','Metal',449.00,175,'/images/metal/money-clip.jpg',0,1,'2026-03-07 14:23:39','2026-03-07 14:23:39',0),(17,'Metal Bookmark','Elegant stainless steel bookmark with engraved message. Great corporate gift.','Metal',299.00,250,'/images/metal/bookmark.jpg',0,1,'2026-03-07 14:23:39','2026-03-07 14:23:39',0),(18,'Crystal Corporate Award','Premium crystal award trophy for recognition ceremonies. Optical crystal with laser engraved text. Wooden base included.','Crystal',2499.00,35,'/images/crystal/crystal-award.jpg',1,1,'2026-03-07 14:23:39','2026-03-07 14:23:39',0),(19,'Crystal Paper Weight','Optical crystal paper weight with laser engraved message. Classic executive gift.','Crystal',1299.00,55,'/images/crystal/paper-weight.jpg',1,1,'2026-03-07 14:23:39','2026-03-07 14:23:39',0),(20,'Crystal Star Award','Stunning crystal star award for excellence recognition. Laser engraved text.','Crystal',2199.00,30,'/images/crystal/star-award.jpg',1,1,'2026-03-07 14:23:39','2026-03-07 14:23:39',0),(21,'Crystal Globe Award','Elegant crystal globe award for international business achievements. Engraved base.','Crystal',3299.00,20,'/images/crystal/globe-award.jpg',1,1,'2026-03-07 14:23:39','2026-03-07 14:23:39',0),(22,'Crystal Pyramid Award','Modern crystal pyramid award with engraved text. Perfect for innovation awards.','Crystal',1899.00,40,'/images/crystal/pyramid-award.jpg',0,1,'2026-03-07 14:23:39','2026-03-07 14:23:39',0),(23,'Corporate Gift Combo','Complete corporate gifting solution including engraved metal pen, premium leather diary, and custom metal keychain. Branded gift box.','Corporate Gifts',2999.00,40,'/images/gifts/corporate-gift-box.jpg',1,1,'2026-03-07 14:23:39','2026-03-08 18:49:50',0),(24,'Customized Coffee Mug','Premium ceramic coffee mug with full-color logo printing. Dishwasher safe.','Corporate Gifts',349.00,150,'/images/gifts/customized-gift-set.jpg',0,1,'2026-03-07 14:23:39','2026-03-08 18:49:50',0),(25,'Corporate Leather Folder','Premium leather folder with engraved metal name plate. Includes padfolio and business card holder.','Corporate Gifts',2199.00,35,'/images/gifts/premium-gift-pack.jpg',1,1,'2026-03-07 14:23:39','2026-03-08 18:49:50',0),(26,'Executive Gift Set','Luxury gift set including metal pen, leather card holder, and engraved keychain. Premium packaging.','Corporate Gifts',3599.00,25,'/images/gifts/executive-gift.jpg',1,1,'2026-03-07 14:23:39','2026-03-08 18:49:50',0),(27,'Leather Mouse Pad','Premium leather mouse pad with stitched edges and engraved logo. Non-slip backing.','Corporate Gifts',799.00,80,'/images/gifts/desk-gift-item.jpg',0,1,'2026-03-07 14:23:39','2026-03-08 18:49:50',0),(28,'Corporate Diary','Premium leather-bound diary with engraved metal corner. Ribbon bookmark and pen loop.','Corporate Gifts',1299.00,60,'/images/corporate/diary.jpg',0,0,'2026-03-07 14:23:39','2026-03-10 13:06:55',0),(29,'Leather Luggage Tag','Genuine leather luggage tag with engraved metal plate. Includes secure strap.','Corporate Gifts',449.00,120,'/images/corporate/luggage-tag.jpg',0,0,'2026-03-07 14:23:39','2026-03-10 13:06:50',0),(30,'Memento of Gratitude','Beautiful memento to express gratitude and appreciation. Custom engraved message.','Mementos',1499.00,65,'/images/mementos/sports-memento.jpg',0,1,'2026-03-07 14:23:39','2026-03-08 18:49:50',0),(31,'Memento of Service','Elegant memento for years of service recognition. Laser engraved.','Mementos',1899.00,40,'/images/mementos/recognition-memento.jpg',1,1,'2026-03-07 14:23:39','2026-03-08 18:49:50',0),(32,'Marble Base Award','Elegant marble base award with metal plate. Perfect for lifetime achievement.','Marble',3999.00,20,'/images/marble/marble-krishna-idol.jpg',1,1,'2026-03-07 14:23:39','2026-03-08 18:49:50',0),(33,'Marble Paperweight','Elegant marble paperweight with engraved metal plate. Classic desk accessory.','Marble',1299.00,40,'/images/marble/marble-showpiece.jpg',0,1,'2026-03-07 14:23:39','2026-03-08 18:49:50',0),(34,'Marble Plaque','Premium marble plaque with metal inscription. Perfect for corporate awards.','Marble',3299.00,25,'/images/marble/marble-ganesha-idol.jpg',1,1,'2026-03-07 14:23:39','2026-03-08 18:49:50',0),(35,'Custom Gift','Personalized custom gift with your design','Custom',1999.00,9999,'/images/placeholder.jpg',0,0,'2026-03-09 11:01:07','2026-03-09 11:10:31',1),(36,'Custom Gift','Personalized custom gift with your design','Custom',1999.00,9998,'/images/placeholder.jpg',0,0,'2026-03-09 11:01:33','2026-03-09 11:13:09',1);
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `review_helpful`
--

DROP TABLE IF EXISTS `review_helpful`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `review_helpful` (
  `id` int NOT NULL AUTO_INCREMENT,
  `review_id` int NOT NULL,
  `user_id` int NOT NULL,
  `is_helpful` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_review_user` (`review_id`,`user_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `review_helpful_ibfk_1` FOREIGN KEY (`review_id`) REFERENCES `product_reviews` (`id`) ON DELETE CASCADE,
  CONSTRAINT `review_helpful_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `review_helpful`
--

LOCK TABLES `review_helpful` WRITE;
/*!40000 ALTER TABLE `review_helpful` DISABLE KEYS */;
INSERT INTO `review_helpful` VALUES (1,1,11,1,'2026-03-10 10:24:12'),(2,2,11,1,'2026-03-10 10:24:14'),(3,3,19,1,'2026-03-10 10:44:50');
/*!40000 ALTER TABLE `review_helpful` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ticket_responses`
--

DROP TABLE IF EXISTS `ticket_responses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ticket_responses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ticket_id` int NOT NULL,
  `user_id` int NOT NULL,
  `message` text NOT NULL,
  `is_staff_response` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `ticket_id` (`ticket_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `ticket_responses_ibfk_1` FOREIGN KEY (`ticket_id`) REFERENCES `helpdesk_tickets` (`id`) ON DELETE CASCADE,
  CONSTRAINT `ticket_responses_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ticket_responses`
--

LOCK TABLES `ticket_responses` WRITE;
/*!40000 ALTER TABLE `ticket_responses` DISABLE KEYS */;
/*!40000 ALTER TABLE `ticket_responses` ENABLE KEYS */;
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
  `password` varchar(255) DEFAULT NULL,
  `google_id` varchar(255) DEFAULT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `zip_code` varchar(20) DEFAULT NULL,
  `country` varchar(100) DEFAULT 'USA',
  `role` enum('user','admin') DEFAULT 'user',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `last_login` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `google_id` (`google_id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (11,'user@venus.com','User@123',NULL,'John','Doe','9876543210',NULL,NULL,NULL,NULL,'USA','user',1,'2026-03-07 19:44:49','2026-03-11 02:20:14','2026-03-11 02:20:14'),(12,'nppramodaofficial@gmail.com','$2a$10$RMuZhGGCQa0XDgFFFxgo5OqUCLfQVH2zRaw4kOdbCgMHH1Zul6zj.',NULL,'Pramoda','N.P','09742983552',NULL,NULL,NULL,NULL,'USA','user',1,'2026-03-07 20:05:49','2026-03-08 04:47:25','2026-03-08 04:47:25'),(15,'admin@venusenterprises.com','Admin@123',NULL,'Admin','User',NULL,NULL,NULL,NULL,NULL,'USA','admin',1,'2026-03-08 05:20:11','2026-03-11 02:26:47','2026-03-11 02:26:47'),(19,'pramodakrishna108@gmail.com','harekrishna@108',NULL,'Pramoda','N P','09742983552','14th Cross,Chandralayout','Bengaluru','Karnataka','','USA','user',1,'2026-03-08 05:57:39','2026-03-11 03:04:49','2026-03-11 02:27:52');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wishlist`
--

DROP TABLE IF EXISTS `wishlist`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wishlist` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `product_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_product` (`user_id`,`product_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `wishlist_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `wishlist_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wishlist`
--

LOCK TABLES `wishlist` WRITE;
/*!40000 ALTER TABLE `wishlist` DISABLE KEYS */;
INSERT INTO `wishlist` VALUES (6,12,2,'2026-03-08 05:09:16'),(7,12,1,'2026-03-08 05:12:30');
/*!40000 ALTER TABLE `wishlist` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-12 20:24:21
