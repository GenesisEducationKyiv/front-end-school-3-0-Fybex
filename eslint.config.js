import js from '@eslint/js';

export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/generated/**',
      '**/coverage/**',
    ],
  },
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
    },
  },
];
