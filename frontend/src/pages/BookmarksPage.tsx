import { useQuery } from "@tanstack/react-query";
import { feedApi } from "../api/feed";
import type { FeedItem } from "../types";

function BookmarkCard({ item }: { item: FeedItem }) {
  const { paper, card } = item;
  return (
    <a
      href={paper.arxiv_url}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-5 transition-colors"
    >
      <p className="font-semibold text-white leading-snug">{card.hook}</p>
      <p className="text-gray-400 text-sm mt-2 line-clamp-2">{card.eli5}</p>
      <div className="flex flex-wrap gap-2 mt-3">
        {card.tags.slice(0, 3).map((t) => (
          <span key={t} className="text-xs bg-white/10 text-gray-300 px-2 py-0.5 rounded-full">#{t}</span>
        ))}
      </div>
      <p className="text-xs text-gray-600 mt-3">arXiv:{paper.arxiv_id}</p>
    </a>
  );
}

export function BookmarksPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["bookmarks"],
    queryFn: feedApi.getBookmarks,
  });
  const items = Array.isArray(data) ? data : [];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">Saved Papers</h1>
      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {isError && (
        <p className="text-red-400 text-center py-12">Failed to load saved papers. Please refresh.</p>
      )}
      {!isLoading && !isError && items.length === 0 && (
        <p className="text-gray-500 text-center py-12">No saved papers yet. Tap the bookmark button to save!</p>
      )}
      {items.length > 0 && (
        <div className="flex flex-col gap-4">
          {items.map((item) => (
            <BookmarkCard key={item.paper.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
