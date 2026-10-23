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
  Hash,
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

  const deliverablesCount = items.filter((i) => i.category === 'deliverable').length;
  const deadlinesCount = items.filter((i) => i.category === 'deadline').length;
  const rulesCount = items.filter((i) => i.category === 'rule').length;

  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Filter items
  const filteredItems = items.filter((item) => {
    if (filterCategory !== 'all' && item.category !== filterCategory) return false;
    if (filterStatus !== 'all' && item.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
      {/* Panel Header */}
      <div className="p-3.5 sm:p-4 border-b border-zinc-200 bg-zinc-50/80">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <ListChecks className="w-5 h-5 text-zinc-700" />
            <h2 className="font-mono font-bold text-zinc-900 text-sm tracking-tight">
              REQUIREMENTS AUDIT FEED
            </h2>
          </div>
          {totalCount > 0 && (
            <span className="font-mono text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-zinc-200/80 text-zinc-800">
              {completedCount}/{totalCount} Completed ({progressPercentage}%)
            </span>
          )}
        </div>

        {/* 4 Interactive Summary Metric Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
          {/* 1. Total Tile */}
          <button
            type="button"
            onClick={() => setFilterStatus('all')}
            className={`text-left p-2.5 rounded-lg border transition-all cursor-pointer ${
              filterStatus === 'all'
                ? 'ring-2 ring-zinc-900 bg-zinc-50 border-zinc-300 shadow-sm'
                : 'bg-white text-zinc-900 border-zinc-200/90 hover:border-zinc-300 hover:bg-zinc-50'
            }`}
            title="Click to view all items"
          >
            <div className="text-[10px] font-mono uppercase tracking-wider font-semibold text-zinc-500">
              Total
            </div>
            <div className="text-2xl font-mono font-semibold tabular-nums text-zinc-900 mt-0.5">
              {totalCount}
            </div>
            <div className="text-[11px] leading-tight font-mono text-zinc-500 whitespace-nowrap mt-0.5">
              Items
            </div>
          </button>

          {/* 2. Source Matched Tile */}
          <button
            type="button"
            onClick={() => setFilterStatus('VERIFIED')}
            className={`text-left p-2.5 rounded-lg border transition-all cursor-pointer ${
              filterStatus === 'VERIFIED'
                ? 'ring-2 ring-emerald-500 bg-emerald-50/60 border-emerald-300 shadow-sm'
                : 'bg-emerald-50/70 text-emerald-950 border-emerald-200 hover:border-emerald-300 hover:bg-emerald-100/50'
            }`}
            title="Click to filter to Source Matched items"
          >
            <div className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider font-semibold text-emerald-800">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>Source Matched</span>
            </div>
            <div className="text-2xl font-mono font-semibold tabular-nums text-emerald-950 mt-0.5">
              {verifiedCount}
            </div>
            <div className="text-[11px] leading-tight font-mono text-emerald-700/80 whitespace-nowrap mt-0.5">
              Verified
            </div>
          </button>

          {/* 3. Needs Review Tile */}
          <button
            type="button"
            onClick={() => setFilterStatus('AMBIGUOUS')}
            className={`text-left p-2.5 rounded-lg border transition-all cursor-pointer ${
              filterStatus === 'AMBIGUOUS'
                ? 'ring-2 ring-amber-500 bg-amber-50/60 border-amber-300 shadow-sm'
                : 'bg-amber-50/70 text-amber-950 border-amber-200 hover:border-amber-300 hover:bg-amber-100/50'
            }`}
            title="Click to filter to Needs Review items"
          >
            <div className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider font-semibold text-amber-800">
              <AlertTriangle className="w-3 h-3 text-amber-600" />
              <span>Needs Review</span>
            </div>
            <div className="text-2xl font-mono font-semibold tabular-nums text-amber-950 mt-0.5">
              {ambiguousCount}
            </div>
            <div className="text-[11px] leading-tight font-mono text-amber-700/80 whitespace-nowrap mt-0.5">
              Review
            </div>
          </button>

          {/* 4. No Source Match Tile */}
          <button
            type="button"
            onClick={() => setFilterStatus('UNVERIFIED')}
            className={`text-left p-2.5 rounded-lg border transition-all cursor-pointer ${
              filterStatus === 'UNVERIFIED'
                ? 'ring-2 ring-rose-500 bg-rose-50/60 border-rose-300 shadow-sm'
                : 'bg-rose-50/70 text-rose-950 border-rose-200 hover:border-rose-300 hover:bg-rose-100/50'
            }`}
            title="Click to filter to No Source Match items"
          >
            <div className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider font-semibold text-rose-800">
              <XCircle className="w-3 h-3 text-rose-600" />
              <span>No Match</span>
            </div>
            <div className="text-2xl font-mono font-semibold tabular-nums text-rose-950 mt-0.5">
              {unverifiedCount}
            </div>
            <div className="text-[11px] leading-tight font-mono text-rose-700/80 whitespace-nowrap mt-0.5">
              Flagged
            </div>
          </button>
        </div>

        {/* Progress Bar */}
        {totalCount > 0 && (
          <div className="w-full bg-zinc-200 rounded-full h-1.5 overflow-hidden mb-2">
            <div
              className="bg-emerald-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        )}

        {/* Honesty Disclaimer Banner with Unified Status Vocabulary */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-zinc-50 border border-zinc-200/80 text-[11px] text-zinc-500 leading-relaxed font-sans my-2">
          <Info className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
          <span>
            <strong>Deterministic Evidence:</strong> <em>Source Matched</em> confirms verbatim quote exists. Always review items marked <em>Needs Review</em> before submission.
          </span>
        </div>
      </div>

      {/* Filter Toolbar with Standardized Vocabulary and Dynamic Item Counts */}
      {totalCount > 0 && (
        <div className="px-4 py-2 border-b border-zinc-200 bg-white flex flex-col gap-1.5 overflow-hidden">
          {/* Category Filter Row (Single Row with Horizontal Scroll) */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 no-scrollbar">
            <span className="text-[10px] font-mono uppercase text-zinc-400 mr-0.5 shrink-0">Types:</span>
            <button
              type="button"
              onClick={() => setFilterCategory('all')}
              className={`px-2 py-0.5 rounded-md text-[11px] font-mono shrink-0 whitespace-nowrap transition-all ${
                filterCategory === 'all'
                  ? 'bg-zinc-900 text-white font-semibold'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              All ({totalCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterCategory('deliverable')}
              className={`px-2 py-0.5 rounded-md text-[11px] font-mono shrink-0 whitespace-nowrap transition-all ${
                filterCategory === 'deliverable'
                  ? 'bg-zinc-900 text-white font-semibold'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              Deliverables ({deliverablesCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterCategory('deadline')}
              className={`px-2 py-0.5 rounded-md text-[11px] font-mono shrink-0 whitespace-nowrap transition-all ${
                filterCategory === 'deadline'
                  ? 'bg-zinc-900 text-white font-semibold'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              Deadlines ({deadlinesCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterCategory('rule')}
              className={`px-2 py-0.5 rounded-md text-[11px] font-mono shrink-0 whitespace-nowrap transition-all ${
                filterCategory === 'rule'
                  ? 'bg-zinc-900 text-white font-semibold'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              Rules ({rulesCount})
            </button>
          </div>

          {/* Status Filter Row (Single Row with Horizontal Scroll) */}
          <div className="flex items-center gap-1.5 pt-1.5 border-t border-zinc-100 overflow-x-auto py-0.5 no-scrollbar">
            <span className="text-[10px] font-mono uppercase text-zinc-400 mr-0.5 shrink-0">Status:</span>
            <button
              type="button"
              onClick={() => setFilterStatus('all')}
              className={`px-2 py-0.5 rounded-md text-[11px] font-mono shrink-0 whitespace-nowrap transition-all ${
                filterStatus === 'all'
                  ? 'bg-zinc-900 text-white font-semibold'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              All ({totalCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('VERIFIED')}
              className={`px-2 py-0.5 rounded-md text-[11px] font-mono shrink-0 whitespace-nowrap transition-all ${
                filterStatus === 'VERIFIED'
                  ? 'bg-emerald-800 text-white font-semibold'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/60'
              }`}
            >
              Source Matched ({verifiedCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('AMBIGUOUS')}
              className={`px-2 py-0.5 rounded-md text-[11px] font-mono shrink-0 whitespace-nowrap transition-all ${
                filterStatus === 'AMBIGUOUS'
                  ? 'bg-amber-800 text-white font-semibold'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/60'
              }`}
            >
              Needs Review ({ambiguousCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('UNVERIFIED')}
              className={`px-2 py-0.5 rounded-md text-[11px] font-mono shrink-0 whitespace-nowrap transition-all ${
                filterStatus === 'UNVERIFIED'
                  ? 'bg-rose-800 text-white font-semibold'
                  : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200/60'
              }`}
            >
              No Source Match ({unverifiedCount})
            </button>
          </div>
        </div>
      )}

      {/* Checklist Cards Feed */}
      <div className="flex-1 p-4 sm:p-5 pb-32 overflow-y-auto space-y-3 min-h-[360px]">
        {isLoading ? (
          /* Loading Skeletons */
          <div className="space-y-3">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="rounded-xl border border-zinc-200 border-l-4 border-l-zinc-300 p-4 animate-pulse bg-zinc-50/70"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="h-4 bg-zinc-200 rounded w-28" />
                  <div className="h-4 bg-zinc-200 rounded w-20" />
                </div>
                <div className="h-5 bg-zinc-200 rounded w-3/4 mb-2" />
                <div className="h-12 bg-zinc-100 rounded w-full" />
              </div>
            ))}
          </div>
        ) : totalCount === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center text-center py-14 px-4 h-full">
            <div className="w-14 h-14 rounded-2xl bg-zinc-100 text-zinc-600 flex items-center justify-center mb-4 border border-zinc-200">
              <Sparkles className="w-7 h-7 text-zinc-500" />
            </div>
            <h3 className="font-mono font-bold text-zinc-900 text-base mb-1">
              Ready for Requirements Audit
            </h3>
            <p className="text-xs text-zinc-500 max-w-sm mb-5 leading-relaxed font-sans">
              Paste your hackathon guidelines, client RFP, or project brief on the left and click &ldquo;Audit & Verify Requirements&rdquo;.
            </p>
            <button
              type="button"
              onClick={onLoadSample}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono font-semibold text-zinc-800 bg-white hover:bg-zinc-50 border border-zinc-300 transition-colors shadow-2xs"
            >
              <Sparkles className="w-4 h-4 text-zinc-500" />
              <span>Load Sample Brief (Fixture)</span>
            </button>
          </div>
        ) : filteredItems.length === 0 ? (
          /* No filter match */
          <div className="text-center py-12 text-zinc-400 text-xs font-mono">
            No requirements match the active filter criteria.
          </div>
        ) : (
          /* Render Checklist Cards with Index */
          filteredItems.map((item, idx) => (
            <ChecklistCard
              key={item.id}
              item={item}
              index={idx}
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
