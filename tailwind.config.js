/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: '#2563EB',
          foreground: '#FFFFFF',
        },
        accent: {
          DEFAULT: '#22C55E',
          foreground: '#FFFFFF',
        },
        card: {
          DEFAULT: 'var(--bg-surface)',
          foreground: 'var(--text-primary)',
        },
        muted: {
          DEFAULT: 'var(--bg-elevated)',
          foreground: 'var(--text-secondary)',
        },
        border: 'var(--border)',
      },
      borderRadius: {
        xl: '0.75rem',
        '2xl': '1rem',
      }
    },
  },
  plugins: [],
}
