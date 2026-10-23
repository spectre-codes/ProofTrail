import React from 'react';
import { ShieldCheck, Sparkles, RotateCcw, Cpu, Database } from 'lucide-react';

interface NavbarProps {
  isSampleMode: boolean;
  onReset: () => void;
  itemCount: number;
}

export function Navbar({ isSampleMode, onReset, itemCount }: NavbarProps) {
  return (
    <header className="border-b border-slate-800 bg-slate-950 text-slate-100 sticky top-0 z-40 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Brand Identity & Subtitle */}
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-600 to-slate-900 border border-emerald-400/30 flex items-center justify-center text-white shadow-inner shrink-0">
              <ShieldCheck className="w-6 h-6 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-base font-bold tracking-tight text-white">
                  ProofTrail
                </span>
                <span className="font-mono text-xs text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800/80">
                  // Deterministic Requirements Auditor
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-normal mt-0.5 max-w-2xl font-sans">
                Built for hackathon builders, freelancers & students — extracts actionable checklists from dense briefs and deterministically verifies every quote against source text.
              </p>
            </div>
          </div>

          {/* Mode Badges & Reset Action */}
          <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
            {isSampleMode ? (
              <div
                className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-zinc-900/50 border border-zinc-700/60 text-zinc-300 font-mono text-[11px] font-medium shadow-2xs"
                title="Running offline with sample candidate extractions verified through lib/verifyQuote.ts at runtime"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400/80 shrink-0" />
                <span className="tracking-wide uppercase">Offline Sandbox (Sample Candidates)</span>
              </div>
            ) : (
              <div
                className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-zinc-900/50 border border-zinc-700/60 text-zinc-300 font-mono text-[11px] font-medium shadow-2xs"
                title="Active live API integration with Gemini 2.5 Flash"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80 shrink-0" />
                <span className="tracking-wide uppercase">Live Gemini 2.5 Flash</span>
              </div>
            )}

            {itemCount > 0 && (
              <button
                type="button"
                onClick={onReset}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 transition-all focus:outline-none focus:ring-2 focus:ring-slate-400 active:scale-95"
                title="Reset workspace and clear current audit session"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                <span>Reset Workspace</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
