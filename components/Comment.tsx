// components/Comment.tsx
import React from 'react';
import { motion } from 'framer-motion';

interface CommentProps {
  comment: {
    id: string;
    body: string;
    author_id: string;
    created_at: string;
    users: {
      display_name: string;
    };
  };
}

const Comment: React.FC<CommentProps> = ({ comment }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg my-2"
    >
      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
        <span className="font-semibold text-gray-800 dark:text-gray-200">
          {comment.users.display_name || 'Anonymous'}
        </span>
        <span className="mx-2">•</span>
        <span>{new Date(comment.created_at).toLocaleDateString()}</span>
      </div>
      <p className="text-gray-700 dark:text-gray-300">{comment.body}</p>
    </motion.div>
  );
};

export default Comment;