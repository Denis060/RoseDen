import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#F8F3E8",
        burgundy: "#681A2D",
        wine: "#3B111C",
        gold: "#B48A43",
        ink: "#201A1B",
      },
      fontFamily: {
        sans: ["Inter", "Aptos", "Segoe UI", "Arial", "sans-serif"],
        display: ["Georgia", "Times New Roman", "serif"],
      },
      boxShadow: {
        soft: "0 12px 30px rgba(59, 17, 28, 0.08)",
      },
    },
  },
  plugins: [],
} satisfies Config;
