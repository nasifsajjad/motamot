"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Languages, Save, RotateCcw } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLang } from "@/hooks/useLang";
import toast from "react-hot-toast";
import type { Language } from "@/types";

interface TranslateToggleProps {
  postId: string;
  originalLanguage: Language;
  originalText: string;
  onTranslated?: (text: string | null) => void;
}

export function TranslateToggle({
  postId,
  originalLanguage,
  originalText,
  onTranslated,
}: TranslateToggleProps) {
  const { user } = useAuth();
  const { t } = useLang();
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isAuto, setIsAuto] = useState(false);
  const [showing, setShowing] = useState(false);

  const targetLang: Language = originalLanguage === "en" ? "bn" : "en";

  async function handleToggle() {
    if (showing) {
      setShowing(false);
      onTranslated?.(null);
      return;
    }

    if (translatedText) {
      setShowing(true);
      onTranslated?.(translatedText);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `/api/posts/${postId}/translate?target=${targetLang}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTranslatedText(data.text);
      setIsAuto(!data.saved);
      setIsSaved(data.saved);
      setShowing(true);
      onTranslated?.(data.text);
    } catch (err: unknown) {
      toast.error((err as Error).message ?? "Translation failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!user) {
      toast.error(t("loginRequired"));
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/posts/${postId}/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: translatedText, language: targetLang }),
      });
      if (!res.ok) throw new Error("Save failed");
      setIsSaved(true);
      toast.success("Translation saved!");
    } catch {
      toast.error("Failed to save translation");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <button
          onClick={handleToggle}
          disabled={loading}
          className="btn-outline text-xs gap-1.5"
        >
          <Languages className="w-3.5 h-3.5" />
          {loading
            ? t("loading")
            : showing
            ? originalLanguage === "bn"
              ? t("translateTo_en").replace("Translate to ", "← ")
              : "← Original"
            : targetLang === "bn"
            ? t("translateTo_bn")
            : t("translateTo_en")}
        </button>

        {showing && isAuto && !isSaved && translatedText && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-ghost text-xs gap-1.5 text-saffron-600 hover:text-saffron-700"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? "Saving…" : t("saveTranslation")}
          </button>
        )}

        {showing && (
          <button
            onClick={() => {
              setShowing(false);
              onTranslated?.(null);
            }}
            className="btn-ghost text-xs p-1.5"
            title="Show original"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {showing && translatedText && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div
              className={`p-4 rounded-xl bg-azure-50 dark:bg-azure-900/10 border border-azure-100 dark:border-azure-800 text-sm leading-relaxed ${
                targetLang === "bn" ? "font-bangla" : ""
              }`}
            >
              {isAuto && (
                <p className="text-xs text-azure-500 mb-2 flex items-center gap-1">
                  <Languages className="w-3 h-3" />
                  {t("autoTranslated")}
                </p>
              )}
              <p className="text-ink-700 dark:text-ink-200 whitespace-pre-wrap">
                {translatedText}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
