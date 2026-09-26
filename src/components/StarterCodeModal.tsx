import React, { useState } from 'react';
import { X, Copy, Check, Download, FileCode, Play, BookOpen, Layers } from 'lucide-react';
import { StarterPack } from '../types/research';

interface StarterCodeModalProps {
  pack: StarterPack | null;
  projectTitle: string;
  onClose: () => void;
}

export const StarterCodeModal: React.FC<StarterCodeModalProps> = ({
  pack,
  projectTitle,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'model' | 'benchmark' | 'readme'>('model');
  const [copied, setCopied] = useState(false);

  if (!pack) return null;

  const currentContent = 
    activeTab === 'model' 
      ? pack.modelFile 
      : activeTab === 'benchmark' 
      ? pack.benchmarkFile 
      : pack.readme;

  const currentFilename =
    activeTab === 'model' 
      ? 'model.py' 
      : activeTab === 'benchmark' 
      ? 'benchmark.py' 
      : 'README.md';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([currentContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = currentFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-800/90 border-b border-slate-700">
          <div>
            <span className="text-xs font-mono text-purple-400 font-semibold uppercase tracking-wider">
              Student Project Scaffolding
            </span>
            <h3 className="text-lg font-bold text-slate-100">{projectTitle}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-700 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector & Controls */}
        <div className="flex flex-wrap items-center justify-between px-6 py-3 bg-slate-950 border-b border-slate-800 gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('model')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition ${
                activeTab === 'model'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              model.py (Architecture)
            </button>
            <button
              onClick={() => setActiveTab('benchmark')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition ${
                activeTab === 'benchmark'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800'
              }`}
            >
              <Play className="w-3.5 h-3.5 text-emerald-400" />
              benchmark.py (Profiling)
            </button>
            <button
              onClick={() => setActiveTab('readme')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition ${
                activeTab === 'readme'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              README.md & Resume Guide
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy Code'}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-medium shadow-sm transition"
            >
              <Download className="w-3.5 h-3.5" />
              Download {currentFilename}
            </button>
          </div>
        </div>

        {/* Code Content */}
        <div className="p-6 overflow-y-auto bg-slate-950 font-mono text-xs text-slate-200 leading-relaxed flex-1">
          <pre className="whitespace-pre-wrap">{currentContent}</pre>
        </div>

        {/* Dependencies Footer */}
        {pack.keyDependencies && pack.keyDependencies.length > 0 && (
          <div className="px-6 py-3 bg-slate-900 border-t border-slate-800 text-xs text-slate-400 flex items-center gap-2">
            <span className="font-semibold text-slate-300">Quick pip install:</span>
            <code className="bg-slate-950 text-blue-300 px-2 py-1 rounded border border-slate-800 font-mono text-[11px]">
              pip install {pack.keyDependencies.join(' ')}
            </code>
          </div>
        )}
      </div>
    </div>
  );
};
