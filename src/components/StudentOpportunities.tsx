import React, { useState } from 'react';
import { 
  Briefcase, 
  ArrowUpRight, 
  Terminal, 
  Copy, 
  Check, 
  Calendar, 
  Gauge, 
  Code2, 
  Sparkles, 
  CheckCircle,
  FileCode,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { StudentOpportunity, StarterPack } from '../types/research';

interface StudentOpportunitiesProps {
  opportunities: StudentOpportunity[];
  paperTitle: string;
  onOpenStarterPack: (pack: StarterPack, title: string) => void;
}

export const StudentOpportunities: React.FC<StudentOpportunitiesProps> = ({
  opportunities,
  paperTitle,
  onOpenStarterPack,
}) => {
  const [copiedBulletIdx, setCopiedBulletIdx] = useState<number | null>(null);
  const [loadingCodeIdx, setLoadingCodeIdx] = useState<number | null>(null);
  const [expandedRoadmapIdx, setExpandedRoadmapIdx] = useState<number | null>(0);

  const handleCopyBullet = async (bullet: string, idx: number) => {
    await navigator.clipboard.writeText(bullet);
    setCopiedBulletIdx(idx);
    setTimeout(() => setCopiedBulletIdx(null), 2000);
  };

  const handleGenerateStarterPack = async (opp: StudentOpportunity, idx: number) => {
    try {
      setLoadingCodeIdx(idx);
      const res = await fetch('/api/generate-starter-pack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectTitle: opp.title,
          exactExtension: opp.exactExtension,
          recommendedTechStack: opp.recommendedTechStack,
          paperTitle,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to generate starter boilerplate');
      }

      const data = await res.json();
      if (data.starterPack) {
        onOpenStarterPack(data.starterPack, opp.title);
      }
    } catch (err: any) {
      alert(err.message || 'Error generating starter code');
    } finally {
      setLoadingCodeIdx(null);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between px-6 py-4 bg-slate-800/80 border-b border-slate-700/60 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg border border-purple-500/20">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-900/60 text-purple-300 border border-purple-700/50">
                STEP 3
              </span>
              <h3 className="font-bold text-slate-100 text-lg">
                Future Work & Internship Portfolio Projects
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              3 high-impact, realistic extensions calibrated for 3rd-year CS student portfolios & interviews
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-purple-300 bg-purple-950/50 px-3 py-1.5 rounded-xl border border-purple-800/50">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>Resume & Interview Ready</span>
        </div>
      </div>

      {/* 3 Project Opportunities Cards */}
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {opportunities.map((opp, idx) => {
            const isRoadmapOpen = expandedRoadmapIdx === idx;
            const isLoadingCode = loadingCodeIdx === idx;

            return (
              <div
                key={idx}
                className="bg-slate-950/80 rounded-xl border border-slate-800 hover:border-purple-500/40 transition-all flex flex-col justify-between p-5 relative overflow-hidden group"
              >
                {/* Accent top gradient line */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500" />

                <div className="space-y-4">
                  {/* Badge & Title */}
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                      <span className="font-mono text-purple-400 font-semibold">
                        PROJECT #{idx + 1}
                      </span>
                      {opp.difficultyLevel && (
                        <span className="px-2 py-0.5 bg-slate-800/90 text-slate-300 rounded text-[10px] font-medium border border-slate-700">
                          {opp.difficultyLevel}
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-slate-100 text-base leading-snug group-hover:text-purple-300 transition">
                      {opp.title}
                    </h4>
                  </div>

                  {/* 1. EXACT EXTENSION */}
                  <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 space-y-1">
                    <span className="text-[11px] font-semibold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      Exact Extension
                    </span>
                    <p className="text-xs text-slate-200 leading-relaxed font-sans">
                      {opp.exactExtension}
                    </p>
                  </div>

                  {/* 2. TARGETED PERFORMANCE METRIC */}
                  <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 space-y-1">
                    <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Gauge className="w-3.5 h-3.5" />
                      Targeted Performance Metric
                    </span>
                    <p className="text-xs text-slate-200 leading-relaxed font-sans">
                      {opp.targetedPerformanceMetric}
                    </p>
                  </div>

                  {/* 3. RECOMMENDED TECH STACK */}
                  <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 space-y-1">
                    <span className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5" />
                      Recommended Tech Stack
                    </span>
                    <div className="text-xs font-mono text-blue-200 bg-slate-950 p-2 rounded border border-slate-800 break-words">
                      {opp.recommendedTechStack}
                    </div>
                  </div>

                  {/* RESUME BULLET POINT BOX */}
                  <div className="p-3 bg-purple-950/20 rounded-lg border border-purple-800/40 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider">
                        Resume Action Bullet
                      </span>
                      <button
                        onClick={() => handleCopyBullet(opp.resumeBulletPoint, idx)}
                        className="flex items-center gap-1 text-[11px] text-purple-300 hover:text-white transition"
                        title="Copy bullet point to clipboard"
                      >
                        {copiedBulletIdx === idx ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-slate-300 italic leading-relaxed">
                      "{opp.resumeBulletPoint}"
                    </p>
                  </div>

                  {/* SPRINT ROADMAP ACCORDION */}
                  {opp.roadmap && opp.roadmap.length > 0 && (
                    <div>
                      <button
                        onClick={() => setExpandedRoadmapIdx(isRoadmapOpen ? null : idx)}
                        className="w-full flex items-center justify-between text-xs text-slate-400 hover:text-slate-200 py-1 transition"
                      >
                        <span className="flex items-center gap-1.5 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-blue-400" />
                          4-Week Student Sprint Roadmap
                        </span>
                        {isRoadmapOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      {isRoadmapOpen && (
                        <div className="mt-2 space-y-1.5 pl-2 border-l-2 border-slate-800 text-xs">
                          {opp.roadmap.map((step, sIdx) => (
                            <div key={sIdx} className="text-slate-300 flex items-start gap-2">
                              <span className="text-blue-400 font-mono text-[11px] shrink-0 font-medium">
                                {step.week}:
                              </span>
                              <span>{step.milestone}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Action Button: Generate Starter Pack */}
                <div className="mt-5 pt-4 border-t border-slate-800/80">
                  <button
                    onClick={() => handleGenerateStarterPack(opp, idx)}
                    disabled={isLoadingCode}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-md hover:shadow-purple-500/20 transition"
                  >
                    {isLoadingCode ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Generating Repo Scaffold...</span>
                      </>
                    ) : (
                      <>
                        <FileCode className="w-4 h-4" />
                        <span>Inspect PyTorch Boilerplate</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
