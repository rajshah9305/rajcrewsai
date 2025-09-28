/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary colors from design specification
        'deep-space': '#0B1426',
        'electric-cyan': '#00D4FF',
        'neon-green': '#39FF14',
        'amber': '#FFB000',
        'coral-red': '#FF6B6B',
        'cool-gray': '#8B9DC3',
        'charcoal': '#1A1D23',
        
        // Status colors
        'status-idle': '#8B9DC3',
        'status-active': '#39FF14',
        'status-processing': '#FFB000',
        'status-error': '#FF6B6B',
        'status-success': '#39FF14',
        
        // Background colors
        'bg-primary': '#0B1426',
        'bg-secondary': '#1A1D23',
        'bg-tertiary': '#2A2D35',
        
        // Text colors
        'text-primary': '#FFFFFF',
        'text-secondary': '#B8C5D6',
        'text-muted': '#8B9DC3',
      },
      fontFamily: {
        'display': ['Orbitron', 'monospace'],
        'body': ['Inter', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
        'bounce-slow': 'bounce 2s infinite',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        glow: {
          'from': { 'text-shadow': '0 0 20px #00D4FF' },
          'to': { 'text-shadow': '0 0 30px #00D4FF, 0 0 40px #00D4FF' },
        },
        float: {
          '0%, 100%': { 'transform': 'translateY(0px)' },
          '50%': { 'transform': 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { 'background-position': '-200% 0' },
          '100%': { 'background-position': '200% 0' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(0, 212, 255, 0.3)',
        'glow-intense': '0 0 30px rgba(0, 212, 255, 0.5)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'grid-pattern': 'linear-gradient(rgba(139, 157, 195, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 157, 195, 0.1) 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid': '20px 20px',
      },
    },
  },
  plugins: [],
};