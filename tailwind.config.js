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
      primary: colors.blue,
      neutral: colors.neutral,
      success: colors.green,
      warning: colors.yellow,
      error: colors.red,
    },
    extend: {},
  },
  plugins: [
    require('@tailwindcss/forms')({
      strategy: 'base', // only generate global styles
    }),
  ],
}
