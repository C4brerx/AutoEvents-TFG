<?php
// backend/subir_producto.php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once 'conexion.php';
/** @var PDO $pdo */

session_set_cookie_params(['lifetime' => 86400, 'path' => '/', 'domain' => 'localhost', 'secure' => false, 'httponly' => true, 'samesite' => 'Lax']);
if (session_status() === PHP_SESSION_NONE) { session_start(); }

if (!isset($_SESSION['usuario_id'])) {
    http_response_code(401);
    echo json_encode(["estado" => "error", "mensaje" => "No autorizado. Inicia sesión para vender."]);
    exit();
}

$vendedor_id = $_SESSION['usuario_id'];
$vendedor_nombre = $_SESSION['nombre'] ?? 'Usuario';

$nombre = htmlspecialchars(strip_tags($_POST['nombre'] ?? 'Sin nombre'));
$descripcion = htmlspecialchars(strip_tags($_POST['descripcion'] ?? ''));
$precio = floatval($_POST['precio'] ?? 0.00);
$categoria = htmlspecialchars(strip_tags($_POST['categoria'] ?? 'Accesorios'));
$marca_compatible = 'Todas';

try {
    $pdo->beginTransaction();

    // 1. Insertamos el producto (temporalmente sin foto) para conseguir su ID
    $stmt = $pdo->prepare("INSERT INTO productos (nombre, descripcion, precio, imagen_url, categoria, marca_compatible, tipo_venta, vendedor_id, vendedor_nombre) VALUES (?, ?, ?, '', ?, ?, 'segunda_mano', ?, ?)");
    $stmt->execute([$nombre, $descripcion, $precio, $categoria, $marca_compatible, $vendedor_id, $vendedor_nombre]);
    $producto_id = $pdo->lastInsertId();

    // 2. Procesamos todas las imágenes subidas
    $primera_foto = null;
    $directorio_subida = 'uploads/productos/';
    if (!is_dir($directorio_subida)) mkdir($directorio_subida, 0777, true);

    if (isset($_FILES['imagenes']) && !empty($_FILES['imagenes']['name'][0])) {
        foreach ($_FILES['imagenes']['tmp_name'] as $key => $tmp_name) {
            if ($_FILES['imagenes']['error'][$key] === UPLOAD_ERR_OK) {
                $file_extension = strtolower(pathinfo($_FILES['imagenes']['name'][$key], PATHINFO_EXTENSION));
                $allowed = ['jpg', 'jpeg', 'png', 'webp'];

                if (in_array($file_extension, $allowed)) {
                    $nombreArchivo = uniqid('prod_') . '_' . $key . '.' . $file_extension;
                    $rutaDestino = $directorio_subida . $nombreArchivo;

                    if (move_uploaded_file($tmp_name, $rutaDestino)) {
                        $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http";
                        $url = $protocol . "://" . $_SERVER['HTTP_HOST'] . "/autoevents/backend/" . $rutaDestino;

                        if ($primera_foto === null) $primera_foto = $url;

                        $stmtFoto = $pdo->prepare("INSERT INTO producto_fotos (producto_id, foto_url) VALUES (?, ?)");
                        $stmtFoto->execute([$producto_id, $url]);
                    }
                }
            }
        }
    }

    // 3. Actualizamos el producto con la primera foto (para que se vea en las tarjetas)
    $imagen_final = $primera_foto ?: 'https://placehold.co/600x400/1a1a1a/e60000?text=Sin+Foto';
    $stmtUpd = $pdo->prepare("UPDATE productos SET imagen_url = ? WHERE id = ?");
    $stmtUpd->execute([$imagen_final, $producto_id]);

    $pdo->commit();
    echo json_encode(["estado" => "exito", "mensaje" => "Artículo publicado correctamente."]);

} catch (Throwable $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    error_log("Fallo SQL en subir_producto: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["estado" => "error", "mensaje" => "Error interno en la base de datos."]);
}
?>