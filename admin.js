// admin.js - CRUD SPA per a preguntes

const app = document.getElementById('crud-app');

// --- Helpers ---
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// --- Renderitzar llista de preguntes ---
async function renderPreguntes() {
  app.innerHTML = '<p>Carregant preguntes...</p>';
  const res = await fetch('llistaPreguntes.php');
  const html = await res.text();
  // Parse HTML per obtenir preguntes i respostes (o millor, crear un endpoint JSON en el futur)
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const preguntes = [...doc.querySelectorAll('.pregunta')].map(div => {
    const id = div.querySelector('input[name="id"]').value;
    const pregunta = div.querySelector('input[name="pregunta"]').value;
    const imatge = div.querySelector('input[name="imatge"]').value;
    const respostes = [...div.querySelectorAll('.resposta')].map(form => {
      return {
        id: form.querySelector('input[name="id"]').value,
        text: form.querySelector('input[name="text"]').value,
        es_correcta: form.querySelector('input[name="es_correcta"]').checked,
        id_pregunta: form.querySelector('input[name="id_pregunta"]').value
      };
    });
    return { id, pregunta, imatge, respostes };
  });
  renderTable(preguntes);
}

function renderTable(preguntes) {
  let html = `<button id="add-pregunta">+ Nova pregunta</button>`;
  html += `<table><thead><tr><th>Pregunta</th><th>Imatge</th><th>Respostes</th><th>Accions</th></tr></thead><tbody>`;
  for (const p of preguntes) {
    html += `<tr>
      <td>${escapeHtml(p.pregunta)}</td>
      <td>${escapeHtml(p.imatge)}</td>
      <td><ul style="padding-left:18px;">`;
    for (const r of p.respostes) {
      html += `<li${r.es_correcta ? ' style="font-weight:bold;color:green;"' : ''}>${escapeHtml(r.text)}</li>`;
    }
    html += `</ul></td>
      <td class="actions">
        <button data-id="${p.id}" class="edit-pregunta">Edita</button>
        <button data-id="${p.id}" class="delete-pregunta">Elimina</button>
      </td>
    </tr>`;
  }
  html += `</tbody></table>`;
  app.innerHTML = html;
  document.getElementById('add-pregunta').onclick = () => renderFormPregunta();
  document.querySelectorAll('.edit-pregunta').forEach(btn => btn.onclick = () => renderFormPregunta(btn.dataset.id));
  document.querySelectorAll('.delete-pregunta').forEach(btn => btn.onclick = () => eliminarPregunta(btn.dataset.id));
}

// --- Formulari per crear/editar pregunta ---
async function renderFormPregunta(id = null) {
  let pregunta = { pregunta: '', imatge: '', respostes: [ '', '', '', '' ], correcta: 0 };
  if (id) {
    // Carregar dades de la pregunta existent
    const res = await fetch('llistaPreguntes.php');
    const html = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const div = [...doc.querySelectorAll('.pregunta')].find(d => d.querySelector('input[name="id"]').value == id);
    pregunta.pregunta = div.querySelector('input[name="pregunta"]').value;
    pregunta.imatge = div.querySelector('input[name="imatge"]').value;
    pregunta.respostes = [...div.querySelectorAll('.resposta')].map(f => f.querySelector('input[name="text"]').value);
    pregunta.correcta = [...div.querySelectorAll('.resposta')].findIndex(f => f.querySelector('input[name="es_correcta"]').checked);
    pregunta.id = id;
  }
  let html = `<form id="form-pregunta">
    <div class="form-row"><label>Pregunta:</label><input type="text" name="pregunta" value="${escapeHtml(pregunta.pregunta)}" required></div>
    <div class="form-row"><label>Imatge:</label><input type="text" name="imatge" value="${escapeHtml(pregunta.imatge)}"></div>`;
  for (let i = 0; i < 4; i++) {
    html += `<div class="form-row">
      <label>Resposta ${i+1}:</label>
      <input type="text" name="respostes[]" value="${escapeHtml(pregunta.respostes[i] || '')}" required>
      <input type="radio" name="correcta" value="${i}"${pregunta.correcta == i ? ' checked' : ''}> Correcta
    </div>`;
  }
  if (id) html += `<input type="hidden" name="id" value="${id}">`;
  html += `<div class="form-row">
    <button type="submit">${id ? 'Desar' : 'Afegir'}</button>
    <button type="button" id="cancelar">Cancel·lar</button>
  </div>
  </form>`;
  app.innerHTML = html;
  document.getElementById('cancelar').onclick = () => renderPreguntes();
  document.getElementById('form-pregunta').onsubmit = async e => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    if (id) formData.append('editar_pregunta', '1');
    else formData.append('nova_pregunta', '1');
    await fetch('llistaPreguntes.php', { method: 'POST', body: formData });
    renderPreguntes();
  };
}

// --- Eliminar pregunta ---
async function eliminarPregunta(id) {
  if (!confirm('Segur que vols eliminar aquesta pregunta?')) return;
  // No hi ha endpoint per eliminar, així que s'hauria d'afegir a llistaPreguntes.php
  const formData = new FormData();
  formData.append('eliminar_pregunta', '1');
  formData.append('id', id);
  await fetch('llistaPreguntes.php', { method: 'POST', body: formData });
  renderPreguntes();
}

// --- Inici ---
renderPreguntes();
