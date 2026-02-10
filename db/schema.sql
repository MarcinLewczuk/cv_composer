CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(55) NOT NULL UNIQUE,
  `password` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- CV main table
CREATE TABLE IF NOT EXISTS `cvs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `originalContent` longtext NOT NULL,
  `fullName` varchar(255),
  `email` varchar(255),
  `phone` varchar(20),
  `location` varchar(255),
  `summary` longtext,
  `createdBy` int NOT NULL,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  KEY `idx_createdBy_createdAt` (`createdBy`, `createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Experience table
CREATE TABLE IF NOT EXISTS `experiences` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cvId` int NOT NULL,
  `company` varchar(255) NOT NULL,
  `position` varchar(255) NOT NULL,
  `duration` varchar(100),
  `description` longtext,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`cvId`) REFERENCES `cvs`(`id`) ON DELETE CASCADE,
  KEY `idx_cvId` (`cvId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Education table
CREATE TABLE IF NOT EXISTS `educations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cvId` int NOT NULL,
  `institution` varchar(255) NOT NULL,
  `degree` varchar(255) NOT NULL,
  `field` varchar(255) NOT NULL,
  `graduationYear` varchar(4),
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`cvId`) REFERENCES `cvs`(`id`) ON DELETE CASCADE,
  KEY `idx_cvId` (`cvId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Certifications table
CREATE TABLE IF NOT EXISTS `certifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cvId` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `issuer` varchar(255) NOT NULL,
  `date` varchar(50),
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`cvId`) REFERENCES `cvs`(`id`) ON DELETE CASCADE,
  KEY `idx_cvId` (`cvId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Skills table
CREATE TABLE IF NOT EXISTS `skills` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cvId` int NOT NULL,
  `skill` varchar(255) NOT NULL,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`cvId`) REFERENCES `cvs`(`id`) ON DELETE CASCADE,
  KEY `idx_cvId` (`cvId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Interview main table
CREATE TABLE IF NOT EXISTS `interviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `createdBy` int NOT NULL,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  KEY `idx_createdBy_createdAt` (`createdBy`, `createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Interview Messages table
CREATE TABLE IF NOT EXISTS `interview_messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `interviewId` int NOT NULL,
  `content` longtext NOT NULL,
  `sender` enum('user', 'ai') NOT NULL,
  `createdBy` int,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`interviewId`) REFERENCES `interviews`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  KEY `idx_interviewId_createdAt` (`interviewId`, `createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- File uploads table for CV files
CREATE TABLE IF NOT EXISTS `file_uploads` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fileName` varchar(255) NOT NULL,
  `originalFileName` varchar(255) NOT NULL,
  `fileSize` int NOT NULL,
  `mimeType` varchar(100),
  `filePath` varchar(500) NOT NULL,
  `createdBy` int NOT NULL,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  KEY `idx_createdBy_createdAt` (`createdBy`, `createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Mock Tests table
CREATE TABLE IF NOT EXISTS `mock_tests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text,
  `difficulty` enum('easy', 'medium', 'hard') NOT NULL DEFAULT 'medium',
  `duration` int NOT NULL COMMENT 'Duration in minutes',
  `topic` varchar(255),
  `createdBy` int NOT NULL,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  KEY `idx_createdBy` (`createdBy`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Test Questions table
CREATE TABLE IF NOT EXISTS `test_questions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `testId` int NOT NULL,
  `question` text NOT NULL,
  `optionA` text NOT NULL,
  `optionB` text NOT NULL,
  `optionC` text NOT NULL,
  `optionD` text NOT NULL,
  `correctAnswer` enum('A', 'B', 'C', 'D') NOT NULL,
  `explanation` text,
  `order` int DEFAULT 1,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`testId`) REFERENCES `mock_tests`(`id`) ON DELETE CASCADE,
  KEY `idx_testId` (`testId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Test Results table
CREATE TABLE IF NOT EXISTS `test_results` (
  `id` int NOT NULL AUTO_INCREMENT,
  `testId` int NOT NULL,
  `userId` int NOT NULL,
  `score` int NOT NULL,
  `totalQuestions` int NOT NULL,
  `timeTaken` int COMMENT 'Time taken in seconds',
  `answers` json COMMENT 'User answers stored as JSON',
  `completedAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`testId`) REFERENCES `mock_tests`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  KEY `idx_userId_completedAt` (`userId`, `completedAt`),
  KEY `idx_testId` (`testId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Interview Practice Sessions table
CREATE TABLE IF NOT EXISTS `interview_sessions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `jobRole` varchar(255) NOT NULL,
  `experienceLevel` varchar(100),
  `questionCount` int NOT NULL DEFAULT 10,
  `createdBy` int NOT NULL,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  KEY `idx_createdBy` (`createdBy`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Interview Practice Questions table
CREATE TABLE IF NOT EXISTS `interview_questions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sessionId` int NOT NULL,
  `question` text NOT NULL,
  `questionType` enum('technical', 'behavioral', 'situational', 'role-specific') NOT NULL DEFAULT 'technical',
  `sampleAnswer` text,
  `tips` text,
  `order` int DEFAULT 1,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`sessionId`) REFERENCES `interview_sessions`(`id`) ON DELETE CASCADE,
  KEY `idx_sessionId` (`sessionId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Interview Practice Responses table
CREATE TABLE IF NOT EXISTS `interview_responses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sessionId` int NOT NULL,
  `userId` int NOT NULL,
  `questionId` int NOT NULL,
  `userAnswer` text NOT NULL,
  `aiFeedback` text,
  `score` int COMMENT 'Score out of 10',
  `completedAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`sessionId`) REFERENCES `interview_sessions`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`questionId`) REFERENCES `interview_questions`(`id`) ON DELETE CASCADE,
  KEY `idx_userId_completedAt` (`userId`, `completedAt`),
  KEY `idx_sessionId` (`sessionId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
