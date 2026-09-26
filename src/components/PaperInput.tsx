import React, { useState } from 'react';
import { 
  Search, 
  Link as LinkIcon, 
  FileText, 
  Sparkles, 
  ArrowRight, 
  ExternalLink,
  Cpu,
  Layers,
  Zap,
  BookOpen
} from 'lucide-react';
import { PresetPaper } from '../types/research';

interface PaperInputProps {
  onAnalyze: (payload: { url?: string; title?: string; rawText?: string; presetId?: string }) => void;
  isLoading: boolean;
  presets: PresetPaper[];
  selectedPresetId?: string;
}

export const PaperInput: React.FC<PaperInputProps> = ({
  onAnalyze,
  isLoading,
  presets,
  selectedPresetId,
}) => {
  const [activeTab, setActiveTab] = useState<'url' | 'paste'>('url');
  const [urlInput, setUrlInput] = useState('');
  const [textInput, setTextInput] = useState('');
  const [paperTitleInput, setPaperTitleInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'url') {
      if (!urlInput.trim()) return;
      onAnalyze({ url: urlInput.trim() });
    } else {
      if (!textInput.trim()) return;
      onAnalyze({ rawText: textInput.trim(), title: paperTitleInput.trim() || undefined });
    }
  };

  const handleSelectPreset = (preset: PresetPaper) => {
    setUrlInput(preset.url);
    onAnalyze({ presetId: preset.id, url: preset.url, title: preset.title });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      {/* Input Mode Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'url'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            Paper URL / arXiv ID
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('paste')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'paste'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Paste Abstract / Excerpt
          </button>
        </div>

        <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Supports arXiv abs/pdf, OpenReview, GitHub & Title lookup
        </span>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {activeTab === 'url' ? (
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="e.g. https://arxiv.org/abs/2312.00752 or 2106.09685 or Attention Is All You Need"
              disabled={isLoading}
              className="w-full bg-slate-950 text-slate-100 pl-11 pr-32 py-3.5 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500 text-sm font-mono placeholder:text-slate-600 transition"
            />
            <div className="absolute inset-y-0 right-1.5 flex items-center">
              <button
                type="submit"
                disabled={isLoading || !urlInput.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-md transition"
              >
                {isLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <span>Execute Agent</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <input
              type="text"
              value={paperTitleInput}
              onChange={(e) => setPaperTitleInput(e.target.value)}
              placeholder="Paper Title (optional, e.g. FlashAttention-3: Fast and Accurate Attention)"
              className="w-full bg-slate-950 text-slate-100 px-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500 text-xs font-mono placeholder:text-slate-600 transition"
            />
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              rows={5}
              placeholder="Paste paper abstract, introduction, or architectural specification text here..."
              disabled={isLoading}
              className="w-full bg-slate-950 text-slate-100 p-4 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500 text-xs font-sans placeholder:text-slate-600 leading-relaxed transition resize-y"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading || !textInput.trim()}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-md transition"
              >
                {isLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Analyzing Excerpt...</span>
                  </>
                ) : (
                  <>
                    <span>Parse Paper Architecture</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </form>

      {/* Preset Academic Benchmark Papers */}
      <div className="pt-2 border-t border-slate-800/80">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-xs font-semibold text-slate-300">
            Seminal Benchmark Papers (1-Click Analysis):
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {presets.map((preset) => {
            const isSelected = selectedPresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                disabled={isLoading}
                onClick={() => handleSelectPreset(preset)}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between group ${
                  isSelected
                    ? 'bg-blue-950/60 border-blue-500/80 shadow-md shadow-blue-900/30'
                    : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/80'
                }`}
              >
                <div>
                  <div className="text-[10px] font-mono text-blue-400 font-semibold truncate">
                    {preset.arxivId}
                  </div>
                  <div className="text-xs font-bold text-slate-200 line-clamp-1 group-hover:text-blue-300 transition">
                    {preset.id.toUpperCase()}
                  </div>
                </div>
                <div className="mt-1 text-[10px] text-slate-400 truncate">
                  {preset.tag}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
