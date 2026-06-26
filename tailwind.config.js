/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#FFFDF0',
          100: '#FFF9C4',
          200: '#FFF59D',
          300: '#FFEE58',
          400: '#FFE082',
          500: '#FFD400', // Premium Brand Yellow
          600: '#FF9A00', // Premium Brand Orange
          700: '#E68A00',
          800: '#CC7B00',
          900: '#995C00',
          950: '#663D00',
        },
        darkbg: {
          DEFAULT: '#0B0B0B', // Dark slate gray/black
          card: '#1F1F1F', // Card/Surface color
          border: '#2E2E2E', // Subtle border color
          lighter: '#2E2E2E',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in-up': 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-in-right': 'slideInRight 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-in-left': 'slideInLeft 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'float': 'float 4s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(255, 212, 0, 0.2), 0 0 10px rgba(255, 212, 0, 0.1)' },
          '100%': { boxShadow: '0 0 20px rgba(255, 212, 0, 0.6), 0 0 30px rgba(255, 212, 0, 0.3)' },
        }
      },
    },
  },
  plugins: [],
}
