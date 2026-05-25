<?php
// backend/marketplace.php
session_set_cookie_params(['lifetime' => 86400, 'path' => '/', 'domain' => 'localhost', 'secure' => false, 'httponly' => true, 'samesite' => 'Lax']);
if (session_status() === PHP_SESSION_NONE) { session_start(); }

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once 'conexion.php';
/** @var PDO $pdo */

$metodo = $_SERVER['REQUEST_METHOD'];
$usuario_rol = $_SESSION['rol'] ?? 'usuario';

// ==========================================
// A. OBTENER PRODUCTOS (CON SU GALERÍA)
// ==========================================
if ($metodo === 'GET') {
    try {
        // Usamos GROUP_CONCAT para traer todas las URLs de la galería separadas por coma
        $stmt = $pdo->query("
            SELECT p.*, GROUP_CONCAT(pf.foto_url) as galeria 
            FROM productos p 
            LEFT JOIN producto_fotos pf ON p.id = pf.producto_id 
            GROUP BY p.id 
            ORDER BY p.id DESC
        ");
        $productos = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(["estado" => "exito", "total" => count($productos), "productos" => $productos]);
        exit();
    } catch (PDOException $e) {
        http_response_code(500); echo json_encode(["estado" => "error", "mensaje" => "Error SQL."]); exit();
    }
}

// ==========================================
// B. EDITAR PRODUCTO (Soporte Múltiples Fotos)
// ==========================================
if ($metodo === 'POST') {
    if ($usuario_rol !== 'admin') { http_response_code(403); exit(); }

    $accion = $_POST['accion'] ?? '';

    if ($accion === 'editar_producto') {
        $id = (int)($_POST['id'] ?? 0);
        $nombre = htmlspecialchars(strip_tags($_POST['nombre'] ?? ''));
        $precio = (float)($_POST['precio'] ?? 0);
        $descripcion = htmlspecialchars(strip_tags($_POST['descripcion'] ?? ''));

        try {
            // Si el admin ha subido fotos nuevas
            if (isset($_FILES['imagenes']) && !empty($_FILES['imagenes']['name'][0])) {

                // 1. Borramos las fotos antiguas de la galería de la BD
                $pdo->prepare("DELETE FROM producto_fotos WHERE producto_id = ?")->execute([$id]);

                $upload_dir = 'uploads/productos/';
                if (!is_dir($upload_dir)) mkdir($upload_dir, 0777, true);

                $primera_foto = null;

                // Recorremos todas las fotos subidas
                foreach ($_FILES['imagenes']['tmp_name'] as $key => $tmp_name) {
                    $file_extension = strtolower(pathinfo($_FILES['imagenes']['name'][$key], PATHINFO_EXTENSION));
                    $filename = uniqid('prod_') . '_' . $key . '.' . $file_extension;
                    $destination = $upload_dir . $filename;

                    if (move_uploaded_file($tmp_name, $destination)) {
                        $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http";
                        $url = $protocol . "://" . $_SERVER['HTTP_HOST'] . "/autoevents/backend/" . $destination;

                        if ($primera_foto === null) $primera_foto = $url; // Guardamos la primera como principal

                        $stmtFoto = $pdo->prepare("INSERT INTO producto_fotos (producto_id, foto_url) VALUES (?, ?)");
                        $stmtFoto->execute([$id, $url]);
                    }
                }

                // Actualizamos los datos de texto y la foto principal
                if ($primera_foto) {
                    $stmt = $pdo->prepare("UPDATE productos SET nombre=?, precio=?, descripcion=?, imagen_url=? WHERE id=?");
                    $stmt->execute([$nombre, $precio, $descripcion, $primera_foto, $id]);
                }
            } else {
                // Si NO hay fotos nuevas, solo actualizamos el texto
                $stmt = $pdo->prepare("UPDATE productos SET nombre=?, precio=?, descripcion=? WHERE id=?");
                $stmt->execute([$nombre, $precio, $descripcion, $id]);
            }

            echo json_encode(["estado" => "exito"]); exit();
        } catch (Throwable $e) {
            http_response_code(500); echo json_encode(["estado" => "error", "mensaje" => $e->getMessage()]); exit();
        }
    }
}

// ==========================================
// C. BORRAR PRODUCTO
// ==========================================
if ($metodo === 'DELETE') {
    if ($usuario_rol !== 'admin') { http_response_code(403); exit(); }
    $id = intval($_GET['id'] ?? 0);
    try {
        $stmt = $pdo->prepare("DELETE FROM productos WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(["estado" => "exito"]); exit();
    } catch (Throwable $e) {
        http_response_code(500); exit();
    }
}
?>