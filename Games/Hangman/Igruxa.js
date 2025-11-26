const categories = {
  fruits: { name: "Фрукты", words: ["яблоко", "банан", "апельсин", "манго", "киви", "персик", "ананас", "вишня", "груша", "лимон", "виноград", "мандарин", "абрикос", "слива", "гранат"] },
  animals: { name: "Животные", words: ["собака", "кошка", "тигр", "лев", "слон", "жираф", "попугай", "крокодил", "обезьяна", "лось", "лиса", "волк", "заяц", "медведь", "енот"] },
  tech: { name: "Техника", words: ["телефон", "компьютер", "ноутбук", "мышь", "клавиатура", "наушники", "колонка", "проектор", "принтер", "маршрутизатор", "монитор", "сканер", "робот", "планшет", "часы"] },
  nature: { name: "Природа", words: ["гора", "река", "лес", "море", "озеро", "пещера", "песок", "камень", "ветер", "дождь", "снег", "лужа", "трава", "цветок", "облако"] },
  food: { name: "Еда", words: ["пицца", "бургер", "суши", "пельмени", "блины", "омлет", "суп", "салат", "сыр", "хлеб", "макароны", "рис", "картошка", "огурец", "помидор"] },
  cities: { name: "Города РФ", words: ["москва", "петербург", "казань", "сочи", "владивосток", "екатеринбург", "новосибирск", "самара", "ростов", "краснодар", "уфа", "челябинск", "воронеж", "саратов", "тула"] }
};

let secretWord = "";
let guessedLetters = [];
let attemptsLeft = 6;
let currentCategory = null;
let timeLeft = 60;
let timerInterval = null;
let startTime = null;
let tickInterval = null;

// === РАБОТА С ДАННЫМИ ===
function loadWins() {
  return parseInt(localStorage.getItem("hangmanWins") || "0", 10);
}

function saveWin() {
  const wins = loadWins() + 1;
  localStorage.setItem("hangmanWins", wins.toString());
  updateStatsDisplay();
}

function loadBestTime() {
  return parseFloat(localStorage.getItem("hangmanBestTime")) || null;
}

function saveBestTime(time) {
  const best = loadBestTime();
  if (best === null || time < best) {
    localStorage.setItem("hangmanBestTime", time.toString());
    updateStatsDisplay();
  }
}

function updateStatsDisplay() {
  document.getElementById("wins-counter").textContent = `Побед: ${loadWins()}`;
  const best = loadBestTime();
  document.getElementById("best-time").textContent = best ? `Рекорд: ${best} сек` : `Рекорд: —`;
}

// === ЗВУКИ ===
function playWinSound() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = 'sine';
  osc.frequency.value = 800;
  gain.gain.value = 0.3;
  osc.start();
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
  osc.stop(ctx.currentTime + 0.5);
}

function playLoseSound() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = 'sine';
  osc.frequency.value = 200;
  gain.gain.value = 0.2;
  osc.start();
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
  osc.stop(ctx.currentTime + 0.3);
}

function playErrorSound() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = 'square';
  osc.frequency.value = 300;
  gain.gain.value = 0.15;
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
  osc.frequency.value = 600;
  gain.gain.value = 0.1;
  osc.start();
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
  osc.stop(ctx.currentTime + 0.1);
}

// === ТАЙМЕР ===
function startTimer() {
  stopTimer();
  timeLeft = 60;
  startTime = Date.now();
  updateTimerDisplay();

  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();

    const timerEl = document.getElementById("timer");
    if (timeLeft <= 10) {
      timerEl.classList.add("warning");
      // Запускаем тиканье
      if (!tickInterval) {
        tickInterval = setInterval(playTickSound, 1000);
      }
    } else {
      timerEl.classList.remove("warning");
    }

    if (timeLeft <= 0) {
      stopTimer();
      playLoseSound();
      disableAllButtons();
      showLoseScreen();
    }
  }, 1000);
}

function stopTimer() {
  if (timerInterval) clearInterval(timerInterval);
  if (tickInterval) {
    clearInterval(tickInterval);
    tickInterval = null;
  }
  timerInterval = null;
}

function updateTimerDisplay() {
  document.getElementById("timer").textContent = `Время: ${timeLeft}`;
}

// === ИГРОВАЯ ЛОГИКА ===
function getRandomWordFromCategory(categoryKey) {
  const list = categories[categoryKey].words;
  return list[Math.floor(Math.random() * list.length)];
}

function displayWord() {
  let display = "";
  for (let letter of secretWord) {
    display += guessedLetters.includes(letter) ? letter + " " : "_ ";
  }
  document.getElementById("word").textContent = display.trim();
}

function updateAttempts() {
  document.getElementById("attempts").textContent = `Осталось попыток: ${attemptsLeft}`;
}

function checkWin() {
  return secretWord.split("").every(letter => guessedLetters.includes(letter));
}

function updateHangman() {
  const parts = ['head', 'body', 'left-arm', 'right-arm', 'left-leg', 'right-leg'];
  const errors = 6 - attemptsLeft;
  parts.forEach((id, i) => {
    document.getElementById(id).style.display = i < errors ? 'block' : 'none';
  });
}

function disableAllButtons() {
  document.querySelectorAll("#letters button").forEach(btn => btn.disabled = true);
}

function generateLetterButtons() {
  const alphabet = "абвгдеёжзийклмнопрстуфхцчшщъыьэюя";
  const lettersDiv = document.getElementById("letters");
  lettersDiv.innerHTML = "";

  for (let letter of alphabet) {
    const btn = document.createElement("button");
    btn.textContent = letter;
    btn.onclick = () => handleGuess(letter);
    lettersDiv.appendChild(btn);
  }
}

// === КОНФЕТТИ ===
function createConfetti() {
  const container = document.getElementById("confetti-container");
  container.innerHTML = "";
  const colors = ['#f00', '#0f0', '#00f', '#ff0', '#0ff', '#f0f'];
  const count = 150;
  for (let i = 0; i < count; i++) {
    const confetti = document.createElement("div");
    confetti.className = "confetti";
    confetti.style.left = Math.random() * 100 + "vw";
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.width = (Math.random() * 10 + 5) + "px";
    confetti.style.height = (Math.random() * 10 + 5) + "px";
    container.appendChild(confetti);
    const animation = confetti.animate([
      { transform: "translateY(0) rotate(0deg)", opacity: 1 },
      { transform: `translateY(${100 + Math.random() * 50}vh) rotate(${Math.random() * 360}deg)`, opacity: 0 }
    ], {
      duration: 3000 + Math.random() * 2000,
      easing: "cubic-bezier(0.1, 0.8, 0.2, 1)"
    });
    animation.onfinish = () => confetti.remove();
  }
}

// === ЭКРАНЫ ===
function showWinScreen() {
  stopTimer();
  const timeSpent = Math.round((Date.now() - startTime) / 1000);
  saveWin();
  saveBestTime(timeSpent);

  document.getElementById("win-word").textContent = secretWord;
  document.getElementById("win-time").textContent = timeSpent;
  document.getElementById("win-screen").classList.add("active");
  createConfetti();
}

function showLoseScreen() {
  stopTimer();
  document.getElementById("lose-word").textContent = secretWord;
  document.getElementById("lose-screen").classList.add("active");
}

function hideEndScreens() {
  document.getElementById("win-screen").classList.remove("active");
  document.getElementById("lose-screen").classList.remove("active");
  document.getElementById("confetti-container").innerHTML = "";
}

// === ОБРАБОТКА БУКВ ===
function handleGuess(letter) {
  const btn = event.target;
  if (btn.disabled) return;
  btn.disabled = true;
  if (guessedLetters.includes(letter)) return;

  guessedLetters.push(letter);

  if (!secretWord.includes(letter)) {
    playErrorSound();
    attemptsLeft--;
    updateAttempts();
    updateHangman();
    if (attemptsLeft === 0) {
      stopTimer();
      playLoseSound();
      disableAllButtons();
      showLoseScreen();
    }
  } else {
    displayWord();
    if (checkWin()) {
      showWinScreen();
      playWinSound();
    }
  }
}

// === УПРАВЛЕНИЕ ИГРОЙ ===
function startGame(categoryKey) {
  currentCategory = categoryKey;
  secretWord = getRandomWordFromCategory(categoryKey);
  guessedLetters = [];
  attemptsLeft = 6;

  displayWord();
  updateAttempts();
  updateHangman();
  generateLetterButtons();
  hideEndScreens();

  document.getElementById("start-screen").classList.add("hidden");
  document.getElementById("game-screen").classList.remove("hidden");

  startTimer();
}

function generateCategoryButtons() {
  const container = document.getElementById("category-buttons");
  container.innerHTML = "";
  for (const key in categories) {
    const btn = document.createElement("button");
    btn.className = "category-btn";
    btn.textContent = categories[key].name;
    btn.onclick = () => startGame(key);
    container.appendChild(btn);
  }
}

// === КНОПКИ ===
document.getElementById("back-to-categories").onclick = () => {
  stopTimer();
  document.getElementById("game-screen").classList.add("hidden");
  document.getElementById("start-screen").classList.remove("hidden");
};

document.querySelectorAll(".end-restart-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    startGame(currentCategory);
  });
});

// === ИНИЦИАЛИЗАЦИЯ ===
function init() {
  updateStatsDisplay();
  generateCategoryButtons();
}

init();