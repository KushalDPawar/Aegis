import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "var(--ink)",
          muted: "var(--ink-muted)",
          dim: "var(--ink-dim)",
          faint: "var(--ink-faint)",
          950: "#05070a",
          900: "#080b10",
          850: "#0b0f16",
          800: "#0f141c",
          700: "#161c27",
          600: "#212938",
        },
        cream: {
          100: "#f4f3ef",
          200: "#e9e7de",
        },
        signal: {
          teal: "#5eead4",
          cyan: "#67e8f9",
          amber: "#f5b942",
          coral: "#f2685b",
          crimson: "#e2394d",
          jade: "#4ade80",
        },
        paper: {
          top: "var(--paper-top)",
          bottom: "var(--paper-bottom)",
          surface: "var(--paper-surface)",
          elevated: "var(--paper-elevated)",
        },
        accent: {
          slate: "var(--accent-slate)",
          cyan: "var(--accent-cyan)",
          amber: "var(--accent-amber)",
          emerald: "var(--accent-emerald)",
          rose: "var(--accent-rose)",
        },
        hairline: "var(--hairline)",
        hairlineStrong: "var(--hairline-strong)",
      },
      fontFamily: {
        display: ["var(--font-display)", "var(--platform-font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        sans: ["var(--platform-font-sans)", "var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "var(--platform-font-mono)", "ui-monospace", "monospace"],
        serif: ["var(--platform-font-serif)", "Georgia", "serif"],
      },
      boxShadow: {
        glow: "0 0 60px -15px rgba(94, 234, 212, 0.35)",
        glowAmber: "0 0 60px -15px rgba(245, 185, 66, 0.35)",
        glowCrimson: "0 0 60px -15px rgba(226, 57, 77, 0.4)",
        panel: "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 20px 60px -30px rgba(0,0,0,0.6)",
      },
      keyframes: {
        blurFadeUp: {
          from: { opacity: "0", filter: "blur(18px)", transform: "translateY(28px)" },
          to: { opacity: "1", filter: "blur(0px)", transform: "translateY(0px)" },
        },
        softIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        pulseSubtle: {
          "0%, 100%": { opacity: "0.98" },
          "50%": { opacity: "0.65" },
        },
        radarSweep: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        pulseRing: {
          "0%": { transform: "scale(0.9)", opacity: "0.6" },
          "70%": { transform: "scale(1.4)", opacity: "0" },
          "100%": { transform: "scale(1.4)", opacity: "0" },
        },
        scan: {
          "0%": { backgroundPosition: "0% 0%" },
          "100%": { backgroundPosition: "0% 200%" },
        },
      },
      animation: {
        blurFadeUp: "blurFadeUp 0.9s cubic-bezier(.2,.7,.2,1) forwards",
        "fade-up": "blurFadeUp 0.8s cubic-bezier(0.2, 0.7, 0.2, 1) forwards",
        "soft-in": "softIn 1.2s ease forwards",
        "pulse-subtle": "pulseSubtle 3s ease-in-out infinite",
        "radar-sweep": "radarSweep 4s linear infinite",
        pulseRing: "pulseRing 2.4s cubic-bezier(0, 0, 0.2, 1) infinite",
      },
    },
  },
  plugins: [],
};

export default config;
