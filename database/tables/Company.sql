CREATE TABLE `Company` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `description` text,
  `logo` varchar(255) DEFAULT NULL,
  `companyProfile` varchar(255) DEFAULT NULL,
  `createdBy` int NOT NULL,
  `active` tinyint(1) DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `fmvValue` decimal(20,2) DEFAULT NULL,
  `fmvVEffectiveDate` datetime DEFAULT NULL,
  `fmvVExpirationDate` datetime DEFAULT NULL,
  `fmvlastFairMarketValue` decimal(20,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `createdBy` (`createdBy`),
  CONSTRAINT `Company_ibfk_1` FOREIGN KEY (`createdBy`) REFERENCES `User` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
