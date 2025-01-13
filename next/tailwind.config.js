/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./styles/**/*.css",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        primary: ['var(--font-inter)', 'sans-serif'],
        secondary: ['var(--font-montserrat)', 'sans-serif'],
      },
      fontWeight: {
        black: '900',
      }
    },
  },
  plugins: [],
};
