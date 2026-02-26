/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fm: {
          dark: '#0f1320',
          card: '#1a2035',
          border: '#2a3350',
          accent: '#4f8ef7',
          green: '#4ade80',
          yellow: '#facc15',
          red: '#f87171',
          text: '#e2e8f0',
          muted: '#7c8db0',
        }
      }
    },
  },
  plugins: [],
}
