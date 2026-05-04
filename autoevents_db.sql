-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 04-05-2026 a las 18:37:24
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `autoevents_db`
--
CREATE DATABASE IF NOT EXISTS `autoevents_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `autoevents_db`;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `comentarios_foro`
--

CREATE TABLE `comentarios_foro` (
  `id` int(11) NOT NULL,
  `publicacion_id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `contenido` text NOT NULL,
  `fecha` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `comentarios_foro`
--

INSERT INTO `comentarios_foro` (`id`, `publicacion_id`, `usuario_id`, `contenido`, `fecha`) VALUES
(1, 1, 8, 'que va tio', '2026-04-29 15:09:10'),
(27, 7, 3, 'Totalmente de acuerdo. Yo lo cambié hace poco y se nota la diferencia.', '2026-04-29 10:45:36'),
(28, 12, 9, '¡Me apunto! ¿A qué hora quedamos y dónde es el punto de encuentro?', '2026-04-29 06:45:36'),
(29, 14, 102, 'Prueba la cera Soft99 Fusso Coat. Es una locura lo que dura y cómo repele el agua.', '2026-04-28 06:45:36'),
(30, 29, 96, '¿Siguen disponibles? Si me las dejas a buen precio voy a buscarlas esta misma tarde.', '2026-04-26 06:45:36'),
(31, 3, 76, 'Tiene toda la pinta de ser una bobina que está fallando. Pásale el OBD y mira si marca algo.', '2026-04-24 06:45:36'),
(32, 18, 25, '¡Vaya fotazas! El nivel de este año ha sido una locura. Gracias por compartirlas.', '2026-04-21 06:45:36'),
(33, 24, 78, 'Si te gusta ir rápido, mejor unas Pilot Sport y pon cadenas de tela en invierno si vas a la nieve.', '2026-04-20 06:45:36'),
(34, 3, 52, 'Con la pistola de calor tienes que tener muchísimo cuidado, si te pasas lo dejas brillante.', '2026-04-16 06:45:36'),
(35, 29, 16, 'Sube por la zona de la sierra entre semana, no hay nadie y el asfalto es una mesa de billar.', '2026-04-13 06:45:36'),
(36, 4, 17, 'Homologar en España es un atraco a mano armada. Ánimo con el proyecto.', '2026-04-06 06:45:36'),
(37, 9, 49, 'Revisa el caudalímetro. Igual lo has ensuciado de aceite o polvo. Límpialo con spray.', '2026-03-31 06:45:36'),
(38, 21, 37, 'Ferodo DS2500 de cabeza. Chillan un poquito en frío a veces, pero frenan muchísimo más.', '2026-04-27 06:45:36'),
(39, 14, 104, 'Jajaja me ha pasado exactamente lo mismo, pensé que era el único.', '2026-04-30 05:55:26'),
(40, 27, 9, 'Qué locura, tienes que subir un vídeo o fotos de eso ya mismo.', '2026-04-30 04:55:26'),
(41, 16, 52, 'Por experiencia te digo que vayas a lo seguro y pidas las piezas originales en la casa, te quitas de líos.', '2026-04-30 03:55:26'),
(42, 28, 19, 'Yo iría a por el Type R. Es un coche que se revaloriza y en circuito es un bisturí.', '2026-04-30 01:55:26'),
(43, 7, 12, 'Ojo con los alojamientos allí, resérvalo con 6 meses de antelación o te tocará dormir en el coche.', '2026-04-30 00:55:26'),
(44, 21, 22, 'Depende del uso. Si es para fines de semana, el Yaris. Si necesitas maletero, ni te lo pienses.', '2026-04-29 22:55:26'),
(45, 5, 77, 'Aprovecho el hilo para preguntar: ¿alguien sabe de un taller de confianza por la zona sur?', '2026-04-29 20:55:26'),
(46, 8, 103, 'Yo llevo la suspensión roscada que venden en la tienda de esta app y va de lujo, súper recomendada.', '2026-04-29 16:55:26'),
(47, 20, 38, 'El problema no es la pieza, el problema es homologarlo luego en la ITV. Prepárate a pagar billetes.', '2026-04-29 12:55:26'),
(48, 23, 64, 'Te he enviado un mensaje privado con los datos del chico que me hizo a mí el proyecto técnico.', '2026-04-29 10:55:27');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `eventos`
--

CREATE TABLE `eventos` (
  `id` int(11) NOT NULL,
  `titulo` varchar(150) NOT NULL,
  `descripcion` text NOT NULL,
  `fecha` datetime NOT NULL,
  `ubicacion` varchar(255) NOT NULL,
  `tipo` varchar(50) NOT NULL,
  `aforo_maximo` int(11) DEFAULT NULL,
  `imagen_url` varchar(255) DEFAULT NULL,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `eventos`
--

INSERT INTO `eventos` (`id`, `titulo`, `descripcion`, `fecha`, `ubicacion`, `tipo`, `aforo_maximo`, `imagen_url`, `creado_en`) VALUES
(1, 'Trackday Jarama Premium', 'Tandas libres para vehículos de más de 300cv. Cronometraje y catering incluido.', '2026-06-15 09:00:00', 'Circuito del Jarama, Madrid', 'Trackday', 40, 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=800', '2026-04-13 15:00:52'),
(2, 'KDD JDM Legends', 'Solo coches japoneses clásicos y modernos. Concurso de mejor proyecto y escape más ruidoso.', '2026-07-20 18:00:00', 'Parking Kinepolis, Madrid', 'Concentración', 200, 'https://images.pexels.com/photos/3311574/pexels-photo-3311574.jpeg?auto=compress&cs=tinysrgb&w=800', '2026-04-13 15:00:52'),
(3, 'Ruta Transpirenaica 3 Días', 'Espectacular ruta por los Pirineos. Solo apta para conductores experimentados.', '2026-08-10 08:00:00', 'Salida: Jaca, Huesca', 'Ruta', 20, 'https://images.pexels.com/photos/210182/pexels-photo-210182.jpeg?auto=compress&cs=tinysrgb&w=800', '2026-04-13 15:00:52'),
(4, 'Exposición Clásicos 80s', 'Vuelven los años dorados. Vehículos estrictamente de serie.', '2026-05-30 10:00:00', 'IFEMA, Madrid', 'Exposición', 500, 'https://images.pexels.com/photos/2030037/pexels-photo-2030037.jpeg?auto=compress&cs=tinysrgb&w=800', '2026-04-13 15:00:52'),
(5, 'Trackday Nocturno Montmeló', 'Experimenta la velocidad bajo los focos del circuito de F1.', '2026-09-05 21:00:00', 'Circuito de Barcelona-Catalunya', 'Trackday', 60, 'https://images.pexels.com/photos/120049/pexels-photo-120049.jpeg?auto=compress&cs=tinysrgb&w=800', '2026-04-13 15:00:52'),
(6, 'Concentración 4x4 y Offroad', 'Barro, rutas complicadas y compañerismo. Trae tu eslinga.', '2026-10-12 09:30:00', 'Finca Los Barros, Toledo', 'Concentración', 150, 'https://images.pexels.com/photos/1149831/pexels-photo-1149831.jpeg?auto=compress&cs=tinysrgb&w=800', '2026-04-13 15:00:52'),
(7, 'Coffee & Cars Sunday', 'Reunión informal de domingo por la mañana. Buen café y mejores coches.', '2026-05-15 10:00:00', 'La Navata, Galapagar', 'Concentración', 100, 'https://images.pexels.com/photos/372810/pexels-photo-372810.jpeg?auto=compress&cs=tinysrgb&w=800', '2026-04-13 15:00:52'),
(8, 'Drift Day Arena', 'Circuito mojado preparado para derrapar sin destrozar neumáticos.', '2026-11-20 10:00:00', 'Circuito de Kotarr, Burgos', 'Trackday', 30, 'https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg?auto=compress&cs=tinysrgb&w=800', '2026-04-13 15:00:52'),
(9, 'Ruta Costa Brava', 'Curvas bordeando el mar Mediterráneo. Parada gastronómica incluida.', '2026-06-25 09:00:00', 'Tossa de Mar, Girona', 'Ruta', 25, 'https://images.pexels.com/photos/119435/pexels-photo-119435.jpeg?auto=compress&cs=tinysrgb&w=800', '2026-04-13 15:00:52'),
(10, 'EuroStance Meet', 'Concentración de coches stance y estilo europeo (VAG, BMW).', '2026-07-08 17:00:00', 'Parque Juan Carlos I, Madrid', 'Concentración', 300, 'https://images.pexels.com/photos/13861/IMG_3496bfree.jpg?auto=compress&cs=tinysrgb&w=800', '2026-04-13 15:00:52'),
(11, 'Supercars Sunset', 'Reunión exclusiva para deportivos de alta gama (Ferrari, Lambo, McLaren).', '2026-08-01 19:30:00', 'Puerto Banús, Marbella', 'Exposición', 50, 'https://images.pexels.com/photos/3786091/pexels-photo-3786091.jpeg?auto=compress&cs=tinysrgb&w=800', '2026-04-13 15:00:52'),
(12, 'Trackday Cheste Motos y Coches', 'Tandas mixtas organizadas por niveles. Imprescindible casco.', '2026-09-18 08:30:00', 'Circuito Ricardo Tormo, Valencia', 'Trackday', 80, 'https://images.pexels.com/photos/248687/pexels-photo-248687.jpeg?auto=compress&cs=tinysrgb&w=800', '2026-04-13 15:00:52'),
(13, 'Ruta de los Pueblos Negros', 'Paisajes impresionantes y carreteras ratoneras.', '2026-10-30 09:00:00', 'Guadalajara', 'Ruta', 20, 'https://images.pexels.com/photos/707046/pexels-photo-707046.jpeg?auto=compress&cs=tinysrgb&w=800', '2026-04-13 15:00:52'),
(14, 'Classic Rally Regularidad', 'Prueba amateur de regularidad para vehículos anteriores a 1995.', '2026-05-22 08:00:00', 'Navacerrada, Madrid', 'Ruta', 60, 'https://images.pexels.com/photos/225841/pexels-photo-225841.jpeg?auto=compress&cs=tinysrgb&w=800', '2026-04-13 15:00:52'),
(15, 'Muscle Car Fest', 'El V8 es el rey. Mustangs, Camaros, Challengers y humo.', '2026-07-04 12:00:00', 'Base Aérea (Exhibición), Zaragoza', 'Concentración', 120, 'https://images.pexels.com/photos/1402787/pexels-photo-1402787.jpeg?auto=compress&cs=tinysrgb&w=800', '2026-04-13 15:00:52'),
(16, 'Exposición Movilidad Eléctrica', 'El futuro está aquí. Tesla, Polestar y lo último en EV.', '2026-06-10 10:00:00', 'Plaza Mayor, Valladolid', 'Exposición', 500, 'https://images.pexels.com/photos/110844/pexels-photo-110844.jpeg?auto=compress&cs=tinysrgb&w=800', '2026-04-13 15:00:52'),
(17, 'Trackday Ascari', 'Disfruta del circuito más exclusivo y largo de España.', '2026-11-15 09:00:00', 'Ascari Resort, Ronda', 'Trackday', 30, 'https://images.pexels.com/photos/3156482/pexels-photo-3156482.jpeg?auto=compress&cs=tinysrgb&w=800', '2026-04-13 15:00:52'),
(18, 'Quedada Fotográfica NightDrive', 'Trae tu cámara y tu coche limpio. Spotters bienvenidos.', '2026-05-18 23:00:00', 'Azca, Madrid', 'Concentración', 40, 'https://images.pexels.com/photos/1687147/pexels-photo-1687147.jpeg?auto=compress&cs=tinysrgb&w=800', '2026-04-13 15:00:52'),
(19, 'Ruta Valles Pasiegos', 'Verde, vacas y curvas perfectas. Comida de sobaos y quesadas.', '2026-08-22 09:30:00', 'Vega de Pas, Cantabria', 'Ruta', 15, 'https://images.pexels.com/photos/2882234/pexels-photo-2882234.jpeg?auto=compress&cs=tinysrgb&w=800', '2026-04-13 15:00:52'),
(20, 'Festival del Motor Solidario', 'Todo lo recaudado irá a causas benéficas. Todo tipo de vehículos.', '2026-12-20 11:00:00', 'Recinto Ferial, Málaga', 'Exposición', 1000, 'https://images.pexels.com/photos/3422964/pexels-photo-3422964.jpeg?auto=compress&cs=tinysrgb&w=800', '2026-04-13 15:00:52');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `eventos_asistentes`
--

CREATE TABLE `eventos_asistentes` (
  `id_evento` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `eventos_asistentes`
--

INSERT INTO `eventos_asistentes` (`id_evento`, `id_usuario`, `fecha_registro`) VALUES
(18, 9, '2026-04-29 14:40:18');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mantenimientos`
--

CREATE TABLE `mantenimientos` (
  `id` int(11) NOT NULL,
  `vehiculo_id` int(11) NOT NULL,
  `tarea` varchar(100) NOT NULL,
  `km_actuales` int(11) NOT NULL,
  `km_limite` int(11) NOT NULL,
  `estado` varchar(20) DEFAULT 'verde'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mensajes`
--

CREATE TABLE `mensajes` (
  `id` int(11) NOT NULL,
  `remitente_id` int(11) NOT NULL,
  `destinatario_id` int(11) NOT NULL,
  `producto_id` int(11) DEFAULT NULL,
  `contenido` text NOT NULL,
  `fecha` datetime DEFAULT current_timestamp(),
  `leido` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `mensajes`
--

INSERT INTO `mensajes` (`id`, `remitente_id`, `destinatario_id`, `producto_id`, `contenido`, `fecha`, `leido`) VALUES
(1, 8, 8, 29, '[Sobre Llantas bbs]: holaaa', '2026-04-30 16:30:52', 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `notificaciones`
--

CREATE TABLE `notificaciones` (
  `id` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `titulo` varchar(100) NOT NULL,
  `mensaje` text NOT NULL,
  `icono` varchar(50) DEFAULT 'bi-bell-fill',
  `leido` tinyint(1) DEFAULT 0,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `notificaciones`
--

INSERT INTO `notificaciones` (`id`, `id_usuario`, `titulo`, `mensaje`, `icono`, `leido`, `fecha_creacion`) VALUES
(1, 8, '¡Plaza Confirmada!', 'Has reservado tu plaza correctamente para el evento: Coffee & Cars Sunday. ¡Pásalo genial!', 'bi-ticket-perforated-fill', 1, '2026-04-16 07:38:21'),
(2, 8, '¡Plaza Confirmada!', 'Has reservado tu plaza correctamente para el evento: Classic Rally Regularidad. ¡Pásalo genial!', 'bi-ticket-perforated-fill', 1, '2026-04-16 07:41:00'),
(3, 8, '¡Plaza Confirmada!', 'Has reservado tu plaza correctamente para el evento: Quedada Fotográfica NightDrive. ¡Pásalo genial!', 'bi-ticket-perforated-fill', 1, '2026-04-16 07:42:48'),
(4, 8, '¡Plaza Confirmada!', 'Has reservado tu plaza correctamente para el evento: Coffee & Cars Sunday. ¡Pásalo genial!', 'bi-ticket-perforated-fill', 1, '2026-04-16 07:47:44'),
(5, 8, '¡Plaza Confirmada!', 'Has reservado tu plaza correctamente para el evento: Quedada Fotográfica NightDrive. ¡Pásalo genial!', 'bi-ticket-perforated-fill', 1, '2026-04-16 09:28:51'),
(6, 8, '¡Plaza Confirmada!', 'Has reservado tu plaza correctamente para el evento: Trackday Nocturno Montmeló. ¡Pásalo genial!', 'bi-ticket-perforated-fill', 1, '2026-04-16 09:48:32'),
(7, 8, '¡Plaza Confirmada!', 'Has reservado tu plaza correctamente para el evento: KDD JDM Legends. ¡Pásalo genial!', 'bi-ticket-perforated-fill', 1, '2026-04-16 09:55:08'),
(8, 8, '¡Plaza Confirmada!', 'Has reservado tu plaza correctamente para el evento: Quedada Fotográfica NightDrive. ¡Pásalo genial!', 'bi-ticket-perforated-fill', 1, '2026-04-16 10:47:30'),
(9, 8, '¡Plaza Confirmada!', 'Has reservado tu plaza correctamente para el evento: Quedada Fotográfica NightDrive. ¡Pásalo genial!', 'bi-ticket-perforated-fill', 1, '2026-04-16 10:58:54'),
(10, 8, '¡Plaza Confirmada!', 'Has reservado tu plaza correctamente para el evento: Classic Rally Regularidad. ¡Pásalo genial!', 'bi-ticket-perforated-fill', 1, '2026-04-16 10:58:59'),
(11, 8, '¡Plaza Confirmada!', 'Has reservado tu plaza correctamente para el evento: Exposición Movilidad Eléctrica. ¡Pásalo genial!', 'bi-ticket-perforated-fill', 1, '2026-04-16 10:59:02'),
(12, 8, '¡Plaza Confirmada!', 'Has reservado tu plaza correctamente para el evento: Coffee & Cars Sunday. ¡Pásalo genial!', 'bi-ticket-perforated-fill', 1, '2026-04-16 11:03:17'),
(13, 8, '¡Plaza Confirmada!', 'Has reservado tu plaza correctamente para el evento: Quedada Fotográfica NightDrive. ¡Pásalo genial!', 'bi-ticket-perforated-fill', 1, '2026-04-16 11:03:39'),
(14, 8, '¡Plaza Confirmada!', 'Has reservado tu plaza correctamente para el evento: Classic Rally Regularidad. ¡Pásalo genial!', 'bi-ticket-perforated-fill', 1, '2026-04-16 11:03:40'),
(15, 8, '¡Plaza Confirmada!', 'Has reservado tu plaza correctamente para el evento: Ruta de los Pueblos Negros. ¡Pásalo genial!', 'bi-ticket-perforated-fill', 1, '2026-04-16 11:05:31'),
(16, 8, '¡Plaza Confirmada!', 'Has reservado tu plaza correctamente para el evento: Trackday Jarama Premium. ¡Pásalo genial!', 'bi-ticket-perforated-fill', 1, '2026-04-16 11:06:24'),
(17, 8, '¡Plaza Confirmada!', 'Has reservado tu plaza correctamente para el evento: Quedada Fotográfica NightDrive. ¡Pásalo genial!', 'bi-ticket-perforated-fill', 1, '2026-04-16 11:07:57'),
(18, 8, '¡Plaza Confirmada!', 'Has reservado tu plaza correctamente para el evento: Muscle Car Fest. ¡Pásalo genial!', 'bi-ticket-perforated-fill', 1, '2026-04-20 11:33:27'),
(19, 8, '¡Plaza Confirmada!', 'Has reservado tu plaza correctamente para el evento: Quedada Fotográfica NightDrive. ¡Pásalo genial!', 'bi-ticket-perforated-fill', 1, '2026-04-20 11:52:31'),
(20, 8, '¡Plaza Confirmada!', 'Has reservado tu plaza correctamente para el evento: Coffee & Cars Sunday. ¡Pásalo genial!', 'bi-ticket-perforated-fill', 1, '2026-04-29 12:28:10'),
(21, 8, '¡Plaza Confirmada!', 'Has reservado tu plaza correctamente para el evento: Coffee & Cars Sunday. ¡Pásalo genial!', 'bi-ticket-perforated-fill', 1, '2026-04-29 12:28:20'),
(22, 9, '¡Plaza Confirmada!', 'Has reservado tu plaza correctamente para el evento: Quedada Fotográfica NightDrive. ¡Pásalo genial!', 'bi-ticket-perforated-fill', 0, '2026-04-29 14:40:18'),
(23, 8, '¡Plaza Confirmada!', 'Has reservado tu plaza correctamente para el evento: Quedada Fotográfica NightDrive. ¡Pásalo genial!', 'bi-ticket-perforated-fill', 1, '2026-04-30 08:39:06');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos`
--

CREATE TABLE `productos` (
  `id` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `precio` decimal(10,2) NOT NULL,
  `imagen_url` varchar(255) DEFAULT NULL,
  `stock` int(11) DEFAULT 10,
  `categoria` varchar(100) DEFAULT NULL,
  `marca_compatible` varchar(100) DEFAULT 'Todas',
  `tipo_venta` varchar(20) DEFAULT 'oficial',
  `vendedor_nombre` varchar(100) DEFAULT 'AutoEvents Oficial',
  `vendedor_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `productos`
--

INSERT INTO `productos` (`id`, `nombre`, `descripcion`, `precio`, `imagen_url`, `stock`, `categoria`, `marca_compatible`, `tipo_venta`, `vendedor_nombre`, `vendedor_id`) VALUES
(1, 'Kit Frenos Brembo Max', 'Discos ranurados y pastillas cerámicas. Específico para el eje delantero. Máxima mordida en tramo.', 245.50, 'https://images.unsplash.com/photo-1620288627223-53302f4e8c74?w=600&q=80', 10, 'Frenos', 'BMW', 'oficial', 'AutoEvents Oficial', NULL),
(2, 'Aceite Motul 300V 5W40', 'Aceite de motor 100% sintético con tecnología ESTER Core. Ideal para trackdays y uso extremo.', 75.99, 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&q=80', 10, 'Mantenimiento', 'Todas', 'oficial', 'AutoEvents Oficial', NULL),
(3, 'Suspensión Roscada BC Racing', 'Kit completo regulable en altura y dureza (30 clics). Copelas regulables en caídas.', 980.00, 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&q=80', 10, 'Suspensión', 'Honda', 'oficial', 'AutoEvents Oficial', NULL),
(4, 'Filtro de Aire Ramair', 'Admisión directa cónica de espuma. Mejora el sonido del turbo y el flujo de aire masivo.', 145.00, 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&q=80', 10, 'Motor', 'Volkswagen', 'oficial', 'AutoEvents Oficial', NULL),
(5, 'Kit Embrague Sachs Performance', 'Embrague reforzado + volante monomasa. Soporta hasta 550Nm de par para Stage 2/3.', 650.00, 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&q=80', 10, 'Transmisión', 'Seat', 'oficial', 'AutoEvents Oficial', NULL),
(6, 'Escape Akrapovic Slip-On', 'Tramo final en titanio con colas de carbono. Reduce 4kg de peso y da un sonido espectacular.', 1250.00, 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&q=80', 10, 'Escape', 'Audi', 'oficial', 'AutoEvents Oficial', NULL),
(7, 'OBD Eleven Pro Pack', 'Lector OBD Bluetooth con licencia Pro. Codifica módulos y borra fallos desde el móvil.', 99.90, 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&q=80', 10, 'Electrónica', 'Volkswagen', 'oficial', 'AutoEvents Oficial', NULL),
(8, 'Neumáticos Michelin Pilot Sport 5', '225/40 R18 92Y. Neumático premium para conducción deportiva en calle y lluvia.', 135.00, 'https://images.unsplash.com/photo-1600705722908-bab1e61c0b4d?w=600&q=80', 10, 'Neumáticos', 'Todas', 'oficial', 'AutoEvents Oficial', NULL),
(9, 'Semislicks Nankang AR-1', '235/40 R18. Compuesto extremo para circuito. Treadwear 100. Legal para calle.', 165.00, 'https://images.unsplash.com/photo-1600705722908-bab1e61c0b4d?w=600&q=80', 10, 'Neumáticos', 'Todas', 'oficial', 'AutoEvents Oficial', NULL),
(10, 'Llantas OZ Racing Ultraleggera', 'Set de 4 llantas 18x8 ET45. Aleación superligera para reducir la masa no suspendida.', 1120.00, 'https://images.unsplash.com/photo-1600705722908-bab1e61c0b4d?w=600&q=80', 10, 'Llantas', 'Todas', 'oficial', 'AutoEvents Oficial', NULL),
(11, 'Bujías NGK Iridium R (x4)', 'Grado térmico más frío, ideales para motores reprogramados y con alto soplado de turbo.', 55.00, 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&q=80', 10, 'Motor', 'Toyota', 'oficial', 'AutoEvents Oficial', NULL),
(12, 'Kit Detailing Coche Nuevo', 'Incluye champú pH neutro, guante de lana de cordero, toalla de secado XXL y cera rápida.', 49.50, 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&q=80', 10, 'Limpieza', 'Todas', 'oficial', 'AutoEvents Oficial', NULL),
(13, 'Pulimento 3D One', 'Pulimento de un solo paso híbrido. Corta como un compound y acaba como un polish.', 38.00, 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&q=80', 10, 'Limpieza', 'Todas', 'oficial', 'AutoEvents Oficial', NULL),
(14, 'Gato Hidráulico Perfil Bajo 3T', 'Herramienta imprescindible para coches bajados. Doble pistón de elevación rápida.', 145.00, 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=600&q=80', 10, 'Herramientas', 'Todas', 'oficial', 'AutoEvents Oficial', NULL),
(15, 'Borriquetas 3 Toneladas (Par)', 'Soportes de seguridad plegables. Homologación CE.', 35.00, 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=600&q=80', 10, 'Herramientas', 'Todas', 'oficial', 'AutoEvents Oficial', NULL),
(16, 'Intercooler Frontal Mishimoto', 'Rebaja la temperatura de admisión hasta 15ºC. Indispensable en climas cálidos y repros.', 410.00, 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&q=80', 10, 'Motor', 'Ford', 'oficial', 'AutoEvents Oficial', NULL),
(17, 'Volante OMP Corsica', 'Volante desplazado de piel vuelta, 330mm. Incluye claxon central.', 185.00, 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&q=80', 10, 'Interior', 'Todas', 'oficial', 'AutoEvents Oficial', NULL),
(18, 'Radio Pantalla 2 DIN Pioneer', 'Apple CarPlay y Android Auto inalámbrico. Pantalla capacitiva de 7 pulgadas.', 320.00, 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&q=80', 10, 'Electrónica', 'Todas', 'oficial', 'AutoEvents Oficial', NULL),
(19, 'Camiseta \"Heel & Toe\"', 'Algodón 100% orgánico. Diseño exclusivo para los amantes del punta-tacón.', 24.99, 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&q=80', 10, 'Merchandising', 'Todas', 'oficial', 'AutoEvents Oficial', NULL),
(20, 'Llave Dinamométrica Pro', 'Rango 28-210 Nm. Imprescindible para apretar las ruedas con la presión correcta.', 55.00, 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=600&q=80', 10, 'Herramientas', 'Todas', 'oficial', 'AutoEvents Oficial', NULL),
(21, 'Volante SimRacing Fanatec', 'Volante Direct Drive 8Nm para simulador. Entrena en casa antes del trackday.', 499.99, 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&q=80', 10, 'Electrónica', 'Todas', 'oficial', 'AutoEvents Oficial', NULL),
(22, 'Guantes Piloto Sparco Arrow', 'Homologación FIA. Agarre perfecto al volante de piel vuelta.', 115.00, 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&q=80', 10, 'Equipamiento', 'Todas', 'oficial', 'AutoEvents Oficial', NULL),
(23, 'Cámara OnBoard GoPro Hero 11', 'Graba tus tandas en 4K. Incluye soporte de ventosa para el cristal.', 399.00, 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&q=80', 10, 'Electrónica', 'Todas', 'oficial', 'AutoEvents Oficial', NULL),
(24, 'Funda Coche Exterior Premium', 'Transpirable, forro polar interior y resistente al granizo.', 125.00, 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600&q=80', 10, 'Accesorios', 'Todas', 'oficial', 'AutoEvents Oficial', NULL),
(25, 'Llantas Golf GTI 18\" Originales', 'Tienen algún roce típico de aparcar, neumáticos Michelin al 40%.', 450.00, 'https://images.unsplash.com/photo-1600705722908-bab1e61c0b4d?w=600&q=80', 10, 'Llantas', 'Volkswagen', 'segunda_mano', 'Carlos R.', 60),
(26, 'Alerón Fibra de Carbono', 'Lo compré pero no lo llegué a montar. Ajuste universal.', 120.00, 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600&q=80', 10, 'Accesorios', 'Todas', 'segunda_mano', 'David M.', 69),
(27, 'Escape intermedio Seat Leon', 'Supresor de intermedio. Suena espectacular pero no pasa ITV.', 80.00, 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&q=80', 10, 'Escape', 'Seat', 'segunda_mano', 'Alex99', 84),
(28, 'pilotos golf 8', 'arañado', 300.00, 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600&q=80', 10, 'Accesorios', 'Todas', 'segunda_mano', 'Usuario Automático', 1),
(29, 'Llantas bbs', 'Nuevas', 1200.00, 'http://localhost/autoevents/backend/uploads/1777542407_BBSFIR67.jpg', 10, 'Llantas', 'Todas', 'segunda_mano', 'Adrian Cabrera', 8);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `publicaciones`
--

CREATE TABLE `publicaciones` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `contenido` text NOT NULL,
  `categoria` varchar(100) DEFAULT 'General',
  `fecha` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `publicaciones`
--

INSERT INTO `publicaciones` (`id`, `usuario_id`, `titulo`, `contenido`, `categoria`, `fecha`) VALUES
(1, 3, 'Duda con el cambio de aceite', '¿Cada cuántos KM recomendáis cambiar el aceite en un gasolina turbo? El fabricante dice 20.000 pero me parece muchísimo. Yo lo hago cada 10k.', 'Mecánica', '2026-04-28 15:02:11'),
(2, 4, 'Ruta por la Sierra Norte este domingo', '¿Alguien se apunta este domingo a hacer unas curvas por la sierra? Ritmo tranquilo, parando a almorzar a medio camino. Dejad comentario los interesados.', 'Rutas', '2026-04-27 15:02:11'),
(3, 5, 'Mejor cera para color negro', 'Tengo el coche negro y es un sufrimiento. Lo lavo y a los dos días está sucio otra vez. ¿Qué cera o sellante cerámico me recomendáis que dure bastante?', 'Detailing', '2026-04-26 15:02:11'),
(4, 8, 'Vendo llantas 18\" Originales', 'Pues eso, he cambiado las llantas y vendo las de serie. Tienen algún roce típico de aparcar pero no están dobladas. Precio negociable, paso fotos por DM.', 'Compra/Venta', '2026-04-24 15:02:11'),
(5, 3, 'Testigo fallo motor intermitente', 'Se me enciende la luz de fallo motor cuando paso de 3000 rpm en tercera, pero si apago y enciendo el coche desaparece. ¿Podría ser la EGR?', 'Mecánica', '2026-04-22 15:02:11'),
(6, 4, 'Fotos de la KDD de ayer', '¡Qué pasada la concentración de ayer! Os dejo por aquí un enlace con las fotos que tiré. Increíble nivel el de los japos este año.', 'Eventos', '2026-04-19 15:02:11'),
(7, 5, '¿Qué os parecen los neumáticos All-Season?', 'Toca cambiar gomas y estaba pensando en poner unas Michelin CrossClimate. Vivo en Madrid y voy a la nieve 2 veces al año. ¿Valen la pena o mejor unas de verano buenas?', 'General', '2026-04-17 15:02:11'),
(8, 8, 'Quitar arañazos del salpicadero', 'Al cargar unos muebles he arañado la guantera. Es plástico duro texturizado. ¿Conocéis algún producto o truco con pistola de calor para disimularlo?', 'Detailing', '2026-04-14 15:02:11'),
(9, 3, 'Buscando tramo para probar frenos', 'Acabo de montar latiguillos metálicos y líquido Motul RBF600. Necesito un tramo despejado por la zona centro para probarlos a fondo sin peligro. ¿Recomendaciones?', 'Rutas', '2026-04-11 15:02:11'),
(10, 4, 'Compro escape homologado para Miata NA', 'Lo del título. Busco algo que suene bien pero que pase la ITV sin problemas. Preferiblemente entrega en mano.', 'Compra/Venta', '2026-04-09 15:02:11'),
(11, 5, 'Homologar suspensión roscada: Mi odisea', 'Abro este hilo para contaros mi experiencia homologando unas BC Racing. Spoiler: Preparad la cartera y mucha paciencia con el proyecto técnico.', 'Mecánica', '2026-04-04 15:02:11'),
(12, 8, 'Presentación desde el sur', '¡Hola a todos! Llevaba tiempo leyendo en la sombra y por fin me registro. Tengo un Leon Cupra MK3 y con ganas de aprender de esta comunidad.', 'General', '2026-03-30 15:02:11'),
(13, 3, 'Lavar el coche al sol: ¿Mito o realidad?', 'Siempre dicen que lavar el coche al sol deja marcas de agua, pero si lo secas rápido con toalla de microfibra, ¿es para tanto?', 'Detailing', '2026-03-25 16:02:11'),
(14, 4, 'Próximo Trackday en el Jarama', 'He visto que hay tandas libres el mes que viene. ¿Alguien del foro va a meter el coche a pista? Sería mi primera vez y me vendrían bien unos consejos.', 'Eventos', '2026-03-20 16:02:11'),
(15, 5, 'Consumo desorbitado de repente', 'Mi coche hacía medias de 6.5L y ahora no baja de 9L en el mismo trayecto. El filtro de aire es nuevo. ¿Puede ser la sonda lambda?', 'Mecánica', '2026-03-15 16:02:11'),
(16, 8, 'Vibración en el volante a 120km/h', 'Justo al llegar a 120 vibra, pero a 130 se quita. Acabo de hacer paralelo y equilibrado y sigue igual. ¿Alineación? ¿Taco de motor?', 'Mecánica', '2026-04-27 15:02:11'),
(17, 3, 'Cambio de pastillas: ¿Brembo o Ferodo?', 'Toca cambio de pastillas delanteras. No hago circuito, solo conducción deportiva esporádica. ¿Qué compuesto ensucia menos la llanta y frena bien en frío?', 'Mecánica', '2026-04-25 15:02:11'),
(18, 4, 'Limpieza de asientos de tela', 'Se me ha derramado café en el asiento del copiloto. Le he dado con APC y cepillo pero al secar queda el cerco. ¿Alguien tiene una máquina de inyección-extracción?', 'Detailing', '2026-04-23 15:02:11'),
(19, 5, 'Ruta nocturna de viernes', 'Aprovechando que hace buena temperatura, propongo salir este viernes sobre las 23:00 a hacer una ruta corta y parar a tomar algo. ¿Quién se anima?', 'Rutas', '2026-04-21 15:02:11'),
(20, 8, '¿Gasolina 95 o 98?', 'En el manual pone mínimo 95, pero mucha gente dice que con 98 hace más kilómetros y el motor va más fino. ¿Vale la pena la diferencia de precio o es placebo?', 'General', '2026-04-20 15:02:11'),
(21, 3, 'Cuidado con el radar de tramo nuevo', 'Aviso a navegantes: han puesto en funcionamiento el nuevo radar de tramo en la A-3. Está señalizado pero la cámara casi no se ve.', 'General', '2026-04-18 15:02:11'),
(22, 4, 'Busco alerón tipo ducktail', 'Si alguien tiene un alerón estilo \"cola de pato\" para un BRZ/GT86 que le sobre, que me mande un privado. Me da igual el color, lo voy a vinilar.', 'Compra/Venta', '2026-04-15 15:02:11'),
(23, 5, 'Pulimento de un solo paso', 'He probado el 3D One y es una maravilla. Corta bastante bien y deja un acabado de espejo sin necesidad de pasar otro pulimento de acabado. Recomendadísimo.', 'Detailing', '2026-04-13 15:02:11'),
(24, 8, '¿Alguien para repro a medida?', 'Quiero hacerle una Stage 1 al coche pero no quiero enlatados. Busco un chiptuner de confianza que mida en banco y ajuste a medida. ¿Sugerencias?', 'Mecánica', '2026-04-08 15:02:11'),
(25, 3, 'Fotos de mi nueva adquisición', 'Por fin, después de meses de ahorro he traído a casa este juguete. Está de estricta serie pero ya tengo una lista larga de modificaciones en mente.', 'General', '2026-04-05 15:02:11'),
(26, 4, 'Vendo asientos semibaquets Recaro', 'Desmontados de un Evo VIII. Tienen un par de marcas de uso en las orejeras del conductor, pero por lo demás impecables. Con guías.', 'Compra/Venta', '2026-04-01 15:02:11'),
(27, 5, 'Ruido a cama vieja en los badenes', 'Cada vez que paso un resalto suena como un colchón viejo de muelles. Sospecho de los silentblocks de la barra estabilizadora. ¿Los pongo de poliuretano?', 'Mecánica', '2026-03-28 16:02:11'),
(28, 8, 'Feria de clásicos en el IFEMA', '¿Vais a pasaros por la feria de vehículos clásicos este fin de semana? Yo iré el sábado por la mañana, si alguien va podemos organizar un café rápido.', 'Eventos', '2026-03-22 16:02:11'),
(29, 3, 'Rutas por los Pirineos', 'Estoy planificando un viaje de 4 días por el pirineo aragonés. Busco puertos de montaña que estén bien asfaltados y no tengan mucho tráfico de autocaravanas.', 'Rutas', '2026-03-18 16:02:11'),
(30, 4, 'Cómo restaurar faros amarillentos', 'No gastéis dinero en kits caros. Lija al agua de 800, 1500 y 2000, una capa de laca en spray resistente a los rayos UV, y quedan nuevos para siempre.', 'Detailing', '2026-03-12 16:02:11'),
(31, 90, '¿Viaje a Nürburgring este verano?', 'Estoy organizando un viaje en agosto al Infierno Verde. ¿Alguien tiene recomendaciones para el ferry o alojamientos cerca del circuito?', 'Rutas', '2026-04-30 01:55:26'),
(32, 22, 'Cazado un Ferrari F40 en Madrid', 'Acabo de cruzarme con un F40 rojo bajando por la Castellana. ¿Alguien más lo ha visto? Casi me da un infarto.', 'General', '2026-04-29 18:55:26'),
(33, 15, 'Duda de compra: ¿GR Yaris o Civic Type R?', 'Tengo presupuesto para uno de los dos. El Yaris me tira por la tracción total, pero el Civic parece más práctico para el día a día. Opiniones.', 'General', '2026-04-28 06:55:26');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp(),
  `biografia` text DEFAULT NULL,
  `foto_perfil` varchar(255) DEFAULT NULL,
  `intentos_fallidos` int(11) DEFAULT 0,
  `bloqueado_hasta` datetime DEFAULT NULL,
  `rol` varchar(20) DEFAULT 'usuario'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `nombre`, `email`, `password`, `fecha_registro`, `biografia`, `foto_perfil`, `intentos_fallidos`, `bloqueado_hasta`, `rol`) VALUES
(3, 'Adrian Cabrera Caceres', 'acabreracaceres@gmail.com', '$2y$10$H7fyOoQnowqfxd8NULj4tuTvm.uP7PtN1DJ/68clmhWKzFtWdiDE.', '2026-03-19 13:21:02', NULL, NULL, 0, NULL, 'usuario'),
(4, 'Pruebas', 'P@gmail.es', '$2y$10$Xqf1S3MIhP4xVM/cvj5FMuS3VqX71WEyBS.eGEctrY8pgG2PVP94O', '2026-03-19 16:00:20', NULL, NULL, 0, NULL, 'usuario'),
(5, 'Adri', 'p1@gmail.com', '$2y$10$HGzEzfaNd2qWzOuGFe6FrutRyT7I1PrXOtWKW.hsZqSz8tugu/NPW', '2026-04-02 23:10:36', NULL, NULL, 0, NULL, 'usuario'),
(8, 'Adrian Cabrera', 'TFG@gmail.com', '$2y$10$JKcClCM/iZsUWhfE4k.tr.K40n9P3Ack/lONuHR3Kz0HNZc6DNoiq', '2026-04-06 12:46:23', 'ME gusta el Drift', 'avatar_69dcf985887ec_7d11.webp', 0, NULL, 'admin'),
(9, 'TFG2', 'TFG2@gmail.com', '$2y$12$Cmv9ggnhcA8IJCAxpLvSDOysPxQSNTA6E4tDmgTHnNr8UOmpthCa.', '2026-04-29 14:39:38', '', NULL, 5, '2026-05-04 18:11:52', 'usuario'),
(10, 'Alejandro García', 'alejandro.g@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(11, 'María López', 'maria.l@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(12, 'Carlos Ruiz', 'carlos.r@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(13, 'Laura Fernández', 'laura.f@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(14, 'Javier Martínez', 'javier.m@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(15, 'Ana Gómez', 'ana.g@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(16, 'Diego Sánchez', 'diego.s@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(17, 'Lucía Martín', 'lucia.m@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(18, 'David Pérez', 'david.p@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(19, 'Carmen Gómez', 'carmen.g@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(20, 'Daniel Navarro', 'daniel.n@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(21, 'Elena Torres', 'elena.t@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(22, 'Pablo Domínguez', 'pablo.d@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(23, 'Sara Ramírez', 'sara.r@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(24, 'Jorge Gil', 'jorge.g@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(25, 'Paula Blanco', 'paula.b@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(26, 'Mario Serrano', 'mario.s@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(27, 'Marta Molina', 'marta.m@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(28, 'Marcos Suárez', 'marcos.s@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(29, 'Andrea Castro', 'andrea.c@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(30, 'Iván Ortiz', 'ivan.o@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(31, 'Alba Rubio', 'alba.r@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(32, 'Rubén Marín', 'ruben.m@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(33, 'Nerea Sanz', 'nerea.s@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(34, 'Víctor Iglesias', 'victor.i@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(35, 'Cristina Alonso', 'cristina.a@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(36, 'Hugo Garrido', 'hugo.g@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(37, 'Silvia Cruz', 'silvia.c@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(38, 'Álvaro Núñez', 'alvaro.n@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(39, 'Raquel Medina', 'raquel.m@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(40, 'Adrián Peña', 'adrian.p@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(41, 'Patricia Flores', 'patricia.f@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(42, 'Manuel Cabrera', 'manuel.c@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(43, 'Natalia Reyes', 'natalia.r@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(44, 'Raúl Aguilar', 'raul.a@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(45, 'Miriam Santana', 'miriam.s@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(46, 'Roberto Vidal', 'roberto.v@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(47, 'Lorena Ferrer', 'lorena.f@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(48, 'Héctor Vicente', 'hector.v@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(49, 'Berta Méndez', 'berta.m@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(50, 'Óscar Gallego', 'oscar.g@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(51, 'Rocío Vega', 'rocio.v@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(52, 'Fernando Rojas', 'fernando.r@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(53, 'Inés Santos', 'ines.s@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(54, 'Eduardo Carmona', 'eduardo.c@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(55, 'Teresa Crespo', 'teresa.c@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(56, 'Iker Román', 'iker.r@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(57, 'Julia Pastor', 'julia.p@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(58, 'Samuel Soto', 'samuel.s@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(59, 'Clara Sáez', 'clara.s@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(60, 'Aitor Velasco', 'aitor.v@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(61, 'Marina Moya', 'marina.m@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(62, 'Martín Soler', 'martin.s@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(63, 'Sonia Parra', 'sonia.p@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(64, 'Gonzalo Bravo', 'gonzalo.b@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(65, 'Alicia Gallardo', 'alicia.g@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(66, 'Rodrigo Prieto', 'rodrigo.p@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(67, 'Beatriz Esteban', 'beatriz.e@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(68, 'Guillermo Lorenzo', 'guillermo.l@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(69, 'Celia Márquez', 'celia.m@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(70, 'Félix Peña', 'felix.p@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(71, 'Blanca Pardo', 'blanca.p@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(72, 'Ismael Varela', 'ismael.v@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(73, 'Lidia Castillo', 'lidia.c@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(74, 'Tomás Mora', 'tomas.m@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(75, 'Nuria Rivas', 'nuria.r@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(76, 'Borja Vidal', 'borja.v@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(77, 'Aída Lozano', 'aida.l@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(78, 'Cristian Arias', 'cristian.a@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(79, 'Rosa Herrero', 'rosa.h@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(80, 'Joel Carmona', 'joel.c@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(81, 'Mónica Vicente', 'monica.v@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(82, 'Marc Aguilar', 'marc.a@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(83, 'Aurora Montes', 'aurora.m@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(84, 'Jonatan Perea', 'jonatan.p@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(85, 'Diana Segura', 'diana.s@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(86, 'Alex Valera', 'alex.v@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(87, 'Esther Fuentes', 'esther.f@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(88, 'Darío Gálvez', 'dario.g@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(89, 'Gema Salgado', 'gema.s@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(90, 'Juanma Ríos', 'juanma.r@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(91, 'Noelia Cuesta', 'noelia.c@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(92, 'Paco Salas', 'paco.s@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(93, 'Irene Pareja', 'irene.p@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(94, 'Iñaki Cruz', 'inaki.c@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(95, 'Vanesa Mota', 'vanesa.m@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(96, 'Julio Cárdenas', 'julio.c@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(97, 'Silvia Cobo', 'silvia.cobo@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(98, 'Fabián Duque', 'fabian.d@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(99, 'Loreto Bueno', 'loreto.b@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(100, 'Xavi Luna', 'xavi.l@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(101, 'Lola Vaca', 'lola.v@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(102, 'Mateo Pino', 'mateo.p@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(103, 'Susana Lago', 'susana.l@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(104, 'Aarón Marco', 'aaron.m@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(105, 'Estefanía Roldán', 'estefania.r@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(106, 'Pol Garcés', 'pol.g@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(107, 'Ruth Paz', 'ruth.p@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(108, 'Oliver Aranda', 'oliver.a@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario'),
(109, 'Eva Mínguez', 'eva.m@email.com', '$2y$10$dummy', '2026-04-29 15:07:37', NULL, NULL, 0, NULL, 'usuario');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `vehiculos`
--

CREATE TABLE `vehiculos` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `marca` varchar(50) NOT NULL,
  `modelo` varchar(50) NOT NULL,
  `anio` int(11) NOT NULL,
  `motor` varchar(50) DEFAULT NULL,
  `especificaciones` text DEFAULT NULL,
  `modificaciones` text DEFAULT NULL,
  `fotos` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `vehiculos`
--

INSERT INTO `vehiculos` (`id`, `usuario_id`, `marca`, `modelo`, `anio`, `motor`, `especificaciones`, `modificaciones`, `fotos`) VALUES
(4, 3, 'BMW', 'M4', 2022, 'BMW M4 Competition (Coupé / Convertible) Potencia:', NULL, NULL, '1773935910-9978-2022-bmw-m4-csl-15.jpg'),
(5, 4, 'BMW', 'M4 Competition', 2022, '3.0L S58', ' motor gasolina 3.0L TwinPower Turbo de 6 cilindros en línea, con potencias de 480 CV (base) a 510 CV (Competition) y hasta 650 Nm de par, asociado a tracción trasera o M xDrive y cambio automático de 8 velocidades. Es conocido por su aceleración de 0 a 100 km/h en 3,9 segundos', NULL, '1773937634-9008-2022-bmw-m4-csl.webp,1773937634-7149-2022-bmw-m4-csl-15.jpg'),
(7, 4, 'DS', 'DS7', 2021, '1.6', '300cv', NULL, '1774533985-9130-article-ds-7-crossback-suv-precios-gama-espana-59e741366e01f.jpeg'),
(8, 4, 'Peugeot', 'Corsa', 2022, '1.2 puretech', 'Escape 180 cv repro ', NULL, '1775163225-7551-5c18ca01-933d-4e86-9c8c-8e2ef20595bf.webp'),
(9, 5, 'DS', 'DS/', 2021, '1.6', 'dcsfsfsef', NULL, '1775171471-1475-article-ds-7-crossback-suv-precios-gama-espana-59e741366e01f.jpeg'),
(11, 8, 'Honda', 'NSX', 1999, '3.0i V6 24V', 'Este modelo fue personalizado por el diseñador Bruno Berard, lo que hace que este modelo sea único, con su pintura a juego en color rojo. Este modelo fue expuesto en el Salón de Ginebra en 1997. El propietario actual tiene el vehículo desde hace más de 20 años, desde 2005. El vehículo acaba de pasar una revisión, con reemplazo del kit de distribución (correas y poleas).', NULL, 'ae_69e0b1b3215e5_3e65236b.jpg'),
(54, 77, 'BMW', 'M3 E46', 2004, '3.2 L6 343cv', 'Llantas CSL, Escape Supersprint, Admisión de carbono.', NULL, NULL),
(55, 90, 'Honda', 'Civic Type R (FK8)', 2019, '2.0 VTEC Turbo 320cv', 'Estrictamente de serie.', NULL, NULL),
(56, 109, 'Seat', 'Leon Cupra', 2018, '2.0 TSI 300cv', 'Stage 1 a 350cv, Downpipe, Admisión Ramair.', NULL, NULL),
(57, 35, 'Audi', 'RS3', 2021, '2.5 TFSI 400cv', 'Frenos carbocerámicos, Suspensión rebajada.', NULL, NULL),
(58, 30, 'Volkswagen', 'Golf GTI MK7', 2016, '2.0 TSI 230cv', 'Tramo final recto, Llantas Pretoria 19\".', NULL, NULL),
(59, 107, 'Toyota', 'GR Yaris', 2022, '1.6 Turbo 261cv', 'Pack Circuit, Latiguillos metálicos.', NULL, NULL),
(60, 55, 'Ford', 'Mustang GT', 2018, '5.0 V8 450cv', 'Escape Borla, Reprogramación caja automática.', NULL, NULL),
(61, 19, 'Peugeot', '208 GTI by PS', 2017, '1.6 THP 208cv', 'Autoblocante Torsen, Semislicks Nankang AR-1.', NULL, NULL),
(62, 31, 'Renault', 'Megane RS Trophy', 2019, '1.8 Turbo 300cv', 'Chasis Cup, Asientos Recaro Pole Position.', NULL, NULL),
(63, 75, 'Mazda', 'MX-5 (ND)', 2020, '2.0 Skyactiv-G 184cv', 'Suspensión roscada Tein, Línea de escape Cobalt.', NULL, NULL),
(64, 5, 'Porsche', '911 Carrera S (991)', 2014, '3.8 Boxer 400cv', 'Escape deportivo original, Frenos mejorados.', NULL, NULL),
(65, 100, 'Nissan', '350Z', 2006, '3.5 V6 300cv', 'Kit de embrague reforzado, Llantas Volk TE37.', NULL, NULL),
(66, 76, 'Mitsubishi', 'Lancer Evo IX', 2007, '2.0 Turbo 280cv', 'Tracción total, Diferencial activo, Llantas BBS.', NULL, NULL),
(67, 102, 'Lancia', 'Delta Integrale Evoluzione', 1992, '2.0 Turbo 210cv', 'Restaurado por completo, Color Rosso Monza.', NULL, NULL),
(68, 70, 'Abarth', '595 Competizione', 2021, '1.4 T-Jet 180cv', 'Escape Record Monza, Asientos Sabelt.', NULL, NULL),
(69, 31, 'Porsche', 'Cayman GT4', 2016, '3.8 Boxer 385cv', 'Frenos cerámicos, Paquete Clubsport, Jaula antivuelco.', NULL, NULL),
(70, 84, 'Chevrolet', 'Corvette C6', 2008, '6.2 V8 436cv', 'Sistema de escape Z06, Admisión Vararam.', NULL, NULL),
(71, 63, 'Subaru', 'BRZ', 2023, '2.4 Boxer 234cv', 'Suspensión KW V3, Alerón ducktail en carbono.', NULL, NULL),
(72, 29, 'Alfa Romeo', '4C', 2015, '1.7 Turbo 240cv', 'Chasis de carbono, Escape deportivo sin silenciador.', NULL, NULL),
(73, 20, 'BMW', 'M5 E60', 2006, '5.0 V10 507cv', 'Casquillos de biela cambiados, Escape Eisenmann.', NULL, NULL),
(74, 76, 'Nissan', 'Skyline GT-R R34', 1999, '2.6 RB26DETT', 'Importado de Japón, Color Bayside Blue, Llantas Nismo.', NULL, NULL),
(75, 14, 'Mini', 'John Cooper Works', 2019, '2.0 Turbo 231cv', 'Suspensión JCW Pro, Neumáticos Michelin PS4.', NULL, NULL);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `comentarios_foro`
--
ALTER TABLE `comentarios_foro`
  ADD PRIMARY KEY (`id`),
  ADD KEY `publicacion_id` (`publicacion_id`),
  ADD KEY `usuario_id` (`usuario_id`);

--
-- Indices de la tabla `eventos`
--
ALTER TABLE `eventos`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `eventos_asistentes`
--
ALTER TABLE `eventos_asistentes`
  ADD PRIMARY KEY (`id_evento`,`id_usuario`);

--
-- Indices de la tabla `mantenimientos`
--
ALTER TABLE `mantenimientos`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `mensajes`
--
ALTER TABLE `mensajes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `remitente_id` (`remitente_id`),
  ADD KEY `destinatario_id` (`destinatario_id`);

--
-- Indices de la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `productos`
--
ALTER TABLE `productos`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `publicaciones`
--
ALTER TABLE `publicaciones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indices de la tabla `vehiculos`
--
ALTER TABLE `vehiculos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `comentarios_foro`
--
ALTER TABLE `comentarios_foro`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=49;

--
-- AUTO_INCREMENT de la tabla `eventos`
--
ALTER TABLE `eventos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT de la tabla `mantenimientos`
--
ALTER TABLE `mantenimientos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `mensajes`
--
ALTER TABLE `mensajes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT de la tabla `productos`
--
ALTER TABLE `productos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT de la tabla `publicaciones`
--
ALTER TABLE `publicaciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=110;

--
-- AUTO_INCREMENT de la tabla `vehiculos`
--
ALTER TABLE `vehiculos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=76;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `comentarios_foro`
--
ALTER TABLE `comentarios_foro`
  ADD CONSTRAINT `comentarios_foro_ibfk_1` FOREIGN KEY (`publicacion_id`) REFERENCES `publicaciones` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `comentarios_foro_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `mensajes`
--
ALTER TABLE `mensajes`
  ADD CONSTRAINT `mensajes_ibfk_1` FOREIGN KEY (`remitente_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `mensajes_ibfk_2` FOREIGN KEY (`destinatario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `publicaciones`
--
ALTER TABLE `publicaciones`
  ADD CONSTRAINT `publicaciones_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `vehiculos`
--
ALTER TABLE `vehiculos`
  ADD CONSTRAINT `vehiculos_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;
--
-- Base de datos: `phpmyadmin`
--
CREATE DATABASE IF NOT EXISTS `phpmyadmin` DEFAULT CHARACTER SET utf8 COLLATE utf8_bin;
USE `phpmyadmin`;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pma__bookmark`
--

CREATE TABLE `pma__bookmark` (
  `id` int(10) UNSIGNED NOT NULL,
  `dbase` varchar(255) NOT NULL DEFAULT '',
  `user` varchar(255) NOT NULL DEFAULT '',
  `label` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '',
  `query` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Bookmarks';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pma__central_columns`
--

CREATE TABLE `pma__central_columns` (
  `db_name` varchar(64) NOT NULL,
  `col_name` varchar(64) NOT NULL,
  `col_type` varchar(64) NOT NULL,
  `col_length` text DEFAULT NULL,
  `col_collation` varchar(64) NOT NULL,
  `col_isNull` tinyint(1) NOT NULL,
  `col_extra` varchar(255) DEFAULT '',
  `col_default` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Central list of columns';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pma__column_info`
--

CREATE TABLE `pma__column_info` (
  `id` int(5) UNSIGNED NOT NULL,
  `db_name` varchar(64) NOT NULL DEFAULT '',
  `table_name` varchar(64) NOT NULL DEFAULT '',
  `column_name` varchar(64) NOT NULL DEFAULT '',
  `comment` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '',
  `mimetype` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '',
  `transformation` varchar(255) NOT NULL DEFAULT '',
  `transformation_options` varchar(255) NOT NULL DEFAULT '',
  `input_transformation` varchar(255) NOT NULL DEFAULT '',
  `input_transformation_options` varchar(255) NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Column information for phpMyAdmin';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pma__designer_settings`
--

CREATE TABLE `pma__designer_settings` (
  `username` varchar(64) NOT NULL,
  `settings_data` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Settings related to Designer';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pma__export_templates`
--

CREATE TABLE `pma__export_templates` (
  `id` int(5) UNSIGNED NOT NULL,
  `username` varchar(64) NOT NULL,
  `export_type` varchar(10) NOT NULL,
  `template_name` varchar(64) NOT NULL,
  `template_data` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Saved export templates';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pma__favorite`
--

CREATE TABLE `pma__favorite` (
  `username` varchar(64) NOT NULL,
  `tables` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Favorite tables';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pma__history`
--

CREATE TABLE `pma__history` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `username` varchar(64) NOT NULL DEFAULT '',
  `db` varchar(64) NOT NULL DEFAULT '',
  `table` varchar(64) NOT NULL DEFAULT '',
  `timevalue` timestamp NOT NULL DEFAULT current_timestamp(),
  `sqlquery` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='SQL history for phpMyAdmin';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pma__navigationhiding`
--

CREATE TABLE `pma__navigationhiding` (
  `username` varchar(64) NOT NULL,
  `item_name` varchar(64) NOT NULL,
  `item_type` varchar(64) NOT NULL,
  `db_name` varchar(64) NOT NULL,
  `table_name` varchar(64) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Hidden items of navigation tree';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pma__pdf_pages`
--

CREATE TABLE `pma__pdf_pages` (
  `db_name` varchar(64) NOT NULL DEFAULT '',
  `page_nr` int(10) UNSIGNED NOT NULL,
  `page_descr` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='PDF relation pages for phpMyAdmin';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pma__recent`
--

CREATE TABLE `pma__recent` (
  `username` varchar(64) NOT NULL,
  `tables` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Recently accessed tables';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pma__relation`
--

CREATE TABLE `pma__relation` (
  `master_db` varchar(64) NOT NULL DEFAULT '',
  `master_table` varchar(64) NOT NULL DEFAULT '',
  `master_field` varchar(64) NOT NULL DEFAULT '',
  `foreign_db` varchar(64) NOT NULL DEFAULT '',
  `foreign_table` varchar(64) NOT NULL DEFAULT '',
  `foreign_field` varchar(64) NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Relation table';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pma__savedsearches`
--

CREATE TABLE `pma__savedsearches` (
  `id` int(5) UNSIGNED NOT NULL,
  `username` varchar(64) NOT NULL DEFAULT '',
  `db_name` varchar(64) NOT NULL DEFAULT '',
  `search_name` varchar(64) NOT NULL DEFAULT '',
  `search_data` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Saved searches';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pma__table_coords`
--

CREATE TABLE `pma__table_coords` (
  `db_name` varchar(64) NOT NULL DEFAULT '',
  `table_name` varchar(64) NOT NULL DEFAULT '',
  `pdf_page_number` int(11) NOT NULL DEFAULT 0,
  `x` float UNSIGNED NOT NULL DEFAULT 0,
  `y` float UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Table coordinates for phpMyAdmin PDF output';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pma__table_info`
--

CREATE TABLE `pma__table_info` (
  `db_name` varchar(64) NOT NULL DEFAULT '',
  `table_name` varchar(64) NOT NULL DEFAULT '',
  `display_field` varchar(64) NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Table information for phpMyAdmin';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pma__table_uiprefs`
--

CREATE TABLE `pma__table_uiprefs` (
  `username` varchar(64) NOT NULL,
  `db_name` varchar(64) NOT NULL,
  `table_name` varchar(64) NOT NULL,
  `prefs` text NOT NULL,
  `last_update` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Tables'' UI preferences';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pma__tracking`
--

CREATE TABLE `pma__tracking` (
  `db_name` varchar(64) NOT NULL,
  `table_name` varchar(64) NOT NULL,
  `version` int(10) UNSIGNED NOT NULL,
  `date_created` datetime NOT NULL,
  `date_updated` datetime NOT NULL,
  `schema_snapshot` text NOT NULL,
  `schema_sql` text DEFAULT NULL,
  `data_sql` longtext DEFAULT NULL,
  `tracking` set('UPDATE','REPLACE','INSERT','DELETE','TRUNCATE','CREATE DATABASE','ALTER DATABASE','DROP DATABASE','CREATE TABLE','ALTER TABLE','RENAME TABLE','DROP TABLE','CREATE INDEX','DROP INDEX','CREATE VIEW','ALTER VIEW','DROP VIEW') DEFAULT NULL,
  `tracking_active` int(1) UNSIGNED NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Database changes tracking for phpMyAdmin';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pma__userconfig`
--

CREATE TABLE `pma__userconfig` (
  `username` varchar(64) NOT NULL,
  `timevalue` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `config_data` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='User preferences storage for phpMyAdmin';

--
-- Volcado de datos para la tabla `pma__userconfig`
--

INSERT INTO `pma__userconfig` (`username`, `timevalue`, `config_data`) VALUES
('root', '2026-05-04 16:36:31', '{\"Console\\/Mode\":\"collapse\",\"lang\":\"es\"}');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pma__usergroups`
--

CREATE TABLE `pma__usergroups` (
  `usergroup` varchar(64) NOT NULL,
  `tab` varchar(64) NOT NULL,
  `allowed` enum('Y','N') NOT NULL DEFAULT 'N'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='User groups with configured menu items';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pma__users`
--

CREATE TABLE `pma__users` (
  `username` varchar(64) NOT NULL,
  `usergroup` varchar(64) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Users and their assignments to user groups';

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `pma__bookmark`
--
ALTER TABLE `pma__bookmark`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `pma__central_columns`
--
ALTER TABLE `pma__central_columns`
  ADD PRIMARY KEY (`db_name`,`col_name`);

--
-- Indices de la tabla `pma__column_info`
--
ALTER TABLE `pma__column_info`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `db_name` (`db_name`,`table_name`,`column_name`);

--
-- Indices de la tabla `pma__designer_settings`
--
ALTER TABLE `pma__designer_settings`
  ADD PRIMARY KEY (`username`);

--
-- Indices de la tabla `pma__export_templates`
--
ALTER TABLE `pma__export_templates`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `u_user_type_template` (`username`,`export_type`,`template_name`);

--
-- Indices de la tabla `pma__favorite`
--
ALTER TABLE `pma__favorite`
  ADD PRIMARY KEY (`username`);

--
-- Indices de la tabla `pma__history`
--
ALTER TABLE `pma__history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `username` (`username`,`db`,`table`,`timevalue`);

--
-- Indices de la tabla `pma__navigationhiding`
--
ALTER TABLE `pma__navigationhiding`
  ADD PRIMARY KEY (`username`,`item_name`,`item_type`,`db_name`,`table_name`);

--
-- Indices de la tabla `pma__pdf_pages`
--
ALTER TABLE `pma__pdf_pages`
  ADD PRIMARY KEY (`page_nr`),
  ADD KEY `db_name` (`db_name`);

--
-- Indices de la tabla `pma__recent`
--
ALTER TABLE `pma__recent`
  ADD PRIMARY KEY (`username`);

--
-- Indices de la tabla `pma__relation`
--
ALTER TABLE `pma__relation`
  ADD PRIMARY KEY (`master_db`,`master_table`,`master_field`),
  ADD KEY `foreign_field` (`foreign_db`,`foreign_table`);

--
-- Indices de la tabla `pma__savedsearches`
--
ALTER TABLE `pma__savedsearches`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `u_savedsearches_username_dbname` (`username`,`db_name`,`search_name`);

--
-- Indices de la tabla `pma__table_coords`
--
ALTER TABLE `pma__table_coords`
  ADD PRIMARY KEY (`db_name`,`table_name`,`pdf_page_number`);

--
-- Indices de la tabla `pma__table_info`
--
ALTER TABLE `pma__table_info`
  ADD PRIMARY KEY (`db_name`,`table_name`);

--
-- Indices de la tabla `pma__table_uiprefs`
--
ALTER TABLE `pma__table_uiprefs`
  ADD PRIMARY KEY (`username`,`db_name`,`table_name`);

--
-- Indices de la tabla `pma__tracking`
--
ALTER TABLE `pma__tracking`
  ADD PRIMARY KEY (`db_name`,`table_name`,`version`);

--
-- Indices de la tabla `pma__userconfig`
--
ALTER TABLE `pma__userconfig`
  ADD PRIMARY KEY (`username`);

--
-- Indices de la tabla `pma__usergroups`
--
ALTER TABLE `pma__usergroups`
  ADD PRIMARY KEY (`usergroup`,`tab`,`allowed`);

--
-- Indices de la tabla `pma__users`
--
ALTER TABLE `pma__users`
  ADD PRIMARY KEY (`username`,`usergroup`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `pma__bookmark`
--
ALTER TABLE `pma__bookmark`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `pma__column_info`
--
ALTER TABLE `pma__column_info`
  MODIFY `id` int(5) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `pma__export_templates`
--
ALTER TABLE `pma__export_templates`
  MODIFY `id` int(5) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `pma__history`
--
ALTER TABLE `pma__history`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `pma__pdf_pages`
--
ALTER TABLE `pma__pdf_pages`
  MODIFY `page_nr` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `pma__savedsearches`
--
ALTER TABLE `pma__savedsearches`
  MODIFY `id` int(5) UNSIGNED NOT NULL AUTO_INCREMENT;
--
-- Base de datos: `test`
--
CREATE DATABASE IF NOT EXISTS `test` DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci;
USE `test`;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
