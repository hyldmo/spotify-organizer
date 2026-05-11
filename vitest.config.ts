import path from 'path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
	plugins: [react()],
	test: {
		globals: true,
		environment: 'jsdom',
		setupFiles: ['./__mocks__/index.ts'],
		css: false
	},
	resolve: {
		alias: [
			{ find: '~', replacement: path.resolve(__dirname, 'src') },
			{ find: 'virtual:pwa-register/react', replacement: path.resolve(__dirname, '__mocks__/pwaRegisterMock.ts') },
			{ find: /^static\/.*$/, replacement: path.resolve(__dirname, '__mocks__/fileMock.ts') },
			{ find: /\.(scss|css|sass|less)$/, replacement: path.resolve(__dirname, '__mocks__/styleMock.ts') },
			{ find: /\.(png|jpg|jpeg|svg|gif|webp|eot|ttf|woff|woff2|webmanifest)$/, replacement: path.resolve(__dirname, '__mocks__/fileMock.ts') }
		]
	},
	define: {
		'process.env.PACKAGE_NAME': JSON.stringify('spotify-organiser'),
		'process.env.PACKAGE_VERSION': JSON.stringify('test'),
		'process.env.PACKAGE_REPOSITORY': JSON.stringify('')
	}
})
