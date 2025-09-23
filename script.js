import data from "./data.js";

const quizContainer = document.getElementById("quiz-container");
const timerElement = document.getElementById("timer");

let currentQuestionIndex = 0;
let correctAnswers = 0;
let questions = [];
let startTime, timerInterval;

// --- Función para barajar array ---
function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

// --- Iniciar test ---
function startQuiz() {
  // Escoger 10 preguntas aleatorias
  questions = shuffle([...data.preguntes]).slice(0, 10);
  currentQuestionIndex = 0;
  correctAnswers = 0;

  // Iniciar cronómetro
  startTime = Date.now();
  timerInterval = setInterval(updateTimer, 1000);

  showQuestion();
}

// --- Mostrar tiempo ---
function updateTimer() {
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  const minutes = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const seconds = String(elapsed % 60).padStart(2, "0");
  timerElement.textContent = `⏱️ ${minutes}:${seconds}`;
}

// --- Mostrar una pregunta ---
function showQuestion() {
  quizContainer.innerHTML = "";

  if (currentQuestionIndex >= questions.length) {
    endQuiz();
    return;
  }

  const q = questions[currentQuestionIndex];

  const questionEl = document.createElement("h3");
  questionEl.textContent = `Pregunta ${currentQuestionIndex + 1}: ${q.pregunta}`;
  quizContainer.appendChild(questionEl);

  if (q.imatge) {
    const img = document.createElement("img");
    img.src = q.imatge;
    img.alt = "imatge pregunta";
    quizContainer.appendChild(img);
  }

  const answersDiv = document.createElement("div");
  answersDiv.className = "answers";

  const allAnswers = shuffle([q.resposta_correcta, ...q.respostes_incorrectes]);

  allAnswers.forEach(answer => {
    const btn = document.createElement("button");
    btn.textContent = answer;

    btn.addEventListener("click", () => {
      if (answer === q.resposta_correcta) {
        btn.classList.add("correct");
        correctAnswers++;
      } else {
        btn.classList.add("incorrect");
      }

      // Deshabilitar todos los botones
      answersDiv.querySelectorAll("button").forEach(b => (b.disabled = true));
      
      // Pasar a la siguiente después de un pequeño delay
      setTimeout(() => {
        currentQuestionIndex++;
        showQuestion();
      }, 1000);
    });

    answersDiv.appendChild(btn);
  });

  quizContainer.appendChild(answersDiv);
}

// --- Finalizar test ---
function endQuiz() {
  clearInterval(timerInterval);

  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  const minutes = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const seconds = String(elapsed % 60).padStart(2, "0");

  quizContainer.innerHTML = `
    <h2>🎉 Test finalitzat!</h2>
    <p>Has encertat <b>${correctAnswers}</b> de <b>${questions.length}</b> preguntes.</p>
    <p>⏱️ Temps total: ${minutes}:${seconds}</p>
    <button id="restart">Tornar a començar</button>
  `;

  document.getElementById("restart").addEventListener("click", startQuiz);
}

// --- Iniciar tot ---
startQuiz();
