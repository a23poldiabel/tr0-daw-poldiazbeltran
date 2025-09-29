<?php
// filepath: c:\Users\poldi\Documents\Pedralbes\Projectes Transversals\Projecte 0\tr0-daw-poldiazbeltran\getPreguntes.php
header('Content-Type: application/json');
session_start();

$num = isset($_GET['num']) ? intval($_GET['num']) : 10;

// Connexió a la base de dades amb mysqli (XAMPP fora de Docker)
$conn = new mysqli('localhost', 'a23poldiabel_pol', '123456aA!', 'a23poldiabel_projecte0');
$conn->set_charset('utf8mb4');

if ($conn->connect_error) {
    echo json_encode(['error' => 'Error de connexió BBDD: ' . $conn->connect_error]);
    exit;
}

// Selecciona preguntes aleatòries
$stmt = $conn->prepare("SELECT * FROM preguntas ORDER BY RAND() LIMIT ?");
$stmt->bind_param("i", $num);
$stmt->execute();
$result = $stmt->get_result();

$preguntes = [];
$_SESSION['preguntes_ids'] = [];
$_SESSION['correctes'] = [];

while ($pregunta = $result->fetch_assoc()) {
    $id = $pregunta['id'];
    $_SESSION['preguntes_ids'][] = $id;

    // Respostes de la pregunta
    $stmt2 = $conn->prepare("SELECT id, respuesta, es_correcta FROM respuestas WHERE id_pregunta = ?");
    $stmt2->bind_param("i", $id);
    $stmt2->execute();
    $res = $stmt2->get_result();

    $respostes = [];
    while ($r = $res->fetch_assoc()) {
        if ($r['es_correcta']) {
            $_SESSION['correctes'][$id] = $r['id'];
        }
        $respostes[] = $r;
    }

    // Barregem respostes i eliminem info de si és correcta
    shuffle($respostes);
    $respostes_sense_correcta = [];
    foreach ($respostes as $r) {
        $respostes_sense_correcta[] = [
            'id' => $r['id'],
            'text' => $r['respuesta']
        ];
    }

    $preguntes[] = [
        'id' => $id,
        'pregunta' => $pregunta['pregunta'],
        'imatge' => $pregunta['imatge'],
        'respostes' => $respostes_sense_correcta
    ];
    $stmt2->close();
}

$stmt->close();
$conn->close();

echo json_encode($preguntes);