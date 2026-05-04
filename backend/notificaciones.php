<?php
// backend/notificaciones.php
session_start();

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit(0);

require_once 'conexion.php';
/** @var PDO $pdo */

// Verificamos que el usuario esté logueado
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["estado" => "error", "mensaje" => "Inicia sesión."]);
    exit();
}

$usuario_id = $_SESSION['user_id'];
$metodo = $_SERVER['REQUEST_METHOD'];



if ($metodo === 'GET') {
    try {
        // Obtenemos las últimas 10 notificaciones del usuario
        $stmt = $pdo->prepare("SELECT * FROM notificaciones WHERE id_usuario = ? ORDER BY fecha_creacion DESC LIMIT 10");
        $stmt->execute([$usuario_id]);
        $notificaciones = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Contamos cuántas están sin leer (para el puntito rojo)
        $stmtNoLeidas = $pdo->prepare("SELECT COUNT(*) as sin_leer FROM notificaciones WHERE id_usuario = ? AND leido = 0");
        $stmtNoLeidas->execute([$usuario_id]);
        $no_leidas = $stmtNoLeidas->fetchColumn();

        echo json_encode([
            "estado" => "exito",
            "notificaciones" => $notificaciones,
            "no_leidas" => $no_leidas
        ]);
    } catch (PDOException $e) {
        echo json_encode(["estado" => "error", "mensaje" => $e->getMessage()]);
    }
}



elseif ($metodo === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);

    if (isset($data['accion']) && $data['accion'] === 'marcar_leidas') {
        try {
            // Actualizamos todas las notificaciones del usuario a leídas
            $stmt = $pdo->prepare("UPDATE notificaciones SET leido = 1 WHERE id_usuario = ?");
            $stmt->execute([$usuario_id]);

            echo json_encode(["estado" => "exito"]);
        } catch (PDOException $e) {
            echo json_encode(["estado" => "error", "mensaje" => $e->getMessage()]);
        }
    }
}
?>