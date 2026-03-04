"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowBigUp, ArrowBigDown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLang } from "@/hooks/useLang";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

interface VoteButtonsProps {
  postId: string;
  initialNetVotes: number;
  initialUserVote?: 1 | -1 | null;
  orientation?: "horizontal" | "vertical";
}

export function VoteButtons({
  postId,
  initialNetVotes,
  initialUserVote = null,
  orientation = "horizontal",
}: VoteButtonsProps) {
  const { user } = useAuth();
  const { t } = useLang();
  const [netVotes, setNetVotes] = useState(initialNetVotes);
  const [userVote, setUserVote] = useState<1 | -1 | null>(initialUserVote);
  const [loading, setLoading] = useState(false);

  async function handleVote(value: 1 | -1) {
    if (!user) {
      toast.error(t("loginRequired"));
      return;
    }
    if (loading) return;

    // Optimistic update
    const newVote = userVote === value ? 0 : value;
    const delta = newVote === 0 ? -value : newVote - (userVote ?? 0);
    setNetVotes((v) => v + delta);
    setUserVote(newVote === 0 ? null : (newVote as 1 | -1));
    setLoading(true);

    try {
      // Get fresh access token from client-side Supabase
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        toast.error(t("loginRequired"));
        setNetVotes(initialNetVotes);
        setUserVote(initialUserVote);
        return;
      }

      const res = await fetch(`/api/posts/${postId}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Send the access token explicitly so the server can verify it
          "Authorization": `Bearer ${session.access_token}`,
        },
        credentials: "include",
        body: JSON.stringify({ vote: newVote }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Vote failed");
        // Revert optimistic update
        setNetVotes(initialNetVotes);
        setUserVote(initialUserVote);
      } else if (data.net_votes !== undefined) {
        setNetVotes(data.net_votes);
      }
    } catch {
      toast.error("Vote failed");
      setNetVotes(initialNetVotes);
      setUserVote(initialUserVote);
    } finally {
      setLoading(false);
    }
  }

  const isVertical = orientation === "vertical";

  return (
    <div className={`flex ${isVertical ? "flex-col" : "flex-row"} items-center gap-1`}>
      <motion.button
        onClick={() => handleVote(1)}
        whileTap={{ scale: 0.85 }}
        disabled={loading}
        title={t("upvote")}
        className={`p-1.5 rounded-lg transition-colors ${
          userVote === 1
            ? "bg-azure-100 dark:bg-azure-900/30 text-azure-600"
            : "hover:bg-ink-100 dark:hover:bg-ink-800 text-ink-400 hover:text-azure-500"
        }`}
      >
        <ArrowBigUp className="w-5 h-5" fill={userVote === 1 ? "currentColor" : "none"} />
      </motion.button>

      <AnimatePresence mode="popLayout">
        <motion.span
          key={netVotes}
          initial={{ opacity: 0, y: userVote === 1 ? -4 : 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={`text-sm font-semibold tabular-nums min-w-[2rem] text-center ${
            netVotes > 0 ? "text-azure-600" : netVotes < 0 ? "text-red-500" : "text-ink-400"
          }`}
        >
          {netVotes}
        </motion.span>
      </AnimatePresence>

      <motion.button
        onClick={() => handleVote(-1)}
        whileTap={{ scale: 0.85 }}
        disabled={loading}
        title={t("downvote")}
        className={`p-1.5 rounded-lg transition-colors ${
          userVote === -1
            ? "bg-red-100 dark:bg-red-900/30 text-red-500"
            : "hover:bg-ink-100 dark:hover:bg-ink-800 text-ink-400 hover:text-red-400"
        }`}
      >
        <ArrowBigDown className="w-5 h-5" fill={userVote === -1 ? "currentColor" : "none"} />
      </motion.button>
    </div>
  );
}