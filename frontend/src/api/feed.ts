import client from "./client";
import type { FeedItem, FeedResponse, SwipeRequest } from "../types";

export const feedApi = {
  getFeed: (cursor?: string | null, limit = 20) =>
    client
      .get<FeedResponse>("/feed", { params: { cursor, limit } })
      .then((r) => r.data),

  swipe: (payload: SwipeRequest) =>
    client.post("/feed/swipe", payload),

  getBookmarks: () =>
    client.get<FeedItem[]>("/feed/bookmarks").then((r) => r.data),
};
