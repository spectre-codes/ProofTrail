'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '@/components/Navbar';
import { SourcePanel } from '@/components/SourcePanel';
import { ChecklistPanel } from '@/components/ChecklistPanel';
import type { ChecklistItem } from '@/lib/verifyQuote.ts';
import { SAMPLE_BRIEF_TEXT } from '@/lib/sampleData.ts';
import { AlertCircle, X } from 'lucide-react';

const STORAGE_KEY = 'prooftrail_session_v2';

export default function Home() {
  const [sourceText, setSourceText] = useState<string>('');
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSampleMode, setIsSampleMode] = useState<boolean>(true); // Default to true until live API is exercised
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState<boolean>(false);

  // Restore session from localStorage on initial mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.sourceText === 'string') setSourceText(parsed.sourceText);
        if (Array.isArray(parsed.items)) {
          setItems(parsed.items);
          if (parsed.items.length > 0) {
            setActiveItemId(parsed.items[0].id);
          }
        }
        if (typeof parsed.isSampleMode === 'boolean') {
          setIsSampleMode(parsed.isSampleMode);
        }
      }
    } catch (e) {
      console.warn('Failed to restore from localStorage:', e);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Save state to localStorage on state changes
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          sourceText,
          items,
          isSampleMode,
          lastUpdated: Date.now(),
        })
      );
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
  }, [sourceText, items, isSampleMode, isHydrated]);

  // Handle source text edits: immediately clear stale audit results, highlights & notices
  const handleSourceTextChange = useCallback((text: string) => {
    setSourceText(text);
    setActiveItemId(null);
    setItems([]);
    setErrorMessage(null);
  }, []);

  // Load sample brief handler
  const handleLoadSample = useCallback(() => {
    setSourceText(SAMPLE_BRIEF_TEXT);
    setErrorMessage(null);
    setIsEditing(false);
    setActiveItemId(null);
    setItems([]);
  }, []);

  // Extract & Verify Checklist handler
  const handleExtract = async () => {
    // Guard against concurrent duplicate requests or empty source
    if (isLoading || !sourceText.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);
    setActiveItemId(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: sourceText }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to extract requirements checklist.');
      }

      setItems(data.items || []);
      setIsSampleMode(Boolean(data.isSampleMode));
      setIsEditing(false);

      if (data.items && data.items.length > 0) {
        // Select the first verified or ambiguous item by default
        const firstMatchable = data.items.find((i: ChecklistItem) => i.status !== 'UNVERIFIED');
        setActiveItemId(firstMatchable ? firstMatchable.id : data.items[0].id);
      }
    } catch (err: any) {
      console.error('Audit extraction error:', err);
      setItems([]);
      setActiveItemId(null);
      setErrorMessage(err.message || 'An unexpected error occurred while analyzing the brief.');
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle checklist item completion
  const handleToggleComplete = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  // Reset entire dashboard
  const handleReset = () => {
    if (confirm('Reset workspace? This will clear current brief and audit results.')) {
      setSourceText('');
      setItems([]);
      setActiveItemId(null);
      setIsSampleMode(true);
      setErrorMessage(null);
      setIsEditing(false);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {
        // ignore
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-100 font-sans text-zinc-900">
      <Navbar
        isSampleMode={isSampleMode}
        onReset={handleReset}
        itemCount={items.length}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-4">
        {/* Error Alert Banner */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 flex items-start justify-between gap-3 shadow-2xs">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-mono font-bold text-xs uppercase tracking-wider text-rose-950">
                  Audit Execution Notice
                </p>
                <p className="text-xs text-rose-800 mt-0.5 leading-relaxed">{errorMessage}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-rose-400 hover:text-rose-700 p-1 rounded-lg"
              title="Dismiss notice"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Split Screen Forensic Workspace */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Source Document Evidence Panel (7 cols on desktop) */}
          <section className="lg:col-span-7 h-[calc(100vh-140px)] min-h-[560px]">
            <SourcePanel
              sourceText={sourceText}
              onTextChange={handleSourceTextChange}
              onLoadSample={handleLoadSample}
              onExtract={handleExtract}
              isLoading={isLoading}
              items={items}
              activeItemId={activeItemId}
              onSelectCard={setActiveItemId}
              isEditing={isEditing}
              setIsEditing={setIsEditing}
            />
          </section>

          {/* Right: Requirements Audit Feed Panel (5 cols on desktop) */}
          <section className="lg:col-span-5 h-[calc(100vh-140px)] min-h-[560px]">
            <ChecklistPanel
              items={items}
              isLoading={isLoading}
              activeItemId={activeItemId}
              onSelectCard={setActiveItemId}
              onToggleComplete={handleToggleComplete}
              filterCategory={filterCategory}
              setFilterCategory={setFilterCategory}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              onLoadSample={handleLoadSample}
            />
          </section>
        </div>
      </main>
    </div>
  );
}
