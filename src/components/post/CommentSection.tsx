"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { MessageCircle, CornerDownRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLang } from "@/hooks/useLang";
import { AuthModal } from "@/components/AuthModal";
import toast from "react-hot-toast";
import type { Comment } from "@/types";

interface CommentSectionProps {
  postId: string;
}

function CommentItem({ comment, postId, onReply }: { comment: Comment; postId: string; onReply: () => void }) {
  const { lang } = useLang();
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className="group"
    >
      <div className="flex gap-3">
        <div className="w-7 h-7 rounded-full bg-azure-100 dark:bg-azure-900/30 flex items-center justify-center text-azure-600 text-xs font-semibold shrink-0 mt-0.5">
          {(comment.author as unknown as Record<string,unknown>)?.display_name?.[0]?.toUpperCase() ?? "A"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-ink-700 dark:text-ink-200">
              {(comment.author as unknown as Record<string,unknown>)?.display_name ?? "Anonymous"}
            </span>
            <span className="text-xs text-ink-400">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </span>
          </div>
          <p className={`text-sm text-ink-600 dark:text-ink-300 leading-relaxed ${comment.language === "bn" ? "font-bangla" : ""}`}>
            {comment.body}
          </p>
          <button
            onClick={onReply}
            className="text-xs text-ink-400 hover:text-azure-600 mt-1 transition opacity-0 group-hover:opacity-100"
          >
            Reply
          </button>
        </div>
      </div>

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-10 mt-3 space-y-3 pl-3 border-l-2 border-ink-100 dark:border-ink-700">
          {comment.replies.map((reply) => (
            <div key={reply.id} className="flex gap-3">
              <CornerDownRight className="w-3.5 h-3.5 text-ink-300 shrink-0 mt-1" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-medium text-ink-700 dark:text-ink-200">
                    {(reply.author as unknown as Record<string,unknown>)?.display_name ?? "Anonymous"}
                  </span>
                  <span className="text-xs text-ink-400">
                    {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <p className={`text-sm text-ink-600 dark:text-ink-300 ${reply.language === "bn" ? "font-bangla" : ""}`}>
                  {reply.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

export function CommentSection({ postId }: CommentSectionProps) {
  const { t, lang } = useLang();
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    fetch(`/api/posts/${postId}/comments`)
      .then((r) => r.json())
      .then((d) => setComments(d.comments ?? []))
      .finally(() => setLoading(false));
  }, [postId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) { setAuthOpen(true); return; }
    if (!body.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body, language: lang, parentCommentId: replyTo }),
      });
      if (!res.ok) {
        const d = await res.json();
        toast.error(d.message ?? "Failed to post comment");
        return;
      }
      const newComment = await res.json();
      if (replyTo) {
        setComments((prev) =>
          prev.map((c) =>
            c.id === replyTo
              ? { ...c, replies: [...(c.replies ?? []), { ...newComment, author: { display_name: user.displayName }, createdAt: newComment.created_at }] }
              : c
          )
        );
      } else {
        setComments((prev) => [
          ...prev,
          { ...newComment, author: { display_name: user.displayName }, createdAt: newComment.created_at, replies: [] },
        ]);
      }
      setBody("");
      setReplyTo(null);
    } catch {
      toast.error("Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="space-y-5">
      <h2 className="text-base font-semibold flex items-center gap-2">
        <MessageCircle className="w-4 h-4 text-azure-500" />
        {t("comments")} ({comments.length})
      </h2>

      {/* Comment input */}
      <form onSubmit={handleSubmit} className="space-y-2">
        {replyTo && (
          <p className="text-xs text-ink-400">
            Replying to a comment{" "}
            <button type="button" onClick={() => setReplyTo(null)} className="text-azure-600 hover:underline">
              cancel
            </button>
          </p>
        )}
        <textarea
          className={`input-field min-h-[80px] resize-none ${lang === "bn" ? "font-bangla" : ""}`}
          placeholder={
            user
              ? lang === "bn"
                ? "আপনার মন্তব্য লিখুন…"
                : "Write a comment…"
              : t("loginRequired")
          }
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onClick={() => !user && setAuthOpen(true)}
          readOnly={!user}
        />
        {user && (
          <div className="flex justify-end">
            <button type="submit" disabled={submitting || !body.trim()} className="btn-primary text-sm">
              {submitting ? t("posting") : t("comment")}
            </button>
          </div>
        )}
      </form>

      {/* Comments list */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="skeleton w-7 h-7 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-3 w-24" />
                <div className="skeleton h-4 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-ink-400 text-center py-8">
          No comments yet. Be the first!
        </p>
      ) : (
        <div className="space-y-5">
          <AnimatePresence>
            {comments.map((c) => (
              <CommentItem
                key={c.id}
                comment={c}
                postId={postId}
                onReply={() => setReplyTo(c.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </section>
  );
}