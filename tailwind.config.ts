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
        carbon: {
          DEFAULT: "#0A0A0C",
          surface: "#121318",
        },
        neon: {
          cyan: "#00F2FE",
          violet: "#9B51E0",
        },
      },
      backgroundImage: {
        "grid-pattern": "radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.15) 1px, transparent 0)",
      },
      boxShadow: {
        "neon-cyan": "0 0 20px rgba(0, 242, 254, 0.3)",
        "neon-cyan-lg": "0 0 28px rgba(0, 242, 254, 0.55)",
        "neon-cyan-sm": "0 0 10px #00F2FE",
        "neon-violet": "0 0 20px rgba(155, 81, 224, 0.3)",
      },
    },
  },
  plugins: [],
};

export default config;
