export type DayKey = 'mo' | 'di' | 'mi' | 'do' | 'fr' | 'sa' | 'so';

const DAY_KEYS: DayKey[] = ['so', 'mo', 'di', 'mi', 'do', 'fr', 'sa'];

export function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDays(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T12:00:00`);
  date.setDate(date.getDate() + days);
  return toIsoDate(date);
}

export function getDayKey(isoDate: string): DayKey {
  return DAY_KEYS[new Date(`${isoDate}T12:00:00`).getDay()]!;
}

export function formatDisplayDate(isoDate: string): string {
  return new Intl.DateTimeFormat('de-DE', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  }).format(new Date(`${isoDate}T12:00:00`));
}

export function formatRelativeDay(isoDate: string, todayIso = toIsoDate(new Date())): string {
  if (isoDate === todayIso) return 'heute';
  if (isoDate === addDays(todayIso, 1)) return 'morgen';

  return new Intl.DateTimeFormat('de-DE', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
  }).format(new Date(`${isoDate}T12:00:00`));
}
