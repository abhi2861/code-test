CREATE TABLE `User` (
  `id` int NOT NULL AUTO_INCREMENT,
  `socialId` varchar(255) DEFAULT NULL,
  `socialEmail` varchar(255) DEFAULT NULL,
  `firstName` varchar(255) DEFAULT NULL,
  `lastName` varchar(255) DEFAULT NULL,
  `phone` text,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `socialToken` text,
  `addressline1` varchar(255) DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `state` varchar(255) DEFAULT NULL,
  `zipcode` int DEFAULT NULL,
  `organisationName` varchar(255) DEFAULT NULL,
  `occupation` varchar(255) DEFAULT NULL,
  `roleId` int DEFAULT NULL,
  `country` varchar(255) DEFAULT NULL,
  `profileType` varchar(255) DEFAULT NULL,
  `spouseName` varchar(255) DEFAULT NULL,
  `spouseEmail` varchar(255) DEFAULT NULL,
  `investmentExperience` varchar(255) DEFAULT NULL,
  `areaOfExpertise` varchar(255) DEFAULT NULL,
  `institutionName` text,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `userRoleId` int DEFAULT NULL,
  `lastLoginDate` datetime DEFAULT NULL,
  `active` tinyint(1) DEFAULT '1',
  `resetPasswordToken` varchar(255) DEFAULT NULL,
  `resetPasswordExpires` datetime DEFAULT NULL,
  `accreditation` varchar(255),
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_email` (`email`),
  UNIQUE KEY `email` (`email`),
  KEY `roleId` (`roleId`),
  KEY `userRoleId` (`userRoleId`),
  CONSTRAINT `User_ibfk_1` FOREIGN KEY (`roleId`) REFERENCES `Role` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*
Run this query after UserRole table created
*/
ALTER TABLE `User`
ADD CONSTRAINT `User_ibfk_2`
FOREIGN KEY (`userRoleId`) REFERENCES `UserRole` (`id`)
ON DELETE CASCADE
ON UPDATE CASCADE;


ALTER TABLE `User`
ADD referredBy VARCHAR(255);