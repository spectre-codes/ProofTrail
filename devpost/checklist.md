---
doc: checklist
status: approved
---

# Build Checklist

Build mode: fast

## Slices

- [x] **1. Bootstrap Next.js app & deterministic verification engine with unit tests**
  Becomes usable: The Next.js project is scaffolded with TypeScript, Tailwind CSS, and Lucide icons, and the core deterministic verification engine `lib/verifyQuote.ts` is implemented and verified by automated unit tests.
  Why now: Proves the unique kernel (deterministic quote verification, smart-quote/whitespace normalization, and three-tier classification) early and establishes the project skeleton so all subsequent UI and API slices have verified logic to build upon.
  PRD ref: `prd.md > Features and Behavior > 2. Structured Extraction & Deterministic Verification`, `prd.md > Product Decisions`
  Spec ref: `spec.md > Stack`, `spec.md > lib/verifyQuote.ts`, `spec.md > File Structure`
  Build: Scaffold Next.js TypeScript app, configure Tailwind CSS and Lucide icons, implement `lib/verifyQuote.ts` with string normalization and verification classification, add unit test suite in `lib/__tests__/verifyQuote.test.ts`, set up test runner.
  Verify (mechanical): Run unit tests (`npm test`) and confirm all tests pass for `VERIFIED`, `AMBIGUOUS`, and `UNVERIFIED` cases.
  Learner check: Run `npm test` and inspect the test suite proving that quotes are deterministically checked and smart quotes/whitespace are normalized.
  Commit: `Initialize Next.js app and deterministic verification engine with unit tests`

- [x] **2. Sample brief data, offline demo mode, and Gemini API extraction route**
  Becomes usable: A functioning server route `app/api/analyze/route.ts` that accepts source text, calls Gemini 2.5 Flash with structured output schema when `GEMINI_API_KEY` is present, falls back gracefully to deterministic sample data when offline or key is missing, runs `lib/verifyQuote.ts` on the items, and returns verified checklist items.
  Why now: Proves the AI extraction and fallback pipeline before tying it to the complex interactive UI, guaranteeing that live demos never crash.
  PRD ref: `prd.md > The Core Journey` (steps 2-5), `prd.md > States and Boundaries > Sample / Demo Mode Fallback`
  Spec ref: `spec.md > app/api/analyze/route.ts`, `spec.md > External Services and Dependencies`, `spec.md > Data Model`
  Build: Install `@google/genai`, create `.env.example`, implement `lib/sampleData.ts` with a realistic hackathon brief and pre-computed extractions, create `app/api/analyze/route.ts` with JSON schema extraction, integrate `lib/verifyQuote.ts`, add fallback logic.
  Verify (mechanical): Send a POST request via curl or test script to `/api/analyze` with sample brief text and verify JSON response contains verified items with status tags and fallback flag.
  Learner check: Test API endpoint directly or run verification curl to observe the structured, verified checklist payload.
  Commit: `Add Gemini API route with structured schema and offline demo fallback`

- [x] **3. Split-screen dashboard with live extraction, interactive cards, and quote highlighting**
  Becomes usable: Complete end-to-end user loop in the browser. User lands on the split-screen UI, can paste text or click "Load Sample Brief", clicks "Extract & Verify Checklist", sees loading skeleton, views verified cards with category and status badges, and clicks cards to highlight quotes in the source panel.
  Why now: Connects the user experience to the core kernel. The bidirectional "proof trail" (clicking cards to scroll and highlight source evidence) is the central visual "aha" moment of the app.
  PRD ref: `prd.md > The Core Journey` (steps 1-6), `prd.md > Screens and Layout`, `prd.md > Features and Behavior > 1, 2, 3`
  Spec ref: `spec.md > components/Navbar.tsx`, `spec.md > components/SourcePanel.tsx`, `spec.md > components/ChecklistPanel.tsx`, `spec.md > components/ChecklistCard.tsx`, `spec.md > app/page.tsx`
  Build: Implement `components/Navbar.tsx`, `components/SourcePanel.tsx` (with inline quote highlight anchors and auto-scroll), `components/ChecklistPanel.tsx`, `components/ChecklistCard.tsx`, and tie state together in `app/page.tsx`.
  Verify (mechanical): Start Next.js dev server, build passes with `npm run build` with zero TypeScript/lint errors; verify DOM elements and component rendering.
  Learner check: Open `http://localhost:3000`, click "Load Sample Brief", click "Extract & Verify Checklist", and click a card to see the source text auto-scroll and highlight.
  Commit: `Implement split-screen dashboard with live extraction and quote highlighting`

- [x] **4. Progress tracking, localStorage persistence, and category/status filtering**
  Becomes usable: Full production-ready polish. Checkboxes toggle completion with instant progress bar calculation and strikethroughs, all state persists across page refreshes via `localStorage`, filter pills filter by category (`Deliverable`, `Deadline`, `Rule`) and status (`All`, `Verified`, `Ambiguous`), and a reset button allows clearing state.
  Why now: Delivers the complete proof-of-concept journey defined in the PRD, enabling a flawless 1-2 minute recording for hackathon submission.
  PRD ref: `prd.md > Features and Behavior > 4. Progress Tracking & Local Persistence`, `prd.md > Features and Behavior > 5. Filtering & Categorization`
  Spec ref: `spec.md > Data Model > Persistence`, `spec.md > components/ChecklistPanel.tsx`
  Build: Wire `localStorage` persistence in `app/page.tsx`, implement completion toggle and progress bar metrics in `components/ChecklistPanel.tsx`, implement filter pill state and filtering logic, add reset confirmation.
  Verify (mechanical): Check a task, verify `localStorage` persistence and progress calculation update, test filter pills display matching subsets, run production build `npm run build`.
  Learner check: Check off tasks, refresh the browser to verify state survives, and click filter pills to filter by categories and ambiguous flags.
  Commit: `Add task persistence, progress bar, and category filtering`

## Hands-on Checkpoints

- [x] Early usable behavior explored — Slice 3 (interactive split-screen dashboard with quote highlighting)
- [x] Final kick-the-tires exploration and feedback completed — Slice 4 (full persistence, filtering, and demo flow)

## Final Review

- [x] Final review complete — feedback resolved and learner confirms ready to ship

## Code Tour and App Map

- [x] Learning activity complete — focused alternative (deterministic verification & offline resilience recap)
- [x] Optional edit and transfer reflection addressed — focused recap verified against unit tests
- [x] `devpost/app-map.html` generated from finished code, checked, and shown, including a project-grounded practice to reuse

Activity and evidence: Tested 13 automated tests across 3 suites; verified split-screen dashboard, click-to-scroll quote highlighting, and localStorage persistence on http://localhost:3000.
Route and stops: lib/verifyQuote.ts (normalization & verification), app/api/analyze/route.ts (Gemini schema & fallback), components/SourcePanel.tsx (quote highlighting), components/ChecklistPanel.tsx (progress & filtering).
Edit outcome: not applicable (all features passed initial implementation without requiring code revisions).
Reflection: already covered (pairing LLM structured extraction with deterministic code verification).
Activity mode: focused alternative & offline standalone app map

## Revisions

- Enabled `allowImportingTsExtensions: true` in `tsconfig.json` and explicit `.ts` paths — ensures unified import resolution between Node native test runner and Next.js webpack compiler.
- Switched from external Google Fonts network fetch in `app/layout.tsx` to native system sans-serif stack — eliminates build-time network failures and ensures 100% offline demo resilience.
- Configured `postcss.config.js` with ES module `export default` — aligns PostCSS with `"type": "module"` in `package.json`.

