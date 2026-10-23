import React from 'react';
import { ShieldCheck, Sparkles, RotateCcw, AlertTriangle } from 'lucide-react';

interface NavbarProps {
  isSampleMode: boolean;
  onReset: () => void;
  itemCount: number;
}

export function Navbar({ isSampleMode, onReset, itemCount }: NavbarProps) {
  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-slate-900 tracking-tight">ProofTrail</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                AI Basics PoC
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Evidence-Backed Requirements & Action Checklist Extractor
            </p>
          </div>
        </div>

        {/* Status indicator & Actions */}
        <div className="flex items-center gap-3">
          {isSampleMode && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Demo Mode (Pre-computed)</span>
            </div>
          )}

          {itemCount > 0 && (
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
              title="Reset checklist and clear text"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}

          <div className="hidden md:flex items-center gap-1 text-xs text-slate-400 pl-2 border-l border-slate-200">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span>Gemini 2.5 Flash + Deterministic Proof</span>
          </div>
        </div>
      </div>
    </header>
  );
}

