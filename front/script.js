// --- Variables globals i estat ---
let preguntes = [];
let estatDeLaPartida = {
  contadorPreguntes: 0,
  respostesUsuari: []
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
    partidaDiv.innerHTML = "<h2 class='text-center my-4'>Has respost totes les preguntes!</h2>";
      partidaDiv.appendChild(btnEnviarResultats);
      btnEnviarResultats.style.display = "block";
    return;
  }
  btnEnviarResultats.style.display = "none";

  // Mostrar pregunta actual
  const q = preguntes[estatDeLaPartida.contadorPreguntes];
  let html = `
    <h3 class='mb-3 text-center'>
      Pregunta ${estatDeLaPartida.contadorPreguntes + 1}:<br>
      <span class='fw-normal'>${q.pregunta}</span>
    </h3>
  `;

  if (q.imatge) {
    let imgSrc = q.imatge.trim();

    // Si empieza por http o https → es externa
    if (/^https?:\/\//i.test(imgSrc)) {
      // no tocar la ruta
    } else {
      // imagen local: asegurar que apunta bien al directorio fotos/
      imgSrc = `../${imgSrc}`;
    }

    html += `<img src="${imgSrc}" alt="imatge pregunta" class="img-quiz mx-auto d-block" width="240" height="160">`;
  }


  html += `<div class="answers d-grid gap-2">`;
  q.respostes.forEach(resposta => {
    html += `<button class="btn btn-resposta btn-outline-primary" data-id="${resposta.id}">${resposta.text}</button>`;
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
  fetch('../finalitza.php', {
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
        <button id="restart" class="btn btn-primary mt-3">Tornar a començar</button>
      `;
      document.getElementById("restart").addEventListener("click", reiniciarPartida);
    });
});

// --- Inici de la partida ---
function iniciarPartida(preguntesCarregades) {
  preguntes = preguntesCarregades;
  estatDeLaPartida = { contadorPreguntes: 0, respostesUsuari: [] };
  renderitzarMarcador();
  renderitzarPregunta();
  startTime = Date.now();
  clearInterval(timerInterval);
  timerInterval = setInterval(updateTimer, 1000);

  formulariNom.style.display = "none";
  salutacioDiv.style.display = "none";
  partidaDiv.style.display = "";
  marcadorDiv.style.display = "";
  timerElement.style.display = "";
    btnEnviarResultats.style.display = "none";
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
  btnEsborrarNom.style.display = "none";
    btnEnviarResultats.style.display = "none";
}

function mostrarSalutacio(nom) {
  formulariNom.style.display = "none";
  salutacioDiv.style.display = "";
  missatgeSalutacio.textContent = `Hola, ${nom}!`;
  partidaDiv.style.display = "none";
  marcadorDiv.style.display = "none";
  timerElement.style.display = "none";
  btnEsborrarNom.style.display = "";
    btnEnviarResultats.style.display = "none";
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
  clearInterval(timerInterval);
  partidaDiv.style.display = "none";
  marcadorDiv.style.display = "none";
  timerElement.style.display = "none";
  btnEsborrarNom.style.display = "none";
});

// --- Carregar preguntes amb fetch des de la API PHP ---
function carregarPreguntes() {
  fetch('../getPreguntes.php?num=10')
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
