import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Quote,
  CheckSquare,
  Square,
  CornerDownRight,
  ShieldAlert,
} from 'lucide-react';
import type { ChecklistItem, VerificationStatus, Category } from '@/lib/verifyQuote.ts';

interface ChecklistCardProps {
  item: ChecklistItem;
  isActive: boolean;
  onSelect: () => void;
  onToggleComplete: () => void;
}

export function ChecklistCard({
  item,
  isActive,
  onSelect,
  onToggleComplete,
}: ChecklistCardProps) {
  const isUnverified = item.status === 'UNVERIFIED';
  const isAmbiguous = item.status === 'AMBIGUOUS';
  const isVerified = item.status === 'VERIFIED';

  // Left accent border & card background
  const getBorderAccent = () => {
    if (isUnverified) return 'border-l-rose-500 hover:border-l-rose-600 bg-rose-50/10';
    if (isAmbiguous) return 'border-l-amber-500 hover:border-l-amber-600 bg-amber-50/10';
    return 'border-l-emerald-500 hover:border-l-emerald-600 bg-white';
  };

  const getStatusBadge = (status: VerificationStatus) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-emerald-100/80 text-emerald-900 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
            <span>SOURCE MATCHED</span>
          </span>
        );
      case 'AMBIGUOUS':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-amber-100/90 text-amber-950 border border-amber-300">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
            <span>AMBIGUOUS — REVIEW REQUIRED</span>
          </span>
        );
      case 'UNVERIFIED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-rose-100 text-rose-950 border border-rose-300">
            <XCircle className="w-3.5 h-3.5 text-rose-700" />
            <span>NO SOURCE MATCH — FLAGGED</span>
          </span>
        );
    }
  };

  const getCategoryBadge = (category: Category) => {
    switch (category) {
      case 'deliverable':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-300">
            Deliverable
          </span>
        );
      case 'deadline':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider bg-purple-100 text-purple-900 border border-purple-300">
            Deadline
          </span>
        );
      case 'rule':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider bg-slate-200 text-slate-800 border border-slate-300">
            Constraint / Rule
          </span>
        );
    }
  };

  return (
    <div
      onClick={!isUnverified ? onSelect : undefined}
      className={`group rounded-xl border border-slate-200 border-l-4 p-4 transition-all duration-150 ${getBorderAccent()} ${
        isActive
          ? 'ring-2 ring-emerald-500 shadow-md bg-emerald-50/20'
          : 'hover:shadow-sm'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Toggle Checkbox */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleComplete();
          }}
          className="mt-0.5 text-slate-400 hover:text-emerald-700 focus:outline-none transition-colors"
          title={item.completed ? 'Mark pending' : 'Mark completed'}
        >
          {item.completed ? (
            <CheckSquare className="w-5 h-5 text-emerald-700 fill-emerald-100" />
          ) : (
            <Square className="w-5 h-5 text-slate-300 hover:text-slate-500" />
          )}
        </button>

        {/* Card Body */}
        <div className="flex-1 min-w-0">
          {/* Metadata Badges */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              {getCategoryBadge(item.category)}
              {getStatusBadge(item.status)}
              {item.occurrenceCount > 1 && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-300" title="Quote occurs multiple times in source text">
                  {item.occurrenceCount}× in Source
                </span>
              )}
            </div>

            {isActive && (
              <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300 animate-pulse">
                ACTIVE IN SOURCE
              </span>
            )}
          </div>

          {/* Action Title */}
          <h4
            className={`text-sm font-semibold text-slate-900 leading-snug tracking-tight transition-all ${
              item.completed ? 'line-through text-slate-400' : ''
            }`}
          >
            {item.title}
          </h4>

          {/* Monospace Verbatim Quote Box */}
          {item.verbatimQuote && (
            <div className="mt-2.5 rounded-lg border border-slate-200 bg-slate-50 p-2.5 font-mono text-xs text-slate-700 leading-relaxed group-hover:bg-slate-100/70 transition-colors">
              <div className="flex items-start gap-2">
                <Quote className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span className="line-clamp-3 select-all">
                  &ldquo;{item.verbatimQuote}&rdquo;
                </span>
              </div>
            </div>
          )}

          {/* Ambiguity Reason Banner */}
          {item.isAmbiguous && item.ambiguityReason && (
            <div className="mt-2.5 p-2.5 rounded-lg bg-amber-50/90 border border-amber-300 text-xs text-amber-950 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-900 font-mono text-[11px] uppercase tracking-wider block mb-0.5">
                  Ambiguity Warning
                </span>
                <span className="leading-normal">{item.ambiguityReason}</span>
              </div>
            </div>
          )}

          {/* Hallucination / Unverified Warning Banner */}
          {isUnverified && (
            <div className="mt-2.5 p-2.5 rounded-lg bg-rose-50 border border-rose-300 text-xs text-rose-950 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-rose-900 font-mono text-[11px] uppercase tracking-wider block mb-0.5">
                  Deterministic Rejection
                </span>
                <span className="leading-normal">
                  {item.ambiguityReason || 'Extracted quote could not be verified against the source text. Do not act on unverified requirements without confirming original documentation.'}
                </span>
              </div>
            </div>
          )}

          {/* Action Footer: Locate in Source / Disabled State */}
          <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100">
            {!isUnverified ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect();
                }}
                className={`inline-flex items-center gap-1.5 text-xs font-mono font-medium rounded-md px-2.5 py-1 transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
                }`}
                title="Scroll and highlight supporting verbatim quote in the source panel"
              >
                <CornerDownRight className="w-3.5 h-3.5" />
                <span>Locate in Source ↵</span>
              </button>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-rose-700 font-medium">
                <XCircle className="w-3.5 h-3.5" />
                <span>Quote Not Found in Source</span>
              </span>
            )}

            <span className="text-[10px] font-mono text-slate-400">
              ID: {item.id.slice(-8)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
