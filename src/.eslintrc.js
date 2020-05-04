module.exports = {
  env: {
    browser: true
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module'
  },
  extends: [
    'airbnb-base',
    'plugin:prettier/recommended'
  ],

  rules: {
    'no-new': 'off',
    'no-shadow': 'off',
    'no-use-before-define': 'off',
    'no-unused-expressions': 'off',
    'no-alert': 'off',
    'no-console': 'off'
  }
}
