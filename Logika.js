document.addEventListener('DOMContentLoaded', function () {
  // Элементы
  const usernameInput = document.getElementById('username');
  const loginBtn = document.getElementById('login-btn');
  const dontClickBtn = document.getElementById('dont-click');
  const breakSiteBtn = document.getElementById('break-site');
  const canClickBtn = document.getElementById('can-click');
  const hangmanBtn = document.getElementById('hangman-btn');
  const krestiki-nolikiBtn = document.getElementById('krestiki-nolikiBtn');
  const notForYouMsg = document.querySelector('.not-for-you');
  const brokenScreen = document.getElementById('broken-screen');
  const repairPasswordInput = document.getElementById('repair-password');
  const loginErrorEl = document.getElementById('login-error');

  // Состояния
  let isLoggedIn = false;
  let isBroken = false;
  const REPAIR_WORD = 'тимур старик';

  // Показ ошибки под кнопкой
  function showError(message) {
    if (!loginErrorEl) return;
    loginErrorEl.textContent = message;
    loginErrorEl.classList.remove('hidden');
    loginErrorEl.classList.add('show');
    setTimeout(() => {
      loginErrorEl.classList.remove('show');
      loginErrorEl.classList.add('hidden');
    }, 2500);
  }

  // Проверка имени
  function checkName(name) {
    const n = name.trim().toLowerCase();
    if (n === 'тимур') {
      return { valid: false, isTimur: true };
    }
    return { valid: n === 'вика' || n === 'вики', isTimur: false };
  }

  // Сломать сайт
  function breakSite() {
    if (!usernameInput) return;
    const name = usernameInput.value;
    const { isTimur } = checkName(name);
    if (isTimur) {
      showError('Тимур, я же сказала — для тебя не работает!');
      if (usernameInput) triggerShakeAnimation(usernameInput);
      return;
    }

    isBroken = true;
    if (brokenScreen) brokenScreen.classList.remove('hidden');
    if (notForYouMsg) {
      notForYouMsg.textContent = 'САЙТ СЛОМАН! 💥';
      notForYouMsg.style.color = '#ff5555';
      notForYouMsg.style.animation = 'glitch 1s infinite';
    }
  }

  // Починить сайт
  function repairSite() {
    if (!repairPasswordInput) return;
    const password = repairPasswordInput.value.trim().toLowerCase();
    if (password === REPAIR_WORD) {
      isBroken = false;
      if (brokenScreen) brokenScreen.classList.add('hidden');
      if (notForYouMsg) {
        notForYouMsg.textContent = 'А для Тимура — сайт не работает!';
        notForYouMsg.style.color = '#ff5555';
        notForYouMsg.style.animation = 'glitch 1s infinite';
      }
      repairPasswordInput.value = '';
      showError('Сайт починен! 💖');
    } else {
      showError('Неправильный пароль 😝');
      repairPasswordInput.value = '';
      if (document.activeElement !== repairPasswordInput) {
        repairPasswordInput.focus();
      }
    }
  }

  // Обновление кнопок
  function updateButtons() {
    const buttons = [dontClickBtn, canClickBtn].filter(btn => btn);
    if (isLoggedIn && !isBroken) {
      buttons.forEach(btn => btn.classList.remove('disabled'));
    } else {
      buttons.forEach(btn => btn.classList.add('disabled'));
    }
  }

  // Анимация тряски
  function triggerShakeAnimation(element) {
    if (!element) return;
    element.classList.remove('shake');
    void element.offsetWidth;
    element.classList.add('shake');
    setTimeout(() => element.classList.remove('shake'), 600);
  }

  // Радуга для Вики
  function triggerRainbowEffect() {
    if (isBroken) return;
    document.body.classList.add('rainbow-mode');
    setTimeout(() => document.body.classList.remove('rainbow-mode'), 2000);
  }

  // === ОБРАБОТЧИКИ ===

  // Войти
  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      if (!usernameInput) return;
      const rawValue = usernameInput.value;
      const name = rawValue.trim();

      if (name === '') {
        triggerShakeAnimation(usernameInput);
        showError('Введи имя!');
        return;
      }

      const { valid, isTimur } = checkName(name);

      if (isTimur) {
        triggerShakeAnimation(usernameInput);
        showError('Для Тимура сайт не работает!');
        return;
      }

      if (valid) {
        isLoggedIn = true;
        triggerRainbowEffect();
        showError('Добро пожаловать, Вика! 🌸');
      } else if (!isBroken) {
        isLoggedIn = false;
        triggerShakeAnimation(usernameInput);
        showError('Сказала же — работает только для Вики!');
      }

      updateButtons();
    });
  }

  // Enter в поле имени
  if (usernameInput) {
    usernameInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !isBroken && loginBtn) {
        loginBtn.click();
      }
    });
  }

  // Enter в поле пароля
  if (repairPasswordInput) {
    repairPasswordInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        repairSite();
      }
    });
  }

  // Кнопки
  if (breakSiteBtn) {
    breakSiteBtn.addEventListener('click', breakSite);
  }

  if (dontClickBtn) {
    dontClickBtn.addEventListener('click', () => {
      if (isLoggedIn && !isBroken) {
        showError('Че непонятного?');
      } else {
        showError('ТОЛЬКО для Вики!');
      }
    });
  }

  if (canClickBtn) {
    canClickBtn.addEventListener('click', () => {
      if (isLoggedIn && !isBroken) {
        const emojis = ['😊', '😎', '🥳', '🚀', '🎉', '🔥', '💯', '✨'];
        showError(`Держи смайлик: ${emojis[Math.floor(Math.random() * emojis.length)]}`);
      } else {
        showError('ТОЛЬКО для Вики!');
      }
    });
  }

  // Кнопка "Виселица"
  if (hangmanBtn) {
    hangmanBtn.addEventListener('click', () => {
      window.location.href = 'Igruxa.html';
    });
  }
  //кнопка крестики нолики
  if (krestiki-nolikiBtn) {
    krestiki-nolikiBtn.addEventListener ('click', () =>{
      window.location.href ='Krestiki.html';
    });
  }

  // Инициализация
  updateButtons();
});