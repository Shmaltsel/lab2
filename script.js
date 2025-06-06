const VARIANT_NUMBER = 32;

document.addEventListener('DOMContentLoaded', () => {
  storeUserInfo();
  displayStoredUserInfo();
  fetchComments();
  scheduleFeedbackModal();
  setupThemeToggle();
  applyAutoTheme();
  setupInfoToggle();
  setupScrollTopButton();
  setupMobileMenu();
  setupScrollColorShift();
});

function setupScrollColorShift() {
  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY || window.pageYOffset;
    const docHeight = document.body.scrollHeight - window.innerHeight;
    if (docHeight <= 0) return;

    let fraction = scrollTop / docHeight;
    fraction = Math.min(Math.max(fraction, 0), 1);

    if (document.body.classList.contains('dark-mode')) {
      const hue = 220;
      const sat = 30 + (0 - 30) * fraction;
      const light = 15 + (10 - 15) * fraction;
      document.body.style.background = `hsl(${hue}, ${sat.toFixed(1)}%, ${light.toFixed(1)}%)`;
    } else {
      const startHue = 211, endHue = 262;
      const hue = startHue + (endHue - startHue) * fraction;
      document.body.style.background = `hsl(${hue.toFixed(1)}, 50%, 40%)`;
    }
  });
}

function storeUserInfo() {
  const info = {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language || navigator.userLanguage,
    screenSize: `${screen.width}×${screen.height}`,
    timestamp: new Date().toLocaleString()
  };
  localStorage.setItem('userInfo', JSON.stringify(info));
}

function displayStoredUserInfo() {
  const footerInfo = document.getElementById('local-storage-info');
  const stored = localStorage.getItem('userInfo');
  if (!stored) {
    footerInfo.innerHTML = '<p>Немає даних про користувача.</p>';
    return;
  }
  const { userAgent, platform, language, screenSize, timestamp } = JSON.parse(stored);
  footerInfo.innerHTML = `
    <ul>
      <li><strong>userAgent:</strong> ${userAgent}</li>
      <li><strong>platform:</strong> ${platform}</li>
      <li><strong>language:</strong> ${language}</li>
      <li><strong>screenSize:</strong> ${screenSize}</li>
      <li><strong>записано:</strong> ${timestamp}</li>
    </ul>
  `;
}

function fetchComments() {
  fetch(`https://jsonplaceholder.typicode.com/posts/${VARIANT_NUMBER}/comments`)
    .then(res => {
      if (!res.ok) throw new Error('Не вдалося завантажити коментарі');
      return res.json();
    })
    .then(comments => {
      const list = document.getElementById('comments-list');
      comments.forEach((c, i) => {
        const li = document.createElement('li');
        li.classList.add('comment-item');
        li.style.animationDelay = `${1.2 + i * 0.2}s`;
        li.innerHTML = `
          <p><strong>${escapeHTML(c.name)}</strong> (${escapeHTML(c.email)})</p>
          <p>${escapeHTML(c.body)}</p>
        `;
        list.appendChild(li);
      });
    })
    .catch(() => {
      document.getElementById('comments-list').innerHTML = '<li>Не вдалося завантажити коментарі.</li>';
    });
}

function escapeHTML(str) {
  return str.replace(/[&<>"']/g, s => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'" :'&#39;' }[s]));
}

function scheduleFeedbackModal() {
  setTimeout(showFeedbackModal, 60000);
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
  localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
}

function loadThemePreference() {
  const pref = localStorage.getItem('theme');
  if (pref === 'dark') document.body.classList.add('dark-mode');
  if (pref === 'light') document.body.classList.remove('dark-mode');
}

function setupInfoToggle() {
  const btn = document.getElementById('toggle-info-btn');
  const infoDiv = document.getElementById('local-storage-info');
  const icon = document.getElementById('toggle-icon');
  const text = document.getElementById('toggle-text');
  let visible = false;
  text.textContent = 'Показати інфо';

  btn.addEventListener('click', () => {
    visible = !visible;
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
    document.querySelector('header').classList.remove('menu-open');
    document.getElementById('mobile-menu-btn').classList.remove('opened');
  });
}

function setupScrollTopButton() {
  const btn = document.getElementById('scroll-top-btn');
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  });
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function setupMobileMenu() {
  const header = document.querySelector('header');
  const mobileBtn = document.getElementById('mobile-menu-btn');
  const themeBtn = document.getElementById('theme-toggle');

  mobileBtn.addEventListener('click', () => {
    header.classList.toggle('menu-open');
    mobileBtn.classList.toggle('opened');
    document.getElementById('local-storage-info').classList.remove('visible');
    document.getElementById('toggle-info-btn').classList.remove('info-open');
  });

  themeBtn.addEventListener('click', () => {
    header.classList.remove('menu-open');
    mobileBtn.classList.remove('opened');
  });

  document.querySelectorAll('header nav a').forEach(link => {
    link.addEventListener('click', () => {
      header.classList.remove('menu-open');
      mobileBtn.classList.remove('opened');
    });
  });
}
