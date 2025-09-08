// app/admin/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

interface FlaggedItem {
  id: string;
  title?: string;
  body: string;
  created_at: string;
  reports: { count: number }[];
}

const AdminDashboard = () => {
  const [posts, setPosts] = useState<FlaggedItem[]>([]);
  const [comments, setComments] = useState<FlaggedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        // This is a client-side check, but the API endpoint provides server-side protection
        if (!session) {
          router.push('/login');
          return;
        }

        const response = await fetch('/api/admin/flags');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch flagged content');
        }

        const data = await response.json();
        setPosts(data.posts);
        setComments(data.comments);

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [supabase, router]);
  
  // We'll add functions to unpublish/delete posts/comments here

  if (loading) {
    return <div className="text-center py-12">Loading moderation dashboard...</div>;
  }

  if (error) {
    return <div className="text-center py-12 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Moderation Dashboard</h1>
      
      {/* Flagged Posts Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Flagged Posts ({posts.length})</h2>
        {posts.length === 0 ? (
          <p className="text-gray-500">No flagged posts at this time.</p>
        ) : (
          posts.map((post) => (
            <motion.div key={post.id} className="bg-white dark:bg-gray-800 p-4 rounded-md shadow-sm mb-4">
              <p className="text-sm text-gray-500">Reports: {post.reports.length}</p>
              <h3 className="text-xl font-bold">{post.title}</h3>
              <p className="text-gray-700 dark:text-gray-300 line-clamp-2">{post.body}</p>
              {/* Add moderation action buttons here (e.g., delete, unpublish) */}
            </motion.div>
          ))
        )}
      </section>

      {/* Flagged Comments Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Flagged Comments ({comments.length})</h2>
        {comments.length === 0 ? (
          <p className="text-gray-500">No flagged comments at this time.</p>
        ) : (
          comments.map((comment) => (
            <motion.div key={comment.id} className="bg-white dark:bg-gray-800 p-4 rounded-md shadow-sm mb-4">
              <p className="text-sm text-gray-500">Reports: {comment.reports.length}</p>
              <p className="text-gray-700 dark:text-gray-300 line-clamp-2">{comment.body}</p>
              {/* Add moderation action buttons here */}
            </motion.div>
          ))
        )}
      </section>
    </div>
  );
};

export default AdminDashboard;