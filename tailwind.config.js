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
        // Apple-inspired color system
        primary: '#007AFF',    // Blue
        secondary: '#5AC8FA',  // Light Blue
        accent: '#FF9500',     // Orange
        success: '#34C759',    // Green
        warning: '#FF9500',    // Orange
        error: '#FF3B30',      // Red
        // Neutral tones
        neutral: {
          50: '#F5F5F7',
          100: '#E5E5EA',
          200: '#D1D1D6',
          300: '#C7C7CC',
          400: '#AEAEB2',
          500: '#8E8E93',
          600: '#636366',
          700: '#48484A',
          800: '#3A3A3C',
          900: '#2C2C2E',
        },
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
      },
      fontFamily: {
        sans: ['SF Pro Display', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '1': '8px',
        '2': '16px',
        '3': '24px',
        '4': '32px',
        '5': '40px',
        '6': '48px',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
      },
      boxShadow: {
        'apple': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'apple-hover': '0 4px 12px rgba(0, 0, 0, 0.12)',
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
} 