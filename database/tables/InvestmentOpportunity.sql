CREATE TABLE `InvestmentOpportunity` (
  `id` int NOT NULL AUTO_INCREMENT,
  `companyId` int NOT NULL,
  `userId` int NOT NULL,
  `minAmount` decimal(20,2) DEFAULT NULL,
  `carry` int DEFAULT NULL,
  `startDate` datetime DEFAULT NULL,
  `endDate` datetime DEFAULT NULL,
  `fmvValue` decimal(20,2) DEFAULT NULL,
  `fmvVEffectiveDate` datetime DEFAULT NULL,
  `fmvVExpirationDate` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `active` tinyint(1) DEFAULT '1',
  `fmvlastFairMarketValue` decimal(20,2) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `description` text,
  `document` varchar(255) DEFAULT NULL,
  `notes` varchar(255) DEFAULT NULL,
  `templateId` int DEFAULT NULL,
  `perUnitPrice` decimal(20,2) DEFAULT NULL,
  `investmentStatus` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `companyId` (`companyId`),
  KEY `userId` (`userId`),
  KEY `templateId` (`templateId`),
  CONSTRAINT `InvestmentOpportunity_ibfk_1` FOREIGN KEY (`companyId`) REFERENCES `Company` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `InvestmentOpportunity_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

ALTER TABLE InvestmentOpportunity
ADD COLUMN estimatedCloseDate DATE NULL;

ALTER TABLE vibhu_venture_partners.InvestmentOpportunity
ADD COLUMN investmentType VARCHAR(255) NULL,
ADD COLUMN otherDoc VARCHAR(255) NULL;