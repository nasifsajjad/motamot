import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sora)", "system-ui", "sans-serif"],
        bangla: ["var(--font-noto-bangla)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      colors: {
        ink: {
          DEFAULT: "#0D0F14",
          50: "#F5F6F8",
          100: "#E8EAF0",
          200: "#C8CCDA",
          300: "#9AA0B8",
          400: "#6B7394",
          500: "#454C6A",
          600: "#2E3450",
          700: "#1E2338",
          800: "#131829",
          900: "#0D0F14",
        },
        azure: {
          DEFAULT: "#2563EB",
          50: "#EFF6FF",
          100: "#DBEAFE",
          400: "#60A5FA",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1D4ED8",
        },
        saffron: {
          DEFAULT: "#F59E0B",
          400: "#FBBF24",
          500: "#F59E0B",
          600: "#D97706",
        },
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease forwards",
        "slide-up": "slideUp 0.4s cubic-bezier(0.16,1,0.3,1) forwards",
        "pulse-vote": "pulseVote 0.3s ease",
        "skeleton": "skeleton 1.5s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseVote: {
          "0%,100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.3)" },
        },
        skeleton: {
          "0%,100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
