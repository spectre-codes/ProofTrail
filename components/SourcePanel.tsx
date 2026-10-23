import React, { useRef, useEffect } from 'react';
import { FileText, Sparkles, Edit3, Eye, ArrowRight } from 'lucide-react';
import { ChecklistItem } from '@/lib/verifyQuote';

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
  const activeQuoteRef = useRef<HTMLElement | null>(null);

  // Auto-scroll to active quote when activeItemId changes
  useEffect(() => {
    if (activeItemId && !isEditing) {
      const el = document.getElementById(`quote-anchor-${activeItemId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        activeQuoteRef.current = el;
      }
    }
  }, [activeItemId, isEditing]);

  const wordCount = sourceText.trim() ? sourceText.trim().split(/\s+/).length : 0;
  const hasItems = items.length > 0;

  // Render highlighted text by identifying verbatim quotes
  const renderHighlightedContent = () => {
    if (!sourceText) {
      return (
        <div className="text-slate-400 italic text-center py-16">
          No source document provided. Paste text or click &ldquo;Load Sample Brief&rdquo;.
        </div>
      );
    }

    // If we have items with quotes, highlight them
    // Sort items by quote length descending to handle overlapping quotes cleanly
    const verifiedItemsWithQuotes = items.filter(
      (item) => item.status !== 'UNVERIFIED' && item.verbatimQuote && sourceText.includes(item.verbatimQuote)
    );

    if (verifiedItemsWithQuotes.length === 0) {
      return <div className="whitespace-pre-wrap font-sans text-slate-800 leading-relaxed">{sourceText}</div>;
    }

    // Construct highlighted segments by finding quote occurrences
    // Simple robust approach: split by quotes and tag
    let segments: Array<{ text: string; itemId?: string; isAmbiguous?: boolean }> = [{ text: sourceText }];

    for (const item of verifiedItemsWithQuotes) {
      const nextSegments: typeof segments = [];
      for (const seg of segments) {
        if (seg.itemId) {
          nextSegments.push(seg);
          continue;
        }

        const quote = item.verbatimQuote;
        const idx = seg.text.indexOf(quote);
        if (idx === -1) {
          nextSegments.push(seg);
        } else {
          const before = seg.text.slice(0, idx);
          const matched = seg.text.slice(idx, idx + quote.length);
          const after = seg.text.slice(idx + quote.length);

          if (before) nextSegments.push({ text: before });
          nextSegments.push({
            text: matched,
            itemId: item.id,
            isAmbiguous: item.isAmbiguous,
          });
          if (after) nextSegments.push({ text: after });
        }
      }
      segments = nextSegments;
    }

    return (
      <div className="whitespace-pre-wrap font-sans text-slate-800 text-sm leading-relaxed">
        {segments.map((seg, idx) => {
          if (!seg.itemId) {
            return <span key={idx}>{seg.text}</span>;
          }

          const isActive = seg.itemId === activeItemId;
          const bgClass = isActive
            ? 'bg-amber-300 ring-2 ring-amber-500 font-medium'
            : seg.isAmbiguous
            ? 'bg-amber-100 hover:bg-amber-200 border-b-2 border-amber-400'
            : 'bg-emerald-100 hover:bg-emerald-200 border-b-2 border-emerald-400';

          return (
            <mark
              key={idx}
              id={`quote-anchor-${seg.itemId}`}
              onClick={() => onSelectCard(seg.itemId!)}
              className={`cursor-pointer px-1 py-0.5 rounded transition-all duration-200 text-slate-900 ${bgClass}`}
              title="Click to view checklist item"
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
      <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/75 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-slate-600" />
          <h2 className="font-semibold text-slate-900 text-sm">Source Document Evidence</h2>
          <span className="text-xs text-slate-500">
            ({wordCount} words)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {hasItems && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg text-slate-600 hover:text-slate-900 bg-white border border-slate-200 shadow-2xs hover:bg-slate-50 transition-colors"
            >
              {isEditing ? (
                <>
                  <Eye className="w-3.5 h-3.5 text-emerald-600" />
                  <span>View Highlights</span>
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
            onClick={onLoadSample}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Load Sample Brief</span>
          </button>
        </div>
      </div>

      {/* Main Document Body */}
      <div ref={containerRef} className="flex-1 p-5 overflow-y-auto min-h-[360px]">
        {isEditing || !hasItems ? (
          <textarea
            value={sourceText}
            onChange={(e) => onTextChange(e.target.value)}
            disabled={isLoading}
            placeholder="Paste your assignment instructions, hackathon brief, or client RFP here..."
            className="w-full h-full min-h-[340px] p-4 text-sm font-sans text-slate-800 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none transition-all placeholder:text-slate-400"
          />
        ) : (
          <div className="p-3 bg-slate-50/30 rounded-xl min-h-full">
            {renderHighlightedContent()}
          </div>
        )}
      </div>

      {/* Panel Footer / Primary CTA */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between gap-4">
        <p className="text-xs text-slate-500">
          {hasItems
            ? '💡 Click highlighted text in document or checklist cards to inspect evidence.'
            : 'Enter or load a brief, then click below to verify actionable items.'}
        </p>

        <button
          onClick={onExtract}
          disabled={isLoading || !sourceText.trim()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-emerald-600/20 transition-all hover:shadow-lg hover:shadow-emerald-600/30 active:scale-[0.98]"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Analyzing & Verifying...</span>
            </>
          ) : (
            <>
              <span>Extract & Verify Checklist</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

