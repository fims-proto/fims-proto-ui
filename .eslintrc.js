module.exports = {
  root: true,
  parser: 'vue-eslint-parser', // for .vue
  parserOptions: {
    parser: '@typescript-eslint/parser', // for .ts
  },
  plugins: [
    '@typescript-eslint',
  ],
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    'plugin:@typescript-eslint/recommended',
  ]
}