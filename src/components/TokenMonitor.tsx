import React from 'react';
import { Activity, ShieldCheck, Zap, Database, Search } from 'lucide-react';
import { TokenTelemetry } from '../types/research';

interface TokenMonitorProps {
  telemetry: TokenTelemetry | null;
  budgetMode: 'strict' | 'balanced';
  onToggleBudgetMode: (mode: 'strict' | 'balanced') => void;
}

export const TokenMonitor: React.FC<TokenMonitorProps> = ({
  telemetry,
  budgetMode,
  onToggleBudgetMode,
}) => {
  const currentTokens = telemetry?.totalTokens || 0;
  const budget = telemetry?.tokenBudget || 25000;
  const usagePercentage = Math.min(100, Math.round((currentTokens / budget) * 100));
  const isBudgetSafe = currentTokens < budget;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-4 text-xs">
      {/* Left: Constraint status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-emerald-400 font-semibold font-mono">
          <ShieldCheck className="w-4 h-4" />
          <span>CONSTRAINT: &lt;25k TOKENS</span>
        </div>
        <div className="h-4 w-px bg-slate-800 hidden sm:block" />
        <div className="flex items-center gap-1.5 text-slate-300">
          <Activity className="w-3.5 h-3.5 text-blue-400" />
          <span>Usage:</span>
          <span className="font-mono font-semibold text-slate-100">
            {currentTokens.toLocaleString()}
          </span>
          <span className="text-slate-500">/ {budget.toLocaleString()} max</span>
        </div>
      </div>

      {/* Middle: Progress Bar */}
      <div className="flex-1 max-w-xs min-w-[140px] flex items-center gap-2">
        <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              usagePercentage > 85 ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.max(4, usagePercentage)}%` }}
          />
        </div>
        <span className="font-mono text-[11px] text-slate-400 w-9 text-right">
          {usagePercentage}%
        </span>
      </div>

      {/* Right: Strategy & Token Budget Mode Switcher */}
      <div className="flex items-center gap-2.5">
        {telemetry?.groundedSearchUsed && (
          <div className="flex items-center gap-1 text-[11px] text-blue-300 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/60 font-mono">
            <Search className="w-3 h-3 text-blue-400" />
            <span>Search Grounded</span>
          </div>
        )}

        <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800">
          <button
            onClick={() => onToggleBudgetMode('balanced')}
            className={`px-2 py-1 rounded text-[11px] font-medium transition ${
              budgetMode === 'balanced'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Balanced analysis with comprehensive architectural nodes (<25k tokens)"
          >
            Balanced (&lt;25k)
          </button>
          <button
            onClick={() => onToggleBudgetMode('strict')}
            className={`px-2 py-1 rounded text-[11px] font-medium transition ${
              budgetMode === 'strict'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Ultra-compact micro-analysis (<10k tokens)"
          >
            Micro (&lt;10k)
          </button>
        </div>
      </div>
    </div>
  );
};
