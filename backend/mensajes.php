<?php
// backend/mensajes.php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization"); // <-- Cabecera mágica
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once 'conexion.php';
/** @var PDO $pdo */

session_start();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $mi_id = isset($_GET['mi_id']) ? $_GET['mi_id'] : (isset($_SESSION['usuario_id']) ? $_SESSION['usuario_id'] : 1);

    if (isset($_GET['chat_con'])) {
        // Cargar mensajes de un chat
        $otro_id = $_GET['chat_con'];
        $stmt = $pdo->prepare("
            SELECT m.*, u.nombre as remitente_nombre 
            FROM mensajes m 
            JOIN usuarios u ON m.remitente_id = u.id 
            WHERE (m.remitente_id = ? AND m.destinatario_id = ?) 
               OR (m.remitente_id = ? AND m.destinatario_id = ?) 
            ORDER BY m.fecha ASC
        ");
        $stmt->execute([$mi_id, $otro_id, $otro_id, $mi_id]);
        echo json_encode(["estado" => "exito", "mensajes" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    } else {
        // Cargar bandeja de entrada
        $stmt = $pdo->prepare("
            SELECT u.id as otro_id, u.nombre as otro_nombre, MAX(m.fecha) as ultimo_mensaje_fecha
            FROM mensajes m
            JOIN usuarios u ON (u.id = m.remitente_id OR u.id = m.destinatario_id)
            WHERE (m.remitente_id = ? OR m.destinatario_id = ?) AND u.id != ?
            GROUP BY u.id, u.nombre
            ORDER BY ultimo_mensaje_fecha DESC
        ");
        $stmt->execute([$mi_id, $mi_id, $mi_id]);
        echo json_encode(["estado" => "exito", "conversaciones" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);

    // Recogemos explícitamente quién lo envía desde React
    $remitente_id = isset($data['remitente_id']) ? $data['remitente_id'] : (isset($_SESSION['usuario_id']) ? $_SESSION['usuario_id'] : 1);
    $destinatario_id = isset($data['destinatario_id']) ? $data['destinatario_id'] : 1;
    $contenido = isset($data['contenido']) ? $data['contenido'] : '';
    $producto_id = isset($data['producto_id']) ? $data['producto_id'] : null;

    $stmt = $pdo->prepare("INSERT INTO mensajes (remitente_id, destinatario_id, producto_id, contenido) VALUES (?, ?, ?, ?)");
    if ($stmt->execute([$remitente_id, $destinatario_id, $producto_id, $contenido])) {
        echo json_encode(["estado" => "exito", "mensaje" => "Enviado"]);
    } else {
        echo json_encode(["estado" => "error", "mensaje" => "Error BD"]);
    }
}
?>