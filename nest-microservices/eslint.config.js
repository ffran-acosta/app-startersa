import js from '@eslint/js'
import prettier from 'eslint-config-prettier'
import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import tseslint from 'typescript-eslint'

const apps = ['gateway', 'auth', 'todos']

// Cada app es un proceso aparte: entre ellas solo se habla por NATS, con los
// tipos de libs/contracts.
const boundaries = (name) => ({
  files: [`apps/${name}/**`],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: apps
          .filter((other) => other !== name)
          .map((other) => ({
            group: [`**/apps/${other}/**`, `**/${other}/src/**`],
            message: `${name} no importa código de ${other}: se comunican por NATS con los tipos de libs/contracts.`,
          })),
      },
    ],
  },
})

export default defineConfig([
  globalIgnores(['dist', 'apps/*/src/generated']),
  {
    files: ['**/*.ts'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommendedTypeChecked,
      prettier,
    ],
    languageOptions: {
      globals: globals.node,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      'no-console': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { ignoreRestSiblings: true },
      ],
    },
  },
  ...apps.map(boundaries),
  {
    files: ['libs/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/apps/**'],
              message: 'libs/ no depende de ninguna app.',
            },
          ],
        },
      ],
    },
  },
])
