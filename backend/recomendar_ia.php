<?php
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

// SEGURIDAD: COMPROBAR SESIÓN
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["estado" => "error", "mensaje" => "No autorizado para usar la IA."]);
    exit();
}

$usuario_id = $_SESSION['user_id'];


// 🔐 LECTURA SEGURA DE LA API KEY DESDE EL .ENV

$ruta_env_backend = __DIR__ . '/.env';
$ruta_env_raiz = dirname(__DIR__) . '/.env';

if (file_exists($ruta_env_backend)) {
    $env = parse_ini_file($ruta_env_backend);
    $api_key = $env['GEMINI_API_KEY'] ?? false;
} elseif (file_exists($ruta_env_raiz)) {
    $env = parse_ini_file($ruta_env_raiz);
    $api_key = $env['GEMINI_API_KEY'] ?? false;
} else {
    http_response_code(500);
    echo json_encode(["estado" => "error", "mensaje" => "Falta configuración de seguridad (Archivo .env no encontrado)."]);
    exit();
}

if (!$api_key) {
    http_response_code(500);
    echo json_encode(["estado" => "error", "mensaje" => "Configuración de seguridad faltante (Clave API no definida)."]);
    exit();
}


// LÓGICA DE RECOMENDACIÓN

try {
    // 1. Conseguir los coches del usuario
    $stmtCoches = $pdo->prepare("SELECT marca, modelo, anio FROM vehiculos WHERE usuario_id = ?");
    $stmtCoches->execute([$usuario_id]);
    $coches = $stmtCoches->fetchAll(PDO::FETCH_ASSOC);

    if (count($coches) === 0) {
        echo json_encode(["estado" => "info", "mensaje" => "Necesitas añadir al menos un coche a tu garaje para que la IA te recomiende eventos."]);
        exit();
    }

    // 2. Conseguir los próximos eventos disponibles
    $stmtEventos = $pdo->prepare("SELECT id, titulo, tipo, ubicacion, fecha FROM eventos WHERE fecha >= CURRENT_DATE() LIMIT 10");
    $stmtEventos->execute();
    $eventos = $stmtEventos->fetchAll(PDO::FETCH_ASSOC);

    if (count($eventos) === 0) {
        echo json_encode(["estado" => "info", "mensaje" => "No hay eventos próximos ahora mismo para recomendar."]);
        exit();
    }

    // 3. Preparar los datos para pasárselos a Gemini
    $textoCoches = json_encode($coches);
    $textoEventos = json_encode($eventos);

    $prompt = "Eres un experto asesor de motor y organizador de eventos de 'AutoEvents'. 
    Este es el garaje del usuario: $textoCoches. 
    Y estos son los próximos eventos disponibles: $textoEventos.
    Recomiéndale de forma entusiasta, directa y en un párrafo corto a qué evento debería ir basándote en los coches que tiene. Haz una conexión lógica entre su coche y el evento. Empieza la frase dirigiéndote a él amigablemente y no uses asteriscos ni negritas.";

    // 4. Llamada a la API de Gemini
    $url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=" . $api_key;
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
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);

    $respuesta_json = curl_exec($ch);

    if (curl_errno($ch)) {
        $error_curl = curl_error($ch);
        curl_close($ch);
        http_response_code(500);
        echo json_encode(["estado" => "error", "mensaje" => "Error interno cURL: " . $error_curl]);
        exit();
    }

    curl_close($ch);

    $resultado = json_decode($respuesta_json, true);

    // Verificamos si Gemini nos ha devuelto un error propio (ej. API limit, modelo incorrecto...)
    if (isset($resultado['error'])) {
        http_response_code(500);
        echo json_encode(["estado" => "error", "mensaje" => "Gemini rechazó la petición: " . $resultado['error']['message']]);
        exit();
    }

    if (isset($resultado['candidates'][0]['content']['parts'][0]['text'])) {
        $texto_ia = $resultado['candidates'][0]['content']['parts'][0]['text'];
        echo json_encode(["estado" => "exito", "recomendacion" => trim($texto_ia)]);
    } else {
        http_response_code(500);
        echo json_encode(["estado" => "error", "mensaje" => "La IA devolvió una respuesta vacía o irreconocible."]);
    }

} catch (Exception $e) {
    // AQUÍ ESTÁ LA MAGIA: Ahora escupirá el error real
    http_response_code(500);
    echo json_encode(["estado" => "error", "mensaje" => "Fallo exacto: " . $e->getMessage() . " (Línea: " . $e->getLine() . ")"]);
}
?>