// components/CommentList.tsx
import React from 'react';
import Comment from './Comment';

interface CommentListProps {
  comments: any[]; // Use a more specific type if possible
}

const CommentList: React.FC<CommentListProps> = ({ comments }) => {
  if (!comments || comments.length === 0) {
    return <p className="text-center text-gray-500 dark:text-gray-400">No comments yet. Be the first to share your thoughts!</p>;
  }

  return (
    <div>
      {comments.map((comment) => (
        <Comment key={comment.id} comment={comment} />
      ))}
    </div>
  );
};

export default CommentList;