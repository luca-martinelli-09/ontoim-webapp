/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    fontFamily: {
      body: ['"Open Sans"', "sans-serif"],
      serif: ['"Noto Serif"', "serif"]
    },
    extend: {},
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
