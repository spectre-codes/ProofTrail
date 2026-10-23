---
doc: scope
status: approved
---

# ProofTrail

An evidence-backed requirements & action checklist extractor with deterministic quote verification and ambiguity detection.

## The Unique Kernel
Deterministic server-side verification that string-matches every extracted deliverable, deadline, and constraint back to a verbatim quote in the original source text. It classifies every item into `VERIFIED` (green), `AMBIGUOUS` (amber - e.g. "Submit by Friday" without timezone/date), or `UNVERIFIED` (red - hallucination guard), and bidirectionally connects items to highlighted text.

## Who It's For
Hackathon builders, freelancers, and students receiving dense, disorganized project briefs, assignment sheets, or RFPs. Today, they either scan manually (risking missed disqualification rules or subtle deadlines) or use generic AI chat tools that hallucinate requirements or invent deadlines.

## The Core Loop
1. Paste a messy brief or click "Load Sample Brief" (pre-seeded with clear deliverables and an ambiguous deadline).
2. Click "Extract & Verify Checklist".
3. View the split-screen dashboard: the left panel displays the source document with matched quotes highlighted; the right panel shows structured checklist cards with verification badges, category tags, and ambiguity warnings.
4. Click any checklist item to auto-scroll and highlight its supporting quote in the source panel.
5. Check off completed tasks, tracking completion on the live progress bar, persisted in `localStorage`.

## Inspiration & Identity
Evidence-first, distraction-free productivity utility. Aesthetic is crisp, technical, and dependable: high-contrast status badges (Emerald, Amber, Rose), responsive split-view, clear typography, and instant visual proof.

## Why This Matters to the Learner
It establishes an anti-hallucination paradigm for AI applications: AI models propose structured knowledge, but deterministic code validates truth against source evidence before the user ever sees it.

## What "Working" Looks Like
Running `npm run dev` opens ProofTrail. Clicking "Load Sample Brief" populates the source area with a realistic hackathon prompt. Clicking "Extract & Verify" displays the verified checklist in seconds:
- Verifiable items are marked `VERIFIED` in green.
- The ambiguous deadline ("Submit by Friday") is flagged `AMBIGUOUS` in amber with an explanation ("No date or timezone specified").
- Clicking a card instantly highlights and scrolls the source text to that exact quote.
- Checking tasks updates the progress bar and survives page refresh.
- A sample mode runs even without `GEMINI_API_KEY` configured so demos never break.

## The POC Boundary
**In Scope:**
- Text input area with "Load Sample Brief" button.
- Next.js server route (`app/api/analyze/route.ts`) invoking `gemini-2.5-flash` with strict JSON schema.
- Deterministic verification module (`lib/verifyQuote.ts`) normalizing case/whitespace/punctuation to match quotes against source text.
- Three verification states: `VERIFIED`, `AMBIGUOUS`, `UNVERIFIED`.
- Split-screen UI with synchronized click-to-scroll quote highlighting.
- Filter pills (All, Deliverable, Deadline, Rule; Verified, Ambiguous).
- Task checkbox toggling with `localStorage` persistence and progress calculation.
- Offline/Sample Mode fallback when API key is missing.
- Unit tests proving `lib/verifyQuote.ts` deterministic matching works.

## Later
- Exporting to GitHub Issues, Jira, or Markdown.
- Multi-file or multi-section brief support.
- User accounts and shared team checklists.

## Explicitly Cut
- **PDF/Docx upload & OCR:** Adds complex document extraction dependencies; raw text pasting proves the core loop reliably.
- **User Authentication:** Adds sign-in friction and unnecessary complexity for a PoC.
- **Database / Backend Storage:** Local browser storage (`localStorage`) is sufficient and zero-maintenance.
- **Third-party integrations (Trello/Notion):** Focus stays strictly on requirements extraction and deterministic verification.

