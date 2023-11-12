import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        dodger: {
          50: "#eafeff",
          100: "#cbfbff",
          200: "#9ef6ff",
          300: "#5becff",
          400: "#00d5ff",
          500: "#00bbe5",
          600: "#0094c0",
          700: "#03759b",
          800: "#0d5e7d",
          900: "#104e69",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
