<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, DELETE");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'conexion.php';
/** @var PDO $pdo */

$metodo = $_SERVER['REQUEST_METHOD'];
$directorio_subida = __DIR__ . '/uploads/';


// 1. LEER VEHÍCULOS (GET)

if ($metodo === 'GET') {
    if (isset($_GET['usuario_id'])) {
        try {
            $sql = "SELECT * FROM vehiculos WHERE usuario_id = :usuario_id ORDER BY id DESC";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([':usuario_id' => $_GET['usuario_id']]);
            $vehiculos = $stmt->fetchAll();

            http_response_code(200);
            echo json_encode(["estado" => "exito", "vehiculos" => $vehiculos]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["estado" => "error", "mensaje" => $e->getMessage()]);
        }
    }
}

// 2. CREAR O ACTUALIZAR VEHÍCULO (POST)

elseif ($metodo === 'POST') {
    $usuario_id = $_POST['usuario_id'] ?? null;
    $marca = $_POST['marca'] ?? null;
    $modelo = $_POST['modelo'] ?? null;
    $anio = $_POST['anio'] ?? null;
    $motor = $_POST['motor'] ?? '';
    $especificaciones = $_POST['especificaciones'] ?? '';
    $id = $_POST['id'] ?? null;

    if ($usuario_id && $marca && $modelo && $anio) {

        $nombres_fotos = [];
        if (isset($_FILES['fotos'])) {
            $total_fotos = count($_FILES['fotos']['name']);
            $limite = $total_fotos > 4 ? 4 : $total_fotos;

            for ($i = 0; $i < $limite; $i++) {
                $tmpFilePath = $_FILES['fotos']['tmp_name'][$i];
                if ($tmpFilePath != "") {
                    $nombre_unico = time() . '-' . rand(1000, 9999) . '-' . basename($_FILES['fotos']['name'][$i]);
                    $nuevo_destino = $directorio_subida . $nombre_unico;
                    if (move_uploaded_file($tmpFilePath, $nuevo_destino)) {
                        $nombres_fotos[] = $nombre_unico;
                    }
                }
            }
        }

        $fotos_string = implode(',', $nombres_fotos);

        try {
            if ($id) {
                // Si el usuario sube fotos nuevas, REEMPLAZAMOS las viejas. Si no sube ninguna, se quedan las viejas.
                if (count($nombres_fotos) > 0) {
                    $sql = "UPDATE vehiculos SET marca = :marca, modelo = :modelo, anio = :anio, motor = :motor, especificaciones = :especificaciones, fotos = :fotos WHERE id = :id AND usuario_id = :usuario_id";
                    $params = [':marca' => $marca, ':modelo' => $modelo, ':anio' => $anio, ':motor' => $motor, ':especificaciones' => $especificaciones, ':fotos' => $fotos_string, ':id' => $id, ':usuario_id' => $usuario_id];
                } else {
                    $sql = "UPDATE vehiculos SET marca = :marca, modelo = :modelo, anio = :anio, motor = :motor, especificaciones = :especificaciones WHERE id = :id AND usuario_id = :usuario_id";
                    $params = [':marca' => $marca, ':modelo' => $modelo, ':anio' => $anio, ':motor' => $motor, ':especificaciones' => $especificaciones, ':id' => $id, ':usuario_id' => $usuario_id];
                }
                $mensaje = "Vehículo actualizado correctamente.";
            } else {
                // CREACIÓN
                $sql = "INSERT INTO vehiculos (usuario_id, marca, modelo, anio, motor, especificaciones, fotos) VALUES (:usuario_id, :marca, :modelo, :anio, :motor, :especificaciones, :fotos)";
                $params = [':usuario_id' => $usuario_id, ':marca' => $marca, ':modelo' => $modelo, ':anio' => $anio, ':motor' => $motor, ':especificaciones' => $especificaciones, ':fotos' => $fotos_string];
                $mensaje = "¡Vehículo añadido a tu garaje!";
            }

            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);

            http_response_code(200);
            echo json_encode(["estado" => "exito", "mensaje" => $mensaje]);

        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["estado" => "error", "mensaje" => "Error BD: " . $e->getMessage()]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["estado" => "error", "mensaje" => "Faltan datos obligatorios."]);
    }
}

// 3. ELIMINAR VEHÍCULO (DELETE)

elseif ($metodo === 'DELETE') {
    if (isset($_GET['id'])) {
        try {
            $sql = "DELETE FROM vehiculos WHERE id = :id";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([':id' => $_GET['id']]);
            http_response_code(200);
            echo json_encode(["estado" => "exito", "mensaje" => "Vehículo eliminado."]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["estado" => "error", "mensaje" => "Error BD: " . $e->getMessage()]);
        }
    }
}