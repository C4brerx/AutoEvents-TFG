



CREATE DATABASE IF NOT EXISTS `autoevents_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */;
USE `autoevents_db`;


CREATE TABLE IF NOT EXISTS `asistencias` (
  `usuario_id` int(11) NOT NULL,
  `evento_id` int(11) NOT NULL,
  `fecha_inscripcion` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`usuario_id`,`evento_id`),
  KEY `evento_id` (`evento_id`),
  CONSTRAINT `asistencias_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `asistencias_ibfk_2` FOREIGN KEY (`evento_id`) REFERENCES `eventos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `eventos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `creador_id` int(11) NOT NULL,
  `titulo` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `fecha` datetime NOT NULL,
  `ubicacion` varchar(255) NOT NULL,
  `aforo` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `creador_id` (`creador_id`),
  CONSTRAINT `eventos_ibfk_1` FOREIGN KEY (`creador_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla autoevents_db.eventos: ~0 rows (aproximadamente)

-- Volcando estructura para tabla autoevents_db.usuarios
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla autoevents_db.usuarios: ~2 rows (aproximadamente)
INSERT INTO `usuarios` (`id`, `nombre`, `email`, `password`, `fecha_registro`) VALUES
	(3, 'Adrian Cabrera Caceres', 'admin@test.com', '$2y$10$H7fyOoQnowqfxd8NULj4tuTvm.uP7PtN1DJ/68clmhWKzFtWdiDE.', '2026-03-19 13:21:02'),
	(4, 'Pruebas', 'P@gmail.es', '$2y$10$Xqf1S3MIhP4xVM/cvj5FMuS3VqX71WEyBS.eGEctrY8pgG2PVP94O', '2026-03-19 16:00:20');

-- Volcando estructura para tabla autoevents_db.vehiculos
CREATE TABLE IF NOT EXISTS `vehiculos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) NOT NULL,
  `marca` varchar(50) NOT NULL,
  `modelo` varchar(50) NOT NULL,
  `anio` int(11) NOT NULL,
  `motor` varchar(50) DEFAULT NULL,
  `especificaciones` text DEFAULT NULL,
  `modificaciones` text DEFAULT NULL,
  `fotos` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `vehiculos_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla autoevents_db.vehiculos: ~2 rows (aproximadamente)
INSERT INTO `vehiculos` (`id`, `usuario_id`, `marca`, `modelo`, `anio`, `motor`, `especificaciones`, `modificaciones`, `fotos`) VALUES
	(4, 3, 'BMW', 'M4', 2022, 'BMW M4 Competition (Coupé / Convertible) Potencia:', NULL, NULL, '1773935910-9978-2022-bmw-m4-csl-15.jpg'),
	(5, 4, 'BMW', 'M4 Competition', 2022, '3.0L S58', ' motor gasolina 3.0L TwinPower Turbo de 6 cilindros en línea, con potencias de 480 CV (base) a 510 CV (Competition) y hasta 650 Nm de par, asociado a tracción trasera o M xDrive y cambio automático de 8 velocidades. Es conocido por su aceleración de 0 a 100 km/h en 3,9 segundos', NULL, '1773937634-9008-2022-bmw-m4-csl.webp,1773937634-7149-2022-bmw-m4-csl-15.jpg'),
	(7, 4, 'DS', 'DS7', 2021, '1.6', '300cv', NULL, '1774533985-9130-article-ds-7-crossback-suv-precios-gama-espana-59e741366e01f.jpeg');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
