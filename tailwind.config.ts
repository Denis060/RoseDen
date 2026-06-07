import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#F8F2E8",
        burgundy: "#5A1020",
        wine: "#3A0B16",
        gold: "#C9A227",
        marble: "#D8E1EA",
        rose: "#B21F35",
        ink: "#1C1C1C",
      },
      fontFamily: {
        sans: ["Inter", "Aptos", "Segoe UI", "Arial", "sans-serif"],
        display: ["Georgia", "Times New Roman", "serif"],
      },
      boxShadow: {
        soft: "0 14px 36px rgba(90, 16, 32, 0.09)",
      },
    },
  },
  plugins: [],
} satisfies Config;
