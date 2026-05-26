import type { DayKey } from '../lib/date';
import { littfeldDatedEvents, littfeldRecurringEvents } from './littfeld-extra-events';

export type FacilityId = 'hilchenbach' | 'littfeld';
export type Court = 1 | 2 | 3;
export type CourtId = Court;

export type BookingSource = 'training-plan-image' | 'screenshot' | 'screenshot-series' | 'manual';
export type Certainty = 'high' | 'assumed-one-court' | 'assumed-all-courts' | 'needs-check';

export type Booking = {
  id: string;
  facilityId: FacilityId;
  title: string;
  date?: string;
  recurring?: {
    day: DayKey;
    startDate?: string;
    endDate?: string;
  };
  start: string;
  end: string;
  courts: Court[];
  source: BookingSource;
  certainty: Certainty;
  notes?: string;
};

type WeeklyBookings = Partial<Record<DayKey, Booking[]>>;

export type Facility = {
  id: FacilityId;
  name: string;
  planHours: Partial<Record<DayKey, { start: string; end: string }>>;
  weeklyBookings: WeeklyBookings;
  datedBookings?: Booking[];
  recurringBookings?: Booking[];
  notice: string;
};

const allCourts: Court[] = [1, 2, 3];

function trainingBooking(
  id: string,
  facilityId: FacilityId,
  title: string,
  start: string,
  end: string,
  courts: Court[],
): Booking {
  return {
    id,
    facilityId,
    title,
    start,
    end,
    courts,
    source: 'training-plan-image',
    certainty: 'high',
  };
}

export const facilities: Record<FacilityId, Facility> = {
  hilchenbach: {
    id: 'hilchenbach',
    name: 'Hilchenbach',
    planHours: {
      mo: { start: '15:00', end: '21:00' },
      di: { start: '15:00', end: '21:00' },
      mi: { start: '15:00', end: '21:00' },
      do: { start: '15:00', end: '21:00' },
      fr: { start: '15:00', end: '21:00' },
    },
    weeklyBookings: {
      mo: [
        trainingBooking('hilchenbach-mo-jugend-koeppe', 'hilchenbach', 'Jugend-Training M. Köppe', '15:00', '18:00', [1]),
        trainingBooking('hilchenbach-mo-herren-liebe', 'hilchenbach', 'Herren-Training H. Liebe', '18:00', '19:30', [1]),
      ],
      di: [trainingBooking('hilchenbach-di-damen', 'hilchenbach', 'Damen', '18:00', '19:30', [2, 3])],
      mi: [trainingBooking('hilchenbach-mi-herren', 'hilchenbach', 'Herren', '18:00', '19:30', [1, 2])],
      do: [trainingBooking('hilchenbach-do-mixed', 'hilchenbach', 'Mixed', '18:00', '19:30', [1, 2])],
    },
    notice: 'Hilchenbach: Trainingsplan-Bild 2026 hinterlegt. Zusätzliche Events bitte prüfen.',
  },
  littfeld: {
    id: 'littfeld',
    name: 'Littfeld',
    planHours: {
      mo: { start: '14:00', end: '21:00' },
      di: { start: '14:00', end: '21:00' },
      mi: { start: '14:00', end: '21:00' },
      do: { start: '14:00', end: '21:00' },
      fr: { start: '14:00', end: '21:00' },
      sa: { start: '09:00', end: '13:00' },
    },
    weeklyBookings: {
      mo: [
        trainingBooking('littfeld-mo-chiara-kinder', 'littfeld', 'Chiara Trainingsgruppen Kinder', '14:00', '17:00', [1]),
        trainingBooking('littfeld-mo-arno', 'littfeld', 'Arno Trainingsgruppen', '15:00', '18:30', [3]),
        trainingBooking('littfeld-mo-damen12-chiara', 'littfeld', 'Damen 1 & 2 Training bei Chiara', '17:00', '19:30', [1, 2]),
        trainingBooking('littfeld-mo-damen30', 'littfeld', 'Damen 30', '18:30', '20:00', [3]),
        trainingBooking('littfeld-mo-damen12', 'littfeld', 'Damen 1 & 2', '19:30', '20:30', [1, 2]),
      ],
      di: [
        trainingBooking('littfeld-di-chiara-kinder', 'littfeld', 'Chiara Trainingsgruppen Kinder', '14:00', '18:00', [1]),
        trainingBooking('littfeld-di-sonja-kinder', 'littfeld', 'Sonja Trainingsgruppen Kinder', '14:00', '18:00', [3]),
        trainingBooking('littfeld-di-chiara-jule-bree', 'littfeld', 'Chiara / Jule mit Jürgen Bree', '18:00', '19:30', [3]),
        trainingBooking('littfeld-di-damen40-bree-p12', 'littfeld', 'Damen 40 mit Jürgen Bree', '19:00', '20:30', [1, 2]),
        trainingBooking('littfeld-di-damen40-bree-p3', 'littfeld', 'Damen 40 mit Jürgen Bree', '19:30', '20:30', [3]),
      ],
      mi: [
        trainingBooking('littfeld-mi-chiara-kinder', 'littfeld', 'Chiara Trainingsgruppen Kinder', '15:00', '18:30', [1]),
        trainingBooking('littfeld-mi-michael-kinder', 'littfeld', 'Michael Trainingsgruppen Kinder', '15:00', '18:00', [3]),
        trainingBooking('littfeld-mi-herren-p23', 'littfeld', 'Herren 1 + 2, Herren 30, Herren 50', '18:00', '20:30', [2, 3]),
        trainingBooking('littfeld-mi-herren-p1', 'littfeld', 'Herren 1 + 2, Herren 30, Herren 50', '18:30', '20:30', [1]),
      ],
      do: [
        trainingBooking('littfeld-do-sonja-kinder', 'littfeld', 'Sonja Trainingsgruppen Kinder', '15:00', '18:30', [3]),
        trainingBooking('littfeld-do-chiara-kinder', 'littfeld', 'Chiara Trainingsgruppen Kinder', '16:00', '19:00', [1]),
        trainingBooking('littfeld-do-damen12', 'littfeld', 'Damen 1 + 2', '18:00', '21:00', [2]),
        trainingBooking('littfeld-do-damen30', 'littfeld', 'Damen 30', '18:30', '20:30', [3]),
        trainingBooking('littfeld-do-damen40', 'littfeld', 'Damen 40', '19:00', '20:30', [1]),
      ],
      fr: [
        trainingBooking('littfeld-fr-herren70', 'littfeld', 'Herren 70', '15:00', '17:00', [1]),
        trainingBooking('littfeld-fr-herren', 'littfeld', 'Herren 1 + 2, Herren 30, Herren 50', '17:00', '20:00', allCourts),
      ],
      sa: [
        trainingBooking('littfeld-sa-arno', 'littfeld', 'Arno Trainingsgruppen', '09:00', '13:00', [1]),
        trainingBooking('littfeld-sa-sonja-kinder', 'littfeld', 'Sonja Trainingsgruppen Kinder', '09:00', '13:00', [2]),
      ],
    },
    datedBookings: littfeldDatedEvents,
    recurringBookings: littfeldRecurringEvents,
    notice: 'Littfeld: Trainingsplan-Bild plus manuell übertragene Screenshot-Termine. Kurzfristige Änderungen bitte in der Team-App prüfen.',
  },
};

export const facilityIds: FacilityId[] = ['littfeld', 'hilchenbach'];
export const courts: Court[] = allCourts;
