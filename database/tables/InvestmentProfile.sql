CREATE TABLE `InvestmentProfile` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `profileType` varchar(255) DEFAULT NULL,
  `profileName` varchar(255) DEFAULT NULL,
  `otherInvestors` varchar(255) DEFAULT NULL,
  `active` tinyint(1) DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_InvestmentProfile_userId` (`userId`),
  CONSTRAINT `fk_InvestmentProfile_userId` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
