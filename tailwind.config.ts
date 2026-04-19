import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // PROTEKON Official Brand Tokens
        void: "#070F1E",
        parchment: "#F4EFE6",
        enforcement: "#C8102E",
        sand: "#C9B27A",
        steel: "#3C506B",
        ink: "#0A1323",
        // Neutrals
        midnight: "#0B1D3A",
        ash: "#E8E2D8",
        fog: "#B8C5D1",
        "brand-white": "#FAFAF8",
        // Back-compat aliases (Remix-era names → official tokens)
        crimson: "#C8102E",
        gold: "#C9B27A",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "DM Sans", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Barlow Condensed", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        widest: "0.25em",
        "super-wide": "0.4em",
      },
      lineHeight: {
        tighter: "0.88",
        tight: "0.92",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        "scale-in": "scaleIn 0.5s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "bounce-slow": "bounce 2s infinite",
        marquee: "marquee 40s linear infinite",
        "breathe": "breathe 6s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        breathe: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.02)" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
