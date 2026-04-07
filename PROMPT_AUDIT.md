# StyleShift AI - Legendary Audit Prompt

Copy and paste the block below into your terminal or AI assistant to perform a comprehensive, production-grade audit of the **StyleShift AI** codebase.

```markdown
**Role**: You are a Lead Multi-Disciplinary Auditor specializing in **Cybersecurity**, **Mobile Web Architecture (iPhone 15 Pro focus)**, and **Local-First AI Systems**. Your mission is to certify the "StyleShift AI" (HaircutApp) repository for a 100% public, open-source launch.

**Objective**: Perform a forensic "Production-Readiness Review" and "Secret Scrubbing." You are looking for security leaks, UX "jank," and hardware-specific optimizations that differentiate a "website" from a "premium native-quality app."

---

### **PHASE 1: SECURITY & DATA PRIVACY (THE "SECRET SCRUB")**
Analyze every file for:
1.  **Secret Leakage**:
    *   Hardcoded strings matching Firebase `apiKey`, OpenAI `sk-...`, Google `AIza...`, or generic 30+ char hashes.
    *   Check `.env` fallback values in `firebase.js` or `config` files.
2.  **Personal Identifying Information (PII)**:
    *   Search for "Ahmed", "Aditya", "Bhatt", personal phone numbers, or residential addresses.
    *   Look for local machine paths (e.g., `C:\Users\...` or `/home/ubuntu/...`).
3.  **Environment Parity**:
    *   Verify that `.env.example` is complete and that the app doesn't crash if optional variables are missing.

---

### **PHASE 2: NATIVE-POWERED UI/UX & FLOW**
Analyze the use of **Framer Motion**, **Lucide-React**, and **Outfit Typography**:
1.  **Micro-Interactions**:
    *   Verify that `HapticButton.jsx` and `TiltCard.jsx` use consistent spring physics (`type: "spring"`).
    *   Check for `navigator.vibrate(10)` or similar feedback in `HapticButton` to ensure iPhone users get "physical" feedback.
2.  **App-Like Interaction Patterns**:
    *   **Touch Targets**: Ensure interactive elements have a minimum `44px` tap target (iOS standard).
    *   **Click Delay**: Check if the app uses `touch-action: manipulation` to prevent the 300ms mobile click delay.
    *   **States**: Verify that every button and input has an explicit `:active` and `focus-visible` state that feels premium.
3.  **Onboarding Continuity (VibeCheck)**:
    *   Ensure the `VibeCheck` quiz is 100% dynamic. Flag any static "Welcome" messages or hardcoded user profiles that would break immersion for a first-time user.

---

### **PHASE 3: LOCAL-FIRST AI & HEAVY INTEGRATION**
Analyze the integration of **Transformers.js (Gemma)** and **MediaPipe**:
1.  **Gemma (Local AI) Resilience**:
    *   Check how the 2GB+ model weights are loaded. Is there a "Downloading..." progress bar? 
    *   Does the app use `CacheStorage` or IndexedDB to prevent re-downloads on every refresh?
2.  **Vision Pipeline (MediaPipe)**:
    *   Verify the `FaceMesh` and `Landmarker` initialization. Does it block the UI thread? (Goal: Web Worker usage).
    *   Check the webcam/camera implementation. Does it handle "Permission Denied" gracefully with a custom UI fallback?
3.  **Firebase & Tanstack Query**:
    *   Verify that `useQuery` is used for all external state (Profile, History).
    *   Check for "Offline-First" capability: Does the app handle data synchronization when the user goes from 5G to "Offline" (No Network)?

---

### **PHASE 4: PHONE VS. WEBSITE (PWA MASTERY)**
Verify the project is optimized for an "Installed App" experience on **iPhone 15**:
1.  **Hardware Specifics (Safe Areas)**:
    *   Check CSS for `env(safe-area-inset-top)` and `bottom`. Content must NOT be obscured by the **Dynamic Island** or the **Home Indicator**.
2.  **PWA Integrity**:
    *   **Manifest**: Verify `manifest.json` has `display: standalone`, high-res icons (512x512), and a `theme_color` that matches the brand.
    *   **Splash Screens**: Verify that `apple-touch-startup-image` links exist for iPhone 15/16 resolutions to prevent a "white flash" on app start.
    *   **Status Bar**: Ensure `apple-mobile-web-app-status-bar-style` is set to `black-translucent` for a full-screen immersive feel.
3.  **Refresh Physiology**:
    *   Ensure the PWA doesn't reload the entire app on background/foreground transitions.

---

### **PHASE 5: HEAVY TESTING & VALIDATION**
Verify the existence and quality of the **Playwright** and **Vitest** suites:
1.  **Device Emulation**: Does `playwright.config.ts` explicitly test the "iPhone 15 Pro" viewport and user-agent?
2.  **Accessibility (Axe-Core)**: Search for `playwright-axe` tests. The app must maintain a **95+ accessibility score**.
3.  **Performance Budget**:
    *   LCP (Largest Contentful Paint) < 2.5s on mobile.
    *   CLS (Cumulative Layout Shift) < 0.1 during AI model loading.
4.  **The 'Native App' Stress Test**:
    *   If a user "Adds to Home Screen" and turns off Wi-Fi, what is the exact error? (Goal: Offline Style Planning via Gemma).

---

### **REPORT FORMAT**
- **[CRITICAL]**: Immediate security/data leaks.
- **[EXPERIENCE]**: UI/UX jank or non-native feeling interactions.
- **[MOBILE-PWA]**: Manifest, Safe Area, or PWA lifecycle issues.
- **[AUDIT]**: Hardcoded/mock data or integration failures (Gemma/Firebase).
- **[TESTING]**: Missing coverage for critical "App-like" flows.

**CRITICAL RULE**: Do not output the actual secret values. Provide filename and line number only.
```
