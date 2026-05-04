<?php
// backend/subir_producto.php

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once 'conexion.php';
/** @var PDO $pdo */


$nombre = isset($_POST['nombre']) ? $_POST['nombre'] : 'Sin nombre';
$descripcion = isset($_POST['descripcion']) ? $_POST['descripcion'] : '';
$precio = isset($_POST['precio']) ? floatval($_POST['precio']) : 0.00;
$categoria = isset($_POST['categoria']) ? $_POST['categoria'] : 'Accesorios';
$vendedor_id = isset($_POST['vendedor_id']) ? $_POST['vendedor_id'] : 1;
$vendedor_nombre = isset($_POST['vendedor_nombre']) ? $_POST['vendedor_nombre'] : 'Usuario';
$marca_compatible = 'Todas';


$imagen_url = 'https://picsum.photos/seed/' . time() . '/600/400';
if (isset($_FILES['imagen']) && $_FILES['imagen']['error'] === UPLOAD_ERR_OK) {
    // Limpiamos el nombre del archivo para que no de errores
    $nombreArchivo = time() . '_' . preg_replace("/[^a-zA-Z0-9.]/", "", basename($_FILES['imagen']['name']));
    $rutaDestino = __DIR__ . '/uploads/' . $nombreArchivo;

    if (move_uploaded_file($_FILES['imagen']['tmp_name'], $rutaDestino)) {
        $imagen_url = 'http://localhost/autoevents/backend/uploads/' . $nombreArchivo;
    }
}

try {
    $stmt = $pdo->prepare("INSERT INTO productos (nombre, descripcion, precio, imagen_url, categoria, marca_compatible, tipo_venta, vendedor_id, vendedor_nombre) VALUES (?, ?, ?, ?, ?, ?, 'segunda_mano', ?, ?)");

    if ($stmt->execute([$nombre, $descripcion, $precio, $imagen_url, $categoria, $marca_compatible, $vendedor_id, $vendedor_nombre])) {
        echo json_encode(["estado" => "exito", "mensaje" => "Artículo publicado correctamente."]);
    } else {
        echo json_encode(["estado" => "error", "mensaje" => "Error interno en BD."]);
    }
} catch (PDOException $e) {
    echo json_encode(["estado" => "error", "mensaje" => "Fallo SQL: " . $e->getMessage()]);
}
?>