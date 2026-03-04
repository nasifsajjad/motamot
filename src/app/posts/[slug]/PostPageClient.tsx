"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeft, Flag, Share2 } from "lucide-react";
import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { VoteButtons } from "@/components/post/VoteButtons";
import { TranslateToggle } from "@/components/post/TranslateToggle";
import { CommentSection } from "@/components/post/CommentSection";
import { useLang } from "@/hooks/useLang";
import { useAuth } from "@/hooks/useAuth";
import { AuthModal } from "@/components/AuthModal";
import toast from "react-hot-toast";
import type { Post } from "@/types";

const AD_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? "";
const AD_SLOT = process.env.NEXT_PUBLIC_ADSENSE_SLOT ?? "";

export function PostPageClient({ post }: { post: Post }) {
  const { t, lang } = useLang();
  const { user } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [displayBody, setDisplayBody] = useState(post.body);
  const [reportReason, setReportReason] = useState("");
  const [reportOpen, setReportOpen] = useState(false);

  async function handleReport() {
    if (!user) { setAuthOpen(true); return; }
    const res = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetType: "post", targetId: post.id, reason: reportReason }),
    });
    if (res.ok) {
      toast.success(t("reportSubmitted"));
      setReportOpen(false);
      setReportReason("");
    }
  }

  async function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: post.title, url });
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied!");
    }
  }

  const typeColors = post.type === "problem"
    ? "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400"
    : "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400";

  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Back */}
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-ink-400 hover:text-ink-700 dark:hover:text-ink-200 mb-6 transition">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        <motion.article
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-6"
        >
          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`tag ${typeColors}`}>
              {post.type === "problem" ? t("problem") : t("sharing")}
            </span>
            <span className="tag bg-ink-100 dark:bg-ink-700 text-ink-500">
              {post.language === "bn" ? (
                <span className="font-bangla">{t("language_bn")}</span>
              ) : t("language_en")}
            </span>
            <span className="ml-auto text-xs text-ink-400">
              {t("publishedAt")}{" "}
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </span>
          </div>

          {/* Title */}
          <h1 className={`text-2xl sm:text-3xl font-bold leading-tight ${post.language === "bn" ? "font-bangla" : ""}`}>
            {post.title}
          </h1>

          {/* Author */}
          <div className="flex items-center gap-2">
            {(post.author as unknown as Record<string,unknown>)?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={(post.author as unknown as Record<string,unknown>).avatar_url as string} alt="" className="w-7 h-7 rounded-full object-cover" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-azure-600 flex items-center justify-center text-white text-xs font-semibold">
                {((post.author as unknown as Record<string,unknown>)?.display_name as string)?.[0]?.toUpperCase() ?? "A"}
              </div>
            )}
            <span className="text-sm text-ink-500">
              {t("by")}{" "}
              <span className="font-medium text-ink-700 dark:text-ink-200">
                {(post.author as unknown as Record<string,unknown>)?.display_name as string ?? t("anonymous")}
              </span>
            </span>
          </div>

          {/* Body */}
          <div className={`prose prose-ink max-w-none text-ink-700 dark:text-ink-200 leading-relaxed ${post.language === "bn" ? "font-bangla" : ""}`}>
            {displayBody.split("\n\n").map((p, i) => (
              <p key={i} className="mb-4">{p}</p>
            ))}
          </div>

          {/* Translation */}
          <TranslateToggle
            postId={post.id}
            originalLanguage={post.language}
            originalText={post.body}
            onTranslated={(t) => setDisplayBody(t ?? post.body)}
          />

          {/* Adsense slot */}
          {AD_CLIENT && AD_SLOT && (
            <div className="my-4 text-center">
              <ins
                className="adsbygoogle"
                style={{ display: "block" }}
                data-ad-client={AD_CLIENT}
                data-ad-slot={AD_SLOT}
                data-ad-format="auto"
                data-full-width-responsive="true"
              />
            </div>
          )}

          {/* Actions bar */}
          <div className="flex items-center gap-4 py-4 border-y border-ink-100 dark:border-ink-700">
            <VoteButtons
              postId={post.id}
              initialNetVotes={post.netVotes}
              initialUserVote={post.userVote}
            />
            <div className="ml-auto flex items-center gap-2">
              <button onClick={handleShare} className="btn-ghost p-2" title={t("share")}>
                <Share2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => user ? setReportOpen(true) : setAuthOpen(true)}
                className="btn-ghost p-2 text-ink-400 hover:text-red-500"
                title={t("report")}
              >
                <Flag className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Report form */}
          {reportOpen && (
            <div className="card p-4 space-y-3">
              <p className="text-sm font-medium">{t("reportReason")}</p>
              <textarea
                className="input-field min-h-[80px]"
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="Describe the issue…"
              />
              <div className="flex gap-2">
                <button onClick={handleReport} className="btn-primary text-sm">
                  {t("submit")}
                </button>
                <button onClick={() => setReportOpen(false)} className="btn-ghost text-sm">
                  {t("cancel")}
                </button>
              </div>
            </div>
          )}

          {/* Comments */}
          <CommentSection postId={post.id} />
        </motion.article>
      </main>

      <Footer />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}