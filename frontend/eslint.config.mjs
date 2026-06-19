import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const standardRules = {
  // Possible errors
  'no-console': ['warn', { allow: ['warn', 'error'] }],
  'no-debugger': 'error',
  'no-duplicate-imports': 'error',
  'no-unused-expressions': 'error',
  eqeqeq: ['error', 'always', { null: 'ignore' }],
  curly: ['warn', 'multi-line'],
  'prefer-const': 'error',
  'no-var': 'error',
  'object-shorthand': 'warn',
  'prefer-template': 'warn',

  // TypeScript
  '@typescript-eslint/no-unused-vars': [
    'warn',
    { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
  ],
  '@typescript-eslint/no-explicit-any': 'warn',
  '@typescript-eslint/consistent-type-imports': [
    'warn',
    { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
  ],
  '@typescript-eslint/no-non-null-assertion': 'warn',
  '@typescript-eslint/no-empty-object-type': 'warn',

  // React
  'react/jsx-boolean-value': ['warn', 'never'],
  'react/self-closing-comp': 'warn',
  'react-hooks/rules-of-hooks': 'error',
  'react-hooks/exhaustive-deps': 'warn',

  // Next.js
  '@next/next/no-html-link-for-pages': 'error',
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: standardRules,
  },
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'node_modules/**',
    'next-env.d.ts',
  ]),
]);

export default eslintConfig;
