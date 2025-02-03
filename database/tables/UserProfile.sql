CREATE TABLE `UserProfile` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `companyName` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `SSN` varchar(255) NOT NULL,
  `yearsOfExperience` int DEFAULT NULL,
  `termsandConditionsAcceptedDate` datetime DEFAULT NULL,
  `ipAddress` varchar(255) DEFAULT NULL,
  `active` tinyint(1) DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_UserProfile_userId` (`userId`),
  CONSTRAINT `fk_UserProfile_userId` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
