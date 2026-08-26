import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        eblock: "#2563eb",
        sblock: "#d97706",
        gblock: "#7c3aed",
      },
    },
  },
  plugins: [],
};

export default config;
