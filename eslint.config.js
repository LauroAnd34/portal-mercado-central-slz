import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['site-pronto/**', 'node_modules/**', 'ferramentas/modelo-sw.js'] },
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      eqeqeq: 'error',
      'prefer-const': 'error',
    },
  },
];
