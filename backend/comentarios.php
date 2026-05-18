<?php
// backend/comentarios.php

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

$metodo = $_SERVER['REQUEST_METHOD'];
$usuario_id = $_SESSION['user_id'] ?? null;

if ($metodo === 'GET') {
    $post_id = intval($_GET['post_id'] ?? 0);
    try {
        $sql = "SELECT c.*, u.nombre as autor 
                FROM comentarios_foro c 
                JOIN usuarios u ON c.usuario_id = u.id 
                WHERE c.publicacion_id = :post_id 
                ORDER BY c.fecha ASC";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':post_id' => $post_id]);

        echo json_encode(["estado" => "exito", "comentarios" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    } catch (PDOException $e) {
        error_log("Fallo SQL en comentarios (GET): " . $e->getMessage());
        http_response_code(500);
        echo json_encode(["estado" => "error", "mensaje" => "Error al cargar comentarios."]);
    }
}

elseif ($metodo === 'POST' && $usuario_id) {
    $datos = json_decode(file_get_contents("php://input"));

    if (!empty($datos->publicacion_id) && !empty($datos->contenido)) {
        try {
            $stmt = $pdo->prepare("INSERT INTO comentarios_foro (publicacion_id, usuario_id, contenido) VALUES (?, ?, ?)");
            $contenido_seguro = htmlspecialchars(strip_tags($datos->contenido), ENT_QUOTES, 'UTF-8');
            $stmt->execute([$datos->publicacion_id, $usuario_id, trim($contenido_seguro)]);

            echo json_encode(["estado" => "exito", "mensaje" => "Comentario publicado."]);
        } catch (PDOException $e) {
            error_log("Fallo SQL en comentarios (POST): " . $e->getMessage());
            http_response_code(500);
            echo json_encode(["estado" => "error", "mensaje" => "Error al publicar."]);
        }
    }
} else {
    http_response_code(401);
}
?>