import React, { useState } from 'react';
import { 
  FileText, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  CheckCircle2, 
  Zap, 
  Target, 
  Cpu, 
  BookOpen
} from 'lucide-react';
import { CoreConceptExtraction, PaperDetails } from '../types/research';

interface CoreConceptViewProps {
  concept: CoreConceptExtraction;
  paperDetails: PaperDetails;
}

export const CoreConceptView: React.FC<CoreConceptViewProps> = ({ concept, paperDetails }) => {
  const [copied, setCopied] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Compute word count
  const wordCount = concept.wordCount || concept.fullSummary.split(/\s+/).filter(Boolean).length;
  const isWithinBudget = wordCount <= 300;

  const handleCopy = async () => {
    const textToCopy = `Problem Statement: ${concept.problemStatement}\n\nPrimary Methodology: ${concept.primaryMethodology}\n\nKey Breakthroughs: ${concept.keyBreakthroughs}\n\nPlain-Language Summary: ${concept.fullSummary}`;
    await navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported on this browser.');
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    } else {
      const speechText = `${paperDetails.title}. Problem: ${concept.problemStatement}. Methodology: ${concept.primaryMethodology}. Breakthrough: ${concept.keyBreakthroughs}. Summary: ${concept.fullSummary}`;
      const utterance = new SpeechSynthesisUtterance(speechText);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
      setIsPlayingAudio(true);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between px-6 py-4 bg-slate-800/80 border-b border-slate-700/60 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-900/60 text-emerald-300 border border-emerald-700/50">
                STEP 1
              </span>
              <h3 className="font-bold text-slate-100 text-lg">Core Concept Extraction</h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Distilled problem statement, methodology & algorithmic breakthroughs in plain language
            </p>
          </div>
        </div>

        {/* Word count badge & tools */}
        <div className="flex items-center gap-2.5">
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono border ${
              isWithinBudget
                ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60'
                : 'bg-amber-950/60 text-amber-400 border-amber-800/60'
            }`}
            title="Operational Constraint: Strictly under 300 words"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{wordCount} / 300 words</span>
          </div>

          <button
            onClick={toggleSpeech}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
              isPlayingAudio
                ? 'bg-emerald-600 text-white border-emerald-500'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
            title="Read summary aloud"
          >
            {isPlayingAudio ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            {isPlayingAudio ? 'Stop Audio' : 'Listen'}
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium border border-slate-700 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Structured 3-Pillar Breakdown */}
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Problem Statement Card */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80 hover:border-slate-700 transition space-y-2">
            <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs uppercase tracking-wider">
              <Target className="w-4 h-4" />
              Problem Statement
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">
              {concept.problemStatement}
            </p>
          </div>

          {/* Primary Methodology Card */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80 hover:border-slate-700 transition space-y-2">
            <div className="flex items-center gap-2 text-blue-400 font-semibold text-xs uppercase tracking-wider">
              <Cpu className="w-4 h-4" />
              Primary Methodology
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">
              {concept.primaryMethodology}
            </p>
          </div>

          {/* Key Breakthroughs Card */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80 hover:border-slate-700 transition space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs uppercase tracking-wider">
              <Zap className="w-4 h-4" />
              Algorithmic Breakthrough
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">
              {concept.keyBreakthroughs}
            </p>
          </div>
        </div>

        {/* Unified Plain-Language Summary Box */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-950 to-slate-900/90 p-5 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              Unified Plain-Language Synthesis (Under 300 Words)
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              Designed for rapid student & engineering onboarding
            </span>
          </div>
          <p className="text-slate-200 text-sm leading-relaxed font-sans font-normal selection:bg-emerald-500/30">
            {concept.fullSummary}
          </p>
        </div>
      </div>
    </div>
  );
};
