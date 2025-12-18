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
) ENGINE=InnoDB AUTO_INCREMENT=108 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

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
) ENGINE=InnoDB AUTO_INCREMENT=122 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

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
) ENGINE=InnoDB AUTO_INCREMENT=398 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

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
  CONSTRAINT `fk_products_category` FOREIGN KEY (`id_category`) REFERENCES `categories` (`id_category`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_products_supplier` FOREIGN KEY (`id_supplier`) REFERENCES `suppliers` (`id_supplier`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `products_chk_1` CHECK ((`price` >= 0)),
  CONSTRAINT `products_chk_2` CHECK ((`stock_quantity` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

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
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-18 23:36:04
