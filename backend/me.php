<?php
// backend/me.php
session_set_cookie_params(['lifetime' => 86400, 'path' => '/', 'httponly' => true, 'samesite' => 'Lax']);
session_start();

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit(0);

require_once 'conexion.php';
/** @var PDO $pdo */

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["estado" => "error", "mensaje" => "No logueado"]);
    exit();
}

try {
    $stmt = $pdo->prepare("SELECT id, nombre, email, rol, foto_perfil FROM usuarios WHERE id = ?");
    $stmt->execute([$_SESSION['user_id']]);
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($usuario) {
        echo json_encode(["estado" => "exito", "usuario" => $usuario]);
    } else {
        http_response_code(401);
        echo json_encode(["estado" => "error", "mensaje" => "Usuario no encontrado"]);
    }
} catch (Exception $e) {
    error_log("Error en me.php: " . $e->getMessage());
    http_response_code(500);
}
?>