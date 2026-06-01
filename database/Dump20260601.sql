-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: localhost    Database: school_db
-- ------------------------------------------------------
-- Server version	8.0.45

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
-- Table structure for table `departments`
--

DROP TABLE IF EXISTS `departments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `departments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `school_id` int NOT NULL,
  `dept_name` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_school_dept` (`school_id`,`dept_name`),
  CONSTRAINT `departments_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `departments`
--

LOCK TABLES `departments` WRITE;
/*!40000 ALTER TABLE `departments` DISABLE KEYS */;
INSERT INTO `departments` VALUES (1,1,'Administration','2026-06-01 05:04:44'),(2,9,'Administration','2026-06-01 05:04:44'),(3,9,'Techonology','2026-06-01 05:04:44'),(4,9,'Academic','2026-06-01 05:04:44'),(5,10,'Administration','2026-06-01 05:04:44'),(6,11,'Administration','2026-06-01 05:04:44'),(7,13,'Administration','2026-06-01 05:04:44'),(10,9,'Admission','2026-06-01 09:12:13'),(13,1,'Academic','2026-06-01 10:03:53');
/*!40000 ALTER TABLE `departments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `role_name` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `role_name` (`role_name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (2,'school_admin'),(3,'staff_member'),(1,'super_admin');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `salaries`
--

DROP TABLE IF EXISTS `salaries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `salaries` (
  `id` int NOT NULL AUTO_INCREMENT,
  `staff_id` int NOT NULL,
  `base_salary` decimal(10,2) NOT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `staff_id` (`staff_id`),
  CONSTRAINT `salaries_ibfk_1` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `salaries`
--

LOCK TABLES `salaries` WRITE;
/*!40000 ALTER TABLE `salaries` DISABLE KEYS */;
INSERT INTO `salaries` VALUES (3,16,62000.00,'2026-05-29 13:42:43'),(4,17,65000.00,'2026-05-29 12:29:26'),(5,15,50000.00,'2026-05-29 12:30:05'),(9,10,40000.00,'2026-05-29 13:01:19'),(10,21,40000.00,'2026-06-01 04:22:40'),(12,24,45000.00,'2026-06-01 09:14:40'),(13,23,40000.00,'2026-06-01 11:13:05');
/*!40000 ALTER TABLE `salaries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for `schools`
--

DROP TABLE IF EXISTS `schools`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `schools` (
  `id` int NOT NULL AUTO_INCREMENT,
  `school_name` varchar(255) NOT NULL,
  `address` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `schools`
--

LOCK TABLES `schools` WRITE;
/*!40000 ALTER TABLE `schools` DISABLE KEYS */;
INSERT INTO `schools` VALUES (1,'demo school','demo address','2026-05-28 06:21:36'),(9,'Random school','random address','2026-05-28 10:50:43'),(10,'Test school','Test address','2026-05-28 13:16:43'),(11,'Greenwood','route-68,greenwood','2026-05-29 07:26:28'),(13,'test school1','test','2026-06-01 04:21:00');
/*!40000 ALTER TABLE `schools` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff`
--

DROP TABLE IF EXISTS `staff`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff` (
  `id` int NOT NULL AUTO_INCREMENT,
  `school_id` int DEFAULT NULL,
  `role_id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `invitation_token` varchar(255) DEFAULT NULL,
  `department_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `school_id` (`school_id`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `staff_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON DELETE CASCADE,
  CONSTRAINT `staff_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff`
--

LOCK TABLES `staff` WRITE;
/*!40000 ALTER TABLE `staff` DISABLE KEYS */;
INSERT INTO `staff` VALUES (1,NULL,1,'Main Super Admin','super@system.com','$2b$10$hcc.k8qANnN/34p/FDG6BOpxME8XKZE8o30YPFJCJf9iVfWDZExGi','2026-05-27 12:32:21',NULL,NULL),(2,1,2,'demo','demo@gmail.com','$2b$10$57pMHnadstjKmMVnhsIe/ekJeMr3fgFRsOMQn35HyXMnDMCi82VpK','2026-05-28 06:21:36',NULL,1),(10,9,2,'random','random@gmail.com','$2b$10$VdK3b6lNC1akf0kb/u440.lolW8yWcHZJ.xcesMIl0f7.Uic3Q9xC','2026-05-28 10:50:43',NULL,2),(11,10,2,'Test','test@gmail.com','$2b$10$APVtzzsjnVDBIuUXyLUQh.q5eAGNEB3x13sy7h5uOpS9/1ihjeIFC','2026-05-28 13:16:43',NULL,5),(14,11,2,'admin','admin@gmail.com','$2b$10$rywwletPtsRfCTskaX4TsOA5xjj4oRnsIiijgTW931Jnh6nF2kBoS','2026-05-29 07:26:28',NULL,6),(15,9,3,'Professor','prof@gmail.com',NULL,'2026-05-29 11:55:14',NULL,3),(16,9,3,'demo name','prof1@gmail.com',NULL,'2026-05-29 12:16:08',NULL,4),(17,9,3,'demo1','prof123@gmail.com',NULL,'2026-05-29 12:16:37',NULL,4),(21,13,2,'test school 1','test1@school.com','$2b$10$x.93X7yeXTVtuf3u2RMOOumDx/Cwnb2oBxo4vFTFXJaHJf8ePUNRO','2026-06-01 04:21:00',NULL,7),(23,9,3,'Prof','prof1234@gmail.com',NULL,'2026-06-01 06:31:05',NULL,3),(24,9,3,'prof1','prof2@gmail.com',NULL,'2026-06-01 09:01:32',NULL,4);
/*!40000 ALTER TABLE `staff` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'school_db'
--
/*!50003 DROP PROCEDURE IF EXISTS `sp_ActivateSchoolAdmin` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_ActivateSchoolAdmin`(
	IN p_token VARCHAR(255),
    IN p_hashed_password VARCHAR(255)
)
BEGIN
	 -- Check if a matching token exists
    IF NOT EXISTS (SELECT id FROM staff WHERE invitation_token = p_token) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid or expired invitation token.';
    END IF;
    
    -- update password and remove token
	 UPDATE staff 
    SET password = p_hashed_password, 
        invitation_token = NULL 
    WHERE invitation_token = p_token;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_AddDepartment` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_AddDepartment`(
    IN p_school_id INT,
    IN p_dept_name VARCHAR(100)
)
BEGIN
    IF EXISTS (SELECT 1 FROM departments WHERE school_id = p_school_id AND dept_name = p_dept_name) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'This department already exists in your institution.';
    END IF;

    INSERT INTO departments (school_id, dept_name) VALUES (p_school_id, p_dept_name);
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_AddStaffMember` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_AddStaffMember`(
	IN p_school_id INT,
    IN P_role_id INT,
    IN p_department_id INT,
    IN p_name VARCHAR(100),
    IN p_email VARCHAR(100)
)
BEGIN
 DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
		SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Transaction failed: Unable to commit staff record to database.';
    END;
    
    -- chech if target school entity exists
    IF NOT EXISTS (SELECT 1 FROM schools WHERE id = p_school_id) THEN
		SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Target school entity does not exist';
	END IF;
    
    -- check if role exists
    IF NOT EXISTS (SELECT 1 FROM roles WHERE id = p_role_id) THEN
		SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Specified role does not exist';
	END IF;
    
    -- check if department exists
    IF NOT EXISTS (SELECT 1 FROM departments WHERE id = p_department_id AND school_id = p_school_id) THEN
		SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Selected department does not exist';
	END IF;
    
    -- check if email already exists
    IF EXISTS ( SELECT 1 FROM staff WHERE email = p_email) THEN
		SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'A user with this email address is already registered.';
	END IF;
    
    START TRANSACTION;
    
    INSERT INTO staff (school_id,role_id,department_id,name,email,password,created_at)
    VALUES (p_school_id,p_role_id,p_department_id,p_name,p_email,NULL,NOW());
    
    COMMIT;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_AddStaffSalary` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_AddStaffSalary`(
	IN p_school_id INT,
    IN p_staff_id INT,
    IN p_base_salary DECIMAL(10,2)
)
BEGIN 
	DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
		ROLLBACK;
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Transaction failed: Unable to register staff salary record.';
	END;
    
    -- verify staff member belongs to that school
    IF NOT EXISTS (SELECT 1 FROM staff WHERE id = p_staff_id AND school_id = p_school_id) THEN
		SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Staff member not found in your institution.';
	END IF;
    
    -- verify if salary record already exists
    IF EXISTS (SELECT 1 FROM salaries WHERE id = p_staff_id) THEN 
		SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Salary record for this staff member already exists.';
	END IF;
    
    START TRANSACTION;
		INSERT INTO salaries (staff_id, base_salary, updated_at)
        VALUES (p_staff_id, p_base_salary, NOW());
    COMMIT;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_CreateSchoolAndAdmin` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_CreateSchoolAndAdmin`(
	IN p_school_name VARCHAR(255),
    IN p_address TEXT,
    IN p_admin_name VARCHAR(100),
    IN p_admin_email VARCHAR (100),
    IN p_invitation_token VARCHAR (255)
)
BEGIN
	DECLARE new_school_id INT ;
    DECLARE admin_role_id INT ;
    
       DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Transaction Failed: Could not create school or invite admin.';
    END;
    
    START TRANSACTION ;
		-- fetch the role assigned to 'school_admin'
        SELECT id INTO admin_role_id FROM roles WHERE role_name = 'school_admin' LIMIT 1;
        
         IF admin_role_id IS NULL THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Configuration Error: school_admin role not initialized.';
        END IF;
        
          -- register the school 
        INSERT INTO schools (school_name, address) 
        VALUES (p_school_name, p_address);
        
        -- Pull the id of the new school
        SET new_school_id = LAST_INSERT_ID();
        
         -- school admin with invitation_token
        INSERT INTO staff (school_id, role_id, name, email, password, department, invitation_token)
        VALUES (new_school_id, admin_role_id, p_admin_name, p_admin_email, NULL, 'Administration', p_invitation_token);
        
    COMMIT ;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_GetAllSchoolAdmins` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_GetAllSchoolAdmins`()
BEGIN
    SELECT 
        s.id AS school_id,
        s.school_name,
        s.address AS school_address,
        s.created_at AS school_created_at,
        st.id AS admin_id,
        st.name AS admin_name,
        st.email AS admin_email,
        st.invitation_token,
        -- If invitation_token is NOT NULL, it means they haven't activated their password yet
        IF(st.password IS NULL, 'Pending Activation', 'Active') AS account_status
    FROM schools s
    LEFT JOIN staff st ON s.id = st.school_id
    LEFT JOIN roles r ON st.role_id = r.id
    WHERE r.role_name = 'school_admin' OR st.role_id IS NULL
    ORDER BY s.created_at DESC;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_GetSchoolDepartments` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_GetSchoolDepartments`(
    IN p_school_id INT
)
BEGIN
    SELECT id AS department_id, dept_name 
    FROM departments 
    WHERE school_id = p_school_id 
    ORDER BY dept_name ASC;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_GetSchoolSalaries` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_GetSchoolSalaries`(
    IN p_school_id INT
)
BEGIN
    SELECT 
        s.id AS staff_id,
        s.name,
        s.email,
        d.dept_name AS department,
        r.role_name,
        COALESCE(sal.base_salary, 0.00) AS base_salary,
        sal.updated_at AS salary_last_updated
    FROM staff s
    INNER JOIN roles r ON s.role_id = r.id
    INNER JOIN departments d ON s.department_id = d.id
    LEFT JOIN salaries sal ON s.id = sal.staff_id
    WHERE s.school_id = p_school_id
    ORDER BY d.dept_name ASC;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_GetStaffByEmail` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_GetStaffByEmail`(
	IN p_email VARCHAR(100)
)
BEGIN  
	SELECT
		s.id,
        s.school_id,
        s.role_id,
        r.role_name,
        s.name,
        s.email,
        s.password
	FROM staff s
    INNER JOIN roles r ON s.role_id = r.id
    WHERE s.email = p_email
    LIMIT 1;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_GetStaffMembers` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_GetStaffMembers`(
	IN p_school_id INT 
)
BEGIN 
	SELECT 
		s.id AS staff_id,
        s.name,
        s.email,
        s.department_id,
        d.dept_name AS department,
        s.role_id,
        r.role_name,
        s.created_at
	FROM staff s
    INNER JOIN  roles r ON s.role_id = r.id
    INNER JOIN departments d ON s.department_id = d.id
    WHERE s.school_id = p_school_id
    ORDER BY s.created_at DESC;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_RemoveDepartment` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_RemoveDepartment`(
	IN p_school_id INT,
    IN p_department_id INT
)
BEGIN
	IF EXISTS (SELECT 1 FROM staff WHERE department_id = p_department_id AND school_id = p_school_id) THEN
		SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Cannot delete department: Staff members are still allocated to it.';
	ELSE
    
		DELETE FROM departments
        WHERE id = p_department_id AND school_id = p_school_id;
	END IF;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_RemoveStaffMember` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_RemoveStaffMember`(
	IN p_school_id INT,
    IN p_staff_id INT
)
BEGIN  
	DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
		ROLLBACK;
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Transaction failed : unable to remove staff record.' ;
    END;
    
    -- Validate record
    IF NOT EXISTS (SELECT 1 FROM staff WHERE id = p_staff_id AND school_id = p_school_id) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Staff record not found or does not belong to your institution.';
    END IF;

    START TRANSACTION;

    DELETE FROM staff 
    WHERE id = p_staff_id AND school_id = p_school_id;

    COMMIT;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_RemoveStaffSalary` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_RemoveStaffSalary`(
	IN p_school_id INT,
    IN p_staff_id INT
)
BEGIN
	DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
		ROLLBACK;
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Transaction failed: Unable to remove staff salary record.';
	END;
    
     -- verify staff member belongs to that school
    IF NOT EXISTS (SELECT 1 FROM staff WHERE id = p_staff_id AND school_id = p_school_id) THEN
		SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Staff member not found in your institution.';
	END IF;
    
    START TRANSACTION;
		DELETE FROM salaries WHERE staff_id = p_Staff_id;
    COMMIT;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_UpdateDepartment` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_UpdateDepartment`(
	IN p_school_id INT,
    IN p_department_id INT,
    IN p_dept_name VARCHAR(255)
)
BEGIN
	UPDATE departments
    SET dept_name = p_dept_name
    WHERE id = p_department_id AND school_id = p_school_id;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_UpdateStaffMember` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_UpdateStaffMember`(
    IN p_school_id INT,
    IN p_staff_id INT,
    IN p_role_id INT,
    IN p_department_id INT,
    IN p_name VARCHAR(100),
    IN p_email VARCHAR(100)
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Transaction failed: Unable to modify staff record.';
    END;

    -- Validate that the target staff member belongs to the admin's school instance
    IF NOT EXISTS (SELECT 1 FROM staff WHERE id = p_staff_id AND school_id = p_school_id) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Staff record not found or does not belong to your institution.';
    END IF;

    -- Validate if the new target role exists
    IF NOT EXISTS (SELECT 1 FROM roles WHERE id = p_role_id) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Specified role  does not exist.';
    END IF;
    
    -- check if department exists
    IF NOT EXISTS (SELECT 1 FROM departments WHERE id = p_department_id AND school_id = p_school_id) THEN
		SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Selected department does not exist';
	END IF;

    -- Validate email uniqueness (excluding the user's current record)
    IF EXISTS (SELECT 1 FROM staff WHERE email = p_email AND id != p_staff_id) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'This email address is already claimed by another user.';
    END IF;

    START TRANSACTION;

    UPDATE staff 
    SET 
        role_id = p_role_id,
		department_id = p_department_id,
        name = p_name,
        email = p_email
    WHERE id = p_staff_id AND school_id = p_school_id;

    COMMIT;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_UpdateStaffSalary` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_UpdateStaffSalary`(
	IN p_school_id INT,
    IN p_staff_id INT,
    IN p_base_salary DECIMAL(10,2)
)
BEGIN 
	DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
		ROLLBACK;
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Transaction failed: Unable to update staff salary record.';
	END;
    
    -- verify staff member belongs to that school
    IF NOT EXISTS (SELECT 1 FROM staff WHERE id = p_staff_id AND school_id = p_school_id) THEN
		SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Staff member not found in your institution.';
	END IF;
    
    START TRANSACTION;
		UPDATE salaries
		SET base_salary = p_base_salary,updated_at = NOW()
        WHERE staff_id = p_staff_id;
    COMMIT;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-01 17:41:04
