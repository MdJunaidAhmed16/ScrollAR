export interface User {
  id: string;
  email: string;
  username: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
}

export interface Paper {
  id: string;
  arxiv_id: string;
  title: string;
  authors: string[];
  categories: string[];
  published_at: string;
  pdf_url: string;
  arxiv_url: string;
}

export interface Card {
  id: string;
  paper_id: string;
  hook: string;
  eli5: string;
  key_finding: string;
  why_it_matters: string;
  tags: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  key_contributions: string[];
  generated_at: string;
}

export interface FeedItem {
  paper: Paper;
  card: Card;
  is_bookmarked: boolean;
  like_count: number;
}

export interface FeedResponse {
  items: FeedItem[];
  next_cursor: string | null;
  total_returned: number;
}

export type SwipeDirection = "left" | "right" | "up";

export interface SwipeRequest {
  paper_id: string;
  direction: SwipeDirection;
}
