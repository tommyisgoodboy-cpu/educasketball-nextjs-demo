import type { Config } from "tailwindcss";

// Educasketball design tokens
// - brand：深藍主色（信任、專業）
// - aqua：淺藍輔色（背景、標籤、資訊）
// - cta：橙色只用喺主要 CTA 按鈕（呼應籃球）
// - level：四個技術等級嘅識別色
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#EEF4FB",
          100: "#D6E4F5",
          200: "#ADC8EB",
          300: "#7FA8DE",
          400: "#4E84CC",
          500: "#2A64B3",
          600: "#1D4E94",
          700: "#173E77",
          800: "#12305C",
          900: "#0C2242",
          950: "#071630",
        },
        aqua: {
          50: "#EFF8FF",
          100: "#DCEFFE",
          200: "#B5E0FD",
          300: "#7FCBFA",
          400: "#43B0F3",
          500: "#1A93DE",
          600: "#0D74B3",
        },
        cta: {
          DEFAULT: "#C2410C",
          hover: "#9A3412",
          soft: "#FFF1E8",
        },
        ink: {
          DEFAULT: "#0F1B2D",
          muted: "#4A5A70",
          subtle: "#5F6F85",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          muted: "#F5F8FC",
          border: "#DDE5EF",
        },
        level: {
          starter: "#17794F",
          foundation: "#2A64B3",
          intermediate: "#6D4ACF",
          elite: "#B4371F",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "1rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(12, 34, 66, 0.06), 0 4px 16px rgba(12, 34, 66, 0.06)",
      },
      maxWidth: {
        content: "72rem",
      },
    },
  },
  plugins: [],
};

export default config;
