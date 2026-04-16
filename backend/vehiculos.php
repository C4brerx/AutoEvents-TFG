<?php
// 1. INICIAR SESIÓN (Debe ser la primera línea)
session_start();

// 2. CONFIGURAR CORS RESTRINGIDO
header("Access-Control-Allow-Origin: http://localhost:3000"); // Obligatorio para sesiones
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

// 3. VALIDAR LA SESIÓN (Si no hay sesión, echamos al usuario)
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["estado" => "error", "mensaje" => "No autorizado. Inicia sesión primero."]);
    exit();
}

// ESTA ES LA ÚNICA FUENTE DE VERDAD AHORA: El ID guardado en el servidor
$usuario_id = $_SESSION['user_id'];

$metodo = $_SERVER['REQUEST_METHOD'];
$directorio_subida = __DIR__ . '/uploads/';

// Crear carpeta si no existe
if (!is_dir($directorio_subida)) {
    mkdir($directorio_subida, 0755, true);
}


// 1. LEER VEHÍCULOS (GET)

if ($metodo === 'GET') {
    try {
        $sql = "SELECT * FROM vehiculos WHERE usuario_id = :usuario_id ORDER BY id DESC";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':usuario_id' => $usuario_id]);
        $vehiculos = $stmt->fetchAll(PDO::FETCH_ASSOC);

        http_response_code(200);
        echo json_encode(["estado" => "exito", "vehiculos" => $vehiculos]);
    } catch (PDOException $e) {
        error_log($e->getMessage());
        http_response_code(500);
        echo json_encode(["estado" => "error", "mensaje" => "Error interno del servidor."]);
    }
}


// 2. CREAR O ACTUALIZAR VEHÍCULO (POST)

elseif ($metodo === 'POST') {
    // Sanitizamos limpiando espacios en blanco por seguridad
    $marca = trim($_POST['marca'] ?? '');
    $modelo = trim($_POST['modelo'] ?? '');
    $anio = isset($_POST['anio']) ? intval($_POST['anio']) : null;
    $motor = trim($_POST['motor'] ?? '');
    $especificaciones = trim($_POST['especificaciones'] ?? '');
    $id = $_POST['id'] ?? null;

    if ($marca && $modelo && $anio) {

        // NUEVO: Validación estricta del año
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
                    // NUEVO: Validación estricta de tamaño (Máximo 3MB por foto)
                    // 3MB = 3 * 1024 * 1024 bytes = 3145728 bytes
                    if ($_FILES['fotos']['size'][$i] > 3145728) {
                        http_response_code(400);
                        echo json_encode(["estado" => "error", "mensaje" => "La imagen '" . $_FILES['fotos']['name'][$i] . "' supera el límite de 3MB."]);
                        exit();
                    }

                    // Validamos el MIME real y la extensión
                    $mime_type = finfo_file($finfo, $tmpFilePath);
                    $ext = strtolower(pathinfo($_FILES['fotos']['name'][$i], PATHINFO_EXTENSION));

                    if (in_array($mime_type, $mimes_permitidos) && in_array($ext, $extensiones_permitidas)) {
                        // NUEVO: Nombres únicos criptográficos (Anti-hackeo y anti-sobreescritura)
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

        $fotos_string = implode(',', $nombres_fotos);

        try {
            if ($id) {
                if (count($nombres_fotos) > 0) {
                    $sql = "UPDATE vehiculos SET marca = :marca, modelo = :modelo, anio = :anio, motor = :motor, especificaciones = :especificaciones, fotos = :fotos WHERE id = :id AND usuario_id = :usuario_id";
                    $params = [':marca' => $marca, ':modelo' => $modelo, ':anio' => $anio, ':motor' => $motor, ':especificaciones' => $especificaciones, ':fotos' => $fotos_string, ':id' => $id, ':usuario_id' => $usuario_id];
                } else {
                    $sql = "UPDATE vehiculos SET marca = :marca, modelo = :modelo, anio = :anio, motor = :motor, especificaciones = :especificaciones WHERE id = :id AND usuario_id = :usuario_id";
                    $params = [':marca' => $marca, ':modelo' => $modelo, ':anio' => $anio, ':motor' => $motor, ':especificaciones' => $especificaciones, ':id' => $id, ':usuario_id' => $usuario_id];
                }
                $mensaje = "Vehículo actualizado correctamente.";
            } else {
                $sql = "INSERT INTO vehiculos (usuario_id, marca, modelo, anio, motor, especificaciones, fotos) VALUES (:usuario_id, :marca, :modelo, :anio, :motor, :especificaciones, :fotos)";
                $params = [':usuario_id' => $usuario_id, ':marca' => $marca, ':modelo' => $modelo, ':anio' => $anio, ':motor' => $motor, ':especificaciones' => $especificaciones, ':fotos' => $fotos_string];
                $mensaje = "¡Vehículo añadido a tu garaje!";
            }

            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);

            http_response_code(200);
            echo json_encode(["estado" => "exito", "mensaje" => $mensaje]);

        } catch (PDOException $e) {
            error_log($e->getMessage());
            http_response_code(500);
            echo json_encode(["estado" => "error", "mensaje" => "Error interno al guardar en base de datos."]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["estado" => "error", "mensaje" => "Faltan datos obligatorios (Marca, Modelo o Año)."]);
    }
}


// 3. ELIMINAR VEHÍCULO (DELETE)
elseif ($metodo === 'DELETE') {
    if (isset($_GET['id'])) {
        try {
            $sql = "DELETE FROM vehiculos WHERE id = :id AND usuario_id = :usuario_id";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([':id' => $_GET['id'], ':usuario_id' => $usuario_id]);

            if ($stmt->rowCount() > 0) {
                http_response_code(200);
                echo json_encode(["estado" => "exito", "mensaje" => "Vehículo eliminado."]);
            } else {
                http_response_code(403);
                echo json_encode(["estado" => "error", "mensaje" => "No tienes permiso o el vehículo no existe."]);
            }
        } catch (PDOException $e) {
            error_log($e->getMessage());
            http_response_code(500);
            echo json_encode(["estado" => "error", "mensaje" => "Error interno al eliminar."]);
        }
    }
}
?>