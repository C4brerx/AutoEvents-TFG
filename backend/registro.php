<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS"); // Añadimos OPTIONS aquí
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// --- AÑADE ESTO PARA RESPONDER A LA PETICIÓN INVISIBLE DEL NAVEGADOR ---
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
// ----------------------------------------------------------------------

require_once 'conexion.php';
/** @var PDO $pdo */

$datos = json_decode(file_get_contents("php://input"));

if (!empty($datos->nombre) && !empty($datos->email) && !empty($datos->password)) {

    try {
        $password_cifrada = password_hash($datos->password, PASSWORD_BCRYPT);

        $sql = "INSERT INTO usuarios (nombre, email, password) VALUES (:nombre, :email, :password)";
        $stmt = $pdo->prepare($sql);

        $stmt->execute([
            ':nombre' => $datos->nombre,
            ':email' => $datos->email,
            ':password' => $password_cifrada
        ]);

        http_response_code(201);
        echo json_encode(["estado" => "exito", "mensaje" => "Usuario registrado correctamente."]);

    } catch (PDOException $e) { // Quitada la barra invertida \
        if ($e->getCode() == 23000) {
            http_response_code(400);
            echo json_encode(["estado" => "error", "mensaje" => "El email ya está registrado."]);
        } else {
            http_response_code(500);
            echo json_encode(["estado" => "error", "mensaje" => "Error al registrar: " . $e->getMessage()]);
        }
    }
} else {
    http_response_code(400);
    echo json_encode(["estado" => "error", "mensaje" => "Faltan datos (nombre, email o contraseña)."]);
}
// SIN ETIQUETA DE CIERRE ?>