import { describe, expect, it } from 'vitest';
import { analyzeAvailability, fromMinutes, overlaps, toMinutes } from './availability';
import { getDayKey } from './date';

describe('availability logic', () => {
  it('converts 18:30 to 1110 minutes', () => {
    expect(toMinutes('18:30')).toBe(1110);
  });

  it('converts 1110 minutes to 18:30', () => {
    expect(fromMinutes(1110)).toBe('18:30');
  });

  it('detects overlapping intervals', () => {
    expect(overlaps(toMinutes('10:00'), toMinutes('11:00'), toMinutes('10:30'), toMinutes('11:30'))).toBe(true);
  });

  it('does not overlap touching intervals', () => {
    expect(overlaps(toMinutes('10:00'), toMinutes('11:00'), toMinutes('11:00'), toMinutes('12:00'))).toBe(false);
  });

  it('leaves 2 playable courts in Hilchenbach Monday 15:30 for 60 minutes', () => {
    const result = analyzeAvailability('hilchenbach', '2026-05-25', getDayKey('2026-05-25'), '15:30', 60, 'egal');
    expect(result.playableCourts).toHaveLength(2);
  });

  it('blocks all courts for Littfeld Kindelsberg Cup', () => {
    const result = analyzeAvailability('littfeld', '2026-05-23', getDayKey('2026-05-23'), '14:00', 60, 'egal');
    expect(result.playable).toBe(false);
  });

  it('blocks all courts for Littfeld home match on 2026-09-05', () => {
    const result = analyzeAvailability('littfeld', '2026-09-05', getDayKey('2026-09-05'), '14:00', 60, 'egal');
    expect(result.playable).toBe(false);
  });

  it('blocks one court for Littfeld VMS and leaves two playable courts', () => {
    const result = analyzeAvailability('littfeld', '2026-05-26', getDayKey('2026-05-26'), '16:30', 60, 'egal');
    expect(result.occupiedCourts).toEqual(['P1']);
    expect(result.playableCourts).toHaveLength(2);
  });

  it('marks Littfeld Friday 21:30 for 60 minutes invalid', () => {
    const result = analyzeAvailability('littfeld', '2026-05-29', getDayKey('2026-05-29'), '21:30', 60, 'egal');
    expect(result.invalid).toBe(true);
    expect(result.playable).toBe(false);
  });

  it('blocks Littfeld Wednesday seasonal Herren training', () => {
    const result = analyzeAvailability('littfeld', '2026-10-14', getDayKey('2026-10-14'), '18:30', 60, 'egal');
    expect(result.playable).toBe(false);
  });

  it('blocks Littfeld Sunday home match', () => {
    const result = analyzeAvailability('littfeld', '2026-06-14', getDayKey('2026-06-14'), '15:00', 60, 'egal');
    expect(result.playable).toBe(false);
  });

  it('allows Hilchenbach Friday 16:00 for 90 minutes', () => {
    const result = analyzeAvailability('hilchenbach', '2026-05-29', getDayKey('2026-05-29'), '16:00', 90, 'egal');
    expect(result.playable).toBe(true);
  });
});
