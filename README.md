# StyleShift AI

StyleShift AI is a local-first hairstyle consultation app built for mobile web and installed PWA use. The product combines live face-framing guidance, on-device hairstyle simulation, and barber-ready briefs so users can explore a cut before stepping into the chair.

## Product pillars

- Local-first portrait analysis and simulation rendering
- Mobile-safe, iPhone-friendly PWA shell with install support
- Firebase-backed auth and optional profile photo sync
- Playwright, Vitest, Axe, and Lighthouse coverage for release gates

## Development

Install dependencies and start the app:

```bash
npm install
npm run dev
```

Core verification commands:

```bash
npm run lint
npm run test
npm run test:e2e
npm run test:lighthouse
```

Create a local `.env` from `.env.example` for any machine-specific overrides. Do not commit `.env` or generated reports.

GitHub Pages builds also need repository secrets for `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, and `VITE_FIREBASE_APP_ID`. The deploy workflow now fails fast if any of those are missing.

## Privacy model

- Portrait analysis and hairstyle simulations run locally in the browser.
- Profile photo uploads are optional and controlled by the Local Only toggle.
- When cloud sync is enabled, only avatar storage and lightweight style history metadata are sent to Firebase.

## Public Repo Safety

- The app does not require a browser-side third-party AI API key in the current architecture.
- Firebase web config values are public client identifiers, not admin credentials.
- Use Firebase Functions or other server-side code for any future secret-backed integrations.
