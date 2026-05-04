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

try {
    // Buscamos todos los productos
    $stmt = $pdo->query("SELECT * FROM productos ORDER BY id DESC");
    $productos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Devolvemos el JSON limpio
    echo json_encode([
        "estado" => "exito",
        "total" => count($productos),
        "productos" => $productos
    ]);

} catch (PDOException $e) {
    // Si hay error en SQL, lo escupimos para saber qué pasa
    http_response_code(500);
    echo json_encode(["estado" => "error", "mensaje" => "Error de BD: " . $e->getMessage()]);
}
?>