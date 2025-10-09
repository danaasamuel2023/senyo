/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './component/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'mtn-yellow': '#FFCC08',
        'mtn-yellow-dark': '#f5c500',
        'mtn-yellow-light': '#ffd633',
      },
    },
  },
  plugins: [],
}
