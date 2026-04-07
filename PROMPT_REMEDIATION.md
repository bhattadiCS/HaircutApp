# StyleShift AI - Final Remediation & Push-Ready Prompt

Copy and paste this prompt to your AI assistant to execute the final fixes required for a production-grade launch. This prompt is built directly from the raw audit findings of the previous "Legendary Audit."

```markdown
**Role**: You are a Senior Product Engineer & Mobile UX Specialist.
**Task**: Remediate all critical and audit-level findings for **StyleShift AI** to move the project from "Prototype" to "Production-Ready." The goal is a 100% green lighthouse score, accessibility compliance, and a seamless iPhone 15 Pro experience.

---

### **1. CRITICAL: Product Integrity & "MagicStudio" Fix**
The audit found that "generated" results are actually static Unsplash URLs.
- **Task**: Locate `src/features/studio/hooks/useStudioGeneration.js`. Replace the hardcoded Unsplash image mapping with a realistic local generation flow or an honest "AI Simulation" that uses the local Gemma/Heuristics to justify the result.
- **Task**: Align privacy copy in `SettingsSheet.jsx`. If photos are uploaded to Firebase, update the copy to be transparent, or implement a "Local Only" toggle that disables Firebase Storage uploads.

---

### **2. IPHONE 15 PRO & PWA INFRASTRUCTURE**
The audit found no safe-area handling and a broken PWA shell.
- **PWA Setup**: Install/Configure the Vite PWA plugin. Ensure `manifest.json` uses high-res icons (not vite.svg). 
- **Splash Screens**: Generate and link `apple-touch-startup-image` for iPhone 15 resolutions in `index.html`.
- **Safe Areas**: Update `index.css` and components (especially `MirrorMode.jsx`) to use `env(safe-area-inset-top)` and `bottom`. Ensure the header doesn't hide behind the Dynamic Island.
- **Touch Fix**: Add `touch-action: manipulation` to the global CSS to remove the 300ms click delay on iOS.

---

### **3. PERFORMANCE & ARCHITECTURE (THE "JANK" PURGE)**
- **Vision Worker**: Move the MediaPipe `FaceLandmarker` initialization and detection from the main thread (`useCamera.js`) into a **Web Worker**. This is non-negotiable for a premium feel.
- **Version Alignment**: Align `@mediapipe/tasks-vision` versions between `package.json` and the CDN URL in code.
- **Local AI progress**: Update the UI in `SettingsSheet.jsx` or a global toast to actually render the `loadProgress` state from `LocalLLMProvider.jsx`.

---

### **4. ACCESSIBILITY & SEO**
- **Viewport Fix**: In `index.html`, remove `user-scalable=no`. This is a critical Axe accessibility violation.
- **Metadata**: Replace the Vite template text in `README.md` and `index.html` with production "StyleShift AI" SEO titles and meta descriptions.

---

### **5. HEAVY TESTING REPAIR**
The current tests are desktop-only and failing budgets.
- **Playwright Config**: Add an `iPhone 15 Pro` project to `playwright.config.ts` using the correct user-agent and viewport.
- **Lighthouse Budget**: Optimize the application (code splitting, asset compression) until `npm run test:lighthouse` returns a consistent **90+ score**.
- **Axe Compliance**: Ensure all E2E tests pass the `AxeBuilder` check without violations.

---

### **VERIFICATION FLOW**
After applying fixes, run and confirm:
1. `npm run lint` -> Zero errors.
2. `npm run test` -> All Unit/Integration green.
3. `npm run test:e2e` -> iPhone 15 Pro emulation green.
4. `npm run test:lighthouse` -> Performance > 0.90.

**Goal**: Every "Audit" and "Mobile-PWA" flag from the previous report must be resolved.
```
