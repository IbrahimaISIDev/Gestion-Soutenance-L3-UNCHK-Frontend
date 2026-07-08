/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50:  '#e8edf5',
          100: '#c5d0e6',
          200: '#9fb0d3',
          300: '#7890c0',
          400: '#5a75b2',
          500: '#3c5aa4',
          600: '#2d4a8f',
          700: '#1e3370',
          800: '#132254',
          900: '#0d1b35',
          950: '#080f1e',
        },
        gold: {
          50:  '#fdf8e7',
          100: '#faefc3',
          200: '#f5e08a',
          300: '#efcc4f',
          400: '#e9bb2a',
          500: '#c9a227',
          600: '#a07d1a',
          700: '#7a5d12',
          800: '#55400c',
          900: '#332706',
        },
        primary: {
          50:  '#eff6ff',
          200: '#bfdbfe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
      },
    },
  },
  plugins: [],
}
