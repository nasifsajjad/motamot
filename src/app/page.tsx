"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PenLine, Flame, Star, LayoutList } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PostList } from "@/components/post/PostList";
import { CreatePostModal } from "@/components/post/CreatePostModal";
import { useLang } from "@/hooks/useLang";
import { useAuth } from "@/hooks/useAuth";
import { AuthModal } from "@/components/AuthModal";

export default function HomePage() {
  const { t, lang } = useLang();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"featured" | "hot" | "all">("hot");
  const [createOpen, setCreateOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [search, setSearch] = useState("");

  function handleWriteClick() {
    if (user) setCreateOpen(true);
    else setAuthOpen(true);
  }

  const tabs = [
    { key: "hot" as const, label: t("hot"), icon: Flame },
    { key: "featured" as const, label: t("featured"), icon: Star },
    { key: "all" as const, label: t("allPosts"), icon: LayoutList },
  ];

  return (
    <>
      <Header onWriteClick={handleWriteClick} onSearch={setSearch} />

      <main className="max-w-6xl mx-auto px-4">
        {/* Hero */}
        <section className="py-12 sm:py-16 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`text-3xl sm:text-5xl font-bold tracking-tight mb-3 ${
              lang === "bn" ? "font-bangla" : ""
            }`}
          >
            {t("hero")}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-ink-500 dark:text-ink-400 text-base sm:text-lg mb-8"
          >
            {t("heroSub")}
          </motion.p>
          <motion.button
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            onClick={handleWriteClick}
            className="btn-primary text-base px-6 py-3"
          >
            <PenLine className="w-5 h-5" />
            <span className={lang === "bn" ? "font-bangla" : ""}>{t("writeOpinion")}</span>
          </motion.button>
        </section>

        {/* Tab navigation */}
        <div className="flex items-center gap-1 mb-6 border-b border-ink-100 dark:border-ink-800">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-xl transition-colors border-b-2 -mb-px ${
                activeTab === key
                  ? "border-azure-600 text-azure-600 dark:border-azure-400 dark:text-azure-400"
                  : "border-transparent text-ink-500 hover:text-ink-700 dark:hover:text-ink-300"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className={lang === "bn" ? "font-bangla" : ""}>{label}</span>
            </button>
          ))}
        </div>

        {/* Post list */}
        <PostList mode={activeTab} search={search} />
      </main>

      <Footer />

      <CreatePostModal open={createOpen} onClose={() => setCreateOpen(false)} />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
