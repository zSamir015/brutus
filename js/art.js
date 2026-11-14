// Dish illustrations, Neo-Brutalist UI icons and 60fps Grill Cinema Canvas engine.
// No innerHTML and no inline styles (the CSP would block them): every shape gets a class
// and its colors come from tokens.css through styles.css.

const NS = 'http://www.w3.org/2000/svg';

const seeds = [
  ['ellipse', { cx: 38, cy: 23, rx: 4, ry: 2.3, transform: 'rotate(-22 38 23)' }, 'a-seed'],
  ['ellipse', { cx: 56, cy: 17, rx: 4, ry: 2.3 }, 'a-seed'],
  ['ellipse', { cx: 74, cy: 21, rx: 4, ry: 2.3, transform: 'rotate(18 74 21)' }, 'a-seed'],
  ['ellipse', { cx: 48, cy: 31, rx: 3.8, ry: 2.2, transform: 'rotate(8 48 31)' }, 'a-seed'],
  ['ellipse', { cx: 66, cy: 30, rx: 3.8, ry: 2.2, transform: 'rotate(-10 66 30)' }, 'a-seed'],
  ['ellipse', { cx: 86, cy: 31, rx: 3.8, ry: 2.2, transform: 'rotate(24 86 31)' }, 'a-seed'],
];
const plateShadow = ['ellipse', { cx: 60, cy: 86, rx: 48, ry: 4 }, 'a-plate'];
const bunTop = ['path', { d: 'M14 45 Q14 9 60 9 Q106 9 106 45 Z' }, 'a-bun'];
const bunShine = ['path', { d: 'M24 34 Q32 16 56 15' }, 'a-shine'];
const bunBottom = ['path', { d: 'M15 73 H105 Q105 85 91 85 H29 Q15 85 15 73 Z' }, 'a-bun'];
const sauceDrip = [
  'path',
  { d: 'M20 71 H100 V74 H82 L79 80 L76 74 H44 L41 79 L38 74 H20 Z' },
  'a-sauce',
];
const lettuce = [
  'path',
  { d: 'M10 47 Q18 39 26 47 T42 47 T58 47 T74 47 T90 47 T110 47 V53 H10 Z' },
  'a-lettuce',
];
const cheese = [
  'path',
  { d: 'M12 51 H108 V57 H96 L91 66 L86 57 H55 L50 67 L45 57 H12 Z' },
  'a-cheese',
];
const patty = (cls = 'a-patty', y = 55) => [
  'rect',
  { x: 12, y, width: 96, height: 17, rx: 8.5 },
  cls,
];
const pattySear = (y = 61) => [
  'path',
  { d: `M24 ${y} H40 M52 ${y + 3} H74 M82 ${y - 1} H96` },
  'a-sear',
];

const burger = (pattyCls, extra = []) => [
  plateShadow,
  bunBottom,
  sauceDrip,
  patty(pattyCls),
  pattySear(),
  cheese,
  lettuce,
  bunTop,
  bunShine,
  ...seeds,
  ...extra,
];

export const ART = {
  burger: burger('a-patty'),
  'burger-chicken': burger('a-patty a-patty-chicken'),
  'burger-veggie': burger('a-patty a-patty-veggie'),
  'burger-spicy': burger('a-patty', [
    ['circle', { cx: 32, cy: 50, r: 5.5 }, 'a-jalapeno'],
    ['circle', { cx: 60, cy: 52, r: 5.5 }, 'a-jalapeno'],
    ['circle', { cx: 88, cy: 50, r: 5.5 }, 'a-jalapeno'],
    ['path', { d: 'M24 6 Q28 1 24 -2 M60 4 Q64 -1 60 -4 M94 6 Q98 1 94 -2' }, 'a-steam'],
  ]),
  'burger-triple': [
    plateShadow,
    ['path', { d: 'M14 77 H106 Q106 86 92 86 H28 Q14 86 14 77 Z' }, 'a-bun'],
    sauceDrip,
    ['rect', { x: 12, y: 64, width: 96, height: 13, rx: 6.5 }, 'a-patty'],
    ['path', { d: 'M24 70 H44 M68 70 H92' }, 'a-sear'],
    ['rect', { x: 12, y: 52, width: 96, height: 13, rx: 6.5 }, 'a-patty'],
    ['path', { d: 'M16 52 H104 V56 H86 L82 62 L78 56 H16 Z' }, 'a-cheese'],
    ['rect', { x: 12, y: 40, width: 96, height: 13, rx: 6.5 }, 'a-patty'],
    ['path', { d: 'M28 46 H52 M72 46 H94' }, 'a-sear'],
    ['path', { d: 'M12 38 H108 V44 H90 L86 52 L82 44 H40 L36 53 L32 44 H12 Z' }, 'a-cheese'],
    ['path', { d: 'M14 38 Q14 6 60 6 Q106 6 106 38 Z' }, 'a-bun'],
    ['path', { d: 'M24 28 Q32 12 56 11' }, 'a-shine'],
    ['ellipse', { cx: 44, cy: 18, rx: 4, ry: 2.3, transform: 'rotate(-16 44 18)' }, 'a-seed'],
    ['ellipse', { cx: 62, cy: 15, rx: 4, ry: 2.3 }, 'a-seed'],
    ['ellipse', { cx: 78, cy: 19, rx: 4, ry: 2.3, transform: 'rotate(16 78 19)' }, 'a-seed'],
  ],
  fries: [
    plateShadow,
    ['rect', { x: 28, y: 14, width: 9, height: 42, rx: 2, transform: 'rotate(-16 32 34)' }, 'a-fry'],
    ['rect', { x: 37, y: 8, width: 9, height: 46, rx: 2, transform: 'rotate(-8 41 30)' }, 'a-fry'],
    ['rect', { x: 47, y: 4, width: 9, height: 50, rx: 2 }, 'a-fry'],
    ['rect', { x: 57, y: 6, width: 9, height: 48, rx: 2, transform: 'rotate(5 61 30)' }, 'a-fry'],
    ['rect', { x: 67, y: 10, width: 9, height: 44, rx: 2, transform: 'rotate(12 71 30)' }, 'a-fry'],
    ['rect', { x: 76, y: 16, width: 9, height: 40, rx: 2, transform: 'rotate(20 80 34)' }, 'a-fry'],
    ['path', { d: 'M26 39 H88 L80 85 H34 Z' }, 'a-carton'],
    ['path', { d: 'M29 48 H85' }, 'a-stripe-gold'],
    ['text', { x: 57, y: 71, 'text-anchor': 'middle' }, 'a-carton-label', 'B'],
    ['path', { d: 'M86 68 H108 L105 84 H89 Z' }, 'a-cup'],
    ['path', { d: 'M86 68 Q97 62 108 68 Z' }, 'a-sauce'],
  ],
  rings: [
    plateShadow,
    ['circle', { cx: 38, cy: 58, r: 22 }, 'a-ring'],
    ['circle', { cx: 38, cy: 58, r: 9 }, 'a-hole'],
    ['circle', { cx: 78, cy: 58, r: 22 }, 'a-ring'],
    ['circle', { cx: 78, cy: 58, r: 9 }, 'a-hole'],
    ['circle', { cx: 58, cy: 30, r: 22 }, 'a-ring'],
    ['circle', { cx: 58, cy: 30, r: 9 }, 'a-hole'],
    ['path', { d: 'M44 19 Q52 12 64 15' }, 'a-shine'],
    ['circle', { cx: 26, cy: 52, r: 1.5 }, 'a-seed'],
    ['circle', { cx: 90, cy: 54, r: 1.5 }, 'a-seed'],
    ['circle', { cx: 70, cy: 24, r: 1.5 }, 'a-seed'],
  ],
  wings: [
    plateShadow,
    ['rect', { x: 66, y: 22, width: 30, height: 9, rx: 4, transform: 'rotate(-30 80 26)' }, 'a-bone'],
    ['circle', { cx: 97, cy: 15, r: 6 }, 'a-bone'],
    ['ellipse', { cx: 52, cy: 40, rx: 25, ry: 16, transform: 'rotate(-30 52 40)' }, 'a-wing'],
    ['path', { d: 'M38 38 Q48 28 62 32' }, 'a-shine'],
    ['rect', { x: 24, y: 66, width: 30, height: 9, rx: 4, transform: 'rotate(-30 38 70)' }, 'a-bone'],
    ['circle', { cx: 23, cy: 79, r: 6 }, 'a-bone'],
    ['ellipse', { cx: 66, cy: 62, rx: 25, ry: 16, transform: 'rotate(-30 66 62)' }, 'a-wing'],
    ['path', { d: 'M54 58 Q64 50 76 54' }, 'a-shine'],
    ['ellipse', { cx: 50, cy: 38, rx: 2.5, ry: 1.4 }, 'a-seed'],
    ['ellipse', { cx: 66, cy: 62, rx: 2.5, ry: 1.4 }, 'a-seed'],
  ],
  shake: [
    plateShadow,
    ['rect', { x: 65, y: 2, width: 7, height: 34, transform: 'rotate(14 67 20)' }, 'a-straw'],
    ['path', { d: 'M34 30 Q32 16 47 18 Q52 7 62 12 Q74 7 78 18 Q90 18 86 30 Z' }, 'a-cream'],
    ['path', { d: 'M60 12 Q66 3 72 5' }, 'a-sear'],
    ['circle', { cx: 60, cy: 12, r: 6.5 }, 'a-cherry'],
    ['path', { d: 'M34 30 H86 L78 85 H42 Z' }, 'a-cup'],
    ['path', { d: 'M37 30 H83 V35 H72 L69 44 L66 35 H51 L48 42 L45 35 H37 Z' }, 'a-patty'],
    ['path', { d: 'M38 52 H82 M40 67 H80' }, 'a-stripe'],
  ],
  lemonade: [
    plateShadow,
    ['rect', { x: 42, y: 3, width: 6, height: 36, transform: 'rotate(-10 45 20)' }, 'a-straw'],
    ['path', { d: 'M34 14 H86 L80 85 H40 Z' }, 'a-glass'],
    ['path', { d: 'M36 32 H84 L80 83 H40 Z' }, 'a-lemonade'],
    ['rect', { x: 44, y: 40, width: 12, height: 12, rx: 2, transform: 'rotate(-12 50 46)' }, 'a-ice'],
    ['rect', { x: 62, y: 46, width: 12, height: 12, rx: 2, transform: 'rotate(14 68 52)' }, 'a-ice'],
    ['circle', { cx: 52, cy: 68, r: 2.5 }, 'a-bubble'],
    ['circle', { cx: 66, cy: 62, r: 2 }, 'a-bubble'],
    ['circle', { cx: 58, cy: 74, r: 1.8 }, 'a-bubble'],
    ['circle', { cx: 84, cy: 20, r: 13 }, 'a-lemon'],
    ['path', { d: 'M84 20 L84 7 M84 20 L95 26 M84 20 L73 26' }, 'a-lemon-lines'],
    ['path', { d: 'M46 28 Q52 16 62 20 Q56 30 46 28 Z' }, 'a-mint'],
  ],
};

export const REASON_ART = [
  // 01: 180g fresh beef patty on grill lines with rising steam
  [
    ['rect', { x: 6, y: 24, width: 52, height: 22, rx: 11 }, 'a-patty'],
    ['path', { d: 'M18 28 L14 42 M32 28 L28 42 M46 28 L42 42' }, 'a-stripe-gold'],
    ['path', { d: 'M20 16 Q23 9 19 4 M32 18 Q35 11 31 6 M44 16 Q47 9 43 4' }, 'a-steam'],
  ],
  // 02: Golden brioche bun baked daily with glossy shine
  [
    ['path', { d: 'M6 42 Q6 11 32 11 Q58 11 58 42 Z' }, 'a-bun'],
    ['path', { d: 'M15 30 Q22 17 34 16' }, 'a-shine'],
    ['rect', { x: 6, y: 42, width: 52, height: 9, rx: 4.5 }, 'a-cheese'],
    ['ellipse', { cx: 22, cy: 24, rx: 3, ry: 1.8, transform: 'rotate(-18 22 24)' }, 'a-seed'],
    ['ellipse', { cx: 32, cy: 20, rx: 3, ry: 1.8 }, 'a-seed'],
    ['ellipse', { cx: 42, cy: 24, rx: 3, ry: 1.8, transform: 'rotate(18 42 24)' }, 'a-seed'],
  ],
  // 03: Secret Brutus sauce bottle with drip
  [
    ['rect', { x: 25, y: 5, width: 14, height: 8, rx: 2 }, 'a-cheese'],
    ['path', { d: 'M26 13 H38 L45 25 V52 Q45 56 41 56 H23 Q19 56 19 52 V25 Z' }, 'a-carton'],
    ['rect', { x: 23, y: 30, width: 18, height: 15, rx: 2 }, 'a-cream'],
    ['text', { x: 32, y: 42, 'text-anchor': 'middle' }, 'a-carton-label', 'B'],
  ],
];

export const ICONS = {
  plus: [['path', { d: 'M12 5 V19 M5 12 H19' }, 'i-stroke']],
  minus: [['path', { d: 'M5 12 H19' }, 'i-stroke']],
  check: [['path', { d: 'M4 12.5 L9.5 18 L20 6.5' }, 'i-stroke']],
  copy: [
    ['rect', { x: 8, y: 8, width: 12, height: 12, rx: 2 }, 'i-stroke'],
    ['path', { d: 'M16 8 V5 C16 4.4 15.6 4 15 4 H5 C4.4 4 4 4.4 4 5 V15 C4 15.6 4.4 16 5 16 H8' }, 'i-stroke'],
  ],
  trash: [
    ['path', { d: 'M4 7 H20 M9 7 V4 H15 V7 M6 7 L7 20 H17 L18 7' }, 'i-stroke'],
  ],
  flame: [
    ['path', { d: 'M12 3 C14 7 19 9 19 14.5 C19 18.6 15.9 21 12 21 C8.1 21 5 18.6 5 14.5 C5 11.5 7 9 8.5 7.5 C8.5 9.5 10 10.5 10.5 10.5 C10 7.5 10.5 5 12 3 Z' }, 'i-fill'],
  ],
  leaf: [
    ['path', { d: 'M19 4 C10 4 5 9 5 17 C5 18.5 5.5 19.5 6 20 C14 20 19 15 19 4 Z' }, 'i-fill'],
    ['path', { d: 'M5 20 L13 12' }, 'i-stroke'],
  ],
  zoom: [
    ['circle', { cx: 10.5, cy: 10.5, r: 6.5 }, 'i-stroke'],
    ['path', { d: 'M15.5 15.5 L20.5 20.5 M10.5 7.5 V13.5 M7.5 10.5 H13.5' }, 'i-stroke'],
  ],
  bag: [
    ['path', { d: 'M5 8 H19 L18 20 H6 Z' }, 'i-stroke'],
    ['path', { d: 'M9 8 V6 C9 4.3 10.3 3 12 3 C13.7 3 15 4.3 15 6 V8' }, 'i-stroke'],
  ],
  play: [['path', { d: 'M7 5 L19 12 L7 19 Z' }, 'i-fill']],
  pause: [['path', { d: 'M7 5 V19 M17 5 V19' }, 'i-stroke']],
  layers: [
    ['path', { d: 'M12 3 L21 8 L12 13 L3 8 Z' }, 'i-stroke'],
    ['path', { d: 'M3 13 L12 18 L21 13 M3 17.5 L12 22.5 L21 17.5' }, 'i-stroke'],
  ],
  close: [['path', { d: 'M6 6 L18 18 M18 6 L6 18' }, 'i-stroke']],
};

function buildSvg(viewBox, cls, shapes) {
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', viewBox);
  svg.setAttribute('class', cls);
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  for (const [tag, attrs, shapeCls, text] of shapes) {
    const node = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
    if (shapeCls) node.setAttribute('class', shapeCls);
    if (text) node.textContent = text;
    svg.append(node);
  }
  return svg;
}

/** Returns a decorative <svg> for the illustration `name` (or null if it does not exist). */
export function renderArt(name) {
  const shapes = ART[name];
  if (!shapes) return null;
  return buildSvg('0 0 120 92', 'dish-art', shapes);
}

/** Returns a decorative <svg> emblem for the "Por qué Brutus" pillar at `index`. */
export function renderReasonArt(index) {
  const shapes = REASON_ART[index % REASON_ART.length];
  return buildSvg('0 0 64 60', 'reason-art dish-art', shapes);
}

/** Returns a crisp 24x24 <svg> icon for UI controls. */
export function renderIcon(name, extraClass = '') {
  const shapes = ICONS[name];
  if (!shapes) return null;
  return buildSvg('0 0 24 24', `ui-icon ${extraClass}`.trim(), shapes);
}

/**
 * 60fps Neo-Brutalist Procedural Grill Cinema ("Brutus Cam · 230 °C")
 * Renders an interactive 3-scene cooking reel on HTML5 <canvas> with zero external video dependencies.
 */
export function initGrillCinema(canvas, onUpdate) {
  if (!canvas || typeof canvas.getContext !== 'function') return null;
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  const DURATION = 15; // 15-second loop across 3 chapters (5s each)

  let playing = !matchMedia('(prefers-reduced-motion: reduce)').matches;
  let elapsed = 0;
  let lastTs = performance.now();

  const sparks = Array.from({ length: 26 }, (_, i) => ({
    x: 160 + ((i * 23) % 440),
    y: 260 - ((i * 19) % 140),
    vx: ((i % 5) - 2) * 28,
    vy: -45 - (i % 7) * 18,
    r: 3 + (i % 4),
    color: i % 2 === 0 ? '#ffc93c' : '#e63b2e',
  }));

  const steam = Array.from({ length: 14 }, (_, i) => ({
    x: 200 + i * 28,
    y: 240 - (i % 4) * 35,
    r: 14 + (i % 3) * 8,
    speed: 26 + (i % 4) * 8,
  }));

  function roundRect(x, y, w, h, r, fill, stroke = '#141010', lw = 5) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    if (fill) {
      ctx.fillStyle = fill;
      ctx.fill();
    }
    if (stroke) {
      ctx.lineWidth = lw;
      ctx.strokeStyle = stroke;
      ctx.stroke();
    }
  }

  function drawScene(t, dt) {
    const chapter = t < 5 ? 0 : t < 10 ? 1 : 2;
    const localT = (t % 5) / 5; // 0..1 within current chapter

    // Background studio backdrop
    ctx.fillStyle = '#1b1515';
    ctx.fillRect(0, 0, W, H);

    // Subtle radiant heat glow from the griddle
    const grad = ctx.createRadialGradient(W / 2, H - 50, 20, W / 2, H - 40, 320);
    grad.addColorStop(0, 'rgba(230, 59, 46, 0.42)');
    grad.addColorStop(0.6, 'rgba(255, 201, 60, 0.14)');
    grad.addColorStop(1, 'rgba(20, 16, 16, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Rising steam puffs
    for (const s of steam) {
      if (playing) {
        s.y -= s.speed * dt;
        if (s.y < 40) s.y = 265;
      }
      const alpha = Math.max(0, Math.min(0.28, (s.y - 40) / 220));
      ctx.beginPath();
      ctx.arc(s.x + Math.sin(t * 2.5 + s.r) * 10, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 244, 224, ${alpha})`;
      ctx.fill();
    }

    // Cast-iron griddle surface at bottom
    roundRect(-10, 286, W + 20, 80, 0, '#2e2626', '#141010', 6);
    // Glowing grill sear grooves
    ctx.strokeStyle = '#e63b2e';
    ctx.lineWidth = 4;
    for (let gx = 40; gx < W; gx += 48) {
      ctx.beginPath();
      ctx.moveTo(gx, 294);
      ctx.lineTo(gx - 18, 360);
      ctx.stroke();
    }

    // Bottom toasted bun (present in Chapter 2 or base of burger)
    if (chapter === 2) {
      roundRect(210, 250, 340, 38, [6, 6, 22, 22], '#f2a541');
    }

    // First 180g Beef Medal (sizzling on griddle)
    const smashSquash = chapter === 0 ? Math.min(1, localT * 1.8) : 1;
    const pattyH = 54 - smashSquash * 14;
    const pattyW = 280 + smashSquash * 64;
    const pattyX = (W - pattyW) / 2;
    const pattyY = (chapter === 2 ? 250 : 286) - pattyH;

    // Neo-brutalist hard shadow
    roundRect(pattyX + 6, pattyY + 6, pattyW, pattyH, 20, '#141010', null, 0);
    roundRect(pattyX, pattyY, pattyW, pattyH, 20, '#6b3a1f', '#141010', 5);

    // Caramelized Maillard crust lines on patty
    ctx.strokeStyle = '#3b1d0d';
    ctx.lineWidth = 4;
    for (let i = 0; i < 5; i++) {
      const lx = pattyX + 42 + i * 56;
      ctx.beginPath();
      ctx.moveTo(lx, pattyY + 8);
      ctx.lineTo(lx - 10, pattyY + pattyH - 8);
      ctx.stroke();
    }

    // Chapter 0: Heavy Cast-Iron Smash Press descending
    if (chapter === 0) {
      const pressY = localT < 0.45
        ? -40 + (localT / 0.45) * (pattyY - 26 + 40)
        : pattyY - 26 - Math.max(0, (localT - 0.65) * 260);
      // Handle
      roundRect(W / 2 - 22, pressY - 78, 44, 80, 6, '#9fb3c4', '#141010', 5);
      roundRect(W / 2 - 48, pressY - 92, 96, 22, 8, '#e63b2e', '#141010', 5);
      // Heavy iron base
      roundRect(W / 2 - 175, pressY, 350, 26, 4, '#9fb3c4', '#141010', 5);
    }

    // Chapter 1 & 2: Second Patty + Double Molten Cheddar + Crispy Bacon
    if (chapter >= 1) {
      const dropProgress = chapter === 1 ? Math.min(1, localT * 2.2) : 1;
      const p2Y = pattyY - 38 - (1 - dropProgress) * 90;

      // First molten cheddar layer
      ctx.beginPath();
      ctx.moveTo(pattyX - 4, pattyY - 4);
      ctx.lineTo(pattyX + pattyW + 4, pattyY - 4);
      ctx.lineTo(pattyX + pattyW, pattyY + 10);
      ctx.lineTo(pattyX + pattyW - 60, pattyY + 26);
      ctx.lineTo(pattyX + pattyW - 85, pattyY + 8);
      ctx.lineTo(pattyX + 120, pattyY + 8);
      ctx.lineTo(pattyX + 95, pattyY + 28);
      ctx.lineTo(pattyX + 75, pattyY + 8);
      ctx.lineTo(pattyX, pattyY + 8);
      ctx.closePath();
      ctx.fillStyle = '#ffb703';
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#141010';
      ctx.stroke();

      // Second patty
      roundRect(pattyX + 6, p2Y, pattyW - 12, 38, 18, '#6b3a1f', '#141010', 5);

      // Second molten cheddar layer
      const c2Y = p2Y - 4;
      ctx.beginPath();
      ctx.moveTo(pattyX + 2, c2Y);
      ctx.lineTo(pattyX + pattyW - 2, c2Y);
      ctx.lineTo(pattyX + pattyW - 12, c2Y + 12);
      ctx.lineTo(pattyX + 210, c2Y + 30);
      ctx.lineTo(pattyX + 185, c2Y + 12);
      ctx.lineTo(pattyX + 12, c2Y + 12);
      ctx.closePath();
      ctx.fillStyle = '#ffc93c';
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#141010';
      ctx.stroke();

      // Crispy bacon strips
      roundRect(pattyX + 45, c2Y - 12, 110, 12, 5, '#c92519', '#141010', 4);
      roundRect(pattyX + 185, c2Y - 14, 115, 12, 5, '#c92519', '#141010', 4);
    }

    // Chapter 2: Romaine Lettuce, Secret Brutus Sauce & Brioche Crown
    if (chapter === 2) {
      const crownDrop = Math.min(1, localT * 2.4);
      const topY = 172 - (1 - crownDrop) * 110;

      // Wavy lettuce
      ctx.beginPath();
      ctx.moveTo(195, topY + 4);
      for (let lx = 195; lx <= 565; lx += 37) {
        ctx.quadraticCurveTo(lx + 18, topY - 14, lx + 37, topY + 4);
      }
      ctx.lineTo(565, topY + 16);
      ctx.lineTo(195, topY + 16);
      ctx.closePath();
      ctx.fillStyle = '#3fae5a';
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#141010';
      ctx.stroke();

      // Golden Brioche Dome
      ctx.beginPath();
      ctx.moveTo(205, topY);
      ctx.quadraticCurveTo(205, topY - 96, 380, topY - 96);
      ctx.quadraticCurveTo(555, topY - 96, 555, topY);
      ctx.closePath();
      ctx.fillStyle = '#f2a541';
      ctx.fill();
      ctx.lineWidth = 5;
      ctx.strokeStyle = '#141010';
      ctx.stroke();

      // Sesame seeds on crown
      const seedCoords = [
        [310, topY - 52],
        [380, topY - 68],
        [450, topY - 50],
        [345, topY - 30],
        [415, topY - 32],
      ];
      for (const [sx, sy] of seedCoords) {
        ctx.beginPath();
        ctx.ellipse(sx, sy, 8, 4.5, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#fff4e0';
        ctx.fill();
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = '#141010';
        ctx.stroke();
      }

      // Impact badge when crown lands
      if (crownDrop >= 0.95) {
        roundRect(530, 52, 178, 46, 0, '#c92519', '#ffffff', 3);
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 18px "Arial Black", sans-serif';
        ctx.fillText('¡SELLADA 230 °C!', 544, 81);
      }
    }

    // Sizzling sparks flying off the grill
    for (const sp of sparks) {
      if (playing) {
        sp.x += sp.vx * dt;
        sp.y += sp.vy * dt;
        if (sp.y < 60 || sp.x < 80 || sp.x > W - 80) {
          sp.x = 220 + Math.random() * 320;
          sp.y = 278;
        }
      }
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, sp.r, 0, Math.PI * 2);
      ctx.fillStyle = sp.color;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#141010';
      ctx.stroke();
    }

    // Camera viewfinder corners
    ctx.strokeStyle = 'rgba(255, 244, 224, 0.55)';
    ctx.lineWidth = 3;
    const m = 18;
    const c = 22;
    // Top-left & Bottom-right brackets
    ctx.beginPath();
    ctx.moveTo(m, m + c); ctx.lineTo(m, m); ctx.lineTo(m + c, m);
    ctx.moveTo(W - m - c, m); ctx.lineTo(W - m, m); ctx.lineTo(W - m, m + c);
    ctx.moveTo(m, H - m - c); ctx.lineTo(m, H - m); ctx.lineTo(m + c, H - m);
    ctx.moveTo(W - m - c, H - m); ctx.lineTo(W - m, H - m); ctx.lineTo(W - m, H - m - c);
    ctx.stroke();

    if (typeof onUpdate === 'function') {
      onUpdate({ elapsed: t, duration: DURATION, chapter, playing });
    }
  }

  function tick(now) {
    const dt = Math.min(0.05, (now - lastTs) / 1000);
    lastTs = now;
    if (playing) {
      elapsed = (elapsed + dt) % DURATION;
    }
    drawScene(elapsed, dt);
    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);

  return {
    togglePlay() {
      playing = !playing;
      return playing;
    },
    setChapter(chIndex) {
      elapsed = Math.max(0, Math.min(2, chIndex)) * 5 + 0.05;
      drawScene(elapsed, 0.016);
    },
    seek(ratio) {
      elapsed = Math.max(0, Math.min(0.999, ratio)) * DURATION;
      drawScene(elapsed, 0.016);
    },
    isPlaying: () => playing,
  };
}
