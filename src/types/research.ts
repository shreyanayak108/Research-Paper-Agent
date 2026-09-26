export interface PresetPaper {
  id: string;
  title: string;
  authors: string;
  venue: string;
  arxivId: string;
  url: string;
  category: string;
  tag: string;
}

export interface PaperDetails {
  title: string;
  authors?: string;
  publicationYear?: string;
  primaryDomain?: string;
  githubRepoUrl?: string;
}

export interface CoreConceptExtraction {
  problemStatement: string;
  primaryMethodology: string;
  keyBreakthroughs: string;
  fullSummary: string;
  wordCount?: number;
}

export interface FlowchartData {
  mermaidCode: string;
  nodeCount?: number;
  flowExplanation: string;
  keyLayers?: string[];
}

export interface RoadmapItem {
  week: string;
  milestone: string;
}

export interface StudentOpportunity {
  title: string;
  exactExtension: string;
  targetedPerformanceMetric: string;
  recommendedTechStack: string;
  resumeBulletPoint: string;
  feasibilityWeeks?: number;
  roadmap?: RoadmapItem[];
  difficultyLevel?: string;
  starterCodeSnippet?: string;
}

export interface TokenTelemetry {
  promptTokens: number;
  candidateTokens: number;
  totalTokens: number;
  tokenBudget: number;
  tokenEfficiencyPct: number;
  model: string;
  groundedSearchUsed?: boolean;
}

export interface PaperAnalysis {
  paperDetails: PaperDetails;
  coreConceptExtraction: CoreConceptExtraction;
  flowchart: FlowchartData;
  studentOpportunities: StudentOpportunity[];
}

export interface AnalysisResponse {
  success: boolean;
  analysis: PaperAnalysis;
  telemetry: TokenTelemetry;
  labeledRawOutput: string;
  arxivMetadata?: {
    arxivId: string;
    title: string;
    summary: string;
    published: string;
    authors: string;
    url: string;
  };
}

export interface StarterPack {
  modelFile: string;
  benchmarkFile: string;
  readme: string;
  keyDependencies?: string[];
}
