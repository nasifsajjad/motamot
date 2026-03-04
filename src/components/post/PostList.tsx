"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { PostCard } from "./PostCard";
import { useLang } from "@/hooks/useLang";
import type { Post, PostMode } from "@/types";

interface PostListProps {
  mode: PostMode;
  search?: string;
}

function SkeletonCard() {
  return (
    <div className="card p-5 space-y-3">
      <div className="flex gap-2">
        <div className="skeleton h-5 w-16 rounded-full" />
        <div className="skeleton h-5 w-12 rounded-full" />
        <div className="skeleton h-5 w-24 rounded-full ml-auto" />
      </div>
      <div className="skeleton h-5 w-3/4" />
      <div className="skeleton h-4 w-full" />
      <div className="skeleton h-4 w-2/3" />
      <div className="skeleton h-4 w-1/3 mt-2" />
    </div>
  );
}

export function PostList({ mode, search = "" }: PostListProps) {
  const { t } = useLang();
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchPosts = useCallback(
    async (reset = false) => {
      const currentPage = reset ? 1 : page;
      if (reset) setLoading(true);
      else setLoadingMore(true);

      try {
        const params = new URLSearchParams({
          mode,
          page: String(currentPage),
          limit: "10",
        });
        if (search) params.set("search", search);

        const res = await fetch(`/api/posts?${params}`);
        const data = await res.json();

        if (reset) {
          setPosts(data.posts ?? []);
          setPage(2);
        } else {
          setPosts((prev) => [...prev, ...(data.posts ?? [])]);
          setPage((p) => p + 1);
        }
        setHasMore(data.hasMore ?? false);
      } catch {
        // silent
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mode, search]
  );

  useEffect(() => {
    setPage(1);
    fetchPosts(true);
  }, [fetchPosts]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (!posts.length) {
    return (
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-16 text-ink-400"
      >
        {t("noPostsYet")}
      </motion.p>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post, i) => (
        <PostCard key={post.id} post={post} index={i} />
      ))}

      {hasMore && (
        <div className="flex justify-center pt-2">
          <button
            onClick={() => fetchPosts(false)}
            disabled={loadingMore}
            className="btn-outline"
          >
            {loadingMore ? t("loading") : t("showMore")}
          </button>
        </div>
      )}
    </div>
  );
}
