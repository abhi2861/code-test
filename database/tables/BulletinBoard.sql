CREATE TABLE `BulletinBoard` (
  `id` int NOT NULL AUTO_INCREMENT,
  `companyId` int NOT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `message` text,
  `isPublished` tinyint(1) DEFAULT '0',
  `publishedDate` datetime DEFAULT NULL,
  `source` varchar(255) DEFAULT NULL,
  `createdBy` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `companyId` (`companyId`),
  CONSTRAINT `BulletinBoard_ibfk_1` FOREIGN KEY (`companyId`) REFERENCES `Company` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
