export type Language = "en" | "bn";
export type PostType = "problem" | "sharing";
export type VoteValue = 1 | -1;
export type TargetType = "post" | "comment";

export interface User {
  id: string;
  displayName: string;
  email: string;
  provider: string;
  avatarUrl?: string;
  isAdmin?: boolean;
  createdAt: string;
}

export interface Translation {
  id: string;
  postId?: string;
  commentId?: string;
  language: Language;
  text: string;
  translatorUserId: string | null;
  createdAt: string;
}

export interface Post {
  id: string;
  slug: string;
  title: string;
  body: string;
  excerpt: string;
  language: Language;
  authorId: string;
  author?: User;
  type: PostType;
  createdAt: string;
  updatedAt: string;
  published: boolean;
  netVotes: number;
  upvotesCount: number;
  downvotesCount: number;
  translations?: Translation[];
  commentsCount?: number;
  userVote?: VoteValue | null;
}

export interface Comment {
  id: string;
  postId: string;
  parentCommentId: string | null;
  authorId: string;
  author?: User;
  body: string;
  language: Language;
  createdAt: string;
  replies?: Comment[];
  translations?: Translation[];
  netVotes?: number;
  userVote?: VoteValue | null;
}

export interface Vote {
  id: string;
  postId?: string;
  commentId?: string;
  userId: string;
  vote: VoteValue;
  createdAt: string;
}

export interface Report {
  id: string;
  targetType: TargetType;
  targetId: string;
  reporterUserId: string;
  reason: string;
  createdAt: string;
  resolved?: boolean;
}

export interface PaginatedPosts {
  posts: Post[];
  hasMore: boolean;
  total: number;
}

export type PostMode = "all" | "hot" | "featured";
