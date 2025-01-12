import colors from 'tailwindcss/colors'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: colors.emerald,
        success: colors.green,
        warning: colors.yellow,
        error: colors.red,
      },
    },
  },
  darkMode: 'selector',
  plugins: [],
}
