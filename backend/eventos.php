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



// LEER EVENTOS (GET)

if ($metodo === 'GET') {
    try {
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
        echo json_encode(["estado" => "error", "mensaje" => "Error al cargar eventos: " . $e->getMessage()]);
    }
}

elseif ($metodo === 'POST') {
    $datos = json_decode(file_get_contents("php://input"), true);
    $accion = $datos['accion'] ?? '';

    // --- LÓGICA DE ASISTENCIA ---
    if ($accion === 'toggle_asistencia') {
        $id_evento = intval($datos['id_evento'] ?? 0);
        if (!$id_evento) exit();

        try {
            // 🛡️ SEGURIDAD: INICIO DE TRANSACCIÓN PARA EVITAR RACE CONDITIONS
            $pdo->beginTransaction();

            // CORRECCIÓN: Buscamos * en lugar de id porque la tabla intermedia no suele tener columna id propia
            $check = $pdo->prepare("SELECT * FROM eventos_asistentes WHERE id_evento = ? AND id_usuario = ? FOR UPDATE");
            $check->execute([$id_evento, $usuario_id]);

            if ($check->rowCount() > 0) {
                // DESAPUNTARSE
                $del = $pdo->prepare("DELETE FROM eventos_asistentes WHERE id_evento = ? AND id_usuario = ?");
                $del->execute([$id_evento, $usuario_id]);

                $pdo->commit(); // Confirmamos borrado
                echo json_encode(["estado" => "exito", "mensaje" => "Te has desapuntado del evento.", "apuntado" => false]);
            } else {
                // APUNTARSE: Comprobamos aforo real en el servidor
                $stmtAforo = $pdo->prepare("SELECT aforo_maximo, (SELECT COUNT(*) FROM eventos_asistentes WHERE id_evento = ?) as actuales FROM eventos WHERE id = ? FOR UPDATE");
                $stmtAforo->execute([$id_evento, $id_evento]);
                $info = $stmtAforo->fetch(PDO::FETCH_ASSOC);

                // Si hay límite de aforo y ya está lleno, cancelamos la transacción
                if ($info['aforo_maximo'] !== null && $info['actuales'] >= $info['aforo_maximo']) {
                    $pdo->rollBack();
                    http_response_code(403);
                    echo json_encode(["estado" => "error", "mensaje" => "Lo sentimos, el evento está lleno."]);
                    exit();
                }

                // Insertamos asistencia
                $ins = $pdo->prepare("INSERT INTO eventos_asistentes (id_evento, id_usuario) VALUES (?, ?)");
                $ins->execute([$id_evento, $usuario_id]);

                // Notificación
                $stmtEvento = $pdo->prepare("SELECT titulo FROM eventos WHERE id = ?");
                $stmtEvento->execute([$id_evento]);
                $tituloEvento = $stmtEvento->fetchColumn();

                $mensaje = "Has reservado tu plaza correctamente para el evento: " . $tituloEvento . ". ¡Pásalo genial!";
                $stmtNotif = $pdo->prepare("INSERT INTO notificaciones (id_usuario, titulo, mensaje, icono) VALUES (?, ?, ?, ?)");
                $stmtNotif->execute([
                    $usuario_id,
                    "¡Plaza Confirmada!",
                    $mensaje,
                    "bi-ticket-perforated-fill"
                ]);

                $pdo->commit(); // Confirmamos todos los cambios (apuntado + notificación)
                echo json_encode(["estado" => "exito", "mensaje" => "¡Plaza reservada con éxito!", "apuntado" => true]);
            }
        } catch (Exception $e) {
            // Si algo falla, deshacemos la transacción y mostramos el error EXACTO para poder arreglarlo
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            http_response_code(500);
            echo json_encode(["estado" => "error", "mensaje" => "Fallo en la BD: " . $e->getMessage()]);
        }
    }

    // --- LÓGICA DE CREAR EVENTO ---
    elseif ($accion === 'crear_evento') {
        $titulo = trim($datos['titulo']);
        $descripcion = trim($datos['descripcion']);
        $fecha = $datos['fecha'];
        $ubicacion = trim($datos['ubicacion']);
        $tipo = $datos['tipo'];
        $aforo = !empty($datos['aforo_maximo']) ? intval($datos['aforo_maximo']) : null;
        $imagen_url = !empty($datos['imagen_url']) ? trim($datos['imagen_url']) : 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=800';

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
                http_response_code(500);
                echo json_encode(["estado" => "error", "mensaje" => "Error al guardar el evento: " . $e->getMessage()]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["estado" => "error", "mensaje" => "Faltan campos obligatorios."]);
        }
    }
}
?>