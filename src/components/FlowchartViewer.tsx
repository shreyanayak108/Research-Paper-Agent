import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Download, 
  Copy, 
  Check, 
  Code, 
  Eye, 
  AlertCircle,
  Layers,
  Sparkles
} from 'lucide-react';
import { FlowchartData } from '../types/research';

interface FlowchartViewerProps {
  flowchart: FlowchartData;
  paperTitle: string;
}

export const FlowchartViewer: React.FC<FlowchartViewerProps> = ({ flowchart, paperTitle }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedRawTag, setCopiedRawTag] = useState(false);
  const [activeTab, setActiveTab] = useState<'diagram' | 'code' | 'editor'>('diagram');
  const [editableCode, setEditableCode] = useState<string>(flowchart.mermaidCode || '');
  const [renderError, setRenderError] = useState<string | null>(null);
  const [svgHtml, setSvgHtml] = useState<string>('');

  // Initialize mermaid configuration
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      securityLevel: 'loose',
      fontFamily: 'Fira Code, monospace',
      flowchart: {
        curve: 'basis',
        htmlLabels: true,
        useMaxWidth: false,
        nodeSpacing: 50,
        rankSpacing: 60,
      },
      themeVariables: {
        darkMode: true,
        background: '#0f172a',
        primaryColor: '#3b82f6',
        primaryTextColor: '#f8fafc',
        primaryBorderColor: '#60a5fa',
        lineColor: '#64748b',
        secondaryColor: '#1e293b',
        tertiaryColor: '#0f172a',
        edgeLabelBackground: '#1e293b',
      },
    });
  }, []);

  // Update editable code when flowchart prop changes
  useEffect(() => {
    setEditableCode(flowchart.mermaidCode || '');
  }, [flowchart.mermaidCode]);

  // Render mermaid whenever editableCode changes
  useEffect(() => {
    let isMounted = true;
    const renderDiagram = async () => {
      if (!editableCode.trim()) return;

      try {
        setRenderError(null);
        // Clean any accidental markdown code fences
        const clean = editableCode
          .replace(/```mermaid/gi, '')
          .replace(/```/g, '')
          .replace(/\[FLOWCHART\]/gi, '')
          .trim();

        const uniqueId = `mermaid-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const { svg } = await mermaid.render(uniqueId, clean);
        if (isMounted) {
          setSvgHtml(svg);
        }
      } catch (err: any) {
        console.error('Mermaid render error:', err);
        if (isMounted) {
          setRenderError(err?.message || 'Syntax error in Mermaid flowchart definition.');
        }
      }
    };

    renderDiagram();

    return () => {
      isMounted = false;
    };
  }, [editableCode]);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 2.5));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.4));
  const handleResetZoom = () => setZoom(1);

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(editableCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLabeledSegment = async () => {
    const labeled = `[FLOWCHART]\n${editableCode}`;
    await navigator.clipboard.writeText(labeled);
    setCopiedRawTag(true);
    setTimeout(() => setCopiedRawTag(false), 2000);
  };

  const handleDownloadSvg = () => {
    if (!svgHtml) return;
    const blob = new Blob([svgHtml], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(paperTitle || 'system-architecture').replace(/[^a-z0-9]/gi, '_').toLowerCase()}_architecture.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between px-6 py-4 bg-slate-800/80 border-b border-slate-700/60 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-900/60 text-blue-300 border border-blue-700/50">
                STEP 2
              </span>
              <h3 className="font-bold text-slate-100 text-lg">System Architecture Flowchart</h3>
              <span className="text-xs font-mono bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">
                Mermaid.js (graph TD)
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Data inputs, model layers, attention/state mechanics & data outputs
            </p>
          </div>
        </div>

        {/* View mode toggle & action buttons */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('diagram')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'diagram'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Interactive Diagram
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'code'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              Source & Labeled
            </button>
            <button
              onClick={() => setActiveTab('editor')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'editor'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Live Editor
            </button>
          </div>

          {activeTab === 'diagram' && (
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={handleZoomOut}
                title="Zoom Out"
                className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono text-slate-400 px-1 min-w-[3rem] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                title="Zoom In"
                className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={handleResetZoom}
                title="Reset Zoom"
                className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          )}

          <button
            onClick={handleDownloadSvg}
            disabled={!svgHtml}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 rounded-xl text-xs font-medium border border-slate-700 transition"
            title="Download SVG vector file"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            Export SVG
          </button>
        </div>
      </div>

      {/* Main Canvas / View Area */}
      <div className="p-6">
        {activeTab === 'diagram' && (
          <div className="relative min-h-[460px] bg-slate-950 rounded-xl border border-slate-800/80 p-6 flex flex-col items-center justify-center overflow-hidden">
            {renderError ? (
              <div className="max-w-md p-4 bg-red-950/40 border border-red-800/60 rounded-xl text-center">
                <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                <h4 className="font-semibold text-red-200 text-sm">Mermaid Syntax Rendering Issue</h4>
                <p className="text-xs text-red-300/80 mt-1 font-mono">{renderError}</p>
                <button
                  onClick={() => setActiveTab('editor')}
                  className="mt-3 px-3 py-1.5 bg-red-900/60 hover:bg-red-800/80 text-red-200 text-xs rounded-lg transition"
                >
                  Edit in Live Editor
                </button>
              </div>
            ) : svgHtml ? (
              <div 
                ref={containerRef}
                className="w-full flex justify-center items-center overflow-auto max-h-[600px] py-4"
              >
                <div 
                  style={{ transform: `scale(${zoom})`, transformOrigin: 'top center', transition: 'transform 0.15s ease' }}
                  className="mermaid-container select-none"
                  dangerouslySetInnerHTML={{ __html: svgHtml }}
                />
              </div>
            ) : (
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                Rendering architectural components...
              </div>
            )}

            {/* Architecture Explanation footer badge */}
            {flowchart.flowExplanation && (
              <div className="w-full mt-4 p-3 bg-slate-900/80 border border-slate-800 rounded-lg text-xs text-slate-300 flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                <div>
                  <span className="font-semibold text-slate-200">Dataflow Topology: </span>
                  {flowchart.flowExplanation}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'code' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Specification Compliance: Labeled as <code className="text-blue-400 font-mono">[FLOWCHART]</code> with clean syntax.
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyLabeledSegment}
                  className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-mono border border-slate-700 transition"
                >
                  {copiedRawTag ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedRawTag ? 'Copied [FLOWCHART]!' : 'Copy with [FLOWCHART] label'}
                </button>
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedCode ? 'Copied Source!' : 'Copy Mermaid Code'}
                </button>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-blue-300 overflow-x-auto max-h-[400px]">
              <div className="text-slate-500 mb-2 pb-2 border-b border-slate-800 select-none">
                # Output segment label as mandated by operational constraints:
              </div>
              <div className="text-amber-400 font-bold mb-2">[FLOWCHART]</div>
              <pre className="text-slate-200 whitespace-pre-wrap leading-relaxed">{editableCode}</pre>
            </div>
          </div>
        )}

        {activeTab === 'editor' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Directly tweak nodes, edge labels, or add custom subgraphs:</span>
              <button
                onClick={() => setEditableCode(flowchart.mermaidCode || '')}
                className="text-xs text-blue-400 hover:underline"
              >
                Reset to Original Model Output
              </button>
            </div>
            <textarea
              value={editableCode}
              onChange={(e) => setEditableCode(e.target.value)}
              rows={14}
              className="w-full bg-slate-950 text-slate-100 font-mono text-xs p-4 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500 transition leading-relaxed resize-y"
              spellCheck={false}
            />
          </div>
        )}

        {/* Key Layer Tags */}
        {flowchart.keyLayers && flowchart.keyLayers.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2 pt-4 border-t border-slate-800/80">
            <span className="text-xs text-slate-400 font-medium">Mapped Subsystems:</span>
            {flowchart.keyLayers.map((layer, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 bg-slate-800/90 text-slate-300 text-xs rounded-md border border-slate-700/60 font-mono"
              >
                {layer}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
