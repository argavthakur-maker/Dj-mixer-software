/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        night: {
          950: '#06070B',
          900: '#090B10', // main background
          850: '#0D1017',
          800: '#11151D', // panels
          750: '#151A24',
          700: '#1A212E',
          600: '#252B36', // borders
          500: '#323B49',
          400: '#4B5565',
          300: '#8E9BAE',
          200: '#CBD5E1',
          100: '#F1F5F9',
        },
        cyan: {
          glow: '#00E5FF',
          deck: '#00E5FF',
          dark: '#007A8A',
        },
        magenta: {
          glow: '#EC4899',
          deck: '#D946EF',
          dark: '#86198F',
        },
        violet: {
          glow: '#8B5CF6',
          deck: '#A855F7',
          dark: '#581C87',
        },
        amber: {
          vu: '#F59E0B',
        },
        emerald: {
          cue: '#10B981',
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'glow-cyan': '0 0 15px -2px rgba(0, 229, 255, 0.45)',
        'glow-cyan-lg': '0 0 25px 2px rgba(0, 229, 255, 0.6)',
        'glow-violet': '0 0 15px -2px rgba(139, 92, 246, 0.45)',
        'glow-violet-lg': '0 0 25px 2px rgba(139, 92, 246, 0.6)',
        'glow-magenta': '0 0 15px -2px rgba(236, 72, 153, 0.45)',
        'glow-magenta-lg': '0 0 25px 2px rgba(236, 72, 153, 0.6)',
        'glow-emerald': '0 0 12px -2px rgba(16, 185, 129, 0.5)',
        'glow-amber': '0 0 12px -2px rgba(245, 158, 11, 0.5)',
        'inner-dark': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.6)',
        'platter': '0 10px 30px -5px rgba(0, 0, 0, 0.8), inset 0 0 20px rgba(0,0,0,0.9)',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
