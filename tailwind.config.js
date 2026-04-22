/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: { 50:'#eff6ff', 100:'#dbeafe', 500:'#3b82f6', 600:'#2563eb', 700:'#1d4ed8' },
        danger:  { 50:'#fef2f2', 500:'#ef4444', 600:'#dc2626' },
        success: { 50:'#f0fdf4', 500:'#22c55e', 600:'#16a34a' },
      },
      animation: {
        'float':      'float 6s ease-in-out infinite',
        'float-slow': 'float 9s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4,0,0.6,1) infinite',
        'spin-slow':  'spin 8s linear infinite',
        'bounce-slow':'bounce 3s infinite',
        'shimmer':    'shimmer 2s linear infinite',
        'gradient':   'gradient 6s ease infinite',
      },
      keyframes: {
        float:   { '0%,100%':{ transform:'translateY(0px)' }, '50%':{ transform:'translateY(-18px)' } },
        shimmer: { '0%':{ backgroundPosition:'-200% 0' }, '100%':{ backgroundPosition:'200% 0' } },
        gradient:{ '0%,100%':{ backgroundPosition:'0% 50%' }, '50%':{ backgroundPosition:'100% 50%' } },
      },
      backgroundSize: { '300%': '300%' },
    },
  },
  plugins: [],
}
