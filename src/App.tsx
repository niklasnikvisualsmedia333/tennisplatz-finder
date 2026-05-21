import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { courts, facilities, facilityIds, type Booking, type CourtId, type FacilityId } from './data/facilities';
import {
  analyzeAvailability,
  fromMinutes,
  getBookingsForDate,
  getNextSlotsInWindow,
  rankResults,
  toMinutes,
  type AvailabilityResult,
} from './lib/availability';
import { addDays, formatDisplayDate, getDayKey, toIsoDate } from './lib/date';
import { createWhatsAppText, createWhatsAppUrl } from './lib/share';

type Scope = 'all' | FacilityId;
type StepId = 1 | 2 | 3 | 4 | 5;
type Duration = (typeof durations)[number];

const times = Array.from({ length: 29 }, (_, index) => fromMinutes(toMinutes('08:00') + index * 30));
const quickTimes = ['14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'];
const durations = [60, 90, 120] as const;
const storageKey = 'tennisplatz-finder-preferences';

const baseNotice =
  'Datenbasis: Trainingspläne plus manuell übertragene Termine. Kurzfristige Änderungen, private Buchungen, Wetter, Sperrungen und Verschiebungen bitte selbst prüfen. Vor allem bitte im Klubraum gegenprüfen, ob ein Event, Feiertag, Spieltag oder eine spontane Änderung eingetragen ist.';

function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

function scopeToFacilityIds(scope: Scope): FacilityId[] {
  return scope === 'all' ? facilityIds : [scope];
}

function isScope(value: unknown): value is Scope {
  return value === 'all' || value === 'littfeld' || value === 'hilchenbach';
}

function isDuration(value: unknown): value is Duration {
  return durations.includes(value as Duration);
}

function loadSavedPreferences(today: string) {
  if (typeof window === 'undefined') {
    return { scope: 'all' as Scope, date: today, time: '18:00', latestTime: '19:00', duration: 90 as Duration };
  }

  try {
    const saved = JSON.parse(window.localStorage.getItem(storageKey) ?? '{}') as Partial<{
      scope: Scope;
      date: string;
      time: string;
      latestTime: string;
      duration: Duration;
    }>;

    return {
      scope: isScope(saved.scope) ? saved.scope : ('all' as Scope),
      date: typeof saved.date === 'string' ? saved.date : today,
      time: typeof saved.time === 'string' && times.includes(saved.time) ? saved.time : '18:00',
      latestTime: typeof saved.latestTime === 'string' && times.includes(saved.latestTime) ? saved.latestTime : '19:00',
      duration: isDuration(saved.duration) ? saved.duration : (90 as Duration),
    };
  } catch {
    return { scope: 'all' as Scope, date: today, time: '18:00', latestTime: '19:00', duration: 90 as Duration };
  }
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

function CalendarIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M7 3v4M17 3v4M4 9h16M6 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 6v6l4 2" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 3h7v7M21 3l-9 9" />
      <path d="M5 7v12h12" />
    </svg>
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

function isWeekend(isoDate: string): boolean {
  const day = new Date(`${isoDate}T12:00:00`).getDay();
  return day === 0 || day === 6;
}

function bookingForCourt(booking: Booking, court: CourtId): boolean {
  return booking.courts.includes(court);
}

function DayPlan({ facilityId, date }: { facilityId: FacilityId; date: string }) {
  const bookings = getBookingsForDate(facilityId, date, getDayKey(date));

  return (
    <div className="rounded-lg border border-white/10 bg-black/20 p-3">
      <h3 className="text-base font-semibold text-white">{facilities[facilityId].name}</h3>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {courts.map((court) => {
          const courtBookings = bookings.filter((booking) => bookingForCourt(booking, court));
          return (
            <div key={court} className="min-w-0 rounded-lg border border-white/10 bg-court-950/70 p-2">
              <p className="text-center text-sm font-bold text-court-lime">{court}</p>
              <div className="mt-2 space-y-2">
                {courtBookings.length === 0 ? (
                  <p className="rounded-md bg-court-lime/10 p-2 text-center text-xs text-court-lime">frei laut Plan</p>
                ) : (
                  courtBookings.map((booking) => (
                    <div key={booking.id} className="rounded-md bg-rose-300/10 p-2 text-xs leading-snug text-rose-50">
                      <p className="font-bold">{booking.start}-{booking.end}</p>
                      <p className="mt-1 break-words text-rose-100/85">{booking.title}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function App() {
  const today = useMemo(() => toIsoDate(new Date()), []);
  const savedPreferences = useMemo(() => loadSavedPreferences(today), [today]);
  const [scope, setScope] = useState<Scope>(savedPreferences.scope);
  const [date, setDate] = useState(savedPreferences.date);
  const [time, setTime] = useState(savedPreferences.time);
  const [latestTime, setLatestTime] = useState(savedPreferences.latestTime);
  const [duration, setDuration] = useState<Duration>(savedPreferences.duration);
  const [currentStep, setCurrentStep] = useState<StepId>(1);
  const [menuOpen, setMenuOpen] = useState(false);
  const [copiedShareText, setCopiedShareText] = useState(false);
  const dateInputRef = useRef<HTMLInputElement>(null);

  const selectedFacilityIds = scopeToFacilityIds(scope);
  const results = useMemo(
    () =>
      rankResults(
        selectedFacilityIds.map((facilityId) =>
          analyzeAvailability(facilityId, date, getDayKey(date), time, duration, 'egal'),
        ),
      ),
    [date, duration, scope, time],
  );
  const best = results[0];
  const nextSlots = useMemo(() => getNextSlotsInWindow(scope === 'all' ? 'all' : [scope], date, time, latestTime, duration), [
    date,
    duration,
    latestTime,
    scope,
    time,
  ]);
  const hasUncertainBooking = results.some((result) => result.hasUncertainBooking);
  const shareMessage = useMemo(
    () => createWhatsAppText({ result: best, date, time, duration, todayIso: today }),
    [best, date, duration, time, today],
  );
  const whatsAppUrl = useMemo(() => createWhatsAppUrl(shareMessage), [shareMessage]);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify({ scope, date, time, latestTime, duration }));
  }, [date, duration, latestTime, scope, time]);

  function goToStep(step: StepId) {
    setCurrentStep(step);
    setMenuOpen(false);
  }

  function nextStep() {
    setCurrentStep((step) => (Math.min(step + 1, 5) as StepId));
    setMenuOpen(false);
  }

  function previousStep() {
    setCurrentStep((step) => (Math.max(step - 1, 1) as StepId));
    setMenuOpen(false);
  }

  function openDatePicker() {
    const input = dateInputRef.current as (HTMLInputElement & { showPicker?: () => void }) | null;
    input?.focus();
    if (input?.showPicker) {
      input.showPicker();
      return;
    }
    input?.click();
  }

  function updateEarliestTime(nextTime: string) {
    setTime(nextTime);
    if (toMinutes(latestTime) < toMinutes(nextTime)) {
      setLatestTime(nextTime);
    }
  }

  function checkTodayLater() {
    const now = new Date();
    const rounded = Math.ceil((now.getHours() * 60 + now.getMinutes()) / 30) * 30;
    const next = Math.min(Math.max(rounded, toMinutes('08:00')), toMinutes('21:00'));
    const nextTime = fromMinutes(next);
    setDate(today);
    updateEarliestTime(nextTime);
    setLatestTime(fromMinutes(Math.min(next + 180, toMinutes('21:00'))));
    goToStep(3);
  }

  function checkTomorrow() {
    setDate(addDays(today, 1));
    goToStep(2);
  }

  async function copyShareMessage() {
    const didCopy = await writeClipboardText(shareMessage);

    if (didCopy) {
      setCopiedShareText(true);
      window.setTimeout(() => setCopiedShareText(false), 1800);
      return;
    }

    alert(`Text konnte nicht automatisch kopiert werden:\n\n${shareMessage}`);
  }

  const stepItems: Array<{ id: StepId; title: string; value: string }> = [
    { id: 1, title: 'Anlage', value: scope === 'all' ? 'Beide Anlagen' : facilities[scope].name },
    { id: 2, title: 'Datum', value: formatDisplayDate(date) },
    { id: 3, title: 'Zeitraum', value: `${time}-${latestTime}` },
    { id: 4, title: 'Dauer', value: `${duration} Min.` },
    { id: 5, title: 'Ergebnis', value: best?.playable ? 'Slot frei' : 'Kein Slot' },
  ];

  const stepTitle = stepItems.find((step) => step.id === currentStep)?.title ?? 'Ergebnis';

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
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="focus-ring grid h-12 w-12 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.04] text-court-lime"
            aria-expanded={menuOpen}
            aria-label="Schritte öffnen"
          >
            <MenuIcon />
          </button>
        </div>
        {menuOpen && (
          <nav className="mt-4 grid gap-2 rounded-lg border border-white/10 bg-black/20 p-2">
            {stepItems.map((step) => (
              <button
                key={step.id}
                type="button"
                onClick={() => goToStep(step.id)}
                className={cx(
                  'focus-ring flex min-h-11 items-center justify-between rounded-lg px-3 text-left text-sm',
                  currentStep === step.id ? 'bg-court-lime text-court-950' : 'bg-white/[0.04] text-white',
                )}
              >
                <span className="font-semibold">{step.title}</span>
                <span className="text-xs opacity-80">{step.value}</span>
              </button>
            ))}
          </nav>
        )}
      </header>

      <section className="rounded-lg border border-court-lime/20 bg-court-900/80 p-4 shadow-lime sm:p-5">
        <div className="mb-5 flex items-center gap-3">
          <button
            type="button"
            onClick={previousStep}
            disabled={currentStep === 1}
            className="focus-ring grid h-11 w-11 place-items-center rounded-lg border border-white/10 bg-white/[0.04] text-court-lime disabled:opacity-30"
            aria-label="Zurück"
          >
            <BackIcon />
          </button>
          <div className="min-w-0 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-court-muted">Schritt {currentStep} von 5</p>
            <h2 className="mt-1 text-xl font-bold text-white">{stepTitle}</h2>
          </div>
        </div>

        <div className="min-h-[22rem]">
          {currentStep === 1 && (
            <div>
            <StepLabel number={1}>Wo willst du prüfen?</StepLabel>
            <div className="mt-4 grid grid-cols-1 gap-3">
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
            <button type="button" onClick={nextStep} className="focus-ring mt-6 min-h-12 w-full rounded-lg bg-court-lime px-4 font-bold text-court-950">
              Weiter zum Datum
            </button>
          </div>
          )}

          {currentStep === 2 && (
            <div>
            <StepLabel number={2}>Datum auswählen</StepLabel>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <ChoiceButton compact active={date === today} onClick={() => setDate(today)}>
                Heute
              </ChoiceButton>
              <ChoiceButton compact active={date === addDays(today, 1)} onClick={() => setDate(addDays(today, 1))}>
                Morgen
              </ChoiceButton>
            </div>
            <div className="mt-4 rounded-lg border border-white/10 bg-black/20 p-3">
              <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-court-lime">
                <CalendarIcon />
                Kalender
              </p>
              <div className="relative">
                <button
                  type="button"
                  onClick={openDatePicker}
                  className="focus-ring flex min-h-14 w-full items-center justify-center rounded-lg border border-court-lime/30 bg-court-950 px-3 text-lg font-bold text-white"
                >
                  {formatDisplayDate(date)}
                </button>
                <input
                  id="date-picker"
                  ref={dateInputRef}
                  aria-label="Datum"
                  type="date"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />
              </div>
              <button
                type="button"
                onClick={openDatePicker}
                className="focus-ring mt-3 min-h-12 w-full rounded-lg border border-court-lime/40 px-4 text-sm font-bold text-court-lime"
              >
                Kalender öffnen
              </button>
            </div>
            <button type="button" onClick={nextStep} className="focus-ring mt-6 min-h-12 w-full rounded-lg bg-court-lime px-4 font-bold text-court-950">
              Weiter zur Uhrzeit
            </button>
          </div>
          )}

          {currentStep === 3 && (
            <div>
            <StepLabel number={3}>Uhrzeit auswählen</StepLabel>
            <p className="mt-2 text-sm leading-relaxed text-court-muted">
              Wenn du flexibel bist, setz einfach einen Zeitraum. Die nächsten freien Zeiten werden danach sortiert.
            </p>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {quickTimes.map((quickTime) => (
                <ChoiceButton key={quickTime} compact active={time === quickTime} onClick={() => updateEarliestTime(quickTime)}>
                  {quickTime}
                </ChoiceButton>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="block text-sm font-semibold text-court-lime" htmlFor="time-picker">
                <span className="mb-2 flex items-center gap-2"><ClockIcon />Frühestens</span>
                <select
                  id="time-picker"
                  aria-label="Früheste Uhrzeit"
                  value={time}
                  onChange={(event) => updateEarliestTime(event.target.value)}
                  className="focus-ring min-h-14 w-full rounded-lg border border-court-lime/30 bg-court-950 px-4 text-lg font-bold text-white"
                >
                  {times.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm font-semibold text-court-lime" htmlFor="latest-time-picker">
                <span className="mb-2 flex items-center gap-2"><ClockIcon />Spätester Start</span>
                <select
                  id="latest-time-picker"
                  aria-label="Späteste Startzeit"
                  value={latestTime}
                  onChange={(event) => setLatestTime(event.target.value)}
                  className="focus-ring min-h-14 w-full rounded-lg border border-court-lime/30 bg-court-950 px-4 text-lg font-bold text-white"
                >
                  {times.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <button type="button" onClick={nextStep} className="focus-ring mt-6 min-h-12 w-full rounded-lg bg-court-lime px-4 font-bold text-court-950">
              Weiter zur Dauer
            </button>
          </div>
          )}

          {currentStep === 4 && (
            <div>
              <StepLabel number={4}>Dauer</StepLabel>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {durations.map((option) => (
                  <ChoiceButton key={option} active={duration === option} onClick={() => setDuration(option)}>
                    {option} Min.
                  </ChoiceButton>
                ))}
              </div>
              <button type="button" onClick={nextStep} className="focus-ring mt-6 min-h-12 w-full rounded-lg bg-court-lime px-4 font-bold text-court-950">
                Ergebnis anzeigen
              </button>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-3">
              <StepLabel number={5}>Zusammenfassung</StepLabel>
              <div className="mt-4 grid gap-2">
                {stepItems.slice(0, 4).map((step) => (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => goToStep(step.id)}
                    className="focus-ring flex min-h-12 items-center justify-between rounded-lg border border-white/10 bg-black/20 px-3 text-left"
                  >
                    <span className="text-sm text-court-muted">{step.title}</span>
                    <span className="text-sm font-bold text-white">{step.value}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {currentStep === 5 && (
      <>
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
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => goToStep(3)}
            className="focus-ring min-h-11 rounded-lg border border-court-lime/40 px-4 text-sm font-semibold text-court-lime"
          >
            Neue Uhrzeit checken
          </button>
          <button
            type="button"
            onClick={checkTodayLater}
            className="focus-ring min-h-11 rounded-lg border border-white/10 bg-white/[0.04] px-4 text-sm font-semibold text-white"
          >
            Heute später
          </button>
          <button
            type="button"
            onClick={checkTomorrow}
            className="focus-ring min-h-11 rounded-lg border border-white/10 bg-white/[0.04] px-4 text-sm font-semibold text-white"
          >
            Morgen checken
          </button>
        </div>
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

        <Details title="Nächste freie Zeiten im Zeitraum anzeigen">
          {nextSlots.length === 0 ? (
            <p>Keine freien Zeiten im gewählten Zeitraum in den nächsten Tagen gefunden.</p>
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

        <Details title="Tagesplan anzeigen">
          <div className="space-y-3">
            {selectedFacilityIds.map((facilityId) => (
              <DayPlan key={facilityId} facilityId={facilityId} date={date} />
            ))}
          </div>
        </Details>
      </section>

      <footer className="mt-5 space-y-2 pb-6 text-xs leading-relaxed text-court-muted">
        <p className="rounded-lg border border-amber-200/20 bg-amber-200/10 p-3 text-amber-100">
          Wochenenden, Feiertage und ausfallendes Training werden nicht automatisch erkannt. Bitte vor dem Losfahren nochmal gegenprüfen.
        </p>
        {selectedFacilityIds.includes('littfeld') && (
          <a
            href="https://klubraum.com/"
            target="_blank"
            rel="noreferrer"
            className="focus-ring flex min-h-11 items-center justify-center gap-2 rounded-lg border border-court-lime/40 bg-court-lime/10 px-4 text-sm font-bold text-court-lime"
          >
            Klubraum für Littfeld öffnen
            <ExternalIcon />
          </a>
        )}
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
      </>
      )}
    </main>
  );
}
