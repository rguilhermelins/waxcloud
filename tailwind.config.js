/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#b88c8c',
        secondary: '#ddadad',
        tertiary: '#d6c7c7',
        quaternary: '#9fb9bf',
        fifth: '#aec8ce',
        hookers: '#638475',
        lightgreen: '#90e39a',
        mindaro: '#ddf093',
        desertsand: '#f6d0b1',
        cerise: '#ce4760',
        'pastel': {
          50: '#FFFDF5',
          100: '#FFF9E6',
          200: '#FFF3CC',
          300: '#FFE9A3',
          400: '#FFE07A',
          500: '#FFD651',
          600: '#E6BE38',
          700: '#BF9516',
          800: '#8C6A0D',
          900: '#594204'
        },
        'sage': {
          50: '#F2F7F2',
          100: '#E6F0E6',
          200: '#D1E6D1',
          300: '#B3D4B3',
          400: '#93C293',
          500: '#7AB07A',
          600: '#5C8E5C',
          700: '#446744',
          800: '#2C442C',
          900: '#1A291A'
        }
      }
    },
  },
  plugins: [],
} 