<?php
// backend/admin_stats.php
session_set_cookie_params(['lifetime' => 86400, 'path' => '/', 'httponly' => true, 'samesite' => 'Lax']);
session_start();

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit(0);

require_once 'conexion.php';
/** @var PDO $pdo */

// 1. SEGURIDAD: Comprobar sesión
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["estado" => "error", "mensaje" => "No autorizado."]);
    exit();
}

$usuario_id = $_SESSION['user_id'];

try {
    // 2. SEGURIDAD: Comprobar que el usuario es ADMIN
    $stmtAdmin = $pdo->prepare("SELECT rol FROM usuarios WHERE id = ?");
    $stmtAdmin->execute([$usuario_id]);
    $rol = $stmtAdmin->fetchColumn();

    if ($rol !== 'admin') {
        http_response_code(403);
        echo json_encode(["estado" => "error", "mensaje" => "Acceso denegado. Modo Dios requerido."]);
        exit();
    }


    // Tarjetas principales
    $total_usuarios = $pdo->query("SELECT COUNT(*) FROM usuarios")->fetchColumn();
    $total_vehiculos = $pdo->query("SELECT COUNT(*) FROM vehiculos")->fetchColumn();
    $total_eventos = $pdo->query("SELECT COUNT(*) FROM eventos")->fetchColumn();
    $total_asistencias = $pdo->query("SELECT COUNT(*) FROM eventos_asistentes")->fetchColumn();

    // Gráfico 1: Marcas de coche más populares
    $stmtMarcas = $pdo->query("SELECT marca, COUNT(*) as cantidad FROM vehiculos GROUP BY marca ORDER BY cantidad DESC LIMIT 5");
    $grafico_marcas = $stmtMarcas->fetchAll(PDO::FETCH_ASSOC);

    $stmtTipos = $pdo->query("SELECT tipo, COUNT(*) as cantidad FROM eventos GROUP BY tipo");
    $grafico_tipos = $stmtTipos->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "estado" => "exito",
        "tarjetas" => [
            "usuarios" => $total_usuarios,
            "vehiculos" => $total_vehiculos,
            "eventos" => $total_eventos,
            "asistencias" => $total_asistencias
        ],
        "grafico_marcas" => $grafico_marcas,
        "grafico_tipos" => $grafico_tipos
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["estado" => "error", "mensaje" => "Error al obtener estadísticas."]);
}
?>