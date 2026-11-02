import js from '@eslint/js'
import prettier from 'eslint-config-prettier'
import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import tseslint from 'typescript-eslint'

// Límites hexagonales: domain no conoce a nadie; application solo a domain.
const frameworks = {
  group: [
    '@nestjs/*',
    'drizzle-orm',
    'drizzle-orm/*',
    'pg',
    'bcryptjs',
    'class-validator',
    'class-transformer',
  ],
  message: 'domain y application no dependen de frameworks ni librerías.',
}
const infrastructure = {
  group: ['**/infrastructure/**'],
  message: 'Solo infrastructure conoce a infrastructure.',
}
const application = {
  group: ['**/application/**'],
  message: 'domain no depende de application.',
}

export default defineConfig([
  globalIgnores(['dist', 'drizzle/migrations']),
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
  {
    files: ['src/application/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        { patterns: [frameworks, infrastructure] },
      ],
    },
  },
  {
    files: ['src/domain/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        { patterns: [frameworks, infrastructure, application] },
      ],
    },
  },
])
