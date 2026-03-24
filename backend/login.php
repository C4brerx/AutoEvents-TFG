<?php
// Cabeceras de seguridad y CORS (incluyendo OPTIONS como hicimos en el registro)
header("Access-Control-Allow-Origin: *");
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
            http_response_code(401); // Código de No Autorizado
            echo json_encode(["estado" => "error", "mensaje" => "Correo o contraseña incorrectos."]);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["estado" => "error", "mensaje" => "Error en el servidor: " . $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(["estado" => "error", "mensaje" => "Faltan datos (email o contraseña)."]);
}