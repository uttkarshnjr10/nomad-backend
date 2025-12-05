/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nomad: {
          dark: "#0f172a", 
          light: "#f8fafc",
          primary: "#6366f1", 
          accent: "#f43f5e", 
        }
      }
    },
  },
  plugins: [],
}