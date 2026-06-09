/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        pink: {
          primary: '#E8336A',
          hover:   '#FF6B9D',
          soft:    '#FFE8F0',
          dark:    '#B5194E',
        },
        base: {
          black:    '#0A0A0A',
          charcoal: '#1A1A1A',
          graphite: '#2E2E2E',
          muted:    '#6B6B6B',
          border:   '#E8E8E8',
          surface:  '#F5F5F5',
        },
      },
      fontFamily: {
        sans: ['Geist', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
