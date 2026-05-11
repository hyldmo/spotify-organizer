import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import pkg from './package.json' with { type: 'json' }

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
		host: true
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
				navigateFallbackDenylist: [/^\/static\/app\.webmanifest$/],
				cleanupOutdatedCaches: true,
				maximumFileSizeToCacheInBytes: 10 * 1024 * 1024
			}
		})
	]
})
