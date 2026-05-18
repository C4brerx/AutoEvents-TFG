<?php
// backend/notificaciones.php

session_set_cookie_params([
    'lifetime' => 86400,
    'path' => '/',
    'domain' => 'localhost',
    'secure' => false,
    'httponly' => true,
    'samesite' => 'Lax'
]);

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit(0);

require_once 'conexion.php';
/** @var PDO $pdo */

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["estado" => "error", "mensaje" => "Inicia sesión."]);
    exit();
}

$usuario_id = $_SESSION['user_id'];
$metodo = $_SERVER['REQUEST_METHOD'];

if ($metodo === 'GET') {
    try {
        $stmt = $pdo->prepare("SELECT * FROM notificaciones WHERE id_usuario = ? ORDER BY fecha_creacion DESC LIMIT 10");
        $stmt->execute([$usuario_id]);
        $notificaciones = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $stmtNoLeidas = $pdo->prepare("SELECT COUNT(*) as sin_leer FROM notificaciones WHERE id_usuario = ? AND leido = 0");
        $stmtNoLeidas->execute([$usuario_id]);
        $no_leidas = $stmtNoLeidas->fetchColumn();

        echo json_encode([
            "estado" => "exito",
            "notificaciones" => $notificaciones,
            "no_leidas" => $no_leidas
        ]);
    } catch (PDOException $e) {
        error_log("Fallo SQL en notificaciones (GET): " . $e->getMessage());
        http_response_code(500);
        echo json_encode(["estado" => "error", "mensaje" => "Error interno al cargar las notificaciones."]);
    }
}

elseif ($metodo === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);

    if (isset($data['accion']) && $data['accion'] === 'marcar_leidas') {
        try {
            $stmt = $pdo->prepare("UPDATE notificaciones SET leido = 1 WHERE id_usuario = ?");
            $stmt->execute([$usuario_id]);

            echo json_encode(["estado" => "exito"]);
        } catch (PDOException $e) {
            error_log("Fallo SQL en notificaciones (POST): " . $e->getMessage());
            http_response_code(500);
            echo json_encode(["estado" => "error", "mensaje" => "Error interno al actualizar las notificaciones."]);
        }
    }
}
?>