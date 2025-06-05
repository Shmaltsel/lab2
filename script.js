// ========== script.js ==========

// Встановіть свій номер варіанту:
const VARIANT_NUMBER = 1; // Замініть 1 на свій номер варіанту

document.addEventListener('DOMContentLoaded', () => {
  storeUserInfo();          // 1.a: Зберігаємо ОС/браузер у localStorage
  displayStoredUserInfo();  // 1.b: Відображаємо у футері
  fetchComments();          // 2.a: Завантажуємо й відображаємо коментарі
  scheduleFeedbackModal();  // 3.a: Показ модалки через 1 хвилину
  setupThemeToggle();       // 4.a: Налаштування перемикача теми
  applyAutoTheme();         // 4.b: Автоматичне перемикання (07:00—21:00 → день, інакше ніч)
  setupInfoToggle();        // 5: Перемикач видимості блоку з інформацією
});

// ========== 1. Зберігання даних у браузері ==========

function storeUserInfo() {
  const userAgent = navigator.userAgent;
  const platform = navigator.platform;
  const language = navigator.language || navigator.userLanguage;
  const screenSize = `${screen.width}×${screen.height}`;
  const timestamp = new Date().toLocaleString();

  const userInfo = {
    userAgent,
    platform,
    language,
    screenSize,
    timestamp
  };

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

  // Формуємо HTML-рядок для виводу
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

// ========== 2. Відображення динамічного вмісту із сервера ==========

function fetchComments() {
  const url = `https://jsonplaceholder.typicode.com/posts/${VARIANT_NUMBER}/comments`;
  fetch(url)
    .then(response => {
      if (!response.ok) throw new Error('Помилка мережі при завантаженні коментарів');
      return response.json();
    })
    .then(comments => {
      const list = document.getElementById('comments-list');
      comments.forEach(comment => {
        const li = document.createElement('li');
        li.classList.add('comment-item');
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

// Простий ескап для HTML (щоб уникнути XSS у цьому прикладі)
function escapeHTML(str) {
  return str.replace(/[&<>"']/g, tag => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[tag]));
}

// ========== 3. Відправлення форми зворотного зв’язку ==========

function scheduleFeedbackModal() {
  // Через 60 секунд показуємо модалку
  setTimeout(showFeedbackModal, 60000);
}

function showFeedbackModal() {
  const overlay = document.getElementById('feedback-modal');
  overlay.classList.add('visible');
  // Додаємо слухач для закриття
  document.getElementById('modal-close-btn').addEventListener('click', hideFeedbackModal);
  // За кліком поза вікном теж ховаємо
  overlay.addEventListener('click', e => {
    if (e.target === overlay) hideFeedbackModal();
  });
}

function hideFeedbackModal() {
  document.getElementById('feedback-modal').classList.remove('visible');
}

// ========== 4. Перемикач теми (день/ніч) ==========

function setupThemeToggle() {
  const btn = document.getElementById('theme-toggle');
  btn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    saveThemePreference();
  });
  loadThemePreference();
}

function applyAutoTheme() {
  const now = new Date();
  const hours = now.getHours();
  // Денна тема: 07:00—21:00
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
  // Якщо null, то лишаємо те, що задала applyAutoTheme()
}

// ========== 5. Перемикач видимості блоку з інформацією у футері ==========

function setupInfoToggle() {
  const btn = document.getElementById('toggle-info-btn');
  const infoDiv = document.getElementById('local-storage-info');
  const icon = document.getElementById('toggle-icon');
  const text = document.getElementById('toggle-text');
  let visible = true;

  btn.addEventListener('click', () => {
    visible = !visible;
    if (visible) {
      infoDiv.classList.add('visible');
      icon.textContent = '▲';
      text.textContent = 'Приховати інфо';
    } else {
      infoDiv.classList.remove('visible');
      icon.textContent = '▼';
      text.textContent = 'Показати інфо';
    }
  });

  // На початку – показуємо інформацію
  infoDiv.classList.add('visible');
}
