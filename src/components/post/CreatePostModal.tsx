"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLang } from "@/hooks/useLang";
import toast from "react-hot-toast";

interface CreatePostModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreatePostModal({ open, onClose }: CreatePostModalProps) {
  const { t, lang } = useLang();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [language, setLanguage] = useState<"en" | "bn">(lang);
  const [type, setType] = useState<"problem" | "sharing">("sharing");
  const [loading, setLoading] = useState(false);
  const [profanityError, setProfanityError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setProfanityError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/posts/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body, language, type }),
      });

      const data = await res.json();

      if (res.status === 422 && data.error === "profanity") {
        setProfanityError(data.message);
        return;
      }

      if (!res.ok) {
        toast.error(data.error ?? "Failed to post");
        return;
      }

      toast.success("Opinion published!");
      onClose();
      setTitle("");
      setBody("");
      router.push(`/posts/${data.slug}`);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="relative z-10 w-full sm:max-w-2xl card shadow-2xl sm:rounded-2xl rounded-t-2xl max-h-[95vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white dark:bg-ink-800 border-b border-ink-100 dark:border-ink-700 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-lg font-semibold">{t("writeOpinion")}</h2>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-ink-100 dark:hover:bg-ink-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Profanity error */}
              <AnimatePresence>
                {profanityError && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                  >
                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <p
                      className={`text-sm text-red-600 dark:text-red-400 ${
                        language === "bn" ? "font-bangla" : ""
                      }`}
                    >
                      {profanityError}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Language & Type selectors */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-ink-500 mb-1.5">
                    {t("selectLanguage")}
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as "en" | "bn")}
                    className="input-field"
                  >
                    <option value="en">{t("language_en")}</option>
                    <option value="bn">{t("language_bn")}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink-500 mb-1.5">
                    {t("selectType")}
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as "problem" | "sharing")}
                    className="input-field"
                  >
                    <option value="sharing">{t("postType_sharing")}</option>
                    <option value="problem">{t("postType_problem")}</option>
                  </select>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-medium text-ink-500 mb-1.5">
                  {t("postTitle")} *
                </label>
                <input
                  className={`input-field ${language === "bn" ? "font-bangla" : ""}`}
                  placeholder={
                    language === "bn" ? "আপনার মতামতের শিরোনাম লিখুন" : "Your opinion heading"
                  }
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  maxLength={200}
                />
                <p className="text-xs text-ink-400 mt-1 text-right">{title.length}/200</p>
              </div>

              {/* Body */}
              <div>
                <label className="block text-xs font-medium text-ink-500 mb-1.5">
                  {t("postBody")} *
                </label>
                <textarea
                  className={`input-field min-h-[160px] resize-y ${
                    language === "bn" ? "font-bangla" : ""
                  }`}
                  placeholder={
                    language === "bn"
                      ? "বিস্তারিত লিখুন…"
                      : "Share your thoughts in detail…"
                  }
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-ghost"
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  disabled={loading || !title.trim() || !body.trim()}
                  className="btn-primary"
                >
                  {loading ? t("posting") : t("post")}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
