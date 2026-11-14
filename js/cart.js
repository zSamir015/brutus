// Pure cart and order calculation logic (no DOM dependencies).
// Tested in test/cart.test.js with node --test.

export const PROMO_CODE = 'BRUTUS2X1';
export const PROMO_RATE = 0.2; // 20 % Club Brutus discount
export const TAX_RATE = 0.07; // Panama ITBMS (7 %)
export const MAX_ITEM_QTY = 20;

const roundCents = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

export function slugifyId(name) {
  return String(name ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function addItem(items, product, delta = 1) {
  if (!product || !product.name || typeof product.price !== 'number' || product.price < 0) {
    return [...items];
  }
  const id = product.id || slugifyId(product.name);
  const existing = items.find((item) => item.id === id);
  if (existing) {
    const nextQty = Math.min(MAX_ITEM_QTY, existing.qty + delta);
    if (nextQty <= 0) return items.filter((item) => item.id !== id);
    return items.map((item) => (item.id === id ? { ...item, qty: nextQty } : item));
  }
  if (delta <= 0) return [...items];
  return [
    ...items,
    {
      id,
      name: product.name,
      price: product.price,
      category: product.category || 'burgers',
      art: product.art || 'burger',
      qty: Math.min(MAX_ITEM_QTY, delta),
    },
  ];
}

export function updateItemQty(items, id, delta) {
  const target = items.find((item) => item.id === id);
  if (!target) return [...items];
  const nextQty = Math.min(MAX_ITEM_QTY, target.qty + delta);
  if (nextQty <= 0) return items.filter((item) => item.id !== id);
  return items.map((item) => (item.id === id ? { ...item, qty: nextQty } : item));
}

export function removeItem(items, id) {
  return items.filter((item) => item.id !== id);
}

export function isValidPromo(code) {
  return String(code ?? '').trim().toUpperCase() === PROMO_CODE;
}

export function cartSummary(items, promoActive = false) {
  const count = items.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = roundCents(items.reduce((sum, item) => sum + item.price * item.qty, 0));
  const discount = promoActive ? roundCents(subtotal * PROMO_RATE) : 0;
  const taxable = Math.max(0, roundCents(subtotal - discount));
  const tax = roundCents(taxable * TAX_RATE);
  const total = roundCents(taxable + tax);
  return { count, subtotal, discount, tax, total };
}

export function generateOrderCode(randomValue = Math.random()) {
  const num = Math.floor(1000 + Math.max(0, Math.min(0.9999, randomValue)) * 9000);
  return `BR-${num}`;
}
