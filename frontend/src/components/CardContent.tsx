import { useState } from "react";
import type { FeedItem } from "../types";

const DIFFICULTY_COLORS = {
  beginner: "bg-green-500/20 text-green-300 border-green-500/30",
  intermediate: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  advanced: "bg-red-500/20 text-red-300 border-red-500/30",
};

interface Props {
  item: FeedItem;
}

export function CardContent({ item }: Props) {
  const [expanded, setExpanded] = useState(false);
  const { paper, card } = item;

  const authorDisplay =
    paper.authors.length > 2
      ? `${paper.authors[0]} et al.`
      : paper.authors.join(", ");

  return (
    <div
      className="flex flex-col h-full p-6 pb-20 gap-4 overflow-y-auto"
      onPointerDown={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <span
          className={`text-xs font-semibold px-2 py-1 rounded-full border ${
            DIFFICULTY_COLORS[card.difficulty]
          }`}
        >
          {card.difficulty}
        </span>
        <span className="text-xs text-gray-400 text-right shrink-0">
          {new Date(paper.published_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>

      {/* Hook — the headline */}
      <h2 className="text-xl font-bold text-white leading-snug">{card.hook}</h2>

      {/* Authors */}
      <p className="text-sm text-gray-400 -mt-2">{authorDisplay}</p>

      {/* ELI5 */}
      <p className="text-gray-200 text-sm leading-relaxed flex-1">{card.eli5}</p>

      {/* Expanded details */}
      {expanded && (
        <div className="flex flex-col gap-3 text-sm">
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wide">Key Finding</p>
            <p className="text-gray-200">{card.key_finding}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wide">Why It Matters</p>
            <p className="text-gray-200">{card.why_it_matters}</p>
          </div>
          {card.key_contributions.length > 0 && (
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">Contributions</p>
              <ul className="space-y-1">
                {card.key_contributions.map((c, i) => (
                  <li key={i} className="text-gray-200 flex gap-2">
                    <span className="text-brand-500 mt-0.5">→</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        {card.tags.slice(0, 4).map((tag) => (
          <span
            key={tag}
            className="text-xs bg-white/10 text-gray-300 px-2 py-1 rounded-full"
          >
            #{tag}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/10">
        <button
          className="text-xs text-brand-500 hover:text-brand-400 font-medium transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            setExpanded((v) => !v);
          }}
        >
          {expanded ? "Show less" : "Show more"}
        </button>
        <a
          href={paper.arxiv_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          Read full paper →
        </a>
      </div>
    </div>
  );
}
