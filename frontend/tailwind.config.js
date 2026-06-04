/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        wedding: {
          primary: '#4A0E0E', // Deep Maroon
          secondary: '#D4AF37', // Gold
          accent: '#FDF5E6', // Old Lace
          dark: '#1A1A2E',
          gold: '#C5A028',
          lightGold: '#FFF9EB',
          mid: '#8B6B23',
          gray: '#717171',
          bg: '#FAFAFA',
          sage: '#7C8E7B',
          rose: '#C08497',
          cream: '#F7E7CE',
          maroon: '#4A0E0E'
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['"Inter"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
