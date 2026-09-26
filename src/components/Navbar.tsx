import React from 'react';
import { Terminal, Cpu, BookOpen, Sparkles, FileText, Code } from 'lucide-react';

interface NavbarProps {
  onOpenRawOutput: () => void;
  hasAnalysis: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenRawOutput, hasAnalysis }) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-100 tracking-tight">
                PaperAgent
              </h1>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-blue-950 text-blue-400 border border-blue-800/80">
                CS RESEARCH AGENT
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              System Architecture Extractor & Student Opportunities Engine
            </p>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/50 px-2.5 py-1 rounded-lg border border-emerald-900/60">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Operational Limit: &lt;25k Tokens</span>
          </div>

          {hasAnalysis && (
            <button
              onClick={onOpenRawOutput}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-mono border border-slate-800 transition"
              title="Inspect raw agent output with [FLOWCHART] label"
            >
              <Terminal className="w-3.5 h-3.5 text-blue-400" />
              <span>[FLOWCHART] Prompt Stream</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
