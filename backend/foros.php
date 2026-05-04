<?php
// backend/foros.php
session_start();
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
        http_response_code(500);
        echo json_encode(["estado" => "error", "mensaje" => $e->getMessage()]);
    }
}

elseif ($metodo === 'POST' && $usuario_id) {
    $datos = json_decode(file_get_contents("php://input"));
    if (!empty($datos->titulo) && !empty($datos->contenido)) {
        try {
            $stmt = $pdo->prepare("INSERT INTO publicaciones (usuario_id, titulo, contenido, categoria) VALUES (?, ?, ?, ?)");
            $stmt->execute([$usuario_id, $datos->titulo, $datos->contenido, $datos->categoria ?? 'General']);
            echo json_encode(["estado" => "exito", "mensaje" => "Publicación creada correctamente."]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["estado" => "error", "mensaje" => "Error al publicar."]);
        }
    }
}
?>