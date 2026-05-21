import { courts, facilities, facilityIds, type Booking, type CourtId, type FacilityId } from '../data/facilities';
import { addDays, getDayKey, type DayKey } from './date';

export type SelectedCourt = CourtId | 'egal';

export type CourtResult = {
  court: CourtId;
  free: boolean;
  blockers: Booking[];
  nextBooking?: Booking;
  freeUntil: number;
  detail: string;
};

export type AvailabilityResult = {
  facilityId: FacilityId;
  facilityName: string;
  playable: boolean;
  invalid: boolean;
  reason?: string;
  playableCourts: CourtId[];
  occupiedCourts: CourtId[];
  courtResults: CourtResult[];
  longestRun?: { court: CourtId; until: string; minutes: number };
  bookings: Booking[];
  hasUncertainBooking: boolean;
};

export type Slot = {
  facilityId: FacilityId;
  facilityName: string;
  date: string;
  time: string;
  courts: CourtId[];
};

export function toMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return (hours ?? 0) * 60 + (minutes ?? 0);
}

export function fromMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

export function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart < bEnd && bStart < aEnd;
}

function isWithinInclusive(date: string, from: string, to: string): boolean {
  return date >= from && date <= to;
}

export function getBookingsForDate(facilityId: FacilityId, date: string, dayKey: DayKey = getDayKey(date)): Booking[] {
  const facility = facilities[facilityId];
  const weekly = facility.suspendedWeeklyDates?.includes(date) ? [] : (facility.weeklyBookings[dayKey] ?? []);
  const dated = facility.datedBookings?.[date] ?? [];
  const recurring =
    facility.recurringBookings
      ?.filter((booking) => booking.dayKey === dayKey && isWithinInclusive(date, booking.from, booking.to))
      .map(({ from: _from, to: _to, dayKey: _dayKey, ...booking }) => booking) ?? [];

  return [...weekly, ...dated, ...recurring].sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
}

function nextBookingForCourt(bookings: Booking[], court: CourtId, requestEnd: number): Booking | undefined {
  return bookings
    .filter((booking) => booking.courts.includes(court) && toMinutes(booking.start) >= requestEnd)
    .sort((a, b) => toMinutes(a.start) - toMinutes(b.start))[0];
}

function freeUntilForCourt(bookings: Booking[], court: CourtId, requestStart: number): number {
  const next = bookings
    .filter((booking) => booking.courts.includes(court) && toMinutes(booking.start) >= requestStart)
    .sort((a, b) => toMinutes(a.start) - toMinutes(b.start))[0];
  return next ? toMinutes(next.start) : toMinutes('22:00');
}

function courtDetail(court: CourtId, blockers: Booking[], nextBooking: Booking | undefined, freeUntil: number): string {
  if (blockers.length > 0) {
    return blockers.map((booking) => `Belegt durch ${booking.title} (${booking.start}-${booking.end})`).join('\n');
  }

  if (nextBooking) {
    return `Jetzt frei. Nächste Belegung ab ${nextBooking.start}: ${nextBooking.title}`;
  }

  return `Jetzt frei bis ${fromMinutes(freeUntil)}. Keine weitere hinterlegte Belegung.`;
}

export function analyzeAvailability(
  facilityId: FacilityId,
  date: string,
  dayKey: DayKey = getDayKey(date),
  time = '18:00',
  duration = 60,
  selectedCourt: SelectedCourt = 'egal',
): AvailabilityResult {
  const facility = facilities[facilityId];
  const requestStart = toMinutes(time);
  const requestEnd = requestStart + duration;
  const bookings = getBookingsForDate(facilityId, date, dayKey);
  const relevantCourts = selectedCourt === 'egal' ? courts : [selectedCourt];
  const invalid = requestStart < toMinutes('08:00') || requestEnd > toMinutes('22:00');

  const courtResults = courts.map((court) => {
    const blockers = invalid
      ? []
      : bookings.filter((booking) => booking.courts.includes(court) && overlaps(requestStart, requestEnd, toMinutes(booking.start), toMinutes(booking.end)));
    const nextBooking = nextBookingForCourt(bookings, court, requestEnd);
    const freeUntil = blockers.length > 0 ? requestStart : freeUntilForCourt(bookings, court, requestStart);
    return {
      court,
      free: !invalid && blockers.length === 0,
      blockers,
      nextBooking,
      freeUntil,
      detail: courtDetail(court, blockers, nextBooking, freeUntil),
    };
  });

  const playableCourts = courtResults.filter((result) => relevantCourts.includes(result.court) && result.free).map((result) => result.court);
  const occupiedCourts = courtResults.filter((result) => !result.free).map((result) => result.court);
  const longest = courtResults
    .filter((result) => result.free)
    .sort((a, b) => b.freeUntil - a.freeUntil)[0];

  return {
    facilityId,
    facilityName: facility.name,
    playable: !invalid && playableCourts.length > 0,
    invalid,
    reason: invalid ? 'Die gewählte Dauer passt nicht vollständig in das Zeitfenster 08:00-22:00.' : undefined,
    playableCourts,
    occupiedCourts,
    courtResults,
    longestRun: longest ? { court: longest.court, until: fromMinutes(longest.freeUntil), minutes: Math.max(0, longest.freeUntil - requestStart) } : undefined,
    bookings,
    hasUncertainBooking: bookings.some((booking) => booking.certainty === 'uncertain'),
  };
}

export function rankResults(results: AvailabilityResult[]): AvailabilityResult[] {
  return [...results].sort((a, b) => {
    if (a.playable !== b.playable) return a.playable ? -1 : 1;
    if (a.playableCourts.length !== b.playableCourts.length) return b.playableCourts.length - a.playableCourts.length;
    const aRun = a.longestRun?.minutes ?? 0;
    const bRun = b.longestRun?.minutes ?? 0;
    if (aRun !== bRun) return bRun - aRun;
    return a.occupiedCourts.length - b.occupiedCourts.length;
  });
}

export function getNextSlots(
  scope: FacilityId[] | 'all',
  date: string,
  duration: number,
  selectedCourt: SelectedCourt,
): Slot[] {
  const ids = scope === 'all' ? facilityIds : scope;
  const slots: Slot[] = [];

  for (let dayOffset = 0; dayOffset < 8 && slots.length < 8; dayOffset += 1) {
    const slotDate = addDays(date, dayOffset);
    for (let minutes = toMinutes('08:00'); minutes + duration <= toMinutes('22:00'); minutes += 30) {
      const time = fromMinutes(minutes);
      ids.forEach((facilityId) => {
        const result = analyzeAvailability(facilityId, slotDate, getDayKey(slotDate), time, duration, selectedCourt);
        if (result.playable) {
          slots.push({
            facilityId,
            facilityName: result.facilityName,
            date: slotDate,
            time,
            courts: result.playableCourts,
          });
        }
      });
      if (slots.length >= 8) break;
    }
  }

  return slots.slice(0, 8);
}

export function getNextSlotsInWindow(
  scope: FacilityId[] | 'all',
  date: string,
  earliestTime: string,
  latestStartTime: string,
  duration: number,
): Slot[] {
  const ids = scope === 'all' ? facilityIds : scope;
  const slots: Slot[] = [];
  const earliest = toMinutes(earliestTime);
  const latest = Math.max(earliest, toMinutes(latestStartTime));

  for (let dayOffset = 0; dayOffset < 8 && slots.length < 8; dayOffset += 1) {
    const slotDate = addDays(date, dayOffset);
    for (let minutes = earliest; minutes <= latest && minutes + duration <= toMinutes('22:00'); minutes += 30) {
      const time = fromMinutes(minutes);
      ids.forEach((facilityId) => {
        const result = analyzeAvailability(facilityId, slotDate, getDayKey(slotDate), time, duration, 'egal');
        if (result.playable) {
          slots.push({
            facilityId,
            facilityName: result.facilityName,
            date: slotDate,
            time,
            courts: result.playableCourts,
          });
        }
      });
      if (slots.length >= 8) break;
    }
  }

  return slots.slice(0, 8);
}
