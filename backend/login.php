<?php
// 1. INICIAR SESIÓN (Siempre al principio)
session_start();

// Cabeceras de seguridad y CORS (Modificadas según el feedback del profe)
header("Access-Control-Allow-Origin: http://localhost:3000"); // Obligatorio poner el origen real para usar credenciales
header("Access-Control-Allow-Credentials: true"); // Obligatorio para que funcione session_start() con React
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'conexion.php';
/** @var PDO $pdo */

// Leemos los datos enviados desde React
$datos = json_decode(file_get_contents("php://input"));

if (!empty($datos->email) && !empty($datos->password)) {
    try {
        // Buscamos al usuario por su email
        $sql = "SELECT id, nombre, email, password FROM usuarios WHERE email = :email";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':email' => $datos->email]);
        $usuario = $stmt->fetch();

        // Si el usuario existe y la contraseña coincide con el hash guardado
        if ($usuario && password_verify($datos->password, $usuario['password'])) {

            // 2. GUARDAMOS EL ID DEL USUARIO EN LA SESIÓN DEL SERVIDOR
            $_SESSION['user_id'] = $usuario['id'];

            http_response_code(200);

            // Devolvemos los datos del usuario (¡NUNCA la contraseña!) para que React los guarde
            echo json_encode([
                "estado" => "exito",
                "mensaje" => "¡Bienvenido de nuevo, " . $usuario['nombre'] . "!",
                "usuario" => [
                    "id" => $usuario['id'],
                    "nombre" => $usuario['nombre'],
                    "email" => $usuario['email']
                ]
            ]);
        } else {
            // Email o contraseña equivocados
            http_response_code(401); //  No Autorizado
            echo json_encode(["estado" => "error", "mensaje" => "Correo o contraseña incorrectos."]);
        }
    } catch (PDOException $e) {
        // 3. Loguear en el servidor y devolver mensaje genérico (Feedback del profesor)
        error_log($e->getMessage());
        http_response_code(500);
        echo json_encode(["estado" => "error", "mensaje" => "Error interno en el servidor."]);
    }
} else {
    http_response_code(400);
    echo json_encode(["estado" => "error", "mensaje" => "Faltan datos (email o contraseña)."]);
}