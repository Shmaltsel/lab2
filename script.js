const VARIANT_NUMBER = 32;

document.addEventListener('DOMContentLoaded', () => {
  storeUserInfo();          // 1. Зберігаання ОС/браузер у localStorage
  displayStoredUserInfo();  // 2. Відображаення данмх у футері
  fetchComments();          // 3. Завантаження та відображаємо коментарі
  scheduleFeedbackModal();  // 4. Показ модалки через 60 секунд
  setupThemeToggle();       // 5. Перемикач теми (день/ніч)
  applyAutoTheme();         // 6. Автоматичне перемикання теми за часом
  setupInfoToggle();        // 7. Кнопка «Приховати/Показати інфо»
  setupScrollTopButton();   // 8. Кнопка «Scroll to Top»
  setupScrollColorShift();  // 9. Зміна фону при скролі
});

function storeUserInfo() {
  const userAgent = navigator.userAgent;
  const platform = navigator.platform;
  const language = navigator.language || navigator.userLanguage;
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
        // Задаємо відкладення анімації для кожного коментаря
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

function setupInfoToggle() {
  const btn = document.getElementById('toggle-info-btn');
  const infoDiv = document.getElementById('local-storage-info');
  const icon = document.getElementById('toggle-icon');
  const text = document.getElementById('toggle-text');

  let visible = false; 

  btn.addEventListener('click', () => {
    visible = !visible;

    btn.classList.add('rotate');
    setTimeout(() => btn.classList.remove('rotate'), 600);

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
} 


function setupScrollTopButton() {
  const btn = document.getElementById('scroll-top-btn');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      btn.classList.add('visible'); // показати плавно
    } else {
      btn.classList.remove('visible'); // сховати плавно
    }
  });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}


function setupScrollColorShift() {
  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY || window.pageYOffset;
    const docHeight = document.body.scrollHeight - window.innerHeight;
    if (docHeight <= 0) return;
    let scrollFraction = scrollTop / docHeight;
    if (scrollFraction > 1) scrollFraction = 1;
    if (scrollFraction < 0) scrollFraction = 0;

    const startHue = 211;
    const endHue   = 262;
    const saturation = 50;
    const lightness  = 40;

    const currentHue = startHue + (endHue - startHue) * scrollFraction;
    document.body.style.backgroundColor = `hsl(${currentHue.toFixed(1)}, ${saturation}%, ${lightness}%)`;
  });
}
