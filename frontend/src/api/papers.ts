import client from "./client";
import type { FeedItem } from "../types";

export const papersApi = {
  getByArxivId: (arxivId: string) =>
    client.get<FeedItem>(`/papers/${arxivId}`).then((r) => r.data),

  toggleBookmark: (arxivId: string) =>
    client
      .post<{ bookmarked: boolean; paper_id: string }>(`/papers/${arxivId}/bookmark`)
      .then((r) => r.data),

  getPdfUrl: (arxivId: string) => `/api/papers/${arxivId}/pdf`,
};
