import { useMemo, useState, type ReactNode } from 'react';
import { courts, facilities, facilityIds, type CourtId, type FacilityId } from './data/facilities';
import {
  analyzeAvailability,
  fromMinutes,
  getNextSlots,
  rankResults,
  toMinutes,
  type AvailabilityResult,
  type SelectedCourt,
} from './lib/availability';
import { addDays, formatDisplayDate, getDayKey, toIsoDate } from './lib/date';
import { createWhatsAppText, createWhatsAppUrl } from './lib/share';

type Scope = 'all' | FacilityId;

const times = Array.from({ length: 29 }, (_, index) => fromMinutes(toMinutes('08:00') + index * 30));
const quickTimes = ['14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'];
const durations = [60, 90, 120] as const;

const baseNotice =
  'Datenbasis: Trainingspläne plus manuell übertragene Termine. Kurzfristige Änderungen, private Buchungen, Wetter, Sperrungen und Verschiebungen bitte selbst prüfen.';

function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

function scopeToFacilityIds(scope: Scope): FacilityId[] {
  return scope === 'all' ? facilityIds : [scope];
}

function StepLabel({ number, children }: { number: number; children: string }) {
  return (
    <div className="flex items-center gap-2 text-sm font-medium text-court-muted">
      <span className="grid h-6 w-6 place-items-center rounded-full border border-court-lime/40 text-xs text-court-lime">
        {number}
      </span>
      {children}
    </div>
  );
}

function ChoiceButton({
  active,
  children,
  onClick,
  compact = false,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        'focus-ring min-h-12 rounded-lg border px-4 text-sm font-semibold transition',
        compact && 'min-h-10 px-3',
        active
          ? 'border-court-lime bg-court-lime text-court-950 shadow-lime'
          : 'border-white/10 bg-white/[0.04] text-white hover:border-court-lime/60',
      )}
    >
      {children}
    </button>
  );
}

function CourtButton({
  result,
  expanded,
  onClick,
}: {
  result: AvailabilityResult['courtResults'][number];
  expanded: boolean;
  onClick: () => void;
}) {
  return (
    <div>
      <button
        type="button"
        onClick={onClick}
        className={cx(
          'focus-ring flex min-h-12 w-full items-center justify-between rounded-lg border px-3 text-left text-sm transition',
          result.free ? 'border-court-lime/45 bg-court-lime/10' : 'border-rose-300/30 bg-rose-400/10',
        )}
      >
        <span className="font-semibold">{result.court}</span>
        <span className={cx('text-xs font-semibold', result.free ? 'text-court-lime' : 'text-rose-200')}>
          {result.free ? 'frei' : 'belegt'}
        </span>
      </button>
      {expanded && (
        <p className="mt-2 whitespace-pre-line rounded-lg border border-white/10 bg-black/20 p-3 text-xs leading-relaxed text-court-muted">
          {result.detail}
        </p>
      )}
    </div>
  );
}

function FacilityCard({ result }: { result: AvailabilityResult }) {
  const [openCourt, setOpenCourt] = useState<CourtId | null>(null);

  return (
    <article className="rounded-lg border border-white/10 bg-white/[0.045] p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">{result.facilityName}</h2>
          <p className="mt-1 text-sm text-court-muted">
            {result.invalid
              ? 'Kein voller Slot'
              : result.playable
                ? `${result.playableCourts.join(', ')} frei`
                : 'Alle passenden Plätze belegt'}
          </p>
        </div>
        <span
          className={cx(
            'rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide',
            result.playable ? 'bg-court-lime text-court-950' : 'bg-rose-300/15 text-rose-100',
          )}
        >
          {result.playable ? 'frei' : 'belegt'}
        </span>
      </div>

      {result.reason && <p className="mt-3 rounded-lg bg-amber-200/10 p-3 text-sm text-amber-100">{result.reason}</p>}

      <div className="mt-4 grid grid-cols-3 gap-2">
        {result.courtResults.map((courtResult) => (
          <CourtButton
            key={courtResult.court}
            result={courtResult}
            expanded={openCourt === courtResult.court}
            onClick={() => setOpenCourt(openCourt === courtResult.court ? null : courtResult.court)}
          />
        ))}
      </div>

      {result.longestRun && (
        <p className="mt-4 text-sm text-court-muted">
          Längster Lauf:{' '}
          <span className="font-semibold text-white">
            {result.longestRun.court} bis {result.longestRun.until}
          </span>
        </p>
      )}
    </article>
  );
}

function Details({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
      <summary className="focus-ring flex cursor-pointer list-none items-center justify-between rounded-md text-sm font-semibold">
        {title}
        <span className="text-court-lime">+</span>
      </summary>
      <div className="mt-3 text-sm text-court-muted">{children}</div>
    </details>
  );
}

async function writeClipboardText(text: string): Promise<boolean> {
  const nav = navigator as Navigator & {
    clipboard?: Clipboard;
  };

  try {
    if (nav.clipboard?.writeText) {
      await nav.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall through to the textarea fallback for browsers with stricter permissions.
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', 'true');
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();

  try {
    return document.execCommand('copy');
  } finally {
    document.body.removeChild(textarea);
  }
}

function SharePanel({
  message,
  whatsAppUrl,
  onCopy,
  copied,
}: {
  message: string;
  whatsAppUrl: string;
  onCopy: () => void;
  copied: boolean;
}) {
  return (
    <div className="mt-5 rounded-lg border border-court-lime/20 bg-court-lime/[0.07] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white">WhatsApp-Nachricht</p>
          <p className="mt-1 text-xs text-court-muted">Kurz, locker und direkt zum Weiterleiten.</p>
        </div>
        {copied && <span className="rounded-full bg-court-lime px-2 py-1 text-xs font-bold text-court-950">kopiert</span>}
      </div>
      <p className="mt-3 rounded-lg border border-white/10 bg-black/20 p-3 text-sm leading-relaxed text-white">{message}</p>
      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <a
          href={whatsAppUrl}
          target="_blank"
          rel="noreferrer"
          className="focus-ring grid min-h-11 place-items-center rounded-lg bg-court-lime px-4 text-sm font-bold text-court-950"
        >
          In WhatsApp öffnen
        </a>
        <button
          type="button"
          onClick={onCopy}
          className="focus-ring min-h-11 rounded-lg border border-court-lime/40 px-4 text-sm font-semibold text-court-lime"
        >
          Text kopieren
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const today = useMemo(() => toIsoDate(new Date()), []);
  const [scope, setScope] = useState<Scope>('all');
  const [date, setDate] = useState(today);
  const [time, setTime] = useState('18:00');
  const [duration, setDuration] = useState<(typeof durations)[number]>(90);
  const [selectedCourt, setSelectedCourt] = useState<SelectedCourt>('egal');
  const [copiedShareText, setCopiedShareText] = useState(false);

  const selectedFacilityIds = scopeToFacilityIds(scope);
  const results = useMemo(
    () =>
      rankResults(
        selectedFacilityIds.map((facilityId) =>
          analyzeAvailability(facilityId, date, getDayKey(date), time, duration, selectedCourt),
        ),
      ),
    [date, duration, scope, selectedCourt, time],
  );
  const best = results[0];
  const nextSlots = useMemo(() => getNextSlots(scope === 'all' ? 'all' : [scope], date, duration, selectedCourt), [
    date,
    duration,
    scope,
    selectedCourt,
  ]);
  const hasUncertainBooking = results.some((result) => result.hasUncertainBooking);
  const shareMessage = useMemo(
    () => createWhatsAppText({ result: best, date, time, duration, todayIso: today }),
    [best, date, duration, time, today],
  );
  const whatsAppUrl = useMemo(() => createWhatsAppUrl(shareMessage), [shareMessage]);

  async function copyShareMessage() {
    const didCopy = await writeClipboardText(shareMessage);

    if (didCopy) {
      setCopiedShareText(true);
      window.setTimeout(() => setCopiedShareText(false), 1800);
      return;
    }

    alert(`Text konnte nicht automatisch kopiert werden:\n\n${shareMessage}`);
  }

  return (
    <main className="app-shell mx-auto flex min-h-screen w-full max-w-4xl flex-col lg:py-8">
      <header className="mb-5">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-court-lime">Tennisplatz</p>
        <div className="mt-2 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-normal text-white sm:text-5xl">Finder</h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-court-muted sm:text-base">
              Schnell prüfen, ob Hilchenbach oder Littfeld frei ist.
            </p>
          </div>
        </div>
      </header>

      <section className="rounded-lg border border-court-lime/20 bg-court-900/80 p-4 shadow-lime sm:p-5">
        <div className="space-y-6">
          <div>
            <StepLabel number={1}>Wo willst du prüfen?</StepLabel>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
              <ChoiceButton active={scope === 'all'} onClick={() => setScope('all')}>
                Beide Anlagen
              </ChoiceButton>
              <ChoiceButton active={scope === 'littfeld'} onClick={() => setScope('littfeld')}>
                Littfeld
              </ChoiceButton>
              <ChoiceButton active={scope === 'hilchenbach'} onClick={() => setScope('hilchenbach')}>
                Hilchenbach
              </ChoiceButton>
            </div>
          </div>

          <div>
            <StepLabel number={2}>Datum auswählen</StepLabel>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-[auto_auto_1fr_auto_auto]">
              <ChoiceButton compact active={date === today} onClick={() => setDate(today)}>
                Heute
              </ChoiceButton>
              <ChoiceButton compact active={date === addDays(today, 1)} onClick={() => setDate(addDays(today, 1))}>
                Morgen
              </ChoiceButton>
              <input
                aria-label="Datum"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="focus-ring col-span-2 min-h-11 rounded-lg border border-white/10 bg-black/20 px-3 text-sm text-white sm:col-span-1"
              />
              <button
                type="button"
                onClick={() => setDate(addDays(date, -1))}
                className="focus-ring min-h-11 rounded-lg border border-white/10 bg-white/[0.04] px-3 text-sm font-semibold"
              >
                Zurück
              </button>
              <button
                type="button"
                onClick={() => setDate(addDays(date, 1))}
                className="focus-ring min-h-11 rounded-lg border border-white/10 bg-white/[0.04] px-3 text-sm font-semibold"
              >
                Weiter
              </button>
            </div>
          </div>

          <div>
            <StepLabel number={3}>Uhrzeit auswählen</StepLabel>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {quickTimes.map((quickTime) => (
                <ChoiceButton key={quickTime} compact active={time === quickTime} onClick={() => setTime(quickTime)}>
                  {quickTime}
                </ChoiceButton>
              ))}
            </div>
            <select
              aria-label="Alle Uhrzeiten"
              value={time}
              onChange={(event) => setTime(event.target.value)}
              className="focus-ring mt-2 min-h-11 w-full rounded-lg border border-white/10 bg-black/25 px-3 text-sm text-white"
            >
              {times.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <StepLabel number={4}>Dauer</StepLabel>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {durations.map((option) => (
                  <ChoiceButton key={option} compact active={duration === option} onClick={() => setDuration(option)}>
                    {option} Min.
                  </ChoiceButton>
                ))}
              </div>
            </div>
            <div>
              <StepLabel number={5}>Platzfilter</StepLabel>
              <div className="mt-3 grid grid-cols-4 gap-2">
                <ChoiceButton compact active={selectedCourt === 'egal'} onClick={() => setSelectedCourt('egal')}>
                  egal
                </ChoiceButton>
                {courts.map((court) => (
                  <ChoiceButton key={court} compact active={selectedCourt === court} onClick={() => setSelectedCourt(court)}>
                    {court}
                  </ChoiceButton>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section aria-live="polite" className="mt-5 rounded-lg border border-white/10 bg-white/[0.05] p-5">
        <p className="text-sm text-court-muted">{formatDisplayDate(date)} · {time} · {duration} Min.</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className={cx('text-3xl font-black', best?.playable ? 'text-court-lime' : 'text-rose-100')}>
              {best?.playable ? 'Slot frei' : 'Kein Slot'}
            </h2>
            {best && (
              <p className="mt-1 text-sm text-court-muted">
                Beste Option: <span className="font-semibold text-white">{best.facilityName}</span>
              </p>
            )}
          </div>
        </div>
        <SharePanel message={shareMessage} whatsAppUrl={whatsAppUrl} onCopy={copyShareMessage} copied={copiedShareText} />
      </section>

      <section className="mt-4 grid gap-3">
        {results.map((result) => (
          <FacilityCard key={result.facilityId} result={result} />
        ))}
      </section>

      <section className="mt-4 grid gap-3">
        <Details title="Trainingsdetails anzeigen">
          <div className="space-y-4">
            {results.map((result) => (
              <div key={result.facilityId}>
                <h3 className="font-semibold text-white">{result.facilityName}</h3>
                {result.bookings.length === 0 ? (
                  <p className="mt-1">Keine hinterlegte Belegung an diesem Tag.</p>
                ) : (
                  <ul className="mt-2 space-y-2">
                    {result.bookings.map((booking) => (
                      <li key={booking.id} className="rounded-lg bg-black/20 p-3">
                        <span className="font-semibold text-white">{booking.start}-{booking.end}</span> · {booking.courts.join(', ')} · {booking.title}
                        {booking.certainty === 'uncertain' && <span className="text-amber-100"> · angenommen</span>}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </Details>

        <Details title="Nächste freie Zeiten anzeigen">
          {nextSlots.length === 0 ? (
            <p>Keine freien Zeiten in den nächsten Tagen gefunden.</p>
          ) : (
            <ul className="space-y-2">
              {nextSlots.map((slot) => (
                <li key={`${slot.facilityId}-${slot.date}-${slot.time}`} className="rounded-lg bg-black/20 p-3">
                  <span className="font-semibold text-white">{slot.facilityName}</span> · {formatDisplayDate(slot.date)} · {slot.time} · {slot.courts.join(', ')}
                </li>
              ))}
            </ul>
          )}
        </Details>

        <Details title="Tagesübersicht anzeigen">
          <div className="grid gap-3">
            {results.map((result) => (
              <div key={result.facilityId}>
                <h3 className="font-semibold text-white">{result.facilityName}</h3>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {result.courtResults.map((court) => (
                    <div key={court.court} className="rounded-lg bg-black/20 p-3 text-xs">
                      <p className="font-semibold text-white">{court.court}</p>
                      <p className="mt-1">{court.free ? `frei bis ${fromMinutes(court.freeUntil)}` : 'aktuell belegt'}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Details>
      </section>

      <footer className="mt-5 space-y-2 pb-6 text-xs leading-relaxed text-court-muted">
        <p className="rounded-lg border border-white/10 bg-black/20 p-3">{baseNotice}</p>
        {results.map((result) => (
          <p key={result.facilityId} className="rounded-lg border border-white/10 bg-black/20 p-3">
            {facilities[result.facilityId].notice}
          </p>
        ))}
        {hasUncertainBooking && (
          <p className="rounded-lg border border-amber-200/20 bg-amber-200/10 p-3 text-amber-100">
            Mindestens ein Termin hat eine angenommene Platzanzahl. Bitte in der Team-App prüfen.
          </p>
        )}
      </footer>
    </main>
  );
}
