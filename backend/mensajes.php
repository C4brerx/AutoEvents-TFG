<?php
// backend/mensajes.php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once 'conexion.php';
/** @var PDO $pdo */

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

$mi_id = $_SESSION['user_id'] ?? $_SESSION['usuario_id'] ?? null;

if (!$mi_id) {
    echo json_encode(["estado" => "error", "mensaje" => "No autorizado. Inicia sesión."]);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        if (isset($_GET['accion']) && $_GET['accion'] === 'contactos') {
            $stmt = $pdo->prepare("SELECT id as otro_id, nombre as otro_nombre FROM usuarios WHERE id != ? ORDER BY nombre ASC");
            $stmt->execute([$mi_id]);
            echo json_encode(["estado" => "exito", "conversaciones" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
            exit();
        }
        if (isset($_GET['chat_con'])) {
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
    } catch (PDOException $e) {
        error_log("Fallo SQL en mensajes (GET): " . $e->getMessage());
        http_response_code(500);
        echo json_encode(["estado" => "error", "mensaje" => "Error interno al cargar la bandeja de entrada."]);
    }

} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);

    $remitente_id = $mi_id;
    $destinatario_id = isset($data['destinatario_id']) ? $data['destinatario_id'] : 1;
    $contenido = isset($data['contenido']) ? htmlspecialchars(strip_tags($data['contenido']), ENT_QUOTES, 'UTF-8') : '';
    $producto_id = isset($data['producto_id']) ? $data['producto_id'] : null;

    try {
        $pdo->beginTransaction();

        $stmt = $pdo->prepare("INSERT INTO mensajes (remitente_id, destinatario_id, producto_id, contenido) VALUES (?, ?, ?, ?)");
        if ($stmt->execute([$remitente_id, $destinatario_id, $producto_id, $contenido])) {

            $stmtNom = $pdo->prepare("SELECT nombre FROM usuarios WHERE id = ?");
            $stmtNom->execute([$mi_id]);
            $mi_nombre = $stmtNom->fetchColumn() ?: 'Un usuario';

            $msg_noti = "💬 Nuevo mensaje directo de " . $mi_nombre;
            $stmtNoti = $pdo->prepare("INSERT INTO notificaciones (id_usuario, mensaje) VALUES (?, ?)");
            $stmtNoti->execute([$destinatario_id, $msg_noti]);


            $pdo->commit();
            echo json_encode(["estado" => "exito", "mensaje" => "Enviado"]);
        } else {
            $pdo->rollBack();
            echo json_encode(["estado" => "error", "mensaje" => "Error BD"]);
        }
    } catch (PDOException $e) {
        if ($pdo->inTransaction()) { $pdo->rollBack(); }
        error_log("Fallo SQL en mensajes (POST): " . $e->getMessage());
        http_response_code(500);
        echo json_encode(["estado" => "error", "mensaje" => "Error interno al enviar el mensaje."]);
    }
}
?>