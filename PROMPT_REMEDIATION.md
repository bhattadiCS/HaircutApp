# StyleShift AI - 24 Hour Production Remediation, Verification, and Ship Prompt

Prompt purpose:
This file is a copy-ready, execution-grade remediation prompt for an autonomous coding agent.
It is grounded in the verified iPhone WebKit findings from the latest deep-dive audit.
It is designed to force a full fix-test-retest loop until StyleShift AI is genuinely ready for production, not just cosmetically improved.

Prompt start.

You are an elite principal engineer, iPhone Safari and PWA specialist, release manager, QA remediator, and production hardening lead.
Your job is not to audit.
Your job is to fix.

You must:
- reproduce every known issue,
- fix root causes,
- add regression coverage,
- rerun targeted and full suites,
- fix every newly discovered issue from those test runs,
- repeat this loop until the app is release-ready,
- then commit and push the final changes.

You have up to 24 hours of wall-clock effort.
Use the full time budget if necessary.
Do not stop after one pass.
Do not stop after one green run.
Do not stop after fixing only the already-known bugs.
If a fix reveals another regression, that new regression is now part of scope and must be fixed before you declare the app ready.

You are not allowed to:
- hide broken behavior behind vague copy,
- call a URL share an image export,
- leave dead-end CTAs in place,
- leave placeholder controls that pretend to change the preview,
- accept cross-account state leakage,
- accept critical iPhone CTA reachability failures,
- declare production readiness while Severity 0 or Severity 1 issues remain.

Your mission is to take StyleShift AI from its current audited state to a push-ready production state through an iterative remediation loop.

## Non Negotiable Outcome

The app is only considered production ready when all of the following are true:

1. No known Severity 0 issues remain.
2. No known Severity 1 issues remain.
3. Core flows are green on the required device matrix.
4. The product does not misrepresent what any critical action actually does.
5. Cross-account session isolation is correct.
6. Share and export behavior is honest and usable on iPhone.
7. Missing account-management paths that users reasonably expect are implemented or explicitly removed from product expectations.
8. Automated tests covering the repaired bugs are added or updated.
9. The final branch is committed and pushed.

If any one of these is false, you are not done.

## Known Verified Findings You Must Treat As Real Until Fixed

These were already verified in mobile WebKit and code inspection. Do not waste time debating whether they exist.
Start by reproducing each one, then fix it.

### F-001 Session isolation is broken across sign out and relogin
Observed behavior:
- User A selects a vibe.
- User A signs out.
- User B, who has no vibe, signs in or signs up.
- User B lands in Mirror instead of Quiz.
- In the verified run, the Settings sheet also reopened immediately for User B.

Likely file starting points:
- `src/store/useAppStore.js`
- `src/store/slices/createAuthSlice.js`
- `src/features/profile/lib/startProfileSync.js`
- `src/features/auth/hooks/useAuthBootstrap.js`

Minimum acceptance criteria:
- Signing out clears all user-specific persisted state that can influence another account.
- A user with no vibe always lands in Quiz.
- A user with a saved vibe lands in Mirror.
- Settings and Edit Profile overlays never leak into the next session.
- Add regression coverage for user A -> sign out -> user B.

### F-002 iPhone native share is misleading because it shares only a URL
Observed behavior:
- On native-share capable devices, Share Preview uses `navigator.share`.
- The payload contains title, text, and page URL only.
- The generated image file is not shared.
- The PNG fallback button is hidden on this branch.

Likely file starting points:
- `src/app/AuthenticatedStudioShell.jsx`
- `src/features/share/ShareStudio.jsx`

Minimum acceptance criteria:
- Either the native share path shares the actual generated image file,
- or the action is renamed to something truthful like Share Link,
- and the user still has a real image export or save path on iPhone.
- Regression coverage must inspect the share payload.

### F-003 Small iPhone landscape auth has unreachable CTA
Observed behavior:
- On iPhone SE class landscape, the account-switch CTA falls below the viewport.
- The page height is locked, so there is no scroll recovery.

Likely file starting points:
- `src/features/auth/AuthScene.jsx`
- `src/features/auth/AuthForm.jsx`
- `src/index.css`

Minimum acceptance criteria:
- All critical auth CTAs remain reachable on small iPhone portrait and landscape.
- The screen can scroll when content exceeds height.
- Keyboard-open auth remains recoverable on short devices.
- Add regression coverage for landscape reachability.

### F-004 Mirror renders raw JSX garbage text in the bottom controls
Observed behavior:
- The literal string `type="button"` is visible in Mirror near the bottom action area.

Likely file starting points:
- `src/features/studio/MirrorMode.jsx`

Minimum acceptance criteria:
- No raw attribute or JSX text leaks into the UI.
- Add regression coverage to ensure the string is absent and the control area renders cleanly.

### F-005 Profile bio is deceptive because it does not durably persist
Observed behavior:
- Editing bio appears to save.
- It survives an immediate reopen.
- It resets on reload because it lives only in component state.

Likely file starting points:
- `src/features/auth/EditProfileModal.jsx`
- any relevant profile persistence layer if you create one

Minimum acceptance criteria:
- Bio is either truly persisted and restored,
- or the field is removed or clearly downgraded so it no longer implies saved account data.
- No silent data loss.
- Add regression coverage for reload persistence or the chosen honest fallback.

### F-006 Style Preferences is a dead-end CTA
Observed behavior:
- The row looks actionable.
- Tapping it does nothing.

Likely file starting points:
- `src/features/settings/SettingsSheet.jsx`

Minimum acceptance criteria:
- Implement a real destination or interaction,
- or remove the row,
- or clearly label it as unavailable if that is an accepted product decision.
- There must be no fake navigation affordance.

### F-007 Refine controls are misleading placeholders
Observed behavior:
- Suggestion chips and tool buttons show toasts.
- The generated image does not change.

Likely file starting points:
- `src/features/studio/RefineStudio.jsx`
- `src/features/studio/hooks/useStudioGeneration.js`

Minimum acceptance criteria:
- Either implement real, meaningful preview updates for the supported controls,
- or reframe the controls so they are honest and clearly non-destructive suggestions,
- or remove them if they cannot be made truthful.
- There must be no fake "Update applied!" messaging when nothing changed.

### F-008 Save in Refine is misleading because it only navigates to Share
Observed behavior:
- The Save button opens Share.
- It does not correspond to a distinct save action at the moment the user taps it.

Likely file starting points:
- `src/features/studio/RefineStudio.jsx`
- `src/features/studio/hooks/useStudioGeneration.js`

Minimum acceptance criteria:
- Either the button truly saves,
- or it is renamed to reflect actual behavior,
- or the flow is restructured so the user is not misled.

### F-009 Delete account is missing
Observed behavior:
- No delete-account path was found in Settings or Edit Profile.

Likely file starting points:
- `src/features/settings/SettingsSheet.jsx`
- `src/features/auth/EditProfileModal.jsx`
- any auth/account deletion backend path you add

Minimum acceptance criteria:
- Provide a discoverable delete-account path,
- include explicit confirmation and consequence copy,
- clear local state on completion,
- and ensure the account deletion path is honest and recoverable only as designed.
- Add tests for discoverability and the deletion flow if feasible in this environment.

### F-010 History exists in backend logic but has no discoverable browsing UI
Observed behavior:
- History is synced and written,
- but users cannot browse saved looks.

Likely file starting points:
- `src/features/profile/lib/startProfileSync.js`
- `src/features/studio/hooks/useStudioGeneration.js`
- whichever surface you choose for history UI

Minimum acceptance criteria:
- Add a discoverable history or saved-looks surface,
- or remove any implication that users can revisit history until such a surface exists.
- The final UX must be honest.

## High Risk Threads You Must Validate Even If The Above Fixes Pass

These are not optional. They must be re-tested after the primary fixes because they are plausible release blockers.

1. Real or production-like Google redirect auth on iPhone Safari.
2. Google redirect auth in installed PWA mode.
3. Auth recovery under slow network and after cancel.
4. Keyboard overlap in Edit Profile, especially the `85vh` bottom sheet.
5. Camera permission allow, deny, retry, and recovery behavior.
6. Native share cancel path and post-cancel stability.
7. Local Only behavior for profile photo and history expectations.
8. History browsing UX after implementing or revising it.
9. Account deletion end to end, including state cleanup.
10. Whether any new copy now overpromises.

## Required Engineering Principles

1. Fix root causes, not screenshots.
2. Prefer removing misleading UI over shipping fake functionality.
3. Do not disable tests to get green.
4. Do not weaken assertions unless the product behavior truly changed and the new behavior is correct.
5. Add regression coverage for every confirmed bug you fix.
6. Preserve iPhone-first UX. Desktop compatibility is necessary but not the primary bar.
7. If a feature cannot be fully implemented in the time budget, make the product honest before shipping.
8. Document every important product decision you make while fixing these issues.

## Required 24 Hour Remediation Loop

You must execute this as a loop, not a one-shot edit.

### Phase 0 - Establish Baseline
Before editing anything:
1. Inspect git status and current branch.
2. Install dependencies if needed.
3. Run the current baseline commands and capture failures.
4. Create a running issue ledger with:
	- known verified bugs,
	- newly discovered bugs,
	- fixed bugs,
	- blocked bugs,
	- tests added.

Run at minimum:
1. `npm run lint`
2. `npm run test`
3. `npm run test:e2e`
4. `npm run test:lighthouse`

If the full E2E suite is too broad for initial triage, run targeted iPhone and affected-path specs first, then the full suite later.

### Phase 1 - Reproduce Known Issues One By One
You must explicitly reproduce the known findings before fixing them, unless the code defect is trivial and self-evident like the stray `type="button"` node.

Capture evidence under a dedicated artifact folder such as:
- `artifacts/production-hardening/`

At minimum capture:
1. Auth portrait and landscape.
2. Cross-account sign-out and relogin behavior.
3. Share screen and share payload.
4. Edit Profile before and after reload.
5. Any keyboard overlap or safe-area issue.
6. Any dead-end CTA before it is fixed.

### Phase 2 - Fix In Priority Order
You must fix in this order unless a lower item is blocking reproduction.

Priority order:
1. Session isolation and post-auth routing.
2. Share and export truthfulness.
3. Critical CTA reachability on iPhone auth.
4. Raw UI corruption like `type="button"`.
5. Profile persistence honesty.
6. Dead-end CTAs and missing account-management surfaces.
7. Refine honesty and Save semantics.
8. History browsing or removal of misleading expectations.
9. Any regressions found during reruns.

### Phase 3 - Add Or Update Automated Coverage Immediately After Each Fix
For every fix, add the smallest high-value regression coverage that would have caught the issue.

You are expected to add or update tests across:
1. Playwright E2E for iPhone flows.
2. Vitest/unit or integration tests for state logic, persistence logic, and helper behavior.
3. Visual or DOM-level assertions for layout-critical regressions when practical.

At minimum add coverage for:
1. Cross-account vibe leakage and overlay leakage.
2. Share payload semantics.
3. Small-landscape auth CTA reachability.
4. Bio persistence or intentional removal.
5. Dead-end CTA removal or implementation.
6. Refine controls matching real behavior.

### Phase 4 - Re-Test After Every Meaningful Change Set
After each bug cluster is fixed:
1. Re-run the targeted tests for that cluster.
2. Re-run the associated iPhone exploratory path.
3. Fix any regressions found immediately.
4. Update the issue ledger.

You are not allowed to batch a large number of risky changes and only test once at the end.

### Phase 5 - Broaden Coverage Once The Main Bugs Are Fixed
After the known blockers are fixed, broaden validation and hunt for second-order breakage:

1. Fresh browser state.
2. Returning session.
3. Slow network.
4. Offline after initial load where feasible.
5. Sign out and relogin as same user.
6. Sign out and relogin as different user.
7. Local Only on and off.
8. Long display name and long email local part.
9. Camera permission denied and retry.
10. Native share success and cancel.
11. PWA standalone if installable in the environment.

### Phase 6 - Shipping Gate
Do not ship until all of these are true:

1. `npm run lint` passes.
2. `npm run test` passes.
3. `npm run build` passes.
4. `npm run test:e2e` passes, including the iPhone project.
5. `npm run test:lighthouse` passes at the target threshold accepted by the repo.
6. The newly added regression tests pass.
7. No known Severity 0 or Severity 1 bugs remain.
8. Remaining Severity 2 or 3 items, if any, are explicitly documented and truly non-blocking.

Require at least:
1. Two consecutive clean runs of the targeted iPhone hardening suite.
2. One clean run of the full test suite.

### Phase 7 - Commit And Push
When all fixes and validations are complete:
1. Review `git diff` carefully.
2. Ensure only intentional files are included.
3. Update any user-facing documentation or release notes needed to explain changed behavior.
4. Create one or more clean commits with accurate messages.
5. Push the current branch to origin.
6. If repository policy requires a feature branch, create and push one.
7. Do not force push unless absolutely necessary and safe.

If push fails because of authentication, network, or remote permissions, that is the only acceptable final blocker after all code and test work is complete. Report the exact push error.

## Detailed Fix Directives By Area

### A. Auth, Session Isolation, And Routing
You must inspect and correct:
- persisted `userVibe`
- persisted or in-memory overlay flags such as Settings and Edit Profile visibility
- profile sync behavior when a user has no vibe
- auth bootstrap behavior that sets view before profile truth is known

Acceptance criteria:
1. User A cannot influence User B's landing view.
2. User A overlays cannot reopen for User B.
3. Same-user relogin restores correct state.
4. No-vibe users land in Quiz.
5. Vibe users land in Mirror.

Required tests:
1. Unit or integration tests for store reset and profile sync.
2. Playwright test for A -> sign out -> B flow.

### B. Share, Export, And Save Semantics
You must make the UX truthful on iPhone.

Choose a production-grade endpoint and implement it fully:
1. Native share with actual image file support where available.
2. Honest Share Link labeling plus an explicit Download or Save Image path.

You must also resolve Save semantics in Refine.

Acceptance criteria:
1. The primary CTA says exactly what it does.
2. iPhone users have a real path to share or save the generated image if that is a product promise.
3. The share payload test proves what leaves the device.

Required tests:
1. Share payload inspection.
2. PNG fallback verification where native share is unavailable.

### C. Auth Layout And Safe Area Resilience
You must make the auth screen robust on short devices and keyboard stress.

Acceptance criteria:
1. Portrait and landscape are both usable on iPhone SE class devices.
2. All primary CTAs are reachable.
3. No critical text is clipped.
4. Keyboard-open auth remains recoverable.

Required tests:
1. Landscape viewport reachability assertion.
2. Screenshot coverage for small portrait and landscape.

### D. Mirror Integrity And Control Reachability
You must remove the visible JSX leak and ensure the bottom controls remain usable.

Acceptance criteria:
1. No raw code text in UI.
2. Control labels and buttons remain tappable and readable.
3. Safe area padding does not bury actions near the home indicator.

Required tests:
1. Playwright assertion that `type="button"` is absent.
2. Control visibility or screenshot regression checks.

### E. Profile Editing, Keyboard, And Persistence
You must choose a truthful product outcome for bio and photo behavior.

Acceptance criteria:
1. Name save works and remains visible after reload.
2. Bio either persists or is removed or relabeled honestly.
3. Edit Profile remains usable with keyboard open on targeted iPhones.
4. Local Only behavior matches the copy.

Required tests:
1. Reload persistence for the chosen fields.
2. Local Only profile-photo behavior checks.
3. Keyboard overlap validation if the environment supports it.

### F. Settings Truthfulness And Dead Ends
You must remove or implement every misleading row in Settings.

Acceptance criteria:
1. Every visible row does something meaningful.
2. Local Only copy matches actual storage behavior.
3. Sign Out always cleans session state.

Required tests:
1. Style Preferences row regression.
2. Sign-out cleanup regression.

### G. Refine Honesty And User Trust
If true refinement cannot be shipped in this time window, do not fake it.

Acceptance criteria:
1. Controls either perform a real modification,
2. or are demoted to clearly informational suggestions,
3. or are removed.
4. Save no longer lies about what happened.

Required tests:
1. Image source change tests if refinement is real.
2. Copy and behavior tests if refinement is reframed.

### H. History Browsing And Account Deletion
Users must be able to manage their account and understand saved output.

Acceptance criteria:
1. Delete account is discoverable and functions honestly.
2. History is discoverable if it exists.
3. If history is not meant to be user-facing, all copy implying otherwise is removed.

Required tests:
1. Discoverability tests for delete account and history.
2. End-to-end deletion tests if feasible.

## Required Test Matrix

You must cover at least these device profiles where possible:
1. iPhone SE 3 or closest small iPhone class
2. iPhone 13 Mini or closest short-notch class
3. iPhone 15 Pro
4. iPhone 15 Pro Max

For each major critical flow, cover at least:
1. Portrait
2. Landscape
3. Fresh browser state
4. Returning session

If real hardware is available, prefer it for:
1. Google redirect auth
2. PWA standalone mode
3. keyboard overlap
4. camera permission behavior
5. native share cancel and actual file share behavior

If real hardware is unavailable, use:
1. Playwright WebKit iPhone emulation first
2. Safari responsive mode second
3. document the limitation explicitly

## Required Commands Before Final Sign Off

Run and record results for:
1. `npm run lint`
2. `npm run test`
3. `npm run build`
4. `npm run test:e2e`
5. `npm run test:e2e -- --project=iphone-15-pro` or an equivalent targeted iPhone suite
6. `npm run test:lighthouse`

Add any targeted Playwright or Vitest commands you introduce for the new regression coverage.

## Final Output Contract

Your final output must contain all of the following:

1. Executive release verdict.
2. Exact list of bugs fixed.
3. Exact list of newly discovered bugs fixed during iteration.
4. Exact list of remaining issues, if any, with severity and ship rationale.
5. Root cause summary for each major fixed bug.
6. Files changed and why.
7. Tests added or updated.
8. Commands run and whether each passed.
9. Device and environment matrix actually covered.
10. Evidence artifact locations.
11. Git commit hash or hashes.
12. Git branch name.
13. Push result.
14. Recommended release decision.

If anything remains blocked by an external dependency, your output must say exactly:
- what is blocked,
- why it is blocked,
- what you did to mitigate it,
- and why the app is or is not still releasable.

## Final Standard

This must end as an engineering-grade ship pass, not an optimistic cleanup.

The final app must be:
- honest,
- stable,
- regression-tested,
- iPhone-safe,
- session-safe,
- push-ready.

Prompt end.
