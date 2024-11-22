import globals from 'globals';
import unicornPlugin from 'eslint-plugin-unicorn';
import drizzlePlugin from 'eslint-plugin-drizzle';
import importPlugin from 'eslint-plugin-import';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ['**/*.{js,mjs,cjs,ts}'] },
  { languageOptions: { globals: globals.browser } },
  ...tseslint.configs.recommended,
  pluginJs.configs.recommended,

  {
    plugins: {
      unicorn: unicornPlugin,
      import: importPlugin,
      drizzle: drizzlePlugin,
    },
  },
  {
    ignores: ['node_modules', 'dist', 'build', 'out', 'eslint.config.js', 'drizzle'],
  },
  {
    rules: {
      'import/no-duplicates': 'error',
      'import/no-unresolved': 'off',
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', ['sibling', 'parent', 'index'], 'type', 'unknown'],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
      'import/no-default-export': 'error',
      'no-implicit-coercion': 'error',
      'max-classes-per-file': ['error', { ignoreExpressions: true }],
      'unicorn/better-regex': 'error',
      'unicorn/catch-error-name': 'error',
      'unicorn/consistent-destructuring': 'error',
      'unicorn/consistent-function-scoping': 'warn',
      'unicorn/custom-error-definition': 'off',
      'unicorn/empty-brace-spaces': 'error',
      'unicorn/error-message': 'error',
      'unicorn/escape-case': 'error',
      'unicorn/expiring-todo-comments': 'error',
      'unicorn/explicit-length-check': 'error',
      'unicorn/number-literal-case': 'error',
      'unicorn/numeric-separators-style': 'error',
      'unicorn/filename-case': [
        'error',
        {
          cases: {
            kebabCase: true,
            pascalCase: true,
          },
        },
      ],
      'unicorn/import-style': 'error',
      'unicorn/new-for-builtins': 'error',
      'unicorn/no-abusive-eslint-disable': 'error',
      'unicorn/no-array-callback-reference': 'warn',
      'unicorn/no-array-for-each': 'warn',
      'unicorn/no-array-push-push': 'error',
      'unicorn/no-for-loop': 'error',
      'unicorn/no-hex-escape': 'error',
      'unicorn/no-instanceof-array': 'error',
      'unicorn/no-keyword-prefix': 'off',
      'unicorn/no-lonely-if': 'error',
      'unicorn/prefer-array-find': 'error',
      'unicorn/prefer-array-flat': 'error',
      'unicorn/prefer-array-flat-map': 'error',
      'unicorn/prefer-array-index-of': 'error',
      'unicorn/prefer-array-some': 'error',
      'unicorn/prefer-date-now': 'error',
      'unicorn/prefer-default-parameters': 'error',
      'unicorn/prefer-includes': 'error',
      'unicorn/prefer-math-trunc': 'error',
      'unicorn/prefer-module': 'off',
      'unicorn/prefer-negative-index': 'error',
      'unicorn/prefer-node-protocol': 'off',
      'unicorn/prefer-number-properties': 'error',
      'unicorn/prefer-optional-catch-binding': 'error',
      'unicorn/prefer-reflect-apply': 'error',
      'unicorn/prefer-regexp-test': 'error',
      'unicorn/prefer-set-has': 'error',
      'unicorn/prefer-spread': 'error',
      'unicorn/prefer-string-replace-all': 'off',
      'unicorn/prefer-string-slice': 'error',
      'unicorn/prefer-string-starts-ends-with': 'error',
      'unicorn/prefer-string-trim-start-end': 'error',
      'unicorn/prefer-switch': 'error',
      'unicorn/prefer-ternary': 'error',
      'unicorn/prefer-type-error': 'error',
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/string-content': 'off',
      'unicorn/throw-new-error': 'error',
      'unicorn/no-unnecessary-await': 'error',
      '@typescript-eslint/explicit-member-accessibility': [
        'error',
        {
          accessibility: 'no-public',
          overrides: {
            accessors: 'no-public',
            constructors: 'off',
            methods: 'no-public',
            properties: 'off',
            parameterProperties: 'explicit',
          },
        },
      ],
      'drizzle/enforce-delete-with-where': 'error',
      'drizzle/enforce-update-with-where': 'error',
    },
  },
];
