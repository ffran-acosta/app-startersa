import fsd from '@feature-sliced/steiger-plugin'
import { defineConfig } from 'steiger'

export default defineConfig([
  ...fsd.configs.recommended,
  {
    rules: {
      // En el starter cada feature se usa en una sola página; el objetivo es mostrar la capa.
      'fsd/insignificant-slice': 'off',
    },
  },
])
