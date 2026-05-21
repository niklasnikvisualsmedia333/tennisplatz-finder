import type { DayKey } from '../lib/date';

export type CourtId = 'P1' | 'P2' | 'P3';
export type FacilityId = 'littfeld' | 'hilchenbach';
export type Certainty = 'high' | 'uncertain';

export type Booking = {
  id: string;
  title: string;
  start: string;
  end: string;
  courts: CourtId[];
  certainty: Certainty;
  source: 'pdf' | 'screenshot';
  note?: string;
};

type WeeklyBookings = Partial<Record<DayKey, Booking[]>>;

export type Facility = {
  id: FacilityId;
  name: string;
  planHours: Partial<Record<DayKey, { start: string; end: string }>>;
  weeklyBookings: WeeklyBookings;
  suspendedWeeklyDates?: string[];
  datedBookings?: Record<string, Booking[]>;
  recurringBookings?: Array<Booking & { from: string; to: string; dayKey: DayKey }>;
  notice: string;
};

const ALL_COURTS: CourtId[] = ['P1', 'P2', 'P3'];

export const facilities: Record<FacilityId, Facility> = {
  hilchenbach: {
    id: 'hilchenbach',
    name: 'Hilchenbach',
    planHours: {
      monday: { start: '15:00', end: '21:00' },
      tuesday: { start: '15:00', end: '21:00' },
      wednesday: { start: '15:00', end: '21:00' },
      thursday: { start: '15:00', end: '21:00' },
      friday: { start: '15:00', end: '21:00' },
    },
    weeklyBookings: {
      monday: [
        { id: 'h-mo-jugend', title: 'Jugend-Training M. Köppe', start: '15:00', end: '18:00', courts: ['P1'], certainty: 'high', source: 'pdf' },
        { id: 'h-mo-herren', title: 'Herren-Training H. Liebe', start: '18:00', end: '19:30', courts: ['P1'], certainty: 'high', source: 'pdf' },
      ],
      tuesday: [
        { id: 'h-tu-damen', title: 'Damen', start: '18:00', end: '20:00', courts: ['P2', 'P3'], certainty: 'high', source: 'pdf' },
      ],
      wednesday: [
        { id: 'h-we-herren', title: 'Herren', start: '18:00', end: '20:00', courts: ['P1', 'P2'], certainty: 'high', source: 'pdf' },
      ],
      thursday: [
        { id: 'h-th-mixed', title: 'Mixed', start: '18:00', end: '20:00', courts: ['P1', 'P2'], certainty: 'high', source: 'pdf' },
      ],
    },
    notice: 'Für Hilchenbach sind nur die PDF-Trainingszeiten hinterlegt. Zusätzliche Events oder Spieltage bitte selbst prüfen.',
  },
  littfeld: {
    id: 'littfeld',
    name: 'Littfeld',
    planHours: {
      monday: { start: '14:00', end: '21:00' },
      tuesday: { start: '14:00', end: '21:00' },
      wednesday: { start: '14:00', end: '21:00' },
      thursday: { start: '14:00', end: '21:00' },
      friday: { start: '14:00', end: '21:00' },
      saturday: { start: '09:00', end: '13:00' },
    },
    weeklyBookings: {
      monday: [
        { id: 'l-mo-chiara', title: 'Chiara Trainingsgruppen Kinder', start: '14:00', end: '17:00', courts: ['P1'], certainty: 'high', source: 'pdf' },
        { id: 'l-mo-arno', title: 'Arno Trainingsgruppen', start: '15:00', end: '18:30', courts: ['P3'], certainty: 'high', source: 'pdf' },
        { id: 'l-mo-damen-1', title: 'Damen 1 & 2 Training bei Chiara', start: '17:00', end: '19:30', courts: ['P1', 'P2'], certainty: 'high', source: 'pdf' },
        { id: 'l-mo-damen30', title: 'Damen 30', start: '18:30', end: '20:00', courts: ['P3'], certainty: 'high', source: 'pdf' },
        { id: 'l-mo-damen-2', title: 'Damen 1 & 2', start: '19:30', end: '20:30', courts: ['P1', 'P2'], certainty: 'high', source: 'pdf' },
      ],
      tuesday: [
        { id: 'l-tu-chiara', title: 'Chiara Trainingsgruppen Kinder', start: '14:00', end: '18:00', courts: ['P1'], certainty: 'high', source: 'pdf' },
        { id: 'l-tu-sonja', title: 'Sonja Trainingsgruppen Kinder', start: '14:00', end: '18:00', courts: ['P3'], certainty: 'high', source: 'pdf' },
        { id: 'l-tu-jule', title: 'Chiara / Jule mit Jürgen Bree', start: '18:00', end: '19:30', courts: ['P3'], certainty: 'high', source: 'pdf' },
        { id: 'l-tu-damen40-a', title: 'Damen 40 mit Jürgen Bree', start: '19:00', end: '20:30', courts: ['P1', 'P2'], certainty: 'high', source: 'pdf' },
        { id: 'l-tu-damen40-b', title: 'Damen 40 mit Jürgen Bree', start: '19:30', end: '20:30', courts: ['P3'], certainty: 'high', source: 'pdf' },
      ],
      wednesday: [
        { id: 'l-we-chiara', title: 'Chiara Trainingsgruppen Kinder', start: '15:00', end: '18:30', courts: ['P1'], certainty: 'high', source: 'pdf' },
        { id: 'l-we-michael', title: 'Michael Trainingsgruppen Kinder', start: '15:00', end: '18:00', courts: ['P3'], certainty: 'high', source: 'pdf' },
        { id: 'l-we-herren-a', title: 'Herren 1 + 2, Herren 30, Herren 50', start: '18:00', end: '20:30', courts: ['P2', 'P3'], certainty: 'high', source: 'pdf' },
        { id: 'l-we-herren-b', title: 'Herren 1 + 2, Herren 30, Herren 50', start: '18:30', end: '20:30', courts: ['P1'], certainty: 'high', source: 'pdf' },
      ],
      thursday: [
        { id: 'l-th-sonja', title: 'Sonja Trainingsgruppen Kinder', start: '15:00', end: '18:30', courts: ['P3'], certainty: 'high', source: 'pdf' },
        { id: 'l-th-chiara', title: 'Chiara Trainingsgruppen Kinder', start: '16:00', end: '19:00', courts: ['P1'], certainty: 'high', source: 'pdf' },
        { id: 'l-th-damen12', title: 'Damen 1 + 2', start: '18:00', end: '21:00', courts: ['P2'], certainty: 'high', source: 'pdf' },
        { id: 'l-th-damen30', title: 'Damen 30', start: '18:30', end: '20:30', courts: ['P3'], certainty: 'high', source: 'pdf' },
        { id: 'l-th-damen40', title: 'Damen 40', start: '19:00', end: '21:00', courts: ['P1'], certainty: 'high', source: 'pdf' },
      ],
      friday: [
        { id: 'l-fr-herren70', title: 'Herren 70', start: '15:00', end: '17:00', courts: ['P1'], certainty: 'high', source: 'pdf' },
        { id: 'l-fr-herren', title: 'Herren 1 + 2, Herren 30, Herren 50', start: '17:00', end: '20:00', courts: ALL_COURTS, certainty: 'high', source: 'pdf' },
      ],
      saturday: [
        { id: 'l-sa-arno', title: 'Arno Trainingsgruppen', start: '09:00', end: '13:00', courts: ['P1'], certainty: 'high', source: 'pdf' },
        { id: 'l-sa-sonja', title: 'Sonja Trainingsgruppen Kinder', start: '09:00', end: '13:00', courts: ['P2'], certainty: 'high', source: 'pdf' },
      ],
    },
    suspendedWeeklyDates: ['2026-05-26'],
    datedBookings: {
      '2026-05-22': [{ id: 'l-20260522-cup', title: 'Kindelsberg Pfingstcup', start: '08:00', end: '22:00', courts: ALL_COURTS, certainty: 'high', source: 'screenshot' }],
      '2026-05-23': [{ id: 'l-20260523-cup', title: 'Kindelsberg Pfingstcup', start: '08:00', end: '22:00', courts: ALL_COURTS, certainty: 'high', source: 'screenshot' }],
      '2026-05-24': [{ id: 'l-20260524-cup', title: 'Kindelsberg Pfingstcup', start: '08:00', end: '22:00', courts: ALL_COURTS, certainty: 'high', source: 'screenshot' }],
      '2026-05-25': [{ id: 'l-20260525-cup', title: 'Kindelsberg Pfingstcup', start: '08:00', end: '22:00', courts: ALL_COURTS, certainty: 'high', source: 'screenshot' }],
      '2026-05-26': [
        { id: 'l-20260526-niklas-colin', title: 'Vereinsmeisterschaft Doppel Niklas-Colin', start: '16:30', end: '17:30', courts: ['P1'], certainty: 'uncertain', source: 'screenshot', note: 'Platzanzahl angenommen' },
        { id: 'l-20260526-viviane-frank', title: 'Vereinsmeisterschaft Doppel Viviane-Frank', start: '19:00', end: '20:30', courts: ['P1'], certainty: 'uncertain', source: 'screenshot', note: 'Platzanzahl angenommen' },
      ],
      '2026-05-29': [{ id: 'l-20260529-colin-patrick', title: 'VMS Colin vs Patrick', start: '17:00', end: '18:00', courts: ['P1'], certainty: 'uncertain', source: 'screenshot', note: 'Platzanzahl angenommen' }],
      '2026-06-01': [{ id: 'l-20260601-till-niklas', title: 'VMs Till vs Niklas', start: '18:30', end: '20:30', courts: ['P1'], certainty: 'uncertain', source: 'screenshot', note: 'Platzanzahl angenommen' }],
      '2026-06-03': [{ id: 'l-20260603-mixed', title: 'VMS Mixed Patrick & Agnes', start: '16:30', end: '18:30', courts: ['P1'], certainty: 'uncertain', source: 'screenshot', note: 'Platzanzahl angenommen' }],
      '2026-06-14': [{ id: 'l-20260614-heim', title: 'HEIM TVL 2 vs. Bad Berleburg', start: '14:30', end: '18:30', courts: ALL_COURTS, certainty: 'high', source: 'screenshot' }],
      '2026-06-21': [{ id: 'l-20260621-heim', title: 'HEIM TVL 2 vs. Unlinghausen', start: '14:30', end: '18:30', courts: ALL_COURTS, certainty: 'high', source: 'screenshot' }],
      '2026-06-28': [{ id: 'l-20260628-heim-damen', title: 'HEIM TVL Damen 2 vs. Siegener SC', start: '09:00', end: '14:00', courts: ALL_COURTS, certainty: 'high', source: 'screenshot' }],
      '2026-07-05': [{ id: 'l-20260705-heim', title: 'HEIM TVL 2 vs. Rönkhausen', start: '14:30', end: '18:30', courts: ALL_COURTS, certainty: 'high', source: 'screenshot' }],
      '2026-07-25': [{ id: 'l-20260725-mixed', title: 'HEIM TVL Mixed 1 vs. Warstein', start: '13:00', end: '18:00', courts: ALL_COURTS, certainty: 'high', source: 'screenshot' }],
      '2026-08-25': [{ id: 'l-20260825-camp', title: 'Tenniscamp', start: '08:00', end: '22:00', courts: ALL_COURTS, certainty: 'uncertain', source: 'screenshot', note: 'Vollbelegung angenommen' }],
      '2026-08-26': [{ id: 'l-20260826-camp', title: 'Tenniscamp', start: '08:00', end: '22:00', courts: ALL_COURTS, certainty: 'uncertain', source: 'screenshot', note: 'Vollbelegung angenommen' }],
      '2026-08-27': [{ id: 'l-20260827-camp', title: 'Tenniscamp', start: '08:00', end: '15:00', courts: ALL_COURTS, certainty: 'uncertain', source: 'screenshot', note: 'Vollbelegung angenommen' }],
      '2026-09-05': [{ id: 'l-20260905-mixed', title: 'HEIM TVL Mixed 1 vs. Siegen', start: '13:00', end: '18:00', courts: ALL_COURTS, certainty: 'high', source: 'screenshot' }],
    },
    recurringBookings: [
      { id: 'l-season-wed-herren', title: 'Gemeinsames Training Herren / 30 / 50', start: '18:00', end: '21:00', courts: ALL_COURTS, certainty: 'high', source: 'screenshot', from: '2026-05-27', to: '2026-10-16', dayKey: 'wednesday' },
      { id: 'l-season-fri-herren', title: 'Gemeinsames Training Herren / 30 / 50', start: '17:00', end: '20:00', courts: ALL_COURTS, certainty: 'high', source: 'screenshot', from: '2026-05-27', to: '2026-10-16', dayKey: 'friday' },
    ],
    notice: 'Littfeld enthält zusätzlich Termine aus Screenshots. Trotzdem bitte vor dem Losfahren in der Kalender-/Team-App gegenprüfen.',
  },
};

export const facilityIds: FacilityId[] = ['littfeld', 'hilchenbach'];
export const courts: CourtId[] = ['P1', 'P2', 'P3'];
