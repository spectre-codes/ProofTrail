import React from 'react';
import { ChecklistItem, Category, VerificationStatus } from '@/lib/verifyQuote';
import { ChecklistCard } from './ChecklistCard';
import { CheckCircle2, AlertTriangle, ListChecks, Filter, Sparkles } from 'lucide-react';

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
      <div className="p-5 border-b border-slate-200 bg-slate-50/75">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ListChecks className="w-5 h-5 text-emerald-600" />
            <h2 className="font-semibold text-slate-900 text-sm">Actionable Checklist & Proof</h2>
          </div>
          {totalCount > 0 && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
              {completedCount} / {totalCount} completed
            </span>
          )}
        </div>

        {/* Progress Bar */}
        {totalCount > 0 ? (
          <div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden mb-3">
              <div
                className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            {/* Quick Metrics */}
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="flex items-center gap-1 font-medium text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{verifiedCount} Verified</span>
              </span>
              {ambiguousCount > 0 && (
                <span className="flex items-center gap-1 font-medium text-amber-700">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{ambiguousCount} Ambiguous</span>
                </span>
              )}
              {unverifiedCount > 0 && (
                <span className="flex items-center gap-1 font-medium text-rose-700">
                  <span>{unverifiedCount} Unverified</span>
                </span>
              )}
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-500">
            AI-extracted deliverables and deadlines backed by deterministic source evidence.
          </p>
        )}
      </div>

      {/* Filter Toolbar */}
      {totalCount > 0 && (
        <div className="px-5 py-3 border-b border-slate-200 bg-white flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 text-slate-400 mr-1 text-xs">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </div>

          {/* Category Filter Pills */}
          {(['all', 'deliverable', 'deadline', 'rule'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-all ${
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
          {(['all', 'VERIFIED', 'AMBIGUOUS'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                filterStatus === st
                  ? 'bg-emerald-700 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'all' ? 'All Status' : st}
            </button>
          ))}
        </div>
      )}

      {/* Checklist Cards Feed */}
      <div className="flex-1 p-5 overflow-y-auto space-y-3 min-h-[360px]">
        {isLoading ? (
          /* Loading Skeletons */
          <div className="space-y-3">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="rounded-xl border border-slate-200 p-4 animate-pulse bg-slate-50/70"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="h-4 bg-slate-200 rounded w-24" />
                  <div className="h-4 bg-slate-200 rounded w-20" />
                </div>
                <div className="h-5 bg-slate-200 rounded w-3/4 mb-2" />
                <div className="h-10 bg-slate-100 rounded w-full" />
              </div>
            ))}
          </div>
        ) : totalCount === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center text-center py-12 px-4 h-full">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 border border-emerald-100">
              <Sparkles className="w-7 h-7" />
            </div>
            <h3 className="font-semibold text-slate-900 text-base mb-1">
              No Checklist Extracted Yet
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mb-5 leading-relaxed">
              Paste your hackathon guidelines or project instructions into the left panel and click &ldquo;Extract & Verify Checklist&rdquo;.
            </p>
            <button
              onClick={onLoadSample}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors shadow-2xs"
            >
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Load Hackathon Sample Brief</span>
            </button>
          </div>
        ) : filteredItems.length === 0 ? (
          /* No filter match */
          <div className="text-center py-12 text-slate-400 text-xs">
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

