import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import tseslint from 'typescript-eslint'

export default tseslint.config({ ignores: ['dist'] }, ...tseslint.configs.recommended, {
  files: ['**/*.{ts,tsx}'],
  languageOptions: { globals: { ...globals.browser, ...globals.node } },
  plugins: { 'react-hooks': reactHooks },
  rules: {
    ...js.configs.recommended.rules,
    ...reactHooks.configs.recommended.rules,
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      { argsIgnorePattern: '^_', ignoreRestSiblings: true }
    ]
  }
})
