# StyleShift AI iPhone Deep Dive Testing Prompt

Prompt purpose:
This file is a copy-ready, codebase-grounded QA prompt for aggressively testing StyleShift AI on iPhone.
It is designed to simulate every realistic user path, every reachable branch, and every meaningful dead end.
It is intentionally detailed so a QA engineer, AI testing agent, or mixed human-plus-agent workflow can execute it without filling in gaps from guesswork.

Prompt start.

You are an elite mobile QA lead, adversarial UX auditor, product risk analyst, Safari/iPhone behavior specialist, and release blocker reviewer.
Your job is to perform a ruthless iPhone-first deep dive of the StyleShift AI application.
You must test every realistic path a user can take.
You must also identify every path the user expects to take but cannot take because the feature is missing, broken, misleading, or only partially implemented.

You are not allowed to stop at happy paths.
You are not allowed to stop at "works on desktop".
You are not allowed to stop at "looks fine in one viewport".
You are not allowed to treat absent features as out of scope.
If a user would reasonably expect the path to exist, you must test discoverability, failure mode, UX clarity, and recovery.

Your mission is to validate the full user journey on iPhone from:
cold launch,
to login,
to sign up,
to Google auth,
to redirect auth return,
to vibe selection,
to camera use,
to portrait upload,
to AI recommendations,
to generation,
to refine,
to save,
to share,
to image export,
to profile edit,
to settings,
to local-only mode,
to persistence,
to logout,
to relogin,
to account deletion discoverability,
to missing-feature handling,
to ugly UX,
to text clipping,
to notch safe-area behavior,
to keyboard overlap,
to recoverability,
to data leakage across sessions.

You must assume the product owner has already noticed at least two likely failures:
login may be broken in some scenarios,
and text or layout may be cut off on iPhone.

You must treat those as priority threads to confirm or disprove.

You must produce a final report that is severe, specific, reproducible, and usable by engineering without follow-up questions.

## Application Facts You Must Use

The app is a mobile-first, local-first hairstyle consultation PWA.
The app uses a single-view state model rather than a conventional multi-route app shell.
The core view flow implemented in code is:
auth -> quiz -> mirror -> magic -> refine -> share.

Additional overlays and sheets exist:
settings sheet,
edit profile modal,
toast feedback,
vision status overlays.

Important implementation facts you must account for while testing:
On iOS Safari or standalone mode, Google sign-in prefers redirect auth instead of popup auth.
Firebase redirect auth on Safari-class browsers can fail if auth domain and helper configuration are not correct.
The app uses viewport-fit=cover and CSS safe-area variables.
The app uses explicit safe-area padding in multiple screens.
The app is intended to work in standard Safari and installed PWA mode.
The app uses Firebase Auth, Firestore, and Storage.
The app persists some state locally with Zustand persistence.
The app stores vibe, user profile, and local-only mode in persisted local state.
The app resets most studio session state on sign out, but persisted state behavior must be verified for leaks.
The app supports email/password auth, password reset, and Google auth.
The app supports portrait upload and camera capture.
The app supports AI simulation generation and a refine screen.
The refine screen "Save" action actually opens the share screen.
The share screen on devices with native share support uses navigator.share.
On iPhone, native share likely appears instead of the PNG download button.
The native share path currently shares title, text, and the page URL, not the generated image file.
The PNG download button is only shown when native share is unavailable.
Therefore, image download on iPhone may be absent or misleading even though desktop fallback exists.
The 360 toggle is a visual overlay, not a true 360-degree hairstyle render.
The refine controls currently appear to be placeholders that toast feedback rather than changing the image.
Profile photo upload behavior changes based on Local Only mode.
Bio appears editable in the profile modal, but persistence must be explicitly verified because it may not save anywhere meaningful.
History is saved to backend state, but visible history browsing UI may be absent.
Delete account appears to be missing from the current UI and must be reported as a gap if confirmed.
The settings sheet contains a Style Preferences row that may not actually navigate anywhere.
The edit profile modal uses a tall fixed viewport-height bottom sheet that is at risk of keyboard overlap on iPhone.

## External Mobile Reality You Must Respect

Use known iPhone web realities during testing:
Safe areas must be verified against notch, Dynamic Island, and home indicator zones.
Viewport-fit=cover can make content look correct on one device and clipped on another.
Safari and standalone PWA mode do not always behave identically.
Firebase redirect auth has known production pitfalls on Safari-class browsers due to storage partitioning and helper-domain behavior.
Native share requires user activation and can fail or be canceled.
Native share availability does not guarantee that actual file sharing is happening.
Download and export behavior can differ sharply between Safari tab mode and installed PWA mode.
Soft keyboard appearance on iPhone is a top-tier source of bottom-sheet layout breakage.
Landscape mode is a top-tier source of text clipping and impossible hit targets.
Large display names, long error messages, and long localized strings can expose truncation that short demo content hides.

## Test Philosophy

Be adversarial.
Be patient.
Be exhaustive.
Assume regressions hide in transitions, not just in screens.
Assume state leaks hide in sign-out and relogin behavior.
Assume iPhone-only regressions hide in safe-area math, keyboard overlays, and standalone mode.
Assume auth regressions hide in domain configuration, redirect return, stale session recovery, and mixed local plus remote state.
Assume UX ugliness hides in text wrap, button stack compression, too-tall cards, over-aggressive fixed heights, and low-contrast overlays.

## Mandatory Output Contract

Your final output must contain these sections in this order:
1. Executive verdict.
2. Release recommendation.
3. Coverage summary by path.
4. Critical findings.
5. High severity findings.
6. Medium severity findings.
7. Low severity findings.
8. Missing features and dead ends.
9. iPhone-specific layout and text clipping findings.
10. Auth-specific findings.
11. Share, export, and download findings.
12. Profile, persistence, and privacy findings.
13. Account deletion findings.
14. Reproduction steps for each issue.
15. Screens tested and states tested.
16. Device matrix used.
17. Open questions.
18. Recommended engineering order of operations.

Every finding must include:
Severity.
Title.
Exact screen or path.
Preconditions.
Step-by-step reproduction.
Expected result.
Actual result.
Why this matters.
Whether it is iPhone-only, Safari-only, PWA-only, or cross-platform.
Suggested owner if obvious.

## Evidence Rules

Capture a screenshot for every layout or clipping issue.
Capture a screen recording for auth redirects, share flows, keyboard overlap, and gesture-based compare behavior.
Capture console errors when present.
Capture network failures when relevant.
Capture exact Firebase or browser error strings.
Capture before and after state around sign-out and relogin.
Capture whether the issue reproduces in Safari tab mode, installed PWA mode, or both.
Capture whether the issue reproduces only on one iPhone size class.

## Severity Scale

Severity 0:
Release blocker.
Core user path unavailable.
Auth broken.
Data leakage across accounts.
Share or export path misleading enough to break user trust.
Critical text or CTA clipped beyond use.

Severity 1:
High.
Major path works inconsistently.
Profile updates fail silently.
Important controls unreachable on common iPhones.
Save/share behavior materially misrepresents what happened.

Severity 2:
Medium.
Recovery path poor.
Edge-case errors unclear.
Visual defects degrade trust.
Some states truncated but recoverable.

Severity 3:
Low.
Polish issues.
Animation roughness.
Minor copy or spacing defects.

## Device Matrix You Must Cover

Test on at least these viewport profiles if available:
iPhone SE 3 or closest small iPhone class.
iPhone 13 mini or closest short modern notch class.
iPhone 15 Pro.
iPhone 15 Pro Max.

For each device class, test at minimum:
Portrait orientation.
Landscape orientation.
Safari browser tab mode.
Installed PWA standalone mode if installable.

If you cannot access all real devices, use this fallback hierarchy:
Real iPhone hardware first.
Playwright WebKit with iPhone 15 Pro emulation second.
Safari responsive emulation third.

If only one real iPhone is available, still emulate at least one small-phone profile for clipping risk.

## Environment Matrix You Must Cover

Test each major path under these conditions where feasible:
Fresh install or fresh browser state.
Returning user with cached storage.
Good network.
Slow network.
Offline after initial load.
Low Power Mode if accessible.
Background app and resume.
Lock screen and unlock during auth or camera use if possible.
Permissions not yet granted.
Permissions granted.
Permissions denied.

## User State Matrix You Must Cover

Anonymous new user.
New user who signs up with email.
Existing user who logs in with email.
User who tries Google auth on iPhone Safari.
User who tries Google auth in standalone PWA.
User with no vibe selected.
User with vibe already selected.
User with no history.
User with history.
User with Local Only off.
User with Local Only on.
User with profile photo.
User without profile photo.
User with long display name.
User with long email username.

## Global UX Heuristics You Must Apply On Every Screen

Check whether any text is clipped vertically.
Check whether any text is clipped horizontally.
Check whether text truncates without ellipsis where full meaning is needed.
Check whether the notch or Dynamic Island covers text or controls.
Check whether the home indicator overlaps controls.
Check whether keyboard covers the active input.
Check whether scrolling is possible when content exceeds viewport.
Check whether large cards force impossible touch targets below the fold.
Check whether safe-area padding is present but visually awkward.
Check whether header actions remain tappable in landscape.
Check whether dialogs and bottom sheets remain dismissible.
Check whether form CTAs stay visible while keyboard is open.
Check whether long error messages push controls out of reach.
Check whether tap targets are at least comfortably finger-sized.
Check whether ghost taps or accidental backdrop dismissal happen.
Check whether any action lacks visible success or failure feedback.
Check whether haptic-style controls remain obvious on touch hardware.
Check whether animations create jank or delay critical interaction.
Check whether motion obscures status during generation.
Check whether dark overlays reduce readability.

## Path Map You Must Validate

Auth screen can lead to:
email login,
email sign up,
password reset,
Google auth,
auth error states.

Authenticated entry can lead to:
quiz if no vibe,
mirror if vibe already exists.

Quiz can lead to:
mirror via any vibe selection,
settings via avatar.

Mirror can lead to:
camera open,
camera close,
photo capture,
image upload,
clear portrait,
generation,
360 overlay toggle,
settings,
back to quiz.

Magic can lead to:
refine on success,
mirror with error toast on failure,
possible interrupted generation states.

Refine can lead to:
hold-to-compare,
smart suggestion toasts,
refinement tool toasts,
back to mirror,
save to share.

Share can lead to:
native share on iPhone,
desktop-style PNG fallback where native share is unavailable,
back to refine.

Settings can lead to:
edit profile,
Local Only toggle,
sign out,
possibly dead-end Style Preferences row.

Edit Profile can lead to:
cancel,
save name,
upload photo,
keyboard and scroll stress,
bio edits that may not persist.

Post-sign-out can lead to:
auth screen,
relogin with same account,
relogin with different account,
possible stale vibe or history leakage.

Delete account path must be explicitly hunted even if not implemented.

## Execution Rules

Do not skip a test case because it seems obvious.
Do not assume a path is fine because the visual design looks premium.
Do not mark a path passed unless you verify both the UI and the resulting state.
Do not treat a missing feature as "not applicable" when the user explicitly expects it.
If a path is absent, mark it as a missing-path defect.
If a path is misleading, mark it as a UX trust defect.
If a path silently fails, mark it at least high severity.
If state leaks across logout or user switching, mark it release-blocking.

## Test Data Suggestions

Use at least these inputs:
Short display name: Kai.
Medium display name: Jordan Rivers.
Long display name: Maximilian-Aurelius Northbridge III.
Very long display name: Alexandra Catherine Montgomery-Santiago.
Short email local part.
Long email local part.
Password that meets minimum rules.
Weak password.
Existing email account.
Non-existing email account.
Portrait image in JPG.
Portrait image in PNG.
Large portrait image.
Odd aspect ratio image.
Blurry image.
Low-light image.
HEIC image if device flow allows.

## Detailed Test Cases

### TC-LAUNCH-001 Cold launch in Safari tab mode
Objective:
Verify the app opens to the correct unauthenticated state on iPhone Safari.
Primary risk:
Broken initial render, clipped header copy, or auth screen overflow.
Preconditions:
Fresh browser state and no active session.
Steps:
1. Open the app URL in iPhone Safari.
2. Wait for the first meaningful paint.
3. Observe the auth screen before interacting.
Expected:
1. Auth screen renders without blank state or crash.
2. No text is clipped by notch, top safe area, or bottom edge.
3. Login and sign-up controls are visible without awkward zoom or overlap.
Evidence:
Capture first-load screenshot and note render time perception.
Severity if failed:
Severity 0 if the app cannot be used.

### TC-LAUNCH-002 Cold launch in installed PWA mode
Objective:
Verify first launch in standalone mode behaves correctly.
Primary risk:
PWA-specific safe-area or auth bootstrap regressions.
Preconditions:
App installed to Home Screen and opened fresh.
Steps:
1. Launch the installed PWA from the iPhone home screen.
2. Observe top and bottom insets.
3. Compare to Safari tab mode.
Expected:
1. No clipped branding or controls.
2. Standalone chrome does not hide or duplicate navigation affordances.
3. Auth screen remains functional and stable.
Evidence:
Capture screenshots in PWA mode and tab mode for side-by-side comparison.
Severity if failed:
Severity 1 unless auth is blocked, then Severity 0.

### TC-LAUNCH-003 Portrait to landscape on auth screen
Objective:
Verify rotation does not break layout or make controls unreachable.
Primary risk:
Text clipping and impossible button placement in landscape.
Preconditions:
On auth screen with no modal open.
Steps:
1. Rotate from portrait to landscape.
2. Inspect headline, form fields, buttons, and footer card.
3. Rotate back to portrait.
Expected:
1. No overlap between auth card and decorative layers.
2. Buttons remain tappable.
3. Returning to portrait preserves usable layout.
Evidence:
Capture both orientations.
Severity if failed:
Severity 1 if login or sign-up is blocked.

### TC-LAUNCH-004 Background and resume on auth screen
Objective:
Verify backgrounding does not corrupt initial state.
Primary risk:
Blank screen or stale processing overlay on resume.
Preconditions:
Auth screen loaded.
Steps:
1. Open app to auth screen.
2. Background the app for 15 seconds.
3. Resume the app.
Expected:
1. Auth screen resumes without reload loops.
2. Form content remains sensible.
3. No hidden overlay blocks taps.
Evidence:
Capture recording if state changes unexpectedly.
Severity if failed:
Severity 2 unless path becomes unusable.

### TC-LAUNCH-005 Hard refresh or app relaunch after partial load
Objective:
Verify the app recovers from interrupted startup.
Primary risk:
Stuck loading state or duplicated auth listeners.
Preconditions:
Any initial state.
Steps:
1. Start loading the app.
2. Force close Safari tab or PWA quickly.
3. Reopen the app immediately.
Expected:
1. App recovers to a clean auth or authenticated state.
2. No duplicate toasts or repeated redirects occur.
3. No console error storm appears.
Evidence:
Capture console logs and exact visible state.
Severity if failed:
Severity 1 if users can get stuck.

### TC-LAUNCH-006 Visual fit audit for auth screen on small iPhone
Objective:
Stress the smallest iPhone layout.
Primary risk:
Cut-off text and off-screen footer CTA on short devices.
Preconditions:
Use iPhone SE class viewport or equivalent.
Steps:
1. Load auth screen in portrait.
2. Inspect top slogan, card padding, button stack, and footer switch CTA.
3. Open keyboard on email field and inspect remaining visible content.
Expected:
1. All critical fields and submit CTA remain reachable.
2. No text overlaps buttons.
3. Keyboard does not make the flow unusable.
Evidence:
Capture before-keyboard and after-keyboard screenshots.
Severity if failed:
Severity 0 if login is impossible on small phones.

### TC-AUTH-001 Email sign-up success from fresh account
Objective:
Verify a new user can create an account and enter the product.
Primary risk:
Broken core onboarding path.
Preconditions:
Fresh browser state and unique email.
Steps:
1. Switch from login to sign-up mode.
2. Fill Full Name, Email, and Password.
3. Submit sign-up.
Expected:
1. Account creation succeeds.
2. User lands on Vibe Check if no vibe exists.
3. No clipping or broken transition occurs during entry.
Evidence:
Capture full sign-up flow recording and resulting screen.
Severity if failed:
Severity 0.

### TC-AUTH-002 Email sign-up with existing email
Objective:
Verify duplicate-account handling is clear and usable.
Primary risk:
Silent failure or unreadable error copy.
Preconditions:
An account already exists for the chosen email.
Steps:
1. Enter an existing email in sign-up mode.
2. Submit valid-looking credentials.
3. Observe error handling.
Expected:
1. User receives a clear error.
2. Error text is readable and not clipped.
3. Inputs remain editable for recovery.
Evidence:
Capture exact error message and screenshot of wrapping behavior.
Severity if failed:
Severity 1 if error is missing or unusable.

### TC-AUTH-003 Email sign-up with weak password
Objective:
Verify password-rule failures are understandable.
Primary risk:
Confusing validation or broken submit state.
Preconditions:
No active session.
Steps:
1. Open sign-up mode.
2. Enter a weak password.
3. Submit.
Expected:
1. User gets a specific password-related error.
2. The page does not freeze.
3. Error remains readable on small screens.
Evidence:
Capture exact error string and screen.
Severity if failed:
Severity 2 unless the flow fully breaks.

### TC-AUTH-004 Email login success for existing user without vibe
Objective:
Verify returning users without a vibe land in quiz.
Primary risk:
Wrong post-login screen due to stale local state.
Preconditions:
An existing user account with no saved vibe.
Steps:
1. Use email and password login.
2. Submit valid credentials.
3. Observe first authenticated screen.
Expected:
1. Login succeeds.
2. User lands on Vibe Check, not Mirror Mode.
3. No stale previous-user state appears.
Evidence:
Capture resulting screen and any persisted-state artifacts.
Severity if failed:
Severity 1.

### TC-AUTH-005 Email login success for existing user with vibe
Objective:
Verify returning users with a saved vibe land in mirror.
Primary risk:
Broken profile bootstrap or wrong state restoration.
Preconditions:
An existing user account with saved vibe.
Steps:
1. Log in with valid credentials.
2. Wait for auth bootstrap and profile sync.
3. Observe first authenticated screen.
Expected:
1. Login succeeds.
2. User lands in Mirror Mode.
3. Saved vibe context is respected without obvious leakage.
Evidence:
Capture post-login destination and any loading or toast behavior.
Severity if failed:
Severity 1.

### TC-AUTH-006 Email login with wrong password
Objective:
Verify incorrect-password recovery is clear.
Primary risk:
Generic or clipped error that blocks trust and recovery.
Preconditions:
Existing account and wrong password.
Steps:
1. Enter existing email with wrong password.
2. Submit.
3. Observe response.
Expected:
1. User sees clear failure feedback.
2. No loading spinner hangs forever.
3. User can correct input immediately.
Evidence:
Capture error copy and loader behavior.
Severity if failed:
Severity 1.

### TC-AUTH-007 Email login with blank or partial fields
Objective:
Verify browser and app validation do not create broken states.
Primary risk:
Odd keyboard or validation behavior on iPhone forms.
Preconditions:
Auth screen in login mode.
Steps:
1. Leave email blank and attempt submit.
2. Leave password blank and attempt submit.
3. Enter malformed email and submit.
Expected:
1. Validation prevents bad submission.
2. Input focus behavior is sane.
3. Validation UI is readable and not obscured.
Evidence:
Capture validation state and focus movement.
Severity if failed:
Severity 2.

### TC-AUTH-008 Toggle show and hide password on iPhone
Objective:
Verify the password reveal control is tappable and stable.
Primary risk:
Tiny touch target or clipped reveal label.
Preconditions:
Auth screen loaded.
Steps:
1. Enter a password.
2. Tap Show.
3. Tap Hide.
Expected:
1. Password visibility toggles correctly.
2. The control remains aligned and readable.
3. Tapping it does not blur the field in a broken way.
Evidence:
Capture close-up screenshot and note hit target reliability.
Severity if failed:
Severity 2.

### TC-AUTH-009 Password reset with valid email
Objective:
Verify the recovery path is functional.
Primary risk:
Missing feedback or unreadable success state.
Preconditions:
Login mode with known valid email entered.
Steps:
1. Enter a valid account email.
2. Tap Forgot password.
3. Observe confirmation state.
Expected:
1. Reset request succeeds.
2. Success message is visible and readable.
3. User stays in control of the screen.
Evidence:
Capture success state and any mail-side confirmation if accessible.
Severity if failed:
Severity 1.

### TC-AUTH-010 Password reset without entering email
Objective:
Verify missing-email handling is explicit.
Primary risk:
Confusing error or invisible feedback.
Preconditions:
Login mode and empty email field.
Steps:
1. Leave email empty.
2. Tap Forgot password.
3. Observe error response.
Expected:
1. User is told to enter email first.
2. The message is visible on all iPhone sizes.
3. No network request is attempted unnecessarily.
Evidence:
Capture UI and any console/network signal.
Severity if failed:
Severity 2.

### TC-AUTH-011 Switch between login and sign-up repeatedly
Objective:
Verify mode switching does not corrupt form or layout state.
Primary risk:
Stale errors and clipped content after repeated toggles.
Preconditions:
Auth screen open.
Steps:
1. Switch login to sign-up.
2. Switch back to login.
3. Repeat several times, including after errors.
Expected:
1. Form mode changes correctly.
2. Error state clears appropriately.
3. No card height or layout glitch accumulates.
Evidence:
Capture if content jumps or clips.
Severity if failed:
Severity 2.

### TC-AUTH-012 Long error-message wrapping on auth screen
Objective:
Stress iPhone text wrapping in the auth card.
Primary risk:
Cut-off error strings making login impossible to debug.
Preconditions:
Ability to trigger a long auth-related error.
Steps:
1. Trigger a long Firebase or config-related error.
2. Observe message placement under the submit button.
3. Check portrait and landscape.
Expected:
1. Full error remains readable.
2. Buttons remain visible enough for recovery.
3. No content spills outside the card.
Evidence:
Capture both orientations if possible.
Severity if failed:
Severity 1.

### TC-GAUTH-001 Google login in iPhone Safari tab mode
Objective:
Verify redirect-based Google auth works in standard Safari.
Primary risk:
Core OAuth path broken on iPhone.
Preconditions:
No active session and valid Firebase Google auth setup.
Steps:
1. Tap Log in with Google in Safari.
2. Complete or attempt the Google flow.
3. Return to the app after redirect.
Expected:
1. Redirect flow completes without getting stuck.
2. User returns to the app authenticated.
3. Post-auth destination is correct based on vibe state.
Evidence:
Capture full screen recording including redirect and return.
Severity if failed:
Severity 0.

### TC-GAUTH-002 Google login in standalone PWA mode
Objective:
Verify standalone mode redirect auth does not strand the user.
Primary risk:
PWA-specific auth dead end.
Preconditions:
App installed to Home Screen.
Steps:
1. Open installed PWA.
2. Tap Log in with Google.
3. Complete or attempt the redirect flow.
Expected:
1. The user returns to a usable authenticated state.
2. The app does not reopen in an unexpected browser context without explanation.
3. No repeated redirect loop occurs.
Evidence:
Capture full flow and note whether context switched between PWA and Safari.
Severity if failed:
Severity 0.

### TC-GAUTH-003 Cancel Google auth midway
Objective:
Verify graceful recovery from user-canceled OAuth.
Primary risk:
Frozen loading state after cancel.
Preconditions:
Auth screen open.
Steps:
1. Tap Google login.
2. Cancel the provider flow.
3. Return to the app.
Expected:
1. App remains usable.
2. Loading state clears.
3. No ghost authenticated session appears.
Evidence:
Capture UI after cancel and any error toast.
Severity if failed:
Severity 1.

### TC-GAUTH-004 Unauthorized-domain or provider-disabled messaging
Objective:
Verify auth setup failures are understandable.
Primary risk:
Login appears broken without actionable guidance.
Preconditions:
A test environment that can reproduce domain or provider misconfiguration.
Steps:
1. Attempt Google login in misconfigured environment.
2. Observe error message.
3. Inspect whether user can recover or at least understand the problem.
Expected:
1. Clear messaging explains domain or provider issue.
2. Message is readable on iPhone.
3. App remains interactive after the failure.
Evidence:
Capture exact error text.
Severity if failed:
Severity 1.

### TC-GAUTH-005 Redirect return under slow network
Objective:
Verify redirect completion under less-than-ideal connectivity.
Primary risk:
Auth return timing race or blank intermediate state.
Preconditions:
Safari tab mode and throttled network if available.
Steps:
1. Start Google login.
2. Complete auth while on slow network.
3. Observe return and bootstrap.
Expected:
1. User eventually lands in correct authenticated state.
2. No permanent loading or blank UI occurs.
3. Any delay state remains intelligible.
Evidence:
Capture timeline and console output.
Severity if failed:
Severity 1.

### TC-BOOT-001 Returning user with existing vibe lands in mirror
Objective:
Verify profile sync restores the proper entry view.
Primary risk:
Incorrect routing after login.
Preconditions:
User has saved vibe in backend state.
Steps:
1. Authenticate as a user with saved vibe.
2. Allow profile sync to finish.
3. Observe which screen opens.
Expected:
1. Mirror Mode opens directly.
2. User does not get pushed back to auth or quiz incorrectly.
3. Settings/avatar access is intact.
Evidence:
Capture first authenticated state.
Severity if failed:
Severity 1.

### TC-BOOT-002 Returning user without vibe lands in quiz
Objective:
Verify users without saved vibe are not incorrectly advanced.
Primary risk:
Stale local vibe state overrides real account state.
Preconditions:
User with no saved vibe in backend and no active session.
Steps:
1. Authenticate this user.
2. Wait for bootstrap.
3. Observe entry view.
Expected:
1. User lands on quiz.
2. Mirror does not appear prematurely.
3. No stale style or portrait is visible.
Evidence:
Capture post-login destination.
Severity if failed:
Severity 1.

### TC-BOOT-003 Logout then login as different user
Objective:
Verify persisted local state does not leak between accounts.
Primary risk:
Cross-account vibe or history leakage.
Preconditions:
Two test accounts with different vibe or history states.
Steps:
1. Log in as account A and note vibe/history conditions.
2. Sign out.
3. Log in as account B.
Expected:
1. Account B sees only its own state.
2. Account A vibe, history, portrait, or profile data do not leak.
3. Entry view is correct for account B.
Evidence:
Capture before and after state for both accounts.
Severity if failed:
Severity 0.

### TC-BOOT-004 App relaunch while authenticated
Objective:
Verify authenticated restoration is stable after relaunch.
Primary risk:
Broken auth listener or duplicate bootstrap state.
Preconditions:
Already authenticated user.
Steps:
1. Close and relaunch the app or reopen the tab.
2. Wait for bootstrap.
3. Observe final view.
Expected:
1. User session restores predictably.
2. No flicker loop between auth and authenticated views occurs.
3. Final destination is correct.
Evidence:
Capture the relaunch sequence.
Severity if failed:
Severity 1.

### TC-QUIZ-001 Choose Street vibe
Objective:
Verify one vibe path from quiz to mirror.
Primary risk:
Broken vibe persistence or bad transition.
Preconditions:
Authenticated user on Vibe Check.
Steps:
1. Tap Choose Street vibe.
2. Wait for transition.
3. Observe resulting mirror screen.
Expected:
1. Mirror Mode opens.
2. No error appears.
3. Selection persists for future authenticated entry.
Evidence:
Capture the chosen vibe and resulting screen.
Severity if failed:
Severity 1.

### TC-QUIZ-002 Choose Classic vibe
Objective:
Verify the second vibe path behaves identically.
Primary risk:
One card wired differently than others.
Preconditions:
Authenticated user on quiz.
Steps:
1. Tap Choose Classic vibe.
2. Observe transition.
3. Confirm mirror opens.
Expected:
1. Transition succeeds.
2. No layout break occurs.
3. Saved vibe reflects Classic path.
Evidence:
Capture result and any persistence indication.
Severity if failed:
Severity 1.

### TC-QUIZ-003 Choose Flow vibe
Objective:
Verify the third vibe path behaves correctly.
Primary risk:
Option-specific state bug.
Preconditions:
Authenticated user on quiz.
Steps:
1. Tap Choose Flow vibe.
2. Observe transition.
3. Confirm mirror opens.
Expected:
1. Transition succeeds.
2. No stale earlier vibe remains.
3. Mirror is fully interactive.
Evidence:
Capture result.
Severity if failed:
Severity 1.

### TC-QUIZ-004 Settings access from quiz
Objective:
Verify the user can open settings before selecting a vibe.
Primary risk:
Blocked access to profile and logout paths.
Preconditions:
Quiz screen visible.
Steps:
1. Tap the avatar or settings icon.
2. Observe the sheet.
3. Dismiss it.
Expected:
1. Settings sheet opens.
2. It respects safe areas and remains readable.
3. Dismissal returns cleanly to quiz.
Evidence:
Capture open and closed states.
Severity if failed:
Severity 1.

### TC-MIRROR-001 Upload portrait happy path
Objective:
Verify image upload opens the main creation funnel.
Primary risk:
Broken file-input path on iPhone.
Preconditions:
Mirror screen with no portrait selected.
Steps:
1. Tap Upload.
2. Select a valid portrait image.
3. Wait for preview and analysis.
Expected:
1. Portrait preview appears.
2. Vision analysis or loading overlay behaves coherently.
3. Style-generation buttons become available.
Evidence:
Capture selected image preview and resulting controls.
Severity if failed:
Severity 0.

### TC-MIRROR-002 Cancel file picker without selecting image
Objective:
Verify canceling upload does not corrupt state.
Primary risk:
Ghost loading or broken file input after cancel.
Preconditions:
Mirror with no portrait selected.
Steps:
1. Tap Upload.
2. Cancel selection.
3. Observe the screen.
Expected:
1. Mirror remains idle and usable.
2. No error toast appears unnecessarily.
3. Upload control still works on retry.
Evidence:
Capture post-cancel state.
Severity if failed:
Severity 2.

### TC-MIRROR-003 Upload unsupported or problematic image type
Objective:
Verify odd files fail clearly.
Primary risk:
Silent break or unusable preview state.
Preconditions:
Mirror ready for upload.
Steps:
1. Attempt an unusual format or problematic image.
2. Observe preview and analysis behavior.
3. Try to continue if the app allows it.
Expected:
1. Unsupported input is rejected clearly or handled gracefully.
2. App does not hang.
3. User can recover and choose a new file.
Evidence:
Capture exact failure behavior.
Severity if failed:
Severity 1.

### TC-MIRROR-004 Upload very large image
Objective:
Stress memory and image processing on iPhone.
Primary risk:
Tab reload, freeze, or impossible generation.
Preconditions:
Mirror screen open.
Steps:
1. Upload a large portrait image.
2. Wait for analysis.
3. Attempt generation.
Expected:
1. App stays responsive enough to recover.
2. If processing fails, the user gets feedback.
3. There is no permanent broken state.
Evidence:
Capture performance symptoms and any crash or reload.
Severity if failed:
Severity 1.

### TC-MIRROR-005 Camera permission allow path
Objective:
Verify live camera entry works on iPhone.
Primary risk:
Broken getUserMedia path or mirrored preview issues.
Preconditions:
Mirror with no portrait and permission not yet granted.
Steps:
1. Tap camera button.
2. Grant camera permission.
3. Observe live preview.
Expected:
1. Camera opens successfully.
2. Live video fits correctly.
3. Close-camera control is visible and tappable.
Evidence:
Capture preview and permission sequence.
Severity if failed:
Severity 0.

### TC-MIRROR-006 Camera permission deny path
Objective:
Verify denial is recoverable and understandable.
Primary risk:
Dead-end camera state.
Preconditions:
Camera permission not granted.
Steps:
1. Tap camera button.
2. Deny permission.
3. Observe response.
Expected:
1. App reports a clear error or toast.
2. User remains able to upload instead.
3. Screen does not become blocked.
Evidence:
Capture toast text and visible options afterward.
Severity if failed:
Severity 1.

### TC-MIRROR-007 Capture photo happy path
Objective:
Verify the camera-to-portrait path works end to end.
Primary risk:
Captured image fails to populate or analysis does not follow.
Preconditions:
Camera open with permission granted.
Steps:
1. Frame a face.
2. Tap capture.
3. Observe resulting still image state.
Expected:
1. Captured image becomes the portrait preview.
2. Camera closes cleanly.
3. Generation options appear when ready.
Evidence:
Capture before capture and after capture states.
Severity if failed:
Severity 0.

### TC-MIRROR-008 Open camera then close without capture
Objective:
Verify cancellation from camera mode.
Primary risk:
Camera cannot be closed or leaves broken overlay.
Preconditions:
Camera preview open.
Steps:
1. Open camera.
2. Tap close camera.
3. Return to idle mirror state.
Expected:
1. Camera closes immediately.
2. No stale video or black layer remains.
3. Upload and camera actions still work afterward.
Evidence:
Capture exit behavior.
Severity if failed:
Severity 2.

### TC-MIRROR-009 Back from mirror to quiz
Objective:
Verify reverse navigation from mirror.
Primary risk:
Back control clipped or state not cleaned up.
Preconditions:
Mirror screen open with or without portrait.
Steps:
1. Tap back.
2. Observe destination.
3. Return to mirror if possible through vibe selection.
Expected:
1. Quiz opens.
2. Camera, overlays, or stale processing do not remain.
3. Returning forward still works.
Evidence:
Capture navigation both directions.
Severity if failed:
Severity 1.

### TC-MIRROR-010 Toggle 360 overlay
Objective:
Verify the 360 control does what it actually does.
Primary risk:
Misleading feature semantics or broken overlay interaction.
Preconditions:
Mirror screen open.
Steps:
1. Tap the 360 toggle once.
2. Observe overlay effect.
3. Tap again to turn it off.
Expected:
1. A visual overlay appears and disappears.
2. The app does not imply true 3D behavior unless supported.
3. Overlay does not block critical actions.
Evidence:
Capture on and off states.
Severity if failed:
Severity 2, or Severity 1 if it misleads users materially.

### TC-MIRROR-011 Clear selected portrait
Objective:
Verify users can reset the portrait and start over.
Primary risk:
Stale analysis or generation state remains after clearing.
Preconditions:
Portrait already loaded.
Steps:
1. Tap the clear portrait control.
2. Observe the canvas.
3. Try upload or camera again.
Expected:
1. Portrait is removed.
2. Analysis and generated look state clear appropriately.
3. User can restart from clean mirror state.
Evidence:
Capture before and after clearing.
Severity if failed:
Severity 1.

### TC-MIRROR-012 Open settings from mirror
Objective:
Verify settings remain accessible mid-funnel.
Primary risk:
Hidden or broken account actions during creation flow.
Preconditions:
Mirror visible.
Steps:
1. Tap avatar/settings.
2. Inspect sheet.
3. Close settings.
Expected:
1. Sheet opens over mirror without layout corruption.
2. Mirror state remains intact underneath.
3. Dismiss returns cleanly.
Evidence:
Capture overlay and return state.
Severity if failed:
Severity 1.

### TC-MIRROR-013 Stylist notes layout after analysis
Objective:
Verify analysis results remain readable on iPhone.
Primary risk:
Text cut-off in the notes card or chip row.
Preconditions:
Portrait uploaded and analysis result available.
Steps:
1. Inspect face-shape and hair chips.
2. Inspect stylist advice copy.
3. Rotate to landscape and inspect again.
Expected:
1. Notes remain readable.
2. Chips do not overflow in a broken way.
3. Action cards remain visible below.
Evidence:
Capture portrait and landscape.
Severity if failed:
Severity 1.

### TC-MIRROR-014 Generate each available style option
Objective:
Verify every style card actually triggers generation.
Primary risk:
One or more style cards miswired or broken.
Preconditions:
Portrait available and style buttons visible.
Steps:
1. Record the list of visible styles.
2. Trigger generation for each style in separate runs.
3. Verify each run reaches refine.
Expected:
1. Every style card is tappable.
2. Every style initiates Magic Studio.
3. The resulting selected style label matches the tapped style.
Evidence:
Capture at least one screenshot per style result.
Severity if failed:
Severity 1.

### TC-MIRROR-015 Upload then immediately open settings
Objective:
Verify rapid user behavior does not confuse state.
Primary risk:
Race conditions between analysis and overlays.
Preconditions:
Mirror ready to upload.
Steps:
1. Upload a portrait.
2. Immediately tap settings while analysis is starting or just finished.
3. Close settings and continue.
Expected:
1. App remains stable.
2. Analysis either completes cleanly or reports failure clearly.
3. Mirror remains usable after closing settings.
Evidence:
Capture timing-sensitive behavior.
Severity if failed:
Severity 2.

### TC-MAGIC-001 Generation happy path with one style
Objective:
Verify Magic Studio to Refine path works on iPhone.
Primary risk:
Generation stalls or never exits loading view.
Preconditions:
Portrait uploaded and a style chosen.
Steps:
1. Tap a style.
2. Observe Magic Studio status text.
3. Wait for Refine Studio.
Expected:
1. Process steps appear.
2. User eventually reaches Refine Studio.
3. No permanent spinner or freeze occurs.
Evidence:
Capture full run video.
Severity if failed:
Severity 0.

### TC-MAGIC-002 Generation under background and resume
Objective:
Verify generation behaves predictably when interrupted.
Primary risk:
Broken abort handling or stuck processing state.
Preconditions:
Generation in progress.
Steps:
1. Start generation.
2. Background the app during Magic Studio.
3. Resume after several seconds.
Expected:
1. App either continues cleanly or recovers with clear messaging.
2. User is not stranded in a perpetual loading state.
3. Mirror or Refine remains usable afterward.
Evidence:
Capture before and after resume states.
Severity if failed:
Severity 1.

### TC-MAGIC-003 Generation under poor network or offline
Objective:
Verify local-first claims under weak connectivity.
Primary risk:
Unexpected remote dependency blocks generation.
Preconditions:
Portrait uploaded and style available.
Steps:
1. Start online and then reduce network quality, or go offline where feasible.
2. Trigger generation.
3. Observe behavior.
Expected:
1. If generation is truly local-first, the path should mostly continue.
2. If a dependency fails, user gets an understandable error.
3. App returns to mirror recoverably on failure.
Evidence:
Capture network state and visible result.
Severity if failed:
Severity 1 if local-first promise is violated without explanation.

### TC-MAGIC-004 Generation error fallback to mirror
Objective:
Verify failed generation recovers cleanly.
Primary risk:
User trapped in Magic Studio.
Preconditions:
A condition that can trigger generation failure.
Steps:
1. Trigger a failure case if possible.
2. Observe toast and destination.
3. Attempt a second generation afterward.
Expected:
1. User receives an error toast.
2. App returns to mirror instead of stalling forever.
3. User can retry.
Evidence:
Capture exact error and state recovery.
Severity if failed:
Severity 1.

### TC-MAGIC-005 Long process-step text visual audit
Objective:
Verify large status text does not clip on smaller iPhones.
Primary risk:
Process messaging cut off during generation.
Preconditions:
Magic Studio active.
Steps:
1. Observe several process-step messages.
2. Check portrait and landscape if possible.
3. Inspect vertical centering and line wrap.
Expected:
1. Step labels remain readable.
2. The card does not overflow the viewport.
3. Motion effects do not obscure the message.
Evidence:
Capture multiple process steps.
Severity if failed:
Severity 2.

### TC-REFINE-001 Hold-to-compare touch interaction
Objective:
Verify the key touch gesture works on iPhone.
Primary risk:
Touch handlers do not behave as intended on real mobile hardware.
Preconditions:
Refine Studio open with generated and original image available.
Steps:
1. Press and hold on the image area.
2. Observe whether the original image appears.
3. Release touch.
Expected:
1. Pressing shows original.
2. Releasing returns to generated image.
3. Interaction feels responsive and discoverable enough.
Evidence:
Capture video of the gesture.
Severity if failed:
Severity 1.

### TC-REFINE-002 Hold-to-compare visual clarity
Objective:
Verify users can understand what changed during compare.
Primary risk:
Gesture works technically but not UX-wise.
Preconditions:
Refine screen active.
Steps:
1. Use compare gesture several times.
2. Observe label changes and image transitions.
3. Judge whether the control is discoverable without training.
Expected:
1. Label clearly indicates Original versus AI Preview or AI Simulation.
2. Transition is visible and stable.
3. No accidental stuck state persists.
Evidence:
Capture gesture and note discoverability issues.
Severity if failed:
Severity 2.

### TC-REFINE-003 Smart suggestion chips
Objective:
Verify suggestion controls behave honestly.
Primary risk:
Buttons imply true refinement but only show toasts.
Preconditions:
Refine screen visible.
Steps:
1. Tap each suggestion chip one by one.
2. Observe visual result and toast feedback.
3. Compare image before and after.
Expected:
1. If the image does not change, the product should not imply it did.
2. Toasts must not overstate an update.
3. User should not be misled into thinking real refinement occurred.
Evidence:
Capture each chip behavior.
Severity if failed:
Severity 1 for trust/expectation mismatch.

### TC-REFINE-004 Refinement suite icon buttons
Objective:
Verify Length, Volume, Color, and Texture controls.
Primary risk:
UI suggests functionality that does not exist.
Preconditions:
Refine screen visible.
Steps:
1. Tap each refinement tool.
2. Observe image, toast, and any state change.
3. Return to neutral state if possible.
Expected:
1. Behavior is consistent and honest.
2. If tools are placeholders, that should be obvious rather than deceptive.
3. App does not enter contradictory state.
Evidence:
Capture all tool interactions.
Severity if failed:
Severity 1.

### TC-REFINE-005 Save button opens share screen
Objective:
Verify Save semantics and transition.
Primary risk:
Misleading terminology or broken progression.
Preconditions:
Refine screen open.
Steps:
1. Tap Save.
2. Observe destination.
3. Inspect whether anything was actually saved or simply navigated.
Expected:
1. User reaches Share Studio.
2. If no real save occurred yet, the UX should not imply completed persistence.
3. Back navigation remains available.
Evidence:
Capture the transition and wording.
Severity if failed:
Severity 1 if wording is materially misleading.

### TC-REFINE-006 Back from refine to mirror
Objective:
Verify reverse navigation preserves enough context.
Primary risk:
Accidental loss of generated result or impossible return.
Preconditions:
Refine screen open after successful generation.
Steps:
1. Tap back.
2. Inspect mirror state.
3. Attempt to generate again or return forward.
Expected:
1. Mirror opens cleanly.
2. No broken overlay persists.
3. User can continue using the session.
Evidence:
Capture back navigation and resulting state.
Severity if failed:
Severity 1.

### TC-SHARE-001 Share screen layout in portrait
Objective:
Verify Share Studio visual hierarchy on iPhone.
Primary risk:
Tall content pushes CTA off-screen or clips metadata.
Preconditions:
Share screen open on iPhone portrait.
Steps:
1. Inspect hero card, barber brief, stats cards, and bottom CTA.
2. Scroll if needed.
3. Observe bottom safe-area padding.
Expected:
1. CTA remains reachable.
2. Copy and cards remain readable.
3. No text is clipped near the bottom safe area.
Evidence:
Capture full-screen screenshots top and bottom.
Severity if failed:
Severity 1.

### TC-SHARE-002 Share screen layout in landscape
Objective:
Verify the most failure-prone orientation for a dense screen.
Primary risk:
Card overflow and impossible CTA reach.
Preconditions:
Share screen open.
Steps:
1. Rotate to landscape.
2. Inspect scrollability and CTA placement.
3. Try interacting with the primary CTA.
Expected:
1. Scroll remains usable.
2. CTA is reachable.
3. Hero card and text do not collapse badly.
Evidence:
Capture landscape share screen.
Severity if failed:
Severity 1.

### TC-SHARE-003 Native share success path on iPhone
Objective:
Verify the primary iPhone share path.
Primary risk:
Share sheet opens but does not represent the exported look.
Preconditions:
Share screen on iPhone with native share available.
Steps:
1. Tap Share Preview.
2. Observe native share sheet contents.
3. Complete a share to a safe destination if possible.
Expected:
1. Native share sheet opens only from direct user activation.
2. Shared payload should match product expectation.
3. Any mismatch between "share preview" wording and actual shared content must be reported.
Evidence:
Capture what is actually being shared, such as URL-only versus image.
Severity if failed:
Severity 1 if wording overpromises.

### TC-SHARE-004 Native share cancel path
Objective:
Verify user-canceled share does not corrupt state.
Primary risk:
Unhandled share rejection or broken UI after cancel.
Preconditions:
Share screen with native share available.
Steps:
1. Tap Share Preview.
2. Cancel native share.
3. Return to the app.
Expected:
1. App remains stable.
2. No false success message appears.
3. User can try again or navigate back.
Evidence:
Capture post-cancel state.
Severity if failed:
Severity 2.

### TC-SHARE-005 Actual image-download path on iPhone
Objective:
Verify whether an iPhone user can truly download or save the generated image.
Primary risk:
The product claims a download-like outcome that does not exist on iPhone.
Preconditions:
Share screen open on iPhone.
Steps:
1. Determine whether a Download PNG button is present.
2. If not present, inspect whether native share offers actual image-file sharing or only URL sharing.
3. Attempt to save the result to Photos or Files if available.
Expected:
1. If there is no true image download or file-share path on iPhone, report it clearly.
2. Product wording must not imply image export if only URL sharing exists.
3. User expectations must be judged realistically.
Evidence:
Capture the actual native share payload and note absence of image file if confirmed.
Severity if failed:
Severity 1.

### TC-SHARE-006 PNG export fallback when native share unavailable
Objective:
Verify the non-native-share export path still works somewhere in the matrix.
Primary risk:
Export code exists but never works when invoked.
Preconditions:
A context where native share is unavailable.
Steps:
1. Open share screen in a non-native-share environment.
2. Tap Download PNG.
3. Inspect resulting file and naming.
Expected:
1. PNG export completes.
2. File is named sensibly.
3. Exported image includes before/after card and metadata as intended.
Evidence:
Save the generated file and inspect it.
Severity if failed:
Severity 1.

### TC-SHARE-007 Back from share to refine
Objective:
Verify reverse navigation out of Share Studio.
Primary risk:
Back navigation loses state or misroutes.
Preconditions:
Share screen open.
Steps:
1. Tap back.
2. Observe refine screen.
3. Re-enter share again.
Expected:
1. Refine reappears.
2. Generated result remains intact.
3. Re-entering share works again.
Evidence:
Capture both transitions.
Severity if failed:
Severity 1.

### TC-SHARE-008 Share screen copy trust audit
Objective:
Verify user-facing labels honestly describe the system.
Primary risk:
Trust gap between wording and real behavior.
Preconditions:
Share screen open.
Steps:
1. Read labels like Share Preview and style metadata.
2. Compare wording to actual behavior and payload.
3. Flag any overstatement.
Expected:
1. Labels align with what the system truly does.
2. If the app shares a URL instead of the image, that gap is clearly documented.
3. If Save does not truly save, that gap is also documented.
Evidence:
Capture screenshots and actual output.
Severity if failed:
Severity 1.

### TC-SETTINGS-001 Settings sheet layout on iPhone
Objective:
Verify the bottom sheet respects safe areas and remains readable.
Primary risk:
Bottom sheet clipped by home indicator or too tall in landscape.
Preconditions:
Settings opened from quiz or mirror.
Steps:
1. Inspect sheet in portrait.
2. Inspect sheet in landscape.
3. Attempt to scroll if content exceeds height.
Expected:
1. Sheet remains readable and dismissible.
2. Sign Out remains reachable.
3. No content is hidden below home indicator.
Evidence:
Capture both orientations.
Severity if failed:
Severity 1.

### TC-SETTINGS-002 Local Only toggle on
Objective:
Verify enabling Local Only changes behavior as promised.
Primary risk:
Privacy promise does not match actual behavior.
Preconditions:
Authenticated user with settings open.
Steps:
1. Toggle Local Only on.
2. Read explanatory copy.
3. Later test profile photo upload and history behavior under this setting.
Expected:
1. Toggle visibly changes state.
2. Explanatory copy remains readable.
3. Downstream behavior matches the promise.
Evidence:
Capture toggle on state and later correlated behavior.
Severity if failed:
Severity 1.

### TC-SETTINGS-003 Local Only toggle off
Objective:
Verify disabling Local Only restores cloud-linked behavior.
Primary risk:
Toggle appears cosmetic.
Preconditions:
Settings open and Local Only currently on.
Steps:
1. Toggle Local Only off.
2. Read explanatory text.
3. Proceed to profile photo upload test.
Expected:
1. State changes visibly.
2. Copy remains accurate and readable.
3. Profile photo upload path can use remote storage if configured.
Evidence:
Capture toggle off state.
Severity if failed:
Severity 1.

### TC-SETTINGS-004 AI runtime status readability
Objective:
Verify Local Concierge runtime status is understandable on iPhone.
Primary risk:
Tiny dense status text becomes illegible.
Preconditions:
Settings sheet open.
Steps:
1. Inspect model label, device target, RAG label, and status badge.
2. Trigger or observe warmup if possible.
3. Read progress content on a smaller phone.
Expected:
1. Status badge is legible.
2. Progress bar and percentage are readable.
3. Error text, if any, is not clipped.
Evidence:
Capture status card in different states.
Severity if failed:
Severity 2.

### TC-SETTINGS-005 Style Preferences row behavior
Objective:
Verify whether the user can actually use Style Preferences.
Primary risk:
Dead button presented as active navigation.
Preconditions:
Settings sheet open.
Steps:
1. Tap Style Preferences.
2. Observe response.
3. Repeat in case of missed tap.
Expected:
1. Either navigation occurs or it is clearly unavailable.
2. If nothing happens, report as dead-end CTA.
3. Touch target behavior is recorded.
Evidence:
Capture tap attempts and resulting no-op if confirmed.
Severity if failed:
Severity 1.

### TC-SETTINGS-006 Dismiss settings by backdrop tap
Objective:
Verify sheet dismissal behavior is predictable.
Primary risk:
Accidental dismissal or failure to dismiss.
Preconditions:
Settings sheet open.
Steps:
1. Tap outside the sheet.
2. Observe dismissal.
3. Reopen and verify state remains stable.
Expected:
1. Sheet dismisses intentionally.
2. Underlying screen remains intact.
3. No accidental action triggers under the sheet.
Evidence:
Capture dismissal behavior.
Severity if failed:
Severity 2.

### TC-PROFILE-001 Open Edit Profile modal
Objective:
Verify the profile-edit path is reachable.
Primary risk:
Broken modal launch from settings.
Preconditions:
Settings sheet open.
Steps:
1. Tap Edit Profile.
2. Observe modal appearance.
3. Inspect header and content.
Expected:
1. Modal opens.
2. Header shows Cancel and Done.
3. Content area is scrollable and readable.
Evidence:
Capture initial modal state.
Severity if failed:
Severity 1.

### TC-PROFILE-002 Edit profile name and save
Objective:
Verify display-name update path.
Primary risk:
Silent failure or partial local-only update.
Preconditions:
Edit Profile open and authenticated user available.
Steps:
1. Change the Name field.
2. Tap Done.
3. Inspect avatar area, settings sheet, and future sessions if possible.
Expected:
1. Updated name is reflected in the UI.
2. No error is silently swallowed.
3. Persistence behavior is clear.
Evidence:
Capture before and after name displays.
Severity if failed:
Severity 1.

### TC-PROFILE-003 Cancel edit profile without saving
Objective:
Verify changes are not applied on cancel.
Primary risk:
Unintended writes or stale local UI state.
Preconditions:
Edit Profile open.
Steps:
1. Modify Name or Bio.
2. Tap Cancel.
3. Reopen the modal.
Expected:
1. Unsaved changes do not persist unless intentionally designed.
2. Reopening shows the authoritative value.
3. Modal closes cleanly.
Evidence:
Capture before cancel and after reopen.
Severity if failed:
Severity 2.

### TC-PROFILE-004 Profile photo upload with Local Only off
Objective:
Verify remote-sync profile photo path.
Primary risk:
Upload fails silently or UI falsely implies sync succeeded.
Preconditions:
Authenticated user, Local Only off, Edit Profile open.
Steps:
1. Tap Change profile photo.
2. Select an image.
3. Wait for update.
Expected:
1. Avatar updates.
2. If remote upload fails, the fallback behavior is clear.
3. Result remains visible after closing and reopening settings.
Evidence:
Capture upload sequence and final avatar state.
Severity if failed:
Severity 1.

### TC-PROFILE-005 Profile photo upload with Local Only on
Objective:
Verify local-only privacy behavior for avatar updates.
Primary risk:
App uploads despite privacy promise or misleads user.
Preconditions:
Authenticated user, Local Only on, Edit Profile open.
Steps:
1. Select a new profile photo.
2. Observe immediate update.
3. Sign out and relaunch or inspect on another session if possible.
Expected:
1. Photo can update locally for the current device session.
2. Behavior aligns with copy that it stays on this device.
3. Any cross-device absence is explainable and not surprising.
Evidence:
Capture local-only explanatory copy and resulting behavior.
Severity if failed:
Severity 1.

### TC-PROFILE-006 Keyboard overlap in Edit Profile modal
Objective:
Verify the tall bottom sheet survives iPhone keyboard behavior.
Primary risk:
Fields or Done button become unreachable.
Preconditions:
Edit Profile modal open on iPhone.
Steps:
1. Focus Name field.
2. Focus Bio field.
3. Try to reach Done while keyboard is open.
Expected:
1. Active field stays visible.
2. Scrolling allows access to hidden content.
3. Done and Cancel remain reachable or clearly recoverable.
Evidence:
Capture keyboard-open state on small and large iPhones.
Severity if failed:
Severity 0 if profile editing becomes impossible.

### TC-PROFILE-007 Long display name and long email in profile modal
Objective:
Stress text wrapping and fixed-width controls.
Primary risk:
Header or fields clip long user identity content.
Preconditions:
User with long name and long email local part.
Steps:
1. Open Edit Profile.
2. Inspect name, username, and labels.
3. Check portrait and landscape if possible.
Expected:
1. Long strings remain readable or sensibly truncated.
2. Layout does not break.
3. Inputs remain usable.
Evidence:
Capture all identity fields.
Severity if failed:
Severity 1.

### TC-PROFILE-008 Bio persistence verification
Objective:
Verify whether the editable Bio field actually persists anywhere.
Primary risk:
Deceptive editable field with no real save.
Preconditions:
Edit Profile open.
Steps:
1. Enter a distinctive bio.
2. Tap Done.
3. Reopen modal and inspect wider app surfaces for bio usage.
Expected:
1. If the bio is not persisted or displayed anywhere, report the gap explicitly.
2. Product should not imply the bio was saved if it was not.
3. Users should not lose entered content silently.
Evidence:
Capture before save and after reopen.
Severity if failed:
Severity 1.

### TC-PERSIST-001 Generated history saved for signed-in user with Local Only off
Objective:
Verify the backend history path after generation.
Primary risk:
Shareable output appears saved but backend history is missing.
Preconditions:
Authenticated user, Local Only off, successful generation completed.
Steps:
1. Generate a look.
2. Finish the flow.
3. Verify backend or synced history state if tools permit.
Expected:
1. History entry exists in the user record path.
2. At minimum the app should not falsely imply persistence if none occurred.
3. Future sessions should reflect that history exists, even if UI browsing is absent.
Evidence:
Capture backend verification or explain inability to inspect.
Severity if failed:
Severity 1.

### TC-PERSIST-002 History browsing discoverability
Objective:
Verify whether a user can actually access saved history.
Primary risk:
Data is saved but effectively inaccessible.
Preconditions:
At least one generated history entry exists.
Steps:
1. Search the UI for any history or past looks surface.
2. Explore settings, mirror, refine, and share for entry points.
3. Confirm absence if none exists.
Expected:
1. If no history UI exists, report as missing feature.
2. Do not treat backend-only existence as sufficient UX.
3. Note expectation mismatch if the product suggests saved looks can be revisited.
Evidence:
Capture searched surfaces and missing navigation.
Severity if failed:
Severity 1.

### TC-PERSIST-003 Sign out path
Objective:
Verify sign out is available and returns to auth cleanly.
Primary risk:
Users cannot exit account or session cleanup is incomplete.
Preconditions:
Authenticated user and settings open.
Steps:
1. Tap Sign Out.
2. Observe transition.
3. Inspect post-sign-out UI.
Expected:
1. User returns to auth.
2. Session-specific portrait and generated content clear.
3. No authenticated controls remain visible.
Evidence:
Capture before and after sign out.
Severity if failed:
Severity 0.

### TC-PERSIST-004 Relaunch after sign out
Objective:
Verify sign-out state survives relaunch.
Primary risk:
Stale session or cached return to authenticated flow.
Preconditions:
Just signed out.
Steps:
1. Close and relaunch the app.
2. Observe startup.
3. Inspect whether auth is required again.
Expected:
1. User remains signed out.
2. App does not jump back into mirror or quiz as if still authenticated.
3. No stale previous-user image or history appears.
Evidence:
Capture relaunch result.
Severity if failed:
Severity 0.

### TC-PERSIST-005 Sign out then sign in as another user
Objective:
Verify no persisted vibe, history, or profile bleed occurs.
Primary risk:
Cross-account privacy breach.
Preconditions:
Two accounts with materially different data.
Steps:
1. Sign out from account A.
2. Sign in as account B.
3. Inspect vibe destination, settings, profile, and any history traces.
Expected:
1. Account B sees only B's state.
2. Account A identity or vibe does not leak.
3. Landing view matches B's real backend state.
Evidence:
Capture both account states side by side.
Severity if failed:
Severity 0.

### TC-PERSIST-006 Local Only mode persistence across sessions
Objective:
Verify whether Local Only persists and whether that is intuitive.
Primary risk:
Privacy-related setting flips unexpectedly or persists across users unsafely.
Preconditions:
Settings available.
Steps:
1. Toggle Local Only on or off.
2. Relaunch the app.
3. Sign out and sign in as another user if possible.
Expected:
1. Persistence behavior is consistent.
2. If the setting is device-level rather than account-level, document that clearly.
3. No privacy expectation mismatch occurs.
Evidence:
Capture state before and after relaunch and account switch.
Severity if failed:
Severity 1.

### TC-UX-001 Auth screen text clipping audit
Objective:
Perform a focused typography audit where the owner already suspects failure.
Primary risk:
Cut-off brand, errors, or mode-switch copy.
Preconditions:
Auth screen in portrait and landscape.
Steps:
1. Inspect top slogan.
2. Inspect card headline and button labels.
3. Inspect footer account-switch prompt and long error state.
Expected:
1. All text remains readable.
2. No hard clipping or awkward wraps reduce clarity.
3. Tappable text remains tappable.
Evidence:
Capture annotated screenshots.
Severity if failed:
Severity 1, or Severity 0 if flow is blocked.

### TC-UX-002 Quiz screen card-fit audit
Objective:
Verify large vibe cards fit and remain readable.
Primary risk:
Grid cards force overflow or hidden buttons on short devices.
Preconditions:
Quiz screen visible.
Steps:
1. Inspect portrait on small and large iPhones.
2. Inspect landscape.
3. Scroll if needed and note whether grid feels intentional or broken.
Expected:
1. Cards remain tappable.
2. Text overlays remain readable over images.
3. Avatar/settings control remains visible.
Evidence:
Capture full quiz screen.
Severity if failed:
Severity 1.

### TC-UX-003 Mirror controls reachability audit
Objective:
Verify bottom controls are not home-indicator victims.
Primary risk:
Camera, upload, or generate controls sit too low.
Preconditions:
Mirror visible with and without portrait.
Steps:
1. Inspect bottom controls in portrait.
2. Inspect in landscape.
3. Attempt one-handed interaction if possible.
Expected:
1. Controls remain above safe area enough to use.
2. No accidental home-swipe conflict dominates interaction.
3. Labels remain readable.
Evidence:
Capture control area close-ups.
Severity if failed:
Severity 1.

### TC-UX-004 Magic Studio readability audit
Objective:
Verify the dense animated loading scene does not obscure status.
Primary risk:
Beautiful but unreadable generation state.
Preconditions:
Magic Studio active.
Steps:
1. Inspect animated rings and text contrast.
2. Check small iPhone and landscape if possible.
3. Judge whether status remains readable during motion.
Expected:
1. Status is readable.
2. Motion does not dominate meaning.
3. No clipped text occurs.
Evidence:
Capture video and still frame.
Severity if failed:
Severity 2.

### TC-UX-005 Refine screen safe-area and bottom-toolbar audit
Objective:
Verify bottom refinement controls remain usable.
Primary risk:
Toolbar compressed by safe area or compare image.
Preconditions:
Refine screen open.
Steps:
1. Inspect bottom toolbar in portrait.
2. Inspect landscape.
3. Tap each tool near screen edges.
Expected:
1. Buttons are fully visible.
2. Labels remain readable.
3. Safe-area padding feels sufficient but not excessive.
Evidence:
Capture toolbar in both orientations.
Severity if failed:
Severity 1.

### TC-UX-006 Share screen scroll behavior audit
Objective:
Verify long content scrolls naturally on iPhone.
Primary risk:
Nested scroll or trapped CTA.
Preconditions:
Share screen open.
Steps:
1. Scroll from hero card to CTA.
2. Attempt quick flick and slow drag.
3. Inspect whether any area traps scrolling unexpectedly.
Expected:
1. Scrolling is smooth and unsurprising.
2. CTA remains reachable.
3. No scroll-jank or dead zone appears.
Evidence:
Capture screen recording.
Severity if failed:
Severity 2.

### TC-UX-007 Settings and profile sheet typography audit
Objective:
Verify sheet-based surfaces do not cut off copy.
Primary risk:
Dense small text unreadable on iPhone.
Preconditions:
Settings and Edit Profile accessible.
Steps:
1. Inspect explanatory copy in settings.
2. Inspect profile field labels and helper copy.
3. Check long display names and dynamic keyboard presence.
Expected:
1. Copy is readable.
2. Nothing clips behind rounded corners or home indicator.
3. Tap targets remain comfortable.
Evidence:
Capture both sheets.
Severity if failed:
Severity 1.

### TC-UX-008 Touch target audit across the entire app
Objective:
Verify the app is finger-usable, not just mouse-usable.
Primary risk:
Premium visuals with tiny mobile hit targets.
Preconditions:
Run across all major screens.
Steps:
1. Evaluate top-left back icons.
2. Evaluate small chips and avatar buttons.
3. Evaluate secondary controls like Show, Close Camera, and sheet handles.
Expected:
1. Controls are reliably tappable.
2. No repeated failed taps are required.
3. Edges and corners remain usable with a case or thumb.
Evidence:
Capture notes on hit reliability.
Severity if failed:
Severity 1.

### TC-A11Y-001 VoiceOver-style semantic audit
Objective:
Verify core controls expose meaningful labels.
Primary risk:
Critical touch controls are unlabeled or confusing.
Preconditions:
Accessibility tools available or semantic inspection possible.
Steps:
1. Inspect auth buttons, settings, upload, camera, back, save, and share controls.
2. Verify important controls have sensible labels.
3. Note any purely decorative text presented as critical without semantic structure.
Expected:
1. Core actions are labeled clearly.
2. Dialog and modal semantics are coherent.
3. Screen-reader users can reach the main funnel.
Evidence:
Capture accessibility tree or narrated results.
Severity if failed:
Severity 1.

### TC-A11Y-002 Focus order and modal trapping
Objective:
Verify modal interactions do not create focus confusion.
Primary risk:
Keyboard or assistive navigation escapes the active surface.
Preconditions:
Settings or Edit Profile open.
Steps:
1. Traverse interactive elements if a focus method is available.
2. Attempt dismissal and return.
3. Confirm focus returns sensibly.
Expected:
1. Active modal owns interaction.
2. Background controls do not steal focus unexpectedly.
3. Exit returns control to a logical element.
Evidence:
Capture accessibility findings.
Severity if failed:
Severity 2.

### TC-A11Y-003 Contrast audit on glass surfaces
Objective:
Verify the luxury visual style does not damage readability.
Primary risk:
White-on-glass text too low contrast over imagery.
Preconditions:
Auth, mirror notes, share, settings, and profile screens available.
Steps:
1. Inspect low-emphasis text over gradients and imagery.
2. Inspect small helper copy.
3. Flag any contrast that feels risky on actual iPhone brightness.
Expected:
1. Critical text is easy to read.
2. Secondary text remains readable enough for decisions.
3. Status and error text stand out when needed.
Evidence:
Capture the worst examples.
Severity if failed:
Severity 1.

### TC-A11Y-004 Reduced-motion sensibility audit
Objective:
Verify heavy animation does not block comprehension.
Primary risk:
Motion-rich screens feel premium but inaccessible or disorienting.
Preconditions:
Observe auth, magic, and transitions.
Steps:
1. Watch key transitions several times.
2. Judge whether motion delays action or hides feedback.
3. Note whether any screen would benefit from calmer alternatives.
Expected:
1. Motion supports meaning.
2. Motion does not block urgent actions.
3. Loading and compare states remain intelligible.
Evidence:
Capture videos of the most aggressive motion.
Severity if failed:
Severity 2.

### TC-ERR-001 Offline at app launch
Objective:
Verify first-load behavior without network.
Primary risk:
Blank screen or deceptive partial UI.
Preconditions:
App not yet loaded and network disabled.
Steps:
1. Open the app offline.
2. Observe initial render.
3. Re-enable network and see if recovery occurs.
Expected:
1. Failure is understandable.
2. Recovery is possible after network returns.
3. App does not get permanently stranded.
Evidence:
Capture offline and recovered states.
Severity if failed:
Severity 1.

### TC-ERR-002 Offline during auth submission
Objective:
Verify login and sign-up failures are intelligible when network drops.
Primary risk:
Spinner hangs forever or error never appears.
Preconditions:
Auth form ready.
Steps:
1. Fill the form.
2. Disable network just before submit.
3. Submit and observe.
Expected:
1. User gets a failure message.
2. Form becomes usable again.
3. No phantom success occurs.
Evidence:
Capture exact message and retry behavior.
Severity if failed:
Severity 1.

### TC-ERR-003 Offline during profile photo upload
Objective:
Verify fallback behavior for avatar updates.
Primary risk:
User loses selection or thinks upload succeeded remotely.
Preconditions:
Local Only off and Edit Profile open.
Steps:
1. Begin profile photo upload.
2. Simulate network loss.
3. Observe result.
Expected:
1. If remote upload fails, local preview fallback must be clear.
2. User should not be misled about cross-device sync.
3. App remains usable.
Evidence:
Capture final avatar state and any messaging gap.
Severity if failed:
Severity 1.

### TC-ERR-004 Offline during share or export path
Objective:
Verify share/export behavior under disconnected conditions.
Primary risk:
Broken share CTA or false success.
Preconditions:
Share screen open.
Steps:
1. Disable network if relevant.
2. Use native share or fallback export.
3. Observe behavior.
Expected:
1. Local image export should not depend on network unexpectedly.
2. URL-sharing limitations should be documented if network affects value.
3. App remains stable after failure or cancellation.
Evidence:
Capture actual result.
Severity if failed:
Severity 2.

### TC-ERR-005 Permission changes after initial denial
Objective:
Verify camera flow recovery after permission settings change.
Primary risk:
App never recovers after one denial.
Preconditions:
Camera permission denied once.
Steps:
1. Deny camera access.
2. Later re-enable permission in system settings if possible.
3. Return and try camera again.
Expected:
1. App can recover.
2. User is not trapped in a permanently broken camera state.
3. Error guidance is adequate.
Evidence:
Capture before and after permission change.
Severity if failed:
Severity 1.

### TC-ERR-006 Incoming interruption during camera or auth
Objective:
Stress interruption handling.
Primary risk:
Real-life interruption leaves corrupted state.
Preconditions:
Camera preview or auth redirect in progress.
Steps:
1. Trigger or simulate an interruption like app switching.
2. Return to the app.
3. Observe whether the active flow recovers.
Expected:
1. App either resumes or cleanly resets.
2. User is not trapped in a dead flow.
3. Critical CTA remains available.
Evidence:
Capture recorded interruption sequence.
Severity if failed:
Severity 2.

### TC-SEC-001 Sign-out privacy audit
Objective:
Verify sensitive UI and local session data disappear after sign out.
Primary risk:
User A data visible to User B or to a signed-out visitor.
Preconditions:
Authenticated session with generated result and profile info.
Steps:
1. Sign out.
2. Inspect auth screen and any accessible cached surfaces.
3. Try relogging with another user.
Expected:
1. Prior portrait and generated look are gone.
2. Prior user name and avatar do not persist incorrectly.
3. New user entry starts from clean account-specific state.
Evidence:
Capture all visible pre and post data.
Severity if failed:
Severity 0.

### TC-SEC-002 Local Only privacy promise audit
Objective:
Verify privacy copy matches actual behavior.
Primary risk:
Product claims local-only while syncing more than expected.
Preconditions:
Can toggle Local Only and inspect behavior.
Steps:
1. Turn Local Only on.
2. Generate looks and upload profile photo.
3. Inspect what appears to sync versus stay local.
Expected:
1. Behavior aligns with copy.
2. Any exceptions are clearly surfaced.
3. Users are not misled about storage boundaries.
Evidence:
Capture copy and actual outcomes.
Severity if failed:
Severity 1.

### TC-DELETE-001 Account deletion discoverability
Objective:
Verify whether a user can find any delete-account path.
Primary risk:
No account deletion path for privacy-sensitive app.
Preconditions:
Authenticated user.
Steps:
1. Search settings and profile edit surfaces.
2. Search sign-out area and secondary menus.
3. Confirm whether delete account exists.
Expected:
1. If no delete-account UI exists, report it as a missing core account-management feature.
2. Note whether there is any fallback guidance.
3. Evaluate severity based on product expectations and privacy concerns.
Evidence:
Capture searched UI surfaces and absence of control.
Severity if failed:
Severity 1 or Severity 0 depending on release requirements.

### TC-DELETE-002 Account deletion behavior if any hidden path exists
Objective:
Verify deletion is complete, reversible only as designed, and honest.
Primary risk:
Partial account deletion or misleading copy.
Preconditions:
Only if a delete path is discovered.
Steps:
1. Attempt deletion on a test account.
2. Observe auth state, profile state, and backend effects if inspectable.
3. Attempt re-login and inspect remnants.
Expected:
1. Account deletion path is explicit and confirmed.
2. User understands what will be deleted.
3. Post-delete remnants do not linger unexpectedly.
Evidence:
Capture full destructive flow and post-state.
Severity if failed:
Severity 0.

## Special Investigation Threads You Must Run Even If Standard Cases Pass

Investigate whether the auth failure the owner saw is reproducible only on iPhone Safari.
Investigate whether the auth failure is specific to Google redirect, email login, or both.
Investigate whether auth failure appears only in standalone PWA mode.
Investigate whether long Firebase error strings are clipping below the auth button.
Investigate whether the root App.css file still imposes desktop-era root max-width or padding side effects anywhere in the shell.
Investigate whether small iPhones or landscape mode are the real source of "text getting cut off".
Investigate whether the Edit Profile 85vh bottom sheet causes the Done button to become unreachable under keyboard.
Investigate whether Share Preview on iPhone is misleading because it shares only a URL, not the generated image.
Investigate whether Save on Refine is misleading because it only navigates to Share Studio.
Investigate whether Style Preferences is a dead-end CTA.
Investigate whether bio editing is a deceptive no-op.
Investigate whether history is stored but impossible for users to browse.
Investigate whether sign-out leaves behind the previous user's vibe because vibe state is locally persisted.
Investigate whether switching between two users on the same device leaks vibe or landing-view assumptions.
Investigate whether profile photo behavior under Local Only truly matches the explanatory copy.
Investigate whether 360 toggle creates a false feature expectation.

## Minimum Screenshots You Must Capture

Auth screen on iPhone portrait.
Auth screen on iPhone landscape.
Auth screen with keyboard open.
Auth screen with a long error message.
Quiz screen on small iPhone.
Mirror idle state.
Mirror with uploaded portrait and stylist notes.
Mirror with camera open.
Mirror bottom controls close-up.
Magic Studio mid-generation.
Refine screen normal state.
Refine screen during compare gesture.
Share screen top and bottom.
Settings sheet.
Edit Profile modal with keyboard open.
Any screen with text clipping.
Any screen with notch or home-indicator overlap.
Any broken auth or share state.

## Minimum Videos You Must Capture

Google redirect auth in Safari.
Google redirect auth in standalone PWA.
Email login from submit to destination.
Camera permission request and live preview.
Generation start to refine completion.
Hold-to-compare gesture.
Native share open and cancel.
Edit Profile keyboard overlap.
Sign out then sign in as another user.

## Reporting Format Template

Use this exact structure for each finding:
Finding ID:
Severity:
Title:
Path:
Device:
Mode:
Preconditions:
Steps to reproduce:
Expected result:
Actual result:
Evidence:
Why it matters:
Likely root cause if inferable:
Recommended fix direction:

Use this exact structure for the executive summary:
Overall release status:
Core user-path verdict:
Auth verdict:
iPhone UX verdict:
Share/export verdict:
Profile/persistence verdict:
Delete-account verdict:
Top 5 blockers:
Top 5 near-term improvements:

Use this exact structure for the coverage summary:
Screen:
Paths tested:
Passed:
Failed:
Blocked:
Missing by design or implementation:

## Final Decision Logic

Recommend no-go if any of the following are true:
Email login is broken on iPhone.
Google auth redirect is broken on iPhone Safari or standalone mode.
Keyboard overlap blocks auth or profile completion.
Critical CTAs are clipped or unreachable on common iPhones.
Sign-out leaks previous-user state into another account.
Share Preview materially misrepresents what is being shared.

Recommend conditional go only if:
Core auth works.
Core create flow works.
Layout issues are cosmetic rather than blocking.
Share/export limitations are clearly documented and acceptable.
Missing delete account is explicitly accepted as pre-existing scope debt.

## Guardrails Against Superficial Testing

Do not say "looks good overall" without enumerating what you actually covered.
Do not say "share works" unless you confirm exactly what payload leaves the device.
Do not say "save works" unless you confirm what was actually saved and where.
Do not say "profile edit works" unless name, photo, and bio persistence behavior are separately verified.
Do not say "logout works" unless cross-account leakage was tested.
Do not say "download works" unless a real iPhone user can actually save the generated image file.
Do not say "delete account not tested".
If it does not exist, say it is missing.

## Final Deliverable Standard

Your report must read like a release-quality iPhone product audit.
It must be blunt.
It must be specific.
It must not hide behind generic statements.
It must separate:
working paths,
broken paths,
missing paths,
misleading paths,
and ugly-but-functional paths.

Prompt end.