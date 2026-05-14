/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#1e1e1e',
          2: '#2a2a2a',
          3: '#333333',
        },
      },
    },
  },
  plugins: [],
}
