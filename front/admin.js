// admin.js - CRUD SPA per a preguntes

const app = document.getElementById('crud-app');

// --- Helpers ---
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}


// --- Renderitzar llista de preguntes (SPA, Bootstrap) ---
async function renderPreguntes() {
  app.innerHTML = '<div class="text-center my-4"><div class="spinner-border"></div> Carregant preguntes...</div>';
  const res = await fetch('../api_preguntas.php');
  const preguntes = await res.json();
  renderTable(preguntes);
}


function renderTable(preguntes) {
  let html = `<button id="add-pregunta" class="btn btn-success mb-3">+ Nova pregunta</button>`;
  html += `<table class="table table-striped"><thead><tr><th>Pregunta</th><th>Imatge</th><th>Respostes</th><th>Accions</th></tr></thead><tbody>`;
  for (const p of preguntes) {
    html += `<tr>
      <td>${escapeHtml(p.pregunta)}</td>
      <td>${p.imatge ? `<img src="${escapeHtml(p.imatge)}" style="max-width:120px;max-height:80px;border-radius:6px;border:1px solid #ccc;">` : ''}</td>
      <td><ul class="mb-0 ps-3">`;
    for (const r of p.respuestas) {
      html += `<li${r.es_correcta ? ' style="font-weight:bold;color:green;"' : ''}>${escapeHtml(r.respuesta)}</li>`;
    }
    html += `</ul></td>
      <td>
        <button data-id="${p.id}" class="btn btn-sm btn-primary edit-pregunta mb-1">Edita</button>
        <button data-id="${p.id}" class="btn btn-sm btn-danger delete-pregunta mb-1">Elimina</button>
      </td>
    </tr>`;
  }
  html += `</tbody></table>`;
  app.innerHTML = html;
  document.getElementById('add-pregunta').onclick = () => renderFormPregunta();
  document.querySelectorAll('.edit-pregunta').forEach(btn => btn.onclick = () => renderFormPregunta(btn.dataset.id));
  document.querySelectorAll('.delete-pregunta').forEach(btn => btn.onclick = () => eliminarPregunta(btn.dataset.id));
}


// --- Formulari per crear/editar pregunta (SPA, Bootstrap) ---
async function renderFormPregunta(id = null) {
  let pregunta = { pregunta: '', imatge: '', respuestas: [ '', '', '', '' ], correcta: 0 };
  if (id) {
    const res = await fetch('../api_preguntas.php');
    const preguntes = await res.json();
    const p = preguntes.find(x => x.id == id);
    pregunta.pregunta = p.pregunta;
    pregunta.imatge = p.imatge;
    pregunta.respuestas = p.respuestas.map(r => r.respuesta);
    pregunta.correcta = p.respuestas.findIndex(r => r.es_correcta);
    pregunta.id = id;
  }
  let html = `<form id="form-pregunta" class="card card-body mb-4" enctype="multipart/form-data">
    <div class="mb-3">
      <label class="form-label">Pregunta</label>
      <input type="text" name="pregunta" class="form-control" value="${escapeHtml(pregunta.pregunta)}" required>
    </div>
    <div class="mb-3">
      <label class="form-label">Imatge (URL o puja una imatge)</label>
      <input type="text" name="imatge" class="form-control mb-2" value="${escapeHtml(pregunta.imatge)}" placeholder="URL de la imatge">
      <input type="file" name="imatge_file" accept="image/*" class="form-control">
      ${pregunta.imatge ? `<img src="${escapeHtml(pregunta.imatge)}" class="img-preview mt-2" style="max-width:120px;max-height:80px;border-radius:6px;border:1px solid #ccc;">` : ''}
    </div>`;
  for (let i = 0; i < 4; i++) {
    html += `<div class="mb-2 row align-items-center">
      <div class="col-8">
        <input type="text" name="respuestas[]" class="form-control" value="${escapeHtml(pregunta.respuestas[i] || '')}" required placeholder="Resposta ${i+1}">
      </div>
      <div class="col-4">
        <div class="form-check">
          <input class="form-check-input" type="radio" name="correcta" value="${i}"${pregunta.correcta == i ? ' checked' : ''} required>
          <label class="form-check-label">Correcta</label>
        </div>
      </div>
    </div>`;
  }
  if (id) html += `<input type="hidden" name="id" value="${id}">`;
  html += `<div class="mt-3">
    <button type="submit" class="btn btn-primary">${id ? 'Desar' : 'Afegir'}</button>
    <button type="button" id="cancelar" class="btn btn-secondary ms-2">Cancel·lar</button>
  </div>
  </form>`;
  app.innerHTML = html;
  document.getElementById('cancelar').onclick = () => renderPreguntes();
  document.getElementById('form-pregunta').onsubmit = async e => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    // Si hay archivo seleccionado, usar FormData (multipart)
    const fileInput = form.querySelector('input[type="file"][name="imatge_file"]');
    const file = fileInput && fileInput.files && fileInput.files[0];
    if (file) {
      // Si hay archivo, enviar todo como FormData
      if (id) formData.append('id', id);
      await fetch('../api_preguntas.php', {
        method: 'POST',
        body: formData
      });
    } else {
      // Si no hay archivo, enviar como JSON
      const data = {
        pregunta: formData.get('pregunta'),
        imatge: formData.get('imatge'),
        respuestas: formData.getAll('respuestas[]'),
        correcta: formData.get('correcta')
      };
      if (id) data.id = id;
      await fetch('../api_preguntas.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    }
    renderPreguntes();
  };
}


// --- Eliminar pregunta (SPA) ---
async function eliminarPregunta(id) {
  if (!confirm('Segur que vols eliminar aquesta pregunta?')) return;
  await fetch('../api_preguntas.php', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `id=${encodeURIComponent(id)}`
  });
  renderPreguntes();
}

// --- Inici ---
renderPreguntes();
