/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0F4C5C',
          light: '#1a6b7d',
          dark: '#0a3a47',
        },
        accent: {
          DEFAULT: '#A8DADC',
          light: '#d4f0f1',
          dark: '#7fbfc1',
        },
        medical: {
          white: '#ffffff',
          gray: '#f3f4f6',
          text: '#1f2937',
          muted: '#6b7280',
        },
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}