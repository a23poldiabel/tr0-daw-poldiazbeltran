<?php
// api_preguntas.php - API REST para preguntas y respuestas
header('Content-Type: application/json');

// Cargar variables de entorno desde .env
function env($key, $default = null) {
    if (isset($_ENV[$key])) return $_ENV[$key];
    if (getenv($key)) return getenv($key);
    return $default;
}
if (file_exists(__DIR__ . '/.env')) {
    foreach (file(__DIR__ . '/.env') as $line) {
        if (preg_match('/^([A-Z0-9_]+)=(.*)$/', trim($line), $m)) {
            $_ENV[$m[1]] = $m[2];
        }
    }
}
$host = env('DB_HOST', 'localhost');
$user = env('DB_USER', 'root');
$pass = env('DB_PASS', '');
$db = env('DB_NAME', '');
$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['error' => 'DB connection error']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

function escape($str) {
    global $conn;
    return $conn->real_escape_string($str);
}

// --- GET: listar preguntas y respuestas ---
if ($method === 'GET') {
    $preguntas = [];
    $res = $conn->query('SELECT * FROM preguntas');
    while ($row = $res->fetch_assoc()) {
        $row['respuestas'] = [];
        $preguntas[$row['id']] = $row;
    }
    $res = $conn->query('SELECT * FROM respuestas');
    while ($row = $res->fetch_assoc()) {
        $preguntas[$row['id_pregunta']]['respuestas'][] = $row;
    }
    echo json_encode(array_values($preguntas));
    exit;
}

// --- POST: crear o editar pregunta ---
if ($method === 'POST') {
    // Soportar tanto JSON como multipart/form-data
    if (isset($_SERVER['CONTENT_TYPE']) && strpos($_SERVER['CONTENT_TYPE'], 'multipart/form-data') !== false) {
        $id = $_POST['id'] ?? null;
        $pregunta = $_POST['pregunta'] ?? '';
        $imatge = $_POST['imatge'] ?? '';
        $respuestas = $_POST['respuestas'] ?? [];
        $correcta = $_POST['correcta'] ?? 0;
        // Procesar archivo de imagen si se sube
        if (isset($_FILES['imatge_file']) && $_FILES['imatge_file']['error'] === UPLOAD_ERR_OK) {
            $ext = pathinfo($_FILES['imatge_file']['name'], PATHINFO_EXTENSION);
            $filename = uniqid('img_') . '.' . $ext;
            $dest = __DIR__ . '/fotos/' . $filename;
            if (move_uploaded_file($_FILES['imatge_file']['tmp_name'], $dest)) {
                $imatge = 'fotos/' . $filename;
            }
        }
        // Si respuestas es string, convertir a array
        if (!is_array($respuestas)) {
            $respuestas = [$respuestas];
        }
    } else {
        $data = json_decode(file_get_contents('php://input'), true);
        $id = $data['id'] ?? null;
        $pregunta = $data['pregunta'] ?? '';
        $imatge = $data['imatge'] ?? '';
        $respuestas = $data['respuestas'] ?? [];
        $correcta = $data['correcta'] ?? 0;
    }
    if ($id) {
        $stmt = $conn->prepare('UPDATE preguntas SET pregunta=?, imatge=? WHERE id=?');
        $stmt->bind_param('ssi', $pregunta, $imatge, $id);
        $stmt->execute();
        $conn->query('DELETE FROM respuestas WHERE id_pregunta=' . intval($id));
    } else {
        $stmt = $conn->prepare('INSERT INTO preguntas (pregunta, imatge) VALUES (?, ?)');
        $stmt->bind_param('ss', $pregunta, $imatge);
        $stmt->execute();
        $id = $conn->insert_id;
    }
    foreach ($respuestas as $i => $respuesta) {
        $es_correcta = ($i == $correcta) ? 1 : 0;
        $stmt = $conn->prepare('INSERT INTO respuestas (respuesta, es_correcta, id_pregunta) VALUES (?, ?, ?)');
        $stmt->bind_param('sii', $respuesta, $es_correcta, $id);
        $stmt->execute();
    }
    echo json_encode(['success' => true, 'id' => $id, 'imatge' => $imatge]);
    exit;
}

// --- DELETE: eliminar pregunta ---
if ($method === 'DELETE') {
    parse_str(file_get_contents('php://input'), $data);
    $id = intval($data['id'] ?? 0);
    if ($id) {
        $conn->query('DELETE FROM respuestas WHERE id_pregunta=' . $id);
        $conn->query('DELETE FROM preguntas WHERE id=' . $id);
        echo json_encode(['success' => true]);
    } else {
        http_response_code(400);
        echo json_encode(['error' => 'Missing id']);
    }
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
