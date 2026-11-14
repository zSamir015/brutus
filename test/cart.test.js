import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  PROMO_CODE,
  addItem,
  cartSummary,
  generateOrderCode,
  isValidPromo,
  removeItem,
  slugifyId,
  updateItemQty,
} from '../js/cart.js';

const BRUTUS = { name: 'La Brutus', price: 12.9, category: 'burgers', art: 'burger' };
const FRIES = { name: 'Papas Brutas', price: 4.5, category: 'sides', art: 'fries' };

test('slugifyId normalizes Spanish names into stable IDs', () => {
  assert.equal(slugifyId('César'), 'cesar');
  assert.equal(slugifyId('La Brutus'), 'la-brutus');
  assert.equal(slugifyId('Alitas Vesubio'), 'alitas-vesubio');
});

test('addItem, updateItemQty and removeItem manage quantities cleanly', () => {
  let cart = [];
  cart = addItem(cart, BRUTUS);
  assert.equal(cart.length, 1);
  assert.equal(cart[0].id, 'la-brutus');
  assert.equal(cart[0].qty, 1);

  cart = addItem(cart, BRUTUS, 2);
  assert.equal(cart[0].qty, 3);

  cart = addItem(cart, FRIES, 1);
  assert.equal(cart.length, 2);

  cart = updateItemQty(cart, 'la-brutus', -2);
  assert.equal(cart[0].qty, 1);

  cart = updateItemQty(cart, 'la-brutus', -1);
  assert.equal(cart.length, 1);
  assert.equal(cart[0].id, 'papas-brutas');

  cart = removeItem(cart, 'papas-brutas');
  assert.deepEqual(cart, []);
});

test('isValidPromo accepts BRUTUS2X1 case-insensitively', () => {
  assert.equal(isValidPromo(PROMO_CODE), true);
  assert.equal(isValidPromo('  brutus2x1 '), true);
  assert.equal(isValidPromo('OTRO'), false);
});

test('cartSummary computes subtotal, Club discount, ITBMS tax and total', () => {
  let cart = addItem([], BRUTUS, 2); // 25.80
  cart = addItem(cart, FRIES, 1); // + 4.50 = 30.30

  const regular = cartSummary(cart, false);
  assert.deepEqual(regular, {
    count: 3,
    subtotal: 30.3,
    discount: 0,
    tax: 2.12,
    total: 32.42,
  });

  const withPromo = cartSummary(cart, true);
  assert.deepEqual(withPromo, {
    count: 3,
    subtotal: 30.3,
    discount: 6.06,
    tax: 1.7,
    total: 25.94,
  });
});

test('generateOrderCode returns deterministic BR-XXXX format', () => {
  assert.equal(generateOrderCode(0), 'BR-1000');
  assert.equal(generateOrderCode(0.5), 'BR-5500');
  assert.match(generateOrderCode(), /^BR-\d{4}$/);
});
