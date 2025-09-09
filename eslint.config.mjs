import { FlatCompat } from '@eslint/eslintrc'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname
})

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    plugins: {
      'simple-import-sort': simpleImportSort
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      // 🔽 core: sort imports & exports
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            // 1) side-effect imports (e.g., "server-only"; CSS)
            ['^\\u0000'],

            // 2) React/Next first (optional), then packages
            ['^react$', '^next(/.*)?$', '^@?\\w'],

            // 3) Internal alias (keep '@/...' together)
            ['^@/'],

            // 4) Parent imports then same-folder relatives
            ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
            ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],

            // 5) Types (optional: keep them last if you like)
            ['^type:.*'],

            // 6) Styles last
            ['^.+\\.s?css$']
          ]
        }
      ],
      'simple-import-sort/exports': 'error'
    }
  }
]

export default eslintConfig
