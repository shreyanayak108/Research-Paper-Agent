/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  AlertCircle, 
  Cpu, 
  ShieldCheck, 
  Terminal, 
  RefreshCw,
  BookOpen,
  ArrowRight,
  Layers
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { TokenMonitor } from './components/TokenMonitor';
import { PaperInput } from './components/PaperInput';
import { PaperMetadataCard } from './components/PaperMetadataCard';
import { CoreConceptView } from './components/CoreConceptView';
import { FlowchartViewer } from './components/FlowchartViewer';
import { StudentOpportunities } from './components/StudentOpportunities';
import { StarterCodeModal } from './components/StarterCodeModal';
import { RawAgentOutputModal } from './components/RawAgentOutputModal';
import { 
  PresetPaper, 
  AnalysisResponse, 
  StarterPack, 
  TokenTelemetry 
} from './types/research';

export default function App() {
  const [presets, setPresets] = useState<PresetPaper[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('mamba-s4');
  const [analysisData, setAnalysisData] = useState<AnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [budgetMode, setBudgetMode] = useState<'strict' | 'balanced'>('balanced');
  const [statusMessage, setStatusMessage] = useState<string>('');

  // Modals state
  const [isRawOutputModalOpen, setIsRawOutputModalOpen] = useState(false);
  const [activeStarterPack, setActiveStarterPack] = useState<{ pack: StarterPack; title: string } | null>(null);

  // Fetch presets on mount and trigger initial paper analysis
  useEffect(() => {
    const fetchPresets = async () => {
      try {
        const res = await fetch('/api/presets');
        if (res.ok) {
          const data = await res.json();
          setPresets(data.presets || []);
        }
      } catch (err) {
        console.error('Failed to load presets:', err);
      }
    };

    fetchPresets();
    // Auto-analyze default paper (Mamba) to provide immediate value
    handleAnalyze({ presetId: 'mamba-s4', url: 'https://arxiv.org/abs/2312.00752' });
  }, []);

  const handleAnalyze = async (payload: { url?: string; title?: string; rawText?: string; presetId?: string }) => {
    setIsLoading(true);
    setError(null);
    if (payload.presetId) {
      setSelectedPresetId(payload.presetId);
    } else {
      setSelectedPresetId('');
    }

    // Step status indicators for authentic agent experience
    setStatusMessage('Querying arXiv metadata & token-efficient context...');
    const timer1 = setTimeout(() => {
      setStatusMessage('Extracting core problem statement & algorithmic breakthroughs (<300 words)...');
    }, 1200);
    const timer2 = setTimeout(() => {
      setStatusMessage('Synthesizing Mermaid.js architecture graph & dataflow topology...');
    }, 2400);
    const timer3 = setTimeout(() => {
      setStatusMessage('Formulating 3 concrete student internship projects with metrics & tech stacks...');
    }, 3600);

    try {
      const res = await fetch('/api/analyze-paper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          budgetMode,
        }),
      });

      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Analysis failed with status ${res.status}`);
      }

      const data: AnalysisResponse = await res.json();
      setAnalysisData(data);
    } catch (err: any) {
      console.error('Paper analysis failed:', err);
      setError(err?.message || 'Failed to analyze paper. Please check the URL or try another paper.');
    } finally {
      setIsLoading(false);
      setStatusMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col selection:bg-blue-600/30">
      {/* Top Navbar */}
      <Navbar
        onOpenRawOutput={() => setIsRawOutputModalOpen(true)}
        hasAnalysis={!!analysisData}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Token Efficiency Constraint Monitor */}
        <TokenMonitor
          telemetry={analysisData?.telemetry || null}
          budgetMode={budgetMode}
          onToggleBudgetMode={(mode) => setBudgetMode(mode)}
        />

        {/* Paper Ingestion Section */}
        <PaperInput
          onAnalyze={handleAnalyze}
          isLoading={isLoading}
          presets={presets}
          selectedPresetId={selectedPresetId}
        />

        {/* Loading Indicator */}
        {isLoading && (
          <div className="p-8 bg-slate-900/80 border border-slate-800 rounded-2xl text-center space-y-4 shadow-xl">
            <div className="w-12 h-12 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-slate-100">
                CS Research Agent Ingesting Paper
              </h3>
              <p className="text-xs text-blue-400 font-mono">
                {statusMessage || 'Parsing system components and optimizing context within token budget...'}
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 text-[11px] text-slate-500 font-mono">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Under 25,000 token limit
              </span>
              <span>•</span>
              <span>Plain language summary</span>
              <span>•</span>
              <span>Mermaid.js flowchart</span>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-red-950/40 border border-red-800/80 rounded-2xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-red-200">Analysis Error</h4>
              <p className="text-xs text-red-300/80">{error}</p>
            </div>
          </div>
        )}

        {/* Main Analysis Output */}
        {analysisData && !isLoading && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Paper Metadata Banner */}
            <PaperMetadataCard
              paperDetails={analysisData.analysis.paperDetails}
              arxivMetadata={analysisData.arxivMetadata}
            />

            {/* Step 1: Core Concept Extraction */}
            <CoreConceptView
              concept={analysisData.analysis.coreConceptExtraction}
              paperDetails={analysisData.analysis.paperDetails}
            />

            {/* Step 2: Architectural Flowchart (Mermaid.js) */}
            <FlowchartViewer
              flowchart={analysisData.analysis.flowchart}
              paperTitle={analysisData.analysis.paperDetails.title}
            />

            {/* Step 3: Student Opportunities & Internship Projects */}
            <StudentOpportunities
              opportunities={analysisData.analysis.studentOpportunities}
              paperTitle={analysisData.analysis.paperDetails.title}
              onOpenStarterPack={(pack, title) => setActiveStarterPack({ pack, title })}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Autonomous Computer Science Research Agent</span>
          </div>
          <div className="font-mono text-[11px] text-slate-400">
            Strict adherence to &lt;25,000 token constraint • Plain Language &lt;300w • Mermaid.js TD
          </div>
        </div>
      </footer>

      {/* Starter Code Modal */}
      {activeStarterPack && (
        <StarterCodeModal
          pack={activeStarterPack.pack}
          projectTitle={activeStarterPack.title}
          onClose={() => setActiveStarterPack(null)}
        />
      )}

      {/* Raw Prompt Output Modal */}
      {analysisData && (
        <RawAgentOutputModal
          isOpen={isRawOutputModalOpen}
          onClose={() => setIsRawOutputModalOpen(false)}
          rawText={analysisData.labeledRawOutput}
          tokenCount={analysisData.telemetry.totalTokens}
        />
      )}
    </div>
  );
}
