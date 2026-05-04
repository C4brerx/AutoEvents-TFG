<?php
// backend/logros.php
session_start();

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit(0);

require_once 'conexion.php';
/** @var PDO $pdo */

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["estado" => "error", "mensaje" => "Inicia sesión."]);
    exit();
}

$usuario_id = $_SESSION['user_id'];

try {

    // CORRECCIÓN: Aquí ponemos 'usuario_id' para la tabla vehiculos

    $stmtCoches = $pdo->prepare("SELECT COUNT(*) FROM vehiculos WHERE usuario_id = ?");
    $stmtCoches->execute([$usuario_id]);
    $total_coches = (int) $stmtCoches->fetchColumn();

    // En la tabla eventos_asistentes sí que usamos id_usuario
    $stmtEventos = $pdo->prepare("SELECT COUNT(*) FROM eventos_asistentes WHERE id_usuario = ?");
    $stmtEventos->execute([$usuario_id]);
    $total_eventos = (int) $stmtEventos->fetchColumn();

    $xp_por_coche = 500;
    $xp_por_evento = 200;
    $xp_total = ($total_coches * $xp_por_coche) + ($total_eventos * $xp_por_evento);

    // Calculamos el Nivel (Cada 1000 XP es 1 nivel. Empezamos en Nivel 1)
    $nivel = floor($xp_total / 1000) + 1;

    $xp_actual_nivel = $xp_total % 1000;
    $porcentaje_progreso = ($xp_actual_nivel / 1000) * 100;

    $logros = [];

    // Insignias por Garaje
    if ($total_coches >= 1) $logros[] = ["titulo" => "Mecánico Novato", "desc" => "Añadiste tu primer coche.", "icono" => "bi-wrench-adjustable", "color" => "text-info", "bg" => "bg-info"];
    if ($total_coches >= 3) $logros[] = ["titulo" => "Coleccionista", "desc" => "Tienes 3 o más vehículos.", "icono" => "bi-car-front-fill", "color" => "text-warning", "bg" => "bg-warning"];

    // Insignias por Eventos
    if ($total_eventos >= 1) $logros[] = ["titulo" => "Bautismo de Fuego", "desc" => "Te apuntaste a tu primer evento.", "icono" => "bi-flag-fill", "color" => "text-success", "bg" => "bg-success"];
    if ($total_eventos >= 5) $logros[] = ["titulo" => "Piloto Veterano", "desc" => "Asististe a 5 eventos.", "icono" => "bi-trophy-fill", "color" => "text-warning", "bg" => "bg-warning"];

    // Insignia Suprema
    if ($nivel >= 5) $logros[] = ["titulo" => "Leyenda AutoEvents", "desc" => "Alcanzaste el Nivel 5.", "icono" => "bi-star-fill", "color" => "text-danger", "bg" => "bg-danger"];

    echo json_encode([
        "estado" => "exito",
        "stats" => [
            "nivel" => $nivel,
            "xp_total" => $xp_total,
            "progreso" => $porcentaje_progreso,
            "coches" => $total_coches,
            "eventos" => $total_eventos,
            "logros" => $logros
        ]
    ]);
} catch (Exception $e) {
    echo json_encode(["estado" => "error", "mensaje" => $e->getMessage()]);
}
?>