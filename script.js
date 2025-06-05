// ========== script.js ==========

// Встановіть свій номер варіанту:
const VARIANT_NUMBER = 32; // Замініть 1 на свій номер варіанту

document.addEventListener('DOMContentLoaded', () => {
  // 1. Зберігаємо дані про ОС/браузер у localStorage
  storeUserInfo();

  // 2. Відображаємо дані у футері
  displayStoredUserInfo();

  // 3. Завантажуємо та відображаємо коментарі
  fetchComments();

  // 4. Показ модалки через 60 секунд
  scheduleFeedbackModal();

  // 5. Перемикач теми (день/ніч)
  setupThemeToggle();

  // 6. Автоматичне перемикання теми за часом
  applyAutoTheme();

  // 7. Кнопка «Показати/Сховати інфо»
  setupInfoToggle();

  // 8. Кнопка «Scroll to Top»
  setupScrollTopButton();

  // 9. Гамбургер-меню (мобільний режим)
  setupMobileMenu();
});

// ========== 1. Зберігання даних у браузері ==========
function storeUserInfo() {
  const userAgent = navigator.userAgent;
  const platform  = navigator.platform;
  const language  = navigator.language || navigator.userLanguage;
  const screenSize = `${screen.width}×${screen.height}`;
  const timestamp = new Date().toLocaleString();

  const userInfo = { userAgent, platform, language, screenSize, timestamp };
  localStorage.setItem('userInfo', JSON.stringify(userInfo));
}

function displayStoredUserInfo() {
  const footerInfo = document.getElementById('local-storage-info');
  const stored = localStorage.getItem('userInfo');
  if (!stored) {
    footerInfo.innerHTML = '<p>Немає даних про користувача.</p>';
    return;
  }
  const info = JSON.parse(stored);
  footerInfo.innerHTML = `
    <ul>
      <li><strong>userAgent:</strong> ${info.userAgent}</li>
      <li><strong>platform:</strong> ${info.platform}</li>
      <li><strong>language:</strong> ${info.language}</li>
      <li><strong>screenSize:</strong> ${info.screenSize}</li>
      <li><strong>записано:</strong> ${info.timestamp}</li>
    </ul>
  `;
}

// ========== 2. Завантаження та відображення коментарів ==========
function fetchComments() {
  const url = `https://jsonplaceholder.typicode.com/posts/${VARIANT_NUMBER}/comments`;
  fetch(url)
    .then(response => {
      if (!response.ok) throw new Error('Помилка мережі при завантаженні коментарів');
      return response.json();
    })
    .then(comments => {
      const list = document.getElementById('comments-list');
      comments.forEach((comment, idx) => {
        const li = document.createElement('li');
        li.classList.add('comment-item');
        // Відкладення анімації для кожного коментаря
        li.style.animationDelay = `${1.2 + idx * 0.2}s`;
        li.innerHTML = `
          <p><strong>${escapeHTML(comment.name)}</strong> (${escapeHTML(comment.email)})</p>
          <p>${escapeHTML(comment.body)}</p>
        `;
        list.appendChild(li);
      });
    })
    .catch(err => {
      console.error(err);
      const list = document.getElementById('comments-list');
      list.innerHTML = '<li>Не вдалося завантажити коментарі.</li>';
    });
}
function escapeHTML(str) {
  return str.replace(/[&<>"']/g, tag => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[tag]));
}

// ========== 3. Модальне вікно з формою ==========
function scheduleFeedbackModal() {
  setTimeout(showFeedbackModal, 60000); // 60 секунд
}
function showFeedbackModal() {
  const overlay = document.getElementById('feedback-modal');
  overlay.classList.add('visible');
  document.getElementById('modal-close-btn').addEventListener('click', hideFeedbackModal);
  overlay.addEventListener('click', e => {
    if (e.target === overlay) hideFeedbackModal();
  });
}
function hideFeedbackModal() {
  document.getElementById('feedback-modal').classList.remove('visible');
}

// ========== 4. Перемикач теми ==========
function setupThemeToggle() {
  const btn = document.getElementById('theme-toggle');
  btn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    saveThemePreference();
  });
  loadThemePreference();
}
function applyAutoTheme() {
  const hours = new Date().getHours();
  if (hours < 7 || hours >= 21) {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }
  saveThemePreference();
}
function saveThemePreference() {
  const isDark = document.body.classList.contains('dark-mode');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}
function loadThemePreference() {
  const pref = localStorage.getItem('theme');
  if (pref === 'dark') {
    document.body.classList.add('dark-mode');
  } else if (pref === 'light') {
    document.body.classList.remove('dark-mode');
  }
}

// ========== 5. Кнопка «Показати/Сховати інфо» ==========
function setupInfoToggle() {
  const btn     = document.getElementById('toggle-info-btn');
  const infoDiv = document.getElementById('local-storage-info');
  const icon    = document.getElementById('toggle-icon');
  const text    = document.getElementById('toggle-text');

  let visible = false; // спочатку панель прихована => текст "Показати інфо"
  text.textContent = 'Показати інфо';

  btn.addEventListener('click', () => {
    visible = !visible;

    // перевертаємо трикутник
    btn.classList.toggle('info-open');

    if (visible) {
      infoDiv.classList.add('visible');
      icon.textContent = '▲';
      text.textContent = 'Сховати інфо';
    } else {
      infoDiv.classList.remove('visible');
      icon.textContent = '▼';
      text.textContent = 'Показати інфо';
    }

    // якщо відкрито інфо, автоматично сховаємо мобільне меню (якщо воно було)
    document.querySelector('header').classList.remove('menu-open');
    document.getElementById('mobile-menu-btn').classList.remove('opened');
  });
}


// ========== 6. Кнопка «Scroll to Top» ==========
function setupScrollTopButton() {
  const btn = document.getElementById('scroll-top-btn');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ========== 7. Гамбургер-меню (мобільний режим) ==========
function setupMobileMenu() {
  const header        = document.querySelector('header');
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const themeToggleBtn = document.getElementById('theme-toggle');

  // При кліку на гамбургер — додаємо/забираємо клас menu-open
  mobileMenuBtn.addEventListener('click', () => {
    const isOpen = header.classList.toggle('menu-open');
    mobileMenuBtn.classList.toggle('opened');
    // Сховаємо інфо за потреби:
    document.getElementById('local-storage-info').classList.remove('visible');
    document.getElementById('toggle-info-btn').classList.remove('info-open');
  });

  // Якщо користувач перемикає тему — згортаємо меню
  themeToggleBtn.addEventListener('click', () => {
    header.classList.remove('menu-open');
    mobileMenuBtn.classList.remove('opened');
  });

  // Якщо клік по пункту меню — ховаємо навігацію
  const navLinks = header.querySelectorAll('nav a');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      header.classList.remove('menu-open');
      mobileMenuBtn.classList.remove('opened');
    });
  });
}
