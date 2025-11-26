// === НАСТРОЙКИ УРОВНЕЙ ===
const DIFFICULTY = {
  easy: {
    time: 45,
    startSize: 90,
    shrinkStep: 3,  // уменьшение каждые N очков
    shrinkAmount: 3, // на сколько пикселей
    goldChance: 0.15
  },
  medium: {
    time: 30,
    startSize: 80,
    shrinkStep: 5,
    shrinkAmount: 5,
    goldChance: 0.10
  },
  hard: {
    time: 20,
    startSize: 60,
    shrinkStep: 4,
    shrinkAmount: 6,
    goldChance: 0.05
  }
};

let currentDifficulty = "medium";
let score = 0;
let timeLeft = 30;
let gameActive = false;
let ballSize = 80;
let timer = null;
let tickTimer = null;

// === ЭЛЕМЕНТЫ ===
const ball = document.getElementById("ball");
const scoreEl = document.getElementById("score");
const timeEl = document.getElementById("time");
const finalScoreEl = document.getElementById("final-score");
const recordScoreEl = document.getElementById("record-score");
const startScreen = document.getElementById("start-screen");
const gameScreen = document.getElementById("game-screen");
const endScreen = document.getElementById("end-screen");
const clickEffects = document.getElementById("click-effects");
const globalRecordEl = document.getElementById("global-record");

// === РАБОТА С РЕКОРДАМИ ===
function getRecordKey(diff) {
  return `clickerRecord_${diff}`;
}

function loadRecord(diff) {
  return parseInt(localStorage.getItem(getRecordKey(diff)) || "0", 10);
}

function saveRecord(diff, score) {
  const record = loadRecord(diff);
  if (score > record) {
    localStorage.setItem(getRecordKey(diff), score.toString());
  }
  recordScoreEl.textContent = loadRecord(diff);
}

function loadGlobalRecord() {
  const all = ['easy', 'medium', 'hard'].map(d => loadRecord(d));
  return Math.max(...all, 0);
}

function updateGlobalRecord() {
  const global = loadGlobalRecord();
  globalRecordEl.textContent = global > 0 ? `Рекорд: ${global}` : `Рекорд: —`;
}

// === ИНИЦИАЛИЗАЦИЯ УРОВНЕЙ ===
function initDifficultySelectors() {
  document.querySelectorAll(".diff-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      currentDifficulty = btn.dataset.level;
      startGame();
    });
  });
}

// === ИГРОВАЯ ЛОГИКА ===
function getRandomColor() {
  const { goldChance } = DIFFICULTY[currentDifficulty];
  const colors = [
    { value: "#e53935", points: 1 }, // красный
    { value: "#1e88e5", points: 1 }, // синий
    { value: "#43a047", points: 1 }, // зелёный
    { value: "#ffb300", points: 3 }  // золотой
  ];
  return Math.random() < goldChance ? colors[3] : colors[Math.floor(Math.random() * 3)];
}

function moveBall() {
  if (!gameActive) return;

  const color = getRandomColor();
  ball.style.backgroundColor = color.value;
  ball.dataset.points = color.points;

  const { startSize, shrinkStep, shrinkAmount } = DIFFICULTY[currentDifficulty];
  const newSize = Math.max(40, startSize - Math.floor(score / shrinkStep) * shrinkAmount);
  ball.style.width = newSize + "px";
  ball.style.height = newSize + "px";

  const maxX = window.innerWidth - newSize;
  const maxY = window.innerHeight - newSize;
  const x = Math.floor(Math.random() * maxX);
  const y = Math.floor(Math.random() * maxY);

  ball.style.left = x + "px";
  ball.style.top = y + "px";
}

function createClickEffect(x, y) {
  const effect = document.createElement("div");
  effect.className = "click-effect";
  effect.style.left = x + "px";
  effect.style.top = y + "px";
  clickEffects.appendChild(effect);
  setTimeout(() => effect.remove(), 600);
}

// === ЗВУКИ ===
function playClickSound(points) {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.value = points >= 3 ? 900 : 600;
  osc.type = 'sine';
  gain.gain.value = 0.2;
  osc.start();
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
  osc.stop(ctx.currentTime + 0.2);
}

function playTickSound() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = 'sine';
  osc.frequency.value = 500;
  gain.gain.value = 0.1;
  osc.start();
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
  osc.stop(ctx.currentTime + 0.1);
}

// === ОБРАБОТКА КЛИКА ===
function handleBallClick(e) {
  if (!gameActive) return;
  const points = parseInt(ball.dataset.points);
  score += points;
  scoreEl.textContent = `Счёт: ${score}`;
  createClickEffect(e.clientX || e.touches[0].clientX, e.clientY || e.touches[0].clientY);
  playClickSound(points);
  moveBall();
}

// === ТАЙМЕР ===
function startTimer() {
  const { time } = DIFFICULTY[currentDifficulty];
  timeLeft = time;
  updateTimerDisplay();

  clearInterval(timer);
  clearInterval(tickTimer);
  tickTimer = null;

  timer = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();

    if (timeLeft <= 5) {
      timeEl.classList.add("warning");
      if (!tickTimer) {
        tickTimer = setInterval(playTickSound, 1000);
      }
    }

    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

function updateTimerDisplay() {
  timeEl.textContent = `Время: ${timeLeft}`;
}

function endGame() {
  gameActive = false;
  clearInterval(timer);
  if (tickTimer) clearInterval(tickTimer);
  
  finalScoreEl.textContent = score;
  saveRecord(currentDifficulty, score);
  
  gameScreen.classList.add("hidden");
  endScreen.classList.remove("hidden");
}

// === СТАРТ ИГРЫ ===
function startGame() {
  score = 0;
  scoreEl.textContent = "Счёт: 0";
  gameActive = true;
  
  startScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
  endScreen.classList.add("hidden");
  
  moveBall();
  startTimer();
}

// === СОБЫТИЯ ===
ball.addEventListener("click", handleBallClick);
ball.addEventListener("touchstart", (e) => {
  e.preventDefault();
  handleBallClick(e);
});

document.getElementById("restart-btn").addEventListener("click", startGame);
document.getElementById("back-to-menu").addEventListener("click", () => {
  clearInterval(timer);
  if (tickTimer) clearInterval(tickTimer);
  gameScreen.classList.add("hidden");
  endScreen.classList.add("hidden");
  startScreen.classList.remove("hidden");
  updateGlobalRecord();
});

// === ЗАПУСК ===
initDifficultySelectors();
updateGlobalRecord();