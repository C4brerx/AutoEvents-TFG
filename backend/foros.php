<?php
// backend/foros.php

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
    try {
        $sql = "SELECT p.*, u.nombre as autor, 
                (SELECT COUNT(*) FROM comentarios_foro WHERE publicacion_id = p.id) as num_comentarios
                FROM publicaciones p 
                JOIN usuarios u ON p.usuario_id = u.id 
                ORDER BY p.fecha DESC";
        $stmt = $pdo->query($sql);
        echo json_encode(["estado" => "exito", "publicaciones" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    } catch (PDOException $e) {
        // 2. CORRECCIÓN TUTOR: Ocultar el getMessage() al cliente
        error_log("Fallo SQL en foros (GET): " . $e->getMessage());
        http_response_code(500);
        echo json_encode(["estado" => "error", "mensaje" => "Error interno al cargar las publicaciones."]);
    }
}

elseif ($metodo === 'POST' && $usuario_id) {
    $datos = json_decode(file_get_contents("php://input"));

    if (!empty($datos->titulo) && !empty($datos->contenido)) {
        try {
            $titulo_seguro = htmlspecialchars(strip_tags($datos->titulo), ENT_QUOTES, 'UTF-8');
            $contenido_seguro = htmlspecialchars(strip_tags($datos->contenido), ENT_QUOTES, 'UTF-8');
            $categoria_segura = isset($datos->categoria) ? htmlspecialchars(strip_tags($datos->categoria), ENT_QUOTES, 'UTF-8') : 'General';

            $stmt = $pdo->prepare("INSERT INTO publicaciones (usuario_id, titulo, contenido, categoria) VALUES (?, ?, ?, ?)");
            $stmt->execute([$usuario_id, $titulo_seguro, $contenido_seguro, $categoria_segura]);
            echo json_encode(["estado" => "exito", "mensaje" => "Publicación creada correctamente."]);
        } catch (PDOException $e) {
            error_log("Fallo SQL en foros (POST): " . $e->getMessage());
            http_response_code(500);
            echo json_encode(["estado" => "error", "mensaje" => "Error interno al publicar."]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["estado" => "error", "mensaje" => "El título y el contenido son obligatorios."]);
    }
}
?>