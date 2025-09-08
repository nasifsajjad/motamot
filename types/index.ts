// types/index.ts
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
  // We'll add the user details here as a nested object from our Supabase join
  users?: {
    display_name: string;
  };
}

export interface NewPostFormData {
  title: string;
  body: string;
  language: 'en' | 'bn';
  type: 'problem' | 'sharing';
}