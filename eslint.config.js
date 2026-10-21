import js from '@eslint/js'
import prettier from 'eslint-config-prettier'
import { importX } from 'eslint-plugin-import-x'
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import tseslint from 'typescript-eslint'

// The bulletproof-react import direction: shared → features → app. Never between features.
const FEATURES = ['access', 'board', 'greeting', 'home', 'item']
const SHARED = [
  './src/components',
  './src/config',
  './src/hooks',
  './src/lib',
  './src/testing',
  './src/types',
  './src/utils',
]

export default defineConfig([
  globalIgnores(['dist', 'src/app/route-tree.gen.ts', '.claude']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      // Must stay last: turns off rules that conflict with Prettier.
      prettier,
    ],
    plugins: { 'import-x': importX },
    settings: {
      'import-x/resolver-next': [createTypeScriptImportResolver({ project: './tsconfig.app.json' })],
    },
    languageOptions: {
      ecmaVersion: 2023,
      globals: globals.browser,
    },
    rules: {
      'import-x/no-restricted-paths': [
        'error',
        {
          zones: [
            ...FEATURES.map((feature) => ({
              target: `./src/features/${feature}`,
              from: './src/features',
              except: [`./${feature}`],
              message: 'Features must not import each other. Compose them in src/app instead.',
            })),
            { target: './src/features', from: './src/app', message: 'Features must not import from src/app.' },
            {
              target: SHARED,
              from: ['./src/features', './src/app'],
              message: 'Shared code must not import features or app.',
            },
          ],
        },
      ],
    },
  },
  {
    // Route files export `Route` alongside components; shadcn files export variants. Both are fine.
    files: ['src/app/routes/**/*.tsx', 'src/components/ui/**/*.tsx'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
  {
    files: ['**/*.test.{ts,tsx}', 'src/testing/**'],
    languageOptions: { globals: { ...globals.browser, ...globals.vitest } },
  },
])
