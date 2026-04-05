import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { feedApi } from "../api/feed";
import type { FeedItem, SwipeDirection } from "../types";

export function useFeed() {
  const query = useInfiniteQuery({
    queryKey: ["feed"],
    queryFn: ({ pageParam }) => feedApi.getFeed(pageParam as string | null),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const cards: FeedItem[] = query.data?.pages.flatMap((p) => p.items) ?? [];

  return {
    cards,
    isLoading: query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    error: query.error,
  };
}

export function useSwipeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ paper_id, direction }: { paper_id: string; direction: SwipeDirection }) =>
      feedApi.swipe({ paper_id, direction }),
    onSuccess: () => {
      // Invalidate feed so swiped cards don't reappear on refresh
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });
}
