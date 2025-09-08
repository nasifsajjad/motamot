// components/PostCard.tsx
"use client"; // This component needs to be a Client Component to use Framer Motion

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Post } from '@/types'; // Import your Post type

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const languageTag = post.language === 'bn' ? 'বাংলা' : 'English';
  
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 transition-colors"
    >
      <Link href={`/posts/${post.slug}`}>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">{post.title}</h3>
      </Link>
      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
        <span>By {post.users?.display_name || 'Anonymous'}</span>
        <span className="mx-2">•</span>
        <span>{new Date(post.created_at).toLocaleDateString()}</span>
        <span className="mx-2">•</span>
        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
          {languageTag}
        </span>
      </div>
      <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">{post.excerpt}</p>
      
      {/* Voting buttons and score */}
      <div className="flex items-center space-x-4">
        <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{post.net_votes}</span>
        <button className="flex items-center text-green-500 hover:text-green-600 transition-colors" title="Upvote">
          {/* SVG for Upvote */}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414 0L7.293 9.586A1 1 0 008 11h4a1 1 0 00.707-1.707L10.707 7.707z" clipRule="evenodd" />
          </svg>
        </button>
        <button className="flex items-center text-red-500 hover:text-red-600 transition-colors" title="Downvote">
          {/* SVG for Downvote */}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm.707 10.293a1 1 0 00-1.414 0L7.293 10.414A1 1 0 008 9h4a1 1 0 00.707 1.707l-2.707 2.707z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
};

export default PostCard;