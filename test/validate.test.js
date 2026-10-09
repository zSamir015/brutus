import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MAX_EMAIL, createThrottle, isValidEmail, sanitizeEmail, validateSubscription } from '../js/validate.js';

test('sanitizeEmail quita espacios y caracteres de control y pasa a minúsculas', () => {
  assert.equal(sanitizeEmail('  Ana@Ejemplo.COM \n'), 'ana@ejemplo.com');
  assert.equal(sanitizeEmail('a\u0000b@c.de'), 'ab@c.de');
  assert.equal(sanitizeEmail(undefined), '');
});

test('isValidEmail acepta correos normales y rechaza basura', () => {
  assert.equal(isValidEmail('ana@ejemplo.com'), true);
  assert.equal(isValidEmail('a.b+promo@sub.dominio.co'), true);
  for (const bad of ['', 'ana', 'ana@', '@x.com', 'ana@x', 'ana@x.c', 'a<b>@x.com', 'a"b@x.com']) {
    assert.equal(isValidEmail(bad), false, bad);
  }
  assert.equal(isValidEmail(`${'a'.repeat(MAX_EMAIL)}@x.com`), false);
});

test('validateSubscription: bot, correo y consentimiento', () => {
  assert.deepEqual(validateSubscription({ email: 'a@b.co', consent: true, honeypot: 'spam' }), { ok: false, reason: 'bot' });
  assert.deepEqual(validateSubscription({ email: 'nope', consent: true, honeypot: '' }), { ok: false, reason: 'email' });
  assert.deepEqual(validateSubscription({ email: 'a@b.co', consent: false, honeypot: '' }), { ok: false, reason: 'consent' });
  assert.deepEqual(validateSubscription({ email: ' A@B.co ', consent: true, honeypot: '' }), { ok: true, email: 'a@b.co' });
});

test('createThrottle permite N intentos por ventana', () => {
  let t = 0;
  const allow = createThrottle(3, 60_000, () => t);
  assert.deepEqual([allow(), allow(), allow(), allow()], [true, true, true, false]);
  t = 60_001;
  assert.equal(allow(), true);
});
