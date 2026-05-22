import type { Booking } from './facilities';

const allCourts = [1, 2, 3] as const;

// Future maintenance:
// - Add HEIM events to littfeldDatedEvents as all-court blockers.
// - Add GAST events only to ignoredLittfeldEvents so they remain traceable but never block courts.
// - Add VMS / Vereinsmeisterschaft events as one-court blockers unless the source proves otherwise.
// - Mark every assumption through certainty and notes.
export const littfeldDatedEvents: Booking[] = [
  { id: 'littfeld-2026-05-22-kindelsberg-pfingstcup', facilityId: 'littfeld', date: '2026-05-22', start: '08:00', end: '22:00', courts: [...allCourts], title: 'Kindelsberg Pfingstcup 2026', source: 'screenshot', certainty: 'high' },
  { id: 'littfeld-2026-05-23-kindelsberg-pfingstcup', facilityId: 'littfeld', date: '2026-05-23', start: '08:00', end: '22:00', courts: [...allCourts], title: 'Kindelsberg Pfingstcup 2026', source: 'screenshot', certainty: 'high' },
  { id: 'littfeld-2026-05-24-kindelsberg-pfingstcup', facilityId: 'littfeld', date: '2026-05-24', start: '08:00', end: '22:00', courts: [...allCourts], title: 'Kindelsberg Pfingstcup 2026', source: 'screenshot', certainty: 'high' },
  { id: 'littfeld-2026-05-25-kindelsberg-pfingstcup', facilityId: 'littfeld', date: '2026-05-25', start: '08:00', end: '22:00', courts: [...allCourts], title: 'Kindelsberg Pfingstcup 2026', source: 'screenshot', certainty: 'high' },
  { id: 'littfeld-2026-05-26-vms-niklas-colin', facilityId: 'littfeld', date: '2026-05-26', start: '16:30', end: '17:30', courts: [1], title: 'Vereinsmeisterschaftsdoppel Niklas-Colin', source: 'screenshot', certainty: 'assumed-one-court', notes: 'Platzanzahl angenommen.' },
  { id: 'littfeld-2026-05-26-vms-viviane-frank', facilityId: 'littfeld', date: '2026-05-26', start: '19:00', end: '20:30', courts: [1], title: 'Vereinsmeisterschaftsdoppel Viviane-Frank', source: 'screenshot', certainty: 'assumed-one-court', notes: 'Platzanzahl angenommen.' },
  { id: 'littfeld-2026-05-29-vms-colin-patrick', facilityId: 'littfeld', date: '2026-05-29', start: '17:00', end: '18:00', courts: [1], title: 'VMS Colin vs Patrick', source: 'screenshot', certainty: 'assumed-one-court', notes: 'Platzanzahl angenommen.' },
  { id: 'littfeld-2026-06-01-vms-till-niklas', facilityId: 'littfeld', date: '2026-06-01', start: '18:30', end: '20:30', courts: [1], title: 'VMs Till vs Niklas', source: 'screenshot', certainty: 'assumed-one-court', notes: 'Platzanzahl angenommen.' },
  { id: 'littfeld-2026-06-03-vms-mixed-patrick-agnes', facilityId: 'littfeld', date: '2026-06-03', start: '16:30', end: '18:30', courts: [1], title: 'VMS Mixed Patrick & Agnes', source: 'screenshot', certainty: 'assumed-one-court', notes: 'Platzanzahl angenommen.' },
  { id: 'littfeld-2026-06-14-heim-tvl2-berleburg', facilityId: 'littfeld', date: '2026-06-14', start: '14:30', end: '18:30', courts: [...allCourts], title: 'HEIM TVL 2 vs. Bad Berleburg', source: 'screenshot', certainty: 'high', notes: 'Home match, blocks all courts.' },
  { id: 'littfeld-2026-06-21-heim-tvl2-unlinghausen', facilityId: 'littfeld', date: '2026-06-21', start: '14:30', end: '18:30', courts: [...allCourts], title: 'HEIM TVL 2 vs. Unlinghausen', source: 'screenshot', certainty: 'high', notes: 'Home match, blocks all courts.' },
  { id: 'littfeld-2026-06-28-heim-damen2-siegener-sc', facilityId: 'littfeld', date: '2026-06-28', start: '09:00', end: '14:00', courts: [...allCourts], title: 'HEIM TVL Damen 2 vs. Siegener SC', source: 'screenshot', certainty: 'high', notes: 'Home match, blocks all courts.' },
  { id: 'littfeld-2026-07-05-heim-tvl2-roenkhausen', facilityId: 'littfeld', date: '2026-07-05', start: '14:30', end: '18:30', courts: [...allCourts], title: 'HEIM TVL 2 vs. Rönkhausen', source: 'screenshot', certainty: 'high', notes: 'Home match, blocks all courts.' },
  { id: 'littfeld-2026-07-25-heim-mixed-warstein', facilityId: 'littfeld', date: '2026-07-25', start: '13:00', end: '18:00', courts: [...allCourts], title: 'HEIM TVL Mixed 1 vs. Warstein', source: 'screenshot', certainty: 'high', notes: 'Home match, blocks all courts.' },
  { id: 'littfeld-2026-08-25-tenniscamp', facilityId: 'littfeld', date: '2026-08-25', start: '08:00', end: '22:00', courts: [...allCourts], title: 'Tenniscamp', source: 'screenshot', certainty: 'assumed-all-courts', notes: 'Vollbelegung angenommen.' },
  { id: 'littfeld-2026-08-26-tenniscamp', facilityId: 'littfeld', date: '2026-08-26', start: '08:00', end: '22:00', courts: [...allCourts], title: 'Tenniscamp', source: 'screenshot', certainty: 'assumed-all-courts', notes: 'Vollbelegung angenommen.' },
  { id: 'littfeld-2026-08-27-tenniscamp', facilityId: 'littfeld', date: '2026-08-27', start: '08:00', end: '15:00', courts: [...allCourts], title: 'Tenniscamp', source: 'screenshot', certainty: 'assumed-all-courts', notes: 'Vollbelegung angenommen.' },
  { id: 'littfeld-2026-09-05-heim-mixed-siegen', facilityId: 'littfeld', date: '2026-09-05', start: '13:00', end: '18:00', courts: [...allCourts], title: 'HEIM TVL Mixed 1 vs. Siegen', source: 'screenshot', certainty: 'high', notes: 'Home match, blocks all courts.' },
];

export const littfeldRecurringEvents: Booking[] = [
  {
    id: 'littfeld-series-mi-herren-30-50',
    facilityId: 'littfeld',
    recurring: { day: 'mi', startDate: '2026-05-27', endDate: '2026-10-16' },
    start: '18:00',
    end: '21:00',
    courts: [...allCourts],
    title: 'Gemeinsames Training Herren / 30 / 50',
    source: 'screenshot-series',
    certainty: 'high',
  },
  {
    id: 'littfeld-series-fr-herren-30-50',
    facilityId: 'littfeld',
    recurring: { day: 'fr', startDate: '2026-05-27', endDate: '2026-10-16' },
    start: '17:00',
    end: '20:00',
    courts: [...allCourts],
    title: 'Gemeinsames Training Herren / 30 / 50',
    source: 'screenshot-series',
    certainty: 'high',
  },
];

export const ignoredLittfeldEvents = [
  { date: '2026-05-31', start: '09:00', end: '13:00', title: 'GAST TVL 2 in Siegen' },
  { date: '2026-05-31', start: '10:00', end: '15:00', title: 'GAST TVL Damen 2 in Unlinghausen' },
  { date: '2026-06-04', start: '11:00', end: '15:00', title: 'GAST TVL 2 in Thieringhausen' },
  { date: '2026-07-05', start: '10:00', end: '15:00', title: 'GAST TVL Damen 2 in Altenseelbach' },
  { date: '2026-08-08', start: '13:00', end: '18:00', title: 'GAST TVL Mixed 1 bei Lössel-Roden' },
  { date: '2026-08-15', start: '13:00', end: '18:00', title: 'GAST TVL Mixed 1 bei SG Hagen' },
];
