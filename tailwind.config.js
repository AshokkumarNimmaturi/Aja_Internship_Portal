/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: "#0A1628",
        "blue-accent": "#2563EB",
        "blue-light": "#EFF6FF",
        "blue-mid": "#BFDBFE",
        "text-muted": "#6B7280",
        "bg-soft": "#F9FAFB",
      },
      fontFamily: {
        serif: ["Instrument Serif", "Georgia", "serif"],
        sans: ["DM Sans", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
