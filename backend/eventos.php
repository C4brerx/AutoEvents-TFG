<?php
// backend/eventos.php
session_start();

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


// LEER EVENTOS (Y SABER SI ESTOY APUNTADO)

if ($metodo === 'GET') {
    try {
        // Obtenemos todos los eventos + calculamos si el usuario actual está apuntado (1 o 0) + contamos aforo
        $sql = "SELECT e.*, 
                IF(a.id_usuario IS NOT NULL, 1, 0) AS apuntado,
                (SELECT COUNT(*) FROM eventos_asistentes WHERE id_evento = e.id) AS asistentes_actuales
                FROM eventos e 
                LEFT JOIN eventos_asistentes a ON e.id = a.id_evento AND a.id_usuario = :usuario_id
                WHERE e.fecha >= CURRENT_DATE() 
                ORDER BY e.fecha ASC";

        $stmt = $pdo->prepare($sql);
        $stmt->execute([':usuario_id' => $usuario_id]);
        $eventos = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(["estado" => "exito", "eventos" => $eventos]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["estado" => "error", "mensaje" => "Error al cargar eventos."]);
    }
}


// CREAR EVENTO O APUNTARSE/DESAPUNTARSE

elseif ($metodo === 'POST') {
    // Leemos el JSON enviado por React
    $datos = json_decode(file_get_contents("php://input"), true);
    $accion = $datos['accion'] ?? '';

    if ($accion === 'toggle_asistencia') {
        $id_evento = $datos['id_evento'] ?? null;
        if (!$id_evento) exit();

        try {
            // Comprobamos si ya está apuntado
            $check = $pdo->prepare("SELECT * FROM eventos_asistentes WHERE id_evento = :id_evento AND id_usuario = :id_usuario");
            $check->execute([':id_evento' => $id_evento, ':id_usuario' => $usuario_id]);

            if ($check->rowCount() > 0) {
                // Si ya está apuntado -> Lo borramos (Desapuntarse)
                $del = $pdo->prepare("DELETE FROM eventos_asistentes WHERE id_evento = :id_evento AND id_usuario = :id_usuario");
                $del->execute([':id_evento' => $id_evento, ':id_usuario' => $usuario_id]);
                echo json_encode(["estado" => "exito", "mensaje" => "Te has desapuntado del evento.", "apuntado" => false]);
            } else {
                // Si no está apuntado -> Lo insertamos (Apuntarse)
                $ins = $pdo->prepare("INSERT INTO eventos_asistentes (id_evento, id_usuario) VALUES (:id_evento, :id_usuario)");
                $ins->execute([':id_evento' => $id_evento, ':id_usuario' => $usuario_id]);

                // ========================================================
                // NUEVO: CREAR NOTIFICACIÓN AL APUNTARSE
                // ========================================================
                // 1. Conseguimos el título del evento
                $stmtEvento = $pdo->prepare("SELECT titulo FROM eventos WHERE id = :id_evento");
                $stmtEvento->execute([':id_evento' => $id_evento]);
                $tituloEvento = $stmtEvento->fetchColumn();

                // 2. Insertamos la notificación
                $mensaje = "Has reservado tu plaza correctamente para el evento: " . $tituloEvento . ". ¡Pásalo genial!";
                $stmtNotif = $pdo->prepare("INSERT INTO notificaciones (id_usuario, titulo, mensaje, icono) VALUES (:id_usuario, :titulo_notif, :mensaje, :icono)");
                $stmtNotif->execute([
                    ':id_usuario' => $usuario_id,
                    ':titulo_notif' => "¡Plaza Confirmada!",
                    ':mensaje' => $mensaje,
                    ':icono' => "bi-ticket-perforated-fill"
                ]);
                // ========================================================

                echo json_encode(["estado" => "exito", "mensaje" => "¡Plaza reservada con éxito!", "apuntado" => true]);
            }
        } catch (PDOException $e) {
            echo json_encode(["estado" => "error", "mensaje" => "Error al gestionar asistencia."]);
        }
    }

    elseif ($accion === 'crear_evento') {
        // Lógica para crear un evento nuevo en la DB
        $titulo = trim($datos['titulo']);
        $descripcion = trim($datos['descripcion']);
        $fecha = $datos['fecha'];
        $ubicacion = trim($datos['ubicacion']);
        $tipo = $datos['tipo'];
        $aforo = !empty($datos['aforo_maximo']) ? intval($datos['aforo_maximo']) : null;
        $imagen_url = !empty($datos['imagen_url']) ? trim($datos['imagen_url']) : 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=800'; // Default

        if ($titulo && $fecha && $ubicacion && $tipo) {
            try {
                $sql = "INSERT INTO eventos (titulo, descripcion, fecha, ubicacion, tipo, aforo_maximo, imagen_url) VALUES (:titulo, :descripcion, :fecha, :ubicacion, :tipo, :aforo_maximo, :imagen_url)";
                $stmt = $pdo->prepare($sql);
                $stmt->execute([
                    ':titulo' => $titulo, ':descripcion' => $descripcion, ':fecha' => $fecha,
                    ':ubicacion' => $ubicacion, ':tipo' => $tipo, ':aforo_maximo' => $aforo, ':imagen_url' => $imagen_url
                ]);
                echo json_encode(["estado" => "exito", "mensaje" => "¡Evento creado con éxito!"]);
            } catch (PDOException $e) {
                echo json_encode(["estado" => "error", "mensaje" => "Error al guardar el evento."]);
            }
        } else {
            echo json_encode(["estado" => "error", "mensaje" => "Faltan campos obligatorios."]);
        }
    }
}
?>