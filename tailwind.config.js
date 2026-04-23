/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          900: '#0a0a0a',
          800: '#141414',
          700: '#1c1c1c',
          600: '#2a2a2a',
          500: '#404040',
          400: '#6b6b6b',
          300: '#a0a0a0',
          200: '#d4d4d4',
          100: '#f0f0f0',
        },
        accent: {
          DEFAULT: '#c9a961', // muted gold — "maverick" but grown-up
          dim: '#8a7443',
        },
        danger: '#c24a4a',
        success: '#6b9362',
      },
      fontFamily: {
        display: ['"Fraunces"', 'Georgia', 'serif'],
        sans: ['"Inter Tight"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        inset: 'inset 0 1px 0 rgba(255,255,255,0.04)',
      },
    },
  },
  plugins: [],
};
