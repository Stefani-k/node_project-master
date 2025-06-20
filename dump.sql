-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 20, 2025 at 08:14 PM
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
-- Database: `project_db`
--
DROP DATABASE IF EXISTS `project_db`;
CREATE DATABASE IF NOT EXISTS `project_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `project_db`;

-- --------------------------------------------------------

--
-- Table structure for table `appointments`
--

CREATE TABLE `appointments` (
  `appointment_id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `business_id` int(11) NOT NULL,
  `service_id` int(11) NOT NULL,
  `appointment_datetime` datetime NOT NULL,
  `status` enum('scheduled','completed','cancelled_by_user','cancelled_by_business','no_show') NOT NULL DEFAULT 'scheduled',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `businesses`
--

CREATE TABLE `businesses` (
  `business_id` int(11) NOT NULL,
  `owner_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `phone` varchar(15) DEFAULT NULL,
  `photos` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`photos`)),
  `schedule` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`schedule`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `businesses`
--

INSERT INTO `businesses` (`business_id`, `owner_id`, `name`, `category`, `description`, `location`, `phone`, `photos`, `schedule`, `created_at`) VALUES
(101, 101, 'קפה נועה', 'אוכל וקפה', 'בית קפה שכונתי עם מאפים טריים וקפה איכותי.', 'תל אביב, דיזנגוף 101', '0521234567', '[]', '{\"Sunday-Thursday\": \"07:00-20:00\", \"Friday\": \"07:00-16:00\"}', '2025-06-21 09:00:00'),
(102, 102, 'המוסך של תומר', 'רכב', 'מוסך מורשה לכל סוגי הרכבים, מתמחה ברכבים יפניים.', 'חיפה, דרך העצמאות 50', '0549876543', '[]', '{\"Sunday-Thursday\": \"08:00-17:00\"}', '2025-06-21 09:00:00'),
(103, 103, 'סטודיו לעיצוב יעל', 'שירותים מקצועיים', 'סטודיו לעיצוב גרפי, מיתוג ובניית אתרים.', 'ירושלים, רחוב יפו 30', '0501122334', '[]', '{\"Sunday-Thursday\": \"09:00-18:00\"}', '2025-06-21 09:00:00'),
(104, 104, 'דניאל פיטנס', 'ספורט ובריאות', 'חדר כושר מודרני עם שיעורי סטודיו ואימונים אישיים.', 'באר שבע, רחוב רינגלבלום 25', '0535566778', '[]', '{\"Sunday-Thursday\": \"06:00-23:00\", \"Friday\": \"07:00-17:00\"}', '2025-06-21 09:00:00'),
(105, 105, 'הנגרייה של איתי', 'ריהוט ועיצוב הבית', 'ייצור רהיטים מעץ מלא בהזמנה אישית.', 'רעננה, אחוזה 140', '0588899001', '[]', '{\"Sunday-Thursday\": \"08:00-18:00\"}', '2025-06-21 09:00:00'),
(106, 101, 'חנות הספרים של נועה', 'קניות', 'חנות ספרים עצמאית עם מבחר רחב של ספרות מקור ותרגום.', 'הרצליה, סוקולוב 5', '0527654321', '[]', '{\"Sunday-Thursday\": \"10:00-19:00\", \"Friday\": \"09:00-14:00\"}', '2025-06-21 09:00:00'),
(107, 102, 'הפיצה של תומר', 'מסעדות', 'פיצרייה איטלקית אותנטית עם תנור לבנים.', 'פתח תקווה, רחוב חיים עוזר 15', '0541239876', '[]', '{\"Sunday-Saturday\": \"12:00-23:00\"}', '2025-06-21 09:00:00'),
(108, 103, 'קרמיקה יעל', 'אומנות ופנאי', 'סדנאות קרמיקה וחוגים לכל הגילאים.', 'גבעתיים, כצנלסון 58', '0509988776', '[]', '{\"Sunday-Thursday\": \"10:00-21:00\"}', '2025-06-21 09:00:00'),
(109, 104, 'קליניקת דניאל', 'טיפוח ויופי', 'קליניקה לטיפולי פנים וקוסמטיקה רפואית.', 'אילת, הטיילת המרכזית', '0531112233', '[]', '{\"Sunday-Thursday\": \"09:00-19:00\"}', '2025-06-21 09:00:00'),
(110, 105, 'איתי מחשבים', 'מחשבים וטכנולוגיה', 'מעבדת תיקונים ומכירת מחשבים וציוד היקפי.', 'ראשון לציון, רוטשילד 45', '0584455667', '[]', '{\"Sunday-Thursday\": \"09:00-19:00\", \"Friday\": \"09:00-13:00\"}', '2025-06-21 09:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `review_id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `business_id` int(11) NOT NULL,
  `rating` tinyint(3) UNSIGNED NOT NULL CHECK (`rating` >= 1 and `rating` <= 5),
  `text` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `services`
--

CREATE TABLE `services` (
  `service_id` int(11) NOT NULL,
  `business_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `duration_minutes` int(11) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `services`
--

INSERT INTO `services` (`service_id`, `business_id`, `name`, `price`, `duration_minutes`, `description`, `created_at`) VALUES
(101, 101, 'קפה הפוך', 14.00, 5, 'קפה איכותי עם חלב מוקצף', '2025-06-20 16:33:36'),
(102, 101, 'מאפה שקדים', 16.00, 5, 'קרואסון שקדים טרי מהתנור', '2025-06-20 16:33:36'),
(103, 102, 'טיפול 10,000 ק\"מ', 450.00, 120, 'החלפת שמן, פילטרים ובדיקה כללית', '2025-06-20 16:33:36'),
(104, 102, 'בדיקת בלמים', 150.00, 60, 'בדיקה והחלפת רפידות בלם', '2025-06-20 16:33:36'),
(105, 103, 'עיצוב לוגו', 1200.00, NULL, 'עיצוב לוגו מקורי לעסק', '2025-06-20 16:33:36'),
(106, 103, 'בניית דף נחיתה', 1800.00, NULL, 'עיצוב ובניית דף נחיתה ממיר', '2025-06-20 16:33:36'),
(107, 104, 'מנוי חודשי', 250.00, NULL, 'כניסה חופשית לחדר הכושר והסטודיו', '2025-06-20 16:33:36'),
(108, 104, 'אימון אישי', 200.00, 60, 'אימון אחד על אחד עם מאמן מוסמך', '2025-06-20 16:33:36'),
(109, 105, 'שולחן אוכל מעץ אלון', 4500.00, NULL, 'שולחן אוכל בהתאמה אישית', '2025-06-20 16:33:36'),
(110, 105, 'ספריית קיר', 3200.00, NULL, 'ספריית קיר מעוצבת', '2025-06-20 16:33:36'),
(111, 106, 'ספר חדש', 98.00, 10, 'רכישת ספר מהמלאי', '2025-06-20 16:33:36'),
(112, 106, 'הזמנה מיוחדת', 120.00, 10, 'הזמנת ספר שאינו במלאי', '2025-06-20 16:33:36'),
(113, 107, 'פיצה מרגריטה', 60.00, 20, 'פיצה משפחתית קלאסית', '2025-06-20 16:33:36'),
(114, 107, 'תוספת זיתים', 8.00, 0, 'תוספת זיתים ירוקים לפיצה', '2025-06-20 16:33:36'),
(115, 108, 'סדנת אבניים', 220.00, 120, 'סדנת יצירה על אבניים', '2025-06-20 16:33:36'),
(116, 108, 'חוג קרמיקה חודשי', 400.00, NULL, '4 מפגשים של שעתיים כל אחד', '2025-06-20 16:33:36'),
(117, 109, 'טיפול פנים קלאסי', 350.00, 75, 'ניקוי עמוק, פילינג ומסכה', '2025-06-20 16:33:36'),
(118, 109, 'הסרת שיער בלייזר - רגליים', 600.00, 45, 'טיפול בודד להסרת שיער', '2025-06-20 16:33:36'),
(119, 110, 'פרמוט והתקנת ווינדוס', 250.00, 90, 'התקנה נקייה של מערכת הפעלה', '2025-06-20 16:33:36'),
(120, 110, 'שדרוג זיכרון RAM', 300.00, 30, 'הוספת 8GB זיכרון למחשב נייד', '2025-06-20 16:33:36');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('customer','business','admin') NOT NULL DEFAULT 'customer',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `first_name`, `last_name`, `email`, `phone`, `password_hash`, `role`, `created_at`) VALUES
(101, 'Noa', 'Cohen', 'noa.cohen@example.com', '052-1112221', '$2b$10$6enEDTaI3WH/jAHVKglEjuCKdn4sIe/KX0JcSf6UjYZxg.TxfWivi', 'business', '2025-06-21 09:00:00'),
(102, 'Tomer', 'Levi', 'tomer.levi@example.com', '052-1112222', '$2b$10$6enEDTaI3WH/jAHVKglEjuCKdn4sIe/KX0JcSf6UjYZxg.TxfWivi', 'business', '2025-06-21 09:00:00'),
(103, 'Yael', 'Mizrahi', 'yael.mizrahi@example.com', '052-1112223', '$2b$10$6enEDTaI3WH/jAHVKglEjuCKdn4sIe/KX0JcSf6UjYZxg.TxfWivi', 'business', '2025-06-21 09:00:00'),
(104, 'Daniel', 'Katz', 'daniel.katz@example.com', '052-1112224', '$2b$10$6enEDTaI3WH/jAHVKglEjuCKdn4sIe/KX0JcSf6UjYZxg.TxfWivi', 'business', '2025-06-21 09:00:00'),
(105, 'Itay', 'Friedman', 'itay.friedman@example.com', '052-1112225', '$2b$10$6enEDTaI3WH/jAHVKglEjuCKdn4sIe/KX0JcSf6UjYZxg.TxfWivi', 'business', '2025-06-21 09:00:00'),
(106, 'Maya', 'Shapiro', 'maya.shapiro@example.com', '054-3334441', '$2b$10$w8jKhRYPMNf81DN2wLKqZ.C.PkuW.0ttI0rRkoLYjJZG9Rlbbulq.', 'customer', '2025-06-21 09:00:00'),
(107, 'Adam', 'Bar', 'adam.bar@example.com', '054-3334442', '$2b$10$w8jKhRYPMNf81DN2wLKqZ.C.PkuW.0ttI0rRkoLYjJZG9Rlbbulq.', 'customer', '2025-06-21 09:00:00'),
(108, 'Lior', 'Tal', 'lior.tal@example.com', '054-3334443', '$2b$10$w8jKhRYPMNf81DN2wLKqZ.C.PkuW.0ttI0rRkoLYjJZG9Rlbbulq.', 'customer', '2025-06-21 09:00:00'),
(109, 'Shira', 'Goldberg', 'shira.goldberg@example.com', '054-3334444', '$2b$10$w8jKhRYPMNf81DN2wLKqZ.C.PkuW.0ttI0rRkoLYjJZG9Rlbbulq.', 'customer', '2025-06-21 09:00:00'),
(110, 'Ron', 'Biton', 'ron.biton@example.com', '054-3334445', '$2b$10$w8jKhRYPMNf81DN2wLKqZ.C.PkuW.0ttI0rRkoLYjJZG9Rlbbulq.', 'customer', '2025-06-21 09:00:00'),
(111, 'admin', 'admin', 'admin@gmail.com', '0509951290', '$2b$10$OakYfky2WCh/ljSXgpGxnOb3Ntpt6hMS1cyKONTtl9WqND/vfso2S', 'admin', '2025-06-20 16:47:49');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `appointments`
--
ALTER TABLE `appointments`
  ADD PRIMARY KEY (`appointment_id`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `business_id` (`business_id`),
  ADD KEY `service_id` (`service_id`);

--
-- Indexes for table `businesses`
--
ALTER TABLE `businesses`
  ADD PRIMARY KEY (`business_id`),
  ADD KEY `owner_id` (`owner_id`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`review_id`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `business_id` (`business_id`);

--
-- Indexes for table `services`
--
ALTER TABLE `services`
  ADD PRIMARY KEY (`service_id`),
  ADD KEY `business_id` (`business_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `phone` (`phone`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `appointments`
--
ALTER TABLE `appointments`
  MODIFY `appointment_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `businesses`
--
ALTER TABLE `businesses`
  MODIFY `business_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=111;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `review_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `services`
--
ALTER TABLE `services`
  MODIFY `service_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=121;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=112;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `appointments`
--
ALTER TABLE `appointments`
  ADD CONSTRAINT `appointments_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_2` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`business_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_3` FOREIGN KEY (`service_id`) REFERENCES `services` (`service_id`) ON DELETE CASCADE;

--
-- Constraints for table `businesses`
--
ALTER TABLE `businesses`
  ADD CONSTRAINT `businesses_ibfk_1` FOREIGN KEY (`owner_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`business_id`) ON DELETE CASCADE;

--
-- Constraints for table `services`
--
ALTER TABLE `services`
  ADD CONSTRAINT `services_ibfk_1` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`business_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
