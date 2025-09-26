<?php
// filepath: c:\Users\poldi\Documents\Pedralbes\Projectes Transversals\Projecte 0\tr0-daw-poldiazbeltran\finalitza.php
header('Content-Type: application/json');
session_start();

$data = json_decode(file_get_contents('php://input'), true);
$respostesUsuari = isset($data['respostes']) ? $data['respostes'] : [];

$preguntes_ids = isset($_SESSION['preguntes_ids']) ? $_SESSION['preguntes_ids'] : [];
$correctes = isset($_SESSION['correctes']) ? $_SESSION['correctes'] : [];

$total = count($preguntes_ids);
$encerts = 0;

foreach ($preguntes_ids as $idx => $id_pregunta) {
    $id_resposta_usuari = isset($respostesUsuari[$idx]) ? $respostesUsuari[$idx] : null;
    if ($id_resposta_usuari && isset($correctes[$id_pregunta]) && $id_resposta_usuari == $correctes[$id_pregunta]) {
        $encerts++;
    }
}

echo json_encode([
    'total' => $total,
    'correctes' => $encerts
]);