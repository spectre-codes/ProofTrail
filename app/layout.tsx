import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ProofTrail — Evidence-Backed Requirements & Action Checklist Extractor',
  description:
    'Extract actionable checklist items from messy briefs with deterministic quote verification and ambiguity detection powered by Gemini 2.5 Flash.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-slate-50">
      <body className="font-sans min-h-full antialiased text-slate-800">
        {children}
      </body>
    </html>
  );
}
