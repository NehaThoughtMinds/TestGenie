/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0a0c10',
        surface: '#111318',
        surface2: '#181c24',
        border: '#1f2535',
        'border-bright': '#2e3a52',
        accent: '#00e5ff',
        accent2: '#7c3aed',
        accent3: '#10b981',
        warn: '#f59e0b',
        text: '#e2e8f0',
        'text-dim': '#64748b',
        'text-faint': '#334155',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        float: 'float 8s ease-in-out infinite',
        fadeUp: 'fadeUp 0.5s ease both',
        pulse: 'pulse 2s infinite',
        spin: 'spin 0.8s linear infinite',
        progress: 'progress 2.5s ease forwards',
        rotateSlow: 'rotateSlow 3s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-30px)' },
        },
        fadeUp: {
          'from': { opacity: '0', transform: 'translateY(20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
        spin: {
          'to': { transform: 'rotate(360deg)' },
        },
        progress: {
          'to': { width: '100%' },
        },
        rotateSlow: {
          'to': { transform: 'rotate(360deg)' },
        },
      },
      backgroundImage: {
        'grid-pattern': "linear-gradient(rgba(0,229,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.03) 1px, transparent 1px)",
      },
      boxShadow: {
        'glow': '0 8px 40px rgba(0, 229, 255, 0.25)',
      }
    },
  },
  plugins: [],
}
