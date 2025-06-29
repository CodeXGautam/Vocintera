/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#1e293b',
        'secondary': '#334155',
        'accent': '#3b82f6',
        'text-light': '#f8fafc',
        'text-dark': '#0f172a',
      },
      animation: {
        shine: 'shine 2s infinite linear alternate',
      },
      keyframes: {
        shine: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '100% 50%' },
        },
      },
    },
  },
  plugins: [],
}

