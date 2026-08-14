import { addDays, format } from 'date-fns';

// Feriados nacionais brasileiros — fixos + móveis derivados da Páscoa
// (algoritmo de Meeus/Jones/Butcher). Sem dependência externa.

const FIXED_HOLIDAYS: Array<{ month: number; day: number; name: string }> = [
  { month: 1, day: 1, name: 'Confraternização Universal' },
  { month: 4, day: 21, name: 'Tiradentes' },
  { month: 5, day: 1, name: 'Dia do Trabalho' },
  { month: 9, day: 7, name: 'Independência do Brasil' },
  { month: 10, day: 12, name: 'Nossa Senhora Aparecida' },
  { month: 11, day: 2, name: 'Finados' },
  { month: 11, day: 15, name: 'Proclamação da República' },
  { month: 11, day: 20, name: 'Dia da Consciência Negra' },
  { month: 12, day: 25, name: 'Natal' },
];

function easterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

function holidaysOfYear(year: number): Map<string, string> {
  const map = new Map<string, string>();

  for (const { month, day, name } of FIXED_HOLIDAYS) {
    map.set(format(new Date(year, month - 1, day), 'yyyy-MM-dd'), name);
  }

  const easter = easterSunday(year);
  const movable: Array<{ offset: number; name: string }> = [
    { offset: -48, name: 'Carnaval (segunda)' },
    { offset: -47, name: 'Carnaval (terça)' },
    { offset: -2, name: 'Sexta-feira Santa' },
    { offset: 60, name: 'Corpus Christi' },
  ];

  for (const { offset, name } of movable) {
    map.set(format(addDays(easter, offset), 'yyyy-MM-dd'), name);
  }

  return map;
}

const cache = new Map<number, Map<string, string>>();

/** Retorna o nome do feriado nacional na data (ISO yyyy-MM-dd), ou null. */
export function getNationalHoliday(isoDate: string): string | null {
  const year = Number(isoDate.slice(0, 4));

  if (!cache.has(year)) {
    cache.set(year, holidaysOfYear(year));
  }

  return cache.get(year)!.get(isoDate) ?? null;
}
