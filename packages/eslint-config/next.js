/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ['./base.js'],
  plugins: {
    ...require('./base.js').plugins,
    react: require('eslint-plugin-react'),
    'react-hooks': require('eslint-plugin-react-hooks'),
    'jsx-a11y': require('eslint-plugin-jsx-a11y'),
  },
  parserOptions: {
    ecmaFeatures: { jsx: true },
  },
  settings: {
    react: { version: 'detect' },
  },
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react/display-name': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'jsx-a11y/alt-text': 'error',
    'jsx-a11y/anchor-has-content': 'error',
    'jsx-a11y/img-redundant-alt': 'error',
    'jsx-a11y/no-autofocus': 'error',
    'jsx-a11y/no-noninteractive-element-interactions': 'warn',
    '@next/next/no-html-link-for-pages': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_', types: '_' },
    ],
  },
};
