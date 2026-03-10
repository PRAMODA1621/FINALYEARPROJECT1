/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f5f0',
          100: '#e8e5d8',
          200: '#d1cbad',
          300: '#baaf7d',
          400: '#a3924d',
          500: '#8B5A2B', // Walnut Brown
          600: '#6e4622',
          700: '#52341a',
          800: '#362211',
          900: '#1a1108',
        },
        secondary: {
          50: '#f4f7f0',
          100: '#e9efd6',
          200: '#d3dfad',
          300: '#bdcf84',
          400: '#a7bf5b',
          500: '#9CAF88', // Sage Green
          600: '#7d8c6d',
          700: '#5e6952',
          800: '#3e4636',
          900: '#1f231b',
        },
        background: '#F5F5F0',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}