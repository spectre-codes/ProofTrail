import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Quote,
  CheckSquare,
  Square,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import type { ChecklistItem, VerificationStatus, Category } from '@/lib/verifyQuote.ts';

interface ChecklistCardProps {
  item: ChecklistItem;
  index: number;
  isActive: boolean;
  onSelect: () => void;
  onToggleComplete: () => void;
}

export function ChecklistCard({
  item,
  index,
  isActive,
  onSelect,
  onToggleComplete,
}: ChecklistCardProps) {
  const isUnverified = item.status === 'UNVERIFIED';
  const isAmbiguous = item.status === 'AMBIGUOUS';
  const isVerified = item.status === 'VERIFIED';

  // Left accent border styling
  const getBorderAccent = () => {
    if (isUnverified) return 'border-l-rose-500 hover:border-l-rose-600 bg-rose-50/15';
    if (isAmbiguous) return 'border-l-amber-500 hover:border-l-amber-600 bg-amber-50/15';
    return 'border-l-emerald-500 hover:border-l-emerald-600 bg-white';
  };

  // Standardized Status Badges across the entire app
  const getStatusBadge = (status: VerificationStatus) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-emerald-100/80 text-emerald-950 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
            <span>SOURCE MATCHED</span>
          </span>
        );
      case 'AMBIGUOUS':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-amber-100/90 text-amber-950 border border-amber-300">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
            <span>NEEDS REVIEW</span>
          </span>
        );
      case 'UNVERIFIED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-rose-100 text-rose-950 border border-rose-300">
            <XCircle className="w-3.5 h-3.5 text-rose-700" />
            <span>NO SOURCE MATCH</span>
          </span>
        );
    }
  };

  const getCategoryBadge = (category: Category) => {
    switch (category) {
      case 'deliverable':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold uppercase tracking-wider bg-zinc-100 text-zinc-800 border border-zinc-300">
            Deliverable
          </span>
        );
      case 'deadline':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold uppercase tracking-wider bg-purple-100 text-purple-900 border border-purple-300">
            Deadline
          </span>
        );
      case 'rule':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold uppercase tracking-wider bg-zinc-200 text-zinc-800 border border-zinc-300">
            Rule
          </span>
        );
    }
  };

  // Match telemetry label for the footer
  const renderMatchTelemetry = () => {
    if (isUnverified) {
      return (
        <span className="text-rose-700 font-mono text-[11px] font-medium flex items-center gap-1">
          <XCircle className="w-3 h-3 text-rose-600 inline" />
          <span>Not found in source text · Potential hallucination</span>
        </span>
      );
    }

    if (isAmbiguous) {
      const reasonSnippet = item.ambiguityReason
        ? item.ambiguityReason.replace(/^Critical Ambiguity:\s*/i, '').replace(/^Unspecified Scope:\s*/i, '')
        : 'Missing date/timezone';
      return (
        <span className="text-amber-900 font-mono text-[11px] font-medium">
          Found {item.occurrenceCount} occurrence{item.occurrenceCount > 1 ? 's' : ''} · Ambiguous: {reasonSnippet.slice(0, 42)}...
        </span>
      );
    }

    return (
      <span className="text-zinc-600 font-mono text-[11px]">
        Found {item.occurrenceCount} occurrence{item.occurrenceCount > 1 ? 's' : ''} · Exact match (normalized)
      </span>
    );
  };

  return (
    <div
      onClick={!isUnverified ? onSelect : undefined}
      className={`group rounded-xl border border-zinc-200 border-l-4 p-4 transition-all duration-150 overflow-visible h-auto ${getBorderAccent()} ${
        isActive
          ? 'ring-2 ring-zinc-900 ring-offset-2 shadow-md'
          : 'hover:shadow-sm'
      }`}
    >
      <div className="flex flex-col gap-3 h-auto overflow-visible">
        {/* Header Row: Index, Category, Status Badge & Top-Right View Source Action */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Item Index Badge */}
            <span className="px-1.5 py-0.5 rounded text-[11px] font-mono font-bold uppercase tracking-wider bg-zinc-100 text-zinc-600 border border-zinc-200">
              #{index + 1}
            </span>
            {getCategoryBadge(item.category)}
            {getStatusBadge(item.status)}
            {item.occurrenceCount > 1 && (
              <span
                className="px-2 py-0.5 rounded text-[11px] font-mono font-bold uppercase tracking-wider bg-zinc-100 text-zinc-700 border border-zinc-300"
                title="Quote occurs multiple times in source text"
              >
                {item.occurrenceCount}× in Source
              </span>
            )}
          </div>

          {/* Top-Right "View source ↗" Action */}
          <div>
            {!isUnverified && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect();
                }}
                className={`inline-flex items-center gap-1 text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md border transition-all ${
                  isActive
                    ? 'bg-zinc-900 text-white border-zinc-900 shadow-2xs'
                    : 'bg-white text-zinc-700 hover:text-zinc-950 hover:border-zinc-400 border-zinc-200'
                }`}
                title="Locate and focus this quote in the source document panel"
              >
                <span>View source</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Action Title */}
        <h4
          className={`text-[15px] font-semibold text-zinc-900 leading-snug transition-all ${
            item.completed ? 'line-through text-zinc-400' : ''
          }`}
        >
          {item.title}
        </h4>

        {/* Monospace Verbatim Quote Box */}
        {item.verbatimQuote && (
          <div className="rounded border border-zinc-200 bg-zinc-50/80 p-3 my-2 font-mono text-xs text-zinc-700 leading-relaxed group-hover:bg-zinc-100/70 transition-colors">
            <div className="flex items-start gap-2">
              <Quote className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
              <span className="line-clamp-3 select-all">
                &ldquo;{item.verbatimQuote}&rdquo;
              </span>
            </div>
          </div>
        )}

        {/* Ambiguity Reason Banner */}
        {item.isAmbiguous && item.ambiguityReason && (
          <div className="p-2.5 rounded-lg bg-amber-50/90 border border-amber-300 text-xs text-amber-950 flex items-start gap-2">
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
          <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-300 text-xs text-rose-950 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-rose-900 font-mono text-[11px] uppercase tracking-wider block mb-0.5">
                Deterministic Rejection
              </span>
              <span className="leading-normal">
                {item.ambiguityReason ||
                  'Extracted quote could not be verified against the source text. Do not act on unverified requirements without confirming original documentation.'}
              </span>
            </div>
          </div>
        )}

        {/* Card Footer Row: Match Telemetry on Left, Mark Complete Checkbox on Right */}
        <div className="mt-1 pt-2.5 border-t border-zinc-200/80 flex items-center justify-between gap-3">
          <div className="truncate mr-2">
            {renderMatchTelemetry()}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleComplete();
            }}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 border border-zinc-200 transition-colors shrink-0"
            title={item.completed ? 'Mark pending' : 'Mark completed'}
          >
            {item.completed ? (
              <>
                <CheckSquare className="w-4 h-4 text-emerald-700 fill-emerald-100" />
                <span className="line-through text-zinc-400">Completed</span>
              </>
            ) : (
              <>
                <Square className="w-4 h-4 text-zinc-400" />
                <span>Mark complete</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
