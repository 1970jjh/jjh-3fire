/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{tsx,ts,jsx,js}",
    "./components/**/*.{tsx,ts,jsx,js}",
    "./services/**/*.{tsx,ts,jsx,js}",
    "./api/**/*.{tsx,ts,jsx,js}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

