<?php
// filepath: c:\Users\poldi\Documents\Pedralbes\Projectes Transversals\Projecte 0\tr0-daw-poldiazbeltran\llistaPreguntes.php
// Connexió a la base de dades amb mysqli
$conn = new mysqli('localhost', 'a23poldiabel_pol', '123456aA!', 'a23poldiabel_projecte0');
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
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
        <style>
            .pregunta { border:1px solid #dee2e6; margin:10px 0; padding:10px; border-radius:8px; background:#fff; }
            .resposta { margin-left: 20px; }
        </style>
</head>
<body class="bg-light">
    <div class="container py-4">
        <h1 class="mb-4">Llista de preguntes</h1>
        <?php foreach ($preguntes as $p): ?>
            <div class="pregunta mb-3 shadow-sm">
                <form method="post" class="row g-2 align-items-center mb-2">
                    <input type="hidden" name="id" value="<?= $p['id'] ?>">
                    <div class="col-md-6">
                        <input type="text" name="pregunta" class="form-control" value="<?= htmlspecialchars($p['pregunta']) ?>" placeholder="Pregunta">
                    </div>
                    <div class="col-md-4">
                        <input type="text" name="imatge" class="form-control" value="<?= htmlspecialchars($p['imatge']) ?>" placeholder="URL imatge">
                    </div>
                    <div class="col-md-2">
                        <button name="editar_pregunta" class="btn btn-primary w-100">Desar pregunta</button>
                    </div>
                </form>
                <?php
                $stmt = $conn->prepare("SELECT * FROM respuestas WHERE id_pregunta=?");
                $stmt->bind_param("i", $p['id']);
                $stmt->execute();
                $respostes = $stmt->get_result();
                while ($r = $respostes->fetch_assoc()):
                ?>
                    <form method="post" class="resposta row g-2 align-items-center mb-1">
                        <input type="hidden" name="id" value="<?= $r['id'] ?>">
                        <input type="hidden" name="id_pregunta" value="<?= $p['id'] ?>">
                        <div class="col-md-8">
                            <input type="text" name="text" class="form-control" value="<?= htmlspecialchars($r['respuesta']) ?>" placeholder="Resposta">
                        </div>
                        <div class="col-md-2">
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" name="es_correcta" <?= $r['es_correcta'] ? 'checked' : '' ?>>
                                <label class="form-check-label">Correcta</label>
                            </div>
                        </div>
                        <div class="col-md-2">
                            <button name="editar_resposta" class="btn btn-secondary w-100">Desar resposta</button>
                        </div>
                    </form>
                <?php endwhile; $stmt->close(); ?>
            </div>
        <?php endforeach; ?>

        <h2 class="mt-5 mb-3">Afegir nova pregunta</h2>
        <form method="post" class="card card-body shadow-sm mb-5">
            <div class="row g-2 mb-2">
                <div class="col-md-6">
                    <input type="text" name="pregunta" class="form-control" placeholder="Text de la pregunta" required>
                </div>
                <div class="col-md-6">
                    <input type="text" name="imatge" class="form-control" placeholder="URL imatge">
                </div>
            </div>
            <?php for ($i=0; $i<4; $i++): ?>
                <div class="row g-2 align-items-center mb-2">
                    <div class="col-md-10">
                        <input type="text" name="respostes[]" class="form-control" placeholder="Resposta <?=($i+1)?>" required>
                    </div>
                    <div class="col-md-2">
                        <div class="form-check">
                            <input class="form-check-input" type="radio" name="correcta" value="<?=$i?>" <?= $i==0 ? 'required' : '' ?>>
                            <label class="form-check-label">Correcta</label>
                        </div>
                    </div>
                </div>
            <?php endfor; ?>
            <button name="nova_pregunta" class="btn btn-success mt-2">Afegir pregunta</button>
        </form>
    </div>
</body>
</html>