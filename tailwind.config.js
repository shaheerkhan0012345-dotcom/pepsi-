/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pepsi: {
          blue: '#0A4DA3',
          red: '#E32934',
          dark: '#0B0B0F',
          bg: '#F2F0EB',
          muted: '#7A7A85',
        }
      },
      fontFamily: {
        pixel: ['"Pixelify Sans"', '"Doto"', 'monospace'],
        doto: ['"Doto"', 'monospace'],
        sans: ['"Space Grotesk"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
