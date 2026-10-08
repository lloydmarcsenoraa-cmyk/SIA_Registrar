-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 08, 2026 at 10:00 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.5.11

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `registrar_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `academic_records`
--

CREATE TABLE `academic_records` (
  `id` int(11) NOT NULL,
  `studentId` int(11) NOT NULL,
  `courseId` int(11) NOT NULL,
  `academicYear` varchar(9) NOT NULL,
  `semester` varchar(30) NOT NULL,
  `grade` decimal(4,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `academic_records`
--

INSERT INTO `academic_records` (`id`, `studentId`, `courseId`, `academicYear`, `semester`, `grade`) VALUES
(1, 1, 1, '2026-2027', '1st Semester', 1.75),
(2, 1, 2, '2026-2027', '1st Semester', 2.00),
(3, 3, 2, '2026-2027', '1st Semester', 1.00);

-- --------------------------------------------------------

--
-- Table structure for table `courses`
--

CREATE TABLE `courses` (
  `id` int(11) NOT NULL,
  `code` varchar(30) NOT NULL,
  `title` varchar(150) NOT NULL,
  `program` varchar(20) NOT NULL,
  `units` int(11) NOT NULL,
  `yearLevel` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `courses`
--

INSERT INTO `courses` (`id`, `code`, `title`, `program`, `units`, `yearLevel`) VALUES
(1, 'IT101', 'Introduction to Computing', 'BSIT', 3, 1),
(2, 'IT102', 'Computer Programming 1', 'BSIT', 3, 1),
(3, 'CS101', 'Introduction to Computer Science', 'BSCS', 3, 1);

-- --------------------------------------------------------

--
-- Table structure for table `enrollments`
--

CREATE TABLE `enrollments` (
  `id` int(11) NOT NULL,
  `studentId` int(11) NOT NULL,
  `academicYear` varchar(9) NOT NULL,
  `semester` varchar(30) NOT NULL,
  `status` enum('Pending','Approved','Rejected') NOT NULL DEFAULT 'Pending',
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `enrollments`
--

INSERT INTO `enrollments` (`id`, `studentId`, `academicYear`, `semester`, `status`, `createdAt`) VALUES
(1, 1, '2026-2027', '1st Semester', 'Approved', '2026-10-08 09:17:08'),
(2, 2, '2026-2027', '1st Semester', 'Approved', '2026-10-08 09:17:08'),
(3, 3, '2026-2027', '1st Semester', 'Approved', '2026-10-08 09:28:41');

-- --------------------------------------------------------

--
-- Table structure for table `programs`
--

CREATE TABLE `programs` (
  `id` int(11) NOT NULL,
  `code` varchar(20) NOT NULL,
  `name` varchar(150) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `programs`
--

INSERT INTO `programs` (`id`, `code`, `name`) VALUES
(1, 'BSIT', 'Bachelor of Science in Information Technology'),
(2, 'BSCS', 'Bachelor of Science in Computer Science'),
(3, 'BSBA', 'Bachelor of Science in Business Administration'),
(4, 'BSED', 'Bachelor of Secondary Education'),
(5, 'BEED', 'Bachelor of Elementary Education');

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

CREATE TABLE `students` (
  `id` int(11) NOT NULL,
  `studentNumber` varchar(30) NOT NULL,
  `firstName` varchar(100) NOT NULL,
  `lastName` varchar(100) NOT NULL,
  `program` varchar(20) NOT NULL,
  `yearLevel` int(11) NOT NULL,
  `status` enum('Pending','Enrolled') NOT NULL DEFAULT 'Pending',
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `students`
--

INSERT INTO `students` (`id`, `studentNumber`, `firstName`, `lastName`, `program`, `yearLevel`, `status`, `createdAt`) VALUES
(1, '2026-0001', 'Juan', 'Dela Cruz', 'BSIT', 2, 'Enrolled', '2026-10-08 09:17:08'),
(2, '2026-0002', 'Maria', 'Santos', 'BSCS', 1, 'Pending', '2026-10-08 09:17:08'),
(3, '2026-0003', 'Arjei', 'Lacayanga', 'BSIT', 3, 'Enrolled', '2026-10-08 09:27:47');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `academic_records`
--
ALTER TABLE `academic_records`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_academic_grade` (`studentId`,`courseId`,`academicYear`,`semester`),
  ADD KEY `idx_academic_course` (`courseId`);

--
-- Indexes for table `courses`
--
ALTER TABLE `courses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_courses_code` (`code`),
  ADD KEY `idx_courses_program` (`program`);

--
-- Indexes for table `enrollments`
--
ALTER TABLE `enrollments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_enrollments_student` (`studentId`);

--
-- Indexes for table `programs`
--
ALTER TABLE `programs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_programs_code` (`code`);

--
-- Indexes for table `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_students_number` (`studentNumber`),
  ADD KEY `idx_students_program` (`program`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `academic_records`
--
ALTER TABLE `academic_records`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `courses`
--
ALTER TABLE `courses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `enrollments`
--
ALTER TABLE `enrollments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `programs`
--
ALTER TABLE `programs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `students`
--
ALTER TABLE `students`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `academic_records`
--
ALTER TABLE `academic_records`
  ADD CONSTRAINT `fk_academic_course` FOREIGN KEY (`courseId`) REFERENCES `courses` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_academic_student` FOREIGN KEY (`studentId`) REFERENCES `students` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `courses`
--
ALTER TABLE `courses`
  ADD CONSTRAINT `fk_courses_program` FOREIGN KEY (`program`) REFERENCES `programs` (`code`) ON UPDATE CASCADE;

--
-- Constraints for table `enrollments`
--
ALTER TABLE `enrollments`
  ADD CONSTRAINT `fk_enrollments_student` FOREIGN KEY (`studentId`) REFERENCES `students` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `students`
--
ALTER TABLE `students`
  ADD CONSTRAINT `fk_students_program` FOREIGN KEY (`program`) REFERENCES `programs` (`code`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
