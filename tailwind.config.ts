import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--color-primary)",
          hover: "var(--color-primary-hover)",
          active: "var(--color-primary-active)",
          soft: "var(--color-primary-soft)",
          muted: "var(--color-primary-muted)",
        },
        accent: {
          DEFAULT: "var(--color-accent)",
          hover: "var(--color-accent-hover)",
          active: "var(--color-accent-active)",
          soft: "var(--color-accent-soft)",
          muted: "var(--color-accent-muted)",
        },
        canvas: {
          DEFAULT: "var(--color-canvas)",
        },
        surface: {
          DEFAULT: "var(--color-surface)",
        },
        ink: {
          DEFAULT: "var(--color-ink)",
        },
        body: {
          DEFAULT: "var(--color-body)",
        },
        muted: {
          DEFAULT: "var(--color-muted)",
        },
        border: {
          DEFAULT: "var(--color-border)",
          strong: "var(--color-border-strong)",
        },
        success: {
          DEFAULT: "var(--color-success)",
        },
        warning: {
          DEFAULT: "var(--color-warning)",
        },
        error: {
          DEFAULT: "var(--color-error)",
        },
        info: {
          DEFAULT: "var(--color-info)",
        },
      },
    },
  },
  plugins: [],
};
export default config;
