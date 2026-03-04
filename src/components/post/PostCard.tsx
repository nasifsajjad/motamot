"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowBigUp, ArrowBigDown, MessageCircle, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Post } from "@/types";
import { useLang } from "@/hooks/useLang";

interface PostCardProps {
  post: Post;
  index?: number;
}

const typeColors = {
  problem: "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
  sharing: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
};

export function PostCard({ post, index = 0 }: PostCardProps) {
  const { t, lang } = useLang();

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      whileHover={{ y: -2 }}
      className="card p-5 cursor-pointer group"
    >
      <Link href={`/posts/${post.slug}`} className="block">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <span
            className={`tag ${typeColors[post.type]}`}
            title={post.type === "problem" ? t("postType_problem") : t("postType_sharing")}
          >
            {post.type === "problem" ? t("problem") : t("sharing")}
          </span>
          <span className="tag bg-ink-100 dark:bg-ink-700 text-ink-500 dark:text-ink-300">
            {post.language === "bn" ? (
              <span className="font-bangla">{t("language_bn")}</span>
            ) : (
              t("language_en")
            )}
          </span>
          <span className="ml-auto flex items-center gap-1 text-xs text-ink-400">
            <Clock className="w-3 h-3" />
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </span>
        </div>

        {/* Title */}
        <h3
          className={`font-semibold text-base leading-snug mb-1.5 group-hover:text-azure-600 transition-colors line-clamp-2 ${
            post.language === "bn" ? "font-bangla" : ""
          }`}
        >
          {post.title}
        </h3>

        {/* Excerpt */}
        <p
          className={`text-sm text-ink-500 dark:text-ink-400 line-clamp-2 leading-relaxed ${
            post.language === "bn" ? "font-bangla" : ""
          }`}
        >
          {post.excerpt}
        </p>
      </Link>

      {/* Footer */}
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-ink-100 dark:border-ink-700">
        <span className="text-xs text-ink-400">
          {t("by")}{" "}
          <span className="font-medium text-ink-600 dark:text-ink-300">
            {post.author?.displayName ?? t("anonymous")}
          </span>
        </span>

        <div className="ml-auto flex items-center gap-3">
          {/* Votes (read-only on card) */}
          <div className="flex items-center gap-1 text-sm">
            <ArrowBigUp
              className={`w-4 h-4 ${
                post.netVotes > 0 ? "text-azure-500" : "text-ink-300 dark:text-ink-600"
              }`}
            />
            <span
              className={`font-medium tabular-nums ${
                post.netVotes > 0
                  ? "text-azure-600"
                  : post.netVotes < 0
                  ? "text-red-500"
                  : "text-ink-400"
              }`}
            >
              {post.netVotes}
            </span>
            <ArrowBigDown
              className={`w-4 h-4 ${
                post.netVotes < 0 ? "text-red-400" : "text-ink-300 dark:text-ink-600"
              }`}
            />
          </div>

          {/* Comments count */}
          {post.commentsCount !== undefined && (
            <div className="flex items-center gap-1 text-xs text-ink-400">
              <MessageCircle className="w-3.5 h-3.5" />
              {post.commentsCount}
            </div>
          )}
        </div>
      </div>
    </motion.article>
  );
}
