// --- Variables globals i estat ---
let preguntes = [];
let estatDeLaPartida = {
  contadorPreguntes: 0,
  respostesUsuari: [] // aquí guardarem l'id de la resposta seleccionada
};
let startTime, timerInterval;
let nomUsuari = null;

// --- Selecció d'elements ---
const partidaDiv = document.getElementById("partida");
const marcadorDiv = document.getElementById("marcador");
const timerElement = document.getElementById("timer");
const btnEnviarResultats = document.getElementById("enviar-resultats");
const formulariNom = document.getElementById("formulari-nom");
const inputNom = document.getElementById("input-nom");
const salutacioDiv = document.getElementById("salutacio");
const missatgeSalutacio = document.getElementById("missatge-salutacio");
const btnEsborrarNom = document.getElementById("esborrar-nom");

// --- Utilitats ---
function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

// --- Temporitzador ---
function updateTimer() {
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  const minutes = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const seconds = String(elapsed % 60).padStart(2, "0");
  timerElement.textContent = `⏱️ ${minutes}:${seconds}`;
}

// --- Renderitzar marcador ---
function renderitzarMarcador() {
  marcadorDiv.textContent = `Preguntes respostes: ${estatDeLaPartida.contadorPreguntes} de ${preguntes.length}`;
}

// --- Renderitzar pregunta actual ---
function renderitzarPregunta() {
  if (estatDeLaPartida.contadorPreguntes >= preguntes.length) {
    btnEnviarResultats.classList.remove("hidden");
    partidaDiv.innerHTML = "<h2>Has respost totes les preguntes!</h2>";
    return;
  }
  btnEnviarResultats.classList.add("hidden");
  const q = preguntes[estatDeLaPartida.contadorPreguntes];
  let html = `<h3>Pregunta ${estatDeLaPartida.contadorPreguntes + 1}: ${q.pregunta}</h3>`;
  if (q.imatge) {
    html += `<img src="${q.imatge}" alt="imatge pregunta">`;
  }
  html += `<div class="answers">`;
  q.respostes.forEach(resposta => {
    html += `<button class="btn-resposta" data-id="${resposta.id}">${resposta.text}</button>`;
  });
  html += `</div>`;
  partidaDiv.innerHTML = html;
}

// --- Gestió de resposta ---
function processarResposta(respostaId) {
  estatDeLaPartida.respostesUsuari.push(respostaId);
  estatDeLaPartida.contadorPreguntes++;
  renderitzarMarcador();
  renderitzarPregunta();
}

// --- Delegació d'events per respostes ---
partidaDiv.addEventListener("click", function(event) {
  if (event.target.classList.contains("btn-resposta")) {
    const respostaId = event.target.getAttribute("data-id");
    processarResposta(respostaId);
  }
});

// --- Botó Enviar Resultats ---
btnEnviarResultats.addEventListener("click", function() {
  clearInterval(timerInterval);
  fetch('finalitza.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ respostes: estatDeLaPartida.respostesUsuari })
  })
    .then(res => res.json())
    .then(resultat => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const minutes = String(Math.floor(elapsed / 60)).padStart(2, "0");
      const seconds = String(elapsed % 60).padStart(2, "0");
      partidaDiv.innerHTML = `
        <h2>🎉 Test finalitzat!</h2>
        <p>Has encertat <b>${resultat.correctes}</b> de <b>${resultat.total}</b> preguntes.</p>
        <p>⏱️ Temps total: ${minutes}:${seconds}</p>
        <button id="restart">Tornar a començar</button>
      `;
      btnEnviarResultats.classList.add("hidden");
      document.getElementById("restart").addEventListener("click", reiniciarPartida);
    });
});

// --- Inici de la partida ---
function iniciarPartida(preguntesCarregades) {
  preguntes = preguntesCarregades;
  estatDeLaPartida = { contadorPreguntes: 0, respostesUsuari: [] };
  renderitzarMarcador();
  renderitzarPregunta();
  btnEnviarResultats.classList.add("hidden");
  startTime = Date.now();
  clearInterval(timerInterval);
  timerInterval = setInterval(updateTimer, 1000);
  // Oculta formulari nom i salutació, mostra només el quiz
  formulariNom.style.display = "none";
  salutacioDiv.style.display = "none";
  partidaDiv.style.display = "";
  marcadorDiv.style.display = "";
  timerElement.style.display = "";
}

// --- Reiniciar partida ---
function reiniciarPartida() {
  carregarPreguntes();
}

// --- Gestió del nom d'usuari amb localStorage ---
function mostrarFormulariNom() {
  formulariNom.style.display = "";
  salutacioDiv.style.display = "none";
  partidaDiv.style.display = "none";
  marcadorDiv.style.display = "none";
  timerElement.style.display = "none";
  btnEnviarResultats.classList.add("hidden");
  btnEsborrarNom.style.display = "none";
}
function mostrarSalutacio(nom) {
  formulariNom.style.display = "none";
  salutacioDiv.style.display = "";
  missatgeSalutacio.textContent = `Hola, ${nom}!`;
  partidaDiv.style.display = "none";
  marcadorDiv.style.display = "none";
  timerElement.style.display = "none";
  btnEnviarResultats.classList.add("hidden");
  btnEsborrarNom.style.display = "";
  btnEsborrarNom.style.display = "";
}
function comprovarNomUsuari() {
  const nom = localStorage.getItem("nomUsuari");
  if (nom) {
    nomUsuari = nom;
    mostrarSalutacio(nomUsuari);
  } else {
    mostrarFormulariNom();
  }
}
formulariNom.addEventListener("submit", function(e) {
  e.preventDefault();
  const nom = inputNom.value.trim();
  if (nom) {
    localStorage.setItem("nomUsuari", nom);
    nomUsuari = nom;
    mostrarSalutacio(nomUsuari);
    carregarPreguntes();
  }
});
btnEsborrarNom.addEventListener("click", function() {
  localStorage.removeItem("nomUsuari");
  nomUsuari = null;
  mostrarFormulariNom();
  partidaDiv.innerHTML = "";
  marcadorDiv.textContent = "";
  timerElement.textContent = "⏱️ 00:00";
  btnEnviarResultats.classList.add("hidden");
  clearInterval(timerInterval);
  partidaDiv.style.display = "none";
  marcadorDiv.style.display = "none";
  timerElement.style.display = "none";
  btnEsborrarNom.style.display = "none";
});

// --- Carregar preguntes amb fetch des de la API PHP ---
function carregarPreguntes() {
  fetch('getPreguntes.php?num=10')
    .then(response => response.json())
    .then(data => {
      preguntes = data;
      if (nomUsuari) iniciarPartida(preguntes);
    });
}

// --- Inici ---
comprovarNomUsuari();
if (localStorage.getItem("nomUsuari")) {
  carregarPreguntes();
}
