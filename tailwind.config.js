/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
const colors = require('tailwindcss/colors')

module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      white: colors.white,
      black: colors.black,
      primary: colors.indigo,
      neutral: colors.gray,
      success: colors.teal,
      warning: colors.amber,
      error: colors.rose,
    },
    extend: {},
  },
  plugins: [require('@tailwindcss/forms')],
}
