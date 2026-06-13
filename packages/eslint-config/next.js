import nextPlugin from 'eslint-config-next';
import { base } from './base.js';

export const nextjs = [
  ...nextPlugin,
  ...base,
  {
    ignores: ['.next/**', 'node_modules/**', 'dist/**', 'coverage/**'],
  },
];
