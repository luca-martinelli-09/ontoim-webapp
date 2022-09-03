/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    fontFamily: {
      body: ['"Noto Serif"', 'serif'],
      monospace: ['"Belgrano"', 'serif'],
      sans: ['"Open Sans"', 'sans-serif'],
    },
    extend: {
      colors: {
        background: "#F5EDDC",
        "background-light": "#F9F2ED",
        divider: "#DED5C4"
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
