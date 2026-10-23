import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Quote, CheckSquare, Square } from 'lucide-react';
import { ChecklistItem, VerificationStatus, Category } from '@/lib/verifyQuote';

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
  const getStatusBadge = (status: VerificationStatus) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>VERIFIED</span>
          </span>
        );
      case 'AMBIGUOUS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>AMBIGUOUS</span>
          </span>
        );
      case 'UNVERIFIED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>UNVERIFIED</span>
          </span>
        );
    }
  };

  const getCategoryBadge = (category: Category) => {
    switch (category) {
      case 'deliverable':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
            Deliverable
          </span>
        );
      case 'deadline':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200">
            Deadline
          </span>
        );
      case 'rule':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
            Rule / Constraint
          </span>
        );
    }
  };

  return (
    <div
      onClick={onSelect}
      className={`group cursor-pointer rounded-xl border p-4 transition-all duration-200 bg-white ${
        isActive
          ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md bg-emerald-50/10'
          : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
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
          className="mt-0.5 text-slate-400 hover:text-emerald-600 focus:outline-none transition-colors"
          title={item.completed ? 'Mark uncompleted' : 'Mark completed'}
        >
          {item.completed ? (
            <CheckSquare className="w-5 h-5 text-emerald-600 fill-emerald-50" />
          ) : (
            <Square className="w-5 h-5 text-slate-300 hover:text-slate-400" />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header Badges */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-1.5">
              {getCategoryBadge(item.category)}
              {getStatusBadge(item.status)}
            </div>
            {isActive && (
              <span className="text-[11px] font-medium text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                Active in Source
              </span>
            )}
          </div>

          {/* Action Title */}
          <h4
            className={`text-sm font-semibold text-slate-900 leading-snug transition-all ${
              item.completed ? 'line-through text-slate-400' : ''
            }`}
          >
            {item.title}
          </h4>

          {/* Verbatim Supporting Quote */}
          {item.verbatimQuote && (
            <div className="mt-2.5 pl-3 border-l-2 border-slate-200 text-xs text-slate-600 font-sans italic bg-slate-50/60 p-2 rounded-r-lg group-hover:bg-slate-100/60 transition-colors">
              <div className="flex items-start gap-1.5">
                <Quote className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span className="line-clamp-2">&ldquo;{item.verbatimQuote}&rdquo;</span>
              </div>
            </div>
          )}

          {/* Ambiguity Reason Banner */}
          {item.isAmbiguous && item.ambiguityReason && (
            <div className="mt-2.5 p-2 rounded-lg bg-amber-50/80 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-amber-900">Ambiguity Detected: </span>
                <span>{item.ambiguityReason}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
