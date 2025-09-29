<?php
// admin_crud.php - CRUD de preguntas y respuestas con Bootstrap
// Asume una base de datos MySQL y una tabla de preguntas y respuestas

// Configuración de la base de datos
$host = 'localhost';
$user = 'a23poldiabel_pol';
$pass = '123456aA!';
$db = 'a23poldiabel_projecte0'; // Cambia esto por el nombre real de tu BD
$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) die('Error de conexión: ' . $conn->connect_error);

// --- Helpers ---
function escape($str) {
    return htmlspecialchars($str, ENT_QUOTES, 'UTF-8');
}

// --- Acciones CRUD ---
$action = $_POST['action'] ?? $_GET['action'] ?? '';

// Crear o editar pregunta
if ($action === 'save') {
    $id = $_POST['id'] ?? '';
    $pregunta = $_POST['pregunta'] ?? '';
    $imatge = $_POST['imatge'] ?? '';
    $respuestas = $_POST['respuestas'] ?? [];
    $correcta = $_POST['correcta'] ?? 0;
    if ($id) {
        $stmt = $conn->prepare('UPDATE preguntas SET pregunta=?, imatge=? WHERE id=?');
        $stmt->bind_param('ssi', $pregunta, $imatge, $id);
        $stmt->execute();
        $conn->query("DELETE FROM respuestas WHERE id_pregunta=" . intval($id));
    } else {
        $stmt = $conn->prepare('INSERT INTO preguntas (pregunta, imatge) VALUES (?, ?)');
        $stmt->bind_param('ss', $pregunta, $imatge);
        $stmt->execute();
        $id = $conn->insert_id;
    }
    // Guardar respuestas
    foreach ($respuestas as $i => $respuesta) {
        $es_correcta = ($i == $correcta) ? 1 : 0;
        $stmt = $conn->prepare('INSERT INTO respuestas (respuesta, es_correcta, id_pregunta) VALUES (?, ?, ?)');
        $stmt->bind_param('sii', $respuesta, $es_correcta, $id);
        $stmt->execute();
    }
    header('Location: admin_crud.php');
    exit;
}

// Eliminar pregunta
if ($action === 'delete' && isset($_GET['id'])) {
    $id = intval($_GET['id']);
    $conn->query("DELETE FROM respuestas WHERE id_pregunta=$id");
    $conn->query("DELETE FROM preguntas WHERE id=$id");
    header('Location: admin_crud.php');
    exit;
}

// Obtener preguntas y respuestas
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

// Si se está editando una pregunta
$edit = null;
if ($action === 'edit' && isset($_GET['id'])) {
    $edit = $preguntas[$_GET['id']] ?? null;
}

?><!DOCTYPE html>
<html lang="ca">
<head>
    <meta charset="UTF-8">
    <title>Administra preguntas - Test de conducció 🚗</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        .img-preview { max-width: 120px; max-height: 80px; border-radius: 6px; border: 1px solid #ccc; }
        .table td, .table th { vertical-align: middle; }
    </style>
</head>
<body class="bg-light">
<div class="container py-4">
    <a href="index.html" class="btn btn-link mb-3">← Tornar al test</a>
    <h1 class="mb-4">Administració de preguntas 🚗</h1>
    <?php if ($edit): ?>
        <div class="card mb-4">
            <div class="card-header">Editar pregunta</div>
            <div class="card-body">
                <form method="post">
                    <input type="hidden" name="action" value="save">
                    <input type="hidden" name="id" value="<?=escape($edit['id'])?>">
                    <div class="mb-3">
                        <label class="form-label">Pregunta</label>
                        <input type="text" name="pregunta" class="form-control" value="<?=escape($edit['pregunta'])?>" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Imatge (URL)</label>
                        <input type="text" name="imatge" class="form-control" value="<?=escape($edit['imatge'])?>">
                        <?php if ($edit['imatge']): ?>
                            <img src="<?=escape($edit['imatge'])?>" class="img-preview mt-2">
                        <?php endif; ?>
                    </div>
                    <?php foreach ($edit['respuestas'] as $i => $r): ?>
                        <div class="mb-2 row align-items-center">
                            <div class="col-8">
                                <input type="text" name="respuestas[]" class="form-control" value="<?=escape($r['respuesta'])?>" required>
                            </div>
                            <div class="col-4">
                                <div class="form-check">
                                    <input class="form-check-input" type="radio" name="correcta" value="<?=$i?>" <?=($r['es_correcta']?'checked':'')?> required>
                                    <label class="form-check-label">Correcta</label>
                                </div>
                            </div>
                        </div>
                    <?php endforeach; ?>
                    <button type="submit" class="btn btn-primary mt-3">Desar</button>
                    <a href="admin_crud.php" class="btn btn-secondary mt-3">Cancel·lar</a>
                </form>
            </div>
        </div>
    <?php else: ?>
        <div class="card mb-4">
            <div class="card-header">Afegir nova pregunta</div>
            <div class="card-body">
                <form method="post">
                    <input type="hidden" name="action" value="save">
                    <div class="mb-3">
                        <label class="form-label">Pregunta</label>
                        <input type="text" name="pregunta" class="form-control" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Imatge (URL)</label>
                        <input type="text" name="imatge" class="form-control">
                    </div>
                    <?php for ($i=0; $i<4; $i++): ?>
                        <div class="mb-2 row align-items-center">
                            <div class="col-8">
                                <input type="text" name="respuestas[]" class="form-control" required placeholder="Resposta <?=($i+1)?>">
                            </div>
                            <div class="col-4">
                                <div class="form-check">
                                    <input class="form-check-input" type="radio" name="correcta" value="<?=$i?>" <?=($i==0?'checked':'')?> required>
                                    <label class="form-check-label">Correcta</label>
                                </div>
                            </div>
                        </div>
                    <?php endfor; ?>
                    <button type="submit" class="btn btn-success mt-3">Afegir</button>
                </form>
            </div>
        </div>
    <?php endif; ?>
    <div class="card">
        <div class="card-header">Llista de preguntas</div>
        <div class="card-body p-0">
            <table class="table table-striped mb-0">
                <thead>
                    <tr>
                        <th>Pregunta</th>
                        <th>Imatge</th>
                        <th>respuestas</th>
                        <th>Accions</th>
                    </tr>
                </thead>
                <tbody>
                <?php foreach ($preguntas as $p): ?>
                    <tr>
                        <td><?=escape($p['pregunta'])?></td>
                        <td>
                            <?php if ($p['imatge']): ?>
                                <img src="<?=escape($p['imatge'])?>" class="img-preview">
                            <?php endif; ?>
                        </td>
                        <td>
                            <ul class="mb-0 ps-3">
                                <?php foreach ($p['respuestas'] as $r): ?>
                                    <li<?=($r['es_correcta']?' style="font-weight:bold;color:green;"':'')?>><?=escape($r['respuesta'])?></li>
                                <?php endforeach; ?>
                            </ul>
                        </td>
                        <td>
                            <a href="admin_crud.php?action=edit&id=<?=$p['id']?>" class="btn btn-sm btn-primary mb-1">Edita</a>
                            <a href="admin_crud.php?action=delete&id=<?=$p['id']?>" class="btn btn-sm btn-danger mb-1" onclick="return confirm('Segur que vols eliminar aquesta pregunta?')">Elimina</a>
                        </td>
                    </tr>
                <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    </div>
</div>
</body>
</html>
