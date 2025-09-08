// components/PostContent.tsx
"use client";

import { useState } from 'react';
import { Post } from '@/types';
import { motion } from 'framer-motion';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

import CommentList from './CommentList';
import CommentForm from './CommentForm';

interface PostContentProps {
  post: Post;
  initialComments: any[]; // Consider creating a specific type for comments
}

const PostContent: React.FC<PostContentProps> = ({ post, initialComments }) => {
  const [currentContent, setCurrentContent] = useState(post.body);
  const [isTranslated, setIsTranslated] = useState(false);
  const [netVotes, setNetVotes] = useState(post.net_votes);
  const [isLoadingTranslation, setIsLoadingTranslation] = useState(false);
  
  const supabase = createClientComponentClient();
  const router = useRouter();

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    // Check if the user is logged in before proceeding
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      alert('Please sign in to vote.');
      return;
    }

    const voteValue = voteType === 'upvote' ? 1 : -1;
    
    try {
      const response = await fetch(`/api/posts/${post.id}/vote`, {
        method: 'POST',
        body: JSON.stringify({ vote: voteValue }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.error);
        return;
      }
      
      // Update the UI with the new netVotes from the API response
      const result = await response.json();
      setNetVotes(result.netVotes);

    } catch (error) {
      console.error('Failed to cast vote:', error);
      alert('Failed to cast vote. Please try again.');
    }
  };
  
  const handleTranslate = async () => {
    // Check if a translation is already active.
    if (isTranslated) {
      // If it is, revert to the original content
      setCurrentContent(post.body);
      setIsTranslated(false);
    } else {
      setIsLoadingTranslation(true);
      const targetLanguage = post.language === 'en' ? 'bn' : 'en';
      
      try {
        const response = await fetch('/api/translate', {
          method: 'POST',
          body: JSON.stringify({ text: post.body, targetLanguage }),
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          throw new Error('Translation failed');
        }

        const result = await response.json();
        setCurrentContent(result.translatedText);
        setIsTranslated(true);

      } catch (error) {
        console.error('Failed to translate:', error);
        alert('Failed to translate post. Please try again.');
      } finally {
        setIsLoadingTranslation(false);
      }
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-8">
      <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 mb-2">{post.title}</h1>
      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-6">
        <span>By {post.users?.display_name || 'Anonymous'}</span>
        <span className="mx-2">•</span>
        <span>{new Date(post.created_at).toLocaleDateString()}</span>
        <span className="mx-2">•</span>
        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
          {post.language === 'en' ? 'English' : 'বাংলা'}
        </span>
      </div>

      <motion.p 
        className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap transition-opacity duration-300"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {currentContent}
      </motion.p>
      
      <div className="mt-8 flex items-center justify-between">
        {/* Voting section */}
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => handleVote('upvote')} 
            className="flex items-center text-green-500 hover:text-green-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM7.293 9.707a1 1 0 011.414-1.414L10 9.586l1.293-1.293a1 1 0 011.414 1.414l-2 2a1 1 0 01-1.414 0l-2-2z"/></svg>
            <span className="ml-1">{netVotes}</span>
          </button>
          <button 
            onClick={() => handleVote('downvote')} 
            className="flex items-center text-red-500 hover:text-red-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zM7.293 10.293a1 1 0 011.414 0L10 11.414l1.293-1.293a1 1 0 011.414 1.414l-2 2a1 1 0 01-1.414 0l-2-2a1 1 0 010-1.414z"/></svg>
          </button>
        </div>
        
        {/* Translation toggle */}
        <button 
          onClick={handleTranslate} 
          disabled={isLoadingTranslation}
          className="py-2 px-4 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md disabled:opacity-50"
        >
          {isLoadingTranslation ? 'Translating...' : isTranslated ? 'Show Original' : `Translate to ${post.language === 'en' ? 'বাংলা' : 'English'}`}
        </button>
      </div>

      {/* AdSense Placeholder */}
      <div className="mt-8 text-center bg-gray-100 dark:bg-gray-800 p-8 rounded-lg">
        <p className="text-gray-500 dark:text-gray-400">Ad Placeholder</p>
        <div className="adsbygoogle" data-ad-client="YOUR_ADSENSE_PUB_ID" data-ad-slot="YOUR_AD_SLOT_ID"></div>
      </div>

      {/* Comments section */}
      <div className="mt-10">
        <h2 className="text-2xl font-bold mb-4">Comments ({initialComments.length})</h2>
        <CommentList comments={initialComments} />
        <CommentForm postId={post.id} />
      </div>
    </div>
  );
};

export default PostContent;