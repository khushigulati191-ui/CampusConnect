/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Dark sidebar / primary text (from the support-requests reference)
        ink: {
          DEFAULT: '#1f2026',
          800: '#2a2b32',
          700: '#35363e',
          600: '#4a4b55',
          500: '#6b6c78',
          400: '#9a9ba6',
          300: '#c4c5cd',
        },
        // Primary indigo (from the CampusClaim / dashboard references)
        brand: {
          50: '#eef0ff',
          100: '#e0e4ff',
          200: '#c7cdff',
          300: '#a5adfd',
          400: '#8187f8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        // Feature-card accents (from the priority cards)
        tealdeep: '#0b6b7e',
        coral: '#ee5c63',
        mustard: '#d6cc1a',
        surface: '#f7f7fb',
      },
      boxShadow: {
        card: '0 1px 2px rgba(31,32,38,0.04), 0 4px 16px rgba(31,32,38,0.05)',
        pop: '0 12px 40px rgba(31,32,38,0.16)',
      },
      keyframes: {
        'slide-in-right': {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
      animation: {
        'slide-in-right': 'slide-in-right 0.25s ease-out',
        'slide-up': 'slide-up 0.25s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
      },
    },
  },
  plugins: [],
};
