import { AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useFeed, useSwipeMutation } from "../hooks/useFeed";
import { SwipeCard } from "./SwipeCard";
import type { SwipeDirection } from "../types";

const PREFETCH_THRESHOLD = 5; // fetch more when fewer than this many cards remain

export function CardStack({ onButtonsReady }: { onButtonsReady?: (trigger: (d: SwipeDirection) => void) => void }) {
  const { cards, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage, error } = useFeed();
  const swipeMutation = useSwipeMutation();
  const shownIds = useRef(new Set<string>());
  const [forcedSwipe, setForcedSwipe] = useState<SwipeDirection | null>(null);

  // Track which items are displayed (filter out already-swiped locally)
  const visibleCards = cards.filter((c) => !shownIds.current.has(c.paper.id));

  useEffect(() => {
    if (visibleCards.length < PREFETCH_THRESHOLD && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [visibleCards.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

  function handleSwipe(direction: SwipeDirection, paperId: string) {
    shownIds.current.add(paperId);
    swipeMutation.mutate({ paper_id: paperId, direction });
    setForcedSwipe(null);
  }

  function triggerSwipe(direction: SwipeDirection) {
    setForcedSwipe(direction);
  }

  // Expose trigger to parent (FeedPage) via callback
  useEffect(() => {
    onButtonsReady?.(triggerSwipe);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">Loading papers…</p>
        </div>
      </div>
    );
  }

  if (error || (visibleCards.length === 0 && !isFetchingNextPage)) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-gray-400 px-8">
          {error ? (
            <>
              <p className="text-4xl mb-4">⚡</p>
              <p className="text-lg font-semibold text-white">Server is waking up</p>
              <p className="text-sm mt-2">This takes about 30 seconds on first load.<br />Hang tight and refresh in a moment.</p>
            </>
          ) : (
            <>
              <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-lg font-semibold text-white">Loading your feed…</p>
              <p className="text-sm mt-2">Hang on, this should only take a few seconds.</p>
            </>
          )}
          <button
            onClick={() => window.location.reload()}
            className="mt-6 text-sm text-brand-500 hover:text-brand-400 underline"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  // Show top 3 cards stacked
  const stackSlice = visibleCards.slice(0, 3);

  return (
    <div className="relative w-full h-full">
      <AnimatePresence>
        {stackSlice
          .slice()
          .reverse()
          .map((item, reversedIndex) => {
            const stackIndex = stackSlice.length - 1 - reversedIndex;
            return (
              <SwipeCard
                key={item.paper.id}
                item={item}
                onSwipe={handleSwipe}
                isTop={stackIndex === 0}
                stackIndex={stackIndex}
                forcedSwipe={stackIndex === 0 ? forcedSwipe : null}
              />
            );
          })}
      </AnimatePresence>
    </div>
  );
}
