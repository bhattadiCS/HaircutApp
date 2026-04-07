# Production Hardening Issue Ledger

Date: 2026-04-07
Branch: main

## Baseline Before Remediation

- `npm run lint`: passed
- `npm run test`: passed
- `npx playwright test tests/e2e/authenticated-ai-journey.spec.ts --project=iphone-15-pro`: passed
- `npm run test:e2e`: passed
- `npm run test:lighthouse`: passed

## Findings Status After Remediation

- F-001 Session isolation: fixed
- F-002 Native share payload is link-only: fixed
- F-003 Small iPhone auth layout has no scroll recovery: fixed
- F-004 Mirror renders stray `type="button"` text: fixed
- F-005 Edit Profile bio is not durably persisted: fixed
- F-006 Style Preferences row is a dead-end CTA: fixed
- F-007 Refine controls show fake success toasts: fixed
- F-008 Refine Save button only navigates to Share: fixed
- F-009 Delete account path is missing: fixed
- F-010 History is synced but has no browsing UI: fixed

## Regression Coverage Added

- `tests/integration/sessionIsolation.test.ts`: sign-out reset clears user-scoped state, overlays, and studio session state
- `tests/integration/shareExport.test.ts`: share payloads use native file sharing when available and fall back to link-sharing when not
- `tests/integration/useProfileSync.test.ts`: no-vibe profiles clear stale vibe state and route back to quiz
- `tests/e2e/iphone-production-hardening.spec.ts`: iPhone auth scroll recovery, session isolation, bio persistence, honest refine/share behavior, recent looks discoverability, and delete-account flow

## Final Verification

- `npm run lint`: passed
- `npm run test`: passed
- `npx playwright test tests/e2e/iphone-production-hardening.spec.ts --project=iphone-15-pro`: passed
- `npm run test:e2e`: passed
- `npm run test:lighthouse`: passed
- `npm run build`: blocked by the repo's required Firebase production secret gate when secrets are not present locally
- `npm run build` inside the Lighthouse Playwright preview server using `tests/test-setup.ts` test Firebase env: passed

## Notes

- Existing unstaged workspace changes were present before remediation in `PROMPT_REMEDIATION.md`, `src/features/auth/hooks/useAuthBootstrap.js`, and artifact files.
- The delete-account flow now uses an authenticated HTTP Cloud Function for server-side cascade cleanup, with client-side fallback only if the request fails.
- Playwright workers are capped at `4` so animation-budget assertions run under stable browser load instead of machine saturation.