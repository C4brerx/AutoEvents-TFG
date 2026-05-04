<?php
// backend/login.php

session_set_cookie_params([
    'lifetime' => 86400,
    'path' => '/',
    'httponly' => true,
    'samesite' => 'Lax'
]);
session_start();

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

usleep(1000000);

if (!empty($datos->email) && !empty($datos->password)) {
    try {
        $email_limpio = filter_var(trim($datos->email), FILTER_SANITIZE_EMAIL);

        // ¡AQUÍ ESTÁ EL CAMBIO! Añadimos "rol" al SELECT
        $sql = "SELECT id, nombre, email, password, intentos_fallidos, bloqueado_hasta, rol FROM usuarios WHERE email = :email";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':email' => $email_limpio]);
        $usuario = $stmt->fetch();

        if ($usuario) {

            // 1. ¿El usuario está actualmente bloqueado?
            if ($usuario['bloqueado_hasta'] !== null) {
                $tiempo_actual = time();
                $tiempo_bloqueo = strtotime($usuario['bloqueado_hasta']);

                if ($tiempo_actual < $tiempo_bloqueo) {
                    $minutos_restantes = ceil(($tiempo_bloqueo - $tiempo_actual) / 60);

                    http_response_code(429);
                    echo json_encode([
                        "estado" => "error",
                        "mensaje" => "Cuenta bloqueada por seguridad tras 5 intentos fallidos. Inténtalo de nuevo en $minutos_restantes minuto(s)."
                    ]);
                    exit();
                } else {
                    $reset_stmt = $pdo->prepare("UPDATE usuarios SET intentos_fallidos = 0, bloqueado_hasta = NULL WHERE id = ?");
                    $reset_stmt->execute([$usuario['id']]);
                    $usuario['intentos_fallidos'] = 0;
                }
            }

            if (password_verify($datos->password, $usuario['password'])) {

                if ($usuario['intentos_fallidos'] > 0) {
                    $reset_stmt = $pdo->prepare("UPDATE usuarios SET intentos_fallidos = 0, bloqueado_hasta = NULL WHERE id = ?");
                    $reset_stmt->execute([$usuario['id']]);
                }

                session_regenerate_id(true);
                $_SESSION['user_id'] = $usuario['id'];

                http_response_code(200);
                echo json_encode([
                    "estado" => "exito",
                    "mensaje" => "¡Bienvenido de nuevo, " . htmlspecialchars($usuario['nombre']) . "!",
                    "usuario" => [
                        "id" => $usuario['id'],
                        "nombre" => htmlspecialchars($usuario['nombre']),
                        "email" => htmlspecialchars($usuario['email']),
                        "rol" => $usuario['rol']
                    ]
                ]);

            } else {
                $intentos_actuales = $usuario['intentos_fallidos'] + 1;
                $bloqueado_hasta = null;

                if ($intentos_actuales >= 5) {
                    $bloqueado_hasta = date('Y-m-d H:i:s', strtotime('+15 minutes'));
                }

                $update_stmt = $pdo->prepare("UPDATE usuarios SET intentos_fallidos = ?, bloqueado_hasta = ? WHERE id = ?");
                $update_stmt->execute([$intentos_actuales, $bloqueado_hasta, $usuario['id']]);

                http_response_code(401);
                echo json_encode(["estado" => "error", "mensaje" => "Correo o contraseña incorrectos."]);
            }

        } else {
            http_response_code(401);
            echo json_encode(["estado" => "error", "mensaje" => "Correo o contraseña incorrectos."]);
        }

    } catch (PDOException $e) {
        error_log($e->getMessage());
        http_response_code(500);
        echo json_encode(["estado" => "error", "mensaje" => "Error interno en el servidor."]);
    }
} else {
    http_response_code(400);
    echo json_encode(["estado" => "error", "mensaje" => "Faltan datos (email o contraseña)."]);
}
?>