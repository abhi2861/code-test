CREATE TABLE `StatusHistory` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userInvestmentId` int NOT NULL,
  `status` varchar(255) NOT NULL,
  `date` datetime NOT NULL,
  `active` tinyint(1) DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `userInvestmentId` (`userInvestmentId`),
  CONSTRAINT `StatusHistory_ibfk_1` FOREIGN KEY (`userInvestmentId`) REFERENCES `UserInvestment` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
