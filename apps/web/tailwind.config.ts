import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1A2A6C",
          foreground: "#f8fafc",
        },
        accent: {
          DEFAULT: "#FBC549",
          alt: "#EEAA33",
          foreground: "#0f172a",
        },
        steel: {
          DEFAULT: "#7D939F",
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
