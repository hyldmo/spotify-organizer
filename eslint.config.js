const js = require('@eslint/js')
const tseslint = require('typescript-eslint')
const reactPlugin = require('eslint-plugin-react')
const reactHooks = require('eslint-plugin-react-hooks')
const stylistic = require('@stylistic/eslint-plugin')
const globals = require('globals')

const enabled = 'error'

module.exports = [
	{
		ignores: ['dist/**', 'node_modules/**', '.yarn/**', 'coverage/**']
	},
	js.configs.recommended,
	...tseslint.configs.recommended,
	{
		files: ['**/*.js', '**/*.cjs'],
		rules: {
			'@typescript-eslint/no-require-imports': 'off'
		}
	},
	{
		files: ['**/*.{ts,tsx,js,jsx}'],
		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'module',
			globals: {
				...globals.browser,
				...globals.node
			},
			parserOptions: {
				ecmaFeatures: { jsx: true }
			}
		},
		plugins: {
			'react': reactPlugin,
			'react-hooks': reactHooks,
			'@stylistic': stylistic
		},
		settings: {
			react: { version: 'detect' }
		},
		rules: {
			...reactPlugin.configs.recommended.rules,
			...reactHooks.configs.recommended.rules,
			'@typescript-eslint/array-type': [enabled, { default: 'array-simple' }],
			'@typescript-eslint/explicit-function-return-type': 'off',
			'@typescript-eslint/explicit-module-boundary-types': 'off',
			'@typescript-eslint/member-ordering': enabled,
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '_' }],
			'@typescript-eslint/no-use-before-define': 'off',
			'@typescript-eslint/no-empty-object-type': 'off',
			'@typescript-eslint/no-unused-expressions': 'off',
			'@typescript-eslint/prefer-for-of': enabled,
			'@typescript-eslint/prefer-function-type': enabled,
			'@typescript-eslint/unified-signatures': enabled,
			'no-redeclare': 'off',
			'@typescript-eslint/no-redeclare': enabled,
			'no-shadow': 'off',
			'@typescript-eslint/no-shadow': [enabled, { hoist: 'all' }],
			'@stylistic/member-delimiter-style': [enabled, { multiline: { delimiter: 'none', requireLast: true } }],
			'@stylistic/quotes': [enabled, 'single', { avoidEscape: true }],
			'@stylistic/semi': [enabled, 'never'],
			'@stylistic/space-before-function-paren': [enabled, 'always'],
			'@stylistic/space-in-parens': enabled,
			'@stylistic/spaced-comment': enabled,
			'@stylistic/linebreak-style': [enabled, 'unix'],
			'@stylistic/max-len': [enabled, { code: 140 }],
			'@stylistic/new-parens': enabled,
			'@stylistic/no-multiple-empty-lines': [enabled, { max: 1 }],
			'@stylistic/no-trailing-spaces': enabled,
			'@stylistic/quote-props': [enabled, 'consistent-as-needed'],
			'arrow-body-style': enabled,
			'camelcase': 'off',
			'constructor-super': enabled,
			'dot-notation': enabled,
			'guard-for-in': enabled,
			'id-denylist': [enabled, 'any', 'number', 'String', 'string', 'Boolean', 'boolean'],
			'id-match': enabled,
			'sort-imports': [enabled, { ignoreCase: true, ignoreDeclarationSort: true, allowSeparatedGroups: true }],
			'max-classes-per-file': [enabled, 1],
			'no-bitwise': enabled,
			'no-caller': enabled,
			'no-cond-assign': enabled,
			'no-console': [enabled, { allow: ['info', 'warn', 'error'] }],
			'no-debugger': enabled,
			'no-duplicate-case': enabled,
			'no-duplicate-imports': enabled,
			'no-empty': enabled,
			'no-eval': enabled,
			'no-extra-bind': enabled,
			'no-fallthrough': 'off',
			'no-invalid-this': 'off',
			'no-new-func': enabled,
			'no-new-wrappers': enabled,
			'no-restricted-imports': [
				enabled,
				{
					paths: [
						'lodash',
						'redux-saga/effects',
						'firebase/database'
					]
				}
			],
			'no-return-await': enabled,
			'no-sequences': enabled,
			'no-sparse-arrays': enabled,
			'no-template-curly-in-string': enabled,
			'no-throw-literal': enabled,
			'no-undef-init': enabled,
			'no-unsafe-finally': enabled,
			'object-shorthand': enabled,
			'one-var': [enabled, 'never'],
			'prefer-arrow-callback': enabled,
			'prefer-object-spread': enabled,
			'prefer-template': enabled,
			'radix': enabled,
			'react/prop-types': 'off',
			'react/react-in-jsx-scope': 'off',
			'use-isnan': enabled,
			'valid-typeof': 'off'
		}
	}
]
