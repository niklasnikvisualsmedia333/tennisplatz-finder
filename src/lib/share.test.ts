import { describe, expect, it } from 'vitest';
import { analyzeAvailability } from './availability';
import { getDayKey } from './date';
import { createWhatsAppText, createWhatsAppUrl } from './share';

describe('share message', () => {
  it('uses heute for the current date', () => {
    const result = analyzeAvailability('hilchenbach', '2026-05-21', getDayKey('2026-05-21'), '18:00', 90, 'egal');

    expect(createWhatsAppText({ result, date: '2026-05-21', time: '18:00', duration: 90, todayIso: '2026-05-21' })).toContain(
      'heute',
    );
  });

  it('uses morgen for the next day', () => {
    const result = analyzeAvailability('hilchenbach', '2026-05-22', getDayKey('2026-05-22'), '16:00', 90, 'egal');

    expect(createWhatsAppText({ result, date: '2026-05-22', time: '16:00', duration: 90, todayIso: '2026-05-21' })).toContain(
      'morgen',
    );
  });

  it('mentions playable courts and the free run', () => {
    const result = analyzeAvailability('littfeld', '2026-05-26', getDayKey('2026-05-26'), '16:30', 60, 'egal');
    const text = createWhatsAppText({ result, date: '2026-05-26', time: '16:30', duration: 60, todayIso: '2026-05-21' });

    expect(text).toContain('2 Plätze frei');
    expect(text).toContain('P2 und P3');
    expect(text).toContain('von 16:30 bis 17:30');
    expect(text).toContain('sogar bis 22:00');
  });

  it('creates an encoded WhatsApp URL', () => {
    expect(createWhatsAppUrl('Hey, Platz frei')).toBe('https://wa.me/?text=Hey%2C%20Platz%20frei');
  });
});
