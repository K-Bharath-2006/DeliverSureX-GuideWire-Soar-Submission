/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#14b8a6", // teal-500
        "primary-dark": "#0f766e", // teal-700
        secondary: "#1e293b", // slate-800
      }
    },
  },
  plugins: [],
}
