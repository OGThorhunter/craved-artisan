module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.js'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/consistent-type-imports': 'warn',
    '@typescript-eslint/no-import-type-side-effects': 'warn',
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'no-restricted-imports': 'warn',
    'react-refresh/only-export-components': 'warn',
    'no-useless-escape': 'warn',
    'no-case-declarations': 'warn',
  },
  overrides: [
    {
      files: ['src/components/ui/AppIcon.tsx'],
      rules: { 'no-restricted-imports': 'off' }
    }
  ],
};

