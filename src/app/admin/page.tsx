"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Shield, Trash2, EyeOff, CheckCircle, Flag, TrendingDown } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useLang } from "@/hooks/useLang";
import toast from "react-hot-toast";

interface FlaggedPost {
  id: string;
  slug: string;
  title: string;
  net_votes: number;
  published: boolean;
  created_at: string;
}

interface Report {
  id: string;
  target_type: string;
  target_id: string;
  reason: string;
  created_at: string;
  resolved: boolean;
  users: { display_name: string } | null;
}

export default function AdminPage() {
  const { user, loading } = useAuth();
  const { t } = useLang();
  const router = useRouter();
  const [data, setData] = useState<{ reports: Report[]; flaggedPosts: FlaggedPost[] } | null>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
  if (loading) return;              // still fetching — wait
  if (!user) {
    router.replace("/");            // not logged in
    return;
  }
  if (user.isAdmin === false) {     // explicitly false, not undefined
    router.replace("/");
  }
}, [user, loading, router]);

  useEffect(() => {
    fetch("/api/admin/flags")
      .then((r) => r.json())
      .then(setData)
      .catch(() => toast.error("Failed to load"))
      .finally(() => setFetching(false));
  }, []);

  async function handleAction(postId: string, action: "unpublish" | "delete" | "approve") {
    const res = await fetch("/api/admin/flags", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, action }),
    });
    if (res.ok) {
      toast.success(`Post ${action}d`);
      setData((prev) =>
        prev
          ? {
              ...prev,
              flaggedPosts: action === "delete"
                ? prev.flaggedPosts.filter((p) => p.id !== postId)
                : prev.flaggedPosts.map((p) =>
                    p.id === postId
                      ? { ...p, published: action === "approve" }
                      : p
                  ),
            }
          : prev
      );
    } else {
      toast.error("Action failed");
    }
  }

  if (loading || fetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-azure-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="w-6 h-6 text-saffron-500" />
          <h1 className="text-2xl font-bold">{t("adminPanel")}</h1>
        </div>

        {/* Flagged posts */}
        <section className="mb-10">
          <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
            <TrendingDown className="w-5 h-5 text-red-500" />
            {t("flaggedPosts")}
            <span className="ml-1 text-sm font-normal text-ink-400">
              (net votes below -5)
            </span>
          </h2>
          {data?.flaggedPosts.length === 0 ? (
            <p className="text-ink-400 text-sm">No flagged posts.</p>
          ) : (
            <div className="space-y-3">
              {data?.flaggedPosts.map((post) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card p-4 flex items-center gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{post.title}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-red-500 font-medium">
                        {post.net_votes} votes
                      </span>
                      <span className={`text-xs ${post.published ? "text-green-500" : "text-ink-400"}`}>
                        {post.published ? "Published" : "Unpublished"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={`/posts/${post.slug}`}
                      target="_blank"
                      className="text-xs text-azure-600 hover:underline"
                    >
                      View
                    </a>
                    {post.published ? (
                      <button
                        onClick={() => handleAction(post.id, "unpublish")}
                        className="btn-ghost p-1.5 text-xs gap-1"
                        title="Unpublish"
                      >
                        <EyeOff className="w-4 h-4 text-orange-500" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAction(post.id, "approve")}
                        className="btn-ghost p-1.5 text-xs gap-1"
                        title="Approve"
                      >
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      </button>
                    )}
                    <button
                      onClick={() => handleAction(post.id, "delete")}
                      className="btn-ghost p-1.5"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* Reports */}
        <section>
          <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
            <Flag className="w-5 h-5 text-orange-500" />
            {t("reportedContent")}
          </h2>
          {data?.reports.length === 0 ? (
            <p className="text-ink-400 text-sm">No reports.</p>
          ) : (
            <div className="space-y-3">
              {data?.reports.map((report) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`card p-4 ${report.resolved ? "opacity-50" : ""}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="tag bg-ink-100 dark:bg-ink-700 text-ink-500 text-xs">
                          {report.target_type}
                        </span>
                        <span className="text-xs text-ink-400">
                          by {report.users?.display_name ?? "Unknown"}
                        </span>
                        <span className="text-xs text-ink-400">
                          {new Date(report.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-ink-600 dark:text-ink-300">
                        {report.reason}
                      </p>
                      <p className="text-xs text-ink-400 mt-1 font-mono">
                        ID: {report.target_id}
                      </p>
                    </div>
                    {!report.resolved && (
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => handleAction(report.target_id, "unpublish")}
                          className="btn-ghost p-1.5"
                          title="Unpublish target"
                        >
                          <EyeOff className="w-4 h-4 text-orange-500" />
                        </button>
                        <button
                          onClick={() => handleAction(report.target_id, "delete")}
                          className="btn-ghost p-1.5"
                          title="Delete target"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
