"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { Sun, Moon, PenLine, Search, Globe2, User, LogOut, Shield } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "@/hooks/useLang";
import { useAuth } from "@/hooks/useAuth";
import { AuthModal } from "@/components/AuthModal";

interface HeaderProps {
  onWriteClick?: () => void;
  onSearch?: (q: string) => void;
}

export function Header({ onWriteClick, onSearch }: HeaderProps) {
  const { lang, setLang, t } = useLang();
  const { user, signOut } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    onSearch?.(searchQ);
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-ink-100 dark:border-ink-800 bg-white/80 dark:bg-ink-900/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="text-xl font-bold tracking-tight text-ink-900 dark:text-white">
              Motamot
            </span>
            <span className="hidden sm:block text-xs text-ink-400 font-normal">
              — Opinion • মতামত
            </span>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-sm hidden md:flex">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
              <input
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                placeholder={t("searchPlaceholder")}
                className="w-full pl-9 pr-4 py-1.5 text-sm rounded-full border border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-ink-800 focus:outline-none focus:ring-2 focus:ring-azure-500 dark:text-ink-50 placeholder-ink-400"
              />
            </div>
          </form>

          <div className="flex-1" />

          {/* Write CTA */}
          <button
            onClick={() => user ? onWriteClick?.() : setAuthOpen(true)}
            className="btn-primary hidden sm:inline-flex"
          >
            <PenLine className="w-4 h-4" />
            {t("writeOpinion")}
          </button>

          {/* Language switcher */}
          <button
            onClick={() => setLang(lang === "en" ? "bn" : "en")}
            className="btn-ghost p-2 gap-1 text-xs"
            title="Switch language"
          >
            <Globe2 className="w-4 h-4" />
            <span className={lang === "bn" ? "font-bangla" : ""}>
              {lang === "en" ? "বাংলা" : "English"}
            </span>
          </button>

          {/* Theme toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="btn-ghost p-2"
              title="Toggle theme"
            >
              {resolvedTheme === "dark" ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>
          )}

          {/* Auth */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-ink-100 dark:hover:bg-ink-800 transition"
              >
                {user.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.avatarUrl}
                    alt={user.displayName}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-azure-600 flex items-center justify-center text-white text-xs font-semibold">
                    {user.displayName?.[0]?.toUpperCase()}
                  </div>
                )}
              </button>
              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-10 w-48 card shadow-xl p-1 z-50"
                  >
                    <div className="px-3 py-2 border-b border-ink-100 dark:border-ink-700">
                      <p className="text-sm font-medium truncate">{user.displayName}</p>
                      <p className="text-xs text-ink-400 truncate">{user.email}</p>
                    </div>
                    {user.isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-ink-50 dark:hover:bg-ink-700"
                      >
                        <Shield className="w-4 h-4 text-saffron-500" />
                        {t("adminPanel")}
                      </Link>
                    )}
                    <button
                      onClick={() => { signOut(); setProfileOpen(false); }}
                      className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-ink-50 dark:hover:bg-ink-700 w-full text-left text-red-500"
                    >
                      <LogOut className="w-4 h-4" />
                      {t("signOut")}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button
              onClick={() => setAuthOpen(true)}
              className="btn-outline"
            >
              <User className="w-4 h-4" />
              {t("signIn")}
            </button>
          )}
        </div>
      </header>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
