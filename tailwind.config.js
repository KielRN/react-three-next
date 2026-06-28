module.exports = {
  mode: 'jit',
  content: ['./app/**/*.{js,ts,jsx,tsx}', './src/**/*.{js,ts,jsx,tsx}'], // remove unused styles in production
  darkMode: 'media', // or 'media' or 'class'
  theme: {
    extend: {
      fontFamily: {
        mono: ['var(--font-space-mono)', 'Space Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        // Update to match 'Arial Black' preference from GoHighLevel design
        'hesdeadjim': ['Arial Black', 'Arial Bold', 'sans-serif'],
      },
      colors: {
        'ai-primary': '#000000',
        'ai-surface-dark': '#1a1a1a',
        'ai-navy': '#0e2042',
        'ai-gold': '#ebcb4c',
        'ai-gold-bright': '#ffcc00',
        'ai-gold-hover': '#d4b53f',
        'ai-blue': '#2c75ff',
        'ai-blue-hover': '#1a5ecc',
        'ai-cyan': '#6c97a5',
        'ai-card-light': '#f4f4f4',
        'ai-text-dark': '#111111',
        'ai-text-muted': '#555555',
        'lcars-amber': '#ff9f1c',
        'lcars-violet': '#9b6dff',
        'lcars-teal': '#1fd2c4',
        'lcars-rust': '#cc4b37',
        'lcars-ice': '#cfe8ff',
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
