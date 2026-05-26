import { describe, expect, it } from 'vitest';
import { facilities, facilityIds } from '../data/facilities';
import { analyzeAvailability, fromMinutes, getBookingsForDate, getNextSlotsInWindow, overlaps, toMinutes } from './availability';
import { getDayKey } from './date';

function expectCourts(actual: number[], expected: number[]) {
  expect(actual.sort()).toEqual(expected.sort());
}

function result(facilityId: 'hilchenbach' | 'littfeld', date: string, time: string, duration = 60) {
  return analyzeAvailability(facilityId, date, getDayKey(date), time, duration, 'egal');
}

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

  it('leaves P2 and P3 playable in Hilchenbach Monday 15:30 for 60 minutes', () => {
    expectCourts(result('hilchenbach', '2026-05-25', '15:30').playableCourts, [2, 3]);
  });

  it('leaves P2 and P3 playable in Hilchenbach Monday 18:00 for 60 minutes', () => {
    expectCourts(result('hilchenbach', '2026-05-25', '18:00').playableCourts, [2, 3]);
  });

  it('leaves only P1 playable in Hilchenbach Tuesday 18:30 for 60 minutes', () => {
    expectCourts(result('hilchenbach', '2026-05-26', '18:30').playableCourts, [1]);
  });

  it('frees all courts in Hilchenbach Tuesday at 19:30 after Damen ends', () => {
    expectCourts(result('hilchenbach', '2026-05-26', '19:30').playableCourts, [1, 2, 3]);
  });

  it('leaves only P3 playable in Hilchenbach Wednesday 18:30 for 60 minutes', () => {
    expectCourts(result('hilchenbach', '2026-05-27', '18:30').playableCourts, [3]);
  });

  it('frees all courts in Hilchenbach Wednesday at 19:30 after Herren ends', () => {
    expectCourts(result('hilchenbach', '2026-05-27', '19:30').playableCourts, [1, 2, 3]);
  });

  it('leaves only P3 playable in Hilchenbach Thursday 18:30 for 60 minutes', () => {
    expectCourts(result('hilchenbach', '2026-05-28', '18:30').playableCourts, [3]);
  });

  it('frees all courts in Hilchenbach Thursday at 19:30 after Mixed ends', () => {
    expectCourts(result('hilchenbach', '2026-05-28', '19:30').playableCourts, [1, 2, 3]);
  });

  it('allows Hilchenbach Friday 16:00 for 90 minutes on all courts', () => {
    expectCourts(result('hilchenbach', '2026-05-29', '16:00', 90).playableCourts, [1, 2, 3]);
  });

  it('leaves only P2 playable in Littfeld Monday 14:30 for 60 minutes', () => {
    expectCourts(result('littfeld', '2026-06-01', '14:30').playableCourts, [2]);
  });

  it('blocks all Littfeld courts Monday 17:30 for 60 minutes', () => {
    expect(result('littfeld', '2026-06-01', '17:30').playableCourts).toHaveLength(0);
  });

  it('leaves only P3 playable in Littfeld Monday 20:00 for 60 minutes', () => {
    expectCourts(result('littfeld', '2026-06-01', '20:00').playableCourts, [3]);
  });

  it('leaves P1 and P2 playable in Littfeld Tuesday 18:00 for 60 minutes', () => {
    expectCourts(result('littfeld', '2026-06-02', '18:00').playableCourts, [1, 2]);
  });

  it('blocks all Littfeld courts Tuesday 19:00 for 60 minutes', () => {
    expect(result('littfeld', '2026-06-02', '19:00').playableCourts).toHaveLength(0);
  });

  it('frees all Littfeld courts Tuesday 20:30 for 60 minutes', () => {
    expectCourts(result('littfeld', '2026-06-02', '20:30').playableCourts, [1, 2, 3]);
  });

  it('blocks all Littfeld courts Wednesday 18:00 for 60 minutes', () => {
    expect(result('littfeld', '2026-06-10', '18:00').playableCourts).toHaveLength(0);
  });

  it('frees all Littfeld courts Wednesday 20:30 for 60 minutes', () => {
    expectCourts(result('littfeld', '2026-05-20', '20:30').playableCourts, [1, 2, 3]);
  });

  it('blocks all Littfeld courts Thursday 18:30 for 60 minutes', () => {
    expect(result('littfeld', '2026-06-04', '18:30').playableCourts).toHaveLength(0);
  });

  it('blocks all Littfeld courts Thursday 20:00 for 60 minutes', () => {
    expect(result('littfeld', '2026-06-04', '20:00').playableCourts).toHaveLength(0);
  });

  it('leaves P1 and P3 playable in Littfeld Thursday 20:30 for 60 minutes', () => {
    expectCourts(result('littfeld', '2026-06-04', '20:30').playableCourts, [1, 3]);
  });

  it('frees all Littfeld courts Thursday 21:00 for 60 minutes', () => {
    expectCourts(result('littfeld', '2026-06-04', '21:00').playableCourts, [1, 2, 3]);
  });

  it('leaves P2 and P3 playable in Littfeld Friday 16:00 for 60 minutes', () => {
    expectCourts(result('littfeld', '2026-06-05', '16:00').playableCourts, [2, 3]);
  });

  it('blocks all Littfeld courts Friday 17:00 for 60 minutes', () => {
    expect(result('littfeld', '2026-06-05', '17:00').playableCourts).toHaveLength(0);
  });

  it('frees all Littfeld courts Friday 20:00 for 60 minutes', () => {
    expectCourts(result('littfeld', '2026-06-12', '20:00').playableCourts, [1, 2, 3]);
  });

  it('leaves only P3 playable in Littfeld Saturday 10:00 for 60 minutes', () => {
    expectCourts(result('littfeld', '2026-06-06', '10:00').playableCourts, [3]);
  });

  it('frees all Littfeld courts Saturday 13:00 for 60 minutes', () => {
    expectCourts(result('littfeld', '2026-06-06', '13:00').playableCourts, [1, 2, 3]);
  });

  it('frees all Littfeld courts Sunday 15:00 for 60 minutes when no dated event blocks it', () => {
    expectCourts(result('littfeld', '2026-06-07', '15:00').playableCourts, [1, 2, 3]);
  });

  it('blocks all courts for Littfeld Kindelsberg Cup', () => {
    expect(result('littfeld', '2026-05-23', '14:00').playableCourts).toHaveLength(0);
  });

  it('blocks one assumed VMS court and leaves two playable courts on 2026-05-26', () => {
    const availability = result('littfeld', '2026-05-26', '16:30');
    expectCourts(availability.occupiedCourts, [1]);
    expectCourts(availability.playableCourts, [2, 3]);
  });

  it('blocks all courts for Littfeld home match against Bad Berleburg', () => {
    expect(result('littfeld', '2026-06-14', '15:00').playableCourts).toHaveLength(0);
  });

  it('blocks all courts for Littfeld home mixed match against Warstein', () => {
    expect(result('littfeld', '2026-07-25', '14:00').playableCourts).toHaveLength(0);
  });

  it('blocks all courts for Littfeld Tenniscamp on 2026-08-25', () => {
    expect(result('littfeld', '2026-08-25', '10:00').playableCourts).toHaveLength(0);
  });

  it('does not let Tenniscamp block Littfeld after 15:00 on 2026-08-27', () => {
    const availability = result('littfeld', '2026-08-27', '16:00');
    const blockerTitles = availability.courtResults.flatMap((court) => court.blockers.map((booking) => booking.title));
    expect(blockerTitles).not.toContain('Tenniscamp');
    expectCourts(availability.playableCourts, [2]);
  });

  it('blocks all courts for Littfeld home mixed match against Siegen', () => {
    expect(result('littfeld', '2026-09-05', '14:00').playableCourts).toHaveLength(0);
  });

  it('blocks recurring Wednesday Herren training on 2026-05-27', () => {
    expect(result('littfeld', '2026-05-27', '18:30').playableCourts).toHaveLength(0);
  });

  it('blocks recurring Friday Herren training on 2026-06-05', () => {
    expect(result('littfeld', '2026-06-05', '17:30').playableCourts).toHaveLength(0);
  });

  it('blocks recurring Wednesday Herren training on 2026-10-14', () => {
    expect(result('littfeld', '2026-10-14', '18:30').playableCourts).toHaveLength(0);
  });

  it('blocks recurring Friday Herren training on 2026-10-16', () => {
    expect(result('littfeld', '2026-10-16', '17:30').playableCourts).toHaveLength(0);
  });

  it('marks 21:30 + 60 minutes invalid', () => {
    const availability = result('littfeld', '2026-05-29', '21:30');
    expect(availability.invalid).toBe(true);
    expect(availability.playable).toBe(false);
  });

  it('finds next slots inside a preferred time window', () => {
    const slots = getNextSlotsInWindow(['hilchenbach'], '2026-05-29', '16:00', '19:00', 90);

    expect(slots[0]).toMatchObject({
      facilityId: 'hilchenbach',
      date: '2026-05-29',
      time: '16:00',
    });
  });

  it('treats the second window time as latest finish, not latest start', () => {
    const slots = getNextSlotsInWindow(['hilchenbach'], '2026-05-29', '18:00', '19:00', 90);

    expect(slots.some((slot) => slot.date === '2026-05-29' && slot.time === '18:00')).toBe(false);
  });

  it('keeps all booking data complete and free of old PDF source labels', () => {
    const allBookings = facilityIds.flatMap((facilityId) => {
      const facility = facilities[facilityId];
      return [
        ...Object.values(facility.weeklyBookings).flat(),
        ...(facility.datedBookings ?? []),
        ...(facility.recurringBookings ?? []),
      ];
    });

    allBookings.forEach((booking) => {
      expect(booking.id).toBeTruthy();
      expect(booking.facilityId).toBeTruthy();
      expect(booking.title).toBeTruthy();
      expect(booking.start).toBeTruthy();
      expect(booking.end).toBeTruthy();
      expect(booking.courts.length).toBeGreaterThan(0);
      booking.courts.forEach((court) => expect([1, 2, 3]).toContain(court));
      expect(toMinutes(booking.start)).toBeLessThan(toMinutes(booking.end));
      expect(booking.source).not.toBe('PDF');
      expect(booking.source).not.toBe('pdf');
    });
  });

  it('marks every weekly training-plan booking as training-plan-image with a title', () => {
    const weeklyBookings = facilityIds.flatMap((facilityId) => Object.values(facilities[facilityId].weeklyBookings).flat());

    weeklyBookings.forEach((booking) => {
      expect(booking.source).toBe('training-plan-image');
      expect(booking.title.trim()).not.toBe('');
    });
  });

  it('returns recurring screenshot-series bookings on every required Wednesday and Friday', () => {
    const sampleDates = ['2026-05-27', '2026-06-05', '2026-07-15', '2026-08-28', '2026-09-30', '2026-10-16'];

    sampleDates.forEach((date) => {
      const bookings = getBookingsForDate('littfeld', date);
      expect(bookings.some((booking) => booking.source === 'screenshot-series')).toBe(true);
    });
  });
});
