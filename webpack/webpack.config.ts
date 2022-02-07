import HtmlWebpackPlugin from 'html-webpack-plugin'
import path from 'path'
import { DefinePlugin } from 'webpack'
import packageJSON from '../package.json'
import { getFolders } from './utils'
import tsConfig from '../tsconfig.json'
import { Configuration } from './types'

const context = path.resolve(__dirname, '../')

const config: Configuration = {
	entry: './src/index.tsx',
	devtool: 'source-map',
	context,

	output: {
		path: path.join(__dirname, 'dist'),
		publicPath: process.env.npm_lifecycle_event !== 'prod' ? '/' : '/spotify-organiser/',
		filename: '[name]-[hash].js'
	},

	resolve: {
		alias: {
			styles: path.resolve(__dirname, 'src/styles'),
			...getFolders(path.join(context, tsConfig.compilerOptions.baseUrl))
		},
		extensions: packageJSON.jest.moduleFileExtensions.map(ext => `.${ext}`)
	},

	plugins: [
		new HtmlWebpackPlugin({
			title: packageJSON.name
				.split('-')
				.map(name => name.charAt(0).toUpperCase() + name.slice(1))
				.join(' '),
			version: packageJSON.version,
			template: 'static/index.ejs'
		}),
		new DefinePlugin({
			'process.env.PACKAGE_NAME': JSON.stringify(packageJSON.name),
			'process.env.PACKAGE_VERSION': JSON.stringify(packageJSON.version),
			'process.env.PACKAGE_REPOSITORY': JSON.stringify(packageJSON.repository)
		})
	],

	optimization: {
		runtimeChunk: 'single',
		splitChunks: {
			cacheGroups: {
				chunks: 'initial',
				commons: {
					test: /node_modules/,
					name: 'vendor',
					chunks: 'all'
				}
			}
		}
	}
}

export default config
