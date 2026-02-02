import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        black: {
          base: "#0a0a0a",
        },
        gold: {
          DEFAULT: "#d4af37",
          light: "#e8d099",
          dark: "#a68b2a",
        },
        silver: {
          DEFAULT: "#c0c0c0",
          light: "#e0e0e0",
          dark: "#8c8c8c",
        },
        purple: {
          deep: "#4a1a4a",
          light: "#6b2a6b",
        },
        offwhite: "#f5f5f5",
      },
      fontFamily: {
        serif: ["Georgia", "serif"],
        display: ["Georgia", "serif"], // Will update when display font chosen
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "6px",
        lg: "8px",
      },
      backgroundImage: {
        grain: "url('/grain.png')",
      },
    },
  },
  plugins: [],
};

export default config;
