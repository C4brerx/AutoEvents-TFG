<?php
// backend/registro.php

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'conexion.php';
/** @var PDO $pdo */

$datos = json_decode(file_get_contents("php://input"));


if (!empty($datos->nombre) && !empty($datos->email) && !empty($datos->password)) {

    $nombre = htmlspecialchars(trim($datos->nombre), ENT_QUOTES, 'UTF-8');
    $email = filter_var(trim($datos->email), FILTER_SANITIZE_EMAIL);
    $password = $datos->password;

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(["estado" => "error", "mensaje" => "Formato de correo no válido."]);
        exit();
    }

    if (strlen($password) < 6) {
        http_response_code(400);
        echo json_encode(["estado" => "error", "mensaje" => "La contraseña debe tener al menos 6 caracteres."]);
        exit();
    }

    try {
        $password_cifrada = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);

        $sql = "INSERT INTO usuarios (nombre, email, password, rol, intentos_fallidos) VALUES (:nombre, :email, :password, 'usuario', 0)";
        $stmt = $pdo->prepare($sql);

        $stmt->execute([
            ':nombre' => $nombre,
            ':email' => $email,
            ':password' => $password_cifrada
        ]);

        http_response_code(201);
        echo json_encode(["estado" => "exito", "mensaje" => "Usuario registrado correctamente."]);

    } catch (PDOException $e) {
        if ($e->getCode() == 23000) {
            http_response_code(400);
            echo json_encode(["estado" => "error", "mensaje" => "El email ya está registrado."]);
        } else {
            error_log("Fallo SQL en registro: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(["estado" => "error", "mensaje" => "Error interno al registrar el usuario en la base de datos."]);
        }
    } catch (Exception $e) {
        error_log("Fallo general en registro: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(["estado" => "error", "mensaje" => "Error inesperado en el servidor."]);
    }
} else {
    http_response_code(400);
    echo json_encode(["estado" => "error", "mensaje" => "Faltan datos (nombre, email o contraseña)."]);
}
?>