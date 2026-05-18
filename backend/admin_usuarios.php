<?php
// backend/admin_usuarios.php

session_set_cookie_params(['lifetime' => 86400, 'path' => '/', 'httponly' => true, 'samesite' => 'Lax']);
session_start();

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit(0);

require_once 'conexion.php';
/** @var PDO $pdo */

if (!isset($_SESSION['user_id'])) {
    http_response_code(401); exit();
}

$stmtAdmin = $pdo->prepare("SELECT rol FROM usuarios WHERE id = ?");
$stmtAdmin->execute([$_SESSION['user_id']]);
if ($stmtAdmin->fetchColumn() !== 'admin') {
    http_response_code(403); exit();
}

$metodo = $_SERVER['REQUEST_METHOD'];

if ($metodo === 'GET') {
    $stmt = $pdo->query("SELECT id, nombre, email, rol, intentos_fallidos FROM usuarios ORDER BY id DESC");
    echo json_encode(["estado" => "exito", "usuarios" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
}

if ($metodo === 'POST') {
    $datos = json_decode(file_get_contents("php://input"));

    if (!empty($datos->id) && !empty($datos->nombre) && !empty($datos->email)) {
        try {
            if ($datos->rol !== 'admin') {
                $stmtCurrentRole = $pdo->prepare("SELECT rol FROM usuarios WHERE id = ?");
                $stmtCurrentRole->execute([$datos->id]);
                $rolActual = $stmtCurrentRole->fetchColumn();

                if ($rolActual === 'admin') {
                    $stmtCountAdmins = $pdo->query("SELECT COUNT(*) FROM usuarios WHERE rol = 'admin'");
                    $totalAdmins = $stmtCountAdmins->fetchColumn();

                    if ($totalAdmins <= 1) {
                        http_response_code(400);
                        echo json_encode(["estado" => "error", "mensaje" => "No puedes degradar al último administrador de la web."]);
                        exit();
                    }
                }
            }

            $sql = "UPDATE usuarios SET nombre = :nom, email = :em, rol = :rol WHERE id = :id";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                ':nom' => $datos->nombre,
                ':em' => $datos->email,
                ':rol' => $datos->rol,
                ':id' => $datos->id
            ]);
            echo json_encode(["estado" => "exito", "mensaje" => "Usuario actualizado"]);

        } catch (Exception $e) {
            error_log("Fallo SQL en admin_usuarios: " . $e->getMessage()); // Guardamos error interno
            http_response_code(500);
            echo json_encode(["estado" => "error", "mensaje" => "Error interno al actualizar usuario."]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["estado" => "error", "mensaje" => "Faltan datos obligatorios."]);
    }
}
?>