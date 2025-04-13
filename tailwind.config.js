module.exports = {
  mode: 'jit',
  content: ['./app/**/*.{js,ts,jsx,tsx}', './src/**/*.{js,ts,jsx,tsx}'], // remove unused styles in production
  darkMode: 'media', // or 'media' or 'class'
  theme: {
    extend: {
      fontFamily: {
        mono: ['var(--font-space-mono)', 'Space Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'blink-slow': 'blink 1s step-end infinite',
      },
      keyframes: {
        ping: {
          '75%, 100%': {
            transform: 'scale(1.1)',
            opacity: '0.7',
          },
        },
        blink: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0 },
        },
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
