import { createThrottle, validateSubscription } from './validate.js';
import { formatTime, localTime, openStatus } from './hours.js';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

document.documentElement.classList.add('js');

// ───────── Menú móvil ─────────
const toggle = $('.nav-toggle');
const links = $('#nav-links');
const backdrop = $('.nav-backdrop');

const isMenuOpen = () => toggle.getAttribute('aria-expanded') === 'true';
const setMenu = (open) => {
  links.classList.toggle('open', open);
  backdrop.hidden = !open;
  toggle.setAttribute('aria-expanded', String(open));
};

toggle.addEventListener('click', () => setMenu(!isMenuOpen()));
links.addEventListener('click', (e) => e.target.closest('a') && setMenu(false));
backdrop.addEventListener('click', () => setMenu(false));
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && isMenuOpen()) {
    setMenu(false);
    toggle.focus();
  }
});
matchMedia('(min-width: 769px)').addEventListener('change', (e) => e.matches && setMenu(false));

// ───────── DOM seguro: siempre textContent, nunca innerHTML con datos ─────────
const el = (tag, cls, text) => {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined) node.textContent = text;
  return node;
};

// Panamá usa el dólar; '$12.90' es más corto y claro que 'USD 12.90'.
const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const TAGS = { picante: 'Picante', veggie: 'Veggie' };
const initials = (name) => name.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();

const renderers = {
  reasons: (r, i) => {
    const card = el('article', 'card reason');
    card.append(el('span', 'reason-num', String(i + 1).padStart(2, '0')), el('h3', '', r.title), el('p', '', r.text));
    return card;
  },
  menu: (item) => {
    const card = el('article', `card menu-item${item.favorite ? ' is-favorite' : ''}`);
    card.dataset.category = item.category;
    if (item.favorite) card.append(el('span', 'badge', 'La favorita'));
    const head = el('div', 'menu-head');
    head.append(el('h3', '', item.name), el('p', 'price', money.format(item.price)));
    card.append(head, el('p', 'menu-text', item.text));
    if (item.tags.length) {
      const tags = el('ul', 'tags');
      tags.setAttribute('aria-label', 'Etiquetas');
      for (const t of item.tags) tags.append(el('li', `tag tag-${t}`, TAGS[t] ?? t));
      card.append(tags);
    }
    return card;
  },
  reviews: (r) => {
    const card = el('blockquote', 'card review');
    const stars = el('p', 'stars', '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating));
    stars.setAttribute('aria-label', `${r.rating} de 5 estrellas`);
    stars.setAttribute('role', 'img');
    const footer = el('footer', 'review-author');
    const who = el('div');
    who.append(el('cite', '', r.author), el('span', 'role', r.role));
    footer.append(el('span', 'avatar', initials(r.author)), who);
    card.append(stars, el('p', 'review-text', `“${r.text}”`), footer);
    return card;
  },
};

// ───────── Skeleton loaders ─────────
const skeletonCard = () => {
  const card = el('div', 'card skeleton');
  card.setAttribute('aria-hidden', 'true');
  card.append(el('span', 'skel skel-title'), el('span', 'skel skel-line'), el('span', 'skel skel-line short'));
  return card;
};

const containers = $$('[data-list]');
for (const box of containers) {
  box.setAttribute('aria-label', 'Cargando');
  for (let i = 0; i < 3; i++) box.append(skeletonCard());
}

const settle = (box) => {
  box.setAttribute('aria-busy', 'false');
  box.removeAttribute('aria-label');
};

const showError = (box) => {
  box.replaceChildren(el('p', 'error-box', 'No se pudo cargar. Recarga la página.'));
  settle(box);
};

// ───────── Horario ─────────
const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];
const timeText = (hhmm) => (hhmm === '24:00' ? 'medianoche' : `las ${formatTime(hhmm)}`);

function statusText(status, today) {
  if (status.open) return `Abierto ahora · cierra a ${timeText(status.closesAt)}`;
  if (status.opensAt === null) return 'Cerrado';
  const when = status.inDays === 0 ? 'hoy' : status.inDays === 1 ? 'mañana' : `el ${DAY_NAMES[(today + status.inDays) % 7].toLowerCase()}`;
  return `Cerrado · abre ${when} a ${timeText(status.opensAt)}`;
}

function renderHours(hours, timezone) {
  const now = localTime(new Date(), timezone);
  const status = openStatus(hours, now);
  for (const node of $$('[data-status]')) {
    node.textContent = statusText(status, now.day);
    node.classList.toggle('is-open', status.open);
  }
  $('[data-hours]').replaceChildren(
    ...WEEK_ORDER.map((day) => {
      const h = hours.find((x) => x.day === day);
      const row = el('tr', day === now.day ? 'is-today' : '');
      const name = el('th', '', DAY_NAMES[day]);
      name.scope = 'row';
      if (day === now.day) name.append(el('span', 'today-tag', 'Hoy'));
      row.append(name, el('td', '', h?.open ? `${formatTime(h.open)} – ${formatTime(h.close)}` : 'Cerrado'));
      return row;
    }),
  );
}

// ───────── Filtro de la carta ─────────
const filterButtons = $$('[data-filter]');
const filterStatus = $('[data-filter-status]');

function applyFilter(category) {
  let shown = 0;
  for (const card of $$('[data-list="menu"] .menu-item')) {
    const match = category === 'all' || card.dataset.category === category;
    card.hidden = !match;
    if (match) {
      shown++;
      card.classList.remove('pop');
      void card.offsetWidth; // reinicia la animación
      card.classList.add('pop');
    }
  }
  for (const b of filterButtons) b.setAttribute('aria-pressed', String(b.dataset.filter === category));
  filterStatus.textContent = `Mostrando ${shown} ${shown === 1 ? 'producto' : 'productos'}`;
}

for (const button of filterButtons) button.addEventListener('click', () => applyFilter(button.dataset.filter));

// ───────── Carga de contenido ─────────
fetch('data/content.json', { credentials: 'omit' })
  .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
  .then((data) => {
    for (const box of containers) {
      const key = box.dataset.list;
      const items = Array.isArray(data[key]) ? data[key] : [];
      box.replaceChildren(...items.map(renderers[key]));
      settle(box);
    }
    $('[data-address]').textContent = data.location.address;
    renderHours(data.hours, data.location.timezone);
    setInterval(() => renderHours(data.hours, data.location.timezone), 60_000);
    // El contenido cargado desplaza las secciones: si se llegó con #ancla, se vuelve a ella.
    if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();
  })
  .catch(() => {
    containers.forEach(showError);
    for (const node of $$('[data-status]')) node.textContent = '';
  });

// ───────── Aparición al hacer scroll ─────────
const reveals = $$('.reveal');
if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    },
    { threshold: 0.12 },
  );
  reveals.forEach((section) => io.observe(section));
} else {
  reveals.forEach((section) => section.classList.add('is-visible'));
}

// ───────── Club Brutus: validación, rate limit de UX y envío ─────────
const form = $('#subscribe-form');
const input = form.elements.email;
const consent = form.elements.consent;
const msg = $('#form-msg');
const submit = $('button[type="submit"]', form);
const allow = createThrottle(3, 60_000);

const say = (text, kind = '') => {
  msg.textContent = text;
  msg.className = `form-msg ${kind}`;
};

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  say('');
  input.removeAttribute('aria-invalid');
  consent.removeAttribute('aria-invalid');

  const result = validateSubscription({ email: input.value, consent: consent.checked, honeypot: form.elements.website.value });
  if (!result.ok) {
    if (result.reason === 'bot') return;
    if (result.reason === 'email') {
      input.setAttribute('aria-invalid', 'true');
      say('Ese correo no parece válido.', 'error');
      input.focus();
    } else {
      consent.setAttribute('aria-invalid', 'true');
      say('Marca la casilla para unirte al club.', 'error');
      consent.focus();
    }
    return;
  }
  if (!allow()) return say('Demasiados intentos. Espera un minuto.', 'error');

  const { functionsUrl, anonKey } = window.APP_CONFIG || {};
  if (!functionsUrl || !anonKey) {
    say('Modo demo: todo correcto, pero no se guardó ningún dato. ¡Gracias!', 'ok');
    form.reset();
    return;
  }
  if (!functionsUrl.startsWith('https://')) return say('Configuración insegura.', 'error');

  submit.disabled = true;
  try {
    const r = await fetch(`${functionsUrl}/subscribe`, {
      method: 'POST',
      credentials: 'omit',
      headers: { 'Content-Type': 'application/json', apikey: anonKey, Authorization: `Bearer ${anonKey}` },
      body: JSON.stringify({ email: result.email, consent: true }),
    });
    if (r.status === 429) say('Límite alcanzado. Intenta más tarde.', 'error');
    else if (!r.ok) say('No se pudo enviar. Intenta de nuevo.', 'error');
    else {
      say('¡Bienvenido al Club Brutus! Te escribiremos con la próxima promo.', 'ok');
      form.reset();
    }
  } catch {
    say('Sin conexión. Revisa tu internet.', 'error');
  } finally {
    submit.disabled = false;
  }
});
