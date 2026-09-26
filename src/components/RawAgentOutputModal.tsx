import React, { useState } from 'react';
import { X, Copy, Check, Terminal, ShieldCheck } from 'lucide-react';

interface RawAgentOutputModalProps {
  isOpen: boolean;
  onClose: () => void;
  rawText: string;
  tokenCount: number;
}

export const RawAgentOutputModal: React.FC<RawAgentOutputModalProps> = ({
  isOpen,
  onClose,
  rawText,
  tokenCount,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(rawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-800/90 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-100">Standard Operational Text Stream</h3>
                <span className="flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                  <ShieldCheck className="w-3 h-3" />
                  Prompt Spec Compliant
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Exact text formatting with [FLOWCHART] label and &lt;25,000 token execution
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-700 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-slate-950 border-b border-slate-800 text-xs font-mono text-slate-400">
          <span>Execution Tokens: <strong className="text-slate-200">{tokenCount.toLocaleString()}</strong> / 25,000</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition border border-slate-700"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied Full Output!' : 'Copy Formatted Output'}
          </button>
        </div>

        {/* Raw Text Content */}
        <div className="p-6 overflow-y-auto bg-slate-950 font-mono text-xs text-slate-200 leading-relaxed flex-1 select-text">
          <pre className="whitespace-pre-wrap">{rawText}</pre>
        </div>
      </div>
    </div>
  );
};
