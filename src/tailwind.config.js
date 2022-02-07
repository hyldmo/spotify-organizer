/* eslint-disable @typescript-eslint/no-var-requires */
/** @type {import('tailwindcss/plugin').TailwindPlugin} */
const plugin = require('tailwindcss/plugin')

/* @type {import('tailwindcss/tailwind-config').TailwindConfig} */
module.exports = {
	content: ['./src/**/*.{ts,tsx}'],
	theme: {
		extend: {
			flex: {
				grow: '1 0 auto'
			},
			height: {
				'18': '4.5rem',
				'px-2': '2px'
			},
			minHeight: {
				'0': '0',
				'1/4': '25%',
				'1/2': '50%',
				'3/4': '75%',
				'full': '100%',
				'30': '30rem'
			},
			fontSize: {
				'h2': '34px',
				'10': '10px',
				'14': '14px',
				'15': '15px',
				'16': '16px',
				'18': '18px',
				'30': ['30px', '1'],
				'e2/8': '0.125em',
				'e3/8': '0.25em',
				'e4/8': '0.375em',
				'e5/8': '0.50em',
				'e6/8': '0.75em',
				'e7/8': '0.875em',
				'e': '1em',
				'e2': '1.125em',
				'e3': '1.25em',
				'e4': '1.375em',
				'e5': '1.50em',
				'e6': '1.75em',
				'e7': '1.875em',
				'e8': '2em',
				'product': '2.85rem'
			}
		}
	},
	variants: {},
	plugins: [
		plugin(({ addVariant }) => {
			addVariant('hocus', ['&:hover', '&:focus-visible'])
		})
	]
}
