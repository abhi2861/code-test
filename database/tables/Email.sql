CREATE TABLE `Email` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int DEFAULT NULL,
  `sentById` int DEFAULT NULL,
  `emailFrom` varchar(255) DEFAULT NULL,
  `emailTo` varchar(255) DEFAULT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `body` text,
  `sentAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `isSent` tinyint(1) DEFAULT '0',
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
