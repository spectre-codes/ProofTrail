# ProofTrail 🛡️

**An Evidence-Backed Requirements & Action Checklist Extractor**  
Built for Devpost Learn's *Build With AI: Basics* Hackathon.

ProofTrail transforms dense assignment briefs, hackathon guidelines, or client RFPs into structured, actionable checklists with **deterministic source verification** and **ambiguity detection** powered by Gemini 2.5 Flash and a pure TypeScript verification kernel.

---

## The Problem & The Verification Kernel

When students, freelancers, or hackathon teams parse dense briefs, they often miss critical disqualification rules or subtle deadlines. Standard AI summarizers frequently hallucinate requirements or misinterpret dates.

### ProofTrail's Unique Kernel
ProofTrail pairs AI structured extraction with a deterministic verification engine ([`lib/verifyQuote.ts`](lib/verifyQuote.ts)). Every extracted requirement must be accompanied by an exact verbatim source quote. Our server-side code normalizes curly quotes, dashes, and whitespace, mapping quotes directly against the original document text before assigning status:

- 🟢 **Source Matched**: Exact verbatim supporting quote deterministically matched in the source document. Accurately highlights original character spans in the text.
- 🟡 **Needs Review**: Supporting quote exists in source, but key parameters are missing or ambiguous (e.g., date without timezone like *"Submit by Friday before midnight"*, vague file format, or unspecified constraint) flagged with an actionable warning.
- 🔴 **No Source Match**: Extracted quote cannot be matched verbatim anywhere in the source text (deterministic rejection and anti-hallucination guard).

Clicking any requirement card smoothly scrolls to and focuses the supporting quote in the source viewer with status-tinted highlighting, creating an interactive, tamper-proof **Proof Trail**.

---

## Features

- **Split-Screen Forensic Workspace:** Side-by-side view with source evidence on the left (`#FAFAF9`) and an audit feed on the right.
- **Bidirectional Proof Trail:** Clicking any card auto-scrolls to and highlights the supporting quote in the document; clicking highlighted text focuses the corresponding card.
- **Three-Tier Verification:** Real-time badge classification (`Source Matched`, `Needs Review`, `No Source Match`) with ambiguity explanation banners and hallucination rejection alerts.
- **Interactive Checklists & Progress Bar:** Real-time completion progress tracking with strikethroughs and completion percentages.
- **Dynamic Category & Status Filtering:** Filter pills for Types (`All`, `Deliverables`, `Deadlines`, `Rules`) and Status (`All`, `Source Matched`, `Needs Review`, `No Source Match`) with live item counts.
- **Interactive Summary Metric Tiles:** 4 top stat tiles (`Total`, `Source Matched`, `Needs Review`, `No Match`) that double as one-click status filters.
- **Dual-Mode Architecture:** Live Gemini 2.5 Flash analysis when configured with an API key, plus a zero-config offline sandbox that dynamically exercises the verification engine without requiring credentials.
- **State Invalidation on Text Edit:** Modifying the source document immediately clears stale audit results and active selections so obsolete extractions are never displayed against modified text.
- **LocalStorage Persistence:** Session text, checklist state, active filters, and task completion persist across browser refreshes.

---

## Dual-Mode Architecture

ProofTrail supports two operating modes out of the box:

```
                       ┌──► [GEMINI_API_KEY Present]  ──► Live Gemini 2.5 Flash (Structured JSON Schema)
User Document Text ────┤                                                                                 ├──► Deterministic Verification Engine ──► Verified Feed
                       └──► [No Key / Offline Mode]   ──► Built-in Sample Brief Candidates (Fail-Safe)
```

1. **Mode A: Live Gemini 2.5 Flash (Production Mode)**
   - When a `GEMINI_API_KEY` is provided in `.env.local`, custom briefs are sent to Google's `gemini-2.5-flash` model using `@google/genai` with strict structured JSON schema enforcement (`responseSchema`).
   - The model extracts actionable tasks, categorizes them, extracts character-for-character verbatim quotes, and flags potential ambiguities.
   - All LLM candidate extractions are immediately fed into `lib/verifyQuote.ts` at runtime before returning to the UI, guaranteeing that LLM hallucinations are deterministically caught.

2. **Mode B: Zero-Config Offline Sandbox (Demo & Judging Mode)**
   - When running offline or without an API key, ProofTrail provides an offline sandbox that evaluates the built-in sample hackathon brief fixture.
   - The server does **not** return static pre-computed statuses. Instead, it runs the raw candidate extractions through `verifyItems()` at runtime against the source text to demonstrate all three badge states:
     - 5 valid matches $\to$ `Source Matched`
     - 2 ambiguous matches $\to$ `Needs Review`
     - 1 deliberate fabricated candidate (*"Submit a 10-page printed team notarized affidavit"*) $\to$ `No Source Match` (demonstrating deterministic hallucination rejection).
   - **Custom Document Guard:** If custom text is submitted without a `GEMINI_API_KEY`, the server returns a clean HTTP 503 notice explaining that the offline sandbox evaluates the built-in sample brief and that analyzing custom documents requires an API key, preventing confusing or mismatched card outputs.

---

## Tech Stack & Architecture

- **Framework:** [Next.js](https://nextjs.org/) 14.2.35 (App Router, TypeScript)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) + [Lucide React](https://lucide.dev/)
- **AI Model & SDK:** Google Gemini 2.5 Flash via `@google/genai` (v2.31.0) with structured output schema
- **Verification Engine:** Pure TypeScript deterministic token-stream matching (`lib/verifyQuote.ts`)
- **Test Runner:** Node.js native test runner (`node --test`) with 15 automated unit & route tests
- **License:** [MIT License](LICENSE)

```
├── app/
│   ├── api/analyze/route.ts       # Gemini API route + runtime verification engine
│   ├── globals.css                # Global Tailwind styling & scrollbar utilities
│   ├── layout.tsx                 # Root layout & system typography
│   └── page.tsx                   # Main split-screen forensic workspace
├── components/
│   ├── ChecklistCard.tsx          # Card with status badges, quote box & ambiguity warnings
│   ├── ChecklistPanel.tsx         # Metric tiles, progress bar, filters & card feed
│   ├── Navbar.tsx                 # Header, branding & mode badge
│   └── SourcePanel.tsx            # Document viewer & interactive quote highlights
├── lib/
│   ├── __tests__/                 # Automated test suites (15 passing tests)
│   │   ├── analyzeRoute.test.ts
│   │   ├── persistenceAndFiltering.test.ts
│   │   └── verifyQuote.test.ts
│   ├── sampleData.ts              # Built-in sample brief & raw candidate fixture
│   └── verifyQuote.ts             # Deterministic verification kernel & normalizer
├── devpost/                       # Devpost Learn Planning Artifacts
│   ├── scope.md                   # Approved project scope
│   ├── prd.md                     # Approved product requirements
│   ├── spec.md                    # Approved technical specification
│   ├── checklist.md               # Slices build record & revisions
│   └── app-map.html               # Architecture map & reusable practices
├── .env.example                   # Environment variable template
├── LICENSE                        # MIT License
├── package.json
├── tsconfig.json
└── tailwind.config.ts
```

---

## Getting Started

### 1. Prerequisites
- Node.js v18.0.0 or higher
- npm v9+

### 2. Installation
```bash
git clone https://github.com/spectre-codes/ProofTrail.git
cd ProofTrail
npm install
```

### 3. Environment Setup (Optional)
ProofTrail works out of the box in **Offline Sandbox Mode** for the sample hackathon brief with zero configuration.

To analyze custom briefs with live Gemini 2.5 Flash:
1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Add your Gemini API key from [Google AI Studio](https://aistudio.google.com/):
   ```env
   GEMINI_API_KEY="your-gemini-api-key"
   ```

### 4. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Running Automated Tests
```bash
npm test
```

ProofTrail uses the Node.js native test runner (`node --test --experimental-strip-types`) with **zero external test framework dependencies**.

**Test Coverage (15/15 passing across 3 suites):**
- **`lib/__tests__/verifyQuote.test.ts` (7 tests):** Smart quote normalization (`“ ” ‘ ’` $\to$ `" '`), typographic dash conversion (`— –` $\to$ `-`), collapsing whitespace/linebreaks, exact character slice index tracking, ambiguity flag mapping, hallucination catching (`UNVERIFIED` rejection), and empty quote validation.
- **`lib/__tests__/analyzeRoute.test.ts` (4 tests):** Empty payload validation (HTTP 400), payload size limiting (HTTP 413), offline sandbox runtime candidate verification with all 3 states, and custom text offline guard (HTTP 503).
- **`lib/__tests__/persistenceAndFiltering.test.ts` (4 tests):** Real-time progress percentage calculation, dynamic category filtering, status filtering (`Source Matched`, `Needs Review`, `No Source Match`), and session serialization format.

### 6. Production Build
```bash
npm run build
npm start
```

---

## Devpost Learn Hackathon Artifacts

This project was built following the plan-first *Build With AI: Basics* methodology. All planning documents are approved and preserved in the repository:
- 📋 [Scope Document](devpost/scope.md) — Project boundary, core problem, and proof-of-concept size (`status: approved`)
- 📝 [Product Requirements Document (PRD)](devpost/prd.md) — Core user journey, behavior specifications, and edge cases (`status: approved`)
- 📐 [Technical Specification](devpost/spec.md) — Architectural blueprint, data models, and component boundaries (`status: approved`)
- 🔨 [Build Checklist & Slices](devpost/checklist.md) — Ordered delivery slices, revisions, and test records (`status: approved`)
- 🗺️ [Architecture App Map](devpost/app-map.html) — Interactive visual map of the data pipeline and reusable practices

---

## License

This project is licensed under the [MIT License](LICENSE).
