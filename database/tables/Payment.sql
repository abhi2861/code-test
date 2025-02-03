CREATE TABLE `Payment` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `userInvestmentId` int NOT NULL,
  `amount` decimal(20,2) DEFAULT NULL,
  `paymentStatus` varchar(255) DEFAULT NULL,
  `active` tinyint(1) DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `date` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `Payment_ibfk_2` (`userId`),
  KEY `Payment_ibfk_1` (`userInvestmentId`),
  CONSTRAINT `Payment_ibfk_1` FOREIGN KEY (`userInvestmentId`) REFERENCES `UserInvestment` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `Payment_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
