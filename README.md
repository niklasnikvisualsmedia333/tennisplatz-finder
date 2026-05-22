# Tennisplatz Finder

Mobile-first React app to quickly check whether Littfeld or Hilchenbach has a playable tennis slot for a selected date, time window, and duration.

After each check, the app generates a casual WhatsApp-ready message with the day, facility, time window, and free courts. Users can open WhatsApp directly or copy the text.

## Data Basis

- Hilchenbach uses the stored training-plan image for 2026. The image itself says Sommer 2025, but it is handled here as the 2026 plan.
- Littfeld uses the stored training-plan image for Sommer 2026, stand 22.04.2026, plus manually transferred screenshot events.
- Source images are available in the app under "Originalpläne & Quellen" and live in `public/source-documents/training-plans/`.
- Some screenshot events have assumed court counts and are marked compactly in the UI.
- For Littfeld on 2026-05-26, the manually transferred dated events are treated as overriding the regular weekly training-plan image so the app reflects the known screenshot entries for that day.
- Data is manually maintained. Always check the original club calendar, Klubraum, or team app before relying on it, especially for private bookings, weather, holidays, short-notice changes, closures, and rescheduled matches.

## Adding Screenshot Events

Future Littfeld screenshot data belongs in `src/data/littfeld-extra-events.ts`:

- Add future HEIM events to `littfeldDatedEvents` as blockers for courts `[1, 2, 3]`.
- Add future GAST events to `ignoredLittfeldEvents` only, so they stay traceable but do not block courts.
- Add future VMS events as one-court blockers unless the source clearly says otherwise.
- Mark assumptions with `certainty: 'assumed-one-court'` or `certainty: 'assumed-all-courts'`.

## Local Development

```bash
npm install
npm run dev
```

Use Node.js 22 locally when possible. The GitHub Pages workflow also uses Node.js 22.

## Checks

```bash
npm run test
npm run build
```

## GitHub Pages Deployment

The app is configured for a GitHub Pages project site with:

```ts
base: '/tennisplatz-finder/'
```

The deployment workflow lives in `.github/workflows/deploy.yml` and deploys `dist` through the official GitHub Pages artifact flow on every push to `main`.

Final URL format:

```text
https://<github-username>.github.io/tennisplatz-finder/
```
