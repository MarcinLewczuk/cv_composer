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
