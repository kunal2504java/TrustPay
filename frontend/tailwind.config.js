/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'clash': ['Clash Grotesk', 'sans-serif'],
        'teko': ['Teko', 'sans-serif'],
        'khand': ['Khand', 'sans-serif'],
        'sans': ['Clash Grotesk', 'sans-serif'], // Default body font
        'display': ['Clash Grotesk', 'sans-serif'], // For headings
      },
      animation: {
        'float': 'float 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-15px)' },
        }
      }
    },
  },
  plugins: [],
}
