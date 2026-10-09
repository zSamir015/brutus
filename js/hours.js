// Opening hours. Pure functions (tested with node --test).
// "Open / closed" is computed in the restaurant's time zone, not the visitor's.

/** 'HH:MM' -> minutes since midnight. '24:00' means closing at midnight. */
export const toMinutes = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

/** For display: '24:00' reads as '00:00'. */
export const formatTime = (hhmm) => (hhmm === '24:00' ? '00:00' : hhmm);

const WEEKDAYS = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

/** Current day (0 = Sunday) and minutes in `timeZone`. */
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
    if (i === 0 && minutes >= toMinutes(h.open)) continue; // today's opening time has already passed
    return { open: false, opensAt: h.open, inDays: i };
  }
  return { open: false, opensAt: null, inDays: null };
}
