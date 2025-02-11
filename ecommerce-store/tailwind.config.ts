import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },

      container: {
        screens: {
          "xsm":"250px",
          "sm": "300px",
          "md": "700px",
          "lg": "900px",
          "xl": "1280px",
          "2xl": "1400px",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
