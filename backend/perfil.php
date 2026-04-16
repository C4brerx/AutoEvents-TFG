<?php
// backend/perfil.php
session_start();

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
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
    echo json_encode(["estado" => "error", "mensaje" => "No autorizado."]);
    exit();
}

$usuario_id = $_SESSION['user_id'];
$metodo = $_SERVER['REQUEST_METHOD'];
$directorio_subida = __DIR__ . '/uploads/perfiles/';

if (!is_dir($directorio_subida)) {
    mkdir($directorio_subida, 0755, true);
}

// OBTENER DATOS DEL PERFIL
if ($metodo === 'GET') {
    try {
        $stmt = $pdo->prepare("SELECT id, nombre, email, biografia, foto_perfil FROM usuarios WHERE id = :id");
        $stmt->execute([':id' => $usuario_id]);
        $perfil = $stmt->fetch(PDO::FETCH_ASSOC);

        echo json_encode(["estado" => "exito", "perfil" => $perfil]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["estado" => "error", "mensaje" => "Error interno."]);
    }
}

// ACTUALIZAR PERFIL
elseif ($metodo === 'POST') {
    $nombre = trim($_POST['nombre'] ?? '');
    $biografia = trim($_POST['biografia'] ?? '');
    $nombre_foto = null;

    if (empty($nombre)) {
        http_response_code(400);
        echo json_encode(["estado" => "error", "mensaje" => "El nombre no puede estar vacío."]);
        exit();
    }

    // GESTIÓN DE LA FOTO DE PERFIL
    if (isset($_FILES['foto_perfil']) && $_FILES['foto_perfil']['error'] === UPLOAD_ERR_OK) {
        $tmpFilePath = $_FILES['foto_perfil']['tmp_name'];

        if ($_FILES['foto_perfil']['size'] > 2097152) { // Límite 2MB
            http_response_code(400);
            echo json_encode(["estado" => "error", "mensaje" => "La imagen supera los 2MB."]);
            exit();
        }

        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime_type = finfo_file($finfo, $tmpFilePath);
        finfo_close($finfo);

        $mimes_permitidos = ['image/jpeg', 'image/png', 'image/webp'];
        $ext = strtolower(pathinfo($_FILES['foto_perfil']['name'], PATHINFO_EXTENSION));

        if (in_array($mime_type, $mimes_permitidos) && in_array($ext, ['jpg', 'jpeg', 'png', 'webp'])) {
            $nombre_foto = uniqid('avatar_') . '_' . bin2hex(random_bytes(2)) . '.' . $ext;
            move_uploaded_file($tmpFilePath, $directorio_subida . $nombre_foto);
        } else {
            http_response_code(400);
            echo json_encode(["estado" => "error", "mensaje" => "Formato de imagen no válido."]);
            exit();
        }
    }

    try {
        if ($nombre_foto) {
            // Actualiza también la foto
            $sql = "UPDATE usuarios SET nombre = :nombre, biografia = :biografia, foto_perfil = :foto_perfil WHERE id = :id";
            $params = [':nombre' => $nombre, ':biografia' => $biografia, ':foto_perfil' => $nombre_foto, ':id' => $usuario_id];
        } else {
            // Actualiza solo texto
            $sql = "UPDATE usuarios SET nombre = :nombre, biografia = :biografia WHERE id = :id";
            $params = [':nombre' => $nombre, ':biografia' => $biografia, ':id' => $usuario_id];
        }

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        // Devolvemos los datos actualizados para que React los refresque al instante
        $stmt_refresh = $pdo->prepare("SELECT id, nombre, email, biografia, foto_perfil FROM usuarios WHERE id = :id");
        $stmt_refresh->execute([':id' => $usuario_id]);
        $perfil_actualizado = $stmt_refresh->fetch(PDO::FETCH_ASSOC);

        echo json_encode(["estado" => "exito", "mensaje" => "Perfil actualizado", "perfil" => $perfil_actualizado]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["estado" => "error", "mensaje" => "Error al actualizar la base de datos."]);
    }
}
?>