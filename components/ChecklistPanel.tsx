import React from 'react';
import type { ChecklistItem } from '@/lib/verifyQuote.ts';
import { ChecklistCard } from './ChecklistCard';
import {
  ListChecks,
  Filter,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  Info,
} from 'lucide-react';

interface ChecklistPanelProps {
  items: ChecklistItem[];
  isLoading: boolean;
  activeItemId: string | null;
  onSelectCard: (id: string) => void;
  onToggleComplete: (id: string) => void;
  filterCategory: string;
  setFilterCategory: (category: string) => void;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  onLoadSample: () => void;
}

export function ChecklistPanel({
  items,
  isLoading,
  activeItemId,
  onSelectCard,
  onToggleComplete,
  filterCategory,
  setFilterCategory,
  filterStatus,
  setFilterStatus,
  onLoadSample,
}: ChecklistPanelProps) {
  const totalCount = items.length;
  const completedCount = items.filter((i) => i.completed).length;
  const verifiedCount = items.filter((i) => i.status === 'VERIFIED').length;
  const ambiguousCount = items.filter((i) => i.status === 'AMBIGUOUS').length;
  const unverifiedCount = items.filter((i) => i.status === 'UNVERIFIED').length;

  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Filter items
  const filteredItems = items.filter((item) => {
    if (filterCategory !== 'all' && item.category !== filterCategory) return false;
    if (filterStatus !== 'all' && item.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Panel Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/80">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ListChecks className="w-5 h-5 text-emerald-600" />
            <h2 className="font-mono font-bold text-slate-900 text-sm tracking-tight">
              REQUIREMENTS AUDIT FEED
            </h2>
          </div>
          {totalCount > 0 && (
            <span className="font-mono text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-200/80 text-slate-800">
              {completedCount}/{totalCount} Completed ({progressPercentage}%)
            </span>
          )}
        </div>

        {/* 4-Column Monospace Evidence Telemetry Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
          {/* 1. Total Extracted */}
          <div className="p-2.5 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
              Total Extracted
            </div>
            <div className="text-lg font-mono font-bold text-slate-900 mt-0.5">
              {totalCount}
            </div>
          </div>

          {/* 2. Source Matched (Verified) */}
          <div className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-200 shadow-2xs">
            <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-800 uppercase tracking-wider font-semibold">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>Matched</span>
            </div>
            <div className="text-lg font-mono font-bold text-emerald-900 mt-0.5">
              {verifiedCount}
            </div>
          </div>

          {/* 3. Ambiguous / Review */}
          <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200 shadow-2xs">
            <div className="flex items-center gap-1 text-[10px] font-mono text-amber-800 uppercase tracking-wider font-semibold">
              <AlertTriangle className="w-3 h-3 text-amber-600" />
              <span>Ambiguous</span>
            </div>
            <div className="text-lg font-mono font-bold text-amber-950 mt-0.5">
              {ambiguousCount}
            </div>
          </div>

          {/* 4. Unmatched / Hallucination Caught */}
          <div className="p-2.5 rounded-lg bg-rose-50/70 border border-rose-200 shadow-2xs">
            <div className="flex items-center gap-1 text-[10px] font-mono text-rose-800 uppercase tracking-wider font-semibold">
              <XCircle className="w-3 h-3 text-rose-600" />
              <span>Unmatched</span>
            </div>
            <div className="text-lg font-mono font-bold text-rose-950 mt-0.5">
              {unverifiedCount}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {totalCount > 0 && (
          <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden mb-3">
            <div
              className="bg-emerald-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        )}

        {/* Honesty Disclaimer Banner */}
        <div className="flex items-start gap-2 p-2 rounded-lg bg-slate-100/90 border border-slate-200 text-[11px] text-slate-600 leading-relaxed font-sans">
          <Info className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
          <span>
            <strong>Deterministic Evidence:</strong> Source Match confirms the verbatim quote exists in your text. Always review ambiguous details and full context before submission.
          </span>
        </div>
      </div>

      {/* Filter Toolbar */}
      {totalCount > 0 && (
        <div className="px-5 py-2.5 border-b border-slate-200 bg-white flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 text-slate-400 mr-1 text-xs font-mono">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </div>

          {/* Category Filter Pills */}
          {(['all', 'deliverable', 'deadline', 'rule'] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilterCategory(cat)}
              className={`px-2.5 py-1 rounded-md text-xs font-mono font-medium capitalize transition-all ${
                filterCategory === cat
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'all' ? 'All Types' : `${cat}s`}
            </button>
          ))}

          <span className="w-px h-4 bg-slate-200 mx-1 hidden sm:block" />

          {/* Status Filter Pills */}
          {(['all', 'VERIFIED', 'AMBIGUOUS', 'UNVERIFIED'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFilterStatus(st)}
              className={`px-2.5 py-1 rounded-md text-xs font-mono font-medium transition-all ${
                filterStatus === st
                  ? 'bg-emerald-800 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'all' ? 'All Statuses' : st}
            </button>
          ))}
        </div>
      )}

      {/* Checklist Cards Feed */}
      <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-3 min-h-[360px]">
        {isLoading ? (
          /* Loading Skeletons */
          <div className="space-y-3">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="rounded-xl border border-slate-200 border-l-4 border-l-slate-300 p-4 animate-pulse bg-slate-50/70"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="h-4 bg-slate-200 rounded w-28" />
                  <div className="h-4 bg-slate-200 rounded w-20" />
                </div>
                <div className="h-5 bg-slate-200 rounded w-3/4 mb-2" />
                <div className="h-12 bg-slate-100 rounded w-full" />
              </div>
            ))}
          </div>
        ) : totalCount === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center text-center py-14 px-4 h-full">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center mb-4 border border-slate-200">
              <Sparkles className="w-7 h-7 text-emerald-600" />
            </div>
            <h3 className="font-mono font-bold text-slate-900 text-base mb-1">
              Ready for Requirements Audit
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mb-5 leading-relaxed font-sans">
              Paste your hackathon guidelines, client RFP, or project brief on the left and click &ldquo;Audit & Verify Requirements&rdquo;.
            </p>
            <button
              type="button"
              onClick={onLoadSample}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 transition-colors shadow-2xs"
            >
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Load Hackathon Sample Brief</span>
            </button>
          </div>
        ) : filteredItems.length === 0 ? (
          /* No filter match */
          <div className="text-center py-12 text-slate-400 text-xs font-mono">
            No checklist items match the selected filter.
          </div>
        ) : (
          /* Render Checklist Cards */
          filteredItems.map((item) => (
            <ChecklistCard
              key={item.id}
              item={item}
              isActive={item.id === activeItemId}
              onSelect={() => onSelectCard(item.id)}
              onToggleComplete={() => onToggleComplete(item.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
