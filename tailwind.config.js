/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        primary: '#165DFF',
        secondary: '#36D399',
        background: '#F5F5F5',
      },
      fontFamily: {
        sans: ['Segoe UI', 'Roboto', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0, 0, 0, 0.1)',
      },
      borderRadius: {
        'xl': '1rem',
      },
    },
  },
  plugins: [],
} 