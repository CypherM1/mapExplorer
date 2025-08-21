// ------- Helpers -------
const $ = (sel) => document.querySelector(sel);
const mapFrame = $('#mapFrame');
const locationInput = $('#locationInput');
const searchForm = $('#searchForm');
const historyList = $('#historyList');
const clearHistoryBtn = $('#clearHistoryBtn');
const modeToggle = $('#modeToggle');

const STORAGE_KEYS = {
  HISTORY: 'map_history_v3',
  THEME: 'map_theme_v3',
};

const MAX_HISTORY = 20;
const DEFAULT_QUERY = 'USA';
let currentQuery = DEFAULT_QUERY; // Track current map location

function encodeQ(q) {
  return encodeURIComponent(q.trim());
}

function buildMapSrc(query) {
  const q = query && query.trim() ? query.trim() : DEFAULT_QUERY;
  return `https://www.google.com/maps?output=embed&q=${encodeQ(q)}`;
}

// ------- Map -------
function setMapLocation(query, { pushToHistory = true } = {}) {
  const src = buildMapSrc(query);
  mapFrame.src = src;
  currentQuery = query;

  if (pushToHistory) {
    addToHistory(query);
  } else {
    renderHistory(); // refresh highlight
  }
}

// ------- History -------
function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(list) {
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(list.slice(0, MAX_HISTORY)));
}

function renderHistory() {
  const items = loadHistory();
  historyList.innerHTML = '';
  items.forEach((text, idx) => {
    const li = document.createElement('li');
    li.className = 'history-item';
    if (text.toLowerCase() === (currentQuery || '').toLowerCase()) {
      li.classList.add('current'); // highlight
    }
    li.title = text;

    const label = document.createElement('span');
    label.className = 'label';
    label.textContent = text;

    const del = document.createElement('button');
    del.className = 'delete-item';
    del.type = 'button';
    del.setAttribute('aria-label', `Delete ${text}`);
    del.textContent = '×';

    li.appendChild(label);
    li.appendChild(del);

    // Click to go back
    label.addEventListener('click', () => setMapLocation(text, { pushToHistory: false }));

    // Delete single item
    del.addEventListener('click', (e) => {
      e.stopPropagation();
      const arr = loadHistory().filter((_, i) => i !== idx);
      saveHistory(arr);
      renderHistory();
    });

    historyList.appendChild(li);
  });

  // Scroll current into view on mobile
  const currentEl = historyList.querySelector('.history-item.current');
  if (currentEl) currentEl.scrollIntoView({ behavior: 'smooth', inline: 'center' });
}

function addToHistory(query) {
  const q = (query || '').trim();
  if (!q) return;
  let items = loadHistory();
  items = [q, ...items.filter((i) => i.toLowerCase() !== q.toLowerCase())];
  if (items.length > MAX_HISTORY) items = items.slice(0, MAX_HISTORY);
  saveHistory(items);
  renderHistory();
}

function clearHistory() {
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify([]));
  renderHistory();
}

// ------- Theme -------
function applyTheme(theme) {
  const isDark = theme === 'dark';
  document.body.classList.toggle('dark-mode', isDark);
  modeToggle.textContent = isDark ? '🌞' : '🌗';
}

function loadTheme() {
  const saved = localStorage.getItem(STORAGE_KEYS.THEME);
  return saved || 'light';
}

function setTheme(theme) {
  localStorage.setItem(STORAGE_KEYS.THEME, theme);
  applyTheme(theme);
}

// ------- Events -------
searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  setMapLocation(locationInput.value, { pushToHistory: true });
  locationInput.blur();
});

clearHistoryBtn.addEventListener('click', () => clearHistory());

modeToggle.addEventListener('click', () => {
  const current = loadTheme();
  setTheme(current === 'dark' ? 'light' : 'dark');
});

// ------- Init -------
(function init() {
  applyTheme(loadTheme());
  setMapLocation(DEFAULT_QUERY, { pushToHistory: false });
  renderHistory();
  locationInput.value = '';
})();
