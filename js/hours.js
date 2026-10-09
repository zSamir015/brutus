// Horario del local. Funciones puras (se prueban con node --test).
// El estado "abierto / cerrado" se calcula en la zona horaria del local, no en la del visitante.

/** 'HH:MM' -> minutos desde medianoche. '24:00' = cierre a medianoche. */
export const toMinutes = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

/** Para mostrar: '24:00' se lee como '00:00'. */
export const formatTime = (hhmm) => (hhmm === '24:00' ? '00:00' : hhmm);

const WEEKDAYS = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

/** Día (0 = domingo) y minutos actuales en `timeZone`. */
export function localTime(date, timeZone) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', { timeZone, weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
      .formatToParts(date)
      .map((p) => [p.type, p.value]),
  );
  return { day: WEEKDAYS[parts.weekday], minutes: Number(parts.hour) * 60 + Number(parts.minute) };
}

/**
 * @param {{ day: number, open: string|null, close: string|null }[]} hours
 * @param {{ day: number, minutes: number }} now
 * @returns {{ open: true, closesAt: string } | { open: false, opensAt: string|null, inDays: number|null }}
 */
export function openStatus(hours, { day, minutes }) {
  const byDay = (d) => hours.find((h) => h.day === d);
  const today = byDay(day);
  if (today?.open && minutes >= toMinutes(today.open) && minutes < toMinutes(today.close)) {
    return { open: true, closesAt: today.close };
  }
  for (let i = 0; i < 7; i++) {
    const h = byDay((day + i) % 7);
    if (!h?.open) continue;
    if (i === 0 && minutes >= toMinutes(h.open)) continue; // hoy ya pasó la apertura
    return { open: false, opensAt: h.open, inDays: i };
  }
  return { open: false, opensAt: null, inDays: null };
}
