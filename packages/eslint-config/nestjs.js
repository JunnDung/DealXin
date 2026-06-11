import { base } from './base.js';

export const nestjs = [
  ...base,
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**', '*.config.js'],
  },
];
