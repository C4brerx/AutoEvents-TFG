<?php
// backend/marketplace.php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'conexion.php';
/** @var PDO $pdo */

try {
    $stmt = $pdo->query("SELECT * FROM productos ORDER BY id DESC");
    $productos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "estado" => "exito",
        "total" => count($productos),
        "productos" => $productos
    ]);

} catch (PDOException $e) {
    error_log("Fallo SQL en marketplace: " . $e->getMessage()); // Se guarda en el log interno de XAMPP/Apache

    http_response_code(500);
    echo json_encode(["estado" => "error", "mensaje" => "Error interno al cargar los productos del marketplace."]);
}
?>