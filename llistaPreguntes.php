<?php
// filepath: c:\Users\poldi\Documents\Pedralbes\Projectes Transversals\Projecte 0\tr0-daw-poldiazbeltran\llistaPreguntes.php
// Connexió a la base de dades amb mysqli
$conn = new mysqli('host.docker.internal', 'root', '', 'examen_conduccion');
$conn->set_charset('utf8mb4');

if ($conn->connect_error) {
    die("Error de connexió BBDD");
}

// Actualitzar pregunta/resposta
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['editar_pregunta'])) {
        $id = $_POST['id'];
        $pregunta = $_POST['pregunta'];
        $imatge = $_POST['imatge'];
        $stmt = $conn->prepare("UPDATE preguntas SET pregunta=?, imatge=? WHERE id=?");
        $stmt->bind_param("ssi", $pregunta, $imatge, $id);
        $stmt->execute();
        $stmt->close();
    }
    if (isset($_POST['editar_resposta'])) {
        $id = $_POST['id'];
        $text = $_POST['text'];
        $es_correcta = isset($_POST['es_correcta']) ? 1 : 0;
        $stmt = $conn->prepare("UPDATE respuestas SET respuesta=?, es_correcta=? WHERE id=?");
        $stmt->bind_param("sii", $text, $es_correcta, $id);
        $stmt->execute();
        $stmt->close();
        // Si es_correcta, posar la resta a 0
        if ($es_correcta) {
            $id_pregunta = $_POST['id_pregunta'];
            $stmt = $conn->prepare("UPDATE respuestas SET es_correcta=0 WHERE id_pregunta=? AND id!=?");
            $stmt->bind_param("ii", $id_pregunta, $id);
            $stmt->execute();
            $stmt->close();
        }
    }
    if (isset($_POST['eliminar_pregunta'])) {
        $id = $_POST['id'];
        // Eliminar respostes primer per integritat referencial
        $stmt = $conn->prepare("DELETE FROM respuestas WHERE id_pregunta=?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $stmt->close();
        // Eliminar la pregunta
        $stmt = $conn->prepare("DELETE FROM preguntas WHERE id=?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $stmt->close();
    }
    if (isset($_POST['nova_pregunta'])) {
        $pregunta = $_POST['pregunta'];
        $imatge = $_POST['imatge'];
        $stmt = $conn->prepare("INSERT INTO preguntas (pregunta, imatge) VALUES (?, ?)");
        $stmt->bind_param("ss", $pregunta, $imatge);
        $stmt->execute();
        $id_pregunta = $conn->insert_id;
        $stmt->close();
        foreach ($_POST['respostes'] as $i => $text) {
            $es_correcta = ($_POST['correcta'] == $i) ? 1 : 0;
            $stmt = $conn->prepare("INSERT INTO respuestas (id_pregunta, respuesta, es_correcta) VALUES (?, ?, ?)");
            $stmt->bind_param("isi", $id_pregunta, $text, $es_correcta);
            $stmt->execute();
            $stmt->close();
        }
    }
    header("Location: llistaPreguntes.php");
    exit;
}

// Llistar preguntes i respostes
$preguntes = [];
$res = $conn->query("SELECT * FROM preguntas");
while ($row = $res->fetch_assoc()) {
    $preguntes[] = $row;
}
?>
<!DOCTYPE html>
<html lang="ca">
<head>
    <meta charset="UTF-8">
    <title>Llista de preguntes</title>
    <style>
        body { font-family: Arial; }
        .pregunta { border:1px solid #ccc; margin:10px 0; padding:10px; }
        .resposta { margin-left: 20px; }
        form { margin-bottom: 10px; }
    </style>
</head>
<body>
    <h1>Llista de preguntes</h1>
    <?php foreach ($preguntes as $p): ?>
        <div class="pregunta">
            <form method="post">
                <input type="hidden" name="id" value="<?= $p['id'] ?>">
                <input type="text" name="pregunta" value="<?= htmlspecialchars($p['pregunta']) ?>" size="80">
                <input type="text" name="imatge" value="<?= htmlspecialchars($p['imatge']) ?>" size="60">
                <button name="editar_pregunta">Desar pregunta</button>
            </form>
            <?php
            $stmt = $conn->prepare("SELECT * FROM respuestas WHERE id_pregunta=?");
            $stmt->bind_param("i", $p['id']);
            $stmt->execute();
            $respostes = $stmt->get_result();
            while ($r = $respostes->fetch_assoc()):
            ?>
                <form method="post" class="resposta">
                    <input type="hidden" name="id" value="<?= $r['id'] ?>">
                    <input type="hidden" name="id_pregunta" value="<?= $p['id'] ?>">
                    <input type="text" name="text" value="<?= htmlspecialchars($r['respuesta']) ?>" size="60">
                    <label>
                        <input type="checkbox" name="es_correcta" <?= $r['es_correcta'] ? 'checked' : '' ?>> Correcta
                    </label>
                    <button name="editar_resposta">Desar resposta</button>
                </form>
            <?php endwhile; $stmt->close(); ?>
        </div>
    <?php endforeach; ?>

    <h2>Afegir nova pregunta</h2>
    <form method="post">
        <input type="text" name="pregunta" placeholder="Text de la pregunta" size="80" required>
        <input type="text" name="imatge" placeholder="URL imatge" size="60">
        <div>
            <input type="text" name="respostes[]" placeholder="Resposta 1" required>
            <input type="radio" name="correcta" value="0" required> Correcta
        </div>
        <div>
            <input type="text" name="respostes[]" placeholder="Resposta 2" required>
            <input type="radio" name="correcta" value="1"> Correcta
        </div>
        <div>
            <input type="text" name="respostes[]" placeholder="Resposta 3" required>
            <input type="radio" name="correcta" value="2"> Correcta
        </div>
        <div>
            <input type="text" name="respostes[]" placeholder="Resposta 4" required>
            <input type="radio" name="correcta" value="3"> Correcta
        </div>
        <button name="nova_pregunta">Afegir pregunta</button>
    </form>
</body>
</html>