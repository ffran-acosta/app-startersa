import js from '@eslint/js'
import prettier from 'eslint-config-prettier'
import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import tseslint from 'typescript-eslint'

// Límites de capas dentro de cada contexto: domain no conoce a nadie;
// application solo conoce a domain y a @nestjs/cqrs.
const libraries = [
  'typeorm',
  '@nestjs/typeorm',
  '@nestjs/jwt',
  '@nestjs/swagger',
  'pg',
  'bcryptjs',
  'class-validator',
  'class-transformer',
]
const infrastructure = {
  group: ['**/infrastructure/**'],
  message: 'Solo infrastructure conoce a infrastructure.',
}
const application = {
  group: ['**/application/**'],
  message: 'domain no depende de application.',
}

// Los bounded contexts no se importan entre sí; comparten solo `shared/`.
// Va en la variante de typescript-eslint de la regla para no pisar la de
// capas (dos bloques con la misma regla se reemplazan, no se suman).
const otherContext = (name) => ({
  group: [`**/${name}/**`],
  message: 'Un bounded context no importa a otro: comparten solo shared/.',
})

export default defineConfig([
  globalIgnores(['dist']),
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
    files: ['src/**/application/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: libraries,
              message:
                'application no depende del ORM ni de librerías de infraestructura.',
            },
            infrastructure,
          ],
        },
      ],
    },
  },
  {
    files: ['src/**/domain/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@nestjs/*', ...libraries],
              message: 'domain es TypeScript puro.',
            },
            infrastructure,
            application,
          ],
        },
      ],
    },
  },
  {
    files: ['src/identity/**'],
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        { patterns: [otherContext('todos')] },
      ],
    },
  },
  {
    files: ['src/todos/**'],
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        { patterns: [otherContext('identity')] },
      ],
    },
  },
  {
    files: ['src/shared/**'],
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        { patterns: [otherContext('identity'), otherContext('todos')] },
      ],
    },
  },
])
