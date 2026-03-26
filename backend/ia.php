<?php
// Cabeceras CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$metodo = $_SERVER['REQUEST_METHOD'];

if ($metodo === 'POST') {
    $datos = json_decode(file_get_contents("php://input"));

    if (!empty($datos->marca) && !empty($datos->modelo)) {

        $marca = $datos->marca;
        $modelo = $datos->modelo;
        $sintoma = isset($datos->sintoma) ? trim($datos->sintoma) : "";

        // 1.  API KEY
        $apiKey = "AIzaSyBcQsWxhBIfbG0e4M51OR-PeIO9aIZZae4";

        // 2. Prompt
        if ($sintoma !== "") {
            $prompt = "Eres un mecánico experto. Un usuario tiene un $marca $modelo y reporta este problema: '$sintoma'. Dame una respuesta muy breve (máximo 3 párrafos) con las 3 causas más probables en este modelo exacto, y dime si es peligroso conducir así. Usa formato Markdown con emojis.";
        } else {
            $prompt = "Eres un mecánico experto en coches de alto rendimiento. Un usuario tiene un $marca $modelo. Dame una respuesta breve y directa que contenga: 1 dato curioso o técnico muy poco conocido sobre este modelo exacto, y 2 consejos de mantenimiento críticos y específicos para su motor o chasis. No uses saludos, ve directo al grano y usa formato Markdown con emojis.";
        }

        // 3. Conexión Api
        $url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" . $apiKey;

        $cuerpo = [
            "contents" => [
                ["parts" => [["text" => $prompt]]]
            ]
        ];

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($cuerpo));
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);

        $respuesta_json = curl_exec($ch);
        curl_close($ch);

        $resultado = json_decode($respuesta_json, true);

        if (isset($resultado['candidates'][0]['content']['parts'][0]['text'])) {
            $texto_ia = $resultado['candidates'][0]['content']['parts'][0]['text'];
            http_response_code(200);
            echo json_encode(["estado" => "exito", "respuesta" => $texto_ia]);
        } else if (isset($resultado['error']['message'])) {
            http_response_code(500);
            echo json_encode(["estado" => "error", "mensaje" => "Error de la API: " . $resultado['error']['message']]);
        } else {
            http_response_code(500);
            echo json_encode(["estado" => "error", "mensaje" => "No se pudo procesar la respuesta."]);
        }

    } else {
        http_response_code(400);
        echo json_encode(["estado" => "error", "mensaje" => "Faltan datos del vehículo."]);
    }
} else {
    http_response_code(405);
    echo json_encode(["estado" => "error", "mensaje" => "Método no permitido."]);
}
?>



