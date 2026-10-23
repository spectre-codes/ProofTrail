# ProofTrail 🛡️

**An Evidence-Backed Requirements & Action Checklist Extractor**  
Built for Devpost Learn's *Build With AI: Basics* Hackathon.

ProofTrail transforms messy assignment briefs, hackathon guidelines, or client RFPs into structured, actionable checklists with **deterministic source verification** and **ambiguity detection** powered by Gemini 2.5 Flash.

---

## The Problem & The Kernel

When students, freelancers, or hackathon teams parse dense briefs, they often miss critical disqualification rules or subtle deadlines. Standard AI summarizers frequently hallucinate requirements or misinterpret dates.

**ProofTrail's Unique Kernel:**
ProofTrail pairs AI structured extraction with a pure deterministic verification engine (`lib/verifyQuote.ts`). Every extracted requirement must be accompanied by an exact verbatim source quote. Our server-side code normalizes and matches the quote directly against the source text before presenting it:

- 🟢 **`VERIFIED`**: Exact verbatim supporting quote deterministically matched in the source document.
- 🟡 **`AMBIGUOUS`**: Quote found in source, but missing crucial details (e.g., date without timezone like "Submit by Friday", vague file format) flagged with a clear warning.
- 🔴 **`UNVERIFIED`**: Quote could not be matched verbatim in the source text (anti-hallucination guard).

Clicking any checklist card smoothly scrolls to and highlights the supporting quote in the source panel, creating a verifiable **Proof Trail**.

---

## Features

- **Split-Screen Dashboard:** Side-by-side view with source evidence on the left and verified checklist on the right.
- **Bidirectional Proof Trail:** Clicking any card auto-scrolls to and highlights the supporting quote in the document.
- **Interactive Checklists & Progress Bar:** Real-time completion progress tracking with strikethroughs.
- **LocalStorage Persistence:** Checkbox states and extracted items persist across browser page reloads.
- **Category & Status Filtering:** Filter pills for Deliverables, Deadlines, Rules, and Ambiguity flags.
- **Zero-Config Demo Mode Fallback:** If no Gemini API key is configured, ProofTrail runs in pre-computed Demo Mode so live demos and judging never fail.

---

## Tech Stack & Architecture

- **Framework:** [Next.js](https://nextjs.org/) 14+ (App Router, TypeScript)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) + [Lucide React](https://lucide.dev/)
- **AI Model & SDK:** Google Gemini 2.5 Flash via `@google/genai` (structured JSON Schema enforcement)
- **Verification Engine:** Pure TypeScript deterministic substring matching (`lib/verifyQuote.ts`)
- **Testing:** Automated test suite with 13 unit and route integration tests

```
├── app/
│   ├── api/analyze/route.ts       # Gemini API route + verification runner
│   ├── layout.tsx                 # App layout & styling
│   └── page.tsx                   # Main split-screen dashboard
├── components/
│   ├── ChecklistCard.tsx          # Card with badges, quotes & ambiguity warnings
│   ├── ChecklistPanel.tsx         # Progress bar, filters & checklist feed
│   ├── Navbar.tsx                 # Header & Demo Mode indicator
│   └── SourcePanel.tsx            # Editor & interactive quote highlight viewer
├── lib/
│   ├── __tests__/                 # Automated test suites (13 passing tests)
│   ├── sampleData.ts              # Pre-seeded hackathon brief & demo fallback
│   └── verifyQuote.ts             # Deterministic verification algorithm
└── devpost/                       # Devpost Learn Planning Artifacts
    ├── scope.md                   # Approved project scope
    ├── prd.md                     # Approved product requirements
    ├── spec.md                    # Approved technical specification
    ├── checklist.md               # Slices build record & revisions
    └── app-map.html               # Architecture map & reusable practices
```

---

## Getting Started

### 1. Prerequisites
- Node.js v18.0.0 or higher
- npm v9+

### 2. Installation
```bash
git clone <your-repository-url>
cd ai-basics-poc
npm install
```

### 3. Environment Setup (Optional)
ProofTrail includes an automated **Demo Mode** with pre-computed verification for the sample hackathon brief. 

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
Runs 13 unit tests verifying quote normalization, status classification, API route handling, and state filtering.

---

## Devpost Learn Hackathon Artifacts

This project was built following the plan-first *Build With AI: Basics* methodology:
- 📋 [Scope Document](devpost/scope.md)
- 📝 [Product Requirements Document (PRD)](devpost/prd.md)
- 📐 [Technical Specification](devpost/spec.md)
- 🔨 [Build Checklist & Slices](devpost/checklist.md)
- 🗺️ [Architecture App Map](devpost/app-map.html)
