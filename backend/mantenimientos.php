<?php
// backend/mantenimientos.php
session_set_cookie_params(['lifetime' => 86400, 'path' => '/', 'httponly' => true, 'samesite' => 'Lax']);
if (session_status() === PHP_SESSION_NONE) session_start();

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit(0);

require_once 'conexion.php';
/** @var PDO $pdo */

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["estado" => "error", "mensaje" => "No autorizado"]);
    exit();
}

$metodo = $_SERVER['REQUEST_METHOD'];

if ($metodo === 'GET') {
    $vehiculo_id = intval($_GET['vehiculo_id'] ?? 0);
    try {
        $stmt = $pdo->prepare("SELECT * FROM vehiculo_mantenimientos WHERE vehiculo_id = ? ORDER BY fecha DESC");
        $stmt->execute([$vehiculo_id]);
        echo json_encode(["estado" => "exito", "mantenimientos" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    } catch (Exception $e) {
        error_log("Error SQL Mantenimientos GET: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(["estado" => "error", "mensaje" => "Error al cargar mantenimientos."]);
    }
}

if ($metodo === 'POST') {
    $datos = json_decode(file_get_contents("php://input"));
    if (!empty($datos->vehiculo_id) && !empty($datos->tarea) && isset($datos->km_actuales)) {
        try {
            $stmt = $pdo->prepare("INSERT INTO vehiculo_mantenimientos (vehiculo_id, tarea, km_actuales, coste) VALUES (?, ?, ?, ?)");
            $stmt->execute([
                $datos->vehiculo_id,
                htmlspecialchars(strip_tags($datos->tarea), ENT_QUOTES),
                intval($datos->km_actuales),
                floatval($datos->coste ?? 0)
            ]);
            echo json_encode(["estado" => "exito", "mensaje" => "Registro añadido"]);
        } catch (Exception $e) {
            error_log("Error SQL Mantenimientos POST: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(["estado" => "error", "mensaje" => "Error al guardar el registro."]);
        }
    }
}

if ($metodo === 'DELETE') {
    $id = intval($_GET['id'] ?? 0);
    try {
        $stmt = $pdo->prepare("DELETE FROM vehiculo_mantenimientos WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(["estado" => "exito"]);
    } catch (Exception $e) {
        error_log("Error SQL Mantenimientos DELETE: " . $e->getMessage());
        http_response_code(500);
    }
}
?>