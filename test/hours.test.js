import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatTime, localTime, openStatus, toMinutes } from '../js/hours.js';

const HOURS = [
  { day: 1, open: null, close: null },
  { day: 2, open: '12:00', close: '22:00' },
  { day: 5, open: '12:00', close: '24:00' },
  { day: 0, open: '12:00', close: '20:00' },
];

test('toMinutes y formatTime', () => {
  assert.equal(toMinutes('12:30'), 750);
  assert.equal(toMinutes('24:00'), 1440);
  assert.equal(formatTime('24:00'), '00:00');
  assert.equal(formatTime('12:00'), '12:00');
});

test('abierto dentro del horario', () => {
  assert.deepEqual(openStatus(HOURS, { day: 2, minutes: toMinutes('13:00') }), { open: true, closesAt: '22:00' });
  assert.deepEqual(openStatus(HOURS, { day: 5, minutes: toMinutes('23:59') }), { open: true, closesAt: '24:00' });
});

test('cerrado antes de abrir: abre hoy', () => {
  assert.deepEqual(openStatus(HOURS, { day: 2, minutes: toMinutes('09:00') }), { open: false, opensAt: '12:00', inDays: 0 });
});

test('cerrado después de cerrar o en día libre: busca el siguiente día abierto', () => {
  assert.deepEqual(openStatus(HOURS, { day: 2, minutes: toMinutes('22:00') }), { open: false, opensAt: '12:00', inDays: 3 });
  assert.deepEqual(openStatus(HOURS, { day: 1, minutes: toMinutes('15:00') }), { open: false, opensAt: '12:00', inDays: 1 });
  assert.deepEqual(openStatus(HOURS, { day: 0, minutes: toMinutes('21:00') }), { open: false, opensAt: '12:00', inDays: 2 });
});

test('sin ningún día abierto', () => {
  assert.deepEqual(openStatus([{ day: 1, open: null, close: null }], { day: 1, minutes: 0 }), { open: false, opensAt: null, inDays: null });
});

test('localTime usa la zona horaria del local, no la del visitante', () => {
  // 2026-10-09 03:30 UTC = jueves 22:30 en Panamá (UTC-5)
  assert.deepEqual(localTime(new Date(Date.UTC(2026, 9, 9, 3, 30)), 'America/Panama'), { day: 4, minutes: 22 * 60 + 30 });
});
