'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { SourcePanel } from '@/components/SourcePanel';
import { ChecklistPanel } from '@/components/ChecklistPanel';
import { ChecklistItem } from '@/lib/verifyQuote';
import { SAMPLE_BRIEF_TEXT } from '@/lib/sampleData';
import { AlertCircle, X } from 'lucide-react';

const STORAGE_KEY = 'prooftrail_session';

export default function Home() {
  const [sourceText, setSourceText] = useState<string>('');
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSampleMode, setIsSampleMode] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState<boolean>(false);

  // Load persisted session on initial mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.sourceText) setSourceText(parsed.sourceText);
        if (parsed.items && Array.isArray(parsed.items)) {
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

  // Save state to localStorage whenever sourceText, items, or isSampleMode changes
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

  // Load sample brief handler
  const handleLoadSample = () => {
    setSourceText(SAMPLE_BRIEF_TEXT);
    setErrorMessage(null);
    setIsEditing(false);
  };

  // Extract & Verify Checklist handler
  const handleExtract = async () => {
    if (!sourceText.trim()) return;

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
        throw new Error(data.error || 'Failed to extract checklist');
      }

      setItems(data.items || []);
      setIsSampleMode(Boolean(data.isSampleMode));
      setIsEditing(false);

      if (data.items && data.items.length > 0) {
        setActiveItemId(data.items[0].id);
      }
    } catch (err: any) {
      console.error('Extraction error:', err);
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
    if (confirm('Clear current brief and checklist?')) {
      setSourceText('');
      setItems([]);
      setActiveItemId(null);
      setIsSampleMode(false);
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
    <div className="min-h-screen flex flex-col bg-slate-100">
      <Navbar
        isSampleMode={isSampleMode}
        onReset={handleReset}
        itemCount={items.length}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-4">
        {/* Error Alert Banner */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start justify-between gap-3 shadow-2xs">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">Extraction Notice</p>
                <p className="text-xs text-rose-700 mt-0.5">{errorMessage}</p>
              </div>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-400 hover:text-rose-700 p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Split Screen Workspace */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Source Document Evidence Panel (7 cols on desktop) */}
          <section className="lg:col-span-7 h-[calc(100vh-140px)] min-h-[550px]">
            <SourcePanel
              sourceText={sourceText}
              onTextChange={setSourceText}
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

          {/* Right: Verified Checklist Panel (5 cols on desktop) */}
          <section className="lg:col-span-5 h-[calc(100vh-140px)] min-h-[550px]">
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
