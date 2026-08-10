import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Keep legacy debt visible while allowing incremental migration to the
    // stricter React 19 and TypeScript rules enabled by Next.js 16.
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-require-imports': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/static-components': 'warn',
    },
  },
  globalIgnores([
    '.next/**',
    '.npm-cache/**',
    '.venv/**',
    'backend/.venv/**',
    'backend/media/**',
    'backend/static/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
]);
