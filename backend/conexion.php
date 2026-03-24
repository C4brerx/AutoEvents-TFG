<?php
$host = '127.0.0.1';
$db   = 'autoevents_db';
$user = 'root';
$pass = ''; // En XAMPP por defecto está vacío
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (PDOException $e) {
    header("Content-Type: application/json; charset=UTF-8");
    echo json_encode(["estado" => "error", "mensaje" => "Error de conexión a la base de datos: " . $e->getMessage()]);
    exit;
}
// SIN ETIQUETA DE CIERRE ?>