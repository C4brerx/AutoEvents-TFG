<?php
// backend/vehiculos.php

session_set_cookie_params([
    'lifetime' => 86400,
    'path' => '/',
    'httponly' => true,
    'samesite' => 'Lax'
]);
if (session_status() === PHP_SESSION_NONE) { session_start(); }

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, DELETE");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'conexion.php';
/** @var PDO $pdo */

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["estado" => "error", "mensaje" => "No autorizado. Inicia sesión primero."]);
    exit();
}

$usuario_id = $_SESSION['user_id'];
$metodo = $_SERVER['REQUEST_METHOD'];
$directorio_subida = __DIR__ . '/uploads/';

if (!is_dir($directorio_subida)) {
    mkdir($directorio_subida, 0755, true);
}

if ($metodo === 'GET') {
    try {
        $sql = "SELECT * FROM vehiculos WHERE usuario_id = :usuario_id ORDER BY id DESC";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':usuario_id' => $usuario_id]);
        $vehiculos = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($vehiculos as &$vehiculo) {
            $stmtFotos = $pdo->prepare("SELECT ruta_foto FROM vehiculo_fotos WHERE vehiculo_id = ?");
            $stmtFotos->execute([$vehiculo['id']]);
            $array_fotos = $stmtFotos->fetchAll(PDO::FETCH_COLUMN);

            $vehiculo['fotos'] = implode(',', $array_fotos);
        }

        http_response_code(200);
        echo json_encode(["estado" => "exito", "vehiculos" => $vehiculos]);
        exit();
    } catch (Throwable $e) {
        http_response_code(500);
        echo json_encode(["estado" => "error", "mensaje" => "Error SQL GET: " . $e->getMessage()]);
        exit();
    }
}

elseif ($metodo === 'POST') {
    $marca = htmlspecialchars(trim($_POST['marca'] ?? ''), ENT_QUOTES, 'UTF-8');
    $modelo = htmlspecialchars(trim($_POST['modelo'] ?? ''), ENT_QUOTES, 'UTF-8');
    $motor = htmlspecialchars(trim($_POST['motor'] ?? ''), ENT_QUOTES, 'UTF-8');
    $especificaciones = htmlspecialchars(trim($_POST['especificaciones'] ?? ''), ENT_QUOTES, 'UTF-8');

    $vin = !empty($_POST['vin']) ? substr(preg_replace('/[^A-Za-z0-9]/', '', strtoupper($_POST['vin'])), 0, 17) : null;

    $anio = isset($_POST['anio']) ? intval($_POST['anio']) : null;
    $id = $_POST['id'] ?? null;

    if ($marca && $modelo && $anio) {
        $anio_actual = intval(date("Y"));
        if ($anio < 1886 || $anio > ($anio_actual + 1)) {
            http_response_code(400);
            echo json_encode(["estado" => "error", "mensaje" => "El año del vehículo no es válido."]);
            exit();
        }

        $nombres_fotos = [];
        if (isset($_FILES['fotos'])) {
            $total_fotos = count($_FILES['fotos']['name']);
            $limite = $total_fotos > 4 ? 4 : $total_fotos;

            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            $mimes_permitidos = ['image/jpeg', 'image/png', 'image/webp'];
            $extensiones_permitidas = ['jpg', 'jpeg', 'png', 'webp'];

            for ($i = 0; $i < $limite; $i++) {
                $tmpFilePath = $_FILES['fotos']['tmp_name'][$i];

                if ($tmpFilePath != "") {
                    if ($_FILES['fotos']['size'][$i] > 3145728) {
                        http_response_code(400);
                        echo json_encode(["estado" => "error", "mensaje" => "La imagen '" . $_FILES['fotos']['name'][$i] . "' supera el límite de 3MB."]);
                        exit();
                    }

                    $mime_type = finfo_file($finfo, $tmpFilePath);
                    $ext = strtolower(pathinfo($_FILES['fotos']['name'][$i], PATHINFO_EXTENSION));

                    if (in_array($mime_type, $mimes_permitidos) && in_array($ext, $extensiones_permitidas)) {
                        $nombre_unico = uniqid('ae_') . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
                        $nuevo_destino = $directorio_subida . $nombre_unico;

                        if (move_uploaded_file($tmpFilePath, $nuevo_destino)) {
                            $nombres_fotos[] = $nombre_unico;
                        }
                    } else {
                        http_response_code(400);
                        echo json_encode(["estado" => "error", "mensaje" => "Formato no válido. Solo JPG, PNG o WEBP."]);
                        exit();
                    }
                }
            }
            finfo_close($finfo);
        }

        try {
            $pdo->beginTransaction();

            if ($id) {
                $sql = "UPDATE vehiculos SET marca = :marca, modelo = :modelo, anio = :anio, motor = :motor, especificaciones = :especificaciones, vin = :vin WHERE id = :id AND usuario_id = :usuario_id";
                $stmt = $pdo->prepare($sql);
                $stmt->execute([':marca' => $marca, ':modelo' => $modelo, ':anio' => $anio, ':motor' => $motor, ':especificaciones' => $especificaciones, ':vin' => $vin, ':id' => $id, ':usuario_id' => $usuario_id]);

                if (count($nombres_fotos) > 0) {
                    $stmtOld = $pdo->prepare("SELECT ruta_foto FROM vehiculo_fotos WHERE vehiculo_id = ?");
                    $stmtOld->execute([$id]);
                    $fotos_antiguas = $stmtOld->fetchAll(PDO::FETCH_COLUMN);

                    foreach ($fotos_antiguas as $foto_vieja) {
                        $ruta_borrar = $directorio_subida . trim($foto_vieja);
                        if (file_exists($ruta_borrar)) unlink($ruta_borrar);
                    }

                    $pdo->prepare("DELETE FROM vehiculo_fotos WHERE vehiculo_id = ?")->execute([$id]);

                    $stmtInsertFoto = $pdo->prepare("INSERT INTO vehiculo_fotos (vehiculo_id, ruta_foto) VALUES (?, ?)");
                    foreach ($nombres_fotos as $foto_nueva) {
                        $stmtInsertFoto->execute([$id, $foto_nueva]);
                    }
                }
                $mensaje = "Vehículo actualizado correctamente.";
            } else {
                $sql = "INSERT INTO vehiculos (usuario_id, marca, modelo, anio, motor, especificaciones, vin) VALUES (:usuario_id, :marca, :modelo, :anio, :motor, :especificaciones, :vin)";
                $stmt = $pdo->prepare($sql);
                $stmt->execute([':usuario_id' => $usuario_id, ':marca' => $marca, ':modelo' => $modelo, ':anio' => $anio, ':motor' => $motor, ':especificaciones' => $especificaciones, ':vin' => $vin]);

                $nuevo_id = $pdo->lastInsertId();

                if (count($nombres_fotos) > 0) {
                    $stmtInsertFoto = $pdo->prepare("INSERT INTO vehiculo_fotos (vehiculo_id, ruta_foto) VALUES (?, ?)");
                    foreach ($nombres_fotos as $foto_nueva) {
                        $stmtInsertFoto->execute([$nuevo_id, $foto_nueva]);
                    }
                }
                $mensaje = "¡Vehículo añadido a tu garaje!";
            }

            $pdo->commit();
            http_response_code(200);
            echo json_encode(["estado" => "exito", "mensaje" => $mensaje]);
            exit();

        } catch (Throwable $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            http_response_code(500);
            echo json_encode(["estado" => "error", "mensaje" => "Error SQL POST: " . $e->getMessage()]);
            exit();
        }
    } else {
        http_response_code(400);
        echo json_encode(["estado" => "error", "mensaje" => "Faltan datos obligatorios."]);
        exit();
    }
}

elseif ($metodo === 'DELETE') {
    if (isset($_GET['id'])) {
        try {
            $pdo->beginTransaction();

            $stmtFotos = $pdo->prepare("SELECT ruta_foto FROM vehiculo_fotos WHERE vehiculo_id = :id");
            $stmtFotos->execute([':id' => $_GET['id']]);
            $fotos_para_borrar = $stmtFotos->fetchAll(PDO::FETCH_COLUMN);

            $sql = "DELETE FROM vehiculos WHERE id = :id AND usuario_id = :usuario_id";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([':id' => $_GET['id'], ':usuario_id' => $usuario_id]);

            if ($stmt->rowCount() > 0) {
                foreach ($fotos_para_borrar as $foto) {
                    $ruta_archivo = $directorio_subida . trim($foto);
                    if (file_exists($ruta_archivo)) {
                        unlink($ruta_archivo);
                    }
                }
                $pdo->commit();
                http_response_code(200);
                echo json_encode(["estado" => "exito", "mensaje" => "Vehículo y datos eliminados."]);
                exit();
            } else {
                $pdo->rollBack();
                http_response_code(403);
                echo json_encode(["estado" => "error", "mensaje" => "No tienes permiso o no existe."]);
                exit();
            }
        } catch (Throwable $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            http_response_code(500);
            echo json_encode(["estado" => "error", "mensaje" => "Error SQL DELETE: " . $e->getMessage()]);
            exit();
        }
    }
}
?>