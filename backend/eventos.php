<?php
// backend/eventos.php
session_set_cookie_params(['lifetime' => 86400, 'path' => '/', 'domain' => 'localhost', 'secure' => false, 'httponly' => true, 'samesite' => 'Lax']);
if (session_status() === PHP_SESSION_NONE) { session_start(); }

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit(0);

require_once 'conexion.php';
/** @var PDO $pdo */

$metodo = $_SERVER['REQUEST_METHOD'];
$usuario_id = $_SESSION['user_id'] ?? null;
$usuario_rol = $_SESSION['rol'] ?? 'usuario';

if ($metodo === 'GET') {
    try {
        $params = [':uid_apuntado' => $usuario_id];

        $sql = "SELECT e.*, 
                (SELECT COUNT(*) FROM evento_asistentes WHERE evento_id = e.id) as asistentes_actuales,
                (SELECT COUNT(*) FROM evento_asistentes WHERE evento_id = e.id AND usuario_id = :uid_apuntado) as apuntado
                FROM eventos e ";

        if ($usuario_rol !== 'admin') {
            $sql .= " WHERE e.estado = 'aprobado' OR e.creador_id = :uid_creador ";
            $params[':uid_creador'] = $usuario_id;
        }
        $sql .= " ORDER BY e.fecha ASC";

        $stmt = $pdo->prepare($sql);
        if (!$stmt) {
            throw new Exception("Fallo en la consulta: " . implode(" ", $pdo->errorInfo()));
        }

        $stmt->execute($params);
        echo json_encode(["estado" => "exito", "eventos" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        exit();

    } catch (Throwable $e) {
        http_response_code(500);
        echo json_encode(["estado" => "error", "mensaje" => "Error SQL: " . $e->getMessage()]);
        exit();
    }
}

if ($metodo === 'POST' && $usuario_id) {
    $datos = json_decode(file_get_contents("php://input"));

    if (isset($datos->accion) && $datos->accion === 'crear_evento') {
        if ($usuario_rol !== 'admin') {
            try {
                $stmt_spam = $pdo->prepare("SELECT MAX(fecha_creacion) FROM eventos WHERE creador_id = ?");
                $stmt_spam->execute([$usuario_id]);
                $ultima_fecha = $stmt_spam->fetchColumn();

                if ($ultima_fecha) {
                    $horas = (strtotime('now') - strtotime($ultima_fecha)) / 3600;
                    if ($horas < 24) {
                        echo json_encode(["estado" => "error", "mensaje" => "Para evitar spam, solo puedes proponer 1 evento cada 24 horas."]);
                        exit();
                    }
                }
                $estado = 'pendiente';
            } catch (Throwable $e) {
                http_response_code(500);
                echo json_encode(["estado" => "error", "mensaje" => "Error Anti-Spam: " . $e->getMessage()]);
                exit();
            }
        } else {
            $estado = 'aprobado';
        }
        $imagen_url = $datos->imagen_url;
        if (!empty($imagen_url)) {
            if (!filter_var($imagen_url, FILTER_VALIDATE_URL)) {
                http_response_code(400);
                echo json_encode(["estado" => "error", "mensaje" => "La URL de la imagen no es válida."]);
                exit();
            }
            if (!preg_match('/^https?:\/\//i', $imagen_url)) {
                http_response_code(400);
                echo json_encode(["estado" => "error", "mensaje" => "La URL debe empezar por http:// o https://"]);
                exit();
            }
        }
        try {
            $stmt = $pdo->prepare("INSERT INTO eventos (creador_id, titulo, descripcion, fecha, ubicacion, tipo, aforo_maximo, imagen_url, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $usuario_id,
                htmlspecialchars(strip_tags($datos->titulo)), htmlspecialchars(strip_tags($datos->descripcion)),
                $datos->fecha, htmlspecialchars(strip_tags($datos->ubicacion)), htmlspecialchars(strip_tags($datos->tipo)),
                $datos->aforo_maximo ?: null, $datos->imagen_url, $estado
            ]);
            echo json_encode(["estado" => "exito", "mensaje" => $estado === 'aprobado' ? "Evento publicado." : "Evento enviado para revisión."]);
            exit();
        } catch (Throwable $e) {
            http_response_code(500);
            echo json_encode(["estado" => "error", "mensaje" => "Error Guardar Evento: " . $e->getMessage()]);
            exit();
        }
    }

    if (isset($datos->accion) && $datos->accion === 'toggle_asistencia') {
        try {
            $pdo->beginTransaction();

            $stmtLock = $pdo->prepare("SELECT aforo_maximo, (SELECT COUNT(*) FROM evento_asistentes WHERE evento_id = ?) as actuales, titulo FROM eventos WHERE id = ? FOR UPDATE");
            $stmtLock->execute([$datos->id_evento, $datos->id_evento]);
            $evento = $stmtLock->fetch(PDO::FETCH_ASSOC);

            $stmtCheck = $pdo->prepare("SELECT id FROM evento_asistentes WHERE usuario_id = ? AND evento_id = ?");
            $stmtCheck->execute([$usuario_id, $datos->id_evento]);
            $ya_apuntado = $stmtCheck->fetchColumn();

            if ($ya_apuntado) {
                $stmtDel = $pdo->prepare("DELETE FROM evento_asistentes WHERE usuario_id = ? AND evento_id = ?");
                $stmtDel->execute([$usuario_id, $datos->id_evento]);
                $apuntado = false;
            } else {
                if ($evento['aforo_maximo'] !== null && $evento['actuales'] >= $evento['aforo_maximo']) {
                    $pdo->rollBack();
                    echo json_encode(["estado" => "error", "mensaje" => "El aforo está completo."]);
                    exit();
                }
                $stmtIns = $pdo->prepare("INSERT INTO evento_asistentes (usuario_id, evento_id) VALUES (?, ?)");
                $stmtIns->execute([$usuario_id, $datos->id_evento]);
                $apuntado = true;

                $titulo_limpio = $evento['titulo'] ?? 'el evento';
                $msg_notificacion = "✅ ¡Plaza confirmada! Te has apuntado correctamente a: " . $titulo_limpio;
                $stmtNoti = $pdo->prepare("INSERT INTO notificaciones (id_usuario, mensaje) VALUES (?, ?)");
                $stmtNoti->execute([$usuario_id, $msg_notificacion]);
            }

            $pdo->commit();
            echo json_encode(["estado" => "exito", "apuntado" => $apuntado]);
            exit();
        } catch (Throwable $e) {
            $pdo->rollBack();
            http_response_code(500);
            echo json_encode(["estado" => "error", "mensaje" => "Error Asistencia: " . $e->getMessage()]);
            exit();
        }
    }
}

if ($metodo === 'PUT' && $usuario_rol === 'admin') {
    $datos = json_decode(file_get_contents("php://input"));
    $imagen_url = $datos->imagen_url;
    if (!empty($imagen_url)) {
        if (!filter_var($imagen_url, FILTER_VALIDATE_URL)) {
            http_response_code(400);
            echo json_encode(["estado" => "error", "mensaje" => "La URL de la imagen no es válida."]);
            exit();
        }
        if (!preg_match('/^https?:\/\//i', $imagen_url)) {
            http_response_code(400);
            echo json_encode(["estado" => "error", "mensaje" => "La URL debe empezar por http:// o https://"]);
            exit();
        }
    }
    try {
        if (isset($datos->accion) && $datos->accion === 'aprobar') {
            $pdo->beginTransaction();

            $stmt = $pdo->prepare("UPDATE eventos SET estado = 'aprobado' WHERE id = ?");
            $stmt->execute([$datos->id]);

            $stmtTit = $pdo->prepare("SELECT titulo FROM eventos WHERE id = ?");
            $stmtTit->execute([$datos->id]);
            $titulo_evento = $stmtTit->fetchColumn();

            $msg_global = "🏎️ ¡Nuevo evento! Se ha publicado: " . ($titulo_evento ?: 'un nuevo plan') . ". ¡No te quedes sin plaza!";
            $stmtGlobal = $pdo->prepare("INSERT INTO notificaciones (id_usuario, mensaje) SELECT id, ? FROM usuarios");
            $stmtGlobal->execute([$msg_global]);

            $pdo->commit();

        } else {
            $stmt = $pdo->prepare("UPDATE eventos SET titulo=?, descripcion=?, fecha=?, ubicacion=?, tipo=?, aforo_maximo=?, imagen_url=? WHERE id=?");
            $stmt->execute([$datos->titulo, $datos->descripcion, $datos->fecha, $datos->ubicacion, $datos->tipo, $datos->aforo_maximo ?: null, $datos->imagen_url, $datos->id]);
        }
        echo json_encode(["estado" => "exito"]);
        exit();
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        http_response_code(500);
        echo json_encode(["estado" => "error", "mensaje" => "Error UPDATE: " . $e->getMessage()]);
        exit();
    }
}

if ($metodo === 'DELETE') {
    if ($usuario_rol !== 'admin') {
        http_response_code(403);
        echo json_encode(["estado" => "error", "mensaje" => "Acceso denegado. Se requiere rol de administrador."]);
        exit();
    }

    $id = intval($_GET['id'] ?? 0);
    try {
        $stmt = $pdo->prepare("DELETE FROM eventos WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(["estado" => "exito"]);
        exit();
    } catch (Throwable $e) {
        http_response_code(500);
        echo json_encode(["estado" => "error", "mensaje" => "Error interno al borrar el evento."]);
        exit();
    }
}
?>