---
doc: prd
status: approved
---

# ProofTrail — Product Requirements

An evidence-backed requirements & action checklist extractor with deterministic quote verification and ambiguity detection for hackathon builders, freelancers, and students.
Source: `scope.md > The Unique Kernel`, `scope.md > Who It's For`

## The Core Journey
Source: `scope.md > The Core Loop`, `scope.md > What "Working" Looks Like`

1. **Arrival & Initial Workspace:** The user lands on a clean split-screen dashboard. The left panel offers a large text input with placeholder guidance and a prominent "Load Sample Brief" button. The right panel displays an empty-state checklist placeholder explaining the verification workflow.
2. **Inputting Source Text:** The user either pastes their raw assignment/hackathon brief or clicks "Load Sample Brief", which automatically populates a realistic hackathon prompt containing clear requirements and a deliberately vague deadline ("Submit by Friday").
3. **Triggering Analysis:** The user clicks the primary action button, "Extract & Verify Checklist".
4. **Processing State:** A skeleton loader appears on the right panel with status text: "Analyzing brief and deterministically verifying source quotes..."
5. **Reviewing Verified Items:** Checklist items load categorized by type (`Deliverable`, `Deadline`, `Rule`) and labeled with verification status:
   - `VERIFIED` (Green badge): Backed by an exact verbatim source quote.
   - `AMBIGUOUS` (Amber badge): Quote confirmed in source, but key details (e.g., date, timezone, format) are vague and need human attention, accompanied by an explanatory reason.
   - `UNVERIFIED` (Red badge): Flagged as an unverified/hallucinated claim because it cannot be found verbatim in the source text.
6. **Inspecting the Proof Trail (Click-to-Scroll):** The user clicks any checklist item card. The left panel instantly scrolls to and highlights the exact verbatim quote in yellow/emerald within the source text, proving the requirement's authenticity.
7. **Task Execution & Persistence:** The user checks off completed items. The progress bar updates immediately, and task completion state is automatically saved in browser `localStorage`.
8. **Filtering:** The user can filter items using category pills (`All`, `Deliverables`, `Deadlines`, `Rules`) and verification pills (`All`, `Verified`, `Ambiguous`).

## Screens and Layout
- **Single-Page Split-Screen Dashboard (Desktop-First Responsive):**
  - **Top Navigation Bar:** Product identity ("ProofTrail"), brief subtitle, status badge (indicating Live API mode vs. Sample Fallback mode), and reset button.
  - **Left Column (Source Evidence Panel):**
    - Header with character/word counter and "Load Sample Brief" action.
    - Editable text area when in edit mode; formatted read-only view with highlighted quote anchors when results are active.
    - Floating / docked "Re-analyze" or "Edit Brief" toggle.
  - **Right Column (Checklist & Verification Panel):**
    - Summary header: Overall task progress bar (e.g., "3 of 7 completed • 42%"), and counters for `Verified` vs. `Ambiguous` items.
    - Filter pills for categories (`All`, `Deliverables`, `Deadlines`, `Rules`) and status.
    - Scrollable card feed of interactive checklist items.

## Look and Feel
- **Visual Tone:** Technical, trustworthy, high-clarity developer tool.
- **Color Palette:**
  - Backgrounds: Clean neutral slate (`bg-slate-50` / `bg-slate-900` card borders).
  - Status Badges:
    - `VERIFIED`: Emerald green (`bg-emerald-50 text-emerald-700 border-emerald-200`).
    - `AMBIGUOUS`: Amber (`bg-amber-50 text-amber-700 border-amber-200`).
    - `UNVERIFIED`: Rose red (`bg-rose-50 text-rose-700 border-rose-200`).
  - Category Tags: Indigo (`Deliverable`), Purple (`Deadline`), Slate (`Rule/Constraint`).
  - Source Quote Highlight: Soft yellow/amber wash (`bg-amber-100 ring-2 ring-amber-400`) transitioning smoothly when active.
- **Typography:** Crisp sans-serif (`Inter` or system sans) with monospace accents for verbatim quotes and timestamps.

## Features and Behavior

### 1. Brief Ingestion & Sample Mode
- **Behavior:** Accepts arbitrary text input or loads a built-in sample hackathon prompt when "Load Sample Brief" is clicked.
- **Acceptance Criteria:**
  - Clicking "Load Sample Brief" populates the input area with a multi-paragraph brief containing deliverables, rules, and an ambiguous deadline ("Submit by Friday").
  - The extract button is disabled if the input text is blank or whitespace-only.

### 2. Structured Extraction & Deterministic Verification
- **Behavior:** The system extracts structured requirements and runs deterministic string verification against the source text before presenting cards to the user.
- **Acceptance Criteria:**
  - Every card displays: Action Title, Category (`Deliverable` | `Deadline` | `Rule`), Verification Badge (`VERIFIED` | `AMBIGUOUS` | `UNVERIFIED`), and Verbatim Source Quote.
  - Ambiguous items display an explicit warning reason (e.g., "Missing specific date and timezone").
  - Items with quotes not found in the original source are marked `UNVERIFIED`.

### 3. Bidirectional Quote Inspection (Proof Trail)
- **Behavior:** Clicking a checklist card highlights and scrolls to its verbatim quote in the source document panel.
- **Acceptance Criteria:**
  - Clicking card *N* scrolls the left panel to the corresponding quote and applies an active highlight ring.
  - Clicking a quote in the source panel highlights the corresponding checklist card.

### 4. Progress Tracking & Local Persistence
- **Behavior:** Users check off completed items; progress updates dynamically and survives page reloads.
- **Acceptance Criteria:**
  - Checking a checkbox strikes through the title and recalculates the progress bar percentage.
  - Refreshing the browser preserves checkbox states and extracted items via `localStorage`.
  - A "Reset / Clear" option allows wiping local storage to test or analyze a fresh brief.

### 5. Filtering & Categorization
- **Behavior:** Filter pills instantly filter visible cards without requiring server re-fetches.
- **Acceptance Criteria:**
  - Selecting "Deadlines" shows only items categorized as deadlines.
  - Selecting "Ambiguous" shows only items flagged with ambiguity warnings.

## States and Boundaries

- **Empty State:** Text area is empty, "Extract" button is disabled, right panel displays guidance on how ProofTrail prevents hallucinations.
- **Loading State:** Text area is locked, button displays a spinner with text "Extracting & Verifying...", and right panel shows skeleton cards.
- **Active Results State:** Split view with interactive checklist cards and highlighted source text.
- **Sample / Demo Mode Fallback:** If `GEMINI_API_KEY` is not detected in environment variables, the system displays a clear banner ("Demo Mode: Running Pre-computed Verification") and returns verified sample results instantly so demos never break.
- **Error State:** If the API call fails or times out, an inline alert displays the error message with a "Retry Extraction" button without clearing the user's source text.
- **Persistence Boundary:** Stores current analysis results and checklist completion in `localStorage`. Does not sync to external servers or cross devices.

## Product Decisions
- **Deterministic String Normalization over LLM Self-Grading:** The model cannot self-certify its own quotes. Verification is calculated by strict code matching to prevent confirmation bias.
- **Three-Tier Status (`VERIFIED`, `AMBIGUOUS`, `UNVERIFIED`):** Ambiguity is treated as a first-class citizen because ambiguous deadlines are often the primary cause of missed project deliverables.
- **Single-Screen Split View:** Keeps the user's attention on evidence and verification rather than navigating between disconnected views.

## What We're Building
- Desktop split-screen interface with text input & sample brief loader.
- Extraction & verification pipeline with three-tier status badges.
- Bidirectional click-to-scroll quote highlighting between checklist cards and source text.
- Interactive checkboxes with progress bar and `localStorage` persistence.
- Offline sample fallback for bulletproof live demos.
- Category and status filter pills.

## Deferred From the POC
- **Exporting to GitHub / Trello / Notion:** Valuable for post-hackathon execution, but does not prove the core verification loop.
- **Multi-document cross-referencing:** Deferred to keep prompt and verification logic focused on single source briefs.

## Possible Later Enhancements
- One-click prompt builder to ask the brief's author for clarification on flagged ambiguous items (e.g. generate email: "Regarding rule X, please clarify timezone...").
- Export checklist to Markdown or CSV.

## Non-Goals
- Will NOT build user registration or authentication.
- Will NOT build a backend database.
- Will NOT support direct PDF or Word document uploads (plain text paste only).

## Open Questions
- *Resolved:* How to handle missing API keys during live demos? -> Resolved via automatic Sample Mode fallback.

