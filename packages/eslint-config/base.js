/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint',
    'import',
    'prettier',
    'simple-import-sort',
    'unicorn',
    'no-only-tests',
  ],
  rules: {
    'prettier/prettier': 'error',
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
    'import/no-cycle': 'error',
    'import/no-unresolved': 'off',
    'no-only-tests/no-only-tests': 'error',
    'unicorn/filename-case': [
      'error',
      { case: 'kebabCase', ignore: ['\\.spec\\.ts$', '\\.test\\.ts$'] },
    ],
    'unicorn/prevent-abbreviations': [
      'error',
      { allow: ['i', 'j', 'k', 'e', 'db', 'id', 'no'], replacements: { e2e: false } },
    ],
    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/consistent-type-imports': [
      'error',
      { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
    ],
    '@typescript-eslint/array-type': ['error', { default: 'array' }],
    '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
    'no-console': ['error', { allow: ['warn', 'error'] }],
    'no-debugger': 'error',
  },
};
