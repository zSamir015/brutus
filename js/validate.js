// Validación del formulario del Club Brutus. Funciones puras (se prueban con node --test).
// El cliente nunca es de confianza: la Edge Function `subscribe` revalida todo.

export const MAX_EMAIL = 254;

const EMAIL = /^[^\s@<>()"'`\\]+@[^\s@<>()"'`\\]+\.[^\s@<>()"'`\\]{2,}$/;

/** Quita espacios y caracteres de control; pasa a minúsculas. */
export const sanitizeEmail = (value) => String(value ?? '').replace(/[\u0000-\u001F\u007F\s]/g, '').toLowerCase();

export const isValidEmail = (email) => email.length <= MAX_EMAIL && EMAIL.test(email);

/**
 * @param {{ email: string, consent: boolean, honeypot: string }} input
 * @returns {{ ok: true, email: string } | { ok: false, reason: 'bot' | 'email' | 'consent' }}
 */
export function validateSubscription({ email, consent, honeypot }) {
  if (honeypot) return { ok: false, reason: 'bot' };
  const clean = sanitizeEmail(email);
  if (!isValidEmail(clean)) return { ok: false, reason: 'email' };
  if (consent !== true) return { ok: false, reason: 'consent' };
  return { ok: true, email: clean };
}

/** Throttle de UX: `max` intentos por ventana. El límite real está en el servidor. */
export function createThrottle(max, windowMs, now = () => Date.now()) {
  let hits = [];
  return () => {
    const t = now();
    hits = hits.filter((h) => t - h < windowMs);
    if (hits.length >= max) return false;
    hits.push(t);
    return true;
  };
}
