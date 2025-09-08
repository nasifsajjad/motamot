// app/page.tsx
import { supabase } from '@/lib/supabaseClient';
import PostCard from '@/components/PostCard'; // We'll create this component next
import { Post } from '@/types'; // You'll create this type file

async function getFeaturedPosts() {
  const { data, error } = await supabase
    .from('posts')
    .select('id, slug, title, excerpt, language, created_at, net_votes, users(display_name)')
    .order('net_votes', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error fetching featured posts:', error);
    return [];
  }
  return data as Post[];
}

async function getHotPosts() {
  // Logic to fetch posts from the last 24 hours with the highest net_votes
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from('posts')
    .select('id, slug, title, excerpt, language, created_at, net_votes, users(display_name)')
    .gte('created_at', twentyFourHoursAgo)
    .order('net_votes', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error fetching hot posts:', error);
    return [];
  }
  return data as Post[];
}

async function getAllPosts(page = 0, limit = 10) {
  const { data, error } = await supabase
    .from('posts')
    .select('id, slug, title, excerpt, language, created_at, net_votes, users(display_name)')
    .order('created_at', { ascending: false })
    .range(page * limit, (page + 1) * limit - 1);

  if (error) {
    console.error('Error fetching all posts:', error);
    return [];
  }
  return data as Post[];
}

export default async function HomePage() {
  const [featuredPosts, hotPosts, allPosts] = await Promise.all([
    getFeaturedPosts(),
    getHotPosts(),
    getAllPosts()
  ]);

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Featured Section */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Featured Opinions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </section>

      {/* Hot Section */}
      <section className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Hot Right Now 🔥</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hotPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </section>

      {/* All Posts Section */}
      <section className="mt-8">
        <h2 className="text-2xl font-bold mb-4">All Posts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
        {/* We'll add the "Show more" button and logic later */}
      </section>
    </main>
  );
}