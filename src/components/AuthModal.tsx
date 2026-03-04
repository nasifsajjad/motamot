"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useLang } from "@/hooks/useLang";
import toast from "react-hot-toast";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

export function AuthModal({ open, onClose }: AuthModalProps) {
  const supabase = createClient();
  const { t } = useLang();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleGoogleSignIn() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) toast.error(error.message);
    setLoading(false);
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { display_name: displayName } },
        });
        if (error) throw error;
        if (data.user) {
          // Upsert user profile
          await supabase.from("users").upsert({
            id: data.user.id,
            email,
            display_name: displayName || email.split("@")[0],
            provider: "email",
          });
        }
        toast.success("Check your email to confirm your account!");
        onClose();
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
        onClose();
      }
    } catch (err: unknown) {
      toast.error((err as Error).message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="relative z-10 w-full max-w-md card p-8 shadow-2xl"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-ink-100 dark:hover:bg-ink-700"
            >
              <X className="w-4 h-4" />
            </button>

            <h2 className="text-2xl font-bold mb-1">
              {mode === "signin" ? t("signIn") : t("signUp")}
            </h2>
            <p className="text-sm text-ink-400 mb-6">
              {mode === "signin"
                ? "Welcome back to Motamot"
                : "Join the conversation"}
            </p>

            {/* Google OAuth */}
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="btn-outline w-full justify-center mb-4 py-2.5"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <div className="flex items-center gap-3 mb-4">
              <hr className="flex-1 border-ink-200 dark:border-ink-700" />
              <span className="text-xs text-ink-400">or</span>
              <hr className="flex-1 border-ink-200 dark:border-ink-700" />
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-3">
              {mode === "signup" && (
                <input
                  className="input-field"
                  placeholder="Display name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                />
              )}
              <input
                type="email"
                className="input-field"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                className="input-field"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center py-2.5"
              >
                {loading ? t("loading") : mode === "signin" ? t("signIn") : t("signUp")}
              </button>
            </form>

            <p className="text-sm text-center text-ink-400 mt-4">
              {mode === "signin" ? (
                <>
                  No account?{" "}
                  <button
                    className="text-azure-600 font-medium hover:underline"
                    onClick={() => setMode("signup")}
                  >
                    {t("signUp")}
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    className="text-azure-600 font-medium hover:underline"
                    onClick={() => setMode("signin")}
                  >
                    {t("signIn")}
                  </button>
                </>
              )}
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
