/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Fraunces", "ui-serif", "Georgia", "serif"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        ink: "#12172B",
        paper: "#F7F8F5",
        forest: {
          DEFAULT: "#2F5D50",
          light: "#3E7A69",
          dark: "#1F4238",
        },
        gold: {
          DEFAULT: "#C98A3E",
          light: "#E0AC6C",
        },
      },
      boxShadow: {
        ledger: "0 1px 0 rgba(18,23,43,0.08)",
      },
    },
  },
  plugins: [],
};
