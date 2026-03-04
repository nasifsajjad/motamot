import type { Metadata } from "next";
import { Sora } from "next/font/google";
import { Noto_Sans_Bengali } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/hooks/useAuth";
import { LangProvider } from "@/hooks/useLang";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const notoBangla = Noto_Sans_Bengali({
  subsets: ["bengali"],
  variable: "--font-noto-bangla",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: { default: "Motamot — Opinion • মতামত", template: "%s | Motamot" },
  description:
    "A bilingual (English / বাংলা) platform for honest opinions. Read, share, and discuss — no barriers.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL ?? "https://motamot.vercel.app"
  ),
  openGraph: {
    siteName: "Motamot",
    type: "website",
    locale: "en_US",
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="canonical" href={process.env.NEXT_PUBLIC_BASE_URL} />
        {process.env.NEXT_PUBLIC_ADSENSE_CLIENT && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT}`}
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body
        className={`${sora.variable} ${notoBangla.variable} font-sans antialiased bg-white dark:bg-ink-900 text-ink-900 dark:text-ink-50 min-h-screen`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <LangProvider>
              {children}
              <Toaster
                position="bottom-right"
                toastOptions={{
                  className:
                    "!bg-white dark:!bg-ink-800 !text-ink-900 dark:!text-ink-50 !shadow-lg !rounded-xl",
                }}
              />
            </LangProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
