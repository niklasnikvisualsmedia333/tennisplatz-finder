/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        court: {
          950: '#06170f',
          900: '#082016',
          800: '#0d2a1d',
          700: '#153b2a',
          lime: '#d7ff72',
          muted: '#9fb8a9',
        },
      },
      boxShadow: {
        lime: '0 0 28px rgba(215, 255, 114, 0.16)',
      },
    },
  },
  plugins: [],
};
