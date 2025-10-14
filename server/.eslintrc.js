module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
  ],
  env: {
    node: true,
    es6: true,
  },
  rules: {
    '@typescript-eslint/no-unused-vars': 'off',
    'no-console': 'off',
    'prefer-const': 'warn',
    'no-var': 'error',
    'no-undef': 'off',
    'no-unused-vars': 'off',
    'no-unreachable': 'warn',
    'no-self-assign': 'warn',
    'no-case-declarations': 'warn',
  },
  ignorePatterns: [
    'dist/',
    'node_modules/',
    '*.js',
    '*.d.ts',
    'logs/',
    'uploads/',
    'test/',
    'tests/',
  ],
};
