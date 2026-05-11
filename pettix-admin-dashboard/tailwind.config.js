/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#4A5D8A", // Figma Navy Blue
        secondary: "#6B7B9E",
        accent: "#F3F4F6",
        background: "#F9FAFB",
        sidebar: "#2D3748",
      }
    },
  },
  plugins: [],
}
