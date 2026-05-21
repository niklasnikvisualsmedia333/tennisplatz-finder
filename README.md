# Tennisplatz Finder

Mobile-first React app to quickly check whether Littfeld or Hilchenbach has a playable tennis slot for a selected date, time, duration, and optional court.

After each check, the app generates a casual WhatsApp-ready message with the day, facility, time window, and free courts. Users can open WhatsApp directly or copy the text.

## Data Basis

- Hilchenbach uses the PDF training plan data available to me. The filename referenced 2026, while the content said Sommer 2025.
- Littfeld uses the summer 2026 PDF training plan, stand 22.04.2026, plus manually transferred screenshot events.
- Some screenshot events have assumed court counts and are marked as uncertain in the UI.
- For Littfeld on 2026-05-26, the manually transferred dated events are treated as overriding the regular weekly PDF plan so the app reflects the known screenshot entries for that day.
- Data is manually maintained. Always check the original club calendar or team app before relying on it, especially for private bookings, weather, short-notice changes, closures, and rescheduled matches.

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
