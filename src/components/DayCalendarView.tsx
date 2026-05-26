import { courts, facilities, type Booking, type Court, type FacilityId } from '../data/facilities';
import { getBookingsForDate, toMinutes } from '../lib/availability';
import { getDayKey } from '../lib/date';
import type { CSSProperties } from 'react';

type DayCalendarViewProps = {
  facilityId: FacilityId;
  date: string;
};

const START = toMinutes('08:00');
const END = toMinutes('22:00');
const ROW_HEIGHT = 30;
const slots = Array.from({ length: (END - START) / 30 }, (_, index) => START + index * 30);
type CalendarBlock = {
  booking: Booking;
  court: Court;
  lane: number;
  laneCount: number;
  conflict: boolean;
};

function fromMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

function bookingColor(booking: Booking): string {
  if (booking.certainty === 'assumed-one-court' || booking.certainty === 'assumed-all-courts') {
    return 'border-amber-200/40 bg-amber-300/20 text-amber-50';
  }
  if (booking.source === 'screenshot' || booking.source === 'screenshot-series') {
    return 'border-sky-200/30 bg-sky-400/20 text-sky-50';
  }
  return 'border-court-lime/30 bg-court-lime/16 text-white';
}

function blocksOverlap(a: Booking, b: Booking): boolean {
  return toMinutes(a.start) < toMinutes(b.end) && toMinutes(b.start) < toMinutes(a.end);
}

function createCalendarBlocks(bookings: Booking[]): CalendarBlock[] {
  return courts.flatMap((court) => {
    const courtBookings = bookings
      .filter((booking) => booking.courts.includes(court))
      .sort((a, b) => toMinutes(a.start) - toMinutes(b.start) || toMinutes(a.end) - toMinutes(b.end));

    return courtBookings.map((booking) => {
      const overlapping = courtBookings.filter((other) => other.id !== booking.id && blocksOverlap(booking, other));
      const group = [booking, ...overlapping].sort((a, b) => toMinutes(a.start) - toMinutes(b.start) || a.id.localeCompare(b.id));
      const lane = group.findIndex((item) => item.id === booking.id);

      return {
        booking,
        court,
        lane: Math.max(0, lane),
        laneCount: Math.max(1, group.length),
        conflict: overlapping.length > 0,
      };
    });
  });
}

function bookingGridStyle(block: CalendarBlock): CSSProperties {
  const { booking, court, lane, laneCount } = block;
  const start = Math.max(START, toMinutes(booking.start));
  const end = Math.min(END, toMinutes(booking.end));
  const startRow = Math.floor((start - START) / 30) + 2;
  const span = Math.max(1, Math.ceil((end - start) / 30));
  const width = `${100 / laneCount}%`;
  const left = `${(lane * 100) / laneCount}%`;

  return {
    gridColumn: court + 1,
    gridRow: `${startRow} / span ${span}`,
    width,
    marginLeft: left,
  };
}

export function DayCalendarView({ facilityId, date }: DayCalendarViewProps) {
  const bookings = getBookingsForDate(facilityId, date, getDayKey(date));
  const calendarBlocks = createCalendarBlocks(bookings);

  return (
    <div className="rounded-lg border border-white/10 bg-black/20 p-3">
      <h3 className="text-base font-semibold text-white">{facilities[facilityId].name}</h3>
      <div className="mt-3 min-w-0 max-w-full overflow-x-auto overscroll-x-contain">
        <div
          className="relative grid w-[34rem] max-w-none rounded-lg border border-white/10 bg-court-950/80 text-xs"
          style={{
            gridTemplateColumns: '4.4rem repeat(3, minmax(8rem, 1fr))',
            gridTemplateRows: `2rem repeat(${slots.length}, ${ROW_HEIGHT}px)`,
          }}
        >
          <div className="sticky left-0 z-20 grid place-items-center border-b border-r border-white/10 bg-court-900 font-bold text-court-muted">
            Zeit
          </div>
          {courts.map((court) => (
            <div key={court} className="grid place-items-center border-b border-r border-white/10 bg-court-900 font-bold text-court-lime">
              P{court}
            </div>
          ))}

          {slots.map((slot, index) => (
            <div
              key={slot}
              className="sticky left-0 z-10 flex items-start justify-center border-r border-t border-white/10 bg-court-950 pt-1 text-[0.68rem] text-court-muted"
              style={{ gridColumn: 1, gridRow: index + 2 }}
            >
              {fromMinutes(slot)}
            </div>
          ))}

          {slots.map((slot, index) =>
            courts.map((court) => (
              <div
                key={`${slot}-${court}`}
                className="border-r border-t border-white/10"
                style={{ gridColumn: court + 1, gridRow: index + 2 }}
              />
            )),
          )}

          {calendarBlocks.map((block) => {
            const { booking, court } = block;
            return (
              <button
                key={`${booking.id}-${court}`}
                type="button"
                title={`${booking.title} (${booking.start}-${booking.end})`}
                className={`z-10 m-0.5 overflow-hidden rounded-md border px-1.5 py-1 text-left leading-tight shadow-sm ${bookingColor(booking)}`}
                style={bookingGridStyle(block)}
              >
                <span className="block text-[0.65rem] font-bold">
                  {booking.start}-{booking.end}
                </span>
                {block.conflict && <span className="mt-0.5 inline-block rounded bg-amber-200 px-1 text-[0.55rem] font-black uppercase text-court-950">Konflikt</span>}
                <span className="mt-0.5 line-clamp-3 block text-[0.68rem] font-semibold">{booking.title}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
