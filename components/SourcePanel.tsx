import React, { useRef, useEffect } from 'react';
import { FileText, Sparkles, Edit3, Lock, ArrowRight, Hash } from 'lucide-react';
import type { ChecklistItem } from '@/lib/verifyQuote.ts';

interface SourcePanelProps {
  sourceText: string;
  onTextChange: (text: string) => void;
  onLoadSample: () => void;
  onExtract: () => void;
  isLoading: boolean;
  items: ChecklistItem[];
  activeItemId: string | null;
  onSelectCard: (id: string) => void;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
}

export function SourcePanel({
  sourceText,
  onTextChange,
  onLoadSample,
  onExtract,
  isLoading,
  items,
  activeItemId,
  onSelectCard,
  isEditing,
  setIsEditing,
}: SourcePanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to active quote whenever activeItemId changes
  useEffect(() => {
    if (activeItemId && !isEditing) {
      const el = document.getElementById(`quote-anchor-${activeItemId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [activeItemId, isEditing]);

  const wordCount = sourceText.trim() ? sourceText.trim().split(/\s+/).length : 0;
  const charCount = sourceText.length;
  const hasItems = items.length > 0;

  // Render highlighted text by identifying verbatim quote spans
  const renderHighlightedContent = () => {
    if (!sourceText) {
      return (
        <div className="text-slate-400 italic text-center py-20 font-mono text-xs">
          [No document loaded. Paste brief text or click &ldquo;Load Sample Brief&rdquo;]
        </div>
      );
    }

    // Filter items with valid non-unverified matches
    const matchedItems = items.filter(
      (item) =>
        item.status !== 'UNVERIFIED' &&
        item.matchStartIndex !== undefined &&
        item.matchEndIndex !== undefined &&
        item.matchStartIndex >= 0 &&
        item.matchEndIndex <= sourceText.length &&
        item.matchStartIndex < item.matchEndIndex
    );

    if (matchedItems.length === 0) {
      return (
        <div className="whitespace-pre-wrap font-sans text-slate-800 text-sm leading-relaxed p-2">
          {sourceText}
        </div>
      );
    }

    // Sort intervals by start index ascending, longer intervals first for collisions
    const sorted = [...matchedItems].sort((a, b) => {
      if (a.matchStartIndex! !== b.matchStartIndex!) {
        return a.matchStartIndex! - b.matchStartIndex!;
      }
      return (b.matchEndIndex! - b.matchStartIndex!) - (a.matchEndIndex! - a.matchStartIndex!);
    });

    // Build non-overlapping segments
    const segments: Array<{ text: string; item?: ChecklistItem }> = [];
    let currentIdx = 0;

    for (const item of sorted) {
      const start = item.matchStartIndex!;
      const end = item.matchEndIndex!;

      if (start < currentIdx) {
        // Skip overlapping or partially eclipsed spans
        continue;
      }

      if (start > currentIdx) {
        segments.push({ text: sourceText.slice(currentIdx, start) });
      }

      segments.push({
        text: sourceText.slice(start, end),
        item,
      });

      currentIdx = end;
    }

    if (currentIdx < sourceText.length) {
      segments.push({ text: sourceText.slice(currentIdx) });
    }

    return (
      <div className="whitespace-pre-wrap font-sans text-slate-800 text-sm leading-relaxed p-2">
        {segments.map((seg, idx) => {
          if (!seg.item) {
            return <span key={idx}>{seg.text}</span>;
          }

          const isActive = seg.item.id === activeItemId;
          const isAmbiguous = seg.item.status === 'AMBIGUOUS';

          const highlightStyle = isActive
            ? 'bg-amber-300 ring-4 ring-amber-400 text-slate-950 font-semibold shadow-sm animate-pulse'
            : isAmbiguous
            ? 'bg-amber-100/90 hover:bg-amber-200 border-b-2 border-amber-500 text-slate-900'
            : 'bg-emerald-100/90 hover:bg-emerald-200 border-b-2 border-emerald-500 text-slate-900';

          return (
            <mark
              key={idx}
              id={`quote-anchor-${seg.item.id}`}
              onClick={() => onSelectCard(seg.item!.id)}
              className={`cursor-pointer px-1 py-0.5 rounded transition-all duration-200 ${highlightStyle}`}
              title={`Click to focus audit card (${seg.item.status}): "${seg.item.title}"`}
            >
              {seg.text}
            </mark>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Panel Header */}
      <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-slate-700" />
          <h2 className="font-mono font-bold text-slate-900 text-sm tracking-tight">
            SOURCE DOCUMENT EVIDENCE
          </h2>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {hasItems && (
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-mono font-medium rounded-lg text-slate-700 hover:text-slate-950 bg-white border border-slate-300 hover:bg-slate-50 transition-all shadow-2xs"
            >
              {isEditing ? (
                <>
                  <Lock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Lock & Inspect</span>
                </>
              ) : (
                <>
                  <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                  <span>Edit Source</span>
                </>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={onLoadSample}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium rounded-lg text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 transition-colors shadow-2xs disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Load Sample Brief</span>
          </button>
        </div>
      </div>

      {/* Document Viewer Body */}
      <div ref={containerRef} className="flex-1 p-5 overflow-y-auto min-h-[360px] bg-white">
        {isEditing || !hasItems ? (
          <div className="flex flex-col h-full">
            <textarea
              value={sourceText}
              onChange={(e) => onTextChange(e.target.value)}
              disabled={isLoading}
              placeholder="Paste raw hackathon brief, assignment instructions, or client RFP here..."
              className="w-full flex-1 min-h-[340px] p-4 font-mono text-xs text-slate-800 bg-slate-50/60 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none transition-all placeholder:text-slate-400 leading-relaxed"
            />
          </div>
        ) : (
          <div className="p-3 bg-slate-50/40 rounded-xl border border-slate-100 min-h-full">
            {renderHighlightedContent()}
          </div>
        )}
      </div>

      {/* Telemetry Footer & Action Trigger */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/90 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3 text-xs font-mono text-slate-500">
          <span className="flex items-center gap-1">
            <Hash className="w-3.5 h-3.5 text-slate-400" />
            <span>{charCount.toLocaleString()} chars</span>
          </span>
          <span>•</span>
          <span>{wordCount.toLocaleString()} words</span>
          {hasItems && !isEditing && (
            <>
              <span>•</span>
              <span className="text-emerald-700 font-semibold">Evidence Mode Active</span>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={onExtract}
          disabled={isLoading || !sourceText.trim()}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-mono text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-emerald-700/20 transition-all hover:shadow-lg hover:shadow-emerald-700/30 active:scale-[0.98]"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>RUNNING AUDIT...</span>
            </>
          ) : (
            <>
              <span>AUDIT & VERIFY REQUIREMENTS</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
