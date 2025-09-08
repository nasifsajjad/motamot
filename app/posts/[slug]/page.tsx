// app/posts/[slug]/page.tsx
import { supabase } from '@/lib/supabaseClient';
import { notFound } from 'next/navigation';
import { Post } from '@/types'; // Make sure your Post type is updated
import PostContent from '@/components/PostContent'; // We'll create this next

interface PostPageProps {
  params: {
    slug: string;
  };
}

// Function to fetch the post and its comments from the database
async function getPostData(slug: string) {
  // Fetch the post and its author's display name
  const { data: post, error: postError } = await supabase
    .from('posts')
    .select('*, users(display_name)') // Select all post fields and the user's display name
    .eq('slug', slug)
    .single();

  if (postError) {
    console.error('Error fetching post:', postError);
    return null;
  }

  // Fetch comments for the post
  const { data: comments, error: commentsError } = await supabase
    .from('comments')
    .select('*, users(display_name)')
    .eq('post_id', post.id)
    .order('created_at', { ascending: true });

  if (commentsError) {
    console.error('Error fetching comments:', commentsError);
    // Continue even if comments fail, as the main post can still be shown
  }
  
  return { post: post as Post, comments };
}

// This is the main server component for the post page
export default async function PostPage({ params }: PostPageProps) {
  const { slug } = params;
  const data = await getPostData(slug);

  // If no post is found with the given slug, show a 404 page
  if (!data || !data.post) {
    notFound();
  }

  const { post, comments } = data;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* We pass the post data to a client component for interactive elements */}
      <PostContent post={post} initialComments={comments} />
    </div>
  );
}

// app/posts/[slug]/page.tsx
// ... (imports from above)
import type { Metadata } from 'next';

// This function will be called by Next.js to generate dynamic metadata
export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = params;
  const { data: post, error } = await supabase
    .from('posts')
    .select('title, excerpt, created_at, language')
    .eq('slug', slug)
    .single();

  if (error || !post) {
    return {};
  }

  const title = `${post.title} | Motamot`;
  const description = post.excerpt;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      // You can add an image URL here if you have one
      // images: ['https://motamot.com/og-image.jpg'], 
    },
    // Add other SEO tags as needed, like `twitter`
  };
}

// ... (rest of the PostPage component from above)