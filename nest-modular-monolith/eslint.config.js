import js from '@eslint/js'
import prettier from 'eslint-config-prettier'
import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import tseslint from 'typescript-eslint'

// Módulo → modelo de Prisma del que es dueño. Ninguno toca el de otro.
const models = { users: 'user', auth: 'refreshToken', todos: 'todo' }

const boundaries = (name) => {
  const others = Object.keys(models).filter((other) => other !== name)
  const foreignModels = others.map((other) => models[other]).join('|')
  return {
    files: [`src/modules/${name}/**`],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: others.map((other) => ({
            group: [`**/${other}/**`, `!**/${other}/index.js`],
            message: `Desde otro módulo solo se importa la API pública: ${other}/index.js.`,
          })),
        },
      ],
      'no-restricted-syntax': [
        'error',
        {
          // `prisma.todo` o `this.prisma.todo`
          selector: `MemberExpression[property.name=/^(${foreignModels})$/]:matches([object.name='prisma'], [object.property.name='prisma'])`,
          message:
            'Cada módulo accede solo a sus tablas; lo de otro se pide por su API pública.',
        },
      ],
    },
  }
}

export default defineConfig([
  globalIgnores(['dist', 'src/generated']),
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
  ...Object.keys(models).map(boundaries),
  {
    files: ['src/shared/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/modules/**'],
              message: 'shared/ no depende de ningún módulo.',
            },
          ],
        },
      ],
    },
  },
])
