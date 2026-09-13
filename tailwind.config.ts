import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: "var(--primary)",
        muted: "var(--muted)",
        border: "var(--border)",
        heading: "var(--heading)",
        accent: "var(--accent)",
      },
      fontFamily: { sans: ["Inter", "Segoe UI", "Arial", "sans-serif"] },
    },
  },
  plugins: [],
};
export default config;
