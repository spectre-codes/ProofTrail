---
doc: spec
status: approved
---

# ProofTrail — Technical Spec

## How This Works, In Plain Language
ProofTrail is a split-screen Next.js application that turns chaotic project briefs into verified action items. The user pastes text or loads a sample brief, then triggers extraction. A Next.js API route prompts Gemini 2.5 Flash with a strict JSON schema to extract checklist items containing exact verbatim source quotes and ambiguity flags. 

Crucially, the server route does not trust the LLM's quotes blindly: a pure TypeScript verification function (`lib/verifyQuote.ts`) deterministically matches each quote against the original text (normalizing whitespace and punctuation). Items are tagged as `VERIFIED` (found in source), `AMBIGUOUS` (found in source, but missing dates/timezones/details), or `UNVERIFIED` (hallucination guard). 

The frontend renders the source text on the left and the interactive checklist on the right. Clicking any card auto-scrolls the source panel to highlight the quote. Checking items updates a completion progress bar, with state preserved in `localStorage`. If no Gemini API key is configured, an offline sample mode runs automatically to guarantee smooth demos.

## The Core Journey Through the System
PRD ref: `prd.md > The Core Journey`

1. **User loads page / pastes brief:** User lands on `app/page.tsx`. State is initialized from `localStorage` or defaults to empty.
2. **"Load Sample Brief" clicked:** `components/SourcePanel.tsx` populates with pre-seeded hackathon text containing deliverables, rules, and an ambiguous deadline ("Submit by Friday").
3. **"Extract & Verify Checklist" clicked:** 
   - UI switches to loading state (`isLoading = true`), showing pulse skeletons in `components/ChecklistPanel.tsx`.
   - POST request sent to `app/api/analyze/route.ts` with `{ text: string }`.
4. **Server Route Processing:**
   - If `GEMINI_API_KEY` is missing, returns deterministic pre-computed sample analysis with `isSampleMode: true`.
   - If key exists, calls `@google/genai` using model `gemini-2.5-flash` with `responseSchema` enforcing structured items (title, category, verbatimQuote, isAmbiguous, ambiguityReason).
   - Server runs `lib/verifyQuote.ts` on each returned item against the original input text. Quotes confirmed in source receive `VERIFIED` or `AMBIGUOUS`; missing quotes receive `UNVERIFIED`.
   - Route returns JSON `{ items: ChecklistItem[], isSampleMode: boolean }`.
5. **Interactive Results Rendering:**
   - Client updates `items` state.
   - User clicks a card in `components/ChecklistCard.tsx` → sets `activeQuoteIndex` → triggers smooth scroll and amber highlight ring on the corresponding `<mark>` anchor in `components/SourcePanel.tsx`.
6. **Task Checkoff & Persistence:**
   - User checks a task checkbox → updates `completed` boolean → updates progress bar calculation → writes updated state to `localStorage`.

## Stack
- **Framework:** Next.js 14+ (App Router, React 18/19, TypeScript).
  - *Rationale:* Server-side API routes protect the Gemini API key while delivering fast client-side rendering.
  - *Doc:* https://nextjs.org/docs
- **Styling & UI:** Tailwind CSS + Lucide React.
  - *Rationale:* Instant, high-contrast utility styling for split-screen dashboard, status badges, and responsive layouts.
  - *Doc:* https://tailwindcss.com/docs, https://lucide.dev
- **AI SDK:** `@google/genai` (calling `gemini-2.5-flash` with structured JSON schema output).
  - *Rationale:* Official Google GenAI SDK providing native schema enforcement for zero-hallucination structured extraction.
  - *Doc:* https://github.com/google-gemini/deprecations (or modern `@google/genai` docs)
- **Testing:** Node.js native test runner or Vitest/Jest for unit testing deterministic string matching in `lib/verifyQuote.ts`.
  - *Doc:* https://nodejs.org/api/test.html

## Where It Runs and How Someone Tries It
- **Runtime:** Local Node.js (v18+) web application.
- **Environment:**
  - Create `.env.local` containing `GEMINI_API_KEY="your-gemini-api-key"`.
  - Safe `.env.example` committed to repo for hackathon evaluators.
  - **Zero-Config Demo Mode:** If no key is set, the app runs offline sample mode automatically.
- **Start Command:**
  ```bash
  npm install
  npm run dev
  ```
  Open `http://localhost:3000` in any modern browser for demo recording.
- **Test Command:**
  ```bash
  npm test
  ```
- **Submission Requirements:** Demo video (1–2 minutes) and public GitHub repository. Deployment is optional.

## Look and Feel
Carried forward from `prd.md > Look and Feel` and `scope.md > Inspiration & Identity`:
- **Palette:** High-clarity slate foundation (`bg-slate-50`, dark borders `border-slate-200`).
- **Badges:**
  - `VERIFIED`: Emerald green (`bg-emerald-50 text-emerald-700 border-emerald-200`).
  - `AMBIGUOUS`: Amber (`bg-amber-50 text-amber-700 border-amber-200`).
  - `UNVERIFIED`: Rose red (`bg-rose-50 text-rose-700 border-rose-200`).
- **Quote Highlighting:** Warm amber wash (`bg-amber-100 ring-2 ring-amber-400 text-slate-900 font-medium px-1 py-0.5 rounded`).
- **Typography:** Modern clean sans-serif with monospace elements for quotes and metadata.

## Components

### `app/page.tsx`
Main orchestrator. Manages top-level state (`sourceText`, `items`, `activeItemId`, `filterCategory`, `filterStatus`, `isLoading`, `isSampleMode`). Handles `localStorage` synchronization.
Implements `prd.md > Screens and Layout`, `prd.md > Features and Behavior`.

### `components/Navbar.tsx`
Header brand bar showing ProofTrail logo, tagline, "Demo Mode" fallback badge, and a "Reset / Clear All" button.
Implements `prd.md > Screens and Layout`.

### `components/SourcePanel.tsx`
Left split pane. Contains:
- Textarea mode for pasting briefs.
- Read-only formatted view during results inspection with inline `<mark>` tags wrapping matched quotes and scroll anchor refs.
- "Load Sample Brief" button and word counter.
Implements `prd.md > Features and Behavior > 1. Brief Ingestion & Sample Mode`, `prd.md > Features and Behavior > 3. Bidirectional Quote Inspection`.

### `components/ChecklistPanel.tsx`
Right split pane. Contains:
- Progress bar and completion metrics ("X of Y deliverables checked").
- Filter pill controls (Category: All, Deliverable, Deadline, Rule; Status: All, Verified, Ambiguous).
- Scrollable list of `ChecklistCard` components.
- Skeleton loader during API extraction.
Implements `prd.md > Features and Behavior > 4. Progress Tracking`, `prd.md > Features and Behavior > 5. Filtering & Categorization`.

### `components/ChecklistCard.tsx`
Individual card displaying:
- Checkbox + strike-through title.
- Category pill and verification status badge (`VERIFIED`, `AMBIGUOUS`, `UNVERIFIED`).
- Expandable verbatim source quote block.
- Ambiguity warning banner (if `isAmbiguous` is true).
- Click handler that triggers parent state to highlight and scroll the source document.
Implements `prd.md > Features and Behavior > 2. Structured Extraction & Deterministic Verification`.

### `lib/verifyQuote.ts`
Pure TypeScript utility function:
- Normalizes source text and quote (collapses multi-whitespace, trims, strips smart quotes/punctuation differences).
- Searches for normalized quote within normalized source.
- Calculates verification status:
  - If match not found: status is `UNVERIFIED`.
  - If match found and `isAmbiguous === true`: status is `AMBIGUOUS`.
  - If match found and `isAmbiguous === false`: status is `VERIFIED`.
- Returns match indices for UI text highlighting.
Implements `prd.md > Product Decisions > Deterministic String Normalization`.

## Data Model

```typescript
export type Category = 'deliverable' | 'deadline' | 'rule';
export type VerificationStatus = 'VERIFIED' | 'AMBIGUOUS' | 'UNVERIFIED';

export interface ChecklistItem {
  id: string;
  title: string;
  category: Category;
  verbatimQuote: string;
  isAmbiguous: boolean;
  ambiguityReason?: string;
  status: VerificationStatus;
  completed: boolean;
  matchStartIndex?: number;
  matchEndIndex?: number;
}

export interface AnalyzeResponse {
  items: ChecklistItem[];
  isSampleMode: boolean;
  modelUsed: string;
}
```

- **Persistence:** Saved in `localStorage` under key `prooftrail_session`:
  ```json
  {
    "sourceText": "...",
    "items": [ ... ],
    "lastUpdated": 1729700000000
  }
  ```

## File Structure

```
ai-basics-poc/
├── .env.example                       # Sample environment file
├── .gitignore                         # Configured gitignore (excludes learner-profile, .env.local)
├── package.json                       # Dependencies & scripts
├── tsconfig.json                      # TypeScript config
├── tailwind.config.ts                 # Tailwind styling rules
├── app/
│   ├── layout.tsx                     # Root HTML shell & metadata
│   ├── page.tsx                       # Main split-screen dashboard
│   ├── globals.css                    # Tailwind imports
│   └── api/
│       └── analyze/
│           └── route.ts               # Gemini 2.5 Flash caller + verification runner
├── components/
│   ├── Navbar.tsx                     # Top header & mode indicator
│   ├── SourcePanel.tsx                # Left split pane (editor & highlighted view)
│   ├── ChecklistPanel.tsx             # Right split pane (progress & card feed)
│   └── ChecklistCard.tsx              # Interactive item card with click-to-scroll
├── lib/
│   ├── verifyQuote.ts                 # Pure deterministic verification algorithm
│   ├── sampleData.ts                  # Realistic sample brief & pre-computed fallback
│   └── __tests__/
│       └── verifyQuote.test.ts        # Unit test suite verifying quote matching
└── devpost/
    ├── learner-profile.md             # Learner context
    ├── scope.md                       # Approved scope
    ├── prd.md                         # Approved PRD
    └── spec.md                        # This technical specification
```

## External Services and Dependencies
- **Google Gemini API (`@google/genai`):**
  - **Endpoint / Model:** `gemini-2.5-flash`
  - **Payload:** System prompt instructing requirements extraction + strict JSON Schema response specification.
  - **Environment Key:** `GEMINI_API_KEY`
  - **Cost / Limits:** Free tier / standard GenAI developer limits.
  - **Fallback:** Offline pre-computed `lib/sampleData.ts` if API key is not present or service errors.

## Important Failure Modes
1. **Missing or Expired Gemini API Key:**
   - *Behavior:* System automatically detects missing key or 401/403 status, toggles `isSampleMode: true`, renders a clear amber badge ("Running in Demo/Sample Mode"), and returns the verified sample dataset. The user demo never crashes.
2. **LLM Hallucinated or Mangled Quote:**
   - *Behavior:* `lib/verifyQuote.ts` fails to find the quote in the source text. Rather than silently accepting it, the item is tagged with a red `UNVERIFIED` badge with a warning: "Quote could not be found verbatim in source text".
3. **Punctuation / Whitespace Mismatch:**
   - *Behavior:* String normalizer normalizes unicode quotes (`"` vs `“`), cleans multiple spaces/newlines, and lowercases during substring search, preventing false negative rejections.

## What Was Simplified and Why
- **Text-area paste instead of PDF parser:** Parsing complex PDF layouts introduces OCR failures and heavy native dependencies. Pasting clean text keeps the PoC 100% reliable within hackathon limits.
- **Client `localStorage` instead of Postgres/Prisma:** Eliminates external database provisioning, connection strings, and migration overhead while fulfilling all persistence needs for a live demo.
- **Zero-config sample mode instead of blocking login:** Ensures anyone cloning the repo or watching the recording sees the product work immediately.

## Decisions and Open Issues
- **Decisions Made:**
  - Next.js App Router for combined API routes and React server/client components.
  - Pure deterministic TypeScript module for quote verification (`lib/verifyQuote.ts`) so verification logic can be unit-tested independently of the LLM.
  - Three distinct verification statuses: `VERIFIED`, `AMBIGUOUS`, and `UNVERIFIED`.
- **Learner Nuance Clarified:**
  - *Whitespace and smart-quote normalization:* The LLM might return standardized ASCII quotes while the user pasted text with typographic curly quotes, or different line wraps. `lib/verifyQuote.ts` applies regex normalization (`[\u201C\u201D] -> "`, `\s+ -> ' '`) before checking inclusion, preventing spurious `UNVERIFIED` flags on real quotes.
- **Open Issues:** None blocking build.

