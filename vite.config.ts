import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import pkg from './package.json' with { type: 'json' }

// Served by the Worker in workers/ (keep public/_routes.json in sync). Everything else is the web app.
const WORKER_PATHS = ['/api', '/mcp', '/authorize', '/callback', '/token', '/register', '/.well-known']

export default defineConfig({
	resolve: {
		alias: {
			'~': path.resolve(__dirname, 'src')
		}
	},

	define: {
		'process.env.PACKAGE_NAME': JSON.stringify(pkg.name),
		'process.env.PACKAGE_VERSION': JSON.stringify(process.env.PACKAGE_VERSION || '‑local'),
		'process.env.PACKAGE_REPOSITORY': JSON.stringify(pkg.repository)
	},

	build: {
		sourcemap: true,
		assetsDir: 'static',
		// The Pages project in workers/ deploys this directory.
		outDir: 'workers/dist',
		emptyOutDir: true,
		rollupOptions: {
			output: {
				manualChunks: id => {
					if (id.includes('node_modules')) return 'vendor'
				}
			}
		}
	},

	server: {
		port: 1337,
		host: true,
		// `yarn workspace spotify-organiser-workers dev` serves the Worker on 8788.
		proxy: Object.fromEntries(WORKER_PATHS.map(path => [path, 'http://127.0.0.1:8788']))
	},

	plugins: [
		react(),
		VitePWA({
			registerType: 'prompt',
			injectRegister: false,
			manifestFilename: 'static/app.webmanifest',
			manifest: {
				name: 'Spotify Organiser',
				short_name: 'Spotify Organiser',
				id: '/?source=pwa',
				description: 'Various tools to help you organise your Spotify playlists better',
				lang: 'en',
				start_url: '/?source=pwa',
				background_color: '#181818',
				theme_color: '#16a34a',
				display: 'standalone',
				scope: '/',
				icons: [
					{ src: '/static/app.svg', type: 'image/svg+xml', sizes: '96x96' },
					{ src: '/static/app.svg', type: 'image/svg+xml', sizes: '512x512', purpose: 'any maskable' }
				]
			},
			workbox: {
				globPatterns: ['**/*.{js,css,html,svg,png,webmanifest}'],
				globIgnores: ['**/static/app.svg', '**/static/app.webmanifest'],
				navigateFallback: '/index.html',
				// The OAuth pages open in the browser, where the app's service worker must not answer them.
				navigateFallbackDenylist: [
					/^\/static\/app\.webmanifest$/,
					new RegExp(`^(${WORKER_PATHS.map(path => path.replace('.', '\\.')).join('|')})([/?]|$)`)
				],
				cleanupOutdatedCaches: true,
				maximumFileSizeToCacheInBytes: 10 * 1024 * 1024
			}
		})
	]
})
