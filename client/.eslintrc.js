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
    '@typescript-eslint/consistent-type-imports': [
      'error',
      { 
        prefer: 'type-imports',
        disallowTypeAnnotations: false
      }
    ],
    '@typescript-eslint/no-import-type-side-effects': 'error',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-restricted-imports': ['error', {
      'paths': [{
        'name': 'lucide-react',
        'message': 'Import icons from \'@/components/ui/AppIcon\' instead.'
      }]
    }],
  },
  overrides: [
    {
      files: ['src/components/ui/AppIcon.tsx'],
      rules: { 'no-restricted-imports': 'off' }
    }
  ],
};

