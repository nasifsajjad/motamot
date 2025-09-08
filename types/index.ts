// types/index.ts
export interface User {
  id: string;
  display_name: string | null;
}

export interface Post {
  id: string;
  slug: string;
  title: string;
  body: string;
  excerpt: string;
  language: 'en' | 'bn';
  author_id: string;
  type: 'problem' | 'sharing';
  created_at: string;
  updated_at: string;
  published: boolean;
  net_votes: number;
  users?: User; // Updated to use the new User type
}

export interface Comment {
  id: string;
  body: string;
  author_id: string;
  created_at: string;
  users: User; // Updated to use the new User type
}

export interface NewPostFormData {
  title: string;
  body: string;
  language: 'en' | 'bn';
  type: 'problem' | 'sharing';
}