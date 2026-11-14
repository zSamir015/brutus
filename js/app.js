import { createThrottle, validateSubscription } from './validate.js';
import { formatTime, localTime, openStatus } from './hours.js';
import { initGrillCinema, renderArt, renderIcon, renderReasonArt } from './art.js';
import {
  PROMO_CODE,
  addItem,
  cartSummary,
  generateOrderCode,
  removeItem,
  slugifyId,
  updateItemQty,
} from './cart.js';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

document.documentElement.classList.add('js');

// ───────── Safe DOM: always textContent, never innerHTML with data ─────────
const el = (tag, cls, text) => {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined) node.textContent = text;
  return node;
};

// ───────── Scroll Progress Bar ─────────
const scrollProgress = $('#scroll-progress');
if (scrollProgress) {
  window.addEventListener(
    'scroll',
    () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      scrollProgress.value = max > 0 ? Math.min(100, Math.round((window.scrollY / max) * 100)) : 0;
    },
    { passive: true },
  );
}

// ───────── Toast notifications ─────────
const toastEl = $('#toast');
let toastTimer = null;

function showToast(message) {
  if (!toastEl) return;
  toastEl.textContent = message;
  toastEl.hidden = false;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastEl.hidden = true;
  }, 3000);
}

// ───────── Hero Burger X-Ray Layer Inspector ─────────
const heroArt = $('#hero-art');
const xrayBtn = $('#xray-toggle-btn');
const xrayLabel = $('[data-xray-label]');

xrayBtn?.addEventListener('click', () => {
  const exploded = heroArt.classList.toggle('is-exploded');
  xrayBtn.setAttribute('aria-pressed', String(exploded));
  if (xrayLabel) xrayLabel.textContent = exploded ? 'Armar burger' : 'Inspeccionar capas';
});

// ───────── Animated Telemetry Counters ─────────
const counters = $$('[data-counter]');
if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const counterObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const node = entry.target;
        const target = Number(node.dataset.counter) || 0;
        const start = performance.now();
        const duration = 950;
        const step = (now) => {
          const p = Math.min(1, (now - start) / duration);
          const eased = 1 - (1 - p) ** 3;
          node.textContent = String(Math.round(target * eased));
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        counterObserver.unobserve(node);
      }
    },
    { threshold: 0.5 },
  );
  counters.forEach((c) => counterObserver.observe(c));
}

// ───────── 60fps Grill Cinema Video Reel ("Brutus Cam") ─────────
const CHAPTER_TITLES = [
  'ACTO 01 · EL SMASH (230 °C)',
  'ACTO 02 · LLUVIA DE CHEDDAR',
  'ACTO 03 · EL SELLO BRUTUS',
];
const cinemaCanvas = $('#grill-cinema');
const cinemaPlayBtn = $('#cinema-play-btn');
const cinemaPlayIcon = $('#cinema-play-icon');
const cinemaScrub = $('#cinema-scrub');
const cinemaTime = $('#cinema-time');
const cinemaBadge = $('#cinema-chapter-badge');
const sizzleEq = $('#sizzle-eq');
const chapterBtns = $$('[data-chapter]');

const fmtSec = (s) => `00:${String(Math.floor(s)).padStart(2, '0')}`;

const cinemaController = initGrillCinema(cinemaCanvas, ({ elapsed, duration, chapter, playing }) => {
  if (cinemaScrub && document.activeElement !== cinemaScrub) {
    cinemaScrub.value = String(Math.round(elapsed * 10));
  }
  if (cinemaTime) cinemaTime.textContent = `${fmtSec(elapsed)} / ${fmtSec(duration)}`;
  if (cinemaBadge) cinemaBadge.textContent = CHAPTER_TITLES[chapter] || CHAPTER_TITLES[0];
  if (cinemaPlayIcon) cinemaPlayIcon.textContent = playing ? '❚❚' : '▶';
  if (sizzleEq) sizzleEq.classList.toggle('is-paused', !playing);
  for (const btn of chapterBtns) {
    btn.setAttribute('aria-pressed', String(Number(btn.dataset.chapter) === chapter));
  }
});

cinemaPlayBtn?.addEventListener('click', () => {
  cinemaController?.togglePlay();
});

cinemaScrub?.addEventListener('input', () => {
  cinemaController?.seek(Number(cinemaScrub.value) / 150);
});

for (const btn of chapterBtns) {
  btn.addEventListener('click', () => {
    cinemaController?.setChapter(Number(btn.dataset.chapter));
  });
}

// ───────── Mobile menu & Drawer state ─────────
const toggle = $('.nav-toggle');
const links = $('#nav-links');
const backdrop = $('.nav-backdrop');
const cartToggle = $('#cart-toggle');
const cartDrawer = $('#cart-drawer');
const cartBackdrop = $('#cart-backdrop');
const cartClose = $('#cart-close');
const mobileCartBar = $('#mobile-cart-bar');
const mobileCartOpen = $('#mobile-cart-open');

const isMenuOpen = () => toggle.getAttribute('aria-expanded') === 'true';
const isCartOpen = () => !cartDrawer.hidden;

const syncBodyLock = () => {
  document.body.classList.toggle('lock-scroll', isMenuOpen() || isCartOpen());
};

const setMenu = (open) => {
  links.classList.toggle('open', open);
  backdrop.hidden = !open;
  toggle.setAttribute('aria-expanded', String(open));
  syncBodyLock();
};

const setCartOpen = (open) => {
  if (open && isMenuOpen()) setMenu(false);
  cartDrawer.hidden = !open;
  cartBackdrop.hidden = !open;
  cartToggle.setAttribute('aria-expanded', String(open));
  syncBodyLock();
  if (open) cartClose.focus();
};

toggle.addEventListener('click', () => setMenu(!isMenuOpen()));
links.addEventListener('click', (e) => e.target.closest('a') && setMenu(false));
backdrop.addEventListener('click', () => setMenu(false));

cartToggle.addEventListener('click', () => setCartOpen(!isCartOpen()));
cartClose.addEventListener('click', () => {
  setCartOpen(false);
  cartToggle.focus();
});
cartBackdrop.addEventListener('click', () => setCartOpen(false));
mobileCartOpen?.addEventListener('click', () => setCartOpen(true));
$('#cart-empty-cta')?.addEventListener('click', () => setCartOpen(false));

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (isCartOpen()) {
      setCartOpen(false);
      cartToggle.focus();
    } else if (isMenuOpen()) {
      setMenu(false);
      toggle.focus();
    }
  }
});
matchMedia('(min-width: 769px)').addEventListener('change', (e) => e.matches && setMenu(false));

// ───────── Scroll-spy navigation ─────────
const navAnchors = $$('.nav-links a[href^="#"]');
const spySections = navAnchors
  .map((a) => document.getElementById(a.getAttribute('href').slice(1)))
  .filter(Boolean);

if ('IntersectionObserver' in window && spySections.length) {
  const spyObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const id = entry.target.id;
        for (const a of navAnchors) {
          const active = a.getAttribute('href') === `#${id}`;
          a.classList.toggle('is-active', active);
          if (active) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        }
      }
    },
    { rootMargin: '-35% 0px -55% 0px' },
  );
  spySections.forEach((sec) => spyObserver.observe(sec));
}

// ───────── Order Simulator ("Tu Charola") ─────────
// Panama uses the US dollar; '$12.90' is shorter and clearer than 'USD 12.90'.
const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const TAGS = { picante: 'Picante', veggie: 'Veggie' };
const TAG_ICONS = { picante: 'flame', veggie: 'leaf' };
const initials = (name) => name.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();

let cartItems = [];
let promoActive = false;
let confirmedOrderCode = null;

const cartEmptyEl = $('#cart-empty');
const cartItemsEl = $('#cart-items');
const cartReceiptEl = $('#cart-receipt');
const cartFooterEl = $('#cart-footer');
const promoToggleBtn = $('#promo-toggle-btn');
const promoStateLabel = $('#promo-state-label');
const discountRowEl = $('#cart-discount-row');

function syncMenuAddButtons() {
  for (const btn of $$('[data-add-id]')) {
    const id = btn.dataset.addId;
    const found = cartItems.find((x) => x.id === id);
    const labelNode = $('[data-add-label]', btn);
    if (found) {
      btn.classList.add('is-added');
      if (labelNode) labelNode.textContent = `En charola (${found.qty})`;
    } else {
      btn.classList.remove('is-added');
      if (labelNode) labelNode.textContent = 'Agregar';
    }
  }
}

function renderCart() {
  const summary = cartSummary(cartItems, promoActive);

  for (const badge of $$('[data-cart-count]')) {
    badge.textContent = String(summary.count);
    badge.classList.toggle('has-items', summary.count > 0);
  }

  if (mobileCartBar) {
    mobileCartBar.hidden = summary.count === 0;
    const mobileTotal = $('#mobile-cart-total');
    if (mobileTotal) mobileTotal.textContent = money.format(summary.total);
  }

  syncMenuAddButtons();

  if (confirmedOrderCode) {
    cartEmptyEl.hidden = true;
    cartItemsEl.hidden = true;
    cartFooterEl.hidden = true;
    cartReceiptEl.hidden = false;
    $('#receipt-code').textContent = confirmedOrderCode;
    return;
  }

  cartReceiptEl.hidden = true;

  if (cartItems.length === 0) {
    cartEmptyEl.hidden = false;
    cartItemsEl.hidden = true;
    cartFooterEl.hidden = true;
    cartItemsEl.replaceChildren();
    return;
  }

  cartEmptyEl.hidden = true;
  cartItemsEl.hidden = false;
  cartFooterEl.hidden = false;

  cartItemsEl.replaceChildren(
    ...cartItems.map((item) => {
      const li = el('li', 'cart-row');
      const artWrap = el('div', `cart-row-art dish-${item.category}`);
      const svg = renderArt(item.art);
      if (svg) artWrap.append(svg);

      const info = el('div', 'cart-row-info');
      info.append(
        el('p', 'cart-row-title', item.name),
        el('p', 'cart-row-price', `${money.format(item.price)} c/u`),
      );

      const controls = el('div', 'cart-row-controls');
      const minusBtn = el('button', 'qty-btn', '−');
      minusBtn.type = 'button';
      minusBtn.setAttribute('aria-label', `Quitar una unidad de ${item.name}`);
      minusBtn.addEventListener('click', () => {
        cartItems = updateItemQty(cartItems, item.id, -1);
        renderCart();
      });

      const qtyVal = el('span', 'qty-val', String(item.qty));

      const plusBtn = el('button', 'qty-btn', '+');
      plusBtn.type = 'button';
      plusBtn.setAttribute('aria-label', `Agregar una unidad de ${item.name}`);
      plusBtn.addEventListener('click', () => {
        cartItems = updateItemQty(cartItems, item.id, 1);
        renderCart();
      });

      const removeBtn = el('button', 'qty-btn');
      removeBtn.type = 'button';
      removeBtn.setAttribute('aria-label', `Eliminar ${item.name} de la charola`);
      const trashIcon = renderIcon('trash');
      if (trashIcon) removeBtn.append(trashIcon);
      removeBtn.addEventListener('click', () => {
        cartItems = removeItem(cartItems, item.id);
        renderCart();
      });

      controls.append(minusBtn, qtyVal, plusBtn, removeBtn);
      li.append(artWrap, info, controls);
      return li;
    }),
  );

  promoToggleBtn.setAttribute('aria-pressed', String(promoActive));
  promoStateLabel.textContent = promoActive ? 'Activo' : 'Activar';
  discountRowEl.hidden = !promoActive;

  $('#cart-subtotal').textContent = money.format(summary.subtotal);
  $('#cart-discount').textContent = `−${money.format(summary.discount)}`;
  $('#cart-tax').textContent = money.format(summary.tax);
  $('#cart-total').textContent = money.format(summary.total);
}

promoToggleBtn?.addEventListener('click', () => {
  promoActive = !promoActive;
  renderCart();
  showToast(promoActive ? `Cupón ${PROMO_CODE} (−20 %) activado` : 'Cupón desactivado');
});

$('#clear-cart-btn')?.addEventListener('click', () => {
  cartItems = [];
  confirmedOrderCode = null;
  renderCart();
  showToast('Charola vaciada');
});

$('#checkout-btn')?.addEventListener('click', () => {
  if (!cartItems.length) return;
  confirmedOrderCode = generateOrderCode();
  cartItems = [];
  renderCart();
  showToast(`Orden demo ${confirmedOrderCode} generada`);
});

$('#new-order-btn')?.addEventListener('click', () => {
  confirmedOrderCode = null;
  renderCart();
});

$('#cinema-order-brutus')?.addEventListener('click', () => {
  confirmedOrderCode = null;
  cartItems = addItem(
    cartItems,
    { id: 'la-brutus', name: 'La Brutus', price: 12.9, category: 'burgers', art: 'burger' },
    1,
  );
  renderCart();
  setCartOpen(true);
  showToast('La Brutus agregada desde la plancha');
});

// ───────── Card Renderers ─────────
const renderers = {
  reasons: (r, i) => {
    const card = el('article', 'card reason');
    const top = el('div', 'reason-top');
    top.append(el('span', 'reason-num', String(i + 1).padStart(2, '0')), renderReasonArt(i));
    card.append(top, el('h3', '', r.title), el('p', '', r.text));
    return card;
  },
  menu: (item) => {
    const id = slugifyId(item.name);
    const card = el('article', `card menu-item${item.favorite ? ' is-favorite' : ''}`);
    card.dataset.category = item.category;
    card.dataset.tags = (item.tags || []).join(',');
    if (item.favorite) card.append(el('span', 'badge', '★ #1 Más pedida'));
    const art = renderArt(item.art);
    if (art) {
      const frame = el('div', `dish-frame dish-${item.category}`);
      frame.append(art);
      card.append(frame);
    }

    const body = el('div', 'menu-body');
    const head = el('div', 'menu-head');
    head.append(el('h3', '', item.name), el('p', 'price', money.format(item.price)));
    body.append(head, el('p', 'menu-text', item.text));

    if (item.favorite) {
      const specs = el('ul', 'featured-specs');
      specs.setAttribute('aria-label', 'Especificaciones de plancha');
      for (const s of ['180 g Res Fresca', 'Doble Cheddar', 'Brioche del Día', 'Plancha 230 °C']) {
        specs.append(el('li', '', s));
      }
      body.append(specs);
    }

    const foot = el('div', 'menu-foot');
    const tags = el('ul', 'tags');
    tags.setAttribute('aria-label', 'Etiquetas');
    for (const t of item.tags) {
      const tagLi = el('li', `tag tag-${t}`);
      const icon = renderIcon(TAG_ICONS[t]);
      if (icon) tagLi.append(icon);
      tagLi.append(el('span', '', TAGS[t] ?? t));
      tags.append(tagLi);
    }

    const addBtn = el('button', 'btn-add');
    addBtn.type = 'button';
    addBtn.dataset.addId = id;
    addBtn.setAttribute('aria-label', `Agregar ${item.name} a tu charola`);
    const plusIcon = renderIcon('plus');
    if (plusIcon) addBtn.append(plusIcon);
    const addLabel = el('span', '', 'Agregar');
    addLabel.dataset.addLabel = '';
    addBtn.append(addLabel);

    addBtn.addEventListener('click', () => {
      confirmedOrderCode = null;
      cartItems = addItem(cartItems, { ...item, id }, 1);
      renderCart();
      showToast(`${item.name} agregada a tu charola`);
    });

    foot.append(tags, addBtn);
    body.append(foot);
    card.append(body);
    return card;
  },
  reviews: (r, idx) => {
    const card = el('blockquote', 'card review');
    const ticketHead = el('p', 'review-ticket-head', `COMANDA VERIFICADA · #0${idx + 1}`);
    const top = el('div', 'review-top');
    const stars = el('p', 'stars', '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating));
    stars.setAttribute('aria-label', `${r.rating} de 5 estrellas`);
    stars.setAttribute('role', 'img');
    top.append(stars, el('span', 'verified-badge', 'Verificado'));

    const footer = el('footer', 'review-author');
    const who = el('div');
    who.append(el('cite', '', r.author), el('span', 'role', r.role));
    footer.append(el('span', 'avatar', initials(r.author)), who);
    card.append(ticketHead, top, el('p', 'review-text', `“${r.text}”`), footer);
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

// ───────── Opening hours ─────────
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

// ───────── Menu filter (categories + dietary tags) ─────────
const filterButtons = $$('[data-filter]');
const filterStatus = $('[data-filter-status]');

function updateFilterCounts(menuItems) {
  const counts = {
    all: menuItems.length,
    burgers: menuItems.filter((x) => x.category === 'burgers').length,
    sides: menuItems.filter((x) => x.category === 'sides').length,
    drinks: menuItems.filter((x) => x.category === 'drinks').length,
    'tag:picante': menuItems.filter((x) => x.tags?.includes('picante')).length,
    'tag:veggie': menuItems.filter((x) => x.tags?.includes('veggie')).length,
  };
  for (const [key, val] of Object.entries(counts)) {
    const badge = $(`[data-count="${key}"]`);
    if (badge) badge.textContent = String(val);
  }
}

function applyFilter(filterKey) {
  let shown = 0;
  const isTag = filterKey.startsWith('tag:');
  const tagValue = isTag ? filterKey.slice(4) : '';

  for (const card of $$('[data-list="menu"] .menu-item')) {
    const tags = card.dataset.tags ? card.dataset.tags.split(',') : [];
    const match =
      filterKey === 'all' ||
      (isTag ? tags.includes(tagValue) : card.dataset.category === filterKey);
    card.hidden = !match;
    if (match) {
      shown++;
      card.classList.remove('pop');
      void card.offsetWidth; // restart the animation
      card.classList.add('pop');
    }
  }
  for (const b of filterButtons) b.setAttribute('aria-pressed', String(b.dataset.filter === filterKey));
  filterStatus.textContent = `Mostrando ${shown} ${shown === 1 ? 'producto' : 'productos'}`;
}

for (const button of filterButtons) button.addEventListener('click', () => applyFilter(button.dataset.filter));

// ───────── Location copy helper ─────────
let fullAddressText = 'Plaza Imperio, local 44 · Av. Paseo del Mar, Costa del Este, Ciudad de Panamá';

async function copyTextToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return true;
  }
  return false;
}

$('#copy-address-btn')?.addEventListener('click', async () => {
  const label = $('[data-copy-address-label]');
  try {
    await copyTextToClipboard(fullAddressText);
  } catch {
    // Fallback notification even if clipboard API is restricted
  }
  if (label) {
    label.textContent = '¡Dirección copiada!';
    setTimeout(() => {
      label.textContent = 'Copiar dirección';
    }, 2200);
  }
  showToast('Dirección copiada al portapapeles');
});

// ───────── Accessible Engraving Lightbox ─────────
const lightbox = $('#lightbox');
const lightboxImg = $('#lightbox-img');
const lightboxCaption = $('#lightbox-caption');
const lightboxClose = $('#lightbox-close');

for (const btn of $$('[data-lightbox-src]')) {
  btn.addEventListener('click', () => {
    if (!lightbox) return;
    lightboxImg.src = btn.dataset.lightboxSrc;
    lightboxImg.alt = btn.dataset.lightboxAlt || '';
    lightboxCaption.textContent = btn.dataset.lightboxCaption || '';
    if (typeof lightbox.showModal === 'function') lightbox.showModal();
    else lightbox.setAttribute('open', '');
  });
}

lightboxClose?.addEventListener('click', () => {
  if (typeof lightbox?.close === 'function') lightbox.close();
  else lightbox?.removeAttribute('open');
});

lightbox?.addEventListener('click', (e) => {
  if (e.target === lightbox) {
    if (typeof lightbox.close === 'function') lightbox.close();
    else lightbox.removeAttribute('open');
  }
});

// ───────── Content loading ─────────
fetch('data/content.json', { credentials: 'omit' })
  .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
  .then((data) => {
    for (const box of containers) {
      const key = box.dataset.list;
      const items = Array.isArray(data[key]) ? data[key] : [];
      box.replaceChildren(...items.map(renderers[key]));
      settle(box);
    }
    if (Array.isArray(data.menu)) updateFilterCounts(data.menu);
    const address = $('[data-address]');
    address.replaceChildren(el('span', 'address-main', data.location.address), el('span', 'address-area', data.location.area));
    fullAddressText = `${data.location.address}, ${data.location.area}`;
    $('[data-location-note]').textContent = data.location.note;
    renderHours(data.hours, data.location.timezone);
    setInterval(() => renderHours(data.hours, data.location.timezone), 60_000);
    // Loaded content shifts the sections: if the page was opened with a #hash, scroll back to it.
    if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();
  })
  .catch(() => {
    containers.forEach(showError);
    for (const node of $$('[data-status]')) node.textContent = '';
  });

// ───────── Reveal on scroll ─────────
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

// ───────── Club Brutus: validation, UX rate limit, reward and submission ─────────
const form = $('#subscribe-form');
const input = form.elements.email;
const consent = form.elements.consent;
const msg = $('#form-msg');
const submit = $('button[type="submit"]', form);
const clubReward = $('#club-reward');
const vipCard = $('#vip-card');
const vipHolderPreview = $('#vip-holder-preview');
const vipCardStatus = $('#vip-card-status');
const allow = createThrottle(3, 60_000);

input?.addEventListener('input', () => {
  const val = input.value.trim();
  if (vipHolderPreview) {
    vipHolderPreview.textContent = val ? val.toUpperCase() : 'TU@EMAIL.COM';
  }
});

const say = (text, kind = '') => {
  msg.textContent = text;
  msg.className = `form-msg ${kind}`;
};

const unlockClubReward = (emailText) => {
  if (clubReward) clubReward.hidden = false;
  if (vipCard) vipCard.classList.add('is-active');
  if (vipCardStatus) vipCardStatus.textContent = 'ACTIVA · −20 %';
  if (vipHolderPreview && emailText) vipHolderPreview.textContent = emailText.toUpperCase();
  promoActive = true;
  renderCart();
};

$('#copy-promo-btn')?.addEventListener('click', async () => {
  try {
    await copyTextToClipboard(PROMO_CODE);
  } catch {
    // ignore clipboard permission errors
  }
  showToast(`Código ${PROMO_CODE} copiado`);
});

$('#apply-promo-btn')?.addEventListener('click', () => {
  promoActive = true;
  renderCart();
  setCartOpen(true);
  showToast(`Cupón ${PROMO_CODE} (−20 %) aplicado a tu charola`);
});

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
    say('Modo demo: ¡bienvenido al Club Brutus! Desbloqueamos tu cupón de bienvenida.', 'ok');
    unlockClubReward(result.email);
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
      unlockClubReward(result.email);
      form.reset();
    }
  } catch {
    say('Sin conexión. Revisa tu internet.', 'error');
  } finally {
    submit.disabled = false;
  }
});

// ───────── Night Mode ("Brasa de Medianoche") Theme Switcher ─────────
const themeToggleBtn = $('#theme-toggle');
const themeIcon = $('#theme-icon');
const themeLabel = $('#theme-label');

themeToggleBtn?.addEventListener('click', () => {
  const isNight = document.documentElement.dataset.theme !== 'night';
  document.documentElement.dataset.theme = isNight ? 'night' : 'day';
  themeToggleBtn.setAttribute('aria-pressed', String(isNight));
  if (themeIcon) themeIcon.textContent = isNight ? '🔥' : '☀';
  if (themeLabel) themeLabel.textContent = isNight ? 'Noche' : 'Día';
  showToast(isNight ? 'Modo Brasa de Medianoche (230 °C) activado' : 'Modo Crema Diner (Día) activado');
});

// ───────── Bandeja "Combo del Emperador" Interactive Builder ─────────
for (const modBtn of $$('.combo-mod')) {
  modBtn.addEventListener('click', () => {
    const active = modBtn.getAttribute('aria-pressed') !== 'true';
    modBtn.setAttribute('aria-pressed', String(active));
    const label = modBtn.dataset.comboMod || '';
    modBtn.textContent = `${active ? '✓' : '+'} ${label}`;
  });
}

$('#add-combo-btn')?.addEventListener('click', () => {
  confirmedOrderCode = null;
  const activeMods = $$('.combo-mod[aria-pressed="true"]').map((b) => b.dataset.comboMod);
  const modSuffix = activeMods.length ? ` (${activeMods.join(', ')})` : '';
  cartItems = addItem(
    cartItems,
    {
      id: 'combo-del-emperador',
      name: 'Combo del Emperador',
      price: 17.9,
      category: 'burgers',
      art: 'burger',
    },
    1,
  );
  renderCart();
  setCartOpen(true);
  showToast(`Combo del Emperador${modSuffix} agregado a tu charola`);
});

