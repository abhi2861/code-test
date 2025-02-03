CREATE TABLE `ErrorLog` (
  `id` int NOT NULL AUTO_INCREMENT,
  `statusCode` int DEFAULT NULL,
  `message` json DEFAULT NULL,
  `route` varchar(255) DEFAULT NULL,
  `method` varchar(255) DEFAULT NULL,
  `requestBody` json DEFAULT NULL,
  `error` json DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
