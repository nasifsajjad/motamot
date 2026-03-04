import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-ink-100 dark:border-ink-800 py-8 px-4">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-ink-400">
        <div className="font-semibold text-ink-600 dark:text-ink-300">
          Motamot — Opinion • মতামত
        </div>
        <nav className="flex flex-wrap gap-4 justify-center">
          <Link href="/about" className="hover:text-ink-600 dark:hover:text-ink-200 transition">About</Link>
          <Link href="/rules" className="hover:text-ink-600 dark:hover:text-ink-200 transition">Rules</Link>
          <Link href="/privacy" className="hover:text-ink-600 dark:hover:text-ink-200 transition">Privacy</Link>
          <Link href="/tos" className="hover:text-ink-600 dark:hover:text-ink-200 transition">Terms</Link>
          <a href="mailto:hello@motamot.app" className="hover:text-ink-600 dark:hover:text-ink-200 transition">Contact</a>
        </nav>
        <p className="text-xs">© {new Date().getFullYear()} Motamot</p>
      </div>
    </footer>
  );
}
