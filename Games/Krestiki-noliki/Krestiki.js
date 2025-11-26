// Данные игры
let board = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X"; // игрок — X, ИИ — O
let gameActive = true;

// Элементы DOM
const cells = document.querySelectorAll(".cell");
const statusEl = document.getElementById("status");
const resetBtn = document.getElementById("reset-btn");
const scoreXEl = document.getElementById("score-x");
const scoreOEl = document.getElementById("score-o");

// Загрузка счёта
let winsX = parseInt(localStorage.getItem("tictactoe_wins_x") || "0");
let winsO = parseInt(localStorage.getItem("tictactoe_wins_o") || "0");
updateScore();

// Условия победы
const winConditions = [
  [0,1,2], [3,4,5], [6,7,8], // строки
  [0,3,6], [1,4,7], [2,5,8], // столбцы
  [0,4,8], [2,4,6]           // диагонали
];

// Обработка клика по клетке
function handleCellClick(e) {
  const cell = e.target;
  const index = parseInt(cell.dataset.index);

  if (board[index] !== "" || !gameActive) return;

  // Ход игрока
  board[index] = "X";
  cell.textContent = "❌";
  cell.style.color = "#e74c3c";

  if (checkWin("X")) {
    endGame("X");
    return;
  }
  if (isBoardFull()) {
    endGame(null);
    return;
  }

  // Ход ИИ
  setTimeout(makeAIMove, 400);
}

// Ход ИИ
function makeAIMove() {
  if (!gameActive) return;

  // 1. Попробуем выиграть
  let move = findWinningMove("O");
  if (move === -1) {
    // 2. Блокируем игрока
    move = findWinningMove("X");
  }
  if (move === -1) {
    // 3. Берём центр, если свободен
    if (board[4] === "") move = 4;
    else {
      // 4. Берём случайную свободную клетку
      const emptyCells = board.map((val, i) => val === "" ? i : -1).filter(i => i !== -1);
      move = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    }
  }

  board[move] = "O";
  cells[move].textContent = "⭕";
  cells[move].style.color = "#3498db";

  if (checkWin("O")) {
    endGame("O");
  } else if (isBoardFull()) {
    endGame(null);
  }
}

// Проверка, может ли игрок выиграть следующим ходом
function findWinningMove(player) {
  for (let i = 0; i < 9; i++) {
    if (board[i] === "") {
      board[i] = player;
      if (checkWin(player)) {
        board[i] = "";
        return i;
      }
      board[i] = "";
    }
  }
  return -1;
}

// Проверка победы
function checkWin(player) {
  return winConditions.some(condition => {
    return condition.every(index => board[index] === player);
  });
}

// Проверка ничьей
function isBoardFull() {
  return board.every(cell => cell !== "");
}

// Завершение игры
function endGame(winner) {
  gameActive = false;
  if (winner === "X") {
    statusEl.textContent = "🎉 Ты победил!";
    winsX++;
    localStorage.setItem("tictactoe_wins_x", winsX);
  } else if (winner === "O") {
    statusEl.textContent = "💀 Ты лох!";
    winsO++;
    localStorage.setItem("tictactoe_wins_o", winsO);
  } else {
    statusEl.textContent = "🤝 Ничья!";
  }
  updateScore();
  highlightWinningCells(winner);
}

// Подсветка победной линии
function highlightWinningCells(winner) {
  if (!winner) return;
  const condition = winConditions.find(cond => cond.every(i => board[i] === winner));
  if (condition) {
    condition.forEach(index => {
      cells[index].classList.add("win");
    });
  }
}

// Сброс игры
function resetGame() {
  board = ["", "", "", "", "", "", "", "", ""];
  currentPlayer = "X";
  gameActive = true;
  statusEl.textContent = "Твой ход (❌)";
  cells.forEach(cell => {
    cell.textContent = "";
    cell.classList.remove("win");
  });
}

// Обновление счёта
function updateScore() {
  scoreXEl.textContent = `❌: ${winsX}`;
  scoreOEl.textContent = `⭕: ${winsO}`;
}

// События
cells.forEach(cell => cell.addEventListener("click", handleCellClick));
resetBtn.addEventListener("click", resetGame);