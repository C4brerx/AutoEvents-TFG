<?php
// backend/subir_producto.php

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once 'conexion.php';
/** @var PDO $pdo */

session_set_cookie_params([
    'lifetime' => 86400,
    'path' => '/',
    'domain' => 'localhost',
    'secure' => false,
    'httponly' => true,
    'samesite' => 'Lax'
]);

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if (!isset($_SESSION['usuario_id'])) {
    http_response_code(401);
    echo json_encode(["estado" => "error", "mensaje" => "No autorizado. Inicia sesión para vender."]);
    exit();
}

$vendedor_id = $_SESSION['usuario_id'];
$vendedor_nombre = isset($_SESSION['nombre']) ? $_SESSION['nombre'] : 'Usuario';

$nombre = isset($_POST['nombre']) ? htmlspecialchars(strip_tags($_POST['nombre']), ENT_QUOTES, 'UTF-8') : 'Sin nombre';
$descripcion = isset($_POST['descripcion']) ? htmlspecialchars(strip_tags($_POST['descripcion']), ENT_QUOTES, 'UTF-8') : '';
$precio = isset($_POST['precio']) ? floatval($_POST['precio']) : 0.00;
$categoria = isset($_POST['categoria']) ? htmlspecialchars(strip_tags($_POST['categoria']), ENT_QUOTES, 'UTF-8') : 'Accesorios';
$marca_compatible = 'Todas';

$protocolo = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http";
$dominio = $_SERVER['HTTP_HOST'];
$ruta_base = $protocolo . "://" . $dominio . "/autoevents/backend/uploads/";

$imagen_url = 'https://picsum.photos/seed/' . time() . '/600/400';

$directorio_subida = __DIR__ . '/uploads/';
if (!is_dir($directorio_subida)) {
    mkdir($directorio_subida, 0755, true);
}

if (isset($_FILES['imagen']) && $_FILES['imagen']['error'] === UPLOAD_ERR_OK) {
    $tmp_name = $_FILES['imagen']['tmp_name'];

    if ($_FILES['imagen']['size'] > 5 * 1024 * 1024) {
        http_response_code(400);
        echo json_encode(["estado" => "error", "mensaje" => "La imagen es demasiado pesada. Máximo 5MB."]);
        exit();
    }

    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $tmp_name);
    finfo_close($finfo);

    $tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp'];
    if (!in_array($mimeType, $tiposPermitidos)) {
        http_response_code(400);
        echo json_encode(["estado" => "error", "mensaje" => "Formato no permitido. Sube un JPG, PNG o WEBP."]);
        exit();
    }

    $extensiones_validas = [
        'image/jpeg' => 'jpg',
        'image/png'  => 'png',
        'image/webp' => 'webp'
    ];
    $extensionSegura = $extensiones_validas[$mimeType];

    $nombreArchivo = bin2hex(random_bytes(16)) . '.' . $extensionSegura;
    $rutaDestino = $directorio_subida . $nombreArchivo;

    if (move_uploaded_file($tmp_name, $rutaDestino)) {
        $imagen_url = $ruta_base . $nombreArchivo;
    } else {
        http_response_code(500);
        echo json_encode(["estado" => "error", "mensaje" => "Error al guardar el archivo en el servidor."]);
        exit();
    }
}

try {
    $stmt = $pdo->prepare("INSERT INTO productos (nombre, descripcion, precio, imagen_url, categoria, marca_compatible, tipo_venta, vendedor_id, vendedor_nombre) VALUES (?, ?, ?, ?, ?, ?, 'segunda_mano', ?, ?)");

    if ($stmt->execute([$nombre, $descripcion, $precio, $imagen_url, $categoria, $marca_compatible, $vendedor_id, $vendedor_nombre])) {
        echo json_encode(["estado" => "exito", "mensaje" => "Artículo publicado correctamente."]);
    } else {
        http_response_code(500);
        echo json_encode(["estado" => "error", "mensaje" => "Error interno al guardar el artículo."]);
    }
} catch (PDOException $e) {
    error_log("Fallo SQL en subir_producto: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["estado" => "error", "mensaje" => "Error interno en la base de datos al publicar."]);
}
?>