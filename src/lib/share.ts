import { fromMinutes, toMinutes, type AvailabilityResult } from './availability';
import { formatRelativeDay } from './date';

type ShareMessageInput = {
  result?: AvailabilityResult;
  date: string;
  time: string;
  duration: number;
  todayIso?: string;
};

function pluralizeCourt(count: number): string {
  if (count === 1) return 'ein Platz';
  if (count === 3) return 'alle 3 Plätze';
  return `${count} Plätze`;
}

function formatCourtList(courts: string[]): string {
  if (courts.length === 0) return '';
  if (courts.length === 1) return courts[0]!;
  if (courts.length === 2) return courts.join(' und ');
  return `${courts.slice(0, -1).join(', ')} und ${courts[courts.length - 1]}`;
}

export function createWhatsAppText({ result, date, time, duration, todayIso }: ShareMessageInput): string {
  const day = formatRelativeDay(date, todayIso);

  if (!result || !result.playable) {
    return `Hey, ich hab gerade geschaut: ${day} ab ${time} ist leider kein voller ${duration}-Minuten-Slot frei.`;
  }

  const slotEnd = fromMinutes(toMinutes(time) + duration);
  const longestUntil = result.longestRun?.until;
  const courts = formatCourtList(result.playableCourts);
  const courtSummary = pluralizeCourt(result.playableCourts.length);
  const courtText = courts ? ` (${courts})` : '';
  const longestText = longestUntil && longestUntil !== slotEnd ? ` Laut Plan sogar bis ${longestUntil}.` : '';

  return `Hey, ${day} wäre in ${result.facilityName} von ${time} bis ${slotEnd} ${courtSummary} frei${courtText}.${longestText}`;
}

export function createWhatsAppUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
