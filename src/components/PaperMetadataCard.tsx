import React from 'react';
import { ExternalLink, BookOpen, User, Calendar, Tag, Github } from 'lucide-react';
import { PaperDetails } from '../types/research';

interface PaperMetadataCardProps {
  paperDetails: PaperDetails;
  arxivMetadata?: {
    arxivId: string;
    title: string;
    summary: string;
    published: string;
    authors: string;
    url: string;
  };
}

export const PaperMetadataCard: React.FC<PaperMetadataCardProps> = ({
  paperDetails,
  arxivMetadata,
}) => {
  const displayTitle = paperDetails.title || arxivMetadata?.title || 'Academic Research Paper';
  const displayAuthors = paperDetails.authors || arxivMetadata?.authors || 'Academic Research Team';
  const displayYear = paperDetails.publicationYear || arxivMetadata?.published || 'Recent';

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div className="space-y-1.5 max-w-3xl">
        <div className="flex flex-wrap items-center gap-2">
          {arxivMetadata?.arxivId && (
            <span className="px-2 py-0.5 bg-rose-950/70 text-rose-300 font-mono text-[11px] rounded border border-rose-800/60">
              arXiv:{arxivMetadata.arxivId}
            </span>
          )}
          {paperDetails.primaryDomain && (
            <span className="px-2 py-0.5 bg-blue-950/70 text-blue-300 font-mono text-[11px] rounded border border-blue-800/60">
              {paperDetails.primaryDomain}
            </span>
          )}
          <span className="flex items-center gap-1 text-slate-400 text-xs">
            <Calendar className="w-3 h-3 text-slate-500" />
            {displayYear}
          </span>
        </div>

        <h2 className="text-xl font-bold text-slate-100 leading-snug">
          {displayTitle}
        </h2>

        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="line-clamp-1">{displayAuthors}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {arxivMetadata?.url && (
          <a
            href={arxivMetadata.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium border border-slate-700 transition"
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-400" />
            <span>View on arXiv</span>
            <ExternalLink className="w-3 h-3 text-slate-500" />
          </a>
        )}
        {paperDetails.githubRepoUrl && (
          <a
            href={paperDetails.githubRepoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium border border-slate-700 transition"
          >
            <Github className="w-3.5 h-3.5 text-purple-400" />
            <span>GitHub Repo</span>
            <ExternalLink className="w-3 h-3 text-slate-500" />
          </a>
        )}
      </div>
    </div>
  );
};
