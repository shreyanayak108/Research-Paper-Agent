/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  AlertCircle, 
  Cpu, 
  ShieldCheck, 
  Terminal, 
  RefreshCw,
  BookOpen,
  ArrowRight,
  Layers,
  Clock,
  XCircle,
  CheckCircle2
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

type LoadingStage = 'fetching' | 'analyzing' | 'preparing';

const STAGE_CONFIG: Record<LoadingStage, { label: string; detail: string; stepNumber: number }> = {
  fetching: {
    label: 'Fetching paper',
    detail: 'Connecting to paper repository & indexing token-efficient metadata...',
    stepNumber: 1,
  },
  analyzing: {
    label: 'Analysing research',
    detail: 'Extracting 7-point formulation, objective, methodology, and breakthroughs (<300w)...',
    stepNumber: 2,
  },
  preparing: {
    label: 'Preparing architecture and projects',
    detail: 'Synthesizing Mermaid.js architecture graph and 3 student internship projects...',
    stepNumber: 3,
  },
};

export default function App() {
  const [presets, setPresets] = useState<PresetPaper[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('mamba-s4');
  const [analysisData, setAnalysisData] = useState<AnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStage, setLoadingStage] = useState<LoadingStage>('fetching');
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [budgetMode, setBudgetMode] = useState<'strict' | 'balanced'>('balanced');

  // Session caches & request lifecycle management (avoids redundant Gemini calls and stale overwrites)
  const sessionCacheRef = useRef<Map<string, AnalysisResponse>>(new Map());
  const activeRequestIdRef = useRef<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastPayloadRef = useRef<{ url?: string; title?: string; rawText?: string; presetId?: string; refresh?: boolean } | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Modals state
  const [isRawOutputModalOpen, setIsRawOutputModalOpen] = useState(false);
  const [activeStarterPack, setActiveStarterPack] = useState<{ pack: StarterPack; title: string } | null>(null);

  const getPayloadKey = (p: { url?: string; title?: string; rawText?: string; presetId?: string }): string => {
    if (p.presetId) return `preset:${p.presetId}`;
    const aid = (p.url || '').match(/(\d{4}\.\d{4,5})/);
    if (aid) return `arxiv:${aid[1]}`;
    if (p.url?.trim()) return `url:${p.url.trim().toLowerCase()}`;
    if (p.title?.trim()) return `title:${p.title.trim().toLowerCase()}`;
    if (p.rawText?.trim()) return `text:${p.rawText.trim().slice(0, 100).toLowerCase()}`;
    return '';
  };

  // Fetch presets on mount and trigger initial paper analysis
  useEffect(() => {
    const fetchPresets = async () => {
      try {
        const res = await fetch('/api/presets');
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          const data = await res.json();
          setPresets(data.presets || []);
        } else {
          console.warn('Preset response was not JSON or not OK:', res.status, contentType);
        }
      } catch (err) {
        console.error('Failed to load presets:', err);
      }
    };

    fetchPresets();
    // Auto-analyze default paper (Mamba) to provide immediate value
    handleAnalyze({ presetId: 'mamba-s4', url: 'https://arxiv.org/abs/2312.00752' });

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleAnalyze = async (payload: {
    url?: string;
    title?: string;
    rawText?: string;
    presetId?: string;
    refresh?: boolean;
  }) => {
    lastPayloadRef.current = payload;
    const cacheKey = getPayloadKey(payload);

    if (payload.presetId) {
      setSelectedPresetId(payload.presetId);
    } else {
      setSelectedPresetId('');
    }

    // 1. Session Cache Check: Immediate 0ms restoration for previously loaded papers
    if (!payload.refresh && cacheKey && sessionCacheRef.current.has(cacheKey)) {
      const cached = sessionCacheRef.current.get(cacheKey)!;
      // Abort any pending background fetch
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      setAnalysisData(cached);
      setError(null);
      setIsLoading(false);
      return;
    }

    // 2. Abort any previous in-flight request to prevent race conditions & stale response overwrites
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const currentReqId = ++activeRequestIdRef.current;

    setIsLoading(true);
    setError(null);
    setLoadingStage('fetching');
    setElapsedSeconds(0);

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    const startTime = Date.now();
    timerIntervalRef.current = setInterval(() => {
      const sec = Math.floor((Date.now() - startTime) / 1000);
      setElapsedSeconds(sec);
      if (sec < 2) {
        setLoadingStage('fetching');
      } else if (sec < 5) {
        setLoadingStage('analyzing');
      } else {
        setLoadingStage('preparing');
      }
    }, 500);

    try {
      const res = await fetch('/api/analyze-paper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          ...payload,
          budgetMode,
        }),
      });

      // Verify response status and content-type before parsing
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const textBody = await res.text().catch(() => '');
        const isHtml = textBody.includes('<html') || textBody.includes('<!doctype') || textBody.includes('<body');
        if (isHtml) {
          throw new Error(
            `Server returned an HTML page (HTTP ${res.status} ${res.statusText || 'Error'}) instead of JSON. The backend server or reverse proxy encountered an unexpected route or timeout.`
          );
        }
        throw new Error(
          `Server returned non-JSON response (HTTP ${res.status}): ${textBody.slice(0, 140)}`
        );
      }

      const data: AnalysisResponse = await res.json();
      if (!res.ok) {
        throw new Error((data as any).error || `Analysis failed with status ${res.status}`);
      }

      // Stale response guard: ensure a delayed response doesn't overwrite a newer user search
      if (currentReqId !== activeRequestIdRef.current) {
        return;
      }

      // Store in client session cache for instant future retrieval
      if (cacheKey) {
        sessionCacheRef.current.set(cacheKey, data);
      }
      if (data.arxivMetadata?.arxivId) {
        sessionCacheRef.current.set(`arxiv:${data.arxivMetadata.arxivId}`, data);
      }
      if (payload.presetId) {
        sessionCacheRef.current.set(`preset:${payload.presetId}`, data);
      }

      setAnalysisData(data);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // User cancelled or superseded by newer search
        return;
      }
      if (currentReqId === activeRequestIdRef.current) {
        console.error('Paper analysis failed:', err);
        setError(err?.message || 'Failed to analyze paper. Please check the URL or try another paper.');
      }
    } finally {
      if (currentReqId === activeRequestIdRef.current) {
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
        }
        setIsLoading(false);
      }
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    setIsLoading(false);
    setError(null);
  };

  const handleRetry = () => {
    if (lastPayloadRef.current) {
      handleAnalyze({ ...lastPayloadRef.current, refresh: true });
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

        {/* Loading Indicator with Stage Progression, Timeout & Cancellation */}
        {isLoading && (
          <div className="p-8 bg-slate-900/95 border border-slate-800 rounded-2xl space-y-6 shadow-2xl backdrop-blur-sm animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                    <span>CS Research Agent Processing</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 font-mono border border-blue-800/60">
                      {elapsedSeconds}s
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Adhering strictly to &lt;25,000 token operational constraint
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCancel}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-red-950/40 border border-slate-800 transition"
              >
                <XCircle className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            </div>

            {/* Stage Progress Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {(['fetching', 'analyzing', 'preparing'] as LoadingStage[]).map((stageKey) => {
                const stage = STAGE_CONFIG[stageKey];
                const isActive = loadingStage === stageKey;
                const isPast =
                  (stageKey === 'fetching' && (loadingStage === 'analyzing' || loadingStage === 'preparing')) ||
                  (stageKey === 'analyzing' && loadingStage === 'preparing');

                return (
                  <div
                    key={stageKey}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      isActive
                        ? 'bg-blue-950/40 border-blue-500/60 shadow-lg shadow-blue-950/40'
                        : isPast
                        ? 'bg-slate-950/60 border-emerald-500/30 text-slate-300'
                        : 'bg-slate-950/30 border-slate-800/60 text-slate-500 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      {isPast ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : isActive ? (
                        <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin shrink-0" />
                      ) : (
                        <span className="w-4 h-4 rounded-full bg-slate-800 text-[10px] flex items-center justify-center font-mono shrink-0">
                          {stage.stepNumber}
                        </span>
                      )}
                      <span
                        className={`text-xs font-semibold ${
                          isActive ? 'text-blue-300' : isPast ? 'text-emerald-300' : 'text-slate-400'
                        }`}
                      >
                        {stage.label}
                      </span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-slate-400">
                      {stage.detail}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Timeout or Slow Network Helper */}
            {elapsedSeconds >= 12 && (
              <div className="p-3.5 bg-amber-950/30 border border-amber-800/60 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs animate-in fade-in duration-300">
                <div className="flex items-center gap-2 text-amber-200">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    arXiv query or AI reasoning is taking longer than usual. You can continue waiting, retry, or cancel.
                  </span>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <button
                    type="button"
                    onClick={handleRetry}
                    className="flex items-center gap-1 px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs shadow transition cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Retry</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs border border-slate-700 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Trust & Constraint Footnote */}
            <div className="flex items-center justify-center gap-3 text-[11px] text-slate-500 font-mono pt-1">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Strict token budget (&lt;25,000)
              </span>
              <span>•</span>
              <span>Plain language summary (&lt;300w)</span>
              <span>•</span>
              <span>Mermaid.js flowchart</span>
              <span>•</span>
              <span>3 Student projects</span>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-red-950/40 border border-red-800/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-red-200">Analysis Notice</h4>
                <p className="text-xs text-red-300/80">{error}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <button
                type="button"
                onClick={() => handleAnalyze({ presetId: 'mamba-s4' })}
                className="px-3 py-1.5 rounded-lg bg-blue-900/40 hover:bg-blue-800/60 border border-blue-700/60 text-blue-200 text-xs font-medium transition cursor-pointer"
              >
                Load Mamba Benchmark
              </button>
              {lastPayloadRef.current && (
                <button
                  type="button"
                  onClick={handleRetry}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-900/40 hover:bg-red-800/60 border border-red-700/60 text-red-200 text-xs font-medium transition cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Retry</span>
                </button>
              )}
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
              fromCache={analysisData.fromCache}
              onRefresh={() => {
                if (lastPayloadRef.current) {
                  handleAnalyze({ ...lastPayloadRef.current, refresh: true });
                }
              }}
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
