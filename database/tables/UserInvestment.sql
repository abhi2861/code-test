CREATE TABLE `UserInvestment` (
  `id` int NOT NULL AUTO_INCREMENT,
  `companyId` int NOT NULL,
  `userId` int NOT NULL,
  `investmentId` int NOT NULL,
  `amount` decimal(20,2) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `requestedDate` datetime DEFAULT NULL,
  `documentId` int DEFAULT NULL,
  `documentSentDate` int DEFAULT NULL,
  `documentSignedDate` datetime DEFAULT NULL,
  `documentIdSignedByCompanyDate` datetime DEFAULT NULL,
  `investementDate` datetime DEFAULT NULL,
  `active` tinyint(1) DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `requestedJSON` text,
  `updatedBy` int DEFAULT NULL,
  `interestedYN` tinyint(1) DEFAULT '0',
  `contactedYN` tinyint(1) DEFAULT '0',
  `noOfUnits` decimal(20,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `companyId` (`companyId`),
  KEY `userId` (`userId`),
  KEY `investmentId` (`investmentId`),
  CONSTRAINT `UserInvestment_ibfk_1` FOREIGN KEY (`companyId`) REFERENCES `Company` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `UserInvestment_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `UserInvestment_ibfk_3` FOREIGN KEY (`investmentId`) REFERENCES `InvestmentOpportunity` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


ALTER TABLE `UserInvestment`
ADD createdBy  int DEFAULT NULL;


ALTER TABLE vibhu_venture_partners.UserInvestment
ADD COLUMN investmentKey VARCHAR(50) NULL,
ADD COLUMN estimatedSharesAtInvestment DECIMAL(20, 2) NULL,
ADD COLUMN estimatedSharesToday DECIMAL(20, 2) NULL,
ADD COLUMN notes VARCHAR(50) NULL
ADD COLUMN carry int;

