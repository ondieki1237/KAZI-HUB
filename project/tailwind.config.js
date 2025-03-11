/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        teal: {
          dark: '#008080',
          medium: '#00AEAE',
          light: '#00DCDC',
          bright: '#0BFFFF',
        },
      },
    },
  },
  plugins: [],
};