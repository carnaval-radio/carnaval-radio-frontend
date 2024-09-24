import type { Config } from "tailwindcss";
import { getThemeOrDefault } from "./themes.config";

const theme = getThemeOrDefault(process.env.NEXT_PUBLIC_THEME);
console.log("theme", theme);
const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: theme.colors,
    },
  },
  plugins: [require("tailwind-scrollbar-hide")],
};
export default config;
