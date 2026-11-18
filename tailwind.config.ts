import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#F8F9FC",
        sidebar: "#0F1535",
        ink: "#0F1535",
        muted: "#64748B",
        line: "rgba(226,232,240,0.8)",
        primary: {
          DEFAULT: "#5B4BDB",
          hover: "#4B3DC4",
          soft: "#EEF0FF",
        },
        info: "#2563EB",
        success: "#059669",
        warning: "#D97706",
        danger: "#DC2626",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "16px",
        control: "8px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(15,21,53,0.04), 0 8px 24px rgba(15,21,53,0.05)",
      },
      minHeight: {
        touch: "44px",
      },
    },
  },
  plugins: [],
};

export default config;
