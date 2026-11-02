/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Deep-space stage surfaces
        ink: {
          900: '#07090D',   // application background
          800: '#0D1118',   // primary panel
          700: '#111722',   // secondary panel
          600: '#161D29',   // elevated panel
          500: '#1B2331',
        },
        edge: {
          DEFAULT: '#252D3A',      // standard hairline border
          subtle: '#1C232E',
          bright: '#34404F',
        },
        txt: {
          primary: '#F4F7FC',
          secondary: '#A7B1C2',
          muted: '#8490A3',
          dim: '#5A6678',
        },
        // Electric accents
        cyan: {
          DEFAULT: '#00E5FF',
          bright: '#38F6FF',
          deep: '#0E5E6E',
        },
        violet: {
          DEFAULT: '#8B5CF6',
          deep: '#3D2B75',
        },
        magenta: {
          DEFAULT: '#D946EF',
        },
        ok: '#37F59A',
        warn: '#FFBF47',
        rec: '#FF3B57',
      },
      fontFamily: {
        sans: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        panel: '0 1px 0 0 rgba(255,255,255,0.03) inset, 0 8px 24px -12px rgba(0,0,0,0.8)',
        raised: '0 2px 0 0 rgba(255,255,255,0.04) inset, 0 12px 32px -12px rgba(0,0,0,0.9)',
        inset: 'inset 0 1px 3px rgba(0,0,0,0.6)',
        'glow-cyan': '0 0 18px -2px rgba(0,229,255,0.45)',
        'glow-cyan-sm': '0 0 10px -2px rgba(0,229,255,0.35)',
        'glow-violet': '0 0 18px -2px rgba(139,92,246,0.5)',
        'glow-violet-sm': '0 0 10px -2px rgba(139,92,246,0.35)',
        'glow-magenta': '0 0 18px -2px rgba(217,70,239,0.45)',
        'glow-warn': '0 0 14px -2px rgba(255,191,71,0.45)',
        'glow-rec': '0 0 16px -2px rgba(255,59,87,0.55)',
      },
      keyframes: {
        'spin-slow': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        'pulse-rec': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.35' },
        },
      },
      animation: {
        'spin-slow': 'spin-slow 2.4s linear infinite',
        'pulse-rec': 'pulse-rec 1.1s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
