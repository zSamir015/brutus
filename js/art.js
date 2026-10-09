// Dish illustrations as SVG built with createElementNS.
// No innerHTML and no inline styles (the CSP would block them): every shape gets a class
// and its colors come from tokens.css through styles.css.

const NS = 'http://www.w3.org/2000/svg';

const seeds = [
  ['ellipse', { cx: 44, cy: 22, rx: 4, ry: 2.4, transform: 'rotate(-20 44 22)' }, 'a-seed'],
  ['ellipse', { cx: 60, cy: 17, rx: 4, ry: 2.4 }, 'a-seed'],
  ['ellipse', { cx: 76, cy: 22, rx: 4, ry: 2.4, transform: 'rotate(20 76 22)' }, 'a-seed'],
  ['ellipse', { cx: 58, cy: 30, rx: 4, ry: 2.4, transform: 'rotate(8 58 30)' }, 'a-seed'],
];
const bunTop = ['path', { d: 'M14 46 Q14 10 60 10 Q106 10 106 46 Z' }, 'a-bun'];
const bunBottom = ['path', { d: 'M14 74 H106 Q106 86 92 86 H28 Q14 86 14 74 Z' }, 'a-bun'];
const lettuce = ['path', { d: 'M10 48 Q18 40 26 48 T42 48 T58 48 T74 48 T90 48 T110 48 V54 H10 Z' }, 'a-lettuce'];
const cheese = ['path', { d: 'M12 52 H108 V58 H96 L92 66 L88 58 H54 L50 67 L46 58 H12 Z' }, 'a-cheese'];
const patty = (cls = 'a-patty', y = 56) => ['rect', { x: 12, y, width: 96, height: 16, rx: 8 }, cls];

const burger = (pattyCls, extra = []) => [bunBottom, patty(pattyCls), cheese, lettuce, bunTop, ...seeds, ...extra];

export const ART = {
  burger: burger('a-patty'),
  'burger-chicken': burger('a-patty a-patty-chicken'),
  'burger-veggie': burger('a-patty a-patty-veggie'),
  'burger-spicy': burger('a-patty', [
    ['circle', { cx: 32, cy: 50, r: 5 }, 'a-jalapeno'],
    ['circle', { cx: 60, cy: 52, r: 5 }, 'a-jalapeno'],
    ['circle', { cx: 88, cy: 50, r: 5 }, 'a-jalapeno'],
  ]),
  'burger-triple': [
    ['path', { d: 'M14 78 H106 Q106 88 92 88 H28 Q14 88 14 78 Z' }, 'a-bun'],
    ['rect', { x: 12, y: 64, width: 96, height: 13, rx: 6.5 }, 'a-patty'],
    ['rect', { x: 12, y: 52, width: 96, height: 13, rx: 6.5 }, 'a-patty'],
    ['rect', { x: 12, y: 40, width: 96, height: 13, rx: 6.5 }, 'a-patty'],
    ['path', { d: 'M12 38 H108 V44 H90 L86 52 L82 44 H40 L36 53 L32 44 H12 Z' }, 'a-cheese'],
    ['path', { d: 'M14 38 Q14 6 60 6 Q106 6 106 38 Z' }, 'a-bun'],
    ['ellipse', { cx: 48, cy: 18, rx: 4, ry: 2.4 }, 'a-seed'],
    ['ellipse', { cx: 70, cy: 16, rx: 4, ry: 2.4 }, 'a-seed'],
  ],
  fries: [
    ['rect', { x: 36, y: 10, width: 9, height: 44, transform: 'rotate(-10 40 30)' }, 'a-fry'],
    ['rect', { x: 48, y: 4, width: 9, height: 50 }, 'a-fry'],
    ['rect', { x: 60, y: 8, width: 9, height: 46, transform: 'rotate(6 64 30)' }, 'a-fry'],
    ['rect', { x: 72, y: 12, width: 9, height: 42, transform: 'rotate(14 76 30)' }, 'a-fry'],
    ['path', { d: 'M28 40 H92 L84 88 H36 Z' }, 'a-carton'],
    ['text', { x: 60, y: 70, 'text-anchor': 'middle' }, 'a-carton-label', 'B'],
  ],
  rings: [
    ['circle', { cx: 40, cy: 58, r: 22 }, 'a-ring'],
    ['circle', { cx: 40, cy: 58, r: 9 }, 'a-hole'],
    ['circle', { cx: 80, cy: 58, r: 22 }, 'a-ring'],
    ['circle', { cx: 80, cy: 58, r: 9 }, 'a-hole'],
    ['circle', { cx: 60, cy: 30, r: 22 }, 'a-ring'],
    ['circle', { cx: 60, cy: 30, r: 9 }, 'a-hole'],
  ],
  wings: [
    ['rect', { x: 66, y: 22, width: 30, height: 9, rx: 4, transform: 'rotate(-30 80 26)' }, 'a-bone'],
    ['circle', { cx: 97, cy: 15, r: 6 }, 'a-bone'],
    ['ellipse', { cx: 52, cy: 40, rx: 24, ry: 16, transform: 'rotate(-30 52 40)' }, 'a-wing'],
    ['rect', { x: 24, y: 66, width: 30, height: 9, rx: 4, transform: 'rotate(-30 38 70)' }, 'a-bone'],
    ['circle', { cx: 23, cy: 79, r: 6 }, 'a-bone'],
    ['ellipse', { cx: 66, cy: 62, rx: 24, ry: 16, transform: 'rotate(-30 66 62)' }, 'a-wing'],
  ],
  shake: [
    ['rect', { x: 64, y: 2, width: 7, height: 34, transform: 'rotate(14 67 20)' }, 'a-straw'],
    ['path', { d: 'M36 30 Q34 16 48 18 Q52 8 62 12 Q74 8 78 18 Q90 18 84 30 Z' }, 'a-cream'],
    ['circle', { cx: 60, cy: 12, r: 6 }, 'a-cherry'],
    ['path', { d: 'M34 30 H86 L78 88 H42 Z' }, 'a-cup'],
    ['path', { d: 'M38 50 H82 M40 66 H80' }, 'a-stripe'],
  ],
  lemonade: [
    ['path', { d: 'M34 14 H86 L80 88 H40 Z' }, 'a-glass'],
    ['path', { d: 'M36 34 H84 L80 86 H40 Z' }, 'a-lemonade'],
    ['circle', { cx: 84, cy: 20, r: 13 }, 'a-lemon'],
    ['path', { d: 'M84 20 L84 7 M84 20 L95 26 M84 20 L73 26' }, 'a-lemon-lines'],
    ['path', { d: 'M46 30 Q52 18 62 22 Q56 32 46 30 Z' }, 'a-mint'],
  ],
};

/** Returns a decorative <svg> for the illustration `name` (or null if it does not exist). */
export function renderArt(name) {
  const shapes = ART[name];
  if (!shapes) return null;
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 120 92');
  svg.setAttribute('class', 'dish-art');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  for (const [tag, attrs, cls, text] of shapes) {
    const node = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
    node.setAttribute('class', cls);
    if (text) node.textContent = text;
    svg.append(node);
  }
  return svg;
}
