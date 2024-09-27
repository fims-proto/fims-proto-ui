/* eslint-disable no-undef */
/* eslint-env node */

module.exports = {
  root: true,
  parser: 'vue-eslint-parser', // for .vue
  parserOptions: {
    parser: '@typescript-eslint/parser', // for .ts
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    'plugin:prettier/recommended',
    'prettier',
    'plugin:@typescript-eslint/recommended',
  ],
}
